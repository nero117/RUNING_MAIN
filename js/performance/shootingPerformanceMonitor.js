/**
 * 射击系统性能监控器
 * 专门监控射击相关系统的性能指标
 */
class ShootingPerformanceMonitor {
    constructor() {
        this.metrics = {
            bullets: {
                created: 0,
                destroyed: 0,
                active: 0,
                poolHits: 0,
                poolMisses: 0,
                collisionChecks: 0,
                collisionHits: 0,
                updateTime: 0,
                renderTime: 0
            },
            effects: {
                created: 0,
                destroyed: 0,
                active: 0,
                poolHits: 0,
                poolMisses: 0,
                updateTime: 0,
                renderTime: 0,
                particleCount: 0
            },
            shooting: {
                shotsPerSecond: 0,
                averageAccuracy: 0,
                totalShots: 0,
                totalHits: 0,
                maxConcurrentBullets: 0,
                maxConcurrentEffects: 0
            },
            performance: {
                frameTime: 0,
                averageFrameTime: 0,
                worstFrameTime: 0,
                memoryUsage: 0,
                gcCount: 0
            }
        };
        
        // 性能历史记录
        this.history = {
            frameTime: [],
            bulletCount: [],
            effectCount: [],
            shotsPerSecond: [],
            maxHistorySize: 300 // 5秒历史（60fps）
        };
        
        // 计时器
        this.timers = {
            bulletUpdate: 0,
            bulletRender: 0,
            effectUpdate: 0,
            effectRender: 0,
            collision: 0
        };
        
        // 性能阈值
        this.thresholds = {
            maxBullets: 50,
            maxEffects: 30,
            maxFrameTime: 16.67, // 60fps
            maxMemoryUsage: 100 * 1024 * 1024, // 100MB
            warningFrameTime: 20, // 50fps
            criticalFrameTime: 33.33 // 30fps
        };
        
        // 优化建议
        this.optimizationSuggestions = [];
        
        // 自动优化标志
        this.autoOptimizationEnabled = true;
        
        this.startTime = performance.now();
        this.lastUpdateTime = this.startTime;
        
        console.log('射击性能监控器已初始化');
    }
    
    /**
     * 开始计时
     * @param {string} timerName - 计时器名称
     */
    startTimer(timerName) {
        this.timers[timerName] = performance.now();
    }
    
    /**
     * 结束计时并记录
     * @param {string} timerName - 计时器名称
     * @returns {number} 经过的时间（毫秒）
     */
    endTimer(timerName) {
        if (this.timers[timerName]) {
            const elapsed = performance.now() - this.timers[timerName];
            
            // 根据计时器类型更新相应指标
            switch (timerName) {
                case 'bulletUpdate':
                    this.metrics.bullets.updateTime = elapsed;
                    break;
                case 'bulletRender':
                    this.metrics.bullets.renderTime = elapsed;
                    break;
                case 'effectUpdate':
                    this.metrics.effects.updateTime = elapsed;
                    break;
                case 'effectRender':
                    this.metrics.effects.renderTime = elapsed;
                    break;
            }
            
            return elapsed;
        }
        return 0;
    }
    
    /**
     * 记录子弹指标
     * @param {Object} bulletStats - 子弹统计信息
     */
    recordBulletMetrics(bulletStats) {
        this.metrics.bullets.created = bulletStats.totalCreated || 0;
        this.metrics.bullets.destroyed = bulletStats.totalDestroyed || 0;
        this.metrics.bullets.active = bulletStats.currentActive || 0;
        this.metrics.bullets.poolHits = bulletStats.poolHits || 0;
        this.metrics.bullets.poolMisses = bulletStats.poolMisses || 0;
        
        // 更新最大并发子弹数
        if (this.metrics.bullets.active > this.metrics.shooting.maxConcurrentBullets) {
            this.metrics.shooting.maxConcurrentBullets = this.metrics.bullets.active;
        }
        
        // 记录历史
        this.addToHistory('bulletCount', this.metrics.bullets.active);
    }
    
