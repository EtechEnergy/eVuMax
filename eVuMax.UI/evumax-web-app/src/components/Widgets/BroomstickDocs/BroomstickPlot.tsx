import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faUndo } from "@fortawesome/free-solid-svg-icons";
import { Button, DropDownList } from "@progress/kendo-react-all";

import { Window } from "@progress/kendo-react-dialogs";
import { BroomstickSetup } from "./BroomstickSetup";
import { comboData } from "../../../eVuMaxObjects/UIObjects/comboData";
import BrokerParameter from "../../../broker/BrokerParameter";
import BrokerRequest from "../../../broker/BrokerRequest";
import GlobalMod from "../../../objects/global";
import { Util } from "../../../Models/eVuMax";
import axios from "axios";
import { bmStaticMethod, BroomStickSetup_, pointPlotMethod } from "./BroomStickSetup_";
import { Chart, lineStyle } from "../../../eVuMaxObjects/Chart/Chart";
import { DataSeries, dataSeriesType, pointStyle } from "../../../eVuMaxObjects/Chart/DataSeries";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";
import { confirmAlert } from "react-confirm-alert";
import { BroomStickDocsUserSetting } from "./BroomstickDocUserSetting";
import { intToColor } from "../../../utilFunctions/utilFunctions";

let _gMod = new GlobalMod();

