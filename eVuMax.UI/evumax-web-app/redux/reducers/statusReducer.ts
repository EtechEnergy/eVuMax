import * as Types from "../types/types";
import * as TypeActions from "../types/typesActions";

const _DeafultState: Partial<Types.IStatus> = {};

const StatusReducer = (
  state = _DeafultState,
  action: TypeActions.StatusActionsTypes
): Partial<Types.IStatus> => {
  switch (action.type) {
    case TypeActions.GET_STATUS:
      return action.status;
    case TypeActions.SET_STATUS:
      return action.status;
    default:
      return state;
  }
};

export { StatusReducer };
