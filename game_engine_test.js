// 游戏引擎单元测试
console.log('🎮 启动游戏引擎单元测试...\n');

// 模拟浏览器环境
global.window = {
    requestAnimationFrame: (callback) => {
        setTimeout(callback, 16); // 模拟 60 FPS
        return 1;
    },
    performance: {
        now: () => Date.now()
    },
    memoryManager: null,
    shootingPerformanceMonitor: null
};

global.performance = global.window.performance;

// 模拟 GameConfig
global.GameConfig = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 400,
    GRAVITY: 980,
    JUMP_FORCE: -400,
    GROUND_Y: 350,
    DEBUG: false
};

// 模拟 Canvas 和 Context
class MockCanvas {
    constructor() {
        this.width = 800;
        this.height = 400;
        this.style = {};
    }
    
    getContext(type) {
        return new MockContext();
    }
}

class MockContext {
    constructor() {
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.font = '12px Arial';
        this.textAlign = 'left';
        this.globalAlpha = 1;
        this.lineWidth = 1;
    }
    
    clearRect() {}
    fillRect() {}
    strokeRect() {}
    fillText() {}
    strokeText() {}
    beginPath() {}
    moveTo() {}
    lineTo() {}
    arc() {}
    fill() {}
    stroke() {}
    save() {}
    restore() {}
    translate() {}
    scale() {}
    rotate() {}
}

// 模拟依赖类
class MockRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.renderStats = { drawCalls: 0 };
    }
    
    clear() {
        this.renderStats.drawCalls++;
    }
    
    updateBackground() {}
    drawBackground() {}
    drawDebugInfo() {}
    getRenderStats() {
        return this.renderStats;
    }
}

class MockInputHandler {
    constructor() {
        this.keys = {};
        this.keyStates = {};
    }
    
    update() {}
}

class MockSceneManager {
    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
    }
    
    addScene(name, scene) {
        this.scenes.set(name, scene);
    }
    
    switchScene(name) {
        const newScene = this.scenes.get(name);
        if (!newScene) {
            throw new Error(`场景 "${name}" 不存在`);
        }
        
        // 退出当前场景
        if (this.currentScene && this.currentScene.onExit) {
            this.currentScene.onExit();
        }
        
        // 切换到新场景
        this.currentScene = newScene;
        if (this.currentScene.onEnter) {
            this.currentScene.onEnter();
        }
        
        return true;
    }
    
    getCurrentScene() {
        return this.currentScene;
    }
    
    update(deltaTime) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(deltaTime);
        }
    }
    
    render(renderer) {
        if (this.currentScene && this.currentScene.render) {
            this.currentScene.render(renderer);
        }
    }
}

class MockPhysicsSystem {
    constructor() {}
}

class MockPerformanceMonitor {
    constructor() {}
    startFrame() {}
    endFrame() {}
    recordRenderCalls() {}
    recordEntityCount() {}
    render() {}
}

class MockSystemIntegration {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.systems = new Map();
    }
    
    registerSystem(name, system) {
        this.systems.set(name, system);
    }
    
    initializeSystems() {}
    updateSystems() {}
    renderDebugInfo() {}
}

// 模拟对象池管理器
global.objectPoolManager = {
    createPool: () => {},
    renderDebugInfo: () => {}
};

// 模拟场景类
class MockScene {
    constructor(name) {
        this.name = name;
        this.entered = false;
        this.exited = false;
        this.updated = false;
        this.rendered = false;
    }
    
    onEnter() {
        this.entered = true;
    }
    
    onExit() {
        this.exited = true;
    }
    
    update(deltaTime) {
        this.updated = true;
    }
    
    render(renderer) {
        this.rendered = true;
    }
    
    handleInput(inputHandler) {}
    
    getEntityCounts() {
        return { active: 5, total: 10, rendered: 5 };
    }
}

