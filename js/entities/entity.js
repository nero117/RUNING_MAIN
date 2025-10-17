/**
 * 基础实体类 - 所有游戏对象的基类
 */
class Entity {
    constructor(x = 0, y = 0, width = 32, height = 32) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.active = true;
    }
    
    /**
     * 更新实体状态
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        // 基础物理更新
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }
    
    /**
     * 渲染实体
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        // 基础渲染 - 绘制矩形
        renderer.drawRect(this.x, this.y, this.width, this.height, '#ffffff');
    }
    
    /**
     * 获取碰撞边界
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
     * 检查是否与另一个实体碰撞
     * @param {Entity} other - 另一个实体
     * @returns {boolean} 是否碰撞
     */
    collidesWith(other) {
        return Utils.checkCollision(this.getBounds(), other.getBounds());
    }
    
    /**
     * 检查是否与另一个实体碰撞（带边距）
     * @param {Entity} other - 另一个实体
     * @param {number} margin - 碰撞边距
     * @returns {boolean} 是否碰撞
     */
    collidesWithMargin(other, margin = 0) {
        return Utils.checkCollisionWithMargin(this.getBounds(), other.getBounds(), margin);
    }
    
    /**
     * 获取与另一个实体的重叠区域
     * @param {Entity} other - 另一个实体
     * @returns {Object|null} 重叠区域或null
     */
    getOverlapWith(other) {
        return Utils.getOverlapArea(this.getBounds(), other.getBounds());
    }
    
    /**
     * 销毁实体
     */
    destroy() {
        this.active = false;
    }
    
    /**
     * 检查实体是否在屏幕外
     * @returns {boolean} 是否在屏幕外
     */
    isOffscreen() {
        return this.x + this.width < 0 || 
               this.x > GameConfig.CANVAS_WIDTH ||
               this.y > GameConfig.CANVAS_HEIGHT;
    }
}