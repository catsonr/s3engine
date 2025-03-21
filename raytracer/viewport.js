class Viewport {
    constructor(camera, uCount, vCount) {
        this.camera = camera;

        this.height = 1.0;
        this.width  = this.height * camera.aspectRatio;

        this.pixelSize = 8;
        this.u = Math.floor(uCount / this.pixelSize);
        this.v = Math.floor(vCount / this.pixelSize);

        this.stride = 4;
        this.samples = new Float32Array(this.u * this.v * this.stride);

        this.samplesPerPixel = 4;
        this.antialiasingFuzziness = 0.1;

        this.inverseViewMatrix = mat4.create();
        this.inverseProjMatrix = mat4.create();

        this.objects = [];
        this.objects.push(new Sphere({ pos: [0, -1001, 0], r: 1000, material: Material.materials.matte }));
        this.objects.push(new Sphere({ pos: [-1, 40, 2], r: 30, material: Material.materials.matte }));

        /*
        this.objects.push(new Sphere({ pos: [-2, -0.5, 6], r: 0.5, material: Material.materials.glass }));
        this.objects.push(new Sphere({ pos: [-3, 0, 7], r: 1, material: Material.materials.glass }));
        this.objects.push(new Sphere({ pos: [1, -1, 5], r: 2, material: Material.materials.metal }));
        */
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

    // calculates average color of given ray and its children
    // closest analog to shader code
    traceRay(ray, maxdepth=10) {
        if(maxdepth == 0) return [0, 0, 0, 1]; // out of bounces (energy?), black
        if(ray === null) return [0, 0, 0, 0];

        const color = [1, 1, 1, 1];

        // check ray against every sphere for intersection 
        for(let i = 0; i < this.objects.length; i++) {
            ray.checkSphereIntersection(this.objects[i]);
        }

        // if ray hit an object (assumed to be the closest)
        if(ray.hitResult.t != Infinity && ray.hitResult.t > 0.0) {
            const bounceRay = ray.hitResult.material.bounce(ray); // spawns new ray from hit (child)

            const bounceColor = this.traceRay(bounceRay, maxdepth - 1); // recursive call using new child ray
            const sphereColor = ray.hitResult.color;

            const attenuation = ray.hitResult.material.attenuation;
            color[0] = attenuation[0] * sphereColor[0] * bounceColor[0];
            color[1] = attenuation[1] * sphereColor[1] * bounceColor[1];
            color[2] = attenuation[2] * sphereColor[2] * bounceColor[2];
            color[3] = sphereColor[3] * bounceColor[3];

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
                    const uOffset = rand(0, 0.2);
                    const vOffset = rand(0, 0.2);

                    const ray = new Ray({ u: i, v: j, uOffset: uOffset, vOffset: vOffset });
                    const raycolor = this.traceRay(ray);
                    vec4.add(color, color, raycolor);

                    if(k === 0 && j === 0) {
                        if(ray.hitResult.spheresHit.length > 1) {
                            console.log(`ray hit ${ray.hitResult.spheresHit.length} spheres:`);
                            console.log(ray.hitResult);
                            console.log('\n');
                        }
                    }
                }

                vec4.scale(color, color, 1 / this.samplesPerPixel);
                this.setSampleColor(i, j, color);
            }
        }
    }
}