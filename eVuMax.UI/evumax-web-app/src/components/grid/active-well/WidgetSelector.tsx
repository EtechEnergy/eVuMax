import React from "react";

import { filterBy } from "@progress/kendo-data-query";
import { Window } from "@progress/kendo-react-dialogs";

import GlobalMod from "../../../objects/global";
import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import axios from "axios";
import * as utilFunc from "../../../utilFunctions/utilFunctions"; //Nishant 07-10-2020

import { ListView } from "@progress/kendo-react-listview";

let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

const WidgetList = utilFunc.getWidgetList();

interface IProps {

}

interface IState {
  currentWellID: string;
  showOpenInterfaceDialog: boolean;
}

export default class WidgetSelector extends React.Component<IProps> {
  constructor(parentRef) {
    super(parentRef);
    this.__parentRef = parentRef;
    this.currentWellID = parentRef.state.currentWellID;
    this.currentWellName = parentRef.state.currentWellName; //Nishant
    this.openAsEditor = parentRef.state.showOpenInterfaceDialogAsEditor;
    clearInterval(parentRef.intervalID);
  }

  __parentRef: any;
  currentWellID: string = "";
  openAsEditor: boolean = false;
  currentWellName: string = "";

  state = {
    value: [],
    data: [],
    addToFav: false,
    userFav: [] as any,
    title: "Favourite Interface :"
  };

  //Nishant 24/08/2021
  loadUserFav = () => {
    try {

      _gMod = new GlobalMod();

      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Well.Data.Objects";
      objBrokerRequest.Function = "getUserFav";
      objBrokerRequest.Broker = "ActiveWellProfile";

      objParameter = new BrokerParameter("UserName", _gMod._userId);
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("WellID", this.currentWellID);
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

          let newWidgetList = [];
          if (userFav == false && this.openAsEditor == false) {

            newWidgetList.push({ id: "None", name: "No Favorites available", isFav: false },)
            this.setState({
              data: newWidgetList
            })
          }

          if (userFav == false && this.openAsEditor == true) {
            userFav = WidgetList;
          }


          if (userFav != undefined || userFav != "") {
            
            for (let index = 0; index < WidgetList.length; index++) {

              const element = WidgetList[index];
              let i = userFav.findIndex((x) => x.Id === element.id);
              if (i < 0) {
                //not found
                WidgetList[index].isFav = false;
              } else {
                WidgetList[index].isFav = true;
                newWidgetList.push(WidgetList[index]);
              }

            }
          }

          if (this.openAsEditor) {
            newWidgetList = WidgetList;
          }


          this.setState({
            data: newWidgetList
          })

          if (this.openAsEditor) {
            this.setState({
              title: "Favorite Interface Editor :"
            })
          }

        })
        .catch(function (error) { });
    } catch (error) { }


  }

  componentWillUpdate() {
    _gMod = new GlobalMod();
    if (_gMod._userId == "" || _gMod._userId == undefined) {
      window.location.href = "/evumaxapp/";
      return;
    }

  }
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
        FunctionName = "removeUserFav"
      } else {
        FunctionName = "updateUserFav"
      }


      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Well.Data.Objects";
      objBrokerRequest.Function = FunctionName; // "updateUserFav";
      objBrokerRequest.Broker = "ActiveWellProfile";

      objParameter = new BrokerParameter("UserName", _gMod._userId);
      objBrokerRequest.Parameters.push(objParameter);

      objParameter = new BrokerParameter("WellID", this.currentWellID);
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
            if (FunctionName == "removeUserFav") {
              WidgetList[i].isFav = false;
            } else {
              WidgetList[i].isFav = true;
            }

          }

          this.setState({
            data: WidgetList
          });

        })
        .catch(function (error) { });
    } catch (error) { }
  };
  onAddToFavoritesCheckbox = (e) => {
    try {

      this.setState({
        addToFav: e.target.checked,
      });
    } catch (error) { }
  };

  MyItemRender = (props) => {

    let item = props.dataItem;

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
          {item.id != "None" && <div
            {...item}
            onClick={(e) => this.OpenWidget(item)}
            className="k-chip k-chip-filled"
          >
            <div className="k-chip-content">Open</div>
          </div>}
        </div>

        {this.openAsEditor && <div className="col-3">
          <div
            {...item}
            style={{ cursor: "pointer" }}
            onClick={(e) => this.AddtoFavourite(item)}
            className="k-chip k-chip-filled"
          >
            {item.isFav == true ? <div className="k-chip-content">Remove from favourite</div> : <div className="k-chip-content">Add to favourite</div>}
          </div>
        </div>}
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

      objParameter = new BrokerParameter("WellID", this.currentWellID);
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
        title={this.state.title + " " + this.currentWellName}
        //onClose={() => this.setState({ showOpenInterfaceDialog: false })}
        onClose={() => this.__parentRef.CloseOpenInterfaceDialog()} // this.setState({ showOpenInterfaceDialog: false })}
        // width = {'80vw'}
        // height = {300}
        style={{ width: "650px", height: "540px" }}
        resizable={false}
        modal={true}
        minimizeButton={() => null}
        maximizeButton={() => null}
        initialTop={100}
        initialLeft={600}
      >


        <div style={{ paddingTop: "20px" }}>

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


