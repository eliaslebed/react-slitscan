import React, { Component } from 'react'
import * as twgl from 'twgl.js'
import 'ccapture.js/src/tar'
import 'ccapture.js/src/download'
import * as CCapture from 'ccapture.js/src/CCapture.js'
import source from '../source/soruce.jpeg'

const fs = `
precision mediump float;

uniform float time;
uniform sampler2D tex;

varying vec2 v_texcoord;

float upDown(float v) {
  return sin(v) * .5 + .9;
}

void main() {
  float t1 = time;
  float t2 = time * 0.37;

  float v = v_texcoord.y;

  float off1 = sin((v + .5) * mix(1., 6., upDown(t1))) * .2;
  float off2 = sin((v + .5) * mix(1., 3., upDown(t2))) * .2;
  float off = off1 + off2;

  // like the canvas2d example if off = 0 then the image will just
  // be flattly stretched down the canvas. "off" is an offset in
  // texture coordinates of which part of the source image to use
  // for the current destination. 
 
  // In the canvas example off was in pixels since in +1 means use the
  // src image 1 pixel lower than we would have used and -1 = one pixel higher

  // In shaders we work in texture coords which go from 0 to 1 regardless
  // of the size of the texture. So for example if the texture was 100 pixels
  // tall then off = 0.01 would offset by 1 pixel. We didn't pass in
  // the size of the canvas nor the size of the texture but of course we
  // we could if we thought that was important.

  vec2 uv = vec2(
     v_texcoord.x,
     1. - (v + off));

  gl_FragColor = texture2D(tex, uv);
}
`

const vs = `
attribute vec4 position;

varying vec2 v_texcoord;

void main() {
  gl_Position = position;
  v_texcoord = position.xy * .5 + .4;
}
`


class SlitScan extends Component {
  constructor() {
    super()
    this.capturer = new CCapture({
      format: 'jpg',
      workersPath: "node_modules/ccapture.js/src/",
      framerate: 60
    })
    this.state = { x: 0, y: 0 }
  }

  capturer

  componentDidMount() {
    const gl = this.refs.canvas.getContext('webgl', { antialias: true })
    const programInfo = twgl.createProgramInfo(gl, [vs, fs])
    const arrays = {
      position: {
        numComponents: 2,
        data: [
          -1, -1,
          1, -1,
          -1, 1,
          -1, 1,
          1, -1,
          1, 1,
        ],
      }
    }
    const uniforms = {
      tex: twgl.createTexture(gl, {
        src: source,
        crossOrigin: '',
      }),
      time: 0,
    }
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

    const render = time => {
      // const { x, y } = this.setState
      // uniforms.time = ((x + y) / 100)
      uniforms.time = time * 0.001
      twgl.resizeCanvasToDisplaySize(gl.canvas)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

      gl.useProgram(programInfo.program)

      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
      twgl.setUniforms(programInfo, uniforms)
      twgl.drawBufferInfo(gl, bufferInfo)
      requestAnimationFrame(render)
      this.capturer.capture(this.refs.canvas)

    }
    requestAnimationFrame(render)
  }

  startRecording() {
    this.capturer.start()
  }

  stopRecording() {
    this.capturer.stop()
    this.capturer.save()
  }

  handleMouseMove(e) {
    return this.setState = { x: e.screenX, y: e.screenY }
  }

  render() {
    return (
      <div className="slit-scan__wrapper">
        <canvas
          ref="canvas"
          style={{ height: '1200px', width: '630px' }}
          onMouseMove={(e) => this.handleMouseMove(e)}
        />
      </div>
    )
  }
}

export default SlitScan
