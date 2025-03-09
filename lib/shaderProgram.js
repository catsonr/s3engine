class ShaderProgram {
    constructor(gl, VERTSOURCE, FRAGSOURCE) {
        this.gl = gl;
        this.vertexShaderSource = VERTSOURCE;
        this.fragmentShaderSource = FRAGSOURCE;

        this.program = this.createProgram();

        this.uniforms = {};
        this.attributes = {};
    }

    createShader(type, sourcecode) {
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, sourcecode);
        this.gl.compileShader(shader);

        if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) return shader;

        console.warn(type + ' shader failed to compile!');
        console.log(this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
    }

    createProgram() {
        var program = this.gl.createProgram();
        this.gl.attachShader(program, this.createShader(this.gl.VERTEX_SHADER, this.vertexShaderSource));
        this.gl.attachShader(program, this.createShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderSource));
        this.gl.linkProgram(program);

        if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) return program;

        console.log(this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
    }

    newUniform(variableName, value = undefined) {
        const location = this.gl.getUniformLocation(this.program, variableName);

        if(location == null) {
            console.warn(this + ' shader program failed to find uniform ' + variableName);
            return null;
        }

        let uniform = null;
        if(value === undefined) uniform = new Uniform(this.gl, variableName, location);
        else uniform = new Uniform(this.gl, variableName, location, value);

        this.uniforms[variableName] = uniform;
    }

    newAttribute(variableName, stride, data = undefined) {
        const location = this.gl.getAttribLocation(this.program, variableName);

        if(location == null) {
            console.warn(this + ' shader program failed to find attribute ' + variableName);
            return null;
        }

        let attribute = null;
        if(data === undefined) attribute = new Attribute(this.gl, variableName, location, stride);
        else attribute = new Attribute(this.gl, location, stride, data);

        this.attributes[variableName] = attribute;
    }
}

class Uniform {
    constructor(gl, variableName, location, value = undefined) {
        this.gl = gl;
        this.variableName = variableName;
        this.location = location;

        this.value = undefined;
        if(value != undefined) this.setValue(value);
    }

    // incomming matrices are expected to not be normalized
    // if you need your matrix to be normalized by webgl then calls will have to be done manually (not that hard)
    setValue(value) {
        this.value = value;

        // float
        if(typeof value === "number") {
            this.gl.uniform1f(this.location, value);
        }
        
        else if(Array.isArray(value) || value instanceof Float32Array) {
            switch(value.length) {
                case 2: // vec2
                    this.gl.uniform2fv(this.location, value);
                    break;
                case 3: // vec3
                    this.gl.uniform3fv(this.location, value);
                    break;
                case 4: // vec4
                    this.gl.uniform4fv(this.location, value);
                    break;
                case 9: // mat3
                    this.gl.uniformMatrix3fv(this.location, this.gl.FALSE, value);
                    break;
                case 16: // mat4
                    this.gl.uniformMatrix4fv(this.location, this.gl.FALSE, value);
                    break;
            }
        }
        else {
            console.warn('unsupported type of \'' + typeof value + '\' for \'' + this.variableName + '\' with value of:\n' + value);
            return null;
        }
    }
}

class Attribute {
    constructor(gl, variableName, location, stride, data = undefined) {
        this.gl = gl;
        this.variableName = variableName;
        this.location = location;
        this.stride = stride;

        this.arrayBuffer = this.createArrayBuffer();

        this.data = undefined;
        if(data != undefined) this.setArrayBufferData(data);
    }

    createArrayBuffer() {
        const arrayBuffer = this.gl.createBuffer();

        return arrayBuffer;
    }

    setArrayBufferData(data) {
        const dataArray = new Float32Array(data);
        this.data = dataArray;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.arrayBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, dataArray, this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    enableAttribute(startOffset = 0) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.arrayBuffer);
        this.gl.vertexAttribPointer(this.location, this.stride, this.gl.FLOAT, false, 0, this.gl.FLOAT * startOffset);
        this.gl.enableVertexAttribArray(this.location);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
}