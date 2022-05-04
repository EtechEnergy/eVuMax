import React, { Component } from 'react'
import { Button, Dialog, DropDownList, Grid, GridColumn as Column, GridSelectionChangeEvent, Label } from '@progress/kendo-react-all';
import { Input } from '@progress/kendo-react-inputs'
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
        objStdChannel: new MaintainStdChannel,
        selectedStdChannel: "",
        showStdChannelDialog: false,
        EditMode: "A",
        cboDataTypeList: [] as any,
        selectedDataType: new comboData("Double", "Double"),
        cboLogTypeList: [] as any,
        selectedLogType: new comboData("Time Log", "1"),
        
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

            this.setState({ cboDataTypeList: dataTypeList, cboLogTypeList: logTypeList })


        } catch (error) {

        }
    }

    loadData = () => {
        try {

            debugger;
            Util.StatusInfo("Getting data from server   ");


            this.objLogger.SendLog("load Maint Std Channels");
            debugger;

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

                    debugger;
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
            debugger;
            let objStdChannel_: MaintainStdChannel;
            for (let index = 0; index < this.state.grdData.length; index++) {
              if (this.state.grdData[index].Mnemonic == this.state.selectedStdChannel) {
                objStdChannel_ = this.state.grdData[index];
                break;
              }
            }
            await this.setState({ objStdChannel: objStdChannel_, showStdChannelDialog   : true,  EditMode: "E" });
      

        } catch (error) {

        }
    }

    removeStdChannels = () => {
        try {

            // if (this.state.selectedStdChannel == "") {
            //     alert("Please select Channel from the List");
            //     return;
            // }
           
            // let channelList = this.state.grdData;

            // channelList = channelList.filter((item) => item.Mnemonic !== this.state.selectedStdChannel);

            // this.setState({ grdData : channelList });




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
                      debugger;
        
        
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


        } catch (error) {

        }
    }


    grdRowClick = async (event: GridSelectionChangeEvent) => {
        try {
            debugger;
            await this.setState({ selectedStdChannel: event.dataItem.Mnemonic, selectedLogType : new comboData(event.dataItem.LogName, event.dataItem.LogType) })
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
        } catch (error) {

        }
    }

    OkClick = async () => {
        try {

            debugger;
            let objStdChannel_ = new MaintainStdChannel();
            objStdChannel_.Mnemonic = this.state.objStdChannel.Mnemonic;
            objStdChannel_.ChannelName = this.state.objStdChannel.ChannelName;
            objStdChannel_.LogType = eval(this.state.selectedLogType.id);
            objStdChannel_.DataType = this.state.selectedDataType.text;

            await this.setState({objStdChannel : objStdChannel_, showStdChannelDialog: false});
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

    saveChannel =() =>{
        try {

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupMaintainStdChannels";
            objBrokerRequest.Function = "saveStdChannel";
            debugger;

        //    let arrChannels = this.extractValue(this.state.grdChannels, 'id');
          //  this.state.objQCRule.Channels = utilFunc.convertMapToDictionaryJSON(arrChannels);


            let paramuserid: BrokerParameter = new BrokerParameter(
                "UserId",
                _gMod._userId
            );
            objBrokerRequest.Parameters.push(paramuserid);


            let paramobjStdChannel : BrokerParameter = new BrokerParameter(
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

                    debugger;
                    //let objData = JSON.parse(res.data);
                    //let objData :any="";
                    //alert("Pending");

                    debugger;
                    Util.StatusSuccess("Data successfully retrived  ");

                    
                    //reload all the connections
                    
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

    render() {
        return (
            <div>
                <div>
                    <div>Maintain Standard Channels</div>

                    <div className="row">
                        <div className=' col-xl-10 col-lg-10 col-md-10 col-sm-10'>
                            {/* MNEMONIC,CURVE_NAME,DATA_TYPE,LOG_TYPE,CURVE_ID */}


                            <Grid

                                style={{ height: "auto", minHeight: "150px" }}
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

                                {/* <Column
                                headerClassName="text-center"
                                className="maintainStdChannels"
                                field="LOG_TYPE"
                                title="Log Type"
                            /> */}


                                <Column
                                    headerClassName="text-center"
                                    className="maintainStdChannels"
                                    field="LogName"
                                    title="Log Type"
                                />




                                {/* <Column
                                headerClassName="text-center"
                                className="maintainStdChannels"
                                field="CURVE_ID"
                                title="CURVE_ID"
                            /> */}
                            </Grid>


                        </div>

                        <div className='col-xl-2 col-lg-2 col-md-2 col-sm-2'>
                            <span className="btn-group-vertical">
                                <Button style={{ width: '140px' }} className="mt-3 k-button k-primary mr-4" onClick={
                                    () => {
                                        debugger;
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
                                                disabled = {this.state.EditMode=="E" ? true : false}
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
                                                disabled = {this.state.EditMode=="E" ? true : false}
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
            </div>

        )
    }
}
