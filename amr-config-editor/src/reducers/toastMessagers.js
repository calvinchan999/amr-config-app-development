const toastMessagers = (state = [], action) => {
  console.log(action);
  switch (action.type) {
    case "ADD_TOAST":
      return [
        {
          payload: action,
        },
      ];
    default:
      return state;
  }
};

export default toastMessagers;
