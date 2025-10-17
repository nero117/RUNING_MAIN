/**
 * 性能优化器
 * 自动监控和优化射击系统性能
 */
class PerformanceOptimizer {
    constructor() {
        this.isEnabled = true;
        this.optimizationLevel = 'auto'; // 'low', 'medium', 'high', 'auto'
        
        // 性能阈值配置
        this.thresholds = {
            fps: {
                critical: 20,    // 低于20fps为严重
                warning: 40,     // 低于40fps为警告
                target: 60       // 目标60fps
            },
            entities: {
                bullets: {
                    warning: 30,
                    critical: 50,
                    max: 60
                },
                effects: {
                    warning: 20,
                    critical: 35,
                    max: 40
                },
                particles: {
                    warning: 100,
                    critical: 200,
                    max: 250
                }
            },
            memory: {
                warning: 50 * 1024 * 1024,  // 50MB
                critical: 100 * 1024 * 1024  // 100MB
            }
        };
        
        // 优化策略
        this.strategies = {
            bulletOptimization: {
                enabled: true,
                reduceLifetime: true,
                limitConcurrent: true,
                improvePooling: true
            },
            effectOptimization: {
                enabled: true,
                reduceParticles: true,
                shortenDuration: true,
                skipComplexEffects: false
            },
            renderOptimization: {
                enabled: true,
                cullOffscreen: true,
                reduceLOD: true,
                skipTrails: false
            },
            memoryOptimization: {
                enabled: true,
                forceGC: false,
                aggressiveCleanup: true,
                poolExpansion: false
            }
        };
        
        // 优化历史
        this.optimizationHistory = [];
        this.maxHistorySize = 100;
        
        // 自动优化定时器
        this.optimizationInterval = null;
        this.monitoringInterval = 1000; // 每秒检查一次
        
        // 性能基线
        this.baseline = {
            fps: 60,
            bulletCount: 0,
            effectCount: 0,
            memoryUsage: 0
        };
        
        this.startMonitoring();
        
        console.log('性能优化器已初始化');
    }
    
    /**
     * 开始性能监控
     */
    startMonitoring() {
        if (this.optimizationInterval) {
            clearInterval(this.optimizationInterval);
        }
        
        this.optimizationInterval = setInterval(() => {
            if (this.isEnabled) {
                this.performOptimizationCheck();
            }
        }, this.monitoringInterval);
    }
    
    /**
     * 停止性能监控
     */
    stopMonitoring() {
        if (this.optimizationInterval) {
            clearInterval(this.optimizationInterval);
            this.optimizationInterval = null;
        }
    }
    
    /**
     * 执行优化检查
     */
    performOptimizationCheck() {
        const metrics = this.gatherPerformanceMetrics();
        const issues = this.analyzePerformance(metrics);
        
        if (issues.length > 0) {
            const optimizations = this.planOptimizations(issues, metrics);
            this.executeOptimizations(optimizations);
        }
    }
    
    /**
     * 收集性能指标
     * @returns {Object} 性能指标
     */
    gatherPerformanceMetrics() {
        const metrics = {
            fps: 0,
            frameTime: 0,
            bulletCount: 0,
            effectCount: 0,
            particleCount: 0,
            memoryUsage: 0,
            poolEfficiency: {
                bullets: 100,
                effects: 100
            }
        };
        
        // 从射击性能监控器获取数据
        if (window.shootingPerformanceMonitor) {
            const report = window.shootingPerformanceMonitor.getPerformanceReport();
            metrics.fps = report.summary.fps;
            metrics.frameTime = window.shootingPerformanceMonitor.metrics.performance.frameTime;
            metrics.bulletCount = window.shootingPerformanceMonitor.metrics.bullets.active;
            metrics.effectCount = window.shootingPerformanceMonitor.metrics.effects.active;
            metrics.particleCount = window.shootingPerformanceMonitor.metrics.effects.particleCount;
            metrics.poolEfficiency.bullets = report.summary.bulletPoolEfficiency;
            metrics.poolEfficiency.effects = report.summary.effectPoolEfficiency;
        }
        
        // 估算内存使用量
        if (performance.memory) {
            metrics.memoryUsage = performance.memory.usedJSHeapSize;
        }
        
        return metrics;
    }
    
