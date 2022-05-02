import axios from "axios";
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@progress/kendo-react-all';
import { Grid, GridToolbar, GridColumn } from '@progress/kendo-react-grid';
import React, { Component } from 'react'
import { confirmAlert } from 'react-confirm-alert';
import BrokerParameter from '../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../broker/BrokerRequest';
import GlobalMod from '../../../../objects/global';

let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

export default class UnitDictionary extends Component {
    state = {
        grdUnit: [] as any,
        UnitID: "",
    }
    ID = "";
    cmdEditUnit = async (event: any, rowData: any) => {
        try {
            debugger;

            this.ID = rowData.ID;
            await this.setState({




                //showChartDialog: false,
            });

            //this.LoadSetting();


        } catch (error) {

        }

    }
    componentDidMount() {
        this.LoadUnitList();


    }
    LoadUnitList = () => {
        //LoadUnitList
        try {
            debugger
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "UnitSetup";
            objBrokerRequest.Function = "LoadUnitList";

            //  let objParameter: BrokerParameter = new BrokerParameter("", _gMod._userId);
            // objBrokerRequest.Parameters.push(objParameter);


            // objParameter = new BrokerParameter("UNIT_ID", this.state.UnitID);
            // objBrokerRequest.Parameters.push(objParameter);

            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then((res) => {
                    debugger;
                    const objData = JSON.parse(res.data.Response);
                    debugger;
                    let UnitList = Object.values(objData.units);
                    console.log(objData);
                    //UnitCategory: ""
                    //UnitID: "0.01 deg/ft"
                    //UnitName: "0.01 deg/ft"
                    this.setState({ grdUnit: UnitList });


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
    cmdRemoveUnit = (event: any, rowData: any) => {

        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        debugger;
                        let UnitList = this.state.grdUnit;
                        let objRow = rowData;
                        let SrNo = objRow.SrNo;// MNEMONIC;
                        let index = UnitList.findIndex((d: any) => d.SrNo === SrNo); //find index in your array
                        UnitList.splice(index, 1);//remove element from array
                        this.setState({
                            grdUnit: UnitList
                        });
                    }

                },
                {
                    label: 'No',
                    onClick: () => null
                }
            ]
        });
    }


    render() {
        return (
            <>
                <div className="col-6">
                    <Grid
                        // data={[{ SetupId: 'Rig2' }, { RigName: 'Shelf Drilling 0' }, { RigName: 'Rig2' }]}
                        data={this.state.grdUnit}
                    >
                        <GridToolbar>
                            <span>
                                <Button onClick={() => {
                                    {
                                        let Edited = this.state.grdUnit;

                                        // let newRow = {
                                        //     SetupId: 0,
                                        //     RigName: 0,
                                        //     SrNo: 0,
                                        // };
                                        // UnitCategory: ""
                                        // UnitID: "0.01 deg/ft"
                                        // UnitName: "0.01 deg/ft"


                                        // if (this.state.grdRigNameList.length > 0) {
                                        //     // newRow.StartMD = editData[this.state.GeoDrlgWindowData.length-1].StartMD+1;
                                        //     newRow.SrNo = this.state.grdRigNameList.length + 1;
                                        // } else {
                                        //     newRow.SrNo = 1;

                                        // }
                                        // Edited.push(newRow);
                                        // this.setState({
                                        //     grdRigNameList: Edited
                                        // })

                                    }
                                }}  >Add</Button>
                            </span>
                        </GridToolbar>
                        <GridColumn
                            field="UnitID"
                            title="Unit ID"
                        />
                        <GridColumn
                            field="UnitName"
                            title="Unit Name"
                        />
                        <GridColumn
                            field="UnitCategory"
                            title="Category"
                        />

                        <GridColumn width="70px" headerClassName="text-center" resizable={false} locked={true}
                            field="EditUnit"
                            title="*"
                            cell={props => (
                                <td
                                    style={props.style}
                                    className={"text-center k-command-cell " + props.className}
                                >
                                    {/* <td className={this.props.className + " k-command-cell"} style={this.props.style}> */}
                                    <span onClick={e => this.cmdEditUnit(e, props.dataItem)}>
                                        <FontAwesomeIcon icon={faPen} />
                                    </span>

                                </td>
                            )}
                        />
                        <GridColumn width="70px" headerClassName="text-center" resizable={false} locked={true}
                            field="removeUnit"
                            title="*"
                            cell={props => (
                                <td
                                    style={props.style}
                                    className={"text-center k-command-cell " + props.className}
                                >
                                    {/* <td className={this.props.className + " k-command-cell"} style={this.props.style}> */}
                                    <span onClick={e => this.cmdRemoveUnit(e, props.dataItem)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </span>

                                </td>
                            )}
                        />

                    </Grid>
                </div>

            </>
        )
    }
}
