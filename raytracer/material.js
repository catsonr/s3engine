class Material {
    static materials = {};
    static materialCount = 0;

    constructor() {
        if(this.constructor === Material) {
            console.error(`Material is an abstract class and should not be instantiated`);
        }
        else {
            this.index = Material.materialCount;
            Material.materialCount++;
        }
    }

    // how each material spawns a new ray at hit location
    // i.e., how the material affects light and makes it bounce off
    bounce(ray) {
        console.error(`material does not override bounce()`);

        // bounce() should end with this. or something similar if need be. just return a new Ray please 
        //return new Ray({ origin: ray.hitResult.pos, direction: bounceDir });
    }

    static reflect(v, n) {
        // reflected = v - 2*dot(v,n)*n;

        const reflected = vec3.clone(v);
        const dot = vec3.dot(v, n);

        reflected[0] -= 2 * dot * n[0];
        reflected[1] -= 2 * dot * n[1];
        reflected[2] -= 2 * dot * n[2];

        return reflected;
    }

    static refract(v, n, refractionIndex) {
        // refracted_perpendicular = etai/etat * (v + dot(-v, n)*n)
        // refracted_parallel      = -sqrt(1 - |refracted_perpendicular|^2) * n

        const refractedPerpendicular = vec3.create();
        const dot = vec3.dot(vec3.negate(vec3.create(), v), n);
        refractedPerpendicular[0] = refractionIndex * (v[0] + dot * n[0]);
        refractedPerpendicular[1] = refractionIndex * (v[1] + dot * n[1]);
        refractedPerpendicular[2] = refractionIndex * (v[2] + dot * n[2]);

        const refractedParallel = vec3.clone(n);
        const sqrtTerm = Math.sqrt(Math.max(0, 1 - vec3.dot(refractedPerpendicular, refractedPerpendicular)));
        vec3.scale(refractedParallel, n, -sqrtTerm);

        const refractDir = vec3.create();
        vec3.add(refractDir, refractedPerpendicular, refractedParallel);
    
        return refractDir;
    }
}

class Matte extends Material {
    constructor({name=undefined} = {}) {
        super();

        if(name !== undefined) Material.materials[name] = this;
        else Material.materials['matte'] = this;
    }

    bounce(ray) {
        // ray bounces in direction of normal+randomUnitVector (normalized), this distibutes the light (somewhat) randomly
        const bounceDir = randomUnitVectorOnHemisphere(ray.hitResult.normal);
        vec3.add(bounceDir, ray.hitResult.normal, bounceDir);

        // it is possible for the random unit vector to be opposite the normal, resulting in a zero vector
        // if this occurs, just make bounceDir the normal
        if(vec3NearZero(bounceDir)) {
            bounceDir = ray.hitResult.normal;
        } else { // otherwise, normalize bounceDir
            vec3.normalize(bounceDir, bounceDir);
        }

        return new Ray({ origin: ray.hitResult.pos, direction: bounceDir });
    }
}

class Metal extends Material {
    constructor({ name=undefined, fuzziness=0.1 } = {}) {
        super();

        if(name !== undefined) Material.materials[name] = this;
        else Material.materials['metal'] = this;

        this.fuzziness = fuzziness;
    }


    bounce(ray) {
        // metal bounces ray right off material
        const bounceDir = Material.reflect(ray.direction, ray.hitResult.normal);
        if(this.fuzziness != 0.0) {
            const ruv = randomUnitVector();
            bounceDir[0] += ruv[0] * this.fuzziness;
            bounceDir[1] += ruv[1] * this.fuzziness;
            bounceDir[2] += ruv[2] * this.fuzziness;
        }

        return new Ray({ origin: ray.hitResult.pos, direction: bounceDir });
    }
}

class Glass extends Material {
    constructor({ name=undefined, refractionIndex=10 } = {}) {
        super();

        if(name !== undefined) Material.materials[name] = this;
        else Material.materials['glass'] = this;

        this.refractionIndex = refractionIndex;
    }

    bounce(ray) {
        // setting refraction index based on if ray is hitting sphere or leaving sphere
        let ri = ray.hitResult.inside ? this.refractionIndex : (1.0 / this.refractionIndex);

        // metal bounces ray right off material
        const cosTheta = Math.min(vec3.dot(vec3.negate(vec3.create(), ray.direction), ray.hitResult.normal), 1.0);
        const sinTheta = Math.sqrt(1.0 - cosTheta*cosTheta);

        let bounceDir = null;
        if(ri * sinTheta > 1.0 || Glass.reflectance(cosTheta, ri) > rand()) { // cannot refract
            bounceDir = Material.reflect(ray.direction, ray.hitResult.normal);
        } else { // can refract
            bounceDir = Material.refract(ray.direction, ray.hitResult.normal, ri);
        }

        return new Ray({ origin: ray.hitResult.pos, direction: bounceDir });
    }

    static reflectance(cosTheta, refractionIndex) {
        let r = (1 - refractionIndex) / (1 + refractionIndex);
        r *= r;

        cosTheta = Math.abs(cosTheta);
        return r + (1 - r) * (1-cosTheta)*(1-cosTheta)*(1-cosTheta)*(1-cosTheta)*(1-cosTheta);
    }
}