import React from "react";
import axios from "axios";
import { Grid, GridColumn as Column, GridColumn, GridToolbar } from '@progress/kendo-react-grid';
import { TabStrip, TabStripTab, Dialog, Window } from '@progress/kendo-react-all';
// Splitter, TreeView, processTreeViewItems, Menu, MenuItem, Popup, Window, Field, FormElement, DropDownList
import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPen, faCircle, faSearch, faUserPlus, faRemoveFormat, faRecycle, faAd, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Input, Checkbox, NumericTextBox } from "@progress/kendo-react-inputs";
import { filterBy } from "@progress/kendo-data-query";
import CustomLoader from "../loader/loader";
import wellselector from "../wellSelector/WellSelector";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

import * as utilFunc from '../../utilFunctions/utilFunctions';


import history from "../../history/history";



import * as DataObjects from "../../eVuMaxObjects/dataObjects/dataObjects";
import * as UI from '../../eVuMaxObjects/UIObjects/NodeTree';


//import '../wellObjectComponent/WellEditorCss.css';
// import 'bootstrap/dist/css/bootstrap.css';
// import '@progress/kendo-theme-default/dist/all.css';
import '@progress/kendo-react-layout';
import WellSelector from "../wellSelector/WellSelector";
import GlobalMod from "../../objects/global";
import { json } from "d3";

let _gMod = new GlobalMod();


let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");




export interface IProps {
    wellID: string | ""
    objWell: DataObjects.Well
    reloadTree: any
}

//Nishant 24-07-2020
class grdOffsetWell {
    WellID: string = "";
    WellUWI: string = "";
    WellName: string = "";
}


export default class WellEditor extends React.Component<IProps> {

    constructor(props: any) {
        super(props);

        this.wellID = utilFunc.CopyObject(this.props.wellID);//  JSON.parse(JSON.stringify( this.props.wellID));
        this.objWell = utilFunc.CopyObject(this.props.objWell);//   JSON.parse(JSON.stringify(this.props.objWell));
        this.objWell_clone = utilFunc.CopyObject(this.props.objWell); // JSON.parse(JSON.stringify(this.props.objWell));
    }
    objWell: DataObjects.Well = new DataObjects.Well();
    wellID: string | undefined = this.props.wellID;
    objWell_clone: DataObjects.Well = new DataObjects.Well();

    state = {

        objWell: utilFunc.CopyObject(this.props.objWell), //14-07-2020
        showWellSelector: false,
        showTimeLogEditor: true,
        showDownloadLogWindow: false,
        objNode: new UI.eVuMaxTreeNode,
        wellID: this.props.wellID, //'us_1395675560', //'ae1e7348-d98e-4083-bb0d-a7cad73bd37f',
        isLoaded: false,
        error: '',
        selected: 0,
        treeData: [new UI.eVuMaxTreeNode()],
        contextMenuShow: false,
        isParentSelected: false,
        contextMenuOffset: { left: 0, top: 0 },
        menuType: UI.enumNodeType.none,
        OffsetWells: [{ OFFSET_WELL_ID: "", OFFSET_WELL_UWI: "", WELL_NAME: "" }],
        grdOffsetWells: [] as grdOffsetWell[],

        // objectID: this.objWell.ObjectID,
        // name: this.objWell.name,
        // nameLegal: this.objWell.nameLegal,
        // numLicense: this.objWell.numLicense,
        // numGovt: this.objWell.numGovt,
        // dTimeLicense: this.objWell.dTimeLicense,
        // field: this.objWell.field,
        // country: this.objWell.country,
        // county: this.objWell.county,
        // state: this.objWell.state,
        // region: this.objWell.region,
        // district: this.objWell.district,
        // block: this.objWell.block,
        // timeZone: this.objWell.timeZone,
        // operatorName: this.objWell.operatorName,
        // operatorDiv: this.objWell.operatorDiv,
        // pcInterest: this.objWell.pcInterest,
        // numAPI: this.objWell.numAPI,
        // statusWell: this.objWell.statusWell,
        // purposeWell: this.objWell.purposeWell,
        // dTimSpud: this.objWell.dTimSpud,
        // dTimPa: this.objWell.dTimPa,
        // wellheadElevation: this.objWell.wellheadElevation,
        // groundElevation: this.objWell.groundElevation,
        // waterDepth: this.objWell.waterDepth,
        // latitude: this.objWell.latitude,
        // longitude: this.objWell.longitude,
        // xCoOrd: this.objWell.xCoOrd,
        // yCoOrd: this.objWell.yCoOrd,
        // dtmPermanent: this.objWell.dtmPermanent,
        // wmlsurl: this.objWell.wmlsurl,
        // wmlpurl: this.objWell.wmlpurl,
        // RigName: this.objWell.RigName,
        // EDRProvider: this.objWell.EDRProvider,
        // DataSource: this.objWell.DataSource,
        // DrillingSupr: this.objWell.DrillingSupr,
        // DrillingEng: this.objWell.DrillingEng,
        // Historical: this.objWell.Historical,
        // wellDateFormat: this.objWell.wellDateFormat,



        // SEC: this.objWell.SEC,
        // TWP: this.objWell.TWP,
        // RGE: this.objWell.RGE,
        // LegalDesc: this.objWell.LegalDesc,
        // ContType: this.objWell.ContType,
        // RigType: this.objWell.RigType,
        // Pump1Model: this.objWell.Pump1Model,
        // Pump1Stroke: this.objWell.Pump1Stroke,
        // Pump1Liner: this.objWell.Pump1Liner,
        // Pump2Model: this.objWell.Pump2Model,
        // Pump2Stroke: this.objWell.Pump2Stroke,
        // Pump2Liner: this.objWell.Pump2Liner,
        // Pump3Model: this.objWell.Pump3Stroke,
        // Pump3Stroke: this.objWell.Pump3Stroke,
        // Pump3Liner: this.objWell.Pump3Liner,
        // Rep: this.objWell.Rep,
        // ToolPusher: this.objWell.ToolPusher,
        // TightHoleNo: this.objWell.TightHoleNo,
        // ReEntryNo: this.objWell.ReEntryNo,
        // Comments: this.objWell.Comments,
        // Contractor: this.objWell.Contractor,
        // Objective: this.objWell.Objective,
        // TDDate: this.objWell.TDDate,
        // TDFormation: this.objWell.TDFormation,
        // Pump1: this.objWell.Pump1,
        // Pump2: this.objWell.Pump2,
        // Pump3: this.objWell.Pump3,


        // //Benchmarks
        // RigCost: this.objWell.RigCost,
        // PlannedDays: this.objWell.PlannedDays,

        // DrlgConnTime: this.objWell.DrlgConnTime,
        // TripConnTime: this.objWell.TripConnTime,
        // BottomToSlips: this.objWell.BTSTime,
        // TripInSpeed: this.objWell.TripInSpeed,
        // TripOutSpeed: this.objWell.TripOutSpeed,
        // SlipsToSlips: this.objWell.STSTime,
        // SlipsToBottom: this.objWell.STBTime,

    }

