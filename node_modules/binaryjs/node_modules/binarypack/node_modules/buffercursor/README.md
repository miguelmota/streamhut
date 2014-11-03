BufferCursor
============

This is a simple module that allows you to traverse a Buffer iteratively. You
can read and write different types and the cursor's position will update with
the proper size, which you can see through `.tell()` you can also
`.seek()`

```javascript
var bc = new BufferCursor(buffer);
bc.readUInt16BE();
bc.readUInt8();
bc.readUInt32BE();
console.log(bc.tell());
```

Will output `7`

Methods
-------

For the most part `BufferCursor` and `Buffer` share the same methods, there's
just a slight alteration in method signature, none of the methods take an
offset.

So `.readUInt16LE(10)` in `Buffer` is equivalent to `bs.seek(10); bs.readUInt16LE();`

All `read[U]Int` and `write[U]Int` methods are reproduced, as are `toString`,
`write`, `fill`, and `slice`. All of these methods will move the cursor through
the stream and do not take an offset parameter, where an `end` parameter would
normaly be used, here you supply a `length`.

The following are additional methods:

 * `seek(value)` -- Seek to an arbitrary position in the stream
 * `tell()` -- Return the current location in the stream
 * `eof()` -- Return true if at the end of the stream
 * `toByteArray([method])` -- This is a special helper method which will return
the *entire* stream (i.e. from the start) as an array of numbers.
  - By default it will use `readUInt8` but you can pass in any
`read[U]Int[8,16,32][LE,BE]` to change what the array is made of

Properties
----------

 * `.buffer` -- Access to the raw buffer
 * `.length` -- The size of the buffer
