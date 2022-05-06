import axios from "axios";
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ComboBox, Dialog, DialogActionsBar, Input, Label } from '@progress/kendo-react-all';
import { Grid, GridToolbar, GridColumn } from '@progress/kendo-react-grid';
import React, { Component } from 'react'
import { confirmAlert } from 'react-confirm-alert';
import BrokerParameter from '../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../broker/BrokerRequest';
import GlobalMod from '../../../../objects/global';
import { filterBy } from "@progress/kendo-data-query";

let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");
let grdMapping_: any[] = [];
export default class UnitMappings extends Component {


    state = {
        grdMapping: [] as any,
        selectedRow: {},
        editID: "",
    }

    UnitIDList: string[] = [];

    // VUMAX_UNIT_ID: ""
    // WITSML_UNIT_ID: ""
    // key: "877_649_461_341_808"
    componentDidMount() {
        this.LoadUnitList();
    }

  
    grdRowClick = (event: any) => {
        this.setState({
            editID: event.dataItem.key
        });
    };


    LoadUnitList = () => {
        //LoadUnitList
        try {


            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "UnitSetup";
            objBrokerRequest.Function = "LoadUnitMappingList";


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
                    this.setState({
                        grdMapping: objData,
                    });

                    grdMapping_ = objData

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





    cmdRemoveMapping = (event: any, rowData: any) => {

        // this.setState({
        //     editID: rowData.UnitID
        // });
        confirmAlert({
            //title: 'eVuMax',
            message: "Are you sure you want to remove unit mapping?",
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        let MappingList = this.state.grdMapping;
                        let objRow = rowData;
                        let key = objRow.key
                        let index = MappingList.findIndex((d: any) => d.key === key); //find index in your array
                        MappingList.splice(index, 1);//remove element from array
                        this.setState({
                            grdMapping: MappingList
                        });

                        objBrokerRequest = new BrokerRequest();
                        objBrokerRequest.Module = "DataService";
                        objBrokerRequest.Broker = "UnitSetup";
                        objBrokerRequest.Function = "RemoveUnitMapping";

                 
                        objParameter = new BrokerParameter("MappingKey", objRow.key);
                        objBrokerRequest.Parameters.push(objParameter);

                        axios.post(_gMod._performTask, {
                            paramRequest: JSON.stringify(objBrokerRequest),
                        }).then((response) => {
                            //this.LoadUnitList();
                        })
                            .catch((error) => {
                                console.log(error);
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

    filterData = (e: any) => {

        // VUMAX_UNIT_ID: ""
    // WITSML_UNIT_ID: ""
    // key: "877_649_461_341_808"

        let value = e.target.value;
        let filter: any = {
            logic: "or",
            filters: [
                { field: "VUMAX_UNIT_ID", operator: "contains", value: value },
                { field: "WITSML_UNIT_ID", operator: "contains", value: value },

            ],
        };

        this.setState({
            grdMapping: filterBy(grdMapping_, filter),
        });
    };


    render() {
        return (
            <>
             <div className="k-textbox k-space-right serachStyle">
                    <input
                        type="text"
                        onChange={this.filterData}
                        placeholder="Search"
                    />
                    <a className="k-icon k-i-search" style={{ right: "10px" }}>
                        &nbsp;
                    </a>
                </div>
                <div className="col-6">
                    <Grid
                        data={this.state.grdMapping != null ? (this.state.grdMapping.map((item: any) =>
                            ({ ...item, inEdit: item.key === this.state.editID })
                        )) : null}
                        onRowClick={this.grdRowClick}
                        //editField="inEdit"
                        selectedField="inEdit"
                    >
                       {false && <GridColumn
                            field="key"
                            title="key"
                        />}
                        <GridColumn
                            field="VUMAX_UNIT_ID"
                            title="WITSML Unit"
                        />
                        <GridColumn
                            field="WITSML_UNIT_ID"
                            title="VuMax Unit ID"
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
                                    <span onClick={e => this.cmdRemoveMapping(e, props.dataItem)}>
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
