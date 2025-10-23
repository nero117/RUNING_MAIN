/**
 * 无敌状态系统
 * 管理玩家的无敌状态，包括激活、持续时间和视觉效果
 */
class InvincibilitySystem {
    constructor() {
        this.isInvincible = false;
        this.invincibilityDuration = 10000; // 10秒，以毫秒为单位
        this.invincibilityStartTime = 0;
        this.remainingTime = 0;
        
        // 视觉效果配置
        this.visualEffects = {
            glowIntensity: 0,
            glowDirection: 1,
            glowSpeed: 5,
            flashInterval: 200, // 闪烁间隔（毫秒）
            lastFlashTime: 0,
            isFlashing: false,
            warningThreshold: 3000 // 剩余3秒时开始警告闪烁
        };
        
        // 激活效果
        this.activationEffect = {
            isActive: false,
            startTime: 0,
            duration: 1000, // 激活效果持续1秒
            particles: []
        };
        
        console.log('无敌状态系统已初始化');
    }
    
    /**
     * 激活无敌状态
     * @param {number} duration - 无敌持续时间（毫秒），可选
     */
    activate(duration = null) {
        const currentTime = performance.now();
        
        // 如果已经处于无敌状态，延长时间而不是重置
        if (this.isInvincible) {
            const remainingTime = this.getRemainingTime();
            const newDuration = duration || this.invincibilityDuration;
            
            // 选择较长的时间
            if (newDuration > remainingTime) {
                this.invincibilityStartTime = currentTime;
                this.invincibilityDuration = newDuration;
            }
        } else {
            // 首次激活
            this.isInvincible = true;
            this.invincibilityStartTime = currentTime;
            this.invincibilityDuration = duration || this.invincibilityDuration;
            
            // 激活激活效果
            this.activateActivationEffect();
        }
        
        // 重置视觉效果
        this.visualEffects.glowIntensity = 0;
        this.visualEffects.glowDirection = 1;
        this.visualEffects.isFlashing = false;
        
        console.log(`🛡️ 无敌状态已激活，持续时间: ${this.invincibilityDuration / 1000}秒`);
    }
    
