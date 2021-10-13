import React, { Component } from 'react'

import axios from "axios";
import { Grid, GridColumn as Column, GridColumn, GridToolbar, GridDetailRow } from '@progress/kendo-react-grid';
import { Window, DropDownList, Button, Dialog, DialogActionsBar } from '@progress/kendo-react-all';
import { confirmAlert } from "react-confirm-alert";
import Moment from 'react-moment';


import GlobalMod from "../../objects/global";
import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";


import * as utilFunc from '../../utilFunctions/utilFunctions';
import { debug } from 'console';
import { data } from 'jquery';

let _gMod = new GlobalMod();


let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");


export interface IProps {
    WellID: any
    WellName: any
}


export default class DownloadStatus extends Component<IProps> {
    constructor(props: any) {
        super(props)

    }

    intervalID: NodeJS.Timeout | undefined

    state = {
        grdDownloadStatus: [] as any,
        editID: "",
        currentLogID: "",
        TimeLogStatus: [] as any,
        DepthLogStatus: [] as any,
        TrajStatus: [] as any,

        showDownloadLogDialog: false
    }

    componentWillUpdate() {
        _gMod = new GlobalMod();
        if (_gMod._userId == "" || _gMod._userId == undefined) {
            window.location.href = "/evumaxapp/";
            return;
        }

    }
    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    componentWillMount() {
        this.intervalID = setInterval(this.loadDownloadStatus.bind(this), 5000);
        //clearInterval(this.intervalID); //temp to test
        this.loadDownloadStatus();

    }

