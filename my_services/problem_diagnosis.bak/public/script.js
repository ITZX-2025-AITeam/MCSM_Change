// 前端JavaScript逻辑

class DiagnosisSystem {
    constructor() {
        this.currentReport = null;
        this.currentCheck = null;
        this.compareMode = false;
        this.leftReport = null;
        this.rightReport = null;
        this.focusMode = false;
        this.reports = [];
        this.checks = [];
        this.diagnosisData = {};
        this.saveTimeout = null;
        this.eventSource = null;
        this.clientId = this.ensureClientId();
        this.sseConnected = false;
        this.pollTimer = null;
        this.currentTab = 'report'; // 'report' 或 'check'
        
        this.init();
    }

    ensureClientId() {
        try {
            const key = 'diagnosisClientId';
            let id = localStorage.getItem(key);
            if (!id) {
                id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
                localStorage.setItem(key, id);
            }
            return id;
        } catch (e) {
            // 兜底
            return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        }
    }

    init() {
        this.bindEvents();
        this.loadReports();
        this.loadChecks();
        this.initEventSource();
    }

    switchTab(tab) {
        if (this.currentTab === tab) return;
        
        this.currentTab = tab;
        
        // 更新按钮状态
        document.getElementById('reportTabBtn').classList.toggle('active', tab === 'report');
        document.getElementById('checkTabBtn').classList.toggle('active', tab === 'check');
        
        // 更新面板显示
        document.getElementById('reportPanel').classList.toggle('active', tab === 'report');
        document.getElementById('checkPanel').classList.toggle('active', tab === 'check');
        
        // 清空当前选中的内容
        this.currentReport = null;
        this.currentCheck = null;
        
        // 清空主内容区域
        document.getElementById('reportContent').innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                <h3>欢迎使用模型报告诊断系统</h3>
                <p>请从左侧列表中选择一个${tab === 'report' ? '报告' : '检查项'}开始工作</p>
            </div>
        `;
        
        // 更新标题
        document.getElementById('reportTitle').textContent = `请选择${tab === 'report' ? '报告' : '检查项'}`;
        
        // 隐藏诊断表单
        document.getElementById('diagnosisContainer').style.display = 'none';
        document.getElementById('showDiagnosisBtnContainer').style.display = 'none';
    }

    bindEvents() {
        // 侧边栏切换按钮
        document.getElementById('reportTabBtn').addEventListener('click', () => {
            this.switchTab('report');
        });
        
        document.getElementById('checkTabBtn').addEventListener('click', () => {
            this.switchTab('check');
        });

        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            if (this.currentTab === 'report') {
                this.loadReports();
            } else {
                this.loadChecks();
            }
        });

        // 对比模式按钮
        const compareBtn = document.getElementById('compareBtn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.toggleCompareMode();
            });
        }

        // 重置按钮
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSelection();
            });
        }

        // 返回单报告模式
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (this.compareMode) {
                    this.toggleCompareMode();
                }
            });
        }

        // 专注按钮（隐藏/恢复侧栏）
        const focusBtn = document.getElementById('focusBtn');
        const focusRestoreBtn = document.getElementById('focusRestoreBtn');
        if (focusBtn) {
            focusBtn.addEventListener('click', () => this.toggleFocusMode(!this.focusMode));
        }
        if (focusRestoreBtn) {
            focusRestoreBtn.addEventListener('click', () => this.toggleFocusMode(false));
        }

        // 显示诊断按钮
        document.getElementById('showDiagnosisBtn').addEventListener('click', () => {
            document.getElementById('diagnosisContainer').style.display = 'block';
            document.getElementById('showDiagnosisBtnContainer').style.display = 'none';
        });

        // 编辑/保存按钮
        document.getElementById('editModelDiagnosisBtn').addEventListener('click', () => {
            this.enterEditMode('modelDiagnosis');
        });
        document.getElementById('saveModelDiagnosisBtn').addEventListener('click', () => {
            this.saveModelDiagnosis();
        });

        document.getElementById('editRepairSuggestionBtn').addEventListener('click', () => {
            this.enterEditMode('repairSuggestion');
        });
        document.getElementById('saveRepairSuggestionBtn').addEventListener('click', () => {
            this.saveRepairSuggestion();
        });

        // 清空按钮
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearDiagnosis();
        });
    }

    initEventSource() {
        // 建立Server-Sent Events连接，用于实时更新
        if (this.eventSource) {
            try { this.eventSource.close(); } catch (e) {}
        }
        this.eventSource = new EventSource('/api/events');
        
        this.eventSource.onopen = () => {
            this.sseConnected = true;
            this.stopPolling();
        };
        
        this.eventSource.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'diagnosis_updated') {
                // 忽略自身发送的事件，避免重复通知
                if (data.senderId && data.senderId === this.clientId) {
                    return;
                }
                await this.handleRemoteUpdate(data);
            } else if (data.type === 'reports_changed') {
                // 报告目录发生变化：刷新左侧列表，但尽量保持当前选中项
                const prevSelected = this.currentReport;
                const prevScrollTop = document.getElementById('reportList')?.scrollTop || 0;
                await this.loadReports();
                // 恢复选中项
                if (prevSelected) {
                    const target = document.querySelector(`[data-filename="${prevSelected}"]`);
                    if (target) {
                        target.classList.add('active');
                    }
                }
                // 恢复滚动位置
                const listEl = document.getElementById('reportList');
                if (listEl) listEl.scrollTop = prevScrollTop;
            } else if (data.type === 'checks_changed') {
                // 检查文件目录发生变化：刷新左侧列表，但尽量保持当前选中项
                const prevSelected = this.currentCheck;
                const prevScrollTop = document.getElementById('checkList')?.scrollTop || 0;
                await this.loadChecks();
                // 恢复选中项
                if (prevSelected) {
                    const target = document.querySelector(`[data-filename="${prevSelected}"]`);
                    if (target) {
                        target.classList.add('active');
                    }
                }
                // 恢复滚动位置
                const listEl = document.getElementById('checkList');
                if (listEl) listEl.scrollTop = prevScrollTop;
            } else if (data.type === 'notification_deleted') {
                // 处理其他客户端删除的通知
                this.handleNotificationDeleted(data.id);
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            this.sseConnected = false;
            // 启动轮询回退
            this.startPolling();
            // 稍后尝试重连
            setTimeout(() => {
                this.initEventSource();
            }, 5000);
        };
    }

    async handleRemoteUpdate(data) {
        const sectionText = data.section === 'modelDiagnosis'
            ? '模型诊断意见'
            : data.section === 'repairSuggestion'
                ? '建议修复方式'
                : '诊断内容';

        // 通知栏提示（可点击后再跳转）
        this.addNotification({
            filename: data.filename,
            section: data.section || 'both',
            message: data.message || `${data.filename} 的 ${sectionText} 内容已提交`,
            id: data.id
        });

        // 不自动跳转/切换报告。若正处于该报告，则静默更新视图
        if (this.currentReport === data.filename) {
            await this.loadDiagnosisData(data.filename);
            this.showSaveStatus('success', '其他客户端已更新诊断内容');
        }
    }

    async loadReports() {
        try {
            this.showLoading('reportList');
            const response = await fetch('/api/reports');
            
            if (!response.ok) {
                throw new Error('Failed to load reports');
            }

            this.reports = await response.json();
            this.renderReportList();
            
            // 更新报告数量
            document.getElementById('reportCount').textContent = `${this.reports.length} 个报告`;
            
        } catch (error) {
            console.error('Error loading reports:', error);
            this.showError('reportList', '加载报告列表失败');
        }
    }

    async loadChecks() {
        try {
            this.showLoading('checkList');
            const response = await fetch('/api/checks');
            
            if (!response.ok) {
                throw new Error('Failed to load checks');
            }

            this.checks = await response.json();
            this.renderCheckList();
            
            // 更新检查项数量
            document.getElementById('checkCount').textContent = `${this.checks.length} 个检查项`;
            
        } catch (error) {
            console.error('Error loading checks:', error);
            this.showError('checkList', '加载检查列表失败');
        }
    }

    renderReportList() {
        const reportList = document.getElementById('reportList');
        
        if (this.reports.length === 0) {
            reportList.innerHTML = '<div class="loading">暂无报告</div>';
            return;
        }

        const reportItems = this.reports.map(report => `
            <button class="report-item" data-filename="${report.filename}">
                <div class="report-item-name">${report.name}</div>
                <div class="report-item-type">${report.type}</div>
            </button>
        `).join('');

        reportList.innerHTML = reportItems;

        // 绑定点击事件
        reportList.querySelectorAll('.report-item').forEach(item => {
            item.addEventListener('click', () => {
                const filename = item.dataset.filename;
                if (this.compareMode) {
                    this.handleCompareSelection(filename);
                } else {
                    this.selectReport(filename);
                }
            });
        });
    }

    renderCheckList() {
        const checkList = document.getElementById('checkList');
        
        if (this.checks.length === 0) {
            checkList.innerHTML = '<div class="loading">暂无检查项</div>';
            return;
        }

        const checkItems = this.checks.map(check => `
            <button class="check-item" data-filename="${check.filename}">
                <div class="check-item-name">${check.name}</div>
                <div class="check-item-type">${check.type}</div>
            </button>
        `).join('');

        checkList.innerHTML = checkItems;

        // 绑定点击事件
        checkList.querySelectorAll('.check-item').forEach(item => {
            item.addEventListener('click', () => {
                const filename = item.dataset.filename;
                if (this.compareMode) {
                    this.handleCompareSelection(filename, 'check');
                } else {
                    this.selectCheck(filename);
                }
            });
        });
    }

    async selectReport(filename) {
        try {
            // 更新选中状态
            document.querySelectorAll('.report-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-filename="${filename}"]`).classList.add('active');

