/**
 * 优化的对象池管理器
 * 专门为射击系统优化的高性能对象池
 */
class OptimizedObjectPool {
    constructor(name, createFn, resetFn, initialSize = 10, maxSize = 100) {
        this.name = name;
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.initialSize = initialSize;
        this.maxSize = maxSize;
        
        // 对象池数组
        this.pool = [];
        this.active = [];
        
        // 性能统计
        this.stats = {
            created: 0,
            reused: 0,
            destroyed: 0,
            hits: 0,
            misses: 0,
            expansions: 0,
            contractions: 0,
            peakUsage: 0,
            currentActive: 0,
            poolSize: 0
        };
        
        // 性能优化配置
        this.config = {
            autoExpand: true,           // 自动扩展池大小
            autoContract: true,         // 自动收缩池大小
            expansionFactor: 1.5,       // 扩展因子
            contractionThreshold: 0.25, // 收缩阈值
            maxIdleTime: 5000,          // 最大空闲时间（毫秒）
            cleanupInterval: 1000,      // 清理间隔（毫秒）
            preallocationEnabled: true  // 预分配启用
        };
        
        // 时间戳
        this.lastCleanup = performance.now();
        this.creationTimes = new Map(); // 记录对象创建时间
        
        // 初始化池
        this.initialize();
        
        console.log(`优化对象池 "${name}" 已创建，初始大小: ${initialSize}`);
    }
    
    /**
     * 初始化对象池
     */
    initialize() {
        // 预分配初始对象
        if (this.config.preallocationEnabled) {
            for (let i = 0; i < this.initialSize; i++) {
                const obj = this.createObject();
                this.pool.push(obj);
                this.creationTimes.set(obj, performance.now());
            }
        }
        
        this.stats.poolSize = this.pool.length;
        console.log(`对象池 "${this.name}" 预分配了 ${this.pool.length} 个对象`);
    }
    
    /**
     * 创建新对象
     * @returns {Object} 新创建的对象
     */
    createObject() {
        const obj = this.createFn();
        this.stats.created++;
        
        // 添加池管理属性
        if (obj && typeof obj === 'object') {
            obj._pooled = true;
            obj._poolName = this.name;
            obj._poolId = this.stats.created;
        }
        
        return obj;
    }
    
    /**
     * 从池中获取对象
     * @returns {Object|null} 对象实例或null
     */
    get() {
        let obj = null;
        
        // 尝试从池中获取
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.stats.hits++;
            this.stats.reused++;
        } else {
            // 池为空，检查是否可以扩展
            if (this.config.autoExpand && this.getTotalSize() < this.maxSize) {
                obj = this.createObject();
                this.stats.misses++;
                this.expandPool();
            } else {
                // 无法创建更多对象
                this.stats.misses++;
                console.warn(`对象池 "${this.name}" 已达到最大容量 ${this.maxSize}`);
                return null;
            }
        }
        
        // 重置对象状态
        if (obj && this.resetFn) {
            this.resetFn(obj);
        }
        
        // 添加到活跃列表
        this.active.push(obj);
        this.stats.currentActive = this.active.length;
        this.stats.poolSize = this.pool.length;
        
        // 更新峰值使用量
        if (this.stats.currentActive > this.stats.peakUsage) {
            this.stats.peakUsage = this.stats.currentActive;
        }
        
