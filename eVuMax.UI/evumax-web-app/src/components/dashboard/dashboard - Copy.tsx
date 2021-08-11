import React from "react";
import $ from "jquery";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";

import "./dashboard.css";
// import  VuMaxLogo  from "../../images/VuMaxLogo_Small.png";
import VuMaxLogo from "../../images/VuMaxLogo_Small.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlug,
  faUserCircle,
  faCog,
  faListAlt,
  faExchangeAlt,
  faHome,
  faBars,
  faCocktail,
  faFileDownload,
  faDownload,
  faTeeth,
  faInfo,
} from "@fortawesome/free-solid-svg-icons";

import { Route, NavLink, Switch } from "react-router-dom";

import { AppState } from "../../redux/store/configureStore";
import { connect } from "react-redux";
import * as Types from "../../redux/types/types";
import { ThunkDispatch } from "redux-thunk";
import { AppActions } from "../../redux/actions/appActions";
import { bindActionCreators } from "redux";
import { startLog_Out } from "../../redux/actions/loginActions";
import routes from "../../routes/routes";
import { Util } from "../../Models/eVuMax";
import { confirmAlert } from "react-confirm-alert";
import GlobalMod from "../../objects/global";
import axios from "axios";

type Props = LinkStateProps & LinkDispatchProps;
let _gMod = new GlobalMod();

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

export class Dashboard extends React.Component<Props> {
  // state = {
  //   showPopupMenu: true
  // }

  getVersion = () => {
    try {

      axios
        .get(_gMod._getVersion, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          // params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {


          let version = res.data;

          confirmAlert({
            //title: 'eVuMax',
            message: 'eVuMax Version ' + version,
            childrenElement: () => <div />,
            buttons: [
              {
                label: 'Ok',
                onClick: () => null
              }
            ]
          });

          //Util.StatusSuccess("Version: " +  version);
          //Util.StatusReady();



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
  LogOut = () => {
    let objLogin: Partial<Types.ILogin> = {};
    this.props.startLog_Out(objLogin);
  };

  getMenu = (e: any) => {
    if (e.target != document.getElementById("leftSidePopup")) {
      console.log("You clicked outside");
    } else {
      console.log("You clicked inside");
    }

    $(".LeftSidePopUp").toggle();
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

  render() {
    return (
      <div>
        {/* vimal */}
        <nav className="navbar navbar-expand-lg navbar-expand-sm navbar-expand-md navbar-expand-xs navbar-expand navbar-light bg-black">
          <NavLink className="nav-link" exact to="/dashboard/home">
            <a className="navbar-brand">
              <img src={VuMaxLogo} width="45" />
              <span className="text-theme ml-3">VuMax</span>
            </a>
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
                >
                  {/* <a className="dropdown-item" href="#">
                    Action
                  </a>
                  <a className="dropdown-item" href="#">
                    Another action
                  </a>
                  <div className="dropdown-divider"></div> */}
                  <a className="nav-link" onClick={this.LogOut}>
                    <FontAwesomeIcon icon={faPlug} className="mr-2" /> Logout
                  </a>
                  <a className="nav-link" onClick={this.getVersion}>
                    <FontAwesomeIcon icon={faInfo} className="mr-2" /> About
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
                <NavLink className="nav-link" exact to="/dashboard/user-prefs">
                  <FontAwesomeIcon icon={faListAlt} />
                </NavLink>
              </li>
              {/* <li className="nav-item">
                                <NavLink className="nav-link" exact to="/dashboard/theme-loader">
                                    <FontAwesomeIcon icon={faExchangeAlt} />
                                </NavLink>
                            </li> */}
              <li className="nav-item">
                {/* <NavLink className="nav-link" exact to="/dashboard/settings"> */}
                <a
                  data-leftmenu="settings"
                  //onClick={this.getMenu}
                  onMouseEnter={this.getMenu}
                  //onMouseOut={this.getMenu} //vimal
                  //To auto hide menu vimal
                  className="nav-link"
                >
                  <FontAwesomeIcon icon={faCog} />
                </a>
                {/* </NavLink> */}
              </li>
              {/* Nishant 27-11-2020 Witsml Explorer */}
              {/* <li className="nav-item">
                <NavLink
                  className="nav-link"
                  exact
                  to="/dashboard/WitsmlExplorer"
                >
                  <FontAwesomeIcon icon={faDownload} />
                </NavLink>
              </li> */}

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
        </div>
        {/* Side menu */}

        <div
          id="leftSidePopup"
          className="LeftSidePopUp"
          onMouseLeave={this.getMenu}
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
