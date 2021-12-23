import React, { Component } from "react";
import * as d3 from "d3";
import axios from "axios";
import { Chart, lineStyle } from "../../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import {
  DataSeries,
  dataSeriesType,

} from "../../../eVuMaxObjects/Chart/DataSeries";
import ProcessLoader from "../../loader/loader";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import "./TripSpeedPlot2.css";


import GlobalMod from "../../../objects/global";

import { TabStrip, TabStripTab } from "@progress/kendo-react-all";
import TripAnalyzerSelection from "../TripAnalyzerSelection/TripAnalyzerSelection";
import { axisLabelStyle } from "../../../eVuMaxObjects/Chart/Axis";
import { Util } from "../../../Models/eVuMax";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListAlt } from "@fortawesome/free-solid-svg-icons";
import { ClientLogger } from "../../ClientLogger/ClientLogger";

import NotifyMe from 'react-notification-timeline';
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";


let _gMod = new GlobalMod();

export class TripSpeedPlot2 extends Component {
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;
    this.objLogger.wellID = this.WellId;
  }

  objLogger: ClientLogger = new ClientLogger("TripSpeedPlot2", _gMod._userId);
  state = {
    warningMsg: [],
    WellName: "",
    selectedTab: 0,
    objTripSpeedData: {} as any,
    objUserSettings: {} as any,
    maxWithAndWOConn: 0,
    isProcess: false,
  };

  PlotId: "TripSpeed2";
  WellId: string = "";
  objChart_TripSpeed2: Chart;

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
      _gMod = new GlobalMod();
      if (_gMod._userId == "" || _gMod._userId == undefined) {
        window.location.href = "/evumaxapp/";
        return;
      }
      // this.objLogger.SendLog("Test Logger");
      //initialize chart
      this.initilizeCharts();
      //alert("Component Mount");
      this.loadConnections();
      window.addEventListener("resize", this.refreshChart);

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
    this.getMaxTripSpeed();
    this.objChart_TripSpeed2.initialize();
    this.objChart_TripSpeed2.LegendPosition = 4;  //1 (left), 2 (right), 3 (top), 4 (bottom)
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

    //Nishant 22-10-2021
    // this.objChart_TripSpeed2.leftAxis().AutoScale = false;
    // this.objChart_TripSpeed2.leftAxis().Max = this.state.maxWithAndWOConn;
    ////***************** */

    this.objChart_TripSpeed2.onBeforeSeriesDraw.subscribe((e, i) => {
      this.onBeforeDrawSeries(e, i);
    });


    let objSeries = new DataSeries();
    objSeries.Id = "Series1"; // + index;
    objSeries.Stacked = false;

    objSeries.ShowLabelOnSeries = true; //Parth 05-10-2020
    objSeries.Title = "Series1";
    objSeries.Type = dataSeriesType.Bar;
    objSeries.ColorEach = false; //prath
    objSeries.XAxisId = this.objChart_TripSpeed2.bottomAxis().Id;
    objSeries.YAxisId = this.objChart_TripSpeed2.leftAxis().Id;
    objSeries.Title = "Trip Speed W/o Connection";
    objSeries.Color = "#228B22";//"#69F0AE";
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
    objSeries2.Color = "#1E90FF"; //#FFC400";
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

  onBeforeDrawSeries = (e: ChartEventArgs, i: number) => {
    try {
      d3.select(".tripWO_benchmark").remove();

      let lnBenchMarkWOConn =
        this.state.objUserSettings.objBenchMarks.TripSpeedWOConnection;

      if (lnBenchMarkWOConn > 0) {
        let x1 = this.objChart_TripSpeed2.__chartRect.left;
        let x2 = this.objChart_TripSpeed2.__chartRect.right;
        let y1 = this.objChart_TripSpeed2.leftAxis().ScaleRef(lnBenchMarkWOConn);
        let y2 = y1 + 4;

        this.objChart_TripSpeed2.SVGRef.append("g")
          .attr("class", "tripWO_benchmark")
          .append("rect")
          .attr("id", "tripWO_benchmark")
          .attr("x", x1)
          .attr("y", y1)
          .attr("width", x2 - x1)
          .attr("height", y2 - y1)
          .style("fill", "#228B22");
      }


      d3.select(".tripWith_benchmark").remove();

      let lnBenchMarkWithConn =
        this.state.objUserSettings.objBenchMarks.TripSpeedWithConnection;
      //alert(lnBenchMarkWithConn);

      if (lnBenchMarkWithConn > 0) {
        // if (this.objChart_BarWithConn.leftAxis().Max < lnBenchMarkWithConn) {
        //     this.objChart_BarWithConn.leftAxis().Max = lnBenchMarkWithConn + lnBenchMarkWithConn * 0.10;
        //

        // }

        let x1 = this.objChart_TripSpeed2.__chartRect.left;
        let x2 = this.objChart_TripSpeed2.__chartRect.right;
        let y1 = this.objChart_TripSpeed2
          .leftAxis()
          .ScaleRef(lnBenchMarkWithConn);
        let y2 = y1 + 4;

        this.objChart_TripSpeed2.SVGRef.append("g")
          .attr("class", "tripWith_benchmark")
          .append("rect")
          .attr("id", "tripWith_benchmark")
          .attr("x", x1)
          .attr("y", y1)
          .attr("width", x2 - x1)
          .attr("height", y2 - y1)
          .style("fill", "#1E90FF");
      }

    } catch (error) { }
  };

  //Nishant 22-10-2021
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

          Util.StatusSuccess("Data successfully retrived  ");
          
          let objData = JSON.parse(res.data.Response);
          
          //Warnings Notifications
          let warnings: string = res.data.Warnings;
          if (warnings.trim() != "") {
            let warningList = [];
            warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
            this.setState({
              warningMsg: warningList
            });
          } else {
            this.setState({
              warningMsg: []
            });
          }


          this.setState({
            WellName: objData.WellName,
            objTripSpeedData: objData,
            objUserSettings: objData.objUserSettings,
            isProcess: false,
          });
          Util.StatusReady();
          document.title = this.state.WellName + " -Trip Speed-2"; //Nishant 02/09/2021

