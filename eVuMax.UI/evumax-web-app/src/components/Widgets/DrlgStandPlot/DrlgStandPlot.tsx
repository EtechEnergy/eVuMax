import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import GlobalMod from "../../../objects/global"
import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Util } from "../../../Models/eVuMax";
import NotifyMe from 'react-notification-timeline';
import DataSelector_ from "../../Common/DataSelector_";
import DrlgStandUserSettings, { eNumSelectionType } from "./DrlgStandUserSettings";
import { Chart, lineStyle, curveStyle } from "../../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";


import { formatNumber, parseDate } from "@telerik/kendo-intl";

import DataSelector from "../../Common/DataSelector";
import DataSelectorOriginal from "../../Common/DataSelectorOriginal";
//import { Moment } from "moment";
import moment from "moment";
import {
    DataSeries,
    dataSeriesType,
} from "../../../eVuMaxObjects/Chart/DataSeries";
import "@progress/kendo-react-layout";
import { MaskedTextBox, Checkbox, Switch, RadioButton, SwitchChangeEvent } from "@progress/kendo-react-inputs";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Button, TabStrip, TabStripTab, TimePicker } from "@progress/kendo-react-all";

import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";


import { faMoon, faSearchMinus, faSun } from "@fortawesome/free-solid-svg-icons";
//import { confirmAlert } from "react-confirm-(alert)";
//import { ClientLogger } from "../../ClientLogger/ClientLogger";
import DataSelectorInfo from "../../Common/DataSelectorInfo";
import { sPlotSelectionType } from "../CustomDrillingSummary/CustomDataSelector";
import * as utilFunc from "../../../utilFunctions/utilFunctions";
import { debug } from "console";


let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("null", "null");

export default class DrlgStandPlot extends React.Component {

    intervalID: NodeJS.Timeout | undefined;
    WellID: string = "";
    objChart: Chart;
    //  objLogger: ClientLogger = new ClientLogger("DrlgStandPlot", _gMod._userId);


    constructor(props: any) {
        super(props);
        this.WellID = props.match.params.WellId;
    }


    AxiosSource = axios.CancelToken.source();



    state = {
        ExclConnCount: 0,
        ConnCount: 0,
        warningMsg: [],
        objDrlgStandUserSettings: new DrlgStandUserSettings(),
        objPlotData: {} as any,
        objDataSelector: new DataSelector_(),
        realTime: false,
        CurrentView: 0,
        objGridData: [] as any,
        selectedTab: 0,
        refreshDataSelector: false

    }

    componentWillUnmount() {

        this.AxiosSource.cancel();
        clearInterval(this.intervalID);
        this.intervalID = null;
    }


    componentWillUpdate() {
        _gMod = new GlobalMod();
        if (_gMod._userId == "" || _gMod._userId == undefined) {
            window.location.href = "/evumaxapp/";
            return;
        }
    }

    async componentDidMount() {
        try {

            //initialize chart
            this.objChart = new Chart(this, "DrlgStandPlotChart");
            this.objChart.ContainerId = "DrlgStandPlotChart";

            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().Min = 0;
            this.objChart.leftAxis().Max = 100;
            this.objChart.leftAxis().Inverted = false;
            this.objChart.leftAxis().ShowLabels = true;
            this.objChart.leftAxis().ShowTitle = true;
            this.objChart.leftAxis().Title = "Time (min.)";
            this.objChart.leftAxis().DisplayOrder = 1;
            this.objChart.leftAxis().Visible = true;

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().bandScale = true; //prath
            this.objChart.bottomAxis().Min = 100;
            this.objChart.bottomAxis().Max = 200;
            this.objChart.bottomAxis().Title = "Depth (ft)";
            this.objChart.bottomAxis().ShowLabels = true;
            this.objChart.bottomAxis().ShowTitle = true;
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowSelector = true;
            this.objChart.bottomAxis().IsDateTime = false;
            this.objChart.bottomAxis().Visible = true;

            // this.objChart.rightAxis().Visible = true;

            this.objChart.MarginLeft = 0; //10;
            this.objChart.MarginBottom = 0; //40;
            this.objChart.MarginTop = 0; //10;
            this.objChart.MarginRight = 0; // 10;

            this.objChart.initialize();
            this.objChart.reDraw();

            window.addEventListener("resize", this.refreshChart);


            //RealTime 
            let isRealtimeRunning = sessionStorage.getItem("realTimeDrlgStandPlot"); //set in toggel realtime switch change event
            if (isRealtimeRunning == "true") {
                await this.setState({ realTime: !this.state.realTime });
                this.intervalID = setInterval(this.loadDrlgStandPlotData.bind(this), 15000);
            }
            //==============

            this.loadDrlgStandPlotData();

        } catch (error) { }
    }

    disableRealTime = () => {
        try {
            if (this.state.realTime) {
                this.setState({
                    realTime: false
                });
                sessionStorage.setItem("realTimeDrlgStandPlot", "false");
                this.AxiosSource.cancel();
                clearInterval(this.intervalID);
                this.intervalID = null;
            }

        } catch (error) {

        }
    }

