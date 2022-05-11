import React, { Component } from 'react'
import { Button, Dialog, DropDownList, Grid, GridColumn as Column, GridSelectionChangeEvent, Label } from '@progress/kendo-react-all';
import { Checkbox, Input } from '@progress/kendo-react-inputs'
import BrokerParameter from '../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../broker/BrokerRequest';
import * as utilFunc from '../../../../../src/utilFunctions/utilFunctions';
import axios from "axios";
import { type } from 'os';
import { comboData } from '../../../../eVuMaxObjects/UIObjects/comboData';
import GlobalMod from '../../../../objects/global';
import { Util } from '../../../../Models/eVuMax';
import { MaintainStdChannel } from '../../../../eVuMaxObjects/dataObjects/DataObjects/MaintainStdChannel';
import { ClientLogger } from '../../../ClientLogger/ClientLogger';
import { confirmAlert } from 'react-confirm-alert';



let _gMod = new GlobalMod();

export default class MaintainStdChannels extends Component {
    objLogger: ClientLogger = new ClientLogger("MaintainStdChannels", _gMod._userId);
    state = {
        grdData: [] as any,
        objMMData: [] as any,
        objStdChannel: new MaintainStdChannel,
        selectedStdChannel: "",
        showStdChannelDialog: false,
        EditMode: "A",
        cboDataTypeList: [] as any,
        selectedDataType: new comboData("Double", "Double"),
        cboLogTypeList: [] as any,
        selectedLogType: new comboData("Time Log", "1"),

        grdMMData: [] as any,
        showMnemonicMapping: false,
        cboMMLogTypeList: [] as any,

        selectedMMLogType: new comboData("Time Log", "1"),
        cboMMVuMaxChannelList: [] as any,
        selectedMMVuMaxChannel: new comboData("", "1"),
        

        showAddMnemonic: false,
        SourceMnemonic: "",
        selectedSourceMnemonicId: "",
        ShowStandard: true

    }
    componentDidMount = async () => {
        try {
            await this.generateCombo();
            this.loadData();
        } catch (error) {

        }
    }

    generateCombo = () => {
        try {

            let dataTypeList = [];
            dataTypeList.push(new comboData("Double", "Double"));
            dataTypeList.push(new comboData("DateTime", "DateTime"));
            dataTypeList.push(new comboData("STRING", "STRING"));


            let logTypeList = [];
            logTypeList.push(new comboData("Time Log", "1"));
            logTypeList.push(new comboData("Depth Log", "2"));

            this.setState({ cboDataTypeList: dataTypeList, cboLogTypeList: logTypeList, cboMMLogTypeList: logTypeList });


        } catch (error) {

        }
    }

