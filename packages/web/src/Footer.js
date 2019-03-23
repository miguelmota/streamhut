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
  `,
  Container: styled.footer`
    display: flex;
    justify-content: space-between;
  `,
  Copyright: styled.div`
    font-weight: bold;
    display: flex;
    align-items: center;
    color: #b1b1b1;
  `,
  Social: styled.div`
    display: flex;
    align-items: center;
    vertical-align: middle;
    a {
      display: inline-flex;
      align-items: center;
      margin-left: 1em;
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
                © {year} <img
                  style={{
                    width: '100px',
                    marginLeft: '0.4em'
                  }}
                  src="/assets/streamhut_gray.png"
                  alt="Streamhut" />
              </UI.Copyright>
              <UI.Social>
                <a
                  href="https://github.com/streamhut"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Github @streamhut">
                  <GithubCircle />
                  Github
                </a>
                <a
                  href="https://twitter.com/streamhut"
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
