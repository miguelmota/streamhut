import React, { Component } from 'react'
import hyperlinkify from 'hyperlinkify'
import {
  arrayBufferWithMime,
  arrayBufferMimeDecouple
} from 'arraybuffer-mime'

import Gun from 'gun'
import moment from 'moment'
import Header from './Header'
import Clipboard from './Clipboard'
import DragAndDrop from './DragAndDrop'
import Tag from './Tag'
import randomstring from 'randomstring'
import styled from 'styled-components'
import prettysize from 'prettysize'
import throttle from 'lodash/throttle'
import ansi from 'ansi-styles'

const ESC_KEY = 27

const green = t => `${ansi.greenBright.open}${t}${ansi.greenBright.close}`

var gun = Gun('ws://localhost:8765/gun')

function createWs() {
    const {pathname, host, protocol}  = window.location
    let wsurl = `${protocol === 'https:' ? `wss` : `ws`}://${host}${pathname}`
    //let wsurl = `ws://localhost:3001${pathname}`
    //let wsurl = `ws://192.168.86.96:3001${pathname}`
    const ws = new WebSocket(wsurl)
    ws.binaryType = 'arraybuffer'

    return ws
}

function getUrlParams() {
    return window.location.search.substr(1).split('&')
      .map(x => x.split('='))
      .reduce((obj, x) => {
        obj[x[0]] = x[1]
        return obj
      }, {})
}

function changeFavicon (uri) {
  const link = document.createElement('link')
  const oldLink = document.getElementById('favicon')

  link.id = 'favicon'
  link.rel = 'shortcut icon'
  link.href = uri

  if (oldLink) {
    document.head.removeChild(oldLink)
  }

  document.head.appendChild(link)
}

function updateWindowTitle () {
  if (document.hidden) {
    newMessageWindowTitle()
  } else {
    resetWindowTitle()
  }
}

function resetWindowTitle() {
  changeFavicon('https://s3.amazonaws.com/assets.streamhut.io/favicon.ico')
  document.title = 'Streamhut'
}

function newMessageWindowTitle() {
  changeFavicon('https://s3.amazonaws.com/assets.streamhut.io/favicon_alert.ico')
  document.title = '(new message) Streamhut'
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    resetWindowTitle()
  }
}, false)

function genRandString() {
  return randomstring.generate({
    length: 3,
    charset: 'alphabetic',
    capitalization: 'lowercase',
    readable: true
  })
}

const UI = {
  SiteContainer: styled.main`
  `,
  Header: styled.header`
    display: flex;
    justify-content: space-between;
    background: #e2e2e2;
    padding: 5px;
    position: relative;
    padding-right: 35px;
  `,
  Form: styled.form`
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: 0;
    background: #efefef;
    padding: 10px;
    position: relative;
    @media (max-width: 500px) {
      flex-direction: column;
    }
  `,
  FormGroup: styled.div`
    display: flex;
    justify-content: center;
    align-items: start;
    flex-direction: column;
    margin: 0;
    padding: 0.5em;

    &.file-form-group {
      min-width: 250px;
    }
    &.input-form-group {
      width: 100%;
    }
    &.submit-form-group {
    }
  `,
  Connections: styled.div`
    display: inline-block;
    width: auto;
    max-height: 120px;
    overflow: auto;
    font-size: 0.8em;
    white-space: pre-wrap;
    margin-bottom: 2em;
    background: rgba(239, 239, 239, 0.35);
    padding: 1em;
  `,
  Message: styled.div`
    background: #efefef;
    width: 100%;
    font-size: 12px;
    margin: 0 0 0.2em 0;

    article {
      display: flex;
      margin: 10px 0 15px 0;
      padding: 5px;
    }

    pre,
    code {
      width: 100%;
      overflow: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    img {
      max-width: 500px;
    }

    header {
      display: flex;
      justify-content: space-between;
      background: #e2e2e2;
      font-size: 0.8em;
      position: relative;
      padding: 0.4em 2em 0.4em 0.4em;
      overflow: hidden;
    }

    header:after {
      content: "";
      display: block;
      position: absolute;
      width: 2em;
      height: 4em;
      background: #fff;
      right: 0;
      top: 0;
      transform: rotate(-45deg) translate(1.7em,-1em);
    }

    footer {
      display: flex;
      font-size: 0.8em;
      justify-content: space-between;
      background: #e2e2e2;
      padding: 0.4em;
    }

    footer .download {
      margin-right: 10px;
    }

    footer .left {
      display: inline-flex;
      align-items: flex-start;
    }

    time {
      display: inline-flex;
      align-items: flex-end;
      font-size: 12px;
      text-align: right;
      color: #999;
    }
  `,
  NoMessages: styled.div`
    font-style: italic;
    color: #7b7b7b;
    font-size: 0.8em;
  `,
  /*background: #293238;*/
  TerminalContainer: styled.div`
    background-color: #000;
    padding-bottom: 2em; /* same as resizer height */
    position: relative;
    width: 100%;
    height: auto;
    overflow: hidden;
  `,
  Terminal: styled.div`
    &.blur {
      pointer-events: none;
      opacity: 0.8;
    }
  `,
  TerminalFooter: styled.footer`
    position: absolute;
    bottom: 15px;
    left: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 1em;
  `,
  TerminalResizer: styled.div`
    width: 100%;
    height: 2em;
    position: absolute;
    bottom: 0;
    cursor: ns-resize;
    background-color: #efefef;
    border: 1px solid #cacaca;
    text-align: center;
    font-size: 0.5em;
    color: #797979;
    &:hover {
      background-color: #e6e6e6;
      border-color: #adadad;
    }
  `,
  FullscreenButton: styled.button`
    font-size: 1em;
    span {
      display: inline-block;
    }
    &:hover {
      text-decoration: none;
    }
    &:hover span {
      text-decoration: underline;
    }
  `
}