    /**
     * 分析性能问题
     * @param {Object} metrics - 性能指标
     * @returns {Array} 问题列表
     */
    analyzePerformance(metrics) {
        const issues = [];
        
        // FPS检查
        if (metrics.fps < this.thresholds.fps.critical) {
            issues.push({
                type: 'fps',
                severity: 'critical',
                value: metrics.fps,
                threshold: this.thresholds.fps.critical,
                message: `FPS严重过低: ${metrics.fps.toFixed(1)}`
            });
        } else if (metrics.fps < this.thresholds.fps.warning) {
            issues.push({
                type: 'fps',
                severity: 'warning',
                value: metrics.fps,
                threshold: this.thresholds.fps.warning,
                message: `FPS过低: ${metrics.fps.toFixed(1)}`
            });
        }
        
        // 子弹数量检查
        if (metrics.bulletCount > this.thresholds.entities.bullets.critical) {
            issues.push({
                type: 'bullets',
                severity: 'critical',
                value: metrics.bulletCount,
                threshold: this.thresholds.entities.bullets.critical,
                message: `子弹数量过多: ${metrics.bulletCount}`
            });
        } else if (metrics.bulletCount > this.thresholds.entities.bullets.warning) {
            issues.push({
                type: 'bullets',
                severity: 'warning',
                value: metrics.bulletCount,
                threshold: this.thresholds.entities.bullets.warning,
                message: `子弹数量较多: ${metrics.bulletCount}`
            });
        }
        
        // 效果数量检查
        if (metrics.effectCount > this.thresholds.entities.effects.critical) {
            issues.push({
                type: 'effects',
                severity: 'critical',
                value: metrics.effectCount,
                threshold: this.thresholds.entities.effects.critical,
                message: `效果数量过多: ${metrics.effectCount}`
            });
        } else if (metrics.effectCount > this.thresholds.entities.effects.warning) {
            issues.push({
                type: 'effects',
                severity: 'warning',
                value: metrics.effectCount,
                threshold: this.thresholds.entities.effects.warning,
                message: `效果数量较多: ${metrics.effectCount}`
            });
        }
        
        // 粒子数量检查
        if (metrics.particleCount > this.thresholds.entities.particles.critical) {
            issues.push({
                type: 'particles',
                severity: 'critical',
                value: metrics.particleCount,
                threshold: this.thresholds.entities.particles.critical,
                message: `粒子数量过多: ${metrics.particleCount}`
            });
        } else if (metrics.particleCount > this.thresholds.entities.particles.warning) {
            issues.push({
                type: 'particles',
                severity: 'warning',
                value: metrics.particleCount,
                threshold: this.thresholds.entities.particles.warning,
                message: `粒子数量较多: ${metrics.particleCount}`
            });
        }
        
        // 内存使用检查
        if (metrics.memoryUsage > this.thresholds.memory.critical) {
            issues.push({
                type: 'memory',
                severity: 'critical',
                value: metrics.memoryUsage,
                threshold: this.thresholds.memory.critical,
                message: `内存使用过高: ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`
            });
        } else if (metrics.memoryUsage > this.thresholds.memory.warning) {
            issues.push({
                type: 'memory',
                severity: 'warning',
                value: metrics.memoryUsage,
                threshold: this.thresholds.memory.warning,
                message: `内存使用较高: ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`
            });
        }
        
        return issues;
    }
    
    /**
     * 规划优化策略
     * @param {Array} issues - 问题列表
     * @param {Object} metrics - 性能指标
     * @returns {Array} 优化操作列表
     */
    planOptimizations(issues, metrics) {
        const optimizations = [];
        
        // 根据问题严重程度排序
        const criticalIssues = issues.filter(issue => issue.severity === 'critical');
        const warningIssues = issues.filter(issue => issue.severity === 'warning');
        
        // 处理严重问题
        criticalIssues.forEach(issue => {
            switch (issue.type) {
                case 'fps':
                    optimizations.push({
                        type: 'emergency_cleanup',
                        priority: 'critical',
                        action: 'force_cleanup_all'
                    });
                    break;
                    
                case 'bullets':
                    optimizations.push({
                        type: 'bullet_limit',
                        priority: 'critical',
                        action: 'force_bullet_cleanup',
                        target: this.thresholds.entities.bullets.warning
                    });
                    break;
                    
                case 'effects':
                    optimizations.push({
                        type: 'effect_limit',
                        priority: 'critical',
                        action: 'force_effect_cleanup',
                        target: this.thresholds.entities.effects.warning
                    });
                    break;
                    
                case 'particles':
                    optimizations.push({
                        type: 'particle_reduction',
                        priority: 'critical',
                        action: 'reduce_particle_count',
                        factor: 0.5
                    });
                    break;
                    
                case 'memory':
                    optimizations.push({
                        type: 'memory_cleanup',
                        priority: 'critical',
                        action: 'force_garbage_collection'
                    });
                    break;
            }
        });
        
        // 处理警告问题
        warningIssues.forEach(issue => {
            switch (issue.type) {
                case 'bullets':
                    optimizations.push({
                        type: 'bullet_optimization',
                        priority: 'normal',
                        action: 'optimize_bullet_lifecycle'
                    });
                    break;
                    
                case 'effects':
                    optimizations.push({
                        type: 'effect_optimization',
                        priority: 'normal',
                        action: 'optimize_effect_rendering'
                    });
                    break;
            }
        });
        
        return optimizations;
    }
    
