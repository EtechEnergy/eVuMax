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
import { convertCompilerOptionsFromJson } from "typescript";

let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

export default class UnitMappings extends Component {

  
    state = {
        grdMapping: [] as any,
        
        selectedRow: {},
        editID: "",
       

    }

    UnitIDList: string[] = [];

   
    componentDidMount() {
        this.LoadUnitList();
    }

    handleChange = (objItem: any, fieldName: string) => {
        this.setState({
            [fieldName]: objItem.value
        });

        

    }

    grdRowClick = (event: any) => {
        this.setState({
            editID: event.dataItem.UnitID
        });
    };


    LoadUnitList = () => {
        //LoadUnitList
        try {
            debugger
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getTable";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT UNIT_ID FROM VMX_UNITS ORDER BY UNIT_NAME";
            objBrokerRequest.Parameters.push(objParameter);

            const axiosrequest1 = axios.get(_gMod._getData, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) },
            });





            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "UnitSetup";
            objBrokerRequest.Function = "LoadUnitConversionList";


            // objParameter.ParamName = "strSQL";
            // objParameter.ParamValue = "SELECT DISTINCT(RIG_NAME) FROM VMX_WELL WHERE RIG_NAME<>'' ORDER BY RIG_NAME";
            // objBrokerRequest.Parameters.push(objParameter);


            const axiosrequest2 = axios.get(_gMod._getData, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) },
            });



            axios.all([axiosrequest1, axiosrequest2]).then(axios.spread((...res) => {
                debugger;
                console.log(res[0]);
                console.log(res[1]);

                const objData = JSON.parse(res[0].data.Response);

                for (let index = 0; index < objData.length; index++) {
                    const objItem: any = objData[index];
                    this.UnitIDList.push(objItem.UNIT_ID);
                }
                //this.UnitIDList = Object.values(objData);


                const objData2 = JSON.parse(res[1].data.Response);

                this.setState({
                    grdConversion: Object.values(objData2.unitConversions)
                })

            }));



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
                        let UnitList = this.state.grdMapping;
                        let objRow = rowData;
                        let SrNo = objRow.SrNo;// MNEMONIC;
                        let index = UnitList.findIndex((d: any) => d.SrNo === SrNo); //find index in your array
                        UnitList.splice(index, 1);//remove element from array
                        this.setState({
                            grdMapping: UnitList
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
                        data={this.state.grdMapping != null ? (this.state.grdMapping.map((item: any) =>
                            ({ ...item, inEdit: item.ConversionID === this.state.editID })
                        )) : null}
                        onRowClick={this.grdRowClick}
                        //editField="inEdit"
                        selectedField="inEdit"
                    >
                     
                        <GridColumn
                            field="ConversionID"
                            title="WITSML Unit"
                        />
                        <GridColumn
                            field="FromUnitID"
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
