import React from "react";
import axios from "axios";
import { Grid, GridColumn as Column, GridColumn, GridToolbar } from '@progress/kendo-react-grid';
import { TabStrip, TabStripTab, Splitter, TreeView, processTreeViewItems, Menu, MenuItem, Popup, Window, DropDownList, stringOperator, DropDownButton, DropDownButtonItem, MultiSelect, ListView, Button, Dialog, DialogActionsBar } from '@progress/kendo-react-all';

import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Input, Checkbox, ColorPicker } from "@progress/kendo-react-inputs";


import { comboData } from "../../eVuMaxObjects/UIObjects/comboData";
import * as DataObjects from "../../eVuMaxObjects/dataObjects/dataObjects";

// import { Well, wDateFormatLocal, wDateFormatUTC } from "../../eVuMaxObjects/dataObjects/DataObjects/well"

import '../grid/active-well/active-well.css'
import '@progress/kendo-react-layout';

import DepthLogChannelInLineEditor from "./DepthLogChannelInLineEditor";
import * as utilFunc from '../../utilFunctions/utilFunctions';
import GlobalMod from "../../objects/global";
import { confirmAlert } from "react-confirm-alert";
import { ImageLogChannels } from "../../eVuMaxObjects/dataObjects/DataObjects/ImageLogChannels";
import { Guid } from "guid-typescript";
import UnitProfileSelector from "../UnitProfileComponent/UnitProfileSelector";

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

let _gMod = new GlobalMod();


const searchFieldStyle = {
    // borderRadius: '22px',
    width: '15%',
    borderColor: '#9e9e9e',
    border: '1px solid #252527',
    borderRadius: "22px",
    backgroundColor: '#3e3d42',
    color: '#fff',
    padding: '5px 20px'

}



const headerlabel = {
    fontSize: "16px",
    fontWeights: "700",
    display: 'inline-flex'

}


export interface IProps {

    objDepthLog: DataObjects.DepthLog
    reloadTree: any
}



export default class DepthlogEditor extends React.PureComponent<IProps> {

    constructor(props: any) {
        super(props);

        this.objDepthLog = utilFunc.CopyObject(this.props.objDepthLog);
        this.objDepthLog_Clone = utilFunc.CopyObject(this.props.objDepthLog);
        this.getQCRulesFromDB();
    }

    objDepthLog: DataObjects.DepthLog = new DataObjects.DepthLog();
    objDepthLog_Clone: DataObjects.DepthLog = new DataObjects.DepthLog();

    state = {
        showUnitProfileSelector: false,
        objDepthLog: utilFunc.CopyObject(this.props.objDepthLog),

        // selectedImageDataSet: new DataObjects.ImageLogDataSet(),

        // currentSideTrackID:"",
        UnitList: [] = [new comboData()],
        VuMaxUnitID: new comboData(),
        showLinkToDiv: false,
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
        DepthLogComboData: [] = [new comboData("", "")],

        LinkWellIDComboData: new comboData("", ""),
        LinkWellboreIDComboData: new comboData("", ""),
        LinkLogIDComboData: new comboData("", ""),

        LinkWellID: "",
        LinkWellboreID: "",
        LinkLogID: "",

        ColumnOrderList: [] as DataObjects.logChannel[],
        QCRules: [] as comboData[],  //Nishant 10-06-2020
        QCRulesList: [] as comboData[], //Nishant 10-06-2020

        linkToParent: true,


        //Image Log Dataset
        grdImageLogDataSets: Object.values(this.props.objDepthLog.ImageLogDataSets),
        currentDataSetID: "",
        currentDataSet: new DataObjects.ImageLogDataSet,

        //ImageLog Channel Grid
        grdDataSetChannelList: [] as ImageLogChannels[],
        currentDSChannelID: "",

        //Channel Grid
        grdlogCurves: [] as DataObjects.logChannel[],
        channelInEdit: {}, //04-07-2020 Nishant
        showChannelInEditor: false, //04-07-2020 Nishant
        currentChannel: "",

        currentStartColor: "",
        currentMiddleColor: "",
        currentEndColor: "",

        showAddDatasetChannels: false,
        datasetChannelList: [] as string[],
        selectedDatasetChannels: [] as string[]
    }

