/**
 * 玩家角色类 - 美女角色版本
 */
class Player extends Entity {
    constructor(x, y) {
        super(x, y, GameConfig.PLAYER.WIDTH, GameConfig.PLAYER.HEIGHT);
        this.isGrounded = true;
        this.animationFrame = 0;
        this.animationSpeed = GameConfig.PLAYER.ANIMATION_SPEED;
        
        // 设置玩家固定在屏幕中间
        this.x = GameConfig.PLAYER.CENTER_X - this.width / 2;
        this.y = GameConfig.GROUND_Y - this.height;
        
        // 玩家不再水平移动，只有垂直移动（跳跃）
        this.velocityX = 0;
        
        // 创建物理系统实例
        this.physics = new PhysicsSystem();
        
        // 跳跃状态管理
        this.canJump = true;
        this.jumpCooldown = 0;
        
        // 动画状态管理
        this.animationState = 'running'; // 'running', 'jumping', 'falling', 'shooting'
        this.runningFrames = GameConfig.PLAYER.RUNNING_FRAMES;
        this.jumpingFrames = GameConfig.PLAYER.JUMPING_FRAMES;
        this.currentFrameSet = this.runningFrames;
        
        // 射击状态管理
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootCooldownTime = GameConfig.SHOOT_COOLDOWN || 300; // 300毫秒冷却时间
        this.lastShootTime = 0;
        this.shootCallbacks = [];
        
        // 美女角色系统
        this.characterAssets = new CharacterAssets();
        this.characterEffects = new CharacterEffects(this);
        
        // 无敌状态管理
        this.isInvincible = false;
        this.invincibleTimeLeft = 0;
        this.invincibleDuration = 0;
    }
    
    /**
     * 更新玩家状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        // 玩家固定在屏幕中间，不进行水平移动
        this.velocityX = 0;
        this.x = GameConfig.PLAYER.CENTER_X - this.width / 2;
        
        // 应用物理系统更新（重力、碰撞等）
        this.physics.updatePhysics(this, deltaTime);
        
        // 只更新垂直位置（跳跃）
        this.y += this.velocityY * deltaTime;
        
        // 边界检测 - 确保玩家不会移出屏幕
        this.checkBounds();
        
        // 更新跳跃冷却时间
        this.updateJumpCooldown(deltaTime);
        
        // 更新射击冷却时间
        this.updateShootCooldown(deltaTime);
        
        // 更新无敌状态
        this.updateInvincibility(deltaTime);
        
        // 更新动画帧
        this.updateAnimation(deltaTime);
        
        // 更新美女角色动画
        this.characterAssets.updateAnimation(this.animationState, deltaTime);
        
        // 更新角色特效
        this.characterEffects.update(deltaTime);
    }
    
    /**
     * 检查并处理边界碰撞
     */
    checkBounds() {
        // 玩家X位置固定在屏幕中间，不需要水平边界检测
        this.x = GameConfig.PLAYER.CENTER_X - this.width / 2;
        
        // 上边界检测 - 玩家不能移出屏幕顶部
        if (this.y < 0) {
            this.y = 0;
            this.velocityY = Math.max(0, this.velocityY); // 只重置向上的速度
        }
        
        // 下边界检测由物理系统处理，这里只做额外保护
        if (this.y + this.height > GameConfig.CANVAS_HEIGHT) {
            this.y = GameConfig.CANVAS_HEIGHT - this.height;
            this.velocityY = 0;
        }
    }
    
    /**
     * 更新动画状态
     * @param {number} deltaTime - 时间增量
     */
    updateAnimation(deltaTime) {
        // 根据玩家状态确定动画状态
        this.updateAnimationState();
        
        // 根据当前动画状态设置帧数
        this.setCurrentFrameSet();
        
        // 更新动画帧（转换为帧/秒）
        this.animationFrame += this.animationSpeed * deltaTime;
        
        // 重置动画帧到循环开始
        if (this.animationFrame >= this.currentFrameSet) {
            this.animationFrame = 0;
        }
    }
    
    /**
     * 根据玩家物理状态更新动画状态
     */
    updateAnimationState() {
        // 射击状态优先级最高（短暂状态）
        if (!this.canShoot && this.getShootCooldownRemaining() > this.shootCooldownTime * 0.7) {
            this.animationState = 'shooting';
        } else if (this.isGrounded) {
            this.animationState = 'running';
        } else {
            // 根据垂直速度判断是跳跃还是下落
            if (this.velocityY < 0) {
                this.animationState = 'jumping';
            } else {
                this.animationState = 'falling';
            }
        }
    }
    
