import React, { Component } from "react";

import { Chart, lineStyle, curveStyle } from "../../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../../eVuMaxObjects/Chart/ChartData";

import {
    DataSeries,
    dataSeriesType,
} from "../../../eVuMaxObjects/Chart/DataSeries";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import "@progress/kendo-react-intl";
import { ComboBox } from "@progress/kendo-react-dropdowns";
import "react-router-dom";

import BrokerRequest from "../../../broker/BrokerRequest";
import BrokerParameter from "../../../broker/BrokerParameter";
import axios from "axios";
import "../../Common/DataSelector.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faCogs, faTrash } from "@fortawesome/free-solid-svg-icons";

import { DateTimePicker, Dialog, Grid, GridToolbar, Label, GridColumn as Column } from "@progress/kendo-react-all";
import { RadioButton, NumericTextBox, Checkbox } from "@progress/kendo-react-inputs";

import GlobalMod from "../../../objects/global";
import { Util } from "../../../Models/eVuMax";
import DataSelector_ from "../../Common/DataSelector_";
import * as utilFunc from '../../../utilFunctions/utilFunctions';
import { confirmAlert } from "react-confirm-alert";
import DataSelectorInfo from "../../Common/DataSelectorInfo";
import WellSelector from "../../wellSelector/WellSelector";

let _gMod = new GlobalMod();

interface IProps { }


interface IProps {
    objDataSelector: DataSelector_;
    selectionChanged: any;
    wellID: string;
}
//=============
//Nishant 24-07-2020
class grdOffsetWell {
    WellID: string = "";
    WellUWI: string = "";
    WellName: string = "";
}


class CustomDrlgSummaryDataSelector extends Component<IProps> {

    anchor: any = React.createRef();
    onClick = () => {
        this.setState({ show: !this.state.show });
    }
    constructor(props: any) {
        super(props);
        this.__parentRef = props;
        this.WellId = this.props.wellID;


    }
    state = {
        selectedTab: 0,
        selectedval: "-1",
        objDataSelector: this.props.objDataSelector,
        Warning: "",
        showWarning: false,
        show: false,
        showSettings: false,
        selectedSettingsTab: 0,
        showWellSelector: false,
        grdOffsetWells: [] as grdOffsetWell[],
    };
    //=========================

    WellId: string = "";
    Mnemonic: string = "DEPTH";

    objChart: Chart;
    objLine: DataSeries;

    selectedTab: number = 0;

    __parentRef: any;

    //Initialize chart after component was mounted
    componentDidMount() {
        try {
            //Prepare chart object
            //initialize chart
          

            this.objChart = new Chart(this, "SelectorChart");
            this.objChart.ContainerId = "selector_chart";
            this.objChart.isZoomByRect = false; //No need to zoom

            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().setInitialRange();
            this.objChart.leftAxis().Inverted = true;
            this.objChart.leftAxis().ShowLabels = false;
            this.objChart.leftAxis().ShowTitle = false;
            this.objChart.leftAxis().Title = "MD";
            this.objChart.leftAxis().Visible = true;
            this.objChart.leftAxis().isAllowScrolling = false;
            this.objChart.leftAxis().PaddingMin = 0;
            this.objChart.leftAxis().PaddingMax = 0;

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().IsDateTime = true;
            this.objChart.bottomAxis().setInitialRange();
            this.objChart.bottomAxis().Title = "Date Time";
            this.objChart.bottomAxis().ShowLabels = false;
            this.objChart.bottomAxis().ShowTitle = false;
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowSelector = true;
            this.objChart.bottomAxis().Visible = true;
            this.objChart.bottomAxis().isAllowScrolling = false;
            this.objChart.bottomAxis().PaddingMin = 0;
            this.objChart.bottomAxis().PaddingMax = 0;

            this.objChart.rightAxis().Visible = false;
            this.objChart.rightAxis().isAllowScrolling = false;
            this.objChart.rightAxis().ShowLabels = false;
            this.objChart.CrossHairRequire = false;

            this.objChart.MarginLeft = 0;
            this.objChart.MarginBottom = 0;
            this.objChart.MarginTop = 0;
            this.objChart.MarginRight = 0;

            this.objLine = new DataSeries();
            this.objLine.Id = "s" + this.getRandomNumber(100000, 999999).toString();
            this.objLine.Name = "Depth";
            this.objLine.XAxisId = this.objChart.bottomAxis().Id;
            this.objLine.YAxisId = this.objChart.leftAxis().Id;
            this.objLine.Type = dataSeriesType.Line;
            this.objLine.Title = "Measured Depth";
            this.objLine.Color = "#1762ad";
            this.objLine.LineStyle = lineStyle.solid;
            this.objLine.LineWidth = 2;
            this.objLine.ColorEach = true;
            this.objLine.CurveStyle = curveStyle.smooth;

            this.objChart.DataSeries.set(this.objLine.Id, this.objLine);

            this.objChart.initialize();


            this.objChart.reDraw();


            let objDataSelector: DataSelector_ = new DataSelector_();
            objDataSelector = this.props.objDataSelector;

            objDataSelector.fromDate = null;
            objDataSelector.toDate = null;

            this.setState({
                objDataSelector: objDataSelector
            });






            this.loadData();
            this.loadExtents();  //work in progress
            window.addEventListener("resize", this.reRenderChart);
        } catch (error) { }
    }