    initialize = () => {
        this.wellID = utilFunc.CopyObject(this.props.wellID);
        this.objWell = utilFunc.CopyObject(this.props.objWell);
        this.objWell_clone = utilFunc.CopyObject(this.props.objWell);
        this.setState({
            objWell: utilFunc.CopyObject(this.props.objWell)
        });
        this.loadOffsetWells();
        // this.setWellState();
    }

    componentWillReceiveProps() {
        this.initialize();
        // this.wellID = this.props.wellID;
        // this.objWell = this.props.objWell;
        // this.objWell_clone = this.props.objWell;
        // this.loadOffsetWells();
        // this.setWellState();
    }


    componentDidMount() {
        // this.wellID = this.props.wellID;
        // this.objWell = this.props.objWell;
        this.loadOffsetWells();
        this.setWellState();
    }

    //Nishant 10-06-2020
    cmdRemoveOffsetWell = (event: any, rowData: any) => {

        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        let offSetWells = this.state.grdOffsetWells;
                        let index = offSetWells.findIndex(d => d.WellID === rowData.WellID); //find index in your array
                        offSetWells.splice(index, 1);//remove element from array
                        this.setState({
                            //OffsetWells: offSetWells,
                            grdOffsetWells: offSetWells
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
    addOffsetWells = (paramWellList: any) => {
        try {

            if (paramWellList == false) {
                //do nothing

            }
            this.setState({
                showWellSelector: !this.state.showWellSelector
            });

            if (paramWellList.length > 0) {
                let offsetWellList = this.state.OffsetWells;
                //new code
                let grdOffsetWellList = this.state.grdOffsetWells;

                //[{ OFFSET_WELL_ID: "", OFFSET_WELL_UWI: "", WELL_NAME: "" }],
                for (let i = 0; i < paramWellList.length; i++) {


                    let wellID = paramWellList[i].split("~")[0];
                    let wellName = paramWellList[i].split("~")[1];

                    let index = this.state.OffsetWells.findIndex(x => x.OFFSET_WELL_ID === wellID);

                    if (index < 0) {
                        // let offsetWell: any = { OFFSET_WELL_ID: "", OFFSET_WELL_UWI: "", WELL_NAME: "" };
                        // offsetWell["OFFSET_WELL_ID"] = wellID;
                        // offsetWell["OFFSET_WELL_UWI"] = "";
                        // offsetWell["WELL_NAME"] = wellName;
                        // offsetWellList.push(offsetWell);

                        //New code:
                        let objgrdOffsetWell: grdOffsetWell = new grdOffsetWell();
                        objgrdOffsetWell.WellID = wellID;
                        objgrdOffsetWell.WellUWI = "";
                        objgrdOffsetWell.WellName = wellName;
                        grdOffsetWellList.push(objgrdOffsetWell);
                    }
                }
                this.setState({ OffsetWells: offsetWellList });
                //New code
                this.setState({ grdOffsetWells: grdOffsetWellList });
            }

        } catch (error) {

        }
    }

    loadOffsetWells = () => {
        try {

            console.clear();
            console.log(this.objWell.offsetWells);
            // //Load offset Wells with Well Name
            // //
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getOffSetWells";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = 'wellID';
            objParameter.ParamValue = this.objWell.ObjectID;  //this.state.wellID ? (this.state.wellID == undefined || this.state.wellID == "", "", this.state.wellID) : "";
            objBrokerRequest.Parameters.push(objParameter);

            axios
                .get(_gMod._getData, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json;charset=UTF-8'
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) }
                },
                )
                .then((res) => {

                    const objData = JSON.parse(res.data.Response);
                    this.setState({ isProcess: false });
                    //   OffsetWells: [{OFFSET_WELL_ID:"",OFFSET_WELL_UWI:"",WELL_NAME:""}],
                    //OFFSET_WELL_ID: "f2c06e1b-fd2f-48ae-a34b-3aca016ccd95"
                    //OFFSET_WELL_UWI: ""
                    //WELL_NAME: "Well 14"
                    let offsetWellList: grdOffsetWell[] = [];

                    objData.forEach((objRow: any) => {
                        let objgrdOffsetWell: grdOffsetWell = new grdOffsetWell();
                        objgrdOffsetWell.WellID = objRow["OFFSET_WELL_ID"];
                        objgrdOffsetWell.WellUWI = objRow["OFFSET_WELL_UWI"];
                        objgrdOffsetWell.WellName = objRow["WELL_NAME"];
                        offsetWellList.push(objgrdOffsetWell);
                    });

                    this.setState({ OffsetWells: objData });
                    this.setState({ grdOffsetWells: offsetWellList });
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
                    this.setState({ isProcess: false })
                });
        } catch (error) {

        }
    }



