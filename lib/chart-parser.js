async function readChart(path) {
    const text = await getFileText(path);
    const json = JSON.parse(text);

    console.log(json);
}