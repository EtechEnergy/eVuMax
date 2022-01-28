import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import GlobalMod from "../../../objects/global"
import React from "react";
import axios from "axios";

import { Util } from "../../../Models/eVuMax";
import NotifyMe from 'react-notification-timeline';

import { Chart, lineStyle, curveStyle } from "../../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import * as d3 from "d3";

import { formatNumber, parseDate } from "@telerik/kendo-intl";
import { faListAlt, faSearchMinus } from "@fortawesome/free-solid-svg-icons";



import moment from "moment";
import {
    DataSeries,
    dataSeriesType,
    pointStyle,
} from "../../../eVuMaxObjects/Chart/DataSeries";
import "@progress/kendo-react-layout";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Button, NumericTextBox, TabStrip, TabStripTab, TimePicker } from "@progress/kendo-react-all";
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";
import { confirmAlert } from "react-confirm-alert";
import * as util from "../../../utilFunctions/utilFunctions";
import "./TripReportCss.css";
import { lab } from "d3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Checkbox } from "@progress/kendo-react-inputs";



let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("null", "null");



export default class DrlgStandPlot extends React.Component {

    intervalID: NodeJS.Timeout | undefined;
    WellID: string = "";
    objChart2: Chart;
    objChart1: Chart;
    objChart3: Chart;
    objChart4: Chart;
    ST_objChartTripSpeed: Chart;
    ST_objChart2_Pie: Chart;
    ST_objChart3BarTripConn: Chart;


    //  objLogger: ClientLogger = new ClientLogger("DrlgStandPlot", _gMod._userId);


    constructor(props: any) {
        super(props);
        this.WellID = props.match.params.WellId;
    }


    AxiosSource = axios.CancelToken.source();



