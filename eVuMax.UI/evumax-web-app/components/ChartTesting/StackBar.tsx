import React, { Component } from "react";
import * as d3 from "d3";

import { Chart } from "../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../eVuMaxObjects/Chart/ChartData";
import { formatNumber, parseDate } from '@telerik/kendo-intl'
import {
    Axis,
    axisLabelStyle,
    axisPosition,
} from "../../eVuMaxObjects/Chart/Axis";
import DataSelector from "../Common/DataSelector";
import { Moment } from "moment";
import { DataSeries, dataSeriesType } from "../../eVuMaxObjects/Chart/DataSeries";
import { Guid } from "guid-typescript";
import "@progress/kendo-react-layout";
import { filterBy } from "@progress/kendo-data-query";
import ProcessLoader from "../loader/loader";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import axios from "axios";
import Moment_ from 'react-moment';
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
    RadioButton
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
    Button,
    Dialog,

} from "@progress/kendo-react-all";

import { axisBottom, gray, json } from "d3";
import moment from "moment";

// import './DrlgConnSummary.css';

import { ChartEventArgs } from "../../eVuMaxObjects/Chart/ChartEventArgs";

import GlobalMod from "../../objects/global";
import { util } from "typescript-collections";
let _gMod = new GlobalMod();

export default class StackBar extends Component {
    constructor(props: any) {
        super(props);

    }

    state = {

    };



    objSummaryData: any; //Stores Connection Summary Data


    //local variables
    _isLoading: boolean = false;
    objChartBar: Chart;


    componentDidMount() {
        try {
            //initialize chart
            this.objChartBar = new Chart(this, "ConnectionChartBar");
            this.objChartBar.ContainerId = "drlgConnections";

            this.objChartBar.leftAxis().AutoScale = true;
            this.objChartBar.leftAxis().Min = 0;
            this.objChartBar.leftAxis().Max = 100;
            this.objChartBar.leftAxis().Inverted = true;
            this.objChartBar.leftAxis().ShowLabels = true;
            this.objChartBar.leftAxis().ShowTitle = true;
            this.objChartBar.leftAxis().Title = "Time (min.)";
            this.objChartBar.leftAxis().DisplayOrder = 1;

            this.objChartBar.bottomAxis().AutoScale = true;
            this.objChartBar.bottomAxis().bandScale = true;
            this.objChartBar.bottomAxis().Min = 100;
            this.objChartBar.bottomAxis().Max = 200;
            this.objChartBar.bottomAxis().Title = "Depth (ft)";
            this.objChartBar.bottomAxis().ShowLabels = true;
            this.objChartBar.bottomAxis().ShowTitle = true;
            this.objChartBar.bottomAxis().LabelAngel = 90;
            this.objChartBar.bottomAxis().ShowSelector = true;
            this.objChartBar.bottomAxis().IsDateTime = false;

            this.objChartBar.MarginLeft = 10;
            this.objChartBar.MarginBottom = 40;
            this.objChartBar.MarginTop = 10;
            this.objChartBar.MarginRight = 10;

            this.objChartBar.initialize();
            this.objChartBar.reDraw();
            this.objChartBar.onBeforeSeriesDraw.subscribe((e, i) => { this.onBeforeDrawSeries(e, i); });


            this.plotChartRegular();

        } catch (error) { }
    }


    componentDidUpdate() {
        try {


            this.plotChartRegular();

        } catch (error) {

        }
    }

    getRandomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };


    handleSubmit = (dataItem: any) => alert(JSON.stringify(dataItem, null, 2));

    render() {
        return (
            <>
                {/* <Dialog> */}
                <div className="row">
                    <div>
                        <label className="summaryTitle">Stack Bar Testing</label>
                    </div>

                    <div id="loader" style={{ marginLeft: "20px", display: "none" }}>
                        <ProcessLoader />
                    </div>
                </div>
                <div id="drlgConnections" style={{ height: "calc(100vh - 550px)", width: "calc(100vw - 90px)", backgroundColor: "transparent" }}>           </div>

                <div id="drlgConnections_legend" style={{ textAlign: "center", height: "40px", width: "calc(100vw - 90px)", backgroundColor: "transparent", display: "inline-block" }}>


                </div>
                {/* </Dialog> */}
            </>
        );
    }




    //This method redraws the chart for regular view,
    plotChartRegular = () => {
        try {


            //Clear all the series

            this.objChartBar.DataSeries.clear();
            this.objChartBar.updateChart();

            //Configure Axes
            this.objChartBar.leftAxis().Inverted = true;
            this.objChartBar.leftAxis().AutoScale = true;

            this.objChartBar.leftAxis().Min = 0;
            this.objChartBar.leftAxis().Max = 150;
            this.objChartBar.leftAxis().Title = "Time (m)";
            this.objChartBar.leftAxis().ShowSelector = false;
            this.objChartBar.leftAxis().ShowTitle = true;
            this.objChartBar.leftAxis().Visible = true;

            this.objChartBar.bottomAxis().AutoScale = true;
            this.objChartBar.bottomAxis().Title = "Depth";
            this.objChartBar.bottomAxis().LabelAngel = 90;
            this.objChartBar.bottomAxis().ShowSelector = false;
            this.objChartBar.bottomAxis().ShowTitle = true;
            this.objChartBar.bottomAxis().Visible = true;



            //Add new serieses

            let objBTS = new DataSeries();
            objBTS.Id = "BTS";
            objBTS.Stacked = true;
            objBTS.Title = "Bottom To Slips";
            objBTS.Type = dataSeriesType.Bar;
            objBTS.Color = "#1089ff";
            objBTS.XAxisId = this.objChartBar.bottomAxis().Id;
            objBTS.YAxisId = this.objChartBar.leftAxis().Id;
            this.objChartBar.DataSeries.set(objBTS.Id, objBTS);

            let objSTS = new DataSeries();
            objSTS.Id = "STS";
            objSTS.Stacked = true;
            objSTS.Title = "Slips To Slips";
            objSTS.Type = dataSeriesType.Bar;
            objSTS.Color = "#ffc93c";
            objSTS.XAxisId = this.objChartBar.bottomAxis().Id;
            objSTS.YAxisId = this.objChartBar.leftAxis().Id;
            objSTS.ColorEach = true;
            this.objChartBar.DataSeries.set(objSTS.Id, objSTS);

            let objSTB = new DataSeries();
            objSTB.Id = "STB";
            objSTB.Stacked = true;
            objSTB.Title = "Slips To Bottom";
            objSTB.Type = dataSeriesType.Bar;
            objSTB.Color = "#ec0101";
            objSTB.XAxisId = this.objChartBar.bottomAxis().Id;
            objSTB.YAxisId = this.objChartBar.leftAxis().Id;
            this.objChartBar.DataSeries.set(objSTB.Id, objSTB);


            //clear dataSeries
            this.objChartBar.DataSeries.clear();
            for (let i = 0; i < 5; i++) {

                let objDataSeries = new DataSeries();
                objDataSeries.Id = "DataSeries-" + i;
                objDataSeries.Stacked = true;
                objDataSeries.Title = "TitleBar-" + i;

                objDataSeries.Color = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6); //"#ec0101";
                objDataSeries.XAxisId = this.objChartBar.bottomAxis().Id;
                objDataSeries.YAxisId = this.objChartBar.leftAxis().Id;

                objDataSeries.Type = dataSeriesType.Bar;


                this.objChartBar.DataSeries.set(objDataSeries.Id, objDataSeries);

            }



            //Fill up the data for data series with dataSeries inserted via loop


            for (let i = 0; i < 300; i++) {
                let objSeries = new DataSeries();
                let depth = Math.floor(Math.random() * 8000) + 5000; //returns a random integer between 500 and 8000
                for (let i = 0; i < this.objChartBar.DataSeries.size; i++) {
                    objSeries = this.objChartBar.DataSeries.get("DataSeries-" + i);
                    let objPoint = new ChartData();
                    objPoint.x = depth; //this.objSummaryData.connData[i]["x"];
                    objPoint.y = Math.floor(Math.random() * 100) + 1;
                    objSeries.Data.push(objPoint);
                }


            }
            this.objChartBar.reDraw();

            return;
            for (let i = 0; i < 50; i++) {
                let depth = Math.floor(Math.random() * 8000) + 5000; //returns a random integer between 500 and 8000
                console.log("Depth", depth);


                let objBTSPoint = new ChartData();
                objBTSPoint.x = depth; //this.objSummaryData.connData[i]["x"];
                objBTSPoint.y = Math.floor(Math.random() * 100) + 1; //returns a random integer between 500 and 8000 // this.objSummaryData.connData[i]["BOTTOM_TO_SLIPS"];
                objBTS.Data.push(objBTSPoint);


                let objSTSPoint = new ChartData();
                objSTSPoint.x = depth; //  this.objSummaryData.connData[i]["x"];
                objSTSPoint.y = Math.floor(Math.random() * 100) + 10; //returns a random integer between 500 and 8000 // this.objSummaryData.connData[i]["y"];
                objSTSPoint.color = "#bcbab8";
                objSTS.Data.push(objSTSPoint);


                let objSTBPoint = new ChartData();
                objSTBPoint.x = depth; // this.objSummaryData.connData[i]["DEPTH"];
                objSTBPoint.y = Math.floor(Math.random() * 100) + 10; //this.objSummaryData.connData[i]["SLIPS_TO_BOTTOM"];
                objSTB.Data.push(objSTBPoint);




            }

            this.objChartBar.reDraw();


        } catch (error) {

        }
    }

    plotChartCostView = () => {
        try {

            //Clear all the series

            this.objChartBar.DataSeries.clear();
            this.objChartBar.updateChart();

            //Configure Axes
            this.objChartBar.leftAxis().Inverted = true;
            this.objChartBar.leftAxis().AutoScale = true;
            this.objChartBar.leftAxis().Title = "Cost Diff";
            this.objChartBar.leftAxis().ShowSelector = false;

            this.objChartBar.bottomAxis().AutoScale = true;
            this.objChartBar.bottomAxis().Title = "Depth";
            this.objChartBar.bottomAxis().LabelAngel = 90;
            this.objChartBar.bottomAxis().ShowSelector = false;

            this.objChartBar.rightAxis().ShowLabels = false;
            this.objChartBar.rightAxis().ShowTitle = false;
            this.objChartBar.rightAxis().Visible = false;
            this.objChartBar.rightAxis().ShowLabels = false;
            this.objChartBar.rightAxis().ShowTitle = false;
            this.objChartBar.rightAxis().Title = "Cost";
            this.objChartBar.rightAxis().Inverted = true;

            //Add new serieses

            let objCost = new DataSeries();
            objCost.Id = "Cost";
            objCost.Stacked = true;
            objCost.Title = "Cost";
            objCost.Type = dataSeriesType.Bar;
            objCost.Color = "#1089ff";
            objCost.XAxisId = this.objChartBar.bottomAxis().Id;
            objCost.YAxisId = this.objChartBar.leftAxis().Id;
            objCost.ColorEach = true;
            this.objChartBar.DataSeries.set(objCost.Id, objCost);

            //Fill up the data for data series
            for (let i = 0; i < this.objSummaryData.connData.length; i++) {

                let objPoint = new ChartData();
                objPoint.x = this.objSummaryData.connData[i]["DEPTH"];
                objPoint.y = this.objSummaryData.connData[i]["DIFF"];


                if (objPoint.y >= 0) {
                    objPoint.color = "#79d70f";
                }
                else {
                    objPoint.color = "#d32626";
                }

                objCost.Data.push(objPoint);

            }

            this.objChartBar.reDraw();


        } catch (error) {

        }
    }

    //This method redraws the chart for rig state view,
    plotChartRigStateView = () => {
        try {


            //Clear all the series

            this.objChartBar.DataSeries.clear();
            this.objChartBar.updateChart();

            //Configure Axes
            this.objChartBar.leftAxis().Inverted = true;
            this.objChartBar.leftAxis().AutoScale = true;
            this.objChartBar.leftAxis().Title = "Time (m)";
            this.objChartBar.leftAxis().ShowSelector = false;

            this.objChartBar.bottomAxis().AutoScale = true;
            this.objChartBar.bottomAxis().Title = "Depth";
            this.objChartBar.bottomAxis().LabelAngel = 90;
            this.objChartBar.bottomAxis().ShowSelector = false;

            this.objChartBar.rightAxis().Visible = true;
            this.objChartBar.rightAxis().ShowLabels = true;
            this.objChartBar.rightAxis().ShowTitle = true;
            this.objChartBar.rightAxis().AutoScale = true;
            this.objChartBar.rightAxis().Title = "Cost";
            this.objChartBar.rightAxis().Inverted = true;


            //COLOR: "#808080"
            //RIG_STATE: 2
            //RIG_STATE_NAME: "In Slips"

            //load temp data to rig state for testing
            // for (let i = 30; i < 30 + 20; i++) {
            //   this.objSummaryData.rigStateData.push({ "COLOR:": "red", "RIG_STATE": i, "RIG_STATE_NAME": "rigState-" + i.toString() });
            // }
            //Create series for each rig state
            for (let i = 0; i < this.objSummaryData.rigStates.length; i++) {

                let objSeries = new DataSeries();
                objSeries.Id = this.objSummaryData.rigStates[i]["RIG_STATE"].toString();
                objSeries.Stacked = true;
                objSeries.Title = this.objSummaryData.rigStates[i]["RIG_STATE_NAME"].toString();
                objSeries.Type = dataSeriesType.Bar;
                objSeries.Color = this.objSummaryData.rigStates[i]["COLOR"].toString();
                objSeries.XAxisId = this.objChartBar.bottomAxis().Id;
                objSeries.YAxisId = this.objChartBar.leftAxis().Id;
                this.objChartBar.DataSeries.set(objSeries.Id, objSeries);

            }


            //Fill up the data for each series- Nishant Testing
            //Fill Dummy data for testing
            //DEPTH: 7784
            //TIMES: "2.5,0.83,0,1.33,0,0,0,14.33,2,1.83,2.83,0.17"
            for (let i = 0; i < 250; i++) {
                this.objSummaryData.rigStateData.push({ "DEPTH": Math.floor(Math.random() * 100) + 999, "TIMES": Math.floor(Math.random() * 5) + 1.5 + ",0.83,0,1.33,0,0,0,14.33,2,1.83,2.83,0.17" })
            }

            //************** */

            for (let i = 0; i < this.objSummaryData.rigStateData.length; i++) {

                console.log("i", i);
                let arrRigStates: string[] = this.objSummaryData.rigStateData[i]["TIMES"].toString().split(',');
                // //tesing data
                // let objSeries: DataSeries = this.objChartBar.DataSeries.get(Math.floor(Math.random() * 100) +  this.objSummaryData.rigStates.length.toString());
                // let objDataPoint = new ChartData();
                // objDataPoint.x = this.objSummaryData.rigStateData[i]["DEPTH"];
                // objDataPoint.y =Math.floor(Math.random() * 100) + 500 ;// Number.parseFloat(arrRigStates[j]);
                // objSeries.Data.push(objDataPoint);

                for (let j = 0; j < this.objSummaryData.rigStates.length; j++) {

                    let lnRigState: number = this.objSummaryData.rigStates[j]["RIG_STATE"];

                    //Find the series with this rig state
                    let objSeries: DataSeries = this.objChartBar.DataSeries.get(lnRigState.toString());

                    // if (objSeries != undefined) {
                    //   let objDataPoint = new ChartData();
                    //   objDataPoint.x = this.objSummaryData.rigStateData[i]["DEPTH"];
                    //   objDataPoint.y = Number.parseFloat(arrRigStates[j]);
                    //   objSeries.Data.push(objDataPoint);
                    // }
                    let objDataPoint = new ChartData();
                    objDataPoint.x = this.objSummaryData.rigStateData[i]["DEPTH"];
                    objDataPoint.y = Number.parseFloat(arrRigStates[j]);
                    objSeries.Data.push(objDataPoint);
                }
            }

            let objCost = new DataSeries();
            objCost.Id = "Cost";
            objCost.Title = "Cost";
            objCost.Type = dataSeriesType.Line;
            objCost.Color = "#ce2e6c";
            objCost.XAxisId = this.objChartBar.bottomAxis().Id;
            objCost.YAxisId = this.objChartBar.rightAxis().Id;
            objCost.LineWidth = 3;
            this.objChartBar.DataSeries.set(objCost.Id, objCost);


            let objSTSCost = new DataSeries();
            objSTSCost.Id = "STSCost";
            objSTSCost.Title = "STS Cost";
            objSTSCost.Type = dataSeriesType.Line;
            objSTSCost.Color = "#f58b54";
            objSTSCost.XAxisId = this.objChartBar.bottomAxis().Id;
            objSTSCost.YAxisId = this.objChartBar.rightAxis().Id;
            objSTSCost.LineWidth = 3;
            this.objChartBar.DataSeries.set(objSTSCost.Id, objSTSCost);

            //Fill up the data for data series
            for (let i = 0; i < this.objSummaryData.connData.length; i++) {

                let objCostPoint = new ChartData();
                objCostPoint.x = this.objSummaryData.connData[i]["DEPTH"];
                objCostPoint.y = this.objSummaryData.connData[i]["COST"];
                objCost.Data.push(objCostPoint);

                let objCost2Point = new ChartData();
                objCost2Point.x = this.objSummaryData.connData[i]["DEPTH"];
                objCost2Point.y = this.objSummaryData.connData[i]["STS_COST"];
                objSTSCost.Data.push(objCost2Point);


            }

            this.objChartBar.reDraw();


        } catch (error) {

        }
    }


    plotChartHistogram = () => {
        try {

            //Clear all the series

            this.objChartBar.DataSeries.clear();
            this.objChartBar.updateChart();

            //Configure Axes
            this.objChartBar.leftAxis().Inverted = true;
            this.objChartBar.leftAxis().AutoScale = true;
            this.objChartBar.leftAxis().Title = "Time (m)";
            this.objChartBar.leftAxis().ShowSelector = false;

            this.objChartBar.bottomAxis().AutoScale = true;
            this.objChartBar.bottomAxis().Title = "No. of Connections";
            this.objChartBar.bottomAxis().LabelAngel = 90;
            this.objChartBar.bottomAxis().ShowSelector = false;

            this.objChartBar.rightAxis().ShowLabels = false;
            this.objChartBar.rightAxis().ShowTitle = false;
            this.objChartBar.rightAxis().Visible = false;
            this.objChartBar.rightAxis().Title = "Cost";
            this.objChartBar.rightAxis().Inverted = true;

            //Add new serieses

            let objHistogram = new DataSeries();
            objHistogram.ShowLabelOnSeries = true;
            objHistogram.Id = "Histogram";
            objHistogram.Stacked = true;
            objHistogram.Title = "Connection Histogram";
            objHistogram.Type = dataSeriesType.Bar;
            objHistogram.Color = "#cf7500";
            objHistogram.XAxisId = this.objChartBar.bottomAxis().Id;
            objHistogram.YAxisId = this.objChartBar.leftAxis().Id;
            this.objChartBar.DataSeries.set(objHistogram.Id, objHistogram);

            //Fill up the data for data series
            for (let i = 0; i < this.objSummaryData.histogramData.length; i++) {

                let objPoint = new ChartData();
                objPoint.x = this.objSummaryData.histogramData[i]["X"];
                objPoint.y = this.objSummaryData.histogramData[i]["Y"];

                objHistogram.Data.push(objPoint);

            }

            this.objChartBar.reDraw();


        } catch (error) {

        }
    }


    onBeforeDrawSeries = (e: ChartEventArgs, i: number) => {
        try {

            d3.select(".drlg_benchmark").remove();
            d3.select(".trip_highlight").remove();

            // if (this.state.CurrentView == 0 || this.state.CurrentView == 1) {


            //     let lnBenchMark = this.objUserSettings.DrlgBenchMark;

            //     if (lnBenchMark > 0) {



            //         let x1 = this.objChartBar.__chartRect.left;
            //         let x2 = this.objChartBar.__chartRect.right;
            //         let y1 = this.objChartBar.leftAxis().ScaleRef(lnBenchMark);
            //         let y2 = y1 + 4;


            //         this.objChartBar.SVGRef
            //             .append('g')
            //             .attr('class', 'drlg_benchmark')
            //             .append('rect')
            //             .attr('id', 'drlg_benchmark')
            //             .attr('x', x1)
            //             .attr('y', y1)
            //             .attr('width', (x2 - x1))
            //             .attr('height', (y2 - y1))
            //             .style('fill', 'red')
            //             .style('opacity', 0.5);
            //     }





            // }

        } catch (error) {

        }
    }

}

// export default StackBar;
