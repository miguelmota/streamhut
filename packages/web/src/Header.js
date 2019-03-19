import React, { Component } from 'react'
import Clipboard from './Clipboard'
import HelpTooltip from './HelpTooltip'
import MaxWidthContainer from './MaxWidthContainer'

class Header extends Component {
  shareUrlHandler(event) {
    event.currentTarget.select()
  }

  onClipboardCopy(event) {
    const target = event.trigger
    target.textContent = 'copied!'

    setTimeout(function() {
      target.textContent = 'copy'
    }, 3e3)
  }

  render() {
    return (
        <header id="header">
          <MaxWidthContainer>
            <hgroup>
              <h1>
                <img
                  src="/assets/streamhut_bb.png"
                  alt="Streamhut" />
              </h1>
              <div className="channel">
                <label>Channel URL
                  <HelpTooltip
                    text="Share this URL for others to join and see your messages"
                    iconStyle={{fontSize: '1.4em'}} />
                </label>
                <input
                  id="share-url"
                  type="text"
                  placeholder="share url"
                  readOnly
                  value={this.props.shareUrl}
                  onClick={event => this.shareUrlHandler(event)}/>
                <Clipboard
                  clipboardText={this.props.shareUrl} />
              </div>
            </hgroup>

            {/*
            <div className="info">
            <ul>
              <li>Stream and send data; web to web, terminal to web, or web to terminal.</li>
              <li>Nothing is stored, only streamed.</li>
              <li>Refreshing the page or closing tab will erase local data.</li>
              <li>Quickly share data and files between devices.</li>
              <li>URL path names map to channels.</li>
              <li>Anyone in the same channel can view what's streamed.</li>
              <li>CLI examples:</li>
              <li>Tail: <code>$ tail -F file.log | nc streamhut.io 1337</code></li>
              <li>Tee: <code>$ (echo -n; sleep 5; htop) | tee >(nc streamhut.io 1337)</code></li>
              <li>Pipe shell: <code>$ exec > >(nc streamhut.io 1337) 2>&1</code></li>
              <li>Echo: <code>$ echo 'foo' | streamhut post -h streamhut.io -c mychannel</code></li>
              <li>File: <code>$ streamhut post -h streamhut.io -c mychannel -f data.txt</code></li>
              <li><a href="https://github.com/miguelmota/streamhut" target="_blank" rel="noopener noreferrer">Developer documentation</a> | <a href="https://github.com/miguelmota/streamhut/issues/new" target="_blank" rel="noopener noreferrer">Feedback</a></li>
              </ul>
            </div>
            */}
          </MaxWidthContainer>
        </header>
    )
  }
}

export default Header;