class Channel extends Component {
  constructor(props) {
    super(props)

    this.state = {
      text: '',
      file: null,
      messages: [],
      shareUrl: window.location.href,
      fullScreen: false,
      queuedFiles: [],
      fullScreenUrl: '',
      terminalBlurred: true,
      channel: window.location.pathname.substr(1),
      terminalScrollable: false,
      hostname: window.location.hostname
    }

    const urlParams = getUrlParams()
    if ('f' in urlParams) {
      this.setFullScreen()
    }

    let p = window.location.pathname
    let q = window.location.search

    this.msgSeq = 0

    this.state.fullscreenUrl = `${p}${q}${q.length ? '&' : '?'}f=1`

    this.output = React.createRef()
    this.fileInput = React.createRef()
    this.terminalRef = React.createRef()
    this.terminalContainerRef = React.createRef()
    this.terminalResizerRef = React.createRef()
  }

  setFullScreen() {
    document.body.classList.add('fullscreen')
  }

  handleInput() {
    const { text } = this.state
    if (text) {
      const mime = 'text/plain'
      const blob = new Blob([text], {type: mime})
      const reader = new FileReader()

      reader.addEventListener('load', (event) => {
        const arrayBuffer = reader.result
        this.sendArrayBuffer(arrayBuffer, mime)
      })

      reader.readAsArrayBuffer(blob)
      this.setState({text: ''})
    }
  }

  handleSubmit(event) {
    event.preventDefault()

    // text stream
    this.handleInput()

    // file upload
    this.handleFile()

    this.setState({
      text: '',
    })
  }

  handleFileInputChange(event) {
    event.preventDefault()

    this.addFilesToQueue(event.target.files)
  }

  handleFile() {
    const files = this.state.queuedFiles
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`file:`, file, file.type)
      if (!file) return

      const reader = new FileReader()

      const readFile = (event) => {
        const arrayBuffer = reader.result
        const mime = file.type
        this.sendArrayBuffer(arrayBuffer, mime)
      }

