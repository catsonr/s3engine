
async function getObjData(path) {
    const text  = await getFileText(path);
    const lines = text.split('\n');

    let name = "";
    let triCount = 0;

    // 0th element initialized since .obj indexes starting at 1
    const vertices = [0, 0, 0];
    const texcoords = [0, 0];
    const normals = [0, 0, 0];

    const vertexIndexes = [];
    const normalIndexes = [];
    
    for(let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        if(line[0] == '#' || !line) continue;
        const [command, ...args] = line.split(/\s+/);
        
        if(command == 'v') {
            if(args.length != 3) {
                console.log('obj-parser: line', lineIndex + 1, 'with unexpected number of verticies. skipping...');
                continue;
            }
            vertices.push(parseFloat(args[0]));
            vertices.push(parseFloat(args[1]));
            vertices.push(parseFloat(args[2]));
        }
        else if(command == 'vn') {
            if(args.length != 3) {
                console.log('obj-parser: line', lineIndex + 1, 'with unexpected number of normals. skipping...');
                continue;
            }
            normals.push(parseFloat(args[0]));
            normals.push(parseFloat(args[1]));
            normals.push(parseFloat(args[2]));
        }
        else if(command == 'vt') {
            if(args.length != 2) {
                console.log('obj-parser: line', lineIndex + 1, 'with unexpected number of texcoords. skipping...');
                continue;
            }
            texcoords.push(parseFloat(args[0]));
            texcoords.push(parseFloat(args[1]));
        }
        else if(command == 'f') { // v/t/n
            if(args.length < 3) {
                console.log('obj-parser.js: line', lineIndex + 1, 'with unexpected number of face indices of', args.length + '. skipping...');
                continue;
            }
            const trisInFace = args.length - 2;
            triCount += trisInFace;
            const vertexFaceOptions = [];
            const normalFaceOptions = [];

            for(const arg of args) {
                const indices = arg.split('/').map(n => parseInt(n));
                vertexFaceOptions.push(indices[0]);
                normalFaceOptions.push(indices[2]);
            }

            for(let i = 1; i <= trisInFace; i++) {
                vertexIndexes.push(vertexFaceOptions[0], vertexFaceOptions[i], vertexFaceOptions[i+1]);
                normalIndexes.push(normalFaceOptions[0], normalFaceOptions[i], normalFaceOptions[i+1]);
            }
        }
        else if(command == 'o') {
            name = args.join(" ");
        }
        else {
            //console.log('unhandled command \'' + command + '\' with args:', args);
        }
    }


    const verticesOut  = [];
    const texcoordsOut = [];
    const normalsOut   = [];

    for(let i = 0; i < vertexIndexes.length; i++) {
        const vIndex = vertexIndexes[i];
        const nIndex = normalIndexes[i];
        verticesOut.push(vertices[vIndex * 3], vertices[vIndex * 3 + 1], vertices[vIndex * 3 + 2] );
        normalsOut.push(normals[nIndex * 3], normals[nIndex * 3 + 1], normals[nIndex * 3 + 2] );
    }

    return { name, triCount, vertexIndexes, verticesOut, normalsOut };
}