    handleChange = (event: any, field: string) => {

        //this.setState({ [event.nativeEvent.target.name]: event.value });
        //New Changes: 14-07-2020
        // let target = event.target;
        //const value = target.type === 'checkbox' ? target.checked : target.value;
        const value = event.value;

        const name = field; // target.props ? target.props.name : target.name;
        let edited: any = utilFunc.CopyObject(this.state.objWell);
        edited[field] = value;
        this.setState({
            objWell: edited
        });

    };




    cmdSave_click = () => {




        //        let testMap: Map<string, DataObjects.OffsetWell> = new Map();
        this.objWell = this.state.objWell;
        let offSetWellList: string[] = [];
        this.state.OffsetWells.forEach(item => {
            let objOffsetWell = new DataObjects.OffsetWell();
            objOffsetWell.OffsetWellID = item.OFFSET_WELL_ID;
            offSetWellList.push(item.OFFSET_WELL_ID);
            //  testMap.set(objOffsetWell.OffsetWellID, objOffsetWell);
        });

        //New code
        //save offsetWells to Map object
        let newOffsetWells: Map<string, DataObjects.OffsetWell> = new Map();
        this.state.grdOffsetWells.forEach(item => {
            let objOffsetWell = new DataObjects.OffsetWell();
            objOffsetWell.OffsetWellID = item.WellID;
            newOffsetWells.set(objOffsetWell.OffsetWellID, objOffsetWell);
        });

        this.objWell.offsetWells = utilFunc.convertMapToDictionaryJSON(newOffsetWells);
        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "Well.Data.Objects";
        objBrokerRequest.Function = "UpdateWell";
        objBrokerRequest.Broker = "WellObjectManager";

        objParameter = new BrokerParameter('UserName', _gMod._userId);

        objBrokerRequest.Parameters.push(objParameter);

        // let jsonObject:any={};
        // jsonObject = utilFunc.convertMapToDictionaryJSON(testMap);

        this.objWell.offsetWells = utilFunc.convertMapToDictionaryJSON(newOffsetWells);; // defined as offsetWells: OffsetWell[] = [];


        this.objWell.wellbores = null;
        this.objWell.__objRemarksLog = null;

        objParameter = new BrokerParameter('Update', JSON.stringify(this.objWell));

        objBrokerRequest.Parameters.push(objParameter);


        objParameter = new BrokerParameter('offSetWellList', JSON.stringify(offSetWellList));

        objBrokerRequest.Parameters.push(objParameter);

        // axios.post(_gMod._performTask, {
        //     paramRequest: JSON.stringify(objBrokerRequest),
        // })
        //     .then((response) => {
        //         this.props.reloadTree("showWellEditor", false);
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //     });


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
                this.props.reloadTree("showWellEditor", false);
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

    }

    cmdCancel_click = () => {
        try {
            //
            // this.objWell = this.objWell_clone;
            // this.setState({
            //     objWell: this.objWell_clone
            // });

            // this.loadOffsetWells();
            // //this.setWellState();

            // this.forceUpdate();

            //Nishant 24-09-2020
            this.props.reloadTree("showWellEditor", true);


        } catch (error) {

        }

    }

    cmdAddOffsetWell_click = () => {

        this.setState({
            showWellSelector: !this.state.showWellSelector
        });



    }

    //Splitter Control
    onLayoutChange = (updatedState: any) => {
        this.setState({
            panes: updatedState
        });
    }

    //Treeview Control
    onExpandChange = (event: any) => {
        event.item.expanded = !event.item.expanded;
        this.state.isParentSelected = false;
        //this.forceUpdate();
    }

    //Tabsrip control
    handleTabSelect = (e: any) => {
        this.setState({ selected: e.selected });
    }

