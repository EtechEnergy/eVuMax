import React, { Component } from 'react'
import axios from "axios";

import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { TabStrip, TabStripTab, Dialog, DropDownButton, DropDownButtonItem, DropDownList, Button, DialogActionsBar } from '@progress/kendo-react-all';

import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Input, Checkbox, NumericTextBox } from "@progress/kendo-react-inputs";

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import * as DataObjects from "../../eVuMaxObjects/dataObjects/dataObjects";

import '@progress/kendo-react-layout';

import GlobalMod from "../../objects/global";

import * as utilFunc from '../../utilFunctions/utilFunctions';

import TrajectoryDataEditorInLine from './TrajectoryDataEditorInLine';
import DirectionalSurvey from "./DirectionalSurvey";


let _gMod = new GlobalMod();


let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");


export interface IProps {
    wellID: string | ""
    objTrajectory: DataObjects.Trajectory
    reloadTree: any
}

export class comboData {
    text: string = "";
    id: string = "";

    constructor(paramText: string, paramId: string) {
        this.text = paramText;
        this.id = paramId;
    }

}



export default class TrajectoryEditor extends Component<IProps> {
    objTrajectory: DataObjects.Trajectory = new DataObjects.Trajectory();
    wellID: string | undefined = this.props.wellID;
    objTrajectory_clone: DataObjects.Trajectory = new DataObjects.Trajectory();

    constructor(props: any) {
        super(props);
        this.wellID = this.props.wellID;
        this.objTrajectory = this.props.objTrajectory;
    }


    TVDCalcMethod = [
        { text: "Angle Average", id: 0 },
        { text: "Balanced Triangle", id: 1 },
        { text: "Radius Curvature", id: 2 },
        { text: "Minimum Curvature", id: 3 }
    ];

    state = {

        objTrajectory: new DataObjects.Trajectory(),
        showTrajInLineEditor: false,
        inLineTrajData: [] as any,
        showTVDCalcSelection: false,

        DepthUnitList: [] = [new comboData("Ft", "F"), new comboData("Mtr", "M")],
        DepthUnit: new comboData("Ft", "F"),
        initDepthUnit: new comboData("Ft", "F"),
        MagneticDeclination: 0,
        TVDCalcMethod: { text: "Angle Average", id: 0 },
        editID: 0,
        selected: 0,
        grdData: Object.values(this.props.objTrajectory.trajectoryData),
    };

    componentWillReceiveProps() {
        if (this.props.objTrajectory.ObjectID == this.objTrajectory.ObjectID) {
            return;
        }
        this.objTrajectory_clone = this.props.objTrajectory;
        this.objTrajectory = this.props.objTrajectory;
        this.setState({
            objTrajectory: utilFunc.CopyObject(this.objTrajectory),
            grdData: null, // Object.values(this.props.objTrajectory.trajectoryData),
        });

        this.displayData();
    }
    componentWillMount() {
        this.objTrajectory_clone = utilFunc.CopyObject(this.objTrajectory);

    }
    componentDidMount() {
        this.displayData();

    }

    displayData = () => {


        this.setState({
            editID: null,
            selected: 0,
            objTrajectory: utilFunc.CopyObject(this.objTrajectory), //22-09-2020
            grdData: null,

        });


        if (this.objTrajectory.Unit == "F") {
            this.setState({
                DepthUnit: new comboData("Ft", "F"),
                initDepthUnit: new comboData("Ft", "F"),
            });

        }

        if (this.objTrajectory.Unit == "M") {
            this.setState({
                DepthUnit: new comboData("Mtr", "M"),
                initDepthUnit: new comboData("Mtr", "M"),
            });

        }




        let newGrdData: any = Object.values(this.props.objTrajectory.trajectoryData).map((item: any, key: number) =>
            ({ ...item, SRNO: key }));


        this.setState({
            grdData: newGrdData, // Object.values(this.props.objTrajectory.trajectoryData),
        });
    }



    // handleChange = (event: any) => {
    //     this.setState({ [event.nativeEvent.target.name]: event.value });

    // };

    handleChange = (event: any, field: string) => {


        const value = event.value;
        const name = field;

        if (field == 'DepthUnit') {
            this.setState({ DepthUnit: new comboData(event.value.text, event.value.id) });
            return;
        }

        if (field == "MagneticDeclination") {
            this.setState({
                MagneticDeclination: value
            });
            return;
        }

        if (field == "TVDCalcMethod") {
            this.setState({
                TVDCalcMethod: value
            });
            return;
        }


        let edited: any = utilFunc.CopyObject(this.state.objTrajectory);
        edited[field] = value;
        this.setState({
            objTrajectory: edited
        });

    };

    OnConvertUnit_Clicked = () => {
        try {


            this.setState({
                editID: null
            });
            this.forceUpdate();

            if (this.state.DepthUnit.id == this.state.initDepthUnit.id) {
                alert("There is no change in the unit. Please change the unit from the list and try again");
                return;
            }

            let currentUnit = this.state.DepthUnit.id;
            if (this.state.initDepthUnit.id == "F" && currentUnit == "M") {
                this.changeFtToMtr();
            }

            if (this.state.initDepthUnit.id == "M" && currentUnit == "F") {
                this.changeMtrToFt();
            }

            this.setState({
                initDepthUnit: this.state.DepthUnit
            });

            this.forceUpdate();


        } catch (error) {

        }
    }


    //Tabsrip control
    handleTabSelect = (e: any) => {
        this.setState({ selected: e.selected });
    }
    //Nishant 22-09-2020
    saveInEdit = (dataItem: any) => {


        this.setState({
            InLineTrajData: null
        });
        let newData: any = Object.values([...this.state.grdData]);

        let index = newData.findIndex((item: any) => item.SRNO === dataItem.SRNO); // use unique value like ID

        newData[index] = dataItem;
        this.setState({
            grdData: newData,
            showTrajInLineEditor: false
        });

    }

    cancelInEdit = () => {
        this.setState({
            showTrajInLineEditor: false
        });

    }

    changeFtToMtr = () => {
        try {


            let MD: number = 0;
            let i: number = 0;
            let grdNewData = this.state.grdData;

            for (let index = 0; index < grdNewData.length - 2; index++) {
                const element = grdNewData[index];
                MD = Number(element.MD);
                MD = (MD / 3.28084);
                MD = Number(MD.toFixed(3));
                grdNewData[index].MD = MD;
            }

            this.setState({
                grdData: grdNewData,

            });
            this.showCalculateTVDDialog();
            //this.calculateTVD();
            this.calculatePartial();
        }
        catch (ex /*:Exception*/) {

        }

    }

