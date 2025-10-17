# 网页跑酷游戏 (Web Runner Game)

一个基于HTML5 Canvas开发的现代网页跑酷游戏，具有完整的游戏系统、性能优化和调试功能。

## 🎮 游戏特性

- **流畅的游戏体验**: 60FPS的流畅动画和响应式控制
- **完整的游戏系统**: 菜单、游戏、游戏结束场景
- **智能障碍物系统**: 动态生成和碰撞检测
- **得分系统**: 实时得分和最高分记录
- **性能监控**: 实时FPS、内存使用监控
- **调试工具**: 内置调试控制台和性能分析
- **响应式设计**: 适配不同屏幕尺寸

## 🚀 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd web-runner-game
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm start
   ```

4. **访问游戏**
   打开浏览器访问 `http://localhost:3000`

### 使用Docker部署

1. **构建镜像**
   ```bash
   docker build -t web-runner-game .
   ```

2. **运行容器**
   ```bash
   docker run -p 3000:3000 web-runner-game
   ```

### 使用Docker Compose部署

```bash
docker-compose up -d
```

## 🎯 游戏操作

- **空格键**: 跳跃
- **ESC键**: 暂停/恢复游戏
- **R键**: 重新开始游戏
- **`键**: 打开/关闭调试控制台

## 🛠️ 技术架构

### 核心系统

- **游戏引擎**: 主游戏循环和状态管理
- **场景管理**: 菜单、游戏、游戏结束场景切换
- **渲染系统**: 高性能Canvas渲染
- **物理系统**: 重力、碰撞检测
- **输入系统**: 键盘输入处理
- **音频系统**: 游戏音效和背景音乐

### 性能优化

- **对象池**: 减少垃圾回收，提高性能
- **空间分割**: 优化碰撞检测
- **渲染缓存**: 减少重复渲染调用
- **内存管理**: 自动内存清理和泄漏检测

### 调试工具

- **性能监控器**: 实时FPS、内存、渲染统计
- **调试控制台**: 运行时命令执行
- **系统集成监控**: 各系统状态和性能
- **内存管理器**: 内存使用分析和优化

## 📁 项目结构

```
web-runner-game/
├── js/                     # 游戏源代码
│   ├── entities/          # 游戏实体
│   │   ├── entity.js      # 基础实体类
│   │   ├── player.js      # 玩家实体
│   │   └── obstacle.js    # 障碍物实体
│   ├── managers/          # 管理器
│   │   ├── sceneManager.js    # 场景管理器
│   │   └── obstacleManager.js # 障碍物管理器
│   ├── scenes/            # 游戏场景
│   │   ├── scene.js       # 基础场景类
│   │   ├── menuScene.js   # 菜单场景
│   │   ├── gameScene.js   # 游戏场景
│   │   └── gameOverScene.js # 游戏结束场景
│   ├── systems/           # 游戏系统
│   │   ├── scoreSystem.js     # 得分系统
│   │   └── collisionSystem.js # 碰撞系统
│   ├── config.js          # 游戏配置
│   ├── utils.js           # 工具函数
│   ├── input.js           # 输入处理
│   ├── physics.js         # 物理系统
│   ├── renderer.js        # 渲染系统
│   ├── gameEngine.js      # 游戏引擎
│   ├── main.js            # 主入口
│   ├── objectPool.js      # 对象池
│   ├── performanceMonitor.js  # 性能监控
│   ├── memoryManager.js   # 内存管理
│   ├── debugConsole.js    # 调试控制台
│   └── systemIntegration.js   # 系统集成
├── index.html             # 主页面
├── server.js              # Express服务器
├── package.json           # 项目配置
├── Dockerfile             # Docker配置
├── docker-compose.yml     # Docker Compose配置
├── nginx.conf             # Nginx配置
└── README.md              # 项目文档
```

## 🔧 配置选项

### 游戏配置 (js/config.js)

```javascript
const GameConfig = {
    CANVAS_WIDTH: 800,         // 画布宽度
    CANVAS_HEIGHT: 400,        // 画布高度
    GRAVITY: 980,              // 重力加速度
    JUMP_FORCE: -400,          // 跳跃力
    PLAYER_SPEED: 200,         // 玩家速度
    OBSTACLE_SPEED: 200,       // 障碍物速度
    DEBUG: false               // 调试模式
};
```

### 服务器配置

- **端口**: 通过环境变量 `PORT` 设置，默认3000
- **环境**: 通过环境变量 `NODE_ENV` 设置
- **安全**: 使用Helmet.js增强安全性
- **压缩**: 启用Gzip压缩
- **缓存**: 静态资源缓存1天

## 📊 API接口

### 健康检查
```
GET /health
```
返回服务器健康状态

### 游戏统计
```
GET /api/stats
```
返回游戏统计信息

## 🐛 调试功能

### 调试控制台命令

- `help` - 显示所有可用命令
- `perf` - 显示性能报告
- `pools` - 显示对象池状态
- `scene [name]` - 切换场景
- `debug [on|off]` - 切换调试模式
- `clear` - 清空控制台
- `reset` - 重置游戏

### 性能监控

- 实时FPS显示
- 内存使用监控
- 渲染调用统计
- 系统性能分析
- 自动性能警告

## 🚀 部署指南

### 生产环境部署

1. **设置环境变量**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

2. **使用PM2部署**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "web-runner-game"
   ```

3. **使用Nginx反向代理**
   - 复制 `nginx.conf` 到Nginx配置目录
   - 重启Nginx服务

### 云平台部署

#### Heroku
```bash
git push heroku main
```

#### Vercel
```bash
vercel --prod
```

#### Railway
```bash
railway login
railway deploy
```

## 🤝 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- HTML5 Canvas API
- Express.js
- Docker
- 所有贡献者

## 📞 联系方式

- 项目链接: [https://github.com/yourusername/web-runner-game](https://github.com/yourusername/web-runner-game)
- 问题反馈: [Issues](https://github.com/yourusername/web-runner-game/issues)

---

**享受游戏！** 🎮