class Scene {
    constructor() {
        this.meshes = [];
        this.meshCount = 0;
    }

    addObj(obj) {
        this.meshes.push(obj);
        this.meshCount = this.meshes.length;
    }
}