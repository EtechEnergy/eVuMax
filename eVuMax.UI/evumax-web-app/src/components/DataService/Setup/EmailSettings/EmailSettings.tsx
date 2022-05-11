import { Button, Input, Label } from '@progress/kendo-react-all';
import React, { Component } from 'react';
import { SnapshotSettings } from '../../../../eVuMaxObjects/dataObjects/Snapshots/SnapshotSettings';
import * as utilFunc from '../../../../../src/utilFunctions/utilFunctions';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Util } from '../../../../Models/eVuMax';
import BrokerRequest from '../../../../broker/BrokerRequest';
import BrokerParameter from '../../../../broker/BrokerParameter';
import GlobalMod from '../../../../objects/global';
import axios from "axios";
import { ClientLogger } from '../../../ClientLogger/ClientLogger';

let _gMod = new GlobalMod();

export default class EmailSettings extends Component {

    state = {
        objSettings: new SnapshotSettings
    }
    componentDidMount = async () => {
        try {
        
            this.loadData();
        } catch (error) {

        }
    }

    loadData =() =>{
        try {
            debugger;
            //Util.StatusInfo("Getting data from server   ");
            this.objLogger.SendLog("load Maint Std Channels");
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupEmailSettings";
            objBrokerRequest.Function = "loadEmailSettings";
            debugger;

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
                    Util.StatusSuccess("Data successfully retrived  ");
                    this.objLogger.SendLog("load Maintain Standard Channels Data Received...");


                    let objData = JSON.parse(res.data.Response);

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
                        objSettings: objData
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

    saveData = () =>{
        try {
            try {

                let objBrokerRequest = new BrokerRequest();
                objBrokerRequest.Module = "DataService";
                objBrokerRequest.Broker = "SetupEmailSettings";
                objBrokerRequest.Function = "saveEmailSettings";
    
    
                let paramuserid: BrokerParameter = new BrokerParameter(
                    "UserId",
                    _gMod._userId
                );
                objBrokerRequest.Parameters.push(paramuserid);
    
    
                let paramobjStdChannel: BrokerParameter = new BrokerParameter(
                    "objSettings",
                    JSON.stringify(this.state.objSettings)
                );
                objBrokerRequest.Parameters.push(paramobjStdChannel);
    
    
                axios.get(_gMod._performTask, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
    
                })
                    .then((res) => {
                        Util.StatusSuccess("Data successfully saved  ");
                        this.loadData();
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


        } catch (error) {
            
        }
    }

    handleChange = (e: any, field: string) => {
        try {
            const value = e.value;
            const name = field;

            let edited: any = utilFunc.CopyObject(this.state.objSettings);
            edited[field] = value;
            this.setState({
                objSettings: edited
            });

        } catch (error) {

        }
    }

    OkClick = () => {
        try {
            this.saveData();
        } catch (error) {

        }
    }

    CancelClick = () => {
        try {

        } catch (error) {

        }
    }
    objLogger: ClientLogger = new ClientLogger("EmailSettings", _gMod._userId);

    render() {
        return (
            <div className='ml-3'>

                <div>Email Settings</div>
                <div className='ml-3'>
                <div className='row'>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">

                        <div className="row">
                            <Label className="mr-2 mt-3 float-left">SMTPHost</Label>
                            <Input
                                name="SMTPHost"
                                value={this.state.objSettings.SMTPHost}
                                onChange={(e) => this.handleChange(e, "SMTPHost")}
                            />

                        </div>

                        <div className="row">
                            <Label className="mr-2 mt-3 float-left">Port</Label>
                            <Input
                                name="Port"
                                value={this.state.objSettings.Port}
                                onChange={(e) => this.handleChange(e, "Port")}
                            />
                        </div>

                        <div className="row">
                            <Checkbox
                                className="mr-2"
                                label={"Only show Standard channels"}
                                value={this.state.objSettings.LoginRequired}
                                onChange={(e) => this.handleChange(e, "LoginRequired")}
                            />
                        </div>

                        <div className="row">
                            <Label className="mr-2 mt-3 float-left">EMail User Name</Label>
                            <Input
                                name="UserName"
                                value={this.state.objSettings.UserName}
                                onChange={(e) => this.handleChange(e, "UserName")}
                            />
                        </div>

                        <div className="row">
                            <Label className="mr-2 mt-3 float-left">EMail Password</Label>
                            <Input
                                name="Password"
                                value={this.state.objSettings.Password}
                                onChange={(e) => this.handleChange(e, "Password")}
                            />
                        </div>



                        <div className="row">
                            <Checkbox
                                className="mr-2"
                                label={"Use secure connection"}
                                value={this.state.objSettings.UseSecureConnection}
                                onChange={(e) => this.handleChange(e, "UseSecureConnection")}
                            />
                        </div>

                        <div className="row">
                            <span className="btn-group">
                                <Button style={{ width: '140px' }} className="mt-3 k-button k-primary mr-4" onClick={this.OkClick} >
                                    Ok
                                </Button>

                                <Button style={{ width: '140px' }} onClick={this.CancelClick} className="mt-3">
                                    Cancel
                                </Button>
                            </span>
                        </div>


                    </div>
                </div>
                </div>
            </div>

        )
    }
}
