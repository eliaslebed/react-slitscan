import React, { Component } from 'react'
import * as twgl from 'twgl.js'
import source from '../source/source.jpeg'
import vs from '../shaders/vertex.vert'
import fs from '../shaders/fragment.frag'

class SlitScan extends Component {
  options = { mimeType: 'video/webm;codecs=h264,vp9,opus' }
  mediaRecorder
  source

  constructor() {
    super()
    this.state = { x: 0, y: 0 }
    this.video = React.createRef()
    this.canvas = React.createRef()
    this.recordedBlobs = []
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
    const { gl, programInfo, uniforms, bufferInfo } = this.initTwgl(this.canvas)
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
    }
    requestAnimationFrame(render)
  }

  handleStop(event) {
    const superBuffer = new Blob(this.recordedBlobs, { type: 'video/webm;codecs=h264,vp9,opus' })
    this.video.src = window.URL.createObjectURL(superBuffer)
  }

  handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data)
    }
  }

  startRecording = () => {
    this.source = this.canvas.captureStream(60)
    this.mediaRecorder = new MediaRecorder(this.source, this.options)
    this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this)
    this.mediaRecorder.start(100)
  }

  stopRecording = () => {
    this.mediaRecorder.onstop = this.handleStop.bind(this)
    this.mediaRecorder.stop()
  }

  handleMouseMove(e) {
    return this.setState = { x: e.screenX, y: e.screenY }
  }

  render() {
    return (
      <div className="container">
        <div className="col-6">
          <canvas
            ref={n => this.canvas = n}
            style={{ height: '1344px', width: '1008px' }}
            onMouseMove={(e) => this.handleMouseMove(e)}
          />
        </div>
        <div className="col-6">
          <div className="video__wrapper">
            <video controls ref={n => this.video = n}/>
          </div>
        </div>
        <div className="slit-scan__cta">
          <button onClick={this.startRecording.bind(this)}>Start</button>
          <button onClick={this.stopRecording.bind(this)}>Stop</button>
        </div>
      </div>
    )
  }
}

export default SlitScan
