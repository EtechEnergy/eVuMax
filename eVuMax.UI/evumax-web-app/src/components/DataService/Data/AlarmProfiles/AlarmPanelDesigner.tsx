import { Button, Dialog, DropDownList, Grid, GridColumn as Column, Label } from '@progress/kendo-react-all'
import { Checkbox, Input, RadioButton, TextArea } from '@progress/kendo-react-inputs'
import React, { Component } from 'react'
import BrokerParameter from '../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../broker/BrokerRequest';
import { comboData } from '../../../../eVuMaxObjects/UIObjects/comboData';
import { Util } from '../../../../Models/eVuMax';
import GlobalMod from '../../../../objects/global';
import { ClientLogger } from '../../../ClientLogger/ClientLogger';
import { APChannel, apSourceType } from './APChannel';
import axios from "axios";
import * as utilFunc from './../../../../../src/utilFunctions/utilFunctions';
import ExpressionEditor from '../../../ExpressionEditorComponent/ExpressionEditor';
import { DepthLog, TimeLog, Trajectory, Well } from '../../../../eVuMaxObjects/dataObjects/dataObjects';
import AlarmExpression from './AlarmExpression';
import { Dir } from 'fs';

let _gMod = new GlobalMod();

interface IProps {
  onClosePanelDesigner: any,
  objChannel: APChannel,
  ModeChannel: string,
}

export default class AlarmPanelDesigner extends Component<IProps> {
  objLogger: ClientLogger = new ClientLogger("AuditInformation", _gMod._userId);

  state = {
    //objChannel: new APChannel(),
    objData: {} as any,
    objChannel: this.props.objChannel,
    ChannelList: [],
    selectedChannel: new comboData(),

    selectedAlarmCategory: new comboData(),
    cmbAlarmCategory: [],

    isStdChannelList: false,

    AlarmTypeList: [],
    selectedAlarmType: new comboData(),


    AlarmCategory2List: [],

    RigStatesList: [],
    selectedRigState: "",

    WellStatusList: [],
    selectedWellStatus: "",

    selectedDownSampleFunction: new comboData(),
    cmbDownSampleFunction: [],

    selectedAlarmCategory2: new comboData(),
    cmbAlarmCategory2: [] as any,

    selectedShape: new comboData(),
    cmbShape: [] as any,
    //YellowExpression: "",
    showExpressionEditorDialog: false,
    AlarmExpList: [] = [],

    //Add Channel Dialog
    objTimeLog: new TimeLog(),
    objDepthLog: new DepthLog(),
    objTractory: new Trajectory(),

    showAlarmExpListDialog: false,
    expressionType: ""

  }
  componentDidMount = () => {

    //this.loadCombo();
    this.loadData();
  }


  saveExpression = (expressionText: string, expType: string) => {
    try {

      let objChannel_: APChannel = this.state.objChannel;
      if (expType == "YellowExpression") {
        objChannel_.YellowExpression = expressionText;
      } else {
        objChannel_.RedExpression = expressionText;
      }


      this.setState({ showExpressionEditorDialog: false, objChannel_: objChannel_ });

    } catch (error) {

    }
  }

  closeExpression = () => {
    try {
      this.setState({ showExpressionEditorDialog: false });
    } catch (error) {

    }
  }

