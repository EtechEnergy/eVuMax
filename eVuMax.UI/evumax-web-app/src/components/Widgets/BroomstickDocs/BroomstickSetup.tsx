import React, { Component } from "react";
import axios from "axios";

import {
  DateRangePicker,
  DateTimePicker,
  DropDownList,
  GridColumn,
  Label,
  TabStrip,
  TabStripSelectEventArguments,
  TabStripTab,
} from "@progress/kendo-react-all";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
//import DataSelector from "../../Common/DataSelector";
import { comboData } from "../../../eVuMaxObjects/UIObjects/comboData";
import { bmStaticMethod, BroomStickSetup_, pointPlotMethod } from "./BroomStickSetup_";
import { TimeFilter, vFilterType } from "./TimeFilter";

import * as utilFunc from "../../../utilFunctions/utilFunctions";
import { Util } from "../../../Models/eVuMax";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import GlobalMod from "../../../objects/global";
import { ObjectFlags } from "typescript";
import { TDPointProp } from "./TDPointProp";
import { Chart } from "../../../eVuMaxObjects/Chart/Chart";

let _gMod = new GlobalMod();

interface IProps {
  objRigStates: any;
  paramObjSetup: BroomStickSetup_;
  WellId: string;
  RunList: any;
  DocMode: string;
  DocID: string;
  onClose_:any;

}

export class BroomstickSetup extends Component<IProps> {
  constructor(props: any) {
    super(props);
    this.WellId = props.WellId;
    console.log("props", props.paramObjSetup);
    console.log("props objRigState", props.objRigStates);



  }



  componentWillMount(): void {
    try {

      this.setState({
        objSetup: this.props.paramObjSetup,
        objTimeFilter: this.props.paramObjSetup.objTimeFilter
      });
      console.log("Time Filter --",  this.props.paramObjSetup.objTimeFilter);



    } catch (error) {

    }
  }



  objChart_Broomstick: Chart;
  WellId: string = "";
  cmbRunList: comboData[] = [];

  AxiosSource = axios.CancelToken.source();
  AxiosConfig = { cancelToken: this.AxiosSource.token };
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

    cmbSelectedRun: new comboData("Select Run", "-1"),
    PointSelectionMethod_Min: false,
    PointSelectionMethod_Max: false,
    PointSelectionMethod_Avg: false,

    selectedPickupRigState: [],
    grdPickupRigState: [],
    grdSlackOffRigState: [],
    grdRotateRigState: [],
    //objSetup: this.props.paramObjSetup,
    objSetup: new BroomStickSetup_(),
    selectedMain: 0,
    selectedSub: 0,
    selected: 0,
    cmbRotatePumpChannel: new comboData(),
    cmbDownSampleMethod: new comboData(),
    cmbMeanMethod: new comboData(),
    cmbSlackOffMultiMethod: new comboData(),
    cmbROBMultiMethod: new comboData(),
    lstGoupFunction: new comboData(),
    cmbPickupPumpChannel: new comboData(),
    cmbSlackOffPumpChannel: new comboData(),
    cmbStaticPointSelectionMethod: new comboData(),
    cmbPickupDynamicMethod: new comboData(),
    cmbSlackOffDynamicMethod: new comboData(),
    cmbSlackOffMethod: new comboData(),
    cmbBroomStickPoints: new comboData(),
    cmbPickupPumpStatus: new comboData(),
    cmbSlackOffPumpStatus: new comboData(),
    cmbRotatePumpStatus: new comboData(),
    cmbRigStateFunction: new comboData(),
    cmbHkldPointStyle: new comboData(),
    cmbBMPointStyle: new comboData(),
    cmbPickupMultiMethod: new comboData(),

    //objBroomStickSetup: new BroomStickSetup_(),
    objTimeFilter: new TimeFilter(),

    objSelectedTDPointProp: new TDPointProp(),

