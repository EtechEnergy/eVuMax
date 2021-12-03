import React, { useEffect } from "react";
import axios from "axios";
import { BrokerParameter, BrokerRequest, Util } from "../../../Models/eVuMax";
import GlobalMod from "../../../objects/global";
import { Button } from "@progress/kendo-react-buttons";
import { Chart } from "../../../eVuMaxObjects/Chart/Chart";



let _gMod = new GlobalMod();

//props: PlotID, function-ShowPlotListAgain
export default function CustomDrillingSummary({ ...props }: any) {
  let objChart: Chart = new Chart(this, "chart");
  useEffect(() => {
    loadSummary();
  }, []);

  //Step-1
  const loadSummary = () => {
    try {

      //Axios call API Function with PlotID

      let objBrokerRequest = new BrokerRequest();

      objBrokerRequest.Module = "GenericDrillingSummary.Manager";
      objBrokerRequest.Broker = "GenericDrillingSummary";
      objBrokerRequest.Function = "generateGDSummary"; //"generateGDSummary";


      let objParameter = new BrokerParameter("wellID", props.WellID); // // "f3205325-4ddb-4996-b700-f04d6773a051"
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("PlotID", props.PlotID); //Hookload Comparison //"925-206-171-592-399"
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("UserID", "NIS-PC\\ETECH-NIS");
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
            const objData = JSON.parse(res.data.Response);
            let warnings: string = res.data.Warnings;
            warnings = "Test Warning";

            if (warnings.trim() != "") {
              let warningList = [];
              warningList.push({
                "update": warnings,
                "timestamp": new Date(Date.now()).getTime()
              });

              props.updateWarnings(warningList);

            }
            generateReport(objData);
            Util.StatusSuccess("Data successfully retrived");
            Util.StatusReady();
          } else {
            alert(res.data.Errors);
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

      objChart = new Chart(props.parentRef, "chart");
      objChart.ContainerId = "chart";

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

      objChart.MarginLeft = 10;
      objChart.MarginBottom = 0;
      objChart.MarginTop = 0;
      objChart.MarginRight = 10;

      objChart.initialize();
      objChart.reDraw();

    } catch (error) {

    }
  }
  const generateReport = (objData: any) => {
    try {
      initializeChart();
      //Generate Plot using state objGDSummary object

      if (objData.Axis != null || objData.Axis != undefined) {
        let axisList = Object.values(objData.Axis);
        for (let index = 0; index < axisList.length; index++) {
          const objSummaryAxis: any = axisList[index];

          //Create Axis 
          //// 0-left, 1-bottom, 2-right, 3-top
          if (objSummaryAxis.AxisPosition == 1) {
            objChart.bottomAxis().AutoScale = objSummaryAxis.Automatic;;
            objChart.bottomAxis().IsDateTime = false;
            objChart.bottomAxis().bandScale = false; //wip
            objChart.bottomAxis().Title = objSummaryAxis.AxisTitle;
            objChart.bottomAxis().ShowLabels = true;
            objChart.bottomAxis().ShowTitle = false;
            objChart.bottomAxis().EndPos = objSummaryAxis.EndPosition;
            objChart.bottomAxis().StartPos = objSummaryAxis.StartPosition;
            objChart.bottomAxis().GridVisible = objSummaryAxis.ShowGrid;
            objChart.bottomAxis().LabelFont = objSummaryAxis.FontName;
            objChart.bottomAxis().LabelFontBold = objSummaryAxis.FontBold;
            objChart.bottomAxis().LabelFontColor = objSummaryAxis.FontColor;
            objChart.bottomAxis().LabelFontSize = objSummaryAxis.FontSize;
            objChart.bottomAxis().LabelFontItalic = objSummaryAxis.FontItalic;
            objChart.bottomAxis().Min = objSummaryAxis.MinValue;
            objChart.bottomAxis().Max = objSummaryAxis.MaxValue;


            if (objSummaryAxis.Orientation == 0) { //// 0-Horizontal, 1-Vertical
              objChart.bottomAxis().LabelAngel = 0;
            } else {
              objChart.bottomAxis().LabelAngel = 90;
            }

            objChart.bottomAxis().ShowSelector = false;
            objChart.bottomAxis().Visible = true;
            objChart.bottomAxis().Inverted = objSummaryAxis.Inverted;

          }
          if (objSummaryAxis.AxisPosition == 0) { //Left Axis
            objChart.leftAxis().AutoScale = objSummaryAxis.Automatic;;
            objChart.leftAxis().IsDateTime = false;
            objChart.leftAxis().bandScale = false; //wip
            objChart.leftAxis().Title = objSummaryAxis.AxisTitle;
            objChart.leftAxis().ShowLabels = true;
            objChart.leftAxis().ShowTitle = false;
            objChart.leftAxis().EndPos = objSummaryAxis.EndPosition;
            objChart.leftAxis().StartPos = objSummaryAxis.StartPosition;
            objChart.leftAxis().GridVisible = objSummaryAxis.ShowGrid;
            objChart.leftAxis().LabelFont = objSummaryAxis.FontName;
            objChart.leftAxis().LabelFontBold = objSummaryAxis.FontBold;
            objChart.leftAxis().LabelFontColor = objSummaryAxis.FontColor;
            objChart.leftAxis().LabelFontSize = objSummaryAxis.FontSize;
            objChart.leftAxis().LabelFontItalic = objSummaryAxis.FontItalic;
            objChart.leftAxis().Min = objSummaryAxis.MinValue;
            objChart.leftAxis().Max = objSummaryAxis.MaxValue;


            if (objSummaryAxis.Orientation == 0) { //// 0-Horizontal, 1-Vertical
              objChart.leftAxis().LabelAngel = 0;
            } else {
              objChart.leftAxis().LabelAngel = 90;
            }

            objChart.leftAxis().ShowSelector = false;
            objChart.leftAxis().Visible = true;
            objChart.leftAxis().Inverted = objSummaryAxis.Inverted;
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



    } catch (error) { }
  };

  return (
    <div>
      <div className="" style={{ display: "inline-flex", justifyContent: "space-between", width: "92vw", }}>
        <div className="flex-item" >
          <label>{props.PlotName} </label>
        </div>
        <div className="flex-item">
          <Button onClick={props.showListPanel}>Close</Button>
        </div>
      </div>

      <div
        id="chart"
        style={{
          width: "100%",
          height: "calc(70vh)",
          backgroundColor: "red",
          // float: "right",
          marginLeft: "10px",
        }}
      ></div>
      <div
        id="chart_legend"
        style={{
          textAlign: "center",
          height: "40px",
          width: "100%",
          backgroundColor: "transparent",
          display: "inline-block",
        }}
      />
    </div>
  );

}