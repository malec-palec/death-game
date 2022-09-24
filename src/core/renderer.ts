import accumulateFragmentShader from "./shaders/accumulate.frag";
import blendFragmentShader from "./shaders/blend.frag";
import blurFragmentShader from "./shaders/blur.frag";
import commonVertexShader from "./shaders/common.vert";
import copyFragmentShader from "./shaders/copy.frag";
import crtFragmentShader from "./shaders/crt.frag";

type TexFbo = { tex: WebGLTexture; fbo: WebGLFramebuffer };

const enum GL {
  ARRAY_BUFFER = 0x8892,
  CLAMP_TO_EDGE = 0x812f,
  COLOR_ATTACHMENT0 = 0x8ce0,
  COMPILE_STATUS = 0x8b81,
  FLOAT = 0x1406,
  FRAGMENT_SHADER = 0x8b30,
  FRAMEBUFFER = 0x8d40,
  LINEAR = 0x2601,
  LINK_STATUS = 0x8b82,
  NEAREST = 0x2600,
  RGBA = 0x1908,
  STATIC_DRAW = 0x88e4,
  TEXTURE0 = 0x84c0,
  TEXTURE1 = 0x84c1,
  TEXTURE_2D = 0x0de1,
  TEXTURE_MAG_FILTER = 0x2800,
  TEXTURE_MIN_FILTER = 0x2801,
  TEXTURE_WRAP_S = 0x2802,
  TEXTURE_WRAP_T = 0x2803,
  TRIANGLE_FAN = 0x0006,
  UNSIGNED_BYTE = 0x1401,
  VERTEX_SHADER = 0x8b31
}

