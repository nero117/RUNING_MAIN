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
        
        // 射击统计
        this.shootingStats = {
            shotsFired: 0,
            shotsHit: 0,
            maxCombo: 0
        };
        
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
        
        // 创建子弹管理器
        this.bulletManager = new BulletManager();
        
        // 创建得分系统
        this.scoreSystem = new ScoreSystem();
        
        // 创建碰撞系统
        this.collisionSystem = new CollisionSystem();
        
        // 创建效果系统
        this.effectSystem = new EffectSystem();
        
        // 创建无敌状态系统
        this.invincibilitySystem = new InvincibilitySystem();
        
        // 注册碰撞回调
        this.collisionSystem.registerCollisionCallback('player-obstacle', (collision) => {
            this.handlePlayerObstacleCollision(collision);
        });
        
        // 注册子弹碰撞回调
        this.collisionSystem.registerCollisionCallback('bullet-obstacle', (collision) => {
            this.handleBulletObstacleCollision(collision);
        });
        
        // 注册玩家射击回调
        this.player.onShoot((shootInfo) => {
            this.handlePlayerShoot(shootInfo);
        });
        
        // 验证射击系统集成
        this.verifyShootingSystemIntegration();
        
        // 验证美女角色系统集成
        this.verifyBeautifulCharacterIntegration();
        
        // 暴露测试函数到全局作用域（仅在调试模式下）
        if (GameConfig.DEBUG) {
            window.testShooting = () => this.testShootingSystemIntegration();
            window.testBeautifulCharacter = () => this.testBeautifulCharacterIntegration();
        }
        
        console.log('射击功能和美女角色系统已集成到游戏循环');
    }
    
    /**
     * 验证美女角色系统集成
     */
    verifyBeautifulCharacterIntegration() {
        const integrationChecks = {
            player: !!this.player,
            characterAssets: !!(this.player && this.player.characterAssets),
            characterEffects: !!(this.player && this.player.characterEffects),
            characterAssetsType: this.player && this.player.characterAssets && this.player.characterAssets.constructor.name === 'CharacterAssets',
            characterEffectsType: this.player && this.player.characterEffects && this.player.characterEffects.constructor.name === 'CharacterEffects',
            animationSystem: !!(this.player && this.player.characterAssets && this.player.characterAssets.animations),
            invincibilitySystem: !!(this.player && this.player.characterEffects && this.player.characterEffects.invincibilityEffect),
            renderingIntegration: !!(this.player && typeof this.player.render === 'function'),
            invincibilityMethods: !!(this.player && typeof this.player.setInvincible === 'function' && typeof this.player.isInvincible === 'function')
        };
        
        const allSystemsReady = Object.values(integrationChecks).every(check => check === true);
        
        if (allSystemsReady) {
            console.log('✅ 美女角色系统集成验证通过 - 所有系统已正确连接');
            console.log('🎭 美女角色特性:');
            console.log('  - 华丽的美女角色动画 (奔跑、跳跃、射击)');
            console.log('  - 精美的视觉效果和粒子系统');
            console.log('  - 无敌状态的发光和闪烁效果');
            console.log('  - 完整的角色资源管理系统');
        } else {
            console.warn('⚠️ 美女角色系统集成验证失败:', integrationChecks);
        }
        
        return allSystemsReady;
    }
    
    /**
     * 验证射击系统集成
     */
    verifyShootingSystemIntegration() {
        const integrationChecks = {
            player: !!this.player,
            bulletManager: !!this.bulletManager,
            collisionSystem: !!this.collisionSystem,
            effectSystem: !!this.effectSystem,
            playerShootCallback: this.player && this.player.shootCallbacks && this.player.shootCallbacks.length > 0,
            bulletCollisionCallback: this.collisionSystem && this.collisionSystem.collisionCallbacks.has('bullet-obstacle'),
            playerCollisionCallback: this.collisionSystem && this.collisionSystem.collisionCallbacks.has('player-obstacle')
        };
        
        const allSystemsReady = Object.values(integrationChecks).every(check => check === true);
        
        if (allSystemsReady) {
            console.log('✅ 射击系统集成验证通过 - 所有系统已正确连接');
        } else {
            console.warn('⚠️ 射击系统集成验证失败:', integrationChecks);
        }
        
        return allSystemsReady;
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
        
        // 重置射击统计
        this.shootingStats = {
            shotsFired: 0,
            shotsHit: 0,
            maxCombo: 0
        };
        
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
        
        // 清除所有子弹
        if (this.bulletManager) {
            this.bulletManager.clearAllBullets();
        }
        
        // 清除所有效果
        if (this.effectSystem) {
            this.effectSystem.clearAllEffects();
        }
        
        // 重置得分
        if (this.scoreSystem) {
            this.scoreSystem.reset();
        }
        
        // 重置无敌状态
        if (this.invincibilitySystem) {
            this.invincibilitySystem.reset();
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
        
        // 更新子弹管理器
        if (this.bulletManager) {
            this.bulletManager.update(deltaTime);
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
        
        // 更新效果系统
        if (this.effectSystem) {
            this.effectSystem.update(deltaTime);
        }
        
        // 更新无敌状态系统
        if (this.invincibilitySystem) {
            this.invincibilitySystem.update(deltaTime);
        }
        
        // 记录射击统计到性能监控器
        if (window.shootingPerformanceMonitor) {
            window.shootingPerformanceMonitor.recordShootingMetrics(this.shootingStats);
        }
        
        // 检查碰撞和游戏结束条件
        this.checkGameEndConditions();
        
        // 检查子弹与障碍物碰撞
        this.checkBulletCollisions();
        
        // 检查跳过的障碍物（新得分系统）
        this.checkJumpedObstacles();
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
        // 检查是否处于无敌状态 - 优先使用玩家内置的美女角色无敌系统
        if (this.player && this.player.isInvincible()) {
            console.log('🛡️ 美女角色处于华丽无敌状态，忽略碰撞');
            return;
        }
        
        // 备用检查：使用独立的无敌系统
        if (this.invincibilitySystem && this.invincibilitySystem.isPlayerInvincible()) {
            console.log('🛡️ 玩家处于无敌状态，忽略碰撞');
            return;
        }
        
        console.log('检测到碰撞:', collision);
        
        // 添加碰撞效果
        if (this.effectSystem && this.player) {
            const playerBounds = this.player.getBounds();
            const centerX = playerBounds.x + playerBounds.width / 2;
            const centerY = playerBounds.y + playerBounds.height / 2;
            
            // 创建摧毁效果（玩家碰撞）
            this.effectSystem.addDestruction(centerX, centerY, {
                particleCount: 10,
                colors: ['#ff0000', '#ff4444', '#ff8888']
            });
        }
        
        this.gameOver('collision');
    }
    
    /**
     * 处理子弹与障碍物碰撞
     * @param {Object} collision - 碰撞信息
     */
    handleBulletObstacleCollision(collision) {
        const { bullet, obstacle, damage } = collision;
        
        console.log('🎯 子弹击中障碍物:', {
            bulletPos: `(${Math.round(bullet.x)}, ${Math.round(bullet.y)})`,
            obstaclePos: `(${Math.round(obstacle.x)}, ${Math.round(obstacle.y)})`,
            obstacleType: obstacle.type,
            damage: damage
        });
        
        // 统计命中次数
        this.shootingStats.shotsHit++;
        
        // 移除子弹
        if (this.bulletManager) {
            this.bulletManager.removeBullet(bullet);
            console.log('子弹已移除，剩余子弹数量:', this.bulletManager.getBullets().length);
        }
        
        // 对障碍物造成伤害
        const isDestroyed = obstacle.takeDamage();
        
        if (isDestroyed) {
            console.log('💥 漂浮障碍物被摧毁');
            
            // 检查是否为特殊障碍物
            const isSpecial = obstacle.isSpecialObstacle && obstacle.isSpecialObstacle();
            
            // 障碍物被摧毁，从障碍物管理器中移除
            if (this.obstacleManager) {
                this.obstacleManager.removeObstacle(obstacle);
            }
            
            // 处理特殊障碍物效果 - 使用美女角色内置的无敌系统
            if (isSpecial) {
                if (this.player) {
                    // 使用玩家内置的美女角色无敌系统
                    this.player.setInvincible(10); // 10秒无敌
                    console.log('🛡️ 击中彩色漂浮物，美女角色激活华丽无敌状态！');
                } else if (this.invincibilitySystem) {
                    // 备用：使用独立的无敌系统
                    this.invincibilitySystem.activate(10000); // 10秒无敌
                    console.log('🛡️ 击中彩色漂浮物，激活无敌状态！');
                }
            }
            
            // 使用新的射击得分系统 - 漂浮障碍物统一30分
            let scoreBonus = 0;
            if (this.scoreSystem) {
                scoreBonus = this.scoreSystem.addShootingScore('floating'); // 统一30分
                
                // 特殊障碍物额外奖励
                if (isSpecial) {
                    const bonusScore = this.scoreSystem.addScore(50); // 额外50分奖励
                    scoreBonus += 50;
                    console.log('🌟 特殊障碍物额外奖励: 50分');
                }
                
                // 更新最高连击记录
                const currentCombo = this.scoreSystem.getComboCount();
                if (currentCombo > this.shootingStats.maxCombo) {
                    this.shootingStats.maxCombo = currentCombo;
                }
                
                console.log(`🏆 射击漂浮障碍物得分: ${scoreBonus}分 (连击: ${currentCombo})`);
            }
            
            // 添加爆炸效果（新需求：漂浮障碍物爆炸消失）
            if (this.effectSystem) {
                const obstacleBounds = obstacle.getBounds();
                const centerX = obstacleBounds.x + obstacleBounds.width / 2;
                const centerY = obstacleBounds.y + obstacleBounds.height / 2;
                
                // 特殊障碍物的特殊效果
                if (isSpecial) {
                    // 创建特殊的无敌激活效果
                    this.effectSystem.addExplosion(centerX, centerY, {
                        particleCount: 20,
                        particleSpeed: 300,
                        colors: ['#ffff00', '#ff8000', '#ff0080', '#8000ff', '#00ff80'],
                        size: 25,
                        duration: 1.2
                    });
                    
                    // 创建无敌状态提示
                    this.effectSystem.addScorePopup(centerX, centerY - 40, '无敌状态激活!');
                    
                    console.log('✨ 特殊无敌激活效果已创建');
                } else {
                    // 普通爆炸效果
                    this.effectSystem.addExplosion(centerX, centerY, {
                        particleCount: 12,
                        particleSpeed: 200,
                        colors: ['#ff6b35', '#f7931e', '#ffcc02', '#fff200', '#ff0080'],
                        size: 20,
                        duration: 0.8
                    });
                }
                
                console.log('💥 漂浮障碍物爆炸效果已创建');
                
                // 创建得分弹出效果
                this.effectSystem.addScorePopup(centerX, centerY - 30, scoreBonus);
                console.log('📈 得分弹出效果已创建');
                
                // 添加额外的粒子爆发效果
                this.effectSystem.addParticleBurst(centerX, centerY, {
                    particleCount: isSpecial ? 15 : 8,
                    colors: isSpecial ? ['#ffff00', '#ff8000', '#ff0080', '#8000ff'] : ['#ffff00', '#ff8000', '#ff4000']
                });
            }
        } else {
            console.log('障碍物受到伤害但未被摧毁');
        }
    }
    
    /**
     * 处理玩家射击
     * @param {Object} shootInfo - 射击信息
     */
    handlePlayerShoot(shootInfo) {
        if (this.bulletManager) {
            const bullet = this.bulletManager.addBullet(
                shootInfo.x,
                shootInfo.y,
                shootInfo.direction
            );
            
            if (bullet) {
                // 统计射击次数
                this.shootingStats.shotsFired++;
                console.log('🔫 玩家射击 - 子弹已创建:', {
                    position: `(${shootInfo.x}, ${shootInfo.y})`,
                    direction: shootInfo.direction,
                    bulletId: bullet.id || 'unknown',
                    totalShots: this.shootingStats.shotsFired
                });
                
                // 验证子弹是否正确添加到管理器
                const activeBullets = this.bulletManager.getBullets();
                console.log(`当前活跃子弹数量: ${activeBullets.length}`);
            } else {
                console.warn('⚠️ 无法创建子弹，可能达到最大数量限制');
            }
        } else {
            console.error('❌ BulletManager 未初始化，无法创建子弹');
        }
    }
    
    /**
     * 检查子弹与障碍物碰撞
     */
    checkBulletCollisions() {
        if (!this.bulletManager || !this.obstacleManager || !this.collisionSystem) {
            if (GameConfig.DEBUG) {
                console.warn('碰撞检查跳过 - 缺少必要的管理器');
            }
            return;
        }
        
        const bullets = this.bulletManager.getBullets();
        const floatingObstacles = this.obstacleManager.getFloatingObstacles();
        
        // 调试信息
        if (GameConfig.DEBUG && (bullets.length > 0 || floatingObstacles.length > 0)) {
            console.log(`🔍 碰撞检查: ${bullets.length} 子弹 vs ${floatingObstacles.length} 漂浮障碍物`);
        }
        
        // 使用碰撞系统检查子弹与漂浮障碍物的碰撞
        const collisions = this.collisionSystem.checkBulletObstacleCollisions(bullets, floatingObstacles);
        
        if (GameConfig.DEBUG && collisions.length > 0) {
            console.log(`💥 检测到 ${collisions.length} 个碰撞`);
        }
    }
    
    /**
     * 检查跳过的障碍物（新得分系统）
     */
    checkJumpedObstacles() {
        if (!this.player || !this.obstacleManager || !this.scoreSystem) {
            return;
        }
        
        const playerBounds = this.player.getBounds();
        const obstacles = this.obstacleManager.getObstacles();
        
        // 检查地面障碍物
        obstacles.forEach(obstacle => {
            if (obstacle.active && !obstacle.scored) {
                // 检查玩家是否已经跳过这个障碍物
                if (playerBounds.x > obstacle.x + obstacle.width) {
                    // 玩家已经跳过这个障碍物
                    obstacle.scored = true; // 标记为已得分，避免重复计分
                    
                    // 根据障碍物类型给予得分
                    const score = this.scoreSystem.addJumpScore(obstacle.type);
                    
                    // 创建得分弹出效果
                    if (this.effectSystem) {
                        const centerX = obstacle.x + obstacle.width / 2;
                        const centerY = obstacle.y - 20;
                        this.effectSystem.addScorePopup(centerX, centerY, score);
                    }
                    
                    console.log(`🏃 跳过障碍物得分: 类型=${obstacle.type}, 得分=${score}`);
                }
            }
        });
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
            isNewRecord: this.scoreSystem?.isNewHighScore() || false,
            ...this.shootingStats
        };
        
        console.log('游戏统计:', stats);
        
        // 通知游戏引擎切换到游戏结束场景
        if (this.onGameOverCallback && typeof this.onGameOverCallback === 'function') {
            this.onGameOverCallback(stats.score, stats);
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
        
        // 渲染效果系统调试信息（如果启用调试模式）
        if (this.effectSystem && GameConfig.DEBUG) {
            this.effectSystem.renderDebugInfo(renderer);
        }
        
        // 渲染射击性能监控信息（如果启用调试模式）
        if (window.shootingPerformanceMonitor && GameConfig.DEBUG) {
            window.shootingPerformanceMonitor.render(renderer);
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
        
        // 渲染子弹（在玩家和障碍物之间）
        if (this.bulletManager) {
            this.bulletManager.render(renderer);
        }
        
        // 渲染美女角色玩家（后渲染，在前面）
        if (this.player) {
            // 美女角色已经内置了完整的渲染系统，包括：
            // - 美女角色动画渲染 (CharacterAssets)
            // - 华丽无敌状态特效 (CharacterEffects)
            // - 动画状态切换和视觉效果
            this.player.render(renderer);
            
            // 备用：渲染独立无敌系统效果（如果需要）
            if (this.invincibilitySystem && this.invincibilitySystem.isPlayerInvincible() && !this.player.isInvincible()) {
                this.invincibilitySystem.renderPlayerEffect(renderer, this.player);
                this.invincibilitySystem.renderActivationEffect(renderer, this.player);
            }
        }
        
        // 渲染效果（最后渲染，在所有实体前面）
        if (this.effectSystem) {
            this.effectSystem.render(renderer);
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
                '空格键跳跃 | Q键射击漂浮障碍物 | ESC暂停',
                20,
                20,
                '#ffffff',
                '#000000',
                '14px Arial'
            );
            
            // 渲染美女角色无敌状态UI - 优先使用玩家内置系统
            if (this.player && this.player.isInvincible()) {
                // 美女角色的华丽无敌状态UI已经在player.render()中渲染
                // 这里可以添加额外的UI元素
                const timeLeft = Math.ceil(this.player.getInvincibleTimeLeft());
                if (timeLeft > 0) {
                    renderer.drawTextWithStroke(
                        `✨ 美女角色无敌状态: ${timeLeft}秒 ✨`,
                        GameConfig.CANVAS_WIDTH / 2,
                        80,
                        timeLeft <= 3 ? '#ff69b4' : '#ffd700',
                        '#000000',
                        'bold 16px Arial',
                        'center'
                    );
                }
            } else if (this.invincibilitySystem && this.invincibilitySystem.isPlayerInvincible()) {
                // 备用：使用独立无敌系统UI
                this.invincibilitySystem.renderUI(renderer);
            }
            
            // 渲染得分系统提示
            if (this.scoreSystem && this.scoreSystem.getComboCount() > 1) {
                const comboCount = this.scoreSystem.getComboCount();
                const comboMultiplier = this.scoreSystem.getComboMultiplier(comboCount);
                renderer.drawTextWithStroke(
                    `射击连击: ${comboCount}x (${comboMultiplier.toFixed(1)}倍得分)`,
                    20,
                    40,
                    this.scoreSystem.getComboColor(comboCount),
                    '#000000',
                    '14px Arial'
                );
            } else {
                renderer.drawTextWithStroke(
                    '跳过障碍物: 小10分 中20分 大30分 | 射击漂浮障碍物: 30分 | 彩色漂浮物: 美女角色无敌10秒',
                    20,
                    40,
                    '#ffff88',
                    '#000000',
                    '12px Arial'
                );
                
                // 显示美女角色状态信息
                if (this.player && this.player.characterAssets) {
                    const animInfo = this.player.getAnimationInfo();
                    renderer.drawTextWithStroke(
                        `美女角色: ${animInfo.state} 动画 (帧 ${animInfo.frame + 1}/${animInfo.totalFrames})`,
                        20,
                        60,
                        '#ff69b4',
                        '#000000',
                        '12px Arial'
                    );
                }
            }
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
            // 更新输入处理器的射击冷却时间
            inputHandler.update(16.67); // 假设60FPS，约16.67ms每帧
            
            // 玩家跳跃
            if (inputHandler.isKeyPressed('Space') && this.player) {
                this.player.jump();
            }
            
            // 玩家射击 - 使用Q键射击
            if (inputHandler.isKeyJustPressed('KeyQ') && this.player && this.player.canShootNow()) {
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
     * 获取子弹管理器
     * @returns {BulletManager} 子弹管理器
     */
    getBulletManager() {
        return this.bulletManager;
    }
    
    /**
     * 获取实体数量统计
     * @returns {Object} 实体数量信息
     */
    getEntityCounts() {
        const obstacles = this.obstacleManager ? this.obstacleManager.getObstacles() : [];
        const activeObstacles = obstacles.filter(obstacle => obstacle.active);
        const bullets = this.bulletManager ? this.bulletManager.getBullets() : [];
        const activeBullets = bullets.filter(bullet => bullet.active);
        
        const activeEffects = this.effectSystem ? this.effectSystem.getActiveEffectCount() : 0;
        
        return {
            active: activeObstacles.length + activeBullets.length + activeEffects + (this.player ? 1 : 0),
            total: obstacles.length + bullets.length + activeEffects + (this.player ? 1 : 0),
            rendered: activeObstacles.length + activeBullets.length + activeEffects + (this.player ? 1 : 0),
            bullets: activeBullets.length,
            obstacles: activeObstacles.length,
            effects: activeEffects
        };
    }
    
    /**
     * 测试美女角色完整功能（调试用）
     */
    testBeautifulCharacterIntegration() {
        console.log('🎭 开始美女角色完整功能测试...');
        
        if (!this.player) {
            console.error('❌ 玩家实例不存在');
            return false;
        }
        
        // 测试1: 验证美女角色系统存在
        const characterSystems = {
            characterAssets: this.player.characterAssets,
            characterEffects: this.player.characterEffects
        };
        
        for (const [name, system] of Object.entries(characterSystems)) {
            if (!system) {
                console.error(`❌ ${name} 系统未初始化`);
                return false;
            }
        }
        console.log('✅ 美女角色系统已初始化');
        
        // 测试2: 验证动画状态切换
        const animationStates = ['running', 'jumping', 'shooting'];
        for (const state of animationStates) {
            this.player.animationState = state;
            this.player.characterAssets.updateAnimation(state, 0.1);
            const currentFrame = this.player.characterAssets.getCurrentFrame();
            if (currentFrame < 0) {
                console.error(`❌ ${state} 动画状态异常`);
                return false;
            }
        }
        console.log('✅ 美女角色动画状态切换正常');
        
        // 测试3: 测试无敌状态效果
        const wasInvincible = this.player.isInvincible();
        this.player.setInvincible(2); // 2秒测试
        
        if (!this.player.isInvincible()) {
            console.error('❌ 美女角色无敌状态激活失败');
            return false;
        }
        
        if (!this.player.characterEffects.hasInvincibilityEffect()) {
            console.error('❌ 美女角色华丽视觉效果未激活');
            return false;
        }
        
        console.log('✅ 美女角色华丽无敌状态激活成功');
        
        // 测试4: 测试渲染集成
        try {
            // 模拟渲染测试
            const mockRenderer = {
                save: () => {},
                restore: () => {},
                ctx: {
                    shadowColor: '',
                    shadowBlur: 0,
                    globalCompositeOperation: 'source-over'
                }
            };
            
            this.player.characterAssets.renderCharacter(mockRenderer, 100, 100, 'running', 1.0);
            this.player.characterEffects.render(mockRenderer);
            console.log('✅ 美女角色渲染系统集成正常');
        } catch (error) {
            console.error('❌ 美女角色渲染系统异常:', error);
            return false;
        }
        
        // 恢复原始状态
        if (!wasInvincible) {
            this.player.isInvincible = false;
            this.player.invincibleTimeLeft = 0;
            this.player.characterEffects.deactivateInvincibilityEffect();
        }
        
        console.log('🎉 美女角色完整功能测试通过！');
        return true;
    }
    
    /**
     * 测试射击系统集成（调试用）
     */
    testShootingSystemIntegration() {
        console.log('🧪 开始射击系统集成测试...');
        
        // 测试1: 验证所有系统存在
        const systems = {
            player: this.player,
            bulletManager: this.bulletManager,
            obstacleManager: this.obstacleManager,
            collisionSystem: this.collisionSystem,
            effectSystem: this.effectSystem
        };
        
        for (const [name, system] of Object.entries(systems)) {
            if (!system) {
                console.error(`❌ ${name} 系统未初始化`);
                return false;
            }
        }
        console.log('✅ 所有系统已初始化');
        
        // 测试2: 模拟射击
        if (this.player.canShootNow()) {
            const shootInfo = this.player.getShootPosition();
            console.log('🎯 模拟射击:', shootInfo);
            
            const initialBulletCount = this.bulletManager.getBullets().length;
            this.handlePlayerShoot(shootInfo);
            const finalBulletCount = this.bulletManager.getBullets().length;
            
            if (finalBulletCount > initialBulletCount) {
                console.log('✅ 子弹创建成功');
            } else {
                console.error('❌ 子弹创建失败');
                return false;
            }
        } else {
            console.log('⏳ 玩家当前无法射击（冷却中）');
        }
        
        // 测试3: 验证碰撞回调
        const hasPlayerCallback = this.collisionSystem.collisionCallbacks.has('player-obstacle');
        const hasBulletCallback = this.collisionSystem.collisionCallbacks.has('bullet-obstacle');
        
        if (hasPlayerCallback && hasBulletCallback) {
            console.log('✅ 碰撞回调已注册');
        } else {
            console.error('❌ 碰撞回调缺失:', { hasPlayerCallback, hasBulletCallback });
            return false;
        }
        
        console.log('🎉 射击系统集成测试通过！');
        return true;
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
        
        // 清理子弹管理器的临时数据
        if (this.bulletManager) {
            // 强制清理过多的子弹
            const maxBullets = 20;
            if (this.bulletManager.bullets.length > maxBullets) {
                this.bulletManager.forceCleanup();
            }
        }
        
        // 清理效果系统的临时数据
        if (this.effectSystem) {
            // 如果效果过多，清理一些旧效果
            const maxEffects = 30;
            if (this.effectSystem.getActiveEffectCount() > maxEffects) {
                this.effectSystem.removeFinishedEffects();
            }
        }
    }
}