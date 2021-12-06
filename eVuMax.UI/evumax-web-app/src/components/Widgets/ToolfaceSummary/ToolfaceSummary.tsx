import React, { Component } from "react";
import * as d3 from "d3";
import $ from "jquery";
import {
  Chart,
  curveStyle,

} from "../../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";

import {
  Axis,

  axisPosition,
} from "../../../eVuMaxObjects/Chart/Axis";
import DataSelector from "../../Common/DataSelector";

import {
  DataSeries,
  dataSeriesType,
  pointStyle,
} from "../../../eVuMaxObjects/Chart/DataSeries";

import "@progress/kendo-react-layout";

import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import axios from "axios";

import {

  NumericTextBox,
  Checkbox,
  ColorPicker,
  Switch,

} from "@progress/kendo-react-inputs";



import {
  Grid,
  GridColumn as Column,
  GridColumn,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { TabStrip, TabStripTab, DropDownList, Button, ListView, ListViewHeader } from "@progress/kendo-react-all";


import "./ToolfaceSummary.css";
import { faListAlt, faPlus, faSearchMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ChartEventArgs } from "../../../eVuMaxObjects/Chart/ChartEventArgs";

import GlobalMod from "../../../objects/global";
import { confirmAlert } from "react-confirm-alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import STDChannels from "../../standardChannels/stdChannels";
import { comboData } from "../../../eVuMaxObjects/UIObjects/comboData";

import { Util } from "../../../Models/eVuMax";
//Nishant 28/07/2021
import * as util from "../../../utilFunctions/utilFunctions";
import DataSelector_ from "../../Common/DataSelector_";
import { ClientLogger } from "../../ClientLogger/ClientLogger";

import NotifyMe from 'react-notification-timeline';
import DataSelectorInfo from "../../Common/DataSelectorInfo";



let _gMod = new GlobalMod();

// LOG_TYPE=1 THEN 'Time Log' WHEN LOG_TYPE=2 THEN 'Depth Log'

class ToolfaceSummary extends Component {
  intervalID: NodeJS.Timeout | undefined;
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;
    this.objLogger.wellID = this.WellId;
  }

  objLogger: ClientLogger = new ClientLogger("ToolfaceSummary", _gMod._userId);
  state = {
    warningMsg: [],
    objDataSelector: new DataSelector_(),
    WellName: "",
    selected: 0,
    selectedMnemonic: "",
    toolfaceData: null,
    showAdditionalChannelWindow: false,
    isVisibleFormat: false,

    GeoDrlgWindowID: 0,
    ROPDrlgWindowID: 0,
    //GEO
    ShowDrillingWindow: false,
    GeoDrlgWindowData: [],
    GeoDrlgWindowColor: util.getRandomColor(),
    GeoDrlgWindowTrans: 50,

    // ROP
    ShowROPDrillingWindow: false,
    ROPDrlgWindowData: [],
    ROPDrlgWindowColor: util.getRandomColor(),
    ROPDrlgWindowTrans: 50,

    GTF: {
      Mnemonic: "GTF",
      dataMnemonic: "",
      lineStyle: 0,
      lineWidth: 1,
      //lineColor: util.getRandomColor(),
      lineColor: "#499DF5",
      visible: true
    },
    MTF: {
      Mnemonic: "MTF",
      dataMnemonic: "",
      lineStyle: 0,
      lineWidth: 2,
      //lineColor: util.getRandomColor(),
      lineColor: "#FF8C00",
      visible: true
    },
    PlanDLS: {
      Mnemonic: "PlanDLS",
      dataMnemonic: "",
      lineStyle: 0,
      lineWidth: 2,
      lineColor: "#B8B8B8",  //util.getRandomColor(),
      visible: true //14-10-2021
    },
    ActualDLS: {
      Mnemonic: "ActualDLS",
      dataMnemonic: "",
      lineStyle: 0,
      lineWidth: 2,
      lineColor: "#B8B8B8", // util.getRandomColor(),
      visible: true
    },
    PlanTVD: {
      Mnemonic: "PlanTVD",
      dataMnemonic: "",
      lineStyle: 0,
      lineWidth: 2,
      lineColor: "#FF0000", //util.getRandomColor(),
      visible: true
    },
    ActualTVD: {
      Mnemonic: "ActualTVD",
      dataMnemonic: "",
      lineStyle: 0,
      lineWidth: 2,
      lineColor: "#008037", //util.getRandomColor(),
      visible: true
    },
    MY: {
      Mnemonic: "MY",
      dataMnemonic: "",
      lineStyle: 0,
      lineWidth: 2,
      lineColor: "#FF0000",
      visible: true
    },

    adnlChannels: [] as any[],
    primaryPlotList: [],
    LineStyleList: [],

    // Line Formating..

    LineStyle: new comboData("", "-1"),
    LineWidth: 2,
    LineColor: "#007bff",
    LineVisible: true,

    // Selected List
    SelectedItem: {} as any,
    isDirty: false,

    // Settings
    ShowFormationTops: true,
    MTFVector: false,
    GTFVector: false,
    FilterByMinSlideLength: false,
    MinSlideLength: 3,
    MinRotationFootage: 3,
    convertScale: false,
    HighlightColor: util.getRandomColor(),
    HighlightTrans: 80,
    Direction: 0,

    // Table

    SlidePercent: 0,
    SlideROP: 0,
    RotaryPercent: 0,
    RotaryROP: 0,
    OutOfDrlgWindow: 0,
    OutOfROPWindow: 0,
    isRealTime: false as boolean,
  };

  WellId: string = "";
  objToolfaceData: any; //Stores Connection Summary Data
  objUserSettings: any = {};

  //local variables
  _isLoading: boolean = false;
  objChart: Chart;
  objAdnlChart: Chart;

  selectionType: string = "-1";
  fromDate: Date = null;
  toDate: Date = null;
  fromDepth: number = 0;
  toDepth: number = 0;
  refreshHrs: number = 24;
  Warnings: string = ""; //Nishant 18/10/2021
  _selectedItem: any;


  ////Nishant
  selectionChanged = async (paramDataSelector: DataSelector_, paramRefreshHrs: boolean = false) => {

    let realtimeStatus: boolean = paramRefreshHrs;

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
    if (this.state.isRealTime) {
      this.intervalID = setInterval(this.loadData.bind(this), 15000);
    } else {
      this.AxiosSource.cancel();
      await clearInterval(this.intervalID);
      this.intervalID = null;
      this.loadData();
    }

  }


  // selectionChanged = (
  //   pselectedval: string,
  //   pfromDate: Date,
  //   ptoDate: Date,
  //   pfromDepth: number,
  //   ptoDepth: number
  // ) => {
  //   try {
  //     this.selectionType = pselectedval;
  //     this.fromDate = pfromDate;
  //     this.toDate = ptoDate;
  //     this.fromDepth = pfromDepth;
  //     this.toDepth = ptoDepth;

  //     // console.log(
  //     //   "From Date " +
  //     //   moment(this.fromDate).format("d-MMM-yyyy HH:mm:ss") +
  //     //   " To Date " +
  //     //   moment(this.toDate).format("d-MMM-yyyy HH:mm:ss")
  //     // );

  //     this.loadData();
  //   } catch (error) { }
  // };

  getLineStyle = () => {
    let styleList: comboData[] = [];

    styleList.push(new comboData("Solid", "0"));
    styleList.push(new comboData("Dash", "1"));
    styleList.push(new comboData("Dot", "2"));
    styleList.push(new comboData("Dash Dot", "3"));
    styleList.push(new comboData("Dash Dot Dot", "4"));
    styleList.push(new comboData("Small Dots", "5"));

    this.setState({
      LineStyleList: styleList,
    });

    //this.forceUpdate(); //change on 09-02-2021
  };

  OnChange(e: any, field: string) {
    this.disableRealTime(); //prath 11-11-2021

    // Line formatting
    if (field == "LineColor") {
      this.setState({ LineColor: e.value, isDirty: true });
    }
    if (field == "LineWidth") {
      this.setState({ LineWidth: e.value, isDirty: true });
    }
    if (field == "LineStyle") {
      this.setState({ LineStyle: e.value, isDirty: true });
    }
    if (field == "LineVisible") {
      this.setState({ LineVisible: e.value, isDirty: true });
    }

    // ************************************* ROP & Drilling

    // Drilling
    if (field == "ShowDrillingWindow") {
      this.setState({ ShowDrillingWindow: e.value });
    }
    if (field == "GeoDrlgWindowColor") {
      this.setState({ GeoDrlgWindowColor: e.value });
    }
    if (field == "GeoDrlgWindowTrans") {
      this.setState({ GeoDrlgWindowTrans: e.value });
    }

    // ROP
    if (field == "ShowROPDrillingWindow") {
      this.setState({ ShowROPDrillingWindow: e.value });
    }

    if (field == "ROPDrlgWindowColor") {
      this.setState({ ROPDrlgWindowColor: e.value });
    }

    if (field == "ROPDrlgWindowTrans") {
      this.setState({ ROPDrlgWindowTrans: e.value });
    }

    // Settings

    if (field == "ShowFormationTops") {
      this.setState({ ShowFormationTops: e.value });
    }

    if (field == "MTFVector") {
      this.setState({ MTFVector: e.value });
    }

    if (field == "GTFVector") {
      this.setState({ GTFVector: e.value });
    }

    if (field == "FilterByMinSlideLength") {
      this.setState({ FilterByMinSlideLength: e.value });
    }

    if (field == "MinSlideLength") {
      this.setState({ MinSlideLength: e.value });
    }

    if (field == "MinRotationFootage") {
      this.setState({ MinRotationFootage: e.value });
    }

    if (field == "convertScale") {
      this.setState({ convertScale: e.value });
    }

    if (field == "HighlightColor") {
      this.setState({ HighlightColor: e.value });
    }

    if (field == "HighlightTrans") {
      this.setState({ HighlightTrans: e.value });
    }

    if (field == "Direction") {
      this.setState({ Direction: e.value });
    }

    //this.forceUpdate(); //change on 09-02-2021
  }

  getPrimaryList = () => {
    let primaryList: any = [];

    primaryList.push(this.state.GTF);
    primaryList.push(this.state.MTF);
    primaryList.push(this.state.PlanDLS);
    primaryList.push(this.state.ActualDLS);
    primaryList.push(this.state.PlanTVD);
    primaryList.push(this.state.ActualTVD);
    primaryList.push(this.state.MY);

    this.setState({
      primaryPlotList: primaryList,
    });
  };

  GeogrdItemChange = (e: any) => {
    e.dataItem[e.field] = e.value;

    let newData: any = Object.values([...this.state.GeoDrlgWindowData]);
    let index = newData.findIndex((item: any) => item.SRNO === e.dataItem.SRNO); // use unique value like ID
    newData[index][e.field] = e.value;

    if (index > 0) {
      if (e.field == "StartMD") {
        newData[index - 1]["EndMD"] = e.value;
      }
    }

    this.setState({ GeoDrlgWindowData: newData });
  };

  ROPgrdItemChange = (e: any) => {
    e.dataItem[e.field] = e.value;

    let newData: any = Object.values([...this.state.ROPDrlgWindowData]);
    let index = newData.findIndex((item: any) => item.SRNO === e.dataItem.SRNO); // use unique value like ID
    newData[index][e.field] = e.value;

    if (index > 0) {
      if (e.field == "StartMD") {
        newData[index - 1]["EndMD"] = e.value;
      }
    }

    this.setState({ ROPDrlgWindowData: newData });
  };

  GeogrdRowClick = (event: any) => {
    this.setState({
      GeoDrlgWindowID: event.dataItem.SRNO,
    });

    //this.forceUpdate(); //change on 09-02-2021
  };

  ROPgrdRowClick = (event: any) => {
    this.setState({
      ROPDrlgWindowID: event.dataItem.SRNO,
    });
    //this.forceUpdate(); //change on 09-02-2021
  };

  disableRealTime = () => {
    try {
      if (this.state.isRealTime) {
        this.setState({
          isRealTime: false //prath 10-Oct-20201
        });
        sessionStorage.setItem("realTimeToolfaceSummary", "false");
        this.AxiosSource.cancel();
        clearInterval(this.intervalID);
        this.intervalID = null;
      }

    } catch (error) {

    }
  }
  addGeoDrlgWindowData = () => {
    try {

      this.disableRealTime();  //11-11-2021 prath

      let newRow = {
        StartMD: 0,
        EndMD: 0,
        TopWindow: 0,
        BottomWindow: 0,
        SRNO: 0,
      };

      let editData: any = this.state.GeoDrlgWindowData;

      if (this.state.GeoDrlgWindowData.length > 0) {
        // newRow.StartMD = editData[this.state.GeoDrlgWindowData.length-1].StartMD+1;
        newRow.SRNO = this.state.GeoDrlgWindowData.length + 1;
      } else {
        newRow.SRNO = 1;
        //  newRow.StartMD = 1;
      }

      editData.push(newRow);

      this.setState({
        GeoDrlgWindowData: editData,
        GeoDrlgWindowID: newRow.SRNO,
      });

      //this.forceUpdate(); //change on 09-02-2021
    } catch { }
  };

  addROPDrlgWindowData = () => {
    try {

      this.disableRealTime(); //11-11-2021 prath

      let newRow = {
        StartMD: 0,
        EndMD: 0,
        TopWindow: 0,
        BottomWindow: 0,
        SRNO: 0,
      };

      let editData: any = this.state.ROPDrlgWindowData;

      if (this.state.ROPDrlgWindowData.length > 0) {
        newRow.SRNO = this.state.ROPDrlgWindowData.length + 1;
      } else {
        newRow.SRNO = 1;
      }

      editData.push(newRow);
      this.setState({
        ROPDrlgWindowData: editData,
        ROPDrlgWindowID: newRow.SRNO,
      });

      //this.forceUpdate(); //change on 09-02-2021
    } catch { }
  };

  cmdRemoveGeoDrlgWindowRow = (event: any, rowData: any) => {
    confirmAlert({
      //title: 'eVuMax',
      message: "Are you sure you want to remove?",
      childrenElement: () => <div />,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            if (this.state.isRealTime) {
              this.setState({
                isRealTime: false //prath 10-Oct-20201
              });
              sessionStorage.setItem("realTimeToolfaceSummary", "false");
              this.AxiosSource.cancel();
              clearInterval(this.intervalID);
              this.intervalID = null;
            }


            let geoData = this.state.GeoDrlgWindowData;
            let objRow = rowData;
            let srNo = objRow.SRNO;
            let index = geoData.findIndex((d) => d.SRNO === srNo); //find index in your array
            geoData.splice(index, 1); //remove element from array
            this.setState({
              GeoDrlgWindowData: geoData,
            });
          },
        },
        {
          label: "No",
          onClick: () => null,
        },
      ],
    });
  };

  cmdRemoveROPDrlgWindowRow = (event: any, rowData: any) => {
    confirmAlert({
      //title: 'eVuMax',
      message: "Are you sure you want to remove?",
      childrenElement: () => <div />,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            let ROPData = this.state.ROPDrlgWindowData;
            let objRow = rowData;
            let srNo = objRow.SRNO;
            let index = ROPData.findIndex((d) => d.SRNO === srNo); //find index in your array
            ROPData.splice(index, 1); //remove element from array
            this.setState({
              ROPDrlgWindowData: ROPData,
            });
          },
        },
        {
          label: "No",
          onClick: () => null,
        },
      ],
    });
  };

  //Cancel all Axios Request
  AxiosSource = axios.CancelToken.source();
  AxiosConfig = { cancelToken: this.AxiosSource.token };

  componentWillUnmount() {
    this.AxiosSource.cancel();
    clearInterval(this.intervalID);
    this.intervalID = null;
  }
  //==============


  componentWillUpdate() {
    _gMod = new GlobalMod();
    if (_gMod._userId == "" || _gMod._userId == undefined) {
      window.location.href = "/evumaxapp/";
      return;
    }

  }



  async componentDidMount() {
    try {
      //this.objLogger.SendLog("Logger Test");
      window.addEventListener("resize", this.displayData);
      await this.getPrimaryList();
      // this.getLineStyle();

      //this.getPrimaryList(); commented on 14-10-2021
      this.getLineStyle();

      //initialize chart
      this.objChart = new Chart(this, "Toolface");

      this.objChart.ContainerId = "toolface";

      this.objChart.leftAxis().AutoScale = false;
      this.objChart.leftAxis().Min = 0;
      this.objChart.leftAxis().Max = 10000;
      this.objChart.leftAxis().Inverted = true;
      this.objChart.leftAxis().bandScale = false;
      this.objChart.leftAxis().ShowLabels = true;
      this.objChart.leftAxis().ShowTitle = true;
      this.objChart.leftAxis().Title = "TVD";
      this.objChart.leftAxis().ShowSelector = false;
      this.objChart.leftAxis().DisplayOrder = 1;
      this.objChart.leftAxis().Visible = true;

      this.objChart.bottomAxis().AutoScale = false;
      this.objChart.bottomAxis().bandScale = false;
      this.objChart.bottomAxis().Min = 10000;
      this.objChart.bottomAxis().Max = 20000;
      this.objChart.bottomAxis().Title = "MD";
      this.objChart.bottomAxis().ShowLabels = true;
      this.objChart.bottomAxis().ShowTitle = true;
      this.objChart.bottomAxis().LabelAngel = 90;
      this.objChart.bottomAxis().ShowSelector = false;
      this.objChart.bottomAxis().IsDateTime = false;
      this.objChart.bottomAxis().Visible = true;

      this.objChart.rightAxis().AutoScale = false;
      this.objChart.rightAxis().bandScale = false;
      this.objChart.rightAxis().Min = -180;
      this.objChart.rightAxis().Max = 180;
      this.objChart.rightAxis().Title = "GTF/MTF";
      this.objChart.rightAxis().ShowLabels = true;
      this.objChart.rightAxis().ShowTitle = true;
      this.objChart.rightAxis().ShowSelector = false;
      this.objChart.rightAxis().IsDateTime = false;
      this.objChart.rightAxis().Visible = true;

      this.objChart.MarginLeft = 40;
      this.objChart.MarginBottom = 40;
      this.objChart.MarginTop = 10;
      this.objChart.MarginRight = 30;

      this.objChart.initialize();
      this.objChart.LegendPosition = 4;  //1 (left), 2 (right), 3 (top), 4 (bottom)
      this.objChart.reDraw();
      this.objChart.onBeforeSeriesDraw.subscribe((e, i) => {
        this.onBeforeDrawSeries(e, i);
      });

      this.objChart.onAfterSeriesDraw.subscribe((e, i) => {
        this.onAfterSeriesDraw(e, i);
      });

      //this.loadData(); //change on 09-02-2021

      //initialize chart for additional channels
      this.objAdnlChart = new Chart(this, "Adnl_Channels");
      this.objAdnlChart.ContainerId = "adnl_channels";

      this.objAdnlChart.leftAxis().Visible = false;
      this.objAdnlChart.rightAxis().Visible = false;
      this.objAdnlChart.topAxis().Visible = false;

      this.objAdnlChart.bottomAxis().AutoScale = true;
      this.objAdnlChart.bottomAxis().bandScale = false;
      this.objAdnlChart.bottomAxis().Min = 10000;
      this.objAdnlChart.bottomAxis().Max = 20000;
      this.objAdnlChart.bottomAxis().Title = "MD";
      this.objAdnlChart.bottomAxis().ShowLabels = false;
      this.objAdnlChart.bottomAxis().ShowTitle = false;
      this.objAdnlChart.bottomAxis().LabelAngel = 90;
      this.objAdnlChart.bottomAxis().ShowSelector = false;
      this.objAdnlChart.bottomAxis().IsDateTime = false;
      this.objAdnlChart.bottomAxis().GridVisible = false;
      this.objAdnlChart.bottomAxis().Visible = true;

      this.objAdnlChart.MarginLeft = 40;
      this.objAdnlChart.MarginBottom = 0;
      this.objAdnlChart.MarginTop = 0;
      this.objAdnlChart.MarginRight = 0;

      this.objAdnlChart.initialize();
      this.objAdnlChart.reDraw();

      this.loadData();

      //RealTime 
      let isRealtimeRunning = sessionStorage.getItem("realTimeToolfaceSummary");
      if (isRealtimeRunning == "true") {
        await this.setState({ isRealTime: !this.state.isRealTime });
        this.intervalID = setInterval(this.loadData.bind(this), 15000);
      }
      //==============


    } catch (error) { }
  }

  componentDidUpdate() {
    try {
      // this.refreshChart();
    } catch (error) { }
  }



  onAfterSeriesDraw = (e: ChartEventArgs, i: number) => {
    try {
      debugger;
      d3.selectAll(".formationTop-" + this.objChart.Id).remove();
      d3.selectAll(".formationTopText-" + this.objChart.Id).remove();
      debugger;
      let tripOutlineData = [];
      let tripOutArr = [];

      if (this.objToolfaceData.formationTops.length > 0 && this.state.ShowFormationTops == true) {

        for (let index = 0; index < this.objToolfaceData.formationTops.length; index++) {
          const depth = this.objToolfaceData.formationTops[index].Depth;
          let x1 = this.objChart.bottomAxis().ScaleRef(depth);
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
            .style("fill", this.objToolfaceData.formationTops[index].Color)
            .style("stroke", this.objToolfaceData.formationTops[index].Color)
            .style("stroke-dasharray", "5,5");


          this.objChart.SVGRef.append("g")
            .attr("class", "formationTopText-" + this.objChart.Id)
            .attr(
              "transform",
              "translate(" + (x1 + 2) + "," + (y2 - 20) + ") rotate(-90)"
            )
            .append('text')
            .style('background-color', 'green')
            .attr('class', 'axis-title')

            .attr('dy', '.75em')
            .text(this.objToolfaceData.formationTops[index].TopName);
        }
      }

    } catch (error) { }
  };

  getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  onBeforeDrawSeries = (e: ChartEventArgs, i: number) => {
    try {

      d3.selectAll(".drlg_window").remove();
      d3.selectAll(".rop_window").remove();
      d3.selectAll(".rotary_sections").remove();
      d3.selectAll(".gtf_vector").remove();
      d3.selectAll(".mtf_vector").remove();


      //Highlight GTF Vectors
      if (this.state.GTFVector) {
        for (let i = 0; i < this.objToolfaceData.SlideTable.length; i++) {
          let objItem = this.objToolfaceData.SlideTable[i];

          let GTFEff: number = objItem["GTF_VectorEff"];
          let GTFAngle: number = objItem["GTF_VectorAngle"];

          let x1Depth: number = objItem["From Depth"];
          let x2Depth: number = objItem["To Depth"];

          if (GTFEff == -999.25 && GTFAngle == -999.25) {
            //No values found ...
            continue;
          }

          let x1Pos = this.objChart.bottomAxis().ScaleRef(x1Depth);
          let x2Pos = this.objChart.bottomAxis().ScaleRef(x2Depth);

          if (
            (x1Pos >= this.objChart.__chartRect.left &&
              x1Pos <= this.objChart.__chartRect.right) ||
            (x2Pos >= this.objChart.__chartRect.left &&
              x2Pos <= this.objChart.__chartRect.right)
          ) {
            //Inside the range ...
          } else {
            //Out of range ...
            continue;
          }

          let limitX1: number = this.objChart
            .bottomAxis()
            .ScaleRef(this.objChart.bottomAxis().Min);
          let limitX2: number = this.objChart
            .bottomAxis()
            .ScaleRef(this.objChart.bottomAxis().Max);

          let fillColor = "";

          if (GTFEff >= 85) {
            fillColor = "green";
          } else {
            if (GTFEff >= 70) {
              fillColor = "yellowgreen";
            } else {
              if (GTFEff < 70) {
                fillColor = "red";
              }
            }
          }

          let x1: number = this.objChart.bottomAxis().ScaleRef(x1Depth);
          let x2: number = this.objChart.bottomAxis().ScaleRef(x2Depth);

          if (x1 < limitX1) {
            x1 = limitX1;
          }

          if (x2 > limitX2) {
            x2 = limitX2;
          }

          let y1: number = this.objChart.rightAxis().ScaleRef(GTFAngle);

          //g.Line(x1, y1, x2, y1)

          this.objChart.SVGRef.append("g")
            .attr("class", "gtf_vector")
            .append("rect")
            .attr("x", x1)
            .attr("y", y1)
            .attr("width", x2 - x1)
            .attr("height", 7)
            .style("opacity", 0.4)
            .style("fill", fillColor);
        }
      }

      //Highlight MTF Vectors
      if (this.state.MTFVector) {
        for (let i = 0; i < this.objToolfaceData.SlideTable.length; i++) {
          let objItem = this.objToolfaceData.SlideTable[i];

          let MTFEff: number = objItem["MTF_VectorEff"];
          let MTFAngle: number = objItem["MTF_VectorAngle"];

          let x1Depth: number = objItem["From Depth"];
          let x2Depth: number = objItem["To Depth"];

          if (MTFEff == -999.25 && MTFAngle == -999.25) {
            //No values found ...
            continue;
          }

          if (
            (x1Depth >= this.objChart.bottomAxis().Min &&
              x1Depth <= this.objChart.bottomAxis().Max) ||
            (x2Depth >= this.objChart.bottomAxis().Min &&
              x2Depth <= this.objChart.bottomAxis().Max) ||
            (this.objChart.bottomAxis().Min >= x1Depth &&
              this.objChart.bottomAxis().Max <= x2Depth)
          ) {
            //Inside the range ...
          } else {
            //Out of range ...
            continue;
          }

          let limitX1: number = this.objChart
            .bottomAxis()
            .ScaleRef(this.objChart.bottomAxis().Min);
          let limitX2: number = this.objChart
            .bottomAxis()
            .ScaleRef(this.objChart.bottomAxis().Max);

          let fillColor = "";

          if (MTFEff >= 85) {
            fillColor = "green";
          } else {
            if (MTFEff >= 70) {
              fillColor = "yellowgreen";
            } else {
              if (MTFEff < 70) {
                fillColor = "red";
              }
            }
          }


          let x1: number = this.objChart.bottomAxis().ScaleRef(x1Depth);
          let x2: number = this.objChart.bottomAxis().ScaleRef(x2Depth);

          if (x1 < limitX1) {
            x1 = limitX1;
          }

          if (x2 > limitX2) {
            x2 = limitX2;
          }

          let y1: number = this.objChart.rightAxis().ScaleRef(MTFAngle);

          //g.Line(x1, y1, x2, y1)

          this.objChart.SVGRef.append("g")
            .attr("class", "mtf_vector")
            .append("rect")
            .attr("x", x1)
            .attr("y", y1)
            .attr("width", x2 - x1)
            .attr("height", 5)
            .style("opacity", 0.6)
            .style("fill", fillColor);
        }
      }

      //Highlight Rotary Sections
      for (let i = 0; i < this.objToolfaceData.RotarySections.length; i++) {
        let fromDepth: Number =
          this.objToolfaceData.RotarySections[i]["FROM_DEPTH"];
        let toDepth: Number =
          this.objToolfaceData.RotarySections[i]["TO_DEPTH"];

        let x1 = this.objChart.bottomAxis().ScaleRef(fromDepth);
        let x2 = this.objChart.bottomAxis().ScaleRef(toDepth);
        let y1 = this.objChart.__chartRect.top;
        let y2 = this.objChart.__chartRect.bottom;

        this.objChart.SVGRef.append("g")
          .attr("class", "rotary_sections")
          .append("rect")
          .attr("x", x1)
          .attr("y", y1)
          .attr("width", x2 - x1)
          .attr("height", y2 - y1)
          .style("opacity", 0.1)
          .style("fill", "#c9f5d4");
      }


      $(".drlg_window").remove();
      $(".drlg_windowROP").remove();

      if (this.state.ShowDrillingWindow) {
        //Use plan data to plot the drilling window
        for (let i = 1; i < this.objToolfaceData.PlanTVD.length; i++) {
          var lineData = [];

          let objPrevPoint = new ChartData();
          objPrevPoint.x = this.objToolfaceData.PlanTVD[i - 1]["MD"];
          objPrevPoint.y = this.objToolfaceData.PlanTVD[i - 1]["TVD"];

          //Find the top and bottom window
          let topWindow = 0;
          let bottomWindow = 0;

          for (let i = 0; i < this.objToolfaceData.drlgWindow.length; i++) {
            let objItem = this.objToolfaceData.drlgWindow[i];

            if (
              objPrevPoint.x >= objItem.fromMD &&
              objPrevPoint.x <= objItem.toMD
            ) {
              topWindow = objItem.fromTopWindow;
              bottomWindow = objItem.fromBottomWindow;
              break;
            }
          }

          //## Point 1 - Previous point first
          let objPoint = { x: 0, y: 0 };

          objPoint.x = this.objChart.bottomAxis().ScaleRef(objPrevPoint.x);
          objPoint.y = this.objChart
            .leftAxis()
            .ScaleRef(objPrevPoint.y - topWindow);

          if (objPoint.x < this.objChart.__chartRect.left) {
            objPoint.x = this.objChart.__chartRect.left;
          }

          if (objPoint.x > this.objChart.__chartRect.right) {
            objPoint.x = this.objChart.__chartRect.right;
          }

          if (objPoint.y < this.objChart.leftAxis().StartPos) {
            objPoint.y = this.objChart.leftAxis().StartPos;
          }

          if (objPoint.y > this.objChart.leftAxis().EndPos) {
            objPoint.y = this.objChart.leftAxis().EndPos;
          }

          //## Point 2 - Previous point second
          let objPoint1 = { x: 0, y: 0 };

          objPoint1.x = this.objChart.bottomAxis().ScaleRef(objPrevPoint.x);
          objPoint1.y = this.objChart
            .leftAxis()
            .ScaleRef(objPrevPoint.y + bottomWindow);

          if (objPoint1.x < this.objChart.__chartRect.left) {
            objPoint1.x = this.objChart.__chartRect.left;
          }

          if (objPoint1.x > this.objChart.__chartRect.right) {
            objPoint1.x = this.objChart.__chartRect.right;
          }

          if (objPoint1.y < this.objChart.leftAxis().StartPos) {
            objPoint1.y = this.objChart.leftAxis().StartPos;
          }

          if (objPoint1.y > this.objChart.leftAxis().EndPos) {
            objPoint1.y = this.objChart.leftAxis().EndPos;
          }

          let objCurrentPoint = new ChartData();
          objCurrentPoint.x = this.objToolfaceData.PlanTVD[i]["MD"];
          objCurrentPoint.y = this.objToolfaceData.PlanTVD[i]["TVD"];

          //Find the top and bottom window
          let topWindow1 = 0;
          let bottomWindow1 = 0;

          for (let i = 0; i < this.objToolfaceData.drlgWindow.length; i++) {
            let objItem = this.objToolfaceData.drlgWindow[i];

            if (
              objCurrentPoint.x >= objItem.fromMD &&
              objCurrentPoint.x <= objItem.toMD
            ) {
              topWindow1 = objItem.fromTopWindow;
              bottomWindow1 = objItem.fromBottomWindow;
              break;
            }
          }

          //## Point 3 - Current point first
          let objPoint3 = { x: 0, y: 0 };

          objPoint3.x = this.objChart.bottomAxis().ScaleRef(objCurrentPoint.x);
          objPoint3.y = this.objChart
            .leftAxis()
            .ScaleRef(objCurrentPoint.y - topWindow1);

          if (objPoint3.x < this.objChart.__chartRect.left) {
            objPoint3.x = this.objChart.__chartRect.left;
          }

          if (objPoint3.x > this.objChart.__chartRect.right) {
            objPoint3.x = this.objChart.__chartRect.right;
          }

          if (objPoint3.y < this.objChart.leftAxis().StartPos) {
            objPoint3.y = this.objChart.leftAxis().StartPos;
          }

          if (objPoint3.y > this.objChart.leftAxis().EndPos) {
            objPoint3.y = this.objChart.leftAxis().EndPos;
          }

          //## Point 4 - Current point second
          let objPoint4 = { x: 0, y: 0 };

          objPoint4.x = this.objChart.bottomAxis().ScaleRef(objCurrentPoint.x);
          objPoint4.y = this.objChart
            .leftAxis()
            .ScaleRef(objCurrentPoint.y + bottomWindow1);

          if (objPoint4.x < this.objChart.__chartRect.left) {
            objPoint4.x = this.objChart.__chartRect.left;
          }

          if (objPoint4.x > this.objChart.__chartRect.right) {
            objPoint4.x = this.objChart.__chartRect.right;
          }

          if (objPoint4.y < this.objChart.leftAxis().StartPos) {
            objPoint4.y = this.objChart.leftAxis().StartPos;
          }

          if (objPoint4.y > this.objChart.leftAxis().EndPos) {
            objPoint4.y = this.objChart.leftAxis().EndPos;
          }

          //Point 5 - to complete the polygon - repeat first point
          let objPoint5 = { x: 0, y: 0 };

          objPoint5.x = this.objChart.bottomAxis().ScaleRef(objPrevPoint.x);
          objPoint5.y = this.objChart
            .leftAxis()
            .ScaleRef(objPrevPoint.y - topWindow);

          if (objPoint5.x < this.objChart.__chartRect.left) {
            objPoint5.x = this.objChart.__chartRect.left;
          }

          if (objPoint5.x > this.objChart.__chartRect.right) {
            objPoint5.x = this.objChart.__chartRect.right;
          }

          if (objPoint5.y < this.objChart.leftAxis().StartPos) {
            objPoint5.y = this.objChart.leftAxis().StartPos;
          }

          if (objPoint5.y > this.objChart.leftAxis().EndPos) {
            objPoint5.y = this.objChart.leftAxis().EndPos;
          }

          lineData.push(objPoint);
          lineData.push(objPoint3);
          lineData.push(objPoint4);
          lineData.push(objPoint1);
          lineData.push(objPoint5);

          var lineDude = d3
            .line<any>()
            .x((d: any) => {
              return d.x;
            })
            .y((d: any) => {
              return d.y;
            });

          this.objChart.SVGRef.append("g")
            .attr("class", "drlg_window")
            .append("path")
            .attr("id", "drlg_window")
            .attr("d", lineDude(lineData))
            .style(
              "fill",
              //prath 14-10-2021
              this.objUserSettings.GeoDrlgWindowColor
              //util.rgb2hex(this.objUserSettings.GeoDrlgWindowColor)
            ) //Nishant 28/07/2021
            .style(
              "stroke",
              //prath 14-10-2021
              // util.rgb2hex(this.objUserSettings.GeoDrlgWindowColor)
              this.objUserSettings.GeoDrlgWindowColor
            ) //Nishant 28/07/2021
            .style("filter", "opacity(" + (100 - this.objUserSettings.GeoDrlgWindowTrans) + "%)"); //Kuldip 28/08/2021

        }

      }

      //Nishant 28/07/2021

      if (this.state.ShowROPDrillingWindow) {
        //Use plan data to plot the drilling window
        for (let i = 1; i < this.objToolfaceData.PlanTVD.length; i++) {
          var lineData = [];

          let objPrevPoint = new ChartData();
          objPrevPoint.x = this.objToolfaceData.PlanTVD[i - 1]["MD"];
          objPrevPoint.y = this.objToolfaceData.PlanTVD[i - 1]["TVD"];

          //Find the top and bottom window
          let topWindow = 0;
          let bottomWindow = 0;

          for (let i = 0; i < this.objToolfaceData.ropWindow.length; i++) {
            let objItem = this.objToolfaceData.ropWindow[i];

            if (
              objPrevPoint.x >= objItem.fromMD &&
              objPrevPoint.x <= objItem.toMD
            ) {
              topWindow = objItem.fromTopWindow;
              bottomWindow = objItem.fromBottomWindow;
              break;
            }
          }

          //## Point 1 - Previous point first
          let objPoint = { x: 0, y: 0 };

          objPoint.x = this.objChart.bottomAxis().ScaleRef(objPrevPoint.x);
          objPoint.y = this.objChart
            .leftAxis()
            .ScaleRef(objPrevPoint.y - topWindow);

          if (objPoint.x < this.objChart.__chartRect.left) {
            objPoint.x = this.objChart.__chartRect.left;
          }

          if (objPoint.x > this.objChart.__chartRect.right) {
            objPoint.x = this.objChart.__chartRect.right;
          }

          if (objPoint.y < this.objChart.leftAxis().StartPos) {
            objPoint.y = this.objChart.leftAxis().StartPos;
          }

          if (objPoint.y > this.objChart.leftAxis().EndPos) {
            objPoint.y = this.objChart.leftAxis().EndPos;
          }

          //## Point 2 - Previous point second
          let objPoint1 = { x: 0, y: 0 };

          objPoint1.x = this.objChart.bottomAxis().ScaleRef(objPrevPoint.x);
          objPoint1.y = this.objChart
            .leftAxis()
            .ScaleRef(objPrevPoint.y + bottomWindow);

          if (objPoint1.x < this.objChart.__chartRect.left) {
            objPoint1.x = this.objChart.__chartRect.left;
          }

          if (objPoint1.x > this.objChart.__chartRect.right) {
            objPoint1.x = this.objChart.__chartRect.right;
          }

          if (objPoint1.y < this.objChart.leftAxis().StartPos) {
            objPoint1.y = this.objChart.leftAxis().StartPos;
          }

          if (objPoint1.y > this.objChart.leftAxis().EndPos) {
            objPoint1.y = this.objChart.leftAxis().EndPos;
          }

          let objCurrentPoint = new ChartData();
          objCurrentPoint.x = this.objToolfaceData.PlanTVD[i]["MD"];
          objCurrentPoint.y = this.objToolfaceData.PlanTVD[i]["TVD"];

          //Find the top and bottom window
          let topWindow1 = 0;
          let bottomWindow1 = 0;

          for (let i = 0; i < this.objToolfaceData.ropWindow.length; i++) {
            let objItem = this.objToolfaceData.ropWindow[i];

            if (
              objCurrentPoint.x >= objItem.fromMD &&
              objCurrentPoint.x <= objItem.toMD
            ) {
              topWindow1 = objItem.fromTopWindow;
              bottomWindow1 = objItem.fromBottomWindow;
              break;
            }
          }

          //## Point 3 - Current point first
          let objPoint3 = { x: 0, y: 0 };

          objPoint3.x = this.objChart
            .bottomAxis()
            .ScaleRef(objCurrentPoint.x);
          objPoint3.y = this.objChart
            .leftAxis()
            .ScaleRef(objCurrentPoint.y - topWindow1);

          if (objPoint3.x < this.objChart.__chartRect.left) {
            objPoint3.x = this.objChart.__chartRect.left;
          }

          if (objPoint3.x > this.objChart.__chartRect.right) {
            objPoint3.x = this.objChart.__chartRect.right;
          }

          if (objPoint3.y < this.objChart.leftAxis().StartPos) {
            objPoint3.y = this.objChart.leftAxis().StartPos;
          }

          if (objPoint3.y > this.objChart.leftAxis().EndPos) {
            objPoint3.y = this.objChart.leftAxis().EndPos;
          }

          //## Point 4 - Current point second
          let objPoint4 = { x: 0, y: 0 };

          objPoint4.x = this.objChart
            .bottomAxis()
            .ScaleRef(objCurrentPoint.x);
          objPoint4.y = this.objChart
            .leftAxis()
            .ScaleRef(objCurrentPoint.y + bottomWindow1);

          if (objPoint4.x < this.objChart.__chartRect.left) {
            objPoint4.x = this.objChart.__chartRect.left;
          }

          if (objPoint4.x > this.objChart.__chartRect.right) {
            objPoint4.x = this.objChart.__chartRect.right;
          }

          if (objPoint4.y < this.objChart.leftAxis().StartPos) {
            objPoint4.y = this.objChart.leftAxis().StartPos;
          }

          if (objPoint4.y > this.objChart.leftAxis().EndPos) {
            objPoint4.y = this.objChart.leftAxis().EndPos;
          }

          //Point 5 - to complete the polygon - repeat first point
          let objPoint5 = { x: 0, y: 0 };

          objPoint5.x = this.objChart.bottomAxis().ScaleRef(objPrevPoint.x);
          objPoint5.y = this.objChart
            .leftAxis()
            .ScaleRef(objPrevPoint.y - topWindow);

          if (objPoint5.x < this.objChart.__chartRect.left) {
            objPoint5.x = this.objChart.__chartRect.left;
          }

          if (objPoint5.x > this.objChart.__chartRect.right) {
            objPoint5.x = this.objChart.__chartRect.right;
          }

          if (objPoint5.y < this.objChart.leftAxis().StartPos) {
            objPoint5.y = this.objChart.leftAxis().StartPos;
          }

          if (objPoint5.y > this.objChart.leftAxis().EndPos) {
            objPoint5.y = this.objChart.leftAxis().EndPos;
          }

          lineData.push(objPoint);
          lineData.push(objPoint3);
          lineData.push(objPoint4);
          lineData.push(objPoint1);
          lineData.push(objPoint5);

          var lineDude = d3
            .line<any>()
            .x((d: any) => {
              return d.x;
            })
            .y((d: any) => {
              return d.y;
            });

          //alert(this.objUserSettings.ROPDrlgWindowColor);
          this.objChart.SVGRef.append("g")
            .attr("class", "drlg_windowROP")
            .append("path")
            .attr("id", "drlg_windowROP")
            .attr("d", lineDude(lineData))
            .style(
              "fill",
              //prath 14-10-2021
              this.objUserSettings.ROPDrlgWindowColor
              //util.rgb2hex(this.objUserSettings.ROPDrlgWindowColor)
            ) //Nishant 28/07/2021
            .style(
              "stroke",
              //prath 14-10-2021
              this.objUserSettings.ROPDrlgWindowColor
              //util.rgb2hex(this.objUserSettings.ROPDrlgWindowColor)
            )
            //.style("opacity", (this.objUserSettings.ROPDrlgWindowTrans / 100)); //Nishant 28/07/2021
            .style("filter", "opacity(" + (100 - this.objUserSettings.ROPDrlgWindowTrans) + "%)"); //Kuldip 28/08/2021
        }
      }

    } catch (error) { }
  };

  displayData = async () => {
    try {
      this.objUserSettings = JSON.parse(this.objToolfaceData.userSettings);


      let newGeoDrlgWindowData: any = Object.values(
        this.objUserSettings.GeoDrlgWindowData
      ).map((item: any, key: number) => ({ ...item, SRNO: key }));

      let newROPDrlgWindowData: any = Object.values(
        this.objUserSettings.ROPDrlgWindowData
      ).map((item: any, key: number) => ({ ...item, SRNO: key }));

      if (this.objUserSettings.GTF.lineColor == "") {
        //this.objUserSettings.GTF.lineColor = util.getRandomColor();
        this.objUserSettings.GTF.lineColor = "#499DF5";

      }

      if (this.objUserSettings.MTF.lineColor == "") {
        //this.objUserSettings.MTF.lineColor = util.getRandomColor();
        this.objUserSettings.MTF.lineColor = "#FF8C00";
      }
      if (this.objUserSettings.PlanDLS.lineColor == "") {
        //this.objUserSettings.PlanDLS.lineColor = util.getRandomColor();
        this.objUserSettings.PlanDLS.lineColor = "#B8B8B8";
      }
      if (this.objUserSettings.ActualDLS.lineColor == "") {
        //this.objUserSettings.ActualDLS.lineColor = util.getRandomColor();
        this.objUserSettings.ActualDLS.lineColor = "#B8B8B8";
      }
      if (this.objUserSettings.PlanTVD.lineColor == "") {
        //this.objUserSettings.PlanTVD.lineColor = util.getRandomColor();
        this.objUserSettings.PlanTVD.lineColor = "#FF0000";
      }
      if (this.objUserSettings.ActualTVD.lineColor == "") {
        //this.objUserSettings.ActualTVD.lineColor = util.getRandomColor();
        this.objUserSettings.ActualTVD.lineColor = "#008037";
      }
      //Nishant: Nis-PC 16-09-2021
      if (this.objUserSettings.GeoDrlgWindowColor == "") {
        this.objUserSettings.GeoDrlgWindowColor = util.getRandomColor();
      }
      if (this.objUserSettings.ROPDrlgWindowColor == "") {
        this.objUserSettings.ROPDrlgWindowColor = util.getRandomColor();
      }
      //****************** */

      //alert(this.objUserSettings.ShowDrillingWindow);

      await this.setState({
        WellName: this.objToolfaceData.WellName,
        //GEO
        ShowDrillingWindow: this.objUserSettings.ShowDrillingWindow,
        GeoDrlgWindowData: newGeoDrlgWindowData,
        GeoDrlgWindowColor: this.objUserSettings.GeoDrlgWindowColor,
        GeoDrlgWindowTrans: this.objUserSettings.GeoDrlgWindowTrans,

        // ROP
        ShowROPDrillingWindow: this.objUserSettings.ShowROPDrillingWindow,
        ROPDrlgWindowData: newROPDrlgWindowData,
        ROPDrlgWindowColor: this.objUserSettings.ROPDrlgWindowColor,
        ROPDrlgWindowTrans: this.objUserSettings.ROPDrlgWindowTrans,

        GTF: this.objUserSettings.GTF,
        MTF: this.objUserSettings.MTF,
        PlanDLS: this.objUserSettings.PlanDLS,
        ActualDLS: this.objUserSettings.ActualDLS,
        PlanTVD: this.objUserSettings.PlanTVD,
        ActualTVD: this.objUserSettings.ActualTVD,
        MY: this.objUserSettings.MY, //14-10-2021

        adnlChannels: this.objUserSettings.adnlChannels,

        // Settings
        ShowFormationTops: this.objUserSettings.ShowFormationTops,
        MTFVector: this.objUserSettings.MTFVector,
        GTFVector: this.objUserSettings.GTFVector,
        FilterByMinSlideLength: this.objUserSettings.FilterByMinSlideLength,
        MinSlideLength: this.objUserSettings.MinSlideLength,
        MinRotationFootage: this.objUserSettings.MinRotationFootage,
        convertScale: this.objUserSettings.convertScale,
        HighlightColor: this.objUserSettings.HighlightColor,
        HighlightTrans: this.objUserSettings.HighlightTrans,
        Direction: this.objUserSettings.Direction,

        // Table
        SlidePercent: this.objToolfaceData.SlidePercent == NaN ? this.objToolfaceData.SlidePercent : 0,
        SlideROP: this.objToolfaceData.SlideROP,
        RotaryPercent: this.objToolfaceData.RotaryPercent == NaN ? this.objToolfaceData.RotaryPercent : 0,
        RotaryROP: this.objToolfaceData.RotaryROP == NaN ? this.objToolfaceData.RotaryROP : 0,
        OutOfDrlgWindow: this.objToolfaceData.OutOfDrlgWindowPercent,
        OutOfROPWindow: this.objToolfaceData.OutOfROPWindowPercent,
      });



      //this.forceUpdate(); //change on 09-02-2021
      this.getPrimaryList();
      this.plotMainChart();
      this.plotAdnlChart();
      this.plotToolfaceDial();

      document.title = this.state.WellName + " -Toolface Summary"; //Nishant 02/09/2021
    } catch (error) { }
  };

  formateDate = (paramDate: Date) => {
    try {
      let day = paramDate.getDate();
      let mlist = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      let month = mlist[paramDate.getMonth()];
      let year = paramDate.getFullYear();
      let hour = paramDate.getHours();
      let minute = paramDate.getMinutes();
      let seconds = paramDate.getSeconds();

      let strDate =
        day +
        "-" +
        month +
        "-" +
        year +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        seconds;

      return strDate;
    } catch (error) {
      return "";
    }
  };

  loadData = () => {
    try {
      Util.StatusInfo("Getting data from the server  ");

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "Toolface";
      objBrokerRequest.Function = "ToolfaceSummary";

      let paramuserid: BrokerParameter = new BrokerParameter("UserId", "admin");
      objBrokerRequest.Parameters.push(paramuserid);

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );
      objBrokerRequest.Parameters.push(paramwellId);

      let paramSelectionType: BrokerParameter = new BrokerParameter(
        "SelectionType",
        this.selectionType
      );
      objBrokerRequest.Parameters.push(paramSelectionType);

      let paramFromDate: BrokerParameter = new BrokerParameter(
        "FromDate",
        this.formateDate(this.fromDate)
      );
      objBrokerRequest.Parameters.push(paramFromDate);

      let paramToDate: BrokerParameter = new BrokerParameter(
        "ToDate",
        this.formateDate(this.toDate)
      );
      objBrokerRequest.Parameters.push(paramToDate);

      let paramFromDepth: BrokerParameter = new BrokerParameter(
        "FromDepth",
        this.fromDepth.toString()
      );
      objBrokerRequest.Parameters.push(paramFromDepth);

      let paramToDepth: BrokerParameter = new BrokerParameter(
        "ToDepth",
        this.toDepth.toString()
      );

      let paramIsRealTime: BrokerParameter = new BrokerParameter("isRealTime", this.state.isRealTime.toString());
      objBrokerRequest.Parameters.push(paramIsRealTime);

      let paramRefreshHrs: BrokerParameter = new BrokerParameter(
        "refreshHrs", this.refreshHrs.toString()
      );
      objBrokerRequest.Parameters.push(paramRefreshHrs);


      objBrokerRequest.Parameters.push(paramToDepth);
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

          this.objToolfaceData = JSON.parse(res.data.Response);

          //alert("load data");


          if (this.objToolfaceData.MTFData == null) {
            this.objToolfaceData.MTFData = [];
          }

          if (this.objToolfaceData.GTFData == null) {
            this.objToolfaceData.GTFData = [];
          }

          if (this.objToolfaceData.ActualTVD == null) {
            this.objToolfaceData.ActualTVD = [];
          }
          if (this.objToolfaceData.PlanTVD == null) {
            this.objToolfaceData.PlanTVD = [];
          }
          if (this.objToolfaceData.ActualDLS == null) {
            this.objToolfaceData.ActualDLS = [];
          }
          if (this.objToolfaceData.PlanDLS == null) {
            this.objToolfaceData.PlanDLS = [];
          }
          if (this.objToolfaceData.MYData == null) {
            this.objToolfaceData.MYData = [];
          }
          if (this.objToolfaceData.GTFData == null) {
            this.objToolfaceData.GTFData = [];
          }
          if (this.objToolfaceData.MTFData == null) {
            this.objToolfaceData.MTFData = [];
          }
          if (this.objToolfaceData.adnlChannelsData == null) {
            this.objToolfaceData.adnlChannelsData = [];
          }



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



          //this.Warnings = res.data.Warnings;



          // if (this.Warnings.trim() != "") {
          //   this.setState({ showWarning: true });
          //   $("#warning").css("backgroundColor", "#ffb74d");
          //   $("#lblWarning").text(res.data.Warnings);
          // }
          // else {
          //   this.setState({ showWarning: false });
          //   $("#warning").css("backgroundColor", "transparent");
          //   $("#lblWarning").text("");
          // }




          this.displayData();
        })
        .catch((error) => {
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
    this.setState({ selected: e.selected });
  };

  PrimaryPlot_Header = () => {
    return (
      <ListViewHeader
        style={{ fontSize: 14 }}
        className="pl-3 pb-1 pt-1 text-theme"
      >
        Primary List
      </ListViewHeader>
    );
  };

  addChanels_Click = () => {
    this.setState({
      showAdditionalChannelWindow: true,
    });
  };

  additionalChannel_Header = () => {
    return (
      <ListViewHeader
        style={{ fontSize: 14 }}
        className="pl-3 pb-1 pt-1 text-theme"
      >
        Additional Channel List (Depth Log)
        <div
          title="Add Channel"
          onClick={this.addChanels_Click}
          className="float-right pr-3  addChannelIcon"
        >
          <FontAwesomeIcon icon={faPlus} />
          {/* <Button onClick={this.addChanels_Click} id="cmdAdd">
            Add
          </Button> */}
        </div>
      </ListViewHeader>
    );
  };

  STDChannels_Clicks = (selectedChannel: comboData, isCancel: boolean) => {
    this.setState({
      showAdditionalChannelWindow: false,
      selected: 1,
    });

    if (!isCancel) {
      let newData = this.state.adnlChannels;

      if (newData.some((x) => x.Mnemonic == selectedChannel.id)) {
        // Skip existing value
      } else {

        let line_Color = "";
        switch (selectedChannel.id) {
          case "GAMMA_RAY":
            line_Color = "#008017"
            break;
          case "DIFF_PRESS":
            line_Color = "#0202FF"
            break;
          case "ROP":
            line_Color = "#FF0000"
            break;
          default:
            line_Color = "#93C7CF" //util.getRandomColor()
            break;
        }

        newData.push({
          Mnemonic: selectedChannel.id,
          lineStyle: 0,
          lineWidth: 2,
          lineColor: line_Color  // util.getRandomColor(), // Default Color when add New Channel  Nishant 06/09/2021,
          // visible:"true" // Nishant 28/07/2021
        });
      }

      this.setState({
        adnlChannels: newData,
      });

      //    this.forceUpdate(); //change on 09-02-2021
    }
  };

  applyFormat_Click = () => {
    this.setState({ isVisibleFormat: false });
  };

  RemoveChannel_Click = (item: any) => {
    try {
      confirmAlert({
        //title: 'eVuMax',
        message: "Are you sure you want to remove?",
        childrenElement: () => <div />,
        buttons: [
          {
            label: "Yes",
            onClick: () => {
              let newData = this.state.adnlChannels;
              let index = newData.findIndex(
                (d: any) => d.Mnemonic === item.Mnemonic
              ); //find index in your array //Nishant 28/07/2021
              newData.splice(index, 1); //remove element from array
              this.setState({
                adnlChannels: newData,
              });
              this.onClick_Save();
              //    this.forceUpdate(); //change on 09-02-2021
            },
          },
          {
            label: "No",
            onClick: () => null,
          },
        ],
      });
    } catch (error) { }
  };

  RemovePrimary_Click = (item: any) => {
    try {
      confirmAlert({
        //title: 'eVuMax',
        message: "Are you sure you want to remove?",
        childrenElement: () => <div />,
        buttons: [
          {
            label: "Yes",
            onClick: () => {
              let newData = this.state.primaryPlotList;
              let index = newData.findIndex(
                (d: any) => d.Mnemonic === item.Mnemonic
              ); //find index in your array

              newData.splice(index, 1); //remove element from array
              this.setState({
                primaryPlotList: newData,
              });
              //    this.forceUpdate(); //change on 09-02-2021
            },
          },
          {
            label: "No",
            onClick: () => null,
          },
        ],
      });
    } catch (error) { }
  };

  listView_Click = (e) => {
    this.setState({ isVisibleFormat: true });
  };

  Channels_ListView = (props: any) => {
    let item = props.dataItem;


    let classNames = item.selected
      ? "row  border-bottom align-middle k-state-selected k-listview-content-rows"
      : "row  border-bottom align-middle k-listview-content-rows";

    return (
      <div
        className={classNames}
        // onClick={this.listView_Click}

        style={{ margin: 0 }}
      >
        <div
          {...item}
          onClick={(e) => this.Channel_handleSelected(item)}
          className="col-10   pl-3"
        >
          <div className="text-theme pt-1" style={{ fontSize: 12 }}>
            {item.Mnemonic}
          </div>
        </div>
        <div onClick={(e) => this.RemoveChannel_Click(item)} className="col-2 ">
          <span
            title="Remove Channel"
            className="float-right text-right pt-1 pr-1 listview-button"
          >
            {" "}
            <FontAwesomeIcon icon={faTrash} />
          </span>
        </div>
      </div>
    );
  };

  PrimaryPlots_ListView = (props: any) => {
    let item = props.dataItem;

    let classNames = item.selected
      ? "row  border-bottom align-middle k-state-selected k-listview-content-rows"
      : "row  border-bottom align-middle k-listview-content-rows";
    return (
      <div className={classNames} style={{ margin: 0 }}>
        <div
          {...item}
          onClick={(e) => this.Primary_handleSelected(item)}
          className="col-10   pl-3"
        >
          <div className="text-theme pt-1" style={{ fontSize: 12 }}>
            {item.Mnemonic}
          </div>
        </div>
        {/* <div onClick={(e) => this.RemovePrimary_Click(item)}  className="col-2 ">
        <span
              title="Remove Channel"
              className="float-right text-right pt-1 pr-1 listview-button"
            >
              {" "}
              <FontAwesomeIcon icon={faTrash} />
            </span>
        </div> */}
      </div>
    );
  };

  Channel_handleSelected = (item: any) => {
    const data = this.state.adnlChannels.map((channels) => {
      if (channels.Mnemonic === item.Mnemonic) {
        channels.selected = !channels.selected;
      } else {
        channels.selected = false;
      }
      return channels;
    });

    item.type = "adnlChannels";
    this._selectedItem = item;
    let index =
      this.state.LineStyleList.findIndex(
        (x) => x.id == this._selectedItem.lineStyle.toString()
      ) || 0;

    this.setState({
      isVisibleFormat: true,
      LineStyle: this.state.LineStyleList[index],
      LineWidth: this._selectedItem.lineWidth,
      LineColor: this._selectedItem.lineColor,
      LineVisible: this._selectedItem.visible,
    });
  };

  Primary_handleSelected = (item: any) => {

    const data = this.state.primaryPlotList.map((channels) => {
      if (channels.Mnemonic === item.Mnemonic) {
        channels.selected = !channels.selected;
      } else {
        channels.selected = false;
      }
      return channels;
    });

    item.type = "primary";
    this._selectedItem = item;

    let index =
      this.state.LineStyleList.findIndex(
        (x) => x.id == this._selectedItem.lineStyle.toString()
      ) || 0;

    this.setState({
      isVisibleFormat: true,
      LineStyle: this.state.LineStyleList[index],
      LineWidth: this._selectedItem.lineWidth,
      LineColor: this._selectedItem.lineColor,
      LineVisible: this._selectedItem.visible,
    });
  };

  onClick_Apply = () => {
    // Primary
    if (this._selectedItem.type == "primary") {
      this.state.primaryPlotList.map((channels) => {
        if (channels.Mnemonic === this._selectedItem.Mnemonic) {
          channels.lineStyle = Number(this.state.LineStyle.id);
          channels.lineWidth = this.state.LineWidth;
          channels.lineColor = this.state.LineColor;
          channels.visible = this.state.LineVisible;
        }
      });
    }
    // Additional
    else {
      this.state.adnlChannels.map((channels) => {
        if (channels.Mnemonic === this._selectedItem.Mnemonic) {
          channels.lineStyle = Number(this.state.LineStyle.id);
          channels.lineWidth = this.state.LineWidth;
          channels.lineColor = this.state.LineColor;
          channels.visible = this.state.LineVisible;
        }
      });
    }

    this.setState({ isVisibleFormat: false });

    this.onClick_Save();
  };

  onClick_ApplyCancel = () => {
    try {
      if (this.state.isDirty) {
        confirmAlert({
          //title: 'eVuMax',
          message:
            "It looks like you have been editing something. Click on 'Apply' to save unsaved data.",
          childrenElement: () => <div />,
          buttons: [
            {
              label: "Apply",
              onClick: () => {
                this.onClick_Apply();
              },
            },
            {
              label: "Cancel",
              onClick: () => {
                this.setState({ isVisibleFormat: false });
              },
            },
          ],
        });
      } else {
        this.setState({ isVisibleFormat: false });
      }
      this.setState({ isDirty: false });
    } catch (error) { }
  };

  plotToolfaceDial = () => {
    try {
      let polarContainerId = "polar";
      let height = 250;
      let width = 250;

      $("#" + polarContainerId).empty();

      let polarSVG = d3
        .select("#" + polarContainerId)
        .append("svg")
        .attr("height", "250px")
        .attr("width", "250px")
        .append("g")
        .attr(
          "transform",
          "translate(" + (width / 2 + 5) + "," + height / 2 + ")"
        );

      let radius = Math.min(width, height) / 2 - 30;

      var r = d3.scaleLinear().domain([0, 100]).range([0, radius]);

      // var line = d3.lineRadial()
      //   .radius(function (d) { return r(d[1]); })
      //   .angle(function (d) { return -d[0] + Math.PI / 2; });

      var gr = polarSVG
        .append("g")
        .attr("style", "fill: none;stroke: gray;stroke-dasharray: 1,4")
        .selectAll("g")
        .data(r.ticks(5).slice(1))
        .enter()
        .append("g");

      gr.append("circle").attr("r", r);

      var ga = polarSVG
        .append("g")
        .attr("style", "fill: none;stroke: gray;")
        .selectAll("g")
        .data(d3.range(0, 360, 30))
        .enter()
        .append("g")
        .attr("transform", function (d) {
          return "rotate(" + -d + ")";
        });

      ga.append("line")
        .attr("x1", 0)
        .attr("x2", radius)
        .attr("style", "stroke-dasharray: 1,4");

      ga.append("text")
        .attr("x", radius + 6)
        .attr("dy", ".35em")
        .style("text-anchor", function (d) {
          return d < 270 && d > 90 ? "end" : null;
        })
        .attr("transform", function (d) {
          return d < 270 && d > 90
            ? "rotate(180 " + (radius + 6) + ",0)"
            : null;
        })
        .text(function (d) {
          return d + "°";
        });

      let minDepth = 0;
      let maxDepth = 0;

      let Counter = 0;

      for (let i = this.objToolfaceData.GTFData.length - 1; i >= 0; i--) {
        if (Counter >= 5) {
          break;
        }

        let depth = this.objToolfaceData.GTFData[i]["DEPTH"];
        let angle = this.objToolfaceData.GTFData[i]["GTF"];

        if (angle != -999.25 && angle != 0) {
          if (depth > maxDepth) {
            maxDepth = depth;
            Counter++;
          }
        }
      }

      Counter = 0;

      for (let i = this.objToolfaceData.MTFData.length - 1; i >= 0; i--) {
        if (Counter >= 5) {
          break;
        }

        let depth = this.objToolfaceData.MTFData[i]["DEPTH"];
        let angle = this.objToolfaceData.MTFData[i]["MTF"];

        if (angle != -999.25 && angle != 0) {
          if (depth > maxDepth) {
            maxDepth = depth;
            Counter++;
          }
        }
      }

      minDepth = maxDepth;

      Counter = 0;

      for (let i = this.objToolfaceData.GTFData.length - 1; i >= 0; i--) {
        if (Counter >= 5) {
          break;
        }

        let depth = this.objToolfaceData.GTFData[i]["DEPTH"];
        let angle = this.objToolfaceData.GTFData[i]["GTF"];

        if (angle != -999.25 && angle != 0) {
          if (depth < minDepth) {
            minDepth = depth;
            Counter++;
          }
        }
      }

      Counter = 0;

      for (let i = this.objToolfaceData.MTFData.length - 1; i >= 0; i--) {
        if (Counter >= 5) {
          break;
        }

        let depth = this.objToolfaceData.MTFData[i]["DEPTH"];
        let angle = this.objToolfaceData.MTFData[i]["MTF"];

        if (angle != -999.25 && angle != 0) {
          if (depth < minDepth) {
            minDepth = depth;
            Counter++;
          }
        }
      }

      let depthRange = maxDepth - minDepth;

      let gtfPoints = [];

      for (let i = this.objToolfaceData.GTFData.length - 1; i >= 0; i--) {
        let distance = this.objToolfaceData.GTFData[i]["DEPTH"];
        let angle = this.objToolfaceData.GTFData[i]["GTF"];

        if (angle != -999.25 && angle != 0) {
          let newPoint = { a: 0, d: 0 };

          let inputVal = distance - minDepth;
          let pc = (inputVal * 100) / depthRange;
          let newDistance = (100 * pc) / 100;

          newPoint.a = angle;
          newPoint.d = newDistance;

          gtfPoints.push(newPoint);

          if (gtfPoints.length >= 5) {
            break;
          }
        }
      }

      let mtfPoints = [];

      for (let i = this.objToolfaceData.MTFData.length - 1; i >= 0; i--) {
        let distance = this.objToolfaceData.MTFData[i]["DEPTH"];
        let angle = this.objToolfaceData.MTFData[i]["MTF"];

        if (angle != -999.25 && angle != 0) {
          let newPoint = { a: 0, d: 0 };

          let inputVal = distance - minDepth;
          let pc = (inputVal * 100) / depthRange;
          let newDistance = (100 * pc) / 100;

          newPoint.a = angle;
          newPoint.d = newDistance;

          mtfPoints.push(newPoint);

          if (mtfPoints.length >= 5) {
            break;
          }
        }
      }

      for (let i = 0; i < gtfPoints.length; i++) {
        gr.append("circle")
          .attr("r", 5)
          .attr("stroke", "red")
          .attr("fill", "red")
          .attr("cx", gtfPoints[i].d)
          .attr("transform", function (d) {
            return "rotate(-" + gtfPoints[i].a + ")";
          });
      }

      for (let i = 0; i < mtfPoints.length; i++) {
        gr.append("circle")
          .attr("r", 5)
          .attr("stroke", "blue")
          .attr("fill", "blue")
          .attr("cx", mtfPoints[i].d)
          .attr("transform", function (d) {
            return "rotate(-" + mtfPoints[i].a + ")";
          });
      }
    } catch (error) {
      let wait = true;
    }
  };

  plotMainChart = () => {
    try {
      Util.StatusInfo("Please wait, plotting data");
      this.objChart.DataSeries.clear();
      this.objChart.Axes.clear();
      this.objChart.createDefaultAxes();
      this.objChart.updateChart();

      this.objChart.leftAxis().AutoScale = true;
      this.objChart.leftAxis().Min = 0;
      this.objChart.leftAxis().Max = 10;
      this.objChart.leftAxis().Inverted = true;
      this.objChart.leftAxis().bandScale = false;
      this.objChart.leftAxis().ShowLabels = true;
      this.objChart.leftAxis().ShowTitle = true;
      this.objChart.leftAxis().Title = "TVD";
      this.objChart.leftAxis().ShowSelector = false;
      this.objChart.leftAxis().DisplayOrder = 1;
      this.objChart.leftAxis().Visible = true;

      this.objChart.bottomAxis().AutoScale = true;
      this.objChart.bottomAxis().bandScale = false;
      this.objChart.bottomAxis().Min = 10000;
      this.objChart.bottomAxis().Max = 20000;
      this.objChart.bottomAxis().Title = "MD";
      this.objChart.bottomAxis().ShowLabels = true;
      this.objChart.bottomAxis().ShowTitle = true;
      this.objChart.bottomAxis().LabelAngel = 90;
      this.objChart.bottomAxis().ShowSelector = false;
      this.objChart.bottomAxis().IsDateTime = false;
      this.objChart.bottomAxis().Visible = true;

      this.objChart.rightAxis().AutoScale = false;
      this.objChart.rightAxis().bandScale = false;
      this.objChart.rightAxis().Min = -180;
      this.objChart.rightAxis().Max = 180;
      this.objChart.rightAxis().Title = "GTF/MTF";
      this.objChart.rightAxis().ShowLabels = true;
      this.objChart.rightAxis().ShowTitle = true;
      this.objChart.rightAxis().ShowSelector = false;
      this.objChart.rightAxis().IsDateTime = false;
      this.objChart.rightAxis().DisplayOrder = 5;
      this.objChart.rightAxis().GridVisible = false;
      this.objChart.rightAxis().Visible = true;
      this.objChart.rightAxis().Inverted = true;

      this.objChart.topAxis().Visible = false;
      this.objChart.topAxis().ShowLabels = false;
      this.objChart.topAxis().GridVisible = false;

      this.objChart.MarginLeft = 0;
      this.objChart.MarginBottom = 0;
      this.objChart.MarginTop = 0;
      this.objChart.MarginRight = 30;

      let myChannel = this.state.primaryPlotList.find(
        (x) => x.Mnemonic === "MY"
      );
      let GTFChannel = this.state.primaryPlotList.find(
        (x) => x.Mnemonic === "GTF"
      );
      let MTFChannel = this.state.primaryPlotList.find(
        (x) => x.Mnemonic === "MTF"
      );
      let PlanDLSChannel = this.state.primaryPlotList.find(
        (x) => x.Mnemonic === "PlanDLS"
      );
      let ActualDLSChannel = this.state.primaryPlotList.find(
        (x) => x.Mnemonic === "ActualDLS"
      );
      let PlanTVDChannel = this.state.primaryPlotList.find(
        (x) => x.Mnemonic === "PlanTVD"
      );
      let ActualTVDChannel = this.state.primaryPlotList.find(
        (x) => x.Mnemonic === "ActualTVD"
      );

      let myVisible = true;

      if (myChannel != null) {
        myVisible = myChannel.visible;
      }

      let GTFVisible = GTFChannel.visible;
      let MTFVisible = MTFChannel.visible;
      let PlanDLSVisible = PlanDLSChannel.visible;
      let ActualDLSVisible = ActualDLSChannel.visible;
      let PlanTVDVisible = PlanTVDChannel.visible;
      let ActualTVDVisible = ActualTVDChannel.visible;

      let objMYAxis = new Axis();
      objMYAxis.Id = "MY";
      objMYAxis.Position = axisPosition.right;
      objMYAxis.AutoScale = true;
      objMYAxis.bandScale = false;
      objMYAxis.Inverted = false;
      objMYAxis.Min = 0;
      objMYAxis.Max = 100;
      objMYAxis.ShowLabels = true;
      objMYAxis.ShowTitle = true;
      objMYAxis.Title = "Motor Yields";
      objMYAxis.ShowSelector = false;
      objMYAxis.IsDateTime = false;
      objMYAxis.DisplayOrder = 2;
      objMYAxis.GridVisible = false;
      objMYAxis.Visible = true;

      if (myVisible) {
        this.objChart.Axes.set(objMYAxis.Id, objMYAxis);
      }

      //Create custom Axes
      let objDLSAxis = new Axis();
      objDLSAxis.Id = "dls";
      objDLSAxis.Position = axisPosition.right;
      objDLSAxis.AutoScale = true;
      objDLSAxis.bandScale = false;
      objDLSAxis.Inverted = false;
      objDLSAxis.Min = 0;
      objDLSAxis.Max = 100;
      objDLSAxis.ShowLabels = true;
      objDLSAxis.ShowTitle = true;
      objDLSAxis.Title = "DLS";
      objDLSAxis.ShowSelector = false;
      objDLSAxis.IsDateTime = false;
      objDLSAxis.DisplayOrder = 1;
      objDLSAxis.GridVisible = false;
      objDLSAxis.Visible = true;
      if (PlanDLSVisible || ActualDLSVisible) {
        this.objChart.Axes.set(objDLSAxis.Id, objDLSAxis);
      }

      let objActualTVD = new DataSeries();
      objActualTVD.Id = "ACTUAL_TVD";
      objActualTVD.Type = dataSeriesType.Line;
      objActualTVD.Title = "Actual TVD";

      //Change prath 14-10-2021
      // objActualTVD.Color = util.rgb2hex(
      //   this.objUserSettings.ActualTVD.lineColor
      // ); // //Nishant 28/07/2021 "darkgreen";
      objActualTVD.Color = this.objUserSettings.ActualTVD.lineColor; // //Nishant 28/07/2021 "darkgreen";
      //==============

      objActualTVD.XAxisId = this.objChart.bottomAxis().Id;
      objActualTVD.YAxisId = this.objChart.leftAxis().Id;
      objActualTVD.LineWidth = this.objUserSettings.ActualTVD.lineWidth; //Nishant 28/07/2021

      if (ActualTVDVisible) {
        this.objChart.DataSeries.set(objActualTVD.Id, objActualTVD);

        for (let i = 0; i < this.objToolfaceData.ActualTVD.length; i++) {
          let objActualTVDPoint = new ChartData();
          objActualTVDPoint.x = this.objToolfaceData.ActualTVD[i]["MD"];
          objActualTVDPoint.y = this.objToolfaceData.ActualTVD[i]["TVD"];
          objActualTVD.Data.push(objActualTVDPoint);
        }
      }

      let objPlanTVD = new DataSeries();
      objPlanTVD.Id = "PLAN_TVD";
      objPlanTVD.Type = dataSeriesType.Line;
      objPlanTVD.Title = "Plan TVD";
      //prath 14-10-2021
      //objPlanTVD.Color = util.rgb2hex(this.objUserSettings.PlanTVD.lineColor); //"#e5383b" //Nishant 28/07/2021
      objPlanTVD.Color = this.objUserSettings.PlanTVD.lineColor; //"#e5383b" //Nishant 28/07/2021
      objPlanTVD.XAxisId = this.objChart.bottomAxis().Id;
      objPlanTVD.YAxisId = this.objChart.leftAxis().Id;
      objPlanTVD.LineWidth = this.objUserSettings.PlanTVD.lineWidth; // 4; Nishant 28/07/2021
      objPlanTVD.LineStyle = this.objUserSettings.PlanTVD.lineStyle; //Nishant 28/07/2021

      if (PlanTVDVisible) {
        this.objChart.DataSeries.set(objPlanTVD.Id, objPlanTVD);

        for (let i = 0; i < this.objToolfaceData.PlanTVD.length; i++) {
          let objPlanTVDPoint = new ChartData();
          objPlanTVDPoint.x = this.objToolfaceData.PlanTVD[i]["MD"];
          objPlanTVDPoint.y = this.objToolfaceData.PlanTVD[i]["TVD"];
          objPlanTVD.Data.push(objPlanTVDPoint);
        }
      }

      let objActualDLS = new DataSeries();
      objActualDLS.Id = "ACTUAL_DLS";
      objActualDLS.Type = dataSeriesType.Line;

      objActualDLS.CurveStyle = curveStyle.step;
      objActualDLS.Title = "Actual DLS";
      //prath 14-10-2021
      // objActualDLS.Color = util.rgb2hex(
      //   this.objUserSettings.ActualDLS.lineColor
      // ); // "#f2cc8f"; //Nishant 28/07/2021

      objActualDLS.Color = this.objUserSettings.ActualDLS.lineColor; // "#f2cc8f"; //Nishant 28/07/2021

      objActualDLS.XAxisId = this.objChart.bottomAxis().Id;
      objActualDLS.YAxisId = "dls";
      objActualDLS.LineWidth = this.objUserSettings.ActualDLS.lineWidth; // 4; Nishant 28/07/2021
      objActualDLS.LineStyle = this.objUserSettings.ActualDLS.lineStyle; //Nishant 28/07/2021

      if (ActualDLSVisible) {
        this.objChart.DataSeries.set(objActualDLS.Id, objActualDLS);

        for (let i = 0; i < this.objToolfaceData.ActualDLS.length; i++) {
          let objPoint = new ChartData();
          objPoint.x = this.objToolfaceData.ActualDLS[i]["MD"];
          objPoint.y = this.objToolfaceData.ActualDLS[i]["DOG_LEG"];
          objActualDLS.Data.push(objPoint);
        }
      }

      let objPlanDLS = new DataSeries();
      objPlanDLS.Id = "PLAN_DLS";
      objPlanDLS.Type = dataSeriesType.Line;

      objPlanDLS.CurveStyle = curveStyle.step;
      objPlanDLS.Title = "Plan DLS";
      //prath 14-10-2021
      //objPlanDLS.Color = util.rgb2hex(this.objUserSettings.PlanDLS.lineColor); // //Nishant 28/07/2021  "#9d0208";
      objPlanDLS.Color = this.objUserSettings.PlanDLS.lineColor; // //Nishant 28/07/2021  "#9d0208";

      objPlanDLS.XAxisId = this.objChart.bottomAxis().Id;
      objPlanDLS.YAxisId = "dls";
      objPlanDLS.LineWidth = this.objUserSettings.PlanDLS.lineWidth; //1 //Nishant 28/07/2021
      objPlanDLS.LineStyle = this.objUserSettings.PlanDLS.lineStyle; //Nishant 28/07/2021

      if (PlanDLSVisible) {
        this.objChart.DataSeries.set(objPlanDLS.Id, objPlanDLS);

        for (let i = 0; i < this.objToolfaceData.PlanDLS.length; i++) {
          let objPoint = new ChartData();
          objPoint.x = this.objToolfaceData.PlanDLS[i]["MD"];
          objPoint.y = this.objToolfaceData.PlanDLS[i]["DOG_LEG"];
          objPlanDLS.Data.push(objPoint);
        }
      }

      let objMY = new DataSeries();
      objMY.Id = "MY";
      objMY.Type = dataSeriesType.Line;

      objMY.CurveStyle = curveStyle.step;
      objMY.Title = "Motor Yields";
      objMY.Color = this.objUserSettings.MY.lineColor;
      objMY.XAxisId = this.objChart.bottomAxis().Id;
      objMY.YAxisId = "MY";
      objMY.LineWidth = 2; //this.objUserSettings.MY.lineWidth; //1 //Nishant 28/07/2021;
      //objMY.LineStyle = this.objUserSettings.MY.lineStyle; //Nishant 28/07/2021

      if (myVisible) {
        this.objChart.DataSeries.set(objMY.Id, objMY);

        for (let i = 0; i < this.objToolfaceData.MYData.length; i++) {
          let objPoint = new ChartData();
          objPoint.x = this.objToolfaceData.MYData[i]["DEPTH"];
          objPoint.y = this.objToolfaceData.MYData[i]["MY"];
          objMY.Data.push(objPoint);
        }
      }

      let objGTF = new DataSeries();
      objGTF.Id = "GTF";
      objGTF.Type = dataSeriesType.Point;
      objGTF.PointStyle = pointStyle.Circle;
      objGTF.PointSize = this.objUserSettings.GTF.lineWidth; //3 //Nishant 28/07/2021;
      objGTF.Title = "GTF";
      //prath 14-10-2021
      //objGTF.Color = util.rgb2hex(this.objUserSettings.GTF.lineColor); // "#52b788"; //Nishant 28/07/2021
      objGTF.Color = this.objUserSettings.GTF.lineColor; // "#52b788"; //Nishant 28/07/2021
      objGTF.XAxisId = this.objChart.bottomAxis().Id;
      objGTF.YAxisId = this.objChart.rightAxis().Id;

      if (GTFVisible) {
        this.objChart.DataSeries.set(objGTF.Id, objGTF);

        for (let i = 0; i < this.objToolfaceData.GTFData.length; i++) {
          let objPoint = new ChartData();
          objPoint.x = this.objToolfaceData.GTFData[i]["DEPTH"];
          objPoint.y = this.objToolfaceData.GTFData[i]["GTF"];

          if (objPoint.y != -999.25 && objPoint.y != 0) {
            objGTF.Data.push(objPoint);
          }
        }
      }

      let objMTF = new DataSeries();
      objMTF.Id = "MTF";
      objMTF.Type = dataSeriesType.Point;
      objMTF.PointStyle = pointStyle.Circle;
      objMTF.PointSize = this.objUserSettings.MTF.lineWidth; //3 //Nishant 28/07/2021;4;
      objMTF.Title = "MTF";
      //prath 14-10-2021
      //objMTF.Color = util.rgb2hex(this.objUserSettings.MTF.lineColor); ////Nishant 28/07/2021; "#118ab2";
      objMTF.Color = this.objUserSettings.MTF.lineColor; ////Nishant 28/07/2021; "#118ab2";
      objMTF.XAxisId = this.objChart.bottomAxis().Id;
      objMTF.YAxisId = this.objChart.rightAxis().Id;
      objMYAxis.Inverted = false;

      if (MTFVisible) {
        this.objChart.DataSeries.set(objMTF.Id, objMTF);

        for (let i = 0; i < this.objToolfaceData.MTFData.length; i++) {
          let objPoint = new ChartData();
          objPoint.x = this.objToolfaceData.MTFData[i]["DEPTH"];
          objPoint.y = this.objToolfaceData.MTFData[i]["MTF"];

          if (objPoint.y != -999.25 && objPoint.y != 0) {
            objMTF.Data.push(objPoint);
          }
        }
      }

      if (GTFVisible || MTFVisible) {
        //Nothing to hide
      } else {
        this.objChart.removeRightAxis();
      }
      Util.StatusSuccess("Data successfully plotted");
      Util.StatusReady();
      this.objChart.reDraw();
    } catch (error) { }
  };

  plotAdnlChart = () => {
    try {
      this.objAdnlChart.DataSeries.clear();
      this.objAdnlChart.Axes.clear();
      this.objAdnlChart.createDefaultAxes();
      this.objAdnlChart.updateChart();

      this.objAdnlChart.leftAxis().Visible = false;
      this.objAdnlChart.leftAxis().ShowLabels = false;
      this.objAdnlChart.leftAxis().ShowTitle = false;
      this.objAdnlChart.leftAxis().GridVisible = false;

      this.objAdnlChart.removeLeftAxis();

      this.objAdnlChart.rightAxis().Visible = false;
      this.objAdnlChart.rightAxis().ShowLabels = false;
      this.objAdnlChart.rightAxis().ShowTitle = false;
      this.objAdnlChart.rightAxis().GridVisible = false;

      this.objAdnlChart.bottomAxis().AutoScale = true;
      this.objAdnlChart.bottomAxis().bandScale = false;
      this.objAdnlChart.bottomAxis().Min = 10000;
      this.objAdnlChart.bottomAxis().Max = 20000;
      this.objAdnlChart.bottomAxis().Title = "MD";
      this.objAdnlChart.bottomAxis().ShowLabels = false;
      this.objAdnlChart.bottomAxis().ShowTitle = false;
      this.objAdnlChart.bottomAxis().LabelAngel = 90;
      this.objAdnlChart.bottomAxis().ShowSelector = false;
      this.objAdnlChart.bottomAxis().IsDateTime = false;
      this.objAdnlChart.bottomAxis().GridVisible = false;
      this.objAdnlChart.bottomAxis().Visible = true;

      this.objAdnlChart.MarginLeft = 0;
      this.objAdnlChart.MarginBottom = 0;
      this.objAdnlChart.MarginTop = 0;
      this.objAdnlChart.MarginRight = 0;

      //Create axis for each additional channels
      this.objAdnlChart.axisPerColumn =
        this.objUserSettings.adnlChannels.length;

      this.objAdnlChart.AbsoluteLeftEdge =
        this.objChart.leftAxis().IRelativePos;

      for (let i = 0; i < this.objUserSettings.adnlChannels.length; i++) {
        let objToolfaceChannel = this.objUserSettings.adnlChannels[i];

        let objAxis = new Axis();
        objAxis.Id = objToolfaceChannel.Mnemonic;
        objAxis.Inverted = false;
        objAxis.Position = axisPosition.left;
        objAxis.ShowLabels = true;
        objAxis.ShowTitle = true;
        objAxis.Title = objToolfaceChannel.Mnemonic;
        objAxis.AutoScale = true;
        objAxis.bandScale = false;
        objAxis.IsDateTime = false;
        objAxis.Visible = true;

        this.objAdnlChart.Axes.set(objAxis.Id, objAxis);
      }

      //Now create data series for each additional channels
      for (let i = 0; i < this.objUserSettings.adnlChannels.length; i++) {
        let objToolfaceChannel = this.objUserSettings.adnlChannels[i];

        let objDataSeries = new DataSeries();

        objDataSeries.Id = objToolfaceChannel.Mnemonic;
        objDataSeries.Name = objToolfaceChannel.Mnemonic;
        objDataSeries.Type = dataSeriesType.Area;
        //prath 14-12-2021
        //objDataSeries.Color = util.rgb2hex(objToolfaceChannel.lineColor); //Nishant 28/07/2021
        objDataSeries.Color = objToolfaceChannel.lineColor; //Nishant 28/07/2021
        objDataSeries.XAxisId = this.objAdnlChart.bottomAxis().Id;
        objDataSeries.YAxisId = objToolfaceChannel.Mnemonic;

        //Add series to the chart
        this.objAdnlChart.DataSeries.set(objDataSeries.Id, objDataSeries);

        //Add data to this series

        for (let j = 0; j < this.objToolfaceData.adnlChannelsData.length; j++) {
          let objAdnlChannelData = this.objToolfaceData.adnlChannelsData[j];

          if (objAdnlChannelData.Mnemonic == objToolfaceChannel.Mnemonic) {
            for (let d = 0; d < objAdnlChannelData.Data.length; d++) {
              let objPoint = new ChartData();
              objPoint.x = objAdnlChannelData.Data[d]["DEPTH"];
              objPoint.y = objAdnlChannelData.Data[d]["VALUE"];

              if (objPoint.y != -999.25) {
                objDataSeries.Data.push(objPoint);
              }
            }
          }
        }
      }

      this.objAdnlChart.reDraw();
    } catch (error) { }
  };
  handleToggleSwitch = async () => {

    await this.setState({ isRealTime: !this.state.isRealTime });
    if (this.state.isRealTime) {
      this.intervalID = setInterval(this.loadData.bind(this), 15000);
    } else {
      this.AxiosSource.cancel();
      await clearInterval(this.intervalID);
      this.intervalID = null;
      //this.loadData();
    }
    sessionStorage.setItem("realTimeToolfaceSummary", this.state.isRealTime.toString());
  };




  render() {
    //this.objToolfaceData.adnlChannelsData.length
    //alert("render called -" + this.state.ShowDrillingWindow);

    let section1 = (
      <div
        id="adnl_channels"
        style={{
          height: "40%",
          width: "98%",
          backgroundColor: "transparent",
        }}
      ></div>
    );

    let section2 = (
      <div
        id="toolface"
        style={{
          height: "60%",
          width: "100%",
          backgroundColor: "transparent",
        }}
      ></div>
    );

    try {
      if (this.objUserSettings.adnlChannels.length == 0) {
        section1.props.style.height = "0%";
        section2.props.style.height = "100%";
      }

      if (this.objUserSettings.adnlChannels.length == 1) {
        section1.props.style.height = "20%";
        section2.props.style.height = "80%";
      }

      if (this.objUserSettings.adnlChannels.length > 1) {
        section1.props.style.height = "40%";
        section2.props.style.height = "60%";
      }
    } catch (error) { }

    return (
      <>
        <div className="row ml-1 mr-1" style={{ justifyContent: "space-between" }}>

          <div className="mr-2">
            <div className="statusCard">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Well Name</h6>
                <div className="_summaryLabelBig">
                  {this.state.WellName}
                </div>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: "20px" }}>
            <DataSelectorInfo objDataSelector={this.state.objDataSelector} isRealTime={this.state.isRealTime} />
          </div>

          <div className="form-inline m-1">
            {/* <div className="eVumaxPanelController" style={{ width: "270px" }}>

              <label className=" mr-1">Realtime</label> <Switch onChange={this.handleToggleSwitch} value={this.state.isRealTime} checked={this.state.isRealTime}></Switch>
              
              <label className=" ml-5 mr-2" onClick={() => {
                this.displayData();
              }} style={{ cursor: "pointer" }}>Undo Zoom</label>  <FontAwesomeIcon
                icon={faSearchMinus}
                size="lg"
                onClick={() => {
                  this.displayData();
                }}
              />

            </div> */}


            <div className="eVumaxPanelController" style={{ width: this.objLogger.LogList.length > 0 ? "380px" : "255px" }}>
              <label className=" mr-1">Realtime</label> <Switch onChange={this.handleToggleSwitch} value={this.state.isRealTime} checked={this.state.isRealTime}></Switch>
              <label className=" ml-5 mr-1" onClick={() => { this.displayData(); }} style={{ cursor: "pointer" }}>Undo Zoom</label>
              <FontAwesomeIcon icon={faSearchMinus} size="lg" onClick={() => { this.displayData(); }} />


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
          {/* <div className="col-lg-12 eVumaxPanelTitle">
            <div>
              <label className="summaryTitle">{this.state.WellName}</label>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="float-right mr-2">
              <FontAwesomeIcon
                icon={faUndo}
                onClick={() => {
                  this.displayData();
                }}
              />
            </div>
          </div> */}

          {/* <div className="mr-2 ">
              <div className="statusCard_">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">Undo Zoom</h6>  <FontAwesomeIcon
                  icon={faUndo}
                  onClick={() => {
                    this.refreshROPLineChart();
                  }}
                />
                
                </div>
              </div>
            </div> */}
        </div>

        <TabStrip
          selected={this.state.selected}
          onSelect={this.handleSelect}
          keepTabsMounted={true}
        >
          <TabStripTab title="Toolface Evaluation Plot">
            <div
              style={{
                height: "calc(100vh - 400px)",
                width: "calc(100vw - 110px)",
                backgroundColor: "transparent",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "calc(100% - 250px)",
                  backgroundColor: "transparent",
                  float: "left",
                }}
              >
                {section1}
                {section2}
              </div>

              <div
                style={{
                  height: "100%",
                  width: "250px",
                  backgroundColor: "transparent",
                  float: "right",
                }}
              >
                <div
                  id="polar"
                  style={{
                    height: "250px",
                    width: "250px",
                    backgroundColor: "",
                  }}
                ></div>
                <div
                  id="summaryTable"
                  style={{
                    height: "250px",

                    backgroundColor: "",
                    padding: "15px",
                  }}
                >
                  <table className="table table-bordered ">
                    <thead>
                      <tr>
                        <th></th>
                        <th style={{ color: "white" }}>%</th>
                        <th style={{ color: "white" }}>Avg. ROP</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: "green" }}>Rotary</td>
                        <td style={{ color: "yellow" }}>
                          {this.state.RotaryPercent}
                        </td>
                        <td style={{ color: "yellow" }}>
                          {this.state.RotaryROP}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: "darkgreen" }}>Slide</td>
                        <td style={{ color: "yellow" }}>
                          {this.state.SlidePercent}
                        </td>
                        <td style={{ color: "yellow" }}>
                          {this.state.SlideROP}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <br />

                  <table className="table table-bordered ">
                    <thead>
                      <tr>
                        <th></th>
                        <th style={{ color: "white" }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: "green" }}>Out of Drlg Window</td>
                        <td style={{ color: "yellow" }}>
                          {this.state.OutOfDrlgWindow}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: "green" }}>Out of ROP Window</td>
                        <td style={{ color: "yellow" }}>
                          {this.state.OutOfROPWindow}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div
              id="toolface_legend"
              style={{
                textAlign: "center",
                height: "40px",
                //width: "calc(100vw - 90px)",
                backgroundColor: "transparent",
                display: "inline-block",
              }}
            ></div>

            <div style={{ padding: "20px" }}>


              <DataSelector objDataSelector={this.state.objDataSelector} wellID={this.WellId} selectionChanged={this.selectionChanged} ></DataSelector>
              <div id="warning" style={{ paddingBottom: "10px", padding: "0px", height: "20px", width: "100%", fontWeight: "normal", backgroundColor: "transparent", color: "black", position: "absolute" }}> <label id="lblWarning" style={{ color: "black", marginLeft: "10px" }} ></label> </div>

            </div>
          </TabStripTab>

          <TabStripTab title="Customize">
            <div
              className="row"
              style={{
                height: "calc(100vh - 210px)",
                width: "calc(100vw - 100px)",
                overflowY: "scroll",
              }}
            >
              <div className="col-lg-4 col-xl-4 col-md-6 col-sm-12 p-5">
                <div className="col-lg-12 col-xl-10 col-md-10 col-sm-12 mb-3">
                  <ListView
                    data={this.state.primaryPlotList}
                    style={{ width: "100%", height: 300 }}
                    item={this.PrimaryPlots_ListView}
                    header={this.PrimaryPlot_Header}
                  />
                </div>
                <div className="clearfix"></div>
                <div className="col-lg-12 col-xl-10 col-md-10 col-sm-12">
                  <ListView
                    data={this.state.adnlChannels}
                    item={(props) => (
                      <this.Channels_ListView
                        {...props}
                        handleSelected={this.Channel_handleSelected}
                      />
                    )}
                    style={{ width: "100%", height: 300 }}
                    header={this.additionalChannel_Header}
                  />
                </div>
                <div className="clearfix"></div>
              </div>

              {this.state.isVisibleFormat && (
                //vimal
                <div
                  className="col-lg-8 col-xl-8 col-md-6 col-sm-12"
                  style={{ marginTop: "50px" }}
                >
                  <div className="row">
                    <div className="col-lg-6">
                      <span className="mt-2 mb-2">
                        {" "}
                        <b style={{ wordSpacing: "5px" }}>Line Formatting {" (" + this._selectedItem.Mnemonic})</b>
                      </span>
                      <br />
                      <hr />

                      <form>
                        <br />

                        <div className="form-groupo row">
                          <Checkbox
                            id={"chkLineVisible"}
                            className="col-lg-4 col-xl-3 col-md-4 col-sm-4"
                            value={this.state.LineVisible}
                            onChange={(e) => this.OnChange(e, "LineVisible")}
                            label="Visible"
                          />
                        </div>
                        <br />
                        <div className="form-group row">
                          <label className="col-lg-4 col-xl-3 col-md-4 col-sm-4 col-form-label">
                            Line Style
                          </label>
                          <div className="col-lg-9">
                            <DropDownList
                              className="form-control"
                              textField="text"
                              dataItemKey="id"
                              data={this.state.LineStyleList}
                              onChange={(e) => this.OnChange(e, "LineStyle")}
                              value={this.state.LineStyle}
                            />
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-4 col-xl-3 col-md-4 col-sm-4 col-form-label">
                            Line Width
                          </label>
                          <div className="col-lg-9">
                            <span>
                              <NumericTextBox
                                value={this.state.LineWidth}
                                onChange={(e) => this.OnChange(e, "LineWidth")}
                                format="n2"
                                width="100px"
                              />
                            </span>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-4 col-xl-3 col-md-4 col-sm-4 col-form-label">
                            Line Color
                          </label>
                          <div className="col-lg-9">
                            <ColorPicker
                              value={this.state.LineColor}
                              onChange={(e) => this.OnChange(e, "LineColor")}
                              view={"gradient"}
                            />
                          </div>
                        </div>

                        {/* <div className="form-group row">
                          <Checkbox
                            id={"chb1"}
                            className="offset-lg-3"
                            label={"Step Lines"}
                          />
                          <Checkbox
                            id={"chb1"}
                            className="offset-lg-3"
                            label={"Show Points"}
                          />
                        </div> */}
                      </form>

                      {/* {" "}
                         <span className="mt-2 mb-2">
                        <b>Point Formatting</b>
                      </span>
                      <br />

                      <hr />

                      <form>
                        <div className="form-group row">
                          <label className="col-lg-3 col-form-label">
                            Point Style
                          </label>
                          <div className="col-lg-9">
                            <DropDownList
                              textField="Name"
                              className="form-control"
                              dataItemKey="Id"
                            />
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-3 col-form-label">
                            Point Size
                          </label>
                          <div className="col-lg-9">
                            <span>
                              <NumericTextBox format="n2" width="100px" />
                            </span>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-3 col-form-label">
                            Fill Color
                          </label>
                          <div className="col-lg-9">
                            <ColorPicker view={"gradient"} />
                          </div>
                        </div>
                      </form>
                    */}
                    </div>
                    {/* <div className="col-lg-6">
                      <div className="form-group row">
                        <Checkbox
                          id={"chb1"}
                          className="offset-lg-3"
                          label={"Ignore negative values"}
                        />
                      </div>
                      <div className="form-group row">
                        <Checkbox
                          id={"chb1"}
                          className="offset-lg-3"
                          label={"Convert Scale -180 to 180"}
                        />
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-3 col-form-label">
                          Track Height
                        </label>
                        <div className="col-lg-9">
                          <span>
                            <NumericTextBox format="n2" width="100px" /> %
                          </span>
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-lg-3 col-form-label">
                          Down Sample Grouping Func.
                        </label>
                        <div className="col-lg-9">
                          <DropDownList
                            textField="Name"
                            className="form-control"
                            dataItemKey="Id"
                          />
                        </div>
                      </div>

                      <br />
                      <hr />
                      <div className="form-group row">
                        <label className="col-lg-3 col-form-label">
                          X Column
                        </label>
                        <div className="col-lg-9">
                          <DropDownList
                            textField="Name"
                            className="form-control"
                            dataItemKey="Id"
                          />
                        </div>
                      </div>
                      <br />
                      <hr />
                      <div className="form-group row">
                        <Checkbox
                          id={"chb1"}
                          className="offset-lg-3"
                          label={"Use Depth Log Data"}
                        />
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-3 col-form-label">
                          Wellbore
                        </label>
                        <div className="col-lg-9">
                          <DropDownList
                            textField="Name"
                            className="form-control"
                            dataItemKey="Id"
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-3 col-form-label">
                          Depth Log
                        </label>
                        <div className="col-lg-9">
                          <DropDownList
                            textField="Name"
                            className="form-control"
                            dataItemKey="Id"
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-3 col-form-label">
                          Mnemonic
                        </label>
                        <div className="col-lg-9">
                          <DropDownList
                            textField="Name"
                            className="form-control"
                            dataItemKey="Id"
                          />
                        </div>
                      </div>
                    </div>
                   */}
                  </div>

                  <div className="clearfix"></div>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="float-left mr-2 mb-3">
                        <Button id="cmdApply" onClick={this.onClick_Apply}>
                          Apply
                        </Button>{" "}
                        <Button
                          id="cmdApplyCancel"
                          onClick={this.onClick_ApplyCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="clearfix"></div>
            </div>
          </TabStripTab>
          <TabStripTab title="Drlg Window">
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-11 col-xs-2">
                <div className="float-right mr-2 mb-3">
                  <Button id="cmdsave" onClick={this.onClick_Save}>
                    Save
                  </Button>{" "}
                  {/* <Button id="cmdApplyCancel" onClick={this.onClick_SaveCancel}>
                    Cancel
                  </Button> */}
                </div>
              </div>

            </div>
            <div className="row ">
              <div className="col-lg-6 p-5">
                <div className="row mb-3 mt-2">
                  <div className="form-group">
                    <Checkbox
                      id={"chkGeoDrlgWindow"}
                      className="col-lg-12"
                      label={"Enable and Display Geological Drilling Window"}
                      onChange={(e) => this.OnChange(e, "ShowDrillingWindow")}
                      value={this.state.ShowDrillingWindow}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div
                    className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xl-10"
                    style={{ width: "80vw" }}
                  >
                    <Grid
                      style={{ height: "30vh" }}
                      //  data={this.state.drlgWindowData}
                      data={
                        this.state.GeoDrlgWindowData != null
                          ? this.state.GeoDrlgWindowData.map((item: any) => ({
                            ...item,
                            inEdit: item.SRNO === this.state.GeoDrlgWindowID,
                          }))
                          : null
                      }
                      resizable={true}
                      scrollable={"scrollable"}
                      sortable={true}
                      onItemChange={this.GeogrdItemChange}
                      onRowClick={this.GeogrdRowClick}
                      // onRowDoubleClick={this.grdRowDblClick}
                      // selectedField="inEdit"
                      editField="inEdit"
                    >
                      <GridToolbar>
                        <Button onClick={this.addGeoDrlgWindowData}>Add</Button>
                      </GridToolbar>

                      {/* <Column
                      width="100px"
                      field="SRNO"
                      headerClassName="text-center"
                      editor="numeric"
                      resizable={true}
                      className="text-right "
                      title="Sr No"
                      editable={false}
                    /> */}
                      <Column
                        width="100px"
                        field="StartMD"
                        headerClassName="text-center"
                        editor="numeric"
                        resizable={true}
                        className="text-right"
                        title="Start MD"
                        editable={true}
                      />
                      <Column
                        width="150px"
                        field="EndMD"
                        headerClassName="text-center"
                        className="text-right"
                        title="End MD"
                        editor="numeric"
                        editable={false}
                      />
                      {true && (
                        <Column
                          width="100px"
                          field="TopWindow"
                          headerClassName="text-center"
                          className="text-right"
                          title="Top Window"
                          editor="numeric"

                        />
                      )}
                      {true && (
                        <Column
                          width="150px"
                          field="BottomWindow"
                          headerClassName="text-center"
                          className="text-right"
                          title="Bottom Window"
                          editor="numeric"
                        />
                      )}

                      <Column
                        width="70px"
                        headerClassName="text-center"
                        resizable={false}
                        field="removeTrajData"
                        title="*"
                        cell={(props) => (
                          <td className="text-center">
                            <span
                              onClick={(e) =>
                                this.cmdRemoveGeoDrlgWindowRow(
                                  e,
                                  props.dataItem
                                )
                              }
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </span>
                          </td>
                        )}
                      />
                    </Grid>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group row w-100">
                      <label className="col-lg-4 col-xl-3 col-md-4 col-sm-4 col-form-label text-left">
                        Transperancy
                      </label>
                      <div className="col-lg-4 col-xl-3 col-md-4 col-sm-4">
                        <NumericTextBox
                          className="form-control"
                          min={10} //Nishant 12/08/2021
                          max={100} //Nishant 12/08/2021
                          value={this.state.GeoDrlgWindowTrans}
                          onChange={(e) =>
                            this.OnChange(e, "GeoDrlgWindowTrans")
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <div className="form-group row w-100">
                      <label className="col-lg-3 col-xl-3 col-md-4 ol-sm-4 col-form-label text-left">
                        Window Color
                      </label>
                      <div className="col-lg-3">
                        <ColorPicker
                          value={this.state.GeoDrlgWindowColor}
                          view={"gradient"}
                          onChange={(e) =>
                            this.OnChange(e, "GeoDrlgWindowColor")
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 p-5">
                <div className="row mb-3 mt-2">
                  <div className="form-group">
                    <Checkbox
                      id={"chkROPDrlgWindow"}
                      className="col-lg-12"
                      label={"Enable and Display ROP Drilling Window"}
                      onChange={(e) =>
                        this.OnChange(e, "ShowROPDrillingWindow")
                      }
                      value={this.state.ShowROPDrillingWindow}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div
                    className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-10"
                    style={{ width: "80vw" }}
                  >
                    {/* <div className="col-lg-12"> */}
                    <Grid
                      style={{ height: "30vh" }}
                      //  data={this.state.drlgWindowData}
                      data={
                        this.state.ROPDrlgWindowData != null
                          ? this.state.ROPDrlgWindowData.map((item: any) => ({
                            ...item,
                            inEdit: item.SRNO === this.state.ROPDrlgWindowID,
                          }))
                          : null
                      }
                      resizable={true}
                      scrollable={"scrollable"}
                      sortable={true}
                      onItemChange={this.ROPgrdItemChange}
                      onRowClick={this.ROPgrdRowClick}
                      // onRowDoubleClick={this.grdRowDblClick}
                      selectedField="selected"
                      editField="inEdit"
                    >
                      <GridToolbar>
                        <Button onClick={this.addROPDrlgWindowData}>Add</Button>
                      </GridToolbar>

                      <Column
                        width="100px"
                        field="StartMD"
                        headerClassName="text-center"
                        editor="numeric"
                        resizable={true}
                        className="text-right"
                        title="Start MD"
                        editable={true}
                      />
                      <Column
                        width="150px"
                        field="EndMD"
                        headerClassName="text-center"
                        className="text-right"
                        title="End MD"
                        editor="numeric"
                        editable={false}
                      />
                      {true && (
                        <Column
                          width="100px"
                          field="TopWindow"
                          headerClassName="text-center"
                          className="text-right"
                          title="Top Window"
                          editor="numeric"
                        />
                      )}
                      {true && (
                        <Column
                          width="150px"
                          field="BottomWindow"
                          headerClassName="text-center"
                          className="text-right"
                          title="Bottom Window"
                          editor="numeric"
                        />
                      )}

                      <Column
                        width="70px"
                        headerClassName="text-center"
                        resizable={false}
                        field="removeTrajData"
                        title="*"
                        cell={(props) => (
                          <td className="text-center">
                            <span
                              onClick={(e) =>
                                this.cmdRemoveROPDrlgWindowRow(
                                  e,
                                  props.dataItem
                                )
                              }
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </span>
                          </td>
                        )}
                      />
                    </Grid>
                  </div>

                  <br />
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group row w-100">
                        <label className="col-lg-4 col-xl-3 col-md-4 col-sm-4 col-form-label text-left">
                          Transperancy
                        </label>
                        <div className="col-lg-4 col-xl-3 col-md-4 col-sm-4">
                          <NumericTextBox
                            className="form-control"
                            min={10} //Nishant 12/08/2021
                            max={100} //Nishant 12/08/2021
                            value={this.state.ROPDrlgWindowTrans}
                            onChange={(e) =>
                              this.OnChange(e, "ROPDrlgWindowTrans")
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-12">
                      <div className="form-group row w-100">
                        <label className="col-lg-3 col-xl-3 col-md-4 col-sm-4 col-form-label text-left">
                          Window Color
                        </label>
                        <div className="col-lg-3">
                          <ColorPicker
                            value={this.state.ROPDrlgWindowColor}
                            view={"gradient"}
                            onChange={(e) =>
                              this.OnChange(e, "ROPDrlgWindowColor")
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <br />
                </div>
              </div>
            </div>
          </TabStripTab>

          {true && <TabStripTab title="Settings">
            <div className="row " style={{ width: "90vw" }}>
              <div className="col-lg-12">
                <div className="float-right mr-2 mb-3">
                  <Button id="cmdsave" onClick={this.onClick_Save}>
                    Save
                  </Button>{" "}
                  {/* <Button id="cmdApplyCancel" onClick={this.onClick_SaveCancel}>
                    Cancel
                  </Button> */}
                </div>
              </div>

              <div className="col-lg-6 p-5">
                <div className="row mb-3">
                  <div className="form-group">
                    <Checkbox
                      id={"chkShowFormationTops"}
                      className="col-lg-12"
                      label={"Show Formation Tops"}
                      onChange={(e) => this.OnChange(e, "ShowFormationTops")}
                      value={this.state.ShowFormationTops}
                    />
                  </div>
                </div>

                <div className="row mb-3 mt-2">
                  <div className="form-group">
                    <Checkbox
                      id={"chkGTFVector"}
                      className="col-lg-12"
                      label={"GTFVector"}
                      onChange={(e) => this.OnChange(e, "GTFVector")}
                      value={this.state.GTFVector}
                    />
                    <Checkbox
                      id={"chkMTFVector"}
                      className="col-lg-12"
                      label={"MTFVector"}
                      onChange={(e) => this.OnChange(e, "MTFVector")}
                      value={this.state.MTFVector}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="form-group">
                    <Checkbox
                      id={"chkFilterByMinSlideLength"}
                      className="col-lg-12"
                      label={"Filter By MinSlide Length"}
                      onChange={(e) =>
                        this.OnChange(e, "FilterByMinSlideLength")
                      }
                      value={this.state.FilterByMinSlideLength}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="form-group row w-100">
                    <label className="col-lg-3 col-form-label text-right">
                      MinSlideLength
                    </label>
                    <div className="col-lg-3">
                      <NumericTextBox
                        className="form-control"
                        value={this.state.MinSlideLength}
                        onChange={(e) => this.OnChange(e, "MinSlideLength")}
                        disabled={!this.state.FilterByMinSlideLength}
                      />
                    </div>
                  </div>

                  <div className="form-group row w-100">
                    <label className="col-lg-3 col-form-label text-right">
                      MinRotationFootage
                    </label>
                    <div className="col-lg-3">
                      <NumericTextBox
                        className="form-control"
                        value={this.state.MinRotationFootage}
                        onChange={(e) => this.OnChange(e, "MinRotationFootage")}
                        disabled={!this.state.FilterByMinSlideLength}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="col-lg-6 p-5">
                <div className="row">
                  <div className="form-group row w-100">
                    <label className="col-lg-3 col-form-label text-right">
                      Convert Scale
                    </label>
                    <div className="col-lg-3 pt-2">
                      <Checkbox
                        id={"chkconvertScale"}
                        className="col-lg-12"
                        onChange={(e) => this.OnChange(e, "convertScale")}
                        value={this.state.convertScale}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="form-group row w-100">
                    <label className="col-lg-3 col-form-label text-right">
                      Highlight Trans
                    </label>
                    <div className="col-lg-3">
                      <NumericTextBox
                        className="form-control"
                        value={this.state.HighlightTrans}
                        onChange={(e) => this.OnChange(e, "HighlightTrans")}
                      />
                    </div>
                  </div>

                  <div className="form-group row w-100">
                    <label className="col-lg-3 col-form-label text-right">
                      Highlight Color
                    </label>
                    <div className="col-lg-3">
                      <ColorPicker
                        value={this.state.HighlightColor}
                        view={"gradient"}
                        onChange={(e) => this.OnChange(e, "HighlightColor")}
                      />
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="form-group row w-100">
                    <label className="col-lg-3 col-form-label text-right">
                      Direction
                    </label>
                    <div className="col-lg-3 pt-1">
                      <RadioButton
                        name="group1"
                        value={0}
                        checked={this.state.Direction === 0}
                        label="NS"
                        onChange={(e) => this.OnChange(e, "Direction")}
                      />

                      <RadioButton
                        name="group1"
                        value={1}
                        checked={this.state.Direction === 1}
                        label="EW"
                        onChange={(e) => this.OnChange(e, "Direction")}
                      />
                    </div>
                  </div>
                </div>
              </div> */}

              {/* <div className="col-lg-6 p-5">
                <div className="row mb-3 mt-2">
                  <div className="form-group">
                    <Checkbox
                      id={"chkconvertScale"}
                      className="col-lg-12"
                      label={"Convert Scale"}
                      onChange={(e) => this.OnChange(e, "convertScale")}
                      value={this.state.convertScale}
                    />
                  </div>
                </div>

                <div className="row mb-3">

                  <br />
                  <div className="">
                    <div className="form-group row w-100">
                      <label className="col-lg-3 col-form-label text-right">
                        Highlight Trans
                      </label>
                      <div className="col-lg-3">
                        <NumericTextBox
                          className="form-control"
                          value={this.state.HighlightTrans}
                          onChange={(e) => this.OnChange(e, "HighlightTrans")}
                        />
                      </div>
                    </div>

                    <div className="form-group row w-100">
                      <label className="col-lg-3 col-form-label text-right">
                        Highlight Color
                      </label>
                      <div className="col-lg-3">
                        <ColorPicker
                          value={this.state.HighlightColor}
                          view={"gradient"}
                          onChange={(e) => this.OnChange(e, "HighlightColor")}
                        />
                      </div>
                    </div>

                    <div className="form-group row w-100">
                      <RadioButton
                        name="group1"
                        value={0}
                        checked={this.state.Direction === 0}
                        label="NS"
                        onChange={(e) => this.OnChange(e, "Direction")}
                      />

                      <RadioButton
                        name="group1"
                        value={1}
                        checked={this.state.Direction === 1}
                        label="EW"
                        onChange={(e) => this.OnChange(e, "Direction")}
                      />
                    </div>
                  </div>

                  <br />
                </div>
              </div>

            */}
            </div>
          </TabStripTab>}
        </TabStrip>

        {this.state.showAdditionalChannelWindow && (
          <STDChannels
            LogType={2}
            STDChannelsEvents={this.STDChannels_Clicks}
          />
        )}
      </>
    );
  }

  onClick_Save = () => {
    this.setData();
    this.saveSettings();
  };

  setData = () => {
    // remove proerty selected
    this.state.adnlChannels.map((channels) => {
      delete channels.selected;
    });

    this.state.primaryPlotList.map((channels) => {
      delete channels.selected;

      if (channels.Mnemonic == this.state.MY.Mnemonic) {
        this.setState({ MY: channels });
      }

      if (channels.Mnemonic == this.state.GTF.Mnemonic) {
        this.setState({ GTF: channels });
      }
      if (channels.Mnemonic == this.state.MTF.Mnemonic) {
        this.setState({ MTF: channels });
      }
      if (channels.Mnemonic == this.state.PlanDLS.Mnemonic) {
        this.setState({ PlanDLS: channels });
      }
      if (channels.Mnemonic == this.state.ActualDLS.Mnemonic) {
        this.setState({ ActualDLS: channels });
      }
      if (channels.Mnemonic == this.state.PlanTVD.Mnemonic) {
        this.setState({ PlanTVD: channels });
      }
      if (channels.Mnemonic == this.state.ActualTVD.Mnemonic) {
        this.setState({ ActualTVD: channels });
      }
    });

    //GEO
    this.objUserSettings.ShowDrillingWindow = this.state.ShowDrillingWindow;
    this.objUserSettings.GeoDrlgWindowData = this.state.GeoDrlgWindowData;
    this.objUserSettings.GeoDrlgWindowColor = this.state.GeoDrlgWindowColor;
    this.objUserSettings.GeoDrlgWindowTrans = this.state.GeoDrlgWindowTrans;

    // ROP
    this.objUserSettings.ShowROPDrillingWindow =
      this.state.ShowROPDrillingWindow;
    this.objUserSettings.ROPDrlgWindowData = this.state.ROPDrlgWindowData;
    this.objUserSettings.ROPDrlgWindowColor = this.state.ROPDrlgWindowColor;
    this.objUserSettings.ROPDrlgWindowTrans = this.state.ROPDrlgWindowTrans;

    this.objUserSettings.MY = this.state.MY;
    this.objUserSettings.GTF = this.state.GTF;
    this.objUserSettings.MTF = this.state.MTF;
    this.objUserSettings.PlanDLS = this.state.PlanDLS;
    this.objUserSettings.ActualDLS = this.state.ActualDLS;
    this.objUserSettings.PlanTVD = this.state.PlanTVD;
    this.objUserSettings.ActualTVD = this.state.ActualTVD;
    this.objUserSettings.adnlChannels = this.state.adnlChannels;

    // Settings
    this.objUserSettings.ShowFormationTops = this.state.ShowFormationTops;
    this.objUserSettings.MTFVector = this.state.MTFVector;
    this.objUserSettings.GTFVector = this.state.GTFVector;
    this.objUserSettings.FilterByMinSlideLength =
      this.state.FilterByMinSlideLength;
    this.objUserSettings.MinSlideLength = this.state.MinSlideLength;
    this.objUserSettings.MinRotationFootage = this.state.MinRotationFootage;
    this.objUserSettings.convertScale = this.state.convertScale;
    this.objUserSettings.HighlightColor = this.state.HighlightColor;
    this.objUserSettings.HighlightTrans = this.state.HighlightTrans;
    this.objUserSettings.Direction = this.state.Direction;
  };

  onClick_SaveCancel = () => { };

  // refreshChart = () => {
  //   try {
  //   } catch (error) { }
  // };

  saveSettings = () => {
    try {
      Util.StatusInfo("Getting data from the server  ");

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "Toolface";
      objBrokerRequest.Function = "SaveUserSettings";

      let paramuserid: BrokerParameter = new BrokerParameter("UserId", "admin");
      objBrokerRequest.Parameters.push(paramuserid);

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );
      objBrokerRequest.Parameters.push(paramwellId);

      let paramSettingsData: BrokerParameter = new BrokerParameter(
        "SettingsData",
        JSON.stringify(this.objUserSettings)
      );
      objBrokerRequest.Parameters.push(paramSettingsData);


      this.AxiosSource = axios.CancelToken.source();
      axios
        .get(_gMod._performTask, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          this.setState({ selected: 0 });
          //reload all the connections
          this.loadData();
          Util.StatusSuccess("Data successfully retrived  ");
        })
        .catch((error) => {
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
        });
    } catch (error) { }
  };
}

export default ToolfaceSummary;