    setWellState = () => {
        try {
            this.setState({

                objWell: this.objWell,
                objectID: this.objWell.ObjectID,
                // name: this.objWell.name,
                // nameLegal: this.objWell.nameLegal,
                // numLicense: this.objWell.numLicense,
                // numGovt: this.objWell.numGovt,
                // dTimeLicense: this.state.dTimeLicense,
                // field: this.objWell.field,
                // country: this.objWell.country,
                // county: this.objWell.county,
                // state: this.objWell.state,
                // region: this.objWell.region,
                // district: this.objWell.district,
                // block: this.objWell.block,
                // timeZone: this.objWell.timeZone,
                // operatorName: this.objWell.operatorName,
                // operatorDiv: this.objWell.operatorDiv,
                // pcInterest: this.objWell.pcInterest,
                // numAPI: this.objWell.numAPI,
                // statusWell: this.objWell.statusWell,
                // purposeWell: this.objWell.purposeWell,
                // dTimSpud: this.objWell.dTimSpud,
                // dTimPa: this.objWell.dTimPa,
                // wellheadElevation: this.objWell.wellheadElevation,
                // groundElevation: this.objWell.groundElevation,
                // waterDepth: this.objWell.waterDepth,
                // latitude: this.objWell.latitude,
                // longitude: this.objWell.longitude,
                // xCoOrd: this.objWell.xCoOrd,
                // yCoOrd: this.objWell.yCoOrd,
                // dtmPermanent: this.objWell.dtmPermanent,
                // wmlsurl: this.objWell.wmlsurl,
                // wmlpurl: this.objWell.wmlpurl,
                // RigName: this.objWell.RigName,
                // EDRProvider: this.objWell.EDRProvider,
                // DataSource: this.objWell.DataSource,
                // DrillingSupr: this.objWell.DrillingSupr,
                // DrillingEng: this.objWell.DrillingEng,
                // Historical: this.objWell.Historical,
                // wellDateFormat: this.objWell.wellDateFormat,



                // SEC: this.objWell.SEC,
                // TWP: this.objWell.TWP,
                // RGE: this.objWell.RGE,
                // LegalDesc: this.objWell.LegalDesc,
                // ContType: this.objWell.ContType,
                // RigType: this.objWell.RigType,
                // Pump1Model: this.objWell.Pump1Model,
                // Pump1Stroke: this.objWell.Pump1Stroke,
                // Pump1Liner: this.objWell.Pump1Liner,
                // Pump2Model: this.objWell.Pump2Model,
                // Pump2Stroke: this.objWell.Pump2Stroke,
                // Pump2Liner: this.objWell.Pump2Liner,
                // Pump3Model: this.objWell.Pump3Stroke,
                // Pump3Stroke: this.objWell.Pump3Stroke,
                // Pump3Liner: this.objWell.Pump3Liner,
                // Rep: this.objWell.Rep,
                // ToolPusher: this.objWell.ToolPusher,
                // TightHoleNo: this.objWell.TightHoleNo,
                // ReEntryNo: this.objWell.ReEntryNo,
                // Comments: this.objWell.Comments,
                // Contractor: this.objWell.Contractor,
                // Objective: this.objWell.Objective,
                // TDDate: this.objWell.TDDate,
                // TDFormation: this.objWell.TDFormation,
                // Pump1: this.objWell.Pump1,
                // Pump2: this.objWell.Pump2,
                // Pump3: this.objWell.Pump3,
                // RigCost: this.objWell.RigCost,
                // DrlgConnTime: this.objWell.DrlgConnTime,
                // TripConnTime: this.objWell.TripConnTime,


            })
        } catch (error) {

        }
    }

    updateWellObject = () => {
        try {

            this.objWell = new DataObjects.Well(); //Nishant 10-06-2020

            // this.objWell.ObjectID = this.state.objectID;
            // this.objWell.name = this.state.name;
            // this.objWell.nameLegal = this.state.nameLegal;
            // this.objWell.numLicense = this.state.numLicense;
            // this.objWell.numGovt = this.state.numGovt;
            // this.objWell.dTimeLicense = this.state.dTimeLicense;
            // this.objWell.field = this.state.field;
            // this.objWell.country = this.state.country;
            // this.objWell.county = this.state.county;
            // this.objWell.state = this.state.state;
            // this.objWell.region = this.state.region;
            // this.objWell.district = this.state.district;
            // this.objWell.block = this.state.block;
            // this.objWell.timeZone = this.state.timeZone;
            // this.objWell.operatorName = this.state.operatorName;
            // this.objWell.operatorDiv = this.state.operatorDiv;
            // this.objWell.pcInterest = this.state.pcInterest;
            // this.objWell.numAPI = this.state.numAPI;
            // this.objWell.statusWell = this.state.statusWell;
            // this.objWell.purposeWell = this.state.purposeWell;
            // this.objWell.dTimSpud = this.state.dTimSpud;
            // this.objWell.dTimPa = this.state.dTimPa;
            // this.objWell.wellheadElevation = this.state.wellheadElevation;
            // this.objWell.groundElevation = this.state.groundElevation;
            // this.objWell.waterDepth = this.state.waterDepth;
            // this.objWell.latitude = this.state.latitude;
            // this.objWell.longitude = this.state.longitude;
            // this.objWell.xCoOrd = this.state.xCoOrd;
            // this.objWell.yCoOrd = this.state.yCoOrd;
            // this.objWell.dtmPermanent = this.state.dtmPermanent;
            // this.objWell.wmlsurl = this.state.wmlsurl;
            // this.objWell.wmlpurl = this.state.wmlpurl;
            // this.objWell.RigName = this.state.RigName;
            // this.objWell.EDRProvider = this.state.EDRProvider;
            // this.objWell.DataSource = this.state.DataSource;
            // this.objWell.DrillingSupr = this.state.DrillingSupr;
            // this.objWell.DrillingEng = this.state.DrillingEng;
            // this.objWell.Historical = this.state.Historical;




            // this.objWell.SEC = this.state.SEC;
            // this.objWell.TWP = this.state.TWP;
            // this.objWell.RGE = this.state.RGE;
            // this.objWell.LegalDesc = this.state.LegalDesc;
            // this.objWell.ContType = this.state.ContType;
            // this.objWell.RigType = this.state.RigType;
            // this.objWell.Pump1Model = this.state.Pump1Model;
            // this.objWell.Pump1Stroke = this.state.Pump1Stroke;
            // this.objWell.Pump1Liner = this.state.Pump1Liner;
            // this.objWell.Pump2Model = this.state.Pump2Model;
            // this.objWell.Pump2Stroke = this.state.Pump2Stroke;
            // this.objWell.Pump2Liner = this.state.Pump2Liner;
            // this.objWell.Pump3Model = this.state.Pump3Stroke;
            // this.objWell.Pump3Stroke = this.state.Pump3Stroke;
            // this.objWell.Pump3Liner = this.state.Pump3Liner;
            // this.objWell.Rep = this.state.Rep;
            // this.objWell.ToolPusher = this.state.ToolPusher;
            // this.objWell.TightHoleNo = this.state.TightHoleNo;
            // this.objWell.ReEntryNo = this.state.ReEntryNo;
            // this.objWell.Comments = this.state.Comments;
            // this.objWell.Contractor = this.state.Contractor;
            // this.objWell.Objective = this.state.Objective;
            // this.objWell.TDDate = this.state.TDDate;
            // this.objWell.TDFormation = this.state.TDFormation;



            // this.objWell.Pump1 = this.state.Pump1;
            // this.objWell.Pump2 = this.state.Pump2;
            // this.objWell.Pump3 = this.objWell.Pump3;



            // //benchmarks
            // this.objWell.RigCost = this.state.RigCost;
            // this.objWell.PlannedDays = this.state.PlannedDays;

            // this.objWell.DrlgConnTime = this.state.DrlgConnTime;
            // this.objWell.TripConnTime = this.state.TripConnTime;
            // this.objWell.BTSTime = this.state.BottomToSlips;
            // this.objWell.TripInSpeed = this.state.TripInSpeed;
            // this.objWell.TripOutSpeed = this.state.TripOutSpeed;
            // this.objWell.STSTime = this.state.SlipsToSlips;
            // this.objWell.STBTime = this.state.SlipsToBottom;


        } catch (error) {

        }
    }

