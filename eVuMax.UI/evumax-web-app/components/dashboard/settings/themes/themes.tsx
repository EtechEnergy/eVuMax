import React, { useContext } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faTrash,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import {
  Grid,
  GridColumn as Column,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { Route } from "react-router-dom";
import BrokerRequest from "../../../../broker/BrokerRequest";
import ManageThemes from "./manage-theme/manage-theme";
import BrokerParameter from "../../../../broker/BrokerParameter";
import { KendoDate } from "@progress/kendo-react-dateinputs/dist/npm/dateinput/models";
import { filterBy } from "@progress/kendo-data-query";
import history from "../../../../history/history";
import GlobalMod from "../../../../objects/global";
import { ThemeContext } from "../../../app/app";
let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
export interface SessionProps {
  Id: string;
  FormMode: string;
}

let _themeList: any[] = [];
const searchFieldStyle = {
  // borderRadius: '22px',
  width: "15%",
  borderColor: "var(--base-anchor-color)",
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
export default class Themes extends React.Component {
  //   static contextType = ThemeContext;
  //   context!: React.ContextType<typeof ThemeContext>;
  state = {
    ThemeList: [] as any,
  };
  componentDidMount() {
    document.title= "eVuMax";//Nishant 02/09/2021 
    this.test();
    this.getThemesList();
  }

  test = () => {
    // <ThemeContext>
    //   {(props) => {
    //     return <div>{props.Id}</div>;
    //   }}
    // </ThemeContext>;
  };
  Edit = (event: any, rowData: any) => {
    let objSession = {
      Id: rowData.Id,
      FormMode: "Edit",
    };
    sessionStorage.setItem("themes", JSON.stringify(objSession));
    history.push("/dashboard/manage-themes");
  };
  Remove = (event: any, rowData: any) => {
    try {
      let Id = rowData.Id;
      objBrokerRequest = new BrokerRequest();
      let objParameter = new BrokerParameter("pId", Id);
      objBrokerRequest.Parameters.push(objParameter);
      // Remove
      objBrokerRequest.Module = "Config";
      objBrokerRequest.Function = "RemoveTheme";
      objBrokerRequest.Broker = "Config.Themes";
      axios
        .get(_gMod._performTask, {
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          const objData = res.data;

          this.getThemesList();
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
    } catch {}
  };
  Add = () => {
    let objSession = {
      Id: "",
      FormMode: "Add",
    };
    sessionStorage.setItem("themes", JSON.stringify(objSession));
    history.push("/dashboard/manage-themes");
  };
  filterData = (e: any) => {
    let value = e.target.value;
    let filter: any = {
      logic: "or",
      filters: [
        { field: "Name", operator: "contains", value: value },
        { field: "CreatedDate", operator: "contains", value: value },
      ],
    };
    this.setState({
      ThemeList: filterBy(_themeList, filter),
    });
  };
  getThemesList = () => {
    try {
      objBrokerRequest = new BrokerRequest();
      objBrokerRequest.Module = "Config";
      objBrokerRequest.Function = "ThemeList";
      objBrokerRequest.Broker = "Config.Themes";
      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          const objData = JSON.parse(res.data.Response);
          _themeList = objData;
          this.setState({ ThemeList: objData });
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
    } catch {}
  };
  render() {
    Themes.contextType = ThemeContext;
    const themeId = this.context.Id;
    return (
      <div>
        <legend>
          <a>Themes</a>
        </legend>
        <hr></hr>
        <div className="clearfix"></div>
        <div className="mt-3">
          <div className="row">
            <div className="col-lg-12 col-xl-12 col-12 col-md-12 col-sm-12">
              <Grid
                style={{ height: "75vh", width: "95vw" }}
                data={
                  this.state.ThemeList != null
                    ? this.state.ThemeList.map((item: any) => ({
                        ...item,
                        //inEdit: item.id === themeId,
                        selected: item.Id === themeId,
                      }))
                    : null
                }
                // data={this.state.ThemeList}
                resizable={true}
                scrollable={"scrollable"}
                sortable={true}
                selectedField="selected"
              >
                <GridToolbar>
                  <div className="mr-1" style={headerlabel}>
                    <button
                      onClick={this.Add}
                      type="button"
                      className="btn-custom btn-custom-primary"
                    >
                      {/* <FontAwesomeIcon icon={faPlusCircle} className="mr-2" /> */}
                      New Theme
                    </button>
                    <span className="ml-2"></span>
                  </div>

                  <span
                    style={{ width: "15%" }}
                    className="k-textbox k-space-right float-right serachStyle"
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

                <Column field="Name" title="Name" width="300px" />
                <Column
                  field="CreatedDate"
                  title="Created Date"
                  width="200px"
                  format="{0:MMM yyyy}"
                />
                <Column
                  width="90px"
                  headerClassName="text-center"
                  field="action"
                  title="Action"
                  cell={(props) => (
                    <td className="text-center">
                      <div>
                        <span onClick={(e) => this.Edit(e, props.dataItem)}>
                          <FontAwesomeIcon icon={faPen} />
                        </span>
                        <span
                          className="ml-2"
                          onClick={(e) => this.Remove(e, props.dataItem)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </span>
                      </div>

                      {/* <span onClick={(e) => this.Edit(e, props.dataItem)}>
                        <FontAwesomeIcon icon={faPen} />
                      </span>

                      <span
                        className="ml-2"
                        onClick={(e) => this.Remove(e, props.dataItem)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </span> */}
                    </td>
                  )}
                />
              </Grid>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
