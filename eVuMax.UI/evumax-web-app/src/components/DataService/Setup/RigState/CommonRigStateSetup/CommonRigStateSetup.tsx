import { ColorPicker, Grid, GridColumn, Input, Label, TabStrip, TabStripSelectEventArguments, TabStripTab } from '@progress/kendo-react-all'
import { Checkbox } from '@progress/kendo-react-inputs'
import React, { Component } from 'react'
import "./CommonRigStateSetup.css"
export default class CommonRigStateSetup extends Component {
    state = {
        selectedTab: 2,
    }


    handleSelectTab = (e: TabStripSelectEventArguments) => {
        this.setState({ selectedTab: e.selected })

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
                                //onClick={this.save}
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
                                    <div className="col-5">
                                        <Grid
                                            style={{
                                                height: "70vh", width: "auto"
                                            }}
                                            //onSelectionChange={this.grid_selectionChange}
                                            // onHeaderSelectionChange={this.grid_headerSelectionChange} //Nishant 26-05-2020
                                            selectedField="selected1"
                                        //data={this.state.grdWells}
                                        >
                                            {false && <GridColumn field="ID" width="80px" title="Id" />}
                                            <GridColumn
                                                field="Number"
                                                title="Number"
                                                width={100}
                                            />
                                            <GridColumn
                                                field="Name"
                                                title="Name"
                                            />
                                            <GridColumn
                                                title="Rig State Color"
                                                width="260px"

                                                cell={(props) => (
                                                    <td
                                                        style={props.style}
                                                        className={"text-center k-command-cell " + props.className}
                                                    >
                                                        <ColorPicker
                                                            // style={{ width: "100%" }}
                                                            // onChange={(e) =>

                                                            //     // this.OpenInterfaceChange(e, props.dataItem)
                                                            // }
                                                            value={props.dataItem.value}
                                                        // data={this.state.dataForDropDown}
                                                        // textField="name"
                                                        // dataItemKey="id"
                                                        />
                                                    </td>
                                                )}
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
                                        <div className="row mt-5">
                                            <Label className='' style={{ alignSelf: "flex-end", fontSize: "large", fontWeight: "bold" }}>Note: Double click on the colored cell to change color.</Label>
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
                                    <div className="col-12" style={{textAlign:"center"}}>
                                <label className="" style={{color:"lightblue"}}>
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
