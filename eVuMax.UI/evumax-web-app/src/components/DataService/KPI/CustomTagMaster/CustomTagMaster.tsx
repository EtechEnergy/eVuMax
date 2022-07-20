
import React, { Component } from 'react'

import axios from "axios";

import { Button, ColorPicker, Dialog, DropDownList, Input, Label, TreeView, Window } from "@progress/kendo-react-all";

import BrokerRequest from "../../../../broker/BrokerRequest";
import BrokerParameter from "../../../../broker/BrokerParameter";
import GlobalMod from "../../../../objects/global";
import * as UI from "../../../../eVuMaxObjects/UIObjects/phaseTreeNode";

//import snapBulletRed from "../../../../images/snapbulletred.png";
import { clsCustomTagCategory } from './clsCustomTagCategory';
import { clsCustomTagSubCategory } from './clsCustomTagSubCategory';
import { clsCustomTagActivity } from './clsCustomTagActivity';
import NotifyMe from 'react-notification-timeline';
import * as utilFunc from '../../../../utilFunctions/utilFunctions';

import { confirmAlert } from 'react-confirm-alert';
import * as utilFunctions from "../../../../utilFunctions/utilFunctions";
import { customTagTreeNode, enumCustomTagTreeNodeType } from './customTagTreeNode';
import { comboData } from '../../../../eVuMaxObjects/UIObjects/comboData';


let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("", "");

export default class CustomTagMaster extends Component {
    //KPICustomTagMaster
    objTreeNodes: any[] = [];
    objData: any;


    state = {

        tree: [] as any,
        isParentSelected: false,
        objCustomTag: new clsCustomTagCategory(),
        objSubCategory: new clsCustomTagSubCategory(),
        objActivity: new clsCustomTagActivity(),
        showActivityEditor: false,
        showCustomTagEditor: false,
        showSubCatEditor: false,
        AddBtnCaption: "Add Category",
        warningMsg: [],
        selectedNodeType: enumCustomTagTreeNodeType.Master,
        //selectedNode: new UI.phaseTreeNode(),
        EditingInProgress: false,
        editMode: "",
        selectedSource: new comboData(),
        cboSourceList: [] as any



    }

    loadSourceList = () => {
        try {



            objBrokerRequest = new BrokerRequest();

            objBrokerRequest.Module = "Common";
            objBrokerRequest.Broker = "Common.Functions";
            objBrokerRequest.Function = "getTable";
            objParameter.ParamName = "strSQL";
            objParameter.ParamValue = "SELECT SOURCE_ID, SOURCE_NAME FROM [VMX_TAG_SOURCES] ORDER BY SOURCE_NAME";
            objBrokerRequest.Parameters.push(objParameter);



            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })

                .then(async (res) => {
                    
                    const objData = JSON.parse(res.data.Response);



                    let cboSourceList: comboData[] = [];
                    for (let index = 0; index < objData.length; index++) {
                        let objCombo = new comboData(objData[index].SOURCE_NAME, objData[index].SOURCE_ID);
                        cboSourceList.push(objCombo);
                    }

                    // cboRuleTypeList_.push(new comboData(objRuleTypeList[0].RuleType, "0"));
                    // cboRuleTypeList_.push(new comboData(objRuleTypeList[1].RuleType, "1"));


                    await this.setState({
                        cboSourceList: cboSourceList,
                        selectedSource: cboSourceList[0]
                    });

                    this.loadTree();

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
            this.loadSourceList();
        } catch (error) {

        }
    }

    prepareTree = () => {
        try {
            
            if (this.objData != null) {

                this.objTreeNodes = [];

                let objRootNode:customTagTreeNode = new customTagTreeNode();
                objRootNode.nodeType =enumCustomTagTreeNodeType.Master;
                objRootNode.id = "Root";
                objRootNode.text = "Master Entries";
                objRootNode.CategoryID = "";
                objRootNode.imageUrl = null;
                objRootNode.expanded = true;

                objRootNode = this.loadCategoryNodes(objRootNode);

                this.objTreeNodes.push(objRootNode);
                this.setState({
                    tree: this.objTreeNodes.map((item) => Object.assign({}, item, { expanded: false })),
                });


            }

        } catch (error) {

        }
    }

