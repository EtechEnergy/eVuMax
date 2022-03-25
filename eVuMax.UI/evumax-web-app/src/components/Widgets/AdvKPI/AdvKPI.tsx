import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faFilter } from "@fortawesome/free-solid-svg-icons";
import { Grid, GridColumn, GridRow } from "@progress/kendo-react-grid";
import React, { Component } from "react";
import { Button, DateTimePicker, Dialog, DropDownList, Label, Splitter, SplitterOnChangeEvent, TabStrip, TabStripTab } from "@progress/kendo-react-all";
import * as d3 from "d3";

import { Window } from "@progress/kendo-react-dialogs";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import axios from "axios";
import GlobalMod from "../../../objects/global";
import { Util } from "../../../Models/eVuMax";
import NotifyMe from 'react-notification-timeline';

import { Checkbox, NumericTextBox, RadioButton } from "@progress/kendo-react-inputs";
import { Chart, curveStyle, zoomOnAxies } from "../../../eVuMaxObjects/Chart/Chart";
import { Axis, axisPosition } from "../../../eVuMaxObjects/Chart/Axis";
import { DataSeries, dataSeriesType } from "../../../eVuMaxObjects/Chart/DataSeries";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import $ from "jquery";

import * as utilFunc from "../../../utilFunctions/utilFunctions";
import { confirmAlert } from "react-confirm-alert";

import { comboData } from "../../../eVuMaxObjects/UIObjects/comboData";
import { ADVKPIDataFilter } from "./AdvKPIDataFilter";
let _gMod = new GlobalMod();


export default class AdvKPI extends Component {
    //Cancel all Axios Request
    state = {
        panes: [{ size: "100%", collapsible: false, collapsed: false }, {}],
        grdWells: [],
        grdProfile: [],
        grdComposite: [],
        runReport: false,
        warningMsg: [],
        selectedTab: 0,
        currentProfileID: "",
        showFilterDialog: false,
        showCrossHair: false,
        cboWellList: [],
        selectedMainWell: new comboData(),
        FilterBy: new comboData(),
        KPIDataFilter: new ADVKPIDataFilter(),
    };

    filterByComboList = [new comboData("Last Hours", "1"), new comboData("Date Range", "2"), new comboData("From Date Onwards", "3"), new comboData("Depth Range", "4"),
    new comboData("From Depth Onwards", "5"), new comboData("Current Section", "6")];

    intervalID: NodeJS.Timeout | undefined;
    AxiosSource = axios.CancelToken.source();
    AxiosConfig = { cancelToken: this.AxiosSource.token };
    objChart: Chart;
    objData: any = "";
    objAxisList: any = [];
    topAxisCount: number = 0;
    objSeries: DataSeries;
    objDataSeries: any;

    componentDidMount() {
        try {

            this.loadWorkSpace();

        } catch (error) {

        }
    }

    loadGridData = (objData: any) => {
        try {

            let wellList = Object.values(objData.arrWells);
            let newWellList: any = [];
            for (let index = 0; index < wellList.length; index++) {
                const objItem: any = wellList[index];
                let objWell: any = objItem.objWell;

                newWellList.push({ selected1: false, Selected: objItem.Selected, WellID: objWell.ObjectID, name: objWell.name, RigName: objWell.RigName, operatorName: objWell.operatorName, county: objWell.county, field: objWell.field, district: objWell.district, country: objWell.country });


            }


            this.setState({
                grdComposite: objData.grdComposite,
                grdProfile: objData.grdProfile,
                grdWells: newWellList
            });
            console.log("grdWell", this.state.grdWells);

        } catch (error) {

        }
    }



    onAfterSeriesDraw = (e, i) => {
        try {

            d3.select(".benchmark").remove();


            if (this.objData.objProfile.drawLine && this.objData.objProfile.linePc > 0) {


                let objLeftAxes: Axis = new Axis();
                objLeftAxes = this.objChart.getAxisByID(this.objChart.DataSeries.values().next().value.YAxisId);



                let x1 = this.objChart.__chartRect.left;
                let x2 = this.objChart.__chartRect.right;
                let y1 = objLeftAxes.ScaleRef(this.objData.objProfile.linePc);
                let y2 = y1 + 4;

                // this.objChart.SVGRef.append("g")
                //     .attr("class", "benchmark")
                //     .append("rect")
                //     .attr("id", "benchmark")
                //     .attr("x", x1)
                //     .attr("y", y1)
                //     .attr("width", x2 - x1)
                //     .attr("height", y2 - y1)
                //     .style("fill", "rgb(" + this.objData.objProfile.lineColor + ")");

                this.objChart.SVGRef.append("g")
                    .attr("class", "benchmark")
                    .append("line")
                    .attr("id", "benchmark")
                    .attr("x1", x1)
                    .attr("y1", y1)
                    .attr("x2", x2)
                    .attr("y2", y2)
                    .attr("stroke-width", this.objData.objProfile.lineWidth > 0 ? this.objData.objProfile.lineWidth : 3)
                    .style("stroke", "rgb(" + this.objData.objProfile.lineColor + ")");


            }


            //             drawLine: true
            // lineColor: "255, 128, 64"
            // linePc: 15
            // lineWidth: 3


        } catch (error) {

        }
    }


    initializeChart = () => {
        try {

            this.objChart = new Chart(this, "AdvKPI");
            this.objChart.ContainerId = "AdvKPIChart";


            this.objChart.onAfterSeriesDraw.subscribe((e, i) => {
                this.onAfterSeriesDraw(e, i);


            });

            this.objChart.onBeforeSeriesDraw.subscribe((e, i) => {
                //this.onBeforeSeriesDraw(e, i);
            });


            this.objChart.DataSeries.clear();
            this.objChart.Axes.clear();
            this.objChart.createDefaultAxes();
            this.objChart.updateChart();

            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().Inverted = false;
            this.objChart.leftAxis().ShowLabels = true;
            this.objChart.leftAxis().ShowTitle = true;
            this.objChart.leftAxis().Title = "";
            this.objChart.leftAxis().Visible = true;

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().IsDateTime = false;
            this.objChart.bottomAxis().bandScale = false; //wip
            this.objChart.bottomAxis().ShowLabels = true;
            this.objChart.bottomAxis().ShowTitle = false;
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowSelector = false;
            this.objChart.bottomAxis().Visible = true;
            this.objChart.bottomAxis().PaddingMax = 0; //wip


            this.objChart.rightAxis().Visible = false;
            this.objChart.rightAxis().ShowLabels = false;



            this.objChart.initialize();

            this.objChart.reDraw();

        } catch (error) {

        }
    }


