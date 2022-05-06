import axios from "axios";
import { Button, Label } from '@progress/kendo-react-all'
import { Checkbox, Input } from '@progress/kendo-react-inputs'
import React, { Component } from 'react'
import { AlertSetting } from "../../../../eVuMaxObjects/dataObjects/DataObjects/AlertSettings"; // '../../../../eVuMaxObjects/dataObjects';

import { QCRule } from '../../../../eVuMaxObjects/dataObjects/dataObjects';
import { Util } from '../../../../Models/eVuMax';
import { ClientLogger } from '../../../ClientLogger/ClientLogger';
import GlobalMod from '../../../../objects/global';
import BrokerRequest from '../../../../broker/BrokerRequest';
import BrokerParameter from '../../../../broker/BrokerParameter';

let _gMod = new GlobalMod();





export default class AlertSettings extends Component {

  state = { objAlertSetting: new AlertSetting() }

  objLogger: ClientLogger = new ClientLogger("QCRules", _gMod._userId);

  componentDidMount = () => {
    try {
      this.loadAlertSettings();
    } catch (error) {

    }
  }

  loadAlertSettings = () => {
    try {

      Util.StatusInfo("Getting data from server   ");
      this.setState({
        isProcess: true,
      });

      this.objLogger.SendLog("load QC Rules");

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "DataService";
      objBrokerRequest.Broker = "SetupAlertSettings";
      objBrokerRequest.Function = "loadAlertSettings";

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
          
          Util.StatusSuccess("Data successfully retrived  ");
          this.objLogger.SendLog("load Alert Setting Rules Data Received...");


          let objData = JSON.parse(res.data.Response);
        

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
            objAlertSetting: objData,
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

  
  saveAlertSettings = () => {
    try {

      Util.StatusInfo("Getting data from server   ");
      this.setState({
        isProcess: true,
      });

      this.objLogger.SendLog("load QC Rules");

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "DataService";
      objBrokerRequest.Broker = "SetupAlertSettings";
      objBrokerRequest.Function = "saveAlertSettings";

      let paramuserid: BrokerParameter = new BrokerParameter(
        "UserId",
        _gMod._userId
      );
      objBrokerRequest.Parameters.push(paramuserid);

      let paramObjAlertSettings : BrokerParameter = new BrokerParameter(
        "ObjAlertSettings",
        JSON.stringify(this.state.objAlertSetting)
      );
      objBrokerRequest.Parameters.push(paramObjAlertSettings);


      axios
        .get(_gMod._performTask, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },

        })
        .then((res) => {
          
          this.objLogger.SendLog("Saved Alert Settings successfully...");


          //let objData = JSON.parse(res.data.Response);
        

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

          this.loadAlertSettings();
          // this.setState({
          //   objAlertSetting: Object.values(objData),
          // });


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

  handleChange = (objItem: any, fieldName: string) => {
    let edited: any = this.state.objAlertSetting;
    edited[fieldName] = objItem.value;
    this.setState({
      objRigStateSetup: edited
    });


  }

  OkClick = () => {
    try {
      this.saveAlertSettings();
    } catch (error) {

    }
  }

  CancelClick = () => {
    try {

    } catch (error) {

    }
  }
  render() {
    return (
      <div>
        <div className="row">
          <div className='col-xl-10 col-lg-10 col-md-10 col-sm-10'>



            <div className='row'>
              <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
                <div>
                  <Label className="mr-2 mt-3 float-left">New Object Alert</Label>
                </div>
              </div>

            </div>


            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3 ml-5">
                    <Checkbox
                      value={this.state.objAlertSetting.CheckNewObjects}
                      onChange={(e: any) => { this.handleChange(e, "CheckNewObjects") }}
                      //checked={this.state.removeWells}
                      label={"Check for new objects available in WITSML store"}
                    />
                  </span>
                </div>
              </div>

            </div>


            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3 ml-5">
                    <Label className="mr-2 mt-3  ml-5 float-left">Check Frequency </Label>
                    <Input
                      name="NewObjCheckFreq"
                      value={this.state.objAlertSetting.NewObjCheckFreq}
                      onChange={(e) => this.handleChange(e, "NewObjCheckFreq")}
                    />
                  </span>
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3 ml-5">
                    <Label className="mr-2 mt-1  mt-1 ml-5 float-left">Email To </Label>
                    <Input
                      name="NewObjEMail"
                      value={this.state.objAlertSetting.NewObjEMail}
                      onChange={(e) => this.handleChange(e, "NewObjEMail")}
                    />
                  </span>
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3 ml-3">
                    <Label className="mr-2 mt-3 float-left">WITSML Server Outage Alert...</Label>
                  </span>
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3  ml-3" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3 ml-5">
                    <Checkbox
                      value={this.state.objAlertSetting.CheckWITSMLOutage}
                      onChange={(e: any) => { this.handleChange(e, "CheckWITSMLOutage") }}
                      //checked={this.state.removeWells}
                      label={"Check for WITSML Server Outage"}
                    />
                  </span>
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3 ml-5">


                    <Label className="mr-2 mt-3 float-left">Raise alert if server is offline for </Label>
                    <Input
                      name="ServerTimeOut"
                      value={this.state.objAlertSetting.ServerTimeOut}
                      onChange={(e) => this.handleChange(e, "ServerTimeOut")}
                    />
                  </span>
                  <Label className="mr-2 mt-3 float-left">Minutes </Label>
                </div>
              </div>
            </div>




            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3  ml-5" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3">
                    <Label className="mr-2 mt-3 float-left">Email To </Label>
                    <Input
                      name="WITSMLEMail"
                      value={this.state.objAlertSetting.WITSMLEMail}
                      onChange={(e) => this.handleChange(e, "WITSMLEMail")}
                    />
                  </span>
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3  ml-5" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3">
                    <Label className="mr-2 mt-3 float-left">Alert Repeat Frequency </Label>
                    <Input
                      name="RepeatFrequency"
                      value={this.state.objAlertSetting.RepeatFrequency}
                      onChange={(e) => this.handleChange(e, "RepeatFrequency")}
                    />
                  </span>
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3 ml-3">
                    <Label className="mr-2 mt-3 float-left">Objects not downloading data Alert</Label>
                  </span>
                </div>
              </div>
            </div>



            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3 ml-5">
                    <Checkbox
                      value={this.state.objAlertSetting.CheckDownloads}
                      onChange={(e: any) => { this.handleChange(e, "CheckDownloads") }}
                      //checked={this.state.removeWells}
                      label={"Check for object not downloading data"}
                    />
                  </span>
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="mb-3  ml-5" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3">
                    <Label className="mr-2 mt-3 float-left">Check Frequency </Label>
                    <Input
                      name="DownloadCheckFrequency"
                      value={this.state.objAlertSetting.DownloadCheckFrequency}
                      onChange={(e) => this.handleChange(e, "DownloadCheckFrequency")}
                    />
                  </span>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="ml-5" style={{ justifyContent: "flex-end" }}>
                  <span className="mt-3">
                    <Label className="mr-2 mt-3 float-left">Email To </Label>
                    <Input
                      name="DownloadAlertEMail"
                      value={this.state.objAlertSetting.DownloadAlertEMail}
                      onChange={(e) => this.handleChange(e, "DownloadAlertEMail")}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='col-xl-2 col-lg-2 col-md-2 col-sm-2'>
            <span className="btn-group-vertical">
              <Button style={{ width: '90px' }} className="mt-3 k-button k-primary mr-4" onClick={
                this.OkClick
              }>
                Ok
              </Button>
              <Button style={{ width: '90px' }} className="mt-3 k-button k-primary mr-4" onClick={this.CancelClick}>
                Cancel
              </Button>

            </span>
          </div>

        </div>

      </div>
    )
  }
}
