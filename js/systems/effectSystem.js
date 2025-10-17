/**
 * 视觉效果系统
 * 管理游戏中的各种视觉效果，如爆炸、消除动画等
 */
class EffectSystem {
    constructor() {
        this.effects = [];
        this.maxEffects = 50; // 最大同时存在的效果数量
        
        // 效果类型定义
        this.effectTypes = {
            EXPLOSION: 'explosion',
            DESTRUCTION: 'destruction',
            PARTICLE_BURST: 'particle_burst',
            SCORE_POPUP: 'score_popup'
        };
        
        // 性能统计
        this.stats = {
            activeEffects: 0,
            totalCreated: 0,
            totalDestroyed: 0,
            renderCalls: 0
        };
        
        // 效果配置
        this.effectConfigs = {
            explosion: {
                duration: 0.5,          // 持续时间（秒）
                particleCount: 8,       // 粒子数量
                particleSpeed: 150,     // 粒子速度
                colors: ['#ff6b35', '#f7931e', '#ffcc02', '#fff200'],
                size: 16,               // 初始大小
                fadeOut: true           // 是否淡出
            },
            destruction: {
                duration: 0.3,
                particleCount: 6,
                particleSpeed: 100,
                colors: ['#8b4513', '#a0522d', '#cd853f'],
                size: 12,
                fadeOut: true
            },
            particle_burst: {
                duration: 0.8,
                particleCount: 12,
                particleSpeed: 200,
                colors: ['#00ff00', '#32cd32', '#90ee90'],
                size: 8,
                fadeOut: true
            },
            score_popup: {
                duration: 1.0,
                fontSize: 20,
                color: '#ffff00',
                moveSpeed: 50,          // 向上移动速度
                fadeOut: true
            }
        };
    }
    
    /**
     * 创建爆炸效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} options - 可选配置
     * @returns {Object} 创建的效果对象
     */
    addExplosion(x, y, options = {}) {
        const config = { ...this.effectConfigs.explosion, ...options };
        
        const effect = {
            id: this.generateEffectId(),
            type: this.effectTypes.EXPLOSION,
            x: x,
            y: y,
            startTime: performance.now(),
            duration: config.duration * 1000, // 转换为毫秒
            particles: this.createParticles(x, y, config),
            config: config,
            active: true,
            alpha: 1.0
        };
        
        this.addEffect(effect);
        return effect;
    }
    
    /**
     * 创建摧毁效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} options - 可选配置
     * @returns {Object} 创建的效果对象
     */
    addDestruction(x, y, options = {}) {
        const config = { ...this.effectConfigs.destruction, ...options };
        
        const effect = {
            id: this.generateEffectId(),
            type: this.effectTypes.DESTRUCTION,
            x: x,
            y: y,
            startTime: performance.now(),
            duration: config.duration * 1000,
            particles: this.createParticles(x, y, config),
            config: config,
            active: true,
            alpha: 1.0
        };
        
        this.addEffect(effect);
        return effect;
    }
    
    /**
     * 创建粒子爆发效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} options - 可选配置
     * @returns {Object} 创建的效果对象
     */
    addParticleBurst(x, y, options = {}) {
        const config = { ...this.effectConfigs.particle_burst, ...options };
        
        const effect = {
            id: this.generateEffectId(),
            type: this.effectTypes.PARTICLE_BURST,
            x: x,
            y: y,
            startTime: performance.now(),
            duration: config.duration * 1000,
            particles: this.createParticles(x, y, config),
            config: config,
            active: true,
            alpha: 1.0
        };
        
        this.addEffect(effect);
        return effect;
    }
    
    /**
     * 创建得分弹出效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} score - 得分数值
     * @param {Object} options - 可选配置
     * @returns {Object} 创建的效果对象
     */
    addScorePopup(x, y, score, options = {}) {
        const config = { ...this.effectConfigs.score_popup, ...options };
        
        const effect = {
            id: this.generateEffectId(),
            type: this.effectTypes.SCORE_POPUP,
            x: x,
            y: y,
            startX: x,
            startY: y,
            score: score,
            startTime: performance.now(),
            duration: config.duration * 1000,
            config: config,
            active: true,
            alpha: 1.0
        };
        
        this.addEffect(effect);
        return effect;
    }
    
