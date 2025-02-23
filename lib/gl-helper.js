function createShader(gl, type, sourcecode) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourcecode);
    gl.compileShader(shader);

    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    var program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.linkProgram(program);

    if(gl.getProgramParameter(program, gl.LINK_STATUS)) return program;

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function createArrayBuffer(gl) {
    const arrayBuffer = gl.createBuffer();

    return arrayBuffer;
}

function setArrayBufferData(gl, buffer, data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function enableAttribute(gl, attributeLocation, buffer, stride, startOffset = 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attributeLocation, stride, gl.FLOAT, false, 0, gl.FLOAT * startOffset);
    gl.enableVertexAttribArray(attributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
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