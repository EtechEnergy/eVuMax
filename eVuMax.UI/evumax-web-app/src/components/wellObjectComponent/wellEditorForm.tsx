import React from "react";
import axios from "axios";

import {

  Splitter,
  TreeView,

  Menu,
  MenuItem,
  Popup,
  Window,
  Dialog,
  Toolbar,
  ToolbarItem,
  ToolbarSpacer,
  Button,
  SplitButton,
  SplitButtonItem,
} from "@progress/kendo-react-all";

import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";


import { Input } from "@progress/kendo-react-inputs";
import { filterBy } from "@progress/kendo-data-query";
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

//Nishant: 06-02-2021
import redIco from "../../images/red.png";
import GreenPng from "../../images/green.png";
import blueDotPng from "../../images/blue_dot.png";
import redDotPng from "../../images/Red_dot.png";
import snapBulletRed from "../../images/snapbulletred.png";
import WellSpecificRigStateSetup from "../DataService/Data/RigStateSetup/WellSpecificRigStateSetup";
import CalculateRigState from "../DataService/Fx_Functions/CalculateRigState";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Circle } from "@progress/kendo-drawing";
import { faArrowsAltV, faBalanceScale, faCircle, faClock, faLevelDownAlt, faSort, faSortNumericDownAlt, faWrench } from "@fortawesome/free-solid-svg-icons";
import FcSetupAlarms from "../DataService/Data/SetupAlarms/FcSetupAlarms";
import FcCalculateHoleDepth from "../DataService/Fx_Functions/FcCalculateHoleDepth";




let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

export interface IProps {
  wellID: string;
}

export default class WellEditorForm extends React.Component<IProps> {
  props: any = this.props;
  constructor(props: any) {
    super(props);
    this.wellID = props.match.params.WellId;
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

    objNode: new UI.eVuMaxTreeNode(),
    wellID: "",
    isLoaded: false,
    error: "",
    selected: 0,
    panes: [
      { size: "20%", min: "20px", collapsible: true },
      {},
      { size: "80%", min: "20px", collapsible: true },
    ],



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
    showRigStateSetupDialog: false,
    showCalculateRigStateDialog: false,
    showSetupAlarmDialog: false, //Nishant 20/07/2022
    showCalculateHoleDepthDialog: false, //Nishant 28/07/2022
  };
  closeSetupAlarmDialog = () => {
    this.setState({
      showSetupAlarmDialog: false,
      EditingInProgress: false
    })
  }
  componentWillMount() {

    this.setState({
      wellID: this.props.match.params.WellId
    });

  }

  componentDidMount() {
    document.title = "eVuMax";//Nishant 02/09/2021
    this.setState({ isProcess: false });
    this.loadWell();
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
    //return; //Nishant 26/08/2021 Error while right click on Node
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





  }
  ////#region



