import React, { Component } from 'react'

class MaxWidthContainer extends Component {
  render() {
    return (
        <div className="max-width-container">
          {this.props.children}
        </div>
    )
  }
}

export default MaxWidthContainer
