import { Button, ColorPicker, DateTimePicker, Dialog, Grid, GridColumn, Input, Label, TabStrip, TabStripSelectEventArguments, TabStripTab } from '@progress/kendo-react-all'
import { Checkbox, RadioButton } from '@progress/kendo-react-inputs';

import React, { Component, useState } from 'react'
import BrokerParameter from '../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../broker/BrokerRequest';
import GlobalMod from '../../../../objects/global';
import * as utilFunctions from "../../../../utilFunctions/utilFunctions";

import axios from "axios";
import CalculateRigState from '../../Fx_Functions/CalculateRigState';


export interface IProps {
    wellID: string;
    closeDialog: boolean;
}


//   function WellSpecificRigStateSetup(_props) {
//     const [objRigStateSetup, setRigSateObject] = useState(null);
//     const [grdRigState, setGrdRigState] = useState(null);
// const [data, setData] = useState([{"name": "joy", "age": 25}, {"name": "tom", "age": 41}]);
// setData(prevState => {
//     let obj = prevState.find(o => anycondition);
//     if(obj !== undefined) {
//       obj.name = "Demo";
//     }
//     return [...prevState];
//   })

//MEthod 2nd
// const [state, setState] = useState({ fName: "", lName: "" });
// const handleChange = e => {
//     const { name, value } = e.target;
//     setState(prevState => ({
//         ...prevState,
//         [name]: value
//     }));
// };

// <input
//     value={state.fName}
//     type="text"
//     onChange={handleChange}
//     name="fName"
// />
// <input
//     value={state.lName}
//     type="text"
//     onChange={handleChange}
//     name="lName"
// />



//     const grdItemChange=(obRow: any)=>{
//         try {
//             
//             obRow.dataItem[obRow.field] = obRow.value;
//             // this.setState({
//             //     grdRigState: [...this.state.grdRigState]
//             // });

//             let newData: any = Object.values([...grdRigState]);
//             let index = newData.findIndex((item: any) => item.Number === obRow.dataItem.Number); // use unique value like ID
//             newData[index][obRow.field] = obRow.value;
//             setGrdRigState(newData);
//             //this.setState({ grdRigState: newData })


//         } catch (error) {

//         }
//     }

//     return (
//       <>
//          <div className="row">

// <TabStrip selected={this.state.selectedTab} onSelect={this.handleSelectTab} >

//     <TabStripTab title="Rig States">
//         <div>
//             <div className="row">
//                 <div className="col-6">
//                     <Grid
//                         style={{
//                             height: "70vh", width: "auto"
//                         }}
//                         //                                                            selectedField="selected"
//                         data={grdRigState}
//                         onItemChange={this.grdItemChange}
//                     >

//                         <GridColumn
//                             field="Number"
//                             title="Number"
//                             width={60}
//                         />
//                         <GridColumn
//                             field="Name"
//                             title="Rig State"
//                             width={185}
//                         />
//                         <GridColumn field="Color" headerClassName="text-center" className="text-center" title="Color" width={90}
//                             cell={props => {

//                                 return (
//                                     <td className="text-center">
//                                         <ColorPicker

//                                             value={props.dataItem[props.field]}
//                                             onChange={e => {

//                                                 props.onChange({
//                                                     dataItem: props.dataItem,
//                                                     dataIndex: props.dataIndex,
//                                                     field: props.field,
//                                                     syntheticEvent: e.syntheticEvent,
//                                                     value: e.value
//                                                 });
//                                             }}
//                                         />
//                                     </td>
//                                 );
//                             }}
//                         />

//                     </Grid>
//                 </div>
//                 <div className="col-3">
//                     <div className="row mb-2">
//                         <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Unknown Name</Label>
//                         <Input type='text'
//                             value={this.state.objRigStateSetup.UnknownName}
//                             onChange={(e: any) => { this.handleChange(e, "UnknownName") }}
//                         >
//                         </Input>
//                     </div>
//                     <div className="row mt-3">
//                         <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Unknown Color</Label>
//                         <ColorPicker
//                             value={this.state.objRigStateSetup.UnknownColor}
//                             view={"gradient"}
//                             onChange={(e: any) => { this.handleChange(e, "UnknownColor") }}
//                         />
//                     </div>

