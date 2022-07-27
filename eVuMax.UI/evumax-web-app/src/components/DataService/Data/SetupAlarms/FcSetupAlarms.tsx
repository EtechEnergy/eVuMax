import { Button, Dialog, DropDownList, Label } from '@progress/kendo-react-all'
import React, { useEffect, useState } from 'react'
import BrokerParameter from '../../../../broker/BrokerParameter';
import BrokerRequest from '../../../../broker/BrokerRequest';
import GlobalMod from '../../../../objects/global';
import axios from "axios";
import { comboData } from '../../../../eVuMaxObjects/UIObjects/comboData';
import { confirmAlert } from 'react-confirm-alert';
let _gMod = new GlobalMod(); let objBrokerRequest = new BrokerRequest(); let objParameter = new BrokerParameter('', '');
export default function FcSetupAlarms(_props) {

    let wellID = _props.WellID;


    const [cboProfile, setCboProfile] = useState(new comboData());
    const [warningMsg, setWarningMsg] = useState([] as any[]);
    const [ProfileList, setProfileList] = useState([] as any[]);


    useEffect(() => {
        loadData();
    }, []);

    const onDropdownChange = (e: any) => {
        try {
            setCboProfile(e.value);
        } catch (error) {

        }
    }

    const okClick = () => {
        try {


            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "DataSetupAlarms";
            objBrokerRequest.Function = "saveAlarm";


            if (wellID == "") {

                confirmAlert({
                    //title: 'eVuMax',
                    message: 'Well ID is blank, something went wrong, please reload well Editor.',
                    childrenElement: () => <div />,
                    buttons: [
                        // {
                        //     label: 'Ok',
                        //     onClick: () => {
                        //         let offSetWells = this.state.grdOffsetWells;
                        //         let index = offSetWells.findIndex(d => d.WellID === rowData.WellID); //find index in your array
                        //         offSetWells.splice(index, 1);//remove element from array
                        //         this.setState({
                        //             //OffsetWells: offSetWells,
                        //             grdOffsetWells: offSetWells
                        //         });
                        //     }

                        // },
                        {
                            label: 'Ok',
                            onClick: () => null
                        }
                    ]
                });
                return;
            }

            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter('WellID', wellID);
            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter('selectedProfileId', cboProfile.id);
            objBrokerRequest.Parameters.push(objParameter);


            axios

                .get(_gMod._performTask, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json;charset=UTF-8'
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) }
                },
                )
                .then((res) => {

                    _props.onClose();

                })
                .catch((error) => {
                    if (error.response) {
                        // this.errors(error.response.message);
                    } else if (error.request) {

                        console.log('error.request');
                    } else {

                        console.log('Error', error);
                    }

                    console.log("rejected");


                });
            _props.onClose();

        } catch (error) {

        }
    }

    const loadData = () => {
        try {
            debugger
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "DataService";
            objBrokerRequest.Broker = "DataSetupAlarms";
            objBrokerRequest.Function = "loadProfiles";

            let objParameter = new BrokerParameter("WellID", wellID);
            objBrokerRequest.Parameters.push(objParameter);

            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then(async (res) => {
                    const objData = JSON.parse(res.data.Response);
                    //Warnings Notifications
                    let warnings: string = res.data.Warnings;
                    if (warnings.trim() != "") {
                        let warningList = [];
                        warningList.push({ "update": warnings, "timestamp": new Date(Date.now()).getTime() });
                        // this.setState({
                        //     warningMsg: warningList
                        // });
                        setWarningMsg(warningList);
                    } else {

                        setWarningMsg([]);
                    }



                    let selectedProfile_ = new comboData();
                    for (let index = 0; index < objData.objProfileList.length; index++) {
                        if (objData.objProfileList[index].id == objData.WellProfileID) {
                            selectedProfile_ = new comboData(objData.objProfileList[index].text, objData.objProfileList[index].id);
                        }
                    }

                    console.log("objData.objProfileList", objData.objProfileList);
                    objData.objProfileList.unshift({ id: -1, text: " " });
                    // id: "880_571_440_884_891"
                    // text: "01 - Sección Guía / Intermedia 1"
                    //await this.setState({ objProfileList: objData.objProfileList, WellID: objData.WellID, selectedProfile: selectedProfile_ });
                    setProfileList(objData.objProfileList);
                    setCboProfile(selectedProfile_);

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

                });

        } catch (error) {

        }
    }



    return (
        <Dialog title={"Alarm Profile Setup..."}

            width={"550px"}
            height={"150px"}
            onClose={(e: any) => {
                
                _props.onClose();
            }}
        >

            <div className="row" style={{ height: "50px" }} >
                <div className="col-lg-3 col-xl-3 col-md-3 col-sm-3 mb-2 mt-2 ">
                    <Label>Profile</Label>
                </div>
                <div className="col-lg-8 col-xl-8 col-md-8 col-sm-8 mb-2 mt-2 ">
                    <DropDownList
                        className="form-control"
                        textField="text"
                        dataItemKey="id"
                        data={ProfileList}
                        onChange={(e) => onDropdownChange(e)}
                        value={cboProfile}
                    />
                </div>
                <div className="mt-2" role="group" >
                    <Button onClick={okClick} style={{ width: "100px" }}>Ok</Button>
                    <Button className='ml-3' onClick={_props.onClose} style={{ width: "100px" }}>Cancel</Button>
                </div>
            </div>
            {/* <div className='row' >
                        <div className="col-lg-8 col-xl-8 col-md-8 col-sm-8 p-5">
                            <div className="btn-group" role="group">
                                <Button onClick={okClick} style={{ width: "100px" }}>Ok</Button>
                                <Button className='ml-3' onClick={_props.onClose} style={{ width: "100px" }}>Cancel</Button>


                            </div>
                        </div>
                    </div> */}
            {/* </div> */}
        </Dialog >
    )
}
