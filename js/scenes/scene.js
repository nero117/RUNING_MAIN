/**
 * 基础场景类 - 所有场景的基类
 */
class Scene {
    constructor(name) {
        this.name = name;
        this.isActive = false;
    }
    
    /**
     * 场景进入时调用
     */
    onEnter() {
        this.isActive = true;
    }
    
    /**
     * 场景退出时调用
     */
    onExit() {
        this.isActive = false;
    }
    
    /**
     * 更新场景
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        // 子类实现具体逻辑
    }
    
    /**
     * 渲染场景
     * @param {Renderer} renderer - 渲染器
     */
    render(renderer) {
        // 子类实现具体逻辑
    }
    
    /**
     * 处理输入
     * @param {InputHandler} inputHandler - 输入处理器
     */
    handleInput(inputHandler) {
        // 子类实现具体逻辑
    }
}