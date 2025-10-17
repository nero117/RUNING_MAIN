/**
 * 场景管理器
 */
class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
    }
    
    /**
     * 添加场景
     * @param {string} name - 场景名称
     * @param {Scene} scene - 场景对象
     */
    addScene(name, scene) {
        this.scenes.set(name, scene);
    }
    
    /**
     * 切换到指定场景
     * @param {string} name - 场景名称
     */
    switchScene(name) {
        const newScene = this.scenes.get(name);
        if (!newScene) {
            console.error(`场景 "${name}" 不存在`);
            return;
        }
        
        // 退出当前场景
        if (this.currentScene) {
            this.currentScene.onExit();
        }
        
        // 切换到新场景
        this.currentScene = newScene;
        this.currentScene.onEnter();
        
        console.log(`切换到场景: ${name}`);
    }
    
    /**
     * 获取当前场景
     * @returns {Scene} 当前场景
     */
    getCurrentScene() {
        return this.currentScene;
    }
    
    /**
     * 更新当前场景
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }
    }
    
    /**
     * 渲染当前场景
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        if (this.currentScene) {
            this.currentScene.render(renderer);
        }
    }
}