    /**
     * 执行优化操作
     * @param {Array} optimizations - 优化操作列表
     */
    executeOptimizations(optimizations) {
        optimizations.forEach(optimization => {
            try {
                this.executeOptimization(optimization);
                this.recordOptimization(optimization);
            } catch (error) {
                console.error('优化执行失败:', optimization, error);
            }
        });
    }
    
    /**
     * 执行单个优化操作
     * @param {Object} optimization - 优化操作
     */
    executeOptimization(optimization) {
        console.log(`🔧 执行优化: ${optimization.type} - ${optimization.action}`);
        
        switch (optimization.action) {
            case 'force_cleanup_all':
                this.forceCleanupAll();
                break;
                
            case 'force_bullet_cleanup':
                this.forceBulletCleanup(optimization.target);
                break;
                
            case 'force_effect_cleanup':
                this.forceEffectCleanup(optimization.target);
                break;
                
            case 'reduce_particle_count':
                this.reduceParticleCount(optimization.factor);
                break;
                
            case 'force_garbage_collection':
                this.forceGarbageCollection();
                break;
                
            case 'optimize_bullet_lifecycle':
                this.optimizeBulletLifecycle();
                break;
                
            case 'optimize_effect_rendering':
                this.optimizeEffectRendering();
                break;
        }
    }
    
    /**
     * 强制清理所有系统
     */
    forceCleanupAll() {
        // 清理内存管理器
        if (window.memoryManager) {
            window.memoryManager.forceCleanup();
        }
        
        // 清理对象池
        if (window.optimizedObjectPoolManager) {
            window.optimizedObjectPoolManager.performMaintenance();
        }
        
        console.log('🧹 执行了强制全面清理');
    }
    
    /**
     * 强制子弹清理
     * @param {number} targetCount - 目标数量
     */
    forceBulletCleanup(targetCount) {
        // 通过游戏场景访问子弹管理器
        if (window.gameEngine && window.gameEngine.sceneManager) {
            const currentScene = window.gameEngine.sceneManager.getCurrentScene();
            if (currentScene && currentScene.bulletManager) {
                const currentCount = currentScene.bulletManager.getBullets().length;
                if (currentCount > targetCount) {
                    const removeCount = currentCount - targetCount;
                    // 移除最老的子弹
                    const bullets = currentScene.bulletManager.bullets;
                    for (let i = 0; i < removeCount && bullets.length > 0; i++) {
                        const bullet = bullets.shift();
                        currentScene.bulletManager.removeBullet(bullet);
                    }
                    console.log(`🔫 强制清理了 ${removeCount} 个子弹`);
                }
            }
        }
    }
    
    /**
     * 强制效果清理
     * @param {number} targetCount - 目标数量
     */
    forceEffectCleanup(targetCount) {
        // 通过游戏场景访问效果系统
        if (window.gameEngine && window.gameEngine.sceneManager) {
            const currentScene = window.gameEngine.sceneManager.getCurrentScene();
            if (currentScene && currentScene.effectSystem) {
                const currentCount = currentScene.effectSystem.getActiveEffectCount();
                if (currentCount > targetCount) {
                    // 移除最老的效果
                    currentScene.effectSystem.removeFinishedEffects();
                    
                    // 如果还是太多，强制移除一些
                    const remainingCount = currentScene.effectSystem.getActiveEffectCount();
                    if (remainingCount > targetCount) {
                        const removeCount = remainingCount - targetCount;
                        const effects = currentScene.effectSystem.effects;
                        for (let i = 0; i < removeCount && effects.length > 0; i++) {
                            effects[i].active = false;
                        }
                    }
                    console.log(`💥 强制清理了效果，目标数量: ${targetCount}`);
                }
            }
        }
    }
    
    /**
     * 减少粒子数量
     * @param {number} factor - 减少因子
     */
    reduceParticleCount(factor) {
        // 临时降低粒子效果配置
        if (window.gameEngine && window.gameEngine.sceneManager) {
            const currentScene = window.gameEngine.sceneManager.getCurrentScene();
            if (currentScene && currentScene.effectSystem) {
                const effectSystem = currentScene.effectSystem;
                
                // 减少新效果的粒子数量
                Object.keys(effectSystem.effectConfigs).forEach(type => {
                    const config = effectSystem.effectConfigs[type];
                    if (config.particleCount) {
                        config.particleCount = Math.max(1, Math.floor(config.particleCount * factor));
                    }
                });
                
                console.log(`✨ 粒子数量已减少 ${((1 - factor) * 100).toFixed(0)}%`);
            }
        }
    }
    
