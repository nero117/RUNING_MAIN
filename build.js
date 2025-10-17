const fs = require('fs');
const path = require('path');

/**
 * 简单的构建脚本 - 为生产环境优化游戏
 */

console.log('🔨 开始构建网页跑酷游戏...');

// 创建构建目录
const buildDir = path.join(__dirname, 'dist');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// 复制必要文件到构建目录
const filesToCopy = [
    'index.html',
    'server.js',
    'package.json',
    'js/',
    'README.md'
];

function copyFileOrDir(src, dest) {
    const srcPath = path.join(__dirname, src);
    const destPath = path.join(buildDir, src);
    
    if (!fs.existsSync(srcPath)) {
        console.log(`⚠️  文件不存在: ${src}`);
        return;
    }
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
        // 复制目录
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }
        
        const files = fs.readdirSync(srcPath);
        files.forEach(file => {
            const srcFile = path.join(srcPath, file);
            const destFile = path.join(destPath, file);
            
            if (fs.statSync(srcFile).isDirectory()) {
                copyFileOrDir(path.relative(__dirname, srcFile), '');
            } else {
                fs.copyFileSync(srcFile, destFile);
            }
        });
    } else {
        // 复制文件
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
    }
}

// 复制文件
filesToCopy.forEach(file => {
    console.log(`📁 复制: ${file}`);
    copyFileOrDir(file, '');
});

// 替换配置文件为生产版本
const prodConfigPath = path.join(__dirname, 'js/config.prod.js');
const buildConfigPath = path.join(buildDir, 'js/config.js');

if (fs.existsSync(prodConfigPath)) {
    console.log('🔧 使用生产环境配置...');
    fs.copyFileSync(prodConfigPath, buildConfigPath);
}

// 优化HTML文件
const indexPath = path.join(buildDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// 添加生产环境优化
indexContent = indexContent.replace(
    '<title>网页跑酷游戏</title>',
    `<title>网页跑酷游戏</title>
    <meta name="description" content="一个基于HTML5 Canvas的现代网页跑酷游戏">
    <meta name="keywords" content="游戏,HTML5,Canvas,跑酷,网页游戏">
    <meta name="author" content="Web Runner Game Team">
    <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>">
    <meta name="theme-color" content="#2c3e50">`
);

// 添加PWA支持
const pwaManifest = {
    "name": "网页跑酷游戏",
    "short_name": "跑酷游戏",
    "description": "一个基于HTML5 Canvas的现代网页跑酷游戏",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#2c3e50",
    "theme_color": "#2c3e50",
    "icons": [
        {
            "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>",
            "sizes": "192x192",
            "type": "image/svg+xml"
        }
    ]
};

fs.writeFileSync(path.join(buildDir, 'manifest.json'), JSON.stringify(pwaManifest, null, 2));

// 添加manifest链接到HTML
indexContent = indexContent.replace(
    '<meta name="theme-color" content="#2c3e50">',
    `<meta name="theme-color" content="#2c3e50">
    <link rel="manifest" href="manifest.json">`
);

fs.writeFileSync(indexPath, indexContent);

// 创建简化的package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const buildPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: packageJson.main,
    scripts: {
        start: packageJson.scripts.start
    },
    dependencies: packageJson.dependencies,
    engines: packageJson.engines
};

fs.writeFileSync(
    path.join(buildDir, 'package.json'),
    JSON.stringify(buildPackageJson, null, 2)
);

// 创建启动脚本
const startScript = `#!/bin/bash
echo "🎮 启动网页跑酷游戏服务器..."
export NODE_ENV=production
node server.js
`;

fs.writeFileSync(path.join(buildDir, 'start.sh'), startScript);
fs.chmodSync(path.join(buildDir, 'start.sh'), '755');

// 创建Docker文件
const dockerfile = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN addgroup -g 1001 -S nodejs && adduser -S gameuser -u 1001
RUN chown -R gameuser:nodejs /app
USER gameuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["node", "server.js"]`;

fs.writeFileSync(path.join(buildDir, 'Dockerfile'), dockerfile);

console.log('✅ 构建完成！');
console.log(`📦 构建文件位于: ${buildDir}`);
console.log('🚀 部署说明:');
console.log('  1. cd dist');
console.log('  2. npm install');
console.log('  3. npm start');
console.log('  或使用Docker: docker build -t web-runner-game . && docker run -p 3000:3000 web-runner-game');

// 显示构建统计
const buildStats = {
    totalFiles: 0,
    totalSize: 0
};

function calculateStats(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            calculateStats(filePath);
        } else {
            buildStats.totalFiles++;
            buildStats.totalSize += stat.size;
        }
    });
}

calculateStats(buildDir);

console.log('\n📊 构建统计:');
console.log(`  文件数量: ${buildStats.totalFiles}`);
console.log(`  总大小: ${(buildStats.totalSize / 1024).toFixed(2)} KB`);
console.log(`  构建时间: ${new Date().toLocaleString()}`);

console.log('\n🎉 网页跑酷游戏构建成功！');