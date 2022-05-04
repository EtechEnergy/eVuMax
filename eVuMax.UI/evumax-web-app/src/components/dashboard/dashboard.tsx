import React from "react";
import $ from "jquery";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";

import "./dashboard.css";
// import  VuMaxLogo  from "../../images/VuMaxLogo_Small.png";
import VuMaxLogo from "../../images/VuMaxLogo_Small.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faCog, faListAlt, faHome, faDownload, faInfo, faSignOutAlt, faKey,  faClock, faGlobe, faCalendarTimes, faBookOpen, faSpinner, faDatabase  } from "@fortawesome/free-solid-svg-icons";
import { Route, NavLink, Switch } from "react-router-dom";
import { AppState } from "../../redux/store/configureStore";
import { connect } from "react-redux";
import * as Types from "../../redux/types/types";
import { ThunkDispatch } from "redux-thunk";
import { AppActions } from "../../redux/actions/appActions";
import { bindActionCreators } from "redux";
import { startLog_Out } from "../../redux/actions/loginActions";
import routes from "../../routes/routes";
import AboutPage from "../../components/About/about";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import ETECHLogo from "../../images/etechSVG.svg";
import GlobalMod from "../../objects/global";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import axios from "axios";
import { Util } from "../../Models/eVuMax";
 import DataServiceICO from "../../images/dataService.png"


type Props = LinkStateProps & LinkDispatchProps;

const switchRoutes = (
  <Switch>
    {routes.map((Rprop, key) => {
      if (Rprop.layout === "/dashboard") {
        return (
          <Route
            path={Rprop.layout + Rprop.path}
            component={Rprop.component}
            key={key}
          />
        );
      }
    })}
  </Switch>
);
let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let version = "";
export class Dashboard extends React.Component<Props> {

  state = {
    //showPopupMenu: true
    showAboutDialog: false,
    Version: ""

  }

  async componentDidUpdate() {

    if (_gMod._userId == "" || _gMod._userId == undefined) {
      await this.loadTheme();
    }

  }

  componentDidMount(): void {
    this.getVersion();
  }