    changeMtrToFt = () => {
        try {


            let MD: number = 0;
            let i: number = 0;
            let grdNewData = this.state.grdData;

            for (let index = 0; index < grdNewData.length - 2; index++) {
                const element = grdNewData[index];
                MD = Number(element.MD);
                MD = (MD * 3.28084);
                MD = Number(MD.toFixed(3));
                grdNewData[index].MD = MD;
            }

            this.setState({
                grdData: grdNewData,
            });
            this.showCalculateTVDDialog();
            //this.calculateTVD();
            this.calculatePartial();
        }
        catch (ex /*:Exception*/) {

        }

    }


    calculatePartial = () => {
        try {
            let vertSection: number = eval(this.state.objTrajectory.azimuthVertSect);
            let grdNewData = this.state.grdData;



            for (let i: number = 0; (i <= (grdNewData.length - 2)); i++) {

                let NS: number = eval(eval(grdNewData[i].NS));
                let EW: number = eval(eval(grdNewData[i].EW));
                let Closure: number = Number(Math.pow((Math.pow(NS, 2)) + (Math.pow(EW, 2)), 0.5).toFixed(5)); //  Number(Math.round(Math.pow((Math.pow(NS,2)) + (Math.pow(EW, 2)),0.5)).toFixed(5));

                let Departure: number = Number(Number(NS * Math.cos(vertSection * Math.PI / 180) + EW * Math.sin(vertSection * Math.PI / 180)).toFixed(5));
                if (isNaN(Closure) || Closure == Infinity || Closure == -Infinity) {
                    Closure = 0;
                }

                if (isNaN(Departure) || Departure == Infinity || Departure == -Infinity) {
                    Departure = 0;
                }

                grdNewData[i].Closure = Closure;
                grdNewData[i].Departure = Number(Departure).toFixed(3);
            }

            this.setState({
                grdData: grdNewData,
            });
            this.calculateWalkRatesPartial();
        }
        catch (ex) {
        }

    }

    public calculateWalkRatesPartial = () => {
        try {
            let AzimuthA: number = 0;
            let AzimuthB: number = 0;
            let MDA: number = 0;
            let MDB: number = 0;
            let IncA: number = 0;
            let IncB: number = 0;
            let WalkRate: number = 0;
            let BuildRate: number = 0;

            let grdNewData = this.state.grdData;


            for (let i: number = 1; (i
                <= (grdNewData.length - 2)); i++) {
                AzimuthA = eval(eval(grdNewData[(i - 1)].Azimuth));
                AzimuthB = eval(eval(grdNewData[i].Azimuth));
                MDA = eval(eval(grdNewData[(i - 1)].MD));
                MDB = eval(eval(grdNewData[i].MD));
                IncA = eval(eval(grdNewData[(i - 1)].Inclinition));
                IncB = eval(eval(grdNewData[i].Inclinition));
                if (((MDB - MDA) == 0)) {
                    WalkRate = 0;
                    BuildRate = 0;
                }
                else {
                    if (((AzimuthA > 270) && (AzimuthB < 90))) {
                        WalkRate = (100 / (MDB - MDA)) * ((360 - AzimuthA) + AzimuthB);
                    }
                    else if (((AzimuthA < 90) && (AzimuthB > 270))) {
                        WalkRate = (100 / (MDB - MDA)) * (AzimuthB - (AzimuthA + 360));
                    }
                    else {
                        WalkRate = (100 / (MDB - MDA)) * (AzimuthB - AzimuthA);
                    }

                    BuildRate = (100 / (MDB - MDA)) * (IncB - IncA);
                }

                WalkRate = Number(Math.round(WalkRate).toFixed(2));
                BuildRate = Number(Math.round(BuildRate).toFixed(2));
                grdNewData[i].WalkRate = WalkRate;
                grdNewData[i].BuildRate = BuildRate;
            }


            this.setState({
                grdData: grdNewData,
            });

        }
        catch (ex /*:System.Exception*/) {
        }

    }

    showCalculateTVDDialog = () => {
        try {
            this.setState({
                showTVDCalcSelection: true
            });


        } catch (error) {

        }
    }

    calculateTVD = () => {
        try {

            let method = 0; //AngleAverage
            let magneticDeclination: number = 0;
            // let objDialog: frmTVDCalcSelection = new frmTVDCalcSelection();
            //objDialog.ShowDialog();
            // if(this.state.showTVDCalcSelection) { //not Cancelled then calculate TVD
            method = Number(this.state.TVDCalcMethod.id); // data.selectedMethod;
            magneticDeclination = Number(this.state.MagneticDeclination);
            let objSurvey: DirectionalSurvey = new DirectionalSurvey();
            let NumPoints: number = (this.state.grdData.length - 2);
            if ((NumPoints > 0)) {
                let arrDepth: number[] = [NumPoints];
                let arrAzimuth: number[] = [NumPoints];
                let arrInclination: number[] = [NumPoints];
                let arrTVD: number[] = [NumPoints];

                let grdData: any = this.state.grdData;

                for (let i: number = 0; (i <= (grdData.length - 2)); i++) {
                    arrDepth[i] = eval(grdData[i].MD);
                    arrAzimuth[i] = eval(grdData[i].Azimuth);
                    arrInclination[i] = eval(grdData[i].Inclinition);
                }

                let returnValue: any = { avDirectionDepth: [] as number[], avDirectionDirection: [] as number[], avDirectionalInclination: [] as number[], avTVD: [] as number[] };

                returnValue = objSurvey.ComputeDirectional(magneticDeclination, method, NumPoints, arrDepth, arrAzimuth, arrInclination, arrTVD);

                if (returnValue != null) {
                    //Value send as byref as arrDepth, arrAzimuth, arrInclination, arrTVD
                    //returnValue object=>  avDirectionDepth:number[] , avDirectionDirection:number[],avDirectionalInclination: number[], avTVD:number[]

                    arrDepth = returnValue.avDirectionDepth;
                    arrAzimuth = returnValue.avDirectionDirection;
                    arrInclination = returnValue.avDirectionalInclination;
                    arrTVD = returnValue.avTVD;

                    for (let i: number = 0; (i <= NumPoints); i++) {
                        grdData[i].TVD = Number(Number(arrTVD[i]).toFixed(2));
                    }

                    let C138: number;
                    let C139: number;
                    let D138: number;
                    let D139: number;
                    let E139: number;
                    let dls: number;
                    // C138 = Prior survey point Inclination
                    // C139 = New survey Inclination
                    // D138 = Prior survey Azimuth
                    // D139 = New survey azimuth
                    // E139 = New survey measured depth - prior survey measured depth
                    // 'Now Apply Dog Leg Equation to TVD Data
                    for (let i: number = 2; (i <= (grdData.length - 2)); i++) {
                        C138 = grdData[(i - 1)].Inclinition;
                        C139 = grdData[i].Inclinition;
                        D138 = grdData[(i - 1)].Azimuth;
                        D139 = grdData[i].Azimuth;
                        E139 = grdData[i].MD;
                        dls = this.getDogLegValue(C138, C139, D138, D139, E139);

                        if (isNaN(dls)) {
                            dls = 0;
                        }
                        grdData[i].DogLeg = dls.toFixed(5);
                    }

                    this.setState({
                        grdData: grdData
                    });
                    this.forceUpdate();


                    this.calculateDogLeg();
                    this.calculateDeltaLatitudeNS();
                    this.calculateDeltaLongitudeEW();
                }
            }


            this.setState({
                showTVDCalcSelection: false
            });
            //}


        }
        catch (ex) {

        }
    }


