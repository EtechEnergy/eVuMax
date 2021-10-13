import React, { MouseEvent } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faUser,
  faHeartBroken,
} from "@fortawesome/free-solid-svg-icons";
import "./login.css";

import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import CustomeNotifications from "../notifications/notification";
import NotificationProperties from "../../objects/notification-prop";
import VuMaxLogo from "../../images/VuMaxLogo_big.png";
import EtechLogo from "../../images/etech.png";
import GlobalMod from "../../objects/global";
import { AppState } from "../../redux/store/configureStore";
import { ThunkDispatch } from "redux-thunk";
import { AppActions } from "../../redux/actions/appActions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ProcessLoader from "../../components/loader/loader";
import * as Types from "../../redux/types/types";
import {
  startLog_In,
  startLog_Details,
} from "../../redux/actions/loginActions";
import RegularButton from "../CustomButtons/Button";
import { confirmAlert } from "react-confirm-alert";

import AboutPage from "../../components/About/about";
import { Dialog } from "@progress/kendo-react-dialogs";
import axios from "axios";

let _gMod = new GlobalMod();

let objParameter = new BrokerParameter("", "");
let objBrokerRequest = new BrokerRequest();

type Props = LinkStateProps & LinkDispatchProps;

export class LoginPage extends React.Component<Props> {
  state = {
    //showPopupMenu: true
    showAboutDialog: false,
    AuthType: "-1",
  };

  ShowAboutDialog = () => {
    try {
      this.setState({
        showAboutDialog: true,
      });
    } catch (error) { }
  };
  componentDidMount() {
    try {
      //   objBrokerRequest.Module = "Common";
      //   objBrokerRequest.Function = "getAuthType";
      //   objBrokerRequest.Broker = "";

      //   objBrokerRequest.Parameters.length = 0;

      //   // let objLogin: any;
      //   // objLogin = JSON.parse(JSON.parse(localStorage.getItem("persist:root")).login);

      //   // objParameter = new BrokerParameter("UserName", objLogin._userName);
      //   // objBrokerRequest.Parameters.push(objParameter);

      //   // objParameter = new BrokerParameter("Password", this.state.newPassword);
      //   // objBrokerRequest.Parameters.push(objParameter);

      //   axios
      //     .get(_gMod._getData, {
      //       params: { paramRequest: JSON.stringify(objBrokerRequest) },
      //     })
      //     .then((res) => {

      //       if (res.data != "") {
      //         sessionStorage.clear();
      //         localStorage.clear();
      //         this.setState({
      //           AuthType: res.data,
      //         });
      //       } else {
      //         this.setState({
      //           AuthType: -1,
      //         });
      //       }
      //     })
      //     .catch((error) => {});
    } catch (error) { }
  }

  Login = async () => {
    let userName: string = (
      document.getElementById("txtUserName") as HTMLInputElement
    ).value;
    let pwd: string = (
      document.getElementById("txtPassword") as HTMLInputElement
    ).value;

    if (userName == "") {
      confirmAlert({
        //title: 'eVuMax',
        message: "Please enter User Name",
        childrenElement: () => <div />,
        buttons: [
          {
            label: "Ok",
            onClick: () => { },
          },
          // {
          //     label: 'No',
          //     onClick: () => null
          // }
        ],
      });
      return;
    }

    let objLogin: Partial<Types.ILogin> = {};
    objLogin._userId = userName;
    objLogin._userName = userName;
    objLogin._pwd = pwd;
    objLogin._isLogged = true;

    await this.props.startLog_In(objLogin);
  };


