import React, { Component } from 'react'
import Footer from './Footer'

class Layout extends Component {
  render() {
    return (
        [
          this.props.children,
          <Footer key="footer" />
        ]
    )
  }
}

export default Layout;
