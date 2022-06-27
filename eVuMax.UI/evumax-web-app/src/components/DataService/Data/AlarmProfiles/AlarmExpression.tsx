import { Button, Dialog, Input, Label } from '@progress/kendo-react-all';
import { Grid, GridColumn as Column, } from '@progress/kendo-react-grid'
import React, { Component } from 'react'
import $ from "jquery";

interface IProps {
    AlarmExpList: any[]
}
export default class AlarmExpression extends Component<IProps> {
    state = {
        AlarmExpList: this.props.AlarmExpList,
        selectedAlarmExpID: "",
        showAlarmExpSubWizard: false,
        dynamicDiv_: ""
    }

    componentDidMount(): void {
        try {
            debugger;
        } catch (error) {

        }
    }

    grdRowClick = (e: any, gridName: string) => {
        try {
            debugger;
            if (gridName == 'AlarmExp') {
                let index = this.state.AlarmExpList.findIndex((item: any) => item["ExpressionID"] === e.dataItem.ExpressionID);
                this.setState({
                    selectedAlarmExpID: e.dataItem.ExpressionID
                });
            }


        } catch (error) {

        }
    }


    selectionChange = async (event, gridName: string) => {
        try {

            debugger;


            const checked = event.syntheticEvent.target.checked;

            if (gridName == "AlarmExp") {
                const data = this.state.AlarmExpList.map((item: any) => {
                    if (item["ExpressionID"] === event.dataItem.ExpressionID) {
                        item["selected"] = checked;
                    }
                    return item;
                });
                debugger;
                await this.setState({ AlarmExpList: data });
            }


        } catch (error) {

        }
    }

    onCancel = () => {

    }


    onNext = async () => {


        // Caption: "Circulation Variation Limit"
        // Note: ""
        // VariableID: "CIRCVARIATION"

        let dynamicDiv__ = "<div>";
        debugger;
        this.state.AlarmExpList.forEach((element: any) => {

            if (element.ExpressionID == this.state.selectedAlarmExpID) {
                let subElement = Object.values(element.inputVariables);
                subElement.forEach((element1: any) => {
                    dynamicDiv__ += "<div className='form-group'> <label>" + element1.Caption + "</label>    ";
                    dynamicDiv__ += "<Input id='cust1' type='textbox' value=''></Input>  ";
                    dynamicDiv__ += "</div>";
                });
            }
        });

        dynamicDiv__ += "</div>"


        await this.setState({ dynamicDiv_: dynamicDiv__, showAlarmExpSubWizard: true });
        await $("#dynamicDiv").html(this.state.dynamicDiv_);

        //this.forceUpdate();

    }
    render() {
        return (
            <div>
                <Label>Select Alarm Type from the List and click Next</Label>
                <Grid
                    className='mt-3'
                    data={this.state.AlarmExpList}
                    onRowClick={(e) => { this.grdRowClick(e, "AlarmExp") }}
                    onSelectionChange={(e) => { this.selectionChange(e, "RigStatesList") }}
                    editField="inEdit"
                    selectedField="selected"
                    style={{ height: "200px", width: "600px" }}
                //                    onHeaderSelectionChange={(e) => { this.grid_headerSelectionChange(e, "RigStatesList") }} //Nishant 26-05-2020
                >


                    <Column
                        field='Name'
                    >

                    </Column>


                </Grid>

                <div>
                    <Button className='mt-3 mr-3' style={{ width: "150px" }} onClick={this.onCancel}> Cancel</Button>
                    <Button className='mt-3' style={{ width: "150px" }} onClick={this.onNext}> Next</Button>
                </div>

                {this.state.showAlarmExpSubWizard &&
                    <Dialog
                        title={"Alarm Expression Wizard"}
                        onClose={() =>
                            this.setState({ showAlarmExpSubWizard: false })
                        }
                        height={800}
                        width={800}
                    >
                        <div>
                            <div>
                                {/* <Label>Enter the paramer values and click on 'Finish' button to create expression</Label>
                                <Input value="Max. Allowed Overlape(%)  - Red Alarm" disabled={true}> </Input>
                                <Input value="" > </Input> */}
                                PRATH
                                <div id="dynamicDiv"></div>

                            </div>
                        </div>

                    </Dialog>
                }
            </div>
        )
    }
}
