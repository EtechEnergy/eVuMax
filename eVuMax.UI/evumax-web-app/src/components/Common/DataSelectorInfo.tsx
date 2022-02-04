import React, { Component } from 'react'
import DataSelector_ from "./DataSelector_";
import moment from "moment";

//interface IProps { }
interface IProps {
    objDataSelector: DataSelector_;
    isRealTime: boolean;
}

export default class DataSelectorInfo extends Component<IProps>  {
    dataSelectorPeriod = "24 Hrs....";
    selectionType = "";
    needForceReload = false;
    constructor(props: any) {
        super(props);
    }


    componentDidUpdate() {
        try {
          //  alert("info update -"+this.props.objDataSelector.selectedval + " " + this.props.isRealTime);

     //Added on 02-02-2022
     
        
     if (!this.props.objDataSelector.needForceReload)
     {
         
         console.log(this.props.objDataSelector.needForceReload);
         return;
     }

    // alert(this.props.objDataSelector.needForceReload);
            
            this.selectionType = this.props.objDataSelector.selectedval;
            this.dataSelectorPeriod = ""
            this.needForceReload= this.props.objDataSelector.needForceReload;

       
            
            if (this.props.isRealTime) {
                this.dataSelectorPeriod = "Last " + this.props.objDataSelector.refreshHrs.toString() + " Hrs.";
            }
            else {
                switch (this.selectionType) {
                    case "-1":
                    case "2":
                        this.dataSelectorPeriod = "Last " + this.props.objDataSelector.refreshHrs.toString() + " Hrs.";
                        break;
                    case "0":
                        if (this.props.objDataSelector.fromDate == null || this.props.objDataSelector.toDate == null) {
                            this.dataSelectorPeriod = "Last " + this.props.objDataSelector.refreshHrs.toString() + " Hrs.";
                        } else {
                            this.dataSelectorPeriod = "Date " + moment(this.props.objDataSelector.fromDate).format('MMM-DD-YYYY HH:mm:ss') + " to " + moment(this.props.objDataSelector.toDate).format('MMM-DD-YYYY HH:mm:ss'); // this.fromDate.toString() + " to " + this.toDate.toString();
                        }
                        break;
                    case "1":
                        this.dataSelectorPeriod = "Depth " + this.props.objDataSelector.fromDepth.toString() + " to " + this.props.objDataSelector.toDepth.toString();
                        break;
                    default:
                        this.dataSelectorPeriod = "";
                        break;
                }
            }
            //this.forceUpdate();
            //alert(this.needForceReload);
            if (this.props.objDataSelector.needForceReload){
                this.needForceReload=false;
                this.forceUpdate();
                
            }
        } catch (error) {

        }
    }

    render() {
        //alert("render " +  this.dataSelectorPeriod );

        return (
            <div>
                {/* TESTING {this.dataSelectorPeriod} */}
                <label className="dataSelectorPeriod" style={{ marginLeft: "30px" }}> Data Range:  {this.dataSelectorPeriod} </label>
            </div>

        )
    }
}


