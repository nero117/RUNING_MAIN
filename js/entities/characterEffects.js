/**
 * 美女角色特效系统
 * 管理角色的特殊视觉效果，如无敌状态、发光效果等
 */
class CharacterEffects {
    constructor(player) {
        this.player = player;
        
        // 无敌状态效果
        this.invincibilityEffect = {
            active: false,
            glowIntensity: 0,
            glowDirection: 1,
            sparkleParticles: [],
            pulseTime: 0
        };
        
        // 粒子效果配置 - 更加华丽
        this.sparkleConfig = {
            maxParticles: 12,
            spawnRate: 0.15,
            lifetime: 1.2,
            speed: 60,
            colors: ['#ffff00', '#ff69b4', '#00ffff', '#ff1493', '#ffd700', '#ff85c1', '#87ceeb']
        };
        
        // 发光效果配置 - 更加美丽
        this.glowConfig = {
            maxIntensity: 1.0,
            pulseSpeed: 3.5,
            glowRadius: 18,
            glowColor: '#ff69b4',
            secondaryColor: '#ffd700',
            tertiaryColor: '#87ceeb'
        };
    }
    
    /**
     * 更新特效系统
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        this.updateInvincibilityEffect(deltaTime);
        this.updateSparkleParticles(deltaTime);
    }
    
    /**
     * 激活无敌状态效果
     * @param {number} duration - 无敌持续时间（秒）
     */
    activateInvincibilityEffect(duration) {
        this.invincibilityEffect.active = true;
        this.invincibilityEffect.duration = duration;
        this.invincibilityEffect.timeLeft = duration;
        this.invincibilityEffect.glowIntensity = 0;
        this.invincibilityEffect.pulseTime = 0;
        
        // 清空现有粒子
        this.invincibilityEffect.sparkleParticles = [];
        
        // 创建激活爆发效果
        this.createActivationBurst();
        
        console.log('激活美女角色无敌状态特效 - 华丽升级版');
    }
    
    /**
     * 创建激活爆发效果
     */
    createActivationBurst() {
        const playerBounds = this.player.getBounds();
        const centerX = playerBounds.x + playerBounds.width / 2;
        const centerY = playerBounds.y + playerBounds.height / 2;
        
        // 创建爆发粒子
        const burstParticleCount = 20;
        for (let i = 0; i < burstParticleCount; i++) {
            const angle = (Math.PI * 2 * i) / burstParticleCount;
            const speed = 80 + Math.random() * 40;
            const particleType = i % 4 === 0 ? 'heart' : (i % 3 === 0 ? 'star' : 'sparkle');
            
            const particle = {
                x: centerX,
                y: centerY,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                lifetime: 1.5 + Math.random() * 0.5,
                maxLifetime: 2.0,
                color: this.sparkleConfig.colors[Math.floor(Math.random() * this.sparkleConfig.colors.length)],
                size: 3 + Math.random() * 2,
                type: particleType,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 6,
                scale: 1.5,
                scaleSpeed: -0.3
            };
            
            this.invincibilityEffect.sparkleParticles.push(particle);
        }
        
        // 创建环形爆发效果
        const ringParticleCount = 12;
        for (let ring = 0; ring < 3; ring++) {
            for (let i = 0; i < ringParticleCount; i++) {
                const angle = (Math.PI * 2 * i) / ringParticleCount + ring * 0.2;
                const speed = 60 + ring * 20;
                const delay = ring * 0.1;
                
                setTimeout(() => {
                    if (this.invincibilityEffect.active) {
                        const particle = {
                            x: centerX,
                            y: centerY,
                            velocityX: Math.cos(angle) * speed,
                            velocityY: Math.sin(angle) * speed,
                            lifetime: 1.2,
                            maxLifetime: 1.2,
                            color: ring === 0 ? '#ff69b4' : (ring === 1 ? '#ffd700' : '#87ceeb'),
                            size: 2 + ring * 0.5,
                            type: 'diamond',
                            rotation: angle,
                            rotationSpeed: 2,
                            scale: 1.0,
                            scaleSpeed: -0.4
                        };
                        
                        this.invincibilityEffect.sparkleParticles.push(particle);
                    }
                }, delay * 1000);
            }
        }
    }
    
