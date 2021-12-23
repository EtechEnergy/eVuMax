
//#region ILogin
export interface ILogin {
    _userId: string;
    _userName: string;
    _isLogged: boolean;
    _pwd:string;
}
//#endregion

//#region IStatus
export interface IStatus{
    _statusMsg:string,
    _isLoading:boolean
}
//#endregion



