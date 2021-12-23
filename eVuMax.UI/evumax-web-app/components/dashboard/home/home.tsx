import React from "react";
import axios from "axios";
import BrokerRequest from '../../../broker/BrokerRequest';
import BrokerParameter from "../../../broker/BrokerParameter";
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import {PanelBarItem,PanelBar } from '@progress/kendo-react-layout'
import ActiveWell from "../../grid/active-well/active-well";



let objBrokerResponse = new BrokerRequest();
let objParameter = new BrokerParameter("odata","odata");


export default class Home extends React.Component {



    render(){

return(
    <div className="row">


    <div className="col-xl-12">

    <div className="p-2"><ActiveWell /></div>
    {/* <PanelBar >
    <PanelBarItem expanded={true} title="Active Well">

    </PanelBarItem>
    </PanelBar> */}
    </div>
    </div>
);

    };

}