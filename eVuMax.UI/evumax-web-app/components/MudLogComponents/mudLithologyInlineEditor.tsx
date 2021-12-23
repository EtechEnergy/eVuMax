import React, { Component } from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Input, DropDownList, Button, NumericTextBox } from '@progress/kendo-react-all';
import BrokerRequest from '../../broker/BrokerRequest';
import BrokerParameter from "../../broker/BrokerParameter";
import GlobalMod from "../../objects/global";
import axios from "axios";
import { comboData } from "../../eVuMaxObjects/UIObjects/comboData";
import { Guid } from 'guid-typescript';

//Nishant 24-09-2020
import FileInputComponent from 'react-file-input-previews-base64'

interface IProps {
    dataItem: any
    cancel: any
    save: any
    LibID: any
    editMode: string
}
let _gMod = new GlobalMod();


let objBrokerRequest = new BrokerRequest();
let objParameter = new BrokerParameter("odata", "odata");

// export class comboData {
//     text: string = "";
//     id: string = "";

//     constructor(paramText: string, paramId: string) {
//         this.text = paramText;
//         this.id = paramId;
//     }

// }

// Description: ""
// DisplayOrder: 2
// Image: "Qk02CAAAAAAAADYEAAAoAAAAIAAAACAAAAABAAgAAAAAAAAAAAB0EgAAdBIAAAABAAAAAQAAAAAA/wAAgP8AgAD/AICA/4AAAP+AAID/gIAA/8DAwP/A3MD/8Mqm/wAgQP8AIGD/ACCA/wAgoP8AIMD/ACDg/wBAAP8AQCD/AEBA/wBAYP8AQID/AECg/wBAwP8AQOD/AGAA/wBgIP8AYED/AGBg/wBggP8AYKD/AGDA/wBg4P8AgAD/AIAg/wCAQP8AgGD/AICA/wCAoP8AgMD/AIDg/wCgAP8AoCD/AKBA/wCgYP8AoID/AKCg/wCgwP8AoOD/AMAA/wDAIP8AwED/AMBg/wDAgP8AwKD/AMDA/wDA4P8A4AD/AOAg/wDgQP8A4GD/AOCA/wDgoP8A4MD/AODg/0AAAP9AACD/QABA/0AAYP9AAID/QACg/0AAwP9AAOD/QCAA/0AgIP9AIED/QCBg/0AggP9AIKD/QCDA/0Ag4P9AQAD/QEAg/0BAQP9AQGD/QECA/0BAoP9AQMD/QEDg/0BgAP9AYCD/QGBA/0BgYP9AYID/QGCg/0BgwP9AYOD/QIAA/0CAIP9AgED/QIBg/0CAgP9AgKD/QIDA/0CA4P9AoAD/QKAg/0CgQP9AoGD/QKCA/0CgoP9AoMD/QKDg/0DAAP9AwCD/QMBA/0DAYP9AwID/QMCg/0DAwP9AwOD/QOAA/0DgIP9A4ED/QOBg/0DggP9A4KD/QODA/0Dg4P+AAAD/gAAg/4AAQP+AAGD/gACA/4AAoP+AAMD/gADg/4AgAP+AICD/gCBA/4AgYP+AIID/gCCg/4AgwP+AIOD/gEAA/4BAIP+AQED/gEBg/4BAgP+AQKD/gEDA/4BA4P+AYAD/gGAg/4BgQP+AYGD/gGCA/4BgoP+AYMD/gGDg/4CAAP+AgCD/gIBA/4CAYP+AgID/gICg/4CAwP+AgOD/gKAA/4CgIP+AoED/gKBg/4CggP+AoKD/gKDA/4Cg4P+AwAD/gMAg/4DAQP+AwGD/gMCA/4DAoP+AwMD/gMDg/4DgAP+A4CD/gOBA/4DgYP+A4ID/gOCg/4DgwP+A4OD/wAAA/8AAIP/AAED/wABg/8AAgP/AAKD/wADA/8AA4P/AIAD/wCAg/8AgQP/AIGD/wCCA/8AgoP/AIMD/wCDg/8BAAP/AQCD/wEBA/8BAYP/AQID/wECg/8BAwP/AQOD/wGAA/8BgIP/AYED/wGBg/8BggP/AYKD/wGDA/8Bg4P/AgAD/wIAg/8CAQP/AgGD/wICA/8CAoP/AgMD/wIDg/8CgAP/AoCD/wKBA/8CgYP/AoID/wKCg/8CgwP/AoOD/wMAA/8DAIP/AwED/wMBg/8DAgP/AwKD/8Pv//6SgoP+AgID/AAD//wD/AP8A/////wAA//8A/////wD///////v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v9/f39/f39/fv7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/37+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/37+/v7+/v7AAD7+/v7+/v7+/v7+/v7AAD7+/v7+/v7/fv7+/v7+/sAAPv7+/v7+/v7+/v7+/sAAPv7+/v7+/v7/fv7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v9+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7AAD7+/v7+/v7+/v7+/sAAPv7+/v7+/v7+/v7+/v7+/sAAPv7+/v7+/v7+/v7+wAA+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/39/f39/f39+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7/fv7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7/fv7+/v7+/v7+/v7+/v7+/v7+/v7+/sAAPv7+/v7+/v9+/v7+/sAAPv7+/v7+/v7+/v7+/v7+wAA+/v7+/v7+/v9+/v7+wAA+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/37+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v9/fv7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/39/f39/fv7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7/fv7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7/fv7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v9+/v7+/v7+/v7+/sAAPv7+/v7+/v7+/v7+wAA+/v7+/v9+/v7+/v7+/v7+wAA+/v7+/v7+/v7+/v7AAD7+/v7+/0="
// Percentage: 51
// inEdit: false
// lithID: "102_791_318_778_199"
// lithType: "sand"