  loadTheme = () => {
    try {
      _gMod = new GlobalMod();
      
      objBrokerRequest = new BrokerRequest();
      let objParameter = new BrokerParameter("UserId", _gMod._userId);
      objBrokerRequest.Parameters.push(objParameter);
      objBrokerRequest.Module = "Config";
      objBrokerRequest.Function = "LoadTheme";
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

    if (props.length) {
      //
      this.setState({ _pId: props[0].Id.toString() });
      props.forEach((items: any) => {
        if (items.PropertyName === "WorkArea") {
          document.documentElement.style.setProperty(
            "--base-work-area",
            items.Value
          );
        }

        if (items.PropertyName === "MenuBar") {
          document.documentElement.style.setProperty(
            "--base-menu-top",
            items.Value
          );
          document.documentElement.style.setProperty(
            "--base-menu-left",
            items.Value
          );
        }

        if (items.PropertyName === "FontColor") {
          document.documentElement.style.setProperty(
            "--base-anchor-color",
            items.Value
          );
        }

        if (items.PropertyName === "PrimaryBackColor") {
          document.documentElement.style.setProperty(
            "--base-primary",
            items.Value
          );
        }

        if (items.PropertyName === "PrimaryColor") {
          document.documentElement.style.setProperty(
            "--base-primary-color",
            items.Value
          );
        }

        if (items.PropertyName === "ChartGridColor") {
          document.documentElement.style.setProperty(
            "--base-chart-grid-color",
            items.Value
          );
        }

        //prath
        if (items.PropertyName === "ListBackColor") {
          document.documentElement.style.setProperty(
            "--base-list-bg-color",
            items.Value
          );
        }

        



      });
    }
  };


  LogOut = () => {
    sessionStorage.clear();
    localStorage.clear();
    let objLogin: Partial<Types.ILogin> = {};
    this.props.startLog_Out(objLogin);

  };

  ShowAboutDialog = () => {
    try {
      this.setState({
        showAboutDialog: true
      });

    } catch (error) {

    }
  }

  getMenu = (e: any) => {
    
    //alert(e.target.id);
    // if (e.target != document.getElementById("leftSidePopup")) {
    //   console.log("You clicked outside");
    // } else {
    //   console.log("You clicked inside");
    // }


    switch (e.target.id) {
      case "DataMenu":
        $(".LeftSidePopUp").toggle();    
        break;
        case "LeftSidePopUp":
          $(".LeftSidePopUp").toggle();    
          break;
        case "DSSetupMenu" :
          $(".DSSetupPopup").toggle();    
          break;
        case "DSSetupPopup":

          $(".DSSetupPopup").toggle();    
          break;
  
      default:
        break;
    }
    //$(".LeftSidePopUp").toggle();
    // let showMenu = this.state.showPopupMenu;
    // this.setState({
    //   showPopupMenu: !showMenu
    // });
  };

  
  toggleMenu = (e: any) => {
    
    
    // if (e.target != document.getElementById("leftSidePopup")) {
    //   console.log("You clicked outside");
    // } else {
    //   console.log("You clicked inside");
    // }

    // this.setState({
    //   showPopupMenu: false
    // });
    $(".LeftSidePopUp").hide();
  };

  ManageTheme = () => {
    $(".LeftSidePopUp").toggle();
    // window.location.href = '/dashboard/manage-theme';
  };

  getVersion = () => {
    try {

      axios
        .get(_gMod._getVersion, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
        })
        .then((res) => {


          let version = res.data[0];
          let DateTime = res.data[1];


          //Version: res.data[0] + "("+ res.data[1] + ")"
          this.setState({
            Version: res.data[0]

          })

        })
        .catch((error) => {
          Util.StatusError(error.message);

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
    } catch (error) { }


  }


  hidePopupMenu =()=>{
    try {
      $(".LeftSidePopUp").hide();    
      $(".DSSetupPopup").hide();    
    } catch (error) {
      
    }
  }
  render() {
    return (
      <div>


        {this.state.showAboutDialog && <Dialog height="390px" width="800px" title="About"
          onClose={() => { this.setState({ showAboutDialog: false }); }}
        >
          <div className="" style={{ paddingTop: "50px" }}>
            <AboutPage handleClick={() => { this.setState({ showAboutDialog: false }) }} />
          </div>
        </Dialog>}
        <nav className="navbar navbar-expand-lg navbar-expand-sm navbar-expand-md navbar-expand-xs navbar-expand navbar-light bg-black">
          <NavLink className="nav-link" exact to="/dashboard/home">
            <div className="navbar-brand">
              <img src={VuMaxLogo} width="45" />
              <span className="text-theme ml-3">VuMax</span>
            </div>
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <NavLink className="nav-link" exact to="/dashboard/home">
                  <FontAwesomeIcon icon={faHome} />
                </NavLink>
              </li>
            </ul>

            <ul className="navbar-nav ml-auto">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <FontAwesomeIcon icon={faUserCircle} />
                  <b className="text-capitalize ml-2" id="mnuUserName">
                    {this.props.login._userName}
                  </b>
                </a>
                <div
                  className="dropdown-menu dropdown-menu-right"
                  aria-labelledby="navbarDropdown"
                  style={{ width: "190px" }}
                >
                  {/* <NavLink className="nav-link" exact to="/dashboard/changePassword">
                    <FontAwesomeIcon icon={faKey} className="mr-2" /> Change Password
                  </NavLink> */}


                  <a className="nav-link" onClick={this.ShowAboutDialog}>
                    <FontAwesomeIcon icon={faInfo} className="mr-2" /> About
                  </a>
                  <a className="nav-link" onClick={this.LogOut}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
                  </a>

                </div>
              </li>
            </ul>
          </div>
        </nav>

        <aside>
          <div className="wrapper">
            <ul className="nav flex-column">
              {/* <li className="nav-item">
                <NavLink className="nav-link" exact to="/dashboard/home">
                  <FontAwesomeIcon icon={faBars} />
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  exact
                  to="/dashboard/notification"
                >
                  <FontAwesomeIcon icon={faPlug} />
                </NavLink>
              </li> */}
              <li className="nav-item">
                <NavLink className="nav-link" exact to="/dashboard/user-prefs" onMouseOver={this.hidePopupMenu}>
                  <FontAwesomeIcon icon={faListAlt} />
                </NavLink>
              </li>

              <li className="nav-item">

                <a
                  data-leftmenu="settings"
                  //onClick={this.getMenu}
                  onMouseEnter={this.getMenu}
                  //onMouseOut={  $(".LeftSidePopUp").hide()} //vimal
                  // onMouseOut= {function(){
                  //   //alert("prath");
                  //   $(".LeftSidePopUp").hide();
                  // }}
                  //onMouseOut={this.getMenu} //vimal
                  //To auto hide menu vimal
                  id="DataMenu"                  
                  className="nav-link"
                >
                  <FontAwesomeIcon icon={faCog} />
                </a>
                {/* </NavLink> */}
              </li>
              {/* Nishant 27-11-2020 Witsml Explorer */}
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  exact
                  to="/dashboard/WitsmlExplorer"
                  onMouseOver={this.hidePopupMenu}
                >
                  <FontAwesomeIcon icon={faDownload} />
                </NavLink>
              </li>

              <li className="nav-item">
             

<a
                  data-leftmenu="setup"
                  onMouseEnter={this.getMenu}
                  //onMouseOut={this.getMenu} //vimal
                  // onMouseOut={ function(){
                  //   $("#DSSetupPopup").hide();
                  // }
                  // } //prath
                  //To auto hide menu vimal
                  id="DSSetupMenu"     
                  className="nav-link"
                >
                  <FontAwesomeIcon icon={faDatabase} />
                  {/* <img src={require('../../images/dataService.png')} /> */}
                </a>

              </li>

              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  exact
                  to="/dashboard/AlarmSettings"
                  onMouseOver={this.hidePopupMenu}
                >
                  <FontAwesomeIcon icon={faClock} />
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  exact
                  to="/dashboard/KPI"
                  onMouseOver={this.hidePopupMenu}
                >
                  <FontAwesomeIcon icon={faBookOpen} />
                  
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  exact
                  to="/dashboard/AdvKPI"
                >
                  <FontAwesomeIcon icon={faKey} />
                  
                </NavLink>
              </li>
              

              {/* Nishant 27-11-2020 Witsml Explorer */}
              {/* <li className="nav-item">
                <NavLink
                  className="nav-link"
                  exact
                  to="/dashboard/ChartTesting"
                >
                  <FontAwesomeIcon icon={faTeeth} />
                </NavLink>

              </li> */}
            </ul>
          </div>
        </aside>

        <div id="MainContent">{switchRoutes}</div>

        <nav></nav>


        <div className="fixed-bottom bg-status">
          <span id="statuIcon" className="ml-3" style={{ minWidth: 20 }}></span>
          <div id="statusText" className="pt-1 pb-1 pl-1 hidenOverFlow ">
            Ready
          </div>
          <div id="" className="ml-auto mr-3 float-right d-inline-flex">
            <div id="PoweredByText" className="pt-1 pb-1 pl-1 hidenOverFlow ">
              Powered by <img src={ETECHLogo} style={{ height: "15px" }} className="img-fluid ml-1 mr-1" /> Etech &copy; {new Date().getFullYear()} Build Version {this.state.Version}
            </div>
            {/* Powered by  <img src={ETECHLogo} style={{height:"15px"}} className="img-fluid ml-2 mr-2 mt-2" /> ETECH <p>&copy; {new Date().getFullYear()}  </p> */}
          </div>

        </div>
        {/* Side menu */}

        <div
          id="LeftSidePopup"
          className="LeftSidePopUp"
          //onMouseLeave={this.getMenu}
          onMouseLeave={
            function(){
              $("#LeftSidePopup").hide();
            }

          }

        >
          <ul className="nav flex-column">
            <li>
              <a>Configuration</a>
            </li>
            <li>
              <a>
                <b>Themes</b>
              </a>{" "}
            </li>
            <ol className="list-unstyled ml-2">
              <li>
                <NavLink onClick={this.toggleMenu} exact to="/dashboard/themes">
                  {/* <a onClick={this.ManageTheme} > */}
                  Manage Themes
                </NavLink>
              </li>
            </ol>
            <li>
              <a>
                <b>Manage Dashbord</b>
              </a>{" "}
            </li>
            <ol className="list-unstyled ml-2">
              <li>
                <NavLink
                  onClick={this.getMenu}
                  exact
                  to="/dashboard/well-editor"
                >
                  Manage Column
                </NavLink>
              </li>

              <li>
                <NavLink onClick={this.getMenu} exact to="/dashboard/add-well">
                  Add Wells
                </NavLink>
              </li>
            
              {/* <li>
                <NavLink
                  onClick={this.getMenu}
                  exact
                  to="/dashboard/manageDashboardWell"
                >

                  Manage Wells
                </NavLink>
              </li> */}

              {/* <li>
                <NavLink
                  onClick={this.getMenu}
                  exact
                  to="/dashboard/DrlgConnSummary"
                >

                  Drilling Connection Summary
                </NavLink>
              </li> */}
            </ol>
          </ul>

          {/* <Switch>
                        <Route exact path="/dashboard/settings" component={DahboardSettings}></Route>
                    </Switch> */}
        </div>
      
      
        <div
          id="DSSetupPopup"
          className="DSSetupPopup"
          onMouseLeave={
            function(){
              $("#DSSetupPopup").hide();
            }}
        >
          <ul className="nav flex-column">
         
            <li>
              <a>
                <b>Setup</b>
              </a>{" "}
            </li>
            <ol className="list-unstyled ml-2">
              <li>
                <NavLink onClick={this.toggleMenu} exact to="/dashboard/QcRules">
                  {/* <a onClick={this.ManageTheme} > */}
                  QC Rules
                </NavLink>
              </li>
              <li>
                <NavLink onClick={this.toggleMenu} exact to="/dashboard/CommonSettings">
                  {/* <a onClick={this.ManageTheme} > */}
                  Commom Settings
                </NavLink>
              </li>
              <li>
                <NavLink onClick={this.toggleMenu} exact to="/dashboard/CommonRigStateSetup">
                  {/* <a onClick={this.ManageTheme} > */}
                  Common RigState Setup
                </NavLink>
              </li>
              <li>
                <NavLink onClick={this.toggleMenu} exact to="/dashboard/RigSpecficRigStateSetup">
                  {/* <a onClick={this.ManageTheme} > */}
                  Rig Specfic RigState Setup
                </NavLink>
              </li>
              <li>
                <NavLink onClick={this.toggleMenu} exact to="/dashboard/UnitDictionary">
                  {/* <a onClick={this.ManageTheme} > */}
                  Unit Dictionary
                </NavLink>
              </li>
              <li>
                <NavLink onClick={this.toggleMenu} exact to="/dashboard/UnitConversion">
                  {/* <a onClick={this.ManageTheme} > */}
                  Unit Conversion
                </NavLink>
              </li>
            </ol>
          </ul>

          {/* <Switch>
                        <Route exact path="/dashboard/settings" component={DahboardSettings}></Route>
                    </Switch> */}
        </div>

      
      </div>
    );
  }
}

interface LinkStateProps {
  login: Partial<Types.ILogin>;
}

interface LinkDispatchProps {
  startLog_Out: (login: Partial<Types.ILogin>) => void;
}

const mapStateToProps = (state: AppState): LinkStateProps => ({
  login: state.login,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<any, any, AppActions>
): LinkDispatchProps => ({
  startLog_Out: bindActionCreators(startLog_Out, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
