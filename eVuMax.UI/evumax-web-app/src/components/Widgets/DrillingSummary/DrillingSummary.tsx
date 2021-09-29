//https://julietonyekaoha.medium.com/react-cancel-all-axios-request-in-componentwillunmount-e5b2c978c071

import React, { Component } from "react";
import axios from "axios";
import {
  TabStripTab,
  TabStrip,
  Switch
} from "@progress/kendo-react-all";
import { Chart, lineStyle, curveStyle } from "../../../eVuMaxObjects/Chart/Chart";
import {
  DataSeries,
  dataSeriesType,
} from "../../../eVuMaxObjects/Chart/DataSeries";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import * as utilFunc from "../../../utilFunctions/utilFunctions";
import { axisLabelStyle, Axis } from "../../../eVuMaxObjects/Chart/Axis";

import moment from "moment";

import "./DrillingSummary.css";

import {
  Grid,
  GridColumn as Column,
  GridRow as Row,

} from "@progress/kendo-react-grid";
import GlobalMod from "../../../objects/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faListAlt, faSearchMinus, faUndo } from "@fortawesome/free-solid-svg-icons";
import { Util } from "../../../Models/eVuMax";

import DataSelector_ from "../../Common/DataSelector_";
import DataSelectorOriginal from "../../Common/DataSelectorOriginal";
import DataSelector from "../../Common/DataSelector";
import {ClientLogger} from "../../ClientLogger/ClientLogger";
import LogViewer from "../../ClientLogger/LogViewer";

let _gMod = new GlobalMod();

const headerlabel = {
  fontSize: "16px",
  fontWeights: "700",
  display: "inline-flex",
};

export class DrillingSummary extends Component {
  intervalID: NodeJS.Timeout | undefined;
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;


  }

