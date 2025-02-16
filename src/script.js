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

    in vec3 a_positions;
    in vec3 a_normals;

    uniform mat4 u_mWorld;
    uniform mat4 u_mView;
    uniform mat4 u_mProj;

    uniform mat4 u_mInstance;

    out vec3 v_normal;

    void main() {
        v_normal = mat3((u_mWorld * u_mInstance)) * a_normals;

        gl_Position = u_mProj * u_mView * (u_mWorld * u_mInstance) * vec4(a_positions, 1.0); 
    }`;

const FRAGMENTSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    in vec2 v_texcoord;
    in vec3 v_normal;

    uniform highp sampler2DShadow u_shadowMap;

    out vec4 outputColor;

    void main() {
        vec3 lightdir = normalize(vec3(5, 1, 3));
        vec3 normal   = normalize(v_normal);

        float light = dot(normal, lightdir);
        vec4 ambientLight = vec4(0.2, 0.2, 0.4, 1.0);

        outputColor = ambientLight + (vec4(1.0, 0.5, 0.7, 1.0) * light);
    }`;

const SHADOWVERTEXSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    in vec3 a_positions;

    uniform mat4 u_mInstance;
    uniform mat4 u_mLightMVP;

    void main() {
        gl_Position = u_mLightMVP * u_mInstance * vec4(a_positions, 1);
    }`;

const SHADOWFRAGMENTSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    out vec4 outputColor;

    void main() {
        outputColor = vec4(vec3(pow(gl_FragCoord.z, 8.0)), 1);
        //outputColor = vec4(gl_FragCoord.z, gl_FragCoord.z, gl_FragCoord.z, 1.0);
    }

    `;

// --------------------------------------------------------------------------------
// shader code end

let player = new Player();

