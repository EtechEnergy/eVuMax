import { DropDownList, Grid, Input, Label, Splitter, GridColumn as Column, Dialog, Button, SplitterOnChangeEvent } from '@progress/kendo-react-all'
import React, { Component } from 'react'
import axios from "axios";
import GlobalMod from '../../../../objects/global';
import BrokerRequest from '../../../../broker/BrokerRequest';
import * as utilFunctions from "../../../../utilFunctions/utilFunctions";
import NotifyMe from 'react-notification-timeline';
import BrokerParameter from '../../../../broker/BrokerParameter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import ActiveWellSelector from '../../../wellSelector/ActiveWellSelector';
import { comboData } from '../../../../eVuMaxObjects/UIObjects/comboData';
import { Util } from '../../../../Models/eVuMax';
//import WellSelector from "../../wellSelector/WellSelector";

let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let wellList: any[] = [];
let columnList: any[] = [];

export default class SetupAlarms extends Component {


    state = {
        panes: [{ size: "55%", collapsible: false }, {}],
        WellID: "",
        WellName: "",
        WellProfileID: "",
        objProfileList: [],
        selectedProfile: new comboData(),
        warningMsg: [],
        openDialog: false,
        activeWellList: [] as any,
        showWellSelector: true
    }

    componentDidMount = () => {
        try {
            //this.getActiveWellList();

        } catch (error) {

        }
    }

    getSelectedWells = async (paramWellIDs: string) => {
        try {

            if (paramWellIDs.length > 0) {
                //   alert("selected Well " + paramWellIDs[0]);
                let WellName = paramWellIDs[0].split("~")[1];
                let WellID = paramWellIDs[0].split("~")[0];

                await this.setState({
                    WellName: WellName,
                    WellID: WellID
                }
                )
                this.loadData();
            } else {
                alert("Please select the well from the list");
            }

        } catch (error) {

        }
    }

    AddSetupAlarm = () => {
        try {

            this.setState(
                { showWellSelector: true }
            )
        } catch (error) {

        }
    }

    // getActiveWellList = () => {
    //     try {

    //         let objBrokerRequest = new BrokerRequest();

    //         this.setState({ isProcess: true });
    //         objBrokerRequest = new BrokerRequest();
    //         let objParameter = new BrokerParameter("odata", "odata");

    //         objBrokerRequest.Module = "Well.Data.Objects";
    //         objBrokerRequest.Function = "ActiveWellList";
    //         objBrokerRequest.Broker = "ActiveWellProfile";
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
    //                 let _Data = [];
    //                 if (res.data.RequestSuccessfull) {
    //                     _Data = JSON.parse(res.data.Response);
    //                     wellList = _Data;

    //                     console.log(columnList);

    //                     this.setState({
    //                         columnNames: columnList,
    //                         activeWellList: _Data.map((dataItem: any) =>
    //                             Object.assign({ selected: false }, dataItem)
    //                         ),
    //                     });
    //                 }

    //                 this.setState({ isProcess: false });
    //             })
    //             .catch((error) => {
    //                 if (error.response) {
    //                     // this.errors(error.response.message);
    //                 } else if (error.request) {
    //                     console.log("error.request");
    //                 } else {
    //                     console.log("Error", error);
    //                 }
    //                 console.log("rejected");
    //             });

    //     } catch { }
    // };

    loadData() {
        try {
            debugger
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "DataSetupAlarms";
            objBrokerRequest.Function = "loadProfiles";

            //let objParameter: BrokerParameter = new BrokerParameter("objSetup", JSON.stringify(this.state.se));
            //objBrokerRequest.Parameters.push(objParameter);

            let objParameter = new BrokerParameter("WellID", this.state.WellID);
            objBrokerRequest.Parameters.push(objParameter);

            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then(async (res) => {
                    const objData = JSON.parse(res.data.Response);
                    

                    console.log(objData);

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

                    

                    let selectedProfile_ = new comboData();
                    for (let index = 0; index < objData.objProfileList.length; index++) {
                        if (objData.objProfileList[index].id == objData.WellProfileID) {
                            selectedProfile_ = new comboData(objData.objProfileList[index].text, objData.objProfileList[index].id);
                        }
                    }
                    

                    await this.setState({ objProfileList: objData.objProfileList, WellID: objData.WellID, selectedProfile: selectedProfile_ });
                })
                .catch((error) => {
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
                    this.setState({ isProcess: false });
                });

        } catch (error) {

        }
    }

