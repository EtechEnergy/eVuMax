//import React, { Component, useEffect, useState } from "react";
import React, { Component } from "react";
import axios from "axios";
import { BrokerParameter, BrokerRequest, Util } from "../../../Models/eVuMax";
import GlobalMod from "../../../objects/global";
import { Button } from "@progress/kendo-react-buttons";
import { Chart, curveStyle, lineStyle, zoomOnAxies } from "../../../eVuMaxObjects/Chart/Chart";
import { DataSeries, dataSeriesType, pointStyle } from "../../../eVuMaxObjects/Chart/DataSeries";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";

import { Axis, axisPosition } from "../../../eVuMaxObjects/Chart/Axis";
import * as utilFunc from "../../../utilFunctions/utilFunctions";

import DataSelector from "../../Common/DataSelector";
import DataSelector_ from "../../Common/DataSelector_";
import DataSelectorInfo from "../../Common/DataSelectorInfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearchMinus } from "@fortawesome/free-solid-svg-icons";
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";
import * as d3 from "d3";
import { Checkbox, Switch } from "@progress/kendo-react-inputs";
import $ from "jquery";


let _gMod = new GlobalMod();


interface IProps {
  PlotID: string;
  showListPanel: any;
  WellID: string;
  PlotName: string;
  updateWarnings: any;
  parentRef: any;
  objDataSelector: DataSelector_;
}

export class CustomDrillingSummary extends Component<IProps>  {
  intervalID: NodeJS.Timeout | undefined;
  objChart: Chart;
  //objDataSelector: any;
  WellID: string;
  PlotID: string;
  parentRef: any;
  PlotName: string;
  showListPanel: any;
  updateWarnings: any;
  constructor(props: any) {
    super(props);
    this.PlotID = props.PlotID;
    this.showListPanel = props.showListPanel;
    this.WellID = props.WellID;
    this.PlotName = props.PlotName;
    this.updateWarnings = props.updateWarnings;
    this.parentRef = props.parentRef;
    //    this.loadSummary = this.loadSummary.bind(this);
  }

  state = {
    warningMsg: [],
    isRealTime: false as boolean,
    objDataSelector: this.props.objDataSelector,
    showOffsetWell: true,

  };


  objSummaryAxisList: any = [];
  WellName: string = "";
  objData: any = "";
  topAxisCount: number = 0;

  selectionType: string = "-1"; //"-1 Default, 0= DateRange and 1 = Depth Range"
  fromDate: Date = null;
  toDate: Date = null;
  fromDepth: number = 0;
  toDepth: number = 0;
  MatchDepthByFormationTops: boolean = true;
  Warnings: string = ""; //Nishant 27/08/2021
  refreshHrs: number = 24;
  randNumber = Number(Math.random() * 1000).toFixed(0);

  //Cancel all Axios Request
  AxiosSource = axios.CancelToken.source();
  AxiosConfig = { cancelToken: this.AxiosSource.token };

  // useEffect(() => {

  //   window.addEventListener("resize", loadSummary);

  //   loadSummary();

  //   return () => {
  //     window.removeEventListener("resize", loadSummary);
  //   }
  // }, [showOffsetWell, dataSelector]);



  async componentDidMount() {
    try {
      window.addEventListener('resize', this.loadSummary);

      this.loadSummary();

      //RealTime 
      let isRealtimeRunning = sessionStorage.getItem("realCustomDrillingSummary");
      if (isRealtimeRunning == "true") {
        await this.setState({ isRealTime: !this.state.isRealTime });
        this.intervalID = setInterval(this.loadSummary.bind(this), 15000);
      }
    } catch (error) {

    }
  }


  componentWillUpdate(): void {
    try {
      this.state.objDataSelector.isApplyDateRange = false;
    } catch (error) {

    }
  }


  componentWillUnmount(): void {
    window.removeEventListener('resize', this.loadSummary);

    this.AxiosSource.cancel();
    clearInterval(this.intervalID);
    this.intervalID = null;

  }

