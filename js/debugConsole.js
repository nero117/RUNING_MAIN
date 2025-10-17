/**
 * 调试控制台 - 提供运行时调试功能
 */
class DebugConsole {
    constructor() {
        this.isVisible = false;
        this.commands = new Map();
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        // 注册默认命令
        this.registerDefaultCommands();
        
        // 创建UI元素
        this.createUI();
        
        // 绑定事件
        this.bindEvents();
    }
    
    /**
     * 注册默认命令
     */
    registerDefaultCommands() {
        // 帮助命令
        this.registerCommand('help', () => {
            const commands = Array.from(this.commands.keys()).sort();
            return `可用命令: ${commands.join(', ')}`;
        }, '显示所有可用命令');
        
        // 性能命令
        this.registerCommand('perf', () => {
            if (window.gameEngine && window.gameEngine.performanceMonitor) {
                const report = window.gameEngine.performanceMonitor.getPerformanceReport();
                return JSON.stringify(report, null, 2);
            }
            return '性能监控器不可用';
        }, '显示性能报告');
        
        // 对象池命令
        this.registerCommand('pools', () => {
            if (window.objectPoolManager) {
                const stats = objectPoolManager.getAllStats();
                return JSON.stringify(stats, null, 2);
            }
            return '对象池管理器不可用';
        }, '显示对象池状态');
        
        // 场景命令
        this.registerCommand('scene', (sceneName) => {
            if (!sceneName) {
                if (window.gameEngine && window.gameEngine.sceneManager) {
                    const current = window.gameEngine.sceneManager.getCurrentScene();
                    return `当前场景: ${current ? current.name : 'None'}`;
                }
                return '场景管理器不可用';
            }
            
            if (window.gameEngine && window.gameEngine.sceneManager) {
                window.gameEngine.sceneManager.switchScene(sceneName);
                return `切换到场景: ${sceneName}`;
            }
            return '无法切换场景';
        }, '显示当前场景或切换场景 (用法: scene [场景名])');
        
        // 调试模式切换
        this.registerCommand('debug', (state) => {
            if (state === 'on' || state === 'true') {
                GameConfig.DEBUG = true;
                return '调试模式已开启';
            } else if (state === 'off' || state === 'false') {
                GameConfig.DEBUG = false;
                return '调试模式已关闭';
            } else {
                return `调试模式: ${GameConfig.DEBUG ? '开启' : '关闭'}`;
            }
        }, '切换调试模式 (用法: debug [on|off])');
        
        // 清屏命令
        this.registerCommand('clear', () => {
            this.clearOutput();
            return '';
        }, '清空控制台输出');
        
        // 重置游戏
        this.registerCommand('reset', () => {
            if (window.gameEngine) {
                const gameScene = window.gameEngine.sceneManager.scenes.get('game');
                if (gameScene && gameScene.resetGame) {
                    gameScene.resetGame();
                    return '游戏已重置';
                }
            }
            return '无法重置游戏';
        }, '重置游戏状态');
    }
    
    /**
     * 注册命令
     * @param {string} name - 命令名称
     * @param {Function} handler - 命令处理函数
     * @param {string} description - 命令描述
     */
    registerCommand(name, handler, description = '') {
        this.commands.set(name, { handler, description });
    }
    
    /**
     * 创建UI元素
     */
    createUI() {
        // 创建控制台容器
        this.container = document.createElement('div');
        this.container.id = 'debug-console';
        this.container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            height: 300px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #333;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #00ff00;
            z-index: 10000;
            display: none;
            flex-direction: column;
        `;
        
        // 创建输出区域
        this.output = document.createElement('div');
        this.output.style.cssText = `
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        `;
        
        // 创建输入区域
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = '输入命令...';
        this.input.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            border: none;
            border-top: 1px solid #333;
            color: #00ff00;
            padding: 10px;
            font-family: inherit;
            font-size: inherit;
            outline: none;
        `;
        
        // 组装UI
        this.container.appendChild(this.output);
        this.container.appendChild(this.input);
        document.body.appendChild(this.container);
        
        // 初始化输出
        this.addOutput('调试控制台已启动。输入 "help" 查看可用命令。');
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 切换控制台显示
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // 处理输入
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.executeCommand(this.input.value);
                this.input.value = '';
                this.historyIndex = -1;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            }
        });
    }
    
    /**
     * 切换控制台显示
     */
    toggle() {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'flex' : 'none';
        
        if (this.isVisible) {
            this.input.focus();
        }
    }
    
    /**
     * 执行命令
     * @param {string} commandLine - 命令行
     */
    executeCommand(commandLine) {
        if (!commandLine.trim()) return;
        
        // 添加到历史记录
        this.history.unshift(commandLine);
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }
        
        // 显示输入的命令
        this.addOutput(`> ${commandLine}`, '#ffff00');
        
        // 解析命令
        const parts = commandLine.trim().split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        // 执行命令
        if (this.commands.has(commandName)) {
            try {
                const command = this.commands.get(commandName);
                const result = command.handler(...args);
                if (result) {
                    this.addOutput(result);
                }
            } catch (error) {
                this.addOutput(`错误: ${error.message}`, '#ff0000');
            }
        } else {
            this.addOutput(`未知命令: ${commandName}。输入 "help" 查看可用命令。`, '#ff8800');
        }
        
        // 滚动到底部
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    /**
     * 导航历史记录
     * @param {number} direction - 方向 (-1向上, 1向下)
     */
    navigateHistory(direction) {
        if (this.history.length === 0) return;
        
        this.historyIndex += direction;
        this.historyIndex = Math.max(-1, Math.min(this.history.length - 1, this.historyIndex));
        
        if (this.historyIndex >= 0) {
            this.input.value = this.history[this.historyIndex];
        } else {
            this.input.value = '';
        }
    }
    
    /**
     * 添加输出
     * @param {string} text - 输出文本
     * @param {string} color - 文本颜色
     */
    addOutput(text, color = '#00ff00') {
        const timestamp = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.style.color = color;
        line.textContent = `[${timestamp}] ${text}`;
        this.output.appendChild(line);
        
        // 限制输出行数
        while (this.output.children.length > 100) {
            this.output.removeChild(this.output.firstChild);
        }
        
        // 自动滚动到底部
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    /**
     * 清空输出
     */
    clearOutput() {
        this.output.innerHTML = '';
    }
    
    /**
     * 记录日志
     * @param {string} message - 日志消息
     * @param {string} level - 日志级别
     */
    log(message, level = 'info') {
        if (!this.isVisible) return;
        
        const colors = {
            info: '#00ff00',
            warn: '#ffff00',
            error: '#ff0000',
            debug: '#00ffff'
        };
        
        this.addOutput(`[${level.toUpperCase()}] ${message}`, colors[level] || '#ffffff');
    }
}

// 创建全局调试控制台实例
const debugConsole = new DebugConsole();