    /**
     * 停用无敌状态效果
     */
    deactivateInvincibilityEffect() {
        this.invincibilityEffect.active = false;
        this.invincibilityEffect.glowIntensity = 0;
        this.invincibilityEffect.sparkleParticles = [];
        
        console.log('停用美女角色无敌状态特效');
    }
    
    /**
     * 更新无敌状态效果
     * @param {number} deltaTime - 时间增量
     */
    updateInvincibilityEffect(deltaTime) {
        if (!this.invincibilityEffect.active) return;
        
        // 更新脉冲时间
        this.invincibilityEffect.pulseTime += deltaTime * this.glowConfig.pulseSpeed;
        
        // 计算发光强度（脉冲效果）
        const pulseValue = (Math.sin(this.invincibilityEffect.pulseTime) + 1) / 2;
        this.invincibilityEffect.glowIntensity = pulseValue * this.glowConfig.maxIntensity;
        
        // 生成闪烁粒子 - 更频繁更华丽
        const spawnRate = this.sparkleConfig.spawnRate * (1 + this.invincibilityEffect.glowIntensity);
        if (Math.random() < spawnRate) {
            this.addSparkleParticle();
        }
        
        // 每隔一段时间创建特殊效果
        if (Math.random() < 0.02) { // 2%概率
            this.createMagicalTrail();
        }
        
        // 在无敌状态即将结束时创建警告效果
        if (this.invincibilityEffect.timeLeft <= 3 && Math.random() < 0.05) {
            this.createWarningEffect();
        }
    }
    
    /**
     * 创建魔法轨迹效果
     */
    createMagicalTrail() {
        const playerBounds = this.player.getBounds();
        const centerX = playerBounds.x + playerBounds.width / 2;
        const centerY = playerBounds.y + playerBounds.height / 2;
        
        // 创建螺旋轨迹粒子
        const spiralParticles = 8;
        for (let i = 0; i < spiralParticles; i++) {
            const angle = (Math.PI * 2 * i) / spiralParticles + this.invincibilityEffect.pulseTime;
            const radius = 20 + Math.sin(this.invincibilityEffect.pulseTime * 2) * 10;
            const startX = centerX + Math.cos(angle) * radius;
            const startY = centerY + Math.sin(angle) * radius;
            
            const particle = {
                x: startX,
                y: startY,
                velocityX: Math.cos(angle + Math.PI/2) * 30,
                velocityY: Math.sin(angle + Math.PI/2) * 30,
                lifetime: 0.8,
                maxLifetime: 0.8,
                color: '#ff69b4',
                size: 1.5,
                type: 'sparkle',
                rotation: angle,
                rotationSpeed: 4,
                scale: 1.0,
                scaleSpeed: -0.8
            };
            
            this.invincibilityEffect.sparkleParticles.push(particle);
        }
    }
    
    /**
     * 创建警告效果
     */
    createWarningEffect() {
        const playerBounds = this.player.getBounds();
        const centerX = playerBounds.x + playerBounds.width / 2;
        const centerY = playerBounds.y + playerBounds.height / 2;
        
        // 创建警告闪烁粒子
        const warningParticles = 6;
        for (let i = 0; i < warningParticles; i++) {
            const angle = (Math.PI * 2 * i) / warningParticles;
            const distance = 25;
            
            const particle = {
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                velocityX: 0,
                velocityY: -20,
                lifetime: 1.0,
                maxLifetime: 1.0,
                color: '#ff0000',
                size: 3,
                type: 'star',
                rotation: 0,
                rotationSpeed: 8,
                scale: 1.2,
                scaleSpeed: -0.6
            };
            
            this.invincibilityEffect.sparkleParticles.push(particle);
        }
    }
    
