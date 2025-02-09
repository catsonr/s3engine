class Camera {
    constructor(pos, lookingAt) {
        this.pos = pos; 
        this.lookingAt = lookingAt;

        this.up = [0, 1, 0];

        this.fov = (45 * Math.PI) / 180;
        this.aspectRatio = WIDTH / HEIGHT;
        this.zNear = 0.1;
        this.zFar = 100.0;
    }

    update(gl, viewMatrixLocation, viewMatrix) {
        mat4.lookAt(viewMatrix, this.pos, this.lookingAt, this.up);
        gl.uniformMatrix4fv(viewMatrixLocation, gl.FALSE, viewMatrix);
    }
}

class Player {
    constructor(x = 0, y = 0, z = -20) {
        this.pos = [x, y, z];
        this.lookingAt = [x, y, z + 1];
        this.movement = {
            W: false,
            A: false,
            S: false,
            D: false,
        };

        this.viewingAngle = {
            horizontal: 0,
            vertical:   0,
        }
        this.camera = new Camera(this.pos, this.lookingAt);

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
        this.viewingAngle.vertical   += -event.movementY * this.mouseSensitivity;
        this.viewingAngle.horizontal += -event.movementX * this.mouseSensitivity;

        if(this.viewingAngle.vertical >= Math.PI / 2) this.viewingAngle.vertical = Math.PI / 2;
        else if(this.viewingAngle.vertical <= -Math.PI / 2) this.viewingAngle.vertical = -Math.PI / 2;
    }

    update(dt) {
    }
}