    onPanelChange = (event: SplitterOnChangeEvent) => {

        this.setState({
            panes: event.newState,
            warningMsg: []
        });
    };


    cmdRun_click = (e, objRow: any) => {
        try {

            let newPanes: any = this.state.panes;
            //newPanes[0].collapsed = true;
            this.setState({
                panes: newPanes,
                currentRow: objRow,
                currentPlotID: objRow.TEMPLATE_ID,
                openDialog: true,
            });

        } catch (error) {

        }
    }

    onDropdownChange = (e: any) => {
        try {

            //  let objValue: comboData = e.value;



            this.setState({
                selectedProfile: e.value
            });

            return;



        } catch (error) {

        }
    }

    okClick = () => {
        try {

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "DataSetupAlarms";
            objBrokerRequest.Function = "saveAlarm";


            let objParameter = new BrokerParameter('UserName', _gMod._userId);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter('WellID', this.state.WellID);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter('selectedProfileId', this.state.selectedProfile.id);
            objBrokerRequest.Parameters.push(objParameter);


            axios

                .get(_gMod._performTask, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json;charset=UTF-8'
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) }
                },
                )
                .then((res) => {

                    Util.StatusSuccess("Data successfully saved  ");

                })
                .catch((error) => {
                    if (error.response) {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        // this.errors(error.response.message);
                    } else if (error.request) {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        console.log('error.request');
                    } else {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        console.log('Error', error);
                    }
                    // return <CustomeNotifications Key="success" Icon={false}  />
                    console.log("rejected");
                    this.setState({ isProcess: false });
                    //this.loadDashBoardWells();
                });
            this.setState({ isProcess: false });
            this.setState({
                showWellSelector: !this.state.showWellSelector
            });

        } catch (error) {

        }
    }

    closeClick = () => {
        try {

        } catch (error) {

        }
    }


    render() {
        return (
            <div>
                <h5>Setup Alarms</h5>

                {/* <Label>{this.state.WellName}</Label>
                <Label>{this.state.WellID}</Label> */}


                <Splitter
                    panes={this.state.panes}
                    onChange={this.onPanelChange}
                    style={{ height: "90vh" }}

                >
                    <div className={this.state.openDialog ? "k-state-disabled" : "pane-content"}>
                        < ActiveWellSelector getSelectedWells={this.getSelectedWells} getWithWellName={true}></ActiveWellSelector>

                    </div>

                    <div className="pane-content ml-5" id="rightPanel" >
                        {this.state.WellID != "" && (
                            <div>
                                <div>SetupAlarms</div>
                                <p>
                                    <div className="container">
                                        <div className="row" style={{ height: "50px" }}>
                                            <div className="col-lg-8 col-xl-8 col-md-8 col-sm-8 p-5">
                                                <Label>Well : {this.state.WellName}</Label>
                                            </div>
                                        </div>

                                        <div className="row" style={{ height: "50px" }}>
                                            <div className="col-lg-3 col-xl-3 col-md-3 col-sm-3 p-5">
                                                <Label>Profile</Label>
                                            </div>
                                            <div className="col-lg-8 col-xl-8 col-md-8 col-sm-8 p-5">
                                                <DropDownList
                                                    className="form-control"
                                                    textField="text"
                                                    dataItemKey="id"
                                                    data={this.state.objProfileList}
                                                    onChange={(e) => this.onDropdownChange(e)}
                                                    value={this.state.selectedProfile}
                                                />
                                            </div>
                                        </div>


                                        <div className='row' style={{ height: "50px" }}>
                                            <div className="col-lg-8 col-xl-8 col-md-8 col-sm-8 p-5">
                                                <div className="btn-group" role="group">
                                                    <Button onClick={this.okClick} style={{ width: "100px" }}>Ok</Button>
                                                    <Button className='ml-3' onClick={this.closeClick} style={{ width: "100px" }}>Cancel</Button>


                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                </p>
                            </div>

                        )}
                    </div>
                </Splitter>

            </div>
        )
    }
}
