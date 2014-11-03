var assert = require('assert')
var weak = require('../')

describe('weak()', function () {

  afterEach(gc)

  describe('garbage collection callback', function () {

    it('should accept a function as second argument', function () {
      var r = weak({}, function () {})
      assert.equal(1, weak.callbacks(r).length)
    })

    it('should invoke the callback before the target is gc\'d', function () {
      var called = false
      weak({}, function () {
        called = true
      })
      assert(!called)
      gc()
      assert(called)
    })

    it('should pass the target in as the first argument', function () {
      weak({ foo: 'bar' }, function (o) {
        assert.equal(o.foo, 'bar')
      })
      gc()
    })

    it('should invoke *all* callbacks in the internal "callback" Array'
    , function () {
      var r = weak({})
        , called1 = false
        , called2 = false
      weak.addCallback(r, function () {
        called1 = true
      })
      weak.addCallback(r, function () {
        called2 = true
      })
      gc()
      assert(called1)
      assert(called2)
    })

  })
})

describe('callbacks()', function () {

  it('should return the Weakref\'s internal "callback" Array', function () {
    var r = weak({})
      , callbacks = weak.callbacks(r)
    assert(Array.isArray(callbacks))
    assert.equal(0, callbacks.length)
  })

})
