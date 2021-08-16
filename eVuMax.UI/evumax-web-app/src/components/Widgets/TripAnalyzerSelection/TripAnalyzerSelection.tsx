import React, { Component } from "react";

import $ from "jquery";

import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import "@progress/kendo-react-intl";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import "react-router-dom";
import ProcessLoader from "../../loader/loader";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIndent,
  faChartArea,
  fas,
  faTrash,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

import {
  DateTimePicker,
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
} from "@progress/kendo-react-inputs";
import { comboData } from "../../../eVuMaxObjects/UIObjects/comboData";

import * as utilFunc from "../../../utilFunctions/utilFunctions";

import { TripDepthRange } from "../../../eVuMaxObjects/dataObjects/DataObjects/tripDepthRange"; //new prath
import GlobalMod from "../../../objects/global";
import CustomLoader from "../../loader/loader";
import { confirmAlert } from "react-confirm-alert";
import { isObjectBindingPattern, isThisTypeNode, JsxEmit } from "typescript";
import { values } from "d3";
let _gMod = new GlobalMod();

interface IProps {
  plotID: string;
  showBenchMarks?: boolean | true;
}

// interface IState {
//     tripAnalyzerSelection?: any;
//     showCustomTagList?: false,
// }

//API TripAnalyzerSelection Class object
//***************************************** */

//  UseCustomTags { get; set; } = false;
//  DataTable TagSourceData { get; set; } = new DataTable();
//  DataTable grdTripTagData { get; set; } = new DataTable();
//  double DepthInterval { get; set; } = 0;
//  TripAnalyzer.enumTripDirection TripDirection { get; set; } = TripAnalyzer.enumTripDirection.TripIn;

//  bool UseDepthRange { get; set; } = false;
//  bool RemoveFillupTime { get; set; } = false;
//  bool IncludePipeMovement { get; set; } = false;
//  string DepthVumaxUnitID { get; set; } = "";
//  Dictionary<int, TripDepthRange> DepthRanges { get; set; } = new Dictionary<int, TripDepthRange>();

//public TripSpeedBenchMark objBenchMarks = new TripSpeedBenchMark();
//  double BenchMarkSpeedWOConnection { get; set; } = 0;
//  double BenchMarkSpeedWithConnection { get; set; } = 0;

// grdTripTagData.Columns.Add("PHASE_INDEX", typeof(System.Int64));
// grdTripTagData.Columns.Add("PHASE_ID", typeof(System.Int64));
// grdTripTagData.Columns.Add("PHASE_NAME", typeof(System.String));
// grdTripTagData.Columns.Add("STEP_ID", typeof(System.String));
// grdTripTagData.Columns.Add("STEP_NAME", typeof(System.String));

// grdTripTagData.Columns.Add("EMPH_ID", typeof(System.String));
// grdTripTagData.Columns.Add("EMPH_NAME", typeof(System.String));

// grdTripTagData.Columns.Add("TIMELOG_ID", typeof(System.String));
// grdTripTagData.Columns.Add("TIMELOG_NAME", typeof(System.String));

// grdTripTagData.Columns.Add("START_DATE", typeof(System.String));
// grdTripTagData.Columns.Add("END_DATE", typeof(System.String));

//Tag Source Data
//  TagSourceData.Columns.Add("SOURCE_ID", typeof(System.String));
//  TagSourceData.Columns.Add("SOURCE_NAME", typeof(System.String));

//************************************ */

export default class TripAnalyzerSelection extends Component<IProps> {
  public static defaultProps: Partial<IProps> = {
    showBenchMarks: true,
  };
  constructor(parentRef, props: any) {
    super(props);
    this.__parentRef = parentRef;

    this.WellId = parentRef.WellId;
  }
  WellId: string = "";
  selectedTab: number = 0;
  __parentRef: any;

  state = {
    objTripAnalyzerSelection: {} as any,
    selectedTag: [],
    customTagList: [] as comboData[],
    selectedCustomTag: new comboData(),
    isProcess: false,
    grdData: [],
    selectedTab: 0,
    grdDepthRange: [] as any,
    objBenchMarks: {} as any,
    grdSpeedProfile: [],
    currentSrNo: null, // Speed Profile Grd
    currentPhaseIndex: 0,
    currentDepthRangeSrNo: 0, // used for depth Range Entry

    objTagDepthInformation: {} as any,
    editID: 0, //grdDepthRanges
    showDepthRangeEditor: false,
  };

  //Initialize chart after component was mounted
  componentDidMount() {
    try {
      //Prepare chart object
      this.loadData();
    } catch (error) { }
  }

  componentWillUpdate() {
    try {
    } catch (error) { }
  }

  //calls when user clicks on selection method buttons
  tabSelectionChanged = (s: number) => {
    try {
    } catch (error) { }
  };

