import axios from "axios";
import { ColorPicker, Grid, GridColumn, Input, Label, TabStrip, TabStripSelectEventArguments, TabStripTab } from '@progress/kendo-react-all'
import { Checkbox } from '@progress/kendo-react-inputs'
import React, { Component } from 'react'
import BrokerRequest from '../../../../../broker/BrokerRequest'
import "./CommonRigStateSetup.css"
import GlobalMod from "../../../../../objects/global";
import * as utilFunctions from "../../../../../utilFunctions/utilFunctions";


let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();

export default class CommonRigStateSetup extends Component {
    state = {
        selectedTab: 0,
        grdRigState: [] as any,
        objRigStateSetup: {},
    }


    handleSelectTab = (e: TabStripSelectEventArguments) => {
        this.setState({ selectedTab: e.selected })

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

            let objRigStates = Object.values(objData.rigStates);
            let grdRigState = [];

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

    Save=()=>{
        try {
            
            console.log("Save", this.state.grdRigState);


            //Convert RGB Color to Hexa for each RigState Color

            
            //rigStates:0:
            //Color: -16711936
            //Name: "Rotary Drill"
            //Number: 0
            debugger;
            let reactColor = utilFunctions.intToColor(-16711936);
            let Hexa = utilFunctions.rgb2hex(reactColor);
            let HEXtoVB = this.HEXToVBColor(Hexa);
            let VBToHexa = this.VBColorToHEX(-16711936);
            let hexatoVB1 = this.HEXToVBColor(VBToHexa);


            let localRigStateList: any = utilFunctions.CopyObject(this.state.grdRigState);
            
            for (let index = 0; index < localRigStateList.length; index++) {
                let objItem: any = localRigStateList[index];
                objItem.Color =  utilFunctions.rgb2hex(objItem.Color);
            }

            alert(localRigStateList[2].Color);

        } catch (error) {
            
        } 
    }

     HEXToVBColor(rrggbb) {
        var bbggrr = rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2);
        return parseInt(bbggrr, 16);
      }
      
    VBColorToHEX(i) {
        var bbggrr =  ("000000" + i.toString(16)).slice(-6);
        var rrggbb = bbggrr.substring(4, 2) + bbggrr.substring(2, 2) + bbggrr.substring(0, 2);
        return "#" + rrggbb;
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
                                            // value={this.state.objSettings.settings[22].Value} 
                                            // onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DServerIP) }}
                                            >
                                            </Input>
                                        </div>
                                        <div className="row mt-3">
                                            <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Unknown Color</Label>
                                            <ColorPicker
                                                //value={this.state._workAreaValue}
                                                view={"gradient"}
                                            //gradientSettings={this.gradientSettings}
                                            //onChange={this.onChangeWorkArea}
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

                                        //   value={this.state.objSettings.settings[10].Value} 
                                        //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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
                                        //   value={this.state.objSettings.settings[10].Value} 
                                        //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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

                                        //   value={this.state.objSettings.settings[10].Value} 
                                        //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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

                                        //   value={this.state.objSettings.settings[10].Value} 
                                        //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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

                                        //   value={this.state.objSettings.settings[10].Value} 
                                        //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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

                                        //   value={this.state.objSettings.settings[10].Value} 
                                        //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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

                                        //   value={this.state.objSettings.settings[10].Value} 
                                        //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
                                        />
                                        <label className="valueLabelBack" >
                                            --
                                        </label>
                                    </div>


                                </div>
                                <div className="row mb-3" style={{ justifyContent: "flex-end" }}>
                                    <span className="mt-3">
                                        <Checkbox
                                            //value={this.state.objSettings.settings[20].Value} onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.OptimizeDisplay) }}
                                            // onChange={this.tglRemoveWells}
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

                                    //   value={this.state.objSettings.settings[10].Value} 
                                    //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
                                    />
                                    <label className="valueLabelBack" >
                                        --
                                    </label>
                                </div>
                                <div className=" mb-3">
                                    <span className="mt-3">
                                        <Checkbox
                                            //value={this.state.objSettings.settings[20].Value} onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.OptimizeDisplay) }}
                                            // onChange={this.tglRemoveWells}
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

                                    //   value={this.state.objSettings.settings[10].Value} 
                                    //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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
                                            //value={this.state.objSettings.settings[20].Value} onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.OptimizeDisplay) }}
                                            // onChange={this.tglRemoveWells}
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

                                            //   value={this.state.objSettings.settings[10].Value} 
                                            //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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

                                            //   value={this.state.objSettings.settings[10].Value} 
                                            //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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

                                            //   value={this.state.objSettings.settings[10].Value} 
                                            //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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

                                            //   value={this.state.objSettings.settings[10].Value} 
                                            //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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

                                            //   value={this.state.objSettings.settings[10].Value} 
                                            //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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

                                            //   value={this.state.objSettings.settings[10].Value} 
                                            //   onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} 
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
