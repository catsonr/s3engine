const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const canvasName = "s3canvas";
const canvas = document.getElementById(canvasName);

const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;

const X_AXIS = vec3.fromValues(1, 0, 0);
const Y_AXIS = vec3.fromValues(0, 1, 0);
const Z_AXIS = vec3.fromValues(0, 0, 1);

async function main() {
    const gl = canvas.getContext("webgl2", {
        alpha: false // treats the html canvas as if it has no alpha component. webgl rendering will handle all transparency
    });

    // setting up constants and canvas 
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    gl.viewport(0, 0, WIDTH, HEIGHT);

    //gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.clearColor(0.9, 0.9, 0.8, 1.0);
    gl.clearDepth(1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);

    await Obj.preloadObjs();

    let player = new Player([0, 0, -5]);
    player.loadPlayerData();

    // scene being rendered
    let currentScene;

    // putting stuff in scenes
    const beatboxScene = new Scene();
    currentScene = beatboxScene;

    const beatbox = new BeatBox();
    beatbox.setObjData('obj/cube.obj');
    currentScene.addObj(beatbox);

    const omar = new Obj();
    omar.setObjData('obj/omar.obj');
    omar.setPos([0, -50, 50]);
    omar.setScale([100, 100, 100]);
    omar.addRotation([0, 1, 0], Math.PI);
    currentScene.addObj(omar);

    const graphicsTestScene = new Scene();
    currentScene = graphicsTestScene;

    currentScene.addObj(new Obj([0, -1, 0], [50, 0.1, 50]));
    currentScene.objects[currentScene.objCount - 1].setObjData('obj/cube.obj');

    currentScene.addObj(new Obj([-10, 0, 25], [10, 10, 0.1]));
    currentScene.objects[currentScene.objCount - 1].setObjData('obj/cube.obj');

    const icosphere = new Obj([-10, 3, 20], [2, 2, 2]);
    icosphere.setObjData('obj/icosphere.obj');
    currentScene.addObj(icosphere);

    const insideCube = new Obj([0, 1, 4], [0.75, 2, 4]);
    currentScene.addObj(insideCube);
    insideCube.setObjData('obj/roundcube.obj');
    insideCube.setAlpha(0.5);

    currentScene.addObj(new Obj([0, 1, 4], [2, 2, 2]));
    currentScene.objects[currentScene.objCount - 1].setObjData('obj/cube.obj');
    currentScene.objects[currentScene.objCount - 1].setAlpha(0.5);

    currentScene.addObj(new Obj([10, 5, 10], [5, 5, 5]));
    currentScene.objects[currentScene.objCount - 1].setObjData('obj/miku2.obj');
    currentScene.objects[currentScene.objCount - 1].setAlpha(0.5);

    currentScene.addObj(new Obj([13, 0, 13], [5, 5, 5]));
    currentScene.objects[currentScene.objCount - 1].setObjData('obj/miku2.obj');
    currentScene.objects[currentScene.objCount - 1].setAlpha(0.25);


    // ----- global light stuff -----
    const globalLightPos = vec3.fromValues(30, 30, -50);
    const globalLightLookingAt = vec3.fromValues(0, 0, 0);
    const globalLightDir = vec3.create();
    const globalLightColor = [1, 1, 1, 1];

    const lightPosObj = new Obj([0, 0, 0], [3, 3, 3]);
    lightPosObj.setObjData('obj/icosphere.obj');
    currentScene.addObj(lightPosObj);

    const lightDirObj = new Obj([0, 0, 0], [1, 1, 1]);
    lightDirObj.setObjData('obj/icosphere.obj');
    currentScene.addObj(lightDirObj);

    // positions global light and sets uniforms
    function setGlobalLight() {
        vec3.set(globalLightDir, 0, 0, 0);
        vec3.sub(globalLightDir, globalLightLookingAt, globalLightPos);
        vec3.normalize(globalLightDir, globalLightDir);

        lightPosObj.setPos(globalLightPos);
        const objdirPos = vec3.clone(globalLightPos);
        vec3.add(objdirPos, objdirPos, globalLightDir);
        vec3.add(objdirPos, objdirPos, globalLightDir);
        vec3.add(objdirPos, objdirPos, globalLightDir);
        vec3.add(objdirPos, objdirPos, globalLightDir);
        vec3.add(objdirPos, objdirPos, globalLightDir);
        vec3.add(objdirPos, objdirPos, globalLightDir);
        vec3.add(objdirPos, objdirPos, globalLightDir);
        lightDirObj.setPos(objdirPos);
    }
    setGlobalLight();

    // ----- creating shader programs -----
    const mainprogram = new ShaderProgram(gl, VERTEXSHADERSOURCECODE, FRAGMENTSHADERSOURCECODE);

    // ----- main program stuff -----
    gl.useProgram(mainprogram.program);

    // -- uniforms --
    const worldMatrix = mat4.create();
    mat4.identity(worldMatrix);

    mainprogram.newUniform('u_mWorld', worldMatrix);
    mainprogram.newUniform('u_mView', player.camera.viewMatrix);
    mainprogram.newUniform('u_mProj', player.camera.projMatrix);

    // obj instance translate scale rotation matrix
    mainprogram.newUniform('u_mInstance');
    // setting light direction for fragment shader 
    mainprogram.newUniform('u_lightdir', globalLightDir);
    // where global light is located
    mainprogram.newUniform('u_globalLightPos', globalLightPos);
    // constant color per object
    mainprogram.newUniform('u_color');
    // constant alpha per object
    mainprogram.newUniform('u_alpha');
    // where camera is located 
    mainprogram.newUniform('u_cameraPos');

    // -- attributes --
    // position in world space of each vertex
    mainprogram.newAttribute('a_positions', 3);

    // normal of each vertex
    mainprogram.newAttribute('a_normals', 3);

    // ----- user input -----
    canvas.addEventListener('click', (event) => {
        canvas.requestPointerLock();
    });
    canvas.addEventListener('mousedown', (event) => {
        beatbox.processMouseDown(event);
    });
    canvas.addEventListener('mouseup', (event) => {
        beatbox.processMouseUp(event);
    });
    canvas.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === canvas) {
            player.processMouseMove(event);
        }

        beatbox.processMouseMove(event);
    });
    document.addEventListener('keydown', (event) => {
        if (document.pointerLockElement === canvas) {
            player.processKeyPress(event.key);
        }
    });
    document.addEventListener('keyup', (event) => {
        if (document.pointerLockElement === canvas) {
            player.processKeyRelease(event.key);
        }
    });
    window.addEventListener("beforeunload", () => {
        player.savePlayerData();
    });

    // chart and conductor stuff 
    let chartData = await readChart('charts/triple-baka/playback.json');
    let chart = new Chart(chartData);
    let conductor = new Conductor(chart);

    // game loop time stuff
    let then = 0;
    let t = 0;

    // debug overlay stuff
    const debug_overlay = document.getElementById('debug-overlay');

    // make visible (hidden by default)
    debug_overlay.style.display = "flex";

    // finds spans for debug variables
    const debug_fpsElement = document.querySelector('#debug-fps');

    const debug_tElement = document.querySelector('#debug-t');
    const debug_measureElement = document.querySelector('#debug-measure');
    const debug_beatElement = document.querySelector('#debug-beat');
    const debug_bpmElement = document.querySelector('#debug-bpm');
    const debug_beatspermeasureElement = document.querySelector('#debug-beatspermeasure');
    const debug_measuredivisionElement = document.querySelector('#debug-measuredivision');

    const debug_bbQuatWElement = document.querySelector('#beatbox-quatw');
    const debug_bbQuatIElement = document.querySelector('#beatbox-quati');
    const debug_bbQuatJElement = document.querySelector('#beatbox-quatj');
    const debug_bbQuatKElement = document.querySelector('#beatbox-quatk');

    // creates nodes to hold variables
    const debug_fpsNode = document.createTextNode("");

    const debug_tNode = document.createTextNode("");
    const debug_measureNode = document.createTextNode("");
    const debug_beatNode = document.createTextNode("");
    const debug_bpmNode = document.createTextNode("");
    const debug_beatspermeasureNode = document.createTextNode("");
    const debug_measuredivisionNode = document.createTextNode("");

    const debug_bbQuatWNode = document.createTextNode("");
    const debug_bbQuatINode = document.createTextNode("");
    const debug_bbQuatJNode = document.createTextNode("");
    const debug_bbQuatKNode = document.createTextNode("");

    // links nodes to spans
    debug_fpsElement.appendChild(debug_fpsNode);

    debug_tElement.appendChild(debug_tNode);
    debug_measureElement.appendChild(debug_measureNode);
    debug_beatElement.appendChild(debug_beatNode);
    debug_bpmElement.appendChild(debug_bpmNode);
    debug_beatspermeasureElement.appendChild(debug_beatspermeasureNode);
    debug_measuredivisionElement.appendChild(debug_measuredivisionNode);

    debug_bbQuatWElement.appendChild(debug_bbQuatWNode);
    debug_bbQuatIElement.appendChild(debug_bbQuatINode);
    debug_bbQuatJElement.appendChild(debug_bbQuatJNode);
    debug_bbQuatKElement.appendChild(debug_bbQuatKNode);

    document.getElementById("debug-playing-checkbox").addEventListener("change", function () {
        if (this.checked) conductor.start();
        else conductor.stop();

        currentScene = beatboxScene;
    });
    document.getElementById("debug-metronome-checkbox").addEventListener("change", function () {
        conductor.metronome = this.checked;
    });

    function update(dt) {
        // keeps time
        conductor.stepdt(dt);

        gl.useProgram(mainprogram.program);
        player.update(dt);
        player.camera.updateMatrices();
        mainprogram.uniforms.u_mView.setValue(player.camera.viewMatrix);
        mainprogram.uniforms.u_cameraPos.setValue(player.camera.pos);

        insideCube.addRotation([1, 0, 0], Math.PI / 500);
        insideCube.addRotation([0, 1, 0], Math.PI / 700);

        icosphere.addRotation([-1, 0, 0], Math.PI / 500);
        icosphere.addRotation([0, 1, 0], Math.PI / 700);

        // updates debug overlay
        debug_fpsNode.nodeValue = (1000 / dt).toFixed(1);

        debug_tNode.nodeValue = (conductor.t / 1000).toFixed(3);
        debug_measureNode.nodeValue = conductor.measure;
        debug_beatNode.nodeValue = conductor.beat;
        debug_bpmNode.nodeValue = conductor.chart.BPM;
        debug_beatspermeasureNode.nodeValue = conductor.chart.beatspermeasure;
        debug_measuredivisionNode.nodeValue = conductor.chart.measuredivision;

        debug_bbQuatWNode.nodeValue = beatbox.rotationQuat[0].toFixed(3);
        debug_bbQuatINode.nodeValue = beatbox.rotationQuat[1].toFixed(3);
        debug_bbQuatJNode.nodeValue = beatbox.rotationQuat[2].toFixed(3);
        debug_bbQuatKNode.nodeValue = beatbox.rotationQuat[3].toFixed(3);
    }

    function draw(timestamp) {
        const dt = (timestamp - then);
        t += dt;
        then = timestamp;

        update(dt);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(mainprogram.program);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, WIDTH, HEIGHT);

        mainprogram.attributes.a_positions.enableAttribute();
        mainprogram.attributes.a_normals.enableAttribute();

        // draw all opaque objects in current scene
        gl.depthMask(true);
        gl.disable(gl.BLEND);
        gl.enable(gl.CULL_FACE);
        for (let i = 0; i < currentScene.opaqueIndexes.length; i++) {
            const currentObj = currentScene.objects[currentScene.opaqueIndexes[i]];

            mainprogram.attributes.a_positions.setArrayBufferData(currentObj.data.verticesOut);
            mainprogram.attributes.a_normals.setArrayBufferData(currentObj.data.normalsOut);

            mainprogram.uniforms.u_mInstance.setValue(currentObj.matrix);
            mainprogram.uniforms.u_color.setValue(currentObj.color);
            mainprogram.uniforms.u_alpha.setValue(currentObj.alpha);

            gl.drawArrays(gl.TRIANGLES, 0, currentObj.data.triCount * 3);
        }

        // draw all transparent objects in current scene
        gl.depthMask(false);
        gl.enable(gl.BLEND);
        gl.disable(gl.CULL_FACE);
        for (let i = 0; i < currentScene.transparentIndexes.length; i++) {
            const currentObj = currentScene.objects[currentScene.transparentIndexes[i]];

            mainprogram.attributes.a_positions.setArrayBufferData(currentObj.data.verticesOut);
            mainprogram.attributes.a_normals.setArrayBufferData(currentObj.data.normalsOut);

            mainprogram.uniforms.u_mInstance.setValue(currentObj.matrix);
            mainprogram.uniforms.u_color.setValue(currentObj.color);
            mainprogram.uniforms.u_alpha.setValue(currentObj.alpha);

            gl.drawArrays(gl.TRIANGLES, 0, currentObj.data.triCount * 3);
        }

        requestAnimationFrame(draw);
    }

    // starts drawing loop
    requestAnimationFrame(draw);
}

main();