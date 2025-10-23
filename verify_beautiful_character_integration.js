/**
 * 美女角色系统集成验证脚本
 * 验证美女角色系统是否正确集成到游戏循环中
 */

console.log('🎭 开始美女角色系统集成验证...');

// 模拟浏览器环境的基本对象
global.console = console;
global.performance = { now: () => Date.now() };
global.Math = Math;
global.setTimeout = setTimeout;
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);

// 模拟Canvas和渲染上下文
class MockCanvasContext {
    constructor() {
        this.fillStyle = '';
        this.strokeStyle = '';
        this.lineWidth = 1;
        this.font = '';
        this.textAlign = 'left';
        this.globalAlpha = 1;
        this.shadowColor = '';
        this.shadowBlur = 0;
        this.globalCompositeOperation = 'source-over';
    }
    
    fillRect() {}
    strokeRect() {}
    beginPath() {}
    arc() {}
    fill() {}
    stroke() {}
    moveTo() {}
    lineTo() {}
    quadraticCurveTo() {}
    closePath() {}
    save() {}
    restore() {}
    translate() {}
    rotate() {}
    scale() {}
    createRadialGradient() {
        return {
            addColorStop: () => {}
        };
    }
    fillText() {}
    strokeText() {}
}

class MockCanvas {
    constructor() {
        this.width = 800;
        this.height = 400;
        this.ctx = new MockCanvasContext();
    }
    
    getContext() {
        return this.ctx;
    }
}

// 加载必要的文件内容
const fs = require('fs');

try {
    // 加载游戏配置
    const configContent = fs.readFileSync('js/config.js', 'utf8');
    eval(configContent);
    
    // 加载工具函数
    const utilsContent = fs.readFileSync('js/utils.js', 'utf8');
    eval(utilsContent);
    
    // 加载实体基类
    const entityContent = fs.readFileSync('js/entities/entity.js', 'utf8');
    // 先定义Entity类，然后加载其他依赖
    eval(entityContent.replace('class Entity', 'global.Entity = class Entity'));
    
    // 加载渲染器
    const rendererContent = fs.readFileSync('js/renderer.js', 'utf8');
    eval(rendererContent.replace('class Renderer', 'global.Renderer = class Renderer'));
    
    // 加载物理系统
    const physicsContent = fs.readFileSync('js/physics.js', 'utf8');
    eval(physicsContent.replace('class PhysicsSystem', 'global.PhysicsSystem = class PhysicsSystem'));
    
    // 加载美女角色系统
    const characterAssetsContent = fs.readFileSync('js/entities/characterAssets.js', 'utf8');
    eval(characterAssetsContent.replace('class CharacterAssets', 'global.CharacterAssets = class CharacterAssets'));
    
    const characterEffectsContent = fs.readFileSync('js/entities/characterEffects.js', 'utf8');
    eval(characterEffectsContent.replace('class CharacterEffects', 'global.CharacterEffects = class CharacterEffects'));
    
    // 加载玩家类
    const playerContent = fs.readFileSync('js/entities/player.js', 'utf8');
    eval(playerContent.replace('class Player extends Entity', 'global.Player = class Player extends Entity'));
    
    console.log('✅ 所有必要文件加载成功');
    
} catch (error) {
    console.error('❌ 文件加载失败:', error.message);
    process.exit(1);
}

