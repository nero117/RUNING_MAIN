/**
 * 对象池 - 用于减少垃圾回收和提高性能
 */
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.activeObjects = new Set();
        
        // 预创建对象
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
        
        this.stats = {
            created: initialSize,
            reused: 0,
            active: 0,
            poolSize: initialSize
        };
    }
    
    /**
     * 获取对象
     * @returns {Object} 对象实例
     */
    get() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.stats.reused++;
        } else {
            obj = this.createFn();
            this.stats.created++;
        }
        
        this.activeObjects.add(obj);
        this.stats.active = this.activeObjects.size;
        this.stats.poolSize = this.pool.length;
        
        return obj;
    }
    
    /**
     * 释放对象
     * @param {Object} obj - 要释放的对象
     */
    release(obj) {
        if (!this.activeObjects.has(obj)) {
            return; // 对象不在活跃列表中
        }
        
        this.activeObjects.delete(obj);
        
        // 重置对象状态
        if (this.resetFn) {
            this.resetFn(obj);
        }
        
        this.pool.push(obj);
        this.stats.active = this.activeObjects.size;
        this.stats.poolSize = this.pool.length;
    }
    
    /**
     * 释放所有活跃对象
     */
    releaseAll() {
        for (const obj of this.activeObjects) {
            if (this.resetFn) {
                this.resetFn(obj);
            }
            this.pool.push(obj);
        }
        
        this.activeObjects.clear();
        this.stats.active = 0;
        this.stats.poolSize = this.pool.length;
    }
    
    /**
     * 清理池中多余的对象
     * @param {number} maxSize - 最大池大小
     */
    trim(maxSize = 50) {
        while (this.pool.length > maxSize) {
            this.pool.pop();
        }
        this.stats.poolSize = this.pool.length;
    }
    
    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats.reused = 0;
        this.stats.created = this.pool.length + this.activeObjects.size;
    }
}

/**
 * 对象池管理器 - 管理多个对象池
 */
class ObjectPoolManager {
    constructor() {
        this.pools = new Map();
    }
    
    /**
     * 创建对象池
     * @param {string} name - 池名称
     * @param {Function} createFn - 创建函数
     * @param {Function} resetFn - 重置函数
     * @param {number} initialSize - 初始大小
     */
    createPool(name, createFn, resetFn, initialSize = 10) {
        const pool = new ObjectPool(createFn, resetFn, initialSize);
        this.pools.set(name, pool);
        return pool;
    }
    
    /**
     * 获取对象池
     * @param {string} name - 池名称
     * @returns {ObjectPool|null} 对象池
     */
    getPool(name) {
        return this.pools.get(name) || null;
    }
    
    /**
     * 从池中获取对象
     * @param {string} poolName - 池名称
     * @returns {Object|null} 对象实例
     */
    get(poolName) {
        const pool = this.getPool(poolName);
        return pool ? pool.get() : null;
    }
    
    /**
     * 释放对象到池中
     * @param {string} poolName - 池名称
     * @param {Object} obj - 要释放的对象
     */
    release(poolName, obj) {
        const pool = this.getPool(poolName);
        if (pool) {
            pool.release(obj);
        }
    }
    
    /**
     * 释放所有池中的所有对象
     */
    releaseAll() {
        for (const pool of this.pools.values()) {
            pool.releaseAll();
        }
    }
    
    /**
     * 清理所有池
     * @param {number} maxSize - 每个池的最大大小
     */
    trimAll(maxSize = 50) {
        for (const pool of this.pools.values()) {
            pool.trim(maxSize);
        }
    }
    
    /**
     * 获取所有池的统计信息
     * @returns {Object} 统计信息
     */
    getAllStats() {
        const stats = {};
        for (const [name, pool] of this.pools) {
            stats[name] = pool.getStats();
        }
        return stats;
    }
    
    /**
     * 渲染对象池调试信息
     * @param {Renderer} renderer - 渲染器
     */
    renderDebugInfo(renderer) {
        if (!GameConfig.DEBUG) return;
        
        const stats = this.getAllStats();
        let y = 300;
        const lineHeight = 14;
        
        renderer.drawText('对象池状态:', 10, y, '#00ffff', '14px Arial');
        y += lineHeight;
        
        for (const [poolName, poolStats] of Object.entries(stats)) {
            renderer.drawText(
                `${poolName}: 活跃${poolStats.active} 池${poolStats.poolSize} 创建${poolStats.created} 重用${poolStats.reused}`,
                10, y, '#ffffff', '10px Arial'
            );
            y += lineHeight;
        }
    }
}

// 全局对象池管理器实例
const objectPoolManager = new ObjectPoolManager();