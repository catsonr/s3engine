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
    precision highp float;

    in vec3 a_position;
    in vec2 a_texcoord;

    uniform mat4 u_mWorld;
    uniform mat4 u_mView;
    uniform mat4 u_mProj;

    out vec2 v_texcoord;

    void main() {
        v_texcoord = a_texcoord;

        gl_Position = u_mProj * u_mView * u_mWorld * vec4(a_position, 1.0); 
    }`;

const FRAGMENTSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    in vec2 v_texcoord;

    uniform sampler2D u_texture;

    out vec4 outputColor;

    void main() {
        outputColor = texture(u_texture, v_texcoord);
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

    // fitting canvas to screen
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
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // creates and enables texture vertex array, into a_texcoord
    const a_texcoord = gl.getAttribLocation(program, 'a_texcoord');
    const textureCoordinates = [
        // Front
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Top
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Bottom
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Right
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Left
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    ];
    const texCoordBuffer = createArrayBuffer(gl, textureCoordinates);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(a_texcoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_texcoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // loads texture
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // sets texture to solid yellow as placeholder while actual texture loads
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 245, 60, 255]));

    let image = new Image();
    image.src = "img/ahh.png";
    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    // creates index buffer
    const cubeIndexBuffer = createIndexBuffer(gl, geo_cubeIndices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    // handles input
    canvas.addEventListener('click', (event) => {
        canvas.requestPointerLock();
    });
    canvas.addEventListener('mousemove', (event) => {
        if(document.pointerLockElement === canvas) {
            player.processMouseMouse(event);
        }
    });
    document.addEventListener('keydown', (event) => {
        player.processKeyPress(event.key);
    });
    document.addEventListener('keyup', (event) => {
        player.processKeyRelease(event.key);
    });

    draw(); 
    function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, geo_cubeIndices.length, gl.UNSIGNED_SHORT, 0);

        player.update(.1);
        player.camera.update(gl, u_mView, viewMatrix);

        requestAnimationFrame(draw);
    }
}

main();