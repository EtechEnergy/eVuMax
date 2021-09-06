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
import { confirmAlert } from "react-confirm-alert";
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
  GridSelectionChangeEvent,
  GridToolbar,
} from "@progress/kendo-react-grid";
import {
  TabStrip,
  TabStripTab,

  Button,

  Dialog
} from "@progress/kendo-react-all";


import { axisBottom, gray, json } from "d3";
import moment from "moment";
import { stat } from "fs";
import "./TripConnSummary.css";
import { faMoon, faSun, faUnderline, faUndo } from "@fortawesome/free-solid-svg-icons";
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";
import GlobalMod from "../../../objects/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Util } from "../../../Models/eVuMax";
import { isThisTypeNode } from "typescript";

let _gMod = new GlobalMod();

class TripConnSummary extends Component {
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;
  }

  state = {
    WellName: "",
    showCommentDialog: false,
    selected: 0,
    summaryData: [],
    currentDepth: 0,
    AvgTime: 0,
    AvgTimeD: 0,//Nishant 06-09-2021
    AvgDayTime: 0,
    AvgNightTime: 0,
    PositiveFlow: 0,
    NegativeFlow: 0,
    NetFlow: 0,
    ConnCount: 0,
    ExclConnCount: 0,
    CurrentView: 0,
    SkipConnMaxTime: false,
    MaxConnTime: 0,
    SkipConnMinTime: false,
    MinConnTime: 0,
    ShowExcludedConn: false,
    HighlightDayNight: false,
    DayTimeFrom: "",
    DayTimeTo: "",
    STSBenchMark: 0,
    TargetTime: 0,
    RigCost: 0,
    ShowComments: false,
    Comment: ""
  };

  WellId: string = "";
  objSummaryData: any; //Stores Connection Summary Data
  objUserSettings: any;

  //local variables
  _isLoading: boolean = false;
  objChart: Chart;

  selectionType: string = "-1";
  fromDate: Date = null;
  toDate: Date = null;
  fromDepth: number = 0;
  toDepth: number = 0;
  Warnings: string = "";

  componentDidMount() {
    try {
      //initialize chart
      this.objChart = new Chart(this, "ConnectionChart");
      this.objChart.ContainerId = "tripConnections";

      this.objChart.leftAxis().AutoScale = true;
      this.objChart.leftAxis().Min = 0;
      this.objChart.leftAxis().Max = 100;
      this.objChart.leftAxis().Inverted = false;
      this.objChart.leftAxis().ShowLabels = true;
      this.objChart.leftAxis().ShowTitle = true;
      this.objChart.leftAxis().Title = "Time (min.)";
      this.objChart.leftAxis().DisplayOrder = 1;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().bandScale = true;
      this.objChart.bottomAxis().Min = 100;
      this.objChart.bottomAxis().Max = 200;
      this.objChart.bottomAxis().Title = "Depth (ft)";
      this.objChart.bottomAxis().ShowLabels = true;
      this.objChart.bottomAxis().ShowTitle = true;
      this.objChart.bottomAxis().LabelAngel = 90;
      this.objChart.bottomAxis().ShowSelector = true;
      this.objChart.bottomAxis().IsDateTime = false;

      this.objChart.MarginLeft = 0;
      this.objChart.MarginBottom = 0;
      this.objChart.MarginTop = 0;
      this.objChart.MarginRight = 0;

      this.objChart.initialize();
      this.objChart.reDraw();
      this.objChart.onBeforeSeriesDraw.subscribe((e, i) => {
        this.onBeforeDrawSeries(e, i);
      });
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

      // alert("xxx");
      //

      this.setState({
        WellName: this.objSummaryData.WellName,
        summaryData: this.objSummaryData.connData,
        AvgTime: this.objSummaryData.avgTime,
        AvgTimeD: this.objSummaryData.avgTimeD,
        AvgNightTime: this.objSummaryData.avgTimeN,
        PositiveFlow: this.objSummaryData.PositiveCashFlow,
        NegativeFlow: this.objSummaryData.NegativeCashFlow,
        NetFlow: this.objSummaryData.NetCashFlow,
        ConnCount: this.objSummaryData.ConnCount,
        ExclConnCount: this.objSummaryData.ExcludedConns,
        SkipConnMaxTime: this.objUserSettings.SkipConnMaxTime,
        MaxConnTime: this.objUserSettings.MaxConnTime,
        SkipConnMinTime: this.objUserSettings.SkipConnMinTime,
        MinConnTime: this.objUserSettings.MinConnTime,
        ShowExcludedConn: this.objUserSettings.showExcludedConn,
        HighlightDayNight: this.objUserSettings.HighlightDayNight,
        DayTimeFrom: this.objUserSettings.DayTimeFrom,
        DayTimeTo: this.objUserSettings.DayTimeTo,
        STSBenchMark: this.objUserSettings.STSBenchMark,
        TargetTime: this.objUserSettings.TargetTime,
        RigCost: this.objUserSettings.RigCost,
      });

      document.title = this.state.WellName + " -Trip Conn. Summary"; //Nishant 02/09/2021

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
      objBrokerRequest.Broker = "TripConn";
      objBrokerRequest.Function = "TripConnSummary";

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


          this.Warnings = res.data.Warnings;


          if (this.Warnings.trim() != "") {
            $("#warning").css("backgroundColor", "#ffb74d");
            $("#lblWarning").text(res.data.Warnings);
          }
          else {
            $("#warning").css("backgroundColor", "transparent");
            $("#lblWarning").text("");
          }


          this.setData();

          // if (this.objSummaryData.tripInfoData.length > 0) {

          //   Util.StatusSuccess("Data successfully retrived  ");
          // } else {
          //   Util.StatusSuccess("Data not available");
          // }

          Util.StatusReady();
        })
        .catch((error) => {
          Util.StatusError(error.message);
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
      objBrokerRequest.Broker = "TripConn";
      objBrokerRequest.Function = "SaveUserSettings";

      this.objUserSettings.SkipConnMaxTime = this.state.SkipConnMaxTime;
      this.objUserSettings.MaxConnTime = this.state.MaxConnTime;
      this.objUserSettings.SkipConnMinTime = this.state.SkipConnMinTime;
      this.objUserSettings.MinConnTime = this.state.MinConnTime;
      this.objUserSettings.showExcludedConn = this.state.ShowExcludedConn;
      this.objUserSettings.HighlightDayNight = this.state.HighlightDayNight;
      this.objUserSettings.DayTimeFrom = this.state.DayTimeFrom;
      this.objUserSettings.DayTimeTo = this.state.DayTimeTo;
      this.objUserSettings.STSBenchMark = this.state.STSBenchMark;
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
          Util.StatusSuccess("Data successfully retrived  ");
          this.setState({ selected: 0 });
          //reload all the connections
          this.loadConnections();
        })
        .catch((error) => {
          Util.StatusError(error.message);
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

  //handleSubmit = (dataItem: any) => alert(JSON.stringify(dataItem, null, 2));


  addComment = () => {
    try {
      if (this.state.currentDepth == null) {
        confirmAlert({
          //title: 'eVuMax',
          message: 'Please select depth from list ..',
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
      }

      this.setState({ showCommentDialog: true });



    } catch (error) {

    }
  }


  removeComment = () => {
    try {
      if (this.state.currentDepth == null) {


        return;
      }


      confirmAlert({
        //title: 'eVuMax',
        message: 'Are you sure want to delete comment ?',
        childrenElement: () => <div />,
        buttons: [
          {
            label: 'Yes',
            onClick: async () => {
              //this.setState({ Comment: "" });
              await this.setState((prevState, props) => ({
                Comment: ""
              }));

              this.cmdSaveComment_click(false);
            }

          },
          {
            label: 'No',
            onClick: () => null
          }
        ]
      });




    } catch (error) {

    }
  }

  cmdSaveComment_click = (isAddComment: boolean) => {
    try {

      if (this.state.Comment == "" && isAddComment) {
        confirmAlert({
          //title: 'eVuMax',
          message: 'Please enter comment',
          childrenElement: () => <div />,
          buttons: [
            {
              label: 'Ok',
              onClick: () => {
                return;
                //
                // let sideTrackList = this.state.grdSideTrackList;
                // let objRow = rowData;
                // let ID = objRow.SideTrackID;
                // let index = sideTrackList.findIndex((d: any) => d.SideTrackID === ID); //find index in your array
                // sideTrackList.splice(index, 1);//remove element from array
                // this.setState({
                //     grdSideTrackList: sideTrackList
                // });
                // this.forceUpdate();
              }

            },
            // {
            //     label: 'No',
            //     onClick: () => null
            // }
          ]
        });
      }



      //for ConnectionData
      let index = this.state.summaryData.findIndex((d: any) => d.DEPTH === this.state.currentDepth); //find index in your array
      let edited = this.state.summaryData;

      //for RigstateData
      let indexRigstate = this.objSummaryData.rigStateData.findIndex((d: any) => d.DEPTH === this.state.currentDepth); //find index in your array
      let editedRigstate = this.objSummaryData.rigStateData;

      if (isAddComment) {
        edited[index]["COMMENTS"] = this.state.Comment;
        editedRigstate[indexRigstate]["COMMENTS"] = this.state.Comment;
      } else {
        this.setState({ Comment: "" });
        edited[index]["COMMENTS"] = "";
        editedRigstate[indexRigstate]["COMMENTS"] = "";
      }

      this.setState({ showCommentDialog: false });


      Util.StatusInfo("Getting data from the server  ");
      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "DrlgConn";
      objBrokerRequest.Function = "updateComments";

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


      let paramDepth: BrokerParameter = new BrokerParameter(
        "Depth",
        this.state.currentDepth.toString()
      );
      objBrokerRequest.Parameters.push(paramDepth);


      let paramComment: BrokerParameter = new BrokerParameter(
        "Comments",
        this.state.Comment.toString()
      );
      objBrokerRequest.Parameters.push(paramComment);

      axios
        .get(_gMod._performTask, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          Util.StatusSuccess("Data successfully retrived  ");
          Util.StatusReady();
          this.objSummaryData = JSON.parse(res.data.Response);
          this.setData();
        })
        .catch((error) => {
          Util.StatusError(error.message);
          Util.StatusReady();
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


  grdRowClick = (event: GridSelectionChangeEvent) => {
    try {


      this.setState({
        currentDepth: event.dataItem.DEPTH,
        Comment: event.dataItem.COMMENTS
      });

    } catch (error) {

    }
  }

  cmdCancelComment_click = () => {
    try {


      this.setState({
        Comment: "",
        showCommentDialog: false
      });
    } catch (error) {

    }
  }
  render() {
    return (
      <>

        <div className="row ml-1 mr-1">
          <div className="col-lg-12 eVumaxPanelTitle">
            <div>
              <label className="summaryTitle">{this.state.WellName}</label>
            </div>
          </div>
        </div>

        <TabStrip selected={this.state.selected} onSelect={this.handleSelect}  >
          <TabStripTab title="Trip Connections Summary">


            <div style={{ height: "45px", backgroundColor: "transparent" }}>
              <div
                className="form-group eVumaxPanelChart"
                style={{
                  marginTop: "10px",
                  float: "left",
                  height: "50px",
                  padding: "3px",
                  display: "contents",
                  backgroundColor: "transparent",
                }}
              >
                <label style={{ marginRight: "20px" }}> View</label>
                <RadioButton
                  name="opgView"
                  value={0}
                  checked={this.state.CurrentView === 0}
                  label="Standard"
                  onChange={() => {
                    this.setState({ CurrentView: 0 });
                  }}
                />
                <RadioButton
                  name="opgView1"
                  value={1}
                  checked={this.state.CurrentView === 1}
                  label="Rig State View"
                  onChange={() => {
                    this.setState({ CurrentView: 1 });
                  }}
                />
                <RadioButton
                  name="opgView1"
                  value={2}
                  checked={this.state.CurrentView === 2}
                  label="Cost View"
                  onChange={() => {
                    this.setState({ CurrentView: 2 });
                  }}
                />
                <RadioButton
                  name="opgView2"
                  value={3}
                  checked={this.state.CurrentView === 3}
                  label="Histogram"
                  onChange={() => {
                    this.setState({ CurrentView: 3 });
                  }}
                />
              </div>
              {/* vimal */}
              <div
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
              id="tripConnections"
              style={{
                height: "calc(100vh - 420px)",
                width: "calc(100vw - 200px)",
                backgroundColor: "transparent",
              }}
            >
            </div>

            <div
              id="tripConnections_legend"
              style={{
                textAlign: "center",
                height: "30px",
                //width: "calc(100vw - 200px)",
                backgroundColor: "transparent",
                display: "inline-block",
                minWidth: "800",
                minHeight: "500"

              }}
            ></div>

            <DataSelector {...this} />
          </TabStripTab>
          <TabStripTab title="Numeric Summary">
            <div style={{ marginTop: "10px" }}>
              <div className="row mb-3">
                <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                  <h6 className="summaryGroupHeader">Overall Summary</h6>

                  <div className="group-inline">
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. Time</label>
                      <label className="summaryLabel" id="txtAvgTime">
                        {this.state.AvgTime}
                      </label>
                    </div>
                  </div>
                  <h6 className="summaryGroupHeader">Day Time Summary</h6>

                  <div className="group-inline">
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. Time</label>
                      <label className="summaryLabel" id="txtAvgTimeD">
                        {/* Nishant 06-09-2021 */}
                        {this.state.AvgTimeD}
                      </label>
                    </div>
                  </div>

                  <h6 className="summaryGroupHeader">Night Time Summary</h6>

                  <div className="group-inline">
                    <div className="form-group">
                      <label className="summaryLabelHeader">Avg. Time</label>
                      <label className="summaryLabel" id="txtAvgTimeN">
                        {this.state.AvgNightTime}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                  <h6 className="summaryGroupHeader">Cash Flow</h6>
                  <div className="group-inline">
                    <div className="form-group">
                      <label className="summaryLabelHeader-long">
                        Positive Cash Flow
                      </label>
                      <label className="summaryLabel" id="txtPositiveFlow">
                        {this.state.PositiveFlow}
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="summaryLabelHeader-long">
                        Negative Cash Flow
                      </label>
                      <label className="summaryLabel" id="txtNegativeFlow">
                        {this.state.NegativeFlow}
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="summaryLabelHeader-long">
                        Net Cash Flow
                      </label>
                      <label className="summaryLabel" id="txtNetFlow">
                        {this.state.NetFlow}
                      </label>
                    </div>
                  </div>
                </div>
              </div>


              <br />


              <div className="row mb-3">
                <div className="col-xl-2">
                  <h6 className="summaryGroupHeader" style={{ float: "right" }}>Connection Details</h6>
                </div>
                <div className="col-xl-1">

                  <Button
                    id="cmdAddComment"
                    onClick={() => {
                      this.addComment();
                    }}
                  >
                    {/* <FontAwesomeIcon icon={faPencilAlt} onClick={() => {
          this.addComment();
        }} /> */}
                    Add Comment
                  </Button>
                </div>
                <div className="col-xl-2">
                  <Button
                    id="cmdAddComment"
                    onClick={() => {
                      this.removeComment();
                    }}

                  >Remove Comment
                  </Button>



                </div>
              </div>
              <br />

              <h6 className="summaryGroupHeader">Connection Details</h6>
              <div
                className="row mb-3"
                style={{
                  backgroundColor: "transparent",
                  width: "calc(100vw - 120px)",
                  minHeight: "400px",
                }}
              >
                <Grid
                  className="Table_Grid"
                  style={{
                    maxHeight: "450px",
                    // height: "450px",
                    width: "90%",
                  }}
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
                  onRowClick={this.grdRowClick}
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
                    field="COMMENTS"
                    headerClassName="text-center"
                    className="text-left"
                    title="Comments"
                    width="90px"
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
                    field="REMARKS"
                    headerClassName="text-center"
                    className="text-left"
                    title="Remarks"
                    width="90px"
                  />
                  {/* <Column
                                        field="DAY_NIGHT"
                                        headerClassName="text-center"
                                        className="text-left"
                                        title="Day Night"
                                        width="90px"
                                    /> */}
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
                    //vimal
                    field="COST"
                    headerClassName="text-center"
                    className="text-right"
                    title="Cost"
                    width="90px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span> {formatNumber(props.dataItem.COST, "n2")} </span>
                      </td>
                    )}
                  />
                  <Column
                    field="TARGET_COST"
                    headerClassName="text-center"
                    className="text-right"
                    title="Target Cost"
                    width="90px"
                  />
                  <Column
                    //vimal
                    field="DIFF"
                    headerClassName="text-center"
                    className="text-right"
                    title="Diff"
                    width="90px"
                    cell={(props) => (
                      <td className="text-right" style={{}}>
                        <span> {formatNumber(props.dataItem.DIFF, "n2")} </span>
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

                <div className="col-lg-12">
                  <Checkbox
                    className="mr-2"
                    label={"Skip connection having less time than"}
                    checked={this.state.SkipConnMinTime}
                    onChange={(event) => {
                      this.setState({ SkipConnMinTime: event.value });
                    }}
                  />
                  <span className="mr-2">
                    <NumericTextBox
                      value={this.state.MinConnTime}
                      format="n2"
                      width="100px"
                      onChange={(event) => {
                        this.setState({ MinConnTime: event.target.value });
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
                  <br />
                  <label className="summaryLabelHeader-long mr-3">
                    Slips to Slip Time
                  </label>
                  <span>
                    <NumericTextBox
                      format="n2"
                      width="80px"
                      value={this.state.STSBenchMark}
                      onChange={(event) => {
                        this.setState({ STSBenchMark: event.target.value });
                      }}
                    />
                    <label className="ml-3"> minutes</label>
                  </span>

                  <br />
                </div>
                <div className="col-lg-6">
                  <label className="summaryLabelHeader-long mr-3">
                    Target Conn. Time
                  </label>
                  <span className="mr-3">
                    <NumericTextBox
                      format="n2"
                      width="100px"
                      value={this.state.TargetTime}
                      onChange={(event) => {
                        this.setState({ TargetTime: event.target.value });
                      }}
                    />
                    <label className="ml-3"> minutes</label>
                  </span>
                  <br />
                  <label className="summaryLabelHeader-long mr-3">
                    Rig Cost/Day
                  </label>
                  <span>
                    <NumericTextBox
                      format="n2"
                      width="100px"
                      value={this.state.RigCost}
                      onChange={(event) => {
                        this.setState({ RigCost: event.target.value });
                      }}
                    />
                  </span>

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
                  <div
                    id="sloader"
                    style={{ marginLeft: "20px", display: "none" }}
                  >
                    <ProcessLoader />
                  </div>
                </div>
              </div>
            </div>
          </TabStripTab>
        </TabStrip>

        <div id="warning" style={{ padding: "0px", height: "20px", width: "100%", fontWeight: "normal", backgroundColor: "transparent", color: "black" }}> <label id="lblWarning" style={{ color: "black", marginLeft: "10px" }} ></label> </div>


        {this.state.showCommentDialog && (
          //style={{ height: '100%', width: '500px', top: 0, left: 0 }}
          <Dialog title={"Comment for Depth " + this.state.currentDepth}
            onClose={(e: any) => {
              this.setState({
                showCommentDialog: false
              })
            }}
          // modal={true}
          >
            <div className="row" >
              <div className="col-9">

                <Input
                  name="comment"
                  // style={{ width: "100%" }}
                  label="Comment"

                  value={this.state.Comment}
                  // onChange={this.handleChange}
                  onChange={(event) => {


                    this.setState({
                      Comment: event.target.value,
                    });
                  }}
                />


              </div>

            </div>
            <div className="row">
              <legend>

                <span className="float-left">  <button type="button" onClick={() => this.cmdSaveComment_click(true)} className="btn-custom btn-custom-primary mr-1">
                  Save</button>
                  <button type="button" onClick={this.cmdCancelComment_click} className="btn-custom btn-custom-primary ml-1">
                    Cancel</button>
                </span></legend>
            </div>

          </Dialog>
        )}

      </>
    );
  }

  refreshChart = () => {
    try {
      if (this.state.selected != 0) {
        return;
      }


      this.objChart.initialize();
      this.objChart.LegendPosition = 4;  //1 (left), 2 (right), 3 (top), 4 (bottom)

      if (this.state.CurrentView == 0) {
        this.plotChartRegular();
      }

      if (this.state.CurrentView == 1) {
        this.plotChartRigStateView();
      }

      if (this.state.CurrentView == 2) {
        this.plotChartCostView();
      }

      if (this.state.CurrentView == 3) {
        this.plotChartHistogram();
      }
    } catch (error) { }
  };

  //This method redraws the chart for regular view,
  plotChartRegular = () => {
    try {

      //Clear all the series
      Util.StatusInfo("Please wait, plotting data");
      this.objChart.DataSeries.clear();
      this.objChart.updateChart();
      this.objChart.ShowLegend = true;
      this.objChart.ShowCustomComments = this.state.ShowComments;

      //Configure Axes
      this.objChart.leftAxis().Inverted = false;
      this.objChart.leftAxis().AutoScale = true;
      this.objChart.leftAxis().Title = "Time (m)";
      this.objChart.leftAxis().ShowSelector = false;
      this.objChart.leftAxis().Visible = true;
      this.objChart.leftAxis().ShowLabels = true;
      this.objChart.leftAxis().ShowTitle = true;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().Title = "Depth";
      this.objChart.bottomAxis().LabelAngel = 90;
      this.objChart.bottomAxis().ShowSelector = false;
      this.objChart.bottomAxis().LabelStyle = axisLabelStyle.labels;
      this.objChart.bottomAxis().IsDateTime = true;
      this.objChart.bottomAxis().bandScale = true;

      this.objChart.rightAxis().ShowLabels = true;
      this.objChart.rightAxis().ShowTitle = true;
      this.objChart.rightAxis().Visible = true;
      this.objChart.rightAxis().AutoScale = true;
      this.objChart.rightAxis().Title = "Cost";
      this.objChart.rightAxis().Inverted = false;

      //Add new serieses

      let objSTS = new DataSeries();
      objSTS.Id = "STS";
      objSTS.Stacked = true;
      objSTS.Title = "Slips To Slips";
      objSTS.Type = dataSeriesType.Bar;
      objSTS.Color = "#00e676"; //"#ffc93c";
      objSTS.XAxisId = this.objChart.bottomAxis().Id;
      objSTS.YAxisId = this.objChart.leftAxis().Id;
      objSTS.ColorEach = true;

      this.objChart.DataSeries.set(objSTS.Id, objSTS);

      let objCost = new DataSeries();
      objCost.Id = "Cost";
      objCost.Title = "Cost";
      objCost.Type = dataSeriesType.Line;
      objCost.Color = "#d500f9";
      objCost.XAxisId = this.objChart.bottomAxis().Id;
      objCost.YAxisId = this.objChart.rightAxis().Id;
      objCost.LineWidth = 3;
      this.objChart.DataSeries.set(objCost.Id, objCost);

      this.objChart.bottomAxis().Labels = [];

      //Fill up the data for data series

      for (let i = 0; i < this.objSummaryData.connData.length; i++) {
        let Depth: number = this.objSummaryData.connData[i]["DEPTH"];

        this.objChart.bottomAxis().Labels.push(Depth.toString());

        let objSTSPoint = new ChartData();
        objSTSPoint.datetime = new Date(
          Date.parse(this.objSummaryData.connData[i]["FROM_DATE"])
        );
        objSTSPoint.y = this.objSummaryData.connData[i]["SLIPS_TO_SLIPS"];
        //objSTSPoint.x = this.objSummaryData.connData[i]["DEPTH"];

        objSTSPoint.label = this.objSummaryData.connData[i]["COMMENTS"];


        if (this.state.HighlightDayNight) {
          if (this.objSummaryData.connData[i]["DAY_NIGHT"] == "D") {
            objSTSPoint.color = "#00e676";
          } else {
            objSTSPoint.color = "#bcbab8";
          }
        } else {
          objSTSPoint.color = "#00e676";
        }

        objSTS.Data.push(objSTSPoint);

        let objCostPoint = new ChartData();
        objCostPoint.datetime = new Date(
          Date.parse(this.objSummaryData.connData[i]["FROM_DATE"])
        );
        objCostPoint.y = this.objSummaryData.connData[i]["COST"];
        //objCostPoint.x = this.objSummaryData.connData[i]["DEPTH"];
        objCostPoint.label = this.objSummaryData.connData[i]["COMMENTS"];
        objCost.Data.push(objCostPoint);
      }


      this.objChart.reDraw();
      Util.StatusSuccess("Data successfully plotted");
      Util.StatusReady();
    } catch (error) { }
  };

  plotChartCostView = () => {
    try {
      //Clear all the series

      this.objChart.DataSeries.clear();
      this.objChart.updateChart();
      this.objChart.ShowLegend = false;
      this.objChart.ShowCustomComments = this.state.ShowComments;

      //Configure Axes
      this.objChart.leftAxis().Inverted = false;
      this.objChart.leftAxis().AutoScale = true;
      this.objChart.leftAxis().Title = "Cost Diff";
      this.objChart.leftAxis().ShowSelector = false;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().Title = "Depth";
      this.objChart.bottomAxis().LabelAngel = 90;
      this.objChart.bottomAxis().ShowSelector = false;
      this.objChart.bottomAxis().IsDateTime = true;
      this.objChart.bottomAxis().bandScale = true;
      this.objChart.bottomAxis().LabelStyle = axisLabelStyle.labels;

      this.objChart.rightAxis().ShowLabels = false;
      this.objChart.rightAxis().ShowTitle = false;
      this.objChart.rightAxis().Visible = false;
      this.objChart.rightAxis().ShowLabels = false;
      this.objChart.rightAxis().ShowTitle = false;
      this.objChart.rightAxis().Title = "Cost";
      this.objChart.rightAxis().Inverted = true;




      //Add new serieses

      let objCost = new DataSeries();
      objCost.Id = "Cost";
      objCost.Stacked = true;
      objCost.Title = "Cost";
      objCost.Type = dataSeriesType.Bar;
      objCost.Color = "#1089ff";
      objCost.XAxisId = this.objChart.bottomAxis().Id;
      objCost.YAxisId = this.objChart.leftAxis().Id;
      objCost.ColorEach = true;
      this.objChart.DataSeries.set(objCost.Id, objCost);

      this.objChart.bottomAxis().Labels = [];

      //Fill up the data for data series
      for (let i = 0; i < this.objSummaryData.connData.length; i++) {
        let Depth: number = this.objSummaryData.connData[i]["DEPTH"];

        this.objChart.bottomAxis().Labels.push(Depth.toString());

        let objPoint = new ChartData();
        objPoint.datetime = new Date(
          Date.parse(this.objSummaryData.connData[i]["FROM_DATE"])
        );
        //objPoint.x=this.objSummaryData.connData[i]["DEPTH"];
        objPoint.y = this.objSummaryData.connData[i]["DIFF"];
        objPoint.label = this.objSummaryData.connData[i]["COMMENTS"];
        if (objPoint.y >= 0) {
          objPoint.color = "#79d70f";
        } else {
          objPoint.color = "#d32626";
        }

        objCost.Data.push(objPoint);
      }

      this.objChart.reDraw();
    } catch (error) { }
  };

  //This method redraws the chart for rig state view,
  plotChartRigStateView = () => {
    try {
      if (this.state.selected != 0) {
        return;
      }

      //Clear all the series

      this.objChart.DataSeries.clear();
      //this.objChart.updateChart();
      this.objChart.ShowLegend = true;
      this.objChart.ShowCustomComments = this.state.ShowComments;

      //Configure Axes
      this.objChart.leftAxis().Inverted = false;
      this.objChart.leftAxis().AutoScale = true;
      this.objChart.leftAxis().Title = "Time (m)";
      this.objChart.leftAxis().ShowSelector = false;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().Title = "Depth";
      this.objChart.bottomAxis().LabelAngel = 90;
      this.objChart.bottomAxis().ShowSelector = false;
      this.objChart.bottomAxis().bandScale = true;
      this.objChart.bottomAxis().IsDateTime = true;
      this.objChart.bottomAxis().LabelStyle = axisLabelStyle.labels;

      this.objChart.rightAxis().Visible = true;
      this.objChart.rightAxis().ShowLabels = true;
      this.objChart.rightAxis().ShowTitle = true;
      this.objChart.rightAxis().AutoScale = true;
      this.objChart.rightAxis().Title = "Cost";
      this.objChart.rightAxis().Inverted = false;

      //Create series for each rig state
      for (let i = 0; i < this.objSummaryData.rigStates.length; i++) {
        let objSeries = new DataSeries();
        objSeries.Id = this.objSummaryData.rigStates[i]["RIG_STATE"].toString();
        objSeries.Stacked = true;
        objSeries.Title =
          this.objSummaryData.rigStates[i]["RIG_STATE_NAME"].toString();
        objSeries.Type = dataSeriesType.Bar;
        objSeries.Color = this.objSummaryData.rigStates[i]["COLOR"].toString();
        objSeries.XAxisId = this.objChart.bottomAxis().Id;
        objSeries.YAxisId = this.objChart.leftAxis().Id;
        this.objChart.DataSeries.set(objSeries.Id, objSeries);
      }

      //Fill up the data for each series

      for (let i = 0; i < this.objSummaryData.rigStateData.length; i++) {
        let arrRigStates: string[] = this.objSummaryData.rigStateData[i][
          "TIMES"
        ]
          .toString()
          .split(",");

        for (let j = 0; j < this.objSummaryData.rigStates.length; j++) {
          let lnRigState: number =
            this.objSummaryData.rigStates[j]["RIG_STATE"];

          //Find the series with this rig state
          let objSeries: DataSeries = this.objChart.DataSeries.get(
            lnRigState.toString()
          );

          if (objSeries != undefined) {
            let objDataPoint = new ChartData();
            objDataPoint.datetime = new Date(
              Date.parse(this.objSummaryData.rigStateData[i]["FROM_DATE"])
            );
            //objDataPoint.x=this.objSummaryData.rigStateData[i]["DEPTH"];
            objDataPoint.y = Number.parseFloat(arrRigStates[j]);
            objDataPoint.label = this.objSummaryData.rigStateData[i]["COMMENTS"];

            objSeries.Data.push(objDataPoint);
          }
        }
      }

      this.objChart.bottomAxis().Labels = [];

      //Fill up the data for data series
      for (let i = 0; i < this.objSummaryData.connData.length; i++) {
        let Depth: number = this.objSummaryData.connData[i]["DEPTH"];
        this.objChart.bottomAxis().Labels.push(Depth.toString());
      }

      let objCost = new DataSeries();
      objCost.Id = "Cost";
      objCost.Title = "Cost";
      objCost.Type = dataSeriesType.Line;
      objCost.Color = "#ce2e6c";
      objCost.XAxisId = this.objChart.bottomAxis().Id;
      objCost.YAxisId = this.objChart.rightAxis().Id;
      objCost.LineWidth = 3;

      this.objChart.DataSeries.set(objCost.Id, objCost);

      //Fill up the data for data series
      for (let i = 0; i < this.objSummaryData.connData.length; i++) {
        let objCostPoint = new ChartData();
        objCostPoint.datetime = new Date(
          Date.parse(this.objSummaryData.connData[i]["FROM_DATE"])
        );
        //objCostPoint.x=this.objSummaryData.connData[i]["DEPTH"];
        objCostPoint.y = this.objSummaryData.connData[i]["COST"];
        objCostPoint.label = this.objSummaryData.connData[i]["COMMENTS"];
        objCost.Data.push(objCostPoint);
      }

      this.objChart.reDraw();
    } catch (error) { }
  };

  plotChartHistogram = () => {
    try {
      //Clear all the series

      this.objChart.DataSeries.clear();
      this.objChart.updateChart();
      this.objChart.ShowLegend = false;

      //Configure Axes
      this.objChart.leftAxis().Inverted = false;
      this.objChart.leftAxis().AutoScale = true;
      this.objChart.leftAxis().Title = "Time (m)";
      this.objChart.leftAxis().ShowSelector = false;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().Title = "No. of Connections";
      this.objChart.bottomAxis().LabelAngel = 90;
      this.objChart.bottomAxis().ShowSelector = false;
      this.objChart.bottomAxis().IsDateTime = false;
      //this.objChart.bottomAxis().bandScale = true;
      this.objChart.bottomAxis().LabelStyle = axisLabelStyle.values;

      this.objChart.rightAxis().ShowLabels = false;
      this.objChart.rightAxis().ShowTitle = false;
      this.objChart.rightAxis().Visible = false;
      this.objChart.rightAxis().Title = "Cost";
      this.objChart.rightAxis().Inverted = false;



      //Add new serieses

      let objHistogram = new DataSeries();
      objHistogram.Id = "Histogram";
      objHistogram.Stacked = true;
      objHistogram.Title = "Connection Histogram";
      objHistogram.Type = dataSeriesType.Bar;
      objHistogram.Color = "#cf7500";
      objHistogram.XAxisId = this.objChart.bottomAxis().Id;
      objHistogram.YAxisId = this.objChart.leftAxis().Id;
      objHistogram.ShowLabelOnSeries = true;

      this.objChart.DataSeries.set(objHistogram.Id, objHistogram);

      //Fill up the data for data series
      this.objSummaryData.histogramData = Object.values(
        this.objSummaryData.histogramData
      ).sort((a: any, b: any) => (a.X < b.X ? -1 : a.X > b.X ? 1 : 0));
      for (let i = 0; i < this.objSummaryData.histogramData.length; i++) {
        let objPoint = new ChartData();
        objPoint.x = this.objSummaryData.histogramData[i]["X"];
        objPoint.y = this.objSummaryData.histogramData[i]["Y"];
        objHistogram.Data.push(objPoint);
      }




      this.objChart.reDraw();
    } catch (error) { }
  };

  onBeforeDrawSeries = (e: ChartEventArgs, i: number) => {
    try {


      //return;

      d3.select(".sts_benchmark").remove();
      d3.select(".trip_highlight").remove();

      if (this.state.CurrentView == 0 || this.state.CurrentView == 1) {
        let lnBenchMark = this.objUserSettings.STSBenchMark;

        if (lnBenchMark > 0) {
          let x1 = this.objChart.__chartRect.left;
          let x2 = this.objChart.__chartRect.right;
          let y1 = this.objChart.leftAxis().ScaleRef(lnBenchMark);
          let y2 = y1 + 4;

          this.objChart.SVGRef.append("g")
            .attr("class", "sts_benchmark")
            .append("rect")
            .attr("id", "sts_benchmark")
            .attr("x", x1)
            .attr("y", y1)
            .attr("width", x2 - x1)
            .attr("height", y2 - y1)
            .style("fill", "#00A19D")
            .style("z-index", 1000)
          // .style("opacity", 0.5);
        }

        //Highlight Trip Directions
        for (let i = 0; i < this.objSummaryData.tripInfoData.length; i++) {
          let fromDate = new Date(
            Date.parse(this.objSummaryData.tripInfoData[i]["FROM_DATE"])
          );
          let toDate = new Date(
            Date.parse(this.objSummaryData.tripInfoData[i]["TO_DATE"])
          );

          let x1 = this.objChart.bottomAxis().ScaleRef(fromDate);
          let x2 = this.objChart.bottomAxis().ScaleRef(toDate);
          let y1 = this.objChart.__chartRect.top;
          let y2 = this.objChart.__chartRect.bottom;

          let tripDirection: Number =
            this.objSummaryData.tripInfoData[i]["DIRECTION"];
          let tripColor: string = "grey";

          if (tripDirection == 0) {
            tripColor = "grey";
          } else {
            tripColor = "lightgreen";
          }

          this.objChart.SVGRef.append("g")
            .attr("class", "trip_highlight")
            .append("rect")
            .attr("id", "trip_highlight")
            .attr("x", x1)
            .attr("y", y1)
            .attr("width", x2 - x1)
            .attr("height", y2 - y1)
            .style("fill", tripColor)
            .style("opacity", 0.1);
        }
      }
    } catch (error) { }
  };
}

export default TripConnSummary;
