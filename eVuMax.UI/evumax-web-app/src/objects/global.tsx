export default class GlobalMod {
  _userId: string = localUser;
  _getData = Port + ServiceName + getData;
  _performTask = Port + ServiceName + performTask;
  _getVersion = Port + ServiceName + "/getAssemblyVersion"; //Nishant 06/08/2021
}

//for Local testing
const localUser = "admin"; // "vmx_admin"; //"ETECHPC1\\ETECH-PC-2";
const Port = "http://localhost:49489";
const ServiceName = "/eVuMax.asmx";
const getData = "/getData";
const performTask = "/performTask";

//for client side install
// const localUser = "admin";
// const Port = "/../evumaxapi";
// const ServiceName = "/eVuMax.asmx";
// const getData = "/getData";
// const performTask = "/performTask";
