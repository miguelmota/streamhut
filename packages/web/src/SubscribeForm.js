import React, { Component } from 'react'
import MaxWidthContainer from './MaxWidthContainer'
import { GithubCircle, Twitter } from 'mdi-material-ui'
import styled from 'styled-components'

const UI = {
  Container: styled.div`
    font-size: 1em;
    label {
      display: block;
      font-size: 0.6em;
      margin: 0 auto 0.2em auto;
      width: 100%;
      max-width: 300px;
      text-align: left;
    }
    input[type="email"] {
      font-size: 1em;
      width: 100%;
      max-width: 300px;
      padding: 0.4em;
      @media (max-width: 500px) {
        font-size: 16px;
      }
    }
    .mc-field-group {
      margin-bottom: 0.5em;
    }
  `
}

class SubscribeForm extends Component {
  render() {
    return (
      <UI.Container id="mc_embed_signup">
        <form action="https://gmail.us20.list-manage.com/subscribe/post?u=57f8b2a65cd07836e7d5f6cc4&amp;id=036d661d13" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" novalidate>
            <div id="mc_embed_signup_scroll">
        <div className="mc-field-group">
          <label for="mce-EMAIL">Email Address  <span className="asterisk">*</span>
        </label>
        <input type="email" name="EMAIL" className="required email" id="mce-EMAIL" placeholder="bob@example.com" />
        </div>
          <div id="mce-responses" className="clear">
            <div className="response" id="mce-error-response" style={{display:'none'}}></div>
            <div className="response" id="mce-success-response" style={{display:'none'}}></div>
          </div>
          <div style={{position: 'absolute', left: '-5000px'}} aria-hidden="true"><input type="text" name="b_57f8b2a65cd07836e7d5f6cc4_036d661d13" tabindex="-1" value="" /></div>
          <div className="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" className="button" /></div>
            </div>
        </form>
      </UI.Container>
    )
  }
}

export default SubscribeForm
