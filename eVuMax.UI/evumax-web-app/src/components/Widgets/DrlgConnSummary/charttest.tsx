import React, { Component, useState, useEffect } from "react";
import * as d3 from "d3";
import $ from "jquery";
import { Chart, lineStyle } from "../../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import { Axis, axisLabelStyle, axisPosition } from "../../../eVuMaxObjects/Chart/Axis";
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
} from "@progress/kendo-react-all";
import { axisBottom, gray } from "d3";
import moment from "moment";
import { ChartMouseEvtArgs } from '../../../eVuMaxObjects/Chart/chartMouseEvtArgs';
import { ChartEventArgs } from '../../../eVuMaxObjects/Chart/ChartEventArgs';

class charttest extends Component {
    constructor(props: any) {
        super(props);
    }

    objChart: Chart;
    objBarSeries: DataSeries;
    objBarSeries2: DataSeries;
    btsStart: number = 10;
    btsEnd: number = 30;
    stsStart: number = 30;
    stsEnd: number = 50;
    stbStart: number = 50;
    stbEnd: number = 70;

    edgeDragging: boolean = false;
    draggingEdgeId: string = "";

    componentDidMount() {
        try {

            //initialize chart
            this.objChart = new Chart(this,"ConnectionChart");
            this.objChart.ContainerId = "container";

            this.objChart.MarginLeft = 0;
            this.objChart.MarginBottom = 0;

            this.objChart.axisPerColumn = 3;

            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().Min = -10;
            this.objChart.leftAxis().Max = 100;
            this.objChart.leftAxis().Title = "Minutes";
            this.objChart.leftAxis().GridVisible = true;
            this.objChart.leftAxis().Inverted = true;

            // let newaxis=new Axis();
            // newaxis.Id="axis2";
            // newaxis.Title="New Axis";
            // newaxis.AutoScale=false;
            // newaxis.Min=0;
            // newaxis.Max=200;
            // newaxis.Position=axisPosition.left;

            // this.objChart.Axes.set(newaxis.Id,newaxis);

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().bandScale = true;
            this.objChart.bottomAxis().Min = 0;
            this.objChart.bottomAxis().Max = 100;
            this.objChart.bottomAxis().Title = "Depth (ft)";
            this.objChart.bottomAxis().ShowLabels = true;
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowTitle = true;


            this.objBarSeries = new DataSeries();
            this.objBarSeries.Type = dataSeriesType.Bar;
            this.objBarSeries.Id = "bar1";
            this.objBarSeries.Color = "red";
            this.objBarSeries.Stacked = true;
            this.objBarSeries.XAxisId = "bottom";
            this.objBarSeries.YAxisId = "left";
            this.objBarSeries.Name = "Connection Time";
            this.objBarSeries.Title = "Connection Time";
            this.objBarSeries.LineWidth = 2;

            this.objChart.DataSeries.set(this.objBarSeries.Id, this.objBarSeries);


            this.objBarSeries2 = new DataSeries();
            this.objBarSeries2.Type = dataSeriesType.Bar;
            this.objBarSeries2.Id = "bar2";
            this.objBarSeries2.Color = "cyan";
            this.objBarSeries2.Stacked = true;
            this.objBarSeries2.XAxisId = "bottom";
            this.objBarSeries2.YAxisId = "left";
            this.objBarSeries2.Name = "STS Time";
            this.objBarSeries2.Title = "STS Time";
            this.objBarSeries2.LineWidth = 2;

            this.objChart.DataSeries.set(this.objBarSeries2.Id, this.objBarSeries2);

            //clear existing data
            this.objBarSeries.Data.splice(0, this.objBarSeries.Data.length);
            this.objBarSeries2.Data.splice(0, this.objBarSeries2.Data.length);


            this.objChart.onBeforeSeriesDraw.subscribe(() => {
                this.beforeDrawAxis();
            });

            this.objChart.onMouseMove.subscribe((e, i) => {

                this.chartMouseMove(e, i);

            });

            this.objChart.onMouseDown.subscribe((e, i) => {

                this.chartMouseDown(e, i);

            });

            this.objChart.onMouseUp.subscribe((e, i) => {

                this.chartMouseUp(e, i);

            });

            for (let i = 0; i < 100; i++) {

                let objChartData = new ChartData();
                objChartData.x = i + 1;
                objChartData.y = this.getRandomNumber(1, 100);

                this.objBarSeries.Data.push(objChartData);

            }


            for (let i = 0; i < 100; i++) {

                let objChartData = new ChartData();
                objChartData.x = i + 1;
                objChartData.y = this.getRandomNumber(1, 100);

                this.objBarSeries2.Data.push(objChartData);

            }



            this.objChart.initialize();
            this.objChart.updateChart();


        } catch (error) {

        }

    }