    componentWillReceiveProps() {

        if (this.props.objDepthLog.ObjectID == this.objDepthLog.ObjectID) {
            return;
        }
        this.objDepthLog_Clone = utilFunc.CopyObject(this.props.objDepthLog);
        this.objDepthLog = utilFunc.CopyObject(this.props.objDepthLog);
        this.setState({
            objDepthLog: utilFunc.CopyObject(this.props.objDepthLog)
        })

        this.displayData();
    }
    componentWillMount() {
        try {
            this.setState({ DuplicateActionValue: this.state.DuplicateActionComboData[0] });
            this.generateUnitCombo();
            this.generateWellCombo();

        } catch (error) {

        }

    }
    componentDidMount() {
        this.displayData();
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
                let grdChannels = this.state.grdlogCurves;

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
                this.setState({ grdlogCurves: grdChannels });
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


        let QCRuleList = [new comboData()];
        QCRuleList.length = 0; //Clear QCRuleList
        const qcRulelist = Object.values(this.objDepthLog.QCRules);
        qcRulelist.forEach(function (value: any) {
            let QCRule = new comboData();
            QCRule.id = value.RuleID;
            QCRule.text = value.RuleName
            QCRuleList.push(QCRule);
        });

        this.setState({
            QCRules: QCRuleList
        })

        //Populate LogCurve List for channel selection
        let CurveList = [{}];

        CurveList.length = 0;
        const curveList = Object.values(this.objDepthLog.logCurves);

        curveList.forEach(function (logCurve: any) {
            CurveList.push(logCurve.mnemonic);
        });
        this.setState({
            datasetChannelList: CurveList//CurveList
        });

        //Load channels to grdLogCurves

        this.setState({
            grdlogCurves: Object.values(this.objDepthLog.logCurves)
        });



        // //Reset Rgb colors to Hexa In ImageLogDataSets
        let ImageLogDataSet: DataObjects.ImageLogDataSet[] = [];
        ImageLogDataSet = Object.values(this.objDepthLog.ImageLogDataSets);

        ImageLogDataSet.forEach(function (ImageLog: DataObjects.ImageLogDataSet) {

            ImageLog.StartColor = utilFunc.rgb2hex("rgba(" + ImageLog.StartColor + ")");
            ImageLog.MiddleColor = utilFunc.rgb2hex("rgba(" + ImageLog.MiddleColor + ")");
            ImageLog.EndColor = utilFunc.rgb2hex("rgba(" + ImageLog.EndColor + ")");

            let newChannels = Object.values(ImageLog.channels);
            ImageLog.channels = newChannels;
        });

        this.setState({
            grdImageLogDataSets: ImageLogDataSet,
            grdDataSetChannelList: [] as ImageLogChannels[], //clear grdImageLogChannel
            currentDataSet: new DataObjects.ImageLogDataSet
        });


        this.setState({
            LinkWellIDComboData: utilFunc.setComboValue(this.state.WellIDComboData, this.objDepthLog.LinkWellID),
            LinkWellID: this.objDepthLog.LinkWellID,
            LinkWellboreID: this.objDepthLog.LinkWellboreID,
            LinkLogID: this.objDepthLog.LinkLogID
        });

        if (this.objDepthLog.LinkWellID != "") {
            let objComboData: comboData = new comboData(this.objDepthLog.WellID, this.objDepthLog.nameWell);
            this.setState({ LinkWellIDComboData: objComboData });
            this.generateWellboreCombo(this.objDepthLog.LinkWellID);
        }



    }

