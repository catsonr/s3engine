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
        this.rotation = quat.create();

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

    setAxisRotation(angleX, angleY, angleZ) {
        const qx = quat.create();
        const qy = quat.create();
        const qz = quat.create();

        quat.setAxisAngle(qx, [1, 0, 0], angleX);
        quat.setAxisAngle(qy, [0, 1, 0], angleY);
        quat.setAxisAngle(qz, [0, 0, 1], angleZ);

        quat.multiply(this.rotation, qx, qy);
        quat.multiply(this.rotation, this.rotation, qz);

        this.generateInstanceMatrix();
    }

    addAxisRotation(axis, angle) {
        const q = quat.create();
        quat.setAxisAngle(q, axis, angle);
        quat.multiply(this.rotation, this.rotation, q);

        this.generateInstanceMatrix();
    }

    generateInstanceMatrix() {
        mat4.identity(this.matrix);

        const rotationMatrix = mat4.create();
        mat4.fromQuat(rotationMatrix, this.rotation);
        mat4.multiply(this.matrix, this.matrix, rotationMatrix);

        mat4.translate(this.matrix, this.matrix, this.pos);
        mat4.scale(this.matrix, this.matrix, this.scale);
    }
}