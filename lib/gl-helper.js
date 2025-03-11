async function getFileText(path) {
    try {
        const response = await fetch(path);
        return response.text();
    } catch(e) {
        console.log('failed to read file \'' + path + '\'. (does it exist?)');
    }
}