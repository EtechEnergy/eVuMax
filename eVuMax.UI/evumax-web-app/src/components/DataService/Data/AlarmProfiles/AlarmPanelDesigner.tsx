import { Button, DropDownList, Grid, GridColumn as Column, Label } from '@progress/kendo-react-all'
import { Checkbox, Input, RadioButton } from '@progress/kendo-react-inputs'
import React, { Component } from 'react'
import { APChannel } from './APChannel';

export default class AlarmPanelDesigner extends Component {

  state = {
    objChannel: new APChannel(),
    ChannelList: [],
    AlarmCategoryList: [],
    chkStdChannelList: false,
    AlarmTypeList: [],
    AlarmCategory2List: [],
    AlarmShapeList: [],
    RigstateList: [],
    WellStatusList: [],
    cmbDownSampleFunction: []

  }
  componentDidMount = () => {

  }

  handleChange = (e, field: string) => {
    try {

    } catch (error) {

    }

  }

  onClickWizard = () => {
    try {

    } catch (error) {

    }
  }

  onDropdownChange = (e: any, field: string) => {
    try {

      if (field == "cmbAlarmCategory") {

        this.setState({
          cmbAlarmCategory: e.value
        });
        return;
      }


      if (field == "cmbChannel") {

        this.setState({
          cmbChannel: e.value
        });
        return;
      }

      if (field == "cmbAlarmType") {

        this.setState({
          cmbChannel: e.value
        });
        return;
      }

      if (field == "cmbAlarmCategory") {

        this.setState({
          cmbAlarmCategory: e.value
        });
        return;
      }

      if (field == "cmbShape") {

        this.setState({
          cmbShape: e.value
        });
        return;
      }

      if (field == "DownsampleFunction") {

        this.setState({
          DownsampleFunction: e.value
        });
        return;
      }


      return;



    } catch (error) {

    }
  }

