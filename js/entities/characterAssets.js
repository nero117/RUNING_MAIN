/**
 * 美女角色资源管理系统
 * 管理美女角色的动画资源、状态切换和视觉效果
 */
class CharacterAssets {
    constructor() {
        // 动画资源配置
        this.animations = {
            running: {
                frames: 4,
                speed: 6.0,
                loop: true
            },
            jumping: {
                frames: 3,
                speed: 8.0,
                loop: false
            },
            shooting: {
                frames: 2,
                speed: 10.0,
                loop: false
            }
        };
        
        // 角色外观配置
        this.appearance = {
            // 身体比例 - 美女角色更加修长优雅
            bodyWidth: 11,
            bodyHeight: 20,
            headRadius: 10,
            legWidth: 3.5,
            legHeight: 16,
            armWidth: 2.8,
            armLength: 13,
            
            // 颜色配置 - 更加时尚靓丽的配色
            skinColor: '#fdbcb4',      // 温暖的肤色
            hairColor: '#8b4513',      // 棕色长发
            topColor: '#ff69b4',       // 粉色运动上衣
            bottomColor: '#4169e1',    // 蓝色运动短裤
            shoeColor: '#ffffff',      // 白色运动鞋
            eyeColor: '#2c3e50',       // 深色眼睛
            lipColor: '#ff1493',       // 粉红色嘴唇
            
            // 新增装饰颜色
            accentColor: '#ffd700',    // 金色装饰
            highlightColor: '#ff85c1', // 高光颜色
            shadowColor: '#f4a6a0',    // 阴影颜色
            blushColor: 'rgba(255, 105, 180, 0.4)' // 腮红颜色
        };
        
        // 动画状态
        this.currentAnimation = 'running';
        this.animationFrame = 0;
        this.animationTime = 0;
    }
    
    /**
     * 更新动画状态
     * @param {string} animationState - 动画状态
     * @param {number} deltaTime - 时间增量
     */
    updateAnimation(animationState, deltaTime) {
        // 如果动画状态改变，重置动画
        if (this.currentAnimation !== animationState) {
            this.currentAnimation = animationState;
            this.animationFrame = 0;
            this.animationTime = 0;
        }
        
        const anim = this.animations[animationState] || this.animations.running;
        
        // 更新动画时间
        this.animationTime += deltaTime * anim.speed;
        
        // 更新动画帧
        if (anim.loop) {
            // 循环动画
            this.animationFrame = this.animationTime % anim.frames;
        } else {
            // 非循环动画
            this.animationFrame = Math.min(this.animationTime, anim.frames - 1);
        }
    }
    
    /**
     * 获取当前动画帧
     * @returns {number} 当前帧索引
     */
    getCurrentFrame() {
        return Math.floor(this.animationFrame);
    }
    
    /**
     * 获取动画进度
     * @returns {number} 动画进度 (0-1)
     */
    getAnimationProgress() {
        const anim = this.animations[this.currentAnimation] || this.animations.running;
        return (this.animationFrame % 1);
    }
    
    /**
     * 渲染美女角色
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} animationState - 动画状态
     * @param {number} scale - 缩放比例
     */
    renderCharacter(renderer, x, y, animationState, scale = 1.0) {
        const centerX = x + 12; // 角色中心点
        const bottomY = y + 40; // 角色底部
        
        // 保存渲染状态
        renderer.save();
        
        // 应用缩放
        if (scale !== 1.0) {
            renderer.ctx.translate(centerX, bottomY);
            renderer.ctx.scale(scale, scale);
            renderer.ctx.translate(-centerX, -bottomY);
        }
        
        // 获取动画参数
        const animParams = this.getAnimationParameters(animationState);
        
        // 渲染角色各部分
        this.renderLegs(renderer, centerX, bottomY, animParams);
        this.renderBody(renderer, centerX, bottomY, animParams);
        this.renderArms(renderer, centerX, bottomY, animParams);
        this.renderHead(renderer, centerX, bottomY, animParams);
        this.renderHair(renderer, centerX, bottomY, animParams);
        this.renderFace(renderer, centerX, bottomY, animParams);
        this.renderAccessories(renderer, centerX, bottomY, animParams);
        
        // 渲染特殊效果
        if (animationState === 'shooting') {
            this.renderShootingEffect(renderer, centerX, bottomY, animParams);
        }
        
        // 恢复渲染状态
        renderer.restore();
    }
    
