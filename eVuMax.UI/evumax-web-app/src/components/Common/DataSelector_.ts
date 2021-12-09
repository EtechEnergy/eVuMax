export default class DataSelector_ {
    selectedval: string = "-1";//"-1 Default, 0= DateRange and 1 = Depth Range"
   
    fromDateS: Date = new Date();
    toDateS: Date = new Date();
    
    fromDate: Date = new Date();
    toDate: Date = new Date();
   
    fromDepth: number = 0;
    toDepth: number = 0;
    refreshHrs: number = 24;
    wellID: string = "";
    matchDepthByTops: boolean = false;
    offsetWells:[];
    trajList:[];
    NoOfDataPoints:number =6;
}