    /**
     * 添加闪烁粒子
     */
    addSparkleParticle() {
        if (this.invincibilityEffect.sparkleParticles.length >= this.sparkleConfig.maxParticles) {
            return;
        }
        
        const playerBounds = this.player.getBounds();
        const centerX = playerBounds.x + playerBounds.width / 2;
        const centerY = playerBounds.y + playerBounds.height / 2;
        
        // 创建更多样化的粒子类型
        const particleTypes = ['star', 'heart', 'sparkle', 'diamond'];
        const particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
        
        // 根据粒子类型设置不同的属性
        let particleConfig = {};
        switch (particleType) {
            case 'star':
                particleConfig = {
                    size: 2 + Math.random() * 3,
                    speed: this.sparkleConfig.speed * 0.8,
                    lifetime: this.sparkleConfig.lifetime * 1.2,
                    color: this.sparkleConfig.colors[Math.floor(Math.random() * this.sparkleConfig.colors.length)]
                };
                break;
            case 'heart':
                particleConfig = {
                    size: 3 + Math.random() * 2,
                    speed: this.sparkleConfig.speed * 0.6,
                    lifetime: this.sparkleConfig.lifetime * 1.5,
                    color: '#ff69b4'
                };
                break;
            case 'sparkle':
                particleConfig = {
                    size: 1 + Math.random() * 2,
                    speed: this.sparkleConfig.speed * 1.2,
                    lifetime: this.sparkleConfig.lifetime * 0.8,
                    color: '#ffffff'
                };
                break;
            case 'diamond':
                particleConfig = {
                    size: 2.5 + Math.random() * 1.5,
                    speed: this.sparkleConfig.speed * 0.9,
                    lifetime: this.sparkleConfig.lifetime,
                    color: '#87ceeb'
                };
                break;
        }
        
        // 创建从角色周围发射的粒子
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 15; // 从角色周围发射
        const startX = centerX + Math.cos(angle) * distance;
        const startY = centerY + Math.sin(angle) * distance;
        
        const particle = {
            x: startX,
            y: startY,
            velocityX: Math.cos(angle) * particleConfig.speed + (Math.random() - 0.5) * 20,
            velocityY: Math.sin(angle) * particleConfig.speed + (Math.random() - 0.5) * 20,
            lifetime: particleConfig.lifetime,
            maxLifetime: particleConfig.lifetime,
            color: particleConfig.color,
            size: particleConfig.size,
            type: particleType,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 4,
            scale: 1.0,
            scaleSpeed: -0.5 // 粒子逐渐缩小
        };
        
        this.invincibilityEffect.sparkleParticles.push(particle);
    }
    