    setAxisPerColumnAndRow = (axisList: any): number => {
        try {
            let totalRighAxis: number = 0;
            let totalLeftAxis: number = 0;
            let totalTopAxis: number = 0;
            let totalBottomAxis: number = 0;

            //Set Axis Per Column
            for (let index = 0; index < axisList.length; index++) {


                if (axisList[index].Orientation == 0) { //// 0-Horizontal, 1-Vertical
                    if (axisList[index].AxisPosition == 0) { //Left
                        totalLeftAxis += 1;
                    }

                    if (axisList[index].AxisPosition == 2) { //Right
                        totalRighAxis += 1;
                    }

                    if (axisList[index].AxisPosition == 1) { //Bottom
                        totalBottomAxis += 1;
                    }

                    if (axisList[index].AxisPosition == 3) { //Top
                        totalTopAxis += 1;
                    }
                }


            }

            //Set Axis Per Column
            for (let index = 0; index < axisList.length; index++) {

                if (axisList[index].Orientation == 1) { //// 0-Horizontal, 1-Vertical
                    if (axisList[index].AxisPosition == 1) { //Bottom
                        totalBottomAxis += 1;
                    }

                    if (axisList[index].AxisPosition == 3) { //Top
                        totalTopAxis += 1;
                    }

                    if (axisList[index].AxisPosition == 0) { //Left
                        totalLeftAxis += 1;
                    }

                    if (axisList[index].AxisPosition == 2) { //Right
                        totalRighAxis += 1;
                    }

                }
            }




            if (totalRighAxis >= totalLeftAxis) {
                this.objChart.axisPerColumn = totalRighAxis;
            } else {
                this.objChart.axisPerColumn = totalLeftAxis;
            }


            if (totalBottomAxis >= totalTopAxis) {
                this.objChart.axisPerRow = totalBottomAxis
            } else {
                this.objChart.axisPerRow = totalTopAxis;
            }






        } catch (error) {
            return 1;
        }
    }


    getOrdersAxisListByPosition = (paramAxisPosition: number) => {

        let arrAxis: any = [];
        try {
            let list = [];
            for (let index = 0; index < this.objAxisList.length; index++) {
                let objAxis = this.objAxisList[index];


                if (objAxis.AxisPosition == paramAxisPosition) {
                    list.push(objAxis);
                }


            }
            if (list.length > 0) {
                arrAxis = list.sort((a, b) => (a.DisplayOrder < b.DisplayOrder) ? -1 : 1);
            }

            return arrAxis;

        } catch (error) {
            return arrAxis;
        }
    }

