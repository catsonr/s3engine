class Sphere extends Obj {
    constructor({ pos=[0, 0, 0], r=1, material=undefined, color=undefined } = {}) {
        super(pos);

        this.r = r;

        this.material = undefined;
        if(material === undefined) {
            const keys = Object.keys(Material.materials);
            this.material = Material.materials[keys[Math.floor(Math.random() * Material.materialCount)]];
        }
        else this.material = material;

        if(color !== undefined) {
            this.color = color;
        }
    }
}