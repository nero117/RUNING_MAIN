/**
 * 菜单场景
 */
class MenuScene extends Scene {
    constructor() {
        super('menu');
        this.animationTime = 0;
        this.buttonPulse = 0;
        this.titleBounce = 0;
    }
    
    /**
     * 场景进入时调用
     */
    onEnter() {
        super.onEnter();
        console.log('进入菜单场景');
        this.animationTime = 0;
        this.buttonPulse = 0;
        this.titleBounce = 0;
    }
    
    /**
     * 场景退出时调用
     */
    onExit() {
        super.onExit();
        console.log('退出菜单场景');
    }
    
    /**
     * 更新场景
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        // 更新动画时间
        this.animationTime += deltaTime;
        this.buttonPulse = Math.sin(this.animationTime * 3) * 0.1 + 1;
        this.titleBounce = Math.sin(this.animationTime * 2) * 5;
    }
    
    /**
     * 渲染场景
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        // 绘制渐变背景
        this.drawGradientBackground(renderer);
        
        // 绘制装饰元素
        this.drawDecorations(renderer);
        
        // 绘制游戏标题（带动画效果）
        const titleY = GameConfig.CANVAS_HEIGHT / 2 - 120 + this.titleBounce;
        renderer.drawTextWithStroke(
            '跑酷大冒险',
            GameConfig.CANVAS_WIDTH / 2,
            titleY,
            '#FFD700',
            '#8B4513',
            'bold 56px Arial',
            'center',
            4
        );
        
        // 绘制副标题
        renderer.drawTextWithStroke(
            'Runner Adventure',
            GameConfig.CANVAS_WIDTH / 2,
            titleY + 60,
            '#FFA500',
            '#654321',
            'italic 24px Arial',
            'center',
            2
        );
        
        // 绘制开始游戏按钮
        this.drawStartButton(renderer);
        
        // 绘制游戏说明
        this.drawInstructions(renderer);
        
        // 绘制版权信息
        renderer.drawText(
            '© 2024 跑酷游戏 - 按空格键开始冒险！',
            GameConfig.CANVAS_WIDTH / 2,
            GameConfig.CANVAS_HEIGHT - 30,
            'rgba(255, 255, 255, 0.7)',
            '14px Arial',
            'center'
        );
    }
    
    /**
     * 绘制渐变背景
     * @param {Renderer} renderer - 渲染器
     */
    drawGradientBackground(renderer) {
        // 创建渐变背景效果
        const gradient = renderer.ctx.createLinearGradient(0, 0, 0, GameConfig.CANVAS_HEIGHT);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#4682B4');
        gradient.addColorStop(1, '#2F4F4F');
        
        renderer.ctx.fillStyle = gradient;
        renderer.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
    }
    
    /**
     * 绘制装饰元素
     * @param {Renderer} renderer - 渲染器
     */
    drawDecorations(renderer) {
        // 绘制装饰性的星星
        const starPositions = [
            { x: 100, y: 80 }, { x: 200, y: 60 }, { x: 600, y: 90 },
            { x: 700, y: 70 }, { x: 150, y: 300 }, { x: 650, y: 320 }
        ];
        
        starPositions.forEach((star, index) => {
            const twinkle = Math.sin(this.animationTime * 4 + index) * 0.3 + 0.7;
            renderer.setGlobalAlpha(twinkle);
            this.drawStar(renderer, star.x, star.y, 8, '#FFD700');
            renderer.resetGlobalAlpha();
        });
        
        // 绘制装饰性的云朵
        renderer.setGlobalAlpha(0.6);
        renderer.drawEllipse(120, 150, 80, 40, '#FFFFFF');
        renderer.drawEllipse(140, 140, 60, 30, '#FFFFFF');
        renderer.drawEllipse(100, 145, 50, 25, '#FFFFFF');
        
        renderer.drawEllipse(580, 180, 100, 50, '#FFFFFF');
        renderer.drawEllipse(610, 170, 70, 35, '#FFFFFF');
        renderer.drawEllipse(550, 175, 60, 30, '#FFFFFF');
        renderer.resetGlobalAlpha();
    }
    
    /**
     * 绘制星星
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 大小
     * @param {string} color - 颜色
     */
    drawStar(renderer, x, y, size, color) {
        renderer.ctx.fillStyle = color;
        renderer.ctx.beginPath();
        
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5;
            const radius = i % 2 === 0 ? size : size / 2;
            const pointX = x + Math.cos(angle) * radius;
            const pointY = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                renderer.ctx.moveTo(pointX, pointY);
            } else {
                renderer.ctx.lineTo(pointX, pointY);
            }
        }
        
        renderer.ctx.closePath();
        renderer.ctx.fill();
    }
    
    /**
     * 绘制开始游戏按钮
     * @param {Renderer} renderer - 渲染器
     */
    drawStartButton(renderer) {
        const buttonX = GameConfig.CANVAS_WIDTH / 2;
        const buttonY = GameConfig.CANVAS_HEIGHT / 2 + 20;
        const buttonWidth = 200 * this.buttonPulse;
        const buttonHeight = 50 * this.buttonPulse;
        
        // 绘制按钮背景
        renderer.ctx.fillStyle = '#32CD32';
        renderer.ctx.fillRect(
            buttonX - buttonWidth / 2,
            buttonY - buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );
        
        // 绘制按钮边框
        renderer.strokeRect(
            buttonX - buttonWidth / 2,
            buttonY - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            '#228B22',
            3
        );
        
        // 绘制按钮文本
        renderer.drawTextWithStroke(
            '开始游戏',
            buttonX,
            buttonY - 8,
            '#FFFFFF',
            '#000000',
            'bold 24px Arial',
            'center',
            2
        );
        
        // 绘制按键提示
        renderer.drawText(
            '按 [空格键] 开始',
            buttonX,
            buttonY + 15,
            '#FFFFFF',
            '16px Arial',
            'center'
        );
    }
    
    /**
     * 绘制游戏说明
     * @param {Renderer} renderer - 渲染器
     */
    drawInstructions(renderer) {
        const instructionY = GameConfig.CANVAS_HEIGHT / 2 + 120;
        
        // 绘制说明标题
        renderer.drawTextWithStroke(
            '游戏说明',
            GameConfig.CANVAS_WIDTH / 2,
            instructionY,
            '#FFD700',
            '#8B4513',
            'bold 28px Arial',
            'center',
            2
        );
        
        // 绘制游戏规则
        const instructions = [
            '🏃 角色会自动向前奔跑',
            '⬆️ 按空格键让角色跳跃',
            '🔫 按Q键射击消除漂浮障碍物',
            '🚧 躲避路上的障碍物',
            '🎯 射击漂浮障碍物获得额外得分',
            '🏆 坚持越久得分越高'
        ];
        
        instructions.forEach((instruction, index) => {
            renderer.drawText(
                instruction,
                GameConfig.CANVAS_WIDTH / 2,
                instructionY + 40 + (index * 22),
                '#FFFFFF',
                '16px Arial',
                'center'
            );
        });
    }
    
    /**
     * 处理输入
     * @param {InputHandler} inputHandler - 输入处理器
     */
    handleInput(inputHandler) {
        if (inputHandler.isKeyJustPressed('Space')) {
            // 切换到游戏场景
            if (this.gameEngine && this.gameEngine.sceneManager) {
                this.gameEngine.sceneManager.switchScene('game');
            } else {
                console.log('准备开始游戏...');
            }
        }
    }
}