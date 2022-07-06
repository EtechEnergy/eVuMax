import { Button, Grid, GridToolbar, Input, Label, TabStrip, TabStripTab, GridColumn as Column, TabStripSelectEventArguments, Dialog } from '@progress/kendo-react-all';
import { Checkbox, TextArea } from '@progress/kendo-react-inputs';
import React, { Component } from 'react';
import BrokerRequest from '../../../../broker/BrokerRequest';
import { AlarmPanelProfile } from './AlarmPanelProfile'
import GlobalMod from '../../../../objects/global';
import BrokerParameter from '../../../../broker/BrokerParameter';
import axios from "axios";
import { Util } from '../../../../Models/eVuMax';
import * as utilFunc from './../../../../../src/utilFunctions/utilFunctions';
import { APContainer } from './APContainer';
import { Guid } from 'guid-typescript';
import { comboData } from '../../../../eVuMaxObjects/UIObjects/comboData';
import $ from "jquery";
import AlarmPanelDesigner from './AlarmPanelDesigner';
import { APChannel } from './APChannel';

interface IProps {
    ProfileID: string;
    PanelEditMode: string;
    saveProfile: any;
}

let _gMod = new GlobalMod();
export default class AlarmProfile extends Component<IProps> {
    state = {
        objPanel: new AlarmPanelProfile(),
        grdContainers: [],
        selectedTab: 0,
        selectedProfileID: this.props.ProfileID,
        ContainerName: "",
        IsActive: true,

        ContainerName1: "",
        IsActive1: true,

        //selectedItem: {}, //Nishant 02-06-2020
        ChannelsList: [] = [],
        isDisabledContainerName: false,
        isDisabledIsActive: true,
        showEditContainer: false,

        selectedConainerID: "",
        Mode: '',
        ModeChannel: '',
        containerLibrary: [] = [],
        showLoadLibraryDialog: false,
        strAlarmInfo: "",

        showAlarmPanelDesingerDialog: false,
        selectedChannel_ :  new APChannel(),

        selectedChannelIndex:-1
    }

    handleSelectTab = (e: TabStripSelectEventArguments) => {
        this.setState({ selectedTab: e.selected })

    }
    componentDidMount = () => {
        try {

            this.loadProfile();

        } catch (error) {

        }
    }
    SaveToLibrary = () => {


    }

    TestAlarm = () => { }

    handleChange = (event: any, field: string) => {
        try {
            const value = event.value;
            const name = field;
            let edited: any = utilFunc.CopyObject(this.state.objPanel);

            edited[field] = value;



            this.setState({
                objPanel: edited
            });


        } catch (error) {

        }
    }

    LoadFromLibrary = () => {
        try {

            let objBrokerRequest = new BrokerRequest();

            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "DataAlarmProfiles";
            objBrokerRequest.Function = "loadFromLibrary";


            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then(async (res) => {

                    Util.StatusSuccess("Data successfully retrived.");

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

                    
                    if (res.data.Response == null) {
                        return;
                    }
                    let containerList_ = utilFunc.CopyObject(Object.values(JSON.parse(res.data.Response)));
                    


                    // objPanel_.containers.forEach(element => {
                    //     element.channels = Object.values(element.channels)
                    // });

                    containerList_ = containerList_.map((item: any) => Object.assign({ selected_: false, inEdit: true }, item));

                    this.setState({
                        containerLibrary: containerList_, showLoadLibraryDialog: true

                    });



                })
                .catch((error) => {
                    Util.StatusError(error.message);
                    Util.StatusReady();

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
                });

        } catch (error) {

        }

    }

