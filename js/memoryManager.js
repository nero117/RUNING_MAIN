/**
 * 内存管理器 - 防止内存泄漏和优化内存使用
 */
class MemoryManager {
    constructor() {
        this.trackedObjects = new WeakSet();
        this.cleanupTasks = [];
        this.gcInterval = 5000; // 5秒执行一次垃圾回收检查
        this.lastGCTime = 0;
        
        // 内存使用统计
        this.memoryStats = {
            initialMemory: 0,
            currentMemory: 0,
            peakMemory: 0,
            gcCount: 0,
            lastGCTime: 0
        };
        
        this.startMonitoring();
    }
    
    /**
     * 开始内存监控
     */
    startMonitoring() {
        if (performance.memory) {
            this.memoryStats.initialMemory = performance.memory.usedJSHeapSize;
        }
        
        // 定期执行内存清理
        setInterval(() => {
            this.performCleanup();
        }, this.gcInterval);
        
        console.log('内存管理器已启动');
    }
    
    /**
     * 跟踪对象
     * @param {Object} obj - 要跟踪的对象
     */
    trackObject(obj) {
        if (obj && typeof obj === 'object') {
            this.trackedObjects.add(obj);
        }
    }
    
    /**
     * 注册清理任务
     * @param {Function} cleanupFn - 清理函数
     * @param {string} description - 任务描述
     */
    registerCleanupTask(cleanupFn, description = '') {
        this.cleanupTasks.push({
            fn: cleanupFn,
            description: description,
            lastRun: 0
        });
    }
    
    /**
     * 执行内存清理
     */
    performCleanup() {
        const startTime = performance.now();
        
        // 更新内存统计
        this.updateMemoryStats();
        
        // 执行注册的清理任务
        this.cleanupTasks.forEach(task => {
            try {
                task.fn();
                task.lastRun = Date.now();
            } catch (error) {
                console.error(`清理任务执行失败 [${task.description}]:`, error);
            }
        });
        
        // 清理对象池
        if (window.objectPoolManager) {
            objectPoolManager.trimAll(30);
        }
        
        // 建议垃圾回收
        this.suggestGarbageCollection();
        
        const cleanupTime = performance.now() - startTime;
        this.memoryStats.gcCount++;
        this.memoryStats.lastGCTime = cleanupTime;
        
        if (GameConfig.DEBUG) {
            console.log(`内存清理完成，耗时: ${cleanupTime.toFixed(2)}ms`);
        }
    }
    
    /**
     * 更新内存统计
     */
    updateMemoryStats() {
        if (performance.memory) {
            this.memoryStats.currentMemory = performance.memory.usedJSHeapSize;
            this.memoryStats.peakMemory = Math.max(
                this.memoryStats.peakMemory,
                this.memoryStats.currentMemory
            );
        }
    }
    
    /**
     * 建议垃圾回收
     */
    suggestGarbageCollection() {
        // 在支持的浏览器中建议垃圾回收
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
    }
    
    /**
     * 清理事件监听器
     * @param {Element} element - DOM元素
     */
    cleanupEventListeners(element) {
        if (element && element.cloneNode) {
            const newElement = element.cloneNode(true);
            if (element.parentNode) {
                element.parentNode.replaceChild(newElement, element);
            }
            return newElement;
        }
        return element;
    }
    
    /**
     * 清理数组
     * @param {Array} array - 要清理的数组
     */
    clearArray(array) {
        if (Array.isArray(array)) {
            array.length = 0;
        }
    }
    
    /**
     * 清理Map
     * @param {Map} map - 要清理的Map
     */
    clearMap(map) {
        if (map instanceof Map) {
            map.clear();
        }
    }
    
    /**
     * 清理Set
     * @param {Set} set - 要清理的Set
     */
    clearSet(set) {
        if (set instanceof Set) {
            set.clear();
        }
    }
    
