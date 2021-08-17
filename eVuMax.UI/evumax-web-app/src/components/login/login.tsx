import React, { MouseEvent } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUser, faHeartBroken } from '@fortawesome/free-solid-svg-icons';
import './login.css';

import BrokerRequest from '../../broker/BrokerRequest';
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
import { startLog_In, startLog_Details } from "../../redux/actions/loginActions";
import RegularButton from "../CustomButtons/Button";
import { confirmAlert } from "react-confirm-alert";
import { color } from "d3";

let _gMod = new GlobalMod();


let objBrokerResponse = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");
let objNotification = new NotificationProperties();


type Props = LinkStateProps & LinkDispatchProps;

export class LoginPage extends React.Component<Props> {


    Login = () => {

        let userName: string = (document.getElementById("txtUserName") as HTMLInputElement).value;
        let pwd: string = (document.getElementById("txtPassword") as HTMLInputElement).value;

        if (userName == "") {
            confirmAlert({
                //title: 'eVuMax',
                message: 'Please enter User Name',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Ok',
                        onClick: () => {

                        }

                    },
                    // {
                    //     label: 'No',
                    //     onClick: () => null
                    // }
                ]
            });
            return;
        }

        let objLogin: Partial<Types.ILogin> = {};
        objLogin._userId = userName;
        objLogin._userName = userName;
        objLogin._pwd = pwd;
        objLogin._isLogged = true;

        this.props.startLog_In(objLogin);
    }




    render() {


        return (
            <div>
                <div className="d-md-flex d-xl-flex d-lg-flex d-sm-flex  h-md-100 align-items-center">

                    <div className="col-md-6 col-lg-6 col-xl-7 d-none d-sm-none d-md-block p-0  logbackarea h-md-100 bg-img bg-custom-lightBlack" >
                        <div className="d-md-flex align-items-center h-100 p-5 text-center justify-content-center">
                            <div className="logoarea pt-5 pb-5">
                                <img src={VuMaxLogo} style={{ display: 'inline-block', paddingBottom: '30px' }} />
                                <span className="userName" style={{ display: 'inline-block', fontSize: '6em', fontWeight: 'bold' }}>VuMax</span>
                                <br />
                                <span className="userName" style={{ fontWeight: 'bold', display: 'inline-block', fontSize: '1.5em' }}>Realtime Drilling Operation Monitoring and Optimization System</span>
                            </div>
                        </div>

                        <div className="clearfix"></div>
                    </div>


                    <div className="col-md-6 col-12 col-xl-5 col-sm-12 col-lg-6 p-0 bg-custom-lightBlack h-md-100 loginarea">
                        <div className="d-md-flex align-items-center h-md-100 p-5 justify-content-center">
                            <form className="rounded bg-custom-black  p-5 shadow pt-3 col-12 col-lg-12 col-md-12 col-xl-8  col-sm-12" style={{ minHeight: 700 }}>
                                <div className="d-none d-block d-sm-block d-md-none text-center">
                                    <img src={VuMaxLogo} className="mr-2" style={{ display: 'inline-block', paddingBottom: '20px', width: '70px' }} />
                                    <span className="userName" style={{ display: 'inline-block', fontSize: '4em', fontWeight: 'bold' }}>VuMax</span>
                                </div>

                                <div className="text-center d-none d-sm-none d-md-block">
                                    <h3 className="userName">Login </h3>
                                </div>
                                <div className="form-group pb-3 pt-5">
                                    <div className="input-group flex-nowrap">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text"><FontAwesomeIcon icon={faUser} /></span>
                                        </div>
                                        <input type="text" id="txtUserName" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="addon-wrapping" />
                                    </div>
                                </div>
                                <div className="form-group pb-3">
                                    <div className="input-group flex-nowrap">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                                        </div>
                                        <input type="password" id="txtPassword" className="form-control" placeholder="Password" />
                                    </div>
                                </div>

                                <button type="button" id="btnLogin" onClick={this.Login} className="btn btn-success btn-round btn-block shadow-sm btn-primary-props">Login</button>
                                {/* <RegularButton Text="Login" onClick={this.Login} className="btn btn-success btn-round btn-block shadow-sm btn-primary-props" /> */}
                                <div className="mt-5">

                                    <div style={{ display: 'inline-flex' }} >
                                        <span className="mr-3">{this.props.status._isLoading ? <ProcessLoader /> : ""} </span> {this.props.status._statusMsg}
                                    </div>
                                </div>
                            </form>

                            <div className="clearfix"></div>
                        </div>
                    </div>

                </div>

                <div className="footer fixed-bottom" style={{ display: 'inline-block', paddingLeft: '20px', paddingBottom: '10px' }}>
                    <img src={EtechLogo} style={{ width: '40px' }} />
                    <label className="userName pl-3">Copyright © 2020, ETECH International Inc.</label>
                </div>
            </div>
        )
    }

}

interface LinkStateProps {
    login: Partial<Types.ILogin>,
    status: Partial<Types.IStatus>;
}

interface LinkDispatchProps {
    startLog_In: (login: Partial<Types.ILogin>) => void,

}

const mapStateToProps = (state: AppState): LinkStateProps => ({
    login: state.login,
    status: state.status
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<any, any, AppActions>
): LinkDispatchProps => ({
    startLog_In: bindActionCreators(startLog_In, dispatch)

});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginPage);
