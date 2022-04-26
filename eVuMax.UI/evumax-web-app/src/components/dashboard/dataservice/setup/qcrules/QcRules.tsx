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
import { Button } from '@progress/kendo-react-all';

let _gMod = new GlobalMod();

export default class QcRules extends Component {
  state = {
    grdData: [] as any
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
      objBrokerRequest.Function = "getQCRules";

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



          this.setState({
            grdData: objData,
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

  addQCRules = () => {
    try {

    } catch (error) {

    }
  }
  editQCRules = () => {
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
            className="mb-3 col-xl-10 col-lg-12 col-md-12 col-sm-12"
            style={{
              backgroundColor: "transparent",
              width: "calc(100vw - 100px)",
              height: "100px",
              minHeight: "100px",
              minWidth: "500px",
            }}
          >
            <Grid
              className="mb-3 col-xl-12 col-lg-12 col-md-12 col-sm-12 numericGrid"

              style={{ height: "130px", width: "calc(100vw)" }}//height:120px Vimal
              resizable={true}
              scrollable={"scrollable"}//make commented
              sortable={false}
              //onRowClick={this.grdNumSummaryRowClick}
              // editField="inEdit"
              // selectedField="selected"
              data={this.state.grdData}
            >
              <Column
                headerClassName="text-center"
                className="qcRuleHeader"
                field="col_1"
              />
              <Column
                headerClassName="text-center"
                className="summaryLabel"
                field="value_1"
              />
              <Column
                headerClassName="text-center"
                className="qcRuleHeader"
                field="col_2"
              />
              <Column
                headerClassName="text-center"
                className="summaryLabel3"
                field="value_2"
              />
              <Column
                headerClassName="text-center"
                className="qcRuleHeader"
                field="col_3"
              />
              <Column
                headerClassName="text-center"
                className="summaryLabel"
                field="value_3"
              />
              <Column
                headerClassName="text-center"
                className="qcRuleHeader"
                field="col_4"
              />
              <Column
                headerClassName="text-center"
                className="summaryLabel"
                field="value_4"
              />
              <Column
                headerClassName="text-center"
                className="qcRuleHeader"
                field="col_5"
              />
              <Column
                headerClassName="text-center"
                className="summaryLabel"
                field="value_5"
              />
            </Grid>
          </div>
          <div className="mb-3 col-xl-2 col-lg-12 col-md-12 col-sm-12">
            <span className="btn-group-vertical">
              <Button style={{ width: '90px' }} className="mt-3 k-button k-primary mr-4" onClick={this.addQCRules}>
                Add New Rule
              </Button>
              <Button style={{ width: '90px' }} className="mt-3 k-button k-primary mr-4" onClick={this.editQCRules}>
                Edit Rule
              </Button>
              <Button style={{ width: '90px' }}  onClick={this.removeQCRules} className="mt-3">
                Remove Rule
              </Button>
            </span>
          </div>
        </div>
      </div>
    )
  }
}