export default class BroomstickPlot extends Component {
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;
  }
  objChart_Broomstick: Chart;

  cmbRunList: comboData[] = [];

  async componentDidMount() {
    try {
      this.initilizeCharts();
      //let Planlist: comboData[] = [];



    } catch (error) { }
  }

  initilizeCharts = () => {
    this.objChart_Broomstick = new Chart(this, "BroomStickDoc");

    this.objChart_Broomstick.ContainerId = "BroomStickChart";
    this.objChart_Broomstick.Title = "";
    this.objChart_Broomstick.leftAxis().AutoScale = true;
    this.objChart_Broomstick.leftAxis().Min = 0;
    this.objChart_Broomstick.leftAxis().Max = 100;
    this.objChart_Broomstick.leftAxis().Inverted = true;
    this.objChart_Broomstick.leftAxis().ShowLabels = true;
    this.objChart_Broomstick.leftAxis().ShowTitle = true;


    this.objChart_Broomstick.leftAxis().Title = "Depth";// + " (" + this.state.objBrookstickDoc.depthUnit + ")"; 

    this.objChart_Broomstick.leftAxis().DisplayOrder = 1;
    this.objChart_Broomstick.leftAxis().Visible = true;
    this.objChart_Broomstick.leftAxis().PaddingMin = 10;
    this.objChart_Broomstick.leftAxis().PaddingMax = 15;

    this.objChart_Broomstick.bottomAxis().AutoScale = true;
    this.objChart_Broomstick.bottomAxis().bandScale = false;
    this.objChart_Broomstick.bottomAxis().Min = 100;
    this.objChart_Broomstick.bottomAxis().Max = 200;
    this.objChart_Broomstick.bottomAxis().Title =
      "Hookload" + " ()"; //???? Unit

    // this.objChart_Broomstick.bottomAxis().Title =
    // "Hookload" + " (" + this.state.objBroomstickData.hkldUnit + ")"; //???? Unit
    this.objChart_Broomstick.bottomAxis().ShowLabels = true;
    this.objChart_Broomstick.bottomAxis().ShowTitle = true;
    this.objChart_Broomstick.bottomAxis().LabelAngel = 0;
    this.objChart_Broomstick.bottomAxis().ShowSelector = false;
    this.objChart_Broomstick.bottomAxis().IsDateTime = false;
    this.objChart_Broomstick.bottomAxis().Visible = true;

    this.objChart_Broomstick.rightAxis().Visible = false;

    this.objChart_Broomstick.MarginLeft = 10;
    this.objChart_Broomstick.MarginBottom = 70;
    this.objChart_Broomstick.MarginTop = 10;
    this.objChart_Broomstick.MarginRight = 10;
    this.objChart_Broomstick.ShowLegend = true;

    this.objChart_Broomstick.initialize();

    this.objChart_Broomstick.reDraw();
    // this.objChart_Broomstick.onBeforeSeriesDraw.subscribe((e, i) => {
    //     this.onBeforeDrawSeries(e, i);
    //   });
  };

  WellId: string = "";
  AxiosSource = axios.CancelToken.source();
  //AxiosConfig = { cancelToken: this.AxiosSource.token };

  //  BoomStickDocument =1,
  //         BroomStickTorqyeDocument=2,
  //         HookloadDocument = 3,
  //         TorqueDocument=4,
  //         CombinedBroomStickDocument =5,
  //         CombineBroomStickTorqueDocument =6

  cmbDocType = [
    new comboData("Select Document", "-1"),
    new comboData("BoomStick Document", "1"),
    new comboData("BroomStick Torque Document", "2"),
    // new comboData("Hookload Document", "3"),
    // new comboData("Torque Document", "4"),
    // new comboData("Combined BroomStick Document", "5"),
    // new comboData("Combine BroomStick Torque Document", "6"),
  ];

  state = {
    showFilterDialog: false,
    cmbDocumentType: new comboData("Select Document", "-1"),
    objSetup: new BroomStickSetup_(),
    objBrookstickDoc: {} as any,
    cmbPlanList: [] as comboData[],
    cmbSelectedRun: new comboData("Select Plan", "-1"),
    objUserSettings: new BroomStickDocsUserSetting()
  };

  onDropDownListChange = async (event: any, field: string) => {
    try {

      // if (field == "cmbSelectedRun") {

      //   await this.setState({
      //     cmbSelectedRun: event.value
      //   });

      //   return;

      // }


      await this.setState({
        cmbDocumentType: event.value
      });

      if (event.value.id == "-1") {
        return;
      }

      this.loadDocument();

      // for (let index = 0; index < this.cmbDocType.length; index++) {

      //   let objItem = this.cmbDocType[index];

      //   if (objItem.id == this.state.cmbDocumentType .toString()) {
      //     this.setState({
      //       cmbDownSampleMethod: objItem,
      //     });

      //     break;
      //   }
      // }


    } catch (error) {

    }
  }


  getXValue = (objParamPoint: any) => {

    try {
      

      if (this.state.cmbDocumentType.id == "2") { //Torque Document
        return objParamPoint.DynamicTorqueValue;
      }

      if (this.state.cmbDocumentType.id == "1") { //Broomstick  Document
        return objParamPoint.DynamicValue;
      }



    } catch (error) {

    }

  }

  loadDocument = () => {
    try {


      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Broomstick.Manager";
      objBrokerRequest.Broker = "DataManager";
      objBrokerRequest.Function = "ProcessBroomstickDoc";

      let paramuserid: BrokerParameter = new BrokerParameter(
        "UserID",
        _gMod._userId
      );
      objBrokerRequest.Parameters.push(paramuserid);

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellID",
        this.WellId
      );
      objBrokerRequest.Parameters.push(paramwellId);


      let paramDocId: BrokerParameter = new BrokerParameter(
        "DocType",
        this.state.cmbDocumentType.id
      );
      objBrokerRequest.Parameters.push(paramDocId);

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
          // $("#loader").hide();
          //alert("success");
          
          let objData = JSON.parse(res.data.Response);
          console.log("BroomstickDoc", objData);


          //Warnings Notifications
          let warnings: string = res.data.Warnings;
          if (warnings.trim() != "") {
            let warningList = [];
            warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
            this.setState({
              warningMsg: warningList
            });
          }

          //  let comboList: comboData[] = [];
          // // comboList.push(new comboData("Select Run No.", "-1"));

          // if (objData.RunList != null ) {
          //   let objPlanList = Object.values(objData.RunList);
          //   for (let index = 0; index < objPlanList.length; index++) {
          //     const objItem: any = objPlanList[index];
          //     let objComboData: comboData = new comboData(objItem.RUN_NO, objItem.RUN_NO);
          //     comboList.push(objComboData);

          //   }
          //   this.cmbRunList = comboList;
          // }



          //  if(objData.objAdnlHookloadPlan != null || objData.objAdnlHookloadPlan!= undefined){

          //  }


          this.setState({
            objSetup: objData.objSetup,
            objBrookstickDoc: objData.objProcessor,
            objUserSettings: objData
          });
          
          this.prepareChart();
          Util.StatusSuccess("Data successfully retrived  ");


        })
        .catch((error) => {
          alert("error " + error.message);
          Util.StatusError(error.message);
          // this.setState({
          //   isProcess: false,
          // });
          //this.forceUpdate();

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

    } catch (error) {

    }
  }

  onFilterClick = () => {
    try {

      if (this.state.cmbDocumentType.id == "-1") {
        confirmAlert({
          message: 'Please Select Document from the List',
          childrenElement: () => <div />,
          buttons: [
            {
              label: 'Ok',
              onClick: () => {

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

      console.log("Filter Click RigState", this.state.objBrookstickDoc.objRigState);
      this.setState({
        showFilterDialog: true,
      });
    } catch (error) { }
  };


  prepareSlackOffSeries = () => {
    try {

      //Generate Slack Off Series
      let objSlackOffDynamicSeries = new DataSeries();
      objSlackOffDynamicSeries.Id = "SODynamicSeries";
      objSlackOffDynamicSeries.Name = "SlackOff Points Dynamic";
      objSlackOffDynamicSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
      objSlackOffDynamicSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
      objSlackOffDynamicSeries.Type = dataSeriesType.Point;
      objSlackOffDynamicSeries.PointStyle = pointStyle.Circle;
      objSlackOffDynamicSeries.PointSize = 5;
      objSlackOffDynamicSeries.Title = "Slackoff";

      objSlackOffDynamicSeries.Color = "Orange"; //"blue"; //this.getRigStateColor(0); //"#1762ad";
      objSlackOffDynamicSeries.ShowInLegend = true;
      this.objChart_Broomstick.DataSeries.set(objSlackOffDynamicSeries.Id, objSlackOffDynamicSeries);


      let objSlackOffSeries = new DataSeries();
      objSlackOffSeries.Id = "SOSeries";
      objSlackOffSeries.Name = "SlackOff Points Static";
      objSlackOffSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
      objSlackOffSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
      objSlackOffSeries.Type = dataSeriesType.Point;
      objSlackOffSeries.PointStyle = pointStyle.Circle;
      objSlackOffSeries.PointSize = 5;
      objSlackOffSeries.Title = "SlackOff Static";

      objSlackOffSeries.Color = "Green";//  "blue"; //"blue"; //this.getRigStateColor(0); //"#1762ad";
      objSlackOffSeries.ShowInLegend = true;
      this.objChart_Broomstick.DataSeries.set(objSlackOffSeries.Id, objSlackOffSeries);


      let chartData = Object.values(this.state.objBrookstickDoc.SOPoints);
      
      //PUPoints
      for (let index = 0; index < chartData.length; index++) {
        const objDataPoint: any = chartData[index];
        let objVal: ChartData = new ChartData();

        objVal.y = objDataPoint.Depth;

        //fIX TO TEST
        this.state.objSetup.PointToPlot = pointPlotMethod.Both;
        this.state.objSetup.slackOffPointSelectionMethod = Number(bmStaticMethod.Min);
        //**************
        
        switch (Number(this.state.objSetup.PointToPlot)) {
          case pointPlotMethod.DynamicMethod:
            objVal.x = this.getXValue(objDataPoint);//  objDataPoint.DynamicValue;
            objSlackOffDynamicSeries.Data.push(objVal);

            break;

          case pointPlotMethod.StaticMethod:

            switch (this.state.objSetup.slackOffPointSelectionMethod) {
              case bmStaticMethod.Avg:
                objVal.x = objDataPoint.Avg;
                break;
              case bmStaticMethod.Max:
                objVal.x = objDataPoint.Max;
                break;
              case bmStaticMethod.Min:
                objVal.x = objDataPoint.Min;
                break;
              default:
                break;
            }
            objSlackOffSeries.Data.push(objVal);
            break;

          case pointPlotMethod.Both:
            switch (this.state.objSetup.slackOffPointSelectionMethod) {
              case bmStaticMethod.Avg:
                objVal.x = objDataPoint.Avg;
                break;
              case bmStaticMethod.Max:
                objVal.x = objDataPoint.Max;
                break;
              case bmStaticMethod.Min:
                objVal.x = objDataPoint.Min;
                break;
              default:
                break;
            }
            objSlackOffSeries.Data.push(objVal);
            objVal = new ChartData();
            objVal.y = objDataPoint.Depth;
            objVal.x = objDataPoint.DynamicValue;
            objSlackOffDynamicSeries.Data.push(objVal);

            break;
        }



      }
      

      if (this.state.objSetup.PointToPlot == pointPlotMethod.DynamicMethod) {
        objSlackOffSeries.Visible = false;
      }
      if (this.state.objSetup.PointToPlot == pointPlotMethod.StaticMethod) {
        objSlackOffDynamicSeries.Visible = false;
      }


    } catch (error) {

    }
  }


  preparePlanSeries = () => {
    try {



      //objAdnlHookloadPlan
      
      let objRotateSeries: DataSeries = new DataSeries();
      let objPUPlanSeries: DataSeries = new DataSeries();
      let objSOPlanSeries: DataSeries = new DataSeries();

      let RotateDataFound: boolean = false;

      if (this.state.objBrookstickDoc.objAdnlHookloadPlan != null) {
        let objAdnlHookloadPlan = Object.values(this.state.objBrookstickDoc.objAdnlHookloadPlan);
        if (objAdnlHookloadPlan.length > 0) {

          //Rotate Plan
          for (let index = 0; index < objAdnlHookloadPlan.length; index++) {
            const objPlan: any = objAdnlHookloadPlan[index];

            if (objPlan.rotate != null && RotateDataFound == false) {
              RotateDataFound = true;
              objRotateSeries.Id = "RotateSeries";
              objRotateSeries.Name = "Rotate - " + objPlan.Name;
              objRotateSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
              objRotateSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
              objRotateSeries.Type = dataSeriesType.Line;
              //objRotateSeries.PointStyle = pointStyle.Circle;
              //objRotateSeries.PointSize = 5;
              objRotateSeries.LineWidth = 2;
              objRotateSeries.Title = "Rotate - " + objPlan.Name;

              objRotateSeries.Color = "red"; //"blue"; //this.getRigStateColor(0); //"#1762ad";

              objRotateSeries.ShowInLegend = true;
              this.objChart_Broomstick.DataSeries.set(objRotateSeries.Id, objRotateSeries);

              let objRotateData: any = Object.values(objPlan.rotate);
              if (objRotateData != null) {
                for (let index = 0; index < objRotateData.length; index++) {
                  const objData = objRotateData[index];
                  //
                  //
                  let objPoint: ChartData = new ChartData();
                  objPoint.x = objData.Weight;
                  objPoint.y = objData.Depth;
                  objRotateSeries.Data.push(objPoint);


                }
              }


            }

            // if (objPlan.pickup != null) {

            //   objPUPlanSeries = new DataSeries();
            //   objPUPlanSeries.Id = "PUPlanSeries-" + index;
            //   objPUPlanSeries.Name = "Pickup - " + objPlan.Name;
            //   objPUPlanSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
            //   objPUPlanSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
            //   objPUPlanSeries.Type = dataSeriesType.Line;
            //   objPUPlanSeries.LineWidth = 2;

            //   objPUPlanSeries.Title = "Pickup - " + objPlan.Name;

            //   objPUPlanSeries.Color = "blue"; //"blue"; //this.getRigStateColor(0); //"#1762ad";
            //   if (objPlan.Name.indexOf("0.1") != -1) {

            //     objPUPlanSeries.Color = intToColor(-7105537);
            //   }

            //   if (objPlan.Name.indexOf("0.2") != -1) {
            //     objPUPlanSeries.Color = intToColor(-9474049);
            //   }

            //   if (objPlan.Name.indexOf("0.3") != -1) {
            //     objPUPlanSeries.Color = intToColor(-11184641);
            //   }

            //   if (objPlan.Name.indexOf("0.4") != -1) {
            //     objPUPlanSeries.Color = intToColor(-15395329);
            //   }
            //   if (objPlan.Name.indexOf("0.5") != -1) {
            //     objPUPlanSeries.Color = intToColor(-16777065);
            //   }

            //   objPUPlanSeries.ShowInLegend = true;
            //   this.objChart_Broomstick.DataSeries.set(objPUPlanSeries.Id, objPUPlanSeries);

            //   let objPickupData: any = Object.values(objPlan.pickup);
            //   if (objPickupData != null) {
            //     for (let index = 0; index < objPickupData.length; index++) {
            //       let objData = objPickupData[index];
            //       //
            //       //
            //       let objPoint: ChartData = new ChartData();
            //       objPoint.x = objData.Weight;
            //       objPoint.y = objData.Depth;
            //       objPUPlanSeries.Data.push(objPoint);

            //     }
            //   }
            // }


            //
            // if (objPlan.slackoff != null) {
            //   objSOPlanSeries = new DataSeries();
            //   objSOPlanSeries.Id = "SOPlanSeries-" + index;
            //   objSOPlanSeries.Name = "Slackoff Plan";
            //   objSOPlanSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
            //   objSOPlanSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
            //   objSOPlanSeries.Type = dataSeriesType.Line;
            //   objSOPlanSeries.LineWidth = 2;
            //   objSOPlanSeries.Title = "Slackoff Plan - " + objPlan.Name;;

            //   objSOPlanSeries.Color = "green";

            //   if (objPlan.Name.indexOf("0.1") != -1) {

            //     objSOPlanSeries.Color = "#81C784";
            //   }

            //   if (objPlan.Name.indexOf("0.2") != -1) {
            //     objSOPlanSeries.Color = "#66BB6A"
            //   }

            //   if (objPlan.Name.indexOf("0.3") != -1) {
            //     objSOPlanSeries.Color = "#4CAF50"
            //   }

            //   if (objPlan.Name.indexOf("0.4") != -1) {
            //     objSOPlanSeries.Color = "#43A047";
            //   }
            //   if (objPlan.Name.indexOf("0.5") != -1) {
            //     objSOPlanSeries.Color = "#1B5E20";
            //   }

            //   objSOPlanSeries.ShowInLegend = true;
            //   this.objChart_Broomstick.DataSeries.set(objSOPlanSeries.Id, objSOPlanSeries);

            //   let objSlackOffData: any = Object.values(objPlan.slackoff);
            //   if (objSlackOffData != null) {
            //     for (let index = 0; index < objSlackOffData.length; index++) {
            //       let objData = objSlackOffData[index];
            //       //
            //       //
            //       let objPoint: ChartData = new ChartData();
            //       objPoint.x = objData.Weight;
            //       objPoint.y = objData.Depth;
            //       if (objData.Weight > 0) {
            //         objSOPlanSeries.Data.push(objPoint);
            //       }


            //     }
            //   }
            // }

          }



          //PUPlan Series
          for (let index = 0; index < objAdnlHookloadPlan.length; index++) {
            const objPlan: any = objAdnlHookloadPlan[index];

            if (objPlan.pickup != null) {

              objPUPlanSeries = new DataSeries();
              objPUPlanSeries.Id = "PUPlanSeries-" + index;
              objPUPlanSeries.Name = "Pickup - " + objPlan.Name;
              objPUPlanSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
              objPUPlanSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
              objPUPlanSeries.Type = dataSeriesType.Line;
              objPUPlanSeries.LineWidth = 2;

              objPUPlanSeries.Title = "Pickup - " + objPlan.Name;

              objPUPlanSeries.Color = "blue"; //"blue"; //this.getRigStateColor(0); //"#1762ad";
              if (objPlan.Name.indexOf("0.1") != -1) {

                objPUPlanSeries.Color = intToColor(-7105537);
              }

              if (objPlan.Name.indexOf("0.2") != -1) {
                objPUPlanSeries.Color = intToColor(-9474049);
              }

              if (objPlan.Name.indexOf("0.3") != -1) {
                objPUPlanSeries.Color = intToColor(-11184641);
              }

              if (objPlan.Name.indexOf("0.4") != -1) {
                objPUPlanSeries.Color = intToColor(-15395329);
              }
              if (objPlan.Name.indexOf("0.5") != -1) {
                objPUPlanSeries.Color = intToColor(-16777065);
              }

              objPUPlanSeries.ShowInLegend = true;
              this.objChart_Broomstick.DataSeries.set(objPUPlanSeries.Id, objPUPlanSeries);

              let objPickupData: any = Object.values(objPlan.pickup);
              if (objPickupData != null) {
                for (let index = 0; index < objPickupData.length; index++) {
                  let objData = objPickupData[index];
                  //
                  //
                  let objPoint: ChartData = new ChartData();
                  objPoint.x = objData.Weight;
                  objPoint.y = objData.Depth;
                  objPUPlanSeries.Data.push(objPoint);

                }
              }
            }

          }


          //SlackOff Plan

          for (let index = 0; index < objAdnlHookloadPlan.length; index++) {
            const objPlan: any = objAdnlHookloadPlan[index];
            if (objPlan.slackoff != null) {
              objSOPlanSeries = new DataSeries();
              objSOPlanSeries.Id = "SOPlanSeries-" + index;
              objSOPlanSeries.Name = "Slackoff Plan";
              objSOPlanSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
              objSOPlanSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
              objSOPlanSeries.Type = dataSeriesType.Line;
              objSOPlanSeries.LineWidth = 2;
              objSOPlanSeries.Title = "Slackoff Plan - " + objPlan.Name;;

              objSOPlanSeries.Color = "green";

              if (objPlan.Name.indexOf("0.1") != -1) {

                objSOPlanSeries.Color = "#81C784";
              }

              if (objPlan.Name.indexOf("0.2") != -1) {
                objSOPlanSeries.Color = "#66BB6A"
              }

              if (objPlan.Name.indexOf("0.3") != -1) {
                objSOPlanSeries.Color = "#4CAF50"
              }

              if (objPlan.Name.indexOf("0.4") != -1) {
                objSOPlanSeries.Color = "#43A047";
              }
              if (objPlan.Name.indexOf("0.5") != -1) {
                objSOPlanSeries.Color = "#1B5E20";
              }

              objSOPlanSeries.ShowInLegend = true;
              this.objChart_Broomstick.DataSeries.set(objSOPlanSeries.Id, objSOPlanSeries);

              let objSlackOffData: any = Object.values(objPlan.slackoff);
              if (objSlackOffData != null) {
                for (let index = 0; index < objSlackOffData.length; index++) {
                  let objData = objSlackOffData[index];
                  //
                  //
                  let objPoint: ChartData = new ChartData();
                  objPoint.x = objData.Weight;
                  objPoint.y = objData.Depth;
                  if (objData.Weight > 0) {
                    objSOPlanSeries.Data.push(objPoint);
                  }


                }
              }
            }

          }


          this.objChart_Broomstick.reDraw();


        }

      }
    } catch (error) {

    }
  }


  preparePUSeries = () => {
    try {
      //Generate PU Series
      let objPUDynamicSeries = new DataSeries();
      objPUDynamicSeries.Id = "PUDynamicSeries";
      objPUDynamicSeries.Name = "Pickup Points Dynamic";
      objPUDynamicSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
      objPUDynamicSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
      objPUDynamicSeries.Type = dataSeriesType.Point;
      objPUDynamicSeries.PointStyle = pointStyle.Circle;
      objPUDynamicSeries.PointSize = 5;
      objPUDynamicSeries.Title = "Pickup";

      objPUDynamicSeries.Color = "blue";
      objPUDynamicSeries.ShowInLegend = true;
      this.objChart_Broomstick.DataSeries.set(objPUDynamicSeries.Id, objPUDynamicSeries);


      let objPUSeries = new DataSeries();
      objPUSeries.Id = "PUSeries";
      objPUSeries.Name = "Pickup Points Static";
      objPUSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
      objPUSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
      objPUSeries.Type = dataSeriesType.Point;
      objPUSeries.PointStyle = pointStyle.Circle;
      objPUSeries.PointSize = 5;
      objPUSeries.Title = "Pickup Static";

      objPUSeries.Color = "red";
      objPUSeries.ShowInLegend = true;
      this.objChart_Broomstick.DataSeries.set(objPUSeries.Id, objPUSeries);

      let chartData = Object.values(this.state.objBrookstickDoc.PUPoints);
      
      //PUPoints
      for (let index = 0; index < chartData.length; index++) {
        const objPUPoint: any = chartData[index];
        let objVal: ChartData = new ChartData();

        objVal.y = objPUPoint.Depth;

        //fIX TO TEST
        this.state.objSetup.PointToPlot = pointPlotMethod.Both;
        this.state.objSetup.pickupPointSelectionMethod = Number(bmStaticMethod.Min);
        //**************
        
        switch (Number(this.state.objSetup.PointToPlot)) {
          case pointPlotMethod.DynamicMethod:
            objVal.x = objPUPoint.DynamicValue; //DynamicTorqueValue
            objPUDynamicSeries.Data.push(objVal);

            break;

          case pointPlotMethod.StaticMethod:

            switch (this.state.objSetup.pickupPointSelectionMethod) {
              case bmStaticMethod.Avg:
                objVal.x = objPUPoint.Avg;
                break;
              case bmStaticMethod.Max:
                objVal.x = objPUPoint.Max;
                break;
              case bmStaticMethod.Min:
                objVal.x = objPUPoint.Min;
                break;
              default:
                break;
            }
            objPUSeries.Data.push(objVal);
            break;

          case pointPlotMethod.Both:
            switch (this.state.objSetup.pickupPointSelectionMethod) {
              case bmStaticMethod.Avg:
                objVal.x = objPUPoint.Avg;
                break;
              case bmStaticMethod.Max:
                objVal.x = objPUPoint.Max;
                break;
              case bmStaticMethod.Min:
                objVal.x = objPUPoint.Min;
                break;
              default:
                break;
            }
            objPUSeries.Data.push(objVal);
            objVal = new ChartData();
            objVal.y = objPUPoint.Depth;
            objVal.x = objPUPoint.DynamicValue;
            objPUDynamicSeries.Data.push(objVal);

            break;
        }



      }
      

      if (this.state.objSetup.PointToPlot == pointPlotMethod.DynamicMethod) {
        objPUSeries.Visible = false;
      }
      if (this.state.objSetup.PointToPlot == pointPlotMethod.StaticMethod) {
        objPUDynamicSeries.Visible = false;
      }
    } catch (error) {

    }
  }



  prepareRotateSeries = () => {
    try {
      //Generate PU Series
      let objRotateSeries = new DataSeries();
      objRotateSeries.Id = "RotateSeries";
      objRotateSeries.Name = "Rotate";
      objRotateSeries.XAxisId = this.objChart_Broomstick.bottomAxis().Id;
      objRotateSeries.YAxisId = this.objChart_Broomstick.leftAxis().Id;
      objRotateSeries.Type = dataSeriesType.Point;
      objRotateSeries.PointStyle = pointStyle.Circle;
      objRotateSeries.PointSize = 5;
      objRotateSeries.Title = "Rotate";

      objRotateSeries.Color = "Black"; //"blue"; //this.getRigStateColor(0); //"#1762ad";
      objRotateSeries.ShowInLegend = true;
      this.objChart_Broomstick.DataSeries.set(objRotateSeries.Id, objRotateSeries);

      let chartData = Object.values(this.state.objBrookstickDoc.RotatePoints);
      

      if (this.state.objSetup.PointToPlot == pointPlotMethod.DynamicMethod) {
        for (let index = 0; index < chartData.length; index++) {
          const objRotatePoints: any = chartData[index];
          let objVal: ChartData = new ChartData();
          objVal.y = objRotatePoints.Depth;
          //objVal.x = objRotatePoints.DynamicValue;
          objVal.x = this.getXValue(objRotatePoints);//  objDataPoint.DynamicValue;
          objRotateSeries.Data.push(objVal);
        }
      } else {
        objRotateSeries.Visible = false;
      }

    } catch (error) {

    }
  }

  prepareChart = () => {
    try {
      if (this.state.cmbDocumentType.id == "-1") {
        confirmAlert({
          message: 'Please Select Document from the List',
          childrenElement: () => <div />,
          buttons: [
            {
              label: 'Ok',
              onClick: () => {

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

      this.initilizeCharts();
      this.objChart_Broomstick.LegendPosition = 2; // 1 (left), 2 (right), 3 (top), 4 (bottom)
      this.objChart_Broomstick.leftAxis().Title = "Depth" + " (" + this.state.objBrookstickDoc.depthUnit + ")";
      this.objChart_Broomstick.bottomAxis().Title = "Hookload" + " (" + this.state.objBrookstickDoc.hkldUnit + ")";

      if (this.state.objBrookstickDoc.DocumentMode == 1) {
        this.objChart_Broomstick.bottomAxis().Title = "Torque" + " (" + this.state.objBrookstickDoc.torqueUnit + ")";
      }

      //


      this.preparePUSeries();
      this.prepareSlackOffSeries();
      this.prepareRotateSeries();
      this.preparePlanSeries();
      this.objChart_Broomstick.reDraw();

    } catch (error) {

    }
  }

  closeSetupDialog = () => {
    try {
      this.setState({ showFilterDialog: false });
      this.loadDocument();
    } catch (error) {

    }
  }

  render() {
    return (
      <>
        <div>
          {this.state.showFilterDialog && (
            <Window
              title={"Filter"}
              onClose={() => {
                this.setState({ showFilterDialog: false });
              }}
              initialHeight={750}
              initialWidth={1700}
              stage="FULLSCREEN"
              
              
            >
              <BroomstickSetup onClose_={this.closeSetupDialog} DocID={this.state.objUserSettings.DocID} DocMode={this.state.cmbDocumentType.id} WellId={this.WellId} paramObjSetup={this.state.objSetup} objRigStates={this.state.objBrookstickDoc.objRigState} RunList={this.state.objBrookstickDoc.RunList} />
            </Window>
          )}
          <div className="row mb-2" style={{ justifyContent: "space-between" }}>
            <div className="">
              <div className="drillingSummaryContainer">
                <div className="mr-2 mt-3"></div>
                <label>Well Document</label>
                <DropDownList
                  id="DocType"
                  style={{
                    width: "350px",
                  }}
                  className="ml-3"
                  name="cmbDownSampleMethod"
                  data={this.cmbDocType}
                  value={this.state.cmbDocumentType}
                  textField="text"
                  dataItemKey="id"
                  onChange={(e) =>
                    this.onDropDownListChange(e, "cmbDocumentType")
                  }
                ></DropDownList>
                <div className="mr-2"></div>

                <div className="mr-5 ml-5 ">
                  {" "}
                  <FontAwesomeIcon
                    icon={faFilter}
                    size="lg"
                    onClick={() => {
                      this.onFilterClick();
                    }}
                  />
                </div>

                <div className="mr-5">
                  <FontAwesomeIcon
                    icon={faUndo}
                    size="lg"
                    onClick={() => {
                      this.objChart_Broomstick.reDraw();
                    }}
                  />
                </div>

                {/* <div className="mr-2">
                  <label>Plan</label>
                  <DropDownList
                    id="DocType"
                    style={{
                      width: "350px",
                    }}
                    className="ml-3"
                    name="cmbDownSampleMethod"
                    data={this.cmbRunList}
                    value={this.state.cmbSelectedRun}
                    textField="text"
                    dataItemKey="id"
                    onChange={(e) =>
                      this.onDropDownListChange(e, "cmbSelectedRun")
                    }
                  ></DropDownList>
                </div> */}

                <div className="mr-2">
                  <Button onClick={this.prepareChart} >Generate Report</Button>
                </div>

                <div className="mr-2"></div>

                <div className="mr-2"></div>
              </div>
            </div>

            <div className="form-inline m-1">
              {/* <div className="eVumaxPanelController" style={{ width: "270px" }}>

              <label className=" mr-1">Realtime</label> <Switch onChange={this.handleToggleSwitch} value={this.state.isRealTime} checked={this.state.isRealTime}></Switch>
              
              <label className=" ml-5 mr-2" onClick={() => {
                this.refreshChart();
              }} style={{ cursor: "pointer" }}>Undo Zoom</label>  <FontAwesomeIcon
                icon={faSearchMinus}
                size="lg"
                onClick={() => {
                  this.refreshChart();
                }}
              />

            </div> */}
            </div>
          </div>

          <div className="clearfix"></div>

          <div className="clearfix"></div>
          <hr />
          <label className="mr-3">Well Name</label>
          {this.state.objBrookstickDoc.WellName}


          <div className="row">
            <div className="col-xl-10 col-lg-9 col-md-7 col-sm-7">
              <div
                id="BroomStickChart"
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
                id="BroomStickChart_legend"
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
      </>
    );
  }
}
