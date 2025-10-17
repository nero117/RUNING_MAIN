/**
 * 系统集成管理器
 * 负责协调各个游戏系统之间的数据传递和状态同步
 */
class SystemIntegration {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.systems = new Map();
        this.systemStats = new Map();
        this.eventBus = new Map();
        this.isInitialized = false;
        
        // 性能监控
        this.performanceMonitor = {
            frameTime: 0,
            updateTime: 0,
            renderTime: 0,
            systemTimes: new Map()
        };
    }
    
    /**
     * 注册系统
     * @param {string} name - 系统名称
     * @param {Object} system - 系统实例
     */
    registerSystem(name, system) {
        this.systems.set(name, system);
        this.systemStats.set(name, {
            updateCount: 0,
            errorCount: 0,
            lastUpdateTime: 0,
            averageUpdateTime: 0
        });
        
        console.log(`系统已注册: ${name}`);
    }
    
    /**
     * 获取系统
     * @param {string} name - 系统名称
     * @returns {Object|null} 系统实例
     */
    getSystem(name) {
        return this.systems.get(name) || null;
    }
    
    /**
     * 初始化所有系统
     */
    initializeSystems() {
        console.log('开始初始化系统集成...');
        
        try {
            // 验证必需的系统
            this.validateRequiredSystems();
            
            // 建立系统间的连接
            this.establishSystemConnections();
            
            // 设置事件监听
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('系统集成初始化完成');
            
        } catch (error) {
            console.error('系统集成初始化失败:', error);
            throw error;
        }
    }
    
    /**
     * 验证必需的系统
     */
    validateRequiredSystems() {
        const requiredSystems = [
            'renderer',
            'inputHandler',
            'sceneManager',
            'physicsSystem'
        ];
        
        const missingSystems = requiredSystems.filter(name => !this.systems.has(name));
        
        if (missingSystems.length > 0) {
            throw new Error(`缺少必需的系统: ${missingSystems.join(', ')}`);
        }
    }
    
    /**
     * 建立系统间的连接
     */
    establishSystemConnections() {
        // 为渲染器设置性能监控
        const renderer = this.getSystem('renderer');
        if (renderer) {
            const originalClear = renderer.clear.bind(renderer);
            renderer.clear = () => {
                const startTime = performance.now();
                originalClear();
                this.performanceMonitor.renderTime = performance.now() - startTime;
            };
        }
        
        // 为场景管理器设置系统引用
        const sceneManager = this.getSystem('sceneManager');
        if (sceneManager) {
            sceneManager.systemIntegration = this;
        }
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }
    
    /**
     * 处理窗口大小变化
     */
    handleWindowResize() {
        const renderer = this.getSystem('renderer');
        if (renderer && renderer.canvas) {
            // 这里可以添加响应式处理逻辑
            console.log('窗口大小已变化');
        }
    }
    
    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.gameEngine.pause();
        } else {
            this.gameEngine.resume();
        }
    }
    
    /**
     * 更新所有系统
     * @param {number} deltaTime - 时间增量
     */
    updateSystems(deltaTime) {
        if (!this.isInitialized) {
            return;
        }
        
        const updateStartTime = performance.now();
        
        // 按优先级顺序更新系统
        const updateOrder = [
            'inputHandler',
            'physicsSystem',
            'sceneManager',
            'collisionSystem'
        ];
        
        for (const systemName of updateOrder) {
            this.updateSystem(systemName, deltaTime);
        }
        
        this.performanceMonitor.updateTime = performance.now() - updateStartTime;
    }
    
    /**
     * 更新单个系统
     * @param {string} systemName - 系统名称
     * @param {number} deltaTime - 时间增量
     */
    updateSystem(systemName, deltaTime) {
        const system = this.getSystem(systemName);
        if (!system || !system.update) {
            return;
        }
        
        const stats = this.systemStats.get(systemName);
        const startTime = performance.now();
        
        try {
            system.update(deltaTime);
            
            const updateTime = performance.now() - startTime;
            stats.updateCount++;
            stats.lastUpdateTime = updateTime;
            stats.averageUpdateTime = (stats.averageUpdateTime * (stats.updateCount - 1) + updateTime) / stats.updateCount;
            
            this.performanceMonitor.systemTimes.set(systemName, updateTime);
            
        } catch (error) {
            stats.errorCount++;
            console.error(`系统更新错误 (${systemName}):`, error);
        }
    }
    
    /**
     * 发送系统事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     */
    emitEvent(eventType, data) {
        if (!this.eventBus.has(eventType)) {
            return;
        }
        
        const listeners = this.eventBus.get(eventType);
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`事件处理错误 (${eventType}):`, error);
            }
        });
    }
    
    /**
     * 监听系统事件
     * @param {string} eventType - 事件类型
     * @param {Function} listener - 监听器函数
     */
    addEventListener(eventType, listener) {
        if (!this.eventBus.has(eventType)) {
            this.eventBus.set(eventType, []);
        }
        this.eventBus.get(eventType).push(listener);
    }
    
    /**
     * 移除事件监听器
     * @param {string} eventType - 事件类型
     * @param {Function} listener - 监听器函数
     */
    removeEventListener(eventType, listener) {
        if (!this.eventBus.has(eventType)) {
            return;
        }
        
        const listeners = this.eventBus.get(eventType);
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
    
    /**
     * 获取系统统计信息
     * @returns {Object} 统计信息
     */
    getSystemStats() {
        const stats = {};
        
        for (const [systemName, systemStats] of this.systemStats) {
            stats[systemName] = { ...systemStats };
        }
        
        return {
            systems: stats,
            performance: { ...this.performanceMonitor },
            isInitialized: this.isInitialized,
            systemCount: this.systems.size
        };
    }
    
    /**
     * 重置统计信息
     */
    resetStats() {
        for (const stats of this.systemStats.values()) {
            stats.updateCount = 0;
            stats.errorCount = 0;
            stats.lastUpdateTime = 0;
            stats.averageUpdateTime = 0;
        }
        
        this.performanceMonitor.systemTimes.clear();
    }
    
    /**
     * 渲染系统集成调试信息
     * @param {Renderer} renderer - 渲染器
     */
    renderDebugInfo(renderer) {
        if (!GameConfig.DEBUG) {
            return;
        }
        
        const stats = this.getSystemStats();
        let y = 200;
        const lineHeight = 14;
        
        renderer.drawText('系统集成状态:', 10, y, '#00ffff', '14px Arial');
        y += lineHeight;
        
        renderer.drawText(`初始化状态: ${stats.isInitialized ? '已完成' : '未完成'}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        renderer.drawText(`系统数量: ${stats.systemCount}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        renderer.drawText(`更新时间: ${stats.performance.updateTime.toFixed(2)}ms`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        // 显示各系统的性能
        for (const [systemName, systemStats] of Object.entries(stats.systems)) {
            const color = systemStats.errorCount > 0 ? '#ff0000' : '#ffffff';
            renderer.drawText(
                `${systemName}: ${systemStats.averageUpdateTime.toFixed(2)}ms (错误: ${systemStats.errorCount})`,
                10, y, color, '10px Arial'
            );
            y += lineHeight;
        }
    }
    
    /**
     * 销毁系统集成
     */
    destroy() {
        // 清理事件监听器
        window.removeEventListener('resize', this.handleWindowResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // 清理系统引用
        this.systems.clear();
        this.systemStats.clear();
        this.eventBus.clear();
        
        this.isInitialized = false;
        console.log('系统集成已销毁');
    }
}