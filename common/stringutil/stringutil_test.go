package stringutil

import (
	"fmt"
	"testing"
)

func TestRandStringRunes(t *testing.T) {
	str := RandStringRunes(5)
	fmt.Println(str)
}
