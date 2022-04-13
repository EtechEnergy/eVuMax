import React from "react";
import axios from "axios";

import { Splitter, TreeView, Menu, MenuItem, Popup, Window, Dialog, DropDownButton, DropDownButtonItem, Push, Input, Button, processTreeViewItems, } from "@progress/kendo-react-all";

import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";



import CustomLoader from "../loader/loader";

import WellEditor from "../wellObjectComponent/wellEditor";

import * as DataObjects from "../../eVuMaxObjects/dataObjects/dataObjects";
import * as UI from "../../eVuMaxObjects/UIObjects/NodeTree";

import "@progress/kendo-react-layout";
import TimeLogEditor from "../TimeLogComponents/timelogEditor";
import TrajectoryEditor from "../TrajectoryComponents/trajectoryEditor";
//25-06-2020 Nishant
import MudLogEditor from "../MudLogComponents/mudLogEditor";

import "../grid/active-well/active-well.css";

import { mudLog } from "../../eVuMaxObjects/dataObjects/DataObjects/mudLog";

import DepthlogEditor from "../DepthLogComponents/DepthlogEditor";

import GlobalMod from "../../objects/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faDatabase, faEdit, faPen, faServer } from "@fortawesome/free-solid-svg-icons";
import ServerEditor from "./ServerEditor";
import * as node from "../../eVuMaxObjects/downloadManager/witsmlNode"
import { witsmlServer } from "../../eVuMaxObjects/downloadManager/witsmlServer";
import ReactConfirmAlert, { confirmAlert } from "react-confirm-alert";
import * as utilFunc from '../../utilFunctions/utilFunctions';

let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

// export interface IProps {
//   wellID: string;
// }

export default class WitsmlExplorer extends React.Component {
    props: any = this.props;

    constructor(props: any) {
        super(props);
        //   this.wellID = props.match.params.WellId;

    }

    wellID: string | "" = "";
    //objWell: DataObjects.Well = new DataObjects.Well();
    objTreeNodes: any[] = [];
    state = {

        EditingInProgress: false,
        currentLogID: "",
        previousLogID: "",
        showTrajectoryEditor: false,
        showTimeLogEditor: false,
        showWellEditor: false,
        showDownloadLogWindow: false,

        showMudLogEditor: false,
        showDepthLogEditor: false,
        objDepthLog: new DataObjects.DepthLog(),


        wellID: "",




        isParentSelected: false,
        contextMenuOffset: { left: 0, top: 0 },
        menuType: UI.enumNodeType.none,
        objWell: new DataObjects.Well(),
        tree: [] as any,

        //09-6-2020 Nishant
        objTimeLog: new DataObjects.TimeLog(),
        //11-06-2020
        isProcess: false,
        //16-06-2020 Nishant
        objTrajectory: new DataObjects.Trajectory(),
        //25-06-2020 Nishant
        objMudLog: new DataObjects.mudLog(),

        contextMenuShow: false,



        //fresh Code
        //************************ */
        showWitsmlLoginDialog: false,
        DownloadInProgress: false,
        objNode: new node.witsmlNode(), //from here new code
        selectedNode: new node.witsmlNode(),
        isLoaded: false,
        error: "",
        selected: 0,
        panes: [
            { size: "20%", min: "20px", collapsible: true },
            {},
            { size: "80%", min: "20px", collapsible: true },
        ],
        showServerEditor: false,
        serverList: [] as witsmlServer[],
        witsmlServerUserName: "",
        witsmlServerPassword: "",
        selectedNodeArr: [] as any,
        downloadQueue: [] as node.witsmlNode[],

    };

    componentWillUpdate() {
        _gMod = new GlobalMod();
        if (_gMod._userId == "" || _gMod._userId == undefined) {
            window.location.href = "/evumaxapp/";
            return;
        }

    }
    componentWillMount() {

        this.setState({
            wellID: this.props.match.params.WellId
        });

    }

    componentDidMount() {
        document.title = "eVuMax";//Nishant 02/09/2021
        this.setState({ isProcess: false });
        this.loadServer();
    }


    //#region "Context Menu onTreeView"
    closeContextMenu = () => {
        setTimeout(() => {
            this.setState({
                contextMenuShow: false
            })
        }, 200)
    }

    searchTree(treeNode: any, NodeText: any): any {


        if (treeNode.text == NodeText) {
            return treeNode;
        } else if (treeNode.items != null) {
            var i;
            var result = null;
            for (i = 0; result == null && i < treeNode.items.length; i++) {
                result = this.searchTree(treeNode.items[i], NodeText);
            }
            return result;
        }
        return null;
    }

