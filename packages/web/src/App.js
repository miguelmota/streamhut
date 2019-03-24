import React, { Component } from 'react';
import Home from './Home'
import Channel from './Channel'
import Layout from './Layout'

class App extends Component {
  render() {
    let component = <Home />
    if (window.location.pathname !== '/') {
      component = <Channel />
    }
    return (
      <Layout>
        {component}
      </Layout>
    );
  }
}

export default App;
