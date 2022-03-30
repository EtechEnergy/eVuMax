import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faFilter, faUndo } from "@fortawesome/free-solid-svg-icons";
import { Grid, GridColumn, GridRow } from "@progress/kendo-react-grid";
import React, { Component } from "react";
import { Button, DateTimePicker, Dialog, DropDownList, filterBy, Label, Splitter, SplitterOnChangeEvent, TabStrip, TabStripTab } from "@progress/kendo-react-all";
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

let profileList: any[] = [];
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
        ProfileName: ""
    };

    filterByComboList = [new comboData("Last Hours", "1"), new comboData("Date Range", "2"), new comboData("From Date Onwards", "3"), new comboData("Depth Range", "4"),
    new comboData("From Depth Onwards", "5"), new comboData("Current Section", "6")];


    intervalID: NodeJS.Timeout | undefined;
    AxiosSource = axios.CancelToken.source();
    AxiosConfig = { cancelToken: this.AxiosSource.token };
    objChart: Chart;
    objData: any = "";
    phaseTagList: any = [];
    objProfile: any = "";

    objAxisList: any = [];
    topAxisCount: number = 0;
    objSeries: DataSeries;
    objDataSeries: any;
    doHighlightTags: boolean = true;


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
                            // debugger;
                            // if(x1==undefined){
                            //     x1 = cX2; //Right Edge of Chart
                            // }

                            debugger;


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
                    cboWellList: wellComboList,
                    ProfileName: this.objData.objProfile.ProfileName
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
                            objBottomAxes.bandScale= true;



                            this.objSeries.Stacked = false;
                            this.objSeries.Color = "rgb( " + objDataSeries.SeriesColor + ")";//Dont change position of this line
                            this.objSeries.ShowLabelOnSeries = true; //Parth 05-10-2020
                            //    this.getSingleSeriesData(); //WIP
                            break;

                        default:
                            break;
                    }


                    //prath
                    debugger;
                    if ((this.objData.objProfile.DataGroup = 1) && this.objData.objProfile.TimeUnit == 3) {
                        this.getGroupSeriesData();
                    } else {
                        this.getSingleSeriesData(); //WIP
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

                if (objVal.x > 11) {
                    continue;
                }
                objVal.x = eval(Number(SeriesXData[i]).toFixed(4));
                objVal.y = eval(Number(SeriesYData[i]).toFixed(2));

                if (objVal.x >= 13 && objVal.x <= 20) {
                    console.log(this.objSeries.Title + " - " + objVal.x + " - " + objVal.y);

                }
                this.objSeries.Data.push(objVal);
            }
            this.objChart.DataSeries.set(this.objSeries.Id, this.objSeries);


        } catch (error) {

        }
    }

    // getLineSeriesData = () => {
    //     try {
    //         let SeriesData: any = Object.values(this.objDataSeries.outputData);
    //         debugger;

    //         //prath 04-Feb-2022 (To handle autoscale false case - No need to fill all data to series to avoid overlape charts)
    //         let xMin = 0;
    //         let xMax = 0;
    //         let yMin = 0;
    //         let yMax = 0;
    //         let autoScaleX: boolean = false;
    //         let autoScaleY: boolean = false;
    //         if (this.objChart.Axes.get(this.objSeries.XAxisId).AutoScale == false) {
    //             xMin = this.objChart.Axes.get(this.objSeries.XAxisId).Min;
    //             xMax = this.objChart.Axes.get(this.objSeries.XAxisId).Max;
    //             autoScaleX = false;
    //         }
    //         if (this.objChart.Axes.get(this.objSeries.YAxisId).AutoScale == false) {
    //             yMin = this.objChart.Axes.get(this.objSeries.YAxisId).Min;
    //             yMax = this.objChart.Axes.get(this.objSeries.YAxisId).Max;
    //             autoScaleY = false;
    //         }
    //         //==========================================
    //         for (let i = 0; i < SeriesData.length; i++) {
    //             this.objSeries.Name = SeriesData[i].LegendTitle;

    //             let objVal: ChartData = new ChartData();

    //             let objBottomAxes: Axis = new Axis();

    //             objBottomAxes = this.objChart.getAxisByID(this.objSeries.XAxisId);
    //             //objBottomAxes.bandScale= true;

    //             objVal.x = Number(SeriesData[i].XValue);


    //             objVal.y = Number(SeriesData[i].YValue);
    //             objBottomAxes.Labels.push(SeriesData[i].XLabel);
    //             this.objSeries.Data.push(objVal);

    //         }


    //     } catch (error) {

    //     }
    // }

    getSingleSeriesData = () => {
        try {
            //alert("yy");
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


                    let objDataReeceive = JSON.parse(res.data.Response);
                    this.objData = objDataReeceive.objProcessor;
                    this.objProfile = objDataReeceive.objProfile;
                    this.phaseTagList = objDataReeceive.phaseTagList;

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
        if (this.state.runReport == false) {
            return;
        }
        this.setState({
            panes: event.newState,
            warningMsg: []
        });
    };


    handleChangeDropDown = (event: any) => {


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

    filterData = (e: any) => {
        // NOTES: ""
        // PROFILE_ID: "966_396_416_314_772"
        // PROFILE_NAME: ""

        let value = e.target.value;
        let filter: any = {
            logic: "or",
            filters: [
                { field: "NOTES", operator: "contains", value: value },
                { field: "PROFILE_NAME", operator: "contains", value: value },

            ],
        };
        console.log("Search ", filterBy(profileList, filter, null));

        // this.setState({
        //     grdProfile: filterBy(profileList, filter, null)
        // });
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

                        <Button
                            className="ml-5 mr-3"
                            id="cmdRefresh"
                            onClick={() => {
                                this.plotChart();
                            }}
                        >
                            Refresh
                        </Button>

                        <Label>{this.state.ProfileName}</Label>
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
                                    this.handleChange(event, "showCrossHair");

                                }}
                            />
                            <div className="mr-5">
                                <FontAwesomeIcon
                                    icon={faUndo}
                                    size="lg"
                                    onClick={() => {
                                        this.objChart.reDraw();
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


