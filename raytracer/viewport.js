class Viewport {
    constructor(camera, uCount, vCount) {
        this.camera = camera;

        this.width  = 1;
        this.height = 0.8;

        this.u = uCount;
        this.v = vCount;

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
        // view space coords of (i, j) on viewport
        const ndc = vec4.fromValues(
            (2 * i) / this.u - 1,
            -((2 * j) / this.v - 1),
            0,
            1 // homo
        );

        const p = vec4.create();
        // transforms p out of proj and into view space
        vec4.transformMat4(p, ndc, this.inverseProjMatrix);
        if(p[3] != 0) { // scales by w
            p[0] /= p[3];
            p[1] /= p[3];
            p[2] /= p[3];
            p[3] = 1;
        }
        // transforms p out of view and into world space 
        vec4.transformMat4(p, p, this.inverseViewMatrix);

        const raydir = vec3.fromValues(
            p[0],
            p[1],
            p[2],
        );
        raydir[0] -= this.camera.pos[0];
        raydir[1] -= this.camera.pos[1];
        raydir[2] -= this.camera.pos[2];

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
        const ycomponent = (ray.direction[1] + 1) * 0.5;
        //console.log(ycomponent);

        const color = [1, 1, 1, 1];

        ray.checkSphereIntersection();
        if(ray.hitResult.t != undefined && ray.hitResult.t > 0) {
            color[0] = 1 - 0.5 * (ray.hitResult.normal[0] + 1);
            color[1] = 1 - 0.5 * (ray.hitResult.normal[1] + 1);
            color[2] = 1 - 0.5 * (ray.hitResult.normal[2] + 1);

            return color;
        }

        color[0] = ycomponent;
        color[1] = ycomponent;
        color[2] = ycomponent;

        color[0] += (1 - ycomponent) * 0.5;
        color[1] += (1 - ycomponent) * 0.7;
        color[2] += (1 - ycomponent) * 1.0;

        return color;
    }

    // for each viewport position, simulate ray and save color
    sample() {
        mat4.invert(this.inverseViewMatrix, this.camera.viewMatrix);
        mat4.invert(this.inverseProjMatrix, this.camera.projMatrix);

        for(let j = 0; j < this.v; j++) {
            for(let i = 0; i < this.u; i++) {
                const ray = new Ray(i, j);
                const color = this.traceRay(ray);
                this.setSampleColor(i, j, color);
            }
        }
    }
}