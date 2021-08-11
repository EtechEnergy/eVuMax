import React from "react";
import axios from "axios";
import {
  Grid,
  GridColumn as Column,
  GridColumn,
  GridToolbar,
} from "@progress/kendo-react-grid";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import { filterBy } from "@progress/kendo-data-query";
import CustomLoader from "../loader/loader";
import history from "../../history/history";
import GlobalMod from "../../objects/global";

let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");
// let columnList: any[] = [];
// let wellList: any[] = [];
let wellList_Clone: any[] = [];
const searchFieldStyle = {
  // borderRadius: '22px',
  width: "15%",
  borderColor: "#9e9e9e",
  border: "1px solid var(--base-anchor-color)",
  borderRadius: "22px",
  backgroundColor: "inherit",
  color: "var(--base-anchor-color)",
  padding: "5px 20px",
};

const headerlabel = {
  fontSize: "16px",
  fontWeights: "700",
  display: "inline-flex",
};

export interface IProps {
  getSelectedWells: any | undefined;
  getWithWellName: boolean;
}

export default class WellSelector extends React.PureComponent<IProps> {
  constructor(props: any) {
    super(props);
  }

  intervalID: NodeJS.Timeout | undefined;
  state = {
    WellList: [] as any,
    isProcess: false,
    selectedWellID: [] as any,
  };

  componentDidMount() {
    this.getWellList();
  }

  cmdCancel_click = (e: any) => {
    //history.push("/dashboard/home");
    this.props.getSelectedWells(false);
  };
  //Nishant 10-06-2020
  cmdOk_click = () => {
    console.log(this.state.WellList);
    let selectedWellIDs: any[] = [];
    for (let i = 0; i < this.state.WellList.length; i++) {
      let selected = this.state.WellList[i]["selected"];
      if (selected) {
        if (this.props.getWithWellName == true) {
          selectedWellIDs.push(
            this.state.WellList[i]["WELL_ID"] +
              "~" +
              this.state.WellList[i]["WELL_NAME"]
          );
        } else {
          selectedWellIDs.push(this.state.WellList[i]["WELL_ID"]);
        }
      }
    }
    this.props.getSelectedWells(selectedWellIDs);
  };
  filterData = (e: any) => {
    let value = e.target.value;
    let filter: any = {
      logic: "or",
      filters: [
        { field: "WELL_NAME", operator: "contains", value: value },
        { field: "BLOCK", operator: "contains", value: value },
        { field: "REGION", operator: "contains", value: value },
        { field: "DISTRICT", operator: "contains", value: value },
        { field: "FIELD", operator: "contains", value: value },
        { field: "STATE", operator: "contains", value: value },
        { field: "COUNTY", operator: "contains", value: value },
        { field: "OPERATOR", operator: "contains", value: value },
        { field: "EDR_PROVIDER", operator: "contains", value: value },
        { field: "RIG_NAME", operator: "contains", value: value },
      ],
    };

    this.setState({
      WellList: filterBy(wellList_Clone, filter),
    });
  };

  getWellList = () => {
    try {
      this.setState({ isProcess: true });

      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Well.Data.Objects";
      objBrokerRequest.Function = "getWellList";
      objBrokerRequest.Broker = "ActiveWellProfile";
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
          let _Data = [];
          if (res.data.RequestSuccessfull) {
            _Data = JSON.parse(res.data.Response);
            wellList_Clone = _Data;

            console.log("well List", _Data);

            this.setState({
              WellList: _Data.map((dataItem: any) =>
                Object.assign({ selected: false }, dataItem)
              ),
            });

            //_Data.map((item: any) => Object.assign({ inEdit: true }, item))
          }

          this.setState({ isProcess: false });
        })
        .catch((error) => {
          if (error.response) {
            // this.errors(error.response.message);
          } else if (error.request) {
            console.log("error.request");
          } else {
            console.log("Error", error);
          }
          console.log("rejected");
        });