    //Nishant
    refreshChart() {
        try {

            //Prepare chart object
            //initialize chart
            this.objChart = new Chart(this, "SelectorChart");
            this.objChart.ContainerId = "selector_chart";
            this.objChart.isZoomByRect = false; //No need to zoom

            this.objChart.leftAxis().AutoScale = true;
            this.objChart.leftAxis().setInitialRange();
            this.objChart.leftAxis().Inverted = true;
            this.objChart.leftAxis().ShowLabels = false;
            this.objChart.leftAxis().ShowTitle = false;
            this.objChart.leftAxis().Title = "MD";
            this.objChart.leftAxis().Visible = true;
            this.objChart.leftAxis().isAllowScrolling = false;
            this.objChart.leftAxis().PaddingMin = 0;
            this.objChart.leftAxis().PaddingMax = 0;

            this.objChart.bottomAxis().AutoScale = true;
            this.objChart.bottomAxis().IsDateTime = true;
            this.objChart.bottomAxis().setInitialRange();
            this.objChart.bottomAxis().Title = "Date Time";
            this.objChart.bottomAxis().ShowLabels = false;
            this.objChart.bottomAxis().ShowTitle = false;
            this.objChart.bottomAxis().LabelAngel = 90;
            this.objChart.bottomAxis().ShowSelector = true;
            this.objChart.bottomAxis().Visible = true;
            this.objChart.bottomAxis().isAllowScrolling = false;
            this.objChart.bottomAxis().PaddingMin = 0;
            this.objChart.bottomAxis().PaddingMax = 0;

            this.objChart.rightAxis().Visible = false;
            this.objChart.rightAxis().isAllowScrolling = false;
            this.objChart.rightAxis().ShowLabels = false;
            this.objChart.CrossHairRequire = false;

            this.objChart.MarginLeft = 0;
            this.objChart.MarginBottom = 0;
            this.objChart.MarginTop = 0;
            this.objChart.MarginRight = 0;

            this.objLine = new DataSeries();
            this.objLine.Id = "s" + this.getRandomNumber(100000, 999999).toString();
            this.objLine.Name = "Depth";
            this.objLine.XAxisId = this.objChart.bottomAxis().Id;
            this.objLine.YAxisId = this.objChart.leftAxis().Id;
            this.objLine.Type = dataSeriesType.Line;
            this.objLine.Title = "Measured Depth";
            this.objLine.Color = "#1762ad";
            this.objLine.LineStyle = lineStyle.solid;
            this.objLine.LineWidth = 2;
            this.objLine.ColorEach = true;
            this.objLine.CurveStyle = curveStyle.smooth;

            this.objChart.DataSeries.set(this.objLine.Id, this.objLine);

            this.objChart.initialize();


            this.objChart.reDraw();

        } catch (error) {

        }
    }


    reRenderChart = () => {
        try {
            this.forceUpdate();
        } catch (error) { }
    };


    selectorChanged = async (ptype: string, pfromdate: Date, ptodate: Date, pfromdepth: number, ptodepth: number, pApplyRefreshHrs?: boolean) => {
        try {


            let objDataSelector: DataSelector_ = new DataSelector_();
            objDataSelector.selectedval = ptype;
            objDataSelector.fromDate =  new Date(pfromdate);
            objDataSelector.toDate = new Date(ptodate);
            objDataSelector.fromDepth = pfromdepth;
            objDataSelector.toDepth = ptodepth;
            objDataSelector.refreshHrs = this.state.objDataSelector.refreshHrs;


            await this.setState({ objDataSelector: objDataSelector })


            this.props.selectionChanged(this.state.objDataSelector, false);

        } catch (error) { }
    };



    getRandomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    setSelectedVal = (e: string) => {
        try {
            this.setState({ selectedval: e });
        } catch (error) { }
    };


    handleChange = (event: any, field: string) => {

        const value = event.value;
        const name = field; // target.props ? target.props.name : target.name;
        let edited: any = utilFunc.CopyObject(this.state.objDataSelector);


        edited[field] = value;

        this.setState({
            objDataSelector: edited
        });

    };

   

    handleTabSelectSettings = (e: any) => {
        this.setState({ selectedSettingsTab: e.selected });
    };

    Settings_Click = () => {
        try {
            this.setState({ showSettings: true });
        } catch (error) {

        }

    }

    addOffsetWells = (paramWellList: any) => {
        try {

            if (paramWellList == false) {
                //do nothing

            }
            this.setState({
                showWellSelector: !this.state.showWellSelector
            });

            // if (paramWellList.length > 0) {
            //     let offsetWellList = this.state.OffsetWells;
            //     //new code
            //     let grdOffsetWellList = this.state.grdOffsetWells;

            //     //[{ OFFSET_WELL_ID: "", OFFSET_WELL_UWI: "", WELL_NAME: "" }],
            //     for (let i = 0; i < paramWellList.length; i++) {


            //         let wellID = paramWellList[i].split("~")[0];
            //         let wellName = paramWellList[i].split("~")[1];

            //         let index = this.state.OffsetWells.findIndex(x => x.OFFSET_WELL_ID === wellID);

            //         if (index < 0) {
            //             //New code:
            //             let objgrdOffsetWell: grdOffsetWell = new grdOffsetWell();
            //             objgrdOffsetWell.WellID = wellID;
            //             objgrdOffsetWell.WellUWI = "";
            //             objgrdOffsetWell.WellName = wellName;
            //             grdOffsetWellList.push(objgrdOffsetWell);
            //         }
            //     }
            //     this.setState({ OffsetWells: offsetWellList });
            //     //New code
            //     this.setState({ grdOffsetWells: grdOffsetWellList });
            // }

        } catch (error) {

        }
    }

