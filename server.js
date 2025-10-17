const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// 启用gzip压缩
app.use(compression());

// 设置静态文件服务
app.use(express.static(path.join(__dirname), {
    maxAge: '1d', // 缓存1天
    etag: true,
    lastModified: true
}));

// 设置MIME类型
app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
        res.type('application/javascript');
    } else if (req.path.endsWith('.css')) {
        res.type('text/css');
    } else if (req.path.endsWith('.html')) {
        res.type('text/html');
    }
    next();
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 游戏路由
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API路由 - 游戏统计
app.get('/api/stats', (req, res) => {
    const stats = {
        message: '游戏统计API',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
    };
    
    res.json(stats);
});

// API路由 - 游戏配置
app.get('/api/config', (req, res) => {
    res.json({
        canvasWidth: 800,
        canvasHeight: 400,
        version: '1.0.0',
        features: {
            debugConsole: process.env.NODE_ENV !== 'production',
            performanceMonitor: process.env.NODE_ENV !== 'production',
            objectPooling: true,
            memoryManagement: true
        }
    });
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🎮 网页跑酷游戏服务器已启动`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log(`📊 健康检查: http://localhost:${PORT}/health`);
    console.log(`📈 统计API: http://localhost:${PORT}/api/stats`);
    console.log(`🚀 环境: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
});