// 验证测试
function runIntegrationTests() {
    const tests = [];
    
    // 测试1: 验证类定义存在
    tests.push({
        name: 'CharacterAssets 类定义',
        test: () => typeof CharacterAssets === 'function',
        details: 'CharacterAssets 类应该被正确定义'
    });
    
    tests.push({
        name: 'CharacterEffects 类定义',
        test: () => typeof CharacterEffects === 'function',
        details: 'CharacterEffects 类应该被正确定义'
    });
    
    tests.push({
        name: 'Player 类定义',
        test: () => typeof Player === 'function',
        details: 'Player 类应该被正确定义'
    });
    
    // 测试2: 验证实例创建
    let mockCanvas, mockRenderer, testPlayer;
    
    tests.push({
        name: '创建测试环境',
        test: () => {
            try {
                mockCanvas = new MockCanvas();
                mockRenderer = new Renderer(mockCanvas);
                return true;
            } catch (error) {
                console.error('创建测试环境失败:', error);
                return false;
            }
        },
        details: '创建模拟的Canvas和Renderer'
    });
    
    tests.push({
        name: '创建美女角色玩家实例',
        test: () => {
            try {
                testPlayer = new Player(100, 300);
                return !!testPlayer;
            } catch (error) {
                console.error('创建玩家实例失败:', error);
                return false;
            }
        },
        details: '创建包含美女角色系统的玩家实例'
    });
    
    // 测试3: 验证美女角色系统集成
    tests.push({
        name: 'CharacterAssets 集成',
        test: () => !!(testPlayer && testPlayer.characterAssets && testPlayer.characterAssets instanceof CharacterAssets),
        details: 'Player 应该包含 CharacterAssets 实例'
    });
    
    tests.push({
        name: 'CharacterEffects 集成',
        test: () => !!(testPlayer && testPlayer.characterEffects && testPlayer.characterEffects instanceof CharacterEffects),
        details: 'Player 应该包含 CharacterEffects 实例'
    });
    
    // 测试4: 验证动画系统
    tests.push({
        name: '动画配置完整性',
        test: () => {
            if (!testPlayer || !testPlayer.characterAssets) return false;
            const animations = testPlayer.characterAssets.animations;
            return !!(animations && animations.running && animations.jumping && animations.shooting);
        },
        details: '美女角色应该有完整的动画配置'
    });
    
    tests.push({
        name: '动画更新功能',
        test: () => {
            if (!testPlayer || !testPlayer.characterAssets) return false;
            try {
                testPlayer.characterAssets.updateAnimation('running', 0.1);
                return testPlayer.characterAssets.currentAnimation === 'running';
            } catch (error) {
                console.error('动画更新失败:', error);
                return false;
            }
        },
        details: '动画系统应该能正确更新状态'
    });
    
    // 测试5: 验证无敌状态系统
    tests.push({
        name: '无敌状态方法',
        test: () => !!(testPlayer && typeof testPlayer.setInvincible === 'function' && typeof testPlayer.isInvincible === 'function'),
        details: '玩家应该有无敌状态相关方法'
    });
    
    tests.push({
        name: '无敌状态激活',
        test: () => {
            if (!testPlayer) return false;
            try {
                testPlayer.setInvincible(5);
                return testPlayer.isInvincible();
            } catch (error) {
                console.error('无敌状态激活失败:', error);
                return false;
            }
        },
        details: '无敌状态应该能正确激活'
    });
    
    tests.push({
        name: '美女角色特效激活',
        test: () => {
            if (!testPlayer || !testPlayer.characterEffects) return false;
            return testPlayer.characterEffects.hasInvincibilityEffect();
        },
        details: '无敌状态激活时应该有相应的视觉特效'
    });
    
    // 测试6: 验证渲染系统集成
    tests.push({
        name: '角色渲染方法',
        test: () => {
            if (!testPlayer || !testPlayer.characterAssets) return false;
            return typeof testPlayer.characterAssets.renderCharacter === 'function';
        },
        details: '美女角色应该有渲染方法'
    });
    
    tests.push({
        name: '特效渲染方法',
        test: () => {
            if (!testPlayer || !testPlayer.characterEffects) return false;
            return typeof testPlayer.characterEffects.render === 'function';
        },
        details: '美女角色特效应该有渲染方法'
    });
    
    tests.push({
        name: '玩家渲染集成',
        test: () => {
            if (!testPlayer) return false;
            try {
                testPlayer.render(mockRenderer);
                return true;
            } catch (error) {
                console.error('玩家渲染失败:', error);
                return false;
            }
        },
        details: '玩家渲染应该包含美女角色系统'
    });
    
    // 测试7: 验证游戏循环集成
    tests.push({
        name: '玩家更新方法',
        test: () => {
            if (!testPlayer) return false;
            try {
                testPlayer.update(0.016); // 模拟60FPS
                return true;
            } catch (error) {
                console.error('玩家更新失败:', error);
                return false;
            }
        },
        details: '玩家更新应该包含美女角色系统更新'
    });
    
    tests.push({
        name: '动画状态同步',
        test: () => {
            if (!testPlayer) return false;
            const initialState = testPlayer.animationState;
            testPlayer.animationState = 'jumping';
            testPlayer.characterAssets.updateAnimation('jumping', 0.1);
            return testPlayer.characterAssets.currentAnimation === 'jumping';
        },
        details: '玩家动画状态应该与角色资源系统同步'
    });
    
    // 执行所有测试
    console.log('\n🧪 开始执行集成测试...\n');
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    tests.forEach((test, index) => {
        try {
            const result = test.test();
            const status = result ? '✅' : '❌';
            const message = `${status} 测试 ${index + 1}/${totalTests}: ${test.name}`;
            
            console.log(message);
            console.log(`   ${test.details}`);
            
            if (result) {
                passedTests++;
            } else {
                console.log(`   失败原因: 测试条件不满足`);
            }
            
            console.log('');
            
        } catch (error) {
            console.log(`❌ 测试 ${index + 1}/${totalTests}: ${test.name}`);
            console.log(`   ${test.details}`);
            console.log(`   失败原因: ${error.message}`);
            console.log('');
        }
    });
    
    // 输出总结
    console.log('📊 测试总结:');
    console.log(`   通过: ${passedTests}/${totalTests}`);
    console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 所有测试通过！美女角色系统已成功集成到游戏循环中！');
        console.log('\n🎭 美女角色系统特性:');
        console.log('   ✨ 华丽的美女角色动画 (奔跑、跳跃、射击)');
        console.log('   ✨ 精美的视觉效果和粒子系统');
        console.log('   ✨ 无敌状态的发光和闪烁效果');
        console.log('   ✨ 完整的角色资源管理系统');
        console.log('   ✨ 与游戏循环的完美集成');
        
        return true;
    } else {
        console.log('\n⚠️ 部分测试失败，请检查集成问题');
        return false;
    }
}

// 运行测试
const success = runIntegrationTests();
process.exit(success ? 0 : 1);