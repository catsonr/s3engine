class Viewport {
    constructor(camera) {
        this.camera = camera;

        this.width  = 1;
        this.height = 0.8;

        this.u = 180;
        this.v = 100;

        this.stride = 4;
        this.samples = new Float32Array(this.u * this.v * this.stride);

        this.inverseViewMatrix = mat4.create();
        this.inverseProjMatrix = mat4.create();
    }

    oneDtoTwoD(i, width = this.u) {
        const index = Math.floor(i / this.stride);

        return [index % width, Math.floor(index / width)];
    }
    twoDtoOneD(i, j, width = this.u) {
        return ( j * width + i ) * this.stride;
    }
    
    // uv coords of (i, j) to ray from camera position to corresponding viewport location
    // direction is not normalized
    twoDtoRayDir(i, j) {
        mat4.invert(this.inverseViewMatrix, this.camera.viewMatrix);
        mat4.invert(this.inverseProjMatrix, this.camera.projMatrix);

        const ndc = vec4.fromValues(
            (2 * i) / this.u - 1,
            -((2 * j) / this.v - 1),
            -1, // assumes on near plane 
            1 // homogenous coordinate
        );

        const pView = vec4.create();
        vec4.transformMat4(pView, ndc, this.inverseProjMatrix);
        if(pView[3] != 0) {
            pView[0] /= pView[3];
            pView[1] /= pView[3];
            pView[2] /= pView[3];
        }

        const rayDirWorld = vec4.create();
        vec4.transformMat4(rayDirWorld, pView, this.inverseViewMatrix)
        
        const raydir = vec3.fromValues(rayDirWorld[0], rayDirWorld[1], rayDirWorld[2]);
        vec3.normalize(raydir, raydir);

        return raydir;
    }

    getSampleColor(i, j) {
        const _i = this.twoDtoOneD(i, j);

        return [this.samples[_i + 0], this.samples[_i + 1], this.samples[_i + 2], this.samples[_i + 3]];
    }
    setSampleColor(i, j, color) {
        const _i = this.twoDtoOneD(i, j);

        this.samples[_i + 0] = color[0];
        this.samples[_i + 1] = color[1];
        this.samples[_i + 2] = color[2];
        this.samples[_i + 3] = color[3];
    }

    // calculates sample color of ray
    traceRay(ray) {
        return [1 - Number(ray.hitsSphere()), 0.5, 1, 1];
    }

    // for each viewport position, simulate ray and save color
    sample() {
        for(let j = 0; j < this.v; j++) {
            for(let i = 0; i < this.u; i++) {
                const ray = new Ray(i, j);
                const color = this.traceRay(ray);
                this.setSampleColor(i, j, color);
            }
        }
    }
}