    /**
     * 根据动画状态设置当前帧集
     */
    setCurrentFrameSet() {
        switch (this.animationState) {
            case 'running':
                this.currentFrameSet = this.runningFrames;
                break;
            case 'jumping':
            case 'falling':
                this.currentFrameSet = this.jumpingFrames;
                break;
            case 'shooting':
                this.currentFrameSet = this.runningFrames; // 射击时保持跑步动画
                break;
            default:
                this.currentFrameSet = this.runningFrames;
        }
    }
    
    /**
     * 获取当前动画帧索引
     * @returns {number} 当前帧索引
     */
    getCurrentFrame() {
        return Math.floor(this.animationFrame);
    }
    
    /**
     * 获取动画状态信息
     * @returns {Object} 动画状态信息
     */
    getAnimationInfo() {
        return {
            state: this.animationState,
            frame: this.getCurrentFrame(),
            totalFrames: this.currentFrameSet,
            progress: this.animationFrame / this.currentFrameSet
        };
    }
    
    /**
     * 执行跳跃
     */
    jump() {
        // 只有在地面上且可以跳跃时才执行跳跃
        if (this.isGrounded && this.canJump) {
            this.physics.applyJumpForce(this, GameConfig.JUMP_FORCE);
            this.canJump = false;
            this.jumpCooldown = 0.1; // 100ms的跳跃冷却时间，防止连续跳跃
        }
    }
    
    /**
     * 更新跳跃冷却时间
     * @param {number} deltaTime - 时间增量
     */
    updateJumpCooldown(deltaTime) {
        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= deltaTime;
        }
        
