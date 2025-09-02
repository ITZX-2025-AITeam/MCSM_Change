const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

// 报告目录路径固定为项目根目录下的report
const REPORT_DIR = path.join(__dirname, '..', '..', 'report');

// 检查文件目录路径固定为项目根目录下的check_files
const CHECK_DIR = path.join(__dirname, 'check_files');

// 启动时自动创建报告目录（如不存在）
if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// 启动时自动创建检查文件目录（如不存在）
if (!fs.existsSync(CHECK_DIR)) {
    fs.mkdirSync(CHECK_DIR, { recursive: true });
}

// 内存存储诊断数据（程序重启时清空）
let diagnosisData = {};

// 存储连接的客户端
let connectedClients = [];

// 通知持久化（进程内存，重启清空）
let notifications = [];
let notificationSeq = 1;
const MAX_NOTIFICATIONS = 200;

function sectionToText(section) {
    if (section === 'modelDiagnosis') return '模型诊断意见';
    if (section === 'repairSuggestion') return '建议修复方式';
    return '诊断内容';
}

function pushNotification({ filename, section = 'both', senderId = '' }) {
    const id = notificationSeq++;
    const message = `${filename} 的 ${sectionToText(section)} 内容已提交`;
    const record = { id, filename, section, message, senderId, timestamp: Date.now() };
    notifications.unshift(record);
    if (notifications.length > MAX_NOTIFICATIONS) notifications = notifications.slice(0, MAX_NOTIFICATIONS);
    return record;
}

