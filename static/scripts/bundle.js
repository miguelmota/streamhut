(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {

  function base64MimeType(encoded) {
    if (!encoded) return;
    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

    if (mime && mime.length) return mime[1];

  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = base64MimeType;
    }
    exports.base64MimeType = base64MimeType;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return base64MimeType;
    });
  } else {
    this.base64MimeType = base64MimeType;
  }

}).call(this);

},{}],2:[function(require,module,exports){
(function() {

  function base64ToBlob(base64, mime) {
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
      var slice = byteChars.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: mime});
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = base64ToBlob;
    }
    exports.base64ToBlob = base64ToBlob;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return base64ToBlob;
    });
  } else {
    this.base64ToBlob = base64ToBlob;
  }

}).call(this);

},{}],3:[function(require,module,exports){
(function() {

  function fileToBase64(file, cb) {
    if (!window.FileReader) {
      throw new Error('FileReader not found');
    }

    var fr = new FileReader();

    fr.onloadend = function() {
      var result = this.result;
      var hex = [];
      for (var i = 0, len = this.result.length; i < len; i++) {
        var h = result.charCodeAt(i).toString(16);
        if (h.length < 2) h = '0'.concat(h);
        hex.push(h);
      }

      var b = window.btoa(hex.join('').match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
      }).join(''));

      cb & cb(b);
    };

    fr.readAsBinaryString(file);
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = fileToBase64;
    }
    exports.fileToBase64 = fileToBase64;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return fileToBase64;
    });
  } else {
    this.fileToBase64 = fileToBase64;
  }

}).call(this);

},{}],4:[function(require,module,exports){
(function(root) {
  'use strict';

  var urlMatcher = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/

  var splitMatcher = /((?:\w+:)?\/\/(?:[^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*)/g

  function isUrl(string){
    return urlMatcher.test(string)
  }

  function hyperlinkify(text, attrsCallback) {
    try {
      text = text.toString()
    } catch(error) {}

    if (typeof text !== 'string') return ''

    return text.split(splitMatcher).map(function(value) {
      if (isUrl(value)) {
        var attrsObj = {}
        var attrs = []

        if (typeof attrsCallback === 'function') {
          attrsObj = attrsCallback(value)
        } else if (attrsCallback instanceof Object) {
          attrsObj = attrsCallback
        }

        if (attrsObj instanceof Object) {
          for (var key in attrsObj) {
            attrs.push(key + '="' + attrsObj[key] + '"')
          }
        }

        var attrsString = attrs.length ? ' ' + attrs.join(' ') : ''

        return '<a href="' + value + '"' + attrsString + '>' + value + '</a>'
      }

      return value
    }).join('')
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = hyperlinkify
    }
    exports.hyperlinkify = hyperlinkify
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return hyperlinkify
    });
  } else {
    root.hyperlinkify = hyperlinkify;
  }

})(this);
},{}],5:[function(require,module,exports){
'use strict';

const fileToBase64 = require('filetobase64');
const base64Mime = require('base64mime');
const base64ToBlob = require('base64toblob');
const hyperlinkify = require('hyperlinkify');

const {pathname, host, protocol}  = window.location;
const ws = new WebSocket(`${protocol === 'https:' ? `wss` : `ws`}://${host}${pathname}`);

const log = document.querySelector(`#log`);
const form = document.querySelector(`#form`);
const input = document.querySelector(`#input`);
const text = document.querySelector(`#text`);
const fileInput = document.querySelector(`#file`);
const output = document.querySelector(`#output`);
const shareUrl = document.querySelector(`#share-url`);

function setClipboard(element) {
  const client = new ZeroClipboard(element);

  client.on(`copy`, event => {
    element.textContent = `copied!`;
    setTimeout(() => {
      element.textContent = `copy`;
    }, 3e3);
  });
}

shareUrl.value = window.location.href;
shareUrl.addEventListener(`click`, event => {
  event.currentTarget.select()
}, false);

function logMessage(data) {
  log.innerHTML = JSON.stringify(data, null, 2);
}

function isBase64(text) {
  return /data:/gi.test(text);
}

function create(type) {
  if (type === `text`) {
    return text => {
      const t = document.createTextNode(text);
      return t;
    };
  }

  return document.createElement(type);
}

form.addEventListener(`submit`, event => {
  event.preventDefault();

  // text stream
  [text, input].forEach(x => {
    const value = x.value;
    if (value) {
      //console.log(`value`, value);
      ws.send(value);
      x.value = ``;
    }
  })

  // file upload
  const files = [].slice.call(fileInput.files)

  files.forEach(file => {
    console.log(`file:`, file);
    if (!file) return;

    fileToBase64(file, base64 => {
      console.log(`base64:${base64.substr(0,20).concat(`...`)}`);
      ws.send(`data:${file.type};base64,${base64}`);
    });
  })
}, false);

ws.addEventListener('message', event => {
  const data = event.data;

  console.log(`incoming:`, data.substr(0,20).concat(`...`));

  try {
    const json = JSON.parse(data);
    if (json.__server_message__) {
      logMessage(json.__server_message__.data);
      return false;
    }
  } catch(error) {

  }

  const doc = document.createDocumentFragment();
  const el = create(`div`);
  el.classList.add(`item`);

  let mime = null;
  let blob = null;
  let dd = data;

  if (/data:/gi.test(data)) {
    const d1 = data.substr(0,32).replace(/.*base64,/gi, ``);
    const d2 = data.substr(32, data.length - 1);
    dd = d1.concat(d2);
    mime = base64Mime(data) || ``;
    blob = base64ToBlob(dd, mime);
  } else {
    mime = `text/plain`;
    blob = new Blob([data], {type: mime});
  }

  let ext = mime.split(`/`).join(`_`).replace(/[^\w\d_]/gi, ``);
  const url = window.URL.createObjectURL(blob);

  const tpd = create(`div`);
  tpd.appendChild(create(`text`)(`${blob.type} size:${blob.size}B`));
  doc.appendChild(tpd);

  const a = create(`a`);
  a.appendChild(create(`text`)(url));
  a.title = `view asset`;
  a.href = url;
  a.target = `_blank`;
  doc.appendChild(a);

  const dv = create(`article`);

  let clipboardNode = null;

  if (/image/gi.test(mime)) {
    const img = create(`img`);
    img.src = data;
    dv.appendChild(img);
  } else if (/video/gi.test(mime)) {
    const dv = create(`div`);
    const vid = create(`video`);
    vid.src = url;
    vid.controls = `controls`;
    dv.appendChild(vid);
  } else if (/audio/gi.test(mime)) {
    const aud = create(`audio`);
    aud.src = url;
    aud.controls = `controls`;
    dv.appendChild(aud);
  } else if (/(json|javascript|text)/gi.test(mime)) {
    const t = isBase64(data) ? atob(data.replace(/.*base64,/gi, ``)) : data;
    const pr = create(`code`);
    pr.id = `id_${Date.now()}`;
    clipboardNode = pr;
    pr.innerHTML = hyperlinkify(t, {target: '_blank'});
    dv.appendChild(pr);
  } else if (/zip/gi.test(mime)) {
    const pr = create(`text`)('.zip');
    dv.appendChild(pr);
  } else {
    const pr = create(`code`);
    pr.id = `id_${Date.now()}`;
    clipboardNode = pr;
    pr.innerHTML = hyperlinkify(data, {target: '_blank'});
    dv.appendChild(pr);
  }

  doc.appendChild(dv);

  const filename = `${Date.now()}_${ext}`;
  const dla = create(`a`);
  dla.className = `download`;
  dla.title = `download asset`;
  dla.href = url;
  dla.download = filename;
  const dlat = create(`text`)(`download`);
  dla.appendChild(dlat);

  const btd = create(`footer`);
  const btdl = create(`div`);
  btdl.appendChild(dla)
  btd.appendChild(btdl)

  if (clipboardNode) {
    const cp = create(`a`);
    cp.href='#'
    cp.className = `copy`;
    cp.title = `copy to clipboard`;
    cp.dataset.clipboardTarget = clipboardNode.id;
    const cpt = create(`text`)(`copy`);
    setClipboard(cp);
    cp.appendChild(cpt);
    btdl.appendChild(cp)
  }

  const dt = create(`time`);
  const dtt = create(`text`)((new Date()).toString());
  dt.appendChild(dtt);
  btd.appendChild(dt)
  doc.appendChild(btd);

  el.appendChild(doc);
  output.insertBefore(el, output.firstChild);
});

ws.addEventListener(`open`, () => {
  console.log(`connected`);
});

ws.addEventListener(`close`, () => {
  console.log(`connection closed`);
});

},{"base64mime":1,"base64toblob":2,"filetobase64":3,"hyperlinkify":4}]},{},[5]);
