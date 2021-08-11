import { Dispatch } from "react";
import {AppActions} from '../actions/appActions';
import {AppState} from '../store/configureStore';

import * as Types from '../types/types';
import * as TypesActions from '../types/typesActions';

export const getStatus = (status:Partial<Types.IStatus>):AppActions =>({
    type: TypesActions.GET_STATUS,
    status
  });

  export const setStatus = (status:Partial<Types.IStatus>):AppActions =>({
    type: TypesActions.SET_STATUS,
    status
  });

  export const startSetStatus = (status:Partial<Types.IStatus>) => {
    return (dispatch: Dispatch<AppActions>, getState: () => AppState) => {
      dispatch(setStatus(status));
    }
  }

  export const startGetStatus = (status:Partial<Types.IStatus>) => {
    return (dispatch: Dispatch<AppActions>, getState: () => AppState) => {
      dispatch(getStatus(status));
    }
  }