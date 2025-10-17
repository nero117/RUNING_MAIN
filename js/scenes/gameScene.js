/**
 * 游戏场景 - 集成实体渲染和动画帧渲染
 */
class GameScene extends Scene {
    constructor() {
        super('game');
        
        // 初始化游戏实体
        this.player = null;
        this.obstacleManager = null;
        this.scoreSystem = null;
        this.collisionSystem = null;
        
        // 游戏状态
        this.gameState = 'playing'; // 'playing', 'paused', 'game_over'
        this.gameTime = 0;
        
        this.initializeEntities();
    }
    
    /**
     * 初始化游戏实体
     */
    initializeEntities() {
        // 创建玩家实体，位置在屏幕中间
        this.player = new Player(GameConfig.PLAYER.CENTER_X - GameConfig.PLAYER.WIDTH / 2, GameConfig.GROUND_Y - GameConfig.PLAYER.HEIGHT);
        
        // 创建障碍物管理器
        this.obstacleManager = new ObstacleManager();
        
        // 创建得分系统
        this.scoreSystem = new ScoreSystem();
        
        // 创建碰撞系统
        this.collisionSystem = new CollisionSystem();
        
        // 注册碰撞回调
        this.collisionSystem.registerCollisionCallback('player-obstacle', (collision) => {
            this.handlePlayerObstacleCollision(collision);
        });
    }
    
    /**
     * 场景进入时调用
     */
    onEnter() {
        super.onEnter();
        console.log('进入游戏场景');
        
        // 重置游戏状态
        this.resetGame();
    }
    
    /**
     * 场景退出时调用
     */
    onExit() {
        super.onExit();
        console.log('退出游戏场景');
    }
    
    /**
     * 重置游戏状态
     */
    resetGame() {
        this.gameState = 'playing';
        this.gameTime = 0;
        
        // 重置玩家位置到屏幕中间
        if (this.player) {
            this.player.x = GameConfig.PLAYER.CENTER_X - GameConfig.PLAYER.WIDTH / 2;
            this.player.y = GameConfig.GROUND_Y - GameConfig.PLAYER.HEIGHT;
            this.player.width = GameConfig.PLAYER.WIDTH;
            this.player.height = GameConfig.PLAYER.HEIGHT;
            this.player.velocityX = 0; // 玩家不再水平移动
            this.player.velocityY = 0;
            this.player.isGrounded = true;
        }
        
        // 清除所有障碍物
        if (this.obstacleManager) {
            this.obstacleManager.clearAllObstacles();
        }
        
        // 重置得分
        if (this.scoreSystem) {
            this.scoreSystem.reset();
        }
    }
    
    /**
     * 更新场景
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        if (this.gameState !== 'playing') {
            return;
        }
        
        // 更新游戏时间
        this.gameTime += deltaTime;
        
        // 更新玩家
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // 更新障碍物管理器
        if (this.obstacleManager) {
            this.obstacleManager.update(deltaTime);
        }
        
        // 更新得分系统 - 基于时间而不是距离
        if (this.scoreSystem) {
            this.scoreSystem.update(deltaTime, {
                gameTime: this.gameTime,
                distanceTraveled: deltaTime * GameConfig.PLAYER_SPEED // 保持相同的得分速度
            });
        }
        
        // 更新碰撞系统
        if (this.collisionSystem) {
            this.collisionSystem.update(deltaTime);
        }
        
        // 检查碰撞和游戏结束条件
        this.checkGameEndConditions();
    }
    
    /**
     * 检查游戏结束条件
     */
    checkGameEndConditions() {
        if (!this.player || !this.obstacleManager || !this.collisionSystem) {
            return;
        }
        
        // 使用碰撞系统检查玩家与障碍物的碰撞
        const obstacles = this.obstacleManager.getObstacles();
        const collision = this.collisionSystem.checkPlayerObstacleCollisions(this.player, obstacles);
        
        if (collision) {
            // 碰撞已经通过回调处理，这里不需要额外处理
            return;
        }
        
        // 检查玩家是否掉出屏幕
        if (this.player.y > GameConfig.CANVAS_HEIGHT + 100) {
            this.gameOver('fall');
            return;
        }
        
        // 检查玩家是否移出屏幕左侧（如果有这种机制）
        if (this.player.x < -this.player.width) {
            this.gameOver('outOfBounds');
            return;
        }
    }
    
