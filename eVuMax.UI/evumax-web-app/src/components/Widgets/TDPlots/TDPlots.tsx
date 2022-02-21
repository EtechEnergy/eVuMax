import React, { Component } from "react";
import {
  DropDownList,
  GridColumn,
  TabStrip,
  TabStripSelectEventArguments,
  TabStripTab,
} from "@progress/kendo-react-all";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Grid,
  GridToolbar,
  GridColumn as Column,
  DialogActionsBar,
  Dialog,
} from "@progress/kendo-react-all";
import {
  RadioButton,
  NumericTextBox,
  Checkbox,
  ColorPicker,
} from "@progress/kendo-react-inputs";
import DataSelector from "../../Common/DataSelector";
//import { width } from "@mui/system";
import { comboData } from "../../TrajectoryComponents/trajectoryEditor";

export class TDPlots extends Component {
  //#region

  cmbDownSampleMethod: comboData[] = [];
  cmbMeanMethod: comboData[] = [];
  cmbSlackOffMultiMethod: comboData[] = [];
  cmbROBMultiMethod: comboData[] = [];
  lstGoupFunction: comboData[] = [];
  cmbPickupPumpChannel: comboData[] = [];
  cmbSlackOffPumpChannel: comboData[] = [];
  cmbRotatePumpChannel: comboData[] = [];
  cmbStaticPointSelectionMethod: comboData[] = [];
  cmbPickupDynamicMethod: comboData[] = [];
  cmbSlackOffDynamicMethod: comboData[] = [];
  cmbSlackOffMethod: comboData[] = [];
  cmbBroomStickPoints: comboData[] = [];
  cmbPickupPumpStatus: comboData[] = [];
  cmbSlackOffPumpStatus: comboData[] = [];
  cmbRotatePumpStatus: comboData[] = [];
  cmbRigStateFunction: comboData[] = [];
  cmbHkldPointStyle: comboData[] = [];
  cmbBMPointStyle: comboData[] = [];
  cmbPickupMultiMethod: comboData[] = [];
  state = {
    selectedMain: 1,
    selectedSub: 0,
    selected: 0,
    cmbDownSampleMethod: [] as comboData[],
    cmbMeanMethod: [] as comboData[],
    cmbSlackOffMultiMethod: [] as comboData[],
    cmbROBMultiMethod: [] as comboData[],
    lstGoupFunction: [] as comboData[],
    cmbPickupPumpChannel: [] as comboData[],
    cmbSlackOffPumpChannel: [] as comboData[],
    cmbStaticPointSelectionMethod: [] as comboData[],
    cmbPickupDynamicMethod: [] as comboData[],
    cmbSlackOffDynamicMethod: [] as comboData[],
    cmbSlackOffMethod: [] as comboData[],
    cmbBroomStickPoints: [] as comboData[],
    cmbPickupPumpStatus: [] as comboData[],
    cmbSlackOffPumpStatus: [] as comboData[],
    cmbRotatePumpStatus: [] as comboData[],
    cmbRigStateFunction: [] as comboData[],
    cmbHkldPointStyle: [] as comboData[],
    cmbBMPointStyle: [] as comboData[],
    cmbPickupMultiMethod: [] as comboData[],
  };
  handleSelectMainTab = (e: TabStripSelectEventArguments) => {
    this.setState({ selectedMain: e.selected });
  };
  handleSelectSub = (e: TabStripSelectEventArguments) => {
    this.setState({ selectedSub: e.selected });
  };
  handleSelect = (e: TabStripSelectEventArguments) => {
    this.setState({ selected: e.selected });
  };

  componentDidMount(): void {
    this.generateAllCombo();
  }

