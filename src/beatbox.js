class BeatBox extends Obj {
    constructor() {
        super();

        this.lastDown = {x: 0, y: 0, t: 0};
        this.mouseDown = false;

        this.mouseSensitivity = 0.005;
        this.clamp = 50.0;
    }

    processMouseDown(event) {
        this.lastDown.x = event.clientX;
        this.lastDown.y = event.clientY;
        this.lastDown.t = event.timeStamp;

        this.mouseDown = true;
    }

    processMouseUp(event) {
        this.mouseDown = false;
    }

    processMouseMove(event) {
        if(this.mouseDown) {
            const q = this.calculateArcballDeltaQuat([this.lastDown.x, this.lastDown.y], [event.clientX, event.clientY]);
            this.addRotationFromQuat(q);

            this.lastDown.x = event.clientX;
            this.lastDown.y = event.clientY;
            this.lastDown.t = event.timeStamp;
        }
    }

    // takes in screen coordinates (2d) and returns corresponding point on arcball (3d)
    // assumes the arcball is centered on the screen 
    screenPosToArcballPos(screenPos = []) {
        const r = 1;
        const rSquared = r * r;

        let x = (2 * screenPos[0] - WIDTH) / WIDTH;
        let y = (2 * screenPos[1] - HEIGHT) / HEIGHT;
        let z = 0;

        const lengthSquared = x * x + y * y;
        if(lengthSquared <= rSquared / 2) {
            z = Math.sqrt(rSquared - x * x - y * y);
        }
        else {
            z = (rSquared / 2) / Math.sqrt(lengthSquared);
        }

        return vec3.fromValues(x, y, z);
    }

    calculateArcballDeltaQuat(initialScreenPos, currentScreenPos) {
        const v0 = this.screenPosToArcballPos(initialScreenPos);
        const v1 = this.screenPosToArcballPos(currentScreenPos);

        const angleDampenFactor = 1;

        const rotationAxis = vec3.create();
        vec3.cross(rotationAxis, v0, v1);
        vec3.normalize(rotationAxis, rotationAxis);

        const dot = Math.min(1, Math.max(-1, vec3.dot(v0, v1)));
        const angle = Math.acos(dot) * angleDampenFactor;

        return quat.setAxisAngle(quat.create(), rotationAxis, angle);
    }
}