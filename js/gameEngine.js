/**
 * 游戏引擎 - 核心游戏循环和状态管理
 */
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.inputHandler = new InputHandler();
        this.sceneManager = new SceneManager();
        this.physicsSystem = new PhysicsSystem();
        
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        
        this.gameLoop = this.gameLoop.bind(this);
        
        // 初始化性能监控器
        this.performanceMonitor = new PerformanceMonitor();
        
        // 初始化系统集成管理器
        this.systemIntegration = new SystemIntegration(this);
        this.initializeSystemIntegration();
        
        // 初始化对象池
        this.initializeObjectPools();
        
        // 初始化场景
        this.initializeScenes();
    }
    
    /**
     * 初始化系统集成
     */
    initializeSystemIntegration() {
        // 注册核心系统
        this.systemIntegration.registerSystem('renderer', this.renderer);
        this.systemIntegration.registerSystem('inputHandler', this.inputHandler);
        this.systemIntegration.registerSystem('sceneManager', this.sceneManager);
        this.systemIntegration.registerSystem('physicsSystem', this.physicsSystem);
        
        // 初始化系统集成
        this.systemIntegration.initializeSystems();
    }
    
    /**
     * 初始化对象池
     */
    initializeObjectPools() {
        // 创建障碍物对象池
        objectPoolManager.createPool(
            'obstacles',
            () => new Obstacle(0, 0, 'box'),
            (obstacle) => {
                obstacle.x = 0;
                obstacle.y = 0;
                obstacle.velocityX = 0;
                obstacle.velocityY = 0;
                obstacle.active = false;
            },
            20
        );
        
        // 创建粒子对象池（如果需要）
        objectPoolManager.createPool(
            'particles',
            () => ({
                x: 0, y: 0, vx: 0, vy: 0,
                life: 1, maxLife: 1,
                size: 1, color: '#ffffff',
                active: false
            }),
            (particle) => {
                particle.x = 0;
                particle.y = 0;
                particle.vx = 0;
                particle.vy = 0;
                particle.life = 1;
                particle.active = false;
            },
            100
        );
        
        console.log('对象池初始化完成');
        
        // 注册内存清理任务
        this.registerMemoryCleanupTasks();
    }
    
    /**
     * 注册内存清理任务
     */
    registerMemoryCleanupTasks() {
        if (!window.memoryManager) return;
        
        // 清理渲染器缓存
        memoryManager.registerCleanupTask(() => {
            if (this.renderer && this.renderer.cachedStyles) {
                // 重置缓存的样式
                this.renderer.cachedStyles = {
                    fillStyle: null,
                    strokeStyle: null,
                    font: null,
                    textAlign: null
                };
            }
        }, '清理渲染器缓存');
        
        // 清理场景中的临时数据
        memoryManager.registerCleanupTask(() => {
            const currentScene = this.sceneManager.getCurrentScene();
            if (currentScene && currentScene.cleanup) {
                currentScene.cleanup();
            }
        }, '清理场景临时数据');
        
        // 清理输入处理器的状态
        memoryManager.registerCleanupTask(() => {
            if (this.inputHandler && this.inputHandler.keyStates) {
                // 重置按键状态，防止状态残留
                for (const key in this.inputHandler.keyStates) {
                    if (!this.inputHandler.keys[key]) {
                        this.inputHandler.keyStates[key] = false;
                    }
                }
            }
        }, '清理输入状态');
    }
    
    /**
     * 初始化游戏场景
     */
    initializeScenes() {
        // 创建场景实例
        const menuScene = new MenuScene();
        const gameScene = new GameScene();
        const gameOverScene = new GameOverScene();
        
        // 设置场景间的数据传递和回调
        gameScene.onReturnToMenu = () => {
            this.sceneManager.switchScene('menu');
        };
        
        gameScene.onGameOverCallback = (finalScore, gameStats) => {
            // 传递最终得分和游戏统计到游戏结束场景
            gameOverScene.setFinalScore(finalScore, gameStats);
            this.sceneManager.switchScene('gameOver');
        };
        
        // 设置全局游戏引擎引用，供场景使用
        menuScene.gameEngine = this;
        gameScene.gameEngine = this;
        gameOverScene.gameEngine = this;
        
        // 添加场景到场景管理器
        this.sceneManager.addScene('menu', menuScene);
        this.sceneManager.addScene('game', gameScene);
        this.sceneManager.addScene('gameOver', gameOverScene);
        
        // 设置初始场景为菜单
        this.sceneManager.switchScene('menu');
    }
    
    /**
     * 启动游戏
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    /**
     * 停止游戏
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * 暂停游戏
     */
    pause() {
        this.isPaused = true;
    }
    
    /**
     * 恢复游戏
     */
    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
    }
    
    /**
     * 游戏主循环
     * @param {number} currentTime - 当前时间戳
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // 开始性能监控
        this.performanceMonitor.startFrame();
        
        // 计算时间增量
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // 限制最大时间增量，防止大幅跳跃
        this.deltaTime = Math.min(this.deltaTime, 1/30);
        
        // 计算FPS
        this.calculateFPS(this.deltaTime);
        
        if (!this.isPaused) {
            this.update(this.deltaTime);
        }
        
        this.render();
        
        // 记录性能数据
        this.recordPerformanceMetrics();
        
        // 结束性能监控
        this.performanceMonitor.endFrame();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * 更新游戏状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        // 使用系统集成管理器更新系统
        this.systemIntegration.updateSystems(deltaTime);
        
        // 处理当前场景的输入
        const currentScene = this.sceneManager.getCurrentScene();
        if (currentScene && currentScene.handleInput) {
            currentScene.handleInput(this.inputHandler);
        }
        
        // 更新场景
        this.sceneManager.update(deltaTime);
    }
    
    /**
     * 渲染游戏
     */
    render() {
        this.renderer.clear();
        
        // 更新背景滚动
        this.renderer.updateBackground(this.deltaTime);
        
        // 绘制背景
        this.renderer.drawBackground();
        
        // 渲染当前场景
        this.sceneManager.render(this.renderer);
        
        // 绘制调试信息
        const debugInfo = {
            'Scene': this.sceneManager.getCurrentScene()?.name || 'None',
            'Paused': this.isPaused
        };
        this.renderer.drawDebugInfo(this.fps, debugInfo);
        
        // 绘制系统集成调试信息
        this.systemIntegration.renderDebugInfo(this.renderer);
        
        // 绘制性能监控信息
        this.performanceMonitor.render(this.renderer);
        
        // 绘制对象池调试信息
        objectPoolManager.renderDebugInfo(this.renderer);
        
        // 绘制内存管理信息
        if (window.memoryManager) {
            memoryManager.renderMemoryInfo(this.renderer);
        }
    }
    
    /**
     * 计算FPS
     * @param {number} deltaTime - 时间增量
     */
    calculateFPS(deltaTime) {
        this.frameCount++;
        this.fpsTimer += deltaTime;
        
        if (this.fpsTimer >= 1.0) {
            this.fps = Math.round(this.frameCount / this.fpsTimer);
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
    }
    
    /**
     * 记录性能指标
     */
    recordPerformanceMetrics() {
        // 记录渲染调用次数
        const renderStats = this.renderer.getRenderStats();
        this.performanceMonitor.recordRenderCalls(renderStats.drawCalls);
        
        // 记录实体数量
        const currentScene = this.sceneManager.getCurrentScene();
        if (currentScene && currentScene.getEntityCounts) {
            const entityCounts = currentScene.getEntityCounts();
            this.performanceMonitor.recordEntityCount(
                entityCounts.active,
                entityCounts.total,
                entityCounts.rendered
            );
        }
    }
}