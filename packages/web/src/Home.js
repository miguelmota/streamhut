import React, { Component } from 'react'
import MaxWidthContainer from './MaxWidthContainer'
import styled from 'styled-components'
import { GithubCircle, Heart } from 'mdi-material-ui'
import SubscribeForm from './SubscribeForm'

const UI = {
  Main: styled.div`
    background: #efefef;
  `,
  Hero: styled.div`
    text-align: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 3em;
    @media (max-width: 500px) {
      padding: 3em 1em;
    }
  `,
  HeroImage: styled.div`
    display: block;
    margin-bottom: 2em;
    h1 {
      display: inline-block;
    }
    img {
      width: 100%;
      max-width: 300px;
      height: auto;
      @media (max-width: 500px) {
        max-width: 200px;
      }
    }
  `,
  Tagline: styled.h2`
    font-size: 1.6em;
    margin-bottom: 0.5em;
    font-weight: 500;
  `,
  SubTagline: styled.div`
    font-size: 1em;
    color: #737373;
  `,
  Container: styled.div`
    display: flex;
  `,
  Example: styled.div`
    display: flex;
    background: #293238;
    justify-content: center;
    flex-direction: column;
    padding: 5em 2em;
    text-align: center;
    small {
      display: block;
      color: #6a7e8a;
      font-size: 0.9em;
      margin: 0 auto;
      max-width: 345px;
    }
    @media (max-width: 500px) {
      padding: 3em 1em;
      small {
        max-width: 100%;
      }
    }
    p {
      color: #fff;
      font-size: 1.2em;
      margin-bottom: 1em;
    }
    div {
      text-align: center;
      background: #151d21;
      padding: 2em;
      border-radius: 4px;
      border: 1px solid #34434a;
      margin: 0 auto 1em auto;
      @media (max-width: 500px) {
        padding: 1em;
        border-radius: 0.4em;
      }
    }
    pre {
      color: #fff;
      font-size: 1.3em;
      white-space: pre-wrap;
      text-align: left;
      @media (max-width: 500px) {
        font-size: 0.8em;
      }
    }
  `,
  Example2: styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 2em;
    text-align: center;
    @media (max-width: 500px) {
      padding: 3em 1em;
    }
    p {
      font-size: 1em;
      margin-bottom: 0.2em;
    }
    small {
      display: block;
      margin-bottom: 1em;
      color: #4c4c4c;
    }
    div {
      text-align: center;
      background: #bfbfbf;
      padding: 1em;
      border-radius: 4px;
      border: 1px solid #a2a2a2;
      margin: 0 auto;
      color: #151c20;
      @media (max-width: 500px) {
        padding: 1em;
        border-radius: 0.4em;
      }
    }
    pre {
      color: #151c20;
      font-size: 0.8em;
      white-space: pre-wrap;
      text-align: left;
      @media (max-width: 500px) {
        font-size: 0.7em;
      }
    }
  `,
  UseCases: styled.div`
    display: flex;
    background: #fff;
    justify-content: center;
    flex-direction: column;
    padding: 5em 2em;
    font-size: 1.2em;
    background: #fff;
    p {
      font-size: 1.2em;
      font-weight: 500;
      width: 300px;
      margin-bottom: 1em;
    }
    ul {
      min-width: 320px;
      display: inline-block;
      list-style-position: inside;
      margin-bottom: 1em;
    }
    li {
      margin-bottom: 0.2em;
    }
    div {
      max-width: 320px;
      margin: 0 auto;
    }
    small {
      max-width: 320px;
      margin: 0 auto;
      font-size: 0.8em;
      p {
        margin-bottom: 0.5em;
        font-weight: normal;
      }
      ul {
        margin-bottom: 1em;
      }
    }
    @media (max-width: 500px) {
      font-size: 1em;
      p {
        width: auto;
      }
      ul {
        min-width: 0;
      }
    }
  `,
  SelfHost: styled.div`
    display: flex;
    background: #293238;
    justify-content: center;
    flex-direction: column;
    padding: 5em 2em;
    text-align: center;
    color: #fff;
    font-size: 1.2em;
    @media (max-width: 500px) {
      padding: 3em 1em;
    }
    p {
      margin-bottom: 0.4em;
    }
    small {
      display: block;
      margin-bottom: 1.4em;
      color: #6a7e8a;
    }
    div {
      text-align: center;
      background: #151d21;
      padding: 1em;
      border-radius: 4px;
      border: 1px solid #34434a;
      margin: 0 auto 0.2em auto;
      color: #151c20;
      @media (max-width: 500px) {
        padding: 1em;
        border-radius: 0.4em;
      }
    }
    pre {
      color: #fff;
      font-size: 0.8em;
      white-space: pre-wrap;
      text-align: left;
      @media (max-width: 500px) {
        font-size: 0.7em;
      }
    }
  `,
  Repo: styled.div`
    display: flex;
    background: #fff;
    justify-content: center;
    flex-direction: column;
    padding: 5em 2em;
    text-align: center;
    font-size: 1.2em;
    @media (max-width: 500px) {
      font-size: 1em;
    }
    div {
      font-weight: 500;
      margin-bottom: 0.5em;
      font-size: 1.4em;
    }
    small {
      display: block;
      margin-bottom: 1.2em;
      color: #696f77;
    }
  `,
  Subscribe: styled.div`
    display: flex;
    background: #fff;
    justify-content: center;
    flex-direction: column;
    padding: 5em 2em;
    text-align: center;
    font-size: 1.2em;
    background: #fff url('https://s3.amazonaws.com/assets.streamhut.io/background-pattern-round.png') repeat 0 0;
    border-top: 1px solid #f4f4f5;
    @media (max-width: 500px) {
      font-size: 1em;
    }
    p {
      font-weight: 500;
      margin-bottom: 0.5em;
      font-size: 1.4em;
    }
    small {
      display: block;
      margin-bottom: 1.2em;
      color: #696f77;
    }
  `,
}

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hostname: window.location.hostname,
      port: 1337
    }
  }

  render() {
    return (
        <UI.Main id="site-container">
          <UI.Hero id="home">
            <UI.HeroImage>
              <h1>
                <img src="https://s3.amazonaws.com/assets.streamhut.io/streamhut_blu_blk.png" alt="Streamhut" />
              </h1>
            </UI.HeroImage>
            <UI.Tagline>
              stream your terminal
            </UI.Tagline>
            <UI.SubTagline>
            Share your terminal in real-time with anyone — without installing anything
            </UI.SubTagline>
          </UI.Hero>
          <UI.Example id="example">
            <p>
              To get started, run in your terminal:
            </p>
            <div>
              <pre>
                exec > >(nc {this.state.hostname} {this.state.port}) 2>&amp;1
              </pre>
            </div>
            <small>
            The command pipes the output of the shell to streamhut and provides a url to share
            </small>
          </UI.Example>
          <UI.Example2 id="example2">
            <p>
              Don't have netcat installed? No problem
            </p>
            <small>
              Pipe to a file descriptor with an open TCP connection
            </small>
            <div>
              <pre>
                exec 3&lt;&gt;/dev/tcp/{this.state.hostname}/{this.state.port} &amp;&amp; head -1 &lt;&amp;3 &amp;&amp; exec &amp;&gt; &gt;(tee >(cat &gt;&amp;3))
              </pre>
            </div>
            <pre>
            </pre>
          </UI.Example2>
          <UI.UseCases id="use-cases">
            <div>
              <p>Use cases for streamhut:</p>
              <ul>
                <li>Debug logs withs colleagues</li>
                <li>Help a friend with programming</li>
                <li>Live terminal sessions for interviews</li>
              </ul>
            </div>

            <small>
              <p>As well as:</p>
              <ul>
                <li>Pseudo-anonymous communication</li>
                <li>Transfer content and files between devices</li>
              </ul>
            </small>
          </UI.UseCases>
          <UI.SelfHost id="self-host">
            <p>Self-hosted option? Absolutely</p>
            <small>
              Install the streamhut NPM module to run the server
            </small>
            <div>
              <pre>
                npm install -g streamhut
              </pre>
            </div>
            <div>
              <pre>
                streamhut server
              </pre>
            </div>
          </UI.SelfHost>
          <UI.Repo id="github">
            <div><Heart style={{color: '#f95d5d'}}/> Open Source</div>
            <small>streamhut source code is available on github</small>
            <div>
                <a
                  className="link"
                  href="https://github.com/miguelmota/streamhut"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Github @streamhut">
                <GithubCircle/> Github</a>
            </div>
          </UI.Repo>
          <UI.Subscribe id="subscribe">
            <p>Join the mailing list</p>
            <small>Subscribe to get notified of latest updates on news and features</small>
            <SubscribeForm />
          </UI.Subscribe>
          <MaxWidthContainer>
            <UI.Container>
            </UI.Container>
          </MaxWidthContainer>
        </UI.Main>
    )
  }
}

export default Home
