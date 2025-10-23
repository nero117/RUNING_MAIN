// 碰撞检测系统单元测试
console.log('🎯 启动碰撞检测系统单元测试...\n');

// 模拟浏览器环境
global.window = {
    performance: {
        now: () => Date.now()
    },
    shootingPerformanceMonitor: {
        startTimer: () => {},
        endTimer: () => {},
        recordCollisionMetrics: () => {}
    }
};

global.performance = global.window.performance;

// 模拟 GameConfig
global.GameConfig = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 400,
    GRAVITY: 980,
    JUMP_FORCE: -400,
    GROUND_Y: 350,
    DEBUG: false,
    PLAYER: {
        WIDTH: 32,
        HEIGHT: 48,
        CENTER_X: 400
    }
};

// 模拟 Utils 类
global.Utils = {
    distance: (x1, y1, x2, y2) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
};

// 模拟实体基类
class MockEntity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.active = true;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// 模拟玩家类
class MockPlayer extends MockEntity {
    constructor(x, y) {
        super(x, y, GameConfig.PLAYER.WIDTH, GameConfig.PLAYER.HEIGHT);
        this.isGrounded = true;
        this.isInvincible = false;
        this.invincibleTimeLeft = 0;
    }
    
    setInvincible(duration) {
        this.isInvincible = true;
        this.invincibleTimeLeft = duration;
    }
    
    isInvincible() {
        return this.isInvincible;
    }
    
    getInvincibleTimeLeft() {
        return this.invincibleTimeLeft;
    }
}

// 模拟子弹类
class MockBullet extends MockEntity {
    constructor(x, y) {
        super(x, y, 8, 4);
        this.damage = 1;
    }
    
    getDamage() {
        return this.damage;
    }
}

// 模拟障碍物类
class MockObstacle extends MockEntity {
    constructor(x, y, type = 'ground') {
        super(x, y, 32, 32);
        this.type = type;
        this.canBeShot = type === 'floating' || type === 'special';
    }
}

// 模拟物理系统
class MockPhysicsSystem {
    constructor() {
        this.collisionChecks = 0;
    }
    
    checkRectangleCollision(rect1, rect2) {
        this.collisionChecks++;
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    checkPlayerObstacleCollision(player, obstacles) {
        const playerBounds = player.getBounds();
        
        for (const obstacle of obstacles) {
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
    
    getCollisionPoint(rect1, rect2) {
        const overlapLeft = (rect1.x + rect1.width) - rect2.x;
        const overlapRight = (rect2.x + rect2.width) - rect1.x;
        const overlapTop = (rect1.y + rect1.height) - rect2.y;
        const overlapBottom = (rect2.y + rect2.height) - rect1.y;
        
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
    
    getCollisionSide(rect1, rect2) {
        const overlapLeft = (rect1.x + rect1.width) - rect2.x;
        const overlapRight = (rect2.x + rect2.width) - rect1.x;
        const overlapTop = (rect1.y + rect1.height) - rect2.y;
        const overlapBottom = (rect2.y + rect2.height) - rect1.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapLeft) return 'left';
        if (minOverlap === overlapRight) return 'right';
        if (minOverlap === overlapTop) return 'top';
        return 'bottom';
    }
    
    checkCollisionsWithSpatialPartitioning(entities) {
        const collisions = [];
        
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entity1 = entities[i];
                const entity2 = entities[j];
                
                if (!entity1.active || !entity2.active) continue;
                
                if (this.checkRectangleCollision(entity1.getBounds(), entity2.getBounds())) {
                    collisions.push({
                        entity1: entity1,
                        entity2: entity2,
                        collisionPoint: this.getCollisionPoint(entity1.getBounds(), entity2.getBounds())
                    });
                }
            }
        }
        
        return collisions;
    }
    
    getCollisionStats() {
        return {
            collisionChecks: this.collisionChecks
        };
    }
    
    resetCollisionStats() {
        this.collisionChecks = 0;
    }
}

// 简化的碰撞检测系统类用于测试
class CollisionSystem {
    constructor() {
        this.physicsSystem = new MockPhysicsSystem();
        this.collisionCallbacks = new Map();
        this.collisionHistory = [];
        this.maxHistorySize = 100;
        
        this.stats = {
            totalChecks: 0,
            collisionsDetected: 0,
            lastFrameChecks: 0
        };
    }
    