    loadCategoryNodes = (objParentNode:customTagTreeNode): customTagTreeNode => {
        try {

            

            for (let index = 0; index < this.objData.items.length; index++) {


                let objItem: customTagTreeNode = this.objData.items[index];

              



                let objNode: customTagTreeNode = new customTagTreeNode();
                objNode.nodeID = objItem.nodeID;
                objNode.CategoryID = objItem.CategoryID;
                objNode.nodeType =enumCustomTagTreeNodeType.Category;
                objNode.text = objItem.text;
                objNode.expanded = false;
                objNode.objCustomTag = objItem.objCustomTag;
                objNode.objSubCategory = new clsCustomTagSubCategory();
                objNode.objActivity = new clsCustomTagActivity();



                if (objItem.items.length > 0) {
                    this.loadSubCategoryNodes(objItem.items, objNode);
                }


                objParentNode.items.push(objNode);


            }

            return objParentNode;

        } catch (error) {

        }
    }

    loadSubCategoryNodes = (objData: any, objParentNode: customTagTreeNode): customTagTreeNode => {
        try {



            for (let index = 0; index < objData.length; index++) {


                let objItem: customTagTreeNode = objData[index];
                let objNode: customTagTreeNode = new customTagTreeNode();

                objNode.nodeID = objItem.nodeID;
                objNode.CategoryID = objItem.CategoryID;
                objNode.SubCategoryID = objItem.SubCategoryID
                objNode.nodeType =enumCustomTagTreeNodeType.SubCategory;
                objNode.text = objItem.text;
                objNode.objCustomTag = objParentNode.objCustomTag;
                objNode.objSubCategory = objItem.objSubCategory;


                if (objItem.items.length > 0) {
                    
                    this.loadActivitiesNodes(objItem.items, objNode);
                }
                objParentNode.items.push(objNode);
            }

            return objParentNode;

        } catch (error) {

        }
    }

    loadActivitiesNodes = (objData: any, objParentNode: customTagTreeNode): customTagTreeNode => {
        try {
            for (let index = 0; index < objData.length; index++) {

                
                let objItem: customTagTreeNode= objData[index];
                let objNode: customTagTreeNode = new customTagTreeNode();
                objNode.nodeID = objItem.nodeID;
                objNode.CategoryID = objItem.CategoryID;
                objNode.nodeType = enumCustomTagTreeNodeType.Activity;
                objNode.text = objItem.text;
                objNode.objActivity = objItem.objActivity;
                objNode.objCustomTag = objParentNode.objCustomTag;
                objNode.objSubCategory = objParentNode.objSubCategory;
                //objNode.objEmph.Color = utilFunctions.convertRGBtoHex(objItem.objEmph.Color);

                objNode.objActivity.Color = "rgb(" + objItem.objActivity.Color + ")";


                objParentNode.items.push(objNode);
            }


            return objParentNode;
        } catch (error) {

        }

    }

