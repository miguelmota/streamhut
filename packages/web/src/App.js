import React, { Component } from 'react';
import Home from './Home'
import Layout from './Layout'

class App extends Component {
  render() {
    return (
      <Layout>
        <Home />
      </Layout>
    );
  }
}

export default App;
