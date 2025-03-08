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
    out vec3 v_vertexPos;

    void main() {
        v_normal = mat3(u_mInstance) * a_normals;
        v_vertexPos = mat3(u_mInstance) * a_positions;

        gl_Position = u_mProj * u_mView * (u_mWorld * u_mInstance) * vec4(a_positions, 1.0); 
    }`;

const FRAGMENTSHADERSOURCECODE = /* glsl */ `#version 300 es
    precision highp float;

    in vec3 v_normal;
    in vec3 v_vertexPos;

    uniform vec3 u_lightdir;
    uniform vec3 u_color;
    uniform float u_alpha;

    uniform vec3 u_cameraPos;
    uniform vec3 u_globalLightPos;

    out vec4 outputColor;

    void main() {
        // color constants 
        vec3 ambientLightColor = vec3(0.05, 0.05, 0.1);
        vec3 globalLightColor = vec3(1.0, 1.0, 1.0);
        float shininess = 2.0;

        vec3 normal = normalize(v_normal);
        vec3 lightdir = normalize(u_lightdir);

        // diffuse lighting
        float diffuseAmount = u_alpha >= 1.0 ? max(dot(normal, -lightdir), 0.0) : 1.0;

        // specular highlight 
        vec3 toGlobalLight = u_globalLightPos - v_vertexPos;
        toGlobalLight = normalize(toGlobalLight);

        vec3 specularReflectionDirection = normalize( 2.0 * dot(v_normal, toGlobalLight) * v_normal - toGlobalLight );
        vec3 toCamera = normalize(u_cameraPos - v_vertexPos);
        float specularSpreadAngle = dot(specularReflectionDirection, toCamera);
        specularSpreadAngle = clamp(specularSpreadAngle, 0.0, 1.0);
        specularSpreadAngle = pow(specularSpreadAngle, shininess);

        vec3 specularColor = globalLightColor * min(specularSpreadAngle, diffuseAmount);
        vec3 objectColor = u_color * diffuseAmount;

        vec3 currentColor = ambientLightColor + specularColor + objectColor;
        //currentColor *= u_alpha; // uncomment to have more "accurate colors", without this line transparent objects look holographic
        outputColor = vec4(currentColor, u_alpha);
    }`;