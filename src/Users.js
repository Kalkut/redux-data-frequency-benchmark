import React from 'react'
import { connect } from 'react-redux';

const mapStateToProps = state => ({ usersMap: state });

function Users ({ usersMap }) {
  if(!usersMap) return null;

  // Complexity is O(n)
  const usersArray = Object
    .keys(usersMap)
    .map((id) => usersMap[id]);

  // console.log(usersArray);

  return(
    <a-entity>
      { usersArray.map( ({ id, x, y, z }) => <a-box key={id} position={`${x} ${y} ${z}`} rotation="0 45 0" color="#4CC3D9" />)}
    </a-entity>
  )
}

export default connect(mapStateToProps)(Users);
