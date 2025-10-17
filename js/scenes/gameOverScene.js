/**
 * 游戏结束场景
 */
class GameOverScene extends Scene {
    constructor() {
        super('gameOver');
        this.finalScore = 0;
        this.bestScore = 0;
        this.animationTime = 0;
        this.fadeInAlpha = 0;
        this.scoreCountUp = 0;
        this.isNewRecord = false;
        this.sparkles = [];
        this.buttonPulse = 0;
    }
    
    /**
     * 设置最终得分
     * @param {number} score - 最终得分
     */
    setFinalScore(score) {
        this.finalScore = score;
        this.scoreCountUp = 0;
        
        // 检查是否是新纪录
        this.bestScore = this.getBestScore();
        this.isNewRecord = score > this.bestScore;
        
        if (this.isNewRecord) {
            this.setBestScore(score);
            this.bestScore = score;
            this.createCelebrationSparkles();
        }
    }
    
    /**
     * 获取最佳得分
     * @returns {number} 最佳得分
     */
    getBestScore() {
        return parseInt(localStorage.getItem('runnerGameBestScore') || '0');
    }
    
    /**
     * 设置最佳得分
     * @param {number} score - 得分
     */
    setBestScore(score) {
        localStorage.setItem('runnerGameBestScore', score.toString());
    }
    
    /**
     * 创建庆祝特效
     */
    createCelebrationSparkles() {
        this.sparkles = [];
        for (let i = 0; i < 20; i++) {
            this.sparkles.push({
                x: GameConfig.CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 200,
                y: GameConfig.CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                life: 1.0,
                decay: Math.random() * 0.5 + 0.5,
                size: Math.random() * 4 + 2,
                color: ['#FFD700', '#FFA500', '#FF6347', '#32CD32'][Math.floor(Math.random() * 4)]
            });
        }
    }
    
    /**
     * 场景进入时调用
     */
    onEnter() {
        super.onEnter();
        console.log('进入游戏结束场景');
        this.animationTime = 0;
        this.fadeInAlpha = 0;
        this.scoreCountUp = 0;
        this.buttonPulse = 0;
    }
    
    /**
     * 场景退出时调用
     */
    onExit() {
        super.onExit();
        console.log('退出游戏结束场景');
    }
    
    /**
     * 更新场景
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        this.animationTime += deltaTime;
        
        // 淡入动画
        if (this.fadeInAlpha < 1) {
            this.fadeInAlpha = Math.min(1, this.fadeInAlpha + deltaTime * 2);
        }
        
        // 得分计数动画
        if (this.scoreCountUp < this.finalScore) {
            this.scoreCountUp = Math.min(this.finalScore, this.scoreCountUp + this.finalScore * deltaTime * 2);
        }
        
        // 按钮脉冲动画
        this.buttonPulse = Math.sin(this.animationTime * 3) * 0.1 + 1;
        
        // 更新庆祝特效
        this.updateSparkles(deltaTime);
    }
    
    /**
     * 更新庆祝特效
     * @param {number} deltaTime - 时间增量
     */
    updateSparkles(deltaTime) {
        this.sparkles.forEach(sparkle => {
            sparkle.x += sparkle.vx * deltaTime;
            sparkle.y += sparkle.vy * deltaTime;
            sparkle.life -= sparkle.decay * deltaTime;
        });
        
        // 移除生命值耗尽的特效
        this.sparkles = this.sparkles.filter(sparkle => sparkle.life > 0);
    }
    
    /**
     * 渲染场景
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        // 绘制暗化背景
        this.drawDarkBackground(renderer);
        
        // 设置淡入透明度
        renderer.setGlobalAlpha(this.fadeInAlpha);
        
        // 绘制游戏结束标题
        this.drawGameOverTitle(renderer);
        
        // 绘制得分信息
        this.drawScoreInfo(renderer);
        
        // 绘制新纪录提示
        if (this.isNewRecord) {
            this.drawNewRecordBanner(renderer);
        }
        
        // 绘制重新开始按钮
        this.drawRestartButton(renderer);
        
        // 绘制返回菜单选项
        this.drawMenuOption(renderer);
        
        // 重置透明度
        renderer.resetGlobalAlpha();
        
        // 绘制庆祝特效（不受淡入影响）
        this.drawSparkles(renderer);
    }
    
    /**
     * 绘制暗化背景
     * @param {Renderer} renderer - 渲染器
     */
    drawDarkBackground(renderer) {
        // 绘制半透明黑色覆盖层
        renderer.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT, 'rgba(0, 0, 0, 0.8)');
        
        // 绘制渐变边框效果
        const gradient = renderer.ctx.createRadialGradient(
            GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2, 0,
            GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2, 300
        );
        gradient.addColorStop(0, 'rgba(139, 69, 19, 0.3)');
        gradient.addColorStop(1, 'rgba(139, 69, 19, 0.1)');
        