    plotChart = () => {
        try {

            //Load Workspace Wells into Combo FilterData
            debugger;
            let WellList: any = Object.values(this.objData.objWorkSpace.wells);
            if (WellList != null || WellList.length > 0) {

                let wellComboList: comboData[] = [];
                let objCombo: comboData;
                // wellComboList.push(new comboData("Select Main Well", "-1"));

                for (let index = 0; index < WellList.length; index++) {
                    const objWell: any = WellList[index].objWell;
                    objCombo = new comboData(objWell.name, objWell.ObjectID);
                    wellComboList.push(objCombo);
                }


                this.setState({
                    cboWellList: wellComboList
                });

            }


            this.initializeChart();
            this.objChart.CrossHairRequire = this.state.showCrossHair;
            
            if (this.objData.objProfile.axesList != null || this.objData.objProfile.axesList != undefined) {
                this.objAxisList = Object.values(this.objData.objProfile.axesList);
                this.setAxisPerColumnAndRow(this.objAxisList);

                if (this.objChart.axisPerColumn > 1) {
                    this.objChart.ZoomOnAxies = zoomOnAxies.x;
                }

                if (this.objChart.axisPerRow > 1) {
                    this.objChart.ZoomOnAxies = zoomOnAxies.y;
                }

                this.objChart.Axes.clear();
                this.objChart.DataSeries.clear();

                this.objChart.MarginLeft = 50;
                this.objChart.MarginBottom = 50;
                this.objChart.MarginTop = 10;
                this.objChart.MarginRight = 90;

                let axisList = Object.values(this.objData.objProfile.axesList);
                axisList = this.getOrdersAxisListByPosition(0);//Left



                for (let index = 0; index < axisList.length; index++) {

                    let objSummaryAxis: any = axisList[index];

                    //Create Custom Left Axis 
                    let objAxis = new Axis();

                    objAxis.DisplayOrder = index;
                    objAxis.Id = "Y" + utilFunc.removeUnderScoreFromID(objSummaryAxis.AxisID);//NEED TO ADD ALPHABAT TO ID



                    objAxis.Position = axisPosition.left;

                    objAxis.IsDateTime = false;
                    objAxis.bandScale = false; //as in Toolface
                    //objAxis.AutoScale = objSummaryAxis.Automatic;
                    objAxis.AutoScale = true;
                    objAxis.Title = objSummaryAxis.AxisTitle;

                    objAxis.ShowLabels = true;
                    objAxis.ShowTitle = true;
                    // objAxis.EndPos = objSummaryAxis.EndPosition;
                    // objAxis.StartPos = objSummaryAxis.StartPosition;
                    objAxis.GridVisible = false;// objSummaryAxis.ShowGrid;
                    // objAxis.LabelFont = objSummaryAxis.FontName;
                    // objAxis.LabelFontBold = objSummaryAxis.FontBold;
                    // objAxis.LabelFontColor = objSummaryAxis.FontColor;
                    // objAxis.LabelFontSize = objSummaryAxis.FontSize == 0 ? 10 : objSummaryAxis.FontSize; 
                    // objAxis.LabelFontItalic = objSummaryAxis.FontItalic;

                    // objAxis.Min = objSummaryAxis.MinValue;
                    // objAxis.Max = objSummaryAxis.MaxValue;
                    objAxis.LabelAngel = 0;
                    objAxis.ShowSelector = false;
                    objAxis.Visible = true;
                    objAxis.Inverted = objSummaryAxis.Inverted;
                    objAxis.PaddingMin = 0;



                    if (this.objChart.axisPerColumn > 1) {
                        objAxis.isAllowZooming = false;
                        objAxis.isAllowScrolling = false;
                    }
                    //===============

                    this.objChart.Axes.set(objAxis.Id, objAxis);


                    //*************************************************** */
                }


                //// 0-left, 1-bottom, 2-right, 3-top
                axisList = this.getOrdersAxisListByPosition(2);//Right
                for (let index = 0; index < axisList.length; index++) {

                    let objSummaryAxis: any = axisList[index];


                    let objAxis = new Axis();

                    objAxis.CustomPosition = true;

                    objAxis.Id = "Y" + utilFunc.removeUnderScoreFromID(objSummaryAxis.AxisID);
                    objAxis.Position = axisPosition.right;
                    objAxis.AutoScale = true;// objSummaryAxis.Automatic;
                    objAxis.IsDateTime = false;
                    objAxis.bandScale = false;
                    objAxis.Title = objSummaryAxis.AxisTitle;
                    objAxis.ShowLabels = true;
                    objAxis.ShowTitle = true;
                    // objAxis.EndPos = objSummaryAxis.EndPosition;
                    // objAxis.StartPos = objSummaryAxis.StartPosition;
                    // objAxis.GridVisible = objSummaryAxis.ShowGrid;
                    // objAxis.LabelFont = objSummaryAxis.FontName;
                    // objAxis.LabelFontBold = objSummaryAxis.FontBold;
                    // objAxis.LabelFontColor = objSummaryAxis.FontColor;
                    // objAxis.LabelFontSize = objSummaryAxis.FontSize == 0 ? 10 : objSummaryAxis.FontSize;
                    // objAxis.LabelFontItalic = objSummaryAxis.FontItalic;
                    // objAxis.Min = objSummaryAxis.MinValue;
                    // objAxis.Max = objSummaryAxis.MaxValue;
                    objAxis.LabelAngel = 0;
                    objAxis.ShowSelector = false;
                    objAxis.Visible = true;
                    objAxis.Inverted = objSummaryAxis.Inverted;

                    if (this.objChart.axisPerColumn > 1) {
                        objAxis.isAllowZooming = false;
                        objAxis.isAllowScrolling = false;
                    }
                    //===============

                    this.objChart.Axes.set(objAxis.Id, objAxis);
                }

                //// 0-left, 1-bottom, 2-right, 3-top
                axisList = this.getOrdersAxisListByPosition(1);//bottom
                for (let index = 0; index < axisList.length; index++) {

                    let objSummaryAxis: any = axisList[index];

                    //Create Custom Bottom Axis 
                    let objAxis = new Axis();

                    objAxis.CustomPosition = true;
                    objAxis.Id = "X" + utilFunc.removeUnderScoreFromID(objSummaryAxis.AxisID);
                    objAxis.Position = axisPosition.bottom;
                    objAxis.AutoScale = true;// objSummaryAxis.Automatic;
                    objAxis.IsDateTime = false;



                    objAxis.bandScale = true;
                    //                    objAxis.bandScale = true;     //For Bar Chart
                    objAxis.Title = objSummaryAxis.AxisTitle;
                    objAxis.ShowLabels = true;
                    objAxis.ShowTitle = true;
                    // objAxis.EndPos = objSummaryAxis.EndPosition;
                    // objAxis.StartPos = objSummaryAxis.StartPosition;
                    // objAxis.GridVisible = objSummaryAxis.ShowGrid;
                    // objAxis.LabelFont = objSummaryAxis.FontName;
                    // objAxis.LabelFontBold = objSummaryAxis.FontBold;
                    // objAxis.LabelFontColor = objSummaryAxis.FontColor;
                    objAxis.LabelFontSize = objSummaryAxis.FontSize == 0 ? 10 : objSummaryAxis.FontSize;
                    objAxis.LabelFontItalic = objSummaryAxis.FontItalic;
                    // objAxis.Min = objSummaryAxis.MinValue;
                    // objAxis.Max = objSummaryAxis.MaxValue;
                    objAxis.LabelAngel = 0;
                    objAxis.ShowSelector = false;
                    objAxis.Visible = true;
                    objAxis.Inverted = objSummaryAxis.Inverted;
                    objAxis.PaddingMax = 2;
                    this.objChart.Axes.set(objAxis.Id, objAxis);

                    if (this.objChart.axisPerRow > 1) {
                        objAxis.isAllowZooming = false;
                        objAxis.isAllowScrolling = false;
                    }
                    //===============

                    //*************************************************** */

                }



                axisList = this.getOrdersAxisListByPosition(3);//Top
                for (let index = 0; index < axisList.length; index++) {


                    let objSummaryAxis: any = axisList[index];

                    //Create Custom Bottom Axis 
                    let objAxis = new Axis();

                    objAxis.CustomPosition = true;
                    objAxis.Id = "X" + utilFunc.removeUnderScoreFromID(objSummaryAxis.AxisID);

                    objAxis.AutoScale = objSummaryAxis.Automatic;
                    objAxis.IsDateTime = false;

                    // if (objSummaryAxis.Id == "DiffPressure") {
                    //   objAxis.bandScale = true; //false; need to check 
                    // } else {
                    //   objAxis.bandScale = false;// need to check if series has Bar then True
                    // }

                    objAxis.Title = objSummaryAxis.AxisTitle;
                    objAxis.ShowLabels = true;
                    objAxis.ShowTitle = true;
                    // objAxis.EndPos = objSummaryAxis.EndPosition;
                    // objAxis.StartPos = objSummaryAxis.StartPosition;
                    // objAxis.GridVisible = objSummaryAxis.ShowGrid;
                    // objAxis.LabelFont = objSummaryAxis.FontName;
                    // objAxis.LabelFontBold = objSummaryAxis.FontBold;
                    // objAxis.LabelFontColor = objSummaryAxis.FontColor;
                    // objAxis.LabelFontSize = objSummaryAxis.FontSize == 0 ? 10 : objSummaryAxis.FontSize;
                    // objAxis.LabelFontItalic = objSummaryAxis.FontItalic;
                    // objAxis.Min = objSummaryAxis.MinValue;
                    // objAxis.Max = objSummaryAxis.MaxValue;
                    objAxis.LabelAngel = 0;
                    objAxis.ShowSelector = false;
                    objAxis.Visible = true;
                    objAxis.Inverted = objSummaryAxis.Inverted;
                    this.objChart.Axes.set(objAxis.Id, objAxis);
                    //prath on 27-Jan-2022 wip
                    if (this.objChart.axisPerRow > 1) {
                        objAxis.isAllowZooming = false;
                        objAxis.isAllowScrolling = false;
                    }
                    //===============
                    //*************************************************** */
                }

                this.topAxisCount = axisList.length;

                //if (objDataSeries.outputData != null || objDataSeries.outputData != undefined) {

                //Load Series
                let SeriesList = Object.values(this.objData.outputData);
                for (let index = 0; index < SeriesList.length; index++) {
                    let objDataSeries: any = SeriesList[index];
                    this.objDataSeries = objDataSeries;

                    this.objSeries = new DataSeries();

                    this.objSeries.Data.length = 0;
                    this.objSeries.Id = "Series" + index + "-" + utilFunc.removeUnderScoreFromID(objDataSeries.EntryID);
                    this.objSeries.Title = objDataSeries.LegendTitle;
                    this.objSeries.XAxisId = objDataSeries.XColumn;
                    this.objSeries.YAxisId = objDataSeries.YColumn;


                    this.objSeries.PointSize = objDataSeries.PointWidth;

                    this.objSeries.Color = "rgb(" + objDataSeries.SeriesColor + ")";//Dont change position of this line

                    this.objSeries.ShowInLegend = true;


                    //objSeries.ShowRoadMap = objDataSeries.ShowRoadMap;
                    //objSeries.RoadMapTransparency = objDataSeries.RoadMapTransparency;
                    //objSeries.RoadMapColor = objDataSeries.RoadMapColor;
                    //objSeries.RMColor = objDataSeries.RMColor;
                    // objSeries.RoadmapDepth = objDataSeries.roadmapDepth;
                    // objSeries.RoadmapMin = objDataSeries.roadmapMin;
                    // objSeries.RoadmapMax = objDataSeries.roadmapMax;


                    // Line = 0
                    // HorizontalArea = 1
                    // Area = 2
                    // Points = 3
                    // Histogram = 4
                    // Pie = 5
                    // Bar = 6

                    debugger;
                    

                    switch (objDataSeries.SeriesType) {
                        case 0:
                            this.objSeries.Type = dataSeriesType.Line;

                            this.objSeries.LineWidth = objDataSeries.LineWidth == 0 ? 1 : objDataSeries.LineWidth;
                            this.objSeries.ShowPointsOnLineSeries = objDataSeries.ShowPoints;
                            // smooth = 0,
                            // step = 1,
                            // normal = 2,
                            if (objDataSeries.StepLine == true) {
                                this.objSeries.CurveStyle = curveStyle.step;
                            } else {

                                this.objSeries.CurveStyle = curveStyle.normal;
                            }
                      //      this.getLineSeriesData();
                            break;
                        case 1://HorizontalArea
                            this.objSeries.Type = dataSeriesType.HorizontalArea;
                            this.objSeries.Color = objDataSeries.PointColor;

                            break;
                        case 2://Area
                            this.objSeries.Type = dataSeriesType.Area;
                            this.objSeries.Color = objDataSeries.PointColor;
                            break;
                        case 3://Points
                            this.objSeries.Type = dataSeriesType.Point;

                            this.objSeries.PointStyle = objDataSeries.PointStyle;

                            //                            this.objSeries.LineWidth = objDataSeries.LineWidth == 0 ? 1 : objDataSeries.LineWidth;
                       //     this.getPointSeriesData();
                            break;
                        case 4://Histogram
                            this.objSeries.Type = dataSeriesType.Bar;
                            break;
                        case 5://Pie
                            this.objSeries.Type = dataSeriesType.Pie;

                            break;
                        case 6://Bar

                            this.objSeries.Type = dataSeriesType.Bar;





                            this.objSeries.Stacked = false;
                            this.objSeries.Color = "rgb( " + objDataSeries.SeriesColor + ")";//Dont change position of this line
                            this.objSeries.ShowLabelOnSeries = true; //Parth 05-10-2020
                        //    this.getBarSeriesData(); //WIP
                            break;

                        default:
                            break;
                    }


                    //prath
                    if ((this.objData.objProfile.DataGroup = 1) && this.objData.objProfile.TimeUnit ==  3){
                        this.getPointSeriesData();
                    }else{
                        this.getBarSeriesData(); //WIP
                    }
                    //

                        



                    // if (SeriesType == dataSeriesType.Area || SeriesType == dataSeriesType.Point) {
                    //     this.objSeries.Color = objDataSeries.PointColor;
                    // }
                    // else if (SeriesType == dataSeriesType.Line) {
                    //     this.objSeries.Color = objDataSeries.LineColor;
                    // }






                    //Populate the data series with this data


                    //      alert("Series - " + objSeries.Name + " - " + objSeries.XAxisId + " - " + objSeries.YAxisId);












                    // if (objDataSeries.ColorPointsAsColumn) {

                    //     this.formatSeries(objSeries, objDataSeries);  
                    // }
                    // if (objDataSeries.Visible) {

                    this.objChart.DataSeries.set(this.objSeries.Id, this.objSeries);
                    //    }


                }


                this.objChart.updateChart();
                debugger;
                this.objChart.reDraw();

            }
        } catch (error) {

        }
    }