//                 </div>
//             </div>
//         </div>
//     </TabStripTab>
//     <TabStripTab title="Threshold Values">

//         <div className="m-2 p-2">
//             <Label className='' style={{ alignSelf: "flex-end", fontSize: "large", fontWeight: "bold" }}>Rig State Threshold Values</Label>
//         </div>
//         <div className="col-12">
//             <div className="form-group">
//                 <div className="">
//                     <label className="valueLabel" >
//                         Hookload Cut Off
//                     </label>
//                     <Input type='number' style={{ width: "70px" }}

//                         value={this.state.objRigStateSetup.HookloadCutOff}
//                         onChange={(e: any) => { this.handleChange(e, "HookloadCutOff") }}
//                     />
//                     <label className="valueLabelBack" >

//                     </label>
//                 </div>
//                 <div className="">
//                     <label className="valueLabel">
//                         RPM Cut Off Cash
//                     </label>
//                     <Input type='number' style={{ width: "70px" }}
//                         value={this.state.objRigStateSetup.RPMCutOff}
//                         onChange={(e: any) => { this.handleChange(e, "RPMCutOff") }}
//                     />
//                     <label className="valueLabelBack" >
//                         --
//                     </label>
//                 </div>
//                 <div className="">
//                     <label className="valueLabel">
//                         CIRC Cut Off
//                     </label>
//                     <Input type='number' style={{ width: "70px" }}

//                         value={this.state.objRigStateSetup.CIRCCutOff}
//                         onChange={(e: any) => { this.handleChange(e, "CIRCCutOff") }}
//                     />
//                     <label className="valueLabelBack" >
//                         --
//                     </label>
//                 </div>
//                 <div className="">
//                     <label className="valueLabel">
//                         Block Movement Sensitivity
//                     </label>
//                     <Input type='number' style={{ width: "70px" }}

//                         value={this.state.objRigStateSetup.Sensitivity}
//                         onChange={(e: any) => { this.handleChange(e, "Sensitivity") }}
//                     />
//                     <label className="valueLabelBack" >
//                         --
//                     </label>
//                 </div>
//                 <div className="">
//                     <label className="valueLabel">
//                         Pump Pressure Cut Off
//                     </label>
//                     <Input type='number' style={{ width: "70px" }}

//                         value={this.state.objRigStateSetup.PumpPressureCutOff}
//                         onChange={(e: any) => { this.handleChange(e, "PumpPressureCutOff") }}
//                     />
//                     <label className="valueLabelBack" >
//                         --
//                     </label>
//                 </div>
//                 <div className="">
//                     <label className="valueLabel">
//                         Depth and Hole Depth Sensitivity
//                     </label>
//                     <Input type='number' style={{ width: "70px" }}

//                         value={this.state.objRigStateSetup.DepthComparisonSens}
//                         onChange={(e: any) => { this.handleChange(e, "DepthComparisonSens") }}
//                     />
//                     <label className="valueLabelBack" >
//                         --
//                     </label>
//                 </div>
//                 <div className="">
//                     <label className="valueLabel">
//                         Surface Torque Cut Off
//                     </label>
//                     <Input type='number' style={{ width: "70px" }}

//                         value={this.state.objRigStateSetup.TorqueCutOff}
//                         onChange={(e: any) => { this.handleChange(e, "TorqueCutOff") }}
//                     />
//                     <label className="valueLabelBack" >
//                         --
//                     </label>
//                 </div>