LogList: ClientLogger[] = [];
  WellId: string = "";
  state = {
    showViewLogger:false,//Nishant 29-09-2021 NisPC
    selectionType: "-1",
    selected: 0,
    objDrlgSummary: {} as any,
    objSummaryData: {} as any,
    objNumericData: {} as any,
    objRigStateSummaryData: {} as any,
    objOffsetNumericData: {} as any,
    objRigStates: {} as any,
    objROPData: {} as any, //prath
    objROPDataOffset: {} as any,
    isProcess: false,
    grdNumericSummary: [] as any,
    grdOffsetNumericSummary: [] as any,
    isRealTime: false as boolean,
    objDataSelector: new DataSelector_(),
  };

  objChart: Chart;
  objChart2: Chart;
  objChart_Distance: Chart;
  objChart_Time: Chart;
  objChart_RigStateSummary: Chart;
  objChart_ROPLine: Chart;
  objChart_Pie1: Chart;
  objChart_Pie2: Chart;
  objChart_OffsetPie1: Chart;
  objChart_OffsetPie2: Chart;


  //Cancel all Axios Request
  AxiosSource = axios.CancelToken.source();
  AxiosConfig = { cancelToken: this.AxiosSource.token };

  componentWillUnmount() {
    this.AxiosSource.cancel();
    clearInterval(this.intervalID);
    this.intervalID = null;
  }
  //==============

  componentDidMount() {
    //initialize chart
    // if (this.state.isRealTime) {
    //   this.intervalID = setInterval(this.loadDrlgSummary.bind(this), 15000);
    // } else {
    //   clearInterval(this.intervalID);
    // }

     let objErrorLogger: ClientLogger= new ClientLogger();
    // objErrorLogger.SendLog(_gMod._userId,"Client Error test from DrillingSumary");
objErrorLogger.logMessage = "Component did Mount";
objErrorLogger.userName =  "Nishant User";
    this.LogList.push(objErrorLogger);

    this.initilizeCharts();



    this.setState({
      objChart_ROP: this.objChart,
    });


    this.loadDrlgSummary();
    window.addEventListener("resize", this.refreshChart);
  }

  componentDidUpdate() {
    try {
      this.refreshChart();

    } catch (error) { }
  }

  ////Nishant
  selectionChanged = async (paramDataSelector: DataSelector_, paramRefreshHrs: boolean = false) => {

    let realtimeStatus: boolean = paramRefreshHrs;

    await this.setState({
      objDataSelector: paramDataSelector,
      isRealTime: realtimeStatus
    });
    //alert(paramDataSelector.selectedval);
    this.selectionType = paramDataSelector.selectedval;
    this.fromDate = paramDataSelector.fromDate;
    this.toDate = paramDataSelector.toDate;
    this.fromDepth = paramDataSelector.fromDepth;
    this.toDepth = paramDataSelector.toDepth;
    this.refreshHrs = paramDataSelector.refreshHrs;


    if (this.state.isRealTime) {
      this.intervalID = setInterval(this.loadDrlgSummary.bind(this), 15000);
    } else {
      await this.AxiosSource.cancel();
      await clearInterval(this.intervalID);
      this.intervalID = null;
      this.loadDrlgSummary();
    }

  }


  // selectionChanged = (
  //   pselectedval: string,
  //   pfromDate: Date,
  //   ptoDate: Date,
  //   pfromDepth: number,
  //   ptoDepth: number,
  //   prefreshHrs: number
  // ) => {
  //   try {

  //     this.setState({ selectionType: pselectedval });
  //     this.selectionType = pselectedval;
  //     this.fromDate = pfromDate;
  //     this.toDate = ptoDate;
  //     this.fromDepth = pfromDepth;
  //     this.toDepth = ptoDepth;
  //     this.refreshHrs = prefreshHrs;
  //     //Nishant 13-09-2021
  //     this.setState({
  //       isRealTime: false
  //     });
  //     clearInterval(this.intervalID);
  //     this.forceUpdate();
  //     this.loadDrlgSummary();
  //   } catch (error) { }
  // };

  initilizeCharts = () => {
    this.objChart = new Chart(this, "ROP_RigState");
    this.objChart.ContainerId = "drlgSummary";
    this.objChart.Title = "ROP";
    this.objChart.leftAxis().AutoScale = true;
    this.objChart.leftAxis().Min = 0;
    this.objChart.leftAxis().Max = 100;
    this.objChart.leftAxis().Inverted = false;
    this.objChart.leftAxis().ShowLabels = true;
    this.objChart.leftAxis().ShowTitle = true;
    this.objChart.leftAxis().Title = "ROP";
    this.objChart.leftAxis().DisplayOrder = 1;
    this.objChart.leftAxis().Visible = true;
    this.objChart.leftAxis().PaddingMin = 0;
    this.objChart.leftAxis().PaddingMax = 15;

    this.objChart.bottomAxis().AutoScale = true;
    this.objChart.bottomAxis().bandScale = true;
    this.objChart.bottomAxis().Min = 100;
    this.objChart.bottomAxis().Max = 200;
    this.objChart.bottomAxis().Title = "Rig State";
    this.objChart.bottomAxis().ShowLabels = true;
    this.objChart.bottomAxis().ShowTitle = true;
    this.objChart.bottomAxis().LabelAngel = 90;
    this.objChart.bottomAxis().ShowSelector = true;
    this.objChart.bottomAxis().IsDateTime = false;
    this.objChart.bottomAxis().Visible = true;

    this.objChart.rightAxis().Visible = false;

    this.objChart.MarginLeft = 10;
    this.objChart.MarginBottom = 20;
    this.objChart.MarginTop = 20;
    this.objChart.MarginRight = 10;

    this.objChart.initialize();
    this.objChart.reDraw();

    //************************************************************ */
    this.objChart_Distance = new Chart(this, "Distance_RigState");
    this.objChart_Distance.ContainerId = "drlgSummary2";
    this.objChart_Distance.Title = "Distance Drilled";

    this.objChart_Distance.leftAxis().AutoScale = true;
    this.objChart_Distance.leftAxis().Min = 0;
    this.objChart_Distance.leftAxis().Max = 100;
    this.objChart_Distance.leftAxis().Inverted = false;
    this.objChart_Distance.leftAxis().ShowLabels = true;
    this.objChart_Distance.leftAxis().ShowTitle = true;
    this.objChart_Distance.leftAxis().Title = "ROP";
    this.objChart_Distance.leftAxis().DisplayOrder = 1;
    this.objChart_Distance.leftAxis().Visible = true;
    this.objChart_Distance.leftAxis().PaddingMin = 5;
    this.objChart_Distance.leftAxis().PaddingMax = 15;

    this.objChart_Distance.bottomAxis().AutoScale = true;
    this.objChart_Distance.bottomAxis().bandScale = true;
    this.objChart_Distance.bottomAxis().Min = 100;
    this.objChart_Distance.bottomAxis().Max = 200;
    this.objChart_Distance.bottomAxis().Title = "Rig State";
    this.objChart_Distance.bottomAxis().ShowLabels = true;
    this.objChart_Distance.bottomAxis().ShowTitle = true;
    this.objChart_Distance.bottomAxis().LabelAngel = 90;
    this.objChart_Distance.bottomAxis().ShowSelector = true;
    this.objChart_Distance.bottomAxis().IsDateTime = false;
    this.objChart_Distance.bottomAxis().Visible = true;

    this.objChart_Distance.rightAxis().ShowLabels = false;
    this.objChart_Distance.rightAxis().ShowTitle = false;
    this.objChart_Distance.rightAxis().Visible = false;
    this.objChart_Distance.rightAxis().ShowLabels = false;
    this.objChart_Distance.rightAxis().ShowTitle = false;

    this.objChart_Distance.MarginLeft = 20;
    this.objChart_Distance.MarginBottom = 20;
    this.objChart_Distance.MarginTop = 20;
    this.objChart_Distance.MarginRight = 10;

    this.objChart_Distance.initialize();
    this.objChart_Distance.reDraw();
    //*************************************************************** */

    this.objChart_Time = new Chart(this, "Time_RigState");
    this.objChart_Time.ContainerId = "drlgSummary3";

    this.objChart_Time.Title = "Time Drilled";

    this.objChart_Time.leftAxis().AutoScale = true;
    this.objChart_Time.leftAxis().Min = 0;
    this.objChart_Time.leftAxis().Max = 100;
    this.objChart_Time.leftAxis().Inverted = false;
    this.objChart_Time.leftAxis().ShowLabels = true;
    this.objChart_Time.leftAxis().ShowTitle = true;
    this.objChart_Time.leftAxis().Title = "Time";
    this.objChart_Time.leftAxis().DisplayOrder = 1;
    this.objChart_Time.leftAxis().Visible = true;
    this.objChart_Time.leftAxis().PaddingMin = 5;
    this.objChart_Time.leftAxis().PaddingMax = 15;

    this.objChart_Time.bottomAxis().AutoScale = true;
    this.objChart_Time.bottomAxis().bandScale = true;
    this.objChart_Time.bottomAxis().Min = 100;
    this.objChart_Time.bottomAxis().Max = 200;
    this.objChart_Time.bottomAxis().Title = "Rig State";
    this.objChart_Time.bottomAxis().ShowLabels = true;
    this.objChart_Time.bottomAxis().ShowTitle = true;
    this.objChart_Time.bottomAxis().LabelAngel = 90;
    this.objChart_Time.bottomAxis().ShowSelector = true;
    this.objChart_Time.bottomAxis().IsDateTime = false;
    this.objChart_Time.bottomAxis().Visible = true;

    this.objChart_Time.rightAxis().ShowLabels = false;
    this.objChart_Time.rightAxis().ShowTitle = false;
    this.objChart_Time.rightAxis().Visible = false;
    this.objChart_Time.rightAxis().ShowLabels = false;
    this.objChart_Time.rightAxis().ShowTitle = false;

    this.objChart_Time.MarginLeft = 20;
    this.objChart_Time.MarginBottom = 20;
    this.objChart_Time.MarginTop = 20;
    this.objChart_Time.MarginRight = 10;

    this.objChart_Time.initialize();
    this.objChart_Time.reDraw();

    //*************************************************************** */

    this.objChart_RigStateSummary = new Chart(this, "RigState_Summary");
    this.objChart_RigStateSummary.ContainerId = "ChartRigStateSummary";
    this.objChart_RigStateSummary.Title = "";

    this.objChart_RigStateSummary.leftAxis().AutoScale = true;
    this.objChart_RigStateSummary.leftAxis().Min = 0;
    this.objChart_RigStateSummary.leftAxis().Max = 100;
    this.objChart_RigStateSummary.leftAxis().Inverted = false;
    this.objChart_RigStateSummary.leftAxis().ShowLabels = true;
    this.objChart_RigStateSummary.leftAxis().ShowTitle = true;
    this.objChart_RigStateSummary.leftAxis().Title = "Percentage";
    this.objChart_RigStateSummary.leftAxis().DisplayOrder = 1;
    this.objChart_RigStateSummary.leftAxis().Visible = true;
    this.objChart_RigStateSummary.leftAxis().PaddingMax = 10;

    this.objChart_RigStateSummary.bottomAxis().AutoScale = true;
    this.objChart_RigStateSummary.bottomAxis().bandScale = true;
    this.objChart_RigStateSummary.bottomAxis().Min = 100;
    this.objChart_RigStateSummary.bottomAxis().Max = 200;
    this.objChart_RigStateSummary.bottomAxis().Title = "Rig State";
    this.objChart_RigStateSummary.bottomAxis().ShowLabels = true;
    this.objChart_RigStateSummary.bottomAxis().ShowTitle = true;
    this.objChart_RigStateSummary.bottomAxis().LabelAngel = 0;
    this.objChart_RigStateSummary.bottomAxis().ShowSelector = true;
    this.objChart_RigStateSummary.bottomAxis().IsDateTime = false;
    this.objChart_RigStateSummary.bottomAxis().Visible = true;

    this.objChart_RigStateSummary.rightAxis().ShowLabels = false;
    this.objChart_RigStateSummary.rightAxis().ShowTitle = false;
    this.objChart_RigStateSummary.rightAxis().Visible = false;
    this.objChart_RigStateSummary.rightAxis().ShowLabels = false;
    this.objChart_RigStateSummary.rightAxis().ShowTitle = false;

    this.objChart_RigStateSummary.MarginLeft = 10;
    this.objChart_RigStateSummary.MarginBottom = 80;
    this.objChart_RigStateSummary.MarginTop = 10;
    this.objChart_RigStateSummary.MarginRight = 10;

    this.objChart_RigStateSummary.initialize();
    this.objChart_RigStateSummary.reDraw();

    //=========ROP Line Chart

    //initialize chart
    this.objChart_ROPLine = new Chart(this, "ROPLine_Chart");
    this.objChart_ROPLine.ContainerId = "roplinechart";
    // this.objChart_ROPLine.Title = "";

    this.objChart_ROPLine.leftAxis().AutoScale = true;

    this.objChart_ROPLine.leftAxis().Inverted = false;
    this.objChart_ROPLine.leftAxis().ShowLabels = true;
    this.objChart_ROPLine.leftAxis().ShowTitle = false;
    this.objChart_ROPLine.leftAxis().Title = "ROP";

    this.objChart_ROPLine.bottomAxis().AutoScale = true;
    this.objChart_ROPLine.bottomAxis().IsDateTime = false;

    this.objChart_ROPLine.bottomAxis().Title = "Depth / Date Time";
    this.objChart_ROPLine.bottomAxis().ShowLabels = true;
    this.objChart_ROPLine.bottomAxis().ShowTitle = false;
    this.objChart_ROPLine.bottomAxis().LabelAngel = 90;
    this.objChart_ROPLine.bottomAxis().ShowSelector = false;

    this.objChart_ROPLine.rightAxis().Visible = false;
    this.objChart_ROPLine.rightAxis().ShowLabels = false;

    this.objChart_ROPLine.MarginLeft = 20;
    this.objChart_ROPLine.MarginBottom = 10;
    this.objChart_ROPLine.MarginTop = 10;
    this.objChart_ROPLine.MarginRight = 10;

    this.objChart_ROPLine.initialize();
    this.objChart_ROPLine.reDraw();

    //=================================

    //initialize chart Pie Chart
    this.objChart_Pie1 = new Chart(this, "Pie_Chart1", true);
    this.objChart_Pie1.ContainerId = "piechart1";
    //this.objChart_Pie1.Title = "PRATH CHART";

    this.objChart_Pie1.MarginLeft = 0;
    this.objChart_Pie1.MarginBottom = 0;
    this.objChart_Pie1.MarginTop = 0;
    this.objChart_Pie1.MarginRight = 0;

    this.objChart_Pie1.initialize();
    this.objChart_Pie1.reDraw();

    //========================================================

    this.objChart_Pie2 = new Chart(this, "Pie_Chart2", true);
    this.objChart_Pie2.ContainerId = "piechart2";

    this.objChart_Pie2.MarginLeft = 0;
    this.objChart_Pie2.MarginBottom = 0;
    this.objChart_Pie2.MarginTop = 0;
    this.objChart_Pie2.MarginRight = 0;

    this.objChart_Pie2.initialize();
    this.objChart_Pie2.reDraw();

    //initialize chart Pie Chart
    this.objChart_OffsetPie1 = new Chart(this, "OffsetPie_Chart1", true);
    this.objChart_OffsetPie1.ContainerId = "offsetpiechart1";

    this.objChart_OffsetPie1.MarginLeft = 0;
    this.objChart_OffsetPie1.MarginBottom = 0;
    this.objChart_OffsetPie1.MarginTop = 0;
    this.objChart_OffsetPie1.MarginRight = 0;

    this.objChart_OffsetPie1.initialize();
    this.objChart_OffsetPie1.reDraw();

    //initialize chart Pie Chart
    this.objChart_OffsetPie2 = new Chart(this, "OffsetPie_Chart2", true);
    this.objChart_OffsetPie2.ContainerId = "offsetpiechart2";

    this.objChart_OffsetPie2.MarginLeft = 0;
    this.objChart_OffsetPie2.MarginBottom = 0;
    this.objChart_OffsetPie2.MarginTop = 0;
    this.objChart_OffsetPie2.MarginRight = 0;

    this.objChart_OffsetPie2.initialize();
    this.objChart_OffsetPie2.reDraw();
  };

  refreshROPLineChart = () => {
    try {

      // this.objChart_ROPLine = new Chart(this, "ROPLine_Chart");
      // this.objChart_ROPLine.ContainerId = "roplinechart";
      this.objChart_ROPLine.initialize();
      this.objChart_ROPLine.LegendPosition = 3;  //1 (left), 2 (right), 3 (top), 4 (bottom)
      this.objChart_ROPLine.DataSeries.clear();
      this.objChart_ROPLine.updateChart();

      this.objChart_ROPLine.leftAxis().AutoScale = true;

      this.objChart_ROPLine.leftAxis().Inverted = false;
      this.objChart_ROPLine.leftAxis().ShowLabels = true;
      this.objChart_ROPLine.leftAxis().ShowTitle = true;
      this.objChart_ROPLine.leftAxis().Title =
        "ROP (" + this.state.objSummaryData.DepthUnit + "/hr)";

      this.objChart_ROPLine.bottomAxis().AutoScale = true;
      this.objChart_ROPLine.bottomAxis().IsDateTime = false;

      this.objChart_ROPLine.bottomAxis().Title =
        "Depth (" + this.state.objSummaryData.DepthUnit + ")";
      this.objChart_ROPLine.bottomAxis().ShowLabels = true;
      this.objChart_ROPLine.bottomAxis().ShowTitle = true;
      this.objChart_ROPLine.bottomAxis().LabelAngel = 0;
      this.objChart_ROPLine.bottomAxis().ShowSelector = false;
      this.objChart_ROPLine.bottomAxis().Labels = [];
      this.objChart_ROPLine.bottomAxis().LabelStyle =
        axisLabelStyle.values;
      this.objChart_ROPLine.bottomAxis().bandScale = false;
      this.objChart_ROPLine.bottomAxis().PaddingMax = 0;
      this.objChart_ROPLine.bottomAxis().bandScale = false;


      this.objChart_ROPLine.rightAxis().Visible = false;
      this.objChart_ROPLine.rightAxis().ShowLabels = false;

      this.objChart_ROPLine.MarginLeft = 80;
      this.objChart_ROPLine.MarginBottom = 60;
      this.objChart_ROPLine.MarginTop = 5;
      this.objChart_ROPLine.MarginRight = 10;

      let objROPLine = new DataSeries();
      objROPLine.Id = "ROPlineSeries";
      objROPLine.Name = "ROP";
      objROPLine.XAxisId = this.objChart_ROPLine.bottomAxis().Id;
      objROPLine.YAxisId = this.objChart_ROPLine.leftAxis().Id;
      objROPLine.Type = dataSeriesType.Line;
      //objROPLine.PointStyle = pointStyle.Circle;
      objROPLine.Title = "ROP";
      objROPLine.Color = "#1762ad";
      objROPLine.LineStyle = lineStyle.solid;
      objROPLine.LineWidth = 2;
      //objROPLine.CurveStyle = curveStyle.normal;
      objROPLine.ShowInLegend = true;

      this.objChart_ROPLine.DataSeries.set(objROPLine.Id, objROPLine);

      //Populate the data series with this data
      objROPLine.Data.slice(0, objROPLine.Data.length);

      //  console.log(this.state.objSummaryData.ROPData);

      // Util.StatusSuccess("Last Depth retrived  " + this.state.objSummaryData.ROPData[this.state.objSummaryData.ROPData.length - 1].X);
      // Util.StatusReady();

      for (let i = 0; i < this.state.objSummaryData.ROPData.length; i++) {
        let objVal: ChartData = new ChartData();

        const element = this.state.objSummaryData.ROPData[i];
        let lblString: string = element.Y + "#" + element.DATE_TIME.split(" ")[0] + "#" + element.DATE_TIME.split(" ")[1];
        let strArr = lblString.split("#");

        lblString = strArr[0] + "~" + strArr[1] + "~" + strArr[2];
        objVal.label = strArr[0];


        objVal.x = this.state.objROPData[i].Y; //Depth  //new Date(Date.parse(paramData[i]["DATETIME1"]));
        objVal.y = this.state.objROPData[i].X; //ROP

        this.objChart_ROPLine.bottomAxis().Labels.push(lblString);


        objROPLine.Data.push(objVal);
      }




      //Populate the data series with this data
      objROPLine.Data.slice(0, objROPLine.Data.length);


      //offset well
      if (this.state.objSummaryData.ROPDataOffset.length > 0) {
        objROPLine = new DataSeries();
        objROPLine.Id = "ROPOffsetlineSeries";
        objROPLine.Name = "ROP-Offset";
        objROPLine.XAxisId = this.objChart_ROPLine.bottomAxis().Id;
        objROPLine.YAxisId = this.objChart_ROPLine.leftAxis().Id;
        objROPLine.Type = dataSeriesType.Line;
        objROPLine.Title = "ROP (Offset)";
        objROPLine.Color = "#FF0000";
        objROPLine.LineStyle = lineStyle.solid;
        objROPLine.LineWidth = 2;
        objROPLine.CurveStyle = curveStyle.normal;

        objROPLine.ShowInLegend = true;

        this.objChart_ROPLine.DataSeries.set(objROPLine.Id, objROPLine);


        for (let i = 0; i < this.state.objSummaryData.ROPDataOffset.length; i++) {
          let objVal: ChartData = new ChartData();
          //objVal.datetime = new Date(Date.parse(paramData[i]["DATETIME1"]));
          objVal.x = this.state.objROPDataOffset[i].Y; //Depth  //new Date(Date.parse(paramData[i]["DATETIME1"]));
          objVal.y = this.state.objROPDataOffset[i].X; //ROP
          objROPLine.Data.push(objVal);
        }
      }

      this.objChart_ROPLine.drawLegend();

      this.objChart_ROPLine.reDraw();
    } catch (error) { }
  };
  refreshRigStateSummaryChart = () => {
    try {
      this.objChart_RigStateSummary.initialize();

      //Clear all the series
      this.objChart_RigStateSummary.DataSeries.clear();
      this.objChart_RigStateSummary.updateChart();

      // // //Configure Axes
      this.objChart_RigStateSummary.leftAxis().Inverted = false;
      this.objChart_RigStateSummary.leftAxis().AutoScale = true;
      this.objChart_RigStateSummary.leftAxis().Title =
        "Distance (" + this.state.objSummaryData.DepthUnit + ")";
      this.objChart_RigStateSummary.leftAxis().ShowSelector = false;
      //this.objChart_RigStateSummary.leftAxis().ShowLabels = false;

      this.objChart_RigStateSummary.bottomAxis().AutoScale = true;
      this.objChart_RigStateSummary.bottomAxis().Title = "Rig States";
      this.objChart_RigStateSummary.bottomAxis().LabelAngel = 0; //bottom axis angle
      this.objChart_RigStateSummary.bottomAxis().ShowSelector = false;
      this.objChart_RigStateSummary.bottomAxis().ShowLabels = true;
      this.objChart_RigStateSummary.bottomAxis().LabelStyle = axisLabelStyle.labels;
      this.objChart_RigStateSummary.bottomAxis().bandScale = true;
      this.objChart_RigStateSummary.bottomAxis().LabelMultiline = true; //

      this.objChart_RigStateSummary.bottomAxis().Labels = [];

      this.objChart_RigStateSummary.rightAxis().ShowLabels = false;
      this.objChart_RigStateSummary.rightAxis().ShowTitle = false;
      this.objChart_RigStateSummary.rightAxis().Visible = false;
      this.objChart_RigStateSummary.rightAxis().ShowLabels = false;
      this.objChart_RigStateSummary.rightAxis().ShowTitle = false;

      //Add new serieses

      // rigStateSummaryData: Array(17)
      // 0:
      // COLOR: "#00FF00"
      // COUNTER: 1
      // PERCENTAGE: 44.4280515392938
      // TEXT_LABEL: "Rotary Drill
      // ↵[44.43 %]
      // ↵[3: 3]"

      let objSeries = new DataSeries();
      objSeries.Id = "RigState-"; // + index;
      objSeries.Stacked = true;
      objSeries.ShowLabelOnSeries = true; //Parth 05-10-2020

      objSeries.Title = "";
      objSeries.Type = dataSeriesType.Bar;
      // objSeries.Color = element.COLOR; // this.getRigStateColor(0); //  "#1089ff";
      objSeries.ColorEach = true; //prath
      objSeries.XAxisId = this.objChart_RigStateSummary.bottomAxis().Id;
      objSeries.YAxisId = this.objChart_RigStateSummary.leftAxis().Id;

      for (
        let index = 0;
        index < this.state.objRigStateSummaryData.length;
        index++
      ) {
        const element = this.state.objRigStateSummaryData[index];

        this.objChart_RigStateSummary.DataSeries.set(objSeries.Id, objSeries);


        let lblString: string = element.TEXT_LABEL;
        let strArr = lblString.split("#");

        //Fill up the data for data series
        let objDataPoint = new ChartData();
        objDataPoint.x = index;

        //objDataPoint.y = eval(formatNumber(element.PERCENTAGE, "n2"));
        objDataPoint.y = eval((element.PERCENTAGE).toFixed(2));
        objDataPoint.color = element.COLOR;
        objDataPoint.label = strArr[0];

        lblString = strArr[0] + "~" + strArr[1] + "~" + strArr[2];

        // lblString = strArr[0] + "<h1>" + strArr[1] + "<h1>" + strArr[2];

        this.objChart_RigStateSummary.bottomAxis().Labels.push(lblString);

        objSeries.Data.push(objDataPoint);
      }

      this.objChart_RigStateSummary.reDraw();

      //console.log("Labels", this.objChart_RigStateSummary.bottomAxis().Labels);
    } catch (error) {
      console.log(error);
    }
  };

  refreshDistanceChart = () => {
    try {
      this.objChart_Distance.initialize();

      //Clear all the series
      this.objChart_Distance.DataSeries.clear();
      this.objChart_Distance.updateChart();

      // //Configure Axes
      this.objChart_Distance.leftAxis().Inverted = false;
      this.objChart_Distance.leftAxis().AutoScale = true;
      this.objChart_Distance.leftAxis().Title =
        "Distance (" + this.state.objSummaryData.DepthUnit + ")";
      this.objChart_Distance.leftAxis().ShowSelector = false;

      this.objChart_Distance.bottomAxis().AutoScale = true;
      this.objChart_Distance.bottomAxis().Title = "Rig States";
      this.objChart_Distance.bottomAxis().LabelAngel = 0;
      this.objChart_Distance.bottomAxis().ShowSelector = false;
      this.objChart_Distance.bottomAxis().LabelStyle = axisLabelStyle.labels;

      this.objChart_Distance.bottomAxis().Labels = [];

      this.objChart_Distance.rightAxis().ShowLabels = false;
      this.objChart_Distance.rightAxis().ShowTitle = false;
      this.objChart_Distance.rightAxis().Visible = false;
      this.objChart_Distance.rightAxis().ShowLabels = false;
      this.objChart_Distance.rightAxis().ShowTitle = false;

      //Add new serieses

      let objDistance = new DataSeries();
      objDistance.Id = "Distance";
      objDistance.Stacked = true;
      objDistance.ShowLabelOnSeries = true;

      objDistance.Title = "Distance";
      objDistance.Type = dataSeriesType.Bar;
      objDistance.Color = this.getRigStateColor(0); //  "#1089ff";
      objDistance.XAxisId = this.objChart_Distance.bottomAxis().Id;
      objDistance.YAxisId = this.objChart_Distance.leftAxis().Id;
      objDistance.ColorEach = true;
      this.objChart_Distance.DataSeries.set(objDistance.Id, objDistance);

      //Fill up the data for data series
      let objDistancePoint = new ChartData();
      objDistancePoint.x = 0;
      objDistancePoint.y = eval(this.state.objSummaryData.RotaryFootage);
      objDistancePoint.color = this.getRigStateColor(0);
      objDistancePoint.labelX = "Rotary";
      objDistance.Data.push(objDistancePoint);

      this.objChart_Distance.bottomAxis().Labels.push("Rotary");

      //Fill up the data for data series
      objDistancePoint = new ChartData();
      objDistancePoint.x = 1;
      objDistancePoint.y = eval(this.state.objSummaryData.RotaryFootageOffset);
      objDistancePoint.color = this.getRigStateColor(0);
      objDistancePoint.labelX = "Rotary Offset";
      objDistance.Data.push(objDistancePoint);
      this.objChart_Distance.bottomAxis().Labels.push("Rotary Offset");

      //Fill up the data for data series
      objDistancePoint = new ChartData();
      objDistancePoint.x = 2;
      objDistancePoint.y = eval(this.state.objSummaryData.SlideFootage);
      objDistancePoint.color = this.getRigStateColor(1);
      objDistancePoint.labelX = "Slide";
      objDistance.Data.push(objDistancePoint);
      this.objChart_Distance.bottomAxis().Labels.push("Slide");

      //Fill up the data for data series
      objDistancePoint = new ChartData();
      objDistancePoint.x = 3;

      //objDistancePoint.y = eval(formatNumber(this.state.objSummaryData.SlideFootageOffset, "n2"));
      objDistancePoint.y = eval((this.state.objSummaryData.SlideFootageOffset).toFixed(2));
      objDistancePoint.color = this.getRigStateColor(1);
      objDistancePoint.labelX = "Slide Offset";
      objDistance.Data.push(objDistancePoint);
      this.objChart_Distance.bottomAxis().Labels.push("Slide Offset");

      this.objChart_Distance.reDraw();
    } catch (error) { }
  };

  refreshROPChart = () => {
    try {
      this.objChart.initialize();

      //Clear all the series
      this.objChart.DataSeries.clear();
      this.objChart.updateChart();

      //Configure Axes
      this.objChart.leftAxis().Inverted = false;
      this.objChart.leftAxis().AutoScale = true;
      this.objChart.leftAxis().Title =
        "ROP (" + this.state.objSummaryData.DepthUnit + "/hr)";
      this.objChart.leftAxis().ShowSelector = false;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().Title = "Rig States";
      this.objChart.bottomAxis().LabelAngel = 0;
      this.objChart.bottomAxis().ShowSelector = false;
      this.objChart.bottomAxis().LabelStyle = axisLabelStyle.labels;
      this.objChart.bottomAxis().Labels = [];

      this.objChart.rightAxis().ShowLabels = false;
      this.objChart.rightAxis().ShowTitle = false;
      this.objChart.rightAxis().Visible = false;
      this.objChart.rightAxis().ShowLabels = false;
      this.objChart.rightAxis().ShowTitle = false;

      //Add new serieses
      let objROP = new DataSeries();
      objROP.Id = "ROP";
      objROP.Stacked = true;
      objROP.ShowLabelOnSeries = true;

      objROP.Title = "ROP";
      objROP.Type = dataSeriesType.Bar;
      objROP.Color = this.getRigStateColor(0); //  "#1089ff";
      objROP.XAxisId = this.objChart.bottomAxis().Id;
      objROP.YAxisId = this.objChart.leftAxis().Id;
      objROP.ColorEach = true;
      this.objChart.DataSeries.set(objROP.Id, objROP);

      //Fill up the data for data series
      let objROPPoint = new ChartData();
      objROPPoint.x = 0;
      objROPPoint.y = eval(this.state.objSummaryData.RotaryROP);// this.state.objNumericData.ROP_Rotary
      objROPPoint.labelX = "Rotary";
      objROPPoint.color = this.getRigStateColor(0);
      this.objChart.bottomAxis().Labels.push("Rotary");

      objROP.Data.push(objROPPoint);

      //Offset well
      objROPPoint = new ChartData();
      objROPPoint.x = 1;
      objROPPoint.y = eval((this.state.objSummaryData.RotaryROPOffset).toFixed(2));// this.state.objOffsetNumericData.ROP_Rotary
      objROPPoint.labelX = "Rotary Offset";
      objROPPoint.color = this.getRigStateColor(0);
      objROP.Data.push(objROPPoint);
      this.objChart.bottomAxis().Labels.push("Rotary Offset");

      //Fill up the data for data series
      objROPPoint = new ChartData();
      objROPPoint.x = 2;
      objROPPoint.y = eval(this.state.objSummaryData.SlideROP); //Nis
      objROPPoint.color = this.getRigStateColor(1);
      objROPPoint.labelX = "Slide";
      objROP.Data.push(objROPPoint);
      this.objChart.bottomAxis().Labels.push("Slide");

      //offset well


      objROPPoint = new ChartData();
      objROPPoint.x = 4;
      objROPPoint.y = eval((this.state.objSummaryData.SlideROPOffset).toFixed(2));
      objROPPoint.labelX = "Slide Offset";
      objROPPoint.color = this.getRigStateColor(1);
      this.objChart.bottomAxis().Labels.push("Slide Offset");

      objROP.Data.push(objROPPoint);

      this.objChart.reDraw();
    } catch (error) { }
  };

  refreshTimeChart = () => {
    try {
      this.objChart_Time.initialize();

      //Clear all the series
      this.objChart_Time.DataSeries.clear();
      this.objChart_Time.updateChart();

      //Configure Axes
      this.objChart_Time.leftAxis().Inverted = false;
      this.objChart_Time.leftAxis().AutoScale = true;
      this.objChart_Time.leftAxis().Title = "Time (Hr)";
      this.objChart_Time.leftAxis().ShowSelector = false;
      this.objChart_Time.leftAxis().Visible = true;
      this.objChart_Time.leftAxis().ShowLabels = true;

      this.objChart_Time.bottomAxis().AutoScale = true;
      this.objChart_Time.bottomAxis().Title = "Rig States";
      this.objChart_Time.bottomAxis().LabelAngel = 0;
      this.objChart_Time.bottomAxis().ShowSelector = false;
      this.objChart_Time.bottomAxis().LabelStyle = axisLabelStyle.labels;

      this.objChart_Time.bottomAxis().Labels = [];

      this.objChart_Time.rightAxis().ShowLabels = false;
      this.objChart_Time.rightAxis().ShowTitle = false;
      this.objChart_Time.rightAxis().Visible = false;
      this.objChart_Time.rightAxis().ShowLabels = false;
      this.objChart_Time.rightAxis().ShowTitle = false;

      //Add new serieses

      let objTime = new DataSeries();
      objTime.Id = "Time";
      objTime.Stacked = true;
      objTime.ShowLabelOnSeries = true;
      objTime.Title = "Time";
      objTime.Type = dataSeriesType.Bar;
      objTime.Color = this.getRigStateColor(0); //  "#1089ff";
      objTime.XAxisId = this.objChart_Time.bottomAxis().Id;
      objTime.YAxisId = this.objChart_Time.leftAxis().Id;
      objTime.ColorEach = true;


      this.objChart_Time.DataSeries.set(objTime.Id, objTime);

      //Fill up the data for data series
      let objROPPoint = new ChartData();

      objROPPoint.x = 0;
      objROPPoint.y = Number(
        Number(this.state.objSummaryData.RotaryTime / (60 * 60)).toFixed(2)
      ); // in hrs;
      objROPPoint.labelX = "Rotary";
      objROPPoint.labelY = utilFunc.convertSecondsToDayHrsMin(this.state.objSummaryData.RotaryTime);
      objROPPoint.color = this.getRigStateColor(0);
      objTime.Data.push(objROPPoint);
      this.objChart_Time.bottomAxis().Labels.push("Rotary");

      // //Offset well
      objROPPoint = new ChartData();
      objROPPoint.x = 1;
      objROPPoint.y = Number(
        Number(this.state.objSummaryData.RotaryTimeOffset / (60 * 60)).toFixed(
          2
        )
      ); // in hrs;
      objROPPoint.labelX = "Rotary Offset";
      objROPPoint.labelY = utilFunc.convertSecondsToDayHrsMin(this.state.objSummaryData.RotaryTimeOffset);
      objROPPoint.color = this.getRigStateColor(0);
      this.objChart_Time.bottomAxis().Labels.push("Rotary Offset");
      objTime.Data.push(objROPPoint);



      //Slide Time 
      //Fill up the data for data series
      objROPPoint = new ChartData();
      objROPPoint.x = 2;
      objROPPoint.y = Number(
        Number(this.state.objSummaryData.SlideTime / (60 * 60)).toFixed(2)
      ); // in hrs;
      objROPPoint.labelX = "Slide";
      objROPPoint.labelY = utilFunc.convertSecondsToDayHrsMin(this.state.objSummaryData.SlideTime);

      objROPPoint.color = this.getRigStateColor(1);
      objTime.Data.push(objROPPoint);
      this.objChart_Time.bottomAxis().Labels.push("Slide");

      //offset well
      objROPPoint = new ChartData();
      objROPPoint.x = 3;
      objROPPoint.y = Number(
        Number(this.state.objSummaryData.SlideTimeOffset / (60 * 60)).toFixed(2)
      ); // in hrs;
      objROPPoint.labelX = "Slide Offset";
      objROPPoint.labelY = utilFunc.convertSecondsToDayHrsMin(this.state.objSummaryData.SlideTimeOffset);

      objROPPoint.color = this.getRigStateColor(1);
      this.objChart_Time.bottomAxis().Labels.push("Slide Offset");

      objTime.Data.push(objROPPoint);
      this.objChart_Time.reDraw();
    } catch (error) { }
  };

  refreshChart = () => {
    try {
      //alert("refresh chart");
      this.refreshROPChart();
      this.refreshDistanceChart();
      this.refreshTimeChart();

      this.refreshRigStateSummaryChart();

      this.refreshROPLineChart();
      this.refreshPieChart1();
      this.refreshPieChart2();

      this.refreshOffsetPieChart1();
      this.refreshOffsetPieChart2();
    } catch (error) { }
  };

  refreshPieChart1 = () => {
    this.objChart_Pie1.initialize();

    //Clear all the series
    this.objChart_Pie1.DataSeries.clear();

    //this.objChart_Pie1.Axes = new Map<string, Axis>();
    this.objChart_Pie1.updateChart();

    //Add new serieses

    let objPieSeries = new DataSeries();
    objPieSeries.Id = "PieSeries1";
    objPieSeries.Stacked = false;

    objPieSeries.Title = "Rotary Vs Drilling";
    objPieSeries.Type = dataSeriesType.Pie;

    this.objChart_Pie1.DataSeries.set(objPieSeries.Id, objPieSeries);

    //Fill up the data for data series
    let objPieData1 = new ChartData();
    objPieData1.y = eval(this.state.objSummaryData.RotaryTimePercent);
    objPieData1.label = "RotaryTime: " + objPieData1.y + "%";
    objPieData1.color = this.getRigStateColor(0);
    objPieSeries.Data.push(objPieData1);

    //Fill up the data for data series
    objPieData1 = new ChartData();
    objPieData1.y = eval(this.state.objSummaryData.SlideTimePercent);
    objPieData1.label = "SlideTime: " + objPieData1.y + "%";

    objPieData1.color = this.getRigStateColor(1);
    objPieSeries.Data.push(objPieData1);

    this.objChart_Pie1.reDraw();
  };

  refreshPieChart2 = () => {
    this.objChart_Pie2.initialize();

    //Clear all the series
    this.objChart_Pie2.DataSeries.clear();

    //this.objChart_Pie2.Axes = new Map<string, Axis>();
    this.objChart_Pie2.updateChart();

    //Add new serieses

    let objPieSeries = new DataSeries();
    objPieSeries.Id = "PieSeries2";
    objPieSeries.Stacked = false;

    objPieSeries.Title = "Rotary Vs Drilling";
    objPieSeries.Type = dataSeriesType.Pie;

    this.objChart_Pie2.DataSeries.set(objPieSeries.Id, objPieSeries);

    //Fill up the data for data series
    let objPieData2 = new ChartData();
    objPieData2.y = eval(this.state.objSummaryData.DrillingTimePercent);
    objPieData2.label = "DrlgTime: " + objPieData2.y + "%";
    objPieData2.color = "green"; //this.getRigStateColor(0);
    objPieSeries.Data.push(objPieData2);

    //Fill up the data for data series
    objPieData2 = new ChartData();
    objPieData2.y = eval(this.state.objSummaryData.NonDrillingTimePercent);
    objPieData2.label = "NonDrlgTime: " + objPieData2.y + "%";

    objPieData2.color = "blue"; //this.getRigStateColor(1);
    objPieSeries.Data.push(objPieData2);

    this.objChart_Pie2.reDraw();
  };

  refreshOffsetPieChart1 = () => {
    this.objChart_OffsetPie1.initialize();

    //Clear all the series
    this.objChart_OffsetPie1.DataSeries.clear();

    //  this.objChart_OffsetPie1.Axes = new Map<string, Axis>();
    this.objChart_OffsetPie1.updateChart();

    //Add new serieses

    let objPieSeries = new DataSeries();
    objPieSeries.Id = "OffsetPieSeries1";
    objPieSeries.Stacked = false;

    objPieSeries.Title = "Rotary Vs Drilling";
    objPieSeries.Type = dataSeriesType.Pie;

    this.objChart_OffsetPie1.DataSeries.set(objPieSeries.Id, objPieSeries);

    //Fill up the data for data series
    let objPieData1 = new ChartData();
    objPieData1.y = eval(this.state.objSummaryData.OffsetRotaryTimePercent);
    objPieData1.label = "RotaryTime: " + objPieData1.y + "%";

    objPieData1.color = this.getRigStateColor(0);
    objPieSeries.Data.push(objPieData1);

    //Fill up the data for data series
    objPieData1 = new ChartData();
    objPieData1.y = eval(this.state.objSummaryData.OffsetSlideTimePercent);
    objPieData1.label = "SlideTime: " + objPieData1.y + "%";

    objPieData1.color = this.getRigStateColor(1);
    objPieSeries.Data.push(objPieData1);

    this.objChart_OffsetPie1.reDraw();
  };

  refreshOffsetPieChart2 = () => {
    this.objChart_OffsetPie2.initialize();

    //Clear all the series
    this.objChart_OffsetPie2.DataSeries.clear();

    //this.objChart_OffsetPie2.Axes = new Map<string, Axis>();
    this.objChart_OffsetPie2.updateChart();

    //Add new serieses

    let objPieSeries = new DataSeries();
    objPieSeries.Id = "OffsetPieSeries2";
    objPieSeries.Stacked = false;

    objPieSeries.Title = "Drilling Vs Non-Drilling";
    objPieSeries.Type = dataSeriesType.Pie;

    this.objChart_OffsetPie2.DataSeries.set(objPieSeries.Id, objPieSeries);

    //Fill up the data for data series
    let objPieData1 = new ChartData();
    objPieData1.y = eval(this.state.objSummaryData.OffsetDrillingTimePercent);
    objPieData1.label = "RotaryTime: " + objPieData1.y + "%";

    objPieData1.color = "green";
    objPieSeries.Data.push(objPieData1);

    //Fill up the data for data series
    objPieData1 = new ChartData();
    objPieData1.y = eval(
      this.state.objSummaryData.OffsetNonDrillingTimePercent
    );
    objPieData1.label = "SlideTime: " + objPieData1.y + "%";

    objPieData1.color = "blue";
    objPieSeries.Data.push(objPieData1);

    this.objChart_OffsetPie2.reDraw();
  };
  handleSelect = (e: any) => {
    this.setState({ selected: e.selected });
  };

  handleToggleSwitch = async () => {

    await this.setState({ isRealTime: !this.state.isRealTime });


    if (this.state.isRealTime) {
      this.intervalID = setInterval(this.loadDrlgSummary.bind(this), 15000);
    } else {
      await this.AxiosSource.cancel();
      await clearInterval(this.intervalID);
      this.intervalID = null;
      this.loadDrlgSummary();
    }
  };

  selectionType: string = "-1"; //"-1 Default,0= DateRange and 1 = Depth Range"
  fromDate: Date = null;
  toDate: Date = null;
  fromDepth: number = 0;
  toDepth: number = 0;
  refreshHrs: number = 24;
  //************** */

  //objPieDrilling1: DataSeries;

  getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  // componentDidMount() {
  //   //this.PieDrilling1();
  //   this.loadDrlgSummary();
  // }

  // PieDrilling1 = () => {
  //   try {
  //     //initialize chart

  //     this.objChart = new Chart(null, "PieDrilling1");
  //     this.objChart.ContainerId = "Container-PieDrilling1";

  //     this.objChart.MarginLeft = 10;
  //     this.objChart.MarginBottom = 10;
  //     this.objChart.MarginTop = 10;
  //     this.objChart.MarginRight = 10;

  //     this.objPieDrilling1 = new DataSeries();
  //     this.objPieDrilling1.Id =
  //       "s" + this.getRandomNumber(100000, 999999).toString();
  //     this.objPieDrilling1.Name = "Drilling Summary";
  //     this.objPieDrilling1.Type = dataSeriesType.Bar;

  //     this.objChart.DataSeries.set(
  //       this.objPieDrilling1.Id,
  //       this.objPieDrilling1
  //     );

  //     this.objChart.initialize();
  //     this.objChart.updateChart();
  //     this.loadConnections();
  //   } catch (error) {}
  // };

  loadDrlgSummary = () => {
    try {
      //alert("loadDrlgSumm");
      Util.StatusInfo("Getting data from server   ");
      this.setState({
        isProcess: true,
      });


      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "DrlgSummary";
      objBrokerRequest.Function = "DrlgSummary";

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
      //this.selectionType = "-1";

      let paramSelectionType: BrokerParameter = new BrokerParameter(
        "SelectionType",
        this.selectionType
      );
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

      let paramIsRealTime: BrokerParameter = new BrokerParameter("isRealTime", this.state.isRealTime.toString());
      objBrokerRequest.Parameters.push(paramIsRealTime);

      let paramRefreshHrs: BrokerParameter = new BrokerParameter(
        "refreshHrs", this.refreshHrs.toString()
      );
      objBrokerRequest.Parameters.push(paramRefreshHrs);

      //axios.get(endpointUrl, config).then((res) => {})

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
          console.log("DrlgSummary -", objData);
          let offSetWellNumericData: any = [];
          if (objData.offSetWellNumericData.length > 0) {
            offSetWellNumericData = objData.offSetWellNumericData[0];
          }



          this.setState({
            objSummaryData: objData,
            objNumericData: objData.NumericData[0],
            objRigStateSummaryData: objData.rigStateSummaryData,
            objRigStates: objData.RigStates,

            objOffsetNumericData: offSetWellNumericData,
            objROPData: objData.ROPData,
            objROPDataOffset: objData.ROPDataOffset,
            isProcess: false,
          });


          this.prepareGrdNumericTable(); //Vimal 06-02-2021
          this.prepareOffsetNumericTable(); //vimal
          document.title = this.state.objSummaryData.WellName + " -Drilling Summary"; //Nishant 02/09/2021



          this.refreshChart();
        })
        .catch((error) => {

          Util.StatusError(error.message);

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
  prepareOffsetNumericTable = () => {
    try {
      let arrOffsetNumericTable: any[] = [];
      {
      }

      let objData: any = {
        col_1: "Offset Well",
        value_1: this.state.objSummaryData.offSetWellName,
        col_2: "Depth In",
        value_2: this.state.objSummaryData.MainDepthIn.toFixed(2),
        col_3: "Depth Out",
        value_3: this.state.objSummaryData.MainDepthOut.toFixed(2),
      };
      arrOffsetNumericTable.push(objData);

      objData = {
        col_1: "Drlg Start Date",
        value_1: moment(this.state.objSummaryData.OffsetStartDate).format(
          "MMM-DD-YYYY HH:mm:ss"
        ),
        col_2: "Drlg End Date",
        value_2: moment(this.state.objSummaryData.OffsetEndDate).format(
          "MMM-DD-YYYY HH:mm:ss"
        ),
        col_3: "",
        value_3: "",
        col_4: "",
        value_4: "",
        col_5: "",
        value_5: "",
      };
      arrOffsetNumericTable.push(objData);
      objData = {
        col_1: "ROP (Rotary)",
        value_1: Number(this.state.objOffsetNumericData.ROP_Rotary).toFixed(2),
        col_2: "Time (Rotary)",
        value_2: this.state.objOffsetNumericData.Time_Rotary,
        col_3: "Distance (Rotary)",
        value_3: Number(
          this.state.objOffsetNumericData.Distance_Rotary
        ).toFixed(2),
        col_4: "Rotary Time %",
        value_4: Number(
          this.state.objOffsetNumericData.Rotary_Time_Pct
        ).toFixed(2),
        col_5: "Slide Footage %",
        value_5: Number(
          this.state.objOffsetNumericData.Slide_Footage_Pct
        ).toFixed(2),
      };
      arrOffsetNumericTable.push(objData);
      objData = {
        col_1: "ROP (Slide)",
        value_1: Number(this.state.objOffsetNumericData.ROP_Slide).toFixed(2),
        col_2: "Time (Slide)",
        value_2: this.state.objOffsetNumericData.Time_Slide,
        col_3: "Distance (Slide)",
        value_3: Number(this.state.objOffsetNumericData.Distance_Slide).toFixed(
          2
        ),
        col_4: "Slide Time %",
        value_4: Number(this.state.objOffsetNumericData.Slide_Time_Pct).toFixed(
          2
        ),
        col_5: "Auto Slide Footage %",
        value_5: Number(
          this.state.objOffsetNumericData.Auto_Slide_Footage_Pct
        ).toFixed(2),
      };
      arrOffsetNumericTable.push(objData);

      objData = {
        col_1: "ROP (Autoslide)",
        value_1: Number(this.state.objOffsetNumericData.ROP_AutoSlide).toFixed(
          2
        ),
        col_2: "Time (Autoslide)",
        value_2: this.state.objOffsetNumericData.Time_AutoSlide,
        col_3: "Distance (Autoslide)",
        value_3: Number(
          this.state.objOffsetNumericData.Distance_AutoSlide
        ).toFixed(2),
        col_4: "Autoslide Time %",
        value_4: Number(
          this.state.objOffsetNumericData.Auto_Slide_Time_Pct
        ).toFixed(2),
        col_5: "",
        value_5: "",
      };
      arrOffsetNumericTable.push(objData);

      objData = {
        col_1: "ROP (Overall)",
        value_1: Number(this.state.objOffsetNumericData.ROP_Overall).toFixed(2),
        col_2: "Time (Overall)",
        value_2: this.state.objOffsetNumericData.Time_Overall,
        col_3: "Distance (Overall)",
        value_3: Number(
          this.state.objOffsetNumericData.Distance_Overall
        ).toFixed(2),
        col_4: "Rotary Footage %",
        value_4: Number(
          this.state.objOffsetNumericData.Rotary_Footage_Pct
        ).toFixed(2),
        col_5: "",
        value_5: "",
      };
      arrOffsetNumericTable.push(objData);
      this.setState({
        grdOffsetNumericSummary: arrOffsetNumericTable,
      });
    } catch (error) {
      //alert(error);
      console.log(error);
    }
  };
  prepareGrdNumericTable = () => {
    try {
      //  Auto_Slide_Footage_Pct: "0";
      //  Auto_Slide_Time_Pct: "0";
      //  Distance_AutoSlide: "0";
      //  Distance_Overall: "649.1";
      //  Distance_Rotary: "228.9";
      //  Distance_Slide: "420.2";
      //  ROP_AutoSlide: "0";
      //  ROP_Overall: "17.86";
      //  ROP_Rotary: "24.858";
      //  ROP_Slide: "15.485";
      //  Rotary_Footage_Pct: "35.26";
      //  Rotary_Time_Pct: "25";
      //  Slide_Footage_Pct: "64.74";
      //  Slide_Time_Pct: "75";
      //  Time_AutoSlide: "[0:0:0:0]";
      //  Time_Overall: "[1:12:21:0]";
      //  Time_Rotary: "[0:9:12:30]";
      //  Time_Slide: "[1:3:8:30]";

      let arrNumericTable: any[] = [];

      let objData: any = {
        col_1: "ROP (Rotary)",
        value_1: this.state.objNumericData.ROP_Rotary,
        col_2: "Time (Rotary)",
        value_2: this.state.objNumericData.Time_Rotary,
        col_3: "Distance (Rotary)",
        value_3: this.state.objNumericData.Distance_Rotary,
        col_4: "Rotary Time %",
        value_4: this.state.objNumericData.Rotary_Time_Pct,
        col_5: "Slide Footage %",
        value_5: this.state.objNumericData.Slide_Footage_Pct,
      };
      arrNumericTable.push(objData);

      objData = {
        col_1: "ROP (Slide)",
        value_1: this.state.objNumericData.ROP_Slide,
        col_2: "Time (Slide)",
        value_2: this.state.objNumericData.Time_Slide,
        col_3: "Distance (Slide)",
        value_3: this.state.objNumericData.Distance_Slide,
        col_4: "Slide Time %",
        value_4: this.state.objNumericData.Slide_Time_Pct,
        col_5: "Slide Time %",
        value_5: this.state.objNumericData.Auto_Slide_Footage_Pct,
      };
      arrNumericTable.push(objData);

      objData = {
        col_1: "ROP (AutoSlide)",
        value_1: this.state.objNumericData.ROP_AutoSlide,
        col_2: "Time (AutoSlide)",
        value_2: this.state.objNumericData.Time_AutoSlide,
        col_3: "Distance (AutoSlide)",
        value_3: this.state.objNumericData.Distance_AutoSlide,
        col_4: "AutoSlide Time %",
        value_4: this.state.objNumericData.Auto_Slide_Time_Pct,
        //  col_5: "Slide Time %",
        //  value_5: this.state.objNumericData.Auto_Slide_Footage_Pct,
      };
      arrNumericTable.push(objData);
      objData = {
        col_1: "ROP (Overall)",
        value_1: this.state.objNumericData.ROP_Overall,
        col_2: "Time (Overall)",
        value_2: this.state.objNumericData.Time_Overall,
        col_3: "Distance (Overall)",
        value_3: this.state.objNumericData.Distance_Overall,
        col_4: "Rotary Footage %",
        value_4: this.state.objNumericData.Rotary_Footage_Pct,
        // col_5: "Slide Time %",
        // value_5: this.state.objNumericData.Auto_Slide_Footage_Pct,
      };
      arrNumericTable.push(objData);
      Util.StatusSuccess("Data successfully retrived  ");
      Util.StatusReady();
      this.setState({
        grdNumericSummary: arrNumericTable,
      });
    } catch (error) {
      // alert(error);
      console.log(error);
    }
  };

  //Nishant
  getRigStateColor = (number) => {
    let index = this.state.objRigStates.findIndex(
      (e) => e.RIG_STATE_NUMBER === number
    );
    if (index > -1) {
      return this.state.objRigStates[index].HEX_COLOR;
    } else {
      return "#000000";
    }
  };

//Nishant 29-09-2021 Nis PC
  closeLogViewer=async ()=>{
    
 await this.setState({
  showViewLogger:false
    });
  }
  render() {
    let loader = this.state;

    return (
      <div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="" >

            <div className="drillingSummaryContainer" >

              {/* <div className="col-lg-6 mb-2" >
  <div className="form-inline" style={{ justifyContent: "flex-start" }}>
    <label style={{ marginRight: "20px" }}>Realtime</label>
    <div >
      <Switch onChange={this.handleToggleSwitch} value={this.state.isRealTime} checked={this.state.isRealTime}></Switch>
    </div>
    <div className="ml-5">
    <FontAwesomeIcon
      icon={faUndo}
      onClick={() => {
        this.refreshROPLineChart();
      }}
    />
  </div>
  </div>
  
</div>

<div className="col-lg-1">
 {/* refresh icon */}
              {/* </div> */}



              <div className="mr-2">
                <div className="statusCard">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2">Rig Name</h6>
                    <div className="_summaryLabelBig">
                      {this.state.objSummaryData.RigName}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mr-2">
                <div className="statusCard">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2">Well Name</h6>
                    <div className="_summaryLabelBig">
                      {this.state.objSummaryData.WellName}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mr-2">
                <div className="statusCard">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-2">Depth In</h6>
                    <div className="_summaryLabelBig">
                      {isNaN(Number(this.state.objSummaryData.MainDepthIn))
                        ? 0.0
                        : Number(this.state.objSummaryData.MainDepthIn).toFixed(
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
                      {isNaN(Number(this.state.objSummaryData.MainDepthOut))
                        ? 0.0
                        : Number(this.state.objSummaryData.MainDepthOut).toFixed(
                          2
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className="form-inline m-1">
            <div className="eVumaxPanelController" style={{ width: "360px" }}>
              <label className=" mr-1">Realtime</label> <Switch onChange={this.handleToggleSwitch} value={this.state.isRealTime} checked={this.state.isRealTime}></Switch>
              <label className=" ml-5 mr-1" onClick={() => { this.refreshROPLineChart(); }} style={{ cursor: "pointer" }}>Undo Zoom</label>  
              <FontAwesomeIcon  icon={faSearchMinus}    size="lg"   onClick={() => { this.refreshROPLineChart();}} />
 

              <label className=" ml-2 mr-1" onClick={() => {     this.setState({   showViewLogger:true })}} style={{ cursor: "pointer" }}>View Logger</label> 
              <FontAwesomeIcon   icon={faListAlt}   size="lg"   onClick={() => {  this.setState({ showViewLogger:true})}}/>
            </div>
          </div>
        </div>


        {/* <div className="row">
          <div className="col-xl-4 ">
            <div className="statusCard">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Rig Name</h6>
                <div className="_summaryLabelBig">
                  {this.state.objSummaryData.RigName}{" "}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="statusCard">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Well Name</h6>
                <div className="_summaryLabelBig">
                  {this.state.objSummaryData.WellName}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-2">
            <div className="statusCard">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Depth In</h6>
                <div className="_summaryLabelBig">
                  {Number(this.state.objSummaryData.MainDepthIn).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-2">
            <div className="statusCard">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Depth Out</h6>
                <div className="_summaryLabelBig">
                  {Number(this.state.objSummaryData.MainDepthOut).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div> */}

        <div className="row">
          <TabStrip
            selected={this.state.selected}
            onSelect={this.handleSelect}
            keepTabsMounted={true}
          >
            <TabStripTab title="Drilling Summary">
              <div id="tabDrlgSummary">
                <div className="row">
                  {/* <div className="col-lg-3">
                    <label
                      className="summaryLabelHeader"
                      style={{ width: "125px", textAlign: "left" }}
                    >
                      Drlg Start Date
            </label>
                    <label
                      className="summaryLabel"
                      style={{ width: "200px", textAlign: "left" }}
                    >
                      {moment(this.state.objSummaryData.StartDate).format('MMM-DD-YYYY HH:mm:ss')}
                    </label>
                  </div>

                  <div className="col-lg-3">
                    <label
                      className="summaryLabelHeader"
                      style={{ width: "125px", textAlign: "left" }}
                    >
                      Drlg End Date
            </label>
                    <label
                      className="summaryLabel"
                      style={{ width: "200px", textAlign: "left" }}
                    >
                      {moment(this.state.objSummaryData.EndDate).format('MMM-DD-YYYY HH:mm:ss')}
                    </label>
                  </div> */}
                </div>

                <div className="clearfix"></div>


                <div className="row" style={{ display: "flex", flexFlow: "row wrap", flexWrap: "wrap", alignItems: "stretch", alignContent: "stretch" }}>
                  <div
                    className="flex-item"
                    id="drlgSummary"
                    style={{

                      //height: "calc(100vh - 700px)",
                      height: "calc(30vh)",
                      width: "calc(33vw)",
                      minWidth: "400px",
                      float: "left",
                      backgroundColor: "transparent",
                      // marginLeft: "-50px",
                      marginRight: "10px",
                      flex: 1,
                      //paddingLeft: "45px"
                    }}
                  ></div>

                  <div
                    className="flex-item"
                    id="drlgSummary2"
                    style={{
                      //height: "calc(100vh - 700px)",
                      height: "calc(30vh)",
                      width: "calc(33vw)",
                      minWidth: "400px",
                      flex: 1,
                      backgroundColor: "transparent",
                      float: "left",
                      //marginLeft: "-50px",
                      marginRight: "10px",
                    }}
                  ></div>

                  <div
                    id="drlgSummary3"
                    style={{
                      //height: "calc(100vh - 700px)",
                      flex: 1,
                      height: "calc(30vh)",
                      width: "calc(33vw)",
                      minWidth: "400px",
                      backgroundColor: "transparent",
                      float: "right",
                      //  marginLeft: "-50px",
                      marginRight: "10px",
                    }}
                  ></div>
                </div>

                <div className="row" style={{ display: "flex", alignContent: "space-around" }}>

                  <div
                    className="flex-item"
                    id="ChartRigStateSummary"
                    style={{
                      flex: 1,
                      flexBasis: 100,
                      //height: "calc(40vh)",
                      height: "calc(33vh)",
                      //width: "calc(90vw)",
                      minWidth: "400px",
                      // marginLeft: "-50px",
                      backgroundColor: "transparent",
                    }}
                  ></div>
                </div>

                <div className="Data">
                  {/* <DataSelector {...this} /> */}
                  <DataSelector objDataSelector={this.state.objDataSelector} wellID={this.WellId} selectionChanged={this.selectionChanged} />
                  {/* <DataSelectorOriginal {...this} /> */}


                  {/* <DataSelector2 objDataSelector={this.state.objDataSelector} selectionChanged={this.selectionChanged} wellID={this.WellId} /> */}
                </div>
              </div>
            </TabStripTab>
            <TabStripTab title="Page-2 ">
              <div style={{ marginTop: "5px" }}>



                <div className="row mb-3">
                  {/* style={{ maxHeight: "160px" }} for upper div */}
                  <div
                    //vimal
                    className="row mb-3 col-xl-8 col-lg-12 col-md-12 col-sm-12"
                    style={{
                      backgroundColor: "transparent",
                      width: "calc(100vw - 100px)",
                      height: "100px",
                      minHeight: "100px",//180px
                      minWidth: "500px",//350px
                    }}
                  >
                    <Grid
                      //vimal


                      className="mb-3 col-xl-12 col-lg-12 col-md-12 col-sm-12 numericGrid"
                      // style={{ height: "100%", width: "calc(100vw - 100px)" }}
                      style={{ height: "130px", width: "calc(100vw)" }}//height:120px Vimal
                      resizable={true}
                      scrollable={"scrollable"}//make commented
                      sortable={false}
                      //onRowClick={this.grdNumSummaryRowClick}
                      // editField="inEdit"
                      // selectedField="selected"
                      data={this.state.grdNumericSummary}
                    >
                      <Column
                        headerClassName="text-center"
                        className="summaryLabelHeader"
                        field="col_1"
                      />
                      <Column
                        headerClassName="text-center"
                        className="summaryLabel"
                        field="value_1"
                      />
                      <Column
                        headerClassName="text-center"
                        className="summaryLabelHeader"
                        field="col_2"
                      />
                      <Column
                        headerClassName="text-center"
                        className="summaryLabel3"
                        field="value_2"
                      />
                      <Column
                        headerClassName="text-center"
                        className="summaryLabelHeader"
                        field="col_3"
                      />
                      <Column
                        headerClassName="text-center"
                        className="summaryLabel"
                        field="value_3"
                      />
                      <Column
                        headerClassName="text-center"
                        className="summaryLabelHeader"
                        field="col_4"
                      />
                      <Column
                        headerClassName="text-center"
                        className="summaryLabel"
                        field="value_4"
                      />
                      <Column
                        headerClassName="text-center"
                        className="summaryLabelHeader"
                        field="col_5"
                      />
                      <Column
                        headerClassName="text-center"
                        className="summaryLabel"
                        field="value_5"
                      />
                    </Grid>
                  </div>
                  <div
                    className="col-xl-2 col-lg-6 col-md-6 col-sm-6"
                    style={{
                      marginBlock: "auto",
                      minWidth: "200px",
                      minHeight: "200px",
                    }}
                  >
                    {/* <h1 className="title ">Rotary Vs Slide</h1> */}

                    <div
                      id="piechart1"
                      style={{
                        height: "200px",//100px
                        width: "300px",//300px
                        minWidth: "300px",
                        minHeight: "200px",//100px
                      }}
                    ></div>
                  </div>
                  <div className="clearfix"></div>

                  <div
                    className="col-xl-2 col-lg-6 col-md-6 col-sm-6"
                    style={{
                      marginBlock: "auto",
                      minWidth: "150px",//300px
                      minHeight: "150px",//300px
                    }}
                  >
                    <div
                      id="piechart2"
                      style={{
                        height: "200px",//300px
                        width: "300px",
                        minHeight: "200px",//100px
                        minWidth: "300px"
                      }}
                    ></div>
                  </div>
                </div>
                <div className="clearfix"></div>

                <div className="clearfix"></div>
                {this.state.objOffsetNumericData.length <= 0 ? (
                  ""
                ) : (
                  <div>
                    <div className="row mb-3" >
                      {/* for upprer div style={{ maxHeight: "230px" }} */}
                      <div
                        //vimal
                        className="row mb-3 col-xl-8 col-lg-12 col-md-12 col-sm-12"
                        style={{
                          backgroundColor: "transparent",
                          width: "calc(100vw - 100px)",
                          height: "calc(15vh)",
                          minHeight: "200px",
                          minWidth: "500px",//350px
                        }}
                      >
                        <Grid
                          //vimal
                          className="mb-3 col-xl-12 col-lg-12 col-md-12 col-sm-12 numericGrid"
                          style={{ height: "100%", width: "calc(100vw - 100px)" }}
                          // style={{ height: "180px", width: "calc(100vw)" }}
                          resizable={true}
                          scrollable={"scrollable"}
                          sortable={false}
                          //onRowClick={this.grdNumSummaryRowClick}
                          // editField="inEdit"
                          // selectedField="selected"
                          data={this.state.grdOffsetNumericSummary}
                        >
                          <Column
                            headerClassName="text-center"
                            className="summaryLabelHeader"
                            field="col_1"
                          />
                          <Column
                            headerClassName="text-center"
                            className="summaryLabel1"
                            field="value_1"
                            width="150px"
                          />
                          <Column
                            headerClassName="text-center"
                            className="summaryLabelHeader"
                            field="col_2"
                          />
                          <Column
                            headerClassName="text-center"
                            className="summaryLabel1"
                            field="value_2"
                            width="150px"
                          />
                          <Column
                            headerClassName="text-center"
                            className="summaryLabelHeader"
                            field="col_3"
                            width="120px"
                          />
                          <Column
                            headerClassName="text-center"
                            className="summaryLabel"
                            field="value_3"
                          />
                          <Column
                            headerClassName="text-center"
                            className="summaryLabelHeader1"
                            field="col_4"
                            width="120px"
                          />
                          <Column
                            headerClassName="text-center"
                            className="summaryLabel"
                            field="value_4"
                          />
                          <Column
                            headerClassName="text-center"
                            className="summaryLabelHeader1"
                            field="col_5"
                            width="120px"
                          />
                          <Column
                            headerClassName="text-center"
                            className="summaryLabel"
                            field="value_5"
                          />
                        </Grid>
                      </div>

                      <div
                        className="col-xl-2 col-lg-6 col-md-6 col-sm-6"
                        style={{
                          marginBlock: "auto",
                          minWidth: "300px",
                          minHeight: "100px",
                        }}
                      >
                        <div
                          id="offsetpiechart1"
                          style={{
                            minHeight: "100px",//100px
                            minWidth: "300px",
                          }}
                        ></div>
                      </div>
                      <div className="clearfix"></div>
                      <div
                        className="col-xl-2 col-lg-6 col-md-6 col-sm-12"
                        style={{
                          marginBlock: "auto",
                          minWidth: "300px",
                          minHeight: "100px",
                        }}
                      >
                        <div
                          id="offsetpiechart2"
                          style={{
                            minHeight: "100px",//100px
                            minWidth: "300px",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* end of offset */}
              </div>
              <div className="clearfix"></div>

              <div className="row mt-2">
                <div
                  id="roplinechart_legend"
                  style={{
                    textAlign: "center",
                    height: "40px",
                    //width: "calc(100vw - 90px)",
                    backgroundColor: "transparent",
                    display: "inline-block",
                  }}
                ></div>

                {this.state.objOffsetNumericData.length <= 0 ?
                  <div
                    id="roplinechart"
                    style={{
                      height: "calc(45vh)",
                      width: "calc(95vw)",
                      marginLeft: "-50px",
                      float: "left",
                      backgroundColor: "transparent",
                    }}
                  ></div>
                  :
                  <div
                    id="roplinechart"
                    style={{
                      height: "calc(25vh)",
                      width: "calc(95vw)",
                      marginRight: "50px",
                      marginLeft: "-60px",
                      float: "left",
                      backgroundColor: "transparent",
                    }}
                  ></div>


                }

              </div>
            </TabStripTab>
            {/* <TabStripTab title="Settings" >
              <div className="row">
                <div className="col">
                  <label>Side Track List</label>

                  {this.state.selectionType == "1" && (
                    <Checkbox
                      className="mr-2"
                      label={"Match Formation Tops with Depth"}
                      //checked={this.state.ShowComments}
                      onChange={(event) => {
                        //  this.setState({ ShowComments: event.value });
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <Button
                    id="cmdApplySettings"
                    onClick={() => {
                      //this.saveSettings();
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

            </TabStripTab> */}
          </TabStrip>
        </div>
       {this.state.showViewLogger && <LogViewer onClose= {this.closeLogViewer} LogList={this.LogList} >    </LogViewer>}

      </div>
      
    );
  }
}

export default DrillingSummary;
