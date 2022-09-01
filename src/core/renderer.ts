import { createNewCanvas } from "../utils";

const VERT_SRC = `
attribute vec2 aVertPos;
varying vec2 vTexCoord;
void main() {
  vTexCoord=(aVertPos+1.0)*0.5;
  gl_Position=vec4(aVertPos,0,1);
}`,
  FRAG_SRC = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;
void main() {
  gl_FragColor=texture2D(uSampler,vTexCoord);
}`;

export const initRenderer = (target: HTMLCanvasElement) => {
  const canvas = createNewCanvas();
  canvas.width = target.width;
  canvas.height = target.height;
  document.body.appendChild(canvas);

  const gl = canvas.getContext("webgl", { alpha: false })!,
    vertShader = gl.createShader(gl.VERTEX_SHADER)!,
    fragShader = gl.createShader(gl.FRAGMENT_SHADER)!,
    program = gl.createProgram()!,
    vertBuffer = gl.createBuffer(),
    texture = gl.createTexture();

  gl.shaderSource(vertShader, VERT_SRC);
  gl.compileShader(vertShader);
  gl.shaderSource(fragShader, FRAG_SRC);
  gl.compileShader(fragShader);
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const vertPosAttr = gl.getAttribLocation(program, "aVertPos"),
    samplerUniformLoc = gl.getUniformLocation(program, "uSampler");

  gl.enableVertexAttribArray(vertPosAttr);
  gl.vertexAttribPointer(vertPosAttr, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1i(samplerUniformLoc, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, target);

  return (canvas: HTMLCanvasElement) => {
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, canvas);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
};
