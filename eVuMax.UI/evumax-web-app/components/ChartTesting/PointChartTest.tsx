import React, { Component } from "react";
import * as d3 from "d3";
import * as utilFunctions from "../../utilFunctions/utilFunctions";
import $ from "jquery";
import {
  AutoComplete,
  ComboBox,
  DropDownList,
  MultiSelect,
} from "@progress/kendo-react-dropdowns";

import { Chart, curveStyle } from "../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../eVuMaxObjects/Chart/ChartData";
import { formatNumber, parseDate } from "@telerik/kendo-intl";
import {
  Axis,
  axisLabelStyle,
  axisPosition,
} from "../../eVuMaxObjects/Chart/Axis";
import DataSelector from "../Common/DataSelector";
import { Moment } from "moment";
import {
  DataSeries,
  dataSeriesType,
  pointStyle,
} from "../../eVuMaxObjects/Chart/DataSeries";
import { Guid } from "guid-typescript";
import "@progress/kendo-react-layout";
import { filterBy } from "@progress/kendo-data-query";
import ProcessLoader from "../loader/loader";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
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
  Button,
  Dialog,
} from "@progress/kendo-react-all";

import { axisBottom, gray, json, timeout } from "d3";
import moment from "moment";

// import './DrlgConnSummary.css';

import { ChartEventArgs } from "../../eVuMaxObjects/Chart/ChartEventArgs";

import GlobalMod from "../../objects/global";
import { util } from "typescript-collections";
import { pointShape } from "../../eVuMaxObjects/Chart/PointSeries";
import { comboData } from "../../eVuMaxObjects/UIObjects/comboData";
let _gMod = new GlobalMod();

export default class PointChartTest extends Component {
  constructor(props: any) {
    super(props);
    this.restoreZoomStep = this.restoreZoomStep.bind(this);
  }

  state = {
    chartReload: true,
  };

  objSummaryData: any; //Stores Connection Summary Data

  //local variables
  _isLoading: boolean = false;
  objChart: Chart;
  //ZoomSteps: number[] = [];
  ZoomSteps: [comboData] = [new comboData()];

  componentDidMount() {
    try {
      //initialize chart
      this.objChart = new Chart(this, "ConnectionChartLine");
      this.objChart.ContainerId = "lineChart";

      this.objChart.leftAxis().AutoScale = true;
      this.objChart.leftAxis().Min = 0;
      this.objChart.leftAxis().Max = 100;
      this.objChart.leftAxis().Inverted = true; //true
      this.objChart.leftAxis().ShowLabels = true;
      this.objChart.leftAxis().ShowTitle = true;
      this.objChart.leftAxis().Title = "depth";
      this.objChart.leftAxis().DisplayOrder = 1;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().bandScale = false;
      this.objChart.bottomAxis().Min = 100;
      this.objChart.bottomAxis().Max = 200;
      this.objChart.bottomAxis().Title = "Depth (ft)";
      this.objChart.bottomAxis().ShowLabels = true;
      this.objChart.bottomAxis().ShowTitle = true;
      this.objChart.bottomAxis().LabelAngel = 90;
      this.objChart.bottomAxis().ShowSelector = true;
      this.objChart.bottomAxis().IsDateTime = false;
      this.objChart.bottomAxis().Inverted = false;

      this.objChart.MarginLeft = 100;
      this.objChart.MarginBottom = 40;
      this.objChart.MarginTop = 100;
      this.objChart.MarginRight = 100;

      this.objChart.initialize();
      this.objChart.reDraw();
      this.objChart.onBeforeSeriesDraw.subscribe((e, i) => {
        this.onBeforeDrawSeries(e, i);
      });

      this.plotChartRegular();
    } catch (error) { }
  }

  componentDidUpdate() {
    try {
      this.plotChartRegular();
    } catch (error) { }
  }

  getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  handleSubmit = (dataItem: any) => alert(JSON.stringify(dataItem, null, 2));

