import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { Grid, GridColumn, GridRow } from "@progress/kendo-react-grid";
import React, { Component } from "react";
import { Splitter, SplitterOnChangeEvent } from "@progress/kendo-react-all";
//import CustomDrillingSummary from "../CustomDrillingSummary/CustomDrillingSummary";
import { CustomDrillingSummary } from "./CustomDrillingSummary";


import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import axios from "axios";
import GlobalMod from "../../../objects/global";
import { Util } from "../../../Models/eVuMax";
import NotifyMe from 'react-notification-timeline';
import DataSelector from "../../Common/DataSelector";
import DataSelector_ from "../../Common/DataSelector_";
import CustomDrlgSummaryDataSelector from "../CustomDrillingSummary/CustomDrlgSummaryDataSelector";
import DataSelectorInfo from "../../Common/DataSelectorInfo";
let _gMod = new GlobalMod();

export default class customDrlgSummaryViewer extends Component {

  constructor(props: any) {
    super(props);
    this.WellID = props.match.params.WellId;
  }

  WellID: string = "";
  wellName: string = "";
  state = {
    panes: [{ size: "30%", collapsible: false }, {}],
    grdData: [{ template_Name: "Plot-1", template_Id: "Plot1" }],
    currentRow: [] as any,
    currentPlotID: "",
    runReport: false,
    warningMsg: [],
    isRealTime: false as boolean,
    objDataSelector: new DataSelector_(),


  };

  componentDidMount() {
    try {
      this.loadSummaryList();
      console.log(this.state.objDataSelector)


    } catch (error) {

    }
  }

  updateWarnings = (paramWarnings: any) => {
    try {
      this.setState({
        warningMsg: paramWarnings
      });

    } catch (error) {

    }
  }

