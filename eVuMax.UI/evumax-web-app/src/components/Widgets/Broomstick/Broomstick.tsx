import React, { Component } from "react";
import axios from "axios";
import { Chart } from "../../../eVuMaxObjects/Chart/Chart";
import {
  DataSeries,
  dataSeriesType,
  pointStyle,
} from "../../../eVuMaxObjects/Chart/DataSeries";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import ProcessLoader from "../../loader/loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import "./Broomstick.css";
import GlobalMod from "../../../objects/global";
import { DropDownList } from "@progress/kendo-react-dropdowns";

import { Util } from "../../../Models/eVuMax";
let _gMod = new GlobalMod();

class Broomstick extends Component {
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;
  }

  state = {
    WellName: "",
    objBroomstickData: {} as any,
    isProcess: false,
    RunNo: ''
  };

  WellId: string = "";
  objChart_Broomstick: Chart;

  selectionType: string = "-1"; //"-1 Default,0= DateRange and 1 = Depth Range"
  fromDepth: number = 0;
  toDepth: number = 0;

  runlist = [];

  selRunNo = '';

  runChanged = (item: any) => {
    //Do refresh


    this.selRunNo = item.target.value;

    this.loadConnections();


  };


  componentDidMount() {
    try {
      this.initilizeCharts();
      this.loadConnections();
      window.addEventListener("resize", this.refreshChart);
    } catch (error) { }
  }

  loadConnections = () => {
    try {
      Util.StatusInfo("Getting data from the server  ");
      // this.setState({
      //   isProcess: true,
      // });
      // this.forceUpdate();

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Broomstick.Manager"; //MOD_Broomstick_manager
      objBrokerRequest.Broker = "DataManager"; //BS_DataManager
      objBrokerRequest.Function = "BroomstickDocData";

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


      debugger
      let paramRunNo: BrokerParameter = new BrokerParameter(
        "RunNo",
        this.selRunNo
      );
      objBrokerRequest.Parameters.push(paramRunNo);



      let paramSelectionType: BrokerParameter = new BrokerParameter(
        "SelectionType",
        this.selectionType
      );
      objBrokerRequest.Parameters.push(paramSelectionType);

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

          let objData = JSON.parse(res.data.Response);

          this.runlist = objData.RunList;

          this.selRunNo = objData.RunNo;


          this.setState({
            objBroomstickData: objData,
            RunNo: objData.RunNo,
            // isProcess: false,
          });


          if (
            objData.PickupPoints.length === 0 &&
            objData.PickupPoints.length === 0
          ) {
            Util.StatusSuccess("Data not available  ");
          } else {
            Util.StatusSuccess("Data successfully retrived  ");
          }

          Util.StatusReady();

          document.title = this.state.objBroomstickData.WellName + " -Broomstick Plot"; //Nishant 03/09/2021
        })
        .catch((error) => {
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
  initilizeCharts = () => {
    this.objChart_Broomstick = new Chart(this, "Broom_Stick");

    this.objChart_Broomstick.ContainerId = "Broomstick";
    this.objChart_Broomstick.Title = "";
    this.objChart_Broomstick.leftAxis().AutoScale = true;
    this.objChart_Broomstick.leftAxis().Min = 0;
    this.objChart_Broomstick.leftAxis().Max = 100;
    this.objChart_Broomstick.leftAxis().Inverted = true;
    this.objChart_Broomstick.leftAxis().ShowLabels = true;
    this.objChart_Broomstick.leftAxis().ShowTitle = true;
    this.objChart_Broomstick.leftAxis().Title =
      "Depth" + " (" + this.state.objBroomstickData.depthUnit + ")"; //???? Unit
    this.objChart_Broomstick.leftAxis().DisplayOrder = 1;
    this.objChart_Broomstick.leftAxis().Visible = true;
    this.objChart_Broomstick.leftAxis().PaddingMin = 10;
    this.objChart_Broomstick.leftAxis().PaddingMax = 15;

    this.objChart_Broomstick.bottomAxis().AutoScale = true;
    this.objChart_Broomstick.bottomAxis().bandScale = false;
    this.objChart_Broomstick.bottomAxis().Min = 100;
    this.objChart_Broomstick.bottomAxis().Max = 200;
    this.objChart_Broomstick.bottomAxis().Title =
      "Hookload" + " (" + this.state.objBroomstickData.hkldUnit + ")"; //???? Unit
    this.objChart_Broomstick.bottomAxis().ShowLabels = true;
    this.objChart_Broomstick.bottomAxis().ShowTitle = true;
    this.objChart_Broomstick.bottomAxis().LabelAngel = 10;
    this.objChart_Broomstick.bottomAxis().ShowSelector = false;
    this.objChart_Broomstick.bottomAxis().IsDateTime = false;
    this.objChart_Broomstick.bottomAxis().Visible = true;

    this.objChart_Broomstick.rightAxis().Visible = false;

    this.objChart_Broomstick.MarginLeft = 10;
    this.objChart_Broomstick.MarginBottom = 70;
    this.objChart_Broomstick.MarginTop = 10;
    this.objChart_Broomstick.MarginRight = 10;

    this.objChart_Broomstick.initialize();

    this.objChart_Broomstick.reDraw();
    // this.objChart_Broomstick.onBeforeSeriesDraw.subscribe((e, i) => {
    //     this.onBeforeDrawSeries(e, i);
    //   });
  };



  componentDidUpdate() {
    try {

      //Set run no.




      this.refreshChart();
    } catch (error) { }
  }

  refreshChart = () => {
    try {
      this.objChart_Broomstick.initialize();

      this.objChart_Broomstick.LegendPosition = 2; // 1 (left), 2 (right), 3 (top), 4 (bottom)
      //Clear all the series
      this.objChart_Broomstick.DataSeries.clear();
      this.objChart_Broomstick.updateChart();

      this.objChart_Broomstick.leftAxis().AutoScale = true;
      this.objChart_Broomstick.leftAxis().Min = 0;
      this.objChart_Broomstick.leftAxis().Max = 100;
      this.objChart_Broomstick.leftAxis().Inverted = true;
      this.objChart_Broomstick.leftAxis().ShowLabels = true;
      this.objChart_Broomstick.leftAxis().ShowTitle = true;

      this.objChart_Broomstick.leftAxis().DisplayOrder = 1;
      this.objChart_Broomstick.leftAxis().Visible = true;
      this.objChart_Broomstick.leftAxis().PaddingMin = 2;
      this.objChart_Broomstick.leftAxis().PaddingMax = 10;
      this.objChart_Broomstick.leftAxis().Title =
        "Depth" + " (" + this.state.objBroomstickData.depthUnit + ")"; //???? Unit

      this.objChart_Broomstick.bottomAxis().AutoScale = true;
      this.objChart_Broomstick.bottomAxis().bandScale = false;
      this.objChart_Broomstick.bottomAxis().Min = 100;
      this.objChart_Broomstick.bottomAxis().Max = 200;

      this.objChart_Broomstick.bottomAxis().ShowLabels = true;
      this.objChart_Broomstick.bottomAxis().ShowTitle = true;
      this.objChart_Broomstick.bottomAxis().LabelAngel = 90;
      this.objChart_Broomstick.bottomAxis().ShowSelector = false;
      this.objChart_Broomstick.bottomAxis().IsDateTime = false;
      this.objChart_Broomstick.bottomAxis().Visible = true;
      this.objChart_Broomstick.bottomAxis().PaddingMax = 10;
      this.objChart_Broomstick.bottomAxis().Title =
        "Hookload" + " (" + this.state.objBroomstickData.hkldUnit + ")"; //???? Unit
      //====================  Pickup ===========================
      let objSeries = new DataSeries();
      objSeries.Id = "PickupPoints";
      objSeries.Name = "Pickup Points";
      objSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
      objSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
      objSeries.Type = dataSeriesType.Point;
      objSeries.PointStyle = pointStyle.Circle;
      objSeries.PointSize = 5;
      objSeries.Title = "Pickup";

      objSeries.Color = "#FF5252"; //"blue"; //this.getRigStateColor(0); //"#1762ad";
      objSeries.ShowInLegend = true;

      this.objChart_Broomstick.DataSeries.set(objSeries.Id, objSeries);

      //Populate the data series with this data
      //objSeries.Data.slice(0, objSeries.Data.length);

      for (
        let i = 0;
        i < this.state.objBroomstickData.PickupPoints.length;
        i++
      ) {
        let objVal: ChartData = new ChartData();
        objVal.x = this.state.objBroomstickData.PickupPoints[i].Value;
        objVal.y = this.state.objBroomstickData.PickupPoints[i].Depth;
        objSeries.Data.push(objVal);
      }

      //=================== Rotate Points ======================================
      objSeries = new DataSeries();
      objSeries.Id = "RotatePoints";
      objSeries.Name = "Rotate Points";
      objSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
      objSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
      objSeries.Type = dataSeriesType.Point;
      objSeries.PointStyle = pointStyle.Circle;
      objSeries.PointSize = 5;
      objSeries.Title = "Rotate";

      objSeries.Color = "#FFAB40"; //"black"; //this.getRigStateColor(0); //"#1762ad";
      objSeries.ShowInLegend = true;

      this.objChart_Broomstick.DataSeries.set(objSeries.Id, objSeries);

      //Populate the data series with this data
      //objSeries.Data.slice(0, objSeries.Data.length);

      for (
        let i = 0;
        i < this.state.objBroomstickData.RotatePoints.length;
        i++
      ) {
        let objVal: ChartData = new ChartData();
        objVal.x = this.state.objBroomstickData.RotatePoints[i].Value;
        objVal.y = this.state.objBroomstickData.RotatePoints[i].Depth;
        objSeries.Data.push(objVal);
      }

      //====== SlackOff Points =========================================================
      objSeries = new DataSeries();
      objSeries.Id = "SlackOffPoints";
      objSeries.Name = "SlackOffPoints";
      objSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
      objSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
      objSeries.Type = dataSeriesType.Point;
      objSeries.PointStyle = pointStyle.Circle;
      objSeries.PointSize = 5;
      objSeries.Title = "SlackOff";

      objSeries.Color = "#00E676"; //"green";  //this.getRigStateColor(0); //"#1762ad";
      objSeries.ShowInLegend = true;

      this.objChart_Broomstick.DataSeries.set(objSeries.Id, objSeries);

      //Populate the data series with this data

      //objSeries.Data.slice(0, objSeries.Data.length);

      for (
        let i = 0;
        i < this.state.objBroomstickData.SlackOffPoints.length;
        i++
      ) {
        let objVal: ChartData = new ChartData();
        objVal.x = this.state.objBroomstickData.SlackOffPoints[i].Value;
        objVal.y = this.state.objBroomstickData.SlackOffPoints[i].Depth;
        objSeries.Data.push(objVal);
      }

      //HkldPlanData

      let objData;
      for (
        let i = 0;
        i < this.state.objBroomstickData.HkldPlanData.length;
        i++
      ) {
        //alert(i);
        objData = this.state.objBroomstickData.HkldPlanData[i];
        objSeries = new DataSeries();
        objSeries.Id = i.toString(); // objData.PlanID;

        switch (objData.PlanType) {
          case "PKUP":
            objSeries.Title = objData.PlanName + " Pickup";
            break;
          case "SLOF":
            objSeries.Title = objData.PlanName + " Slack Off";
            break;
          case "ROT":
            objSeries.Title = objData.PlanName + " Sinusoidal While Rotating";
            break;
          default:
            break;
        }
        //objSeries.Title = objData.PlanName;
        objSeries.Type = dataSeriesType.Line;
        objSeries.Color = objData.PlanColor;
        //objSeries.Color = "#6F6FFF";
        console.log(objData.PlanName, objSeries.Color);
        objSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
        objSeries.LineWidth = 1;
        this.objChart_Broomstick.DataSeries.set(objSeries.Id, objSeries);
        //alert(objSeries.Id);
        //alert(this.objChart_Broomstick.DataSeries.size);

        //load data
        for (let j = 0; j < objData.PlanData.length; j++) {
          let objVal: ChartData = new ChartData();
          objVal.x = objData.PlanData[j].Value;
          objVal.y = objData.PlanData[j].Depth;
          objSeries.Data.push(objVal);
        }
      }

      //OffBottomTorquePoints
      for (
        let i = 0;
        i < this.state.objBroomstickData.OffBottomTorquePoints.length;
        i++
      ) {
        objData = this.state.objBroomstickData.OffBottomTorquePoints[i];
        objSeries = new DataSeries();
        objSeries.Id = objData.PlanID;
        objSeries.Title = objData.PlanName;
        objSeries.Type = dataSeriesType.Line;
        objSeries.Color = objData.PlanColor;
        objSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
        objSeries.LineWidth = 3;
        this.objChart_Broomstick.DataSeries.set(objSeries.Id, objSeries);

        //load data
        for (let j = 0; j < objData.PlanData.length; j++) {
          let objVal: ChartData = new ChartData();
          objVal.x = objData.PlanData[j].Value;
          objVal.y = objData.PlanData[j].Depth;
          objSeries.Data.push(objVal);
        }
      }

      //OnBottomTorquePoints
      for (
        let i = 0;
        i < this.state.objBroomstickData.OnBottomTorquePoints.length;
        i++
      ) {
        objData = this.state.objBroomstickData.OnBottomTorquePoints[i];
        objSeries = new DataSeries();
        objSeries.Id = objData.PlanID;
        objSeries.Title = objData.PlanName;
        objSeries.Type = dataSeriesType.Line;
        objSeries.Color = objData.PlanColor;

        objSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
        objSeries.LineWidth = 3;
        this.objChart_Broomstick.DataSeries.set(objSeries.Id, objSeries);

        //load data
        for (let j = 0; j < objData.PlanData.length; j++) {
          let objVal: ChartData = new ChartData();
          objVal.x = objData.PlanData[j].Value;
          objVal.y = objData.PlanData[j].Depth;
          objSeries.Data.push(objVal);
        }
      }
      //TorquePlanData
      for (
        let i = 0;
        i < this.state.objBroomstickData.TorquePlanData.length;
        i++
      ) {
        objData = this.state.objBroomstickData.TorquePlanData[i];
        objSeries = new DataSeries();
        objSeries.Id = objData.PlanID;
        objSeries.Title = objData.PlanName;
        objSeries.Type = dataSeriesType.Line;
        objSeries.Color = objData.PlanColor;
        objSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
        objSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
        objSeries.LineWidth = 3;
        this.objChart_Broomstick.DataSeries.set(objSeries.Id, objSeries);

        //load data
        for (let j = 0; j < objData.PlanData.length; j++) {
          let objVal: ChartData = new ChartData();
          objVal.x = objData.PlanData[j].Value;
          objVal.y = objData.PlanData[j].Depth;
          objSeries.Data.push(objVal);
        }
      }

      this.objChart_Broomstick.drawLegend();

      this.objChart_Broomstick.reDraw();
    } catch (error) { }
  };
  render() {
    let loader = this.state;
    return (
      <div>
        <div className="row">
          <div className="col-lg-2 mb-3">
            <h6>Broomstick Hookload Document</h6>

            {loader.isProcess ? <ProcessLoader /> : ""}
          </div>
          <div className="col-lg-10">
            <div className="float-right mr-2">
              <FontAwesomeIcon
                icon={faUndo}
                onClick={() => {
                  this.forceUpdate();
                }}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <label
            style={{ paddingLeft: "20px", paddingRight: "15px" }}
          >Run No.</label>


          <DropDownList
            style={{ width: "200px" }}
            onChange={(e) =>
              this.runChanged(e)
            }
            value={this.state.RunNo}

            data={this.runlist}
          />

        </div>
        <div className="clearfix"></div>

        <div className="row">
          <div className="col-xl-10 col-lg-9 col-md-7 col-sm-7">
            {/* <div style={{ width: "70%" }}> */}
            <div
              id="Broomstick"
              style={{
                height: "calc(100vh - 150px)",
                //width: "calc(70vw)",
                width: "auto",
                backgroundColor: "transparent",
                marginLeft: "10px",
              }}
            ></div>
          </div>

          <div className="col-xl-2 col-lg-3 col-md-5 col-sm-5">
            {/* <div style={{ width: "18%" }}> */}
            <div
              id="Broomstick_legend"
              style={{
                textAlign: "left",
                height: "auto",
                alignItems: "left",
                width: "300px",
                backgroundColor: "transparent",
                display: "block",
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
}

export default Broomstick;
