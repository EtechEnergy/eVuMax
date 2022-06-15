import { AlarmValues } from "./AlarmValues";
import { APContainer } from "./APContainer";
import { AlarmHistory } from "./AlarmHistory";

export class AlarmPanelProfile{
        panelID : string="";
        panelName : string="";
        Notes : string="";
     
        setAlarms: AlarmValues[]= [];
        
        containers : APContainer[]=[];       // As Dictionary(Of String, APContainer)
        AlarmHistory :  AlarmHistory;     //AlarmHistory class
        parent : any;
         RunOnDownSampledData : boolean = false;
         TimeInterval : number =0;
}