async function main() {
    await Obj.loadObj('obj/cone.obj');
    await Obj.loadObj('obj/cube.obj');
    await Obj.loadObj('obj/icosphere.obj');
    await Obj.loadObj('obj/monitor.obj');
    await Obj.loadObj('obj/monkey.obj');
    await Obj.loadObj('obj/sharpswan.obj');
    await Obj.loadObj('obj/rosalia.obj');
    await Obj.loadObj('obj/miku.obj');

    meshes = [];
    let meshCount = 0;

    meshes.push(new Obj([0, -2, 0], [20, 1, 20]));
    meshes[meshCount++].setObjData('obj/cube.obj');

    meshes.push(new Obj([0, 0, 10], [10, 10, 1]));
    meshes[meshCount++].setObjData('obj/cube.obj');

    meshes.push(new Obj([0, 3, 5], [2, 2, 2]));
    meshes[meshCount++].setObjData('obj/icosphere.obj');

    /*
    meshes.push(new Obj([0, 6, 13], [3, 3, 3]));
    meshes[meshCount++].setObjData('obj/miku.obj');

    // x y z axes
    meshes.push(new Obj([0, 0, 0], [1000, .1, .1]));
    meshes[meshCount++].setObjData('obj/cube.obj');
    meshes.push(new Obj([0, 0, 0], [.1, 1000, .1]));
    meshes[meshCount++].setObjData('obj/cube.obj');
    meshes.push(new Obj([0, 0, 0], [.1, .1, 1000]));
    meshes[meshCount++].setObjData('obj/cube.obj');
    */

    let currentTriCount;
    let currentVertices;
    let currentNormals;
    let currentMatrix;
    let currentProgram;

    // ----- creating shader program(s) -----
    const program = createProgram(gl, VERTEXSHADERSOURCECODE, FRAGMENTSHADERSOURCECODE);
    const shadow_program = createProgram(gl, SHADOWVERTEXSHADERSOURCECODE, SHADOWFRAGMENTSHADERSOURCECODE);

    currentProgram = program;
    currentProgram = shadow_program;

    // ----- setting up canvas -----
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    gl.viewport(0, 0, WIDTH, HEIGHT);

    gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);

    // ----- uniforms -----
    gl.useProgram(program);
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

    // obj instance translate scale matrix
    const u_mInstance = gl.getUniformLocation(program, 'u_mInstance');

    // shadow map for fragment shader
    const u_shadowMap = gl.getUniformLocation(program, 'u_shadowMap');

    // ----- attributes -----
    // creates and enables vertex array, into a_positions
    const a_positions = gl.getAttribLocation(program, 'a_positions');
    const a_positions_BUFFER = createArrayBuffer(gl);

    // creates and enables vertex normals array, into a_normals
    const a_normals = gl.getAttribLocation(program, 'a_normals');
    const a_normals_BUFFER = createArrayBuffer(gl);

    // ----- user input -----
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

    // ----- shadow stuff -----
    gl.useProgram(shadow_program);
    const shadow_u_mInstance = gl.getUniformLocation(shadow_program, 'u_mInstance');
    const shadow_u_mLightMVP = gl.getUniformLocation(shadow_program, 'u_mLightMVP');

    const shadow_lightPos = vec3.fromValues(10, 8, -10);
    const shadow_lightLookingAt = vec3.fromValues(2, 2, 0);

    const shadow_lightZNear = 1.0;
    const shadow_lightZFar = 80;

    const shadow_lightPovView = mat4.create();
    mat4.lookAt(shadow_lightPovView, shadow_lightPos, shadow_lightLookingAt, [0, 1, 0]);

    const shadow_lightPovProj = mat4.create();
    //mat4.ortho(shadow_lightPovProj, -10, 10, -10, 10, shadow_lightZNear, shadow_lightZFar);
    mat4.perspective(shadow_lightPovProj, Math.PI / 4, WIDTH / HEIGHT, shadow_lightZNear, shadow_lightZFar);

    const shadow_lightPovMVP = mat4.create();
    mat4.multiply(shadow_lightPovMVP, shadow_lightPovProj, shadow_lightPovView);
    gl.uniformMatrix4fv(shadow_u_mLightMVP, gl.FALSE, shadow_lightPovMVP);

    const shadow_a_positions = gl.getAttribLocation(shadow_program, 'a_positions');
    const shadow_a_positions_BUFFER = createArrayBuffer(gl);

    const shadow_depthTextureSize = [1024, 1024];
    const shadow_depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadow_depthTexture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, shadow_depthTextureSize[0], shadow_depthTextureSize[1]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const shadow_depthFramebuffer = gl.createFramebuffer();
    //gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_depthFramebuffer);
    //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadow_depthTexture, 0);

    let then = 0;

    gl.useProgram(currentProgram);
    requestAnimationFrame(draw);

    function draw(timestamp) {
        const dt = (timestamp - then) / 1000;
        then = timestamp;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for(let i = 0; i < meshes.length; i++) {
            currentVertices = meshes[i].data.verticesOut;
            currentNormals = meshes[i].data.normalsOut;
            currentTriCount = meshes[i].data.triCount;
            currentMatrix = meshes[i].matrix;

            if(currentProgram == program) {
                enableAttribute(gl, a_positions, a_positions_BUFFER, 3);
                enableAttribute(gl, a_normals, a_normals_BUFFER, 3);

                setArrayBufferData(gl, a_positions_BUFFER, currentVertices);
                setArrayBufferData(gl, a_normals_BUFFER, currentNormals);

                gl.uniformMatrix4fv(u_mInstance, gl.FALSE, currentMatrix);
            }
            else if(currentProgram == shadow_program) {
                enableAttribute(gl, shadow_a_positions, shadow_a_positions_BUFFER, 3);

                setArrayBufferData(gl, shadow_a_positions_BUFFER, currentVertices);

                gl.uniformMatrix4fv(shadow_u_mInstance, gl.FALSE, currentMatrix);
            }

            gl.drawArrays(gl.TRIANGLES, 0, currentTriCount * 3);
            meshes[i].update(dt);
        }

        if(currentProgram == program) {
            player.update(dt);
            player.camera.update(gl, u_mView, viewMatrix);
        }

        requestAnimationFrame(draw);
    }
}

main();