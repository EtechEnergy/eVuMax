using eVuMax.DataBroker.Broomstick.Document.BroomstickDocument;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

[Serializable()]
public partial class BroomStickSetup
{
    public enum bmStaticMethod
    {
        Min = 0,
        Max = 1,
        Avg = 2
    }

    public enum bmMultiSelectMethod
    {
        Min = 0,
        Max = 1
    }

    public enum pointPlotMethod
    {
        DynamicMethod = 0,
        StaticMethod = 1,
        Both = 2
    }

    public enum bmPumpStatus
    {
        Both = 0,
        PumpOn = 1,
        PumpOff = 2
    }

    public enum bmDynamicMethod
    {
        BreakOver = 0,
        Average = 1,
        BreakOverAverage = 2
    }

    public string pickupPumpMnemonic = "SPPA";
    public bmPumpStatus pickupPumpStatus = bmPumpStatus.Both;
    public int pickupMaxBlockMovement = 90;
    public int pickupMinBlockMovement = 5;
    public string slackOffPumpMnemonic = "SPPA";
    public bmPumpStatus slackOffPumpStatus = bmPumpStatus.Both;
    public int slackOffMaxBlockMovement = 90;
    public int slackOffMinBlockMovement = 5;
    public double pickupRPMCutOff = 15;
    public double slackOffRPMCutOff = 12;
    public string rotatePumpMnemonic = "SPPA";
    public bmPumpStatus rotatePumpStatus = bmPumpStatus.PumpOn;
    public double pickupCutOffValue = 100;
    public double slackOffCutOffValue = 100;
    public double rotateCutOffValue = 100;
    public bmStaticMethod pickupPointSelectionMethod = bmStaticMethod.Max;
    public bmStaticMethod slackOffPointSelectionMethod = bmStaticMethod.Min;
    public int rotateTime = 120;
    public pointPlotMethod PointToPlot = pointPlotMethod.DynamicMethod;
    public double StringSpeed = 0d;
    public double OffBottomCircHeight = 10d;
    public double rotateRPMCutOff = 12;
    public double rotateMaxRPM = 30d;
    public bmDynamicMethod pickupDynamicMethod = bmDynamicMethod.BreakOver;
    public bmDynamicMethod slackOffDynamicMethod = bmDynamicMethod.BreakOver;
    public double ROBMaxHkldTolerance = 1d;
    public int TolerancePoints = 1;
    public bool CheckPUSOProcedure = false;
    public bool DontPlotROBWithNoStability = false;
    public bool PlotOffBottom = true;
    public bool PlotOnBottom = false;
    public bool PULocalMaxFilter = false;
    public bool SOLocalMinFilter = false;
    public int MaxPauseTime = 1;
    public bmMultiSelectMethod pickupMultiPointMethod = bmMultiSelectMethod.Max;
    public bmMultiSelectMethod slackOffMultiPointMethod = bmMultiSelectMethod.Max;
    public bmMultiSelectMethod ROBMultiPointMethod = bmMultiSelectMethod.Max;
    public bool ShowMultiplePoints = false;
    public string pickupRigStates = "";
    public string slackOffRigStates = "";
    public string rotateRigStates = "";
    public bool EnforceRule = false;

    public Dictionary<int, TDPointProp> TDPointProperties = new Dictionary<int, TDPointProp>();

    public int PlanLineWidth = 3;
    public Color PKUPColor = Color.Blue;
    public Color PKUPStaticColor = Color.SteelBlue;
    public Color SLOFColor = Color.Green;
    public Color SLOFStaticColor = Color.LightGreen;
    public Color ROBColor = Color.Black;
    public Color ONTorqueColor = Color.Orange;
    public Color OFFTorqueColor = Color.Red;
    public int BMPointStyle = 0;
    public int BMPointSize = 4;
    public int Transparency = 0;

    public int TDPointStyle = 0;
    public int TDPointSize = 3;
    public BroomstickProfile objProfile = new BroomstickProfile();

    public string PlanID = "";

    //


    public enum enDownSampleMethod
    {
        ByDepth = 0,
        ByTime = 1
    }

    public enDownSampleMethod DownSampleMethod = enDownSampleMethod.ByDepth;
    // 'For Depth - no. of data points would be by 1 Feet/Mtr.
    // 'For Time - no. of data points would be by 1 Minute.
    public int NoOfDataPoints = 6;
    public int TimePeriod = 1;
    public Dictionary<int, int> PointSelectionMethod = new Dictionary<int, int>(); // 'This includes min/max/avg.
    public globalTimeFilter objTimeFilter = new globalTimeFilter();
    public string RunNo = "";
 