    render() {
        let loader = this.state;
        return (
            <>
                {/* <label>Well Info</label> */}
                <div className="row" style={{ position: "sticky", top: "0", padding: "10px" }} >
                    <h2>Well Editor</h2>
                </div>
                <div id="mainContainer_" style={{ height: '86vh', width: '70vw' }}>

                    <div className="row">
                        <legend>
                            <span className="float-left mr-1" >  <button type="button" onClick={this.cmdSave_click} className="btn-custom btn-custom-primary ml-1 mr-1">
                                Save</button>
                                <button type="button" onClick={this.cmdCancel_click} className="btn-custom btn-custom-primary ml-1">
                                    Cancel</button>
                            </span></legend>

                    </div>

                    <div className="row">
                        <div id="mainContainer" style={{ minWidth: "100%" }}>
                            <TabStrip selected={this.state.selected} onSelect={this.handleTabSelect} keepTabsMounted={true}>
                                {/* <TabStrip selected={this.state.selected} onSelect={this.handleSelect} > */}
                                <TabStripTab title="Well Information">

                                    <div id="tabWellInfo1" style={{marginLeft:"23px"}}>
                                        {/*  */}
                                        <div className="row">
                                            <div className="col-md-6 col-lg-6 col-xl-6 col-xs-12">
                                                <div className="row pb-3">

                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="name"
                                                            // style={{ width: "100%" }}
                                                            label="Well Name"
                                                            pattern={"[A-Za-z]+"}
                                                            minLength={2}
                                                            required={true}
                                                            value={this.state.objWell.name}
                                                            validationMessage={"Please Enter Well Name"}
                                                            onChange={(e) => this.handleChange(e, "name")}
                                                        //onChange={this.handleChange, "name"}
                                                        />
                                                    </div>



                                                    <Input
                                                        name="numAPI"
                                                        // style={{ width: "100%" }}
                                                        label="API No"
                                                        minLength={2}
                                                        //onChange={this.handleChange,"numAPI"}
                                                        onChange={(e) => this.handleChange(e, "numAPI")}
                                                        value={this.state.objWell.numAPI}
                                                    />
                                                </div>

                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="nameLegal"
                                                            label="Legal Name"
                                                            value={this.state.objWell.nameLegal}
                                                            //onChange={this.handleChange,'nameLegal'}
                                                            onChange={(e) => this.handleChange(e, "nameLegal")}

                                                        />
                                                    </div>
                                                    <Input
                                                        name="operatorName"
                                                        label="Operator Name"
                                                        value={this.state.objWell.operatorName}
                                                        //onChange={this.handleChange,'operatorName'}
                                                        onChange={(e) => this.handleChange(e, "operatorName")}
                                                        minLength={2}
                                                    />
                                                </div>

                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="RigName"
                                                            label="Rig Name"
                                                            value={this.state.objWell.RigName}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "RigName")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="operatorDiv"
                                                        // style={{ width: "100%" }}
                                                        label="Operator Div."
                                                        value={this.state.objWell.operatorDiv}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "operatorDiv")}
                                                    />
                                                </div>

                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="field"
                                                            label="Field"
                                                            value={this.state.objWell.field}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "field")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="statusWell"
                                                        // style={{ width: "100%" }}
                                                        label="Well Status"
                                                        minLength={2}
                                                        value={this.state.objWell.statusWell}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "statusWell")}
                                                    />
                                                </div>

                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="block"
                                                            label="Block"
                                                            value={this.state.objWell.block}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "block")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="purposeWell"
                                                        // style={{ width: "100%" }}
                                                        label="Well Purpose"
                                                        minLength={2}
                                                        value={this.state.objWell.purposeWell}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "purposeWell")}
                                                    />

                                                </div>
                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="region"
                                                            label="Region"
                                                            value={this.state.objWell.region}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "region")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="dTimSpud"
                                                        // style={{ width: "100%" }}
                                                        label="Spud Date"
                                                        minLength={2}
                                                        value={this.state.objWell.dTimSpud}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "dTimeSpud")}
                                                    />

                                                </div>

                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="district"
                                                            label="District"
                                                            value={this.state.objWell.district}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "district")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="dtmPermanent"
                                                        // style={{ width: "100%" }}
                                                        label="Perm. Datum"
                                                        minLength={2}
                                                        value={this.state.objWell.dtmPermanent}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "dtmPermanent")}
                                                    />

                                                </div>

                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="county"
                                                            label="County"
                                                            value={this.state.objWell.county}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "county")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="wellheadElevation"
                                                        // style={{ width: "100%" }}
                                                        label="Well head Elevation"
                                                        minLength={2}
                                                        value={this.state.objWell.wellheadElevation}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "wellheadElevation")}
                                                    />

                                                </div>

                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="state"
                                                            label="State"
                                                            value={this.state.objWell.state}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "state")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="groundElevation"
                                                        // style={{ width: "100%" }}
                                                        label="Ground Elevation"
                                                        minLength={2}
                                                        value={this.state.objWell.groundElevation}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "groundElevation")}
                                                    />

                                                </div>
                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="country"
                                                            label="Country"
                                                            value={this.state.objWell.country}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "country")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="waterDepth"
                                                        // style={{ width: "100%" }}
                                                        label="Water Depth"
                                                        minLength={2}
                                                        value={this.state.objWell.waterDepth}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "waterDepth")}
                                                    />

                                                </div>




                                            </div>






                                            <div className="col-md-6 col-lg-6 col-xl-6 col-sm-6">
                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="timeZone"
                                                            label="Time Zone"
                                                            value={this.state.objWell.timeZone}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "timeZone")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="numLicense"
                                                        // style={{ width: "100%" }}
                                                        label="License No"
                                                        minLength={2}
                                                        value={this.state.objWell.numLicense}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "numLicense")}
                                                    />


                                                </div>



                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="latitude"
                                                            label="Latitude"
                                                            value={this.state.objWell.latitude}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "latitude")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="longitude"
                                                        // style={{ width: "100%" }}
                                                        label="Longitude"
                                                        minLength={2}
                                                        value={this.state.objWell.longitude}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "longitude")}
                                                    />
                                                </div>


                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="numGovt"
                                                            label="Govt Number"
                                                            value={this.state.objWell.numGovt}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "numGovt")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="dTimeLicense"
                                                        // style={{ width: "100%" }}
                                                        label="License Date"
                                                        minLength={2}
                                                        value={this.state.objWell.dTimeLicense}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "dTimeLicense")}
                                                    />
                                                </div>


                                                <div className="row pb-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="xCoOrd"
                                                            label="X Co-Ord"
                                                            value={this.state.objWell.xCoOrd}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "xCoOrd")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="yCoOrd"
                                                        // style={{ width: "100%" }}
                                                        label="Y Co-Ord"
                                                        minLength={2}
                                                        value={this.state.objWell.yCoOrd}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "yCoOrd")}
                                                    />
                                                </div>

                                                <div className="row pb-3 ">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="EDRProvider"
                                                            label="EDR Provider"
                                                            value={this.state.objWell.EDRProvider}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "EDRProvider")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="DataSource"
                                                        // style={{ width: "100%" }}
                                                        label="Data Source"
                                                        minLength={2}
                                                        value={this.state.objWell.DataSource}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "DataSource")}
                                                    />

                                                </div>



                                                <div className="row pb-3 ">
                                                    <div className="mr-5 ml-3 mt-5">
                                                        <Checkbox
                                                            name="Historical"
                                                            label='Historical Well'
                                                            checked={this.state.objWell.Historical}
                                                            // value={this.state.Historical}
                                                            //onChange={this.handleChange,'Historical'} />
                                                            onChange={(e) => this.handleChange(e, "Historical")}
                                                        />




                                                    </div>
                                                    <Input
                                                        name="wellDateFormat"
                                                        // style={{ width: "100%" }}
                                                        label="Well Date Format"
                                                        minLength={2}
                                                        value={this.state.objWell.wellDateFormat}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "wellDateFormat")}
                                                    />

                                                </div>

                                            </div>

                                        </div>


                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Well Information-2">
                                    <div id="tabWellInfo2">
                                        {/* Row1 */}
                                        <div className="row">
                                            <div className="col ml-1">
                                                <div className="row ml-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="SEC"
                                                            label="SEC"
                                                            value={this.state.objWell.SEC}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "SEC")}
                                                        />
                                                    </div>
                                                    <Input
                                                        name="Rep"
                                                        // style={{ width: "100%" }}
                                                        label="Company Representative"
                                                        minLength={2}
                                                        value={this.state.objWell.Rep}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "Rep")}
                                                    />


                                                    <div className="row ml-3">
                                                        <div className="mr-5 ml-3">
                                                            <Input
                                                                name="TWP"
                                                                // style={{ width: "100%" }}
                                                                label="TWP"
                                                                minLength={2}
                                                                value={this.state.objWell.TWP}
                                                                //onChange={this.handleChange}
                                                                onChange={(e) => this.handleChange(e, "TWP")}
                                                            />


                                                        </div>
                                                        <div className="mr-5">
                                                            <Input
                                                                name="ToolPusher"
                                                                // style={{ width: "100%" }}
                                                                label="Tool Pusher"
                                                                minLength={2}
                                                                value={this.state.objWell.ToolPusher}
                                                                //onChange={this.handleChange}
                                                                onChange={(e) => this.handleChange(e, "ToolPusher")}
                                                            />
                                                        </div>

                                                    </div>

                                                    <div className="row ml-3">
                                                        <div className="mr-5">
                                                            <Input
                                                                name="RGE"
                                                                // style={{ width: "100%" }}
                                                                label="RGE"
                                                                minLength={2}
                                                                value={this.state.objWell.RGE}
                                                                //onChange={this.handleChange}
                                                                onChange={(e) => this.handleChange(e, "RGE")}
                                                            />


                                                        </div>
                                                        <Input
                                                            name="TightHoleNo"
                                                            // style={{ width: "100%" }}
                                                            label="Tight Hole No"
                                                            minLength={2}
                                                            value={this.state.objWell.TightHoleNo}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "TightHoleNo")}
                                                        />
                                                    </div>

                                                    <div className="row ml-3">
                                                        <div className="mr-5 ml-3">
                                                            <Input
                                                                name="LegalDesc"
                                                                // style={{ width: "100%" }}
                                                                label="LegalDesc"
                                                                minLength={2}
                                                                value={this.state.objWell.LegalDesc}
                                                                //onChange={this.handleChange}
                                                                onChange={(e) => this.handleChange(e, "LegalDesc")}
                                                            />


                                                        </div>
                                                        <Input
                                                            name="ReEntryNo"
                                                            // style={{ width: "100%" }}
                                                            label="Re-Entry No"
                                                            minLength={2}
                                                            value={this.state.objWell.ReEntryNo}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "ReEntryNo")}
                                                        />
                                                    </div>

                                                    <div className="row ml-3">
                                                        <div className="mr-5">
                                                            <Input
                                                                name="ContType"
                                                                // style={{ width: "100%" }}
                                                                label="Contractor Type"
                                                                minLength={2}
                                                                value={this.state.objWell.ContType}
                                                                //onChange={this.handleChange}
                                                                onChange={(e) => this.handleChange(e, "ContType")}
                                                            />


                                                        </div>
                                                        <Input
                                                            name="RigType"
                                                            // style={{ width: "100%" }}
                                                            label="Rig Type"
                                                            minLength={2}
                                                            value={this.state.objWell.RigType}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "RigType")}
                                                        />
                                                    </div>



                                                </div>
                                            </div>


                                        </div>
                                        {/* Row 2 */}
                                        <div className="row mt-5">
                                            <div className="col">
                                                <div className="row ml-3">
                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="Pump1"
                                                            // style={{ width: "100%" }}
                                                            label="Pump 1"
                                                            minLength={2}
                                                            value={this.state.objWell.Pump1}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "Pump1")}
                                                        />

                                                        <Input
                                                            name="Pump1Model"
                                                            // style={{ width: "100%" }}
                                                            label="Model"
                                                            minLength={2}
                                                            value={this.state.objWell.Pump1Model}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "Pump1Model")}
                                                        />
                                                    </div>

                                                    <div className="mr-5 ml-3">
                                                        <Input
                                                            name="Pump1Stroke"
                                                            // style={{ width: "100%" }}
                                                            label="Stroke"
                                                            minLength={2}
                                                            value={this.state.objWell.Pump1Stroke}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "Pump1Stroke")}
                                                        />

                                                        <Input
                                                            name="Pump1Liner"
                                                            // style={{ width: "100%" }}
                                                            label="Liner"
                                                            minLength={2}
                                                            value={this.state.objWell.Pump1Liner}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "Pump1Liner")}
                                                        />
                                                    </div>


                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="row ml-3">
                                                    <div className="mr-5">
                                                        <Input
                                                            name="Pump2"
                                                            // style={{ width: "100%" }}
                                                            label="Pump 2"
                                                            minLength={2}
                                                            value={this.state.objWell.Pump2}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "Pump2")}
                                                        />


                                                    </div>
                                                    <Input
                                                        name="Pump2Model"
                                                        // style={{ width: "100%" }}
                                                        label="Model"
                                                        minLength={2}
                                                        value={this.state.objWell.Pump2Model}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "Pump2Model")}
                                                    />

                                                    <div className="mr-5">
                                                        <Input
                                                            name="Pump2Stroke"
                                                            // style={{ width: "100%" }}
                                                            label="Stroke2"
                                                            minLength={2}
                                                            value={this.state.objWell.Pump2Stroke}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "Pump2Stroke")}
                                                        />

                                                        <Input
                                                            name="Pump2Liner"
                                                            // style={{ width: "100%" }}
                                                            label="Liner2"
                                                            minLength={2}
                                                            value={this.state.objWell.Pump2Liner}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "Pump2Liner")}
                                                        />
                                                    </div>

                                                </div>


                                            </div>
                                            <div className="col">
                                                <div className="row ml-3">
                                                    <div className="mr-5">
                                                        <Input
                                                            name="Pump3"
                                                            // style={{ width: "100%" }}
                                                            label="Pump 3"
                                                            minLength={2}
                                                            value={this.state.objWell.Pump3}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "Pump3")}
                                                        />


                                                    </div>
                                                    <Input
                                                        name="Pump3Model"
                                                        // style={{ width: "100%" }}
                                                        label="Model"
                                                        minLength={2}
                                                        value={this.state.objWell.Pump3Model}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "Pump3Model")}
                                                    />

                                                    <div className="mr-5">
                                                        <Input
                                                            name="Pump3Stroke"
                                                            // style={{ width: "100%" }}
                                                            label="Stroke3"
                                                            minLength={2}
                                                            value={this.state.objWell.Pump3Stroke}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "Pump3Stroke")}
                                                        />

                                                        <Input
                                                            name="Pump3Liner"
                                                            // style={{ width: "100%" }}
                                                            label="Liner3"
                                                            minLength={2}
                                                            value={this.state.objWell.Pump3Liner}
                                                            //onChange={this.handleChange}
                                                            onChange={(e) => this.handleChange(e, "Pump3Liner")}
                                                        />
                                                    </div>

                                                </div>


                                            </div>

                                        </div>

                                        {/* Row 3 */}
                                        <div className="row mt-5 ml-3 mr-5">
                                            <div className="col">
                                                <div className="mr-3">
                                                    <Input
                                                        name="Comments"
                                                        style={{ width: "100%" }}
                                                        label="Comments"
                                                        minLength={2}
                                                        value={this.state.objWell.Comments}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "Comments")}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                        {/* Row 4 */}
                                        <div className="row ml-3 ">
                                            <div className="col">
                                                <div className="mr-5">
                                                    <Input
                                                        name="Contractor"
                                                        // style={{ width: "100%" }}
                                                        label="Contractor"
                                                        minLength={2}
                                                        value={this.state.objWell.Contractor}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "Contractor")}
                                                    />


                                                </div>
                                                <Input
                                                    name="TDDate"
                                                    // style={{ width: "100%" }}
                                                    label="TD Date"
                                                    minLength={2}
                                                    value={this.state.objWell.TDDate}
                                                    //onChange={this.handleChange}
                                                    onChange={(e) => this.handleChange(e, "TDDate")}
                                                />
                                            </div>
                                            <div className="col">
                                                <div className="mr-5">
                                                    <Input
                                                        name="Objective"
                                                        // style={{ width: "100%" }}
                                                        label="Objective"
                                                        minLength={2}
                                                        value={this.state.objWell.Objective}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "Objective")}
                                                    />


                                                </div>
                                                <Input
                                                    name="TDFormation"
                                                    // style={{ width: "100%" }}
                                                    label="TD Formation"
                                                    minLength={2}
                                                    value={this.state.objWell.TDFormation}
                                                    //onChange={this.handleChange}
                                                    onChange={(e) => this.handleChange(e, "TDFormation")}
                                                />

                                            </div>
                                        </div>


                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Offset Wells">
                                    <div>
                                        {/* Pending */}

                                        <div className="row ml-4">
                                            <Grid
                                                style={{ height: '50vh', width: '30vw' }}
                                                data={this.state.grdOffsetWells}
                                                resizable={true}
                                                scrollable={"scrollable"}
                                                sortable={true}
                                                editField="inEdit"
                                            >
                                                <GridToolbar>
                                                    <legend>
                                                        <span className="float-left mr-1" >  <button type="button" onClick={this.cmdAddOffsetWell_click} className="btn-custom btn-custom-primary ml-1 mr-1">
                                                            Add</button>
                                                        </span></legend>
                                                </GridToolbar>
                                                <Column field="WellName" headerClassName="text-center" className="text-left" title="Well Name" />
                                                <Column width="70px" headerClassName="text-center" resizable={false}
                                                    field="removeOffsetWell"
                                                    title="*"
                                                    cell={props => (
                                                        <td className="text-center">
                                                            <span onClick={e => this.cmdRemoveOffsetWell(e, props.dataItem)}>
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </span>

                                                        </td>
                                                    )}
                                                />
                                            </Grid>
                                        </div>

                                        <div className="row">
                                            <div className="col">
                                                {this.state.showWellSelector && (

                                                    <Dialog title={"eVuMax"} onClose={() => this.setState({ showWellSelector: false })}
                                                        width={800} height={600}
                                                    >
                                                        < WellSelector getSelectedWells={this.addOffsetWells} getWithWellName={true}></WellSelector>
                                                    </Dialog>)
                                                }
                                            </div>

                                        </div>



                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Benchmarks">
                                    <div>
                                        {/* Pending */}

                                        <form>
                                            <div className="row mb-4">
                                                <div className="col">
                                                    <NumericTextBox
                                                        name="RigCost"

                                                        label="Rig Cost/Day $"
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "RigCost")}
                                                        value={this.state.objWell.RigCost}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <NumericTextBox
                                                        name="PlannedDays"
                                                        // width="100%"
                                                        label="Planned /Day ($)"
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "PlannedDays")}
                                                        value={this.state.objWell.PlannedDays}
                                                    />
                                                </div>
                                            </div>

                                            <div className="row mb-4">
                                                <div className="col">
                                                    <NumericTextBox
                                                        name="DrlgConnTime"

                                                        label="Drilling Connection Benchmark (Minutes)"
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "DrlgConnTime")}
                                                        value={this.state.objWell.DrlgConnTime}
                                                    />


                                                </div>

                                                <div className="col">
                                                    <NumericTextBox
                                                        name="TripConnTime"

                                                        label="Trip Connection Benchmark (Minutes)"
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "TripConnTime")}
                                                        value={this.state.objWell.TripConnTime}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <NumericTextBox
                                                        name="STBTime"

                                                        label="Slips to Bottom Benchmark (Minutes)"
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "STBTime")}
                                                        value={this.state.objWell.STBTime}
                                                    />
                                                </div>


                                            </div>

                                            <div className="row mb-4">
                                                <div className="col">
                                                    <NumericTextBox
                                                        name="STSTime"

                                                        label="Slips To Slips Benchmark (Minutes)"
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "STSTime")}
                                                        value={this.state.objWell.STSTime}

                                                    />
                                                </div>

                                                <div className="col">
                                                    <NumericTextBox
                                                        name="BTSTime"

                                                        label="Bottom To Slips Benchmark (Minutes)"
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "BTSTime")}
                                                        value={this.state.objWell.BTSTime}

                                                    />
                                                </div>
                                            </div>

                                            <div className="row">
                                                {/* <label>Speed W/o Connections</label> */}
                                                <div className="col">
                                                    <NumericTextBox
                                                        name="TripInSpeed"
                                                        label="Trip in Speed Benchmark  (ft/Mtr)/Hr"
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "TripInSpeed")}
                                                        value={this.state.objWell.TripInSpeed}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <NumericTextBox
                                                        name="TripOutSpeed"
                                                        label="Trip out Speed Benchmark  (ft/Mtr)/Hr"
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "TripOutSpeed")}
                                                        value={this.state.objWell.TripOutSpeed}
                                                    />
                                                </div>
                                            </div>
                                        </form>



                                    </div>
                                </TabStripTab>
                            </TabStrip>

                        </div>

                    </div>


                </div>

            </>
        );

    }
}