    loadProfile = () => {
        try {


            let objBrokerRequest = new BrokerRequest();


            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "DataAlarmProfiles";
            objBrokerRequest.Function = "editAlarmProfile";



            let objParameter = new BrokerParameter("ProfileID", this.state.selectedProfileID);
            objBrokerRequest.Parameters.push(objParameter);


            axios
                .get(_gMod._performTask, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then(async (res) => {
                    Util.StatusSuccess("Data successfully retrived.");

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


                    if (res.data.Response == null) {
                        return;
                    }
                    let objPanel_: AlarmPanelProfile = JSON.parse(res.data.Response);

                    objPanel_.containers = Object.values(objPanel_.containers);

                    objPanel_.containers.forEach(element => {
                        element.channels = Object.values(element.channels)
                    });
                    
                    this.setState({
                        objPanel: objPanel_, grdContainers: objPanel_.containers.map((item: any) => Object.assign({ selected: true, inEdit: true }, item)),
                        selectedTab: 0, showAlarmProfileDialog: true
                    });


                    // await this.setState({
                    //     selectedTab: 0,
                    //     showAlarmProfileDialog: true
                    // });



                })
                .catch((error) => {
                    Util.StatusError(error.message);
                    Util.StatusReady();

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
                });

        } catch (error) {

        }
    }

    AddContainer = async () => {
        try {
            this.setState({ showEditContainer: true, ContainerName1: "", IsActive1: true, Mode: 'A' });

        } catch (error) {

        }
    }



    EditContainer = () => {
        try {

            if (this.state.selectedConainerID != "") {
                this.setState({ showEditContainer: true, ContainerName1: this.state.ContainerName, IsActive1: this.state.IsActive, Mode: 'E' });
            } else {
                alert("Please select container from the list");
            }
            //this.setState({ isDisabledContainerName: false, isDisabledIsActive: false, showEditContainer: true, ContainerName1 :"", IsActive1 : true });

        } catch (error) {

        }
    }
    RemoveContainer = () => {
        try {
            if (this.state.selectedConainerID != "") {
                this.setState({ ContainerName: "", IsActive: true, Mode: 'R' });

                let containers = this.state.grdContainers;
                
                let index = containers.findIndex(item => item.ContainerID === this.state.selectedConainerID);
                containers.splice(index, 1);
                this.setState({ ContainerName: "", IsActive: true, grdContainers: containers, selectedConainerID: "" });

            } else {
                alert("Please select container you want to delete from the list !");
            }
        } catch (error) {

        }
    }

    grdRowClick = (e) => {
        try {
            
            let index = this.state.grdContainers.findIndex((item: any) => item["ContainerID"] === e.dataItem.ContainerID
            );
            if (index >= 0) {

                let channelList_ = [];

                e.dataItem.channels.forEach(element => {
                    channelList_.push({ ChannelName: element.ChannelName, Mnemonic : element.Mnemonic  });
                });

                this.setState({
                    selectedTab: 1, ChannelsList: channelList_, ContainerName: e.dataItem.ContainerName, IsActive: e.dataItem.IsActive,
                    selectedConainerID: e.dataItem.ContainerID
                });
                
            }
        } catch (error) {

        }
    }


    grdRowClickLibrary = (e) => {
        try {
            
            let index = this.state.containerLibrary.findIndex((item: any) => item["ContainerID"] === e.dataItem.ContainerID);

            
            let selectedItem: any = this.state.containerLibrary[index];


            let channelName = e.dataItem.ContainerName;


            try {

                let objBrokerRequest = new BrokerRequest();

                objBrokerRequest.Module = "DataService";
                objBrokerRequest.Broker = "DataAlarmProfiles";
                objBrokerRequest.Function = "lstContainersClick";

                let objParameter = new BrokerParameter("ChannelName", channelName);
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

                        Util.StatusSuccess("Data successfully retrived.");

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

                        

                        let strAlarmInfo_ = JSON.parse(res.data.Response);

                        this.setState({ strAlarmInfo: strAlarmInfo_ });
                        $("#txtAlarmInfo").empty();
                        $("#txtAlarmInfo").html(strAlarmInfo_);



                    })
                    .catch((error) => {
                        Util.StatusError(error.message);
                        Util.StatusReady();

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
                    });

            } catch (error) {

            }





        } catch (error) {

        }
    }


    selectionChange = (event) => {
        try {
            
            const checked = event.syntheticEvent.target.checked;

            const data = this.state.grdContainers.map((item: any) => {
                if (item["ContainerID"] === event.dataItem.ContainerID) {
                    item["selected"] = checked;
                }
                return item;
            });
            this.setState({ grdContainers: data });
            //wellList = data;
        } catch (error) {

        }
    }

    selectionChangeLibrary = (event) => {
        try {
            
            const checked = event.syntheticEvent.target.checked;

            const data = this.state.containerLibrary.map((item: any) => {
                if (item["ContainerID"] === event.dataItem.ContainerID) {
                    item["selected_"] = checked;
                }
                return item;
            });
            this.setState({ containerLibrary: data });

        } catch (error) {

        }
    }

    OkContainer = (e) => {
        try {
            let containers = this.state.grdContainers;
            if (this.state.Mode == "A") {
                let APContainer_: APContainer = new APContainer();
                let APContainer1 = utilFunc.CopyObject(APContainer_);

                APContainer1.selected = true;
                APContainer1.inEdit = true;


                APContainer1.ContainerID = Guid.create().toString();
                APContainer1.ContainerName = this.state.ContainerName1;
                APContainer1.IsActive = this.state.IsActive1;

                containers.push(JSON.parse(JSON.stringify(APContainer1)));

                this.setState({ grdContainers: containers, showEditContainer: false, ContainerName: this.state.ContainerName1, IsActive: this.state.IsActive });
            } else {
                

                if (this.state.selectedConainerID != "") {
                    containers.forEach(element => {
                        if (element.ContainerID == this.state.selectedConainerID) {
                            element.ContainerName = this.state.ContainerName1;
                            element.IsActive = this.state.IsActive1;
                        }
                    });
                    this.setState({ showEditContainer: false, ContainerName: this.state.ContainerName1, IsActive: this.state.IsActive1, grdContainers: containers });
                }

            }


        } catch (error) {

        }
    }

    CancelContainer = () => {
        try {
            this.setState({ showEditContainer: false });
        } catch (error) {

        }
    }

    Save = () => {
        try {
            //if (this.props.PanelEditMode=="A")

            let objBrokerRequest = new BrokerRequest();


            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "DataAlarmProfiles";
            objBrokerRequest.Function = "saveAlarmProfile";  //saveAlarmProfile //loadFromLibrary

            
            let objPanel_: any = utilFunc.CopyObject(this.state.objPanel);


            //objPanel_.containers = null;
            objPanel_.containers.forEach(element => {
                //element.channels = null;

                // element.__functionCache =null;
                // element.alarmContainerDates = null;
                // element.otherValues = null;
                // element.setAlarms = null;
                //element.channels = null;
                element.channels.forEach((channel_ : APChannel) => {
                    channel_.alarmContainerDates = null;
                    channel_.__functionCache=null;
                    channel_.history=null;

                });
                
            });

            objPanel_.containers = utilFunc.convertMapToDictionaryJSON(objPanel_.containers);
            objPanel_.setAlarms = utilFunc.convertMapToDictionaryJSON(objPanel_.setAlarms);
            
       


            let objParameter = new BrokerParameter("PanelEditMode", this.props.PanelEditMode);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("objPanel", JSON.stringify(objPanel_));
            objBrokerRequest.Parameters.push(objParameter);
            

            
            axios.post(_gMod._performTask, {
                paramRequest: JSON.stringify(objBrokerRequest),
            })
                // .get(_gMod._getData, {
                //     headers: {
                //         Accept: "application/json",
                //         "Content-Type": "application/json;charset=UTF-8",
                //     },
                //     params: { paramRequest: JSON.stringify(objBrokerRequest) },
                // })
                .then(async (res) => {
                    Util.StatusSuccess("Data successfully Saved.");
                    alert("success");
                    

                    // let warnings: string = res.data.Warnings;
                    // if (warnings.trim() != "") {
                    //     let warningList = [];
                    //     warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
                    //     this.setState({
                    //         warningMsg: warningList
                    //     });
                    // } else {
                    //     this.setState({
                    //         warningMsg: []
                    //     });
                    // }

                    this.props.saveProfile();

                })
                .catch((error) => {
                    alert(error.message);
                    Util.StatusError(error.message);
                    Util.StatusReady();

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
                });


        } catch (error) {
            alert(error);
        }

    }


    OkLoadLibrary = () => {
        try {
            let localContainers = utilFunc.CopyObject(this.state.grdContainers);
            this.state.containerLibrary.forEach((item: any) => {
                if (item.selected) {
                    localContainers.push(item);
                }

                this.setState({ showLoadLibraryDialog: false, grdContainers: localContainers });
            });

        } catch (error) {

        }
    }

    CancelLoadLibrary = () => {
        try {
            this.setState({ showLoadLibraryDialog: false });
        } catch (error) {

        }
    }

    AddChannel = () => {
        try {
            this.setState({ showAlarmPanelDesingerDialog: true, ModeChannel : "A", selectedChannelIndex : -1 })
        } catch (error) {

        }

    }

    
    EditChannel = () => {
        try {
            //alert("Edit click" + this.state.selectedChannel_.ChannelName);

            if (this.state.selectedChannel_.ChannelName==""  ){

                alert("Please select the channel from the list");
            }else{

                this.setState({ showAlarmPanelDesingerDialog: true, ModeChannel : "E"  });
            }

            
        } catch (error) {

        }

    }

    grid_headerSelectionChange = (event: any, field: string) => {

        
        const checked = event.syntheticEvent.target.checked;
        if (field == "grdContainers") {
            const data = this.state.grdContainers.map((item: any) => {
                item["selected"] = checked;
                return item;
            });
            this.setState({ grdContainers: data });
        }


        if (field == "containerLibrary") {
            const data = this.state.containerLibrary.map((item: any) => {
                item["selected_"] = checked;
                return item;
            });
            this.setState({ containerLibrary: data });
        }
    }


    onClosePanelDesigner = async (objChannel_ : APChannel, Mode_ : string) => {
        try {
            
            //alert("abc");
            this.setState({ showAlarmPanelDesingerDialog : false, selectedChannel_  :  objChannel_});


            //let grdContainers_ = this.state.grdContainers;
            
            let ContainerIndex = this.state.grdContainers.findIndex( (item : any) => item.ContainerID === this.state.selectedConainerID);
            

            let oldgrdContainers = this.state.grdContainers;

            // oldgrdContainers[ContainerIndex].channels.forEach( (element :any) => {
            //     
                
            //     if (element.Mnemonic ==objChannel_.Mnemonic){
            //         oldgrdContainers[ContainerIndex].channels= objChannel_;
            //     }
                
            // });

            if (Mode_=="A"){
                //oldgrdContainers[ContainerIndex].channels[oldgrdContainers[ContainerIndex].channels.length] = objChannel_;
                oldgrdContainers[ContainerIndex].channels.push(objChannel_);

            }else{
                oldgrdContainers[ContainerIndex].channels[this.state.selectedChannelIndex] = objChannel_;
            }

            
            
            

            // for (let index = 0; index < oldgrdContainers[ContainerIndex].channels.length; index++) {
            //     const channel_ = oldgrdContainers[ContainerIndex].channels[index];

            //     if (channel_.Mnemonic ==objChannel_.Mnemonic){
            //         oldgrdContainers[ContainerIndex].channels[index] = channel_;
            //     }
            // }


            let channelList_ = [];

            oldgrdContainers[ContainerIndex].channels.forEach(element => {
                channelList_.push({ ChannelName: element.ChannelName, Mnemonic : element.Mnemonic  });
            });

            // this.setState({
            //     selectedTab: 1, ChannelsList: channelList_, ContainerName: oldgrdContainers[ContainerIndex].ContainerName, IsActive: oldgrdContainers[ContainerIndex].IsActive,
            //     selectedConainerID: oldgrdContainers[ContainerIndex].ContainerID, grdContainers :  oldgrdContainers
            // });


            //alert(oldgrdContainers[ContainerIndex].ContainerName);
            
            await this.setState({ grdContainers: oldgrdContainers, ChannelsList: channelList_, ContainerName: oldgrdContainers[ContainerIndex].ContainerName });

        } catch (error) {
                alert(error);
        }
    }

    
    channelRowClick = async(e)=>{
        try {
            //this.state.grdContainers[1].channels
            
            let index = this.state.ChannelsList.findIndex((item: any) => item["Mnemonic"] === e.dataItem.Mnemonic
            );

            if (index >= 0) {
                let ContainerIndex = this.state.grdContainers.findIndex( (item : any) => item.ContainerID === this.state.selectedConainerID);
                

                this.state.grdContainers[ContainerIndex].channels.forEach(async channel => {
                    if (channel.Mnemonic == e.dataItem.Mnemonic){
                        
                       await    this.setState({ selectedChannel_: channel, selectedChannelIndex : index });
                    }
                    
                });
                
                //alert(this.state.selectedChannel_.ChannelName);
             
                
            }else{
                alert("Select channel from the list");
            }


        } catch (error) {
            
        }
       
    }


    RemoveChannel =()=>{
        try {
            let grdContainers_ = utilFunc.CopyObject(this.state.grdContainers);
            let ContainerIndex = this.state.grdContainers.findIndex(item => item.ContainerID === this.state.selectedConainerID);

            
            if (this.state.selectedChannelIndex >=0){
                 //grdContainers_[ContainerIndex].channels[this.state.selectedChannelIndex].splice(this.state.selectedChannelIndex-1,1);
                 grdContainers_[ContainerIndex].channels.splice( (this.state.selectedChannelIndex),1);
                
                 //alert("After remove ="+ grdContainers_[ContainerIndex].channels.length);
                this.setState({ grdContainers : grdContainers_, selectedChannelIndex : -1, ChannelsList : grdContainers_[ContainerIndex].channels });
            }
            


          


            
        } catch (error) {
           alert(error) ;
        }
    }
    render() {
        return (
            <div>
                <div className="form-group">
                    <div className='row'>
                        <div className="col-lg-10 col-xl-10 col-md-10 col-sm-10">
                            <h4 className='mt-1'>Profile</h4>
                            <br />

                            <div className="form-group">
                                <Label>
                                    Name
                                </Label>
                                <Input type='textbox' value={this.state.objPanel.panelName} onChange={(e) => this.handleChange(e, "panelName")}></Input>
                            </div>


                            <div className="form-group mt-1">
                                <Label>
                                    Notes
                                </Label>

                                <TextArea
                                    autoSize={true}
                                    style={{ width: "30%" }}
                                    rows={2}
                                    value={this.state.objPanel.Notes}
                                    onChange={(e) => this.handleChange(e, "Notes")}
                                />
                            </div>

                            <div className="form-group mt-1">
                                <Checkbox
                                    id="RunOnDownSampledData"
                                    value={this.state.objPanel.RunOnDownSampledData}
                                    label="Run Alarm on Down Sample Data"
                                    onChange={(e) => this.handleChange(e, "RunOnDownSampledData")}
                                >
                                </Checkbox>

                            </div>

                            <div className="mt-1">
                                <Label>Down sample Rate </Label>
                                <Input type="textbox" style={{ width: "100px" }} className='ml-3' onClick={(e) => { this.handleChange(e, "DownSampleRate") }} value={this.state.objPanel.TimeInterval}></Input>
                                <Label> Seconds </Label>
                            </div>

                        </div>

                        <div className="col-lg-2 col-xl-2 col-md-2 col-sm-2">
                            <div className="form-group">
                                <Button onClick={this.SaveToLibrary} className="mt-5" style={{ width: "150px" }}>Save to Library</Button>
                            </div>
                            <div className="form-group">
                                <Button onClick={this.LoadFromLibrary} className="mt-3" style={{ width: "150px" }}>Load From Library</Button>
                            </div>
                            <div className="form-group">
                                <Button onClick={this.TestAlarm} className="mt-3" style={{ width: "150px" }}>Test Alarm</Button>
                            </div>
                        </div>

                    </div>

                    <div className="row">
                        <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6">
                            <div>
                                <div className="row">
                                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">

                                        <Grid
                                            style={{ height: '55vh', width: '100%' }}
                                            data={this.state.grdContainers}
                                            editField="inEdit"
                                            selectedField="selected"
                                            onRowClick={this.grdRowClick}
                                            onSelectionChange={this.selectionChange}
                                            onHeaderSelectionChange={(e) => { this.grid_headerSelectionChange(e, "grdContainers") }} //Nishant 26-05-2020
                                        >
                                            <Column
                                                field="selected"
                                                width="65px"
                                                title=""
                                                resizable={true}
                                                minResizableWidth={65}
                                                headerClassName="text-center"
                                                className="text-center"
                                                editable={true}
                                                editor="boolean"
                                                headerSelectionValue={
                                                    this.state.grdContainers.findIndex(
                                                        (dataItem: any) => dataItem.selected === false
                                                    ) === -1
                                                }
                                            ></Column>

                                            <Column field="ContainerName" title="Container Name" resizable={true} minResizableWidth={50} headerClassName="text-center" editable={false}  ></Column>

                                        </Grid>



                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6">

                            <TabStrip selected={this.state.selectedTab} onSelect={this.handleSelectTab}  >

                                <TabStripTab title="Container">
                                    <div className="form-group">
                                        <Label>Container Name </Label>
                                        <Input type="textbox" value={this.state.ContainerName} disabled={true}
                                            onChange={(e) => { this.setState({ ContainerName: e.value }) }}></Input>
                                    </div>
                                    <div className="form-group">
                                        <Checkbox
                                            id="IsActive"
                                            className='mt-3'
                                            value={this.state.IsActive}
                                            label="Is Active"
                                            onChange={(e) => { this.setState({ IsActive: e.value }) }}
                                            disabled={true}
                                        >
                                        </Checkbox>
                                    </div>

                                    <div className="form-group mt-3">
                                        <Button onClick={this.AddContainer} style={{ width: "150px" }}>Add New Container</Button>
                                        <Button className='ml-3' onClick={this.EditContainer} style={{ width: "150px" }}>Edit Container</Button>
                                        <Button className='ml-3' onClick={this.RemoveContainer} style={{ width: "150px" }}>Remove Container</Button>
                                    </div>
                                </TabStripTab>


                                <TabStripTab title="Channels">
                                    <div className="row">
                                        <div className="col-lg-8 col-xl-8 col-md-8 col-sm-8">
                                            <Grid
                                                data={this.state.ChannelsList}
                                                onRowClick={this.channelRowClick}
                                            >
                                                <Column field="ChannelName" title="Channel Name" resizable={true} minResizableWidth={50} headerClassName="text-center" editable={false}  ></Column>
                                            </Grid>

                                        </div>

                                        <div className="col-lg-4 col-xl-4 col-md-4 col-sm-4">
                                            <div className='btn-group-vertical'>
                                                <Button style={{ width: "150px" }} onClick={this.AddChannel}>
                                                    Add Channel
                                                </Button>
                                                <Button className='mt-3' style={{ width: "150px" }}  onClick={this.EditChannel}>
                                                    Edit Channel
                                                </Button>
                                                <Button className='mt-3' style={{ width: "150px" }}  onClick={this.RemoveChannel}>
                                                    Remove Channel
                                                </Button>
                                            </div>

                                        </div>
                                    </div>



                                </TabStripTab>


                            </TabStrip>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6">

                        </div>
                        <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6">
                            <Button onClick={this.Save}>Save</Button>
                            <Button className='ml-4'>Cancel</Button>
                        </div>
                    </div>

                </div>
                {this.state.showEditContainer &&
                    <Dialog
                        title={"Edit Container"}
                        width={"700px"}
                        height={"400px"}
                        onClose={async (e: any) => {


                            this.setState({
                                showEditContainer: false
                            })
                        }}
                    >
                        <div className="form-group">
                            <Label>Container Name </Label>
                            <Input type="textbox" value={this.state.ContainerName1}
                                onChange={(e) => { this.setState({ ContainerName1: e.value }) }}></Input>
                        </div>
                        <div className="form-group">
                            <Checkbox
                                id="IsActive1"
                                className='mt-3'
                                value={this.state.IsActive1}
                                label="Is Active"
                                onChange={(e) => { this.setState({ IsActive1: e.value }) }}
                            >
                            </Checkbox>
                        </div>

                        <div className="form-group mt-3">
                            <Button onClick={this.OkContainer} style={{ width: "150px" }}>Ok</Button>
                            <Button className='ml-3' onClick={this.CancelContainer} style={{ width: "150px" }}>Cancel</Button>

                        </div>
                    </Dialog>}

                {this.state.showLoadLibraryDialog && <Dialog
                    title={"Load from Library"}
                    width={"1200px"}
                    height={"700px"}
                    onClose={async (e: any) => {


                        this.setState({
                            showLoadLibraryDialog: false
                        })
                    }}
                >
                    <div className="row">
                        <div className='col-lg-6 col-xl-6 col-md-6 col-sm-6'>

                            <Grid
                                style={{ height: '55vh', width: '100%' }}
                                data={this.state.containerLibrary}
                                editField="inEdit"
                                selectedField="selected_"
                                onRowClick={this.grdRowClickLibrary}
                                onSelectionChange={this.selectionChangeLibrary}
                                className="mt-3"
                                onHeaderSelectionChange={(e) => { this.grid_headerSelectionChange(e, "containerLibrary") }} //Nishant 26-05-2020
                            >
                                <Column
                                    field="selected_"
                                    width="65px"
                                    title=""
                                    resizable={true}
                                    minResizableWidth={65}
                                    headerClassName="text-center"
                                    className="text-center"
                                    //editable={true}
                                    editor="boolean"
                                // headerSelectionValue={

                                //     this.state.containerLibrary.findIndex(
                                //         (dataItem: any) => dataItem.selected_ === true
                                //     ) === -1
                                // }


                                ></Column>

                                {false && <Column field="ContainerID" title="Container ID" resizable={true} minResizableWidth={50} headerClassName="text-center" editable={false}  ></Column>}

                                <Column field="ContainerName" title="Container Name" resizable={true} minResizableWidth={50} headerClassName="text-center" editable={false}  ></Column>

                            </Grid>
                            <br />
                            <p>
                                <Button style={{ width: "150px" }} onClick={this.OkLoadLibrary}> Ok</Button>
                                <Button className='ml-3' style={{ width: "150px" }} onClick={this.CancelLoadLibrary}>Cancel</Button>
                            </p>
                        </div>

                        <div className='col-lg-6 col-xl-6 col-md-6 col-sm-6'>
                            <div className='mt-3'>
                                <div id="txtAlarmInfo"></div>
                            </div>


                        </div>
                    </div>

                </Dialog>}


                {this.state.showAlarmPanelDesingerDialog &&

                    <Dialog title={"Alarm Panel Designer"}
                        width={"90vw"}
                        height={"90vh"}
                        onClose={(e: any) => {
                            this.setState({
                                showAlarmPanelDesingerDialog: false
                            })
                        }}
                    >

                        <AlarmPanelDesigner onClosePanelDesigner={this.onClosePanelDesigner} objChannel = {this.state.selectedChannel_} ModeChannel = {this.state.ModeChannel}></AlarmPanelDesigner>

                    </Dialog>

                }


            </div>
        )
    }
}