    /**
     * 记录效果指标
     * @param {Object} effectStats - 效果统计信息
     */
    recordEffectMetrics(effectStats) {
        this.metrics.effects.created = effectStats.totalCreated || 0;
        this.metrics.effects.destroyed = effectStats.totalDestroyed || 0;
        this.metrics.effects.active = effectStats.activeEffects || 0;
        this.metrics.effects.particleCount = effectStats.particleCount || 0;
        
        // 更新最大并发效果数
        if (this.metrics.effects.active > this.metrics.shooting.maxConcurrentEffects) {
            this.metrics.shooting.maxConcurrentEffects = this.metrics.effects.active;
        }
        
        // 记录历史
        this.addToHistory('effectCount', this.metrics.effects.active);
    }
    
    /**
     * 记录碰撞检测指标
     * @param {Object} collisionStats - 碰撞统计信息
     */
    recordCollisionMetrics(collisionStats) {
        this.metrics.bullets.collisionChecks = collisionStats.totalChecks || 0;
        this.metrics.bullets.collisionHits = collisionStats.collisionsDetected || 0;
    }
    
    /**
     * 记录射击指标
     * @param {Object} shootingStats - 射击统计信息
     */
    recordShootingMetrics(shootingStats) {
        this.metrics.shooting.totalShots = shootingStats.shotsFired || 0;
        this.metrics.shooting.totalHits = shootingStats.shotsHit || 0;
        
        // 计算准确率
        if (this.metrics.shooting.totalShots > 0) {
            this.metrics.shooting.averageAccuracy = 
                (this.metrics.shooting.totalHits / this.metrics.shooting.totalShots) * 100;
        }
        
        // 计算每秒射击数
        const currentTime = performance.now();
        const elapsedSeconds = (currentTime - this.startTime) / 1000;
        if (elapsedSeconds > 0) {
            this.metrics.shooting.shotsPerSecond = this.metrics.shooting.totalShots / elapsedSeconds;
        }
        
        // 记录历史
        this.addToHistory('shotsPerSecond', this.metrics.shooting.shotsPerSecond);
    }
    
    /**
     * 记录帧性能
     * @param {number} frameTime - 帧时间（毫秒）
     */
    recordFramePerformance(frameTime) {
        this.metrics.performance.frameTime = frameTime;
        
        // 更新平均帧时间
        this.addToHistory('frameTime', frameTime);
        const frameHistory = this.history.frameTime;
        if (frameHistory.length > 0) {
            const sum = frameHistory.reduce((a, b) => a + b, 0);
            this.metrics.performance.averageFrameTime = sum / frameHistory.length;
        }
        
        // 更新最差帧时间
        if (frameTime > this.metrics.performance.worstFrameTime) {
            this.metrics.performance.worstFrameTime = frameTime;
        }
        
        // 检查性能阈值
        this.checkPerformanceThresholds();
    }
    
    /**
     * 添加数据到历史记录
     * @param {string} type - 数据类型
     * @param {number} value - 数值
     */
    addToHistory(type, value) {
        if (!this.history[type]) {
            this.history[type] = [];
        }
        
        this.history[type].push(value);
        
        // 限制历史记录大小
        if (this.history[type].length > this.history.maxHistorySize) {
            this.history[type].shift();
        }
    }
    