        return obj;
    }
    
    /**
     * 将对象释放回池
     * @param {Object} obj - 要释放的对象
     */
    release(obj) {
        if (!obj) return;
        
        // 从活跃列表中移除
        const index = this.active.indexOf(obj);
        if (index !== -1) {
            this.active.splice(index, 1);
        }
        
        // 检查对象是否属于此池
        if (obj._poolName !== this.name) {
            console.warn(`尝试释放不属于池 "${this.name}" 的对象`);
            return;
        }
        
        // 检查池是否已满
        if (this.pool.length >= this.maxSize) {
            // 池已满，销毁对象
            this.destroyObject(obj);
            return;
        }
        
        // 重置对象状态
        if (this.resetFn) {
            this.resetFn(obj);
        }
        
        // 添加回池
        this.pool.push(obj);
        this.creationTimes.set(obj, performance.now());
        
        // 更新统计
        this.stats.currentActive = this.active.length;
        this.stats.poolSize = this.pool.length;
    }
    
    /**
     * 销毁对象
     * @param {Object} obj - 要销毁的对象
     */
    destroyObject(obj) {
        if (obj && obj.destroy && typeof obj.destroy === 'function') {
            obj.destroy();
        }
        
        // 清理池管理属性
        if (obj && typeof obj === 'object') {
            delete obj._pooled;
            delete obj._poolName;
            delete obj._poolId;
        }
        
        this.creationTimes.delete(obj);
        this.stats.destroyed++;
    }
    
    /**
     * 扩展对象池
     */
    expandPool() {
        if (!this.config.autoExpand) return;
        
        const currentSize = this.getTotalSize();
        const targetSize = Math.min(
            Math.ceil(currentSize * this.config.expansionFactor),
            this.maxSize
        );
        
        const expandCount = targetSize - currentSize;
        
        if (expandCount > 0) {
            for (let i = 0; i < expandCount; i++) {
                const obj = this.createObject();
                this.pool.push(obj);
                this.creationTimes.set(obj, performance.now());
            }
            
            this.stats.expansions++;
            this.stats.poolSize = this.pool.length;
            
            console.log(`对象池 "${this.name}" 扩展了 ${expandCount} 个对象，当前大小: ${this.getTotalSize()}`);
        }
    }
    
    /**
     * 收缩对象池
     */
    contractPool() {
        if (!this.config.autoContract) return;
        
        const currentTime = performance.now();
        const idleThreshold = currentTime - this.config.maxIdleTime;
        
        // 找出空闲时间过长的对象
        const objectsToRemove = [];
        
        for (let i = this.pool.length - 1; i >= 0; i--) {
            const obj = this.pool[i];
            const creationTime = this.creationTimes.get(obj);
            
            if (creationTime && creationTime < idleThreshold) {
                objectsToRemove.push(i);
            }
        }
        
        // 移除空闲对象，但保持最小大小
        const minSize = Math.max(this.initialSize, this.stats.currentActive);
        const maxRemove = Math.max(0, this.pool.length - minSize);
        const removeCount = Math.min(objectsToRemove.length, maxRemove);
        
        if (removeCount > 0) {
            for (let i = 0; i < removeCount; i++) {
                const index = objectsToRemove[i];
                const obj = this.pool[index];
                this.destroyObject(obj);
                this.pool.splice(index, 1);
            }
            
            this.stats.contractions++;
            this.stats.poolSize = this.pool.length;
            
            console.log(`对象池 "${this.name}" 收缩了 ${removeCount} 个对象，当前大小: ${this.getTotalSize()}`);
        }
    }
    
    /**
     * 清理过期对象
     */
    cleanup() {
        const currentTime = performance.now();
        
        // 检查是否需要清理
        if (currentTime - this.lastCleanup < this.config.cleanupInterval) {
            return;
        }
        
        this.lastCleanup = currentTime;
        
        // 执行收缩
        this.contractPool();
        
        // 清理无效的活跃对象引用
        this.active = this.active.filter(obj => obj && obj._pooled);
        this.stats.currentActive = this.active.length;
    }
    
    /**
     * 强制清理所有对象
     */
    clear() {
        // 销毁所有池中的对象
        this.pool.forEach(obj => this.destroyObject(obj));
        this.pool = [];
        
        // 销毁所有活跃对象
        this.active.forEach(obj => this.destroyObject(obj));
        this.active = [];
        
        // 重置统计
        this.stats.currentActive = 0;
        this.stats.poolSize = 0;
        this.creationTimes.clear();
        
        console.log(`对象池 "${this.name}" 已清空`);
    }
    
    /**
     * 获取总对象数量
     * @returns {number} 总数量
     */
    getTotalSize() {
        return this.pool.length + this.active.length;
    }
    
    /**
     * 获取池使用率
     * @returns {number} 使用率百分比
     */
    getUsageRate() {
        const total = this.getTotalSize();
        if (total === 0) return 0;
        return (this.active.length / total) * 100;
    }
    
    /**
     * 获取池效率
     * @returns {number} 效率百分比
     */
    getEfficiency() {
        const total = this.stats.hits + this.stats.misses;
        if (total === 0) return 100;
        return (this.stats.hits / total) * 100;
    }
    
    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            ...this.stats,
            totalSize: this.getTotalSize(),
            usageRate: this.getUsageRate(),
            efficiency: this.getEfficiency(),
            config: { ...this.config }
        };
    }
    
    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            created: this.stats.created, // 保留累计创建数
            reused: 0,
            destroyed: this.stats.destroyed, // 保留累计销毁数
            hits: 0,
            misses: 0,
            expansions: 0,
            contractions: 0,
            peakUsage: 0,
            currentActive: this.active.length,
            poolSize: this.pool.length
        };
    }
    
    /**
     * 更新配置
     * @param {Object} newConfig - 新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log(`对象池 "${this.name}" 配置已更新:`, newConfig);
    }
    
    /**
     * 预热对象池
     * @param {number} count - 预热数量
     */
    warmup(count = this.initialSize) {
        const objectsToWarmup = [];
        
        // 创建并立即释放对象以预热池
        for (let i = 0; i < count; i++) {
            const obj = this.get();
            if (obj) {
                objectsToWarmup.push(obj);
            }
        }
        
        // 释放所有对象回池
        objectsToWarmup.forEach(obj => this.release(obj));
        
        console.log(`对象池 "${this.name}" 预热完成，预热了 ${count} 个对象`);
    }
    
    /**
     * 渲染调试信息
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {number} 下一行的Y坐标
     */
    renderDebugInfo(renderer, x, y) {
        if (!GameConfig.DEBUG) return y;
        
        const lineHeight = 12;
        const stats = this.getStats();
        
        renderer.drawText(`池 "${this.name}":`, x, y, '#ffff00', '12px Arial');
        y += lineHeight;
        
        renderer.drawText(
            `  活跃: ${stats.currentActive}, 池: ${stats.poolSize}, 总: ${stats.totalSize}`,
            x, y, '#ffffff', '10px Arial'
        );
        y += lineHeight;
        
        renderer.drawText(
            `  效率: ${stats.efficiency.toFixed(1)}%, 使用率: ${stats.usageRate.toFixed(1)}%`,
            x, y, '#ffffff', '10px Arial'
        );
        y += lineHeight;
        
        renderer.drawText(
            `  命中: ${stats.hits}, 未命中: ${stats.misses}, 峰值: ${stats.peakUsage}`,
            x, y, '#ffffff', '10px Arial'
        );
        y += lineHeight;
        
        return y + 5;
    }
}

