export default function reducer(state = {}, action) {
  switch (action.type) {
    case 'UPDATE':
      // In a real case scenaria ids won't necessarly be successive integers
      // This is why an object is prefered over an array
      const { id, x, y, z } = action;
      return {
        ...state,
        [id]: { x, y, z, id }
      }
  }
}