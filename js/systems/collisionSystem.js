/**
 * 碰撞检测系统
 * 专门处理游戏中的碰撞检测逻辑
 */
class CollisionSystem {
    constructor() {
        this.physicsSystem = new PhysicsSystem();
        this.collisionCallbacks = new Map();
        this.collisionHistory = [];
        this.maxHistorySize = 100;
        
        // 性能统计
        this.stats = {
            totalChecks: 0,
            collisionsDetected: 0,
            lastFrameChecks: 0
        };
    }
    
    /**
     * 检查玩家与障碍物的碰撞
     * @param {Player} player - 玩家对象
     * @param {Obstacle[]} obstacles - 障碍物数组
     * @returns {Object|null} 碰撞信息或null
     */
    checkPlayerObstacleCollisions(player, obstacles) {
        if (!player || !player.active) return null;
        
        const collision = this.physicsSystem.checkPlayerObstacleCollision(player, obstacles);
        
        if (collision) {
            this.stats.collisionsDetected++;
            this.recordCollision(collision);
            this.triggerCollisionCallback('player-obstacle', collision);
        }
        
        return collision;
    }
    
    /**
     * 检查所有实体间的碰撞
     * @param {Entity[]} entities - 实体数组
     * @returns {Object[]} 碰撞信息数组
     */
    checkAllCollisions(entities) {
        const activeEntities = entities.filter(entity => entity.active);
        const collisions = this.physicsSystem.checkCollisionsWithSpatialPartitioning(activeEntities);
        
        this.stats.totalChecks += this.physicsSystem.getCollisionStats().collisionChecks;
        
        // 处理每个碰撞
        collisions.forEach(collision => {
            this.stats.collisionsDetected++;
            this.recordCollision(collision);
            this.triggerCollisionCallback('entity-entity', collision);
        });
        
        return collisions;
    }
    
    /**
     * 注册碰撞回调函数
     * @param {string} type - 碰撞类型 ('player-obstacle', 'entity-entity')
     * @param {Function} callback - 回调函数
     */
    registerCollisionCallback(type, callback) {
        if (!this.collisionCallbacks.has(type)) {
            this.collisionCallbacks.set(type, []);
        }
        this.collisionCallbacks.get(type).push(callback);
    }
    
