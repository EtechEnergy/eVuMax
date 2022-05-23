import { Button, Dialog, Grid, GridColumn as Column, Input, Label, } from '@progress/kendo-react-all';
import React, { Component } from 'react';
import BrokerParameter from '../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../broker/BrokerRequest';
import { Util } from '../../../../Models/eVuMax';
import GlobalMod from '../../../../objects/global';
import axios from "axios";
import moment from 'moment';
import { CurveLibraryItem } from '../../../../eVuMaxObjects/dataObjects/DataObjects/CurveLibraryItem';
import { ClientLogger } from '../../../ClientLogger/ClientLogger';
import { confirmAlert } from 'react-confirm-alert';


let _gMod = new GlobalMod();

export default class ChannelLibrary extends Component {
    objLogger: ClientLogger = new ClientLogger("ChannelLibrary", _gMod._userId);

    state = {
        grdData: [] as any,
        openDialog: false,
        objCurveLibraryItem: new CurveLibraryItem(),
        EditMode: "",
    }

    componentDidMount = () => {
        try {
            //alert("aaaa");
            
            this.loadData();
        } catch (error) {

        }
    }

    loadData = () => {
        try {
            Util.StatusInfo("Getting data from server   ");
            this.objLogger.SendLog("load Donwload Audit Info");
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupChannelLibrary";
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
                .then(async (res) => {
                    Util.StatusSuccess("Data successfully retrived  ");
                    this.objLogger.SendLog("load Download Audit Info Data Received...");


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


                    let grdData_ = Object.values(objData);
                    // grdData_.forEach((element: any) => {
                    //   element.CHANGE_DATE = moment(new Date(element.CHANGE_DATE)).format("YYYY-MM-DD hh:mm:ss a")
                    // });

                    await this.setState({
                        grdData: grdData_,
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





    okClick = () => {
        try {
         
            
            //save
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupChannelLibrary";
            objBrokerRequest.Function = "saveChannel";

            let paramuserid: BrokerParameter = new BrokerParameter(
                "UserId",
                _gMod._userId
            );
            objBrokerRequest.Parameters.push(paramuserid);


            let paramobjRule: BrokerParameter = new BrokerParameter(
                "objCurveLibraryItem",
                JSON.stringify(this.state.objCurveLibraryItem)
            );
            objBrokerRequest.Parameters.push(paramobjRule);


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


            this.setState({ openDialog: false });
        } catch (error) {

        }
    }

    cancelClick = () => {
        try {

            this.setState({ openDialog: false });
        } catch (error) {

        }
    }

    handleChange = (objItem: any, fieldName: string) => {
        
        this.setState({
            [fieldName]: objItem.value
        });

        let edited: any = this.state.objCurveLibraryItem;
        edited[fieldName] = objItem.value;
        this.setState({
            objCurveLibraryItem: edited
        });

    }

    rowClick =async (event: any)=>{
        try {
            
            
            let objCurveLibraryItem_ = new CurveLibraryItem();
            objCurveLibraryItem_.Mnemonic = event.dataItem.MNEMONIC;
            objCurveLibraryItem_.Description = event.dataItem.DESCRIPTION;
            objCurveLibraryItem_.Unit = event.dataItem.UNIT;
            objCurveLibraryItem_.Expression = event.dataItem.EXPRESSION;
            
            await this.setState({objCurveLibraryItem : objCurveLibraryItem_});
            
        } catch (error) {
            
        }
    }

    
    removeClick = () => {

        if (this.state.objCurveLibraryItem.Mnemonic==""){
            alert("Please select row to remove ?");
            return;
        }


        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        let objBrokerRequest = new BrokerRequest();
                        objBrokerRequest.Module = "DataService";
                        objBrokerRequest.Broker = "SetupChannelLibrary";
                        objBrokerRequest.Function = "removeChannel";
            
                        let paramuserid: BrokerParameter = new BrokerParameter(
                            "UserId",
                            _gMod._userId
                        );
                        objBrokerRequest.Parameters.push(paramuserid);
            
            
                        let paramMnemonic: BrokerParameter = new BrokerParameter(
                            "Mnemonic",
                            this.state.objCurveLibraryItem.Mnemonic
                        );
                        objBrokerRequest.Parameters.push(paramMnemonic);
            
                        axios.get(_gMod._performTask, {
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json;charset=UTF-8",
                            },
                            params: { paramRequest: JSON.stringify(objBrokerRequest) },
            
                        })
                            .then((res) => {
            
                                Util.StatusSuccess("Data saved successfully");
                                this.setState({objCurveLibraryItem : new CurveLibraryItem()})
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
            
            
                        this.setState({ openDialog: false });
                      
                    }

                },
                {
                    label: 'No',
                    onClick: () => null
                }
            ]
        });
    }

    render() {
        return (
            <div>
                <p>

                    <Button style={{ width: '110px' }} className="mt-3 k-button k-primary mr-4" onClick={(e) => this.setState({ objCurveLibraryItem: new CurveLibraryItem(), openDialog: true, EditMode: "A" })}>
                        Add
                    </Button>
                    <Button style={{ width: '110px' }} onClick={(e) => 
                        
                        {
                      
                        if (this.state.objCurveLibraryItem.Mnemonic==""){
                            alert("Please select row from grid");
                            return;
                        }else{
                            this.setState({ openDialog: true, EditMode: "E" });
                        }
                        
                        }
                        
                        } className="mt-3 mr-4">
                        Edit
                    </Button>
                    <Button style={{ width: '110px' }} onClick={this.removeClick} className="mt-3 mr-4">
                    
                        Remove
                    </Button>
                </p>
                <p>
                    <Grid
                        data={this.state.grdData}
                        onRowClick = {this.rowClick}
                    >
                        <Column
                            headerClassName="text-center"
                            className="channelLib"
                            field="MNEMONIC"
                            title="Mnemonic"
                        />

                        <Column
                            headerClassName="text-center"
                            className="channelLib"
                            field="DESCRIPTION"
                            title="Description"
                        />
                    </Grid>
                </p>
                {this.state.openDialog &&

                    < Dialog
                        title={"Channel Properties"}
                        width={"700px"}
                        height={"400px"}
                        onClose={(e: any) => {
                            this.setState({
                                openDialog: false
                            })
                        }}
                    >
                        <div className="form-group row">

                            <div className="grp grp-form">

                                <table>
                                    <tr>
                                        <td>
                                            <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Mnemonic    </Label>
                                        </td>
                                        <td>
                                            <Input type='text' value={this.state.objCurveLibraryItem.Mnemonic} disabled ={this.state.EditMode=="E" ? true : false }
                                                 onChange={(event) => this.handleChange(event, "Mnemonic")}
                                            >
                                            </Input>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Description </Label>
                                        </td>
                                        <td>
                                            <Input type='text' value={this.state.objCurveLibraryItem.Description}
                                                onChange={(event) => this.handleChange(event, "Description")}
                                            >
                                            </Input>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Unit        </Label>
                                        </td>
                                        <td>
                                            <Input type='text' value={this.state.objCurveLibraryItem.Unit}
                                                onChange={(event) => this.handleChange(event, "Unit")}
                                            >
                                            </Input>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Expression  </Label>
                                        </td>
                                        <td>
                                            <Input type='text' value={this.state.objCurveLibraryItem.Expression}
                                                onChange={(event) => this.handleChange(event, "Expression")}
                                            >
                                            </Input>
                                        </td>
                                    </tr>

                                </table>
                            </div>

                        </div>


                        <p>
                            <Button style={{ width: '110px' }} className="mt-3 k-button k-primary mr-4" onClick={this.okClick}>
                                Ok
                            </Button>
                            <Button style={{ width: '110px' }} onClick={this.cancelClick} className="mt-3 mr-4">
                                Cancel
                            </Button>

                        </p>
                    </Dialog>
                }
            </div>
        )
    }
}
