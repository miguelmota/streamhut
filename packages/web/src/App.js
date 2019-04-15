import React, { Component } from 'react';
import Home from './Home'
import Channel from './Channel'
import NotFound from './NotFound'
import Layout from './Layout'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

class App extends Component {
  render() {
    return (
      <Router>
      <Layout>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/s/:channel" component={Channel} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
    );
  }
}

export default App;
