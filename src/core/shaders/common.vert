attribute vec4 pos;
varying vec2 uv;
void main() {
  gl_Position = vec4(pos.xy, 0, 1);
  uv = pos.zw;
}
