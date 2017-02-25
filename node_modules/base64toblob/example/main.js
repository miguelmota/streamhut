(function() {

  var $ = document;

  var fileInput = $.getElementById('file');
  var output = $.getElementById('output');

  fileInput.onchange = function(e) {
    var file = e.currentTarget.files[0];

    fileToBase64(file, function(base64) {
      console.log('base64', base64);

      var blob = base64ToBlob(base64, file.type);
      var url = window.URL.createObjectURL(blob);

      console.log('Blob', blob);

      var ta = $.createElement('textarea');
      var c = $.createTextNode(base64);
      ta.appendChild(c);
      var dta = $.createElement('div');
      dta.appendChild(ta);

      var d = $.createElement('div');
      var a = $.createElement('a');
      a.href = url;
      a.target = '_blank';
      var t = $.createTextNode(url);

      d.appendChild(dta);
      a.appendChild(t);
      d.appendChild(a);
      output.appendChild(d);

    });

  };

})();
