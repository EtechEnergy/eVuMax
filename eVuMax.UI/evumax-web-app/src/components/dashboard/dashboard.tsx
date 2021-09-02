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
import AboutPage from "../../components/About/about";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import ETECHLogo from "../../images/etechSVG.svg";

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

export class Dashboard extends React.Component<Props> {
  state = {
    //showPopupMenu: true
    showAboutDialog: false,
  }

  LogOut = () => {
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
                >
                  {/* <a className="dropdown-item" href="#">
                    Action
                  </a>
                  <a className="dropdown-item" href="#">
                    Another action
                  </a>
                  <div className="dropdown-divider"></div> */}
                  <a className="nav-link" onClick={this.ShowAboutDialog}>
                    <FontAwesomeIcon icon={faInfo} className="mr-2" /> About
                  </a>
                  <a className="nav-link" onClick={this.LogOut}>
                    <FontAwesomeIcon icon={faPlug} className="mr-2" /> Logout
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
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  exact
                  to="/dashboard/WitsmlExplorer"
                >
                  <FontAwesomeIcon icon={faDownload} />
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
          Powered by <img src={ETECHLogo} style={{height:"15px"}} className="img-fluid ml-1 mr-1" /> Etech &copy; {new Date().getFullYear()}   
          </div>
          {/* Powered by  <img src={ETECHLogo} style={{height:"15px"}} className="img-fluid ml-2 mr-2 mt-2" /> ETECH <p>&copy; {new Date().getFullYear()}  </p> */}
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
