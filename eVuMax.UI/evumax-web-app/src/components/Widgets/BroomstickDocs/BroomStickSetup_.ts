
import { BroomstickProfile } from "./BroomstickProfile";
import { TDPointProp } from "./TDPointProp";
import { TimeFilter } from "./TimeFilter";

export enum bmStaticMethod {
        
        Min = 0,
        
        Max = 1,
        
        Avg = 2,
    }
    
    export enum bmMultiSelectMethod {
        
        Min = 0,
        
        Max = 1,
    }
    
    export enum pointPlotMethod {
        
        DynamicMethod = 0,
        
        StaticMethod = 1,
        
        Both = 2,
    }
    
    export enum bmPumpStatus {
        
        Both = 0,
        
        PumpOn = 1,
        
        PumpOff = 2,
    }
    
    export enum bmDynamicMethod {
        
        BreakOver = 0,
        
        Average = 1,
        
        BreakOverAverage = 2,
    }
    
 export enum enDownSampleMethod
    {
        ByDepth = 0,
        ByTime = 1
    }

   
export  class BroomStickSetup_ {
    public DepthMovThresholdWidth:number = 1;   
      public  PlanLineWidth:number = 3;
    public  PKUPColor:string = "blue";
    public  PKUPStaticColor:string = "lightblue";
    public  SLOFColor:string = "green";
    public  SLOFStaticColor:string = "lightgreen";
    public  ROBColor:string = "black";
    public  ONTorqueColor:string = "orange";
    public  OFFTorqueColor:string = "red";
    public  BMPointStyle:number = 1;
    public  HkldPointStyle:number = 0;
    public  HkldPointSize:number = 3;
    public  BMPointSize:number = 4;
    public  Transparency:number = 0;
    public DownSampleMethod:enDownSampleMethod = enDownSampleMethod.ByDepth;
    // 'For Depth - no. of data points would be by 1 Feet/Mtr.
    // 'For Time - no. of data points would be by 1 Minute.
    
    
    
    public  NoOfDataPoints:number = 6;
    public  TimePeriod :number= 1;
    public  PointSelectionMethod:any = []; // 'This includes min/max/avg.
    public pickupPumpMnemonic: string = "SPPA";
    public pickupPumpStatus: bmPumpStatus = bmPumpStatus.Both;
    public pickupMaxBlockMovement: number = 70;
    public pickupMinBlockMovement: number = 5;
    public slackOffPumpMnemonic: string = "SPPA";
    public slackOffPumpStatus: bmPumpStatus = bmPumpStatus.Both;
    public slackOffMaxBlockMovement: number = 70;
    public slackOffMinBlockMovement: number = 5;
    
    public pickupRPMCutOff: number = 15;
    
    public slackOffRPMCutOff: number = 12;
    
    public rotatePumpMnemonic: string = "SPPA";
    
    public rotatePumpStatus: bmPumpStatus = bmPumpStatus.Both;
    
    public pickupCutOffValue: number = 100;
    
    public slackOffCutOffValue: number = 100;
    
    public rotateCutOffValue: number;
    
    public pickupPointSelectionMethod: bmStaticMethod = bmStaticMethod.Max;
    
    public slackOffPointSelectionMethod: bmStaticMethod = bmStaticMethod.Min;
    
    public rotateTime: number = 120;
    
    public PointToPlot: pointPlotMethod = pointPlotMethod.DynamicMethod;
    
    public StringSpeed: number;
    
    public OffBottomCircHeight: number;
    
    public rotateRPMCutOff: number;
    
    public rotateMaxRPM: number;
    
    public pickupDynamicMethod: bmDynamicMethod = bmDynamicMethod.BreakOver;
    
    public slackOffDynamicMethod: bmDynamicMethod = bmDynamicMethod.BreakOver;
    
    public ROBMaxHkldTolerance: number;
    
    public TolerancePoints: number = 1;
    
    public CheckPUSOProcedure: boolean = false;
    
    public DontPlotROBWithNoStability: boolean = false;
    
    public PlotOffBottom: boolean = true;
    
    public PlotOnBottom: boolean = false;
    
    public PULocalMaxFilter: boolean = false;
    
    public SOLocalMinFilter: boolean = false;
    