    checkPlayerObstacleCollisions(player, obstacles) {
        if (!player || !player.active) return null;
        
        // 如果玩家处于无敌状态，忽略碰撞
        if (player.isInvincible === true) {
            return null;
        }
        
        const collision = this.physicsSystem.checkPlayerObstacleCollision(player, obstacles);
        
        if (collision) {
            this.stats.collisionsDetected++;
            this.recordCollision(collision);
            this.triggerCollisionCallback('player-obstacle', collision);
        }
        
        return collision;
    }
    
    checkBulletObstacleCollisions(bullets, floatingObstacles) {
        const collisions = [];
        
        if (!bullets || !floatingObstacles) {
            return collisions;
        }
        
        const activeBullets = bullets.filter(bullet => bullet.active);
        const shootableObstacles = floatingObstacles.filter(obstacle => 
            obstacle.active && obstacle.canBeShot
        );
        
        let collisionChecks = 0;
        
        for (const bullet of activeBullets) {
            const bulletBounds = bullet.getBounds();
            
            for (const obstacle of shootableObstacles) {
                const obstacleBounds = obstacle.getBounds();
                collisionChecks++;
                
                if (this.physicsSystem.checkRectangleCollision(bulletBounds, obstacleBounds)) {
                    const collision = {
                        bullet: bullet,
                        obstacle: obstacle,
                        collisionPoint: this.physicsSystem.getCollisionPoint(bulletBounds, obstacleBounds),
                        damage: bullet.getDamage(),
                        timestamp: performance.now()
                    };
                    
                    collisions.push(collision);
                    this.stats.collisionsDetected++;
                    this.recordCollision(collision);
                    this.triggerCollisionCallback('bullet-obstacle', collision);
                    
                    break;
                }
            }
        }
        
        this.stats.totalChecks += collisionChecks;
        
        return collisions;
    }
    
    checkSingleBulletCollision(bullet, obstacles) {
        if (!bullet || !bullet.active || !obstacles) return null;
        
        const bulletBounds = bullet.getBounds();
        
        for (const obstacle of obstacles) {
            if (!obstacle.active || !obstacle.canBeShot) continue;
            
            const obstacleBounds = obstacle.getBounds();
            
            if (this.physicsSystem.checkRectangleCollision(bulletBounds, obstacleBounds)) {
                const collision = {
                    bullet: bullet,
                    obstacle: obstacle,
                    collisionPoint: this.physicsSystem.getCollisionPoint(bulletBounds, obstacleBounds),
                    damage: bullet.getDamage(),
                    timestamp: performance.now()
                };
                
                this.stats.collisionsDetected++;
                this.recordCollision(collision);
                this.triggerCollisionCallback('bullet-obstacle', collision);
                
                return obstacle;
            }
        }
        
        return null;
    }
    
    registerCollisionCallback(type, callback) {
        if (!this.collisionCallbacks.has(type)) {
            this.collisionCallbacks.set(type, []);
        }
        this.collisionCallbacks.get(type).push(callback);
    }
    
