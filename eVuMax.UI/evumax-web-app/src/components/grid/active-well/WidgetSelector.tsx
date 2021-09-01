import React from "react";
import ReactDOM from "react-dom";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { filterBy } from "@progress/kendo-data-query";
import { Window } from "@progress/kendo-react-dialogs";
import history from "../../../history/history";
import GlobalMod from "../../../objects/global";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import axios from "axios";
import * as utilFunc from "../../../utilFunctions/utilFunctions"; //Nishant 07-10-2020
import { util } from "typescript-collections";
import WidgetSelection from "../../dashboard/WidgetSelection";
import { ListView } from "@progress/kendo-react-listview";

let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

const WidgetList = utilFunc.getWidgetList();

interface IProps { }

interface IState {
  currentWellID: string;
  showOpenInterfaceDialog: boolean;
}

export default class WidgetSelector extends React.Component<IProps> {
  constructor(parentRef, props: any) {
    super(props);
    this.__parentRef = parentRef;
    this.currentWellID = parentRef.state.currentWellID;
    clearInterval(parentRef.intervalID);
  }

  __parentRef: any;
  currentWellID: string = "";

  state = {
    value: [],
    data: WidgetList,
    addToFav: false,
    userFav: [] as any,
  };

  //Nishant 24/08/2021
  loadUserFav = () => {
    try {
      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Well.Data.Objects";
      objBrokerRequest.Function = "getUserFav";
      objBrokerRequest.Broker = "ActiveWellProfile";

      objParameter = new BrokerParameter("UserName", _gMod._userId);

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
          let userFav: any = utilFunc.parseJSON(res.data.Response);
          if (userFav != undefined || userFav != "") {
            for (let index = 0; index < WidgetList.length; index++) {
              const element = WidgetList[index];
              let i = userFav.findIndex((x) => x.Id === element.id);
              if (i < 0) {
                //not found
                WidgetList[index].isFav = false;
              } else {
                WidgetList[index].isFav = true;
              }
            }
          }

          this.setState({
            data: WidgetList,
          });
        })
        .catch(function (error) { });
    } catch (error) { }
  };

  componentDidMount() {
    try {
      if (WidgetList.length > 0) {
        this.setState({
          value: WidgetList[0],
        });
        this.loadUserFav();
      }
    } catch (error) { }
  }

  itemRender = (li, itemProps) => {
    const itemChildren = (
      <span>
        <input type="checkbox" checked={itemProps.selected} readOnly />{" "}
        {li.props.children}
      </span>
    );

    if (this.state.addToFav) {
      return React.cloneElement(li, li.props, itemChildren);
    } else {
      return React.cloneElement(li, li.props);
    }
  };

  filterChange = (event) => {
    this.setState({
      data: filterBy(WidgetList.slice(), event.filter),
    });
  };

  onChange = (event) => {
    if (event.value.length == 0) {
      this.setState({
        value: "",
      });
      return;
    }

    this.setState({
      value: [...event.target.value],
    });

    let interfaceID = event.target.value[0].id;

    this.setState({ OpenInterfaceID: interfaceID });

    //Launch Interface only if AddtoFav checkbox is not checked

    if (this.state.addToFav) {
      //do not launch program...
      return;
    }

    utilFunc.launchWidget(interfaceID, this.currentWellID);
    // if (interfaceID === "DrlgSummary") {
    //     history.push("DrillingSummary/" + this.currentWellID);
    // }
    // if (interfaceID === "DrlgConnSummary") {
    //     history.push("DrlgConnSummary/" + this.currentWellID);
    // }

    // if (interfaceID === "DrlgConnSummary2") {
    //     history.push("DrlgConnSummary2/" + this.currentWellID);
    // }

    // if (interfaceID === "TripConnSummary") {
    //     history.push("TripConnSummary/" + this.currentWellID);
    // }

    // if (interfaceID === "ToolfaceSummary") {
    //     history.push("ToolfaceSummary/" + this.currentWellID);
    // }

    this.__parentRef.CloseOpenInterfaceDialog();
  };

  OpenWidget = (props) => {
    utilFunc.launchWidget(props.id, this.currentWellID);
  };
  AddtoFavourite = (props) => {

    try {
      //values are stored in this.state.value as array

      let favList: string = props.id;
      // for (let index = 0; index < this.state.value.length; index++) {
      //   const objItem = this.state.value[index];
      //   favList += objItem.id + "~";
      // }

      let FunctionName = "";
      if (props.isFav == true) {
        FunctionName = "removeUserFav";
      } else {
        FunctionName = "updateUserFav";
      }

      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Well.Data.Objects";
      objBrokerRequest.Function = FunctionName; // "updateUserFav";
      objBrokerRequest.Broker = "ActiveWellProfile";

      objParameter = new BrokerParameter("UserName", _gMod._userId);

      objBrokerRequest.Parameters.push(objParameter);
      objParameter = new BrokerParameter("favList", favList);
      objBrokerRequest.Parameters.push(objParameter);

      axios
        .post(_gMod._performTask, {
          paramRequest: JSON.stringify(objBrokerRequest),
        })
        .then((response) => {
          //this.__parentRef.CloseOpenInterfaceDialog(true);

          let i = WidgetList.findIndex((x) => x.id === props.id);
          if (i < 0) {
            //not found do nothing
          } else {
            if (FunctionName === "removeUserFav") {
              WidgetList[i].isFav = false;
            } else {
              WidgetList[i].isFav = true;
            }
          }

          this.setState({
            data: WidgetList,
          });
        })
        .catch(function (error) { });
    } catch (error) { }
  };
  onAddToFavoritesCheckbox = (e) => {
    try {
      console.log(e.target.checked);
      this.setState({
        addToFav: e.target.checked,
      });
    } catch (error) { }
  };

  MyItemRender = (props) => {
    let item = props.dataItem;
    console.log("item", item);
    return (
      <div className="row p-2 border-bottom align-middle" style={{ margin: 0 }}>
        <div className="col-6" style={{ paddingTop: 6 }}>
          <a
            {...item}
            onClick={(e) => this.OpenWidget(item)}
            style={{
              fontSize: 14,
              color: "#454545",
              marginBottom: 0,
              cursor: "pointer",
            }}
            className="text-capitalize text-theme"
          >
            {item.name}
          </a>
        </div>

        <div className="col-2">
          <div
            {...item}
            onClick={(e) => this.OpenWidget(item)}
            className="k-chip k-chip-filled"
          >
            <div className="k-chip-content">Open</div>
          </div>
        </div>

        <div className="col-3">
          <div
            {...item}
            style={{ cursor: "pointer" }}
            onClick={(e) => this.AddtoFavourite(item)}
            className="k-chip k-chip-filled"
          >
            {item.isFav == true ? (
              <div className="k-chip-content">Remove from favourite</div>
            ) : (
              <div className="k-chip-content">Add to favourite</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  SaveFavorites = (e) => {
    try {
      //values are stored in this.state.value as array

      let favList: string = "";
      for (let index = 0; index < this.state.value.length; index++) {
        const objItem = this.state.value[index];
        favList += objItem.id + "~";
      }

      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Well.Data.Objects";
      objBrokerRequest.Function = "updateUserFav";
      objBrokerRequest.Broker = "ActiveWellProfile";

      objParameter = new BrokerParameter("UserName", _gMod._userId);

      objBrokerRequest.Parameters.push(objParameter);
      objParameter = new BrokerParameter("favList", favList);
      objBrokerRequest.Parameters.push(objParameter);

      axios
        .post(_gMod._performTask, {
          paramRequest: JSON.stringify(objBrokerRequest),
        })
        .then((response) => {
          this.__parentRef.CloseOpenInterfaceDialog(true);
        })
        .catch(function (error) { });
    } catch (error) { }
  };

  render() {
    // const value = this.state.value;
    // const selected = value.length;
    return (
      <Window
        title={"Select Interface To Open"}
        //onClose={() => this.setState({ showOpenInterfaceDialog: false })}
        onClose={() => this.__parentRef.CloseOpenInterfaceDialog()} // this.setState({ showOpenInterfaceDialog: false })}
        // width = {'80vw'}
        // height = {300}
        style={{ width: "690px", height: "590px" }}
        resizable={false}
        modal={true}
        minimizeButton={() => null}
        maximizeButton={() => null}
        initialTop={100}
        initialLeft={600}
      >
        <div style={{ padding: 20 }}>
          {
            <ListView
              data={this.state.data}
              item={this.MyItemRender}
              style={{ width: "100%" }}
            />
          }
        </div>
      </Window>
    );
  }
}

// ReactDOM.render(<AppComponent />, document.querySelector("my-app"));
