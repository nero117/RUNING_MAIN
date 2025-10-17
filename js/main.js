/**
 * 游戏主入口文件
 */

// 全局游戏实例
let game = null;

/**
 * 初始化游戏
 */
function initGame() {
    try {
        // 获取Canvas元素
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('无法找到游戏Canvas元素');
        }
        
        // 检查Canvas支持
        if (!canvas.getContext) {
            throw new Error('浏览器不支持Canvas');
        }
        
        // 创建游戏引擎实例
        game = new GameEngine(canvas);
        
        // 设置全局引用，供其他模块使用
        window.gameEngine = game;
        
        console.log('游戏初始化成功');
        console.log('Canvas尺寸:', canvas.width, 'x', canvas.height);
        console.log('游戏配置:', GameConfig);
        
        // 启动游戏引擎
        game.start();
        
    } catch (error) {
        console.error('游戏初始化失败:', error);
        alert('游戏初始化失败: ' + error.message);
    }
}

/**
 * 页面加载完成后初始化游戏
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化游戏...');
    initGame();
});

/**
 * 窗口失去焦点时暂停游戏
 */
window.addEventListener('blur', function() {
    if (game && !game.isPaused) {
        game.pause();
        console.log('游戏已暂停（窗口失去焦点）');
    }
});

/**
 * 窗口获得焦点时恢复游戏
 */
window.addEventListener('focus', function() {
    if (game && game.isPaused) {
        game.resume();
        console.log('游戏已恢复（窗口获得焦点）');
    }
});