/**
 * 工具函数集合
 */
class Utils {
    /**
     * 检查两个矩形是否碰撞（AABB碰撞检测）
     * @param {Object} rect1 - 第一个矩形 {x, y, width, height}
     * @param {Object} rect2 - 第二个矩形 {x, y, width, height}
     * @returns {boolean} 是否碰撞
     */
    static checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    /**
     * 检查两个矩形是否碰撞（带边距）
     * @param {Object} rect1 - 第一个矩形 {x, y, width, height}
     * @param {Object} rect2 - 第二个矩形 {x, y, width, height}
     * @param {number} margin - 碰撞边距
     * @returns {boolean} 是否碰撞
     */
    static checkCollisionWithMargin(rect1, rect2, margin = 0) {
        return rect1.x + margin < rect2.x + rect2.width - margin &&
               rect1.x + rect1.width - margin > rect2.x + margin &&
               rect1.y + margin < rect2.y + rect2.height - margin &&
               rect1.y + rect1.height - margin > rect2.y + margin;
    }
    
    /**
     * 获取两个矩形的重叠区域
     * @param {Object} rect1 - 第一个矩形
     * @param {Object} rect2 - 第二个矩形
     * @returns {Object|null} 重叠区域或null
     */
    static getOverlapArea(rect1, rect2) {
        if (!Utils.checkCollision(rect1, rect2)) {
            return null;
        }
        
        const left = Math.max(rect1.x, rect2.x);
        const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
        const top = Math.max(rect1.y, rect2.y);
        const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
        
        return {
            x: left,
            y: top,
            width: right - left,
            height: bottom - top
        };
    }
    
    /**
     * 限制数值在指定范围内
     * @param {number} value - 要限制的值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制后的值
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    /**
     * 生成指定范围内的随机数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机数
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * 生成指定范围内的随机整数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机整数
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * 计算两点之间的距离
     * @param {number} x1 - 第一个点的x坐标
     * @param {number} y1 - 第一个点的y坐标
     * @param {number} x2 - 第二个点的x坐标
     * @param {number} y2 - 第二个点的y坐标
     * @returns {number} 距离
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
}