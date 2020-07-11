package byteutil

// BufferWithMime ...
func BufferWithMime(buf []byte, mime string) []byte {
	mimeLen := len(mime)
	arrSize := mimeLen + 1
	m := make([]byte, arrSize)
	m[0] = byte(mimeLen)
	copy(m[1:], []byte(mime))
	buf = append(m, buf...)
	return buf
}

// DecoupleBufferWithMime ...
func DecoupleBufferWithMime(buf []byte) ([]byte, string) {
	mimeLen := int(buf[0])
	arrSize := mimeLen + 1
	if arrSize > len(buf) {
		return []byte{}, string(buf)
	}
	mime := buf[1:arrSize]
	b := buf[arrSize:]

	return b, string(mime)
}
