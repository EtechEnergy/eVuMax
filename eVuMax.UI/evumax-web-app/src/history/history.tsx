import { createBrowserHistory } from "history";

// for local testing
// export default createBrowserHistory();

// for client side install
export default createBrowserHistory({ basename: "/evumaxapp/" });

//=========================================
//Note :
////Add following line in <package className="json">
// for web deployment
// "homepage": "http://localhost/evumaxapp/",