export default class MudLithologyInlineEditor extends Component<IProps> {
    constructor(props: any) {
        super(props);

    }

    state = {
        LithoInEdit: this.props.dataItem || null,
        lithoLogyTypeList: [] as any, //pending
        lithType: new comboData(this.props.dataItem.LithType, this.props.dataItem.LithType),
        Description: this.props.dataItem.Description,
        Percentage: this.props.dataItem.Percentage,
        Image: this.props.dataItem.Image
    };


    //Nishant 28-09-2020
    getFiles(Image: any) {

        console.log("Image: ", Image);
        this.setState({ Image: Image });

        let edited = this.state.LithoInEdit;
        //"data:image/jpeg;base64,"

        if (Image.length == 0) {
            edited["Image"] = "";
        } else {
            edited["Image"] = Image.base64.substr(23);
        }

        this.setState({
            LithoInEdit: edited
        });





    }

    componentDidMount() {
        this.generateCombo_();
        this.setState({
            lithType: new comboData(this.props.dataItem.lithType, this.props.dataItem.lithType)
        });
    }

    handleSubmit(event: any) {
        event.preventDefault();
    }


    onImageChange = (image: any) => {
        // data for submit

        let edited = this.state.LithoInEdit;
        //"data:image/jpeg;base64,"

        if (image.length == 0) {
            edited["Image"] = "";
        } else {
            edited["Image"] = image[0].dataURL.toString().substr(23);
        }

        this.setState({
            LithoInEdit: edited
        });



        //this.state.LithoInEdit.Image

        console.log(image);
        console.log(this.state.LithoInEdit);
    };

    onDialogInputChange = (event: any) => {

        let target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.props ? target.props.name : target.name;

        const edited = this.state.LithoInEdit;

        if (name == 'lithType') {
            edited[name] = value.id;
            this.setState({ [name]: value });
        } else {
            edited[name] = value;
        }


        this.setState({
            LithoInEdit: edited
        });
    }

    handleChangeDropDown = (event: any) => {

        this.setState({ [event.target.name]: event.value });
        this.setState({ lithoType: event.value });

    }

