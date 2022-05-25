import { DropDownList, Input, Label } from '@progress/kendo-react-all'
import React, { Component } from 'react'
import axios from "axios";
import GlobalMod from '../../../objects/global';
import BrokerRequest from '../../../broker/BrokerRequest';
// import GlobalMod from "../../../../../objects/global";
import * as utilFunctions from "../../../utilFunctions/utilFunctions";

// import BrokerParameter from "../../../../../broker/BrokerParameter";
// import BrokerRequest from '../../../../../broker/BrokerRequest'
let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();

export default class SetupAlarms extends Component {
    state = {
        WellID: "",
        WellProfileID: "",
        objProfileList: [],
        selectedProfile:""
    }

    componentDidMount = () => {
        try {
            this.loadData();
        } catch (error) {

        }
    }

    loadData() {
        try {
            debugger
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "DataSetupAlarms";
            objBrokerRequest.Function = "loadProfiles";

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

                    console.log(objData);

                    //Warnings Notifications
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


                    this.setState({objProfileList : objData.objProfileList, WellID : objData.WellID, WellProfileID : objData.WellProfileID });
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
    render() {
        return (
            <div>
                <div>SetupAlarms</div>
                <p>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-3 col-xl-3 col-md-3 col-sm-3 p-5">
                                <Label>Well</Label>

                            </div>
                            <div className="col-lg-8 col-xl-8 col-md-8 col-sm-8 p-5">
                                <Input style={{ width: "70px" }} type="text" value={this.state.WellID} ></Input>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-3 col-xl-3 col-md-3 col-sm-3 p-5">
                                <Label>Profile</Label>

                            </div>
                            <div className="col-lg-8 col-xl-8 col-md-8 col-sm-8 p-5">



                                <DropDownList
                                    className="form-control"
                                    textField="text"
                                    dataItemKey="id"
                                    data={this.state.objProfileList}
                                    //onChange={(e) => this.OnChange(e, "LineStyle")}
                                    value={this.state.selectedProfile}
                                />
                            </div>
                        </div>

                    </div>



                </p>
            </div>
        )
    }
}
