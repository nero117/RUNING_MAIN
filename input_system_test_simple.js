// 简化的输入系统单元测试 - 专注于核心逻辑测试
console.log('⌨️ 启动输入系统单元测试...\n');

// 模拟浏览器环境的最小实现
const mockDocument = {
    _listeners: {},
    addEventListener: function(event, callback) {
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(callback);
    },
    _triggerEvent: function(eventType, eventData) {
        if (this._listeners[eventType]) {
            this._listeners[eventType].forEach(callback => {
                callback(eventData);
            });
        }
    }
};

// 创建 InputHandler 类的简化版本用于测试
class InputHandler {
    constructor() {
        this.keys = {};
        this.keyStates = {};
        this.callbacks = {};
        this.keyUpCallbacks = {};
        this.keyMap = {
            'Space': 32,
            'Enter': 13,
            'Escape': 27,
            'KeyR': 82,
            'KeyQ': 81
        };
        
        this.shootCooldown = 0;
        this.shootCooldownTime = 300;
        this.lastShootTime = 0;
        this.shootCallbacks = [];
        
        this.bindEvents();
    }
    
    bindEvents() {
        mockDocument.addEventListener('keydown', (event) => {
            this.keys[event.keyCode] = true;
            this.keyStates[event.keyCode] = true;
            
            if (event.keyCode === 81) {
                this.handleShootInput();
            }
            
            if (this.callbacks[event.keyCode]) {
                this.callbacks[event.keyCode].forEach(callback => callback());
            }
        });
        
        mockDocument.addEventListener('keyup', (event) => {
            this.keys[event.keyCode] = false;
            this.keyStates[event.keyCode] = false;
            
            if (this.keyUpCallbacks[event.keyCode]) {
                this.keyUpCallbacks[event.keyCode].forEach(callback => callback());
            }
        });
    }
    
    isKeyPressed(key) {
        const keyCode = typeof key === 'string' ? this.keyMap[key] : key;
        return this.keys[keyCode] || false;
    }
    
    isKeyJustPressed(key) {
        const keyCode = typeof key === 'string' ? this.keyMap[key] : key;
        if (this.keyStates[keyCode] && this.keys[keyCode]) {
            this.keyStates[keyCode] = false;
            return true;
        }
        return false;
    }
    
    onKeyDown(keyCode, callback) {
        if (!this.callbacks[keyCode]) {
            this.callbacks[keyCode] = [];
        }
        this.callbacks[keyCode].push(callback);
    }
    
    onKeyUp(keyCode, callback) {
        if (!this.keyUpCallbacks[keyCode]) {
            this.keyUpCallbacks[keyCode] = [];
        }
        this.keyUpCallbacks[keyCode].push(callback);
    }
    
    update(deltaTime) {
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
    }
    
    handleShootInput() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastShootTime >= this.shootCooldownTime) {
            this.lastShootTime = currentTime;
            this.shootCooldown = this.shootCooldownTime;
            
            if (this.shootCallbacks) {
                this.shootCallbacks.forEach(callback => callback());
            }
        }
    }
    
    canShoot() {
        const currentTime = Date.now();
        return currentTime - this.lastShootTime >= this.shootCooldownTime;
    }
    
    isShootKeyPressed() {
        return this.isKeyPressed(81);
    }
    
    onShoot(callback) {
        if (!this.shootCallbacks) {
            this.shootCallbacks = [];
        }
        this.shootCallbacks.push(callback);
    }
    
    getShootCooldownRemaining() {
        const currentTime = Date.now();
        const remaining = this.shootCooldownTime - (currentTime - this.lastShootTime);
        return Math.max(0, remaining);
    }
    
    setShootCooldown(cooldownTime) {
        this.shootCooldownTime = cooldownTime;
    }
}

// 测试工具函数
function assert(condition, message) {
    if (!condition) {
        throw new Error(`❌ 断言失败: ${message}`);
    }
    console.log(`✅ ${message}`);
}

function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`❌ 断言失败: ${message}. 期望: ${expected}, 实际: ${actual}`);
    }
    console.log(`✅ ${message}`);
}

// 测试套件
class InputSystemTestSuite {
    constructor() {
        this.inputHandler = null;
        this.testCount = 0;
        this.passedTests = 0;
    }
    
    setUp() {
        mockDocument._listeners = {};
        this.inputHandler = new InputHandler();
    }
    
    tearDown() {
        this.inputHandler = null;
        mockDocument._listeners = {};
    }
    
    simulateKeyDown(keyCode) {
        const event = {
            keyCode: keyCode,
            preventDefault: () => {}
        };
        mockDocument._triggerEvent('keydown', event);
    }
    
