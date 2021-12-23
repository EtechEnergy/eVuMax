import React, { Component, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import $ from "jquery";
import { Chart, lineStyle, curveStyle } from "../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../eVuMaxObjects/Chart/ChartData";
import {
  Axis,
  axisLabelStyle,
  axisPosition,
} from "../../eVuMaxObjects/Chart/Axis";
import {
  DataSeries,
  dataSeriesType,
} from "../../eVuMaxObjects/Chart/DataSeries";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import "@progress/kendo-react-intl";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import "react-router-dom";
import ProcessLoader from "../loader/loader";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import axios from "axios";
import "./DataSelector.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndent, faChartArea } from "@fortawesome/free-solid-svg-icons";

import { DateTimePicker } from "@progress/kendo-react-all";
import { RadioButton, NumericTextBox } from "@progress/kendo-react-inputs";

import GlobalMod from "../../objects/global";
import { Util } from "../../Models/eVuMax";
let _gMod = new GlobalMod();

interface IProps { }

interface IState {
  selectedval?: string;
  fromDate?: Date;
  toDate?: Date;
  fromDepth?: number;
  toDepth?: number;
}

class DataSelectorOriginal extends Component<IProps, IState> {
  //Changed by prath on 30-08-2021
  // constructor(parentRef, props: any) {
  //   super(props);
  //   this.__parentRef = parentRef;
  //   this.WellId = parentRef.WellId;
  //   this.state = { selectedval: "0" };
  // }


  constructor(props: any) {
    super(props);
    this.__parentRef = props;
    this.WellId = props.WellId;
    this.state = { selectedval: "-1" };
  }

  //=========================

  WellId: string = "";
  Mnemonic: string = "DEPTH";

  objChart: Chart;
  objLine: DataSeries;

  selectedTab: number = 0;

  __parentRef: any;

  //Initialize chart after component was mounted
  componentDidMount() {
    try {
      //Prepare chart object
      //initialize chart
      this.objChart = new Chart(this, "SelectorChart");
      this.objChart.ContainerId = "selector_chart";
      this.objChart.isZoomByRect = false; //No need to zoom

      this.objChart.leftAxis().AutoScale = true;
      this.objChart.leftAxis().setInitialRange();
      this.objChart.leftAxis().Inverted = true;
      this.objChart.leftAxis().ShowLabels = false;
      this.objChart.leftAxis().ShowTitle = false;
      this.objChart.leftAxis().Title = "MD";
      this.objChart.leftAxis().Visible = true;
      this.objChart.leftAxis().isAllowScrolling = false;
      this.objChart.leftAxis().PaddingMin = 0;
      this.objChart.leftAxis().PaddingMax = 0;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().IsDateTime = true;
      this.objChart.bottomAxis().setInitialRange();
      this.objChart.bottomAxis().Title = "Date Time";
      this.objChart.bottomAxis().ShowLabels = false;
      this.objChart.bottomAxis().ShowTitle = false;
      this.objChart.bottomAxis().LabelAngel = 90;
      this.objChart.bottomAxis().ShowSelector = true;
      this.objChart.bottomAxis().Visible = true;
      this.objChart.bottomAxis().isAllowScrolling = false;
      this.objChart.bottomAxis().PaddingMin = 0;
      this.objChart.bottomAxis().PaddingMax = 0;

      this.objChart.rightAxis().Visible = false;
      this.objChart.rightAxis().isAllowScrolling = false;
      this.objChart.rightAxis().ShowLabels = false;
      this.objChart.CrossHairRequire = false;

      this.objChart.MarginLeft = 0;
      this.objChart.MarginBottom = 0;
      this.objChart.MarginTop = 0;
      this.objChart.MarginRight = 0;

      this.objLine = new DataSeries();
      this.objLine.Id = "s" + this.getRandomNumber(100000, 999999).toString();
      this.objLine.Name = "Depth";
      this.objLine.XAxisId = this.objChart.bottomAxis().Id;
      this.objLine.YAxisId = this.objChart.leftAxis().Id;
      this.objLine.Type = dataSeriesType.Line;
      this.objLine.Title = "Measured Depth";
      this.objLine.Color = "#1762ad";
      this.objLine.LineStyle = lineStyle.solid;
      this.objLine.LineWidth = 2;
      this.objLine.ColorEach = true;
      this.objLine.CurveStyle = curveStyle.smooth;

      this.objChart.DataSeries.set(this.objLine.Id, this.objLine);

      this.objChart.initialize();


      this.objChart.reDraw();
      this.objChart.setSelectorDateRange(
        this.__parentRef.fromDate,
        this.__parentRef.toDate
      );


      alert(this.__parentRef.fromDate + " " + this.__parentRef.toDate);

      this.loadData();

      this.loadExtents();
      window.addEventListener("resize", this.reRenderChart);
    } catch (error) { }
  }

  reRenderChart = () => {
    try {
      //alert("rerender");
      this.forceUpdate();
      //window.addEventListener("resize", this.reRenderChart);

    } catch (error) { }
  };
  //This method will be called by chart component when user selects the data by using chart
  selectorChanged = (
    ptype: string,
    pfromdate: Date,
    ptodate: Date,
    pfromdepth: number,
    ptodepth: number
  ) => {
    try {
      this.setState({
        selectedval: ptype, fromDate: pfromdate,
        toDate: ptodate,
        fromDepth: pfromdepth,
        toDepth: ptodepth,
      });
      this.__parentRef.selectionChanged(
        this.state.selectedval,
        this.state.fromDate,
        this.state.toDate,
        this.state.fromDepth,
        this.state.toDepth
      );
    } catch (error) { }
  };

  componentWillUpdate() {
    try {
      //Update the chart
      this.objChart.updateChart();
    } catch (error) { }
  }

  //calls when user clicks on selection method buttons
  tabSelectionChanged = (s: number) => {
    try {
      if (s == this.selectedTab) {
        return;
      }

      if (s == 0) {
        this.selectedTab = 0;

        $("#manual").hide();
        $("#chart").show();
        $("#tab1").removeClass("non-selected");
        $("#tab1").addClass("selected");

        $("#tab2").removeClass("selected");
        $("#tab2").addClass("non-selected");

        this.objChart.updateChart();
      }

      if (s == 1) {
        this.selectedTab = 1;
        $("#chart").hide();
        $("#manual").show();

        $("#tab1").removeClass("selected");
        $("#tab1").addClass("non-selected");

        $("#tab2").removeClass("non-selected");
        $("#tab2").addClass("selected");
      }
    } catch (error) { }
  };

  getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  setSelectedVal = (e: string) => {
    try {
      this.setState({ selectedval: e });
    } catch (error) { }
  };

  render() {
    return (
      <React.Fragment>
        <div style={{ height: "90px", display: "flex" }}>
          <div
            style={{
              height: "100%",
              width: "50px",
              display: "inline-block",
            }}
          >
            <div
              id="tab1"
              className="selected"
              onClick={() => {
                this.tabSelectionChanged(0);
              }}
            >
              <div className="icon">
                <FontAwesomeIcon
                  className="icon-image"
                  icon={faChartArea}
                  size={"lg"}
                />
              </div>
            </div>

            <div
              id="tab2"
              className="non-selected"
              onClick={() => {
                this.tabSelectionChanged(1);
              }}
            >
              <div className="icon">
                <FontAwesomeIcon
                  className="icon-image"
                  icon={faIndent}
                  size={"lg"}
                />
              </div>
            </div>

            {/* <div id="loader" style={{ display: "none" }}>
              <ProcessLoader />
            </div> */}
          </div>

          <div
            id="chart"
            style={{
              height: "90px",
              width: "calc(100% - 50px)",
              display: "inline-block",
              float: "right",
            }}
          >
            <div
              id="selector_chart"
              style={{
                //height: "100%",
                height: "90px",
                flex: 1,
                //width: "98%",
                padding: "10px",
              }}
            ></div>
          </div>

          <div
            id="manual"
            style={{
              height: "100%",
              width: "calc(100% - 50px)",
              display: "none",
              float: "right",
            }}
          >
            <div className="row">
              <div className="col">
                <RadioButton
                  name="selectionby"
                  value="0"
                  checked={this.state.selectedval === "0"}
                  label="Select Data By DateTime"
                  onChange={() => {
                    this.setSelectedVal("0");
                  }}
                />

                <RadioButton
                  name="selectionby"
                  value="1"
                  checked={this.state.selectedval === "1"}
                  label="Select Data By Depth"
                  onChange={() => {
                    this.setSelectedVal("1");
                  }}
                />
              </div>
            </div>

            <div className="row mt-2">
              <div className="col">
                {this.state.selectedval == "0" ? (
                  <label className="mr-4">From Date </label>
                ) : (
                  ""
                )}

                {this.state.selectedval == "0" ? (
                  <DateTimePicker
                    name="txtFromDate"
                    value={this.state.fromDate}
                    format="MM/dd/yyyy HH:mm:ss"
                    formatPlaceholder={{
                      year: "yyyy",
                      month: "MM",
                      day: "dd",
                      hour: "HH",
                      minute: "mm",
                      second: "ss",
                    }}
                    onChange={(e) => {
                      this.setState({ fromDate: e.value });
                    }}
                  />
                ) : (
                  ""
                )}

                {this.state.selectedval == "0" ? (
                  <label className="mr-4 ml-4">To Date </label>
                ) : (
                  ""
                )}

                {this.state.selectedval == "0" ? (
                  <DateTimePicker
                    name="txtToDate"
                    value={this.state.toDate}
                    format="MM/dd/yyyy HH:mm:ss"
                    formatPlaceholder={{
                      year: "yyyy",
                      month: "MM",
                      day: "dd",
                      hour: "HH",
                      minute: "mm",
                      second: "ss",
                    }}
                    onChange={(e) => {
                      this.setState({ toDate: e.value });
                    }}
                  />
                ) : (
                  ""
                )}

                {this.state.selectedval == "1" ? (
                  <label className="mr-4">From Depth </label>
                ) : (
                  ""
                )}

                {this.state.selectedval == "1" ? (
                  <NumericTextBox
                    name="txtFromDepth"
                    value={this.state.fromDepth}
                    format="n2"
                    onChange={(e) => this.setState({ fromDepth: e.value })}
                  />
                ) : (
                  ""
                )}

                {this.state.selectedval == "1" ? (
                  <label className="mr-4 ml-4">To Depth </label>
                ) : (
                  ""
                )}

                {this.state.selectedval == "1" ? (
                  <NumericTextBox
                    name="txtToDepth"
                    value={this.state.toDepth}
                    format="n2"
                    onChange={(e) => this.setState({ toDepth: e.value })}
                  />
                ) : (
                  ""
                )}

                <button
                  type="button"
                  onClick={() => {
                    //call the parent to indicate the change
                    //this.objChart.setSelectorDateRange(this.state.fromDate,this.state.toDate);
                    this.__parentRef.selectionChanged(
                      this.state.selectedval,
                      this.state.fromDate,
                      this.state.toDate,
                      this.state.fromDepth,
                      this.state.toDepth
                    );
                  }}
                  className="btn-custom btn-custom-primary ml-5 mr-1"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  setData = (paramData: any) => {
    try {
      //Populate the data series with this data
      this.objLine.Data.slice(0, this.objLine.Data.length);

      for (let i = 0; i < paramData.length; i++) {
        let objVal: ChartData = new ChartData();
        objVal.datetime = new Date(Date.parse(paramData[i]["DATETIME1"]));
        objVal.y = Number(paramData[i]["DEPTH"]);
        objVal.color = paramData[i]["COLOR"]; //prath 26-11-2020
        //objVal.color = paramData[i]["RIG_STATE_COLOR"]; //prath 02-02-2021

        this.objLine.Data.push(objVal);
      }

      this.objChart.updateChart();
    } catch (error) { }
  };

  loadData = () => {
    try {
      Util.StatusInfo("Getting data from the server  ");
      this.WellId = "us_1395675560";
      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Common";
      objBrokerRequest.Broker = "TimeData";
      objBrokerRequest.Function = "TimeDataAll";

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );
      //PRATH 26-11-2020
      // let paramChannelList: BrokerParameter = new BrokerParameter(
      //   "ChannelList",
      //   "DATETIME,DEPTH"
      // );

      let paramChannelList: BrokerParameter = new BrokerParameter(
        "ChannelList",
        "DATETIME,DEPTH,RIG_STATE_COLOR"
      );
      //=========================
      let paramResolution: BrokerParameter = new BrokerParameter(
        "Resolution",
        "4000"
      );

      objBrokerRequest.Parameters.push(paramwellId);
      objBrokerRequest.Parameters.push(paramChannelList);
      objBrokerRequest.Parameters.push(paramResolution);

      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          const objData = JSON.parse(res.data.Response);
          this.setData(objData);
          Util.StatusSuccess("Data successfully retrived  ");
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
        });
    } catch (error) { }
  };

  loadExtents = () => {
    try {
      alert("Extent -" + this.state.fromDate);
      //Check if it  is required to load the extents
      if (this.state.fromDate != null) {
        //We already extracted extents, no need to repeat
        this.objChart.setSelectorDateRange(
          this.state.fromDate,
          this.state.toDate
        );
        return;
      }

      Util.StatusInfo("Getting data from the server  ");

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Common";
      objBrokerRequest.Broker = "TimeData";
      objBrokerRequest.Function = "TimeDataExtents";

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );

      objBrokerRequest.Parameters.push(paramwellId);

      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          let objData = JSON.parse(res.data.Response);

          //set the state
          alert("After received data from server -" + objData.MinDate + " - " + objData.MaxDate);
          this.setState({
            fromDate: new Date(objData.MinDate),
            toDate: new Date(objData.MaxDate),
            fromDepth: Number.parseFloat(objData.MinDepth),
            toDepth: Number.parseFloat(objData.MaxDepth),
          });

          this.setData(objData);
          Util.StatusSuccess("Data successfully retrived  ");
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
        });
    } catch (error) { }
  };
}

export default DataSelectorOriginal;
