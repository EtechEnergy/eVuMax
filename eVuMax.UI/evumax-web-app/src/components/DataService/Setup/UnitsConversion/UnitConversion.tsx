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

export default class UnitConversion extends Component {

    // ConversionFormula: "unit * 57.29578"
    // ConversionID: "cnv_185_183_804_307"
    // FromUnitID: "rad"
    // ToUnitID
    state = {
        grdConversion: [] as any,
        ShowUnitEditor: false,
        selectedRow: {},
        editID: "",
        FromUnitID: "",
        ToUnitID: "",
        ConversionFormula: "",
        ConversionID: ""

    }

    UnitIDList: string[] = [];


    cmdAdd = async () => {
        try {
            debugger;
            this.setState({
                FromUnitID: "",
                ToUnitID: "",
                ConversionFormula: "Unit ",
                ShowUnitEditor: true,
                editID: "",
                ConversionID: ""
            });

        } catch (error) {

        }

    }


    cmdEditUnit = async (event: any, rowData: any) => {
        try {
            debugger;
            this.setState({
                FromUnitID: rowData.FromUnitID,
                ToUnitID: rowData.ToUnitID,
                ConversionFormula: rowData.ConversionFormula,
                ShowUnitEditor: true,
                editID: rowData.ConversionID,
                ConversionID: rowData.ConversionID

            });

        } catch (error) {

        }

    }
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


    SaveUnitConversion = async () => {
        debugger;
        let newData: any = this.UnitIDList;
        let index = newData.findIndex((item: any) => item === this.state.FromUnitID); // use unique value like ID
        if (index <= 0) {
            alert("Please select Unit form the list");
            return;
        }
        let index1 = newData.findIndex((item: any) => item === this.state.ToUnitID); // use unique value like ID
        if (index1 <= 0) {
            alert("Please select Unit form the list");
            return;
        }


        let objUnitConversion = { ConversionFormula: "", ConversionID: "", FromUnitID: "", ToUnitID: "" };
        // ConversionFormula: "unit * 57.29578"
        // ConversionID: "cnv_185_183_804_307"
        // FromUnitID: "rad"
        // ToUnitID
        objUnitConversion.ConversionID = this.state.ConversionID;
        objUnitConversion.FromUnitID = this.state.FromUnitID;
        objUnitConversion.ToUnitID = this.state.ToUnitID;
        objUnitConversion.ConversionFormula = this.state.ConversionFormula;

        let functionName = "";
        if (this.state.ConversionID == "") {
            functionName = "AddUnitConversion"
        }
        else {
            functionName = "EditUnitConversion"
        }

        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "DataService";
        objBrokerRequest.Broker = "UnitSetup";
        objBrokerRequest.Function = functionName;



        objParameter = new BrokerParameter('objUnitConversion', JSON.stringify(objUnitConversion));
        objBrokerRequest.Parameters.push(objParameter);

        await axios.post(_gMod._performTask, {
            paramRequest: JSON.stringify(objBrokerRequest),
        })
            .then((response) => {

            })
            .catch((error) => {
                console.log(error);
            });



        this.setState({
            grdConversion: this.state.grdConversion.map((item: any) => {
                debugger;
                if (this.state.editID === item.conversionID) {
                    item = { ...objUnitConversion };
                }
                return item;
            }),
            ShowUnitEditor: false,
            editID: "",
            FromUnitID: "",
            ToUnitID: "",
            ConversionFormula: "",
            ConversionID: ""
        });





    }
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
                    onClick: async () => {
                        debugger;
                        let objRow = rowData;

                        objBrokerRequest = new BrokerRequest();
                        objBrokerRequest.Module = "DataService";
                        objBrokerRequest.Broker = "UnitSetup";
                        objBrokerRequest.Function = "RemoveUnitConversion";


                        objParameter = new BrokerParameter('ConversionID', objRow.ConversionID);
                        objBrokerRequest.Parameters.push(objParameter);

                        await axios.post(_gMod._performTask, {
                            paramRequest: JSON.stringify(objBrokerRequest),
                        })
                            .then((response) => {



                                let UnitConversionList = this.state.grdConversion;

                                let ConversionID = objRow.ConversionID;
                                let index = UnitConversionList.findIndex((d: any) => d.ConversionID === ConversionID); //find index in your array
                                UnitConversionList.splice(index, 1);//remove element from array
                                this.setState({
                                    grdConversion: UnitConversionList
                                });
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
    // ConversionFormula: "unit * 57.29578"
    // ConversionID: "cnv_185_183_804_307"
    // FromUnitID: "rad"
    // ToUnitID: 

    render() {
        return (
            <>
                <div className="col-6">
                    <Grid
                        data={this.state.grdConversion != null ? (this.state.grdConversion.map((item: any) =>
                            ({ ...item, inEdit: item.ConversionID === this.state.editID })
                        )) : null}
                        onRowClick={this.grdRowClick}
                        //editField="inEdit"
                        selectedField="inEdit"
                    >
                        <GridToolbar>
                            <span>
                                <Button onClick={() => {
                                    {

                                        this.cmdAdd();
                                    }
                                }}  >Add</Button>
                            </span>
                        </GridToolbar>
                        <GridColumn
                            field="ConversionID"
                            title="Conversion ID"
                        />
                        <GridColumn
                            field="FromUnitID"
                            title="From Unit"
                        />
                        <GridColumn
                            field="ToUnitID"
                            title="To Unit"
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
                                    <span onClick={e =>
                                        this.cmdEditUnit(e, props.dataItem)}>
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

                {this.state.ShowUnitEditor && <Dialog
                    title="Unit Conversion Properties"
                    height={350}
                    width={650}
                    onClose={() => this.setState({ ShowUnitEditor: false })}
                >
                    <DialogActionsBar>
                        <Button
                            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
                            onClick={this.SaveUnitConversion}
                        >   Save
                        </Button>
                        <Button
                            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
                            onClick={() => this.setState({ DialogUnit: false })}
                        >
                            Cancel
                        </Button>
                    </DialogActionsBar>
                    <div className="col-12 p-2" >
                        <div className="row">
                            <Label className='mr-4' style={{ alignSelf: "flex-end" }}>From Unit</Label>
                            <ComboBox
                                style={{ width: "200px" }}
                                data={this.UnitIDList}
                                value={this.state.FromUnitID}
                                onChange={(e: any) => { this.handleChange(e, "FromUnitID") }}
                                allowCustom={true}
                            />
                        </div>      <div className="row">
                            <Label className='mr-4' style={{ alignSelf: "flex-end" }}>To Unit</Label>
                            <ComboBox
                                style={{ width: "200px" }}
                                data={this.UnitIDList}
                                value={this.state.ToUnitID}

                                onChange={(e: any) => { this.handleChange(e, "ToUnitID") }}
                                allowCustom={true}

                            />
                        </div>

                        <div className="row">
                            <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Conversion Formula</Label>
                            <Input type="text"
                                value={this.state.ConversionFormula}
                                onChange={(event) => this.handleChange(event, "ConversionFormula")}
                            ></Input>
                        </div>
                        <div className="row mt-3">
                            <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Note: Use keyword <b>Unit</b> in the conversion formula to refer to source value</Label>
                        </div>
                        <div className="row">
                            <Label className='mr-4' style={{ alignSelf: "flex-end" }}>e.g. to convert Mtr. to Feet formul would be like below</Label>
                        </div>
                        <div className="row">
                            <Label className='mr-4' style={{ alignSelf: "flex-end", color: "Highlight", fontSize: "18px" }}>unit * 3.33</Label>
                        </div>
                    </div>
                </Dialog>}

            </>
        )
    }
}