    /**
     * 检查性能阈值并生成优化建议
     */
    checkPerformanceThresholds() {
        this.optimizationSuggestions = [];
        
        // 检查子弹数量
        if (this.metrics.bullets.active > this.thresholds.maxBullets) {
            this.optimizationSuggestions.push({
                type: 'warning',
                category: 'bullets',
                message: `子弹数量过多 (${this.metrics.bullets.active}/${this.thresholds.maxBullets})`,
                suggestion: '考虑减少子弹生存时间或增加清理频率'
            });
        }
        
        // 检查效果数量
        if (this.metrics.effects.active > this.thresholds.maxEffects) {
            this.optimizationSuggestions.push({
                type: 'warning',
                category: 'effects',
                message: `效果数量过多 (${this.metrics.effects.active}/${this.thresholds.maxEffects})`,
                suggestion: '考虑减少效果持续时间或粒子数量'
            });
        }
        
        // 检查帧时间
        if (this.metrics.performance.frameTime > this.thresholds.criticalFrameTime) {
            this.optimizationSuggestions.push({
                type: 'critical',
                category: 'performance',
                message: `帧时间过长 (${this.metrics.performance.frameTime.toFixed(2)}ms)`,
                suggestion: '需要立即优化渲染或更新逻辑'
            });
        } else if (this.metrics.performance.frameTime > this.thresholds.warningFrameTime) {
            this.optimizationSuggestions.push({
                type: 'warning',
                category: 'performance',
                message: `帧时间较长 (${this.metrics.performance.frameTime.toFixed(2)}ms)`,
                suggestion: '考虑优化渲染或减少实体数量'
            });
        }
        
        // 检查对象池效率
        const bulletPoolEfficiency = this.getBulletPoolEfficiency();
        if (bulletPoolEfficiency < 70) {
            this.optimizationSuggestions.push({
                type: 'info',
                category: 'pool',
                message: `子弹对象池效率较低 (${bulletPoolEfficiency.toFixed(1)}%)`,
                suggestion: '考虑增加对象池大小'
            });
        }
        
        // 自动优化
        if (this.autoOptimizationEnabled) {
            this.performAutoOptimization();
        }
    }
    
    /**
     * 执行自动优化
     */
    performAutoOptimization() {
        // 如果帧时间过长，自动减少实体数量
        if (this.metrics.performance.frameTime > this.thresholds.criticalFrameTime) {
            console.warn('🚨 性能严重下降，启动自动优化...');
            
            // 触发清理事件
            if (window.memoryManager) {
                window.memoryManager.forceCleanup();
            }
        }
    }
    
    /**
     * 获取子弹对象池效率
     * @returns {number} 效率百分比
     */
    getBulletPoolEfficiency() {
        const total = this.metrics.bullets.poolHits + this.metrics.bullets.poolMisses;
        if (total === 0) return 100;
        return (this.metrics.bullets.poolHits / total) * 100;
    }
    
    /**
     * 获取效果对象池效率
     * @returns {number} 效率百分比
     */
    getEffectPoolEfficiency() {
        const total = this.metrics.effects.poolHits + this.metrics.effects.poolMisses;
        if (total === 0) return 100;
        return (this.metrics.effects.poolHits / total) * 100;
    }
    
    /**
     * 获取性能报告
     * @returns {Object} 性能报告
     */
    getPerformanceReport() {
        return {
            summary: {
                fps: this.metrics.performance.frameTime > 0 ? 1000 / this.metrics.performance.frameTime : 0,
                averageFps: this.metrics.performance.averageFrameTime > 0 ? 1000 / this.metrics.performance.averageFrameTime : 0,
                bulletPoolEfficiency: this.getBulletPoolEfficiency(),
                effectPoolEfficiency: this.getEffectPoolEfficiency(),
                accuracy: this.metrics.shooting.averageAccuracy,
                shotsPerSecond: this.metrics.shooting.shotsPerSecond
            },
            metrics: this.metrics,
            suggestions: this.optimizationSuggestions,
            history: this.history
        };
    }
    
    /**
     * 重置统计信息
     */
    reset() {
        // 保留累计统计，重置性能指标
        this.metrics.performance = {
            frameTime: 0,
            averageFrameTime: 0,
            worstFrameTime: 0,
            memoryUsage: 0,
            gcCount: 0
        };
        
        this.history = {
            frameTime: [],
            bulletCount: [],
            effectCount: [],
            shotsPerSecond: [],
            maxHistorySize: 300
        };
        
        this.optimizationSuggestions = [];
        this.startTime = performance.now();
        
        console.log('射击性能监控器已重置');
    }
    
