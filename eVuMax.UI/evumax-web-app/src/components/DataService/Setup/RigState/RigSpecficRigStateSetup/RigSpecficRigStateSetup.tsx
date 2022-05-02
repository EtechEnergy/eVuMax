import axios from "axios";
import { Button, ColorPicker, ComboBox, DropDownList, Grid, GridColumn, GridToolbar, Input, Label, Splitter, SplitterOnChangeEvent, TabStrip, TabStripSelectEventArguments, TabStripTab } from '@progress/kendo-react-all'
import { Checkbox } from '@progress/kendo-react-inputs'
import React, { Component } from 'react'
import BrokerRequest from '../../../../../broker/BrokerRequest'
import "./RigSpecficRigStateSetup.css"
import GlobalMod from "../../../../../objects/global";
import * as utilFunctions from "../../../../../utilFunctions/utilFunctions";
import BrokerParameter from "../../../../../broker/BrokerParameter";
import NotifyMe from 'react-notification-timeline';
import { AutoSlideSettings } from "./AutoSlideSettings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { confirmAlert } from "react-confirm-alert";
import { faEdit, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

export default class RigSpecficRigStateSetup extends Component {
    state = {
        panes: [{ size: "100%", collapsible: false, collapsed: false }, {}],
        selectedTab: 0,
        grdRigState: [] as any,
        objRigStateSetup: {} as any,
        warningMsg: [],
        grdRigDepth: [] as any[],
        rigName: "",
        editID: "",
        EditSetup: false,
        grdRigNameList: [] as any,
        // objSettings: new AutoSlideSettings(),
    }
    ID = "";
    rigNameList: string[] = [];
    AxiosSource = axios.CancelToken.source();

    componentDidMount = () => {

        this.loadRigSetupList();
    }

    handleSelectTab = (e: TabStripSelectEventArguments) => {
        this.setState({ selectedTab: e.selected })

    }

    loadRigSetupList = async () => {
        try {
            //

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getTable";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT ID, RIG_NAME FROM VMX_RIG_RIGSTATE_SETUP ORDER BY RIG_NAME";
            objBrokerRequest.Parameters.push(objParameter);

            const axiosrequest1 = axios.get(_gMod._getData, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) },
            });

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getTable";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT DISTINCT(RIG_NAME) FROM VMX_WELL WHERE RIG_NAME<>'' ORDER BY RIG_NAME";
            objBrokerRequest.Parameters.push(objParameter);


            const axiosrequest2 = axios.get(_gMod._getData, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) },
            });



            axios.all([axiosrequest1, axiosrequest2]).then(axios.spread((...res) => {
                debugger;
                console.log(res[0]);
                console.log(res[1]);

                const objData = JSON.parse(res[0].data.Response);
                let rigNameList = Object.values(objData);
                console.log(rigNameList);

                this.setState({ grdRigNameList: rigNameList });

                const objData2 = JSON.parse(res[1].data.Response);
                let rigNameList_: string[] = [];
                for (let index = 0; index < objData2.length; index++) {
                    const element = objData2[index];
                    rigNameList_.push(element.RIG_NAME);

                }

                this.rigNameList = rigNameList_


            }));


            // objBrokerRequest = new BrokerRequest();
            // objBrokerRequest.Module = "DataObject.Manager";
            // objBrokerRequest.Function = "getTable";
            // objBrokerRequest.Broker = "WellBroker";

            // objParameter.ParamName = "strSQL";
            // objParameter.ParamValue = "SELECT ID, RIG_NAME FROM VMX_RIG_RIGSTATE_SETUP ORDER BY RIG_NAME";
            // objBrokerRequest.Parameters.push(objParameter);

            // axios
            //     .get(_gMod._getData, {
            //         headers: {
            //             Accept: "application/json",
            //             "Content-Type": "application/json;charset=UTF-8",
            //         },
            //         params: { paramRequest: JSON.stringify(objBrokerRequest) },
            //     })

            //     .then((res) => {
            //         debugger;
            //         const objData = JSON.parse(res.data.Response);

            //         this.setState({ grdRigNameList: objData });

            //     })
            //     .catch((error) => {
            //         if (error.response) {
            //             // return <CustomeNotifications Key="success" Icon={false}  />
            //             // this.errors(error.response.message);
            //         } else if (error.request) {
            //             // return <CustomeNotifications Key="success" Icon={false}  />
            //             console.log("error.request");
            //         } else {
            //             // return <CustomeNotifications Key="success" Icon={false}  />
            //             console.log("Error", error);
            //         }
            //         // return <CustomeNotifications Key="success" Icon={false}  />
            //         console.log("rejected");
            //         this.setState({ isProcess: false });
            //     });





        } catch (error) {

        }
    }

    handleChange = (objItem: any, fieldName: string) => {

        let edited: any = this.state.objRigStateSetup;

        edited[fieldName] = objItem.value;

        this.setState({
            objRigStateSetup: edited
        });

        if (fieldName == "rigName") {
            this.setState({
                rigName: objItem.value
            });
        }

        // let index: number = 0;
        // index = this.state.objRigStateSetup.settings.findIndex((d: any) => d.SettingID === fieldName);
        // if (index > -1) {
        //   edited.settings[index].Value = objItem.value;
        //   this.setState({
        //     objSettings: edited
        //   });
        // }
    }

    grdItemChange = (e: any) => {

        e.dataItem[e.field] = e.value;
        this.setState({
            grdRigState: [...this.state.grdRigState]
        });

        let newData: any = Object.values([...this.state.grdRigState]);
        let index = newData.findIndex((item: any) => item.Number === e.dataItem.Number); // use unique value like ID
        newData[index][e.field] = e.value;
        this.setState({ grdRigState: newData })
    };

    grdDepthRowClick = (event: any) => {
        this.setState({
            editID: event.dataItem.SrNo
        });
    };

    grdDepthItemChange = (e: any) => {
        debugger;
        e.dataItem[e.field] = e.value;
        this.setState({
            grdRigDepth: [...this.state.grdRigDepth]
        });

        let newData: any = Object.values([...this.state.grdRigDepth]);
        let index = newData.findIndex((item: any) => item.SrNo === e.dataItem.SrNo); // use unique value like ID
        newData[index][e.field] = e.value;
        this.setState({ grdRigDepth: newData })
    };

    cmdEditSetup = async (event: any, rowData: any) => {
        try {
            debugger;
            let newPanes: any = this.state.panes;
            newPanes[0].collapsed = true;
            newPanes[0].collapsible = true;

            newPanes[0].size = "0%";

            this.ID = rowData.ID;
            await this.setState({
                panes: newPanes,
                rigName: rowData.RIG_NAME,


                //showChartDialog: false,
            });

            this.LoadSetting();


        } catch (error) {

        }

    }

    cmdRemoveDepth = (event: any, rowData: any) => {

        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        debugger;
                        let DepthList = this.state.grdRigDepth;
                        let objRow = rowData;
                        let SrNo = objRow.SrNo;// MNEMONIC;
                        let index = DepthList.findIndex((d: any) => d.SrNo === SrNo); //find index in your array
                        DepthList.splice(index, 1);//remove element from array
                        this.setState({
                            grdRigDepth: DepthList
                        });
                    }

                },
                {
                    label: 'No',
                    onClick: () => null
                }
            ]
        });
    }



    setdata = async (objData: any) => {
        try {

            this.setState({
                objRigStateSetup: objData
            });


            let objRigStates = utilFunctions.CopyObject(Object.values(objData.rigStates));
            let grdRigState = [];
            debugger;
            if (objRigStates.length > 0) {
                for (let index = 0; index < objRigStates.length; index++) {
                    let objItem: any = objRigStates[index];
                    objItem.Color = utilFunctions.intToColor(objItem.Color);
                    grdRigState.push(objItem);
                }

                this.setState({
                    grdRigState: grdRigState
                });

            }

            let newGrdData: any = Object.values(objData.autoSlideSetupList).map((item: any, key: number) =>
                ({ ...item, SrNo: key }));





        } catch (error) {

        }
    }
    cancel = () => {
        try {

            this.setState({
                panes: [{ size: "100%", collapsible: false, collapsed: false }, {}],
                EditSetup: false

            })



        } catch (error) {

        }
    }
    Save = () => {
        try {

            console.log("Save", this.state.grdRigState);


            //Convert RGB Color to Hexa for each RigState Color




            debugger;
            let autoSlideSetupList: AutoSlideSettings[] = [];
            for (let index = 0; index < this.state.grdRigDepth.length; index++) {
                const objItem: any = this.state.grdRigDepth[index];

                let objAutoSlide: AutoSlideSettings = new AutoSlideSettings();
                objAutoSlide.FromDepth = objItem.FromDepth;
                objAutoSlide.ToDepth = objItem.ToDepth;


                autoSlideSetupList.push(objAutoSlide);

            }




            let localRigStateList: any = utilFunctions.CopyObject(this.state.grdRigState);

            for (let index = 0; index < localRigStateList.length; index++) {
                let objItem: any = localRigStateList[index];
                objItem.Color = utilFunctions.rgb2hex(objItem.Color);
            }


            localRigStateList = utilFunctions.convertMapToDictionaryJSON(localRigStateList, "Number");
            let localObjRigStateSetup = utilFunctions.CopyObject(this.state.objRigStateSetup);
            localObjRigStateSetup.UnknownColor = 0; // utilFunctions.rgb2hex(localObjRigStateSetup.UnknownColor);

            autoSlideSetupList = utilFunctions.convertMapToDictionaryJSON(autoSlideSetupList);
            localObjRigStateSetup.autoSlideSetupList = autoSlideSetupList;


            //

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "RigSpecificRigStateSetup";
            objBrokerRequest.Function = "saveRigSpecificRigStateSetup";

            let objParameter: BrokerParameter = new BrokerParameter("ID", this.ID);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("objRigStateSetup", JSON.stringify(localObjRigStateSetup));
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("objRigStateItems", JSON.stringify(localRigStateList));
            objBrokerRequest.Parameters.push(objParameter);

            let localUnknownColor = "";
            localUnknownColor = utilFunctions.rgb2hex(utilFunctions.CopyObject(this.state.objRigStateSetup.UnknownColor));
            //localObjRigStateSetup.UnknownColor= null;

            objParameter = new BrokerParameter("UnknownColor", localUnknownColor);
            objBrokerRequest.Parameters.push(objParameter);
            objParameter = new BrokerParameter("RigName", this.state.rigName);
            objBrokerRequest.Parameters.push(objParameter);


            this.AxiosSource = axios.CancelToken.source();

            axios
                .get(_gMod._performTask, {
                    cancelToken: this.AxiosSource.token,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then((res) => {
                    debugger;
                    let objResponse = JSON.parse(res.data);

                    if (objResponse.RequestSuccessfull == false) {
                        //Warnings Notifications
                        let warnings: string = objResponse.Warnings;
                        if (warnings.trim() != "") {
                            let warningList = [];
                            warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
                            this.setState({
                                warningMsg: warningList
                            });
                        }
                    }

                    this.ID = "";
                    // Util.StatusSuccess("Data successfully retrived  ");

                })
                .catch((error) => {
                    alert("error " + error.message);
                    //Util.StatusError(error.message);
                    // this.setState({
                    //   isProcess: false,
                    // });
                    //this.forceUpdate();

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


    onSplitterChange = (event: SplitterOnChangeEvent) => {
        if (this.state.EditSetup == false) {
            return;
        }
        this.setState({
            panes: event.newState,
            warningMsg: []
        });
    };


    LoadSetting = () => {
        try {
            debugger
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "CommonRigStateSetup";
            objBrokerRequest.Function = "loadRigSpecificRigStateSetup";

            let objParameter: BrokerParameter = new BrokerParameter("UserID", _gMod._userId);
            objBrokerRequest.Parameters.push(objParameter);

            alert(this.state.rigName);
            objParameter = new BrokerParameter("RigID", this.state.rigName);
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
                    const objData = JSON.parse(res.data.Response);
                    debugger;
                    console.log(objData);
                    if (res.data.RequestSuccessfull) {
                        if (objData != undefined || objData != "") {

                            if (objData.UnknownColor == -256) {
                                objData.UnknownColor = "#00000";
                            } else {
                                objData.UnknownColor = utilFunctions.intToColor(objData.UnknownColor);
                            }

                            this.setdata(objData);
                        }

                    } else {
                        // Error
                    }
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
    render() {
        return (
            <>
                <Splitter
                    panes={this.state.panes}
                    onChange={this.onSplitterChange}
                    style={{ height: "80vh" }}

                >
                    <div className={this.state.EditSetup ? "k-state-disabled" : "pane-content"}>
                        <Grid
                            // data={[{ SetupId: 'Rig2' }, { RigName: 'Shelf Drilling 0' }, { RigName: 'Rig2' }]}
                            data={this.state.grdRigNameList}
                        >
                            <GridToolbar>
                                <span>
                                    <Button onClick={() => {
                                        {
                                            let Edited = this.state.grdRigNameList;

                                            // let newRow = {
                                            //     SetupId: 0,
                                            //     RigName: 0,
                                            //     SrNo: 0,
                                            // };



                                            // if (this.state.grdRigNameList.length > 0) {
                                            //     // newRow.StartMD = editData[this.state.GeoDrlgWindowData.length-1].StartMD+1;
                                            //     newRow.SrNo = this.state.grdRigNameList.length + 1;
                                            // } else {
                                            //     newRow.SrNo = 1;

                                            // }
                                            // Edited.push(newRow);
                                            // this.setState({
                                            //     grdRigNameList: Edited
                                            // })

                                        }
                                    }}  >Add</Button>
                                </span>
                            </GridToolbar>
                            {false &&  <GridColumn
                                field="ID"
                                title="ID"
                            />}
                            <GridColumn
                                field="RIG_NAME"
                                title="Rig Name"
                            />

                            <GridColumn width="70px" headerClassName="text-center" resizable={false} locked={true}
                                field="EditSetup"
                                title="*"
                                cell={props => (
                                    <td
                                        style={props.style}
                                        className={"text-center k-command-cell " + props.className}
                                    >
                                        {/* <td className={this.props.className + " k-command-cell"} style={this.props.style}> */}
                                        <span onClick={e => this.cmdEditSetup(e, props.dataItem)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </span>

                                    </td>
                                )}
                            />
                            <GridColumn width="70px" headerClassName="text-center" resizable={false} locked={true}
                                field="removeSetup"
                                title="*"
                                cell={props => (
                                    <td
                                        style={props.style}
                                        className={"text-center k-command-cell " + props.className}
                                    >
                                        {/* <td className={this.props.className + " k-command-cell"} style={this.props.style}> */}
                                        <span onClick={e => this.cmdRemoveDepth(e, props.dataItem)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </span>

                                    </td>
                                )}
                            />

                        </Grid>
                    </div>
                    <div className="pane-content ml-5" id="rightPanel"  >
                        <div className="row m-2" style={{ justifyContent: "space-between" }}>
                            <div className="">
                                <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Rig Name</Label>
                                <ComboBox
                                    style={{ width: "300px" }}
                                    data={this.rigNameList}
                                    value={this.state.rigName}
                                    onChange={(e: any) => { this.handleChange(e, "rigName") }}
                                    allowCustom={true}
                                />
                            </div>
                            <div className="form-inline m-1" >


                                <span className="float-right ml-2 mr-2" >

                                    {" "}
                                    <button
                                        type="button"
                                        onClick={this.Save}
                                        className="btn-custom btn-custom-primary mr-1"
                                    >
                                        {/* <FontAwesomeIcon icon={faCheck} className="mr-2" /> */}
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={this.cancel}
                                        className="btn-custom btn-custom-primary ml-1"
                                    >
                                        {/* <FontAwesomeIcon icon={faTimes} className="mr-2" /> */}
                                        Cancel
                                    </button>
                                </span>

                                <NotifyMe

                                    data={this.state.warningMsg}
                                    storageKey='notific_key'
                                    notific_key='timestamp'
                                    notific_value='update'
                                    heading='Warnings'
                                    sortedByKey={false}
                                    showDate={false}
                                    size={24}
                                    color="yellow"
                                // markAsReadFn={() => 
                                //   this.state.warningMsg = []
                                // }
                                />


                            </div>
                        </div>
                        <div className="row">

                            <TabStrip selected={this.state.selectedTab} onSelect={this.handleSelectTab} >

                                <TabStripTab title="Rig States">
                                    <div>
                                        <div className="row">
                                            <div className="col-6">
                                                <Grid
                                                    style={{
                                                        height: "70vh", width: "auto"
                                                    }}

                                                    //selectedField="selected"
                                                    data={this.state.grdRigState}
                                                    onItemChange={this.grdItemChange}
                                                >

                                                    <GridColumn
                                                        field="Number"
                                                        title="Number"
                                                        width={60}
                                                    />
                                                    <GridColumn
                                                        field="Name"
                                                        title="Rig State"
                                                        width={185}
                                                    />
                                                    <GridColumn field="Color" headerClassName="text-center" className="text-center" title="Color" width={90}
                                                        cell={props => {

                                                            return (
                                                                <td className="text-center">
                                                                    <ColorPicker

                                                                        value={props.dataItem[props.field]}
                                                                        onChange={e => {
                                                                            debugger;
                                                                            props.onChange({
                                                                                dataItem: props.dataItem,
                                                                                dataIndex: props.dataIndex,
                                                                                field: props.field,
                                                                                syntheticEvent: e.syntheticEvent,
                                                                                value: e.value
                                                                            });
                                                                        }}
                                                                    />
                                                                </td>
                                                            );
                                                        }}
                                                    />

                                                </Grid>
                                            </div>
                                            <div className="col-3">
                                                <div className="row mb-2">
                                                    <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Unknown Name</Label>
                                                    <Input type='text'
                                                        value={this.state.objRigStateSetup.UnknownName}
                                                        onChange={(e: any) => { this.handleChange(e, "UnknownName") }}
                                                    >
                                                    </Input>
                                                </div>
                                                <div className="row mt-3">
                                                    <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Unknown Color</Label>
                                                    <ColorPicker
                                                        value={this.state.objRigStateSetup.UnknownColor}
                                                        view={"gradient"}
                                                        //gradientSettings={this.gradientSettings}
                                                        onChange={(e: any) => { this.handleChange(e, "UnknownColor") }}
                                                    />
                                                </div>
                                                {/* <div className="row mt-5">
                                            <Label className='' style={{ alignSelf: "flex-end", fontSize: "large", fontWeight: "bold" }}>Note: Double click on the colored cell to change color.</Label>
                                        </div> */}
                                            </div>
                                        </div>
                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Threshold Values">

                                    <div className="m-2 p-2">
                                        <Label className='' style={{ alignSelf: "flex-end", fontSize: "large", fontWeight: "bold" }}>Rig State Threshold Values</Label>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-group">
                                            <div className="">
                                                <label className="valueLabel" >
                                                    Hookload Cut Off
                                                </label>
                                                <Input type='number' style={{ width: "70px" }}

                                                    value={this.state.objRigStateSetup.HookloadCutOff}
                                                    onChange={(e: any) => { this.handleChange(e, "HookloadCutOff") }}
                                                />
                                                <label className="valueLabelBack" >
                                                    {/* {this.state.objRigStateSetup.hoo} */}
                                                </label>
                                            </div>
                                            <div className="">
                                                <label className="valueLabel">
                                                    RPM Cut Off Cash
                                                </label>
                                                <Input type='number' style={{ width: "70px" }}
                                                    value={this.state.objRigStateSetup.RPMCutOff}
                                                    onChange={(e: any) => { this.handleChange(e, "RPMCutOff") }}
                                                />
                                                <label className="valueLabelBack" >
                                                    --
                                                </label>
                                            </div>
                                            <div className="">
                                                <label className="valueLabel">
                                                    CIRC Cut Off
                                                </label>
                                                <Input type='number' style={{ width: "70px" }}

                                                    value={this.state.objRigStateSetup.CIRCCutOff}
                                                    onChange={(e: any) => { this.handleChange(e, "CIRCCutOff") }}
                                                />
                                                <label className="valueLabelBack" >
                                                    --
                                                </label>
                                            </div>
                                            <div className="">
                                                <label className="valueLabel">
                                                    Block Movement Sensitivity
                                                </label>
                                                <Input type='number' style={{ width: "70px" }}

                                                    value={this.state.objRigStateSetup.Sensitivity}
                                                    onChange={(e: any) => { this.handleChange(e, "Sensitivity") }}
                                                />
                                                <label className="valueLabelBack" >
                                                    --
                                                </label>
                                            </div>
                                            <div className="">
                                                <label className="valueLabel">
                                                    Pump Pressure Cut Off
                                                </label>
                                                <Input type='number' style={{ width: "70px" }}

                                                    value={this.state.objRigStateSetup.PumpPressureCutOff}
                                                    onChange={(e: any) => { this.handleChange(e, "PumpPressureCutOff") }}
                                                />
                                                <label className="valueLabelBack" >
                                                    --
                                                </label>
                                            </div>
                                            <div className="">
                                                <label className="valueLabel">
                                                    Depth & Hole Depth Sensitivity
                                                </label>
                                                <Input type='number' style={{ width: "70px" }}

                                                    value={this.state.objRigStateSetup.DepthComparisonSens}
                                                    onChange={(e: any) => { this.handleChange(e, "DepthComparisonSens") }}
                                                />
                                                <label className="valueLabelBack" >
                                                    --
                                                </label>
                                            </div>
                                            <div className="">
                                                <label className="valueLabel">
                                                    Surface Torque Cut Off
                                                </label>
                                                <Input type='number' style={{ width: "70px" }}

                                                    value={this.state.objRigStateSetup.TorqueCutOff}
                                                    onChange={(e: any) => { this.handleChange(e, "TorqueCutOff") }}
                                                />
                                                <label className="valueLabelBack" >
                                                    --
                                                </label>
                                            </div>


                                        </div>
                                        <div className="row mb-3" style={{ justifyContent: "flex-end" }}>
                                            <span className="mt-3">
                                                <Checkbox
                                                    value={this.state.objRigStateSetup.DetectAirDrilling}
                                                    onChange={(e: any) => { this.handleChange(e, "DetectAirDrilling") }}
                                                    //checked={this.state.removeWells}
                                                    label={"Dectect Air Drilling"}
                                                />
                                            </span>
                                        </div>
                                        <div className="">
                                            <label className="valueLabel">
                                                Mist Flow Cut Off
                                            </label>
                                            <Input type='number' style={{ width: "70px" }}

                                                value={this.state.objRigStateSetup.MistFlowCutOff}
                                                onChange={(e: any) => { this.handleChange(e, "MistFlowCutOff") }}
                                            />
                                            <label className="valueLabelBack" >
                                                --
                                            </label>
                                        </div>
                                        <div className=" mb-3">
                                            <span className="mt-3">
                                                <Checkbox
                                                    value={this.state.objRigStateSetup.DetectPipeMovement}
                                                    onChange={(e: any) => { this.handleChange(e, "DetectPipeMovement") }}
                                                    //checked={this.state.removeWells}
                                                    label={"Dectect Pipe Movement"}
                                                />
                                            </span>
                                        </div>
                                        <div className="">
                                            <label className="valueLabel">
                                                Pipe Movement Depth Threshold
                                            </label>
                                            <Input type='number' style={{ width: "70px" }}

                                                value={this.state.objRigStateSetup.PipeMovementThreshold}
                                                onChange={(e: any) => { this.handleChange(e, "PipeMovementThreshold") }}
                                            />
                                            <label className="valueLabelBack" >
                                                --
                                            </label>
                                        </div>
                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Auto Slide Drilling Parameaters">
                                    <div className="m-2 p-2">
                                        <div className="row">
                                            <span className="mt-3">
                                                <Checkbox
                                                    value={this.state.objRigStateSetup.DetectAutoSlideDrilling}
                                                    onChange={(e: any) => { this.handleChange(e, "DetectAutoSlideDrilling") }}
                                                    //checked={this.state.removeWells}
                                                    label={"Dectect Auto Slide Drilling"}
                                                />
                                            </span>
                                        </div>

                                        <div className="row">
                                            <div className="col-12">
                                                <div className="">
                                                    <label className="valueLabel" >
                                                        Max. RPM Cutoff
                                                    </label>
                                                    <Input type='number' style={{ width: "70px" }}

                                                        value={this.state.objRigStateSetup.MaxRPM}
                                                        onChange={(e: any) => { this.handleChange(e, "MaxRPM") }}
                                                    />
                                                    <label className="valueLabelBack" >
                                                        RPM
                                                    </label>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="row mt-2 mb-2">
                                            <div className="col-12" style={{ textAlign: "center" }}>
                                                <label className="" style={{ color: "lightblue" }}>
                                                    VuMax will dectect the Auto Slide if the RPM is below the cutoff value.
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <div className="">
                                                    <label className="valueLabel" >
                                                        No. of Torque Fluctuations
                                                    </label>
                                                    <Input type='number' style={{ width: "70px" }}

                                                        value={this.state.objRigStateSetup.TorqueCycles}
                                                        onChange={(e: any) => { this.handleChange(e, "TorqueCycles") }}
                                                    />
                                                    <label className="valueLabelBack" >
                                                        --
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="">
                                                    <label className="valueLabel" >
                                                        Max. Torque
                                                    </label>
                                                    <Input type='number' style={{ width: "70px" }}

                                                        value={this.state.objRigStateSetup.TorqueMax}
                                                        onChange={(e: any) => { this.handleChange(e, "TorqueMax") }}
                                                    />
                                                    <label className="valueLabelBack" >
                                                        --
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <div className="">
                                                    <label className="valueLabel" >
                                                        Percentage Window
                                                    </label>
                                                    <Input type='number' style={{ width: "66px" }}

                                                        value={this.state.objRigStateSetup.PercentWindow}
                                                        onChange={(e: any) => { this.handleChange(e, "PercentWindow") }}
                                                    />
                                                    <label className="valueLabelBack" >
                                                        %
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="">
                                                    <label className="valueLabel" >
                                                        Min. Variance
                                                    </label>
                                                    <Input type='number' style={{ width: "70px" }}

                                                        value={this.state.objRigStateSetup.MinTorqueDifference}
                                                        onChange={(e: any) => { this.handleChange(e, "MinTorqueDifference") }}
                                                    />
                                                    <label className="valueLabelBack" >
                                                        --
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="">
                                                    <label className="valueLabel" >
                                                        Time
                                                    </label>
                                                    <Input type='number' style={{ width: "70px" }}

                                                        value={this.state.objRigStateSetup.CalibrationTime}
                                                        onChange={(e: any) => { this.handleChange(e, "CalibrationTime") }}
                                                    />
                                                    <label className="valueLabelBack" >
                                                        minutes
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Auto Slide Drilling Parameaters (2)">
                                    <div>
                                        <div className="row">
                                            <div className="col-lg-12">
                                                <Grid
                                                    style={{
                                                        height: "70vh", width: "auto"
                                                    }}

                                                    data={this.state.grdRigDepth != null ? (this.state.grdRigDepth.map((item: any) =>
                                                        ({ ...item, inEdit: item.SrNo === this.state.editID })
                                                    )) : null}
                                                    resizable={true}
                                                    scrollable={"scrollable"}
                                                    sortable={true}
                                                    onItemChange={this.grdDepthItemChange}
                                                    onRowClick={this.grdDepthRowClick}
                                                    editField="inEdit"
                                                    selectedField="inEdit"
                                                //data={this.state.grdRigDepth}
                                                //onItemChange={this.grdDepthItemChange}
                                                >
                                                    <GridToolbar>
                                                        <span>
                                                            <Button onClick={() => {
                                                                {
                                                                    let Edited = this.state.grdRigDepth;

                                                                    let newRow = {
                                                                        FromDepth: 0,
                                                                        ToDepth: 0,
                                                                        SrNo: 0,
                                                                    };



                                                                    if (this.state.grdRigDepth.length > 0) {
                                                                        // newRow.StartMD = editData[this.state.GeoDrlgWindowData.length-1].StartMD+1;
                                                                        newRow.SrNo = this.state.grdRigDepth.length + 1;
                                                                    } else {
                                                                        newRow.SrNo = 1;

                                                                    }
                                                                    Edited.push(newRow);
                                                                    this.setState({
                                                                        grdRigDepth: Edited
                                                                    })

                                                                }
                                                            }}  >Add</Button>
                                                        </span>
                                                    </GridToolbar>

                                                    <GridColumn
                                                        field="FromDepth"
                                                        title="From Depth"
                                                        width={200}
                                                        editor="numeric"
                                                    />
                                                    <GridColumn
                                                        field="ToDepth"
                                                        title="To Depth"
                                                        width={200}
                                                        editor="numeric"
                                                    />

                                                    <GridColumn width="70px" headerClassName="text-center" resizable={false} locked={true}
                                                        field="removeDepth"
                                                        title="*"
                                                        cell={props => (
                                                            <td
                                                                style={props.style}
                                                                className={"text-center k-command-cell " + props.className}
                                                            >
                                                                {/* <td className={this.props.className + " k-command-cell"} style={this.props.style}> */}
                                                                <span onClick={e => this.cmdRemoveDepth(e, props.dataItem)}>
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </span>

                                                            </td>
                                                        )}
                                                    />

                                                </Grid>
                                            </div>

                                        </div>
                                    </div>
                                </TabStripTab>
                            </TabStrip>

                        </div>
                    </div>

                </Splitter>

            </>)
    }
}
