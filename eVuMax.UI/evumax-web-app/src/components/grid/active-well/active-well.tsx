import React from "react";
import axios from "axios";
import $ from "jquery";
import {
  Grid,
  GridColumn as Column,
  GridColumn,
  GridToolbar,
  GridColumnReorderEvent,
} from "@progress/kendo-react-grid";

import "../../../css/eVumax-Indigo_Blue_Light.css";
import "../../../css/variables.scss";
import "./active-well.css";
import { DropDownButton, Button } from "@progress/kendo-react-buttons";

import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPen,
  faCircle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { Input, Checkbox } from "@progress/kendo-react-inputs";
import { filterBy } from "@progress/kendo-data-query";
import CustomLoader from "../../loader/loader";
import CustomeNotifications from "../../notifications/notification";

import {
  Window,
  Dialog,
  DialogActionsBar,
} from "@progress/kendo-react-dialogs";

//Nishant
import { DropDownList } from "@progress/kendo-react-dropdowns";
import DownloadStatus from "../../../components/DownloadStatus/DownloadStatus";

import history from "../../../history/history";

import GlobalMod from "../../../objects/global";

import WidgetSelector from "../../grid/active-well/WidgetSelector"; //Nishant 07-10-2020
import * as utilFunc from "../../../utilFunctions/utilFunctions"; //Nishant 07-10-2020

import downloadGif from "../../../images/downloading-blue.gif";

let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");
let columnList: any[] = [];
let wellList: any[] = [];

const searchFieldStyle = {
  // borderRadius: '22px',
  width: "40%",
  borderColor: "#9e9e9e",
  border: "1px solid var(--base-anchor-color)",
  borderRadius: "22px",
  backgroundColor: "inherit",
  color: "var(--base-anchor-color)",
  padding: "5px 20px",
  borderTopColor: "var(--base-anchor-color) !important"
};

const headerlabel = {
  fontSize: "16px",
  fontWeights: "700",
  display: "inline-flex",
};

interface RunningStatus {
  RunningStatus: _RunningStatus;
  StatusMsg: _StatusMsg;
}

type _RunningStatus = boolean | undefined;
type _StatusMsg = string | undefined;

export default class ActiveWell extends React.Component {
  intervalID: NodeJS.Timeout | undefined;

