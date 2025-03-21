// TO-DO : premultiply color values

class Ray {
    static viewport = null;

    constructor({u=undefined, v=undefined, uoffset=0, voffset=0, origin=null, direction=null} = {}) {
        this.u = u;
        this.v = v;
        this.uOffset = uoffset;
        this.vOffset = voffset;

        // rays with origins that are less than clipDistance away from other ray origins are ignored
        // i.e., rays are not expected to originate close to objects -> do not have camera close to objects, nor objects close to other objects
        this.clipDistance = 2 >> 2;

        if(Ray.viewport === null) {
            console.warn(`ray (${this.u}, ${this.v}) created before viewport was set!`);
        }

        this.origin = null;
        if(origin === null) { // no origin specified, starting ray at camera position
            this.origin = vec3.fromValues(...Ray.viewport.camera.pos);
        } else {
            this.origin = origin;
        }

        this.direction = null;
        if(direction === null) { // no direction specified, getting direction from uv coords
            this.direction = this.calculateInitialDirection();
        } else {
            this.direction = direction;
        }
        // normalize direction, just in case
        vec3.normalize(this.direction, this.direction);

        // data saved as output when ray htis sphere
        this.hitResult = {
            // minimum data required for raytracer to work
            pos: vec3.create(),
            normal: vec3.create(),
            t: Infinity,
            color: vec4.create(),
            material: undefined, // should probably index this l8r
            inside: false,

            // debug data, should not be used in calculations
            spheresHit: [],
        };
    }

    calculateInitialDirection() {
        if(this.u === undefined || this.v === undefined) {
            console.warn(`unable to calculate ray initial direction. ray initialized with no uv coordinate!`);
            return null;
        }

        // view space coords on viewport
        const ndc = vec4.fromValues(
            (2 * (this.u + this.uOffset)) / Ray.viewport.u - 1,
            -((2 * (this.v + this.vOffset)) / Ray.viewport.v - 1),
            0,
            1 // homo (w)
        );

        const p = vec4.create();
        // transforms p out of proj space and into view space
        vec4.transformMat4(p, ndc, Ray.viewport.inverseProjMatrix);
        if (p[3] != 0) { // scales by w
            p[0] /= p[3];
            p[1] /= p[3];
            p[2] /= p[3];
            p[3] = 1;
        }
        // transforms p out of view space and into world space 
        vec4.transformMat4(p, p, Ray.viewport.inverseViewMatrix);

        const raydir = vec3.fromValues(
            p[0],
            p[1],
            p[2],
        );
        raydir[0] -= Ray.viewport.camera.pos[0];
        raydir[1] -= Ray.viewport.camera.pos[1];
        raydir[2] -= Ray.viewport.camera.pos[2];

        vec3.normalize(raydir, raydir);
        return raydir;
    }

    // returns where ray is at time t 
    at(t) {
        const p = vec3.create();
        vec3.scaleAndAdd(p, this.origin, this.direction, t);
        return p;
    }

    // sets hitResult based on if it hits the sphere or not
    checkSphereIntersection(sphere) {
        const r = sphere.r;

        const rayoriginToSphere = vec3.clone(sphere.pos);
        vec3.subtract(rayoriginToSphere, rayoriginToSphere, this.origin);

        const a = vec3.dot(this.direction, this.direction);
        const h = vec3.dot(this.direction, rayoriginToSphere);
        const c = vec3.dot(rayoriginToSphere, rayoriginToSphere) - r*r;
        const discriminant = h*h - a*c;

        if (discriminant >= 0) { // real solutions -> hits sphere 
            const t = (h - Math.sqrt(discriminant)) / a;
            this.hitResult.spheresHit.push(sphere);

            if (t < this.hitResult.t && t > this.clipDistance) { // this sphere is current closest
                this.hitResult.t = t;
                this.hitResult.pos = this.at(t);
                this.hitResult.color = vec4.fromValues(...sphere.color, 1);
                this.hitResult.material = sphere.material;

                const n = vec3.subtract(vec3.create(), this.hitResult.pos, sphere.pos);
                vec3.normalize(n, n);
                this.hitResult.normal = n;

                // if dot(dir, normal) > 0, ray is facing same direction as normal -> inside the sphere
                this.hitResult.inside = vec3.dot(this.direction, this.hitResult.normal) > 0.0;
                if(this.hitResult.inside) {
                    console.log('this ray is from the inside of a sphere!!!');
                }
            }
        }
    }
}