import React, { Component } from 'react'
import styled from 'styled-components'

const UI = {
  Container: styled.div`
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  `
}

class MaxWidthContainer extends Component {
  render() {
    return (
        <UI.Container>
          {this.props.children}
        </UI.Container>
    )
  }
}

export default MaxWidthContainer
