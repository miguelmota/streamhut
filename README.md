<h3 align="center">
  <br />
  <img src="https://user-images.githubusercontent.com/168240/39515825-119445f0-4db0-11e8-93ef-7f3f67abccb2.png" alt="logo" width="700" />
  <br />
  <br />
  <br />
</h3>

# streamhut

> Stream and send data, terminal to web and vice versa.

[![License](http://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/miguelmota/streamhut/master/LICENSE) [![Build Status](https://travis-ci.org/miguelmota/streamhut.svg?branch=master)](https://travis-ci.org/miguelmota/streamhut) [![dependencies Status](https://david-dm.org/miguelmota/streamhut/status.svg)](https://david-dm.org/miguelmota/streamhut) [![NPM version](https://badge.fury.io/js/streamhut.svg)](http://badge.fury.io/js/streamhut)

## Synopsis

- Stream your terminal to anyone without installing anything.
- Originally created this to quickly share data and files between devices.
- Path names map to channels.
- Anyone in the same channel can view what's streamed.
- Easily self-host your own streamhut server.

Streamhut allows you to stream (pipe) realtime data from your terminal stdout/stderr to a web xterm UI or even to another terminal.

As long as you have [`netcat`](https://en.wikipedia.org/wiki/Netcat) which comes pre-installed in most *nix systems than you can use streamhut! If you can't install netcat, you may also use the streamhut CLI client.

**Disclaimer: This software is alpha quality and not production ready. Use at your own risk.**

## Demo

**[https://streamhut.io](https://streamhut.io)**

## Install

```bash
$ go get github.com/streamhut/streamhut
```

## Getting Started

One liner to stream your terminal:

```bash
$ exec > >(nc stream.ht 1337) 2>&1
```

Example of streaming tail of file:

```bash
# terminal 1
$ cat >data.txt
```

```bash
# terminal 2
$ tail -F data.txt | nc streamhut.io 1337
```

Stream the current date every second:

```bash
$ while true; do date; sleep 1; done | nc stream.ht 1337
```

Stream output of a program (delay is required to see share url):

```bash
$ (sleep 5; htop) | nc stream.ht 1337
# waits 5 seconds, and then send contents of program.
```

Example of piping to both stdout and netcat:

```bash
$ (echo -n; sleep 5; htop) | tee >(nc stream.ht 1337)
```

Don't have netcat available? Pipe to a file descriptor with an open TCP connection:

```bash
$ exec 3<>/dev/tcp/stream.ht/1337 && head -1 <&3 && exec &> >(tee >(cat >&3))
```

## CLI

```bash
$ streamhut --help

  Streamhut lets you stream and share your terminal.
  For more info, visit: https://github.com/streamhut/streamhut

  Usage:
    streamhut [flags]
    streamhut [command]

  Available Commands:
    help        Help about any command
    listen      Listen on a channel
    server      Start server

  Flags:
        --help   Show help

  Use "streamhut [command] --help" for more information about a command.

```

### Usage

#### Run your own server:

```bash
$ streamhut server

Starting server...
HTTP/WebSocket port: 8080
TCP port: 1337
```

Stream to your server:

```bash
$ exec > >(nc localhost 1337) 2>&1
```

For more options, run `streamhut server --help`

#### Listening on a channel

```bash
# terminal 1
$ streamhut listen -h localhost -p 8080 -i -c yo
```

```bash
# terminal 2
$ exec > >(nc localhost 1337) 2>&1;echo \#yo
```

For more options, run `streamhut listen --help`

## Docker

You can run streamhut as a Docker container:

```bash
$ docker pull streamhut/streamhut
$ docker run -e PORT=8080 -e NET_PORT=1337 -p 8080:8080 -p 1337:1337 --restart unless-stopped streamhut/streamhut:latest
```

## Test

```bash
make test
```

## Development

Start server:

```bash
make start
```

Run migrations:

```bash
make migrate
```

## FAQ

- Q: How is the stream log data stored?

  - A: Currently it's stored in a local sqlite3 database. More robust and scalable options are in the works.

- Q: What happened to the streamhut NPM module?

  - A: The node.js implementation of streamhut is now deprecated in favor of this Golang implementation.

- Q: Can the same channel be used more than once?

  - A: Yes! send `#{channel}` (ie `#mychannel`) as the first stream text to use that channel.

    Example:

    ```bash
    exec > >(nc stream.ht 1337) 2>&1;echo \#mychannel
    ```

- Q: What's the difference between stream.ht and streamhut.io?

  - A: The domain stream.ht is an alias for streamhut.io, meaning you can type stream.ht as the domain for convenience. Other aliases are streamhut.net and streamhut.org

## License

[MIT](LICENSE)
