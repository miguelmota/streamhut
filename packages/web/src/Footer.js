import React, { Component } from 'react'
import MaxWidthContainer from './MaxWidthContainer'
import { GithubCircle, Twitter } from 'mdi-material-ui'
import moment from 'moment'

class Footer extends Component {
  render() {
    const year = moment().year()

    return (
        <footer id="footer">
          <MaxWidthContainer>
            <div className="container">
              <div className="copyright">
                © {year} <img
                  src="/assets/streamhut_gray.png"
                  alt="Streamhut" />
              </div>
              <div className="social">
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
              </div>
            </div>
          </MaxWidthContainer>
        </footer>
    )
  }
}

export default Footer;
