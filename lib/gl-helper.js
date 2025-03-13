// general purpose functions
function canvasSetPixel(ctx, i, j, rgba, pixelSize = 1) {
    ctx.fillStyle = `rgba(${rgba[0] * 255}, ${rgba[1] * 255}, ${rgba[2] * 255}, ${rgba[3]})`
    ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
}

async function getFileText(path) {
    try {
        const response = await fetch(path);
        return response.text();
    } catch(e) {
        console.log('failed to read file \'' + path + '\'. (does it exist?)');
    }
}

function getTimestamp() {
    const now = new Date();
    
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let year = now.getFullYear();

    let hours = now.getHours();
    let minutes = now.getMinutes().toString().padStart(2, "0");

    return `${month}-${day}-${year}_${hours}-${minutes}`;
}

function saveCanvasAsImage(canvas) {
    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `${getTimestamp()}.png`;
    link.click();
}

// general math functions
function rand(min=0, max=1) {
    return Math.random() * (max - min) + min;
}

// linear algebra functions  
function gammaCorrect(color) {
    color[0] = Math.sqrt(color[0]);
    color[1] = Math.sqrt(color[1]);
    color[2] = Math.sqrt(color[2]);

    return color;
}

function randomUnitVector() {
    let lenSquared = 0;
    const v = vec3.create();

    do {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        const z = Math.random() * 2 - 1;

        v[0] = x;
        v[1] = y;
        v[2] = z;

        lenSquared = vec3.dot(v, v);
    } while (1e-160 < lenSquared && lenSquared <= 1);

    return v;
}

function randomUnitVectorOnHemisphere(normal) {
    const v = randomUnitVector();

    if(vec3.dot(v, normal) < 0) {
        v[0] *= -1;
        v[1] *= -1;
        v[2] *= -1;
    }

    return v;
}

function vec3NearZero(v) {
    const s = 1e-8;
    return Math.abs(v[0]) <= s && Math.abs(v[1]) <= s && Math.abs(v[2]) <= s;
}

function vec3Reflect(v, n) {
    // reflected = v - 2*dot(v,n)*n;

    const reflected = vec3.clone(v);
    const dot = vec3.dot(v, n);

    reflected[0] -= 2 * dot * n[0];
    reflected[1] -= 2 * dot * n[1];
    reflected[2] -= 2 * dot * n[2];

    return reflected;
}

function vec3Refract(v, n, etai_over_etat) {
    // refracted_perpendicular = etai/etat * (v + dot(-v, n)*n)
    // refracted_parallel      = -sqrt(1 - |refracted_perpendicular|^2 * n)

    const refracted_perpendicular = vec3.create();
    const vInverse = vec3.negate(vec3.create(), v);
    const cosTheta = Math.max(Math.min( vec3.dot(vInverse, n), 1), -1);

    refracted_perpendicular[0] = etai_over_etat * (v[0] + cosTheta*n[0]);
    refracted_perpendicular[1] = etai_over_etat * (v[1] + cosTheta*n[1]);
    refracted_perpendicular[2] = etai_over_etat * (v[2] + cosTheta*n[2]);

    const refracted_parallel = vec3.create();
    const refracted_perpendicular_lengthSquared = vec3.dot(refracted_perpendicular, refracted_perpendicular);
    const sqrtTerm = -Math.sqrt( Math.abs(1 - refracted_perpendicular_lengthSquared) );
    vec3.scale(refracted_parallel, n, sqrtTerm);

    return vec3.add(vec3.create(), refracted_parallel, refracted_perpendicular);
}