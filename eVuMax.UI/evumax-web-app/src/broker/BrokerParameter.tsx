export default class BrokerParameter {

    constructor( pName: string, pValue:string){

        this.ParamName = pName;
        this.ParamValue = pValue;

    } 

    ParamName !: string;
    ParamValue !: string;

}