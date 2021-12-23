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
import { json } from 'd3';
import { debug } from 'console';


let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

let _gMod = new GlobalMod();

interface IProps {
    dataItem: any
    save: any
    cancel: any
    unitList: any
}

export default class DepthLogChannelInLineEditor extends Component<IProps> {
    constructor(props: any) {
        super(props);
        console.log(this.props.dataItem);

    }

    state = ({
        objChannel: JSON.parse(JSON.stringify(this.props.dataItem)),
        editMode: (this.props.dataItem.mnemonic == "") ? "A" : "",
        VuMaxUnitID: new comboData(),
    });

    setComboData = (VuMaxUnitID: string) => {

        this.props.unitList.forEach((objItem: comboData) => {
            if (objItem.id == VuMaxUnitID) {
                this.setState({
                    VuMaxUnitID: objItem
                });
            }
        });

    }

    componentDidMount() {
        this.setComboData(this.props.dataItem.VuMaxUnitID);
    }


    onDialogInputChange = (event: any, field: string) => {

        // let target = event.target;
        // let value = target.type === 'checkbox' ? target.checked : target.value;
        // let name = target.props ? target.props.name : target.name;
        let value = event.value;
        const edited = this.state.objChannel;
        if (field == "VuMaxUnitID") {
            this.setState({
                VuMaxUnitID: value
            });
            value = value.id; //to update only id in case of VuMaxUnitID
        }
        if (field == "valueQuery") {
            value = value.content.content[0].content.content[0].text;
        }

        if (field == 'StoredProcParams') {
            value = value.content.content[0].content.content[0].text;
        }

        edited[field] = value;

        this.setState({
            objChannel: edited
        });

    }
    save = () => {
        this.props.save(this.state.objChannel, this.state.editMode);
        return;
    }

    render() {
        console.log(this.props.unitList);
        return (
            <>



                <Dialog title={"Channel Properties"}
                    onClose={(e: any) => {
                        this.props.cancel();
                    }}
                    width={800}
                >

                    <div >
                        <label>
                            <br />
                            <Input
                                name="mnemonic"
                                label="Mnemonic"
                                pattern={"[A-Za-z]+"}
                                minLength={2}
                                required={true}
                                value={this.state.objChannel.mnemonic}
                                disabled={this.props.dataItem.mnemonic == "" ? false : true}
                                onChange={(e) => this.onDialogInputChange(e, "mnemonic")}
                            />
                        </label>
                    </div>

                    <div >
                        <label>
                            <br />
                            <Input
                                name="curveDescription"
                                label="Description"
                                pattern={"[A-Za-z]+"}
                                minLength={2}
                                required={true}
                                value={this.state.objChannel.curveDescription}
                                onChange={(e) => this.onDialogInputChange(e, "curveDescription")}
                            />
                        </label>
                    </div>
                    <div >
                        <label>
                            Unit<br />
                            <DropDownList
                                name="VuMaxUnitID"
                                data={this.props.unitList}
                                value={this.state.VuMaxUnitID}
                                textField="text"
                                dataItemKey="id"
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
                                    label="Column Order"
                                    value={this.state.objChannel.ColumnOrder}
                                    onChange={(e) => this.onDialogInputChange(e, "ColumnOrder")}
                                />
                            </div>

                            <div className="col">
                                <NumericTextBox
                                    min={0}
                                    name="sensorOffset"
                                    label="Sensor Offset"
                                    value={isNaN(parseInt(this.state.objChannel.sensorOffset)) ? 0 : parseInt(this.state.objChannel.sensorOffset)}
                                    //value={parseInt(this.state.objChannel.sensorOffset)}
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
                            />
                        </div>
                        <div className="col">
                            <Button className="mt-4">
                                Open Editor
                            </Button>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <Checkbox
                                label=" Is Stores Procedure"
                                name="doNotCalcHoleDepth"
                                value={this.state.objChannel.DontCalcHoleDepth}
                                onChange={(e) => this.onDialogInputChange(e, "DontCalcHoleDepth")}
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
                                <Button onClick={this.props.cancel} className="mr-2">
                                    Cancel
                                </Button>

                                <Button className="k-button k-primary" onClick={this.save}>
                                    Save
                                </Button>
                            </span>

                        </div>
                    </div>

                </Dialog>
            </>
        )
    }
}