    getPointSeriesData = () => {
        try {

            let SeriesXData: any = Object.values(this.objDataSeries.arrXData);
            let SeriesYData: any = Object.values(this.objDataSeries.arrYData);


            //prath 04-Feb-2022 (To handle autoscale false case - No need to fill all data to series to avoid overlape charts)
            let xMin = 0;
            let xMax = 0;
            let yMin = 0;
            let yMax = 0;
            let autoScaleX: boolean = false;
            let autoScaleY: boolean = false;
            if (this.objChart.Axes.get(this.objSeries.XAxisId).AutoScale == false) {
                xMin = this.objChart.Axes.get(this.objSeries.XAxisId).Min;
                xMax = this.objChart.Axes.get(this.objSeries.XAxisId).Max;
                autoScaleX = false;
            }
            if (this.objChart.Axes.get(this.objSeries.YAxisId).AutoScale == false) {
                yMin = this.objChart.Axes.get(this.objSeries.YAxisId).Min;
                yMax = this.objChart.Axes.get(this.objSeries.YAxisId).Max;
                autoScaleY = false;
            }
            //==========================================
            for (let i = 0; i < SeriesXData.length; i++) {

                // this.objSeries.Name = SeriesXData[i].LegendTitle;
                let objVal: ChartData = new ChartData();
                //let objBottomAxes: Axis = new Axis();
                objVal.x = eval(Number(SeriesXData[i]).toFixed(2));
                //  objBottomAxes = this.objChart.getAxisByID(this.objSeries.XAxisId);
                objVal.y = Number(SeriesYData[i]);
                //objBottomAxes.Labels.push(SeriesXData[i].XLabel);
                this.objSeries.Data.push(objVal);
            }



        } catch (error) {

        }
    }

