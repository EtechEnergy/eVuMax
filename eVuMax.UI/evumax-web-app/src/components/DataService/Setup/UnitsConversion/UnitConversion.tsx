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

    // UnitCategory: ""
    // UnitID: "0.01 deg/ft"
    // UnitName: "0.01 deg/ft"
    state = {
        grdConversion: [] as any,
        ShowUnitEditor: true,
        selectedRow: {},
        editID: "",
        FromUnit: "",
        ToUnit: "",
        Conversion: ""

    }

    UnitIDList: string[] = [];

    cmdEditUnit = async (event: any, rowData: any) => {
        try {

            this.setState({
                UnitCategory: rowData.UnitCategory,
                UnitID: rowData.UnitID,
                UnitName: rowData.UnitName,
                ShowUnitEditor: true,
                editID: rowData.UnitID

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


    SaveUnitConversion = () => {
        debugger;
        let newData: any =this.UnitIDList;
        let index = newData.findIndex((item: any) => item === this.state.FromUnit); // use unique value like ID
        if (index <= 0) {
            alert("Please select Unit form the list");
            return;
        }
        let index1 = newData.findIndex((item: any) => item === this.state.ToUnit); // use unique value like ID
        if (index1 <= 0) {
            alert("Please select Unit form the list");
            return;
        }
       
      
        //this.setState({ grdConversion: newData })



        let objUnit = { UnitID: "", UnitName: "", UnitCategory: "" };
        // objUnit.UnitID = this.state.UnitID;
        // objUnit.UnitName = this.state.UnitName;
        // objUnit.UnitCategory = this.state.UnitCategory;


        this.setState({
            grdUnit: this.state.grdConversion.map((item: any) => {
                debugger;
                if (this.state.editID === item.conversionID) {
                    item = { ...objUnit };
                }
                return item;
            }),
            ShowUnitEditor: false,
            editID: ""
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
                        let UnitList = this.state.grdConversion;
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
                                value={this.state.FromUnit}
                                onChange={(e: any) => { this.handleChange(e, "FromUnit") }}
                                allowCustom={true}
                            />
                        </div>      <div className="row">
                            <Label className='mr-4' style={{ alignSelf: "flex-end" }}>To Unit</Label>
                            <ComboBox
                                style={{ width: "200px" }}
                                data={this.UnitIDList}
                                value={this.state.ToUnit}

                                onChange={(e: any) => { this.handleChange(e, "ToUnit") }}
                                allowCustom={true}
                                
                            />
                        </div>

                        <div className="row">
                            <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Conversion Formula</Label>
                            <Input type="text"
                                value={this.state.Conversion}
                                onChange={(event) => this.handleChange(event, "Conversion")}
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