  generateAllCombo = () => {
    try {
      debugger;

      this.cmbMeanMethod = [
        new comboData("Moving Avg.", "0"),
        new comboData("Least Square Fit", "1"),
      ];
      this.cmbPickupMultiMethod = [
        new comboData("Min", "0"),
        new comboData("Max", "1"),
      ];
      this.cmbSlackOffMultiMethod = [
        new comboData("Min", "0"),
        new comboData("Max", "1"),
      ];
      this.cmbROBMultiMethod = [
        new comboData("Min", "0"),
        new comboData("Max", "1"),
      ];
      this.lstGoupFunction = [
        new comboData("Min", "0"),
        new comboData("Max", "1"),
        new comboData("Avg", "2"),
      ];
      this.cmbDownSampleMethod = [
        new comboData("By Depth", "0"),
        new comboData("By Time", "1"),
      ];
      this.cmbPickupPumpChannel = [
        new comboData("Pump Pressure", "SPPA"),
        new comboData("Circulation", "CIRC"),
      ];
      this.cmbSlackOffPumpChannel = [
        new comboData("Pump Pressure", "SPPA"),
        new comboData("Circulation", "CIRC"),
      ];
      this.cmbRotatePumpChannel = [
        new comboData("Pump Pressure", "SPPA"),
        new comboData("Circulation", "CIRC"),
      ];
      this.cmbStaticPointSelectionMethod = [
        new comboData("Min", "0"),
        new comboData("Max", "1"),
        new comboData("Avg", "2"),
      ];

      this.cmbPickupDynamicMethod = [
        new comboData("Break over", "0"),
        new comboData("Average", "1"),
        new comboData("Avg. after Break Over", "2"),
      ];
      this.cmbSlackOffDynamicMethod = [
        new comboData("Break over", "0"),
        new comboData("Average", "1"),
        new comboData("Avg. after Break Over", "2"),
      ];
      this.cmbSlackOffMethod = [
        new comboData("Min", "0"),
        new comboData("Max", "1"),
        new comboData("Avg", "2"),
      ];
      this.cmbBroomStickPoints = [
        new comboData("Dtnamic", "0"),
        new comboData("Static", "1"),
        new comboData("Both", "2"),
      ];
      this.cmbPickupPumpStatus = [
        new comboData("All", "0"),
        new comboData("Pump On", "1"),
        new comboData("Pump Off", "2"),
      ];
      this.cmbSlackOffPumpStatus = [
        new comboData("All", "0"),
        new comboData("Pump On", "1"),
        new comboData("Pump Off", "2"),
      ];
      this.cmbRotatePumpStatus = [
        new comboData("All", "0"),
        new comboData("Pump On", "1"),
        new comboData("Pump Off", "2"),
      ];
      this.cmbRigStateFunction = [
        new comboData("Min", "0"),
        new comboData("Max", "1"),
        new comboData("Avg", "2"),
      ];
      this.cmbHkldPointStyle = [
        new comboData("Rectangle", "0"),
        new comboData("Circle", "1"),
        new comboData("Diamond", "7"),
        new comboData("Triangle", "2"),
        new comboData("Left Triangle", "10"),
        new comboData("Right Triangle", "11"),
        new comboData("Down Triangle", "3"),
      ];
      this.cmbBMPointStyle = [
        new comboData("Rectangle", "0"),
        new comboData("Circle", "1"),
        new comboData("Diamond", "7"),
        new comboData("Triangle", "2"),
        new comboData("Left Triangle", "10"),
        new comboData("Right Triangle", "11"),
        new comboData("Down Triangle", "3"),
      ];

      this.setState({
        cmbDownSampleMethod: [
          new comboData("By Depth", "0"),
          new comboData("By Time", "1"),
        ],
        cmbMeanMethod: [
          new comboData("Moving Avg.", "0"),
          new comboData("Least Square Fit", "1"),
        ],
        cmbPickupMultiMethod: [
          new comboData("Min", "0"),
          new comboData("Max", "1"),
        ],
        cmbSlackOffMultiMethod: [
          new comboData("Min", "0"),
          new comboData("Max", "1"),
        ],
        cmbROBMultiMethod: [
          new comboData("Min", "0"),
          new comboData("Max", "1"),
        ],
        lstGoupFunction: [
          new comboData("Min", "0"),
          new comboData("Max", "1"),
          new comboData("Avg", "2"),
        ],

        cmbPickupPumpChannel: [
          new comboData("Pump Pressure", "SPPA"),
          new comboData("Circulation", "CIRC"),
        ],
        cmbSlackOffPumpChannel: [
          new comboData("Pump Pressure", "SPPA"),
          new comboData("Circulation", "CIRC"),
        ],
        cmbRotatePumpChannel: [
          new comboData("Pump Pressure", "SPPA"),
          new comboData("Circulation", "CIRC"),
        ],
        cmbStaticPointSelectionMethod: [
          new comboData("Min", "0"),
          new comboData("Max", "1"),
          new comboData("Avg", "2"),
        ],

        cmbPickupDynamicMethod: [
          new comboData("Break over", "0"),
          new comboData("Average", "1"),
          new comboData("Avg. after Break Over", "2"),
        ],
        cmbSlackOffDynamicMethod: [
          new comboData("Break over", "0"),
          new comboData("Average", "1"),
          new comboData("Avg. after Break Over", "2"),
        ],
        cmbSlackOffMethod: [
          new comboData("Min", "0"),
          new comboData("Max", "1"),
          new comboData("Avg", "2"),
        ],
        cmbBroomStickPoints: [
          new comboData("Dtnamic", "0"),
          new comboData("Static", "1"),
          new comboData("Both", "2"),
        ],
        cmbPickupPumpStatus: [
          new comboData("All", "0"),
          new comboData("Pump On", "1"),
          new comboData("Pump Off", "2"),
        ],
        cmbSlackOffPumpStatus: [
          new comboData("All", "0"),
          new comboData("Pump On", "1"),
          new comboData("Pump Off", "2"),
        ],
        cmbRotatePumpStatus: [
          new comboData("All", "0"),
          new comboData("Pump On", "1"),
          new comboData("Pump Off", "2"),
        ],
        cmbRigStateFunction: [
          new comboData("Min", "0"),
          new comboData("Max", "1"),
          new comboData("Avg", "2"),
        ],
        cmbHkldPointStyle: [
          new comboData("Rectangle", "0"),
          new comboData("Circle", "1"),
          new comboData("Diamond", "7"),
          new comboData("Triangle", "2"),
          new comboData("Left Triangle", "10"),
          new comboData("Right Triangle", "11"),
          new comboData("Down Triangle", "3"),
        ],
        cmbBMPointStyle: [
          new comboData("Rectangle", "0"),
          new comboData("Circle", "1"),
          new comboData("Diamond", "7"),
          new comboData("Triangle", "2"),
          new comboData("Left Triangle", "10"),
          new comboData("Right Triangle", "11"),
          new comboData("Down Triangle", "3"),
        ],
      });
    } catch (error) {}
  };

