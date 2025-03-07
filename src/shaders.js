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

    uniform highp sampler2DShadow u_shadowMap;

    out vec4 outputColor;

    void main() {
        vec3 lightdir = normalize(u_lightdir);
        vec3 normal   = normalize(-v_normal);

        float light = dot(normal, lightdir);
        vec4 ambientLight = vec4(0.2, 0.2, 0.4, 1.0);
        vec4 normalsColor = vec4(243.0 / 255.0, 241.0 / 255.0, 249.0 / 255.0, 1.0);
        vec4 shadowColor  = vec4(0.1, 0.1, 0.2, 1.0);

        vec3 lightPosInTexture = (v_positionFromLightPOV.xyz / v_positionFromLightPOV.w) * 0.5 + 0.5;
        float bias = 0.000003;

        float hitByLight = texture(u_shadowMap,  lightPosInTexture - bias) == 0.0 ? 0.0 : 1.0;

        outputColor = normalsColor * light * hitByLight;

        outputColor + ambientLight;
        outputColor = vec4(outputColor.rgb, 1.0);
    }`;


// --------------------------------------------------------------------------------------------------------------


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
        outputColor = vec4(vec3(gl_FragCoord.z), 1);
    }
    `;


// --------------------------------------------------------------------------------------------------------------


const PIXELATE_VERTEXSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    in vec2 a_positions;
    out vec2 v_texcoord;

    void main() {
        gl_Position = vec4(a_positions, 0.0, 1.0);
        v_texcoord = (a_positions + 1.0) * 0.5;
    }`;

const PIXELATE_FRAGMENTSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    in vec2 v_texcoord;
    out vec4 outputColor;

    uniform sampler2D u_texture;

    void main() {
        outputColor = texture(u_texture, v_texcoord);
    }
    `;

// --------------------------------------------------------------------------------
// shader code end
