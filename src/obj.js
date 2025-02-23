class Obj {
    static objs = new Map();
    static objPaths = [];

    static async loadObj(path) {
        if (this.objs.has(path)) {
            return this.objs.get(path);
        }

        const obj = await getObjData(path);
        this.objs.set(path, obj);
        this.objPaths.push(path);

        //console.log('Obj: \'' + path + '\' loaded');
        return this.objs.get(path);
    }

    constructor(pos = [0, 0, 0], scale = [1, 1, 1]) {
        this.pos = vec3.fromValues(...pos);
        this.scale = vec3.fromValues(...scale);

        this.matrix = mat4.create();
        this.generateInstanceMatrix();

        this.source = '';
        this.data = null;
    }

    update(dt) {

    }

    setObjData(path) {
        this.source = path;
        this.data = Obj.objs.get(this.source);
    }

    setPos(pos = [0, 0, 0]) {
        vec3.copy(this.pos, pos);

        this.generateInstanceMatrix();
    }

    setScale(scale = [1, 1, 1]) {
        vec3.copy(this.scale, scale);
        
        this.generateInstanceMatrix();
    }

    setAxisRotation(angle, axis) {
        mat4.fromRotation(this.matrix, angle, axis);
    }

    generateInstanceMatrix() {
        mat4.identity(this.matrix);
        mat4.translate(this.matrix, this.matrix, this.pos);
        mat4.scale(this.matrix, this.matrix, this.scale);
    }
}