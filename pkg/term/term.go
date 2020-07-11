package term

import (
	"bytes"
	"io"
	"log"
	"os"
	"os/exec"
	"os/signal"
	"syscall"

	"github.com/creack/pty"
	"golang.org/x/crypto/ssh/terminal"
)

// Config ...
type Config struct {
	Command           string
	InputToSendToTerm *io.PipeReader
	UserStdinInput    *bytes.Buffer
	ScreenOutput      *io.PipeWriter
	Writable          bool
	Width             int
	Height            int
}

// NewTerm ...
func NewTerm(config *Config) error {
	cmd := "bash"
	if config.Command != "" {
		cmd = config.Command
	}

	inputToSendToTerm := config.InputToSendToTerm
	//userStdinInput := config.UserStdinInput
	screenOutput := config.ScreenOutput
	writable := config.Writable

	c := exec.Command(cmd)

	// Start the command with a pty.
	ptmx, err := pty.Start(c)
	if err != nil {
		return err
	}

	// Make sure to close the pty at the end.
	defer func() {
		_ = ptmx.Close()
	}()

	// Handle pty size.
	ch := make(chan os.Signal, 1)
	signal.Notify(ch, syscall.SIGWINCH)

	go func() {
		for range ch {
			if err := pty.InheritSize(os.Stdin, ptmx); err != nil {
				log.Printf("error resizing pty: %s", err)
			}

			rows, cols, err := pty.Getsize(ptmx)
			if err != nil {
				log.Fatal(err)
			}

			if config.Width != 0 || config.Height != 0 {
				if config.Width != 0 {
					cols = config.Width
				}
				if config.Height != 0 {
					rows = config.Height
				}

				if err := pty.Setsize(ptmx, &pty.Winsize{
					Rows: uint16(rows),
					Cols: uint16(cols),
					X:    0,
					Y:    0,
				}); err != nil {
					log.Fatal(err)
				}
			}

		}
	}()

	ch <- syscall.SIGWINCH // Initial resize.

	// Set stdin in raw mode.
	oldState, err := terminal.MakeRaw(int(os.Stdin.Fd()))
	if err != nil {
		log.Fatal(err)
	}

	defer func() {
		_ = terminal.Restore(int(os.Stdin.Fd()), oldState)
	}()

	stdin, pipew1 := io.Pipe()

	go func() {
		_, err := io.Copy(pipew1, os.Stdin)
		if err != nil {
			log.Fatal(err)
		}
	}()

	if writable {
		go func() {
			_, err := io.Copy(pipew1, inputToSendToTerm)
			if err != nil {
				log.Fatal(err)
			}
		}()
	}

	// copy user stdin to buffer
	go func() {
		//io.Copy(userStdinInput, os.Stdin)
	}()

	piper, pipew := io.Pipe()
	pt := io.TeeReader(ptmx, pipew)

	// Copy stdin to the pty
	go func() {
		_, err := io.Copy(ptmx, stdin)
		if err != nil {
			log.Fatal(err)
		}
	}()

	// copy pty output to screenoutput var
	go func() {
		_, err := io.Copy(screenOutput, piper)
		if err != nil {
			log.Fatal(err)
		}
	}()

	// copy the pty to stdout
	_, err = io.Copy(os.Stdout, pt)
	if err != nil {
		return err
	}

	return nil
}