    removeCollisionCallback(type, callback) {
        if (this.collisionCallbacks.has(type)) {
            const callbacks = this.collisionCallbacks.get(type);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
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
    
    recordCollision(collision) {
        const collisionRecord = {
            timestamp: performance.now(),
            collision: collision
        };
        
        this.collisionHistory.push(collisionRecord);
        
        if (this.collisionHistory.length > this.maxHistorySize) {
            this.collisionHistory.shift();
        }
    }
    
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
    
    isPointInEntity(x, y, entity) {
        const bounds = entity.getBounds();
        return x >= bounds.x && 
               x <= bounds.x + bounds.width &&
               y >= bounds.y && 
               y <= bounds.y + bounds.height;
    }
    
    getDistanceBetweenEntities(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();
        
        const centerX1 = bounds1.x + bounds1.width / 2;
        const centerY1 = bounds1.y + bounds1.height / 2;
        const centerX2 = bounds2.x + bounds2.width / 2;
        const centerY2 = bounds2.y + bounds2.height / 2;
        
        return Utils.distance(centerX1, centerY1, centerX2, centerY2);
    }
    
    predictCollision(entity1, entity2, deltaTime) {
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
    
    update(deltaTime) {
        this.stats.lastFrameChecks = this.physicsSystem.getCollisionStats().collisionChecks;
        this.physicsSystem.resetCollisionStats();
        
        const currentTime = performance.now();
        const maxAge = 5000;
        this.collisionHistory = this.collisionHistory.filter(
            record => currentTime - record.timestamp < maxAge
        );
    }
    
    getStats() {
        return {
            ...this.stats,
            historySize: this.collisionHistory.length,
            callbackTypes: Array.from(this.collisionCallbacks.keys()),
            physicsStats: this.physicsSystem.getCollisionStats()
        };
    }
    
    resetStats() {
        this.stats = {
            totalChecks: 0,
            collisionsDetected: 0,
            lastFrameChecks: 0
        };
        this.physicsSystem.resetCollisionStats();
    }
    
    getRecentCollisions(count = 10) {
        return this.collisionHistory
            .slice(-count)
            .map(record => record.collision);
    }
    
    clearHistory() {
        this.collisionHistory = [];
    }
}

// 运行测试
runCollisionSystemTests();

function runCollisionSystemTests() {
    console.log('🧪 运行碰撞检测系统测试...\n');
    
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
    
    // === 基础碰撞检测算法测试 ===
    console.log('🎯 基础碰撞检测算法测试:');
    
    test('CollisionSystem 可以实例化', () => {
        const collisionSystem = new CollisionSystem();
        
        if (!collisionSystem) throw new Error('无法创建 CollisionSystem 实例');
        if (!collisionSystem.physicsSystem) throw new Error('physicsSystem 未初始化');
        if (!collisionSystem.collisionCallbacks) throw new Error('collisionCallbacks 未初始化');
        if (!collisionSystem.collisionHistory) throw new Error('collisionHistory 未初始化');
    });
    
    test('矩形碰撞检测 - 重叠情况', () => {
        const collisionSystem = new CollisionSystem();
        
        const rect1 = { x: 10, y: 10, width: 20, height: 20 };
        const rect2 = { x: 20, y: 20, width: 20, height: 20 };
        
        const result = collisionSystem.physicsSystem.checkRectangleCollision(rect1, rect2);
        
        if (!result) throw new Error('应该检测到碰撞但没有');
    });
    
    test('矩形碰撞检测 - 不重叠情况', () => {
        const collisionSystem = new CollisionSystem();
        
        const rect1 = { x: 10, y: 10, width: 20, height: 20 };
        const rect2 = { x: 50, y: 50, width: 20, height: 20 };
        
        const result = collisionSystem.physicsSystem.checkRectangleCollision(rect1, rect2);
        
        if (result) throw new Error('不应该检测到碰撞但检测到了');
    });
    
    test('矩形碰撞检测 - 边界接触', () => {
        const collisionSystem = new CollisionSystem();
        
        const rect1 = { x: 10, y: 10, width: 20, height: 20 };
        const rect2 = { x: 30, y: 10, width: 20, height: 20 };
        
        const result = collisionSystem.physicsSystem.checkRectangleCollision(rect1, rect2);
        
        if (result) throw new Error('边界接触不应该算作碰撞');
    });
    
    test('碰撞点计算正确性', () => {
        const collisionSystem = new CollisionSystem();
        
        const rect1 = { x: 10, y: 10, width: 20, height: 20 };
        const rect2 = { x: 20, y: 20, width: 20, height: 20 };
        
        const collisionPoint = collisionSystem.physicsSystem.getCollisionPoint(rect1, rect2);
        
        if (!collisionPoint) throw new Error('碰撞点计算失败');
        if (typeof collisionPoint.x !== 'number') throw new Error('碰撞点 x 坐标无效');
        if (typeof collisionPoint.y !== 'number') throw new Error('碰撞点 y 坐标无效');
    });
    
    test('碰撞方向计算正确性', () => {
        const collisionSystem = new CollisionSystem();
        
        const rect1 = { x: 10, y: 10, width: 20, height: 20 };
        const rect2 = { x: 25, y: 10, width: 20, height: 20 };
        
        const collisionSide = collisionSystem.physicsSystem.getCollisionSide(rect1, rect2);
        
        if (!collisionSide) throw new Error('碰撞方向计算失败');
        if (!['left', 'right', 'top', 'bottom'].includes(collisionSide)) {
            throw new Error('碰撞方向值无效');
        }
    });
    
    // === 玩家与障碍物碰撞检测测试 ===
    console.log('\n👤 玩家与障碍物碰撞检测测试:');
    
    test('玩家与障碍物碰撞检测 - 发生碰撞', () => {
        const collisionSystem = new CollisionSystem();
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        const collision = collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        if (!collision) throw new Error('应该检测到玩家与障碍物碰撞');
        if (collision.player !== player) throw new Error('碰撞信息中玩家对象不正确');
        if (collision.obstacle !== obstacle) throw new Error('碰撞信息中障碍物对象不正确');
    });
    
    test('玩家与障碍物碰撞检测 - 无碰撞', () => {
        const collisionSystem = new CollisionSystem();
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(200, 200);
        const obstacles = [obstacle];
        
        const collision = collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        if (collision) throw new Error('不应该检测到碰撞');
    });
    
    test('玩家为空时的处理', () => {
        const collisionSystem = new CollisionSystem();
        const obstacle = new MockObstacle(100, 100);
        const obstacles = [obstacle];
        
        const collision = collisionSystem.checkPlayerObstacleCollisions(null, obstacles);
        
        if (collision) throw new Error('玩家为空时不应该检测到碰撞');
    });
    
    test('障碍物数组为空时的处理', () => {
        const collisionSystem = new CollisionSystem();
        const player = new MockPlayer(100, 100);
        const obstacles = [];
        
        const collision = collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        if (collision) throw new Error('障碍物为空时不应该检测到碰撞');
    });
    
    test('非活跃障碍物不参与碰撞检测', () => {
        const collisionSystem = new CollisionSystem();
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        obstacle.active = false;
        const obstacles = [obstacle];
        
        const collision = collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        if (collision) throw new Error('非活跃障碍物不应该参与碰撞检测');
    });
    
    // === 子弹与障碍物碰撞检测测试 ===
    console.log('\n🔫 子弹与障碍物碰撞检测测试:');
    
    test('子弹与漂浮障碍物碰撞检测 - 发生碰撞', () => {
        const collisionSystem = new CollisionSystem();
        const bullet = new MockBullet(100, 100);
        const obstacle = new MockObstacle(105, 102, 'floating');
        const bullets = [bullet];
        const obstacles = [obstacle];
        
        const collisions = collisionSystem.checkBulletObstacleCollisions(bullets, obstacles);
        
        if (collisions.length === 0) throw new Error('应该检测到子弹与障碍物碰撞');
        if (collisions[0].bullet !== bullet) throw new Error('碰撞信息中子弹对象不正确');
        if (collisions[0].obstacle !== obstacle) throw new Error('碰撞信息中障碍物对象不正确');
    });
    
    test('子弹与地面障碍物不发生碰撞', () => {
        const collisionSystem = new CollisionSystem();
        const bullet = new MockBullet(100, 100);
        const obstacle = new MockObstacle(105, 102, 'ground'); // 地面障碍物不能被射击
        const bullets = [bullet];
        const obstacles = [obstacle];
        
        const collisions = collisionSystem.checkBulletObstacleCollisions(bullets, obstacles);
        
        if (collisions.length > 0) throw new Error('子弹不应该与地面障碍物碰撞');
    });
    
    test('子弹与障碍物无重叠时不碰撞', () => {
        const collisionSystem = new CollisionSystem();
        const bullet = new MockBullet(100, 100);
        const obstacle = new MockObstacle(200, 200, 'floating');
        const bullets = [bullet];
        const obstacles = [obstacle];
        
        const collisions = collisionSystem.checkBulletObstacleCollisions(bullets, obstacles);
        
        if (collisions.length > 0) throw new Error('无重叠时不应该检测到碰撞');
    });
    
    test('非活跃子弹不参与碰撞检测', () => {
        const collisionSystem = new CollisionSystem();
        const bullet = new MockBullet(100, 100);
        bullet.active = false;
        const obstacle = new MockObstacle(105, 102, 'floating');
        const bullets = [bullet];
        const obstacles = [obstacle];
        
        const collisions = collisionSystem.checkBulletObstacleCollisions(bullets, obstacles);
        
        if (collisions.length > 0) throw new Error('非活跃子弹不应该参与碰撞检测');
    });
    
    test('单个子弹碰撞检测功能', () => {
        const collisionSystem = new CollisionSystem();
        const bullet = new MockBullet(100, 100);
        const obstacle1 = new MockObstacle(105, 102, 'floating');
        const obstacle2 = new MockObstacle(200, 200, 'floating');
        const obstacles = [obstacle1, obstacle2];
        
        const hitObstacle = collisionSystem.checkSingleBulletCollision(bullet, obstacles);
        
        if (hitObstacle !== obstacle1) throw new Error('单个子弹碰撞检测结果不正确');
    });
    
    test('子弹碰撞包含伤害信息', () => {
        const collisionSystem = new CollisionSystem();
        const bullet = new MockBullet(100, 100);
        const obstacle = new MockObstacle(105, 102, 'floating');
        const bullets = [bullet];
        const obstacles = [obstacle];
        
        const collisions = collisionSystem.checkBulletObstacleCollisions(bullets, obstacles);
        
        if (collisions.length === 0) throw new Error('应该检测到碰撞');
        if (typeof collisions[0].damage !== 'number') throw new Error('碰撞信息应该包含伤害值');
        if (collisions[0].damage !== bullet.getDamage()) throw new Error('伤害值不正确');
    });
    
    // === 无敌状态碰撞处理测试 ===
    console.log('\n🛡️ 无敌状态碰撞处理测试:');
    
    test('无敌状态下玩家忽略障碍物碰撞', () => {
        const collisionSystem = new CollisionSystem();
        const player = new MockPlayer(100, 100);
        player.setInvincible(5000); // 5秒无敌
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        const collision = collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        if (collision) throw new Error('无敌状态下应该忽略与障碍物的碰撞');
    });
    
    test('无敌状态不影响子弹碰撞检测', () => {
        const collisionSystem = new CollisionSystem();
        const bullet = new MockBullet(100, 100);
        const obstacle = new MockObstacle(105, 102, 'floating');
        const bullets = [bullet];
        const obstacles = [obstacle];
        
        // 无敌状态不应该影响子弹碰撞
        const collisions = collisionSystem.checkBulletObstacleCollisions(bullets, obstacles);
        
        if (collisions.length === 0) throw new Error('无敌状态不应该影响子弹碰撞检测');
    });
    
    test('无敌状态结束后恢复正常碰撞', () => {
        const collisionSystem = new CollisionSystem();
        const player = new MockPlayer(100, 100);
        player.setInvincible(5000);
        player.isInvincible = false; // 模拟无敌状态结束
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        const collision = collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        if (!collision) throw new Error('无敌状态结束后应该恢复正常碰撞检测');
    });
    
    // === 碰撞回调系统测试 ===
    console.log('\n📞 碰撞回调系统测试:');
    
    test('碰撞回调注册和触发', () => {
        const collisionSystem = new CollisionSystem();
        let callbackTriggered = false;
        let callbackData = null;
        
        const callback = (collision) => {
            callbackTriggered = true;
            callbackData = collision;
        };
        
        collisionSystem.registerCollisionCallback('player-obstacle', callback);
        
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        if (!callbackTriggered) throw new Error('碰撞回调未被触发');
        if (!callbackData) throw new Error('碰撞回调数据为空');
        if (callbackData.player !== player) throw new Error('回调数据中玩家对象不正确');
    });
    
    test('碰撞回调移除功能', () => {
        const collisionSystem = new CollisionSystem();
        let callbackTriggered = false;
        
        const callback = () => {
            callbackTriggered = true;
        };
        
        collisionSystem.registerCollisionCallback('player-obstacle', callback);
        collisionSystem.removeCollisionCallback('player-obstacle', callback);
        
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        if (callbackTriggered) throw new Error('移除的回调不应该被触发');
    });
    
    test('多个碰撞回调同时工作', () => {
        const collisionSystem = new CollisionSystem();
        let callback1Triggered = false;
        let callback2Triggered = false;
        
        const callback1 = () => { callback1Triggered = true; };
        const callback2 = () => { callback2Triggered = true; };
        
        collisionSystem.registerCollisionCallback('player-obstacle', callback1);
        collisionSystem.registerCollisionCallback('player-obstacle', callback2);
        
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        if (!callback1Triggered) throw new Error('第一个回调未被触发');
        if (!callback2Triggered) throw new Error('第二个回调未被触发');
    });
    
    test('碰撞回调错误处理', () => {
        const collisionSystem = new CollisionSystem();
        
        const errorCallback = () => {
            throw new Error('回调中的错误');
        };
        
        collisionSystem.registerCollisionCallback('player-obstacle', errorCallback);
        
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        // 应该不抛出异常，错误应该被捕获
        collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
    });
    
    // === 边界情况处理测试 ===
    console.log('\n🔍 边界情况处理测试:');
    
    test('零尺寸实体碰撞检测', () => {
        const collisionSystem = new CollisionSystem();
        
        const rect1 = { x: 10, y: 10, width: 0, height: 0 };
        const rect2 = { x: 10, y: 10, width: 20, height: 20 };
        
        const result = collisionSystem.physicsSystem.checkRectangleCollision(rect1, rect2);
        
        if (result) throw new Error('零尺寸实体不应该产生碰撞');
    });
    
    test('负坐标实体碰撞检测', () => {
        const collisionSystem = new CollisionSystem();
        
        const rect1 = { x: -10, y: -10, width: 20, height: 20 };
        const rect2 = { x: 5, y: 5, width: 20, height: 20 };
        
        const result = collisionSystem.physicsSystem.checkRectangleCollision(rect1, rect2);
        
        if (!result) throw new Error('负坐标实体碰撞检测失败');
    });
    
    test('大量实体碰撞检测性能', () => {
        const collisionSystem = new CollisionSystem();
        const entities = [];
        
        // 创建100个实体
        for (let i = 0; i < 100; i++) {
            entities.push(new MockEntity(i * 5, i * 5, 10, 10));
        }
        
        const startTime = performance.now();
        const collisions = collisionSystem.physicsSystem.checkCollisionsWithSpatialPartitioning(entities);
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        if (duration > 100) { // 100ms 阈值
            throw new Error(`大量实体碰撞检测耗时过长: ${duration}ms`);
        }
    });
    
    test('点在实体内检测', () => {
        const collisionSystem = new CollisionSystem();
        const entity = new MockEntity(10, 10, 20, 20);
        
        const insidePoint = collisionSystem.isPointInEntity(15, 15, entity);
        const outsidePoint = collisionSystem.isPointInEntity(50, 50, entity);
        
        if (!insidePoint) throw new Error('内部点检测失败');
        if (outsidePoint) throw new Error('外部点检测错误');
    });
    
    test('实体间距离计算', () => {
        const collisionSystem = new CollisionSystem();
        const entity1 = new MockEntity(0, 0, 10, 10);
        const entity2 = new MockEntity(30, 40, 10, 10);
        
        const distance = collisionSystem.getDistanceBetweenEntities(entity1, entity2);
        // entity1 center: (5, 5), entity2 center: (35, 45)
        // distance = sqrt((35-5)^2 + (45-5)^2) = sqrt(30^2 + 40^2) = sqrt(900 + 1600) = sqrt(2500) = 50
        const expectedDistance = 50;
        
        if (Math.abs(distance - expectedDistance) > 0.1) {
            throw new Error(`距离计算不准确: ${distance}, 期望: ${expectedDistance}`);
        }
    });
    
    test('碰撞预测功能', () => {
        const collisionSystem = new CollisionSystem();
        const entity1 = new MockEntity(10, 10, 10, 10);
        const entity2 = new MockEntity(30, 10, 10, 10);
        
        entity1.velocityX = 100; // 向右移动
        entity2.velocityX = -100; // 向左移动
        
        const willCollide = collisionSystem.predictCollision(entity1, entity2, 0.1); // 0.1秒后
        
        if (!willCollide) throw new Error('应该预测到碰撞');
    });
    
    // === 统计和历史记录测试 ===
    console.log('\n📊 统计和历史记录测试:');
    
    test('碰撞统计记录', () => {
        const collisionSystem = new CollisionSystem();
        const initialStats = collisionSystem.getStats();
        
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        const finalStats = collisionSystem.getStats();
        
        if (finalStats.collisionsDetected <= initialStats.collisionsDetected) {
            throw new Error('碰撞统计未正确更新');
        }
    });
    
    test('碰撞历史记录', () => {
        const collisionSystem = new CollisionSystem();
        
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        const recentCollisions = collisionSystem.getRecentCollisions(1);
        
        if (recentCollisions.length === 0) throw new Error('碰撞历史记录为空');
        if (recentCollisions[0].player !== player) throw new Error('历史记录中玩家对象不正确');
    });
    
    test('碰撞历史清理', () => {
        const collisionSystem = new CollisionSystem();
        
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        collisionSystem.clearHistory();
        
        const recentCollisions = collisionSystem.getRecentCollisions(10);
        
        if (recentCollisions.length > 0) throw new Error('历史记录清理失败');
    });
    
    test('统计重置功能', () => {
        const collisionSystem = new CollisionSystem();
        
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        collisionSystem.resetStats();
        
        const stats = collisionSystem.getStats();
        
        if (stats.collisionsDetected !== 0) throw new Error('统计重置失败');
        if (stats.totalChecks !== 0) throw new Error('检测次数统计重置失败');
    });
    
    test('系统更新功能', () => {
        const collisionSystem = new CollisionSystem();
        
        // 添加一些历史记录
        const player = new MockPlayer(100, 100);
        const obstacle = new MockObstacle(110, 110);
        const obstacles = [obstacle];
        
        collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        
        const initialHistorySize = collisionSystem.collisionHistory.length;
        
        collisionSystem.update(0.016);
        
        // 更新应该正常执行而不抛出异常
        const finalHistorySize = collisionSystem.collisionHistory.length;
        
        if (finalHistorySize > initialHistorySize + 1) {
            throw new Error('更新后历史记录异常增长');
        }
    });
    
    // === 集成测试 ===
    console.log('\n🔗 集成测试:');
    
    test('完整碰撞检测流程', () => {
        const collisionSystem = new CollisionSystem();
        let playerCollisionDetected = false;
        let bulletCollisionDetected = false;
        
        // 注册回调
        collisionSystem.registerCollisionCallback('player-obstacle', () => {
            playerCollisionDetected = true;
        });
        
        collisionSystem.registerCollisionCallback('bullet-obstacle', () => {
            bulletCollisionDetected = true;
        });
        
        // 创建测试实体
        const player = new MockPlayer(100, 100);
        const bullet = new MockBullet(200, 200);
        const groundObstacle = new MockObstacle(110, 110, 'ground');
        const floatingObstacle = new MockObstacle(205, 202, 'floating');
        
        const obstacles = [groundObstacle];
        const floatingObstacles = [floatingObstacle];
        const bullets = [bullet];
        
        // 执行碰撞检测
        const playerCollision = collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        const bulletCollisions = collisionSystem.checkBulletObstacleCollisions(bullets, floatingObstacles);
        
        // 验证结果
        if (!playerCollision) throw new Error('玩家碰撞检测失败');
        if (bulletCollisions.length === 0) throw new Error('子弹碰撞检测失败');
        if (!playerCollisionDetected) throw new Error('玩家碰撞回调未触发');
        if (!bulletCollisionDetected) throw new Error('子弹碰撞回调未触发');
        
        // 验证统计信息
        const stats = collisionSystem.getStats();
        if (stats.collisionsDetected < 2) throw new Error('碰撞统计不正确');
    });
    
    test('无敌状态下的完整流程', () => {
        const collisionSystem = new CollisionSystem();
        
        const player = new MockPlayer(100, 100);
        player.setInvincible(5000); // 设置无敌状态
        
        const bullet = new MockBullet(200, 200);
        const groundObstacle = new MockObstacle(110, 110, 'ground');
        const floatingObstacle = new MockObstacle(205, 202, 'floating');
        
        const obstacles = [groundObstacle];
        const floatingObstacles = [floatingObstacle];
        const bullets = [bullet];
        
        // 执行碰撞检测
        const playerCollision = collisionSystem.checkPlayerObstacleCollisions(player, obstacles);
        const bulletCollisions = collisionSystem.checkBulletObstacleCollisions(bullets, floatingObstacles);
        
        // 验证结果
        if (playerCollision) throw new Error('无敌状态下不应该检测到玩家碰撞');
        if (bulletCollisions.length === 0) throw new Error('无敌状态不应该影响子弹碰撞');
    });
    
    // 输出测试结果
    console.log(`\n🎉 测试结果: ${passed}/${total} 个测试通过`);
    console.log(`成功率: ${Math.round((passed / total) * 100)}%`);
    
    if (passed === total) {
        console.log('✅ 所有测试通过！碰撞检测系统单元测试完成。');
        console.log('🎯 碰撞检测算法准确，玩家和子弹碰撞逻辑正确！');
        console.log('🛡️ 无敌状态碰撞处理功能完善！');
        return true;
    } else {
        console.log('❌ 部分测试失败！');
        return false;
    }
}