    selectionChanged = async (paramDataSelector: DataSelector_, paramRefreshHrs: boolean = false) => {


        let realtimeStatus: boolean = paramRefreshHrs;

        //Added on 02-02-2022
        paramDataSelector.needForceReload = true;


        await this.setState({
            objDataSelector: paramDataSelector,
            realTime: realtimeStatus
        });

        // this.selectionType = paramDataSelector.selectedval;
        // this.fromDate = new Date(paramDataSelector.fromDate);
        // this.toDate = new Date(paramDataSelector.toDate);
        // this.fromDepth = paramDataSelector.fromDepth;
        // this.toDepth = paramDataSelector.toDepth;
        // this.refreshHrs = paramDataSelector.refreshHrs;

        // let objUserSettings: DataSelector_ = new DataSelector_();
        // objUserSettings.selectedval = paramDataSelector.selectedval;

        // objUserSettings.fromDate = new Date(paramDataSelector.fromDate);
        // objUserSettings.toDate = new Date(paramDataSelector.toDate);
        // objUserSettings.fromDepth = paramDataSelector.fromDepth;
        // objUserSettings.toDepth = paramDataSelector.toDepth;
        // objUserSettings.refreshHrs = paramDataSelector.refreshHrs;



        this.saveSettings();

        if (this.state.realTime) {

            this.intervalID = setInterval(this.loadDrlgStandPlotData.bind(this), 15000);
        } else {

            this.AxiosSource.cancel();
            await clearInterval(this.intervalID);
            this.intervalID = null;
            // this.loadDrlgStandPlotData();
        }


    }

    formatDateHHMMSS = (FromDate: string, ToDate: string) => {



        // let hrs : number  =parseInt(moment.duration(moment(new Date(ToDate)).diff(moment(new Date(FromDate)))).asHours().toString());

        // let min :number =  parseInt(moment.duration(moment(new Date(ToDate)).diff(moment(new Date(FromDate)))).asMinutes().toString());

        //  min = min - (hrs*60);
        //  let ss :number = parseInt(moment.duration(moment(new Date(ToDate)).diff(moment(new Date(FromDate)))).asSeconds().toString());

        //   ss = ss - (hrs*60*60) - (min*60);



        let now = ToDate;
        let then = FromDate;
        let diff = moment.duration(moment(now).diff(moment(then)));
        return "[" + diff.hours().toString().trim() + ":" + diff.minutes().toString().trim() + ":" + diff.seconds().toString().trim() + "]";

        // let days = parseInt(diff.asDays()); //84

        // var hours = parseInt(diff.asHours()); //2039 hours, but it gives total hours in given miliseconds which is not expacted.

        // hours = hours - days*24;  // 23 hours

        // var minutes = parseInt(diff.asMinutes()); //122360 minutes,but it gives total minutes in given miliseconds which is not expacted.

        // minutes = minutes - (days*24*60 + hours*60); //20 minutes.

        //return "["+hrs+" : "+ min + " : " + ss +"]";



    }

    handleToggleSwitch = async () => {

        await this.setState({ realTime: !this.state.realTime });
        if (this.state.realTime) {
            //Added on 02-02-2022
            this.state.objDataSelector.needForceReload = false;

            let objUserDataSettings: DrlgStandUserSettings = this.state.objDrlgStandUserSettings;
            objUserDataSettings.SelectionType = sPlotSelectionType.ByHours;
            let objDataSelector_: DataSelector_ = this.state.objDataSelector;
            objDataSelector_.selectedval = "2"; //"-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"

            this.setState({
                objDrlgStandUserSettings: objUserDataSettings,
                objDataSelector: objDataSelector_
            });

            this.intervalID = setInterval(this.loadDrlgStandPlotData.bind(this), 15000);
        } else {

            this.AxiosSource.cancel();
            clearInterval(this.intervalID);
            this.intervalID = null;
        }

        sessionStorage.setItem("realTimeDrlgStandPlot", this.state.realTime.toString());
    };



    initializeChart = () => {
        try {

            this.objChart.initialize();


        } catch (error) {

        }
    }

    getUniqueRigStates = () => {


        let uniqueRigStateList: Map<number, number> = new Map();
        //objStandProcessor.connectionPoints.length
        //RigStates

        //sort array on depth
        let connPoints: any = Object.values(this.state.objPlotData.objStandProcessor.connectionPoints);
        connPoints.sort(function (a, b) {
            return a.Depth - b.Depth;
        });

        for (let i = 0; i < connPoints.length; i++) {
            for (let j = 0; j < connPoints.RigStates.length; j++) {
                if (uniqueRigStateList.get(connPoints.RigStates[j]) == null) {

                }
            }
        }



        //    For i As Integer = 0 To arrItems.Length - 1

        //        For Each lnKey As Integer In arrItems(i).RigStates.Keys

        //            If Not uniqueRigStateList.ContainsKey(lnKey) Then
        //                uniqueRigStateList.Add(lnKey, lnKey)
        //            End If
        //        Next

        //    Next
    }