    /**
     * 获取动画参数
     * @param {string} animationState - 动画状态
     * @returns {Object} 动画参数
     */
    getAnimationParameters(animationState) {
        const frame = this.getCurrentFrame();
        const progress = this.getAnimationProgress();
        const time = this.animationTime;
        
        let params = {
            frame,
            progress,
            time,
            bodyOffset: 0,
            armSwing: 0,
            legSwing: 0,
            headBob: 0,
            hairSway: 0
        };
        
        switch (animationState) {
            case 'running':
                // 奔跑动画参数
                params.bodyOffset = Math.sin(time * Math.PI * 2) * 1.5;
                params.armSwing = Math.sin(time * Math.PI * 2) * 4;
                params.legSwing = Math.sin(time * Math.PI * 2 + Math.PI) * 5;
                params.headBob = Math.sin(time * Math.PI * 2) * 0.8;
                params.hairSway = Math.sin(time * Math.PI * 1.5) * 2;
                break;
                
            case 'jumping':
                // 跳跃动画参数
                params.bodyOffset = -3;
                params.armSwing = frame < 1 ? -8 : 8; // 起跳时向后，空中时向前
                params.legSwing = frame < 1 ? -6 : 3; // 起跳时收腿，空中时伸展
                params.headBob = -1;
                params.hairSway = frame < 1 ? -3 : 4; // 头发飘动
                break;
                
            case 'shooting':
                // 射击动画参数
                params.bodyOffset = 0;
                params.armSwing = frame === 0 ? 6 : 8; // 瞄准到射击
                params.legSwing = 0;
                params.headBob = 0;
                params.hairSway = frame === 0 ? 1 : -2; // 射击时头发轻微摆动
                break;
                
            default:
                break;
        }
        
        return params;
    }
    
    /**
     * 渲染腿部
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     * @param {Object} params - 动画参数
     */
    renderLegs(renderer, centerX, bottomY, params) {
        const { legWidth, legHeight, bottomColor, shoeColor } = this.appearance;
        const legSpacing = 4;
        
        // 左腿
        const leftLegX = centerX - legSpacing;
        const leftLegY = bottomY - legHeight;
        const leftLegOffset = params.legSwing * 0.4;
        
        // 大腿
        renderer.fillRect(
            leftLegX - legWidth/2 + leftLegOffset,
            leftLegY,
            legWidth,
            legHeight * 0.6,
            this.appearance.skinColor
        );
        
        // 小腿（运动短裤）
        renderer.fillRect(
            leftLegX - legWidth/2 + leftLegOffset,
            leftLegY + legHeight * 0.6,
            legWidth,
            legHeight * 0.4,
            bottomColor
        );
        
        // 右腿
        const rightLegX = centerX + legSpacing;
        const rightLegY = bottomY - legHeight;
        const rightLegOffset = -params.legSwing * 0.4;
        
        // 大腿
        renderer.fillRect(
            rightLegX - legWidth/2 + rightLegOffset,
            rightLegY,
            legWidth,
            legHeight * 0.6,
            this.appearance.skinColor
        );
        
        // 小腿（运动短裤）
        renderer.fillRect(
            rightLegX - legWidth/2 + rightLegOffset,
            rightLegY + legHeight * 0.6,
            legWidth,
            legHeight * 0.4,
            bottomColor
        );
        
        // 时尚运动鞋
        const shoeWidth = legWidth + 4;
        const shoeHeight = 4;
        
        // 左鞋主体
        renderer.fillRect(
            leftLegX - shoeWidth/2 + leftLegOffset,
            bottomY - shoeHeight,
            shoeWidth,
            shoeHeight,
            shoeColor
        );
        
        // 右鞋主体
        renderer.fillRect(
            rightLegX - shoeWidth/2 + rightLegOffset,
            bottomY - shoeHeight,
            shoeWidth,
            shoeHeight,
            shoeColor
        );
        
        // 鞋子的时尚装饰条纹
        renderer.fillRect(
            leftLegX - shoeWidth/2 + 1 + leftLegOffset,
            bottomY - 3,
            shoeWidth - 2,
            1,
            '#ff69b4'
        );
        
        renderer.fillRect(
            rightLegX - shoeWidth/2 + 1 + rightLegOffset,
            bottomY - 3,
            shoeWidth - 2,
            1,
            '#ff69b4'
        );
        
        // 鞋带
        renderer.fillRect(
            leftLegX - 1 + leftLegOffset,
            bottomY - 3.5,
            2,
            0.5,
            '#c0c0c0'
        );
        
        renderer.fillRect(
            rightLegX - 1 + rightLegOffset,
            bottomY - 3.5,
            2,
            0.5,
            '#c0c0c0'
        );
        
        // 鞋底
        renderer.fillRect(
            leftLegX - shoeWidth/2 + leftLegOffset,
            bottomY - 1,
            shoeWidth,
            1,
            '#808080'
        );
        
        renderer.fillRect(
            rightLegX - shoeWidth/2 + rightLegOffset,
            bottomY - 1,
            shoeWidth,
            1,
            '#808080'
        );
        
        // 品牌标志
        renderer.fillRect(
            leftLegX + 1 + leftLegOffset,
            bottomY - 2.5,
            1,
            1,
            this.appearance.accentColor
        );
        
        renderer.fillRect(
            rightLegX + 1 + rightLegOffset,
            bottomY - 2.5,
            1,
            1,
            this.appearance.accentColor
        );
    }
    
