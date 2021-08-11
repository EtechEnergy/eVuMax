import React, { Component } from 'react'
import * as utilFunc from '../../utilFunctions/utilFunctions';

import GlobalMod from "../../objects/global";
import { confirmAlert } from "react-confirm-alert";
import * as DataObjects from "../../eVuMaxObjects/dataObjects/dataObjects";
import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

let _gMod = new GlobalMod();

interface IProps{
    objTimeLog: DataObjects.TimeLog
}

export default class TimeLogDataViewer extends Component<IProps> {
    constructor(props:any) {
        super(props);

    }

state = {
    objTimeLog: new DataObjects.TimeLog(),

}


    render() {
        return (
            <div>

            </div>
        )
    }
}