    public MaxPauseTime: number = 1;
    
    public pickupMultiPointMethod: bmMultiSelectMethod = bmMultiSelectMethod.Max;
    
    public slackOffMultiPointMethod: bmMultiSelectMethod = bmMultiSelectMethod.Max;
    
    public ROBMultiPointMethod: bmMultiSelectMethod = bmMultiSelectMethod.Max;
    
    public ShowMultiplePoints: boolean = false;
    
    public pickupRigStates: string = "";
    
    public slackOffRigStates: string = "";
    
    public rotateRigStates: string = "";
    
    public EnforceRule: boolean = false;
    public  TDPointProperties: TDPointProp[]; 
    public objProfile =new BroomstickProfile();

    public objTimeFilter:TimeFilter = new  TimeFilter();
    public objRigState:any = {};

    public TDPointStyle:number = 0;
    public TDPointSize:number = 3;




























    public getCopy(): BroomStickSetup_ {
        try {
            let objNew = new BroomStickSetup_();
            objNew.pickupCutOffValue = this.pickupCutOffValue;
            objNew.slackOffCutOffValue = this.slackOffCutOffValue;
            objNew.pickupPointSelectionMethod = this.pickupPointSelectionMethod;
            objNew.slackOffPointSelectionMethod = this.slackOffPointSelectionMethod;
            objNew.rotateTime = this.rotateTime;
            objNew.PointToPlot = this.PointToPlot;
            objNew.StringSpeed = this.StringSpeed;
            objNew.OffBottomCircHeight = this.OffBottomCircHeight;
            objNew.rotateCutOffValue = this.rotateCutOffValue;
            objNew.pickupPumpMnemonic = this.pickupPumpMnemonic;
            objNew.pickupPumpStatus = this.pickupPumpStatus;
            objNew.pickupMaxBlockMovement = this.pickupMaxBlockMovement;
            objNew.pickupMinBlockMovement = this.pickupMinBlockMovement;
            objNew.slackOffPumpMnemonic = this.slackOffPumpMnemonic;
            objNew.slackOffPumpStatus = this.slackOffPumpStatus;
            objNew.slackOffMaxBlockMovement = this.slackOffMaxBlockMovement;
            objNew.slackOffMinBlockMovement = this.slackOffMinBlockMovement;
            objNew.pickupRPMCutOff = this.pickupRPMCutOff;
            objNew.slackOffRPMCutOff = this.slackOffRPMCutOff;
            objNew.rotatePumpMnemonic = this.rotatePumpMnemonic;
            objNew.rotatePumpStatus = this.rotatePumpStatus;
            objNew.pickupDynamicMethod = this.pickupDynamicMethod;
            objNew.slackOffDynamicMethod = this.slackOffDynamicMethod;
            objNew.rotateMaxRPM = this.rotateMaxRPM;
            objNew.ROBMaxHkldTolerance = this.ROBMaxHkldTolerance;
            objNew.CheckPUSOProcedure = this.CheckPUSOProcedure;
            objNew.TolerancePoints = this.TolerancePoints;
            objNew.DontPlotROBWithNoStability = this.DontPlotROBWithNoStability;
            objNew.PlotOffBottom = this.PlotOffBottom;
            objNew.PlotOnBottom = this.PlotOnBottom;
            objNew.PULocalMaxFilter = this.PULocalMaxFilter;
            objNew.SOLocalMinFilter = this.SOLocalMinFilter;
            objNew.MaxPauseTime = this.MaxPauseTime;
            objNew.pickupMultiPointMethod = this.pickupMultiPointMethod;
            objNew.slackOffMultiPointMethod = this.slackOffMultiPointMethod;
            objNew.ROBMultiPointMethod = this.ROBMultiPointMethod;
            objNew.ShowMultiplePoints = this.ShowMultiplePoints;
            objNew.pickupRigStates = this.pickupRigStates;
            objNew.slackOffRigStates = this.slackOffRigStates;
            objNew.rotateRigStates = this.rotateRigStates;
            objNew.EnforceRule = this.EnforceRule;
            return objNew;
        }
        catch (ex /*:Exception*/) {
            return new BroomStickSetup_();
        }
        
    }

}