import React from "react";
import ReactDOM from "react-dom";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { filterBy } from "@progress/kendo-data-query";
import { Window } from '@progress/kendo-react-dialogs';
import history from '../../../history/history';
import GlobalMod from "../../../objects/global";
import BrokerRequest from '../../../broker/BrokerRequest';
import BrokerParameter from "../../../broker/BrokerParameter";
import axios from "axios";
import * as utilFunc from "../../../utilFunctions/utilFunctions"; //Nishant 07-10-2020
import { util } from "typescript-collections";

let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

// const WidgetList = [
//     "Baseball",
//     "Basketball",
//     "Cricket",
//     "Field Hockey",
//     "Football",
//     "Table Tennis",
//     "Tennis",
//     "Volleyball"
// ];

const WidgetList = utilFunc.getWidgetList();
//  [
//     { id: "DrlgSummary", name: "Drilling Summary" },
//     { id: "DrlgConnSummary", name: "Drlg. Conn. Summary" },
//     { id: "DrlgConnSummary2", name: "Drlg. Conn. Summary (Split View)" },
//     { id: "TripConnSummary", name: "Trip Conn. Summary" },
//     { id: "ToolfaceSummary", name: "Toolface Summary" }
// ]

interface IProps { }

interface IState {
    currentWellID: string
    showOpenInterfaceDialog: boolean
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
        addToFav: false
    };

    componentDidMount() {
        try {

            if (WidgetList.length > 0) {
                this.setState({
                    value: WidgetList[0]
                });
                this.forceUpdate();
            }


        } catch (error) {

        }
    }

    itemRender = (li, itemProps) => {
        const itemChildren = (
            <span >
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

    filterChange = event => {
        this.setState({
            data: filterBy(WidgetList.slice(), event.filter)
        });
    };

    onChange = (event) => {

        if (event.value.length == 0) {
            this.setState({
                value: ""
            });
            return;
        }

        this.setState({
            value: [...event.target.value]
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

    onAddToFavoritesCheckbox = (e) => {
        try {

            console.log(e.target.checked);
            this.setState({
                addToFav: e.target.checked
            })
        } catch (error) {

        }
    }

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

            objParameter = new BrokerParameter('UserName', _gMod._userId);

            objBrokerRequest.Parameters.push(objParameter);
            objParameter = new BrokerParameter('favList', favList);
            objBrokerRequest.Parameters.push(objParameter);

            axios.post(_gMod._performTask, {
                paramRequest: JSON.stringify(objBrokerRequest),
            }).then((response) => {
                this.__parentRef.CloseOpenInterfaceDialog(true);
            })
                .catch(function (error) {
                });



        } catch (error) {

        }
    }




    render() {
        const value = this.state.value;
        const selected = value.length;
        return (
            <Window
                title={"Select Interface To Open"}
                //onClose={() => this.setState({ showOpenInterfaceDialog: false })}
                onClose={() => this.__parentRef.CloseOpenInterfaceDialog()}  // this.setState({ showOpenInterfaceDialog: false })}
                // width = {'80vw'}
                // height = {300}
                style={{ width: '400px', height: '220px' }}
                resizable={false}
                modal={true}
                minimizeButton={() => null}
                maximizeButton={() => null}
            >

                <div>
                    <div>
                        <input className="mr-3 mt-3" type="checkbox" onClick={this.onAddToFavoritesCheckbox} />Add To Favorites
                        {this.state.addToFav && <button className="btn-custom btn-custom-primary ml-3 " onClick={this.SaveFavorites}>Save</button>}
                    </div>
                    <MultiSelect
                        tags={
                            selected > 0
                                ? [{ text: `Selected (${selected} Widgets)`, data: [...value] }]
                                : []
                        }
                        filterable={true}
                        data={this.state.data}
                        onChange={this.onChange}
                        onFilterChange={this.filterChange}
                        value={this.state.value}
                        itemRender={this.itemRender}
                        autoClose={false}
                        textField="name"
                        dataItemKey="id"
                    />
                </div>
            </Window>

        );
    }
}

// ReactDOM.render(<AppComponent />, document.querySelector("my-app"));
