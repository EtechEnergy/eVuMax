import React, { Component } from "react";
import * as d3 from "d3";
import axios from "axios";
import {
  Chart,
  lineStyle,
  curveStyle,
} from "../../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import {
  DataSeries,
  dataSeriesType,

} from "../../../eVuMaxObjects/Chart/DataSeries";

import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import "./TripSpeedPlot1.css";
import GlobalMod from "../../../objects/global";
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-all";
import TripAnalyzerSelection from "../TripAnalyzerSelection/TripAnalyzerSelection";
import { axisLabelStyle } from "../../../eVuMaxObjects/Chart/Axis";
import { faListAlt, faSearchMinus, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Util } from "../../../Models/eVuMax";
import { ClientLogger } from "../../ClientLogger/ClientLogger";

let _gMod = new GlobalMod();

export class TripSpeedPlot1 extends Component {
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;
    this.objLogger.wellID = this.WellId;
  }

  objLogger: ClientLogger = new ClientLogger("TripSpeedPlot1", _gMod._userId);
  state = {
    WellName: "",
    selectedTab: 0,
    objTripSpeedData: {} as any,
    objUserSettings: {} as any,

    isProcess: false,
    maxWithAndWOConn: 0
  };

  PlotId: "TripSpeed1";
  WellId: string = "";
  objChart_TripSpeed: Chart;
  objChart_BarWOConn: Chart;
  objChart_BarWithConn: Chart;
  //Cancel all Axios Request
  AxiosSource = axios.CancelToken.source();
  AxiosConfig = { cancelToken: this.AxiosSource.token };

  componentWillUnmount() {
    this.AxiosSource.cancel();
  }
  //==============


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
      //this.objLogger.SendLog("Test Logger");
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
      this.refreshChart();
    } catch (error) { }
  }

  initilizeCharts = () => {
    try {
      Util.StatusInfo("Please wait, plotting data");
      this.objChart_TripSpeed = new Chart(this, "objChart_TripSpeed");
      this.objChart_TripSpeed.ContainerId = "ChartTripSpeed";
      //this.objChart_TripSpeed.isZoomByRect = true;
      this.objChart_TripSpeed.leftAxis().AutoScale = true;
      this.objChart_TripSpeed.leftAxis().Min = 0;
      this.objChart_TripSpeed.leftAxis().Max = 100;
      this.objChart_TripSpeed.leftAxis().Inverted = true;
      this.objChart_TripSpeed.leftAxis().ShowLabels = true;
      this.objChart_TripSpeed.leftAxis().ShowTitle = true;
      this.objChart_TripSpeed.leftAxis().Title =
        "Depth (" + this.state.objTripSpeedData.DepthVumaxUnitID + ")";
      this.objChart_TripSpeed.leftAxis().DisplayOrder = 1;
      this.objChart_TripSpeed.leftAxis().Visible = true;
      this.objChart_TripSpeed.leftAxis().PaddingMin = 20;

      this.objChart_TripSpeed.rightAxis().Visible = false;

      this.objChart_TripSpeed.topAxis().AutoScale = true;
      this.objChart_TripSpeed.topAxis().Min = 0;
      this.objChart_TripSpeed.topAxis().Max = 100;
      this.objChart_TripSpeed.topAxis().Inverted = false;
      this.objChart_TripSpeed.topAxis().ShowLabels = true;
      this.objChart_TripSpeed.topAxis().ShowTitle = true;
      this.objChart_TripSpeed.topAxis().Title = "Delta T (Hrs.)";
      this.objChart_TripSpeed.topAxis().DisplayOrder = 1;
      this.objChart_TripSpeed.topAxis().Visible = true;
      //this.objChart_TripSpeed.topAxis().Position = ;

      this.objChart_TripSpeed.bottomAxis().AutoScale = true;
      this.objChart_TripSpeed.bottomAxis().bandScale = false;
      this.objChart_TripSpeed.bottomAxis().Min = 100;
      this.objChart_TripSpeed.bottomAxis().Max = 200;
      this.objChart_TripSpeed.bottomAxis().Title =
        "Trip Speed (" + this.state.objTripSpeedData.DepthVumaxUnitID + "/hr)";
      this.objChart_TripSpeed.bottomAxis().ShowLabels = true;
      this.objChart_TripSpeed.bottomAxis().ShowTitle = true;
      this.objChart_TripSpeed.bottomAxis().LabelAngel = 90;
      this.objChart_TripSpeed.bottomAxis().ShowSelector = false;
      this.objChart_TripSpeed.bottomAxis().IsDateTime = false;
      this.objChart_TripSpeed.bottomAxis().Visible = true;

      this.objChart_TripSpeed.MarginLeft = 10;
      this.objChart_TripSpeed.MarginBottom = 5;
      this.objChart_TripSpeed.MarginTop = 10;
      this.objChart_TripSpeed.MarginRight = 20;

      this.objChart_TripSpeed.initialize();
      this.objChart_TripSpeed.reDraw();

      //======================= BarWOConn
      this.objChart_BarWOConn = new Chart(this, "objChart_BarWOConn");
      this.objChart_BarWOConn.ContainerId = "BarWOConn";
      // // //Configure Axes
      //this.objChart_BarWOConn.leftAxis().AutoScale = true;
      this.objChart_BarWOConn.leftAxis().AutoScale = false;
      this.objChart_BarWOConn.leftAxis().Inverted = false;
      this.objChart_BarWOConn.leftAxis().ShowLabels = true;
      this.objChart_BarWOConn.leftAxis().ShowTitle = true;
      this.objChart_BarWOConn.leftAxis().Title =
        "Trip Speed W/o Conn (" +
        this.state.objTripSpeedData.DepthVumaxUnitID +
        "/hr)";
      this.objChart_BarWOConn.leftAxis().DisplayOrder = 1;
      this.objChart_BarWOConn.leftAxis().Visible = true;

      this.objChart_BarWOConn.bottomAxis().AutoScale = true;
      this.objChart_BarWOConn.bottomAxis().bandScale = true;
      this.objChart_BarWOConn.bottomAxis().Min = 100;
      this.objChart_BarWOConn.bottomAxis().Max = 200;
      this.objChart_BarWOConn.bottomAxis().Title = "";
      this.objChart_BarWOConn.bottomAxis().ShowLabels = true;
      this.objChart_BarWOConn.bottomAxis().ShowTitle = true;
      this.objChart_BarWOConn.bottomAxis().LabelAngel = 90;
      this.objChart_BarWOConn.bottomAxis().ShowSelector = true;
      this.objChart_BarWOConn.bottomAxis().IsDateTime = false;
      this.objChart_BarWOConn.bottomAxis().Visible = true;

      this.objChart_BarWOConn.rightAxis().ShowLabels = false;
      this.objChart_BarWOConn.rightAxis().ShowTitle = false;
      this.objChart_BarWOConn.rightAxis().Visible = false;
      this.objChart_BarWOConn.rightAxis().ShowLabels = false;
      this.objChart_BarWOConn.rightAxis().ShowTitle = false;

      this.objChart_BarWOConn.topAxis().ShowLabels = false;
      this.objChart_BarWOConn.topAxis().Visible = false;

      this.objChart_BarWOConn.MarginLeft = 70;
      this.objChart_BarWOConn.MarginBottom = 40;
      this.objChart_BarWOConn.MarginTop = 50;
      this.objChart_BarWOConn.MarginRight = 10;

      this.objChart_BarWOConn.initialize();
      this.objChart_BarWOConn.reDraw();

      //======================= BarWithConn
      this.objChart_BarWithConn = new Chart(this, "objChart_BarWithConn");
      this.objChart_BarWithConn.ContainerId = "BarWithConn";

      // // //Configure Axes
      this.objChart_BarWithConn.leftAxis().AutoScale = true;
      this.objChart_BarWithConn.leftAxis().Min = 0;
      this.objChart_BarWithConn.leftAxis().Max = 100;
      this.objChart_BarWithConn.leftAxis().Inverted = false;
      this.objChart_BarWithConn.leftAxis().ShowLabels = true;
      this.objChart_BarWithConn.leftAxis().ShowTitle = true;
      this.objChart_BarWithConn.leftAxis().Title =
        "Trip Speed With Connection (" +
        this.state.objTripSpeedData.DepthVumaxUnitID +
        "/hr)";
      this.objChart_BarWithConn.leftAxis().DisplayOrder = 1;
      this.objChart_BarWithConn.leftAxis().Visible = true;

      this.objChart_BarWithConn.bottomAxis().AutoScale = true;
      this.objChart_BarWithConn.bottomAxis().bandScale = true;
      this.objChart_BarWithConn.bottomAxis().Min = 100;
      this.objChart_BarWithConn.bottomAxis().Max = 200;
      this.objChart_BarWithConn.bottomAxis().Title = "";
      this.objChart_BarWithConn.bottomAxis().ShowLabels = true;
      this.objChart_BarWithConn.bottomAxis().ShowTitle = true;
      this.objChart_BarWithConn.bottomAxis().LabelAngel = 90;
      this.objChart_BarWithConn.bottomAxis().ShowSelector = true;
      this.objChart_BarWithConn.bottomAxis().IsDateTime = false;
      this.objChart_BarWithConn.bottomAxis().Visible = true;

      this.objChart_BarWithConn.rightAxis().ShowLabels = false;
      this.objChart_BarWithConn.rightAxis().ShowTitle = false;
      this.objChart_BarWithConn.rightAxis().Visible = false;
      this.objChart_BarWithConn.rightAxis().ShowLabels = false;
      this.objChart_BarWithConn.rightAxis().ShowTitle = false;

      this.objChart_BarWithConn.topAxis().ShowLabels = false;
      this.objChart_BarWithConn.topAxis().Visible = false;

      this.objChart_BarWithConn.MarginLeft = 70;
      this.objChart_BarWithConn.MarginBottom = 40;
      this.objChart_BarWithConn.MarginTop = 50;
      this.objChart_BarWithConn.MarginRight = 10;

      Util.StatusSuccess("Data successfully plotted");
      Util.StatusReady();

      this.objChart_BarWithConn.initialize();
      this.objChart_BarWithConn.reDraw();
    } catch (error) { }
  };

  //Nishant
  // getRigStateColor = (number) => {
  //     //alert(this.state.objROPSummaryData.RigStates);
  //     if (this.state.objROPSummaryData.RigStates != undefined) {
  //         let index = this.state.objROPSummaryData.RigStates.findIndex(
  //             (e) => e.RIG_STATE_NUMBER === number
  //         );
  //         if (index > -1) {
  //             return this.state.objROPSummaryData.RigStates[index].HEX_COLOR;
  //         } else {
  //             return "#000000";
  //         }

  //     }

  // };

  refreshChart = () => {
    try {
      this.refreshTripSpeedChart();
      this.getMaxTripSpeed();
      this.refreshBarWOConnChart();
      this.refreshBarWithConn();
    } catch (error) { }
  };

  getMaxTripSpeed = () => {
    try {

      //Check BanchMark Value if greater then Max value of Axis then set
      let maxTripSpeed = Math.max(
        ...this.state.objTripSpeedData.bar1Data.map((item) => item.X)
      );


      //Check BanchMark Value if greater then Max value of Axis then set
      let maxTripSpeedWO = Math.max(
        ...this.state.objTripSpeedData.bar2Data.map((item) => item.X)
      );

      let maxBenchMarkWO = this.state.objUserSettings.objBenchMarks.TripSpeedWOConnection
      let maxBenchMarkWithConn = this.state.objUserSettings.objBenchMarks.TripSpeedWithConnection

      let max = 0;
      if (maxTripSpeed > maxTripSpeedWO) {
        max = maxTripSpeed;
      } else {
        max = maxTripSpeedWO;
      }


      if (maxBenchMarkWO > max) {
        max = maxBenchMarkWO;
      }

      if (maxBenchMarkWithConn > max) {
        max = maxBenchMarkWithConn;
      }

      max = max + max * 0.10
      this.setState({ maxWithAndWOConn: max });



    } catch (error) {

    }

  }

  refreshTripSpeedChart() {
    try {
      this.objChart_TripSpeed.initialize();
      this.objChart_TripSpeed.LegendPosition = 4;  //1 (left), 2 (right), 3 (top), 4 (bottom)
      //Clear all the series

      this.objChart_TripSpeed.DataSeries.clear();
      this.objChart_TripSpeed.updateChart();

      //Configure Axes
      this.objChart_TripSpeed.leftAxis().AutoScale = true;
      this.objChart_TripSpeed.leftAxis().Min = 0;
      this.objChart_TripSpeed.leftAxis().Max = 100;
      this.objChart_TripSpeed.leftAxis().Inverted = true;
      this.objChart_TripSpeed.leftAxis().ShowLabels = true;
      this.objChart_TripSpeed.leftAxis().ShowTitle = true;
      this.objChart_TripSpeed.leftAxis().Title =
        "Depth (" + this.state.objTripSpeedData.DepthVumaxUnitID + ")";
      this.objChart_TripSpeed.leftAxis().DisplayOrder = 1;
      //this.objChart_TripSpeed.leftAxis().PaddingMin = 200;

      this.objChart_TripSpeed.rightAxis().ShowLabels = false;
      this.objChart_TripSpeed.rightAxis().Visible = false;

      this.objChart_TripSpeed.topAxis().AutoScale = true;
      this.objChart_TripSpeed.topAxis().bandScale = false;
      this.objChart_TripSpeed.topAxis().Min = 0;
      this.objChart_TripSpeed.topAxis().Max = 1;
      this.objChart_TripSpeed.topAxis().Inverted = false;
      this.objChart_TripSpeed.topAxis().ShowLabels = true;
      this.objChart_TripSpeed.topAxis().ShowTitle = true;
      this.objChart_TripSpeed.topAxis().Title = "Delta T (Hrs.)";
      this.objChart_TripSpeed.topAxis().DisplayOrder = 1;
      this.objChart_TripSpeed.topAxis().LabelAngel = 90;
      this.objChart_TripSpeed.topAxis().ShowAxisLine = true;


      this.objChart_TripSpeed.topAxis().GridVisible = false;

      this.objChart_TripSpeed.bottomAxis().AutoScale = true;
      this.objChart_TripSpeed.bottomAxis().bandScale = false; //Important Line .. somewhere its again initializing to true..

      this.objChart_TripSpeed.bottomAxis().Title =
        "Trip Speed (" + this.state.objTripSpeedData.DepthVumaxUnitID + "/hr)";
      this.objChart_TripSpeed.bottomAxis().ShowLabels = true;
      this.objChart_TripSpeed.bottomAxis().ShowTitle = true;
      this.objChart_TripSpeed.bottomAxis().LabelAngel = 90;

      this.objChart_TripSpeed.bottomAxis().ShowSelector = false;
      this.objChart_TripSpeed.bottomAxis().IsDateTime = false;

      //Need to use Min & Max value of Line1 Y series
      let min = Math.min(
        ...this.state.objTripSpeedData.line1Data.map((item) => item.Y)
      );
      let max = Math.max(
        ...this.state.objTripSpeedData.line1Data.map((item) => item.Y)
      );
      //=====================



      let objSeries = new DataSeries();
      objSeries.Id = "TripSpeedWOConnection";
      objSeries.Name = "Trip Speed W/o Conn";
      objSeries.XAxisId = this.objChart_TripSpeed.bottomAxis().Id;
      objSeries.YAxisId = this.objChart_TripSpeed.leftAxis().Id;
      objSeries.Type = dataSeriesType.Line;

      objSeries.LineWidth = 3;

      objSeries.Title = "Trip Speed W/o Connection";
      objSeries.Color = "#18FFFF"; //"steelBlue";
      objSeries.ShowInLegend = true;

      this.objChart_TripSpeed.DataSeries.set(objSeries.Id, objSeries);

      //Populate the data series with this data
      objSeries.Data.slice(0, objSeries.Data.length);

      for (let i = 0; i < this.state.objTripSpeedData.line1Data.length; i++) {
        let objVal: ChartData = new ChartData();
        objVal.x = Number(
          Number(this.state.objTripSpeedData.line1Data[i].X).toFixed(0)
        );
        objVal.y = this.state.objTripSpeedData.line1Data[i].Y;
        objSeries.Data.push(objVal);
      }

      //Line2
      if (this.state.objTripSpeedData.line2Data.length > 0) {
        objSeries = new DataSeries();
        objSeries.Id = "TripSpeedWithConnection";
        objSeries.Name = "Trip Speed with Connection";
        objSeries.XAxisId = this.objChart_TripSpeed.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_TripSpeed.leftAxis().Id;
        objSeries.Type = dataSeriesType.Line;
        objSeries.LineWidth = 3;

        objSeries.Title = "Trip Speed With Connection";
        objSeries.Color = "#FF3D00";
        objSeries.ShowInLegend = true;

        this.objChart_TripSpeed.DataSeries.set(objSeries.Id, objSeries);

        //Populate the data series with this data
        objSeries.Data.slice(0, objSeries.Data.length);

        for (let i = 0; i < this.state.objTripSpeedData.line2Data.length; i++) {
          let objVal: ChartData = new ChartData();

          objVal.x = this.state.objTripSpeedData.line2Data[i].X;
          objVal.y = this.state.objTripSpeedData.line2Data[i].Y;
          objSeries.Data.push(objVal);
        }
      }
      //Line3

      if (this.state.objTripSpeedData.line3Data.length > 0) {
        objSeries = new DataSeries();
        objSeries.Id = "BenchMarkWOConn";
        objSeries.Name = "BenchMark W/o Conn.";
        objSeries.XAxisId = this.objChart_TripSpeed.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_TripSpeed.leftAxis().Id;
        objSeries.Type = dataSeriesType.Line;
        objSeries.LineWidth = 3;

        objSeries.CurveStyle = curveStyle.step;

        objSeries.Title = "BenchMark W/o Connection";
        objSeries.Color = "#69F0AE";
        objSeries.ShowInLegend = true;

        this.objChart_TripSpeed.DataSeries.set(objSeries.Id, objSeries);

        //Populate the data series with this data

        objSeries.Data.slice(0, objSeries.Data.length);

        for (let i = 0; i < this.state.objTripSpeedData.line3Data.length; i++) {
          let objVal: ChartData = new ChartData();
          objVal.x = this.state.objTripSpeedData.line3Data[i].X;
          objVal.y = this.state.objTripSpeedData.line3Data[i].Y;
          objSeries.Data.push(objVal);
        }
      }

      //Line4
      if (this.state.objTripSpeedData.line4Data.length > 0) {
        objSeries = new DataSeries();
        objSeries.Id = "BenchMarkwithConn";
        objSeries.Name = "BenchMark With Connection";
        objSeries.XAxisId = this.objChart_TripSpeed.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_TripSpeed.leftAxis().Id;
        objSeries.Type = dataSeriesType.Line;
        objSeries.CurveStyle = curveStyle.step;
        objSeries.LineWidth = 3;

        objSeries.Title = "Benchmark With Connection";
        objSeries.Color = "#FFC400"; // borwn -->"#362419";
        objSeries.ShowInLegend = true;

        this.objChart_TripSpeed.DataSeries.set(objSeries.Id, objSeries);

        //Populate the data series with this data
        objSeries.Data.slice(0, objSeries.Data.length);

        for (let i = 0; i < this.state.objTripSpeedData.line4Data.length; i++) {
          let objVal: ChartData = new ChartData();

          objVal.x = this.state.objTripSpeedData.line4Data[i].X;
          objVal.y = this.state.objTripSpeedData.line4Data[i].Y;
          objSeries.Data.push(objVal);

        }
      }

      // //Delta with connection


      if (this.state.objTripSpeedData.deltaWithConnData.length > 0) {
        objSeries = new DataSeries();
        objSeries.Id = "deltaWithConn";
        objSeries.Name = "Delta With Connection";
        objSeries.XAxisId = this.objChart_TripSpeed.topAxis().Id;
        objSeries.YAxisId = this.objChart_TripSpeed.leftAxis().Id;
        objSeries.Type = dataSeriesType.Line;
        objSeries.LineWidth = 1;
        objSeries.LineStyle = lineStyle.dashed;

        objSeries.CurveStyle = curveStyle.step;

        objSeries.Title = "Delta With Connection";
        objSeries.Color = "#E040FB";
        objSeries.ShowInLegend = true;

        this.objChart_TripSpeed.DataSeries.set(objSeries.Id, objSeries);

        //Populate the data series with this data
        objSeries.Data.slice(0, objSeries.Data.length);

        for (
          let i = 0;
          i < this.state.objTripSpeedData.deltaWithConnData.length;
          i++
        ) {
          let objVal: ChartData = new ChartData();
          objVal.x = Number(
            Number(this.state.objTripSpeedData.deltaWithConnData[i].X).toFixed(
              5
            )
          );

          objVal.y = Number(
            Number(this.state.objTripSpeedData.deltaWithConnData[i].Y).toFixed(
              0
            )
          );
          objSeries.Data.push(objVal);
        }
      }

      //working fine....
      // //Delta with out connection

      if (this.state.objTripSpeedData.deltaWOConnData.length > 0) {
        objSeries = new DataSeries();
        objSeries.Id = "deltaWOConn";
        objSeries.Name = "Delta W/o Conn";
        objSeries.XAxisId = this.objChart_TripSpeed.topAxis().Id;
        objSeries.YAxisId = this.objChart_TripSpeed.leftAxis().Id;
        objSeries.Type = dataSeriesType.Line;
        objSeries.LineWidth = 1;
        objSeries.LineStyle = lineStyle.dashed;

        objSeries.CurveStyle = curveStyle.step;
        objSeries.Title = "Delta W/o Connection";
        objSeries.Color = "#00E676";
        objSeries.ShowInLegend = true;

        this.objChart_TripSpeed.DataSeries.set(objSeries.Id, objSeries);

        //Populate the data series with this data
        objSeries.Data.slice(0, objSeries.Data.length);

        for (
          let i = 0;
          i < this.state.objTripSpeedData.deltaWOConnData.length;
          i++
        ) {

          let objVal: ChartData = new ChartData();
          objVal.x = Number(
            Number(this.state.objTripSpeedData.deltaWOConnData[i].X).toFixed(5)
          );


          objVal.y = Number(
            Number(this.state.objTripSpeedData.deltaWOConnData[i].Y).toFixed(0)
          );
          objSeries.Data.push(objVal);
        }
      }

      //set min & max as per Line1 data
      //Check BanchMark Value if greater then Max value of Axis then set
      this.objChart_TripSpeed.leftAxis().AutoScale = false;
      this.objChart_TripSpeed.leftAxis().setMinMax(min, max);

      this.objChart_TripSpeed.drawLegend();
      this.objChart_TripSpeed.reDraw();
    } catch (error) { }
  }



  refreshBarWOConnChart() {
    this.objChart_BarWOConn.initialize();
    this.objChart_BarWOConn.LegendPosition = 4;  //1 (left), 2 (right), 3 (top), 4 (bottom)
    //Clear all the series
    this.objChart_BarWOConn.DataSeries.clear();
    this.objChart_BarWOConn.updateChart();

    // //Configure Axes
    this.objChart_BarWOConn.leftAxis().Inverted = false;
    this.objChart_BarWOConn.leftAxis().AutoScale = true;
    //this.objChart_BarWOConn.leftAxis().Min = 0;
    this.objChart_BarWOConn.leftAxis().Max = 100;

    //Check BanchMark Value if greater then Max value of Axis then set

    let UseDepthRanges = this.state.objUserSettings.UseDepthRanges;

    this.objChart_BarWOConn.leftAxis().Title =
      "Trip Speed W/o Connection (" +
      this.state.objTripSpeedData.DepthVumaxUnitID +
      "/hr)";
    this.objChart_BarWOConn.leftAxis().ShowSelector = false;

    this.objChart_BarWOConn.bottomAxis().AutoScale = true;
    this.objChart_BarWOConn.bottomAxis().Title = "";
    this.objChart_BarWOConn.bottomAxis().LabelAngel = 0;
    this.objChart_BarWOConn.bottomAxis().ShowSelector = false;
    this.objChart_BarWOConn.bottomAxis().LabelStyle = axisLabelStyle.labels;

    this.objChart_BarWOConn.bottomAxis().Labels = [];

    this.objChart_BarWOConn.rightAxis().ShowLabels = false;
    this.objChart_BarWOConn.rightAxis().ShowTitle = false;
    this.objChart_BarWOConn.rightAxis().Visible = false;
    this.objChart_BarWOConn.rightAxis().ShowLabels = false;
    this.objChart_BarWOConn.rightAxis().ShowTitle = false;

    let objSeries = new DataSeries();
    objSeries.Id = "WOConn"; // + index;
    objSeries.Stacked = true;

    objSeries.ShowLabelOnSeries = true; //Parth 05-10-2020
    objSeries.Title = "WOConnSeries";
    objSeries.Type = dataSeriesType.Bar;
    objSeries.ColorEach = false; //prath
    objSeries.XAxisId = this.objChart_BarWOConn.bottomAxis().Id;
    objSeries.YAxisId = this.objChart_BarWOConn.leftAxis().Id;
    objSeries.Color = "Green";

    objSeries.Title = "Trip Speed W/o Connection";
    objSeries.Color = "green";// "#18FFFF";
    objSeries.ShowInLegend = true;

    this.objChart_BarWOConn.DataSeries.set(objSeries.Id, objSeries);
    this.objChart_BarWOConn.bottomAxis().Labels.push("Section");

    //Populate the data series with this data
    let objVal: ChartData = new ChartData();

    objVal.x = 1;
    objVal.y = Number(
      Number(this.state.objTripSpeedData.bar1Data[0].X).toFixed(2)
    );

    objSeries.Data.push(objVal);

    //Check BanchMark Value if greater then Max value of Axis then set
    // let max = Math.max(
    //   ...this.state.objTripSpeedData.bar1Data.map((item) => item.X)
    // );

    //Changes
    // if (this.state.objUserSettings.objBenchMarks.TripSpeedWOConnection > max) {
    //   this.objChart_BarWOConn.leftAxis().AutoScale = false;
    //   this.objChart_BarWOConn.leftAxis().Max =
    //     this.state.objUserSettings.objBenchMarks.TripSpeedWOConnection +
    //     this.state.objUserSettings.objBenchMarks.TripSpeedWOConnection * 0.1;
    // }

    this.objChart_BarWOConn.leftAxis().AutoScale = false;
    this.objChart_BarWOConn.leftAxis().Max = this.state.maxWithAndWOConn;
    //===============


    this.objChart_BarWOConn.onBeforeSeriesDraw.subscribe((e, i) => {
      this.onBeforeDrawWOConnSeries(e, i);
    });


    this.objChart_BarWOConn.reDraw();
  }

  refreshBarWithConn() {
    try {
      this.objChart_BarWithConn.initialize();
      this.objChart_BarWithConn.LegendPosition = 4;  //1 (left), 2 (right), 3 (top), 4 (bottom)
      //Clear all the series
      this.objChart_BarWithConn.DataSeries.clear();
      this.objChart_BarWithConn.updateChart();

      // //Configure Axes
      this.objChart_BarWithConn.leftAxis().Inverted = false;
      this.objChart_BarWithConn.leftAxis().AutoScale = true;

      //TagDepthInformation pending get benchmark from this if UseDepthRanges is true

      this.objChart_BarWithConn.leftAxis().Title =
        "Trip Speed With Connection (" +
        this.state.objTripSpeedData.DepthVumaxUnitID +
        "/hr)";
      this.objChart_BarWithConn.leftAxis().ShowSelector = false;

      this.objChart_BarWithConn.bottomAxis().AutoScale = true;
      this.objChart_BarWithConn.bottomAxis().Title = "";
      this.objChart_BarWithConn.bottomAxis().LabelAngel = 0;
      this.objChart_BarWithConn.bottomAxis().ShowSelector = false;
      this.objChart_BarWithConn.bottomAxis().LabelStyle = axisLabelStyle.labels;

      this.objChart_BarWithConn.bottomAxis().Labels = [];

      this.objChart_BarWithConn.rightAxis().ShowLabels = false;
      this.objChart_BarWithConn.rightAxis().ShowTitle = false;
      this.objChart_BarWithConn.rightAxis().Visible = false;
      this.objChart_BarWithConn.rightAxis().ShowLabels = false;
      this.objChart_BarWithConn.rightAxis().ShowTitle = false;

      let objSeries = new DataSeries();
      objSeries.Id = "WithConn"; // + index;
      objSeries.Stacked = true;

      objSeries.ShowLabelOnSeries = true; //Parth 05-10-2020
      objSeries.Title = "WithConnSeries";
      objSeries.Type = dataSeriesType.Bar;
      objSeries.ColorEach = false;
      objSeries.XAxisId = this.objChart_BarWithConn.bottomAxis().Id;
      objSeries.YAxisId = this.objChart_BarWithConn.leftAxis().Id;
      objSeries.Color = "Green";

      objSeries.Title = "Trip Speed With Connection";
      objSeries.Color = "#FF3D00";
      objSeries.ShowInLegend = true;

      this.objChart_BarWithConn.DataSeries.set(objSeries.Id, objSeries);
      this.objChart_BarWithConn.bottomAxis().Labels.push("Section");

      //Populate the data series with this data
      let objVal: ChartData = new ChartData();
      objVal.x = 1;

      objVal.y = Number(
        Number(this.state.objTripSpeedData.bar2Data[0].X).toFixed(2)
      );

      objSeries.Data.push(objVal);

      //Check BanchMark Value if greater then Max value of Axis then set
      // let max = Math.max(
      //   ...this.state.objTripSpeedData.bar2Data.map((item) => item.X)
      // );
      // if (
      //   this.state.objUserSettings.objBenchMarks.TripSpeedWithConnection > max
      // ) {
      //   this.objChart_BarWithConn.leftAxis().AutoScale = false;
      //   this.objChart_BarWithConn.leftAxis().Max =
      //     this.state.objUserSettings.objBenchMarks.TripSpeedWithConnection +
      //     this.state.objUserSettings.objBenchMarks.TripSpeedWithConnection *
      //     0.1;
      // }



      this.objChart_BarWithConn.leftAxis().AutoScale = false;
      this.objChart_BarWithConn.leftAxis().Max = this.state.maxWithAndWOConn;

      this.objChart_BarWithConn.onBeforeSeriesDraw.subscribe((e, i) => {
        this.onBeforeDrawWithConnSeries(e, i);
      });

      this.objChart_BarWithConn.reDraw();
    } catch (error) { }
  }

  onBeforeDrawWOConnSeries = (e: ChartEventArgs, i: number) => {
    try {
      d3.select(".tripWO_benchmark").remove();

      let lnBenchMarkWOConn =
        this.state.objUserSettings.objBenchMarks.TripSpeedWOConnection;

      if (lnBenchMarkWOConn > 0) {
        let x1 = this.objChart_BarWOConn.__chartRect.left;
        let x2 = this.objChart_BarWOConn.__chartRect.right;
        let y1 = this.objChart_BarWOConn.leftAxis().ScaleRef(lnBenchMarkWOConn);
        let y2 = y1 + 4;

        this.objChart_BarWOConn.SVGRef.append("g")
          .attr("class", "tripWO_benchmark")
          .append("rect")
          .attr("id", "tripWO_benchmark")
          .attr("x", x1)
          .attr("y", y1)
          .attr("width", x2 - x1)
          .attr("height", y2 - y1)
          .style("fill", "#00A19D");

      }
    } catch (error) { }
  };

  onBeforeDrawWithConnSeries = (e: ChartEventArgs, i: number) => {
    try {
      d3.select(".tripWith_benchmark").remove();

      let lnBenchMarkWithConn =
        this.state.objUserSettings.objBenchMarks.TripSpeedWithConnection;
      //alert(lnBenchMarkWithConn);

      if (lnBenchMarkWithConn > 0) {
        // if (this.objChart_BarWithConn.leftAxis().Max < lnBenchMarkWithConn) {
        //     this.objChart_BarWithConn.leftAxis().Max = lnBenchMarkWithConn + lnBenchMarkWithConn * 0.10;
        //

        // }

        let x1 = this.objChart_BarWithConn.__chartRect.left;
        let x2 = this.objChart_BarWithConn.__chartRect.right;
        let y1 = this.objChart_BarWithConn
          .leftAxis()
          .ScaleRef(lnBenchMarkWithConn);
        let y2 = y1 + 4;

        this.objChart_BarWithConn.SVGRef.append("g")
          .attr("class", "tripWith_benchmark")
          .append("rect")
          .attr("id", "tripWith_benchmark")
          .attr("x", x1)
          .attr("y", y1)
          .attr("width", x2 - x1)
          .attr("height", y2 - y1)
          .style("fill", "#00A19D");

      }
    } catch (error) { }
  };

  loadConnections = () => {
    try {
      Util.StatusInfo("Getting data from the server  ");
      this.setState({
        //   isProcess: true,
        selectedTab: 0,
      });
      //this.forceUpdate();//Nishant Commented 06/09/2021

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "TripSpeedPlot";
      objBrokerRequest.Function = "TripSpeed1";

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

          let objData = JSON.parse(res.data.Response);


          console.log(objData);



          this.setState({
            WellName: objData.WellName,
            objTripSpeedData: objData,
            objUserSettings: objData.objUserSettings,
            //isProcess: false,
          });
          Util.StatusSuccess("Data successfully retrived");
          document.title = this.state.WellName + " -Trip Speed-1"; //Nishant 02/09/2021
        })
        .catch((error) => {
          // this.setState({
          //   isProcess: false,
          // });
          Util.StatusError(error.message);
          // this.forceUpdate();

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
      // Util.StatusSuccess("Data successfully retrived  ");
    } catch (error) { }
  };

  handleSelect = (e: any) => {
    this.setState({ selectedTab: e.selected });
  };

  render() {
    let loader = this.state.isProcess;

    // let rotateColor: string = this.getRigStateColor(0);
    // let slideColor: string = this.getRigStateColor(1);

    return (
      <div>
        <div className="row">
          <div className="col-lg-6">
            <label className="summaryTitle">{this.state.WellName}  </label>

            {/* {loader ? <ProcessLoader /> : ""} */}
          </div>
          <div className="col-lg-6">
            {/* <div className="float-right mr-2">
              <FontAwesomeIcon
                icon={faUndo}
                onClick={() => {
                  this.refreshChart();
                }}
              />
            </div> */}
            <div className="eVumaxPanelController" style={{ float: "right", width: this.objLogger.LogList.length > 0 ? "270px" : "180px" }}>

              <label className=" ml-0 mr-1" onClick={() => { this.refreshChart(); }} style={{ cursor: "pointer" }}>Undo Zoom</label>
              <FontAwesomeIcon icon={faSearchMinus} size="lg" onClick={() => { this.refreshChart(); }} />
              {this.objLogger.LogList.length > 0 && <><label className=" ml-2 mr-1" onClick={() => {
                this.objLogger.downloadFile();
              }} style={{ cursor: "pointer" }}>Download Log</label><FontAwesomeIcon icon={faListAlt} size="lg" onClick={() => {

                this.objLogger.downloadFile();

              }} /></>
              }
            </div>

          </div>
        </div>
        <div className="clearfix"></div>

        <div className="row">
          <TabStrip
            selected={this.state.selectedTab}
            onSelect={this.handleSelect}
          // keepTabsMounted={true}
          >
            <TabStripTab title="Trip Speed Summary">
              <div id="tabTripSpeedPlot">
                <div className="row">
                  <div id="Chart1">
                    <div
                      id="ChartTripSpeed"
                      style={{
                        height: "calc(70vh)",
                        minWidth: "500px",
                        width: "calc(30vw)",

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
                        display: "inline-block",
                      }}
                    ></div>
                  </div>
                  <div id="Chart2">
                    <div
                      id="BarWOConn"
                      style={{
                        height: "calc(70vh)",
                        width: "calc(30vw)",
                        // float: "left",
                        minWidth: "500px",
                        backgroundColor: "transparent",
                      }}
                    ></div>

                    <div
                      id="BarWOConn_legend"
                      style={{
                        textAlign: "center",
                        height: "40px",
                        width: "calc(30vw)",
                        backgroundColor: "transparent",
                        display: "inline-block",
                      }}
                    ></div>
                  </div>

                  <div id="Chart3">
                    <div
                      id="BarWithConn"
                      style={{
                        height: "calc(70vh)",
                        minWidth: "500px",
                        width: "calc(30vw)",
                        backgroundColor: "transparent",
                        // float: "right",
                        marginLeft: "10px",
                      }}
                    ></div>
                    <div
                      id="BarWithConn_legend"
                      style={{
                        textAlign: "center",
                        height: "40px",
                        width: "calc(30vw)",
                        backgroundColor: "transparent",
                        display: "inline-block",
                      }}
                    ></div>
                  </div>

                </div>
              </div>
            </TabStripTab>
            <TabStripTab title="Data Selection">
              <div
                id="tabDataSelection"
                style={{
                  height: "750px",
                  width: "calc(100vw - 90px)",
                  backgroundColor: "transparent",
                }}
              >
                {/* <TripAnalyzerSelection
                  {...this}
                  plotID="TripSpeed1"
                ></TripAnalyzerSelection> */}
                <TripAnalyzerSelection
                  WellID={this.WellId}
                  onSaveApply={this.loadConnections}
                  plotID="TripSpeed1"
                ></TripAnalyzerSelection>
              </div>
            </TabStripTab>
          </TabStrip>
        </div>
      </div>
    );
  }
}

export default TripSpeedPlot1;
