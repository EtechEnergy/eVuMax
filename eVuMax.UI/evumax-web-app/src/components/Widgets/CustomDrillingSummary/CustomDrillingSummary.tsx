import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrokerParameter, BrokerRequest, Util } from "../../../Models/eVuMax";
import GlobalMod from "../../../objects/global";
import { Button } from "@progress/kendo-react-buttons";
import { Chart } from "../../../eVuMaxObjects/Chart/Chart";
import { DataSeries, dataSeriesType, pointStyle } from "../../../eVuMaxObjects/Chart/DataSeries";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";

import { Axis, axisPosition } from "../../../eVuMaxObjects/Chart/Axis";
import * as utilFunc from "../../../utilFunctions/utilFunctions";
import { debug } from "console";
import DataSelector from "../../Common/DataSelector";
import DataSelector_ from "../../Common/DataSelector_";
import DataSelectorInfo from "../../Common/DataSelectorInfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearchMinus } from "@fortawesome/free-solid-svg-icons";
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";
import * as d3 from "d3";



let _gMod = new GlobalMod();


export default function CustomDrillingSummary({ ...props }: any) {
  let objChart: Chart = new Chart(props.parentRef, "SummaryChart");
  const [dataSelector, setDataSeletor] = useState(props.objDataSelector);

  let objSummaryAxisList: any = [];
  let WellName: string = "";
  let objData: any = "";
  let topAxisCount: number = 0;

  useEffect(() => {

    window.addEventListener("resize", loadSummary);


    loadSummary();
  }, []);

  //Step-1
  const loadSummary = () => {
    try {

      //Axios call API Function with PlotID

      let objBrokerRequest = new BrokerRequest();

      //alert(props.objDataSelector.selectedval);

      objBrokerRequest.Module = "GenericDrillingSummary.Manager";
      objBrokerRequest.Broker = "GenericDrillingSummary";
      objBrokerRequest.Function = "generateGDSummary"; //"generateGDSummary";


      let objParameter = new BrokerParameter("wellID", props.WellID); // // "f3205325-4ddb-4996-b700-f04d6773a051"
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("PlotID", props.PlotID); //Hookload Comparison //"925-206-171-592-399"
      objBrokerRequest.Parameters.push(objParameter);
      objParameter = new BrokerParameter("UserID",_gMod._userId);
      //PRATH\PRATH
      //objParameter = new BrokerParameter("UserID", "PRATH\\PRATH");
      //alert("User Name Hard Coaded");

      objBrokerRequest.Parameters.push(objParameter);

      //props.objDataSelector
      ////Load DataSelector 
      objParameter = new BrokerParameter("SelectionType", props.objDataSelector.selectedval);

      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("FromDate", utilFunc.formateDate(props.objDataSelector.fromDateS));
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("ToDate", utilFunc.formateDate(props.objDataSelector.toDateS));
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("FromDepth", props.objDataSelector.fromDepth.toString());
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("ToDepth", props.objDataSelector.toDepth.toString());
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("SideTrackKey", "-999");
      objBrokerRequest.Parameters.push(objParameter);

      //objParameter = new BrokerParameter("isRealTime", props.objDataSelector.isRealTime.toString());
      objParameter = new BrokerParameter("isRealTime", "false");
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("refreshHrs", props.objDataSelector.refreshHrs.toString());
      objBrokerRequest.Parameters.push(objParameter);

      //gdSummary Plot ID: 308-656-954-204-796
      //Well ID:
      //User ID:
      axios
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

          if (res.data.RequestSuccessfull == true) {
            const objData_ = JSON.parse(res.data.Response);

            console.log(objData_);



            let warnings: string = res.data.Warnings;
            // warnings = "Test Warning";

            if (warnings.trim() != "") {
              let warningList = [];
              warningList.push({
                "update": warnings,
                "timestamp": new Date(Date.now()).getTime()
              });

              props.updateWarnings(warningList);

            }
            WellName = res.data.Category;
            objData = objData_;
            //generateReport(objData);
            generateReport();
            Util.StatusSuccess("Data successfully retrived");
            Util.StatusReady();
          } else {
            // alert(res.data.Errors);
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
  const initializeChart = () => {
    try {

      objChart = new Chart(props.parentRef, "chart1");
      objChart.ContainerId = "SummaryChart";

      objChart.onAfterSeriesDraw.subscribe((e, i) => {
        onAfterSeriesDraw(e, i);
      });

      objChart.DataSeries.clear();
      objChart.Axes.clear();
      objChart.createDefaultAxes();
      objChart.updateChart();

      objChart.leftAxis().AutoScale = true;

      objChart.leftAxis().Inverted = false;
      objChart.leftAxis().ShowLabels = true;
      objChart.leftAxis().ShowTitle = false;
      objChart.leftAxis().Title = "";
      objChart.leftAxis().Visible = true;

      objChart.bottomAxis().AutoScale = true;
      objChart.bottomAxis().IsDateTime = false;
      objChart.bottomAxis().bandScale = false; //wip
      objChart.bottomAxis().Title = "Depth / Date Time";
      objChart.bottomAxis().ShowLabels = true;
      objChart.bottomAxis().ShowTitle = false;
      objChart.bottomAxis().LabelAngel = 90;
      objChart.bottomAxis().ShowSelector = false;
      objChart.bottomAxis().Visible = true;

      objChart.rightAxis().Visible = false;
      objChart.rightAxis().ShowLabels = false;


      // objChart.MarginLeft = 10;
      // objChart.MarginBottom = 10;
      // objChart.MarginTop = 0;
      // objChart.MarginRight = 100;

      objChart.initialize();

      objChart.reDraw();

    } catch (error) {

    }
  }

  const getOrdersAxisListByPosition = (paramAxisPosition: number) => {

    let arrAxis: any = [];
    try {
      let list = [];
      for (let index = 0; index < objSummaryAxisList.length; index++) {
        const objAxis = objSummaryAxisList[index];

        if (objAxis.AxisPosition == paramAxisPosition) {
          list.push(objAxis);
        }

        // if (list.length > 0) {
        //   arrAxis = list.sort((a, b) => (a.DisplayOrder < b.DisplayOrder) ? -1 : 1);
        // }

      }
      if (list.length > 0) {
        arrAxis = list.sort((a, b) => (a.DisplayOrder < b.DisplayOrder) ? -1 : 1);
      }

      return arrAxis;

    } catch (error) {
      return arrAxis;
    }
  }


  const setAxisPerColumnAndRow = (axisList: any): number => {
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
        objChart.axisPerColumn = totalRighAxis;
      } else {
        objChart.axisPerColumn = totalLeftAxis;
      }


      if (totalBottomAxis >= totalTopAxis) {
        objChart.axisPerRow = totalBottomAxis
      } else {
        objChart.axisPerRow = totalTopAxis;
      }






    } catch (error) {
      return 1;
    }
  }

  const generateReport = () => {
    try {



      initializeChart();

      //Generate Plot using state objGDSummary object
      // console.log("objData", objData);
      if (objData.Axis != null || objData.Axis != undefined) {
        objSummaryAxisList = Object.values(objData.Axis);


        setAxisPerColumnAndRow(objSummaryAxisList);

        objChart.Axes.clear();
        objChart.DataSeries.clear();

        objChart.MarginLeft = 10;
        objChart.MarginBottom = 10;
        objChart.MarginTop = 20;
        objChart.MarginRight = 90;

        let axisList = Object.values(objData.Axis);
        axisList = getOrdersAxisListByPosition(0);//Left



        for (let index = 0; index < axisList.length; index++) {

          let objSummaryAxis: any = axisList[index];

          //Create Custom Left Axis 
          let objAxis = new Axis();
          //alert(objSummaryAxis.AxisTitle);
          //objAxis.CustomPosition = true;
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
          objChart.Axes.set(objAxis.Id, objAxis);
          //*************************************************** */
        }


        //// 0-left, 1-bottom, 2-right, 3-top
        axisList = getOrdersAxisListByPosition(2);//Right
        for (let index = 0; index < axisList.length; index++) {

          let objSummaryAxis: any = axisList[index];

          //Create Custom Left Axis 
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
          objChart.Axes.set(objAxis.Id, objAxis);
          //*************************************************** */

          //// 0-left, 1-bottom, 2-right, 3-top



        }

        //// 0-left, 1-bottom, 2-right, 3-top
        axisList = getOrdersAxisListByPosition(1);//bottom
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
          objChart.Axes.set(objAxis.Id, objAxis);
          //*************************************************** */

        }


        //// 0-left, 1-bottom, 2-right, 3-top
        axisList = getOrdersAxisListByPosition(3);//Top
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
          objChart.Axes.set(objAxis.Id, objAxis);
          //*************************************************** */
        }

        topAxisCount = axisList.length;


        //Load Series
        let SeriesList = Object.values(objData.dataSeries);







        for (let index = 0; index < SeriesList.length; index++) {



          const objDataSeries: any = SeriesList[index];

          let objSeries = new DataSeries();
          objSeries.Id = objDataSeries.SeriesID.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');// objDataSeries.SeriesID;
          objSeries.Name = objDataSeries.SeriesName;


          objSeries.XAxisId = objDataSeries.XColumnID.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');
          objSeries.YAxisId = objDataSeries.YColumnID.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');;

          objSeries.PointSize = objDataSeries.PointWidth;
          let SeriesType: dataSeriesType = dataSeriesType.Line;
          //////alert(objDataSeries.SeriesType);
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
              objSeries.showPointsOnLineSeries = objDataSeries.ShowPoints;
              objSeries.LineWidth = objDataSeries.LineWidth;
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


          if (objDataSeries.xDataBuffer != null || objDataSeries.xDataBuffer != undefined) {

            for (let i = 0; i < objDataSeries.xDataBuffer.length; i++) {

              let objVal: ChartData = new ChartData();

              if (objSeries.Type == dataSeriesType.Bar) {
                objVal.x = i + 1;

                let objBottomAxes = objChart.getAxisByID(objSeries.XAxisId);
                objBottomAxes.bandScale = true;
                objChart.Axes.get(objSeries.XAxisId).Labels.push(objDataSeries.labelBuffer[i]);
              } else {
                objVal.x = objDataSeries.xDataBuffer[i];
              }

              objVal.y = objDataSeries.yDataBuffer[i];

              objSeries.Data.push(objVal);

            }

            if (objDataSeries.ColorPointsAsColumn) {

              formatSeries(objSeries, objDataSeries); //Nishant
            }
            if (objDataSeries.Visible) {
              objChart.DataSeries.set(objSeries.Id, objSeries);
            }

          }
        }


        objChart.initialize();


        objChart.reDraw();

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
      // colorBuffer: (1749) ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', …]
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
      // xDataBuffer: (1749) [8007.15, 8007.45, 8007.6, 8007.9, 8008.05, 8008.25, 8008.35, 8008.5, 8008.65, 8008.85, 8009.067, 8009.3, 8009.433, 8009.667, 8009.94, 8010.25, 8010.35, 8010.65, 8010.75, 8010.9, 8011.067, 8011.25, 8011.45, 8011.65, 8011.85, 8012, 8012.3, 8012.6, 8012.8, 8012.867, 8013.033, 8013.333, 8013.533, 8013.7, 8013.967, 8014.18, 8014.4, 8014.4, 8014.55, 8014.7, 8015, 8015.133, 8015.467, 8015.567, 8015.8, 8016, 8016.175, 8016.4, 8016.6, 8016.8, 8017, 8017.1, 8017.2, 8017.5, 8017.733, 8017.933, 8018.22, 8018.4, 8018.333, 8018.5, 8018.8, 8019.067, 8019.233, 8019.45, 8019.6, 8019.75, 8019.95, 8020.2, 8020.45, 8020.6, 8020.85, 8021, 8021.25, 8021.45, 8021.55, 8021.8, 8021.95, 8022.2, 8022.45, 8022.65, 8022.85, 8023.133, 8023.45, 8023.65, 8023.85, 8024.05, 8024.25, 8024.45, 8024.65, 8024.85, 8025.2, 8025.45, 8025.65, 8025.9, 8026.05, 8026.25, 8026.55, 8026.75, 8026.95, 8027.15, …]
      // yDataBuffer: (1749) [0, 0, 0, 0, 13.545, 27.09, 27.09, 27.09, 27.09, 27.09, 28.797, 29.65, 29.65, 29.65, 28.238, 26.12, 26.12, 26.12, 26.12, 26.12, 28.58, 28.58, 28.58, 28.58, 28.58, 29.865, 31.15, 31.15, 31.15, 31.15, 29, 24.7, 24.7, 24.7, 25.79, 27.97, 27.97, 27.97, 27.97, 27.97, 27.97, 24.68, 24.68, 24.68, 24.68, 25.2, 25.46, 25.46, 25.46, 25.46, 26.585, 27.71, 27.71, 27.71, 27.71, 27.71, 24.87, 24.87, 16.58, 0, 0, 13.953, 20.93, 20.93, 20.93, 20.93, 25.06, 29.19, 29.19, 29.19, 29.19, 31.42, 33.65, 33.65, 33.65, 33.65, 34.23, 34.81, 34.81, 34.81, 34.81, 36.6, 36.6, 36.6, 36.6, 39.32, 39.32, 39.32, 39.32, 39.32, 37.993, 37.33, 37.33, 37.33, 40.28, 40.28, 40.28, 40.28, 40.28, 37.93, …]



    } catch (error) {
      //alert(error);
    }
  };


  const onselectionchange = async (paramDataSelector: DataSelector_, paramRefreshHrs: boolean = false) => {

    let realtimeStatus: boolean = false;// paramRefreshHrs;
    props.objDataSelector = paramDataSelector;
    paramDataSelector.needForceReload = true;
    await setDataSeletor(paramDataSelector);
    loadSummary();

    //paramDataSelector.needForceReload=true;



  }



  //Nishant to Plot Heat Map for Point Series
  const formatSeries = (paramSeries: DataSeries, paramDataSeries: any) => {
    try {

      if (paramDataSeries.ColorPointsAsColumn) {
        //alert(paramSeries.Name);
        paramSeries.ColorEach = true;

        for (let index = 0; index < paramDataSeries.colorBuffer.length; index++) {
          paramSeries.Data[index].color = paramDataSeries.colorBuffer[index]
        }

      }



    } catch (error) {

    }
  }
  //********************* */

  const onAfterSeriesDraw = (e: ChartEventArgs, i: number) => {

    //Formation Tops
    d3.selectAll(".formationTop-" + objChart.Id).remove();
    d3.selectAll(".formationTopText-" + objChart.Id).remove();

    let objFormationTops: any = Object.values(objData.allFormationTopsInfo);

    //Bottom axes
    let arrBottomAxes: Axis[] = Array.from(objChart.Axes.values()).filter(
      (x) => x.Position == axisPosition.bottom
    );


    if (objFormationTops.length > 0 && objData.ShowTops) {

      for (let index = 0; index < objFormationTops.length; index++) {
        const depth = objFormationTops[index].Depth;

        if (depth > arrBottomAxes[0].ScaleRef.domain()[1]) {
          break;
        }
        let x1 = arrBottomAxes[0].ScaleRef(depth);
        let x2 = x1;
        let y1 = objChart.__chartRect.top;
        let y2 = objChart.__chartRect.bottom;

        let formationTop = objChart.SVGRef.append("g")
          .attr("class", "formationTop-" + objChart.Id)
          .append("line")
          .attr("id", "line-1")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .style("fill", objFormationTops[index].TopColor)
          .style("stroke", objFormationTops[index].TopColor);

        objChart.SVGRef.append("g")
          .attr("class", "formationTopText-" + objChart.Id)
          .attr(
            "transform",
            "translate(" + (x1 + 2) + "," + (y2 - 20) + ") rotate(-90)"
          )
          .append('text')
          .style('background-color', 'green')
          .attr('class', 'axis-title')

          .attr('dy', '.75em')
          .text(objFormationTops[index].TopName);
      }
    }


    //
    //RoadMap


    d3.selectAll(".RoadMap").remove();
    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;



    //objCRMColor
    //RoadMapTransparency

    for (let key of objChart.DataSeries.keys()) {
      let objSeries: DataSeries = objChart.DataSeries.get(key);


      if (objSeries.ShowRoadMap) {

        // if (objSeries.RoadmapDepth.length > 0) {
        //   let TransPercent = 65;
        //   let actualTransParency = 255 - (TransPercent * 2.55);
        //   let highlightColor = objSeries.RoadMapColor;
        // }

        let x0 = 0;
        let x1 = 0;
        let y0 = 0;
        let y1 = 0;

        let currentDepth = 0;
        let prevDepth = 0;

        if (objData.PlotOrientation == 0) {//horizontal

          for (let i = 0; i < objSeries.RoadmapDepth.length; i++) {
            if (i > 0) {
              currentDepth = objSeries.RoadmapDepth[i];
              prevDepth = objSeries.RoadmapDepth[i - 1];
            } else {

              currentDepth = objSeries.RoadmapDepth[i];
              prevDepth = 0
            }

            let mnemonicY = objSeries.YAxisId;
            let objYAxis: Axis = objChart.getAxisByID(mnemonicY);

            let mnemonicX = objSeries.XAxisId;
            let objXAxis = objChart.getAxisByID(mnemonicX);

            if (objXAxis.Inverted) {
              x1 = objXAxis.ScaleRef(prevDepth);
              x0 = objXAxis.ScaleRef(currentDepth);
            } else {
              x1 = objXAxis.ScaleRef(currentDepth);
              x0 = objXAxis.ScaleRef(prevDepth);
            }


            if (x0 > objChart.__chartRect.right) {
              x0 = objChart.__chartRect.right;
            }

            if (x0 < objChart.__chartRect.left) {
              x0 = objChart.__chartRect.left;
            }


            if (x1 > objChart.__chartRect.right) {
              x1 = objChart.__chartRect.right;
            }


            if (x1 < objChart.__chartRect.left) {
              x1 = objChart.__chartRect.left;
            }


            // yaxies cordinate from top to bottom (top means 0 & bottom is max)

            if (objYAxis.Inverted) {
              y1 = objYAxis.ScaleRef(objSeries.RoadmapMax[i]);
              y0 = objYAxis.ScaleRef(objSeries.RoadmapMin[i]);

            } else {//tested on false case
              y1 = objYAxis.ScaleRef(objSeries.RoadmapMin[i]);
              y0 = objYAxis.ScaleRef(objSeries.RoadmapMax[i]);
            }


            if (y0 > objChart.__chartRect.bottom) {
              y0 = objChart.__chartRect.bottom;
            }

            if (y0 < objChart.__chartRect.top) {
              y0 = objChart.__chartRect.top;
            }

            if (y1 > objChart.__chartRect.bottom) {
              y1 = objChart.__chartRect.bottom;
            }

            if (y1 < objChart.__chartRect.top) {
              y1 = objChart.__chartRect.top;
            }



            objChart.SVGRect.append("g")
              .attr("class", "RoadMapId-" + mnemonicY)
              .attr("id", "RoadMapId-" + mnemonicY)
              .append("rect")
              .attr("x", x0)
              .attr("y", y0)
              .attr("width", (x1 - x0))
              .attr("height", (y1 - y0))
              .style("border", "0px solid black")
              .style("stroke-width", "20px solid black")
              .style("fill", objSeries.RMColor)  //
              .style("opacity", objSeries.RoadMapTransparency / 100);



          }
        } else {
          //Vertical Plot (Untested)

          for (let i = 0; i < objSeries.RoadmapDepth.length; i++) {
            if (i > 0) {
              currentDepth = objSeries.RoadmapDepth[i];
              prevDepth = objSeries.RoadmapDepth[i - 1];
            } else {

              currentDepth = objSeries.RoadmapDepth[i];
              prevDepth = 0
            }

            let mnemonicY = objSeries.YAxisId;
            let objYAxis: Axis = objChart.getAxisByID(mnemonicY);

            let mnemonicX = objSeries.XAxisId;
            let objXAxis = objChart.getAxisByID(mnemonicX);


            if (objYAxis.Inverted) {
              y1 = objXAxis.ScaleRef(prevDepth);
              y0 = objXAxis.ScaleRef(currentDepth);
            } else {
              y1 = objXAxis.ScaleRef(currentDepth);
              y0 = objXAxis.ScaleRef(prevDepth);
            }

            //     If y0 > objChartSeries.CustomVertAxis.IEndPos Then
            //     y0 = objChartSeries.CustomVertAxis.IEndPos
            // End If


            if (y0 > objChart.__chartRect.bottom) {
              y0 = objChart.__chartRect.bottom;
            }

            if (y0 < objChart.__chartRect.top) {
              y0 = objChart.__chartRect.top;
            }


            if (y1 > objChart.__chartRect.bottom) {
              y1 = objChart.__chartRect.bottom;
            }


            if (y1 < objChart.__chartRect.top) {
              y1 = objChart.__chartRect.top;
            }


            // Xaxies cordinate from left to right (top means 0 & bottom is max)

            if (objXAxis.Inverted) {
              x1 = objXAxis.ScaleRef(objSeries.RoadmapMax[i]);
              x0 = objXAxis.ScaleRef(objSeries.RoadmapMin[i]);

            } else {//tested on false case
              x1 = objXAxis.ScaleRef(objSeries.RoadmapMin[i]);
              x0 = objXAxis.ScaleRef(objSeries.RoadmapMax[i]);
            }


            if (x0 > objChart.__chartRect.right) {
              x0 = objChart.__chartRect.right;
            }

            if (x0 < objChart.__chartRect.left) {
              x0 = objChart.__chartRect.left;
            }

            if (x1 > objChart.__chartRect.right) {
              x1 = objChart.__chartRect.right;
            }

            if (x1 < objChart.__chartRect.left) {
              x1 = objChart.__chartRect.left;
            }



            //Need to verify ??
            objChart.SVGRect.append("g")
              .attr("class", "RoadMap")
              .attr("id", "RoadMapId-" + mnemonicX)
              .append("rect")
              .attr("x", x0)
              .attr("y", y0)
              .attr("width", (x1 - x0))
              .attr("height", (y1 - y0))
              .style("border", "0px solid black")
              .style("stroke-width", "20px solid black")
              .style("fill", objSeries.RMColor) // objSeries.RoadMapColor)  //
              .style("opacity", objSeries.RoadMapTransparency / 100);
          }
          //=====

        }

      }

    }

    //





    //Heat Map logic



    d3.selectAll(".HeatMap").remove();
    d3.selectAll(".ColorAxisLineText").remove();

    if (objData.ShowColorAxis == false) {
      return;
    }



    let Intervals: number = 10;
    let x1_: number = objChart.Width - 80;
    let x2_: number = (x1_ + 10);
    // let y1_: number = ((topAxisCount * 35) + objChart.MarginTop);
    // let y2_: number = (objChart.Height - objChart.MarginBottom);

    let y1_: number = objChart.__chartRect.top + 5;
    let y2_: number = objChart.__chartRect.bottom - 5;
    // let y2_: number = (objChart.Height - objChart.MarginBottom);
    let TotalHeight: number = (y2_ - y1_) - 10;
    let SectionHeight: number = (TotalHeight / Intervals);
    let rStartY: number = y1_;

    for (let j = Intervals; j > 0; j--) {
      try {

        objChart.SVGRef.append("g")
          .append('rect')
          .attr("class", "HeatMap") //custom axis title from base color  01-10-2020
          .attr('x', x1_)
          .attr('y', rStartY)
          .attr('width', (x2_ - x1_))
          .attr('height', SectionHeight)
          .attr('stroke', 'black')
          .attr('fill', objData.IntervalColors[j]);


        let val = (objData.IntervalList[j].maxValue).toFixed(0);



        objChart.SVGRef.append("g").append("text")
          .attr("x", x2_ + 2)
          .attr("y", rStartY + 2)
          .attr("class", "title")
          // .attr("font-size", "10pt")
          // .attr("fill", "red")
          //.style("text-anchor", "middle")
          .text(val);



        if (j == 1) {
          objChart.SVGRef.append("g").append("text")
            .attr("x", x2_ + 2)
            .attr("y", (rStartY + SectionHeight))
            .attr("class", "title")
            // .attr("font-size", "10pt")
            // .attr("fill", "red")
            //.style("text-anchor", "middle")
            .text((objData.IntervalList[j].minValue).toFixed(0));
        }



        rStartY = (rStartY + SectionHeight);
      } catch (error) {

      }



    }



    //******************** */





  };

  return (
    <div>

      <div className="" style={{ display: "inline-flex", justifyContent: "space-between", width: "92vw", }}>
        <div className="flex-item" >
          <label>{props.PlotName} </label>
        </div>


        <div className="flex-item">
          <DataSelectorInfo objDataSelector={dataSelector} isRealTime={false} />
        </div>

        <div>
          <label className=" ml-5 mr-1" onClick={() => { generateReport(); }} style={{ cursor: "pointer" }}>Undo Zoom</label>
          <FontAwesomeIcon icon={faSearchMinus} size="lg" onClick={() => { generateReport() }} />
        </div>

        <div className="flex-item">
          <Button onClick={props.showListPanel}>Close</Button>
        </div>
      </div>

      <div
        id="SummaryChart"
        style={{
          width: "100%",
          height: "calc(65vh)",
          backgroundColor: "transparent",
          // float: "right",
          marginLeft: "10px",
        }}
      ></div>
      <div
        id="SummaryChart_legend"
        style={{
          textAlign: "center",
          height: "40px",
          width: "100%",
          backgroundColor: "transparent",
          display: "inline-block",
        }}
      />
      <div className="Data">
        <DataSelector objDataSelector={props.objDataSelector} wellID={props.WellID} selectionChanged={onselectionchange} ></DataSelector>
      </div>
    </div>
  );

}