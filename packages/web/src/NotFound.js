import React, { Component } from 'react';
import styled from 'styled-components'

const UI = {
  Container: styled.div`
    display; flex;
    justify-content: center;
    align-items: center;
    padding: 3em;
    h3 {
      font-size: 2em;
      margin-bottom: 1em;
      @media (max-width: 500px) {
        font-size: 1.6em;
      }
    }
    a {
      font-weight: 500;
    }
  `,
}

class NotFound extends Component {
  render() {
    return (
      <UI.Container>
        <h3>Not found</h3>
        <div>
          <a class="link" href="/">Go Home ›</a>
        </div>
      </UI.Container>
    );
  }
}

export default NotFound
