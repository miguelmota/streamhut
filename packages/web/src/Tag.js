import React, { Component } from 'react'
import Chip from '@material-ui/core/Chip';

class Tag extends Component {
  render() {
    return (
      <Chip
        label={this.props.text}
        onDelete={this.props.onDelete}
      />
    )
  }
}

export default Tag
