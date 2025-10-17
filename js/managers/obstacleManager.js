/**
 * 障碍物管理器
 */
class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.floatingObstacles = [];
        this.lastSpawnTime = 0;
        this.lastFloatingSpawnTime = 0;
        this.spawnInterval = GameConfig.OBSTACLE_SPAWN_INTERVAL;
        this.floatingSpawnInterval = GameConfig.FLOATING_OBSTACLE_SPAWN_INTERVAL;
        this.nextSpawnTime = this.spawnInterval;
        this.nextFloatingSpawnTime = this.floatingSpawnInterval;
        
        // 地面障碍物类型权重（用于随机生成）
        this.obstacleTypes = [
            { type: 'basic', weight: 0.6 },
            { type: 'tall', weight: 0.25 },
            { type: 'wide', weight: 0.15 }
        ];
        
        // 漂浮障碍物类型权重
        this.floatingObstacleTypes = [
            { type: 'floating', weight: 0.8 },
            { type: 'floating_large', weight: 0.2 }
        ];
    }
    
    /**
     * 更新障碍物管理器
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        // 更新地面障碍物生成计时器
        this.lastSpawnTime += deltaTime * 1000; // 转换为毫秒
        
        // 更新漂浮障碍物生成计时器
        this.lastFloatingSpawnTime += deltaTime * 1000;
        
        // 检查是否需要生成新地面障碍物
        if (this.lastSpawnTime >= this.nextSpawnTime) {
            this.spawnObstacle();
            this.resetSpawnTimer();
        }
        
        // 检查是否需要生成新漂浮障碍物
        if (this.lastFloatingSpawnTime >= this.nextFloatingSpawnTime) {
            this.spawnFloatingObstacle();
            this.resetFloatingSpawnTimer();
        }
        
        // 更新所有地面障碍物
        this.obstacles.forEach(obstacle => {
            obstacle.update(deltaTime);
        });
        
        // 更新所有漂浮障碍物
        this.floatingObstacles.forEach(obstacle => {
            obstacle.update(deltaTime);
        });
        
        // 移除屏幕外的障碍物
        this.removeOffscreenObstacles();
    }
    
    /**
     * 生成新障碍物
     */
    spawnObstacle() {
        // 检查是否有足够的间距
        if (!this.canSpawnObstacle()) {
            return;
        }
        
        // 随机选择障碍物类型
        const obstacleType = this.getRandomObstacleType();
        
        // 在屏幕右侧生成障碍物
        const x = GameConfig.CANVAS_WIDTH;
        const y = GameConfig.GROUND_Y; // Obstacle构造函数会自动调整y位置
        
        // 尝试从对象池获取障碍物
        let obstacle = null;
        if (window.objectPoolManager) {
            obstacle = objectPoolManager.get('obstacles');
        }
        
        if (obstacle) {
            // 重新初始化池中的障碍物
            obstacle.x = x;
            obstacle.y = y - obstacle.height;
            obstacle.type = obstacleType;
            obstacle.active = true;
            obstacle.velocityX = -GameConfig.OBSTACLE_SPEED;
            obstacle.velocityY = 0;
        } else {
            // 如果池中没有可用对象，创建新的
            obstacle = new Obstacle(x, y, obstacleType);
        }
        
        this.obstacles.push(obstacle);
        
        if (GameConfig.DEBUG) {
            console.log(`生成障碍物: 类型=${obstacleType}, 位置=(${x}, ${y}), 来源=${obstacle.pooled ? '对象池' : '新创建'}`);
        }
    }
    
    /**
     * 检查是否可以生成新障碍物（确保间距）
     * @returns {boolean} 是否可以生成
     */
    canSpawnObstacle() {
        if (this.obstacles.length === 0) {
            return true;
        }
        
        // 找到最右侧的障碍物
        const rightmostObstacle = this.obstacles.reduce((rightmost, current) => {
            return current.x > rightmost.x ? current : rightmost;
        });
        
        // 检查与最右侧障碍物的距离
        const distance = GameConfig.CANVAS_WIDTH - (rightmostObstacle.x + rightmostObstacle.width);
        return distance >= GameConfig.OBSTACLE.MIN_GAP;
    }
    
    /**
     * 根据权重随机选择障碍物类型
     * @returns {string} 障碍物类型
     */
    getRandomObstacleType() {
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (const obstacleType of this.obstacleTypes) {
            cumulativeWeight += obstacleType.weight;
            if (random <= cumulativeWeight) {
                return obstacleType.type;
            }
        }
        
        // 默认返回基础类型
        return 'basic';
    }
    
    /**
     * 生成漂浮障碍物
     */
    spawnFloatingObstacle() {
        // 检查是否有足够的间距
        if (!this.canSpawnFloatingObstacle()) {
            return;
        }
        
        // 随机选择漂浮障碍物类型
        const obstacleType = this.getRandomFloatingObstacleType();
        
        // 在屏幕右侧随机高度生成漂浮障碍物
        const x = GameConfig.CANVAS_WIDTH;
        const y = GameConfig.FLOATING_OBSTACLE_MIN_Y + 
                 Math.random() * (GameConfig.FLOATING_OBSTACLE_MAX_Y - GameConfig.FLOATING_OBSTACLE_MIN_Y);
        
        // 尝试从对象池获取障碍物
        let obstacle = null;
        if (window.objectPoolManager) {
            obstacle = objectPoolManager.get('floatingObstacles');
        }
        
        if (obstacle) {
            // 重新初始化池中的障碍物
            obstacle.x = x;
            obstacle.y = y;
            obstacle.originalY = y;
            obstacle.type = obstacleType;
            obstacle.active = true;
            obstacle.velocityX = -GameConfig.OBSTACLE_SPEED;
            obstacle.velocityY = 0;
            obstacle.setupObstacleType(obstacleType);
        } else {
            // 如果池中没有可用对象，创建新的
            obstacle = new Obstacle(x, y, obstacleType);
        }
        
        this.floatingObstacles.push(obstacle);
        
        if (GameConfig.DEBUG) {
            console.log(`生成漂浮障碍物: 类型=${obstacleType}, 位置=(${x}, ${y}), 来源=${obstacle.pooled ? '对象池' : '新创建'}`);
        }
    }
    
    /**
     * 检查是否可以生成新漂浮障碍物（确保间距）
     * @returns {boolean} 是否可以生成
     */
    canSpawnFloatingObstacle() {
        if (this.floatingObstacles.length === 0) {
            return true;
        }
        
        // 找到最右侧的漂浮障碍物
        const rightmostObstacle = this.floatingObstacles.reduce((rightmost, current) => {
            return current.x > rightmost.x ? current : rightmost;
        });
        
        // 检查与最右侧漂浮障碍物的距离
        const distance = GameConfig.CANVAS_WIDTH - (rightmostObstacle.x + rightmostObstacle.width);
        return distance >= GameConfig.OBSTACLE.MIN_GAP;
    }
    
    /**
     * 根据权重随机选择漂浮障碍物类型
     * @returns {string} 漂浮障碍物类型
     */
    getRandomFloatingObstacleType() {
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (const obstacleType of this.floatingObstacleTypes) {
            cumulativeWeight += obstacleType.weight;
            if (random <= cumulativeWeight) {
                return obstacleType.type;
            }
        }
        
        // 默认返回基础漂浮类型
        return 'floating';
    }
    
    /**
     * 重置生成计时器
     */
    resetSpawnTimer() {
        this.lastSpawnTime = 0;
        
        // 随机化下次生成间隔（增加游戏变化性）
        const minInterval = GameConfig.OBSTACLE_SPAWN_INTERVAL * 0.8;
        const maxInterval = GameConfig.OBSTACLE_SPAWN_INTERVAL * 1.2;
        this.nextSpawnTime = Utils.random(minInterval, maxInterval);
    }
    
    /**
     * 重置漂浮障碍物生成计时器
     */
    resetFloatingSpawnTimer() {
        this.lastFloatingSpawnTime = 0;
        
        // 随机化下次漂浮障碍物生成间隔
        const minInterval = GameConfig.FLOATING_OBSTACLE_SPAWN_INTERVAL * 0.7;
        const maxInterval = GameConfig.FLOATING_OBSTACLE_SPAWN_INTERVAL * 1.3;
        this.nextFloatingSpawnTime = Utils.random(minInterval, maxInterval);
    }
    
    /**
     * 移除屏幕外的障碍物
     */
    removeOffscreenObstacles() {
        const initialGroundCount = this.obstacles.length;
        const initialFloatingCount = this.floatingObstacles.length;
        
        // 移除屏幕外的地面障碍物
        const groundToRemove = [];
        this.obstacles = this.obstacles.filter(obstacle => {
            if (!obstacle.active || obstacle.isOffscreenLeft()) {
                groundToRemove.push(obstacle);
                return false;
            }
            return true;
        });
        
        // 移除屏幕外的漂浮障碍物
        const floatingToRemove = [];
        this.floatingObstacles = this.floatingObstacles.filter(obstacle => {
            if (!obstacle.active || obstacle.isOffscreenLeft()) {
                floatingToRemove.push(obstacle);
                return false;
            }
            return true;
        });
        
        // 将移除的障碍物释放到对象池
        if (window.objectPoolManager) {
            groundToRemove.forEach(obstacle => {
                objectPoolManager.release('obstacles', obstacle);
            });
            floatingToRemove.forEach(obstacle => {
                objectPoolManager.release('floatingObstacles', obstacle);
            });
        }
        
        const removedGroundCount = initialGroundCount - this.obstacles.length;
        const removedFloatingCount = initialFloatingCount - this.floatingObstacles.length;
        
        if ((removedGroundCount > 0 || removedFloatingCount > 0) && GameConfig.DEBUG) {
            console.log(`移除了 ${removedGroundCount} 个地面障碍物，${removedFloatingCount} 个漂浮障碍物，已释放到对象池`);
        }
    }
    
    /**
     * 移除指定的障碍物（用于被子弹击中时）
     * @param {Obstacle} obstacle - 要移除的障碍物
     */
    removeObstacle(obstacle) {
        // 从地面障碍物中移除
        const groundIndex = this.obstacles.indexOf(obstacle);
        if (groundIndex !== -1) {
            this.obstacles.splice(groundIndex, 1);
            if (window.objectPoolManager) {
                objectPoolManager.release('obstacles', obstacle);
            }
            return;
        }
        
        // 从漂浮障碍物中移除
        const floatingIndex = this.floatingObstacles.indexOf(obstacle);
        if (floatingIndex !== -1) {
            this.floatingObstacles.splice(floatingIndex, 1);
            if (window.objectPoolManager) {
                objectPoolManager.release('floatingObstacles', obstacle);
            }
        }
    }
    
    /**
     * 获取所有活跃的地面障碍物
     * @returns {Array} 地面障碍物数组
     */
    getObstacles() {
        return this.obstacles.filter(obstacle => obstacle.active);
    }
    
    /**
     * 获取所有活跃的漂浮障碍物
     * @returns {Array} 漂浮障碍物数组
     */
    getFloatingObstacles() {
        return this.floatingObstacles.filter(obstacle => obstacle.active);
    }
    
    /**
     * 获取所有活跃的障碍物（地面+漂浮）
     * @returns {Array} 所有障碍物数组
     */
    getAllObstacles() {
        return [...this.getObstacles(), ...this.getFloatingObstacles()];
    }
    
    /**
     * 清除所有障碍物
     */
    clearAllObstacles() {
        // 将所有地面障碍物释放到对象池
        if (window.objectPoolManager) {
            this.obstacles.forEach(obstacle => {
                objectPoolManager.release('obstacles', obstacle);
            });
            this.floatingObstacles.forEach(obstacle => {
                objectPoolManager.release('floatingObstacles', obstacle);
            });
        }
        
        this.obstacles = [];
        this.floatingObstacles = [];
        this.lastSpawnTime = 0;
        this.lastFloatingSpawnTime = 0;
        this.nextSpawnTime = this.spawnInterval;
        this.nextFloatingSpawnTime = this.floatingSpawnInterval;
    }
    
    /**
     * 获取障碍物数量统计
     * @returns {Object} 统计信息
     */
    getStats() {
        const activeGroundObstacles = this.getObstacles();
        const activeFloatingObstacles = this.getFloatingObstacles();
        const allActiveObstacles = [...activeGroundObstacles, ...activeFloatingObstacles];
        
        return {
            total: this.obstacles.length + this.floatingObstacles.length,
            active: allActiveObstacles.length,
            ground: {
                total: this.obstacles.length,
                active: activeGroundObstacles.length,
                types: {
                    basic: activeGroundObstacles.filter(o => o.type === 'basic').length,
                    tall: activeGroundObstacles.filter(o => o.type === 'tall').length,
                    wide: activeGroundObstacles.filter(o => o.type === 'wide').length
                }
            },
            floating: {
                total: this.floatingObstacles.length,
                active: activeFloatingObstacles.length,
                types: {
                    floating: activeFloatingObstacles.filter(o => o.type === 'floating').length,
                    floating_large: activeFloatingObstacles.filter(o => o.type === 'floating_large').length
                }
            }
        };
    }
    
    /**
     * 渲染所有障碍物
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        // 渲染地面障碍物
        this.getObstacles().forEach(obstacle => {
            obstacle.render(renderer);
        });
        
        // 渲染漂浮障碍物
        this.getFloatingObstacles().forEach(obstacle => {
            obstacle.render(renderer);
        });
        
        // 调试模式下显示统计信息
        if (GameConfig.DEBUG) {
            const stats = this.getStats();
            renderer.drawText(
                `地面障碍物: ${stats.ground.active} (基础:${stats.ground.types.basic}, 高:${stats.ground.types.tall}, 宽:${stats.ground.types.wide})`,
                10, 60, '#ffffff'
            );
            renderer.drawText(
                `漂浮障碍物: ${stats.floating.active} (普通:${stats.floating.types.floating}, 大型:${stats.floating.types.floating_large})`,
                10, 80, '#ffffff'
            );
        }
    }
}