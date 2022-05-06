import axios from "axios";
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ComboBox, Dialog, DialogActionsBar, DropDownList, Input, Label } from '@progress/kendo-react-all';
import { Grid, GridToolbar, GridColumn } from '@progress/kendo-react-grid';
import React, { Component } from 'react'
import { confirmAlert } from 'react-confirm-alert';
import BrokerParameter from '../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../broker/BrokerRequest';
import GlobalMod from '../../../../objects/global';
import { comboData } from "../../../../eVuMaxObjects/UIObjects/comboData";
import * as utilFunctions from "../../../../utilFunctions/utilFunctions";


let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

export default class UnitConversionProfile extends Component {

    // Conversions:
    // 1:
    // ConversionFormula: ""
    // ConversionID: ""
    // FromUnitID: "ft/hr"
    // ToUnitID: "M/HR"
    // [[Prototype]]: Object
    // [[Prototype]]: Object
    // ProfileID: "702_424_913_514_163"
    // ProfileName: "ROP"
    state = {
        grdConversionProfile: [] as any,
        grdConversions: [] as any,
        ShowProfileEditor: false,
        selectedRow: {},
        editID: "",
        editID2: "",
        // ConversionID: "",
        // FromUnitID: "",
        // ToUnitID: "",
        // ConversionFormula: "",
        objProfile: {} as any,
        UnitIDList: [] = [new comboData()],
        // ProfileName: ""

    }

    //UnitIDList: comboData[] = [];


    cmdAddConversion = async () => {
        try {
            debugger;

            let maxID = Math.max(...this.state.grdConversions.map(o => o.ConversionID));
            if (maxID == -Infinity) {
                maxID = 0;
            }
            let newData = this.state.grdConversions;
            let objConversion: any = { ConversionFormula: "", ConversionID: maxID + 1, FromUnitID: "%", ToUnitID: "%" };
            newData.push(objConversion);

            this.setState({
                grdConversions: newData,
                // FromUnitID: "",
                // ToUnitID: "",
                // ConversionFormula: "Unit ",

                editID2: "",
                // ConversionID: ""
            });

        } catch (error) {

        }


    }


    cmdAddProfile = async () => {
        try {
            debugger;

            // let maxID=Math.max(...this.state.grdConversions.map(o => o.ConversionID));
            // let newData = this.state.grdConversionProfile
            // let objProfile: any = { PROFILE_ID: "New", PROFILE_NAME: "New Profile" };
            // newData.push(objProfile);
            let newData = this.state.grdConversions;
            newData.length = 0;
            this.setState({
                grdConversions: newData,
                ShowProfileEditor: true,
                editID2: "",
                editID: "",
                // ConversionID: "",
                // FromUnitID: "",
                // ToUnitID: "",
                // ConversionFormula: "",
                ProfileName: "Add New"
            });

        } catch (error) {

        }

    }


