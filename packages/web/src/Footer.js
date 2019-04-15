import React, { Component } from 'react'
import MaxWidthContainer from './MaxWidthContainer'
import { GithubCircle, Twitter } from 'mdi-material-ui'
import moment from 'moment'
import styled from 'styled-components'

const UI = {
  Footer: styled.footer`
    font-size: 1em;
    padding: 1em;
    text-align: right;
    width: 100%;
    background: #293238;
    align-items: start;
  `,
  Container: styled.footer`
    display: flex;
    justify-content: space-between;
    @media (max-width: 500px) {
      flex-direction: column;
    }
  `,
  Copyright: styled.div`
    font-weight: bold;
    display: flex;
    align-items: center;
    color: #547184;
    @media (max-width: 500px) {
      margin-bottom: 1em;
    }
  `,
  Social: styled.div`
    display: flex;
    align-items: center;
    vertical-align: middle;
    a {
      display: inline-flex;
      align-items: center;
      margin: 0 0 0 1em;
      color: #9e9e9e;
    }
    @media (max-width: 500px) {
      flex-direction: column;
      align-items: flex-start;
      a {
        margin: 0 0 0.5em 0;
      }
    }
  `
}

class Footer extends Component {
  render() {
    const year = moment().year()

    return (
        <UI.Footer id="footer">
          <MaxWidthContainer>
            <UI.Container>
              <UI.Copyright>
                © {year} <a href="/"><img
                  style={{
                    width: '100px',
                    marginLeft: '0.4em'
                  }}
                  src="https://s3.amazonaws.com/assets.streamhut.io/streamhut_blu-gry_400.png"
                  alt="Streamhut" /></a>
              </UI.Copyright>
              <UI.Social>
                <a
                  href="https://github.com/miguelmota/streamhut"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Github @streamhut">
                  <GithubCircle />
                  Github
                </a>
                <a
                  href="https://twitter.com/miguelmotah"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Twitter @streamhut">
                  <Twitter />
                  Twitter
                </a>
              </UI.Social>
            </UI.Container>
          </MaxWidthContainer>
        </UI.Footer>
    )
  }
}

export default Footer;
