import React, { Component } from 'react'

class DragAndDrop extends Component {
  constructor(props) {
    super(props)
    this.state = {
      drag: false
    }

    this.dragCounter = 0
  }

  handleDrag(event) {
    event.preventDefault()
    event.stopPropagation()
  }

  handleDragIn(event) {
    event.preventDefault()
    event.stopPropagation()

    this.dragCounter++

      if (event.dataTransfer.items &&
      event.dataTransfer.items.length > 0) {
        this.setState({drag: true})
      }
  }

  handleDragOut(event) {
    event.preventDefault()
    event.stopPropagation()

    this.dragCounter--

    if (this.dragCounter === 0) {
      this.setState({drag: false})
    }
  }

  handleDrop(event) {
    event.preventDefault()
    event.stopPropagation()

    this.setState({drag: false})

    if (event.dataTransfer.files &&
    event.dataTransfer.files.length > 0) {
      this.props.handleDrop(event.dataTransfer.files)
      event.dataTransfer.clearData()
      this.dragCounter = 0
    }
  }

  componentDidMount() {
    let el = document.body
    el.addEventListener('dragenter', event => this.handleDragIn(event))
    el.addEventListener('dragleave', event => this.handleDragOut(event))
    el.addEventListener('dragover', event => this.handleDrag(event))
    el.addEventListener('drop', event => this.handleDrop(event))
  }

  componentWillUnmount() {
    let el = document.body
    el.removeEventListener('dragenter', event => this.handleDragIn(event))
    el.removeEventListener('dragleave', event => this.handleDragOut(event))
    el.removeEventListener('dragover', event => this.handleDrag(event))
    el.removeEventListener('drop', event => this.handleDrop(event))
  }

  render() {
    return (
        <div>
        {this.state.drag &&
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#000',
              border: '4px dashed #0075ff',
              background: 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <div
              style={{
                border: '4px dashed #0075ff',
                fontSize: '2em',
                padding: '1em'
              }}>
              Drop file here
            </div>
          </div>
        }
        {this.props.children}
      </div>
    )
  }
}
export default DragAndDrop
