import { Button, DateTimePicker, DropDownList, Grid, GridColumn as Column, GridColumn, Input, Label, Splitter } from '@progress/kendo-react-all';
import React, { Component } from 'react';
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { SnapshotSettings } from '../../../../eVuMaxObjects/dataObjects/Snapshots/SnapshotSettings';
import * as utilFunc from '../../../../../src/utilFunctions/utilFunctions';
import { Checkbox } from '@progress/kendo-react-inputs';
import { Util } from '../../../../Models/eVuMax';
import BrokerRequest from '../../../../broker/BrokerRequest';
import BrokerParameter from '../../../../broker/BrokerParameter';
import GlobalMod from '../../../../objects/global';
import axios from "axios";
import { ClientLogger } from '../../../ClientLogger/ClientLogger';
import { comboData } from '../../../../eVuMaxObjects/UIObjects/comboData';
import moment from 'moment';
import NotifyMe from 'react-notification-timeline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

let _gMod = new GlobalMod();

let columnList: any[] = [];
let wellList: any[] = [];

export default class AuditInformation extends Component {
  objLogger: ClientLogger = new ClientLogger("AuditInformation", _gMod._userId);


  state = {
    panes: [{ size: "30%", collapsible: false }, {}],
    openDialog: false,
    warningMsg: [],
    activeWellList: [] as any,
    currentRow: [] as any,

    DateRange: false,
    FromDate: new Date,
    ToDate: new Date,
    selectedObjectType: new comboData(),
    cboObjectType: [] as any,
    searchCondition: "",
    grdData: [] as any
  }

  componentDidMount = async () => {
    try {
      
      this.getActiveWellList();
      this.loadComboData();

    } catch (error) {

    }
  }

  getActiveWellList = () => {
    try {

      let objBrokerRequest = new BrokerRequest();

      this.setState({ isProcess: true });
      objBrokerRequest = new BrokerRequest();
      let objParameter = new BrokerParameter("odata", "odata");

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

            console.log(columnList);

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

    } catch { }
  };

