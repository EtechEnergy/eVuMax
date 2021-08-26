import React, { Component, useState, useEffect } from "react";
import * as d3 from "d3";
import $ from "jquery";
import { Chart, lineStyle } from "../../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import { formatNumber, parseDate } from "@telerik/kendo-intl";
import {
  Axis,
  axisLabelStyle,
  axisPosition,
} from "../../../eVuMaxObjects/Chart/Axis";
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
import Moment_ from "react-moment";
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
  RadioButton,
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
  Button,
  Form,
} from "@progress/kendo-react-all";

import { axisBottom, gray, json } from "d3";
import moment from "moment";
import { stat } from "fs";
import "./DrlgConnSummary2.css";
import { faMoon, faSun, faUnderline } from "@fortawesome/free-solid-svg-icons";
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";
import GlobalMod from "../../../objects/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Util } from "../../../Models/eVuMax";
import { util } from "typescript-collections";
let _gMod = new GlobalMod();

class DrlgConnSummary2 extends Component {
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;
  }

  state = {
    WellName: "",
    selected: 0,
    summaryData: [],
    currentDepth: 0,
    AvgTime: 0,
    AvgBTS: 0,
    AvgSTS: 0,
    AvgSTB: 0,
    AvgDayTime: 0,
    AvgDayBTS: 0,
    AvgDaySTS: 0,
    AvgDaySTB: 0,
    AvgNightTime: 0,
    AvgNightBTS: 0,
    AvgNightSTS: 0,
    AvgNightSTB: 0,
    PositiveFlow: 0,
    NegativeFlow: 0,
    NetFlow: 0,
    PositiveSTSFlow: 0,
    NegativeSTSFlow: 0,
    NetSTSFlow: 0,
    ConnCount: 0,
    ExclConnCount: 0,
    CurrentView: 0,
    SkipConnMaxTime: false,
    MaxConnTime: 0,
    ShowExcludedConn: false,
    HighlightDayNight: false,
    DayTimeFrom: "",
    DayTimeTo: "",
    DrlgBenchMark: 0,
    BTSBenchMark: 0,
    STSBenchMark: 0,
    STBBenchMark: 0,
    TargetTime: 0,
    RigCost: 0,
    ShowComments: false,
  };

  WellId: string = "";
  objSummaryData: any; //Stores Connection Summary Data
  objUserSettings: any;

  //local variables
  _isLoading: boolean = false;

  objBTSChart: Chart;
  objSTSChart: Chart;
  objSTBChart: Chart;

  selectionType: string = "-1";
  fromDate: Date = null;
  toDate: Date = null;
  fromDepth: number = 0;
  toDepth: number = 0;

  componentDidMount() {
    try {
      //initialize charts

      //### BTS Chart ##############################################
      this.objBTSChart = new Chart(this, "bts_chart");
      this.objBTSChart.ContainerId = "bts_chart";

      this.objBTSChart.leftAxis().AutoScale = true;
      this.objBTSChart.leftAxis().Min = 0;
      this.objBTSChart.leftAxis().Max = 100;
      this.objBTSChart.leftAxis().Inverted = false;
      this.objBTSChart.leftAxis().ShowLabels = true;
      this.objBTSChart.leftAxis().Title = "BTS Time (min.)";
      this.objBTSChart.leftAxis().ShowTitle = true;
      this.objBTSChart.leftAxis().Visible = true;

      this.objBTSChart.bottomAxis().AutoScale = true;
      this.objBTSChart.bottomAxis().bandScale = true;
      this.objBTSChart.bottomAxis().Min = 100;
      this.objBTSChart.bottomAxis().Max = 200;
      this.objBTSChart.bottomAxis().Title = "Depth (ft)";
      this.objBTSChart.bottomAxis().ShowLabels = false;
      this.objBTSChart.bottomAxis().ShowTitle = false;
      this.objBTSChart.bottomAxis().LabelAngel = 90;
      this.objBTSChart.bottomAxis().ShowSelector = false;
      this.objBTSChart.bottomAxis().IsDateTime = false;
      this.objBTSChart.bottomAxis().Visible = true;

      this.objBTSChart.rightAxis().Visible = false;
      this.objBTSChart.rightAxis().ShowTitle = false;
      this.objBTSChart.rightAxis().ShowLabels = false;

      this.objBTSChart.MarginLeft = 10;
      this.objBTSChart.MarginBottom = 0;
      this.objBTSChart.MarginTop = 10;
      this.objBTSChart.MarginRight = 80;
      

      this.objBTSChart.initialize();
      this.objBTSChart.reDraw();
      this.objBTSChart.onBeforeSeriesDraw.subscribe((e, i) => {
        this.onBeforeDrawSeriesBTS(e, i);
      });
      //###################################################################//

      //### STS Chart ##############################################
      this.objSTSChart = new Chart(this, "sts_chart");
      this.objSTSChart.ContainerId = "sts_chart";

      this.objSTSChart.leftAxis().AutoScale = true;
      this.objSTSChart.leftAxis().Min = 0;
      this.objSTSChart.leftAxis().Max = 100;
      this.objSTSChart.leftAxis().Inverted = false;
      this.objSTSChart.leftAxis().ShowLabels = true;
      this.objSTSChart.leftAxis().ShowTitle = true;
      this.objSTSChart.leftAxis().Title = "STS Time (min.)";
      this.objSTSChart.leftAxis().ShowTitle = true;
      this.objSTSChart.leftAxis().Visible = true;

      this.objSTSChart.bottomAxis().AutoScale = true;
      this.objSTSChart.bottomAxis().bandScale = true;
      this.objSTSChart.bottomAxis().Min = 100;
      this.objSTSChart.bottomAxis().Max = 200;
      this.objSTSChart.bottomAxis().Title = "Depth (ft)";
      this.objSTSChart.bottomAxis().ShowLabels = false;
      this.objSTSChart.bottomAxis().ShowTitle = false;
      this.objSTSChart.bottomAxis().LabelAngel = 90;
      this.objSTSChart.bottomAxis().ShowSelector = false;
      this.objSTSChart.bottomAxis().IsDateTime = false;
      this.objSTSChart.bottomAxis().Visible = true;

      this.objSTSChart.rightAxis().AutoScale = true;
      this.objSTSChart.rightAxis().Min = 100;
      this.objSTSChart.rightAxis().Max = 200;
      this.objSTSChart.rightAxis().Title = "Cost $";
      this.objSTSChart.rightAxis().ShowLabels = true;
      this.objSTSChart.rightAxis().ShowTitle = true;
      this.objSTSChart.rightAxis().ShowSelector = false;
      this.objSTSChart.rightAxis().IsDateTime = false;
      this.objSTSChart.rightAxis().Visible = true;
      this.objSTSChart.rightAxis().Inverted = false;

      this.objSTSChart.MarginLeft = 10;
      this.objSTSChart.MarginBottom = 0;
      this.objSTSChart.MarginTop = 0;
      this.objSTSChart.MarginRight = 0;

      this.objSTSChart.initialize();
      this.objSTSChart.reDraw();
      this.objSTSChart.onBeforeSeriesDraw.subscribe((e, i) => {
        this.onBeforeDrawSeriesSTS(e, i);
      });
      //###################################################################//

      //### STB Chart ##############################################
      this.objSTBChart = new Chart(this, "stb_chart");
      this.objSTBChart.ContainerId = "stb_chart";

      this.objSTBChart.leftAxis().AutoScale = true;
      this.objSTBChart.leftAxis().Min = 0;
      this.objSTBChart.leftAxis().Max = 100;
      this.objSTBChart.leftAxis().Inverted = false;
      this.objSTBChart.leftAxis().ShowLabels = true;
      this.objSTBChart.leftAxis().ShowTitle = true;
      this.objSTBChart.leftAxis().Title = "STB Time (min.)";
      this.objSTBChart.leftAxis().ShowTitle = true;
      this.objSTBChart.leftAxis().Visible = true;

      this.objSTBChart.bottomAxis().AutoScale = true;
      this.objSTBChart.bottomAxis().bandScale = true;
      this.objSTBChart.bottomAxis().Min = 100;
      this.objSTBChart.bottomAxis().Max = 200;
      this.objSTBChart.bottomAxis().Title = "Depth (ft)";
      this.objSTBChart.bottomAxis().ShowLabels = true;
      this.objSTBChart.bottomAxis().ShowTitle = true;
      this.objSTBChart.bottomAxis().LabelAngel = 90;
      this.objSTBChart.bottomAxis().ShowSelector = false;
      this.objSTBChart.bottomAxis().IsDateTime = false;
      this.objSTBChart.bottomAxis().Visible = true;

      this.objSTBChart.rightAxis().Visible = false;
      this.objSTBChart.rightAxis().ShowTitle = false;
      this.objSTBChart.rightAxis().ShowLabels = false;

      this.objSTBChart.MarginLeft = 10;
      this.objSTBChart.MarginBottom = 10;
      this.objSTBChart.MarginTop = 0;
      this.objSTBChart.MarginRight = 80;

      this.objSTBChart.initialize();
      this.objSTBChart.reDraw();
      this.objSTBChart.onBeforeSeriesDraw.subscribe((e, i) => {
        this.onBeforeDrawSeriesSTB(e, i);
      });
      //###################################################################//
      window.addEventListener("resize", this.refreshChart);

      this.loadConnections();
    } catch (error) { }
  }

  componentDidUpdate() {
    try {
      this.refreshChart();
    } catch (error) { }
  }

  getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  setData = () => {
    try {
      this.objUserSettings = JSON.parse(this.objSummaryData.userSettings);

      this.setState({
        WellName: this.objSummaryData.WellName,
        summaryData: this.objSummaryData.connData,
        AvgTime: this.objSummaryData.avgTime,
        AvgBTS: this.objSummaryData.avgBTS,
        AvgSTS: this.objSummaryData.avgSTS,
        AvgSTB: this.objSummaryData.avgSTB,
        AvgTimeD: this.objSummaryData.avgTimeD,
        AvgDayBTS: this.objSummaryData.avgBTSD,
        AvgDaySTS: this.objSummaryData.avgSTSD,
        AvgDaySTB: this.objSummaryData.avgSTBD,
        AvgNightTime: this.objSummaryData.avgTimeN,
        AvgNightBTS: this.objSummaryData.avgBTSN,
        AvgNightSTS: this.objSummaryData.avgSTSN,
        AvgNightSTB: this.objSummaryData.avgSTBN,
        PositiveFlow: this.objSummaryData.PositiveCashFlow,
        NegativeFlow: this.objSummaryData.NegativeCashFlow,
        NetFlow: this.objSummaryData.NetCashFlow,
        PositiveSTSFlow: this.objSummaryData.PositiveSTSCashFlow,
        NegativeSTSFlow: this.objSummaryData.NegativeSTSCashFlow,
        NetSTSFlow: this.objSummaryData.NetSTSCashFlow,
        ConnCount: this.objSummaryData.ConnCount,
        ExclConnCount: this.objSummaryData.ExcludedConns,
        SkipConnMaxTime: this.objUserSettings.SkipConnMaxTime,
        MaxConnTime: this.objUserSettings.MaxConnTime,
        ShowExcludedConn: this.objUserSettings.showExcludedConn,
        HighlightDayNight: this.objUserSettings.HighlightDayNight,
        DayTimeFrom: this.objUserSettings.DayTimeFrom,
        DayTimeTo: this.objUserSettings.DayTimeTo,
        DrlgBenchMark: this.objUserSettings.DrlgBenchMark,
        BTSBenchMark: this.objUserSettings.BTSBenchMark,
        STSBenchMark: this.objUserSettings.STSBenchMark,
        STBBenchMark: this.objUserSettings.STBBenchMark,
        TargetTime: this.objUserSettings.TargetTime,
        RigCost: this.objUserSettings.RigCost,
      });

      this.refreshChart();
    } catch (error) { }
  };

  formateDate = (paramDate: Date) => {
    try {
      let day = paramDate.getDate();
      let mlist = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      let month = mlist[paramDate.getMonth()];
      let year = paramDate.getFullYear();
      let hour = paramDate.getHours();
      let minute = paramDate.getMinutes();
      let seconds = paramDate.getSeconds();

      let strDate =
        day +
        "-" +
        month +
        "-" +
        year +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        seconds;

      return strDate;
    } catch (error) {
      return "";
    }
  };

  loadConnections = () => {
    try {
      Util.StatusInfo("Getting data from the server  ");

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "DrlgConn";
      objBrokerRequest.Function = "DrlgConnSummary";

      let paramuserid: BrokerParameter = new BrokerParameter("UserId", "admin");
      objBrokerRequest.Parameters.push(paramuserid);

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );
      objBrokerRequest.Parameters.push(paramwellId);

      let paramSelectionType: BrokerParameter = new BrokerParameter(
        "SelectionType",
        this.selectionType
      );
      objBrokerRequest.Parameters.push(paramSelectionType);

      let paramFromDate: BrokerParameter = new BrokerParameter(
        "FromDate",
        this.formateDate(this.fromDate)
      );
      objBrokerRequest.Parameters.push(paramFromDate);

      let paramToDate: BrokerParameter = new BrokerParameter(
        "ToDate",
        this.formateDate(this.toDate)
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

      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          this.objSummaryData = JSON.parse(res.data.Response);
          Util.StatusSuccess("Data successfully retrived  ");
          console.log("Data", this.objSummaryData);
          this.setData();
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

  saveSettings = () => {
    try {
      Util.StatusInfo("Getting data from the server  ");

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "DrlgConn";
      objBrokerRequest.Function = "SaveUserSettings";

      this.objUserSettings.SkipConnMaxTime = this.state.SkipConnMaxTime;
      this.objUserSettings.MaxConnTime = this.state.MaxConnTime;
      this.objUserSettings.showExcludedConn = this.state.ShowExcludedConn;
      this.objUserSettings.HighlightDayNight = this.state.HighlightDayNight;
      this.objUserSettings.DayTimeFrom = this.state.DayTimeFrom;
      this.objUserSettings.DayTimeTo = this.state.DayTimeTo;
      this.objUserSettings.DrlgBenchMark = this.state.DrlgBenchMark;
      this.objUserSettings.BTSBenchMark = this.state.BTSBenchMark;
      this.objUserSettings.STSBenchMark = this.state.STSBenchMark;
      this.objUserSettings.STBBenchMark = this.state.STBBenchMark;
      this.objUserSettings.TargetTime = this.state.TargetTime;
      this.objUserSettings.RigCost = this.state.RigCost;

      let paramuserid: BrokerParameter = new BrokerParameter("UserId", "admin");
      objBrokerRequest.Parameters.push(paramuserid);

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );
      objBrokerRequest.Parameters.push(paramwellId);

      let paramSettingsData: BrokerParameter = new BrokerParameter(
        "SettingsData",
        JSON.stringify(this.objUserSettings)
      );
      objBrokerRequest.Parameters.push(paramSettingsData);

      axios
        .get(_gMod._performTask, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          this.setState({ selected: 0 });
          //reload all the connections
          this.loadConnections();
          Util.StatusSuccess("Data successfully retrived  ");
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
      this.selectionType = pselectedval;
      this.fromDate = pfromDate;
      this.toDate = ptoDate;
      this.fromDepth = pfromDepth;
      this.toDepth = ptoDepth;

      console.log(
        "From Date " +
        moment(this.fromDate).format("d-MMM-yyyy HH:mm:ss") +
        " To Date " +
        moment(this.toDate).format("d-MMM-yyyy HH:mm:ss")
      );

      this.loadConnections();
    } catch (error) { }
  };

  radioData = [
    { label: "User Comments", value: "User Comments", className: "" },
    { label: "Time Log Remarks", value: "Time Log Remarks", className: "" },
  ];

  handleSubmit = (dataItem: any) => alert(JSON.stringify(dataItem, null, 2));

  render() {
    return (
      <>
        <div className="row">
          <div className="col-lg-12 eVumaxPanelTitle">
            <div>
              <label className="summaryTitle">{this.state.WellName}</label>
            </div>
          </div>
        </div>
        <TabStrip selected={this.state.selected} onSelect={this.handleSelect}>
          <TabStripTab title="Drilling Connections Summary">
            <div //vima
              className="form-group"
              style={{ height: "45px", backgroundColor: "transparent" }}
            >
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
                {/* <label style={{ marginRight: "20px" }}> View</label>
                <RadioButton
                  name="opgView"
                  value={0}
                  checked={this.state.CurrentView === 0}
                  label="Standard"
                  onChange={() => {
                    this.setState({ CurrentView: 0 });
                  }}
                /> */}
                {/* <RadioButton
                  name="opgView1"
                  value={1}
                  checked={this.state.CurrentView === 1}
                  label="Rig State View"
                  onChange={() => {
                    this.setState({ CurrentView: 1 });
                  }}
                /> */}
              </div>

              <div
                //vimal
                className="form-inline eVumaxPanelChart"
                style={{
                  marginTop: "10px",
                  marginRight: "50px",
                  float: "right",
                  height: "32px",
                  padding: "3px",
                }}
              >
                <label className="connInfo" style={{ marginRight: "20px" }}>
                  ({this.state.ConnCount}) Connections
                </label>
                <label className="connInfo" style={{ marginRight: "20px" }}>
                  ({this.state.ExclConnCount}) Excluded Connections
                </label>
                <label style={{ marginRight: "20px" }}>Realtime</label>
                <div style={{ marginRight: "50px" }}>
                  <Switch></Switch>
                </div>
              </div>
            </div>

            <div
              id="main_container"
              style={{
                height: "calc(100vh - 400px)",
                width: "calc(100vw - 90px)",
                backgroundColor: "transparent",
              }}
            >
              <div>
                <div
                  id="bts_chart"
                  style={{
                    float: "left",
                    height: "calc( ((100vh - 400px)*30)/100)",
                    width: "calc(100vw - 240px )",
                    backgroundColor: "transparent",
                  }}
                ></div>

                <div
                  id="bts_chart_legend"
                  style={{
                    float: "right",
                    height: "calc( ((100vh - 400px)*30)/100)",
                    width: "150px",
                    //vimal
                    paddingTop: "80px",
                    backgroundColor: "transparent",
                  }}
                ></div>
              </div>

              <div>
                <div
                  id="sts_chart"
                  style={{
                    float: "left",
                    height: "calc(((100vh - 400px)*30)/100)",
                    width: "calc(100vw - 240px)",
                    backgroundColor: "transparent",
                  }}
                ></div>

                <div
                  id="sts_chart_legend"
                  style={{
                    //viaml
                    paddingTop: "60px",
                    float: "right",
                    height: "calc( ((100vh - 400px)*30)/100)",
                    width: "150px",
                    backgroundColor: "transparent",
                  }}
                ></div>
              </div>

              <div>
                <div
                  id="stb_chart"
                  style={{
                    float: "left",
                    height: "calc(((100vh - 400px)*40)/100)",
                    width: "calc(100vw - 240px)",
                    backgroundColor: "transparent",
                  }}
                ></div>






                <div
                  id="stb_chart_legend"
                  style={{
                    //vimal
                    paddingTop: "75px",
                    // paddingLeft: "50px",
                    float: "right",
                    height: "calc( ((100vh - 400px)*40)/100)",
                    width: "150px",
                    backgroundColor: "transparent",
                  }}
                ></div>
              </div>
            </div>

            <DataSelector {...this} />
          </TabStripTab>
          <TabStripTab title="Numeric Summary">
            <div style={{ marginTop: "10px" }}>
              <div className="row mb-3">
                <div className="col-xl-8 col-lg-7 col-md-6 col-sm-12">
                  <h6 className="summaryGroupHeader">Overall Summary</h6>

                  <div className="form-inline">
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. Time</label>
                      <label className="summaryLabel" id="txtAvgTime">
                        {this.state.AvgTime}
                      </label>
                    </div>

                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. BTS</label>
                      <label className="summaryLabel" id="txtAvgBTS">
                        {this.state.AvgBTS}
                      </label>
                    </div>

                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. STS</label>
                      <label className="summaryLabel" id="txtAvgSTS">
                        {this.state.AvgSTS}
                      </label>
                    </div>

                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. STB</label>
                      <label className="summaryLabel" id="txtAvgSTB">
                        {this.state.AvgSTB}
                      </label>
                    </div>
                  </div>

                  <h6 className="summaryGroupHeader">Day Time Summary</h6>

                  <div className="form-inline">
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. Time</label>
                      <label className="summaryLabel" id="txtAvgTimeD">
                        {this.state.AvgDayTime}
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. BTS</label>
                      <label className="summaryLabel" id="txtAvgBTSD">
                        {this.state.AvgDayBTS}
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. STS</label>
                      <label className="summaryLabel" id="txtAvgSTSD">
                        {this.state.AvgDaySTS}
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. STB</label>
                      <label className="summaryLabel" id="txtAvgSTBD">
                        {this.state.AvgDaySTB}
                      </label>
                    </div>
                  </div>

                  <h6 className="summaryGroupHeader">Night Time Summary</h6>

                  <div className="form-inline">
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. Time</label>
                      <label className="summaryLabel" id="txtAvgTimeN">
                        {this.state.AvgNightTime}
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. BTS</label>
                      <label className="summaryLabel" id="txtAvgBTSN">
                        {this.state.AvgNightBTS}
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. STS</label>
                      <label className="summaryLabel" id="txtAvgSTSN">
                        {this.state.AvgNightSTS}
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. STB</label>
                      <label className="summaryLabel" id="txtAvgSTBN">
                        {this.state.AvgNightSTB}
                      </label>
                    </div>
                  </div>
                </div>
                {/* vimal */}
                <div className="col-xl-4 col-lg-5 col-md-5 col-sm-12">
                  <h6 className="summaryGroupHeader">Cash Flow</h6>
                  <div className="form-group">
                    <div className="form-group">
                      <label className="summaryLabelHeader-long">
                        Positive Cash Flow $
                      </label>
                      <label className="summaryLabel" id="txtPositiveFlow">
                        {this.state.PositiveFlow}
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="summaryLabelHeader-long">
                        Negative Cash Flow $
                      </label>
                      <label className="summaryLabel" id="txtNegativeFlow">
                        {this.state.NegativeFlow}
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="summaryLabelHeader-long">
                        Net Cash Flow $
                      </label>
                      <label className="summaryLabel" id="txtNetFlow">
                        {this.state.NetFlow}
                      </label>
                    </div>
                  </div>
                  <h6 className="summaryGroupHeader">STS Flow</h6>

                  <div className="form-group">
                    <label className="summaryLabelHeader-long">
                      Positive Cash Flow $
                    </label>
                    <label className="summaryLabel" id="txtSTSPositiveFlow">
                      {this.state.PositiveSTSFlow}
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="summaryLabelHeader-long">
                      Negative Cash Flow $
                    </label>
                    <label className="summaryLabel" id="txtSTSNegativeFlow">
                      {this.state.NegativeSTSFlow}
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="summaryLabelHeader-long">
                      Net Cash Flow $
                    </label>
                    <label className="summaryLabel" id="txtSTSNetFlow">
                      {this.state.NetSTSFlow}
                    </label>
                  </div>
                </div>
              </div>
              <br />

              <h6 className="summaryGroupHeader">Connection Details</h6>
              <div
                className="row mb-3"
                style={{
                  backgroundColor: "transparent",
                  width: "calc(100vw - 100px)",
                  minHeight: "400px",
                }}
              >
                <Grid
                  style={{ height: "425px", width: "calc(100vw - 120px)" }}
                  // style={{ height: "100%", width: "calc(100vw - 120px)" }}
                  data={
                    this.state.summaryData != null
                      ? this.state.summaryData.map((item: any) => ({
                        ...item,
                        selected: item.DEPTH === this.state.currentDepth,
                      }))
                      : null
                  }
                  resizable={true}
                  sortable={true}
                  //onRowClick={this.grdNumSummaryRowClick}
                  editField="inEdit"
                  selectedField="selected"
                >
                  <Column
                    field="DEPTH"
                    headerClassName="text-center"
                    className="text-right"
                    title="Depth"
                    width="90px"
                  />
                  <Column
                    field="BOTTOM_TO_SLIPS"
                    headerClassName="text-center"
                    className="text-left"
                    title="BTS(Minutes)"
                    width="90px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span>
                          {" "}
                          {formatNumber(
                            props.dataItem.BOTTOM_TO_SLIPS,
                            "n2"
                          )}{" "}
                        </span>
                      </td>
                    )}
                  />
                  <Column
                    field="SLIPS_TO_SLIPS"
                    headerClassName="text-center"
                    className="text-left"
                    title="STS(Minutes)"
                    width="90px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span>
                          {" "}
                          {formatNumber(
                            props.dataItem.SLIPS_TO_SLIPS,
                            "n2"
                          )}{" "}
                        </span>
                      </td>
                    )}
                  />

                  <Column
                    field="SLIPS_TO_BOTTOM"
                    headerClassName="text-center"
                    className="text-left"
                    title="STB(Minutes)"
                    width="90px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span>
                          {" "}
                          {formatNumber(
                            props.dataItem.SLIPS_TO_BOTTOM,
                            "n2"
                          )}{" "}
                        </span>
                      </td>
                    )}
                  />
                  <Column
                    field="TOTAL_TIME"
                    headerClassName="text-center"
                    className="text-left"
                    title="Total Time (Minutes)"
                    format="n2"
                    width="150px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span>
                          {" "}
                          {formatNumber(
                            props.dataItem.BOTTOM_TO_SLIPS +
                            props.dataItem.SLIPS_TO_SLIPS +
                            props.dataItem.SLIPS_TO_BOTTOM,
                            "n2"
                          )}{" "}
                        </span>
                      </td>
                    )}
                  />
                  <Column
                    field="COMMENTS"
                    headerClassName="text-center"
                    className="text-left"
                    title="Comments"
                    width="300px"
                  />
                  <Column
                    field="TOTAL_TIME"
                    headerClassName="text-center"
                    className="text-right"
                    title="Total Time (HH:MM:SS)"
                    //format="n2"
                    width="150px"
                  />
                  <Column
                    field="DayNightICO"
                    title="Day Night"
                    width="90px"
                    className="text-center"
                    headerClassName="text-center"
                    cell={(props) => (
                      <td className="text-center" style={{}}>
                        <span>
                          {props.dataItem["DAY_NIGHT"] == "N" ? (
                            <FontAwesomeIcon icon={faMoon}></FontAwesomeIcon>
                          ) : (
                            <FontAwesomeIcon
                              style={{ color: "yellow" }}
                              icon={faSun}
                            ></FontAwesomeIcon>
                          )}
                        </span>
                      </td>
                    )}
                  ></Column>
                  <Column
                    field="FROM_DATE"
                    headerClassName="text-center"
                    className="text-left"
                    title="Start Time"
                    width="150px"
                    cell={(props) => (
                      <td className="text-right">
                        {
                          <Moment_
                            date={props.dataItem.FROM_DATE}
                            format="MMM-DD-yyyy HH:MM:ss"
                          >
                            {" "}
                          </Moment_>
                        }
                      </td>
                    )}
                  />

                  <Column
                    field="AVG_ECD"
                    headerClassName="text-center"
                    className="text-right"
                    title="Avg. ECD"
                    width="90px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span>
                          {" "}
                          {formatNumber(props.dataItem.AVG_ECD, "n2")}{" "}
                        </span>
                      </td>
                    )}
                  />
                  <Column
                    field="ON_BOTTOM_ROP"
                    headerClassName="text-center"
                    className="text-right"
                    title="On Bottom ROP"
                    width="150px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span>
                          {" "}
                          {formatNumber(
                            props.dataItem.ON_BOTTOM_ROP,
                            "n2"
                          )}{" "}
                        </span>
                      </td>
                    )}
                  />
                  <Column
                    field="ROP"
                    headerClassName="text-center"
                    className="text-right"
                    title="ROP"
                    width="90px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span> {formatNumber(props.dataItem.ROP, "n2")} </span>
                      </td>
                    )}
                  />
                  <Column
                    field="COST"
                    headerClassName="text-center"
                    className="text-right"
                    title="Cost $"
                    width="90px"
                  />
                  <Column
                    field="TARGET_COST"
                    headerClassName="text-center"
                    className="text-right"
                    title="Target Cost $"
                    width="90px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span>
                          {" "}
                          {formatNumber(props.dataItem.TARGET_COST, "n2")}{" "}
                        </span>
                      </td>
                    )}
                  />
                  <Column
                    field="DIFF"
                    headerClassName="text-center"
                    className="text-right"
                    title="Diff $"
                    width="90px"
                  />

                  <Column
                    field="STS_COST"
                    headerClassName="text-center"
                    className="text-right"
                    title="STS Cost $"
                    width="90px"
                  />

                  <Column
                    field="STS_DIFF"
                    headerClassName="text-center"
                    className="text-right"
                    title="STS Diff $"
                    width="90px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span>
                          {" "}
                          {formatNumber(props.dataItem.STS_DIFF, "n2")}{" "}
                        </span>
                      </td>
                    )}
                  />
                </Grid>
              </div>
            </div>
          </TabStripTab>

          <TabStripTab title="Settings">
            <div style={{ marginTop: "10px" }}>
              <div className="row mb-3">
                <div className="col-lg-12">
                  <h6 className="summaryGroupHeader">Plot Settings</h6>
                </div>
              </div>

              <div className="clearfix"></div>
              <div className="row mb-3">
                <div className="col-lg-12">
                  <Checkbox
                    className="mr-2"
                    label={"Show Comments"}
                    checked={this.state.ShowComments}
                    onChange={(event) => {
                      this.setState({ ShowComments: event.value });
                    }}
                  />

                  <Checkbox
                    className="mr-2 leftPadding"
                    label={"Show Excluded Connections"}
                    checked={this.state.ShowExcludedConn}
                    onChange={(event) => {
                      this.setState({ ShowExcludedConn: event.value });
                    }}
                  />
                </div>

                <div className="col-lg-12">
                  <Checkbox
                    className="mr-2"
                    label={"Skip connection having more time than"}
                    checked={this.state.SkipConnMaxTime}
                    onChange={(event) => {
                      this.setState({ SkipConnMaxTime: event.value });
                    }}
                  />
                  <span className="mr-2">
                    <NumericTextBox
                      value={this.state.MaxConnTime}
                      format="n2"
                      width="100px"
                      onChange={(event) => {
                        this.setState({ MaxConnTime: event.target.value });
                      }}
                    />
                    <label className="leftPadding-small">minutes</label>
                  </span>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-lg-12">
                  <Checkbox
                    className="mr-2"
                    label={"Hightlight Day & Night Connections"}
                    checked={this.state.HighlightDayNight}
                    onChange={(event) => {
                      this.setState({ HighlightDayNight: event.value });
                    }}
                  />
                  <span>DayTime Hours from</span>
                  <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                    <MaskedTextBox
                      mask="00:00"
                      width="50px"
                      value={this.state.DayTimeFrom}
                      onChange={(event) => {
                        this.setState({ DayTimeFrom: event.target.value });
                      }}
                    />
                    To
                  </span>
                  <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                    <MaskedTextBox
                      mask="00:00"
                      width="50px"
                      value={this.state.DayTimeTo}
                      onChange={(event) => {
                        this.setState({ DayTimeTo: event.target.value });
                      }}
                    />
                    HH: MM
                  </span>
                </div>
              </div>
              <div className="clearfix"></div>

              <br />

              <div className="row">
                <div className="col-lg-12">
                  <h6 className="mb-3 summaryGroupHeader">Benchmarks </h6>
                </div>
              </div>
              <div className="clearfix"></div>
              <div className="row">
                <div className="col-lg-6">
                  <label className="summaryLabelHeader-long">
                    Connection Time
                  </label>
                  <span style={{ paddingLeft: "15px" }}>
                    <NumericTextBox
                      format="n2"
                      width="100px"
                      value={this.state.DrlgBenchMark}
                      onChange={(event) => {
                        this.setState({ DrlgBenchMark: event.target.value });
                      }}
                    />
                    <span style={{ paddingLeft: "15px" }} > minutes</span>
                  </span>
                  <br />

                  <label className="summaryLabelHeader-long">
                    Bottom to Slips Time
                  </label>
                  <span style={{ paddingLeft: "15px" }}>
                    <NumericTextBox
                      format="n2"
                      width="100px"
                      value={this.state.BTSBenchMark}
                      onChange={(event) => {
                        this.setState({ BTSBenchMark: event.target.value });
                      }}
                    />
                    <span style={{ paddingLeft: "15px" }} > minutes</span>
                  </span>

                  <br />
                  <label className="summaryLabelHeader-long" >
                    Slips to Slip Time
                  </label>
                  <span style={{ paddingLeft: "15px" }}>
                    <NumericTextBox
                      format="n2"
                      width="100px"
                      value={this.state.STSBenchMark}
                      onChange={(event) => {
                        this.setState({ STSBenchMark: event.target.value });
                      }}
                    />
                    <span style={{ paddingLeft: "15px" }} > minutes</span>
                  </span>

                  <br />

                  <label className="summaryLabelHeader-long">
                    Slip To Bottom Time
                  </label>
                  <span style={{ paddingLeft: "15px" }}>
                    <NumericTextBox
                      format="n2"
                      width="100px"
                      value={this.state.STBBenchMark}
                      onChange={(event) => {
                        this.setState({ STBBenchMark: event.target.value });
                      }}
                    />
                    <span style={{ paddingLeft: "15px" }} > minutes</span>
                  </span>
                </div>
                <div className="col-lg-6">
                  <label className="summaryLabelHeader-long">
                    Target Conn. Time
                  </label>
                  <span className="mr-3" style={{ paddingLeft: "15px" }}>
                    <NumericTextBox
                      format="n2"
                      width="100px"
                      value={this.state.TargetTime}
                      onChange={(event) => {
                        this.setState({ TargetTime: event.target.value });
                      }}
                    />
                    <span style={{ paddingLeft: "15px" }} > minutes</span>
                  </span>
                  <br />
                  <label className="summaryLabelHeader-long">
                    Rig Cost/Day
                  </label>
                  <span style={{ paddingLeft: "15px" }}>
                    <NumericTextBox
                      format="n2"
                      width="100px"
                      value={this.state.RigCost}
                      onChange={(event) => {
                        this.setState({ RigCost: event.target.value });
                      }}
                    />
                  </span>
                  <span style={{ paddingLeft: "15px" }} > $</span>

                  <br />
                  <br />
                  <span>
                    {/* <Button>Copy benchmarks from well header</Button> */}
                  </span>
                </div>
              </div>

              <br />
              <br />

              <div className="row">
                <div className="col-lg-6">
                  <Button
                    id="cmdApplySettings"
                    onClick={() => {
                      this.saveSettings();
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </TabStripTab>
        </TabStrip>
      </>
    );
  }

  refreshChart = () => {
    try {
      this.objBTSChart.initialize();
      this.objSTSChart.initialize();
      this.objSTBChart.initialize();

      if (this.state.CurrentView == 0) {
        this.plotChartRegular();
      }

      if (this.state.CurrentView == 1) {
        //this.plotChartRigStateView();
        this.plotChartRegular();
      }
    } catch (error) { }
  };

  //This method redraws the chart for regular view,
  plotChartRegular = () => {
    try {
      //Clear all the series
      Util.StatusInfo("Please wait, plotting data");
      this.objBTSChart.DataSeries.clear();
      this.objBTSChart.updateChart();

      this.objSTSChart.DataSeries.clear();
      this.objSTSChart.updateChart();

      this.objSTBChart.DataSeries.clear();
      this.objSTBChart.updateChart();

      this.objBTSChart.leftAxis().AutoScale = true;
      this.objBTSChart.leftAxis().Min = 0;
      this.objBTSChart.leftAxis().Max = 100;
      this.objBTSChart.leftAxis().Inverted = false;
      this.objBTSChart.leftAxis().ShowLabels = true;
      this.objBTSChart.leftAxis().ShowTitle = true;
      this.objBTSChart.leftAxis().Title = "BTS Time (min.)";
      this.objBTSChart.leftAxis().PaddingMax = 10;

      this.objBTSChart.bottomAxis().AutoScale = true;
      this.objBTSChart.bottomAxis().bandScale = true;
      this.objBTSChart.bottomAxis().Min = 100;
      this.objBTSChart.bottomAxis().Max = 200;
      this.objBTSChart.bottomAxis().Title = "Depth (ft)";
      this.objBTSChart.bottomAxis().ShowLabels = false;
      this.objBTSChart.bottomAxis().ShowTitle = false;
      this.objBTSChart.bottomAxis().LabelAngel = 90;
      this.objBTSChart.bottomAxis().ShowSelector = false;
      this.objBTSChart.bottomAxis().IsDateTime = false;
      this.objBTSChart.bottomAxis().Visible = true;

      this.objBTSChart.rightAxis().Visible = false;
      this.objBTSChart.rightAxis().ShowTitle = false;
      this.objBTSChart.rightAxis().ShowLabels = false;

      this.objSTSChart.leftAxis().AutoScale = true;
      this.objSTSChart.leftAxis().Min = 0;
      this.objSTSChart.leftAxis().Max = 100;
      this.objSTSChart.leftAxis().Inverted = false;
      this.objSTSChart.leftAxis().ShowLabels = true;
      this.objSTSChart.leftAxis().ShowTitle = true;
      this.objSTSChart.leftAxis().Title = "STS Time (min.)";
      this.objSTSChart.leftAxis().PaddingMax = 10;

      this.objSTSChart.bottomAxis().AutoScale = true;
      this.objSTSChart.bottomAxis().bandScale = true;
      this.objSTSChart.bottomAxis().Min = 100;
      this.objSTSChart.bottomAxis().Max = 200;
      this.objSTSChart.bottomAxis().Title = "Depth (ft)";
      this.objSTSChart.bottomAxis().ShowLabels = false;
      this.objSTSChart.bottomAxis().ShowTitle = false;
      this.objSTSChart.bottomAxis().LabelAngel = 90;
      this.objSTSChart.bottomAxis().ShowSelector = false;
      this.objSTSChart.bottomAxis().IsDateTime = false;
      this.objSTSChart.bottomAxis().Visible = true;

      this.objSTSChart.rightAxis().AutoScale = true;
      this.objSTSChart.rightAxis().Min = 100;
      this.objSTSChart.rightAxis().Max = 200;
      this.objSTSChart.rightAxis().Title = "Cost $";
      this.objSTSChart.rightAxis().ShowLabels = true;
      this.objSTSChart.rightAxis().ShowTitle = true;
      this.objSTSChart.rightAxis().ShowSelector = false;
      this.objSTSChart.rightAxis().IsDateTime = false;
      this.objSTSChart.rightAxis().Visible = true;

      this.objSTBChart.leftAxis().AutoScale = true;
      this.objSTBChart.leftAxis().Min = 0;
      this.objSTBChart.leftAxis().Max = 100;
      this.objSTBChart.leftAxis().Inverted = false;
      this.objSTBChart.leftAxis().ShowLabels = true;
      this.objSTBChart.leftAxis().ShowTitle = true;
      this.objSTBChart.leftAxis().Title = "STB Time (min.)";

      this.objSTBChart.bottomAxis().AutoScale = true;
      this.objSTBChart.bottomAxis().bandScale = true;
      this.objSTBChart.bottomAxis().Min = 100;
      this.objSTBChart.bottomAxis().Max = 200;
      this.objSTBChart.bottomAxis().Title = "Depth (ft)";
      this.objSTBChart.bottomAxis().ShowLabels = true;
      this.objSTBChart.bottomAxis().ShowTitle = true;
      this.objSTBChart.bottomAxis().LabelAngel = 90;
      this.objSTBChart.bottomAxis().ShowSelector = false;
      this.objSTBChart.bottomAxis().IsDateTime = false;
      this.objSTBChart.bottomAxis().Visible = true;

      this.objSTBChart.rightAxis().Visible = false;
      this.objSTBChart.rightAxis().ShowTitle = false;
      this.objSTBChart.rightAxis().ShowLabels = false;

      //Add new serieses
      let objBTS = new DataSeries();
      objBTS.Id = "BTS";
      objBTS.Stacked = true;
      objBTS.Title = "Bottom To Slips";
      objBTS.Type = dataSeriesType.Bar;
      objBTS.Color = "#00E5FF"; //1089ff
      objBTS.XAxisId = this.objBTSChart.bottomAxis().Id;
      objBTS.YAxisId = this.objBTSChart.leftAxis().Id;
      this.objBTSChart.DataSeries.set(objBTS.Id, objBTS);

      let objSTS = new DataSeries();
      objSTS.Id = "STS";
      objSTS.Stacked = true;
      objSTS.Title = "Slips To Slips";
      objSTS.Type = dataSeriesType.Bar;
      objSTS.Color = "#00E676"; //ffc93c
      objSTS.XAxisId = this.objSTSChart.bottomAxis().Id;
      objSTS.YAxisId = this.objSTSChart.leftAxis().Id;
      objSTS.ColorEach = true;
      this.objSTSChart.DataSeries.set(objSTS.Id, objSTS);

      let objSTB = new DataSeries();
      objSTB.Id = "STB";
      objSTB.Stacked = true;
      objSTB.Title = "Slips To Bottom";
      objSTB.Type = dataSeriesType.Bar;
      objSTB.Color = "#FFEB3B"; //ec0101
      objSTB.XAxisId = this.objSTBChart.bottomAxis().Id;
      objSTB.YAxisId = this.objSTBChart.leftAxis().Id;
      this.objSTBChart.DataSeries.set(objSTB.Id, objSTB);

      let objSTSCost = new DataSeries();
      objSTSCost.Id = "STSCost";
      objSTSCost.Title = "STS Cost";
      objSTSCost.Type = dataSeriesType.Line;
      objSTSCost.Color = "#FF3D00"; //f58b54
      objSTSCost.XAxisId = this.objSTSChart.bottomAxis().Id;
      objSTSCost.YAxisId = this.objSTSChart.rightAxis().Id;
      objSTSCost.LineWidth = 3;
      this.objSTSChart.DataSeries.set(objSTSCost.Id, objSTSCost);

      //Fill up the data for data series
      for (let i = 0; i < this.objSummaryData.connData.length; i++) {
        let objBTSPoint = new ChartData();
        objBTSPoint.x = this.objSummaryData.connData[i]["DEPTH"];
        objBTSPoint.y = this.objSummaryData.connData[i]["BOTTOM_TO_SLIPS"];
        objBTS.Data.push(objBTSPoint);

        let objSTSPoint = new ChartData();
        objSTSPoint.x = this.objSummaryData.connData[i]["DEPTH"];
        objSTSPoint.y = this.objSummaryData.connData[i]["SLIPS_TO_SLIPS"];

        if (this.state.HighlightDayNight) {
          if (this.objSummaryData.connData[i]["DAY_NIGHT"] == "D") {
            objSTSPoint.color = "#00E676"; //ffc93c
          } else {
            objSTSPoint.color = "#bcbab8";
          }
        } else {
          objSTSPoint.color = "#00E676"; //ffc93c
        }

        objSTS.Data.push(objSTSPoint);

        let objSTBPoint = new ChartData();
        objSTBPoint.x = this.objSummaryData.connData[i]["DEPTH"];
        objSTBPoint.y = this.objSummaryData.connData[i]["SLIPS_TO_BOTTOM"];
        objSTB.Data.push(objSTBPoint);

        let objCost2Point = new ChartData();
        objCost2Point.x = this.objSummaryData.connData[i]["DEPTH"];
        objCost2Point.y = this.objSummaryData.connData[i]["STS_COST"];
        objSTSCost.Data.push(objCost2Point);
      }
      Util.StatusSuccess("Data successfully plotted");
      Util.StatusReady();
      this.objBTSChart.reDraw();
      this.objSTSChart.reDraw();
      this.objSTBChart.reDraw();
    } catch (error) { }
  };

  //This method redraws the chart for rig state view,
  plotChartRigStateView = () => {
    try {
      this.objBTSChart.DataSeries.clear();
      this.objBTSChart.updateChart();

      this.objSTSChart.DataSeries.clear();
      this.objSTSChart.updateChart();

      this.objSTBChart.DataSeries.clear();
      this.objSTBChart.updateChart();

      this.objBTSChart.leftAxis().AutoScale = true;
      this.objBTSChart.leftAxis().Min = 0;
      this.objBTSChart.leftAxis().Max = 100;
      this.objBTSChart.leftAxis().Inverted = false;
      this.objBTSChart.leftAxis().ShowLabels = true;
      this.objBTSChart.leftAxis().ShowTitle = true;
      this.objBTSChart.leftAxis().Title = "BTS Time (min.)";

      this.objBTSChart.bottomAxis().AutoScale = true;
      this.objBTSChart.bottomAxis().bandScale = true;
      this.objBTSChart.bottomAxis().Min = 100;
      this.objBTSChart.bottomAxis().Max = 200;
      this.objBTSChart.bottomAxis().Title = "Depth (ft)";
      this.objBTSChart.bottomAxis().ShowLabels = false;
      this.objBTSChart.bottomAxis().ShowTitle = false;
      this.objBTSChart.bottomAxis().LabelAngel = 90;
      this.objBTSChart.bottomAxis().ShowSelector = false;
      this.objBTSChart.bottomAxis().IsDateTime = false;
      this.objBTSChart.bottomAxis().Visible = true;

      this.objBTSChart.rightAxis().Visible = false;
      this.objBTSChart.rightAxis().ShowTitle = false;
      this.objBTSChart.rightAxis().ShowLabels = false;

      this.objSTSChart.leftAxis().AutoScale = true;
      this.objSTSChart.leftAxis().Min = 0;
      this.objSTSChart.leftAxis().Max = 100;
      this.objSTSChart.leftAxis().Inverted = false;
      this.objSTSChart.leftAxis().ShowLabels = true;
      this.objSTSChart.leftAxis().ShowTitle = true;
      this.objSTSChart.leftAxis().Title = "STS Time (min.)";

      this.objSTSChart.bottomAxis().AutoScale = true;
      this.objSTSChart.bottomAxis().bandScale = true;
      this.objSTSChart.bottomAxis().Min = 100;
      this.objSTSChart.bottomAxis().Max = 200;
      this.objSTSChart.bottomAxis().Title = "Depth (ft)";
      this.objSTSChart.bottomAxis().ShowLabels = false;
      this.objSTSChart.bottomAxis().ShowTitle = false;
      this.objSTSChart.bottomAxis().LabelAngel = 90;
      this.objSTSChart.bottomAxis().ShowSelector = false;
      this.objSTSChart.bottomAxis().IsDateTime = false;
      this.objSTSChart.bottomAxis().Visible = true;

      this.objSTSChart.rightAxis().AutoScale = true;
      this.objSTSChart.rightAxis().Min = 100;
      this.objSTSChart.rightAxis().Max = 200;
      this.objSTSChart.rightAxis().Title = "Cost $";
      this.objSTSChart.rightAxis().ShowLabels = true;
      this.objSTSChart.rightAxis().ShowTitle = true;
      this.objSTSChart.rightAxis().ShowSelector = false;
      this.objSTSChart.rightAxis().IsDateTime = false;
      this.objSTSChart.rightAxis().Visible = true;

      this.objSTBChart.leftAxis().AutoScale = true;
      this.objSTBChart.leftAxis().Min = 0;
      this.objSTBChart.leftAxis().Max = 100;
      this.objSTBChart.leftAxis().Inverted = false;
      this.objSTBChart.leftAxis().ShowLabels = true;
      this.objSTBChart.leftAxis().ShowTitle = true;
      this.objSTBChart.leftAxis().Title = "STB Time (min.)";

      this.objSTBChart.bottomAxis().AutoScale = true;
      this.objSTBChart.bottomAxis().bandScale = true;
      this.objSTBChart.bottomAxis().Min = 100;
      this.objSTBChart.bottomAxis().Max = 200;
      this.objSTBChart.bottomAxis().Title = "Depth (ft)";
      this.objSTBChart.bottomAxis().ShowLabels = true;
      this.objSTBChart.bottomAxis().ShowTitle = true;
      this.objSTBChart.bottomAxis().LabelAngel = 90;
      this.objSTBChart.bottomAxis().ShowSelector = false;
      this.objSTBChart.bottomAxis().IsDateTime = false;
      this.objSTBChart.bottomAxis().Visible = true;

      this.objSTBChart.rightAxis().Visible = false;
      this.objSTBChart.rightAxis().ShowTitle = false;
      this.objSTBChart.rightAxis().ShowLabels = false;

      // //Create series for each rig state
      // for (let i = 0; i < this.objSummaryData.rigStates.length; i++) {

      //   let objSeries = new DataSeries();
      //   objSeries.Id = this.objSummaryData.rigStates[i]["RIG_STATE"].toString();
      //   objSeries.Stacked = true;
      //   objSeries.Title = this.objSummaryData.rigStates[i]["RIG_STATE_NAME"].toString();
      //   objSeries.Type = dataSeriesType.Bar;
      //   objSeries.Color = this.objSummaryData.rigStates[i]["COLOR"].toString();
      //   objSeries.XAxisId = this.objChart.bottomAxis().Id;
      //   objSeries.YAxisId = this.objChart.leftAxis().Id;
      //   this.objChart.DataSeries.set(objSeries.Id, objSeries);

      // }

      // //Fill up the data for each series
      // for (let i = 0; i < this.objSummaryData.rigStateData.length; i++) {

      //   let arrRigStates: string[] = this.objSummaryData.rigStateData[i]["TIMES"].toString().split(',');

      //   for (let j = 0; j < this.objSummaryData.rigStates.length; j++) {

      //     let lnRigState: number = this.objSummaryData.rigStates[j]["RIG_STATE"];

      //     //Find the series with this rig state
      //     let objSeries: DataSeries = this.objChart.DataSeries.get(lnRigState.toString());

      //     if (objSeries != undefined) {

      //       let objDataPoint = new ChartData();
      //       objDataPoint.x = this.objSummaryData.rigStateData[i]["DEPTH"];
      //       objDataPoint.y = Number.parseFloat(arrRigStates[j]);
      //       objSeries.Data.push(objDataPoint);

      //     }
      //   }
      // }

      // let objCost = new DataSeries();
      // objCost.Id = "Cost";
      // objCost.Title = "Cost";
      // objCost.Type = dataSeriesType.Line;
      // objCost.Color = "#ce2e6c";
      // objCost.XAxisId = this.objChart.bottomAxis().Id;
      // objCost.YAxisId = this.objChart.rightAxis().Id;
      // objCost.LineWidth = 3;
      // this.objChart.DataSeries.set(objCost.Id, objCost);

      // let objSTSCost = new DataSeries();
      // objSTSCost.Id = "STSCost";
      // objSTSCost.Title = "STS Cost";
      // objSTSCost.Type = dataSeriesType.Line;
      // objSTSCost.Color = "#f58b54";
      // objSTSCost.XAxisId = this.objChart.bottomAxis().Id;
      // objSTSCost.YAxisId = this.objChart.rightAxis().Id;
      // objSTSCost.LineWidth = 3;
      // this.objChart.DataSeries.set(objSTSCost.Id, objSTSCost);

      // //Fill up the data for data series
      // for (let i = 0; i < this.objSummaryData.connData.length; i++) {

      //   let objCostPoint = new ChartData();
      //   objCostPoint.x = this.objSummaryData.connData[i]["DEPTH"];
      //   objCostPoint.y = this.objSummaryData.connData[i]["COST"];
      //   objCost.Data.push(objCostPoint);

      //   let objCost2Point = new ChartData();
      //   objCost2Point.x = this.objSummaryData.connData[i]["DEPTH"];
      //   objCost2Point.y = this.objSummaryData.connData[i]["STS_COST"];
      //   objSTSCost.Data.push(objCost2Point);

      // }

      // this.objChart.reDraw();
    } catch (error) { }
  };

  onBeforeDrawSeriesBTS = (e: ChartEventArgs, i: number) => {
    try {
      d3.select(".bts_benchmark").remove();

      if (this.state.CurrentView == 0 || this.state.CurrentView == 1) {
        let lnBenchMark = this.state.BTSBenchMark;

        if (lnBenchMark > 0) {
          let x1 = this.objBTSChart.__chartRect.left;
          let x2 = this.objBTSChart.__chartRect.right;
          let y1 = this.objBTSChart.leftAxis().ScaleRef(lnBenchMark);
          let y2 = y1 + 4;

          this.objBTSChart.SVGRef.append("g")
            .attr("class", "bts_benchmark")
            .append("rect")
            .attr("id", "bts_benchmark")
            .attr("x", x1)
            .attr("y", y1)
            .attr("width", x2 - x1)
            .attr("height", y2 - y1)
            .style("fill", "red")
            .style("opacity", 0.5);
        }
      }
    } catch (error) { }
  };

  onBeforeDrawSeriesSTS = (e: ChartEventArgs, i: number) => {
    try {
      d3.select(".sts_benchmark").remove();

      if (this.state.CurrentView == 0 || this.state.CurrentView == 1) {
        let lnBenchMark = this.state.STSBenchMark;

        if (lnBenchMark > 0) {
          let x1 = this.objSTSChart.__chartRect.left;
          let x2 = this.objSTSChart.__chartRect.right;
          let y1 = this.objSTSChart.leftAxis().ScaleRef(lnBenchMark);
          let y2 = y1 + 4;

          this.objSTSChart.SVGRef.append("g")
            .attr("class", "sts_benchmark")
            .append("rect")
            .attr("id", "sts_benchmark")
            .attr("x", x1)
            .attr("y", y1)
            .attr("width", x2 - x1)
            .attr("height", y2 - y1)
            .style("fill", "red")
            .style("opacity", 0.5);
        }
      }
    } catch (error) { }
  };

  onBeforeDrawSeriesSTB = (e: ChartEventArgs, i: number) => {
    try {
      d3.select(".stb_benchmark").remove();

      if (this.state.CurrentView == 0 || this.state.CurrentView == 1) {
        let lnBenchMark = this.state.STBBenchMark;

        if (lnBenchMark > 0) {
          let x1 = this.objSTBChart.__chartRect.left;
          let x2 = this.objSTBChart.__chartRect.right;
          let y1 = this.objSTBChart.leftAxis().ScaleRef(lnBenchMark);
          let y2 = y1 + 4;

          this.objSTBChart.SVGRef.append("g")
            .attr("class", "stb_benchmark")
            .append("rect")
            .attr("id", "stb_benchmark")
            .attr("x", x1)
            .attr("y", y1)
            .attr("width", x2 - x1)
            .attr("height", y2 - y1)
            .style("fill", "red")
            .style("opacity", 0.5);
        }
      }
    } catch (error) { }
  };
}

export default DrlgConnSummary2;