  render() {
    return (
      <div>
        {this.state.showAboutDialog && (
          <Dialog
            height="390px"
            width="800px"
            title="About"
            onClose={() => {
              this.setState({ showAboutDialog: false });
            }}
          >
            <div className="" style={{ paddingTop: "50px" }}>
              <AboutPage
                handleClick={() => {
                  this.setState({ showAboutDialog: false });
                }}
              />
            </div>
          </Dialog>
        )}

        <div className="d-md-flex d-xl-flex d-lg-flex d-sm-flex  h-md-100 align-items-center">
          <div
            className="col-md-6 col-lg-6 col-xl-7 d-none d-sm-none d-md-block p-0  logbackarea h-md-100 bg-img "
            style={{ backgroundColor: "#161616" }}
          >
            <div className="d-md-flex align-items-center h-100 p-5 text-center justify-content-center">
              <div className="logoarea pt-5 pb-5">
                <img
                  src={VuMaxLogo}
                  style={{ display: "inline-block", paddingBottom: "30px" }}
                  onClick={() => {
                    this.setState({ showAboutDialog: true });
                  }}
                />
                <span
                  className="text-white"
                  style={{
                    display: "inline-block",
                    fontSize: "6em",
                    fontWeight: "bold",
                    opacity: 0.4,
                  }}
                >
                  VuMax
                </span>
                <br />
                <span
                  className="text-white"
                  style={{
                    fontWeight: "bold",
                    display: "inline-block",
                    fontSize: "1.5em",
                    opacity: 0.4,
                  }}
                >
                  Realtime Drilling Operation Monitoring and Optimization System
                </span>
              </div>
            </div>

            <div className="clearfix"></div>
          </div>

          <div
            className="col-md-6 col-12 col-xl-5 col-sm-12 col-lg-6 p-0 h-md-100 loginarea"
            style={{ backgroundColor: "#161616" }}
          >
            <div className="d-md-flex align-items-center h-md-100 p-5 justify-content-center">
              <form
                className="rounded  p-5  pt-3 col-12 col-lg-12 col-md-12 col-xl-8  col-sm-12"
                style={{ minHeight: 700, backgroundColor: "#161616" }}
              >
                <div className="d-none d-block d-sm-block d-md-none text-center">
                  <img
                    src={VuMaxLogo}
                    className="mr-2"
                    style={{
                      display: "inline-block",
                      paddingBottom: "20px",
                      width: "70px",
                    }}
                  />
                  <span
                    className="text-white"
                    style={{
                      display: "inline-block",
                      fontSize: "4em",
                      fontWeight: "bold",
                    }}
                  >
                    VuMax
                  </span>
                </div>

                <div className="text-center d-none d-sm-none d-md-block">
                  <h3 className="text-white">Login to VuMax</h3>
                  <label className="text-secondary" style={{ opacity: 1 }}>
                    Enter your credentials and click Login to continue
                  </label>
                </div>

                <br />
                <br />

                <div className="form-group pb-3 pt-5">
                  <div className="input-group flex-nowrap">
                    <input
                      type="text"
                      className="textbox-round"
                      id="txtUserName"
                      placeholder="Username"
                    />
                  </div>
                </div>
                <div className="form-group pb-3">
                  <div className="input-group flex-nowrap">
                    <input
                      type="password"
                      className="textbox-round"
                      id="txtPassword"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <br />
                <br />
                <br />

                {/* <button type="button" id="btnLogin" onClick={this.Login} className="btn-grd btn btn-success btn-round btn-block shadow-sm btn-primary-props">Login</button> */}
                <button
                  type="button"
                  id="btnLogin"
                  onClick={this.Login}
                  className="btn-grad btn-round btn-round btn-block"
                  style={{ height: 45 }}
                >
                  <b>Login</b>
                </button>
                {/* <RegularButton Text="Login" onClick={this.Login} className="btn btn-success btn-round btn-block shadow-sm btn-primary-props" /> */}
                <div className="mt-5">
                  <div style={{ display: "inline-flex" }}>
                    <span className="mr-3">
                      {this.props.status._isLoading ? <ProcessLoader /> : ""}{" "}
                    </span>{" "}
                    {this.props.status._statusMsg}
                  </div>
                </div>
              </form>

              <div className="clearfix"></div>
            </div>
          </div>
        </div>

        <div
          className="footer fixed-bottom"
          style={{
            display: "inline-block",
            paddingBottom: "10px",
            textAlign: "center",
          }}
        >
          {/* <img src={EtechLogo} style={{ width: '40px' }} /> */}
          <label style={{ opacity: 0.4 }} className="text-white pl-3">
            Copyright ©{new Date().getFullYear()}, ETECH International Inc.
          </label>
        </div>
      </div>
    );

    // return (
    //     <div>
    //         <div className="d-md-flex d-xl-flex d-lg-flex d-sm-flex  h-md-100 align-items-center">

    //             <div className="col-md-6 col-lg-6 col-xl-7 d-none d-sm-none d-md-block p-0  logbackarea h-md-100 bg-img bg-custom-lightBlack" >
    //                 <div className="d-md-flex align-items-center h-100 p-5 text-center justify-content-center">
    //                     <div className="logoarea pt-5 pb-5">
    //                         <img src={VuMaxLogo} style={{ display: 'inline-block', paddingBottom: '30px' }} />
    //                         <span className="userName" style={{ display: 'inline-block', fontSize: '6em', fontWeight: 'bold' }}>VuMax</span>
    //                         <br />
    //                         <span className="userName" style={{ fontWeight: 'bold', display: 'inline-block', fontSize: '1.5em' }}>Realtime Drilling Operation Monitoring and Optimization System</span>
    //                     </div>
    //                 </div>

    //                 <div className="clearfix"></div>
    //             </div>

    //             <div className="col-md-6 col-12 col-xl-5 col-sm-12 col-lg-6 p-0 bg-custom-lightBlack h-md-100 loginarea">
    //                 <div className="d-md-flex align-items-center h-md-100 p-5 justify-content-center">
    //                     <form className="rounded bg-custom-black  p-5 shadow pt-3 col-12 col-lg-12 col-md-12 col-xl-8  col-sm-12" style={{ minHeight: 700 }}>
    //                         <div className="d-none d-block d-sm-block d-md-none text-center">
    //                             <img src={VuMaxLogo} className="mr-2" style={{ display: 'inline-block', paddingBottom: '20px', width: '70px' }} />
    //                             <span className="userName" style={{ display: 'inline-block', fontSize: '4em', fontWeight: 'bold' }}>VuMax</span>
    //                         </div>

    //                         <div className="text-center d-none d-sm-none d-md-block">
    //                             <h3 className="userName">Login </h3>
    //                         </div>
    //                         <div className="form-group pb-3 pt-5">
    //                             <div className="input-group flex-nowrap">
    //                                 <div className="input-group-prepend">
    //                                     <span className="input-group-text"><FontAwesomeIcon icon={faUser} /></span>
    //                                 </div>
    //                                 <input type="text" id="txtUserName" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="addon-wrapping" />
    //                             </div>
    //                         </div>
    //                         <div className="form-group pb-3">
    //                             <div className="input-group flex-nowrap">
    //                                 <div className="input-group-prepend">
    //                                     <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
    //                                 </div>
    //                                 <input type="password" id="txtPassword" className="form-control" placeholder="Password" />
    //                             </div>
    //                         </div>

    //                         <button type="button" id="btnLogin" onClick={this.Login} className="btn btn-success btn-round btn-block shadow-sm btn-primary-props">Login</button>
    //                         {/* <RegularButton Text="Login" onClick={this.Login} className="btn btn-success btn-round btn-block shadow-sm btn-primary-props" /> */}
    //                         <div className="mt-5">

    //                             <div style={{ display: 'inline-flex' }} >
    //                                 <span className="mr-3">{this.props.status._isLoading ? <ProcessLoader /> : ""} </span> {this.props.status._statusMsg}
    //                             </div>
    //                         </div>
    //                     </form>

    //                     <div className="clearfix"></div>
    //                 </div>
    //             </div>

    //         </div>

    //         <div className="footer fixed-bottom" style={{ display: 'inline-block', paddingLeft: '20px', paddingBottom: '10px' }}>
    //             <img src={EtechLogo} style={{ width: '40px' }} />
    //             <label className="userName pl-3">Copyright © 2020, ETECH International Inc.</label>
    //         </div>
    //     </div>
    // )
  }
}

interface LinkStateProps {
  login: Partial<Types.ILogin>;
  status: Partial<Types.IStatus>;
}

interface LinkDispatchProps {
  startLog_In: (login: Partial<Types.ILogin>) => void;
}

const mapStateToProps = (state: AppState): LinkStateProps => ({
  login: state.login,
  status: state.status,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<any, any, AppActions>
): LinkDispatchProps => ({
  startLog_In: bindActionCreators(startLog_In, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
