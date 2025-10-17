/**
 * 游戏配置常量
 */
const GameConfig = {
    // Canvas 尺寸
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 400,
    
    // 物理参数
    GRAVITY: 980,           // 重力加速度 (像素/秒²)
    JUMP_FORCE: -400,       // 跳跃力 (像素/秒)
    
    // 移动速度
    PLAYER_SPEED: 200,      // 玩家移动速度 (像素/秒)
    OBSTACLE_SPEED: 200,    // 障碍物移动速度 (像素/秒)
    
    // 游戏机制
    OBSTACLE_SPAWN_INTERVAL: 2000,  // 障碍物生成间隔 (毫秒)
    GROUND_Y: 350,                  // 地面Y坐标
    
    // 玩家属性
    PLAYER: {
        WIDTH: 24,                  // 调整宽度适应卡通人物
        HEIGHT: 40,                 // 调整高度适应卡通人物
        START_X: 400,               // 玩家始终保持在屏幕中间
        CENTER_X: 400,              // 玩家在屏幕中间的X位置 (CANVAS_WIDTH / 2)
        ANIMATION_SPEED: 6.0,        // 动画播放速度（帧/秒）
        RUNNING_FRAMES: 4,           // 奔跑动画帧数
        JUMPING_FRAMES: 2,           // 跳跃动画帧数
        ANIMATION_BOUNCE: 2          // 奔跑时的上下摆动幅度
    },
    
    // 障碍物属性
    OBSTACLE: {
        WIDTH: 32,
        HEIGHT: 32,
        MIN_GAP: 150,       // 障碍物之间最小间距
        MAX_GAP: 300        // 障碍物之间最大间距
    },
    
    // 渲染设置
    TARGET_FPS: 60,
    BACKGROUND_SPEED: 100,   // 背景滚动速度
    DEBUG: false            // 调试模式开关 - 显示中心线和调试信息
};

/**
 * 游戏状态枚举
 */
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

/**
 * 输入键码
 */
const Keys = {
    SPACE: 32,
    ENTER: 13,
    ESC: 27,
    X: 88,          // X键用于射击
    CTRL: 17        // Ctrl键用于射击
};

// 射击系统配置 - 集成到主配置中
GameConfig.SHOOT_COOLDOWN = 300;     // 射击冷却时间（毫秒）
GameConfig.BULLET_SPEED = 400;       // 子弹速度（像素/秒）
GameConfig.BULLET_WIDTH = 8;         // 子弹宽度
GameConfig.BULLET_HEIGHT = 4;        // 子弹高度

// 漂浮障碍物配置
GameConfig.FLOATING_OBSTACLE_SPAWN_INTERVAL = 3000;  // 漂浮障碍物生成间隔（毫秒）
GameConfig.FLOATING_OBSTACLE_MIN_Y = 100;            // 漂浮障碍物最小Y坐标
GameConfig.FLOATING_OBSTACLE_MAX_Y = 250;            // 漂浮障碍物最大Y坐标
GameConfig.BULLET_DESTROY_SCORE = 50;                // 射击摧毁障碍物得分