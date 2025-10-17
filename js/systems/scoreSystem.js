/**
 * 得分系统 - 处理得分计算、显示和记录
 */
class ScoreSystem {
    constructor() {
        this.currentScore = 0;
        this.highScore = this.loadHighScore();
        this.scoreMultiplier = 1;
        this.timeBonus = 0;
        
        // 射击得分相关
        this.comboCount = 0;
        this.lastShootTime = 0;
        this.comboTimeWindow = 3000; // 连击时间窗口（毫秒）
        
        // 得分配置
        this.config = {
            TIME_SCORE_RATE: 10,        // 每秒基础得分
            OBSTACLE_BONUS: 50,         // 躲避障碍物奖励分数
            DISTANCE_MULTIPLIER: 0.1,   // 距离得分倍数
            HIGH_SCORE_KEY: 'runnerGameHighScore',  // 本地存储键名
            
            // 射击得分配置
            SHOOT_SCORES: {
                'floating': 50,         // 普通漂浮障碍物
                'floating_large': 100,  // 大型漂浮障碍物
                'basic': 25,            // 基础地面障碍物（如果可射击）
                'tall': 75,             // 高障碍物
                'wide': 60              // 宽障碍物
            },
            
            // 连击奖励配置
            COMBO_MULTIPLIERS: {
                2: 1.2,   // 2连击：1.2倍
                3: 1.5,   // 3连击：1.5倍
                5: 2.0,   // 5连击：2.0倍
                10: 3.0,  // 10连击：3.0倍
                15: 4.0,  // 15连击：4.0倍
                20: 5.0   // 20连击及以上：5.0倍
            }
        };
    }
    
    /**
     * 重置得分系统
     */
    reset() {
        this.currentScore = 0;
        this.scoreMultiplier = 1;
        this.timeBonus = 0;
        this.comboCount = 0;
        this.lastShootTime = 0;
    }
    
    /**
     * 添加得分
     * @param {number} points - 要添加的分数
     */
    addScore(points) {
        if (points > 0) {
            this.currentScore += Math.floor(points * this.scoreMultiplier);
        }
    }
    
    /**
     * 基于时间添加得分
     * @param {number} deltaTime - 时间增量（秒）
     */
    addTimeScore(deltaTime) {
        const timePoints = deltaTime * this.config.TIME_SCORE_RATE;
        this.addScore(timePoints);
    }
    
    /**
     * 添加障碍物奖励得分
     */
    addObstacleBonus() {
        this.addScore(this.config.OBSTACLE_BONUS);
    }
    
    /**
     * 添加射击得分奖励
     * @param {string} obstacleType - 障碍物类型
     * @param {Object} options - 额外选项
     * @returns {number} 实际获得的得分
     */
    addShootingScore(obstacleType, options = {}) {
        const currentTime = performance.now();
        
        // 检查连击
        if (currentTime - this.lastShootTime <= this.comboTimeWindow) {
            this.comboCount++;
        } else {
            this.comboCount = 1; // 重置连击
        }
        
        this.lastShootTime = currentTime;
        
        // 获取基础得分
        const baseScore = this.config.SHOOT_SCORES[obstacleType] || this.config.SHOOT_SCORES['floating'];
        
        // 计算连击倍数
        const comboMultiplier = this.getComboMultiplier(this.comboCount);
        
        // 计算最终得分
        const finalScore = Math.floor(baseScore * comboMultiplier);
        
        // 添加得分
        this.addScore(finalScore);
        
        if (GameConfig.DEBUG) {
            console.log(`射击得分: 类型=${obstacleType}, 基础=${baseScore}, 连击=${this.comboCount}, 倍数=${comboMultiplier.toFixed(1)}, 最终=${finalScore}`);
        }
        
        return finalScore;
    }
    
    /**
     * 获取连击倍数
     * @param {number} comboCount - 连击数
     * @returns {number} 连击倍数
     */
    getComboMultiplier(comboCount) {
        // 找到适用的连击倍数
        const comboKeys = Object.keys(this.config.COMBO_MULTIPLIERS)
            .map(k => parseInt(k))
            .sort((a, b) => b - a); // 从大到小排序
        
        for (const threshold of comboKeys) {
            if (comboCount >= threshold) {
                return this.config.COMBO_MULTIPLIERS[threshold];
            }
        }
        
        return 1.0; // 无连击倍数
    }
    
    /**
     * 获取当前连击数
     * @returns {number} 连击数
     */
    getComboCount() {
        return this.comboCount;
    }
    
    /**
     * 重置连击
     */
    resetCombo() {
        this.comboCount = 0;
        this.lastShootTime = 0;
    }
    
    /**
     * 检查连击是否过期
     * @param {number} currentTime - 当前时间
     */
    checkComboExpiry(currentTime = performance.now()) {
        if (currentTime - this.lastShootTime > this.comboTimeWindow) {
            this.comboCount = 0;
        }
    }
    
    /**
     * 基于距离添加得分
     * @param {number} distance - 移动距离（像素）
     */
    addDistanceScore(distance) {
        const distancePoints = distance * this.config.DISTANCE_MULTIPLIER;
        this.addScore(distancePoints);
    }
    
    /**
     * 设置得分倍数
     * @param {number} multiplier - 得分倍数
     */
    setScoreMultiplier(multiplier) {
        this.scoreMultiplier = Math.max(1, multiplier);
    }
    
    /**
     * 获取当前得分
     * @returns {number} 当前得分
     */
    getScore() {
        return this.currentScore;
    }
    
    /**
     * 获取最高分
     * @returns {number} 最高分
     */
    getHighScore() {
        return this.highScore;
    }
    
