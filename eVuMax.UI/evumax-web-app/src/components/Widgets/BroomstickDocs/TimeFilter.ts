  export enum vFilterType{
        LastData = 0,
        SpecificRange = 1,
        OpenEnded = 2,
        None = 3,
  }

 
   
    export  class TimeFilter {

    public FilterStatus : boolean = false;
    public FilterType : vFilterType = vFilterType.LastData;
    public FromDateTime : Date =  new Date();
    public ToDateTime : Date = new Date();;
    public LastPeriod : number = 0;

    public DepthFilterType : vFilterType = vFilterType.LastData;
    public FromDepth : number = 0;
    public ToDepth : number = 0;
    public LastDepthPeriod : number = 0;


    public FilterByHkldRange : Boolean = false;
    public FromHookload : number = 0;
    public ToHookload : number = 0;
   public FilterByMean : boolean = false;
    public MeanDepthRange : number = 100;
    public AllowedRange : number = 10;
    public MeanMethod : number = 0;


 

    public FilterByEvents : boolean = false
    public FilterWellID : string = ""
    public FilterWellboreID : string = ""
    // public EventList : New Dictionary(Of Integer, WellEventLink)


    public filterBasedOnDepth : boolean = false
    public FilterDepthInterval : number = 1000
    //public FilterMethod : number = 0 ''0 - max, 1 - min;

    public PumpStatus : number = 0

    }