    /**
     * 创建粒子
     * @param {number} centerX - 中心X坐标
     * @param {number} centerY - 中心Y坐标
     * @param {Object} config - 效果配置
     * @returns {Array} 粒子数组
     */
    createParticles(centerX, centerY, config) {
        const particles = [];
        
        for (let i = 0; i < config.particleCount; i++) {
            const angle = (Math.PI * 2 * i) / config.particleCount + Math.random() * 0.5;
            const speed = config.particleSpeed * (0.5 + Math.random() * 0.5);
            
            const particle = {
                x: centerX,
                y: centerY,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                size: config.size * (0.5 + Math.random() * 0.5),
                color: config.colors[Math.floor(Math.random() * config.colors.length)],
                life: 1.0,
                decay: 1.0 / (config.duration / 1000) // 生命衰减率
            };
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    /**
     * 添加效果到系统
     * @param {Object} effect - 效果对象
     */
    addEffect(effect) {
        // 如果达到最大数量，移除最老的效果
        if (this.effects.length >= this.maxEffects) {
            this.removeOldestEffect();
        }
        
        this.effects.push(effect);
        this.stats.activeEffects = this.effects.length;
        this.stats.totalCreated++;
    }
    
    /**
     * 移除最老的效果
     */
    removeOldestEffect() {
        if (this.effects.length > 0) {
            this.effects.shift();
            this.stats.totalDestroyed++;
        }
    }
    
    /**
     * 移除已完成的效果
     */
    removeFinishedEffects() {
        const currentTime = performance.now();
        const initialLength = this.effects.length;
        
        this.effects = this.effects.filter(effect => {
            const elapsed = currentTime - effect.startTime;
            const isFinished = elapsed >= effect.duration || !effect.active;
            
            if (isFinished) {
                this.stats.totalDestroyed++;
            }
            
            return !isFinished;
        });
        
        this.stats.activeEffects = this.effects.length;
    }
    
    /**
     * 更新所有效果
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        const currentTime = performance.now();
        
        for (const effect of this.effects) {
            if (!effect.active) continue;
            
            const elapsed = currentTime - effect.startTime;
            const progress = Math.min(elapsed / effect.duration, 1.0);
            
            // 更新透明度（淡出效果）
            if (effect.config.fadeOut) {
                effect.alpha = 1.0 - progress;
            }
            
            // 根据效果类型更新
            switch (effect.type) {
                case this.effectTypes.EXPLOSION:
                case this.effectTypes.DESTRUCTION:
                case this.effectTypes.PARTICLE_BURST:
                    this.updateParticleEffect(effect, deltaTime);
                    break;
                    
                case this.effectTypes.SCORE_POPUP:
                    this.updateScorePopup(effect, deltaTime);
                    break;
            }
            
            // 检查是否完成
            if (progress >= 1.0) {
                effect.active = false;
            }
        }
        
        // 清理已完成的效果
        this.removeFinishedEffects();
    }
    
    /**
     * 更新粒子效果
     * @param {Object} effect - 效果对象
     * @param {number} deltaTime - 时间增量
     */
    updateParticleEffect(effect, deltaTime) {
        for (const particle of effect.particles) {
            // 更新粒子位置
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            
            // 应用重力（仅对某些效果）
            if (effect.type === this.effectTypes.DESTRUCTION) {
                particle.velocityY += GameConfig.GRAVITY * 0.3 * deltaTime;
            }
            
            // 更新粒子生命
            particle.life -= particle.decay * deltaTime;
            particle.life = Math.max(0, particle.life);
            
            // 缩小粒子
            particle.size *= (1 - deltaTime * 2);
            particle.size = Math.max(1, particle.size);
        }
    }
    
    /**
     * 更新得分弹出效果
     * @param {Object} effect - 效果对象
     * @param {number} deltaTime - 时间增量
     */
    updateScorePopup(effect, deltaTime) {
        // 向上移动
        effect.y -= effect.config.moveSpeed * deltaTime;
    }
    
    /**
     * 渲染所有效果
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        this.stats.renderCalls = 0;
        
        for (const effect of this.effects) {
            if (!effect.active || effect.alpha <= 0) continue;
            
            // 设置全局透明度
            const originalAlpha = renderer.ctx.globalAlpha;
            renderer.ctx.globalAlpha = effect.alpha;
            
            switch (effect.type) {
                case this.effectTypes.EXPLOSION:
                case this.effectTypes.DESTRUCTION:
                case this.effectTypes.PARTICLE_BURST:
                    this.renderParticleEffect(renderer, effect);
                    break;
                    
                case this.effectTypes.SCORE_POPUP:
                    this.renderScorePopup(renderer, effect);
                    break;
            }
            
            // 恢复透明度
            renderer.ctx.globalAlpha = originalAlpha;
            this.stats.renderCalls++;
        }
    }
    
    /**
     * 渲染粒子效果
     * @param {Renderer} renderer - 渲染器
     * @param {Object} effect - 效果对象
     */
    renderParticleEffect(renderer, effect) {
        for (const particle of effect.particles) {
            if (particle.life <= 0 || particle.size <= 1) continue;
            
            // 设置粒子透明度
            const particleAlpha = renderer.ctx.globalAlpha * particle.life;
            renderer.ctx.globalAlpha = particleAlpha;
            
            // 绘制粒子
            renderer.ctx.fillStyle = particle.color;
            renderer.ctx.beginPath();
            renderer.ctx.arc(
                Math.round(particle.x), 
                Math.round(particle.y), 
                Math.round(particle.size / 2), 
                0, 
                Math.PI * 2
            );
            renderer.ctx.fill();
        }
    }
    
    /**
     * 渲染得分弹出效果
     * @param {Renderer} renderer - 渲染器
     * @param {Object} effect - 效果对象
     */
    renderScorePopup(renderer, effect) {
        const fontSize = effect.config.fontSize;
        const font = `bold ${fontSize}px Arial`;
        
        renderer.ctx.font = font;
        renderer.ctx.fillStyle = effect.config.color;
        renderer.ctx.textAlign = 'center';
        renderer.ctx.textBaseline = 'middle';
        
        // 添加描边效果
        renderer.ctx.strokeStyle = '#000000';
        renderer.ctx.lineWidth = 2;
        renderer.ctx.strokeText(`+${effect.score}`, effect.x, effect.y);
        renderer.ctx.fillText(`+${effect.score}`, effect.x, effect.y);
    }
    
    /**
     * 生成唯一的效果ID
     * @returns {string} 效果ID
     */
    generateEffectId() {
        return `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 根据ID获取效果
     * @param {string} id - 效果ID
     * @returns {Object|null} 效果对象或null
     */
    getEffectById(id) {
        return this.effects.find(effect => effect.id === id) || null;
    }
    
    /**
     * 移除指定ID的效果
     * @param {string} id - 效果ID
     * @returns {boolean} 是否成功移除
     */
    removeEffectById(id) {
        const index = this.effects.findIndex(effect => effect.id === id);
        if (index !== -1) {
            this.effects.splice(index, 1);
            this.stats.activeEffects = this.effects.length;
            this.stats.totalDestroyed++;
            return true;
        }
        return false;
    }
    
    /**
     * 清除所有效果
     */
    clearAllEffects() {
        const count = this.effects.length;
        this.effects = [];
        this.stats.activeEffects = 0;
        this.stats.totalDestroyed += count;
    }
    
    /**
     * 获取活跃效果数量
     * @returns {number} 活跃效果数量
     */
    getActiveEffectCount() {
        return this.effects.filter(effect => effect.active).length;
    }
    
    /**
     * 获取指定类型的效果数量
     * @param {string} type - 效果类型
     * @returns {number} 效果数量
     */
    getEffectCountByType(type) {
        return this.effects.filter(effect => effect.type === type && effect.active).length;
    }
    
    /**
     * 设置效果配置
     * @param {string} type - 效果类型
     * @param {Object} config - 新配置
     */
    setEffectConfig(type, config) {
        if (this.effectConfigs[type]) {
            this.effectConfigs[type] = { ...this.effectConfigs[type], ...config };
        }
    }
    
    /**
     * 获取效果配置
     * @param {string} type - 效果类型
     * @returns {Object|null} 效果配置或null
     */
    getEffectConfig(type) {
        return this.effectConfigs[type] || null;
    }
    
    /**
     * 获取系统统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            ...this.stats,
            effectTypes: Object.keys(this.effectTypes).length,
            maxEffects: this.maxEffects
        };
    }
    
    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            activeEffects: this.effects.length,
            totalCreated: 0,
            totalDestroyed: 0,
            renderCalls: 0
        };
    }
    
    /**
     * 渲染调试信息
     * @param {Renderer} renderer - 渲染器
     */
    renderDebugInfo(renderer) {
        if (!GameConfig.DEBUG) return;
        
        const stats = this.getStats();
        let y = 200;
        const lineHeight = 16;
        
        renderer.drawText('效果系统统计:', 10, y, '#ffffff', '14px Arial');
        y += lineHeight;
        
        renderer.drawText(`活跃效果: ${stats.activeEffects}/${stats.maxEffects}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        renderer.drawText(`已创建: ${stats.totalCreated}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        renderer.drawText(`已销毁: ${stats.totalDestroyed}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        renderer.drawText(`渲染调用: ${stats.renderCalls}`, 10, y, '#ffffff', '12px Arial');
        y += lineHeight;
        
        // 显示各类型效果数量
        for (const [typeName, typeValue] of Object.entries(this.effectTypes)) {
            const count = this.getEffectCountByType(typeValue);
            if (count > 0) {
                renderer.drawText(`${typeName}: ${count}`, 10, y, '#ffff00', '10px Arial');
                y += lineHeight;
            }
        }
    }
}