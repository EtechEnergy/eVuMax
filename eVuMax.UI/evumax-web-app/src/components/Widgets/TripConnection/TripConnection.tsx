import React, { Component, useState, useEffect } from "react";
import * as d3 from "d3";
import $ from "jquery";
import { Chart, lineStyle } from "../../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import { formatNumber, parseDate } from "@telerik/kendo-intl";
import {
    Axis,
    axisLabelStyle,
    axisPosition,
} from "../../../eVuMaxObjects/Chart/Axis";
import DataSelector from "../../Common/DataSelector";
import { Moment } from "moment";
import {
    DataSeries,
    dataSeriesType,
} from "../../../eVuMaxObjects/Chart/DataSeries";
import { Guid } from "guid-typescript";
import "@progress/kendo-react-layout";
import { filterBy } from "@progress/kendo-data-query";
import ProcessLoader from "../../loader/loader";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import axios from "axios";
import Moment_ from "react-moment";
import {
    Input,
    MaskedTextBox,
    NumericTextBox,
    Checkbox,
    ColorPicker,
    Switch,
    RadioGroup,
    Slider,
    SliderLabel,
    RadioButton,
} from "@progress/kendo-react-inputs";
import {
    Grid,
    GridColumn as Column,
    GridColumn,
    GridToolbar,
} from "@progress/kendo-react-grid";
import {
    TabStrip,
    TabStripTab,
    Splitter,
    TreeView,
    processTreeViewItems,
    Menu,
    MenuItem,
    Popup,
    Window,
    Field,
    FormElement,
    DropDownList,
    Button,
    Form,
} from "@progress/kendo-react-all";

import { axisBottom, gray, json } from "d3";
import moment from "moment";
import { stat } from "fs";
import "./TripConnSummary.css";
import { faMoon, faSun, faUnderline } from "@fortawesome/free-solid-svg-icons";
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";
import GlobalMod from "../../../objects/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DataSelector_ from "../../Common/DataSelector_";

let _gMod = new GlobalMod();

class TripConnSummary extends Component {
    intervalID: NodeJS.Timeout | undefined;
    constructor(props: any) {
        super(props);
        this.WellId = props.match.params.WellId;
    }

    state = {
        WellName: "",
        selected: 0,
        summaryData: [],
        currentDepth: 0,
        AvgTime: 0,
        AvgDayTime: 0,
        AvgNightTime: 0,
        PositiveFlow: 0,
        NegativeFlow: 0,
        NetFlow: 0,
        ConnCount: 0,
        ExclConnCount: 0,
        CurrentView: 0,
        SkipConnMaxTime: false,
        MaxConnTime: 0,
        SkipConnMinTime: false,
        MinConnTime: 0,
        ShowExcludedConn: false,
        HighlightDayNight: false,
        DayTimeFrom: "",
        DayTimeTo: "",
        STSBenchMark: 0,
        TargetTime: 0,
        RigCost: 0,
        ShowComments: false,

        isRealTime: true as boolean,
        objDataSelector: new DataSelector_(),
    };

    WellId: string = "";
    objSummaryData: any; //Stores Connection Summary Data
    objUserSettings: any;

    //local variables
    _isLoading: boolean = false;
    objChart: Chart;

    selectionType: string = "-1";
    fromDate: Date = null;
    toDate: Date = null;
    fromDepth: number = 0;
    toDepth: number = 0;

    componentWillUpdate() {
        _gMod = new GlobalMod();
        if (_gMod._userId == "" || _gMod._userId == undefined) {
            window.location.href = "/evumaxapp/";
            return;
        }

    }
    componentDidMount() {
        try {
            //initialize chart
            this.objChart = new Chart(this, "ConnectionChart");
            this.objChart.ContainerId = "tripConnections";

            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().Min = 0;
            this.objChart.leftAxis().Max = 100;
            this.objChart.leftAxis().Inverted = false;
            this.objChart.leftAxis().ShowLabels = true;
            this.objChart.leftAxis().ShowTitle = true;
            this.objChart.leftAxis().Title = "Time (min.)";
            this.objChart.leftAxis().DisplayOrder = 1;

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().bandScale = true;
            this.objChart.bottomAxis().Min = 100;
            this.objChart.bottomAxis().Max = 200;
            this.objChart.bottomAxis().Title = "Depth (ft)";
            this.objChart.bottomAxis().ShowLabels = true;
            this.objChart.bottomAxis().ShowTitle = true;
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowSelector = true;
            this.objChart.bottomAxis().IsDateTime = false;

            this.objChart.MarginLeft = 10;
            this.objChart.MarginBottom = 40;
            this.objChart.MarginTop = 10;
            this.objChart.MarginRight = 10;

            this.objChart.initialize();
            this.objChart.reDraw();
            this.objChart.onBeforeSeriesDraw.subscribe((e, i) => {
                this.onBeforeDrawSeries(e, i);
            });
            window.addEventListener("resize", this.refreshChart);

            this.loadConnections();
        } catch (error) { }
    }

    componentDidUpdate() {
        try {
            this.refreshChart();
        } catch (error) { }
    }

    getRandomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    setData = () => {
        try {
            this.objUserSettings = JSON.parse(this.objSummaryData.userSettings);

            // alert("xxx");
            //

            this.setState({
                WellName: this.objSummaryData.WellName,
                summaryData: this.objSummaryData.connData,
                AvgTime: this.objSummaryData.avgTime,
                AvgTimeD: this.objSummaryData.avgTimeD,
                AvgNightTime: this.objSummaryData.avgTimeN,
                PositiveFlow: this.objSummaryData.PositiveCashFlow,
                NegativeFlow: this.objSummaryData.NegativeCashFlow,
                NetFlow: this.objSummaryData.NetCashFlow,
                ConnCount: this.objSummaryData.ConnCount,
                ExclConnCount: this.objSummaryData.ExcludedConns,
                SkipConnMaxTime: this.objUserSettings.SkipConnMaxTime,
                MaxConnTime: this.objUserSettings.MaxConnTime,
                SkipConnMinTime: this.objUserSettings.SkipConnMinTime,
                MinConnTime: this.objUserSettings.MinConnTime,
                ShowExcludedConn: this.objUserSettings.showExcludedConn,
                HighlightDayNight: this.objUserSettings.HighlightDayNight,
                DayTimeFrom: this.objUserSettings.DayTimeFrom,
                DayTimeTo: this.objUserSettings.DayTimeTo,
                STSBenchMark: this.objUserSettings.STSBenchMark,
                TargetTime: this.objUserSettings.TargetTime,
                RigCost: this.objUserSettings.RigCost,
            });

            document.title = this.state.WellName + " -Trip Connections"; //Nishant 02/09/2021

        } catch (error) { }
    };

    formateDate = (paramDate: Date) => {
        try {
            let day = paramDate.getDate();
            let mlist = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            let month = mlist[paramDate.getMonth()];
            let year = paramDate.getFullYear();
            let hour = paramDate.getHours();
            let minute = paramDate.getMinutes();
            let seconds = paramDate.getSeconds();

            let strDate =
                day +
                "-" +
                month +
                "-" +
                year +
                " " +
                hour +
                ":" +
                minute +
                ":" +
                seconds;

            return strDate;
        } catch (error) {
            return "";
        }
    };

    loadConnections = () => {
        try {
            $("#loader").show();

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Summary.Manager";
            objBrokerRequest.Broker = "TripConn";
            objBrokerRequest.Function = "TripConnSummary";

            let paramuserid: BrokerParameter = new BrokerParameter("UserId", _gMod._userId);
            objBrokerRequest.Parameters.push(paramuserid);

            let paramwellId: BrokerParameter = new BrokerParameter(
                "WellId",
                this.WellId
            );
            objBrokerRequest.Parameters.push(paramwellId);

            let paramSelectionType: BrokerParameter = new BrokerParameter(
                "SelectionType",
                this.selectionType
            );
            objBrokerRequest.Parameters.push(paramSelectionType);

            let paramFromDate: BrokerParameter = new BrokerParameter(
                "FromDate",
                this.formateDate(this.fromDate)
            );
            objBrokerRequest.Parameters.push(paramFromDate);

            let paramToDate: BrokerParameter = new BrokerParameter(
                "ToDate",
                this.formateDate(this.toDate)
            );
            objBrokerRequest.Parameters.push(paramToDate);

            let paramFromDepth: BrokerParameter = new BrokerParameter(
                "FromDepth",
                this.fromDepth.toString()
            );
            objBrokerRequest.Parameters.push(paramFromDepth);

            let paramToDepth: BrokerParameter = new BrokerParameter(
                "ToDepth",
                this.toDepth.toString()
            );
            objBrokerRequest.Parameters.push(paramToDepth);

            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then((res) => {
                    $("#loader").hide();

                    this.objSummaryData = JSON.parse(res.data.Response);
                //    console.log(this.objSummaryData);
                    
                    

                    this.setData();
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
                    this.setState({ isProcess: false });
                });
        } catch (error) { }
    };

