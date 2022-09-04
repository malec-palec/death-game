precision mediump float;
varying vec2 uv;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform float modulate;
void main() {
  vec4 a = texture2D(tex0, uv) * vec4(modulate);
  vec4 b = texture2D(tex1, uv);
  gl_FragColor = max(a, b * 0.32);
}