    /**
     * 渲染身体
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     * @param {Object} params - 动画参数
     */
    renderBody(renderer, centerX, bottomY, params) {
        const { bodyWidth, bodyHeight, topColor, accentColor, highlightColor } = this.appearance;
        const bodyX = centerX - bodyWidth / 2;
        const bodyY = bottomY - bodyHeight - 16 + params.bodyOffset; // 腿部高度
        
        // 身体主体（时尚运动上衣）
        renderer.fillRect(bodyX, bodyY, bodyWidth, bodyHeight, topColor);
        
        // 上衣渐变效果
        renderer.fillRect(bodyX + 1, bodyY, bodyWidth - 2, bodyHeight / 3, highlightColor);
        
        // 时尚装饰条纹
        renderer.fillRect(bodyX + 1, bodyY + 4, bodyWidth - 2, 1.5, '#ff1493');
        renderer.fillRect(bodyX + 1, bodyY + 8, bodyWidth - 2, 1, '#ffffff');
        renderer.fillRect(bodyX + 1, bodyY + 11, bodyWidth - 2, 1.5, '#ff1493');
        
        // 腰部收腰设计 - 更加时尚
        const waistY = bodyY + bodyHeight - 5;
        renderer.fillRect(bodyX, waistY, bodyWidth, 3, '#ff1493');
        renderer.fillRect(bodyX + 1, waistY + 1, bodyWidth - 2, 1, accentColor);
        
        // 优雅的女性身材轮廓
        renderer.fillRect(bodyX + 2, bodyY + 3, bodyWidth - 4, 7, highlightColor);
        
        // 运动上衣的品牌标志
        renderer.fillRect(bodyX + bodyWidth - 3, bodyY + 2, 2, 2, accentColor);
        
        // 上衣的拉链细节
        renderer.fillRect(centerX - 0.5, bodyY, 1, bodyHeight * 0.6, '#c0c0c0');
        
        // 拉链头
        renderer.fillRect(centerX - 1, bodyY + 2, 2, 2, accentColor);
        
        // 运动时的衣服褶皱效果
        if (this.currentAnimation === 'running') {
            const wrinkleOffset = Math.sin(params.time * 8) * 0.5;
            renderer.fillRect(bodyX + 2 + wrinkleOffset, bodyY + bodyHeight * 0.7, bodyWidth - 4, 1, 'rgba(255, 20, 147, 0.3)');
        }
        
        // 射击时的衣服紧绷效果
        if (this.currentAnimation === 'shooting') {
            renderer.fillRect(bodyX + 1, bodyY + bodyHeight * 0.4, bodyWidth - 2, 2, 'rgba(255, 255, 255, 0.4)');
        }
    }
    