  changeZoomIndex = () => {
    try {

      document.getElementById("svg-plot").style.zIndex = "1000";

    } catch (error) {

    }
  }


  render() {
    return (
      <>
        {/* <Dialog> */}
        <div className="row">


          <div>
            <label className="summaryTitle">Line Chart Testing</label>
          </div>

          <div className="col-xs-6 col-sm-6">
            <p>Zoom Steps</p>
            {/* <DropDownList data={this.ZoomSteps} /> */}
            <DropDownList
              name="unitList"
              label=""
              data={this.ZoomSteps}
              textField="text"
              dataItemKey="id"
              value={this.ZoomSteps[0]}
              onChange={(e) => {
                //wip

                this.restoreZoomStep(e.value.id);
              }}
            />
          </div>

          <div className="col-xs-3 col-sm-3">
            <button
              onClick={(e) => {
                //objChart.ZoomSteps = [new comboData()];
                this.restoreZoomStep(1, true);
              }}
            >
              Clear Zoom
            </button>
          </div>

          <div>
            <div className="col-xs-3 col-sm-3">
              <button
                onClick={(e) => {
                  this.changeZoomIndex();
                }}
              >
                Zoom
              </button>

            </div>
          </div>

          <div id="loader" style={{ marginLeft: "20px", display: "none" }}>
            <ProcessLoader />
          </div>
        </div>

        <div
          id="lineChart"
          style={{
            height: "calc(100vh - 250px)",
            width: "calc(100vw - 90px)",
            backgroundColor: "transparent",
          }}
        >
          {" "}
        </div>



        <div
          id="lineChart_legend"
          style={{
            textAlign: "center",
            height: "40px",
            width: "calc(100vw - 90px)",
            backgroundColor: "transparent",
            display: "inline-block",
          }}
        ></div>
        {/* </Dialog> */}
      </>
    );
  }

  updateZoomDropDownList = (zoomStep: string) => {
    try {
      //alert("zoom steps from lineChart" + zoomStep);
      let zoomCombo: comboData = new comboData("", "");
      zoomCombo.id = zoomStep;
      zoomCombo.text = zoomStep;
      this.ZoomSteps.push(zoomCombo);
    } catch (error) { }
  };

