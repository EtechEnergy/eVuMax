import { combineReducers } from "redux";
import { LoginReducer } from "./loginReducers";
import {StatusReducer} from "./statusReducer";

export const rootReducer = combineReducers(
    {
        login: LoginReducer,
        status: StatusReducer

    });