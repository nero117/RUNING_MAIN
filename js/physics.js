/**
 * 物理系统
 */
class PhysicsSystem {
    constructor() {
        this.gravity = GameConfig.GRAVITY;
        
        // 碰撞检测优化参数
        this.spatialGrid = new Map(); // 空间分割网格
        this.gridSize = 64; // 网格大小
        this.collisionChecks = 0; // 碰撞检测次数统计
    }
    
    /**
     * 应用重力到实体
     * @param {Entity} entity - 实体对象
     * @param {number} deltaTime - 时间增量
     */
    applyGravity(entity, deltaTime) {
        // 只有在空中时才应用重力
        if (!this.checkGroundCollision(entity)) {
            entity.velocityY += this.gravity * deltaTime;
            entity.isGrounded = false;
        } else {
            // 在地面上时，确保垂直速度为0且位置正确
            if (entity.velocityY > 0) {
                entity.velocityY = 0;
                entity.y = GameConfig.GROUND_Y - entity.height;
                entity.isGrounded = true;
            }
        }
    }
    
    /**
     * 检查地面碰撞
     * @param {Entity} entity - 实体对象
     * @returns {boolean} 是否在地面上
     */
    checkGroundCollision(entity) {
        return entity.y + entity.height >= GameConfig.GROUND_Y;
    }
    
    /**
     * 应用跳跃力到实体
     * @param {Entity} entity - 实体对象
     * @param {number} jumpForce - 跳跃力（负值向上）
     */
    applyJumpForce(entity, jumpForce) {
        if (entity.isGrounded) {
            entity.velocityY = jumpForce;
            entity.isGrounded = false;
        }
    }
    
    /**
     * 更新实体的物理状态
     * @param {Entity} entity - 实体对象
     * @param {number} deltaTime - 时间增量
     */
    updatePhysics(entity, deltaTime) {
        // 应用重力
        this.applyGravity(entity, deltaTime);
        
        // 更新位置（这会在Entity.update中调用）
        // entity.x += entity.velocityX * deltaTime;
        // entity.y += entity.velocityY * deltaTime;
    }
    
    /**
     * 检查矩形碰撞（AABB碰撞检测）
     * @param {Object} rect1 - 第一个矩形 {x, y, width, height}
     * @param {Object} rect2 - 第二个矩形 {x, y, width, height}
     * @returns {boolean} 是否碰撞
     */
    checkRectangleCollision(rect1, rect2) {
        this.collisionChecks++;
        
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    /**
     * 检查玩家与障碍物的碰撞
     * @param {Player} player - 玩家对象
     * @param {Obstacle[]} obstacles - 障碍物数组
     * @returns {Object|null} 碰撞信息或null
     */
    checkPlayerObstacleCollision(player, obstacles) {
        const playerBounds = player.getBounds();
        
        // 优化：只检查可能碰撞的障碍物
        const nearbyObstacles = this.getNearbyObstacles(player, obstacles);
        
        for (const obstacle of nearbyObstacles) {
            if (!obstacle.active) continue;
            
            const obstacleBounds = obstacle.getBounds();
            
            if (this.checkRectangleCollision(playerBounds, obstacleBounds)) {
                return {
                    player: player,
                    obstacle: obstacle,
                    collisionPoint: this.getCollisionPoint(playerBounds, obstacleBounds),
                    collisionSide: this.getCollisionSide(playerBounds, obstacleBounds)
                };
            }
        }
        
        return null;
    }
    
    /**
     * 获取附近的障碍物（性能优化）
     * @param {Player} player - 玩家对象
     * @param {Obstacle[]} obstacles - 所有障碍物
     * @returns {Obstacle[]} 附近的障碍物
     */
    getNearbyObstacles(player, obstacles) {
        const checkDistance = 100; // 检查距离
        const playerCenterX = player.x + player.width / 2;
        
        return obstacles.filter(obstacle => {
            if (!obstacle.active) return false;
            
            const obstacleCenterX = obstacle.x + obstacle.width / 2;
            const distance = Math.abs(playerCenterX - obstacleCenterX);
            
            return distance <= checkDistance;
        });
    }
    
    /**
     * 获取碰撞点
     * @param {Object} rect1 - 第一个矩形
     * @param {Object} rect2 - 第二个矩形
     * @returns {Object} 碰撞点 {x, y}
     */
    getCollisionPoint(rect1, rect2) {
        const overlapLeft = (rect1.x + rect1.width) - rect2.x;
        const overlapRight = (rect2.x + rect2.width) - rect1.x;
        const overlapTop = (rect1.y + rect1.height) - rect2.y;
        const overlapBottom = (rect2.y + rect2.height) - rect1.y;
        
        // 找到最小重叠
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        let collisionX, collisionY;
        
        if (minOverlap === overlapLeft) {
            collisionX = rect2.x;
            collisionY = rect1.y + rect1.height / 2;
        } else if (minOverlap === overlapRight) {
            collisionX = rect2.x + rect2.width;
            collisionY = rect1.y + rect1.height / 2;
        } else if (minOverlap === overlapTop) {
            collisionX = rect1.x + rect1.width / 2;
            collisionY = rect2.y;
        } else {
            collisionX = rect1.x + rect1.width / 2;
            collisionY = rect2.y + rect2.height;
        }
        
        return { x: collisionX, y: collisionY };
    }
    
    /**
     * 获取碰撞方向
     * @param {Object} rect1 - 第一个矩形（通常是玩家）
     * @param {Object} rect2 - 第二个矩形（通常是障碍物）
     * @returns {string} 碰撞方向 ('left', 'right', 'top', 'bottom')
     */
    getCollisionSide(rect1, rect2) {
        const overlapLeft = (rect1.x + rect1.width) - rect2.x;
        const overlapRight = (rect2.x + rect2.width) - rect1.x;
        const overlapTop = (rect1.y + rect1.height) - rect2.y;
        const overlapBottom = (rect2.y + rect2.height) - rect1.y;
        
        // 找到最小重叠，这通常是碰撞的主要方向
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapLeft) return 'left';
        if (minOverlap === overlapRight) return 'right';
        if (minOverlap === overlapTop) return 'top';
        return 'bottom';
    }
    