    /**
     * 处理玩家与障碍物碰撞
     * @param {Object} collision - 碰撞信息
     */
    handlePlayerObstacleCollision(collision) {
        console.log('检测到碰撞:', collision);
        this.gameOver('collision');
    }
    
    /**
     * 游戏结束
     * @param {string} reason - 游戏结束原因
     */
    gameOver(reason = 'unknown') {
        if (this.gameState === 'game_over') {
            return; // 防止重复触发
        }
        
        this.gameState = 'game_over';
        this.gameOverReason = reason;
        
        // 保存最高分
        if (this.scoreSystem) {
            this.scoreSystem.saveHighScore();
        }
        
        // 停止玩家移动
        if (this.player) {
            this.player.velocityX = 0;
        }
        
        console.log(`游戏结束！原因: ${reason}, 得分: ${this.scoreSystem?.getScore() || 0}`);
        
        // 可以在这里添加游戏结束音效或其他效果
        this.onGameOver(reason);
    }
    
    /**
     * 游戏结束回调
     * @param {string} reason - 游戏结束原因
     */
    onGameOver(reason) {
        // 这里可以添加游戏结束时的特殊效果
        // 比如震屏效果、粒子效果等
        
        // 记录游戏统计
        const stats = {
            score: this.scoreSystem?.getScore() || 0,
            time: this.gameTime,
            reason: reason,
            isNewRecord: this.scoreSystem?.isNewHighScore() || false
        };
        
        console.log('游戏统计:', stats);
        
        // 通知游戏引擎切换到游戏结束场景
        if (this.onGameOver && typeof this.onGameOver === 'function') {
            this.onGameOver(stats.score);
        }
    }
    
    /**
     * 渲染场景 - 集成实体渲染和动画帧渲染
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        // 背景已经在GameEngine中绘制，这里不需要重复绘制
        
        // 渲染游戏实体
        this.renderEntities(renderer);
        
        // 渲染UI元素
        this.renderUI(renderer);
        
        // 渲染游戏状态相关信息
        this.renderGameState(renderer);
        
        // 渲染碰撞系统调试信息（如果启用调试模式）
        if (this.collisionSystem && GameConfig.DEBUG) {
            this.collisionSystem.renderDebugInfo(renderer);
        }
    }
    
    /**
     * 渲染游戏实体
     * @param {Renderer} renderer - 渲染器
     */
    renderEntities(renderer) {
        // 渲染障碍物（先渲染，在玩家后面）
        if (this.obstacleManager) {
            this.obstacleManager.render(renderer);
        }
        
        // 渲染玩家（后渲染，在前面）
        if (this.player) {
            this.player.render(renderer);
        }
    }
    
    /**
     * 渲染UI元素
     * @param {Renderer} renderer - 渲染器
     */
    renderUI(renderer) {
        // 使用得分系统的渲染方法
        if (this.scoreSystem) {
            this.scoreSystem.render(renderer);
        }
        
        // 渲染游戏时间
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        renderer.drawTextWithStroke(
            `时间: ${timeString}`,
            20,
            GameConfig.CANVAS_HEIGHT - 40,
            '#ffffff',
            '#000000',
            '16px Arial'
        );
        
        // 渲染操作提示（仅在游戏进行时）
        if (this.gameState === 'playing') {
            renderer.drawTextWithStroke(
                '空格键跳跃 | ESC暂停',
                20,
                20,
                '#ffffff',
                '#000000',
                '14px Arial'
            );
        }
    }
    
