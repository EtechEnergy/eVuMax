import axios from "axios";
import { DropDownList, Input, Label, TabStrip, TabStripSelectEventArguments, TabStripTab } from '@progress/kendo-react-all'
import { Checkbox, MaskedTextBox, NumericTextBox } from '@progress/kendo-react-inputs'
import React, { Component } from 'react'
import "./CommonSettings.css"
import FileInputComponent from 'react-file-input-previews-base64'
import { enumSettingsIDs, SystemSettings } from './SystemSettings'
import { SettingValue } from './SettingValue'
import { comboData } from '../../../../eVuMaxObjects/UIObjects/comboData'
import BrokerRequest from '../../../../broker/BrokerRequest'
import BrokerParameter from '../../../../broker/BrokerParameter'
import GlobalMod from "../../../../objects/global";
import { Util } from "../../../../Models/eVuMax";
import { convertMapToDictionaryJSON } from "../../../../utilFunctions/utilFunctions";



let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();

export default class CommonSettings extends Component {
  SystemSettingsList = new Map();

  AxiosSource = axios.CancelToken.source();
  AxiosConfig = { cancelToken: this.AxiosSource.token };

  pageSizeList: comboData[] = [];
  OrientationList: comboData[] = [];
  TimeZoneList: comboData[] = [];

  state = {
    selectedTab: 0,
    // objSettings: new SystemSettings(),
    objSettings_: this.SystemSettingsList,
    Image: {} as any,
    cmbPageSize: new comboData(),
    cmbOrientation: new comboData(),
    cmbTimeZone: new comboData(),
    DayTimeFrom: "",
    DayTimeTo: "",
  }

  
  componentWillMount(): void {
    debugger;
    if (_gMod._userId == "" || _gMod._userId == undefined) {
      window.location.href = "/evumaxapp/";
      return;
  }
    this.initializeSystemSettings();
  }

  componentDidMount() {


    this.generateCombo();
    this.LoadSetting();
  };

  initializeSystemSettings = () => {
    try {
      let objSystemSettings: SystemSettings = new SystemSettings();
      debugger;
      Object.values(objSystemSettings.settings).forEach((objItem: SettingValue) => {
        this.SystemSettingsList.set(objItem.SettingID, objItem);
      });

    } catch (error) {

    }
  }

  setdata = async (objData: any) => {
    try {
      // let edited: any = {};
      // edited.settings = Object.values(objData.settings);
      let objMap = new Map();
      Object.values(objData.settings).forEach((objItem: SettingValue) => {
        objMap.set(objItem.SettingID, objItem);
      });


      // await this.setState({
      //   //objSettings: edited,
      //   objSettings_: new Map()
      // });

      await this.setState({
        objSettings_: objMap
      });





      //set Combodata
      //pageSizeList
      for (let index = 0; index < this.pageSizeList.length; index++) {
        const element = this.pageSizeList[index];

        if (element.id == this.state.objSettings_.get(enumSettingsIDs.PageSize).Value) {
          this.setState({
            cmbPageSize: element
          });
          break;
        }
      }

      //OrientationList
      for (let index = 0; index < this.OrientationList.length; index++) {
        const element = this.OrientationList[index];

        if (element.id == this.state.objSettings_.get(enumSettingsIDs.Orientation).Value) {

          this.setState({
            cmbOrientation: element
          });
          break;
        }
      }

      //TimeZoneList
      for (let index = 0; index < this.TimeZoneList.length; index++) {
        const element = this.TimeZoneList[index];

        if (element.id == this.state.objSettings_.get(enumSettingsIDs.TimeZone).Value) {

          this.setState({
            cmbTimeZone: element
          });
          break;
        }
      }


    } catch (error) {

    }
  }

