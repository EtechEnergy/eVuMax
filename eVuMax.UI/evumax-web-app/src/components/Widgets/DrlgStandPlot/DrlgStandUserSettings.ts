export enum eNumSelectionType {
    DefaultByHrs = -1,
    ByHrs = 1,
    DateRange = 0,
    DepthRange = 3
}


export enum sPlotSelectionType
{
    ByHours = 0,
    DateRange = 1,
    FromDateOnwards = 2,
    DepthRange = 3,
    FromDepthOnwards = 4,
    FormationTops = 5
}
export default class DrlgStandUserSettings {
    UserID: string = "";
    WellID: string = "";
    HighlightDayNight: boolean = false;
    dtDayTimeFrom: Date = new Date();
    dtDayTimeTo: Date = new Date();

    RealTime: boolean = false;
    LastHrs: number = 24;
    ShowExcludedStands: boolean = false;
    ShowRigStateView: boolean = false;
    ShowComments:boolean = true;
    //SelectionType: eNumSelectionType = eNumSelectionType.DefaultByHrs;
    SelectionType: sPlotSelectionType = sPlotSelectionType.ByHours;

    // FromDate: Date = new Date();
    // ToDate: Date = new Date();

    FromDate: string = new Date().toLocaleString();
    ToDate: string = new Date().toLocaleString();
    FromDepth: number = 0;
    ToDepth: number = 0;
    
    StandPlot_ShowOffset : boolean =false;
    StandPlot_ComparisonWindow : Number = 50;

    //public bool StandPlot_ShowOffset = false;
    //public double StandPlot_ComparisonWindow = 50;
}
