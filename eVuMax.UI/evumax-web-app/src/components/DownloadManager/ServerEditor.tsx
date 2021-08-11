import { Button, Dialog, DropDownList, Input, TabStrip, TabStripTab } from '@progress/kendo-react-all';
import React, { Component, PureComponent } from 'react'
import { witsmlServer } from "../../eVuMaxObjects/downloadManager/witsmlServer";


import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";

import * as utilFunc from '../../utilFunctions/utilFunctions';

import GlobalMod from "../../objects/global";
import { confirmAlert } from "react-confirm-alert";
import { comboData } from '../../eVuMaxObjects/UIObjects/comboData';
import { Checkbox, NumericTextBox } from '@progress/kendo-react-inputs';
import axios from "axios";




let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

let _gMod = new GlobalMod();

interface IProps {
    objServer: witsmlServer

}

export class ServerEditor extends PureComponent<IProps> {

    constructor(parentRef, props: any) {
        super(props);
        this.__parentRef = parentRef;
    }
    __parentRef: any;
    cmbWitsmlVersion: comboData[] = [new comboData("1.2.0", "120"), new comboData("1.3.0", "130"), new comboData("1.3.1.1", "131")];

    state = {
        objServer: new witsmlServer(),
        selectedTab: 0,
        WITSMLVersion: new comboData("1.3.1.1", "131")
    }

    static getDerivedStateFromProps(props, state) {

        if (props.objServer.ServerID !== state.objServer.ServerID) { // initally it will be different
            //if (props.objServer !== state.objServer) {
            return {
                objServer: props.objServer
            };
        }
        // Return null to indicate no change to state.
        return null;
    }

    componentDidMount() {
        this.setComboData(this.props.objServer.WITSMLVersion);

    }

    setComboData = (WitsmlVersion: string) => {


        this.cmbWitsmlVersion.forEach((objItem: comboData) => {
            if (objItem.id == WitsmlVersion) {

                const edited = utilFunc.CopyObject(this.state.objServer);
                edited["WITSMLVersion"] = objItem.id;

                this.setState({
                    objServer: edited,
                    WITSMLVersion: objItem
                });

            }
        });
    }

    handleChange = (event: any, field: string) => {


        let value = event.value;

        const name = field; // target.props ? target.props.name : target.name;


        if (field == "WITSMLVersion") {
            this.setState({
                [field]: value
            });
            value = value.id;
        }

        let edited: any = utilFunc.CopyObject(this.state.objServer);
        edited[field] = value;



        this.setState({
            objServer: edited
        });
    };

    save = () => {
        let objServer = utilFunc.CopyObject(this.state.objServer);
        //save to DB pending


        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "DownloadManager";


        if (objServer.ServerID == "") {
            //Add new Server
            objBrokerRequest.Function = "AddWitsmlServer";
            objParameter = new BrokerParameter('Add', JSON.stringify(objServer));

            objBrokerRequest.Parameters.push(objParameter);
        } else {
            objBrokerRequest.Function = "UpdateWitsmlServer";
            objParameter = new BrokerParameter('Update', JSON.stringify(objServer));
            objBrokerRequest.Parameters.push(objParameter);

        }


        objBrokerRequest.Broker = "DownloadManager";

        objParameter = new BrokerParameter('UserName', _gMod._userId);

        objBrokerRequest.Parameters.push(objParameter);




        axios.post(_gMod._performTask, {
            paramRequest: JSON.stringify(objBrokerRequest),
        })
            .then((response) => {
                this.__parentRef.CloseServerEditor(true);
            })
            .catch((error) => {
                console.log(error);
            });
        // this.__parentRef.CloseServerEditor(true);

    }

    //Tabsrip control
    handleTabSelect = (e: any) => {
        this.setState({ selectedTab: e.selected });
    }


