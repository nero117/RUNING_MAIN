/**
 * 得分系统 - 处理得分计算、显示和记录
 */
class ScoreSystem {
    constructor() {
        this.currentScore = 0;
        this.highScore = this.loadHighScore();
        this.scoreMultiplier = 1;
        this.timeBonus = 0;
        
        // 得分配置
        this.config = {
            TIME_SCORE_RATE: 10,        // 每秒基础得分
            OBSTACLE_BONUS: 50,         // 躲避障碍物奖励分数
            DISTANCE_MULTIPLIER: 0.1,   // 距离得分倍数
            HIGH_SCORE_KEY: 'runnerGameHighScore'  // 本地存储键名
        };
    }
    
    /**
     * 重置得分系统
     */
    reset() {
        this.currentScore = 0;
        this.scoreMultiplier = 1;
        this.timeBonus = 0;
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
    }
    
    /**
     * 渲染得分信息
     * @param {Renderer} renderer - 渲染器
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    render(renderer, x = GameConfig.CANVAS_WIDTH - 20, y = 20) {
        // 当前得分
        renderer.drawTextWithStroke(
            `得分: ${this.getFormattedScore()}`,
            x,
            y,
            '#ffffff',
            '#000000',
            '24px Arial',
            'right'
        );
        
        // 最高分
        renderer.drawTextWithStroke(
            `最高分: ${this.getFormattedScore(this.highScore)}`,
            x,
            y + 30,
            '#ffff00',
            '#000000',
            '16px Arial',
            'right'
        );
        
        // 得分等级
        const grade = this.getScoreGrade();
        renderer.drawTextWithStroke(
            `等级: ${grade}`,
            x,
            y + 50,
            '#00ff00',
            '#000000',
            '16px Arial',
            'right'
        );
        
        // 得分倍数（如果大于1）
        if (this.scoreMultiplier > 1) {
            renderer.drawTextWithStroke(
                `倍数: x${this.scoreMultiplier.toFixed(1)}`,
                x,
                y + 70,
                '#ff8800',
                '#000000',
                '14px Arial',
                'right'
            );
        }
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
            formattedHighScore: this.getFormattedScore(this.highScore)
        };
    }
}