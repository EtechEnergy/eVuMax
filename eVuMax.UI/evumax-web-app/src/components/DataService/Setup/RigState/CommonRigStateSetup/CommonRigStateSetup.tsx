import axios from "axios";
import { ColorPicker, Grid, GridColumn, Input, Label, TabStrip, TabStripSelectEventArguments, TabStripTab } from '@progress/kendo-react-all'
import { Checkbox } from '@progress/kendo-react-inputs'
import React, { Component } from 'react'
import BrokerRequest from '../../../../../broker/BrokerRequest'
import "./CommonRigStateSetup.css"
import GlobalMod from "../../../../../objects/global";
import * as utilFunctions from "../../../../../utilFunctions/utilFunctions";
import BrokerParameter from "../../../../../broker/BrokerParameter";
import NotifyMe from 'react-notification-timeline';

let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();

export default class CommonRigStateSetup extends Component {
    state = {
        selectedTab: 0,
        grdRigState: [] as any,
        objRigStateSetup: {} as any,
        warningMsg: [],
    }
    AxiosSource = axios.CancelToken.source();

    handleSelectTab = (e: TabStripSelectEventArguments) => {
        this.setState({ selectedTab: e.selected })

    }



    handleChange = (objItem: any, fieldName: string) => {

       
        let edited: any = this.state.objRigStateSetup;

        edited[fieldName] = objItem.value;

        this.setState({
            objRigStateSetup: edited
        });

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

    componentDidMount = () => {

        this.LoadSetting();
    }
    setdata = async (objData: any) => {
        try {

            this.setState({
                objRigStateSetup: objData
            });
            //Workaroud for Unknown Color
            // if(this.state.objRigStateSetup.UnknownColor.includes("#") == false ){
            //     this.state.objRigStateSetup.UnknownColor = null;
            // }


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






        } catch (error) {

        }
    }

    Save = () => {
        try {

            console.log("Save", this.state.grdRigState);


            //Convert RGB Color to Hexa for each RigState Color


            //rigStates:0:
            //Color: -16711936
            //Name: "Rotary Drill"
            //Number: 0
            // debugger;
            // let reactColor = utilFunctions.intToColor(-16711936);
            // let Hexa = utilFunctions.rgb2hex(reactColor);
            // let HEXtoVB = this.HEXToVBColor(Hexa);
            // let VBToHexa = this.VBColorToHEX(-16711936);
            // let hexatoVB1 = this.HEXToVBColor(VBToHexa);

            debugger;
            let localRigStateList: any = utilFunctions.CopyObject(this.state.grdRigState);

            for (let index = 0; index < localRigStateList.length; index++) {
                let objItem: any = localRigStateList[index];
                objItem.Color = utilFunctions.rgb2hex(objItem.Color);
            }


            localRigStateList = utilFunctions.convertMapToDictionaryJSON(localRigStateList, "Number");
            let localObjRigStateSetup =utilFunctions.CopyObject(this.state.objRigStateSetup);
            localObjRigStateSetup.UnknownColor = 0; // utilFunctions.rgb2hex(localObjRigStateSetup.UnknownColor);
            //

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "CommonRigStateSetup";
            objBrokerRequest.Function = "saveCommonRigStateSetup";

            let objParameter: BrokerParameter = new BrokerParameter("UserID", _gMod._userId);
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

    LoadSetting = () => {
        try {
            debugger
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "CommonRigStateSetup";
            objBrokerRequest.Function = "loadCommonRigStateSetup";

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
                    debugger;
                    console.log(objData);
                    if (res.data.RequestSuccessfull) {
                        if (objData != undefined || objData != "") {

                            if(objData.UnknownColor== -256){
                                objData.UnknownColor="#00000";
                            }else{
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
                <div className="row" style={{ justifyContent: "flex-end" }}>
                    <div className="" >
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
                          // onClick={this.Cancel}
                          className="btn-custom btn-custom-primary ml-1"
                      >
                          {/* <FontAwesomeIcon icon={faTimes} className="mr-2" /> */}
                          Cancel
                      </button>
                  </span>
                  
             
           
                  
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
                                             onChange={(e: any) => { this.handleChange(e,"UnknownColor") }}
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
                                            --
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

                    </TabStrip>

                </div>
            </>)
    }
}