// 广播任意事件到所有已连接的SSE客户端
function broadcastEvent(eventObject) {
    try {
        const payload = `data: ${JSON.stringify(eventObject)}\n\n`;
        connectedClients.forEach(client => {
            try {
                client.res.write(payload);
            } catch (e) {
                // 忽略单个客户端写入错误
            }
        });
    } catch (e) {
        // 忽略序列化或其他异常
    }
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 新增代码：让 /reports 和 /checks URL路径直接映射到对应的文件夹 ---
app.use('/reports', express.static(REPORT_DIR));
app.use('/checks', express.static(CHECK_DIR));
// --- 新增代码结束 ---


// Server-Sent Events 端点
app.get('/api/events', (req, res) => {
    // 重要：禁用反向代理/中间层缓冲，确保实时推送
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 立即刷新头
    res.flushHeaders && res.flushHeaders();

    // 发送初始连接消息
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to server' })}\n\n`);

    // 将客户端添加到连接列表
    const clientId = Date.now();
    const client = { id: clientId, res };
    connectedClients.push(client);

    // 心跳，防止中间层断开连接
    const heartbeat = setInterval(() => {
        try {
            res.write(`: ping\n\n`); // 注释行作为心跳
        } catch (e) {
            clearInterval(heartbeat);
        }
    }, 25000); // 25s 一次

    // 客户端断开连接时清理
    req.on('close', () => {
        clearInterval(heartbeat);
        connectedClients = connectedClients.filter(c => c.id !== clientId);
        console.log(`Client ${clientId} disconnected. Total clients: ${connectedClients.length}`);
    });

    console.log(`Client ${clientId} connected. Total clients: ${connectedClients.length}`);
});

// 通知列表（用于页面刷新后加载历史）
app.get('/api/notifications', (req, res) => {
    res.json(notifications);
});

// 删除通知
app.delete('/api/notifications/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const initialLength = notifications.length;
        notifications = notifications.filter(n => n.id !== id);
        
        if (notifications.length < initialLength) {
            // 通知其他客户端删除此通知
            const eventData = JSON.stringify({
                type: 'notification_deleted',
                id: id
            });
            connectedClients.forEach(client => {
                client.res.write(`data: ${eventData}\n\n`);
            });
            
            res.json({ success: true, message: 'Notification deleted' });
        } else {
            res.status(404).json({ error: 'Notification not found' });
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// 通知其他客户端（也写入记录）
app.post('/api/notify', (req, res) => {
    try {
        const { type, filename, section, senderId } = req.body;
        const record = pushNotification({ filename, section, senderId });
        const eventData = JSON.stringify({ type, filename, section, senderId, id: record.id, message: record.message });
        connectedClients.forEach(client => {
            client.res.write(`data: ${eventData}\n\n`);
        });

        res.json({ success: true, message: 'Notification sent to all clients' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// 获取所有报告文件列表
app.get('/api/reports', (req, res) => {
    try {
        const files = fs.readdirSync(REPORT_DIR);
        const reports = files
            .filter(file => file.endsWith('.md') || file.endsWith('.html'))
            .map(file => ({
                filename: file,
                name: path.parse(file).name,
                type: path.extname(file).substring(1)
            }));
        res.json(reports);
    } catch (error) {
        console.error('Error reading reports directory:', error);
        res.status(500).json({ error: 'Failed to read reports directory' });
    }
});

// 获取所有检查文件列表
app.get('/api/checks', (req, res) => {
    try {
        const files = fs.readdirSync(CHECK_DIR);
        const checks = files
            .filter(file => file.endsWith('.md') || file.endsWith('.html'))
            .map(file => ({
                filename: file,
                name: path.parse(file).name,
                type: path.extname(file).substring(1)
            }));
        res.json(checks);
    } catch (error) {
        console.error('Error reading checks directory:', error);
        res.status(500).json({ error: 'Failed to read checks directory' });
    }
});

// 监视报告目录变化并通知前端更新
try {
    if (fs.existsSync(REPORT_DIR)) {
        // 使用fs.watch对目录变更进行监听
        const watcher = fs.watch(REPORT_DIR, { persistent: true }, (eventType, filename) => {
            if (!filename) return;
            // 仅对新建/删除/重命名触发，且是支持的后缀
            const ext = path.extname(filename).toLowerCase();
            if (ext !== '.md' && ext !== '.html') return;
            // 广播列表变更事件
            broadcastEvent({ type: 'reports_changed', filename, eventType, timestamp: Date.now() });
        });
        // 在进程退出时关闭watcher（尽力而为）
        process.on('exit', () => watcher.close());
        process.on('SIGINT', () => { try { watcher.close(); } catch (e) {} process.exit(0); });
    } else {
        console.warn(`[report-watch] REPORT_DIR not found: ${REPORT_DIR}`);
    }
} catch (e) {
    console.warn('[report-watch] failed to setup fs.watch:', e && e.message);
}

// 监视检查文件目录变化并通知前端更新
try {
    if (fs.existsSync(CHECK_DIR)) {
        // 使用fs.watch对目录变更进行监听
        const watcher = fs.watch(CHECK_DIR, { persistent: true }, (eventType, filename) => {
            if (!filename) return;
            // 仅对新建/删除/重命名触发，且是支持的后缀
            const ext = path.extname(filename).toLowerCase();
            if (ext !== '.md' && ext !== '.html') return;
            // 广播列表变更事件
            broadcastEvent({ type: 'checks_changed', filename, eventType, timestamp: Date.now() });
        });
        // 在进程退出时关闭watcher（尽力而为）
        process.on('exit', () => watcher.close());
        process.on('SIGINT', () => { try { watcher.close(); } catch (e) {} process.exit(0); });
    } else {
        console.warn(`[check-watch] CHECK_DIR not found: ${CHECK_DIR}`);
    }
} catch (e) {
    console.warn('[check-watch] failed to setup fs.watch:', e && e.message);
}

// 注意：/api/reports/:filename 和 /api/checks/:filename 这两个端点现在主要用于处理 .md 文件转换
// 对于 .html 文件，前端将直接通过静态服务加载，不再调用这两个API

// 获取特定报告内容（主要用于 Markdown 转换）
app.get('/api/reports/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(REPORT_DIR, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const fileType = path.extname(filename).substring(1);
        
        let htmlContent;
        if (fileType === 'md') {
            htmlContent = marked(content);
        } else if (fileType === 'html') {
            // 理论上前端不再为此调用API，但作为兼容保留
            htmlContent = content;
        } else {
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        res.json({
            filename,
            content: htmlContent,
            type: fileType
        });
    } catch (error) {
        console.error('Error reading report:', error);
        res.status(500).json({ error: 'Failed to read report' });
    }
});

// 获取特定检查文件内容（主要用于 Markdown 转换）
app.get('/api/checks/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(CHECK_DIR, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Check file not found' });
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const fileType = path.extname(filename).substring(1);
        
        let htmlContent;
        if (fileType === 'md') {
            htmlContent = marked(content);
        } else if (fileType === 'html') {
            htmlContent = content;
        } else {
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        res.json({
            filename,
            content: htmlContent,
            type: fileType
        });
    } catch (error) {
        console.error('Error reading check file:', error);
        res.status(500).json({ error: 'Failed to read check file' });
    }
});

// 获取报告的诊断数据
app.get('/api/diagnosis/:filename', (req, res) => {
    const filename = req.params.filename;
    const diagnosis = diagnosisData[filename] || {
        modelDiagnosis: '',
        repairSuggestion: ''
    };
    res.json(diagnosis);
});

// 保存报告的诊断数据
app.post('/api/diagnosis/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const { modelDiagnosis, repairSuggestion } = req.body;
        const senderId = req.header('x-client-id') || '';

        const prev = diagnosisData[filename] || { modelDiagnosis: '', repairSuggestion: '' };

        diagnosisData[filename] = {
            modelDiagnosis: modelDiagnosis || '',
            repairSuggestion: repairSuggestion || ''
        };

        // 推断变更的部分
        let section = 'both';
        const changedModel = (prev.modelDiagnosis || '') !== (modelDiagnosis || '');
        const changedRepair = (prev.repairSuggestion || '') !== (repairSuggestion || '');
        if (changedModel && !changedRepair) section = 'modelDiagnosis';
        else if (!changedModel && changedRepair) section = 'repairSuggestion';

        // 写入通知记录
        const record = pushNotification({ filename, section, senderId });

        // 服务器端直接广播事件
        const eventData = JSON.stringify({ type: 'diagnosis_updated', filename, section, senderId, id: record.id, message: record.message });
        connectedClients.forEach(client => {
            client.res.write(`data: ${eventData}\n\n`);
        });
        
        res.json({ success: true, message: 'Diagnosis saved successfully' });
    } catch (error) {
        console.error('Error saving diagnosis:', error);
        res.status(500).json({ error: 'Failed to save diagnosis' });
    }
});

// 主页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`诊断系统服务器运行在:`);
    console.log(`  - 网络访问: http://<你的局域网IP>:${PORT}`);
    console.log(`  - 本地访问: http://localhost:${PORT}`);
});

module.exports = app;