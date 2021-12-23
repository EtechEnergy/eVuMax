import * as Types from "./types";

//#region ILogin

export const LOG_IN = "LOG_IN";
export const LOG_OUT = "LOG_OUT";
export const LOGGED_DETAILS = "LOGGED_DETAILS";

export interface LogInAction {
  type: typeof LOG_IN;
  login: Partial<Types.ILogin>;
}

export interface LogOutAction {
  type: typeof LOG_OUT;
  login: Partial<Types.ILogin>;
}

export interface LoggedDetailsAction {
  type: typeof LOGGED_DETAILS;
  login: Partial<Types.ILogin>;
}

export type LoginActionsTypes = LogInAction | LogOutAction | LoggedDetailsAction;

//#endregion

//#region IStatus

export const GET_STATUS = "GET_STATUS";
export const SET_STATUS = "SET_STATUS";


export interface SetStatusAction {
    type: typeof SET_STATUS;
    status: Partial<Types.IStatus>;
}

export interface GetStatusAction {
    type: typeof GET_STATUS;
    status:Partial<Types.IStatus>;
}

export type StatusActionsTypes = GetStatusAction | SetStatusAction ;

//#endregion