            if (this.compareMode) {
                // 在对比模式下，左侧默认放置首次选择，第二次放右侧
                await this.handleCompareSelection(filename);
                return;
            }

            // 加载报告内容（单报告模式）
            await this.loadReportContent(filename);
            
            // 加载诊断数据
            await this.loadDiagnosisData(filename);
            
            this.currentReport = filename;

            // 判断是否已有两项内容
            const data = this.diagnosisData[filename] || {};
            const hasBoth = (data.modelDiagnosis && data.modelDiagnosis.trim()) && (data.repairSuggestion && data.repairSuggestion.trim());
            const btnTextEl = document.getElementById('showDiagnosisBtnText');
            if (btnTextEl) {
                btnTextEl.textContent = hasBoth ? '查看诊断报告' : '开始诊断';
            }

            // 显示“开始诊断/查看诊断报告”按钮，隐藏表单
            document.getElementById('diagnosisContainer').style.display = 'none';
            document.getElementById('showDiagnosisBtnContainer').style.display = 'block';

            // 若SSE未连接，确保轮询开启
            if (!this.sseConnected) {
                this.startPolling();
            }
        
        } catch (error) {
            console.error('Error selecting report:', error);
            this.showSaveStatus('error', '选择报告失败');
        }
    }

    async selectCheck(filename) {
        try {
            // 更新选中状态
            document.querySelectorAll('.check-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-filename="${filename}"]`).classList.add('active');

            // 加载检查文件内容
            await this.loadCheckContent(filename);
            
            this.currentCheck = filename;
            
            // 隐藏诊断表单
            document.getElementById('diagnosisContainer').style.display = 'none';
            document.getElementById('showDiagnosisBtnContainer').style.display = 'none';
        } catch (error) {
            console.error('Error selecting check:', error);
            this.showSaveStatus('error', '选择检查文件失败');
        }
    }

    toggleCompareMode() {
        this.compareMode = !this.compareMode;
        const contentWrapper = document.querySelector('.report-content-wrapper');
        const compareWrapper = document.getElementById('compareWrapper');
        const reportContent = document.getElementById('reportContent');
        const title = document.getElementById('reportTitle');
        const root = document.querySelector('.report-container');
        const backBtn = document.getElementById('backBtn');

        if (this.compareMode) {
            root.classList.add('compare-mode');
            compareWrapper.classList.remove('hidden');
            reportContent.classList.add('hidden');
            title.textContent = '报告对比模式';
            if (backBtn) backBtn.classList.remove('hidden');

            // 初始化左右面板
            this.leftReport = this.currentReport;
            this.leftReportSource = 'report'; // 当前报告默认为报告类型
            this.rightReport = null;
            this.rightReportSource = null;
            
            // 如果当前有选中的报告，设置左侧面板标题
            if (this.leftReport) {
                const leftPaneHeader = document.querySelector('#leftPane .pane-header');
                leftPaneHeader.textContent = '左侧报告';
            }
            
            this.renderComparePane('left', this.leftReport, this.leftReportSource);
            this.renderComparePane('right', this.rightReport, this.rightReportSource);
        } else {
            root.classList.remove('compare-mode');
            compareWrapper.classList.add('hidden');
            reportContent.classList.remove('hidden');
            if (backBtn) backBtn.classList.add('hidden');
            // 恢复标题
            if (this.currentReport) {
                title.textContent = this.currentReport;
            } else {
                title.textContent = '请选择报告';
            }
        }
    }

    toggleFocusMode(hideSidebar) {
        // hideSidebar: true => 进入专注模式（隐藏侧栏）；false => 退出
        const container = document.querySelector('.container');
        const restoreBtn = document.getElementById('focusRestoreBtn');
        this.focusMode = hideSidebar ? true : false;
        if (this.focusMode) {
            container.classList.add('focus-mode');
            if (restoreBtn) restoreBtn.classList.remove('hidden');
        } else {
            container.classList.remove('focus-mode');
            if (restoreBtn) restoreBtn.classList.add('hidden');
        }
    }

    async renderComparePane(side, filename, source = 'report') {
        const paneContent = document.getElementById(side === 'left' ? 'leftPaneContent' : 'rightPaneContent');
        const paneHeader = document.querySelector(`#${side === 'left' ? 'leftPane' : 'rightPane'} .pane-header`);
        
        if (!filename) {
            // 合并报告列表和检查列表，检查列表默认在报告列表后端
            const allFiles = [
                ...this.reports.map(r => ({ ...r, source: 'report' })),
                ...(this.checks || []).map(c => ({ ...c, source: 'check' }))
            ];
            
            const listHtml = allFiles.map(file => `
                <button class="compare-select-item" data-filename="${file.filename}" data-source="${file.source}">
                    <span class="name">${file.name}</span>
                    <span class="type">${file.type}</span>
                    <span class="source">${file.source === 'check' ? '检查' : '报告'}</span>
                </button>
            `).join('');
            // 重置面板标题为默认状态
            paneHeader.textContent = `${side === 'left' ? '左侧' : '右侧'}报告`;
            
            paneContent.innerHTML = `
                <div class="empty-state">
                    <h3>请选择一个文件</h3>
                    <div class="compare-select-list">${listHtml}</div>
                </div>
            `;

            paneContent.querySelectorAll('.compare-select-item').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const target = btn.dataset.filename;
                    const source = btn.dataset.source;
                    await this.assignCompareSide(side, target, source);
                });
            });
            return;
        }

        // 已选文件，加载内容
        try {
            // 更新面板标题
            const fileType = source === 'check' ? '检查单' : '报告';
            paneHeader.textContent = `${side === 'left' ? '左侧' : '右侧'}${fileType}`;
            
            paneContent.innerHTML = '<div class="loading">加载中...</div>';
            const apiEndpoint = source === 'check' ? `/api/checks/${filename}` : `/api/reports/${filename}`;
            const resp = await fetch(apiEndpoint);
            if (!resp.ok) throw new Error('load file failed');
            const data = await resp.json();
            paneContent.innerHTML = data.content;
        } catch (e) {
            paneContent.innerHTML = '<div class="empty-state">加载失败</div>';
        }
    }

    async assignCompareSide(side, filename, source = 'report') {
        if (side === 'left') {
            this.leftReport = filename;
            this.leftReportSource = source;
        } else {
            this.rightReport = filename;
            this.rightReportSource = source;
        }
        await this.renderComparePane(side, filename, source);
        // 若从空白进入，更新当前报告标题辅助
        const title = document.getElementById('reportTitle');
        title.textContent = '报告对比模式';
    }

    async handleCompareSelection(filename, source = 'report') {
        // 优先填充空位：左 -> 右 -> 覆盖左
        if (!this.leftReport) {
            await this.assignCompareSide('left', filename, source);
        } else if (!this.rightReport) {
            await this.assignCompareSide('right', filename, source);
        } else {
            await this.assignCompareSide('left', filename, source);
        }
    }

    resetSelection() {
        // 清空当前显示（单报告和对比模式都要兼容）
        this.currentReport = null;
        this.leftReport = null;
        this.rightReport = null;

        // 清空单报告视图
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                <h3>欢迎使用模型报告诊断系统</h3>
                <p>请从左侧列表中选择一个报告开始诊断工作</p>
            </div>
        `;
        document.getElementById('reportTitle').textContent = '请选择报告';

        // 清空对比视图
        const left = document.getElementById('leftPaneContent');
        const right = document.getElementById('rightPaneContent');
        if (left) left.innerHTML = '';
        if (right) right.innerHTML = '';

        // 退出编辑态、隐藏表单
        document.getElementById('diagnosisContainer').style.display = 'none';
        document.getElementById('showDiagnosisBtnContainer').style.display = 'none';

        // 清空左侧选中态
        document.querySelectorAll('.report-item').forEach(item => item.classList.remove('active'));

        // 对比模式下显示可选列表
        if (this.compareMode) {
            this.renderComparePane('left', null, null);
            this.renderComparePane('right', null, null);
        }
    }

    async loadReportContent(filename) {
        try {
            this.showLoading('reportContent');
            const response = await fetch(`/api/reports/${filename}`);
            
            if (!response.ok) {
                throw new Error('Failed to load report content');
            }

            const data = await response.json();
            
            // 更新标题
            document.getElementById('reportTitle').textContent = data.filename;
            
            // 更新内容
            const reportContent = document.getElementById('reportContent');
            reportContent.innerHTML = data.content;
            reportContent.className = 'report-content markdown-body';
            
        } catch (error) {
            console.error('Error loading report content:', error);
            this.showError('reportContent', '加载报告内容失败');
        }
    }

    async loadCheckContent(filename) {
        try {
            this.showLoading('reportContent');
            const response = await fetch(`/api/checks/${filename}`);
            
            if (!response.ok) {
                throw new Error('Failed to load check content');
            }

            const data = await response.json();
            
            // 更新标题
            document.getElementById('reportTitle').textContent = data.filename;
            
            // 更新内容
            const reportContent = document.getElementById('reportContent');
            reportContent.innerHTML = data.content;
            reportContent.className = 'report-content markdown-body';
            
        } catch (error) {
            console.error('Error loading check content:', error);
            this.showError('reportContent', '加载检查文件内容失败');
        }
    }

    async loadDiagnosisData(filename) {
        try {
            const response = await fetch(`/api/diagnosis/${filename}`);
            
            if (!response.ok) {
                throw new Error('Failed to load diagnosis data');
            }

            const data = await response.json();
            
            // 填充表单和视图
            const modelText = data.modelDiagnosis || '';
            const repairText = data.repairSuggestion || '';

            document.getElementById('modelDiagnosis').value = modelText;
            document.getElementById('repairSuggestion').value = repairText;

            this.setViewContent('modelDiagnosisView', modelText);
            this.setViewContent('repairSuggestionView', repairText);

            // 确保显示为视图模式
            this.exitEditMode('modelDiagnosis');
            this.exitEditMode('repairSuggestion');
            
            // 缓存数据
            this.diagnosisData[filename] = data;

            // 同步按钮文案（若当前文件就是此文件）
            if (this.currentReport === filename) {
                const hasBoth = (modelText && modelText.trim()) && (repairText && repairText.trim());
                const btnTextEl = document.getElementById('showDiagnosisBtnText');
                if (btnTextEl) {
                    btnTextEl.textContent = hasBoth ? '查看诊断报告' : '开始诊断';
                }
            }
            
        } catch (error) {
            console.error('Error loading diagnosis data:', error);
            // 如果加载失败，清空
            document.getElementById('modelDiagnosis').value = '';
            document.getElementById('repairSuggestion').value = '';
            this.setViewContent('modelDiagnosisView', '');
            this.setViewContent('repairSuggestionView', '');
            this.diagnosisData[filename] = { modelDiagnosis: '', repairSuggestion: '' };

            if (this.currentReport === filename) {
                const btnTextEl = document.getElementById('showDiagnosisBtnText');
                if (btnTextEl) btnTextEl.textContent = '开始诊断';
            }
        }
    }

    setViewContent(viewElementId, text) {
        const view = document.getElementById(viewElementId);
        const content = text && text.trim().length > 0 ? text : '暂无内容';
        view.textContent = content;
        if (content === '暂无内容') {
            view.classList.add('placeholder');
        } else {
            view.classList.remove('placeholder');
        }
    }

    enterEditMode(field) {
        const textarea = document.getElementById(field);
        const view = document.getElementById(`${field}View`);
        const editBtn = document.getElementById(`edit${this.capitalize(field)}Btn`);
        const saveBtn = document.getElementById(`save${this.capitalize(field)}Btn`);

        view.classList.add('hidden');
        textarea.classList.remove('hidden');
        textarea.focus();

        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
    }

    exitEditMode(field) {
        const textarea = document.getElementById(field);
        const view = document.getElementById(`${field}View`);
        const editBtn = document.getElementById(`edit${this.capitalize(field)}Btn`);
        const saveBtn = document.getElementById(`save${this.capitalize(field)}Btn`);

        view.classList.remove('hidden');
        textarea.classList.add('hidden');

        saveBtn.classList.add('hidden');
        editBtn.classList.remove('hidden');
    }

    capitalize(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showInlineSuccess(buttonEl) {
        // 在按钮右侧显示圆弧转圈 -> 圆点 的成功动画
        const inline = document.createElement('span');
        inline.className = 'inline-status';
        inline.innerHTML = `
            <span class="success-indicator">
                <span class="arc"></span>
                <span class="dot"></span>
            </span>
        `;
        buttonEl.insertAdjacentElement('afterend', inline);
        setTimeout(() => inline.remove(), 1000);
    }

    async saveModelDiagnosis() {
        if (!this.currentReport) {
            this.showSaveStatus('error', '请先选择报告');
            return;
        }

        try {
            const button = document.getElementById('saveModelDiagnosisBtn');
            button.classList.add('btn-saving');
            this.showSaveStatus('saving', '保存中...');

            const modelDiagnosis = document.getElementById('modelDiagnosis').value;
            const repairSuggestion = document.getElementById('repairSuggestion').value;
            
            await this.saveDiagnosisData({
                modelDiagnosis: modelDiagnosis,
                repairSuggestion: repairSuggestion
            });

            // 更新视图并退出编辑
            this.setViewContent('modelDiagnosisView', modelDiagnosis);
            this.exitEditMode('modelDiagnosis');

            // 成功动画
            this.showInlineSuccess(button);

            // 通知栏与他端
            this.addNotification({
                filename: this.currentReport,
                section: 'modelDiagnosis',
                message: `${this.currentReport} 的 模型诊断意见 内容已提交`
            });
            this.notifyOtherClients('modelDiagnosis');
        } catch (error) {
            console.error('Error saving model diagnosis:', error);
            this.showSaveStatus('error', '保存失败');
        } finally {
            document.getElementById('saveModelDiagnosisBtn').classList.remove('btn-saving');
        }
    }

    async saveRepairSuggestion() {
        if (!this.currentReport) {
            this.showSaveStatus('error', '请先选择报告');
            return;
        }

        try {
            const button = document.getElementById('saveRepairSuggestionBtn');
            button.classList.add('btn-saving');
            this.showSaveStatus('saving', '保存中...');

            const modelDiagnosis = document.getElementById('modelDiagnosis').value;
            const repairSuggestion = document.getElementById('repairSuggestion').value;
            
            await this.saveDiagnosisData({
                modelDiagnosis: modelDiagnosis,
                repairSuggestion: repairSuggestion
            });

            // 更新视图并退出编辑
            this.setViewContent('repairSuggestionView', repairSuggestion);
            this.exitEditMode('repairSuggestion');

            // 成功动画
            this.showInlineSuccess(button);

            // 通知栏与他端
            this.addNotification({
                filename: this.currentReport,
                section: 'repairSuggestion',
                message: `${this.currentReport} 的 建议修复方式 内容已提交`
            });
            this.notifyOtherClients('repairSuggestion');
        } catch (error) {
            console.error('Error saving repair suggestion:', error);
            this.showSaveStatus('error', '保存失败');
        } finally {
            document.getElementById('saveRepairSuggestionBtn').classList.remove('btn-saving');
        }
    }

    async saveDiagnosisData(diagnosisData) {
        this.showSaveStatus('saving', '保存中...');
        
        const response = await fetch(`/api/diagnosis/${this.currentReport}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': this.clientId
            },
            body: JSON.stringify(diagnosisData)
        });

        if (!response.ok) {
            throw new Error('Failed to save diagnosis');
        }

        const result = await response.json();
        
        // 更新缓存
        this.diagnosisData[this.currentReport] = diagnosisData;
        
        this.showSaveStatus('success', '保存成功');
        // 注意：由服务器广播SSE，其它客户端会收到；本地也自己添加通知条目
    }

    detectChangedSection(d, forText = false) {
        // 简单判断：若两者都有值，以最后一次调用的按钮为准在各自保存方法中传递；
        // 这里回退为同时存在时显示“模型诊断意见与建议修复方式”
        const hasModel = typeof d.modelDiagnosis === 'string';
        const hasRepair = typeof d.repairSuggestion === 'string';
        if (hasModel && !hasRepair) return 'modelDiagnosis';
        if (!hasModel && hasRepair) return 'repairSuggestion';
        if (forText) return '模型诊断意见与建议修复方式';
        return 'both';
    }

    addNotification({ filename, section, message, id }) {
        const list = document.getElementById('notificationList');
        if (!list) return;
        // 清空空提示
        const empty = list.querySelector('.notification-empty');
        if (empty) empty.remove();

        const item = document.createElement('div');
        item.className = 'notification-item new';
        
        // 如果没有id，生成一个临时id（用于本地通知）
        const notificationId = id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        item.setAttribute('data-notification-id', notificationId);
        
        // 创建通知内容
        const content = document.createElement('span');
        content.className = 'notification-content';
        content.textContent = message;
        content.title = '点击跳转到对应位置';
        
        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'notification-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = '删除通知';
        
        // 添加删除按钮点击事件
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡，避免触发跳转
            this.deleteNotification(notificationId, item);
        });
        
        // 添加跳转点击事件
        content.addEventListener('click', () => {
            // 跳转：选中报告并滚动到对应区域
            this.navigateTo(filename, section);
        });
        
        // 组装通知项
        item.appendChild(content);
        item.appendChild(deleteBtn);

        list.prepend(item);

        // 计数更新
        const countEl = document.getElementById('notificationCount');
        if (countEl) {
            const current = parseInt(countEl.textContent || '0', 10) || 0;
            countEl.textContent = String(current + 1);
        }

        // 限制最大数量（比如50条）
        const items = list.querySelectorAll('.notification-item');
        if (items.length > 50) {
            list.removeChild(items[items.length - 1]);
        }

        // 一段时间后移除new动画类
        setTimeout(() => item.classList.remove('new'), 900);
    }

    async deleteNotification(id, itemElement) {
        // 如果是临时id（本地通知），直接删除DOM元素
        if (id && id.startsWith('temp_')) {
            if (itemElement && itemElement.parentNode) {
                itemElement.parentNode.removeChild(itemElement);
            }
            
            // 更新计数
            const countEl = document.getElementById('notificationCount');
            if (countEl) {
                const current = parseInt(countEl.textContent || '0', 10) || 0;
                countEl.textContent = String(Math.max(0, current - 1));
            }
            
            // 如果没有通知了，显示空状态
            const list = document.getElementById('notificationList');
            const items = list.querySelectorAll('.notification-item');
            if (items.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'notification-empty';
                empty.textContent = '暂无通知';
                list.appendChild(empty);
            }
            return;
        }
        
        // 服务器端通知，调用API删除
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // 删除成功，移除DOM元素
                if (itemElement && itemElement.parentNode) {
                    itemElement.parentNode.removeChild(itemElement);
                }
                
                // 更新计数
                const countEl = document.getElementById('notificationCount');
                if (countEl) {
                    const current = parseInt(countEl.textContent || '0', 10) || 0;
                    countEl.textContent = String(Math.max(0, current - 1));
                }
                
                // 如果没有通知了，显示空状态
                const list = document.getElementById('notificationList');
                const items = list.querySelectorAll('.notification-item');
                if (items.length === 0) {
                    const empty = document.createElement('div');
                    empty.className = 'notification-empty';
                    empty.textContent = '暂无通知';
                    list.appendChild(empty);
                }
            } else {
                console.error('Failed to delete notification:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    handleNotificationDeleted(id) {
        // 处理其他客户端删除的通知
        const item = document.querySelector(`[data-notification-id="${id}"]`);
        if (item) {
            // 移除DOM元素
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
            
            // 更新计数
            const countEl = document.getElementById('notificationCount');
            if (countEl) {
                const current = parseInt(countEl.textContent || '0', 10) || 0;
                countEl.textContent = String(Math.max(0, current - 1));
            }
            
            // 如果没有通知了，显示空状态
            const list = document.getElementById('notificationList');
            const items = list.querySelectorAll('.notification-item');
            if (items.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'notification-empty';
                    empty.textContent = '暂无通知';
                    list.appendChild(empty);
            }
        }
    }

    async navigateTo(filename, section) {
        // 若不是当前报告，先切换
        if (this.currentReport !== filename) {
            await this.selectReport(filename);
            // 自动展开诊断表单以便查看
            document.getElementById('diagnosisContainer').style.display = 'block';
            document.getElementById('showDiagnosisBtnContainer').style.display = 'none';
        }

        // 根据section找到目标分组与标题label
        let groupId = null;
        if (section === 'modelDiagnosis') groupId = 'groupModelDiagnosis';
        else if (section === 'repairSuggestion') groupId = 'groupRepairSuggestion';
        else groupId = 'diagnosisContainer';

        const groupEl = document.getElementById(groupId);
        if (groupEl) {
            groupEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const label = groupEl.querySelector('.form-group-header label');
            if (label) {
                label.classList.add('label-flash');
                setTimeout(() => label.classList.remove('label-flash'), 1200);
            }
        }
    }

    notifyOtherClients(section) {
        // 已改为由服务器端在保存时广播，这里保留但不再调用
    }

    clearDiagnosis() {
        if (confirm('确定要清空当前诊断内容吗？')) {
            document.getElementById('modelDiagnosis').value = '';
            document.getElementById('repairSuggestion').value = '';
            this.setViewContent('modelDiagnosisView', '');
            this.setViewContent('repairSuggestionView', '');
            
            // 自动保存清空后的内容
            if (this.currentReport) {
                this.saveDiagnosisData({
                    modelDiagnosis: '',
                    repairSuggestion: ''
                });
                // 通知栏与他端
                this.addNotification({
                    filename: this.currentReport,
                    section: 'both',
                    message: `${this.currentReport} 的 诊断内容已清空`
                });
                this.notifyOtherClients('both');
            }
        }
    }

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading">加载中...</div>';
        }
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <h3>出错了</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    showSaveStatus(type, message) {
        const saveStatus = document.getElementById('saveStatus');
        saveStatus.className = `save-status ${type}`;
        saveStatus.textContent = message;
        
        // 3秒后清除状态
        if (type !== 'saving') {
            setTimeout(() => {
                saveStatus.textContent = '';
                saveStatus.className = 'save-status';
            }, 1500);
        }
    }

    startPolling() {
        if (this.pollTimer) return;
        this.pollTimer = setInterval(async () => {
            try {
                if (!this.currentReport) return;
                const resp = await fetch(`/api/diagnosis/${this.currentReport}`);
                if (!resp.ok) return;
                const data = await resp.json();
                const prev = this.diagnosisData[this.currentReport] || {};
                const changed = (prev.modelDiagnosis !== data.modelDiagnosis) || (prev.repairSuggestion !== data.repairSuggestion);
                if (changed) {
                    this.diagnosisData[this.currentReport] = data;
                    this.setViewContent('modelDiagnosisView', data.modelDiagnosis || '');
                    this.setViewContent('repairSuggestionView', data.repairSuggestion || '');
                    // 不自动展开或滚动，仅提示
                    this.showSaveStatus('success', '内容已自动同步');
                    // 可选：通知栏提示
                    this.addNotification({
                        filename: this.currentReport,
                        section: 'both',
                        message: `${this.currentReport} 的 诊断内容 已自动同步`
                    });
                }
            } catch (e) {
                // ignore
            }
        }, 3000);
    }

    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }
}

// 工具函数
function formatDate(date) {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    const app = new DiagnosisSystem();
    // 加载历史通知
    try {
        const resp = await fetch('/api/notifications');
        if (resp.ok) {
            const list = await resp.json();
            if (Array.isArray(list)) {
                list.slice().reverse().forEach(n => {
                    app.addNotification({ filename: n.filename, section: n.section, message: n.message, id: n.id });
                });
            }
        }
    } catch (e) {
        // ignore
    }
});

// 错误处理
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