    cmdSave_click = () => {


        let objDepthLog = new DataObjects.DepthLog();
        objDepthLog = utilFunc.CopyObject(this.state.objDepthLog);

        //Convert curve array to Map
        let newCurveLog: Map<string, DataObjects.logChannel> = new Map();
        this.state.grdlogCurves.forEach((objCurveLog: DataObjects.logChannel) => {
            newCurveLog.set(objCurveLog.mnemonic, objCurveLog);
        });

        objDepthLog.logCurves = utilFunc.convertMapToDictionaryJSON(newCurveLog);

        //convert QcRules array to Map
        let newQCList: Map<string, DataObjects.QCRule> = new Map();
        if (this.state.QCRules.length > 0) {
            this.state.QCRules.forEach((objComboDataList: comboData) => {
                let objQCRule: DataObjects.QCRule = new DataObjects.QCRule;
                objQCRule.RuleID = objComboDataList.id;
                objQCRule.Channels = null;
                newQCList.set(objComboDataList.id, objQCRule);
            });
        }

        objDepthLog.QCRules = utilFunc.convertMapToDictionaryJSON(newQCList);

        //convert ImageLogDataSet to Map
        let newImageLogDataSet: Map<string, DataObjects.ImageLogDataSet> = new Map();
        this.state.grdImageLogDataSets.forEach((objImglogDataSet: DataObjects.ImageLogDataSet) => {
            newImageLogDataSet.set(objImglogDataSet.DataSetID, objImglogDataSet);
            //add Channels to it
            let newChannelList: Map<string, DataObjects.ImageLogChannels> = new Map();

            objImglogDataSet.channels.forEach((objImgChannel: DataObjects.ImageLogChannels) => {
                newChannelList.set(objImgChannel.Mnemonic, objImgChannel);
            });
            newImageLogDataSet.get(objImglogDataSet.DataSetID).channels = utilFunc.convertMapToDictionaryJSON(newChannelList);

        });
        objDepthLog.ImageLogDataSets = utilFunc.convertMapToDictionaryJSON(newImageLogDataSet);

        console.log('DepthLog', objDepthLog);

        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "Well.Data.Objects";
        objBrokerRequest.Function = "UpdateDepthLog";
        objBrokerRequest.Broker = "WellObjectManager";

        objParameter = new BrokerParameter('UserName', _gMod._userId);

        objBrokerRequest.Parameters.push(objParameter);
        objParameter = new BrokerParameter('Update', JSON.stringify(objDepthLog));
        objBrokerRequest.Parameters.push(objParameter);

        axios.post(_gMod._performTask, {
            paramRequest: JSON.stringify(objBrokerRequest),
        }).then((response) => {
            this.props.reloadTree("showDepthLogEditor", false);
        })
            .catch(function (error) {
            });
    }

    cmdCancel_click = () => {
        // this.setState({
        //     objDepthLog: utilFunc.CopyObject(this.objDepthLog_Clone)
        // });
        // this.displayData();

        //Nishant 24-09-2020
        this.props.reloadTree("showDepthLogEditor", true);
    }

    AddChannel_Click = () => {
        this.setState({
            showChannelInEditor: !this.state.showChannelInEditor,
            channelInEdit: new DataObjects.logChannel
        });

    }

    grdDatasetChannelRowClick = (event: any) => {

        const objRow = event.dataItem;

        this.setState({
            currentDSChannelID: objRow.Mnemonic
        });

    }
    grdImageDataSetRowClick = (event: any) => {



        const objRow = event.dataItem;

        this.setState({
            currentDataSetID: "",
            currentDataSet: objRow,
            currentStartColor: objRow.StartColor.startsWith("#") ? objRow.StartColor : utilFunc.rgb2hex(objRow.StartColor),
            currentEndColor: objRow.EndColor.startsWith("#") ? objRow.EndColor : utilFunc.rgb2hex(objRow.EndColor),
            currentMiddleColor: objRow.MiddleColor.startsWith("#") ? objRow.MiddleColor : utilFunc.rgb2hex(objRow.MiddleColor)
        });
        this.setState({
            grdImageLogDataSets: [...this.state.grdImageLogDataSets]
        });

        let newData: any = Object.values([...this.state.grdImageLogDataSets]);
        let index = newData.findIndex((item: any) => item.DataSetID === objRow.DataSetID); // use unique value like ID
        let Channels: any = Object.values(newData[index].channels).sort((a: any, b: any) => (a.DisplayOrder > b.DisplayOrder) ? 1 : -1);
        this.setState({ grdDataSetChannelList: Channels });




        this.forceUpdate();

    }

    grdImageDataSetRowDbClick = (event: any) => {
        const objRow = event.dataItem;
        this.setState({
            currentDataSetID: objRow.DataSetID
        });
    }



    grdImageDatasetItemChange = (event: any) => {


        event.dataItem[event.field] = event.value;

        this.setState({
            grdImageLogDataSets: [...this.state.grdImageLogDataSets]
        });

        let newData: any = Object.values([...this.state.grdImageLogDataSets]);
        let index = newData.findIndex((item: any) => item.DataSetID === event.dataItem.DataSetID); // use unique value like ID
        newData[index][event.field] = event.value;
        this.setState({ grdImageLogDataSets: newData })
    }

    grdChannelRowClick = (event: any) => {

        this.setState({
            currentChannel: event.dataItem.mnemonic
        });

    };

    cmdEditChannel = (event: any, dataItem: any) => {

        this.setState({
            showChannelInEditor: !this.state.showChannelInEditor,
            channelInEdit: dataItem
        });

    }

