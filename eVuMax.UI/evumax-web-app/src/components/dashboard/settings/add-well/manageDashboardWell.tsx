import React from "react";
import WellSelector from "../../../wellSelector/WellSelector";
import {useHistory } from "react-router-dom";

import axios from "axios";
import { Grid, GridColumn as Column, GridColumn, GridToolbar } from '@progress/kendo-react-grid';
import { Switch } from '@progress/kendo-react-all';

import BrokerRequest from '../../../../broker/BrokerRequest';
import BrokerParameter from "../../../../broker/BrokerParameter";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPen, faCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Input } from "@progress/kendo-react-inputs";
import { filterBy } from "@progress/kendo-data-query";
import CustomLoader from "../../../loader/loader";
import CustomeNotifications from "../../../notifications/notification";

import { Window, DialogActionsBar, Dialog } from '@progress/kendo-react-dialogs';

import { DropDownList } from '@progress/kendo-react-dropdowns';
import history from '../../../../history/history';


//import * as wellColumnsEditor from "../../dashboard/settings/wellColumnsEditor";

import { settings } from "cluster";

import GlobalMod from "../../../../objects/global";

let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

let wellList_clone: any[] = [];



const searchFieldStyle = {

    // borderRadius: '22px',
    width: '15%',
    borderColor: '#9e9e9e',
    border: '1px solid #252527',
    borderRadius: "22px",
    backgroundColor: '#3e3d42',
    color: '#fff',
    padding: '5px 20px'

}

const headerlabel = {
    fontSize: "16px",
    fontWeights: "700",
    display: 'inline-flex'

}

interface RunningStatus {
    RunningStatus: _RunningStatus,
    StatusMsg: _StatusMsg
}


type _RunningStatus = boolean | undefined;
type _StatusMsg = string | undefined;


export default class ManageDashboardWell extends React.Component {


    state = {
        showDeleteDialog: false,
        removeWells: false,
        wellList: [] as any,
        isProcess: false,
        applyWellColumns: false, //Nishant
        showWellSelector: false, //Nishant

    }



    componentDidMount() {

        this.loadDashBoardWells();
    }