    handleContextMenu = (event: any) => {


        event.preventDefault();

        //let itemId = event.target.childNodes.length> 0 ? event.target.childNodes[1].data : "Main" //0 is img tag coz of image display
        let itemId = event.target.childNodes.length > 0 ? event.target.childNodes[1].data : ""; //0 is img tag coz of image display
        if (itemId == "") {
            alert("Please select Node from Tree");
            return;
        }
        let objNode = null

        for (let i = 0; i < this.state.tree.length; i++) {
            objNode = this.searchTree(this.state.tree[0], itemId);
            if (objNode !== null) {
                break;
            }
        }
        let isParentSelected = false

        let nodeType = objNode.nodeType;
        this.state.tree.map((item: any) => {

            if (item.nodeType === nodeType) {
                isParentSelected = true
            }
        })


        this.setState({
            contextMenuShow: true,
            contextMenuOffset: {
                left: event.clientX,
                top: event.clientY
            },
            menuType: nodeType,
            isParentSelected: isParentSelected,
            objNode: objNode
        });

    };

    onMenuSelect = (event: any) => {
        let objParentNode = this.state.objNode;
        this.setState({
            isParentSelected: false,
            contextMenuShow: false
        });



        if (event.item.data.logType == "0", event.item.data.id == "mnuLoginServer") {
            this.setState({
                showWitsmlLoginDialog: !this.state.showWitsmlLoginDialog
            })

        }



     

    }
    ////#region



    loadServerTreeAgain = (showEditor: string, isCancelled: boolean) => {


        this.setState({
            showTrajectoryEditor: false,
            showTimeLogEditor: false,
            showWellEditor: false,
            showDepthLogEditor: false,
            EditingInProgress: false,
        });

        this.setState({ [showEditor]: false }); //True Nishant 24-09-2020
        this.forceUpdate();

        if (isCancelled == false) {
            this.loadServer();
        }

    }

    loadServer = () => {
        try {

            this.setState({ isProcess: true });
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DownloadManager";
            objBrokerRequest.Function = "loadWitsmlServerList";
            objBrokerRequest.Broker = "DownloadManager";

            // objParameter.ParamName = "wellID";
            // objParameter.ParamValue = this.state.wellID;
            // objBrokerRequest.Parameters.push(objParameter);

            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })

