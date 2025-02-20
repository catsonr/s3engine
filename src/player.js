class Camera {
    constructor(pos) {
        // position of camera
        this.pos = pos; 

        // normal vector of direction camera is pointing
        this.viewingDir = vec3.fromValues(0, 0, 1);

        // point camera is looking at
        this.lookingAt = vec3.clone(pos);
        vec3.add(this.lookingAt, this.pos, this.viewingDir);

        // some constants
        this.up = vec3.fromValues(0, 1, 0);
        this.fov = (45 * Math.PI) / 180;
        this.aspectRatio = WIDTH / HEIGHT;
        this.zNear = 0.1;
        this.zFar = 1000.0;

        // camera angle stuff
        this.pitch = 0;
        this.yaw   = 0;
    }

    print() {
        console.log('pos : ', this.pos[0], this.pos[1], this.pos[2]);
        console.log('viewing angle : ', this.viewingDir[0], this.viewingDir[1], this.viewingDir[2]);
        console.log('looking at : ', this.lookingAt[0], this.lookingAt[1], this.lookingAt[2]);
        console.log('pitch / yaw : ', this.pitch, this.yaw);
        console.log('\n');
    }

    update(gl, viewMatrixLocation, viewMatrix) {
        // prevent from tilting camera too low or too high
        if(this.pitch >= Math.PI / 2) this.pitch = Math.PI / 2;
        else if(this.pitch <= -Math.PI / 2) this.pitch = -Math.PI / 2;

        // rotate camera based on pitch and yaw 
        setVec3RotationX(this.viewingDir, this.viewingDir, this.pitch);
        setVec3RotationY(this.viewingDir, this.viewingDir, this.yaw);
        vec3.normalize(this.viewingDir, this.viewingDir);

        // find new lookingAt vector
        vec3.copy(this.lookingAt, this.pos);
        vec3.add(this.lookingAt, this.lookingAt, this.viewingDir);

        // constructs view matrix according to position, point camera is looking at, and what direction is 'up'
        mat4.lookAt(viewMatrix, this.pos, this.lookingAt, this.up);

        // sends view matrix to shader
        gl.uniformMatrix4fv(viewMatrixLocation, gl.FALSE, viewMatrix);
    }
}

class Player {
    constructor(x = 0, y = 0, z = 0) {
        this.pos = vec3.fromValues(x, y, z);

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
        this.movementSpeed = 50.0;
        this.mouseSensitivity = 0.001;
    }

    processKeyPress(key) {
        if(key == 'w') {
            this.movement.W = true;
        }
        else if(key == 'a') {
            this.movement.A = true;
        }
        else if(key == 's') {
            this.movement.S = true;
        }
        else if(key == 'd') {
            this.movement.D = true;
        }

        else if(key == ' ') this.movement.up = true;
        else if(key == 'Shift') this.movement.down = true;
    }

    processKeyRelease(key) {
        if(key == 'w') {
            this.movement.W = false;
        }
        else if(key == 'a') {
            this.movement.A = false;
        }
        else if(key == 's') {
            this.movement.S = false;
        }
        else if(key == 'd') {
            this.movement.D = false;
        }

        else if(key == ' ') this.movement.up = false;
        else if(key == 'Shift') this.movement.down = false;
    }

    processMouseMouse(event) {
        this.camera.pitch -= event.movementY * this.mouseSensitivity;
        this.camera.yaw   -= event.movementX * this.mouseSensitivity;
    }

    update(dt) {
        this.movementDir[2] = Number(this.movement.W) - Number(this.movement.S);
        this.movementDir[0] = Number(this.movement.A) - Number(this.movement.D);
        vec3.normalize(this.movementDir, this.movementDir);

        const forward = vec3.create();
        vec3.scale(forward, this.camera.viewingDir, this.movementDir[2] * this.movementSpeed * dt);

        const right = vec3.create();
        vec3.cross(right, this.camera.up, this.camera.viewingDir);
        vec3.normalize(right, right);
        vec3.scale(right, right, this.movementDir[0] * this.movementSpeed * dt);

        const move = vec3.create();
        vec3.add(move, forward, right);
        
        // TODO: normalize ignoring Y component
        this.pos[0] += move[0];
        this.pos[2] += move[2];

        this.pos[1] += Number(this.movement.up) - Number(this.movement.down);
    }
}