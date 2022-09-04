precision mediump float;
varying vec2 uv;
uniform vec2 blur;
uniform sampler2D texture;
void main() {
  vec4 sum=texture2D(texture,uv)*0.2270270270;
  sum+=texture2D(texture,vec2(uv.x-4.0*blur.x,uv.y-4.0*blur.y))*0.0162162162;
  sum+=texture2D(texture,vec2(uv.x-3.0*blur.x,uv.y-3.0*blur.y))*0.0540540541;
  sum+=texture2D(texture,vec2(uv.x-2.0*blur.x,uv.y-2.0*blur.y))*0.1216216216;
  sum+=texture2D(texture,vec2(uv.x-1.0*blur.x,uv.y-1.0*blur.y))*0.1945945946;
  sum+=texture2D(texture,vec2(uv.x+1.0*blur.x,uv.y+1.0*blur.y))*0.1945945946;
  sum+=texture2D(texture,vec2(uv.x+2.0*blur.x,uv.y+2.0*blur.y))*0.1216216216;
  sum+=texture2D(texture,vec2(uv.x+3.0*blur.x,uv.y+3.0*blur.y))*0.0540540541;
  sum+=texture2D(texture,vec2(uv.x+4.0*blur.x,uv.y+4.0*blur.y))*0.0162162162;
  gl_FragColor=sum;
}
