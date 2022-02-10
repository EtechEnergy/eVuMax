export default class DataSelector_ {
    selectedval: string = "2";//"-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
   
    fromDateS: Date = new Date();
    toDateS: Date = new Date();
    
    fromDate: Date = new Date();
    toDate: Date = new Date();
   
    fromDepth: number = 0;
    toDepth: number = 0;
    refreshHrs: number = 24;
    wellID: string = "";
    MatchDepthByFormationTops: boolean = false;
    offsetWells:[];
    trajList:[];
    NoOfDataPoints:number =6;
     needForceReload : boolean = false; // for control hooks in DataSelectorInfo
}