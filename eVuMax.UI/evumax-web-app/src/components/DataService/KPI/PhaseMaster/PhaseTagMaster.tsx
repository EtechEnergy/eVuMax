
import React, { Component } from 'react'

import axios from "axios";

import { Button, Dialog, Input, Label, TreeView, Window } from "@progress/kendo-react-all";

import BrokerRequest from "../../../../broker/BrokerRequest";
import BrokerParameter from "../../../../broker/BrokerParameter";
import GlobalMod from "../../../../objects/global";
import * as UI from "../../../../eVuMaxObjects/UIObjects/phaseTreeNode";

//import snapBulletRed from "../../../../images/snapbulletred.png";
import { clsPhase } from './clsPhase';
import { clsStep } from './clsStep';
import { clsEmph } from './clsEmph';
import NotifyMe from 'react-notification-timeline';
import * as utilFunc from '../../../../utilFunctions/utilFunctions';
import { isObjectBindingPattern } from 'typescript';
import { confirmAlert } from 'react-confirm-alert';


let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

export default class PhaseTagMaster extends Component {

    objTreeNodes: any[] = [];
    objData: any;

    state = {

        tree: [] as any,
        isParentSelected: false,
        objPhase: new clsPhase(),
        objStep: new clsStep(),
        objEmph: new clsEmph(),
        showPhaseEditor: false,
        showStepEditor: false,
        showEmphEditor: false,
        AddBtnCaption: "Add Emphasis",
        warningMsg: [],
        selectedNodeType: UI.enumPhaseNodeType.Master,
        selectedNode: new UI.phaseTreeNode(),
        EditingInProgress: false,
        editMode: ""

    }

    buttonAddClicked = async () => {
        // await this.setState({
        //     showPhaseEditor: true
        // });

        if (this.state.AddBtnCaption == "Add Phase") {

            await this.setState({
                showPhaseEditor: true,
                objPhase: new clsPhase(),
                EditingInProgress: true,
                editMode: "A"
            });
        }

        if (this.state.AddBtnCaption == "Add Step") {
            
            await this.setState({
                showPhaseEditor: false,
                showStepEditor:true,
                objPhase: new clsPhase(),
                objStep: new clsStep(),
                EditingInProgress: true,
                editMode: "A"
            });
        }
    }

    handlePhaseChange = (event: any, field: string) => {


        const value = event.value;

        const name = field; // target.props ? target.props.name : target.name;
        let edited: any = utilFunc.CopyObject(this.state.objPhase);
        edited[field] = value;
        this.setState({
            objPhase: edited
        });

    };

    handleStepChange = (event: any, field: string) => {


        const value = event.value;

        const name = field; 
        let edited: any = utilFunc.CopyObject(this.state.objStep);
        edited[field] = value;
        this.setState({
            objStep: edited
        });

    };



