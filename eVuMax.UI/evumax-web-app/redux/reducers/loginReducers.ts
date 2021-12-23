import * as Types from "../types/types";
import * as TypeActions from "../types/typesActions";

const _DefaultState: Partial<Types.ILogin> = {};
const LoginReducer = (
  state = _DefaultState,
  action: TypeActions.LoginActionsTypes
): Partial<Types.ILogin> => {
  switch (action.type) {
    case TypeActions.LOG_IN:
      return action.login;
    case TypeActions.LOG_OUT:
      return action.login;
    case TypeActions.LOGGED_DETAILS:
      return action.login;
    default:
    return  state;
  }
};


export {LoginReducer}
