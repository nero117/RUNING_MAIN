/**
 * 性能监控器
 * 监控游戏性能指标，提供优化建议和调试信息
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: {
                current: 0,
                average: 0,
                min: Infinity,
                max: 0,
                history: []
            },
            frameTime: {
                current: 0,
                average: 0,
                min: Infinity,
                max: 0,
                history: []
            },
            memory: {
                used: 0,
                total: 0,
                peak: 0
            },
            renderCalls: {
                current: 0,
                total: 0,
                average: 0
            },
            entities: {
                active: 0,
                total: 0,
                rendered: 0
            }
        };
        
        this.isEnabled = GameConfig.DEBUG || false;
        this.historySize = 60; // 保存60帧的历史数据
        this.updateInterval = 1000; // 每秒更新一次统计
        this.lastUpdateTime = 0;
        this.frameCount = 0;
        
        // 性能警告阈值
        this.thresholds = {
            lowFPS: 30,
            highFrameTime: 33.33, // 30fps对应的帧时间
            memoryWarning: 100 * 1024 * 1024, // 100MB
            renderCallsWarning: 1000
        };
        
        this.warnings = [];
        this.recommendations = [];
    }
    
    /**
     * 开始帧测量
     */
    startFrame() {
        if (!this.isEnabled) return;
        
        this.frameStartTime = performance.now();
        this.frameCount++;
    }
    
    /**
     * 结束帧测量
     */
    endFrame() {
        if (!this.isEnabled) return;
        
        const frameTime = performance.now() - this.frameStartTime;
        const fps = 1000 / frameTime;
        
        this.updateMetric('fps', fps);
        this.updateMetric('frameTime', frameTime);
        
        // 定期更新统计信息
        if (performance.now() - this.lastUpdateTime >= this.updateInterval) {
            this.updateStatistics();
            this.checkPerformanceWarnings();
            this.generateRecommendations();
            this.lastUpdateTime = performance.now();
        }
    }
    
    /**
     * 更新指标
     * @param {string} metricName - 指标名称
     * @param {number} value - 当前值
     */
    updateMetric(metricName, value) {
        const metric = this.metrics[metricName];
        if (!metric) return;
        
        metric.current = value;
        metric.min = Math.min(metric.min, value);
        metric.max = Math.max(metric.max, value);
        
        // 添加到历史记录
        metric.history.push(value);
        if (metric.history.length > this.historySize) {
            metric.history.shift();
        }
        
        // 计算平均值
        metric.average = metric.history.reduce((sum, val) => sum + val, 0) / metric.history.length;
    }
    
    /**
     * 更新统计信息
     */
    updateStatistics() {
        // 更新内存使用情况
        if (performance.memory) {
            this.metrics.memory.used = performance.memory.usedJSHeapSize;
            this.metrics.memory.total = performance.memory.totalJSHeapSize;
            this.metrics.memory.peak = Math.max(this.metrics.memory.peak, this.metrics.memory.used);
        }
    }
    
    /**
     * 记录渲染调用
     * @param {number} calls - 渲染调用次数
     */
    recordRenderCalls(calls) {
        if (!this.isEnabled) return;
        
        this.metrics.renderCalls.current = calls;
        this.metrics.renderCalls.total += calls;
        this.metrics.renderCalls.average = this.metrics.renderCalls.total / this.frameCount;
    }
    
    /**
     * 记录实体数量
     * @param {number} active - 活跃实体数量
     * @param {number} total - 总实体数量
     * @param {number} rendered - 渲染的实体数量
     */
    recordEntityCount(active, total, rendered) {
        if (!this.isEnabled) return;
        
        this.metrics.entities.active = active;
        this.metrics.entities.total = total;
        this.metrics.entities.rendered = rendered;
    }
    
    /**
     * 检查性能警告
     */
    checkPerformanceWarnings() {
        this.warnings = [];
        
        // 检查FPS
        if (this.metrics.fps.average < this.thresholds.lowFPS) {
            this.warnings.push({
                type: 'performance',
                severity: 'high',
                message: `FPS过低: ${this.metrics.fps.average.toFixed(1)} (目标: ${this.thresholds.lowFPS}+)`
            });
        }
        
        // 检查帧时间
        if (this.metrics.frameTime.average > this.thresholds.highFrameTime) {
            this.warnings.push({
                type: 'performance',
                severity: 'medium',
                message: `帧时间过长: ${this.metrics.frameTime.average.toFixed(2)}ms`
            });
        }
        
        // 检查内存使用
        if (this.metrics.memory.used > this.thresholds.memoryWarning) {
            this.warnings.push({
                type: 'memory',
                severity: 'medium',
                message: `内存使用过高: ${(this.metrics.memory.used / 1024 / 1024).toFixed(1)}MB`
            });
        }
        
        // 检查渲染调用
        if (this.metrics.renderCalls.current > this.thresholds.renderCallsWarning) {
            this.warnings.push({
                type: 'rendering',
                severity: 'low',
                message: `渲染调用过多: ${this.metrics.renderCalls.current}`
            });
        }
    }
    
    /**
     * 生成优化建议
     */
    generateRecommendations() {
        this.recommendations = [];
        
        // 基于FPS的建议
        if (this.metrics.fps.average < 45) {
            this.recommendations.push('考虑减少同时渲染的实体数量');
            this.recommendations.push('优化碰撞检测算法');
            this.recommendations.push('使用对象池减少垃圾回收');
        }
        
        // 基于渲染调用的建议
        if (this.metrics.renderCalls.average > 500) {
            this.recommendations.push('合并相似的渲染调用');
            this.recommendations.push('使用精灵批处理');
        }
        
        // 基于内存的建议
        if (this.metrics.memory.used > 50 * 1024 * 1024) {
            this.recommendations.push('及时清理不用的对象');
            this.recommendations.push('优化纹理和音频资源');
        }
    }
    
    /**
     * 获取性能报告
     * @returns {Object} 性能报告
     */
    getPerformanceReport() {
        return {
            metrics: JSON.parse(JSON.stringify(this.metrics)),
            warnings: [...this.warnings],
            recommendations: [...this.recommendations],
            timestamp: Date.now()
        };
    }
    
    /**
     * 重置统计信息
     */
    reset() {
        for (const metric of Object.values(this.metrics)) {
            if (metric.history) {
                metric.current = 0;
                metric.average = 0;
                metric.min = Infinity;
                metric.max = 0;
                metric.history = [];
            }
        }
        
        this.frameCount = 0;
        this.warnings = [];
        this.recommendations = [];
    }
    
    /**
     * 启用/禁用性能监控
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.reset();
        }
    }
    
    /**
     * 渲染性能信息
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        if (!this.isEnabled) return;
        
        const x = GameConfig.CANVAS_WIDTH - 250;
        let y = 20;
        const lineHeight = 16;
        
        // 绘制背景
        renderer.setGlobalAlpha(0.8);
        renderer.fillRect(x - 10, y - 5, 240, 200, '#000000');
        renderer.strokeRect(x - 10, y - 5, 240, 200, '#333333', 1);
        renderer.resetGlobalAlpha();
        
        // 绘制标题
        renderer.drawText('性能监控', x, y, '#00ff00', 'bold 14px Arial');
        y += lineHeight + 5;
        
        // 绘制FPS信息
        const fpsColor = this.metrics.fps.current < this.thresholds.lowFPS ? '#ff0000' : '#00ff00';
        renderer.drawText(`FPS: ${this.metrics.fps.current.toFixed(1)}`, x, y, fpsColor, '12px Arial');
        renderer.drawText(`平均: ${this.metrics.fps.average.toFixed(1)}`, x + 80, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        // 绘制帧时间
        const frameTimeColor = this.metrics.frameTime.current > this.thresholds.highFrameTime ? '#ff0000' : '#00ff00';
        renderer.drawText(`帧时间: ${this.metrics.frameTime.current.toFixed(2)}ms`, x, y, frameTimeColor, '12px Arial');
        y += lineHeight;
        
        // 绘制内存信息
        if (this.metrics.memory.used > 0) {
            const memoryMB = (this.metrics.memory.used / 1024 / 1024).toFixed(1);
            const memoryColor = this.metrics.memory.used > this.thresholds.memoryWarning ? '#ff0000' : '#ffffff';
            renderer.drawText(`内存: ${memoryMB}MB`, x, y, memoryColor, '12px Arial');
            y += lineHeight;
        }
        
        // 绘制渲染信息
        renderer.drawText(`渲染调用: ${this.metrics.renderCalls.current}`, x, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        // 绘制实体信息
        renderer.drawText(`实体: ${this.metrics.entities.active}/${this.metrics.entities.total}`, x, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        // 绘制警告
        if (this.warnings.length > 0) {
            y += 5;
            renderer.drawText('警告:', x, y, '#ffff00', 'bold 12px Arial');
            y += lineHeight;
            
            this.warnings.slice(0, 3).forEach(warning => {
                const color = warning.severity === 'high' ? '#ff0000' : 
                             warning.severity === 'medium' ? '#ff8800' : '#ffff00';
                renderer.drawText(`• ${warning.message}`, x, y, color, '10px Arial');
                y += lineHeight - 2;
            });
        }
    }
    
    /**
     * 导出性能数据
     * @returns {string} JSON格式的性能数据
     */
    exportData() {
        return JSON.stringify(this.getPerformanceReport(), null, 2);
    }
    
    /**
     * 记录性能事件
     * @param {string} eventName - 事件名称
     * @param {number} duration - 持续时间（毫秒）
     */
    recordEvent(eventName, duration) {
        if (!this.isEnabled) return;
        
        console.log(`性能事件 [${eventName}]: ${duration.toFixed(2)}ms`);
    }
}