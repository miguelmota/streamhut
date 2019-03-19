import React, { Component } from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import HelpIcon from '@material-ui/icons/HelpOutline';

class HelpTooltip extends Component {
  render() {
    return (
      <Tooltip
        className="help-tooltip"
        title={this.props.text}
        aria-label={this.props.text}>
        <HelpIcon style={this.props.iconStyle} />
      </Tooltip>
    )
  }
}

export default HelpTooltip;
