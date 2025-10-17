/**
 * 子弹管理器
 */
class BulletManager {
    constructor() {
        this.bullets = [];
        this.maxBullets = 50; // 最大同时存在的子弹数量
        
        // 性能统计
        this.stats = {
            totalCreated: 0,
            totalDestroyed: 0,
            currentActive: 0,
            poolHits: 0,
            poolMisses: 0
        };
        
        // 初始化子弹对象池
        this.initializeBulletPool();
    }
    
    /**
     * 初始化子弹对象池
     */
    initializeBulletPool() {
        // 优先使用优化对象池管理器
        if (window.optimizedObjectPoolManager) {
            this.optimizedPool = window.optimizedObjectPoolManager.createPool(
                'bullets',
                () => {
                    this.stats.totalCreated++;
                    return new Bullet(0, 0, 1);
                },
                (bullet) => {
                    // 重置子弹状态
                    bullet.active = true;
                    bullet.lifeTime = 0;
                    bullet.traveledDistance = 0;
                    bullet.trailPositions = [];
                    bullet.velocityX = 0;
                    bullet.velocityY = 0;
                },
                15, // 初始池大小
                50  // 最大池大小
            );
            
            // 预热对象池
            this.optimizedPool.warmup(10);
            
            console.log('优化子弹对象池已初始化');
        } else if (window.objectPoolManager) {
            // 回退到标准对象池
            objectPoolManager.createPool(
                'bullets',
                () => {
                    this.stats.totalCreated++;
                    return new Bullet(0, 0, 1);
                },
                (bullet) => {
                    // 重置子弹状态
                    bullet.active = true;
                    bullet.lifeTime = 0;
                    bullet.traveledDistance = 0;
                    bullet.trailPositions = [];
                    bullet.velocityX = 0;
                    bullet.velocityY = 0;
                },
                10 // 初始池大小
            );
            
            console.log('标准子弹对象池已初始化');
        }
    }
    
    /**
     * 更新子弹管理器
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        // 开始性能监控
        if (window.shootingPerformanceMonitor) {
            window.shootingPerformanceMonitor.startTimer('bulletUpdate');
        }
        
        const initialCount = this.bullets.length;
        
        // 更新所有子弹
        this.bullets.forEach(bullet => {
            if (bullet.active) {
                bullet.update(deltaTime);
            }
        });
        
        // 移除非活跃的子弹
        this.removeInactiveBullets();
        
        // 更新统计信息
        this.stats.currentActive = this.bullets.length;
        
        // 记录性能指标
        if (window.shootingPerformanceMonitor) {
            window.shootingPerformanceMonitor.recordBulletMetrics(this.stats);
            window.shootingPerformanceMonitor.endTimer('bulletUpdate');
        }
        
        // 性能监控：如果子弹数量过多，强制清理
        if (this.bullets.length > this.maxBullets) {
            this.forceCleanup();
        }
        
        // 调试信息
        if (GameConfig.DEBUG && initialCount !== this.bullets.length) {
            console.log(`子弹数量变化: ${initialCount} -> ${this.bullets.length}`);
        }
    }
    
    /**
     * 添加新子弹
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     * @param {number} direction - 飞行方向 (1 = 向右, -1 = 向左)
     * @returns {Bullet|null} 创建的子弹对象，如果达到最大数量则返回null
     */
    addBullet(x, y, direction = 1) {
        // 检查是否达到最大子弹数量
        if (this.bullets.length >= this.maxBullets) {
            if (GameConfig.DEBUG) {
                console.warn(`已达到最大子弹数量限制: ${this.maxBullets}`);
            }
            return null;
        }
        
        let bullet = null;
        
        // 优先使用优化对象池
        if (this.optimizedPool) {
            bullet = this.optimizedPool.get();
            if (bullet) {
                this.stats.poolHits++;
                // 重新初始化池中的子弹
                this.initializeBullet(bullet, x, y, direction);
            } else {
                this.stats.poolMisses++;
            }
        } else if (window.objectPoolManager) {
            // 回退到标准对象池
            bullet = objectPoolManager.get('bullets');
            if (bullet) {
                this.stats.poolHits++;
                // 重新初始化池中的子弹
                this.initializeBullet(bullet, x, y, direction);
            }
        }
        
        // 如果池中没有可用对象，创建新的
        if (!bullet) {
            this.stats.poolMisses++;
            bullet = new Bullet(x, y, direction);
            this.stats.totalCreated++;
        }
        
        this.bullets.push(bullet);
        this.stats.currentActive = this.bullets.length;
        
        if (GameConfig.DEBUG) {
            console.log(`创建子弹: 位置=(${x}, ${y}), 方向=${direction}, 来源=${bullet.pooled ? '对象池' : '新创建'}`);
        }
        
        return bullet;
    }
    
