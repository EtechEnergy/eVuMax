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
import { BroomStickSetup_ } from "./BroomStickSetup_";

let _gMod = new GlobalMod();

export default class BroomstickPlot extends Component {
  constructor(props: any) {
    super(props);
    this.WellId = props.match.params.WellId;
  }

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
    new comboData("Hookload Document", "3"),
    new comboData("Torque Document", "4"),
    new comboData("Combined BroomStick Document", "5"),
    new comboData("Combine BroomStick Torque Document", "6"),
  ];

  state = {
    showFilterDialog: false,
    cmbDocumentType: new comboData("Select Document", "-1"),
    objSetup: new BroomStickSetup_(),
    objBrookstickDoc: {} as any,
  };

  onDropDownListChange = async (event: any, field: string) => {
    try {
      debugger;
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
          debugger;
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

          this.setState({
            objSetup: objData._objSetup,
            objBrookstickDoc: objData
          });

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
      console.log("Filter Click RigState", this.state.objBrookstickDoc.objRigState);
      this.setState({
        showFilterDialog: true,
      });
    } catch (error) { }
  };

  generateReport = () => {
    try {
      if (this.state.cmbDocumentType.id == "-1") {
        alert("Please select Document Type from the list");
        return;
      }


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
            >
              <BroomstickSetup WellId={this.WellId} paramObjSetup={this.state.objSetup} objRigStates={this.state.objBrookstickDoc.objRigState} />
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
                  // onClick={() => {
                  //   this.Filter();
                  // }}
                  />
                </div>

                <div className="mr-2">
                  <Button>Plan</Button>
                </div>

                <div className="mr-2">
                  <Button onClick={this.generateReport} >Generate Report</Button>
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
          <label>Well Name</label>
        </div>
      </>
    );
  }
}
