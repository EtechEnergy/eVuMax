import { Button, Dialog, DropDownList, Grid, GridColumn, GridSelectionChangeEvent, Label } from '@progress/kendo-react-all'
import { Checkbox } from '@progress/kendo-react-inputs';
import React, { Component } from 'react'
import BrokerParameter from '../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../broker/BrokerRequest';
import { comboData } from '../../../../eVuMaxObjects/UIObjects/comboData';
import GlobalMod from '../../../../objects/global';
import axios from "axios";
import NotifyMe from 'react-notification-timeline';
import { confirmAlert } from 'react-confirm-alert';



let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("", "");


let cmbVuMaxType: comboData[] = [];
let cmbTagSource: comboData[] = [];
let cmbPhaseList: comboData[] = [];
let cmbStepList: comboData[] = [];
let cmbEmphList: comboData[] = [];
export default class PhaseMappingMgr extends Component {

    //Broker: KPIPhaseTagMapping
    //Module: DataService
    //Function:
    //  "addMapping";
    //  "removeMapping";
    //  "loadDrillingTagsList";
    //  "loadCustomTagsList";


    // EMPH_ID: "897_107_378_333_941"
    // EMPH_NAME: "Run 1"
    // ENTRY_ID: 13953218
    // PHASE_ID: "468_525_808_644_204"
    // PHASE_NAME: "Intermediate"
    // STEP_ID: "477_456_134_718_678"
    // STEP_NAME: "Trip Out"
    // VUMAX_EVENT_TYPE: "TRIP"

    state = {
        VuMaxType: new comboData(),
        ShowCustomTags: false,
        grdData: [],
        selectedEntryID: "",
        selectedRow: "" as any,
        showEditor: false,
        cmbTagSource: new comboData(),
        cmbPhase: new comboData(),
        cmbStep: new comboData(),
        cmbEmph: new comboData(),
        warningMsg: [],

    }


