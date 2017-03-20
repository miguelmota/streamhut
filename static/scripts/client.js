const shoe = require('shoe');
const through = require('through');
const fileToBase64 = require('filetobase64');
const base64Mime = require('base64mime');
const base64ToBlob = require('base64toblob');

const path = window.location.pathname;
const stream = shoe(`${path}___`);

const form = document.querySelector(`#form`);
const input = document.querySelector(`#input`);
const text = document.querySelector(`#text`);
const file = document.querySelector(`#file`);
const output = document.querySelector(`#output`);
const shareUrl = document.querySelector(`#share-url`);

shareUrl.value = window.location.href;
shareUrl.addEventListener(`click`, event => {
  event.currentTarget.select()
}, false);

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

  [text, input].forEach(x => {
    const value = x.value;
    if (value) {
      //console.log(`value`, value);
      stream.write(value);
      x.value = ``;
    }
  })
}, false);

file.addEventListener(`change`, event => {
  const file = event.currentTarget.files[0];
  console.log(`file:`, file);
  if (!file) return;

  fileToBase64(file, base64 => {
    console.log(`base64:${base64.substr(0,20).concat(`...`)}`);
    stream.write(`data:${file.type};base64,${base64}`);
  });
}, false);

stream.pipe(through(data => {
  console.log(`incoming:`, data.substr(0,20).concat(`...`));
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
  a.href = url;
  a.target = `_blank`;
  doc.appendChild(a);

  const dv = create(`article`);

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
    const pr = create(`pre`);
    const tt = create(`text`)(t);
    pr.appendChild(tt);
    dv.appendChild(pr);
  } else {
    const pr = create(`pre`);
    const t = create(`text`)(data);
    pr.appendChild(t);
    dv.appendChild(pr);
  }

  doc.appendChild(dv);

  const filename = `${Date.now()}_${ext}`;
  const dla = create(`a`);
  dla.className = `download`;
  dla.href = url;
  dla.download = filename;
  const dlat = create(`text`)(`download`);
  dla.appendChild(dlat);

  const btd = create(`footer`);

  btd.appendChild(dla)

  const dt = create(`time`);
  const dtt = create(`text`)((new Date()).toString());
  dt.appendChild(dtt);
  btd.appendChild(dt)
  doc.appendChild(btd);

  el.appendChild(doc);
  output.insertBefore(el, output.firstChild);
}));

stream.on(`connect`, () => {
  console.log(`connected`);
});

stream.on(`close`, () => {
  console.log(`connection closed`);
});