    /**
     * 更新闪烁粒子
     * @param {number} deltaTime - 时间增量
     */
    updateSparkleParticles(deltaTime) {
        const particles = this.invincibilityEffect.sparkleParticles;
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // 更新位置
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            
            // 更新旋转
            if (particle.rotation !== undefined) {
                particle.rotation += particle.rotationSpeed * deltaTime;
            }
            
            // 更新缩放
            if (particle.scale !== undefined) {
                particle.scale += particle.scaleSpeed * deltaTime;
                particle.scale = Math.max(0.1, particle.scale);
            }
            
            // 应用重力效果（轻微）
            particle.velocityY += 20 * deltaTime;
            
            // 应用空气阻力
            particle.velocityX *= 0.98;
            particle.velocityY *= 0.98;
            
            // 更新生命周期
            particle.lifetime -= deltaTime;
            
            // 移除过期粒子
            if (particle.lifetime <= 0 || particle.scale <= 0.1) {
                particles.splice(i, 1);
            }
        }
    }
    
    /**
     * 渲染特效
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        if (!this.invincibilityEffect.active) return;
        
        // 渲染发光效果
        this.renderGlowEffect(renderer);
        
        // 渲染闪烁粒子
        this.renderSparkleParticles(renderer);
    }
    
    /**
     * 渲染发光效果
     * @param {Renderer} renderer - 渲染器
     */
    renderGlowEffect(renderer) {
        if (this.invincibilityEffect.glowIntensity <= 0) return;
        
        const playerBounds = this.player.getBounds();
        const centerX = playerBounds.x + playerBounds.width / 2;
        const centerY = playerBounds.y + playerBounds.height / 2;
        
        // 保存渲染状态
        renderer.save();
        
        // 设置发光透明度
        const alpha = this.invincibilityEffect.glowIntensity * 0.8;
        
        // 多层发光效果 - 更加华丽
        const layers = [
            { radius: this.glowConfig.glowRadius * 1.2, color: this.glowConfig.glowColor, alpha: alpha * 0.3 },
            { radius: this.glowConfig.glowRadius, color: this.glowConfig.secondaryColor, alpha: alpha * 0.5 },
            { radius: this.glowConfig.glowRadius * 0.7, color: this.glowConfig.tertiaryColor, alpha: alpha * 0.7 },
            { radius: this.glowConfig.glowRadius * 0.4, color: '#ffffff', alpha: alpha * 0.9 }
        ];
        
        layers.forEach((layer, index) => {
            renderer.setGlobalAlpha(layer.alpha);
            
            // 创建径向渐变发光效果
            const gradient = renderer.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, layer.radius
            );
            
            // 更好的颜色处理
            const hexToRgba = (hex, alpha) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            
            gradient.addColorStop(0, hexToRgba(layer.color, layer.alpha));
            gradient.addColorStop(0.3, hexToRgba(layer.color, layer.alpha * 0.6));
            gradient.addColorStop(0.7, hexToRgba(layer.color, layer.alpha * 0.2));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            // 绘制发光圆圈
            renderer.ctx.fillStyle = gradient;
            renderer.ctx.beginPath();
            renderer.ctx.arc(centerX, centerY, layer.radius, 0, Math.PI * 2);
            renderer.ctx.fill();
            
            // 添加旋转光环效果
            if (index === 0) {
                this.renderRotatingRings(renderer, centerX, centerY, layer.radius, alpha);
            }
        });
        
        // 绘制内层强光 - 更加闪亮
        renderer.setGlobalAlpha(alpha * 0.9);
        renderer.drawCircle(centerX, centerY, 12, 'rgba(255, 255, 255, 0.9)');
        
        renderer.setGlobalAlpha(alpha * 0.8);
        renderer.drawCircle(centerX, centerY, 8, 'rgba(255, 215, 0, 0.8)');
        
        renderer.setGlobalAlpha(alpha * 0.6);
        renderer.drawCircle(centerX, centerY, 4, 'rgba(255, 105, 180, 0.9)');
        
        // 美女角色专属的心形光环
        if (this.invincibilityEffect.glowIntensity > 0.4) {
            renderer.setGlobalAlpha(alpha * 0.6);
            this.renderHeartGlow(renderer, centerX, centerY - 8, 12);
            
            // 添加多个心形光环
            renderer.setGlobalAlpha(alpha * 0.4);
            this.renderHeartGlow(renderer, centerX - 5, centerY - 3, 8);
            this.renderHeartGlow(renderer, centerX + 5, centerY - 3, 8);
        }
        
        // 添加闪烁星星效果
        if (this.invincibilityEffect.glowIntensity > 0.7) {
            this.renderTwinkleStars(renderer, centerX, centerY, alpha);
        }
        
        // 恢复渲染状态
        renderer.restore();
    }
    
    /**
     * 渲染心形光环效果
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} centerY - 中心Y坐标
     * @param {number} size - 大小
     */
    renderHeartGlow(renderer, centerX, centerY, size) {
        const ctx = renderer.ctx;
        
        // 创建心形渐变
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, size
        );
        gradient.addColorStop(0, 'rgba(255, 105, 180, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 20, 147, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 105, 180, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // 绘制更精美的心形
        const x = centerX - size / 2;
        const y = centerY - size / 2;
        const width = size;
        const height = size;
        
        ctx.moveTo(x + width / 2, y + height / 4);
        ctx.quadraticCurveTo(x, y, x + width / 4, y);
        ctx.quadraticCurveTo(x + width / 2, y, x + width / 2, y + height / 4);
        ctx.quadraticCurveTo(x + width / 2, y, x + width * 3/4, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + height / 4);
        ctx.quadraticCurveTo(x + width, y + height / 2, x + width / 2, y + height);
        ctx.quadraticCurveTo(x, y + height / 2, x + width / 2, y + height / 4);
        
        ctx.fill();
        
        // 添加心形边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * 渲染旋转光环效果
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} centerY - 中心Y坐标
     * @param {number} radius - 半径
     * @param {number} alpha - 透明度
     */
    renderRotatingRings(renderer, centerX, centerY, radius, alpha) {
        const ctx = renderer.ctx;
        const time = this.invincibilityEffect.pulseTime;
        
        // 绘制多个旋转光环
        for (let i = 0; i < 3; i++) {
            const ringRadius = radius * (0.6 + i * 0.15);
            const rotation = time * (1 + i * 0.5);
            const ringAlpha = alpha * (0.3 - i * 0.08);
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.globalAlpha = ringAlpha;
            
            // 绘制光环段
            const segments = 8;
            for (let j = 0; j < segments; j++) {
                const angle = (Math.PI * 2 * j) / segments;
                const segmentLength = Math.PI / 6;
                
                ctx.beginPath();
                ctx.arc(0, 0, ringRadius, angle, angle + segmentLength);
                ctx.strokeStyle = i % 2 === 0 ? '#ff69b4' : '#ffd700';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }
    
    /**
     * 渲染闪烁星星效果
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} centerY - 中心Y坐标
     * @param {number} alpha - 透明度
     */
    renderTwinkleStars(renderer, centerX, centerY, alpha) {
        const starCount = 6;
        const time = this.invincibilityEffect.pulseTime;
        
        for (let i = 0; i < starCount; i++) {
            const angle = (Math.PI * 2 * i) / starCount + time * 0.5;
            const distance = 25 + Math.sin(time * 2 + i) * 8;
            const starX = centerX + Math.cos(angle) * distance;
            const starY = centerY + Math.sin(angle) * distance;
            const starAlpha = alpha * (0.6 + Math.sin(time * 3 + i) * 0.4);
            
            renderer.save();
            renderer.setGlobalAlpha(starAlpha);
            
            // 绘制六角星
            this.renderSixPointStar(renderer, starX, starY, 3 + Math.sin(time * 4 + i) * 1, '#ffffff');
            
            renderer.restore();
        }
    }
    
    /**
     * 渲染六角星
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 大小
     * @param {string} color - 颜色
     */
    renderSixPointStar(renderer, x, y, size, color) {
        const ctx = renderer.ctx;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        
        // 绘制六角星（两个重叠的三角形）
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * i) / 3;
            const radius = i % 2 === 0 ? size : size * 0.5;
            const pointX = x + Math.cos(angle) * radius;
            const pointY = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(pointX, pointY);
            } else {
                ctx.lineTo(pointX, pointY);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * 渲染闪烁粒子
     * @param {Renderer} renderer - 渲染器
     */
    renderSparkleParticles(renderer) {
        const particles = this.invincibilityEffect.sparkleParticles;
        
        particles.forEach(particle => {
            // 计算粒子透明度（基于生命周期）
            const alpha = (particle.lifetime / particle.maxLifetime) * 0.9;
            const scale = particle.scale || 1.0;
            const size = particle.size * scale;
            
            // 保存渲染状态
            renderer.save();
            renderer.setGlobalAlpha(alpha);
            
            // 根据粒子类型渲染不同形状
            switch (particle.type) {
                case 'star':
                    this.renderStarParticle(renderer, particle.x, particle.y, size, particle.color, particle.rotation);
                    break;
                case 'heart':
                    this.renderHeartParticle(renderer, particle.x, particle.y, size, particle.color, particle.rotation);
                    break;
                case 'sparkle':
                    this.renderSparkleParticle(renderer, particle.x, particle.y, size, particle.color, particle.rotation);
                    break;
                case 'diamond':
                    this.renderDiamondParticle(renderer, particle.x, particle.y, size, particle.color, particle.rotation);
                    break;
                default:
                    this.renderStarParticle(renderer, particle.x, particle.y, size, particle.color, particle.rotation);
            }
            
            // 恢复渲染状态
            renderer.restore();
        });
    }
    
    /**
     * 渲染星形粒子
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 大小
     * @param {string} color - 颜色
     * @param {number} rotation - 旋转角度
     */
    renderStarParticle(renderer, x, y, size, color, rotation = 0) {
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // 创建星形渐变
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color.replace(')', ', 0.3)').replace('rgb', 'rgba').replace('#', 'rgba(255,255,255,'));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // 绘制八角星形
        const halfSize = size / 2;
        const points = 8;
        
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 * i) / points;
            const radius = i % 2 === 0 ? halfSize : halfSize * 0.4;
            const pointX = Math.cos(angle) * radius;
            const pointY = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(pointX, pointY);
            } else {
                ctx.lineTo(pointX, pointY);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // 添加发光效果
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 0.5;
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * 渲染心形粒子
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 大小
     * @param {string} color - 颜色
     * @param {number} rotation - 旋转角度
     */
    renderHeartParticle(renderer, x, y, size, color, rotation = 0) {
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        ctx.fillStyle = color;
        ctx.beginPath();
        
        // 绘制心形
        const width = size;
        const height = size;
        const centerX = -width / 2;
        const centerY = -height / 2;
        
        ctx.moveTo(centerX + width / 2, centerY + height / 4);
        ctx.quadraticCurveTo(centerX, centerY, centerX + width / 4, centerY);
        ctx.quadraticCurveTo(centerX + width / 2, centerY, centerX + width / 2, centerY + height / 4);
        ctx.quadraticCurveTo(centerX + width / 2, centerY, centerX + width * 3/4, centerY);
        ctx.quadraticCurveTo(centerX + width, centerY, centerX + width, centerY + height / 4);
        ctx.quadraticCurveTo(centerX + width, centerY + height / 2, centerX + width / 2, centerY + height);
        ctx.quadraticCurveTo(centerX, centerY + height / 2, centerX + width / 2, centerY + height / 4);
        
        ctx.fill();
        
        // 添加发光效果
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 0.3;
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * 渲染闪烁粒子
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 大小
     * @param {string} color - 颜色
     * @param {number} rotation - 旋转角度
     */
    renderSparkleParticle(renderer, x, y, size, color, rotation = 0) {
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        
        // 绘制十字闪烁
        const halfSize = size / 2;
        
        // 主十字
        ctx.fillRect(-halfSize, -0.5, size, 1);
        ctx.fillRect(-0.5, -halfSize, 1, size);
        
        // 对角线
        ctx.save();
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-halfSize * 0.8, -0.3, size * 0.8, 0.6);
        ctx.fillRect(-0.3, -halfSize * 0.8, 0.6, size * 0.8);
        ctx.restore();
        
        // 添加发光效果
        ctx.shadowColor = color;
        ctx.shadowBlur = size;
        ctx.fillRect(-0.5, -0.5, 1, 1);
        
        ctx.restore();
    }
    
    /**
     * 渲染钻石粒子
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 大小
     * @param {string} color - 颜色
     * @param {number} rotation - 旋转角度
     */
    renderDiamondParticle(renderer, x, y, size, color, rotation = 0) {
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // 创建钻石渐变
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(1, color.replace(')', ', 0.2)').replace('rgb', 'rgba').replace('#', 'rgba(135,206,235,'));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // 绘制钻石形状
        const halfSize = size / 2;
        ctx.moveTo(0, -halfSize);
        ctx.lineTo(halfSize * 0.6, 0);
        ctx.lineTo(0, halfSize);
        ctx.lineTo(-halfSize * 0.6, 0);
        ctx.closePath();
        
        ctx.fill();
        
        // 添加钻石边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // 添加发光效果
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 0.8;
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * 检查是否有活跃的无敌效果
     * @returns {boolean} 是否有无敌效果
     */
    hasInvincibilityEffect() {
        return this.invincibilityEffect.active;
    }
    
    /**
     * 获取发光强度
     * @returns {number} 发光强度 (0-1)
     */
    getGlowIntensity() {
        return this.invincibilityEffect.glowIntensity;
    }
    
    /**
     * 添加特殊效果（如射击时的火花）
     * @param {string} effectType - 效果类型
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    addSpecialEffect(effectType, x, y) {
        switch (effectType) {
            case 'shooting_spark':
                this.addShootingSpark(x, y);
                break;
            case 'landing_dust':
                this.addLandingDust(x, y);
                break;
            default:
                break;
        }
    }
    
    /**
     * 添加射击火花效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    addShootingSpark(x, y) {
        for (let i = 0; i < 3; i++) {
            const spark = {
                x: x + Math.random() * 10,
                y: y + (Math.random() - 0.5) * 6,
                velocityX: 100 + Math.random() * 50,
                velocityY: (Math.random() - 0.5) * 30,
                lifetime: 0.2 + Math.random() * 0.1,
                maxLifetime: 0.3,
                color: '#ffff00',
                size: 1 + Math.random()
            };
            
            this.invincibilityEffect.sparkleParticles.push(spark);
        }
    }
    
    /**
     * 添加着陆尘土效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    addLandingDust(x, y) {
        for (let i = 0; i < 5; i++) {
            const dust = {
                x: x + (Math.random() - 0.5) * 20,
                y: y,
                velocityX: (Math.random() - 0.5) * 40,
                velocityY: -Math.random() * 20,
                lifetime: 0.5 + Math.random() * 0.3,
                maxLifetime: 0.8,
                color: '#d3d3d3',
                size: 2 + Math.random() * 2
            };
            
            this.invincibilityEffect.sparkleParticles.push(dust);
        }
    }
}