/**
 * 优化的对象池管理器
 * 管理多个优化对象池
 */
class OptimizedObjectPoolManager {
    constructor() {
        this.pools = new Map();
        this.globalStats = {
            totalPools: 0,
            totalObjects: 0,
            totalActive: 0,
            memoryUsage: 0
        };
        
        // 自动清理定时器
        this.cleanupInterval = setInterval(() => {
            this.performMaintenance();
        }, 5000); // 每5秒执行一次维护
        
        console.log('优化对象池管理器已初始化');
    }
    
    /**
     * 创建优化对象池
     * @param {string} name - 池名称
     * @param {Function} createFn - 创建函数
     * @param {Function} resetFn - 重置函数
     * @param {number} initialSize - 初始大小
     * @param {number} maxSize - 最大大小
     * @returns {OptimizedObjectPool} 对象池实例
     */
    createPool(name, createFn, resetFn, initialSize = 10, maxSize = 100) {
        if (this.pools.has(name)) {
            console.warn(`对象池 "${name}" 已存在，将被替换`);
            this.destroyPool(name);
        }
        
        const pool = new OptimizedObjectPool(name, createFn, resetFn, initialSize, maxSize);
        this.pools.set(name, pool);
        this.globalStats.totalPools++;
        
        return pool;
    }
    