  loadWellAgain = (showEditor: string, isCancelled: boolean) => {


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
      this.loadWell();
    }

  }

  loadWell = () => {
    try {
      this.setState({ isProcess: true });
      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "DataObject.Manager";
      objBrokerRequest.Function = "LoadWellStructure";
      objBrokerRequest.Broker = "WellBroker";

      objParameter.ParamName = "wellID";
      objParameter.ParamValue = this.state.wellID;
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
          console.clear();
          console.log("res-", res);
          const objData = JSON.parse(res.data.Response);
          console.log("Well Str: ", objData);
          //Nishant Original working Code
          // this.objWell = objData;
          // const wellBores = Object.values(this.objWell.wellbores);
          // this.objWell.wellbores = wellBores;

          //New Code
          const wellBores = Object.values(objData.wellbores); //converting to Array of wellbore object
          objData.wellbores = wellBores;
          this.setState({ objWell: objData });
          // this.setState({
          //   showWellEditor: true,
          //   showTimeLogEditor: false,
          //   showTrajectoryEditor: false
          // });
          this.loadWellTree();

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
        console.log(timeLogList[i]);
        console.log(this.state.objTimeLog.ObjectID);
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

  loadWellboreToTree = (objParentNode: UI.eVuMaxTreeNode): UI.eVuMaxTreeNode => {
    try {



      //const wellBores = Object.values(this.objWell.wellbores);
      const wellBores = Object.values(this.state.objWell.wellbores);

      wellBores.forEach((objWellbore: DataObjects.Wellbore) => {
        let objNode_: UI.eVuMaxTreeNode = new UI.eVuMaxTreeNode();
        objNode_.id = objWellbore.ObjectID;
        objNode_.nodeType = UI.enumNodeType.wellbores;
        objNode_.wellID = this.state.wellID;
        objNode_.wellboreID = objWellbore.ObjectID;
        objNode_.text = objWellbore.name;
        objNode_.logID = objWellbore.ObjectID;
        objNode_.imageUrl = ""; // "../Images/Log.ico";
        //objNode_ = this.loadTimeLogsToTree(objWellbore, objNode_);

        //Create Folder of TimeLog
        let objNodeTimeLogFolder: UI.eVuMaxTreeNode = new UI.eVuMaxTreeNode();
        objNodeTimeLogFolder.id = objWellbore.ObjectID;
        objNodeTimeLogFolder.nodeType = UI.enumNodeType.timeLogs;
        objNodeTimeLogFolder.wellID = this.state.wellID;
        objNodeTimeLogFolder.wellboreID = objWellbore.ObjectID;
        objNodeTimeLogFolder.text = "TimeLogs";
        objNodeTimeLogFolder.logID = 'TimeLogs-Folder'
        objNodeTimeLogFolder.imageUrl = ""; // "../Images/Log.ico";

        const timeLogs = Object.values(objWellbore.timeLogs);
        objNode_.items?.push(this.loadTimeLogsToTree(timeLogs, objNodeTimeLogFolder));


        //Create Folder of DepthLog
        let objNodeDepthLogFolder: UI.eVuMaxTreeNode = new UI.eVuMaxTreeNode();
        objNodeDepthLogFolder.id = objWellbore.ObjectID;
        objNodeDepthLogFolder.nodeType = UI.enumNodeType.timeLogs;
        objNodeDepthLogFolder.wellID = this.state.wellID;
        objNodeDepthLogFolder.wellboreID = objWellbore.ObjectID;
        objNodeDepthLogFolder.text = "DepthLogs";
        objNodeDepthLogFolder.logID = 'DepthLog-Folder'
        objNodeDepthLogFolder.imageUrl = ""; // "../Images/Log.ico";

        const depthLogs = Object.values(objWellbore.depthLogs);
        objNode_.items?.push(this.loadDepthLogsToTree(depthLogs, objNodeDepthLogFolder));

        //Create Trajectory Folder
        let objNodeTrajFolder: UI.eVuMaxTreeNode = new UI.eVuMaxTreeNode();
        objNodeTrajFolder.id = objWellbore.ObjectID;
        objNodeTrajFolder.nodeType = UI.enumNodeType.trajectories;
        objNodeTrajFolder.wellID = this.state.wellID;
        objNodeTrajFolder.wellboreID = objWellbore.ObjectID;
        objNodeTrajFolder.text = "Trajectories";
        objNodeTrajFolder.logID = 'Trajectory-Folder'
        objNodeTrajFolder.imageUrl = ""; // "../Images/Log.ico";

        const trajectories = Object.values(objWellbore.trajectories);

        const trajNodes = (this.loadTrajectoriesToTree(trajectories, objNodeTrajFolder));

        objNode_.items?.push(trajNodes);



        //Create MudLog Folder
        let objMudLogFolder: UI.eVuMaxTreeNode = new UI.eVuMaxTreeNode();
        objMudLogFolder.id = "MudLog-Folder" + objWellbore.ObjectID;
        objMudLogFolder.nodeType = UI.enumNodeType.mudLogs;
        objMudLogFolder.wellID = this.state.wellID;
        objMudLogFolder.wellboreID = objWellbore.ObjectID;
        objMudLogFolder.text = "Mud Logs";
        objMudLogFolder.logID = 'MudLog-Folder'
        objMudLogFolder.imageUrl = ""; // "../Images/Log.ico";

        const mudLogList = Object.values(objWellbore.mudLogs);

        objNode_.items?.push(this.loadMudLogsToTree(mudLogList, objMudLogFolder));

        objParentNode.items?.push(objNode_);
      });

      return objParentNode;
    } catch (error) {
      return objParentNode;
    }
  };



  loadMudLogsToTree = (objMudLogList: any[], objParentNode: UI.eVuMaxTreeNode
  ): UI.eVuMaxTreeNode => {
    try {

      //objParentNode.items=[];

      objMudLogList.forEach((objMugLog: mudLog) => {
        let objNode: UI.eVuMaxTreeNode = new UI.eVuMaxTreeNode();
        objNode.nodeType = UI.enumNodeType.mudLog;
        objNode.id = objMugLog.mudLogID;
        objNode.text = objMugLog.mudLogName;
        objNode.wellID = objMugLog.WellID;
        objNode.wellboreID = objMugLog.WellboreID;
        objNode.logID = objMugLog.mudLogID;
        objNode.imageUrl = "";

        objParentNode.items?.push(objNode);

      });

      return objParentNode;
    } catch (error) {
      return objParentNode;
    }
  };


  loadTrajectoriesToTree = (objTrajList: any[], objParentNode: UI.eVuMaxTreeNode
  ): UI.eVuMaxTreeNode => {
    try {

      //objParentNode.items=[];

      objTrajList.forEach((objTraj: DataObjects.Trajectory) => {
        let objNode: UI.eVuMaxTreeNode = new UI.eVuMaxTreeNode();
        objNode.nodeType = UI.enumNodeType.trajectory;
        objNode.id = objTraj.ObjectID;
        objNode.text = objTraj.name;
        objNode.wellID = objTraj.WellID;
        objNode.wellboreID = objTraj.WellboreID;
        objNode.logID = objTraj.ObjectID;
        objNode.imageUrl = "";

        objParentNode.items?.push(objNode);

      });

      return objParentNode;
    } catch (error) {
      return objParentNode;
    }
  };

  loadDepthLogsToTree = (objDepthLogList: any[], objParentNode: UI.eVuMaxTreeNode): UI.eVuMaxTreeNode => {
    try {

      //objParentNode.items=[];

      objDepthLogList.forEach((objDepthLog: DataObjects.DepthLog) => {
        let objNode: UI.eVuMaxTreeNode = new UI.eVuMaxTreeNode();
        objNode.nodeType = UI.enumNodeType.depthLog;
        objNode.id = objDepthLog.ObjectID;
        objNode.text = objDepthLog.nameLog;
        objNode.wellID = objDepthLog.WellID;
        objNode.wellboreID = objDepthLog.WellboreID;
        objNode.logID = objDepthLog.ObjectID;
        objNode.imageUrl = "";

        objParentNode.items?.push(objNode);

      });

      return objParentNode;
    } catch (error) {
      return objParentNode;
    }
  };

  loadTimeLogsToTree = (objTimeLogList: any[], objParentNode: UI.eVuMaxTreeNode
  ): UI.eVuMaxTreeNode => {
    try {

      objParentNode.items = [];

      objTimeLogList.forEach((objTimeLog: DataObjects.TimeLog) => {
        let objNode: UI.eVuMaxTreeNode = new UI.eVuMaxTreeNode();
        objNode.nodeType = UI.enumNodeType.timeLog;
        objNode.id = objTimeLog.ObjectID;
        objNode.text = objTimeLog.nameLog;
        objNode.wellID = objTimeLog.WellID;
        objNode.wellboreID = objTimeLog.WellboreID;
        objNode.logID = objTimeLog.ObjectID;
        objNode.imageUrl = "";

        objParentNode.items?.push(objNode);

      });

      return objParentNode;
    } catch (error) {
      return objParentNode;
    }
  };

  loadWellTree = () => {
    try {
      if (this.state.objWell != null) {
        this.objTreeNodes = [];
        let objRootNode: UI.eVuMaxTreeNode = new UI.eVuMaxTreeNode();
        objRootNode.nodeType = UI.enumNodeType.well;
        objRootNode.id = this.state.objWell.ObjectID;
        objRootNode.text = this.state.objWell.name;
        objRootNode.wellID = this.state.objWell.ObjectID;
        objRootNode.wellboreID = "";
        objRootNode.logID = this.state.objWell.ObjectID;
        objRootNode.imageUrl = "";
        objRootNode.expanded = true;

        objRootNode = this.loadWellboreToTree(objRootNode);

        this.objTreeNodes.push(objRootNode);
        this.setState({
          tree: this.objTreeNodes.map((item) => Object.assign({}, item, { expanded: true })),
        });

        // this.setState({
        //   tree: this.state.tree.map((item: any) => Object.assign({}, item, { expanded: false }))
        // });

      }


    } catch (error) { }
  };

  //#endregion




  onTreeItemClick = (event: any) => {

    if (this.state.EditingInProgress) {
      return;
    }

    event.item.selected = !event.item.selected;
    let objNode = new UI.eVuMaxTreeNode();
    objNode = event.item;

    //pending make Tree disable
    if (
      objNode.nodeType == UI.enumNodeType.timeLogs ||
      objNode.nodeType == UI.enumNodeType.depthLogs ||
      objNode.nodeType == UI.enumNodeType.wellbores ||
      objNode.nodeType == UI.enumNodeType.mudLogs ||
      objNode.nodeType == UI.enumNodeType.channels
    ) {
      return;
    }

    if (objNode.nodeType == UI.enumNodeType.timeLog) {

      this.searchLogFromObject(objNode, objNode.nodeType);
      this.setState({
        showWellEditor: false,
        showTimeLogEditor: true,
        showTrajectoryEditor: false,
        showMudLogEditor: false,
        showDepthLogEditor: false,


      });
    }

    if (objNode.nodeType == UI.enumNodeType.well) {
      this.setState({
        showWellEditor: true,
        showTimeLogEditor: false,
        showTrajectoryEditor: false,
        showMudLogEditor: false,
        showDepthLogEditor: false,

      });
      // this.loadWell();
    }

    //16-06-2020 Nishant
    if (objNode.nodeType == UI.enumNodeType.trajectory) {


      const trajectory = this.searchLogFromObject(objNode, objNode.nodeType);
      // this.setState({  showTrajectoryEditor: false    }); // force to reload

      this.setState({
        showWellEditor: false,
        showTimeLogEditor: false,
        showDepthLogEditor: false,
        showTrajectoryEditor: true,
        showMudLogEditor: false,
        objTrajectory: trajectory
      });
    }

    //Nishant 25-06-2020
    if (objNode.nodeType == UI.enumNodeType.mudLog) {


      const mudLog = this.searchLogFromObject(objNode, objNode.nodeType);
      console.log(mudLog);
      this.setState({
        showWellEditor: false,
        showTimeLogEditor: false,
        showTrajectoryEditor: false,
        showDepthLogEditor: false,
        showMudLogEditor: true,
        objMudLog: mudLog,
      });
    }



    //Nishant 18-07-2020
    if (objNode.nodeType == UI.enumNodeType.depthLog) {


      const depthLog = this.searchLogFromObject(objNode, objNode.nodeType);
      console.log(mudLog);
      this.setState({
        showWellEditor: false,
        showTimeLogEditor: false,
        showTrajectoryEditor: false,
        showMudLogEditor: false,
        showDepthLogEditor: true,
        objDepthLog: depthLog,
      });
    }

    //Nishant 24-09-2020
    this.setState({
      EditingInProgress: true
    });
    this.forceUpdate();

  };

  componentWillUpdate() {
    _gMod = new GlobalMod();
    if (_gMod._userId == "" || _gMod._userId == undefined) {
      window.location.href = "/evumaxapp/";
      return;
    }

  }
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

  FxClicked = (fxCode: any) => {
    try {
      
      if (fxCode == 0) { //Re Calc Rig State
        if (this.state.showTimeLogEditor == true) {

          this.setState({ showCalculateRigStateDialog: true });

          return;
        } else {
          alert("Please select Time Log from the Tree");
          return;

        }
      }

      if (fxCode == 1) { //Calc Hole Depth
        if (this.state.showTimeLogEditor == true) {

           this.setState({ showCalculateHoleDepthDialog: true });
          
          return;
        } else {
          alert("Please select Time Log from the Tree");
          return;

        }
      }


    } catch (error) {

    }
  }

  closeRigStateSetupDialog = () => {
    try {
      this.setState({
        showCalculateRigStateDialog: false,
        showRigStateSetupDialog: false,
        EditingInProgress: false,
        showCalculateHoleDepthDialog:false
      })
    } catch (error) {

    }
  }

  render() {


    return (
      <>
        {this.state.showCalculateRigStateDialog && <CalculateRigState WellID={this.wellID} onClose={this.closeRigStateSetupDialog}></CalculateRigState>}
        {this.state.showCalculateHoleDepthDialog && <FcCalculateHoleDepth WellID={this.wellID} onClose={this.closeRigStateSetupDialog}></FcCalculateHoleDepth>}
        
        {this.state.showSetupAlarmDialog && <FcSetupAlarms WellID={this.wellID} onClose={this.closeSetupAlarmDialog}></FcSetupAlarms>}

        <div id="mainContainer" style={{ height: "80vh", width: "95vw" }}>
          <div className="row  p-2" >

            <span style={{ display: "inline-block" }} className="ml-4 mr-2 pl-2" onClick={
              (e) => { this.setState({ showSetupAlarmDialog: true, EditingInProgress: true }) }} >
              <FontAwesomeIcon title="Alarm Setup" icon={faClock} style={{ height: "20px", width: "20px" }} ></FontAwesomeIcon>
            </span>

            <span className=" pl-2" style={{ display: "inline-block" }} onClick={
              (e) => { this.setState({ showRigStateSetupDialog: true, EditingInProgress: true }) }}>
              <FontAwesomeIcon title="Rig State Setup" icon={faWrench} style={{ height: "20px", width: "25px" }} />
            </span>

            <span className="pl-2" style={{ display: "inline-block" }} onClick={(e) => { this.FxClicked(0) }}>
              <FontAwesomeIcon title="Re-Calculate Rig State" icon={faLevelDownAlt} style={{ height: "20px", width: "25px" }} />
            </span>

            <span className="pl-2" style={{ display: "inline-block" }} onClick={(e) => { this.FxClicked(1) }}>
              <FontAwesomeIcon title="Calculate Hole Depth" icon={faSortNumericDownAlt} style={{ height: "20px", width: "25px" }} />

            </span>

          </div>
          <div className="row" >
            {/* <label>Double click node to select</label> */}
            <div id="mainContainer" style={{ minWidth: "100%", minHeight: "100%", height: "75vh" }}>
              <Splitter
                panes={this.state.panes}
                onLayoutChange={this.onLayoutChange}
                style={{ height: "90vh" }}
              >
                <div className="pane-content">
                  <div onContextMenu={this.handleContextMenu}>

                    <TreeView

                      className={this.state.EditingInProgress ? "k-state-disabled" : ""} //Nishant 25-09-2020
                      data={this.state.tree}

                      expandIcons={true}
                      onExpandChange={this.onExpandChange}
                      onItemClick={this.onTreeItemClick}
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

                        if (props.item.nodeType == 2) {
                          //Well
                          return (
                            <span className="treeViewText">
                              <img
                                //src={require("../../images/red.png")}
                                src={redIco}
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
                                //src={require("../../images/green.png")}
                                src={GreenPng}
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
                                //src={require("../../images/blue_dot.png")}
                                src={blueDotPng}
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
                                src={redDotPng}
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
                                //src={require("../../images/blue_dot.png")}
                                src={blueDotPng}
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
                                //src={require("../../images/Red_dot.png")}
                                src={redDotPng}
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
                                //src={require("../../images/blue_dot.png")}
                                src={blueDotPng}
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
                                //src={require("../../images/Red_dot.png")}
                                src={redDotPng}
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
                                //src={require("../../images/blue_dot.png")}
                                src={blueDotPng}

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
                              //src={require("../../images/snapbulletred.png")}
                              src={snapBulletRed}
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



                <div className="pane-content ml-5" id="rightPanel">
                  Click on Node to Edit Logs
                  {/* <Window
                    id="EditorWindow"
                    title="Editor"
                    initialHeight={400}
                    initialWidth={450}
                  >

                  </Window> */}
                  {this.state.showWellEditor && (<WellEditor wellID={this.state.wellID} objWell={this.state.objWell} reloadTree={this.loadWellAgain}  ></WellEditor>)}
                  {this.state.showTimeLogEditor && (<TimeLogEditor wellID="" wellboreID="" logID="" objTimeLog={this.state.objTimeLog} reloadTree={this.loadWellAgain}      ></TimeLogEditor>)}
                  {this.state.showTrajectoryEditor && (<TrajectoryEditor wellID="" objTrajectory={this.state.objTrajectory} reloadTree={this.loadWellAgain}      ></TrajectoryEditor>)}
                  {this.state.showMudLogEditor && (<MudLogEditor objMudLog={this.state.objMudLog} reloadTree={this.loadWellAgain}></MudLogEditor>)}
                  {this.state.showDepthLogEditor && (<DepthlogEditor objDepthLog={this.state.objDepthLog} reloadTree={this.loadWellAgain}  > </DepthlogEditor>)}

                  {this.state.showRigStateSetupDialog && <Dialog title={"Rig State Setup"} height="818px" width="1000px">
                    <WellSpecificRigStateSetup wellID={this.wellID} closeDialog={this.closeRigStateSetupDialog}></WellSpecificRigStateSetup>
                  </Dialog>}


                </div>

              </Splitter>


              {/* New code for context menu on treeview */}
              <Popup className="context-menu" show={this.state.contextMenuShow} offset={this.state.contextMenuOffset} onOpen={e => {
                let element: any = document.querySelector('.context-menu');
                if (element !== null) {
                  element.setAttribute('tabIndex', 0) // make it focusable
                  element.focus(); // focus it
                  element.addEventListener('blur', this.closeContextMenu) // attach on blur event which will close it.
                }
              }}
                onClose={e => {
                  let element: any = document.querySelector('.context-menu');
                  if (element != null) { //Nishant 26/08/2021
                    element.removeEventListener('blur', this.closeContextMenu)
                  }

                }}
              >
                {/* <Popup className="context-menu" show={this.state.contextMenuShow} offset={this.state.contextMenuOffset}> */}
                {/* <Menu vertical={true} style={{ display: "inline-block",background: "cornflowerblue" }} onSelect={this.onMenuSelect}>
                        <MenuItem data={{ logType: "-1", id: "mnuClose" }} text="Close" />
                        </Menu> */}
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

      </>
    );
  }
}
