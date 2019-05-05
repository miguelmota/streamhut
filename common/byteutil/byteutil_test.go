package byteutil

import (
	"fmt"
	"testing"
)

func TestBufferWithMime(t *testing.T) {
	b := []byte("hello")
	m := "text/plain"
	bm := BufferWithMime(b, m)

	fmt.Println(string(bm))
}

func TestDecoupleBufferWithMime(t *testing.T) {
	b := []byte("hello")
	m := "text/plain"
	bm := BufferWithMime(b, m)
	buf, mime := DecoupleBufferWithMime(bm)

	fmt.Println(string(buf))
	fmt.Println(mime)
}
