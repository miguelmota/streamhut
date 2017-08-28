# streamhut

> Stream and send data, terminal to web and vice versa.

- Nothing is stored; only streamed.
- Originally created this to quickly share data and files between devices.
- Path names map to channels.
- Anyone in the same channel can view what's streamed.

[https://streamhut.net](https://streamhut.net)

## Usage

Start server

```bash
$ npm start

Listening on port 8956
```

Start server on specific port

```bash
$ PORT=8080 npm start

Listening on port 8080
```

## CLI

Install

```bash
$ npm install -g streamhut
```

Help

```bash
$ streamhut -help
                           (   )
                          (    )
                           (    )
                          (    )
                            )  )
                           (  (                  /\
                            (_)                 /  \  /\
                    ________[_]________      /\/    \/  \
           /\      /\        ______    \    /   /\/\  /\/\
          /  \    //_\       \    /\    \  /\/\/    \/    \
   /\    / /\/\  //___\       \__/  \    \/
  /  \  /\/    \//_____\       \ |[]|     \
 /\/\/\/       //_______\       \|__|      \
/      \      /XXXXXXXXXX\                  \
        \    /_I_II  I__I_\__________________\
               I_I|  I__I_____[]_|_[]_____I
               I_II  I__I_____[]_|_[]_____I
               I II__I  I     XXXXXXX     I
            ~~~~~"   "~~~~~~~~~~~~~~~~~~~~~~~~
                                    _
        _                          | |            _
  ___ _| |_  ____ _____ _____ ____ | |__  _   _ _| |_
 /___|_   _)/ ___) ___ (____ |    \|  _ \| | | (_   _)
|___ | | |_| |   | ____/ ___ | | | | | | | |_| | | |_
(___/   \__)_|   |_____)_____|_|_|_|_| |_|____/   \__)



  Usage: streamhut <cmd> [options]

  Commands:

    post [options]	post to a channel
    listen [options]	listen on a channel

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -h, --host <host>      host URL
    --not-secure           not using SSL.
    -c, --channel <id>     channel ID
    -t, --text <text>      text to send
    -f, --file <filepath>  file to send
```

**Listening on a channel**

```bash
$ streamhut listen -h streamhut.net -c yo
connected to wss://streamhut.net/yo

received Fri Jun 30 2017 14:40:14 GMT-0700 (PDT):

hello

```

**Posting text data to a channel**

```bash
$ streamhut post -h streamhut.net -c yo -t "hello"
posting data to wss://streamhut.net/yo:

hello

```

**Posting file data to a channel**

```bash
$ streamhut post -h streamhut.net -c yo -f hello.txt
posting data to wss://streamhut.net/yo:

hello.txt

```

**Pipe realtime stdout to streamhut xterm using [`netcat`](https://en.wikipedia.org/wiki/Netcat)**

```bash
$ while true; do date; sleep 1; done | nc streamhut.net 1337
Streaming to: https://streamhut.net/dsa
```

<img src="./screenshots/netcat.gif" width="500">

## Development

Watch and build client scripts

```bash
$ npm run watch
```

Build client scripts

```bash
$ npm run build
```

## Test

```bash
npm test
```

## License

MIT