  handleChange = (event: any, field: string) => {
    let value = event.value;
    const name = field;

    if (field == "TripDirection_TripIn") {


    }

    if (
      field == "TripSpeedWOConnection" ||
      field == "TripSpeedWithConnection"
    ) {
      let edited: any = this.state.objBenchMarks;
      edited[field] = value;
      this.setState({
        objBenchMarks: edited,
      });
      this.forceUpdate();

      return;
    }

    let edited: any = this.state.objTripAnalyzerSelection;
    edited[field] = value;
    this.setState({
      objTripAnalyzerSelection: edited,
    });
    this.forceUpdate();

    if (field == "UseCustomTags") {
      //load Drilling Tag List
      if (value == false) {
        let objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "Summary.Manager";
        objBrokerRequest.Broker = "TripAnalyzerSelection";
        objBrokerRequest.Function = "getDrillingTagList";

        let paramwellId: BrokerParameter = new BrokerParameter(
          "WellId",
          this.WellId
        );
        //let paramTagID: BrokerParameter = new BrokerParameter("CustomTagSourceID", this.props.plotID);

        objBrokerRequest.Parameters.push(paramwellId);
        //objBrokerRequest.Parameters.push(paramTagID);

        axios
          .get(_gMod._getData, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json;charset=UTF-8",
            },
            params: { paramRequest: JSON.stringify(objBrokerRequest) },
          })
          .then((res) => {
            //
            const objData = JSON.parse(res.data.Response);
            if (objData.length == 0) {
              this.setState({
                isProcess: false,
                grdData: [],
              });
              return;
            }

            let objGrdData = objData.map((dataItem: any) =>
              Object.assign({ selected: false, selected_: false }, dataItem)
            );
            //  let objGrdTagDepthInformation = Object.values(objData.TagDepthInformation);

            let edited = this.state.objTripAnalyzerSelection;
            // let objTagDepthInformation = Object.values(objData.TagDepthInformation);
            edited["TagSelection"] = []; //clear tagSelection

            this.setState({
              isProcess: false,
              grdData: objGrdData,
              objTripAnalyzerSelection: edited,
              selectedTag: [],
              selectedCustomTag: new comboData("", ""),

              // objTagDepthInformation: objGrdData
            });

            this.forceUpdate();

            // let customTagList: comboData[] = [];
            // for (let index = 0; index < objData.TagSourceData.length; index++) {
            //     const element = objData.TagSourceData[index];
            //     let objItem: comboData = new comboData();
            //     objItem.id = element.SOURCE_ID;
            //     objItem.text = element.SOURCE_NAME;
            //     customTagList.push(objItem);
            // }
            // if (customTagList.length > 0) {
            //     this.setState({
            //         customTagList: customTagList
            //     });
            // }

            // //load grdTripTagData
            // objData.grdTripTagData = objData.grdTripTagData.map((dataItem: any) => Object.assign({ selected: false }, dataItem));
            // let selectedTag = [];

            // if (Object.values(objData.objUserSettings.TagSelection).length > 0) {
            //     selectedTag = Object.values(objData.objUserSettings.TagSelection)
            // } else {
            //     selectedTag = [];
            // }

            // // let grdDepthRange = Object.values(objData.objUserSettings.TagDepthInformation.map((dataItem: any) => Object.assign({ PhaseIndex: 0 }, dataItem))); //Object.values(objData.objUserSettings.TagDepthInformation);
            // // if (grdDepthRange.length == 0) {
            // //     grdDepthRange = [];
            // // }

            // //load BenchMarks
            // let objBenchMarks = objData.objUserSettings.objBenchMarks;

            // let grdSpeedProfile = Object.values(objData.objUserSettings.objBenchMarks.speedProfile);
            // if (grdSpeedProfile.length == 0) {
            //     grdSpeedProfile = [];
            // }

            // this.setState({
            //     objTripAnalyzerSelection: objData.objUserSettings,
            //     grdData: objData.grdTripTagData,
            //     objBenchMarks: objBenchMarks,
            //     grdSpeedProfile: grdSpeedProfile,
            //     objTagDepthInformation: Object.values(objData.objUserSettings.TagDepthInformation),
            //     selectedTag: selectedTag

            // });

            // this.forceUpdate();
            // let index = this.state.grdData.findIndex((value: any) => value.PHASE_INDEX == selectedTag[0]);
            // if (index > -1) {
            //     let edited = this.state.grdData;
            //     edited[index].selected = true;

            //     this.setState({
            //         grdData: edited
            //     });
            // }
            // this.forceUpdate();
          })
          .catch((error) => {
            $("#loader").hide();
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
      } else {
        //Clear current grdData

        this.setState({
          grdData: [],
        });
      }
    }
  };