    plotChartRigStateView = () => {
        //Clear all the series

        this.objChart.DataSeries.clear();
        this.objChart.ShowLegend = true;
        this.objChart.updateChart();
        // this.objChart.ShowCustomComments = this.state.ShowComments;

        //Configure Axes
        this.objChart.leftAxis().Inverted = false;
        this.objChart.leftAxis().AutoScale = true;
        this.objChart.leftAxis().Title = "Time (Hours)";
        this.objChart.leftAxis().ShowSelector = false;
        this.objChart.leftAxis().ShowTitle = true;
        this.objChart.leftAxis().Visible = true;

        this.objChart.bottomAxis().AutoScale = true;
        this.objChart.bottomAxis().Title = "Measured Depth" + "(" + this.state.objPlotData.DepthUnit + ")";
        this.objChart.bottomAxis().LabelAngel = 90;
        this.objChart.bottomAxis().ShowSelector = false;
        this.objChart.bottomAxis().ShowTitle = true;
        this.objChart.bottomAxis().Visible = true;

        let objRigStateList: any = Object.values(this.state.objPlotData.objRigSate.rigStates);


        //sort array on depth
        let connPoints: any = Object.values(this.state.objPlotData.objStandProcessor.connectionPoints);
        //let connPoints: any =   Object.values(this.state.objPlotData.grdConnection);
        connPoints.sort(function (a, b) {
            return a.Depth - b.Depth;
        });
        let chartData = connPoints;

        // //Create series for each rig state
        for (let index = 0; index < chartData.length; index++) {
            const rigStates: any = chartData[index].RigStates;
            let KeyArr = Object.keys(rigStates);
            for (let index2 = 0; index2 < KeyArr.length; index2++) {
                let key = KeyArr[index2];

                //Find the series with this rig state
                let objSeries: DataSeries = this.objChart.DataSeries.get(key.toString());

                //let objSeries = new DataSeries();
                if (objSeries == undefined) {
                    objSeries = new DataSeries();
                    objSeries.Id = key
                    objSeries.Stacked = true;
                    objSeries.Type = dataSeriesType.Bar;
                    objSeries.ColorEach = true;
                    let foundIndex = objRigStateList.findIndex((el: any) => el.Number === Number.parseFloat(key));
                    if (foundIndex > -1) {
                        // Color: -16711936
                        // Name: "Rotary Drill"
                        // Number: 0


                        objSeries.Color = utilFunc.intToColor(objRigStateList[foundIndex].Color);
                        objSeries.Title = objRigStateList[foundIndex].Name
                    }
                    objSeries.XAxisId = this.objChart.bottomAxis().Id;
                    objSeries.YAxisId = this.objChart.leftAxis().Id;
                    this.objChart.DataSeries.set(objSeries.Id, objSeries);
                }

            }



        }



        // //Fill up the data for each series
        let standTime: number = 0;
        for (let index = 0; index < chartData.length; index++) {

            ////Find the series with this rig state
            const rigStates: any = chartData[index].RigStates;
            let KeyArr = Object.keys(rigStates);
            for (let index2 = 0; index2 < KeyArr.length; index2++) {
                let key = KeyArr[index2];
                //Find the series with this rig state
                let objSeries: DataSeries = this.objChart.DataSeries.get(key.toString());
                if (objSeries != undefined) {
                    let objDataPoint = new ChartData();
                    objDataPoint.x = Math.round(chartData[index].Depth);


                    objDataPoint.y = Number.parseFloat((rigStates[key] / 60 / 60).toPrecision(3));
                    objDataPoint.color = objSeries.Color;
                    
                    let Comments: string = "";
                    let grdConnection_: any = Object.values(this.state.objPlotData.grdConnection);
                    debugger;
                    let foundIndex = grdConnection_.findIndex((el: any) => Math.round(Number.parseFloat(el.Depth)) === Math.round(chartData[index].Depth));
                    if (foundIndex > -1) {
                        Comments = grdConnection_[foundIndex].Comments;
                    }

                    objDataPoint.label = Comments;

                    objSeries.Data.push(objDataPoint);

                }
            }
        }
        this.objChart.reDraw();

    }

    plotRegularChart = () => {
        try {
            //Clear all the series

            this.objChart.DataSeries.clear();
            this.objChart.ShowLegend = true;
            this.objChart.updateChart();
            this.objChart.ShowCustomComments = this.state.objDrlgStandUserSettings.ShowComments;
            // this.objChart.ShowCustomComments = this.state.ShowComments;

            //Configure Axes
            this.objChart.leftAxis().Inverted = false;
            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().Title = "Time (Hours)";
            this.objChart.leftAxis().ShowSelector = false;
            this.objChart.leftAxis().ShowTitle = true;
            this.objChart.leftAxis().Visible = true;

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().Title = "Measured Depth" + "(" + this.state.objPlotData.DepthUnit + ")";
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowSelector = false;
            this.objChart.bottomAxis().ShowTitle = true;
            this.objChart.bottomAxis().Visible = true;



            //Add new serieses
            let objOffsetWellBar = new DataSeries();

            objOffsetWellBar.Id = "OffsetWellBar1";
            objOffsetWellBar.Stacked = true;
            objOffsetWellBar.Title = "Time (Hrs)";
            objOffsetWellBar.Type = dataSeriesType.Bar;
            objOffsetWellBar.Color = "Blue"; //#1089ff
            objOffsetWellBar.XAxisId = this.objChart.bottomAxis().Id;
            objOffsetWellBar.YAxisId = this.objChart.leftAxis().Id;
            //objOffsetWellBar.ColorEach = true;


            //Nishant for Offset Well
            if (this.state.objPlotData.objDataSelection.StandPlot_ShowOffset) {
                objOffsetWellBar.ColorEach = false;

                this.objChart.DataSeries.set(objOffsetWellBar.Id, objOffsetWellBar);
            }


            let objBar = new DataSeries();
            objBar.Id = "Bar1";
            objBar.Stacked = true;
            objBar.Title = "Time (Hrs)";
            objBar.Type = dataSeriesType.Bar;
            objBar.Color = "#00E5FF"; //#1089ff
            objBar.XAxisId = this.objChart.bottomAxis().Id;
            objBar.YAxisId = this.objChart.leftAxis().Id;
            //objBar.ColorEach = true;
            if (this.state.objDrlgStandUserSettings.HighlightDayNight == true) {
                objBar.ColorEach = true;
            }

            this.objChart.DataSeries.set(objBar.Id, objBar);

            //sort array on depth
            
            //let connPoints: any =   Object.values(this.state.objPlotData.objStandProcessor.connectionPoints);
            let connPoints: any =   Object.values(this.state.objPlotData.grdConnection);
            connPoints.sort(function (a, b) {
                return a.Depth - b.Depth;
            });
            let chartData = connPoints;

            debugger;

            //Fill up the data for data series
            for (let i = 0; i < chartData.length; i++) {
                let objStandPoint = new ChartData();

                //rigStateKeys=Object.keys(chartData[i].RigStates)



                objStandPoint.x = Math.round(chartData[i]["Depth"]);
                let standTime: number = 0;
                standTime = moment.duration(moment(chartData[i]["ToDate"]).diff(moment(chartData[i]["FromDate"]))).asHours();
                // standTime = Math.round(((standTime / 60) / 60));
                objStandPoint.y = Number(standTime.toFixed(2)); //Math.round(standTime);
                objStandPoint.label = chartData[i]["Comments"]; 

                if (this.state.objDrlgStandUserSettings.HighlightDayNight == true) {
                    //if (chartData[i].DayNightStatus == 1) {
                        if (chartData[i].DayNightStatus == "Day") {
                        objStandPoint.color = "Yellow";
                        //yellow
                    } else {
                        //Black
                        objStandPoint.color = "Black";
                    }

                }
                objBar.Data.push(objStandPoint);

                // objOffsetWellBar.Data.push()

                // let objOffsetStandPoint = new ChartData();
                // objOffsetStandPoint.x = Math.round(chartData[i]["Depth"]);
                // objOffsetStandPoint.y = Math.round(chartData[i]["OffsetTime"]);

                // objBar.Data.push(objOffsetStandPoint);

                //
            }

            this.objChart.reDraw();
        } catch (error) {

        }
    }
    refreshChart = () => {

        //this.objChart.LegendPosition = 4; // 1 (left), 2 (right), 3 (top), 4 (bottom)

        debugger;

        if (this.state.CurrentView == 0) {
            this.plotRegularChart();
        }

        if (this.state.CurrentView == 1) {
            this.plotChartRigStateView();
        }


    }



