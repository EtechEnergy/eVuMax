import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import $ from "jquery";
import { Chart, lineStyle, curveStyle } from "../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../eVuMaxObjects/Chart/ChartData";

import {
  DataSeries,
  dataSeriesType,
} from "../../eVuMaxObjects/Chart/DataSeries";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import "@progress/kendo-react-intl";
import { ComboBox } from "@progress/kendo-react-dropdowns";
import "react-router-dom";

import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import axios from "axios";
import "./DataSelector.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndent, faChartArea,faCogs } from "@fortawesome/free-solid-svg-icons";

import { DateTimePicker, Dialog, Label, Popup } from "@progress/kendo-react-all";
import { RadioButton, NumericTextBox, Checkbox } from "@progress/kendo-react-inputs";

import GlobalMod from "../../objects/global";
import { Util } from "../../Models/eVuMax";
import DataSelector_ from "./DataSelector_";
import * as utilFunc from '../../utilFunctions/utilFunctions';
import { confirmAlert } from "react-confirm-alert";
import DataSelectorInfo from "./DataSelectorInfo";

let _gMod = new GlobalMod();

interface IProps { }


interface IProps {
  objDataSelector: DataSelector_;
  selectionChanged: any;
  wellID: string;
}
//=============


class DataSelector extends Component<IProps> {

  anchor: any = React.createRef();
  onClick = () => {
    this.setState({ show: !this.state.show });
  }
  constructor(props: any) {
    super(props);
    this.__parentRef = props;
    this.WellId = this.props.wellID;


  }
  state = {
    selectedTab: 0,
    selectedval: "-1",
    objDataSelector: this.props.objDataSelector,
    Warning: "",
    showWarning: false,
    show: false,
    showSettings: false,
    selectedSettingsTab: 0,
  };
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
      // alert("DataSelector didmount");

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


      let objDataSelector: DataSelector_ = new DataSelector_();
      objDataSelector = this.props.objDataSelector;
      //alert("Received --" + this.props.objDataSelector.fromDate);
      objDataSelector.fromDate = null;
      objDataSelector.toDate = null;

      this.setState({
        objDataSelector: objDataSelector
      });




      //alert(this.state.objDataSelector.fromDate);

