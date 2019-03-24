import React, { Component } from 'react'
import Clipboard from './Clipboard'
import HelpTooltip from './HelpTooltip'
import Tooltip from '@material-ui/core/Tooltip'
import MaxWidthContainer from './MaxWidthContainer'
import styled from 'styled-components'
import ClipboardJS from 'clipboard'

const UI = {
  Header: styled.header`
    margin: 0;
    display: flex;
    justify-content: space-between;
    background: #efefef;
    box-shadow: 0 1px 10px rgba(151,164,175,.1);
    padding: 1em;
  `,
  Title: styled.h1`
    font-size: 2em;
    font-weight: normal;
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `,
  UL: styled.li`
    list-style: none;
  `,
  LI: styled.li`
    margin-bottom: 0.4em;
  `,
  Channel: styled.div`
    margin-left: 2em;
    a {
      font-size: 12px;
    }
    label {
      font-size: 12px;
      margin-right: 0.4em;
      display: block;
      font-size: 0.7em;
      color: #676767;
      display: flex;
      align-items: center;
    }
    .tooltip {
      margin-left: 0.2em;
    }
  `,
  ShareUrlInput: styled.input`
    width: 180px;
    margin-right: 0.5em;
    font-size: 0.7em;
    background: #fff;
    &:hover {
      border-color: #ccc;
      cursor: pointer;
    }
  `
}

class Header extends Component {
  constructor(props) {
    super(props)

    this.shareUrl = React.createRef()
    this.copyHelpText = React.createRef()
  }

  componentDidMount() {
    new ClipboardJS(this.shareUrl.current, {
      text: trigger => {
        return this.shareUrl.current.value
      },
    })
    .on('success', () => {
      const target = this.copyHelpText.current
      const text = target.textContent
      target.textContent = 'copied!'

      setTimeout(function() {
        target.textContent = text
      }, 3e3)
    })
  }

  shareUrlHandler(event) {
    event.currentTarget.select()
  }

  render() {
    return (
        <UI.Header id="header">
          <MaxWidthContainer>
            <hgroup
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <UI.Title>
                <a
                  href="/"
                  title="Home">
                    <img
                    style={{
                      width: '150px',
                      height: 'auto'
                    }}
                    src="/assets/streamhut_bb.png"
                    alt="Streamhut" />
                  </a>

                  <Tooltip
                    className="tooltip"
                    classes={{
                      root: {
                        backgroundColor: '#ffffff',
                        color: 'rgba(0, 0, 0, 0.87)',
                        fontSize: 14,
                    }
                    }}
                    title={
                      <React.Fragment>
                        <div>
                          <ul>
                            <li>Stream and send data; web to web, terminal to web, or web to terminal.</li>
                            <li>Nothing is stored, only streamed.</li>
                            <li>Refreshing the page or closing tab will erase local data.</li>
                            <li>Quickly share data and files between devices.</li>
                            <li>URL path names map to channels.</li>
                            <li>Anyone in the same channel can view what's streamed.</li>
                          </ul>
                        </div>
                      </React.Fragment>
                    }
                  >
                    <div style={{
                      fontSize: '0.3em'
                    }}>What is this?</div>
                  </Tooltip>

              </UI.Title>
              <UI.Channel>
                <label>Channel URL
                  <HelpTooltip
                    text="Share this URL for others to join and see your messages"
                    iconStyle={{fontSize: '1.4em'}} />
                  <small
                    ref={this.copyHelpText}
                  >click to copy</small>
                </label>
                <UI.ShareUrlInput
                  style={{
                    borderRadius: '2px',
                    padding: '0.5em',
                    border: '1px solid #e0e0e0'
                  }}
                  type="text"
                  placeholder="share url"
                  readOnly
                  ref={this.shareUrl}
                  value={this.props.shareUrl}
                  onClick={event => this.shareUrlHandler(event)}/>
                <Clipboard
                  clipboardText={this.props.shareUrl} />
              </UI.Channel>

              <div style={{
                display: 'flex',
                padding: '0.5em 0.5em 0.5em 2em',
                fontSize: '0.6em',
                color: '#222',
                lineHeight: '1.4'
              }}>
                <div>
                  <UI.UL>
                    <UI.LI>CUI.LI examples:</UI.LI>
                    <UI.LI>Tail: $<code>tail -F file.log | nc streamhut.io 1337</code></UI.LI>
                    <UI.LI>Tee: $<code>(echo -n; sleep 5; htop) | tee >(nc streamhut.io 1337)</code></UI.LI>
                    <UI.LI>Pipe shell: $<code>exec > >(nc streamhut.io 1337) 2>&1</code></UI.LI>
                    {/*
                    <UI.LI>Echo: <code>$ echo 'foo' | streamhut post -h streamhut.io -c mychannel</code></UI.LI>
                    <UI.LI>File: <code>$ streamhut post -h streamhut.io -c mychannel -f data.txt</code></UI.LI>
                    */}
                    <li><a href="https://github.com/miguelmota/streamhut" target="_blank" rel="noopener noreferrer">Developer documentation</a> | <a href="https://github.com/miguelmota/streamhut/issues/new" target="_blank" rel="noopener noreferrer">Feedback</a></li>
                  </UI.UL>
                </div>
              </div>
            </hgroup>
          </MaxWidthContainer>
        </UI.Header>
    )
  }
}

export default Header;
