precision mediump float;
varying vec2 uv;
uniform vec2 resolution;
uniform float time;
uniform sampler2D backbuffer;
uniform sampler2D blurbuffer;
vec3 tsample(sampler2D samp, vec2 tc) {
  vec3 s=pow(abs(texture2D(samp,vec2(tc.x,1.0-tc.y)).rgb),vec3(2.2));
  return s*vec3(1.25);
}
vec3 filmic(vec3 lcol) {
  vec3 x=max(vec3(0),lcol-vec3(0.004));
  return (x*(6.2*x+0.5))/(x*(6.2*x+1.7)+0.06);
}
vec2 curve(vec2 uv) {
  uv=(uv-0.5)*2.0;
  uv*=vec2(1.049,1.042);
  uv-=vec2(-0.008,0.008);
  uv.x*=1.0+pow(abs(uv.y)/5.0,2.0);
  uv.y*=1.0+pow(abs(uv.x)/4.0,2.0);
  uv=uv*0.5+0.5;
  return uv;
}
highp float rand(vec2 co) {
  /* iPad needs highp to avoid artifacts */
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt = dot(co.xy,vec2(a,b));
  highp float sn = mod(dt,3.14);
  return fract(sin(sn) * c);
}
void main() {
  /* curve */
  vec2 curved_uv=mix(curve(uv),uv,0.4);
  #if 0 /* dead code in original */
    float scale=0.04;
    vec2 scuv=curved_uv*(1.0-scale)+scale*0.5+vec2(0.003,-0.001);
  #else
    vec2 scuv=curved_uv;
  #endif

  /* main color, bleed */
  vec3 col;
  float x=sin(0.1*time+curved_uv.y*13.0)
      *sin(0.23*time+curved_uv.y*19.0)
      *sin(0.3+0.11*time+curved_uv.y*23.0)
      *0.0012;
  float o=sin(gl_FragCoord.y/1.5)/resolution.x;
  x+=o*0.25;
  x*=0.2;
  col.r=tsample(backbuffer,vec2(x+scuv.x+0.0009,scuv.y+0.0009)).x+0.02;
  col.g=tsample(backbuffer,vec2(x+scuv.x+0.0000,scuv.y-0.0011)).y+0.02;
  col.b=tsample(backbuffer,vec2(x+scuv.x-0.0015,scuv.y+0.0000)).z+0.02;

  float i=clamp(col.r*0.299+col.g*0.587+col.b*0.114,0.0,1.0);
  i=pow(1.0-pow(i,2.0),1.0);
  i=(1.0-i)*0.85+0.15;

  /* ghosting */
  float ghs=0.15;
  vec3 r=tsample(blurbuffer, 
    vec2(x-0.014*1.0, -0.027)*0.85
      +0.007*vec2(0.35*sin(1.0/7.0 + 15.0*curved_uv.y + 0.9*time), 0.35*sin(2.0/7.0 + 10.0*curved_uv.y + 1.37*time))
      +vec2(scuv.x+0.001,scuv.y+0.001)
    ).xyz*vec3(0.5,0.25,0.25);
  vec3 g=tsample(blurbuffer, 
    vec2(x-0.019*1.0, -0.020)*0.85
      +0.007*vec2(0.35*cos(1.0/9.0 + 15.0*curved_uv.y + 0.5*time), 0.35*sin(2.0/9.0 + 10.0*curved_uv.y + 1.50*time))
      +vec2(scuv.x+0.000,scuv.y-0.002)
    ).xyz*vec3(0.25,0.5,0.25);
  vec3 b=tsample(blurbuffer, 
    vec2(x-0.017*1.0, -0.003)*0.85
      +0.007*vec2(0.35*sin(2.0/3.0 + 15.0*curved_uv.y + 0.7*time), 0.35*cos(2.0/3.0 + 10.0*curved_uv.y + 1.63*time))
      +vec2(scuv.x-0.002,scuv.y+0.000)
    ).xyz*vec3(0.25,0.25,0.5);

  vec3 ghost=vec3(0.0);
  ghost+=vec3(ghs*(1.0-0.299))*pow(clamp(vec3(3.0)*r,vec3(0.0),vec3(1.0)),vec3(2.0))*vec3(i);
  ghost+=vec3(ghs*(1.0-0.587))*pow(clamp(vec3(3.0)*g,vec3(0.0),vec3(1.0)),vec3(2.0))*vec3(i);
  ghost+=vec3(ghs*(1.0-0.114))*pow(clamp(vec3(3.0)*b,vec3(0.0),vec3(1.0)),vec3(2.0))*vec3(i);
  col+=ghost;

  /* level adjustment (curves) */
  col*=vec3(0.95,1.05,0.95);
  col=clamp(1.3*col+0.75*col*col+1.25*col*col*col*col*col,vec3(0.0),vec3(10.0));

  /* vignette */
  float vig=0.1+16.0*curved_uv.x*curved_uv.y*(1.0-curved_uv.x)*(1.0-curved_uv.y);
  #if 0 /* original */
    vig=1.3*pow(vig,0.5);
  #else /* less dark around edges; better for PICO-8 visibility */
    vig=1.5*pow(vig,0.25);
    vig=(vig>1.0) ? (1.0 + smoothstep(1.0,1.5,vig)*0.2) : vig;
  #endif
  col*=vig;

  /* scanlines */
  float scans=clamp(0.35+0.18*sin(6.0*time+curved_uv.y*resolution.y*1.5),0.0,1.0);
  float s=pow(scans,0.9);
  col*=s;

  /* vertical lines (shadow mask) */
  col*=1.0-0.23*clamp((mod(gl_FragCoord.xy.x,3.0))*0.5,0.0,1.0);
  
  /* tone map */
  col=filmic(col);

  /* noise */
  vec2 seed=curved_uv*resolution.xy;
  vec3 noise=pow(vec3(rand(seed+time),rand(seed+time*2.0),rand(seed+time*3.0)),vec3(1.5));
  col-=0.015*noise;

  /* flicker */
  col*=(1.0-0.004*(sin(50.0*time+curved_uv.y*2.0)*0.5+0.5));

  /* clamp */
  if (curved_uv.x < 0.0 || curved_uv.x > 1.0)
    col*= 0.0;
  if (curved_uv.y < 0.0 || curved_uv.y > 1.0)
    col*= 0.0;

  gl_FragColor = vec4(col, 1.0);
}
