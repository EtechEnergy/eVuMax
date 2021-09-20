import React, { Component } from "react";
import axios from "axios";
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { Dialog } from '@progress/kendo-react-all';
import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Input } from "@progress/kendo-react-inputs";


import * as DataObjects from "../../eVuMaxObjects/dataObjects/dataObjects";
import * as UI from '../../eVuMaxObjects/UIObjects/NodeTree';

import '../grid/active-well/active-well.css'
import '@progress/kendo-react-layout';
import GlobalMod from "../../objects/global";

import { confirmAlert } from "react-confirm-alert";

import MudLogLithologyEditor from "../MudLogComponents/mudLogLithologyEditor"

import { Guid } from "guid-typescript";

import { comboData } from "../../eVuMaxObjects/UIObjects/comboData";
import * as utilFunc from '../../utilFunctions/utilFunctions';

let _gMod = new GlobalMod();


let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");





export interface IProps {
    objMudLog: DataObjects.mudLog
    reloadTree: any
}

export default class MudLogEditor extends Component<IProps> {
    objMudLog: DataObjects.mudLog = new DataObjects.mudLog();
    objMudLog_clone: DataObjects.mudLog = new DataObjects.mudLog();
    mudLogRef: React.RefObject<any>;

    constructor(props: any) {
        super(props)
        this.mudLogRef = React.createRef();
        //this.productsRef.current.focus()
    }

    state = {
        objMudLod: this.props.objMudLog,

        currentIntervalID: "",
        showLithologyEditor: false,
        editID: {},
        LibraryList: [] as any[],
        LibraryID: new comboData(),

        grdIntervals: Object.values(this.props.objMudLog.intervals),
        grdImages: [] as any[],
        lithologies: [] as any,
        // mudLogID: this.props.objMudLog.mudLogID,
        // WellboreID: this.props.objMudLog.WellboreID,
        // Description: this.props.objMudLog.Description,
        // mudLogName: this.props.objMudLog.mudLogName,
        // WellID: this.props.objMudLog.WellID,
        // ServerKey: this.props.objMudLog.ServerKey,
        // WMLSURL: this.props.objMudLog.WMLSURL,
        // wmlpurl: this.props.objMudLog.wmlpurl,
        // LibID: this.props.objMudLog.LibID,




    }



    componentWillReceiveProps() {
        if (this.props.objMudLog.mudLogID == this.objMudLog.mudLogID) {
            return;
        }
        this.objMudLog_clone = this.props.objMudLog;
        this.objMudLog = this.props.objMudLog;
        this.setState({
            intervals: null, // Object.values(this.props.objTrajectory.trajectoryData),
        });

        this.displayData();
    }
    componentWillMount() {
        this.objMudLog = utilFunc.CopyObject(this.props.objMudLog);
        this.objMudLog_clone = utilFunc.CopyObject(this.objMudLog)
    }
    componentDidMount() {
        this.generateCombo();
        this.loadMudLog();
        this.displayData();
    }



    getLithoImageFromDB = async (wellID: string, wellboreID: string, mudLogID: string, intervalID: string, lithID: string) => {
        try {



            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getTable";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT *  FROM [VuMaxDR].[dbo].[VMX_MUD_LOG_LITHOLOGY] where WELL_ID='" + wellID + "' AND WELLBORE_ID= '" + wellboreID + "' AND MUD_LOG_ID= '" + mudLogID + "' AND INTERVAL_ID='" + intervalID + "' AND LITH_ID='" + lithID + "'";
            objBrokerRequest.Parameters.push(objParameter);

            const res = await axios.get(_gMod._getData, { params: { paramRequest: JSON.stringify(objBrokerRequest) }, });

            return await JSON.parse(res.data.Response)[0].IMAGE;
        } catch (error) {
            return "";

        }

    }

    loadMudLog = async () => {


        this.objMudLog.intervals = Object.values(this.props.objMudLog.intervals);


        let libID = this.objMudLog.LibID;
        for (let index = 0; index < this.objMudLog.intervals.length; index++) {
            const interval = this.objMudLog.intervals[index];

            if (Object.values(this.objMudLog.intervals[index].lithologies).length > 0) {
                this.objMudLog.intervals[index].lithologies = Object.values(this.objMudLog.intervals[index].lithologies);
                //Load image in lithologies from database as by default its coming "System.Drawing.Bitmap"
                let LithoList = this.objMudLog.intervals[index].lithologies;
                for (let j = 0; j < LithoList.length; j++) {

                    const objLithology = LithoList[j];
                    let image = await this.getLithoImageFromDB(this.objMudLog.WellID, this.objMudLog.WellboreID, this.objMudLog.mudLogID, interval.IntervalID, objLithology.lithID);

                    LithoList[j].Image = image;

                }
                this.objMudLog.intervals[index].lithologies = LithoList;
            }

        }


        if (this.objMudLog.intervals.length > 0) {
            if (this.objMudLog.intervals[0].lithologies.length > 0) {
                this.setState({
                    grdImages: this.objMudLog.intervals[0].lithologies
                });
            }

        }

        this.objMudLog_clone = this.objMudLog;
        //    console.log(this.objMudLog);
    }



