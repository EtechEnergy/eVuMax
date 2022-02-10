import React, { PureComponent } from "react";
import { Window, DropDownList, Button } from "@progress/kendo-react-all";

import { comboData } from "../../eVuMaxObjects/UIObjects/comboData";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import GlobalMod from "../../objects/global";
import axios from "axios";

let _gMod = new GlobalMod();

enum enumLogType {
  // LOG_TYPE=1 THEN 'Time Log' WHEN LOG_TYPE=2 THEN 'Depth Log'

  All = 0,
  TimeLog = 1,
  DepthLog = 2,
}

export interface IProps {
  LogType: enumLogType;
  // addSTDChannels: any | undefined;
  // cancelSTDChannels: any;
  STDChannelsEvents: any | undefined;

}
class STDChannels extends PureComponent<IProps>{
  constructor(props: any) {
    super(props);
  }

  state = {
    lstChannels: [new comboData("***DELTA***", "DELTA")],
    selectedChannel: new comboData("", "")
  };

  componentWillUpdate() {
    _gMod = new GlobalMod();
    if (_gMod._userId == "" || _gMod._userId == undefined) {
      window.location.href = "/evumaxapp/";
      return;
    }

  }
  componentDidMount() {

    this.loadSTDChannels();
  }

  loadSTDChannels = () => {
    try {

      let objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Common";
      objBrokerRequest.Broker = "Common.Functions";
      objBrokerRequest.Function = "getTable";

      let paramuserid: BrokerParameter = new BrokerParameter("UserId", _gMod._userId);
      objBrokerRequest.Parameters.push(paramuserid);

      let SQL = "";
      if (this.props.LogType == enumLogType.All) {

        SQL = "SELECT MNEMONIC,CURVE_NAME,DATA_TYPE,LOG_TYPE,CURVE_ID,(CASE WHEN LOG_TYPE=1 THEN 'Time Log' WHEN LOG_TYPE=2 THEN 'Depth Log' END) AS LOG FROM VMX_CURVE_DICTIONARY WHERE USER_VISIBLE=1 ORDER BY LOG_TYPE,MNEMONIC"

      } else {

        SQL = "SELECT MNEMONIC,CURVE_NAME,DATA_TYPE,LOG_TYPE,CURVE_ID FROM VMX_CURVE_DICTIONARY WHERE USER_VISIBLE=1 AND LOG_TYPE = " + this.props.LogType + " ORDER BY LOG_TYPE,MNEMONIC"

      }


      let paramSQL: BrokerParameter = new BrokerParameter(
        "SQL",
        SQL
      );
      objBrokerRequest.Parameters.push(paramSQL);


      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {



          let objData = JSON.parse(res.data.Response);
          if (objData != null) {

            let channelList: comboData[] = [new comboData("***DELTA****", "DELTA")];
            // let channelList: comboData[] = [];
            // channelList.push(new comboData("DELTA", ""))
            for (let index = 0; index < objData.length; index++) {
              //MNEMONIC,CURVE_NAME
              const objRow = objData[index];
              let objComboData = new comboData(objRow.CURVE_NAME, objRow.MNEMONIC);
              channelList.push(objComboData);
            }

            this.setState({
              lstChannels: channelList
            });
            //this.forceUpdate();




          }
          // this.setData();
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
          console.log("rejected");
          this.setState({ isProcess: false });
        });
    } catch (error) { }
  };

  Ok_Click = () => {
    try {
      this.props.STDChannelsEvents(this.state.selectedChannel, false);
    } catch (error) {

    }
  }

  Cancel_Click = () => {
    try {
      this.props.STDChannelsEvents(this.state.selectedChannel, true);
    } catch (error) {

    }
  }



  onChange = (event: any, field: string) => {


    let value = event.value;

    this.setState({
      selectedChannel: value
    });
    //this.forceUpdate();

  }

  render() {
    return (
      <>
        <Window
          modal={true}
          minimizeButton={() => null}
          maximizeButton={() => null}
          restoreButton={() => null}
          closeButton={() => null}
          title={"Additional Channels"}
          initialHeight={400}
          width={400}
        >
          <form className="p-5">
            <div className="form-group row">
              <div>
                <DropDownList
                  label="Select the channel from the list"
                  style={{ width: 300 }}
                  value={this.state.selectedChannel}
                  data={this.state.lstChannels}
                  textField="text"
                  dataItemKey="id"
                  // onChange={this.onDialogInputChange}
                  onChange={(e) => this.onChange(e, "selectedChannel")}
                />
              </div>
            </div>
            <div className="form-group row float-right">
              <div className="">
                <Button onClick={this.Ok_Click} >Ok</Button>
                <Button onClick={this.Cancel_Click} className="ml-2">Cancel</Button>
              </div>
            </div>
          </form>
        </Window>

      </>
    );
  }
}

export default STDChannels;
