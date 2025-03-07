// shader code start
// --------------------------------------------------------------------------------
const VERTEXSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    in vec3 a_positions;
    in vec3 a_normals;

    uniform mat4 u_mWorld;
    uniform mat4 u_mView;
    uniform mat4 u_mProj;

    uniform mat4 u_mLightPovMVP;

    uniform mat4 u_mInstance;

    out vec3 v_normal;
    out vec4 v_positionFromLightPOV; 

    void main() {
        v_normal = mat3((u_mWorld * u_mInstance)) * a_normals;
        v_positionFromLightPOV = u_mLightPovMVP * u_mInstance * vec4(a_positions, 1.0);

        gl_Position = u_mProj * u_mView * (u_mWorld * u_mInstance) * vec4(a_positions, 1.0); 
    }`;

const FRAGMENTSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    in vec2 v_texcoord;
    in vec3 v_normal;
    in vec4 v_positionFromLightPOV;

    uniform vec3 u_lightdir;
    uniform vec3 u_color;
    uniform float u_alpha;

    out vec4 outputColor;

    void main() {
        vec3 normal = normalize(-v_normal);
        vec3 lightdir = normalize(u_lightdir);

        float diffuseAmount = u_alpha >= 1.0 ? max(dot(normal, lightdir), 0.0) : 1.0;
        vec3 ambientLight = vec3(0.05, 0.05, 0.1);

        vec3 currentColor = u_color * u_alpha * diffuseAmount;
        currentColor = ambientLight + currentColor;

        outputColor = vec4(currentColor, u_alpha);
    }`;