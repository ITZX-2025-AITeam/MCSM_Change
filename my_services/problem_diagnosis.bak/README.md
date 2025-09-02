# 模型报告诊断系统

一个类似于模型报告诊断的Web系统，提供报告查看和诊断意见录入功能。

## 功能特性

- 📄 **报告查看**: 支持Markdown和HTML格式的报告文件
- 📝 **诊断录入**: 可填写模型诊断意见和建议修复方式
- 💾 **数据持久化**: 页面关闭后数据保留，程序重启后清空
- 🎨 **GitHub风格**: 采用GitHub风格的UI设计
- 📱 **响应式设计**: 支持移动端和桌面端访问

## 目录结构

```
problem_diagnosis/
├── server.js              # 后端服务器
├── package.json           # 项目配置文件
├── start.sh              # 启动脚本
├── README.md             # 说明文档
└── public/               # 前端静态文件
    ├── index.html        # 主页面
    ├── styles.css        # 样式文件
    └── script.js         # 前端逻辑
```

## 安装和运行

### 前提条件

- Node.js (v14 或更高版本)
- npm

### 安装步骤

1. 进入项目目录：
   ```bash
   cd /root/server/MCSManager/my_services/problem_diagnosis
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 确保报告目录存在：
   ```bash
   ls /root/server/MCSManager/report
   ```

### 启动系统

#### 方法一：使用启动脚本
```bash
./start.sh
```

#### 方法二：直接启动
```bash
npm start
```

#### 方法三：开发模式
```bash
npm run dev
```

### 访问系统

启动成功后，在浏览器中访问：
```
http://localhost:3000
```

## 使用说明

1. **选择报告**: 在左侧列表中点击要查看的报告
2. **查看内容**: 报告内容会在右侧主要区域显示
3. **填写诊断**: 在报告下方填写"模型诊断意见"和"建议修复方式"
4. **自动保存**: 输入内容会自动保存，无需手动保存
5. **手动保存**: 也可以点击"保存诊断"按钮手动保存
6. **清空内容**: 点击"清空"按钮可清空当前报告的诊断内容

## 报告格式

系统支持以下格式的报告文件：

- **Markdown文件** (`.md`): 支持标准Markdown语法
- **HTML文件** (`.html`): 支持标准HTML格式

报告文件应放置在 `/root/server/MCSManager/report` 目录下。

## API接口

### 获取报告列表
```
GET /api/reports
```

### 获取报告内容
```
GET /api/reports/:filename
```

### 获取诊断数据
```
GET /api/diagnosis/:filename
```

### 保存诊断数据
```
POST /api/diagnosis/:filename
Body: {
  "modelDiagnosis": "诊断意见",
  "repairSuggestion": "修复建议"
}
```

## 技术栈

- **后端**: Node.js + Express.js
- **前端**: 原生HTML/CSS/JavaScript
- **样式**: GitHub风格CSS
- **Markdown渲染**: marked.js

## 数据存储

- 诊断数据存储在服务器内存中
- 页面刷新或关闭后数据保留
- 服务器重启后数据清空
- 不依赖外部数据库

## 开发说明

### 项目结构说明

- `server.js`: Express服务器，处理API请求和静态文件服务
- `public/index.html`: 主页面结构
- `public/styles.css`: GitHub风格的CSS样式
- `public/script.js`: 前端交互逻辑

### 自定义配置

可以通过修改以下变量来自定义配置：

```javascript
// server.js 中的配置
const PORT = process.env.PORT || 3000;
const REPORT_DIR = '/root/server/MCSManager/report';
```

## 故障排除

### 常见问题

1. **端口被占用**
   - 修改 `server.js` 中的 `PORT` 变量
   - 或设置环境变量：`PORT=3001 npm start`

2. **报告目录不存在**
   - 确保 `/root/server/MCSManager/report` 目录存在
   - 在该目录下放置 `.md` 或 `.html` 文件

3. **依赖安装失败**
   - 检查网络连接
   - 尝试使用淘宝镜像：`npm install --registry=https://registry.npm.taobao.org`

4. **页面无法访问**
   - 检查服务器是否正常启动
   - 确认防火墙设置
   - 检查端口是否被占用

## 许可证

MIT License