  state = {
    showDeleteDialog: false,
    removeWells: false,
    columnNames: [] as any,
    activeWellList: [] as any,
    columnWell: [{ COLUMN_ID: "", VISIBLE: 0, ORDER_NO: 0 }], //Nishant
    isProcess: false,
    applyWellColumns: false, //Nishant
    showWellColumnWindow: false, //Nishant
    dataForDropDown: [{ id: "NA", name: "No favourites" }],
    showDownloadStatusDialog: false,
    currentWellID: "",
    showOpenInterfaceDialog: false,
    OpenInterfaceID: "",
  };
  //Nishant 07-10-2020
  loadUserFav = () => {
    try {
      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Well.Data.Objects";
      objBrokerRequest.Function = "getUserFav";
      objBrokerRequest.Broker = "ActiveWellProfile";

      objParameter = new BrokerParameter("UserName", _gMod._userId);
      objBrokerRequest.Parameters.push(objParameter);

      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          let userFav: any = utilFunc.parseJSON(res.data.Response);

          if (userFav == false) {
            // this.setState({
            //     dataForDropDown: {id:"",name:""}
            // });
            this.forceUpdate();
            return false;
          }

          // try {
          //     JSON.parse(res.data.Response)
          // } catch (e) {
          //     return false;
          // }

          // let userFav:any = JSON.parse(res.data.Response);
          let widgetList = utilFunc.getWidgetList();
          let favList: any[] = [];
          for (let i = 0; i < userFav.length; i++) {

            const objItem = userFav[i];

            let index = widgetList.findIndex((x) => x.id === objItem.Id);
            if (index < 0) {
              //not found
            } else {
              favList.push({
                id: widgetList[index].id,
                name: widgetList[index].name,
              });
            }
          }

          this.setState({
            dataForDropDown: favList,
          });
          this.forceUpdate();
        })
        .catch(function (error) { });
    } catch (error) { }
  };

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  componentWillMount() {
    this.loadUserFav();
    this.getColumnWell();
    console.log(this.state.columnWell);

    this.intervalID = setInterval(this.getActiveWellList.bind(this), 5000);

    this.getActiveWellList();
    $("#btnRemovewell").prop("disabled", true);
  }

  allColumns = [] as any;

  OpenInterfaceChange = (item: any, dataItem: any) => {
    //pending

    console.log("open Interface", dataItem.WELL_ID);
    console.log("open Interface", item);

    utilFunc.launchWidget(item.value.id, dataItem.WELL_ID);
  };

  //Nishant 07-10-2020
  CloseOpenInterfaceDialog = (apply?: boolean) => {
    this.setState({
      showOpenInterfaceDialog: false,
    });
    this.intervalID = setInterval(this.getActiveWellList.bind(this), 5000);

    if (apply) {
      this.loadUserFav();
    }

    this.forceUpdate();
  };
  //Nishant 02-06-2020
  getColumnOrderIndex = (columnID: string) => {
    try {
      let index = this.state.columnWell.findIndex(
        (x) => x.COLUMN_ID === columnID
      );
      if (columnID == "EDIT_WELL") {
        return this.state.columnWell.length;
      }

      if (index < 0) {
        return 0; // what we do with columns that are not the in the another columns collection sh
      } else {
        return this.state.columnWell[index].ORDER_NO - 1;
      }
    } catch (error) { }
  };
  //**************** */

  isColumnVisible = (field: any) => {
    let index = this.state.columnWell.findIndex((x) => x.COLUMN_ID === field);
    if (index < 0) {
      return true; // what we do with columns that are not the in the another columns collection sh
    } else {
      return this.state.columnWell[index].VISIBLE === 1;
    }
  };
  cmdEditWell_click = (event: any, rowData: any) => {
    let objRow = rowData;
    localStorage.setItem("editedWellID", objRow.WELL_ID);
    //history.push("/dashboard/WellEditorForm/" + objRow.WELL_ID);
    history.push("wellEditorForm/" + objRow.WELL_ID);
  };

  handleGridDataStateChange = (e: any) => {
    this.setState({ gridDataState: e.data });
  };

  ApplyWellColumns = (isApply: boolean) => {
    this.setState({
      showWellColumnWindow: !this.state.showWellColumnWindow,
    });

    if (isApply) {
      this.getColumnWell();
    }
  };
  getColumnWell = () => {
    try {
      this.setState({ isProcess: true });

      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Well.Data.Objects";
      objBrokerRequest.Function = "WellColumns";
      objBrokerRequest.Broker = "ActiveWellProfile";

      //Nishant 02-06-2020
      objParameter = new BrokerParameter("UserName", _gMod._userId);
      objBrokerRequest.Parameters.push(objParameter);

      //*********** */

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
          this.setState({ columnWell: objData, isProcess: false });
          console.log(objData);
        })
        .catch((error) => {
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
    } catch { }
  };

  getActiveWellList = () => {
    try {
      if (this.state.removeWells) {
        return;
      }

      this.setState({ isProcess: true });
      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Well.Data.Objects";
      objBrokerRequest.Function = "ActiveWellList";
      objBrokerRequest.Broker = "ActiveWellProfile";
      objBrokerRequest.Parameters.push(objParameter);

      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          let _Data = [];
          if (res.data.RequestSuccessfull) {
            _Data = JSON.parse(res.data.Response);
            wellList = _Data;

            this.setState({
              columnNames: columnList,
              activeWellList: _Data.map((dataItem: any) =>
                Object.assign({ selected: false }, dataItem)
              ),
            });
          }

          this.setState({ isProcess: false });
        })
        .catch((error) => {
          if (error.response) {
            // this.errors(error.response.message);
          } else if (error.request) {
            console.log("error.request");
          } else {
            console.log("Error", error);
          }
          console.log("rejected");
        });

      // this.intervalID = setTimeout(this.getActiveWellList.bind(this), 5000);

      // this.setState({
      //     currentWellID:""
      // });
    } catch { }
  };

  filterData = (e: any) => {
    let value = e.target.value;
    let filter: any = {
      logic: "or",
      filters: [
        { field: "WELL_NAME", operator: "contains", value: value },
        { field: "DEPTH", operator: "contains", value: value },
        { field: "RIG_STATE", operator: "contains", value: value },
        { field: "HDTH", operator: "contains", value: value },
        { field: "STATE", operator: "contains", value: value },
        { field: "FIELD", operator: "contains", value: value },
        { field: "OPERATOR", operator: "contains", value: value },
        { field: "RIG_STATE_NAME", operator: "contains", value: value },
        { field: "RIG_NAME", operator: "contains", value: value },
      ],
    };

    this.setState({
      activeWellList: filterBy(wellList, filter),
    });
  };

  //Nishant 26-05-2020
  grid_headerSelectionChange = (event: any) => {
    const checked = event.syntheticEvent.target.checked;
    const data = this.state.activeWellList.map((item: any) => {
      item["selected"] = checked;
      return item;
    });
    this.setState({ activeWellList: data });
  };

  grid_selectionChange = (event: any) => {
    const checked = event.syntheticEvent.target.checked;

    const data = this.state.activeWellList.map((item: any) => {
      if (item["WELL_ID"] === event.dataItem.WELL_ID) {
        item["selected"] = checked;
      }
      return item;
    });
    this.setState({ activeWellList: data });
    wellList = data;
  };

  tglRemoveWells = (event: any) => {
    // if (event.value) {
    //     $('#btnRemovewell').prop("disabled", false);

    // } else {
    //     $('#btnRemovewell').prop("disabled", true);

    // }

    this.setState({ removeWells: event.value });
  };

  cmdRemoveWellFromDashboard = () => {
    try {
      let selectedWellIDs: any[] = [];
      for (let i = 0; i < this.state.activeWellList.length; i++) {
        let selected = this.state.activeWellList[i]["selected"];
        if (selected) {
          selectedWellIDs.push(this.state.activeWellList[i]["WELL_ID"]);
        }
      }

      if (selectedWellIDs.length == 0) {
        alert("Please select wells from the list to remove");
        return;
      }

      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Well.Data.Objects";
      objBrokerRequest.Function = "RemoveWellFromDashboard";
      objBrokerRequest.Broker = "ActiveWellProfile";

      objParameter = new BrokerParameter("UserName", _gMod._userId);

      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter(
        "wellList",
        JSON.stringify(selectedWellIDs)
      );

      objBrokerRequest.Parameters.push(objParameter);

      axios
        .get(_gMod._performTask, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })

        .then((res) => {
          this.getActiveWellList();
        })
        .catch((error) => {
          if (error.response) {
          } else if (error.request) {
          } else {
          }
          this.setState({ isProcess: false });
        });

      this.setState({ isProcess: false });

      this.setState({ removeWells: false });
      this.setState({ showDeleteDialog: false });
    } catch (error) { }
  };

  cmdRemoveWell_click = () => {
    this.setState({ showDeleteDialog: true });
  };

  //Nishant 06-08-2020
  getWellName = () => {
    let wellList: any = Object.values(this.state.activeWellList);
    let index = wellList.findIndex(
      (x: any) => x.WELL_ID === this.state.currentWellID
    );
    if (index >= 0) {
      return wellList[index].WELL_NAME;
    } else {
      return "unknown";
    }
  };
  showDownloadStatusDialog = (event: any, objRow: any) => {
    if (objRow.WELL_ID == this.state.currentWellID) {
      this.setState({
        showDownloadStatusDialog: true,
        currentWellID: objRow.WELL_ID,
      });
      this.forceUpdate();
    } else {
      alert("Please select the well");
    }
  };
  grdWellsRowClick = (event: any) => {
    this.setState({
      currentWellID: event.dataItem.WELL_ID,
    });
  };
  //Nishant 02-06-2020
  onSaveLayoutClick = (event: any) => {
    console.log(event);
  };

  onGridColumnReorder = (e: GridColumnReorderEvent) => {
    console.log(e.columns);
    //e[i].orderIndex
    //e[i].field
    let columnWell = this.state.columnWell;

    // for (let i = 0; i < e.columns.length; i++) {
    //     const columnID = e.columns[i].field;
    //     const orderIndex = e.columns[i].orderIndex;
    //     let index = this.state.columnWell.findIndex(x => x.COLUMN_ID === columnID);
    //     if (index < 0) {
    //         //columnWell[index].ORDERNO=0;
    //     } else {
    //         columnWell[index].ORDERNO=0;
    //     }
    //
    //     this.setState({ columnWell: columnWell});
    // }
  };
  //************** */

  ////18-08-2020
  showOpenInterfaceDialog = (dataItem: any) => {
    this.setState({
      showOpenInterfaceDialog: true,
      currentWellID: dataItem.WELL_ID,
    });

    this.forceUpdate();
  };

  handleChangeOpenInterface = (event: any) => {
    let interfaceID = event.target.value.id;

    this.setState({ OpenInterfaceID: interfaceID });

    //Launch Interface

    //To DO  Parth
    if (interfaceID === "DrlgSummary") {
      history.push("DrillingSummary/" + this.state.currentWellID);
    }
    if (interfaceID === "DrlgConnSummary") {
      history.push("DrlgConnSummary/" + this.state.currentWellID);
    }

    if (interfaceID === "DrlgConnSummary2") {
      history.push("DrlgConnSummary2/" + this.state.currentWellID);
    }

    if (interfaceID === "TripConnSummary") {
      history.push("TripConnSummary/" + this.state.currentWellID);
    }

    if (interfaceID === "ToolfaceSummary") {
      history.push("ToolfaceSummary/" + this.state.currentWellID);
    }

    if (interfaceID === "Broomstick") {
      history.push("Broomstick/" + this.state.currentWellID);
    }
  };

  OpenInterfaceClicked = () => {
    try {
      //Launch Interface
      if (this.state.OpenInterfaceID === "DrlgConnSummary") {
        history.push("DrlgConnSummary/" + this.state.currentWellID);
      }

      if (this.state.OpenInterfaceID === "DrlgConnSummary2") {
        history.push("DrlgConnSummary2/" + this.state.currentWellID);
      }

      if (this.state.OpenInterfaceID === "TripConnSummary") {
        history.push("TripConnSummary/" + this.state.currentWellID);
      }

      if (this.state.OpenInterfaceID === "ToolfaceSummary") {
        history.push("ToolfaceSummary/" + this.state.currentWellID);
      }

      if (this.state.OpenInterfaceID === "Broomstick") {
        history.push("Broomstick/" + this.state.currentWellID);
      }
    } catch (error) { }
  };

  render() {
    let loader = this.state;
    return (
      <>
        <div className="row">
          <Grid
            style={{ height: "86vh", width: "95vw" }}
            data={this.state.activeWellList}
            // data={this.state.activeWellList != null ? (this.state.activeWellList.map((item: any) =>
            //     ({ ...item, selected: item.WELL_ID === this.state.currentWellID })
            // )) : null}
            resizable={true}
            scrollable={"scrollable"}
            sortable={true}
            selectedField="selected" //Nishant 26-05-2020
            onSelectionChange={this.grid_selectionChange} //Nishant 26-05-2020
            onHeaderSelectionChange={this.grid_headerSelectionChange} //Nishant 26-05-2020
            reorderable={true} //Nishant 02-06-2020
            onColumnReorder={this.onGridColumnReorder} //Nishant 02-06-2020
            onRowClick={this.grdWellsRowClick} //Nishant 06-08-2020
          >
            <GridToolbar>
              <div className="float-left">
                <label
                  className="text-theme font-weight-bold mr-1"
                  style={headerlabel}
                >
                  {" "}
                  Active Wells{" "}
                  <span className="ml-2">
                    {loader.isProcess ? <CustomLoader /> : ""}
                    {/* <CustomeNotifications Key="error" Icon={true} IsVisible={true} Messages="Hello"  /> */}
                  </span>
                </label>
              </div>

              <div
                className="float-right"
                style={{ width: "35%", display: "inline-flex" }}
              >
                <div>
                  {this.state.removeWells && (
                    <Button
                      type="button"
                      id="btnRemovewell"
                      className="btn-custom btn-custom-primary mr-3"
                      onClick={(e) => this.cmdRemoveWell_click()}
                    >
                      Remove Well
                    </Button>
                  )}
                  <span className="mr-3">
                    <Checkbox
                      onChange={this.tglRemoveWells}
                      checked={this.state.removeWells}
                      label={"Remove wells"}
                    />
                  </span>
                </div>

                <div
                  className="k-textbox k-space-right"
                  style={searchFieldStyle}
                >
                  <input
                    type="text"
                    onChange={this.filterData}
                    placeholder="Search"
                  />
                  <a className="k-icon k-i-search" style={{ right: "10px" }}>
                    &nbsp;
                  </a>
                </div>
                {/* <div className="float-right ml-20" style={{ width: '10%' }} >
                                    <DropDownButton icon="more-vertical"
                                        onItemClick={(e) => this.onSaveLayoutClick(e)}
                                    >
                                        <DropDownButtonItem text="Save layout" />
                                    </DropDownButton>
                                </div> */}
              </div>
            </GridToolbar>
            {/* Nishant */}
            {this.state.removeWells && (
              <Column
                field="selected"
                width="65px"
                title=""
                resizable={true}
                minResizableWidth={65}
                headerClassName="text-center"
                className="text-center"
                editable={true}
                editor="boolean"
                headerSelectionValue={
                  this.state.activeWellList.findIndex(
                    (dataItem: any) => dataItem.selected === false
                  ) === -1
                }
              ></Column>
            )}
            {this.isColumnVisible("DOWNLOAD_STATUS") && (
              <Column
                field="DOWNLOAD_STATUS"
                width="100px"
                title="Download"
                resizable={false}
                minResizableWidth={50}
                headerClassName="text-center"
                reorderable={false}
                orderIndex={this.getColumnOrderIndex("DOWNLOAD_STATUS")}
                cell={(props) => (
                  // onclick = ((event: any) => {
                  //     // this.setState({
                  //     //     currentWellID: props.dataItem["WELL_ID"]
                  //     // });
                  //     //
                  //     alert(this.state.currentWellID + " download Clicked");

                  // }),
                  <td className="text-center">
                    {/* <img src={require("../../../images/downloading-blue.gif")} key="0" style={{ width: 35, height: 10 }} />  */}
                    {props.dataItem["DOWNLOAD_STATUS"] == true ? (
                      <span
                        onClick={(e) =>
                          this.showDownloadStatusDialog(e, props.dataItem)
                        }
                      >
                        {" "}
                        <img
                          src={downloadGif}
                          style={{ width: 35, height: 10 }}
                          alt=""
                        />{" "}
                      </span>
                    ) : null}
                    {/* {props.dataItem["DOWNLOAD_STATUS"] == false ?
                                            // onClick={(e) => this.showDownloadStatusDialog(e, props.dataItem)}
                                            // <span ><img src={require("../../../images/warning-blink.gif")} key="0" style={{ width: 20, height: 20 }} /> </span>
                                            // <span className="color-red"> <FontAwesomeIcon icon={faCircle} /></span>
                                            <span className="color-red"> <FontAwesomeIcon icon={faCircle} /></span>
                                            : null} */}
                  </td>
                )}
              />
            )}
            {this.isColumnVisible("ALARM_STATUS") && (
              <Column
                field="ALARM_STATUS"
                width="100px"
                title="Alarm Status"
                resizable={false}
                minResizableWidth={50}
                headerClassName="text-center"
                reorderable={false}
                orderIndex={this.getColumnOrderIndex("ALARM_STATUS")}
                cell={(props) => (
                  <td className="text-center">
                    {/* {props.dataItem["ALARM_STATUS"] == 0 ?
                                            <span className="color-green"> <FontAwesomeIcon icon={faCircle} /></span>
                                            : null} */}
                    {props.dataItem["ALARM_STATUS"] == 2 ? (
                      <span className="color-red">
                        {" "}
                        <FontAwesomeIcon icon={faCircle} />
                      </span>
                    ) : null}

                    {props.dataItem["ALARM_STATUS"] == 1 ? (
                      <span className="color-yellow">
                        {" "}
                        <FontAwesomeIcon icon={faCircle} />
                      </span>
                    ) : null}
                  </td>
                )}
              />
            )}

            {this.isColumnVisible("WELL_ID") && (
              <Column
                field="WELL_ID"
                title="Well ID"
                width="100px"
                reorderable={true}
              />
            )}
            {this.isColumnVisible("WELL_NAME") && (
              <Column
                field="WELL_NAME"
                title="Well Name"
                width="230px"
                reorderable={true}
                orderIndex={this.getColumnOrderIndex("WELL_NAME")}
                cell={(props) => (
                  <td
                    className="text-left"
                    onClick={(e) =>
                      this.showOpenInterfaceDialog(props.dataItem)
                    }
                  >
                    <label>{props.dataItem.WELL_NAME}</label>
                  </td>
                )}
              />
            )}
            {this.isColumnVisible("BLOCK") && (
              <Column
                field="BLOCK"
                headerClassName="text-center"
                className="text-center"
                title="Block"
                width="90px"
                reorderable={true}
                orderIndex={this.getColumnOrderIndex("BLOCK")}
              />
            )}
            {this.isColumnVisible("REGION") && (
              <Column
                field="REGION"
                headerClassName="text-center"
                className="text-center"
                title="Region"
                width="90px"
                reorderable={true}
                orderIndex={this.getColumnOrderIndex("REGION")}
              />
            )}
            {this.isColumnVisible("DISTRICT") && (
              <Column
                field="DISTRICT"
                headerClassName="text-center"
                className="text-center"
                title="District"
                width="90px"
                reorderable={true}
                orderIndex={this.getColumnOrderIndex("DISTRICT")}
              />
            )}
            {this.isColumnVisible("FIELD") && (
              <Column
                field="FIELD"
                title="Field"
                width="120px"
                reorderable={true}
                orderIndex={this.getColumnOrderIndex("FIELD")}
              />
            )}
            {this.isColumnVisible("STATE") && (
              <Column
                field="STATE"
                headerClassName="text-center"
                className="text-center"
                title="State"
                width="90px"
                reorderable={true}
                orderIndex={this.getColumnOrderIndex("STATE")}
              />
            )}
            {this.isColumnVisible("COUNTY") && (
              <Column
                field="COUNTY"
                headerClassName="text-center"
                className="text-center"
                title="County"
                width="90px"
                reorderable={true}
                orderIndex={this.getColumnOrderIndex("COUNTY")}
              />
            )}
            {this.isColumnVisible("OPERATOR") && (
              <Column
                field="OPERATOR"
                title="Operator"
                width="90px"
                reorderable={true}
                orderIndex={this.getColumnOrderIndex("OPERATOR")}
              />
            )}

            {this.isColumnVisible("EDR_PROVIDER") && (
              <Column
                field="EDR_PROVIDER"
                title="EDR Provider"
                width="90px"
                reorderable={true}
                orderIndex={this.getColumnOrderIndex("EDR_PROVIDER")}
              />
            )}
            {this.isColumnVisible("RIG") && (
              <Column
                field="RIG_NAME"
                title="Rig Name"
                width="200px"
                reorderable={true}
                orderIndex={this.getColumnOrderIndex("RIG")}
                cell={(props) => (
                  <td
                    className="text-left"
                    onClick={(e) =>
                      this.showOpenInterfaceDialog(props.dataItem)
                    }
                  >
                    <label>{props.dataItem.RIG_NAME}</label>
                  </td>
                )}
              />
            )}
            {this.isColumnVisible("RIG_STATE_NAME") && (
              <Column
                field="RIG_STATE_NAME"
                title="Current Activity"
                width="120px"
                orderIndex={this.getColumnOrderIndex("CURRENT_ACTIVITY")}
                cell={(props) => (
                  <td style={{ color: props.dataItem["RIG_STATE_COLOR"] }}>
                    {props.dataItem["RIG_STATE_NAME"]}
                  </td>
                )}
              />
            )}
            {this.isColumnVisible("DEPTH") && (
              <Column
                field="DEPTH"
                headerClassName="text-right"
                className="text-right"
                title="Depth"
                width="90px"
                format="{0:0.00}"
                orderIndex={this.getColumnOrderIndex("DEPTH")}
              />
            )}
            {this.isColumnVisible("HOLE_DEPTH") && (
              <Column
                field="HDTH"
                headerClassName="text-right"
                className="text-right"
                title="Hole Depth"
                width="100px"
                format="{0:0.00}"
                orderIndex={this.getColumnOrderIndex("HOLE_DEPTH")}
              />
            )}
            {true && (
              <Column
                locked
                title="Open Fav. Interface"
                width="260px"
                orderIndex={this.getColumnOrderIndex("OPEN_INTERFACE")}
                cell={(props) => (
                  <td
                    style={props.style}
                    className={"text-center k-command-cell " + props.className}
                  >
                    <DropDownList
                      style={{ width: "100%" }}
                      onChange={(e) =>
                        this.OpenInterfaceChange(e, props.dataItem)
                      }
                      value={props.dataItem.value}
                      data={this.state.dataForDropDown}
                      textField="name"
                      dataItemKey="id"
                    />
                  </td>
                )}
              />
            )}
            {/* {this.isColumnVisible("EDIT_WELL") && <Column width="70px" headerClassName="text-center" resizable={false} orderIndex={this.getColumnOrderIndex("EDIT_WELL")} */}
            <Column width="70px" locked headerClassName="text-center" resizable={false} orderIndex={this.getColumnOrderIndex("EDIT_WELL")}
              field="editWell"
              title="Edit Well"
              cell={props => (

                <td style={props.style} className={"text-center k-command-cell " + props.className}
                  onClick={e => this.cmdEditWell_click(e, props.dataItem)}
                >
                  <span >
                    <FontAwesomeIcon icon={faPen} />
                  </span>

                </td>
              )}
            />
          </Grid>
        </div>

        {this.state.showWellColumnWindow && (
          <Window
            title={"eVuMax"}
            initialHeight={500}
            initialWidth={700}
            modal={true}
            minimizeButton={() => null}
            maximizeButton={() => null}
            restoreButton={() => null}
          // closeButton={() => this.ApplyWellColumns(false)}
          >
            <div>
              {/* <WellColumnsEditor actionOnClick={this.ApplyWellColumns} ></WellColumnsEditor> */}
              {/* <WellSelector getSelectedWells={this.AddWellToDashboard}></WellSelector> */}
            </div>
          </Window>
        )}

        {/* onClose={this.toggleDialog} */}
        {this.state.showDeleteDialog && (
          <Dialog
            title={"eVuMax"}
            onClose={() =>
              this.setState({ showDeleteDialog: false, removeWells: false })
            }
          >
            <p style={{ margin: "25px", textAlign: "center" }}>
              Are you sure you want to remove wells from dashboard?
            </p>
            <DialogActionsBar>
              <button
                className="btn-custom btn-custom-primary mr-3 mb-3"
                onClick={() =>
                  this.setState({ showDeleteDialog: false, removeWells: false })
                }
              >
                No
              </button>
              <button
                className="btn-custom btn-custom-primary mb-3 mr-3"
                onClick={this.cmdRemoveWellFromDashboard}
              >
                Remove
              </button>
            </DialogActionsBar>
          </Dialog>
        )}

        {/* get Download Status */}
        {this.state.showDownloadStatusDialog && (
          <Window
            title={"Download Status"}
            onClose={() => this.setState({ showDownloadStatusDialog: false })}
            // width = {'80vw'}
            // height = {300}
            style={{ width: "auto", height: "30vh" }}
            initialTop={100}
            initialLeft={100}
            resizable={false}
            modal={true}
            minimizeButton={() => null}
            maximizeButton={() => null}
          >
            <DownloadStatus
              WellID={this.state.currentWellID}
              WellName={this.getWellName()}
            ></DownloadStatus>
          </Window>
        )}

        {/* show Open Interface Window */}
        {this.state.showOpenInterfaceDialog && (
          // <Window
          //     title={"Select Interface To Open"}
          //     onClose={() => this.setState({ showOpenInterfaceDialog: false })}
          //     // width = {'80vw'}
          //     // height = {300}
          //     style={{ width: '400px', height: '220px' }}
          //     resizable={false}
          //     modal={true}
          //     minimizeButton={() => null}
          //     maximizeButton={() => null}
          // >

          //     <div className="row">
          //         <div className="col lg-10 sm-6 mr-6 ml-6 mt-4 ">

          //             <DropDownList
          //                 style={{ width: "300px" }}
          //                 data={[{ id: "DrlgSummary", name: "Drilling Summary" }, { id: "DrlgConnSummary", name: "Drlg. Conn. Summary" }, { id: "DrlgConnSummary2", name: "Drlg. Conn. Summary (Split View)" }, { id: "TripConnSummary", name: "Trip Conn. Summary" }, { id: "ToolfaceSummary", name: "Toolface Summary" }]}
          //                 textField="name"
          //                 dataItemKey="id"
          //                 value={this.state.OpenInterfaceID}
          //                 onChange={this.handleChangeOpenInterface}
          //             />

          //         </div>

          //     </div>

          //     <div className="row">
          //         <div className="col lg-10 sm-5 mr-5 ml-5 mt-3 ">
          //             <button className="btn-custom btn-custom-primary mr-2 " onClick={this.OpenInterfaceClicked}>Open</button>
          //             <button className="btn-custom btn-custom-primary " onClick={() => this.setState({ showOpenInterfaceDialog: false })}>Close</button>

          //         </div>

          //     </div>

          // </Window>
          <WidgetSelector {...this} />
        )}
      </>
    );
  }
}
