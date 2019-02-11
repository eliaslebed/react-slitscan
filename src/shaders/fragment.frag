precision mediump float;

uniform float time;
uniform sampler2D tex;

varying vec2 v_texcoord;

float upDown(float v) {
  return sin(v) * .5 + .5;
}

void main() {
  float t1 = time;
  float t2 = time * 0.37;

  float v = v_texcoord.y;

  float off1 = sin((v + 0.5) * mix(1., 9., upDown(t1))) * .2;
  float off2 = sin((v + 0.5) * mix(1., 4., upDown(t2))) * .1;
  float off = off1 + off2;

  vec2 uv = vec2(
     v_texcoord.x,
     1. - (v + off));

  gl_FragColor = texture2D(tex, uv);
}