    /**
     * 检查是否创造新纪录
     * @returns {boolean} 是否是新纪录
     */
    isNewHighScore() {
        return this.currentScore > this.highScore;
    }
    
    /**
     * 保存最高分到本地存储
     */
    saveHighScore() {
        if (this.isNewHighScore()) {
            this.highScore = this.currentScore;
            try {
                localStorage.setItem(this.config.HIGH_SCORE_KEY, this.highScore.toString());
                console.log('新纪录已保存:', this.highScore);
            } catch (error) {
                console.warn('无法保存最高分到本地存储:', error);
            }
        }
    }
    
    /**
     * 从本地存储加载最高分
     * @returns {number} 最高分
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem(this.config.HIGH_SCORE_KEY);
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.warn('无法从本地存储加载最高分:', error);
            return 0;
        }
    }
    
    /**
     * 清除最高分记录
     */
    clearHighScore() {
        this.highScore = 0;
        try {
            localStorage.removeItem(this.config.HIGH_SCORE_KEY);
            console.log('最高分记录已清除');
        } catch (error) {
            console.warn('无法清除最高分记录:', error);
        }
    }
    
    /**
     * 获取格式化的得分字符串
     * @param {number} score - 得分（可选，默认使用当前得分）
     * @returns {string} 格式化的得分字符串
     */
    getFormattedScore(score = null) {
        const targetScore = score !== null ? score : this.currentScore;
        return targetScore.toLocaleString();
    }
    
    /**
     * 获取得分等级
     * @returns {string} 得分等级
     */
    getScoreGrade() {
        const score = this.currentScore;
        
        if (score >= 10000) return 'S';
        if (score >= 5000) return 'A';
        if (score >= 2000) return 'B';
        if (score >= 1000) return 'C';
        if (score >= 500) return 'D';
        return 'E';
    }
    
    /**
     * 更新得分系统（每帧调用）
     * @param {number} deltaTime - 时间增量
     * @param {Object} gameData - 游戏数据对象
     */
    update(deltaTime, gameData = {}) {
        // 基于时间的得分
        this.addTimeScore(deltaTime);
        
        // 如果提供了距离数据，添加距离得分
        if (gameData.distanceTraveled) {
            this.addDistanceScore(gameData.distanceTraveled);
        }
        
        // 根据游戏进行时间调整得分倍数
        if (gameData.gameTime) {
            // 每30秒增加0.1倍数，最大3倍
            const timeMultiplier = Math.min(3, 1 + Math.floor(gameData.gameTime / 30) * 0.1);
            this.setScoreMultiplier(timeMultiplier);
        }
        
        // 检查连击是否过期
        this.checkComboExpiry();
    }
    
    /**
     * 渲染得分信息
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    render(renderer, x = GameConfig.CANVAS_WIDTH - 20, y = 20) {
        let currentY = y;
        
        // 当前得分
        renderer.drawTextWithStroke(
            `得分: ${this.getFormattedScore()}`,
            x,
            currentY,
            '#ffffff',
            '#000000',
            '24px Arial',
            'right'
        );
        currentY += 30;
        
        // 最高分
        renderer.drawTextWithStroke(
            `最高分: ${this.getFormattedScore(this.highScore)}`,
            x,
            currentY,
            '#ffff00',
            '#000000',
            '16px Arial',
            'right'
        );
        currentY += 25;
        
        // 得分等级
        const grade = this.getScoreGrade();
        renderer.drawTextWithStroke(
            `等级: ${grade}`,
            x,
            currentY,
            '#00ff00',
            '#000000',
            '16px Arial',
            'right'
        );
        currentY += 25;
        
        // 连击数（如果有连击）
        if (this.comboCount > 1) {
            const comboMultiplier = this.getComboMultiplier(this.comboCount);
            const comboColor = this.getComboColor(this.comboCount);
            
            renderer.drawTextWithStroke(
                `连击: ${this.comboCount}x (${comboMultiplier.toFixed(1)}倍)`,
                x,
                currentY,
                comboColor,
                '#000000',
                '16px Arial',
                'right'
            );
            currentY += 25;
        }
        
        // 得分倍数（如果大于1）
        if (this.scoreMultiplier > 1) {
            renderer.drawTextWithStroke(
                `倍数: x${this.scoreMultiplier.toFixed(1)}`,
                x,
                currentY,
                '#ff8800',
                '#000000',
                '14px Arial',
                'right'
            );
        }
    }
    
    /**
     * 获取连击颜色
     * @param {number} comboCount - 连击数
     * @returns {string} 颜色值
     */
    getComboColor(comboCount) {
        if (comboCount >= 20) return '#ff0080'; // 紫红色
        if (comboCount >= 15) return '#ff4000'; // 橙红色
        if (comboCount >= 10) return '#ff8000'; // 橙色
        if (comboCount >= 5) return '#ffff00';  // 黄色
        if (comboCount >= 3) return '#80ff00';  // 黄绿色
        return '#00ff80'; // 绿色
    }
    
    /**
     * 获取得分统计信息
     * @returns {Object} 得分统计
     */
    getScoreStats() {
        return {
            currentScore: this.currentScore,
            highScore: this.highScore,
            isNewRecord: this.isNewHighScore(),
            grade: this.getScoreGrade(),
            multiplier: this.scoreMultiplier,
            formattedScore: this.getFormattedScore(),
            formattedHighScore: this.getFormattedScore(this.highScore),
            comboCount: this.comboCount,
            comboMultiplier: this.getComboMultiplier(this.comboCount),
            comboColor: this.getComboColor(this.comboCount)
        };
    }
}