import React, { MouseEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faUser,
  faHeartBroken,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import UserPrefs from "../../../objects/UserPrefs/UserPrefs";
import history from "../../../history/history";
import GlobalMod from "../../../objects/global";
import { ThemeContext } from "../../app/app";
import ManageTheme from "../settings/themes/manage-theme/manage-theme";

let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();

let _setvalue = "";

export default class UserPref extends React.Component {
  state = {
    _themeList: [] as any,
    _defaultValue: "",
    _pId: "",
  };

  componentWillUpdate() {
    _gMod = new GlobalMod();
    if (_gMod._userId == "" || _gMod._userId == undefined) {
      window.location.href = "/evumaxapp/";
      return;
    }

  }
  componentDidMount() {
    document.title = "eVuMax";//Nishant 02/09/2021
    this.Load();
  }

  Load = () => {
    this.getThemesList();
  };

  getUserPrefList = () => {
    this.setState({ _defaultValue: [] });
    try {
      objBrokerRequest = new BrokerRequest();
      let objParameter = new BrokerParameter("userId", _gMod._userId); //
      objBrokerRequest.Parameters.push(objParameter);
      objBrokerRequest.Module = "Config";
      objBrokerRequest.Function = "UserprefList";
      objBrokerRequest.Broker = "Config.UserPrefs";

      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          const objData = res.data;
          if (objData.RequestSuccessfull) {
            let defaultThemeID = JSON.parse(objData.Response)[0]["ThemeId"];
            this.setState({ _defaultValue: defaultThemeID });
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
    } catch { }
  };

  onChangeTheme = (event: any) => {
    _setvalue = event.target.value.Id;

    this.setState({ _defaultValue: _setvalue });

    // this.loadTheme(event.target.value);
  };

  Cancel = () => {
    history.push("/dashboard/themes");
  };

  Save = () => {
    try {
      let objUserPrefs = new UserPrefs();

      objUserPrefs.UserId = _gMod._userId;
      objUserPrefs.ThemeId = _setvalue;
      let objParameter = new BrokerParameter(
        "Add",
        JSON.stringify(objUserPrefs)
      );
      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Config";
      objBrokerRequest.Function = "Add";
      objBrokerRequest.Broker = "Config.UserPrefs";
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
          debugger;
          this.loadTheme(this.state._defaultValue);
          history.push("/dashboard/home");
          //window.location.reload(true);
          window.location.reload(); //prath
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

  //Nishant
  getDefaultTheme = () => {
    let defaultThemeID: any = this.state._defaultValue;
    let defaultTheme_: any = "";
    this.state._themeList.map((item: any) => {
      if (item["Id"] === defaultThemeID) {
        defaultTheme_ = item;
      }
    });
    console.log(defaultTheme_);
    return defaultTheme_;
  };

  getThemesList = () => {
    try {
      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Config";
      objBrokerRequest.Function = "ThemeList";
      objBrokerRequest.Broker = "Config.Themes";

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
          this.setState({ _themeList: objData });

          this.getUserPrefList();
          //this.setState({ _themeList: objData.map((dataItem: any) => Object.assign({ isDefault: false }, dataItem)) });
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

  loadTheme = async (props: any) => {
    let Id = props.Id;

    try {
      objBrokerRequest = new BrokerRequest();
      let objParameter = new BrokerParameter("pId", Id);
      objBrokerRequest.Parameters.push(objParameter);
      objBrokerRequest.Module = "Config";
      objBrokerRequest.Function = "Load";
      objBrokerRequest.Broker = "Config.Themes";

      await axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          const objData = res.data;
          if (objData.RequestSuccessfull) {
            this.applyTheme(JSON.parse(objData.Response));
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
    } catch { }
  };

  applyTheme = (props: any) => {

    if (props.props.length) {
      //  this.setState({ _pId: props.props[0].Id });
      props.props.forEach((items: any) => {
        if (items.PropName === "WorkArea") {
          document.documentElement.style.setProperty(
            "--base-work-area",
            items.PropValue
          );
        }

        if (items.PropName === "MenuBar") {
          document.documentElement.style.setProperty(
            "--base-menu-top",
            items.PropValue
          );
          document.documentElement.style.setProperty(
            "--base-menu-left",
            items.PropValue
          );
        }

        if (items.PropName === "FontColor") {
          document.documentElement.style.setProperty(
            "--base-anchor-color",
            items.PropValue
          );
        }

        if (items.PropName === "PrimaryBackColor") {
          document.documentElement.style.setProperty(
            "--base-primary",
            items.PropValue
          );
        }

        if (items.PropName === "PrimaryColor") {
          document.documentElement.style.setProperty(
            "--base-primary--color",
            items.PropValue
          );
        }


        if (items.PropName === "ListBackColor") {
          document.documentElement.style.setProperty(
            "--base-list-bg--color",
            items.PropValue
          );
        }
      });
    }
  };

  render() {
    return (
      <div>
        <div className="col-lg-12 col-sm-12 col-md-12 col-12">
          <legend>
            <a>User Preferences</a>
            <span className="float-right">
              {" "}
              <button
                type="button"
                onClick={this.Save}
                className="btn-custom btn-custom-primary mr-1"
              >
                {/* <FontAwesomeIcon icon={faCheck} className="mr-2" /> */}
                Save
              </button>
              <button
                type="button"
                onClick={this.Cancel}
                className="btn-custom btn-custom-primary ml-1"
              >
                {/* <FontAwesomeIcon icon={faTimes} className="mr-2" /> */}
                Cancel
              </button>
            </span>
          </legend>
        </div>
        <hr></hr>
        <div className="row mt-3">
          <form>
            <div className="form-group row">
              <label className="col-sm-5 col-form-label text-right">
                Themes :
              </label>
              <div className="col-sm-4">
                <DropDownList
                  data={this.state._themeList}
                  defaultValue={this.getDefaultTheme()}
                  textField="Name"
                  dataItemKey="Id"
                  onChange={this.onChangeTheme}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