        // 当玩家着地且冷却时间结束时，重新允许跳跃
        if (this.isGrounded && this.jumpCooldown <= 0) {
            this.canJump = true;
        }
    }
    
    /**
     * 更新射击冷却时间
     * @param {number} deltaTime - 时间增量（秒）
     */
    updateShootCooldown(deltaTime) {
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime * 1000; // 转换为毫秒
        }
        
        // 当冷却时间结束时，重新允许射击
        if (this.shootCooldown <= 0) {
            this.canShoot = true;
        }
    }
    
    /**
     * 执行射击
     */
    shoot() {
        const currentTime = Date.now();
        
        // 检查是否可以射击
        if (this.canShoot && currentTime - this.lastShootTime >= this.shootCooldownTime) {
            this.lastShootTime = currentTime;
            this.shootCooldown = this.shootCooldownTime;
            this.canShoot = false;
            
            // 添加射击特效
            const shootPos = this.getShootPosition();
            this.characterEffects.addSpecialEffect('shooting_spark', shootPos.x, shootPos.y);
            
            // 触发射击回调
            this.shootCallbacks.forEach(callback => {
                try {
                    callback(shootPos);
                } catch (error) {
                    console.error('射击回调执行错误:', error);
                }
            });
            
            console.log('美女角色射击！');
            return true;
        }
        
        return false;
    }
    
    /**
     * 获取射击位置
     * @returns {Object} 射击位置信息
     */
    getShootPosition() {
        return {
            x: this.x + this.width, // 从玩家右侧发射
            y: this.y + this.height / 2, // 从玩家中心高度发射
            direction: 1 // 向右射击
        };
    }
    
    /**
     * 注册射击回调
     * @param {Function} callback - 射击回调函数
     */
    onShoot(callback) {
        if (typeof callback === 'function') {
            this.shootCallbacks.push(callback);
        }
    }
    
    /**
     * 检查是否可以射击
     * @returns {boolean} 是否可以射击
     */
    canShootNow() {
        const currentTime = Date.now();
        return this.canShoot && currentTime - this.lastShootTime >= this.shootCooldownTime;
    }
    
    /**
     * 获取射击冷却剩余时间
     * @returns {number} 剩余冷却时间（毫秒）
     */
    getShootCooldownRemaining() {
        const currentTime = Date.now();
        const remaining = this.shootCooldownTime - (currentTime - this.lastShootTime);
        return Math.max(0, remaining);
    }
    
    /**
     * 设置射击冷却时间
     * @param {number} cooldownTime - 冷却时间（毫秒）
     */
    setShootCooldown(cooldownTime) {
        this.shootCooldownTime = cooldownTime;
    }
    
    /**
     * 设置无敌状态
     * @param {number} duration - 无敌持续时间（秒）
     */
    setInvincible(duration) {
        this.isInvincible = true;
        this.invincibleDuration = duration;
        this.invincibleTimeLeft = duration;
        
        // 激活视觉效果
        this.characterEffects.activateInvincibilityEffect(duration);
        
        console.log(`✨ 美女角色进入华丽无敌状态，持续 ${duration} 秒 ✨`);
    }
    
    /**
     * 检查是否处于无敌状态
     * @returns {boolean} 是否无敌
     */
    isInvincible() {
        return this.isInvincible;
    }
    
    /**
     * 获取剩余无敌时间
     * @returns {number} 剩余时间（秒）
     */
    getInvincibleTimeLeft() {
        return Math.max(0, this.invincibleTimeLeft);
    }
    
    /**
     * 更新无敌状态
     * @param {number} deltaTime - 时间增量
     */
    updateInvincibility(deltaTime) {
        if (this.isInvincible) {
            this.invincibleTimeLeft -= deltaTime;
            
            // 更新角色特效的剩余时间
            this.characterEffects.invincibilityEffect.timeLeft = this.invincibleTimeLeft;
            
            // 无敌时间结束
            if (this.invincibleTimeLeft <= 0) {
                this.isInvincible = false;
                this.invincibleTimeLeft = 0;
                
                // 停用视觉效果
                this.characterEffects.deactivateInvincibilityEffect();
                
                console.log('💫 美女角色华丽无敌状态结束 💫');
            }
        }
    }
    
    /**
     * 检查玩家是否在地面上
     * @returns {boolean} 是否在地面上
     */
    isOnGround() {
        return this.isGrounded;
    }
    
    /**
     * 获取玩家当前位置信息
     * @returns {Object} 位置信息
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y,
            velocityX: this.velocityX,
            velocityY: this.velocityY,
            isGrounded: this.isGrounded
        };
    }
    
    /**
     * 渲染玩家
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        // 根据动画状态计算缩放和偏移
        let scale = 1.0;
        let glowScale = 1.0;
        
        switch (this.animationState) {
            case 'jumping':
                scale = 1.05;
                glowScale = 1.1;
                break;
            case 'falling':
                scale = 0.95;
                glowScale = 0.9;
                break;
            default:
                scale = 1.0;
                glowScale = 1.0;
        }
        
        // 如果处于无敌状态，增加额外的视觉效果
        if (this.isInvincible) {
            scale *= 1.02; // 轻微放大
            glowScale *= 1.15;
            
            // 添加无敌状态的角色轮廓发光
            renderer.save();
            renderer.ctx.shadowColor = '#ff69b4';
            renderer.ctx.shadowBlur = 8 * this.characterEffects.getGlowIntensity();
            
            // 渲染美女角色（带发光效果）
            this.characterAssets.renderCharacter(
                renderer, 
                this.x, 
                this.y, 
                this.animationState, 
                scale
            );
            
            renderer.restore();
        } else {
            // 正常渲染美女角色
            this.characterAssets.renderCharacter(
                renderer, 
                this.x, 
                this.y, 
                this.animationState, 
                scale
            );
        }
        
        // 渲染美女角色特效（在角色上面，更显眼）
        renderer.save();
        if (this.isInvincible) {
            renderer.ctx.globalCompositeOperation = 'screen'; // 使用屏幕混合模式让效果更亮
        }
        this.characterEffects.render(renderer);
        renderer.restore();
        
        // 渲染跑步粒子效果
        if (this.animationState === 'running' && this.isGrounded) {
            this.renderRunningEffects(renderer);
        }
        
        // 着陆时的尘土效果
        if (this.isGrounded && this.velocityY > 100) {
            this.characterEffects.addSpecialEffect('landing_dust', this.x + this.width/2, this.y + this.height);
        }
        
        // 无敌状态的额外视觉提示
        if (this.isInvincible) {
            this.renderInvincibilityIndicator(renderer);
        }
        
        // 可选：显示调试信息
        if (GameConfig.DEBUG) {
            this.renderDebugInfo(renderer);
            this.renderCenterIndicator(renderer);
        }
    }
    
    /**
     * 渲染无敌状态指示器
     * @param {Renderer} renderer - 渲染器
     */
    renderInvincibilityIndicator(renderer) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y - 15;
        const timeLeft = Math.ceil(this.invincibleTimeLeft);
        
        // 渲染剩余时间
        if (timeLeft > 0) {
            let textColor = '#ffff00';
            if (timeLeft <= 3) {
                textColor = Math.sin(Date.now() * 0.01) > 0 ? '#ff0000' : '#ffff00'; // 闪烁警告
            }
            
            renderer.save();
            renderer.ctx.font = 'bold 14px Arial';
            renderer.ctx.textAlign = 'center';
            renderer.ctx.fillStyle = textColor;
            renderer.ctx.strokeStyle = '#000000';
            renderer.ctx.lineWidth = 2;
            
            const text = `✨${timeLeft}✨`;
            renderer.ctx.strokeText(text, centerX, centerY);
            renderer.ctx.fillText(text, centerX, centerY);
            
            renderer.restore();
        }
    }
    

    
    /**
     * 渲染跑步效果
     * @param {Renderer} renderer - 渲染器
     */
    renderRunningEffects(renderer) {
        const footY = this.y + this.height;
        const centerX = this.x + this.width / 2;
        
        // 跑步灰尘效果
        const dustCount = 3;
        for (let i = 0; i < dustCount; i++) {
            const dustX = centerX - 10 + Math.random() * 20;
            const dustY = footY - Math.random() * 5;
            const dustSize = 1 + Math.random() * 2;
            const dustAlpha = 0.3 + Math.random() * 0.4;
            
            renderer.setGlobalAlpha(dustAlpha);
            renderer.drawCircle(dustX, dustY, dustSize, '#bdc3c7');
            renderer.resetGlobalAlpha();
        }
        
        // 速度线效果
        const speedLineCount = 2;
        for (let i = 0; i < speedLineCount; i++) {
            const lineX = centerX - 15 - i * 5;
            const lineY = this.y + 10 + i * 8;
            const lineLength = 8 + Math.random() * 4;
            
            renderer.setGlobalAlpha(0.6);
            renderer.fillRect(lineX, lineY, lineLength, 1, '#ecf0f1');
            renderer.resetGlobalAlpha();
        }
    }
    
    /**
     * 渲染中心指示器
     * @param {Renderer} renderer - 渲染器
     */
    renderCenterIndicator(renderer) {
        if (GameConfig.DEBUG) {
            // 绘制屏幕中心线
            const centerX = GameConfig.CANVAS_WIDTH / 2;
            renderer.drawRect(centerX - 1, 0, 2, GameConfig.CANVAS_HEIGHT, 'rgba(255, 255, 0, 0.3)');
            
            // 绘制玩家中心点
            const playerCenterX = this.x + this.width / 2;
            renderer.drawCircle(playerCenterX, this.y + this.height / 2, 3, '#ffff00');
        }
    }
    

    
    /**
     * 渲染调试信息
     * @param {Renderer} renderer - 渲染器
     */
    renderDebugInfo(renderer) {
        const animInfo = this.getAnimationInfo();
        
        renderer.drawText(`Pos: (${Math.round(this.x)}, ${Math.round(this.y)})`, 
                        this.x, this.y - 30, '#ffffff', '12px Arial');
        renderer.drawText(`Vel: (${Math.round(this.velocityX)}, ${Math.round(this.velocityY)})`, 
                        this.x, this.y - 45, '#ffffff', '12px Arial');
        renderer.drawText(`Grounded: ${this.isGrounded}, CanJump: ${this.canJump}`, 
                        this.x, this.y - 60, '#ffffff', '12px Arial');
        renderer.drawText(`Anim: ${animInfo.state} (${animInfo.frame}/${animInfo.totalFrames})`, 
                        this.x, this.y - 75, '#ffffff', '12px Arial');
        renderer.drawText(`Invincible: ${this.isInvincible} (${Math.round(this.invincibleTimeLeft)}s)`, 
                        this.x, this.y - 90, '#ffffff', '12px Arial');
        renderer.drawText(`Character: Beauty Female`, 
                        this.x, this.y - 105, '#ff69b4', '12px Arial');
    }
}