    VuMaxDR.Data.DataService objDataService;
    public BroomStickSetup(ref DataService paramObjDataService)
    {
        objDataService = paramObjDataService;
        initDefaults();
    }

    public BroomStickSetup()
    {
        
    }
    public void initDefaults()
    {
        try
        {
            TDPointProperties = new Dictionary<int, TDPointProp>();

            // 'Generate Rig States
            DataTable objData = objDataService.getTable("SELECT * FROM VMX_COMMON_RIGSTATE_ITEMS ORDER BY RIG_STATE_NUMBER");
            foreach (DataRow objRow in objData.Rows)
            {
                var objItem = new TDPointProp();
                objItem.RigState = Convert.ToInt32( DataService.checkNull(objRow["RIG_STATE_NUMBER"], 0));
                objItem.RigStateName = DataService.checkNull(objRow["RIG_STATE_NAME"], "").ToString();
                objItem.GroupFunction = 2;
                objItem.Color = DataService.checkNull(objRow["RIG_STATE_COLOR"], 0).ToString();
                
                if (!TDPointProperties.ContainsKey(objItem.RigState))
                {
                    TDPointProperties.Add(objItem.RigState, objItem.getCopy());
                }
            }

            TDPointStyle = 0;
            TDPointSize = 3;
            PlanLineWidth = 2;
            BMPointStyle = 1;
            BMPointSize = 6;
            PKUPColor = Color.Blue;
            PKUPStaticColor = Color.SteelBlue;
            SLOFColor = Color.Green;
            SLOFStaticColor = Color.LightGreen;
            ROBColor = Color.Black;
            ONTorqueColor = Color.Orange;
            OFFTorqueColor = Color.Red;
        }
        catch (Exception ex)
        {
        }
    }

    public BroomStickSetup getCopy()
    {
        try
        {
            var objNew = new BroomStickSetup( ref objDataService);
            objNew.pickupCutOffValue = pickupCutOffValue;
            objNew.slackOffCutOffValue = slackOffCutOffValue;
            objNew.pickupPointSelectionMethod = pickupPointSelectionMethod;
            objNew.slackOffPointSelectionMethod = slackOffPointSelectionMethod;
            objNew.rotateTime = rotateTime;
            objNew.PointToPlot = PointToPlot;
            objNew.StringSpeed = StringSpeed;
            objNew.OffBottomCircHeight = OffBottomCircHeight;
            objNew.rotateCutOffValue = rotateCutOffValue;
            objNew.pickupPumpMnemonic = pickupPumpMnemonic;
            objNew.pickupPumpStatus = pickupPumpStatus;
            objNew.pickupMaxBlockMovement = pickupMaxBlockMovement;
            objNew.pickupMinBlockMovement = pickupMinBlockMovement;
            objNew.slackOffPumpMnemonic = slackOffPumpMnemonic;
            objNew.slackOffPumpStatus = slackOffPumpStatus;
            objNew.slackOffMaxBlockMovement = slackOffMaxBlockMovement;
            objNew.slackOffMinBlockMovement = slackOffMinBlockMovement;
            objNew.pickupRPMCutOff = pickupRPMCutOff;
            objNew.slackOffRPMCutOff = slackOffRPMCutOff;
            objNew.rotatePumpMnemonic = rotatePumpMnemonic;
            objNew.rotatePumpStatus = rotatePumpStatus;
            objNew.pickupDynamicMethod = pickupDynamicMethod;
            objNew.slackOffDynamicMethod = slackOffDynamicMethod;
            objNew.rotateMaxRPM = rotateMaxRPM;
            objNew.ROBMaxHkldTolerance = ROBMaxHkldTolerance;
            objNew.CheckPUSOProcedure = CheckPUSOProcedure;
            objNew.TolerancePoints = TolerancePoints;
            objNew.DontPlotROBWithNoStability = DontPlotROBWithNoStability;
            objNew.PlotOffBottom = PlotOffBottom;
            objNew.PlotOnBottom = PlotOnBottom;
            objNew.PULocalMaxFilter = PULocalMaxFilter;
            objNew.SOLocalMinFilter = SOLocalMinFilter;
            objNew.MaxPauseTime = MaxPauseTime;
            objNew.pickupMultiPointMethod = pickupMultiPointMethod;
            objNew.slackOffMultiPointMethod = slackOffMultiPointMethod;
            objNew.ROBMultiPointMethod = ROBMultiPointMethod;
            objNew.ShowMultiplePoints = ShowMultiplePoints;
            objNew.pickupRigStates = pickupRigStates;
            objNew.slackOffRigStates = slackOffRigStates;
            objNew.rotateRigStates = rotateRigStates;
            objNew.EnforceRule = EnforceRule;

            objNew.objTimeFilter = objTimeFilter;

            return objNew;
        }
        catch (Exception ex)
        {
            return new BroomStickSetup();
        }
    }

