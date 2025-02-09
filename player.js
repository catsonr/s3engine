class Camera {
    constructor(pos) {
        // position of camera
        this.pos = pos; 

        // normal vector of direction camera is pointing
        this.viewingAngle = vec3.fromValues(0, 0, 1);

        // point camera is looking at
        this.lookingAt = vec3.clone(pos);
        vec3.add(this.lookingAt, this.pos, this.viewingAngle);

        // some constants
        this.up = vec3.fromValues(0, 1, 0);
        this.fov = (45 * Math.PI) / 180;
        this.aspectRatio = WIDTH / HEIGHT;
        this.zNear = 0.1;
        this.zFar = 100.0;

        // camera angle stuff
        this.pitch = 0;
        this.yaw   = 0;
    }

    update(gl, viewMatrixLocation, viewMatrix) {
        setVec3RotationX(this.viewingAngle, this.viewingAngle, this.pitch);
        setVec3RotationY(this.viewingAngle, this.viewingAngle, this.yaw);

        vec3.copy(this.lookingAt, this.pos);
        vec3.add(this.lookingAt, this.lookingAt, this.viewingAngle);

        // constructs view matrix according to position, point camera is looking at, and what direction is 'up'
        mat4.lookAt(viewMatrix, this.pos, this.lookingAt, this.up);

        // sends view matrix to shader
        gl.uniformMatrix4fv(viewMatrixLocation, gl.FALSE, viewMatrix);
    }
}

class Player {
    constructor(x = 0, y = 0, z = -10) {
        this.pos = vec3.fromValues(x, y, z);
        this.movement = {
            W: false,
            A: false,
            S: false,
            D: false,
        };

        this.camera = new Camera(this.pos);

        // constants
        this.movementSpeed = 1.0;
        this.mouseSensitivity = 0.001;
    }

    processKeyPress(key) {
        if(key == 'w') {
            this.movement.W = true;
        }
        if(key == 'a') {
            this.movement.A = true;
        }
        if(key == 's') {
            this.movement.S = true;
        }
        if(key == 'd') {
            this.movement.D = true;
        }
    }

    processKeyRelease(key) {
        if(key == 'w') {
            this.movement.W = false;
        }
        if(key == 'a') {
            this.movement.A = false;
        }
        if(key == 's') {
            this.movement.S = false;
        }
        if(key == 'd') {
            this.movement.D = false;
        }
    }

    processMouseMouse(event) {
        this.camera.pitch += event.movementY * this.mouseSensitivity;
        this.camera.yaw   += event.movementX * this.mouseSensitivity;
    }

    update(dt) {
    }
}