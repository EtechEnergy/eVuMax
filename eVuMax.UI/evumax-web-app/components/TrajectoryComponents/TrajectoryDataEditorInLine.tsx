import React, { Component } from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Input, DropDownList, Button, NumericTextBox } from '@progress/kendo-react-all';
import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";
import GlobalMod from "../../objects/global";


interface IProps {
    dataItem: any
    cancel: any
    save: any
}
let _gMod = new GlobalMod();


let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");



export default class TrajectoryDataEditorInLine extends Component<IProps> {
    constructor(props: any) {
        super(props);

    }

    state = {
        TrajDataInEdit: this.props.dataItem || null,
    };


    componentWillMount() {

    }
    componentDidMount() {

    }

    handleSubmit(event: any) {
        event.preventDefault();
    }


    onImageChange = (image: any) => {
        // data for submit

        let edited = this.state.TrajDataInEdit;


        this.setState({
            TrajDataInEdit: edited
        });

    };

    onDialogInputChange = (event: any) => {

        let target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.props ? target.props.name : target.name;

        const edited = this.state.TrajDataInEdit;

        if (name == 'lithType') {
            edited[name] = value.id;
            this.setState({ [name]: value });
        } else {
            edited[name] = value;
        }


        this.setState({
            TrajDataInEdit: edited
        });
    }


    save = () => {

        let edited = this.state.TrajDataInEdit;

        this.props.save(this.state.TrajDataInEdit);
    }





    render() {
        return (
            <Dialog
                onClose={this.props.cancel}
            >

                <div style={{ marginBottom: '1rem' }}>

                    <div className="row">

                        <NumericTextBox
                            width="90px"
                            name="MD"
                            value={this.state.TrajDataInEdit.MD || 0}
                            label="MD"
                            onChange={this.onDialogInputChange}
                        />

                        <div className="mr-5 ml-3" >
                            <NumericTextBox
                                width="90px"
                                name="Inclinition"
                                label="Inclinition"
                                value={this.state.TrajDataInEdit.Inclinition}
                                onChange={this.onDialogInputChange}
                            />
                        </div>
                        <div>
                            <NumericTextBox
                                width="90px"
                                name="Azimuth"
                                label="Azimuth"
                                value={this.state.TrajDataInEdit.Azimuth}
                                onChange={this.onDialogInputChange}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div>
                            <NumericTextBox
                                width="90px"
                                name="TVD"
                                label="TVD"
                                value={this.state.TrajDataInEdit.TVD}
                                onChange={this.onDialogInputChange}
                            />
                        </div>

                        <div>
                            <NumericTextBox
                                width="90px"
                                name="NS"
                                label="NS"
                                value={this.state.TrajDataInEdit.NS}
                                onChange={this.onDialogInputChange}
                            />
                        </div>

                        <div>
                            <NumericTextBox
                                width="100px"
                                name="Dogleg100"
                                label="Dogleg/100 ft"
                                value={this.state.TrajDataInEdit.Dogleg100}
                                onChange={this.onDialogInputChange}
                            />
                        </div>

                        <div>
                            <NumericTextBox
                                width="100px"
                                name="TF"
                                label="Toolface"
                                value={this.state.TrajDataInEdit.TF}
                                onChange={this.onDialogInputChange}
                            />
                        </div>

                    </div>

                    <div className="row">
                        <div>
                            <NumericTextBox
                                width="90px"
                                name="Gx"
                                label="Gx"
                                value={this.state.TrajDataInEdit.Gx}
                                onChange={this.onDialogInputChange}
                            />
                        </div>

                        <div>
                            <NumericTextBox
                                width="90px"
                                name="Gy"
                                label="Gy"
                                value={this.state.TrajDataInEdit.Gy}
                                onChange={this.onDialogInputChange}
                            />
                        </div>
                        <div>
                            <NumericTextBox
                                width="90px"
                                name="Gz"
                                label="Gz"
                                value={this.state.TrajDataInEdit.Gz}
                                onChange={this.onDialogInputChange}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div>
                            <NumericTextBox
                                width="90px"
                                name="Bx"
                                label="Bx"
                                value={this.state.TrajDataInEdit.Bx}
                                onChange={this.onDialogInputChange}
                            />
                        </div>

                        <div>
                            <NumericTextBox
                                width="90px"
                                name="By"
                                label="By"
                                value={this.state.TrajDataInEdit.By}
                                onChange={this.onDialogInputChange}
                            />
                        </div>
                        <div>
                            <NumericTextBox
                                width="90px"
                                name="Bz"
                                label="Bz"
                                value={this.state.TrajDataInEdit.Bz}
                                onChange={this.onDialogInputChange}
                            />
                        </div>
                    </div>


                    <div className="row">
                        <div>
                            <NumericTextBox
                                width="90px"
                                name="dRefGT"
                                label="dRefGT"
                                value={this.state.TrajDataInEdit.dRefGT}
                                onChange={this.onDialogInputChange}
                            />
                        </div>

                        <div>
                            <NumericTextBox
                                width="90px"
                                name="dRefBT"
                                label="dRefBT"
                                value={this.state.TrajDataInEdit.dRefBT}
                                onChange={this.onDialogInputChange}
                            />
                        </div>
                        <div>
                            <NumericTextBox
                                width="90px"
                                name="dRefDip"
                                label="dRefDip"
                                value={this.state.TrajDataInEdit.dRefDip}
                                onChange={this.onDialogInputChange}
                            />
                        </div>

                        <div>
                            <NumericTextBox
                                width="90px"
                                name="dRefDec"
                                label="dRefDec"
                                value={this.state.TrajDataInEdit.dRefDec}
                                onChange={this.onDialogInputChange}
                            />

                            <NumericTextBox
                                width="90px"
                                name="dConvg"
                                label="dConvg"
                                value={this.state.TrajDataInEdit.dConvg}
                                onChange={this.onDialogInputChange}
                            />
                        </div>
                    </div>




                </div>




                <DialogActionsBar>
                    <Button
                        onClick={this.props.cancel}
                    >
                        Cancel
                    </Button>



                    <Button
                        className="k-button k-primary"
                        onClick={this.save}
                    >
                        Save
                    </Button>
                </DialogActionsBar>
            </Dialog>
        );
    }
}