    objTDPointProperties: [] as TDPointProp[]
  };


  onGridItemChange = (e: any, grdName: string) => {
    debugger;
    let edited: any;

    if (grdName == "grdPickupRigState") {
      e.dataItem[e.field] = e.value;
      edited = utilFunc.CopyObject(this.state.grdPickupRigState);
      edited[e.field] = e.value;
      this.setState({ grdPickupRigState: edited });
    }

    if (grdName == "grdSlackOffRigState") {
      e.dataItem[e.field] = e.value;
      edited = utilFunc.CopyObject(this.state.grdSlackOffRigState);
      edited[e.field] = e.value;
      this.setState({ grdSlackOffRigState: edited });
    }

    if (grdName == "grdRotateRigState") {
      e.dataItem[e.field] = e.value;
      edited = utilFunc.CopyObject(this.state.grdRotateRigState);
      edited[e.field] = e.value;
      this.setState({ grdRotateRigState: edited });
    }


    if (grdName == "objTDPointProperties") {

      let edited = this.state.objSelectedTDPointProp;
      edited = e.dataItem;
      debugger;
      //this.onDropdownChange(e.dataItem,"objSelectedTDPointProp");
      //set Combo 
      for (let index = 0; index < this.cmbRigStateFunction.length; index++) {
        const objItem = this.cmbRigStateFunction[index];
        if (objItem.id == edited.GroupFunction.toString()) {

          this.setState({
            cmbRigStateFunction: objItem
          });
          break;

        }

      }


      this.setState({
        objSelectedTDPointProp: edited
      })
      //this.setState({ pointColor: utilFunc.intToColor(e.dataItem.Color) });
      //action
    }


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



    console.log("objRigState", this.props.paramObjSetup.objRigState);
    console.log(this.state.objSetup);
    this.initilizeCharts();

    this.generateAllCombo();
    this.loadRigstatesGrid();
  }
  initilizeCharts = () => {
    debugger;

    this.objChart_Broomstick = new Chart(this, "Broom_Stick");

    this.objChart_Broomstick.ContainerId = "Broomstick";
    this.objChart_Broomstick.Title = "";
    this.objChart_Broomstick.leftAxis().AutoScale = true;
    this.objChart_Broomstick.leftAxis().Min = 0;
    this.objChart_Broomstick.leftAxis().Max = 100;
    this.objChart_Broomstick.leftAxis().Inverted = true;
    this.objChart_Broomstick.leftAxis().ShowLabels = true;
    this.objChart_Broomstick.leftAxis().ShowTitle = true;
    // this.objChart_Broomstick.leftAxis().Title =
    //   "Depth" + " (" + this.state.objBroomstickData.depthUnit + ")"; //???? Unit


    this.objChart_Broomstick.leftAxis().Title =
      "Depth" + " (" + "UnitPending" + ")"; //???? Unit


    this.objChart_Broomstick.leftAxis().DisplayOrder = 1;
    this.objChart_Broomstick.leftAxis().Visible = true;
    this.objChart_Broomstick.leftAxis().PaddingMin = 10;
    this.objChart_Broomstick.leftAxis().PaddingMax = 15;

    this.objChart_Broomstick.bottomAxis().AutoScale = true;
    this.objChart_Broomstick.bottomAxis().bandScale = false;
    this.objChart_Broomstick.bottomAxis().Min = 100;
    this.objChart_Broomstick.bottomAxis().Max = 200;
    // this.objChart_Broomstick.bottomAxis().Title =
    //   "Hookload" + " (" + this.state.objBroomstickData.hkldUnit + ")"; //???? Unit

    this.objChart_Broomstick.bottomAxis().Title =
      "Hookload" + " (" + "Ybu" + ")"; //???? Unit


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

  saveSettings = () => {
    try {

      console.log("pichUp RigSate", this.state.grdPickupRigState);


      Util.StatusInfo("Getting data from the server  ");
      // this.setState({
      //   isProcess: true,
      // });
      //this.forceUpdate();

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Broomstick.Manager";
      objBrokerRequest.Broker = "DataManager";
      objBrokerRequest.Function = "SaveSetup";

      // let paramuserid: BrokerParameter = new BrokerParameter(
      //   "UserID",
      //   _gMod._userId
      // );
      // objBrokerRequest.Parameters.push(paramuserid);

      // let paramwellId: BrokerParameter = new BrokerParameter(
      //   "WellID",
      //   this.WellId
      // );
      // objBrokerRequest.Parameters.push(paramwellId);

      // //test depth range

      // let paramDocId: BrokerParameter = new BrokerParameter(
      //   "DocType",
      //   this.DocId
      // );
      // objBrokerRequest.Parameters.push(paramDocId);
      debugger;
      let objTDPropsDic = utilFunc.convertMapToDictionaryJSON(this.state.objTDPointProperties, "RigState");
      let objSetup: BroomStickSetup_ = utilFunc.CopyObject(this.state.objSetup);
      objSetup.objTimeFilter = utilFunc.CopyObject(this.state.objTimeFilter);
      debugger;
      objSetup.TDPointProperties = objTDPropsDic;


      if (this.state.cmbSelectedRun.id != "-1") {
        objSetup.RunNo = this.state.cmbSelectedRun.id;
      } else {
        objSetup.RunNo = "";
      }



      let objParameter: BrokerParameter = new BrokerParameter("objSetup", JSON.stringify(objSetup));
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("WellID", this.WellId);
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("UserID", _gMod._userId);
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("DocType", this.props.DocMode);
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("DocID", this.props.DocID);
      objBrokerRequest.Parameters.push(objParameter);



      this.AxiosSource = axios.CancelToken.source();


      axios
        .get(_gMod._performTask, {
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
          debugger;
          // let objData = res.data.Response;
          if (res.data.RequestSuccessfull == false) {
            //Warnings Notifications
            let warnings: string = res.data.Warnings;
            if (warnings.trim() != "") {
              let warningList = [];
              warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
              this.setState({
                warningMsg: warningList
              });
            }
          }




          Util.StatusSuccess("Data successfully retrived  ");
          this.onClose();


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

  loadRigstatesGrid = () => {
    try {

      debugger;
      let objRigState = utilFunc.CopyObject(Object.values(this.props.objRigStates.rigStates));
      if (objRigState != null) {
        //add checkbox to grid
        objRigState.map((dataItem: any) =>
          Object.assign(dataItem, { Selected: false })
        );

        this.setState({
          grdPickupRigState: utilFunc.CopyObject(objRigState),
          grdSlackOffRigState: utilFunc.CopyObject(objRigState),
          grdRotateRigState: utilFunc.CopyObject(objRigState)
        });


      }
      //Load TDProperties into List

      this.setState({
        objTDPointProperties: Object.values(this.state.objSetup.TDPointProperties)
      });

    } catch (error) { }
  };



  setAllComboValues = () => {
    try {

debugger;
      //Set Run Combo
      if (this.state.objSetup.RunNo != "") {
        for (let index = 0; index < this.cmbRunList.length; index++) {

          let objItem = this.cmbRunList[index];


          if (objItem.id == this.state.objSetup.RunNo.toString()) {
            this.setState({
              cmbSelectedRun: objItem,
            });

            break;
          }
        }
      }

      for (let index = 0; index < this.cmbDownSampleMethod.length; index++) {

        let objItem = this.cmbDownSampleMethod[index];

        if (objItem.id == this.state.objSetup.DownSampleMethod.toString()) {
          this.setState({
            cmbDownSampleMethod: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbMeanMethod.length; index++) {

        let objItem = this.cmbMeanMethod[index];

        if (objItem.id == this.state.objTimeFilter.MeanMethod.toString()) {
          this.setState({
            cmbMeanMethod: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbHkldPointStyle.length; index++) {

        let objItem = this.cmbHkldPointStyle[index];

        if (objItem.id == this.state.objSetup.TDPointStyle.toString()) {
          this.setState({
            cmbHkldPointStyle: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbBMPointStyle.length; index++) {

        let objItem = this.cmbBMPointStyle[index];

        if (objItem.id == this.state.objSetup.BMPointStyle.toString()) {
          this.setState({
            cmbBMPointStyle: objItem,
          });

          break;
        }
      }

      debugger;
      for (let index = 0; index < this.cmbBroomStickPoints.length; index++) {

        let objItem = this.cmbBroomStickPoints[index];

        if (objItem.id == this.state.objSetup.PointToPlot.toString()) {
          this.setState({
            cmbBroomStickPoints: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbPickupPumpChannel.length; index++) {

        let objItem = this.cmbPickupPumpChannel[index];

        if (objItem.id == this.state.objSetup.pickupPumpMnemonic.toString()) {
          this.setState({
            cmbPickupPumpChannel: objItem,
          });

          break;
        }
      }

      for (let index = 0; index < this.cmbPickupPumpStatus.length; index++) {

        let objItem = this.cmbPickupPumpStatus[index];

        if (objItem.id == this.state.objSetup.pickupPumpStatus.toString()) {
          this.setState({
            cmbPickupPumpStatus: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbPickupDynamicMethod.length; index++) {

        let objItem = this.cmbPickupDynamicMethod[index];

        if (objItem.id == this.state.objSetup.pickupDynamicMethod.toString()) {
          this.setState({
            cmbPickupDynamicMethod: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbPickupMultiMethod.length; index++) {

        let objItem = this.cmbPickupMultiMethod[index];

        if (
          objItem.id == this.state.objSetup.pickupMultiPointMethod.toString()
        ) {
          this.setState({
            cmbPickupMultiMethod: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbSlackOffPumpChannel.length; index++) {

        let objItem = this.cmbSlackOffPumpChannel[index];

        if (objItem.id == this.state.objSetup.slackOffPumpMnemonic.toString()) {
          this.setState({
            cmbSlackOffPumpChannel: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbSlackOffPumpStatus.length; index++) {

        let objItem = this.cmbSlackOffPumpStatus[index];

        if (objItem.id == this.state.objSetup.slackOffPumpStatus.toString()) {
          this.setState({
            cmbSlackOffPumpStatus: objItem,
          });

          break;
        }
      }
      for (
        let index = 0;
        index < this.cmbStaticPointSelectionMethod.length;
        index++
      ) {

        let objItem = this.cmbStaticPointSelectionMethod[index];

        if (
          objItem.id ==
          this.state.objSetup.slackOffPointSelectionMethod.toString()
        ) {
          this.setState({
            cmbStaticPointSelectionMethod: objItem,
          });

          break;
        }
      }
      for (
        let index = 0;
        index < this.cmbSlackOffDynamicMethod.length;
        index++
      ) {

        let objItem = this.cmbSlackOffDynamicMethod[index];

        if (
          objItem.id == this.state.objSetup.slackOffDynamicMethod.toString()
        ) {
          this.setState({
            cmbSlackOffDynamicMethod: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbSlackOffMultiMethod.length; index++) {

        let objItem = this.cmbSlackOffMultiMethod[index];

        if (
          objItem.id == this.state.objSetup.slackOffMultiPointMethod.toString()
        ) {
          this.setState({
            cmbSlackOffMultiMethod: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbRotatePumpChannel.length; index++) {

        let objItem = this.cmbRotatePumpChannel[index];

        if (objItem.id == this.state.objSetup.rotatePumpMnemonic.toString()) {
          this.setState({
            cmbRotatePumpChannel: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbRotatePumpStatus.length; index++) {

        let objItem = this.cmbRotatePumpStatus[index];

        if (objItem.id == this.state.objSetup.rotatePumpStatus.toString()) {
          this.setState({
            cmbRotatePumpStatus: objItem,
          });

          break;
        }
      }
      for (let index = 0; index < this.cmbROBMultiMethod.length; index++) {

        let objItem = this.cmbROBMultiMethod[index];

        if (objItem.id == this.state.objSetup.ROBMultiPointMethod.toString()) {
          this.setState({
            cmbROBMultiMethod: objItem,
          });

          break;
        }
      }
    } catch (error) { }
  };

  generateAllCombo = () => {
    try {


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
        new comboData("Dynamic", "0"),
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

      // this.setState({
      //   cmbDownSampleMethod: [
      //     new comboData("By Depth", "0"),
      //     new comboData("By Time", "1"),
      //   ],
      //   cmbMeanMethod: [
      //     new comboData("Moving Avg.", "0"),
      //     new comboData("Least Square Fit", "1"),
      //   ],
      //   cmbPickupMultiMethod: [
      //     new comboData("Min", "0"),
      //     new comboData("Max", "1"),
      //   ],
      //   cmbSlackOffMultiMethod: [
      //     new comboData("Min", "0"),
      //     new comboData("Max", "1"),
      //   ],
      //   cmbROBMultiMethod: [
      //     new comboData("Min", "0"),
      //     new comboData("Max", "1"),
      //   ],
      //   lstGoupFunction: [
      //     new comboData("Min", "0"),
      //     new comboData("Max", "1"),
      //     new comboData("Avg", "2"),
      //   ],

      //   cmbPickupPumpChannel: [
      //     new comboData("Pump Pressure", "SPPA"),
      //     new comboData("Circulation", "CIRC"),
      //   ],
      //   cmbSlackOffPumpChannel: [
      //     new comboData("Pump Pressure", "SPPA"),
      //     new comboData("Circulation", "CIRC"),
      //   ],
      //   cmbRotatePumpChannel: [
      //     new comboData("Pump Pressure", "SPPA"),
      //     new comboData("Circulation", "CIRC"),
      //   ],
      //   cmbStaticPointSelectionMethod: [
      //     new comboData("Min", "0"),
      //     new comboData("Max", "1"),
      //     new comboData("Avg", "2"),
      //   ],

      //   cmbPickupDynamicMethod: [
      //     new comboData("Break over", "0"),
      //     new comboData("Average", "1"),
      //     new comboData("Avg. after Break Over", "2"),
      //   ],
      //   cmbSlackOffDynamicMethod: [
      //     new comboData("Break over", "0"),
      //     new comboData("Average", "1"),
      //     new comboData("Avg. after Break Over", "2"),
      //   ],
      //   cmbSlackOffMethod: [
      //     new comboData("Min", "0"),
      //     new comboData("Max", "1"),
      //     new comboData("Avg", "2"),
      //   ],
      //   cmbBroomStickPoints: [
      //     new comboData("Dtnamic", "0"),
      //     new comboData("Static", "1"),
      //     new comboData("Both", "2"),
      //   ],
      //   cmbPickupPumpStatus: [
      //     new comboData("All", "0"),
      //     new comboData("Pump On", "1"),
      //     new comboData("Pump Off", "2"),
      //   ],
      //   cmbSlackOffPumpStatus: [
      //     new comboData("All", "0"),
      //     new comboData("Pump On", "1"),
      //     new comboData("Pump Off", "2"),
      //   ],
      //   cmbRotatePumpStatus: [
      //     new comboData("All", "0"),
      //     new comboData("Pump On", "1"),
      //     new comboData("Pump Off", "2"),
      //   ],
      //   cmbRigStateFunction: [
      //     new comboData("Min", "0"),
      //     new comboData("Max", "1"),
      //     new comboData("Avg", "2"),
      //   ],
      //   cmbHkldPointStyle: [
      //     new comboData("Rectangle", "0"),
      //     new comboData("Circle", "1"),
      //     new comboData("Diamond", "7"),
      //     new comboData("Triangle", "2"),
      //     new comboData("Left Triangle", "10"),
      //     new comboData("Right Triangle", "11"),
      //     new comboData("Down Triangle", "3"),
      //   ],
      //   cmbBMPointStyle: [
      //     new comboData("Rectangle", "0"),
      //     new comboData("Circle", "1"),
      //     new comboData("Diamond", "7"),
      //     new comboData("Triangle", "2"),
      //     new comboData("Left Triangle", "10"),
      //     new comboData("Right Triangle", "11"),
      //     new comboData("Down Triangle", "3"),
      //   ],
      // });

      let comboList: comboData[] = [];

      debugger;
      if (this.props.RunList != null || this.props.RunList != undefined) {
        comboList.push(new comboData("Select Run No.", "-1"));
        let objPlanList = Object.values(this.props.RunList);

        for (let index = 0; index < objPlanList.length; index++) {
          const objItem: any = objPlanList[index];
          let objComboData: comboData = new comboData(objItem.RUN_NO, objItem.RUN_NO);
          comboList.push(objComboData);

        }
        this.cmbRunList = comboList;
      }


      this.setAllComboValues();
    } catch (error) { }
  };


  onDropdownChange = (event: any, field: string) => {
    try {
      debugger;

      let objValue: comboData = event.value;


      //Pending
      if (field == "cmbSelectedRun") {

        this.setState({
          cmbSelectedRun: event.value
        });

        return;

      }
      //********** */


      if (field == "cmbDownSampleMethod") {
        this.setState({
          cmbDownSampleMethod: objValue
        });
      }

      if (field == "cmbMeanMethod") {
        this.setState({
          cmbMeanMethod: objValue
        });
      }

      if (field == "cmbRigStateFunction") {
        //set objSeletedTDProperties
        let edited: TDPointProp = utilFunc.CopyObject(this.state.objSelectedTDPointProp);
        edited.GroupFunction = Number(objValue.id);


        let tdPointPropsList = Object.values(this.state.objTDPointProperties);
        for (let index = 0; index < tdPointPropsList.length; index++) {
          const objItem: TDPointProp = tdPointPropsList[index];
          if (objItem.RigState == this.state.objSelectedTDPointProp.RigState) {
            objItem.GroupFunction = Number(objValue.id);
            break;
          }
        }

        this.setState({
          cmbRigStateFunction: objValue,
          objSelectedTDPointProp: edited,
          objTDPointProperties: tdPointPropsList
        });

        return;
      }

      if (field == "cmbHkldPointStyle") {
        this.setState({
          cmbHkldPointStyle: objValue
        });
      }


      if (field == "cmbBMPointStyle") {
        this.setState({
          cmbBMPointStyle: objValue
        });
      }

      if (field == "cmbBroomStickPoints") {
        this.setState({
          cmbBroomStickPoints: objValue
        });

        let edited = this.state.objSetup;
        edited[field] = objValue.id;
        this.setState({
          objSetup:edited
        });
      }

      if (field == "cmbPickupPumpChannel") {
        this.setState({
          cmbPickupPumpChannel: objValue
        });
      }

      if (field == "cmbPickupPumpStatus") {
        this.setState({
          cmbPickupPumpStatus: objValue
        });
      }

      if (field == "cmbStaticPointSelectionMethod") {
        this.setState({
          cmbStaticPointSelectionMethod: objValue
        });
      }

      if (field == "cmbPickupDynamicMethod") {
        this.setState({
          cmbPickupDynamicMethod: objValue
        });
      }



      if (field == "cmbPickupMultiMethod") {
        this.setState({
          cmbPickupMultiMethod: objValue
        });
      }

      if (field == "cmbSlackOffPumpChannel") {
        this.setState({
          cmbSlackOffPumpChannel: objValue
        });
      }

      if (field == "cmbSlackOffPumpStatus") {
        this.setState({
          cmbSlackOffPumpStatus: objValue
        });
      }

      if (field == "cmbStaticPointSelectionMethod") {
        this.setState({
          cmbStaticPointSelectionMethod: objValue
        });
      }

      if (field == "cmbSlackOffDynamicMethod") {
        this.setState({
          cmbSlackOffDynamicMethod: objValue
        });
      }

      if (field == "cmbSlackOffMultiMethod") {
        this.setState({
          cmbSlackOffMultiMethod: objValue
        });
      }

      if (field == "cmbRotatePumpChannel") {
        this.setState({
          cmbRotatePumpChannel: objValue
        });
      }

      if (field == "cmbRotatePumpStatus") {
        this.setState({
          cmbRotatePumpStatus: objValue
        });
      }


      if (field == "cmbROBMultiMethod") {
        this.setState({
          cmbROBMultiMethod: objValue
        });
      }





    } catch (error) {

    }
  }

  onTimeFilterChange = (event: any, field: string) => {
    try {
      debugger;

      const value = event.value;


      const name = field; // target.props ? target.props.name : target.name;

      let edited: any = utilFunc.CopyObject(this.state.objTimeFilter);


      edited[field] = value;
      this.setState({
        objTimeFilter: edited
      });


    } catch (error) {

    }
  }



  onTextChange = (event: any, field: string) => {
    try {
      debugger;

      const value = event.value;
      const name = field; // target.props ? target.props.name : target.name;

      if (field == "objSelectedTDPointProp") {
        let edited: TDPointProp = utilFunc.CopyObject(this.state.objSelectedTDPointProp);
        edited.Color = value;
        let tdPointPropsList = Object.values(this.state.objTDPointProperties);
        for (let index = 0; index < tdPointPropsList.length; index++) {
          const objItem: TDPointProp = tdPointPropsList[index];
          if (objItem.RigState == this.state.objSelectedTDPointProp.RigState) {
            objItem.Color = value;
            break;
          }
        }

        this.setState({
          objSelectedTDPointProp: edited,
          objTDPointProperties: tdPointPropsList
        });

        return;
      }


      let edited = utilFunc.CopyObject(this.state.objSetup);


      edited[field] = value;
      this.setState({
        objSetup: edited
      });


    } catch (error) {

    }
  }

  onClose=()=>{
    this.props.onClose_();
  }
  render() {

    return (
      <div >

        <div className="row">
          <div
            className="row ml-2"
            style={{
              width: "100%",
              display: "inline-flex",
              textAlign: "end",
            }}
          >
            <div className="col-lg-12 mt-3">
              <div className="mr-2 " style={{ float: "left" }}>
                <label>Run No.</label>
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
                    this.onDropdownChange(e, "cmbSelectedRun")
                  }
                ></DropDownList>
              </div>
              <button
                onClick={this.saveSettings}
                className="btn-custom btn-custom-primary ml-1 mr-1"
              >
                Save
              </button>
              <button
                onClick={this.onClose}
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
                <div className="row" style={{ width: "100%" }}>
                  <div className="col-lg-12 mb-3">
                    <Checkbox
                      className="mr-2"
                      name="FilterData"
                      label="Filter Data"
                      checked={this.state.objTimeFilter.FilterStatus}
                      value={this.state.objTimeFilter.FilterStatus}
                      onChange={(e: any) =>
                        this.onTimeFilterChange(e, "FilterStatus")
                      }
                    />

                    {/* <Checkbox
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
                    /> */}
                    <hr className="mt-3" />
                  </div>
                  <div className="col-4" style={{ width: "100%" }}>
                    <div className="col-lg-12">
                      <h6 className="summaryGroupHeader">
                        Time Log Data Filter
                      </h6>
                    </div>

                    {/* <div className="col-lg-12">
                      <label>Time Log Data Filter</label>
                    </div> */}
                    <div className="col-lg-12">
                      <RadioButton
                        name="group1"
                        //value={this.state.objTimeFilter.FilterType}
                        value={vFilterType.LastData}
                        checked={this.state.objTimeFilter.FilterType == vFilterType.LastData ? true : false}
                        label="Display data of last"
                        onChange={(e: any) => {
                          this.onTimeFilterChange(e, "FilterType");
                        }}
                      />
                      <span className="mr-2 ml-2">
                        <NumericTextBox
                          value={this.state.objTimeFilter.LastPeriod}
                          format="n2"
                          width="100px"
                          onChange={(e: any) => {
                            this.onTimeFilterChange(e, "LastPeriod");
                          }}
                        />
                        <label className="leftPadding-small">Hours</label>
                      </span>
                      <br />

                      <br />
                    </div>

                    <div className="col-lg-12 mt-3">
                      <RadioButton
                        name="group1"
                        // value={this.state.objTimeFilter.FilterType}
                        value={vFilterType.SpecificRange}

                        checked={this.state.objTimeFilter.FilterType == vFilterType.SpecificRange ? true : false}
                        label="Filter by specific range"
                        onChange={(e: any) => {
                          this.onTimeFilterChange(e, "FilterType");
                        }}


                      />
                      <br />
                      {this.state.objTimeFilter.FilterType == vFilterType.SpecificRange &&
                        <div>
                          <Label className="mr-2 mt-3">From Date</Label>
                          <DateTimePicker className="ml-2"
                            name="txtFromDate"
                            value={this.state.objTimeFilter.FromDateTime.toString() == "" ? null :     new Date(this.state.objTimeFilter.FromDateTime)}
                            format="MM/dd/yyyy HH:mm:ss"
                            formatPlaceholder={{
                              year: "yyyy",
                              month: "MM",
                              day: "dd",
                              hour: "HH",
                              minute: "mm",
                              second: "ss",
                            }}
                            onChange={(e: any) => {
                              this.onTimeFilterChange(e, "FromDateTime");
                            }}
                          >



                          </DateTimePicker>
                          <br />
                          <Label className="mr-2 mt-3">To Date</Label>
                          <DateTimePicker className="ml-2"
                           name="txtToDate"
                           value={this.state.objTimeFilter.ToDateTime.toString() == "" ? null : new Date(this.state.objTimeFilter.ToDateTime)}
                           format="MM/dd/yyyy HH:mm:ss"
                           formatPlaceholder={{
                             year: "yyyy",
                             month: "MM",
                             day: "dd",
                             hour: "HH",
                             minute: "mm",
                             second: "ss",
                           }}
                           onChange={(e: any) => {
                             this.onTimeFilterChange(e, "ToDateTime");
                           }}
                          
                          ></DateTimePicker>
                        </div>
                      }
                    </div>
                    <div className="col-lg-12">
                      <br />
                      <RadioButton
                        name="group1"
                        value={vFilterType.OpenEnded}
                        checked={this.state.objTimeFilter.FilterType == vFilterType.OpenEnded ? true : false}
                        label="Filter data from"
                        onChange={(e: any) => {
                          this.onTimeFilterChange(e, "FilterType");
                        }}
                      />
                      <br />

                      {this.state.objTimeFilter.FilterType == vFilterType.OpenEnded &&
                        <div>
                          <Label className="mr-2 mt-3">Start Date</Label>
                          <DateTimePicker className="ml-2"></DateTimePicker>
                        </div>}


                      <br />
                    </div>
                  </div>
                  <div className="col-4" style={{ width: "100%" }}>
                    <div className="col-lg-12">
                      <h6 className="summaryGroupHeader">Data Down Sampling</h6>
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
                        value={this.state.cmbDownSampleMethod}
                        textField="text"
                        dataItemKey="id"
                        onChange={(e: any) => {
                          this.onDropdownChange(e, "onDropdownChange");
                        }}
                      />
                    </div>

                    <div className="col-lg-12 mt-3">
                      <span className="mr-2">
                        <NumericTextBox
                          value={this.state.objSetup.NoOfDataPoints}
                          format="n2"
                          width="100px"
                          onChange={(e) => {
                            this.onTextChange(e, "NoOfDataPoints");
                          }}
                        />
                        <label className="leftPadding-small">
                          data points per ft
                        </label>
                      </span>
                    </div>
                    <div className="col-lg-12">
                      <br />


                      <Checkbox
                        className="mr-2"
                        value={bmStaticMethod.Min}
                        label={"Min"}
                        checked={this.state.PointSelectionMethod_Min}
                        onChange={(event) => {
                          debugger;
                          this.setState({ PointSelectionMethod_Min: event.value });
                        }}
                      />
                      <br />
                      <Checkbox
                        className="mr-2"
                        label={"Max"}
                        value={bmStaticMethod.Max}
                        checked={this.state.PointSelectionMethod_Max}
                        onChange={(event) => {
                          this.setState({ PointSelectionMethod_Max: event.value });
                        }}
                      />
                      <br />
                      <Checkbox
                        className="mr-2"
                        label={"Avg"}
                        value={bmStaticMethod.Avg}
                        checked={this.state.PointSelectionMethod_Avg}
                        onChange={(event) => {
                          this.setState({ PointSelectionMethod_Avg: event.value });
                        }}
                      />
                    </div>
                  </div>
                  {false && (
                    <div className="col-4" style={{ width: "100%" }}>
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
                            //  value={this.state.objSetup.objProfile.}
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
                          value={this.state.cmbMeanMethod}
                          textField="text"
                          dataItemKey="id"

                          onChange={(e: any) => {
                            this.onDropdownChange(e, "cmbMeanMethod");
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="col-xl-3" style={{ width: "100%" }}>
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
                            value={this.state.objSetup.PKUPColor}
                            view={"gradient"}
                            //   gradientSettings={this.gradientSettings}
                            onChange={(e: any) => {
                              this.onTextChange(e, "PKUPColor");
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-sm-6 col-form-label text-right">
                          Pickup Static Color
                        </label>
                        <div className="col-sm-6">
                          <ColorPicker
                            value={this.state.objSetup.PKUPStaticColor}
                            view={"gradient"}
                            onChange={(e: any) => {
                              this.onTextChange(e, "PKUPStaticColor");
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-sm-6 col-form-label text-right">
                          SlackOff Color
                        </label>
                        <div className="col-sm-6">
                          <ColorPicker
                            value={this.state.objSetup.SLOFColor}
                            view={"gradient"}
                            onChange={(e: any) => {
                              this.onTextChange(e, "SLOFColor");
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-sm-6 col-form-label text-right">
                          SlackOff Static Color
                        </label>
                        <div className="col-sm-6">
                          <ColorPicker
                            value={this.state.objSetup.SLOFStaticColor}
                            view={"gradient"}
                            onChange={(e: any) => {
                              this.onTextChange(e, "SLOFStaticColor");
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-sm-6 col-form-label text-right">
                          ROB Color
                        </label>
                        <div className="col-sm-6">
                          <ColorPicker
                            value={this.state.objSetup.ROBColor}
                            view={"gradient"}
                            onChange={(e: any) => {
                              this.onTextChange(e, "ROBColor");
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-sm-6 col-form-label text-right">
                          On Bottom Torque Color
                        </label>
                        <div className="col-sm-6">
                          <ColorPicker
                            value={this.state.objSetup.ONTorqueColor}
                            view={"gradient"}
                            onChange={(e: any) => {
                              this.onTextChange(e, "ONTorqueColor");
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-sm-6 col-form-label text-right">
                          Off Bottom Torque Color
                        </label>
                        <div className="col-sm-6">
                          <ColorPicker
                            value={this.state.objSetup.OFFTorqueColor}
                            view={"gradient"}
                            onChange={(e: any) => {
                              this.onTextChange(e, "OFFTorqueColor");
                            }}
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
                    justifyContent: "flex-start",
                  }}
                >
                  <div className="col-xl-4">
                    <div className="col-lg-12">
                      <h6 className="summaryGroupHeader">Points Formatting</h6>
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
                          // data={this.state.objTDPointProperties == undefined ? [] : Object.values(this.state.objTDPointProperties)}
                          data={Object.values(this.state.objTDPointProperties) != null ? (Object.values(this.state.objTDPointProperties).map((item: TDPointProp) =>
                            ({ ...item, selected: item.RigState === this.state.objSelectedTDPointProp.RigState })
                          )) : null}
                          onRowClick={(e: any) => { (this.onGridItemChange(e, "objTDPointProperties")) }}
                          selectedField="selected"
                        >
                          {false && <GridColumn
                            field="RigState"
                            width="300px"
                          />}
                          <GridColumn
                            field="RigStateName"
                            width="300px"
                          />
                          {false && <GridColumn
                            field="Color"
                            width="300px"
                          />}

                          {false && <GridColumn
                            field="GroupFunction"
                            width="300px"
                          />}
                        </Grid>
                      </div>
                      <div className="form-group ml-5">
                        <div className="marginLeft">
                          <label>Color</label>

                          <ColorPicker
                            value={utilFunc.intToColor(this.state.objSelectedTDPointProp.Color)}
                            view={"gradient"}
                            onChange={(e: any) => {
                              this.onTextChange(e, "objSelectedTDPointProp");
                            }}
                          />

                        </div>
                        <br />
                        <div className="marginLeft">
                          <label>Grouping Function</label>
                          <br />
                          <DropDownList
                            className=""
                            name="VuMaxUnitID"
                            data={this.cmbRigStateFunction}
                            value={this.state.cmbRigStateFunction}
                            textField="text"
                            dataItemKey="id"
                            onChange={(e: any) => {
                              this.onDropdownChange(e, "cmbRigStateFunction");
                            }}
                          />
                          {/* <MColorPicker value={this.state._workAreaValue} deferred hideTextfield onChange={this.onChangeWorkArea} /> */}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 ml-3">
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
                        value={this.state.cmbHkldPointStyle}
                        textField="text"
                        dataItemKey="id"
                        onChange={(e: any) => {
                          this.onDropdownChange(e, "cmbHkldPointStyle");
                        }}
                      />
                      <br />
                    </div>
                    <div className="col-lg-12 mb-2">
                      <span className="mr-2">
                        <label className="">Size</label>
                        <NumericTextBox
                          value={this.state.objSetup.TDPointSize}
                          format="n2"
                          width="100px"
                          onChange={(e: any) => {
                            this.onTextChange(e, "TDPointSize");
                          }}
                        />
                      </span>
                      <br />
                      <br />
                    </div>
                    <div className="col-lg-12">
                      <h6 className="summaryGroupHeader">Plan Lines</h6>
                      <span className="ml-2">
                        <label className="">Line Thickness</label>
                        <NumericTextBox
                          value={this.state.objSetup.PlanLineWidth}
                          format="n2"
                          width="100px"
                          onChange={(e: any) => {
                            this.onTextChange(e, "PlanLineWidth");
                          }}
                        />
                      </span>
                    </div>
                  </div>
                  <div className="col-xl-3">
                    <div className="col-lg-12">
                      <h6 className="summaryGroupHeader">Broomstick Points</h6>
                    </div>
                    <div className="col-lg-12">
                      <label className="mr-3">Style</label>
                      <DropDownList
                        className="marginLeft-small"
                        name="cmbBMPointStyle"
                        data={this.cmbBMPointStyle}
                        value={this.state.cmbBMPointStyle}
                        textField="text"
                        dataItemKey="id"
                        onChange={(e: any) => {
                          this.onDropdownChange(e, "cmbBMPointStyle");
                        }}
                      />

                      <br />
                    </div>
                    <div className="col-lg-12">
                      <span className="mr-2">
                        <label className="">Size</label>
                        <NumericTextBox
                          value={this.state.objSetup.BMPointSize}
                          format="n2"
                          width="100px"
                          onChange={(e: any) => {
                            this.onTextChange(e, "BMPointSize");
                          }}
                        />
                      </span>
                    </div>
                    <div className="col-lg-12 mt-4">
                      <h6 className="summaryGroupHeader">
                        Points Transparency
                        <NumericTextBox
                          className="ml-3"
                          value={this.state.objSetup.Transparency}
                          format="n2"
                          width="100px"
                          onChange={(e: any) => {
                            this.onTextChange(e, "Transparency");
                          }}
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
                  value={this.state.cmbBroomStickPoints}
                  textField="text"
                  dataItemKey="id"
                  onChange={(e: any) => {
                    this.onDropdownChange(e, "cmbBroomStickPoints");
                  }}
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
                      <div className="row ml-2" style={{ width: "100%" }}>
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
                                value={this.state.cmbPickupPumpChannel}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbPickupPumpChannel");
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              Pump Cut Off Value
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={this.state.objSetup.pickupCutOffValue}
                                format="n2"
                                width="100px"
                                onChange={(e) => {
                                  this.onTextChange(e, "pickupCutOffValue");
                                }}
                              />
                              <label className="leftPadding-small"> psi</label>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              RPM Cut Off
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={this.state.objSetup.pickupRPMCutOff}
                                format="n2"
                                width="100px"
                                onChange={(e) => {
                                  this.onTextChange(e, "pickupRPMCutOff");
                                }}
                              />
                              <label className="leftPadding-small"> RPM</label>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              Max. Block Movement
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={
                                  this.state.objSetup.pickupMaxBlockMovement
                                }
                                format="n2"
                                onChange={(e) => {
                                  this.onTextChange(e, "pickupMaxBlockMovement");
                                }}
                              />
                              <label className="leftPadding-small"> ft</label>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              Min. Block Movement
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={
                                  this.state.objSetup.pickupMinBlockMovement
                                }
                                format="n2"
                                width="100px"
                                onChange={(e) => {
                                  this.onTextChange(e, "pickupMinBlockMovement");
                                }}
                              />
                              <label className="leftPadding-small"> ft</label>
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
                                value={this.state.cmbPickupPumpStatus}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbPickupPumpStatus");
                                }}
                              />{" "}
                              <label className="leftPadding-small"> psi</label>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div
                            className="col-xl-12"
                            style={{ width: "1000px", display: "flex" }}
                          >
                            <div className="form-group">
                              <h6 className="summaryGroupHeader">Rig States</h6>
                              <Grid
                                onItemChange={(e: any) => { (this.onGridItemChange(e, "grdPickupRigState")) }}
                                style={{ height: "150px" }}
                                data={Object.values(this.state.grdPickupRigState)}

                              >

                                <Column field="Selected" headerClassName="text-center" className="text-center" title="Selected" width="90px"
                                  cell={props => {

                                    return (
                                      <td className="text-center">
                                        <Checkbox
                                          checked={props.dataItem[props.field]}
                                          value={props.dataItem[props.field]}
                                          onChange={e => {
                                            props.onChange({
                                              dataItem: props.dataItem,
                                              dataIndex: props.dataIndex,
                                              field: props.field,
                                              syntheticEvent: e.syntheticEvent,
                                              value: e.value
                                            });
                                          }}
                                        />

                                      </td>
                                    );
                                  }}
                                />

                                <GridColumn width="300px" field="Name" />
                              </Grid>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-3" style={{ width: "100%" }}>
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
                                value={this.state.cmbStaticPointSelectionMethod}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbStaticPointSelectionMethod");
                                }}
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
                                value={this.state.cmbPickupDynamicMethod}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbPickupDynamicMethod");
                                }}
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
                                value={this.state.cmbPickupMultiMethod}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbPickupMultiMethod");
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group row mt-1">
                            <div className="col-sm-8">
                              <Checkbox
                                className="mr-2"
                                name="FilterData"
                                label="Filter data by finding Maximum"
                                checked={
                                  this.state.objSetup.PULocalMaxFilter ? true : false
                                }
                                value={this.state.objSetup.PULocalMaxFilter}
                                onChange={(e) =>
                                  this.onTextChange(e, "PULocalMaxFilter")
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabStripTab>
                <TabStripTab title="Slack Off">
                  <div className="row">
                    <div className="row ml-2">
                      <div className="row ml-2" style={{ width: "100%" }}>
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
                                value={this.state.cmbSlackOffPumpChannel}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbSlackOffPumpChannel");
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              Pump Cut Off Value
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={this.state.objSetup.slackOffCutOffValue}
                                format="n2"
                                width="100px"
                                onChange={(e) => {
                                  this.onTextChange(e, "slackOffCutOffValue");
                                }}
                              />
                              <label className="leftPadding-small"> psi</label>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              RPM Cut Off
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={this.state.objSetup.slackOffRPMCutOff}
                                format="n2"
                                width="100px"
                                onChange={(e) => {
                                  this.onTextChange(e, "slackOffCutOffValue");
                                }}
                              />
                              <label className="leftPadding-small"> RPM</label>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              Max. Block Movement
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={
                                  this.state.objSetup.slackOffMaxBlockMovement
                                }
                                format="n2"
                                width="100px"
                                onChange={(e) => {
                                  this.onTextChange(e, "slackOffCutOffValue");
                                }}
                              />
                              <label className="leftPadding-small"> ft</label>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              Min. Block Movement
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={
                                  this.state.objSetup.slackOffMinBlockMovement
                                }
                                format="n2"
                                width="100px"
                                onChange={(e) => {
                                  this.onTextChange(e, "slackOffCutOffValue");
                                }}
                              />
                              <label className="leftPadding-small"> ft</label>
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
                                value={this.state.cmbSlackOffPumpStatus}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbSlackOffPumpStatus");
                                }}
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
                              <h6 className="summaryGroupHeader">Rig States</h6>
                              <Grid
                                onItemChange={(e: any) => { (this.onGridItemChange(e, "grdSlackOffRigState")) }}
                                style={{ height: "150px" }}
                                data={this.state.grdSlackOffRigState}
                              >
                                <Column field="Selected" headerClassName="text-center" className="text-center" title="Selected" width="90px"
                                  cell={props => {

                                    return (
                                      <td className="text-center">
                                        <Checkbox
                                          checked={props.dataItem[props.field]}
                                          value={props.dataItem[props.field]}
                                          onChange={e => {
                                            props.onChange({
                                              dataItem: props.dataItem,
                                              dataIndex: props.dataIndex,
                                              field: props.field,
                                              syntheticEvent: e.syntheticEvent,
                                              value: e.value
                                            });
                                          }}
                                        />

                                      </td>
                                    );
                                  }}
                                />

                                <GridColumn width="300px" field="Name" />
                              </Grid>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-3 ml-2" style={{ width: "100%" }}>
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
                                value={this.state.cmbStaticPointSelectionMethod}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbStaticPointSelectionMethod");
                                }}
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
                                value={this.state.cmbSlackOffDynamicMethod}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbSlackOffDynamicMethod");
                                }}
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
                                value={this.state.cmbSlackOffMultiMethod}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbSlackOffMultiMethod");
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group row mt-1">
                            <div className="col-sm-8">
                              <Checkbox
                                className="mr-2"
                                name="FilterData"
                                label="Filter data by finding Minimum"
                                checked={
                                  this.state.objSetup.SOLocalMinFilter
                                }
                                value={this.state.objSetup.SOLocalMinFilter}
                                onChange={(e) =>
                                  this.onTextChange(e, "SOLocalMinFilter")
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabStripTab>
                <TabStripTab title="Rotate">
                  <div className="row">
                    <div className="row ml-2">
                      <div className="row ml-2" style={{ width: "100%" }}>
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
                                value={this.state.cmbRotatePumpChannel}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbRotatePumpChannel");
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              Pump Cut Off Value
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={this.state.objSetup.rotateCutOffValue}
                                format="n2"
                                width="100px"
                                onChange={(e) => {
                                  this.onTextChange(e, "rotateCutOffValue");
                                }}
                              />
                              <label className="leftPadding-small"> psi</label>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              Min. RPM Cut Off
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={this.state.objSetup.rotateRPMCutOff}
                                format="n2"
                                width="100px"
                                onChange={(e) => {
                                  this.onTextChange(e, "rotateRPMCutOff");
                                }}
                              />
                              <label className="leftPadding-small"> RPM</label>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-sm-4 col-form-label text-right">
                              Max. RPM Cut Off
                            </label>
                            <div className="col-sm-8">
                              <NumericTextBox
                                value={this.state.objSetup.rotateMaxRPM}
                                format="n2"
                                width="100px"
                                onChange={(e) => {
                                  this.onTextChange(e, "rotateMaxRPM");
                                }}
                              />
                              <label className="leftPadding-small"> RPM</label>
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
                                value={this.state.cmbRotatePumpStatus}
                                textField="text"
                                dataItemKey="id"
                                onChange={(e: any) => {
                                  this.onDropdownChange(e, "cmbRotatePumpStatus");
                                }}
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
                              <h6 className="summaryGroupHeader">Rig States</h6>
                              <Grid
                                onItemChange={(e: any) => { (this.onGridItemChange(e, "grdRotateRigState")) }}
                                style={{ height: "150px" }}
                                data={this.state.grdRotateRigState}
                              >
                                <Column field="Selected" headerClassName="text-center" className="text-center" title="Selected" width="90px"
                                  cell={props => {

                                    return (
                                      <td className="text-center">
                                        <Checkbox
                                          checked={props.dataItem[props.field]}
                                          value={props.dataItem[props.field]}
                                          onChange={e => {
                                            props.onChange({
                                              dataItem: props.dataItem,
                                              dataIndex: props.dataIndex,
                                              field: props.field,
                                              syntheticEvent: e.syntheticEvent,
                                              value: e.value
                                            });
                                          }}
                                        />

                                      </td>
                                    );
                                  }}
                                />

                                <GridColumn width="300px" field="Name" />
                              </Grid>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-3 ml-0" style={{ width: "100%" }}>
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
                                value={this.state.objSetup.ROBMaxHkldTolerance}
                                format="n2"
                                width="100px"
                              // onChange={(event) => {
                              //   this.disableRealTime();
                              //   this.setState({
                              //     MaxConnTime: event.target.value,
                              //   });
                              // }}
                              />
                              <label className="leftPadding-small">klbf</label>
                              <label className="leftPadding-small">Over</label>
                              <NumericTextBox
                                value={this.state.objSetup.TolerancePoints}
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
                      <div className="row mt-3" style={{ width: "100%" }}>
                        <div className="col-6">
                          <Checkbox
                            className="mr-2 ml-5"
                            name="FilterData"
                            label="Don't plot ROB if no stable hookload values found"
                            // checked={
                            //   this.state.objTripAnalyzerSelection.RemoveFillUpTime
                            // }
                            value={
                              this.state.objSetup.DontPlotROBWithNoStability
                            }
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
                              value={this.state.cmbROBMultiMethod}
                              textField="text"
                              dataItemKey="id"
                              onChange={(e: any) => {
                                this.onDropdownChange(e, "cmbROBMultiMethod");
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabStripTab>
              </TabStrip>
              <div className="row" style={{ width: "100%" }}>
                <div className="form-group row mt-5 ml-2">
                  <label className="ml-5">
                    Depth Movement Time Threshold Width
                  </label>
                  <NumericTextBox
                    className="ml-2"
                    value={this.state.objSetup.MaxPauseTime}
                    format="n2"
                    width="100px"
                    onChange={(e) =>
                      this.onTextChange(e, "MaxPauseTime")
                    }
                  />
                  <label className="leftPadding-small">Seconds</label>
                </div>
              </div>
              <div className="row mt-1" style={{ width: "100%" }}>
                <div className="form-group row mt-1 ml-5 ">
                  <Checkbox
                    className="mr-2"
                    name="FilterData"
                    label="Only plot points if pick Up/Slack Off and Rotate points found in connection"
                    checked={
                      this.state.objSetup.DontPlotROBWithNoStability
                    }
                    value={this.state.objSetup.DontPlotROBWithNoStability}
                    onChange={(e) =>
                      this.onTextChange(e, "DontPlotROBWithNoStability")
                    }
                  />
                </div>
              </div>
              <div className="row mt-1" style={{ width: "100%" }}>
                <div className="form-group row mt-t ml-5 ">
                  <Checkbox
                    className="mr-2"
                    name="FilterData"
                    label="Ploat Off Bottom Torque Points"
                    checked={
                      this.state.objSetup.PlotOffBottom
                    }
                    value={this.state.objSetup.PlotOffBottom}
                    onChange={(e) =>
                      this.onTextChange(e, "PlotOffBottom")
                    }
                  />
                  <Checkbox
                    className="ml-2"
                    name="FilterData"
                    label="Ploat On Bottom Torque Points"
                    checked={
                      this.state.objSetup.PlotOnBottom
                    }
                    value={this.state.objSetup.PlotOnBottom}
                    onChange={(e) =>
                      this.onTextChange(e, "PlotOnBottom")
                    }
                  />
                </div>
              </div>
              <div className="row mt-1" style={{ width: "100%" }}>
                <div className="form-group row mt-t ml-5 ">
                  <Checkbox
                    className="mr-2"
                    name="FilterData"
                    label="Show Multiple Points"
                    checked={
                      this.state.objSetup.ShowMultiplePoints
                    }
                    onChange={(e) =>
                      this.onTextChange(e, "ShowMultiplePoints")
                    }
                  />
                  <Checkbox
                    className="ml-2"
                    name="FilterData"
                    label="Enforce SO<ROB<PU rule"
                    checked={
                      this.state.objSetup.EnforceRule
                    }
                    onChange={(e) =>
                      this.onTextChange(e, "EnforceRule")
                    }
                  />
                </div>
              </div>
            </TabStripTab>
          </TabStrip>
        </div>
      </div>
    );
  }
}

export default BroomstickSetup;
