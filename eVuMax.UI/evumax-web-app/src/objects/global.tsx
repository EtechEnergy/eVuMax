export default class GlobalMod {
  _userId: string = "";

  _getData = Port + ServiceName + getData;
  _performTask = Port + ServiceName + performTask;
  _getVersion = Port + ServiceName + "/getAssemblyVersion"; //Nishant 06/08/2021
  _logClientMsg = Port + ServiceName + "/LogClientSideError"; //Nishant 28/09/2021 NisPC

  constructor() {

    let localUser = localStorage.getItem("persist:root");
    if (localUser != null) {
      let logindetail = JSON.parse(JSON.parse(localUser).login);
      this._userId = logindetail._userId;
    } else {
      localUser = "";

    }

  }
}

//for Local testing



//const localUser =  "admin"; // "vmx_admin"; //"ETECHPC1\\ETECH-PC-2";
const localUser: string = ""; // "vmx_admin"; //"ETECHPC1\\ETECH-PC-2";


const Port = "http://localhost:49489";
const ServiceName = "/eVuMax.asmx";
const getData = "/getData";
const performTask = "/performTask";

//for client side install



// const Port = "/../evumaxapi";
// const ServiceName = "/eVuMax.asmx";
// const getData = "/getData";
// const performTask = "/performTask";
