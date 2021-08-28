import React, { Component } from "react";
import axios from "axios";
import { Chart } from "../../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import {
  DataSeries,
  dataSeriesType,
  pointStyle,
} from "../../../eVuMaxObjects/Chart/DataSeries";
import DataSelector from "../../Common/DataSelector";
import ProcessLoader from "../../loader/loader";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import "./ROPSummaryPlot.css";

import * as utilFunc from "../../../utilFunctions/utilFunctions";
import GlobalMod from "../../../objects/global";
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo } from "@fortawesome/free-solid-svg-icons";

import $ from "jquery";
import { Util } from "../../../Models/eVuMax";
let _gMod = new GlobalMod();

export class ROPSummaryPlot extends Component {
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;
  }
  state = {
    selected: 0,
    //selectionType: "-1",
    objROPSummaryData: {} as any,
    tripOutsString: "",
    tripOutsOffsetString: "",
    isProcess: false,
  };

  tripOutsString: string = "";
  tripOutsOffsetString: string = "";
  WellId: string = "";
  objChart_Pie: Chart;
  objChart_PieOffset: Chart;
  objChart_Rotary: Chart;
  objChart_Slide: Chart;
  objChart_Combine: Chart;

  selectionType: string = "-1"; //"-1 Default, 0= DateRange and 1 = Depth Range"
  fromDate: Date = null;
  toDate: Date = null;
  fromDepth: number = 0;
  toDepth: number = 0;
  Warnings: string = ""; //Nishant 27/08/2021

  componentDidMount() {
    try {
      //initialize chart
      this.initilizeCharts();

      this.loadConnections();
      window.addEventListener("resize", this.refreshChart);
    } catch (error) { }
  }

  // componentWillUnmount() {
  //   window.removeEventListener("resize", this.refreshChart);
  // }

  componentDidUpdate() {
    try {
      //alert('comp did update');
      this.refreshChart();
    } catch (error) { }
  }

  initilizeCharts = () => {
    this.objChart_Pie = new Chart(this, "CurrentChart", true);
    this.objChart_Pie.ContainerId = "CurrentPie_Chart";

    //initialize chart Pie Chart

    this.objChart_Pie.MarginLeft = 0;
    this.objChart_Pie.MarginBottom = 0;
    this.objChart_Pie.MarginTop = 0;
    this.objChart_Pie.MarginRight = 0;

    this.objChart_Pie.initialize();
    this.objChart_Pie.reDraw();

    // Offset Pie
    this.objChart_PieOffset = new Chart(this, "OffsetChart", true);
    this.objChart_PieOffset.ContainerId = "OffsetPie_Chart";

    //initialize chart Pie Chart

    this.objChart_PieOffset.MarginLeft = 0;
    this.objChart_PieOffset.MarginBottom = 0;
    this.objChart_PieOffset.MarginTop = 0;
    this.objChart_PieOffset.MarginRight = 0;

    this.objChart_PieOffset.initialize();
    this.objChart_PieOffset.reDraw();
    // ============ Point Rotary Chart

    this.objChart_Rotary = new Chart(this, "RotaryPoint_Chart");
    this.objChart_Rotary.ContainerId = "rotarypointchart";

    this.objChart_Rotary.leftAxis().AutoScale = true;

    this.objChart_Rotary.leftAxis().Inverted = false;
    this.objChart_Rotary.leftAxis().ShowLabels = true;
    this.objChart_Rotary.leftAxis().ShowTitle = false;
    this.objChart_Rotary.leftAxis().Title = "ROP";
    this.objChart_Rotary.leftAxis().Visible = true;

    this.objChart_Rotary.bottomAxis().AutoScale = true;
    this.objChart_Rotary.bottomAxis().IsDateTime = false;
    this.objChart_Rotary.bottomAxis().Visible = true;

    this.objChart_Rotary.bottomAxis().Title = "Depth / Date Time";
    this.objChart_Rotary.bottomAxis().ShowLabels = true;
    this.objChart_Rotary.bottomAxis().ShowTitle = false;
    this.objChart_Rotary.bottomAxis().LabelAngel = 90;
    this.objChart_Rotary.bottomAxis().ShowSelector = false;

    this.objChart_Rotary.rightAxis().Visible = false;
    this.objChart_Rotary.rightAxis().ShowLabels = false;

    this.objChart_Rotary.MarginLeft = 10;
    this.objChart_Rotary.MarginBottom = 10;
    this.objChart_Rotary.MarginTop = 10;
    this.objChart_Rotary.MarginRight = 10;

    this.objChart_Rotary.initialize();
    this.objChart_Rotary.reDraw();

    // ============ Point Slide Chart

    this.objChart_Slide = new Chart(this, "SlidePoint_Chart");
    this.objChart_Slide.ContainerId = "slidepointchart";

    this.objChart_Slide.leftAxis().AutoScale = true;

    this.objChart_Slide.leftAxis().Inverted = false;
    this.objChart_Slide.leftAxis().ShowLabels = true;
    this.objChart_Slide.leftAxis().ShowTitle = false;
    this.objChart_Slide.leftAxis().Title = "ROP";
    this.objChart_Slide.leftAxis().Visible = true;

    this.objChart_Slide.bottomAxis().AutoScale = true;
    this.objChart_Slide.bottomAxis().IsDateTime = false;

    this.objChart_Slide.bottomAxis().Title = "Depth / Date Time";
    this.objChart_Slide.bottomAxis().ShowLabels = true;
    this.objChart_Slide.bottomAxis().ShowTitle = false;
    this.objChart_Slide.bottomAxis().LabelAngel = 90;
    this.objChart_Slide.bottomAxis().ShowSelector = false;
    this.objChart_Slide.bottomAxis().Visible = true;

    this.objChart_Slide.rightAxis().Visible = false;
    this.objChart_Slide.rightAxis().ShowLabels = false;

    this.objChart_Slide.MarginLeft = 70;
    this.objChart_Slide.MarginBottom = 10;
    this.objChart_Slide.MarginTop = 10;
    this.objChart_Slide.MarginRight = 10;

    this.objChart_Slide.initialize();
    this.objChart_Slide.reDraw();

    // ============ Point Combine Chart

    this.objChart_Combine = new Chart(this, "CombinePoint_Chart");
    this.objChart_Combine.ContainerId = "combinepointchart";

    this.objChart_Combine.leftAxis().AutoScale = true;

    this.objChart_Combine.leftAxis().Inverted = false;
    this.objChart_Combine.leftAxis().ShowLabels = true;
    this.objChart_Combine.leftAxis().ShowTitle = false;
    this.objChart_Combine.leftAxis().Title = "ROP";
    this.objChart_Combine.leftAxis().Visible = true;

    this.objChart_Combine.bottomAxis().AutoScale = true;
    this.objChart_Combine.bottomAxis().IsDateTime = false;
    this.objChart_Combine.bottomAxis().bandScale = false; //wip
    this.objChart_Combine.bottomAxis().Title = "Depth / Date Time";
    this.objChart_Combine.bottomAxis().ShowLabels = true;
    this.objChart_Combine.bottomAxis().ShowTitle = false;
    this.objChart_Combine.bottomAxis().LabelAngel = 90;
    this.objChart_Combine.bottomAxis().ShowSelector = false;
    this.objChart_Combine.bottomAxis().Visible = true;

    this.objChart_Combine.rightAxis().Visible = false;
    this.objChart_Combine.rightAxis().ShowLabels = false;

    this.objChart_Combine.MarginLeft = 10;
    this.objChart_Combine.MarginBottom = 0;
    this.objChart_Combine.MarginTop = 0;
    this.objChart_Combine.MarginRight = 10;

    this.objChart_Combine.initialize();
    this.objChart_Combine.reDraw();
  };

  //Nishant
  getRigStateColor = (number) => {
    //alert(this.state.objROPSummaryData.RigStates);
    if (this.state.objROPSummaryData.RigStates != undefined) {
      let index = this.state.objROPSummaryData.RigStates.findIndex(
        (e) => e.RIG_STATE_NUMBER === number
      );
      if (index > -1) {
        return this.state.objROPSummaryData.RigStates[index].HEX_COLOR;
      } else {
        return "#000000";
      }
    }
  };

  refreshChart = () => {
    try {
      this.refreshPieChart();
      this.refreshOffsetPieChart();
      this.refreshRotaryChart();
      this.refreshSlideChart();
      this.refreshCombineChart();
    } catch (error) { }
  };
  refreshPieChart = () => {
    try {
      this.objChart_Pie.initialize();

      //Clear all the series
      this.objChart_Pie.DataSeries.clear();

      this.objChart_Pie.updateChart();

      //Add new serieses

      let objPieSeries = new DataSeries();
      objPieSeries.Id = "Rotary";
      //objPieSeries.Stacked = false;
      objPieSeries.Title = "Current";
      objPieSeries.Type = dataSeriesType.Pie;
      objPieSeries.PieRadius = 60.0; //set Size of Pie circle;

      this.objChart_Pie.DataSeries.set(objPieSeries.Id, objPieSeries);

      //Fill up the data for data series
      let objPieData = new ChartData();
      objPieData.y = eval(
        Number(this.state.objROPSummaryData.RotaryPercent).toFixed(2)
      ); // eval(  this.state.objROPSummaryData.RotaryPercent);
      objPieData.label = "Rotary: " + objPieData.y + "%";
      objPieData.color = "blue"; //this.getRigStateColor(0);
      objPieSeries.Data.push(objPieData);

      //Fill up the data for data series
      objPieData = new ChartData();
      objPieData.y = eval(this.state.objROPSummaryData.SlidePercent);
      objPieData.label = "SlideTime: " + objPieData.y + "%";

      objPieData.color = "orange"; // this.getRigStateColor(1);
      objPieSeries.Data.push(objPieData);

      this.objChart_Pie.reDraw();
    } catch (error) { }
  };
  refreshOffsetPieChart = () => {
    try {
      this.objChart_PieOffset.initialize();

      //Clear all the series
      this.objChart_PieOffset.DataSeries.clear();

      this.objChart_PieOffset.updateChart();

      //Add new serieses

      let objPieSeries = new DataSeries();
      objPieSeries.Id = "RotaryOffset";
      //objPieSeries.Stacked = false;
      objPieSeries.Title = "Offset";
      objPieSeries.Type = dataSeriesType.Pie;

      this.objChart_PieOffset.DataSeries.set(objPieSeries.Id, objPieSeries);

      //Fill up the data for data series
      let objPieData = new ChartData();
      objPieData.y = eval(
        Number(this.state.objROPSummaryData.OffsetRotaryPercent).toFixed(2)
      );
      objPieData.label = "Rotary: " + objPieData.y + "%";
      objPieData.color = "blue"; //this.getRigStateColor(0);
      objPieSeries.PieRadius = 60.0; //set Size of Pie circle;

      objPieSeries.Data.push(objPieData);

      //Fill up the data for data series
      objPieData = new ChartData();
      objPieData.y = eval(this.state.objROPSummaryData.OffsetSlidePercent);
      objPieData.label = "SlideTime: " + objPieData.y + "%";

      objPieData.color = "orange"; // this.getRigStateColor(1);
      objPieSeries.Data.push(objPieData);

      this.objChart_PieOffset.reDraw();
    } catch (error) { }
  };
  refreshRotaryChart = () => {
    try {
      this.objChart_Rotary.initialize();
      this.objChart_Rotary.DataSeries.clear();
      this.objChart_Rotary.updateChart();
      this.objChart_Rotary.Title = "ROP (Rotary)";

      this.objChart_Rotary.leftAxis().AutoScale = true;

      this.objChart_Rotary.leftAxis().Inverted = false;
      this.objChart_Rotary.leftAxis().ShowLabels = true;
      this.objChart_Rotary.leftAxis().ShowTitle = true;
      this.objChart_Rotary.leftAxis().Title =
        "ROP  (" + this.state.objROPSummaryData.DepthUnit + "/hr)";

      this.objChart_Rotary.bottomAxis().AutoScale = true;
      this.objChart_Rotary.bottomAxis().IsDateTime = false;

      this.objChart_Rotary.bottomAxis().Title =
        "Depth (" + this.state.objROPSummaryData.DepthUnit + ")";
      this.objChart_Rotary.bottomAxis().ShowLabels = true;
      this.objChart_Rotary.bottomAxis().ShowTitle = true;
      this.objChart_Rotary.bottomAxis().LabelAngel = 0;
      this.objChart_Rotary.bottomAxis().ShowSelector = false;

      this.objChart_Rotary.rightAxis().Visible = false;
      this.objChart_Rotary.rightAxis().ShowLabels = false;

      this.objChart_Rotary.MarginLeft = 80;
      this.objChart_Rotary.MarginBottom = 60;
      this.objChart_Rotary.MarginTop = 25;
      this.objChart_Rotary.MarginRight = 10;

      let objSeries = new DataSeries();
      objSeries.Id = "ROPRotarySeries";
      objSeries.Name = "ROP Rotary";
      objSeries.XAxisId = this.objChart_Rotary.bottomAxis().Id;
      objSeries.YAxisId = this.objChart_Rotary.leftAxis().Id;
      objSeries.Type = dataSeriesType.Point;
      objSeries.PointStyle = pointStyle.Triangle;
      //objSeries.PointSize = 4;
      objSeries.Title = "Main";

      objSeries.Color = "#76FF03"; //this.getRigStateColor(0); //"#1762ad";
      objSeries.ShowInLegend = true;

      this.objChart_Rotary.DataSeries.set(objSeries.Id, objSeries);

      //Populate the data series with this data
      objSeries.Data.slice(0, objSeries.Data.length);

      for (let i = 0; i < this.state.objROPSummaryData.rotateData.length; i++) {
        let objVal: ChartData = new ChartData();
        objVal.x = this.state.objROPSummaryData.rotateData[i].X;
        objVal.y = this.state.objROPSummaryData.rotateData[i].Y;
        objSeries.Data.push(objVal);
      }

      //offset

      if (this.state.objROPSummaryData.offsetRotateData.length > 0) {
        objSeries = new DataSeries();
        objSeries.Id = "ROPRotaryOffsetSeries";
        objSeries.Name = "ROP Rotary (Offset)";
        objSeries.XAxisId = this.objChart_Rotary.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_Rotary.leftAxis().Id;
        objSeries.Type = dataSeriesType.Point;
        objSeries.PointStyle = pointStyle.Diamond;
        objSeries.Title = "Offset";
        objSeries.Color = "#F44336"; //"#1762ad";
        objSeries.ShowInLegend = true;

        this.objChart_Rotary.DataSeries.set(objSeries.Id, objSeries);

        //Populate the data series with this data
        objSeries.Data.slice(0, objSeries.Data.length);

        for (
          let i = 0;
          i < this.state.objROPSummaryData.offsetRotateData.length;
          i++
        ) {
          let objVal: ChartData = new ChartData();
          objVal.x = this.state.objROPSummaryData.offsetRotateData[i].X;
          objVal.y = this.state.objROPSummaryData.offsetRotateData[i].Y;
          objSeries.Data.push(objVal);
        }
      }
      //

      this.objChart_Rotary.drawLegend();
      this.objChart_Rotary.reDraw();
    } catch (error) { }
  };
  refreshSlideChart = () => {
    try {
      this.objChart_Slide.initialize();
      this.objChart_Slide.DataSeries.clear();
      this.objChart_Slide.updateChart();
      this.objChart_Slide.Title = "ROP (Slide)";

      this.objChart_Slide.leftAxis().AutoScale = true;

      this.objChart_Slide.leftAxis().Inverted = false;
      this.objChart_Slide.leftAxis().ShowLabels = true;
      this.objChart_Slide.leftAxis().ShowTitle = true;
      this.objChart_Slide.leftAxis().Title =
        "ROP  (" + this.state.objROPSummaryData.DepthUnit + "/hr)";

      this.objChart_Slide.bottomAxis().AutoScale = true;
      this.objChart_Slide.bottomAxis().IsDateTime = false;

      this.objChart_Slide.bottomAxis().Title =
        "Depth (" + this.state.objROPSummaryData.DepthUnit + ")";
      this.objChart_Slide.bottomAxis().ShowLabels = true;
      this.objChart_Slide.bottomAxis().ShowTitle = true;
      this.objChart_Slide.bottomAxis().LabelAngel = 0;
      this.objChart_Slide.bottomAxis().ShowSelector = false;

      this.objChart_Slide.rightAxis().Visible = false;
      this.objChart_Slide.rightAxis().ShowLabels = false;

      this.objChart_Slide.MarginLeft = 80;
      this.objChart_Slide.MarginBottom = 60;
      this.objChart_Slide.MarginTop = 25;
      this.objChart_Slide.MarginRight = 10;

      let objSeries = new DataSeries();
      objSeries.Id = "ROPSlideSeries";
      objSeries.Name = "ROP Slide";
      objSeries.XAxisId = this.objChart_Slide.bottomAxis().Id;
      objSeries.YAxisId = this.objChart_Slide.leftAxis().Id;
      objSeries.Type = dataSeriesType.Point;
      objSeries.PointStyle = pointStyle.Diamond;
      objSeries.Title = "Main";
      objSeries.Color = "#FFD600"; // this.getRigStateColor(1); //"#1762ad";
      objSeries.ShowInLegend = true;

      this.objChart_Slide.DataSeries.set(objSeries.Id, objSeries);

      //Populate the data series with this data
      objSeries.Data.slice(0, objSeries.Data.length);

      for (let i = 0; i < this.state.objROPSummaryData.slideData.length; i++) {
        let objVal: ChartData = new ChartData();
        objVal.x = this.state.objROPSummaryData.slideData[i].X;
        objVal.y = this.state.objROPSummaryData.slideData[i].Y;
        objSeries.Data.push(objVal);
      }

      //offset

      if (this.state.objROPSummaryData.offsetSlideData.length > 0) {
        objSeries = new DataSeries();
        objSeries.Id = "ROPSlideOffsetSeries";
        objSeries.Name = "ROP Slide (Offset)";
        objSeries.XAxisId = this.objChart_Slide.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_Slide.leftAxis().Id;
        objSeries.Type = dataSeriesType.Point;
        objSeries.PointStyle = pointStyle.Diamond;
        objSeries.Title = "Offset";
        objSeries.Color = "#3D5AFE"; //"#1762ad";
        objSeries.ShowInLegend = true;

        this.objChart_Slide.DataSeries.set(objSeries.Id, objSeries);

        //Populate the data series with this data
        objSeries.Data.slice(0, objSeries.Data.length);

        for (
          let i = 0;
          i < this.state.objROPSummaryData.offsetSlideData.length;
          i++
        ) {
          let objVal: ChartData = new ChartData();
          objVal.x = this.state.objROPSummaryData.offsetSlideData[i].X;
          objVal.y = this.state.objROPSummaryData.offsetSlideData[i].Y;
          objSeries.Data.push(objVal);
        }
      }
      //

      this.objChart_Slide.drawLegend();
      this.objChart_Slide.reDraw();
    } catch (error) { }
  };

  onAfterSeriesDraw = (e: ChartEventArgs, i: number) => {
    try {
      let tripOutlineData = [];
      let tripOutArr = [];
      if(this.tripOutsString!=""){

      
      tripOutArr = this.tripOutsString.split(",");

      for (let index = 0; index < tripOutArr.length; index++) {
        const item: number = Number(Number(tripOutArr[index]).toFixed(0));
        tripOutlineData.push([item, 0]);
      }

      for (let index = 0; index < tripOutlineData.length; index++) {
        const depth = tripOutlineData[index][0];
        let x1 = this.objChart_Combine.bottomAxis().ScaleRef(depth);
        let x2 = x1;
        let y1 = this.objChart_Combine.__chartRect.top;
        let y2 = this.objChart_Combine.__chartRect.bottom;

        this.objChart_Combine.SVGRef.append("g")
          .attr("class", "dashed" + this.objChart_Combine.Id)
          .append("line")
          .attr("id", "line-1")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .style("fill", "red")
          .style("stroke", "red")
          .style("stroke-dasharray", "5,5");
      }
    }
      //offset Tripout Lines

      tripOutlineData = [];
      //Nishant 28/07/2021
      if(this.tripOutsOffsetString== ""){
        return;
      }
      ////********** */
      tripOutArr = this.tripOutsOffsetString.split(",");

      for (let index = 0; index < tripOutArr.length; index++) {
        const item: number = Number(Number(tripOutArr[index]).toFixed(0));
        tripOutlineData.push([item, 0]);
      }

      for (let index = 0; index < tripOutlineData.length; index++) {
        const depth = tripOutlineData[index][0];
        
        let x1 = this.objChart_Combine.bottomAxis().ScaleRef(depth);
        let x2 = x1;
        let y1 = this.objChart_Combine.__chartRect.top;
        let y2 = this.objChart_Combine.__chartRect.bottom;

        this.objChart_Combine.SVGRef.append("g")
          .attr("class", "dashed_" + this.objChart_Combine.Id)
          .append("line")
          .attr("id", "line-2")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .style("fill", "#17a2b8")
          .style("stroke", "#17a2b8")
          .style("stroke-dasharray", "5,5");
      }
    } catch (error) { }
  };
  refreshCombineChart = () => {
    try {
      Util.StatusInfo("Please wait, plotting data");
      this.objChart_Combine.onAfterSeriesDraw.subscribe((e, i) => {
        this.onAfterSeriesDraw(e, i);
      });
      this.objChart_Combine.initialize();
      this.objChart_Combine.DataSeries.clear();
      this.objChart_Combine.updateChart();
      this.objChart_Combine.Title = "ROP (Rotary & Slide)";

      this.objChart_Combine.leftAxis().AutoScale = true;

      this.objChart_Combine.leftAxis().Inverted = false;
      this.objChart_Combine.leftAxis().ShowLabels = true;
      this.objChart_Combine.leftAxis().ShowTitle = true;
      this.objChart_Combine.leftAxis().Title =
        "ROP  (" + this.state.objROPSummaryData.DepthUnit + "/hr)";

      this.objChart_Combine.bottomAxis().AutoScale = true;
      this.objChart_Combine.bottomAxis().IsDateTime = false;

      this.objChart_Combine.bottomAxis().Title =
        "Depth (" + this.state.objROPSummaryData.DepthUnit + ")";
      this.objChart_Combine.bottomAxis().ShowLabels = true;
      this.objChart_Combine.bottomAxis().ShowTitle = true;
      this.objChart_Combine.bottomAxis().LabelAngel = 0;
      this.objChart_Combine.bottomAxis().ShowSelector = false;

      this.objChart_Combine.rightAxis().Visible = false;
      this.objChart_Combine.rightAxis().ShowLabels = false;

      this.objChart_Combine.MarginLeft = 80;
      this.objChart_Combine.MarginBottom = 60;
      this.objChart_Combine.MarginTop = 25;
      this.objChart_Combine.MarginRight = 10;

      let objSeries = new DataSeries();
      objSeries.Id = "ROPRotarySeriesCombine";
      objSeries.Name = "ROP Rotary";
      objSeries.XAxisId = this.objChart_Combine.bottomAxis().Id;
      objSeries.YAxisId = this.objChart_Combine.leftAxis().Id;
      objSeries.PointSize =2; //Nishant 27/08/2021
      objSeries.Type = dataSeriesType.Point;
      objSeries.PointStyle = pointStyle.Diamond;
      objSeries.Title = "Rotary";
      objSeries.Color = "#76FF03"; //this.getRigStateColor(0); //"#1762ad";
      objSeries.ShowInLegend = true;

      this.objChart_Combine.DataSeries.set(objSeries.Id, objSeries);

      //Populate the data series with this data
      //objSeries.Data.slice(0, objSeries.Data.length);
      objSeries.Data.length = 0;

      for (let i = 0; i < this.state.objROPSummaryData.rotateData.length; i++) {
        let objVal: ChartData = new ChartData();
        objVal.x = this.state.objROPSummaryData.rotateData[i].X;
        objVal.y = this.state.objROPSummaryData.rotateData[i].Y;
        objSeries.Data.push(objVal);
      }

      //offset
      if (this.state.objROPSummaryData.offsetRotateData.length > 0) {
        objSeries = new DataSeries();
        objSeries.Id = "ROPRotaryOffsetSeriesCombine";
        objSeries.Name = "ROP Rotary (Offset)";
        objSeries.XAxisId = this.objChart_Combine.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_Combine.leftAxis().Id;
        objSeries.Type = dataSeriesType.Point;
        objSeries.PointStyle = pointStyle.Circle;
        objSeries.Title = "Rotary (Offset) ";
        objSeries.Color = "#F44336"; //"#1762ad";
        objSeries.PointSize =2; //Nishant 27/08/2021
        objSeries.ShowInLegend = true;

        this.objChart_Combine.DataSeries.set(objSeries.Id, objSeries);

        //Populate the data series with this data
        objSeries.Data.slice(0, objSeries.Data.length);

        for (
          let i = 0;
          i < this.state.objROPSummaryData.offsetRotateData.length;
          i++
        ) {
          let objVal: ChartData = new ChartData();
          objVal.x = this.state.objROPSummaryData.offsetRotateData[i].X;
          objVal.y = this.state.objROPSummaryData.offsetRotateData[i].Y;
          objSeries.Data.push(objVal);
        }
      }
      //**********************Slide ******************************************************************

      objSeries = new DataSeries();
      objSeries.Id = "ROPSlideSeriesCombine";
      objSeries.Name = "ROP Slide";
      objSeries.XAxisId = this.objChart_Combine.bottomAxis().Id;
      objSeries.YAxisId = this.objChart_Combine.leftAxis().Id;
      objSeries.PointSize =2; //Nishant 27/08/2021
      objSeries.Type = dataSeriesType.Point;
      objSeries.PointStyle = pointStyle.Circle;
      objSeries.Title = "Slide";
      objSeries.Color = "#FFD600"; //this.getRigStateColor(1); //"#1762ad";
      objSeries.ShowInLegend = true;

      this.objChart_Combine.DataSeries.set(objSeries.Id, objSeries);

      //Populate the data series with this data
      objSeries.Data.slice(0, objSeries.Data.length);

      for (let i = 0; i < this.state.objROPSummaryData.slideData.length; i++) {
        let objVal: ChartData = new ChartData();
        objVal.x = this.state.objROPSummaryData.slideData[i].X;
        objVal.y = this.state.objROPSummaryData.slideData[i].Y;
        objSeries.Data.push(objVal);
      }

      //offset
      if (this.state.objROPSummaryData.offsetSlideData.length > 0) {
        objSeries = new DataSeries();
        objSeries.Id = "ROPSlideOffsetSeriesCombine";
        objSeries.Name = "ROP Slide (Offset)";
        objSeries.XAxisId = this.objChart_Combine.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_Combine.leftAxis().Id;
        objSeries.PointSize =2; //Nishant 27/08/2021
        objSeries.Type = dataSeriesType.Point;
        objSeries.PointStyle = pointStyle.Circle;
        objSeries.Title = "Slide (Offset)";
        objSeries.Color = "#3D5AFE"; //"blue"; //"#1762ad";
        objSeries.ShowInLegend = true;

        this.objChart_Combine.DataSeries.set(objSeries.Id, objSeries);

        //Populate the data series with this data
        objSeries.Data.slice(0, objSeries.Data.length);

        for (
          let i = 0;
          i < this.state.objROPSummaryData.offsetSlideData.length;
          i++
        ) {
          let objVal: ChartData = new ChartData();
          objVal.x = this.state.objROPSummaryData.offsetSlideData[i].X;
          objVal.y = this.state.objROPSummaryData.offsetSlideData[i].Y;
          objSeries.Data.push(objVal);
        }
      }

      this.objChart_Combine.drawLegend();
      this.objChart_Combine.reDraw();

      Util.StatusSuccess("Data successfully plotted");
      Util.StatusReady();
    } catch (error) { }
  };

  loadConnections = () => {
    try {
      Util.StatusInfo("Getting data from the server  ");
      // this.setState({
      //   isProcess: true,
      // });
      //this.forceUpdate();

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "ROPSummary";
      objBrokerRequest.Function = "ROPSummary";

      let paramuserid: BrokerParameter = new BrokerParameter(
        "UserId",
        _gMod._userId
      );
      objBrokerRequest.Parameters.push(paramuserid);

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );
      objBrokerRequest.Parameters.push(paramwellId);

      //test depth range
      //alert(this.selectionType);
      let paramSelectionType: BrokerParameter = new BrokerParameter(
        "SelectionType",
        this.selectionType
      );
      //this.state.selectionType
      objBrokerRequest.Parameters.push(paramSelectionType);

      let paramFromDate: BrokerParameter = new BrokerParameter(
        "FromDate",
        utilFunc.formateDate(this.fromDate)
      );
      objBrokerRequest.Parameters.push(paramFromDate);

      let paramToDate: BrokerParameter = new BrokerParameter(
        "ToDate",
        utilFunc.formateDate(this.toDate)
      );
      objBrokerRequest.Parameters.push(paramToDate);
      // this.fromDepth = 46.3;
      // this.toDepth = 8346.8;
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

      let paramSideTrackKey: BrokerParameter = new BrokerParameter(
        "SideTrackKey",
        "-999"
      );
      objBrokerRequest.Parameters.push(paramSideTrackKey);

      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          // $("#loader").hide();

          let objData = JSON.parse(res.data.Response);

          this.Warnings = res.data.Warnings;
          


          if (this.Warnings.trim() != "") {
            $("#warning").css("backgroundColor", "#ffb74d");
            $("#lblWarning").text(res.data.Warnings);
          }
          else {
            $("#warning").css("backgroundColor", "transparent");
            $("#lblWarning").text("");
          }




          //Draw Tip Outs Line on Combine Chart
          let tripOuts = Object.values(objData.tripOuts);
          let tripOutsOffset = Object.values(objData.tripOutsOffset);

          let strLabel: string = "";
          if (tripOuts.length > 0) {
            for (let index = 0; index < tripOuts.length; index++) {
              const objItem = Number(tripOuts[index]).toFixed(2);
              strLabel += objItem + ",";
            }

            this.tripOutsString = strLabel.substring(0, strLabel.length - 1);
          }
          strLabel = "";
          debugger;
          if (tripOutsOffset.length > 0) {
            for (let index = 0; index < tripOutsOffset.length; index++) {
              const objItem = Number(tripOutsOffset[index]).toFixed(2);
              strLabel += objItem + ",";
            }

            this.tripOutsOffsetString = strLabel.substring(
              0,
              strLabel.length - 1
            );
          }
          Util.StatusSuccess("Data successfully retrived  ");


          if (objData.offSetWellName == "" || (objData.OffsetRotaryPercent == 0 && objData.OffsetSlidePercent == 0)) {
            //  if (objData.offSetWellName == "" ) {
            objData.offsetDepthIn = -1;
            objData.offsetDepthOut = -1;

          }
          console.log("objROPSummaryData",objData);
          this.setState({
            objROPSummaryData: objData,
            isProcess: false,
          });

          // this.forceUpdate();
          // this.refreshChart();
        })
        .catch((error) => {
          Util.StatusError(error.message);
          // this.setState({
          //   isProcess: false,
          // });
          //this.forceUpdate();

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

  handleSelect = (e: any) => {
    this.setState({ selected: e.selected });
  };

  selectionChanged = (
    pselectedval: string,
    pfromDate: Date,
    ptoDate: Date,
    pfromDepth: number,
    ptoDepth: number
  ) => {
    try {
      // this.setState({ selectionType: pselectedval });
      this.selectionType = pselectedval;
      this.fromDate = pfromDate;
      this.toDate = ptoDate;
      this.fromDepth = pfromDepth;
      this.toDepth = ptoDepth;
      //this.forceUpdate();

      this.loadConnections();
    } catch (error) { }
  };

  render() {
    let loader = this.state.isProcess;

    let rotateColor: string = "#76FF03"; //this.getRigStateColor(0);
    let slideColor: string = "#FFD600"; //this.getRigStateColor(1);

    return (
      <div>
        <div className="row">
          <div className="drillingSummaryContainer">
            <div className="mr-2">
              <div className="statusCard">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">Rig Name</h6>
                  <div className="_summaryLabelBig">
                    {this.state.objROPSummaryData.RigName}
                  </div>
                </div>
              </div>
            </div>

            <div className="mr-2">
              <div className="statusCard">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">Well Name</h6>
                  <div className="_summaryLabelBig">
                    {this.state.objROPSummaryData.WellName}
                  </div>
                </div>
              </div>
            </div>

            <div className="mr-2">
              <div className="statusCard">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">Offset Well</h6>
                  <div className="_summaryLabelBig">
                    {this.state.objROPSummaryData.offSetWellName === ""
                      ? "-"
                      : this.state.objROPSummaryData.offSetWellName}
                  </div>
                </div>
              </div>
            </div>

            <div className="mr-2">
              <div className="statusCard">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">Offset Depth In</h6>
                  <div className="_summaryLabelBig">
                    {this.state.objROPSummaryData.offSetWellName == "" ? "" :
                      (this.state.objROPSummaryData.offsetDepthIn >= 0 ? Number(this.state.objROPSummaryData.offsetDepthIn).toFixed(2) : "")
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="mr-2">
              <div className="statusCard">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">Offset Depth Out</h6>
                  <div className="_summaryLabelBig">
                    {this.state.objROPSummaryData.offSetWellName == "" ? "" :
                      (this.state.objROPSummaryData.offsetDepthOut >= 0 ? Number(this.state.objROPSummaryData.offsetDepthOut).toFixed(2) : "")
                    }
                  </div>
                </div>
                <div className="col-lg-12">
           
          </div>
              </div>
            </div>

            <div className="mr-2">
              <div className="statusCard">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">Depth In</h6>
                  <div className="_summaryLabelBig">
                    {isNaN(Number(this.state.objROPSummaryData.fromDepth))
                      ? 0.0
                      : Number(this.state.objROPSummaryData.fromDepth).toFixed(
                        2
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mr-2">
              <div className="statusCard">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">Depth Out</h6>
                  <div className="_summaryLabelBig">
                    {isNaN(Number(this.state.objROPSummaryData.toDepth))
                      ? 0.0
                      : Number(this.state.objROPSummaryData.toDepth).toFixed(2)}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        {/* Nishant 28/08/2021 */}
        <div className="col-lg-12">
            <div className="float-right mr-2">
              <FontAwesomeIcon
                icon={faUndo}
                onClick={() => {
                  this.refreshChart();
                }}
              />
            </div>
          </div>
        {/* <div className="row">
          <div className="col-lg-12 eVumaxPanelTitle">
            <div>
              <label className="summaryTitle">
                {this.state.objROPSummaryData.WellName}
              </label>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="float-right mr-2">
              <FontAwesomeIcon
                icon={faUndo}
                onClick={() => {
                  this.forceUpdate();
                }}
              />
            </div>
          </div>
        </div> */}
        <div className="clearfix"></div>


        <div className="clearfix"></div>
        <hr />

        <div className="row">
          {/* <div className="col-lg-2"> */}




          <div style={{ width: "20%" }}>


            <div className="pieHeader">
              <div className="pieBody" style={{ textAlign: 'center' }}>
                <h6 className="card-subtitle mb-2">Current Well - {this.state.objROPSummaryData.WellName} </h6>
              </div>
            </div>

            <div
              id="CurrentPie_Chart"
              style={{
                height: "calc(28vh)",
                // width: "calc(20vw)",
                backgroundColor: "transparent",
                marginLeft: "30px",
              }}
            ></div>
          </div>

          {/* <div className="col-lg-5"> */}
          <div style={{ width: "40%" }}>
            <div
              id="rotarypointchart"
              style={{
                height: "calc(28vh)",

                //width: "calc(30vw)",
                width: "100%",
                backgroundColor: "transparent",
                // float: "right",
                marginLeft: "10px",
              }}
            ></div>
            <div
              id="rotarypointchart_legend"
              style={{
                textAlign: "center",
                height: "20px",
                width: "100%",
                backgroundColor: "transparent",
                display: "inline-block",
              }}
            />
          </div>
          {/* <div className="col-lg-5"> */}
          <div style={{ width: "36%" }}>
            <div
              id="slidepointchart"
              style={{
                //  height: "calc(100vh - 700px)",
                // height: "90%",
                height: "calc(28vh)",
                //width: "calc(30vw)",
                width: "100%",
                backgroundColor: "transparent",
                // float: "right",
                marginLeft: "10px",
              }}
            ></div>
            <div
              id="slidepointchart_legend"
              style={{
                textAlign: "center",
                height: "40px",
                width: "100%",
                backgroundColor: "transparent",
                display: "inline-block",
              }}
            />
          </div>
        </div>

        <div className="row">
          {/* <div className="col-lg-2"> */}
          <div style={{ width: "20%" }}>
            <div className="pieHeader" style={{ border: 'none' }}>
              <div className="pieBody" style={{ textAlign: 'center' }}>
                <h6 className="card-subtitle mb-2">Offset Well

                  {this.state.objROPSummaryData.offSetWellName === ""
                    ? " -"
                    : "  - " + this.state.objROPSummaryData.offSetWellName}
                </h6>
              </div>
            </div>



            <div
              id="OffsetPie_Chart"
              style={{
                height: "calc(28vh)",
                width: "100%",
                backgroundColor: "transparent",

                marginLeft: "30px",
              }}
            ></div>
          </div>
          {/* <div className="col-lg-10"> */}
          <div style={{ width: "76%" }}>
            <div
              id="combinepointchart"
              style={{
                //height: "calc(100vh - 700px)",
                height: "calc(30vh)",
                //width: "calc(70vw)",
                width: "100%",
                backgroundColor: "transparent",
                // float: "right",
                marginLeft: "10px",
              }}
            ></div>
            <div
              id="combinepointchart_legend"
              style={{
                textAlign: "center",
                height: "40px",
                width: "calc(30vw)",
                backgroundColor: "transparent",
                display: "inline-block",
              }}
            />

            <div className="float-left">
              <label className="float-left text-danger mr-2">
                Main Well Trip outs :
              </label>
              {this.tripOutsString}
            </div>
            <div className="float-left">
              <label className="float-left text-info ml-5 mr-2">
                Offset Well Trip outs :
              </label>
              {this.tripOutsOffsetString}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3">
            <div style={{ overflowX: "auto" }}>
              <h6>Statistics</h6>
              <table
                className="table-bordered text-center axis-title"
                style={{ width: "100%" }}
              >
                <tr>
                  <th></th>
                  <th></th>
                  <th>Current</th>
                  <th>Offset</th>
                </tr>
                <tr>
                  {/* +{{rotateColor }}+ */}
                  {/*  */}
                  <td rowSpan={2}>Rotate </td>
                  <td>Avg </td>
                  <td >
                    {Number(this.state.objROPSummaryData.AvgRotaryROP).toFixed(
                      2
                    )}
                  </td>
                  <td >
                    {Number(
                      this.state.objROPSummaryData.AvgRotaryROPOffset
                    ).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td>Median </td>
                  <td >
                    {Number(this.state.objROPSummaryData.MedRotaryROP).toFixed(
                      2
                    )}
                  </td>
                  <td >
                    {Number(
                      this.state.objROPSummaryData.MedRotaryROPOffset
                    ).toFixed(2)}
                  </td>
                </tr>

                <tr>
                  <td rowSpan={2}>Slide </td>
                  <td>Avg</td>
                  <td >
                    {Number(this.state.objROPSummaryData.AvgSlideROP).toFixed(
                      2
                    )}
                  </td>
                  <td >
                    {Number(
                      this.state.objROPSummaryData.AvgSlideROPOffset
                    ).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td> Median </td>
                  <td >
                    {" "}
                    {Number(this.state.objROPSummaryData.MedSlideROP).toFixed(
                      2
                    )}
                  </td>
                  <td>
                    {" "}
                    {Number(
                      this.state.objROPSummaryData.MedSlideROPOffset
                    ).toFixed(2)}
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <div className="col-lg-9">
            <div style={{ width: "100%" }}>
              <DataSelector {...this} />
            </div>
          </div>
          <div id="warning" style={{ paddingBottom:"10px", padding: "0px", height: "20px", width: "100%", fontWeight: "normal", backgroundColor: "transparent", color: "black" }}> <label id="lblWarning" style={{ color: "black", marginLeft: "10px" }} ></label> </div>
        </div>

        {/* <div className="row">
          <div className="col-lg-12">
            <TabStrip
              selected={this.state.selected}
              onSelect={this.handleSelect}
            >
              <TabStripTab title="ROP Summary">




              </TabStripTab>
              <TabStripTab title="Settings">
                  <div style={{marginTop:"10px"}}>
                <div className="row">
                  <div className="col-lg-12">
                  <h6 className="mb-2">Data Downsampling</h6>

                  <br />
                  <label>No. of data points per ft/mtr</label>{" "}
                  <NumericTextBox format="n2" width="100px" />
                  <br />
                  <label>Moving Avg. Data Points</label>{" "}
                  <NumericTextBox format="n2" width="100px" />
                  </div>
                </div>
                </div>
              </TabStripTab>
            </TabStrip>
          </div>
        </div> */}
      
      </div>
    );
  }
}

export default ROPSummaryPlot;
