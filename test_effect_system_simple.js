// Simple Node.js test for EffectSystem
// This tests the core functionality without browser dependencies

// Mock GameConfig for Node.js environment
global.GameConfig = {
    GRAVITY: 980,
    DEBUG: false
};

// Mock performance.now() for Node.js
global.performance = {
    now: () => Date.now()
};

// Load the EffectSystem class
const fs = require('fs');
const path = require('path');

// Read and evaluate the EffectSystem code
const effectSystemCode = fs.readFileSync(path.join(__dirname, 'js/systems/effectSystem.js'), 'utf8');
eval(effectSystemCode);

// Test runner
function runTests() {
    console.log('🎨 Running Effect System Unit Tests...\n');
    
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
    
    // Test 1: Effect System Creation
    test('EffectSystem can be instantiated', () => {
        const effectSystem = new EffectSystem();
        if (!effectSystem) throw new Error('Failed to create EffectSystem');
        if (effectSystem.effects.length !== 0) throw new Error('Initial effects array should be empty');
    });
    
    // Test 2: Explosion Effect Creation
    test('Explosion effect can be created', () => {
        const effectSystem = new EffectSystem();
        const explosion = effectSystem.addExplosion(100, 100);
        
        if (!explosion) throw new Error('Explosion effect not created');
        if (explosion.type !== effectSystem.effectTypes.EXPLOSION) throw new Error('Wrong effect type');
        if (!explosion.particles || explosion.particles.length === 0) throw new Error('No particles created');
        if (effectSystem.getActiveEffectCount() !== 1) throw new Error('Active effect count incorrect');
    });
    
    // Test 3: Destruction Effect Creation
    test('Destruction effect can be created', () => {
        const effectSystem = new EffectSystem();
        const destruction = effectSystem.addDestruction(200, 200);
        
        if (!destruction) throw new Error('Destruction effect not created');
        if (destruction.type !== effectSystem.effectTypes.DESTRUCTION) throw new Error('Wrong effect type');
        if (!destruction.particles || destruction.particles.length === 0) throw new Error('No particles created');
    });
    
    // Test 4: Particle Burst Effect Creation
    test('Particle burst effect can be created', () => {
        const effectSystem = new EffectSystem();
        const particleBurst = effectSystem.addParticleBurst(300, 300);
        
        if (!particleBurst) throw new Error('Particle burst effect not created');
        if (particleBurst.type !== effectSystem.effectTypes.PARTICLE_BURST) throw new Error('Wrong effect type');
        if (!particleBurst.particles || particleBurst.particles.length === 0) throw new Error('No particles created');
    });
    
    // Test 5: Score Popup Effect Creation
    test('Score popup effect can be created', () => {
        const effectSystem = new EffectSystem();
        const scorePopup = effectSystem.addScorePopup(400, 400, 100);
        
        if (!scorePopup) throw new Error('Score popup effect not created');
        if (scorePopup.type !== effectSystem.effectTypes.SCORE_POPUP) throw new Error('Wrong effect type');
        if (scorePopup.score !== 100) throw new Error('Score value incorrect');
    });
    
    // Test 6: Effect ID Uniqueness
    test('Effect IDs are unique', () => {
        const effectSystem = new EffectSystem();
        const effect1 = effectSystem.addExplosion(100, 100);
        const effect2 = effectSystem.addExplosion(100, 100);
        
        if (effect1.id === effect2.id) throw new Error('Effect IDs are not unique');
    });
    
    // Test 7: Effect Update Logic
    test('Effects update correctly', () => {
        const effectSystem = new EffectSystem();
        const explosion = effectSystem.addExplosion(100, 100);
        const initialAlpha = explosion.alpha;
        
        effectSystem.update(0.1); // 100ms
        
        if (explosion.alpha >= initialAlpha) throw new Error('Effect alpha did not decrease');
        
        // Check particle position update
        const particle = explosion.particles[0];
        const initialX = particle.x;
        const initialY = particle.y;
        
        effectSystem.update(0.1);
        
        if (particle.x === initialX && particle.y === initialY) {
            throw new Error('Particle position did not update');
        }
    });
    
    // Test 8: Score Popup Movement
    test('Score popup moves upward', () => {
        const effectSystem = new EffectSystem();
        const scorePopup = effectSystem.addScorePopup(200, 200, 50);
        const initialY = scorePopup.y;
        
        effectSystem.update(0.1);
        
        if (scorePopup.y >= initialY) throw new Error('Score popup did not move upward');
    });
    
    // Test 9: Effect Cleanup by ID
    test('Effects can be removed by ID', () => {
        const effectSystem = new EffectSystem();
        const effect1 = effectSystem.addExplosion(100, 100);
        const effect2 = effectSystem.addExplosion(200, 200);
        
        const removed = effectSystem.removeEffectById(effect1.id);
        
        if (!removed) throw new Error('Effect removal failed');
        if (effectSystem.getActiveEffectCount() !== 1) throw new Error('Active effect count incorrect after removal');
    });
    
    // Test 10: Clear All Effects
    test('All effects can be cleared', () => {
        const effectSystem = new EffectSystem();
        effectSystem.addExplosion(100, 100);
        effectSystem.addDestruction(200, 200);
        effectSystem.addParticleBurst(300, 300);
        
        effectSystem.clearAllEffects();
        
        if (effectSystem.getActiveEffectCount() !== 0) throw new Error('Not all effects were cleared');
    });
    
    // Test 11: Max Effects Limit
    test('Max effects limit is enforced', () => {
        const effectSystem = new EffectSystem();
        const maxEffects = effectSystem.maxEffects;
        
        // Create more effects than the limit
        for (let i = 0; i < maxEffects + 5; i++) {
            effectSystem.addExplosion(i * 10, 100);
        }
        
        if (effectSystem.getActiveEffectCount() > maxEffects) {
            throw new Error('Max effects limit not enforced');
        }
    });
    
    // Test 12: Effect Count by Type
    test('Effect count by type works correctly', () => {
        const effectSystem = new EffectSystem();
        effectSystem.addExplosion(100, 100);
        effectSystem.addExplosion(200, 200);
        effectSystem.addDestruction(300, 300);
        
        const explosionCount = effectSystem.getEffectCountByType(effectSystem.effectTypes.EXPLOSION);
        const destructionCount = effectSystem.getEffectCountByType(effectSystem.effectTypes.DESTRUCTION);
        
        if (explosionCount !== 2) throw new Error(`Expected 2 explosions, got ${explosionCount}`);
        if (destructionCount !== 1) throw new Error(`Expected 1 destruction, got ${destructionCount}`);
    });
    
    // Test 13: Statistics Tracking
    test('Statistics are tracked correctly', () => {
        const effectSystem = new EffectSystem();
        const initialStats = effectSystem.getStats();
        
        effectSystem.addExplosion(100, 100);
        effectSystem.addDestruction(200, 200);
        
        const updatedStats = effectSystem.getStats();
        
        if (updatedStats.totalCreated <= initialStats.totalCreated) {
            throw new Error('Total created count not updated');
        }
        if (updatedStats.activeEffects !== 2) {
            throw new Error('Active effects count incorrect');
        }
    });
    
    // Test 14: Finished Effects Cleanup
    test('Finished effects are cleaned up automatically', (done) => {
        const effectSystem = new EffectSystem();
        const shortEffect = effectSystem.addExplosion(100, 100, { duration: 0.01 }); // 10ms duration
        
        // Wait for effect to finish and then update
        setTimeout(() => {
            effectSystem.update(0.1);
            
            if (effectSystem.getActiveEffectCount() !== 0) {
                throw new Error('Finished effects were not cleaned up');
            }
        }, 50);
    });
    
    // Test 15: Particle Life Decay
    test('Particle life decays over time', () => {
        const effectSystem = new EffectSystem();
        const explosion = effectSystem.addExplosion(100, 100);
        const particle = explosion.particles[0];
        const initialLife = particle.life;
        
        effectSystem.update(0.1);
        
        if (particle.life >= initialLife) throw new Error('Particle life did not decay');
    });
    
    console.log(`\n🎉 Test Results: ${passed}/${total} tests passed`);
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
    
    if (passed === total) {
        console.log('✅ All tests passed!');
        return true;
    } else {
        console.log('❌ Some tests failed!');
        return false;
    }
}

// Run the tests
runTests();