    render() {
        return (
            <>
                <Dialog title={"WITSML Server"}
                    onClose={(e: any) => {
                        // this.props.cancel();
                        this.__parentRef.CloseServerEditor();

                    }}
                    width="50%"
                    height={700}
                >
                    <div className="row">
                        <div className="col-2 ml-5">
                            <label>

                                <Input
                                    name="ServerName"
                                    // style={{ width: "100%" }}
                                    label="Server Name"
                                    pattern={"[A-Za-z]+"}
                                    minLength={2}
                                    required={true}
                                    value={this.state.objServer.ServerName}
                                    onChange={(e) => this.handleChange(e, "ServerName")}
                                />
                            </label>
                        </div>

                    </div>

                    <div className="row">
                        <div className="col">
                            {/* <TabStrip selected={this.state.selectedTab} onSelect={this.handleTabSelect} keepTabsMounted={true}>
                                <TabStripTab title="WITSML Source"> */}
                            <div id="tabWITSMLSource">

                                <div className="row">
                                    <div className="col-4 ml-5">
                                        <label>
                                            WITSML Source <br />
                                            <Input
                                                name="WMLSURL"
                                                // style={{ width: "100%" }}
                                                label="WMLS URL"
                                                pattern={"[A-Za-z]+"}
                                                minLength={2}
                                                // required={true}
                                                value={this.state.objServer.WMLSURL}
                                                onChange={(e) => this.handleChange(e, "WMLSURL")}
                                            />
                                        </label>
                                    </div>
                                    <div className="col-4 ml-5">
                                        <label>
                                            <br />
                                            <Input
                                                name="WMLPURL"
                                                // style={{ width: "100%" }}
                                                label="WMLP URL"
                                                pattern={"[A-Za-z]+"}
                                                minLength={2}
                                                // required={true}
                                                value={this.state.objServer.WMLPURL}
                                                onChange={(e) => this.handleChange(e, "WMLPURL")}
                                            />
                                        </label>
                                    </div>
                                </div>



                                <div className="row">
                                    <div className="col-2 ml-5">
                                        <label>
                                            WITSML Version<br />
                                            <DropDownList
                                                name="WITSMLVersion"
                                                data={this.cmbWitsmlVersion}
                                                value={this.state.WITSMLVersion}
                                                textField="text"
                                                dataItemKey="id"

                                                onChange={(e) => this.handleChange(e, "WITSMLVersion")}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-4 ml-5">
                                        <label>
                                            <br />
                                            <Input
                                                name="UserName"
                                                // style={{ width: "100%" }}
                                                label="User Name"
                                                pattern={"[A-Za-z]+"}
                                                minLength={2}
                                                // required={true}
                                                value={this.state.objServer.UserName}
                                                onChange={(e) => this.handleChange(e, "UserName")}
                                            />
                                        </label>
                                    </div>

                                    <div className="col-4 ml-5">
                                        <label>
                                            <br />
                                            <Input
                                                name="Password"
                                                // style={{ width: "100%" }}
                                                label="Password"
                                                pattern={"[A-Za-z]+"}
                                                minLength={2}
                                                type="password"
                                                // required={true}
                                                value={this.state.objServer.Password}
                                                onChange={(e) => this.handleChange(e, "Password")}
                                            />
                                        </label>
                                    </div>
                                </div>


                                <div className="row">
                                    <div className="col-3 ml-5">
                                        <Checkbox
                                            label="Use Proxy Server"
                                            name="UseProxyServer"
                                            value={this.state.objServer.UseProxyServer}
                                            onChange={(e) => this.handleChange(e, "UseProxyServer")}
                                        >

                                        </Checkbox>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-4 ml-5">
                                        <label>
                                            <br />
                                            <Input
                                                name="Proxy URL"
                                                label="ProxyURL"
                                                pattern={"[A-Za-z]+"}
                                                minLength={2}
                                                // required={true}
                                                value={this.state.objServer.ProxyURL}
                                                onChange={(e) => this.handleChange(e, "ProxyURL")}
                                            />
                                        </label>
                                    </div>

                                    <div className="col-4 ml-5">
                                        <label>
                                            <br />
                                            <Input
                                                name="ProxyPort"
                                                label="Port"
                                                value={this.state.objServer.ProxyPort}
                                                onChange={(e) => this.handleChange(e, "ProxyPort")}
                                            />
                                        </label>
                                    </div>
                                </div>


                                <div className="row">
                                    <div className="col-4 ml-5">
                                        <Checkbox
                                            label="Use Following Proxy Credentials"
                                            name="UseProxyCredentials"
                                            value={this.state.objServer.UseProxyCredentials}
                                            onChange={(e) => this.handleChange(e, "UseProxyCredentials")}
                                        >

                                        </Checkbox>
                                    </div>
                                </div>


                                <div className="row">
                                    <div className="col-4 ml-5">
                                        <label>
                                            <br />
                                            <Input
                                                name="ProxyUserName"
                                                label="User Name"
                                                pattern={"[A-Za-z]+"}
                                                minLength={2}
                                                value={this.state.objServer.ProxyUserName}
                                                onChange={(e) => this.handleChange(e, "ProxyUserName")}
                                            />
                                        </label>
                                    </div>

                                    <div className="col-4 ml-5">

                                        <Input
                                            name="TimeOut"
                                            label="TimeOut"
                                            value={this.state.objServer.TimeOut}
                                            onChange={(e) => this.handleChange(e, "TimeOut")}
                                        />
                                        <label>
                                            Seconds
                                        </label>
                                    </div>
                                </div>


                                <div className="row">
                                    <div className="col-4 ml-5">
                                        <label>
                                            <br />
                                            <Input
                                                name="ProxyPassword"
                                                label="Password"
                                                pattern={"[A-Za-z]+"}
                                                minLength={2}
                                                type="password"
                                                value={this.state.objServer.ProxyPassword}
                                                onChange={(e) => this.handleChange(e, "ProxyPassword")}
                                            />
                                        </label>
                                    </div>

                                    <div className="col-4 ml-5">
                                        <Input
                                            name="RetryCount"
                                            label="Retry Count"
                                            value={this.state.objServer.RetryCount}
                                            onChange={(e) => this.handleChange(e, "RetryCount")}
                                        />

                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-6 ml-5">
                                        <Checkbox
                                            label="Send authentication information in plain text"
                                            name="SendPlainText"
                                            value={this.state.objServer.SendPlainText}
                                            onChange={(e) => this.handleChange(e, "SendPlainText")}
                                        >

                                        </Checkbox>
                                    </div>
                                </div>

                                <div className="row">
                                    {/* Temp. no need for this in EVumax Version as per Nitin */}
                                    {/* <div className="col-2 ml-5">
                                                <Checkbox
                                                    label="Pi Data Source"
                                                    name="PiDataSource"
                                                    value={this.state.objServer.PiDataSource}
                                                    onChange={(e) => this.handleChange(e, "PiDataSource")}
                                                >

                                                </Checkbox>
                                            </div> */}

                                    <div className="col-6 ml-5">
                                        <Checkbox
                                            label="Write Back"
                                            name="WriteBack"
                                            value={this.state.objServer.WriteBack}
                                            onChange={(e) => this.handleChange(e, "WriteBack")}
                                        >

                                        </Checkbox>
                                    </div>
                                </div>






                            </div>
                            {/* </TabStripTab> */}

                            {/* Temp. no need for this in EVumax Version as per Nitin */}
                            {/* <TabStripTab title="Pi Database Source">
                                    <div id="tabPiDatabaseSource">
                                    <div className="row">
                                            <div className="col-2 ml-5">
                                                <Checkbox
                                                    label="Directly Integrated to Pi Database"
                                                    name="PiDataSource"
                                                    value={this.state.objServer.PiDataSource}
                                                    onChange={(e) => this.handleChange(e, "PiDataSource")}
                                                >

                                                </Checkbox>
                                            </div>


                                        </div>


                                    </div>
                                </TabStripTab> */}

                            {/* </TabStrip> */}
                            <div className="row mt-2 lg-12">
                                <div className="col">
                                    <span className="float-right">
                                        <Button style={{ width: '90px' }} className="k-button k-primary mr-4" onClick={this.save}>
                                            Ok
                                        </Button>
                                        <Button style={{ width: '90px' }} onClick={this.__parentRef.CloseServerEditor} className="mr-2">
                                            Cancel
                                        </Button>
                                    </span>

                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>

            </>
        )
    }
}

export default ServerEditor
