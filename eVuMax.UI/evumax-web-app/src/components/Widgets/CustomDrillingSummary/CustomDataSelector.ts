export enum sPlotSelectionType{
    ByHours = 0,
    DateRange = 1,
    FromDateOnwards = 2,
    DepthRange = 3,
    FromDepthOnwards = 4,
    FormationTops = 5
}
export default class CustomDataSelector {
    
    selectionType:sPlotSelectionType = sPlotSelectionType.ByHours;
    LastHours:number = 24;
    FromDate:Date = new Date;
    ToDate:Date = new Date;
    FromDepth:number =0;
    ToDepth:number=0;
    sideTrackKey:string="";
    topList: Map<string,string> = new Map();
    trajList: Map<string,string> = new Map();
    NoOfDataPoints:number =6;
    MatchDepthByFormationTops:boolean = false;
}