    public VuMaxDR.Data.Objects.BroomStickSetup getCopyEx()
    {
        try
        {
            var objNew = new VuMaxDR.Data.Objects.BroomStickSetup();
            objNew.pickupCutOffValue = pickupCutOffValue;
            objNew.slackOffCutOffValue = slackOffCutOffValue;
            objNew.pickupPointSelectionMethod = (VuMaxDR.Data.Objects.BroomStickSetup.bmStaticMethod)pickupPointSelectionMethod;
            objNew.slackOffPointSelectionMethod = (VuMaxDR.Data.Objects.BroomStickSetup.bmStaticMethod)slackOffPointSelectionMethod;
            objNew.rotateTime = rotateTime;
            objNew.PointToPlot = (VuMaxDR.Data.Objects.BroomStickSetup.pointPlotMethod)PointToPlot;
            objNew.StringSpeed = StringSpeed;
            objNew.OffBottomCircHeight = OffBottomCircHeight;
            objNew.rotateCutOffValue = rotateCutOffValue;
            objNew.pickupPumpMnemonic = pickupPumpMnemonic;
            objNew.pickupPumpStatus = (VuMaxDR.Data.Objects.BroomStickSetup.bmPumpStatus)pickupPumpStatus;
            objNew.pickupMaxBlockMovement = pickupMaxBlockMovement;
            objNew.pickupMinBlockMovement = pickupMinBlockMovement;
            objNew.slackOffPumpMnemonic = slackOffPumpMnemonic;
            objNew.slackOffPumpStatus = (VuMaxDR.Data.Objects.BroomStickSetup.bmPumpStatus)slackOffPumpStatus;
            objNew.slackOffMaxBlockMovement = slackOffMaxBlockMovement;
            objNew.slackOffMinBlockMovement = slackOffMinBlockMovement;
            objNew.pickupRPMCutOff = pickupRPMCutOff;
            objNew.slackOffRPMCutOff = slackOffRPMCutOff;
            objNew.rotatePumpMnemonic = rotatePumpMnemonic;
            objNew.rotatePumpStatus = (VuMaxDR.Data.Objects.BroomStickSetup.bmPumpStatus)rotatePumpStatus;
            objNew.pickupDynamicMethod = (VuMaxDR.Data.Objects.BroomStickSetup.bmDynamicMethod)pickupDynamicMethod;
            objNew.slackOffDynamicMethod = (VuMaxDR.Data.Objects.BroomStickSetup.bmDynamicMethod)slackOffDynamicMethod;
            objNew.rotateMaxRPM = rotateMaxRPM;
            objNew.ROBMaxHkldTolerance = ROBMaxHkldTolerance;
            objNew.CheckPUSOProcedure = CheckPUSOProcedure;
            objNew.TolerancePoints = TolerancePoints;
            objNew.DontPlotROBWithNoStability = DontPlotROBWithNoStability;
            objNew.PlotOffBottom = PlotOffBottom;
            objNew.PlotOnBottom = PlotOnBottom;
            objNew.PULocalMaxFilter = PULocalMaxFilter;
            objNew.SOLocalMinFilter = SOLocalMinFilter;
            objNew.MaxPauseTime = MaxPauseTime;
            objNew.pickupMultiPointMethod = (VuMaxDR.Data.Objects.BroomStickSetup.bmMultiSelectMethod)pickupMultiPointMethod;
            objNew.slackOffMultiPointMethod = (VuMaxDR.Data.Objects.BroomStickSetup.bmMultiSelectMethod)slackOffMultiPointMethod;
            objNew.ROBMultiPointMethod = (VuMaxDR.Data.Objects.BroomStickSetup.bmMultiSelectMethod)ROBMultiPointMethod;
            objNew.ShowMultiple = ShowMultiplePoints;
            objNew.pickupRigStates = pickupRigStates;
            objNew.slackOffRigStates = slackOffRigStates;
            objNew.rotateRigStates = rotateRigStates;
            objNew.EnforceRule = EnforceRule;
            return objNew;
        }
        catch (Exception ex)
        {
            return new VuMaxDR.Data.Objects.BroomStickSetup();
        }
    }
}