  //Step-1
  loadSummary = async () => {
    try {

      //Axios call API Function with PlotID
     
      let objBrokerRequest = new BrokerRequest();

      objBrokerRequest.Module = "GenericDrillingSummary.Manager";
      objBrokerRequest.Broker = "GenericDrillingSummary";
      objBrokerRequest.Function = "generateGDSummary"; //"generateGDSummary";


      let objParameter = new BrokerParameter("wellID", this.WellID); // // "f3205325-4ddb-4996-b700-f04d6773a051"
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("PlotID", this.PlotID); //Hookload Comparison //"925-206-171-592-399"
      objBrokerRequest.Parameters.push(objParameter);
      objParameter = new BrokerParameter("UserID", _gMod._userId);


      objBrokerRequest.Parameters.push(objParameter);
      objParameter = new BrokerParameter("SelectionType", this.state.objDataSelector.selectedval);

      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("FromDate", utilFunc.formateDate(this.state.objDataSelector.fromDate));

      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("ToDate", utilFunc.formateDate(this.state.objDataSelector.toDate));
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("FromDepth", this.state.objDataSelector.fromDepth.toString());
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("ToDepth", this.state.objDataSelector.toDepth.toString());
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("SideTrackKey", "-999");
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("isRealTime", this.state.isRealTime.toString());
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("refreshHrs", this.state.objDataSelector.refreshHrs.toString());
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("showOffsetWell", this.state.showOffsetWell.toString());
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("MatchDepthByFormationTops", this.state.objDataSelector.MatchDepthByFormationTops.toString());
      objBrokerRequest.Parameters.push(objParameter);


      await axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: {
            paramRequest: JSON.stringify(objBrokerRequest)
          },
        })
        .then((res) => {
          console.log("res data", res);
          if (res.data.RequestSuccessfull == true) {
            let objData_ = JSON.parse(res.data.Response);

            console.log("CustomDrillSumm data", objData_);

            let warnings: string = res.data.Warnings;

            if (warnings.trim() != "") {
              let warningList = [];
              warningList.push({
                "update": warnings,
                "timestamp": new Date(Date.now()).getTime()
              });

              //PENDING WORK
              this.props.updateWarnings(warningList);

            }
            this.WellName = res.data.Category;
            this.objData = objData_;



            this.generateReport();
            Util.StatusSuccess("Data successfully retrived");
            Util.StatusReady();
          } else {
            
          }
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

  //Step-2
  initializeChart = () => {
    try {

      this.objChart = new Chart(this, "chart1" + Number(Math.random() * 1000).toFixed(0));
      this.objChart.ContainerId = "SummaryChart" + this.randNumber;



      this.objChart.onAfterSeriesDraw.subscribe((e, i) => {
        this.onAfterSeriesDraw(e, i);
      });

      this.objChart.onBeforeSeriesDraw.subscribe((e, i) => {
        this.onBeforeSeriesDraw(e, i);
      });


      this.objChart.DataSeries.clear();
      this.objChart.Axes.clear();
      this.objChart.createDefaultAxes();
      this.objChart.updateChart();

      this.objChart.leftAxis().AutoScale = true;

      this.objChart.leftAxis().Inverted = false;
      this.objChart.leftAxis().ShowLabels = true;
      this.objChart.leftAxis().ShowTitle = false;
      this.objChart.leftAxis().Title = "";
      this.objChart.leftAxis().Visible = true;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().IsDateTime = false;
      this.objChart.bottomAxis().bandScale = false; //wip
      this.objChart.bottomAxis().Title = "Depth / Date Time";
      this.objChart.bottomAxis().ShowLabels = true;
      this.objChart.bottomAxis().ShowTitle = false;
      this.objChart.bottomAxis().LabelAngel = 90;
      this.objChart.bottomAxis().ShowSelector = false;
      this.objChart.bottomAxis().Visible = true;
      this.objChart.bottomAxis().PaddingMax = 0; //wip


      this.objChart.rightAxis().Visible = false;
      this.objChart.rightAxis().ShowLabels = false;



      this.objChart.initialize();
      this.objChart.drawLegend();
      this.objChart.reDraw();

    } catch (error) {

    }
  }

  getOrdersAxisListByPosition = (paramAxisPosition: number) => {

    let arrAxis: any = [];
    try {
      let list = [];
      for (let index = 0; index < this.objSummaryAxisList.length; index++) {
        let objAxis = this.objSummaryAxisList[index];


        if (objAxis.AxisPosition == paramAxisPosition) {
          list.push(objAxis);
        }


      }
      if (list.length > 0) {
        arrAxis = list.sort((a, b) => (a.DisplayOrder < b.DisplayOrder) ? -1 : 1);
      }

      return arrAxis;

    } catch (error) {
      return arrAxis;
    }
  }


  setAxisPerColumnAndRow = (axisList: any): number => {
    try {
      let totalRighAxis: number = 0;
      let totalLeftAxis: number = 0;
      let totalTopAxis: number = 0;
      let totalBottomAxis: number = 0;

      //Set Axis Per Column
      for (let index = 0; index < axisList.length; index++) {


        if (axisList[index].Orientation == 0) { //// 0-Horizontal, 1-Vertical
          if (axisList[index].AxisPosition == 0) { //Left
            totalLeftAxis += 1;
          }

          if (axisList[index].AxisPosition == 2) { //Right
            totalRighAxis += 1;
          }

          if (axisList[index].AxisPosition == 1) { //Bottom
            totalBottomAxis += 1;
          }

          if (axisList[index].AxisPosition == 3) { //Top
            totalTopAxis += 1;
          }
        }

      }

      //Set Axis Per Column
      for (let index = 0; index < axisList.length; index++) {

        if (axisList[index].Orientation == 1) { //// 0-Horizontal, 1-Vertical
          if (axisList[index].AxisPosition == 1) { //Bottom
            totalBottomAxis += 1;
          }

          if (axisList[index].AxisPosition == 3) { //Top
            totalTopAxis += 1;
          }

          if (axisList[index].AxisPosition == 0) { //Left
            totalLeftAxis += 1;
          }

          if (axisList[index].AxisPosition == 2) { //Right
            totalRighAxis += 1;
          }

        }
      }




      if (totalRighAxis >= totalLeftAxis) {
        this.objChart.axisPerColumn = totalRighAxis;
      } else {
        this.objChart.axisPerColumn = totalLeftAxis;
      }


      if (totalBottomAxis >= totalTopAxis) {
        this.objChart.axisPerRow = totalBottomAxis
      } else {
        this.objChart.axisPerRow = totalTopAxis;
      }






    } catch (error) {
      return 1;
    }
  }

  generateReport = () => {
    try {


      let warningList = [];
      this.initializeChart();
      this.objChart.LegendPosition = 4;  //1 (left), 2 (right), 3 (top), 4 (bottom)

      //Generate Plot using state objGDSummary object

      if (this.objData.Axis != null || this.objData.Axis != undefined) {
        this.objSummaryAxisList = Object.values(this.objData.Axis);


        this.setAxisPerColumnAndRow(this.objSummaryAxisList);

        //prath on 27-Jan-2022 wip
        if (this.objChart.axisPerColumn > 1) {
          this.objChart.ZoomOnAxies = zoomOnAxies.x;
        }

        if (this.objChart.axisPerRow > 1) {
          this.objChart.ZoomOnAxies = zoomOnAxies.y;
        }

        this.objChart.Axes.clear();
        this.objChart.DataSeries.clear();

        this.objChart.MarginLeft = 10;
        this.objChart.MarginBottom = 10;
        this.objChart.MarginTop = 10;
        this.objChart.MarginRight = 90;


        let axisList = Object.values(this.objData.Axis);
        axisList = this.getOrdersAxisListByPosition(0);//Left



        for (let index = 0; index < axisList.length; index++) {

          let objSummaryAxis: any = axisList[index];

          //Create Custom Left Axis 
          let objAxis = new Axis();
          
          
          objAxis.DisplayOrder = index;
          objAxis.Id = objSummaryAxis.ColumnID.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');


          objAxis.AutoScale = true; // as in toolface objSummaryAxis.Automatic;
          objAxis.Position = axisPosition.left;


          objAxis.IsDateTime = false;
          objAxis.bandScale = false; //as in Toolface
          objAxis.AutoScale = objSummaryAxis.Automatic;
          objAxis.Title = objSummaryAxis.AxisTitle;

          

          objAxis.ShowLabels = true;
          objAxis.ShowTitle = true;
          objAxis.EndPos = objSummaryAxis.EndPosition;
          objAxis.StartPos = objSummaryAxis.StartPosition;
          objAxis.GridVisible = objSummaryAxis.ShowGrid;
          objAxis.LabelFont = objSummaryAxis.FontName;
          objAxis.LabelFontBold = objSummaryAxis.FontBold;
          objAxis.LabelFontColor = objSummaryAxis.FontColor;
          objAxis.LabelFontSize = objSummaryAxis.FontSize == 0 ? 10 : objSummaryAxis.FontSize;  // objSummaryAxis.FontSize;
          objAxis.LabelFontItalic = objSummaryAxis.FontItalic;
          objAxis.Min = objSummaryAxis.MinValue;
          objAxis.Max = objSummaryAxis.MaxValue;
          objAxis.LabelAngel = 0;
          objAxis.ShowSelector = false;
          objAxis.Visible = true;
          objAxis.Inverted = objSummaryAxis.Inverted;
          objAxis.PaddingMin = 0;


          //prath on 27-Jan-2022 wip
          if (this.objChart.axisPerColumn > 1) {
            objAxis.isAllowZooming = false;
            objAxis.isAllowScrolling = false;
          }
          //===============

          this.objChart.Axes.set(objAxis.Id, objAxis);


          //*************************************************** */
        }


        //// 0-left, 1-bottom, 2-right, 3-top
        axisList = this.getOrdersAxisListByPosition(2);//Right
        for (let index = 0; index < axisList.length; index++) {

          let objSummaryAxis: any = axisList[index];


          let objAxis = new Axis();

          objAxis.CustomPosition = true;
          objAxis.Id = objSummaryAxis.ColumnID.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');
          objAxis.Position = axisPosition.right;
          objAxis.AutoScale = objSummaryAxis.Automatic;
          objAxis.IsDateTime = false;
          objAxis.bandScale = false;
          objAxis.Title = objSummaryAxis.AxisTitle;
          objAxis.ShowLabels = true;
          objAxis.ShowTitle = true;
          objAxis.EndPos = objSummaryAxis.EndPosition;
          objAxis.StartPos = objSummaryAxis.StartPosition;
          objAxis.GridVisible = objSummaryAxis.ShowGrid;
          objAxis.LabelFont = objSummaryAxis.FontName;
          objAxis.LabelFontBold = objSummaryAxis.FontBold;
          objAxis.LabelFontColor = objSummaryAxis.FontColor;
          objAxis.LabelFontSize = objSummaryAxis.FontSize == 0 ? 10 : objSummaryAxis.FontSize;
          objAxis.LabelFontItalic = objSummaryAxis.FontItalic;
          objAxis.Min = objSummaryAxis.MinValue;
          objAxis.Max = objSummaryAxis.MaxValue;
          objAxis.LabelAngel = 0;
          objAxis.ShowSelector = false;
          objAxis.Visible = true;
          objAxis.Inverted = objSummaryAxis.Inverted;
          //prath on 27-Jan-2022 wip
          if (this.objChart.axisPerColumn > 1) {
            objAxis.isAllowZooming = false;
            objAxis.isAllowScrolling = false;
          }
          //===============

          this.objChart.Axes.set(objAxis.Id, objAxis);
          //*************************************************** */

          //// 0-left, 1-bottom, 2-right, 3-top



        }

        //// 0-left, 1-bottom, 2-right, 3-top
        axisList = this.getOrdersAxisListByPosition(1);//bottom
        for (let index = 0; index < axisList.length; index++) {

          let objSummaryAxis: any = axisList[index];

          //Create Custom Bottom Axis 
          let objAxis = new Axis();

          objAxis.CustomPosition = true;
          objAxis.Id = objSummaryAxis.ColumnID.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');
          objAxis.Position = axisPosition.bottom;
          objAxis.AutoScale = objSummaryAxis.Automatic;
          objAxis.IsDateTime = false;


          //objAxis.bandScale = true;
          objAxis.bandScale = false;
          objAxis.Title = objSummaryAxis.AxisTitle;
          objAxis.ShowLabels = true;
          objAxis.ShowTitle = true;
          objAxis.EndPos = objSummaryAxis.EndPosition;
          objAxis.StartPos = objSummaryAxis.StartPosition;
          objAxis.GridVisible = objSummaryAxis.ShowGrid;
          objAxis.LabelFont = objSummaryAxis.FontName;
          objAxis.LabelFontBold = objSummaryAxis.FontBold;
          objAxis.LabelFontColor = objSummaryAxis.FontColor;
          objAxis.LabelFontSize = objSummaryAxis.FontSize == 0 ? 10 : objSummaryAxis.FontSize;
          objAxis.LabelFontItalic = objSummaryAxis.FontItalic;
          objAxis.Min = objSummaryAxis.MinValue;
          objAxis.Max = objSummaryAxis.MaxValue;
          objAxis.LabelAngel = 0;
          objAxis.ShowSelector = false;
          objAxis.Visible = true;
          objAxis.Inverted = objSummaryAxis.Inverted;
          objAxis.PaddingMax = 2;
          this.objChart.Axes.set(objAxis.Id, objAxis);
          //prath on 27-Jan-2022 wip
          if (this.objChart.axisPerRow > 1) {
            objAxis.isAllowZooming = false;
            objAxis.isAllowScrolling = false;
          }
          //===============

          //*************************************************** */

        }


        //// 0-left, 1-bottom, 2-right, 3-top
        axisList = this.getOrdersAxisListByPosition(3);//Top
        for (let index = 0; index < axisList.length; index++) {


          let objSummaryAxis: any = axisList[index];

          //Create Custom Bottom Axis 
          let objAxis = new Axis();

          objAxis.CustomPosition = true;
          objAxis.Id = objSummaryAxis.ColumnID.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');
          objAxis.Position = axisPosition.top;
          objAxis.AutoScale = objSummaryAxis.Automatic;
          objAxis.IsDateTime = false;

          // if (objSummaryAxis.Id == "DiffPressure") {
          //   objAxis.bandScale = true; //false; need to check 
          // } else {
          //   objAxis.bandScale = false;// need to check if series has Bar then True
          // }

          objAxis.Title = objSummaryAxis.AxisTitle;
          objAxis.ShowLabels = true;
          objAxis.ShowTitle = true;
          objAxis.EndPos = objSummaryAxis.EndPosition;
          objAxis.StartPos = objSummaryAxis.StartPosition;
          objAxis.GridVisible = objSummaryAxis.ShowGrid;
          objAxis.LabelFont = objSummaryAxis.FontName;
          objAxis.LabelFontBold = objSummaryAxis.FontBold;
          objAxis.LabelFontColor = objSummaryAxis.FontColor;
          objAxis.LabelFontSize = objSummaryAxis.FontSize == 0 ? 10 : objSummaryAxis.FontSize;
          objAxis.LabelFontItalic = objSummaryAxis.FontItalic;
          objAxis.Min = objSummaryAxis.MinValue;
          objAxis.Max = objSummaryAxis.MaxValue;
          objAxis.LabelAngel = 0;
          objAxis.ShowSelector = false;
          objAxis.Visible = true;
          objAxis.Inverted = objSummaryAxis.Inverted;
          this.objChart.Axes.set(objAxis.Id, objAxis);
          //prath on 27-Jan-2022 wip
          if (this.objChart.axisPerRow > 1) {
            objAxis.isAllowZooming = false;
            objAxis.isAllowScrolling = false;
          }
          //===============
          //*************************************************** */
        }

        this.topAxisCount = axisList.length;


        //Load Series
        let SeriesList = Object.values(this.objData.dataSeries);




        for (let index = 0; index < SeriesList.length; index++) {



          let objDataSeries: any = SeriesList[index];

          let objSeries = new DataSeries();
          objSeries.Id = objDataSeries.SeriesID.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');// objDataSeries.SeriesID;
          objSeries.Name = objDataSeries.SeriesName;

          
          objSeries.XAxisId = objDataSeries.XColumnID.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');
          objSeries.YAxisId = objDataSeries.YColumnID.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');;

          objSeries.PointSize = objDataSeries.PointWidth;
          let SeriesType: dataSeriesType = dataSeriesType.Line;
          
          objSeries.Color = objDataSeries.LineColor;//Dont change position of this line


          objSeries.ShowRoadMap = objDataSeries.ShowRoadMap;
          objSeries.RoadMapTransparency = objDataSeries.RoadMapTransparency;
          objSeries.RoadMapColor = objDataSeries.RoadMapColor;
          objSeries.RMColor = objDataSeries.RMColor;
          objSeries.RoadmapDepth = objDataSeries.roadmapDepth;
          objSeries.RoadmapMin = objDataSeries.roadmapMin;
          objSeries.RoadmapMax = objDataSeries.roadmapMax;



          switch (objDataSeries.SeriesType) { // 0 - Line, 1-Points, 2-Area, 3-Histogram, 4-Pie, 5-Bar
            case 0:
              SeriesType = dataSeriesType.Line;

              objSeries.LineWidth = objDataSeries.LineWidth == 0 ? 1 : objDataSeries.LineWidth;
              objSeries.ShowPointsOnLineSeries = objDataSeries.ShowPoints;
              // smooth = 0,
              // step = 1,
              // normal = 2,
              if (objDataSeries.StepLine == true) {
                objSeries.CurveStyle = curveStyle.step;
              } else {

                objSeries.CurveStyle = curveStyle.normal;
              }
              break;
            case 1:
              SeriesType = dataSeriesType.Point;
              objSeries.Color = objDataSeries.PointColor;

              break;
            case 2:
              SeriesType = dataSeriesType.Area;
              objSeries.Color = objDataSeries.PointColor;
              break;
            case 3:
              SeriesType = dataSeriesType.Bar;

              break;
            case 4:
              SeriesType = dataSeriesType.Pie;
              break;
            case 5:
              SeriesType = dataSeriesType.Bar;
              objSeries.Stacked = false;
              objSeries.Color = objDataSeries.grpColor;
              objSeries.ShowLabelOnSeries = true; //Parth 05-10-2020
              break;

            default:
              break;
          }
          objSeries.Type = SeriesType;

          objSeries.PointStyle = objDataSeries.PointerStyle;
          //objSeries.Title = WellName + "-" + objDataSeries.SeriesName;
          objSeries.Title = objDataSeries.SeriesName;


          if (SeriesType == dataSeriesType.Area || SeriesType == dataSeriesType.Point) {
            objSeries.Color = objDataSeries.PointColor;
          }
          else if (SeriesType == dataSeriesType.Line) {
            objSeries.Color = objDataSeries.LineColor;
          }


          objSeries.ShowInLegend = true;


          //Populate the data series with this data

          objSeries.Data.length = 0;
          

          //prath 04-Feb-2022 (To handle autoscale false case - No need to fill all data to series to avoid overlape charts)
          let xMin = 0;
          let xMax = 0;
          let yMin = 0;
          let yMax = 0;
          let autoScaleX = true;
          let autoScaleY = true;
          if (this.objChart.Axes.get(objSeries.XAxisId).AutoScale == false) {
            xMin = this.objChart.Axes.get(objSeries.XAxisId).Min;
            xMax = this.objChart.Axes.get(objSeries.XAxisId).Max;
            autoScaleX = false;
          }
          if (this.objChart.Axes.get(objSeries.YAxisId).AutoScale == false) {
            yMin = this.objChart.Axes.get(objSeries.YAxisId).Min;
            yMax = this.objChart.Axes.get(objSeries.YAxisId).Max;
            autoScaleY = false;
          }
          //==========================================

          


          if (objDataSeries.xDataBuffer != null || objDataSeries.xDataBuffer != undefined) {
            
            if (objDataSeries.xDataBuffer.length == 0) {
              //No data in Series
              warningList.push({
                "update": "No Data for Series " + objDataSeries.SeriesName,
                "timestamp": new Date(Date.now()).getTime()
              });
              this.props.updateWarnings(warningList);
            }
            for (let i = 0; i < objDataSeries.xDataBuffer.length; i++) {

              //prath 04-Feb-2022  (To handle autoscale false case - No need to fill all data to series to avoid overlape charts)
              if (objSeries.Type != dataSeriesType.Bar) {
                if (autoScaleX == false && !(objDataSeries.xDataBuffer[i] >= xMin && objDataSeries.xDataBuffer[i] <= xMax)) {
                  continue;
                }

                if (autoScaleY == false && !(objDataSeries.yDataBuffer[i] >= yMin && objDataSeries.yDataBuffer[i] <= yMax)) {
                  continue;
                }
              }
              //========


              let objVal: ChartData = new ChartData();

              if (objSeries.Type == dataSeriesType.Bar) {
                objVal.x = i + 1;

                let objBottomAxes = this.objChart.getAxisByID(objSeries.XAxisId);
                objBottomAxes.bandScale = true;
                if (objDataSeries.labelBuffer != null) {
                  this.objChart.Axes.get(objSeries.XAxisId).Labels.push(objDataSeries.labelBuffer[i]);
                }

              } else {
                objVal.x = objDataSeries.xDataBuffer[i];
              }

              objVal.y = objDataSeries.yDataBuffer[i];

              objSeries.Data.push(objVal);

            }


            if (objDataSeries.ColorPointsAsColumn) {

              this.formatSeries(objSeries, objDataSeries); //Nishant
            }
            if (objDataSeries.Visible) {
              this.objChart.DataSeries.set(objSeries.Id, objSeries);
            }

          } else {
            //No data in Series
            warningList.push({
              "update": "No Data for Series " + objDataSeries.SeriesName,
              "timestamp": new Date(Date.now()).getTime()
            });
            this.props.updateWarnings(warningList);

          }
        }


        this.objChart.initialize();


        this.objChart.drawLegend();
        this.objChart.reDraw();

      }


      //Axis Object:
      //       Automatic: true
      // AxisID: "481-874-108-849-396"
      // AxisName: ""
      // AxisPosition: 1
      // AxisTitle: "Depth"
      // ColumnID: "DEPTH"
      // DisplayOrder: 0
      // EndPosition: 100
      // FontBold: false
      // FontColor: "0, 0, 0"
      // FontItalic: false
      // FontName: "Arial"
      // FontSize: 9
      // Inverted: false
      // MaxValue: 0
      // MinValue: 0
      // Orientation: 0
      // RelativePosition: 0
      // ShowGrid: false
      // StartPosition: 0
      // WidthPercentage: 100


      //dataSeries Object:

      // Color1: "0, 128, 128"
      // Color2: "0, 128, 192"
      // Color3: "128, 0, 64"
      // Color4: "255, 0, 255"
      // Color5: "255, 128, 0"
      // ColorPointsAsColumn: false
      // DataFilter: ""
      // DataSource: 0
      // DisplayOrder: 0
      // FixedRangeList: {}
      // IgnoreNegative: false
      // LineColor: "255, 0, 0"
      // LineStyle: 0
      // LineWidth: 2
      // MainGroupOn: 0
      // ObjectID: "us_1395675560_wb1~us_1395675560_wb1_log_2"
      // PointColor: "0, 0, 0"
      // PointHeight: 3
      // PointWidth: 3
      // PointerStyle: 0
      // RMColor: "255, 128, 0"
      // RefreshRequired: true
      // RoadMapColor: "0, 0, 0"
      // RoadMapTransparency: 60
      // SeriesID: "297-502-640-841-654"
      // SeriesName: "ROP"
      // SeriesType: 0
      // ShowMarks: true
      // ShowPoints: false
      // ShowRoadMap: true
      // SplitType: 0
      // StackedBars: false
      // StepLine: false
      // Type: 0
      // Visible: true
      // XColumnID: "DEPTH"
      // XColumnName: "Depth"
      // YColumnID: "ROP"
      // YColumnName: "ROP"
      // colorBuffer: (1749) ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ???]
      // groupFunction: 0
      // grpColor: "240, 240, 240"
      // grpExpression: ""
      // grpExpressionType: 0
      // grpFilter: ""
      // grpFunctionType: 0
      // grpGroupBy: 0
      // grpGroupByExpression: ""
      // hasColorData: false
      // isOffset: false
      // labelBuffer: null
      // roadmapDepth: (4) [782.96, 1959.05, 3174.79, 4007.3]
      // roadmapMax: (4) [181.24, 181.24, 532.66, 205.84]
      // roadmapMin: (4) [47.7, 82.84, 177.73, 79.33]
      // splitMnemonic: "0"
      // variableRangeFrom: 0
      // variableRangeIncrement: 0
      // variableRangeTo: 0
      // xDataBuffer: (1749) [8007.15, 8007.45, 8007.6, 8007.9, 8008.05, 8008.25, 8008.35, 8008.5, 8008.65, 8008.85, 8009.067, 8009.3, 8009.433, 8009.667, 8009.94, 8010.25, 8010.35, 8010.65, 8010.75, 8010.9, 8011.067, 8011.25, 8011.45, 8011.65, 8011.85, 8012, 8012.3, 8012.6, 8012.8, 8012.867, 8013.033, 8013.333, 8013.533, 8013.7, 8013.967, 8014.18, 8014.4, 8014.4, 8014.55, 8014.7, 8015, 8015.133, 8015.467, 8015.567, 8015.8, 8016, 8016.175, 8016.4, 8016.6, 8016.8, 8017, 8017.1, 8017.2, 8017.5, 8017.733, 8017.933, 8018.22, 8018.4, 8018.333, 8018.5, 8018.8, 8019.067, 8019.233, 8019.45, 8019.6, 8019.75, 8019.95, 8020.2, 8020.45, 8020.6, 8020.85, 8021, 8021.25, 8021.45, 8021.55, 8021.8, 8021.95, 8022.2, 8022.45, 8022.65, 8022.85, 8023.133, 8023.45, 8023.65, 8023.85, 8024.05, 8024.25, 8024.45, 8024.65, 8024.85, 8025.2, 8025.45, 8025.65, 8025.9, 8026.05, 8026.25, 8026.55, 8026.75, 8026.95, 8027.15, ???]
      // yDataBuffer: (1749) [0, 0, 0, 0, 13.545, 27.09, 27.09, 27.09, 27.09, 27.09, 28.797, 29.65, 29.65, 29.65, 28.238, 26.12, 26.12, 26.12, 26.12, 26.12, 28.58, 28.58, 28.58, 28.58, 28.58, 29.865, 31.15, 31.15, 31.15, 31.15, 29, 24.7, 24.7, 24.7, 25.79, 27.97, 27.97, 27.97, 27.97, 27.97, 27.97, 24.68, 24.68, 24.68, 24.68, 25.2, 25.46, 25.46, 25.46, 25.46, 26.585, 27.71, 27.71, 27.71, 27.71, 27.71, 24.87, 24.87, 16.58, 0, 0, 13.953, 20.93, 20.93, 20.93, 20.93, 25.06, 29.19, 29.19, 29.19, 29.19, 31.42, 33.65, 33.65, 33.65, 33.65, 34.23, 34.81, 34.81, 34.81, 34.81, 36.6, 36.6, 36.6, 36.6, 39.32, 39.32, 39.32, 39.32, 39.32, 37.993, 37.33, 37.33, 37.33, 40.28, 40.28, 40.28, 40.28, 40.28, 37.93, ???]



    } catch (error) {
      
    }
  };


  selectionChanged = async (paramDataSelector: DataSelector_, paramRefreshHrs: boolean = false) => {

    //   let realtimeStatus: boolean = false;// paramRefreshHrs;
    //   this.objDataSelector = paramDataSelector;
    //   paramDataSelector.needForceReload = true;

    //   //await setDataSeletor(paramDataSelector);
    // this.setState({ objDataSelector  : paramDataSelector})

    // loadSummary();

    let realtimeStatus: boolean = paramRefreshHrs;
    paramDataSelector.needForceReload = true;

    //workAround
    if (paramDataSelector.MatchDepthByFormationTops == undefined) {
      paramDataSelector.MatchDepthByFormationTops = false;
    }

    await this.setState({
      objDataSelector: paramDataSelector,
      isRealTime: realtimeStatus
    });


    this.selectionType = paramDataSelector.selectedval;
    this.fromDate = paramDataSelector.fromDate;
    this.toDate = paramDataSelector.toDate;
    this.fromDepth = paramDataSelector.fromDepth;
    this.toDepth = paramDataSelector.toDepth;
    this.refreshHrs = paramDataSelector.refreshHrs;
    this.MatchDepthByFormationTops = paramDataSelector.MatchDepthByFormationTops;
    if (this.state.isRealTime) {
      this.intervalID = setInterval(this.loadSummary.bind(this), 15000);
    } else {
      this.AxiosSource.cancel();
      await clearInterval(this.intervalID);
      this.intervalID = null;

      this.loadSummary();
    }



  }



  //Nishant to Plot Heat Map for Point Series
  formatSeries = (paramSeries: DataSeries, paramDataSeries: any) => {
    try {

      if (paramDataSeries.ColorPointsAsColumn) {
        
        paramSeries.ColorEach = true;

        for (let index = 0; index < paramDataSeries.colorBuffer.length; index++) {
          paramSeries.Data[index].color = paramDataSeries.colorBuffer[index]
        }

      }



    } catch (error) {

    }
  }
  //********************* */


  onAfterSeriesDraw = (e: ChartEventArgs, i: number) => {

    // //Formation Tops
    d3.selectAll(".formationTop-" + this.objChart.Id).remove();
    d3.selectAll(".formationTopText-" + this.objChart.Id).remove();

    let objFormationTops: any = Object.values(this.objData.allFormationTopsInfo);


    if (this.objData.PlotOrientation == 0) {//Horizontal
      //Bottom axes
      let arrBottomAxes: Axis[] = Array.from(this.objChart.Axes.values()).filter(
        (x) => x.Position == axisPosition.bottom
      );


      if (objFormationTops.length > 0 && this.objData.ShowTops) {

        for (let index = 0; index < objFormationTops.length; index++) {
          const depth = objFormationTops[index].Depth;

          // if (depth > arrBottomAxes[0].ScaleRef.domain()[1]) {
          //   break;
          // }

          if (depth > arrBottomAxes[0].ScaleRef.domain()[1] || depth < arrBottomAxes[0].ScaleRef.domain()[0]) {
            continue;
          }

          let x1 = arrBottomAxes[0].ScaleRef(depth);
          let x2 = x1;
          let y1 = this.objChart.__chartRect.top;
          let y2 = this.objChart.__chartRect.bottom;

          let formationTop = this.objChart.SVGRef.append("g")
            .attr("class", "formationTop-" + this.objChart.Id)
            .append("line")
            .attr("id", "line-1")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .style("fill", objFormationTops[index].TopColor)
            .style("stroke", objFormationTops[index].TopColor);

          this.objChart.SVGRef.append("g")
            .attr("class", "formationTopText-" + this.objChart.Id)
            .attr(
              "transform",
              "translate(" + (x1 + 9) + "," + (y2 - 20) + ") rotate(-90)"
            )
            .append('text')
            .style('background-color', 'green')
            .attr('class', 'axis-title')

            .attr('dy', '0.25em !important')
            .text(objFormationTops[index].TopName);
        }
      }
    } else {

      //Left axes
      let arrLeftAxes: Axis[] = Array.from(this.objChart.Axes.values()).filter(
        (x) => x.Position == axisPosition.left
      );


      if (objFormationTops.length > 0 && this.objData.ShowTops) {

        for (let index = 0; index < objFormationTops.length; index++) {
          const depth = objFormationTops[index].Depth;


          if (arrLeftAxes[0].Inverted) {
            // if (depth > arrLeftAxes[0].ScaleRef.domain()[1]) {
            //   break;
            // }


            if (depth > arrLeftAxes[0].ScaleRef.domain()[1] || depth < arrLeftAxes[0].ScaleRef.domain()[0]) {
              continue;
            }

          } else {
            // if (depth > arrLeftAxes[0].ScaleRef.domain()[0]) {
            //   break;
            // }

            if (depth > arrLeftAxes[0].ScaleRef.domain()[0] || depth < arrLeftAxes[0].ScaleRef.domain()[1]) {
              continue;
            }

          }



          let y1 = arrLeftAxes[0].ScaleRef(depth);
          let y2 = y1;

          let x1 = this.objChart.__chartRect.left;
          let x2 = this.objChart.__chartRect.right;

          let formationTop = this.objChart.SVGRef.append("g")
            .attr("class", "formationTop-" + this.objChart.Id)
            .append("line")
            .attr("id", "line-1")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .style("fill", objFormationTops[index].TopColor)
            .style("stroke", objFormationTops[index].TopColor);



          let SeriesList = Object.values(this.objData.dataSeries);
          for (let i = 0; i < SeriesList.length; i++) {
            const objSeries: any = SeriesList[i];

            let mnemonicX = objSeries.XColumnID;
            let objXAxis = this.objChart.getAxisByID(mnemonicX);

            this.objChart.SVGRef.append("g")
              .attr("class", "formationTopText-" + this.objChart.Id)
              .attr(
                "transform",
                //"translate(" + (x1 + 2) + "," + (y2 - 20) + ") rotate(0)"
                "translate(" + (objXAxis.StartPos + 5) + "," + (y2 + 5) + ") rotate(0)"
              )
              .append('text')
              .style('background-color', 'green')
              .attr('class', 'axis-title')
              .attr('dy', '0.25em !important')
              .text(objFormationTops[index].TopName);

          }






        }
      }



    }









    //Heat Map logic



    d3.selectAll(".HeatMap").remove();
    d3.selectAll(".ColorAxisLineText").remove();

    if (this.objData.ShowColorAxis == false) {
      return;
    }




    let Intervals: number = 10;
    let x1_: number = this.objChart.Width - 80;
    let x2_: number = (x1_ + 10);
    // let y1_: number = ((topAxisCount * 35) + this.objChart.MarginTop);
    // let y2_: number = (this.objChart.Height - this.objChart.MarginBottom);

    let y1_: number = this.objChart.__chartRect.top + 5;
    let y2_: number = this.objChart.__chartRect.bottom - 5;
    // let y2_: number = (this.objChart.Height - this.objChart.MarginBottom);
    let TotalHeight: number = (y2_ - y1_) - 10;
    let SectionHeight: number = (TotalHeight / Intervals);
    let rStartY: number = y1_;

    for (let j = Intervals; j > 0; j--) {
      try {

        this.objChart.SVGRef.append("g")
          .append('rect')
          .attr("class", "HeatMap") //custom axis title from base color  01-10-2020
          .attr('x', x1_)
          .attr('y', rStartY)
          .attr('width', (x2_ - x1_))
          .attr('height', SectionHeight)
          .attr('stroke', 'black')
          .attr('fill', this.objData.IntervalColors[j]);


        let val = (this.objData.IntervalList[j].maxValue).toFixed(0);


        this.objChart.SVGRef.append("g").append("text")
          .attr("x", x2_ + 2)
          .attr("y", rStartY + 2)
          .attr("class", "heatmapText")
          // .attr("font-size", "10pt")
          // .attr("fill", "red")
          //.style("text-anchor", "middle")
          .text(val);



        if (j == 1) {
          this.objChart.SVGRef.append("g").append("text")
            .attr("x", x2_ + 2)
            .attr("y", (rStartY + SectionHeight))
            .attr("class", "heatmapText")
            .text((this.objData.IntervalList[j].minValue).toFixed(0));
        }



        rStartY = (rStartY + SectionHeight);
      } catch (error) {

      }



    }
    let x1: number = this.objChart.Width - 20;  //80
    let y1: number = this.objChart.__chartRect.top + (this.objChart.__chartRect.height) / 2;

    //HeatMap Memonic Text
    this.objChart.SVGRef.append("g").append("text")
      .attr("class", "heatmapText")
      .attr("transform", "translate(" + x1 + "," + y1 + ") rotate(-90)")
      //.attr("style", "stroke-dasharray:0;font-family:arial;font-size:1vw")
      .text(this.objData.ColorAxisMnemonic);
    //******************** */





  };

  onBeforeSeriesDraw = (e: ChartEventArgs, i: number) => {
    try {


      // //RoadMap

      //d3.selectAll(".RoadMap").remove();
      let x1 = 0;
      let x2 = 0;
      let y1 = 0;
      let y2 = 0;



      //objCRMColor
      //RoadMapTransparency

      for (let key of this.objChart.DataSeries.keys()) {
        let objSeries: DataSeries = this.objChart.DataSeries.get(key);


        if (objSeries.ShowRoadMap && (objSeries.RoadmapDepth != null && objSeries.RoadmapMin != null && objSeries.RoadmapMax != null)) {
          let x0 = 0;
          let x1 = 0;
          let y0 = 0;
          let y1 = 0;

          let currentDepth = 0;
          let prevDepth = 0;

          if (this.objData.PlotOrientation == 0) {//horizontal
            d3.selectAll(".RoadMap-" + objSeries.YAxisId).remove();

            for (let i = 0; i < objSeries.RoadmapDepth.length; i++) {
              if (i > 0) {
                currentDepth = objSeries.RoadmapDepth[i];
                prevDepth = objSeries.RoadmapDepth[i - 1];
              } else {

                currentDepth = objSeries.RoadmapDepth[i];
                prevDepth = 0
              }

              let mnemonicY = objSeries.YAxisId;
              let objYAxis: Axis = this.objChart.getAxisByID(mnemonicY);

              let mnemonicX = objSeries.XAxisId;
              let objXAxis = this.objChart.getAxisByID(mnemonicX);

              if (objXAxis.Inverted) {
                x1 = objXAxis.ScaleRef(prevDepth);
                x0 = objXAxis.ScaleRef(currentDepth);
              } else {
                x1 = objXAxis.ScaleRef(currentDepth);
                x0 = objXAxis.ScaleRef(prevDepth);
              }


              if (x0 > this.objChart.__chartRect.right) {
                x0 = this.objChart.__chartRect.right;
              }

              if (x0 < this.objChart.__chartRect.left) {
                x0 = this.objChart.__chartRect.left;
              }


              if (x1 > this.objChart.__chartRect.right) {
                x1 = this.objChart.__chartRect.right;
              }


              if (x1 < this.objChart.__chartRect.left) {
                x1 = this.objChart.__chartRect.left;
              }


              if (objYAxis.Inverted) {
                y0 = objYAxis.ScaleRef(objSeries.RoadmapMin[i]);
                y1 = objYAxis.ScaleRef(objSeries.RoadmapMax[i]);
              } else {
                y0 = objYAxis.ScaleRef(objSeries.RoadmapMax[i]);
                y1 = objYAxis.ScaleRef(objSeries.RoadmapMin[i]);

              }


              //--NEW CODE
              if (y0 > objYAxis.EndPos) {
                y0 = objYAxis.EndPos;
              }

              if (y0 < objYAxis.StartPos) {
                y0 = objYAxis.StartPos;
              }

              if (y1 > objYAxis.EndPos) {
                y1 = objYAxis.EndPos;
              }

              if (y1 < objYAxis.StartPos) {
                y1 = objYAxis.StartPos;
              }
              //-------- END NEW CODE


              this.objChart.SVGRect.append("g")
                .attr("class", "RoadMap-" + mnemonicY)
                .attr("id", "RoadMapId-" + mnemonicY + i.toString())
                .append("rect")
                .attr("x", x0)
                .attr("y", y0)
                .attr("width", (x1 - x0))
                .attr("height", (y1 - y0))
                .style("border", "0px solid black")
                .style("stroke-width", "20px solid black")
                .style("fill", objSeries.RMColor)  //
                .style("filter", "opacity(" + (100 - 80) + "%)"); //objSeries.RoadMapTransparency=80
            }

          } else {
            //Vertical Plot (Untested)
            d3.selectAll(".RoadMap-" + objSeries.XAxisId).remove();


            for (let i = 0; i < objSeries.RoadmapDepth.length; i++) {

              if (i > 0) {
                currentDepth = objSeries.RoadmapDepth[i];
                prevDepth = objSeries.RoadmapDepth[i - 1];
              } else {
                currentDepth = objSeries.RoadmapDepth[i];
                prevDepth = 0
              }

              let mnemonicY = objSeries.YAxisId;
              let objYAxis: Axis = this.objChart.getAxisByID(mnemonicY);

              let mnemonicX = objSeries.XAxisId;
              let objXAxis = this.objChart.getAxisByID(mnemonicX);




              if (objYAxis.Inverted) {
                y1 = objYAxis.ScaleRef(currentDepth);
                y0 = objYAxis.ScaleRef(prevDepth);
              } else {
                y1 = objYAxis.ScaleRef(prevDepth);
                y0 = objYAxis.ScaleRef(currentDepth);
              }


              if (y0 > this.objChart.__chartRect.bottom) {
                y0 = this.objChart.__chartRect.bottom;
              }

              if (y0 < this.objChart.__chartRect.top) {
                y0 = this.objChart.__chartRect.top;
              }


              if (y1 > this.objChart.__chartRect.bottom) {
                y1 = this.objChart.__chartRect.bottom;
              }


              if (y1 < this.objChart.__chartRect.top) {
                y1 = this.objChart.__chartRect.top;
              }


              if (objXAxis.Inverted) {
                x0 = objXAxis.ScaleRef(objSeries.RoadmapMax[i]);
                x1 = objXAxis.ScaleRef(objSeries.RoadmapMin[i]);

              } else {
                x0 = objXAxis.ScaleRef(objSeries.RoadmapMin[i]);
                x1 = objXAxis.ScaleRef(objSeries.RoadmapMax[i]);
              }



              if (x0 > objXAxis.EndPos) {
                x0 = objXAxis.EndPos;
              }

              if (x0 < objXAxis.StartPos) {
                x0 = objXAxis.StartPos;
              }

              if (x1 > objXAxis.EndPos) {
                x1 = objXAxis.EndPos;
              }

              if (x1 < objXAxis.StartPos) {
                x1 = objXAxis.StartPos;
              }

              this.objChart.SVGRect.append("g")
                .attr("class", "RoadMap-" + mnemonicY)
                .attr("id", "RoadMapId-" + mnemonicY + i.toString())
                .append("rect")
                .attr("x", x0)
                .attr("y", y0)
                .attr("width", (x1 - x0))
                .attr("height", (y1 - y0))
                .style("border", "0px solid black")
                .style("stroke-width", "20px solid black")
                .style("fill", objSeries.RMColor)  //
                .style("filter", "opacity(" + (100 - 80) + "%)"); //objSeries.RoadMapTransparency=80
            }

            //=====

          }

        }

      }

      // // Road Map logic end

    } catch (error) {

    }

  };
  handleChange = async () => {
    await this.setState({ showOffsetWell: !this.state.showOffsetWell })
    this.loadSummary();
  }



  handleToggleSwitch = async () => {

    await this.setState({ isRealTime: !this.state.isRealTime });

    if (this.state.isRealTime) {
      //Added condition on 02-02-2022
      this.state.objDataSelector.needForceReload = false;
      this.intervalID = setInterval(this.loadSummary.bind(this), 15000);
    } else {
      this.AxiosSource.cancel();
      await clearInterval(this.intervalID);
      this.intervalID = null;
      //this.loadConnections();
    }
    sessionStorage.setItem("realCustomDrillingSummary", this.state.isRealTime.toString());
  };


  closeEvent = async () => {
    try {

      this.AxiosSource.cancel();
      await clearInterval(this.intervalID);
      this.intervalID = null;

      //prath

      // this.state.objDataSelector = new DataSelector_();
      this.setState({ objDataSelector: new DataSelector_() });

      this.showListPanel();
    } catch (error) {

    }

  }

  render() {
    return (
      <div>

        <div className="" style={{ display: "inline-flex", justifyContent: "space-between", width: "92vw", }}>
          <div className="col-lg-2">
            <div className="flex-item" >
              <label>{this.PlotName} </label>
            </div>
          </div>


          <div className="col-lg-2">
            <div>
              <input type="checkbox" id="offsetWell" name="chkOffsetWell" value="true" checked={this.state.showOffsetWell} onChange={this.handleChange} /> Show OffsetWell

              <label className=" mr-1 ml-5">Realtime</label> <Switch onChange={this.handleToggleSwitch} value={this.state.isRealTime} checked={this.state.isRealTime}></Switch>
            </div>



          </div><div className="col-lg-2">
            <label className=" ml-5 mr-1" onClick={() => { this.loadSummary(); }} style={{ cursor: "pointer" }}>Undo Zoom</label>
            <FontAwesomeIcon icon={faSearchMinus} size="lg" onClick={() => { this.loadSummary() }} />
          </div>

          <div className="col-lg-4">
            <div className="flex-item">
              <DataSelectorInfo objDataSelector={this.state.objDataSelector} isRealTime={this.state.isRealTime} />
            </div>
          </div>



          <div className="col-lg-1">
            <div className="flex-item">
              <Button onClick={this.closeEvent}>Close</Button>
            </div>
          </div>

        </div>

        <div
          id={"SummaryChart" + this.randNumber}
          style={{
            width: "100%",
            height: "calc(65vh)",
            backgroundColor: "transparent",
            // float: "right",
            marginLeft: "10px",
          }}
        ></div>

        <div
          id={"SummaryChart" + this.randNumber + "_legend"}
          style={{
            textAlign: "center",
            height: "40px",
            width: "100%",
            backgroundColor: "transparent",
            display: "inline-block",
            paddingBottom: '10px',
            fontSize: '81.25% !important',
            lineHeight: 1.5,
            fontWeight: 'bold'
          }}
        />
        <div className="Data">
          <DataSelector refreshDataSelector ={this.state.isRealTime} objDataSelector={this.state.objDataSelector} wellID={this.WellID} selectionChanged={this.selectionChanged} ></DataSelector>
        </div>
      </div>
    );
  }
}