    displayData = () => {

        let intervalID: string = "";
        if (this.state.objMudLod.intervals.length > 0) {
            this.setState({
                grdIntervals: this.state.objMudLod.intervals
            });

            intervalID = this.state.grdIntervals[0].IntervalID;
            //this.forceUpdate();
        }
    }

    updateLithologies = (save: boolean, newLitho: any) => {

        if (save) {
            //find the lethologies in intervals and update the lthologies
            //in grdIntervals

            //let index = this.objMudLog.intervals.findIndex(e => (e.IntervalID == this.state.currentIntervalID));
            let index = this.state.grdIntervals.findIndex(e => (e.IntervalID == this.state.currentIntervalID));
            if (index >= 0) {
                let edited = this.state.grdIntervals;
                edited[index].lithologies = newLitho;

                // this.objMudLog.intervals[index].lithologies = newLitho;
                //this.state.grdIntervals[index].lithologies = newLitho;

                this.setState({
                    grdImages: newLitho,
                    grdIntervals: edited
                });
            }
        }

        this.setState({
            showLithologyEditor: !this.state.showLithologyEditor
        });

    }
    //Nishant 10-06-2020
    cmdRemoveLithologyIntervals = (event: any, rowData: any) => {

        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        let intervals = this.state.grdIntervals;
                        let objRow = rowData;
                        let IntervalID = objRow.IntervalID;
                        let index = intervals.findIndex(d => d.IntervalID === IntervalID); //find index in your array
                        intervals.splice(index, 1);//remove element from array
                        this.setState({
                            intervals: intervals
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

    // const options = {
    //     title: 'Title',
    //     message: 'Message',
    //     buttons: [
    //       {
    //         label: 'Yes',
    //         onClick: () => alert('Click Yes')
    //       },
    //       {
    //         label: 'No',
    //         onClick: () => alert('Click No')
    //       }
    //     ],
    //     childrenElement: () => <div />,
    //     customUI: ({ onClose }) => <div>Custom UI</div>,
    //     closeOnEscape: true,
    //     closeOnClickOutside: true,
    //     willUnmount: () => {},
    //     afterClose: () => {}
    //     onClickOutside: () => {},
    //     onKeypressEscape: () => {}
    //   };

    //   confirmAlert(options);

    cmdSave_click = () => {

        if (this.state.grdIntervals.length == 0) {

            confirmAlert({
                //title: 'eVuMax',
                message: 'Please enter atleast one Intervel',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Ok',
                        onClick: () => {
                            //this.mudLogRef.current.focus()
                            return;
                        }
                    }]
            });
            return;
        }

        if (this.state.objMudLod.mudLogName == "") {
            confirmAlert({
                //title: 'eVuMax',
                message: 'Please enter the name of the log',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Ok',
                        onClick: () => {
                            this.mudLogRef.current.focus()
                            return;
                        }

                    }
                ]
            });
            return;
        }


        let objMudLod = new DataObjects.mudLog();


        objMudLod = this.objMudLog;
        // objMudLod.Description = this.state.Description;
        // objMudLod.mudLogName = this.state.mudLogName;
        // objMudLod.WMLSURL = this.state.WMLSURL;

        //convert grdIntervals into Map
        //Convert curve array to Map


        let newIntervals_: Map<string, DataObjects.mudLogInterval> = new Map();
        this.state.grdIntervals.forEach((objIntervals: DataObjects.mudLogInterval) => {
            let newLithologies: Map<string, DataObjects.mudLogLithology> = new Map();
            if (Object.values(objIntervals.lithologies).length > 0) {
                objIntervals.lithologies.forEach((objLitho: DataObjects.mudLogLithology) => {
                    objLitho.Image = objLitho.Image; //"data:image/jpeg;base64," + objLitho.Image;
                    newLithologies.set(objLitho.lithID, objLitho);
                });
                objIntervals.lithologies = utilFunc.convertMapToDictionaryJSON(newLithologies)
                // if (newLithologies.size > 0) {
                //     objIntervals.lithologies = utilFunc.convertMapToDictionaryJSON(newLithologies)
                // } else {
                //     objIntervals.lithologies = null;
                // }

            } else {
                objIntervals.lithologies = null;
            }
            newIntervals_.set(objIntervals.IntervalID, objIntervals);
        });

