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
