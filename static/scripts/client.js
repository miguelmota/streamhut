var $ = require('jquery');
var shoe = require('shoe');
var through = require('through');
var fileToBase64 = require('filetobase64');
var _ = require('lodash');
var stream = shoe('/s');
var base64Mime = require('base64-mime');
var base64ToBlob = require('base64toblob');

var $form = $('#form');
var $input = $('#input');
var $file = $('#file');
var $output = $('#output');

function create(type) {
  if (type === 'text') {
    return function(text) {
      var t = document.createTextNode(text);
      return t;
    };
  }
  return document.createElement(type);
}

$form.on('submit', function(e) {
  e.preventDefault();
  var val = $input.val();
  if (val) {
    console.log('val', val);
    stream.write(val);
    $input.val('');
  }
});

$file.on('change', function(e) {
  var f = e.currentTarget.files[0];
  console.log('file:', f);
  if (!f) return;
  fileToBase64(f, function(base64) {
    console.log('base64:', base64.substr(0,20).concat('...'));
    stream.write(['data:', f.type, ';base64,', base64].join(''));
  });
});

stream.pipe(through(function(data) {
  console.log('incoming:', data);
  var el = create('div');
  var dt = create('time');
  var dtt = create('text')((new Date()).toString());
  dt.appendChild(dtt);
  el.classList.add('item');
  if (/data:/gi.test(data)) {
    var a = create('a');
    var d1 = data.substr(0,32);
    var d2 = data.substr(32, data.length - 1);
    d1 = d1.replace(/.*base64,/gi, '');
    var dd = d1.concat(d2);
    var blob = base64ToBlob(dd, base64Mime(data));
    url = window.URL.createObjectURL(blob);
    a.appendChild(create('text')(url));
    a.href = url;
    a.target = '_blank';
    el.appendChild(a);

    if (/data:image\/(png|jpe?g)/gi.test(data)) {
      var dv = create('div');
      var img = create('img');
      img.src = data;
      dv.appendChild(img);
      el.appendChild(dv);
    }

  } else {
    var t = create('text')(data);
    el.appendChild(t);
  }
  el.appendChild(dt);
  $output.prepend(el);
}));

stream.on('connect', function() {
  console.log('connected');
});

stream.on('close', function() {
  console.log('close');
});
