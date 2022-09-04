precision mediump float;
varying vec2 uv;
uniform sampler2D tex0;
void main() {
  gl_FragColor = texture2D(tex0, uv);
}
