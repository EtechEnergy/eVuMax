import React, { Component } from 'react'
import { Button, Dialog, DropDownList, Grid, GridColumn, GridSelectionChangeEvent, Label } from '@progress/kendo-react-all';
import { Input } from '@progress/kendo-react-inputs'
import BrokerParameter from '../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../broker/BrokerRequest';
import * as utilFunc from '../../../../../src/utilFunctions/utilFunctions';
import axios from "axios";
import { type } from 'os';
import { comboData } from '../../../../eVuMaxObjects/UIObjects/comboData';
import GlobalMod from '../../../../objects/global';
import { Util } from '../../../../Models/eVuMax';
import { QCRule } from '../../../../eVuMaxObjects/dataObjects/DataObjects/QCRule';

let _gMod = new GlobalMod();

export default class MaintainStdChannels extends Component {
    componentDidMount = () => {
        try {
            this.loadData();
        } catch (error) {

        }
    }

    loadData = () => {
        try {

            Util.StatusInfo("Getting data from server   ");
            this.setState({
                isProcess: true,
            });

            this.objLogger.SendLog("load QC Rules");

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupMaintainStdChannels";
            objBrokerRequest.Function = "loadStdChannels";

            let paramuserid: BrokerParameter = new BrokerParameter(
                "UserId",
                _gMod._userId
            );
            objBrokerRequest.Parameters.push(paramuserid);

            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },

                })
                .then((res) => {

                    this.objLogger.SendLog("load Maintain Standard Channels Data Received...");


                    let objData = JSON.parse(res.data.Response);

                    //Warnings Notifications
                    let warnings: string = res.data.Warnings;
                    if (warnings.trim() != "") {
                        let warningList = [];
                        warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
                        this.setState({
                            warningMsg: warningList
                        });
                    } else {
                        this.setState({
                            warningMsg: []
                        });
                    }


                    
                    this.setState({
                        grdData: Object.values(objData),
                    });


                })
                .catch((error) => {

                    Util.StatusError(error.message);

                    if (error.response) {

                    } else if (error.request) {
                        console.log("error.request");
                    } else {
                        console.log("Error", error);
                    }
                    console.log("rejected");
                    this.setState({ isProcess: false });
                });

        } catch (error) {

        }
    }
    objLogger: any;
    render() {
        return (
            <div>MaintainStdChannels</div>
        )
    }
}
