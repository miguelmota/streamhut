package version

import "fmt"

// Version is the cointop version which will be populated by ldflags
var Version = "dev"

// String ...
func String() string {
	return fmt.Sprintf("streamhut version %v", Version)
}
