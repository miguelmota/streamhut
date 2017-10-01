(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(root) {
  'use strict'

  function isValidArray(x) {
    return /Int8Array|Int16Array|Int32Array|Uint8Array|Uint8ClampedArray|Uint16Array|Uint32Array|Float32Array|Float64Array|ArrayBuffer/gi.test(Object.prototype.toString.call(x))
  }

  function arrayBufferConcat(/* arraybuffers */) {
    var arrays = [].slice.call(arguments)

    if (arrays.length <= 0 || !isValidArray(arrays[0])) {
      return new Uint8Array(0).buffer
    }

    var arrayBuffer = arrays.reduce(function(cbuf, buf, i) {
      if (i === 0) return cbuf
      if (!isValidArray(buf)) return cbuf

      var tmp = new Uint8Array(cbuf.byteLength + buf.byteLength)
      tmp.set(new Uint8Array(cbuf), 0)
      tmp.set(new Uint8Array(buf), cbuf.byteLength)

      return tmp.buffer
    }, arrays[0])

    return arrayBuffer
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = arrayBufferConcat
    }
    exports.arrayBufferConcat = arrayBufferConcat
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return arrayBufferConcat
    })
  } else {
    root.arrayBufferConcat = arrayBufferConcat
  }
})(this)

},{}],2:[function(require,module,exports){
const arrayBufferConcat = require('arraybuffer-concat')

const ARRAY_SIZE = 100

function arrayBufferWithMime(arrayBuffer, mime) {
  const uint8 = new Uint8Array(ARRAY_SIZE)
  const len = mime.length

  for (let i = 0; i < len; i++) {
    var n = mime[i].charCodeAt(0)
    uint8[i] = n
  }

  const ab = arrayBufferConcat(uint8, arrayBuffer)

  return ab
}

function arrayBufferMimeDecouple(arrayBufferWithMime) {
  const uint8 = new Uint8Array(arrayBufferWithMime)
  let mime = ''

  for (let i = 0; i < ARRAY_SIZE; i++) {
    let char = uint8[i]
    if (char === 0) {
      break
    }

    mime += String.fromCharCode(char)
  }

  var arrayBuffer = uint8.slice(ARRAY_SIZE).buffer

  return {
    mime,
    arrayBuffer
  }
}

module.exports = {
  arrayBufferWithMime,
  arrayBufferMimeDecouple
}

},{"arraybuffer-concat":1}],3:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'select'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('select'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.select);
        global.clipboardAction = mod.exports;
    }
})(this, function (module, _select) {
    'use strict';

    var _select2 = _interopRequireDefault(_select);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.container = options.container;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }
        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }
        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                this.container.appendChild(this.fakeElem);

                this.selectedText = (0, _select2.default)(this.fakeElem);
                this.copyText();
            }
        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    this.container.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    this.container.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }
        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = (0, _select2.default)(this.target);
                this.copyText();
            }
        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }
        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.trigger) {
                    this.trigger.focus();
                }

                window.getSelection().removeAllRanges();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            },
            get: function get() {
                return this._action;
            }
        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            },
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    module.exports = ClipboardAction;
});
},{"select":10}],4:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './clipboard-action', 'tiny-emitter', 'good-listener'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./clipboard-action'), require('tiny-emitter'), require('good-listener'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
        global.clipboard = mod.exports;
    }
})(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
    'use strict';

    var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

    var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

    var _goodListener2 = _interopRequireDefault(_goodListener);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            _classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        _createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
                this.container = _typeof(options.container) === 'object' ? options.container : document.body;
            }
        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }
        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new _clipboardAction2.default({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    container: this.container,
                    trigger: trigger,
                    emitter: this
                });
            }
        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }
        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }
        }, {
            key: 'defaultText',
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }], [{
            key: 'isSupported',
            value: function isSupported() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];

                var actions = typeof action === 'string' ? [action] : action;
                var support = !!document.queryCommandSupported;

                actions.forEach(function (action) {
                    support = support && !!document.queryCommandSupported(action);
                });

                return support;
            }
        }]);

        return Clipboard;
    }(_tinyEmitter2.default);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */
    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    module.exports = Clipboard;
});
},{"./clipboard-action":3,"good-listener":8,"tiny-emitter":11}],5:[function(require,module,exports){
var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;

},{}],6:[function(require,module,exports){
var closest = require('./closest');

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;

},{"./closest":5}],7:[function(require,module,exports){
/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};

},{}],8:[function(require,module,exports){
var is = require('./is');
var delegate = require('delegate');

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;

},{"./is":7,"delegate":6}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;

},{}],11:[function(require,module,exports){
function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;

},{}],12:[function(require,module,exports){
const hyperlinkify = require('hyperlinkify')
const Clipboard = require('clipboard')
const {
  arrayBufferWithMime,
  arrayBufferMimeDecouple
} = require('arraybuffer-mime')

const {pathname, host, protocol}  = window.location
const ws = new WebSocket(`${protocol === 'https:' ? `wss` : `ws`}://${host}${pathname}`)

ws.binaryType = 'arraybuffer'

const connectionsLog = document.querySelector(`#connections`)
const form = document.querySelector(`#form`)
const input = document.querySelector(`#input`)
const text = document.querySelector(`#text`)
const fileInput = document.querySelector(`#file`)
const output = document.querySelector(`#output`)
const shareUrl = document.querySelector(`#share-url`)

let term = null

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


const channelUrlCopy = document.querySelector('#channel-url-copy')
setClipboard(channelUrlCopy)

function logMessage(data) {
  connectionsLog.innerHTML = JSON.stringify(data, null, 2)
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

  updateWindowTitle()

  const doc = document.createDocumentFragment()
  const el = create(`div`)
  el.classList.add(`item`)

  const {mime, arrayBuffer} = arrayBufferMimeDecouple(data)

  console.log('received', mime)

  if (mime === 'shell') {
    if (!term) {
      term = new window.Terminal({
        convertEol: true,
        scrollback: 10000,
        disableStdin: true,
        cursorBlink: true
      })
      termNode = document.getElementById('terminal')
      termNode.style.display = 'block'
      term.open(termNode)
      term.fit()
      window.addEventListener('resize', () => {
        term.fit()
      })
    }

    const text = new window.TextDecoder('utf-8').decode(new Uint8Array(arrayBuffer))
    term.write(`${text}\r`)
    return false
  }

  const blob = new Blob([arrayBuffer], {type: mime})

  let ext = mime.split(`/`).join(`_`).replace(/[^\w\d_]/gi, ``)
  const url = window.URL.createObjectURL(blob)

  const itemheader = create(`header`)
  doc.appendChild(itemheader)

  const tpd = create(`span`)
  tpd.appendChild(create(`text`)(`${blob.type} size:${blob.size}B`))
  itemheader.appendChild(tpd)

  const a = create(`a`)
  a.appendChild(create(`text`)(url))
  a.title = `view asset`
  a.href = url
  a.target = `_blank`
  a.rel = `noopener noreferrer`
  itemheader.appendChild(a)

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
      pr.innerHTML = hyperlinkify(t, {target: '_blank', rel: `noopener noreferrer`})
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

  // scroll down to new message
  window.scrollTo(0, el.offsetTop)
})

ws.addEventListener(`open`, () => {
  console.log(`connected`)
})

ws.addEventListener(`close`, () => {
  console.log(`connection closed`)
})

function changeFavicon (uri) {
  const link = document.createElement('link')
  const oldLink = document.getElementById('favicon')

  link.id = 'favicon'
  link.rel = 'icon'
  link.href = uri

  if (oldLink) {
    document.head.removeChild(oldLink)
  }

  document.head.appendChild(link)
}

function updateWindowTitle () {
  if (document.hidden) {
    newMessageWindowTitle()
  } else {
    resetWindowTitle()
  }
}

function resetWindowTitle() {
  changeFavicon('/favicon.ico')
  document.title = 'Streamhut'
}

function newMessageWindowTitle() {
  changeFavicon('/favicon_alert.ico')
  document.title = '(new message) Streamhut'
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    resetWindowTitle()
  }
}, false)

},{"arraybuffer-mime":2,"clipboard":4,"hyperlinkify":9}]},{},[12]);
