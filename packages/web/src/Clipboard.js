import React, { Component } from 'react'
import ClipboardJS from 'react-clipboard.js'

class Clipboard extends Component {
  onClipboardCopy(event) {
    const target = event.trigger
    target.textContent = 'copied!'
    target.classList.add('copied')

    setTimeout(function() {
      target.textContent = 'copy'
      target.classList.remove('copied')
    }, 3e3)
  }

  render() {
    return (
      <ClipboardJS
        className={this.props.className || 'copy'}
        style={this.props.style}
        id={this.props.id}
        title="Copy to clipboard"
        data-clipboard-text={this.props.clipboardText}
        onSuccess={event => this.onClipboardCopy(event)}>
        copy
      </ClipboardJS>
    )
  }
}

export default Clipboard;