    /**
     * 渲染手臂
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     * @param {Object} params - 动画参数
     */
    renderArms(renderer, centerX, bottomY, params) {
        const { armWidth, armLength, skinColor } = this.appearance;
        const shoulderY = bottomY - 28 + params.bodyOffset; // 身体顶部
        
        // 左臂
        const leftArmX = centerX - 7;
        const leftArmSwing = params.armSwing * 0.6;
        
        // 上臂
        renderer.fillRect(
            leftArmX,
            shoulderY + leftArmSwing,
            armWidth,
            armLength * 0.6,
            skinColor
        );
        
        // 前臂
        renderer.fillRect(
            leftArmX,
            shoulderY + armLength * 0.6 + leftArmSwing,
            armWidth,
            armLength * 0.4,
            skinColor
        );
        
        // 左手
        renderer.drawCircle(
            leftArmX + armWidth/2,
            shoulderY + armLength + leftArmSwing,
            2,
            skinColor
        );
        
        // 右臂
        const rightArmX = centerX + 5;
        const rightArmSwing = -params.armSwing * 0.6;
        
        // 上臂
        renderer.fillRect(
            rightArmX,
            shoulderY + rightArmSwing,
            armWidth,
            armLength * 0.6,
            skinColor
        );
        
        // 前臂
        renderer.fillRect(
            rightArmX,
            shoulderY + armLength * 0.6 + rightArmSwing,
            armWidth,
            armLength * 0.4,
            skinColor
        );
        
        // 右手
        renderer.drawCircle(
            rightArmX + armWidth/2,
            shoulderY + armLength + rightArmSwing,
            2,
            skinColor
        );
        
        // 时尚手镯装饰
        renderer.drawCircle(
            leftArmX + armWidth/2,
            shoulderY + armLength * 0.7 + leftArmSwing,
            1.5,
            this.appearance.accentColor
        );
        
        renderer.drawCircle(
            rightArmX + armWidth/2,
            shoulderY + armLength * 0.7 + rightArmSwing,
            1.5,
            this.appearance.accentColor
        );
        
        // 手镯细节
        renderer.drawCircle(
            leftArmX + armWidth/2,
            shoulderY + armLength * 0.7 + leftArmSwing,
            1,
            '#ffffff'
        );
        
        renderer.drawCircle(
            rightArmX + armWidth/2,
            shoulderY + armLength * 0.7 + rightArmSwing,
            1,
            '#ffffff'
        );
        
        // 指甲油细节
        if (this.currentAnimation === 'shooting') {
            renderer.drawCircle(
                rightArmX + armWidth/2,
                shoulderY + armLength + rightArmSwing,
                1.5,
                '#ff1493'
            );
        }
        
        // 手表装饰（左手）
        if (this.currentAnimation === 'running') {
            renderer.fillRect(
                leftArmX,
                shoulderY + armLength * 0.6 + leftArmSwing,
                armWidth,
                2,
                '#c0c0c0'
            );
            
            renderer.fillRect(
                leftArmX + 0.5,
                shoulderY + armLength * 0.6 + leftArmSwing + 0.5,
                armWidth - 1,
                1,
                this.appearance.accentColor
            );
        }
    }
    
    /**
     * 渲染头部
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     * @param {Object} params - 动画参数
     */
    renderHead(renderer, centerX, bottomY, params) {
        const { headRadius, skinColor } = this.appearance;
        const headY = bottomY - 37 + params.headBob + params.bodyOffset; // 身体顶部上方
        
        // 头部主体
        renderer.drawCircle(centerX, headY, headRadius, skinColor);
        
        // 脸部轮廓阴影
        renderer.drawCircle(centerX + 1, headY + 1, headRadius - 1, '#f4a6a0');
    }
    