    loadDrlgStandPlotData = async () => {
        try {

            Util.StatusInfo("Getting data from the server  ");
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Summary.Manager";
            objBrokerRequest.Broker = "DrlgStandPlot";
            objBrokerRequest.Function = "generateDrlgStandPlot";


            let objUserSettings: DrlgStandUserSettings = new DrlgStandUserSettings();

            //  this.WellID = "us_1395675560"; //Fix
            objUserSettings.WellID = this.WellID;
            objUserSettings.UserID = _gMod._userId;
            objUserSettings.LastHrs = this.state.objDataSelector.refreshHrs;
            objUserSettings.RealTime = this.state.realTime;
            objUserSettings.FromDate = this.state.objDataSelector.fromDateS.toLocaleString();
            objUserSettings.ToDate = this.state.objDataSelector.toDateS.toLocaleString();

            objUserSettings.FromDepth = this.state.objDataSelector.fromDepth;
            objUserSettings.ToDepth = this.state.objDataSelector.toDepth;



            switch (this.state.objDataSelector.selectedval) ////"-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
            {
                case "-1":
                    objUserSettings.SelectionType = sPlotSelectionType.ByHours
                    break;
                case "0":
                    objUserSettings.SelectionType = sPlotSelectionType.DateRange;
                    break;
                case "1":
                    objUserSettings.SelectionType = sPlotSelectionType.DepthRange;
                    break;
                case "2":
                    objUserSettings.SelectionType = sPlotSelectionType.ByHours;
                    break;

                default:
                    objUserSettings.SelectionType = sPlotSelectionType.ByHours;
                    break;
            }



            objParameter = new BrokerParameter("UserSettings", JSON.stringify(objUserSettings));//this.state.objDrlgStandUserSettings
            objBrokerRequest.Parameters.push(objParameter);


            this.AxiosSource = axios.CancelToken.source();

            await axios
                .get(_gMod._getData, {
                    cancelToken: this.AxiosSource.token,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then(async (res) => {

                    let warnings: string = "";
                    if (res.data.RequestSuccessfull == false) {
                        warnings = res.data.Warnings;
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
                        return;
                    }
                    let objData_ = JSON.parse(res.data.Response);
                    console.log("PlotData", objData_);

                    if (objData_ != "" || objData_ != undefined) {
                        let grdData: any;
                        if (objData_.objStandProcessor != undefined || objData_.objStandProcessor != "") {
                            if (objData_.objStandProcessor.connectionPoints != undefined) {
                                grdData = Object.values(objData_.objStandProcessor.connectionPoints);


                            }

                            if (Object.values(objData_.objStandProcessor.connectionPoints).length == 0) {
                                warnings += "No Connections found";
                            }

                        }
                        // "objStandProcessor": {
                        //     "connectionPoints": {
                        //       "1": {
                        //         "Depth": 8069.6,
                        //         "ROP": 22.8433734939759,
                        //         "RotaryROP": 29.258103241296517,
                        //         "SlideROP": 14.75945537065053,
                        //         "DayNightStatus": 1,
                        //         "FromDate": "2014-04-16T15:22:40",
                        //         "ToDate": "2014-04-16T20:29:30",
                        //         "RigStates": {
                        //           "0": 8330,
                        //           "1": 6610,
                        //           "3": 910,
                        //           "7": 180,
                        //           "11": 220,
                        //           "12": 1080,
                        //           "14": 140,
                        //           "27": 790,
                        //           "28": 160
                        //         },
                        //         "OffsetTime": 0,
                        //         "OffsetDayNightStatus": 0,
                        //         "OffsetROP": 0,
                        //         "OffsetRotaryROP": 0,
                        //         "OffsetSlideROP": 0
                        //       },

                        let objDataSelector_: DataSelector_ = new DataSelector_();
                        objDataSelector_.wellID = objData_.WellID;
                        objDataSelector_.refreshHrs = objData_.objUserSettings.LastHrs;
                        objDataSelector_.fromDate = objData_.objUserSettings.FromDate;
                        objDataSelector_.toDate = objData_.objUserSettings.ToDate;
                        objDataSelector_.fromDepth = objData_.objUserSettings.FromDepth;
                        objDataSelector_.toDepth = objData_.objUserSettings.ToDepth;
                        objDataSelector_.needForceReload = true;

                        // objData_.selectionType are:
                        // ByHours = 0,
                        // DateRange = 1,
                        // FromDateOnwards = 2,
                        // DepthRange = 3,
                        // FromDepthOnwards = 4,
                        // FormationTops = 5

                        // public enum eNumSelectionType objUserSettings
                        // {
                        //     DefaultByHrs = -1,
                        //     ByHrs = 1,
                        //     DateRange = 0,
                        //     DepthRange = 3
                        // }

                        // debugger;
                        // alert(objData_.objUserSettings.SelectionType);
                        // debugger;
                        // alert(objDataSelector_.fromDate);
                        // alert(objDataSelector_.toDate);
                        // debugger;
                        switch (objData_.objUserSettings.SelectionType) {
                            case 1:
                                //objDataSelector.selectedval = "-1" //-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
                                //objDataSelector.selectedval = "2" //-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
                                objDataSelector_.selectedval = "0" //-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
                                break;
                            case 2:
                                //objDataSelector.selectedval = "-1" //-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
                                //objDataSelector.selectedval = "2" //-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
                                objDataSelector_.selectedval = "0" //-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
                                break;
                            case 0:
                                //objDataSelector.selectedval = "0" //-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
                                objDataSelector_.selectedval = "2" //-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
                                break;
                            case 3:
                                //objDataSelector.selectedval = "3" //-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
                                objDataSelector_.selectedval = "1" //-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
                                break;

                            default:
                                break;
                        }




                        await this.setState({
                            objPlotData: objData_,
                            objGridData: grdData,
                            ConnCount: grdData.length,
                            objDrlgStandUserSettings: objData_.objUserSettings,
                            objDataSelector: objDataSelector_,
                            refreshDataSelector: true

                        });
                        console.log(objDataSelector_);
                        console.log(objData_)

                        this.refreshChart();
                    } else {
                        warnings += "No Data Available";
                    }


                    //Warnings Notifications
                    // warnings = res.data.Warnings;
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

                    Util.StatusSuccess("Data successfully retrived  ");
                    Util.StatusReady();

                })
                .catch((error) => {

                    //Util.StatusError(error.message);
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
                    // return <CustomeNotifications Key="success" Icon={false} />
                    console.log("rejected");
                    this.setState({ isProcess: false });
                });


        } catch (error) {

        }
    }


    handleTabSelection = (e: any) => {
        this.setState({ selectedTab: e.selected });
    }

    saveSettings = () => {
        try {

            //Util.StatusInfo("Getting data from the server  ");
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Summary.Manager";
            objBrokerRequest.Broker = "DrlgStandPlot";
            objBrokerRequest.Function = "SaveUserSettings";


            let objUserSettings: DrlgStandUserSettings = new DrlgStandUserSettings();


            objUserSettings.WellID = this.WellID;
            objUserSettings.UserID = _gMod._userId;
            objUserSettings.LastHrs = this.state.objDataSelector.refreshHrs;
            objUserSettings.RealTime = this.state.realTime;
            objUserSettings.FromDate = this.state.objDataSelector.fromDateS.toLocaleString();
            objUserSettings.ToDate = this.state.objDataSelector.toDateS.toLocaleString();

            objUserSettings.FromDepth = this.state.objDataSelector.fromDepth;
            objUserSettings.ToDepth = this.state.objDataSelector.toDepth;

            objUserSettings.RealTime = this.state.realTime;
            objUserSettings.ShowComments = this.state.objDrlgStandUserSettings.ShowComments;
            objUserSettings.ShowExcludedStands = this.state.objDrlgStandUserSettings.ShowExcludedStands;
            objUserSettings.ShowRigStateView = this.state.objDrlgStandUserSettings.ShowRigStateView;

            objUserSettings.dtDayTimeFrom = this.state.objDrlgStandUserSettings.dtDayTimeFrom;
            objUserSettings.dtDayTimeTo = this.state.objDrlgStandUserSettings.dtDayTimeTo;
            objUserSettings.HighlightDayNight = this.state.objDrlgStandUserSettings.HighlightDayNight;
            //alert(objUserSettings.ShowComments);


            switch (this.state.objDataSelector.selectedval) ////"-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
            {
                case "-1":
                    objUserSettings.SelectionType = sPlotSelectionType.ByHours
                    break;
                case "0":
                    objUserSettings.SelectionType = sPlotSelectionType.DateRange;
                    break;
                case "1":
                    objUserSettings.SelectionType = sPlotSelectionType.DepthRange;
                    break;
                case "2":
                    objUserSettings.SelectionType = sPlotSelectionType.ByHours;
                    break;

                default:
                    objUserSettings.SelectionType = sPlotSelectionType.ByHours;
                    break;
            }



            objParameter = new BrokerParameter("UserSettings", JSON.stringify(objUserSettings));//this.state.objDrlgStandUserSettings
            objBrokerRequest.Parameters.push(objParameter);


            this.AxiosSource = axios.CancelToken.source();


            axios
                .get(_gMod._performTask, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })

                .then((res) => {
                    Util.StatusSuccess("Data successfully retrived  ");

                    this.setState({ selected: 0 });
                    //reload all the connections

                    this.loadDrlgStandPlotData();
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
        } catch (error) { }

        // } catch (error) {

        // }
    }

    render() {

        return (
            <>
                <div className="row ml-1 mr-1" style={{ justifyContent: "space-between" }}>
                    <div className="mr-2">
                        <div className="statusCard">
                            <div className="card-body">
                                <h6 className="card-subtitle mb-2">Well Name</h6>
                                <div className="_summaryLabelBig">
                                    {this.state.objPlotData.WellName}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-inline m-1">



                        <div className="eVumaxPanelController" style={{ width: "255px" }}>
                            <label className=" mr-1">Realtime</label> <Switch onChange={this.handleToggleSwitch} value={this.state.realTime} checked={this.state.realTime}></Switch>

                            <label className=" ml-5 mr-1" onClick={() => { this.refreshChart(); }} style={{ cursor: "pointer" }}>Undo Zoom</label>
                            <FontAwesomeIcon icon={faSearchMinus} size="lg" onClick={() => { this.refreshChart(); }} />

                        </div>
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

                    </div>
                </div>



                <TabStrip
                    selected={this.state.selectedTab}
                    onSelect={this.handleTabSelection}
                    keepTabsMounted={true}
                >
                    <TabStripTab title="Drilling Stand Plot">
                        <div>


                            {/* <DataSelectorInfo objDataSelector={this.state.objDataSelector} isRealTime={this.state.realTime} /> */}
                            <div className="form-inline eVumaxPanelChart_ mb-5" style={{
                                marginRight: "50px", float: "right",// height: "32px", // padding: "3px",
                                minWidth: "100px",
                            }}
                            >

                                <label className="connInfo_" style={{ marginRight: "0px" }}>
                                    {this.state.ConnCount} Drilling Stand
                                </label>
                            </div>

                            <div
                                className="form-group eVumaxPanelChart"
                                style={{
                                    marginTop: "10px",
                                    float: "left",
                                    height: "50px",
                                    padding: "3px",
                                    //vimal
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
                                    onChange={async () => {
                                        await this.setState({ CurrentView: 0 });
                                        this.refreshChart();
                                    }}
                                />
                                <RadioButton
                                    name="opgView1"
                                    value={1}
                                    checked={this.state.CurrentView === 1}
                                    label="Rig State View"
                                    onChange={async () => {
                                        await this.setState({ CurrentView: 1 });
                                        this.refreshChart();
                                    }}
                                />

                                <label className="ml-5">
                                    {this.state.objPlotData.ChartTitle == undefined ? "" : this.state.objPlotData.ChartTitle}
                                </label>

                            </div>
                            {/* <div> */}
                            <div
                                id="DrlgStandPlotChart"
                                style={{
                                    marginTop: "0px",
                                    height: "calc(100vh - 630px)",
                                    width: "calc(100vw - 130px)",
                                    backgroundColor: "transparent",
                                }}
                            >

                            </div>

                            <div
                                id="DrlgStandPlotChart_legend"
                                style={{
                                    textAlign: "center",
                                    height: "40px",
                                    //width: "calc(100vw - 130px)",
                                    backgroundColor: "transparent",
                                    display: "inline-block",
                                }}
                            ></div>


                            <div className="row mt-5">
                                <div className="col-lg-3">
                                    <h6 className="summaryGroupHeader">Summary</h6>
                                    <div className="form-inline">
                                        <div className="form-group">
                                            <label className="summaryLabelHeader">
                                                Avg. Stand Time
                                            </label>
                                            <label className="summaryLabel" id="txtAvgTime">
                                                {this.state.objPlotData.AvgTime}

                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Rotary ROP</label>
                                            <label className="summaryLabel" id="txtAvgBTS">
                                                {this.state.objPlotData.AvgRotaryROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTS">
                                                {this.state.objPlotData.AvgROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Slide ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTB">
                                                {this.state.objPlotData.AvgSlideROP}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3">
                                    <h6 className="summaryGroupHeader">Day Time Summary</h6>
                                    <div className="form-inline">
                                        <div className="form-group">
                                            <label className="summaryLabelHeader">
                                                Avg. Stand Time
                                            </label>
                                            <label className="summaryLabel" id="txtAvgTime">
                                                {this.state.objPlotData.DAvgTime}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Rotary ROP</label>
                                            <label className="summaryLabel" id="txtAvgBTS">
                                                {this.state.objPlotData.DAvgRotaryROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTS">
                                                {this.state.objPlotData.DAvgROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Slide ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTB">
                                                {this.state.objPlotData.DAvgRotaryROP}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3">
                                    <h6 className="summaryGroupHeader">Night Time Summary</h6>
                                    <div className="form-inline">
                                        <div className="form-group">
                                            <label className="summaryLabelHeader">
                                                Avg. Stand Time
                                            </label>
                                            <label className="summaryLabel" id="txtAvgTime">
                                                {this.state.objPlotData.NAvgTime}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Rotary ROP</label>
                                            <label className="summaryLabel" id="txtAvgBTS">
                                                {this.state.objPlotData.NAvgRotaryROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTS">
                                                {this.state.objPlotData.NAvgROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Slide ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTB">
                                                {this.state.objPlotData.NAvgRotaryROP}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* {this.state.objPlotData.ShowOffsetWell && <div className="row mt-5"> */}
                            {true && <div className="row mt-2">
                                <div className="col-lg-3">
                                    <h6 className="summaryGroupHeader">Offset Well Summary</h6>
                                    <div className="form-inline">
                                        <div className="form-group">
                                            <label className="summaryLabelHeader">
                                                Avg. Stand Time
                                            </label>
                                            <label className="summaryLabel" id="txtAvgTime">
                                                {this.state.objPlotData.offsetAvgTime}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Rotary ROP</label>
                                            <label className="summaryLabel" id="txtAvgBTS">
                                                {this.state.objPlotData.OffsetAvgRotaryROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTS">
                                                {this.state.objPlotData.OffsetAvgROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Slide ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTB">
                                                {this.state.objPlotData.OffsetAvgSlideROP}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3">
                                    <h6 className="summaryGroupHeader">Day Time Summary</h6>
                                    <div className="form-inline">
                                        <div className="form-group">
                                            <label className="summaryLabelHeader">
                                                Avg. Stand Time
                                            </label>
                                            <label className="summaryLabel" id="txtAvgTime">
                                                {this.state.objPlotData.offsetDAvgTime}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Rotary ROP</label>
                                            <label className="summaryLabel" id="txtAvgBTS">
                                                {this.state.objPlotData.OffsetDAvgRotaryROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTS">
                                                {this.state.objPlotData.OffsetDAvgROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Slide ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTB">
                                                {this.state.objPlotData.OffsetDAvgSlideROP}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3">
                                    <h6 className="summaryGroupHeader">Night Time Summary</h6>
                                    <div className="form-inline">
                                        <div className="form-group">
                                            <label className="summaryLabelHeader">
                                                Avg. Stand Time
                                            </label>
                                            <label className="summaryLabel" id="txtAvgTime">
                                                {this.state.objPlotData.offsetNAvgTime}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Rotary ROP</label>
                                            <label className="summaryLabel" id="txtAvgBTS">
                                                {this.state.objPlotData.OffsetNAvgRotaryROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTS">
                                                {this.state.objPlotData.OffsetNAvgROP}
                                            </label>
                                        </div>

                                        <div className="form-group">
                                            <label className="summaryLabelHeader">Avg. Slide ROP</label>
                                            <label className="summaryLabel" id="txtAvgSTB">
                                                {this.state.objPlotData.OffsetNAvgSlideROP}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>}

                            <div className="Data">
                                {this.state.refreshDataSelector && <DataSelector objDataSelector={this.state.objDataSelector} wellID={this.WellID} selectionChanged={this.selectionChanged} ></DataSelector>}
                            </div>
                            {/* </div> */}

                        </div>
                    </TabStripTab>
                    <TabStripTab title="Numeric Summary">
                        <div
                        //vimal
                        // className="row col-xl-12 col-lg-12 col-md-12 col-sm-12"
                        // style={{
                        //     backgroundColor: "transparent",
                        //     width: "80%",

                        //     minHeight: "100px",//180px
                        //     minWidth: "600px",//350px
                        // }}
                        >
                            <Grid
                                className="mb-3 col-xl-12 col-lg-12 col-md-12 col-sm-12"
                                style={{ height: "530px", width: "100%" }}//height:120px Vimal
                                resizable={true}
                                scrollable={"scrollable"}//make commented
                                sortable={true}
                                //onRowClick={this.grdNumSummaryRowClick}
                                // editField="inEdit"
                                // selectedField="selected"
                                data={this.state.objGridData}
                            >
                                <Column

                                    headerClassName="text-center"
                                    className="text-right"
                                    width="80px"



                                    field="Depth"
                                    title="Depth"
                                    cell={(props) => (
                                        <td className="text-right" style={{}}>
                                            <span>
                                                {" "}
                                                {formatNumber(props.dataItem.Depth, "n2")}{" "}
                                            </span>
                                        </td>
                                    )}


                                />
                                <Column
                                    //headerClassName="text-center"
                                    className="summaryLabel"
                                    field="FromDate"
                                    title="Time [HH:MM:SS]"
                                    width="100px"

                                    cell={(props) => (
                                        <td className="text-right" style={{}}>
                                            <span>
                                                {" "}
                                                {this.formatDateHHMMSS(props.dataItem.FromDate, props.dataItem.ToDate)}
                                                {/* {Number(moment.duration(moment(new Date(props.dataItem.ToDate)).diff(moment(new Date(props.dataItem.FromDate)))).asHours()).toFixed(0) + ":" +
                                                    Number(moment.duration(moment(new Date(props.dataItem.ToDate)).diff(moment(new Date(props.dataItem.FromDate)))).asMinutes()).toFixed(0) + ":" +
                                                    Number(moment.duration(moment(new Date(props.dataItem.ToDate)).diff(moment(new Date(props.dataItem.FromDate)))).asSeconds()).toFixed(0) + ":"
                                                } */}
                                            </span>
                                        </td>
                                    )}
                                />
                                {/* <Column
                                    //headerClassName="text-center"
                                    className="summaryLabelHeader"
                                    field="ToDate"
                                    width="100px"
                                /> */}
                                <Column
                                    //headerClassName="text-center"
                                    className="summaryLabel3"
                                    field="Comments"
                                    title="Comments"
                                    width="100px"
                                />
                                <Column
                                    headerClassName="text-center"
                                    className="summaryLabelHeader"
                                    field="DayNightStatus"
                                    title="Day/Night"
                                    width="70px"
                                    cell={(props) => (
                                        <td className="text-center" style={{}}>
                                            <span>
                                                {props.dataItem["DayNightStatus"] == "1" ? (
                                                    <FontAwesomeIcon
                                                        icon={faMoon}
                                                    ></FontAwesomeIcon>
                                                ) : (
                                                    <FontAwesomeIcon
                                                        style={{ color: "yellow" }}
                                                        icon={faSun}
                                                    ></FontAwesomeIcon>
                                                )}
                                            </span>
                                        </td>
                                    )}
                                />
                                <Column
                                    headerClassName="text-center"
                                    className="summaryLabel"
                                    field="ROP"
                                    title="ROP"
                                    width="70px"
                                    cell={(props) => (
                                        <td className="text-right" style={{}}>
                                            <span>
                                                {" "}
                                                {formatNumber(props.dataItem.ROP, "n2")}{" "}
                                            </span>
                                        </td>
                                    )}
                                />
                                <Column
                                    headerClassName="text-center"
                                    className="summaryLabelHeader"
                                    field="RotaryROP"
                                    title="Rotary ROP"
                                    width="100px"
                                    cell={(props) => (
                                        <td className="text-right" style={{}}>
                                            <span>
                                                {" "}
                                                {formatNumber(props.dataItem.RotaryROP, "n2")}{" "}
                                            </span>
                                        </td>
                                    )}
                                />
                                <Column
                                    headerClassName="text-center"
                                    className="summaryLabel"
                                    field="SlideROP"
                                    title="Slide ROP"
                                    width="100px"
                                    cell={(props) => (
                                        <td className="text-right" style={{}}>
                                            <span>
                                                {" "}
                                                {formatNumber(props.dataItem.SlideROP, "n2")}{" "}
                                            </span>
                                        </td>
                                    )}
                                />
                                <Column
                                    headerClassName="text-center"
                                    className="summaryLabelHeader"
                                    field="OffsetTime"
                                    title="OffsetTime [HH:MM:SS]"
                                    width="150px"
                                    cell={(props) => (
                                        <td className="text-right" style={{}}>
                                            <span>
                                                {" "}
                                                {formatNumber(props.dataItem.OffsetTime, "n2")}{" "}
                                            </span>
                                        </td>
                                    )}
                                />

                            </Grid>
                        </div>

                    </TabStripTab>
                    <TabStripTab title="Settings">
                        <div>
                            <Checkbox
                                className="mr-5 ml-5"
                                label={"Hightlight Day & Night Stand"}
                                checked={this.state.objDrlgStandUserSettings.HighlightDayNight}
                                onChange={(event) => {
                                    this.disableRealTime();
                                    let objUserSettings: DrlgStandUserSettings = this.state.objDrlgStandUserSettings;
                                    objUserSettings.HighlightDayNight = event.value;

                                    this.setState({ objDrlgStandUserSettings: objUserSettings });
                                }}
                            />
                            <span>DayTime Hours from</span>
                            <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                                <TimePicker onChange={(event) => {
                                    let objUserSettings: DrlgStandUserSettings = this.state.objDrlgStandUserSettings;
                                    objUserSettings.dtDayTimeFrom = event.target.value;
                                    console.log(event.target.value);
                                    this.setState({ objDrlgStandUserSettings: objUserSettings });
                                }}
                                    value={new Date(this.state.objDrlgStandUserSettings.dtDayTimeFrom)}
                                //value = {new Date(moment(this.state.objDrlgStandUserSettings.dtDayTimeTo).format("LT"))}
                                //value= {moment(this.state.objDrlgStandUserSettings.dtDayTimeTo).format("LT")} 
                                />
                                {/* <MaskedTextBox
                                    mask="00:00"
                                    width="62px"
                                    value={moment(this.state.objDrlgStandUserSettings.dtDayTimeFrom).format("LT").toString().substring(0,4)}
                                    onChange={(event) => {
                                        let objUserSettings: DrlgStandUserSettings = this.state.objDrlgStandUserSettings;
                                        //objUserSettings.dtDayTimeFrom = event.target.value;

                                        //this.setState({ objDrlgStandUserSettings: objUserSettings });
                                    }}
                                /> */}
                                To
                            </span>
                            <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                                {/* <MaskedTextBox
                                    mask="00:00"
                                    width="50px"
                                    value={this.state.objDrlgStandUserSettings.dtDayTimeTo.getHours().toString()}
                                    onChange={(event) => {
                                        let objUserSettings: DrlgStandUserSettings = this.state.objDrlgStandUserSettings;
                                        //objUserSettings.dtDayTimeTo = event.target.value;
                                        //this.setState({ objDrlgStandUserSettings: objUserSettings });
                                    }}
                                /> */}
                                <TimePicker onChange={(event) => {
                                    let objUserSettings: DrlgStandUserSettings = this.state.objDrlgStandUserSettings;
                                    objUserSettings.dtDayTimeTo = event.target.value;
                                    this.setState({ objDrlgStandUserSettings: objUserSettings });
                                }}
                                    value={new Date(this.state.objDrlgStandUserSettings.dtDayTimeTo)}
                                //value = {new Date(moment(this.state.objDrlgStandUserSettings.dtDayTimeTo).format("LT"))}
                                //value= {moment(this.state.objDrlgStandUserSettings.dtDayTimeTo).format("LT")} 
                                />
                                ( HH: MM )
                            </span>
                            <Checkbox
                                className=" ml-2"
                                label={"Show Excluded Stands"}
                                checked={this.state.objDrlgStandUserSettings.ShowExcludedStands}
                                onChange={(event) => {
                                    this.disableRealTime();
                                    let objUserSettings: DrlgStandUserSettings = this.state.objDrlgStandUserSettings;
                                    objUserSettings.ShowExcludedStands = event.value;

                                    this.setState({ objDrlgStandUserSettings: objUserSettings });
                                }}
                            />
                            <Checkbox
                                className=" ml-4"
                                label={"Show Comments On Plot"}
                                checked={this.state.objDrlgStandUserSettings.ShowComments}
                                onChange={(event) => {
                                    let objUserSettings: DrlgStandUserSettings = this.state.objDrlgStandUserSettings;
                                    objUserSettings.ShowComments = event.value;
                                    this.setState({ objDrlgStandUserSettings: objUserSettings });
                                }}
                            />
                            <Button
                                className="ml-5"
                                id="cmdApplySettings"
                                onClick={() => {
                                    this.setState({
                                        selectedTab: 0
                                    });
                                    this.saveSettings();
                                }}
                            >
                                Apply
                            </Button>
                        </div>

                    </TabStripTab>
                </TabStrip>
            </>
        )
    }
}