    cmdEditProfile = async (event: any, rowData: any) => {
        try {
            debugger;


            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "UnitSetup";
            objBrokerRequest.Function = "LoadProfile";

            objParameter.ParamName = "ProfileID";
            objParameter.ParamValue = rowData.PROFILE_ID;
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

                    const objData = JSON.parse(res.data.Response);
                    debugger;
                    // Conversions:
                    // 1:
                    // ConversionFormula: ""
                    // ConversionID: ""
                    // FromUnitID: "ft/hr"
                    // ToUnitID: "M/HR"
                    // [[Prototype]]: Object
                    // [[Prototype]]: Object
                    // ProfileID: "702_424_913_514_163"
                    // ProfileName: "ROP"
                    let localProfile = objData;
                    localProfile.Conversions = Object.values(localProfile.Conversions);
                    for (let index = 0; index < localProfile.Conversions.length; index++) {
                        let objItem = localProfile.Conversions[index];
                        objItem.ConversionID = index + 1;

                    }
                    this.setState({
                        ShowProfileEditor: true,
                        objProfile: localProfile,
                        grdConversions: Object.values(localProfile.Conversions),
                        ProfileName: localProfile.ProfileName,
                        editID2: localProfile.ProfileID
                    });


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
    componentDidMount() {
        this.LoadProfileList();
    }

    handleChange = (objItem: any, fieldName: string) => {
        debugger;
        let newData: any = this.state.objProfile;
        newData[fieldName] = objItem.value;
        this.setState({
            // [fieldName]: objItem.value
            objProfile: newData
        });



    }

    grdRowClick = (event: any) => {
        this.setState({
            editID: event.dataItem.PROFILE_ID
        });
    };

    grdConversionRowClick = (event: any) => {
        this.setState({
            editID2: event.dataItem.ConversionID
        });
    };
    grdItemChange = (e: any) => {
        debugger;
        //pending
        e.dataItem[e.field] = e.value;
        this.setState({
            grdConversions: [...this.state.grdConversions]
        });

        let newData: any = Object.values([...this.state.grdConversions]);
        let index = newData.findIndex((item: any) => item.ConversionID === e.dataItem.ConversionID); // use unique value like ID
        newData[index][e.field] = e.value;
        this.setState({ grdConversions: newData })
    };

    SaveProfile = async () => {
        debugger;

        let objProfile: any = {};
        //objProfile = { ProfileID: "", ProfileName: "", Conversions: [] };
        objProfile = this.state.objProfile;
        let objConversionList: any[] = [];


        for (let index = 0; index < this.state.grdConversions.length; index++) {
            const objItem = this.state.grdConversions[index];
            let objConversion: any = { ConversionFormula: "", ConversionID: objItem.ConversionID, FromUnitID: objItem.FromUnitID, ToUnitID: objItem.ToUnitID };
            objConversionList.push(objConversion);
        }

        objProfile.Conversions = utilFunctions.convertMapToDictionaryJSON(objConversionList);


        let functionName = "";
        if (this.state.editID2 == "") {
            functionName = "AddUnitConversionProfile"
        }
        else {
            functionName = "EditUnitConversionProfile"
        }

        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "DataService";
        objBrokerRequest.Broker = "UnitSetup";
        objBrokerRequest.Function = functionName;



        objParameter = new BrokerParameter('objProfile', JSON.stringify(objProfile));
        objBrokerRequest.Parameters.push(objParameter);

        await axios.post(_gMod._performTask, {
            paramRequest: JSON.stringify(objBrokerRequest),
        })
            .then((response) => {


            })
            .catch((error) => {
                console.log(error);
            });

        this.LoadProfileList();
        this.setState({
            ShowProfileEditor: false,
        });
    }
    LoadProfileList = () => {
        //LoadUnitList


        try {
            debugger

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "UnitSetup";
            objBrokerRequest.Function = "LoadUnitConversionProfile";
            
            // objParameter.ParamName = "strSQL";
            // objParameter.ParamValue = "SELECT PROFILE_ID,PROFILE_NAME FROM VMX_UNIT_PROFILE_HEADER ORDER BY PROFILE_NAME";
            // objBrokerRequest.Parameters.push(objParameter);

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
            objBrokerRequest.Function = "LoadUnitList";


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

                //PROFILE_ID: "702_424_913_514_163"
                //PROFILE_NAME
                let grdConversionProfile = [];
                this.setState({
                    grdConversionProfile: objData
                })
                //

                debugger;

                const objData2 = JSON.parse(res[1].data.Response);
                let units = Object.values(objData2.units);
                let UnitIDList: comboData[] = [];
                for (let index = 0; index < units.length; index++) {
                    const objItem: any = units[index];
                    // UnitCategory: ""
                    // UnitID: "0.01 deg/ft"
                    // UnitName: "0.01 deg/ft"
                    let UnitCombo: comboData = new comboData("", "");
                    UnitCombo.id = objItem.UnitID;
                    UnitCombo.text = objItem.UnitName;

                    UnitIDList.push(UnitCombo);
                }
                if (UnitIDList.length > 0) {

                    this.setState({
                        UnitIDList: UnitIDList
                    });
                }
                console.log("UnitIDList", UnitIDList);

                // this.setState({
                //     grdConversion: Object.values(objData2.unitConversions)
                // })

            }));

            this.setState({
                ShowProfileEditor: false,
            });


        } catch (error) {

        }
    }


    cmdRemoveConversion = (event: any, rowData: any) => {

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
                        let newData = this.state.grdConversions;
                        let index = newData.findIndex((item: any) => item.ConversionID === objRow.ConversionID);

                        if (index > -1) {
                            newData.splice(index, 1);
                            this.setState({
                                grdConversions: newData
                            })
                        }




                    }

                },
                {
                    label: 'No',
                    onClick: () => null
                }
            ]
        });
    }


    cmdRemoveProfile = (event: any, rowData: any) => {

        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove this Profile?',
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
                        objBrokerRequest.Function = "RemoveUnitConversionProfile";


                        objParameter = new BrokerParameter('ProfileID', objRow.PROFILE_ID);
                        objBrokerRequest.Parameters.push(objParameter);

                        await axios.post(_gMod._performTask, {
                            paramRequest: JSON.stringify(objBrokerRequest),
                        })
                            .then((response) => {

                                let ProfileList = this.state.grdConversionProfile;
                                let ProfileID = objRow.PROFILE_ID;
                                let index = ProfileList.findIndex((d: any) => d.PROFILE_ID === ProfileID); //find index in your array
                                ProfileList.splice(index, 1);//remove element from array
                                this.setState({
                                    grdConversionProfile: ProfileList
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
                        data={this.state.grdConversionProfile != null ? (this.state.grdConversionProfile.map((item: any) =>
                            ({ ...item, inEdit: item.PROFILE_ID === this.state.editID })
                        )) : null}
                        onRowClick={this.grdRowClick}
                        //editField="inEdit"
                        selectedField="inEdit"
                    >
                        <GridToolbar>
                            <span>
                                <Button onClick={() => {
                                    {

                                        this.cmdAddProfile();
                                    }
                                }}  >Add</Button>
                            </span>
                        </GridToolbar>
                        <GridColumn
                            field="PROFILE_ID"
                            title="Profile ID"
                        />
                        <GridColumn
                            field="PROFILE_NAME"
                            title="Profile Name"
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
                                        this.cmdEditProfile(e, props.dataItem)}>
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
                                    <span onClick={e => this.cmdRemoveProfile(e, props.dataItem)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </span>

                                </td>
                            )}
                        />

                    </Grid>
                </div>

                {this.state.ShowProfileEditor && <Dialog
                    title="Unit Conversion Profile"
                    height={500}
                    width={700}
                    onClose={() => this.setState({ ShowProfileEditor: false })}
                >
                    <DialogActionsBar>
                        <Button
                            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
                            onClick={this.SaveProfile}
                        >   Save
                        </Button>
                        <Button
                            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
                            onClick={() => this.setState({ ShowProfileEditor: false })}
                        >
                            Cancel
                        </Button>
                    </DialogActionsBar>
                    <div className="col-12 p-2" >
                        <div className="row">
                            <Label className='mr-4' style={{ alignSelf: "flex-end" }}>Profile Name</Label>
                            <Input type="text"
                                //value={this.state.ProfileName}
                                value={this.state.objProfile.ProfileName}
                                onChange={(event) => this.handleChange(event, "ProfileName")}
                            ></Input>
                        </div>
                        <div className="row">
                            <Grid
                                data={this.state.grdConversions != null ? (this.state.grdConversions.map((item: any) =>
                                    ({ ...item, inEdit: item.ConversionID === this.state.editID2 })
                                )) : null}
                                onRowClick={this.grdConversionRowClick}
                                //editField="inEdit"
                                selectedField="inEdit"
                                onItemChange={this.grdItemChange}
                            >
                                <GridToolbar>
                                    <span>
                                        <Button onClick={() => {
                                            {

                                                this.cmdAddConversion();
                                            }
                                        }}  >Add</Button>
                                    </span>
                                </GridToolbar>

                                <GridColumn
                                    field="ConversionID"
                                    title="Conversion ID"
                                >
                                </GridColumn>
                                {/* <GridColumn
                                    field="FromUnitID"
                                    title="From Unit"
                                />
                                <GridColumn
                                    field="ToUnitID"
                                    title="To Unit"
                                /> */}
                                <GridColumn
                                    field="FromUnitID"
                                    title="From Unit"
                                    cell={props => {
                                        let index = this.state.UnitIDList.findIndex(

                                            item => item.id === props.dataItem[props.field]
                                        );
                                        debugger;
                                        return (
                                            <td className="text-center">
                                                <DropDownList
                                                    name="unitList"
                                                    label=""
                                                    data={this.state.UnitIDList}
                                                    textField="text"
                                                    dataItemKey="id"
                                                    value={this.state.UnitIDList[index]}
                                                    onChange={e => {
                                                        props.onChange({
                                                            dataItem: props.dataItem,
                                                            dataIndex: props.dataIndex,
                                                            field: props.field,
                                                            syntheticEvent: e.syntheticEvent,
                                                            value: e.value.id
                                                        });
                                                    }}
                                                />
                                            </td>
                                        );
                                    }}
                                />
                                <GridColumn
                                    field="ToUnitID"
                                    title="To Unit"
                                    cell={props => {
                                        let index = this.state.UnitIDList.findIndex(
                                            item => item.id === props.dataItem[props.field]
                                        );
                                        return (
                                            <td className="text-center">
                                                <DropDownList
                                                    name="unitList"
                                                    label=""
                                                    data={this.state.UnitIDList}
                                                    textField="text"
                                                    dataItemKey="id"
                                                    value={this.state.UnitIDList[index]}
                                                    onChange={e => {
                                                        props.onChange({
                                                            dataItem: props.dataItem,
                                                            dataIndex: props.dataIndex,
                                                            field: props.field,
                                                            syntheticEvent: e.syntheticEvent,
                                                            value: e.value.id
                                                        });
                                                    }}
                                                />
                                            </td>
                                        );
                                    }}
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
                                            <span onClick={e => this.cmdRemoveConversion(e, props.dataItem)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </span>

                                        </td>
                                    )}
                                />



                            </Grid>
                        </div>
                    </div>
                </Dialog>}

            </>
        )
    }
}
