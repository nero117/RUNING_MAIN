/**
 * 障碍物类
 */
class Obstacle extends Entity {
    constructor(x, y, type = 'basic') {
        super(x, y, GameConfig.OBSTACLE.WIDTH, GameConfig.OBSTACLE.HEIGHT);
        this.type = type;
        this.speed = GameConfig.OBSTACLE_SPEED;
        
        // 设置初始速度 - 向左移动
        this.velocityX = -this.speed;
        
        // 漂浮障碍物特有属性
        this.canBeShot = false;
        this.health = Infinity;
        this.floatingAmplitude = 0;
        this.floatingFrequency = 0;
        this.floatingOffset = 0;
        this.originalY = y;
        
        // 根据类型设置不同属性
        this.setupObstacleType(type);
    }
    
    /**
     * 根据障碍物类型设置属性
     * @param {string} type - 障碍物类型
     */
    setupObstacleType(type) {
        switch (type) {
            case 'basic':
                // 基础地面障碍物 - 默认设置
                this.canBeShot = false;
                this.health = Infinity;
                break;
            case 'tall':
                // 高地面障碍物
                this.height = GameConfig.OBSTACLE.HEIGHT * 1.5;
                this.canBeShot = false;
                this.health = Infinity;
                break;
            case 'wide':
                // 宽地面障碍物
                this.width = GameConfig.OBSTACLE.WIDTH * 1.5;
                this.canBeShot = false;
                this.health = Infinity;
                break;
            case 'floating':
                // 漂浮障碍物 - 可被射击
                this.canBeShot = true;
                this.health = 1;
                this.setupFloatingMovement();
                break;
            case 'floating_large':
                // 大型漂浮障碍物
                this.width = GameConfig.OBSTACLE.WIDTH * 1.2;
                this.height = GameConfig.OBSTACLE.HEIGHT * 1.2;
                this.canBeShot = true;
                this.health = 2;
                this.setupFloatingMovement();
                break;
            default:
                // 默认为基础障碍物
                this.canBeShot = false;
                this.health = Infinity;
                break;
        }
        
        // 地面障碍物确保在地面上，漂浮障碍物保持原始Y位置
        if (!this.isFloating()) {
            this.y = GameConfig.GROUND_Y - this.height;
        } else {
            this.originalY = this.y;
        }
    }
    
    /**
     * 设置漂浮障碍物的移动模式
     */
    setupFloatingMovement() {
        // 随机设置漂浮参数
        this.floatingAmplitude = 20 + Math.random() * 30; // 漂浮幅度 20-50像素
        this.floatingFrequency = 1 + Math.random() * 2;   // 漂浮频率 1-3Hz
        this.floatingOffset = Math.random() * Math.PI * 2; // 随机相位偏移
    }
    
    /**
     * 检查是否为漂浮类型障碍物
     * @returns {boolean} 是否为漂浮障碍物
     */
    isFloating() {
        return this.type === 'floating' || this.type === 'floating_large';
    }
    
    /**
     * 更新障碍物状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        // 调用父类更新方法处理基础物理
        super.update(deltaTime);
        
        // 漂浮障碍物的独立移动轨迹
        if (this.isFloating()) {
            this.updateFloatingMovement(deltaTime);
        }
        
        // 检查是否移出屏幕左侧
        if (this.isOffscreenLeft()) {
            this.destroy();
        }
    }
    
    /**
     * 更新漂浮障碍物的移动轨迹
     * @param {number} deltaTime - 时间增量
     */
    updateFloatingMovement(deltaTime) {
        // 更新漂浮时间偏移
        this.floatingOffset += this.floatingFrequency * deltaTime;
        
        // 计算垂直漂浮位置
        const floatingY = Math.sin(this.floatingOffset) * this.floatingAmplitude;
        this.y = this.originalY + floatingY;
        
        // 确保漂浮障碍物不会超出屏幕边界
        const minY = 50;
        const maxY = GameConfig.GROUND_Y - this.height - 50;
        this.y = Math.max(minY, Math.min(maxY, this.y));
    }
    
    /**
     * 处理被子弹击中
     * @returns {boolean} 是否被摧毁
     */
    takeDamage() {
        if (!this.canBeShot) {
            return false;
        }
        
        this.health--;
        
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        
        return false;
    }
    
    /**
     * 检查障碍物是否移出屏幕左侧
     * @returns {boolean} 是否在屏幕左侧外
     */
    isOffscreenLeft() {
        return this.x + this.width < 0;
    }
    
    /**
     * 检查障碍物是否完全在屏幕右侧外
     * @returns {boolean} 是否在屏幕右侧外
     */
    isOffscreenRight() {
        return this.x > GameConfig.CANVAS_WIDTH;
    }
    
    /**
     * 获取障碍物的碰撞边界
     * @returns {Object} 边界矩形 {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * 渲染障碍物
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        // 根据类型使用不同颜色
        let color = '#e74c3c'; // 默认红色
        
        switch (this.type) {
            case 'basic':
                color = '#e74c3c'; // 红色
                break;
            case 'tall':
                color = '#c0392b'; // 深红色
                break;
            case 'wide':
                color = '#e67e22'; // 橙色
                break;
            case 'floating':
                color = '#9b59b6'; // 紫色 - 漂浮障碍物
                break;
            case 'floating_large':
                color = '#8e44ad'; // 深紫色 - 大型漂浮障碍物
                break;
        }
        
        renderer.drawRect(this.x, this.y, this.width, this.height, color);
        
        // 漂浮障碍物添加特殊效果
        if (this.isFloating()) {
            // 绘制发光边框效果
            renderer.drawRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2, 'rgba(155, 89, 182, 0.5)');
            
            // 显示生命值（如果大于1）
            if (this.health > 1) {
                renderer.drawText(
                    this.health.toString(),
                    this.x + this.width / 2 - 5,
                    this.y + this.height / 2 + 5,
                    '#ffffff',
                    '12px Arial'
                );
            }
        }
        
        // 调试模式下显示边界和信息
        if (GameConfig.DEBUG) {
            renderer.drawRect(this.x, this.y, this.width, this.height, 'rgba(255, 255, 0, 0.3)');
            
            // 显示障碍物信息
            renderer.drawText(
                `${this.type} HP:${this.health} Shot:${this.canBeShot}`,
                this.x,
                this.y - 5,
                '#ffffff',
                '10px Arial'
            );
        }
    }
}