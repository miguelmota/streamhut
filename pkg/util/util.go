package util

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

// ErrBadStatus is error for when a non 200 status code is received
var ErrBadStatus = fmt.Errorf("Not OK")

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