//             </div>
//             <div className="row mb-3" style={{ justifyContent: "flex-end" }}>
//                 <span className="mt-3">
//                     <Checkbox
//                         value={this.state.objRigStateSetup.DetectAirDrilling}
//                         onChange={(e: any) => { this.handleChange(e, "DetectAirDrilling") }}
//                         //checked={this.state.removeWells}
//                         label={"Dectect Air Drilling"}
//                     />
//                 </span>
//             </div>
//             <div className="">
//                 <label className="valueLabel">
//                     Mist Flow Cut Off
//                 </label>
//                 <Input type='number' style={{ width: "70px" }}

//                     value={this.state.objRigStateSetup.MistFlowCutOff}
//                     onChange={(e: any) => { this.handleChange(e, "MistFlowCutOff") }}
//                 />
//                 <label className="valueLabelBack" >
//                     --
//                 </label>
//             </div>
//             <div className=" mb-3">
//                 <span className="mt-3">
//                     <Checkbox
//                         value={this.state.objRigStateSetup.DetectPipeMovement}
//                         onChange={(e: any) => { this.handleChange(e, "DetectPipeMovement") }}
//                         label={"Dectect Pipe Movement"}
//                     />
//                 </span>
//             </div>
//             <div className="">
//                 <label className="valueLabel">
//                     Pipe Movement Depth Threshold
//                 </label>
//                 <Input type='number' style={{ width: "70px" }}

//                     value={this.state.objRigStateSetup.PipeMovementThreshold}
//                     onChange={(e: any) => { this.handleChange(e, "PipeMovementThreshold") }}
//                 />
//                 <label className="valueLabelBack" >
//                     --
//                 </label>
//             </div>
//         </div>
//     </TabStripTab>
//     <TabStripTab title="Auto Slide Drilling Parameaters">
//         <div className="m-2 p-2">
//             <div className="row">
//                 <span className="mt-3">
//                     <Checkbox
//                         value={this.state.objRigStateSetup.DetectAutoSlideDrilling}
//                         onChange={(e: any) => { this.handleChange(e, "DetectAutoSlideDrilling") }}
//                         //checked={this.state.removeWells}
//                         label={"Dectect Auto Slide Drilling"}
//                     />
//                 </span>
//             </div>

//             <div className="row">
//                 <div className="col-12">
//                     <div className="">
//                         <label className="valueLabel" >
//                             Max. RPM Cutoff
//                         </label>
//                         <Input type='number' style={{ width: "70px" }}

//                             value={this.state.objRigStateSetup.MaxRPM}
//                             onChange={(e: any) => { this.handleChange(e, "MaxRPM") }}
//                         />
//                         <label className="valueLabelBack" >
//                             RPM
//                         </label>
//                     </div>
//                 </div>

//             </div>
//             <div className="row mt-2 mb-2">
//                 <div className="col-12" style={{ textAlign: "center" }}>
//                     <label className="" style={{ color: "lightblue" }}>
//                         VuMax will dectect the Auto Slide if the RPM is below the cutoff value.
//                     </label>
//                 </div>
//             </div>
//             <div className="row">
//                 <div className="col-6">
//                     <div className="">
//                         <label className="valueLabel" >
//                             No. of Torque Fluctuations
//                         </label>
//                         <Input type='number' style={{ width: "70px" }}

//                             value={this.state.objRigStateSetup.TorqueCycles}
//                             onChange={(e: any) => { this.handleChange(e, "TorqueCycles") }}
//                         />
//                         <label className="valueLabelBack" >
//                             --
//                         </label>
//                     </div>
//                 </div>
//                 <div className="col-6">
//                     <div className="">
//                         <label className="valueLabel" >
//                             Max. Torque
//                         </label>
//                         <Input type='number' style={{ width: "70px" }}

//                             value={this.state.objRigStateSetup.TorqueMax}
//                             onChange={(e: any) => { this.handleChange(e, "TorqueMax") }}
//                         />
//                         <label className="valueLabelBack" >
//                             --
//                         </label>
//                     </div>
//                 </div>
//             </div>
//             <div className="row">
//                 <div className="col-6">
//                     <div className="">
//                         <label className="valueLabel" >
//                             Percentage Window
//                         </label>
//                         <Input type='number' style={{ width: "66px" }}

