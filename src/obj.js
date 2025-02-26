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

        this.rotation = { x: 0, y: 0, z: 0, quat: quat.create()};

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

    setRotation(angleX = 0, angleY = 0, angleZ = 0) {
        this.rotation.x = angleX;
        this.rotation.y = angleY;
        this.rotation.z = angleZ;

        const qx = quat.create();
        const qy = quat.create();
        const qz = quat.create();

        quat.setAxisAngle(qx, [1, 0, 0], this.rotation.x);
        quat.setAxisAngle(qy, [0, 1, 0], this.rotation.y);
        quat.setAxisAngle(qz, [0, 0, 1], this.rotation.z);

        quat.multiply(this.rotation.quat, qx, qy);
        quat.multiply(this.rotation.quat, this.rotation.quat, qz);

        this.generateInstanceMatrix();
    }

    addRotation(axis = [0, 0, 0], angle = 0) {
        this.rotation.x += angle * axis[0];
        this.rotation.y += angle * axis[1];
        this.rotation.z += angle * axis[2];

        const q = quat.create();
        quat.setAxisAngle(q, axis, angle);
        quat.multiply(this.rotation.quat, this.rotation.quat, q);

        this.generateInstanceMatrix();
    }

    // TODO: find way to add quaternion's angle to obj's angle
    // this multiplication order is "backwards", but it makes the arcball work. just FYI .
    addRotationFromQuat(q, angleX = undefined, angleY = undefined, angleZ = undefined) {
        if(angleX == undefined || angleY == undefined || angleZ == undefined) {
            console.warn('new quat not included in obj rotation angles');
        }
        else {
            this.rotation.x += angleX;
            this.rotation.y += angleY;
            this.rotation.z += angleZ;
        }

        quat.multiply(this.rotation.quat, q, this.rotation.quat);

        this.generateInstanceMatrix();
    }

    generateInstanceMatrix() {
        mat4.identity(this.matrix);

        mat4.translate(this.matrix, this.matrix, this.pos);

        const rotationMatrix = mat4.create();
        mat4.fromQuat(rotationMatrix, this.rotation.quat);
        mat4.multiply(this.matrix, this.matrix, rotationMatrix);

        mat4.scale(this.matrix, this.matrix, this.scale);
    }
}