    /**
     * 激活激活效果
     */
    activateActivationEffect() {
        this.activationEffect.isActive = true;
        this.activationEffect.startTime = performance.now();
        this.activationEffect.particles = [];
        
        // 创建激活粒子效果
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 100 + Math.random() * 50;
            
            this.activationEffect.particles.push({
                x: 0, // 相对于玩家位置
                y: 0,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 1.0,
                decay: 1.0 / (this.activationEffect.duration / 1000),
                size: 3 + Math.random() * 3,
                color: this.getRandomInvincibilityColor()
            });
        }
    }
    
    /**
     * 获取随机无敌颜色
     * @returns {string} 颜色值
     */
    getRandomInvincibilityColor() {
        const colors = ['#ffff00', '#ff8000', '#ff0080', '#8000ff', '#00ff80', '#0080ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * 取消无敌状态
     */
    deactivate() {
        if (this.isInvincible) {
            this.isInvincible = false;
            this.invincibilityStartTime = 0;
            this.remainingTime = 0;
            
            // 重置视觉效果
            this.visualEffects.glowIntensity = 0;
            this.visualEffects.isFlashing = false;
            
            console.log('🛡️ 无敌状态已结束');
        }
    }
    
    /**
     * 更新无敌状态系统
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        const currentTime = performance.now();
        
        // 更新无敌状态
        if (this.isInvincible) {
            this.remainingTime = this.getRemainingTime();
            
            // 检查是否应该结束无敌状态
            if (this.remainingTime <= 0) {
                this.deactivate();
                return;
            }
            
            // 更新视觉效果
            this.updateVisualEffects(deltaTime, currentTime);
        }
        
        // 更新激活效果
        if (this.activationEffect.isActive) {
            this.updateActivationEffect(deltaTime, currentTime);
        }
    }
    
    /**
     * 更新视觉效果
     * @param {number} deltaTime - 时间增量
     * @param {number} currentTime - 当前时间
     */
    updateVisualEffects(deltaTime, currentTime) {
        // 更新发光效果
        this.visualEffects.glowIntensity += this.visualEffects.glowDirection * this.visualEffects.glowSpeed * deltaTime;
        
        if (this.visualEffects.glowIntensity >= 1) {
            this.visualEffects.glowIntensity = 1;
            this.visualEffects.glowDirection = -1;
        } else if (this.visualEffects.glowIntensity <= 0) {
            this.visualEffects.glowIntensity = 0;
            this.visualEffects.glowDirection = 1;
        }
        
        // 检查是否需要警告闪烁
        if (this.remainingTime <= this.visualEffects.warningThreshold) {
            if (currentTime - this.visualEffects.lastFlashTime >= this.visualEffects.flashInterval) {
                this.visualEffects.isFlashing = !this.visualEffects.isFlashing;
                this.visualEffects.lastFlashTime = currentTime;
            }
        } else {
            this.visualEffects.isFlashing = false;
        }
    }
    
    /**
     * 更新激活效果
     * @param {number} deltaTime - 时间增量
     * @param {number} currentTime - 当前时间
     */
    updateActivationEffect(deltaTime, currentTime) {
        const elapsed = currentTime - this.activationEffect.startTime;
        
        if (elapsed >= this.activationEffect.duration) {
            this.activationEffect.isActive = false;
            return;
        }
        
        // 更新粒子
        for (const particle of this.activationEffect.particles) {
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.life -= particle.decay * deltaTime;
            particle.life = Math.max(0, particle.life);
        }
        
        // 移除死亡的粒子
        this.activationEffect.particles = this.activationEffect.particles.filter(p => p.life > 0);
    }
    
    /**
     * 获取剩余无敌时间
     * @returns {number} 剩余时间（毫秒）
     */
    getRemainingTime() {
        if (!this.isInvincible) return 0;
        
        const currentTime = performance.now();
        const elapsed = currentTime - this.invincibilityStartTime;
        return Math.max(0, this.invincibilityDuration - elapsed);
    }
    
    /**
     * 获取剩余时间（秒）
     * @returns {number} 剩余时间（秒）
     */
    getRemainingTimeSeconds() {
        return Math.ceil(this.getRemainingTime() / 1000);
    }
    
    /**
     * 检查是否处于无敌状态
     * @returns {boolean} 是否无敌
     */
    isPlayerInvincible() {
        return this.isInvincible;
    }
    
    /**
     * 获取无敌状态信息
     * @returns {Object} 无敌状态信息
     */
    getInvincibilityInfo() {
        return {
            isInvincible: this.isInvincible,
            remainingTime: this.getRemainingTime(),
            remainingSeconds: this.getRemainingTimeSeconds(),
            glowIntensity: this.visualEffects.glowIntensity,
            isFlashing: this.visualEffects.isFlashing,
            isWarning: this.remainingTime <= this.visualEffects.warningThreshold
        };
    }
    
    /**
     * 渲染玩家无敌效果
     * @param {Renderer} renderer - 渲染器
     * @param {Player} player - 玩家对象
     */
    renderPlayerEffect(renderer, player) {
        if (!this.isInvincible || !player) return;
        
        const playerBounds = player.getBounds();
        const centerX = playerBounds.x + playerBounds.width / 2;
        const centerY = playerBounds.y + playerBounds.height / 2;
        
        // 保存渲染状态
        renderer.save();
        
        // 如果在警告阶段且正在闪烁，跳过渲染
        if (this.visualEffects.isFlashing && this.remainingTime <= this.visualEffects.warningThreshold) {
            renderer.restore();
            return;
        }
        
        // 绘制发光效果
        const glowRadius = (playerBounds.width + playerBounds.height) / 2 + 10;
        const glowAlpha = this.visualEffects.glowIntensity * 0.3;
        
        // 创建径向渐变
        const gradient = renderer.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, glowRadius
        );
        gradient.addColorStop(0, `rgba(255, 255, 0, ${glowAlpha})`);
        gradient.addColorStop(0.5, `rgba(255, 128, 0, ${glowAlpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        
        renderer.ctx.fillStyle = gradient;
        renderer.ctx.beginPath();
        renderer.ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        renderer.ctx.fill();
        
        // 绘制边框光环
        renderer.ctx.strokeStyle = `rgba(255, 255, 0, ${this.visualEffects.glowIntensity})`;
        renderer.ctx.lineWidth = 2;
        renderer.ctx.beginPath();
        renderer.ctx.arc(centerX, centerY, glowRadius * 0.8, 0, Math.PI * 2);
        renderer.ctx.stroke();
        
        renderer.restore();
    }
    
    /**
     * 渲染激活效果
     * @param {Renderer} renderer - 渲染器
     * @param {Player} player - 玩家对象
     */
    renderActivationEffect(renderer, player) {
        if (!this.activationEffect.isActive || !player) return;
        
        const playerBounds = player.getBounds();
        const centerX = playerBounds.x + playerBounds.width / 2;
        const centerY = playerBounds.y + playerBounds.height / 2;
        
        // 渲染激活粒子
        for (const particle of this.activationEffect.particles) {
            if (particle.life <= 0) continue;
            
            renderer.setGlobalAlpha(particle.life);
            renderer.drawCircle(
                centerX + particle.x,
                centerY + particle.y,
                particle.size * particle.life,
                particle.color
            );
            renderer.resetGlobalAlpha();
        }
    }
    
    /**
     * 渲染UI信息
     * @param {Renderer} renderer - 渲染器
     */
    renderUI(renderer) {
        if (!this.isInvincible) return;
        
        const remainingSeconds = this.getRemainingTimeSeconds();
        const x = GameConfig.CANVAS_WIDTH / 2;
        const y = 60;
        
        // 根据剩余时间选择颜色
        let textColor = '#ffff00'; // 黄色
        if (remainingSeconds <= 3) {
            textColor = this.visualEffects.isFlashing ? '#ff0000' : '#ffff00'; // 红色闪烁
        }
        
        // 绘制无敌状态指示
        renderer.drawTextWithStroke(
            `🛡️ 无敌状态: ${remainingSeconds}秒`,
            x,
            y,
            textColor,
            '#000000',
            'bold 20px Arial',
            'center',
            2
        );
        
        // 绘制进度条
        const barWidth = 200;
        const barHeight = 8;
        const barX = x - barWidth / 2;
        const barY = y + 25;
        
        // 背景
        renderer.fillRect(barX, barY, barWidth, barHeight, 'rgba(0, 0, 0, 0.5)');
        
        // 进度
        const progress = this.getRemainingTime() / this.invincibilityDuration;
        const progressWidth = barWidth * progress;
        
        let progressColor = '#ffff00';
        if (progress <= 0.3) {
            progressColor = '#ff4000';
        } else if (progress <= 0.6) {
            progressColor = '#ff8000';
        }
        
        renderer.fillRect(barX, barY, progressWidth, barHeight, progressColor);
        
        // 边框
        renderer.drawRect(barX, barY, barWidth, barHeight, '#ffffff', 1);
    }
    
    /**
     * 重置无敌状态系统
     */
    reset() {
        this.isInvincible = false;
        this.invincibilityStartTime = 0;
        this.remainingTime = 0;
        this.visualEffects.glowIntensity = 0;
        this.visualEffects.isFlashing = false;
        this.activationEffect.isActive = false;
        this.activationEffect.particles = [];
        
        console.log('无敌状态系统已重置');
    }
    
    /**
     * 获取系统统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            isInvincible: this.isInvincible,
            remainingTime: this.getRemainingTime(),
            remainingSeconds: this.getRemainingTimeSeconds(),
            totalDuration: this.invincibilityDuration,
            activationEffectActive: this.activationEffect.isActive,
            particleCount: this.activationEffect.particles.length
        };
    }
}