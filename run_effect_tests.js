// 运行效果系统测试的简化脚本
console.log('🎨 启动效果系统单元测试...\n');

// 模拟浏览器环境
global.window = {
    shootingPerformanceMonitor: null
};

global.GameConfig = {
    GRAVITY: 980,
    DEBUG: false
};

global.performance = {
    now: () => Date.now()
};

// 读取并执行 EffectSystem 代码
const fs = require('fs');
const path = require('path');

try {
    const effectSystemPath = path.join(__dirname, 'js/systems/effectSystem.js');
    const effectSystemCode = fs.readFileSync(effectSystemPath, 'utf8');
    
    // 移除类声明，改为函数形式以便在 Node.js 中使用
    const modifiedCode = effectSystemCode.replace('class EffectSystem', 'function EffectSystem');
    eval(modifiedCode);
    
    console.log('✅ EffectSystem 类加载成功');
    
    // 运行核心测试
    runCoreTests();
    
} catch (error) {
    console.error('❌ 加载 EffectSystem 失败:', error.message);
}

function runCoreTests() {
    console.log('\n🧪 运行核心功能测试...\n');
    
    let passed = 0;
    let total = 0;
    
    function test(name, testFn) {
        total++;
        try {
            testFn();
            console.log(`✅ ${name}`);
            passed++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
        }
    }
    
    // 测试 1: 效果系统实例化
    test('效果系统可以实例化', () => {
        const effectSystem = new EffectSystem();
        if (!effectSystem) throw new Error('无法创建 EffectSystem 实例');
        if (!Array.isArray(effectSystem.effects)) throw new Error('effects 属性不是数组');
        if (effectSystem.effects.length !== 0) throw new Error('初始 effects 数组应为空');
    });
    
    // 测试 2: 爆炸效果创建
    test('爆炸效果创建', () => {
        const effectSystem = new EffectSystem();
        const explosion = effectSystem.addExplosion(100, 100);
        
        if (!explosion) throw new Error('爆炸效果创建失败');
        if (explosion.type !== effectSystem.effectTypes.EXPLOSION) throw new Error('效果类型错误');
        if (!explosion.particles || explosion.particles.length === 0) throw new Error('粒子未创建');
        if (effectSystem.getActiveEffectCount() !== 1) throw new Error('活跃效果数量错误');
    });
    
    // 测试 3: 摧毁效果创建
    test('摧毁效果创建', () => {
        const effectSystem = new EffectSystem();
        const destruction = effectSystem.addDestruction(200, 200);
        
        if (!destruction) throw new Error('摧毁效果创建失败');
        if (destruction.type !== effectSystem.effectTypes.DESTRUCTION) throw new Error('效果类型错误');
        if (!destruction.particles || destruction.particles.length === 0) throw new Error('粒子未创建');
    });
    
    // 测试 4: 得分弹出效果创建
    test('得分弹出效果创建', () => {
        const effectSystem = new EffectSystem();
        const scorePopup = effectSystem.addScorePopup(400, 400, 100);
        
        if (!scorePopup) throw new Error('得分弹出效果创建失败');
        if (scorePopup.type !== effectSystem.effectTypes.SCORE_POPUP) throw new Error('效果类型错误');
        if (scorePopup.score !== 100) throw new Error('得分数值错误');
    });
    
    // 测试 5: 效果更新逻辑
    test('效果更新逻辑', () => {
        const effectSystem = new EffectSystem();
        const explosion = effectSystem.addExplosion(100, 100);
        const initialAlpha = explosion.alpha;
        
        effectSystem.update(0.1); // 100ms
        
        if (explosion.alpha >= initialAlpha) throw new Error('效果透明度未衰减');
        
        // 检查粒子位置更新
        const particle = explosion.particles[0];
        const initialX = particle.x;
        const initialY = particle.y;
        
        effectSystem.update(0.1);
        
        if (particle.x === initialX && particle.y === initialY) {
            throw new Error('粒子位置未更新');
        }
    });
    
    // 测试 6: 得分弹出向上移动
    test('得分弹出向上移动', () => {
        const effectSystem = new EffectSystem();
        const scorePopup = effectSystem.addScorePopup(200, 200, 50);
        const initialY = scorePopup.y;
        
        effectSystem.update(0.1);
        
        if (scorePopup.y >= initialY) throw new Error('得分弹出未向上移动');
    });
    
    // 测试 7: 效果清理
    test('效果清理功能', () => {
        const effectSystem = new EffectSystem();
        const effect1 = effectSystem.addExplosion(100, 100);
        const effect2 = effectSystem.addExplosion(200, 200);
        
        const removed = effectSystem.removeEffectById(effect1.id);
        
        if (!removed) throw new Error('效果移除失败');
        if (effectSystem.getActiveEffectCount() !== 1) throw new Error('移除后活跃效果数量错误');
    });
    
    // 测试 8: 清除所有效果
    test('清除所有效果', () => {
        const effectSystem = new EffectSystem();
        effectSystem.addExplosion(100, 100);
        effectSystem.addDestruction(200, 200);
        effectSystem.addParticleBurst(300, 300);
        
        effectSystem.clearAllEffects();
        
        if (effectSystem.getActiveEffectCount() !== 0) throw new Error('未清除所有效果');
    });
    
    // 测试 9: 统计信息
    test('统计信息跟踪', () => {
        const effectSystem = new EffectSystem();
        const initialStats = effectSystem.getStats();
        
        effectSystem.addExplosion(100, 100);
        effectSystem.addDestruction(200, 200);
        
        const updatedStats = effectSystem.getStats();
        
        if (updatedStats.totalCreated <= initialStats.totalCreated) {
            throw new Error('总创建数量未更新');
        }
        if (updatedStats.activeEffects !== 2) {
            throw new Error('活跃效果数量错误');
        }
    });
    
    // 测试 10: 按类型获取效果数量
    test('按类型获取效果数量', () => {
        const effectSystem = new EffectSystem();
        effectSystem.addExplosion(100, 100);
        effectSystem.addExplosion(200, 200);
        effectSystem.addDestruction(300, 300);
        
        const explosionCount = effectSystem.getEffectCountByType(effectSystem.effectTypes.EXPLOSION);
        const destructionCount = effectSystem.getEffectCountByType(effectSystem.effectTypes.DESTRUCTION);
        
        if (explosionCount !== 2) throw new Error(`期望2个爆炸效果，实际${explosionCount}个`);
        if (destructionCount !== 1) throw new Error(`期望1个摧毁效果，实际${destructionCount}个`);
    });
    
    console.log(`\n🎉 测试结果: ${passed}/${total} 个测试通过`);
    console.log(`成功率: ${Math.round((passed / total) * 100)}%`);
    
    if (passed === total) {
        console.log('✅ 所有测试通过！效果系统单元测试完成。');
        return true;
    } else {
        console.log('❌ 部分测试失败！');
        return false;
    }
}