    /**
     * 渲染游戏状态信息
     * @param {Renderer} renderer - 渲染器
     */
    renderGameState(renderer) {
        if (this.gameState === 'paused') {
            // 绘制暂停覆盖层
            renderer.setGlobalAlpha(0.7);
            renderer.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT, '#000000');
            renderer.resetGlobalAlpha();
            
            renderer.drawTextWithStroke(
                '游戏暂停',
                GameConfig.CANVAS_WIDTH / 2,
                GameConfig.CANVAS_HEIGHT / 2 - 40,
                '#ffffff',
                '#000000',
                '32px Arial',
                'center'
            );
            
            renderer.drawTextWithStroke(
                '按空格键或ESC继续',
                GameConfig.CANVAS_WIDTH / 2,
                GameConfig.CANVAS_HEIGHT / 2,
                '#ffffff',
                '#000000',
                '16px Arial',
                'center'
            );
            
            renderer.drawTextWithStroke(
                '按R键重新开始',
                GameConfig.CANVAS_WIDTH / 2,
                GameConfig.CANVAS_HEIGHT / 2 + 25,
                '#cccccc',
                '#000000',
                '14px Arial',
                'center'
            );
        } else if (this.gameState === 'game_over') {
            // 绘制游戏结束覆盖层
            renderer.setGlobalAlpha(0.8);
            renderer.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT, '#000000');
            renderer.resetGlobalAlpha();
            
            // 游戏结束标题
            renderer.drawTextWithStroke(
                '游戏结束',
                GameConfig.CANVAS_WIDTH / 2,
                GameConfig.CANVAS_HEIGHT / 2 - 80,
                '#ff0000',
                '#000000',
                '36px Arial',
                'center'
            );
            
            // 游戏结束原因
            const reasonText = this.getGameOverReasonText();
            renderer.drawTextWithStroke(
                reasonText,
                GameConfig.CANVAS_WIDTH / 2,
                GameConfig.CANVAS_HEIGHT / 2 - 45,
                '#ffaa00',
                '#000000',
                '16px Arial',
                'center'
            );
            
            // 得分信息
            if (this.scoreSystem) {
                const stats = this.scoreSystem.getScoreStats();
                
                renderer.drawTextWithStroke(
                    `最终得分: ${stats.formattedScore}`,
                    GameConfig.CANVAS_WIDTH / 2,
                    GameConfig.CANVAS_HEIGHT / 2 - 10,
                    '#ffffff',
                    '#000000',
                    '24px Arial',
                    'center'
                );
                
                renderer.drawTextWithStroke(
                    `等级: ${stats.grade}`,
                    GameConfig.CANVAS_WIDTH / 2,
                    GameConfig.CANVAS_HEIGHT / 2 + 15,
                    '#00ff00',
                    '#000000',
                    '18px Arial',
                    'center'
                );
                
                // 新纪录提示
                if (stats.isNewRecord) {
                    renderer.drawTextWithStroke(
                        '🎉 新纪录！ 🎉',
                        GameConfig.CANVAS_WIDTH / 2,
                        GameConfig.CANVAS_HEIGHT / 2 + 40,
                        '#ffff00',
                        '#000000',
                        '20px Arial',
                        'center'
                    );
                }
            }
            
            // 操作提示
            renderer.drawTextWithStroke(
                '按R键或空格键重新开始',
                GameConfig.CANVAS_WIDTH / 2,
                GameConfig.CANVAS_HEIGHT / 2 + 70,
                '#ffffff',
                '#000000',
                '16px Arial',
                'center'
            );
            
