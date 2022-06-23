import { Button, Dialog, Input, Label } from '@progress/kendo-react-all';
import { Grid, GridColumn as Column, } from '@progress/kendo-react-grid'
import React, { Component } from 'react'

interface IProps {
    AlarmExpList: any[]
}
export default class AlarmExpression extends Component<IProps> {
    state = {
        AlarmExpList: this.props.AlarmExpList,
        selectedAlarmExpID: "",
        showAlarmExpSubWizard: false
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
                await this.setState({ AlarmExpList: data });
            }


        } catch (error) {

        }
    }

    onCancel = () => {

    }


    onNext = () => {

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
                        height={500}
                        width={600}
                    >
                        <div>
                            <div className="form-group">
                                <Label>Enter the paramer values and click on 'Finish' button to create expression</Label>
                                <Input value="Max. Allowed Overlape(%)  - Red Alarm" disabled={true}> </Input>
                                <Input value="" > </Input>


                            </div>
                        </div>

                    </Dialog>
                }
            </div>
        )
    }
}
