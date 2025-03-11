class Camera {
    constructor(pos) {
        // camera angle stuff
        this.pitch = 0;
        this.yaw = Math.PI / 2; // rotate 90 to the right to start facing down +x

        // position of camera
        this.pos = pos;
        // normal vector of direction camera is pointing
        this.viewingDir = vec3.fromValues(
            Math.cos(this.pitch) * Math.cos(this.yaw),
            Math.sin(this.pitch),
            Math.cos(this.pitch) * Math.sin(this.yaw)
        );
        vec3.normalize(this.viewingDir, this.viewingDir);

        // point camera is looking at
        this.lookingAt = vec3.clone(pos);
        vec3.add(this.lookingAt, this.pos, this.viewingDir);

        // some constants
        this.up = vec3.fromValues(0, 1, 0);
        this.fov = (45 * Math.PI) / 180;
        this.aspectRatio = WIDTH / HEIGHT;
        this.zNear = 0.1;
        this.zFar = 1000.0;


        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();
        this.updateMatrices();
    }

    print() {
        console.log('pos : ', this.pos[0], this.pos[1], this.pos[2]);
        console.log('viewing angle : ', this.viewingDir[0], this.viewingDir[1], this.viewingDir[2]);
        console.log('looking at : ', this.lookingAt[0], this.lookingAt[1], this.lookingAt[2]);
        console.log('pitch / yaw : ', this.pitch, this.yaw);
        console.log('\n');
    }

    updateMatrices() {
        this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));

        this.viewingDir[0] = Math.cos(this.pitch) * Math.cos(this.yaw);
        this.viewingDir[1] = Math.sin(this.pitch);
        this.viewingDir[2] = Math.cos(this.pitch) * Math.sin(this.yaw);
        vec3.normalize(this.viewingDir, this.viewingDir);

        vec3.add(this.lookingAt, this.pos, this.viewingDir);

        mat4.lookAt(this.viewMatrix, this.pos, this.lookingAt, this.up);
        mat4.perspective(this.projMatrix, this.fov, this.aspectRatio, this.zNear, this.zFar);
    }
}

class Player {
    constructor(pos = [0, 0, 0]) {
        this.pos = vec3.fromValues(...pos);

        this.movementDir = vec3.create();
        this.movement = {
            W: false,
            A: false,
            S: false,
            D: false,
            up: false,
            down: false,
        };

        this.camera = new Camera(this.pos);

        // constants
        this.movementSpeed = 10.0;
        this.mouseSensitivity = 0.001;
    }

    processKeyPress(key) {
        key = key.toLowerCase();

        if(key == 'w') this.movement.W = true;
        if(key == 'a') this.movement.A = true;
        if(key == 's') this.movement.S = true;
        if(key == 'd') this.movement.D = true;

        if(key == ' ') this.movement.up   = true;
        if(key == 'shift') this.movement.down = true;
    }

    processKeyRelease(key) {
        key = key.toLowerCase();

        if(key == 'w') this.movement.W = false;
        if(key == 'a') this.movement.A = false;
        if(key == 's') this.movement.S = false;
        if(key == 'd') this.movement.D = false;

        if(key == ' ') this.movement.up   = false;
        if(key == 'shift') this.movement.down = false;
    }

    processMouseMove(event) {
        this.camera.pitch -= event.movementY * this.mouseSensitivity;
        this.camera.yaw += event.movementX * this.mouseSensitivity;
    }

    update(dt) {
        this.movementDir[2] = Number(this.movement.W) - Number(this.movement.S);
        this.movementDir[0] = Number(this.movement.A) - Number(this.movement.D);
        vec3.normalize(this.movementDir, this.movementDir);

        const forward = vec3.fromValues(
            Math.cos(this.camera.yaw),
            0,
            Math.sin(this.camera.yaw),
        );
        vec3.normalize(forward, forward);

        const right = vec3.fromValues(
            Math.sin(this.camera.yaw),
            0,
            -Math.cos(this.camera.yaw),
        );
        vec3.normalize(right, right);

        vec3.scale(forward, forward, this.movementDir[2] * this.movementSpeed * dt);
        vec3.scale(right, right, this.movementDir[0] * this.movementSpeed * dt);

        const move = vec3.create();
        vec3.add(move, forward, right);

        this.pos[0] += move[0];
        this.pos[1] += (Number(this.movement.up) - Number(this.movement.down)) / this.movementSpeed;
        this.pos[2] += move[2];

        vec3.copy(this.camera.pos, this.pos);
        this.camera.updateMatrices();
    }
}