      this.loadData();
      this.loadExtents();  //work in progress
      window.addEventListener("resize", this.reRenderChart);
    } catch (error) { }
  }


  //Nishant
  refreshChart() {
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

    } catch (error) {

    }
  }


  reRenderChart = () => {
    try {
      //alert("rerender");
      this.forceUpdate();
      //window.addEventListener("resize", this.reRenderChart);

    } catch (error) { }
  };
  //This method will be called by chart component when user selects the data by using chart
  // selectorChanged = (
  //   ptype: string,
  //   pfromdate: Date,
  //   ptodate: Date,
  //   pfromdepth: number,
  //   ptodepth: number,
  //   pApplyRefreshHrs?: boolean
  // ) => {
  //   try {
  //     debugger;
  //     this.setState({
  //       selectedval: ptype,
  //       fromDate: pfromdate,
  //       toDate: ptodate,
  //       fromDepth: pfromdepth,
  //       toDepth: ptodepth,

  //     });
  //     // this.__parentRef.selectionChanged(
  //     //   this.state.selectedval,
  //     //   this.state.fromDate,
  //     //   this.state.toDate,
  //     //   this.state.fromDepth,
  //     //   this.state.toDepth
  //     // );
  //   } catch (error) { }
  // };

  selectorChanged = async (ptype: string, pfromdate: Date, ptodate: Date, pfromdepth: number, ptodepth: number, pApplyRefreshHrs?: boolean) => {
    
    try {


      let objDataSelector: DataSelector_ = new DataSelector_();
      objDataSelector.selectedval = ptype;
     
      objDataSelector.fromDate = pfromdate;
      objDataSelector.toDate = ptodate;

      objDataSelector.fromDepth = pfromdepth;
      objDataSelector.toDepth = ptodepth;
      objDataSelector.refreshHrs = this.state.objDataSelector.refreshHrs;

      objDataSelector.fromDateS = new Date(pfromdate);
      objDataSelector.toDateS = new Date(ptodate);


      await this.setState({ objDataSelector: objDataSelector })

      //Change by prath on 24-Nov-2021
      //this.objChart.setSelectorDateRange(this.state.objDataSelector.fromDate, this.state.objDataSelector.toDate);
      // if (pApplyRefreshHrs == true) {
      //   this.props.selectionChanged(this.state.objDataSelector, true);
      // } else {
      this.props.selectionChanged(this.state.objDataSelector, false);
      //}
    } catch (error) { }
  };

  componentWillUpdate() {
    try {
      //Update the chart

      //Nishant 29-10-2021
      //this.objChart.updateChart();
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
        $("#refreshHrs").hide();
        $("#chart").show();
        $("#tab1").removeClass("non-selected");
        $("#tab1").addClass("selected");

        $("#tab2").removeClass("selected");
        $("#tab2").addClass("non-selected");

        $("#tab3").addClass("non-selected");
        $("#tab3").removeClass("selected");

        this.objChart.updateChart();
      }

      if (s == 1) {
        this.selectedTab = 1;
        $("#chart").hide();
        $("#manual").show();
        $("#refreshHrs").hide();

        $("#tab1").removeClass("selected");
        $("#tab1").addClass("non-selected");

        $("#tab2").removeClass("non-selected");
        $("#tab2").addClass("selected");


        $("#tab3").addClass("non-selected");
        $("#tab3").addClass("selected");
      }

      if (s == 2) {
        this.selectedTab = 2;
        $("#chart").hide();
        $("#manual").hide();
        $("#refreshHrs").show();

        $("#tab3").addClass("selected");
        $("#tab3").removeClass("non-selected");

        $("#tab2").addClass("non-selected");
        $("#tab2").removeClass("selected");

        $("#tab1").addClass("non-selected");
        $("#tab1").removeClass("selected");
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


  handleChange = (event: any, field: string) => {

    const value = event.value;
    const name = field; // target.props ? target.props.name : target.name;
    let edited: any = utilFunc.CopyObject(this.state.objDataSelector);


    edited[field] = value;

    this.setState({
      objDataSelector: edited
    });

  };

  handleTabSelect = (e: any) => {
    if (this.objLine.Data.length <= 0) {
      confirmAlert({
        //title: 'eVuMax',
        message: 'No Data Available',
        childrenElement: () => <div />,
        buttons: [
          {
            label: 'Ok',
            onClick: () => {
              return;
            }
          },
          // {
          //     label: 'No',
          //     onClick: () => null
          // }
        ]
      });
      return;
    }

    if (e.selected == 1) {

      this.setState({ showSettings: true });
      return;
    }
    this.setState({ selectedTab: e.selected });
  };
  handleTabSelectSettings = (e: any) => {


    this.setState({ selectedSettingsTab: e.selected });
  };
  render() {

    return (
      <>
      {/* <React.Fragment> */}

        {/* <div style={{ height: "100px", display: "flex" }}> */}
        <div className="row" style={{ height: "100px" }}>
          
          <TabStrip
            selected={this.state.selectedTab}
            onSelect={this.handleTabSelect}
            keepTabsMounted={true}
            tabPosition="left"


          // style={{width: 150, overflow: 'auto'}}
          >
            {/* <TabStripTab  title={<FontAwesomeIcon icon={faChartArea} style={{width:"10px",height:"10px"}} />}> */}
            <TabStripTab title={<FontAwesomeIcon icon={faChartArea} style={{ width: "20px", height: "20px" }} />}>
            <div className="row mb-3">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
              {/* <div
                style={{
                  height: "calc(100vh - 400px)",
                  width: "calc(100vw - 220px)",
                  backgroundColor: "transparent",
                }}
              > */}
              <div className="container">
              <div className="row">
                <div className="col-lg-12 col-md-12 col-sd-12 col-xs-12">
              <div
                id="chart"
                style={{
                  height: "90px",
                  //width: "calc(100% - 90px)",
                  //width: "calc(100vw - 220px)",
                  width: "80vw",
                  
                  display: "inline-block",
                  float: "right",
                }}
              >
              </div>
            
              <div
                id="selector_chart"
                style={{
                  //height: "100%",
                  height: "90px",
                  flex: 1,
                  //width: "70%",
                  // padding: "10px",
                }}
              ></div>
  </div>
  </div></div>


</div>
</div>
              
            </TabStripTab>

            <TabStripTab title={<FontAwesomeIcon icon={faCogs} style={{ width: "20px", height: "20px" }} />}>
            </TabStripTab>



          </TabStrip>

      

        

        {/* {this.state.showWarning && <div id="warning" style={{ paddingBottom: "15px", padding: "0px", height: "20px", width: "100%", fontWeight: "normal", backgroundColor: "transparent", color: "black", position: "absolute" }}> <label id="lblWarning" style={{ color: "black", marginLeft: "10px" }} > {this.state.Warning} </label> </div>} */}


        {this.state.showSettings && <Dialog
          title={"Dataselector Settings"}
          height="300px"
          width="900px"
          onClose={(e: any) => {
            this.setState({
              showSettings: !this.state.showSettings
            });
          }}
        >
          <div>
            <TabStrip
              selected={this.state.selectedSettingsTab}
              onSelect={this.handleTabSelectSettings}
              keepTabsMounted={true}
              tabPosition="left"
            >
              <TabStripTab title={<FontAwesomeIcon icon={faIndent} style={{ width: "20px", height: "20px" }} />}>

                <div className="row">
                  <div className="col-lg-12">
                    <RadioButton
                      name="selectionby"
                      value="0"
                      checked={this.state.objDataSelector.selectedval === "0"}
                      label="Select Data By DateTime"

                      onChange={(e) => this.handleChange(e, "selectedval")}
                    />

                    <RadioButton
                      name="selectionby"
                      value="1"
                      checked={this.state.objDataSelector.selectedval === "1"}
                      label="Select Data By Depth"

                      onChange={(e) => this.handleChange(e, "selectedval")}
                    />

                    <RadioButton
                      name="selectionby"
                      value="2"
                      checked={this.state.objDataSelector.selectedval === "2"}
                      label="Select Data Last Hrs"

                      onChange={(e) => this.handleChange(e, "selectedval")}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        this.selectorChanged(this.state.objDataSelector.selectedval, this.state.objDataSelector.fromDate
                          , this.state.objDataSelector.toDate, this.state.objDataSelector.fromDepth, this.state.objDataSelector.toDepth);
                        this.setState({
                          showSettings: false
                        });

                      }
                      }
                      className="btn-custom btn-custom-primary ml-5 mr-1"
                    >
                      Apply
                    </button>
                  </div>

                </div>

                <div className="row mt-2">
                  <div className="col-lg-12">
                    {this.state.objDataSelector.selectedval == "0" ? (
                      <label className="mr-4">From Date </label>
                    ) : (
                      ""
                    )}

                    {this.state.objDataSelector.selectedval == "0" ? (
                      <DateTimePicker
                        name="txtFromDate"
                        value={new Date(this.state.objDataSelector.fromDate)}
                        format="MM/dd/yyyy HH:mm:ss"
                        formatPlaceholder={{
                          year: "yyyy",
                          month: "MM",
                          day: "dd",
                          hour: "HH",
                          minute: "mm",
                          second: "ss",
                        }}

                        onChange={(e) => this.handleChange(e, "fromDate")}
                      />
                    ) : (
                      ""
                    )}

                    {this.state.objDataSelector.selectedval == "0" ? (
                      <label className="mr-4 ml-4">To Date </label>
                    ) : (
                      ""
                    )}

                    {this.state.objDataSelector.selectedval == "0" ? (
                      <DateTimePicker
                        name="txtToDate"
                        value={new Date(this.state.objDataSelector.toDate)}
                        format="MM/dd/yyyy HH:mm:ss"
                        formatPlaceholder={{
                          year: "yyyy",
                          month: "MM",
                          day: "dd",
                          hour: "HH",
                          minute: "mm",
                          second: "ss",
                        }}
                        onChange={(e) => this.handleChange(e, "toDate")}
                      />
                    ) : (
                      ""
                    )}

                    {this.state.objDataSelector.selectedval == "1" ? (
                      <label className="mr-2">From Depth </label>
                    ) : (
                      ""
                    )}

                    {this.state.objDataSelector.selectedval == "1" ? (
                      <NumericTextBox
                        name="txtFromDepth"
                        value={this.state.objDataSelector.fromDepth}
                        format="n2"
                        width="100px"
                        onChange={(e) => this.handleChange(e, "fromDepth")}
                      />
                    ) : (
                      ""
                    )}

                    {this.state.objDataSelector.selectedval == "1" ? (
                      <label className="mr-2 ml-4">To Depth </label>
                    ) : (
                      ""
                    )}

                    {this.state.objDataSelector.selectedval == "1" ? (
                      <NumericTextBox
                        name="txtToDepth"
                        value={this.state.objDataSelector.toDepth}
                        format="n2"
                        width="100px"
                        onChange={(e) => this.handleChange(e, "toDepth")}
                      />
                    ) : (
                      ""
                    )}


                    {this.state.objDataSelector.selectedval == "2" ? (<Label className="mr-3" >Last</Label>) : ("")}
                    {this.state.objDataSelector.selectedval == "2" ? (<ComboBox style={{ width: "100px" }} data={[1, 3, 12, 24, 48]} allowCustom={true}
                      value={this.state.objDataSelector.refreshHrs}
                      onChange={(e) => this.handleChange(e, "refreshHrs")} />) : ("")}
                    {this.state.objDataSelector.selectedval == "2" ? (<Label className="mr-3 ml-3" >Hrs</Label>) : ("")}


                  </div>
                  {/* <div className="row mt-3">
                    <div className="col">
                      <Checkbox
                        id={"chkMatchDepthFormationTops"}
                        className="col-lg-4 col-xl-3 col-md-4 col-sm-4"
                        value={this.state.objDataSelector.matchDepthByTops}
                        onChange={(e) => this.handleChange(e, "matchDepthByTops")}
                        label="Match Depth By Formation Tops"
                      />
                    </div>
                  </div> */}

                </div>




              </TabStripTab>

              {/* <TabStripTab title={<FontAwesomeIcon icon={faClock} style={{ width: "20px", height: "20px" }} />}>
              
                <Label>Real Time Refresh Rate</Label>
                <br />
                <Label className="mr-3" >Last</Label>
                <ComboBox style={{ width: "100px" }} data={[1, 3, 12, 24, 48]} allowCustom={true}
                  value={this.state.objDataSelector.refreshHrs}
              
                  onChange={(e) => this.handleChange(e, "refreshHrs")}

                />
                <Label className="mr-3 ml-3" >Hrs</Label>
                <button
                  type="button"
              
                  onClick={() => {
              
                    this.selectorChanged(this.state.objDataSelector.selectedval, this.state.objDataSelector.fromDate
                      , this.state.objDataSelector.toDate, this.state.objDataSelector.fromDepth, this.state.objDataSelector.toDepth, true);
                    this.setState({
                      showSettings: false
                    });
                  }}
                  className="btn-custom btn-custom-primary ml-5 mr-1"
                >
                  Apply
                </button>

                
              </TabStripTab> */}
            </TabStrip>
            
          </div>

        </Dialog>}
        </div>
      {/* </React.Fragment > */}
      </>
    );
  }

  setData = (paramData: any) => {
    try {

      //Populate the data series with this data
      this.objLine.Data.slice(0, this.objLine.Data.length);
      if (paramData.length == 0 || paramData.length == undefined || paramData.length == null) {
        this.setState({
          Warning: "No data available for dataselector",
          showWarning: true
        });

        // if (this.state.Warnings.trim() != "") {
        //$("#warning").css("backgroundColor", "#ffb74d");

      } else {
        this.setState({
          Warning: "",
          showWarning: false
        });
        //$("#warning").css("backgroundColor", "transparent");
        //$("#lblWarning").text("");
      }


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
          Util.StatusSuccess("Data successfully retrived DataSelector ");
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
      //Check if it  is required to load the extents


      if (this.state.objDataSelector.fromDate != null) {
        //We already extracted extents, no need to repeat

        this.objChart.setSelectorDateRange(
          new Date(this.state.objDataSelector.fromDate),
          new Date(this.state.objDataSelector.toDate)
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

          // this.setState({
          //   fromDate: new Date(objData.MinDate),
          //   toDate: new Date(objData.MaxDate),
          //   fromDepth: Number.parseFloat(objData.MinDepth),
          //   toDepth: Number.parseFloat(objData.MaxDepth),
          // });


          //Nishant


          // let minDate = new Date(objData.MaxDate);
          // minDate.setHours(minDate.getHours() - this.state.objDataSelector.refreshHrs);
          let objNewObjDataSelector = new DataSelector_();
          objNewObjDataSelector = this.props.objDataSelector;
          objNewObjDataSelector.fromDate = new Date(objData.MinDate);
          objNewObjDataSelector.toDate = new Date(objData.MaxDate);
          objNewObjDataSelector.fromDepth = objData.MinDepth;
          objNewObjDataSelector.toDepth = objData.MaxDepth;
          objNewObjDataSelector.refreshHrs = this.props.objDataSelector.refreshHrs;


          this.setState({
            objDataSelector: objNewObjDataSelector
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

export default DataSelector;