    /**
     * 渲染性能信息
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        if (!GameConfig.DEBUG) return;
        
        const x = 10;
        let y = 300;
        const lineHeight = 14;
        
        // 标题
        renderer.drawText('射击系统性能监控', x, y, '#ffff00', '14px Arial');
        y += lineHeight + 5;
        
        // FPS信息
        const fps = this.metrics.performance.frameTime > 0 ? 1000 / this.metrics.performance.frameTime : 0;
        const avgFps = this.metrics.performance.averageFrameTime > 0 ? 1000 / this.metrics.performance.averageFrameTime : 0;
        
        renderer.drawText(`FPS: ${fps.toFixed(1)} (平均: ${avgFps.toFixed(1)})`, x, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        // 子弹信息
        renderer.drawText(
            `子弹: ${this.metrics.bullets.active} 活跃, 池效率: ${this.getBulletPoolEfficiency().toFixed(1)}%`,
            x, y, '#ffffff', '12px Arial'
        );
        y += lineHeight;
        
        // 效果信息
        renderer.drawText(
            `效果: ${this.metrics.effects.active} 活跃, 粒子: ${this.metrics.effects.particleCount}`,
            x, y, '#ffffff', '12px Arial'
        );
        y += lineHeight;
        
        // 射击统计
        renderer.drawText(
            `射击: ${this.metrics.shooting.shotsPerSecond.toFixed(1)}/s, 准确率: ${this.metrics.shooting.averageAccuracy.toFixed(1)}%`,
            x, y, '#ffffff', '12px Arial'
        );
        y += lineHeight;
        
        // 性能警告
        this.optimizationSuggestions.forEach(suggestion => {
            const color = suggestion.type === 'critical' ? '#ff0000' : 
                         suggestion.type === 'warning' ? '#ffaa00' : '#ffff00';
            
            renderer.drawText(`⚠ ${suggestion.message}`, x, y, color, '10px Arial');
            y += lineHeight;
        });
        
        // 性能图表（简化版）
        this.renderPerformanceGraph(renderer, x + 200, 300);
    }
    
    /**
     * 渲染性能图表
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    renderPerformanceGraph(renderer, x, y) {
        const width = 150;
        const height = 60;
        
        // 绘制背景
        renderer.setGlobalAlpha(0.3);
        renderer.fillRect(x, y, width, height, '#000000');
        renderer.resetGlobalAlpha();
        
        // 绘制边框
        renderer.drawRect(x, y, width, height, '#ffffff');
        
        // 绘制FPS历史
        const frameHistory = this.history.frameTime;
        if (frameHistory.length > 1) {
            const maxFrameTime = Math.max(...frameHistory, this.thresholds.maxFrameTime);
            
            renderer.ctx.strokeStyle = '#00ff00';
            renderer.ctx.lineWidth = 1;
            renderer.ctx.beginPath();
            
            for (let i = 0; i < frameHistory.length; i++) {
                const graphX = x + (i / frameHistory.length) * width;
                const graphY = y + height - (frameHistory[i] / maxFrameTime) * height;
                
                if (i === 0) {
                    renderer.ctx.moveTo(graphX, graphY);
                } else {
                    renderer.ctx.lineTo(graphX, graphY);
                }
            }
            
            renderer.ctx.stroke();
        }
        
        // 绘制阈值线
        const thresholdY = y + height - (this.thresholds.maxFrameTime / 33.33) * height;
        renderer.drawLine(x, thresholdY, x + width, thresholdY, '#ff0000', 1);
        
        // 标签
        renderer.drawText('FPS历史', x, y - 5, '#ffffff', '10px Arial');
    }
    
    /**
     * 导出性能数据
     * @returns {string} JSON格式的性能数据
     */
    exportData() {
        const report = this.getPerformanceReport();
        return JSON.stringify(report, null, 2);
    }
    
    /**
     * 启用/禁用自动优化
     * @param {boolean} enabled - 是否启用
     */
    setAutoOptimization(enabled) {
        this.autoOptimizationEnabled = enabled;
        console.log(`自动优化已${enabled ? '启用' : '禁用'}`);
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.shootingPerformanceMonitor = new ShootingPerformanceMonitor();
}