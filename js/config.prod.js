/**
 * 生产环境游戏配置
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
        WIDTH: 32,
        HEIGHT: 32,
        START_X: 100,
        ANIMATION_SPEED: 8.0,        // 动画播放速度（帧/秒）
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
    DEBUG: false,            // 生产环境关闭调试
    
    // 性能优化设置
    PERFORMANCE: {
        ENABLE_OBJECT_POOLING: true,     // 启用对象池
        ENABLE_PERFORMANCE_MONITOR: false, // 生产环境关闭性能监控
        ENABLE_DEBUG_CONSOLE: false,     // 生产环境关闭调试控制台
        ENABLE_MEMORY_MANAGER: true,     // 启用内存管理
        MAX_PARTICLES: 50,               // 最大粒子数量
        COLLISION_OPTIMIZATION: true,    // 启用碰撞优化
        RENDER_OPTIMIZATION: true        // 启用渲染优化
    },
    
    // 音频设置
    AUDIO: {
        MASTER_VOLUME: 0.7,
        SFX_VOLUME: 0.8,
        MUSIC_VOLUME: 0.5,
        ENABLE_AUDIO: true
    },
    
    // 游戏平衡
    BALANCE: {
        SCORE_MULTIPLIER: 1.0,
        DIFFICULTY_INCREASE_RATE: 0.1,
        MAX_DIFFICULTY: 3.0
    }
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
    ESC: 27
};