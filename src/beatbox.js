class BeatBox extends Obj {
    constructor() {
        super();

        this.lastDown = {x: 0, y: 0, t: 0};

        this.mouseSensitivity = 0.005;
        this.clamp = 50.0;
    }

    processMouseDown(event) {
        this.lastDown.x = event.screenX;
        this.lastDown.y = event.screenY;
        this.lastDown.t = event.timeStamp;
    }

    processMouseUp(event) {
        let dx = event.screenX - this.lastDown.x;
        let dy = event.screenY - this.lastDown.y;
        let dt = event.timeStamp - this.lastDown.t;

        if(Math.abs(dx) < this.clamp) dx = 0;
        if(Math.abs(dy) < this.clamp) dy = 0;

        const q = this.getRotationQuat(dx, dy, dt);
        this.addRotationFromQuat(q);
    }

    // this will add the angles the quaternion describes to beatbox' rotation angle values
    // i.e., you must use this quat if you generate it
    getRotationQuat(dx, dy, dt) {
        const dampenFactor = 0.10;
        const angleX = dx * this.mouseSensitivity * dampenFactor;
        const angleY = -dy * this.mouseSensitivity * dampenFactor;

        const localUp = vec3.fromValues(0, 1, 0);
        vec3.transformQuat(localUp, localUp, this.rotation.quat);

        const localRight = vec3.fromValues(1, 0, 0);
        vec3.transformQuat(localRight, localRight, this.rotation.quat);

        const qLocalUp = quat.setAxisAngle(quat.create(), localUp, angleX);
        const qLocalRight = quat.setAxisAngle(quat.create(), localRight, angleY);

        return quat.multiply(quat.create(), qLocalUp, qLocalRight);
    }
}