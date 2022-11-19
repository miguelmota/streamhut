<h3 align="center">
  <br />
  <img src="https://user-images.githubusercontent.com/168240/83982881-ecf66c00-a8de-11ea-969e-8b41887d681e.png" alt="logo" width="700" />
  <br />
  <br />
  <br />
</h3>

# streamhut

> Stream and send data, terminal to web and vice versa.

[![License](http://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/streamhut/streamhut/master/LICENSE)
[![Build Status](https://travis-ci.org/streamhut/streamhut.svg?branch=master)](https://travis-ci.org/streamhut/streamhut)
[![Go Report Card](https://goreportcard.com/badge/github.com/streamhut/streamhut?)](https://goreportcard.com/report/github.com/streamhut/streamhut)
[![GoDoc](https://godoc.org/github.com/streamhut/streamhut?status.svg)](https://godoc.org/github.com/streamhut/streamhut)
<!--
[![Mentioned in Awesome Terminals](https://awesome.re/mentioned-badge.svg)](https://github.com/k4m4/terminals-are-sexy)
-->

## Synopsis

- Stream your terminal to anyone without installing anything.
- Path names map to channels.
- Anyone in the same channel can view what's streamed.
- Easily self-host your own streamhut server.

Streamhut allows you to stream (pipe) realtime data from your terminal stdout/stderr to a web xterm UI or even to another terminal. It also allow you to quickly share data and files between devices.

As long as you have [`netcat`](https://en.wikipedia.org/wiki/Netcat) which comes pre-installed in most *nix systems than you can use streamhut! If you can't install netcat, you may also use the streamhut CLI client.

#### ⚠️ Disclaimer: This software is alpha quality and not production ready. Use at your own risk!

## Demo

**[https://streamhut.io](https://streamhut.io)**

![Demo](https://s3.amazonaws.com/assets.streamhut.io/streamhut_demo_1.gif)

## Getting Started (without installing anything)

**One liner to stream your terminal:**

```bash
$ exec &> >(nc stream.ht 1337)
```

The above command pipes stdout and stderr of new bash shell to streamhut.

**Stream to a custom channel name:**

```bash
$ exec &> >(nc stream.ht 1337);echo \#mychannel
```

**Example of streaming tail of file:**

```bash
# terminal 1
$ cat > data.txt
```

```bash
# terminal 2
$ tail -F data.txt | nc stream.ht 1337
```

**Stream the current date every second:**

```bash
$ while true; do date; sleep 1; done | nc stream.ht 1337
```

**Stream output of a program (delay is required to see share url):**

```bash
$ (sleep 5; htop) | nc stream.ht 1337
# waits 5 seconds, and then send contents of program.
```

**Example of piping a program to both stdout and streamhut:**

```bash
$ (echo -n; sleep 5; htop) | tee >(nc stream.ht 1337)
```

**Don't have netcat available?** Pipe to a file descriptor with an open TCP connection:

```bash
$ exec 3<>/dev/tcp/stream.ht/1337 && head -1 <&3 && exec &> >(tee >(cat >&3))
```

## Install

```bash
$ go get github.com/streamhut/streamhut
```

## CLI

Example of using streamhut CLI:

#### Stream to server

Piping commands:

```bash
$ htop | streamhut
```

Add delay to see share url:

```bash
$ htop | streamhut -d 5
```

Open url in browser:

```bash
$ htop | streamhut -o
```

Stream to different server:

```bash
$ htop | streamhut -h example.com -p 1337
```

Stream to custom channel:

```bash
$ htop | streamhut -c mychannel
```

For more options, run `streamhut --help`

#### Run your own server:

```bash
$ streamhut server

Starting server...
HTTP/WebSocket port: 8080
TCP port: 1337
```

Run server with SSL/TLS:

```bash
$ mkcert localhost

$ sudo streamhut server --tls --tls-cert=localhost.pem --tls-key=localhost-key.pem -p 443
```

For more options, run `streamhut server --help`

#### Connecting to a channel

```bash
# terminal 1
$ streamhut connect -c mychannel
```

For more options, run `streamhut connect --help`

## Docker

You can run streamhut as a Docker container:

```bash
$ docker pull streamhut/streamhut
$ docker run -e PORT=8080 -e TCP_PORT=1337 -p 8080:8080 -p 1337:1337 --restart unless-stopped streamhut/streamhut:latest
```

## Self-host (docker one-liner)

One-liner to self-host using Docker:

```bash
docker run -p 8080:8080 -p 1337:1337 streamhut/streamhut
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

## Web App

The web app source code is found on [https://github.com/streamhut/web](https://github.com/streamhut/web).

## FAQ

- Q: How is the stream log data stored?

  - A: Currently it's stored in a local sqlite3 database. You can disable storage with the `--no-storage` flag, e.g. `streamhut server --no-storage`.

- Q: What happened to the streamhut NPM module?

  - A: The [node.js implementation](https://github.com/streamhut/streamhut/tree/nodejs) of streamhut is now deprecated in favor of this Golang implementation.

- Q: Can the same channel be used more than once?

  - A: Yes! send `#{channel}` (ie `#mychannel`) as the first stream text to use that channel.

    Example:

    ```bash
    exec &> >(nc stream.ht 1337);echo \#mychannel
    ```

- Q: What's the difference between _stream.ht_ and _streamhut.io_?

  - A: The domain _stream.ht_ is an alias for _streamhut.io_, meaning you can type _stream.ht_ as the domain for convenience. Other aliases are _streamhut.net_ and _streamhut.org_.

- Q: What is the difference between `exec > >(nc stream.ht 1337) 2>&1` and `exec &> >(nc stream.ht 1337)`

  - A: They are the same in that they both stream stdout and stderr to the server.

## License

Released under the [Apache 2.0](./LICENSE) license.

© [Miguel Mota](https://github.com/miguelmota)