    /**
     * 安全删除对象属性
     * @param {Object} obj - 对象
     * @param {string} prop - 属性名
     */
    safeDelete(obj, prop) {
        if (obj && obj.hasOwnProperty(prop)) {
            try {
                delete obj[prop];
            } catch (error) {
                obj[prop] = null;
            }
        }
    }
    
    /**
     * 检查内存泄漏
     * @returns {Object} 内存泄漏报告
     */
    checkMemoryLeaks() {
        const report = {
            hasLeaks: false,
            warnings: [],
            recommendations: []
        };
        
        if (performance.memory) {
            const currentMemory = performance.memory.usedJSHeapSize;
            const initialMemory = this.memoryStats.initialMemory;
            const memoryGrowth = currentMemory - initialMemory;
            const growthRatio = memoryGrowth / initialMemory;
            
            // 检查内存增长
            if (growthRatio > 2.0) { // 内存增长超过200%
                report.hasLeaks = true;
                report.warnings.push('内存使用量显著增长，可能存在内存泄漏');
                report.recommendations.push('检查是否有未清理的事件监听器');
                report.recommendations.push('检查是否有循环引用');
            }
            
            // 检查内存峰值
            if (this.memoryStats.peakMemory > 100 * 1024 * 1024) { // 100MB
                report.warnings.push('内存峰值过高');
                report.recommendations.push('考虑使用对象池减少内存分配');
            }
        }
        
        return report;
    }
    
    /**
     * 获取内存统计
     * @returns {Object} 内存统计信息
     */
    getMemoryStats() {
        this.updateMemoryStats();
        
        const stats = { ...this.memoryStats };
        
        // 转换为MB
        if (performance.memory) {
            stats.initialMemoryMB = (stats.initialMemory / 1024 / 1024).toFixed(2);
            stats.currentMemoryMB = (stats.currentMemory / 1024 / 1024).toFixed(2);
            stats.peakMemoryMB = (stats.peakMemory / 1024 / 1024).toFixed(2);
            stats.totalMemoryMB = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
        }
        
        return stats;
    }
    
    /**
     * 强制垃圾回收
     */
    forceGarbageCollection() {
        // 清理所有对象池
        if (window.objectPoolManager) {
            objectPoolManager.releaseAll();
        }
        
        // 执行所有清理任务
        this.performCleanup();
        
        // 建议垃圾回收
        this.suggestGarbageCollection();
        
        console.log('已执行强制垃圾回收');
    }
    
    /**
     * 渲染内存信息
     * @param {Renderer} renderer - 渲染器
     */
    renderMemoryInfo(renderer) {
        if (!GameConfig.DEBUG) return;
        
        const stats = this.getMemoryStats();
        let y = 400;
        const lineHeight = 14;
        
        renderer.drawText('内存管理:', 10, y, '#ff00ff', '14px Arial');
        y += lineHeight;
        
        if (performance.memory) {
            renderer.drawText(`当前: ${stats.currentMemoryMB}MB`, 10, y, '#ffffff', '12px Arial');
            y += lineHeight;
            
            renderer.drawText(`峰值: ${stats.peakMemoryMB}MB`, 10, y, '#ffffff', '12px Arial');
            y += lineHeight;
            
            renderer.drawText(`总计: ${stats.totalMemoryMB}MB`, 10, y, '#ffffff', '12px Arial');
            y += lineHeight;
        }
        
        renderer.drawText(`GC次数: ${stats.gcCount}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        renderer.drawText(`上次GC: ${stats.lastGCTime.toFixed(2)}ms`, 10, y, '#ffffff', '12px Arial');
    }
    
    /**
     * 销毁内存管理器
     */
    destroy() {
        // 执行最后一次清理
        this.performCleanup();
        
        // 清理自身
        this.cleanupTasks = [];
        
        console.log('内存管理器已销毁');
    }
}

// 创建全局内存管理器实例
const memoryManager = new MemoryManager();