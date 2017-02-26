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
  const el = create(`div`);
  const dt = create(`time`);
  const dtt = create(`text`)((new Date()).toString());
  dt.appendChild(dtt);
  el.classList.add(`item`);
  if (/data:/gi.test(data)) {
    const a = create(`a`);
    const d1 = data.substr(0,32).replace(/.*base64,/gi, ``);
    const d2 = data.substr(32, data.length - 1);
    const dd = d1.concat(d2);
    const blob = base64ToBlob(dd, base64Mime(data));
    const url = window.URL.createObjectURL(blob);
    a.appendChild(create(`text`)(url));
    a.href = url;
    a.target = `_blank`;
    const d = create(`div`);
    d.appendChild(create(`text`)(`${blob.type} size:${blob.size}`));
    el.appendChild(d);
    el.appendChild(a);

    if (/data:image\/(png|jpe?g)/gi.test(data)) {
      const dv = create(`div`);
      const img = create(`img`);
      img.src = data;
      dv.appendChild(img);
      el.appendChild(dv);
    }
  } else {
    const t = create(`text`)(data);
    el.appendChild(t);
  }

  el.appendChild(dt);
  output.insertBefore(el, output.firstChild);
}));

stream.on(`connect`, () => {
  console.log(`connected`);
});

stream.on(`close`, () => {
  console.log(`connection closed`);
});
