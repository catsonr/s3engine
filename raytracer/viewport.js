class Viewport {
    constructor(camera, uCount, vCount) {
        this.camera = camera;

        this.height = 1.0;
        this.width  = this.height * camera.aspectRatio;

        this.pixelSize = 8;
        this.u = Math.ceil(uCount / this.pixelSize);
        this.v = Math.ceil(vCount / this.pixelSize);

        this.stride = 4;
        this.samples = new Float32Array(this.u * this.v * this.stride);

        this.samplesPerPixel = 4;
        this.antialiasingFuzziness = 0.1;

        this.inverseViewMatrix = mat4.create();
        this.inverseProjMatrix = mat4.create();

        this.objects = [];
        this.objects.push(new Sphere({ pos: [1, -1, 5], r: 2, material: Material.materials.lambertian }));
        this.objects.push(new Sphere({ pos: [-2, -0.5, 6], r: 0.5, material: Material.materials.metal }));
        this.objects.push(new Sphere({ pos: [-3, 0, 7], r: 1, material: Material.materials.dielectric }));
        this.objects.push(new Sphere({ pos: [0, -101, 0], r: 100, material: Material.materials.lambertian }));
    }

    oneDtoTwoD(i, width = this.u) {
        const index = Math.floor(i / this.stride);

        return [index % width, Math.floor(index / width)];
    }
    twoDtoOneD(i, j, width = this.u) {
        return ( j * width + i ) * this.stride;
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

    // calculates sample color of given ray
    traceRay(ray, maxdepth=10) {
        if(maxdepth == 0) return [0, 0, 0, 1];

        const color = [1, 1, 1, 1];

        // check ray against every sphere for intersection 
        for(let i = 0; i < this.objects.length; i++) {
            ray.checkSphereIntersection(this.objects[i]);
        }

        // if ray hit an object (assumed to be the closest)
        if(ray.hitResult.t != Infinity && ray.hitResult.t > 0.001) {
            //const bounceRay = Material.materials.lambertian.bounce(ray);
            const bounceRay = ray.hitResult.material.bounce(ray);
            const bounceColor = this.traceRay(bounceRay, maxdepth - 1);
            const sphereColor = ray.hitResult.color;

            color[0] = 0.5 * sphereColor[0] * bounceColor[0];
            color[1] = 0.5 * sphereColor[1] * bounceColor[1];
            color[2] = 0.5 * sphereColor[2] * bounceColor[2];

            return color;
        }

        // no sphere hit, skybox gradient 
        const ycomponent = (ray.direction[1] + 1) * 0.5;
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
                const color = vec4.create();
                for(let k = 0; k < this.samplesPerPixel; k++) {
                    const ray = new Ray({ u: i, v: j });
                    const raycolor = this.traceRay(ray);
                    vec4.add(color, color, raycolor);
                }

                vec4.scale(color, color, 1 / this.samplesPerPixel);
                this.setSampleColor(i, j, color);
            }
        }
    }
}