        renderer.ctx.fillStyle = gradient;
        renderer.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
    }
    
    /**
     * 绘制游戏结束标题
     * @param {Renderer} renderer - 渲染器
     */
    drawGameOverTitle(renderer) {
        const titleY = GameConfig.CANVAS_HEIGHT / 2 - 120;
        const shake = Math.sin(this.animationTime * 10) * 2;
        
        renderer.drawTextWithStroke(
            '游戏结束',
            GameConfig.CANVAS_WIDTH / 2 + shake,
            titleY,
            '#FF6347',
            '#8B0000',
            'bold 48px Arial',
            'center',
            4
        );
        
        // 绘制副标题
        renderer.drawText(
            'Game Over',
            GameConfig.CANVAS_WIDTH / 2,
            titleY + 50,
            'rgba(255, 255, 255, 0.8)',
            'italic 24px Arial',
            'center'
        );
    }
    
    /**
     * 绘制得分信息
     * @param {Renderer} renderer - 渲染器
     */
    drawScoreInfo(renderer) {
        const scoreY = GameConfig.CANVAS_HEIGHT / 2 - 40;
        
        // 绘制当前得分
        renderer.drawTextWithStroke(
            `最终得分: ${Math.floor(this.scoreCountUp)}`,
            GameConfig.CANVAS_WIDTH / 2,
            scoreY,
            '#FFD700',
            '#B8860B',
            'bold 32px Arial',
            'center',
            3
        );
        
        // 绘制最佳得分
        renderer.drawText(
            `最佳得分: ${this.bestScore}`,
            GameConfig.CANVAS_WIDTH / 2,
            scoreY + 40,
            this.isNewRecord ? '#32CD32' : '#FFFFFF',
            '24px Arial',
            'center'
        );
    }
    
    /**
     * 绘制新纪录横幅
     * @param {Renderer} renderer - 渲染器
     */
    drawNewRecordBanner(renderer) {
        const bannerY = GameConfig.CANVAS_HEIGHT / 2 + 20;
        const glow = Math.sin(this.animationTime * 5) * 0.3 + 0.7;
        
        renderer.setGlobalAlpha(glow);
        
        // 绘制横幅背景
        renderer.fillRect(
            GameConfig.CANVAS_WIDTH / 2 - 120,
            bannerY - 15,
            240,
            30,
            '#32CD32'
        );
        
        renderer.strokeRect(
            GameConfig.CANVAS_WIDTH / 2 - 120,
            bannerY - 15,
            240,
            30,
            '#228B22',
            2
        );
        
        // 绘制新纪录文本
        renderer.drawTextWithStroke(
            '🏆 新纪录！ 🏆',
            GameConfig.CANVAS_WIDTH / 2,
            bannerY - 8,
            '#FFFFFF',
            '#000000',
            'bold 20px Arial',
            'center',
            2
        );
        
        renderer.resetGlobalAlpha();
    }
    
    /**
     * 绘制重新开始按钮
     * @param {Renderer} renderer - 渲染器
     */
    drawRestartButton(renderer) {
        const buttonY = GameConfig.CANVAS_HEIGHT / 2 + 80;
        const buttonWidth = 180 * this.buttonPulse;
        const buttonHeight = 45 * this.buttonPulse;
        
        // 绘制按钮背景
        renderer.fillRect(
            GameConfig.CANVAS_WIDTH / 2 - buttonWidth / 2,
            buttonY - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            '#4169E1'
        );
        
        renderer.strokeRect(
            GameConfig.CANVAS_WIDTH / 2 - buttonWidth / 2,
            buttonY - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            '#191970',
            3
        );
        
        // 绘制按钮文本
        renderer.drawTextWithStroke(
            '重新开始',
            GameConfig.CANVAS_WIDTH / 2,
            buttonY - 8,
            '#FFFFFF',
            '#000000',
            'bold 22px Arial',
            'center',
            2
        );
        
        // 绘制按键提示
        renderer.drawText(
            '按 [空格键]',
            GameConfig.CANVAS_WIDTH / 2,
            buttonY + 12,
            '#FFFFFF',
            '14px Arial',
            'center'
        );
    }
    
    /**
     * 绘制返回菜单选项
     * @param {Renderer} renderer - 渲染器
     */
    drawMenuOption(renderer) {
        const menuY = GameConfig.CANVAS_HEIGHT / 2 + 140;
        
        renderer.drawText(
            '按 [ESC] 返回主菜单',
            GameConfig.CANVAS_WIDTH / 2,
            menuY,
            'rgba(255, 255, 255, 0.8)',
            '18px Arial',
            'center'
        );
    }
    
    /**
     * 绘制庆祝特效
     * @param {Renderer} renderer - 渲染器
     */
    drawSparkles(renderer) {
        this.sparkles.forEach(sparkle => {
            renderer.setGlobalAlpha(sparkle.life);
            renderer.drawCircle(sparkle.x, sparkle.y, sparkle.size, sparkle.color);
            renderer.resetGlobalAlpha();
        });
    }
    
    /**
     * 处理输入
     * @param {InputHandler} inputHandler - 输入处理器
     */
    handleInput(inputHandler) {
        if (inputHandler.isKeyJustPressed('Space')) {
            // 重新开始游戏
            if (this.gameEngine && this.gameEngine.sceneManager) {
                // 重置游戏场景并开始新游戏
                const gameScene = this.gameEngine.sceneManager.scenes.get('game');
                if (gameScene && gameScene.resetGame) {
                    gameScene.resetGame();
                }
                this.gameEngine.sceneManager.switchScene('game');
            } else {
                console.log('准备重新开始游戏...');
            }
        }
        
        if (inputHandler.isKeyJustPressed('Escape')) {
            // 返回主菜单
            if (this.gameEngine && this.gameEngine.sceneManager) {
                this.gameEngine.sceneManager.switchScene('menu');
            } else {
                console.log('返回主菜单...');
            }
        }
    }
}