    calculateDeltaLongitudeEW = () => {
        try {
            let grdNewData = this.state.grdData;


            for (let i: number = 1; (i <= (grdNewData.length - 2)); i++) {
                let E12: number = (eval(grdNewData[i].MD) - eval(grdNewData[(i - 1)].MD)); // 'Current Depth - Previous Depth
                let C12: number = eval(grdNewData[i].Inclinition)                          // 'Inclination
                let D12: number = eval(grdNewData[i].Azimuth);                             // 'Azimuth
                let C11: number = eval(grdNewData[(i - 1)].Inclinition);                   // 'Previous Inclination
                let D11: number = eval(grdNewData[(i - 1)].Azimuth);                       // 'Previous Azimuth

                // 'Calculate S12
                let R12: number = eval(grdNewData[i].Dogleg);
                let S12: number = (R12 == 0) ? 1 : 360 * (1 - Math.cos(R12 * Math.PI / 180)) / R12 / Math.PI / Math.sin(R12 * Math.PI / 180);

                let DeltaEW: number = E12 * S12 / 2 * (Math.sin(C12 * Math.PI / 180) * Math.sin(D12 * Math.PI / 180) + Math.sin(C11 * Math.PI / 180) * Math.sin(D11 * Math.PI / 180));

                DeltaEW = E12 * S12 / 2 * (Math.sin(C12 * Math.PI / 180) * Math.sin(D12 * Math.PI / 180) + Math.sin(C11 * Math.PI / 180) * Math.sin(D11 * Math.PI / 180));


                if (isNaN(DeltaEW) || DeltaEW == -Infinity || DeltaEW == Infinity) {
                    DeltaEW = 0;
                }

                grdNewData[i].EW = Number(eval(grdNewData[(i - 1)].EW) + DeltaEW).toFixed(2);

            } //for loop

            this.setState({
                grdData: grdNewData
            });

        }
        catch (ex) {

        }

    }


    calculateDeltaLatitudeNS = () => {
        try {

            let grdNewData = this.state.grdData;

            for (let i: number = 1; (i <= (grdNewData.length - 2)); i++) {
                let E12: number = (eval(grdNewData[i].MD) - eval(grdNewData[(i - 1)].MD));      // 'Current Depth - Previous Depth
                let C12: number = eval(grdNewData[i].Inclinition);                              // 'Inclination
                let D12: number = eval(grdNewData[i].Azimuth);                                  // 'Azimuth
                let C11: number = eval(grdNewData[(i - 1)].Inclinition);                        // 'Previous Inclination
                let D11: number = eval(grdNewData[(i - 1)].Azimuth);                            // 'Previous Azimuth

                // 'Calculate S12
                let R12: number = eval(grdNewData[i].Dogleg);
                let S12: number = (R12 == 0) ? 1 : 360 * (1 - Math.cos(R12 * Math.PI / 180)) / R12 / Math.PI / Math.sin(R12 * Math.PI / 180);

                let DeltaNS: number = E12 * S12 / 2 * (Math.sin(C12 * Math.PI / 180) * Math.cos(D12 * Math.PI / 180) + Math.sin(C11 * Math.PI / 180) * Math.cos(D11 * Math.PI / 180));

                if (isNaN(DeltaNS) || DeltaNS == -Infinity || DeltaNS == Infinity) { //Nishant 260-09-2020
                    DeltaNS = 0;
                }

                grdNewData[i].NS = Number(eval(grdNewData[(i - 1)].NS) + DeltaNS).toFixed(2);

            }
            this.setState({
                grdData: grdNewData
            });

            this.forceUpdate();


        } catch (ex) {

        }
    }




    calculateDogLeg = () => {
        try {
            let grdNewData = this.state.grdData;
            for (let i: number = 1; (i
                <= (grdNewData.length - 2)); i++) {
                let PrevInc: number = eval(grdNewData[(i - 1)].Inclinition);  // 'Previous Inclination
                let Inc: number = eval(grdNewData[i].Inclinition);            // 'Inclination
                let PrevAz: number = eval(grdNewData[(i - 1)].Azimuth);       // 'Previous Azimuth
                let Az: number = eval(grdNewData[i].Azimuth)                  // 'Azimuth
                let PrevMD: number = eval(grdNewData[(i - 1)].MD);            // 'Previous Inclination
                let MD: number = eval(grdNewData[i].MD);                      // 'Previous Inclination
                let dogLeg2: number = (100 / (MD - PrevMD)) * Math.acos((Math.cos(PrevInc * Math.PI / 180) * Math.cos(Inc * Math.PI / 180)) + (Math.sin(PrevInc * Math.PI / 180) * Math.sin(Inc * Math.PI / 180) * Math.cos((Az - PrevAz) * Math.PI / 180))) * (180 / Math.PI);
                // VB                 (100 / (MD - PrevMD)) * Math.Acos((Math.Cos(PrevInc * Math.PI / 180) * Math.Cos(Inc * Math.PI / 180)) + (Math.Sin(PrevInc * Math.PI / 180) * Math.Sin(Inc * Math.PI / 180) * Math.Cos((Az - PrevAz) * Math.PI / 180))) * (180 / Math.PI)
                let currentUnit: string = this.state.DepthUnit.id;
                if ((currentUnit == "M")) {
                    //dogLeg2 = ((30  / (MD - PrevMD)) * (Math.acos(((Math.cos((PrevInc   * (Math.PI / 180))) * Math.cos((Inc     * (Math.PI / 180))))   + (Math.sin((PrevInc * (Math.PI / 180))) * (Math.sin((Inc* (Math.PI / 180))) * Math.cos(((Az - PrevAz)* (Math.PI / 180))))))) * (180 / Math.PI)));
                    dogLeg2 = (30 / (MD - PrevMD)) * Math.acos((Math.cos(PrevInc * Math.PI / 180) * Math.cos(Inc * Math.PI / 180)) + (Math.sin(PrevInc * Math.PI / 180) * Math.sin(Inc * Math.PI / 180) * Math.cos((Az - PrevAz) * Math.PI / 180))) * (180 / Math.PI);
                }

                if (isNaN(dogLeg2)) {
                    dogLeg2 = 0;
                }

                grdNewData[i].Dogleg = Number(dogLeg2).toFixed(3);
            }

            this.setState({
                grdData: grdNewData
            });
            this.forceUpdate();



        }
        catch (ex) {
        }

    }

