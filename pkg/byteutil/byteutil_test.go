package byteutil

import (
	"bytes"
	"fmt"
	"testing"
)

func TestBufferWithMime(t *testing.T) {
	b := []byte("hello")
	m := "text/plain"
	bm := BufferWithMime(b, m)

	expected := append(append([]byte{byte(len(m))}, []byte(m)...), b...)
	if bytes.Compare(bm, expected) != 0 {
		fmt.Println(string(bm))
		t.FailNow()
	}
}

func TestDecoupleBufferWithMime(t *testing.T) {
	b := []byte("hello")
	m := "text/plain"
	bm := BufferWithMime(b, m)
	buf, mime := DecoupleBufferWithMime(bm)

	if mime != m {
		fmt.Println(mime)
		t.FailNow()
	}

	if bytes.Compare(buf, b) != 0 {
		fmt.Println(string(buf))
		t.FailNow()
	}
}
