import React, { Component } from 'react'
import * as twgl from 'twgl.js'
import * as CCapture from 'ccapture.js/src/CCapture.js'
import source from '../source/source.jpg'
import vs from '../shaders/vertex.vert'
import fs from '../shaders/fragment.frag'

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

  initTwgl(canvas) {
    const gl = canvas.getContext('webgl', { antialias: true })
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

    return {
      gl,
      programInfo,
      uniforms,
      bufferInfo
    }
  }

  componentDidMount() {
    const { gl, programInfo, uniforms, bufferInfo } = this.initTwgl(this.refs.canvas)
    const render = time => {
      const { x, y } = this.setState
      uniforms.time = ((x + y) / 100)
      uniforms.time = time * 0.001
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.useProgram(programInfo.program)

      twgl.resizeCanvasToDisplaySize(gl.canvas)
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
          style={{ height: '756px', width: '1008px' }}
          onMouseMove={(e) => this.handleMouseMove(e)}
        />
      </div>
    )
  }
}

export default SlitScan