const initRenderer = (targetCanvas: HTMLCanvasElement) => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl")!;
  const glGetUniformLocation = gl.getUniformLocation.bind(gl);
  const targetContext = targetCanvas.getContext("2d")!;
  const unbind = (...args: any[]) => {
    for (const arg of args) {
      switch (arg) {
        case GL.FRAMEBUFFER:
          gl.bindFramebuffer(arg, null);
          break;
        case GL.TEXTURE_2D:
          gl.bindTexture(arg, null);
          break;
        case GL.ARRAY_BUFFER:
          gl.bindBuffer(arg, null);
          break;
        default:
          gl.activeTexture(arg);
          gl.bindTexture(GL.TEXTURE_2D, null);
      }
    }
  };
  const compileShader = (source: string, type: number) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      throw "could not compile shader:" + info;
    }
    return shader;
  };
  const vs = compileShader(commonVertexShader, GL.VERTEX_SHADER);
  const fs_crt = compileShader(crtFragmentShader, GL.FRAGMENT_SHADER);
  const fs_blur = compileShader(blurFragmentShader, GL.FRAGMENT_SHADER);
  const fs_accumulate = compileShader(accumulateFragmentShader, GL.FRAGMENT_SHADER);
  const fs_blend = compileShader(blendFragmentShader, GL.FRAGMENT_SHADER);
  const fs_copy = compileShader(copyFragmentShader, GL.FRAGMENT_SHADER);
  const createProgram = (vs: WebGLShader, fs: WebGLShader, name: string) => {
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, GL.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw "shader " + name + " failed to link:" + info;
    }
    return program;
  };
  const crt_program = createProgram(vs, fs_crt, "crt_program");
  const loc_crt_pos = gl.getAttribLocation(crt_program, "pos");
  const loc_crt_time = glGetUniformLocation(crt_program, "time");
  const loc_crt_backbuffer = glGetUniformLocation(crt_program, "backbuffer");
  const loc_crt_blurbuffer = glGetUniformLocation(crt_program, "blurbuffer");
  const loc_crt_resolution = glGetUniformLocation(crt_program, "resolution");
  const blur_program = createProgram(vs, fs_blur, "blur_program");
  const loc_blur_pos = gl.getAttribLocation(blur_program, "pos");
  const loc_blur_blur = glGetUniformLocation(blur_program, "blur");
  const loc_blur_texture = glGetUniformLocation(blur_program, "texture");
  const accumulate_program = createProgram(vs, fs_accumulate, "accumulate_program");
  const loc_accumulate_pos = gl.getAttribLocation(accumulate_program, "pos");
  const loc_accumulate_tex0 = glGetUniformLocation(accumulate_program, "tex0");
  const loc_accumulate_tex1 = glGetUniformLocation(accumulate_program, "tex1");
  const loc_accumulate_modulate = glGetUniformLocation(accumulate_program, "modulate");
  const blend_program = createProgram(vs, fs_blend, "blend_program");
  const loc_blend_pos = gl.getAttribLocation(blend_program, "pos");
  const loc_blend_tex0 = glGetUniformLocation(blend_program, "tex0");
  const loc_blend_tex1 = glGetUniformLocation(blend_program, "tex1");
  const loc_blend_modulate = glGetUniformLocation(blend_program, "modulate");
  const copy_program = createProgram(vs, fs_copy, "copy_program");
  const loc_copy_pos = gl.getAttribLocation(copy_program, "pos");
  const loc_copy_tex0 = glGetUniformLocation(copy_program, "tex0");
  const posBuffer = gl.createBuffer();
  const bindVertexBuffer = (loc_pos: number) => {
    gl.bindBuffer(GL.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(loc_pos, 4, GL.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc_pos);
  };
  const tex_backbuffer = gl.createTexture();
  const texFbos: Array<TexFbo> = [];
  const drawBlurAxis = (srcTex: WebGLTexture, dstBuf: WebGLFramebuffer, blurX: number, blurY: number) => {
    gl.bindFramebuffer(GL.FRAMEBUFFER, dstBuf);
    gl.useProgram(blur_program);
    bindVertexBuffer(loc_blur_pos);
    gl.uniform2f(loc_blur_blur, blurX, blurY);
    gl.uniform1i(loc_blur_texture, 0);
    gl.activeTexture(GL.TEXTURE0);
    gl.bindTexture(GL.TEXTURE_2D, srcTex);
    gl.drawArrays(GL.TRIANGLE_FAN, 0, 4);
    unbind(GL.TEXTURE_2D, GL.ARRAY_BUFFER, GL.FRAMEBUFFER);
  };
  const drawBlur = (srcTex: WebGLTexture, dstBuf: WebGLFramebuffer, tmp: TexFbo, r: number, w: number, h: number) => {
    drawBlurAxis(srcTex, tmp.fbo, r / w, 0);
    drawBlurAxis(tmp.tex, dstBuf, 0, r / h);
  };
  const drawCopy = (srcTex: WebGLTexture, dstBuf: WebGLFramebuffer) => {
    gl.bindFramebuffer(GL.FRAMEBUFFER, dstBuf);
    gl.useProgram(copy_program);
    bindVertexBuffer(loc_copy_pos);
    gl.uniform1i(loc_copy_tex0, 0);
    gl.activeTexture(GL.TEXTURE0);
    gl.bindTexture(GL.TEXTURE_2D, srcTex);
    gl.drawArrays(GL.TRIANGLE_FAN, 0, 4);
    unbind(GL.TEXTURE_2D, GL.ARRAY_BUFFER, GL.FRAMEBUFFER);
  };

  let lastDw = -1;
  let lastDh = -1;
  let i: number;
  let targetScale: number;

  canvas.style.cssText = "display:block;margin:0 auto;height:100%;";
  canvas.width = targetCanvas.clientWidth;
  canvas.height = targetCanvas.clientHeight;

  targetCanvas.parentNode!.insertBefore(canvas, targetCanvas);
  targetCanvas.style.opacity = "0";

  gl.bindBuffer(GL.ARRAY_BUFFER, posBuffer);
  gl.bufferData(
    GL.ARRAY_BUFFER,
    new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1]),
    GL.STATIC_DRAW
  );
  unbind(GL.ARRAY_BUFFER);

  gl.activeTexture(GL.TEXTURE0);
  gl.bindTexture(GL.TEXTURE_2D, tex_backbuffer);
  gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
  gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
  gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
  gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
  unbind(GL.TEXTURE_2D);

  for (i = 0; i < 4; ++i) {
    const tex = gl.createTexture()!;
    const fbo = gl.createFramebuffer()!;
    gl.activeTexture(GL.TEXTURE0);
    gl.bindTexture(GL.TEXTURE_2D, tex);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    unbind(GL.TEXTURE_2D);
    texFbos.push({ tex, fbo });
  }
  const blur_buf = texFbos[0];
  const blur_tmp = texFbos[1];
  const accum_buf = texFbos[2];
  const accum_cpy = texFbos[3];

  return (now: number) => {
    /* hack fix for Safari: texImage2D fails to copy targetCanvas to tex_backbuffer */
    targetContext.resetTransform();
    targetContext.clearRect(-1, -1, 1, 1);

    targetScale = Math.ceil(
      Math.max(targetCanvas.clientWidth / targetCanvas.width, targetCanvas.clientHeight / targetCanvas.height)
    );
    targetScale = Math.max(1, Math.min(4, targetScale));

    const dw = targetCanvas.width * targetScale;
    const dh = targetCanvas.height * targetScale;
    const cw = (canvas.width = targetCanvas.clientWidth);
    const ch = (canvas.height = targetCanvas.clientHeight);
    const time = now * 0.001;

    if (lastDw != dw || lastDh != dh) {
      for (const { tex: texture, fbo: framebuffer } of texFbos) {
        gl.activeTexture(GL.TEXTURE0);
        gl.bindTexture(GL.TEXTURE_2D, texture);
        gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, dw, dh, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0);
        unbind(GL.TEXTURE_2D, GL.FRAMEBUFFER);
      }
    }

    /* blit targe screen to backbuffer; backbuffer = texImage2D(targetCanvas) */
    gl.activeTexture(GL.TEXTURE0);
    gl.bindTexture(GL.TEXTURE_2D, tex_backbuffer);
    gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, targetCanvas);
    unbind(GL.TEXTURE_2D);

    gl.viewport(0, 0, dw, dh);

    /* blur previous accumulation buffer; blur_buf = blur(accum_cpy) */
    drawBlur(accum_cpy.tex, blur_buf.fbo, blur_tmp, 1.0, dw, dh);

    /* update accumulation buffer; accum_buf = accumulate(backbuffer, blur_buf) */
    gl.bindFramebuffer(GL.FRAMEBUFFER, accum_buf.fbo);
    gl.useProgram(accumulate_program);
    bindVertexBuffer(loc_accumulate_pos);
    gl.uniform1i(loc_accumulate_tex0, 0);
    gl.uniform1i(loc_accumulate_tex1, 1);
    gl.uniform1f(loc_accumulate_modulate, 1.0);
    gl.activeTexture(GL.TEXTURE0);
    gl.bindTexture(GL.TEXTURE_2D, tex_backbuffer);
    gl.activeTexture(GL.TEXTURE1);
    gl.bindTexture(GL.TEXTURE_2D, blur_buf.tex);
    gl.drawArrays(GL.TRIANGLE_FAN, 0, 4);
    unbind(GL.TEXTURE0, GL.TEXTURE1, GL.ARRAY_BUFFER, GL.FRAMEBUFFER);

    /* store copy of accumulation buffer; accum_cpy = copy(accum_buf) */
    drawCopy(accum_buf.tex, accum_cpy.fbo);

    /* blend accumulation and backbuffer; accum_buf = blend(backbuffer, accum_cpy) */
    gl.bindFramebuffer(GL.FRAMEBUFFER, accum_buf.fbo);
    gl.useProgram(blend_program);
    bindVertexBuffer(loc_blend_pos);
    gl.uniform1i(loc_blend_tex0, 0);
    gl.uniform1i(loc_blend_tex1, 1);
    gl.uniform1f(loc_blend_modulate, 1.0);
    gl.activeTexture(GL.TEXTURE0);
    gl.bindTexture(GL.TEXTURE_2D, tex_backbuffer);
    gl.activeTexture(GL.TEXTURE1);
    gl.bindTexture(GL.TEXTURE_2D, accum_cpy.tex);
    gl.drawArrays(GL.TRIANGLE_FAN, 0, 4);
    unbind(GL.TEXTURE0, GL.TEXTURE1, GL.ARRAY_BUFFER, GL.FRAMEBUFFER);

    /* add slight blur to backbuffer; accum_buf = blur(accum_buf) */
    drawBlur(accum_buf.tex, accum_buf.fbo, blur_tmp, 0.17, dw, dh);

    /* create fully blurred version of backbuffer; blur_buf = blur(accum_buf) */
    drawBlur(accum_buf.tex, blur_buf.fbo, blur_tmp, 1.0, dw, dh);

    /* ensure crt canvas overlays targetCanvas */
    gl.viewport(0, 0, cw, ch);

    /* apply crt shader; canvas = crt(accum_buf, blur_buf) */
    gl.bindFramebuffer(GL.FRAMEBUFFER, null);
    gl.useProgram(crt_program);
    bindVertexBuffer(loc_crt_pos);
    gl.activeTexture(GL.TEXTURE0);
    gl.bindTexture(GL.TEXTURE_2D, accum_buf.tex);
    gl.activeTexture(GL.TEXTURE1);
    gl.bindTexture(GL.TEXTURE_2D, blur_buf.tex);
    gl.uniform2f(loc_crt_resolution, cw, ch);
    gl.uniform1f(loc_crt_time, 1.5 * time);
    gl.uniform1i(loc_crt_backbuffer, 0);
    gl.uniform1i(loc_crt_blurbuffer, 1);
    gl.drawArrays(GL.TRIANGLE_FAN, 0, 4);
    unbind(GL.TEXTURE0, GL.TEXTURE1, GL.ARRAY_BUFFER, GL.FRAMEBUFFER);

    lastDw = dw;
    lastDh = dh;
  };
};

export { initRenderer };