    removeNode = () => {
        try {
            debugger;
            if (this.state.selectedNode.nodeType == UI.enumPhaseNodeType.Phase) {
                this.removePhase();
            }


        } catch (error) {

        }
    }
    removePhase = () => {
        try {
            debugger;
            confirmAlert({
                //title: 'eVuMax',
                message: 'Are you sure want to delete selected Phase ?',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Yes',
                        onClick: async () => {
                            debugger;
                            objBrokerRequest = new BrokerRequest();
                            objBrokerRequest.Module = "DataService";
                            objBrokerRequest.Function = "removePhase";
                            objBrokerRequest.Broker = "KPIPhaseMaster";

                            objParameter = new BrokerParameter('objPhase', JSON.stringify(this.state.objPhase));

                            objBrokerRequest.Parameters.push(objParameter);

                            axios.post(_gMod._performTask, {
                                paramRequest: JSON.stringify(objBrokerRequest),
                            })
                                .then(async (response) => {

                                    this.setState({
                                        showPhaseEditor: false,
                                        EditingInProgress: false,
                                        editMode: ""
                                    });

                                    await this.loadTree();
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

    savePhase = () => {
        try {

            let FunctioName = "";
            if (this.state.editMode == "A") {
                FunctioName = "addPhase"
            }
            if (this.state.editMode == "E") {
                FunctioName = "editPhase"
            }

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Function = FunctioName;
            objBrokerRequest.Broker = "KPIPhaseMaster";

            objParameter = new BrokerParameter('objPhase', JSON.stringify(this.state.objPhase));

            objBrokerRequest.Parameters.push(objParameter);

            axios.post(_gMod._performTask, {
                paramRequest: JSON.stringify(objBrokerRequest),
            })
                .then(async (response) => {

                    this.setState({
                        showPhaseEditor: false,
                        EditingInProgress: false,
                        editMode: ""
                    });

                    await this.loadTree();
                })
                .catch((error) => {
                    console.log(error);
                });



        } catch (error) {

        }
    }

    saveStep = () => {
        try {

            let FunctioName = "";
            if (this.state.editMode == "A") {
                FunctioName = "addStep"
            }
            if (this.state.editMode == "E") {
                FunctioName = "editStep"
            }

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Function = FunctioName;
            objBrokerRequest.Broker = "KPIPhaseMaster";

            objParameter = new BrokerParameter('objStep', JSON.stringify(this.state.objStep));

            objBrokerRequest.Parameters.push(objParameter);

            axios.post(_gMod._performTask, {
                paramRequest: JSON.stringify(objBrokerRequest),
            })
                .then(async (response) => {

                    this.setState({
                        showPhaseEditor: false,
                        showStepEditor: false,
                        EditingInProgress: false,
                        editMode: ""
                    });

                    await this.loadTree();
                })
                .catch((error) => {
                    console.log(error);
                });



        } catch (error) {

        }
    }



    buttonEditClicked = async () => {
        try {
            debugger;
            if (this.state.selectedNodeType == UI.enumPhaseNodeType.Phase) {
                await this.setState({
                    showPhaseEditor: true,
                    EditingInProgress: true,
                    editMode: "E"
                });

            }

            if (this.state.selectedNodeType == UI.enumPhaseNodeType.StepPhase) {
                await this.setState({
                    showPhaseEditor: false,
                    showStepEditor:true,
                    EditingInProgress: true,
                    editMode: "E"
                });

            }

        } catch (error) {

        }
    }

    loadTree = () => {
        try {

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Function = "loadPhaseTree";
            objBrokerRequest.Broker = "KPIPhaseMaster";

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
                    debugger;
                    const objData = JSON.parse(res.data.Response);
                    console.log("Phase Tree Str: ", objData);
                    this.objData = objData;
                    this.preparePhaseTree();

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
        } catch (error) {

        }

    }

    componentDidMount(): void {
        try {
            this.loadTree();
        } catch (error) {

        }
    }

    loadEmphNodes = (objData: any, objParentNode: UI.phaseTreeNode): UI.phaseTreeNode => {
        try {
            for (let index = 0; index < objData.length; index++) {


                let objItem: UI.phaseTreeNode = objData[index];
                let objNode: UI.phaseTreeNode = new UI.phaseTreeNode();
                objNode.nodeID = objItem.nodeID;
                objNode.PhaseID = objItem.PhaseID;
                objNode.nodeType = UI.enumPhaseNodeType.Emph;
                objNode.text = objItem.text;
                objNode.objEmph = objItem.objEmph;


                objParentNode.items.push(objNode);
            }


            return objParentNode;
        } catch (error) {

        }

    }


    loadStepsNodes = (objData: any, objParentNode: UI.phaseTreeNode): UI.phaseTreeNode => {
        try {



            for (let index = 0; index < objData.length; index++) {


                let objItem: UI.phaseTreeNode = objData[index];
                let objNode: UI.phaseTreeNode = new UI.phaseTreeNode();
                
                objNode.nodeID = objItem.nodeID;
                objNode.PhaseID = objItem.PhaseID;
                objNode.StepID = objItem.StepID
                objNode.nodeType = UI.enumPhaseNodeType.StepPhase;
                objNode.text = objItem.text;
                objNode.objStep = objItem.objStep;
                

                if (objItem.items.length > 0) {
                    this.loadEmphNodes(objItem.items, objNode);
                }
                objParentNode.items.push(objNode);
            }

            return objParentNode;

        } catch (error) {

        }
    }

    loadPhaseNodes = (objParentNode: UI.phaseTreeNode): UI.phaseTreeNode => {
        try {

            debugger;

            for (let index = 0; index < this.objData.items.length; index++) {


                let objItem: UI.phaseTreeNode = this.objData.items[index];

                if (objItem.text == "Nishant") {
                    debugger;
                }



                let objNode: UI.phaseTreeNode = new UI.phaseTreeNode();
                objNode.nodeID = objItem.nodeID;
                objNode.PhaseID = objItem.PhaseID;
                objNode.nodeType = UI.enumPhaseNodeType.Phase;
                objNode.text = objItem.text;
                objNode.expanded = false;
                objNode.objPhase = objItem.objPhase;

                if (objItem.items.length > 0) {
                    this.loadStepsNodes(objItem.items, objNode);
                }


                objParentNode.items.push(objNode);


            }

            return objParentNode;

        } catch (error) {

        }
    }

    preparePhaseTree = () => {
        try {
            debugger;
            if (this.objData != null) {

                this.objTreeNodes = [];

                let objRootNode: UI.phaseTreeNode = new UI.phaseTreeNode();
                objRootNode.nodeType = UI.enumPhaseNodeType.Master;
                objRootNode.id = "Root";
                objRootNode.text = "Master Entries";
                objRootNode.PhaseID = "";
                objRootNode.imageUrl = null;
                objRootNode.expanded = true;

                objRootNode = this.loadPhaseNodes(objRootNode);

                this.objTreeNodes.push(objRootNode);
                this.setState({
                    tree: this.objTreeNodes.map((item) => Object.assign({}, item, { expanded: false })),
                });


            }

        } catch (error) {

        }
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

    updateTree(treeNode: any, NodeText: any): any {


        // if (treeNode.text == NodeText) {
        //     return treeNode;
        // } else
        if (treeNode.items != null) {
            var i;
            let result: any = null;
            for (i = 0; result == null && i < treeNode.items.length; i++) {
                result = this.updateTree(treeNode.items[i], NodeText);
            }
            if (result.nodeType == UI.enumPhaseNodeType.Phase) {
                result.objPhase = this.state.selectedNode.objPhase;
            }
        }
        return null;
    }


    searchPhaseFromObject = (objNode: UI.phaseTreeNode, nodeType: UI.enumPhaseNodeType) => {
        try {

            let objPhase_ = new clsPhase();
            objPhase_ = this.state.objPhase;

            //   if (nodeType == UI.enumPhaseNodeType.StepPhase) {
            //     let index = objPhase_.item.findIndex(x => x.ObjectID === objNode.wellboreID);


            //     const timeLogList = Object.values(objWell_.wellbores[index].timeLogs);
            //     let i = timeLogList.findIndex(x => x.ObjectID === objNode.logID);
            //     let objTimelog = new DataObjects.TimeLog();
            //     //objTimelog = <DataObjects.TimeLog> timeLogList ;

            //     this.setState({ objTimeLog: timeLogList[i] });
            //     console.log(timeLogList[i]);
            //     console.log(this.state.objTimeLog.ObjectID);
            //   }

            //   if (logType == UI.enumNodeType.depthLog) {

            //     let index = objWell_.wellbores.findIndex(x => x.ObjectID === objNode.wellboreID);
            //     const deptLogList = Object.values(objWell_.wellbores[index].depthLogs);
            //     let i = deptLogList.findIndex(x => x.ObjectID === objNode.logID);
            //     return deptLogList[i];
            //   }

            //   if (logType == UI.enumNodeType.trajectory) {
            //     let index = objWell_.wellbores.findIndex(x => x.ObjectID === objNode.wellboreID);
            //     const trajList = Object.values(objWell_.wellbores[index].trajectories);
            //     let i = trajList.findIndex(x => x.ObjectID === objNode.logID);


            //     return trajList[i];


            //   }

            //   //Nishant 25-06-2020
            //   if (logType == UI.enumNodeType.mudLog) {
            //     let index = objWell_.wellbores.findIndex(x => x.ObjectID === objNode.wellboreID);
            //     const MudLogList = Object.values(objWell_.wellbores[index].mudLogs);
            //     let i = MudLogList.findIndex(x => x.mudLogID === objNode.logID);
            //     return MudLogList[i];
            //   }


        } catch (error) {

        }
    }

    //Treeview Control
    onExpandChange = (event: any) => {
        event.item.expanded = !event.item.expanded;
        this.state.isParentSelected = false;

    };

    onTreeItemClick = (event: any) => {
        debugger;
        // if (this.state.EditingInProgress) {
        //     return;
        // }


        // event.item.selected = !event.item.selected;
        let objNode = new UI.phaseTreeNode();
        objNode = event.item;



        if (objNode.nodeType == UI.enumPhaseNodeType.Master) {

            this.searchPhaseFromObject(objNode, objNode.nodeType);
            this.setState({
                showPhaseEditor: false,
                // showStepEditor: false,
                // showEmphEditor: false,
                AddBtnCaption: "Add Phase"

            });
        }

        if (objNode.nodeType == UI.enumPhaseNodeType.Phase) {

            this.setState({
                // showPhaseEditor: true,
                // showStepEditor: false,
                // showEmphEditor: false,
                // EditingInProgress: true,
                AddBtnCaption: "Add Step",
                objPhase: objNode.objPhase,
                selectedNodeType: UI.enumPhaseNodeType.Phase


            });

        }

        if (objNode.nodeType == UI.enumPhaseNodeType.StepPhase) {
            this.setState({
                // showPhaseEditor: false,
                // showStepEditor: true,
                // showEmphEditor: false,
                // EditingInProgress: true,
                AddBtnCaption: "Add Emphasis",
                selectedNodeType: UI.enumPhaseNodeType.StepPhase,
                objStep: objNode.objStep,
            });

        }

        if (objNode.nodeType == UI.enumPhaseNodeType.Emph) {
            this.setState({
                // showPhaseEditor: false,
                // showStepEditor: false,
                // showEmphEditor: true,
                // EditingInProgress: true,
                AddBtnCaption: "Add Emphasis",
                selectedNodeType: UI.enumPhaseNodeType.Emph,
                objEmph: objNode.objEmph,
            });

        }

        this.setState({
            selectedNode: objNode
        });

    };

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-6" >

                        <div style={{ height: "200px" }}>
                            <TreeView

                                className={this.state.EditingInProgress ? "k-state-disabled" : ""} //Nishant 25-09-2020

                                data={this.state.tree}
                                expandIcons={true}
                                onExpandChange={this.onExpandChange}
                                onItemClick={this.onTreeItemClick}
                                // item={(props: any) => {
                                //     //Master = 999,
                                //     //Phase= 0,
                                //     //StepPhase = 1,
                                //     //Emph = 2,

                                //     // if (props.item.nodeType == 999) {
                                //     //     //Well
                                //     //     return (
                                //     //         <span className="treeViewText">
                                //     //             <img
                                //     //                 // src={require("../../../../images/blue_dot.png")}
                                //     //                 //src={redIco}
                                //     //                 key="0"
                                //     //                 style={{ width: 10, height: 10, marginRight: 10 }}
                                //     //             />
                                //     //             {props.item.text}
                                //     //         </span>
                                //     //     ); // ensure the return a single element
                                //     // }

                                //     // if (props.item.nodeType == 0) {
                                //     //     //Well
                                //     //     return (
                                //     //         <span className="treeViewText">
                                //     //             <img
                                //     //                 // src={require("../../../../images/blue_dot.png")}
                                //     //                 //src={GreenPng}
                                //     //                 key="0"
                                //     //                 style={{ width: 10, height: 10, marginRight: 10 }}
                                //     //             />
                                //     //             {props.item.text}
                                //     //         </span>
                                //     //     ); // ensure the return a single element
                                //     // }

                                //     // if (props.item.nodeType == 1) {
                                //     //     //Wellbore
                                //     //     return (
                                //     //         <span className="treeViewText">
                                //     //             <img
                                //     //                 // src={require("../../../../images/blue_dot.png")}
                                //     //                 // src={blueDotPng}
                                //     //                 key="0"
                                //     //                 style={{ width: 10, height: 10, marginRight: 10 }}
                                //     //             />
                                //     //             {props.item.text}
                                //     //         </span>
                                //     //     ); // ensure the return a single element
                                //     // }

                                //     // if (props.item.nodeType == 2) {
                                //     //     //timeLogs || depthlogs
                                //     //     return (
                                //     //         <span className="treeViewText">
                                //     //             <img
                                //     //                 src={require("../../../../images/blue_dot.png")}
                                //     //                 //src={redDotPng}
                                //     //                 key="0"
                                //     //                 style={{ width: 10, height: 10, marginRight: 10 }}
                                //     //             />
                                //     //             {props.item.text}
                                //     //         </span>
                                //     //     ); // ensure the return a single element
                                //     // }

                                //     return (
                                //         <span className="treeViewText">
                                //             <img
                                //                 src={require("../../../../images/blue_dot.png")}
                                //                 //src={snapBulletRed}
                                //                 key="0"
                                //                 style={{ width: 10, height: 10, marginRight: 10 }}
                                //             />
                                //             {props.item.text}
                                //         </span>
                                //     ); // ensure the return a single element
                                // }}
                                aria-multiselectable={true}
                            />

                        </div>

                    </div>

                    <div className="col-6">
                        <Button onClick={this.buttonAddClicked} className='p-2 m-2' style={{ width: "120px" }}>
                            {this.state.AddBtnCaption}
                        </Button>
                        <br />
                        <Button onClick={this.buttonEditClicked} className='p-2 m-2' style={{ width: "120px" }}>
                            Edit
                        </Button>
                        <br />
                        <Button className='p-2 m-2' style={{ width: "120px" }} onClick={this.removeNode}>
                            Remove
                        </Button>
                    </div>
                </div>



                {this.state.showPhaseEditor &&

                    <Dialog title="Phase Editor"
                        width={"500px"}
                        height={"200px"}
                        onClose={(e: any) => {
                            this.setState({
                                showPhaseEditor: false,
                                EditingInProgress: false
                            })
                        }}
                    >
                        <div>
                            <label>Phase Name</label>
                            <Input value={this.state.objPhase.PhaseName} onChange={(e) => { this.handlePhaseChange(e, "PhaseName") }} ></Input>
                            <br></br>
                            <label>Notes</label>
                            <br></br>
                            <Input value={this.state.objPhase.Notes} onChange={(e) => { this.handlePhaseChange(e, "Notes") }} ></Input>
                            <br></br>
                            <Button onClick={this.savePhase}>Save</Button>
                            <Button onClick={(e: any) => { this.setState({ EditingInProgress: false, showPhaseEditor: false }); }}>Cancel</Button>
                        </div>



                    </Dialog>

                }



                {this.state.showStepEditor &&

                    <Dialog title="Step Editor"
                        width={"500px"}
                        height={"200px"}
                        onClose={(e: any) => {
                            this.setState({
                                showPhaseEditor: false,
                                showStepEditor:false,
                                EditingInProgress: false
                            })
                        }}
                    >
                        <div>
                            <label>Step Name</label>
                            <Input value={this.state.objStep.StepName} onChange={(e) => { this.handleStepChange(e, "StepName") }} ></Input>
                            <br></br>
                            <label>Notes</label>
                            <br></br>
                            <Input value={this.state.objStep.Notes} onChange={(e) => { this.handleStepChange(e, "Notes") }} ></Input>
                            <br></br>
                            <Button onClick={this.saveStep}>Save</Button>
                            <Button onClick={(e: any) => { this.setState({ EditingInProgress: false, showStepEditor: false, EditMode:"" }); }}>Cancel</Button>
                        </div>



                    </Dialog>

                }



            </div>
        );
    }
}

