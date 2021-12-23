import BrokerParameter from "./BrokerParameter";

export default class BrokerRequest {

    RequestId !: string;
    Module !: string//Common
    Broker !: string; //Authentication
    Category !: string; //Blank
    Function !: string; //ValidateUser
    Parameters : BrokerParameter[] = [];
    RequestDateTime !: Date | string;

}