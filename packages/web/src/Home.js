import React, { Component } from 'react'
import MaxWidthContainer from './MaxWidthContainer'
import styled from 'styled-components'

const UI = {
  Main: styled.div`
    background: #efefef;
  `,
  Hero: styled.div`
    display: flex;
    justify-content: center;
    padding: 3em;

    img {
      width: 100%;
      max-width: 300px;
      height: auto;
    }
  `,
  Container: styled.div`
    display: flex;
  `,
  Example: styled.div`
    display: flex;
    background: #293238;
    justify-content: center;
    padding: 5em 2em;

    div {
      width: 100%;
      text-align: center;
      background: #151d21;
      padding: 2em;
      border-radius: 1em;
      border: 1px solid #34434a;
      max-width: 500px;
    }

    pre {
      color: #fff;
      font-size: 1.3em;
    }
  `,
}

class Home extends Component {
  render() {
    return (
        <UI.Main id="site-container">
          <UI.Hero>
            <div>
              <img src="https://s3.amazonaws.com/assets.streamhut.io/streamhut_blu_blk.png" alt="logo" />
            </div>
          </UI.Hero>
          <UI.Example>
            <div>
              <pre>
                exec > >(nc streamhut.io 1337) 2>&1
              </pre>
            </div>
            <pre>
            {/*
            Don't have netcat installed? No problem! Pipe to a file descriptor with an open TCP connection:
            ```bash
            $ exec 3<>/dev/tcp/streamhut.io/1337 && head -1 <&3 && exec &> >(tee >(cat >&3))
            Streaming to: https://streamhut.io/qev
            ```
            */}
            </pre>

          </UI.Example>
          <MaxWidthContainer>
            <UI.Container>
            </UI.Container>
          </MaxWidthContainer>
        </UI.Main>
    )
  }
}

export default Home
