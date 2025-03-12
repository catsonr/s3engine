// general purpose functions 
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