  loadChannelListCombo = async () => {
    try {
      //alert(this.state.objChannel.SourceType);

      if (this.state.objChannel.SourceType == apSourceType.Trajectory) {
        let cboData: comboData;

        let ChannelList_ = [];
        cboData = new comboData("MD", "MD");
        ChannelList_.push(cboData);

        cboData = new comboData("TVD", "TVD");
        ChannelList_.push(cboData);

        cboData = new comboData("INCLINATION", "INCLINATION");
        ChannelList_.push(cboData);

        cboData = new comboData("AZIMUTH", "AZIMUTH");
        ChannelList_.push(cboData);

        cboData = new comboData("NS", "NS");
        ChannelList_.push(cboData);

        cboData = new comboData("EW", "EW");
        ChannelList_.push(cboData);

        cboData = new comboData("CLOSURE", "CLOSURE");
        ChannelList_.push(cboData);

        cboData = new comboData("DOGLEG", "DOG_LEG");
        ChannelList_.push(cboData);

        cboData = new comboData("DOGLEG 100", "DOG_LEG_100");
        ChannelList_.push(cboData);

        cboData = new comboData("DEPARTURE", "DEPARTURE");
        ChannelList_.push(cboData);

        cboData = new comboData("TOOLFACE", "TOOLFACE");
        ChannelList_.push(cboData);

        cboData = new comboData("WALK RATE", "WALK_RATE");
        ChannelList_.push(cboData);

        cboData = new comboData("BUILD RATE", "BUILD_RATE");
        ChannelList_.push(cboData);
        this.setState({ ChannelList: ChannelList_ });

      }
      // else{
      //   if (this.state.isStdChannelList) {
      //     await this.setState({
      //       ChannelList: Object.values(this.state.objData.stdChannelList)
      //     });
      //   } else {
      //     await this.setState({
      //       ChannelList: Object.values(this.state.objData.channelList)
      //     });
      //   }
      // }
    } catch (error) {

    }
  }
  loadData = async () => {
    try {

      //Load from DB
      Util.StatusInfo("Getting data from server   ");

      this.objLogger.SendLog("load Donwload Audit Info");
      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "DataService";
      objBrokerRequest.Broker = "DataAlarmProfiles";
      objBrokerRequest.Function = "loadAlarmDesignerCombo";

      let objParameter: BrokerParameter = new BrokerParameter(
        "logtype",
        this.state.objChannel.SourceType.toString()
      );
      objBrokerRequest.Parameters.push(objParameter);


      objParameter = new BrokerParameter(
        "isStdChannel", this.state.isStdChannelList.toString());
      objBrokerRequest.Parameters.push(objParameter);

      //alert("source type=" +   this.state.objChannel.SourceType.toString());

      await axios
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


          let objData_ = JSON.parse(res.data.Response);


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


          // let objData_ :any = Object.values(objData);

          let RigStatesList_ = Object.values(objData_.RigStatesList);

          let RigStatesList__ = RigStatesList_.map((item: any) => Object.assign({ selected: false, inEdit: true }, item));

          let WellStatusList_ = Object.values(objData_.WellStatusList);
          let WellStatusList__ = WellStatusList_.map((item: any) => Object.assign({ selected: false, inEdit: true }, item));

          //containerList_ = containerList_.map((item: any) => Object.assign({ selected: false, inEdit: true }, item));


          if (this.state.objChannel.SourceType == apSourceType.Trajectory) {
            if (this.state.isStdChannelList) {

              let combodata_ = new comboData();
              combodata_.id = this.state.objChannel.Mnemonic;
              combodata_.text = this.state.objChannel.ChannelName;


              await this.setState({
                objData: objData_, AlarmTypeList: Object.values(objData_.alarmTypeList),
                AlarmCategory2List: Object.values(objData_.alarmCategory2List), RigStatesList: RigStatesList__, WellStatusList: WellStatusList__
              });
            } else {
              await this.setState({
                objData: objData_, AlarmTypeList: Object.values(objData_.alarmTypeList),
                AlarmCategory2List: Object.values(objData_.alarmCategory2List), RigStatesList: RigStatesList__, WellStatusList: WellStatusList__
              });
            }
          }
          else {
            if (this.state.isStdChannelList) {

              let combodata_ = new comboData();
              combodata_.id = this.state.objChannel.Mnemonic;
              combodata_.text = this.state.objChannel.ChannelName;
              //this.setState({ selectedChannel: combodata_ });


              await this.setState({
                objData: objData_, ChannelList: Object.values(objData_.stdChannelList), AlarmTypeList: Object.values(objData_.alarmTypeList),
                AlarmCategory2List: Object.values(objData_.alarmCategory2List), RigStatesList: RigStatesList__, WellStatusList: WellStatusList__, selectedChannel: combodata_
              });
            } else {
              
              let combodata_ = new comboData();
              combodata_.id = this.state.objChannel.Mnemonic;
              combodata_.text = this.state.objChannel.ChannelName;


              await this.setState({
                objData: objData_, ChannelList: Object.values(objData_.channelList), AlarmTypeList: Object.values(objData_.alarmTypeList),
                AlarmCategory2List: Object.values(objData_.alarmCategory2List), RigStatesList: RigStatesList__, WellStatusList: WellStatusList__,  selectedChannel: combodata_
              });
            }
          }

          //alert("name = " + this.state.objChannel.ChannelName);

          // if (this.state.objChannel.ChannelName != "") {

          //   //name, mnemonic


          //   let combodata_ = new comboData();
          //   combodata_.id = this.state.objChannel.Mnemonic;
          //   combodata_.text = this.state.objChannel.ChannelName;
          //   this.setState({ selectedChannel: combodata_ });
          // }

          this.loadCombo();
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

  loadCombo = async () => {
    try {

      this.loadChannelListCombo();
      //Trajectory
      let cboData: comboData;


      // load category

      this.state.cmbAlarmCategory = [];
      cboData = new comboData("Viewer Alarm", "0");
      this.state.cmbAlarmCategory.push(cboData);
      cboData = new comboData("DQM Alarm", "1");
      this.state.cmbAlarmCategory.push(cboData);


      if (this.state.objChannel.ChannelName != "") {
        for (let index = 0; index < this.state.cmbAlarmCategory.length; index++) {
          if (this.state.cmbAlarmCategory[index].id == this.state.objChannel.AlarmCategory) {
            this.setState({ selectedAlarmCategory: this.state.cmbAlarmCategory[index] });
          }
        }
      }


      // load alarm types from DB


      // load alarm category2 from DB


      // load shapes
      this.state.cmbShape = [];
      cboData = new comboData("Circle", "0");
      this.state.cmbShape.push(cboData);
      cboData = new comboData("Rectangle", "1");
      this.state.cmbShape.push(cboData);
      cboData = new comboData("Triangle", "2");
      this.state.cmbShape.push(cboData);
      cboData = new comboData("Down Triangle", "3");
      this.state.cmbShape.push(cboData);
      cboData = new comboData("Diamond", "4");
      this.state.cmbShape.push(cboData);
      cboData = new comboData("Left Triangle", "5");
      this.state.cmbShape.push(cboData);
      cboData = new comboData("Right Triangle", "6");
      this.state.cmbShape.push(cboData);


      if (this.state.objChannel.ChannelName != "") {
        for (let index = 0; index < this.state.cmbShape.length; index++) {
          if (this.state.cmbShape[index].id == this.state.objChannel.AlarmShape) {
            this.setState({ selectedShape: this.state.cmbShape[index] });
          }
        }

      }

      // load all rig states from DB

      // load well status  from DB

      // down sample function
      this.state.cmbDownSampleFunction = [];
      cboData = new comboData("Last Value", "0");
      this.state.cmbDownSampleFunction.push(cboData);
      cboData = new comboData("Avg Value", "1");
      this.state.cmbDownSampleFunction.push(cboData);
      cboData = new comboData("Min Value", "2");
      this.state.cmbDownSampleFunction.push(cboData);
      cboData = new comboData("Max Value", "3");
      this.state.cmbDownSampleFunction.push(cboData);
      cboData = new comboData("First Value", "4");
      this.state.cmbDownSampleFunction.push(cboData);

      
      if (this.state.objChannel.ChannelName != "") {
        for (let index = 0; index < this.state.cmbDownSampleFunction.length; index++) {
          if (this.state.cmbDownSampleFunction[index].id == this.state.objChannel.DownSampleFunction) {
            this.setState({ selectedDownSampleFunction: this.state.cmbDownSampleFunction[index] });
          }
        }

      }

      for (let index = 0; index < this.state.AlarmTypeList.length; index++) {
        if (this.state.AlarmTypeList[index].id == this.state.objChannel.AlarmType) {
          this.setState({ selectedAlarmType: this.state.AlarmTypeList[index] });
        }
      }

      for (let index = 0; index < this.state.AlarmCategory2List.length; index++) {
        if (this.state.AlarmCategory2List[index].id == this.state.objChannel.AlarmCategory2ID) {
          this.setState({ selectedAlarmCategory2: this.state.AlarmCategory2List[index] });
        }
      }

      //set list
      //rigstate collection
      let selectedRigStateList = this.state.objChannel.RigStates.split(",");


      let rigStateList_ = this.state.RigStatesList;
      selectedRigStateList.forEach(element => {

        let index = this.state.RigStatesList.findIndex(x => x.Number.toString() === element);
        if (index != -1) {
          rigStateList_[index]["selected"] = true;
        }
      });

      await this.setState({ RigStatesList: rigStateList_ });



      //well status selection

      let selectedWellStatusList = this.state.objChannel.WellStatus.split(",");
      let wellStatusList_ = this.state.WellStatusList;

      selectedWellStatusList.forEach(element => {

        let index = this.state.WellStatusList.findIndex(x => x.Number.toString() === element);
        if (index != -1) {
          wellStatusList_[index]["selected"] = true;
        }
      });

      await this.setState({ WellStatusList: wellStatusList_ });



    } catch (error) {

    }
  }
  handleChange = (event: any, field: any) => {
    try {

      const value = event.value;

      const name = field;

      let edited: any = utilFunc.CopyObject(this.state.objChannel);
      edited[field] = value;
      this.setState({
        objChannel: edited
      });


    } catch (error) {

    }
  }

  onClickWizard = () => {
    try {
      let finalRedExpression = ""
      let finalYellowExpression = ""



      //this.objLogger.SendLog("load Donwload Audit Info");
      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "DataService";
      objBrokerRequest.Broker = "DataAlarmProfiles";
      objBrokerRequest.Function = "loadExpWizard";

      //  let objParameter: BrokerParameter = new BrokerParameter(
      //    "logtype",
      //    this.state.objChannel.SourceType.toString()
      //  );
      //  objBrokerRequest.Parameters.push(objParameter);




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
          this.objLogger.SendLog("load ExpWizard Data Received...");


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


          let objData_: any = Object.values(objData);
          //Object.values(objData)[0].Name

          await this.setState({
            AlarmExpList: objData_, showAlarmExpListDialog: true
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

  onDropdownChange = (e: any, field: string) => {
    try {

      let edited = this.state.objChannel;
      let value = e.value;
      let index: number = 0;
      edited[field] = value.text;



      if (field == "ChannelName") {  //Channel 
        
        edited["Mnemonic"] = value.id;
        this.setState({
          selectedChannel: e.value, objChannel: edited
        });
        return;
      }

      if (field == "AlarmType") {

        this.setState({
          selectedAlarmType: e.value, objChannel: edited
        });
        return;
      }


      if (field == "AlarmCategory") {
        this.setState({
          selectedAlarmCategory: e.value, objChannel: edited
        });
        return;
      }

      if (field == "AlarmCategory2ID") {

        this.setState({
          selectedAlarmCategory2: e.value, objChannel: edited
        });
        return;
      }

      if (field == "AlarmShape") {

        this.setState({
          selectedShape: e.value, objChannel: edited
        });
        return;
      }
      
      if (field == "DownSampleFunction") {

        this.setState({
          selectedDownSampleFunction: e.value, objChannel: edited
        });
        return;
      }


      return;



    } catch (error) {

    }
  }


  grdItemChange = (e: any) => {

    e.dataItem[e.field] = e.value;
    this.setState({
      RigStatesList: [...this.state.RigStatesList]
    });

    let newData: any = Object.values([...this.state.RigStatesList]);
    let index = newData.findIndex((item: any) => item.Number === e.dataItem.Number); // use unique value like ID
    newData[index][e.field] = e.value;
    this.setState({ RigStatesList: newData })
  };


  grdRowClick = (e: any, field: string) => {

    if (field == 'RigStatesList') {
      let index = this.state.RigStatesList.findIndex((item: any) => item["Number"] === e.dataItem.Number);
      this.setState({
        selectedRigState: e.dataItem.Number
      });
    }

    if (field == 'WellStatusList') {
      let index = this.state.RigStatesList.findIndex((item: any) => item["WellStatus"] === e.dataItem.WellStatus);
      this.setState({
        selectedWellStatus: e.dataItem.WellStatus
      });
    }


  };


  selectionChange = async (event, field: string) => {
    try {




      const checked = event.syntheticEvent.target.checked;

      if (field == "RigStatesList") {
        const data = this.state.RigStatesList.map((item: any) => {
          if (item["Number"] === event.dataItem.Number) {
            item["selected"] = checked;
          }
          return item;
        });
        await this.setState({ RigStatesList: data });
      }
      if (field == "WellStatusList") {
        const data = this.state.WellStatusList.map((item: any) => {

          if (item["WELL_STATUS"] === event.dataItem.WELL_STATUS) {
            item["selected"] = checked;
          }
          return item;
        });
        await this.setState({ WellStatusList: data });
      }

    } catch (error) {

    }
  }


  grid_headerSelectionChange = (event: any, field: string) => {
    const checked = event.syntheticEvent.target.checked;
    if (field == "RigStatesList") {
      const data = this.state.RigStatesList.map((item: any) => {
        item["selected"] = checked;
        return item;
      });
      this.setState({ RigStatesList: data });
    }
    if (field == "WellStatusList") {
      const data = this.state.WellStatusList.map((item: any) => {
        item["selected"] = checked;
        return item;
      });
      this.setState({ WellStatusList: data });
    }

  };

  onOpenEditorClick = (e: any, field: string) => {
    try {


      let localTimeLog: TimeLog = new TimeLog();
      let localDepthLog: DepthLog = new DepthLog();
      let localTrajectory: Trajectory = new Trajectory();


      if (this.state.objChannel.SourceType == 1) {
        localTimeLog = this.state.objTimeLog;
      }

      if (this.state.objChannel.SourceType == 2) {
        localDepthLog = this.state.objDepthLog;
      }

      if (this.state.objChannel.SourceType == 3) {
        localTrajectory = new Trajectory();
      }

      this.setState({ showExpressionEditorDialog: true, expressionType: field });
    } catch (error) {

    }
  }

  okClick = async () => {
    try {

      if (this.state.objChannel.RigStateSelection) {
        let objChannel_: APChannel = new APChannel();
        objChannel_.RigStates = "";

        this.setState({ objChannel: objChannel_ });
      }
      else {
        let strRigStates: string = "";


        for (let i: number = 0; (i <= (this.state.RigStatesList.length - 1)); i++) {
          let rigState_ = this.state.RigStatesList[i];

          if (rigState_.selected) {
            strRigStates = strRigStates + "," + this.state.RigStatesList[i].Number;
          }

        }

        if ((strRigStates.trim() != "")) {
          strRigStates = strRigStates.substring(1);
        }

        let objChannel_: APChannel = this.state.objChannel;
        objChannel_.RigStates = strRigStates;
        await this.setState({ objChannel: objChannel_ });

        let strWellStatus = "";
        if (this.state.objChannel.WellStatusSpecific) {
          this.state.objChannel.WellStatus = "";
        } else {
          this.state.WellStatusList.forEach(element => {
            if (element.selected) {
              strWellStatus = strWellStatus + "," + element.WELL_STATUS;
            }
          });

          if ((strWellStatus.trim() != "")) {
            strWellStatus = strWellStatus.substring(1);
          }

        }
      }
      

        this.props.onClosePanelDesigner(this.state.objChannel, this.props.ModeChannel);
     

    } catch (error) {

    }
  }

  cancelClick = () => {
    this.props.onClosePanelDesigner();
  }
  render() {
    return (
      <div className='mt-3'>
        <div className="row">
          <div className='col-lg-6 col-xl-6 col-md-6 col-sm-6'>
            <div className="form-group">
              <Label>Source</Label>
              <RadioButton
                value="1"
                checked={this.state.objChannel.SourceType === 0}
                label="Time Log"
                //onChange={(e)=>{this.handleChange(e, "SourceType")}}
                // onChange={(e)=>{
                //   this.setState({SourceType : apSourceType.TimeLog });
                // }}

                onChange={(e) => {
                  let objChannel_ = this.state.objChannel;
                  objChannel_.SourceType = 0;
                  //this.loadChannelListCombo();
                  this.setState({ objChannel: objChannel_ });
                  this.loadCombo();
                }}
              >
              </RadioButton>

              {/* <RadioButton
                value="2"
                checked={this.state.objChannel.SourceType === 2}
                label="Depth Log"
              >
              </RadioButton> */}

              <RadioButton
                value="3"
                checked={this.state.objChannel.SourceType === 2}
                label="Trajectory"
                //onChange={(e)=>{this.handleChange(e, "SourceType")}}
                onChange={(e) => {
                  let objChannel_ = this.state.objChannel;
                  objChannel_.SourceType = 2;
                  //this.loadChannelListCombo();
                  this.setState({ objChannel: objChannel_ });
                  this.loadCombo();
                }}
              >
              </RadioButton>
            </div>

            <div className="form-group">
              <Label>Channel</Label>
              <DropDownList
                name="cmbChannel"
                textField="text"
                dataItemKey="id"
                data={this.state.ChannelList}
                value={this.state.selectedChannel}
                onChange={(e) => this.onDropdownChange(e, "ChannelName")}
              >
              </DropDownList>

              <Checkbox
                className="ml-2"
                label={"Standard List"}
                value={this.state.isStdChannelList}
                onChange={async (e) => {

                  await this.setState({ isStdChannelList: e.value });
                  this.loadCombo();

                }

                }
              >

              </Checkbox>
            </div>

            <div className="form-group">
              <Label>Name</Label>
              <Input
                name="ChannelName"
                value={this.state.objChannel.ChannelName}
                onChange={(e) => { this.handleChange(e, "ChannelName") }}
              >
              </Input>
            </div>


            <div className="form-group">
              <Label>Category</Label>
              <DropDownList
                name="cmbAlarmCategory"
                style={{ width: "20vw" }}
                className="form-control"
                textField="text"
                dataItemKey="id"
                data={this.state.cmbAlarmCategory}
                value={this.state.selectedAlarmCategory}
                onChange={(e) => this.onDropdownChange(e, "AlarmCategory")}




              >
              </DropDownList>
            </div>

            <div className="form-group">
              <Label>Alarm Type</Label>
              <DropDownList
                name="cmbAlarmType"
                style={{ width: "20vw" }}
                className="form-control"
                textField="text"
                dataItemKey="id"
                data={this.state.AlarmTypeList}
                onChange={(e) => this.onDropdownChange(e, "AlarmType")}
                value={this.state.selectedAlarmType}
              >
              </DropDownList>
            </div>

            <div className="form-group">
              <Label>Alarm Category</Label>
              <DropDownList
                name="cmbAlarmCategory2"
                style={{ width: "20vw" }}
                className="form-control"
                textField="text"
                dataItemKey="id"
                data={this.state.AlarmCategory2List}
                onChange={(e) => this.onDropdownChange(e, "AlarmCategory2ID")}
                value={this.state.selectedAlarmCategory2}
              >
              </DropDownList>
            </div>

            <div className="form-group mt-3 mb-3">
              <Label>Yellow Expression</Label>

              <RadioButton
                value={false}
                checked={this.state.objChannel.YellowUseBuilder === false}
                label="Directly enter Expression"
                onChange={(e) => { this.handleChange(e, "YellowUseBuilder") }}
              >
              </RadioButton>


              {/* <RadioButton
                value={true}
                checked={this.state.objChannel.YellowUseBuilder == true}
                label="Use Conditional Builder"
                onChange={(e) => { this.handleChange(e, "YellowUseBuilder") }}
              >
              </RadioButton> */}
              <Button id="cmdWizard" style={{ visibility: 'hidden' }} onClick={this.onClickWizard} className='ml-3'>Run Expression Wizard </Button>
            </div>


            <div className="form-group  mt-3 mb-3">
              <TextArea
                autoSize={true}
                style={{ width: "30%" }}
                rows={2}
                value={this.state.objChannel.YellowExpression}
                onChange={(e) => this.handleChange(e, "YellowExpression")}
              />

              <Button id="cmdOpenEditor" style={{ width: "150px" }} onClick={(e) => this.onOpenEditorClick(e, "YellowExpression")} className='ml-3'>Open Editor </Button>
            </div>

            <div style={{ visibility: 'hidden' }} className="form-group  mt-3 mb-3">
              <Button>Click to Open Container Builder</Button>

              <Button className='ml-3' style={{ width: "150px" }}>
                Open Editor
              </Button>
            </div>

            <div className="form-group  mt-3 mb-3">
              <Label>Red Expression</Label>

              <RadioButton
                checked={this.state.objChannel.RedUseBuilder == false}
                label="Directly enter Expression"
              >
              </RadioButton>

              {/* 
              <RadioButton
                checked={this.state.objChannel.RedUseBuilder}
                label="Use Conditional Builder"
              >
              </RadioButton> */}

              <Button id="cmdWizard" style={{ visibility: 'hidden', width: "150px" }} onClick={this.onClickWizard} className='ml-3'>Run Expression Wizard </Button>
            </div>


            <div className="form-group  mt-3 mb-3">
              <TextArea
                autoSize={true}
                style={{ width: "30%" }}
                rows={2}
                value={this.state.objChannel.RedExpression}
                onChange={(e) => this.handleChange(e, "RedExpression")}

              />
              {/* <Button>Click to Open Container Builder</Button> */}

              <Button className='ml-3' style={{ width: "150px" }}
                onClick={(e) => this.onOpenEditorClick(e, "RedExpression")}
              >
                Open Editor
              </Button>
            </div>

            <div className="form-group">
              <Label>
                Shape
              </Label>
              <DropDownList
                name="cmbShape"
                style={{ width: "200px" }}
                className="form-control"
                textField="text"
                dataItemKey="id"
                data={this.state.cmbShape}
                onChange={(e) => this.onDropdownChange(e, "AlarmShape")}
                value={this.state.selectedShape}
              >

              </DropDownList>

              <Label>
                Shape Color
              </Label>
              <Input value={this.state.objChannel.ShapeColor} className="ml-3" style={{ width: "100px" }}></Input>
            </div>

            <div className="form-group">
              <Label>
                Shape Size
              </Label>
              <Input value={this.state.objChannel.ShapeSize} className="ml-3" style={{ width: "100px" }} onChange={(e) => this.handleChange(e, "ShapeSize")}></Input>
            </div>

            <div className="form-group">
              <Checkbox
                name="AcknRequire"
                checked={this.state.objChannel.AckRequired}
                label={"Acknowledgement Require"}
                onChange={(e) => { this.handleChange(e, "AckRequired") }}
              >
              </Checkbox>

              <Checkbox
                name="PlaySound"
                checked={this.state.objChannel.PlaySound}
                label={"Play sound when this alarm is triggered"}
                onChange={(e) => { this.handleChange(e, "PlaySound") }}
                className="ml-3"
              >
              </Checkbox>

            </div>


          </div>


          {this.state.objChannel.SourceType == 0 &&

            <div className='col-lg-6 col-xl-6 col-md-6 col-sm-6'>
              <div className="form-group">

                <h4>
                  Rig State Selection
                </h4>
                <Checkbox
                  checked={this.state.objChannel.RigStateSelection}
                  onClick={(e) => this.handleChange(e, "RigStateSelection")}
                  label={"Only evaluate for selected rig states"}
                ></Checkbox>

              </div>

              <div className="form-group">
                <div className="row">
                  <div className="col-12">
                    <Grid
                      className='mt-3'
                      data={this.state.RigStatesList}
                      onRowClick={(e) => { this.grdRowClick(e, "RigStatesList") }}

                      onSelectionChange={(e) => { this.selectionChange(e, "RigStatesList") }}
                      editField="inEdit"
                      selectedField="selected"
                      style={{ height: "300px", width: "600px" }}
                      onHeaderSelectionChange={(e) => { this.grid_headerSelectionChange(e, "RigStatesList") }} //Nishant 26-05-2020
                    >
                      <Column
                        field="selected"
                        width="65px"
                        title=""
                        resizable={true}
                        minResizableWidth={65}
                        headerClassName="text-center"
                        className="text-center"
                        editable={true}
                        editor="boolean">

                      </Column>



                      <Column
                        field='Name'
                      >

                      </Column>


                    </Grid>
                  </div>
                </div>


              </div>






              <div className="form-group">

                <h4>
                  Well Status Selection
                </h4>
                <Checkbox
                  checked={this.state.objChannel.WellStatusSpecific}
                  onClick={(e) => this.handleChange(e, "WellStatusSpecific")}
                  label={"Only evaluate for selected well status"}
                ></Checkbox>

              </div>

              <div className="form-group">
                <div className="row">
                  <div className="col-12">
                    <Grid
                      data={this.state.WellStatusList}

                      className='mt-3'
                      onRowClick={(e) => { this.grdRowClick(e, "WellStatusList") }}
                      onSelectionChange={(e) => { this.selectionChange(e, "WellStatusList") }}

                      editField="inEdit"
                      selectedField="selected"
                      style={{ height: "300px", width: "600px" }}
                      onHeaderSelectionChange={(e) => { this.grid_headerSelectionChange(e, "WellStatusList") }} //Nishant 26-05-2020

                    >
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
                      >

                      </Column>

                      <Column
                        field='WELL_STATUS'
                      >

                      </Column>


                    </Grid>
                  </div>
                </div>


              </div>


              <div className="form-group">
                <Label>Trigger Based on</Label>

                <RadioButton
                  value={0}
                  checked={this.state.objChannel.TriggerType === 0}
                  onChange={(e) => this.handleChange(e, "TriggerType")}
                  label={"Current Data"}
                >

                </RadioButton>

                <RadioButton
                  value={1}
                  checked={this.state.objChannel.TriggerType === 1}
                  onChange={(e) => this.handleChange(e, "TriggerType")}
                  label={"Data of Last"}
                >
                </RadioButton>

                <Input value={this.state.objChannel.TimeDuration}
                  style={{ width: "100px" }}
                  onChange={(e) => this.handleChange(e, "TimeDuration")}
                ></Input>
                <Label> Minutes</Label>
              </div>


              <div className="form-group">
                <Label> Down Sample Function </Label>
                <DropDownList
                  id="DownSampleFunction"
                  data={this.state.cmbDownSampleFunction}
                  //value={this.state.objChannel.DownSampleFunction}
                  value={this.state.selectedDownSampleFunction}
                  textField="text"
                  dataItemKey="id"
                  onChange={(e) => { this.onDropdownChange(e, "DownSampleFunction") }}
                >

                </DropDownList>
              </div>

              <div className="form-group">
                <Label className='mr-3'>Alarm Frequency</Label>
                <Input value={this.state.objChannel.Frequency} onChange={(e) => this.handleChange(e, "Frequency")} ></Input>
                <Label className='ml-3'> Minutes</Label>
              </div>

              <div className="form-group">
                <Checkbox
                  label={"Send email to "}
                  checked={this.state.objChannel.SendMail}
                  onChange={(e) => this.handleChange(e, "SendMail")}
                >
                </Checkbox>

                <Label className='mr-3'>If Alarm is not validated in </Label>
                <Input className='mr-3' value={this.state.objChannel.AckTimeLimit} onChange={(e) => this.handleChange(e, "AckTimeLimit")}></Input>
                <Label>Minutes </Label>


              </div>


            </div>
          }


        </div>


        <div className='row'>
          <div className="col-12">
            <Button style={{ width: "150px" }}
              onClick={this.okClick}
            >
              Ok
            </Button>

            <Button className='ml-2' style={{ width: "150px" }}
              onClick={this.cancelClick}>
              Cancel
            </Button>
          </div>
        </div>

        {this.state.showExpressionEditorDialog &&
          <Dialog
            height={500}
            width={600}
          >
            <ExpressionEditor {...this} objTimeLog={this.state.objTimeLog} objDepthLog={this.state.objDepthLog} objTractory={this.state.objTractory} expressionText={this.state.objChannel.YellowExpression} expType={this.state.expressionType}></ExpressionEditor>
          </Dialog>
        }


        {this.state.showAlarmExpListDialog &&
          <Dialog
            title={"Alarm Expression"}
            onClose={() =>
              this.setState({ showAlarmExpListDialog: false })
            }
            height={500}
            width={600}
          >
            <AlarmExpression AlarmExpList={this.state.AlarmExpList}></AlarmExpression>
          </Dialog>
        }


      </div>

    )
  }
}