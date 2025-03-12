class Viewport {
    constructor(camera, uCount, vCount) {
        this.camera = camera;

        this.height = 1.0;
        this.width  = this.height * camera.aspectRatio;

        this.pixelSize = 4;
        this.u = Math.ceil(uCount / this.pixelSize);
        this.v = Math.ceil(vCount / this.pixelSize);

        this.stride = 4;
        this.samples = new Float32Array(this.u * this.v * this.stride);

        this.inverseViewMatrix = mat4.create();
        this.inverseProjMatrix = mat4.create();

        this.objects = [];
        this.objects.push(new Sphere([-3, 0, 7], 1));
        this.objects.push(new Sphere([1, -1, 5], 2));
        this.objects.push(new Sphere([-2, -0.5, 6], 0.5));
        this.objects.push(new Sphere([0, -101, 0], 100));
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

        for(let i = 0; i < this.objects.length; i++) {
            ray.checkSphereIntersection(this.objects[i]);
        }

        if(ray.hitResult.t != Infinity) {
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

    // for each viewport position, trace ray and save color
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