package byteutil

var arrSize = 100

// BufferWithMime ...
func BufferWithMime(buf []byte, mime string) []byte {
	m := make([]byte, arrSize)
	copy(m, []byte(mime))
	buf = append(m, buf...)
	return buf
}

// DecoupleBufferWithMime ...
func DecoupleBufferWithMime(buf []byte) ([]byte, string) {
	mime := buf[:arrSize]
	b := buf[arrSize:]

	return b, string(mime)
}
