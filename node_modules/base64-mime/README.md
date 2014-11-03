# base64-mime

Extract the MIME type from a base64 string.

# Install

```
npm install base64-mime
```

```
bower install base64-mime
```

# Usage

```bash
var base64Mime = require('base64-mime');

var encoded = 'data:image/png;base64,iVBORw0KGgoAA...5CYII=';

console.log(base64Mime(encoded)); // "image/png"
```

# License

MIT