    save = () => {

        let edited = this.state.LithoInEdit;
        if (edited["Image"] == "") {
            alert("Please select Image");
            return;
        }

        if (this.props.editMode == "A") {

            edited["lithID"] = Guid.create().toString();
            this.setState({
                LithoInEdit: edited
            });
        }

        this.props.save(this.state.LithoInEdit, this.props.editMode)
    }


    removeImage = () => {


        const edited = this.state.LithoInEdit;
        edited["Image"] = null;

        this.setState({
            LithoInEdit: edited
        });
    }

    generateCombo_ = async () => {


        objBrokerRequest = new BrokerRequest();
        objBrokerRequest.Module = "DataObject.Manager";
        objBrokerRequest.Function = "getTable";
        objBrokerRequest.Broker = "WellBroker";

        objParameter.ParamName = "strSQL";
        objParameter.ParamValue = "SELECT LITH_TYPE FROM VMX_MUD_LOG_LITH_LIB_ITEMS WHERE LIB_ID='" + this.props.LibID + "' ORDER BY LITH_TYPE";
        objBrokerRequest.Parameters.push(objParameter);



        const res = await axios.get(_gMod._getData, { params: { paramRequest: JSON.stringify(objBrokerRequest) }, });
        const objData = JSON.parse(res.data.Response);

        const LithoTypeList: any = [];
        objData.forEach(function (value: any) {
            let comboData_ = new comboData(value.LITH_TYPE, value.LITH_TYPE);
            LithoTypeList.push(comboData_);
        });
        //Stefan
        //[{"text":"dolo","id":"dolo"},{"text":"marl","id":"marl"},{"text":"no sample","id":"no sample"},{"text":"sand","id":"sand"},{"text":"sandstone","id":"sandstone"},{"text":"shale","id":"shale"},{"text":"shale1","id":"shale1"},{"text":"siltstone","id":"siltstone"}]
        return await this.setState({ lithoLogyTypeList: LithoTypeList });

    }

    onDrop = (picture) => {

        this.setState({
            Image: picture,
        });
    }

    render() {
        //  console.log(this.state.lithoLogyTypeList);
        return (
            <Dialog
                onClose={this.props.cancel}
            >
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        Lithology Type<br />
                        <DropDownList
                            style={{ zIndex: 10003 }}
                            name="lithType"
                            data={this.state.lithoLogyTypeList}
                            value={this.state.lithType}
                            textField="text"
                            dataItemKey="id"
                            onChange={this.onDialogInputChange}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        Percentage<br />
                        <NumericTextBox
                            name="Percentage"
                            value={this.state.LithoInEdit.Percentage || 0}
                            onChange={this.onDialogInputChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        <Input
                            name="Description"
                            // style={{ width: "100%" }}
                            label="Description"
                            pattern={"[A-Za-z]+"}
                            minLength={2}
                            required={true}
                            value={this.state.LithoInEdit.Description}
                            onChange={this.onDialogInputChange}
                        />
                    </label>
                </div>


                <div className="row mt-3">
                    <div className="col">
                        {/* <img src={require("../../images/AddImage64.png")} style={{ height: 40, width: 40 }} /> */}

                        {/* <button type="button" className="btn-custom btn-custom-primary ml-1">

                         </button> */}
                    </div>
                    <div className="col">
                        {/* <img onClick={this.removeImage} src={require("../../images/RemoveImage64.png")} style={{ height: 40, width: 40 }} /> */}
                        {/* <button type="button" className="btn-custom btn-custom-primary ml-1"> </button> */}
                    </div>
                </div>



                <FileInputComponent
                    labelText="Select Image file"
                    labelStyle={{ fontSize: 14 }}
                    multiple={false}
                    imagePreview={false}
                    callbackFunction={(file_arr) => { this.getFiles(file_arr) }}
                    accept="image/jpeg"

                />


                <div className="row mt-3 justify-content-center align-items-center" >
                    {this.state.LithoInEdit.Image != null && <img
                        style={{ width: 70, height: 40 }}

                        src={`data:image/jpeg;base64,${this.state.LithoInEdit.Image}`}


                    />}
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


