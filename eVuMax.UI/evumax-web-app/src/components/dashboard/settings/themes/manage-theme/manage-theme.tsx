import React from "react";
import axios from "axios";
import $ from "jquery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faCheck,
  faRemoveFormat,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import { Grid, GridToolbar } from "@progress/kendo-react-grid";
import BrokerRequest from "../../../../../broker/BrokerRequest";
import { Route } from "react-router-dom";
import { ColorPicker } from "@progress/kendo-react-inputs";
import { Color, ColorPicker as MColorPicker } from "material-ui-color";
import ThemeHeader from "../../../../../objects/theme/theme-header";
import ThemeProps from "../../../../../objects/theme/theme-props";
import BrokerParameter from "../../../../../broker/BrokerParameter";
import GlobalMod from "../../../../../objects/global";
import history from "../../../../../history/history";

let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();

export default class ManageTheme extends React.Component {
  selectedColor = "#FFF";
  gradientSettings = {
    opacity: true,
  };

  state = {
    _pId: "",
    _formMode: "Add", // Default
    _workAreaValue: "#000",
    _menuBarValue: "#000",
    _fontColor: "#FFF",
    _primaryBackColor: "#007bff",
    _primaryColor: "#FFF",
    _chartGridColor: "#FFF",
  };

  componentDidMount() {
    this.Load();
  }

  Cancel = () => {
    try {
      history.push("/dashboard/themes");
    } catch { }
  };

  onChangeWorkArea = (e: Color) => {
    debugger;
    this.setState({ _workAreaValue: e.css.backgroundColor });
  };

  onChangeMenuBar = (e: any) => {
    this.setState({ _menuBarValue: e.css.backgroundColor });
  };

  onChangeFontColor = (e: any) => {
    this.setState({ _fontColor: e.value });
  };

  onChangePrimaryBackColor = (e: any) => {
    this.setState({ _primaryBackColor: e.value });
  };
  onChangePrimaryColor = (e: any) => {
    this.setState({ _primaryColor: e.value });
  };

  onChangeGridColor = (e: any) => {
    this.setState({ _chartGridColor: e.value });
  };

