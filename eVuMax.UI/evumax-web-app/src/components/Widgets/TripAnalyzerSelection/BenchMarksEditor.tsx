import React, { Component, } from "react";

import $ from "jquery";


import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import "@progress/kendo-react-intl";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import "react-router-dom";
import ProcessLoader from "../../loader/loader";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndent, faChartArea } from "@fortawesome/free-solid-svg-icons";

import { DateTimePicker, Grid, GridToolbar, GridColumn as Column } from "@progress/kendo-react-all";
import { RadioButton, NumericTextBox, Checkbox } from "@progress/kendo-react-inputs";
import { comboData } from "../../../eVuMaxObjects/UIObjects/comboData";

import GlobalMod from "../../../objects/global";
import CustomLoader from "../../loader/loader";
import { PureComponent } from "react";
let _gMod = new GlobalMod();


interface IProps {
    plotID: string
}

// interface IState {
//     tripAnalyzerSelection?: any;
//     showCustomTagList?: false,
// }



//API TripAnalyzerSelection Class object
//***************************************** */



//public TripSpeedBenchMark objBenchMarks = new TripSpeedBenchMark();

// public class TripSpeedBenchMark
// {
//     public double TripSpeedWOConnection = 0;
//     public double TripSpeedWithConnection = 0;
//     public string DepthVumaxUnitID = "";
//     public Dictionary<double, TripSpeed> speedProfile = new Dictionary<double, TripSpeed>();

// }

//TripSpeed
// public double SrNo = 0;
// public double Depth = 0;
// public double SpeedWithouConnection = 0;
// public double SpeedWithConnection = 0;


//************************************ */


export default class BenchMrksEditor extends PureComponent<IProps> {
    constructor(parentRef, props: any) {
        super(props);
        this.__parentRef = parentRef;
        this.WellId = parentRef.WellId;

    }
    WellId: string = "";
    selectedTab: number = 0;
    __parentRef: any;

    state = {
        objTripAnalyzerSelection: {} as any,
        objBenchMarks: {} as any,

        isProcess: false,
        grdData: [{ "SrNo": 1, "Depth": "000", "SpeedWithoutConnection": "000", "SpeedWithConnection": "000" }, { "SrNo": 1, "Depth": "000", "SpeedWithoutConnection": "000", "SpeedWithConnection": "000" }]
    }


    //Initialize chart after component was mounted
    componentDidMount() {
        try {

            //Prepare chart object
            this.loadData();

        } catch (error) { }
    }



    componentWillUpdate() {
        try {



        } catch (error) { }
    }

    //calls when user clicks on selection method buttons
    tabSelectionChanged = (s: number) => {
        try {

        } catch (error) { }
    };

    handleChange = (event: any, field: string) => {


        const value = event.value;
        const name = field; // target.props ? target.props.name : target.name;
        let edited: any = this.state.objBenchMarks;
        edited[field] = value;
        this.setState({
            objTripAnalyzerSelection: edited
        });
    };

    Save_clicked = () => {
        try {
            //Save to DB pending
            this.state.objBenchMarks.speedProfile = this.state.grdData;
            //this.__parentRef.objBenchMarks = this.state.objBenchMarks
            //this.__parentRef.SaveUserSettings();
        } catch (error) {

        }
    }


    render() {
        let loader = this.state;
        return (
            <React.Fragment>
                <div className="mr-5" style={{ height: "90px", width: "100%" }}>

                    <div className="row ml-5">
                        <div className="col lg-2">
                            <label className="mr-3">Speed Without Connection</label>
                            <NumericTextBox
                                onChange={(e) => this.handleChange(e, "SpeedWithoutConnection")}
                                value={this.state.objBenchMarks.SpeedWithoutConnection}
                                format="n0"
                                width={100}
                            />
                        </div>
                        <div className="col lg-8">
                            <label> Speed With Connection</label>
                            <NumericTextBox
                                onChange={(e) => this.handleChange(e, "SpeedWithConnection")}
                                value={this.state.objBenchMarks.SpeedWithConnection}
                                format="n2"
                                width={100}
                            />
                        </div>
                    </div>

                    <div className="row ml-5">
                        <div className="col lg-10">
                            <Grid
                                //  onItemChange={this.onItemChange}
                                style={{ height: '30vh', width: '45vw' }}
                                data={this.state.objBenchMarks}
                                resizable={true}
                                scrollable={"scrollable"}
                                sortable={true}
                                selectedField="selected"
                            // onSelectionChange={this.selectionChange}
                            //  onHeaderSelectionChange={this.grid_headerSelectionChange}//Nishant 26-05-2020

                            >
                                <GridToolbar>
                                    <span className="ml-2">
                                        {loader.isProcess ? <CustomLoader /> : ""}
                                    </span>


                                </GridToolbar>

                                {true && <Column field="SrNo" headerClassName="text-center" className="text-left" title="SrNo" width="90px" editable={false} />}
                                <Column field="Depth" headerClassName="text-center" className="text-left" title="Depth" width="90px" editable={false} />
                                <Column field="SpeedWithoutConnection" headerClassName="text-center" className="text-left" title="Speed Without Connection" width="150px" editable={false} />
                                <Column field="SpeedWithConnection" headerClassName="text-center" className="text-left" title="Speed With Connection" width="90px" editable={false} />
                                <Column field="RemoveRow" headerClassName="text-center" className="text-center" title="*" width="90px"
                                    cell={props => {

                                        return (
                                            <td className="text-center">
                                                <button>Remove</button>

                                            </td>
                                        );
                                    }}
                                />
                            </Grid>
                        </div>
                    </div>






                    <div className="row ml-5">
                        <div className="col">
                            <button onClick={this.Save_clicked}>Save & Apply</button>
                        </div>
                    </div>




                </div>
            </React.Fragment>
        );
    }


    loadData = () => {
        try {

            $("#loader").show();

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Summary.Manager";
            objBrokerRequest.Broker = "TripAnalyzerSelection";
            objBrokerRequest.Function = "loadSelection";

            let paramwellId: BrokerParameter = new BrokerParameter("WellId", this.WellId);
            let paramChannelList: BrokerParameter = new BrokerParameter("UserId", _gMod._userId);
            let paramPlotID: BrokerParameter = new BrokerParameter("PlotID", this.props.plotID);


            objBrokerRequest.Parameters.push(paramwellId);
            objBrokerRequest.Parameters.push(paramChannelList);
            objBrokerRequest.Parameters.push(paramPlotID);


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
                    console.log("trip Analy", objData);

                    let customTagList: comboData[] = [];
                    for (let index = 0; index < objData.TagSourceData.length; index++) {
                        const element = objData.TagSourceData[index];
                        let objItem: comboData = new comboData();
                        objItem.id = element.SOURCE_ID;
                        objItem.text = element.SOURCE_NAME;
                        customTagList.push(objItem);
                    }
                    if (customTagList.length > 0) {
                        this.setState({
                            customTagList: customTagList
                        });
                    }


                    // this.setState({
                    //     objTripAnalyzerSelection: objData.grdTripTagData.map((dataItem: any) => Object.assign({ selected: false }, dataItem))
                    // });


                    objData.grdTripTagData = objData.grdTripTagData.map((dataItem: any) => Object.assign({ selected: false }, dataItem));


                    this.setState({
                        objTripAnalyzerSelection: objData,
                        grdData: objData.grdTripTagData,
                    });
                    //CustomTagSourceID


                })
                .catch((error) => {
                    $("#loader").hide();


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
        } catch (error) { }
    };

}