    getDogLegValue(C138: number, C139: number, D138: number, D139: number, E139: number) {
        try {

            return ((Math.acos((Math.sin(C138 * 3.14 / 180) * Math.sin(C139 * 3.14 / 180)) * (Math.sin(D138 * 3.14 / 180) * Math.sin(D139 * 3.14 / 180) + Math.cos(D138 * 3.14 / 180) * Math.cos(D139 * 3.14 / 180)) + (Math.cos(C138 * 3.14 / 180) * Math.cos(C139 * 3.14 / 180)))) * 100 / E139) * 180 / 3.14;


            // return ((Math.acos((((Math.sin((C138 * (3.14 / 180))) * Math.sin((C139 * (3.14 / 180))))
            //     * ((Math.sin((D138 * (3.14 / 180))) * Math.sin((D139 * (3.14 / 180))))
            //         + (Math.cos((D138 * (3.14 / 180))) * Math.cos((D139 * (3.14 / 180))))))
            //     + (Math.cos((C138 * (3.14 / 180))) * Math.cos((C139 * (3.14 / 180)))))) * (100 / E139)) * (180 / 3.14));
        }

        catch (ex /*:System.Exception*/) {
            return 0;
        }

    }
    //*********************** */
    render() {

        const disableColumns = {
            backgroundColor: "black !important",
        };
        return (
            <>

                <div id="mainContainer_" style={{ height: '86vh', width: '70vw' }}>
                    <div className="row" style={{ position: "sticky", top: "0", padding: "10px" }} >
                        <h2>Trajectory Editor</h2>
                    </div>

                    <div className="row">
                        <legend>
                            <span className="float-left mr-1" >  <button hidden type="button" onClick={this.cmdSave_click} className="btn-custom btn-custom-primary ml-1 mr-1">
                                Save</button>
                                <button type="button" onClick={this.cmdCancel_click} className="btn-custom btn-custom-primary ml-1">
                                    Cancel</button>
                            </span></legend>
                    </div>
                    <div className="row" >
                        <div id="mainContainer" style={{ minWidth: "100%" }}>
                            <TabStrip selected={this.state.selected} onSelect={this.handleTabSelect} keepTabsMounted={true}>
                                {/* <TabStrip selected={this.state.selected} onSelect={this.handleSelect} > */}
                                <TabStripTab title="Header">
                                    <div id="tabTrajHeader">
                                        {/*  */}
                                        <div className="row">
                                            {/* Col-1 of Row 1 */}
                                            <div className="col-md-6 col-lg-6 col-xl-6 col-xs-12">
                                                <div className="row pb-3 ml-3 row-lg-12 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="ObjectID"
                                                            // style={{ width: "100%" }}
                                                            label="Object ID"
                                                            pattern={"[A-Za-z]+"}
                                                            minLength={2}
                                                            required={true}
                                                            value={this.state.objTrajectory.ObjectID}
                                                            onChange={(e) => this.handleChange(e, "ObjectID")}
                                                            readOnly={true}
                                                        />

                                                    </div>
                                                </div>

                                                <div className="row pb-3 ml-3 row-lg-12 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="name"
                                                            // style={{ width: "100%" }}
                                                            label="Name"
                                                            minLength={2}
                                                            value={this.state.objTrajectory.name}
                                                            onChange={(e) => this.handleChange(e, "name")}
                                                        />
                                                    </div>
                                                </div>



                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="StartTime"
                                                            label="Start Time"
                                                            value={this.state.objTrajectory.StartTime}
                                                            onChange={(e) => this.handleChange(e, "StartTime")}
                                                        />

                                                    </div>

                                                </div>
                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="EndTime"
                                                            label="End Time"
                                                            value={this.state.objTrajectory.EndTime}
                                                            onChange={(e) => this.handleChange(e, "EndTime")}

                                                        />
                                                    </div>

                                                </div>

                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="mdMax"
                                                            label="Max MD"
                                                            value={this.state.objTrajectory.mdMax}
                                                            onChange={(e) => this.handleChange(e, "mdMax")}
                                                        />


                                                    </div>
                                                </div>

                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="mdMin"
                                                            label="Min MD"
                                                            value={this.state.objTrajectory.mdMin}
                                                            onChange={(e) => this.handleChange(e, "mdMin")}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="ServiceCompany"
                                                            label="Service Company"
                                                            value={this.state.objTrajectory.ServiceCompany}
                                                            onChange={(e) => this.handleChange(e, "ServiceCompany")}
                                                        />
                                                    </div>
                                                </div>


                                            </div>
                                            {/* Col-2 of Row-1 */}

                                            <div className="col-md-6 col-lg-6 col-xl-6 col-xs-12">
                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="gridCorUsed"
                                                            label="grid Cor Used"
                                                            value={this.state.objTrajectory.gridCorUsed}
                                                            onChange={(e) => this.handleChange(e, "gridCorUsed")}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="azimuthVertSect"

                                                            label="Azi. Vert. Sec."
                                                            minLength={2}
                                                            value={this.state.objTrajectory.azimuthVertSect}
                                                            onChange={(e) => this.handleChange(e, "aximuthVertSect")}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="NSVertSectOrig"
                                                            label="NS Vert. Sec."
                                                            value={this.state.objTrajectory.NSVertSectOrig}
                                                            onChange={(e) => this.handleChange(e, "NSVertSectOrig")}
                                                        />

                                                    </div>
                                                </div>

                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="EWVertSectOrig"
                                                            label="EW Vert. Sec."
                                                            minLength={2}
                                                            value={this.state.objTrajectory.EWVertSectOrig}
                                                            onChange={(e) => this.handleChange(e, "EWVertSectOrig")}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="AzimuthRef"
                                                            label="Azimuth Ref."
                                                            value={this.state.objTrajectory.AzimuthRef}
                                                            onChange={(e) => this.handleChange(e, "AzimuthRef")}
                                                        />
                                                    </div>

                                                </div>

                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Input
                                                            name="magneticDeclinition"
                                                            label="Mag. Declination"
                                                            minLength={2}
                                                            value={this.state.objTrajectory.magneticDeclinition}
                                                            onChange={(e) => this.handleChange(e, "magneticDeclinition")}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row pb-3 ml-3 ls-10" style={{ width: '60vw' }}>
                                                    <div className="col mr-5 ml-3">
                                                        <Checkbox
                                                            name="IsPrimaryActive"
                                                            label='Is Primary Active Trajectory'
                                                            checked={this.state.objTrajectory.IsPrimaryActive}
                                                            value={this.state.objTrajectory.IsPrimaryActive}
                                                            onChange={(e) => this.handleChange(e, "IsPrimaryActive")}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row pb-3 ml-3 ">
                                                    <div className="col mr-5 ml-3">
                                                        <Checkbox
                                                            name="PlannedTrajectory"
                                                            label='Is Active Plan Trajectory'
                                                            checked={this.state.objTrajectory.PlannedTrajectory}
                                                            value={this.state.objTrajectory.PlannedTrajectory}
                                                            onChange={(e) => this.handleChange(e, "PlannedTrajectory")}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                </TabStripTab>
                                {/* <TabStripTab title="Parameters">
                                    <div id="tabWellInfo2">
                                        <div className="row ml-2">
                                        </div>
                                    </div>
                                </TabStripTab> */}
                                <TabStripTab title="Data">
                                    <div>
                                        <div className="row">
                                            <Grid
                                                // style={{ height: '60vh', width: '80vw' , position:'sticky'}}
                                                // style={{ height: '60vh' }}
                                                style={{ height: "60vh", width: '70vw' }}

                                                data={this.state.grdData != null ? (this.state.grdData.map((item: any) =>
                                                    ({ ...item, inEdit: item.SRNO === this.state.editID })
                                                )) : null}
                                                resizable={true}
                                                scrollable={"scrollable"}
                                                sortable={true}
                                                onItemChange={this.grdItemChange}
                                                onRowClick={this.grdRowClick}
                                                editField="inEdit"
                                                selectedField="inEdit"
                                            >
                                                <GridToolbar>
                                                    <span>
                                                        <span style={{ marginRight: 20 }} >
                                                            <DropDownButton icon="more-vertical" text="Calculate"
                                                                onItemClick={(e) => this.onCalculateMenuItemClicked(e)}
                                                            >
                                                                <DropDownButtonItem text="Calculate TVD" />
                                                                <DropDownButtonItem text="Calculate Vertical Section" />
                                                                <DropDownButtonItem text="Calculate NS-EW" />
                                                                <DropDownButtonItem text="Calculate Traj. QC" />
                                                            </DropDownButton>
                                                        </span>

                                                        <DropDownList
                                                            name="DepthUnit"
                                                            label='Depth Unit'
                                                            data={this.state.DepthUnitList}
                                                            textField="text"
                                                            dataItemKey="id"
                                                            value={this.state.DepthUnit}
                                                            style={{ width: 100 }}
                                                            onChange={(e) => this.handleChange(e, "DepthUnit")}
                                                        />

                                                        <Button disabled={this.state.objTrajectory.DoNotConvertUnit} onClick={this.OnConvertUnit_Clicked}  >Convert Unit</Button>


                                                        <span style={{ marginLeft: 20 }} >
                                                            <Checkbox
                                                                name="DoNotConvertUnit"
                                                                label='Do not convert unit'
                                                                checked={this.state.objTrajectory.DoNotConvertUnit}
                                                                value={this.state.objTrajectory.DoNotConvertUnit}
                                                                onChange={(e) => this.handleChange(e, "DoNotConvertUnit")}
                                                            />
                                                        </span>

                                                    </span>
                                                </GridToolbar>
                                                {/* <Column width="100px" field="SRNO" headerClassName="text-center" className="text-right" title="SrNo" editor="numeric" editable={true} /> */}
                                                {/* <Column width="70px" headerClassName="text-center" resizable={false}
                                                    field="editTrajData"
                                                    title="*"
                                                    cell={props => (
                                                        <td className="text-center">
                                                            <span onClick={e => this.cmdEditTrajDataRow(e, props.dataItem)}>
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </span>

                                                        </td>
                                                    )}
                                                /> */}


                                                <Column width="100px" field="MD" headerClassName="text-center" className="text-right" title="MD" editor="numeric" editable={true} />
                                                <Column width="100px" field="Inclinition" headerClassName="text-center" editor="numeric" resizable={true} className="text-right" title="Inclination" editable={true} />
                                                <Column width="70px" field="Azimuth" headerClassName="text-center" className="text-right" title="Azimuth" editor="numeric" editable={true} />
                                                <Column width="100px" field="TVD" headerClassName="text-center" className="text-right disableColumns" title="TVD" editor="numeric" editable={true} />
                                                <Column width="70px" field="NS" headerClassName="text-center" className="text-right" title="NS" editor="numeric" editable={true} />
                                                <Column width="70px" field="EW" headerClassName="text-center" className="text-right" title="EW" editor="numeric" editable={true} />
                                                <Column width="100px" field="Dogleg" headerClassName="text-center" className="text-right" title="Dogleg/100 ft." editable={true} editor="numeric" />
                                                <Column width="70px" field="Closure" headerClassName="text-center" className="text-right" title="Closure" editable={false} />

                                                <Column width="70px" field="Departure" headerClassName="text-center" className="text-right" title="VS" editable={false} />
                                                <Column width="70px" field="TF" headerClassName="text-center" className="text-right" title="Toolface" editor="numeric" editable={false} />

                                                <Column width="70px" field="WalkRate" headerClassName="text-center" className="text-right" title="Walk Rate" editable={false} />
                                                <Column width="100px" field="BuildRate" headerClassName="text-center" className="text-right" title="Build Rate" editable={false} />
                                                <Column width="70px" field="Gx" headerClassName="text-center" className="text-center" title="Gx" editor="numeric" />
                                                <Column width="70px" field="Gy" headerClassName="text-center" className="text-center" title="Gy" editor="numeric" />
                                                <Column width="70px" field="Gz" headerClassName="text-center" className="text-center" title="Gz" editor="numeric" />

                                                <Column width="70px" field="Bx" headerClassName="text-center" className="text-center" title="Bx" editor="numeric" />
                                                <Column width="70px" field="By" headerClassName="text-center" className="text-center" title="By" editor="numeric" />
                                                <Column width="70px" field="Bz" headerClassName="text-center" className="text-center" title="Bz" editor="numeric" />

                                                <Column width="70px" field="dRefGT" headerClassName="text-center" className="text-center" title="dRefGT" editable={true} />
                                                <Column width="70px" field="dRefBT" headerClassName="text-center" className="text-center" title="dRefBT" editor="numeric" editable={true} />
                                                <Column width="70px" field="dRefDip" headerClassName="text-center" className="text-center" title="dRefDip" editable={false} />
                                                <Column width="70px" field="dRefDec" headerClassName="text-center" className="text-center" title="dRefDec" editor="numeric" editable={true} />
                                                <Column width="70px" field="dConvg" headerClassName="text-center" className="text-center" title="dConvg" editor="numeric" editable={true} />

                                                <Column width="70px" field="MDs" headerClassName="text-center" className="text-center" title="MDs" editable={false} />

                                                <Column width="70px" field="Incs" headerClassName="text-center" className="text-center" title="Incs" editable={false} />
                                                <Column width="70px" field="Azims" headerClassName="text-center" className="text-center" title="Azims" editable={false} />

                                                <Column width="70px" field="Gxs" headerClassName="text-center" className="text-center" title="Gxs" editable={false} />
                                                <Column width="70px" field="Gys" headerClassName="text-center" className="text-center" title="Gys" editable={false} />
                                                <Column width="70px" field="Gzs" headerClassName="text-center" className="text-center" title="Gzs" editable={false} />

                                                <Column width="70px" field="Bxs" headerClassName="text-center" className="text-center" title="Bxs" editable={false} />
                                                <Column width="70px" field="Bys" headerClassName="text-center" className="text-center" title="Bys" editable={false} />
                                                <Column width="70px" field="Bzs" headerClassName="text-center" className="text-center" title="Bzs" editable={false} />

                                                <Column width="70px" field="GT" headerClassName="text-center" className="text-center" title="GT" editable={false} />
                                                <Column width="70px" field="Inc" headerClassName="text-center" className="text-center" title="Inc" editable={false} />

                                                <Column width="70px" field="IncGz" headerClassName="text-center" className="text-center" title="IncGz" editable={false} />
                                                <Column width="70px" field="IncGoxy" headerClassName="text-center" className="text-center" title="IncGoxy" editable={false} />

                                                <Column width="70px" field="Boxy" headerClassName="text-center" className="text-center" title="Boxy" editable={false} />
                                                <Column width="70px" field="BTot" headerClassName="text-center" className="text-center" title="BTot" editable={false} />

                                                <Column width="70px" field="mDip" headerClassName="text-center" className="text-center" title="mDip" editable={false} />
                                                <Column width="70px" field="mAzim" headerClassName="text-center" className="text-center" title="mAzim" editable={false} />

                                                <Column width="70px" field="BH" headerClassName="text-center" className="text-center" title="BH" editable={false} />
                                                <Column width="70px" field="BV" headerClassName="text-center" className="text-center" title="BV" editable={false} />

                                                <Column width="70px" field="hsTF" headerClassName="text-center" className="text-center" title="hsTF" editable={false} />
                                                <Column width="70px" field="Bhs" headerClassName="text-center" className="text-center" title="Bhs" editable={false} />

                                                <Column width="70px" field="Br" headerClassName="text-center" className="text-center" title="Br" editable={false} />
                                                <Column width="70px" field="Bhsh" headerClassName="text-center" className="text-center" title="Bhsh" editable={false} />

                                                <Column width="70px" field="refGT" headerClassName="text-center" className="text-center" title="refGT" editable={false} />
                                                <Column width="70px" field="refBT" headerClassName="text-center" className="text-center" title="refBT" editable={false} />
                                                <Column width="70px" field="refDip" headerClassName="text-center" className="text-center" title="refDip" editable={false} />
                                                <Column width="70px" field="refDec" headerClassName="text-center" className="text-center" title="refDec" editable={false} />
                                                <Column width="70px" field="gridConv" headerClassName="text-center" className="text-center" title="gridConv" editable={false} />
                                                <Column width="70px" field="totalCorr" headerClassName="text-center" className="text-center" title="totalCorr" editable={false} />
                                                <Column width="70px" field="dGT" headerClassName="text-center" className="text-center" title="dGT" editable={false} />
                                                <Column width="70px" field="dBT" headerClassName="text-center" className="text-center" title="dBT" editable={false} />
                                                <Column width="70px" field="dBH" headerClassName="text-center" className="text-center" title="dBH" editable={false} />
                                                <Column width="70px" field="dBV" headerClassName="text-center" className="text-center" title="dBV" editable={false} />
                                                <Column width="70px" field="dDip" headerClassName="text-center" className="text-center" title="dDip" editable={false} />
                                                <Column width="70px" field="BTD" headerClassName="text-center" className="text-center" title="BTD" editable={false} />
                                                <Column width="70px" field="BTD2" headerClassName="text-center" className="text-center" title="BTD2" editable={false} />
                                                <Column width="70px" field="magTFI" headerClassName="text-center" className="text-center" title="magTFI" editable={false} />
                                                <Column width="70px" field="dTF" headerClassName="text-center" className="text-center" title="dTF" editable={false} />
                                                <Column width="70px" field="tnAzim" headerClassName="text-center" className="text-center" title="tnAzim" editable={false} />
                                                <Column width="70px" field="grAzim" headerClassName="text-center" className="text-center" title="grAzim" editable={false} />
                                                <Column width="70px" field="dInc" headerClassName="text-center" className="text-center" title="dInc" editable={false} />
                                                <Column width="70px" field="dAzim" headerClassName="text-center" className="text-center" title="dAzim" editable={false} />
                                                {false && (<Column width="70px" field="GTStatus" headerClassName="text-center" className="text-center" title="GTStatus" editable={false} />)}
                                                <Column width="70px" headerClassName="text-center" resizable={false} locked
                                                    field="removeTrajData"
                                                    title="*"
                                                    cell={props => (
                                                        // <td className="text-center k-command-cell"  >
                                                        <td style={props.style} className={"text-center k-command-cell " + props.className}>
                                                            <span onClick={e => this.cmdRemoveTrajDataRow(e, props.dataItem)}>
                                                                {/* <span onClick={e => this.cmdRemoveTrajDataRow(e, props)}> */}
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </span>

                                                        </td>
                                                    )}
                                                />
                                            </Grid>
                                        </div>
                                    </div>
                                </TabStripTab>
                            </TabStrip>
                        </div>
                    </div>
                </div >


                {this.state.showTrajInLineEditor && (
                    //style={{ height: '100%', width: '500px', top: 0, left: 0 }}
                    <Dialog title={"Trajectory Data Editor"}
                        onClose={(e: any) => {
                            this.setState({
                                showTrajInLineEditor: false
                            })
                        }}
                    // modal={true}
                    >
                        <div className="row" >
                            <div className="col-9">
                                <TrajectoryDataEditorInLine save={this.saveInEdit} cancel={this.cancelInEdit} dataItem={this.state.inLineTrajData}  ></TrajectoryDataEditorInLine>
                            </div>

                        </div>

                    </Dialog>
                )}

                {/* Calculate TVD Dialog */}
                {this.state.showTVDCalcSelection && (
                    //style={{ height: '100%', width: '500px', top: 0, left: 0 }}
                    <Dialog title={"Select the Calculation Method for TVD"}
                        onClose={(e: any) => {
                            this.setState({
                                showTVDCalcSelection: false
                            });
                        }}
                    >
                        <div className="row" >
                            <div className="col-9">
                                <DropDownList data={this.TVDCalcMethod}
                                    value={this.state.TVDCalcMethod}
                                    textField="text"
                                    onChange={(e) => this.handleChange(e, "TVDCalcMethod")}
                                />

                                <Input
                                    name="MagneticDeclination"
                                    style={{ width: "100%" }}
                                    label="Magnetic Declination"
                                    minLength={2}
                                    value={this.state.MagneticDeclination}
                                    onChange={(e) => this.handleChange(e, "MagneticDeclination")}
                                />

                            </div>

                        </div>

                        <DialogActionsBar>
                            <Button
                                onClick={(e: any) => {
                                    this.setState({
                                        showTVDCalcSelection: false
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="k-button k-primary"
                                onClick={this.calculateTVD}

                            >
                                Ok
                            </Button>
                        </DialogActionsBar>

                    </Dialog>
                )}







            </>
        )
    }

    //function
    cmdSave_click = () => {


        // this.objTrajectory.name = this.state.name;
        // this.objTrajectory.StartTime = this.state.StartTime;
        // this.objTrajectory.EndTime = this.state.EndTime;
        // this.objTrajectory.mdMax = this.state.mdMax;
        // this.objTrajectory.mdMin = this.state.mdMin;
        // this.objTrajectory.ServiceCompany = this.state.serviceCompany;
        // this.objTrajectory.magneticDeclinition = this.state.magneticDeclinition;
        // this.objTrajectory.gridCorUsed = this.state.gridCorUsed;
        // this.objTrajectory.azimuthVertSect = this.state.azimuthVertSect;
        // this.objTrajectory.NSVertSectOrig = this.state.NSVertSectOrig;
        // this.objTrajectory.EWVertSectOrig = this.state.EWVertSectOrig;
        // this.objTrajectory.AzimuthRef = this.state.AzimuthRef;
        // this.objTrajectory.IsPrimaryActive = this.state.IsPrimaryActive;
        // this.objTrajectory.PlannedTrajectory = this.state.PlannedTrajectory;
        // this.objTrajectory.SFMD = this.state.SFMD;
        // this.objTrajectory.SFInclination = this.state.SFInclination;
        // this.objTrajectory.SFAzimuth = this.state.SFAzimuth;
        // this.objTrajectory.SFGx = this.state.SFGx;
        // this.objTrajectory.SFGy = this.state.SFGy;
        // this.objTrajectory.SFGz = this.state.SFGz;
        // this.objTrajectory.SFBx = this.state.SFBx;
        // this.objTrajectory.SFBy = this.state.SFBy;
        // this.objTrajectory.SFBz = this.state.SFBz;
        // this.objTrajectory.BSMD = this.state.BSMD;


        // this.objTrajectory.BSInclination = this.state.BSInclination;
        // this.objTrajectory.BSAzimuth = this.state.BSAzimuth;
        // this.objTrajectory.BSGx = this.state.BSGx;
        // this.objTrajectory.BSGy = this.state.BSGy;
        // this.objTrajectory.BSGz = this.state.BSGz;
        // this.objTrajectory.BSBx = this.state.BSBx;
        // this.objTrajectory.BSBy = this.state.BSBy;
        // this.objTrajectory.BSBz = this.state.BSBz;

        // this.objTrajectory.RefValueGT = this.state.RefValueGT;
        // this.objTrajectory.RefValueBTot = this.state.RefValueBTot;
        // this.objTrajectory.RefValuemDip = this.state.RefValuemDip;
        // this.objTrajectory.RefValueBH = this.state.RefValueBH;
        // this.objTrajectory.RefValueBV = this.state.RefValueBV;

        // this.objTrajectory.LimitGT = this.state.LimitGT;
        // this.objTrajectory.LimitBTot = this.state.LimitBTot;
        // this.objTrajectory.LimitmDip = this.state.LimitmDip;

        // this.objTrajectory.LimitBH = this.state.LimitBH;
        // this.objTrajectory.LimitBV = this.state.LimitBV;
        // this.objTrajectory.RunRefGTotal = this.state.RunRefGTotal;
        // this.objTrajectory.RunRefBTotal = this.state.RunRefBTotal;
        // this.objTrajectory.SiteGridConvg = this.state.SiteGridConvg;
        // this.objTrajectory.RunRefMagDip = this.state.RunRefMagDip;
        // this.objTrajectory.RunRefDec = this.state.RunRefDec;

        // this.objTrajectory.RefValuerefGT = this.state.RefValuerefGT;
        // this.objTrajectory.RefValuerefBT = this.state.RefValuerefBT;
        // this.objTrajectory.RefValuerefDip = this.state.RefValuerefDip;
        // this.objTrajectory.RefValuerefDec = this.state.RefValuerefDec;
        // this.objTrajectory.RefValuegridConvg = this.state.RefValuegridConvg;
        // this.objTrajectory.LimitrefGT = this.state.LimitrefGT;
        // this.objTrajectory.LimitrefBT = this.state.LimitrefBT;
        // this.objTrajectory.LimitrefDip = this.state.LimitrefDip;
        // this.objTrajectory.LimitrefDec = this.state.LimitrefDec;
        // this.objTrajectory.LimitgridConvg = this.state.LimitgridConvg;

        // this.objTrajectory.RefValuedGT = this.state.RefValuedGT;
        // this.objTrajectory.RefValuedBT = this.state.RefValuedBT;
        // this.objTrajectory.RefValuedBH = this.state.RefValuedBH;
        // this.objTrajectory.RefValuedBV = this.state.RefValuedBV;
        // this.objTrajectory.RefValuedDip = this.state.RefValuedDip;
        // this.objTrajectory.RefValueBTD = this.state.RefValueBTD;
        // this.objTrajectory.RefValueBTD2 = this.state.RefValueBTD2;
        // this.objTrajectory.LimitdGT = this.state.LimitdGT;
        // this.objTrajectory.LimitdBT = this.state.LimitdBT;
        // this.objTrajectory.LimitdBH = this.state.LimitdBH;
        // this.objTrajectory.LimitdBV = this.state.LimitdBV;
        // this.objTrajectory.LimitdDip = this.state.LimitdDip;
        // this.objTrajectory.LimitBTD = this.state.LimitBTD;
        // this.objTrajectory.LimitBTD2 = this.state.LimitBTD2;
        // this.objTrajectory.DoNotConvertUnit = this.state.doNotConvertUnit;


        let newGrdChannelsString = JSON.stringify(this.state.grdData);
        let newGrdChannels: any = [];
        newGrdChannels = JSON.parse(newGrdChannelsString);
        newGrdChannels.forEach((object: any) => delete object.SRNO); // deleting the Extra Column from the channel List

        this.state.objTrajectory.trajectoryData = utilFunc.convertMapToDictionaryJSON(this.state.grdData);


        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "Well.Data.Objects";
        objBrokerRequest.Function = "UpdateTrajectory";
        objBrokerRequest.Broker = "WellObjectManager";

        objParameter = new BrokerParameter('UserName', _gMod._userId);

        objBrokerRequest.Parameters.push(objParameter);


        objParameter = new BrokerParameter('Update', JSON.stringify(this.state.objTrajectory));
        objBrokerRequest.Parameters.push(objParameter);



        axios.post(_gMod._performTask, {
            paramRequest: JSON.stringify(objBrokerRequest),
        })
            .then(function (response) {
                this.props.reloadTree("showTrajectoryEditor", false); //Nishant 24-09-2020
            })
            .catch(function (error) {
                console.log(error);
            });






    }

    cmdCancel_click = () => {
        this.props.reloadTree("showTrajectoryEditor", true);

    }
    onCalculateMenuItemClicked = (e: any) => {



        if (e.itemIndex == 0) {
            this.showCalculateTVDDialog();
            // this.calculateTVD();
        }



        if (e.itemIndex == 1) {
            this.calculatePartial();
        }

        if (e.itemIndex == 2) {
            this.calculateDeltaLatitudeNS();
            this.calculateDeltaLongitudeEW();
        }

        if (e.itemIndex == 3) {
            //Apply()
            //Trajectory.calculateAdvancedTraj(objTrajectory)
            // this.displayData()

            let newGrdChannelsString = JSON.stringify(this.state.grdData);
            let newGrdChannels: any = [];
            newGrdChannels = JSON.parse(newGrdChannelsString);
            newGrdChannels.forEach((object: any) => delete object.SRNO); // deleting the Extra Column from the channel List

            this.state.objTrajectory.trajectoryData = utilFunc.convertMapToDictionaryJSON(this.state.grdData);


            objBrokerRequest = new BrokerRequest();
            objBrokerRequest.Module = "Well.Data.Objects";
            objBrokerRequest.Function = "calculateTrajQC";
            objBrokerRequest.Broker = "WellObjectManager";

            objParameter = new BrokerParameter('UserName', _gMod._userId);

            objBrokerRequest.Parameters.push(objParameter);


            objParameter = new BrokerParameter('CalculateTrajQC', JSON.stringify(this.state.objTrajectory));
            objBrokerRequest.Parameters.push(objParameter);

            axios.post(_gMod._performTask, {
                paramRequest: JSON.stringify(objBrokerRequest),

            }).then((response) => {

                //load Trajectory again


                objBrokerRequest = new BrokerRequest();
                objBrokerRequest.Module = "Well.Data.Objects";
                objBrokerRequest.Broker = "WellObjectManager";

                objParameter = new BrokerParameter('UserName', _gMod._userId);
                objBrokerRequest.Parameters.push(objParameter);


                objParameter = new BrokerParameter('wellID', this.state.objTrajectory.WellID);
                objBrokerRequest.Parameters.push(objParameter);


                if (this.state.objTrajectory.PlannedTrajectory) {
                    objBrokerRequest.Function = "loadPlanTrajectory";
                } else {
                    objBrokerRequest.Function = "loadActualTrajectory";
                }

                axios.get(_gMod._getData, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    params: { paramRequest: JSON.stringify(objBrokerRequest) },

                }).then((response) => {

                    //set trajectory to state object
                    let objTrajectory = JSON.parse(response.data.Response);;
                    if (objTrajectory != null) {
                        this.setState({
                            grdData: Object.values(objTrajectory.trajectoryData)
                        });
                        this.forceUpdate();
                    }
                }).catch((error) => {
                    console.log(error);
                });

            }).catch((error) => {
                console.log(error);
            });
        }

    }
    grdItemChange = (e: any) => {
        //code for inLine Editing...

        //
        e.dataItem[e.field] = e.value;
        this.setState({
            grdChannels: [...this.state.grdData]
        });

        let newData: any = Object.values([...this.state.grdData]);
        let index = newData.findIndex((item: any) => item.SRNO === e.dataItem.SRNO); // use unique value like ID
        newData[index][e.field] = e.value;
        this.setState({ grdChannels: newData })

    };

    grdRowClick = (event: any) => {
        this.setState({
            editID: event.dataItem.SRNO
        });
    };

    cmdEditTrajDataRow = (event: any, rowData: any) => {

        this.setState({
            editID: rowData.SRNO
        });

        // this.setState({
        //     inLineTrajData: rowData
        // });

        // this.setState({
        //     showTrajInLineEditor: !this.state.showTrajInLineEditor
        // });

    }


    cmdRemoveTrajDataRow = (event: any, rowData: any) => {


        confirmAlert({
            //title: 'eVuMax',
            message: 'Are you sure you want to remove?',
            childrenElement: () => <div />,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        let trajData = this.state.grdData;
                        let objRow = rowData;
                        let srNo = objRow.SR_NO;
                        let index = trajData.findIndex(d => d.SR_NO === srNo); //find index in your array
                        trajData.splice(index, 1);//remove element from array
                        this.setState({
                            grdChannels: trajData
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

    handleChangeDropDown = (event: any) => {

        this.setState({ [event.target.name]: event.value });

        if (event.target.name == "DepthUnitList") {
            this.setState({ DepthUnit: new comboData(event.value.text, event.value.id) });
        }

    }






}