    /**
     * 使用空间分割优化碰撞检测
     * @param {Entity[]} entities - 实体数组
     * @returns {Object[]} 碰撞对
     */
    checkCollisionsWithSpatialPartitioning(entities) {
        this.spatialGrid.clear();
        const collisions = [];
        
        // 将实体分配到网格中
        for (const entity of entities) {
            if (!entity.active) continue;
            
            const gridX = Math.floor(entity.x / this.gridSize);
            const gridY = Math.floor(entity.y / this.gridSize);
            const gridKey = `${gridX},${gridY}`;
            
            if (!this.spatialGrid.has(gridKey)) {
                this.spatialGrid.set(gridKey, []);
            }
            this.spatialGrid.get(gridKey).push(entity);
        }
        
        // 检查同一网格内的实体碰撞
        for (const [gridKey, gridEntities] of this.spatialGrid) {
            for (let i = 0; i < gridEntities.length; i++) {
                for (let j = i + 1; j < gridEntities.length; j++) {
                    const entity1 = gridEntities[i];
                    const entity2 = gridEntities[j];
                    
                    if (this.checkRectangleCollision(entity1.getBounds(), entity2.getBounds())) {
                        collisions.push({
                            entity1: entity1,
                            entity2: entity2,
                            collisionPoint: this.getCollisionPoint(entity1.getBounds(), entity2.getBounds())
                        });
                    }
                }
            }
        }
        
        return collisions;
    }
    
    /**
     * 高精度碰撞检测（用于重要碰撞）
     * @param {Object} rect1 - 第一个矩形
     * @param {Object} rect2 - 第二个矩形
     * @param {number} margin - 碰撞边距
     * @returns {boolean} 是否碰撞
     */
    checkPreciseCollision(rect1, rect2, margin = 0) {
        this.collisionChecks++;
        
        return rect1.x + margin < rect2.x + rect2.width - margin &&
               rect1.x + rect1.width - margin > rect2.x + margin &&
               rect1.y + margin < rect2.y + rect2.height - margin &&
               rect1.y + rect1.height - margin > rect2.y + margin;
    }
    
    /**
     * 获取碰撞检测统计信息
     * @returns {Object} 统计信息
     */
    getCollisionStats() {
        return {
            collisionChecks: this.collisionChecks,
            spatialGridSize: this.spatialGrid.size
        };
    }
    
    /**
     * 重置碰撞检测统计
     */
    resetCollisionStats() {
        this.collisionChecks = 0;
    }
}