      //this.intervalID = setTimeout(this.getWellList.bind(this), 5000);
    } catch {}
  };
  selectionChange = (event: any) => {
    const checked = event.syntheticEvent.target.checked;

    const data = this.state.WellList.map((item: any) => {
      if (item["WELL_ID"] === event.dataItem.WELL_ID) {
        item["selected"] = checked;
      }
      return item;
    });
    this.setState({ wellList: data });
  };
  onItemChange = (e: any) => {
    e.dataItem[e.field] = e.value;
    this.setState({
      data: [...this.state.WellList],
    });
  };
  //Nishant  26-05-2020 for checkbox selection
  grid_headerSelectionChange = (event: any) => {
    const checked = event.syntheticEvent.target.checked;
    const data = this.state.WellList.map((item: any) => {
      item["selected"] = checked;
      return item;
    });
    this.setState({ wellList: data });
  };

  render() {
    let loader = this.state;
    return (
      <>
        <div className="row">
          <Grid
            onItemChange={this.onItemChange}
            style={{ height: "83vh", width: "95vw" }}
            data={this.state.WellList}
            resizable={true}
            scrollable={"scrollable"}
            sortable={true}
            // onDataStateChange={this.handleGridDataStateChange}
            editField="inEdit"
            selectedField="selected"
            onSelectionChange={this.selectionChange}
            onHeaderSelectionChange={this.grid_headerSelectionChange} //Nishant 26-05-2020
          >
            <GridToolbar>
              <span className="ml-2">
                {loader.isProcess ? <CustomLoader /> : ""}
              </span>

              <span className="float-left ml-3">
                <button
                  type="button"
                  className="btn-custom btn-custom-primary mr-1"
                  onClick={this.cmdOk_click}
                >
                  {" "}
                  Ok
                </button>
                <button
                  type="button"
                  className="btn-custom btn-custom-primary ml-1"
                  onClick={this.cmdCancel_click}
                >
                  {" "}
                  Cancel
                </button>
              </span>
              <span
                className="k-textbox k-space-right float-right"
                style={searchFieldStyle}
              >
                <input
                  type="text"
                  onChange={this.filterData}
                  placeholder="Search"
                />
                <a className="k-icon k-i-search" style={{ right: "10px" }}>
                  &nbsp;
                </a>
              </span>
            </GridToolbar>
            <Column
              field="selected"
              width="70px"
              title="Show"
              resizable={true}
              minResizableWidth={50}
              headerClassName="text-center"
              className="text-center"
              editable={true}
              editor="boolean"
              headerSelectionValue={
                this.state.WellList.findIndex(
                  (dataItem: any) => dataItem.selected === false
                ) === -1
              }
            ></Column>
            {false && <Column field="WELL_ID" title="Well ID" width="100px" />}
            <Column
              field="WELL_NAME"
              title="Well Name"
              width="250px"
              editable={false}
            />
            <Column
              field="BLOCK"
              headerClassName="text-center"
              className="text-center"
              title="Block"
              width="90px"
              editable={false}
            />
            <Column
              field="REGION"
              headerClassName="text-center"
              className="text-center"
              title="Region"
              width="90px"
              editable={false}
            />
            <Column
              field="DISTRICT"
              headerClassName="text-center"
              className="text-center"
              title="District"
              width="90px"
              editable={false}
            />
            <Column
              field="FIELD"
              title="Field"
              width="120px"
              editable={false}
            />
            <Column
              field="STATE"
              headerClassName="text-center"
              className="text-center"
              title="State"
              width="90px"
              editable={false}
            />
            <Column
              field="COUNTY"
              headerClassName="text-center"
              className="text-center"
              title="County"
              width="90px"
              editable={false}
            />
            <Column
              field="OPERATOR"
              title="Operator"
              width="90px"
              editable={false}
            />
            <Column
              field="EDR_PROVIDER"
              title="EDR Provider"
              width="90px"
              editable={false}
            />
            <Column
              field="RIG_NAME"
              title="Rig Name"
              width="250px"
              editable={false}
            />
          </Grid>
        </div>
      </>
    );
  }
}
