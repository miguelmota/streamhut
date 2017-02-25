var $ = document;

var fileInput = $.getElementById('file');
var output = $.getElementById('output');
var text = $.getElementById('text');

fileInput.onchange = function(e) {
  var file = e.currentTarget.files[0];

  fileToBase64(file, function(base64) {
    console.log(base64); // iVBORw0KGgoAAAANSUhEUgAAADY...

    text.value = base64;

    output.src = ['data:image/png;base64,', base64].join('');
  });

};