    state = {
        warningMsg: [],
        objPlotData: {} as any,
        showSingleTripReport: false,
        objGridData: [] as any,
        selectedTab: 0,
        SingleTripReportData: {} as any,
        currentPhaseIndex: 0
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

    componentDidUpdate() {
        try {
            this.refreshChart();

        } catch (error) { }
    }

    async componentDidMount() {
        try {
            //this.initializeChart();
            //initialize chart
            this.objChart1 = new Chart(this, "TripReport1");
            this.objChart1.ContainerId = "avgTripConnChart";

            this.objChart1.leftAxis().AutoScale = true;
            this.objChart1.leftAxis().Min = 0;
            this.objChart1.leftAxis().Max = 100;
            this.objChart1.leftAxis().Inverted = false;
            this.objChart1.leftAxis().ShowLabels = true;
            this.objChart1.leftAxis().ShowTitle = true;
            this.objChart1.leftAxis().Title = "Average Time (min.)";
            this.objChart1.leftAxis().DisplayOrder = 1;
            this.objChart1.leftAxis().Visible = true;

            this.objChart1.bottomAxis().AutoScale = true;
            this.objChart1.bottomAxis().bandScale = false; //prath
            this.objChart1.bottomAxis().Min = 100;
            this.objChart1.bottomAxis().Max = 200;
            this.objChart1.bottomAxis().Title = "Trips";
            this.objChart1.bottomAxis().ShowLabels = true;
            this.objChart1.bottomAxis().ShowTitle = true;
            this.objChart1.bottomAxis().LabelAngel = 90;
            this.objChart1.bottomAxis().ShowSelector = false;
            this.objChart1.bottomAxis().IsDateTime = false;
            this.objChart1.bottomAxis().Visible = true;

            // this.objChart.rightAxis().Visible = true;

            this.objChart1.MarginLeft = 0; //10;
            this.objChart1.MarginBottom = 0; //40;
            this.objChart1.MarginTop = 0; //10;
            this.objChart1.MarginRight = 0; // 10;



            this.objChart1.initialize();
            this.objChart1.reDraw();


            this.objChart1.onAfterSeriesDraw.subscribe((e, i) => {
                this.onAfterAxisDrawSeries(e, i);
            });

            //TripConnChart
            this.objChart2 = new Chart(this, "TripReport2");
            this.objChart2.ContainerId = "TripConnChart";
            this.objChart2.Title = "Tripping Connection Times";

            this.objChart2.leftAxis().AutoScale = true;
            this.objChart2.leftAxis().Min = 0;
            this.objChart2.leftAxis().Max = 100;
            this.objChart2.leftAxis().Inverted = false;
            this.objChart2.leftAxis().ShowLabels = true;
            this.objChart2.leftAxis().ShowTitle = true;
            this.objChart2.leftAxis().Title = "Average Time (min.)";
            this.objChart2.leftAxis().DisplayOrder = 1;
            this.objChart2.leftAxis().Visible = true;

            this.objChart2.bottomAxis().AutoScale = true;
            this.objChart2.bottomAxis().bandScale = true; //prath
            this.objChart2.bottomAxis().Min = 100;
            this.objChart2.bottomAxis().Max = 200;
            this.objChart2.bottomAxis().Title = "Trips";
            this.objChart2.bottomAxis().ShowLabels = true;
            this.objChart2.bottomAxis().ShowTitle = true;
            this.objChart2.bottomAxis().LabelAngel = 90;
            this.objChart2.bottomAxis().ShowSelector = false;
            this.objChart2.bottomAxis().IsDateTime = false;
            this.objChart2.bottomAxis().Visible = true;

            // this.objChart.rightAxis().Visible = true;

            this.objChart2.MarginLeft = 0; //10;
            this.objChart2.MarginBottom = 0; //40;
            this.objChart2.MarginTop = 0; //10;
            this.objChart2.MarginRight = 0; // 10;

            this.objChart2.initialize();
            this.objChart2.reDraw();

            ////ContiTripSpeedWithConnChart
            this.objChart3 = new Chart(this, "TripReport3");
            this.objChart3.ContainerId = "ContiTripSpeedWithConnChart";
            this.objChart3.Title = "Continuous Tripping Speed with Connection";

            this.objChart3.leftAxis().AutoScale = true;
            this.objChart3.leftAxis().Min = 0;
            this.objChart3.leftAxis().Max = 100;
            this.objChart3.leftAxis().Inverted = false;
            this.objChart3.leftAxis().ShowLabels = true;
            this.objChart3.leftAxis().ShowTitle = true;
            this.objChart3.leftAxis().Title = "Depth (" + this.state.objPlotData.depthUnit + ")";
            this.objChart3.leftAxis().DisplayOrder = 1;
            this.objChart3.leftAxis().Visible = true;

            this.objChart3.bottomAxis().AutoScale = true;
            this.objChart3.bottomAxis().bandScale = true; //prath
            this.objChart3.bottomAxis().Min = 100;
            this.objChart3.bottomAxis().Max = 200;
            this.objChart3.bottomAxis().Title = "Speed with Connection (" + this.state.objPlotData.depthUnit + "/Hr.)";
            this.objChart3.bottomAxis().ShowLabels = true;
            this.objChart3.bottomAxis().ShowTitle = true;
            this.objChart3.bottomAxis().LabelAngel = 90;
            this.objChart3.bottomAxis().ShowSelector = false;
            this.objChart3.bottomAxis().IsDateTime = false;
            this.objChart3.bottomAxis().Visible = true;

            // this.objChart.rightAxis().Visible = true;

            this.objChart3.MarginLeft = 0; //10;
            this.objChart3.MarginBottom = 0; //40;
            this.objChart3.MarginTop = 0; //10;
            this.objChart3.MarginRight = 0; // 10;

            this.objChart3.initialize();
            this.objChart3.reDraw();

            ////ContiTripSpeedWithOutConnChart
            this.objChart4 = new Chart(this, "TripReport4");
            this.objChart4.ContainerId = "ContiTripSpeedWithOutConnChart";
            this.objChart4.Title = "Continuous Tripping Speed without Connection";
            this.objChart4.DataSeries.clear();
            this.objChart4.ShowLegend = true;
            this.objChart4.updateChart();

            this.objChart4.leftAxis().AutoScale = true;
            this.objChart4.leftAxis().Min = 0;
            this.objChart4.leftAxis().Max = 100;
            this.objChart4.leftAxis().Inverted = false;
            this.objChart4.leftAxis().ShowLabels = true;
            this.objChart4.leftAxis().ShowTitle = true;
            this.objChart4.leftAxis().Title = "Depth (" + this.state.objPlotData.depthUnit + ")";
            this.objChart4.leftAxis().DisplayOrder = 1;
            this.objChart4.leftAxis().Visible = true;

            this.objChart4.bottomAxis().AutoScale = true;
            this.objChart4.bottomAxis().bandScale = true; //prath
            this.objChart4.bottomAxis().Min = 100;
            this.objChart4.bottomAxis().Max = 200;
            this.objChart4.bottomAxis().Title = "Speed with Connection (" + this.state.objPlotData.depthUnit + "/Hr.)";
            this.objChart4.bottomAxis().ShowLabels = true;
            this.objChart4.bottomAxis().ShowTitle = true;
            this.objChart4.bottomAxis().LabelAngel = 90;
            this.objChart4.bottomAxis().ShowSelector = false;
            this.objChart4.bottomAxis().IsDateTime = false;
            this.objChart4.bottomAxis().Visible = true;

            // this.objChart.rightAxis().Visible = true;

            this.objChart4.MarginLeft = 0; //10;
            this.objChart4.MarginBottom = 0; //40;
            this.objChart4.MarginTop = 0; //10;
            this.objChart4.MarginRight = 0; // 10;

            this.objChart4.initialize();
            this.objChart4.reDraw();



            this.ST_objChart2_Pie = new Chart(this, "CurrentChart", true);
            this.ST_objChart2_Pie.ContainerId = "CurrentPie_Chart";

            //initialize chart Pie Chart

            this.ST_objChart2_Pie.MarginLeft = 0;
            this.ST_objChart2_Pie.MarginBottom = 0;
            this.ST_objChart2_Pie.MarginTop = 0;
            this.ST_objChart2_Pie.MarginRight = 0;

            this.ST_objChart2_Pie.initialize();
            this.ST_objChart2_Pie.reDraw();



            ////ChartTripSpeed Chart
            this.ST_objChartTripSpeed = new Chart(this, "ChartTripSpeed1");
            this.ST_objChartTripSpeed.ContainerId = "ChartTripSpeed";

            this.ST_objChartTripSpeed.leftAxis().AutoScale = true;
            this.ST_objChartTripSpeed.leftAxis().Min = 0;
            this.ST_objChartTripSpeed.leftAxis().Max = 100;
            this.ST_objChartTripSpeed.leftAxis().Inverted = false;
            this.ST_objChartTripSpeed.leftAxis().ShowLabels = true;
            this.ST_objChartTripSpeed.leftAxis().ShowTitle = true;
            this.ST_objChartTripSpeed.leftAxis().Title = "Depth (" + this.state.objPlotData.depthUnit + ")";
            this.ST_objChartTripSpeed.leftAxis().DisplayOrder = 1;
            this.ST_objChartTripSpeed.leftAxis().Visible = true;

            this.ST_objChartTripSpeed.bottomAxis().AutoScale = true;
            this.ST_objChartTripSpeed.bottomAxis().bandScale = true;
            this.ST_objChartTripSpeed.bottomAxis().Min = 100;
            this.ST_objChartTripSpeed.bottomAxis().Max = 200;
            this.ST_objChartTripSpeed.bottomAxis().Title = "Speed";
            this.ST_objChartTripSpeed.bottomAxis().ShowLabels = true;
            this.ST_objChartTripSpeed.bottomAxis().ShowTitle = true;
            this.ST_objChartTripSpeed.bottomAxis().LabelAngel = 90;
            this.ST_objChartTripSpeed.bottomAxis().ShowSelector = false;
            this.ST_objChartTripSpeed.bottomAxis().IsDateTime = false;
            this.ST_objChartTripSpeed.bottomAxis().Visible = true;



            this.ST_objChartTripSpeed.MarginLeft = 0; //10;
            this.ST_objChartTripSpeed.MarginBottom = 0; //40;
            this.ST_objChartTripSpeed.MarginTop = 0; //10;
            this.ST_objChartTripSpeed.MarginRight = 0; // 10;



            this.ST_objChartTripSpeed.initialize();
            this.ST_objChartTripSpeed.reDraw();




            ////Bar TripConn Chart
            this.ST_objChart3BarTripConn = new Chart(this, "ChartTripConnectionsBar1");
            this.ST_objChart3BarTripConn.ContainerId = "ChartTripConnectionsBar";

            this.ST_objChart3BarTripConn.leftAxis().AutoScale = true;
            this.ST_objChart3BarTripConn.leftAxis().Min = 0;
            this.ST_objChart3BarTripConn.leftAxis().Max = 100;
            this.ST_objChart3BarTripConn.leftAxis().Inverted = false;
            this.ST_objChart3BarTripConn.leftAxis().ShowLabels = true;
            this.ST_objChart3BarTripConn.leftAxis().ShowTitle = true;
            this.ST_objChart3BarTripConn.leftAxis().Title = "Time (Min.)"
            this.ST_objChart3BarTripConn.leftAxis().DisplayOrder = 1;
            this.ST_objChart3BarTripConn.leftAxis().Visible = true;

            this.ST_objChart3BarTripConn.bottomAxis().AutoScale = true;
            this.ST_objChart3BarTripConn.bottomAxis().bandScale = true;
            this.ST_objChart3BarTripConn.bottomAxis().Min = 100;
            this.ST_objChart3BarTripConn.bottomAxis().Max = 200;
            this.ST_objChart3BarTripConn.bottomAxis().Title = "Depth (" + this.state.objPlotData.depthUnit + ")";
            this.ST_objChart3BarTripConn.bottomAxis().ShowLabels = true;
            this.ST_objChart3BarTripConn.bottomAxis().ShowTitle = true;
            this.ST_objChart3BarTripConn.bottomAxis().LabelAngel = 90;
            this.ST_objChart3BarTripConn.bottomAxis().ShowSelector = false;
            this.ST_objChart3BarTripConn.bottomAxis().IsDateTime = false;
            this.ST_objChart3BarTripConn.bottomAxis().Visible = true;



            this.ST_objChart3BarTripConn.MarginLeft = 0; //10;
            this.ST_objChart3BarTripConn.MarginBottom = 0; //40;
            this.ST_objChart3BarTripConn.MarginTop = 0; //10;
            this.ST_objChart3BarTripConn.MarginRight = 0; // 10;



            this.ST_objChart3BarTripConn.initialize();
            this.ST_objChart3BarTripConn.reDraw();



            window.addEventListener("resize", this.refreshChart);
            this.loadTripReport();

        } catch (error) { }
    }





    onAfterAxisDrawSeries = (e: ChartEventArgs, i: number) => {
        try {

            // '//Drawing Avg. Lines per section
            d3.selectAll(".avgTimeLine").remove();
            let startIndex = 0;
            let endIndex = 0;

            //let   arrData  : any[]= this.state.objPlotData.tripData.Values.ToArray();
            let arrData: any[] = Object.values(this.state.objPlotData.tripData);

            arrData.sort();

            let RunningSection: string = "";

            for (let i = 0; i <= arrData.length - 1; i++) {
                if (i > 0) {
                    if (arrData[i].PhaseName.trim().toUpperCase() != RunningSection.trim().toUpperCase()) {
                        endIndex = i - 1;


                        if (Math.abs(startIndex - endIndex) > 0) {

                            // '//Only draw line if more than one
                            let sectionAvg = 0;
                            let sumAvgTime = 0;
                            let counterAvgTime = 0;

                            for (let j = startIndex; j <= endIndex; j++) {
                                sumAvgTime = sumAvgTime + arrData[j].AvgConnTime;
                                counterAvgTime += 1;
                            }

                            if (sumAvgTime > 0 && counterAvgTime > 0) {
                                sectionAvg = eval(Number(sumAvgTime / counterAvgTime).toFixed(2));
                            }

                            let x1 = this.objChart1.bottomAxis().ScaleRef((startIndex + 1));
                            let x2 = this.objChart1.bottomAxis().ScaleRef((endIndex + 1));

                            let y1 = this.objChart1.leftAxis().ScaleRef(sectionAvg);
                            let y2 = y1;



                            this.objChart1.SVGRect
                                //.attr("transform", "translate(" + x1 + "," + y1 + ") ")    

                                .append("line")
                                .attr("class", "avgTimeLine")
                                .attr("stroke", "red")
                                //.attr("stroke-width", 2) //wip
                                .attr("x1", x1)     // x position of the first end of the line
                                .attr("y1", y1)      // y position of the first end of the line
                                .attr("x2", x2)     // x position of the second end of the line
                                .attr("y2", y2);    // y position of the second end of the line



                        }


                        // '//Re-initialize the counters
                        startIndex = i;
                    }
                }

                RunningSection = arrData[i].PhaseName;
            }



            if (startIndex < arrData.length - 1) {
                endIndex = arrData.length - 1;

                if (Math.abs(startIndex - endIndex) > 0) {


                    let sectionAvg = 0;
                    let sumAvgTime = 0;
                    let counterAvgTime = 0;

                    for (let j = startIndex; j <= endIndex; j++) {
                        sumAvgTime = sumAvgTime + arrData[j].AvgConnTime;
                        counterAvgTime += 1;
                    }

                    if (sumAvgTime > 0 && counterAvgTime > 0)
                        sectionAvg = eval(Number(sumAvgTime / counterAvgTime).toFixed(2));


                    let x1 = this.objChart1.bottomAxis().ScaleRef(startIndex + 1);
                    let x2 = this.objChart1.bottomAxis().ScaleRef(endIndex + 1);

                    let y1 = this.objChart1.leftAxis().ScaleRef(sectionAvg);
                    let y2 = y1;

                    this.objChart1.SVGRect.append("g")
                        //.attr("transform", "translate(" + x1 + "," + y1 + ") ")    
                        .append("line")
                        .attr("class", "avgTimeLine")
                        .attr("stroke", "red")
                        .attr("x1", x1)     // x position of the first end of the line
                        .attr("y1", y1)      // y position of the first end of the line
                        .attr("x2", x2)     // x position of the second end of the line
                        .attr("y2", y2);    // y position of the second end of the line
                }
            }

        } catch (error) {

        }

    }




    plotPage2Charts = () => {

        try {
            this.objChart1.Title = "Average Tripping Connection Times";
            this.objChart1.MarginTop = 20; //10;
            this.objChart1.initialize();


            //Clear all the series
            this.objChart1.DataSeries.clear();
            this.objChart1.ShowLegend = false;
            this.objChart1.updateChart();

            //Configure Axes
            this.objChart1.leftAxis().Inverted = false;
            this.objChart1.leftAxis().AutoScale = true;
            this.objChart1.leftAxis().Title = "Average Time (Min.)";
            this.objChart1.leftAxis().ShowSelector = false;
            this.objChart1.leftAxis().ShowTitle = true;
            this.objChart1.leftAxis().Visible = true;

            this.objChart1.bottomAxis().AutoScale = true;
            this.objChart1.bottomAxis().Title = "Trips";
            this.objChart1.bottomAxis().LabelAngel = 0;
            this.objChart1.bottomAxis().ShowSelector = false;
            this.objChart1.bottomAxis().ShowTitle = true;
            this.objChart1.bottomAxis().Visible = true;
            this.objChart1.bottomAxis().PaddingMin = 10;

            //this.objChart1.initialize();


            let objAvgConnTime = new DataSeries();
            objAvgConnTime.Id = "AvgConnTime";
            objAvgConnTime.Title = "AvgConnTime";
            objAvgConnTime.Type = dataSeriesType.Line;
            objAvgConnTime.Color = "Blue";
            objAvgConnTime.XAxisId = this.objChart1.bottomAxis().Id;
            objAvgConnTime.YAxisId = this.objChart1.leftAxis().Id;
            objAvgConnTime.LineWidth = 3;
            objAvgConnTime.ShowInLegend = false;
            objAvgConnTime.CurveStyle = curveStyle.normal;
            objAvgConnTime.ShowPointsOnLineSeries = true;
            objAvgConnTime.PointStyle = pointStyle.Circle;
            objAvgConnTime.PointSize = 7;

            this.objChart1.DataSeries.set(objAvgConnTime.Id, objAvgConnTime);
            //Populate data in objAvgConnTime


            let AvgConnTimeData: any = Object.values(this.state.objPlotData.tripData);
            if (AvgConnTimeData != null || AvgConnTimeData != undefined) {

                for (let index = 0; index < AvgConnTimeData.length; index++) {

                    let objDataPoint = new ChartData();
                    objDataPoint.x = index + 1;
                    objDataPoint.y = AvgConnTimeData[index].AvgConnTime
                    objAvgConnTime.Data.push(objDataPoint);
                }

            }

            debugger;
            this.objChart1.reDraw();
            this.plotAvgConnBarChart();

        } catch (error) {
        }
    }

    plotAvgConnBarChart = () => {
        try {

            //TripConnChart
            //  this.objChart2 = new Chart(this, "TripReport");
            //  this.objChart2.ContainerId = "TripConnChart";
            //  this.objChart2.Title = "Tripping Connection Times";
            this.objChart2.updateChart();

            this.objChart2.leftAxis().AutoScale = true;
            this.objChart2.leftAxis().Min = 0;
            this.objChart2.leftAxis().Max = 100;
            this.objChart2.leftAxis().Inverted = false;
            this.objChart2.leftAxis().ShowLabels = true;
            this.objChart2.leftAxis().ShowTitle = true;
            this.objChart2.leftAxis().Title = "Average Time (min.)";
            this.objChart2.leftAxis().DisplayOrder = 1;
            this.objChart2.leftAxis().Visible = true;

            this.objChart2.bottomAxis().AutoScale = true;
            this.objChart2.bottomAxis().bandScale = true; //prath
            this.objChart2.bottomAxis().Min = 100;
            this.objChart2.bottomAxis().Max = 200;
            this.objChart2.bottomAxis().Title = "Trips";
            this.objChart2.bottomAxis().ShowLabels = true;
            this.objChart2.bottomAxis().ShowTitle = true;
            this.objChart2.bottomAxis().LabelAngel = 0;
            this.objChart2.bottomAxis().ShowSelector = true;
            this.objChart2.bottomAxis().IsDateTime = false;
            this.objChart2.bottomAxis().Visible = true;



            // this.objChart.rightAxis().Visible = true;

            this.objChart2.MarginLeft = 0; //10;
            this.objChart2.MarginBottom = 0; //40;
            this.objChart2.MarginTop = 10; //10;
            this.objChart2.MarginRight = 0; // 10;

            let uniqueSections: any = [];
            let arrData: any = Object.values(this.state.objPlotData.tripData);

            for (let i: number = 0; i <= arrData.length - 1; i++) {

                let section: string = arrData[i].PhaseName.trim().toUpperCase();

                let foundIndex = uniqueSections.findIndex((e: any) => e.trim().toUpperCase() == section);
                if (foundIndex == -1) {
                    uniqueSections.push(section);
                }
            }


            let sectionCounter: number = 0;
            let tripCounter: number = 0;
            for (let index = 0; index < uniqueSections.length; index++) {
                const strSection = uniqueSections[index];
                let objSeries = new DataSeries();
                objSeries.Id = strSection;
                objSeries.Title = strSection;
                objSeries.Type = dataSeriesType.Bar;
                objSeries.Stacked = false;
                objSeries.ShowLabelOnSeries = true;
                objSeries.Color = this.getColorForBar(sectionCounter);
                objSeries.XAxisId = this.objChart2.bottomAxis().Id;
                objSeries.YAxisId = this.objChart2.leftAxis().Id;
                objSeries.ShowInLegend = true;
                this.objChart2.DataSeries.set(objSeries.Id, objSeries);
                sectionCounter = sectionCounter + 1;

                objSeries.LineWidth = 25

                // ''Add data to the series
                for (let index = 0; index < arrData.length; index++) {

                    if (arrData[index].PhaseName.trim().toUpperCase() == strSection) {
                        if (arrData[index].AvgConnTime > 0) {
                            tripCounter += 1;
                            let objDataPoint = new ChartData();
                            objDataPoint.x = tripCounter;
                            objDataPoint.y = arrData[index].AvgConnTime
                            objSeries.Data.push(objDataPoint);
                        }
                    }
                }
            }
            this.objChart2.reDraw();


        } catch (error) {

        }
    }

    getColorForBar = (paramIndex: number) => {
        try {
            let colorTable: any = [];
            colorTable.push("Blue");
            colorTable.push("Red");
            colorTable.push("Green");
            colorTable.push("Yellow");
            colorTable.push("Brown");


            if ((paramIndex <= 5)) {
                return colorTable[paramIndex];
            }
            else {
                return util.getRandomColor();
            }
        } catch (error) {

        }
    }

    plotPage3Charts = () => {
        try {



            //Clear all the series
            this.objChart3.initialize();
            this.objChart3.DataSeries.clear();
            this.objChart3.ShowLegend = true;
            this.objChart3.updateChart();

            this.objChart3.leftAxis().AutoScale = true;
            this.objChart3.leftAxis().Min = 0;
            this.objChart3.leftAxis().Max = 100;
            this.objChart3.leftAxis().Inverted = true;
            this.objChart3.leftAxis().ShowLabels = true;
            this.objChart3.leftAxis().ShowTitle = true;
            this.objChart3.leftAxis().Title = "Depth (" + this.state.objPlotData.depthUnit + ")";
            this.objChart3.leftAxis().DisplayOrder = 1;
            this.objChart3.leftAxis().Visible = true;

            this.objChart3.bottomAxis().AutoScale = true;
            this.objChart3.bottomAxis().bandScale = false;
            this.objChart3.bottomAxis().Min = 100;
            this.objChart3.bottomAxis().Max = 200;
            this.objChart3.bottomAxis().Title = "Speed with Connection (" + this.state.objPlotData.depthUnit + "/Hr.)";
            this.objChart3.bottomAxis().ShowLabels = true;
            this.objChart3.bottomAxis().ShowTitle = true;
            this.objChart3.bottomAxis().LabelAngel = 0;
            this.objChart3.bottomAxis().ShowSelector = false;
            this.objChart3.bottomAxis().IsDateTime = false;
            this.objChart3.bottomAxis().Visible = true;

            // this.objChart.rightAxis().Visible = true;

            this.objChart3.MarginLeft = 0; //10;
            this.objChart3.MarginBottom = 0; //40;
            this.objChart3.MarginTop = 0; //10;
            this.objChart3.MarginRight = 0; // 10;


            this.objChart3.reDraw();

            let uniqueSections: any = [];
            let arrData: any = Object.values(this.state.objPlotData.tripData);

            for (let i: number = 0; i <= arrData.length - 1; i++) {

                let section: string = arrData[i].PhaseName.trim().toUpperCase();

                let foundIndex = uniqueSections.findIndex((e: any) => e.trim().toUpperCase() == section);
                if (foundIndex == -1) {
                    uniqueSections.push(section);
                }
            }


            let sectionCounter: number = 0;

            for (let index = 0; index < uniqueSections.length; index++) {
                const strSection = uniqueSections[index];
                let objSeries = new DataSeries();
                objSeries.Id = strSection;
                objSeries.Title = strSection;
                objSeries.Type = dataSeriesType.Point;
                objSeries.Color = this.getColorForBar(sectionCounter);
                objSeries.XAxisId = this.objChart3.bottomAxis().Id;
                objSeries.YAxisId = this.objChart3.leftAxis().Id;
                objSeries.ShowInLegend = true;
                objSeries.PointStyle = pointStyle.Diamond;
                objSeries.PointSize = 7;
                objSeries.PointWidth = 10;
                objSeries.PointHeight = 10;

                this.objChart3.DataSeries.set(objSeries.Id, objSeries);
                sectionCounter = sectionCounter + 1;



                // ''Add data to the series
                for (let index1 = 0; index1 < arrData.length; index1++) {

                    if (arrData[index1].PhaseName.trim().toUpperCase() == strSection) {
                        let tripData: any = Object.values(arrData[index1].ContTripSpeedWithConn);

                        for (let i = 0; i < tripData.length; i++) {
                            let objDataPoint = new ChartData();
                            objDataPoint.x = tripData[i].Speed;
                            objDataPoint.y = tripData[i].Depth
                            objSeries.Data.push(objDataPoint);
                        }


                    }
                }
            }





            this.objChart3.reDraw();


            //Clear all the series
            this.objChart4.DataSeries.clear();
            this.objChart4.ShowLegend = true;
            this.objChart4.updateChart();

            this.objChart4.leftAxis().AutoScale = true;
            this.objChart4.leftAxis().Min = 0;
            this.objChart4.leftAxis().Max = 100;
            this.objChart4.leftAxis().Inverted = true;
            this.objChart4.leftAxis().ShowLabels = true;
            this.objChart4.leftAxis().ShowTitle = true;
            this.objChart4.leftAxis().Title = "Depth (" + this.state.objPlotData.depthUnit + ")";
            this.objChart4.leftAxis().DisplayOrder = 1;
            this.objChart4.leftAxis().Visible = true;

            this.objChart4.bottomAxis().AutoScale = true;
            this.objChart4.bottomAxis().bandScale = false;
            this.objChart4.bottomAxis().Min = 100;
            this.objChart4.bottomAxis().Max = 200;
            this.objChart4.bottomAxis().Title = "Speed with Connection (" + this.state.objPlotData.depthUnit + "/Hr.)";
            this.objChart4.bottomAxis().ShowLabels = true;
            this.objChart4.bottomAxis().ShowTitle = true;
            this.objChart4.bottomAxis().LabelAngel = 0;
            this.objChart4.bottomAxis().ShowSelector = false;
            this.objChart4.bottomAxis().IsDateTime = false;
            this.objChart4.bottomAxis().Visible = true;

            // this.objChart.rightAxis().Visible = true;

            this.objChart4.MarginLeft = 0; //10;
            this.objChart4.MarginBottom = 0; //40;
            this.objChart4.MarginTop = 10; //10;
            this.objChart4.MarginRight = 0; // 10;

            this.objChart4.initialize();
            this.objChart4.reDraw();

            uniqueSections = [];
            arrData = Object.values(this.state.objPlotData.tripData);

            for (let i: number = 0; i <= arrData.length - 1; i++) {

                let section: string = arrData[i].PhaseName.trim().toUpperCase();

                let foundIndex = uniqueSections.findIndex((e: any) => e.trim().toUpperCase() == section);
                if (foundIndex == -1) {
                    uniqueSections.push(section);
                }
            }


            sectionCounter = 0;
            let objSeries = new DataSeries();
            for (let index = 0; index < uniqueSections.length; index++) {
                const strSection = uniqueSections[index];
                objSeries = new DataSeries();
                objSeries.Id = strSection;
                objSeries.Title = strSection;
                objSeries.Type = dataSeriesType.Point;
                objSeries.Color = this.getColorForBar(sectionCounter);
                objSeries.XAxisId = this.objChart4.bottomAxis().Id;
                objSeries.YAxisId = this.objChart4.leftAxis().Id;
                objSeries.ShowInLegend = true;
                objSeries.PointStyle = pointStyle.Diamond;
                objSeries.PointWidth = 10;
                objSeries.PointHeight = 10;
                //objSeries.PointSize = 15;
                //alert(objSeries.Id);
                //console.log(arrData);

                this.objChart4.DataSeries.set(objSeries.Id, objSeries);
                sectionCounter = sectionCounter + 1;



                // ''Add data to the series
                for (let index1 = 0; index1 < arrData.length; index1++) {

                    if (arrData[index1].PhaseName.trim().toUpperCase() == strSection) {
                        let tripData: any = Object.values(arrData[index1].ContTripSpeedWOConn);

                        for (let i = 0; i < tripData.length; i++) {
                            let objDataPoint = new ChartData();
                            objDataPoint.x = tripData[i].Speed;
                            objDataPoint.y = tripData[i].Depth
                            objSeries.Data.push(objDataPoint);
                            console.log(objSeries.Id + " x=" + objDataPoint.x + " y=" + objDataPoint.y);
                        }


                    }
                }
            }

            this.objChart4.reDraw();



        } catch (error) {

        }
    }


    refreshChart = () => {

        //this.objChart.LegendPosition = 4; // 1 (left), 2 (right), 3 (top), 4 (bottom)

        if (this.state.selectedTab == 1) {
            this.plotPage2Charts();
        }

        if (this.state.selectedTab == 2) {
            this.plotPage3Charts();
        }

        if (this.state.selectedTab == 3) {
            this.refreshSingleTripReport();
        }


        document.title = this.state.objPlotData.WellName + " -Trip Report";
    }

    refreshContiTripSpeedChart = () => {
        try {
            //objTripData.ContTripSpeedWOConn100.Values.ToArray        
            //objTripData.ContTripSpeedWithConn100.Values.ToArray


            this.ST_objChartTripSpeed.updateChart();

            ////ChartTripSpeed Chart
            this.ST_objChartTripSpeed = new Chart(this, "ChartTripSpeed1");
            this.ST_objChartTripSpeed.ContainerId = "ChartTripSpeed";

            this.ST_objChartTripSpeed.leftAxis().AutoScale = true;
            this.ST_objChartTripSpeed.leftAxis().Min = 0;
            this.ST_objChartTripSpeed.leftAxis().Max = 100;
            this.ST_objChartTripSpeed.leftAxis().Inverted = true;
            this.ST_objChartTripSpeed.leftAxis().ShowLabels = true;
            this.ST_objChartTripSpeed.leftAxis().ShowTitle = true;
            this.ST_objChartTripSpeed.leftAxis().Title = "Depth (" + this.state.objPlotData.depthUnit + ")";
            this.ST_objChartTripSpeed.leftAxis().DisplayOrder = 1;
            this.ST_objChartTripSpeed.leftAxis().Visible = true;

            this.ST_objChartTripSpeed.bottomAxis().AutoScale = true;
            this.ST_objChartTripSpeed.bottomAxis().bandScale = false;
            this.ST_objChartTripSpeed.bottomAxis().Min = 100;
            this.ST_objChartTripSpeed.bottomAxis().Max = 200;
            this.ST_objChartTripSpeed.bottomAxis().Title = "Speed (" + this.state.objPlotData.depthUnit + "/hr.)";
            this.ST_objChartTripSpeed.bottomAxis().ShowLabels = true;
            this.ST_objChartTripSpeed.bottomAxis().ShowTitle = true;
            this.ST_objChartTripSpeed.bottomAxis().LabelAngel = 90;
            this.ST_objChartTripSpeed.bottomAxis().ShowSelector = false;
            this.ST_objChartTripSpeed.bottomAxis().IsDateTime = false;
            this.ST_objChartTripSpeed.bottomAxis().Visible = true;



            this.ST_objChartTripSpeed.MarginLeft = 0; //10;
            this.ST_objChartTripSpeed.MarginBottom = 0; //40;
            this.ST_objChartTripSpeed.MarginTop = 0; //10;
            this.ST_objChartTripSpeed.MarginRight = 0; // 10;



            // this.ST_objChartTripSpeed.initialize();
            // this.ST_objChartTripSpeed.reDraw();





            let objSeries: DataSeries = new DataSeries();
            objSeries.Id = "TripSpeedWOConnection";
            objSeries.Name = "Trip Speed W/o Conn";
            objSeries.XAxisId = this.ST_objChartTripSpeed.bottomAxis().Id;
            objSeries.YAxisId = this.ST_objChartTripSpeed.leftAxis().Id;
            objSeries.Type = dataSeriesType.Line;

            objSeries.LineWidth = 3;

            objSeries.Title = "Speed W/o Connection";
            objSeries.Color = "#18FFFF"; //"steelBlue";
            objSeries.ShowInLegend = true;

            this.ST_objChartTripSpeed.DataSeries.set(objSeries.Id, objSeries);

            //Populate the data series with this data
            objSeries.Data.slice(0, objSeries.Data.length);

            let plotData: any = Object.values(this.state.SingleTripReportData.arrSpeedWO);

            for (let i = 0; i < plotData.length; i++) {
                let objVal: ChartData = new ChartData();
                objVal.x = Number(Number(plotData[i].Speed).toFixed(0));
                objVal.y = Number(Number(plotData[i].Depth).toFixed(0));
                objSeries.Data.push(objVal);
            }

            //Line2
            plotData = Object.values(this.state.SingleTripReportData.arrSpeedWith);
            if (plotData.length > 0) {
                objSeries = new DataSeries();
                objSeries.Id = "TripSpeedWithConnection";
                objSeries.Name = "Speed with Connection";
                objSeries.XAxisId = this.ST_objChartTripSpeed.bottomAxis().Id;
                objSeries.YAxisId = this.ST_objChartTripSpeed.leftAxis().Id;
                objSeries.Type = dataSeriesType.Line;
                objSeries.LineWidth = 3;

                objSeries.Title = "Speed With Connection";
                objSeries.Color = "#FF3D00";
                objSeries.ShowInLegend = true;

                this.ST_objChartTripSpeed.DataSeries.set(objSeries.Id, objSeries);

                //Populate the data series with this data
                objSeries.Data.slice(0, objSeries.Data.length);

                for (let i = 0; i < plotData.length; i++) {
                    let objVal: ChartData = new ChartData();
                    objVal.x = Number(Number(plotData[i].Speed).toFixed(0));
                    objVal.y = Number(Number(plotData[i].Depth).toFixed(0));
                    objSeries.Data.push(objVal);
                }
            }

            this.ST_objChartTripSpeed.reDraw();




        } catch (error) {

        }
    }

    refreshTripConectionBarChart = () => {
        try {
            ////Bar TripConn Chart
            this.ST_objChart3BarTripConn = new Chart(this, "ChartTripConnectionsBar1");
            this.ST_objChart3BarTripConn.ContainerId = "ChartTripConnectionsBar";

            this.ST_objChart3BarTripConn.leftAxis().AutoScale = true;
            this.ST_objChart3BarTripConn.leftAxis().Min = 0;
            this.ST_objChart3BarTripConn.leftAxis().Max = 100;
            this.ST_objChart3BarTripConn.leftAxis().Inverted = false;
            this.ST_objChart3BarTripConn.leftAxis().ShowLabels = true;
            this.ST_objChart3BarTripConn.leftAxis().ShowTitle = true;
            this.ST_objChart3BarTripConn.leftAxis().Title = "Time (Min.)"
            this.ST_objChart3BarTripConn.leftAxis().DisplayOrder = 1;
            this.ST_objChart3BarTripConn.leftAxis().Visible = true;

            this.ST_objChart3BarTripConn.bottomAxis().AutoScale = true;
            this.ST_objChart3BarTripConn.bottomAxis().bandScale = true;
            this.ST_objChart3BarTripConn.bottomAxis().Min = 100;
            this.ST_objChart3BarTripConn.bottomAxis().Max = 200;
            this.ST_objChart3BarTripConn.bottomAxis().Title = "Depth (" + this.state.objPlotData.depthUnit + ")";
            this.ST_objChart3BarTripConn.bottomAxis().ShowLabels = true;
            this.ST_objChart3BarTripConn.bottomAxis().ShowTitle = true;
            this.ST_objChart3BarTripConn.bottomAxis().LabelAngel = 90;
            this.ST_objChart3BarTripConn.bottomAxis().ShowSelector = false;
            this.ST_objChart3BarTripConn.bottomAxis().IsDateTime = false;
            this.ST_objChart3BarTripConn.bottomAxis().Visible = true;


            this.ST_objChart3BarTripConn.MarginLeft = 0; //10;
            this.ST_objChart3BarTripConn.MarginBottom = 0; //40;
            this.ST_objChart3BarTripConn.MarginTop = 0; //10;
            this.ST_objChart3BarTripConn.MarginRight = 0; // 10;


            // Dim arrConn() As TripConn = listConn.Values.ToArray

            // ''Array.Sort(arrConn)

            // For i As Integer = 0 To arrConn.Length - 1

            //     Dim objItem As TripConn = arrConn(i)

            //     Bar1.Add((objItem.Time / 60), Math.Round(objItem.Depth).ToString)

            //     If objItem.DayNight = "D" Then
            //         Bar1.Colors(Bar1.Count - 1) = Color.Orange
            //     Else
            //         Bar1.Colors(Bar1.Count - 1) = Color.Black
            //     End If

            // Next

            let objSeries = new DataSeries();
            objSeries.Id = "STSBar";
            objSeries.Title = "Slips to Slips";
            objSeries.Type = dataSeriesType.Bar;
            objSeries.Stacked = true;
            objSeries.Color = "Green"; //#f58b54
            objSeries.ColorEach = true;
            objSeries.XAxisId = this.ST_objChart3BarTripConn.bottomAxis().Id;
            objSeries.YAxisId = this.ST_objChart3BarTripConn.leftAxis().Id;
            objSeries.LineWidth = 3;
            objSeries.CurveStyle = curveStyle.normal;

            this.ST_objChart3BarTripConn.DataSeries.set(objSeries.Id, objSeries);

            //Load data

            for (let i = 0; i < this.state.SingleTripReportData.arrConn.length; i++) {
                let objItem: any = this.state.SingleTripReportData.arrConn[i];
                let objSTSPoint = new ChartData();
                objSTSPoint.x = Number(Number(objItem.Depth).toFixed());
                objSTSPoint.y = Number(Number(objItem.Time / 60).toFixed());
                if (objItem.DayNight == "D") {
                    objSTSPoint.color = "Yellow";
                    //yellow
                } else {
                    //Black
                    objSTSPoint.color = "Black";
                    this.ST_objChart3BarTripConn.isNightConnection = true;
                }
                objSeries.Data.push(objSTSPoint);

            }

            this.ST_objChart3BarTripConn.reDraw();

        } catch (error) {

        }
    }

    refreshPieChart = () => {
        try {

            this.ST_objChart2_Pie.initialize();

            //Clear all the series
            this.ST_objChart2_Pie.DataSeries.clear();

            this.ST_objChart2_Pie.updateChart();

            //Add new serieses

            let objPieSeries = new DataSeries();
            objPieSeries.Id = "FlatMovementTime";
            //objPieSeries.Stacked = false;
            objPieSeries.Title = "";
            objPieSeries.Type = dataSeriesType.Pie;
            objPieSeries.PieRadius = 70.0; //set Size of Pie circle;

            this.ST_objChart2_Pie.DataSeries.set(objPieSeries.Id, objPieSeries);



            //Fill up the data for data series

            let flatPercent: number = this.state.SingleTripReportData.flatPercent;
            let movePercent: number = this.state.SingleTripReportData.movePercent;
            let objPieData = new ChartData();
            objPieData.y = eval(Number(flatPercent).toFixed(2));
            objPieData.label = "Flat Time (" + flatPercent.toString() + ")";
            objPieData.color = "blue";
            objPieSeries.Data.push(objPieData);
            //Fill up the data for data series
            objPieData = new ChartData();
            objPieData.y = movePercent;
            objPieData.label = "Mov.Time (" + movePercent.toString() + ")"
            objPieData.color = "orange";
            objPieSeries.Data.push(objPieData);

            this.ST_objChart2_Pie.reDraw();

        } catch (error) {

        }
    }

    // refreshStatistics=()=>{
    //     try {
    //         //pending

    //     } catch (error) {

    //     }
    // }
    refreshSingleTripReport = () => {
        try {

            if (this.state.SingleTripReportData == null || this.state.SingleTripReportData == undefined) {
                let warnnings = this.state.warningMsg;
                warnnings.push("Something went wrong while generating Single Trip Report, object is null");
                this.setState({
                    warningMsg: warnnings
                })
                return;
            }



            this.refreshPieChart();
            this.refreshContiTripSpeedChart();
            this.refreshTripConectionBarChart();
            //this.refreshStatistics();


        } catch (error) {

        }
    }
    plotSingleTripReport = () => {
        try {







        } catch (error) {

        }
    }


    loadTripReport = () => {
        try {

            Util.StatusInfo("Getting data from the server  ");
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Summary.Manager";
            objBrokerRequest.Broker = "TripReportBroker";
            objBrokerRequest.Function = "generateTripReport";



            objParameter = new BrokerParameter("WellID", this.WellID);
            objBrokerRequest.Parameters.push(objParameter);
            this.AxiosSource = axios.CancelToken.source();
            axios
                .get(_gMod._getData, {
                    cancelToken: this.AxiosSource.token,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then((res) => {

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
                    let objData_: any = JSON.parse(res.data.Response);
                    console.log("PlotData", objData_);


                    if (objData_ != "" || objData_ != undefined) {
                        this.setState({
                            objPlotData: objData_,
                            objGridData: objData_.grdData,
                        });


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

        // if (e.selected == 1) {
        //     this.plotPage2Charts();
        // }

        // if (e.selected == 2) {
        //     this.plotPage3Charts();
        // }
        //this.refreshChart();
    }

    grdRowClick = (objRow: any) => {
        try {

            if (objRow.dataItem.COL_PHASE_ID == null) {

                confirmAlert({
                    //title: 'eVuMax',
                    message: 'Please Select the Trip from the table',
                    childrenElement: () => <div />,
                    buttons: [
                        // {
                        //   // label: 'Ok',
                        //   // onClick: () => {
                        //   //   return
                        //   // }

                        // },
                        {
                            label: 'Ok',
                            onClick: () => null
                        }
                    ]
                });
                return;
            } else {

                this.setState({
                    showSingleTripReport: true,
                    selectedTab: 3
                });
                this.generateSingleTripReport(objRow.dataItem.COL_PHASE_INDEX)
            }

        } catch (error) {

        }
    }

    generateSingleTripReport = (PhaseIndex: number) => {
        try {


            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Summary.Manager";
            objBrokerRequest.Broker = "TripReportBroker";
            objBrokerRequest.Function = "refreshSingleTripStats";


            objParameter = new BrokerParameter("WellID", this.WellID);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("phaseIndexID", PhaseIndex.toString());
            objBrokerRequest.Parameters.push(objParameter);


            this.AxiosSource = axios.CancelToken.source();
            axios
                .get(_gMod._getData, {
                    cancelToken: this.AxiosSource.token,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then((res) => {

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
                    let objData_: any = JSON.parse(res.data.Response);
                    console.log("SingleTripReportData", objData_);


                    if (objData_ != "" || objData_ != undefined) {

                        this.setState({
                            SingleTripReportData: objData_
                        });


                        this.refreshSingleTripReport();
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



            this.refreshSingleTripReport();
        } catch (error) {

        }
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

                        <label className=" ml-5 mr-1" onClick={() => { this.refreshChart(); }} style={{ cursor: "pointer" }}>Undo Zoom</label>
                        <FontAwesomeIcon icon={faSearchMinus} size="lg" onClick={() => { this.refreshChart(); }} />

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

                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="float-right">
                            <button type="button" onClick={() => {
                                if (this.state.showSingleTripReport) {
                                    this.setState({ selectedTab: 3 });
                                } else {
                                    confirmAlert({
                                        //title: 'eVuMax',
                                        message: 'Please Select the Trip from the table',
                                        childrenElement: () => <div />,
                                        buttons: [
                                            {
                                                label: 'Ok',
                                                onClick: () => null
                                            }
                                        ]
                                    });
                                    return;
                                }

                            }} className="btn-custom btn-custom-primary ml-1">
                                Show Single Trip Report</button>
                        </div>

                    </div>
                </div>




                <TabStrip
                    selected={this.state.selectedTab}
                    onSelect={this.handleTabSelection}
                    keepTabsMounted={true}
                >
                    <TabStripTab title="Trip Report" >
                        <div

                        >
                            <Grid
                                className="mb-3 col-xl-12 col-lg-12 col-md-12 col-sm-12 "
                                style={{ height: "550px", width: "100%" }}//height:120px Vimal
                                resizable={true}
                                scrollable={"scrollable"}//make commented
                                sortable={true}
                                onRowClick={this.grdRowClick}
                                // editField="inEdit"
                                // selectedField="selected"
                                data={this.state.objGridData}
                            >

                                {/* <Column title="Unit">
                                    <Column field="xx" title="Price" />
                                    <Column  title="In Stock" />
                                </Column> */}
                                {false && <Column
                                    field="COL_PHASE_INDEX"

                                >
                                </Column>}
                                {false && <Column
                                    field="COL_PHASE_ID"
                                >
                                </Column>}
                                {false && <Column
                                    field="COL_STEP_ID"
                                >
                                </Column>}
                                {false && <Column
                                    field="COL_EMPH_ID"
                                >
                                </Column>}
                                <Column
                                    field="COL_SECTION"
                                    title="Section"
                                    width={80}
                                    cell={(props) => (
                                        <td style={{ backgroundColor: props.dataItem.COL_SECTION_BKCOLOR }} className="summaryLabelTripReport">
                                            <span>
                                                {" "}
                                                {props.dataItem.COL_SECTION}{" "}
                                            </span>
                                        </td>
                                    )}
                                >
                                </Column>

                                <Column
                                    field="COL_RUN"
                                    title="Run"
                                    width={100}
                                    cell={(props) => (
                                        <td style={{ backgroundColor: props.dataItem.COL_RUN_BKCOLOR }} className="summaryLabelTripReport">
                                            <span>
                                                {" "}
                                                {props.dataItem.COL_RUN}{" "}
                                            </span>
                                        </td>
                                    )}
                                >
                                </Column>

                                <Column
                                    field="COL_DIRECTION"
                                    title="Direction"
                                    width={90}
                                    className="summaryLabelTripReport"
                                />


                                <Column

                                    headerClassName="text-center"
                                    className="text-right "
                                    width="80px"
                                    field="COL_DEPTH"
                                    title="Depth"
                                    cell={(props) => (
                                        <td className="text-right summaryLabelTripReport" >
                                            <span>
                                                {" "}
                                                {formatNumber(props.dataItem.COL_DEPTH, "n2")}{" "}
                                            </span>
                                        </td>
                                    )}


                                />

                                <Column
                                    //headerClassName="text-center"
                                    className="summaryLabel"
                                    field="COL_START_DATE"
                                    title="Start Date"
                                    width="130px"

                                    cell={(props) => (

                                        <td className="text-left summaryLabelTripReport" style={{ backgroundColor: (props.dataItem.COL_START_DATE_BKCOLOR == null ? "" : props.dataItem.COL_START_DATE_BKCOLOR) }}>
                                            <span>
                                                {" "}
                                                {/* {moment(props.dataItem.COL_START_DATE).format("dd-mmm-yyyy HH:mm:ss")} */}
                                                {props.dataItem.COL_START_DATE}



                                            </span>
                                        </td>
                                    )}
                                />

                                <Column
                                    //headerClassName="text-center"
                                    className="summaryLabel"
                                    field="COL_END_DATE"
                                    title="End Date"
                                    width="150px"

                                    cell={(props) => (
                                        <td className="text-left summaryLabelTripReport">
                                            <span>
                                                {" "}
                                                {/* {moment(props.dataItem.COL_START_DATE).format("dd-mmm-yyyy HH:mm:ss")} */}
                                                {props.dataItem.COL_END_DATE}


                                            </span>
                                        </td>
                                    )}
                                />


                                <Column title="Time (Hr.)">
                                    <Column
                                        field="COL_TOTAL_TIME"
                                        width={90}
                                        title="Total"
                                        cell={(props) => (

                                            <td className="text-left summaryLabelTripReport" style={{ backgroundColor: (props.dataItem.COL_TOTAL_TIME_BKCOLOR == null ? "" : props.dataItem.COL_TOTAL_TIME_BKCOLOR) }}>
                                                <span>
                                                    {" "}
                                                    {props.dataItem.COL_TOTAL_TIME}
                                                </span>
                                            </td>
                                        )}
                                    >

                                    </Column>


                                    <Column
                                        field="COL_TIME_ON_SURFACE"
                                        width={80}
                                        title="on Surface"
                                        className="summaryLabelTripReport"
                                    />
                                </Column>

                                <Column
                                    title="Off to On Bottom"
                                >
                                    <Column
                                        field="COL_OFF_TO_ON_BTM_TIME"
                                        width={100}
                                        title="Time (Hr.)"
                                        cell={(props) => (

                                            <td className="text-left summaryLabelTripReport" style={{ backgroundColor: (props.dataItem.COL_OFF_TO_ON_BTM_TIME_BKCOLOR == null ? "" : props.dataItem.COL_OFF_TO_ON_BTM_TIME_BKCOLOR) }}>
                                                <span>
                                                    {" "}
                                                    {props.dataItem.COL_OFF_TO_ON_BTM_TIME}
                                                </span>
                                            </td>
                                        )}
                                    >
                                    </Column>

                                    <Column
                                        field="COL_OFF_TO_ON_BTM_SPEED"
                                        width={100}
                                        title="Speed (ft/hr.)"
                                        className="text-right summaryLabelTripReport"

                                    >
                                    </Column>
                                </Column>

                                <Column
                                    title="Speed (ft/hr.)"
                                >
                                    <Column
                                        field="COL_SPEED_WITH_CONN"
                                        width={100}
                                        title="W/Conn"
                                        cell={(props) => (

                                            <td className="text-left summaryLabelTripReport" style={{ backgroundColor: (props.dataItem.COL_SPEED_WITH_CONN_BKCOLOR == null ? "" : props.dataItem.COL_SPEED_WITH_CONN_BKCOLOR) }}>
                                                <span>
                                                    {" "}
                                                    {props.dataItem.COL_SPEED_WITH_CONN}
                                                </span>
                                            </td>
                                        )}
                                    >
                                    </Column>



                                    <Column
                                        field="COL_SPEED_WO_CONN"
                                        width={90}
                                        title="WO/Conn)"
                                        className="text-right summaryLabelTripReport"
                                    >
                                    </Column>
                                </Column>

                                <Column title="Delta Avg.">
                                    <Column
                                        field="COL_DIFF"
                                        title="Conn. Time(Min)"
                                        width={109}

                                        cell={(props) => (
                                            <td className="text-right summaryLabelTripReport" style={{ backgroundColor: props.dataItem.COL_DIFF_BKCOLOR }}>
                                                <span>
                                                    {" "}
                                                    {props.dataItem.COL_DIFF}{" "}
                                                </span>
                                            </td>
                                        )}
                                    >
                                    </Column>
                                </Column>


                                <Column
                                    field="COL_CONNECTIONS"
                                    width={"65px"}
                                    title="# Conns."
                                    className="text-right summaryLabelTripReport"
                                />


                                <Column title="Delta Speed (ft/hr)">
                                    <Column
                                        field="COL_DIFF_W"
                                        width={"80px"}
                                        title="W/Conn."
                                        cell={(props) => (
                                            <td className="text-right summaryLabelTripReport" style={{ backgroundColor: props.dataItem.COL_DIFF_W_BKCOLOR }}>
                                                <span>
                                                    {" "}
                                                    {props.dataItem.COL_DIFF_W}{" "}
                                                </span>
                                            </td>
                                        )}
                                    />

                                    <Column
                                        field="COL_DIFF_WO"
                                        width={"80px"}
                                        title="WO/Conn."
                                        cell={(props) => (
                                            <td className="text-right summaryLabelTripReport" style={{ backgroundColor: props.dataItem.COL_DIFF_WO_BKCOLOR }}>
                                                <span>
                                                    {" "}
                                                    {props.dataItem.COL_DIFF_WO}{" "}
                                                </span>
                                            </td>
                                        )}
                                    />
                                </Column>


                                <Column title="Avg. Conn. ">
                                    <Column
                                        field="COL_AVG_CONN_TIME"
                                        width={"80px"}
                                        title="Time (Min.)"
                                        className="text-right summaryLabelTripReport"
                                    />
                                </Column>

                                <Column title="Avg.Conn.Time(Min.)">
                                    <Column
                                        field="COL_AVG_DAY_TIME"
                                        width={"70px"}
                                        title="Day"
                                        className="text-right summaryLabelTripReport"
                                    />

                                    <Column
                                        field="COL_AVG_NIGHT_TIME"
                                        width={"70px"}
                                        title="Night"
                                        className="text-right summaryLabelTripReport"
                                    />
                                </Column>



                            </Grid>
                        </div>

                    </TabStripTab>
                    <TabStripTab title="Page 2">
                        <div>

                            <div
                                id="avgTripConnChart"
                                style={{
                                    height: "calc(34vh)",
                                    width: "calc(100vw - 130px)",
                                    backgroundColor: "transparent",
                                }}
                            >

                            </div>



                            <div className="mt-1">
                            </div>
                            <div
                                id="TripConnChart"
                                style={{
                                    marginTop: "0px",
                                    height: "calc(34vh)",
                                    width: "calc(100vw - 130px)",
                                    backgroundColor: "transparent",
                                }}
                            >

                            </div>

                            <div
                                id="TripConnChart_legend"
                                style={{
                                    textAlign: "center",
                                    height: "40px",
                                    width: "calc(100vw - 130px)",
                                    backgroundColor: "transparent",
                                    display: "inline-block",
                                }}
                            ></div>
                        </div>

                    </TabStripTab>

                    <TabStripTab title="Page 3">
                        <div>

                            <div
                                id="ContiTripSpeedWithConnChart"
                                style={{
                                    marginTop: "0px",
                                    height: "calc(33vh)",
                                    width: "calc(100vw - 130px)",
                                    backgroundColor: "transparent",
                                }}
                            >

                            </div>

                            <div
                                id="ContiTripSpeedWithConnChart_legend"
                                style={{
                                    textAlign: "center",
                                    height: "40px",
                                    width: "calc(100vw - 130px)",
                                    backgroundColor: "transparent",
                                    display: "inline-block",
                                }}
                            ></div>


                            <div
                                id="ContiTripSpeedWithOutConnChart"
                                style={{
                                    marginTop: "0px",
                                    height: "calc(33vh)",
                                    width: "calc(100vw - 130px)",
                                    backgroundColor: "transparent",
                                }}
                            >

                            </div>

                            <div
                                id="ContiTripSpeedWithOutConnChart_legend"
                                style={{
                                    textAlign: "center",
                                    height: "40px",
                                    width: "calc(100vw - 130px)",
                                    backgroundColor: "transparent",
                                    display: "inline-block",
                                }}
                            ></div>
                        </div>

                    </TabStripTab>


                    <TabStripTab title="Settings">
                        <div className="row" style={{ width: "50vw" }} >
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                <h6 style={{ display: "flex", justifyContent: "start" }} className="summaryGroupHeaderTripReport">Connection Time</h6>
                                <div className="group-inline">
                                    <div className="form-group">
                                        <label className="summaryLabelHeader-longTripReport">
                                            Min.Connection Time
                                        </label>
                                        <label className="ml-2" id="txtPositiveFlow">
                                            <NumericTextBox
                                                format="n2"
                                                width="80px"
                                                className="mr-2"
                                            //value={this.state.DrlgBenchMark}
                                            //   onChange={(event) => {
                                            //     this.disableRealTime();
                                            //     this.setState({
                                            //       DrlgBenchMark: event.target.value,
                                            //     });
                                            //   }}
                                            />
                                            (Min.)
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label className="summaryLabelHeader-longTripReport">
                                            Max.Connection Time
                                        </label>
                                        <label className="ml-2" id="txtPositiveFlow">
                                            <NumericTextBox
                                                format="n2"
                                                width="80px"
                                                className="mr-2"
                                            //value={this.state.DrlgBenchMark}
                                            //   onChange={(event) => {
                                            //     this.disableRealTime();
                                            //     this.setState({
                                            //       DrlgBenchMark: event.target.value,
                                            //     });
                                            //   }}
                                            />
                                            (Min.)
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <Checkbox
                                            className="mr-2"
                                            label={"Remove Fill-up Time"}
                                        //checked={this.state.ShowComments}
                                        // onChange={(event) => {
                                        //   this.setState({ ShowComments: event.value });
                                        // }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                <h6 style={{ display: "flex", justifyContent: "start" }} className="summaryGroupHeaderTripReport">Surface</h6>
                                <div className="group-inline">
                                    <div className="form-group">
                                        <label className="summaryLabelHeader-SmallTripReport">
                                            Surface Depth
                                        </label>
                                        <label className="ml-2" id="txtPositiveFlow">
                                            <NumericTextBox
                                                format="n2"
                                                width="80px"
                                                className="mr-2"
                                            //value={this.state.DrlgBenchMark}
                                            //   onChange={(event) => {
                                            //     this.disableRealTime();
                                            //     this.setState({
                                            //       DrlgBenchMark: event.target.value,
                                            //     });
                                            //   }}
                                            />
                                            Ft
                                        </label>
                                    </div>



                                </div>
                            </div>


                        </div>
                        <div className="row mt-5" style={{ width: "50vw" }} >
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                <h6 style={{ display: "flex", justifyContent: "start" }} className="summaryGroupHeaderTripReport">Benchmarking</h6>
                                <div className="group-inline">
                                    <div className="form-group">
                                        <label className="summaryLabelHeader-longTripReport">
                                            Benchmark Conn. Time
                                        </label>
                                        <label className="ml-2" id="txtPositiveFlow">
                                            <NumericTextBox
                                                format="n2"
                                                width="80px"
                                                className="mr-2"
                                            //value={this.state.DrlgBenchMark}
                                            //   onChange={(event) => {
                                            //     this.disableRealTime();
                                            //     this.setState({
                                            //       DrlgBenchMark: event.target.value,
                                            //     });
                                            //   }}
                                            />
                                            (Min.)
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label className="summaryLabelHeader-longTripReport">
                                            Trip Speed with connections
                                        </label>
                                        <label className="ml-2" id="txtPositiveFlow">
                                            <NumericTextBox
                                                format="n2"
                                                width="80px"
                                                className="mr-2"
                                            //value={this.state.DrlgBenchMark}
                                            //   onChange={(event) => {
                                            //     this.disableRealTime();
                                            //     this.setState({
                                            //       DrlgBenchMark: event.target.value,
                                            //     });
                                            //   }}
                                            />
                                            ft/hr
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <label className="summaryLabelHeader-longTripReport">
                                            Trip Speed w/o connections
                                        </label>
                                        <label className="ml-2" id="txtPositiveFlow">
                                            <NumericTextBox
                                                format="n2"
                                                width="80px"
                                                className="mr-2"
                                            //value={this.state.DrlgBenchMark}
                                            //   onChange={(event) => {
                                            //     this.disableRealTime();
                                            //     this.setState({
                                            //       DrlgBenchMark: event.target.value,
                                            //     });
                                            //   }}
                                            />
                                            ft/hr
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                <h6 style={{ display: "flex", justifyContent: "start" }} className="summaryGroupHeaderTripReport">Continuous Trip Speed</h6>
                                <div className="group-inline">
                                    <div className="form-group">
                                        <label className="summaryLabelHeader-SmallTripReport">
                                            Depth Interval
                                        </label>
                                        <label className="ml-2" id="txtPositiveFlow">
                                            <NumericTextBox
                                                format="n2"
                                                width="80px"
                                                className="mr-2"
                                            //value={this.state.DrlgBenchMark}
                                            //   onChange={(event) => {
                                            //     this.disableRealTime();
                                            //     this.setState({
                                            //       DrlgBenchMark: event.target.value,
                                            //     });
                                            //   }}
                                            />
                                            Ft
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <Checkbox
                                            className="mr-2"
                                            label={"Include Pipe Movement"}
                                        //checked={this.state.ShowComments}
                                        // onChange={(event) => {
                                        //   this.setState({ ShowComments: event.value });
                                        // }}
                                        />
                                    </div>


                                </div>
                            </div>


                        </div>
                    </TabStripTab>
                    {this.state.showSingleTripReport && <TabStripTab title="Single Trip Report">
                        <div
                            style={{
                                height: "calc(100vh - 250px)",
                                width: "calc(100vw - 130px)",
                                backgroundColor: "transparent",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: "400px",

                                    backgroundColor: "transparent",
                                    float: "left",
                                }}
                            >

                                {/* <label style={{ display: "flex", justifyContent: "center" }}>Continuous Tripping Speed</label> */}
                                <h6 style={{ display: "flex", justifyContent: "center" }} className="summaryGroupHeaderTripReport">Continuous Tripping Speed</h6>

                                <div
                                    id="ChartTripSpeed"
                                    style={{
                                        height: "calc(66vh)",
                                        minWidth: "380px",
                                        width: "calc(20vw)",
                                        backgroundColor: "transparent",
                                        marginLeft: "10px",
                                    }}
                                ></div>
                                <div
                                    id="ChartTripSpeed_legend"
                                    style={{
                                        textAlign: "justify",
                                        height: "40px",
                                        marginLeft: "10px",
                                        //width: "calc(30vw)",
                                        backgroundColor: "transparent",
                                        // display: "inline-block",
                                    }}
                                ></div>


                            </div>

                            <div
                                className="row"
                                style={{
                                    height: "100%",
                                    width: "calc(100% - 400px)",
                                    backgroundColor: "transparent",
                                    float: "right",
                                    margin: "0px"
                                }}
                            >

                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6" style={{ backgroundColor: "transparent", height: "50%" }}>
                                    {/* <label style={{ display: "flex", justifyContent: "center" }}>Flat and Movement Time</label> */}
                                    <h6 style={{ display: "flex", justifyContent: "center" }} className="summaryGroupHeaderTripReport">Flat and Movement Time</h6>
                                    <div
                                        id="CurrentPie_Chart"
                                        style={{
                                            backgroundColor: "transparent",
                                            height: "calc(32vh)",
                                            marginLeft: "5px",
                                        }}
                                    ></div>
                                </div>
                                <div className="col-xl-9 col-lg-8 col-md-6 col-sm-6" style={{ backgroundColor: "transparent", height: "50%" }}>

                                    <h6 style={{ display: "flex", justifyContent: "center" }} className="summaryGroupHeaderTripReport">Statistics</h6>
                                    <div className="row">
                                        <div className="col-4">

                                            <div className="group-inline">
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Section
                                                    </label>
                                                    <label className="summaryLabel" id="txtPositiveFlow">
                                                        {this.state.SingleTripReportData.lblSection}
                                                    </label>
                                                </div>
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Depth
                                                    </label>
                                                    <label className="summaryLabel" id="txtNegativeFlow">
                                                        {this.state.SingleTripReportData.lblDepth}
                                                    </label>
                                                </div>
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Avg. Conn. Time
                                                    </label>
                                                    <label className="summaryLabel" id="txtNetFlow">
                                                        {this.state.SingleTripReportData.lblAvgConnTime}
                                                    </label>
                                                </div>
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Avg. Conn. Time (Day)(Min.)
                                                    </label>
                                                    <label className="summaryLabel" id="txtNetFlow">
                                                        {this.state.SingleTripReportData.lblAvgTimeDay}
                                                    </label>
                                                </div>
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Speed with conn.{this.state.objPlotData.depthUnit}/hr.
                                                    </label>
                                                    <label className="summaryLabel" id="txtNetFlow">
                                                        {this.state.SingleTripReportData.lblSpeedWithConn}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-4">

                                            <div className="group-inline">
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Direction
                                                    </label>
                                                    <label className="summaryLabel" id="txtPositiveFlow">
                                                        {this.state.SingleTripReportData.lblDirection}
                                                    </label>
                                                </div>
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Start Time
                                                    </label>
                                                    <label className="statsLabelTripReport" id="txtNegativeFlow">
                                                        {this.state.SingleTripReportData.lblStartTime}
                                                    </label>
                                                </div>
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Best Time(Min.)
                                                    </label>
                                                    <label className="summaryLabel" id="txtNetFlow">
                                                        {this.state.SingleTripReportData.lblBestTime}
                                                    </label>
                                                </div>
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Avg. Conn. Time (Night)(Min.)
                                                    </label>
                                                    <label className="summaryLabel" id="txtNetFlow">
                                                        {this.state.SingleTripReportData.lblAvgTimeNight}
                                                    </label>
                                                </div>
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Speed w/o conn.{this.state.objPlotData.depthUnit}/hr.
                                                    </label>
                                                    <label className="summaryLabel" id="txtNetFlow">
                                                        {this.state.SingleTripReportData.lblSpeedWOConn}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-4">

                                            <div className="group-inline">
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Run
                                                    </label>
                                                    <label className="summaryLabel" id="txtPositiveFlow">
                                                        {this.state.SingleTripReportData.lblRun}
                                                    </label>
                                                </div>
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        End Time
                                                    </label>
                                                    <label className="statsLabelTripReport" id="txtNegativeFlow">
                                                        {this.state.SingleTripReportData.lblEndTime}
                                                    </label>
                                                </div>
                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Diff. (Min.)
                                                    </label>
                                                    <label style={{ backgroundColor: this.state.SingleTripReportData.lblDiff > 0 ? "transparent" : "red" }} className="summaryLabel" id="txtNetFlow">
                                                        {this.state.SingleTripReportData.lblDiff}
                                                    </label>
                                                </div>

                                                <div className="form-group">
                                                    <label className="summaryLabelHeader-long">
                                                        Fill up time (Min.)
                                                    </label>
                                                    <label className="summaryLabel" id="txtNetFlow">
                                                        {this.state.SingleTripReportData.lblFillupTime}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row" style={{ backgroundColor: "transparent", height: "50%", width: "100%", margin: "0px" }}>
                                    {/* <label style={{ display: "flex", justifyContent: "center" }}>Trip Connections</label> */}
                                    <h6 style={{ display: "flex", justifyContent: "center" }} className="summaryGroupHeaderTripReport">Trip Connections</h6>
                                    <div

                                        id="ChartTripConnectionsBar"
                                        style={{
                                            height: "calc(34vh)",
                                            minWidth: "380px",
                                            width: "calc(62vw)",
                                            backgroundColor: "transparent",
                                            marginLeft: "5px",
                                            marginTop: "15px"
                                        }}
                                    ></div>
                                    <div
                                        id="ChartTripConnectionsBar_legend"
                                        style={{
                                            textAlign: "justify",
                                            height: "40px",
                                            marginLeft: "10px",
                                            //width: "calc(30vw)",
                                            backgroundColor: "transparent",
                                            display: "inline-block",
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>





                    </TabStripTab>}
                </TabStrip>
            </>
        )
    }
}