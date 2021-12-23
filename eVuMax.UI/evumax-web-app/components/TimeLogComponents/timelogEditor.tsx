import React from "react";
import axios from "axios";
import { Grid, GridColumn as Column, GridColumn, GridToolbar } from '@progress/kendo-react-grid';
import { TabStrip, TabStripTab, DropDownList, MultiSelect } from '@progress/kendo-react-all';

import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";
// import ReactDOM from "react-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Input, Checkbox } from "@progress/kendo-react-inputs";
// import { filterBy } from "@progress/kendo-data-query";
import CustomLoader from "../loader/loader";

import { comboData } from "../../eVuMaxObjects/UIObjects/comboData";
import * as DataObjects from "../../eVuMaxObjects/dataObjects/dataObjects";
// import * as UI from '../../eVuMaxObjects/UIObjects/NodeTree';
// import { Well, wDateFormatLocal, wDateFormatUTC } from "../../eVuMaxObjects/dataObjects/DataObjects/well"

import '../grid/active-well/active-well.css'

import '@progress/kendo-react-layout';
// import { QCRule } from "../../eVuMaxObjects/dataObjects/DataObjects/QCRule";

//import {TimeLogChannelInLineEditor} from "./TimeLogChannelInLineEditor";
import TimeLogChannelInLineEditor from "./TimeLogChannelInLineEditor";

import * as utilFunc from '../../utilFunctions/utilFunctions';

import GlobalMod from "../../objects/global";
import { confirmAlert } from "react-confirm-alert";

import UnitProfileSelector from "../UnitProfileComponent/UnitProfileSelector";


let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

let _gMod = new GlobalMod();



export interface IProps {
    wellID: string | undefined
    wellboreID: string | undefined
    logID: string | undefined
    objTimeLog: DataObjects.TimeLog
    reloadTree: any
}



export default class TimeLogEditor extends React.PureComponent<IProps> {

    constructor(props: any) {
        super(props);
        this.objTimeLog = utilFunc.CopyObject(this.props.objTimeLog);
        this.objTimeLog_Clone = utilFunc.CopyObject(this.props.objTimeLog);
        this.getQCRulesFromDB();
        this.setState({
            objTimeLog: utilFunc.CopyObject(this.props.objTimeLog)
        });
    }
    objTimeLog: DataObjects.TimeLog = new DataObjects.TimeLog();

    objTimeLog_Clone: DataObjects.TimeLog = new DataObjects.TimeLog();
    state = {
        showUnitProfileSelector: false, //06-10-2020
        selectedColumnOrder: {} as any, //02-10-2020
        objTimeLog: new DataObjects.TimeLog, //=  utilFunc.CopyObject(this.props.objTimeLog),
        channelInEdit: {}, //04-07-2020 Nishant
        showChannelInEditor: false, //04-07-2020 Nishant
        currentChannel: "",
        currentSideTrackID: "",
        UnitList: [] = [new comboData()],
        VuMaxUnitID: new comboData(),
        snapshotJobList: [] = [new comboData()],
        showLinkToDiv: true,
        showDownloadLogWindow: false,
        wellID: utilFunc.CopyObject(this.props.wellID), //'us_1395675560', //'ae1e7348-d98e-4083-bb0d-a7cad73bd37f',
        isLoaded: false,
        error: '',
        selected: 0,

        ActionComboData: [] = [new comboData("No Action", "0"), new comboData("Auto de-spike data", "1")],
        ActionType: 0,
        ActionTypeValue: new comboData(),

        DuplicateActionComboData: [] = [new comboData("Merge Columns", "2"),
        new comboData("Merge Rows & Columns", "3"),
        new comboData("Merge Columns (No Mnemonic Duplication)", "4"),
        new comboData("Merge Rows & Columns (No Mnemonic Duplication)", "5"),
        ],

        DuplicateActionValue: new comboData("", ""),
        DuplicateAction: "",

        WellIDComboData: [] = [new comboData("", "")],
        WellboreComboData: [] = [new comboData("", "")],
        TimeLogComboData: [] = [new comboData("", "")],


        LinkWellIDComboData: new comboData("", ""),
        LinkWellboreIDComboData: new comboData("", ""),
        LinkLogIDComboData: new comboData("", ""),

        LinkWellID: "",
        LinkWellboreID: "",
        LinkLogID: "",

        grdColumnOrderList: [] as DataObjects.logChannel[],

        grdSideTrackList: [] as DataObjects.SideTrack[],
        QCRules: [] as comboData[],
        QCRulesList: [] as comboData[],

        grdLogCurves: [] as DataObjects.logChannel[],



    }

    componentWillUpdate() {
        _gMod = new GlobalMod();
        if (_gMod._userId == "" || _gMod._userId == undefined) {
            window.location.href = "/evumaxapp/";
            return;
        }

    }
    componentWillReceiveProps() {
        if (this.props.objTimeLog.ObjectID == this.objTimeLog.ObjectID) {
            return;
        }
        this.objTimeLog_Clone = this.props.objTimeLog;
        this.objTimeLog = this.props.objTimeLog;

        this.displayData();
    }

    componentWillMount() {
        try {
            this.setState({ DuplicateActionValue: this.state.DuplicateActionComboData[0] });
            this.generateUnitCombo();
            this.generateWellCombo();
            this.generateSnapshotJobCombo();

        } catch (error) {

        }

    }
    componentDidMount() {

        this.displayData();
        let newQCRules: Map<string, DataObjects.QCRule> = new Map();
        newQCRules = utilFunc.DictionaryToMap(this.objTimeLog.QCRules, newQCRules);
        console.log(newQCRules);
    }

    generateCombo = () => {


    }

