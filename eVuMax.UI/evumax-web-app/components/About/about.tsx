import React, { Props } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';


import VuMaxLogo from "../../images/VuMaxLogo_big.png";
import EtechLogo from "../../images/etech.png";

import ProcessLoader from "../../components/loader/loader";
import * as Types from "../../redux/types/types";

import { confirmAlert } from "react-confirm-alert";
import GlobalMod from "../../objects/global";
import axios from "axios";
import { Util } from "../../Models/eVuMax";
import ETECHLogo from "../../images/etechSVG.svg";
let _gMod = new GlobalMod();

interface IProps {
    handleClick: React.MouseEventHandler<HTMLInputElement>
}

export default class AboutPage extends React.Component<IProps>{
    constructor(props: IProps) {
        super(props)
    }
    state = {
        Version: "Demo",
        BuildDate: ""
    }

    redirectEtechSite = () => {
        try {

            return;
            window.open("https://etechinter.com/contact-us/");

        } catch (error) {

        }
    }
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

                    this.setState({
                        Version: res.data[0],
                        BuildDate: res.data[1]
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
    componentDidMount() {
        try {
            this.getVersion();
        } catch (error) {

        }
    }

    render() {
        return (
            <div>
                <div className="row" style={{ width: "100%", display: "block" }}>
                    <div className='VersionLogContainer'>
                        <div className="VersionLogoText" >VuMax</div><br />
                        <div>
                            <img src={VuMaxLogo} width='70' />
                        </div>
                    </div>
                    <div className="VersionDetailContainer mb-3" style={{ fontSize: "1.5em", display: "block" }}>Realtime Drilling Operation Monitoring and Optimization System</div>
                    <hr className="ml-5 mr-5" />
                    <br />
                    <div className="VersionDateTimeContainer mt-3  mr-4 ml-5" style={{ fontSize: "1.2em", display: "block" }}>Version: <b> {this.state.Version}  </b></div>
                    <div className="VersionDateTimeContainer mt-3 mb-5 mr-4 ml-5" style={{ fontSize: "1.2em", display: "block" }}>Build DateTime: <b> {this.state.BuildDate}  </b></div>
                    <div id="PoweredByText" className="ml-auto mr-2 float-right">
                        Powered by  <img src={ETECHLogo} style={{ height: "20px" }} className="img-fluid" /> Etech International Inc. &copy; Copyright {new Date().getFullYear()}
                    </div>

                    <div className="VersionLogContainer">
                        <button type="button" onClick={this.props.handleClick} className="VersionButtonOk ml-1" style={{ height: "30px", width: "80px", border: "1px solid" }}>Ok</button>
                    </div>



                </div>
            </div>
        )
    }

}
