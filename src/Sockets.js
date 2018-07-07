import React, { Component } from 'react';
import { connect } from 'react-redux';

const ws = new WebSocket(`ws://${window.location.hostname}:4000`);

class Socket extends Component {
  componentDidMount() {
    console.log(this.props, 'props')
    ws.addEventListener('message', ({ data }) => {
      const positionAndId = JSON.parse(data);
      this.props.dispatch({ ...positionAndId, type: 'UPDATE' });
    });
  }

  render() { return null }
}

export default connect()(Socket);