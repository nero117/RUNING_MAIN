/**
 * 输入处理系统
 */
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
            'KeyQ': 81       // Q键用于射击
        };
        
        // 射击相关状态
        this.shootCooldown = 0;
        this.shootCooldownTime = 300; // 300毫秒冷却时间
        this.lastShootTime = 0;
        
        this.bindEvents();
    }
    
    /**
     * 绑定键盘事件
     */
    bindEvents() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.keyCode] = true;
            this.keyStates[event.keyCode] = true;
            
            // 处理射击输入（Q键）
            if (event.keyCode === 81) { // Q键
                this.handleShootInput();
            }
            
            // 触发回调
            if (this.callbacks[event.keyCode]) {
                this.callbacks[event.keyCode].forEach(callback => callback());
            }
            
            // 阻止默认行为（如空格键滚动页面）
            if (event.keyCode === 32 || event.keyCode === 81) {
                event.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.keyCode] = false;
            this.keyStates[event.keyCode] = false;
            
            // 触发按键释放回调
            if (this.keyUpCallbacks[event.keyCode]) {
                this.keyUpCallbacks[event.keyCode].forEach(callback => callback());
            }
        });
    }
    
    /**
     * 检查按键是否被按下
     * @param {number|string} key - 键码或键名
     * @returns {boolean} 是否被按下
     */
    isKeyPressed(key) {
        const keyCode = typeof key === 'string' ? this.keyMap[key] : key;
        return this.keys[keyCode] || false;
    }
    
    /**
     * 检查按键是否刚被按下（单次触发）
     * @param {number|string} key - 键码或键名
     * @returns {boolean} 是否刚被按下
     */
    isKeyJustPressed(key) {
        const keyCode = typeof key === 'string' ? this.keyMap[key] : key;
        if (this.keyStates[keyCode] && this.keys[keyCode]) {
            this.keyStates[keyCode] = false; // 重置状态，确保单次触发
            return true;
        }
        return false;
    }
    
    /**
     * 注册按键按下回调
     * @param {number} keyCode - 键码
     * @param {Function} callback - 回调函数
     */
    onKeyDown(keyCode, callback) {
        if (!this.callbacks[keyCode]) {
            this.callbacks[keyCode] = [];
        }
        this.callbacks[keyCode].push(callback);
    }
    
    /**
     * 注册按键释放回调
     * @param {number} keyCode - 键码
     * @param {Function} callback - 回调函数
     */
    onKeyUp(keyCode, callback) {
        if (!this.keyUpCallbacks) {
            this.keyUpCallbacks = {};
        }
        if (!this.keyUpCallbacks[keyCode]) {
            this.keyUpCallbacks[keyCode] = [];
        }
        this.keyUpCallbacks[keyCode].push(callback);
    }
    
    /**
     * 更新射击冷却时间
     * @param {number} deltaTime - 时间间隔（毫秒）
     */
    update(deltaTime) {
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
    }
    
    /**
     * 处理射击输入
     */
    handleShootInput() {
        const currentTime = Date.now();
        
        // 检查冷却时间
        if (currentTime - this.lastShootTime >= this.shootCooldownTime) {
            this.lastShootTime = currentTime;
            this.shootCooldown = this.shootCooldownTime;
            
            // 触发射击回调
            if (this.shootCallbacks) {
                this.shootCallbacks.forEach(callback => callback());
            }
        }
    }
    
    /**
     * 检查是否可以射击
     * @returns {boolean} 是否可以射击
     */
    canShoot() {
        const currentTime = Date.now();
        return currentTime - this.lastShootTime >= this.shootCooldownTime;
    }
    
    /**
     * 检查射击键是否被按下
     * @returns {boolean} 射击键是否被按下
     */
    isShootKeyPressed() {
        return this.isKeyPressed(81); // Q键
    }
    
    /**
     * 注册射击事件回调
     * @param {Function} callback - 射击回调函数
     */
    onShoot(callback) {
        if (!this.shootCallbacks) {
            this.shootCallbacks = [];
        }
        this.shootCallbacks.push(callback);
    }
    
    /**
     * 获取射击冷却剩余时间
     * @returns {number} 剩余冷却时间（毫秒）
     */
    getShootCooldownRemaining() {
        const currentTime = Date.now();
        const remaining = this.shootCooldownTime - (currentTime - this.lastShootTime);
        return Math.max(0, remaining);
    }
    
    /**
     * 设置射击冷却时间
     * @param {number} cooldownTime - 冷却时间（毫秒）
     */
    setShootCooldown(cooldownTime) {
        this.shootCooldownTime = cooldownTime;
    }
}