    /**
     * 强制垃圾回收
     */
    forceGarbageCollection() {
        // 尝试触发垃圾回收（仅在支持的浏览器中）
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
            console.log('🗑️ 执行了强制垃圾回收');
        } else {
            // 创建大量临时对象来触发GC
            const temp = [];
            for (let i = 0; i < 1000; i++) {
                temp.push(new Array(1000));
            }
            temp.length = 0;
            console.log('🗑️ 尝试触发垃圾回收');
        }
    }
    
    /**
     * 优化子弹生命周期
     */
    optimizeBulletLifecycle() {
        // 减少子弹生存时间
        if (GameConfig.BULLET_LIFETIME) {
            GameConfig.BULLET_LIFETIME *= 0.8;
            console.log('🔫 子弹生存时间已优化');
        }
    }
    
    /**
     * 优化效果渲染
     */
    optimizeEffectRendering() {
        // 临时禁用一些复杂效果
        if (window.gameEngine && window.gameEngine.sceneManager) {
            const currentScene = window.gameEngine.sceneManager.getCurrentScene();
            if (currentScene && currentScene.effectSystem) {
                // 减少效果持续时间
                Object.keys(currentScene.effectSystem.effectConfigs).forEach(type => {
                    const config = currentScene.effectSystem.effectConfigs[type];
                    config.duration *= 0.7;
                });
                
                console.log('💫 效果渲染已优化');
            }
        }
    }
    
    /**
     * 记录优化操作
     * @param {Object} optimization - 优化操作
     */
    recordOptimization(optimization) {
        const record = {
            timestamp: performance.now(),
            optimization: optimization,
            metrics: this.gatherPerformanceMetrics()
        };
        
        this.optimizationHistory.push(record);
        
        // 限制历史记录大小
        if (this.optimizationHistory.length > this.maxHistorySize) {
            this.optimizationHistory.shift();
        }
    }
    
    /**
     * 设置优化级别
     * @param {string} level - 优化级别
     */
    setOptimizationLevel(level) {
        this.optimizationLevel = level;
        
        switch (level) {
            case 'low':
                this.thresholds.fps.warning = 30;
                this.thresholds.fps.critical = 15;
                break;
            case 'medium':
                this.thresholds.fps.warning = 40;
                this.thresholds.fps.critical = 20;
                break;
            case 'high':
                this.thresholds.fps.warning = 50;
                this.thresholds.fps.critical = 30;
                break;
            case 'auto':
                // 自动调整阈值
                this.autoAdjustThresholds();
                break;
        }
        
        console.log(`🎛️ 优化级别设置为: ${level}`);
    }
    
    /**
     * 自动调整阈值
     */
    autoAdjustThresholds() {
        // 基于设备性能自动调整阈值
        const deviceInfo = this.getDevicePerformanceInfo();
        
        if (deviceInfo.tier === 'high') {
            this.thresholds.fps.warning = 50;
            this.thresholds.fps.critical = 30;
        } else if (deviceInfo.tier === 'medium') {
            this.thresholds.fps.warning = 40;
            this.thresholds.fps.critical = 25;
        } else {
            this.thresholds.fps.warning = 30;
            this.thresholds.fps.critical = 20;
        }
    }
    
    /**
     * 获取设备性能信息
     * @returns {Object} 设备性能信息
     */
    getDevicePerformanceInfo() {
        // 简化的设备性能检测
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        let tier = 'low';
        
        if (gl) {
            const renderer = gl.getParameter(gl.RENDERER);
            if (renderer.includes('GeForce') || renderer.includes('Radeon')) {
                tier = 'high';
            } else if (renderer.includes('Intel')) {
                tier = 'medium';
            }
        }
        
        // 检查内存
        if (navigator.deviceMemory && navigator.deviceMemory >= 8) {
            tier = tier === 'low' ? 'medium' : 'high';
        }
        
        return { tier, renderer: gl ? gl.getParameter(gl.RENDERER) : 'unknown' };
    }
    
    /**
     * 获取优化报告
     * @returns {Object} 优化报告
     */
    getOptimizationReport() {
        return {
            isEnabled: this.isEnabled,
            optimizationLevel: this.optimizationLevel,
            thresholds: this.thresholds,
            strategies: this.strategies,
            history: this.optimizationHistory.slice(-10), // 最近10次优化
            currentMetrics: this.gatherPerformanceMetrics()
        };
    }
    
    /**
     * 启用/禁用优化器
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (enabled) {
            this.startMonitoring();
            console.log('🚀 性能优化器已启用');
        } else {
            this.stopMonitoring();
            console.log('⏸️ 性能优化器已禁用');
        }
    }
    
    /**
     * 销毁优化器
     */
    destroy() {
        this.stopMonitoring();
        console.log('🔚 性能优化器已销毁');
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.performanceOptimizer = new PerformanceOptimizer();
}