    /**
     * 渲染头发
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     * @param {Object} params - 动画参数
     */
    renderHair(renderer, centerX, bottomY, params) {
        const { headRadius, hairColor, accentColor } = this.appearance;
        const headY = bottomY - 37 + params.headBob + params.bodyOffset;
        const hairSway = params.hairSway;
        
        // 主要头发（长发）- 更加飘逸
        const hairWidth = headRadius + 4;
        const hairHeight = headRadius + 12;
        
        // 后面的长发主体
        renderer.fillRect(
            centerX - hairWidth/2 + hairSway * 0.3,
            headY - headRadius + 2,
            hairWidth,
            hairHeight,
            hairColor
        );
        
        // 长发的飘逸层次
        renderer.fillRect(
            centerX - hairWidth/2 + 2 + hairSway * 0.4,
            headY - headRadius + 4,
            hairWidth - 4,
            hairHeight + 2,
            '#a0522d' // 稍深的头发颜色
        );
        
        // 前刘海 - 更加自然
        const bangsWidth = headRadius + 2;
        const bangsHeight = 5;
        renderer.fillRect(
            centerX - bangsWidth/2,
            headY - headRadius,
            bangsWidth,
            bangsHeight,
            hairColor
        );
        
        // 刘海的层次感
        renderer.fillRect(
            centerX - bangsWidth/2 + 1,
            headY - headRadius + 1,
            bangsWidth - 2,
            bangsHeight - 1,
            '#a0522d'
        );
        
        // 侧面头发层次 - 更加丰富
        const leftHairX = centerX - headRadius - 2;
        const rightHairX = centerX + headRadius - 1;
        
        // 左侧头发
        renderer.fillRect(
            leftHairX + hairSway * 0.5,
            headY - 3,
            4,
            15,
            hairColor
        );
        renderer.fillRect(
            leftHairX + 1 + hairSway * 0.6,
            headY - 1,
            3,
            13,
            '#a0522d'
        );
        
        // 右侧头发
        renderer.fillRect(
            rightHairX + hairSway * 0.5,
            headY - 3,
            4,
            15,
            hairColor
        );
        renderer.fillRect(
            rightHairX + 1 + hairSway * 0.6,
            headY - 1,
            3,
            13,
            '#a0522d'
        );
        
        // 头发高光 - 更加自然
        renderer.fillRect(
            centerX - 3,
            headY - headRadius + 1,
            6,
            2,
            '#cd853f'
        );
        
        // 头发丝的细节
        for (let i = 0; i < 3; i++) {
            const strandX = centerX - 4 + i * 4 + hairSway * 0.2;
            const strandY = headY + headRadius - 2 + i * 2;
            renderer.fillRect(strandX, strandY, 1, 4 + i, '#a0522d');
        }
        
        // 时尚发带装饰
        if (this.currentAnimation === 'running') {
            // 主发带
            renderer.fillRect(
                centerX - headRadius + 2,
                headY - headRadius + 3,
                (headRadius - 2) * 2,
                3,
                accentColor
            );
            
            // 发带装饰细节
            renderer.fillRect(
                centerX - 2,
                headY - headRadius + 3,
                4,
                3,
                '#ffff00'
            );
        }
        
        // 射击时的头发动态效果
        if (this.currentAnimation === 'shooting') {
            // 头发向后飘动的效果
            renderer.fillRect(
                centerX - hairWidth/2 - 2 + hairSway * 0.8,
                headY - headRadius + 6,
                hairWidth + 4,
                hairHeight - 2,
                'rgba(139, 69, 19, 0.6)'
            );
        }
    }
    
