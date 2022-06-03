import { Button, Grid, GridColumn as Column, Input, Label } from '@progress/kendo-react-all'
import React, { Component } from 'react'
import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import { ClientLogger } from '../../../ClientLogger/ClientLogger';
import GlobalMod from '../../../../objects/global';
import BrokerRequest from '../../../../broker/BrokerRequest';
import BrokerParameter from '../../../../broker/BrokerParameter';
import { Util } from '../../../../Models/eVuMax';
import axios from "axios";
import { filterBy } from "@progress/kendo-data-query";
import "./AlarmProfiles.css";

let _gMod = new GlobalMod();

export default class AlarmProfiles extends Component {

    objLogger: ClientLogger = new ClientLogger("EmailSettings", _gMod._userId);

    state = {
        ProfileName: "",
        Notes: "",
        grdAlarmProfile: []
    }

    grdData: any[];
    componentDidMount = () => {
        try {
            this.loadProfileGrid();
        } catch (error) {

        }
    }

    loadProfileGrid = () => {
        try {
            this.objLogger.SendLog("load Maint Std Channels");
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "DataAlarmProfiles";
            objBrokerRequest.Function = "loadAlarmProfiles";


            let objParameter: BrokerParameter = new BrokerParameter(
                "UserId",
                _gMod._userId
            );
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter(
                "ProfileName",
                this.state.ProfileName
            );
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter(
                "Notes",
                this.state.Notes
            );
            objBrokerRequest.Parameters.push(objParameter);


            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },

                })
                .then((res) => {
                    Util.StatusSuccess("Data successfully retrived  ");
                    this.objLogger.SendLog("load Maintain Standard Channels Data Received...");


                    let objData = JSON.parse(res.data.Response);

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
                    debugger;

                    this.setState({
                        grdAlarmProfile: Object.values(objData)
                    });
                    this.grdData = Object.values(objData)


                })
                .catch((error) => {

                    Util.StatusError(error.message);

                    if (error.response) {

                    } else if (error.request) {
                        console.log("error.request");
                    } else {
                        console.log("Error", error);
                    }
                    console.log("rejected");
                    this.setState({ isProcess: false });
                });



        } catch (error) {

        }

    }



    Add = () => {

    }

    Edit = () => {

    }

    Remove = () => {

    }

    handleChange = (e: any, field: string) => {
        try {
            debugger;

            //let edited: any = this.state.objWellMonitorSetup;


            // edited[field] = e.value;
            // this.setState({
            //     objWellMonitorSetup: edited
            // });


        } catch (error) {

        }
    }


    FilterAction = () => {
        try {

        } catch (error) {

        }
    }

    ClearFilter = () => {
        try {

        } catch (error) {

        }
    }

    RowClickAlarmProfile = () => {
        try {


        } catch (error) {

        }
    }


    filterData = (e: any) => {
        let value = e.target.value;
        let filter: any = {
            logic: "or",
            filters: [
                { field: "PROFILE_NAME", operator: "contains", value: value },
                { field: "NOTES", operator: "contains", value: value },
            ],
        };

        this.setState({
            grdAlarmProfile: filterBy(this.grdData, filter),
        });
    };

    render() {
        return (
            <div>
                <h4>Maintain Alarm Profile</h4>

                <div className="container1">
                    <div className="row">
                        <div className='col-lg-6 col-xl-6 col-md-6 col-sm-6 mb-3'>
                            <span className="float-left ml-2 mr-2" >

                                {" "}
                                <Button
                                    type="button"
                                    style={{ width: "100px" }}
                                    onClick={this.Add}
                                    className="btn-custom btn-custom-primary ml-2"
                                >
                                    Add
                                </Button>
                                <Button
                                    type="button"
                                    style={{ width: "100px" }}
                                    onClick={this.Edit}
                                    className="btn-custom btn-custom-primary ml-2"
                                >
                                    Edit
                                </Button>
                                <Button
                                    type="button"
                                    style={{ width: "100px" }}
                                    onClick={this.Remove}
                                    className="btn-custom btn-custom-primary ml-2"
                                >
                                    Remove
                                </Button>
                            </span>

                        </div>
                    </div>



                    <div className="row">
                    

                        {/* PROFILE_ID,PROFILE_NAME,NOTES,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE */}


                        <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12 mb-3">

                            <div className="k-textbox k-space-right serachStyle">
                                <input
                                    type="text"
                                    width={"100px"}
                                    onChange={this.filterData}
                                    placeholder="Search"
                                />
                                <a className="k-icon k-i-search" style={{ right: "10px" }}>
                                    &nbsp;
                                </a>
                            </div>

                            <Grid
                                style={{ height: "75vh"}}
                                data={this.state.grdAlarmProfile}
                                onRowClick={this.RowClickAlarmProfile}
                            >
                                <Column
                                    field="PROFILE_NAME"
                                    title="Profile Name"
                                    width="auto"
                                />

                                <Column
                                    field="NOTES"
                                    title="Notes"
                                    width="500px"
                                />

                                <Column
                                    field="CREATED_BY"
                                    title="Created By"
                                    width="150px"
                                />

                                <Column
                                    field="CREATEDDATE"
                                    title="Created Date"
                                    width="150px"
                                    format="{0:dd/MM/yyyy HH:mm:ss a}"
                                />

                                <Column
                                    field="MODIFIED_BY"
                                    title="Modified By"
                                    width="150px"
                                />


                                <Column
                                    field="MODIFIEDDATE"
                                    title="Modified Date"
                                    width="150px"
                                />
                            </Grid>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
