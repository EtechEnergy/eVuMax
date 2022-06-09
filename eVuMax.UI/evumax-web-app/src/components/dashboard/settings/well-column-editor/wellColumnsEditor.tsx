
import React, { Children } from "react";

import axios from "axios";
import { Grid, GridColumn as Column, GridColumn, GridToolbar, GridEditCell } from '@progress/kendo-react-grid';
import history from "../../../../history/history";


// import '../../settings//wellColumnsEditorCSS.css';
// import '../well-column-editor/wellColumnsEditor.css';

import "bootstrap";


import BrokerRequest from "../../../../broker/BrokerRequest";
import BrokerParameter from "../../../../broker/BrokerParameter";

import { Checkbox } from "@progress/kendo-react-inputs";
import * as utilFunc from '../../../../utilFunctions/utilFunctions';

//Nishant 02-06-2020
import GlobalMod from "../../../../objects/global"

let _gMod = new GlobalMod();
//********* */
let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

export interface IProps {
    actionOnClick: any | undefined
}


class wellColumns {
    ColumnID: string = "";
    Visible: number = 0;
    OrderNo: number = 0;
}



export default class WellColumnsEditor extends React.PureComponent<IProps> {
    constructor(props: any) {
        super(props);
    }

    state = {
        columnWell: [{ COLUMN_ID: "", VISIBLE: 0, ORDER_NO: 0 }], //Nishant 02-06-2020
        title: '',
        children: [] as any,
        selectedItem: { COLUMN_ID: "", VISIBLE: 0, ORDER_NO: 0 }, //Nishant 02-06-2020
    }



    componentDidMount() {
        document.title = "eVuMax";//Nishant 02/09/2021
        this.getColumnWell();

    }


    onItemChange = (e: any) => {

        //Nishant 16/08/2021
        if (e.dataItem.COLUMN_ID == "OPEN_INTERFACE" || e.dataItem.COLUMN_ID == "EDIT_WELL") {
            return;
        }
        e.dataItem[e.field] = e.value;
        this.setState({
            data: [...this.state.columnWell]
        });
    };