    loadDashBoardWells = () => {
        try {

            this.setState({ isProcess: true })

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Well.Data.Objects";
            objBrokerRequest.Function = "ActiveWellList";
            objBrokerRequest.Broker = "ActiveWellProfile";
            objBrokerRequest.Parameters.push(objParameter);


            axios
                .get(_gMod._getData, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json;charset=UTF-8'
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) }
                })
                .then((res) => {

                    let _Data = [];
                    if (res.data.RequestSuccessfull) {

                        _Data = JSON.parse(res.data.Response);
                        wellList_clone = _Data;
                        this.setState({ wellList: _Data.map((dataItem: any) => Object.assign({ selected: false }, dataItem)) });
                    }

                    this.setState({ isProcess: false })
                })
                .catch((error) => {
                    if (error.response) {
                        // this.errors(error.response.message);
                    } else if (error.request) {
                        console.log('error.request');
                    } else {
                        console.log('Error', error);
                    }
                    console.log("rejected");
                });

            //    this.intervalID=setTimeout(this.getActiveWellList.bind(this),5000);

        }
        catch{

        }
    }

    saveWell = (wellList: any[]) => {
        try {


            if (wellList.length == 0) {
                return;
            }

            let selectedWellIDs: any[] = [];
            // for (let i = 0; i < this.state.WellList.length; i++) {
            //     let selected = this.state.WellList[i]["selected"];
            //     if (selected) {
            //         selectedWellIDs.push(this.state.WellList[i]["WELL_ID"]);
            //     }
            // }
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Well.Data.Objects";
            objBrokerRequest.Function = "AddWellToDashboard";
            objBrokerRequest.Broker = "ActiveWellProfile";




            objParameter = new BrokerParameter('UserName', _gMod._userId);

            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter('wellList', JSON.stringify(wellList));

            objBrokerRequest.Parameters.push(objParameter);


            axios

                .get(_gMod._performTask, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json;charset=UTF-8'
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) }
                },

                )


                .then((res) => {
                            history.push("/dashboard/home");
                    this.loadDashBoardWells();

                })
                .catch((error) => {
                    if (error.response) {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        // this.errors(error.response.message);
                    } else if (error.request) {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        console.log('error.request');
                    } else {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        console.log('Error', error);
                    }
                    // return <CustomeNotifications Key="success" Icon={false}  />
                    console.log("rejected");
                    this.setState({ isProcess: false });
                    //this.loadDashBoardWells();
                });
            this.setState({ isProcess: false });
            this.setState({
                showWellSelector: !this.state.showWellSelector
            });



        } catch (error) {

        }

    }

    filterData = (e: any) => {
        let value = e.target.value;
        let filter: any = {
            logic: "or",
            filters: [
                { field: "WELL_NAME", operator: "contains", value: value },
                { field: "DEPTH", operator: "contains", value: value },
                { field: "RIG_STATE", operator: "contains", value: value },
                { field: "HDTH", operator: "contains", value: value },
                { field: "STATE", operator: "contains", value: value },
                { field: "FIELD", operator: "contains", value: value },
                { field: "OPERATOR", operator: "contains", value: value },
                { field: "RIG_STATE_NAME", operator: "contains", value: value },
                { field: "RIG_NAME", operator: "contains", value: value }
            ]
        }
        this.setState({
            wellList: filterBy(wellList_clone, filter)
        });
    };


    removeWell_Clicked=()=>{
        try {
            this.setState({showDeleteDialog:true});
        } catch (error) {

        }
    }

    removeWellFromDashboard = () => {
        try {



            let selectedWellIDs: any[] = [];
            for (let i = 0; i < this.state.wellList.length; i++) {
                let selected = this.state.wellList[i]["selected"];
                if (selected) {
                    selectedWellIDs.push(this.state.wellList[i]["WELL_ID"]);
                }
            }

            if (selectedWellIDs.length == 0) {
                alert("Please select wells from the list to remove");
                return;
            }

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Well.Data.Objects";
            objBrokerRequest.Function = "RemoveWellFromDashboard";
            objBrokerRequest.Broker = "ActiveWellProfile";




            objParameter = new BrokerParameter('UserName', _gMod._userId);

            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter('wellList', JSON.stringify(selectedWellIDs));

            objBrokerRequest.Parameters.push(objParameter);


            axios

                .get(_gMod._performTask, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json;charset=UTF-8'
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) }
                },

                )


                .then((res) => {

                    this.loadDashBoardWells();

                })
                .catch((error) => {
                    if (error.response) {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        // this.errors(error.response.message);
                    } else if (error.request) {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        console.log('error.request');
                    } else {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        console.log('Error', error);
                    }
                    // return <CustomeNotifications Key="success" Icon={false}  />
                    console.log("rejected");
                    this.setState({ isProcess: false });

                });

            this.setState({ isProcess: false });

            this.setState({ removeWells: false });
            this.setState({ showDeleteDialog: false });

        } catch (error) {

        }
    }
    //Nishant
    AddWellToDashboard = (wellList: any) => {

        //    //createBrowserHistory.call("/dashboard/home");
        //    const history = useHistory();
        //    history.push('/dashboard/home');//eg.history.push('/login');
        //    return;

        this.setState({
            showWellSelector: !this.state.showWellSelector
        });

        if (wellList.length > 0) {
            this.saveWell(wellList);
        }

    }

    //Nishant  26-05-2020 for checkbox selection
    grid_headerSelectionChange = (event: any) => {

        const checked = event.syntheticEvent.target.checked;
        const data = this.state.wellList.map((item: any) => {
            item["selected"] = checked;
            return item;
        });
        this.setState({ wellList: data });
    }



    grid_selectionChange = (event: any) => {

        const checked = event.syntheticEvent.target.checked;

        const data = this.state.wellList.map((item: any) => {

            if (item["WELL_ID"] === event.dataItem.WELL_ID) {

                item["selected"] = checked;
            }
            return item;
        });
        this.setState({ wellList: data });
        wellList_clone = data;

    }



    render() {
        let { isProcess } = this.state;
        return (

            <div>
                <div className="col-lg-12 col-sm-12 col-md-12 col-12">
                    <legend>
                        <a>Manage Dashboard Wells</a>
                    </legend>
                </div>
                <div className="col-lg-12">
                <WellSelector getSelectedWells={this.AddWellToDashboard} getWithWellName={false}></WellSelector>
                </div>


                {this.state.showDeleteDialog && <Dialog title={"eVuMax"} onClose={() => this.setState({ showDeleteDialog: false, removeWells: false })} >
                    <p style={{ margin: "25px", textAlign: "center" }}>Are you sure you want to remove wells from dashboard?</p>
                    <DialogActionsBar>
                        <button className="k-button k-primary" onClick={() => this.setState({ showDeleteDialog: false, removeWells: false })}>No</button>
                        <button className="k-button" onClick={this.removeWellFromDashboard}>Remove</button>
                    </DialogActionsBar>
                </Dialog>}

            </div >
        );
    }
}

