import React, { Component } from 'react'
import hyperlinkify from 'hyperlinkify'
import {
  arrayBufferWithMime,
  arrayBufferMimeDecouple
} from 'arraybuffer-mime'

import Gun from 'gun'
import Header from './Header'
import Clipboard from './Clipboard'
import MaxWidthContainer from './MaxWidthContainer'
import DragAndDrop from './DragAndDrop'
import Tag from './Tag'
import randomstring from 'randomstring'

const gun = Gun('ws://localhost:8765/gun')

function createWs() {
    const {pathname, host, protocol}  = window.location
    let wsurl = `${protocol === 'https:' ? `wss` : `ws`}://${host}${pathname}`
    //let wsurl = `ws://localhost:3001${pathname}`
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
  link.rel = 'icon'
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
  changeFavicon('/favicon.ico')
  document.title = 'Streamhut'
}

function newMessageWindowTitle() {
  changeFavicon('/favicon_alert.ico')
  document.title = '(new message) Streamhut'
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    resetWindowTitle()
  }
}, false)

async function get(key) {
  return new Promise((resolve) => {
    gun.get(key).on((data, key) => {
      resolve(data)
    })
  })
}

function put(key, value) {
  gun.get(key).put({[key]: value})
}

function genRandString() {
  return randomstring.generate({
    length: 3,
    charset: 'alphabetic',
    capitalization: 'lowercase',
    readable: true
  })
}

class Home extends Component {
  constructor(props) {
    super(props)

    this.state = {
      text: '',
      file: null,
      messages: [],
      shareUrl: window.location.href,
      fullScreen: false,
      queuedFiles: [],
      fsUrl: '',
    }

    const urlParams = getUrlParams()
    if ('f' in urlParams) {
      this.setFullScreen()
    }

    let p = window.location.pathname
    let q = window.location.search

    if (p === '/') {
      window.location.href = '/' + genRandString()
    }

    this.state.fsUrl = `${p}${q}${q.length ? '&' : '?'}f=1`

    this.output = React.createRef()
    this.fileInput = React.createRef()
    this.terminalRef = React.createRef()
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
    this.ws = createWs()

    const connectionsLog = document.querySelector(`#connections`)

    function logMessage(data) {
      console.log("OFOOO")
      connectionsLog.innerHTML = JSON.stringify(data, null, 2)
    }

    this.ws.addEventListener('message', event => {
      this.handleIncomingMessage(event)
    })

    this.ws.addEventListener(`open`, () => {
      console.log(`connected`)
    })

    this.ws.addEventListener(`close`, () => {
      console.log(`connection closed`)
    })

    this.readCachedMessages()
  }

  async readCachedMessages() {
    const messages = this.state.messages
    put('messages/count', 1)
    put('messages/1', {data: '1'})
    const count = (await get('messages/count')).count
    if (count) {
      for (var i = 0; i < count; i++) {
        const k = 'messages/' + (i+1)
        console.log(k)
        const msg = await get(k)
        if (msg) {
          console.log('MESSAGE', msg)
          //messages.push(msg)
        }
      }
    }

    this.setState({messages})
  }

  sendArrayBuffer(arrayBuffer, mime) {
    const abWithMime = arrayBufferWithMime(arrayBuffer, mime)
    this.ws.send(abWithMime)
  }

  async handleIncomingMessage(event) {
      const data = event.data

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

      const doc = document.createDocumentFragment()

      console.log(data)

      const {mime, arrayBuffer} = arrayBufferMimeDecouple(data)

      console.log('received', mime)
      console.log(arrayBuffer)

      if (mime === 'shell') {
        if (!this.term) {
          this.term = new window.Terminal({
            convertEol: true,
            scrollback: 10000,
            disableStdin: true,
            cursorBlink: true
          })
          //let termNode = this.terminalRef.current
          let termNode = document.querySelector('#terminal')
          termNode.style.display = 'block'
          this.term.open(termNode)
          this.term.fit()
          window.addEventListener('resize', () => {
            this.term.fit()
          })
        }

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
        blob,
        url,
        ext,
        mime,
        t
      }

      if (blob.size != 0) {
        const messages = this.state.messages
        messages.push(message)

        this.setState({
          messages
        })
      }

      this.scrollToMessages()
    }

    scrollToMessages() {
      window.scrollTo(0, this.output.current.offsetTop)
    }

  renderMessage(data) {
    if (!data) {
      return null
    }
    let { mime, blob, url, ext, t } = data
      let clipboardNode = null
      let element = null
      let clipboardText = url

      if (/image/gi.test(mime)) {
        element = <img src={url} />
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

    return <div className="item" key={url}>
      <header>
        <span>{blob.type} size: {blob.size}B</span>
        <a
          href={url}
          target="_blank"
          rel="noopenner noreferrer"
          title="view asset">{url}</a>
      </header>
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
            clipboardText={clipboardText}
          />
        </div>
        <time>{(new Date()).toString()}</time>
      </footer>
    </div>
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' && event.shiftKey) {
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

  render() {
    const items = this.state.messages.map(x => this.renderMessage(x))

    return (
      <main id="site-container">
        <Header
          shareUrl={this.state.shareUrl}
        />

        <pre id="connections"></pre>

        <div style={{
          position: 'relative',
          with:'500px',
          maxHeight:'500px',
        }}>
          <div id="terminal" ref={this.terminalRef}></div>
          <div className="terminal-footer">
            <a
              href={this.state.fsUrl}
              className="link terminal-full-screen"
              rel="noopener noreferrer"
            >
              fullscreen
            </a>
          </div>
        </div>

        <MaxWidthContainer>
          <output
            id="output"
            ref={this.output}>
            {items}
          </output>
          <form
            id="form"
            onSubmit={event => this.handleSubmit(event)}>
            <div className="form-group">
              <label>Text <small>shift-enter to submit</small></label>
              <textarea
                id="text"
                rows="5"
                cols="20"
                placeholder="text"
                value={this.state.text}
                onKeyPress={event => this.handleKeyPress(event)}
                onChange={event => this.setState({text: event.target.value})}></textarea>
            </div>
            <div className="form-group">
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
            </div>

            <div className="form-group">
              <div>
                <button
                  type="submit">
                  Submit</button></div>
            </div>
          </form>
        </MaxWidthContainer>
        <DragAndDrop
          handleDrop={files => this.handleDrop(files)}>
        </DragAndDrop>
      </main>
    );
  }
}

export default Home;
