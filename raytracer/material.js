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
}

class Lambertian extends Material {
    constructor({name=undefined} = {}) {
        super();

        if(name !== undefined) Material.materials[name] = this;
        else Material.materials['lambertian'] = this;
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
    constructor({ name=undefined, fuzziness=0.01 } = {}) {
        super();

        if(name !== undefined) Material.materials[name] = this;
        else Material.materials['metal'] = this;

        this.fuzziness = fuzziness;
    }

    bounce(ray) {
        // metal bounces ray right off material
        const bounceDir = vec3Reflect(ray.direction, ray.hitResult.normal);
        if(this.fuzziness != 0) {
            const ruv = randomUnitVector();
            bounceDir[0] += ruv[0] * this.fuzziness;
            bounceDir[1] += ruv[1] * this.fuzziness;
            bounceDir[2] += ruv[2] * this.fuzziness;
        }

        return new Ray({ origin: ray.hitResult.pos, direction: bounceDir });
    }
}

class Dielectric extends Material {
    constructor({ name=undefined, refractionIndex=1.1 } = {}) {
        super();

        if(name !== undefined) Material.materials[name] = this;
        else Material.materials['dielectric'] = this;

        this.refractionIndex = refractionIndex;
    }

    bounce(ray) {
        // metal bounces ray right off material
        const bounceDir = vec3Refract(ray.direction, ray.hitResult.normal, this.refractionIndex);

        return new Ray({ origin: ray.hitResult.pos, direction: bounceDir });
    }
}