    /**
     * 移除碰撞回调函数
     * @param {string} type - 碰撞类型
     * @param {Function} callback - 要移除的回调函数
     */
    removeCollisionCallback(type, callback) {
        if (this.collisionCallbacks.has(type)) {
            const callbacks = this.collisionCallbacks.get(type);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * 触发碰撞回调
     * @param {string} type - 碰撞类型
     * @param {Object} collision - 碰撞信息
     */
    triggerCollisionCallback(type, collision) {
        if (this.collisionCallbacks.has(type)) {
            this.collisionCallbacks.get(type).forEach(callback => {
                try {
                    callback(collision);
                } catch (error) {
                    console.error(`碰撞回调执行错误 (${type}):`, error);
                }
            });
        }
    }
    
    /**
     * 记录碰撞历史
     * @param {Object} collision - 碰撞信息
     */
    recordCollision(collision) {
        const collisionRecord = {
            timestamp: performance.now(),
            collision: collision
        };
        
        this.collisionHistory.push(collisionRecord);
        
        // 限制历史记录大小
        if (this.collisionHistory.length > this.maxHistorySize) {
            this.collisionHistory.shift();
        }
    }
    
    /**
     * 检查特定实体是否与任何其他实体碰撞
     * @param {Entity} entity - 要检查的实体
     * @param {Entity[]} others - 其他实体数组
     * @returns {Entity[]} 碰撞的实体数组
     */
    getCollidingEntities(entity, others) {
        const collidingEntities = [];
        
        for (const other of others) {
            if (other === entity || !other.active) continue;
            
            if (this.physicsSystem.checkRectangleCollision(
                entity.getBounds(), 
                other.getBounds()
            )) {
                collidingEntities.push(other);
            }
        }
        
        return collidingEntities;
    }
    
    /**
     * 检查点是否在实体内
     * @param {number} x - 点的x坐标
     * @param {number} y - 点的y坐标
     * @param {Entity} entity - 实体
     * @returns {boolean} 是否在实体内
     */
    isPointInEntity(x, y, entity) {
        const bounds = entity.getBounds();
        return x >= bounds.x && 
               x <= bounds.x + bounds.width &&
               y >= bounds.y && 
               y <= bounds.y + bounds.height;
    }
    
    /**
     * 获取两个实体之间的距离
     * @param {Entity} entity1 - 第一个实体
     * @param {Entity} entity2 - 第二个实体
     * @returns {number} 距离
     */
    getDistanceBetweenEntities(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();
        
        const centerX1 = bounds1.x + bounds1.width / 2;
        const centerY1 = bounds1.y + bounds1.height / 2;
        const centerX2 = bounds2.x + bounds2.width / 2;
        const centerY2 = bounds2.y + bounds2.height / 2;
        
        return Utils.distance(centerX1, centerY1, centerX2, centerY2);
    }
    
    /**
     * 预测碰撞（基于当前速度）
     * @param {Entity} entity1 - 第一个实体
     * @param {Entity} entity2 - 第二个实体
     * @param {number} deltaTime - 时间增量
     * @returns {boolean} 是否会碰撞
     */
    predictCollision(entity1, entity2, deltaTime) {
        // 计算下一帧的位置
        const nextBounds1 = {
            x: entity1.x + entity1.velocityX * deltaTime,
            y: entity1.y + entity1.velocityY * deltaTime,
            width: entity1.width,
            height: entity1.height
        };
        
        const nextBounds2 = {
            x: entity2.x + entity2.velocityX * deltaTime,
            y: entity2.y + entity2.velocityY * deltaTime,
            width: entity2.width,
            height: entity2.height
        };
        
        return this.physicsSystem.checkRectangleCollision(nextBounds1, nextBounds2);
    }
    
    /**
     * 更新碰撞系统（每帧调用）
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        // 重置每帧统计
        this.stats.lastFrameChecks = this.physicsSystem.getCollisionStats().collisionChecks;
        this.physicsSystem.resetCollisionStats();
        
        // 清理过期的碰撞历史
        const currentTime = performance.now();
        const maxAge = 5000; // 5秒
        this.collisionHistory = this.collisionHistory.filter(
            record => currentTime - record.timestamp < maxAge
        );
    }
    
    /**
     * 获取碰撞系统统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            ...this.stats,
            historySize: this.collisionHistory.length,
            callbackTypes: Array.from(this.collisionCallbacks.keys()),
            physicsStats: this.physicsSystem.getCollisionStats()
        };
    }
    
    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            totalChecks: 0,
            collisionsDetected: 0,
            lastFrameChecks: 0
        };
        this.physicsSystem.resetCollisionStats();
    }
    
    /**
     * 获取最近的碰撞历史
     * @param {number} count - 获取的数量
     * @returns {Array} 碰撞历史数组
     */
    getRecentCollisions(count = 10) {
        return this.collisionHistory
            .slice(-count)
            .map(record => record.collision);
    }
    
    /**
     * 清除所有碰撞历史
     */
    clearHistory() {
        this.collisionHistory = [];
    }
    
    /**
     * 渲染碰撞调试信息
     * @param {Renderer} renderer - 渲染器
     */
    renderDebugInfo(renderer) {
        if (!GameConfig.DEBUG) return;
        
        const stats = this.getStats();
        let y = 100;
        const lineHeight = 16;
        
        renderer.drawText(`碰撞检测统计:`, 10, y, '#ffffff', '14px Arial');
        y += lineHeight;
        
        renderer.drawText(`总检测次数: ${stats.totalChecks}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        renderer.drawText(`检测到碰撞: ${stats.collisionsDetected}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        renderer.drawText(`上帧检测: ${stats.lastFrameChecks}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        renderer.drawText(`历史记录: ${stats.historySize}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        // 显示最近的碰撞
        const recentCollisions = this.getRecentCollisions(3);
        if (recentCollisions.length > 0) {
            renderer.drawText(`最近碰撞:`, 10, y, '#ffff00', '12px Arial');
            y += lineHeight;
            
            recentCollisions.forEach((collision, index) => {
                const info = collision.player ? 
                    `玩家-障碍物 @ (${Math.round(collision.collisionPoint.x)}, ${Math.round(collision.collisionPoint.y)})` :
                    `实体碰撞 @ (${Math.round(collision.collisionPoint.x)}, ${Math.round(collision.collisionPoint.y)})`;
                
                renderer.drawText(`  ${index + 1}. ${info}`, 10, y, '#ffff00', '10px Arial');
                y += lineHeight;
            });
        }
    }
}