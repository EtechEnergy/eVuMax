import axios from "axios";
import BrokerRequest from "../../broker/BrokerRequest";
import GlobalMod from "../../objects/global";
import BrokerParameter from "../../broker/BrokerParameter";
import { Util } from "../../Models/eVuMax";
import { now } from "moment";


let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("","");




export class ClientLogger{
    logDateTime:Date = new Date(Date.now());
    logMessage:string= "";
    userName:string = "";
   private LogList: Map<string, string> = new Map();
    
    public SendLog(userName:string, logMsg:string){
        try {
            if(userName == "" || logMsg == ""){
                return;
            }


            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "eVuMaxLogger";
            objBrokerRequest.Broker = "eVuMaxLogger";
            objBrokerRequest.Function = "logClientMessage";
      

            objParameter = new BrokerParameter("UserFolderName",_gMod._userId);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("ErrorMessage",logMsg);
            objBrokerRequest.Parameters.push(objParameter);

            axios
            .get(_gMod._getData, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) },
            })
            .then((res) => {
                    //Do Nothing
            })
            .catch((error) => {
                Util.StatusError(error.message);
                if (error.response) {
                    // return <CustomeNotifications Key="success" Icon={false}  />
                    // this.errors(error.response.message);
                } else if (error.request) {
                    // return <CustomeNotifications Key="success" Icon={false}  />
                    console.log("error.request");
                } else {
                    // return <CustomeNotifications Key="success" Icon={false}  />
                    console.log("Error", error);
                }
                // return <CustomeNotifications Key="success" Icon={false}  />
                console.log("rejected");

            });
           } catch (error) {
            
        }

    }

    public getLogs(){
try {
    
} catch (error) {
    
}
    }

    public clearLogs(){
try {
    
} catch (error) {
    
}
    }

}