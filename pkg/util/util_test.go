package util

import (
	"fmt"
	"testing"
	"time"
)

func TestStorageSizeToUint64(t *testing.T) {
	tests := []struct {
		in  string
		out uint64
	}{
		{"", 0},
		{"10", 10},
		{"100b", 100},
		{"1k", 1000 * 1},
		{"1kb", 1000 * 1},
		{"50kb", 1000 * 50},
		{"1m", 1000 * 1000 * 1},
		{"50mb", 1000 * 1000 * 50},
		{"1g", 1000 * 1000 * 1000 * 1},
		{"50g", 1000 * 1000 * 1000 * 50},
		{"50GB", 1000 * 1000 * 1000 * 50},
		{"3tb", 1000 * 1000 * 1000 * 1000 * 3},
		{"invalid", 0},
	}

	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			out := StorageSizeToUint64(tt.in)
			if out != tt.out {
				t.Errorf("got %v, want %v", out, tt.out)
			}
		})
	}
}

func TestUint64ToStorageSizeString(t *testing.T) {
	tests := []struct {
		in  uint64
		out string
	}{
		{0, "0b"},
		{10, "10b"},
		{100, "100b"},
		{1000 * 1, "1kb"},
		{1000 * 50, "50kb"},
		{1000 * 1000 * 1, "1mb"},
		{1000 * 1000 * 50, "50mb"},
		{1000 * 1000 * 1000 * 1, "1gb"},
		{1000 * 1000 * 1000 * 50, "50gb"},
		{1000 * 1000 * 1000 * 1000 * 3, "3tb"},
	}

	for _, tt := range tests {
		t.Run(fmt.Sprintf("%v", tt.in), func(t *testing.T) {
			out := Uint64ToStorageSizeString(tt.in)
			if out != tt.out {
				t.Errorf("got %s, want %s", out, tt.out)
			}
		})
	}
}

func TestDurationStringToType(t *testing.T) {
	tests := []struct {
		in  string
		out time.Duration
	}{
		{"", 0 * time.Second},
		{"1", 1 * time.Second},
		{"30s", 30 * time.Second},
		{"1m", 60 * 1 * time.Second},
		{"5h", 60 * 60 * 5 * time.Second},
		{"5HR", 60 * 60 * 5 * time.Second},
		{"2d", 60 * 60 * 24 * 2 * time.Second},
		{"4w", 60 * 60 * 24 * 7 * 4 * time.Second},
	}

	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			out := DurationStringToType(tt.in)
			if out != tt.out {
				t.Errorf("got %v, want %v", out, tt.out)
			}
		})
	}
}
