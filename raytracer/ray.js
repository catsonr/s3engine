class Ray {
    static viewport = null;

    constructor(u, v) {
        this.u = u;
        this.v = v;
        if(Ray.viewport === null) {
            console.warn(`ray (${this.u}, ${this.v}) created before viewport was set!`);
        }
        this.origin = vec3.fromValues(...Ray.viewport.camera.pos);

        this.direction = Ray.viewport.twoDtoRayDir(this.u, this.v);
        vec3.normalize(this.direction, this.direction);

        this.hitResult = {
            sampled: false,
            pos: vec3.create(),
            normal: vec3.create(),
            t: undefined,
        };
    }

    initHitResults() {
        this.hitResult.sampled = false;

        this.hitResult.pos[0] = 0;
        this.hitResult.pos[1] = 0;
        this.hitResult.pos[2] = 0;

        this.hitResult.normal[0] = 0;
        this.hitResult.normal[1] = 0;
        this.hitResult.normal[2] = 0;

        this.hitResult.t = undefined;
    }

    // returns where ray is at time t 
    at(t) {
        const p = vec3.create();
        vec3.scaleAndAdd(p, this.origin, this.direction, t);
        return p;

        //return vec3.scaleAndAdd(vec3.create(), this.origin, this.direction, t);
    }

    // sets hitResult based on if it hits the sphere or not
    checkSphereIntersection() {
        const sphereCenter = vec3.fromValues(0, 0, 3);
        const r = 1.0;

        const rayoriginToSphere = vec3.clone(sphereCenter);
        rayoriginToSphere[0] -= this.origin[0];
        rayoriginToSphere[1] -= this.origin[1];
        rayoriginToSphere[2] -= this.origin[2];

        const a = Math.min( vec3.dot(this.direction, this.direction), 1 );
        const h = vec3.dot(this.direction, rayoriginToSphere);
        const c = Math.min( vec3.dot(rayoriginToSphere, rayoriginToSphere) ) - r*r;
        const discriminant = h*h - a*c;

        if(discriminant >= 0) { // real solutions -> hits sphere 
            this.hitResult.t = (h - Math.sqrt(discriminant)) / a;
            this.hitResult.pos = this.at(this.hitResult.t);

            const n = vec3.subtract(vec3.create(), this.hitResult.pos, sphereCenter);
            vec3.normalize(n, n);
            this.hitResult.normal = n;
        } else { // complex solutions -> misses sphere
            this.hitResult.t = undefined;
        }

        this.hitResult.sampled = true;
    }
}