    saveSettings = () => {
        try {
            $("#sloader").show();

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Summary.Manager";
            objBrokerRequest.Broker = "TripConn";
            objBrokerRequest.Function = "SaveUserSettings";

            this.objUserSettings.SkipConnMaxTime = this.state.SkipConnMaxTime;
            this.objUserSettings.MaxConnTime = this.state.MaxConnTime;
            this.objUserSettings.SkipConnMinTime = this.state.SkipConnMinTime;
            this.objUserSettings.MinConnTime = this.state.MinConnTime;
            this.objUserSettings.showExcludedConn = this.state.ShowExcludedConn;
            this.objUserSettings.HighlightDayNight = this.state.HighlightDayNight;
            this.objUserSettings.DayTimeFrom = this.state.DayTimeFrom;
            this.objUserSettings.DayTimeTo = this.state.DayTimeTo;
            this.objUserSettings.STSBenchMark = this.state.STSBenchMark;
            this.objUserSettings.TargetTime = this.state.TargetTime;
            this.objUserSettings.RigCost = this.state.RigCost;

            let paramuserid: BrokerParameter = new BrokerParameter("UserId", _gMod._userId);
            objBrokerRequest.Parameters.push(paramuserid);

            let paramwellId: BrokerParameter = new BrokerParameter(
                "WellId",
                this.WellId
            );
            objBrokerRequest.Parameters.push(paramwellId);

            let paramSettingsData: BrokerParameter = new BrokerParameter(
                "SettingsData",
                JSON.stringify(this.objUserSettings)
            );
            objBrokerRequest.Parameters.push(paramSettingsData);

            axios
                .get(_gMod._performTask, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then((res) => {
                    $("#sloader").hide();

                    this.setState({ selected: 0 });
                    //reload all the connections
                    this.loadConnections();
                })
                .catch((error) => {
                    $("#sloader").hide();

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

    handleSelect = (e: any) => {
        this.setState({ selected: e.selected });
    };

    // selectionChanged = (
    //     pselectedval: string,
    //     pfromDate: Date,
    //     ptoDate: Date,
    //     pfromDepth: number,
    //     ptoDepth: number
    // ) => {
    //     try {
    //         this.selectionType = pselectedval;
    //         this.fromDate = pfromDate;
    //         this.toDate = ptoDate;
    //         this.fromDepth = pfromDepth;
    //         this.toDepth = ptoDepth;

    //         console.log(
    //             "From Date " +
    //             moment(this.fromDate).format("d-MMM-yyyy HH:mm:ss") +
    //             " To Date " +
    //             moment(this.toDate).format("d-MMM-yyyy HH:mm:ss")
    //         );

    //         this.loadConnections();
    //     } catch (error) { }
    // };

    ////Nishant
    selectionChanged = (paramDataSelector: DataSelector_) => {


        this.setState({
            objDataSelector: paramDataSelector,
            isRealTime: false
        });

        this.selectionType = paramDataSelector.selectedval;
        this.fromDate = paramDataSelector.fromDate;
        this.toDate = paramDataSelector.toDate;
        this.fromDepth = paramDataSelector.fromDepth;
        this.toDepth = paramDataSelector.toDepth;
        //this.refreshHrs = paramDataSelector.refreshHrs;
        clearInterval(this.intervalID);

        this.loadConnections();
    }
    radioData = [
        { label: "User Comments", value: "User Comments", className: "" },
        { label: "Time Log Remarks", value: "Time Log Remarks", className: "" },
    ];

    handleSubmit = (dataItem: any) => alert(JSON.stringify(dataItem, null, 2));

    render() {

        return (
            <>
                <div className="row">
                    <div>
                        <label className="summaryTitle">{this.state.WellName}</label>
                    </div>

                    <div id="loader" style={{ marginLeft: "20px", display: "none" }}>
                        <ProcessLoader />
                    </div>
                </div>
                <TabStrip selected={this.state.selected} onSelect={this.handleSelect} keepTabsMounted={true}>
                    <TabStripTab title="Trip Connections Summary">
                        <div style={{ height: "45px", backgroundColor: "transparent" }}>
                            <div
                                style={{
                                    marginTop: "10px",
                                    float: "left",
                                    height: "50px",
                                    padding: "3px",
                                    display: "contents",
                                    backgroundColor: "transparent",
                                }}
                            >
                                <label style={{ marginRight: "20px" }}> View</label>
                                <RadioButton
                                    name="opgView"
                                    value={0}
                                    checked={this.state.CurrentView === 0}
                                    label="Standard"
                                    onChange={() => {
                                        this.setState({ CurrentView: 0 });
                                    }}
                                />
                                <RadioButton
                                    name="opgView1"
                                    value={1}
                                    checked={this.state.CurrentView === 1}
                                    label="Rig State View"
                                    onChange={() => {
                                        this.setState({ CurrentView: 1 });
                                    }}
                                />
                                <RadioButton
                                    name="opgView1"
                                    value={2}
                                    checked={this.state.CurrentView === 2}
                                    label="Cost View"
                                    onChange={() => {
                                        this.setState({ CurrentView: 2 });
                                    }}
                                />
                                <RadioButton
                                    name="opgView2"
                                    value={3}
                                    checked={this.state.CurrentView === 3}
                                    label="Time Distribution"
                                    onChange={() => {
                                        this.setState({ CurrentView: 3 });
                                    }}
                                />
                            </div>
                            {/* vimal */}
                            <div
                                style={{
                                    marginTop: "10px",
                                    marginRight: "50px",
                                    float: "right",
                                    height: "32px",
                                    padding: "3px",
                                }}
                            >
                                <label className="connInfo" style={{ marginRight: "20px" }}>
                                    ({this.state.ConnCount}) Connections
                                </label>
                                <label className="connInfo" style={{ marginRight: "20px" }}>
                                    ({this.state.ExclConnCount}) Excluded Connections
                                </label>
                                <label style={{ marginRight: "20px" }}>Realtime</label>
                                <Switch></Switch>
                            </div>
                        </div>

                        <div
                            id="tripConnections"
                            style={{
                                height: "calc(100vh - 350px)",
                                width: "calc(100vw - 100px)",
                                backgroundColor: "transparent",
                            }}
                        ></div>

                        <div
                            id="tripConnections_legend"
                            style={{
                                textAlign: "center",
                                height: "30px",
                                width: "calc(100vw - 100px)",
                                backgroundColor: "transparent",
                                display: "inline-block",
                            }}
                        ></div>

                        <DataSelector objDataSelector={this.state.objDataSelector} wellID={this.WellId} selectionChanged={this.selectionChanged} ></DataSelector>
                    </TabStripTab>
                    <TabStripTab title="Numeric Summary">
                        <div style={{ marginTop: "10px" }}>
                            <div className="row mb-3">
                                <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                                    <h6 className="summaryGroupHeader">Overall Summary</h6>

                                    <div className="group-inline">
                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Time</label>
                                            <label className="summaryLabel" id="txtAvgTime">
                                                {this.state.AvgTime}
                                            </label>
                                        </div>
                                    </div>
                                    <h6 className="summaryGroupHeader">Day Time Summary</h6>

                                    <div className="group-inline">
                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Time</label>
                                            <label className="summaryLabel" id="txtAvgTimeD">
                                                {this.state.AvgDayTime}
                                            </label>
                                        </div>
                                    </div>

                                    <h6 className="summaryGroupHeader">Night Time Summary</h6>

                                    <div className="group-inline">
                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Time</label>
                                            <label className="summaryLabel" id="txtAvgTimeN">
                                                {this.state.AvgNightTime}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                                    <h6 className="summaryGroupHeader">Cash Flow</h6>
                                    <div className="group-inline">
                                        <div className="form-group">
                                            <label className="summaryLabelHeader-long">
                                                Positive Cash Flow $
                                            </label>
                                            <label className="summaryLabel" id="txtPositiveFlow">
                                                {this.state.PositiveFlow}
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label className="summaryLabelHeader-long">
                                                Negative Cash Flow $
                                            </label>
                                            <label className="summaryLabel" id="txtNegativeFlow">
                                                {this.state.NegativeFlow}
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label className="summaryLabelHeader-long">
                                                Net Cash Flow $
                                            </label>
                                            <label className="summaryLabel" id="txtNetFlow">
                                                {this.state.NetFlow}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <br />

                            <h6 className="summaryGroupHeader">Connection Details</h6>
                            <div
                                className="row mb-3"
                                style={{
                                    backgroundColor: "transparent",
                                    width: "calc(100vw - 120px)",
                                    minHeight: "400px",
                                }}
                            >
                                <Grid
                                    className="Table_Grid"
                                    // style={{
                                    //     max- height: "450px",
                                    //     // height: "450px",
                                    //     width: "90%",
                                    // }}
                                    data={
                                        this.state.summaryData != null
                                            ? this.state.summaryData.map((item: any) => ({
                                                ...item,
                                                selected: item.DEPTH === this.state.currentDepth,
                                            }))
                                            : null
                                    }
                                    resizable={true}
                                    sortable={true}
                                    //onRowClick={this.grdNumSummaryRowClick}
                                    editField="inEdit"
                                    selectedField="selected"
                                >
                                    <Column
                                        field="DEPTH"
                                        headerClassName="text-center"
                                        className="text-right"
                                        title="Depth"
                                        width="90px"
                                    />
                                    <Column
                                        field="SLIPS_TO_SLIPS"
                                        headerClassName="text-center"
                                        className="text-left"
                                        title="STS(Minutes)"
                                        width="90px"
                                        cell={(props) => (
                                            <td className="text-right" style={{}}>
                                                <span>
                                                    {" "}
                                                    {formatNumber(
                                                        props.dataItem.SLIPS_TO_SLIPS,
                                                        "n2"
                                                    )}{" "}
                                                </span>
                                            </td>
                                        )}
                                    />
                                    <Column
                                        field="COMMENTS"
                                        headerClassName="text-center"
                                        className="text-left"
                                        title="Comments"
                                        width="90px"
                                    />
                                    <Column
                                        field="TOTAL_TIME"
                                        headerClassName="text-center"
                                        className="text-right"
                                        title="Total Time (HH:MM:SS)"
                                        //format="n2"
                                        width="150px"
                                    />
                                    <Column
                                        field="REMARKS"
                                        headerClassName="text-center"
                                        className="text-left"
                                        title="Remarks"
                                        width="90px"
                                    />
                                    {/* <Column
                                        field="DAY_NIGHT"
                                        headerClassName="text-center"
                                        className="text-left"
                                        title="Day Night"
                                        width="90px"
                                    /> */}
                                    <Column
                                        field="DayNightICO"
                                        title="Day Night"
                                        width="90px"
                                        className="text-center"
                                        headerClassName="text-center"
                                        cell={(props) => (
                                            <td className="text-center" style={{}}>
                                                <span >
                                                    {props.dataItem["DAY_NIGHT"] == "N" ? <FontAwesomeIcon icon={faMoon}></FontAwesomeIcon> : <FontAwesomeIcon style={{ color: "yellow" }} icon={faSun}></FontAwesomeIcon>}
                                                </span>
                                            </td>
                                        )}

                                    >

                                    </Column>
                                    <Column
                                        field="FROM_DATE"
                                        headerClassName="text-center"
                                        className="text-left"
                                        title="Start Time"
                                        width="150px"
                                        cell={(props) => (
                                            <td className="text-right">
                                                {
                                                    <Moment_
                                                        date={props.dataItem.FROM_DATE}
                                                        format="MMM-DD-yyyy HH:MM:ss"
                                                    >
                                                        {" "}
                                                    </Moment_>
                                                }
                                            </td>
                                        )}
                                    />

                                    <Column
                                        //vimal
                                        field="COST"
                                        headerClassName="text-center"
                                        className="text-right"
                                        title="Cost"
                                        width="90px"
                                        cell={(props) => (
                                            <td className="text-right" style={{}}>
                                                <span> {formatNumber(props.dataItem.COST, "n2")} </span>
                                            </td>
                                        )}
                                    />
                                    <Column
                                        field="TARGET_COST"
                                        headerClassName="text-center"
                                        className="text-right"
                                        title="Target Cost"
                                        width="90px"
                                    />
                                    <Column
                                        //vimal
                                        field="DIFF"
                                        headerClassName="text-center"
                                        className="text-right"
                                        title="Diff"
                                        width="90px"
                                        cell={(props) => (
                                            <td className="text-right" style={{}}>
                                                <span> {formatNumber(props.dataItem.DIFF, "n2")} </span>
                                            </td>
                                        )}
                                    />
                                </Grid>
                            </div>
                        </div>
                    </TabStripTab>

                    <TabStripTab title="Settings">
                        <div style={{ marginTop: "10px" }}>
                            <div className="row mb-3">
                                <div className="col-lg-12">
                                    <h6 className="summaryGroupHeader">Plot Settings</h6>
                                </div>
                            </div>

                            <div className="clearfix"></div>
                            <div className="row mb-3">
                                <div className="col-lg-12">
                                    <Checkbox
                                        className="mr-2"
                                        label={"Show Comments"}
                                        checked={this.state.ShowComments}
                                        onChange={(event) => {
                                            this.setState({ ShowComments: event.value });
                                        }}
                                    />

                                    <Checkbox
                                        className="mr-2 leftPadding"
                                        label={"Show Excluded Connections"}
                                        checked={this.state.ShowExcludedConn}
                                        onChange={(event) => {
                                            this.setState({ ShowExcludedConn: event.value });
                                        }}
                                    />
                                </div>

                                <div className="col-lg-12">
                                    <Checkbox
                                        className="mr-2"
                                        label={"Skip connection having more time than"}
                                        checked={this.state.SkipConnMaxTime}
                                        onChange={(event) => {
                                            this.setState({ SkipConnMaxTime: event.value });
                                        }}
                                    />
                                    <span className="mr-2">
                                        <NumericTextBox
                                            value={this.state.MaxConnTime}
                                            format="n2"
                                            width="100px"
                                            onChange={(event) => {
                                                this.setState({ MaxConnTime: event.target.value });
                                            }}
                                        />
                                        <label className="leftPadding-small">minutes</label>
                                    </span>
                                </div>

                                <div className="col-lg-12">
                                    <Checkbox
                                        className="mr-2"
                                        label={"Skip connection having less time than"}
                                        checked={this.state.SkipConnMinTime}
                                        onChange={(event) => {
                                            this.setState({ SkipConnMinTime: event.value });
                                        }}
                                    />
                                    <span className="mr-2">
                                        <NumericTextBox
                                            value={this.state.MinConnTime}
                                            format="n2"
                                            width="100px"
                                            onChange={(event) => {
                                                this.setState({ MinConnTime: event.target.value });
                                            }}
                                        />
                                        <label className="leftPadding-small">minutes</label>
                                    </span>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-lg-12">
                                    <Checkbox
                                        className="mr-2"
                                        label={"Hightlight Day & Night Connections"}
                                        checked={this.state.HighlightDayNight}
                                        onChange={(event) => {
                                            this.setState({ HighlightDayNight: event.value });
                                        }}
                                    />
                                    <span>DayTime Hours from</span>
                                    <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                                        <MaskedTextBox
                                            mask="00:00"
                                            width="50px"
                                            value={this.state.DayTimeFrom}
                                            onChange={(event) => {
                                                this.setState({ DayTimeFrom: event.target.value });
                                            }}
                                        />
                                        To
                                    </span>
                                    <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                                        <MaskedTextBox
                                            mask="00:00"
                                            width="50px"
                                            value={this.state.DayTimeTo}
                                            onChange={(event) => {
                                                this.setState({ DayTimeTo: event.target.value });
                                            }}
                                        />
                                        HH: MM
                                    </span>
                                </div>
                            </div>
                            <div className="clearfix"></div>

                            <br />

                            <div className="row">
                                <div className="col-lg-12">
                                    <h6 className="mb-3 summaryGroupHeader">Benchmarks </h6>
                                </div>
                            </div>
                            <div className="clearfix"></div>
                            <div className="row">
                                <div className="col-lg-6">
                                    <br />
                                    <label className="summaryLabelHeader-long">
                                        Slips to Slip Time
                                    </label>
                                    <span>
                                        <NumericTextBox
                                            format="n2"
                                            width="100px"
                                            value={this.state.STSBenchMark}
                                            onChange={(event) => {
                                                this.setState({ STSBenchMark: event.target.value });
                                            }}
                                        />
                                        minutes
                                    </span>

                                    <br />
                                </div>
                                <div className="col-lg-6">
                                    <label className="summaryLabelHeader-long">
                                        Target Conn. Time
                                    </label>
                                    <span className="mr-3">
                                        <NumericTextBox
                                            format="n2"
                                            width="100px"
                                            value={this.state.TargetTime}
                                            onChange={(event) => {
                                                this.setState({ TargetTime: event.target.value });
                                            }}
                                        />
                                        minutes
                                    </span>
                                    <br />
                                    <label className="summaryLabelHeader-long">
                                        Rig Cost/Day $
                                    </label>
                                    <span>
                                        <NumericTextBox
                                            format="n2"
                                            width="100px"
                                            value={this.state.RigCost}
                                            onChange={(event) => {
                                                this.setState({ RigCost: event.target.value });
                                            }}
                                        />
                                    </span>

                                    <br />
                                    <br />
                                    <span>
                                        {/* <Button>Copy benchmarks from well header</Button> */}
                                    </span>
                                </div>
                            </div>

                            <br />
                            <br />

                            <div className="row">
                                <div className="col-lg-6">
                                    <Button
                                        id="cmdApplySettings"
                                        onClick={() => {
                                            this.saveSettings();
                                        }}
                                    >
                                        Apply
                                    </Button>
                                    <div
                                        id="sloader"
                                        style={{ marginLeft: "20px", display: "none" }}
                                    >
                                        <ProcessLoader />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabStripTab>
                </TabStrip>
            </>
        );
    }

    refreshChart = () => {
        try {
            if (this.state.selected != 0) {
                return;
            }

            this.objChart.initialize();

            if (this.state.CurrentView == 0) {
                this.plotChartRegular();
            }

            if (this.state.CurrentView == 1) {
                this.plotChartRigStateView();
            }

            if (this.state.CurrentView == 2) {
                this.plotChartCostView();
            }

            if (this.state.CurrentView == 3) {
                this.plotChartHistogram();
            }
        } catch (error) { }
    };

    //This method redraws the chart for regular view,
    plotChartRegular = () => {
        try {
            //Clear all the series

            this.objChart.DataSeries.clear();
            this.objChart.updateChart();

            //Configure Axes
            this.objChart.leftAxis().Inverted = false;
            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().Title = "Time (m)";
            this.objChart.leftAxis().ShowSelector = false;
            this.objChart.leftAxis().Visible = true;
            this.objChart.leftAxis().ShowLabels = true;
            this.objChart.leftAxis().ShowTitle = true;

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().Title = "Depth";
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowSelector = false;
            this.objChart.bottomAxis().LabelStyle = axisLabelStyle.labels;
            this.objChart.bottomAxis().IsDateTime = true;
            this.objChart.bottomAxis().bandScale = true;

            this.objChart.rightAxis().ShowLabels = true;
            this.objChart.rightAxis().ShowTitle = true;
            this.objChart.rightAxis().Visible = true;
            this.objChart.rightAxis().AutoScale = true;
            this.objChart.rightAxis().Title = "Cost";
            this.objChart.rightAxis().Inverted = false;

            //Add new serieses

            let objSTS = new DataSeries();
            objSTS.Id = "STS";
            objSTS.Stacked = true;
            objSTS.Title = "Slips To Slips";
            objSTS.Type = dataSeriesType.Bar;
            objSTS.Color = "#00E676";//ffc93c
            objSTS.XAxisId = this.objChart.bottomAxis().Id;
            objSTS.YAxisId = this.objChart.leftAxis().Id;
            objSTS.ColorEach = true;
            this.objChart.DataSeries.set(objSTS.Id, objSTS);

            let objCost = new DataSeries();
            objCost.Id = "Cost";
            objCost.Title = "Cost";
            objCost.Type = dataSeriesType.Line;
            objCost.Color = "#D500F9";//ce2e6c
            objCost.XAxisId = this.objChart.bottomAxis().Id;
            objCost.YAxisId = this.objChart.rightAxis().Id;
            objCost.LineWidth = 3;
            this.objChart.DataSeries.set(objCost.Id, objCost);

            this.objChart.bottomAxis().Labels = [];

            //Fill up the data for data series
            for (let i = 0; i < this.objSummaryData.connData.length; i++) {
                let Depth: number = this.objSummaryData.connData[i]["DEPTH"];

                this.objChart.bottomAxis().Labels.push(Depth.toString());

                let objSTSPoint = new ChartData();
                objSTSPoint.datetime = new Date(
                    Date.parse(this.objSummaryData.connData[i]["FROM_DATE"])
                );
                objSTSPoint.y = this.objSummaryData.connData[i]["SLIPS_TO_SLIPS"];

                if (this.state.HighlightDayNight) {
                    if (this.objSummaryData.connData[i]["DAY_NIGHT"] == "D") {
                        objSTSPoint.color = "#00E676";//ffc93c
                    } else {
                        objSTSPoint.color = "#bcbab8";
                    }
                } else {
                    objSTSPoint.color = "#00E676";//ffc93c
                }

                objSTS.Data.push(objSTSPoint);

                let objCostPoint = new ChartData();
                objCostPoint.datetime = new Date(
                    Date.parse(this.objSummaryData.connData[i]["FROM_DATE"])
                );
                objCostPoint.y = this.objSummaryData.connData[i]["COST"];
                objCost.Data.push(objCostPoint);
            }

            this.objChart.reDraw();
        } catch (error) { }
    };

    plotChartCostView = () => {
        try {
            //Clear all the series

            this.objChart.DataSeries.clear();
            this.objChart.updateChart();

            //Configure Axes
            this.objChart.leftAxis().Inverted = false;
            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().Title = "Cost Diff";
            this.objChart.leftAxis().ShowSelector = false;

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().Title = "Depth";
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowSelector = false;
            this.objChart.bottomAxis().IsDateTime = true;
            this.objChart.bottomAxis().bandScale = true;
            this.objChart.bottomAxis().LabelStyle = axisLabelStyle.labels;

            this.objChart.rightAxis().ShowLabels = false;
            this.objChart.rightAxis().ShowTitle = false;
            this.objChart.rightAxis().Visible = false;
            this.objChart.rightAxis().ShowLabels = false;
            this.objChart.rightAxis().ShowTitle = false;
            this.objChart.rightAxis().Title = "Cost";
            this.objChart.rightAxis().Inverted = true;

            //Add new serieses

            let objCost = new DataSeries();
            objCost.Id = "Cost";
            objCost.Stacked = true;
            objCost.Title = "Cost";
            objCost.Type = dataSeriesType.Bar;
            objCost.Color = "#1089ff";
            objCost.XAxisId = this.objChart.bottomAxis().Id;
            objCost.YAxisId = this.objChart.leftAxis().Id;
            objCost.ColorEach = true;
            this.objChart.DataSeries.set(objCost.Id, objCost);

            this.objChart.bottomAxis().Labels = [];

            //Fill up the data for data series
            for (let i = 0; i < this.objSummaryData.connData.length; i++) {
                let Depth: number = this.objSummaryData.connData[i]["DEPTH"];

                this.objChart.bottomAxis().Labels.push(Depth.toString());

                let objPoint = new ChartData();
                objPoint.datetime = new Date(
                    Date.parse(this.objSummaryData.connData[i]["FROM_DATE"])
                );
                objPoint.y = this.objSummaryData.connData[i]["DIFF"];

                if (objPoint.y >= 0) {
                    objPoint.color = "#79d70f";
                } else {
                    objPoint.color = "#d32626";
                }

                objCost.Data.push(objPoint);
            }

            this.objChart.reDraw();
        } catch (error) { }
    };

    //This method redraws the chart for rig state view,
    plotChartRigStateView = () => {
        try {
            if (this.state.selected != 0) {
                return;
            }

            //Clear all the series

            this.objChart.DataSeries.clear();
            //this.objChart.updateChart();

            //Configure Axes
            this.objChart.leftAxis().Inverted = false;
            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().Title = "Time (m)";
            this.objChart.leftAxis().ShowSelector = false;

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().Title = "Depth";
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowSelector = false;
            this.objChart.bottomAxis().bandScale = true;
            this.objChart.bottomAxis().IsDateTime = true;
            this.objChart.bottomAxis().LabelStyle = axisLabelStyle.labels;

            this.objChart.rightAxis().Visible = true;
            this.objChart.rightAxis().ShowLabels = true;
            this.objChart.rightAxis().ShowTitle = true;
            this.objChart.rightAxis().AutoScale = true;
            this.objChart.rightAxis().Title = "Cost";
            this.objChart.rightAxis().Inverted = false;

            //Create series for each rig state
            for (let i = 0; i < this.objSummaryData.rigStates.length; i++) {
                let objSeries = new DataSeries();
                objSeries.Id = this.objSummaryData.rigStates[i]["RIG_STATE"].toString();
                objSeries.Stacked = true;
                objSeries.Title = this.objSummaryData.rigStates[i][
                    "RIG_STATE_NAME"
                ].toString();
                objSeries.Type = dataSeriesType.Bar;
                objSeries.Color = this.objSummaryData.rigStates[i]["COLOR"].toString();
                objSeries.XAxisId = this.objChart.bottomAxis().Id;
                objSeries.YAxisId = this.objChart.leftAxis().Id;
                this.objChart.DataSeries.set(objSeries.Id, objSeries);
            }

            //Fill up the data for each series
            for (let i = 0; i < this.objSummaryData.rigStateData.length; i++) {
                let arrRigStates: string[] = this.objSummaryData.rigStateData[i][
                    "TIMES"
                ]
                    .toString()
                    .split(",");

                for (let j = 0; j < this.objSummaryData.rigStates.length; j++) {
                    let lnRigState: number = this.objSummaryData.rigStates[j][
                        "RIG_STATE"
                    ];

                    //Find the series with this rig state
                    let objSeries: DataSeries = this.objChart.DataSeries.get(
                        lnRigState.toString()
                    );

                    if (objSeries != undefined) {
                        let objDataPoint = new ChartData();
                        objDataPoint.datetime = new Date(
                            Date.parse(this.objSummaryData.rigStateData[i]["FROM_DATE"])
                        );
                        objDataPoint.y = Number.parseFloat(arrRigStates[j]);
                        objSeries.Data.push(objDataPoint);
                    }
                }
            }

            this.objChart.bottomAxis().Labels = [];

            //Fill up the data for data series
            for (let i = 0; i < this.objSummaryData.connData.length; i++) {
                let Depth: number = this.objSummaryData.connData[i]["DEPTH"];
                this.objChart.bottomAxis().Labels.push(Depth.toString());
            }

            let objCost = new DataSeries();
            objCost.Id = "Cost";
            objCost.Title = "Cost";
            objCost.Type = dataSeriesType.Line;
            objCost.Color = "#ce2e6c";
            objCost.XAxisId = this.objChart.bottomAxis().Id;
            objCost.YAxisId = this.objChart.rightAxis().Id;
            objCost.LineWidth = 3;

            this.objChart.DataSeries.set(objCost.Id, objCost);

            //Fill up the data for data series
            for (let i = 0; i < this.objSummaryData.connData.length; i++) {
                let objCostPoint = new ChartData();
                objCostPoint.datetime = new Date(
                    Date.parse(this.objSummaryData.connData[i]["FROM_DATE"])
                );
                objCostPoint.y = this.objSummaryData.connData[i]["COST"];
                objCost.Data.push(objCostPoint);
            }

            this.objChart.reDraw();
        } catch (error) { }
    };

    plotChartHistogram = () => {
        try {
            //Clear all the series

            this.objChart.DataSeries.clear();
            this.objChart.updateChart();

            //Configure Axes
            this.objChart.leftAxis().Inverted = false;
            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().Title = "Time (m)";
            this.objChart.leftAxis().ShowSelector = false;

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().Title = "No. of Connections";
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowSelector = false;
            this.objChart.bottomAxis().IsDateTime = false;
            this.objChart.bottomAxis().bandScale = true;
            this.objChart.bottomAxis().LabelStyle = axisLabelStyle.values;

            this.objChart.rightAxis().ShowLabels = false;
            this.objChart.rightAxis().ShowTitle = false;
            this.objChart.rightAxis().Visible = false;
            this.objChart.rightAxis().Title = "Cost";
            this.objChart.rightAxis().Inverted = false;

            //Add new serieses

            let objHistogram = new DataSeries();
            objHistogram.Id = "Histogram";
            objHistogram.Stacked = true;
            objHistogram.Title = "Connection Histogram";
            objHistogram.Type = dataSeriesType.Bar;
            objHistogram.Color = "#cf7500";
            objHistogram.XAxisId = this.objChart.bottomAxis().Id;
            objHistogram.YAxisId = this.objChart.leftAxis().Id;
            this.objChart.DataSeries.set(objHistogram.Id, objHistogram);

            //Fill up the data for data series
            this.objSummaryData.histogramData = Object.values(
                this.objSummaryData.histogramData
            ).sort((a: any, b: any) => (a.X < b.X ? -1 : a.X > b.X ? 1 : 0));
            for (let i = 0; i < this.objSummaryData.histogramData.length; i++) {
                let objPoint = new ChartData();
                objPoint.x = this.objSummaryData.histogramData[i]["X"];
                objPoint.y = this.objSummaryData.histogramData[i]["Y"];

                objHistogram.Data.push(objPoint);
            }

            this.objChart.reDraw();
        } catch (error) { }
    };

    onBeforeDrawSeries = (e: ChartEventArgs, i: number) => {
        try {
            d3.select(".sts_benchmark").remove();
            d3.select(".trip_highlight").remove();

            if (this.state.CurrentView == 0 || this.state.CurrentView == 1) {
                let lnBenchMark = this.objUserSettings.STSBenchMark;

                if (lnBenchMark > 0) {
                    let x1 = this.objChart.__chartRect.left;
                    let x2 = this.objChart.__chartRect.right;
                    let y1 = this.objChart.leftAxis().ScaleRef(lnBenchMark);
                    let y2 = y1 + 4;

                    this.objChart.SVGRef.append("g")
                        .attr("class", "sts_benchmark")
                        .append("rect")
                        .attr("id", "sts_benchmark")
                        .attr("x", x1)
                        .attr("y", y1)
                        .attr("width", x2 - x1)
                        .attr("height", y2 - y1)
                        .style("fill", "red")
                        .style("opacity", 0.5);
                }

                //Highlight Trip Directions
                for (let i = 0; i < this.objSummaryData.tripInfoData.length; i++) {
                    let fromDate = new Date(
                        Date.parse(this.objSummaryData.tripInfoData[i]["FROM_DATE"])
                    );
                    let toDate = new Date(
                        Date.parse(this.objSummaryData.tripInfoData[i]["TO_DATE"])
                    );

                    let x1 = this.objChart.bottomAxis().ScaleRef(fromDate);
                    let x2 = this.objChart.bottomAxis().ScaleRef(toDate);
                    let y1 = this.objChart.__chartRect.top;
                    let y2 = this.objChart.__chartRect.bottom;

                    let tripDirection: Number = this.objSummaryData.tripInfoData[i][
                        "DIRECTION"
                    ];
                    let tripColor: string = "grey";

                    if (tripDirection == 0) {
                        tripColor = "grey";
                    } else {
                        tripColor = "lightgreen";
                    }

                    this.objChart.SVGRef.append("g")
                        .attr("class", "trip_highlight")
                        .append("rect")
                        .attr("id", "trip_highlight")
                        .attr("x", x1)
                        .attr("y", y1)
                        .attr("width", x2 - x1)
                        .attr("height", y2 - y1)
                        .style("fill", tripColor)
                        .style("opacity", 0.1);
                }
            }
        } catch (error) { }
    };
}

export default TripConnSummary;
