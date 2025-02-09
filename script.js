// globals
const WIDTH = 800;
const HEIGHT = 600;

const canvasName = "s3canvas";
const canvas = document.getElementById(canvasName);
const gl = canvas.getContext("webgl2");

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

// shader code start
// --------------------------------------------------------------------------------
const VERTEXSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision mediump float;

    in vec3 a_position;
    in vec4 a_color;

    uniform mat4 u_mWorld;
    uniform mat4 u_mView;
    uniform mat4 u_mProj;

    out vec4 v_color;

    void main() {
        v_color = a_color;

        gl_Position = u_mProj * u_mView * u_mWorld * vec4(a_position, 1.0); 
    }`;

const FRAGMENTSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision mediump float;

    in vec4 v_color;

    out vec4 outputColor;

    void main() {
        outputColor = vec4(v_color);
    }`;
// --------------------------------------------------------------------------------
// shader code end

let player = new Player();

function main() {
    // compiles shader code and creates shader program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEXSHADERSOURCECODE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENTSHADERSOURCECODE);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // creates player object

    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    gl.viewport(0, 0, WIDTH, HEIGHT);

    // clearing stuff
    gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // world matrix
    const worldMatrix = mat4.create();
    const u_mWorld = gl.getUniformLocation(program, 'u_mWorld');
    mat4.identity(worldMatrix);
    gl.uniformMatrix4fv(u_mWorld, gl.FALSE, worldMatrix);

    // view matrix
    const viewMatrix = mat4.create();
    const u_mView = gl.getUniformLocation(program, 'u_mView');
    mat4.lookAt(viewMatrix, player.camera.pos, player.camera.lookingAt, player.camera.up);
    player.camera.update(gl, u_mView, viewMatrix);

    // projection matrix
    const projMatrix = mat4.create();
    const u_mProj = gl.getUniformLocation(program, 'u_mProj');
    mat4.perspective(projMatrix, player.camera.fov, player.camera.aspectRatio, player.camera.zNear, player.camera.zFar);
    gl.uniformMatrix4fv(u_mProj, gl.FALSE, projMatrix);

    // creates and enables vertex array, into a_position
    const a_position = gl.getAttribLocation(program, 'a_position');
    const cubeVertexBuffer = createArrayBuffer(gl, geo_cubeVertices);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(a_position);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // creates and enables color array, into a_color
    const a_color = gl.getAttribLocation(program, 'a_color');
    const cubeColorsBuffer = createArrayBuffer(gl, geo_cubeColors);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorsBuffer);
    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, 4 * 4, 0);
    gl.enableVertexAttribArray(a_color);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const cubeIndexBuffer = createIndexBuffer(gl, geo_cubeIndices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    canvas.addEventListener('click', (event) => {
        canvas.requestPointerLock();
    });
    canvas.addEventListener('mousemove', (event) => {
        if(document.pointerLockElement === canvas) {
            player.processMouseMouse(event);
        }
    });
    document.addEventListener('keydown', (event) => {
        const key = event.key;

        player.processKeyPress(key);
    });
    document.addEventListener('keyup', (event) => {
        const key = event.key;

        player.processKeyRelease(key);
    });

    console.log(player);

    draw(); 
    function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, geo_cubeIndices.length, gl.UNSIGNED_SHORT, 0);

        player.update(.1);
        player.camera.update(gl, u_mView, viewMatrix);
        //console.log('horiz: ' + player.viewingAngle.horizontal * 180 / Math.PI, 'vert: ' + player.viewingAngle.vertical * 180 / Math.PI);

        requestAnimationFrame(draw);
    }
}

main();