    generateTagSourceCombo = () => {
        try {

            this.clearAllComboSelection();
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Common";
            objBrokerRequest.Broker = "Common.Functions";
            objBrokerRequest.Function = "getTable";


            let strSQL: string = "SELECT * FROM VMX_TAG_SOURCES ORDER BY SOURCE_NAME";
            //SOURCE_NAME
            //NOTES

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = strSQL
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
                    cmbTagSource.length = 0;
                    cmbPhaseList.length = 0;
                    cmbTagSource.push(new comboData("**** Drilling ****", "-999"));
                    if (objData.length > 0) {

                        for (let index = 0; index < objData.length; index++) {
                            const objTag: any = objData[index];
                            cmbTagSource.push(new comboData(objTag.SOURCE_NAME, objTag.SOURCE_ID));
                        }



                    }

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
    generateVuMaxTypeCombo = async () => {
        try {
            debugger;
            cmbVuMaxType.length = 0;
            cmbVuMaxType.push(new comboData("Trip", "TRIP"));
            cmbVuMaxType.push(new comboData("Cased Hole Trip", "CASED_HOLE_TRIP"));
            cmbVuMaxType.push(new comboData("Open Hole Trip", "OPEN_HOLE_TRIP"));
            cmbVuMaxType.push(new comboData("Clean-Up Cycle", "CUC"));
            cmbVuMaxType.push(new comboData("Drilling", "DRILLING"));
            cmbVuMaxType.push(new comboData("Casing Run", "CASING"));
            cmbVuMaxType.push(new comboData("Trip Surface Time", "SURFACE_TIME"));

            await this.setState({
                VuMaxType: cmbVuMaxType[0]
            });

            this.refreshList();

        } catch (error) {

        }
    }

    componentDidMount(): void {
        try {
            this.generateVuMaxTypeCombo();
            this.generateTagSourceCombo();
        } catch (error) {

        }
    }

    clearAllComboSelection = () => {
        try {
            this.setState({
                cmbPhase: new comboData(),
                cmbStep: new comboData(),
                cmbEmph: new comboData(),
            })

        } catch (error) {

        }
    }

    refreshList = () => {
        try {

            let functionName = "";
            if (this.state.ShowCustomTags == true) {
                functionName = "loadCustomTagsList";
            } else {
                functionName = "loadDrillingTagsList";
            }


            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "KPIPhaseTagMapping";
            objBrokerRequest.Function = functionName;




            objParameter = new BrokerParameter("VuMaxType", this.state.VuMaxType.id);
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

                    debugger;
                    const objData = JSON.parse(res.data.Response);


                    if (objData.length > 0) {
                        this.setState({
                            grdData: objData,
                        });
                    }

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


    handleChangeDropDownVuMaxType = async (event: any) => {
        try {
            await this.setState({
                VuMaxType: event.value
            });

            this.refreshList();

        } catch (error) {

        }
    }

    grdRowClick = (event: GridSelectionChangeEvent) => {
        try {

            let objRow: any;
            objRow = event.dataItem;


            this.setState({
                selectedEntryID: event.dataItem.ENTRY_ID,
                selectedRow: objRow
            });

        } catch (error) {

        }
    }

    removeMapping = () => {
        try {

            if (this.state.selectedEntryID == "") {
                confirmAlert({
                    //title: 'eVuMax',
                    message: 'Please Select Mapping from the list',
                    childrenElement: () => <div />,
                    buttons: [
                        {
                            label: 'Ok',
                            // onClick: async () => {}
                            onClick: () => null

                        },
                        // {
                        //     label: 'No',
                        //     onClick: () => null
                        // }
                    ]
                });
                return;
            }
            confirmAlert({
                //title: 'eVuMax',
                message: 'Are you sure to removing selected mapping?',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Yes',
                        // onClick: async () => {}
                        onClick: () => {
                            objBrokerRequest = new BrokerRequest();
                            objBrokerRequest.Module = "DataService";
                            objBrokerRequest.Broker = "KPIPhaseTagMapping";
                            objBrokerRequest.Function = "removeMapping";




                            objParameter = new BrokerParameter('EntryID', this.state.selectedEntryID);

                            objBrokerRequest.Parameters.push(objParameter);

                            axios.post(_gMod._performTask, {
                                paramRequest: JSON.stringify(objBrokerRequest),
                            })
                                .then(async (response) => {

                                    //let objRes = JSON.parse(response.data);
                                    //alert(objRes.Warnings);
                                    this.setState({
                                        showEditor: false,
                                        editMode: ""
                                    });

                                    await this.refreshList();
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

            // EMPH_ID: "Surface"
            // EMPH_NAME: "Surface"
            // ENTRY_ID: 19144724
            // PHASE_ID: "Surface Hole"
            // PHASE_NAME: "Surface Hole"
            // STEP_ID: "Casing"
            // STEP_NAME: "Casing"
            // VUMAX_EVENT_TYPE: "TRIP"
            // selected: false






        } catch (error) {

        }
    }

    saveMapping = () => {
        try {

            // if(this.state.VuMaxType.id == ""){

            // }

            if (this.state.cmbTagSource.id == "") {
                confirmAlert({
                    //title: 'eVuMax',
                    message: 'Please Select Tag Source from the list',
                    childrenElement: () => <div />,
                    buttons: [
                        {
                            label: 'Ok',
                            onClick: () => null

                        },

                    ]
                });
                return;

            }
            debugger;
            if (this.state.cmbPhase.id == "") {
                confirmAlert({
                    //title: 'eVuMax',
                    message: 'Please Select Phase from the list',
                    childrenElement: () => <div />,
                    buttons: [
                        {
                            label: 'Ok',
                            // onClick: async () => {}
                            onClick: () => null

                        },
                        // {
                        //     label: 'No',
                        //     onClick: () => null
                        // }
                    ]
                });
                return;
            }

            if (this.state.cmbStep.id == "") {
                confirmAlert({
                    //title: 'eVuMax',
                    message: 'Please Select Step from the list',
                    childrenElement: () => <div />,
                    buttons: [
                        {
                            label: 'Ok',
                            // onClick: async () => {}
                            onClick: () => null

                        },
                        // {
                        //     label: 'No',
                        //     onClick: () => null
                        // }
                    ]
                });
                return;

            }

            if (this.state.cmbEmph.id == "") {
                confirmAlert({
                    //title: 'eVuMax',
                    message: 'Please Select Emphasis from the list',
                    childrenElement: () => <div />,
                    buttons: [
                        {
                            label: 'Ok',
                            // onClick: async () => {}
                            onClick: () => null

                        },
                        // {
                        //     label: 'No',
                        //     onClick: () => null
                        // }
                    ]
                });
                return;
            }



            this.setState({ showEditor: false });
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "KPIPhaseTagMapping";
            objBrokerRequest.Function = "addMapping";

            // VuMaxType = paramRequest.Parameters.Where(x => x.ParamName.Contains("VuMaxType")).FirstOrDefault().ParamValue.ToString();
            // PhaseID = paramRequest.Parameters.Where(x => x.ParamName.Contains("PhaseID")).FirstOrDefault().ParamValue.ToString();
            // StepID = paramRequest.Parameters.Where(x => x.ParamName.Contains("StepID")).FirstOrDefault().ParamValue.ToString();
            // EmphID = paramRequest.Parameters.Where(x => x.ParamName.Contains("EmphID")).FirstOrDefault().ParamValue.ToString();

            objParameter = new BrokerParameter('VuMaxType', this.state.VuMaxType.id);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter('PhaseID', this.state.cmbPhase.id);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter('StepID', this.state.cmbStep.id);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter('EmphID', this.state.cmbEmph.id);
            objBrokerRequest.Parameters.push(objParameter);



            axios.get(_gMod._performTask, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) },

            })
                .then(async (response) => {

                    debugger;
                    let objResp = response.data;
                    let warnings = objResp.Warnings;

                    if (warnings.trim() != "") {
                        let warningList = [];
                        if (objResp.Error != "") {
                            warningList.push({ "update": objResp.Errors, "timestamp": new Date(Date.now()).getTime() });
                        }
                        warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
                        this.setState({
                            warningMsg: warningList
                        });
                    }


                    this.setState({
                        showEditor: false,
                        editMode: "",

                    });

                    await this.refreshList();
                })
                .catch((error) => {
                    console.log(error);
                });

        } catch (error) {

        }
    }

    generateStepCombo = () => {
        try {
            debugger;

            let strSQL = "";
            if (this.state.cmbTagSource.id == "-999") {
                strSQL = "SELECT STEP_ID,STEP_NAME FROM VMX_STEP_MASTER WHERE PHASE_ID='" + this.state.cmbPhase.id + "' ORDER BY STEP_NAME";
            } else {
                strSQL = "SELECT TAG_SUB_CATEGORY_ID AS STEP_ID,SUB_CATEGORY_NAME AS STEP_NAME FROM VMX_CUSTOM_TAG_SUB_CATEGORY_MASTER WHERE TAG_CATEGORY_ID='" + this.state.cmbPhase.id + "' AND SOURCE_ID='" + this.state.cmbTagSource.id + "' ORDER BY SUB_CATEGORY_NAME"
            }

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Common";
            objBrokerRequest.Broker = "Common.Functions";
            objBrokerRequest.Function = "getTable";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = strSQL
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
                    cmbStepList.length = 0;

                    if (objData.length > 0) {

                        for (let index = 0; index < objData.length; index++) {
                            const objTag: any = objData[index];
                            cmbStepList.push(new comboData(objTag.STEP_NAME, objTag.STEP_ID));
                        }
                    }

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
    generatePhaseCombo = () => {
        try {
            debugger;
            alert(this.state.cmbPhase.id);
            let strSQL = "";
            if (this.state.cmbTagSource.id == "-999") {
                strSQL = "SELECT PHASE_ID,PHASE_NAME FROM VMX_PHASE_MASTER ORDER BY PHASE_NAME";
            } else {
                strSQL = "SELECT TAG_CATEGORY_ID AS PHASE_ID,CATEGORY_NAME AS PHASE_NAME FROM VMX_CUSTOM_TAG_CATEGORY_MASTER WHERE SOURCE_ID='" + this.state.cmbTagSource.id + "' ORDER BY CATEGORY_NAME"
            }

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Common";
            objBrokerRequest.Broker = "Common.Functions";
            objBrokerRequest.Function = "getTable";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = strSQL
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
                    cmbPhaseList.length = 0;
                    cmbStepList.length = 0;

                    if (objData.length > 0) {

                        for (let index = 0; index < objData.length; index++) {
                            const objTag: any = objData[index];
                            cmbPhaseList.push(new comboData(objTag.PHASE_NAME, objTag.PHASE_ID));
                        }
                    }

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


    generateEmphCombo = () => {
        try {
            debugger;
            let strSQL = "";
            if (this.state.cmbTagSource.id == "-999") {
                strSQL = "SELECT EMPH_ID,EMPH_NAME FROM VMX_EMPH_MASTER WHERE PHASE_ID='" + this.state.cmbPhase.id + "' AND STEP_ID='" + this.state.cmbStep.id + "' ORDER BY EMPH_NAME";
            } else {
                strSQL = "SELECT TAG_ACTIVITY_ID AS EMPH_ID,ACTIVITY_NAME AS EMPH_NAME FROM VMX_CUSTOM_TAG_ACTIVITY_MASTER WHERE TAG_CATEGORY_ID='" + this.state.cmbPhase.id + "' AND TAG_SUB_CATEGORY_ID='" + this.state.cmbStep.id + "' AND SOURCE_ID='" + this.state.cmbTagSource.id + "' ORDER BY ACTIVITY_NAME"
            }

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Common";
            objBrokerRequest.Broker = "Common.Functions";
            objBrokerRequest.Function = "getTable";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = strSQL
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
                    cmbEmphList.length = 0;

                    if (objData.length > 0) {

                        for (let index = 0; index < objData.length; index++) {
                            const objTag: any = objData[index];
                            cmbEmphList.push(new comboData(objTag.EMPH_NAME, objTag.EMPH_ID));
                        }
                    }

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
            <div className=''>
                <div className="form-inline m-1" style={{ float: 'right' }}>




                    <NotifyMe
                        data={this.state.warningMsg}
                        storageKey='notific_key'
                        notific_key='timestamp'
                        notific_value='update'
                        heading='Warnings'
                        sortedByKey={false}
                        showDate={false}
                        size={24}
                        color="yellow"
                    />

                </div>
                {this.state.showEditor && <Dialog title={"Select Tag"} height={250} width={700}


                    onClose={() => { this.setState({ showEditor: false }) }}
                >
                    <div className="row mt-3">
                        <div className="col-8">
                            <div className="row mb-1"><Label style={{ width: "100px", alignSelf: "self-end" }} className="float-left">Tag Source</Label>    <DropDownList
                                label='select Source Tag'
                                data={cmbTagSource}
                                textField="text"
                                dataItemKey="id"
                                value={this.state.cmbTagSource}
                                style={{ width: 200 }}

                                onChange={async (e) => {

                                    await this.clearAllComboSelection();

                                    await this.setState({
                                        cmbTagSource: e.value,
                                    });

                                    this.generatePhaseCombo();
                                }}

                            // onChange={(event) => {


                            //     this.handleChangeDropDown(event, "selectedMainWell", "FilterMainWellID");
                            //     //this.setState({"selectedMainWell" : new comboData(event.value.text, event.value.id)});

                            // }}
                            /></div>
                            <div className="row mb-1"><Label style={{ width: "100px", alignSelf: "self-end" }} className="float-left">Phase</Label>
                                <DropDownList
                                    label=''
                                    data={cmbPhaseList}
                                    textField="text"
                                    dataItemKey="id"
                                    value={this.state.cmbPhase}
                                    style={{ width: 200 }}

                                    onChange={async (event) => {
                                        // alert(event.value.id);

                                        await this.setState({
                                            cmbPhase: new comboData(event.value.text, event.value.id)
                                        });
                                        alert(this.state.cmbPhase.id);
                                        this.generateStepCombo();

                                    }}
                                /></div>
                            <div className="row mb-1"><Label style={{ width: "100px", alignSelf: "self-end" }} className="float-left">Step</Label>    <DropDownList

                                label=''
                                data={cmbStepList}
                                textField="text"
                                dataItemKey="id"
                                value={this.state.cmbStep}
                                style={{ width: 200 }}


                                onChange={async (event) => {
                                    debugger;
                                    await this.setState({ cmbStep: new comboData(event.value.text, event.value.id), cmbEmph: new comboData() });
                                    this.generateEmphCombo();

                                }}
                            /></div>
                            <div className="row mb-1"><Label style={{ width: "100px", alignSelf: "self-end" }} className="float-left">Emphasis</Label>
                                <DropDownList

                                    label=''
                                    data={cmbEmphList}
                                    textField="text"
                                    dataItemKey="id"
                                    value={this.state.cmbEmph}
                                    style={{ width: 200 }}

                                    onChange={async (event) => {

                                        await this.setState({ cmbEmph: new comboData(event.value.text, event.value.id) });


                                    }}
                                /></div>
                        </div>
                        <div className="col-4">
                            <Button
                                style={{ width: "150px" }}
                                className="ml-5 mr-3 mb-3"
                                id="cmdSave"
                                onClick={this.saveMapping}
                            >
                                Save
                            </Button>
                            <br />
                            <Button
                                style={{ width: "150px" }}
                                className="ml-5 mr-3 mb-5"

                                onClick={() => {

                                    this.setState({ showEditor: false });
                                }}
                            >
                                Cancel
                            </Button>
                        </div>

                    </div>
                </Dialog>}
                <div className="row">
                    <div className="col-3">
                        <Label className="float-left">Vumax Type</Label>
                        <DropDownList
                            name="cmbVuMaxType"
                            label=''
                            data={cmbVuMaxType}
                            textField="text"
                            dataItemKey="id"
                            value={this.state.VuMaxType}
                            style={{ width: 200 }}

                            onChange={(event) => {

                                this.handleChangeDropDownVuMaxType(event);

                            }}
                        />
                    </div>
                    <div className="col-4">
                        <Checkbox
                            name="chkCustomTags"
                            className="mr-3 ml-3"
                            label={"Coustom Tags"}
                            checked={this.state.ShowCustomTags}

                            onChange={async (event) => {

                                await this.setState({
                                    ShowCustomTags: event.value
                                });

                                this.refreshList();

                            }}
                        />
                    </div>

                </div>
                <div className="row ml-2 mt-5"><Label>List of phase tags mapped to this VuMax type</Label></div>
                <div className="row">
                    <div className="col-7 mt-3"> <Grid

                        selectedField="selected"

                        data={
                            this.state.grdData != null ? this.state.grdData.map((item: any) => ({
                                ...item,
                                selected: item.ENTRY_ID === this.state.selectedEntryID,
                            }))
                                : null
                        }
                        onRowClick={this.grdRowClick}
                    >

                        {true && <GridColumn
                            field="VUMAX_EVENT_TYPE"
                            title="VuMax Event Type"

                        />}

                        {false && <GridColumn
                            field="ENTRY_ID"
                            title="ENTRY ID"

                        />}
                        {false && <GridColumn
                            field="PHASE_ID"
                            title="PHASE_ID"

                        />}
                        <GridColumn
                            field="PHASE_NAME"
                            title="Phase Name"

                        />
                        {false && <GridColumn
                            field="STEP_ID"
                            title="STEP_ID"

                        />}
                        <GridColumn
                            field="STEP_NAME"
                            title="Step Name"

                        />

                        {false && <GridColumn
                            field="EMPH_ID"
                            title="EMPH_ID"

                        />}
                        <GridColumn
                            field="EMPH_NAME"
                            title="Emphasis Name"

                        />





                    </Grid></div>
                    <div className="col-4 mt-3">
                        <Button
                            style={{ width: "150px" }}
                            className="ml-5 mr-3 mb-3"
                            id="cmdClose"
                            onClick={() => {


                                this.setState({
                                    showEditor: true
                                })

                            }}
                        >
                            Add Mapping
                        </Button>
                        <br />
                        <Button
                            style={{ width: "150px" }}
                            className="ml-5 mr-3 mb-5"
                            id="cmdClose"
                            // onClick={() => {

                            //     this.ClosePanel();
                            // }}
                            onClick={this.removeMapping}
                        >
                            Remove Mapping
                        </Button>
                        <br />


                    </div>
                </div>

            </div>
        )
    }
}
