export enum kpiFilterType{
AllData = 0,
LastHours = 1,
DateRange = 2,
DateOnwards = 3,
DepthRange = 4,
DepthOnwards = 5,
CurrentSection = 6
}
export class ADVKPIDataFilter{
    public FilterData:boolean = false;
    public FilterMainWellID: string  = "";
    public FilterType:kpiFilterType  = kpiFilterType.LastHours;
    public Filter_FromDate: Date  = new Date();
    public Filter_ToDate: Date  = new Date();
    public Filter_FromDepth:number = 0;
    public Filter_ToDepth:number  = 0;
    public Filter_LastHours:number  =24;

}