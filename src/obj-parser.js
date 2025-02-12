async function getFileText(path) {
    if(!path.endsWith('.obj')) console.log('obj-parser: warning: path \'' + path + '\' is not an .obj file!');

    try {
        const response = await fetch(path);
        return response.text();
    } catch(e) {
        console.log('obj-parser: failed to read file \'' + path + '\'. (does it exist?)');
    }
}

async function getObjData(path) {
    const text  = await getFileText(path);
    const lines = text.split('\n');

    let name = "";

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
            if(args.length == 3) { // pushes 3 new vertices
                for(const arg of args) {
                    const indices = arg.split('/').map(n => parseInt(n));
                    vertexIndexes.push(indices[0]); // only taking vertex index for now
                }
            } else if(args.length == 4) { // pushes 6 new vertices
                const quadIndices = [];
                const normIndices = [];
                for(const arg of args) {
                    const indices = arg.split('/').map(n => parseInt(n));
                    quadIndices.push(indices[0]);
                    normIndices.push(indices[2]);
                }
                vertexIndexes.push(quadIndices[0], quadIndices[1], quadIndices[2]);
                vertexIndexes.push(quadIndices[0], quadIndices[2], quadIndices[3]);

                normalIndexes.push(normIndices[0], normIndices[1], normIndices[2]);
                normalIndexes.push(normIndices[0], normIndices[2], normIndices[3]);
            } else {
                console.log('obj-parser.js: line', lineIndex + 1, 'with unexpected number of face indices (not a tri or quad). skipping...');
                continue;
            }
        }
        else if(command == 'o') {
            name = args.join(" ");
        }
        else {
            console.log('unhandled command \'' + command + '\' with args:', args);
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

    return { name, verticesOut, normalsOut };
}