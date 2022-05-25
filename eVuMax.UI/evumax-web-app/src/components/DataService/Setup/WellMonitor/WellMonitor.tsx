import React, { Component } from 'react';
import axios from "axios";
import GlobalMod from '../../../../objects/global';
import { Button, ColorPicker, Input, Label } from '@progress/kendo-react-all';
import { WellMonitorSetup } from '../../../../eVuMaxObjects/dataObjects/DataObjects/WellMonitorSetup';
import { Util } from '../../../../Models/eVuMax';
import { ClientLogger } from '../../../ClientLogger/ClientLogger';
import BrokerRequest from '../../../../broker/BrokerRequest';
import BrokerParameter from '../../../../broker/BrokerParameter';
import * as utilFunctions from "../../../../utilFunctions/utilFunctions";

let _gMod = new GlobalMod();

export default class WellMonitor extends Component {

    objLogger: ClientLogger = new ClientLogger("WellMonitor", _gMod._userId);

    state = {
        objWellMonitorSetup: new WellMonitorSetup()
    }
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
            objBrokerRequest.Broker = "SetupWellMonitor";
            objBrokerRequest.Function = "loadData";

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
                    this.objLogger.SendLog("load Well Monitor Data Received...");


                    let objData = JSON.parse(res.data.Response);
                    debugger;

                    // FlagBGColor: -32768
                    // GreenThresholdFrom: 0
                    // GreenThresholdTo: 30
                    // LastError: ""
                    // RedThresholdFrom: 60
                    // RedThresholdTo: 0
                    // YellowThresholdFrom: 31
                    // YellowThresholdTo: 59

                    objData.FlagBGColor = utilFunctions.intToColor(objData.FlagBGColor);

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

                    this.setState({ objWellMonitorSetup: objData });
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


    saveData = () => {
        try {
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupWellMonitor";
            objBrokerRequest.Function = "saveData";

            let paramuserid: BrokerParameter = new BrokerParameter(
                "UserId",
                _gMod._userId
            );
            objBrokerRequest.Parameters.push(paramuserid);


            let localSetup = utilFunctions.CopyObject(this.state.objWellMonitorSetup);
            let FlagBGColor = utilFunctions.rgb2hex(this.state.objWellMonitorSetup.FlagBGColor);
            localSetup.FlagBGColor = "0";
            let objParameter: BrokerParameter = new BrokerParameter("objWellMonitor", JSON.stringify(localSetup));
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("FlagBGColor", FlagBGColor);
            objBrokerRequest.Parameters.push(objParameter);


            axios.get(_gMod._performTask, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) },

            })
                .then((res) => {
                    debugger;
                    Util.StatusSuccess("Data successfully retrived  ");


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
    }

    handleChange = (e, field: string) => {
        try {
            debugger;

            let edited: any = this.state.objWellMonitorSetup;
            // let index: number = 0;
            // index = this.state.objWellMonitorSetup.settings.findIndex((d: any) => d.SettingID === fieldName);

            edited[field] = e.value;
            this.setState({
                objWellMonitorSetup: edited
            });


        } catch (error) {

        }
    }

    okClick = () => {
        try {
            this.saveData();
        } catch (error) {

        }
    }

    cancelClick = () => {
        try {

        } catch (error) {

        }
    }

    render() {
        return (
            <div>
                <h1>Well Monitor Setup </h1>
                
                <br>
                </br>
                <h5>Well Check Thresholds (in minutes)</h5>

                <div className="container">
                    <div className="row">
                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Label className="mr-2 mt-3 float-left">Green</Label>
                        </div>
                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Input type="text" value={this.state.objWellMonitorSetup.GreenThresholdFrom} onChange={(e) => this.handleChange(e, "GreenThresholdFrom")}></Input>
                        </div>
                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Input type="text" value={this.state.objWellMonitorSetup.GreenThresholdTo} onChange={(e) => this.handleChange(e, "GreenThresholdTo")}></Input>
                        </div>

                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Button style={{ width: '130px' }} onClick={this.okClick}>Save</Button>
                        </div>
                    </div>

                    <div className="row">
                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Label className="mr-2 mt-3 float-left">Yellow</Label>

                        </div>
                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Input type="text" value={this.state.objWellMonitorSetup.YellowThresholdFrom} onChange={(e) => this.handleChange(e, "YellowThresholdFrom")}></Input>
                        </div>
                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Input type="text" value={this.state.objWellMonitorSetup.YellowThresholdTo} onChange={(e) => this.handleChange(e, "YellowThresholdTo")}></Input>
                        </div>
                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Button style={{ width: '130px' }} onClick={this.cancelClick}>Cancel</Button>
                        </div>

                    </div>


                    <div className="row">
                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Label className="mr-2 mt-3 float-left">Red</Label>

                        </div>
                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Input type="text" value={this.state.objWellMonitorSetup.RedThresholdFrom} onChange={(e) => this.handleChange(e, "RedThresholdFrom")}></Input>
                        </div>

                        <div className='col-xl-3 col-lg-3 col-md-3 col-sm-3'>
                            <Input type="text" value={this.state.objWellMonitorSetup.RedThresholdTo} onChange={(e) => this.handleChange(e, "RedThresholdTo")}></Input>
                        </div>

                    </div>


                    <Label>(Keep the 'To' value of red threshold 0 to make it open ended)</Label>

                </div>


                <h5>Well Flag Setup</h5>
                <div className="container">
                    <div className="row">
                        <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
                            <ColorPicker
                                value={this.state.objWellMonitorSetup.FlagBGColor}
                                view={"gradient"}
                                onChange={(e) => this.handleChange(e, "FlagBGColor")}
                            />

                        </div>


                    </div>
                </div>
            </div>
        )
    }
}
