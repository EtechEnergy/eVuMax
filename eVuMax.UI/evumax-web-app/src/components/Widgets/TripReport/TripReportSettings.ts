export class TripReportSettings {
   
    public IncludePipeMovement: boolean = true;
    public RemoveFillupTime: boolean = false;

    public UseCustomTags: boolean  = false;
    public SurfaceDepthInterval: number = 90;
    public  TagSourceID: string = "";
    public BenchmarkSpeedWOConn: number = 0;
    public BenchmarkSpeedWithConn:number = 0;
    public BenchmarkTime: number = 0;
    public MaxConnTime: number = 5;
    public MinConnTime:number = 1;
    public DepthInterval:number = 1000;

    public WellID: string = "";
    public UserID: string = "";
    private PlotID: string = "TRIPREPORT";
    public objDataService: any = {};
    public Warnings: string = "";
    public taglist:string[] = [];
    public TripExclusionList:any[] =[];
    public TripExclusionListStr:any[] = [];
    public objPlotScaleList:any[] = [];
    
    
}