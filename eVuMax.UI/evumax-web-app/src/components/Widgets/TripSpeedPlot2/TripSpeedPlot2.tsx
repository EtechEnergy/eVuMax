import React, { Component } from "react";
import * as d3 from "d3";
import axios from "axios";
import { Chart, lineStyle } from "../../../eVuMaxObjects/Chart/Chart";
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
import "./TripSpeedPlot2.css";

import * as utilFunc from "../../../utilFunctions/utilFunctions";
import GlobalMod from "../../../objects/global";
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-all";
import TripAnalyzerSelection from "../TripAnalyzerSelection/TripAnalyzerSelection";
import { axisLabelStyle } from "../../../eVuMaxObjects/Chart/Axis";
import { Util } from "../../../Models/eVuMax";

let _gMod = new GlobalMod();

export class TripSpeedPlot2 extends Component {
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;
  }
  state = {
    WellName: "",
    selectedTab: 0,
    objTripSpeedData: {} as any,
    objUserSettings: {} as any,

    isProcess: false,
  };

  PlotId: "TripSpeed2";
  WellId: string = "";
  objChart_TripSpeed2: Chart;

  componentDidMount() {
    try {
      //initialize chart
      this.initilizeCharts();
      //alert("Component Mount");
      this.loadConnections();
      window.addEventListener("resize", this.refreshChart);
    } catch (error) { }
  }

  componentDidUpdate() {
    try {
      this.refreshChart();
    } catch (error) { }
  }

  initilizeCharts = () => {
    try {
      //======================= BarWithConn
      this.objChart_TripSpeed2 = new Chart(this, "objChart_TripSpeed");
      this.objChart_TripSpeed2.ContainerId = "TripSpeed2";

      // // //Configure Axes
      this.objChart_TripSpeed2.leftAxis().AutoScale = true;
      this.objChart_TripSpeed2.leftAxis().Min = 0;
      this.objChart_TripSpeed2.leftAxis().Max = 100;
      this.objChart_TripSpeed2.leftAxis().Inverted = false;
      this.objChart_TripSpeed2.leftAxis().ShowLabels = true;
      this.objChart_TripSpeed2.leftAxis().ShowTitle = true;
      this.objChart_TripSpeed2.leftAxis().Title =
        "Trip Speed(" + this.state.objTripSpeedData.DepthVumaxUnitID + "/hr)";
      this.objChart_TripSpeed2.leftAxis().Visible = true;
      this.objChart_TripSpeed2.leftAxis().PaddingMin = 0;
      this.objChart_TripSpeed2.leftAxis().PaddingMax = 10;

      this.objChart_TripSpeed2.bottomAxis().AutoScale = true;
      this.objChart_TripSpeed2.bottomAxis().bandScale = true;
      this.objChart_TripSpeed2.bottomAxis().Min = 100;
      this.objChart_TripSpeed2.bottomAxis().Max = 200;
      this.objChart_TripSpeed2.bottomAxis().Title = "";
      this.objChart_TripSpeed2.bottomAxis().ShowLabels = true;
      this.objChart_TripSpeed2.bottomAxis().ShowTitle = true;
      this.objChart_TripSpeed2.bottomAxis().LabelAngel = 90;
      this.objChart_TripSpeed2.bottomAxis().ShowSelector = true;
      this.objChart_TripSpeed2.bottomAxis().IsDateTime = false;
      this.objChart_TripSpeed2.bottomAxis().Visible = true;

      this.objChart_TripSpeed2.rightAxis().ShowLabels = false;
      this.objChart_TripSpeed2.rightAxis().ShowTitle = false;
      this.objChart_TripSpeed2.rightAxis().Visible = false;
      this.objChart_TripSpeed2.rightAxis().ShowLabels = false;
      this.objChart_TripSpeed2.rightAxis().ShowTitle = false;

      this.objChart_TripSpeed2.topAxis().ShowLabels = false;
      this.objChart_TripSpeed2.topAxis().Visible = false;

      this.objChart_TripSpeed2.MarginLeft = 70;
      this.objChart_TripSpeed2.MarginBottom = 40;
      this.objChart_TripSpeed2.MarginTop = 50;
      this.objChart_TripSpeed2.MarginRight = 10;

      this.objChart_TripSpeed2.initialize();
      this.objChart_TripSpeed2.reDraw();
    } catch (error) { }
  };

  refreshChart = () => {
    try {
      this.refreshTripSpeed2Chart();
    } catch (error) { }
  };

  refreshTripSpeed2Chart() {
    this.objChart_TripSpeed2.initialize();

    //Clear all the series
    this.objChart_TripSpeed2.DataSeries.clear();
    this.objChart_TripSpeed2.updateChart();

    // //Configure Axes
    this.objChart_TripSpeed2.leftAxis().Inverted = false;
    this.objChart_TripSpeed2.leftAxis().AutoScale = true;
    this.objChart_TripSpeed2.leftAxis().Min = 0;
    this.objChart_TripSpeed2.leftAxis().Max = 100;
    this.objChart_TripSpeed2.MarginBottom = 100;

    //Check BanchMark Value if greater then Max value of Axis then set
    let UseDepthRanges = this.state.objUserSettings.UseDepthRanges;
    this.objChart_TripSpeed2.leftAxis().Title =
      "Trip Speed (" + this.state.objTripSpeedData.DepthVumaxUnitID + "/hr)";
    this.objChart_TripSpeed2.leftAxis().ShowSelector = false;

    this.objChart_TripSpeed2.bottomAxis().AutoScale = true;
    this.objChart_TripSpeed2.bottomAxis().Title = "";
    this.objChart_TripSpeed2.bottomAxis().LabelAngel = 0;
    this.objChart_TripSpeed2.bottomAxis().ShowSelector = false;
    this.objChart_TripSpeed2.bottomAxis().LabelStyle = axisLabelStyle.labels;

    this.objChart_TripSpeed2.bottomAxis().Labels = [];

    this.objChart_TripSpeed2.rightAxis().ShowLabels = false;
    this.objChart_TripSpeed2.rightAxis().ShowTitle = false;
    this.objChart_TripSpeed2.rightAxis().Visible = false;
    this.objChart_TripSpeed2.rightAxis().ShowLabels = false;
    this.objChart_TripSpeed2.rightAxis().ShowTitle = false;

    let objSeries = new DataSeries();
    objSeries.Id = "Series1"; // + index;
    objSeries.Stacked = false;

    objSeries.ShowLabelOnSeries = true; //Parth 05-10-2020
    objSeries.Title = "Series1";
    objSeries.Type = dataSeriesType.Bar;
    objSeries.ColorEach = false; //prath
    objSeries.XAxisId = this.objChart_TripSpeed2.bottomAxis().Id;
    objSeries.YAxisId = this.objChart_TripSpeed2.leftAxis().Id;
    objSeries.Title = "Trip Speed W/O Connection";
    objSeries.Color = "#69F0AE";
    objSeries.ShowInLegend = true;
    this.objChart_TripSpeed2.DataSeries.set(objSeries.Id, objSeries);

    ///series 2
    let objSeries2 = new DataSeries();
    objSeries2.Id = "Series2";
    objSeries2.Stacked = false;

    objSeries2.ShowLabelOnSeries = false; //Parth 05-10-2020
    objSeries2.Title = "Series2";
    objSeries2.Type = dataSeriesType.Bar;
    objSeries2.ColorEach = false; //prath
    objSeries2.XAxisId = this.objChart_TripSpeed2.bottomAxis().Id;
    objSeries2.YAxisId = this.objChart_TripSpeed2.leftAxis().Id;
    objSeries2.Title = "Trip Speed Connection";
    objSeries2.Color = "#FFC400";
    objSeries2.ShowInLegend = true;

    this.objChart_TripSpeed2.DataSeries.set(objSeries2.Id, objSeries2);

    this.objChart_TripSpeed2.bottomAxis().ShowLabels = true;

    if (this.state.objUserSettings.UseDepthRanges) {
      let Counter = 0;
      let objTagDepthInfo = Object.values(
        this.state.objUserSettings.TagDepthInformation
      );

      for (let i = 0; i < objTagDepthInfo.length; i++) {
        const objItem: any = objTagDepthInfo[i];
        let index = Object.values(
          this.state.objUserSettings.TagSelection
        ).findIndex((item: any) => item == objItem.PhaseIndex);

        if (index > -1) {
          //found

          let DepthRangeArr = Object.values(objItem.DepthRanges);
          for (let j = 0; j < DepthRangeArr.length; j++) {
            //for (let j = 0; j < 5000; j++) { //just for testing
            //const min = 1;
            //const max = 1000;
            //let rand = min + Math.random() * (max - min);

            const objRange: any = DepthRangeArr[j];

            //Add value to Bar1
            let objVal: ChartData = new ChartData();
            objVal.x = Counter;
            objVal.y = objRange.TripSpeedWOConnection; //rand;//
            objSeries.Data.push(objVal);

            //Add value to Bar2

            objVal = new ChartData();
            objVal.x = Counter;
            objVal.y = objRange.TripSpeedWithConnection; //rand; //
            objSeries2.Data.push(objVal);

            Counter++;
            console.log("ETECH ", objRange);
            //axis label
            this.objChart_TripSpeed2.bottomAxis().Labels.push(
              objRange.LabelText +
              "~" +
              objRange.TimeLogName +
              //j.toString() +
              "~" +
              objItem.TripDirection +
              "~" +
              "(" +
              Number(objItem.TripDepthFrom).toFixed(2) +
              "-" +
              Number(objItem.TripDepthTo).toFixed(2) +
              ")"
            );
          }
        }
      }
    } else {
      let objTagDepthInfo = Object.values(
        this.state.objUserSettings.TagDepthInformation
      );
      for (let i = 0; i < objTagDepthInfo.length; i++) {
        const objItem: any = objTagDepthInfo[i];
        let index = Object.values(
          this.state.objUserSettings.TagSelection
        ).findIndex((item: any) => item == objItem.PhaseIndex);

        if (index > -1) {
          //found
          //Add value to Bar1/ Bar2
          let objVal: ChartData = new ChartData();
          objVal.x = i;
          objVal.y = objItem.TripSpeedWithoutConnections;
          objSeries.Data.push(objVal);

          //Add value to Bar1/ Bar2
          objVal = new ChartData();
          objVal.x = i;
          objVal.y = objItem.TripSpeedWithConnections;
          objVal.label = "DD";

          //lable Value
          this.objChart_TripSpeed2
            .bottomAxis()
            .Labels.push(
              objItem.TimeLogName +
              "~" +
              objItem.TripDirection +
              "~" +
              "(" +
              Number(objItem.TripDepthFrom).toFixed(2) +
              "-" +
              Number(objItem.TripDepthTo).toFixed(2) +
              ")"
            );

          objSeries2.Data.push(objVal);
        }
      }
    }


    this.objChart_TripSpeed2.reDraw();
  }

  loadConnections = () => {
    try {
      Util.StatusInfo("Getting data from the server  ");
      this.setState({
        //isProcess: true,
        selectedTab: 0,
      });
      //this.forceUpdate();

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "TripSpeedPlot";
      objBrokerRequest.Function = "TripSpeed2";

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

          Util.StatusSuccess("Data successfully retrived  ");

          let objData = JSON.parse(res.data.Response);

          console.log(objData);
          this.setState({
            WellName: objData.WellName,
            objTripSpeedData: objData,
            objUserSettings: objData.objUserSettings,
            isProcess: false,
          });
          Util.StatusReady();
          // this.forceUpdate();
          // this.refreshChart();
        })
        .catch((error) => {
          // this.setState({
          //   isProcess: false,
          // });
          Util.StatusError(error.message);
          this.forceUpdate();

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
    this.setState({ selectedTab: e.selected });
  };

  render() {
    let loader = this.state.isProcess;

    // let rotateColor: string = this.getRigStateColor(0);
    // let slideColor: string = this.getRigStateColor(1);

    return (
      <div>
        <div className="row">
          <div className="col-lg-2 row">

            <label className="summaryTitle">{this.state.WellName}  </label>
            {loader ? <ProcessLoader /> : ""}
          </div>
        </div>
        <div className="clearfix"></div>

        <div className="row">
          <TabStrip
            selected={this.state.selectedTab}
            onSelect={this.handleSelect}
            keepTabsMounted={true}
          >
            <TabStripTab title="Trip Speed Summary">
              <div id="tabTripSpeedPlot">
                <div className="row">
                  <div className="col-lg-4">
                    <div
                      id="TripSpeed2"
                      style={{
                        height: "calc(77vh)",

                        width: "calc(90vw)",
                        backgroundColor: "transparent",
                        // float: "right",
                        marginLeft: "10px",
                      }}
                    ></div>
                    <div
                      id="TripSpeed2_legend"
                      style={{
                        textAlign: "center",
                        height: "40px",
                        width: "calc(80vw )",
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
                  height: "80vh",
                  width: "calc(100vw - 150px)",
                  backgroundColor: "transparent",
                }}
              >
                <TripAnalyzerSelection
                  {...this}
                  plotID="TripSpeed2"
                ></TripAnalyzerSelection>
              </div>
            </TabStripTab>
          </TabStrip>
        </div>
      </div>
    );
  }
}

export default TripSpeedPlot2;