  render() {
    return (
      <div>
        <div className="row">
          <TabStrip
            selected={this.state.selectedMain}
            onSelect={this.handleSelectMainTab}
            //onSelect={this.handleSelect}
            keepTabsMounted={true}
          >
            <TabStripTab title="TandDPlots">
              <h1>Chart Page</h1>
              <div className="Data">
                {/* <DataSelector
                  objDataSelector={this.state.objDataSelector}
                  wellID={this.WellId}
                  selectionChanged={this.selectionChanged}
                ></DataSelector> */}
              </div>
              <div id="TDPlotChart">
                <div className="row">
                  <div id="Chart1">
                    <div
                      id="chart"
                      style={{
                        height: "calc(70vh)",
                        minWidth: "500px",
                        width: "calc(30vw)",

                        backgroundColor: "transparent",

                        marginLeft: "10px",
                      }}
                    ></div>
                    <div
                      id="TDchart2_legend"
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
                </div>
              </div>
            </TabStripTab>
            <TabStripTab title="Setting">
              <div
                className="row ml-2"
                style={{
                  width: "95vw",
                  display: "inline-flex",
                  textAlign: "end",
                }}
              >
                <div className="col-lg-12">
                  <button
                    //onClick={this.SaveSettings}
                    className="btn-custom btn-custom-primary ml-1 mr-1"
                  >
                    OK
                  </button>
                  <button
                    //onClick={this.SaveSettings}
                    className="btn-custom btn-custom-primary ml-1 mr-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <TabStrip
                selected={this.state.selectedSub}
                onSelect={this.handleSelectSub}
                //onSelect={this.handleTabSelect}
                // keepTabsMounted={true}
                tabPosition="top"
              >
                <TabStripTab title="Filter Criteria">
                  <div className="row ml-5">
                    <div className="row" style={{ width: "95vw" }}>
                      <div className="col-lg-12 mb-3">
                        <Checkbox
                          className="mr-2"
                          name="FilterData"
                          label="Filter Data"
                          // checked={
                          //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                          // }
                          // value={
                          //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                          // }
                          // onChange={(e) =>
                          //   this.handleChange(e, "RemoveFillUpTime")
                          // }
                        />

                        <Checkbox
                          className="ml-2 mr-2"
                          name="SyncSetting"
                          label="Sync Setting with Profile"
                          // checked={
                          //   this.state.objTripAnalyzerSelection
                          //     .IncludePipeMovement
                          // }
                          // value={
                          //   this.state.objTripAnalyzerSelection
                          //     .IncludePipeMovement
                          // }
                          // onChange={(e) =>
                          //   this.handleChange(e, "IncludePipeMovement")
                          // }
                        />
                        <hr className="mt-3" />
                      </div>

                      <div className="col-4" style={{ width: "100vw" }}>
                        <div className="col-lg-12">
                          <h6 className="summaryGroupHeader">
                            Data Down Sampling
                          </h6>
                        </div>

                        {/* <div className="col-lg-12">
                      <label>Time Log Data Filter</label>
                    </div> */}
                        <div className="col-lg-12">
                          Down Sample Data On
                          <DropDownList
                            className="ml-3"
                            name="cmbDownSampleMethod"
                            data={this.cmbDownSampleMethod}
                            value={this.cmbDownSampleMethod[0]}
                            textField="text"
                            dataItemKey="id"
                            //   onChange={(e) =>
                            //     this.onDialogInputChange(e, "VuMaxUnitID")
                            //   }
                          />
                        </div>

                        <div className="col-lg-12 mt-3">
                          <span className="mr-2">
                            <NumericTextBox
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />
                            <label className="leftPadding-small">
                              data points per ft
                            </label>
                          </span>
                        </div>
                        <div className="col-lg-12">
                          <label className="mt-5 mb-2">Grouping Function</label>
                          <br />
                          <Checkbox
                            className="mr-2"
                            label={"Min"}
                            //   checked={this.state.ShowComments}
                            //   onChange={(event) => {
                            //     this.setState({ ShowComments: event.value });
                            //   }}
                          />
                          <br />
                          <Checkbox
                            className="mr-2"
                            label={"Max"}
                            //   checked={this.state.ShowComments}
                            //   onChange={(event) => {
                            //     this.setState({ ShowComments: event.value });
                            //   }}
                          />
                          <br />
                          <Checkbox
                            className="mr-2"
                            label={"Avg"}
                            //   checked={this.state.ShowExcludedConn}
                            //   onChange={(event) => {
                            //     this.disableRealTime();
                            //     this.setState({ ShowExcludedConn: event.value });
                            //   }}
                          />
                        </div>
                      </div>
                      <div className="col-4" style={{ width: "100vw" }}>
                        {/* <div className="col-lg-12">
                        <h6 className="summaryGroupHeader">
                          Data Down Sampling
                        </h6>
                      </div> */}

                        {/* <div className="col-lg-12">
                      <label>Time Log Data Filter</label>
                    </div> */}
                        <div className="col-lg-12">
                          <Checkbox
                            className="mr-2"
                            label={"Show Depth Track"}
                            //   checked={this.state.ShowComments}
                            //   onChange={(event) => {
                            //     this.setState({ ShowComments: event.value });
                            //   }}
                          />
                          <br />
                        </div>
                        <div className="col-lg-12 mb-2">
                          <span className="mr-2">
                            <label className="">Depth Track Width</label>
                            <NumericTextBox
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />
                            <label className="leftPadding-small">pixels</label>
                          </span>

                          <br />
                          <Checkbox
                            className="mt-3 mb-3"
                            label={"Filter By Data Range"}
                            //   checked={this.state.ShowComments}
                            //   onChange={(event) => {
                            //     this.setState({ ShowComments: event.value });
                            //   }}
                          />
                          <br />
                          <br />
                          <span className="mr-2">
                            <label className="">Min</label>
                            <NumericTextBox
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />
                            <label className="leftPadding-small">Max</label>
                            <NumericTextBox
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />
                          </span>
                        </div>

                        <div className="col-lg-12 mt-3">
                          <span className="mr-2">
                            <Checkbox
                              className="mr-2"
                              label={"Filter By Depth Intervals"}
                              //   checked={this.state.ShowComments}
                              //   onChange={(event) => {
                              //     this.setState({ ShowComments: event.value });
                              //   }}
                            />
                            <br />
                            <br />
                          </span>
                        </div>
                        <div className="col-lg-12">
                          <label className="" style={{ marginLeft: "73px" }}>
                            Depth Interval
                          </label>
                          <NumericTextBox
                            // value={this.state.MaxConnTime}
                            format="n2"
                            width="100px"
                            // onChange={(event) => {
                            //   this.disableRealTime();
                            //   this.setState({
                            //     MaxConnTime: event.target.value,
                            //   });
                            // }}
                          />
                          <label className="leftPadding-small"> ft</label>
                          <br />
                          <label className="">Filter data points outside</label>
                          <NumericTextBox
                            // value={this.state.MaxConnTime}
                            format="n2"
                            width="100px"
                            // onChange={(event) => {
                            //   this.disableRealTime();
                            //   this.setState({
                            //     MaxConnTime: event.target.value,
                            //   });
                            // }}
                          />
                          <label className="leftPadding-small"> % mean</label>
                          <br />
                          <label className="" style={{ marginLeft: "70px" }}>
                            Filter Method
                          </label>
                          <DropDownList
                            className="ml-2"
                            name="cmbMeanMethod"
                            data={this.cmbMeanMethod}
                            value={this.cmbMeanMethod[0]}
                            textField="text"
                            dataItemKey="id"

                            //   onChange={(e) =>
                            //     this.onDialogInputChange(e, "VuMaxUnitID")
                            //   }
                          />
                        </div>
                      </div>
                      <div className="col-4" style={{ width: "100vw" }}>
                        <div className="col-lg-12">
                          <h6 className="summaryGroupHeader">
                            Broomstick Points Formatting
                          </h6>
                        </div>

                        {/* <div className="col-lg-12">
                      <label>Time Log Data Filter</label>
                    </div> */}
                        <div className="col-lg-12">
                          <div className="form-group row">
                            <label className="col-sm-6 col-form-label text-right">
                              Pickup Color
                            </label>
                            <div className="col-sm-6">
                              <ColorPicker
                                value="white"
                                view={"gradient"}
                                //   gradientSettings={this.gradientSettings}
                                //   onChange={this.onChangeWorkArea}
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-6 col-form-label text-right">
                              Pickup Static Color
                            </label>
                            <div className="col-sm-6">
                              <ColorPicker
                                value="white"
                                view={"gradient"}
                                //   gradientSettings={this.gradientSettings}
                                //   onChange={this.onChangeWorkArea}
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-6 col-form-label text-right">
                              SlackOff Color
                            </label>
                            <div className="col-sm-6">
                              <ColorPicker
                                value="white"
                                view={"gradient"}
                                //   gradientSettings={this.gradientSettings}
                                //   onChange={this.onChangeWorkArea}
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-6 col-form-label text-right">
                              SlackOff Static Color
                            </label>
                            <div className="col-sm-6">
                              <ColorPicker
                                value="white"
                                view={"gradient"}
                                //   gradientSettings={this.gradientSettings}
                                //   onChange={this.onChangeWorkArea}
                              />
                            </div>
                          </div>

                          <div className="form-group row">
                            <label className="col-sm-6 col-form-label text-right">
                              ROB Color
                            </label>
                            <div className="col-sm-6">
                              <ColorPicker
                                value="white"
                                view={"gradient"}
                                //   gradientSettings={this.gradientSettings}
                                //   onChange={this.onChangeWorkArea}
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-6 col-form-label text-right">
                              On Bottom Torque Color
                            </label>
                            <div className="col-sm-6">
                              <ColorPicker
                                value="white"
                                view={"gradient"}
                                //   gradientSettings={this.gradientSettings}
                                //   onChange={this.onChangeWorkArea}
                              />
                            </div>
                          </div>

                          <div className="form-group row">
                            <label className="col-sm-6 col-form-label text-right">
                              Off Bottom Torque Color
                            </label>
                            <div className="col-sm-6">
                              <ColorPicker
                                value="white"
                                view={"gradient"}
                                //   gradientSettings={this.gradientSettings}
                                //   onChange={this.onChangeWorkArea}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="row mt-5"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="col-4">
                        <div className="col-lg-12">
                          <h6 className="summaryGroupHeader">
                            Points Formatting
                          </h6>
                        </div>

                        {/* <div className="col-lg-12">
                      <label>Time Log Data Filter</label>
                    </div> */}
                        <div
                          className="col-xl-12"
                          style={{ width: "1000px", display: "flex" }}
                        >
                          <div className="form-group">
                            <Grid
                              style={{ height: "150px" }}
                              data={[
                                "Rotary DrillSlide Drill",
                                "Rotary DrillSlide Drill 1",
                              ]}
                            >
                              <GridColumn
                                field="RotaryDrillSlideDrill"
                                width="300px"
                              />
                            </Grid>
                          </div>
                          <div className="form-group ml-5">
                            <div className="marginLeft">
                              <label>Color</label>

                              <ColorPicker
                                value="white"
                                view={"gradient"}
                                //   gradientSettings={this.gradientSettings}
                                //   onChange={this.onChangeWorkArea}
                              />
                              {/* <MColorPicker value={this.state._workAreaValue} deferred hideTextfield onChange={this.onChangeWorkArea} /> */}
                            </div>
                            <br />
                            <div className="marginLeft">
                              <label>Grouping Function</label>
                              <br />
                              <DropDownList
                                className=""
                                name="VuMaxUnitID"
                                data={[
                                  "Grouping Function",
                                  "Grouping Function 1",
                                ]}
                                //   value={this.state.VuMaxUnitID}
                                //textField="text"
                                //dataItemKey="id"
                                //   onChange={(e) =>
                                //     this.onDialogInputChange(e, "VuMaxUnitID")
                                //   }
                              />
                              {/* <MColorPicker value={this.state._workAreaValue} deferred hideTextfield onChange={this.onChangeWorkArea} /> */}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="col-lg-12">
                          <h6 className="summaryGroupHeader">Points Style</h6>
                        </div>

                        {/* <div className="col-lg-12">
                      <label>Time Log Data Filter</label>
                    </div> */}
                        <div className="col-lg-12">
                          <label className="mr-3">Style</label>

                          <DropDownList
                            className="marginLeft-small"
                            name="cmbHkldPointStyle"
                            data={this.cmbHkldPointStyle}
                            value={this.cmbHkldPointStyle[0]}
                            textField="text"
                            dataItemKey="id"
                            //   onChange={(e) =>
                            //     this.onDialogInputChange(e, "VuMaxUnitID")
                            //   }
                          />
                          <br />
                        </div>
                        <div className="col-lg-12 mb-2">
                          <span className="mr-2">
                            <label className="">Size</label>
                            <NumericTextBox
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />
                          </span>
                          <br />
                          <br />

                          <br />
                        </div>
                        <div className="col-lg-12">
                          <h6 className="summaryGroupHeader">Plan Lines</h6>
                          <span className="ml-2">
                            <label className="">Line Thickness</label>
                            <NumericTextBox
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />
                          </span>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="col-lg-12">
                          <h6 className="summaryGroupHeader">
                            Broomstick Points
                          </h6>
                        </div>
                        <div className="col-lg-12">
                          <label className="mr-3">Style</label>

                          <DropDownList
                            className="marginLeft"
                            name="cmbBMPointStyle"
                            data={this.cmbBMPointStyle}
                            value={this.cmbBMPointStyle[1]}
                            textField="text"
                            dataItemKey="id"
                            //   onChange={(e) =>
                            //     this.onDialogInputChange(e, "VuMaxUnitID")
                            //   }
                          />
                          <br />
                        </div>
                        <div className="col-lg-12">
                          <span className="mr-2">
                            <label className="">Size</label>
                            <NumericTextBox
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />
                          </span>
                        </div>
                        <div className="col-lg-12 mt-4">
                          <h6 className="summaryGroupHeader">
                            Points Transparency
                            <NumericTextBox
                              className="ml-3"
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />{" "}
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabStripTab>

                <TabStripTab title="BroomStick PlotSettings">
                  <span>
                    Points To Plot
                    <DropDownList
                      className="ml-5"
                      name="cmbBroomStickPoints"
                      data={this.cmbBroomStickPoints}
                      value={this.cmbBroomStickPoints[2]}
                      textField="text"
                      dataItemKey="id"
                      //   onChange={(e) =>
                      //     this.onDialogInputChange(e, "VuMaxUnitID")
                      //   }
                    />
                  </span>
                  <TabStrip
                    selected={this.state.selected}
                    onSelect={this.handleSelect}
                    //onSelect={this.handleTabSelect}
                    // keepTabsMounted={true}
                    tabPosition="top"
                  >
                    <TabStripTab title="Pick Up">
                      <div className="row">
                        <div className="row ml-2">
                          <div className="row ml-2" style={{ width: "95vw" }}>
                            <div className="col-6">
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Channel To Use To Detect Pump Status
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbPickupPumpChannel"
                                    data={this.cmbPickupPumpChannel}
                                    value={this.cmbPickupPumpChannel[0]}
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Pump Cut Off Value
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    psi
                                  </label>
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  RPM Cut Off
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    RPM
                                  </label>
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Max. Block Movement
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    ft
                                  </label>
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Min. Block Movement
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    ft
                                  </label>
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Plot points
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbPickupPumpStatus"
                                    data={this.cmbPickupPumpStatus}
                                    value={this.cmbPickupPumpStatus[0]}
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />{" "}
                                  <label className="leftPadding-small">
                                    {" "}
                                    psi
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div
                                className="col-xl-12"
                                style={{ width: "1000px", display: "flex" }}
                              >
                                <div className="form-group">
                                  <h6 className="summaryGroupHeader">
                                    Rig States
                                  </h6>
                                  <Grid
                                    style={{ height: "150px" }}
                                    data={["CheckBox", "CheckBox1"]}
                                  >
                                    <GridColumn width="300px" />
                                  </Grid>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row mt-3" style={{ width: "95vw" }}>
                            <div className="col-xl-6">
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Static Point Selection Method
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbStaticPointSelectionMethod"
                                    data={this.cmbStaticPointSelectionMethod}
                                    value={
                                      this.state
                                        .cmbStaticPointSelectionMethod[2]
                                    }
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Dynamic Point Selection Method
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbPickupDynamicMethod"
                                    data={this.cmbPickupDynamicMethod}
                                    value={this.cmbPickupDynamicMethod[2]}
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-xl-6">
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Multiple Point Selection Method
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbPickupMultiMethod"
                                    data={this.cmbPickupMultiMethod}
                                    value={this.cmbPickupMultiMethod[0]}
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />
                                </div>
                              </div>
                              <div className="form-group row mt-1">
                                <div className="col-sm-8">
                                  <Checkbox
                                    className="mr-2"
                                    name="FilterData"
                                    label="Filter data by finding Maximum"
                                    // checked={
                                    //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                                    // }
                                    // value={
                                    //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                                    // }
                                    // onChange={(e) =>
                                    //   this.handleChange(e, "RemoveFillUpTime")
                                    // }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="row" style={{ width: "95vw" }}>
                          <div className="form-group row mt-5 ml-2">
                            <label className="ml-5">
                              Depth Movement Time Threshold Width
                            </label>
                            <NumericTextBox
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />
                            <label className="leftPadding-small">Seconds</label>
                          </div>
                        </div>
                        <div className="row mt-1" style={{ width: "95vw" }}>
                          <div className="form-group row mt-1 ml-5 ">
                            <Checkbox
                              className="mr-2"
                              name="FilterData"
                              label="Only plot points if pick Up/Slack Off and Rotate points found in connection"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                          </div>
                        </div>
                        <div className="row mt-1" style={{ width: "95vw" }}>
                          <div className="form-group row mt-t ml-5 ">
                            <Checkbox
                              className="mr-2"
                              name="FilterData"
                              label="Ploat Off Bottom Torque Points"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                            <Checkbox
                              className="ml-2"
                              name="FilterData"
                              label="Ploat On Bottom Torque Points"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                          </div>
                        </div>
                        <div className="row mt-1" style={{ width: "95vw" }}>
                          <div className="form-group row mt-t ml-5 ">
                            <Checkbox
                              className="mr-2"
                              name="FilterData"
                              label="Show Multiple Points"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                            <Checkbox
                              className="ml-2"
                              name="FilterData"
                              label="Enforce SO<ROB<PU rule"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                          </div>
                        </div>
                      </div>
                    </TabStripTab>
                    <TabStripTab title="Slack Off">
                      <div className="row">
                        <div className="row ml-2">
                          <div className="row ml-2" style={{ width: "95vw" }}>
                            <div className="col-6">
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Channel To Use To Detect Pump Status
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbSlackOffPumpChannel"
                                    data={this.cmbSlackOffPumpChannel}
                                    value={this.cmbSlackOffPumpChannel[0]}
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Pump Cut Off Value
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    psi
                                  </label>
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  RPM Cut Off
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    RPM
                                  </label>
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Max. Block Movement
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    ft
                                  </label>
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Min. Block Movement
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    ft
                                  </label>
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Plot points
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbSlackOffPumpStatus"
                                    data={this.cmbSlackOffPumpStatus}
                                    value={this.cmbSlackOffPumpStatus[0]}
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />{" "}
                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div
                                className="col-xl-12"
                                style={{ width: "1000px", display: "flex" }}
                              >
                                <div className="form-group">
                                  <h6 className="summaryGroupHeader">
                                    Rig States
                                  </h6>
                                  <Grid
                                    style={{ height: "150px" }}
                                    data={["CheckBox", "CheckBox1"]}
                                  >
                                    <GridColumn width="300px" />
                                  </Grid>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className="row mt-3 ml-2"
                            style={{ width: "95vw" }}
                          >
                            <div className="col-xl-6">
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Static Point Selection Method
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbStaticPointSelectionMethod"
                                    data={this.cmbStaticPointSelectionMethod}
                                    value={
                                      this.state
                                        .cmbStaticPointSelectionMethod[2]
                                    }
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Dynamic Point Selection Method
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbSlackOffDynamicMethod"
                                    data={this.cmbSlackOffDynamicMethod}
                                    value={this.cmbSlackOffDynamicMethod[2]}
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-xl-6">
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Multiple Point Selection Method
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbSlackOffMultiMethod"
                                    data={this.cmbSlackOffMultiMethod}
                                    value={this.cmbSlackOffMultiMethod[0]}
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />
                                </div>
                              </div>
                              <div className="form-group row mt-1">
                                <div className="col-sm-8">
                                  <Checkbox
                                    className="mr-2"
                                    name="FilterData"
                                    label="Filter data by finding Maximum"
                                    // checked={
                                    //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                                    // }
                                    // value={
                                    //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                                    // }
                                    // onChange={(e) =>
                                    //   this.handleChange(e, "RemoveFillUpTime")
                                    // }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <br />
                        <div className="row" style={{ width: "95vw" }}>
                          <div className="form-group row mt-5 ml-2">
                            <label className="ml-5">
                              Depth Movement Time Threshold Width
                            </label>
                            <NumericTextBox
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />
                            <label className="leftPadding-small">Seconds</label>
                          </div>
                        </div>
                        <div className="row mt-1" style={{ width: "95vw" }}>
                          <div className="form-group row mt-1 ml-5 ">
                            <Checkbox
                              className="mr-2"
                              name="FilterData"
                              label="Only plot points if pick Up/Slack Off and Rotate points found in connection"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                          </div>
                        </div>
                        <div className="row mt-1" style={{ width: "95vw" }}>
                          <div className="form-group row mt-t ml-5 ">
                            <Checkbox
                              className="mr-2"
                              name="FilterData"
                              label="Ploat Off Bottom Torque Points"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                            <Checkbox
                              className="ml-2"
                              name="FilterData"
                              label="Ploat On Bottom Torque Points"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                          </div>
                        </div>
                        <div className="row mt-1" style={{ width: "95vw" }}>
                          <div className="form-group row mt-t ml-5 ">
                            <Checkbox
                              className="mr-2"
                              name="FilterData"
                              label="Show Multiple Points"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                            <Checkbox
                              className="ml-2"
                              name="FilterData"
                              label="Enforce SO<ROB<PU rule"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                          </div>
                        </div>
                      </div>
                    </TabStripTab>
                    <TabStripTab title="Rotate">
                      <div className="row">
                        <div className="row ml-2">
                          <div className="row ml-2" style={{ width: "95vw" }}>
                            <div className="col-6">
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Channel To Use To Detect Pump Status
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbRotatePumpChannel"
                                    data={this.cmbRotatePumpChannel}
                                    value={this.cmbRotatePumpChannel[0]}
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Pump Cut Off Value
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    psi
                                  </label>
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Min. RPM Cut Off
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    RPM
                                  </label>
                                </div>
                              </div>
                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Max. RPM Cut Off
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    {" "}
                                    RPM
                                  </label>
                                </div>
                              </div>

                              <div className="form-group row">
                                <label className="col-sm-4 col-form-label text-right">
                                  Plot points
                                </label>
                                <div className="col-sm-8">
                                  <DropDownList
                                    className=""
                                    name="cmbRotatePumpStatus"
                                    data={this.cmbRotatePumpStatus}
                                    value={this.cmbRotatePumpStatus[2]}
                                    textField="text"
                                    dataItemKey="id"
                                    //   onChange={(e) =>
                                    //     this.onDialogInputChange(e, "VuMaxUnitID")
                                    //   }
                                  />{" "}
                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div
                                className="col-xl-12"
                                style={{ width: "1000px", display: "flex" }}
                              >
                                <div className="form-group">
                                  <h6 className="summaryGroupHeader">
                                    Rig States
                                  </h6>
                                  <Grid
                                    style={{ height: "150px" }}
                                    data={["CheckBox", "CheckBox1"]}
                                  >
                                    <GridColumn width="300px" />
                                  </Grid>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className="row mt-3 ml-0"
                            style={{ width: "95vw" }}
                          >
                            <div
                              className="col-xl-7"
                              style={{ marginLeft: "-45px" }}
                            >
                              <div className="form-group row ml-0">
                                <label className="col-sm-4 col-form-label text-right">
                                  Max. Hookload Change Tolerance (+/-)
                                </label>
                                <div className="col-sm-8">
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="100px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    klbf
                                  </label>
                                  <label className="leftPadding-small">
                                    Over
                                  </label>
                                  <NumericTextBox
                                    // value={this.state.MaxConnTime}
                                    format="n2"
                                    width="50px"
                                    // onChange={(event) => {
                                    //   this.disableRealTime();
                                    //   this.setState({
                                    //     MaxConnTime: event.target.value,
                                    //   });
                                    // }}
                                  />
                                  <label className="leftPadding-small">
                                    Points
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row mt-3" style={{ width: "95vw" }}>
                            <div className="col-6">
                              <Checkbox
                                className="mr-2 ml-5"
                                name="FilterData"
                                label="Don't plot ROB if no stable hookload values found"
                                // checked={
                                //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                                // }
                                // value={
                                //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                                // }
                                // onChange={(e) =>
                                //   this.handleChange(e, "RemoveFillUpTime")
                                // }
                              />
                            </div>
                            <div className="col-6">
                              <div className="form-group">
                                <label className="">
                                  Multiple Point Selection Method
                                </label>

                                <DropDownList
                                  className="ml-2"
                                  name="cmbROBMultiMethod"
                                  data={this.cmbROBMultiMethod}
                                  value={this.cmbROBMultiMethod[0]}
                                  textField="text"
                                  dataItemKey="id"
                                  //   onChange={(e) =>
                                  //     this.onDialogInputChange(e, "VuMaxUnitID")
                                  //   }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="row" style={{ width: "95vw" }}>
                          <div className="form-group row mt-5 ml-2">
                            <label className="ml-5">
                              Depth Movement Time Threshold Width
                            </label>
                            <NumericTextBox
                              // value={this.state.MaxConnTime}
                              format="n2"
                              width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                            />
                            <label className="leftPadding-small">Seconds</label>
                          </div>
                        </div>
                        <div className="row mt-1" style={{ width: "95vw" }}>
                          <div className="form-group row mt-1 ml-5 ">
                            <Checkbox
                              className="mr-2"
                              name="FilterData"
                              label="Only plot points if pick Up/Slack Off and Rotate points found in connection"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                          </div>
                        </div>
                        <div className="row mt-1" style={{ width: "95vw" }}>
                          <div className="form-group row mt-t ml-5 ">
                            <Checkbox
                              className="mr-2"
                              name="FilterData"
                              label="Ploat Off Bottom Torque Points"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                            <Checkbox
                              className="ml-2"
                              name="FilterData"
                              label="Ploat On Bottom Torque Points"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                          </div>
                        </div>
                        <div className="row mt-1" style={{ width: "95vw" }}>
                          <div className="form-group row mt-t ml-5 ">
                            <Checkbox
                              className="mr-2"
                              name="FilterData"
                              label="Show Multiple Points"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                            <Checkbox
                              className="ml-2"
                              name="FilterData"
                              label="Enforce SO<ROB<PU rule"
                              // checked={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // value={
                              //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                              // }
                              // onChange={(e) =>
                              //   this.handleChange(e, "RemoveFillUpTime")
                              // }
                            />
                          </div>
                        </div>
                      </div>
                    </TabStripTab>
                  </TabStrip>
                </TabStripTab>
              </TabStrip>
            </TabStripTab>
          </TabStrip>
        </div>
      </div>
    );
  }
}

export default TDPlots;