  restoreZoomStep = (zoomIndex: any, ClearZoom?: boolean) => {
    try {

      if (ClearZoom) {
        this.ZoomSteps = [new comboData()];
        //this.ZoomSteps = new Map();
        //this.ZoomSteps.length = 0;
      }
      //this.objChart.restoreZoomStep(zoomIndex, ClearZoom); //prath 17-12-2020 remove comment pening wip
    } catch (error) { }
  };
  //This method redraws the chart for regular view,
  plotChartRegular = () => {
    try {
      //Clear all the series

      this.objChart.DataSeries.clear();
      this.objChart.updateChart();

      //Configure Axes

      this.objChart.leftAxis().Inverted = false; //true
      this.objChart.leftAxis().AutoScale = true;


      this.objChart.leftAxis().Title = "Depth (ft)";
      this.objChart.leftAxis().ShowSelector = false;
      this.objChart.leftAxis().ShowTitle = true;
      this.objChart.leftAxis().Visible = true;


      this.objChart.axisPerColumn = 1;

      this.objChart.bottomAxis().Visible = false;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().Title = "ROP";
      this.objChart.bottomAxis().LabelAngel = 0;
      this.objChart.bottomAxis().ShowSelector = false;
      this.objChart.bottomAxis().ShowTitle = true;
      this.objChart.bottomAxis().Visible = true;
      this.objChart.bottomAxis().IsDateTime = false;
      this.objChart.bottomAxis().TicksCount = 10;
      this.objChart.bottomAxis().Inverted = false;

      //Add new serieses

      //clear dataSeries
      this.objChart.DataSeries.clear();

      let objDataSeries = new DataSeries();
      objDataSeries.Id = "PointSeries-1";
      objDataSeries.Stacked = false;
      objDataSeries.Title = "PointSeries-1";
      objDataSeries.Type = dataSeriesType.Point;
      objDataSeries.PointStyle = pointStyle.DownTriangle;
      objDataSeries.PointSize = 5;

      objDataSeries.Color =
        "#" +
        (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6); //"#ec0101";
      objDataSeries.ColorEach = false;

      objDataSeries.XAxisId = this.objChart.bottomAxis().Id;

      objDataSeries.YAxisId = this.objChart.leftAxis().Id;


      this.objChart.DataSeries.set(objDataSeries.Id, objDataSeries);



      let objPoint = new ChartData();
      for (var i = 0; i < 1000; i++) {
        objPoint = new ChartData();
        objPoint.x = Math.floor(Math.random() * 1000) + 1;// depth; //this.objSummaryData.connData[i]["x"];
        //objPoint.x = i;// depth; //this.objSummaryData.connData[i]["x"];

        //            objPoint.datetime = new Date(date_);
        objPoint.y = Math.floor(Math.random() * 1000) + 1;
        //objPoint.y = i;
        if (objDataSeries.ColorEach) {
          objPoint.color =
            "#" +
            (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
        }
        objDataSeries.Data.push(objPoint);
      }


      //Point Series-2
      objDataSeries = new DataSeries();
      objDataSeries.Id = "PointSeries-2";
      objDataSeries.Stacked = false;
      objDataSeries.Title = "PointSeries-2";
      objDataSeries.Type = dataSeriesType.Point;
      objDataSeries.PointStyle = pointStyle.Star;
      objDataSeries.Color =
        "#" +
        (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6); //"#ec0101";
      objDataSeries.ColorEach = false;

      objDataSeries.XAxisId = this.objChart.bottomAxis().Id;

      objDataSeries.YAxisId = this.objChart.leftAxis().Id;

      objDataSeries.PointSize = 5;


      this.objChart.DataSeries.set(objDataSeries.Id, objDataSeries);
      //      this.objChart.DataSeries.PointStyle = pointStyle.Diamond;



      objPoint = new ChartData();
      for (var i = 0; i < 10000; i++) {
        objPoint = new ChartData();
        objPoint.x = Math.floor(Math.random() * 1000) + 1;// depth; //this.objSummaryData.connData[i]["x"];
        //            objPoint.datetime = new Date(date_);
        objPoint.y = Math.floor(Math.random() * 1000) + 1;
        if (objDataSeries.ColorEach) {
          objPoint.color =
            "#" +
            (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
        }
        objDataSeries.Data.push(objPoint);
      }

      //


      this.objChart.reDraw();
      //
    } catch (error) { }
  };

  onBeforeDrawSeries = (e: ChartEventArgs, i: number) => {
    try {
      d3.select(".drlg_benchmark").remove();
      d3.select(".trip_highlight").remove();

      // if (this.state.CurrentView == 0 || this.state.CurrentView == 1) {

      //     let lnBenchMark = this.objUserSettings.DrlgBenchMark;

      //     if (lnBenchMark > 0) {

      //         let x1 = this.objChart.__chartRect.left;
      //         let x2 = this.objChart.__chartRect.right;
      //         let y1 = this.objChart.leftAxis().ScaleRef(lnBenchMark);
      //         let y2 = y1 + 4;

      //         this.objChart.SVGRef
      //             .append('g')
      //             .attr('class', 'drlg_benchmark')
      //             .append('rect')
      //             .attr('id', 'drlg_benchmark')
      //             .attr('x', x1)
      //             .attr('y', y1)
      //             .attr('width', (x2 - x1))
      //             .attr('height', (y2 - y1))
      //             .style('fill', 'red')
      //             .style('opacity', 0.5);
      //     }

      // }
    } catch (error) { }
  };
}

// export default StackBar;