            renderer.drawTextWithStroke(
                '按ESC返回菜单',
                GameConfig.CANVAS_WIDTH / 2,
                GameConfig.CANVAS_HEIGHT / 2 + 90,
                '#cccccc',
                '#000000',
                '14px Arial',
                'center'
            );
        }
    }
    
    /**
     * 获取游戏结束原因的文本描述
     * @returns {string} 游戏结束原因文本
     */
    getGameOverReasonText() {
        switch (this.gameOverReason) {
            case 'collision':
                return '撞到障碍物了！';
            case 'fall':
                return '掉下去了！';
            case 'outOfBounds':
                return '跑出边界了！';
            default:
                return '游戏结束';
        }
    }
    
    /**
     * 处理输入
     * @param {InputHandler} inputHandler - 输入处理器
     */
    handleInput(inputHandler) {
        if (this.gameState === 'playing') {
            // 玩家跳跃
            if (inputHandler.isKeyPressed('Space') && this.player) {
                this.player.jump();
            }
            
            // 玩家射击
            if (inputHandler.isShootKeyPressed() && this.player && this.player.canShootNow()) {
                this.player.shoot();
            }
            
            // 暂停游戏
            if (inputHandler.isKeyJustPressed('Escape')) {
                this.pauseGame();
            }
        } else if (this.gameState === 'paused') {
            // 恢复游戏
            if (inputHandler.isKeyJustPressed('Space') || inputHandler.isKeyJustPressed('Escape')) {
                this.resumeGame();
            }
            
            // 重新开始游戏（从暂停状态）
            if (inputHandler.isKeyJustPressed('KeyR')) {
                this.restartGame();
            }
        } else if (this.gameState === 'game_over') {
            // 重新开始游戏
            if (inputHandler.isKeyJustPressed('KeyR') || inputHandler.isKeyJustPressed('Space')) {
                this.restartGame();
            }
            
            // 返回菜单（如果需要）
            if (inputHandler.isKeyJustPressed('Escape')) {
                this.returnToMenu();
            }
        }
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            console.log('游戏已暂停');
        }
    }
    
    /**
     * 恢复游戏
     */
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            console.log('游戏已恢复');
        }
    }
    
    /**
     * 重新开始游戏
     */
    restartGame() {
        console.log('重新开始游戏');
        this.resetGame();
    }
    
    /**
     * 返回主菜单
     */
    returnToMenu() {
        console.log('返回主菜单');
        // 这里需要通过场景管理器切换到菜单场景
        // 由于我们在GameScene中，需要通过事件或回调来通知GameEngine
        if (this.onReturnToMenu) {
            this.onReturnToMenu();
        }
    }
    
    /**
     * 获取游戏状态
     * @returns {string} 当前游戏状态
     */
    getGameState() {
        return this.gameState;
    }
    
    /**
     * 获取玩家实体
     * @returns {Player} 玩家实体
     */
    getPlayer() {
        return this.player;
    }
    
    /**
     * 获取障碍物管理器
     * @returns {ObstacleManager} 障碍物管理器
     */
    getObstacleManager() {
        return this.obstacleManager;
    }
    
    /**
     * 获取得分系统
     * @returns {ScoreSystem} 得分系统
     */
    getScoreSystem() {
        return this.scoreSystem;
    }
    
    /**
     * 获取实体数量统计
     * @returns {Object} 实体数量信息
     */
    getEntityCounts() {
        const obstacles = this.obstacleManager ? this.obstacleManager.getObstacles() : [];
        const activeObstacles = obstacles.filter(obstacle => obstacle.active);
        
        return {
            active: activeObstacles.length + (this.player ? 1 : 0),
            total: obstacles.length + (this.player ? 1 : 0),
            rendered: activeObstacles.length + (this.player ? 1 : 0)
        };
    }
    
    /**
     * 清理场景临时数据
     */
    cleanup() {
        // 清理碰撞系统历史
        if (this.collisionSystem) {
            this.collisionSystem.clearHistory();
        }
        
        // 清理得分系统的临时数据
        if (this.scoreSystem && this.scoreSystem.cleanup) {
            this.scoreSystem.cleanup();
        }
        
        // 清理障碍物管理器的临时数据
        if (this.obstacleManager) {
            // 移除过多的非活跃障碍物
            const maxInactiveObstacles = 10;
            const inactiveObstacles = this.obstacleManager.obstacles.filter(o => !o.active);
            if (inactiveObstacles.length > maxInactiveObstacles) {
                this.obstacleManager.obstacles = this.obstacleManager.obstacles.filter(o => o.active);
            }
        }
    }
}