package types

import "time"

// StreamLog ...
type StreamLog struct {
	ID        int
	Channel   string
	Data      []byte
	CreatedAt time.Time
}

// StreamMessage ...
type StreamMessage struct {
	ID        int
	Channel   string
	Message   []byte
	Mime      string
	CreatedAt time.Time
}