  loadSummaryList = () => {
    try {
      let objBrokerRequest = new BrokerRequest();

      objBrokerRequest.Module = "GenericDrillingSummary.Manager";
      objBrokerRequest.Broker = "GenericDrillingSummary";
      objBrokerRequest.Function = "getGDSummaryList"; //"generateGDSummary";


      let objParameter = new BrokerParameter("wellID", this.WellID); // // "f3205325-4ddb-4996-b700-f04d6773a051"
      objBrokerRequest.Parameters.push(objParameter);

      // objParameter= new BrokerParameter("UserID", "NIS-PC\\ETECH-NIS" );
      // objBrokerRequest.Parameters.push(objParameter);


      //gdSummary Plot ID: 308-656-954-204-796
      //Well ID:
      //User ID:


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

          if (objData != null || objData != "") {
            let _data = Object.values(objData);
            this.wellName = res.data.Category;

            //Warnings Notifications
            let warnings: string = res.data.Warnings;
            if (warnings.trim() != "") {
              let warningList = [];
              warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });

              this.updateWarnings(warningList);

            }
            this.setState({ grdData: _data });
          }
          Util.StatusSuccess("Data successfully retrived");
          Util.StatusReady();

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



    } catch (error) {

    }
  }

  onChange = (event: SplitterOnChangeEvent) => {

    this.setState({
      panes: event.newState,
      warningMsg: []
    });
  };




  cmdRunSummary_click = (e, objRow: any) => {
    try {
      let newPanes: any = this.state.panes;
      newPanes[0].collapsed = true;
      this.setState({
        panes: newPanes,
        currentRow: objRow,
        currentPlotID: objRow.TEMPLATE_ID,
        runReport: true,
      });


    } catch (error) { }
  };

  showListPanel = () => {
    try {
      let newPanes: any = this.state.panes;
      newPanes[0].collapsed = false;

      this.setState({
        panes: newPanes,
        currentPlotID: "",
        runReport: false,
        warningMsg: []
      });

    } catch (error) { }
  };

  PlotListRowClick = (event: any) => {
    try {
      const objRow = event.dataItem;

      this.setState({
        currentPlotID: objRow.TEMPLATE_ID
      });


    } catch (error) {

    }
  }

  updateDataSelectorInfo = async (paramDataSelector: DataSelector_) => {
    await this.setState({
      objDataSelector: paramDataSelector,

    });
  }
  selectionChanged_ = async (paramDataSelector: DataSelector_, paramRefreshHrs: boolean = false) => {

    let realtimeStatus: boolean = paramRefreshHrs;
    await this.setState({
      objDataSelector: paramDataSelector,
      isRealTime: realtimeStatus,
      runReport: false
    });

    await this.setState({
      runReport: true

    });


    // this.selectionType = paramDataSelector.selectedval;
    // this.fromDate = paramDataSelector.fromDate;
    // this.toDate = paramDataSelector.toDate;
    // this.fromDepth = paramDataSelector.fromDepth;
    // this.toDepth = paramDataSelector.toDepth;
    // this.refreshHrs = paramDataSelector.refreshHrs;

    // if (this.state.isRealTime) {
    //   this.intervalID = setInterval(this.loadConnections.bind(this), 15000);
    // } else {
    //   this.AxiosSource.cancel();
    //   await clearInterval(this.intervalID);
    //   this.intervalID = null;
    //   this.loadConnections();
    // }

  }

  render() {
    return (
      <div>

        <div className="" style={{ display: "flex", justifyContent: "flex-start" }}>
          <label>{this.wellName} </label>
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
            color="yellow"
          // markAsReadFn={() => 
          //   this.state.warningMsg = []
          // }
          />
        </div>

        <Splitter
          panes={this.state.panes}
          onChange={this.onChange}
          style={{ height: "90vh" }}

        >
          <div className={this.state.runReport ? "k-state-disabled" : "pane-content"}>

            <label>Click Run Button from the list to Load Summary </label>


            <Grid
              style={{
                height: "750px", width: "auto"
              }}
              //data={this.state.grdData}
              selectedField="selected"
              // resizable ={true}
              data={this.state.grdData != null ? (this.state.grdData.map((item: any) =>
                ({ ...item, selected: item.TEMPLATE_ID === this.state.currentPlotID })
              )) : null}
              onRowClick={this.PlotListRowClick}


            >

              <GridColumn
                field="TEMPLATE_NAME"
                title="Plot Name"
              //width="490px"
              //                width="100%"
              // resizable={true}
              />
              {false && <GridColumn field="TEMPLATE_ID" width="80px" title="Plot Id" />}
              <GridColumn
                width="50px"
                headerClassName="text-center"
                resizable={false}
                field="editWell"
                title="Run"
                cell={(props) => (
                  <td
                    style={props.style}
                    className={"text-center k-command-cell " + props.className}
                    onClick={(e) => this.cmdRunSummary_click(e, props.dataItem)}
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

            <div className="">
              {/* <DataSelectorInfo objDataSelector={this.state.objDataSelector} isRealTime={false} ></DataSelectorInfo> */}
              {this.state.runReport && (
                <>



                  <CustomDrillingSummary PlotID={this.state.currentPlotID} showListPanel={this.showListPanel} WellID={this.WellID} PlotName={this.state.currentRow.TEMPLATE_NAME} updateWarnings={this.updateWarnings} parentRef={this} objDataSelector={this.state.objDataSelector} ></CustomDrillingSummary>



                  {/* <div className="Data">
                    <DataSelector objDataSelector={this.state.objDataSelector} wellID={this.WellID} selectionChanged={this.selectionChanged} ></DataSelector>
                  </div> */}

                  {/* <CustomDrlgSummaryDataSelector objDataSelector={this.state.objDataSelector} wellID={this.WellID} selectionChanged={this.selectionChanged} ></CustomDrlgSummaryDataSelector>  */}

                </>
              )}
            </div>
          </div>
        </Splitter>
      </div>
    );
  }
}

// export default CustomDrlgSummaryViewer;