  handleChangeDropDown = (event: any, field?: string) => {
    //Clear TagSelected

    this.setState({
      selectedTag: [],
    });
    this.forceUpdate();

    let value = event.value;
    const name = field;
    let edited: any = this.state.objTripAnalyzerSelection;
    if (field == "TagSourceID") {
      value = event.value.id;
      edited["TagSourceID"] = value;

      this.setState({
        selectedCustomTag: event.value,
        objTripAnalyzerSelection: edited,
      });

      //load customTag List

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "TripAnalyzerSelection";
      objBrokerRequest.Function = "getTagListCustom";

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );
      let paramTagID: BrokerParameter = new BrokerParameter(
        "CustomTagSourceID",
        value
      );

      objBrokerRequest.Parameters.push(paramwellId);
      objBrokerRequest.Parameters.push(paramTagID);

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
          if (objData.length == 0) {
            this.setState({
              isProcess: false,
              grdData: [],
            });

            return;
          }
          let objGrdData = objData.map((dataItem: any) =>
            Object.assign({ selected: false, selected_: false }, dataItem)
          );
          console.log("newData", objGrdData);

          this.setState({
            isProcess: false,
            grdData: objGrdData,
            selectedTag: [],
          });
          this.forceUpdate();
        })
        .catch((error) => {
          $("#loader").hide();
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
    }
    edited[field] = value;
    this.setState({
      objTripAnalyzerSelection: edited,
    });
  };

  SaveSettings = () => {
    try {
      //Save to DB pending

      if (this.state.selectedTag.length == 0) {
        confirmAlert({
          //title: 'eVuMax',
          message: "Please Select Tag from the tag List?",
          childrenElement: () => <div />,
          buttons: [
            {
              label: "Ok",
              onClick: () => { },
            },
            // {
            //     label: 'No',
            //     onClick: () => null
            // }
          ],
        });
        return;
      }

      let newUserSettings = utilFunc.CopyObject(
        this.state.objTripAnalyzerSelection
      );
      newUserSettings.TagSelection = utilFunc.convertMapToDictionaryJSON(
        this.state.selectedTag
      );

      if (this.props.plotID == "TripSpeed2") {
        let objData: any = utilFunc.CopyObject(this.state.grdData);
        let selectedTagList: any = [];
        let objRow: any;
        for (let index = 0; index < objData.length; index++) {
          objRow = objData[index];
          if (objRow.selected == true) {
            selectedTagList.push(objRow.PHASE_INDEX);
          }
        }
        newUserSettings.TagSelection = utilFunc.convertMapToDictionaryJSON(
          selectedTagList
        );
      }

      let newBenchMarks = this.state.objBenchMarks;
      let newSpeedProfile = utilFunc.convertMapToDictionaryJSON(
        this.state.grdSpeedProfile,
        "SrNo"
      );

      newBenchMarks.speedProfile = newSpeedProfile;
      newUserSettings.objBenchMarks = newBenchMarks;

      //pending
      //depthRange to Dictionary this is unique for each Phase Index

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "TripAnalyzerSelection";
      objBrokerRequest.Function = "saveSelection";

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );
      let paramUserID: BrokerParameter = new BrokerParameter(
        "UserId",
        _gMod._userId
      );
      let paramSettingID: BrokerParameter = new BrokerParameter(
        "SettingID",
        this.props.plotID
      );
      let paramSettingData: BrokerParameter = new BrokerParameter(
        "SettingsData",
        JSON.stringify(newUserSettings)
      );

      objBrokerRequest.Parameters.push(paramwellId);
      objBrokerRequest.Parameters.push(paramUserID);
      objBrokerRequest.Parameters.push(paramSettingData);
      objBrokerRequest.Parameters.push(paramSettingID);

      axios
        .get(_gMod._performTask, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          let hold = true;

          //pending
          //this.__parentRef.loadTripSpeed();
        })
        .catch((error) => {
          if (error.response) {
          } else if (error.request) {
          } else {
          }
          this.setState({ isProcess: false });
        });

      this.__parentRef.loadConnections();
    } catch (error) { }
  };
  handleTabSelect = (e: any) => {
    this.setState({ selectedTab: e.selected });
  };
  cmdEditDepthRange = (event: any, dataItem: any) => {
    try {
      //alert("edit depth range");
      this.setState({
        showDepthRangeEditor: true,
        currentPhaseIndex: dataItem.PHASE_INDEX,
        currentDepthRangeSrNo: dataItem.SrNo, //null
      });

      this.refreshDepthRangeGrid(dataItem);
    } catch (error) { }
  };
  grdRow_Click = (e: any) => {
    try {
      //alert("row clicked");
      //This need to check //pending

      //before selecting new DepthRange save current to object
      // if (this.state.currentPhaseIndex > 0) {
      //     let headerDetail: any = Object.values(utilFunc.CopyObject(this.state.objTagDepthInformation));
      //     let index = headerDetail.findIndex((item: any) => item.PhaseIndex === this.state.currentPhaseIndex); // use unique value like ID
      //     if (index > -1) {
      //         headerDetail = headerDetail[index];
      //         let index2 = this.state.grdDepthRange.findIndex((item: any) => item.PhaseIndex === this.state.currentPhaseIndex);
      //         if (index > -1) {
      //             let edited = this.state.objTagDepthInformation
      //             edited[index].DepthRanges = this.state.grdDepthRange
      //             this.setState({
      //                 objTagDepthInformation: edited
      //             });
      //         }
      //     } else {
      //         //New Entry in Depth Range for Current Phase Index
      //         let headerDetail: any = Object.values(utilFunc.CopyObject(this.state.objTagDepthInformation));
      //         let index = headerDetail.findIndex((item: any) => item.PhaseIndex === this.state.currentPhaseIndex); // use unique value like ID
      //         let edited = this.state.objTagDepthInformation
      //         edited[index].DepthRanges = this.state.grdDepthRange
      //         this.setState({
      //             objTagDepthInformation: edited
      //         });
      //     }
      // }

      this.setState({
        currentPhaseIndex: e.dataItem.PHASE_INDEX,
        currentDepthRangeSrNo: e.dataItem.SrNo, //null
      });

      this.refreshDepthRangeGrid(e.dataItem);
      return;
    } catch (error) { }
  };

  refreshDepthRangeGrid = (dataItem: any) => {
    try {
      let tagDepthInfoList: any = utilFunc.CopyObject(
        Object.values(this.state.objTagDepthInformation)
      );

      if (tagDepthInfoList.length > 0) {
        let index = tagDepthInfoList.findIndex(
          (item: any) => item.PhaseIndex === dataItem.PHASE_INDEX
        ); // use unique value like ID
        if (index > -1) {
          let newDepthRange: any = Object.values(
            tagDepthInfoList[index].DepthRanges
          );
          //loop through all depth range and set PhaseIndex and Sr No
          for (let i = 0; i < newDepthRange.length; i++) {
            newDepthRange[i].PhaseIndex = dataItem.PHASE_INDEX;
            newDepthRange[i].SrNo = i + 1;
          }

          this.setState({
            grdDepthRange: newDepthRange,
          });
        } else {
          this.setState({
            grdDepthRange: [],
          });
        }
      }
    } catch (error) { }
  };

  onGridItemChange = (e: any) => {
    e.dataItem[e.field] = e.value;
    let edited = utilFunc.CopyObject(this.state.grdData);
    edited[e.field] = e.value;

    let selectedTag = [];

    if (e.field == "selected" && this.props.plotID == "TripSpeed1") {
      //Radio Button on Grid
      //let edited = utilFunc.CopyObject(this.state.grdData); //prath 25-11-2020
      for (let index = 0; index < edited.length; index++) {
        if (edited[index].PHASE_INDEX == e.dataItem.PHASE_INDEX) {
          edited[index].selected = true;
          selectedTag.length = 0;
          selectedTag.push(e.dataItem.PHASE_INDEX);
        } else {
          edited[index].selected = false;
        }
      }
    }

    if (e.field == "selected" && this.props.plotID == "TripSpeed2") {
      selectedTag = this.state.selectedTag;
      selectedTag.push(e.dataItem.PHASE_INDEX);
    }

    this.setState({
      grdData: edited,
      selectedTag: selectedTag,
    });

    this.forceUpdate();
  };
  grdDepthRangesItemChange = (e: any) => {
    //code for inLine Editing...
    //alert("pending to save");

    //return;
    //
    e.dataItem[e.field] = e.value;
    // this.setState({
    //     grdDepthRange: [...this.state.grdDepthRange]
    // });

    let newData: any = Object.values([...this.state.grdDepthRange]);
    let index = newData.findIndex((item: any) => item.SrNo === e.dataItem.SrNo); // use unique value like ID
    newData[index][e.field] = e.value;
    this.setState({ grdDepthRange: newData });
    this.forceUpdate();
  };

  grdSpeedProfileRow_Click = (event: any) => {
    this.setState({
      currentSrNo: event.dataItem.SrNo,
    });
  };

  grdItemChange = (e: any) => {
    e.dataItem[e.field] = e.value;
    this.setState({
      grdSpeedProfile: [...this.state.grdSpeedProfile],
    });

    let newData: any = Object.values([...this.state.grdSpeedProfile]);
    let index = newData.findIndex((item: any) => item.SrNo === e.dataItem.SrNo); // use unique value like ID
    newData[index][e.field] = e.value;
    this.setState({ grdSpeedProfile: newData });
  };

  AddSpeedProfile_Click = () => {
    try {
      let edited = this.state.grdSpeedProfile;
      edited.push({
        Depth: null,
        SpeedWithConnection: null,
        SpeedWithoutConnection: null,
        SrNo: edited.length + 1,
      });
      this.setState({
        grdSpeedProfile: edited,
      });
      this.forceUpdate();
    } catch (error) { }
  };
  removeSpeedProfile_Click = (event: any, rowData: any) => {
    //Nishant 13-07-2020

    confirmAlert({
      //title: 'eVuMax',
      message: "Are you sure you want to remove?",
      childrenElement: () => <div />,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            let SpeedProfileList = this.state.grdSpeedProfile;
            let objRow = rowData;
            let ID = objRow.SrNo;
            let index = SpeedProfileList.findIndex((d: any) => d.SrNo === ID); //find index in your array
            SpeedProfileList.splice(index, 1); //remove element from array
            this.setState({
              grdSpeedProfile: SpeedProfileList,
            });
            this.forceUpdate();
          },
        },
        {
          label: "No",
          onClick: () => null,
        },
      ],
    });
  };
  grdDepthRangeRowUpdate_Click = () => {
    try {
      //before selecting new DepthRange save current to object
      if (this.state.currentPhaseIndex > 0) {
        let headerDetail: any = Object.values(
          utilFunc.CopyObject(this.state.objTagDepthInformation)
        );
        let index = headerDetail.findIndex(
          (item: any) => item.PhaseIndex === this.state.currentPhaseIndex
        ); // use unique value like ID
        if (index > -1) {
          headerDetail = headerDetail[index];
          let index2 = this.state.grdDepthRange.findIndex(
            (item: any) => item.PhaseIndex === this.state.currentPhaseIndex
          );
          if (index > -1) {
            let edited = this.state.objTagDepthInformation;
            edited[index].DepthRanges = this.state.grdDepthRange;
            this.setState({
              objTagDepthInformation: edited,
            });
          }
        } else {
          //New Entry in Depth Range for Current Phase Index
          //let newDepth

          let headerDetail: any = Object.values(
            utilFunc.CopyObject(this.state.objTagDepthInformation)
          );
          let index = headerDetail.findIndex(
            (item: any) => item.PhaseIndex === this.state.currentPhaseIndex
          ); // use unique value like ID
          let edited = this.state.objTagDepthInformation;
          edited[index].DepthRanges = this.state.grdDepthRange;
          this.setState({
            objTagDepthInformation: edited,
          });
        }
      }
    } catch (error) { }
  };
  grdDepthRangeAddRow_Click = () => {
    try {
      let edited = this.state.grdDepthRange;
      let newRow = {
        FromDepth: 0,
        LabelText: "New Lable",
        PhaseIndex: this.state.currentPhaseIndex,
        TimeLogName: "",
        ToDepth: 0,
        TripSpeedWOConnection: 0,
        TripSpeedWithConnection: 0,
        WOBenchmark: 0,
        WithBenchhmark: 0,
        SrNo: edited.length + 1,
      };

      edited.push(newRow);

      this.setState({
        grdDepthRange: edited,
      });
    } catch (error) { }
  };
  removeDepthRange_Click = (event: any, rowData: any) => {
    confirmAlert({
      //title: 'eVuMax',
      message: "Are you sure you want to remove?",
      childrenElement: () => <div />,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            let grdDepthRangeList = this.state.grdDepthRange;
            let objRow = rowData;
            let ID = objRow.SrNo;
            let index = grdDepthRangeList.findIndex((d: any) => d.SrNo === ID); //find index in your array
            grdDepthRangeList.splice(index, 1); //remove element from array
            this.setState({
              grdDepthRange: grdDepthRangeList,
            });
            this.forceUpdate();
          },
        },
        {
          label: "No",
          onClick: () => null,
        },
      ],
    });
  };

  grdDepthRangeRow_Click = (event: any) => {
    try {
      this.setState({
        currentDepthRangeSrNo: event.dataItem.SrNo,
      });
      this.forceUpdate();
    } catch (error) { }
  };
  saveDepthRangeToDB = () => {
    try {
      //prath
      let arrTripDepthRange = [];
      let PhaseIndex = 0;

      let objTripSpeedRange = new TripDepthRange();

      for (let index = 0; index < this.state.grdDepthRange.length; index++) {
        objTripSpeedRange = new TripDepthRange();
        objTripSpeedRange.WellID = this.WellId;
        objTripSpeedRange.SrNo = this.state.grdDepthRange[index].SrNo;
        objTripSpeedRange.PhaseIndex = this.state.grdDepthRange[
          index
        ].PhaseIndex;
        objTripSpeedRange.FromDepth = this.state.grdDepthRange[index].FromDepth;
        objTripSpeedRange.ToDepth = this.state.grdDepthRange[index].ToDepth;
        objTripSpeedRange.LabelText = this.state.grdDepthRange[index].LabelText;
        objTripSpeedRange.WithBenchhmark = this.state.grdDepthRange[
          index
        ].WithBenchhmark;
        objTripSpeedRange.WOBenchmark = this.state.grdDepthRange[
          index
        ].WOBenchmark;
        objTripSpeedRange.TimeLogName = this.state.grdDepthRange[index].LogName;

        PhaseIndex = this.state.grdDepthRange[index].PhaseIndex;

        arrTripDepthRange.push(objTripSpeedRange);
      }

      arrTripDepthRange = utilFunc.convertMapToDictionaryJSON(
        arrTripDepthRange,
        "SrNo"
      );

      $("#loader").show();

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "TripAnalyzerSelection";
      objBrokerRequest.Function = "setDepthRange";

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );
      let userId: BrokerParameter = new BrokerParameter(
        "UserId",
        _gMod._userId
      );
      let paramDepthRange: BrokerParameter = new BrokerParameter(
        "DepthRange",
        JSON.stringify(arrTripDepthRange)
      );
      let paramPhaseIndex: BrokerParameter = new BrokerParameter(
        "PhaseIndex",
        JSON.stringify(PhaseIndex)
      );

      objBrokerRequest.Parameters.push(paramwellId);
      objBrokerRequest.Parameters.push(userId);
      objBrokerRequest.Parameters.push(paramDepthRange);
      objBrokerRequest.Parameters.push(paramPhaseIndex);

      axios
        .get(_gMod._performTask, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          this.loadData();
          this.forceUpdate();
        })
        .catch((error) => {
          $("#loader").hide();

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

  render() {
    let loader = this.state;
    return (
      <React.Fragment>
        <div className="mr-5" style={{ height: "100vh", width: "100%" }}>
          <div className="row ml-2">
            {/* <div className="col lg-12" style={{ float: "right" }}  >
                            <button onClick={this.SaveSettings}
                                className="btn-custom btn-custom-primary ml-1 mr-1">Save & Apply</button>
                        </div> */}

            <div className="col-lg-2 offset-md-6">
              <button
                onClick={this.SaveSettings}
                className="btn-custom btn-custom-primary ml-1 mr-1"
              >
                Save & Apply
              </button>
            </div>
          </div>

          <div style={{ float: "right" }}></div>
          <TabStrip
            selected={this.state.selectedTab}
            onSelect={this.handleTabSelect}
            keepTabsMounted={true}
            tabPosition="left"
          >
            <TabStripTab title="Tag Selection">
              {/* <div id="tabDataSelection2" style={{ height: "100vh", width: "calc(100vw - 90px)", backgroundColor: "transparent" }}>

                            </div> */}
              <div className="row ml-3">
                <div className="col-lg-5">
                  <Checkbox
                    id="chkUseCustomTags"
                    name="UseCustomTags"
                    label="Use Custom Tag"
                    checked={this.state.objTripAnalyzerSelection.UseCustomTags}
                    value={this.state.objTripAnalyzerSelection.UseCustomTags}
                    onChange={(e) => this.handleChange(e, "UseCustomTags")}
                  />
                </div>
                <div className="col-lg-7">
                  {this.state.objTripAnalyzerSelection.UseCustomTags && (
                    <DropDownList
                      name="TagSourceID"
                      label="Custom Tags"
                      data={this.state.customTagList}
                      textField="text"
                      dataItemKey="id"
                      value={this.state.selectedCustomTag}
                      onChange={(e) =>
                        this.handleChangeDropDown(e, "TagSourceID")
                      }
                    />
                  )}
                </div>
              </div>
              <div className="row ml-5 mt-5">
                <div className="col-lg-12">
                  <label>Select the Trip Tag</label>
                </div>
              </div>

              <div className="row ml-5">
                <div className="col-lg-10">
                  <Grid
                    onItemChange={this.onGridItemChange}
                    style={{ height: "50vh", width: "50vw" }}
                    data={this.state.grdData}
                    resizable={true}
                    scrollable={"scrollable"}
                    onRowClick={
                      this.props.plotID == "TripSpeed2"
                        ? this.grdRow_Click
                        : null
                    }
                  >
                    <GridToolbar>
                      <span className="ml-2">
                        {loader.isProcess ? <CustomLoader /> : ""}
                      </span>
                    </GridToolbar>
                    {/* <Column field="selected" width="70px" title="Show" resizable={true} minResizableWidth={50} headerClassName="text-center" className="text-center" editable={true} editor="boolean"
                                // headerSelectionValue={ this.state.WellList.findIndex((dataItem: any) => dataItem.selected === false) === -1 }

                                > */}
                    {(this.props.plotID == "TripSpeed1" ? true : false) && (
                      <Column
                        field="selected"
                        headerClassName="text-center"
                        className="text-center"
                        title="Select"
                        width="90px"
                        cell={(props) => {
                          return (
                            <td className="text-center">
                              <RadioButton
                                name="grpGridRadio"
                                checked={props.dataItem[props.field]}
                                value={props.dataItem[props.field]}
                                onChange={(e) => {
                                  props.onChange({
                                    dataItem: props.dataItem,
                                    dataIndex:props.dataIndex,
                                    field: props.field,
                                    syntheticEvent: e.syntheticEvent,
                                    value: e.value,
                                    // value: e.value == true ? 1 : 0
                                  });
                                }}
                              />
                            </td>
                          );
                        }}
                      />
                    )}

                    {(this.props.plotID == "TripSpeed2" ? true : false) && (
                      <Column
                        field="selected"
                        headerClassName="text-center"
                        className="text-center"
                        title="Select"
                        width="90px"
                        cell={(props) => {
                          return (
                            <td className="text-center">
                              <Checkbox
                                name="chkSelect"
                                checked={props.dataItem[props.field]}
                                value={props.dataItem[props.field]}
                                onChange={(e) => {
                                  props.onChange({
                                    dataItem: props.dataItem,
                                    dataIndex:props.dataIndex,
                                    field: props.field,
                                    syntheticEvent: e.syntheticEvent,
                                    value: e.value,
                                  });
                                }}
                              />
                            </td>
                          );
                        }}
                      />
                    )}

                    {false && (
                      <Column
                        field="PHASE_ID"
                        headerClassName="text-center"
                        className="text-left"
                        title="Phase ID"
                        width="90px"
                        editable={false}
                      />
                    )}
                    <Column
                      field="PHASE_NAME"
                      headerClassName="text-center"
                      className="text-left"
                      title="Phase Name"
                      width="150px"
                      editable={false}
                    />
                    {false && (
                      <Column
                        field="STEP_ID"
                        headerClassName="text-center"
                        className="text-left"
                        title="Step ID"
                        width="90px"
                        editable={false}
                      />
                    )}
                    <Column
                      field="STEP_NAME"
                      headerClassName="text-center"
                      className="text-left"
                      title="Step Name"
                      width="150px"
                      editable={false}
                    />

                    {false && (
                      <Column
                        field="EMPH_ID"
                        headerClassName="text-center"
                        className="text-left"
                        title="Emph ID"
                        width="90px"
                        editable={false}
                      />
                    )}
                    <Column
                      field="EMPH_NAME"
                      headerClassName="text-center"
                      className="text-left"
                      title="Emph Name"
                      width="150px"
                      editable={false}
                    />

                    {false && (
                      <Column
                        field="TIMELOG_ID"
                        headerClassName="text-center"
                        className="text-left"
                        title="Time Log ID"
                        width="90px"
                        editable={false}
                      />
                    )}
                    {false && (
                      <Column
                        field="TIMELOG_NAME"
                        headerClassName="text-center"
                        className="text-left"
                        title="TimeLog Name"
                        width="90px"
                        editable={false}
                      />
                    )}

                    <Column
                      field="START_DATE"
                      headerClassName="text-center"
                      className="text-left"
                      title="Start Date"
                      width="150px"
                      editable={false}
                    />
                    <Column
                      field="END_DATE"
                      headerClassName="text-center"
                      className="text-left"
                      title="End Date"
                      width="150px"
                      editable={false}
                    />
                    <Column
                      field="EditDepthRange"
                      headerClassName="text-center"
                      className="text-center"
                      title="Depth Range"
                      width="100px"
                      editable={false}
                      locked
                      cell={(props) => (
                        //<td className="text-center">

                        <td
                          style={props.style}
                          className={
                            "text-center k-grid-content-sticky k-command-cell"
                          }
                          onClick={(e) =>
                            this.cmdEditDepthRange(e, props.dataItem)
                          }
                        >
                          <span
                            onClick={(e) =>
                              this.cmdEditDepthRange(e, props.dataItem)
                            }
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </span>
                        </td>
                      )}
                    />
                  </Grid>
                </div>
              </div>

              <br />
              <div className="row ml-5">
                <div className="col-lg-3">
                  <label className="mr-3">Depth Interval</label>
                  <NumericTextBox
                    onChange={(e) => this.handleChange(e, "DepthThreshold")}
                    value={this.state.objTripAnalyzerSelection.DepthThreshold}
                    format="n0"
                    width={100}
                    min={0}
                  />
                  <label>
                    {this.state.objTripAnalyzerSelection.DepthVumaxUnitID}
                  </label>
                </div>

                <div className="col-lg-3">
                  Trip Direction
                  <br />
                  <RadioButton
                    name="group1"
                    value={0}
                    checked={
                      this.state.objTripAnalyzerSelection.TripDirection == 0
                    }
                    onChange={(e) => this.handleChange(e, "TripDirection")}
                  />
                  Trip In
                  <br />
                  <RadioButton
                    name="group1"
                    value={1}
                    checked={
                      this.state.objTripAnalyzerSelection.TripDirection == 1
                    }
                    onChange={(e) => this.handleChange(e, "TripDirection")}
                  />
                  Trip Out
                </div>

                <div className="col-lg-6">
                  <Checkbox
                    name="RemoveFillUpTime"
                    label="Remove Fillup Time"
                    checked={
                      this.state.objTripAnalyzerSelection.RemoveFillUpTime
                    }
                    value={this.state.objTripAnalyzerSelection.RemoveFillUpTime}
                    onChange={(e) => this.handleChange(e, "RemoveFillUpTime")}
                  />
                  <br />

                  <Checkbox
                    name="IncludePipeMovement"
                    label="Include Pipe Movement"
                    checked={
                      this.state.objTripAnalyzerSelection.IncludePipeMovement
                    }
                    value={
                      this.state.objTripAnalyzerSelection.IncludePipeMovement
                    }
                    onChange={(e) =>
                      this.handleChange(e, "IncludePipeMovement")
                    }
                  />
                </div>
              </div>

              {(this.props.plotID == "TripSpeed2" ? true : false) && (
                <div className="row ml-5">
                  <div className="col lg-3">
                    <Checkbox
                      name="UseDepthRanges"
                      label="Calculate value for each depth range"
                      checked={
                        this.state.objTripAnalyzerSelection.UseDepthRanges
                      }
                      value={this.state.objTripAnalyzerSelection.UseDepthRanges}
                      onChange={(e) => this.handleChange(e, "UseDepthRanges")}
                    />
                  </div>
                </div>
              )}

              {this.state.showDepthRangeEditor && (
                <Dialog
                  width={"auto"}
                  height={480}
                  title={"Depth Range Editor"}
                  onClose={(e: any) => {
                    this.setState({
                      showDepthRangeEditor: false,
                    });
                  }}
                >
                  {true && (
                    <div className="row ml-5">
                      <div className="col-lg-12">
                        <Grid
                          onItemChange={this.grdDepthRangesItemChange}
                          style={{ height: "30vh", width: "80wh" }}
                          data={
                            this.state.grdDepthRange != null
                              ? this.state.grdDepthRange.map((item: any) => ({
                                ...item,
                                inEdit:
                                  item.SrNo ===
                                  this.state.currentDepthRangeSrNo,
                              }))
                              : null
                          }
                          resizable={true}
                          scrollable={"scrollable"}
                          editField="inEdit"
                          selectedField="inEdit"
                          onRowClick={this.grdDepthRangeRow_Click}
                        >
                          <GridToolbar>
                            <div>
                              <span>
                                <button
                                  onClick={this.grdDepthRangeAddRow_Click}
                                  className="btn-custom btn-custom-primary ml-1 mr-1"
                                >
                                  Add
                                </button>
                              </span>
                            </div>
                          </GridToolbar>

                          <Column
                            field="SrNo"
                            editor="numeric"
                            headerClassName="text-center"
                            className="text-left"
                            title="SrNo"
                            width="90px"
                            editable={true}
                          />
                          <Column
                            field="FromDepth"
                            editor="numeric"
                            headerClassName="text-center"
                            className="text-left"
                            title="From Depth"
                            width="90px"
                            editable={true}
                          />
                          <Column
                            field="ToDepth"
                            editor="numeric"
                            headerClassName="text-center"
                            className="text-left"
                            title="To Depth"
                            width="150px"
                            editable={true}
                          />
                          <Column
                            field="LabelText"
                            headerClassName="text-center"
                            className="text-left"
                            title="Label"
                            width="102px"
                            editable={true}
                          />
                          <Column
                            field="WOBenchmark"
                            editor="numeric"
                            headerClassName="text-center"
                            className="text-left wrap"
                            title="TripSpeed Without Connection"
                            width="250px"
                            editable={true}
                          />

                          <Column
                            field="WithBenchhmark"
                            editor="numeric"
                            headerClassName="text-center"
                            className="text-left"
                            title="TripSpeed With Connection"
                            width="250px"
                            editable={true}
                          />
                          {false && (
                            <Column
                              field="PhaseIndex"
                              headerClassName="text-center"
                              className="text-left"
                              title="Phase Index"
                              width="90px"
                              editable={false}
                            />
                          )}
                          <Column
                            width="70px"
                            headerClassName="text-center"
                            resizable={false}
                            locked
                            field="removeDepth"
                            title="*"
                            cell={(props) => (
                              <td
                                style={props.style}
                                className={
                                  "text-center k-command-cell " +
                                  props.className
                                }
                              >
                                <span
                                  onClick={(e) =>
                                    this.removeDepthRange_Click(
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
                  )}

                  <div className="row mt-5">
                    <div className="col-lg-12 float-right">
                      <DialogActionsBar>
                        <button
                          className="btn-custom btn-custom-primary ml-1 mr-1"
                          onClick={(e: any) => {
                            //save pending to DB
                            this.saveDepthRangeToDB(); //prath
                            this.setState({
                              showDepthRangeEditor: false,
                            });
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="btn-custom btn-custom-primary ml-1 mr-1"
                          onClick={(e: any) => {
                            this.setState({
                              showDepthRangeEditor: false,
                            });
                          }}
                        >
                          Cancel
                        </button>
                      </DialogActionsBar>
                    </div>
                  </div>
                </Dialog>
              )}
            </TabStripTab>
            {(this.props.plotID == "TripSpeed2" ? false : true) && (
              <TabStripTab title="Benchmarks">
                <div className="row ml-5">
                  <div className="col lg-2">
                    <label className="mr-3">Speed Without Connection</label>
                    <NumericTextBox
                      onChange={(e) =>
                        this.handleChange(e, "TripSpeedWOConnection")
                      }
                      value={this.state.objBenchMarks.TripSpeedWOConnection}
                      format="n0"
                      width={100}
                    />
                  </div>
                  <div className="col lg-8">
                    <label className="mr-3"> Speed With Connection</label>
                    <NumericTextBox
                      onChange={(e) =>
                        this.handleChange(e, "TripSpeedWithConnection")
                      }
                      value={this.state.objBenchMarks.TripSpeedWithConnection}
                      format="n2"
                      width={100}
                    />
                  </div>
                </div>

                <div className="row ml-5">
                  <div className="col lg-10">
                    <Grid
                      //  onItemChange={this.onItemChange}
                      style={{ height: "30vh", width: "auto" }}
                      //data={this.state.grdSpeedProfile}
                      data={
                        this.state.grdSpeedProfile != null
                          ? this.state.grdSpeedProfile.map((item: any) => ({
                            ...item,
                            selected: item.SrNo === this.state.currentSrNo,
                          }))
                          : null
                      }
                      resizable={true}
                      scrollable={"scrollable"}
                      sortable={true}
                      selectedField="selected"
                      onRowClick={this.grdSpeedProfileRow_Click}
                      onItemChange={this.grdItemChange}
                      editField="selected"
                    >
                      <GridToolbar>
                        <div>
                          <span>
                            <button
                              onClick={this.AddSpeedProfile_Click}
                              className="btn-custom btn-custom-primary ml-1 mr-1"
                            >
                              Add{" "}
                            </button>
                          </span>
                        </div>
                      </GridToolbar>

                      {true && (
                        <Column
                          field="SrNo"
                          headerClassName="text-center"
                          className="text-left"
                          title="SrNo"
                          width="90px"
                          editable={false}
                        />
                      )}
                      <Column
                        field="Depth"
                        headerClassName="text-center"
                        className="text-left"
                        title="Depth"
                        width="90px"
                        editable={true}
                      />
                      <Column
                        field="SpeedWithoutConnection"
                        headerClassName="text-center"
                        className="text-left"
                        title="Speed Without Connection"
                        width="250px"
                        editable={true}
                      />
                      <Column
                        field="SpeedWithConnection"
                        headerClassName="text-center"
                        className="text-left"
                        title="Speed With Connection"
                        width="250px"
                        editable={true}
                      />

                      <Column
                        width="70px"
                        headerClassName="text-center"
                        resizable={false}
                        locked
                        field="removeProfile"
                        title="*"
                        cell={(props) => (
                          <td
                            style={props.style}
                            className={
                              "text-center k-command-cell " + props.className
                            }
                          >
                            {/* <td className={this.props.className + " k-command-cell"} style={this.props.style}> */}
                            <span
                              onClick={(e) =>
                                this.removeSpeedProfile_Click(e, props.dataItem)
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
              </TabStripTab>
            )}
          </TabStrip>
        </div>
      </React.Fragment>
    );
  }

  loadData = () => {
    try {
      $("#loader").show();

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Summary.Manager";
      objBrokerRequest.Broker = "TripAnalyzerSelection";
      objBrokerRequest.Function = "loadSelection";

      let paramwellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.WellId
      );
      let paramChannelList: BrokerParameter = new BrokerParameter(
        "UserId",
        _gMod._userId
      );
      let paramPlotID: BrokerParameter = new BrokerParameter(
        "PlotID",
        this.props.plotID
      );

      objBrokerRequest.Parameters.push(paramwellId);
      objBrokerRequest.Parameters.push(paramChannelList);
      objBrokerRequest.Parameters.push(paramPlotID);

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
          console.log("trip Analy", objData);

          let customTagList: comboData[] = [];

          for (let index = 0; index < objData.TagSourceData.length; index++) {
            const element = objData.TagSourceData[index];
            let objItem: comboData = new comboData();
            objItem.id = element.SOURCE_ID;
            objItem.text = element.SOURCE_NAME;
            customTagList.push(objItem);
          }
          if (customTagList.length > 0) {
            for (let index = 0; index < customTagList.length; index++) {
              let objItem = customTagList[index];

              if (objItem.id == objData.objUserSettings.TagSourceID) {
                this.setState({
                  selectedCustomTag: objItem,
                });
                break;
              }
            }

            this.setState({
              customTagList: customTagList,
            });
          }

          //load grdTripTagData
          objData.grdTripTagData = objData.grdTripTagData.map((dataItem: any) =>
            Object.assign({ selected: false, selected_: false }, dataItem)
          );
          let selectedTag = [];

          if (Object.values(objData.objUserSettings.TagSelection).length > 0) {
            selectedTag = Object.values(objData.objUserSettings.TagSelection);
          } else {
            selectedTag = [];
          }

          //load BenchMarks
          let objBenchMarks = objData.objUserSettings.objBenchMarks;

          let grdSpeedProfile = Object.values(
            objData.objUserSettings.objBenchMarks.speedProfile
          );
          if (grdSpeedProfile.length == 0) {
            grdSpeedProfile = [];
          }

          this.setState({
            objTripAnalyzerSelection: objData.objUserSettings,
            grdData: objData.grdTripTagData,
            objBenchMarks: objBenchMarks,
            grdSpeedProfile: grdSpeedProfile,
            objTagDepthInformation: Object.values(
              objData.objUserSettings.TagDepthInformation
            ),
            selectedTag: selectedTag,
          });

          this.forceUpdate();
          //set selected tags in Grid pending
          let edited = this.state.grdData;
          for (let i = 0; i < selectedTag.length; i++) {
            const objSelectedTag = selectedTag[i];

            let index = this.state.grdData.findIndex(
              (value: any) => value.PHASE_INDEX == objSelectedTag
            );
            if (index > -1) {
              edited[index].selected = true;
            }
          }
          this.setState({
            grdData: edited,
          });
          this.forceUpdate();
        })
        .catch((error) => {
          $("#loader").hide();

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