        objMudLod.intervals = utilFunc.convertMapToDictionaryJSON(newIntervals_);



        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "Well.Data.Objects";
        objBrokerRequest.Function = "UpdateMudLog";
        objBrokerRequest.Broker = "WellObjectManager";

        objParameter = new BrokerParameter('UserName', _gMod._userId);

        objBrokerRequest.Parameters.push(objParameter);


        objParameter = new BrokerParameter('Update', JSON.stringify(objMudLod));
        objBrokerRequest.Parameters.push(objParameter);

        axios.post(_gMod._performTask, {
            paramRequest: JSON.stringify(objBrokerRequest),
        }).then((response) => {
            this.props.reloadTree("showMudLogEditor", false);
        })
            .catch(function (error) {
                console.log(error);
            });
    }

    cmdCancel_click = () => {
        // this.objMudLog = utilFunc.CopyObject(this.objMudLog_clone);
        //
        // this.setState({
        //     objMudLod:  utilFunc.CopyObject(this.objMudLog_clone)
        // });
        // this.forceUpdate();
        // this.generateCombo();
        // this.loadMudLog();
        // this.displayData();

        //Nishant 24-09-2020
        this.props.reloadTree("showMudLogEditor", true);
    }

    handleChange = (event: any) => {
        let target = event.target;
        const value = target.value;
        const name = target.props ? target.props.name : target.name;
        let edited: any = this.state.objMudLod;
        edited[name] = value;
        this.setState({
            objMudLog: edited
        });
        //this.setState({ [event.nativeEvent.target.name]: event.value });
    }

    closeEdit = (event: any) => {
        if (event.target === event.currentTarget) {
            this.setState({ editID: null });
        }
    };

    //Nishant 01-07-2020
    addLithology = () => {


        let objInterval = new DataObjects.mudLogInterval();

        objInterval.IntervalID = Guid.create().toString();

        this.setState({
            currentIntervalID: objInterval.IntervalID
        });
        if (this.state.grdIntervals.length > 0) {
            objInterval.mdTop = this.state.grdIntervals[this.state.grdIntervals.length - 1].mdBottom;
        } else {
            objInterval.mdTop = 0;
        }
        let intervalList = this.state.grdIntervals;
        intervalList.push(objInterval);
        this.setState({
            grdIntervals: intervalList
        });



    }

    grdItemChange = (e: any) => {

        e.dataItem[e.field] = e.value;
        this.setState({
            intervals: [...this.state.grdIntervals]
        });

        let newData: any = Object.values([...this.state.grdIntervals]);
        let index = newData.findIndex((item: any) => item.IntervalID === e.dataItem.IntervalID); // use unique value like ID
        newData[index][e.field] = e.value;
        this.setState({ intervals: newData })

    };

    grdRowClick = (event: any) => {


        //find lethologies in this.state.intervals using intervalID
        //let intervalID = this.state.editID;
        let intervalID = event.dataItem.IntervalID;
        let index = this.state.grdIntervals.findIndex((item: any) => item.IntervalID === intervalID);
        if (index >= 0) {
            if (Object.values(this.state.grdIntervals[index].lithologies).length > 0) {
                let lithoList: DataObjects.mudLogLithology[] = Object.values(this.state.grdIntervals[index].lithologies);
                this.setState({
                    grdImages: lithoList
                });
            } else {
                this.setState({
                    grdImages: []
                });
            }
        } else {
            this.setState({
                grdImages: []
            });
        };

        this.setState({
            currentIntervalID: event.dataItem.IntervalID
        });

        //   this.setState({ selectedID: event.dataItem.IntervalID });

        this.setState({
            editID: {}
        });

    };

    grdRowDblClick = (event: any) => {

        this.setState({
            editID: event.dataItem.IntervalID
        });
    };


    cmdEditLithology_click = (e: any) => {


        if (this.state.currentIntervalID == "") {
            alert("Please Select Row to Edit");
            return;
        }

        this.setState({
            showLithologyEditor: !this.state.showLithologyEditor
        });
    }

    handleChangeDropDown = (event: any) => {

        this.setState({ [event.target.name]: event.value });
        this.setState({ LibraryID: new comboData(event.value.text, event.value.id) });

    }


    generateCombo = () => {
        try {


            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getTable";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT * FROM VMX_MUD_LOG_LITH_LIB ORDER BY LIB_NAME";
            objBrokerRequest.Parameters.push(objParameter);



            axios.get(_gMod._getData, {
                params: { paramRequest: JSON.stringify(objBrokerRequest) },
            })
                .then((res) => {

                    const objData = JSON.parse(res.data.Response);

                    let libraryList: any = [];
                    objData.forEach(function (value: any) {
                        let jobCombo: comboData = new comboData();
                        jobCombo.id = value.LIB_ID;
                        jobCombo.text = value.LIB_NAME;
                        libraryList.push(jobCombo);
                    });
                    this.setState({ LibraryList: libraryList });
                    console.log("libraty List", libraryList[0]);
                    if (libraryList.length > 0) {
                        this.setState({
                            LibraryID: libraryList[0]
                        });
                    }
                    this.setState({ isProcess: false })

                })
                .catch(function (error) {
                    console.log(error);
                });

        } catch (error) {

        }
    }

    render() {
        return (
            <>
                {/* <label>Time Log Editor</label> */}
                <div className="row" style={{ position: "sticky", top: "0", padding: "10px" }} >
                    <h2>Mud Log Editor</h2>
                </div>
                <div id="mainContainer_" style={{ height: '86vh', width: '70vw' }}>
                    <div className="row">

                    </div>
                    <div className="row">
                        <legend>

                            <span className="float-left">  <button hidden type="button" onClick={this.cmdSave_click} className="btn-custom btn-custom-primary mr-1">
                                Save</button>
                                <button type="button" onClick={this.cmdCancel_click} className="btn-custom btn-custom-primary ml-1">
                                    Cancel</button>
                            </span></legend>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="row pb-3 ml-3 row-lg-12 ">

                                <div className="col mr-5 ml-3">
                                    <Input
                                        name="mudLogName"
                                        // style={{ width: "100%" }}
                                        label="Log Name"
                                        pattern={"[A-Za-z]+"}
                                        minLength={2}
                                        required={true}
                                        value={this.state.objMudLod.mudLogName}
                                        onChange={this.handleChange}
                                        ref={this.mudLogRef}
                                    />
                                </div>
                            </div>

                            <div className="row pb-3 ml-3 row-lg-12 ">

                                <div className="col mr-5 ml-3">
                                    <Input
                                        name="Description"
                                        label="Description"
                                        pattern={"[A-Za-z]+"}
                                        minLength={2}
                                        required={true}
                                        value={this.state.objMudLod.Description}
                                        onChange={this.handleChange}
                                    //readOnly={true}
                                    />

                                </div>

                                <div className="col mr-5 ml-3">
                                    <Input
                                        name="WMLSURL"
                                        label="WMLS URL"
                                        pattern={"[A-Za-z]+"}
                                        minLength={2}
                                        value={this.state.objMudLod.WMLSURL}
                                        onChange={this.handleChange}

                                    />

                                </div>
                            </div>


                        </div>
                    </div>


                    <div className="row">
                        <div className="col">
                            <b>Lithology Intervals</b>
                        </div>

                        {/* <div className="col-5">

                            <DropDownList
                                name="LibraryID"
                                label='Lithology Library'
                                data={this.state.LibraryList}
                                textField="text"
                                dataItemKey="id"
                                value={this.state.LibraryID}
                                style={{ width: 200 }}
                                onChange={this.handleChangeDropDown}
                            />

                        </div> */}

                        {/* <div className="col">
                            <b>  Lithologies  </b>
                        </div> */}
                    </div>


                    <div className="row">
                        <div className="col-8">
                            <Grid
                                // style={{ height: '40vh', width: '40vw' }}
                                //data={this.state.grdChannels}
                                data={this.state.grdIntervals != null ? (this.state.grdIntervals.map((item: any) =>
                                    ({ ...item, inEdit: item.IntervalID === this.state.editID, selected: item.IntervalID === this.state.currentIntervalID })
                                )) : null}
                                resizable={true}
                                scrollable={"scrollable"}
                                sortable={true}
                                onItemChange={this.grdItemChange}
                                onRowClick={this.grdRowClick}
                                onRowDoubleClick={this.grdRowDblClick}
                                selectedField="selected"

                                editField="inEdit"
                            >

                                <GridToolbar>
                                    <div onClick={this.closeEdit}>
                                        <span>
                                            <button hidden className="btn-custom btn-custom-primary ml-1 mr-1" onClick={this.addLithology} >Add </button>
                                        </span>

                                    </div>
                                </GridToolbar>
                                {false && <Column width="10px" field="IntervalID" headerClassName="text-center" className="text-right" title="ID" editor="numeric" editable={false} />}
                                <Column width="100px" field="mdTop" headerClassName="text-center" editor="numeric" resizable={true} className="text-right" title="MD Top" editable={true} />
                                <Column width="150px" field="mdBottom" headerClassName="text-center" className="text-right" title="MD Bottom" editor="numeric" editable={true} />
                                {false && (<Column width="100px" field="tvdTop" headerClassName="text-center" className="text-right" title="TVD Top" editor="numeric" />)}
                                {false && (<Column width="150px" field="tvdBottom" headerClassName="text-center" className="text-right" title="TVD Bottom" editor="numeric" />)}
                                <Column width="150px" field="InterpretedLithology" headerClassName="text-center" className="text-right" title="Interpreted Lithology" editable={true} />
                                <Column width="300px" field="Description" headerClassName="text-center" className="text-right" title="Description" editable={true} />
                                <Column width="100px" title="Lithologies" resizable={false} minResizableWidth={50} headerClassName="text-center" reorderable={false}
                                    cell={props => (
                                        <td className="text-center">
                                            <span>
                                                {/* <img src={require("../../images/editLithology-24.png")} style={{ height: 20, width: 20 }}   /> */}
                                                {/* <Button onClick={this.cmdEditLithology_click}>
                                                    Click to Edit Lithology
                                          </Button> */}
                                                <td className="text-center">
                                                    <span onClick={e => this.cmdEditLithology_click(e)}>
                                                        <FontAwesomeIcon icon={faPen} />
                                                        {/* <img src={require("../../images/editLithology-24.png")} style={{ height: 20, width: 20 }} /> */}
                                                    </span>

                                                </td>
                                            </span>

                                        </td>)}
                                />
                                <Column width="70px" headerClassName="text-center" resizable={false}
                                    field="removeIntervals"
                                    title="*"
                                    cell={props => (
                                        <td className="text-center">
                                            <span onClick={e => this.cmdRemoveLithologyIntervals(e, props.dataItem)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </span>

                                        </td>
                                    )}
                                />

                            </Grid>

                        </div>

                        <div className="col-3">
                            <Grid
                                //style={{ width: '30vw' }}
                                data={this.state.grdImages}
                                //   data={this.state.intervals != null ? (this.state.intervals.map((item: any) =>
                                //       ({ ...item})
                                //   )) : null}
                                resizable={true}
                                scrollable={"scrollable"}
                                sortable={true}
                                // onItemChange={this.grdItemChange}
                                //  onRowClick={this.grdRowClick}
                                editField="inEdit"
                            >
                                <Column width="100px" field="lithType" headerClassName="text-center" className="text-right" title="lithology Type" editor="numeric" editable={true} />
                                {/* <Column width="100px" field="Image" headerClassName="text-center" editor="numeric" resizable={true} className="text-right" title="Image" editable={true}/> */}
                                <Column width="40px" field="Percentage" headerClassName="text-center" className="text-right" title="%" editor="numeric" />

                                <Column field="Image" width="100px" title="Image" resizable={false} minResizableWidth={50} headerClassName="text-center" reorderable={false}
                                    cell={props => (
                                        <td className="text-center">
                                            {/* <img src={props.dataItem.Image} style={{ height: 30, width: 30 }} /> */}
                                            <img
                                                style={{ width: 40, height: 40 }}
                                                src={`data:image/jpeg;base64,${props.dataItem[props.field]}`}
                                            />
                                        </td>)}
                                />

                            </Grid>

                        </div>
                    </div>
                </div>

                {this.state.showLithologyEditor && (
                    //style={{ height: '100%', width: '500px', top: 0, left: 0 }}
                    <Dialog title={"Mud Log Interval Lithologies"}
                        onClose={(e: any) => {
                            this.setState({
                                showLithologyEditor: false
                            })
                        }}
                    // modal={true}
                    >
                        <div className="row" >
                            <div className="col-9">
                                <MudLogLithologyEditor objMudLogLithology={this.state.grdImages} updateLithologies={this.updateLithologies} LibID={this.props.objMudLog.LibID} IntervalID={this.state.currentIntervalID}></MudLogLithologyEditor>
                            </div>

                        </div>

                    </Dialog>
                )}
            </>
        )
    }




}
