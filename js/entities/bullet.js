/**
 * 子弹实体类
 */
class Bullet extends Entity {
    constructor(x, y, direction = 1) {
        super(x, y, GameConfig.BULLET_WIDTH, GameConfig.BULLET_HEIGHT);
        
        // 子弹移动方向 (1 = 向右, -1 = 向左)
        this.direction = direction;
        
        // 设置子弹速度
        this.speed = GameConfig.BULLET_SPEED;
        this.velocityX = this.speed * this.direction;
        this.velocityY = 0; // 子弹水平飞行
        
        // 子弹属性
        this.damage = 1;
        this.maxDistance = GameConfig.CANVAS_WIDTH + 100; // 最大飞行距离
        this.traveledDistance = 0; // 已飞行距离
        
        // 生命周期管理
        this.lifeTime = 0; // 存在时间
        this.maxLifeTime = 3.0; // 最大存在时间（秒）
        
        // 视觉效果
        this.trailPositions = []; // 拖尾效果位置记录
        this.maxTrailLength = 5; // 最大拖尾长度
        
        // 记录初始位置用于距离计算
        this.startX = x;
        this.startY = y;
    }
    
    /**
     * 更新子弹状态
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        // 更新生命周期
        this.lifeTime += deltaTime;
        
        // 检查是否超过最大生命时间
        if (this.lifeTime >= this.maxLifeTime) {
            this.destroy();
            return;
        }
        
        // 记录当前位置用于拖尾效果
        this.updateTrail();
        
        // 调用父类更新方法处理基础物理移动
        super.update(deltaTime);
        
        // 计算已飞行距离
        this.traveledDistance = Math.abs(this.x - this.startX);
        
        // 检查是否超过最大飞行距离
        if (this.traveledDistance >= this.maxDistance) {
            this.destroy();
            return;
        }
        
        // 检查是否飞出屏幕边界
        if (this.isOffScreen()) {
            this.destroy();
        }
    }
    
    /**
     * 更新拖尾效果
     */
    updateTrail() {
        // 添加当前位置到拖尾数组
        this.trailPositions.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            time: this.lifeTime
        });
        
        // 限制拖尾长度
        if (this.trailPositions.length > this.maxTrailLength) {
            this.trailPositions.shift();
        }
    }
    
    /**
     * 检查子弹是否飞出屏幕
     * @returns {boolean} 是否在屏幕外
     */
    isOffScreen() {
        return this.x + this.width < 0 || 
               this.x > GameConfig.CANVAS_WIDTH ||
               this.y + this.height < 0 || 
               this.y > GameConfig.CANVAS_HEIGHT;
    }
    
    /**
     * 获取子弹的碰撞边界
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
     * 获取子弹伤害值
     * @returns {number} 伤害值
     */
    getDamage() {
        return this.damage;
    }
    
    /**
     * 获取子弹飞行信息
     * @returns {Object} 飞行信息
     */
    getFlightInfo() {
        return {
            direction: this.direction,
            speed: this.speed,
            traveledDistance: this.traveledDistance,
            maxDistance: this.maxDistance,
            lifeTime: this.lifeTime,
            maxLifeTime: this.maxLifeTime,
            progress: this.traveledDistance / this.maxDistance
        };
    }
    
    /**
     * 检查子弹是否即将到达生命周期末尾
     * @returns {boolean} 是否即将消失
     */
    isNearEndOfLife() {
        return this.lifeTime >= this.maxLifeTime * 0.8;
    }
    
    /**
     * 设置子弹伤害值
     * @param {number} damage - 新的伤害值
     */
    setDamage(damage) {
        this.damage = Math.max(0, damage);
    }
    
    /**
     * 设置子弹最大飞行距离
     * @param {number} distance - 最大飞行距离
     */
    setMaxDistance(distance) {
        this.maxDistance = Math.max(0, distance);
    }
    
    /**
     * 渲染子弹
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        // 渲染拖尾效果
        this.renderTrail(renderer);
        
        // 渲染子弹主体
        this.renderBulletBody(renderer);
        
        // 调试模式下显示额外信息
        if (GameConfig.DEBUG) {
            this.renderDebugInfo(renderer);
        }
    }
    
    /**
     * 渲染拖尾效果
     * @param {Renderer} renderer - 渲染器
     */
    renderTrail(renderer) {
        if (this.trailPositions.length < 2) return;
        
        // 绘制拖尾
        for (let i = 0; i < this.trailPositions.length - 1; i++) {
            const pos = this.trailPositions[i];
            const alpha = (i + 1) / this.trailPositions.length * 0.6; // 渐变透明度
            const size = (i + 1) / this.trailPositions.length * 2; // 渐变大小
            
            renderer.setGlobalAlpha(alpha);
            renderer.drawCircle(pos.x, pos.y, size, '#ffff00');
            renderer.resetGlobalAlpha();
        }
    }
    
    /**
     * 渲染子弹主体
     * @param {Renderer} renderer - 渲染器
     */
    renderBulletBody(renderer) {
        // 子弹主体颜色
        let bulletColor = '#ffff00'; // 黄色
        
        // 根据生命周期调整颜色
        if (this.isNearEndOfLife()) {
            // 接近消失时闪烁效果
            const flashIntensity = Math.sin(this.lifeTime * 20) * 0.5 + 0.5;
            bulletColor = `rgba(255, 255, 0, ${0.5 + flashIntensity * 0.5})`;
        }
        
        // 绘制子弹主体 - 椭圆形状
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 子弹核心
        renderer.fillRect(this.x, this.y, this.width, this.height, bulletColor);
        
        // 子弹高光效果
        renderer.fillRect(
            this.x + 1, 
            this.y + 1, 
            this.width - 2, 
            1, 
            '#ffffff'
        );
        
        // 子弹尖端效果（根据方向）
        if (this.direction > 0) {
            // 向右飞行的子弹尖端
            renderer.fillRect(
                this.x + this.width, 
                this.y + this.height / 2 - 1, 
                2, 
                2, 
                bulletColor
            );
        } else {
            // 向左飞行的子弹尖端
            renderer.fillRect(
                this.x - 2, 
                this.y + this.height / 2 - 1, 
                2, 
                2, 
                bulletColor
            );
        }
        
        // 发光效果
        renderer.setGlobalAlpha(0.3);
        renderer.drawRect(
            this.x - 1, 
            this.y - 1, 
            this.width + 2, 
            this.height + 2, 
            '#ffff88'
        );
        renderer.resetGlobalAlpha();
    }
    
    /**
     * 渲染调试信息
     * @param {Renderer} renderer - 渲染器
     */
    renderDebugInfo(renderer) {
        const flightInfo = this.getFlightInfo();
        
        // 显示子弹边界
        renderer.drawRect(this.x, this.y, this.width, this.height, 'rgba(255, 0, 0, 0.5)');
        
        // 显示飞行信息
        renderer.drawText(
            `D:${Math.round(flightInfo.traveledDistance)}/${flightInfo.maxDistance}`,
            this.x,
            this.y - 15,
            '#ffffff',
            '10px Arial'
        );
        
        renderer.drawText(
            `T:${flightInfo.lifeTime.toFixed(1)}s`,
            this.x,
            this.y - 5,
            '#ffffff',
            '10px Arial'
        );
        
        // 显示速度向量
        const arrowEndX = this.x + this.velocityX * 0.1;
        const arrowEndY = this.y + this.velocityY * 0.1;
        
        renderer.drawLine(
            this.x + this.width / 2,
            this.y + this.height / 2,
            arrowEndX,
            arrowEndY,
            '#00ff00',
            2
        );
    }
}