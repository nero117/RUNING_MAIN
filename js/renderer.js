/**
 * 渲染系统 - 提供Canvas渲染接口和基础图形绘制功能
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 背景滚动相关属性
        this.backgroundOffset = 0;
        this.backgroundSpeed = GameConfig.BACKGROUND_SPEED;
        
        // 渲染统计
        this.renderStats = {
            drawCalls: 0,
            entitiesRendered: 0
        };
        
        // 设置Canvas渲染优化
        this.setupCanvasOptimizations();
    }
    
    /**
     * 设置Canvas渲染优化
     */
    setupCanvasOptimizations() {
        // 启用图像平滑以获得更好的视觉效果
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // 设置默认文本基线
        this.ctx.textBaseline = 'top';
        
        // 启用硬件加速（如果可用）
        if (this.ctx.willReadFrequently !== undefined) {
            this.ctx.willReadFrequently = false;
        }
        
        // 缓存常用的渲染状态
        this.cachedStyles = {
            fillStyle: null,
            strokeStyle: null,
            font: null,
            textAlign: null
        };
    }
    
    /**
     * 清空画布
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 重置渲染统计
        this.renderStats.drawCalls = 0;
        this.renderStats.entitiesRendered = 0;
    }
    
    /**
     * 更新背景滚动
     * @param {number} deltaTime - 时间增量
     */
    updateBackground(deltaTime) {
        this.backgroundOffset += this.backgroundSpeed * deltaTime;
        
        // 当偏移量超过一个循环周期时重置
        if (this.backgroundOffset >= this.width) {
            this.backgroundOffset = 0;
        }
    }
    
    /**
     * 绘制滚动背景
     */
    drawBackground() {
        // 绘制天空背景
        this.fillRect(0, 0, this.width, GameConfig.GROUND_Y, '#87CEEB');
        
        // 绘制滚动的云朵效果
        this.drawScrollingClouds();
        
        // 绘制地面
        this.fillRect(0, GameConfig.GROUND_Y, this.width, this.height - GameConfig.GROUND_Y, '#8B4513');
        
        // 绘制地面装饰
        this.drawGroundDecorations();
    }
    
    /**
     * 绘制滚动的云朵效果
     */
    drawScrollingClouds() {
        const cloudColor = 'rgba(255, 255, 255, 0.8)';
        const cloudY = 50;
        const cloudSpacing = 200;
        const cloudWidth = 60;
        const cloudHeight = 30;
        
        // 计算云朵位置，考虑背景滚动
        for (let i = -1; i <= Math.ceil(this.width / cloudSpacing) + 1; i++) {
            const cloudX = i * cloudSpacing - this.backgroundOffset * 0.3; // 云朵移动速度较慢
            
            // 绘制简单的椭圆形云朵
            this.drawEllipse(cloudX, cloudY, cloudWidth, cloudHeight, cloudColor);
            this.drawEllipse(cloudX + 20, cloudY - 10, cloudWidth * 0.8, cloudHeight * 0.8, cloudColor);
            this.drawEllipse(cloudX - 15, cloudY - 5, cloudWidth * 0.6, cloudHeight * 0.6, cloudColor);
        }
    }
    
    /**
     * 绘制地面装饰
     */
    drawGroundDecorations() {
        const grassColor = '#9ACD32';
        const grassHeight = 8;
        const grassSpacing = 15;
        
        // 绘制滚动的草地装饰
        for (let i = -1; i <= Math.ceil(this.width / grassSpacing) + 1; i++) {
            const grassX = i * grassSpacing - (this.backgroundOffset % grassSpacing);
            const grassY = GameConfig.GROUND_Y - grassHeight;
            
            // 绘制简单的草地效果
            this.fillRect(grassX, grassY, 3, grassHeight, grassColor);
            this.fillRect(grassX + 5, grassY + 2, 2, grassHeight - 2, grassColor);
            this.fillRect(grassX + 8, grassY + 1, 3, grassHeight - 1, grassColor);
        }
    }
    
    /**
     * 绘制矩形
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} color - 颜色
     */
    drawRect(x, y, width, height, color = '#ffffff') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.renderStats.drawCalls++;
    }
    
    /**
     * 填充矩形
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} color - 颜色
     */
    fillRect(x, y, width, height, color = '#ffffff') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.renderStats.drawCalls++;
    }
    
    /**
     * 绘制矩形边框
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} color - 颜色
     * @param {number} lineWidth - 线宽
     */
    strokeRect(x, y, width, height, color = '#ffffff', lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
        this.renderStats.drawCalls++;
    }
    
    /**
     * 绘制圆形
     * @param {number} x - 中心X坐标
     * @param {number} y - 中心Y坐标
     * @param {number} radius - 半径
     * @param {string} color - 颜色
     */
    drawCircle(x, y, radius, color = '#ffffff') {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.renderStats.drawCalls++;
    }
    
    /**
     * 绘制椭圆
     * @param {number} x - 中心X坐标
     * @param {number} y - 中心Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} color - 颜色
     */
    drawEllipse(x, y, width, height, color = '#ffffff') {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.renderStats.drawCalls++;
    }
    
    /**
     * 绘制线条
     * @param {number} x1 - 起始X坐标
     * @param {number} y1 - 起始Y坐标
     * @param {number} x2 - 结束X坐标
     * @param {number} y2 - 结束Y坐标
     * @param {string} color - 颜色
     * @param {number} lineWidth - 线宽
     */
    drawLine(x1, y1, x2, y2, color = '#ffffff', lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.renderStats.drawCalls++;
    }
    
    /**
     * 绘制文本
     * @param {string} text - 文本内容
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     * @param {string} font - 字体
     * @param {string} align - 文本对齐方式
     */
    drawText(text, x, y, color = '#ffffff', font = '16px Arial', align = 'left') {
        // 优化：只在样式改变时设置
        if (this.cachedStyles.fillStyle !== color) {
            this.ctx.fillStyle = color;
            this.cachedStyles.fillStyle = color;
        }
        if (this.cachedStyles.font !== font) {
            this.ctx.font = font;
            this.cachedStyles.font = font;
        }
        if (this.cachedStyles.textAlign !== align) {
            this.ctx.textAlign = align;
            this.cachedStyles.textAlign = align;
        }
        
        this.ctx.fillText(text, x, y);
        this.renderStats.drawCalls++;
    }
    
    /**
     * 绘制带描边的文本
     * @param {string} text - 文本内容
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} fillColor - 填充颜色
     * @param {string} strokeColor - 描边颜色
     * @param {string} font - 字体
     * @param {string} align - 文本对齐方式
     * @param {number} strokeWidth - 描边宽度
     */
    drawTextWithStroke(text, x, y, fillColor = '#ffffff', strokeColor = '#000000', font = '16px Arial', align = 'left', strokeWidth = 2) {
        this.ctx.font = font;
        this.ctx.textAlign = align;
        
        // 绘制描边
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.strokeText(text, x, y);
        
        // 绘制填充
        this.ctx.fillStyle = fillColor;
        this.ctx.fillText(text, x, y);
        
        this.renderStats.drawCalls += 2;
    }
    
    /**
     * 绘制实体（通用实体渲染接口）
     * @param {Entity} entity - 要渲染的实体
     */
    drawEntity(entity) {
        if (entity && entity.render) {
            entity.render(this);
            this.renderStats.entitiesRendered++;
        }
    }
    
    /**
     * 批量绘制实体
     * @param {Array} entities - 实体数组
     */
    drawEntities(entities) {
        if (Array.isArray(entities)) {
            entities.forEach(entity => this.drawEntity(entity));
        }
    }
    
    /**
     * 设置全局透明度
     * @param {number} alpha - 透明度 (0-1)
     */
    setGlobalAlpha(alpha) {
        this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    }
    
    /**
     * 重置全局透明度
     */
    resetGlobalAlpha() {
        this.ctx.globalAlpha = 1.0;
    }
    
    /**
     * 保存Canvas状态
     */
    save() {
        this.ctx.save();
    }
    
    /**
     * 恢复Canvas状态
     */
    restore() {
        this.ctx.restore();
    }
    
    /**
     * 设置变换矩阵
     * @param {number} scaleX - X轴缩放
     * @param {number} scaleY - Y轴缩放
     * @param {number} translateX - X轴平移
     * @param {number} translateY - Y轴平移
     */
    setTransform(scaleX = 1, scaleY = 1, translateX = 0, translateY = 0) {
        this.ctx.setTransform(scaleX, 0, 0, scaleY, translateX, translateY);
    }
    
    /**
     * 重置变换矩阵
     */
    resetTransform() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    /**
     * 获取渲染统计信息
     * @returns {Object} 渲染统计
     */
    getRenderStats() {
        return { ...this.renderStats };
    }
    
    /**
     * 绘制调试信息
     * @param {number} fps - 当前FPS
     * @param {Object} additionalInfo - 额外调试信息
     */
    drawDebugInfo(fps, additionalInfo = {}) {
        if (!GameConfig.DEBUG) return;
        
        const debugY = 20;
        const lineHeight = 16;
        let currentY = debugY;
        
        // 绘制FPS
        this.drawTextWithStroke(`FPS: ${fps}`, 10, currentY, '#00ff00', '#000000', '14px Arial');
        currentY += lineHeight;
        
        // 绘制渲染统计
        this.drawTextWithStroke(`Draw Calls: ${this.renderStats.drawCalls}`, 10, currentY, '#00ff00', '#000000', '14px Arial');
        currentY += lineHeight;
        
        this.drawTextWithStroke(`Entities: ${this.renderStats.entitiesRendered}`, 10, currentY, '#00ff00', '#000000', '14px Arial');
        currentY += lineHeight;
        
        // 绘制额外信息
        Object.entries(additionalInfo).forEach(([key, value]) => {
            this.drawTextWithStroke(`${key}: ${value}`, 10, currentY, '#00ff00', '#000000', '14px Arial');
            currentY += lineHeight;
        });
    }
}