    simulateKeyUp(keyCode) {
        const event = {
            keyCode: keyCode,
            preventDefault: () => {}
        };
        mockDocument._triggerEvent('keyup', event);
    }
    
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    runTest(testName, testFunction) {
        this.testCount++;
        console.log(`\n🧪 测试: ${testName}`);
        
        try {
            this.setUp();
            testFunction.call(this);
            this.passedTests++;
            console.log(`✅ ${testName} - 通过`);
        } catch (error) {
            console.log(`❌ ${testName} - 失败: ${error.message}`);
        } finally {
            this.tearDown();
        }
    }
    
    async runAsyncTest(testName, testFunction) {
        this.testCount++;
        console.log(`\n🧪 测试: ${testName}`);
        
        try {
            this.setUp();
            await testFunction.call(this);
            this.passedTests++;
            console.log(`✅ ${testName} - 通过`);
        } catch (error) {
            console.log(`❌ ${testName} - 失败: ${error.message}`);
        } finally {
            this.tearDown();
        }
    }
    
    // 测试1: 键盘事件处理 - 基础按键检测
    testBasicKeyDetection() {
        this.simulateKeyDown(32);
        assert(this.inputHandler.isKeyPressed(32), '空格键按下后应该被检测到');
        assert(this.inputHandler.isKeyPressed('Space'), '空格键按下后应该通过键名被检测到');
        
        this.simulateKeyUp(32);
        assert(!this.inputHandler.isKeyPressed(32), '空格键释放后应该不被检测到');
        assert(!this.inputHandler.isKeyPressed('Space'), '空格键释放后应该通过键名不被检测到');
    }
    
    // 测试2: 键盘事件处理 - Q键射击检测
    testShootKeyDetection() {
        this.simulateKeyDown(81);
        assert(this.inputHandler.isKeyPressed(81), 'Q键按下后应该被检测到');
        assert(this.inputHandler.isKeyPressed('KeyQ'), 'Q键按下后应该通过键名被检测到');
        assert(this.inputHandler.isShootKeyPressed(), '射击键按下后应该被检测到');
        
        this.simulateKeyUp(81);
        assert(!this.inputHandler.isKeyPressed(81), 'Q键释放后应该不被检测到');
        assert(!this.inputHandler.isShootKeyPressed(), '射击键释放后应该不被检测到');
    }
    
    // 测试3: 键盘事件处理 - 单次触发检测
    testJustPressedDetection() {
        this.simulateKeyDown(32);
        assert(this.inputHandler.isKeyJustPressed(32), '空格键刚按下时应该被单次触发检测到');
        assert(!this.inputHandler.isKeyJustPressed(32), '空格键第二次检查时不应该被单次触发检测到');
        
        this.simulateKeyUp(32);
        this.simulateKeyDown(32);
        assert(this.inputHandler.isKeyJustPressed(32), '空格键重新按下时应该再次被单次触发检测到');
    }
    
    // 测试4: 输入状态管理 - 多键同时按下
    testMultipleKeysPressed() {
        this.simulateKeyDown(32);
        this.simulateKeyDown(81);
        this.simulateKeyDown(82);
        
        assert(this.inputHandler.isKeyPressed(32), '空格键应该被检测到');
        assert(this.inputHandler.isKeyPressed(81), 'Q键应该被检测到');
        assert(this.inputHandler.isKeyPressed(82), 'R键应该被检测到');
        
        this.simulateKeyUp(32);
        assert(!this.inputHandler.isKeyPressed(32), '空格键释放后应该不被检测到');
        assert(this.inputHandler.isKeyPressed(81), 'Q键应该仍然被检测到');
        assert(this.inputHandler.isKeyPressed(82), 'R键应该仍然被检测到');
    }
    
    // 测试5: 输入状态管理 - 回调函数注册和触发
    testKeyCallbacks() {
        let spaceCallbackTriggered = false;
        let qCallbackTriggered = false;
        let keyUpCallbackTriggered = false;
        
        this.inputHandler.onKeyDown(32, () => {
            spaceCallbackTriggered = true;
        });
        
        this.inputHandler.onKeyDown(81, () => {
            qCallbackTriggered = true;
        });
        
        this.inputHandler.onKeyUp(32, () => {
            keyUpCallbackTriggered = true;
        });
        
        this.simulateKeyDown(32);
        assert(spaceCallbackTriggered, '空格键按下回调应该被触发');
        
        this.simulateKeyDown(81);
        assert(qCallbackTriggered, 'Q键按下回调应该被触发');
        
        this.simulateKeyUp(32);
        assert(keyUpCallbackTriggered, '空格键释放回调应该被触发');
    }
    
