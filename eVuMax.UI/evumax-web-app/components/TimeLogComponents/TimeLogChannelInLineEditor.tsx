import React, { Component } from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Input, DropDownList, Button, NumericTextBox, Editor, Window } from '@progress/kendo-react-all';
import * as DataObjects from "../../eVuMaxObjects/dataObjects/dataObjects";
import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";
import GlobalMod from "../../objects/global";
import axios from "axios";
import { comboData } from "../../eVuMaxObjects/UIObjects/comboData";
import { Checkbox } from '@progress/kendo-react-inputs';

import ExpressionEditor from "../ExpressionEditorComponent/ExpressionEditor";


let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

let _gMod = new GlobalMod();

interface IProps {
    // dataItem: any
    // save: any
    // cancel: any
    // unitList: any

}
//unitList={this.state.UnitList} dataItem={this.state.channelInEdit} save={this.saveChannelInEdit} cancel={this.cancelChannelInEdit}
export default class TimeLogChannelInLineEditor extends Component<IProps> {
    constructor(parentRef, props: any) {
        super(props);
        this.__parentRef = parentRef;


        this.state = {
            objChannel: this.__parentRef.state.channelInEdit,
            editMode: (this.__parentRef.state.channelInEdit.mnemonic == "") ? "A" : "",
            VuMaxUnitID: new comboData(),
            showExpressionEditor: false
        };

        //this.forceUpdate();

    }

    __parentRef: any;
    // state = ({
    //     objChannel: JSON.parse(JSON.stringify(this.props.dataItem)),
    //     editMode: (this.props.dataItem.mnemonic == "") ? "A" : "",
    //     VuMaxUnitID: new comboData(),
    //     showExpressionEditor: false
    // });

    state = {
        objChannel: {} as any,
        editMode: "",
        VuMaxUnitID: new comboData(),
        showExpressionEditor: false
    };

    setComboData = (VuMaxUnitID: string) => {

        // this.props.unitList.forEach((objItem: comboData) => {
        this.__parentRef.state.UnitList.forEach((objItem: comboData) => {
            if (objItem.id == VuMaxUnitID) {

                const edited = this.state.objChannel;
                edited["VuMaxUnitID"] = objItem;

                this.setState({
                    objChannel: edited,
                    VuMaxUnitID: objItem
                });


            }
        });

    }

    componentDidMount() {



        this.setState({
            objChannel: this.__parentRef.state.channelInEdit,
            editMode: (this.__parentRef.state.channelInEdit.mnemonic == "") ? "A" : "",
            VuMaxUnitID: new comboData(),
            showExpressionEditor: false
        });

        //this.forceUpdate();
        // this.setComboData(this.props.dataItem.VuMaxUnitID);
        this.setComboData(this.__parentRef.state.channelInEdit.VuMaxUnitID);


        //  if(this.props.dataItem.mnemonic == ""){

        //     this.setState({
        //         editMode:"A"
        //     });
        //     this.forceUpdate();
        // }


    }

    // loadChannel = () => {
    //     let objChannel: DataObjects.logChannel = new DataObjects.logChannel();
    //     // objChannel.curveDescription = this.props.dataItem.description;
    //     objChannel.curveDescription = this.__parentRef.this.state.channelInEdit.description;

    // }
    // handleChangeDropDown = (event: any) => {
    //
    //     this.setState({ [event.target.name]: event.value });
    //     this.setState({ LibraryID: new comboData(event.value.text, event.value.id) });
    // }
    onDialogInputChange = (event: any, field: string) => {


        let value = event.value;
        const edited = this.state.objChannel;

        if (field == "VuMaxUnitID") {
            this.setState({
                [field]: value
            });
            value = value.id;
        }
        if (field == "valueQuery") {
            /// name = field;
            value = value.content.content[0].content.content[0].text; //Special Case
        }

        if (field == 'StoredProcParams') {
            // name = field;
            value = value.content.content[0].content.content[0].text;
        }

        edited[field] = value;

        this.setState({
            objChannel: edited
        });

    }
    save = () => {



        // this.state.objChannel.VuMaxUnitID = this.state.objChannel.VuMaxUnitID.id;
        //this.props.save(this.state.objChannel, this.state.editMode);
        let edited = this.state.objChannel;
        edited["VuMaxUnitID"] = this.state.objChannel.VuMaxUnitID.id;
        alert(edited["VuMaxUnitID"]);

        this.__parentRef.saveChannelInEdit(edited, this.state.editMode);
        return;
    }

    //Nishant 04-11-2020
    saveExpression = (paramExpression: string) => {
        try {
            const edited = this.state.objChannel;
            edited["Expression"] = paramExpression;

            this.setState({
                objChannel: edited,
                showExpressionEditor: false
            });

        } catch (error) {

        }
    }

    openEditor_Click = () => {
        try {
            this.setState({
                showExpressionEditor: true
            });

        } catch (error) {

        }
    }

