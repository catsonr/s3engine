// globals
/*const WIDTH = 800;
const HEIGHT = 600;*/
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const canvasName = "s3canvas";
const canvas = document.getElementById(canvasName);
const gl = canvas.getContext("webgl2");

const mat4  = glMatrix.mat4;
const vec3  = glMatrix.vec3;

// shader code start
// --------------------------------------------------------------------------------
const VERTEXSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    in vec3 a_position;
    in vec3 a_normals;

    uniform mat4 u_mWorld;
    uniform mat4 u_mView;
    uniform mat4 u_mProj;

    uniform mat4 u_mInstance;

    out vec3 v_normal;

    void main() {
        v_normal = mat3((u_mWorld * u_mInstance)) * a_normals;

        gl_Position = u_mProj * u_mView * (u_mWorld * u_mInstance) * vec4(a_position, 1.0); 
    }`;

const FRAGMENTSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    in vec2 v_texcoord;
    in vec3 v_normal;

    uniform sampler2D u_texture;

    out vec4 outputColor;

    void main() {
        vec3 lightdir = normalize(vec3(5, 1, 3));
        vec3 normal   = normalize(v_normal);

        float light = dot(normal, lightdir);
        vec4 ambientLight = vec4(0.2, 0.2, 0.4, 1.0);

        outputColor = ambientLight + (vec4(1.0, 0.5, 0.7, 1.0) * light);
    }`;
// --------------------------------------------------------------------------------
// shader code end

let player = new Player();

async function main() {
    const currentObjectSrc = 'obj/icosphere.obj';

    await Obj.loadObj(currentObjectSrc);

    const CUBEREPLACE = new Obj([0, 0, 0], [1, 1, 1]);
    CUBEREPLACE.setObjData(currentObjectSrc);
    console.log('CUBEREPLACE:');
    console.log(CUBEREPLACE);

    const currentTriCount = CUBEREPLACE.data.triCount;
    const currentVertices = CUBEREPLACE.data.verticesOut;
    const currentNormals  = CUBEREPLACE.data.normalsOut;
    const currentMatrix   = CUBEREPLACE.matrix;

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

    // creating cubes
    const u_mInstance = gl.getUniformLocation(program, 'u_mInstance');

    // creates and enables vertex array, into a_position
    const a_position = gl.getAttribLocation(program, 'a_position');
    const cubeVertexBuffer = createArrayBuffer(gl, currentVertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // creates and enables vertex normals array, into a_normals
    const a_normals = gl.getAttribLocation(program, 'a_normals');
    const normalsBuffer = createArrayBuffer(gl, currentNormals);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.vertexAttribPointer(a_normals, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_normals);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

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
        if(document.pointerLockElement === canvas) {
            player.processKeyPress(event.key);
        }
    });
    document.addEventListener('keyup', (event) => {
        if(document.pointerLockElement === canvas) {
            player.processKeyRelease(event.key);
        }
    });

    draw(); 
    function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let mat = currentMatrix;
        gl.uniformMatrix4fv(u_mInstance, gl.FALSE, mat);
        gl.drawArrays(gl.TRIANGLES, 0, currentTriCount * 3);

        player.update(.1);
        player.camera.update(gl, u_mView, viewMatrix);

        requestAnimationFrame(draw);
    }
}

main();