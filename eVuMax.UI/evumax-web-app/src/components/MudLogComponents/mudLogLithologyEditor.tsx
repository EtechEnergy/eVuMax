import React, { Component } from "react";

import { Grid, GridColumn as Column, GridColumn, GridToolbar } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-all';

import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPen, faCircle, faSearch, faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Input, Checkbox } from "@progress/kendo-react-inputs";
import { filterBy } from "@progress/kendo-data-query";
import CustomLoader from "../loader/loader";

import * as DataObjects from "../../eVuMaxObjects/dataObjects/dataObjects";
import * as UI from '../../eVuMaxObjects/UIObjects/NodeTree';
import { Well, wDateFormatLocal, wDateFormatUTC } from "../../eVuMaxObjects/dataObjects/DataObjects/well"
import '../grid/active-well/active-well.css'
import '@progress/kendo-react-layout';
import GlobalMod from "../../objects/global";
import { tickStep } from "d3";
import { confirmAlert } from "react-confirm-alert";
import $ from 'jquery';

import MudLithologyInlineEditor from "../MudLogComponents/mudLithologyInlineEditor"

let _gMod = new GlobalMod();


let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

// lithID: string = "";
// lithType: string = "";
// Percentage: number = 0;
// Image: any;
// Description: string = "";
// DisplayOrder: number = 0;

export interface IProps {
    objMudLogLithology: any[]
    updateLithologies: any
    LibID: string
    IntervalID: {}
}

export default class MudLogLithologyEditor extends Component<IProps> {
    objMudLogLithology: DataObjects.mudLogLithology = new DataObjects.mudLogLithology();
    objMudLogLithology_clone: DataObjects.mudLogLithology = new DataObjects.mudLogLithology();

    constructor(props: any) {
        super(props)
        this.setState({ lithologies: this.props.objMudLogLithology });
    }

    componentWillMount() {

        this.setState({ lithologies: this.props.objMudLogLithology });
    }


    state = {
        editID: {},
        lithologies: [] as any,
        lithoLogyTypeList: [] as any, //pending
        InEditMode: false,
        LithoInEdit: {} as any,
        selectedItem: {} as any,
        currentlithID: "",
    }

    saveInEdit = (dataItem: any, editMode: string) => {


        this.setState({
            InEditMode: !this.state.InEditMode,
            LithoInEdit: null
        });
        let newData: any = Object.values([...this.state.lithologies]);
        if (editMode == "E") {
            let index = newData.findIndex((item: any) => item.lithID === dataItem.lithID); // use unique value like ID
            let objLitho = new DataObjects.mudLogLithology();
            objLitho.Description = dataItem.Description;
            objLitho.DisplayOrder = 0;
            objLitho.Image = dataItem.Image;
            objLitho.lithType = dataItem.lithType;
            objLitho.lithID = dataItem.lithID;
            objLitho.Percentage = dataItem.Percentage;

            newData[index] = objLitho;
        }

        if (editMode == "A") {
            let objLitho = new DataObjects.mudLogLithology();
            objLitho.Description = dataItem.Description;
            objLitho.DisplayOrder = 0;
            objLitho.Image = dataItem.Image;
            objLitho.lithType = dataItem.lithType;
            objLitho.lithID = dataItem.lithID;
            objLitho.Percentage = dataItem.Percentage;
            newData.push(objLitho);
        }

        this.setState({ lithologies: newData });

    }

    cancelInEdit = () => {
        this.setState({
            InEditMode: !this.state.InEditMode,
            LithoInEdit: null
        });
    }




    grdItemChange = (e: any) => {

        e.dataItem[e.field] = e.value;
        this.setState({
            intervals: [...this.state.lithologies]
        });

        let newData: any = Object.values([...this.state.lithologies]);
        let index = newData.findIndex((item: any) => item.lithID === e.dataItem.lithID); // use unique value like ID
        newData[index][e.field] = e.value;
        this.setState({ intervals: newData })

    };

    grdRowClick = (event: any) => {

        this.setState({
            editID: event.dataItem.lithID
        });

        event.dataItem.selected = !event.dataItem.selected;
        this.setState({ selectedItem: event.dataItem });

    };

    handleMoveUp = () => {

        if (this.state.selectedItem) {
            let index = this.state.lithologies.findIndex((item: any) => item["lithID"] === this.state.selectedItem.lithID
            );
            if (index > 0) {
                let data = [...this.state.lithologies];
                let value = data[index - 1];
                data[index - 1] = data[index];
                data[index] = value;
                this.setState({
                    lithologies: data
                });
            }
        }
    };

    handleMoveDown = () => {

        if (this.state.lithologies.length > 0) {
            let index = this.state.lithologies.findIndex((item: any) => item.lithID === this.state.selectedItem.lithID);
            if (index < this.state.lithologies.length - 1 && index >= 0) {
                let data = [...this.state.lithologies];
                let value = data[index + 1];
                data[index + 1] = data[index];
                data[index] = value;
                this.setState({
                    lithologies: data
                });
            }
        }
    };



