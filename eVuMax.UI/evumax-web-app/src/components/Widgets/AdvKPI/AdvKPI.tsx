//https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces
//https://stackoverflow.com/questions/38330484/dynamic-complex-rowspan-in-html-table

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faFilter, faUndo } from "@fortawesome/free-solid-svg-icons";
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
import { filterBy } from "@progress/kendo-data-query";

import * as utilFunc from "../../../utilFunctions/utilFunctions";
import { confirmAlert } from "react-confirm-alert";

import { comboData } from "../../../eVuMaxObjects/UIObjects/comboData";
import { ADVKPIDataFilter } from "./AdvKPIDataFilter";
import { ETIMEDOUT } from "constants";
let _gMod = new GlobalMod();

let profileList: any[] = [];
export default class AdvKPI extends Component {
    //Cancel all Axios Request
    state = {
        panes: [{ size: "100%", collapsible: false, collapsed: false }, {}],
        grdWells: [],
        grdProfile: [],
        grdComposite: [],
        runKPIReport: false,
        runCompositeReport: false,
        warningMsg: [],
        selectedTab: 0,
        currentProfileID: "",
        showFilterDialog: false,
        showCrossHair: false,
        cboWellList: [],
        selectedMainWell: new comboData(),
        cboFilterType: new comboData(),
        KPIDataFilter: new ADVKPIDataFilter(),
        ProfileName: "",
        objFilterData: new ADVKPIDataFilter(),
        dataFilterString: "",
        isRealTime: false as boolean,

    };

    filterTypeComboList = [new comboData("Last Hours", "1"), new comboData("Date Range", "2"), new comboData("From Date Onwards", "3"), new comboData("Depth Range", "4"),
    new comboData("From Depth Onwards", "5"), new comboData("Current Section", "6")];

    KPIType = "";
    intervalID: NodeJS.Timeout | undefined;
    AxiosSource = axios.CancelToken.source();
    AxiosConfig = { cancelToken: this.AxiosSource.token };
    objChart: Chart;
    objData: any = "";
    phaseTagList: any = [];
    objProfile: any = "";
    objCompositeProfile: any = "";
    objAxisList: any = [];
    topAxisCount: number = 0;
    objSeries: DataSeries;
    objDataSeries: any;
    doHighlightTags: boolean = true;



