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
        this.rotationQuat = quat.create();

        this.matrix = mat4.create();
        this.generateInstanceMatrix();

        this.source = '';
        this.data = null;

        this.color = [Math.random(), Math.random(), Math.random()];
        this.alpha = 1.0;
        this.transparent = false;

        this.scene = null;
        this.sceneObjIndex = undefined;
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

    setAlpha(alpha) {
        this.alpha = alpha;
        this.transparent = this.alpha < 1.0;
        this.scene.setObjTransparency(this);
    }

    /* doesnt work 
    setRotation(angleX = 0, angleY = 0, angleZ = 0) {
        const qx = quat.create();
        const qy = quat.create();
        const qz = quat.create();

        quat.setAxisAngle(qx, [1, 0, 0], angleX);
        quat.setAxisAngle(qy, [0, 1, 0], angleY);
        quat.setAxisAngle(qz, [0, 0, 1], angleZ);

        quat.multiply(this.rotationQuat, qx, qy);
        quat.multiply(this.rotationQuat, this.rotationQuat, qz);

        this.generateInstanceMatrix();
    }
    */

    addRotation(axis = [0, 0, 0], angle = 0) {
        const q = quat.create();
        quat.setAxisAngle(q, axis, angle);
        quat.multiply(this.rotationQuat, this.rotationQuat, q);

        this.generateInstanceMatrix();
    }

    addRotationFromQuat(q) {
        quat.multiply(this.rotationQuat, this.rotationQuat, q);

        this.generateInstanceMatrix();
    }

    // this multiplication order is "backwards", but it makes the arcball work. just FYI .
    addRotationFromQuatREVERSE(q) {
        quat.multiply(this.rotationQuat, q, this.rotationQuat);

        this.generateInstanceMatrix();
    }

    generateInstanceMatrix() {
        mat4.identity(this.matrix);

        mat4.translate(this.matrix, this.matrix, this.pos);

        const rotationMatrix = mat4.create();
        mat4.fromQuat(rotationMatrix, this.rotationQuat);
        mat4.multiply(this.matrix, this.matrix, rotationMatrix);

        mat4.scale(this.matrix, this.matrix, this.scale);
    }
}