//                             value={this.state.objRigStateSetup.PercentWindow}
//                             onChange={(e: any) => { this.handleChange(e, "PercentWindow") }}
//                         />
//                         <label className="valueLabelBack" >
//                             %
//                         </label>
//                     </div>
//                 </div>
//                 <div className="col-6">
//                     <div className="">
//                         <label className="valueLabel" >
//                             Min. Variance
//                         </label>
//                         <Input type='number' style={{ width: "70px" }}

//                             value={this.state.objRigStateSetup.MinTorqueDifference}
//                             onChange={(e: any) => { this.handleChange(e, "MinTorqueDifference") }}
//                         />
//                         <label className="valueLabelBack" >
//                             --
//                         </label>
//                     </div>
//                 </div>
//             </div>
//             <div className="row">
//                 <div className="col-12">
//                     <div className="">
//                         <label className="valueLabel" >
//                             Time
//                         </label>
//                         <Input type='number' style={{ width: "70px" }}

//                             value={this.state.objRigStateSetup.CalibrationTime}
//                             onChange={(e: any) => { this.handleChange(e, "CalibrationTime") }}
//                         />
//                         <label className="valueLabelBack" >
//                             minutes
//                         </label>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </TabStripTab>


//     <TabStripTab title="Auto Slide Drilling Parameaters 2">
//         <div className="m-2 p-2">
//             <div className="row">
//                 <span className="mt-3">
//                     <Label>Depth specific slide Drilling settings</Label>
//                     <Button className="ml-3"
//                         onClick={this.onAddClick}
//                     >
//                         Add Row
//                     </Button>
//                     <Button className="ml-3"
//                         onClick={this.onRemoveClick}
//                     >
//                         Remove Row
//                     </Button>
//                 </span>
//             </div>
//             <div className="row">
//                 {/* <div className="col-lg-12"> */}
//                 <Grid
//                     //data={this.state.grdAutoSlideSetupList}
//                     data={
//                         this.state.grdAutoSlideSetupList != null
//                             ? this.state.grdAutoSlideSetupList.map((item: any) => ({
//                                 ...item,
//                                 inEdit: item.SRNO === this.state.SR_NO,
//                             }))
//                             : null
//                     }
//                     onRowClick={this.AutoSlideRowClick}
//                     editField="inEdit"
//                     selectedField="inEdit"
//                     onItemChange={this.AutoSlideSetupListItemChange}
//                 >
//                     <GridColumn
//                         field="FromDepth"
//                         title="From Depth (ft)"
//                     >
//                     </GridColumn>
//                     <GridColumn
//                         field="ToDepth"
//                         title="To Depth (ft)"
//                     >
//                     </GridColumn>

//                 </Grid>
//                 {/* </div> */}
//             </div>

//         </div>
//     </TabStripTab>
// </TabStrip>

// </div>

//        <Button onClick={ _props.closeDialog }>Close</Button>

//       </>

//     )
//   }

//   WellSpecificRigStateSetup.propTypes = {wellID:PropTypes.string, closeDialog: PropTypes.func}

//   export default WellSpecificRigStateSetup


let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("", "");

export class WellSpecificRigStateSetup extends Component<IProps> {
    wellID: string = "";
    props: any = this.props;
    constructor(props: any) {
        super(props);
        this.wellID = props.wellID
    }
    state = {
        warningMsg: [],
        selectedTab: 0,
        grdRigState: [] as any,
        objRigStateSetup: {} as any,
        grdAutoSlideSetupList: [],
        SR_NO: 0,
        FromDate: new Date(),
        ToDate: new Date(),
        showCalRigStateDialog: false,
        showCalRigStateDialog2: false,
        selectedval: "0"
        
    }

    componentDidMount(): void {
        try {
            this.LoadSetting();
        } catch (error) {

        }
    }

