import React, { Component } from 'react'
import { TimeLog, DepthLog, Trajectory } from '../../eVuMaxObjects/dataObjects/dataObjects'
import { comboData } from '../../eVuMaxObjects/UIObjects/comboData'
import { ComboBox, Button, Input } from '@progress/kendo-react-all'
import ListItem from '@progress/kendo-react-dropdowns/dist/npm/common/ListItem';

interface IProps {
    objTimeLog: TimeLog
    objDepthLog?: DepthLog
    objTractory?: Trajectory //prath
    expressionText: string
    expType?: string
}

export default class ExpressionEditor extends Component<IProps> {
    constructor(parentRef, props: any) {
        super(props);
        this.__parentRef = parentRef;

        this.state = ({
            lstColumns: [] as comboData[],
            expressionText: this.props.expressionText
        });


        this.Initialize();

    }

    __parentRef: any;

    state = ({
        lstColumns: [] as comboData[],
        expressionText: this.props.expressionText
    });



    Initialize = () => {
        if (this.props.objTimeLog != null) {
            let logCurvesList = Object.values(this.props.objTimeLog.logCurves);

            let newCurveList: any = [];
            for (let index = 0; index < logCurvesList.length; index++) {
                const objCurve = logCurvesList[index];
                newCurveList.push(new comboData(objCurve.curveDescription, objCurve.mnemonic));
            }
            this.setState({
                lstColumns: newCurveList
            });
        }

        if (this.props.objDepthLog != null) {
            let logCurvesList = Object.values(this.props.objDepthLog.logCurves);

            let newCurveList: any = [];
            for (let index = 0; index < logCurvesList.length; index++) {
                const objCurve = logCurvesList[index];
                newCurveList.push(new comboData(objCurve.curveDescription, objCurve.mnemonic));
            }
            this.setState({
                lstColumns: newCurveList
            });
        }

        if (this.props.objDepthLog == null && this.props.objTimeLog == null) {

            //Add default columns
            let newCurveList: any = [];
            newCurveList.push(new comboData("Rig State Number", "RIGS_TATE"))
            newCurveList.push(new comboData("Circulation", "CIRC"))
            newCurveList.push(new comboData("Date & Time", "DATETIME"))
            newCurveList.push(new comboData("Measured Depth", "DEPTH"))
            newCurveList.push(new comboData("Hole Depth", "HDTH"))
            newCurveList.push(new comboData("RPM", "RPM"))
            newCurveList.push(new comboData("Pump Pressure", "SPPA"))
            newCurveList.push(new comboData("Block Position", "BPOS"))
            newCurveList.push(new comboData("Weight On Bit", "SWOB"))
            newCurveList.push(new comboData("Mud Weight In", "MWIN"))
            newCurveList.push(new comboData("TVD", "TVD"))
            newCurveList.push(new comboData("Hole TVD", "HTVD"))
            newCurveList.push(new comboData("RHOB", "RHOB"))
            newCurveList.push(new comboData("Surface Torque", "STOR"))

            this.setState({
                lstColumns: newCurveList
            });
        }
    }

    handleChange = (event: any, field: string) => {
        let value = event.value;
        this.setState({
            expressionText: value
        });
    }

    save = () => {
        
        if (this.props.expType==""){
            this.__parentRef.saveExpression(this.state.expressionText);
        }else{
            this.__parentRef.saveExpression(this.state.expressionText, this.props.expType);
        }
        
    }

    close = ()=>{
        this.__parentRef.closeExpression();
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col">
                        <Input
                            name="expressionText"
                            label="Expression"
                            value={this.state.expressionText}
                            onChange={(e) => this.handleChange(e, "expressionText")}
                        />


                    </div>
                    <div className="col">


                    </div>
                </div>


                <div className="row">
                    <div className="col">

                    </div>
                    <div className="col">

                    </div>
                </div>


                <div className="row">
                    <div className="col">
                        <Button>
                            Verify
                        </Button>

                    </div>
                    <div className="col">
                        <Button onClick={this.save} >
                            Ok
                        </Button>
                    </div>
                    <div className="col">
                        <Button onClick={this.close}>
                            Cancel
                        </Button>
                    </div>


                </div>

            </div>
        )
    }
}


