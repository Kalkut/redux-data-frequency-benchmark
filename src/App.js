import React, { Component } from 'react';
import 'aframe';
import Sockets from './Sockets';
import Users from './Users';

class App extends Component {
  render() {
    return (
      <a-scene stats className="App">
        <Sockets />
        <Users />
        <a-camera look-controls="enabled: false" wasd-controls="enabled: false" />
        <a-plane position="0 0 -4" rotation="-90 0 0" width="20" height="20" color="#7BC8A4"></a-plane>
        <a-sky color="#ECECEC"></a-sky>
      </a-scene>
    );
  }
}

export default App;
