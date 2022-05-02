import { Button, Dialog, DropDownList, Grid, GridColumn, GridSelectionChangeEvent, Label } from '@progress/kendo-react-all';
import { Input } from '@progress/kendo-react-inputs'
import React, { Component } from 'react'
import BrokerParameter from '../../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../../broker/BrokerRequest';
import { comboData } from '../../../../../eVuMaxObjects/UIObjects/comboData';
import * as utilFunc from '../../../../../utilFunctions/utilFunctions';
import GlobalMod from '../../../../../objects/global';
import axios from "axios";
import { type } from 'os';
import { Util } from '../../../../../Models/eVuMax';
import { QCRule } from '../../../../../eVuMaxObjects/dataObjects/dataObjects';

interface IProps {
    parent: any,
    objQCRule: QCRule,
    EditMode: string
}

let _gMod = new GlobalMod();

export default class QCRuleDialog extends Component<IProps> {

    state = {
        objQCRule: this.props.objQCRule,

        cboRuleTypeList: [] as any,
        selectedRuleType: new comboData(),
        showChannelDialog: false,

        cboSTDChannelList: [] as any,
        selectedChannel: new comboData(),
        selectedChannelFromList: "",
        //grdChannels: this.props.objQCRule.Channels
        grdChannels: [],

    }

    componentDidMount = () => {
        try {
            this.loadRuleType_STDChannel_List();
        } catch (error) {

        }

    }


