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

function rand(min=0, max=1) {
    return Math.random() * (max - min) + min;
}