    //Nishant 06-10-2020
    ApplyProfile = (profileID: string, ApplyProfile: boolean) => {
        if (ApplyProfile == true) {

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "loadUnitProfile";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "profileID";
            objParameter.ParamValue = profileID;
            objBrokerRequest.Parameters.push(objParameter);

            axios.get(_gMod._getData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) }
            }).then((res) => {


                const objProfile = JSON.parse(res.data.Response);
                let grdChannels = this.state.grdLogCurves;
                let ConversionList = Object.values(objProfile.Conversions);

                for (let i = 0; i < ConversionList.length; i++) {
                    const objItem: any = ConversionList[i];
                    for (let index = 0; index < grdChannels.length; index++) {
                        const objCurve = grdChannels[index];
                        let currentUnitID = objCurve.UnitID;

                        if (currentUnitID.trim().toUpperCase() == objItem.FromUnitID.trim().toUpperCase()) {
                            //objCurve.UnitID = objItem.ToUnitID;
                            grdChannels[index].UnitID = objItem.ToUnitID;
                        }
                    }
                }
                this.setState({ grdLogCurves: grdChannels });
                this.forceUpdate();

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
        }

        this.setState({ showUnitProfileSelector: false });
        this.forceUpdate();
    }



    displayData = () => {

        this.setState({
            objTimeLog: utilFunc.CopyObject(this.props.objTimeLog)
        })

        let QCRuleList = [new comboData()];
        QCRuleList.length = 0;

        const qcRulelist = Object.values(this.objTimeLog.QCRules);
        qcRulelist.forEach(function (value: any) {
            let QCRule = new comboData();
            QCRule.objObject = value;
            QCRule.id = value.RuleID;
            QCRule.text = value.RuleName
            QCRuleList.push(QCRule);
        });

        this.setState({
            QCRules: QCRuleList
        })

        // //Populate LogCurve List
        // let CurveList = [{}];
        //
        // CurveList.length = 0;
        // const curveList = Object.values(this.objTimeLog.logCurves);
        // curveList.forEach(function (value: any) {
        //     //let logCurve: DataObjects.logChannel = new DataObjects.logChannel();
        //     CurveList.push(value);
        // });
        this.setState({
            grdLogCurves: Object.values(this.objTimeLog.logCurves) // CurveList
        });


        const sideTracks = Object.values(this.objTimeLog.sideTracks);

        const wellDateFormat: string = this.objTimeLog.__wellDateFormat;

        //let sideTrackList: [] as sideTracks;
        // sideTracks.forEach(function (value: any) {
        //     let dtDateTime: any = Date.parse(value.DateTime);
        //     if (wellDateFormat == wDateFormatUTC) {
        //         //pending
        //     } else {

        //     }
        //     let strText: string = "";
        //     //below logic can be incorporated in Grid cell Props
        //     // if (value.Type == 0) {
        //     //     strText = "Side track @ " + dtDateTime.ToString("MMM-dd-yyyy HH:mm:ss");
        //     // } else {
        //     //     strText = "Depth Reset @ " + dtDateTime.ToString("MMM-dd-yyyy HH:mm:ss");
        //     // }
        //     // let sideTack: any = new Object();
        //     // sideTack["SIDETRACK_NAME"] = value.strText;
        //     // sideTack["SIDETRACK_ID"] = value.SideTrackID;

        //     sideTrackList.push(value);
        // });
        this.setState({
            grdSideTrackList: sideTracks
        });


        ////Column Order
        // const columnList = this.state.grdLogCurves;//   Object.values(this.objTimeLog.logCurves);
        let curveList = Object.values(this.objTimeLog.logCurves).sort((a, b) => (a.ColumnOrder > b.ColumnOrder) ? 1 : -1);
        const curveListArr = Object.values(curveList);
        let ColumnOrder: any = [];// = [{ "NAME": "", "MNEMONIC": "", "ORDER_NO": "" }];
        let rowIndex: number = 0;
        curveListArr.forEach(function (value: any) {
            let logCurve: DataObjects.logChannel = new DataObjects.logChannel();
            if (value.valueType === 1) {
                logCurve.curveDescription = value.curveDescription;
                logCurve.mnemonic = value.mnemonic;
                rowIndex += 1;
                logCurve.ColumnOrder = rowIndex;
                ColumnOrder.push(logCurve);
            }
        });

        //ColumnOrder = ColumnOrder.map((item: any) => Object.assign({ selected: false}, item))
        this.setState({
            grdColumnOrderList: ColumnOrder
        });


        ////********* */


        // this.setState({
        //     nameLog: this.props.objTimeLog.nameLog,
        //     serviceCompany: this.objTimeLog.serviceCompany,
        //     EDRProvider: this.objTimeLog.EDRProvider,
        //     runNumber: this.objTimeLog.runNumber,
        //     description: this.objTimeLog.description,
        //     PrimaryLog: this.objTimeLog.PrimaryLog,
        //     RemarksLog: this.objTimeLog.RemarksLog,
        //     DontCalcHoleDepth: this.objTimeLog.DontCalcHoleDepth,
        //     StartingHoleDepth: this.objTimeLog.StartingHoleDepth,
        //     wmlsurl: this.objTimeLog.wmlsurl,
        //     __dataTableName: this.objTimeLog.__dataTableName,
        //     PiLogID: this.objTimeLog.PiLogID,
        //     PiWellID: this.objTimeLog.PiWellID,
        //     PiWellboreID: this.objTimeLog.PiWellboreID,


        //     linkToParent: this.objTimeLog.LinkToParent,
        //     LinkWellID: this.objTimeLog.LinkWellID,
        //     LinkWellboreID: this.objTimeLog.LinkWellboreID,
        //     LinkLogID: this.objTimeLog.LinkLogID,


        //     DuplicateAction: this.objTimeLog.DuplicateAction,

        //     DetectSpike: this.objTimeLog.DetectSpike,
        //     TolerancePc: this.objTimeLog.TolerancePc,
        //     CheckTimePeriod: this.objTimeLog.CheckTimePeriod,
        //     CompareWindow: this.objTimeLog.CompareWindow,
        //     MaxCloseTime: this.objTimeLog.MaxCloseTime,
        //     ActionType: this.objTimeLog.ActionType,
        //     NearBottomDistance: this.objTimeLog.NearBottomDistance,


        //     CreateRepOnFormation: this.objTimeLog.CreateRepOnFormation,
        //     SnapJobID: this.objTimeLog.SnapJobID,
        //     DepthThreshold: this.objTimeLog.DepthThreshold,
        //     Frequency: this.objTimeLog.Frequency,
        //     FormationTops: this.objTimeLog.FormationTops,
        // });

        //Loop through each comboData and get the name from wellID, wellboreID and LogID, pending...




        this.setState({
            LinkWellIDComboData: utilFunc.setComboValue(this.state.WellIDComboData, this.objTimeLog.LinkWellID),
            LinkWellID: this.objTimeLog.LinkWellID,
            LinkWellboreID: this.objTimeLog.LinkWellboreID,
            LinkLogID: this.objTimeLog.LinkLogID
        });

        if (this.objTimeLog.LinkWellID != "") {
            let objComboData: comboData = new comboData(this.objTimeLog.WellID, this.objTimeLog.nameWell);
            this.setState({ LinkWellIDComboData: objComboData });
            this.generateWellboreCombo(this.objTimeLog.LinkWellID);

            //
            //     let cData:any  = setComboValue(this.state.WellboreComboData, this.objTimeLog.LinkWellboreID);

            //     objComboData =  new comboData(this.objTimeLog.LinkWellboreID,cData.text);
            //     this.setState({LinkWellIDComboData: objComboData});

        }

        // if (this.objTimeLog.LinkWellboreID != "") {
        //     this.generateTimeLogCombo(this.objTimeLog.LinkWellboreID);
        // }

    }

    cmdSave_click = () => {



        let objTimeLog: DataObjects.TimeLog = new DataObjects.TimeLog;
        objTimeLog = this.state.objTimeLog;

        //********** */

        //save sideTrack to Map object
        // let newSideTracks: Map<string, DataObjects.SideTrack> = new Map();
        // this.state.grdSideTrackList.forEach((item: DataObjects.SideTrack) => {
        //    // let objSideTrack = new DataObjects.SideTrack();
        //     // objSideTrack.DateTime = item.DateTime;
        //     // objSideTrack.SideTrackID = item.SideTrackID;
        //     // objSideTrack.Type = item.Type;
        //     newSideTracks.set(item.SideTrackID, item);
        // });
        objTimeLog.sideTracks = utilFunc.convertMapToDictionaryJSON(this.state.grdSideTrackList, "SideTrackID");

        //New Code
        objTimeLog.logCurves = utilFunc.convertMapToDictionaryJSON(this.state.grdLogCurves, "mnemonic");

        //Get QCRules from the list and save it to timelog
        let newQCRules: DataObjects.QCRule[] = [];
        this.state.QCRules.forEach((item: comboData) => {
            let objQCRule: DataObjects.QCRule = new DataObjects.QCRule;
            objQCRule.RuleID = item.id;
            objQCRule.Channels = null;
            newQCRules.push(objQCRule);
        });
        this.objTimeLog.QCRules = utilFunc.convertMapToDictionaryJSON(newQCRules, "RuleID");

        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "Well.Data.Objects";
        objBrokerRequest.Function = "updateTimelog";
        objBrokerRequest.Broker = "WellObjectManager";

        objParameter = new BrokerParameter('UserName', _gMod._userId);

        objBrokerRequest.Parameters.push(objParameter);


        objParameter = new BrokerParameter('Update', JSON.stringify(objTimeLog));

        objBrokerRequest.Parameters.push(objParameter);

        axios.post(_gMod._performTask, {
            paramRequest: JSON.stringify(objBrokerRequest),
        })
            .then((response) => {
                this.props.reloadTree("showTimeLogEditor", false);
            })
            .catch((error) => {
                console.log(error);
            });



        return true;
    }

    cmdCancel_click = () => {
        // this.objTimeLog = utilFunc.CopyObject(this.objTimeLog_Clone);
        // this.displayData();

        //Nishant 24-09-2020
        this.props.reloadTree("showTimeLogEditor", true);

    }
    AddChannel_Click = () => {
        this.setState({
            showChannelInEditor: !this.state.showChannelInEditor,
            channelInEdit: new DataObjects.logChannel
        });

    }
    grdChannelRowClick = (event: any) => {

        this.setState({
            currentChannel: event.dataItem.mnemonic
        });

    };
    //Nishant 03-07-2020

    grdSideTrackRowClick = (event: any) => {

        this.setState({
            currentSideTrackID: event.dataItem.SideTrackID
        });

    };

    cmdEditChannel = (event: any, dataItem: any) => {

        this.setState({
            showChannelInEditor: !this.state.showChannelInEditor,
            channelInEdit: dataItem
        });

    }
    //Nishant 13-07-2020
    cmdRemoveSideTrack = (event: any, rowData: any) => {

        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {

                        let sideTrackList = this.state.grdSideTrackList;
                        let objRow = rowData;
                        let ID = objRow.SideTrackID;
                        let index = sideTrackList.findIndex((d: any) => d.SideTrackID === ID); //find index in your array
                        sideTrackList.splice(index, 1);//remove element from array
                        this.setState({
                            grdSideTrackList: sideTrackList
                        });
                        this.forceUpdate();
                    }

                },
                {
                    label: 'No',
                    onClick: () => null
                }
            ]
        });
    }


    //Nishant 10-06-2020
    cmdRemoveChannels = (event: any, rowData: any) => {

        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {

                        let Channels = this.state.grdLogCurves;
                        let objRow = rowData;
                        let mnemonic = objRow.mnemonic;// MNEMONIC;
                        let index = Channels.findIndex((d: any) => d.mnemonic === mnemonic); //find index in your array
                        Channels.splice(index, 1);//remove element from array
                        this.setState({
                            grdLogCurves: Channels
                        });
                        this.forceUpdate();
                    }

                },
                {
                    label: 'No',
                    onClick: () => null
                }
            ]
        });
    }
    grdItemChange = (e: any) => {

        e.dataItem[e.field] = e.value;
        this.setState({
            grdLogCurves: [...this.state.grdLogCurves]
        });

        let newData: any = Object.values([...this.state.grdLogCurves]);
        let index = newData.findIndex((item: any) => item.mnemonic === e.dataItem.mnemonic); // use unique value like ID
        newData[index][e.field] = e.value;
        this.setState({ grdLogCurves: newData })
    };

    handleChangeDropDown = (event: any, field?: string) => {

        const value = event.value;

        const name = field; // target.props ? target.props.name : target.name;
        let edited: any = utilFunc.CopyObject(this.state.objTimeLog);
        edited[field] = value;
        this.setState({
            objTimeLog: edited
        });

        this.setState({ [event.target.name]: event.value });
        if (event.target.name == "ActionComboData") {

            this.setState({ ActionType: event.value.id });
        }

        if (event.target.name == "DuplicateActionComboData") {
            this.setState({ DuplicateAction: event.value.id });
        }

        if (event.target.name == "LinkWellIDComboData") {
            this.setState({ LinkWellID: event.value.id });
            this.setState({ LinkLogID: "" });
            this.setState({ LinkWellboreID: "" });
            this.generateWellboreCombo(event.value.id)
        }


        if (event.target.name == "LinkWellboreIDComboData") {
            this.setState({ LinkWellboreID: event.value.id });
            this.generateTimeLogCombo(event.value.id)

        }

        if (event.target.name == "LinkLogIDComboData") {
            this.setState({ LinkLogID: event.value.id });
        }
    }
    //#region Generate Combos
    generateSnapshotJobCombo = () => {
        //SELECT JOB_ID, JOB_NAME FROM VMX_SNP_JOBS
        let snapshotJobList = [new comboData("", "")];


        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "DataObject.Manager";
        objBrokerRequest.Function = "getTable";
        objBrokerRequest.Broker = "WellBroker";

        objParameter.ParamName = "strSQL";
        objParameter.ParamValue = "SELECT JOB_ID, JOB_NAME FROM VMX_SNP_JOBS";
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
                // let unitComboData: comboData = new comboData("", "");
                // let unitList: comboData[] = [];
                objData.forEach(function (value: any) {
                    let jobCombo: comboData = new comboData("", "");
                    jobCombo.id = value.JOB_ID;
                    jobCombo.text = value.JOB_NAME;
                    snapshotJobList.push(jobCombo);
                });
                this.setState({ snapshotJobList: snapshotJobList });
                this.setState({ isProcess: false })
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

    generateUnitCombo = () => {
        //"SELECT UNIT_ID,UNIT_NAME FROM VMX_UNITS ORDER BY UNIT_NAME"

        let unitList = [new comboData("", "")];
        // unitList.push(new comboData("ds","ds"));

        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "DataObject.Manager";
        objBrokerRequest.Function = "getTable";
        objBrokerRequest.Broker = "WellBroker";

        objParameter.ParamName = "strSQL";
        objParameter.ParamValue = "SELECT UNIT_ID,UNIT_NAME FROM VMX_UNITS ORDER BY UNIT_NAME";
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
                let unitComboData: comboData = new comboData("", "");
                let unitList: comboData[] = [];
                objData.forEach(function (value: any) {
                    let unitCombo: comboData = new comboData("", "");
                    unitCombo.id = value.UNIT_ID;
                    unitCombo.text = value.UNIT_NAME;
                    unitList.push(unitCombo);
                });
                this.setState({ UnitList: unitList });
                this.setState({ isProcess: false })
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
    generateWellCombo = () => {
        try {

            this.setState({ LinkLogID: "" });
            this.setState({ LinkWellboreID: "" });

            this.setState({ isProcess: true });
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getTable";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT WELL_ID,WELL_NAME FROM VMX_WELL ORDER BY WELL_NAME";
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
                    let wellComboData: comboData = new comboData("", "");
                    let WellIDComboData: comboData[] = [];
                    objData.forEach(function (value: any) {
                        let wellComboData: comboData = new comboData("", "");
                        wellComboData.id = value.WELL_ID;
                        wellComboData.text = value.WELL_NAME;
                        WellIDComboData.push(wellComboData);
                    });


                    this.setState({ WellIDComboData: WellIDComboData });





                    this.setState({ isProcess: false })
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

    generateWellboreCombo = (wellID: string) => {
        try {


            this.setState({ LinkWellboreID: "" });
            this.setState({ isProcess: true });
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getTable";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT WELLBORE_ID,WELLBORE_NAME FROM VMX_WELLBORE WHERE WELL_ID='" + wellID + "' ORDER BY WELLBORE_NAME"
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

                    let ComboData: comboData[] = [];
                    objData.forEach(function (value: any) {

                        let wellboreComboData: comboData = new comboData("", "");
                        wellboreComboData.id = value.WELLBORE_ID;
                        wellboreComboData.text = value.WELLBORE_NAME;
                        ComboData.push(wellboreComboData);
                    });

                    this.setState({ WellboreComboData: ComboData });

                    this.setState({ isProcess: false })
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

    generateTimeLogCombo = (wellboreID: string) => {
        try {


            let wellID = this.state.LinkWellIDComboData.id;
            this.setState({ LinkLogID: "" });
            this.setState({ isProcess: true });
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getTable";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT LOG_ID,LOG_NAME FROM VMX_TIME_LOG WHERE WELL_ID='" + wellID + "' AND WELLBORE_ID='" + wellboreID + "' ORDER BY LOG_NAME"
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

                    let ComboData: comboData[] = [];
                    objData.forEach(function (value: any) {

                        let TimeLogCombodata: comboData = new comboData("", "");
                        TimeLogCombodata.id = value.LOG_ID;
                        TimeLogCombodata.text = value.LOG_NAME;
                        ComboData.push(TimeLogCombodata);
                    });

                    this.setState({ TimeLogComboData: ComboData });
                    console.log("timeLog Combo", ComboData);

                    this.setState({ isProcess: false })
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
    ////#endregion
    //Nishant 04-07-2020

    saveChannelInEdit = (dataItem: any, editMode: string) => {

        if (editMode == "A") {
            dataItem.valueType = 1;
            let NewlogCurveList: any = this.state.grdLogCurves;
            NewlogCurveList.push(dataItem);
            this.setState({
                grdLogCurves: NewlogCurveList
            });
        } else {

            let newData: any = Object.values([...this.state.grdLogCurves]);


            let index = newData.findIndex((item: any) => item.mnemonic === dataItem.mnemonic); // use unique value like ID

            newData[index] = dataItem;
            this.setState({ grdLogCurves: newData })
        }





        this.setState({
            showChannelInEditor: !this.state.showChannelInEditor,
            channelInEdit: null
        });
    }

    cancelChannelInEdit = () => {

        this.setState({
            showChannelInEditor: !this.state.showChannelInEditor,
            channelInEdit: null
        });
    }

    //Nishant 03-07-2020
    getQCRulesFromDB = async () => {
        try {



            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getTable";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT *  FROM VMX_QC_RULES";
            objBrokerRequest.Parameters.push(objParameter);

            const res = await axios.get(_gMod._getData, { params: { paramRequest: JSON.stringify(objBrokerRequest) }, });
            const objData = JSON.parse(res.data.Response);

            const QCRuleList: comboData[] = [];
            objData.forEach(function (value: any) {

                let comboData_ = new comboData(value.RULE_NAME, value.RULE_ID);
                QCRuleList.push(comboData_);
            });
            return await this.setState({ QCRulesList: QCRuleList });
        } catch (error) {
            return "";

        }

    }
    handleChangeMultiSelect = (event: any) => {


        if (event.target.name == "QCRules") {

            //Load QCRules and save the QCRule object to Timelog.QCRule.add()
            // objTimeLog.QCRules.Add(objRule.RuleID, objRule)
            // generateRuleList()
            // let objQCRule: DataObjects.QCRule = new DataObjects.QCRule;
            // objQCRule.RuleID = event.value[1].id;
            // event.value.objObject = objQCRule;
        }
        this.setState({ [event.target.name]: event.value });
    }

    ////New Code
    handleChange = (event: any, field: string) => {


        if (field == "LinkToParent") {
            this.setState({ showLinkToDiv: !event.value });
        }

        if (field == "RemarksLog") {
            this.setState({ PrimaryLog: !event.value });
        }

        if (field == "PrimaryLog") {
            this.setState({ RemarksLog: !event.value });
        }



        //this.setState({ [event.nativeEvent.target.name]: event.value });
        //New Changes: 14-07-2020
        // let target = event.target;
        //const value = target.type === 'checkbox' ? target.checked : target.value;
        const value = event.value;

        const name = field; // target.props ? target.props.name : target.name;
        let edited: any = utilFunc.CopyObject(this.state.objTimeLog);
        edited[field] = value;
        this.setState({
            objTimeLog: edited
        });

    };

    reOrderColumn_RowClick = (e: any) => {
        //e.dataItem.selected = !e.dataItem.selected;
        this.setState({ selectedColumnOrder: e.dataItem });
        this.forceUpdate();
    }
    handleMoveUpColumn = () => {

        if (this.state.selectedColumnOrder) {
            let index = this.state.grdColumnOrderList.findIndex((item: any) => item["mnemonic"] === this.state.selectedColumnOrder.mnemonic
            );
            if (index > 0) {
                let data = [...this.state.grdColumnOrderList];
                let value = data[index - 1];
                data[index - 1] = data[index];
                data[index] = value;
                this.setState({
                    grdColumnOrderList: data
                });
            }
        }
    };

    handleMoveDownColumn = () => {

        if (this.state.selectedColumnOrder) {
            let index = this.state.grdColumnOrderList.findIndex(
                item => item.mnemonic === this.state.selectedColumnOrder.mnemonic
            );
            if (index < this.state.grdColumnOrderList.length - 1) {
                let data = [...this.state.grdColumnOrderList];
                let value = data[index + 1];
                data[index + 1] = data[index];
                data[index] = value;
                this.setState({
                    grdColumnOrderList: data
                });
            }
        }
    };


    //Old Code
    // handleChange = (event: any) => {
    //

    //     this.setState({[event.nativeEvent.target.name]: event.value });

    //     if (event.nativeEvent.target.name == "linkToParent") {
    //         this.setState({ showLinkToDiv: !event.value });
    //     }

    //     if (event.nativeEvent.target.name == "RemarksLog") {
    //         this.setState({ PrimaryLog: !event.value });
    //     }

    //     if (event.nativeEvent.target.name == "PrimaryLog") {
    //         this.setState({ RemarksLog: !event.value });
    //     }

    //     let target = event.target;
    //     const value = target.value;
    //     const name = target.props ? target.props.name : target.name;
    //     let edited: any = this.state.objTimeLog;
    //     edited[name] = value;
    //     this.setState({
    //         objTimeLog: edited
    //     });

    // };




    //Tabsrip control
    handleTabSelect = (e: any) => {
        this.setState({ selected: e.selected });
    }

    render() {
        let loader = this.state;

        return (
            <>

                <div className="row" style={{ position: "sticky", top: "0", padding: "10px" }} >
                    <h2>Time Log Editor</h2>
                </div>
                <div id="mainContainer_" style={{ height: '86vh', width: '70vw' }}>

                    <div className="row">
                        <legend>
                            <span className="float-left">  <button hidden type="button" onClick={this.cmdSave_click} className="btn-custom btn-custom-primary mr-1">
                                Save</button>
                                <button type="button" onClick={this.cmdCancel_click} className="btn-custom btn-custom-primary ml-1">
                                    Cancel</button>
                            </span></legend>
                    </div>

                    <div className="row">
                        <div id="mainContainer">
                            <TabStrip selected={this.state.selected} onSelect={this.handleTabSelect} keepTabsMounted={true}>
                                {/* <TabStrip selected={this.state.selected} onSelect={this.handleSelect} > */}
                                <TabStripTab title="Log Information">
                                    <div id="tabWellInfo1" style={{ marginLeft: "23px" }}>

                                        <div>
                                            <div className="row pb-3">

                                                <div className="col"><Input
                                                    name="nameLog"
                                                    label="Log Name"
                                                    value={this.state.objTimeLog.nameLog}
                                                    onChange={(e) => this.handleChange(e, "nameLog")}

                                                /></div>
                                                <div className="col">
                                                    <Input
                                                        name="serviceCompany"
                                                        // style={{ width: "100%" }}
                                                        label="Service Company"
                                                        minLength={2}
                                                        //value={this.state.serviceCompany}
                                                        //onChange={this.handleChange}
                                                        onChange={(e) => this.handleChange(e, "serviceCompany")}
                                                        value={this.state.objTimeLog.serviceCompany}


                                                    />
                                                </div>

                                                <div className="col">
                                                    <Input
                                                        name="EDRProvider"
                                                        // style={{ width: "100%" }}
                                                        label="EDR Provider"
                                                        minLength={2}
                                                        //value={this.state.EDRProvider}
                                                        value={this.state.objTimeLog.EDRProvider}
                                                        onChange={(e) => this.handleChange(e, "EDRProvider")}


                                                    />
                                                </div>

                                                <div className="col">
                                                    <Input
                                                        name="runNumber"
                                                        // style={{ width: "100%" }}
                                                        label="Run No"
                                                        minLength={2}
                                                        //value={this.state.runNumber}
                                                        value={this.state.objTimeLog.runNumber}
                                                        onChange={(e) => this.handleChange(e, "runNumber")}


                                                    />
                                                </div>

                                                {/* <div className="mr-5 ml-3">

                                            </div> */}



                                            </div>
                                            <div className="row pb-3">

                                                <div className="col"><Input
                                                    width="100%"
                                                    name="description"
                                                    label="Description"
                                                    pattern={"[A-Za-z]+"}
                                                    minLength={2}
                                                    //value={this.state.description}
                                                    value={this.state.objTimeLog.description}
                                                    onChange={(e) => this.handleChange(e, "description")}

                                                />


                                                </div>

                                            </div>

                                            <div className="row">
                                                <div className="col">
                                                    <Checkbox
                                                        name="PrimaryLog"
                                                        label='Primary Log'
                                                        checked={this.state.objTimeLog.PrimaryLog}
                                                        // value={this.state.PrimaryLog}
                                                        // onChange={this.handleChange}

                                                        value={this.state.objTimeLog.PrimaryLog}
                                                        onChange={(e) => this.handleChange(e, "PrimaryLog")}
                                                    />
                                                </div>


                                            </div>
                                            <div className="row">
                                                <div className="col ">
                                                    <Checkbox
                                                        name="RemarksLog"
                                                        label='Remark Log'
                                                        checked={this.state.objTimeLog.RemarksLog}
                                                        // value={this.state.RemarksLog}
                                                        // onChange={this.handleChange}

                                                        value={this.state.objTimeLog.RemarksLog}
                                                        onChange={(e) => this.handleChange(e, "RemarksLog")}
                                                    />
                                                </div>
                                            </div>

                                            <p style={{ marginTop: "100px" }}>
                                                <label>Hole Depth___________________________________________</label>

                                            </p>

                                            <div className="row pb-3">

                                                <div className="col">
                                                    <Checkbox
                                                        name="doNotCalcHoleDepth"
                                                        label='Do Not Calculate Hole Depth'
                                                        value={this.state.objTimeLog.DontCalcHoleDepth}
                                                        onChange={(e) => this.handleChange(e, "DontCalcHoleDepth")}
                                                    />
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col">
                                                    <Input
                                                        name="StartingHoleDepth"
                                                        // style={{ width: "100%" }}
                                                        label="Starting Hole Depth"
                                                        minLength={2}
                                                        value={this.state.objTimeLog.StartingHoleDepth}
                                                        onChange={(e) => this.handleChange(e, "StartingHoleDepth")}

                                                    />
                                                </div>
                                            </div>

                                        </div>



                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Channels">
                                    <div id="tabChannels">
                                        <Grid
                                            style={{ height: '70vh', width: '70vw' }}

                                            data={this.state.grdLogCurves != null ? (this.state.grdLogCurves.map((item: DataObjects.logChannel) =>
                                                ({ ...item, selected: item.mnemonic === this.state.currentChannel })
                                            )) : null}

                                            // data={this.state.objTimeLog.logCurves != null ? (this.state.objTimeLog.logCurves.map((item: DataObjects.logChannel) =>
                                            //     ({ ...item, selected: item.mnemonic === this.state.currentChannel })
                                            // )) : null}
                                            resizable={true}
                                            scrollable={"scrollable"}
                                            sortable={true}
                                            onItemChange={this.grdItemChange}
                                            onRowClick={this.grdChannelRowClick}
                                            editField="inEdit"
                                            selectedField="selected"
                                        >
                                            <GridToolbar>

                                                <div >
                                                    <span>
                                                        {/* <button className="btn-custom btn-custom-primary ml-1 mr-1" onClick={this.AddChannel_Click}>View Data</button> */}
                                                        <button className="btn-custom btn-custom-primary ml-1 mr-1" onClick={this.AddChannel_Click}>Add Channel</button>
                                                        <button className="btn-custom btn-custom-primary ml-1 mr-1" onClick={(e) => { this.setState({ showUnitProfileSelector: true }); this.forceUpdate(); }}     >Apply Unit Conversion Profile</button>
                                                    </span>
                                                </div>
                                            </GridToolbar>

                                            <Column field="WriteBack" headerClassName="text-center" className="text-center" title="Upload" width="90px"
                                                cell={props => {

                                                    return (
                                                        <td className="text-center">
                                                            <Checkbox
                                                                checked={props.dataItem[props.field]}
                                                                value={props.dataItem[props.field]}
                                                                onChange={e => {
                                                                    props.onChange({
                                                                        dataItem: props.dataItem,
                                                                        dataIndex: props.dataIndex,
                                                                        field: props.field,
                                                                        syntheticEvent: e.syntheticEvent,
                                                                        value: e.value
                                                                    });
                                                                }}
                                                            />

                                                        </td>
                                                    );
                                                }}
                                            />
                                            <Column field="mnemonic" headerClassName="text-center" className="text-left" title="Mnemonic" width="90px" />
                                            <Column field="UnitID" headerClassName="text-center" className="text-left" title="Unit" width="90px" />
                                            <Column
                                                field="VuMaxUnitID"
                                                title="VuMax Unit ID"
                                                cell={props => {
                                                    let index = this.state.UnitList.findIndex(
                                                        item => item.id === props.dataItem[props.field]
                                                    );
                                                    return (
                                                        <td className="text-center">
                                                            <DropDownList
                                                                name="unitList"
                                                                label=""
                                                                data={this.state.UnitList}
                                                                textField="text"
                                                                dataItemKey="id"
                                                                value={this.state.UnitList[index]}
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

                                            <Column field="curveDescription" headerClassName="text-center" className="text-left" title="Description" width="90px" />
                                            <Column field="PiMnemonic" headerClassName="text-center" className="text-left" title="Upload Mnemonic" width="90px" />
                                            <Column field="ValueType" headerClassName="text-center" className="text-left" title="Value Type" width="90px"
                                                cell={props => (
                                                    <td className="text-center">

                                                        {props.dataItem.valueType == 0 ?
                                                            <span > Static</span>
                                                            : null}

                                                        {props.dataItem.valueType == 1 ?
                                                            <span > Calculated</span>
                                                            : null}
                                                    </td>)}

                                            />
                                            <Column field="valueQuery" headerClassName="text-center" className="text-left" title="Expression" width="100px" />
                                            <Column field="DoNotInterpolate" headerClassName="text-center" className="text-center" title="Do not Interpolate" width="90px" />
                                            <Column field="witsmlMnemonic" headerClassName="text-center" className="text-center" title="Witsml Mnemonic" width="90px" />
                                            <Column field="parentMnemonic" headerClassName="text-center" className="text-center" title="Parent Mnemonic" width="90px" />
                                            {true && (<Column field="ColumnOrder" headerClassName="text-center" className="text-center" title="Order" width="90px" />)}

                                            <Column width="70px" headerClassName="text-center" resizable={false} locked={true}
                                                field="editChannels"
                                                title="*"
                                                cell={props => (
                                                    //<td className="text-center">
                                                    <td
                                                        style={props.style}
                                                        className={"text-center k-command-cell " + props.className}
                                                    >
                                                        <span onClick={e => this.cmdEditChannel(e, props.dataItem)}>
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </span>
                                                    </td>
                                                )}
                                            />

                                            <Column width="70px" headerClassName="text-center" resizable={false} locked={true}
                                                field="removeChannels"
                                                title="*"
                                                cell={props => (
                                                    <td
                                                        style={props.style}
                                                        className={"text-center k-command-cell " + props.className}
                                                    >
                                                        {/* <td className={this.props.className + " k-command-cell"} style={this.props.style}> */}
                                                        <span onClick={e => this.cmdRemoveChannels(e, props.dataItem)}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </span>

                                                    </td>
                                                )}
                                            />


                                            {/* {true && <Column field="sensorOffset" headerClassName="text-center" className="text-left" title="sensorOffset" width="100px" />}
                                            {true && <Column field="isStoreProc" headerClassName="text-center" className="text-center" title="isStoreProc" width="90px" />}
                                            {true && <Column field="storedProcParams" headerClassName="text-center" className="text-center" title="storedProcParams" width="90px" />} */}





                                        </Grid>

                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Side Track">
                                    <div>
                                        <Grid
                                            style={{ height: '45vh', width: '30vw' }}
                                            // data={this.state.sideTrackList}
                                            data={this.state.grdSideTrackList != null ? (this.state.grdSideTrackList.map((item: DataObjects.SideTrack) =>
                                                ({ ...item, selected: item.SideTrackID === this.state.currentSideTrackID })
                                            )) : null}
                                            // data={this.state.objTimeLog.sideTracks != null ? (this.state.objTimeLog.sideTracks.map((item: DataObjects.SideTrack) =>
                                            //     ({ ...item, selected: item.SideTrackID === this.state.currentSideTrackID })
                                            // )) : null}


                                            scrollable={"scrollable"}
                                            onRowClick={this.grdSideTrackRowClick}
                                            selectedField="selected"
                                        >
                                            <GridToolbar>
                                                <div >
                                                    <span>
                                                        <button className="btn-custom btn-custom-primary ml-1 mr-1">Add </button>
                                                    </span>
                                                </div>
                                            </GridToolbar>

                                            <Column field="Type" headerClassName="text-center" className="text-left" title="Side Track Info"
                                                cell={props => (

                                                    // if (value.Type == 0) {
                                                    //     strText = "Side track @ " + dtDateTime.ToString("MMM-dd-yyyy HH:mm:ss");
                                                    // } else {
                                                    //     strText = "Depth Reset @ " + dtDateTime.ToString("MMM-dd-yyyy HH:mm:ss");
                                                    // }


                                                    <td className="text-left">

                                                        {/* <span > Side track @ {props.dataItem.valueType} </span> */}
                                                        {props.dataItem.Type == "0" ?

                                                            <span > Side track @ {props.dataItem['DateTime']} </span>
                                                            : <span > Depth Reset @ {props.dataItem['DateTime']} </span>}
                                                        {/*
                                                        {props.dataItem.valueType == "1" ?
                                                            <span > Depth Reset @ {props.dataItem['DateTime']} </span>
                                                            : null} */}
                                                    </td>
                                                )}
                                            />
                                            {false && <Column field="SideTrackID" headerClassName="text-center" className="text-center" title="-" width="90px" />}
                                            <Column width="70px" headerClassName="text-center" resizable={false} locked
                                                field="removeChannels"
                                                title="*"
                                                cell={props => (
                                                    <td
                                                        style={props.style}
                                                        className={"text-center k-command-cell " + props.className}
                                                    >
                                                        {/* <td className={this.props.className + " k-command-cell"} style={this.props.style}> */}
                                                        <span onClick={e => this.cmdRemoveSideTrack(e, props.dataItem)}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </span>

                                                    </td>
                                                )}
                                            />


                                        </Grid>


                                    </div>
                                </TabStripTab>
                                <TabStripTab title="QC Rules">
                                    <div className="row" style={{ width: "500px" }} >
                                        <div className="col">
                                            <MultiSelect
                                                name="QCRules"
                                                data={this.state.QCRulesList}
                                                onChange={this.handleChangeMultiSelect}
                                                value={this.state.QCRules}
                                                textField="text"
                                                dataItemKey="id"
                                            />
                                        </div>
                                        {/* <Grid
                                            style={{ height: '45vh', width: '30vw' }}
                                            data={this.state.QCRulesList}
                                            resizable={true}
                                            scrollable={"scrollable"}
                                        >
                                            <GridToolbar>
                                                <div >
                                                    <span>
                                                        <button className="btn-custom btn-custom-primary ml-1 mr-1">Add </button>
                                                        <button className="btn-custom btn-custom-primary ml-1 mr-1">Remove</button>
                                                    </span>
                                                </div>
                                            </GridToolbar>

                                            {false && (<Column field="RULE_ID" headerClassName="text-center" className="text-center" title="Rule ID" width="90px" />)}
                                            <Column field="RULE_NAME" headerClassName="text-center" className="text-center" title="Rule" width="90px" />

                                        </Grid> */}
                                    </div>
                                </TabStripTab>
                                <TabStripTab title="URL">
                                    <div>

                                        <div className="row mt-5 ml-3 mr-5">
                                            <div className="col">
                                                <Input
                                                    name="wmlsurl"
                                                    style={{ width: "100%" }}
                                                    label="Witsml URL"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.wmlsurl}
                                                    onChange={(e) => this.handleChange(e, "wmlsurl")}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-5 ml-3 mr-5">
                                            <div className="col">
                                                <Input
                                                    name="__dataTableName"
                                                    style={{ width: "100%" }}
                                                    label="DataTable Name"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.__dataTableName}
                                                    onChange={(e) => this.handleChange(e, "__dataTableName")}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Upload">
                                    <div>
                                        <label>Specify the identifiers to use while uploading the data of this time log to WITSML server</label>
                                        <div className="row mt-3 ml-3 mr-5">
                                            <div className="col">
                                                <Input
                                                    name="PiWellID"
                                                    style={{ width: "100%" }}
                                                    label="Well ID"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.PiWellID}
                                                    onChange={(e) => this.handleChange(e, "PiWellID")}
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-2 ml-3 mr-5">
                                            <div className="col">
                                                <Input
                                                    name="PiWellboreID"
                                                    style={{ width: "100%" }}
                                                    label="Wellbore ID"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.PiWellboreID}
                                                    onChange={(e) => this.handleChange(e, "PiWellboreID")}
                                                />
                                            </div>
                                        </div>

                                        <div className="row mt-2 ml-3 mr-5">
                                            <div className="col">
                                                <Input
                                                    name="PiLogID"
                                                    style={{ width: "100%" }}
                                                    label="Log ID"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.PiLogID}
                                                    onChange={(e) => this.handleChange(e, "PiLogID")}
                                                />
                                            </div>
                                        </div>



                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Link Time Log">
                                    <div>
                                        {/* Pending */}
                                        <div className="row pb-3 ">
                                            <div className="mr-5 ml-3 mt-5">
                                                <Checkbox
                                                    id="chkLinkToParent"
                                                    name="linkToParent"
                                                    label='Link this time log to other time log'
                                                    checked={this.state.objTimeLog.LinkToParent}
                                                    value={this.state.objTimeLog.LinkToParent}
                                                    onChange={(e) => this.handleChange(e, "LinkToParent")}
                                                />
                                            </div>
                                        </div>

                                        {this.state.objTimeLog.LinkToParent && (<div className="row pb-3 ">

                                            <div className="col">

                                                <div className="row">
                                                    <div className=" col mr-5 ml-3 mt-5 ">
                                                        <label>Link To</label>
                                                        <div className="col mr-5 ml-3 mt-3">
                                                            <DropDownList
                                                                name="LinkWellIDComboData"
                                                                label='Well'
                                                                data={this.state.WellIDComboData}
                                                                textField="text"
                                                                dataItemKey="id"
                                                                value={this.state.LinkWellIDComboData}
                                                                onChange={this.handleChangeDropDown}
                                                            />
                                                        </div>

                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col mr-5 ml-5 mt-3">

                                                        <DropDownList
                                                            name="LinkWellboreIDComboData"
                                                            label='Wellbore'
                                                            data={this.state.WellboreComboData}
                                                            textField="text"
                                                            dataItemKey="id"
                                                            value={this.state.LinkWellboreIDComboData}
                                                            onChange={this.handleChangeDropDown}
                                                        />
                                                    </div>

                                                </div>

                                                <div className="row">
                                                    <div className="col mr-5 ml-5 mt-3">

                                                        <DropDownList
                                                            name="LinkLogIDComboData"
                                                            label='TimeLog'
                                                            data={this.state.TimeLogComboData}
                                                            textField="text"
                                                            dataItemKey="id"
                                                            value={this.state.LinkLogIDComboData}
                                                            onChange={this.handleChangeDropDown}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col lg-10 sm-5 mr-5 ml-5 mt-3 ">

                                                        <DropDownList
                                                            name="DuplicateActionComboDataList"
                                                            label='Duplicate Action'
                                                            data={this.state.DuplicateActionComboData}
                                                            textField="text"
                                                            dataItemKey="id"
                                                            value={this.state.DuplicateActionValue}
                                                            onChange={this.handleChangeDropDown}
                                                        />

                                                    </div>

                                                </div>
                                                <div className="row">
                                                    <div className="col lg-10 sm-5 mr-5 ml-5 mt-3 ">
                                                        <label>(Select what to do when there is overlap in the data of parent and child time log)</label>
                                                    </div>
                                                </div>

                                            </div>



                                        </div>)}




                                    </div>
                                </TabStripTab>

                                <TabStripTab title="Column Order">
                                    <div>
                                        <div className="row">
                                            <div className="col-8">
                                                <Grid
                                                    style={{ height: '45vh', width: '15vw' }}
                                                    data={this.state.grdColumnOrderList}
                                                    resizable={true}
                                                    scrollable={"scrollable"}
                                                    onRowClick={this.reOrderColumn_RowClick}
                                                >


                                                    {false && (<Column field="ColumnOrder" headerClassName="text-center" className="text-right" title="Order" width="20px" />)}
                                                    {false && (<Column field="mnemonic" headerClassName="text-center" className="text-left" title="Mnemonic" width="100px" />)}
                                                    <Column field="curveDescription" headerClassName="text-center" className="text-left" title="Name" width="250px" />
                                                </Grid>
                                            </div>
                                            <div className="col-2 ml-5">
                                                <div>
                                                    <span
                                                        style={{ fontSize: 40 }}
                                                        className="k-icon k-i-arrow-60-up"
                                                        onClick={this.handleMoveUpColumn}
                                                    />
                                                </div>
                                                <div>
                                                    <span
                                                        style={{ fontSize: 40 }}
                                                        className="k-icon k-i-arrow-60-down"
                                                        onClick={this.handleMoveDownColumn}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </TabStripTab>
                                <TabStripTab title="De-Spike">
                                    <div>
                                        {/* Pending */}
                                        <div className="row">
                                            <div className="col">
                                                <label style={{ fontWeight: 600 }}>
                                                    De-spike Measured Depth Data
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col">
                                                <label >
                                                    This function allows detecting and auto despiking depth data which affects rig states. This function only de-spikes depth data where depth is suddenly increasing while drilling or near bottom.
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col">
                                                <Checkbox
                                                    id="chkDetectSpike"
                                                    name="DetectSpike"
                                                    label='Detect Depth Spikes'
                                                    checked={this.state.objTimeLog.DetectSpike}
                                                    value={this.state.objTimeLog.DetectSpike}
                                                    onChange={(e) => this.handleChange(e, "DetectSpike")}
                                                />
                                            </div>
                                        </div>

                                        <div className="row mt-5 ml-3 mr-5">
                                            <div className="col">
                                                <Input
                                                    name="TolerancePc"
                                                    //style={{ width: "50%" }}
                                                    label="Max. depth change tolerance %"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.TolerancePc}
                                                    onChange={(e) => this.handleChange(e, "TolerancePc")}
                                                />
                                                <label style={{ paddingRight: 10 }}>over</label>
                                                <Input
                                                    name="CheckTimePeriod"
                                                    style={{ width: "50%" }}
                                                    label="seconds, while drilling or near bottom"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.CheckTimePeriod}
                                                    onChange={(e) => this.handleChange(e, "CheckTimePeriod")}
                                                />

                                            </div>
                                        </div>

                                        <div className="row mt-5 ml-3 mr-5">
                                            <div className="col">
                                                <Input
                                                    name="CompareWindow"
                                                    //style={{ width: "50%" }}
                                                    label="Depth comparision window (+/-) %"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.CompareWindow}
                                                    onChange={(e) => this.handleChange(e, "CompareWindow")}

                                                />
                                            </div>

                                        </div>
                                        <div className="row mt-5 ml-3 mr-5">
                                            <div className="col">
                                                <label style={{ paddingLeft: "30px" }}>Used while detecting end of data spike. When depth reaches between this window around start depth, it is considered as spike end</label>
                                            </div>
                                        </div>

                                        <div className="row mt-5 ml-3 mr-5">
                                            <div className="col">
                                                <Input
                                                    name="MaxCloseTime"
                                                    //style={{ width: "50%" }}
                                                    label="Max. time"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.MaxCloseTime}
                                                    onChange={(e) => this.handleChange(e, "MaxCloseTime")}
                                                />
                                                <div className="col">
                                                    <label>
                                                        minutes, to look ahead to find closing of the data spike
                                                    </label>

                                                </div>
                                            </div>

                                        </div>

                                        <div className="row mt-5 ml-3 mr-5">
                                            <div className="col">
                                                <DropDownList
                                                    name="ActionTypeValue"
                                                    label='Action'
                                                    data={this.state.ActionComboData}
                                                    textField="text"
                                                    dataItemKey="id"
                                                    value={this.state.ActionTypeValue}
                                                    onChange={this.handleChangeDropDown}
                                                />
                                            </div>
                                            <label>
                                                Selected action is performed when spike is detected
                                            </label>

                                        </div>

                                        <div className="row mt-5 ml-3 mr-1">
                                            <div className="col">
                                                <Input
                                                    name="NearBottomDistance"
                                                    //style={{ width: "50%" }}
                                                    label="Near bottom distance"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.NearBottomDistance}
                                                    onChange={(e) => this.handleChange(e, "NearBottomDistance")}
                                                />
                                            </div>
                                            <div className="col">
                                                <label>
                                                    depth unit
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Report">
                                    <div>
                                        {/* Pending */}
                                        <div className="row">
                                            <div className="col">
                                                <Checkbox
                                                    id="chkCreateRepOnFormation"
                                                    name="CreateRepOnFormation"
                                                    label='Create Report on approaching formation tops/markers'
                                                    checked={this.state.objTimeLog.CreateRepOnFormation}
                                                    value={this.state.objTimeLog.CreateRepOnFormation}
                                                    onChange={(e) => this.handleChange(e, "CreateRepOnFormation")}
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col">
                                                <DropDownList
                                                    name="SnapJobID"
                                                    label='Action'
                                                    data={this.state.snapshotJobList}
                                                    textField="text"
                                                    dataItemKey="id"
                                                    value={this.state.objTimeLog.SnapJobID}
                                                    onChange={(e) => this.handleChange(e, "SnapJobID")}
                                                />

                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col">
                                                <Input
                                                    name="DepthThreshold"
                                                    //style={{ width: "50%" }}
                                                    label="Depth Threshold"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.DepthThreshold}
                                                    onChange={(e) => this.handleChange(e, "DepthThreshold")}
                                                />

                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col">
                                                <Input
                                                    name="Frequency"
                                                    //style={{ width: "50%" }}
                                                    label="Frequency"
                                                    minLength={2}
                                                    value={this.state.objTimeLog.Frequency}
                                                    onChange={(e) => this.handleChange(e, "Frequency")}
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col">
                                                {/* <Grid>
                                               <GridToolbar>
                                                   <span>
                                                       <button>Add</button>
                                                       <button>Remove</button>
                                                   </span>
                                               </GridToolbar>
                                               data=this.state.FormationTops
                                               <Column field="FORMATION_TOP" title="Formation Tops"
                                               />

                                           </Grid> */}
                                            </div>
                                        </div>
                                    </div>
                                </TabStripTab>
                            </TabStrip>
                        </div>
                    </div>
                </div>

                {/* unitList={this.state.UnitList} dataItem={this.state.channelInEdit} save={this.saveChannelInEdit} cancel={this.cancelChannelInEdit} */}
                {this.state.showChannelInEditor && <TimeLogChannelInLineEditor {...this} />}
                {this.state.showUnitProfileSelector && <UnitProfileSelector {...this} />}
            </>
        );

    }
}





