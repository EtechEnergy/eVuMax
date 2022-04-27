import { Button, DropDownList, Grid, GridColumn, Label } from '@progress/kendo-react-all';
import { Input } from '@progress/kendo-react-inputs'
import React, { Component } from 'react'
import { comboData } from '../../../../../eVuMaxObjects/UIObjects/comboData';
import * as utilFunc from '../../../../../utilFunctions/utilFunctions';

interface IProps {
    objQCRule: any;
}

export default class QCRuleDialog extends Component<IProps> {

    state = {
        objQCRule: this.props.objQCRule,
        cboRuleTypeList: [] as any,
        selectedRuleType: new comboData(),
        channelList: [{ "Channel": "Test Channel-1" }, { "Channel": "Test Channel-2" }, { "Channel": "Test Channel-3" }] as any

    }

    OkClick = () => {
        try {

        } catch (error) {

        }
    }

    CancelClick = () => {
        try {

        } catch (error) {

        }
    }

    AddChannelClick = () => {
        try {

        } catch (error) {

        }
    }

    RemoveChannelClick = () => {
        try {

        } catch (error) {

        }
    }
    handleChange = (e: any, field: string) => {
        try {
            const value = e.value;
            const name = field;

            let edited: any = utilFunc.CopyObject(this.state.objQCRule);
            edited[field] = value;
            this.setState({
                objQCRule: edited
            });

        } catch (error) {

        }
    }
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">
                        <Label className="mr-2 mt-3 float-left">Rule Name</Label>
                        <Input
                            name="RuleName"
                            label="Rule Name"
                            value={this.state.objQCRule.RuleName}
                            onChange={(e) => this.handleChange(e, "RuleName")}
                        />


                        {/* <Label className="float-left">Rule Type</Label> */}
                        <DropDownList
                            name="selectRuleTypeList"
                            label=''
                            data={this.state.cboRuleTypeList}
                            textField="text"
                            dataItemKey="id"
                            value={this.state.selectedRuleType}
                            style={{ width: 200 }}
                        // onChange={(event) => {
                        //     this.handleChangeDropDown(event, "selectedMainWell", "FilterMainWellID");

                        // }}
                        />

                    </div>


                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                        <span className="btn-group-vertical">
                            <Button style={{ width: '90px' }} className="mt-3 k-button k-primary mr-4" onClick={
                                this.OkClick
                            }>
                                Ok
                            </Button>
                            <Button style={{ width: '90px' }} className="mt-3 k-button k-primary mr-4" onClick={this.CancelClick}>
                                Cancel
                            </Button>

                        </span>
                    </div>

                </div>

                <div className="row">
                    <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10">

                        <h6>Channel List</h6>
                        <Grid style={{ height: "400px" }} data={this.state.channelList}>
                            <GridColumn field="Channel" />
                        </Grid>
                    </div>

                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2">
                        <span className="btn-group-vertical">
                            <Button style={{ width: '130px' }} className="mt-3 k-button k-primary mr-4" onClick={
                                this.AddChannelClick
                            }>
                                Add Channel
                            </Button>
                            <Button style={{ width: '130px' }} className="mt-3 k-button k-primary mr-4" onClick={this.RemoveChannelClick}>
                                Remove Channel
                            </Button>

                        </span>

                    </div>
                </div>
            </div>
        )
    }
}