    loadTree = () => {
        try {

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Function = "generateTree";
            objBrokerRequest.Broker = "KPICustomTagMaster";

            objParameter.ParamName = "SourceID";
            objParameter.ParamValue = this.state.selectedSource.id;
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
                    console.log("CustomTag Tree Str: ", objData);
                    this.objData = objData;
                    this.prepareTree();

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

    handleChangeDropDown = async (event: any) => {
        try {
            await this.setState({
                selectedSource: event.value
            });

            this.loadTree();

        } catch (error) {

        }
    }
    onExpandChange = (event: any) => {
        event.item.expanded = !event.item.expanded;
        this.state.isParentSelected = false;

    };

    onTreeItemClick = (event: any) => {
        
        // if (this.state.EditingInProgress) {
        //     return;
        // }


        // event.item.selected = !event.item.selected;
        let objNode = new customTagTreeNode();
        objNode = event.item;

        if (objNode.nodeType == enumCustomTagTreeNodeType.Master) {

            //  this.searchPhaseFromObject(objNode, objNode.nodeType);
            
            this.setState({
                showActivityEditor: false,
                showCustomTagEditor: false,
                showSubCatEditor: false,
                AddBtnCaption: "Add Category",
                objCustomTag: new clsCustomTagCategory(),

            });
        }

        if (objNode.nodeType == enumCustomTagTreeNodeType.Category) {

            this.setState({
               
                AddBtnCaption: "Add Sub Category",
                objCustomTag: objNode.objCustomTag,
                selectedNodeType: enumCustomTagTreeNodeType.Category,



            });

        }

        if (objNode.nodeType == enumCustomTagTreeNodeType.SubCategory) {

            this.setState({
                // showPhaseEditor: false,
                // showStepEditor: true,
                // showEmphEditor: false,
                // EditingInProgress: true,
                AddBtnCaption: "Add Activity",
                selectedNodeType:  enumCustomTagTreeNodeType.SubCategory,
                objCustomTag: objNode.objCustomTag,
                objSubCategory: objNode.objSubCategory,
                objActivity: new clsCustomTagActivity(),
            });

        }

        if (objNode.nodeType == enumCustomTagTreeNodeType.Activity) {
            this.setState({
                AddBtnCaption: "Add Activity",
                selectedNodeType:  enumCustomTagTreeNodeType.Activity,
                objCustomTag: objNode.objCustomTag,
                objSubCategory: objNode.objSubCategory,
                objActivity:objNode.objActivity,
            });

        }

        this.setState({
            selectedNode: objNode
        });

    };


    buttonAddClicked = async () => {

        
        if (this.state.AddBtnCaption == "Add Category") {

            await this.setState({
                showCustomTagEditor: true,
                objCategory: new clsCustomTagCategory(),
                EditingInProgress: true,
                editMode: "A"
            });
        }

        if (this.state.AddBtnCaption == "Add Sub Category") {
            
            await this.setState({
                showCustomTagEditor: false,
                showSubCatEditor:true,
                // objCustomTag: new clsCustomTagCategory(),
                objSubCategory: new clsCustomTagSubCategory(),
                // objActivity: new clsCustomTagActivity(),
                EditingInProgress: true,
                editMode: "A"
            });
        }

        if (this.state.AddBtnCaption == "Add Activity") {

            await this.setState({
                showActivityEditor: true,
                objActivity: new clsCustomTagActivity(),
                EditingInProgress: true,
                editMode: "A"
            });
        }
    }

    buttonEditClicked = async () => {
        try {
            
            if (this.state.selectedNodeType == enumCustomTagTreeNodeType.Category) {
                
                await this.setState({
                    // showActivityEditor: false,
                    showCustomTagEditor: true,
                   // objCustomTag: new clsCustomTagCategory(),
                    // showSubCatEditor: false,
                    EditingInProgress: true,
                    editMode: "E"
                });

            }

            if (this.state.selectedNodeType == enumCustomTagTreeNodeType.SubCategory) {
                await this.setState({
                    // showActivityEditor: false,
                    // showCustomTagEditor: true,
                    showSubCatEditor: true,
                    EditingInProgress: true,
                    editMode: "E"
                });

            }

            if (this.state.selectedNodeType == enumCustomTagTreeNodeType.Activity) {
                await this.setState({
                    showActivityEditor: true,
                    // showCustomTagEditor: true,
                    // showSubCatEditor: false,
                    EditingInProgress: true,
                    editMode: "E"
                });

            }

        } catch (error) {

        }
    }

    
    removeActivity=()=>{
        try {
            confirmAlert({
                //title: 'eVuMax',
                message: 'Are you sure want to delete selected Activity ?',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Yes',
                        onClick: async () => {
                            
                            objBrokerRequest = new BrokerRequest();
                            objBrokerRequest.Module = "DataService";
                            objBrokerRequest.Function = "removeActivity";
                            objBrokerRequest.Broker = "KPICustomTagMaster";

                            let objLocalActivity: clsCustomTagActivity = new clsCustomTagActivity();
                            objLocalActivity = utilFunctions.CopyObject(this.state.objActivity);
                            // objLocalActivity.TagCategoryId = this.state.objCustomTag.TagCategoryId;
                            // objLocalActivity.TagSubCategoryId = this.state.objSubCategory.TagSubCategoryId;
                            // objLocalActivity.SourceID = this.state.selectedSource.id;
                            objLocalActivity.Color =utilFunctions.rgb2hex(objLocalActivity.Color);
                            objParameter = new BrokerParameter('objActivity', JSON.stringify(objLocalActivity));

                         

                            objBrokerRequest.Parameters.push(objParameter);

                            axios.post(_gMod._performTask, {
                                paramRequest: JSON.stringify(objBrokerRequest),
                            })
                                .then(async (response) => {

                                    this.setState({
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
    removeSubCategory=()=>{
        try {
            confirmAlert({
                //title: 'eVuMax',
                message: 'Are you sure want to delete selected Sub Category ?',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Yes',
                        onClick: async () => {
                            
                            objBrokerRequest = new BrokerRequest();
                            objBrokerRequest.Module = "DataService";
                            objBrokerRequest.Function = "removeSubCategoryTag";
                            objBrokerRequest.Broker = "KPICustomTagMaster";

                            objParameter = new BrokerParameter('objSubCustomTag', JSON.stringify(this.state.objSubCategory));

                            objBrokerRequest.Parameters.push(objParameter);

                            axios.post(_gMod._performTask, {
                                paramRequest: JSON.stringify(objBrokerRequest),
                            })
                                .then(async (response) => {

                                    this.setState({
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

    removeCategory=()=>{
        try {
            confirmAlert({
                //title: 'eVuMax',
                message: 'Are you sure want to delete selected Category ?',
                childrenElement: () => <div />,
                buttons: [
                    {
                        label: 'Yes',
                        onClick: async () => {
                            
                            objBrokerRequest = new BrokerRequest();
                            objBrokerRequest.Module = "DataService";
                            objBrokerRequest.Function = "removeCategoryTag";
                            objBrokerRequest.Broker = "KPICustomTagMaster";

                            objParameter = new BrokerParameter('objCustomTag', JSON.stringify(this.state.objCustomTag));

                            objBrokerRequest.Parameters.push(objParameter);

                            axios.post(_gMod._performTask, {
                                paramRequest: JSON.stringify(objBrokerRequest),
                            })
                                .then(async (response) => {

                                    this.setState({
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


    removeNode = () => {
        try {
            
            if (this.state.selectedNodeType == enumCustomTagTreeNodeType.Category) {
                this.removeCategory();
            }

            if (this.state.selectedNodeType == enumCustomTagTreeNodeType.SubCategory) {
               this.removeSubCategory();
            }

            if (this.state.selectedNodeType == enumCustomTagTreeNodeType.Activity) {
                this.removeActivity();
            }


        } catch (error) {

        }
    }

    handleCategoryChange = (event: any, field: string) => {


        const value = event.value;

        const name = field; // target.props ? target.props.name : target.name;
        let edited: any = utilFunc.CopyObject(this.state.objCustomTag);
        edited[field] = value;
        this.setState({
            objCustomTag: edited
        });

    };

    handleSubCategoryChange = (event: any, field: string) => {


        const value = event.value;

        const name = field; // target.props ? target.props.name : target.name;
        let edited: any = utilFunc.CopyObject(this.state.objSubCategory);
        edited[field] = value;
        this.setState({
            objSubCategory: edited
        });

    };

    handleActivityChange = (event: any, field: string) => {


        const value = event.value;

        const name = field; // target.props ? target.props.name : target.name;
        let edited: any = utilFunc.CopyObject(this.state.objActivity);
        edited[field] = value;
        this.setState({
            objActivity: edited
        });

    };


    saveCustomTag=()=>{
        try {

            let FunctioName = "";
            if (this.state.editMode == "A") {
                FunctioName = "addCategoryTag"
            }
            if (this.state.editMode == "E") {
                FunctioName = "editCategoryTag"
            }

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Function = FunctioName;
            objBrokerRequest.Broker = "KPICustomTagMaster";

            let localCustomTag: clsCustomTagCategory = new clsCustomTagCategory();
            localCustomTag = utilFunc.CopyObject( this.state.objCustomTag);
            localCustomTag.SourceID =this.state.selectedSource.id;
            
            objParameter = new BrokerParameter('objCustomTag', JSON.stringify(localCustomTag));

            objBrokerRequest.Parameters.push(objParameter);

            axios.post(_gMod._performTask, {
                paramRequest: JSON.stringify(objBrokerRequest),
            })
                .then(async (response) => {

                    alert(response.data);
                    this.setState({
                        showCustomTagEditor: false,
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

    saveActivity = () => {
        try {

            
            let FunctioName = "";


            if (this.state.editMode == "A") {
                FunctioName = "addActivity"
            }
            if (this.state.editMode == "E") {
                FunctioName = "editActivity"
            }

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Function = FunctioName;
            objBrokerRequest.Broker = "KPICustomTagMaster";

            
            let objLocalActivity: clsCustomTagActivity = new clsCustomTagActivity();
            objLocalActivity = utilFunctions.CopyObject(this.state.objActivity);
            objLocalActivity.TagCategoryId = this.state.objCustomTag.TagCategoryId;
            objLocalActivity.TagSubCategoryId = this.state.objSubCategory.TagSubCategoryId;
            objLocalActivity.SourceID = this.state.selectedSource.id;
            


            
            objLocalActivity.Color =utilFunctions.rgb2hex(objLocalActivity.Color);
            objParameter = new BrokerParameter('objActivity', JSON.stringify(objLocalActivity));
            objBrokerRequest.Parameters.push(objParameter);
            // objParameter = new BrokerParameter('color', localColor);

            // objBrokerRequest.Parameters.push(objParameter);

            axios.post(_gMod._performTask, {
                paramRequest: JSON.stringify(objBrokerRequest),
            })
                .then(async (response) => {

                    this.setState({
                        showActivityEditor:false,
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


    saveSubCustomTag=()=>{
        try {

            let FunctioName = "";
            if (this.state.editMode == "A") {
                FunctioName = "addSubCategoryTag"
            }
            if (this.state.editMode == "E") {
                FunctioName = "editSubCategoryTag"
            }

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Function = FunctioName;
            objBrokerRequest.Broker = "KPICustomTagMaster";

            let localCustomSubCategoryTag: clsCustomTagSubCategory = new clsCustomTagSubCategory();
            localCustomSubCategoryTag = utilFunc.CopyObject( this.state.objSubCategory);
            localCustomSubCategoryTag.SourceID =this.state.selectedSource.id;
            localCustomSubCategoryTag.TagCategoryId =this.state.objCustomTag.TagCategoryId;
            
            objParameter = new BrokerParameter('objSubCustomTag', JSON.stringify(localCustomSubCategoryTag));

            objBrokerRequest.Parameters.push(objParameter);

            axios.post(_gMod._performTask, {
                paramRequest: JSON.stringify(objBrokerRequest),
            })
                .then(async (response) => {

                    alert(response.data);
                    
                    this.setState({
                        showSubCatEditor: false,
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



    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-4" >
                        <label className='mr-2'>Source</label>
                        <DropDownList
                            name="RuleType"
                            label=''
                            data={this.state.cboSourceList}
                            textField="text"
                            dataItemKey="id"
                            value={this.state.selectedSource}
                            style={{ width: 200 }}
                            onChange={(event) => {

                                this.handleChangeDropDown(event);

                            }}
                        />



                        <div style={{ height: "800px", overflowX: "hidden", overflowY: "scroll" }}>
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
                        <Button onClick={this.buttonAddClicked} className='p-2 m-2' style={{ width: "125px" }}>
                            {this.state.AddBtnCaption}
                        </Button>
                        <br />
                        <Button onClick={this.buttonEditClicked} className='p-2 m-2' style={{ width: "125px" }}>
                            Edit
                        </Button>
                        <br />
                        <Button className='p-2 m-2' style={{ width: "125px" }} onClick={this.removeNode}>
                            Remove
                        </Button>
                    </div>
                </div>



                {
                    this.state.showCustomTagEditor &&

                    <Dialog title="Custom Tag Editor"
                        width={"500px"}
                        height={"200px"}
                        onClose={(e: any) => {
                            this.setState({
                                showCustomTagEditor: false,
                                EditingInProgress: false,
                                EditMode: ""
                            })
                        }}
                    >
                        <div>
                            <label>Category Name</label>
                            <Input value={this.state.objCustomTag.TagName} onChange={(e) => { this.handleCategoryChange(e, "TagName") }} ></Input>
                            <br></br>
                            <label>Notes</label>
                            <br></br>
                            <Input value={this.state.objCustomTag.Notes} onChange={(e) => { this.handleCategoryChange(e, "Notes") }} ></Input>
                            <br></br>
                            <Button onClick={this.saveCustomTag}>Save</Button>
                            {/* <Button >Save</Button> */}
                            <Button onClick={(e: any) => { this.setState({ EditingInProgress: false, showCustomTagEditor: false }); }}>Cancel</Button>
                        </div>



                    </Dialog>

                }



                {
                    this.state.showSubCatEditor &&

                    <Dialog title="Category Tag Editor"
                        width={"500px"}
                        height={"200px"}
                        onClose={(e: any) => {
                            this.setState({
                                showSubCatEditor: false,
                                EditingInProgress: false,
                                EditMode: ""
                            })
                        }}
                    >
                        <div>
                            <label>Category:  {this.state.objCustomTag.TagName}  </label>
                            <br></br>

                            <label>Sub Category Name</label>
                            <Input value={this.state.objSubCategory.TagName} onChange={(e) => { this.handleSubCategoryChange(e, "TagName") }} ></Input>
                            <br></br>
                            <label>Notes</label>
                            <br></br>
                            <Input value={this.state.objSubCategory.Notes} onChange={(e) => { this.handleSubCategoryChange(e, "Notes") }} ></Input>
                            <br></br>
                            <Button onClick={this.saveSubCustomTag}>Save</Button>
                            
                            <Button onClick={(e: any) => { this.setState({ EditingInProgress: false, showSubCatEditor: false, EditMode: "" }); }}>Cancel</Button>
                        </div>



                    </Dialog>

                }



                {
                    this.state.showActivityEditor &&

                    <Dialog title="Activity Editor"
                        width={"600px"}
                        height={"300px"}
                        onClose={(e: any) => {
                            this.setState({
                                showActivityEditor: false,
                                EditingInProgress: false,
                                EditMode: ""
                            })
                        }}
                    >
                        <div>
                            <label>Category Name:  {this.state.objCustomTag.TagName}  </label>
                            <br></br>

                            <label>Sub Category Name:  {this.state.objSubCategory.TagName}  </label>
                            <br></br>

                            <label>Activity Name</label>
                            <Input value={this.state.objActivity.ActivityName} onChange={(e) => { this.handleActivityChange(e, "ActivityName") }} ></Input>
                            <br></br>
                            <label>Color</label>
                            <ColorPicker value={this.state.objActivity.Color} onChange={e => { this.handleActivityChange(e, "Color") }} />
                            <br></br>
                            <label>Notes</label>
                            <br></br>
                            <Input value={this.state.objActivity.Notes} onChange={(e) => { this.handleActivityChange(e, "Notes") }} ></Input>
                            <br></br>
                            <br></br>
                            <Button onClick={this.saveActivity}>Save</Button>
                            
                            <Button onClick={(e: any) => { this.setState({ EditingInProgress: false, showActivityEditor: false, EditMode: "" }); }}>Cancel</Button>
                        </div>



                    </Dialog>

                }



            </div >
        );
    }
}

