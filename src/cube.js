const cube_vertexCount = 24; 

class Cube {
    constructor(pos = [0, 0, 0], scale = [1, 1, 1]) {
        this.pos = vec3.fromValues(pos[0], pos[1], pos[2]);
        this.scale = scale;

        this.matrix = mat4.create();
        mat4.identity(this.matrix);
        mat4.translate(this.matrix, this.matrix, this.pos);
        mat4.scale(this.matrix, this.matrix, this.scale);
    }
}

const cube_vertices = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,
    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,
    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,
    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
];

const cube_textureCoords = [
    // Front
    0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0,
    // Back
    1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
    // Top
    0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0,
    // Bottom
    0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0,
    // Right
    1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
    // Left
    0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0,
];

const cube_vertexIndices = [
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
];