import axios from "axios";
import { Grid, GridColumn, Input, Label, Splitter, SplitterOnChangeEvent, TabStrip, TabStripSelectEventArguments, TabStripTab } from '@progress/kendo-react-all'
import React, { Component } from 'react'
import ActiveWellSelector from '../../../wellSelector/ActiveWellSelector';
import NotifyMe from 'react-notification-timeline';
import * as utilFunctions from "../../../../utilFunctions/utilFunctions";
import BrokerRequest from '../../../../broker/BrokerRequest';
import BrokerParameter from '../../../../broker/BrokerParameter';
import GlobalMod from '../../../../objects/global';
import { Checkbox, ColorPicker } from "@progress/kendo-react-inputs";

let _gMod = new GlobalMod();
export default class RigStateSetup extends Component {
    state = {
        WellID: "",
        WellName: "",
        panes: [{ size: "55%", collapsible: false }, {}],
        warningMsg: [],

        selectedTab: 0,
        grdRigState: [] as any,
        objRigStateSetup: {} as any,
    }


    handleSelectTab = (e: TabStripSelectEventArguments) => {
        this.setState({ selectedTab: e.selected })
    }
    
    

    handleChange = (objItem: any, fieldName: string) => {
        let edited: any = this.state.objRigStateSetup;

        edited[fieldName] = objItem.value;

        this.setState({
            objRigStateSetup: edited
        });
    }
    onPanelChange = (event: SplitterOnChangeEvent) => {

        this.setState({
            panes: event.newState,
            warningMsg: []
        });
    };


    getSelectedWells = async (paramWellIDs: string) => {
        try {

            if (paramWellIDs.length > 0) {
                let WellName = paramWellIDs[0].split("~")[1];
                let WellID = paramWellIDs[0].split("~")[0];

                await this.setState({
                    WellName: WellName,
                    WellID: WellID
                }
                )

                //    this.loadData();

            } else {
                alert("Please select the well from the list");
            }

        } catch (error) {

        }
    }


    Save = () => {
        try {
            
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



            //this.AxiosSource = axios.CancelToken.source();

            axios
                .get(_gMod._performTask, {
              //      cancelToken: this.AxiosSource.token,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then((res) => {
                    debugger;
                    let objResponse = res.data;

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

    
    grdItemChange = (e: any) => {
        debugger;
        e.dataItem[e.field] = e.value;
        this.setState({
            grdRigState: [...this.state.grdRigState]
        });

        let newData: any = Object.values([...this.state.grdRigState]);
        let index = newData.findIndex((item: any) => item.Number === e.dataItem.Number); // use unique value like ID
        newData[index][e.field] = e.value;
        this.setState({ grdRigState: newData })
    };

    render() {
        return (
            <div>

                <h5>Rig State Setup</h5>


                {/* <Label>{this.state.WellName}</Label>
                <Label>{this.state.WellID}</Label> */}


                <Splitter
                    panes={this.state.panes}
                    onChange={this.onPanelChange}
                    style={{ height: "90vh" }}

                >
                    {/* <div className={this.state.openDialog ? "k-state-disabled" : "pane-content"}> */}
                    <div className={"pane-content"}>
                        < ActiveWellSelector getSelectedWells={this.getSelectedWells} getWithWellName={true}></ActiveWellSelector>

                    </div>

                    <div className="pane-content ml-5" id="rightPanel" >
                        {this.state.WellID != "" && (
                            <div>
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
                                                                onChange={(e: any) => { this.handleChange(e, "UnknownColor") }}
                                                            />
                                                        </div>
                                                   
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
                                                            Depth and Hole Depth Sensitivity
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
                            </div>

                        )}
                    </div>
                </Splitter>




            </div>
        )
    }
}
