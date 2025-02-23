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

        this.rotation = {
            X: 0,
            Y: 0,
            Z: 0,
        };

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

    setAxisRotation(axis, angle) {
        // there's definitely a better way of doing this
        if(axis == 'X') this.rotation.X = angle;
        else if(axis == 'Y') this.rotation.Y = angle;
        else this.rotation.Z = angle;

        this.generateInstanceMatrix(axis);
    }

    generateInstanceMatrix() {
        mat4.identity(this.matrix);

        mat4.rotateX(this.matrix, this.matrix, this.rotation.X);
        mat4.rotateY(this.matrix, this.matrix, this.rotation.Y);
        mat4.rotateZ(this.matrix, this.matrix, this.rotation.Z);

        mat4.translate(this.matrix, this.matrix, this.pos);
        mat4.scale(this.matrix, this.matrix, this.scale);
    }
}