                .then((res) => {
                    console.clear();
                    console.log("res-", res);
                    const objData = JSON.parse(res.data.Response);
                    console.log("Server List ", objData);


                    //New Code
                    const serverList = Object.values(objData); //converting to Array of wellbore object

                    this.setState({ serverList: serverList });

                    // this.setState({
                    //   showWellEditor: true,
                    //   showTimeLogEditor: false,
                    //   showTrajectoryEditor: false
                    // });
                    this.GenerateServerTree();

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
                    console.log("rejected", error);
                    this.setState({ isProcess: false });
                });


        } catch (error) { }
    };

    searchLogFromObject = (objNode: UI.eVuMaxTreeNode, logType: UI.enumNodeType) => {
        try {

            let objWell_ = new DataObjects.Well();
            objWell_ = this.state.objWell;

            if (logType == UI.enumNodeType.timeLog) {
                let index = objWell_.wellbores.findIndex(x => x.ObjectID === objNode.wellboreID);


                const timeLogList = Object.values(objWell_.wellbores[index].timeLogs);
                let i = timeLogList.findIndex(x => x.ObjectID === objNode.logID);
                let objTimelog = new DataObjects.TimeLog();
                //objTimelog = <DataObjects.TimeLog> timeLogList ;

                this.setState({ objTimeLog: timeLogList[i] });
                // console.log(timeLogList[i]);
                // console.log(this.state.objTimeLog.ObjectID);
            }

            if (logType == UI.enumNodeType.depthLog) {

                let index = objWell_.wellbores.findIndex(x => x.ObjectID === objNode.wellboreID);
                const deptLogList = Object.values(objWell_.wellbores[index].depthLogs);
                let i = deptLogList.findIndex(x => x.ObjectID === objNode.logID);
                return deptLogList[i];
            }

            if (logType == UI.enumNodeType.trajectory) {
                let index = objWell_.wellbores.findIndex(x => x.ObjectID === objNode.wellboreID);
                const trajList = Object.values(objWell_.wellbores[index].trajectories);
                let i = trajList.findIndex(x => x.ObjectID === objNode.logID);


                return trajList[i];


            }

            //Nishant 25-06-2020
            if (logType == UI.enumNodeType.mudLog) {
                let index = objWell_.wellbores.findIndex(x => x.ObjectID === objNode.wellboreID);
                const MudLogList = Object.values(objWell_.wellbores[index].mudLogs);
                let i = MudLogList.findIndex(x => x.mudLogID === objNode.logID);
                return MudLogList[i];
            }


        } catch (error) {

        }
    }


    //#region "Well Tree Functions"
    loadServerToTree = (objParentNode: node.witsmlNode): node.witsmlNode => {
        try {
            let serverList = this.state.serverList;
            for (let index = 0; index < serverList.length; index++) {
                const objServer = serverList[index];
                let childNode: node.witsmlNode = new node.witsmlNode();
                childNode.objServer = objServer

                childNode.id = objServer.ServerID
                childNode.nodeType = node.enTreeNodeType.Server;
                childNode.text = objServer.ServerName;
                childNode.imageUrl = ""; // "../Images/Log.ico";
                objParentNode.items?.push(childNode);
            }
            return objParentNode;
        } catch (error) {

        }
    }



    GenerateServerTree = () => {
        try {
            if (this.state.serverList != null) {
                this.objTreeNodes = [];
                let objRootNode: node.witsmlNode = new node.witsmlNode;

                objRootNode.nodeType = -1; //node.enTreeNodeType.Server
                objRootNode.id = "root";
                objRootNode.text = "Witsml Servers";
                objRootNode.imageUrl = "";
                objRootNode.expanded = true;

                objRootNode = this.loadServerToTree(objRootNode);

                this.objTreeNodes.push(objRootNode);
                this.setState({
                    tree: this.objTreeNodes.map((item) => Object.assign({}, item, { expanded: true })),
                });


            }


        } catch (error) { }
    };

    //#endregion


    onTreeItem_Double_Click = (event: any) => {




        let objNode: node.witsmlNode = event.item;

        if (objNode.nodeType == -1) { //root Node
            this.setState({
                selectedNode: null
            });
            return;
        }

        //Nishant 28-11-2020
        this.setState({
            selectedNode: objNode // event.item
        });

        //  let objNode: node.witsmlNode = event.item;

        if (objNode.nodeType == node.enTreeNodeType.Server) {
            this.setState({
                showWitsmlLoginDialog: true
            });
        }

        return;

        //pending make Tree disable
        // if (
        //     objNode.nodeType == UI.enumNodeType.timeLogs ||
        //     objNode.nodeType == UI.enumNodeType.depthLogs ||
        //     objNode.nodeType == UI.enumNodeType.wellbores ||
        //     objNode.nodeType == UI.enumNodeType.mudLogs ||
        //     objNode.nodeType == UI.enumNodeType.channels
        // ) {
        //     return;
        // }

        // if (objNode.nodeType == UI.enumNodeType.timeLog) {
        //
        //     this.searchLogFromObject(objNode, objNode.nodeType);
        //     this.setState({
        //         showWellEditor: false,
        //         showTimeLogEditor: true,
        //         showTrajectoryEditor: false,
        //         showMudLogEditor: false,
        //         showDepthLogEditor: false,


        //     });
        // }

        // if (objNode.nodeType == UI.enumNodeType.well) {
        //     this.setState({
        //         showWellEditor: true,
        //         showTimeLogEditor: false,
        //         showTrajectoryEditor: false,
        //         showMudLogEditor: false,
        //         showDepthLogEditor: false,

        //     });
        //     // this.loadWell();
        // }

        // //16-06-2020 Nishant
        // if (objNode.nodeType == UI.enumNodeType.trajectory) {

        //
        //     const trajectory = this.searchLogFromObject(objNode, objNode.nodeType);
        //     // this.setState({  showTrajectoryEditor: false    }); // force to reload

        //     this.setState({
        //         showWellEditor: false,
        //         showTimeLogEditor: false,
        //         showDepthLogEditor: false,
        //         showTrajectoryEditor: true,
        //         showMudLogEditor: false,
        //         objTrajectory: trajectory
        //     });
        // }

        // //Nishant 25-06-2020
        // if (objNode.nodeType == UI.enumNodeType.mudLog) {

        //
        //     const mudLog = this.searchLogFromObject(objNode, objNode.nodeType);
        //     console.log(mudLog);
        //     this.setState({
        //         showWellEditor: false,
        //         showTimeLogEditor: false,
        //         showTrajectoryEditor: false,
        //         showDepthLogEditor: false,
        //         showMudLogEditor: true,
        //         objMudLog: mudLog,
        //     });
        // }



        // //Nishant 18-07-2020
        // if (objNode.nodeType == UI.enumNodeType.depthLog) {

        //
        //     const depthLog = this.searchLogFromObject(objNode, objNode.nodeType);
        //     console.log(mudLog);
        //     this.setState({
        //         showWellEditor: false,
        //         showTimeLogEditor: false,
        //         showTrajectoryEditor: false,
        //         showMudLogEditor: false,
        //         showDepthLogEditor: true,
        //         objDepthLog: depthLog,
        //     });
        // }

        // //Nishant 24-09-2020
        // this.setState({
        //     EditingInProgress: true
        // });
        // this.forceUpdate();

    };

    onTreeItemClick_ = (event: any) => {




        //console.log("event",event.originalEvent);
        let objNode: node.witsmlNode = event.item;
        //Nishant 28-11-2020

        if (objNode.nodeType == -1) {
            this.setState({
                selectedNode: null
            });

            return;
        }

        this.setState({
            selectedNode: event.item
        });

        // if (objNode.nodeType == node.enTreeNodeType.Server) {
        //     this.setState({
        //         showWitsmlLoginDialog: true
        //     });
        // }

        return;

        //pending make Tree disable
        // if (
        //     objNode.nodeType == UI.enumNodeType.timeLogs ||
        //     objNode.nodeType == UI.enumNodeType.depthLogs ||
        //     objNode.nodeType == UI.enumNodeType.wellbores ||
        //     objNode.nodeType == UI.enumNodeType.mudLogs ||
        //     objNode.nodeType == UI.enumNodeType.channels
        // ) {
        //     return;
        // }

        // if (objNode.nodeType == UI.enumNodeType.timeLog) {
        //
        //     this.searchLogFromObject(objNode, objNode.nodeType);
        //     this.setState({
        //         showWellEditor: false,
        //         showTimeLogEditor: true,
        //         showTrajectoryEditor: false,
        //         showMudLogEditor: false,
        //         showDepthLogEditor: false,


        //     });
        // }

        // if (objNode.nodeType == UI.enumNodeType.well) {
        //     this.setState({
        //         showWellEditor: true,
        //         showTimeLogEditor: false,
        //         showTrajectoryEditor: false,
        //         showMudLogEditor: false,
        //         showDepthLogEditor: false,

        //     });
        //     // this.loadWell();
        // }

        // //16-06-2020 Nishant
        // if (objNode.nodeType == UI.enumNodeType.trajectory) {

        //
        //     const trajectory = this.searchLogFromObject(objNode, objNode.nodeType);
        //     // this.setState({  showTrajectoryEditor: false    }); // force to reload

        //     this.setState({
        //         showWellEditor: false,
        //         showTimeLogEditor: false,
        //         showDepthLogEditor: false,
        //         showTrajectoryEditor: true,
        //         showMudLogEditor: false,
        //         objTrajectory: trajectory
        //     });
        // }

        // //Nishant 25-06-2020
        // if (objNode.nodeType == UI.enumNodeType.mudLog) {

        //
        //     const mudLog = this.searchLogFromObject(objNode, objNode.nodeType);
        //     console.log(mudLog);
        //     this.setState({
        //         showWellEditor: false,
        //         showTimeLogEditor: false,
        //         showTrajectoryEditor: false,
        //         showDepthLogEditor: false,
        //         showMudLogEditor: true,
        //         objMudLog: mudLog,
        //     });
        // }



        // //Nishant 18-07-2020
        // if (objNode.nodeType == UI.enumNodeType.depthLog) {

        //
        //     const depthLog = this.searchLogFromObject(objNode, objNode.nodeType);
        //     console.log(mudLog);
        //     this.setState({
        //         showWellEditor: false,
        //         showTimeLogEditor: false,
        //         showTrajectoryEditor: false,
        //         showMudLogEditor: false,
        //         showDepthLogEditor: true,
        //         objDepthLog: depthLog,
        //     });
        // }

        // //Nishant 24-09-2020
        // this.setState({
        //     EditingInProgress: true
        // });
        // this.forceUpdate();

    };
    componentDidUpdate(prevProps: any, prevState: any) {
        console.log("previous Prop ", prevProps);
        console.log("previous State ", prevState);
        console.log(
            `this.state.clickCounts( componentDidUpdate)`,
            this.state.objTrajectory
        );
    }


    //Splitter Control
    onLayoutChange = (updatedState: any) => {
        this.setState({
            panes: updatedState,
        });
    };

    //Treeview Control
    onExpandChange = (event: any) => {
        event.item.expanded = !event.item.expanded;
        this.state.isParentSelected = false;

        //this.forceUpdate();
    };

    //Tabsrip control
    handleTabSelect = (e: any) => {
        this.setState({ selected: e.selected });
    };

    //Fresh code
    onServerMenuItemClicked = (e: any) => {




        if (e.itemIndex == 0) {
            //add Server

            this.setState({
                showServerEditor: true,
                selectedNode: new node.witsmlNode()
            });
            //    this.forceUpdate();
        }



        if (e.itemIndex == 1) {
            //Edit Server

            if (this.state.selectedNode == undefined || this.state.selectedNode.objServer.ServerID == "") {
                alert("Please select server from the list");
                return;
            }
            this.setState({
                showServerEditor: true
            });
        }

        if (e.itemIndex == 2) {
            //Remove Server
            if (this.state.selectedNode == undefined || this.state.selectedNode.objServer.ServerID == "") {
                alert("Please select server from the list");
                return;
            }

            confirmAlert({
                //title: 'eVuMax',
                message: 'Are you sure you want to remove?',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => {
                            this.removeServer(this.state.selectedNode.objServer.ServerID)
                        }

                    },
                    {
                        label: 'No',
                        onClick: () => null
                    }
                ]
            });

        }

        if (e.itemIndex == 3) {
            //Manage Profile


            let selectedNode = this.state.downloadQueue[1];// this.state.selectedNode;

            // selectedNode.imageUrl = "../../images/downloading-blue.gif";
            selectedNode.downloading = false;

            this.setState({
                tree: this.state.tree
            });

            this.state.downloadQueue.splice(1, 1);
            console.log(this.state.downloadQueue);

            //
            // let ParentNode = this.state.tree[0];

            // let node = this.searchTree(ParentNode, "NOV Conoco");
            // node.selected = true;
            // // this.setState({
            // //     selectedNodeArr:node.id
            // // })
            // //k-state-selected
            // console.log(node);


        }

    }

    removeServer = (serverID: string) => {


        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "DownloadManager";
        objBrokerRequest.Function = "RemoveWitsmlServer";
        objBrokerRequest.Broker = "DownloadManager";


        if (serverID == "") {
            alert("Please select server from the list");
            return;
        }

        objParameter = new BrokerParameter('serverID', serverID);
        objBrokerRequest.Parameters.push(objParameter);


        axios.post(_gMod._performTask, {
            paramRequest: JSON.stringify(objBrokerRequest),
        })
            .then((response) => {
                this.loadServer();
            })
            .catch((error) => {
                console.log(error);
            });


    }
    CloseServerEditor = (loadTree?: boolean) => {


        this.setState({
            showServerEditor: false
        });
        if (loadTree == true) {
            //load tree from DB again
            this.setState({ isProcess: true });
            this.loadServer();

        }
    }

    CloseWitsmlLoginDialog = () => {


        this.setState({
            showWitsmlLoginDialog: false
        });

    }

    loginToServer = () => {
        this.setState({
            showWitsmlLoginDialog: false
        });

        //if successful then load all wells to selected serverNode
        let objParentNode = this.state.selectedNode;
        let objNode: node.witsmlNode = new node.witsmlNode();
        objNode.id = "wells";
        objNode.text = "Wells";
        objNode.nodeType = node.enTreeNodeType.Wells;
        objNode.imageUrl = "../../images/downloading-blue.gif";
        objNode.downloading = true;

        let downloadQueue = this.state.downloadQueue;
        downloadQueue.push(objNode);
        objParentNode.items.push(objNode);

    }

    handleChange = (event: any, field: string) => {



        let value = event.value;
        this.setState({
            [field]: value
        });

        // if (field == "witsmlServerPassword") {
        //     this.setState({
        //         [field]: value
        //     });
        // }



    };

    getNodeImage = (objNode: node.witsmlNode) => {

        if (objNode.nodeType == node.enTreeNodeType.Wells) {
            return "../../images/Blue.png"
        } else {
            return "../../images/green.png"
        }

    }

    render() {
        let loader, isProcess = this.state;

        return (
            <>

                <div id="mainContainer_" style={{ height: "60vh", width: "95vw" }}>
                    <div className="row">
                        <span className="ml-2">
                            {this.state.isProcess ? <CustomLoader /> : ""}
                        </span>
                    </div>

                    <div className="row" >





                        <div id="mainContainer" style={{ minWidth: "100%" }}>
                            <h2>Witsml Explorer</h2>
                            <span style={{ marginRight: 20 }} >
                                <DropDownButton icon="more-vertical" text="Actions"
                                    onItemClick={(e) => this.onServerMenuItemClicked(e)}
                                    disabled={this.state.DownloadInProgress ? true : false}
                                >
                                    <DropDownButtonItem text="Add Server" />
                                    <DropDownButtonItem text="Edit Server" />
                                    <DropDownButtonItem text="Remove Server" />
                                    {/* <DropDownButtonItem text="Manage Profiles" /> */}
                                </DropDownButton>
                            </span>

                            <Splitter
                                panes={this.state.panes}
                                onLayoutChange={this.onLayoutChange}
                                style={{ height: "80vh" }}
                            >
                                <div className="pane-content">
                                    <div onContextMenu={this.handleContextMenu}>

                                        <TreeView

                                            //  className={this.state.EditingInProgress ? "k-state-disabled" : ""} //Nishant 25-09-2020
                                            className={this.state.selectedNodeArr ? "k-state-selected" : ""}
                                            data={this.state.tree}
                                            expandIcons={true}
                                            onExpandChange={this.onExpandChange}
                                            onItemClick={this.onTreeItemClick_}


                                            item={(props: any) => {
                                                // "none" = 0,
                                                // "wells"= 1,
                                                // "well" = 2,
                                                // "wellbores" = 3,
                                                // "wellbore" = 4,
                                                // "timeLogs" = 5,
                                                // "timeLog" = 6,
                                                // "depthLogs"= 7,
                                                // "depthLog"= 8,
                                                // "channels" = 9,
                                                // "mudLogs" = 10,
                                                // "mudLog" = 11,
                                                // "trajectories" = 12,
                                                // "trajectory"= 13
                                                //    if (props.item.nodeType==6) { //TimeLog
                                                //         //if (props.item.imageUrl!="") {
                                                //         //return (<span> <img src = {require("../../images/greenDot.ico")}></img> {props.item.text} </span>);
                                                //         return <span><img src={require("../../images/log.ico")} key="0" style={{ width: 20, height: 20 }} />{props.item.text}</span>; // ensure the return a single element
                                                //         }

                                                if (props.item.nodeType == -1) {
                                                    //Root
                                                    return (
                                                        <span className="treeViewText" onDoubleClick={e => this.onTreeItem_Double_Click(props)}>
                                                            {/* <img
                                                                src={require("../../images/red.png")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}
                                                            /> */}
                                                            <FontAwesomeIcon style={{ color: "green" }} icon={faServer} className="mr-1" />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }


                                                if (props.item.nodeType == 1) { //Wells
                                                    //WELLS FOLDER
                                                    var icon = props.item.downloading ? require('../../images/downloading-blue.gif') : require("../../images/red.png");
                                                    return (
                                                        // onClick={e=> this.onTreeItemClick_(props)}
                                                        //
                                                        <span className="treeViewText" onDoubleClick={e => this.onTreeItem_Double_Click(props)}>
                                                            <img
                                                                //src={props.item.imageUrl == ""? require("../../images/downloading-blue.gif"):require(props.item.imageUrl)}

                                                                //src={require("../../images/downloading-blue.gif")}
                                                                //src={require(this.getNodeImage(props.item))}
                                                                src={icon}


                                                                key="0"
                                                                style={{ width: 15, height: 10, marginRight: 5 }}
                                                            />
                                                            {/* <FontAwesomeIcon style={{ color: "orange" }} icon={faDatabase} className="mr-1" /> */}
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }

                                                if (props.item.nodeType == 0) { //Server
                                                    //Server
                                                    return (
                                                        // onClick={e=> this.onTreeItemClick_(props)}
                                                        //
                                                        <span className="treeViewText" onDoubleClick={e => this.onTreeItem_Double_Click(props)}>
                                                            {/* <img
                                                                src={require("../../images/red.png")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}
                                                            /> */}
                                                            <FontAwesomeIcon style={{ color: "orange" }} icon={faDatabase} className="mr-1" />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }
                                                if (props.item.nodeType == 2) {
                                                    //Well
                                                    return (
                                                        <span className="treeViewText" onDoubleClick={e => this.onTreeItem_Double_Click(props.item)} >
                                                            <img
                                                                src={require("../../images/downloading-blue.gif")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}

                                                            />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }

                                                if (props.item.nodeType == 3) {
                                                    //Well
                                                    return (
                                                        <span className="treeViewText">
                                                            <img
                                                                // src={require("../../images/green.png")}
                                                                src={require("../../images/downloading-blue.gif")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}
                                                            />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }

                                                if (props.item.nodeType == 4) {
                                                    //Wellbore
                                                    return (
                                                        <span className="treeViewText">
                                                            <img
                                                                src={require("../../images/blue_dot.png")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}
                                                            />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }

                                                if (
                                                    props.item.nodeType == 5 ||
                                                    props.item.nodeType == 7
                                                ) {
                                                    //timeLogs || depthlogs
                                                    return (
                                                        <span className="treeViewText">
                                                            <img
                                                                src={require("../../images/Red_dot.png")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}
                                                            />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }
                                                if (
                                                    props.item.nodeType == 6 ||
                                                    props.item.nodeType == 8
                                                ) {
                                                    //timeLog || depthlog
                                                    return (
                                                        <span className="treeViewText">
                                                            <img
                                                                src={require("../../images/blue_dot.png")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}
                                                            />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }

                                                if (
                                                    props.item.nodeType == 10

                                                ) {
                                                    //mudLogs || mudlog
                                                    return (
                                                        <span className="treeViewText">
                                                            <img
                                                                src={require("../../images/Red_dot.png")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}
                                                            />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }

                                                if (
                                                    props.item.nodeType == 11

                                                ) {
                                                    //mudLogs || mudlog
                                                    return (
                                                        <span className="treeViewText">
                                                            <img
                                                                src={require("../../images/blue_dot.png")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}
                                                            />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }

                                                if (props.item.nodeType == 12) {
                                                    //trajectories || trajectory
                                                    return (
                                                        <span className="treeViewText">
                                                            <img
                                                                src={require("../../images/Red_dot.png")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}
                                                            />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }

                                                if (props.item.nodeType == 13) {
                                                    //trajectory
                                                    return (
                                                        <span className="treeViewText">
                                                            <img
                                                                src={require("../../images/blue_dot.png")}
                                                                key="0"
                                                                style={{ width: 10, height: 10, marginRight: 10 }}
                                                            />
                                                            {props.item.text}
                                                        </span>
                                                    ); // ensure the return a single element
                                                }
                                                //return (<span> <img src = {require("../../images/snapbulletred.png")}></img> {props.item.text} </span>);  // ensure the return a single element
                                                return (
                                                    <span className="treeViewText">
                                                        <img
                                                            src={require("../../images/snapbulletred.png")}
                                                            key="0"
                                                            style={{ width: 10, height: 10, marginRight: 10 }}
                                                        />
                                                        {props.item.text}
                                                    </span>
                                                ); // ensure the return a single element
                                            }}
                                            // onExpandChange={this.onExpandChange}
                                            // onItemClick={this.onItemClick}
                                            aria-multiselectable={true}
                                        />
                                    </div>
                                </div>



                                <div className="pane-content ml-3" id="rightPanel">
                                    {/* Double Click on Node to Download */}
                                    {/* <Window
                    id="EditorWindow"
                    title="Editor"
                    initialHeight={400}
                    initialWidth={450}
                  >

                  </Window> */}
                                    {/* {this.state.showWellEditor && (<WellEditor wellID={this.state.wellID} objWell={this.state.objWell} reloadTree={this.loadWellAgain}  ></WellEditor>)}
                                    {this.state.showTimeLogEditor && (<TimeLogEditor wellID="" wellboreID="" logID="" objTimeLog={this.state.objTimeLog} reloadTree={this.loadWellAgain}      ></TimeLogEditor>)}
                                    {this.state.showTrajectoryEditor && (<TrajectoryEditor wellID="" objTrajectory={this.state.objTrajectory} reloadTree={this.loadWellAgain}      ></TrajectoryEditor>)}
                                    {this.state.showMudLogEditor && (<MudLogEditor objMudLog={this.state.objMudLog} reloadTree={this.loadWellAgain}></MudLogEditor>)}
                                    {this.state.showDepthLogEditor && (<DepthlogEditor objDepthLog={this.state.objDepthLog} reloadTree={this.loadWellAgain}  > </DepthlogEditor>)} */}



                                </div>

                            </Splitter>


                            {/* New code for context menu on treeview */}
                            {/* temp. Commented this code */}
                            <Popup className="context-menu" show={this.state.contextMenuShow} offset={this.state.contextMenuOffset}
                            // onOpen={e => {
                            //     let element: any = document.querySelector('.context-menu');
                            //     if (element !== null) {
                            //         element.setAttribute('tabIndex', 0) // make it focusable
                            //         element.focus(); // focus it
                            //         element.addEventListener('blur', this.closeContextMenu) // attach on blur event which will close it.
                            //     }
                            // }}
                            // onClose={e => {
                            //     let element: any = document.querySelector('.context-menu');
                            //     element.removeEventListener('blur', this.closeContextMenu)
                            // }}
                            >
                                {/* New Code Close */}




                                {this.state.menuType == 0 ?
                                    // Wellbore
                                    null : null

                                    // <Menu  vertical={true} style={{ display: "inline-block" }} onSelect={this.onMenuSelect}>
                                    //     <MenuItem data={{ logType: "4", id: "mnuLoginServer" }} text="Login" />
                                    //     {/* <MenuItem data={{ logType: "4", id: "mnuStopDownload" }} text="Stop Download" /> */}
                                    // </Menu> : null
                                }

                                {this.state.menuType == 3 ? //Wellbores
                                    null
                                    // <Menu vertical={true} style={{ display: "inline-block" }} onSelect={this.onMenuSelect}>
                                    //      {/* <MenuItem data={{ logType: "3", id: "mnuDeleteWellbore" }} text="Delete" /> */}
                                    //   {/* <MenuItem data={{ logType: "3", id: "mnuEditWellbores" }} text="Edit" />
                                    //   <MenuItem text="Download" /> */}
                                    // </Menu>
                                    : null}

                                {this.state.menuType == 4 ?
                                    // Wellbore
                                    <Menu vertical={true} style={{ display: "inline-block" }} onSelect={this.onMenuSelect}>
                                        <MenuItem data={{ logType: "4", id: "mnuDeleteWellbore" }} text="Delete" />
                                        {/* <MenuItem data={{ logType: "4", id: "mnuStopDownload" }} text="Stop Download" /> */}
                                    </Menu> : null}


                                {this.state.menuType == 6 ? // Timelog
                                    <Menu vertical={true} style={{ display: "inline-block" }} onSelect={this.onMenuSelect} >
                                        <MenuItem data={{ logType: "6", id: "mnuDeleteTimeLog" }} text="Delete" />
                                        {/* <MenuItem data={{ logType: "6", id: "mnuDownloadRealTime" }} text="Download Realtime" /> */}
                                        {/* <MenuItem data={{ logType: "6", id: "mnuDownloadByRange" }} text="Download by Range" />
                    <MenuItem data={{ logType: "6", id: "mnuEditObject" }} text="Edit Object" />
                    <MenuItem data={{ logType: "6", id: "mnuViewData" }} text="View Data" />
                    <MenuItem data={{ logType: "6", id: "mnuEditVariables" }} text="Edit Variables" />
                    <MenuItem data={{ logType: "6", id: "mnuStopDownloads" }} text="Stop Download" />
                    <MenuItem data={{ logType: "6", id: "mnuShowDownloadLog" }} text="Show Download Log" />
                    <MenuItem data={{ logType: "6", id: "mnuUploadData" }} text="Upload Data" />
                    <MenuItem data={{ logType: "6", id: "mnuUploadDataFromDate" }} text="Upload Data from Date" />
                    <MenuItem data={{ logType: "6", id: "mnuUploadDataFromBeginning" }} text="Upload Data from Beginning" />
                    <MenuItem data={{ logType: "6", id: "mnuUploadLog" }} text="Upload Log" />
                    <MenuItem data={{ logType: "6", id: "mnuStopUpload" }} text="Stop upload" />
                    <MenuItem data={{ logType: "6", id: "mnuDownloadChannels" }} text="View Channels" /> */}
                                    </Menu> : null}

                                {this.state.menuType == 8 ? // DepthLog

                                    <Menu vertical={true} style={{ display: "inline-block" }} onSelect={this.onMenuSelect} >
                                        <MenuItem data={{ logType: "8", id: "mnuDeleteDepthLog" }} text="Delete" />
                                        {/* <MenuItem data={{ logType: "8", id: "mnuDownloadRealTime" }} text="Download Realtime" />
                    <MenuItem data={{ logType: "8", id: "mnuDownloadByRange" }} text="Download by Range" />
                    <MenuItem data={{ logType: "8", id: "mnuEditObject" }} text="Edit Object" />
                    <MenuItem data={{ logType: "8", id: "mnuViewData" }} text="View Data" />
                    <MenuItem data={{ logType: "8", id: "mnuEditVariables" }} text="Edit Variables" />
                    <MenuItem data={{ logType: "8", id: "mnuStopDownloads" }} text="Stop Download" />
                    <MenuItem data={{ logType: "8", id: "mnuShowDownloadLog" }} text="Show Download Log" />
                    <MenuItem data={{ logType: "8", id: "mnuUploadData" }} text="Upload Data" />
                    <MenuItem data={{ logType: "8", id: "mnuUploadDataFromDate" }} text="Upload Data from Date" />
                    <MenuItem data={{ logType: "8", id: "mnuUploadDataFromBeginning" }} text="Upload Data from Beginning" />
                    <MenuItem data={{ logType: "8", id: "mnuUploadLog" }} text="Upload Log" />
                    <MenuItem data={{ logType: "8", id: "mnuStopUpload" }} text="Stop upload" />
                    <MenuItem data={{ logType: "8", id: "mnuDownloadChannelsDepth" }} text="View Channels" /> */}
                                    </Menu> : null}

                                {this.state.menuType == 13 ? // Trajectory

                                    <Menu vertical={true} style={{ display: "inline-block" }} onSelect={this.onMenuSelect} >
                                        <MenuItem data={{ logType: "13", id: "mnuDeleteTrajectory" }} text="Delete" />
                                    </Menu> : null}

                                {this.state.menuType == 11 ? // Mud Log

                                    <Menu vertical={true} style={{ display: "inline-block" }} onSelect={this.onMenuSelect} >
                                        <MenuItem data={{ logType: "11", id: "mnuDeleteMudLog" }} text="Delete" />
                                    </Menu> : null}


                            </Popup>

                        </div>
                    </div>
                </div>

                {this.state.showServerEditor && <ServerEditor {...this} objServer={this.state.selectedNode.objServer}></ServerEditor>}

                {this.state.showWitsmlLoginDialog && <Dialog title={"Login to WITSML Server"}
                    onClose={(e: any) => {
                        // this.props.cancel();
                        this.CloseWitsmlLoginDialog();
                    }}
                    width={500}
                    height={250}
                >
                    <label className="mt-3">
                        Provide your credentials to login
                    </label>
                    <div className="row">
                        <div className="col-2 ml-5">
                            <label>
                                <Input
                                    name="ServerUserName"
                                    // style={{ width: "100%" }}
                                    label="User Name"
                                    pattern={"[A-Za-z]+"}
                                    minLength={2}
                                    required={true}
                                    value={this.state.witsmlServerUserName}
                                    onChange={(e) => this.handleChange(e, "witsmlServerUserName")}
                                />
                            </label>
                        </div>

                    </div>

                    <div className="row">
                        <div className="col-2 ml-5">
                            <label>
                                <Input
                                    name="witsmlServerPassword"
                                    label="Password"
                                    pattern={"[A-Za-z]+"}
                                    type="password"
                                    minLength={8}
                                    value={this.state.witsmlServerPassword}
                                    onChange={(e) => this.handleChange(e, "witsmlServerPassword")}
                                />
                            </label>
                        </div>

                    </div>

                    <div className="row mt-2 lg-12">
                        <div className="col">
                            <span className="float-right">
                                <Button style={{ width: '90px' }} className="k-button k-primary mr-4" onClick={this.loginToServer}>
                                    Ok
                                </Button>
                                <Button style={{ width: '90px' }} className="k-button k-primary mr-4" onClick={this.CloseWitsmlLoginDialog}>
                                    cancel
                                </Button>

                                {/* <Button style={{ width: '90px' }} onClick= {this.CloseWitsmlLoginDialog(false)} className="mr-2">
                                    Cancel
                                </Button> */}
                            </span>

                        </div>
                    </div>
                </Dialog>}



            </>
        );
    }
}