    getColumnWell = () => {
        try {


            this.setState({ isProcess: true })

            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Well.Data.Objects";
            objBrokerRequest.Function = "WellColumns";
            objBrokerRequest.Broker = "ActiveWellProfile";


            objParameter = new BrokerParameter('UserName', _gMod._userId);
            objBrokerRequest.Parameters.push(objParameter);


            
            axios.get(_gMod._getData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                params: { paramRequest: JSON.stringify(objBrokerRequest) }
            },

            )


                .then((res) => {

                    const objData = JSON.parse(res.data.Response);

                    debugger;
                    this.setState({
                        columnWell: objData.map((item: any) => Object.assign({ selected: false, inEdit: true }, item))
                    });


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

        }
        catch {

        }




    };


    Save = () => {

        try {
            debugger;
            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Well.Data.Objects";
            objBrokerRequest.Function = "SaveWellColumns";
            objBrokerRequest.Broker = "ActiveWellProfile";

            let objColumn = new wellColumns();
            let wellColumnList: Array<wellColumns> = [];

            for (let i = 0; i < this.state.columnWell.length; i++) {

                objColumn = new wellColumns();
                objColumn.ColumnID = this.state.columnWell[i].COLUMN_ID;
                if (this.state.columnWell[i].VISIBLE) {
                    objColumn.Visible = 1
                } else {
                    objColumn.Visible = 0;
                }
                objColumn.OrderNo = i + 1;

                wellColumnList.push(objColumn);
            }




            objParameter = new BrokerParameter('UserName', _gMod._userId);

            objBrokerRequest.Parameters.push(objParameter);

            objParameter = new BrokerParameter('Update', JSON.stringify(wellColumnList));

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
                    ;

                    history.push("/dashboard/home");

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


                });

        } catch (error) {

        }

    }
    Cancel = () => {

        history.push("/dashboard/home");

    }

    //Nishant 02-06-2020
    grdRowClick = (e: any) => {

        e.dataItem.selected = !e.dataItem.selected;
        this.setState({ selectedItem: e.dataItem });
        
        let index = this.state.columnWell.findIndex((item: any) => item["COLUMN_ID"] === e.dataItem.COLUMN_ID
        );
        if (index > 0) {

            let newData: any = utilFunc.CopyObject(this.state.columnWell);
            for (let i = 0; i < newData.length; i++) {
                const element = newData[i];
                newData[i].selected = false;
            }

            let value = newData[index];
            newData[index] = e.dataItem;
            this.setState({
                columnWell: newData
            });
        }

    }
    handleSelect = (item: any) => {
        this.setState({
            selectedItem: item
        });
    };

    // const MyFooter = () => {
    //     return (
    //       <ListViewFooter
    //         style={{ color: "rgb(160, 160, 160)", fontSize: 14 }}
    //         className="pl-3 pb-2 pt-2"
    //       >
    //         25 unread messages in total
    //       </ListViewFooter>
    //     );
    //   };

    ColumnListItemRender = (props: any) => {
        let item = props.dataItem;
        return (
            // <div
            //     className={`row p-2 border-bottom align-middle ${
            //         props.dataItem.COLUMN_ID === props.selectedItem.COLUMN_ID
            //             ? "k-state-selected"
            //             : ""
            //         }`}
            //     style={{ margin: 0 }}
            //     onClick={() => props.onSelect(props.dataItem)}
            // >
            <div className="row" style={{ width: "500px" }}>
                <div className="col-4">
                    <div onClick={() => props.onSelect(props.dataItem)} style={{ fontSize: 12, color: "#a0a0a0" }}>{item.COLUMN_ID}</div>
                </div>
                <div className="col-2">
                    <Checkbox value={item.VISIBLE == 1 ? true : 'false'} />
                </div>
            </div>
        );
    };

    handleMoveUp = () => {

        //Nishant 16/08/2021
        if (this.state.selectedItem.COLUMN_ID == "OPEN_INTERFACE" || this.state.selectedItem.COLUMN_ID == "EDIT_WELL") {
            return;
        }


        if (this.state.selectedItem) {
            let index = this.state.columnWell.findIndex((item: any) => item["COLUMN_ID"] === this.state.selectedItem.COLUMN_ID
            );
            if (index > 0) {
                let data = [...this.state.columnWell];
                let value = data[index - 1];
                data[index - 1] = data[index];
                data[index] = value;
                this.setState({
                    columnWell: data
                });
            }
        }
    };

    handleMoveDown = () => {



        if (this.state.columnWell) {
            //Nishant 16/08/2021
            if (this.state.selectedItem.COLUMN_ID == "OPEN_INTERFACE" || this.state.selectedItem.COLUMN_ID == "EDIT_WELL") {
                return;
            }


            let index = this.state.columnWell.findIndex(
                item => item.COLUMN_ID === this.state.selectedItem.COLUMN_ID
            );
            if (index < this.state.columnWell.length - 1) {
                let data = [...this.state.columnWell];
                let value = data[index + 1];
                data[index + 1] = data[index];
                data[index] = value;
                this.setState({
                    columnWell: data
                });
            }
        }
    };


    render() {
        ;
        //const { title, children, config } = this.state;
        return (

            <div>
                <div className="col-lg-12 col-sm-12 col-md-12 col-12">
                    <legend><a>Dashboard Columns</a>

                    </legend>
                    <hr></hr>

                </div>

                <div className="mt-2">
                    <div className="row">
                        <div className="col-lg-12">
                            <form className="form-inline">
                                <Grid
                                    style={{ height: '35vh', width: '20vw' }}
                                    data={this.state.columnWell}
                                    editField="inEdit"
                                    selectedField="selected"
                                    onItemChange={this.onItemChange}
                                    onRowClick={this.grdRowClick}

                                >
                                    <GridToolbar>
                                        <button type="button" onClick={this.Save} className="btn-custom btn-custom-primary mr-1">

                                            Save</button>
                                        <button type="button" onClick={this.Cancel} className="btn-custom btn-custom-primary ml-1">

                                            Cancel</button>
                                    </GridToolbar>
                                    <Column field="COLUMN_ID" width="250px" title="Column Name" resizable={true} minResizableWidth={50} headerClassName="text-center" editable={false}  ></Column>
                                    <Column field="VISIBLE" width="50px" title="Show" resizable={true} minResizableWidth={50} headerClassName="text-center" editable={true} editor="boolean" ></Column>
                                </Grid>

                                <div className="col-2">
                                    <div>
                                        <span
                                            style={{ fontSize: 40 }}
                                            className="k-icon k-i-arrow-60-up"
                                            onClick={this.handleMoveUp}
                                        />
                                    </div>
                                    <div>
                                        <span
                                            style={{ fontSize: 40 }}
                                            className="k-icon k-i-arrow-60-down"
                                            onClick={this.handleMoveDown}
                                        />
                                    </div>
                                </div>


                            </form>



                        </div>


                    </div>
                </div>

                {/* <div className="row">
                    <div className="col-10">
                        <ListView
                            data={this.state.columnWell}
                            item={props => (
                                <this.ColumnListItemRender
                                    {...props}
                                    onSelect={this.handleSelect}
                                    selectedItem={this.state.selectedItem}
                                />
                            )}
                            style={{ width: "90%" }}

                        />
                    </div>
                    <div className="col-2">
                        <div>
                            <span
                                style={{ fontSize: 50 }}
                                className="k-icon k-i-arrow-60-up"
                                onClick={this.handleMoveUp}
                            />
                        </div>
                        <div>
                            <span
                                style={{ fontSize: 50 }}
                                className="k-icon k-i-arrow-60-down"
                                onClick={this.handleMoveDown}
                            />
                        </div>
                    </div>
                </div> */}

            </div>
        )
    }

}

