import * as Types from "../types/types";
import * as TypesActions from "../types/typesActions";
import { AppActions } from "./appActions";
import { Dispatch } from "react";
import { AppState } from "../store/configureStore";
import GlobalMod from "../../objects/global";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import axios from "axios";
import history from "../../history/history";
import { setStatus } from "./statusActions";

let _gMod = new GlobalMod();
let objBrokerResponse = new BrokerRequest();
let objLogin: Partial<Types.ILogin> = {};
let objStatus: Partial<Types.IStatus> = {};

export const Log_In = (login: Partial<Types.ILogin>): AppActions => ({
  type: TypesActions.LOG_IN,
  login,
});

export const Log_Out = (login: Partial<Types.ILogin>): AppActions => ({
  type: TypesActions.LOG_OUT,
  login,
});

export const Log_Details = (login: Partial<Types.ILogin>): AppActions => ({
  type: TypesActions.LOGGED_DETAILS,
  login,
});

export const startLog_Details = (login: Partial<Types.ILogin>) => {
  return (dispatch: Dispatch<AppActions>, getState: () => AppState) => {
    dispatch(Log_In(login));
  };
};

export const startLog_Out = (login: Partial<Types.ILogin>) => {
  return (dispatch: Dispatch<AppActions>, getState: () => AppState) => {
    localStorage.clear();
    objStatus = {};
    objStatus._statusMsg = "";
    objStatus._isLoading = false;
    dispatch(setStatus(objStatus));

    dispatch(Log_Out(login));
    history.push("/");
  };
};

export const startLog_In = (login: Partial<Types.ILogin>) => {
  return (dispatch: Dispatch<AppActions>, getState: () => AppState) => {

    objStatus = {};
    objStatus._statusMsg = "Please wait, connecting to the API....";
    objStatus._isLoading = true;

    dispatch(setStatus(objStatus));

    objBrokerResponse.Module = "Common";
    objBrokerResponse.Function = "ValidateUser";
    objBrokerResponse.Broker = "Authentication";
    let objParameter = new BrokerParameter("login", JSON.stringify(login));
    objBrokerResponse.Parameters.push(objParameter);

    axios
      .get(_gMod._getData, {
        params: { paramRequest: JSON.stringify(objBrokerResponse) },
      })
      .then((res) => {

        if (res.data.RequestSuccessfull) {
          objStatus = {};
          // objStatus._statusMsg =  "Succesfully Log In";
          objStatus._isLoading = false;
          dispatch(setStatus(objStatus));

          login._pwd = "";
          history.push("/dashboard/home");
          return dispatch(Log_In(login));
        } else {
          objStatus = {};
          objStatus._statusMsg = res.data.Errors;
          objStatus._isLoading = false;
          dispatch(setStatus(objStatus));
          return dispatch(Log_In(objLogin));
        }
      })
      .catch((error) => {
        objStatus = {};
        objStatus._statusMsg = error.message;
        objStatus._isLoading = false;
        dispatch(setStatus(objStatus));
        return dispatch(Log_In(objLogin));
      });
  };
};
