import accumulateFragmentShader from "./shaders/accumulate.frag";
import blendFragmentShader from "./shaders/blend.frag";
import blurFragmentShader from "./shaders/blur.frag";
import commonVertexShader from "./shaders/common.vert";
import copyFragmentShader from "./shaders/copy.frag";
import crtFragmentShader from "./shaders/crt.frag";

type TexFbo = { tex: WebGLTexture; fbo: WebGLFramebuffer };

export const initRenderer = (targetCanvas: HTMLCanvasElement) => {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;margin:0 auto;height:100%;";
  canvas.width = targetCanvas.clientWidth;
  canvas.height = targetCanvas.clientHeight;

  const gl = canvas.getContext("webgl")!,
    targetContext = targetCanvas.getContext("2d")!;

  targetCanvas.parentNode!.insertBefore(canvas, targetCanvas);
  targetCanvas.style.opacity = "0";

  const unbind = (...args: any[]) => {
      for (let i = 0; i < args.length; ++i) {
        const arg = args[i];
        switch (arg) {
          case gl.FRAMEBUFFER:
            gl.bindFramebuffer(arg, null);
            break;
          case gl.TEXTURE_2D:
            gl.bindTexture(arg, null);
            break;
          case gl.ARRAY_BUFFER:
            gl.bindBuffer(arg, null);
            break;
          default:
            gl.activeTexture(arg);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
      }
    },
    compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        throw "could not compile shader:" + info;
      }
      return shader;
    },
    vs = compileShader(commonVertexShader, gl.VERTEX_SHADER),
    fs_crt = compileShader(crtFragmentShader, gl.FRAGMENT_SHADER),
    fs_blur = compileShader(blurFragmentShader, gl.FRAGMENT_SHADER),
    fs_accumulate = compileShader(accumulateFragmentShader, gl.FRAGMENT_SHADER),
    fs_blend = compileShader(blendFragmentShader, gl.FRAGMENT_SHADER),
    fs_copy = compileShader(copyFragmentShader, gl.FRAGMENT_SHADER),
    createProgram = (vs: WebGLShader, fs: WebGLShader, name: string) => {
      const program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        throw "shader " + name + " failed to link:" + info;
      }
      return program;
    };

  const crt_program = createProgram(vs, fs_crt, "crt_program"),
    loc_crt_pos = gl.getAttribLocation(crt_program, "pos"),
    loc_crt_time = gl.getUniformLocation(crt_program, "time"),
    loc_crt_backbuffer = gl.getUniformLocation(crt_program, "backbuffer"),
    loc_crt_blurbuffer = gl.getUniformLocation(crt_program, "blurbuffer"),
    loc_crt_resolution = gl.getUniformLocation(crt_program, "resolution"),
    blur_program = createProgram(vs, fs_blur, "blur_program"),
    loc_blur_pos = gl.getAttribLocation(blur_program, "pos"),
    loc_blur_blur = gl.getUniformLocation(blur_program, "blur"),
    loc_blur_texture = gl.getUniformLocation(blur_program, "texture"),
    accumulate_program = createProgram(vs, fs_accumulate, "accumulate_program"),
    loc_accumulate_pos = gl.getAttribLocation(accumulate_program, "pos"),
    loc_accumulate_tex0 = gl.getUniformLocation(accumulate_program, "tex0"),
    loc_accumulate_tex1 = gl.getUniformLocation(accumulate_program, "tex1"),
    loc_accumulate_modulate = gl.getUniformLocation(accumulate_program, "modulate"),
    blend_program = createProgram(vs, fs_blend, "blend_program"),
    loc_blend_pos = gl.getAttribLocation(blend_program, "pos"),
    loc_blend_tex0 = gl.getUniformLocation(blend_program, "tex0"),
    loc_blend_tex1 = gl.getUniformLocation(blend_program, "tex1"),
    loc_blend_modulate = gl.getUniformLocation(blend_program, "modulate"),
    copy_program = createProgram(vs, fs_copy, "copy_program"),
    loc_copy_pos = gl.getAttribLocation(copy_program, "pos"),
    loc_copy_tex0 = gl.getUniformLocation(copy_program, "tex0"),
    posBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1]),
    gl.STATIC_DRAW
  );
  unbind(gl.ARRAY_BUFFER);

  const bindVertexBuffer = (loc_pos: number) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(loc_pos, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(loc_pos);
    },
    tex_backbuffer = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex_backbuffer);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  unbind(gl.TEXTURE_2D);

  const texFbos: TexFbo[] = [];
  for (let i = 0; i < 4; ++i) {
    const tex = gl.createTexture(),
      fbo = gl.createFramebuffer();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    unbind(gl.TEXTURE_2D);
    texFbos.push({ tex: tex!, fbo: fbo! });
  }
  const blur_buf = texFbos[0],
    blur_tmp = texFbos[1],
    accum_buf = texFbos[2],
    accum_cpy = texFbos[3],
    drawBlurAxis = (srcTex: WebGLTexture, dstBuf: WebGLFramebuffer, blurX: number, blurY: number) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dstBuf);
      gl.useProgram(blur_program);
      bindVertexBuffer(loc_blur_pos);
      gl.uniform2f(loc_blur_blur, blurX, blurY);
      gl.uniform1i(loc_blur_texture, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, srcTex);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      unbind(gl.TEXTURE_2D, gl.ARRAY_BUFFER, gl.FRAMEBUFFER);
    },
    drawBlur = (srcTex: WebGLTexture, dstBuf: WebGLFramebuffer, tmp: TexFbo, r: number, w: number, h: number) => {
      drawBlurAxis(srcTex, tmp.fbo, r / w, 0);
      drawBlurAxis(tmp.tex, dstBuf, 0, r / h);
    },
    drawCopy = (srcTex: WebGLTexture, dstBuf: WebGLFramebuffer) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dstBuf);
      gl.useProgram(copy_program);
      bindVertexBuffer(loc_copy_pos);
      gl.uniform1i(loc_copy_tex0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, srcTex);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      unbind(gl.TEXTURE_2D, gl.ARRAY_BUFFER, gl.FRAMEBUFFER);
    };

  let lastDw = -1,
    lastDh = -1;

  return (now: number) => {
    /* hack fix for Safari: texImage2D fails to copy targetCanvas to tex_backbuffer */
    targetContext.resetTransform();
    targetContext.clearRect(-1, -1, 1, 1);

    let targetScale = Math.ceil(
      Math.max(targetCanvas.clientWidth / targetCanvas.width, targetCanvas.clientHeight / targetCanvas.height)
    );
    targetScale = Math.max(1, Math.min(4, targetScale));

    const dw = targetCanvas.width * targetScale,
      dh = targetCanvas.height * targetScale,
      time = now * 0.001;

    if (lastDw != dw || lastDh != dh) {
      for (let i = 0; i < texFbos.length; ++i) {
        const texture = texFbos[i].tex,
          framebuffer = texFbos[i].fbo;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dw, dh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        unbind(gl.TEXTURE_2D, gl.FRAMEBUFFER);
      }
    }

    /* blit targe screen to backbuffer; backbuffer = texImage2D(targetCanvas) */
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex_backbuffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, targetCanvas);
    unbind(gl.TEXTURE_2D);

    gl.viewport(0, 0, dw, dh);

    /* blur previous accumulation buffer; blur_buf = blur(accum_cpy) */
    drawBlur(accum_cpy.tex, blur_buf.fbo, blur_tmp, 1.0, dw, dh);

    /* update accumulation buffer; accum_buf = accumulate(backbuffer, blur_buf) */
    gl.bindFramebuffer(gl.FRAMEBUFFER, accum_buf.fbo);
    gl.useProgram(accumulate_program);
    bindVertexBuffer(loc_accumulate_pos);
    gl.uniform1i(loc_accumulate_tex0, 0);
    gl.uniform1i(loc_accumulate_tex1, 1);
    gl.uniform1f(loc_accumulate_modulate, 1.0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex_backbuffer);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, blur_buf.tex);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    unbind(gl.TEXTURE0, gl.TEXTURE1, gl.ARRAY_BUFFER, gl.FRAMEBUFFER);

    /* store copy of accumulation buffer; accum_cpy = copy(accum_buf) */
    drawCopy(accum_buf.tex, accum_cpy.fbo);

    /* blend accumulation and backbuffer; accum_buf = blend(backbuffer, accum_cpy) */
    gl.bindFramebuffer(gl.FRAMEBUFFER, accum_buf.fbo);
    gl.useProgram(blend_program);
    bindVertexBuffer(loc_blend_pos);
    gl.uniform1i(loc_blend_tex0, 0);
    gl.uniform1i(loc_blend_tex1, 1);
    gl.uniform1f(loc_blend_modulate, 1.0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex_backbuffer);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, accum_cpy.tex);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    unbind(gl.TEXTURE0, gl.TEXTURE1, gl.ARRAY_BUFFER, gl.FRAMEBUFFER);

    /* add slight blur to backbuffer; accum_buf = blur(accum_buf) */
    drawBlur(accum_buf.tex, accum_buf.fbo, blur_tmp, 0.17, dw, dh);

    /* create fully blurred version of backbuffer; blur_buf = blur(accum_buf) */
    drawBlur(accum_buf.tex, blur_buf.fbo, blur_tmp, 1.0, dw, dh);

    /* ensure crt canvas overlays targetCanvas */
    const cw = (canvas.width = targetCanvas.clientWidth),
      ch = (canvas.height = targetCanvas.clientHeight);
    gl.viewport(0, 0, cw, ch);

    /* apply crt shader; canvas = crt(accum_buf, blur_buf) */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(crt_program);
    bindVertexBuffer(loc_crt_pos);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, accum_buf.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, blur_buf.tex);
    gl.uniform2f(loc_crt_resolution, cw, ch);
    gl.uniform1f(loc_crt_time, 1.5 * time);
    gl.uniform1i(loc_crt_backbuffer, 0);
    gl.uniform1i(loc_crt_blurbuffer, 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    unbind(gl.TEXTURE0, gl.TEXTURE1, gl.ARRAY_BUFFER, gl.FRAMEBUFFER);

    lastDw = dw;
    lastDh = dh;
  };
};