    ID: string = "";
    SelectedWellList: string = "";

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
                grdProfile: Object.values(objData.grdProfile),
                grdWells: newWellList
            });
            profileList = Object.values(objData.grdProfile);
            console.log("grdWell", this.state.grdWells);
            console.log("grdProfile", this.state.grdProfile);

        } catch (error) {

        }
    }

    onAfterAxisDraw = (e, i) => {
        try {


            let lastPoint: number = 0;
            this.objChart.ShowCustomComments = true;

            let cX1 = this.objChart.__chartRect.left;
            let cX2 = this.objChart.__chartRect.right;

            let cY1 = this.objChart.__chartRect.top;
            let cY2 = this.objChart.__chartRect.bottom;

            // '***********************************Phase Tags ************************************************************''
            if ((this.doHighlightTags
                && (this.objProfile.TagSourceID.trim() == ""))) {

                let y1: number;
                let y2: number;


                let objSeries: DataSeries = this.objChart.DataSeries.values().next().value;

                let objVertAxis: Axis = new Axis();
                objVertAxis = this.objChart.getAxisByID(objSeries.YAxisId);

                let objHorizAxis: Axis = new Axis();
                objHorizAxis = this.objChart.getAxisByID(objSeries.XAxisId);

                if (objVertAxis.Inverted) {
                    // y1 = objSeries.getMaxY();
                    // y2 = objSeries.getMinY();

                    y1 = objVertAxis.ScaleRef(objSeries.getMaxY());
                    y2 = objVertAxis.ScaleRef(objSeries.getMinY());
                }
                else {
                    // y1 = objSeries.getMinY();
                    // y2 = objSeries.getMaxY();
                    y1 = objVertAxis.ScaleRef(objSeries.getMinY());
                    y2 = objVertAxis.ScaleRef(objSeries.getMaxY());
                }

                let totalHeight: number = (y2 - y1);
                let phaseHeight: number = ((totalHeight * 100)
                    / 100);


                cY2 = (cY1 + phaseHeight);     //y2 = (y1 + phaseHeight);//WIP ??
                // let objFont: Steema.TeeChart.Drawing.ChartFont = new Steema.TeeChart.Drawing.ChartFont();
                // objFont.Name = "Arial";
                // objFont.Size = 9;
                // objFont.Bold = true;
                // objFont.Color = Color.Black;

                let phaseList: any = Object.values(this.phaseTagList);
                phaseList.sort(function (a, b) {
                    return a.NumericValue - b.NumericValue;
                });


                // Object.values(this.phaseTagList).forEach((objPhaseTag: any) => {
                for (let index = 0; index < phaseList.length; index++) {
                    let objPhaseTag = phaseList[index];


                    let doContinue: boolean = true;
                    if ((Object.values(this.objProfile.tagFilter).length > 0)) {
                        let found: boolean = false;
                        // if ((this.objProfile.TagLevel == 0)) {
                        //     for (let objItem: AdvKPIPhase in this.objProfile.tagFilter.Values) {
                        //         if ((objItem.PhaseID == objPhaseTag.PhaseID)) {
                        //             found = true;
                        //             break;
                        //         }

                        //     }

                        // }

                        // if ((this.objProfile.TagLevel == 1)) {
                        //     for (let objItem: AdvKPIPhase in this.objProfile.tagFilter.Values) {
                        //         if (((objItem.PhaseID == objPhaseTag.PhaseID)
                        //             && (objItem.StepID == objPhaseTag.StepID))) {
                        //             found = true;
                        //             break;
                        //         }

                        //     }

                        // }

                        // if ((this.objProfile.TagLevel == 2)) {
                        //     for (let objItem: AdvKPIPhase in objProfile.tagFilter.Values) {
                        //         if (((objItem.PhaseID == objPhaseTag.PhaseID)
                        //             && ((objItem.StepID == objPhaseTag.StepID)
                        //                 && (objItem.EmphID == objPhaseTag.EmphID)))) {
                        //             found = true;
                        //             break;
                        //         }

                        //     }

                        // }

                        if (!found) {
                            doContinue = false;
                        }

                    }

                    if (doContinue) {



                        let x1: number = objHorizAxis.ScaleRef(objPhaseTag.NumericValue);

                        let x2: number = 0;



                        if (objPhaseTag.IsOpen) {

                            x2 = objHorizAxis.ScaleRef(objPhaseTag.NumericValue);


                            objPhaseTag.NumericValue = objHorizAxis.getAxisRange().Max;
                            x1 = cX2 - 20; //objHorizAxis.ScaleRef(objHorizAxis.getAxisRange().Max);
                            // 
                            // if(x1==undefined){
                            //     x1 = cX2; //Right Edge of Chart
                            // }




                        }
                        else {
                            x2 = objHorizAxis.ScaleRef(objPhaseTag.NumericValue);
                        }

                        if ((x1 < cX1)) {
                            x1 = cX1;
                        }

                        if ((x1 > cX2) && (!objPhaseTag.IsOpen)) {
                            x1 = cX2;
                        }

                        if ((x2 < cX1)) {
                            x2 = cX1;
                        }

                        if ((x2 > cX2)) {
                            x2 = cX2;
                        }



                        if ((x1 >= (lastPoint + 10))) {

                            let txtLabel = objPhaseTag.phaseName + (" : " + (objPhaseTag.stepName + (" : " + objPhaseTag.emphName)));
                            // if (objPhaseTag.IsOpen) {
                            //     alert("abcd" +txtLabel);
                            // }

                            this.objChart.SVGRect.append("g")
                                .attr("class", "text-" + this.objChart.Id)
                                .attr(
                                    "transform",
                                    "translate(" + (x1) + "," + this.objChart.__chartRect.bottom + ") rotate(-90)"
                                )
                                .append('text')
                                .style('background-color', 'green')
                                .attr('class', 'axis-title')

                                .attr('dy', '.75em')
                                .text(txtLabel);

                            //************************************ */


                            lastPoint = x1;
                        }


                    }

                }
                //);


            }

            // '*******************************************************************************************************''
            // '***********************************Custom Tags ************************************************************''
            // if ((doHighlightTags
            //     && (objProfile.TagSourceID.Trim != ""))) {
            //     let y1: number;
            //     let y2: number;
            //     let objSeries: Steema.TeeChart.Styles.Series = objChart.Series(0);
            //     let objVertAxis: Steema.TeeChart.Axis = objSeries.CustomVertAxis;
            //     let objHorizAxis: Steema.TeeChart.Axis = objSeries.CustomHorizAxis;
            //     if (objVertAxis.Inverted) {
            //         y1 = objVertAxis.CalcYPosValue(objVertAxis.Maximum);
            //         y2 = objVertAxis.CalcYPosValue(objVertAxis.Minimum);
            //     }
            //     else {
            //         y1 = objVertAxis.CalcYPosValue(objVertAxis.Minimum);
            //         y2 = objVertAxis.CalcYPosValue(objVertAxis.Maximum);
            //     }

            //     let totalHeight: number = (y2 - y1);
            //     let phaseHeight: number = ((totalHeight * 100)
            //         / 100);
            //     y2 = (y1 + phaseHeight);
            //     let objFont: Steema.TeeChart.Drawing.ChartFont = new Steema.TeeChart.Drawing.ChartFont();
            //     objFont.Name = "Arial";
            //     objFont.Size = 9;
            //     objFont.Bold = true;
            //     objFont.Color = Color.Black;
            //     for (let objPhaseTag: clsCustomTag in customTagList.Values) {
            //         let x1: number = objHorizAxis.CalcXPosValue(objPhaseTag.NumericValue);
            //         let x2: number = 0;
            //         if (objPhaseTag.IsOpen) {
            //             x2 = objHorizAxis.CalcXPosValue(objHorizAxis.Maximum);
            //             objPhaseTag.NumericValue = objHorizAxis.Maximum;
            //         }
            //         else {
            //             x2 = objHorizAxis.CalcXPosValue(objPhaseTag.NumericValue);
            //         }

            //         if ((x1 < cX1)) {
            //             x1 = cX1;
            //         }

            //         if ((x1 > cX2)) {
            //             x1 = cX2;
            //         }

            //         if ((x2 < cX1)) {
            //             x2 = cX1;
            //         }

            //         if ((x2 > cX2)) {
            //             x2 = cX2;
            //         }

            //         let objBrush: System.Drawing.SolidBrush = new System.Drawing.SolidBrush(Color.FromArgb(40, objPhaseTag.TagColor));
            //         g.FillRectangle(objBrush, x1, y1, (x2 - x1), (y2 - y1));
            //         g.Font = objFont;
            //         g.RotateLabel(x1, y1, (objPhaseTag.TagCategoryName + (" : "
            //             + (objPhaseTag.TagSubCategoryName + (" : " + objPhaseTag.TagActivityName)))), 90);
            //     }

            // }



        } catch (error) {
            //   alert(error);
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



            this.objChart.onAfterAxisDraw.subscribe((e, i) => {
                this.onAfterAxisDraw(e, i);
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



    initializeCompositeChart = (chartId: string) => {
        try {

            debugger;
            // this.objCompositeProfile.items.forEach(element => {



            // });


            let objChart: Chart = new Chart(this, "objChart" + chartId);
            objChart.ContainerId = chartId;

            objChart.onAfterSeriesDraw.subscribe((e, i) => {
                this.onAfterSeriesDraw(e, i);
            });

            objChart.onAfterAxisDraw.subscribe((e, i) => {
                this.onAfterAxisDraw(e, i);
            });

            objChart.DataSeries.clear();
            objChart.Axes.clear();
            objChart.createDefaultAxes();
            objChart.updateChart();

            objChart.leftAxis().AutoScale = true;
            objChart.leftAxis().Inverted = false;
            objChart.leftAxis().ShowLabels = true;
            objChart.leftAxis().ShowTitle = true;
            objChart.leftAxis().Title = "";
            objChart.leftAxis().Visible = true;

            objChart.bottomAxis().AutoScale = true;
            objChart.bottomAxis().IsDateTime = false;
            objChart.bottomAxis().bandScale = false; //wip
            objChart.bottomAxis().ShowLabels = true;
            objChart.bottomAxis().ShowTitle = false;
            objChart.bottomAxis().LabelAngel = 90;
            objChart.bottomAxis().ShowSelector = false;
            objChart.bottomAxis().Visible = true;
            objChart.bottomAxis().PaddingMax = 0; //wip


            objChart.rightAxis().Visible = false;
            objChart.rightAxis().ShowLabels = false;

            objChart.MarginLeft = 50;
            objChart.MarginBottom = 50;
            objChart.MarginTop = 10;
            objChart.MarginRight = 90;

            objChart.initialize();

            objChart.reDraw();
            return objChart;

        } catch (error) {
            alert(error);
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

    plotChart = (paramObjChart: Chart) => {
        try {
            this.objChart = paramObjChart;
            //Load Workspace Wells into Combo FilterData
            debugger;
            let WellList: any = Object.values(this.objData.objWorkSpace.wells);
            if (WellList != null || WellList.length > 0) {

                let wellComboList: comboData[] = [];
                let objCombo: comboData;
                // wellComboList.push(new comboData("Select Main Well", "-1"));

                for (let index = 0; index < WellList.length; index++) {
                    const objWell: any = WellList[index].objWell;
                    if (objWell == undefined) {
                        continue;
                    }
                    objCombo = new comboData(objWell.name, objWell.ObjectID);
                    wellComboList.push(objCombo);
                }


                let dataFilterString = "";
                if (this.objData.FilterData == true) {
                    dataFilterString = "(";
                    switch (this.objData.FilterType) {
                        // AllData = 0,
                        // LastHours = 1,
                        // DateRange = 2,
                        // DateOnwards = 3,
                        // DepthRange = 4,
                        // DepthOnwards = 5,
                        // CurrentSection = 6
                        //                         FilterData: false
                        // FilterMainWellID: ""
                        // FilterType: 0
                        // Filter_FromDate: "0001-01-01T00:00:00"
                        // Filter_FromDepth: 0
                        // Filter_LastHours: 0
                        // Filter_ToDate: "0001-01-01T00:00:00"
                        // Filter_ToDepth: 0



                        case 0:

                            break;
                        case 1:
                            dataFilterString += "Last " + this.objData.Filter_LastHours + " Hours";
                            break;
                        case 2:
                            dataFilterString += "From Date " + this.objData.Filter_FromDate + " to " + this.objData.Filter_ToDate;
                            break;
                        case 3:
                            dataFilterString += "From Date " + this.objData.Filter_FromDate + " onwards";
                            break;
                        case 4:
                            dataFilterString += "From Depth " + this.objData.Filter_FromDepth + " to " + this.objData.Filter_ToDepth;
                            break;
                        case 5:
                            dataFilterString += "From Depth " + this.objData.Filter_FromDepth + " onwards";
                            break;
                        case 6:
                            dataFilterString += "Current Well Section";
                            break;


                        default:
                            dataFilterString = "";
                            break;
                    }

                    dataFilterString += ")";
                }

                this.setState({
                    cboWellList: wellComboList,
                    ProfileName: this.objData.objProfile.ProfileName + dataFilterString,
                });

            }


         

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
                    //objAxis.PaddingMax = 50;
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





                    //prath

                    if ((this.objData.objProfile.DataGroup = 1) && this.objData.objProfile.TimeUnit == 3) {
                        this.getGroupSeriesData();
                    } else {
                        this.getSingleSeriesData(); //WIP
                    }
                    //


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
                            //          this.getLineSeriesData();
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
                            //     this.getGroupSeriesData();
                            break;
                        case 4://Histogram
                            this.objSeries.Type = dataSeriesType.Bar;
                            //Pending Make band scale True -99999999 pending
                            break;
                        case 5://Pie
                            this.objSeries.Type = dataSeriesType.Pie;

                            break;
                        case 6://Bar

                            this.objSeries.Type = dataSeriesType.Bar;

                            let objBottomAxes: Axis = new Axis();

                            objBottomAxes = this.objChart.getAxisByID(this.objSeries.XAxisId);
                            objBottomAxes.bandScale = true;

                            //set Y scale Min Value with Zero (0)
                            let objYAxes = this.objChart.getAxisByID(this.objSeries.YAxisId);
                            objYAxes.autoScaleMinValueZero = true;






                            this.objSeries.Stacked = false;
                            this.objSeries.Color = "rgb( " + objDataSeries.SeriesColor + ")";//Dont change position of this line
                            this.objSeries.ShowLabelOnSeries = true; //Parth 05-10-2020
                            //    this.getSingleSeriesData(); //WIP



                            break;

                        default:
                            break;
                    }




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

                    //     this.objChart.DataSeries.set(this.objSeries.Id, this.objSeries);
                    //    }


                }



                
                this.objChart.updateChart();



                this.objChart.reDraw();

            }
        } catch (error) {

        }
    }


    plotCompositeChart = async () => {
        try {

           
            await this.generateDynamicTable();

            ////data location: objCompositeProfile.Items[0].objProfile.objProcessor
            ////objCompositeProfile.Items[0].objProfile.objProcessor.outputData[0].arrXData
            for (let index = 0; index < this.objCompositeProfile.items.length; index++) {
                debugger;
                let objItem = this.objCompositeProfile.items[index];
                //this.objData.objProfile = objItem.objProfile;
                //this.objData.outputData = objItem.
                this.plotChartCompositeEx(objItem);
            }


        } catch (error) {
            
        }
    }

    populateWellCombo = () => {
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
                    if (objWell == undefined) {
                        continue;
                    }
                    objCombo = new comboData(objWell.name, objWell.ObjectID);
                    wellComboList.push(objCombo);
                }

                this.setState({
                    cboWellList: wellComboList,
                });
            }

        } catch (error) {

        }
    }
    plotChartCompositeEx = (paramObjItem: any) => {
        try {

            let objItem = paramObjItem;
            this.objChart = paramObjItem.objChart;
            let dataFilterString = "";
            if (this.objData.FilterData == true) {
                dataFilterString = "(";
                switch (this.objData.FilterType) {
                    // AllData = 0,
                    // LastHours = 1,
                    // DateRange = 2,
                    // DateOnwards = 3,
                    // DepthRange = 4,
                    // DepthOnwards = 5,
                    // CurrentSection = 6
                    //                         FilterData: false
                    // FilterMainWellID: ""
                    // FilterType: 0
                    // Filter_FromDate: "0001-01-01T00:00:00"
                    // Filter_FromDepth: 0
                    // Filter_LastHours: 0
                    // Filter_ToDate: "0001-01-01T00:00:00"
                    // Filter_ToDepth: 0



                    case 0:

                        break;
                    case 1:
                        dataFilterString += "Last " + this.objData.Filter_LastHours + " Hours";
                        break;
                    case 2:
                        dataFilterString += "From Date " + this.objData.Filter_FromDate + " to " + this.objData.Filter_ToDate;
                        break;
                    case 3:
                        dataFilterString += "From Date " + this.objData.Filter_FromDate + " onwards";
                        break;
                    case 4:
                        dataFilterString += "From Depth " + this.objData.Filter_FromDepth + " to " + this.objData.Filter_ToDepth;
                        break;
                    case 5:
                        dataFilterString += "From Depth " + this.objData.Filter_FromDepth + " onwards";
                        break;
                    case 6:
                        dataFilterString += "Current Well Section";
                        break;


                    default:
                        dataFilterString = "";
                        break;
                }

                dataFilterString += ")";
            }

            this.setState({

                ProfileName: this.objData.objProfile.ProfileName + dataFilterString,
            });

            this.objChart.CrossHairRequire = this.state.showCrossHair;
            this.objChart.Title = objItem.objProfile.ProfileName;
            
            this.objChart.MarginTop = 50;

            //let objXData: any = Object.values(objItem.objProfile.objProcessor.outputData[0].arrXData);
            let axesListArr: any = Object.values(objItem.objProfile.axesList);

            if (axesListArr != null || axesListArr != undefined) {
                this.objAxisList = Object.values(axesListArr);
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

                let axisList: any = axesListArr;
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
                    objAxis.PaddingMax=20;
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
                    //objAxis.PaddingMax = 50;
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

                
                //Load Series
               debugger;
                let SeriesList = Object.values(objItem.objProfile.objProcessor.outputData)
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

                    let DataGroup = objItem.objProfile.DataGroup;
                    let TimeUnit =  objItem.objProfile.TimeUnit;
                    //if ((this.objData.objProfile.DataGroup = 1) && this.objData.objProfile.TimeUnit == 3) {
                        if ((DataGroup = 1) && TimeUnit == 3) {
                        this.getGroupSeriesData();
                    } else {
                        this.getSingleSeriesData(); //WIP
                    }
                    //


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
                            //          this.getLineSeriesData();
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
                            //     this.getGroupSeriesData();
                            break;
                        case 4://Histogram
                            this.objSeries.Type = dataSeriesType.Bar;
                            //Pending Make band scale True -99999999 pending
                            break;
                        case 5://Pie
                            this.objSeries.Type = dataSeriesType.Pie;

                            break;
                        case 6://Bar

                            this.objSeries.Type = dataSeriesType.Bar;

                            let objBottomAxes: Axis = new Axis();

                            objBottomAxes = this.objChart.getAxisByID(this.objSeries.XAxisId);
                            objBottomAxes.bandScale = true;

                            //set Y scale Min Value with Zero (0)
                            let objYAxes = this.objChart.getAxisByID(this.objSeries.YAxisId);
                            objYAxes.autoScaleMinValueZero = true;






                            this.objSeries.Stacked = false;
                            this.objSeries.Color = "rgb( " + objDataSeries.SeriesColor + ")";//Dont change position of this line
                            this.objSeries.ShowLabelOnSeries = true; //Parth 05-10-2020
                            //    this.getSingleSeriesData(); //WIP



                            break;

                        default:
                            break;
                    }




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

                    //     this.objChart.DataSeries.set(this.objSeries.Id, this.objSeries);
                    //    }


                }



                this.objChart.updateChart();



                this.objChart.reDraw();
            }
        } catch (error) {

        }
    }




    getGroupSeriesData = () => {
        try {
            console.clear();
            this.objSeries.Data.length = 0;
            //alert("Group - " + this.objSeries.Title + " --> " + this.objSeries.Stacked);
            let SeriesXData: any = Object.values(this.objDataSeries.arrXData);
            let SeriesYData: any = Object.values(this.objDataSeries.arrYData);

            SeriesXData.sort(function (a, b) {
                return a - b;
            });

            SeriesYData.sort(function (a, b) {
                return a - b;
            });

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
            //       alert(SeriesXData.length);
            for (let i = 0; i < SeriesXData.length; i++) {
                let objVal: ChartData = new ChartData();

                objVal.x = eval(Number(SeriesXData[i]).toFixed(4));
                objVal.y = eval(Number(SeriesYData[i]).toFixed(2));

                this.objSeries.Data.push(objVal);
            }
            this.objChart.DataSeries.set(this.objSeries.Id, this.objSeries);


        } catch (error) {

        }
    }



    getSingleSeriesData = () => {
        try {

            let SeriesData: any = Object.values(this.objDataSeries.outputData);

            //prath 04-Feb-2022 (To handle autoscale false case - No need to fill all data to series to avoid overlape charts)
            let xMin = 0;
            let xMax = 0;
            let yMin = 0;
            let yMax = 0;
            let autoScaleX: boolean = true;
            let autoScaleY: boolean = true;
            if (this.objChart.Axes.get(this.objSeries.XAxisId).AutoScale == false) {
                xMin = this.objChart.Axes.get(this.objSeries.XAxisId).getMin();
                xMax = this.objChart.Axes.get(this.objSeries.XAxisId).getMax();
                autoScaleX = false;
            }
            if (this.objChart.Axes.get(this.objSeries.YAxisId).AutoScale == false) {
                yMin = this.objChart.Axes.get(this.objSeries.YAxisId).getMin();
                yMax = this.objChart.Axes.get(this.objSeries.YAxisId).getMax();
                autoScaleY = false;
            }
            //==========================================
            let objBottomAxes: Axis = new Axis();
            objBottomAxes = this.objChart.getAxisByID(this.objSeries.XAxisId);
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

                if (this.objSeries.Type == dataSeriesType.Bar) {
                    objVal.x = i + 1;
                } else {
                    objVal.x = Number(SeriesData[i].XValue);
                }

                objVal.y = eval(Number(SeriesData[i].YValue).toFixed(2));
                objBottomAxes.Labels.push(SeriesData[i].XLabel);


                this.objSeries.Data.push(objVal);

            }
            this.objChart.DataSeries.set(this.objSeries.Id, this.objSeries);

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


    runCompositeKPIReport = (paramProfileID: string, SelectedWellList: any) => {

        try {

            SelectedWellList = SelectedWellList.substring(1, SelectedWellList.length);
            let newPanes: any = this.state.panes;
            newPanes[0].collapsible = true;
            newPanes[0].collapsed = true;



            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "AdvKPI.Manager";
            objBrokerRequest.Broker = "AdvKPI";
            objBrokerRequest.Function = "processCompositeAdvKPI";

            let objParameter = new BrokerParameter("", "");

            objParameter = new BrokerParameter("UserID", _gMod._userId);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("ProfileID", paramProfileID);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("WellList", SelectedWellList);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter("objFilterData", JSON.stringify(this.state.objFilterData));
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
                 
                    debugger;

                    let objDataReeceive = JSON.parse(res.data.Response);
                    console.log("objDataReeceive", objDataReeceive);

                 
                    this.objCompositeProfile = objDataReeceive.objCompositeProfile;
                    let objCompositeProfileItems = Object.values(objDataReeceive.objCompositeProfile.items);
                    this.objData = objDataReeceive.objProcessor;//Old
                    
                    objCompositeProfileItems.sort((a: any, b: any) => {
                        if (a.Row === b.Row) {
                            return a.Col < b.Col ? -1 : 1
                        } else {
                            return a.Row < b.Row ? -1 : 1
                        }
                    });
                    this.objCompositeProfile.items = objCompositeProfileItems;


                    this.plotCompositeChart();
                    //Warnings Notifications
                    let warnings: string = res.data.Warnings;
                    if (warnings.trim() != "") {
                        let warningList = [];
                        warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
                        this.setState({
                            warningMsg: warningList
                        });
                    }


                    Util.StatusSuccess("Data successfully retrived,Now Ploting...");
                    Util.StatusReady();

                })
                .catch((error) => {

                    Util.StatusError(error.message);
                 

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

            objParameter = new BrokerParameter("objFilterData", JSON.stringify(this.state.objFilterData));
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


                    let objDataReeceive = JSON.parse(res.data.Response);


                    this.objData = objDataReeceive.objProcessor;
                    this.objProfile = objDataReeceive.objProfile;
                    this.phaseTagList = objDataReeceive.phaseTagList;

                    console.log("AdvKPI", this.objData);


                    this.initializeChart();
                    this.plotChart(this.objChart);
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
        if (this.state.runKPIReport == false) {
            return;
        }
        this.setState({
            panes: event.newState,
            warningMsg: []
        });
    };


    handleChangeDropDown = async (event: any, fieldName: string, filterObject: string) => {



        let edited = this.state.objFilterData;
        edited[filterObject] = event.value.id;
        await this.setState({
            objDataFilter: edited
        });

        //this.setState({ [event.target.name]: event.value });
        this.setState({ [fieldName]: new comboData(event.value.text, event.value.id) });

    }

    cmdRunKPI_click = (e, objRow: any, RunType: string) => {
        try {

            //load Selected Wells
            let wells = this.state.grdWells;
            //let SelectedWellList = "";
            for (let index = 0; index < wells.length; index++) {

                if (wells[index].selected1 == true) {
                    this.SelectedWellList += "," + wells[index].WellID;
                }

            }


            if (this.SelectedWellList == "") {
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


            //let ID: string = "";
            if (RunType == "RunKPI") {
                this.ID = objRow.PROFILE_ID;
                this.runKPIReport(this.ID, this.SelectedWellList);
                this.setState({ runKPIReport: true });
            }
            if (RunType == "RunComposite") {
                this.ID = objRow.TEMPLATE_ID;
                this.runCompositeKPIReport(this.ID, this.SelectedWellList);
                this.setState({ runCompositeReport: true });
            }


            this.setState({
                panes: newPanes,
                currentRow: objRow,
                currentProfileID: this.ID,

                //showChartDialog: false,
            });



        } catch (error) { }
    };

    ClosePanel = async () => {
        try {


            this.AxiosSource.cancel();
            await clearInterval(this.intervalID);
            this.intervalID = null;
            this.ID = ""
            this.SelectedWellList = "";

            this.setState({
                objFilterData: new ADVKPIDataFilter(),
                ProfileName: "",
                grdProfile: profileList,
                panes: [{ size: "100%", collapsible: false, collapsed: false }, {}],
                runKPIReport: false,
                runCompositeKPIReport: false,
                runCompositeReport:false
            })
            $("#AdvKPIChart").empty();



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

    filterData = (e: any) => {
        let value = e.target.value;
        let filter: any = {
            logic: "or",
            filters: [
                { field: "NOTES", operator: "contains", value: value },
                { field: "PROFILE_NAME", operator: "contains", value: value },
            ],
        };

        this.setState({
            grdProfile: filterBy(profileList, filter),
        });
    };


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

    handleChange = async (event: any, fieldName: string) => {
        try {


            await this.setState({
                [fieldName]: event.value
            });

            if (this.state.isRealTime) {
                if (this.state.runKPIReport) {
                    this.intervalID = setInterval(this.runKPIReport.bind(this), 15000);
                }

                if (this.state.runCompositeReport) {
                    this.intervalID = setInterval(this.runCompositeKPIReport.bind(this), 15000);
                }

            } else {
                this.AxiosSource.cancel();
                await clearInterval(this.intervalID);
                this.intervalID = null;

            }

            if (fieldName == "showCrossHair") {
                if (this.state.selectedTab==0){
                    this.plotChart(this.objChart);
                }
                if (this.state.selectedTab==1){
                    this.plotCompositeChart();
                }
                
            }

        } catch (error) {

        }

    }

    handleDataFilterChange = async (event: any, fieldName: string) => {
        try {


            let edited = this.state.objFilterData;
            edited[fieldName] = event.value;
            await this.setState({
                objDataFilter: edited
            });

        } catch (error) {

        }

    }


    findRowCells = (rowNo) => {
        try {

            let nCols = 0;
            for (let index = 0; index < this.objCompositeProfile.items.length; index++) {
                //const element = array[index];
                if (this.objCompositeProfile.items[index].Row == rowNo) {
                    nCols = nCols + 1;

                }

            }

            //    alert("Row -" +rowNo + " Col - " + nCols);
            return nCols;


        } catch (error) {

        }
    }
    generateDynamicTable() {
        // get the reference for the body

        let nRows: number = this.objCompositeProfile.Rows;
        // let nCols: number = this.objCompositeProfile.Columns;

        var dyanicDiv = document.getElementById("dynamicDiv");
        // creates a <table> element and a <tbody> element
        var tbl = document.createElement("table");
        tbl.setAttribute('style', 'width:100%; height:calc(80vh)');

        var tblBody = document.createElement("tbody");

        // creating all cells
        for (var i = 0; i < nRows; i++) {
            // creates a table row

            //let objItem : any = this.objCompositeProfile.items[i];
            let objItem: any = this.objCompositeProfile.items.filter(item => item.Row == i);

            // this.objCompositeProfile.items[i];


            let rowTotalCells = this.findRowCells(i);

            var row = document.createElement("tr");

            let nCell = 0;

            for (let cellNo = 0; cellNo < rowTotalCells; cellNo++) {

                if (nCell > rowTotalCells) {
                    continue;
                }

                let cell = document.createElement("td");
                let cellId = "";

                if (objItem[nCell].RowSpan > 1) {
                    cell.setAttribute('rowspan', objItem[nCell].RowSpan);
                }

                if (objItem[nCell].ColSpan > 1 && nCell <= rowTotalCells) {
                    cell.setAttribute('colspan', objItem[nCell].ColSpan);
                    debugger;
                    cellId = "Chart-" + utilFunc.removeUnderScoreFromID(objItem[nCell].ProfileID.toString());
                    objItem[nCell].objChart = (this.initializeCompositeChart(cellId));
                    nCell = nCell + objItem[nCell].ColSpan;
                } else {
                    cellId = "Chart-" + utilFunc.removeUnderScoreFromID(objItem[nCell].ProfileID.toString());
                    objItem[nCell].objChart = (this.initializeCompositeChart(cellId));
                    nCell = nCell + 1;
                }


                let cellText = document.createTextNode("cell in row " + i + ", Cell id " + cellId);

                let chartDiv = document.createElement("div");

                chartDiv.setAttribute('id', cellId);
                chartDiv.style.backgroundColor = "transparent";
                chartDiv.style.height = "100%";
                chartDiv.style.width = "100%";
                // chartDiv.setAttribute('height', "500px");
                // chartDiv.setAttribute('width', "500px");
                // chartDiv.setAttribute('background-color', "red");




                // chartDiv.appendChild(cellText);
                cell.appendChild(chartDiv);
                row.appendChild(cell);
            }

            // add the row to the end of the table body
            tblBody.appendChild(row);
        }

        // put the <tbody> in the <table>
        tbl.appendChild(tblBody);
        // appends <table> into <body>
        dyanicDiv.appendChild(tbl);
        // sets the border attribute of tbl to 2;
        tbl.setAttribute("border", "2");
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

                    <div className={this.state.runKPIReport || this.state.runCompositeReport ? "k-state-disabled" : "pane-content"}>

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
                                        <div className="k-textbox k-space-right serachStyle">
                                            <input
                                                type="text"
                                                onChange={this.filterData}
                                                placeholder="Search"
                                            />
                                            <a className="k-icon k-i-search" style={{ right: "10px" }}>
                                                &nbsp;
                                            </a>
                                        </div>
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

                                    <TabStripTab title="Composite Templates">
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
                                    </TabStripTab>
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
                                checked={this.state.isRealTime}
                                onChange={(event) => {
                                    this.handleChange(event, "isRealTime");

                                }}

                            />
                            <Checkbox
                                name="showCrossHair"
                                className="mr-3 ml-3"
                                label={"Cross Hair"}
                                checked={this.state.showCrossHair}

                                onChange={(event) => {
                                    this.handleChange(event, "showCrossHair");

                                }}
                            />
                            <div className="mr-5">
                                <FontAwesomeIcon
                                    icon={faUndo}
                                    size="lg"
                                    onClick={() => {
                                        this.plotChart(this.objChart);
                                        this.plotCompositeChart();
                                    }}
                                />
                            </div>
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
                            {this.state.runKPIReport && (

                                <div>
                                    <Label className="float-left">{this.state.ProfileName}</Label>

                                    <div
                                        id="AdvKPIChart"
                                        style={{
                                            float: "left",
                                            //height: "calc(((100vh - 400px)*30)/100)",
                                            height: "70vh",
                                            width: "calc(100vw - 280px)",
                                            backgroundColor: "transparent",
                                        }}
                                        className="px-mt-2"
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



                        {/* prath */}
                        <div className="">
                            {/* <DataSelectorInfo objDataSelector={this.state.objDataSelector} isRealTime={false} ></DataSelectorInfo> */}
                            {this.state.runCompositeReport && (

                                <div>
                                    {/* <Label className="float-left">{this.state.ProfileName}</Label> */}

                                    <div
                                        id="AdvCompositeChart"
                                        style={{
                                            float: "left",
                                            //height: "calc(((100vh - 400px)*30)/100)",
                                            height: "70vh",
                                            width: "calc(100vw - 280px)",
                                            backgroundColor: "transparent",
                                        }}
                                        className="px-mt-2"
                                    >
                                        <div id="dynamicDiv">
                                           Composite Plot
                                        </div>

                                    </div>


                                </div>
                            )}
                        </div>
                        {/* prath */}
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
                                checked={this.state.objFilterData.FilterData}
                                onChange={(event) => {
                                    this.handleDataFilterChange(event, "FilterData");

                                }}
                            />
                        </div>
                        <div className="col-8" style={{ display: "flex", justifyContent: "flex-end" }}> <Button
                            className=" mr-2"
                            id="cmdClose"
                            onClick={() => {
                                this.setState({ showFilterDialog: false });
                                alert("composite pending");
                                this.runKPIReport(this.ID, this.SelectedWellList);

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

                            onChange={(event) => {
                                this.handleChangeDropDown(event, "selectedMainWell", "FilterMainWellID");

                            }}
                        />
                        <br />
                        <Label className="mr-4 mt-3">Filter Data By</Label>
                        <DropDownList
                            name="FilterBy"
                            label=''
                            data={this.filterTypeComboList}
                            textField="text"
                            dataItemKey="id"
                            value={this.state.cboFilterType}
                            style={{ width: 200 }}
                            onChange={(event) => {
                                this.handleChangeDropDown(event, "cboFilterType", "FilterType");

                            }}

                        />
                        {this.state.cboFilterType.id == "1" && <div className="col-lg-12">
                            <div className="row ml-5">
                                <span className="ml-5 pl-2 ml-2 mt-2">
                                    <NumericTextBox
                                        value={this.state.objFilterData.Filter_LastHours}
                                        format="n2"
                                        width="100px"
                                        onChange={(event) => {
                                            this.handleDataFilterChange(event, "Filter_LastHours");

                                        }}
                                    />
                                    <label className="leftPadding-small">Hours</label>
                                </span>
                            </div>
                        </div>}

                        <div className="col-lg-12 mt-3">

                            {this.state.cboFilterType.id == "2" || this.state.cboFilterType.id == "3" ? (
                                <label className="mr-4">From Date </label>
                            ) : (
                                ""
                            )}

                            {this.state.cboFilterType.id == "2" || this.state.cboFilterType.id == "3" ? (
                                <DateTimePicker
                                    name="txtFromDate"
                                    value={new Date(this.state.objFilterData.Filter_FromDate)}
                                    format="MM/dd/yyyy HH:mm:ss"
                                    formatPlaceholder={{
                                        year: "yyyy",
                                        month: "MM",
                                        day: "dd",
                                        hour: "HH",
                                        minute: "mm",
                                        second: "ss",
                                    }}
                                    onChange={(event) => {
                                        this.handleDataFilterChange(event, "Filter_FromDate");

                                    }}
                                />
                            ) : (
                                ""
                            )}
                            <br />
                            {this.state.cboFilterType.id == "2" ? (
                                <label className="mr-4 ml-4">To Date </label>
                            ) : (
                                ""
                            )}

                            {this.state.cboFilterType.id == "2" ? (
                                <DateTimePicker
                                    name="txtToDate"
                                    value={new Date(this.state.objFilterData.Filter_ToDate)}
                                    format="MM/dd/yyyy HH:mm:ss"
                                    formatPlaceholder={{
                                        year: "yyyy",
                                        month: "MM",
                                        day: "dd",
                                        hour: "HH",
                                        minute: "mm",
                                        second: "ss",
                                    }}
                                    onChange={(event) => {
                                        this.handleDataFilterChange(event, "Filter_ToDate");

                                    }}
                                />
                            ) : (
                                ""
                            )}
                        </div>
                        <div className="col-lg-12">
                            {this.state.cboFilterType.id == "4" || this.state.cboFilterType.id == "5" ? (
                                <label className="mr-4">From Depth </label>
                            ) : (
                                ""
                            )}

                            {this.state.cboFilterType.id == "4" || this.state.cboFilterType.id == "5" ? (
                                <NumericTextBox
                                    width={100}
                                    name="txtFromDepth"
                                    value={this.state.objFilterData.Filter_FromDepth}
                                    format="n2"
                                    onChange={(event) => {
                                        this.handleDataFilterChange(event, "Filter_FromDepth");

                                    }}
                                />
                            ) : (
                                ""
                            )}
                            <br />
                            {this.state.cboFilterType.id == "4" ? (
                                <label className="mr-4 ml-4">To Depth </label>
                            ) : (
                                ""
                            )}

                            {this.state.cboFilterType.id == "4" ? (
                                <NumericTextBox
                                    name="txtToDepth"
                                    width={100}
                                    value={this.state.objFilterData.Filter_ToDepth}
                                    format="n2"
                                    onChange={(event) => {
                                        this.handleDataFilterChange(event, "Filter_ToDepth");

                                    }}

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


