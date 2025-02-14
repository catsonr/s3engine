class Obj {
    static objs = new Map();

    static async loadObj(path) {
        if (this.objs.has(path)) {
            return this.objs.get(path);
        }

        const obj = await getObjData(path);
        this.objs.set(path, obj);

        return this.objs.get(path);
    }

    constructor(pos = [0, 0, 0], scale = [1, 1, 1]) {
        this.pos = vec3.fromValues(...pos);
        this.scale = vec3.fromValues(...scale);

        this.matrix = mat4.create();
        mat4.identity(this.matrix);
        mat4.translate(this.matrix, this.matrix, this.pos);
        mat4.scale(this.matrix, this.matrix, this.scale);

        this.source = '';
        this.data = null;
    }

    setObjData(path) {
        this.source = path;
        this.data = Obj.objs.get(this.source);
    }
}