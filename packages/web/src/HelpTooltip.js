import React, { Component } from 'react'
import Tooltip from '@material-ui/core/Tooltip'

class HelpTooltip extends Component {
  render() {
    return (
      <Tooltip
        className="help-tooltip"
        title={this.props.text}
        aria-label={this.props.text}>
        <span style={this.props.iconStyle}>?</span>
      </Tooltip>
    )
  }
}

export default HelpTooltip;
