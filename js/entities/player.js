/**
 * 玩家角色类
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
        
        // 更新动画帧
        this.updateAnimation(deltaTime);
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
            
            // 触发射击回调
            this.shootCallbacks.forEach(callback => {
                try {
                    callback(this.getShootPosition());
                } catch (error) {
                    console.error('射击回调执行错误:', error);
                }
            });
            
            console.log('玩家射击！');
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
        // 根据动画状态渲染不同的视觉效果
        this.renderAnimatedPlayer(renderer);
        
        // 可选：显示调试信息
        if (GameConfig.DEBUG) {
            this.renderDebugInfo(renderer);
        }
    }
    
    /**
     * 渲染动画化的玩家
     * @param {Renderer} renderer - 渲染器
     */
    renderAnimatedPlayer(renderer) {
        let offsetY = 0, scale = 1.0;
        
        // 根据动画状态设置视觉效果
        switch (this.animationState) {
            case 'running':
                // 奔跑动画：轻微的上下摆动
                offsetY = Math.sin(this.animationFrame * Math.PI * 2) * 1;
                scale = 1.0;
                break;
            case 'jumping':
                // 跳跃动画：稍微拉伸
                scale = 1.05;
                offsetY = -2;
                break;
            case 'falling':
                // 下落动画：稍微压缩
                scale = 0.95;
                offsetY = 1;
                break;
            default:
                scale = 1.0;
        }
        
        // 计算基础位置
        const baseX = this.x;
        const baseY = this.y + offsetY;
        
        // 绘制卡通人物
        this.renderCartoonCharacter(renderer, baseX, baseY, scale);
        
        // 绘制跑步粒子效果
        if (this.animationState === 'running' && this.isGrounded) {
            this.renderRunningEffects(renderer, baseX, baseY);
        }
        
        // 绘制中心线指示器（显示玩家在屏幕中间）
        this.renderCenterIndicator(renderer);
        
        // 添加简单的动画效果指示器
        if (GameConfig.DEBUG) {
            this.renderAnimationIndicator(renderer);
        }
    }
    
    /**
     * 渲染卡通人物
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} scale - 缩放比例
     */
    renderCartoonCharacter(renderer, x, y, scale) {
        const centerX = x + this.width / 2;
        const bottomY = y + this.height;
        
        // 动画参数
        const runCycle = this.animationFrame * 2; // 加快动画速度
        const armSwing = Math.sin(runCycle) * 3;
        const legSwing = Math.sin(runCycle + Math.PI) * 4;
        
        // 保存渲染状态
        renderer.save();
        
        // 应用缩放
        if (scale !== 1.0) {
            renderer.ctx.translate(centerX, bottomY);
            renderer.ctx.scale(scale, scale);
            renderer.ctx.translate(-centerX, -bottomY);
        }
        
        // 1. 绘制腿部（在身体后面）
        this.renderLegs(renderer, centerX, bottomY, legSwing);
        
        // 2. 绘制身体
        this.renderBody(renderer, centerX, bottomY);
        
        // 3. 绘制手臂
        this.renderArms(renderer, centerX, bottomY, armSwing);
        
        // 4. 绘制头部
        this.renderHead(renderer, centerX, bottomY);
        
        // 5. 绘制面部表情
        this.renderFace(renderer, centerX, bottomY);
        
        // 恢复渲染状态
        renderer.restore();
    }
    
    /**
     * 渲染腿部
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     * @param {number} swing - 摆动幅度
     */
    renderLegs(renderer, centerX, bottomY, swing) {
        const legWidth = 4;
        const legHeight = 12;
        const legSpacing = 3;
        
        // 左腿
        const leftLegX = centerX - legSpacing;
        const leftLegY = bottomY - legHeight;
        const leftLegOffset = this.animationState === 'running' ? swing : 0;
        
        renderer.fillRect(
            leftLegX - legWidth/2 + leftLegOffset * 0.3,
            leftLegY,
            legWidth,
            legHeight,
            '#2c3e50'
        );
        
        // 右腿
        const rightLegX = centerX + legSpacing;
        const rightLegY = bottomY - legHeight;
        const rightLegOffset = this.animationState === 'running' ? -swing : 0;
        
        renderer.fillRect(
            rightLegX - legWidth/2 + rightLegOffset * 0.3,
            rightLegY,
            legWidth,
            legHeight,
            '#2c3e50'
        );
        
        // 脚部
        if (this.animationState === 'running') {
            // 左脚
            renderer.fillRect(
                leftLegX - legWidth/2 + leftLegOffset * 0.3 - 2,
                bottomY - 2,
                legWidth + 4,
                2,
                '#34495e'
            );
            
            // 右脚
            renderer.fillRect(
                rightLegX - legWidth/2 + rightLegOffset * 0.3 - 2,
                bottomY - 2,
                legWidth + 4,
                2,
                '#34495e'
            );
        }
    }
    
    /**
     * 渲染身体
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     */
    renderBody(renderer, centerX, bottomY) {
        const bodyWidth = 12;
        const bodyHeight = 16;
        const bodyX = centerX - bodyWidth / 2;
        const bodyY = bottomY - bodyHeight - 12; // 腿部高度
        
        // 身体主体
        renderer.fillRect(bodyX, bodyY, bodyWidth, bodyHeight, '#3498db');
        
        // 身体装饰（衣服细节）
        renderer.fillRect(bodyX + 2, bodyY + 2, bodyWidth - 4, 2, '#2980b9');
        renderer.fillRect(bodyX + 2, bodyY + 6, bodyWidth - 4, 1, '#2980b9');
        
        // 腰带
        renderer.fillRect(bodyX, bodyY + bodyHeight - 3, bodyWidth, 2, '#e67e22');
    }
    
    /**
     * 渲染手臂
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     * @param {number} swing - 摆动幅度
     */
    renderArms(renderer, centerX, bottomY, swing) {
        const armWidth = 3;
        const armLength = 10;
        const shoulderY = bottomY - 24; // 身体顶部
        
        // 左臂
        const leftArmX = centerX - 8;
        const leftArmSwing = this.animationState === 'running' ? swing : 0;
        
        renderer.fillRect(
            leftArmX,
            shoulderY + leftArmSwing * 0.5,
            armWidth,
            armLength,
            '#f39c12'
        );
        
        // 左手
        renderer.drawCircle(
            leftArmX + armWidth/2,
            shoulderY + armLength + leftArmSwing * 0.5,
            2,
            '#f39c12'
        );
        
        // 右臂
        const rightArmX = centerX + 5;
        const rightArmSwing = this.animationState === 'running' ? -swing : 0;
        
        renderer.fillRect(
            rightArmX,
            shoulderY + rightArmSwing * 0.5,
            armWidth,
            armLength,
            '#f39c12'
        );
        
        // 右手
        renderer.drawCircle(
            rightArmX + armWidth/2,
            shoulderY + armLength + rightArmSwing * 0.5,
            2,
            '#f39c12'
        );
    }
    
    /**
     * 渲染头部
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     */
    renderHead(renderer, centerX, bottomY) {
        const headRadius = 8;
        const headY = bottomY - 32; // 身体顶部上方
        
        // 头部主体
        renderer.drawCircle(centerX, headY, headRadius, '#f39c12');
        
        // 头发
        renderer.drawCircle(centerX, headY - 2, headRadius - 1, '#8b4513');
        
        // 帽子（可选）
        if (this.animationState === 'running') {
            renderer.fillRect(
                centerX - headRadius + 1,
                headY - headRadius,
                (headRadius - 1) * 2,
                3,
                '#e74c3c'
            );
        }
    }
    
    /**
     * 渲染面部表情
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     */
    renderFace(renderer, centerX, bottomY) {
        const headY = bottomY - 32;
        
        // 眼睛
        const eyeSize = 1.5;
        const eyeOffset = 3;
        
        // 左眼
        renderer.drawCircle(centerX - eyeOffset, headY - 2, eyeSize, '#2c3e50');
        
        // 右眼
        renderer.drawCircle(centerX + eyeOffset, headY - 2, eyeSize, '#2c3e50');
        
        // 嘴巴 - 根据状态改变表情
        let mouthY = headY + 2;
        let mouthWidth = 4;
        
        switch (this.animationState) {
            case 'running':
                // 跑步时的专注表情
                renderer.fillRect(centerX - mouthWidth/2, mouthY, mouthWidth, 1, '#2c3e50');
                break;
            case 'jumping':
                // 跳跃时的兴奋表情
                renderer.drawCircle(centerX, mouthY, 2, '#2c3e50');
                break;
            case 'falling':
                // 下落时的紧张表情
                renderer.fillRect(centerX - mouthWidth/2, mouthY + 1, mouthWidth, 1, '#2c3e50');
                break;
            default:
                renderer.fillRect(centerX - mouthWidth/2, mouthY, mouthWidth, 1, '#2c3e50');
        }
        
        // 腮红（跑步时）
        if (this.animationState === 'running') {
            renderer.drawCircle(centerX - 6, headY + 1, 1, 'rgba(231, 76, 60, 0.5)');
            renderer.drawCircle(centerX + 6, headY + 1, 1, 'rgba(231, 76, 60, 0.5)');
        }
    }
    
    /**
     * 渲染跑步效果
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    renderRunningEffects(renderer, x, y) {
        const footY = y + this.height;
        const centerX = x + this.width / 2;
        
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
            const lineY = y + 10 + i * 8;
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
     * 渲染动画指示器
     * @param {Renderer} renderer - 渲染器
     */
    renderAnimationIndicator(renderer) {
        const currentFrame = this.getCurrentFrame();
        const indicatorSize = 3;
        const spacing = 5;
        
        // 在玩家上方显示动画帧指示器
        for (let i = 0; i < this.currentFrameSet; i++) {
            const indicatorX = this.x + i * spacing;
            const indicatorY = this.y - 15;
            const indicatorColor = i === currentFrame ? '#ffffff' : '#666666';
            
            renderer.drawRect(indicatorX, indicatorY, indicatorSize, indicatorSize, indicatorColor);
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
    }
}