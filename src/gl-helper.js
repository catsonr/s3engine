function createShader(gl, type, sourcecode) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourcecode);
    gl.compileShader(shader);

    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if(gl.getProgramParameter(program, gl.LINK_STATUS)) return program;

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function createArrayBuffer(gl, vertices) {
    const vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vertexBuffer;
}

function setVec3RotationX(out, v, angle) {
    const length = Math.hypot(v[0], v[1], v[2]);
    
    out[1] = length * Math.sin(angle);
    out[2] = length * Math.cos(angle);

    return out;
}
function setVec3RotationY(out, v, angle) {
    const length = Math.hypot(v[0], v[1], v[2]);
    
    out[0] = length * Math.sin(angle);
    out[2] = length * Math.cos(angle);

    return out;
}