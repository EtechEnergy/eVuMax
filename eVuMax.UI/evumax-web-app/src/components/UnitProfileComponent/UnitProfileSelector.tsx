
import React, { PureComponent } from "react";
import "@progress/kendo-react-intl";
import "react-router-dom";
import ProcessLoader from "../loader/loader";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import axios from "axios";
import { Window } from '@progress/kendo-react-dialogs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { comboData } from "../../eVuMaxObjects/UIObjects/comboData";

import GlobalMod from "../../objects/global";
import { Button } from "@progress/kendo-react-all";
let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");


interface IProps { }

export default class UnitProfileSelector extends PureComponent<IProps>{
    constructor(parentRef, props: any) {
        super(props)
        this.__parentRef = parentRef;

    }

    state = {
        profileID: new comboData("", ""),
        profileList: [] as comboData[]
    }

    __parentRef: any;

    componentDidMount() {
        this.loadProfileList();
    }

    componentWillUpdate() {
        _gMod = new GlobalMod();
        if (_gMod._userId == "" || _gMod._userId == undefined) {
            window.location.href = "/evumaxapp/";
            return;
        }

    }
    loadProfileList = () => {
        try {

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataObject.Manager";
            objBrokerRequest.Function = "getUnitProfileList";
            objBrokerRequest.Broker = "WellBroker";

            axios.get(_gMod._getData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) }
            }).then((res) => {


                const objData = Object.values(JSON.parse(res.data.Response));
                let profileList: comboData[] = [];
                for (let index = 0; index < objData.length; index++) {
                    const objItem: any = objData[index];
                    let objComboData: comboData = new comboData(objItem.ProfileName, objItem.ProfileID);

                    profileList.push(objComboData);
                }
                this.setState({ profileList: profileList, isProcess: false });
                this.forceUpdate();
            })
                .catch((error) => {
                    if (error.response) {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        // this.errors(error.response.message);
                    } else if (error.request) {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        console.log('error.request');
                    } else {
                        // return <CustomeNotifications Key="success" Icon={false}  />
                        console.log('Error', error);
                    }
                    // return <CustomeNotifications Key="success" Icon={false}  />
                    console.log("rejected");
                    this.setState({ isProcess: false })
                });

        } catch (error) {

        }

    }

    profileClicked = (event: any) => {
        let profileID: string = event.target.value;
        this.setState({
            profileID: profileID
        });
        this.forceUpdate();
    }

    applyProfile = () => {
        this.__parentRef.ApplyProfile(this.state.profileID.id, true);
    }

    close = () => {
        this.__parentRef.ApplyProfile("", false);
    }

    render() {
        return (
            <>

                <Window title={"Unit Conversion Profile"} modal={true}
                    minimizeButton={() => null}
                    maximizeButton={() => null}
                    restoreButton={() => null}
                    onClose={() => this.close()}
                    height={200}
                >

                    <div className="row mt-2 lg-12">
                        <div className="col">
                            <DropDownList
                                data={this.state.profileList}
                                textField="text"
                                dataItemKey="id"
                                value={this.state.profileID}
                                onChange={this.profileClicked}
                            />
                            <span className="float-right mt-3">
                                <Button onClick={this.close} className="mr-2">
                                    Cancel
                                </Button>

                                <Button className="k-button k-primary" onClick={this.applyProfile}>
                                    Apply
                                </Button>
                            </span>

                        </div>
                    </div>
                </Window>
            </>
        )
    }
}