    /**
     * 渲染面部表情
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     * @param {Object} params - 动画参数
     */
    renderFace(renderer, centerX, bottomY, params) {
        const headY = bottomY - 37 + params.headBob + params.bodyOffset;
        const { eyeColor, lipColor, blushColor, accentColor } = this.appearance;
        
        // 眼睛 - 更加美丽动人
        const eyeSize = 2.5;
        const eyeOffset = 4.5;
        
        // 左眼
        renderer.drawCircle(centerX - eyeOffset, headY - 2, eyeSize, '#ffffff');
        renderer.drawCircle(centerX - eyeOffset, headY - 2, eyeSize - 0.5, eyeColor);
        // 眼睛高光
        renderer.drawCircle(centerX - eyeOffset + 0.5, headY - 2.5, 0.8, '#ffffff');
        
        // 右眼
        renderer.drawCircle(centerX + eyeOffset, headY - 2, eyeSize, '#ffffff');
        renderer.drawCircle(centerX + eyeOffset, headY - 2, eyeSize - 0.5, eyeColor);
        // 眼睛高光
        renderer.drawCircle(centerX + eyeOffset + 0.5, headY - 2.5, 0.8, '#ffffff');
        
        // 更加精致的眼睫毛
        renderer.fillRect(centerX - eyeOffset - 1.5, headY - 4.5, 3, 1, '#000000');
        renderer.fillRect(centerX + eyeOffset - 1.5, headY - 4.5, 3, 1, '#000000');
        
        // 眼睫毛细节
        for (let i = 0; i < 3; i++) {
            const lashX = centerX - eyeOffset - 1 + i;
            const lashY = headY - 4.5;
            renderer.fillRect(lashX, lashY, 0.5, 1.5, '#000000');
            
            const rightLashX = centerX + eyeOffset - 1 + i;
            renderer.fillRect(rightLashX, lashY, 0.5, 1.5, '#000000');
        }
        
        // 更加优雅的眉毛
        renderer.fillRect(centerX - eyeOffset - 1.5, headY - 6, 4, 1.5, '#8b4513');
        renderer.fillRect(centerX + eyeOffset - 1.5, headY - 6, 4, 1.5, '#8b4513');
        
        // 眉毛高光
        renderer.fillRect(centerX - eyeOffset - 1, headY - 6, 3, 0.5, '#cd853f');
        renderer.fillRect(centerX + eyeOffset - 1, headY - 6, 3, 0.5, '#cd853f');
        
        // 精致的鼻子
        renderer.drawCircle(centerX, headY, 0.8, '#f4a6a0');
        renderer.drawCircle(centerX - 0.3, headY - 0.3, 0.3, '#ffffff'); // 鼻子高光
        
        // 嘴巴 - 根据状态改变表情，更加生动
        let mouthY = headY + 3.5;
        
        switch (this.currentAnimation) {
            case 'running':
                // 跑步时的自信微笑
                renderer.drawCircle(centerX, mouthY, 2.5, lipColor);
                renderer.drawCircle(centerX, mouthY - 0.8, 2, this.appearance.skinColor);
                // 微笑的嘴角上扬
                renderer.fillRect(centerX - 2, mouthY - 0.5, 1, 1, lipColor);
                renderer.fillRect(centerX + 1, mouthY - 0.5, 1, 1, lipColor);
                break;
            case 'jumping':
                // 跳跃时的兴奋表情
                renderer.drawCircle(centerX, mouthY, 3, lipColor);
                renderer.drawCircle(centerX, mouthY - 1, 2.5, this.appearance.skinColor);
                // 兴奋的张开嘴巴
                renderer.drawCircle(centerX, mouthY, 1.5, '#ff69b4');
                break;
            case 'shooting':
                // 射击时的专注表情
                renderer.fillRect(centerX - 2.5, mouthY, 5, 1.5, lipColor);
                // 专注时的轻微撅嘴
                renderer.drawCircle(centerX, mouthY + 0.5, 1, lipColor);
                break;
            default:
                renderer.drawCircle(centerX, mouthY, 2, lipColor);
        }
        
        // 更加自然的腮红
        renderer.drawCircle(centerX - 6.5, headY + 1.5, 2, blushColor);
        renderer.drawCircle(centerX + 6.5, headY + 1.5, 2, blushColor);
        
        // 腮红高光
        renderer.drawCircle(centerX - 6.5, headY + 1, 1, 'rgba(255, 255, 255, 0.3)');
        renderer.drawCircle(centerX + 6.5, headY + 1, 1, 'rgba(255, 255, 255, 0.3)');
        
        // 根据动画状态添加表情细节
        if (this.currentAnimation === 'running') {
            // 跑步时的汗珠 - 更加真实
            if (Math.random() < 0.2) {
                renderer.drawCircle(centerX + 4, headY - 3, 0.8, 'rgba(173, 216, 230, 0.9)');
                renderer.drawCircle(centerX + 4, headY - 2.5, 0.3, '#ffffff'); // 汗珠高光
            }
            
            // 运动时的红润
            renderer.drawCircle(centerX - 7, headY + 2, 1.5, 'rgba(255, 182, 193, 0.5)');
            renderer.drawCircle(centerX + 7, headY + 2, 1.5, 'rgba(255, 182, 193, 0.5)');
        }
        
        if (this.currentAnimation === 'shooting') {
            // 射击时的专注眼神
            renderer.fillRect(centerX - eyeOffset - 0.5, headY - 2.5, 1, 1, eyeColor);
            renderer.fillRect(centerX + eyeOffset - 0.5, headY - 2.5, 1, 1, eyeColor);
        }
        
        // 美女标志性的美人痣
        if (Math.random() < 0.7) { // 70%概率显示
            renderer.drawCircle(centerX + 3, headY + 2, 0.5, '#8b4513');
        }
    }
    
