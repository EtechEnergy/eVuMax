

export default class BrokerResponse {

        RequestId !: string;
        Module !: string;
        Broker !: string;
        Category !: string;
        Response !: string;
        RequestSuccessfull !: boolean;
        Errors !: string;
        ResponseTime !: Date | string;

    }