    stopDownload = (paramOpSeq: string) => {

        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to Stop Download?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        objBrokerRequest = new BrokerRequest();
                        objBrokerRequest.Module = "DataObject.Manager";
                        objBrokerRequest.Function = "stopDownload";
                        objBrokerRequest.Broker = "WellBroker";


                        objParameter = new BrokerParameter('OpSeq', paramOpSeq);
                        objBrokerRequest.Parameters.push(objParameter);
                        axios.post(_gMod._performTask, {
                            paramRequest: JSON.stringify(objBrokerRequest),
                        }).then((response) => {
                            this.loadDownloadStatus();
                        })
                            .catch(function (error) {
                                console.log(error);
                            });
                    }

                },
                {
                    label: 'No',
                    onClick: () => null
                }
            ]
        });

    }

    loadDownloadStatus = async () => {

        let objData = await this.getDownloadStatus();
        objData[0].DETAILS = "FDF";
        this.setState({
            grdDownloadStatus: objData
        });
        console.log(objData);
    }

    getDownloadStatus = async () => {

        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "DataObject.Manager";
        objBrokerRequest.Function = "getDownloadStatus";
        objBrokerRequest.Broker = "WellBroker";

        objParameter = new BrokerParameter('UserName', _gMod._userId);

        objBrokerRequest.Parameters.push(objParameter);


        objParameter = new BrokerParameter('WellID', this.props.WellID);

        objBrokerRequest.Parameters.push(objParameter);

        const res = await axios.get(_gMod._getData, { params: { paramRequest: JSON.stringify(objBrokerRequest) }, });

        return await JSON.parse(res.data.Response);

    }


    expandDetailLog = (event: any) => {
        //
        // alert(event.dataItem.expanded);
        // event.dataItem.expanded = !event.dataItem.expanded;
        // this.forceUpdate();

        let newData = this.state.grdDownloadStatus.map((item: any) => {
            if (item.OP_SEQ === event.dataItem.OP_SEQ) {
                item.expanded = !event.dataItem.expanded
            }
            return item;
        })
        this.setState({ grdDownloadStatus: newData })


    }

    render() {
        return (
            <>
                {/* style={{ height: '86vh', width: '85vw' }} */}

                <div id="mainContainer_" style={{ width: '85vw' }} >
                    <div className="row">
                        <div className="col-8">
                            <label>{this.props.WellName}</label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <Grid
                                // style={{ height: '86vh', width: '95vw' }}
                                style={{ height: 'auto', width: '60vw' }}

                                data={this.state.grdDownloadStatus != null ? (this.state.grdDownloadStatus.map((item: any) =>
                                    ({ ...item })
                                )) : null}
                                detail={DetailComponent}
                                resizable={true}
                                scrollable={"scrollable"}
                                sortable={true}

                                expandField="expanded"

                                onExpandChange={this.expandDetailLog}
                            >


                                <Column width="150px" field="LOGTYPE" headerClassName="text-center" resizable={true} className="text-left" title="Log Type" editable={true} />
                                <Column width="150px" field="LOG_NAME" headerClassName="text-center" className="text-left" title="Log Name" editor="numeric" editable={true} />
                                <Column width="150px" field="LAST_DATA" headerClassName="text-center" className="text-left" title="LAST DATA" />

                                <Column width="150px" field="LAST_INDEX" headerClassName="text-center" className="text-left" title="LAST INDEX" />

                                <Column width="150px" field="LAST_RESPONSE" headerClassName="text-center" className="text-left" title="LAST RESPONSE" />



                                <Column width="150px" field="LAST_DATA_RECEIVED" headerClassName="text-center" className="text-left" title="Last Data Received" editor="date" format="{0:MMM yyyy}"
                                    cell={props => (
                                        <td className="text-center">
                                            {
                                                < Moment date={props.dataItem.LAST_DATA_RECEIVED} format="DD-MMM-yyyy HH:MM:ss">        </Moment>
                                            }
                                        </td>)}
                                />
                                <Column width="180px" field="LAST_RESPONSE_TIME" headerClassName="text-center" className="text-left" title="Last Response Received" editable={true} />
                                <Column width="150px" field="END_INDEX" headerClassName="text-center" className="text-left" title="Last Index" editable={true} />
                                <Column width="80px" title="*" resizable={false} minResizableWidth={50} headerClassName="text-center" reorderable={false}
                                    cell={props => (
                                        <td className="text-center">
                                            <span>
                                                <td className="text-center">
                                                    <span onClick={(e) => this.stopDownload(props.dataItem.OP_SEQ)} ><img src={require("../../images/forbidden.png")} key="0" style={{ width: 25, height: 25 }} /> </span>
                                                    {/* <Button onClick={e => this.stopDownload(props.dataItem.OP_SEQ)} >Stop Download</Button> */}
                                                </td>
                                            </span>

                                        </td>)}
                                />

                                <Column width="80px" title="Log" resizable={false} minResizableWidth={50} headerClassName="text-center" reorderable={false}
                                    cell={props => (
                                        <td className="text-center">
                                            <span>
                                                <span onClick={(e) => null} ><img src={require("../../images/ViewLogs.png")} key="0" style={{ width: 25, height: 25 }} /> </span>
                                            </span>
                                        </td>)}
                                />
                            </Grid>

                        </div>


                    </div>

                </div>

                {/* {this.state.showDownloadLogDialog && <Dialog

                    width={500}
                    height={300}
                    title={"Select Channels"}
                    onClose={(e: any) => {
                        this.setState({
                            showAddDatasetChannels: false
                        });
                    }}
                >
                    <Grid
                    >

                    </Grid>


                    <DialogActionsBar>
                        <button className="k-button k-primary" onClick={(e: any) => {


                        }}>Save</button>
                        <button className="k-button" onClick={(e: any) => {
                            this.setState({
                                showDownloadLogDialog: false
                            });
                        }}>Cancel</button>
                    </DialogActionsBar>
                </Dialog>} */}

            </>
        )
    }
}


class DetailComponent extends GridDetailRow {
    render() {
        const dataItem = this.props.dataItem;
        return (
            <section>
                <p><strong>Details:</strong> {dataItem.DETAILS}</p>

            </section>
        );
    }
}