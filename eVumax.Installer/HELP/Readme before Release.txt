(1) /src/objects/global.tsx
	
//for Local testing
const localUser = "admin"; // "vmx_admin"; //"ETECHPC1\\ETECH-PC-2";
const Port = "http://localhost:49489";
const ServiceName = "/eVuMax.asmx";
const getData = "/getData";
const performTask = "/performTask";


// for deployment at client
// const Port = "/../evumaxapi";
// const ServiceName = "/eVuMax.asmx";
// const getData = "/getData";
// const performTask = "/performTask";


(2) /src/history/history.tsx

//for Local testing
export default createBrowserHistory();


// for deployment at client
// export default createBrowserHistory( {basename: '/evumaxapp'});

(3) package.json

////Add following line in <package className="json">
// for deployment at client
 // "homepage": "http://localhost/evumaxapp/",


(4) Copy FastEval.dll in C:\Program Files (x86)\ETECH\eVuMaxAPI\bin  
    folder
(5) Run .sql script for database