    /**
     * 初始化子弹属性
     * @param {Bullet} bullet - 子弹对象
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     * @param {number} direction - 飞行方向
     */
    initializeBullet(bullet, x, y, direction) {
        bullet.x = x;
        bullet.y = y;
        bullet.startX = x;
        bullet.startY = y;
        bullet.direction = direction;
        bullet.speed = GameConfig.BULLET_SPEED;
        bullet.velocityX = bullet.speed * direction;
        bullet.velocityY = 0;
        bullet.active = true;
        bullet.lifeTime = 0;
        bullet.traveledDistance = 0;
        bullet.trailPositions = [];
        bullet.damage = 1;
        bullet.maxDistance = GameConfig.CANVAS_WIDTH + 100;
        bullet.maxLifeTime = 3.0;
    }
    
    /**
     * 移除非活跃的子弹
     */
    removeInactiveBullets() {
        const initialCount = this.bullets.length;
        const bulletsToRemove = [];
        
        // 筛选出需要移除的子弹
        this.bullets = this.bullets.filter(bullet => {
            if (!bullet.active) {
                bulletsToRemove.push(bullet);
                return false;
            }
            return true;
        });
        
        // 将移除的子弹释放到对象池
        if (bulletsToRemove.length > 0) {
            bulletsToRemove.forEach(bullet => {
                if (this.optimizedPool) {
                    this.optimizedPool.release(bullet);
                } else if (window.objectPoolManager) {
                    objectPoolManager.release('bullets', bullet);
                }
            });
        }
        
        // 更新统计信息
        this.stats.totalDestroyed += bulletsToRemove.length;
        this.stats.currentActive = this.bullets.length;
        
        if (GameConfig.DEBUG && bulletsToRemove.length > 0) {
            console.log(`移除了 ${bulletsToRemove.length} 个子弹，已释放到对象池`);
        }
    }
    
    /**
     * 强制清理过多的子弹（保留最新的）
     */
    forceCleanup() {
        const excessCount = this.bullets.length - this.maxBullets;
        if (excessCount <= 0) return;
        
        // 移除最老的子弹
        const bulletsToRemove = this.bullets.splice(0, excessCount);
        
        // 释放到对象池
        if (window.objectPoolManager) {
            bulletsToRemove.forEach(bullet => {
                bullet.destroy();
                objectPoolManager.release('bullets', bullet);
            });
        }
        
        this.stats.totalDestroyed += bulletsToRemove.length;
        this.stats.currentActive = this.bullets.length;
        
        if (GameConfig.DEBUG) {
            console.warn(`强制清理了 ${bulletsToRemove.length} 个子弹以维持性能`);
        }
    }
    
    /**
     * 移除指定的子弹
     * @param {Bullet} bullet - 要移除的子弹
     */
    removeBullet(bullet) {
        const index = this.bullets.indexOf(bullet);
        if (index !== -1) {
            this.bullets.splice(index, 1);
            bullet.destroy();
            
            // 释放到对象池
            if (window.objectPoolManager) {
                objectPoolManager.release('bullets', bullet);
            }
            
            this.stats.totalDestroyed++;
            this.stats.currentActive = this.bullets.length;
        }
    }
    
    /**
     * 获取所有活跃的子弹
     * @returns {Array} 活跃子弹数组
     */
    getBullets() {
        return this.bullets.filter(bullet => bullet.active);
    }
    
    /**
     * 获取指定区域内的子弹
     * @param {number} x - 区域左上角X坐标
     * @param {number} y - 区域左上角Y坐标
     * @param {number} width - 区域宽度
     * @param {number} height - 区域高度
     * @returns {Array} 区域内的子弹数组
     */
    getBulletsInArea(x, y, width, height) {
        return this.getBullets().filter(bullet => {
            return bullet.x < x + width &&
                   bullet.x + bullet.width > x &&
                   bullet.y < y + height &&
                   bullet.y + bullet.height > y;
        });
    }
    
    /**
     * 检查子弹与目标的碰撞
     * @param {Entity} target - 目标实体
     * @returns {Array} 碰撞的子弹数组
     */
    checkCollisions(target) {
        const collidingBullets = [];
        
        this.getBullets().forEach(bullet => {
            if (bullet.collidesWith(target)) {
                collidingBullets.push(bullet);
            }
        });
        
        return collidingBullets;
    }
    