    getLineSeriesData = () => {
        try {
            let SeriesData: any = Object.values(this.objDataSeries.outputData);

            //prath 04-Feb-2022 (To handle autoscale false case - No need to fill all data to series to avoid overlape charts)
            let xMin = 0;
            let xMax = 0;
            let yMin = 0;
            let yMax = 0;
            let autoScaleX: boolean = false;
            let autoScaleY: boolean = false;
            if (this.objChart.Axes.get(this.objSeries.XAxisId).AutoScale == false) {
                xMin = this.objChart.Axes.get(this.objSeries.XAxisId).Min;
                xMax = this.objChart.Axes.get(this.objSeries.XAxisId).Max;
                autoScaleX = false;
            }
            if (this.objChart.Axes.get(this.objSeries.YAxisId).AutoScale == false) {
                yMin = this.objChart.Axes.get(this.objSeries.YAxisId).Min;
                yMax = this.objChart.Axes.get(this.objSeries.YAxisId).Max;
                autoScaleY = false;
            }
            //==========================================
            for (let i = 0; i < SeriesData.length; i++) {
                this.objSeries.Name = SeriesData[i].LegendTitle;

                let objVal: ChartData = new ChartData();

                let objBottomAxes: Axis = new Axis();

                objBottomAxes = this.objChart.getAxisByID(this.objSeries.XAxisId);
                //objBottomAxes.bandScale= true;

                objVal.x = Number(SeriesData[i].XValue);


                objVal.y = Number(SeriesData[i].YValue);
                objBottomAxes.Labels.push(SeriesData[i].XLabel);
                this.objSeries.Data.push(objVal);

            }


        } catch (error) {

        }
    }
    getBarSeriesData = () => {
        try {
            let SeriesData: any = Object.values(this.objDataSeries.outputData);

            //prath 04-Feb-2022 (To handle autoscale false case - No need to fill all data to series to avoid overlape charts)
            let xMin = 0;
            let xMax = 0;
            let yMin = 0;
            let yMax = 0;
            let autoScaleX: boolean = false;
            let autoScaleY: boolean = false;
            if (this.objChart.Axes.get(this.objSeries.XAxisId).AutoScale == false) {
                xMin = this.objChart.Axes.get(this.objSeries.XAxisId).Min;
                xMax = this.objChart.Axes.get(this.objSeries.XAxisId).Max;
                autoScaleX = false;
            }
            if (this.objChart.Axes.get(this.objSeries.YAxisId).AutoScale == false) {
                yMin = this.objChart.Axes.get(this.objSeries.YAxisId).Min;
                yMax = this.objChart.Axes.get(this.objSeries.YAxisId).Max;
                autoScaleY = false;
            }
            //==========================================
            for (let i = 0; i < SeriesData.length; i++) {
                this.objSeries.Name = SeriesData[i].LegendTitle;

                //prath 04-Feb-2022  (To handle autoscale false case - No need to fill all data to series to avoid overlape charts)
                if (this.objSeries.Type != dataSeriesType.Bar) {
                    if (autoScaleX == false && !(SeriesData[i].XValue >= xMin && SeriesData[i].XValue <= xMax)) {
                        continue;
                    }

                    if (autoScaleY == false && !(SeriesData[i].YValue >= yMin && SeriesData[i].YValue <= yMax)) {
                        continue;
                    }
                }
                //========


                let objVal: ChartData = new ChartData();

                let objBottomAxes: Axis = new Axis();
                if (this.objSeries.Type == dataSeriesType.Bar) {
                    objVal.x = i + 1;

                    objBottomAxes = this.objChart.getAxisByID(this.objSeries.XAxisId);
                    //objBottomAxes.bandScale= true;
                } else {
                    objVal.x = Number(SeriesData[i].XValue);
                }

                objVal.y = Number(SeriesData[i].YValue);
                objBottomAxes.Labels.push(SeriesData[i].XLabel);
                this.objSeries.Data.push(objVal);

            }


        } catch (error) {

        }
    }
    formatSeries = (paramSeries: DataSeries, paramDataSeries: any) => {
        try {

            if (paramDataSeries.ColorPointsAsColumn) {
                //alert(paramSeries.Name);
                paramSeries.ColorEach = true;

                for (let index = 0; index < paramDataSeries.colorBuffer.length; index++) {
                    paramSeries.Data[index].color = paramDataSeries.colorBuffer[index]
                }

            }



        } catch (error) {

        }
    }
    runKPIReport = (paramProfileID: string, SelectedWellList: any) => {

        try {


            SelectedWellList = SelectedWellList.substring(1, SelectedWellList.length);
            let newPanes: any = this.state.panes;
            newPanes[0].collapsible = true;
            newPanes[0].collapsed = true;



            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "AdvKPI.Manager";
            objBrokerRequest.Broker = "AdvKPI";
            objBrokerRequest.Function = "processAdvKPI";

            let objParameter = new BrokerParameter("", "");

            objParameter = new BrokerParameter("UserID", _gMod._userId);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("ProfileID", paramProfileID);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("WellList", SelectedWellList);
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
                    // $("#loader").hide();
                    //alert("success");

                    this.objData = JSON.parse(res.data.Response);

                    console.log("AdvKPI", this.objData);


                    this.plotChart();
                    //Warnings Notifications
                    let warnings: string = res.data.Warnings;
                    if (warnings.trim() != "") {
                        let warningList = [];
                        warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
                        this.setState({
                            warningMsg: warningList
                        });
                    }


                    Util.StatusSuccess("Data successfully retrived  ");

                })
                .catch((error) => {
                    alert("error " + error.message);
                    Util.StatusError(error.message);
                    // this.setState({
                    //   isProcess: false,
                    // });
                    //this.forceUpdate();

                    if (error.response) {

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

    loadWorkSpace() {
        try {


            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "AdvKPI.Manager";
            objBrokerRequest.Broker = "AdvKPI";
            objBrokerRequest.Function = "loadWorkSpace";


            _gMod._userId = "PRATH\PRATH";

            let objParameter = new BrokerParameter("", ""); // // "f3205325-4ddb-4996-b700-f04d6773a051"

            objParameter = new BrokerParameter(
                "UserID",
                _gMod._userId
            );
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
                    // $("#loader").hide();
                    //alert("success");

                    let objData = JSON.parse(res.data.Response);
                    console.log("AdvKPI", objData);


                    //Warnings Notifications
                    let warnings: string = res.data.Warnings;
                    if (warnings.trim() != "") {
                        let warningList = [];
                        warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
                        this.setState({
                            warningMsg: warningList
                        });
                    }





                    this.loadGridData(objData);
                    Util.StatusSuccess("Data successfully retrived  ");


                })
                .catch((error) => {
                    alert("error " + error.message);
                    Util.StatusError(error.message);
                    // this.setState({
                    //   isProcess: false,
                    // });
                    //this.forceUpdate();

                    if (error.response) {

                    } else if (error.request) {

                        console.log("error.request");
                    } else {

                        console.log("Error", error);
                    }

                    console.log("rejected");
                    this.setState({ isProcess: false });
                });

        } catch (error) {

        }
    }

    updateWarnings = (paramWarnings: any) => {
        try {
            this.setState({
                warningMsg: paramWarnings
            });

        } catch (error) {

        }
    }


    onChange = (event: SplitterOnChangeEvent) => {
        if (this.state.runReport == false) {
            return;
        }
        this.setState({
            panes: event.newState,
            warningMsg: []
        });
    };


    handleChangeDropDown = (event: any) => {

        debugger;
        this.setState({ [event.target.name]: event.value });
        //this.setState({ selectedMainWell: new comboData(event.value.text, event.value.id) });

    }

    cmdRunKPI_click = (e, objRow: any, RunType: string) => {
        try {

            //load Selected Wells
            let wells = this.state.grdWells;
            let SelectedWellList = "";
            for (let index = 0; index < wells.length; index++) {

                if (wells[index].selected1 == true) {
                    SelectedWellList += "," + wells[index].WellID;
                }

            }




            if (SelectedWellList == "") {
                confirmAlert({
                    message: 'Please Select Well for the list',
                    childrenElement: () => <div />,
                    buttons: [
                        {
                            label: 'Ok',
                            onClick: () => {
                                return;
                            }

                        },
                        // {
                        //     label: 'No',
                        //     onClick: () => null
                        // }
                    ]
                });

                return;

            }
            let newPanes: any = this.state.panes;
            newPanes[0].collapsed = true;
            newPanes[0].collapsible = true;

            newPanes[0].size = "0%";

            let ID: string = "";
            if (RunType == "RunKPI") {
                ID = objRow.PROFILE_ID;
            }
            if (RunType == "RunComposite") {
                ID = objRow.PROFILE_ID;
            }


            this.setState({
                panes: newPanes,
                currentRow: objRow,
                currentProfileID: ID,
                runReport: true,
                //showChartDialog: false,
            });

            this.runKPIReport(ID, SelectedWellList);

        } catch (error) { }
    };

    ClosePanel = async () => {
        try {


            this.AxiosSource.cancel();
            await clearInterval(this.intervalID);
            this.intervalID = null;


            $("#AdvKPIChart").empty();

            this.setState({
                panes: [{ size: "100%", collapsible: false, collapsed: false }, {}],
                runReport: false

            });
        } catch (error) { }
    };

    grid_selectionChange = (event: any) => {

        const checked = event.syntheticEvent.target.checked;

        const data = this.state.grdWells.map((item: any) => {
            if (item["WellID"] === event.dataItem.WellID) {
                item["selected1"] = checked;
            }
            return item;
        });
        this.setState({ grdWells: data });

    };

    grid_headerSelectionChange = (event: any) => {
        const checked = event.syntheticEvent.target.checked;
        const data = this.state.grdWells.map((item: any) => {
            item["selected1"] = checked;
            return item;
        });
        this.setState({ grdWells: data });
    };


    handleTabSelection = (e: any) => {
        this.setState({ selectedTab: e.selected });
    }


    getVerticalAxisByColumnID = (pAxisID: string) => {
        try {
            let axisList: any = Object.values(this.objData.objProfile.axesList);
            for (let index = 0; index < axisList.length; index++) {
                const objAxis = axisList[index];
                if (objAxis.AxisID == pAxisID) {
                    return objAxis.ColumnID;
                }

            }
            return "";

        } catch (error) {

        }

    }

    getBottomAxis = () => {

        try {

            for (let key of this.objChart.Axes.keys()) {
                if (this.objChart.Axes.get(key).Position == 1) {
                    return this.objChart.Axes.get(key).Id;
                }

            }



        } catch (error) {

        }
    }

    handleChange = async (event: any,fieldName:string) => {
        try {
            debugger;
           
          await  this.setState({
                [fieldName]: event.value
            });

            this.plotChart();
        } catch (error) {

        }

    }

    render() {
        return (
            <div>
                <div className="" style={{ display: "flex", justifyContent: "flex-end" }}>
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

                <Splitter
                    panes={this.state.panes}
                    onChange={this.onChange}
                    style={{ height: "90vh" }}
                >

                    <div className={this.state.runReport ? "k-state-disabled" : "pane-content"}>

                        <label>Select Well from the List </label>

                        <div className="row" style={{ display: "flex" }}>
                            <div className="col-8 mt-5"> <Grid
                                style={{
                                    height: "750px", width: "auto"
                                }}
                                onSelectionChange={this.grid_selectionChange}
                                onHeaderSelectionChange={this.grid_headerSelectionChange} //Nishant 26-05-2020
                                selectedField="selected1"
                                data={this.state.grdWells}
                            >
                                <GridColumn
                                    field="selected1"
                                    width="65px"
                                    title=""
                                    resizable={true}
                                    minResizableWidth={65}
                                    headerClassName="text-center"
                                    className="text-center"
                                    editable={true}
                                    editor="boolean"
                                    headerSelectionValue={
                                        this.state.grdWells.findIndex(
                                            (dataItem: any) => dataItem.selected1 === false
                                        ) === -1
                                    }
                                ></GridColumn>


                                {/* <GridColumn
                                    field="Selected"
                                    width="65px"
                                    title="Included?"
                                    resizable={true}
                                    minResizableWidth={65}
                                    headerClassName="text-center"
                                    className="text-center"
                                    editable={true}
                                    editor="boolean"

                                ></GridColumn> */}

                                {false && <GridColumn field="WellID" width="80px" title="Well Id" />}



                                <GridColumn
                                    field="name"
                                    title="Well Name"

                                />
                                <GridColumn
                                    field="RigName"
                                    title="Rig Name"

                                />
                                <GridColumn
                                    field="operatorName"
                                    title="Operator"
                                //width="490px"
                                //                width="100%"
                                // resizable={true}
                                />
                                <GridColumn
                                    field="county"
                                    title="county"

                                />
                                <GridColumn
                                    field="field"
                                    title="FIeld"

                                />
                                <GridColumn
                                    field="district"
                                    title="District"

                                />
                                <GridColumn
                                    field="country"
                                    title="Country"

                                />

                            </Grid></div>
                            <div className="col-4">
                                <TabStrip selected={this.state.selectedTab}
                                    onSelect={this.handleTabSelection}
                                    keepTabsMounted={true}>
                                    <TabStripTab title="KPI">
                                        <Grid
                                            style={{
                                                height: "730px", width: "auto"
                                            }}
                                            data={this.state.grdProfile}


                                        >

                                            <GridColumn
                                                field="PROFILE_NAME"
                                                title="Profile Name"
                                            //width="490px"
                                            //                width="100%"
                                            // resizable={true}
                                            />

                                            {false && <GridColumn
                                                field="PROFILE_ID"
                                                title="Id"

                                            />}
                                            <GridColumn
                                                field="PROFILE_NOTES"
                                                title="Notes"
                                                width={50}

                                            />

                                            <GridColumn
                                                width="50px"
                                                headerClassName="text-center"
                                                resizable={false}
                                                field="editWell"
                                                title="Run"
                                                cell={(props) => (
                                                    <td
                                                        style={props.style}
                                                        className={"text-center k-command-cell " + props.className}
                                                        onClick={(e) => this.cmdRunKPI_click(e, props.dataItem, "RunKPI")}
                                                    >
                                                        <span>
                                                            <FontAwesomeIcon icon={faChartLine} />
                                                        </span>
                                                    </td>
                                                )}
                                            />
                                        </Grid>
                                    </TabStripTab>
                                    {false && <TabStripTab title="Composite Templates">
                                        <Grid
                                            style={{
                                                height: "750px", width: "auto"
                                            }}
                                            data={this.state.grdComposite}


                                        >

                                            <GridColumn
                                                field="TEMPLATE_NAME"
                                                title="Template Name"

                                            />
                                            {false && <GridColumn
                                                field="TEMPLATE_ID"
                                                title="ID"
                                            />}
                                            <GridColumn
                                                field="NOTES"
                                                title="Notes"
                                                width={50}

                                            />

                                            <GridColumn
                                                width="50px"
                                                headerClassName="text-center"
                                                resizable={false}
                                                field="editWell"
                                                title="Run"
                                                cell={(props) => (
                                                    <td
                                                        style={props.style}
                                                        className={"text-center k-command-cell " + props.className}
                                                        onClick={(e) => this.cmdRunKPI_click(e, props.dataItem, "RunComposite")}
                                                    >
                                                        <span>
                                                            <FontAwesomeIcon icon={faChartLine} />
                                                        </span>
                                                    </td>
                                                )}
                                            />
                                        </Grid>
                                    </TabStripTab>}
                                </TabStrip>
                            </div>

                        </div>

                    </div>

                    <div className="pane-content ml-5" id="rightPanel"  >
                        <div className="row mt-2 " style={{ display: "flex", justifyContent: "flex-end" }}>
                            <FontAwesomeIcon
                                style={{ alignSelf: "center" }}
                                icon={faFilter}
                                size="lg"
                                onClick={() => {

                                    this.setState({
                                        showFilterDialog: true

                                    })
                                }}
                            />
                            <Checkbox
                                className="mr-3 ml-3"
                                label={"Realtime"}
                            // checked={}
                            // onChange={(event) => {

                            // }}
                            />
                            <Checkbox
                                name="showCrossHair"
                                className="mr-3 ml-3"
                                label={"Cross Hair"}
                                checked={this.state.showCrossHair}
                                
                                onChange={(event) => {
                                    this.handleChange(event,"showCrossHair");

                                }}
                            />
                            <Button
                                className="ml-5 mr-3"
                                id="cmdClose"
                                onClick={() => {

                                    this.ClosePanel();
                                }}
                            >
                                Close
                            </Button>
                        </div>
                        <div className="">
                            {/* <DataSelectorInfo objDataSelector={this.state.objDataSelector} isRealTime={false} ></DataSelectorInfo> */}
                            {this.state.runReport && (

                                <div>
                                    <div
                                        id="AdvKPIChart"
                                        style={{
                                            float: "left",
                                            //height: "calc(((100vh - 400px)*30)/100)",
                                            height: "70vh",
                                            width: "calc(100vw - 280px)",
                                            backgroundColor: "transparent",
                                        }}
                                    ></div>

                                    <div
                                        id="AdvKPIChart_legend"
                                        style={{
                                            textAlign: "center",
                                            height: "40px",
                                            width: "100%",
                                            backgroundColor: "transparent",
                                            display: "inline-block",
                                            paddingBottom: '10px',
                                            fontSize: '81.25% !important',
                                            lineHeight: 1.5,
                                            fontWeight: 'bold'
                                        }}
                                    >

                                    </div>
                                </div>




                            )}
                        </div>
                    </div>



                </Splitter>
                {this.state.showFilterDialog && <Dialog title={"Data Filter"} height={340} width={550}


                    onClose={() => { this.setState({ showFilterDialog: false }) }}
                >
                    <div className="row mt-3">
                        <div className="col-4" >
                            <Checkbox
                                className="mr-3 ml-3"
                                label={"Filter Data"}
                            // checked={}
                            // onChange={(event) => {

                            // }}
                            />
                        </div>
                        <div className="col-8" style={{ display: "flex", justifyContent: "flex-end" }}> <Button
                            className=" mr-2"
                            id="cmdClose"
                            onClick={() => {
                                this.setState({ showFilterDialog: false })

                            }}
                        >
                            OK
                        </Button>
                            <Button
                                className=""
                                id="cmdClose"
                                onClick={() => {
                                    this.setState({ showFilterDialog: false })

                                }}
                            >
                                Close
                            </Button></div>


                    </div>
                    <div className="col-12 mt-4" style={{ width: "100%" }}>
                        <Label className="mr-2 mt-3">Main well</Label>
                        <DropDownList
                            name="selectedMainWell"
                            label=''
                            data={this.state.cboWellList}
                            textField="text"
                            dataItemKey="id"
                            value={this.state.selectedMainWell}
                            style={{ width: 200 }}
                            onChange={this.handleChangeDropDown}
                        />
                        <br />
                        <Label className="mr-4 mt-3">Filter Data By</Label>
                        <DropDownList
                            name="FilterBy"
                            label=''
                            data={this.filterByComboList}
                            textField="text"
                            dataItemKey="id"
                            value={this.state.FilterBy}
                            style={{ width: 200 }}
                            onChange={this.handleChangeDropDown}
                        />
                        {this.state.FilterBy.id == "1" && <div className="col-lg-12">
                            <div className="row ml-5">
                                <span className="ml-5 pl-2 ml-2 mt-2">
                                    <NumericTextBox
                                        //value={this.state.objTimeFilter.LastPeriod}
                                        format="n2"
                                        width="100px"
                                    //   onChange={(e: any) => {
                                    //     this.onTimeFilterChange(e, "LastPeriod");
                                    //   }}
                                    />
                                    <label className="leftPadding-small">Hours</label>
                                </span>
                            </div>
                        </div>}

                        <div className="col-lg-12 mt-3">

                            {this.state.FilterBy.id == "2" || this.state.FilterBy.id == "3" ? (
                                <label className="mr-4">From Date </label>
                            ) : (
                                ""
                            )}

                            {this.state.FilterBy.id == "2" || this.state.FilterBy.id == "3" ? (
                                <DateTimePicker
                                    name="txtFromDate"
                                    // value={new Date(this.state.objDataSelector.fromDate)}
                                    format="MM/dd/yyyy HH:mm:ss"
                                    formatPlaceholder={{
                                        year: "yyyy",
                                        month: "MM",
                                        day: "dd",
                                        hour: "HH",
                                        minute: "mm",
                                        second: "ss",
                                    }}
                                // onChange={(e) => {
                                //   this.setState({ fromDate: e.value });
                                // }}
                                // onChange={(e) => this.handleChange(e, "fromDate")}
                                />
                            ) : (
                                ""
                            )}
                            <br />
                            {this.state.FilterBy.id == "2" ? (
                                <label className="mr-4 ml-4">To Date </label>
                            ) : (
                                ""
                            )}

                            {this.state.FilterBy.id == "2" ? (
                                <DateTimePicker
                                    name="txtToDate"
                                    // value={new Date(this.state.objDataSelector.toDate)}
                                    format="MM/dd/yyyy HH:mm:ss"
                                    formatPlaceholder={{
                                        year: "yyyy",
                                        month: "MM",
                                        day: "dd",
                                        hour: "HH",
                                        minute: "mm",
                                        second: "ss",
                                    }}
                                // onChange={(e) => {
                                //   this.setState({ toDate: e.value });
                                // }}
                                //onChange={(e) => this.handleChange(e, "toDate")}
                                />
                            ) : (
                                ""
                            )}
                        </div>
                        <div className="col-lg-12">
                            {this.state.FilterBy.id == "4" || this.state.FilterBy.id == "5" ? (
                                <label className="mr-4">From Depth </label>
                            ) : (
                                ""
                            )}

                            {this.state.FilterBy.id == "4" || this.state.FilterBy.id == "5" ? (
                                <NumericTextBox
                                    width={100}
                                    name="txtFromDepth"
                                    // value={this.state.objDataSelector.fromDepth}
                                    format="n2"
                                // onChange={(e) => this.setState({ fromDepth: e.value })}
                                // onChange={(e) => this.handleChange(e, "fromDepth")}
                                />
                            ) : (
                                ""
                            )}
                            <br />
                            {this.state.FilterBy.id == "4" ? (
                                <label className="mr-4 ml-4">To Depth </label>
                            ) : (
                                ""
                            )}

                            {this.state.FilterBy.id == "4" ? (
                                <NumericTextBox
                                    name="txtFromDepth"
                                    width={100}
                                    //value={this.state.objDataSelector.fromDepth}
                                    format="n2"
                                // onChange={(e) => this.setState({ fromDepth: e.value })}
                                // onChange={(e) => this.handleChange(e, "fromDepth")}
                                />
                            ) : (
                                ""
                            )}
                        </div>

                    </div>
                </Dialog>}

            </div>
        );
    }
}


