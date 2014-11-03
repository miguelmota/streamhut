# base64ToBlob

Convert a base64 string to a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) object.

# Demo

[http://lab.moogs.io/base64toblob](http://lab.moogs.io/base64toblob)

# Install

```bash
bower install base64toblob
```

```bash
npm install base64toblob
```

# Usage

```javascript
var base64 = 'iVBORw0...ASUVORK5CYII=';

var blob = base64ToBlob(base64, 'image/png');
var url = window.URL.createObjectURL(blob);

console.log(url); // blob:http%3A//localhost%3A8888/2c6321f4-8f4e-457f-8b4e-2c3932b4bef0
```

# License

MIT