    /**
     * 处理子弹与目标的碰撞
     * @param {Entity} target - 目标实体
     * @param {Function} onHit - 碰撞回调函数 (bullet, target) => void
     * @returns {number} 碰撞的子弹数量
     */
    handleCollisions(target, onHit) {
        const collidingBullets = this.checkCollisions(target);
        
        collidingBullets.forEach(bullet => {
            // 调用碰撞回调
            if (typeof onHit === 'function') {
                onHit(bullet, target);
            }
            
            // 移除碰撞的子弹
            this.removeBullet(bullet);
        });
        
        return collidingBullets.length;
    }
    
    /**
     * 清除所有子弹
     */
    clearAllBullets() {
        // 将所有子弹释放到对象池
        if (window.objectPoolManager) {
            this.bullets.forEach(bullet => {
                bullet.destroy();
                objectPoolManager.release('bullets', bullet);
            });
        }
        
        this.stats.totalDestroyed += this.bullets.length;
        this.bullets = [];
        this.stats.currentActive = 0;
        
        if (GameConfig.DEBUG) {
            console.log('已清除所有子弹');
        }
    }
    
    /**
     * 设置最大子弹数量
     * @param {number} maxCount - 最大数量
     */
    setMaxBullets(maxCount) {
        this.maxBullets = Math.max(1, maxCount);
        
        // 如果当前子弹数量超过新的限制，进行清理
        if (this.bullets.length > this.maxBullets) {
            this.forceCleanup();
        }
    }
    
    /**
     * 获取子弹管理器统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        const poolStats = window.objectPoolManager ? 
            objectPoolManager.getPool('bullets')?.getStats() : null;
        
        return {
            bullets: {
                active: this.stats.currentActive,
                maxAllowed: this.maxBullets,
                totalCreated: this.stats.totalCreated,
                totalDestroyed: this.stats.totalDestroyed,
                poolHits: this.stats.poolHits,
                poolMisses: this.stats.poolMisses,
                poolEfficiency: this.stats.poolHits + this.stats.poolMisses > 0 ? 
                    (this.stats.poolHits / (this.stats.poolHits + this.stats.poolMisses) * 100).toFixed(1) + '%' : 'N/A'
            },
            pool: poolStats
        };
    }
    
    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats.totalCreated = 0;
        this.stats.totalDestroyed = 0;
        this.stats.poolHits = 0;
        this.stats.poolMisses = 0;
        
        // 重置对象池统计
        if (window.objectPoolManager) {
            const pool = objectPoolManager.getPool('bullets');
            if (pool) {
                pool.resetStats();
            }
        }
    }
    
    /**
     * 渲染所有子弹
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        // 开始渲染性能监控
        if (window.shootingPerformanceMonitor) {
            window.shootingPerformanceMonitor.startTimer('bulletRender');
        }
        
        // 渲染所有活跃的子弹
        this.getBullets().forEach(bullet => {
            bullet.render(renderer);
        });
        
        // 结束渲染性能监控
        if (window.shootingPerformanceMonitor) {
            window.shootingPerformanceMonitor.endTimer('bulletRender');
        }
        
        // 调试模式下显示统计信息
        if (GameConfig.DEBUG) {
            this.renderDebugInfo(renderer);
        }
    }
    
    /**
     * 渲染调试信息
     * @param {Renderer} renderer - 渲染器
     */
    renderDebugInfo(renderer) {
        const stats = this.getStats();
        const y = 100;
        const lineHeight = 14;
        
        renderer.drawText(
            `子弹: ${stats.bullets.active}/${stats.bullets.maxAllowed} (创建:${stats.bullets.totalCreated}, 销毁:${stats.bullets.totalDestroyed})`,
            10, y, '#ffff00', '12px Arial'
        );
        
        renderer.drawText(
            `池效率: ${stats.bullets.poolEfficiency} (命中:${stats.bullets.poolHits}, 未命中:${stats.bullets.poolMisses})`,
            10, y + lineHeight, '#ffff00', '10px Arial'
        );
        
        if (stats.pool) {
            renderer.drawText(
                `子弹池: 活跃${stats.pool.active} 池${stats.pool.poolSize} 创建${stats.pool.created} 重用${stats.pool.reused}`,
                10, y + lineHeight * 2, '#ffff00', '10px Arial'
            );
        }
    }
}