    /**
     * 渲染射击效果
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     * @param {Object} params - 动画参数
     */
    renderShootingEffect(renderer, centerX, bottomY, params) {
        if (params.frame === 1) { // 射击瞬间
            // 枪口火花效果 - 更加华丽
            const sparkX = centerX + 14;
            const sparkY = bottomY - 22;
            
            // 主火花
            for (let i = 0; i < 5; i++) {
                const sparkOffset = i * 3;
                const sparkSize = 1.5 + Math.random() * 1.5;
                renderer.drawCircle(
                    sparkX + sparkOffset,
                    sparkY + (Math.random() - 0.5) * 6,
                    sparkSize,
                    i % 2 === 0 ? '#ffff00' : '#ff6600'
                );
            }
            
            // 射击光束效果
            renderer.fillRect(centerX + 10, bottomY - 23, 12, 2, 'rgba(255, 255, 255, 0.8)');
            renderer.fillRect(centerX + 12, bottomY - 22, 8, 1, '#ffff00');
            
            // 美女射击时的专业姿态强调
            renderer.fillRect(centerX + 8, bottomY - 24, 8, 1, 'rgba(255, 255, 255, 0.6)');
            
            // 射击时的能量波纹
            for (let i = 0; i < 3; i++) {
                const rippleRadius = 5 + i * 3;
                renderer.save();
                renderer.setGlobalAlpha(0.3 - i * 0.1);
                renderer.strokeRect(
                    centerX - rippleRadius/2,
                    bottomY - 25 - rippleRadius/2,
                    rippleRadius,
                    rippleRadius,
                    '#ff69b4',
                    1
                );
                renderer.restore();
            }
        }
        
        // 射击准备姿态
        if (params.frame === 0) {
            // 瞄准线
            renderer.fillRect(centerX + 6, bottomY - 21, 8, 0.5, 'rgba(255, 0, 0, 0.5)');
            
            // 专注时的眼神光
            renderer.drawCircle(centerX + 4.5, bottomY - 39, 0.5, '#ffffff');
        }
    }
    
    /**
     * 渲染时尚配饰
     * @param {Renderer} renderer - 渲染器
     * @param {number} centerX - 中心X坐标
     * @param {number} bottomY - 底部Y坐标
     * @param {Object} params - 动画参数
     */
    renderAccessories(renderer, centerX, bottomY, params) {
        const headY = bottomY - 37 + params.headBob + params.bodyOffset;
        const { accentColor } = this.appearance;
        
        // 耳环
        const earringY = headY + 2;
        const earringSwing = Math.sin(params.time * 3) * 0.5;
        
        // 左耳环
        renderer.drawCircle(centerX - 8, earringY + earringSwing, 1.5, accentColor);
        renderer.drawCircle(centerX - 8, earringY + 2 + earringSwing, 1, accentColor);
        
        // 右耳环
        renderer.drawCircle(centerX + 8, earringY + earringSwing, 1.5, accentColor);
        renderer.drawCircle(centerX + 8, earringY + 2 + earringSwing, 1, accentColor);
        
        // 项链
        const neckY = bottomY - 32 + params.bodyOffset;
        renderer.fillRect(centerX - 4, neckY, 8, 1, accentColor);
        renderer.drawCircle(centerX, neckY + 2, 2, accentColor);
        renderer.drawCircle(centerX, neckY + 2, 1.5, '#ffffff');
        
        // 运动时的汗带（额外的时尚元素）
        if (this.currentAnimation === 'running') {
            renderer.fillRect(centerX - 6, headY - 8, 12, 1.5, '#ffffff');
            renderer.fillRect(centerX - 5, headY - 7.5, 10, 0.5, accentColor);
        }
        
        // 射击时的护目镜效果
        if (this.currentAnimation === 'shooting') {
            renderer.save();
            renderer.setGlobalAlpha(0.3);
            renderer.fillRect(centerX - 8, headY - 4, 16, 6, 'rgba(0, 0, 0, 0.2)');
            renderer.restore();
            
            // 护目镜反光
            renderer.fillRect(centerX - 6, headY - 3, 4, 1, 'rgba(255, 255, 255, 0.6)');
            renderer.fillRect(centerX + 2, headY - 3, 4, 1, 'rgba(255, 255, 255, 0.6)');
        }
        
        // 跳跃时的飘带效果
        if (this.currentAnimation === 'jumping') {
            const ribbonY = bottomY - 25 + params.bodyOffset;
            const ribbonSwing = params.hairSway * 1.5;
            
            // 飘带
            renderer.fillRect(centerX - 2 + ribbonSwing, ribbonY, 4, 8, 'rgba(255, 105, 180, 0.7)');
            renderer.fillRect(centerX - 1 + ribbonSwing, ribbonY + 1, 2, 6, 'rgba(255, 255, 255, 0.5)');
        }
    }
}