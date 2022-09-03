import { createNewCanvas } from "../utils";

const VERT_SRC = `
attribute vec2 aVertPos;
varying vec2 vUV;
void main() {
  vUV=(aVertPos+1.0)*0.5;
  gl_Position=vec4(aVertPos,0,1);
}`,
  FRAG_SRC = `
precision mediump float;

#define PI 3.1415926538

varying vec2 vUV;
uniform sampler2D uSampler;

uniform vec2 curvature;
uniform vec2 screenResolution;
uniform vec2 scanLineOpacity;
uniform float brightness;

uniform float vignetteOpacity;
uniform float vignetteRoundness;

vec2 curveRemapUV(vec2 uv) {
  uv=uv*2.0-1.0;
  vec2 offset=abs(uv.yx)/vec2(curvature.x, curvature.y);
  uv=uv+uv*offset*offset;
  uv=uv*0.5+0.5;
  return uv;
}

vec4 scanLineIntensity(float uv, float resolution, float opacity) {
  float intensity = sin(uv*resolution*PI*2.0);
  intensity = ((0.5*intensity)+0.5)*0.9+0.1;
  return vec4(vec3(pow(intensity, opacity)), 1.0);
}

void DrawScanline(inout vec4 color, vec2 uv) {
  float iTime = 1.0;
  float scanline = clamp(0.95+0.05*cos(3.14*(uv.y+0.008*iTime)*240.0*1.0),0.0,1.0);
  float grille=0.85+0.15*clamp(1.5*cos(3.14*uv.x*640.0*1.0),0.0,1.0);   
  color*=scanline*grille*1.2;
}

vec4 vignetteIntensity(vec2 uv, vec2 resolution, float opacity, float roundness) {
  float intensity = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
  return vec4(vec3(clamp(pow((resolution.x / roundness) * intensity, opacity), 0.0, 1.0)), 1.0);
}

#define ATARI_REZ vec2(160, 96)

void main() {
  vec2 uv = curveRemapUV(vUV);
  vec4 color = texture2D(uSampler, uv);
  color *= vignetteIntensity(uv, screenResolution, vignetteOpacity, vignetteRoundness);

  // DrawScanline(color, uv);

  color *= scanLineIntensity(uv.x, screenResolution.y, scanLineOpacity.x);
  color *= scanLineIntensity(uv.y, screenResolution.x, scanLineOpacity.y);
  color *= vec4(vec3(brightness), 1.0);

  if (uv.x<0.0||uv.y<0.0||uv.x>1.0||uv.y>1.0){
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    // float scanAmt = mix(0.8, 1.0, sin(3.14 * fract(atariXy.y)));
    // color.rgb *= scanAmt;

    // vec2 fragCoord = vUV * vec2(320, 240);
    // color.rgb -= mod(fragCoord.y, 2.0) < 1.0 ? 0.5 : 0.0;
    // color.rgb *= 1.0-0.65*vec3(clamp((mod(fragCoord.x, 2.0)-1.0)*2.0,0.0,1.0));
    // color.rgb *= vec3(brightness);

    gl_FragColor = color;
  }
}`;

export const initRenderer = (target: HTMLCanvasElement) => {
  const canvas = createNewCanvas(),
    origWidth = (canvas.width = target.width),
    origHeight = (canvas.height = target.height);

  const initScale = 1.5;
  canvas.width = origWidth * initScale;
  canvas.height = origHeight * initScale;
  canvas.style.cssText = "display:block;margin:0 auto;height:100%;";

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
    samplerUniformLoc = gl.getUniformLocation(program, "uSampler"),
    curvUniformLoc = gl.getUniformLocation(program, "curvature"),
    screenResUniformLoc = gl.getUniformLocation(program, "screenResolution"),
    scanLineOpacUniformLoc = gl.getUniformLocation(program, "scanLineOpacity"),
    brightnessUniformLoc = gl.getUniformLocation(program, "brightness"),
    vignetteOpacUniformLoc = gl.getUniformLocation(program, "vignetteOpacity"),
    vignetteRoundUniformLoc = gl.getUniformLocation(program, "vignetteRoundness");

  gl.enableVertexAttribArray(vertPosAttr);
  gl.vertexAttribPointer(vertPosAttr, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1i(samplerUniformLoc, 0);

  gl.uniform2f(curvUniformLoc, 3.0, 3.0);
  gl.uniform2f(screenResUniformLoc, origWidth, origHeight);
  gl.uniform2f(scanLineOpacUniformLoc, 1, 1);
  gl.uniform1f(brightnessUniformLoc, 4);
  gl.uniform1f(vignetteOpacUniformLoc, 1);
  gl.uniform1f(vignetteRoundUniformLoc, 2);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, target);

  return {
    render(canvas: HTMLCanvasElement) {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, canvas);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    setScale(value: number) {
      canvas.width = origWidth * value;
      canvas.height = origHeight * value;
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    setCurvature(x: number, y: number) {
      gl.uniform2f(curvUniformLoc, x, y);
    },
    setScreenResolution(width: number, height: number) {
      gl.uniform2f(screenResUniformLoc, width, height);
    },
    setScanLineOpacity(x: number, y: number) {
      gl.uniform2f(scanLineOpacUniformLoc, x, y);
    },
    setBrightness(value: number) {
      gl.uniform1f(brightnessUniformLoc, value);
    },
    setVignetteOpacity(value: number) {
      gl.uniform1f(vignetteOpacUniformLoc, value);
    },
    setVignetteRoundness(value: number) {
      gl.uniform1f(vignetteRoundUniformLoc, value);
    }
  };
};