  loadComboData = () => {
    try {
      let cboData: comboData;

      cboData = new comboData("All", "All");
      this.state.cboObjectType.push(cboData);

      this.state.selectedObjectType = cboData;
      cboData = new comboData("Time Log", "Time Log");
      this.state.cboObjectType.push(cboData);
      cboData = new comboData("Depth Log", "Depth Log");
      this.state.cboObjectType.push(cboData);
      cboData = new comboData("Well", "Well");
      this.state.cboObjectType.push(cboData);

    } catch (error) {

    }
  }
  loadData = () => {

    try {
      Util.StatusInfo("Getting data from server   ");
      this.objLogger.SendLog("load Donwload Audit Info");
      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "DataService";
      objBrokerRequest.Broker = "SetupAuditInfo";
      objBrokerRequest.Function = "loadData";

      let paramuserid: BrokerParameter = new BrokerParameter(
        "UserId",
        _gMod._userId
      );
      objBrokerRequest.Parameters.push(paramuserid);

      let paramSearchCondition: BrokerParameter = new BrokerParameter(
        "SearchCondition",
        this.state.searchCondition
      );
      objBrokerRequest.Parameters.push(paramSearchCondition);


      let paramWellId: BrokerParameter = new BrokerParameter(
        "WellId",
        this.state.currentRow.WELL_ID
      );
      objBrokerRequest.Parameters.push(paramWellId);
      

      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },

        })
        .then(async (res) => {
          Util.StatusSuccess("Data successfully retrived  ");
          this.objLogger.SendLog("load Download Audit Info Data Received...");


          let objData = JSON.parse(res.data.Response);
          

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


          let grdData_ = Object.values(objData);
          grdData_.forEach((element: any) => {
            element.CHANGE_DATE = moment(new Date(element.CHANGE_DATE)).format("YYYY-MM-DD hh:mm:ss a")
          });

          await this.setState({
            grdData: grdData_,
          });

          
        })
        .catch((error) => {

          Util.StatusError(error.message);

          if (error.response) {

          } else if (error.request) {
            console.log("error.request");
          } else {
            console.log("Error", error);
          }
          console.log("rejected");
          this.setState({ isProcess: false });
        });

    } catch (error) {

    }

  }

  handleChangeDropDown = (event: any, field?: string) => {
    try {
      
      if (field == "ObjectType") {
        this.setState({ selectedObjectType: event.value });

      }
      

    } catch (error) {

    }
  }

  showAllClick = (e) => {
    try {
      this.setState({ searchCondition: "" });
      this.loadData();
    } catch (error) {

    }
  }

  searchClick = async (e) => {
    try {
      await this.generateSearchCondition();
      await this.loadData();
    } catch (error) {

    }
  }


  generateSearchCondition = () => {
    try {
      let searchCondition_ = "";
      
      if (this.state.DateRange) {
        // searchCondition = (searchCondition + (" AND CHANGE_DATE>='" + (this.state.FromDate.toLocaleString("dd-MMM-yyyy HH:mm:ss") + ("' AND CHANGE_DATE<='" 
        //             + (this.state.ToDate.toString("dd-MMM-yyyy HH:mm:ss") + "' ")))));

        searchCondition_ = (searchCondition_ + (" AND CHANGE_DATE>='" + (moment(this.state.FromDate).format("DD-MMM-yyyy HH:mm:ss") + ("' AND CHANGE_DATE<='"
          + (moment(this.state.ToDate).format("DD-MMM-yyyy HH:mm:ss") + "' ")))));
      }

      if ((this.state.selectedObjectType.text != "All")) {
        searchCondition_ = (searchCondition_ + (" AND OBJECT_TYPE='"
          + (this.state.selectedObjectType.text + "' ")));
      }
      this.setState({ searchCondition: searchCondition_ });
      
    }
    catch (ex) {

    }

  }

  OnChange = () => {
    try {

    } catch (error) {

    }
  }
  WellListRowClick = () => {
    try {

    } catch (error) {

    }
  }
  cmdRun_click = (e, objRow: any) => {
    try {

      let newPanes: any = this.state.panes;
      newPanes[0].collapsed = true;
      this.setState({
        panes: newPanes,
        currentRow: objRow,
        currentPlotID: objRow.TEMPLATE_ID,
        openDialog: true,
      });

    } catch (error) {

    }
  }

  closeEvent = () => {
    try {



      this.showListPanel();
    } catch (error) {

    }
  }


  showListPanel = () => {
    try {
      let newPanes: any = this.state.panes;
      newPanes[0].collapsed = false;
      this.setState({
        panes: newPanes,
        currentPlotID: "",
        openDialog: false,
        warningMsg: []
      });

    } catch (error) { }
  };

  render() {
    return (
      <div>

        <div className="" style={{ display: "flex", justifyContent: "flex-start" }}>
          {/* <label>{this.wellName} </label> */}
        </div>
        <div className="" style={{ display: "flex", justifyContent: "flex-end" }}>
          <NotifyMe

            data={this.state.warningMsg}
            storageKey='notific_key'
            notific_key='timestamp'
            notific_value='update'
            heading='Warnings'
            sortedByKey={false}
            showDate={false}
            size={24}

          />
        </div>

        <Splitter
          panes={this.state.panes}
          onChange={this.OnChange}
          style={{ height: "90vh" }}

        >
          <div className={this.state.openDialog ? "k-state-disabled" : "pane-content"}>

            <label>Click Run Button from the list to Load Information </label>


            <Grid
              style={{
                height: "750px", width: "auto"
              }}

              selectedField="selected"
              data={this.state.activeWellList}
              //   data={this.state.grdActiveWellData != null ? (this.state.grdData.map((item: any) =>
              //     ({ ...item, selected: item.TEMPLATE_ID === this.state.currentPlotID })
              //   )) : null}
              onRowClick={this.WellListRowClick}
            >


              {false &&
                <Column
                  field="WELL_ID"
                  title="Well Id"
                  width="100px"
                />
              }

              <Column
                field="WELL_NAME"
                title="Well Name"
                width="490px"
                reorderable={true}
                //orderIndex={this.getColumnOrderIndex("WELL_NAME")}
                cell={(props) => (
                  <td
                    className="text-left"
                  // onClick={(e) =>
                  //   this.showOpenInterfaceDialog(props.dataItem)
                  // }
                  >
                    <label>{props.dataItem.WELL_NAME}</label>
                  </td>
                )}
              />

              <Column
                width="50px"
                headerClassName="text-center"
                resizable={false}
                field="editWell"
                title="Run"
                cell={(props) => (
                  <td
                    style={props.style}
                    className={"text-center k-command-cell " + props.className}
                    onClick={(e) => this.cmdRun_click(e, props.dataItem)}
                  >
                    <span>
                      <FontAwesomeIcon icon={faChartLine} />
                    </span>
                  </td>
                )}
              />
            </Grid>
          </div>

          <div className="pane-content ml-5" id="rightPanel" >
            {this.state.openDialog && (



              <div className='mt-3'>


                <div className="row">


                  <div className="col-lg-2">
                    Data Change Audit
                  </div>

                  <div className="col-lg-8">
                    {this.state.currentRow.WELL_NAME}
                  </div>

                  <div className="col-lg-2">
                    <div className="flex-item">
                      <Button onClick={this.closeEvent}>Close</Button>
                    </div>

                  </div>

                </div>
                <div className="row">
                  <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                    <div className="grd">
                      <p>
                        <Label>Search</Label>
                      </p>


                      <p>
                        <Checkbox
                          className="mr-2"
                          label={"Search by date range"}
                          value={this.state.DateRange}
                          onChange={(e) =>

                            this.setState({ DateRange: e.value })
                          }

                        />
                      </p>

                      <p>
                        <Label>From Date</Label>
                      </p>
                      <p>
                        <DateTimePicker
                          name="txtFromDate"
                          value={new Date(this.state.FromDate)}
                          format="MM/dd/yyyy HH:mm:ss"
                          formatPlaceholder={{
                            year: "yyyy",
                            month: "MM",
                            day: "dd",
                            hour: "HH",
                            minute: "mm",
                            second: "ss",
                          }}

                          onChange={(e) => this.setState({ FromDate: e.value })}
                        />
                      </p>

                      <p>
                        <Label>To Date</Label>
                      </p>
                      <p>
                        <DateTimePicker
                          name="txtToDate"
                          value={new Date(this.state.ToDate)}
                          format="MM/dd/yyyy HH:mm:ss"
                          formatPlaceholder={{
                            year: "yyyy",
                            month: "MM",
                            day: "dd",
                            hour: "HH",
                            minute: "mm",
                            second: "ss",
                          }}

                          onChange={(e) => this.setState({ ToDate: e.value })}
                        />
                      </p>

                      <p>
                        Object Type
                      </p>
                      <p>
                        <Label className="mr-2 mt-3 float-left">Data Type</Label>
                        <DropDownList
                          name="Data Type"
                          label=''
                          data={this.state.cboObjectType}
                          textField="text"
                          dataItemKey="id"
                          value={this.state.selectedObjectType}
                          style={{ width: 200 }}
                          onChange={(event) => {
                            this.handleChangeDropDown(event, "ObjectType");
                          }}
                        />
                      </p>
                    </div>

                    <p>
                      <Button style={{ width: '110px' }} className="mt-3 k-button k-primary mr-4" onClick={this.searchClick}>
                        Search
                      </Button>
                      <Button style={{ width: '110px' }} onClick={this.showAllClick} className="mt-3">
                        Show All
                      </Button>
                    </p>
                  </div>

                  <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8">
                    <Grid
                      style={{ height: "500px", minHeight: "150px" }}
                      resizable={true}
                      scrollable={"scrollable"}
                      sortable={false}
                      selectedField="selected"
                      data={this.state.grdData}
                    //  data={
                    //      this.state.grdData != null ? this.state.grdData.map((item: any) => (
                    //          {
                    //              ...item,
                    //              selected: item.Mnemonic === this.state.selectedStdChannel
                    //          }

                    //      ))
                    //          : null
                    //  }
                    //onRowClick={this.grdRowClick}
                    >
                      <Column
                        headerClassName="text-center"
                        className="downloadAudit"
                        field="CHANGE_DATE"
                        title="Change Date"
                      />

                      <Column
                        headerClassName="text-center"
                        className="downloadAudit"
                        field="OBJECT_TYPE"
                        title="Object Type"
                      />

                      <Column
                        headerClassName="text-center"
                        className="downloadAudit"
                        field="OBJECT_ID"
                        title="Object ID"
                      />

                      <Column
                        headerClassName="text-center"
                        className="downloadAudit"
                        field="FUNCTION_TYPE"
                        title="Change Type"
                      />

                      <Column
                        headerClassName="text-center"
                        className="downloadAudit"
                        field="CHANGE_INFORMATION"
                        title="Change Information"
                      />

                      <Column
                        headerClassName="text-center"
                        className="downloadAudit"
                        field="CHANGE_BY"
                        title="Changed By"
                      />

                    </Grid>

                  </div>
                </div>
              </div>
            )}
          </div>
        </Splitter>
      </div>


    )
  }
}