  LoadSetting = () => {
    try {
      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "DataService";
      objBrokerRequest.Broker = "SetupCommonSetting";
      objBrokerRequest.Function = "loadSystemSettings";

      //let objParameter: BrokerParameter = new BrokerParameter("objSetup", JSON.stringify(this.state.se));
      //objBrokerRequest.Parameters.push(objParameter);

      //objParameter = new BrokerParameter("WellID", this.WellId);
      //objBrokerRequest.Parameters.push(objParameter);

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
          debugger;
          console.log(objData);
          if (res.data.RequestSuccessfull) {
            if (objData != undefined || objData != "") {

              this.setdata(objData);
            }

          } else {
            // Error
          }
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


    } catch (error) {

    }
  }
  generateCombo = () => {
    try {

      this.pageSizeList.length = 0;
      this.pageSizeList.push(new comboData("A0", "0"));
      this.pageSizeList.push(new comboData("A1", "1"));
      this.pageSizeList.push(new comboData("A2", "2"));
      this.pageSizeList.push(new comboData("A3", "3"));
      this.pageSizeList.push(new comboData("A4", "4"));
      this.pageSizeList.push(new comboData("A5", "5"));
      this.pageSizeList.push(new comboData("A6", "6"));
      this.pageSizeList.push(new comboData("A7", "7"));
      this.pageSizeList.push(new comboData("A8", "8"));
      this.pageSizeList.push(new comboData("A9", "9"));
      this.pageSizeList.push(new comboData("Executive", "10"));
      this.pageSizeList.push(new comboData("Ledger", "11"));
      this.pageSizeList.push(new comboData("Legal", "12"));
      this.pageSizeList.push(new comboData("Letter", "13"));

      this.OrientationList.length = 0;
      this.OrientationList.push(new comboData("Portrait", "0"));
      this.OrientationList.push(new comboData("Landscape", "1"));

      this.TimeZoneList.length = 0;
      this.TimeZoneList.push(new comboData("-12:00:00 Dateline Standard Time", "Dateline Standard Time"));
      this.TimeZoneList.push(new comboData("-11:00:00 UTC-11", "UTC-11"));
      this.TimeZoneList.push(new comboData("-10:00:00 Hawaiian Standard Time", "Hawaiian Standard Time"));
      this.TimeZoneList.push(new comboData("-09:00:00 Alaskan Standard Time", "Alaskan Standard Time"));
      this.TimeZoneList.push(new comboData("-08:00:00 Pacific Standard Time (Mexico)", "Pacific Standard Time (Mexico)"));
      this.TimeZoneList.push(new comboData("-08:00:00 Pacific Standard Time", "Pacific Standard Time"));
      this.TimeZoneList.push(new comboData("-07:00:00 US Mountain Standard Time", "US Mountain Standard Time"));
      this.TimeZoneList.push(new comboData("-07:00:00 Mountain Standard Time (Mexico)", "Mountain Standard Time (Mexico)"));
      this.TimeZoneList.push(new comboData("-07:00:00 Mountain Standard Time", "Mountain Standard Time"));
      this.TimeZoneList.push(new comboData("-06:00:00 Central America Standard Time", "Central America Standard Time"));
      this.TimeZoneList.push(new comboData("-06:00:00 Central Standard Time", "Central Standard Time"));
      this.TimeZoneList.push(new comboData("-06:00:00 Central Standard Time (Mexico)", "Central Standard Time (Mexico)"));
      this.TimeZoneList.push(new comboData("-06:00:00 Canada Central Standard Time", "Canada Central Standard Time"));
      this.TimeZoneList.push(new comboData("-05:00:00 SA Pacific Standard Time", "SA Pacific Standard Time"));
      this.TimeZoneList.push(new comboData("-05:00:00 Eastern Standard Time", "Eastern Standard Time"));
      this.TimeZoneList.push(new comboData("-05:00:00 US Eastern Standard Time", "US Eastern Standard Time"));
      this.TimeZoneList.push(new comboData("-04:30:00 Venezuela Standard Time", "Venezuela Standard Time"));
      this.TimeZoneList.push(new comboData("-04:00:00 Paraguay Standard Time", "Paraguay Standard Time"));
      this.TimeZoneList.push(new comboData("-04:00:00 Atlantic Standard Time", "Atlantic Standard Time"));
      this.TimeZoneList.push(new comboData("-04:00:00 Central Brazilian Standard Time", "Central Brazilian Standard Time"));
      this.TimeZoneList.push(new comboData("-04:00:00 SA Western Standard Time", "SA Western Standard Time"));
      this.TimeZoneList.push(new comboData("-04:00:00 Pacific SA Standard Time", "Pacific SA Standard Time"));
      this.TimeZoneList.push(new comboData("-03:30:00 Newfoundland Standard Time", "Newfoundland Standard Time"));
      this.TimeZoneList.push(new comboData("-03:00:00 E. South America Standard Time", "E. South America Standard Time"));
      this.TimeZoneList.push(new comboData("-03:00:00 Argentina Standard Time", "Argentina Standard Time"));
      this.TimeZoneList.push(new comboData("-03:00:00 SA Eastern Standard Time", "SA Eastern Standard Time"));
      this.TimeZoneList.push(new comboData("-03:00:00 Greenland Standard Time", "Greenland Standard Time"));
      this.TimeZoneList.push(new comboData("-03:00:00 Montevideo Standard Time", "Montevideo Standard Time"));
      this.TimeZoneList.push(new comboData("-03:00:00 Bahia Standard Time", "Bahia Standard Time"));
      this.TimeZoneList.push(new comboData("-02:00:00 UTC-02", "UTC-02"));
      this.TimeZoneList.push(new comboData("-02:00:00 Mid-Atlantic Standard Time", "Mid-Atlantic Standard Time"));
      this.TimeZoneList.push(new comboData("-01:00:00 Azores Standard Time", "Azores Standard Time"));
      this.TimeZoneList.push(new comboData("-01:00:00 Cape Verde Standard Time", "Cape Verde Standard Time"));
      this.TimeZoneList.push(new comboData("00:00:00 Morocco Standard Time", "Morocco Standard Time"));
      this.TimeZoneList.push(new comboData("00:00:00 UTC", "UTC"));
      this.TimeZoneList.push(new comboData("00:00:00 GMT Standard Time", "GMT Standard Time"));
      this.TimeZoneList.push(new comboData("00:00:00 Greenwich Standard Time", "Greenwich Standard Time"));
      this.TimeZoneList.push(new comboData("01:00:00 W. Europe Standard Time", "W. Europe Standard Time"));
      this.TimeZoneList.push(new comboData("01:00:00 Central Europe Standard Time", "Central Europe Standard Time"));
      this.TimeZoneList.push(new comboData("01:00:00 Romance Standard Time", "Romance Standard Time"));
      this.TimeZoneList.push(new comboData("01:00:00 Central European Standard Time", "Central European Standard Time"));
      this.TimeZoneList.push(new comboData("01:00:00 W. Central Africa Standard Time", "W. Central Africa Standard Time"));
      this.TimeZoneList.push(new comboData("01:00:00 Namibia Standard Time", "Namibia Standard Time"));
      this.TimeZoneList.push(new comboData("02:00:00 Jordan Standard Time", "Jordan Standard Time"));
      this.TimeZoneList.push(new comboData("02:00:00 GTB Standard Time", "GTB Standard Time"));
      this.TimeZoneList.push(new comboData("02:00:00 Middle East Standard Time", "Middle East Standard Time"));
      this.TimeZoneList.push(new comboData("02:00:00 Egypt Standard Time", "Egypt Standard Time"));
      this.TimeZoneList.push(new comboData("02:00:00 Syria Standard Time", "Syria Standard Time"));
      this.TimeZoneList.push(new comboData("02:00:00 South Africa Standard Time", "South Africa Standard Time"));
      this.TimeZoneList.push(new comboData("02:00:00 FLE Standard Time", "FLE Standard Time"));
      this.TimeZoneList.push(new comboData("02:00:00 Turkey Standard Time", "Turkey Standard Time"));
      this.TimeZoneList.push(new comboData("02:00:00 Israel Standard Time", "Israel Standard Time"));
      this.TimeZoneList.push(new comboData("02:00:00 E. Europe Standard Time", "E. Europe Standard Time"));
      this.TimeZoneList.push(new comboData("03:00:00 Arabic Standard Time", "Arabic Standard Time"));
      this.TimeZoneList.push(new comboData("03:00:00 Kaliningrad Standard Time", "Kaliningrad Standard Time"));
      this.TimeZoneList.push(new comboData("03:00:00 Arab Standard Time", "Arab Standard Time"));
      this.TimeZoneList.push(new comboData("03:00:00 E. Africa Standard Time", "E. Africa Standard Time"));
      this.TimeZoneList.push(new comboData("03:30:00 Iran Standard Time", "Iran Standard Time"));
      this.TimeZoneList.push(new comboData("04:00:00 Arabian Standard Time", "Arabian Standard Time"));
      this.TimeZoneList.push(new comboData("04:00:00 Azerbaijan Standard Time", "Azerbaijan Standard Time"));
      this.TimeZoneList.push(new comboData("04:00:00 Russian Standard Time", "Russian Standard Time"));
      this.TimeZoneList.push(new comboData("04:00:00 Mauritius Standard Time", "Mauritius Standard Time"));
      this.TimeZoneList.push(new comboData("04:00:00 Georgian Standard Time", "Georgian Standard Time"));
      this.TimeZoneList.push(new comboData("04:00:00 Caucasus Standard Time", "Caucasus Standard Time"));
      this.TimeZoneList.push(new comboData("04:30:00 Afghanistan Standard Time", "Afghanistan Standard Time"));
      this.TimeZoneList.push(new comboData("05:00:00 Pakistan Standard Time", "Pakistan Standard Time"));
      this.TimeZoneList.push(new comboData("05:00:00 West Asia Standard Time", "West Asia Standard Time"));
      this.TimeZoneList.push(new comboData("05:30:00 India Standard Time", "India Standard Time"));
      this.TimeZoneList.push(new comboData("05:30:00 Sri Lanka Standard Time", "Sri Lanka Standard Time"));
      this.TimeZoneList.push(new comboData("05:45:00 Nepal Standard Time", "Nepal Standard Time"));
      this.TimeZoneList.push(new comboData("06:00:00 Central Asia Standard Time", "Central Asia Standard Time"));
      this.TimeZoneList.push(new comboData("06:00:00 Bangladesh Standard Time", "Bangladesh Standard Time"));
      this.TimeZoneList.push(new comboData("06:00:00 Ekaterinburg Standard Time", "Ekaterinburg Standard Time"));
      this.TimeZoneList.push(new comboData("06:30:00 Myanmar Standard Time", "Myanmar Standard Time"));
      this.TimeZoneList.push(new comboData("07:00:00 SE Asia Standard Time", "SE Asia Standard Time"));
      this.TimeZoneList.push(new comboData("07:00:00 N. Central Asia Standard Time", "N. Central Asia Standard Time"));
      this.TimeZoneList.push(new comboData("08:00:00 China Standard Time", "China Standard Time"));
      this.TimeZoneList.push(new comboData("08:00:00 North Asia Standard Time", "North Asia Standard Time"));
      this.TimeZoneList.push(new comboData("08:00:00 Singapore Standard Time", "Singapore Standard Time"));
      this.TimeZoneList.push(new comboData("08:00:00 W. Australia Standard Time", "W. Australia Standard Time"));
      this.TimeZoneList.push(new comboData("08:00:00 Taipei Standard Time", "Taipei Standard Time"));
      this.TimeZoneList.push(new comboData("08:00:00 Ulaanbaatar Standard Time", "Ulaanbaatar Standard Time"));
      this.TimeZoneList.push(new comboData("09:00:00 North Asia East Standard Time", "North Asia East Standard Time"));
      this.TimeZoneList.push(new comboData("09:00:00 Tokyo Standard Time", "Tokyo Standard Time"));
      this.TimeZoneList.push(new comboData("09:00:00 Korea Standard Time", "Korea Standard Time"));
      this.TimeZoneList.push(new comboData("09:30:00 Cen. Australia Standard Time", "Cen. Australia Standard Time"));
      this.TimeZoneList.push(new comboData("09:30:00 AUS Central Standard Time", "AUS Central Standard Time"));
      this.TimeZoneList.push(new comboData("10:00:00 E. Australia Standard Time", "E. Australia Standard Time"));
      this.TimeZoneList.push(new comboData("10:00:00 AUS Eastern Standard Time", "AUS Eastern Standard Time"));
      this.TimeZoneList.push(new comboData("10:00:00 West Pacific Standard Time", "West Pacific Standard Time"));
      this.TimeZoneList.push(new comboData("10:00:00 Tasmania Standard Time", "Tasmania Standard Time"));
      this.TimeZoneList.push(new comboData("10:00:00 Yakutsk Standard Time", "Yakutsk Standard Time"));
      this.TimeZoneList.push(new comboData("11:00:00 Central Pacific Standard Time", "Central Pacific Standard Time"));
      this.TimeZoneList.push(new comboData("11:00:00 Vladivostok Standard Time", "Vladivostok Standard Time"));
      this.TimeZoneList.push(new comboData("12:00:00 New Zealand Standard Time", "New Zealand Standard Time"));
      this.TimeZoneList.push(new comboData("12:00:00 UTC+12", "UTC+12"));
      this.TimeZoneList.push(new comboData("12:00:00 Fiji Standard Time", "Fiji Standard Time"));
      this.TimeZoneList.push(new comboData("12:00:00 Magadan Standard Time", "Magadan Standard Time"));
      this.TimeZoneList.push(new comboData("12:00:00 Kamchatka Standard Time", "Kamchatka Standard Time"));
      this.TimeZoneList.push(new comboData("13:00:00 Tonga Standard Time", "Tonga Standard Time"));
      this.TimeZoneList.push(new comboData("13:00:00 Samoa Standard Time", "Samoa Standard Time"));
    } catch (error) {

    }
    this.setState({

      DayTimeFrom: this.state.DayTimeFrom,
      DayTimeTo: this.state.DayTimeTo,


    });
  }

