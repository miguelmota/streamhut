package util

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// ErrBadStatus is error for when a non 200 status code is received
var ErrBadStatus = fmt.Errorf("Not OK")

// ErrInvalidInput is error for when the input is invalid
var ErrInvalidInput = fmt.Errorf("Invalid input")

// DownloadFile downloads file to a directory
func DownloadFile(url, filepath string) error {
	out, err := os.Create(filepath)
	if err != nil {
		return err
	}

	defer out.Close()

	resp, err := http.Get(url)
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return ErrBadStatus
	}

	if _, err := io.Copy(out, resp.Body); err != nil {
		return err
	}

	return nil
}

// UserHomeDir returns home directory for the user
func UserHomeDir() string {
	if runtime.GOOS == "windows" {
		home := os.Getenv("HOMEDRIVE") + os.Getenv("HOMEPATH")
		if home == "" {
			home = os.Getenv("USERPROFILE")
		}
		return home
	} else if runtime.GOOS == "linux" {
		home := os.Getenv("XDG_CONFIG_HOME")
		if home != "" {
			return home
		}
	}
	return os.Getenv("HOME")
}

// NormalizePath normalizes and extends the path string
func NormalizePath(path string) string {
	// expand tilde
	if strings.HasPrefix(path, "~/") {
		path = filepath.Join(UserHomeDir(), path[2:])
	}

	path = strings.Replace(path, "/", string(filepath.Separator), -1)

	return path
}

// FilePath returns the path for the file
func FilePath(path string) string {
	parts := strings.Split(path, string(filepath.Separator))
	return strings.Join(parts[:len(parts)-1], string(filepath.Separator))
}

// StorageSizeToUint64 converts a human readable storage size string to an int type
func StorageSizeToUint64(size string) uint64 {
	regex := regexp.MustCompile(`^([0-9]+)|([a-zA-Z]+)$`)
	matches := regex.FindAllString(strings.TrimSpace(size), -1)

	if len(matches) == 0 {
		return 0
	}

	valueString := matches[0]

	var unit string
	if len(matches) > 1 {
		unit = strings.ToLower(matches[1])
	}

	value, err := strconv.ParseUint(valueString, 0, 64)
	if err != nil {
		return 0
	}

	if unit == "b" || unit == "" {
		return value
	}

	unit = string(unit[0])

	if unit == "k" {
		return value * 1000
	} else if unit == "m" {
		return value * 1000 * 1000
	} else if unit == "g" {
		return value * 1000 * 1000 * 1000
	} else if unit == "t" {
		return value * 1000 * 1000 * 1000 * 1000
	}

	return 0
}

// Uint64ToStorageSizeString converts an integer to a human readable storage size string
func Uint64ToStorageSizeString(value uint64) string {
	if value < 1000 {
		return fmt.Sprintf("%db", value)
	} else if value >= 1000 && value < 1000*1000 {
		return fmt.Sprintf("%dkb", value/1000)
	} else if value >= 1000*1000 && value < 1000*1000*1000 {
		return fmt.Sprintf("%dmb", value/1000/1000)
	} else if value >= 1000*1000*1000 && value < 1000*1000*1000*1000 {
		return fmt.Sprintf("%dgb", value/1000/1000/1000)
	} else if value >= 1000*1000*1000*1000 && value < 1000*1000*1000*1000*1000 {
		return fmt.Sprintf("%dtb", value/1000/1000/1000/1000)
	}

	return ""
}

// DurationStringToType converts a human readable time duration string to a time.Duration type
func DurationStringToType(duration string) time.Duration {
	regex := regexp.MustCompile(`^([0-9]+)|([a-zA-Z]+)$`)
	matches := regex.FindAllString(strings.TrimSpace(duration), -1)

	if len(matches) == 0 {
		return time.Duration(0) * time.Second
	}

	valueString := matches[0]

	var unit string
	if len(matches) > 1 {
		unit = strings.ToLower(matches[1])
	}

	value, err := strconv.ParseUint(valueString, 0, 64)
	if err != nil {
		return time.Duration(0) * time.Second
	}

	if unit == "s" || unit == "" {
		return time.Duration(value) * time.Second
	}

	unit = string(unit[0])

	if unit == "m" {
		return time.Duration(value) * time.Minute
	} else if unit == "h" {
		return time.Duration(value) * time.Hour
	} else if unit == "d" {
		return time.Duration(value) * 24 * time.Hour
	} else if unit == "w" {
		return time.Duration(value) * 24 * 7 * time.Hour
	}

	return time.Duration(0) * time.Second
}