    render() {

        return (
            <>
                {/* <React.Fragment> */}

                {/* <div style={{ height: "100px", display: "flex" }}> */}
                <div className="row" style={{ height: "100px" }}>

                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-sd-12 col-xs-12">
                                <FontAwesomeIcon icon={faCogs} style={{ width: "20px", height: "20px" }} onClick={this.Settings_Click} />
                                <div
                                    id="chart"
                                    style={{
                                        height: "90px",
                                        //width: "calc(100% - 90px)",
                                        //width: "calc(100vw - 220px)",
                                        width: "80vw",

                                        display: "inline-block",
                                        float: "right",
                                    }}
                                >
                                </div>

                                <div
                                    id="selector_chart"
                                    style={{
                                        //height: "100%",
                                        height: "90px",
                                        flex: 1,
                                        //width: "70%",
                                        // padding: "10px",
                                    }}
                                >

                                </div>
                            </div>
                        </div>
                    </div>



                </div>
                {/* </React.Fragment > */}

                {this.state.showSettings && <Dialog
                    title={"Dataselector Settings"}
                    height="500px"
                    width="900px"
                    onClose={(e: any) => {
                        this.setState({
                            showSettings: !this.state.showSettings
                        });
                    }}
                >
                    <div>
                        <TabStrip
                            selected={this.state.selectedSettingsTab}
                            onSelect={this.handleTabSelectSettings}
                            keepTabsMounted={true}
                            tabPosition="top"
                        >
                            {/* <TabStripTab title= {<><label>Data Range</label><FontAwesomeIcon icon={faIndent} style={{ width: "20px", height: "20px" }} /></>}> */}
                            <TabStripTab title="Data Range">

                                <div className="row">
                                    <div className="col-lg-12">
                                        <RadioButton
                                            name="selectionby"
                                            value="0"
                                            checked={this.state.objDataSelector.selectedval === "0"}
                                            label="Select Data By DateTime"

                                            onChange={(e) => this.handleChange(e, "selectedval")}
                                        />

                                        <RadioButton
                                            name="selectionby"
                                            value="1"
                                            checked={this.state.objDataSelector.selectedval === "1"}
                                            label="Select Data By Depth"

                                            onChange={(e) => this.handleChange(e, "selectedval")}
                                        />

                                        <RadioButton
                                            name="selectionby"
                                            value="2"
                                            checked={this.state.objDataSelector.selectedval === "2"}
                                            label="Select Data Last Hrs"

                                            onChange={(e) => this.handleChange(e, "selectedval")}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                this.selectorChanged(this.state.objDataSelector.selectedval, this.state.objDataSelector.fromDate
                                                    , this.state.objDataSelector.toDate, this.state.objDataSelector.fromDepth, this.state.objDataSelector.toDepth);
                                                this.setState({
                                                    showSettings: false
                                                });

                                            }
                                            }
                                            className="btn-custom btn-custom-primary ml-5 mr-1"
                                        >
                                            Apply
                                        </button>
                                    </div>

                                </div>

                                <div className="row mt-2">
                                    <div className="col-lg-12">
                                        {this.state.objDataSelector.selectedval == "0" ? (
                                            <label className="mr-4">From Date </label>
                                        ) : (
                                            ""
                                        )}

                                        {this.state.objDataSelector.selectedval == "0" ? (
                                            <DateTimePicker
                                                name="txtFromDate"
                                                value={new Date(this.state.objDataSelector.fromDate)}
                                                format="MM/dd/yyyy HH:mm:ss"
                                                formatPlaceholder={{
                                                    year: "yyyy",
                                                    month: "MM",
                                                    day: "dd",
                                                    hour: "HH",
                                                    minute: "mm",
                                                    second: "ss",
                                                }}

                                                onChange={(e) => this.handleChange(e, "fromDate")}
                                            />
                                        ) : (
                                            ""
                                        )}

                                        {this.state.objDataSelector.selectedval == "0" ? (
                                            <label className="mr-4 ml-4">To Date </label>
                                        ) : (
                                            ""
                                        )}

                                        {this.state.objDataSelector.selectedval == "0" ? (
                                            <DateTimePicker
                                                name="txtToDate"
                                                value={new Date(this.state.objDataSelector.toDate)}
                                                format="MM/dd/yyyy HH:mm:ss"
                                                formatPlaceholder={{
                                                    year: "yyyy",
                                                    month: "MM",
                                                    day: "dd",
                                                    hour: "HH",
                                                    minute: "mm",
                                                    second: "ss",
                                                }}
                                                onChange={(e) => this.handleChange(e, "toDate")}
                                            />
                                        ) : (
                                            ""
                                        )}

                                        {this.state.objDataSelector.selectedval == "1" ? (
                                            <label className="mr-2">From Depth </label>
                                        ) : (
                                            ""
                                        )}

                                        {this.state.objDataSelector.selectedval == "1" ? (
                                            <NumericTextBox
                                                name="txtFromDepth"
                                                value={this.state.objDataSelector.fromDepth}
                                                format="n2"
                                                width="100px"
                                                onChange={(e) => this.handleChange(e, "fromDepth")}
                                            />
                                        ) : (
                                            ""
                                        )}

                                        {this.state.objDataSelector.selectedval == "1" ? (
                                            <label className="mr-2 ml-4">To Depth </label>
                                        ) : (
                                            ""
                                        )}

                                        {this.state.objDataSelector.selectedval == "1" ? (
                                            <NumericTextBox
                                                name="txtToDepth"
                                                value={this.state.objDataSelector.toDepth}
                                                format="n2"
                                                width="100px"
                                                onChange={(e) => this.handleChange(e, "toDepth")}
                                            />
                                        ) : (
                                            ""
                                        )}


                                        {this.state.objDataSelector.selectedval == "2" ? (<Label className="mr-3" >Last</Label>) : ("")}
                                        {this.state.objDataSelector.selectedval == "2" ? (<ComboBox style={{ width: "100px" }} data={[1, 3, 12, 24, 48]} allowCustom={true}
                                            value={this.state.objDataSelector.refreshHrs}
                                            onChange={(e) => this.handleChange(e, "refreshHrs")} />) : ("")}
                                        {this.state.objDataSelector.selectedval == "2" ? (<Label className="mr-3 ml-3" >Hrs</Label>) : ("")}


                                    </div>
                                    {/* <div className="row mt-3">
                    <div className="col">
                      <Checkbox
                        id={"chkMatchDepthFormationTops"}
                        className="col-lg-4 col-xl-3 col-md-4 col-sm-4"
                        value={this.state.objDataSelector.matchDepthByTops}
                        onChange={(e) => this.handleChange(e, "matchDepthByTops")}
                        label="Match Depth By Formation Tops"
                      />
                    </div>
                  </div> */}

                                </div>
                            </TabStripTab>
                            <TabStripTab title="Down Sampling">
                                <div className="row">
                                    <Label className="mr-3 ml-3" >No. of Data points per ft.</Label>
                                    <NumericTextBox
                                        name="txtFromDepth"
                                        value={this.state.objDataSelector.fromDepth}
                                        format="n2"
                                        width="100px"
                                        onChange={(e) => this.handleChange(e, "fromDepth")}
                                    />
                                </div>
                            </TabStripTab>

                            <TabStripTab title="offset Wells">
                                <div className="row">
                                    <Label className="mr-3 ml-3" >Select offset wells to include in this summary</Label>
                                    <div className="row ml-4">
                                        <Grid
                                            style={{ height: '50vh', width: '30vw' }}
                                            data={this.state.grdOffsetWells}
                                            resizable={true}
                                            scrollable={"scrollable"}
                                            sortable={true}
                                            editField="inEdit"
                                        >
                                            <GridToolbar>
                                                <legend>
                                                {/* onClick={this.cmdAddOffsetWell_click} */}
                                                    <span className="float-left mr-1" >  <button type="button"  className="btn-custom btn-custom-primary ml-1 mr-1">
                                                        Add</button>
                                                    </span></legend>
                                            </GridToolbar>
                                            <Column field="WellName" headerClassName="text-center" className="text-left" title="Well Name" />
                                            <Column width="70px" headerClassName="text-center" resizable={false}
                                                field="removeOffsetWell"
                                                title="*"
                                                cell={props => (
                                                    <td className="text-center">
                                                        {/* onClick={e =>this.cmdRemoveOffsetWell(e, props.dataItem)} */}
                                                        <span >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </span>

                                                    </td>
                                                )}
                                            />
                                        </Grid>
                                    </div>

                                    <div className="row">
                                        <div className="col">
                                            {this.state.showWellSelector && (

                                                <Dialog title={"eVuMax"} onClose={() => this.setState({ showWellSelector: false })}
                                                    width={800} height={600}
                                                >
                                                    < WellSelector getSelectedWells={this.addOffsetWells} getWithWellName={true}></WellSelector>
                                                </Dialog>)
                                            }
                                        </div>

                                    </div>
                                </div>
                            </TabStripTab>

                            {/* <TabStripTab title={<FontAwesomeIcon icon={faClock} style={{ width: "20px", height: "20px" }} />}>
              
                <Label>Real Time Refresh Rate</Label>
                <br />
                <Label className="mr-3" >Last</Label>
                <ComboBox style={{ width: "100px" }} data={[1, 3, 12, 24, 48]} allowCustom={true}
                  value={this.state.objDataSelector.refreshHrs}
              
                  onChange={(e) => this.handleChange(e, "refreshHrs")}

                />
                <Label className="mr-3 ml-3" >Hrs</Label>
                <button
                  type="button"
              
                  onClick={() => {
              
                    this.selectorChanged(this.state.objDataSelector.selectedval, this.state.objDataSelector.fromDate
                      , this.state.objDataSelector.toDate, this.state.objDataSelector.fromDepth, this.state.objDataSelector.toDepth, true);
                    this.setState({
                      showSettings: false
                    });
                  }}
                  className="btn-custom btn-custom-primary ml-5 mr-1"
                >
                  Apply
                </button>

                
              </TabStripTab> */}
                        </TabStrip>

                    </div>

                </Dialog>}
            </>
        );
    }

    setData = (paramData: any) => {
        try {

            //Populate the data series with this data
            this.objLine.Data.slice(0, this.objLine.Data.length);
            if (paramData.length == 0 || paramData.length == undefined || paramData.length == null) {
                this.setState({
                    Warning: "No data available for dataselector",
                    showWarning: true
                });

                // if (this.state.Warnings.trim() != "") {
                //$("#warning").css("backgroundColor", "#ffb74d");

            } else {
                this.setState({
                    Warning: "",
                    showWarning: false
                });
                //$("#warning").css("backgroundColor", "transparent");
                //$("#lblWarning").text("");
            }


            for (let i = 0; i < paramData.length; i++) {
                let objVal: ChartData = new ChartData();
                objVal.datetime = new Date(Date.parse(paramData[i]["DATETIME1"]));
                objVal.y = Number(paramData[i]["DEPTH"]);
                objVal.color = paramData[i]["COLOR"]; //prath 26-11-2020
                //objVal.color = paramData[i]["RIG_STATE_COLOR"]; //prath 02-02-2021

                this.objLine.Data.push(objVal);
            }

            this.objChart.updateChart();
        } catch (error) { }
    };

    loadData = () => {
        try {

            Util.StatusInfo("Getting data from the server  ");
            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Common";
            objBrokerRequest.Broker = "TimeData";
            objBrokerRequest.Function = "TimeDataAll";

            let paramwellId: BrokerParameter = new BrokerParameter(
                "WellId",
                this.WellId
            );



            //PRATH 26-11-2020
            // let paramChannelList: BrokerParameter = new BrokerParameter(
            //   "ChannelList",
            //   "DATETIME,DEPTH"
            // );

            let paramChannelList: BrokerParameter = new BrokerParameter(
                "ChannelList",
                "DATETIME,DEPTH,RIG_STATE_COLOR"
            );
            //=========================
            let paramResolution: BrokerParameter = new BrokerParameter(
                "Resolution",
                "4000"
            );

            objBrokerRequest.Parameters.push(paramwellId);
            objBrokerRequest.Parameters.push(paramChannelList);
            objBrokerRequest.Parameters.push(paramResolution);

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
                    this.setData(objData);
                    Util.StatusSuccess("Data successfully retrived DataSelector ");
                    Util.StatusReady();

                })
                .catch((error) => {
                    Util.StatusError(error.message);
                    Util.StatusReady();

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
                });
        } catch (error) { }
    };

    loadExtents = () => {
        try {
            //Check if it  is required to load the extents


            if (this.state.objDataSelector.fromDate != null) {
                //We already extracted extents, no need to repeat

                this.objChart.setSelectorDateRange(  new Date(this.state.objDataSelector.fromDate),  new Date( this.state.objDataSelector.toDate)
                );
                return;
            }

            Util.StatusInfo("Getting data from the server  ");

            let objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Common";
            objBrokerRequest.Broker = "TimeData";
            objBrokerRequest.Function = "TimeDataExtents";

            let paramwellId: BrokerParameter = new BrokerParameter(
                "WellId",
                this.WellId
            );

            objBrokerRequest.Parameters.push(paramwellId);

            axios
                .get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },
                })
                .then((res) => {
                    let objData = JSON.parse(res.data.Response);

                    //set the state

                    // this.setState({
                    //   fromDate: new Date(objData.MinDate),
                    //   toDate: new Date(objData.MaxDate),
                    //   fromDepth: Number.parseFloat(objData.MinDepth),
                    //   toDepth: Number.parseFloat(objData.MaxDepth),
                    // });


                    //Nishant


                    // let minDate = new Date(objData.MaxDate);
                    // minDate.setHours(minDate.getHours() - this.state.objDataSelector.refreshHrs);
                    let objNewObjDataSelector = new DataSelector_();
                    objNewObjDataSelector = this.props.objDataSelector;
                    // objNewObjDataSelector.fromDate = new Date(objData.MinDate);
                    // objNewObjDataSelector.toDate = new Date(objData.MaxDate);
                    objNewObjDataSelector.fromDepth = objData.MinDepth;
                    objNewObjDataSelector.toDepth = objData.MaxDepth;
                    objNewObjDataSelector.refreshHrs = this.props.objDataSelector.refreshHrs;


                    this.setState({
                        objDataSelector: objNewObjDataSelector
                    });




                    this.setData(objData);
                    Util.StatusSuccess("Data successfully retrived  ");
                    Util.StatusReady();
                })
                .catch((error) => {
                    Util.StatusError(error.message);
                    Util.StatusReady();

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
                });
        } catch (error) { }
    };
}

export default CustomDrlgSummaryDataSelector;
