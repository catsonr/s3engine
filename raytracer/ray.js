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

    }

    // returns where ray is at time t 
    at(t) {
        return vec3.scaleAndAdd(vec3.create(), this.origin, this.direction, t);
    }

    hitsSphere() {
        const r = 1.0;
        const oc = vec3.fromValues(0, 0, 10);
        vec3.subtract(oc, oc, this.origin);

        const a = vec3.dot(this.direction, this.direction);
        const b = -2.0 * vec3.dot(this.direction, oc);
        const c = vec3.dot(oc, oc) - r * r;

        return b * b - 4 * a * c > 0;
    }
}