    componentWillUpdate() {

    }



    chartMouseMove = (e, i) => {
        try {

            if (!this.edgeDragging) {

                let isOnEdge = false;

                //Check if mouse cursor is over any edge
                if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.btsStart) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.btsStart) + 2)) {
                    isOnEdge = true;
                }

                if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.btsEnd) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.btsEnd) + 2)) {
                    isOnEdge = true;
                }

                if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.stsStart) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.stsStart) + 2)) {
                    isOnEdge = true;
                }

                if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.stsEnd) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.stsEnd) + 2)) {
                    isOnEdge = true;
                }

                if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.stbStart) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.stbStart) + 2)) {
                    isOnEdge = true;
                }

                if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.stbEnd) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.stbEnd) + 2)) {
                    isOnEdge = true;
                }

                if (isOnEdge) {
                    $("#" + this.objChart.ContainerId).css("cursor", "ew-resize");
                }
                else {
                    $("#" + this.objChart.ContainerId).css("cursor", "default");
                }
            }

            if (this.edgeDragging) {

                if (this.draggingEdgeId = "bs-start") {

                    let newVal = 0;

                    if (this.objChart.bottomAxis().bandScale) {
                        let range = (this.objChart.bottomAxis().Max - this.objChart.bottomAxis().Min);
                        let scale = this.objChart.bottomAxis().__axisSize / range;

                        newVal = (e.x - this.objChart.bottomAxis().StartPos) / scale;
                        newVal = Math.round(newVal);
                    }
                    else {
                        newVal = this.objChart.bottomAxis().ScaleRef.invert(e.x);
                    }

                    this.btsStart = newVal;

                    //create bts rect
                    let x1 = this.objChart.bottomAxis().ScaleRef(this.btsStart);
                    let x2 = this.objChart.bottomAxis().ScaleRef(this.btsEnd);
                    let y1 = this.objChart.__chartRect.top;
                    let y2 = this.objChart.__chartRect.bottom;

                    $("#status").html("width " + (x2 - x1) + " newval " + newVal + " bts end " + this.btsEnd);


                    $('.bts_rect').attr('x', x1);
                    $('.bts_rect').attr('y', y1);
                    $('.bts_rect').attr('width', (x2 - x1));
                    $('.bts_rect').attr('height', (y2 - y1));

                    $('#bts_rect').attr('x', x1);
                    $('#bts_rect').attr('y', y1);
                    $('#bts_rect').attr('width', (x2 - x1));
                    $('#bts_rect').attr('height', (y2 - y1));


                }

            }


        } catch (error) {

            $("#status").html(error);

            let halt = true;
        }
    }

    chartMouseDown = (e, i) => {
        try {

            let isOnEdge = false;

            //Check if mouse cursor is over any edge
            if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.btsStart) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.btsStart) + 2)) {
                isOnEdge = true;
                this.draggingEdgeId = "bs-start";
            }

            if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.btsEnd) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.btsEnd) + 2)) {
                isOnEdge = true;
                this.draggingEdgeId = "bs-end";
            }

            if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.stsStart) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.stsStart) + 2)) {
                isOnEdge = true;
                this.draggingEdgeId = "bs-end";
            }

            if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.stsEnd) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.stsEnd) + 2)) {
                isOnEdge = true;
                this.draggingEdgeId = "ss-end";
            }

            if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.stbStart) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.stbStart) + 2)) {
                isOnEdge = true;
                this.draggingEdgeId = "ss-end";
            }

            if (e.x >= (this.objChart.bottomAxis().ScaleRef(this.stbEnd) - 2) && e.x <= (this.objChart.bottomAxis().ScaleRef(this.stbEnd) + 2)) {
                isOnEdge = true;
                this.draggingEdgeId = "sb-end";
            }

            if (isOnEdge) {
                $("#" + this.objChart.ContainerId).css("cursor", "ew-resize");
                this.edgeDragging = true;
            }
            else {
                $("#" + this.objChart.ContainerId).css("cursor", "default");
            }


        } catch (error) {

        }

    }

    chartMouseUp = (e, i) => {
        try {


            debugger
            if (this.edgeDragging) {

                this.edgeDragging = false;
                $("#" + this.objChart.ContainerId).css("cursor", "default");

            }

        } catch (error) {

        }
    }

    beforeDrawAxis = () => {

        try {



            d3.select(".bts_rect").remove();
            d3.select(".sts_rect").remove();
            d3.select(".stb_rect").remove();

            //create bts rect
            let x1 = this.objChart.bottomAxis().ScaleRef(this.btsStart);
            let x2 = this.objChart.bottomAxis().ScaleRef(this.btsEnd);
            let y1 = this.objChart.__chartRect.top;
            let y2 = this.objChart.__chartRect.bottom;


            this.objChart.SVGRef
                .append('g')
                .attr('class', 'bts_rect')
                .append('rect')
                .attr('id', 'bts_rect')
                .attr('x', x1)
                .attr('y', y1)
                .attr('width', (x2 - x1))
                .attr('height', (y2 - y1))
                .style('fill', 'yellow')
                .style('opacity', 0.2);

            //create sts rect
            x1 = this.objChart.bottomAxis().ScaleRef(this.stsStart);
            x2 = this.objChart.bottomAxis().ScaleRef(this.stsEnd);
            y1 = this.objChart.__chartRect.top;
            y2 = this.objChart.__chartRect.bottom;


            this.objChart.SVGRef
                .append('g')
                .attr('class', 'sts_rect')
                .append('rect')
                .attr('id', 'sts_rect')
                .attr('x', x1)
                .attr('y', y1)
                .attr('width', (x2 - x1))
                .attr('height', (y2 - y1))
                .style('fill', 'gray')
                .style('opacity', 0.2);

            //create stb rect
            x1 = this.objChart.bottomAxis().ScaleRef(this.stbStart);
            x2 = this.objChart.bottomAxis().ScaleRef(this.stbEnd);
            y1 = this.objChart.__chartRect.top;
            y2 = this.objChart.__chartRect.bottom;


            this.objChart.SVGRef
                .append('g')
                .attr('class', 'stb_rect')
                .append('rect')
                .attr('id', 'stb_rect')
                .attr('x', x1)
                .attr('y', y1)
                .attr('width', (x2 - x1))
                .attr('height', (y2 - y1))
                .style('fill', 'green')
                .style('opacity', 0.2);




        } catch (error) {

        }

    }

    render() {

        return (

            <div style={{ height: "calc(100vh - 150px)", width: "100%" }}>

                <label id='status'>status</label>

                <div id="container" style={{ height: "100%", width: "100%" }}>

                </div>
            </div>

        );

    }


    getRandomNumber = (min: number, max: number) => {

        return Math.floor(Math.random() * (max - min + 1) + min);

    }


}

export default charttest;