    setdata = async (objData: any) => {
        try {

            let objRigStates = utilFunctions.CopyObject(Object.values(objData.rigStates));
            let grdRigState = [];

            let count: number = 0;
            objData.autoSlideSetupList = Object.values(objData.autoSlideSetupList);
            objData.autoSlideSetupList = objData.autoSlideSetupList.map((item: any) => Object.assign({ SRNO: count + 1 }, item));
            if (objRigStates.length > 0) {
                for (let index = 0; index < objRigStates.length; index++) {
                    let objItem: any = objRigStates[index];
                    objItem.Color = utilFunctions.intToColor(objItem.Color);
                    grdRigState.push(objItem);
                }
                this.setState({
                    objRigStateSetup: objData, grdRigState: grdRigState, grdAutoSlideSetupList: objData.autoSlideSetupList
                });

            }

        } catch (error) {

        }
    }

    LoadSetting = () => {
        try {

            let objBrokerRequest = new BrokerRequest();
            let objParameter = new BrokerParameter("WellID", this.wellID);
            objBrokerRequest.Parameters.push(objParameter);


            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "RigStateSetup";
            objBrokerRequest.Function = "loadRigStateSetup";

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

    handleChange = (objItem: any, fieldName: string) => {
        let edited: any = this.state.objRigStateSetup;

        edited[fieldName] = objItem.value;

        this.setState({
            objRigStateSetup: edited
        });
    }
    onAddClick = (e) => {
        try {
            
            let newRow = {
                SRNO: this.state.grdAutoSlideSetupList.length + 1,
                FromDepth: 0,
                ToDepth: 0,
                MinTorque: 0,
                MaxTorque: 0,
                CalibrationRows: 0,
                MinTorqueDiff: 0,
                MinRPM: 0,
                MaxRPM: 0
            };

            let editData: any = this.state.grdAutoSlideSetupList;

            editData.push(newRow);

            this.setState({
                grdAutoSlideSetupList: editData,
            });

            //this.forceUpdate(); //change on 09-02-2021
        } catch { }
    }

    onRemoveClick = (e) => {
        try {
            this.setState({
                grdAutoSlideSetupList: this.state.grdAutoSlideSetupList.filter((item) => item.SRNO != this.state.SR_NO)
            });
        } catch (error) {

        }
    }

    AutoSlideSetupListItemChange = (e: any) => {
        try {
            e.dataItem[e.field] = e.value;
            

            let newData: any = Object.values([...this.state.grdAutoSlideSetupList]);
            let index = newData.findIndex((item: any) => item.SRNO === e.dataItem.SRNO); // use unique value like ID
            //alert(index);

            //let nRows = this.state.grdAutoSlideSetupList.length;
            if (index != -1) {
                newData[index][e.field] = e.value;
            }


            this.setState({ grdAutoSlideSetupList: newData });
        } catch (error) {

        }

    }


    AutoSlideRowClick = (event: any) => {
        this.setState({
            SR_NO: event.dataItem.SRNO,
        });
    }


    save = () => {
        try {
            
            this.state.grdAutoSlideSetupList.forEach(function (x) { delete x.SRNO });
            this.state.objRigStateSetup.autoSlideSetupList = utilFunctions.convertMapToDictionaryJSON(this.state.grdAutoSlideSetupList);
            let localRigStateList: any = utilFunctions.CopyObject(this.state.grdRigState);
            for (let index = 0; index < localRigStateList.length; index++) {
                let objItem: any = localRigStateList[index];
                objItem.Color = utilFunctions.rgb2hex(objItem.Color);
            }
            localRigStateList = utilFunctions.convertMapToDictionaryJSON(localRigStateList, "Number");

            let localObjRigStateSetup = utilFunctions.CopyObject(this.state.objRigStateSetup);
            localObjRigStateSetup.UnknownColor = 0; // utilFunctions.rgb2hex(localObjRigStateSetup.UnknownColor);
            //

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "RigStateSetup";
            objBrokerRequest.Function = "saveRigStateSetup";

            let objParameter: BrokerParameter = new BrokerParameter("UserID", _gMod._userId);
            objBrokerRequest.Parameters.push(objParameter);



            objParameter = new BrokerParameter("WellID", this.wellID);

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
                    
                    let objResponse = JSON.parse(res.data.Response);

                    this.setState({ FromDate: new Date(objResponse.FromDate), ToDate: new Date(objResponse.ToDate), showCalRigStateDialog: true });


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
                    }else{
                        // this.props.closeDialog();
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

    handleChangeCalRigState = (event: any, field: string) => {

        
        const value = event.value;
        const name = field; // target.props ? target.props.name : target.name;
        //let edited: any = utilFunc.CopyObject(this.state.objDataSelector);

        //edited["MatchDepthByFormationTops"] = this.state.MatchDepthByFormationTops;

        switch (field) {
            case "selectedval":
                this.setState({
                    selectedval: value
                });
                break;
            case "FromDate":
                this.setState({
                    FromDate: value
                });
                break;
            case "ToDate":
                this.setState({
                    ToDate: value
                });
                break;
            default:
                break;
        }





    };

    startProcess = () => {
        try {

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "RigStateSetup";
            objBrokerRequest.Function = "calcRigState";

            let objParameter: BrokerParameter = new BrokerParameter("UserID", _gMod._userId);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("WellID", this.wellID);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("selectedval", this.state.selectedval);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("FromDate", utilFunctions.formateDate(this.state.FromDate));
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("ToDate", utilFunctions.formateDate(this.state.ToDate));
            objBrokerRequest.Parameters.push(objParameter);


            axios
                .get(_gMod._performTask, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then((res) => {
                    
                    let objResponse = res.data;
                    //JSON.parse(res.data.Response);


                    //  this.setState({ FromDate: new Date(objResponse.FromDate), ToDate: new Date(objResponse.ToDate), showCalRigStateDialog: false });


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
                    } else {
                        alert("Calculation Process done successfully");

                    }

                    this.setState({ showCalRigStateDialog: false });
                    // Util.StatusSuccess("Data successfully retrived  ");

                })
                .catch((error) => {
                    alert("error " + error.message);


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


    closeRigStateSetupDialog = () => {
        try {
          this.setState({
            showCalRigStateDialog2: false,
            EditingInProgress: false
          })
        } catch (error) {
    
        }
      }

      

    render() {
        return (
            <>
           
              

                <div id="mainContainer_" >
                
                    <div className="row" style={{ float: "right" }}>
                        <Button onClick={this.save}>Save</Button>
                        <Button onClick={this.props.closeDialog}>Close</Button>
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
                                                //                                                            selectedField="selected"
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


                            <TabStripTab title="Auto Slide Drilling Parameaters 2">
                                <div className="m-2 p-2">
                                    <div className="row">
                                        <span className="mt-3">
                                            <Label>Depth specific slide Drilling settings</Label>
                                            <Button className="ml-3"
                                                onClick={this.onAddClick}
                                            >
                                                Add Row
                                            </Button>
                                            <Button className="ml-3"
                                                onClick={this.onRemoveClick}
                                            >
                                                Remove Row
                                            </Button>
                                        </span>
                                    </div>
                                    <div className="row">
                                        {/* <div className="col-lg-12"> */}
                                        <Grid
                                            //data={this.state.grdAutoSlideSetupList}
                                            data={
                                                this.state.grdAutoSlideSetupList != null
                                                    ? this.state.grdAutoSlideSetupList.map((item: any) => ({
                                                        ...item,
                                                        inEdit: item.SRNO === this.state.SR_NO,
                                                    }))
                                                    : null
                                            }
                                            onRowClick={this.AutoSlideRowClick}
                                            editField="inEdit"
                                            selectedField="inEdit"
                                            onItemChange={this.AutoSlideSetupListItemChange}
                                        >
                                            <GridColumn
                                                field="FromDepth"
                                                title="From Depth (ft)"
                                            >
                                            </GridColumn>
                                            <GridColumn
                                                field="ToDepth"
                                                title="To Depth (ft)"
                                            >
                                            </GridColumn>

                                        </Grid>
                                        {/* </div> */}
                                    </div>

                                </div>
                            </TabStripTab>
                        </TabStrip>
                    </div>




                </div>
                {this.state.showCalRigStateDialog2 &&  <CalculateRigState WellID = {this.wellID} onClose={this.closeRigStateSetupDialog}> </CalculateRigState> }
                {this.state.showCalRigStateDialog && (
                    //style={{ height: '100%', width: '500px', top: 0, left: 0 }}
                    <Dialog title={"Calculate Rig State"}
                        width={"700px"}
                        height={"400px"}
                        onClose={(e: any) => {
                            this.setState({
                                showCalRigStateDialog: false
                            })
                        }}
                    >

                       
                        <div className="row mt-3" >
                            <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">

                                <RadioButton
                                    name="selectionby"
                                    value="0"
                                    checked={this.state.selectedval === "0"}
                                    label="Calculate for Entire Well"
                                    onChange={(e) => this.handleChange(e, "selectedval")}
                                />
                            </div>
                        </div>

                        <div className="row mt-3" >
                            <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">

                                <RadioButton
                                    name="selectionby"
                                    value="1"
                                    checked={this.state.selectedval === "1"}
                                    label="Calculate From Date"
                                    onChange={(e) => this.handleChangeCalRigState(e, "selectedval")}
                                />
                            </div>

                            <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">
                                <DateTimePicker
                                    name="txtFromDate"
                                    value={new Date(this.state.FromDate)}
                                    format="MM/dd/yyyy HH:mm:ss"
                                    formatPlaceholder={{
                                        year: "yyyy",
                                        month: "MM",
                                        day: "dd",
                                        hour: "HH",
                                        minute: "mm",
                                        second: "ss",
                                    }}
                                    onChange={(e) => this.handleChangeCalRigState(e, "FromDate")}
                                />
                            </div>
                        </div>

                        <div className="row mt-3" >
                            <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">

                                <RadioButton
                                    name="selectionby"
                                    value="2"
                                    checked={this.state.selectedval === "2"}
                                    label="Calculate - Date range From"
                                    onChange={(e) => this.handleChangeCalRigState(e, "selectedval")}
                                />
                            </div>

                            <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">
                                <DateTimePicker
                                    name="txtFromDate"
                                    value={new Date(this.state.FromDate)}
                                    format="MM/dd/yyyy HH:mm:ss"
                                    formatPlaceholder={{
                                        year: "yyyy",
                                        month: "MM",
                                        day: "dd",
                                        hour: "HH",
                                        minute: "mm",
                                        second: "ss",
                                    }}
                                    onChange={(e) => this.handleChangeCalRigState(e, "FromDate")}
                                />
                            </div>
                        </div>
                        <div className="row mt-3" >
                            <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">


                            </div>

                            <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">
                                <DateTimePicker
                                    name="txtToDate"
                                    value={new Date(this.state.ToDate)}
                                    format="MM/dd/yyyy HH:mm:ss"
                                    formatPlaceholder={{
                                        year: "yyyy",
                                        month: "MM",
                                        day: "dd",
                                        hour: "HH",
                                        minute: "mm",
                                        second: "ss",
                                    }}
                                    onChange={(e) => this.handleChangeCalRigState(e, "ToDate")}
                                />
                            </div>



                        </div>


                        <div className="row mt-3" >
                            <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">
                                <Button onClick={this.startProcess} >Start Process</Button>

                            </div>

                            <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">
                                <Button onClick={this.props.closeDialog} >Close</Button>
                            </div>
                        </div>


                    </Dialog>
                )}


            </>
        )
    }
}

export default WellSpecificRigStateSetup