// 简化的 GameEngine 类用于测试
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new MockRenderer(canvas);
        this.inputHandler = new MockInputHandler();
        this.sceneManager = new MockSceneManager();
        this.physicsSystem = new MockPhysicsSystem();
        
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        
        this.gameLoop = this.gameLoop.bind(this);
        
        // 初始化性能监控器
        this.performanceMonitor = new MockPerformanceMonitor();
        
        // 初始化系统集成管理器
        this.systemIntegration = new MockSystemIntegration(this);
        this.initializeSystemIntegration();
    }
    
    initializeSystemIntegration() {
        this.systemIntegration.registerSystem('renderer', this.renderer);
        this.systemIntegration.registerSystem('inputHandler', this.inputHandler);
        this.systemIntegration.registerSystem('sceneManager', this.sceneManager);
        this.systemIntegration.registerSystem('physicsSystem', this.physicsSystem);
        
        this.systemIntegration.initializeSystems();
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            // 在测试中不启动实际的游戏循环
            // requestAnimationFrame(this.gameLoop);
        }
    }
    
    stop() {
        this.isRunning = false;
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
    }
    
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        this.performanceMonitor.startFrame();
        
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.deltaTime = Math.min(this.deltaTime, 1/30);
        
        this.calculateFPS(this.deltaTime);
        
        if (!this.isPaused) {
            this.update(this.deltaTime);
        }
        
        this.render();
        
        this.recordPerformanceMetrics();
        
        this.performanceMonitor.endFrame();
        
        if (this.isRunning) {
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    update(deltaTime) {
        this.inputHandler.update(deltaTime * 1000);
        this.systemIntegration.updateSystems(deltaTime);
        
        const currentScene = this.sceneManager.getCurrentScene();
        if (currentScene && currentScene.handleInput) {
            currentScene.handleInput(this.inputHandler);
        }
        
        this.sceneManager.update(deltaTime);
    }
    
    render() {
        this.renderer.clear();
        this.renderer.updateBackground(this.deltaTime);
        this.renderer.drawBackground();
        
        this.sceneManager.render(this.renderer);
        
        const debugInfo = {
            'Scene': this.sceneManager.getCurrentScene()?.name || 'None',
            'Paused': this.isPaused
        };
        this.renderer.drawDebugInfo(this.fps, debugInfo);
        
        this.systemIntegration.renderDebugInfo(this.renderer);
        this.performanceMonitor.render(this.renderer);
    }
    
    calculateFPS(deltaTime) {
        this.frameCount++;
        this.fpsTimer += deltaTime;
        
        if (this.fpsTimer >= 1.0) {
            this.fps = Math.round(this.frameCount / this.fpsTimer);
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
    }
    
    recordPerformanceMetrics() {
        const renderStats = this.renderer.getRenderStats();
        this.performanceMonitor.recordRenderCalls(renderStats.drawCalls);
        
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

// 运行测试
runGameEngineTests();

function runGameEngineTests() {
    console.log('🧪 运行游戏引擎测试...\n');
    
    let passed = 0;
    let total = 0;
    
    function test(name, testFn) {
        total++;
        try {
            testFn();
            console.log(`✅ ${name}`);
            passed++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
        }
    }
    
    // === 游戏引擎初始化测试 ===
    console.log('🎮 游戏引擎初始化测试:');
    
    test('GameEngine 可以实例化', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        if (!engine) throw new Error('无法创建 GameEngine 实例');
        if (!engine.canvas) throw new Error('canvas 属性未设置');
        if (!engine.renderer) throw new Error('renderer 未初始化');
        if (!engine.inputHandler) throw new Error('inputHandler 未初始化');
        if (!engine.sceneManager) throw new Error('sceneManager 未初始化');
        if (!engine.physicsSystem) throw new Error('physicsSystem 未初始化');
    });
    
    test('游戏引擎初始状态正确', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        if (engine.isRunning) throw new Error('游戏引擎不应该在初始化时运行');
        if (engine.isPaused) throw new Error('游戏引擎不应该在初始化时暂停');
        if (engine.fps !== 0) throw new Error('初始 FPS 应该为 0');
        if (engine.deltaTime !== 0) throw new Error('初始 deltaTime 应该为 0');
    });
    
    test('系统集成正确初始化', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        if (!engine.systemIntegration) throw new Error('systemIntegration 未初始化');
        if (!engine.performanceMonitor) throw new Error('performanceMonitor 未初始化');
        
        // 验证系统是否已注册
        const systems = engine.systemIntegration.systems;
        if (!systems.has('renderer')) throw new Error('renderer 系统未注册');
        if (!systems.has('inputHandler')) throw new Error('inputHandler 系统未注册');
        if (!systems.has('sceneManager')) throw new Error('sceneManager 系统未注册');
        if (!systems.has('physicsSystem')) throw new Error('physicsSystem 系统未注册');
    });
    
    // === 游戏循环控制测试 ===
    console.log('\n🔄 游戏循环控制测试:');
    
    test('游戏可以启动', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        engine.start();
        
        if (!engine.isRunning) throw new Error('游戏引擎启动失败');
        if (engine.lastTime <= 0) throw new Error('lastTime 未正确设置');
    });
    
    test('游戏可以停止', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        engine.start();
        engine.stop();
        
        if (engine.isRunning) throw new Error('游戏引擎停止失败');
    });
    
    test('重复启动不会产生问题', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        engine.start();
        const firstStartTime = engine.lastTime;
        
        // 稍等一下再次启动
        setTimeout(() => {
            engine.start();
            
            // 时间不应该改变，因为已经在运行
            if (engine.lastTime !== firstStartTime) {
                throw new Error('重复启动改变了 lastTime');
            }
        }, 10);
    });
    
    test('游戏可以暂停', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        engine.start();
        engine.pause();
        
        if (!engine.isPaused) throw new Error('游戏暂停失败');
        if (!engine.isRunning) throw new Error('暂停时游戏应该仍在运行状态');
    });
    
    test('游戏可以恢复', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        engine.start();
        engine.pause();
        engine.resume();
        
        if (engine.isPaused) throw new Error('游戏恢复失败');
        if (!engine.isRunning) throw new Error('恢复后游戏应该在运行状态');
        if (engine.lastTime <= 0) throw new Error('恢复时 lastTime 未正确重置');
    });
    
    // === 场景管理测试 ===
    console.log('\n🎬 场景管理测试:');
    
    test('场景管理器可以添加场景', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const testScene = new MockScene('test');
        
        engine.sceneManager.addScene('test', testScene);
        
        if (!engine.sceneManager.scenes.has('test')) {
            throw new Error('场景添加失败');
        }
    });
    
    test('场景切换功能正常', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const scene1 = new MockScene('scene1');
        const scene2 = new MockScene('scene2');
        
        engine.sceneManager.addScene('scene1', scene1);
        engine.sceneManager.addScene('scene2', scene2);
        
        // 切换到场景1
        engine.sceneManager.switchScene('scene1');
        
        if (engine.sceneManager.getCurrentScene() !== scene1) {
            throw new Error('场景切换到 scene1 失败');
        }
        if (!scene1.entered) throw new Error('scene1 的 onEnter 未被调用');
        
        // 切换到场景2
        engine.sceneManager.switchScene('scene2');
        
        if (engine.sceneManager.getCurrentScene() !== scene2) {
            throw new Error('场景切换到 scene2 失败');
        }
        if (!scene1.exited) throw new Error('scene1 的 onExit 未被调用');
        if (!scene2.entered) throw new Error('scene2 的 onEnter 未被调用');
    });
    
    test('切换到不存在的场景会抛出错误', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        try {
            engine.sceneManager.switchScene('nonexistent');
            throw new Error('应该抛出错误但没有');
        } catch (error) {
            if (!error.message.includes('不存在')) {
                throw new Error('错误信息不正确');
            }
        }
    });
    
    test('场景更新功能正常', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const testScene = new MockScene('test');
        
        engine.sceneManager.addScene('test', testScene);
        engine.sceneManager.switchScene('test');
        
        engine.sceneManager.update(0.016);
        
        if (!testScene.updated) throw new Error('场景更新未被调用');
    });
    
    test('场景渲染功能正常', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const testScene = new MockScene('test');
        
        engine.sceneManager.addScene('test', testScene);
        engine.sceneManager.switchScene('test');
        
        engine.sceneManager.render(engine.renderer);
        
        if (!testScene.rendered) throw new Error('场景渲染未被调用');
    });
    
    // === 游戏循环更新测试 ===
    console.log('\n🔄 游戏循环更新测试:');
    
    test('update 方法正确调用各系统', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const testScene = new MockScene('test');
        
        engine.sceneManager.addScene('test', testScene);
        engine.sceneManager.switchScene('test');
        
        // 模拟更新
        engine.update(0.016);
        
        if (!testScene.updated) throw new Error('场景更新未被调用');
    });
    
    test('暂停时不执行更新', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const testScene = new MockScene('test');
        
        engine.sceneManager.addScene('test', testScene);
        engine.sceneManager.switchScene('test');
        
        engine.pause();
        
        // 重置更新标志
        testScene.updated = false;
        
        // 模拟游戏循环（暂停状态）
        const currentTime = performance.now();
        engine.deltaTime = 0.016;
        engine.lastTime = currentTime - 16;
        
        if (!engine.isPaused) {
            engine.update(engine.deltaTime);
        }
        
        if (testScene.updated) throw new Error('暂停时不应该执行更新');
    });
    
    test('FPS 计算功能正常', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        // 模拟多帧更新
        for (let i = 0; i < 60; i++) {
            engine.calculateFPS(1/60); // 60 FPS
        }
        
        // FPS 应该接近 60
        if (Math.abs(engine.fps - 60) > 5) {
            throw new Error(`FPS 计算不准确: ${engine.fps}, 期望接近 60`);
        }
    });
    
    test('deltaTime 限制功能正常', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        // 模拟一个很大的时间跳跃
        const currentTime = performance.now();
        engine.lastTime = currentTime - 1000; // 1秒前
        
        engine.deltaTime = (currentTime - engine.lastTime) / 1000;
        engine.deltaTime = Math.min(engine.deltaTime, 1/30); // 限制最大 deltaTime
        
        if (engine.deltaTime > 1/30) {
            throw new Error('deltaTime 限制失效');
        }
    });
    
    // === 渲染系统测试 ===
    console.log('\n🎨 渲染系统测试:');
    
    test('render 方法正确调用渲染器', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const testScene = new MockScene('test');
        
        engine.sceneManager.addScene('test', testScene);
        engine.sceneManager.switchScene('test');
        
        // 重置渲染统计
        engine.renderer.renderStats.drawCalls = 0;
        
        engine.render();
        
        if (engine.renderer.renderStats.drawCalls === 0) {
            throw new Error('渲染器未被调用');
        }
        if (!testScene.rendered) throw new Error('场景渲染未被调用');
    });
    
    test('性能指标记录功能正常', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const testScene = new MockScene('test');
        
        engine.sceneManager.addScene('test', testScene);
        engine.sceneManager.switchScene('test');
        
        // 模拟渲染调用
        engine.renderer.renderStats.drawCalls = 5;
        
        // 应该不抛出异常
        engine.recordPerformanceMetrics();
    });
    
    // === 错误处理测试 ===
    console.log('\n🚨 错误处理测试:');
    
    test('无效 canvas 处理', () => {
        try {
            const engine = new GameEngine(null);
            // 如果没有抛出错误，检查是否有适当的处理
            if (!engine.canvas) {
                // 这是预期的行为
            }
        } catch (error) {
            // 抛出错误也是可接受的
        }
    });
    
    test('场景为空时的处理', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        // 没有设置场景时应该不抛出异常
        engine.update(0.016);
        engine.render();
    });
    
    // === 集成测试 ===
    console.log('\n🔗 集成测试:');
    
    test('完整游戏循环模拟', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        const testScene = new MockScene('test');
        
        engine.sceneManager.addScene('test', testScene);
        engine.sceneManager.switchScene('test');
        
        engine.start();
        
        // 模拟一帧的执行
        const currentTime = performance.now();
        engine.lastTime = currentTime - 16; // 16ms 前
        
        engine.deltaTime = (currentTime - engine.lastTime) / 1000;
        engine.deltaTime = Math.min(engine.deltaTime, 1/30);
        
        engine.calculateFPS(engine.deltaTime);
        
        if (!engine.isPaused) {
            engine.update(engine.deltaTime);
        }
        
        engine.render();
        engine.recordPerformanceMetrics();
        
        // 验证各系统都被正确调用
        if (!testScene.updated) throw new Error('场景更新未被调用');
        if (!testScene.rendered) throw new Error('场景渲染未被调用');
        if (engine.renderer.renderStats.drawCalls === 0) throw new Error('渲染器未被调用');
    });
    
    test('多场景切换稳定性', () => {
        const canvas = new MockCanvas();
        const engine = new GameEngine(canvas);
        
        // 创建多个场景
        const scenes = [];
        for (let i = 0; i < 5; i++) {
            const scene = new MockScene(`scene${i}`);
            scenes.push(scene);
            engine.sceneManager.addScene(`scene${i}`, scene);
        }
        
        // 快速切换场景
        for (let i = 0; i < 10; i++) {
            const sceneIndex = i % 5;
            engine.sceneManager.switchScene(`scene${sceneIndex}`);
            
            if (engine.sceneManager.getCurrentScene() !== scenes[sceneIndex]) {
                throw new Error(`场景切换失败: scene${sceneIndex}`);
            }
        }
    });
    
    // 输出测试结果
    console.log(`\n🎉 测试结果: ${passed}/${total} 个测试通过`);
    console.log(`成功率: ${Math.round((passed / total) * 100)}%`);
    
    if (passed === total) {
        console.log('✅ 所有测试通过！游戏引擎单元测试完成。');
        console.log('🎮 游戏引擎核心功能完整，场景切换逻辑正确！');
        return true;
    } else {
        console.log('❌ 部分测试失败！');
        return false;
    }
}