this.refreshChart();

        })
        .catch((error) => {
          // this.setState({
          //   isProcess: false,
          // });
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

  handleSelect = (e: any) => {
    this.setState({ selectedTab: e.selected });
  };

  render() {
    let loader = this.state.isProcess;

    // let rotateColor: string = this.getRigStateColor(0);
    // let slideColor: string = this.getRigStateColor(1);

    return (
      <div>
        <div className="row" style={{justifyContent:"space-between"}}>
          <div className="">

            <label className="summaryTitle">{this.state.WellName}  </label>
            {loader ? <ProcessLoader /> : ""}
          </div>

          <div className="form-inline m-1">
            <div className="eVumaxPanelController" style={{ float: "right", visibility: this.objLogger.LogList.length > 0 ? "visible" : "hidden", width: "170px" }}>

              {this.objLogger.LogList.length > 0 && <><label className=" ml-2 mr-1" onClick={() => {
                this.objLogger.downloadFile();
              }} style={{ cursor: "pointer" }}>Download Log</label><FontAwesomeIcon icon={faListAlt} size="lg" onClick={() => {

                this.objLogger.downloadFile();

              }} /></>
              }
            </div>

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
            // markAsReadFn={() => 
            //   this.state.warningMsg = []
            // }
            />
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
                        height: "calc(75vh)",

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
                        //width: "calc(90vw )",
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
                {/* <TripAnalyzerSelection
                  {...this}
                  plotID="TripSpeed2"
                ></TripAnalyzerSelection> */}
                <TripAnalyzerSelection
                  WellID={this.WellId}
                  plotID="TripSpeed2"
                  onSaveApply={this.loadConnections}
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
