const hyperlinkify = require('hyperlinkify')
const Clipboard = require('clipboard')
const {
  arrayBufferWithMime,
  arrayBufferMimeDecouple
} = require('arraybuffer-mime')

const {pathname, host, protocol}  = window.location
const ws = new WebSocket(`${protocol === 'https:' ? `wss` : `ws`}://${host}${pathname}`)

ws.binaryType = 'arraybuffer'

const log = document.querySelector(`#log`)
const form = document.querySelector(`#form`)
const input = document.querySelector(`#input`)
const text = document.querySelector(`#text`)
const fileInput = document.querySelector(`#file`)
const output = document.querySelector(`#output`)
const shareUrl = document.querySelector(`#share-url`)

function setClipboard(element) {
  const clipboard = new Clipboard(element)

  clipboard.on('success', function(event) {
    const target = event.trigger
    target.textContent = 'copied!'

    setTimeout(function() {
      target.textContent = 'copy'
    }, 3e3)
  })

  element.addEventListener('click', event => {
    event.preventDefault()
  })
}

shareUrl.value = window.location.href
shareUrl.addEventListener(`click`, event => {
  event.currentTarget.select()
}, false)

function logMessage(data) {
  log.innerHTML = JSON.stringify(data, null, 2)
}

function create(type) {
  if (type === `text`) {
    return text => {
      const t = document.createTextNode(text)
      return t
    }
  }

  return document.createElement(type)
}

form.addEventListener(`submit`, event => {
  event.preventDefault()

  // text stream
  const inputs = [text, input]
  inputs.forEach(x => {
    const value = x.value
    if (value) {
      //console.log(`value`, value)
      const mime = 'text/plain'
      const blob = new Blob([value], {type: mime})
      const reader = new FileReader()

      reader.addEventListener('load', (event) => {
        const arrayBuffer = reader.result
        sendArrayBuffer(arrayBuffer, mime)
      })

      reader.readAsArrayBuffer(blob)
      x.value = ``
    }
  })

  // file upload
  const files = [].slice.call(fileInput.files)

  files.forEach(file => {
    console.log(`file:`, file, file.type)
    if (!file) return

    const reader = new FileReader()

    const readFile = (event) => {
      const arrayBuffer = reader.result
      const mime = file.type
      sendArrayBuffer(arrayBuffer, mime)
    }

    reader.addEventListener('load', readFile)
    reader.readAsArrayBuffer(file)
  })

  fileInput.value = ''

}, false)

function sendArrayBuffer(arrayBuffer, mime) {
  const abWithMime = arrayBufferWithMime(arrayBuffer, mime)
  ws.send(abWithMime)
}

ws.addEventListener('message', event => {
  const data = event.data

  console.log('incoming...')

  try {
    const json = JSON.parse(data)
    if (json.__server_message__) {
      logMessage(json.__server_message__.data)
      return false
    }
  } catch(error) {

  }

  const doc = document.createDocumentFragment()
  const el = create(`div`)
  el.classList.add(`item`)

  const {mime, arrayBuffer} = arrayBufferMimeDecouple(data)

  console.log('received', mime)

  const blob = new Blob([arrayBuffer], {type: mime})

  let ext = mime.split(`/`).join(`_`).replace(/[^\w\d_]/gi, ``)
  const url = window.URL.createObjectURL(blob)

  const tpd = create(`div`)
  tpd.appendChild(create(`text`)(`${blob.type} size:${blob.size}B`))
  doc.appendChild(tpd)

  const a = create(`a`)
  a.appendChild(create(`text`)(url))
  a.title = `view asset`
  a.href = url
  a.target = `_blank`
  doc.appendChild(a)

  const dv = create(`article`)

  let clipboardNode = null

  if (/image/gi.test(mime)) {
    const img = create(`img`)
    img.src = url
    dv.appendChild(img)
  } else if (/video/gi.test(mime)) {
    const dv = create(`div`)
    const vid = create(`video`)
    vid.src = url
    vid.controls = `controls`
    dv.appendChild(vid)
  } else if (/audio/gi.test(mime)) {
    const aud = create(`audio`)
    aud.src = url
    aud.controls = `controls`
    dv.appendChild(aud)
  } else if (/zip/gi.test(mime)) {
    const pr = create(`text`)('.zip')
    dv.appendChild(pr)
  } else if (/pdf/gi.test(mime)) {
    const pr = create(`text`)('.pdf')
    dv.appendChild(pr)
  //} else if (/(json|javascript|text)/gi.test(mime)) {
  } else {
    const reader = new FileReader();
    reader.onload = (event) => {
      const t = reader.result
      const pr = create(`code`)
      pr.id = `id_${Date.now()}`
      clipboardNode = pr
      pr.innerHTML = hyperlinkify(t, {target: '_blank'})
      dv.appendChild(pr)

      const cp = create(`a`)
      cp.id = `cp_id_${Date.now()}`
      cp.href='#'
      cp.className = `copy`
      cp.title = `copy to clipboard`
      cp.dataset.clipboardTarget = `#${clipboardNode.id}`
      const cpt = create(`text`)(`copy`)
      setClipboard(cp)
      cp.appendChild(cpt)
      btdl.appendChild(cp)
    }

    reader.readAsText(blob)
  }

  doc.appendChild(dv)

  const filename = `${Date.now()}_${ext}`
  const dla = create(`a`)
  dla.className = `download`
  dla.title = `download asset`
  dla.href = url
  dla.download = filename
  const dlat = create(`text`)(`download`)
  dla.appendChild(dlat)

  const btd = create(`footer`)
  const btdl = create(`div`)
  btdl.appendChild(dla)
  btd.appendChild(btdl)

  const dt = create(`time`)
  const dtt = create(`text`)((new Date()).toString())
  dt.appendChild(dtt)
  btd.appendChild(dt)
  doc.appendChild(btd)

  el.appendChild(doc)
  output.insertBefore(el, output.firstChild)
})

ws.addEventListener(`open`, () => {
  console.log(`connected`)
})

ws.addEventListener(`close`, () => {
  console.log(`connection closed`)
})
