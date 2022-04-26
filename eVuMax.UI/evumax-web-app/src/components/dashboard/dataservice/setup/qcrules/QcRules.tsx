import React, { Component } from 'react'
import axios from "axios";
import {
  Grid,
  GridColumn as Column,
  GridRow as Row,

} from "@progress/kendo-react-grid";
import { BrokerRequest, Util } from '../../../../../Models/eVuMax';
import { ClientLogger } from '../../../../ClientLogger/ClientLogger';
import BrokerParameter from '../../../../../broker/BrokerParameter';
import GlobalMod from '../../../../../objects/global';
import { Button, Dialog } from '@progress/kendo-react-all';
import { QCRule } from '../../../../../eVuMaxObjects/dataObjects/dataObjects';
import QCRuleDialog from './QCRuleDialog';

let _gMod = new GlobalMod();

export default class QcRules extends Component {
  state = {
    grdData: [] as any,
    objQCRule: new QCRule,
    showQCRuleDialog: false
  }

  objLogger: ClientLogger = new ClientLogger("DrillingSummary", _gMod._userId);

  componentDidMount = () => {
    try {
      this.loadQCRules();
    } catch (error) { }
  }


  loadQCRules = () => {
    try {

      Util.StatusInfo("Getting data from server   ");
      this.setState({
        isProcess: true,
      });

      this.objLogger.SendLog("load QC Rules");

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "DataService";
      objBrokerRequest.Broker = "SetupQCRules";
      objBrokerRequest.Function = "loadQCRules";

      let paramuserid: BrokerParameter = new BrokerParameter(
        "UserId",
        _gMod._userId
      );
      objBrokerRequest.Parameters.push(paramuserid);

      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },

        })
        .then((res) => {

          this.objLogger.SendLog("load QC Rules Data Received...");


          let objData = JSON.parse(res.data.Response);
          console.log("Drlg Summary data  -->", objData);

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


          debugger;

          this.setState({
            grdData: Object.values(objData),
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

  addQCRule = () => {
    try {

      Util.StatusInfo("Saving data");
      this.setState({
        isProcess: true,
      });

      //this.objLogger.SendLog("load QC Rules");

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "DataService";
      objBrokerRequest.Broker = "SetupQCRules";
      objBrokerRequest.Function = "addQCRule";

      let paramuserid: BrokerParameter = new BrokerParameter(
        "UserId",
        _gMod._userId
      );
      objBrokerRequest.Parameters.push(paramuserid);




      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },

        })
        .then((res) => {

          this.objLogger.SendLog("load QC Rules Data Received...");


          let objData = JSON.parse(res.data.Response);
          console.log("Drlg Summary data  -->", objData);

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


          debugger;

          this.setState({
            grdData: Object.values(objData),
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
  editQCRule = () => {
    try {

    } catch (error) {

    }
  }

  removeQCRules = () => {
    try {

    } catch (error) {

    }
  }
  render() {
    return (
      <div>
        <p>QC Rules </p>


        <div className="row mb-3">

          <div
            className="mb-3 col-xl-10 col-lg-10 col-md-10 col-sm-10"
            style={{
              backgroundColor: "transparent",
              width: "calc(100vw - 100px)",
              height: "100px",
              minHeight: "100px",
              minWidth: "500px",
            }}
          >



            <Grid
              //className="mb-3 col-xl-12 col-lg-12 col-md-12 col-sm-12 numericGrid"

              style={{ height: "auto", minHeight: "150px" }}
              resizable={true}
              scrollable={"scrollable"}
              sortable={false}

              data={this.state.grdData}
            >
              {false &&
                <Column
                  headerClassName="text-center"
                  className="qcRuleHeader"
                  field="RuleID"
                  title="Rule Id"
                />
              }
              <Column
                headerClassName="text-center"
                className="qcRuleHeader"
                field="RuleName"
                title="Rule Name"
              />

              <Column
                headerClassName="text-center"
                className="qcRuleHeader"
                field="RuleTypeName"
                title="Rule Type"
              />

              <Column
                headerClassName="text-center"
                className="qcRuleHeader"
                field="TolerancePercentage"
                title="Tolerance %"
              />

              <Column
                headerClassName="text-center"
                className="qcRuleHeader"
                field="MinValue"
                title="Min Value"
              />
              <Column
                headerClassName="text-center"
                className="qcRuleHeader"
                field="MaxValue"
                title="Max Value"
              />

            </Grid>
          </div>
          <div className="mb-3 col-xl-2 col-lg-2 col-md-2 col-sm-2">
            <span className="btn-group-vertical">
              <Button style={{ width: '120px' }} className="mt-3 k-button k-primary mr-4" onClick={
                 () =>{
                   
                  this.setState({objQCRule : new QCRule(), showQCRuleDialog : true});
                }
              }>
                Add New Rule
              </Button>
              <Button style={{ width: '120px' }} className="mt-3 k-button k-primary mr-4" onClick={this.editQCRule}>
                Edit Rule
              </Button>
              <Button style={{ width: '120px' }} onClick={this.removeQCRules} className="mt-3">
                Remove Rule
              </Button>
            </span>
          </div>
        </div>




        {this.state.showQCRuleDialog && (
          //style={{ height: '100%', width: '500px', top: 0, left: 0 }}
          <Dialog title={"QC Rule"}
          width={"700px"}
          height={"400px"}
          onClose={(e: any) => {
              this.setState({
                showQCRuleDialog: false
              })
            }}
          >
            <div className="row" >
              <div className="col-9">
                {/* <QCRuleDialog save={this.saveInEdit} cancel={this.cancelInEdit} dataItem={this.state.objQCRule}  ></QCRuleDialog> */}
                <QCRuleDialog objQCRule={this.state.objQCRule}> </QCRuleDialog>
              </div>

            </div>

          </Dialog>
        )}

      </div>
    )
  }
}