    cmdRemoveChannels = (event: any, rowData: any) => {

        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {

                        let Channels = this.state.grdlogCurves;
                        let objRow = rowData;
                        let mnemonic = objRow.mnemonic;// MNEMONIC;
                        let index = Channels.findIndex((d: any) => d.mnemonic === mnemonic); //find index in your array
                        Channels.splice(index, 1);//remove element from array
                        this.setState({
                            grdlogCurves: Channels
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

    handleMoveUp = () => {

        if (this.state.grdDataSetChannelList.length > 0) {
            let index = this.state.grdDataSetChannelList.findIndex((item: any) => item["Mnemonic"] === this.state.currentDSChannelID
            );
            if (index > 0) {
                let data = [...this.state.grdDataSetChannelList];
                let value = data[index - 1];

                data[index - 1] = data[index];
                data[index] = value;
                this.setState({
                    grdDataSetChannelList: data
                });
            }

            // const selectedDSChannel = this.state.selectedDSChannel;
            // const selectedImageDataSet = this.state.selectedImageDataSet;
            // let index = this.state.objDepthLog.ImageLogDataSet.findIndex((item: any) => item["DataSetID"] === selectedImageDataSet.DataSetID);

            // if (index > 0) {
            //     let DSChannelList = [...this.state.objDepthLog.ImageLogDataSet[index]];
            //     //Now find DSChannel into ImageLogDataSetChannel List
            //     let index_ = DSChannelList.findIndex((item: any) => item["Mnemonic"] === selectedDSChannel.Mnemonic);
            //     if (index_ > 0) {
            //         let data = DSChannelList;
            //         let value = data[index_ - 1];
            //         data[index - 1] = data[index];
            //         data[index] = value;
            //         DSChannelList = data;

            //         let ImageLogDataSet = this.state.objDepthLog.ImageLogDataSet;
            //         ImageLogDataSet[index] = DSChannelList;
            //         let newDepthLog = this.state.objDepthLog;
            //         //Pending

            //         this.setState({
            //             objDepthLog: newDepthLog
            //         });
            //     }
            // }
        }
    };

    handleMoveDown = () => {

        //Pending
        if (this.state.grdDataSetChannelList.length > 0) {
            let index = this.state.grdDataSetChannelList.findIndex((item: any) => item.Mnemonic === this.state.currentDSChannelID);
            if (index < this.state.grdDataSetChannelList.length - 1 && index >= 0) {
                let data = [...this.state.grdDataSetChannelList];
                let value = data[index + 1];
                data[index + 1] = data[index];
                data[index] = value;
                this.setState({
                    grdDataSetChannelList: data
                });
            }
        }
    };
    cmdAddDataSet = () => {

        let objNewDataSet: DataObjects.ImageLogDataSet = new DataObjects.ImageLogDataSet();
        objNewDataSet.DataSetID = Guid.create().toString();
        objNewDataSet.DataSetName = "New DataSet";
        let imgDataset = this.state.grdImageLogDataSets;
        imgDataset.push(objNewDataSet);
        this.setState({
            grdImageLogDataSets: imgDataset
        });
        this.forceUpdate();

    }
    cmdRemoveDataSetChannel = (event: any, rowData: any) => {
        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {

                        let Channels = this.state.grdDataSetChannelList;

                        let objRow = rowData;
                        let mnemonic = objRow.Mnemonic;// MNEMONIC;
                        let index = Channels.findIndex((d: any) => d.Mnemonic === mnemonic); //find index in your array
                        Channels.splice(index, 1);//remove element from array
                        this.setState({
                            grdDataSetChannelList: Channels
                        });
                        //Update DataSet Channels also
                        const edited = this.state.grdImageLogDataSets;
                        index = edited.findIndex((d: any) => d.DataSetID === this.state.currentDataSet.DataSetID);
                        edited[index].channels = this.state.grdDataSetChannelList;
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
    cmdRemoveDataSet = (event: any, rowData: any) => {

        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {

                        let DataSetList = this.state.grdImageLogDataSets;
                        let objRow = rowData;
                        let dataSetID = objRow.DataSetID;// MNEMONIC;
                        let index = DataSetList.findIndex((d: any) => d.DataSetID === dataSetID); //find index in your array
                        DataSetList.splice(index, 1);//remove element from array
                        this.setState({
                            grdImageLogDataSets: DataSetList,
                            grdDataSetChannelList: [] as ImageLogChannels[],
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
        // this.setState({
        //     logCurveList: [...this.state.logCurveList]
        // });

        //let newData: any = Object.values([...this.state.objDepthLog.logCurves]);
        let newData: any = Object.values([...this.state.grdlogCurves]);
        let index = newData.findIndex((item: any) => item.mnemonic === e.dataItem.mnemonic); // use unique value like ID
        newData[index][e.field] = e.value;
        this.setState({ grdlogCurves: newData })
    };

    handleChangeDropDown = (event: any) => {
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
            this.generateDepthLogCombo(event.value.id)

        }

        if (event.target.name == "LinkLogIDComboData") {
            this.setState({ LinkLogID: event.value.id });
        }
    }
    //#region Generate Combos


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

    generateDepthLogCombo = (wellboreID: string) => {
        try {


            let wellID = this.state.LinkWellIDComboData.id;
            this.setState({ LinkLogID: "" });
            this.setState({ isProcess: true });
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getTable";
            objBrokerRequest.Broker = "WellBroker";

            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT LOG_ID,LOG_NAME FROM VMX_DEPTH_LOG WHERE WELL_ID='" + wellID + "' AND WELLBORE_ID='" + wellboreID + "' ORDER BY LOG_NAME"
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

                        let DepthLogCombodata: comboData = new comboData("", "");
                        DepthLogCombodata.id = value.LOG_ID;
                        DepthLogCombodata.text = value.LOG_NAME;
                        ComboData.push(DepthLogCombodata);
                    });

                    this.setState({ DepthLogComboData: ComboData });


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
            let NewlogCurveList: any = this.state.grdlogCurves;
            NewlogCurveList.push(dataItem);
            this.setState({
                logCurveList: NewlogCurveList
            });
        } else {

            let newData: any = Object.values([...this.state.grdlogCurves]);


            let index = newData.findIndex((item: any) => item.mnemonic === dataItem.mnemonic); // use unique value like ID

            newData[index] = dataItem;
            this.setState({ grdlogCurves: newData })
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

        this.setState({ [event.target.name]: event.value });
    }


    handleChange = (event: any, field: string) => {


        const value = event.value;
        const name = field;

        if (field == "AddDatasetChannels") {
            let channels = this.state.selectedDatasetChannels;
            for (let i = 0; i < value.length; i++) {
                const channel = value[i];
                let index = channels.findIndex(item => item == channel);
                if (index < 0) { //not found
                    channels.push(channel);
                }
            }

            this.setState({
                selectedDatasetChannels: channels
            });

            return;
        }


        if (field == "linkToParent") {
            this.setState({ showLinkToDiv: event.value });
        }

        {/* currentStartColor:"",     currentMiddleColor:"",       currentEndColor: "", */ }

        if (field == "currentStartColor") {

            let edited = this.state.currentDataSet;
            edited.StartColor = utilFunc.rgb2hex(value);

            let index = this.state.grdImageLogDataSets.findIndex(item => item.DataSetID == edited.DataSetID);
            if (index >= 0) {
                let newData: any = Object.values([...this.state.grdImageLogDataSets]);
                newData[index] = edited;
                this.setState({
                    grdImageLogDataSets: newData,
                    currentStartColor: utilFunc.rgb2hex(value)

                });

            }

            return;
        }

        if (field == "currentMiddleColor") {
            let edited = this.state.currentDataSet;

            edited.MiddleColor = utilFunc.rgb2hex(value);
            let index = this.state.grdImageLogDataSets.findIndex(item => item.DataSetID == edited.DataSetID);
            if (index >= 0) {
                let newData: any = Object.values([...this.state.grdImageLogDataSets]);
                newData[index] = edited;
                this.setState({
                    grdImageLogDataSets: newData,
                    currentMiddleColor: utilFunc.rgb2hex(value)

                })

            }
            return;
        }

        if (field == "currentEndColor") {
            let edited = this.state.currentDataSet;
            edited.EndColor = utilFunc.rgb2hex(value);

            let index = this.state.grdImageLogDataSets.findIndex(item => item.DataSetID == edited.DataSetID);
            if (index >= 0) {
                let newData: any = Object.values([...this.state.grdImageLogDataSets]);
                newData[index] = edited;
                this.setState({
                    grdImageLogDataSets: newData,
                    currentEndColor: utilFunc.rgb2hex(value)

                });

            }
            return;
        }

        let edited: any = utilFunc.CopyObject(this.state.objDepthLog);
        edited[field] = value;
        this.setState({
            objDepthLog: edited
        });
    };




    //Tabsrip control
    handleTabSelect = (e: any) => {
        this.setState({ selected: e.selected });
    }

    render() {
        let loader = this.state;
        return (
            <>
                {/* <label>Time Log Editor</label> */}
                <div className="row" style={{ position: "sticky", top: "0", padding: "10px" }} >
                    <h2>Depth Log Editor</h2>
                </div>
                <div id="mainContainer_" style={{ height: '76vh', width: '70vw' }}>


                    <div className="row">
                        <legend>

                            <span className="float-left">  <button hidden type="button" onClick={this.cmdSave_click} className="btn-custom btn-custom-primary mr-1">
                                Save</button>
                                <button type="button" onClick={this.cmdCancel_click} className="btn-custom btn-custom-primary ml-1">
                                    Cancel</button>
                            </span></legend>





                    </div>

                    <div className="row">
                        <div id="mainContainer" style={{ height: "70vh" }}>
                            <TabStrip selected={this.state.selected} onSelect={this.handleTabSelect} keepTabsMounted={true} >
                                {/* <TabStrip selected={this.state.selected} onSelect={this.handleSelect} > */}
                                <TabStripTab title="Log Information">
                                    <div id="tabWellInfo1" style={{marginLeft:"23px"}}>

                                        <div>
                                            <div className="row pb-3">

                                                <div className="col"><Input
                                                    name="LogName"
                                                    label="Log Name"
                                                    pattern={"[A-Za-z]+"}
                                                    minLength={2}
                                                    required={true}
                                                    validationMessage={"Please Enter Log Name"}
                                                    value={this.state.objDepthLog.nameLog}
                                                    onChange={(e) => this.handleChange(e, "LogName")}

                                                /></div>
                                                <div className="col">
                                                    <Input
                                                        name="serviceCompany"
                                                        // style={{ width: "100%" }}
                                                        label="Service Company"
                                                        minLength={2}
                                                        value={this.state.objDepthLog.serviceCompany}
                                                        onChange={(e) => this.handleChange(e, "serviceCompany")}


                                                    />
                                                </div>

                                                <div className="col">
                                                    <Input
                                                        name="EDRProvider"
                                                        // style={{ width: "100%" }}
                                                        label="EDR Provider"
                                                        minLength={2}
                                                        value={this.state.objDepthLog.EDRProvider}
                                                        onChange={(e) => this.handleChange(e, "EDRProvider")}

                                                    />
                                                </div>

                                                <div className="col">
                                                    <Input
                                                        name="runNumber"
                                                        // style={{ width: "100%" }}
                                                        label="Run No"
                                                        minLength={2}
                                                        value={this.state.objDepthLog.runNumber}
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
                                                    value={this.state.objDepthLog.description}
                                                    onChange={(e) => this.handleChange(e, "description")}
                                                />


                                                </div>

                                            </div>

                                            <div className="row">
                                                <div className="col">
                                                    <Checkbox
                                                        name="PrimaryLog"
                                                        label='Primary Log'
                                                        checked={this.state.objDepthLog.PrimaryLog}
                                                        value={this.state.objDepthLog.PrimaryLog}
                                                        onChange={(e) => this.handleChange(e, "PrimaryLog")}
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

                                            data={this.state.grdlogCurves != null ? (this.state.grdlogCurves.map((item: DataObjects.logChannel) =>
                                                ({ ...item, selected: item.mnemonic === this.state.currentChannel })
                                            )) : null}
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
                                            <Column field="Unit" headerClassName="text-center" className="text-left" title="Unit" width="90px" />
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
                                            <Column field="witsmlMnemonic" headerClassName="text-center" className="text-center" title="Witsml Mnemonic" width="90px" />
                                            <Column field="parentMnemonic" headerClassName="text-center" className="text-center" title="Parent Mnemonic" width="90px" />
                                            {false && (<Column field="ColumnOrder" headerClassName="text-center" className="text-center" title="Order" width="90px" />)}

                                            <Column width="70px" headerClassName="text-center" resizable={false} locked={true}
                                                field="editChannels"
                                                title="*"
                                                cell={props => (
                                                    //<td className="text-center">
                                                    <td className="text-center k-grid-content-sticky k-command-cell">
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
                                                    <td className="text-center k-grid-content-sticky k-command-cell">

                                                        <span onClick={e => this.cmdRemoveChannels(e, props.dataItem)}>
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
                                                    value={this.state.objDepthLog.wmlsurl}
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
                                                    value={this.state.objDepthLog.__dataTableName}
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
                                                    value={this.state.objDepthLog.PiWellID}
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
                                                    value={this.state.objDepthLog.PiWellboreID}
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
                                                    value={this.state.objDepthLog.PiLogID}
                                                    onChange={(e) => this.handleChange(e, "PiLogID")}
                                                />
                                            </div>
                                        </div>



                                    </div>
                                </TabStripTab>
                                <TabStripTab title="Image Log Datasets">
                                    <div>
                                        <label>
                                            Identify the Image Log datasets contained in the depth log. Click on the 'Add Dataset' and then add the channels that belongs to the image log.
                                        </label>
                                        <div className="row pb-3 ">
                                            <div className="col-6" >
                                                <Grid
                                                    //data={Object.values(this.state.objDepthLog.ImageLogDataSets)}
                                                    data={this.state.grdImageLogDataSets != null ? (this.state.grdImageLogDataSets.map((item: any) =>
                                                        ({ ...item, selected: item.DataSetID === this.state.currentDataSetID })
                                                    )) : null}

                                                    style={{ height: '50vh' }}
                                                    onRowClick={this.grdImageDataSetRowClick}
                                                    onItemChange={this.grdImageDatasetItemChange}
                                                    onRowDoubleClick={this.grdImageDataSetRowDbClick}
                                                    editField="selected"
                                                >
                                                    <GridToolbar>
                                                        <Button onClick={this.cmdAddDataSet} > Add Dataset</Button>
                                                    </GridToolbar>

                                                    {false && (<Column field="DataSetID" title="DataSetID" />)}
                                                    <Column field="DataSetName" title="Dataset Name" />


                                                    <Column width="70px" headerClassName="text-center" resizable={false} locked={true}
                                                        field="removeDataSet"
                                                        title="*"
                                                        cell={props => (
                                                            <td className="text-center k-grid-content-sticky k-command-cell">
                                                                {/* <td className={this.props.className + " k-command-cell"} style={this.props.style}> */}
                                                                <span onClick={e => this.cmdRemoveDataSet(e, props.dataItem)}>
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </span>

                                                            </td>
                                                        )}
                                                    />



                                                </Grid>
                                            </div>
                                            <div className="col-4">
                                                <Grid
                                                    //data={this.state.grdDataSetChannelList}
                                                    data={this.state.grdDataSetChannelList != null ? (this.state.grdDataSetChannelList.map((item: any) =>
                                                        ({ ...item, selected: item.Mnemonic === this.state.currentDSChannelID })
                                                    )) : null}
                                                    onRowClick={this.grdDatasetChannelRowClick}
                                                    style={{ height: '50vh' }}
                                                    selectedField="selected"

                                                >
                                                    <GridToolbar>
                                                        <Button disabled={!this.state.currentDataSet.DataSetID} id="cmdChannelsToImgDataset" onClick={(e: any) => {
                                                            this.setState({
                                                                showAddDatasetChannels: true
                                                            });
                                                        }} > Add Channels</Button>
                                                    </GridToolbar>

                                                    <Column field="Mnemonic" title="Channels" />
                                                    {false && (<Column field="DisplayOrder" title="DisplayOrder" />)}
                                                    <Column width="70px" headerClassName="text-center" resizable={false} locked={true}
                                                        field="removeDataSetChannel"
                                                        title="*"
                                                        cell={props => (
                                                            <td className="text-center k-grid-content-sticky k-command-cell">

                                                                <span onClick={e => this.cmdRemoveDataSetChannel(e, props.dataItem)}>
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </span>

                                                            </td>
                                                        )}
                                                    />
                                                </Grid>
                                            </div>
                                            <div className="col-2">
                                                <div className="row">
                                                    <div className="col">
                                                        <Button onClick={this.handleMoveUp}> <FontAwesomeIcon icon={faArrowUp} /></Button>
                                                    </div>
                                                </div>
                                                <div className="row mt-5">
                                                    <div className="col">
                                                        <Button onClick={this.handleMoveDown}><FontAwesomeIcon icon={faArrowDown} /></Button>
                                                    </div>
                                                </div>


                                            </div>

                                        </div>
                                        <div className="row">
                                            <div className="col-6">

                                            </div>
                                            <div className="col-6">
                                                <label className="rm-5" >Color Map</label>
                                                <ColorPicker view="gradient" defaultValue={this.state.currentStartColor} value={this.state.currentStartColor} onChange={(e) => this.handleChange(e, "currentStartColor")} />
                                                <ColorPicker view="gradient" defaultValue={'green'} value={this.state.currentMiddleColor} onChange={(e) => this.handleChange(e, "currentMiddleColor")} />
                                                <ColorPicker view="gradient" defaultValue={'green'} value={this.state.currentEndColor} onChange={(e) => this.handleChange(e, "currentEndColor")} />
                                            </div>
                                        </div>

                                    </div>
                                </TabStripTab>



                                <TabStripTab title="Link Depth Log">
                                    <div>
                                        <div className="row pb-3 ">
                                            <div className="mr-5 ml-3 mt-5">
                                                <Checkbox
                                                    id="chkLinkToParent"
                                                    name="linkToParent"
                                                    label='Link this Depth log to other Depth log'
                                                    checked={this.state.objDepthLog.linkToParent}
                                                    value={this.state.objDepthLog.linkToParent}
                                                    onChange={(e) => this.handleChange(e, "linkToParent")}
                                                />
                                            </div>
                                        </div>

                                        {this.state.showLinkToDiv && (<div className="row pb-3 ">

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
                                                            label='DepthLog'
                                                            data={this.state.DepthLogComboData}
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
                                                        <label>(Select what to do when there is overlap in the data of parent and child Depth log)</label>
                                                    </div>
                                                </div>

                                            </div>



                                        </div>)}
                                    </div>
                                </TabStripTab>
                            </TabStrip>
                        </div>
                    </div>
                </div>

                {this.state.showChannelInEditor && <DepthLogChannelInLineEditor unitList={this.state.UnitList} dataItem={this.state.channelInEdit} save={this.saveChannelInEdit} cancel={this.cancelChannelInEdit} />}

                {this.state.showAddDatasetChannels && <Dialog

                    width={500}
                    height={300}
                    title={"Select Channels"}
                    onClose={(e: any) => {
                        this.setState({
                            showAddDatasetChannels: false
                        });
                    }}
                >
                    <MultiSelect
                        style={{ width: "100%" }}
                        data={this.state.datasetChannelList}
                        itemRender={this.itemRender}
                        autoClose={false}
                        // value={value}
                        onChange={(e) => this.handleChange(e, "AddDatasetChannels")}
                    />

                    <DialogActionsBar>
                        <button className="k-button k-primary" onClick={(e: any) => {

                            if (this.state.selectedDatasetChannels.length == 0) {
                                confirmAlert({
                                    //title: 'eVuMax',
                                    message: 'Please Select atleast one channel',
                                    childrenElement: () => <div />,
                                    buttons: [
                                        {
                                            label: 'Ok',
                                            onClick: () => {

                                                return;

                                            }

                                        },
                                    ]
                                });
                            } else {

                                let datasetID = this.state.currentDataSet.DataSetID;
                                let edited = this.state.grdImageLogDataSets;

                                for (let i = 0; i < edited.length; i++) {
                                    if (edited[i].DataSetID == datasetID) {

                                        let newChannels = this.state.selectedDatasetChannels;

                                        for (let j = 0; j < newChannels.length; j++) {
                                            let objImageLogChannel = new DataObjects.ImageLogChannels();
                                            objImageLogChannel.Mnemonic = newChannels[j];
                                            edited[i].channels.push(objImageLogChannel);
                                        }

                                        //ReOrder Channels

                                        for (let k = 0; k < edited[i].channels.length; k++) {
                                            edited[i].channels[k].DisplayOrder = k;
                                        }

                                        edited[i].channels.sort((a: any, b: any) => (a.DisplayOrder > b.DisplayOrder) ? 1 : -1);

                                        this.setState({
                                            grdDataSetChannelList: edited[i].channels
                                        });

                                    }
                                }
                                this.setState({
                                    grdImageLogDataSets: edited,
                                    selectedDatasetChannels: [],
                                    showAddDatasetChannels: false
                                });
                                this.forceUpdate();
                            }

                        }}>Save</button>
                        <button className="k-button" onClick={(e: any) => {
                            this.setState({
                                selectedDatasetChannels: [],
                                showAddDatasetChannels: false
                            });
                        }}>Cancel</button>
                    </DialogActionsBar>
                </Dialog>}


                {this.state.showUnitProfileSelector && <UnitProfileSelector {...this} />}
            </>
        );
    }
    itemRender = (li: any, itemProps: any) => {
        console.log(this.state.objDepthLog.logCurves);
        const itemChildren = (
            <span>
                <input type="checkbox" checked={itemProps.selected} onChange={() => { }} />
                &nbsp;{li.props.children}
            </span>
        );
        return React.cloneElement(li, li.props, itemChildren);
    }
}





