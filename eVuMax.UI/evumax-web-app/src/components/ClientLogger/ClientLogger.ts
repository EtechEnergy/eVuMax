import axios from "axios";
import BrokerRequest from "../../broker/BrokerRequest";
import GlobalMod from "../../objects/global";
import BrokerParameter from "../../broker/BrokerParameter";
import { Util } from "../../Models/eVuMax";
import { now } from "moment";
import { saveAs, encodeBase64 } from '@progress/kendo-file-saver';

let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("", "");




export class ClientLogger {
    logDateTime: Date = new Date(Date.now());
    logMessage: string = "";
    userName: string = "";
    programID: string = "";
    LogList: ClientLogger[] = [];

    downloadFile = () => {
        try {
            var textFile = null;
            let text = "Error Log:" + this.programID + "\n";

            for (let index = 0; index < this.LogList.length; index++) {
                const element = this.LogList[index];
                text += "\n" + element.logDateTime + "~" + element.logMessage;
            }
            const dataURI = "data:text/plain;base64," + encodeBase64(text);
            saveAs(dataURI, 'ClientLogger.txt');
            // saveAs(dataURI, "clientLogger.txt", {
            //     proxyURL: _gMod._port + _gMod._serviceName + "/Post_", ///path/to/proxy",
            //     forceProxy: true
            // });

        } catch (error) {

        }
    }
    // download = () => {
    //     try {

    //         var textFile = null;
    //         let text = "Error Log:" + this.programID + "\n";

    //         for (let index = 0; index < this.LogList.length; index++) {
    //             const element = this.LogList[index];
    //             text += "\n" + element.logDateTime + "~" + element.logMessage;
    //         }

    //         var data = new Blob([text], { type: 'text/plain' });
    //         if (textFile !== null) {
    //             window.URL.revokeObjectURL(textFile);
    //         }
    //         textFile = window.URL.createObjectURL(data);
    //         window.open(textFile);
    //     } catch (error) {

    //     }
    // }
    // public SendLog(userName: string, logMsg: string) {
    //     try {
    //         if (userName == "" || logMsg == "") {
    //             return;
    //         }


    //         let objBrokerRequest = new BrokerRequest();
    //         objBrokerRequest.Module = "eVuMaxLogger";
    //         objBrokerRequest.Broker = "eVuMaxLogger";
    //         objBrokerRequest.Function = "logClientMessage";


    //         objParameter = new BrokerParameter("UserFolderName", _gMod._userId);
    //         objBrokerRequest.Parameters.push(objParameter);

    //         objParameter = new BrokerParameter("ErrorMessage", logMsg);
    //         objBrokerRequest.Parameters.push(objParameter);

    //         axios
    //             .get(_gMod._getData, {
    //                 headers: {
    //                     Accept: "application/json",
    //                     "Content-Type": "application/json;charset=UTF-8",
    //                 },
    //                 params: { paramRequest: JSON.stringify(objBrokerRequest) },
    //             })
    //             .then((res) => {
    //                 //Do Nothing
    //             })
    //             .catch((error) => {
    //                 Util.StatusError(error.message);
    //                 if (error.response) {
    //                     // return <CustomeNotifications Key="success" Icon={false}  />
    //                     // this.errors(error.response.message);
    //                 } else if (error.request) {
    //                     // return <CustomeNotifications Key="success" Icon={false}  />
    //                     console.log("error.request");
    //                 } else {
    //                     // return <CustomeNotifications Key="success" Icon={false}  />
    //                     console.log("Error", error);
    //                 }
    //                 // return <CustomeNotifications Key="success" Icon={false}  />
    //                 console.log("rejected");

    //             });
    //     } catch (error) {

    //     }

    // }

    // public getLogs() {
    //     try {

    //     } catch (error) {

    //     }
    // }

    // public clearLogs() {
    //     try {

    //     } catch (error) {

    //     }
    // }

}