  handleChangeDropDown = (objItem: any, fieldName: string) => {


    debugger;

    let edited = this.state.objSettings_;
    let value = objItem.value;
    let index: number = 0;

    if (fieldName == enumSettingsIDs.PageSize) {
      //index = this.state.objSettings.settings.findIndex((d: any) => d.SettingID === fieldName);
      // if (index > -1) {
      //   edited.settings[index].Value = value.id;

      //   this.setState({
      //     cmbPageSize: value,
      //     objSettings: edited

      //   });
      // }
      if (edited.has(fieldName)) {
        let objSetting: SettingValue = edited.get(fieldName);
        objSetting.Value = value.id;
        edited.set(fieldName, objSetting);
        this.setState({
          objSettings_: edited,
          cmbPageSize: value,
        });
      }



    }
    if (fieldName == enumSettingsIDs.Orientation) {
      // index = this.state.objSettings.settings.findIndex((d: any) => d.SettingID === fieldName);
      // if (index > -1) {
      //   edited.settings[index].Value = value.id;

      //   this.setState({
      //     cmbOrientation: value,
      //     objSettings: edited

      //   });
      // }

      if (edited.has(fieldName)) {
        let objSetting: SettingValue = edited.get(fieldName);
        objSetting.Value = value.id;
        edited.set(fieldName, objSetting);
        this.setState({
          objSettings_: edited,
          cmbOrientation: value,
        });
      }
    }

    if (fieldName == enumSettingsIDs.TimeZone) {
      debugger;
      // index = this.state.objSettings.settings.findIndex((d: any) => d.SettingID === fieldName);
      // if (index > -1) {
      //   edited.settings[index].Value = value.id;

      //   this.setState({
      //     cmbTimeZone: value,
      //     objSettings: edited

      //   });
      // }
      if (edited.has(fieldName)) {
        let objSetting: SettingValue = edited.get(fieldName);
        objSetting.Value = value.id;
        edited.set(fieldName, objSetting);
        this.setState({
          objSettings_: edited,
          cmbTimeZone: value,
        });
      }

    }

  }