    loadRuleType_STDChannel_List() {

        let objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "DataService";
        objBrokerRequest.Broker = "SetupQCRules";
        objBrokerRequest.Function = "getRuleType_STDChannelList";

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




                let objRuleTypeList: any = Object.values(objData)[0];
                let objSTDChannelList: any = Object.values(objData)[1];

                let cboRuleTypeList_: comboData[] = [];
                let cboSTDChannelList_: comboData[] = [];

                for (let index = 0; index < objSTDChannelList.length; index++) {
                    let objCombo = new comboData(objSTDChannelList[index].CURVE_NAME, objSTDChannelList[index].MNEMONIC);
                    cboSTDChannelList_.push(objCombo);
                }

                cboRuleTypeList_.push(new comboData(objRuleTypeList[0].RuleType, "0"));
                cboRuleTypeList_.push(new comboData(objRuleTypeList[1].RuleType, "1"));


                this.setState({
                    cboRuleTypeList: cboRuleTypeList_,
                    selectedRuleType: this.state.objQCRule.RuleType,
                    cboSTDChannelList: cboSTDChannelList_,
                });



                debugger;
                if (this.props.EditMode == "E") {
                    let curvName: string = ""
                    let channelList_ = [];
                    for (let index = 0; index < this.state.objQCRule.Channels.length; index++) {
                        

                        for (let index1 = 0; index1 < objSTDChannelList.length; index1++) {
                            if (objSTDChannelList[index1].MNEMONIC == this.state.objQCRule.Channels[index]) {
                                curvName = objSTDChannelList[index1].CURVE_NAME;
                                break;
                            }
                        }
                        channelList_.push({ "Channel": curvName, id: this.state.objQCRule.Channels[index] })
                    }


                    if (this.state.objQCRule.RuleType == 0) {
                        await this.setState({ grdChannels: channelList_ });
                        await this.setState({ selectedRuleType: new comboData(objRuleTypeList[0].RuleType, "0") });
                        
                    }
                    if (this.state.objQCRule.RuleType == 1) {
                        await this.setState({ grdChannels: channelList_ });
                        await this.setState({ selectedRuleType: new comboData(objRuleTypeList[1].RuleType, "1") });
                        
                    }
                }

                

                

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

    OkClick = async () => {
        try {
            //Validation
            debugger;
            if (this.state.objQCRule.RuleName == "") {
                alert("Please enter Rule Name");
                return;
            }

            if (this.state.selectedRuleType.id == "") {
                alert("Please select Rule Type");
                return;
            }


            if (this.state.cboSTDChannelList.length == 0) {
                alert("Please select Channels");
                return;
            }

            let objRule_ = new QCRule();
            objRule_.RuleID = this.state.objQCRule.RuleID;
            objRule_.RuleName = this.state.objQCRule.RuleName;
            objRule_.RuleType = eval(this.state.selectedRuleType.id);


            objRule_.TolerancePercentage = this.state.objQCRule.TolerancePercentage;
            objRule_.MinValue = this.state.objQCRule.MinValue;
            objRule_.MaxValue = this.state.objQCRule.MaxValue;
            objRule_.Channels = this.state.grdChannels;

            await this.setState({ objQCRule: objRule_ });
            this.saveQCRule();
          
        } catch (error) {

        }
    }

    extractValue = (arr, prop) => {

        // extract value from property
        let extractedValue = arr.map(item => item[prop]);

        return extractedValue;

    }

    saveQCRule = () => {
        try {


            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "SetupQCRules";
            objBrokerRequest.Function = "saveQCRule";
            debugger;

            let arrChannels = this.extractValue(this.state.grdChannels, 'id');
            this.state.objQCRule.Channels = utilFunc.convertMapToDictionaryJSON(arrChannels);


            let paramuserid: BrokerParameter = new BrokerParameter(
                "UserId",
                _gMod._userId
            );
            objBrokerRequest.Parameters.push(paramuserid);


            let paramobjRule: BrokerParameter = new BrokerParameter(
                "objRule",
                JSON.stringify(this.state.objQCRule)
            );
            objBrokerRequest.Parameters.push(paramobjRule);

            let paramEditMode: BrokerParameter = new BrokerParameter(
                "EditMode",
                this.props.EditMode
            );

            objBrokerRequest.Parameters.push(paramEditMode);

          

            // axios.post(_gMod._performTask, {
            //     paramRequest: JSON.stringify(objBrokerRequest),
            // })
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
                    

                    this.props.parent.okQCRuleDialog(this.state.objQCRule);




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

    CancelClick = () => {
        try {
            this.props.parent.closeQCRuleDialog();
        } catch (error) {

        }
    }

    OkChannelClick = () => {
        try {

            if (this.state.selectedChannel.id == "") {
                alert("Please select Channel from the List");
                return;
            }
            this.setState({
                showChannelDialog: false,
            });


            let objChannel = this.state.cboSTDChannelList.find(o => o.id === this.state.selectedChannel.id);


            //check already exist
            if (this.state.grdChannels.filter(item => item.id == this.state.selectedChannel.id).length == 0) {
                let channelList = this.state.grdChannels;
                channelList.push({ "Channel": objChannel.text, id: objChannel.id });
                this.setState({ grdChannels: channelList });
            }

        } catch (error) {

        }
    }

    CancelChannelClick = () => {
        try {
            this.setState({
                showChannelDialog: false,
            });
        } catch (error) {

        }
    }

    AddChannelClick = () => {
        try {
            this.setState({ showChannelDialog: true });

        } catch (error) {

        }
    }

    RemoveChannelClick = () => {
        try {

            if (this.state.selectedChannelFromList == "") {
                alert("Please select Channel from the List");
                return;
            }

            //let objChannel =   this.state.grdChannels.find(o => o.Channel === this.state.selectedChannelFromList);

            let channelList = this.state.grdChannels;

            channelList = channelList.filter((item) => item.Channel !== this.state.selectedChannelFromList);

            this.setState({ grdChannels: channelList });
        } catch (error) {

        }
    }
    handleChange = (e: any, field: string) => {
        try {
            const value = e.value;
            const name = field;

            let edited: any = utilFunc.CopyObject(this.state.objQCRule);
            edited[field] = value;
            this.setState({
                objQCRule: edited
            });

        } catch (error) {

        }
    }

    handleChangeDropDown = (event: any, field?: string) => {
        try {

            if (field == "RuleType") {

                this.setState({
                    selectedRuleType: event.value
                });
            }
            if (field == "Channel") {

                this.setState({
                    selectedChannel: event.value
                });
            }
        } catch (error) {

        }
    }


    grdRowClick = (event: GridSelectionChangeEvent) => {
        try {


            this.setState({
                selectedChannelFromList: event.dataItem.Channel,
            });

        } catch (error) {

        }
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">

                        <div className="row">
                            <Label className="mr-2 mt-3 float-left">Rule Name</Label>
                            <Input
                                name="RuleName"
                                //label="Rule Name"
                                value={this.state.objQCRule.RuleName}
                                onChange={(e) => this.handleChange(e, "RuleName")}
                            />
                        </div>


                        <div className="row">
                            <Label className="float-left">Rule Type</Label>
                            <DropDownList
                                name="RuleType"
                                label=''
                                data={this.state.cboRuleTypeList}
                                textField="text"
                                dataItemKey="id"
                                value={this.state.selectedRuleType}
                                style={{ width: 200 }}
                                onChange={(event) => {

                                    this.handleChangeDropDown(event, "RuleType");

                                }}
                            />
                        </div>

                        {this.state.selectedRuleType.id == "0"
                            &&
                            <div className="row">
                                <Label className="mr-2 mt-3 float-left">Tolerance %</Label>
                                <Input
                                    name="TolerancePercentage"
                                    //label="Tolerance %"
                                    value={this.state.objQCRule.TolerancePercentage}
                                    onChange={(e) => this.handleChange(e, "TolerancePercentage")}
                                />
                            </div>
                        }

                        {this.state.selectedRuleType.id == "1" &&
                            <div>
                                <div className="row">
                                    <Label className="mr-2 mt-3 float-left">Min Value</Label>
                                    <Input
                                        name="MinValue"
                                        //label="Min Value"
                                        value={this.state.objQCRule.MinValue}
                                        onChange={(e) => this.handleChange(e, "MinValue")}
                                    />
                                </div>

                                <div className="row">
                                    <Label className="mr-2 mt-3 float-left">Max Value</Label>
                                    <Input
                                        name="MaxValue"
                                        //label="Max Value"
                                        value={this.state.objQCRule.MaxValue}
                                        onChange={(e) => this.handleChange(e, "MaxValue")}
                                    />
                                </div>
                            </div>
                        }

                    </div>


                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                        <span className="btn-group-vertical">
                            <Button style={{ width: '90px' }} className="mt-3 k-button k-primary mr-4" onClick={
                                this.OkClick
                            }>
                                Ok
                            </Button>
                            <Button style={{ width: '90px' }} className="mt-3 k-button k-primary mr-4" onClick={this.CancelClick}>
                                Cancel
                            </Button>

                        </span>
                    </div>

                </div>

                <div className="row">
                    <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">

                        {/* <h6>Channel List</h6> */}
                        <Grid style={{ height: "400px" }}
                            selectedField="selected"
                            //data={this.state.grdChannels}
                            data={
                                this.state.grdChannels != null ? this.state.grdChannels.map((item: any) => ({
                                    ...item,
                                    selected: item.Channel === this.state.selectedChannelFromList,
                                }))
                                    : null
                            }



                            onRowClick={this.grdRowClick}
                        >
                            <GridColumn field="Channel" title='Channel List' />
                        </Grid>
                    </div>

                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                        <span className="btn-group-vertical">
                            <Button style={{ width: '130px' }} className="mt-3 k-button k-primary mr-4" onClick={
                                this.AddChannelClick
                            }>
                                Add Channel
                            </Button>
                            <Button style={{ width: '130px' }} className="mt-3 k-button k-primary mr-4" onClick={this.RemoveChannelClick}>
                                Remove Channel
                            </Button>

                        </span>

                    </div>
                </div>



                {this.state.showChannelDialog && (
                    //style={{ height: '100%', width: '500px', top: 0, left: 0 }}
                    <Dialog title={"Select Channel"}
                        width={"700px"}
                        height={"400px"}
                        onClose={(e: any) => {
                            this.setState({
                                showChannelDialog: false
                            })
                        }}
                    >
                        <div className="row mt-3" >
                            <div className="col-9">

                                <Label className="mr-2 mt-3 float-left">Select Channel</Label>

                                <DropDownList
                                    name="Channel"
                                    label=''
                                    data={this.state.cboSTDChannelList}
                                    textField="text"
                                    dataItemKey="id"
                                    value={this.state.selectedChannel}
                                    style={{ width: 200 }}
                                    onChange={(event) => {

                                        this.handleChangeDropDown(event, "Channel");

                                    }}
                                />


                            </div>

                            <div className="col-3">

                                <span className="btn-group-vertical">
                                    <Button style={{ width: '90px' }} className="mt-3 k-button k-primary mr-4" onClick={
                                        this.OkChannelClick
                                    }>
                                        Ok
                                    </Button>
                                    <Button style={{ width: '90px' }} className="mt-3 k-button k-primary mr-4" onClick={this.CancelChannelClick}>
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