    render() {
        return (
            <>
                {/* style={{ height: '86vh', width: '70vw' }} */}
                <div id="mainContainer_" style={{ width: '55vw' }}>
                    <div className="row mt-3">
                        <legend>
                            <span className="float-left">  <button type="button" onClick={this.cmdSave_click} className="btn-custom btn-custom-primary mr-1">
                                Ok</button>
                                <button type="button" onClick={this.cmdCancel_click} className="btn-custom btn-custom-primary ml-1">
                                    Cancel</button>
                            </span></legend>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="row pb-3 ml-3 row-lg-12 ">
                                <div className="col mr-5 ml-3">
                                    <Grid
                                        // style={{ height: '40vh', width: '40vw' }}
                                        //data={this.state.lithologies}
                                        data={this.state.lithologies != null ? (this.state.lithologies.map((item: any) =>
                                            ({ ...item, inEdit: item.lithID === this.state.editID, selected: item.lithID === this.state.editID })
                                        )) : null}
                                        resizable={true}
                                        scrollable={"scrollable"}
                                        sortable={true}
                                        onItemChange={this.grdItemChange}
                                        onRowClick={this.grdRowClick}
                                        selectedField="selected"
                                    //editField="inEdit"
                                    >
                                        <GridToolbar>
                                            <div >
                                                <Button onClick={this.cmdAddLithologyClick}>Add</Button>
                                            </div>
                                        </GridToolbar>
                                        <Column width="100px" field="lithID" headerClassName="text-center" className="text-right" title="ID" editable={false} />
                                        <Column width="100px" field="lithType" headerClassName="text-center" className="text-right" title="Lithology Type" editor="text" editable={false} />

                                        <Column width="100px" field="Percentage" headerClassName="text-center" editor="numeric" resizable={true} className="text-right" title="Percentage" editable={true} />
                                        <Column field="Image" width="100px" title="Image" resizable={false} minResizableWidth={50} headerClassName="text-center" reorderable={false}
                                            cell={props => (
                                                <td className="text-center">
                                                    <img
                                                        style={{ width: 40, height: 20 }}
                                                        src={`data:image/jpeg;base64,${props.dataItem[props.field]}`}
                                                    />
                                                </td>)}
                                        />

                                        <Column width="100px" field="Description" headerClassName="text-center" className="text-right" title="Descripton" />


                                        <Column width="70px" headerClassName="text-center" resizable={false}

                                            field="editLitho"
                                            title="Edit"
                                            cell={props => (
                                                <td className="text-center">
                                                    <span onClick={e => this.cmdEditLithology(e, props.dataItem)}>
                                                        <FontAwesomeIcon icon={faPen} />
                                                    </span>

                                                </td>
                                            )}
                                        />
                                        <Column width="70px" headerClassName="text-center" resizable={false}
                                            field="removeIntervals"
                                            title="*"
                                            cell={props => (
                                                <td className="text-center">
                                                    <span >
                                                        {/* <span onClick={e => this.cmdRemoveLithologyIntervals(e, props.dataItem)}> */}
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </span>

                                                </td>
                                            )}
                                        />

                                    </Grid>
                                </div>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="row">
                                <div className="col">
                                    <Button onClick={this.handleMoveUp}> <FontAwesomeIcon icon={faArrowUp} /></Button>
                                </div>
                            </div>
                            <div className="row mt-5">
                                <div className="col">
                                    <Button onClick={this.handleMoveDown}><FontAwesomeIcon icon={faArrowDown} /></Button>
                                </div>
                            </div>


                        </div>

                    </div>
                </div>
                {this.state.InEditMode && <MudLithologyInlineEditor editMode={this.state.LithoInEdit.lithID == "" ? "A" : "E"} LibID={this.props.LibID} dataItem={this.state.LithoInEdit} save={this.saveInEdit} cancel={this.cancelInEdit} />}

            </>
        )
    }
    cmdAddLithologyClick = () => {
        this.setState({
            InEditMode: !this.state.InEditMode,
            LithoInEdit: new DataObjects.mudLogLithology
        });


    }
    cmdEditLithology = (event: any, dataItem: any) => {

        this.setState({
            InEditMode: !this.state.InEditMode,
            LithoInEdit: dataItem
        });

    }
    cmdSave_click = () => {

        let newData: any = Object.values([...this.state.lithologies]);
        let totalPercentage = 0;
        for (let index = 0; index < newData.length; index++) {
            const element = newData[index];
            totalPercentage += element.Percentage;
        }
        if (totalPercentage != 100) {
            alert("The total of percentages doesn't sum up to 100%. Please change the input and try again");
            // confirmAlert({
            //     //title: 'eVuMax',
            //     message: "The total of percentages doesn't sum up to 100%. Please change the input and try again",
            //    // childrenElement: () => <div />,
            //     buttons: [
            //         {
            //             label: 'Ok',
            //             onClick: () => {
            //                 //this.mudLogRef.current.focus()
            //                 return;
            //             }
            //         }]
            // });
        } else {
            this.props.updateLithologies(true, this.state.lithologies);
        }
    }

    cmdCancel_click = () => {
        this.props.updateLithologies(false, null);
    }



}//Class