  render() {
    return (
      <div className='mt-3'>
        <div className="row">
          <div className='col-lg-6 col-xl-6 col-md-6 col-sm-6'>
            <div className="form-group">
              <Label>Source</Label>
              <RadioButton
                value="0"
                checked={this.state.objChannel.SourceType === 0}
                label="Time Log"
              >
              </RadioButton>

              <RadioButton
                value="1"
                checked={this.state.objChannel.SourceType === 1}
                label="Depth Log"
              >
              </RadioButton>

              <RadioButton
                value="2"
                checked={this.state.objChannel.SourceType === 2}
                label="Trajectory"
              >
              </RadioButton>
            </div>

            <div className="form-group">
              <Label>Channel</Label>
              <DropDownList
                name="cmbChannel"
                textField="text"
                dataItemKey="id"
                data={this.state.ChannelList}
                value={this.state.objChannel.Mnemonic}
                onChange={(e) => this.onDropdownChange(e, "cmbChannel")}
              >
              </DropDownList>

              <Checkbox
                className="ml-2"
                label={"Standard List"}
                value={this.state.chkStdChannelList}
                onChange={(e) => this.handleChange(e, "chkStdChannelList")}
              >

              </Checkbox>
            </div>

            <div className="form-group">
              <Label>Name</Label>
              <Input
                name="ChannelName"
                value={this.state.objChannel.ChannelName}
              >
              </Input>
            </div>


            <div className="form-group">
              <Label>Category</Label>
              <DropDownList
                name="cmbAlarmCategory"
                style={{ width: "20vw" }}
                className="form-control"
                textField="text"
                dataItemKey="id"
                data={this.state.AlarmCategoryList}
                onChange={(e) => this.onDropdownChange(e, "cmbAlarmCategory")}
                value={this.state.objChannel.AlarmCategory}
              >
              </DropDownList>
            </div>

            <div className="form-group">
              <Label>Alarm Type</Label>
              <DropDownList
                name="cmbAlarmType"
                style={{ width: "20vw" }}
                className="form-control"
                textField="text"
                dataItemKey="id"
                data={this.state.AlarmTypeList}
                onChange={(e) => this.onDropdownChange(e, "cmbAlarmType")}
                value={this.state.objChannel.AlarmType}
              >
              </DropDownList>
            </div>

            <div className="form-group">
              <Label>Alarm Category</Label>
              <DropDownList
                name="cmbAlarmCategory2"
                style={{ width: "20vw" }}
                className="form-control"
                textField="text"
                dataItemKey="id"
                data={this.state.AlarmCategory2List}
                onChange={(e) => this.onDropdownChange(e, "cmbAlarmCategory2")}
                value={this.state.objChannel.AlarmCategory2ID}
              >
              </DropDownList>
            </div>

            <div className="form-group mt-3 mb-3">
              <Label>Yellow Expression</Label>

              <RadioButton
                checked={this.state.objChannel.YellowUseBuilder === false}
                label="Directly enter Expression"
              >
              </RadioButton>


              <RadioButton
                checked={this.state.objChannel.YellowUseBuilder}
                label="Use Conditional Builder"
              >
              </RadioButton>
              <Button id="cmdWizard" onClick={this.onClickWizard} className='ml-3'>Run Expression Wizard </Button>
            </div>


            <div className="form-group  mt-3 mb-3">
              <Button>Click to Open Container Builder</Button>
              <Button className='ml-3'>
                Open Editor
              </Button>
            </div>

            <div className="form-group  mt-3 mb-3">
              <Label>Red Expression</Label>

              <RadioButton
                checked={this.state.objChannel.RedUseBuilder === false}
                label="Directly enter Expression"
              >
              </RadioButton>


              <RadioButton
                checked={this.state.objChannel.RedUseBuilder}
                label="Use Conditional Builder"
              >
              </RadioButton>
              <Button id="cmdWizard" onClick={this.onClickWizard} className='ml-3'>Run Expression Wizard </Button>
            </div>


            <div className="form-group  mt-3 mb-3">
              <Button>Click to Open Container Builder</Button>
              <Button className='ml-3'>
                Open Editor
              </Button>
            </div>

            <div className="form-group">
              <Label>
                Shape
              </Label>
              <DropDownList
                name="cmbShape"
                style={{ width: "200px" }}
                className="form-control"
                textField="text"
                dataItemKey="id"
                data={this.state.AlarmShapeList}
                onChange={(e) => this.onDropdownChange(e, "cmbShape")}
                value={this.state.objChannel.AlarmShape}
              >

              </DropDownList>

              <Label>
                Shape Color
              </Label>
              <Input value={this.state.objChannel.ShapeColor} className="ml-3" style={{ width: "100px" }}></Input>
            </div>

            <div className="form-group">
              <Label>
                Shape Size
              </Label>
              <Input value={this.state.objChannel.ShapeSize} className="ml-3" style={{ width: "100px" }}></Input>
            </div>

            <div className="form-group">
              <Checkbox
                name="AcknRequire"
                checked={this.state.objChannel.AckRequired}
                label={"Acknowledgement Require"}
                onChange={(e) => { this.handleChange(e, "AcknRequire") }}
              >
              </Checkbox>

              <Checkbox
                name="PlaySound"
                checked={this.state.objChannel.PlaySound}
                label={"Play sound when this alarm is triggered"}
                onChange={(e) => { this.handleChange(e, "PlaySound") }}
                className="ml-3"
              >
              </Checkbox>

            </div>


          </div>

          <div className='col-lg-6 col-xl-6 col-md-6 col-sm-6'>
            <div className="form-group">

              <h4>
                Rig State Selection
              </h4>
              <Checkbox
                checked={this.state.objChannel.RigStateSelection}
                onClick={(e) => this.handleChange(e, "RigStateSelection")}
                label={"Only evaluate for selected rig states"}
              ></Checkbox>

            </div>

            <div className="form-group">
              <div className="row">
                <div className="col-12">
                  <Grid
                    data={this.state.RigstateList}
                  >
                    <Column
                      field='selected'
                    >

                    </Column>

                    <Column
                      field='RigState'
                    >

                    </Column>


                  </Grid>
                </div>
              </div>


            </div>






            <div className="form-group">

              <h4>
                Well Status Selection
              </h4>
              <Checkbox
                checked={this.state.objChannel.WellStatusSpecific}
                onClick={(e) => this.handleChange(e, "WellStatusSpecific")}
                label={"Only evaluate for selected well status"}
              ></Checkbox>

            </div>

            <div className="form-group">
              <div className="row">
                <div className="col-12">
                  <Grid
                    data={this.state.WellStatusList}
                  >
                    <Column
                      field='selected'
                    >

                    </Column>

                    <Column
                      field='RigState'
                    >

                    </Column>


                  </Grid>
                </div>
              </div>


            </div>


            <div className="form-group">
              <Label>Trigger Based on</Label>

              <RadioButton
                value="0"
                checked={this.state.objChannel.TriggerType === 0}
                onChange={(e) => this.handleChange(e, "TriggerType")}
                label={"Current Data"}
              >

              </RadioButton>

              <RadioButton
                value="0"
                checked={this.state.objChannel.TriggerType === 1}
                onChange={(e) => this.handleChange(e, "TriggerType")}
                label={"Data of Last "}
              >
              </RadioButton>
              <Input value={this.state.objChannel.TimeDuration}
                style={{ width: "100px" }}
                onChange={(e) => this.handleChange(e, "TriggerType")}
              ></Input>
              <Label> Minutes</Label>
            </div>


            <div className="form-group">
              <Label> Down Sample Function </Label>
              <DropDownList
                id="DownsampleFunction"
                data={this.state.cmbDownSampleFunction}
                value={this.state.objChannel.DownSampleFunction}
                textField="text"
                dataItemKey="id"
                onChange={(e) => { this.onDropdownChange(e, "DownsampleFunction") }}
              >

              </DropDownList>
            </div>

            <div className="form-group">
              <Label className='mr-3'>Alarm Frequency</Label>
              <Input value={this.state.objChannel.Frequency} onChange={(e) => this.handleChange(e, "Frequency")} ></Input>
              <Label className='ml-3'> Minutes</Label>
            </div>

            <div className="form-group">
              <Checkbox
                label={"Send email to "}
                checked={this.state.objChannel.SendMail}
                onChange={(e) => { this.onDropdownChange(e, "SendMail") }}
              >
              </Checkbox>

              <Label className='mr-3'>If Alarm is not validated in </Label>
              <Input className='mr-3' value={this.state.objChannel.AckTimeLimit} onChange={(e) => this.handleChange(e, "AckTimeLimit")}></Input>
              <Label>Minutes </Label>


            </div>


          </div>
        </div>


      </div>
    )
  }
}
