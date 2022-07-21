import { Button, Dialog } from '@progress/kendo-react-all'
import { DateTimePicker } from '@progress/kendo-react-dateinputs'
import { RadioButton } from '@progress/kendo-react-inputs'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import BrokerParameter from '../../../broker/BrokerParameter';
import BrokerRequest from '../../../broker/BrokerRequest';
import GlobalMod from '../../../objects/global';
import * as utilFunctions from "../../../utilFunctions/utilFunctions";
import { ProgressBar } from '@progress/kendo-react-progressbars';


export class CalcRigState {
    // constructor(parameters) {

    // }

    SelectionType: string = "0";
    FromDate: Date = new Date();
    ToDate: Date = new Date();
}


let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("", "");

export default function CalculateRigState(_props) {

    let wellID = _props.WellID;

    debugger;

    const [objCalcRigState, setCalcRigState] = useState(new CalcRigState());
    // const [FromDate, setFromDate] = useState(new Date());
    // const [ToDate, setToDate] = useState(new Date());
    const [progress, setProgress] = useState(Number(0));

    useEffect(() => {

    }, []);

    const HandleChange = async (e: any, FieldName: string) => {
        debugger;
        // const { name, value } = e.target;
        let value = e.value;

        setCalcRigState(prevState => ({
            ...prevState,
            [FieldName]: value
        }));


        // if (FieldName == "FromDate") {
        //     setFromDate(value);
        //     //Below Code is to update Class object
        //     // setFromDate(prevState => ({
        //     //     ...prevState,
        //     //     [FieldName]: value
        //     // }));
        // }

        // if (FieldName == "ToDate") {
        //     setToDate(value);
        //     // setToDate(prevState => ({
        //     //     ...prevState,
        //     //     [FieldName]: value
        //     // }));
        // }

        // if (FieldName == "SelectionType") {
        //     // await setSelectionType(value);
        //     // useEffect(() => { setSelectionType(value) }, [])
        //     setCalcRigState(prevState => ({
        //         ...prevState,
        //         [FieldName]: value
        //     }));
        // }



    };

    const setProgressbar = () => {
        try {
            setProgress(progress + 1);
        } catch (error) {

        }
    }

    const startProcess = async () => {
        try {

            alert(objCalcRigState.SelectionType);
            objBrokerRequest = new BrokerRequest();

            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "RigStateSetup";
            objBrokerRequest.Function = "calcRigState";

            objParameter = new BrokerParameter("UserID", _gMod._userId);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("WellID", wellID);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("selectedval", objCalcRigState.SelectionType);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("FromDate", utilFunctions.formateDate(objCalcRigState.FromDate));
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("ToDate", utilFunctions.formateDate(objCalcRigState.ToDate));
            objBrokerRequest.Parameters.push(objParameter);


            await axios.get(_gMod._performTask, {
                onDownloadProgress: (progressEvent) => {
                    console.log(progressEvent);
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(progressEvent.lengthComputable)
                    console.log(percentCompleted);
                },
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) },
            })
                .then((response) => {
                    alert("Completed");
                }).catch(error => {
                    alert(error);
                    // if (error.response) {
                    //     console.log(error);
                    // }
                });

            // axios
            //     .get(_gMod._performTask, {

            //         // onUploadProgress(progressEvent) {
            //         //     //let { progress } = progress;
            //         //     alert("on Uploadprogress");
            //         //     let progress = (progressEvent.loaded / progressEvent.total) * 100;
            //         //     setProgress(progress);
            //         //     console.log("Upload Progress Bar",progress);
            //         // },
            //         onDownloadProgress(progressEvent) {

            //             debugger;
            //             let progress: number = (progressEvent.loaded / progressEvent.total) * 100;
            //             // const timer = setInterval(() => {
            //             //     setProgress(progress);
            //             // }, 10);
            //             setProgress(progress);

            //             console.log("Progress Bar", progress);
            //             console.log("progressEvent",progressEvent);
            //         },


            //         headers: {
            //             Accept: "application/json",
            //             "Content-Type": "application/json;charset=UTF-8",
            //         },
            //         params: { paramRequest: JSON.stringify(objBrokerRequest) },

            //     })
            //     .then((res) => {
            //         debugger;
            //         let objResponse = res.data;
            //         //JSON.parse(res.data.Response);


            //         //  this.setState({ FromDate: new Date(objResponse.FromDate), ToDate: new Date(objResponse.ToDate), showCalRigStateDialog: false });


            //         if (objResponse.RequestSuccessfull == false) {
            //             //Warnings Notifications
            //             let warnings: string = objResponse.Warnings;
            //             if (warnings.trim() != "") {
            //                 let warningList = [];
            //                 warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
            //                 this.setState({
            //                     warningMsg: warningList
            //                 });
            //             }
            //         } else {
            //             alert("Calculation Process done successfully");

            //         }

            //         // this.setState({ showCalRigStateDialog: false });
            //         // Util.StatusSuccess("Data successfully retrived  ");

            //     })
            //     .catch((error) => {
            //         alert("error " + error.message);


            //         if (error.response) {
            //             // return <CustomeNotifications Key="success" Icon={false}  />
            //             // this.errors(error.response.message);
            //         } else if (error.request) {
            //             // return <CustomeNotifications Key="success" Icon={false}  />
            //             console.log("error.request");
            //         } else {
            //             // return <CustomeNotifications Key="success" Icon={false}  />
            //             console.log("Error", error);
            //         }
            //         // return <CustomeNotifications Key="success" Icon={false}  />
            //         console.log("rejected");

            //     });




        } catch (error) {

        }
    }

    return (
        <>
            <Dialog title={"Calculate Rig State (FC)"}
                width={"700px"}
                height={"400px"}
                onClose={(e: any) => {
                    debugger;
                    _props.onClose();
                }}
            >

                <div className="row mt-3" >
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">

                        <RadioButton
                            name="SelectionType"
                            value="0"
                            checked={objCalcRigState.SelectionType == "0"}
                            label="Calculate for Entire Well"
                            onChange={(e) => HandleChange(e, "SelectionType")}
                        />
                    </div>
                </div>

                <div className="row mt-3" >
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">

                        <RadioButton
                            name="SelectionType"
                            value="1"
                            checked={objCalcRigState.SelectionType == "1"}
                            label="Calculate From Date"
                            onChange={(e) => HandleChange(e, "SelectionType")}
                        />
                    </div>

                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">
                        <DateTimePicker
                            name="FromDate"
                            value={new Date(objCalcRigState.FromDate)}
                            format="MM/dd/yyyy HH:mm:ss"
                            formatPlaceholder={{
                                year: "yyyy",
                                month: "MM",
                                day: "dd",
                                hour: "HH",
                                minute: "mm",
                                second: "ss",
                            }}
                            onChange={(e) => HandleChange(e, "FromDate")}
                        />
                    </div>
                </div>

                <div className="row mt-3" >
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">

                        <RadioButton
                            name="SelectionType"
                            value="2"
                            checked={objCalcRigState.SelectionType === "2"}
                            label="Calculate - Date range From"
                            onChange={(e) => HandleChange(e, "SelectionType")}
                        />
                    </div>

                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">
                        <DateTimePicker
                            name="FromDate"
                            value={new Date(objCalcRigState.FromDate)}
                            format="MM/dd/yyyy HH:mm:ss"
                            formatPlaceholder={{
                                year: "yyyy",
                                month: "MM",
                                day: "dd",
                                hour: "HH",
                                minute: "mm",
                                second: "ss",
                            }}
                            onChange={(e) => HandleChange(e, "FromDate")}
                        />
                    </div>
                </div>
                <div className="row mt-3" >
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">


                    </div>

                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">
                        <DateTimePicker
                            name="ToDate"
                            value={new Date(objCalcRigState.ToDate)}
                            format="MM/dd/yyyy HH:mm:ss"
                            formatPlaceholder={{
                                year: "yyyy",
                                month: "MM",
                                day: "dd",
                                hour: "HH",
                                minute: "mm",
                                second: "ss",
                            }}
                            onChange={(e) => HandleChange(e, "ToDate")}
                        />
                    </div>



                </div>


                <div className="row mt-3" >
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">
                        <Button onClick={startProcess} >Start</Button>
                    </div>

                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3">
                        <Button onClick={_props.onClose} >Close</Button>
                    </div>
                </div>
                <div className="row">
                    <ProgressBar style={{ width: "200px" }} min={0} max={100} value={progress} />
                </div>
            </Dialog>
        </>

    )
}