  handleChange = (objItem: any, fieldName: string) => {


    // let edited: any = this.state.objSettings;
    // let index: number = 0;
    // index = this.state.objSettings.settings.findIndex((d: any) => d.SettingID === fieldName);
    // if (index > -1) {
    //   edited.settings[index].Value = objItem.value;
    //   this.setState({
    //     objSettings: edited
    //   });
    // }

    debugger;
    let edited = new Map();
    edited = this.state.objSettings_;
    let index: number = 0;
    //index = this.state.objSettings.settings.findIndex((d: any) => d.SettingID === fieldName);
    if (edited.has(fieldName)) {
      let objSetting: SettingValue = edited.get(fieldName);
      objSetting.Value = objItem.value;
      edited.set(fieldName, objSetting);
      this.setState({
        objSettings_: edited
      });
    }


  }

  cancel=()=>{
    try {
      
      window.location.href = "/evumaxapp/dashboard/home";

    } catch (error) {
      
    }
  }
  save = () => {

    try {
      ;
      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "DataService";
      objBrokerRequest.Broker = "SetupCommonSetting";
      objBrokerRequest.Function = "SaveSystemSettings";

     

      let LocalSettings = [];

      for (let key of this.state.objSettings_.keys()) {
        
        let objSettingValue: SettingValue = this.state.objSettings_.get(key);
        LocalSettings.push(objSettingValue);
      }

      debugger;

      LocalSettings = convertMapToDictionaryJSON(LocalSettings);


      let objParameter: BrokerParameter = new BrokerParameter("Settings", JSON.stringify(LocalSettings));
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("UserID", _gMod._userId);
      objBrokerRequest.Parameters.push(objParameter);

      this.AxiosSource = axios.CancelToken.source();
      axios
        .get(_gMod._performTask, {
          cancelToken: this.AxiosSource.token,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {

          if (res.data.RequestSuccessfull == false) {
            //Warnings Notifications
            let warnings: string = res.data.Warnings;
            if (warnings.trim() != "") {
              let warningList = [];
              warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
              this.setState({
                warningMsg: warningList
              });
            }
          }




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

  getFiles(Image: any, FieldName: string) {


    // this.setState({ Image: Image });

    // let edited: any = this.state.objSettings;
    // //"data:image/jpeg;base64,"

    // let index: number = 0;
    // index = this.state.objSettings.settings.findIndex((d: any) => d.SettingID === FieldName);

    // if (index > -1) {

    //   edited.settings[index].Value = Image.base64.substr(23);
    //   this.setState({
    //     objSettings: edited
    //   });
    // }

  }

  handleSelectTab = (e: TabStripSelectEventArguments) => {
    this.setState({ selectedTab: e.selected })
  }

  render() {

    return (
      <>
        <div className="row" style={{ position: "sticky", top: "0", padding: "10px" }} >
          <div className="col-6">  <h2>System Settings</h2></div>
          <div className="col-6">
            <span className="float-right">
              {" "}
              <button
                type="button"
                onClick={this.save}
                className="btn-custom btn-custom-primary mr-1"
              >
                {/* <FontAwesomeIcon icon={faCheck} className="mr-2" /> */}
                Save
              </button>
              <button
                type="button"
                 onClick={this.cancel}
                className="btn-custom btn-custom-primary ml-1"
              >
                {/* <FontAwesomeIcon icon={faTimes} className="mr-2" /> */}
                Close
              </button>
            </span>
          </div>

        </div>
        <br />
        <div className="row">
          <TabStrip selected={this.state.selectedTab} onSelect={this.handleSelectTab} tabPosition="left">
            <TabStripTab title="Logging">
              <div className="m-3 p-1">
                <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Log Folder</Label>
                <Input style={{ width: "500px" }}
                  // value={this.state.objSettings.settings[1].Value}
                  value={this.state.objSettings_.get(enumSettingsIDs.LogFolder.toString()).Value}
                  onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.LogFolder) }} />

                <div className="row pt-3 ml-1">
                  <span className="mr-3">
                    <Checkbox
                      // value={this.state.objSettings.settings[0].Value}
                      value={this.state.objSettings_.get(enumSettingsIDs.LogWITSMLTransactions.toString()).Value == "true" ? true : false}

                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.LogWITSMLTransactions) }}
                      label={"Log WITSML Transactions"}
                    />
                  </span>
                </div>

              </div>
            </TabStripTab>
            <TabStripTab title="Formatting">
              <div className='m-2 p-2'>
                <label className='mr-2'>Digit Significance in Data Tooltip
                </label>
                <Input
                  //value={this.state.objSettings.settings[2].Value} 
                  value={this.state.objSettings_.get(enumSettingsIDs.DigitSignificance.toString()).Value}
                  onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DigitSignificance) }} type='number'></Input>
                <div className="row ml-1">
                  <span className="mt-3">
                    <Checkbox
                      //value={this.state.objSettings.settings[3].Value}
                      value={this.state.objSettings_.get(enumSettingsIDs.IgnoreNegative.toString()).Value == "true" ? true : false}
                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.IgnoreNegative) }}
                      label={"Ignore Negative Values"}
                    />
                  </span>

                </div>
              </div>
            </TabStripTab>
            <TabStripTab title="Download">
              <div className='m-2 p-2'>
                <div className="row">
                  <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Data Services Server IP</Label>
                  <Input type='text'
                    //value={this.state.objSettings.settings[22].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.DServerIP.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DServerIP) }}>

                  </Input>
                </div>
                <div className="row mt-2">
                  <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Time Log Range Download Threshold</Label>
                  <Input type='text'
                    //  value={this.state.objSettings.settings[24].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.DownloadChunkSize.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DownloadChunkSize) }}></Input>
                  <Label style={{ alignSelf: "flex-end" }}>Seconds</Label>
                </div>

                <div className="row mt-4 mb-2" style={{ fontSize: "large" }}><Label>Depth Log __________________________________________________</Label></div>

                <div className="row"><Label className='mr-2' style={{ alignSelf: "flex-end" }}>Depth Offset</Label>
                  <Input type='text'
                    //value={this.state.objSettings.settings[8].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.DepthOffset.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthOffset) }}></Input>
                  <Label style={{ alignSelf: "flex-end" }}>ft</Label> </div>

                <div className="row mt-4 mb-2" style={{ fontSize: "large" }}>Realtime Download ___________________________________________</div>

                <div className="row mt-2"><Label className='mr-5' style={{ alignSelf: "flex-end" }}>Time Log Download Frequency</Label>
                  <Input type='number' style={{ width: "70px" }}
                    //value={this.state.objSettings.settings[5].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.TimeLogFrequency.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.TimeLogFrequency) }} />
                  <Label className='ml-2' style={{ alignSelf: "flex-end" }}>Seconds</Label> </div>

                <div className="row mt-2"><Label className='mr-5' style={{ alignSelf: "flex-end" }}>Depth Log Download Frequency</Label>
                  <Input type='number' style={{ width: "70px" }}
                    //value={this.state.objSettings.settings[4].Value}
                    value={this.state.objSettings_.get(enumSettingsIDs.DepthLogFrequency.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthLogFrequency) }} />
                  <Label className='ml-2' style={{ alignSelf: "flex-end" }}>Seconds</Label> </div>

                <div className="row mt-2"><Label className='mr-3' style={{ alignSelf: "flex-end" }}>Trajectory Log Download Frequency</Label>

                  {/* see this as ref To Vimal */}
                  <Input
                    //value={this.state.objSettings.settings[6].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.TrajectoryFrequency.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.TrajectoryFrequency) }} type='number' style={{ width: "70px" }} />
                  <Label className='ml-2' style={{ alignSelf: "flex-end" }}>Seconds</Label> </div>

                <div className="row mt-4 mb-2" style={{ fontSize: "large" }}>Realtime Download ___________________________________________</div>

                <div className="row"><Label className='mr-5' style={{ alignSelf: "flex-end" }}>Trigger Alarm if no time data is received for</Label>
                  <Input type='number' style={{ width: "70px" }}
                    //value={this.state.objSettings.settings[9].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.TimeDataAlarmTime.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.TimeDataAlarmTime) }} />
                  <Label className='ml-2' style={{ alignSelf: "flex-end" }}>Minutes</Label> </div>

                <div className="row"><Label className='mr-5' style={{ alignSelf: "flex-end" }}>Trigger Alarm if no Depth data is received for</Label>
                  <Input type='number' style={{ width: "70px" }}
                    //value={this.state.objSettings.settings[10].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.DepthDataAlarmTime.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DepthDataAlarmTime) }} />
                  <Label className='ml-2' style={{ alignSelf: "flex-end" }}>Minutes</Label> </div>

                {/* <div className="row mr-2"><Label className='mr-5' style={{ alignSelf: "flex-end" }}>Stop download if no data is coming for</Label>
                <Input className='ml-4' type='number' style={{ width: "70px" }} value={this.state.objSettings.settings[2].Value} onChange = {(e:any)=>{this.handleChange(e, enumSettingsIDs.)  }}/>
                  <Label className='ml-2' style={{ alignSelf: "flex-end" }}>hours</Label> </div> */}
              </div>
            </TabStripTab>
            <TabStripTab title="Optimization">
              <div className="m-2 p-2">
                <div className="row">
                  <span className="mt-3">
                    <Checkbox
                      //value={this.state.objSettings.settings[20].Value}
                      value={this.state.objSettings_.get(enumSettingsIDs.OptimizeDisplay.toString()).Value == "" ? false : this.state.objSettings_.get(enumSettingsIDs.OptimizeDisplay.toString()).Value}
                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.OptimizeDisplay) }}
                      // onChange={this.tglRemoveWells}
                      //checked={this.state.removeWells}
                      label={"Optimize display for speed"}
                    />
                  </span>

                </div>
                <div className="row">
                  <span className="mt-3">
                    <Checkbox
                      //value={this.state.objSettings.settings[21].Value} 
                      value={this.state.objSettings_.get(enumSettingsIDs.UseDataPaging.toString()).Value == "" ? false : this.state.objSettings_.get(enumSettingsIDs.UseDataPaging.toString()).Value}
                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.UseDataPaging) }}
                      // onChange={this.tglRemoveWells}
                      //checked={this.state.removeWells}
                      label={"Use Paging in the Rig State Documents"}
                    />
                  </span>

                </div>
                <div className="row mt-2"><Label className='mr-2' style={{ alignSelf: "flex-end" }}>Data Page Size </Label>
                  <Input className='ml-4' type='number' style={{ width: "70px" }}
                    //value={this.state.objSettings.settings[11].Value}
                    value={this.state.objSettings_.get(enumSettingsIDs.DataPageSize.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DataPageSize) }} />
                  <Label className='ml-2' style={{ alignSelf: "flex-end" }}>days</Label> </div>
                <div className="row"><Label>Overlap Size  </Label>
                  <Input className='ml-5' type='number' style={{ width: "70px" }}
                    //value={this.state.objSettings.settings[12].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.OverlapSize.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.OverlapSize) }} />
                  <Label className='ml-2' style={{ alignSelf: "flex-end" }}>days</Label> </div>
              </div>
            </TabStripTab>
            <TabStripTab title="PDF Formates">
              <div className="m-2 p-2">
                <div className="row">
                  <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Page Size</Label>
                  {/* <ComboBox
                    //value={this.state.objSettings.settings[14].Value}
                    value={this.state.cmbPageSize}
                    //onChange = {(e:any)=>{this.handleChange(e, enumSettingsIDs.PageSize)  }}>
                    onChange={(event) => {
                      this.handleChangeDropDown(event, enumSettingsIDs.PageSize);

                    }}>
                  </ComboBox> */}
                  <DropDownList
                    name="PageSize"
                    //label='Page Size'
                    data={this.pageSizeList}
                    textField="text"
                    dataItemKey="id"
                    value={this.state.cmbPageSize}
                    onChange={(event) => { this.handleChangeDropDown(event, enumSettingsIDs.PageSize); }}

                  />
                </div>
                <div className="row">
                  <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Orientation</Label>

                  <DropDownList
                    name="Orientation"
                    //label='Page Size'
                    data={this.OrientationList}
                    textField="text"
                    dataItemKey="id"
                    value={this.state.cmbOrientation}
                    onChange={(event) => { this.handleChangeDropDown(event, enumSettingsIDs.Orientation); }}

                  />
                </div>
                <div className="row mt-4 mb-2" style={{ fontSize: "large" }}>Margins : </div>
                <div className="row">
                  <div className="col-12 mt-2 mb-2" style={{ display: "flex", justifyContent: "center" }}>
                    <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Top</Label>
                    <Input className='ml-4' type='number' style={{ width: "70px" }}
                      //  value={this.state.objSettings.settings[17].Value} 
                      value={this.state.objSettings_.get(enumSettingsIDs.TopMargin.toString()).Value}
                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.TopMargin) }} />
                  </div>
                  <div className="col-12 mt-2 mb-2" style={{ display: "flex", justifyContent: "end" }}>
                    <div className="col-6">
                      <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Left</Label>
                      <Input className='ml-4' type='number' style={{ width: "70px" }}
                        //                       value={this.state.objSettings.settings[16].Value} 
                        value={this.state.objSettings_.get(enumSettingsIDs.LeftMargin.toString()).Value}
                        onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.LeftMargin) }} />
                    </div>
                    <div className="col-4">
                      <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Right</Label>
                      <Input className='ml-4' type='number' style={{ width: "70px" }}
                        //value={this.state.objSettings.settings[18].Value} 
                        value={this.state.objSettings_.get(enumSettingsIDs.RightMargin.toString()).Value}
                        onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.RightMargin) }} />
                    </div>

                  </div>
                  <div className="col-12 mt-2 mb-2" style={{ display: "flex", justifyContent: "center" }}>
                    <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Bottom</Label>
                    <Input className='ml-4' type='number' style={{ width: "70px" }}
                      //value={this.state.objSettings.settings[19].Value} 
                      value={this.state.objSettings_.get(enumSettingsIDs.BottomMargin.toString()).Value}
                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.BottomMargin) }} />
                  </div>
                </div>
              </div>
            </TabStripTab>
            <TabStripTab title="Time Zones">
              <div className="m-2 p-2">
                <div className="row">
                  <Label>Time Zone </Label>
                </div>
                <div className="row">
                  <DropDownList
                    style={{ width: "500px" }}
                    name="TimeZone"
                    //label='Page Size'
                    data={this.TimeZoneList}
                    textField="text"
                    dataItemKey="id"
                    value={this.state.cmbTimeZone}
                    onChange={(event) => { this.handleChangeDropDown(event, enumSettingsIDs.TimeZone); }}
                  />
                </div>
                <div className="row mt-3">
                  <Label>Note: All data downloaded from WITSML server will be converted to this timezone settings</Label>
                </div>
              </div>
            </TabStripTab>
            <TabStripTab title="Alarms">
              <div className="m-2 p-2">

                <div className="row mt-3">
                  <Label>Sound File for Red Alarm State</Label>
                </div>
                <div className="row">
                  <Input type="text" style={{ width: "500px" }}
                    //value={this.state.objSettings.settings[25].Value}
                    value={this.state.objSettings_.get(enumSettingsIDs.SoundFileRed.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.SoundFileRed) }} />
                </div>
                <div className="row mt-3">
                  <Label>Sound File for Yellow Alarm State</Label>
                </div>
                <div className="row">
                  <Input type="text" style={{ width: "500px" }}
                    //value={this.state.objSettings.settings[26].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.SoundFileYellow.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.SoundFileYellow) }} />
                </div>
                <div className="row mt-3">
                  <Label>Sound File forRemarks</Label>
                </div>
                <div className="row">
                  <Input type="text" style={{ width: "500px" }}
                    //value={this.state.objSettings.settings[27].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.SoundFileRemarks.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.SoundFileRemarks) }} />
                </div>
                <div className="row">
                  <span className="mt-3">
                    <Checkbox
                      //value={this.state.objSettings.settings[28].Value}
                      value={this.state.objSettings_.get(enumSettingsIDs.WellCheckEnabled.toString()).Value == "" ? false : this.state.objSettings_.get(enumSettingsIDs.WellCheckEnabled.toString()).Value}

                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.WellCheckEnabled) }}


                      label={"Enable Well Check Function"}
                    />
                  </span>

                </div>
                <div className="row">
                  <span className="mt-3">
                    <Checkbox
                      //value={this.state.objSettings.settings[29].Value}
                      value={this.state.objSettings_.get(enumSettingsIDs.AlarmAcknowledgement.toString()).Value}
                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.AlarmAcknowledgement) }}
                      label={"Alarm Acknowledgement"}
                    />
                  </span>

                </div>
              </div>
            </TabStripTab>

            <TabStripTab title="VuMax RT">
              <div className="p-2 m-2">

                <div className="row">
                  <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Chat Server Domain </Label>
                  <Input type='text'
                    //value={this.state.objSettings.settings[34].Value}
                    value={this.state.objSettings_.get(enumSettingsIDs.ChatServerDomain.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.ChatServerDomain) }}>
                  </Input></div>
                <div className="row">
                  <Label className='mr-5' style={{ alignSelf: "flex-end" }}>Support Email </Label>
                  <Input type='text'
                    //value={this.state.objSettings.settings[35].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.SupportEmail.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.SupportEmail) }}></Input></div>
                <div className="row">
                  <Label className='mr-5' style={{ alignSelf: "flex-end", marginLeft: "26px" }}>Host Name  </Label>
                  <Input type='text'
                    //value={this.state.objSettings.settings[37].Value}
                    value={this.state.objSettings_.get(enumSettingsIDs.chatHostName.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.chatHostName) }}></Input></div>
                <div className="row">
                  <Label className='mr-5' style={{ alignSelf: "flex-end", marginLeft: "65px" }}>Port</Label>
                  <Input type='text'
                    //value={this.state.objSettings.settings[38].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.chatPort.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.chatPort) }}></Input></div>
                <div className="row">
                  <span className="mt-3">
                    <Checkbox
                      //value={this.state.objSettings.settings[39].Value}
                      value={this.state.objSettings_.get(enumSettingsIDs.chatUseSSL.toString()).Value == "" ? true : this.state.objSettings_.get(enumSettingsIDs.chatUseSSL.toString()).Value}
                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.chatUseSSL) }}
                      label={"Use SSL"}
                    />
                  </span>
                </div>
              </div>
            </TabStripTab>

            <TabStripTab title="Others">
              <div className="m-2 p-2">
                <div className="row">
                  <span className="mt-3">
                    <Checkbox
                      //value={this.state.objSettings.settings[40].Value}
                      value={this.state.objSettings_.get(enumSettingsIDs.ShareBroomstickDouments.toString()).Value == "" ? false : this.state.objSettings_.get(enumSettingsIDs.ShareBroomstickDouments.toString()).Value}
                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.ShareBroomstickDouments) }}
                      label={"Share Documents with all users"}
                    />
                  </span>

                </div>
                <div className="row">
                  <Label className='mr-2' style={{ alignSelf: "flex-end" }}>RigState recalculation wait period RigState recalculation wait period </Label>
                  <Input className='ml-4' type='number' style={{ width: "70px" }}
                    //value={this.state.objSettings.settings[41].Value} 
                    value={this.state.objSettings_.get(enumSettingsIDs.WaitTime.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.WaitTime) }} />
                  <Label className='ml-2' style={{ alignSelf: "flex-end" }}>Milliseconds</Label>
                </div>
                <div className="row">
                  <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Company Logo </Label>
                  <Input className='ml-4' type='number' style={{ width: "70px" }}
                    value={this.state.objSettings_.get(enumSettingsIDs.CompanyLogo.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.CompanyLogo) }} />
                  {/* <FileInputComponent
                    labelText="Company Logo"
                    labelStyle={{ fontSize: 14 }}
                    multiple={false}
                    imagePreview={true}
                    callbackFunction={(file_arr) => { this.getFiles(file_arr, enumSettingsIDs.CompanyLogo) }}
                    accept="image/jpeg"

                  /> */}
                </div>
                <div className="row">
                  <Label className='mr-2' style={{ alignSelf: "flex-end" }}>Company Logo 2</Label>
                  <Input className='ml-4' type='number' style={{ width: "70px" }}
                    value={this.state.objSettings_.get(enumSettingsIDs.CompanyLogo2.toString()).Value}
                    onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.CompanyLogo2) }} />
                  {/* <FileInputComponent
                    labelText="Company Logo 2"
                    labelStyle={{ fontSize: 14 }}
                    multiple={false}
                    imagePreview={false}
                    callbackFunction={(file_arr) => { this.getFiles(file_arr, enumSettingsIDs.CompanyLogo2) }}
                    accept="image/jpeg"

                  /> */}
                </div>
                <div className="row">
                  <Label className='mr-2' style={{ alignSelf: "flex-end" }}>DayTime Hours From</Label>
                  <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                    <MaskedTextBox
                      mask="00:00"
                      defaultValue='06:00'
                      width="50px"
                      // value={this.state.objSettings.settings[44].Value}
                      value={this.state.objSettings_.get(enumSettingsIDs.DayTimeFrom.toString()).Value}
                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DayTimeFrom) }}

                    />
                    To
                  </span>
                  <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                    <MaskedTextBox
                      mask="00:00"
                      defaultValue='18:00'
                      width="50px"
                      //value={this.state.objSettings.settings[45].Value}
                      value={this.state.objSettings_.get(enumSettingsIDs.DayTimeTo.toString()).Value}
                      onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DayTimeTo) }}
                    />
                    HH: MM
                  </span>
                  {/* <TimePicker value={new Date(this.state.objSettings.settings[44].Value)} onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DayTimeFrom) }} />
                  <Label className='mr-2 ml-2' style={{ alignSelf: "flex-end" }}>To</Label>
                  <TimePicker value={new Date(this.state.objSettings.settings[45].Value)} onChange={(e: any) => { this.handleChange(e, enumSettingsIDs.DayTimeTo) }} /><Label className='ml-2' style={{ alignSelf: "flex-end" }}>(HH:MM)</Label> */}
                </div>
              </div>
            </TabStripTab>
          </TabStrip>
        </div>
      </>
    )
  }
}