  Save = () => {
    try {
      let objTheme = new ThemeHeader();
      let objThemeProps = new ThemeProps();

      objTheme.Name = $("#txtName").val() || "";

      objThemeProps.PropName = "WorkArea";
      objThemeProps.PropValue = this.state._workAreaValue;
      objTheme.props.push(objThemeProps);

      objThemeProps = new ThemeProps();

      objThemeProps.PropName = "MenuBar";
      objThemeProps.PropValue = this.state._menuBarValue;
      objTheme.props.push(objThemeProps);

      objThemeProps = new ThemeProps();

      objThemeProps.PropName = "FontColor";
      objThemeProps.PropValue = this.state._fontColor;
      objTheme.props.push(objThemeProps);

      objThemeProps = new ThemeProps();

      objThemeProps.PropName = "PrimaryBackColor";
      objThemeProps.PropValue = this.state._primaryBackColor;
      objTheme.props.push(objThemeProps);

      objThemeProps = new ThemeProps();

      objThemeProps.PropName = "PrimaryColor";
      objThemeProps.PropValue = this.state._primaryColor;
      objTheme.props.push(objThemeProps);

      objThemeProps = new ThemeProps();

      objThemeProps.PropName = "ChartGridColor";
      objThemeProps.PropValue = this.state._chartGridColor;
      objTheme.props.push(objThemeProps);



      objBrokerRequest = new BrokerRequest();

      // Add
      if (this.state._formMode === "Add") {
        objBrokerRequest.Module = "Config";
        objBrokerRequest.Function = "AddTheme";
        objBrokerRequest.Broker = "Config.Themes";
      }

      // Edit
      else {
        objTheme.Id = this.state._pId;
        objBrokerRequest.Module = "Config";
        objBrokerRequest.Function = "EditTheme";
        objBrokerRequest.Broker = "Config.Themes";
      }

      let objParameter = new BrokerParameter(
        "pThemes",
        JSON.stringify(objTheme)
      );
      objBrokerRequest.Parameters.push(objParameter);

      axios
        .get(_gMod._performTask, {
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          const objData = res.data;
          if (objData.RequestSuccessfull) {
            history.push("/dashboard/themes");
            window.location.reload();
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

  Load = () => {
    try {

      let objSession = sessionStorage.getItem("themes");
      if (objSession !== null) {
        let Formmode = JSON.parse(objSession).FormMode;
        this.setState({ _formMode: Formmode });
        if (Formmode === "Edit") {
          let Id = JSON.parse(objSession).Id;

          try {
            objBrokerRequest = new BrokerRequest();
            let objParameter = new BrokerParameter("pId", Id);
            objBrokerRequest.Parameters.push(objParameter);
            objBrokerRequest.Module = "Config";
            objBrokerRequest.Function = "Load";
            objBrokerRequest.Broker = "Config.Themes";
            axios
              .get(_gMod._getData, {
                params: { paramRequest: JSON.stringify(objBrokerRequest) },
              })
              .then((res) => {
                debugger;
                const objData = res.data;

                if (objData.RequestSuccessfull) {
                  this.DisplayData(JSON.parse(objData.Response));

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
        } else {
        }
      }
    } catch { }
  };

  DisplayData = (props: any) => {
    debugger;
    $("#txtName").val(props.Name || "");
    this.setState({ _pId: props.Id });

    if (props.props.length) {
      props.props.forEach((items: any, i: any) => {
        if (items.PropName === "WorkArea") {
          this.setState({ _workAreaValue: items.PropValue });
        }

        if (items.PropName === "MenuBar") {
          this.setState({ _menuBarValue: items.PropValue });
        }

        if (items.PropName === "FontColor") {
          this.setState({ _fontColor: items.PropValue });
        }
        if (items.PropName === "PrimaryBackColor") {
          this.setState({ _primaryBackColor: items.PropValue });
        }
        if (items.PropName === "PrimaryColor") {
          this.setState({ _primaryColor: items.PropValue });
        }

        if (items.PropName === "ChartGridColor") {
          this.setState({ _chartGridColor: items.PropValue });
        }


      });
    }
  };

  render() {
    return (
      <div>
        <div className="col-lg-12 col-sm-12 col-md-12 col-12">
          <legend>
            <a>Manage Themes</a>
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

        <div className="mt-2">
          <div className="row">
            <div className="col-lg-6 ">
              <form>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label text-right">
                    Name :
                  </label>
                  <div className="col-sm-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="txtName"
                      placeholder="Name"
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label text-right">
                    Work Area :
                  </label>
                  <div className="col-sm-3" >
                    {/* <ColorPicker
                      value={this.state._workAreaValue}
                      view={"gradient"}
                      gradientSettings={this.gradientSettings}
                      onChange={this.onChangeWorkArea}
                    /> */}
                    <MColorPicker value={this.state._workAreaValue} deferred hideTextfield onChange={this.onChangeWorkArea} />
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label text-right">
                    Menu bar :
                  </label>
                  <div className="col-sm-3">
                    {/* <ColorPicker
                      value={this.state._menuBarValue}
                      view={"gradient"}
                      gradientSettings={this.gradientSettings}
                      onChange={this.onChangeMenuBar}
                    /> */}
                    <MColorPicker value={this.state._menuBarValue} deferred hideTextfield onChange={this.onChangeMenuBar} />
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label text-right">
                    Font color :
                  </label>
                  <div className="col-sm-3">
                    <ColorPicker
                      value={this.state._fontColor}
                      view={"gradient"}
                      gradientSettings={this.gradientSettings}
                      onChange={this.onChangeFontColor}
                      icon={"edit-tools"}
                    />

                  </div>
                </div>

                <div className="form-group row">
                  <label className="col-sm-3 col-form-label text-right">
                    Primary Backcolor :
                  </label>
                  <div className="col-sm-3">
                    <ColorPicker
                      value={this.state._primaryBackColor}
                      view={"gradient"}
                      gradientSettings={this.gradientSettings}
                      onChange={this.onChangePrimaryBackColor}
                      icon={"edit-tools"}
                    />
                  </div>
                </div>

                <div className="form-group row">
                  <label className="col-sm-3 col-form-label text-right">
                    Primary color :
                  </label>
                  <div className="col-sm-3">
                    <ColorPicker
                      value={this.state._primaryColor}
                      view={"gradient"}
                      gradientSettings={this.gradientSettings}
                      onChange={this.onChangePrimaryColor}
                      icon={"edit-tools"}
                    />
                  </div>
                </div>


                <div className="form-group row">
                  <label className="col-sm-3 col-form-label text-right">
                    Chart Grid color :
                  </label>
                  <div className="col-sm-3">
                    <ColorPicker
                      value={this.state._chartGridColor}
                      view={"gradient"}
                      gradientSettings={this.gradientSettings}
                      onChange={this.onChangeGridColor}
                      icon={"edit-tools"}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