    loadData = () => {
        try {
            Util.StatusInfo("Getting data from server   ");
            this.objLogger.SendLog("load Maint Std Channels");
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



    loadMnemonicMappingData = () => {
        try {
            Util.StatusInfo("Getting data from server   ");
            this.objLogger.SendLog("load Memonic Mapping Channels");
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupMaintainStdChannels";
            if (this.state.ShowStandard) {
                objBrokerRequest.Function = "generateMMStandardChannels";

            } else {
                objBrokerRequest.Function = "generateMMAllChannels";
            }
            let paramuserid: BrokerParameter = new BrokerParameter(
                "UserId",
                _gMod._userId
            );
            objBrokerRequest.Parameters.push(paramuserid);

            let paraLogType: BrokerParameter = new BrokerParameter(
                "LogType", this.state.selectedMMLogType.id
            );
            objBrokerRequest.Parameters.push(paraLogType);

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
                    this.objLogger.SendLog("loaded Memonic mapping Data Received...");

                    let objMMData_ = JSON.parse(res.data.Response);

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
                    
                    let cboData = new comboData();
                    let cboMMVuMaxChannelList_ = [];
                    let selectedMMVuMaxChannel_ = new comboData();
                    for (let index = 0; index < objMMData_.length; index++) {
                        if (this.state.ShowStandard) {
                            cboData = new comboData("[" + objMMData_[index].MNEMONIC + "]  " + objMMData_[index].CURVE_NAME, objMMData_[index].MNEMONIC);
                        } else {
                            cboData = new comboData(objMMData_[index].MNEMONIC, objMMData_[index].MNEMONIC);
                        }
                       if (index == 0) {
                            selectedMMVuMaxChannel_ = cboData;
                        }
                        cboMMVuMaxChannelList_.push(cboData);
                    }
                    this.setState({
                        cboMMVuMaxChannelList: cboMMVuMaxChannelList_, selectedMMVuMaxChannel: selectedMMVuMaxChannel_, objMMData: objMMData_
                    });
                    this.loadMnemonicGrid(selectedMMVuMaxChannel_);
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


    loadMnemonicGrid = (paramMnemonic) => {
        try {
            Util.StatusInfo("Getting data from server   ");
            this.objLogger.SendLog("load Memonic Grid");
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupMaintainStdChannels";
            objBrokerRequest.Function = "loadMappingGrid";

            let paramuserid: BrokerParameter = new BrokerParameter(
                "UserId",
                _gMod._userId
            );
            objBrokerRequest.Parameters.push(paramuserid);

            let paraLogType: BrokerParameter = new BrokerParameter(
                "Mnemonic", paramMnemonic.id //this.state.selectedMMLogType.id
            );
            objBrokerRequest.Parameters.push(paraLogType);

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
                    this.objLogger.SendLog("loaded Memonic Grid Data Received...");

                    let objMnemonicList = JSON.parse(res.data.Response);
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
                        grdMMData: Object.values(objMnemonicList)
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
    //objLogger: any;

    editStdChannels = async () => {
        try {
            //EditMode

            let objStdChannel_: MaintainStdChannel;
            for (let index = 0; index < this.state.grdData.length; index++) {
                if (this.state.grdData[index].Mnemonic == this.state.selectedStdChannel) {
                    objStdChannel_ = this.state.grdData[index];
                    break;
                }
            }
            await this.setState({ objStdChannel: objStdChannel_, showStdChannelDialog: true, EditMode: "E" });


        } catch (error) {

        }
    }

    removeStdChannels = () => {
        try {
            if (this.state.selectedStdChannel == "") {
                alert("Please select the row from grid ");
                return;
            }

            confirmAlert({
                //title: 'eVuMax',
                message: 'Are you sure want to delete Channel ?',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Yes',
                        onClick: async () => {

                            let objBrokerRequest = new BrokerRequest();
                            objBrokerRequest.Module = "DataService";
                            objBrokerRequest.Broker = "SetupMaintainStdChannels";
                            objBrokerRequest.Function = "removeStdChannel";

                            let paramuserid: BrokerParameter = new BrokerParameter(
                                "UserId",
                                _gMod._userId
                            );
                            objBrokerRequest.Parameters.push(paramuserid);


                            let paramStdChannel: BrokerParameter = new BrokerParameter(
                                "StdChannel",
                                this.state.selectedStdChannel
                            );

                            objBrokerRequest.Parameters.push(paramStdChannel);

                            let paramLogType: BrokerParameter = new BrokerParameter(
                                "LogType",
                                this.state.selectedLogType.id
                            );

                            objBrokerRequest.Parameters.push(paramLogType);

                            axios.get(_gMod._performTask, {
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json;charset=UTF-8",
                                },
                                params: { paramRequest: JSON.stringify(objBrokerRequest) },

                            })
                                .then((res) => {
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
                        }

                    },
                    {
                        label: 'No',
                        onClick: () => null
                    }
                ]
            });


        } catch (error) {

        }

    }

    mnemonicMapping = () => {
        try {
            this.loadMnemonicMappingData();
            this.setState({ showMnemonicMapping: true });

        } catch (error) {

        }
    }


    grdRowClick = async (event: GridSelectionChangeEvent) => {
        try {

            await this.setState({ selectedStdChannel: event.dataItem.Mnemonic, selectedLogType: new comboData(event.dataItem.LogName, event.dataItem.LogType) })
        } catch (error) {

        }
    }

    handleChange = (e: any, field: string) => {
        try {
            const value = e.value;
            const name = field;

            let edited: any = utilFunc.CopyObject(this.state.objStdChannel);
            edited[field] = value;
            this.setState({
                objStdChannel: edited
            });

        } catch (error) {

        }
    }


    handleChangeDropDown = (event: any, field?: string) => {
        try {
            if (field == "DataType") {
                this.setState({
                    selectedDataType: event.value
                });
            }
            if (field == "LogType") {
                this.setState({
                    selectedLogType: event.value
                });
            }

            if (field == "MMLogType") {
                this.setState({
                    selectedMMLogType: event.value
                });
            }

            if (field == "MMVuMaxChannel") {
                
                this.setState({
                    selectedMMVuMaxChannel: event.value
                });
                
                this.loadMnemonicGrid(event.value);
            }


        } catch (error) {

        }
    }

    OkClick = async () => {
        try {
            let objStdChannel_ = new MaintainStdChannel();
            objStdChannel_.Mnemonic = this.state.objStdChannel.Mnemonic;
            objStdChannel_.ChannelName = this.state.objStdChannel.ChannelName;
            objStdChannel_.LogType = eval(this.state.selectedLogType.id);
            objStdChannel_.DataType = this.state.selectedDataType.text;

            await this.setState({ objStdChannel: objStdChannel_, showStdChannelDialog: false });
            this.saveChannel();

        } catch (error) {

        }
    }


    CancelClick = () => {
        try {
            this.setState({
                showStdChannelDialog: false
            });

        } catch (error) {

        }
    }

    saveChannel = () => {
        try {

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupMaintainStdChannels";
            objBrokerRequest.Function = "saveStdChannel";


            let paramuserid: BrokerParameter = new BrokerParameter(
                "UserId",
                _gMod._userId
            );
            objBrokerRequest.Parameters.push(paramuserid);


            let paramobjStdChannel: BrokerParameter = new BrokerParameter(
                "objStdChannel",
                JSON.stringify(this.state.objStdChannel)
            );
            objBrokerRequest.Parameters.push(paramobjStdChannel);

            let paramEditMode: BrokerParameter = new BrokerParameter(
                "EditMode",
                this.state.EditMode
            );

            objBrokerRequest.Parameters.push(paramEditMode);

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
    }

    //#region  Mapping

    addMapping = () => {
        try {
            this.setState({ showAddMnemonic: true, SourceMnemonic: "" });
        } catch (error) {

        }
    }
    removeMapping = () => {
        try {
            if (this.state.selectedSourceMnemonicId == "") {
                alert("Please select the Mnemonic from the list");
                return;
            }
            confirmAlert({
                //title: 'eVuMax',
                message: 'Are you sure want to delete ?',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Yes',
                        onClick: async () => {

                            let objBrokerRequest = new BrokerRequest();
                            objBrokerRequest.Module = "DataService";
                            objBrokerRequest.Broker = "SetupMaintainStdChannels";
                            objBrokerRequest.Function = "removeMapping";

                            let paramuserid: BrokerParameter = new BrokerParameter(
                                "UserId",
                                _gMod._userId
                            );
                            objBrokerRequest.Parameters.push(paramuserid);


                            let paramStdChannel: BrokerParameter = new BrokerParameter(
                                "MnemonicId",
                                this.state.selectedSourceMnemonicId
                            );

                            objBrokerRequest.Parameters.push(paramStdChannel);


                            axios.get(_gMod._performTask, {
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json;charset=UTF-8",
                                },
                                params: { paramRequest: JSON.stringify(objBrokerRequest) },

                            })
                                .then((res) => {
                                    Util.StatusSuccess("Data successfully retrived  ");
                                    this.loadMnemonicGrid(this.state.selectedMMVuMaxChannel);
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
                        }
                    },
                    {
                        label: 'No',
                        onClick: () => null
                    }
                ]
            });
        } catch (error) {

        }
    }

    closeMapping = () => {
        try {
            this.setState({ showMnemonicMapping: false });
        } catch (error) {

        }
    }

    OkMappingClick = () => {
        try {
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupMaintainStdChannels";
            objBrokerRequest.Function = "addMapping";

            let paramuserid: BrokerParameter = new BrokerParameter(
                "UserId",
                _gMod._userId
            );
            objBrokerRequest.Parameters.push(paramuserid);

            let paramMnemonic: BrokerParameter = new BrokerParameter(
                "Mnemonic",
                this.state.selectedMMVuMaxChannel.id
            );
            objBrokerRequest.Parameters.push(paramMnemonic);

            
            let paramSourceMnemonic: BrokerParameter = new BrokerParameter(
                "SourceMnemonic",
                this.state.SourceMnemonic
            );
            objBrokerRequest.Parameters.push(paramSourceMnemonic);


            axios.get(_gMod._performTask, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) },

            })
                .then((res) => {
                    Util.StatusSuccess("Data successfully retrived  ");
                    this.loadMnemonicGrid(this.state.selectedMMVuMaxChannel);
                    this.setState({  showAddMnemonic: false});

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


    //#endregion
    render() {
        return (
            <div>
                <div>
                    <div>Maintain Standard Channels</div>

                    <div className="row">
                        <div className=' col-xl-10 col-lg-10 col-md-10 col-sm-10'>
                            <Grid

                                style={{ height: "500px", minHeight: "150px" }}
                                resizable={true}
                                scrollable={"scrollable"}
                                sortable={false}
                                selectedField="selected"
                                data={
                                    this.state.grdData != null ? this.state.grdData.map((item: any) => (
                                        {
                                            ...item,
                                            selected: item.Mnemonic === this.state.selectedStdChannel
                                        }

                                    ))
                                        : null
                                }
                                onRowClick={this.grdRowClick}

                            >
                                <Column
                                    headerClassName="text-center"
                                    className="maintainStdChannels"
                                    field="Mnemonic"
                                    title="Mnemonic"
                                />
                                <Column
                                    headerClassName="text-center"
                                    className="maintainStdChannels"
                                    field="ChannelName"
                                    title="Name"
                                />
                                <Column
                                    headerClassName="text-center"
                                    className="maintainStdChannels"
                                    field="DataType"
                                    title="Data Type"
                                />
                                <Column
                                    headerClassName="text-center"
                                    className="maintainStdChannels"
                                    field="LogName"
                                    title="Log Type"
                                />
                            </Grid>
                        </div>

                        <div className='col-xl-2 col-lg-2 col-md-2 col-sm-2'>
                            <span className="btn-group-vertical">
                                <Button style={{ width: '140px' }} className="mt-3 k-button k-primary mr-4" onClick={
                                    () => {
                                        let objMaintainStdChannel_ = new MaintainStdChannel()
                                        this.setState({ objMaintainStdChannel: objMaintainStdChannel_, showStdChannelDialog: true, EditMode: "A" });
                                    }
                                }>
                                    Add
                                </Button>
                                <Button style={{ width: '140px' }} className="mt-3 k-button k-primary mr-4" onClick={this.editStdChannels}>
                                    Edit
                                </Button>
                                <Button style={{ width: '140px' }} onClick={this.removeStdChannels} className="mt-3">
                                    Remove
                                </Button>

                                <Button style={{ width: '140px' }} onClick={this.mnemonicMapping} className="mt-3">
                                    Mnemonic Mapping
                                </Button>
                            </span>
                        </div>
                    </div>
                </div>


                {this.state.showStdChannelDialog && (

                    <Dialog title={"Standard Channel"}
                        width={"700px"}
                        height={"400px"}
                        onClose={(e: any) => {
                            this.setState({
                                showStdChannelDialog: false
                            })
                        }}
                    >
                        <div className="row">
                            <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">

                                <div className="row" >
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                        <div className="row">
                                            <Label className="mr-2 mt-3 float-left">Mnemonic</Label>
                                            <Input
                                                name="Mnemonic"
                                                value={this.state.objStdChannel.Mnemonic}
                                                disabled={this.state.EditMode == "E" ? true : false}
                                                onChange={(e) => this.handleChange(e, "Mnemonic")}
                                            />
                                        </div>

                                        <div className="row">
                                            <Label className="mr-2 mt-3 float-left">Name</Label>
                                            <Input
                                                name="ChannelName"
                                                value={this.state.objStdChannel.ChannelName}

                                                onChange={(e) => this.handleChange(e, "ChannelName")}
                                            />

                                        </div>

                                        <div className="row">
                                            <Label className="mr-2 mt-3 float-left">Data Type</Label>
                                            <DropDownList
                                                name="Data Type"
                                                label=''
                                                data={this.state.cboDataTypeList}
                                                textField="text"
                                                dataItemKey="id"
                                                value={this.state.selectedDataType}
                                                style={{ width: 200 }}
                                                onChange={(event) => {

                                                    this.handleChangeDropDown(event, "DataType");

                                                }}
                                            />
                                        </div>

                                        <div className="row">
                                            <Label className="mr-2 mt-3 float-left">Log Type</Label>
                                            <DropDownList
                                                name="Log Type"
                                                label=''
                                                data={this.state.cboLogTypeList}
                                                textField="text"
                                                dataItemKey="id"
                                                value={this.state.selectedLogType}
                                                style={{ width: 200 }}
                                                disabled={this.state.EditMode == "E" ? true : false}
                                                onChange={(event) => {

                                                    this.handleChangeDropDown(event, "LogType");

                                                }}
                                            />
                                        </div>

                                    </div>


                                </div>
                            </div>
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                                <span className="btn-group-vertical">

                                    <Button style={{ width: '130px' }} className="mt-3 k-button k-primary mr-4" onClick={this.OkClick}>
                                        Ok
                                    </Button>
                                    <Button style={{ width: '130px' }} className="mt-3 k-button k-primary mr-4" onClick={this.CancelClick}>
                                        Cancel
                                    </Button>
                                </span>

                            </div>
                        </div>

                    </Dialog>
                )}


                {this.state.showMnemonicMapping &&
                    <Dialog
                        title={"Mnemonic Mapping"}
                        width={"900px"}
                        height={"400px"}
                        onClose={(e: any) => {
                            this.setState({
                                showMnemonicMapping: false
                            })
                        }}
                    >
                        <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                <Label className="mr-2 mt-3 float-left">Log Type    </Label>
                                <DropDownList
                                    name="Data Type"
                                    label=''
                                    data={this.state.cboMMLogTypeList}
                                    textField="text"
                                    dataItemKey="id"
                                    value={this.state.selectedMMLogType}
                                    style={{ width: 400 }}
                                    onChange={(event) => {
                                        this.handleChangeDropDown(event, "MMLogType");

                                    }}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                <Label className="mr-2 mt-3 float-left">VuMax Channel</Label>
                                <DropDownList
                                    name="VuMax Channel"
                                    label=''
                                    data={this.state.cboMMVuMaxChannelList}
                                    textField="text"
                                    dataItemKey="id"
                                    value={this.state.selectedMMVuMaxChannel}
                                    style={{ width: 400 }}
                                    onChange={(event) => {
                                        this.handleChangeDropDown(event, "MMVuMaxChannel");

                                    }}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                <Checkbox
                                    className="mr-2"
                                    label={"Only show Standard channels"}
                                    value={this.state.ShowStandard}
                                    onChange={async (event) => {
                                        
                                        await this.setState({ ShowStandard: event.value })
                                        let cboData = new comboData();
                                        let cboMMVuMaxChannelList_ = [];
                                        let selectedMMVuMaxChannel_ = new comboData();
                                        await this.setState({cboMMVuMaxChannelList: []});

                                        for (let index = 0; index < this.state.objMMData.length; index++) {

                                            if (this.state.ShowStandard) {
                                                cboData = new comboData("[" + this.state.objMMData[index].MNEMONIC + "]  " + this.state.objMMData[index].CURVE_NAME, this.state.objMMData[index].MNEMONIC);
                                            } else {
                                                cboData = new comboData(this.state.objMMData[index].MNEMONIC, this.state.objMMData[index].MNEMONIC);
                                               
                                            }

                                            
                                            if (this.state.objMMData[index].MNEMONIC == this.state.selectedMMVuMaxChannel.id){      
                                                selectedMMVuMaxChannel_ = cboData;
                                            }

                                            cboMMVuMaxChannelList_.push(cboData);
                                        }
                                        await this.setState({cboMMVuMaxChannelList: cboMMVuMaxChannelList_, selectedMMVuMaxChannel: selectedMMVuMaxChannel_});
                                    }}
                                />

                            </div>
                        </div>

                        <div className="row">
                            <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">
                                <Grid
                                    style={{ height: "auto", minHeight: "150px" }}
                                    resizable={true}
                                    scrollable={"scrollable"}
                                    sortable={false}
                                    selectedField="selected"
                                    data={
                                        this.state.grdMMData != null ? this.state.grdMMData.map((item: any) => (

                                            {

                                                ...item,

                                                selected: item.SourceMnemonic === this.state.selectedSourceMnemonicId
                                            }

                                        ))
                                            : null
                                    }
                                    onRowClick={(e) => {
                                        this.setState({ selectedSourceMnemonicId: e.dataItem.Mapping_Id });
                                    }}

                                >
                                    {false && <Column
                                        headerClassName="text-center"
                                        className="maintainStdChannels"
                                        field="MnemonicId"
                                        title="MnemonicId"
                                    />}

                                    <Column
                                        headerClassName="text-center"
                                        className="maintainStdChannels"
                                        field="SourceMnemonic"
                                        title="SourceMnemonic"
                                    />
                                </Grid>
                            </div>

                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                                <span className="btn-group-vertical">
                                    <Button style={{ width: '140px' }} className="mt-3 k-button k-primary mr-4" onClick={this.addMapping} >
                                        Add Mapping
                                    </Button>

                                    <Button style={{ width: '140px' }} onClick={this.removeMapping} className="mt-3">
                                        Remove Mapping
                                    </Button>

                                    <Button style={{ width: '140px' }} onClick={this.closeMapping} className="mt-3">
                                        Close
                                    </Button>
                                </span>
                            </div>
                        </div>
                    </Dialog>

                }

                {this.state.showAddMnemonic &&
                    <Dialog
                        title={"Enter Data Mnemonic"}
                        width={"900px"}
                        height={"400px"}
                        onClose={(e: any) => {
                            this.setState({
                                showAddMnemonic: false
                            })
                        }}
                    >
                        <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                <Label className="mr-2 mt-3 float-left">Enter Data Mnemonic    </Label>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">
                                <Input
                                    style={{
                                        width: "100%",
                                    }}
                                    pattern={"[A-Za-z]+"}
                                    minLength={2}
                                    required={true}
                                    value={this.state.SourceMnemonic}
                                    onChange={(e) => this.setState({ SourceMnemonic: e.value })}
                                />
                            </div>
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                                <span className="btn-group-vertical">
                                    <Button style={{ width: '140px' }} className="mt-3 k-button k-primary mr-4" onClick={
                                        this.OkMappingClick
                                    }>
                                        Ok
                                    </Button>
                                    <Button style={{ width: '140px' }} className="mt-3 k-button k-primary mr-4" onClick={(e) => this.setState({ showAddMnemonic: false })}>
                                        Cancel
                                    </Button>

                                </span>
                            </div>
                        </div>
                    </Dialog>
                }
            </div>
        )
    }
}