    /**
     * 获取对象池
     * @param {string} name - 池名称
     * @returns {OptimizedObjectPool|null} 对象池实例
     */
    getPool(name) {
        return this.pools.get(name) || null;
    }
    
    /**
     * 从指定池获取对象
     * @param {string} poolName - 池名称
     * @returns {Object|null} 对象实例
     */
    get(poolName) {
        const pool = this.pools.get(poolName);
        return pool ? pool.get() : null;
    }
    
    /**
     * 释放对象到指定池
     * @param {string} poolName - 池名称
     * @param {Object} obj - 对象实例
     */
    release(poolName, obj) {
        const pool = this.pools.get(poolName);
        if (pool) {
            pool.release(obj);
        }
    }
    
    /**
     * 销毁对象池
     * @param {string} name - 池名称
     */
    destroyPool(name) {
        const pool = this.pools.get(name);
        if (pool) {
            pool.clear();
            this.pools.delete(name);
            this.globalStats.totalPools--;
            console.log(`对象池 "${name}" 已销毁`);
        }
    }
    
    /**
     * 执行维护任务
     */
    performMaintenance() {
        let totalObjects = 0;
        let totalActive = 0;
        
        // 对所有池执行清理
        for (const [name, pool] of this.pools) {
            pool.cleanup();
            const stats = pool.getStats();
            totalObjects += stats.totalSize;
            totalActive += stats.currentActive;
        }
        
        // 更新全局统计
        this.globalStats.totalObjects = totalObjects;
        this.globalStats.totalActive = totalActive;
        
        // 估算内存使用量（简化计算）
        this.globalStats.memoryUsage = totalObjects * 1024; // 假设每个对象1KB
        
        if (GameConfig.DEBUG) {
            console.log('对象池维护完成:', this.globalStats);
        }
    }
    
    /**
     * 获取全局统计信息
     * @returns {Object} 全局统计信息
     */
    getGlobalStats() {
        return {
            ...this.globalStats,
            pools: Array.from(this.pools.entries()).map(([name, pool]) => ({
                name,
                stats: pool.getStats()
            }))
        };
    }
    
    /**
     * 渲染调试信息
     * @param {Renderer} renderer - 渲染器
     */
    renderDebugInfo(renderer) {
        if (!GameConfig.DEBUG) return;
        
        let x = 10;
        let y = 450;
        const lineHeight = 14;
        
        renderer.drawText('优化对象池状态:', x, y, '#ffff00', '14px Arial');
        y += lineHeight + 5;
        
        renderer.drawText(
            `总池数: ${this.globalStats.totalPools}, 总对象: ${this.globalStats.totalObjects}, 活跃: ${this.globalStats.totalActive}`,
            x, y, '#ffffff', '12px Arial'
        );
        y += lineHeight + 5;
        
        // 渲染各个池的信息
        for (const [name, pool] of this.pools) {
            y = pool.renderDebugInfo(renderer, x, y);
        }
    }
    
    /**
     * 清理所有池
     */
    clearAll() {
        for (const [name, pool] of this.pools) {
            pool.clear();
        }
        console.log('所有对象池已清空');
    }
    
    /**
     * 销毁管理器
     */
    destroy() {
        // 清理定时器
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        // 销毁所有池
        for (const name of this.pools.keys()) {
            this.destroyPool(name);
        }
        
        console.log('优化对象池管理器已销毁');
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.optimizedObjectPoolManager = new OptimizedObjectPoolManager();
}