      reader.addEventListener('load', readFile)
      reader.readAsArrayBuffer(file)
    }

    this.clearFilesQueue()
  }

  componentDidMount() {
      this.term = new window.Terminal({
        allowTransparency: false,
        bellStyle: 'none',
        bellSound: '',
        convertEol: true,
        scrollback: 10000,
        disableStdin: true,
        cursorStyle: 'block',
        cursorBlink: true,
        drawBoldTextInBrightColors: true,
        convertEol: true
      })
      let termNode = this.terminalRef.current
      termNode.style.display = 'block'
      this.term.open(termNode, false)
      this.blurTerminal()
      this.term.fit()
      window.addEventListener('resize', this.onWindowResize, false)

      let cmd = green(`exec>>>(nc ${this.state.hostname} 1337) 2>&1;echo \\#${this.state.channel}`)
      this.term.writeln(`To get started, run in your terminal:\n\n${cmd}\n`)

      this.setupTerminalResizer()

      this.term.on('blur', () => {
        this.blurTerminal()
      })
      this.term.on('key', (_, event) => {
        if (event.keyCode === ESC_KEY) {
          this.blurTerminal()
        }
      })

    this.ws = createWs();

    /*
    const connectionsLog = document.querySelector(`#connections`)
    */

    function logMessage(data) {
    //connectionsLog.innerHTML = JSON.stringify(data, null, 2)
    }

    this.ws.addEventListener('message', event => {
      this.handleIncomingMessage(event)
    })

    this.ws.addEventListener(`open`, () => {
      console.log(`connected`)
      //this.readCachedMessages()
    })

    this.ws.addEventListener(`close`, () => {
      console.log(`connection closed`)
    })

    document.addEventListener('keydown', event => {
      if (event.keyCode === ESC_KEY) {
        this.blurTerminal()
      }
    })

    const xtermViewport = document.querySelector('.xterm-viewport')
    xtermViewport.addEventListener('scroll', throttle(event => {
      if (this.state.terminalScrollable) {
        return
      }
      if (event.target.scrollHeight > event.target.clientHeight) {
        this.setState({
          terminalScrollable: true
        })
      }
    }, 100))
  }

  componentWillUnmount() {
    let resizer = this.terminalResizerRef.current
    resizer.removeEventListener('mousedown', this.onTerminalResizer, false)
    resizer.removeEventListener('touchstart', this.onTerminalResizer, false)

    window.removeEventListener('resize', this.onWindowResize, false)
  }

  focusTerminal() {
    this.terminalRef.current.classList.remove('blur')
    this.term.focus()
    this.setState({
      terminalBlurred: false
    })
  }

  blurTerminal() {
    this.terminalRef.current.classList.add('blur')
    this.setState({
      terminalBlurred: true
    })
  }

  onWindowResize = throttle(() => {
    this.term.fit()
  }, 20)

  onTerminalResizer = (event) => {
    if (event.offsetY < this.borderSize) {
      this.pos = event.y
      document.addEventListener('mousemove', this.resizeTerminal, false)
      document.addEventListener('touchmove', this.resizeTerminal, false)
    }
  }

  resizeTerminal = throttle(event => {
    console.log("HI")
    let container = this.terminalContainerRef.current
    let terminal = this.terminalRef.current
    const dy = this.pos - event.y
    this.pos = event.y
    const newHeight = (parseInt(getComputedStyle(container, '').height) - dy)
    container.style.height = newHeight + 'px'
    terminal.style.height = (newHeight-this.borderSize) + 'px'
    this.term.fit()
  }, 20)

  setupTerminalResizer() {
      let resizer = this.terminalResizerRef.current
      this.borderSize = parseInt(getComputedStyle(resizer, '').height)

      this.pos = 0

      resizer.addEventListener('mousedown', this.onTerminalResizer, false)
      resizer.addEventListener('touchend', this.onTerminalResizer, false)

      document.addEventListener('mouseup', event => {
        document.removeEventListener('mousemove', this.resizeTerminal, false)
      }, false)
      document.addEventListener('touchstart', event => {
        document.removeEventListener('touchmove', this.resizeTerminal, false)
      }, false)
  }

  async readCachedMessages() {
    const messages = this.state.messages
    const count = (await this.getCache('messages/count')) || 0
    console.log("COUNT", count)
    for (var i = 0; i < count; i++) {
      const k = 'messages/' + (i)
      const msg = await this.getCache(k)
      if (msg) {
        this.handleIncomingMessage(msg)
      }
    }

    this.setState({messages})
  }

  sendArrayBuffer(arrayBuffer, mime) {
    const abWithMime = arrayBufferWithMime(arrayBuffer, mime)
    try {
      this.ws.send(abWithMime)
    } catch(err) {
      console.error(err)
    }
  }

  async handleIncomingMessage(event) {
      let data
      if (typeof event === 'string') {
        let value = Buffer.from(event, "hex")
        value = value.buffer
        data = value
      } else {
        data = event.data
      }

      console.log('incoming...')

      try {
        const json = JSON.parse(data)
        if (json.__server_message__) {
          this.logMessage(json.__server_message__.data)
          return false
        }
      } catch(error) {

      }

      updateWindowTitle()

      console.log('data:', data)

      function buf2hex(buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
      }

      if (data) {
        console.log("1", data)
        this.putCache('messages/'+ this.incMsgSeq(), buf2hex(data))
      }

      const {mime, arrayBuffer} = arrayBufferMimeDecouple(data)

      console.log('received', mime)
      console.log(arrayBuffer)

      if (mime === 'shell') {
        const text = new window.TextDecoder('utf-8').decode(new Uint8Array(arrayBuffer))
        console.log(text)
        this.term.write(text)

        return false
      }

      const blob = new Blob([arrayBuffer], {type: mime})

      let ext = mime.split(`/`).join(`_`).replace(/[^\w\d_]/gi, ``)
      let url = window.URL.createObjectURL(blob)

      const t = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(reader.result)
        }

        reader.readAsText(blob)
      })

      const message = {
        blob: {
          size: blob.size,
          type: blob.type,
        },
        url,
        ext,
        mime,
        t
      }

      if (blob.size !== 0) {
        const messages = this.state.messages
        messages.push(message)



        this.setState({
          messages
        })
      }

      this.scrollToLatestMessages()
    }

    incMsgSeq() {
      this.msgSeq++
      this.putCache('messages/count', this.msgSeq)
      return this.msgSeq
    }

    scrollToLatestMessages() {
      const container = this.output.current
      if ((container.scrollTop + 200) >= (container.scrollHeight - container.clientHeight)) {
        container.scrollTo(0, container.scrollHeight)
      }
    }

  renderMessage(data) {
    if (!data) {
      return null
    }
    let { mime, blob, url, ext, t } = data
      let element = null
      let clipboardText = url

      if (/image/gi.test(mime)) {
        element = <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="view image">
          <img src={url} alt="" />
        </a>
      } else if (/video/gi.test(mime)) {
        element = [<div>
          <video src={url} controls="controls" />
        </div>]
      } else if (/audio/gi.test(mime)) {
        element = [<audio controlers="controls" src={url}/>]
      } else if (/zip/gi.test(mime)) {
        element = [<span>.zip</span>]
      } else if (/pdf/gi.test(mime)) {
        element = [<span>.pdf</span>]
      //} else if (/(json|javascript|text)/gi.test(mime)) {
      } else {
            // if the text is just an image url
            if (/^https?:\/\/[^\s\r\n]+(png|jpe?g|svg)$/i.test(t)) {
              url = t
              clipboardText = url
              element = <div>
                <img src={url} alt="" />
              </div>
            } else {
              let linked = hyperlinkify(t, {target: '_blank', rel: `noopener noreferrer`})
              clipboardText = linked

              element = <code
                dangerouslySetInnerHTML={{__html: linked}} />


            }
      }

      const filename = `${Date.now()}_${ext}`

      const timestamp = moment().format('LLLL')

    return <UI.Message key={url}>
      <UI.Header>
        <span>{blob.type} size: {prettysize(blob.size)}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="view asset">{url}↗</a>
      </UI.Header>
      <article>
        {element}
      </article>
      <footer>
        <div>
          <a
            href={url}
            download={filename}
            title="download asset"
          >download</a>
          <Clipboard
            style={{
              fontSize: '1em',
              marginLeft: '1em'
            }}
            clipboardText={clipboardText}
          />
        </div>
        <time>{timestamp}</time>
      </footer>
    </UI.Message>
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' && (event.shiftKey || event.ctrlKey || event.altKey)) {
      if (!event.shiftKey) {
        this.setState({
          text: this.state.text + '\n'
        })
      }
    } else if (event.key === 'Enter') {
      this.handleSubmit(event)
    }
  }

  handleDrop(files) {
    this.addFilesToQueue(files)
  }

  addFilesToQueue(files) {
    const list = this.state.queuedFiles
    for (let file of files) {
      list.push(file)
    }
    this.setState({
      queuedFiles: list
    })
  }

  clearFilesQueue() {
    this.setState({
      queuedFiles: []
    })

    this.fileInput.current.value = ''
  }

  onFileRemove(event, filename) {
    this.removeFileFromQueue(filename)
  }

  removeFileFromQueue(filename) {
    const list = this.state.queuedFiles
    for (let [i, file] of list.entries()) {
      if (file.name === filename) {
        list.splice(i, 1)
      }
    }
    this.setState({
      queuedFiles: list
    })
  }

  async getCache(key) {
    return new Promise((resolve) => {
      gun.get(this.state.channel).get(key).once((value, id) => {
        try {
          resolve(value)
        } catch(err) {
          resolve()
        }
      })
    })
  }

  putCache(key, value) {
    console.log('PUT', key, value)
    gun.get(this.state.channel).get(key).put(value)
  }

  render() {
    let messages = <UI.NoMessages>no messages</UI.NoMessages>
    if (this.state.messages.length) {
      messages = this.state.messages.map(x => this.renderMessage(x))
    }

    const { terminalBlurred, terminalScrollable } = this.state

    return (
      <UI.SiteContainer id="site-container">
        <Header
          shareUrl={this.state.shareUrl}
        />

      {/*
        <UI.Connections>
          <pre></pre>
        </UI.Connections>
        */}

        <UI.TerminalContainer
          ref={this.terminalContainerRef}
          onClick={event => this.focusTerminal()}>
          <UI.Terminal
            id="terminal"
            style={{
              height: '350px'
            }}
            ref={this.terminalRef} />
          <UI.TerminalFooter>
            {(terminalBlurred && terminalScrollable) && <div
              style={{
                display: 'inline-block',
                color: '#fff',
                marginRight: '1em',
                fontSize: '0.8em',
                opacity: '0.5'
              }}>
              click to scroll terminal
              </div>}
            {!terminalBlurred && <div
              style={{
                display: 'inline-block',
                color: '#fff',
                marginRight: '1em',
                fontSize: '0.8em',
                opacity: '0.5'
              }}>
              ESC to focus out
            </div>
            }
            <UI.FullscreenButton
              className="link">
              <span>fullscreen</span> ⤢
            </UI.FullscreenButton>
          </UI.TerminalFooter>
          <UI.TerminalResizer
            ref={this.terminalResizerRef}
          >☰</UI.TerminalResizer>
        </UI.TerminalContainer>

        <div>
          <output
            id="output"
            ref={this.output}>
            {messages}
          </output>
          <UI.Form
            id="form"
            onSubmit={event => this.handleSubmit(event)}>
            <UI.FormGroup
              className="file-form-group">
              <label>Files <small>Drag files into screen</small></label>
              <div style={{
                marginBottom: '0.5em'
              }}>
                <input
                  type="file"
                  multiple
                  id="file"
                  onChange={event => this.handleFileInputChange(event)}
                  ref={this.fileInput} />
              </div>
              <div className="queued-files">
                {this.state.queuedFiles.map(file =>
                  <Tag
                    className="file-tag"
                    key={file.name}
                    text={file.name}
                    onDelete={event => this.onFileRemove(event, file.name)}/>
                )}
              </div>
            </UI.FormGroup>
            <UI.FormGroup
              className="input-form-group"
              style={{
                  width: '100%'
              }}>
              <label>Text <small>enter to submit and shift-enter for newline</small></label>
              <textarea
                id="text"
                rows="2"
                placeholder="text"
                value={this.state.text}
                onKeyPress={event => this.handleKeyPress(event)}
                onChange={event => this.setState({text: event.target.value})}></textarea>
            </UI.FormGroup>
            <UI.FormGroup className="submit-form-group">
              <div>
                <button
                  type="submit">
                  Send</button></div>
            </UI.FormGroup>
          </UI.Form>
        </div>
        <DragAndDrop
          handleDrop={files => this.handleDrop(files)}>
        </DragAndDrop>
      </UI.SiteContainer>
    );
  }
}

export default Channel;
