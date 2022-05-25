import { DropDownList, Grid, Input, Label, Splitter, GridColumn as Column } from '@progress/kendo-react-all'
import React, { Component } from 'react'
import axios from "axios";
import GlobalMod from '../../../objects/global';
import BrokerRequest from '../../../broker/BrokerRequest';
import * as utilFunctions from "../../../utilFunctions/utilFunctions";
import NotifyMe from 'react-notification-timeline';
import BrokerParameter from '../../../broker/BrokerParameter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let wellList: any[] = [];
let columnList: any[] = [];

export default class SetupAlarms extends Component {
    state = {
        panes: [{ size: "30%", collapsible: false }, {}],
        WellID: "",
        WellProfileID: "",
        objProfileList: [],
        selectedProfile: "",
        warningMsg: [],
        openDialog: false,
        activeWellList: [] as any,
    }

    componentDidMount = () => {
        try {
            this.getActiveWellList();
            this.loadData();
        } catch (error) {

        }
    }



    getActiveWellList = () => {
        try {

            let objBrokerRequest = new BrokerRequest();

            this.setState({ isProcess: true });
            objBrokerRequest = new BrokerRequest();
            let objParameter = new BrokerParameter("odata", "odata");

            objBrokerRequest.Module = "Well.Data.Objects";
            objBrokerRequest.Function = "ActiveWellList";
            objBrokerRequest.Broker = "ActiveWellProfile";
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
                    let _Data = [];
                    if (res.data.RequestSuccessfull) {
                        _Data = JSON.parse(res.data.Response);
                        wellList = _Data;

                        console.log(columnList);

                        this.setState({
                            columnNames: columnList,
                            activeWellList: _Data.map((dataItem: any) =>
                                Object.assign({ selected: false }, dataItem)
                            ),
                        });
                    }

                    this.setState({ isProcess: false });
                })
                .catch((error) => {
                    if (error.response) {
                        // this.errors(error.response.message);
                    } else if (error.request) {
                        console.log("error.request");
                    } else {
                        console.log("Error", error);
                    }
                    console.log("rejected");
                });

        } catch { }
    };

    loadData() {
        try {
            debugger
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "DataSetupAlarms";
            objBrokerRequest.Function = "loadProfiles";

            //let objParameter: BrokerParameter = new BrokerParameter("objSetup", JSON.stringify(this.state.se));
            //objBrokerRequest.Parameters.push(objParameter);

            //objParameter = new BrokerParameter("WellID", this.WellId);
            //objBrokerRequest.Parameters.push(objParameter);

            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then((res) => {
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


                    this.setState({ objProfileList: objData.objProfileList, WellID: objData.WellID, WellProfileID: objData.WellProfileID });
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

    OnChange = () => {
        try {

        } catch (error) {

        }
    }

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


    render() {
        return (
            <div>
                <div>SetupAlarms</div>
                <div>

                    <div className="" style={{ display: "flex", justifyContent: "flex-start" }}>
                        {/* <label>{this.wellName} </label> */}
                    </div>
                    <div className="" style={{ display: "flex", justifyContent: "flex-end" }}>
                        <NotifyMe

                            data={this.state.warningMsg}
                            storageKey='notific_key'
                            notific_key='timestamp'
                            notific_value='update'
                            heading='Warnings'
                            sortedByKey={false}
                            showDate={false}
                            size={24}
                        />
                    </div>

                    <Splitter
                        panes={this.state.panes}
                        onChange={this.OnChange}
                        style={{ height: "90vh" }}

                    >
                        <div className={this.state.openDialog ? "k-state-disabled" : "pane-content"}>

                            <label>Click Run Button from the list to Load Information </label>


                            <Grid
                                style={{
                                    height: "750px", width: "auto"
                                }}

                                selectedField="selected"
                                data={this.state.activeWellList}
                            //   data={this.state.grdActiveWellData != null ? (this.state.grdData.map((item: any) =>
                            //     ({ ...item, selected: item.TEMPLATE_ID === this.state.currentPlotID })
                            //   )) : null}
                            //onRowClick={this.WellListRowClick}
                            >


                                {false &&
                                    <Column
                                        field="WELL_ID"
                                        title="Well Id"
                                        width="100px"
                                    />
                                }

                                <Column
                                    field="WELL_NAME"
                                    title="Well Name"
                                    width="490px"
                                    reorderable={true}
                                    //orderIndex={this.getColumnOrderIndex("WELL_NAME")}
                                    cell={(props) => (
                                        <td
                                            className="text-left"
                                        // onClick={(e) =>
                                        //   this.showOpenInterfaceDialog(props.dataItem)
                                        // }
                                        >
                                            <label>{props.dataItem.WELL_NAME}</label>
                                        </td>
                                    )}
                                />

                                <Column
                                    width="50px"
                                    headerClassName="text-center"
                                    resizable={false}
                                    field="editWell"
                                    title="Run"
                                    cell={(props) => (
                                        <td
                                            style={props.style}
                                            className={"text-center k-command-cell " + props.className}
                                            onClick={(e) => this.cmdRun_click(e, props.dataItem)}
                                        >
                                            <span>
                                                <FontAwesomeIcon icon={faChartLine} />
                                            </span>
                                        </td>
                                    )}
                                />
                            </Grid>
                        </div>

                        <div className="pane-content ml-5" id="rightPanel" >
                            {this.state.openDialog && (

                                <div>
                                    <div>SetupAlarms</div>
                                    <p>
                                        <div className="container">
                                            <div className="row">
                                                <div className="col-lg-3 col-xl-3 col-md-3 col-sm-3 p-5">
                                                    <Label>Well</Label>

                                                </div>
                                                <div className="col-lg-8 col-xl-8 col-md-8 col-sm-8 p-5">
                                                    <Input style={{ width: "70px" }} type="text" value={this.state.WellID} ></Input>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-lg-3 col-xl-3 col-md-3 col-sm-3 p-5">
                                                    <Label>Profile</Label>

                                                </div>
                                                <div className="col-lg-8 col-xl-8 col-md-8 col-sm-8 p-5">



                                                    <DropDownList
                                                        className="form-control"
                                                        textField="text"
                                                        dataItemKey="id"
                                                        data={this.state.objProfileList}
                                                        //onChange={(e) => this.OnChange(e, "LineStyle")}
                                                        value={this.state.selectedProfile}
                                                    />
                                                </div>
                                            </div>

                                        </div>



                                    </p>
                                </div>

                            )}
                        </div>
                    </Splitter>
                </div>
            </div>
        )
    }
}