    render() {
        return (
            <>

                {/* <Window
             onClose={this.props.cancel}
             modal={true}
           > */}


                <Dialog title={"Channel Properties"}
                    onClose={(e: any) => {
                        // this.props.cancel();
                        this.__parentRef.cancelChannelInEdit();

                    }}
                    width={800}
                // height= {700}
                >

                    <div >
                        <label>
                            <br />
                            <Input
                                name="mnemonic"
                                // style={{ width: "100%" }}
                                label="Mnemonic"
                                pattern={"[A-Za-z]+"}
                                minLength={2}
                                required={true}
                                value={this.state.objChannel.mnemonic}
                                disabled={this.__parentRef.state.channelInEdit.mnemonic == "" ? false : true}
                                //onChange={this.onDialogInputChange}
                                onChange={(e) => this.onDialogInputChange(e, "mnemonic")}
                            />
                        </label>
                    </div>

                    <div >
                        <label>
                            <br />
                            <Input
                                name="curveDescription"
                                // style={{ width: "100%" }}
                                label="Description"
                                pattern={"[A-Za-z]+"}
                                minLength={2}
                                required={true}
                                value={this.state.objChannel.curveDescription}
                                // onChange={this.onDialogInputChange}
                                onChange={(e) => this.onDialogInputChange(e, "curveDescription")}
                            />
                        </label>
                    </div>
                    <div >
                        <label>
                            Unit<br />
                            <DropDownList
                                name="VuMaxUnitID"
                                data={this.__parentRef.state.UnitList}
                                value={this.state.objChannel.VuMaxUnitID}
                                textField="text"
                                dataItemKey="id"
                                // onChange={this.onDialogInputChange}
                                onChange={(e) => this.onDialogInputChange(e, "VuMaxUnitID")}
                            />
                        </label>
                    </div>
                    <div className="row" >
                        <div className="col">

                            <div className="col">
                                <NumericTextBox
                                    min={0}
                                    name="ColumnOrder"
                                    // style={{ width: "100%" }}
                                    label="Column Order"
                                    value={this.state.objChannel.ColumnOrder}
                                    //onChange={this.onDialogInputChange}
                                    onChange={(e) => this.onDialogInputChange(e, "ColumnOrder")}
                                />
                            </div>

                            <div className="col">
                                <NumericTextBox
                                    min={0}
                                    name="sensorOffset"
                                    // style={{ width: "100%" }}
                                    label="Sensor Offset"
                                    value={isNaN(parseInt(this.state.objChannel.sensorOffset)) ? 0 : parseInt(this.state.objChannel.sensorOffset)}
                                    //  value={parseInt(this.state.objChannel.sensorOffset)}
                                    //onChange={this.onDialogInputChange}
                                    onChange={(e) => this.onDialogInputChange(e, "sensorOffset")}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-6">
                            <label style={{ color: "green" }} >
                                Note: As this log has been downloaded from WITSML server, you can only add Expression columns to the log. Please use 'Download Channels' functionality to download additional channels from the server.
                            </label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-8">
                            <label>Expression</label>

                            <Editor
                                contentStyle={{ height: 150 }}
                                defaultContent={this.state.objChannel.valueQuery}
                                value={this.state.objChannel.valueQuery}
                                onChange={(e) => this.onDialogInputChange(e, "valueQuery")}
                            //name= {"valueQuery"}
                            />
                        </div>
                        <div className="col">
                            <Button className="mt-4" onClick={this.openEditor_Click}>
                                Open Editor
                            </Button>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <Checkbox
                                label=" Is Stores Procedure"
                                name="isStoredProc"
                                value={this.state.objChannel.isStoredProc}
                                //onChange={this.onDialogInputChange}
                                onChange={(e) => this.onDialogInputChange(e, "isStoredProc")}
                            >

                            </Checkbox>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-8">
                            <label>Paramerters</label>
                            <Editor
                                contentStyle={{ height: 150 }}
                                defaultContent={this.state.objChannel.StoredProcParams}
                                value={this.state.objChannel.StoredProcParams}
                                onChange={(e) => this.onDialogInputChange(e, "StoredProcParams")}

                            />
                        </div>
                    </div>

                    <div className="row mt-2 lg-12">
                        <div className="col">
                            <span className="float-right">


                                <Button className="k-button k-primary" onClick={this.save}>
                                    Save
                                </Button>

                                <Button onClick={this.__parentRef.cancelChannelInEdit} className="mr-2">
                                    Cancel
                                </Button>
                            </span>

                        </div>
                    </div>

                </Dialog>

                {(this.state.showExpressionEditor) &&
                    <Dialog
                        height={500}
                        width={600}
                    >
                        <ExpressionEditor {...this} objTimeLog={this.__parentRef.state.objTimeLog} expressionText={this.state.objChannel.valueQuery}></ExpressionEditor>

                    </Dialog>}


            </>
        )
    }
}


