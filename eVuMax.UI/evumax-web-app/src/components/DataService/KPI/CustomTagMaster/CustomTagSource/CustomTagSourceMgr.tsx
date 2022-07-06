import { Button, Dialog, Grid, GridColumn, GridSelectionChangeEvent, Input } from '@progress/kendo-react-all';
import React, { Component } from 'react'
import axios from "axios";
import BrokerRequest from "../../../../../broker/BrokerRequest";
import BrokerParameter from "../../../../../broker/BrokerParameter";
import GlobalMod from '../../../../../objects/global';
import * as utilFunc from '../../../../../utilFunctions/utilFunctions';
import { confirmAlert } from 'react-confirm-alert';
import { TextArea } from '@progress/kendo-react-inputs';


let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("", "");


export class clsTagSource {
    public SourceID: string = "";
    public SourceName: string = "";
    public Notes: string = "";
}


export default class CustomTagSourceMgr extends Component {

    state = {
        objTagSource: new clsTagSource(),
        editMode: "",
        showEditor: false,
        grdData: [] as any,
        sourceID: "",

    }

    componentDidMount(): void {
        try {
            this.loadList();
        } catch (error) {

        }
    }

    loadList = () => {
        try {


            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Common";
            objBrokerRequest.Broker = "Common.Functions";
            objBrokerRequest.Function = "getTable";


            let strSQL: string = "SELECT * FROM [VMX_TAG_SOURCES] ORDER BY SOURCE_NAME";
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


    removeSource = () => {
        try {



            confirmAlert({
                //title: 'eVuMax',
                message: 'Please Select Tag Source from the list',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Yes',
                        // onClick: async () => {}
                        onClick: () => {
                            objBrokerRequest = new BrokerRequest();
                            objBrokerRequest.Module = "DataService";
                            objBrokerRequest.Function = "removeSource";
                            objBrokerRequest.Broker = "KPICustomTagMaster";

                            let localTagSource: clsTagSource = new clsTagSource();
                            localTagSource = utilFunc.CopyObject(this.state.objTagSource);


                            objParameter = new BrokerParameter('objTagSource', JSON.stringify(localTagSource));

                            objBrokerRequest.Parameters.push(objParameter);

                            axios.post(_gMod._performTask, {
                                paramRequest: JSON.stringify(objBrokerRequest),
                            })
                                .then(async (response) => {

                                    
                                    let objRes = JSON.parse(response.data);
                                    //alert(objRes.Warnings);
                                    this.setState({
                                        showEditor: false,
                                        editMode: ""
                                    });

                                    await this.loadList();
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







        } catch (error) {

        }
    }
    editSource = () => {
        try {

            if (this.state.sourceID == "") {

                confirmAlert({
                    //title: 'eVuMax',
                    message: 'Please Select Tag Source from the list',
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
            this.setState({
                showEditor: true,
                editMode: "E"
            });

        } catch (error) {

        }
    }

    addSource = () => {
        try {

            this.setState({
                showEditor: true,
                editMode: "A",
                objTagSource: new clsTagSource(),
                sourceID: ""
            });



        } catch (error) {

        }
    }


    saveSource = () => {
        try {

            if (this.state.objTagSource.SourceName == "") {

                confirmAlert({
                    //title: 'eVuMax',
                    message: 'Please enter Source Name',
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

            this.setState({
                showEditor: true
            });

            let FunctionName: string = "";
            if (this.state.editMode == "A") {
                FunctionName = "addSource";
            }

            if (this.state.editMode == "E") {
                FunctionName = "editSource";
            }


            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Function = FunctionName;
            objBrokerRequest.Broker = "KPICustomTagMaster";

            let localTagSource: clsTagSource = new clsTagSource();
            localTagSource = utilFunc.CopyObject(this.state.objTagSource);


            objParameter = new BrokerParameter('objTagSource', JSON.stringify(localTagSource));

            objBrokerRequest.Parameters.push(objParameter);

            axios.post(_gMod._performTask, {
                paramRequest: JSON.stringify(objBrokerRequest),
            })
                .then(async (response) => {

                    let objRes = JSON.parse(response.data);
                    //alert(objRes.Warnings);
                    this.setState({
                        showEditor: false,
                        editMode: ""
                    });

                    await this.loadList();
                })
                .catch((error) => {
                    console.log(error);
                });


        } catch (error) {

        }
    }

    grdRowClick = (event: GridSelectionChangeEvent) => {
        try {

            let objTagSource: clsTagSource = new clsTagSource();
            objTagSource.SourceID = event.dataItem.SOURCE_ID;
            objTagSource.SourceName = event.dataItem.SOURCE_NAME;
            objTagSource.Notes = event.dataItem.NOTES;

            this.setState({
                sourceID: event.dataItem.SOURCE_ID,
                objTagSource: objTagSource
            });

        } catch (error) {

        }
    }

    handleChange = (event: any, field: string) => {


        const value = event.value;

        const name = field; // target.props ? target.props.name : target.name;
        let edited: any = utilFunc.CopyObject(this.state.objTagSource);
        edited[field] = value;
        this.setState({
            objTagSource: edited
        });

    };

    render() {
        return (
            <>
                <div>Custom Tag Source Master</div>
                <div className="row">
                    <div className="col-6">
                        <Grid
                            //   data={this.state.Data}
                            selectedField="selected"
                            //data={this.state.grdChannels}
                            data={
                                this.state.grdData != null ? this.state.grdData.map((item: any) => ({
                                    ...item,
                                    selected: item.SOURCE_ID === this.state.sourceID,
                                }))
                                    : null
                            }
                            onRowClick={this.grdRowClick}

                        >


                            {false && <GridColumn
                                title="Source ID"
                                field='SOURCE_ID'
                            />}
                            <GridColumn
                                title="Source Name"
                                field='SOURCE_NAME'
                            />

                            <GridColumn
                                title="Note"
                                field='NOTES'
                            />

                        </Grid>
                    </div>

                    <div className="col-6">
                        <Button className='p-2 m-2' style={{ width: "125px" }} onClick={this.addSource}  >
                            Add New
                        </Button>
                        <br />
                        <Button className='p-2 m-2' style={{ width: "125px" }} onClick={this.editSource} >
                            Edit
                        </Button>
                        <br />
                        <Button className='p-2 m-2' style={{ width: "125px" }} onClick={this.removeSource} >
                            Remove
                        </Button>

                    </div>

                </div>

                {this.state.showEditor && <Dialog title="Tag Source Editor"
                    width={"600px"}
                    height={"auto"}
                    onClose={(e: any) => {
                        this.setState({
                            showEditor: false,

                            EditMode: ""
                        })
                    }}
                >
                    <div className="row" style={{display:'block'}}>
                  
                            <label   className='mr-3 '>Source Name</label>
                           
                            <Input value={this.state.objTagSource.SourceName} onChange={(e) => { this.handleChange(e, "SourceName") }} ></Input>
                            <br></br>
                            <label className='mr-5' >Notes</label>
                            <TextArea style={{backgroundColor:"inherit"}} className='ml-2' value={this.state.objTagSource.Notes} onChange={(e) => { this.handleChange(e, "Notes") }} ></TextArea>
                      
                    </div>
                    <br></br>
                    <div className="row mt-3">
                        <Button className='mr-3' onClick={this.saveSource}>Save</Button>
                        <Button onClick={(e: any) => { this.setState({ showEditor: false, EditMode: "" }); }}>Cancel</Button>
                    </div>



                </Dialog>}

            </>
        )
    }
}