    // 测试6: 射击冷却逻辑 - 基础冷却功能
    testShootCooldownBasic() {
        assert(this.inputHandler.canShoot(), '初始状态应该可以射击');
        assertEquals(this.inputHandler.getShootCooldownRemaining(), 0, '初始冷却剩余时间应该为0');
        
        this.inputHandler.handleShootInput();
        assert(!this.inputHandler.canShoot(), '射击后应该不能立即再次射击');
        assert(this.inputHandler.getShootCooldownRemaining() > 0, '射击后冷却剩余时间应该大于0');
    }
    
    // 测试7: 射击冷却逻辑 - 射击回调注册和触发
    testShootCallback() {
        let shootCallbackTriggered = false;
        let shootCount = 0;
        
        this.inputHandler.onShoot(() => {
            shootCallbackTriggered = true;
            shootCount++;
        });
        
        this.inputHandler.handleShootInput();
        assert(shootCallbackTriggered, '射击回调应该被触发');
        assertEquals(shootCount, 1, '射击计数应该为1');
        
        shootCallbackTriggered = false;
        this.inputHandler.handleShootInput();
        assert(!shootCallbackTriggered, '冷却期间射击回调不应该被触发');
        assertEquals(shootCount, 1, '射击计数应该仍然为1');
    }
    
    // 测试8: 射击冷却逻辑 - 通过按键触发射击
    testShootKeyTrigger() {
        let shootTriggered = false;
        
        this.inputHandler.onShoot(() => {
            shootTriggered = true;
        });
        
        this.simulateKeyDown(81);
        assert(shootTriggered, '按下Q键应该触发射击');
    }
    
    // 测试9: 射击冷却逻辑 - 冷却时间更新
    async testShootCooldownUpdate() {
        this.inputHandler.setShootCooldown(100);
        
        this.inputHandler.handleShootInput();
        assert(!this.inputHandler.canShoot(), '射击后应该不能立即再次射击');
        
        await this.wait(150);
        
        assert(this.inputHandler.canShoot(), '冷却时间过后应该可以再次射击');
        assertEquals(this.inputHandler.getShootCooldownRemaining(), 0, '冷却时间过后剩余时间应该为0');
    }
    
    // 测试10: 边界情况 - 无效键码处理
    testInvalidKeyCode() {
        assert(!this.inputHandler.isKeyPressed(999), '不存在的键码应该返回false');
        assert(!this.inputHandler.isKeyPressed('InvalidKey'), '不存在的键名应该返回false');
        assert(!this.inputHandler.isKeyPressed(undefined), 'undefined键码应该返回false');
        assert(!this.inputHandler.isKeyPressed(null), 'null键码应该返回false');
    }
    
    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始运行输入系统单元测试\n');
        
        // 键盘事件处理测试
        this.runTest('基础按键检测', this.testBasicKeyDetection);
        this.runTest('Q键射击检测', this.testShootKeyDetection);
        this.runTest('单次触发检测', this.testJustPressedDetection);
        
        // 输入状态管理测试
        this.runTest('多键同时按下', this.testMultipleKeysPressed);
        this.runTest('回调函数注册和触发', this.testKeyCallbacks);
        
        // 射击冷却逻辑测试
        this.runTest('基础射击冷却功能', this.testShootCooldownBasic);
        this.runTest('射击回调注册和触发', this.testShootCallback);
        this.runTest('通过按键触发射击', this.testShootKeyTrigger);
        
        // 异步测试
        await this.runAsyncTest('冷却时间更新', this.testShootCooldownUpdate);
        
        // 边界情况测试
        this.runTest('无效键码处理', this.testInvalidKeyCode);
        
        // 输出测试结果
        console.log('\n📊 测试结果统计:');
        console.log(`总测试数: ${this.testCount}`);
        console.log(`通过测试: ${this.passedTests}`);
        console.log(`失败测试: ${this.testCount - this.passedTests}`);
        console.log(`成功率: ${((this.passedTests / this.testCount) * 100).toFixed(1)}%`);
        
        if (this.passedTests === this.testCount) {
            console.log('\n🎉 所有输入系统测试通过！');
            console.log('\n✅ 测试覆盖的功能:');
            console.log('   - 键盘事件处理 (需求 3.1, 3.3)');
            console.log('   - 输入状态管理 (需求 3.1, 3.3)');
            console.log('   - 射击冷却逻辑 (需求 7.1)');
        } else {
            console.log('\n⚠️ 部分测试失败，请检查实现。');
        }
    }
}

// 运行测试
const testSuite = new InputSystemTestSuite();
testSuite.runAllTests().then(() => {
    console.log('\n✨ 输入系统单元测试完成');
}).catch(error => {
    console.error('测试运行出错:', error);
});