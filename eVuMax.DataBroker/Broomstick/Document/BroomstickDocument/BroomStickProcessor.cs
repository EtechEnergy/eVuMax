using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Common;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.Broomstick.Document.BroomstickDocument
{


    public enum enumDocumentMode
    {
        HookloadDocument = 0,
        TorqueDocument = 1,
        ConnectionHkld = 2,
        ConnectionTorque = 3
    }
    public class BroomStickProcessor
    {
        private Dictionary<int, wellSection> WellSectionList = new Dictionary<int, wellSection>();
        private wellSection objWellSection = new wellSection();
        private bool useWellSectionPUSOSettings = false;
        public int ProcessStatus = 0;
        public bool RefreshRequired = false;
        public double PercentageComplete = 0;
        public Dictionary<int, PUSOPoint> PUPoints = new Dictionary<int, PUSOPoint>();
        public Dictionary<int, PUSOPoint> SOPoints = new Dictionary<int, PUSOPoint>();
        public Dictionary<int, PUSOPoint> RotatePoints = new Dictionary<int, PUSOPoint>();
        public int SectionType = 0;
        public double MAX_DEPTH_DIFF = 70;
        public DateTime _fromDate;
        public DateTime _toDate;
        public TimeLog _objTimeLog;
        public BroomStickSetup _objSetup;
        private Dictionary<int, int> pkupRigStates = new Dictionary<int, int>();
        private Dictionary<int, int> slkRigStates = new Dictionary<int, int>();
        private Dictionary<int, int> rotRigStates = new Dictionary<int, int>();
        public enumDocumentMode DocumentMode = enumDocumentMode.HookloadDocument;
        public bool CombinedMode = false;



        #region "Algorithm Settings"
        public bool RUN_DRLG_CHECK = true;
        public bool RUN_HKLD_CHECK = true;
        #endregion


        //public VuMaxDR.Data.DataService objDataService = new DataService (DataService.vmDatabaseType.SQLServer, "2008", true, true);
        VuMaxDR.Data.DataService objDataService;
        public Summary.DrlgStand.ADSettings objADSettings = new Summary.DrlgStand.ADSettings();
        private DataService objLocalConn;
        public string warnings = "";
        public string WellID = "";

        public Dictionary<string, AdnlHookloadPlan> objAdnlHookloadPlan = new Dictionary<string, AdnlHookloadPlan>();
        public DataTable RunList = new DataTable();
        
        

        VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
        public string WellName = "";

        public string depthUnit = "ft";
        public string hkldUnit = "klbf";
        public string torqueUnit = "ft.lbf";


        public rigState objRigState = new rigState();


        public void getUniqueRuns()
        
        {
            try
            {
                string LogID = _objTimeLog.ObjectID;
                string PlanType = "";

                switch (DocumentMode)
                {
                    case enumDocumentMode.HookloadDocument:
                        PlanType =  "HKLDP";
                        break;
                    case enumDocumentMode.TorqueDocument:
                        PlanType = "TORP";
                        break;
                    case enumDocumentMode.ConnectionHkld:
                        PlanType = "HKLDP";
                        break;
                    case enumDocumentMode.ConnectionTorque:
                        PlanType = "TORP";
                        break;
                    default:
                        PlanType = "";
                        break;
                }



                DataTable objData = new DataTable();
                string WellboreID = Wellbore.getAnyWellboreID(ref objDataService, WellID);
                objData = objDataService.getTable("SELECT DISTINCT RUN_NO  FROM VMX_ADNL_HKLD_PLAN WHERE WELL_ID='" + WellID + "' AND WELLBORE_ID='" + WellboreID + "' AND LOG_ID='" + LogID + "' AND PLAN_TYPE='" + PlanType + "'");
                if(objData.Rows.Count > 0)
                {
                    RunList= objData;
                    
                }
                else
                {
                    RunList = null;
                }
                
            }
            catch (Exception)
            {

                RunList=  null;
            }
        }
        public BroomStickProcessor()
        {

        }
        public BroomStickProcessor(ref DataService paramObjDataService, string paramWellID)
        {

            
            objDataService = paramObjDataService;
            objADSettings.loadSettings();
            WellID = paramWellID;
            _objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref objDataService, paramWellID);
            if (_objTimeLog != null)
            {
                depthUnit = _objTimeLog.logCurves["DEPTH"].VuMaxUnitID;
                hkldUnit = _objTimeLog.logCurves["HKLD"].VuMaxUnitID;
                torqueUnit = _objTimeLog.logCurves["STOR"].VuMaxUnitID;

            }
            objRigState = rigState.loadWellRigStateSetup(ref objDataService, WellID);
            objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref objDataService, paramWellID);
            if (objWell != null)
            {
                WellName = objWell.name;
            }
            

            //        Public Const cnTypeHkldPlan As String = "HKLDP"
            //Public Const cnTypeActualHkld As String = "HKLDA"
            //Public Const cnTypeTorquePlan As String = "TORP"
            //Public Const cnTypeActualTorque As String = "TORA"

            getUniqueRuns();

          
            
        }


        public Dictionary<double, CombinedPUSO> getCombinedList()
        {
            try
            {
                Dictionary<double, double> uniqueDepths = new Dictionary<double, double>();
                PUSOPoint[] arrPUPoints = PUPoints.Values.ToArray();
                Array.Sort(arrPUPoints);
                PUSOPoint[] arrSOPoints = SOPoints.Values.ToArray();
                Array.Sort(arrSOPoints);
                PUSOPoint[] arrRotatePoints = RotatePoints.Values.ToArray();
                Array.Sort(arrRotatePoints);
                for (int i = 0, loopTo = arrPUPoints.Length - 1; i <= loopTo; i++)
                {
                    double lnDepth = arrPUPoints[i].Depth;
                    if (!uniqueDepths.ContainsKey(lnDepth))
                    {
                        uniqueDepths.Add(lnDepth, lnDepth);
                    }
                }

                for (int i = 0, loopTo1 = arrSOPoints.Length - 1; i <= loopTo1; i++)
                {
                    double lnDepth = arrSOPoints[i].Depth;
                    if (!uniqueDepths.ContainsKey(lnDepth))
                    {
                        uniqueDepths.Add(lnDepth, lnDepth);
                    }
                }

                for (int i = 0, loopTo2 = arrRotatePoints.Length - 1; i <= loopTo2; i++)
                {
                    double lnDepth = arrRotatePoints[i].Depth;
                    if (!uniqueDepths.ContainsKey(lnDepth))
                    {
                        uniqueDepths.Add(lnDepth, lnDepth);
                    }
                }

                Dictionary<double, CombinedPUSO> list = new Dictionary<double, CombinedPUSO>();


                // 'For each depth, find points ...
                foreach (double lnDepth in uniqueDepths.Values)
                {


                    // 'For each depth, there may be multiple points ... 
                    // 'Find out max count for this depth

                    int MaxCount = 0;
                    int puCount = 0;
                    int soCount = 0;
                    int rotateCount = 0;
                    Dictionary<double, PUSOPoint> subPUPoints = new Dictionary<double, PUSOPoint>();
                    Dictionary<double, PUSOPoint> subSOPoints = new Dictionary<double, PUSOPoint>();
                    Dictionary<double, PUSOPoint> subRotatePoints = new Dictionary<double, PUSOPoint>();
                    for (int i = 0, loopTo3 = arrPUPoints.Length - 1; i <= loopTo3; i++)
                    {
                        if (arrPUPoints[i].Depth == lnDepth)
                        {
                            puCount += 1;
                            subPUPoints.Add(subPUPoints.Count + 1, arrPUPoints[i].getCopy());
                        }
                    }

                    for (int i = 0, loopTo4 = arrSOPoints.Length - 1; i <= loopTo4; i++)
                    {
                        if (arrSOPoints[i].Depth == lnDepth)
                        {
                            soCount += 1;
                            subSOPoints.Add(subSOPoints.Count + 1, arrSOPoints[i].getCopy());
                        }
                    }

                    for (int i = 0, loopTo5 = arrRotatePoints.Length - 1; i <= loopTo5; i++)
                    {
                        if (arrRotatePoints[i].Depth == lnDepth)
                        {
                            rotateCount += 1;
                            subRotatePoints.Add(subRotatePoints.Count + 1, arrRotatePoints[i].getCopy());
                        }
                    }

                    PUSOPoint[] arrSubPUPoints = subPUPoints.Values.ToArray();
                    PUSOPoint[] arrSubSOPoints = subSOPoints.Values.ToArray();
                    PUSOPoint[] arrSubRotatePoints = subRotatePoints.Values.ToArray();
                    if (puCount > MaxCount)
                    {
                        MaxCount = puCount;
                    }

                    if (soCount > MaxCount)
                    {
                        MaxCount = soCount;
                    }

                    if (rotateCount > MaxCount)
                    {
                        MaxCount = rotateCount;
                    }



                    // 'Multiple Points at same depth ...
                    for (int i = 0, loopTo6 = MaxCount - 1; i <= loopTo6; i++)
                    {
                        CombinedPUSO objCombinedPoint = new CombinedPUSO();

                        // 'Pick Up ...
                        if (i <= arrSubPUPoints.Length - 1)
                        {

                            // 'Record it ...
                            objCombinedPoint.Depth = arrSubPUPoints[i].Depth;
                            objCombinedPoint.DynamicPU = arrSubPUPoints[i].DynamicValue;
                            if (arrSubPUPoints[i].PumpStatus == PUSOPoint.pusoPumpStatus.PumpOn)
                            {
                                objCombinedPoint.PUPumpStatus = 1;
                            }
                            else
                            {
                                objCombinedPoint.PUPumpStatus = 0;
                            }

                            switch (_objSetup.pickupPointSelectionMethod)
                            {
                                case BroomStickSetup.bmStaticMethod.Min:
                                    {
                                        objCombinedPoint.StaticPU = arrSubPUPoints[i].Min;
                                        break;
                                    }

                                case BroomStickSetup.bmStaticMethod.Max:
                                    {
                                        objCombinedPoint.StaticPU = arrSubPUPoints[i].Max;
                                        break;
                                    }

                                case BroomStickSetup.bmStaticMethod.Avg:
                                    {
                                        objCombinedPoint.StaticPU = arrSubPUPoints[i].Avg;
                                        break;
                                    }
                            }
                        }

                        // 'Slack Off ...
                        if (i <= arrSubSOPoints.Length - 1)
                        {

                            // 'Record it ...
                            objCombinedPoint.Depth = arrSubSOPoints[i].Depth;
                            objCombinedPoint.DynamicSO = arrSubSOPoints[i].DynamicValue;
                            if (arrSubSOPoints[i].PumpStatus == PUSOPoint.pusoPumpStatus.PumpOn)
                            {
                                objCombinedPoint.SOPumpStatus = 1;
                            }
                            else
                            {
                                objCombinedPoint.SOPumpStatus = 0;
                            }

                            switch (_objSetup.slackOffPointSelectionMethod)
                            {
                                case BroomStickSetup.bmStaticMethod.Min:
                                    {
                                        objCombinedPoint.StaticSO = arrSubSOPoints[i].Min;
                                        break;
                                    }

                                case BroomStickSetup.bmStaticMethod.Max:
                                    {
                                        objCombinedPoint.StaticSO = arrSubSOPoints[i].Max;
                                        break;
                                    }

                                case BroomStickSetup.bmStaticMethod.Avg:
                                    {
                                        objCombinedPoint.StaticSO = arrSubSOPoints[i].Avg;
                                        objCombinedPoint.StaticSO2 = arrSubSOPoints[i].Avg2;
                                        break;
                                    }
                            }
                        }


                        // 'Rotate ...
                        if (i <= arrSubRotatePoints.Length - 1)
                        {

                            // 'Record it ...
                            objCombinedPoint.Depth = arrSubRotatePoints[i].Depth;
                            objCombinedPoint.Rotate = arrSubRotatePoints[i].DynamicValue;
                            if (arrSubRotatePoints[i].PumpStatus == PUSOPoint.pusoPumpStatus.PumpOn)
                            {
                                objCombinedPoint.PUPumpStatus = 1;
                            }
                            else
                            {
                                objCombinedPoint.PUPumpStatus = 0;
                            }
                        }

                        if (objCombinedPoint.DynamicPU == 0 && objCombinedPoint.DynamicSO == 0 && objCombinedPoint.Rotate == 0)
                        {
                        }

                        // 'Do not add to the list ...

                        else
                        {

                            // 'Add it to the list ...
                            list.Add(list.Count + 1, objCombinedPoint);
                        }
                    }
                }

                return list;
            }
            catch (Exception ex)
            {
                return new Dictionary<double, CombinedPUSO>();
            }
        }

        private wellSection GetPUSOSettingsfromWellSection(double paramDepth)
        {
            try
            {
                foreach (wellSection objWellSection_ in WellSectionList.Values)
                {
                    if (paramDepth >= objWellSection_.StartDepth && paramDepth <= objWellSection_.EndDepth)
                    {
                        return objWellSection_;
                    }
                }

                return default;
            }
            catch (Exception ex)
            {
            }

            return default;
        }

        private wellSection getPUSOSettingsfromWellSection(double paramDepth)
        {
            try
            {
                foreach (wellSection objWellSection_ in WellSectionList.Values)
                {
                    if (paramDepth >= objWellSection_.StartDepth && paramDepth <= objWellSection_.EndDepth)
                    {
                        return objWellSection_;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                return default;
            }
                      
        }

        //public void processPointsAsync(ref TimeLog objTimeLog, DateTime fromDate, DateTime toDate, BroomStickSetup objSetup)
        //{
        //    try
        //    {
        //        PercentageComplete = 0;
        //        _objTimeLog = objTimeLog;
        //        _fromDate = fromDate;
        //        _toDate = toDate;
        //        _objSetup = objSetup;
        //        Thread objThread = new System.Threading.Thread(ProcessPoints);
        //        objThread.IsBackground = true;
        //        objThread.Start();
        //    }
        //    catch (Exception ex)
        //    {
        //    }
        //}

        public void ProcessPoints(BroomStickSetup paramObjSetup)
        {
            try
            {
                _objSetup = paramObjSetup;
                objLocalConn = objDataService;


                objAdnlHookloadPlan.Clear();

                switch (DocumentMode)
                {
                    case enumDocumentMode.HookloadDocument:
                        objAdnlHookloadPlan = AdnlHookloadPlan.getList(ref objDataService, WellID, Wellbore.getAnyWellboreID(ref objDataService, WellID), _objTimeLog.ObjectID, "HKLDP");
                        break;
                    case enumDocumentMode.TorqueDocument:
                        objAdnlHookloadPlan = AdnlHookloadPlan.getList(ref objDataService, WellID, Wellbore.getAnyWellboreID(ref objDataService, WellID), _objTimeLog.ObjectID, "TORP");
                        break;
                    case enumDocumentMode.ConnectionHkld:
                        objAdnlHookloadPlan = AdnlHookloadPlan.getList(ref objDataService, WellID, Wellbore.getAnyWellboreID(ref objDataService, WellID), _objTimeLog.ObjectID, "HKLDP");
                        break;
                    case enumDocumentMode.ConnectionTorque:
                        objAdnlHookloadPlan = AdnlHookloadPlan.getList(ref objDataService, WellID, Wellbore.getAnyWellboreID(ref objDataService, WellID), _objTimeLog.ObjectID, "TORP");
                        break;
                    default:
                        break;
                }

                //only take RunNo which is set in Setup
                if (_objSetup.RunNo == "")
                {
                    objAdnlHookloadPlan.Clear();
                }

            StartOver:
                foreach (AdnlHookloadPlan objPlan in objAdnlHookloadPlan.Values)
                {
                    if (_objSetup.RunNo != objPlan.RunNo)
                    {
                        objAdnlHookloadPlan.Remove(objPlan.PlanID);
                        goto StartOver;
                    }
                }







                // '(1) No filter applied ...
                if (_objSetup.objTimeFilter.FilterStatus == false && _objSetup.objTimeFilter.FilterByEvents == false)
                {
                    // 'No filter applied ... default last 24 hours ...

                    // 'Take last 24 hours
                    
                    _toDate = DateTime.FromOADate(_objTimeLog.getLastIndexOptimized(ref objDataService));
                    _fromDate = _toDate.AddHours(-24);
                }


                // '*******************************************************************************************************''
                // '***** Date Range Filter *******************************************************************************''
                // '*******************************************************************************************************''

                if (_objSetup.objTimeFilter.FilterStatus == true)
                {
                    if (_objSetup.objTimeFilter.FilterType == vFilterType.LastData)
                    {
                        _toDate = DateTime.FromOADate(_objTimeLog.getLastIndexOptimized(ref objDataService));
                        _fromDate = _toDate.AddHours(-1 * _objSetup.objTimeFilter.LastPeriod);
                    }

                    if (_objSetup.objTimeFilter.FilterType == vFilterType.SpecificRange)
                    {
                        _fromDate = DateTime.Parse(_objSetup.objTimeFilter.FromDateTime);
                        _toDate = DateTime.Parse(_objSetup.objTimeFilter.ToDateTime);
                    }

                    if (_objSetup.objTimeFilter.FilterType == vFilterType.OpenEnded)
                    {
                        _fromDate = DateTime.Parse(_objSetup.objTimeFilter.FromDateTime);
                        _toDate = DateTime.FromOADate(_objTimeLog.getLastIndexOptimized(ref objDataService));
                    }

                  
                }

                TimeLog objTimeLog = _objTimeLog;
                DateTime fromDate = _fromDate;
                DateTime toDate = _toDate;

                // 'Nishant
                WellSectionList = new Dictionary<int, wellSection>();
                //WellSectionList = wellSection.getList(Global.objDataService, objTimeLog.WellID);
                WellSectionList = wellSection.getList(objDataService, objTimeLog.WellID);

                // '*****************


                ProcessStatus = 1;
                PUPoints.Clear();
                SOPoints.Clear();
                RotatePoints.Clear();


                // 'Prepare rig states 

                if (_objSetup.pickupRigStates is null)
                {
                    _objSetup.pickupRigStates = "";
                }

                if (_objSetup.slackOffRigStates is null)
                {
                    _objSetup.slackOffRigStates = "";
                }

                if (_objSetup.rotateRigStates is null)
                {
                    _objSetup.rotateRigStates = "";
                }


                // '#### Pickup Rig States ###########################################
                if (_objSetup.pickupRigStates.Trim() == "")
                {
                    _objSetup.pickupRigStates = "8,10,28";
                }

                string[] arrRigStates = _objSetup.pickupRigStates.Split(',');
                for (int i = 0, loopTo = arrRigStates.Length - 1; i <= loopTo; i++)
                {
                    if (!pkupRigStates.ContainsKey(Convert.ToInt16(arrRigStates[i])))
                    {
                        pkupRigStates.Add(Convert.ToInt16(arrRigStates[i]), Convert.ToInt16(arrRigStates[i]));
                    }
                }

                // '###### Slack Off Rig States ##########################################
                if (_objSetup.slackOffRigStates.Trim() == "")
                {
                    _objSetup.slackOffRigStates = "6,4,27";
                }

                arrRigStates = _objSetup.slackOffRigStates.Split(',');
                for (int i = 0; i <= arrRigStates.Length - 1; i++)
                {
                    if (!slkRigStates.ContainsKey(Convert.ToInt16(arrRigStates[i])))
                    {
                        slkRigStates.Add(Convert.ToInt16(arrRigStates[i]), Convert.ToInt16(arrRigStates[i]));
                    }
                }


                // '###### Rot Rig States ##################################################
                if (_objSetup.rotateRigStates.Trim() == "")
                {
                    _objSetup.rotateRigStates = "11,12,13";
                }

                arrRigStates = _objSetup.rotateRigStates.Split(',');
                for (int i = 0; i <= arrRigStates.Length - 1; i++)
                {
                    if (!rotRigStates.ContainsKey(Convert.ToInt16(arrRigStates[i])))
                    {
                        rotRigStates.Add(Convert.ToInt16(arrRigStates[i]), Convert.ToInt16(arrRigStates[i]));
                    }
                }

                
                //if (objADSettings.IsADActive)
                //{
                //    objLocalConn = new DataService(VuMaxDR.Data.DataService.vmDatabaseType.SQLServer, "2008", true, true);
                //}
                //else
                //{
                //    objLocalConn = new DataService(VuMaxDR.Data.DataService.vmDatabaseType.SQLServer, "2008", true);
                //}

                //objLocalConn.OpenConnection(objDataService.UserName, objDataService.Password, objDataService.ServerName);

                if (objTimeLog is null)
                {
                    warnings += "TimeLog not Found (null).";
                    //return void
                }

                // 'Load Settings
                string strCheck1 = WellSettings.getWellSetting(ref objLocalConn, WellID, WellSettings.WLS_CONN_SETTING1, "1");
                string strCheck2 = WellSettings.getWellSetting(ref objLocalConn, WellID, WellSettings.WLS_CONN_SETTING2, "1");
                if (Convert.ToInt16(strCheck1) == 1)
                {
                    RUN_DRLG_CHECK = true;
                }
                else
                {
                    RUN_DRLG_CHECK = false;
                }

                if (Convert.ToInt16(strCheck2) == 1)
                {
                    RUN_HKLD_CHECK = true;
                }
                else
                {
                    RUN_HKLD_CHECK = false;
                }

                DateTime maxDate = DateTime.MinValue;

                // 'Load previously stored points from the database
                //If DocumentMode = HookloadDocument.enumDocumentMode.ConnectionHkld Or(DocumentMode = HookloadDocument.enumDocumentMode.HookloadDocument And CombinedMode = True) Then
                if (DocumentMode == enumDocumentMode.ConnectionHkld || DocumentMode == enumDocumentMode.HookloadDocument && CombinedMode == true)
                {
                    // 'Load hookload points
                    loadPointsFromDBHookload();
                    maxDate = getLastProcessDate(0);
                }
                else
                {
                    // 'Load torque points
                    loadPointsFromDBTorque();
                    maxDate = getLastProcessDate(1);
                }

                string __dataTableName = objTimeLog.getDataTableName(ref objLocalConn);
                string strSQL = "";
                if (maxDate != DateTime.MinValue)
                {
                    strSQL = "SELECT DATETIME,TIME_DURATION,DEPTH,HDTH,HKLD,RIG_STATE,STOR,CIRC,SPPA,RPM FROM " + __dataTableName + " WHERE DATETIME>='" + maxDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IS NOT NULL ORDER BY DATETIME DESC";
                }
                else
                {
                    strSQL = "SELECT DATETIME,TIME_DURATION,DEPTH,HDTH,HKLD,RIG_STATE,STOR,CIRC,SPPA,RPM FROM " + __dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IS NOT NULL ORDER BY DATETIME DESC";
                }

                DataTable objData = objLocalConn.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {
                    int totalRows = objData.Rows.Count;
                    int connCounter = 0;
                    for (int i = 0, loopTo3 = objData.Rows.Count - 1; i <= loopTo3; i++)
                    {
                        int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                        double lnHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                        if (lnRigState == 2 || lnRigState == 13 && lnHkld < objRigState.HookloadCutOff)
                        {
                            int forwardPointer = i;

                            // 'Check if it's valid connection
                            int pnDrillingStartRow = 0;
                            int pnInSlipsStartRow = 0;
                            double pnInSlipsDepth = 0;
                            double pnInSlipsHoleDepth = 0;
                            int pnDrillingEndRow = 0;
                                                        
                            if (IsValidConnection(objData, i,  ref forwardPointer, ref pnDrillingStartRow, ref pnInSlipsStartRow, ref pnInSlipsDepth, ref pnDrillingEndRow))
                            {
                                pnInSlipsStartRow = i;
                                pnInSlipsDepth = Convert.ToDouble( objData.Rows[i]["DEPTH"]);
                                pnInSlipsHoleDepth = Convert.ToDouble( objData.Rows[i]["HDTH"]);
                                detectAndAddPoints(objData, pnDrillingStartRow, pnInSlipsStartRow, pnInSlipsDepth, pnInSlipsHoleDepth, pnDrillingEndRow);
                                connCounter += 1;
                            }

                            i = forwardPointer;
                        }

                        PercentageComplete = Math.Round(i * 100 / (double)totalRows, 2);
                    }
                }

                ProcessStatus = 0;

                // 'objFile.Close()

                // 'finally group by depths
                if (!_objSetup.ShowMultiplePoints)
                {
                    groupByDepth();
                }

                if (_objSetup.EnforceRule)
                {
                    enforceRule();
                }

                RefreshRequired = true;
                // '==================================================================================''

                // 'Load previously stored points from the database
                if (DocumentMode == enumDocumentMode.ConnectionHkld || DocumentMode == enumDocumentMode.HookloadDocument && CombinedMode == true)
                {
                    clearPointsFromDBHookload();
                    savePointsToDBHookload();
                    if (objData.Rows.Count > 0)
                    {
                        DateTime dataLastDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objDataService));
                        if (toDate > dataLastDate)
                        {
                            toDate = dataLastDate;
                        }
                    }

                    if (toDate >= maxDate)
                    {
                        saveProcessInfo(toDate.AddHours(-1), 0);
                    }
                }
                else
                {
                    // 'Load torque points
                    clearPointsFromDBTorque();
                    savePointsToDBTorque();
                    if (objData.Rows.Count > 0)
                    {
                        DateTime dataLastDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objDataService));
                        if (toDate > dataLastDate)
                        {
                            toDate = dataLastDate;
                        }
                    }

                    if (toDate >= maxDate)
                    {
                        saveProcessInfo(toDate.AddHours(-1), 1);
                    }
                }

                objData.Dispose();
                //objLocalConn.closeConnection();
                //return Newtonsoft.Json.JsonConvert.SerializeObject(this);
            }
            catch (Exception ex)
            {
                //return Newtonsoft.Json.JsonConvert.SerializeObject(this);
            }
        }



        public void savePointsToDBHookload()
        {
            try
            {


                // '=============== Save Broomstick Points to the database ===========================''

                // 'Always overwrite based on Well ID + Type + Depth

                // 'Point Type 
                // 0 - PUPoints
                // 1 - SOPoints
                // 2 - RotatePoints

                // 'Round the depth by 2 digit

                // '//Remove existing points from the database
                string strSQL = "";
                foreach (PUSOPoint objItem in PUPoints.Values)
                {

                    // 'Delete this specific point
                    strSQL = "DELETE FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + WellID + "' AND DEPTH=" + objItem.Depth.ToString() + " AND TYPE=0";
                    objDataService.executeNonQuery(strSQL);

                    // 'Insert it again
                    strSQL = "INSERT INTO VMX_BROOMSTICK_POINTS (WELL_ID,DEPTH,TYPE,START_DATE,END_DATE,START_INDEX,END_INDEX,MIN,MAX,AVG,AVG2,START_DEPTH,END_DEPTH,BLOCK_MOVEMENT,MAX_INDEX,DYNAMIC_VALUE,DYNAMIC_TORQUE_VALUE,CIRCULATION,PUMP_PRESSURE,USER_DYNAMIC_VALUE,USER_STATIC_VALUE,USER_VISIBLE,PUMP_STATUS,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
                    strSQL += "'" + WellID + "',";
                    strSQL += "" + objItem.Depth.ToString() + ",";
                    strSQL += "" + "0" + ",";
                    if (objItem.StartDate == new DateTime())
                    {
                        strSQL += "NULL,";
                    }
                    else
                    {
                        strSQL += "'" + objItem.StartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    }

                    if (objItem.EndDate == new DateTime())
                    {
                        strSQL += "NULL,";
                    }
                    else
                    {
                        strSQL += "'" + objItem.EndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    }

                    strSQL += "" + objItem.StartIndex.ToString() + ",";
                    strSQL += "" + objItem.EndIndex.ToString() + ",";
                    strSQL += "" + objItem.Min.ToString() + ",";
                    strSQL += "" + objItem.Max.ToString() + ",";
                    strSQL += "" + objItem.Avg.ToString() + ",";
                    strSQL += "" + objItem.Avg2.ToString() + ",";
                    strSQL += "" + objItem.StartDepth.ToString() + ",";
                    strSQL += "" + objItem.EndDepth.ToString() + ",";
                    strSQL += "" + objItem.BlockMovement.ToString() + ",";
                    strSQL += "" + objItem.MaxIndex.ToString() + ",";
                    strSQL += "" + objItem.DynamicValue.ToString() + ",";
                    strSQL += "" + objItem.DynamicTorqueValue.ToString() + ",";
                    strSQL += "" + objItem.Circulation.ToString() + ",";
                    strSQL += "" + objItem.PumpPressure.ToString() + ",";
                    strSQL += "" + objItem.UserDynamicValue.ToString() + ",";
                    strSQL += "" + objItem.UserStaticValue.ToString() + ",";
                    strSQL += "" + Global.Iif(objItem.UserVisible == true, 1, 0).ToString() + ",";
                    strSQL += "" + Convert.ToInt32(objItem.PumpStatus)+ ",";
                    strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
                    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
                    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
                    objDataService.executeNonQuery(strSQL);
                }

                foreach (PUSOPoint objItem in SOPoints.Values)
                {

                    // 'Delete this specific point
                    strSQL = "DELETE FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + WellID + "' AND DEPTH=" + objItem.Depth.ToString() + " AND TYPE=1";
                    objDataService.executeNonQuery(strSQL);
                    strSQL = "INSERT INTO VMX_BROOMSTICK_POINTS (WELL_ID,DEPTH,TYPE,START_DATE,END_DATE,START_INDEX,END_INDEX,MIN,MAX,AVG,AVG2,START_DEPTH,END_DEPTH,BLOCK_MOVEMENT,MAX_INDEX,DYNAMIC_VALUE,DYNAMIC_TORQUE_VALUE,CIRCULATION,PUMP_PRESSURE,USER_DYNAMIC_VALUE,USER_STATIC_VALUE,USER_VISIBLE,PUMP_STATUS,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
                    strSQL += "'" + WellID + "',";
                    strSQL += "" + objItem.Depth.ToString() + ",";
                    strSQL += "" + "1" + ",";
                    if (objItem.StartDate == new DateTime())
                    {
                        strSQL += "NULL,";
                    }
                    else
                    {
                        strSQL += "'" + objItem.StartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    }

                    if (objItem.EndDate == new DateTime())
                    {
                        strSQL += "NULL,";
                    }
                    else
                    {
                        strSQL += "'" + objItem.EndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    }

                    strSQL += "" + objItem.StartIndex.ToString() + ",";
                    strSQL += "" + objItem.EndIndex.ToString() + ",";
                    strSQL += "" + objItem.Min.ToString() + ",";
                    strSQL += "" + objItem.Max.ToString() + ",";
                    strSQL += "" + objItem.Avg.ToString() + ",";
                    strSQL += "" + objItem.Avg2.ToString() + ",";
                    strSQL += "" + objItem.StartDepth.ToString() + ",";
                    strSQL += "" + objItem.EndDepth.ToString() + ",";
                    strSQL += "" + objItem.BlockMovement.ToString() + ",";
                    strSQL += "" + objItem.MaxIndex.ToString() + ",";
                    strSQL += "" + objItem.DynamicValue.ToString() + ",";
                    strSQL += "" + objItem.DynamicTorqueValue.ToString() + ",";
                    strSQL += "" + objItem.Circulation.ToString() + ",";
                    strSQL += "" + objItem.PumpPressure.ToString() + ",";
                    strSQL += "" + objItem.UserDynamicValue.ToString() + ",";
                    strSQL += "" + objItem.UserStaticValue.ToString() + ",";
                    strSQL += "" + Global.Iif(objItem.UserVisible == true, 1, 0).ToString() + ",";
                    strSQL += "" + Convert.ToInt32(objItem.PumpStatus) + ",";
                    strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
                    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
                    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
                    objDataService.executeNonQuery(strSQL);
                }

                foreach (PUSOPoint objItem in RotatePoints.Values)
                {

                    // 'Delete this specific point
                    strSQL = "DELETE FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + WellID + "' AND DEPTH=" + objItem.Depth.ToString() + " AND TYPE=2";
                    objDataService.executeNonQuery(strSQL);
                    strSQL = "INSERT INTO VMX_BROOMSTICK_POINTS (WELL_ID,DEPTH,TYPE,START_DATE,END_DATE,START_INDEX,END_INDEX,MIN,MAX,AVG,AVG2,START_DEPTH,END_DEPTH,BLOCK_MOVEMENT,MAX_INDEX,DYNAMIC_VALUE,DYNAMIC_TORQUE_VALUE,CIRCULATION,PUMP_PRESSURE,USER_DYNAMIC_VALUE,USER_STATIC_VALUE,USER_VISIBLE,PUMP_STATUS,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
                    strSQL += "'" + WellID + "',";
                    strSQL += "" + objItem.Depth.ToString() + ",";
                    strSQL += "" + "2" + ",";
                    if (objItem.StartDate == new DateTime())
                    {
                        strSQL += "NULL,";
                    }
                    else
                    {
                        strSQL += "'" + objItem.StartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    }

                    if (objItem.EndDate == new DateTime())
                    {
                        strSQL += "NULL,";
                    }
                    else
                    {
                        strSQL += "'" + objItem.EndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    }

                    strSQL += "" + objItem.StartIndex.ToString() + ",";
                    strSQL += "" + objItem.EndIndex.ToString() + ",";
                    strSQL += "" + objItem.Min.ToString() + ",";
                    strSQL += "" + objItem.Max.ToString() + ",";
                    strSQL += "" + objItem.Avg.ToString() + ",";
                    strSQL += "" + objItem.Avg2.ToString() + ",";
                    strSQL += "" + objItem.StartDepth.ToString() + ",";
                    strSQL += "" + objItem.EndDepth.ToString() + ",";
                    strSQL += "" + objItem.BlockMovement.ToString() + ",";
                    strSQL += "" + objItem.MaxIndex.ToString() + ",";
                    strSQL += "" + objItem.DynamicValue.ToString() + ",";
                    strSQL += "" + objItem.DynamicTorqueValue.ToString() + ",";
                    strSQL += "" + objItem.Circulation.ToString() + ",";
                    strSQL += "" + objItem.PumpPressure.ToString() + ",";
                    strSQL += "" + objItem.UserDynamicValue.ToString() + ",";
                    strSQL += "" + objItem.UserStaticValue.ToString() + ",";
                    strSQL += "" + Global.Iif(objItem.UserVisible == true, 1, 0).ToString() + ",";
                    strSQL += "" + Convert.ToInt32(objItem.PumpStatus) + ",";
                    strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
                    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
                    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
                    objDataService.executeNonQuery(strSQL);
                }
            }


            // '==================================================================================''

            catch (Exception ex)
            {
            }
        }


        public void savePointsToDBTorque()
        {
            try
            {


                // '=============== Save Broomstick Points to the database ===========================''

                // 'Always overwrite based on Well ID + Type + Depth

                // 'Point Type 
                // 0 - PUPoints
                // 1 - SOPoints
                // 2 - RotatePoints

                // 'Round the depth by 2 digit

                // '//Remove existing points from the database
                string strSQL = "";
                foreach (PUSOPoint objItem in RotatePoints.Values)
                {

                    // 'Delete this specific point
                    strSQL = "DELETE FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + WellID + "' AND DEPTH=" + objItem.Depth.ToString() + " AND TYPE=3";
                    objDataService.executeNonQuery(strSQL);
                    strSQL = "INSERT INTO VMX_BROOMSTICK_POINTS (WELL_ID,DEPTH,TYPE,START_DATE,END_DATE,START_INDEX,END_INDEX,MIN,MAX,AVG,AVG2,START_DEPTH,END_DEPTH,BLOCK_MOVEMENT,MAX_INDEX,DYNAMIC_VALUE,DYNAMIC_TORQUE_VALUE,CIRCULATION,PUMP_PRESSURE,USER_DYNAMIC_VALUE,USER_STATIC_VALUE,USER_VISIBLE,PUMP_STATUS,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
                    strSQL += "'" + WellID + "',";
                    strSQL += "" + objItem.Depth.ToString() + ",";
                    strSQL += "" + "3" + ",";
                    if (objItem.StartDate == new DateTime())
                    {
                        strSQL += "NULL,";
                    }
                    else
                    {
                        strSQL += "'" + objItem.StartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    }

                    if (objItem.EndDate == new DateTime())
                    {
                        strSQL += "NULL,";
                    }
                    else
                    {
                        strSQL += "'" + objItem.EndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    }

                    strSQL += "" + objItem.StartIndex.ToString() + ",";
                    strSQL += "" + objItem.EndIndex.ToString() + ",";
                    strSQL += "" + objItem.Min.ToString() + ",";
                    strSQL += "" + objItem.Max.ToString() + ",";
                    strSQL += "" + objItem.Avg.ToString() + ",";
                    strSQL += "" + objItem.Avg2.ToString() + ",";
                    strSQL += "" + objItem.StartDepth.ToString() + ",";
                    strSQL += "" + objItem.EndDepth.ToString() + ",";
                    strSQL += "" + objItem.BlockMovement.ToString() + ",";
                    strSQL += "" + objItem.MaxIndex.ToString() + ",";
                    strSQL += "" + objItem.DynamicValue.ToString() + ",";
                    strSQL += "" + objItem.DynamicTorqueValue.ToString() + ",";
                    strSQL += "" + objItem.Circulation.ToString() + ",";
                    strSQL += "" + objItem.PumpPressure.ToString() + ",";
                    strSQL += "" + objItem.UserDynamicValue.ToString() + ",";
                    strSQL += "" + objItem.UserStaticValue.ToString() + ",";
                    strSQL += "" + Global.Iif(objItem.UserVisible == true, 1, 0).ToString() + ",";
                    strSQL += "" + Convert.ToInt32(objItem.PumpStatus) + ",";
                    strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
                    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
                    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
                    objDataService.executeNonQuery(strSQL);
                }
            }


            // '==================================================================================''

            catch (Exception ex)
            {
            }
        }


        public void clearPointsFromDBTorque()
        {
            try
            {
                string strSQL = "";
                strSQL = "DELETE FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + WellID.Replace("'", "''") + "' AND START_DATE>='" + _fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND END_DATE<='" + _toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TYPE IN (3)";
                objDataService.executeNonQuery(strSQL);
            }
            catch (Exception ex)
            {
            }
        }


        public void saveProcessInfo(DateTime paramLastDate, int paramType)
        {
            try
            {
                string strSQL = "DELETE FROM VMX_BROOMSTICK_PRC_INFO WHERE WELL_ID='" + WellID + "' AND TYPE=" + paramType.ToString();
                objDataService.executeNonQuery(strSQL);
                strSQL = "INSERT INTO VMX_BROOMSTICK_PRC_INFO (WELL_ID,TYPE,PRC_LAST_DATE) VALUES(";
                strSQL += "'" + WellID.Replace("'", "''") + "',";
                strSQL += "" + paramType.ToString() + ",";
                strSQL += "'" + paramLastDate.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
                objDataService.executeNonQuery(strSQL);
            }
            catch (Exception ex)
            {
            }
        }


        public void clearPointsFromDBHookload()
        {
            try
            {
                string strSQL = "";
                strSQL = "DELETE FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + WellID.Replace("'", "''") + "' AND START_DATE>='" + _fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND END_DATE<='" + _toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TYPE IN (0,1,2)";
                objDataService.executeNonQuery(strSQL);
            }
            catch (Exception ex)
            {
            }
        }

        public bool IsValidConnection(DataTable objData, int currentRowIndex, ref int forwardPointer, ref int paramDrillingStartRow, ref int paramlnInSlipsRowIndex, ref double paramlnInSlipsDepth, ref int paramDrillingEndRow)
        {
            try
            {
                double lnHKldCutOff = objRigState.HookloadCutOff;
                double lnInSlipsDepth = Convert.ToDouble(objData.Rows[currentRowIndex]["DEPTH"]);
                double lnHoleDepth = Convert.ToDouble(objData.Rows[currentRowIndex]["HDTH"]);
                int lnInSlipsRowIndex = currentRowIndex;

                bool rotateDataFound = false;
                bool isDrillingConnection = false;
                bool isDrillingFound = false;
                bool isNextDrillingFound = false;
                DateTime pointerDate = Convert.ToDateTime(objData.Rows[currentRowIndex]["DATETIME"]);
                int rowThreshold = 5 * 60;  // '3 Hours is the limit ... it's a case when rig is in service
                int timeThreshold = 5 * 60; // 'time threshold in minutes ... 5 hours ...
                DateTime lowerLimit = pointerDate.AddMinutes(-1 * timeThreshold);
                DateTime upperLimit = pointerDate.AddMinutes(timeThreshold);
                int searchLimit = currentRowIndex + ((rowThreshold * 60) / 5);

                if (searchLimit > objData.Rows.Count - 1)
                {
                    searchLimit = objData.Rows.Count - 1;
                }

                DateTime drillingEndTime = new DateTime();
                DateTime drillingStartTime = new DateTime();
                DateTime slipsStartTime = new DateTime();
                DateTime slipsEndTime = new DateTime();
                DateTime slipsToBottomTime = new DateTime();
                int drillingEndRowIndex = 0;
                int slipsStartRowIndex = 0;
                int slipsEndRowIndex = 0;
                int slipsToBottomRowIndex = 0;
                int drillingStartRowIndex = 0;
                int depthCounter = 0;
                double drillingEndHkld = 0;

                double depthDiff = lnHoleDepth - lnInSlipsDepth;
                if (depthDiff > MAX_DEPTH_DIFF)
                {
                    forwardPointer = forwardPointer + 12 * 60;
                    // 'reject it ... it's not a connection
                    return false;
                }

                bool InSlipsRigStateFound = false;

                // 'Go back upto 60 minutes and find out ...
                for (int i = currentRowIndex, loopTo = objData.Rows.Count - 1; i <= loopTo; i++)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    drillingEndTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                    drillingEndRowIndex = i;
                    drillingEndHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    if (drillingEndTime <= lowerLimit)
                    {
                        break;
                    }

                    if (lnRigState == 0 || lnRigState == 1 || lnRigState == 19)
                    {

                        // 'check if it's a drilling for at least 1 minute ...
                        DateTime currentDate = drillingEndTime;
                        bool isConstantlyDrilling = true;
                        int lnBreakRow = i;
                        for (int j = i, loopTo1 = objData.Rows.Count - 1; j <= loopTo1; j++)
                        {
                            int lnSubRigState = Convert.ToInt16( objData.Rows[j]["RIG_STATE"]);
                            DateTime lnSubDate = Convert.ToDateTime( objData.Rows[j]["DATETIME"]);

                            //if (Math.Abs(DateAndTime.DateDiff(DateInterval.Second, currentDate, lnSubDate)) >= 60L)
                            //{
                            //    break;
                            //}

                            if ((currentDate - lnSubDate).TotalSeconds > 60)
                            {
                                break;
                            }

                            if (lnSubRigState == 0 || lnSubRigState == 1 || lnSubRigState == 19)
                            {
                            }
                            // 'Do nothing ...
                            else
                            {
                                isConstantlyDrilling = false;
                                lnBreakRow = j;
                                break;
                            }
                        }

                        // '### Continuous Drilling Check ######''
                        if (!RUN_DRLG_CHECK)
                        {
                            isConstantlyDrilling = true;
                        }
                        // '####################################''

                        if (!isConstantlyDrilling)
                        {
                            bool subDrillingRowFound = false;
                            for (int j = lnBreakRow, loopTo2 = objData.Rows.Count - 1; j <= loopTo2; j++)
                            {
                                int lnSubRigState =  Convert.ToInt16( objData.Rows[j]["RIG_STATE"]);
                                DateTime lnSubDate = Convert.ToDateTime( objData.Rows[j]["DATETIME"]);
                                if (lnSubDate <= lowerLimit)
                                {
                                    break;
                                }

                                if (lnSubRigState == 0 || lnSubRigState == 1 || lnSubRigState == 19)
                                {
                                    subDrillingRowFound = true;
                                    drillingEndTime = Convert.ToDateTime( objData.Rows[j]["DATETIME"]);
                                    drillingEndRowIndex = j;
                                    drillingEndHkld = Convert.ToDouble( objData.Rows[j]["HKLD"]);
                                    isDrillingFound = true;
                                    break;
                                }
                            }

                            // '### Continuous Drilling Check ######''
                            if (!RUN_DRLG_CHECK)
                            {
                                subDrillingRowFound = true;
                            }
                            // '####################################''

                            if (!subDrillingRowFound)
                            {
                                isDrillingFound = false;
                                break;
                            }
                        }

                        isDrillingFound = true;
                        break;
                    }
                }

                //New code start
                for (int i = currentRowIndex; i >= 0; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    drillingStartTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                    drillingStartRowIndex = i;
                    if (drillingStartTime >= upperLimit)
                    {
                        break;
                    }

                    if (lnRigState == 0 || lnRigState == 1 || lnRigState == 19)
                    {

                        // 'Add 1 minute and find out if it's drilling continuous ...
                        DateTime lnEndLimitNextDrillingTime = drillingStartTime.AddSeconds(60);
                        bool isContinuousDrilling = true;
                        for (int j = i; j >= 0; j -= 1)
                        {
                            DateTime lnCurrentDateTime = Convert.ToDateTime( objData.Rows[j]["DATETIME"]);
                            if (lnCurrentDateTime >= upperLimit)
                            {
                                break;
                            }

                            if (lnCurrentDateTime >= lnEndLimitNextDrillingTime)
                            {
                                break;
                            }

                            int lnSubRigState = Convert.ToInt32( objData.Rows[j]["RIG_STATE"]);
                            if (lnSubRigState == 0 || lnSubRigState == 1 || lnSubRigState == 19)
                            {
                            }
                            // 'Nothing to do ...
                            else
                            {
                                isContinuousDrilling = false;
                            }
                        }

                        // '### Continuous Drilling Check ######''
                        if (!RUN_DRLG_CHECK)
                        {
                            isContinuousDrilling = true;
                        }
                        // '####################################''

                        if (isContinuousDrilling)
                        {
                            isNextDrillingFound = true;
                            break;
                        }
                    }
                }
                //New Line 2
                if (!isDrillingFound)
                {
                    forwardPointer = forwardPointer + 12 * 60;
                    return false;
                }
                else
                {
                    forwardPointer = drillingEndRowIndex;

                    // 'Connection Detection for Curve/Lateral
                    // 'Additional check to see if the bit is near bottom
                    double depthDiff2 = lnHoleDepth - lnInSlipsDepth;
                    if (depthDiff2 > MAX_DEPTH_DIFF)
                    {
                        // 'reject it ... it's not a connection
                        return false;
                    }
                }


                // 'Go backward and find the slip start time
                for (int i = drillingEndRowIndex - 1; i >= 0; i -= 1)
                {
                    double lnHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    if (lnHkld <= lnHKldCutOff || lnRigState == 2)
                    {
                        slipsStartRowIndex = i;
                        slipsStartTime = Convert.ToDateTime(objData.Rows[i]["DATETIME"]);
                        break;
                    }
                }

                if (slipsStartRowIndex > 0)
                {

                    // 'From the beginning of the slips, find the end time of slips
                    for (int i = slipsStartRowIndex - 1; i >= 0; i -= 1)
                    {
                        double lnHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                        if (lnHkld > lnHKldCutOff)
                        {
                            slipsEndRowIndex = i;
                            slipsEndTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                            break;
                        }
                    }

                    int rowThresholdNext = 60 * 24; // '24 Hours 
                    int searchLimitNext = currentRowIndex - rowThreshold * 60 / 5;
                    if (searchLimitNext < 0)
                    {
                        searchLimitNext = 0;
                    }

                    // 'Find the next bottom .... wait till the 
                    bool nextDrillingFound = false;
                    for (int i = slipsEndRowIndex - 1, loopTo = searchLimitNext; i >= loopTo; i -= 1)
                    {
                        int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                        if (lnRigState == 0 || lnRigState == 1 || lnRigState == 19)
                        {
                            // 'Check if it's proper slips to bottom time ...


                            // 'Add 1 minute and find out if it's drilling continuous ...
                            DateTime lnEndLimitNextDrillingTime = drillingStartTime.AddSeconds(60);
                            bool isContinuousDrilling = true;
                            for (int j = i; j >= 0; j -= 1)
                            {
                                DateTime lnCurrentDateTime = Convert.ToDateTime( objData.Rows[j]["DATETIME"]);
                                if (lnCurrentDateTime >= upperLimit)
                                {
                                    break;
                                }

                                if (lnCurrentDateTime >= lnEndLimitNextDrillingTime)
                                {
                                    break;
                                }

                                int lnSubRigState = Convert.ToInt32( objData.Rows[j]["RIG_STATE"]);
                                if (lnSubRigState == 0 || lnSubRigState == 1 || lnSubRigState == 19)
                                {
                                }
                                // 'Nothing to do ...
                                else
                                {
                                    isContinuousDrilling = false;
                                }
                            }

                            // '### Continuous Drilling Check ######''
                            if (!RUN_DRLG_CHECK)
                            {
                                isContinuousDrilling = true;
                            }
                            // '####################################''

                            if (isContinuousDrilling)
                            {
                                nextDrillingFound = true;
                                slipsToBottomRowIndex = i;
                                slipsToBottomTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                                break;
                            }
                        }
                    }

                    if (slipsToBottomTime == new DateTime())
                    {
                        slipsToBottomTime = slipsEndTime;
                    }

                    bool FoundHigherHkld = false;
                    for (int i = slipsEndRowIndex; i >= slipsToBottomRowIndex; i -= 1)
                    {
                        double lnHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                        if (lnHkld < lnHKldCutOff)
                        {
                            DateTime lnSubDate = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                            if (lnSubDate > slipsEndTime)
                            {
                                slipsEndRowIndex = i;
                                slipsEndTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                            }
                        }
                        else
                        {
                            FoundHigherHkld = true;
                        }
                    }

                    DateTime localTimeSlipStartTime = utilFunctionsDO.convertUTCToWellTimeZone(slipsStartTime,objWell);
                    DateTime localTimeSlipEndTime = utilFunctionsDO.convertUTCToWellTimeZone(slipsEndTime, objWell);
                    DateTime localSlipsToBottomTime = utilFunctionsDO.convertUTCToWellTimeZone(slipsToBottomTime,objWell);

                    double totalTime = Math.Abs((drillingEndTime - slipsToBottomTime).TotalSeconds);   //  Math.Abs(DateDiff(DateInterval.Second, drillingEndTime, slipsToBottomTime));
                    double Slot1Time = Math.Abs((drillingEndTime - slipsStartTime).TotalSeconds); // Math.Abs(DateDiff(DateInterval.Second, drillingEndTime, slipsStartTime)));
                    double Slot2Time = Math.Abs((slipsStartTime - slipsEndTime).TotalSeconds);  // Math.Abs(DateDiff(DateInterval.Second, slipsStartTime, slipsEndTime));
                    double Slot3Time = Math.Abs((slipsEndTime - slipsToBottomTime).TotalSeconds); // Math.Abs(DateDiff(DateInterval.Second, slipsEndTime, slipsToBottomTime));

                //line 3
                // '** New Logic ...
                    if (Slot1Time >= 5 && Slot2Time < 14400)
                {

                  
                    // 'Set the parameters ...
                    paramDrillingStartRow = drillingEndRowIndex;
                    paramlnInSlipsRowIndex = slipsStartRowIndex;
                    paramlnInSlipsDepth = Convert.ToInt32( lnInSlipsDepth);
                        paramDrillingEndRow = drillingStartRowIndex;
                    return true;
                }

                MoveForward:
                depthCounter += 1;
            }

            return false;
          
            }
            catch (Exception ex)
            {
            }

            return default(global::System.Boolean);
        }


        public void loadPointsFromDBHookload()
        {
            try
            {
                string strSQL = "";


                // '*************** Load PU Points ***********************************************
                PUPoints.Clear();
                strSQL = "SELECT * FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + WellID.Replace("'", "''") + "' AND TYPE=0";
                DataTable objData = objDataService.getTable(strSQL);
                foreach (DataRow objRow in objData.Rows)
                {
                    PUSOPoint objItem = new PUSOPoint();
                    objItem.Depth = Convert.ToDouble( DataService.checkNull(objRow["DEPTH"], 0));
                    objItem.StartDate = Convert.ToDateTime( DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    objItem.EndDate = Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    objItem.StartIndex = Convert.ToInt32( DataService.checkNull(objRow["START_INDEX"], 0));
                    objItem.EndIndex = Convert.ToInt32( DataService.checkNull(objRow["END_INDEX"], 0));
                    objItem.Min = Convert.ToDouble( DataService.checkNull(objRow["MIN"], 0));
                    objItem.Max = Convert.ToDouble(DataService.checkNull(objRow["MAX"], 0));
                    objItem.Avg = Convert.ToDouble(DataService.checkNull(objRow["AVG"], 0));
                    objItem.Avg2 = Convert.ToDouble(DataService.checkNull(objRow["AVG2"], 0));
                    objItem.StartDepth = Convert.ToDouble(DataService.checkNull(objRow["START_DEPTH"], 0));
                    objItem.EndDepth = Convert.ToDouble(DataService.checkNull(objRow["END_DEPTH"], 0));
                    objItem.BlockMovement = Convert.ToDouble(DataService.checkNull(objRow["BLOCK_MOVEMENT"], 0));
                    objItem.MaxIndex =Convert.ToInt32( DataService.checkNull(objRow["MAX_INDEX"], 0));
                    objItem.DynamicValue = Convert.ToDouble(DataService.checkNull(objRow["DYNAMIC_VALUE"], 0));
                    objItem.DynamicTorqueValue = Convert.ToDouble(DataService.checkNull(objRow["DYNAMIC_TORQUE_VALUE"], 0));
                    objItem.Circulation = Convert.ToDouble(DataService.checkNull(objRow["CIRCULATION"], 0));
                    objItem.PumpPressure = Convert.ToDouble(DataService.checkNull(objRow["PUMP_PRESSURE"], 0));
                    objItem.UserDynamicValue = Convert.ToDouble(DataService.checkNull(objRow["USER_DYNAMIC_VALUE"], 0));
                    objItem.UserStaticValue = Convert.ToDouble(DataService.checkNull(objRow["USER_STATIC_VALUE"], 0));
                    objItem.UserVisible = Global.Iif(Convert.ToInt32( DataService.checkNull(objRow["USER_VISIBLE"], 0)) == 1, true, false);
                    objItem.PumpStatus = (PUSOPoint.pusoPumpStatus) Convert.ToInt16(DataService.checkNull(objRow["PUMP_STATUS"], 0));
                    PUPoints.Add(PUPoints.Count + 1, objItem);
                }


                // '*************** Load SO Points ***********************************************
                SOPoints.Clear();
                strSQL = "SELECT * FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + WellID.Replace("'", "''") + "' AND TYPE=1";
                objData = objDataService.getTable(strSQL);
                foreach (DataRow objRow in objData.Rows)
                {
                    PUSOPoint objItem = new PUSOPoint();
                    objItem.Depth = Convert.ToDouble(DataService.checkNull(objRow["DEPTH"], 0));
                    objItem.StartDate = Convert.ToDateTime(DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    objItem.EndDate = Convert.ToDateTime(DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    objItem.StartIndex = Convert.ToInt32(DataService.checkNull(objRow["START_INDEX"], 0));
                    objItem.EndIndex = Convert.ToInt32(DataService.checkNull(objRow["END_INDEX"], 0));
                    objItem.Min = Convert.ToDouble(DataService.checkNull(objRow["MIN"], 0));
                    objItem.Max = Convert.ToDouble(DataService.checkNull(objRow["MAX"], 0));
                    objItem.Avg = Convert.ToDouble(DataService.checkNull(objRow["AVG"], 0));
                    objItem.Avg2 = Convert.ToDouble(DataService.checkNull(objRow["AVG2"], 0));
                    objItem.StartDepth = Convert.ToDouble(DataService.checkNull(objRow["START_DEPTH"], 0));
                    objItem.EndDepth = Convert.ToDouble(DataService.checkNull(objRow["END_DEPTH"], 0));
                    objItem.BlockMovement = Convert.ToDouble(DataService.checkNull(objRow["BLOCK_MOVEMENT"], 0));
                    objItem.MaxIndex = Convert.ToInt32(DataService.checkNull(objRow["MAX_INDEX"], 0));
                    objItem.DynamicValue = Convert.ToDouble(DataService.checkNull(objRow["DYNAMIC_VALUE"], 0));
                    objItem.DynamicTorqueValue = Convert.ToDouble(DataService.checkNull(objRow["DYNAMIC_TORQUE_VALUE"], 0));
                    objItem.Circulation = Convert.ToDouble(DataService.checkNull(objRow["CIRCULATION"], 0));
                    objItem.PumpPressure = Convert.ToDouble(DataService.checkNull(objRow["PUMP_PRESSURE"], 0));
                    objItem.UserDynamicValue = Convert.ToDouble(DataService.checkNull(objRow["USER_DYNAMIC_VALUE"], 0));
                    objItem.UserStaticValue = Convert.ToDouble(DataService.checkNull(objRow["USER_STATIC_VALUE"], 0));
                    objItem.UserVisible = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["USER_VISIBLE"], 0)) == 1, true, false);
                    objItem.PumpStatus = (PUSOPoint.pusoPumpStatus) Convert.ToInt16(DataService.checkNull(objRow["PUMP_STATUS"], 0));
                    SOPoints.Add(SOPoints.Count + 1, objItem);
                }


                // '*************** Load Rotate Points ***********************************************
                RotatePoints.Clear();
                strSQL = "SELECT * FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + WellID.Replace("'", "''") + "' AND TYPE=2";
                objData = objDataService.getTable(strSQL);
                foreach (DataRow objRow in objData.Rows)
                {
                    //PUSOPoint objItem = new PUSOPoint();
                    //objItem.Depth = DataService.checkNull(objRow("DEPTH"), 0);
                    //objItem.StartDate = DataService.checkNull(objRow("START_DATE"), new DateTime());
                    //objItem.EndDate = DataService.checkNull(objRow("END_DATE"), new DateTime());
                    //objItem.StartIndex = DataService.checkNull(objRow("START_INDEX"), 0);
                    //objItem.EndIndex = DataService.checkNull(objRow("END_INDEX"), 0);
                    //objItem.Min = DataService.checkNull(objRow("MIN"), 0);
                    //objItem.Max = DataService.checkNull(objRow("MAX"), 0);
                    //objItem.Avg = DataService.checkNull(objRow("AVG"), 0);
                    //objItem.Avg2 = DataService.checkNull(objRow("AVG2"), 0);
                    //objItem.StartDepth = DataService.checkNull(objRow("START_DEPTH"), 0);
                    //objItem.EndDepth = DataService.checkNull(objRow("END_DEPTH"), 0);
                    //objItem.BlockMovement = DataService.checkNull(objRow("BLOCK_MOVEMENT"), 0);
                    //objItem.MaxIndex = DataService.checkNull(objRow("MAX_INDEX"), 0);
                    //objItem.DynamicValue = DataService.checkNull(objRow("DYNAMIC_VALUE"), 0);
                    //objItem.DynamicTorqueValue = DataService.checkNull(objRow("DYNAMIC_TORQUE_VALUE"), 0);
                    //objItem.Circulation = DataService.checkNull(objRow("CIRCULATION"), 0);
                    //objItem.PumpPressure = DataService.checkNull(objRow("PUMP_PRESSURE"), 0);
                    //objItem.UserDynamicValue = DataService.checkNull(objRow("USER_DYNAMIC_VALUE"), 0);
                    //objItem.UserStaticValue = DataService.checkNull(objRow("USER_STATIC_VALUE"), 0);
                    //objItem.UserVisible = Interaction.IIf(DataService.checkNull(objRow("USER_VISIBLE"), 0) == 1, true, false);
                    //objItem.PumpStatus = DataService.checkNull(objRow("PUMP_STATUS"), 0);
                    PUSOPoint objItem = new PUSOPoint();
                    objItem.Depth = Convert.ToDouble(DataService.checkNull(objRow["DEPTH"], 0));
                    objItem.StartDate = Convert.ToDateTime(DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    objItem.EndDate = Convert.ToDateTime(DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    objItem.StartIndex = Convert.ToInt32(DataService.checkNull(objRow["START_INDEX"], 0));
                    objItem.EndIndex = Convert.ToInt32(DataService.checkNull(objRow["END_INDEX"], 0));
                    objItem.Min = Convert.ToDouble(DataService.checkNull(objRow["MIN"], 0));
                    objItem.Max = Convert.ToDouble(DataService.checkNull(objRow["MAX"], 0));
                    objItem.Avg = Convert.ToDouble(DataService.checkNull(objRow["AVG"], 0));
                    objItem.Avg2 = Convert.ToDouble(DataService.checkNull(objRow["AVG2"], 0));
                    objItem.StartDepth = Convert.ToDouble(DataService.checkNull(objRow["START_DEPTH"], 0));
                    objItem.EndDepth = Convert.ToDouble(DataService.checkNull(objRow["END_DEPTH"], 0));
                    objItem.BlockMovement = Convert.ToDouble(DataService.checkNull(objRow["BLOCK_MOVEMENT"], 0));
                    objItem.MaxIndex = Convert.ToInt32(DataService.checkNull(objRow["MAX_INDEX"], 0));
                    objItem.DynamicValue = Convert.ToDouble(DataService.checkNull(objRow["DYNAMIC_VALUE"], 0));
                    objItem.DynamicTorqueValue = Convert.ToDouble(DataService.checkNull(objRow["DYNAMIC_TORQUE_VALUE"], 0));
                    objItem.Circulation = Convert.ToDouble(DataService.checkNull(objRow["CIRCULATION"], 0));
                    objItem.PumpPressure = Convert.ToDouble(DataService.checkNull(objRow["PUMP_PRESSURE"], 0));
                    objItem.UserDynamicValue = Convert.ToDouble(DataService.checkNull(objRow["USER_DYNAMIC_VALUE"], 0));
                    objItem.UserStaticValue = Convert.ToDouble(DataService.checkNull(objRow["USER_STATIC_VALUE"], 0));
                    objItem.UserVisible = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["USER_VISIBLE"], 0)) == 1, true, false);
                    objItem.PumpStatus = (PUSOPoint.pusoPumpStatus) Convert.ToInt16( DataService.checkNull(objRow["PUMP_STATUS"], 0));
                    PUPoints.Add(PUPoints.Count + 1, objItem);
                    RotatePoints.Add(RotatePoints.Count + 1, objItem);
                }
            }
            catch (Exception ex)
            {
            }
        }


        public void loadPointsFromDBTorque()
        {
            try
            {
                string strSQL = "";


                // '*************** Load Rotate Points ***********************************************
                RotatePoints.Clear();
                strSQL = "SELECT * FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + WellID.Replace("'", "''") + "' AND TYPE=3";
                DataTable objData = objDataService.getTable(strSQL);
                foreach (DataRow objRow in objData.Rows)
                {
                    PUSOPoint objItem = new PUSOPoint();
                    objItem.Depth = Convert.ToDouble(DataService.checkNull(objRow["DEPTH"], 0));
                    objItem.StartDate = Convert.ToDateTime(DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    objItem.EndDate = Convert.ToDateTime(DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    objItem.StartIndex = Convert.ToInt32(DataService.checkNull(objRow["START_INDEX"], 0));
                    objItem.EndIndex = Convert.ToInt32(DataService.checkNull(objRow["END_INDEX"], 0));
                    objItem.Min = Convert.ToDouble(DataService.checkNull(objRow["MIN"], 0));
                    objItem.Max = Convert.ToDouble(DataService.checkNull(objRow["MAX"], 0));
                    objItem.Avg = Convert.ToDouble(DataService.checkNull(objRow["AVG"], 0));
                    objItem.Avg2 = Convert.ToDouble(DataService.checkNull(objRow["AVG2"], 0));
                    objItem.StartDepth = Convert.ToDouble(DataService.checkNull(objRow["START_DEPTH"], 0));
                    objItem.EndDepth = Convert.ToDouble(DataService.checkNull(objRow["END_DEPTH"], 0));
                    objItem.BlockMovement = Convert.ToDouble(DataService.checkNull(objRow["BLOCK_MOVEMENT"], 0));
                    objItem.MaxIndex = Convert.ToInt32(DataService.checkNull(objRow["MAX_INDEX"], 0));
                    objItem.DynamicValue = Convert.ToDouble(DataService.checkNull(objRow["DYNAMIC_VALUE"], 0));
                    objItem.DynamicTorqueValue = Convert.ToDouble(DataService.checkNull(objRow["DYNAMIC_TORQUE_VALUE"], 0));
                    objItem.Circulation = Convert.ToDouble(DataService.checkNull(objRow["CIRCULATION"], 0));
                    objItem.PumpPressure = Convert.ToDouble(DataService.checkNull(objRow["PUMP_PRESSURE"], 0));
                    objItem.UserDynamicValue = Convert.ToDouble(DataService.checkNull(objRow["USER_DYNAMIC_VALUE"], 0));
                    objItem.UserStaticValue = Convert.ToDouble(DataService.checkNull(objRow["USER_STATIC_VALUE"], 0));
                    objItem.UserVisible = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["USER_VISIBLE"], 0)) == 1, true, false);
                    objItem.PumpStatus = (PUSOPoint.pusoPumpStatus)Convert.ToInt16(DataService.checkNull(objRow["PUMP_STATUS"], 0));
                    RotatePoints.Add(RotatePoints.Count + 1, objItem);
                }
            }
            catch (Exception ex)
            {
            }
        }


        private DateTime getLastProcessDate(int paramType)
        {
            try
            {
                string strSQL = "SELECT PRC_LAST_DATE FROM VMX_BROOMSTICK_PRC_INFO WHERE WELL_ID='" + WellID.Replace("'", "''") + "' AND TYPE=" + paramType.ToString();
                DataTable objData = objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {
                    return Convert.ToDateTime( objData.Rows[0]["PRC_LAST_DATE"]);
                }
                else
                {
                    return DateTime.MinValue;
                }
            }
            catch (Exception ex)
            {
                return DateTime.MinValue;
            }
        }


        public PUSOPoint detectPU(DataTable objData, int currentRowIndex, ref int returnPointer, int limitRow)
        {
            try
            {
                var objPUSO = new PUSOPoint();
                objPUSO.StartIndex = currentRowIndex;
                objPUSO.StartDate = Convert.ToDateTime( objData.Rows[currentRowIndex + 1]["DATETIME"]);
                objPUSO.StartDepth = Convert.ToDouble( objData.Rows[currentRowIndex + 1]["DEPTH"]);
                bool EndFound = false;
                double sumSPPA = 0d;
                double sumCirc = 0d;
                int sampleCount = 0;
                for (int i = currentRowIndex, loopTo = limitRow; i >= loopTo; i -= 1)
                {
                    double lnDepth = Convert.ToDouble( objData.Rows[i]["DEPTH"]);
                    double lnNextDepth = Convert.ToDouble( objData.Rows[i - 1]["DEPTH"]);
                    DateTime lnDate = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    int lnNextRigState =Convert.ToInt32( objData.Rows[i - 1]["RIG_STATE"]);
                    double lnSPPA = Convert.ToDouble( objData.Rows[i]["SPPA"]);
                    double lnCirc = Convert.ToDouble( objData.Rows[i]["CIRC"]);
                    sumSPPA = sumSPPA + lnSPPA;
                    sumCirc = sumCirc + lnCirc;
                    sampleCount = sampleCount + 1;
                    double DepthDiff = Math.Abs(lnNextDepth - lnDepth);

                    // '//////////// New Logic to determine when to stop the data collection ////////////////////////////////
                    bool DoCloseDataCollection = false;

                    // 'Pass through multiple conditions and determine if to stop the data collection ...

                    // '#1 The Depth is moving down and rig state is changing ...
                    // 'If (lnNextDepth > lnDepth And (lnNextRigState <> 8 And lnNextRigState <> 10 And lnNextRigState <> 28)) Then
                    if (lnNextDepth > lnDepth || !pkupRigStates.ContainsKey(lnNextRigState))
                    {
                        DoCloseDataCollection = true;
                    }


                    // '#2 If no depth movement then 
                    // 'If (lnNextDepth = lnDepth) And (lnNextRigState <> 8 And lnNextRigState <> 10 And lnNextRigState <> 28) Then
                    if (lnNextDepth == lnDepth || !pkupRigStates.ContainsKey(lnNextRigState))
                    {
                        var PauseStartTime = default(DateTime);

                        // 'Check the previous depth values and find out when the idle depth movement was started
                        for (int pp = i, loopTo1 = objData.Rows.Count - 1; pp <= loopTo1; pp++)
                        {
                            double ppDepth = Convert.ToDouble( objData.Rows[pp]["DEPTH"]);
                            DateTime ppDate = Convert.ToDateTime( objData.Rows[pp]["DATETIME"]);
                            if (ppDepth == lnDepth)
                            {
                            }
                            // 'Continue Search ...
                            else
                            {
                                // 'Depth changed ...
                                if (pp - 1 >= 0 && pp - 1 <= objData.Rows.Count - 1)
                                {
                                    PauseStartTime = Convert.ToDateTime( objData.Rows[pp]["DATETIME"]);
                                }
                                else
                                {
                                    PauseStartTime = ppDate;
                                }

                                break;
                            }
                        }

                        int TimeDiff = Math.Abs((lnDate- PauseStartTime).Seconds);
                        if (TimeDiff > _objSetup.MaxPauseTime)
                        {
                            DoCloseDataCollection = true; // 'Time of Pause exceeded ... Close the data collection ...
                        }
                    }
                    // '//////////// New Logic to determine when to stop the data collection ////////////////////////////////




                    // 'If (lnNextDepth > lnDepth And (lnNextRigState <> 8 And lnNextRigState <> 10)) Or (lnNextDepth = lnDepth And lnNextRigState <> 8 And lnNextRigState <> 10) Then
                    if (DoCloseDataCollection)
                    {
                        objPUSO.EndIndex = i;
                        objPUSO.EndDate = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                        objPUSO.EndDepth = Convert.ToDouble( objData.Rows[i]["DEPTH"]);
                        if (sampleCount > 0 && sumSPPA > 0d)
                        {
                            objPUSO.PumpPressure = Math.Round(sumSPPA / sampleCount, 2);
                        }

                        if (sampleCount > 0 && sumCirc > 0d)
                        {
                            objPUSO.Circulation = Math.Round(sumCirc / sampleCount, 2);
                        }

                        returnPointer = i - 1;


                        // '//****** New Filter for Local Minimum ********************''
                        if (_objSetup.PULocalMaxFilter)
                        {
                            for (int j = objPUSO.StartIndex - 1, loopTo2 = objPUSO.EndIndex; j >= loopTo2; j -= 1)
                            {
                                double lnPrevHKld = Convert.ToDouble( objData.Rows[j + 1]["HKLD"]);
                                double lnHkld = Convert.ToDouble( objData.Rows[j]["HKLD"]);
                                if (lnHkld < lnPrevHKld)
                                {
                                    // 'Found the local minimum ...
                                    objPUSO.StartIndex = j;
                                    break;
                                }
                            }
                        }
                        // '//********************************************************''

                        return objPUSO;
                        break;
                    }
                }

                return default;
            }
            catch (Exception ex)
            {
                return default;
            }
        }

        public void detectAndAddPoints(DataTable objData, int drillingStartRow, int lnInSlipsRowIndex, double lnInSlipsDepth, double lnInSlipsHoleDepth, int lnDrillingEndRow)
        {
            try
            {
                double lnHKldCutOff = objRigState.HookloadCutOff;
                Dictionary<int, PUSOPoint> tmpPUList = new Dictionary<int, PUSOPoint>();
                Dictionary<int, PUSOPoint> tmpSOList = new Dictionary<int, PUSOPoint>();
                for (int i = drillingStartRow, loopTo = lnInSlipsRowIndex; i >= loopTo; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);

                    // '************ PICK UP ***************************************************''
                    // 'If lnRigState = 10 Or lnRigState = 8 Or lnRigState = 28 Then
                    if (pkupRigStates.ContainsKey(lnRigState)) // 'New Condition ...
                    {
                        int returnPointer = i;
                        PUSOPoint objPoint = detectPU(objData, i, ref returnPointer, lnInSlipsRowIndex);
                        if (objPoint is object)
                        {
                            if (PUSOPoint.isValidPickUp(objPoint, _objSetup))
                            {
                                objPoint.Depth = lnInSlipsHoleDepth;
                                // 'Nishant
                                objWellSection = new wellSection(); // 'Nishant
                                objWellSection = getPUSOSettingsfromWellSection(objPoint.Depth); // 'Nishant
                                if (objWellSection is object)
                                {
                                    // 'Calculate Static
                                    PUSOPoint.calculateStaticPUValues(ref objData, ref objPoint, _objSetup, objWellSection.PUSOSettings);

                                    // 'Calculate Dynamic
                                    PUSOPoint.calculateDynamicPUValues(ref objData, ref objPoint, _objSetup, objWellSection.PUSOSettings);
                                }
                                else
                                {
                                    // 'Calculate Static
                                    PUSOPoint.calculateStaticPUValues(ref objData, ref objPoint, _objSetup);

                                    // 'Calculate Dynamic
                                    PUSOPoint.calculateDynamicPUValues(ref objData, ref objPoint, _objSetup);
                                }


                                // 'Add it to the list
                                tmpPUList.Add(tmpPUList.Count + 1, objPoint.getCopy());
                            }
                        }

                        if (returnPointer > i)
                        {
                            returnPointer = i;
                        }

                        i = returnPointer;
                        lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    }
                    // '************************************************************************''

                    // '************ SLACK OFF ***************************************************''
                    // 'If lnRigState = 6 Or lnRigState = 4 Or lnRigState = 27 Then
                    if (slkRigStates.ContainsKey(lnRigState))
                    {
                        int returnPointer = i;
                        PUSOPoint objPoint = detectSO(objData, i, ref returnPointer, lnInSlipsRowIndex);
                        if (objPoint is object)
                        {
                            if (PUSOPoint.isValidSlackOff(objPoint, _objSetup))
                            {
                                objPoint.Depth = lnInSlipsHoleDepth;

                                // 'Nishant
                                objWellSection = new wellSection();
                                objWellSection = getPUSOSettingsfromWellSection(objPoint.Depth);
                                if (objWellSection!= null)
                                {
                                    // 'Calculate Static
                                    PUSOPoint.calculateStaticSOValues(ref objData,ref  objPoint, _objSetup, objWellSection.PUSOSettings);

                                    // 'Calculate Static
                                    PUSOPoint.calculateStaticSOValues2(ref objData, ref objPoint, _objSetup, objWellSection.PUSOSettings);

                                    // 'Calculate Dynamic
                                    PUSOPoint.calculateDynamicSOValues(ref objData, ref objPoint, _objSetup, objWellSection.PUSOSettings);
                                }
                                else
                                {
                                    // 'Calculate Static
                                    PUSOPoint.calculateStaticSOValues(ref objData, ref objPoint, _objSetup);

                                    // 'Calculate Static
                                    PUSOPoint.calculateStaticSOValues2(ref objData, ref objPoint, _objSetup);

                                    // 'Calculate Dynamic
                                    PUSOPoint.calculateDynamicSOValues(ref objData, ref objPoint, _objSetup);
                                }

                                // '************



                                // 'Add it to the list
                                tmpSOList.Add(tmpSOList.Count + 1, objPoint.getCopy());
                            }
                        }

                        if (returnPointer > i)
                        {
                            returnPointer = i;
                        }

                        i = returnPointer;
                    }
                    // '************************************************************************''

                }



                // '***** Now Detect Rotate Point ***********************************''
                double depthWindowFrom = lnInSlipsDepth - 0.25d;
                double depthWindowTo = lnInSlipsDepth + 0.25d;
                int sampleCount = 0;
                double sumHkld = 0d;
                double sumTorque = 0d;
                double AvgValue = 0d;
                double AvgTorqueValue = 0d;
                bool RotateRigStateFound = false;
                Dictionary<int, ROBPoint> robPoints = new Dictionary<int, ROBPoint>();
                for (int i = drillingStartRow - 1, loopTo1 = lnDrillingEndRow; i >= loopTo1; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPrevHkld = Convert.ToDouble( objData.Rows[i + 1]["HKLD"]);
                    double lnRPM = Convert.ToDouble( objData.Rows[i]["RPM"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][_objSetup.rotatePumpMnemonic]);
                    double lnTorque = Convert.ToDouble( objData.Rows[i]["STOR"]);
                    double lnDepth = Convert.ToDouble(objData.Rows[i]["DEPTH"]);
                    DateTime lnDate = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                    double lnSPPA = Convert.ToDouble(objData.Rows[i]["SPPA"]);
                    double lnCirc = Convert.ToDouble(objData.Rows[i]["CIRC"]);


                    // 'Nishant
                    objWellSection = new wellSection();
                    objWellSection = getPUSOSettingsfromWellSection(lnDepth);
                    if (objWellSection is object)
                    {
                        lnPumpValue = Convert.ToDouble(objData.Rows[i][objWellSection.PUSOSettings.ROTChannel]);
                    }
                    // '***************************


                    bool AtInSlipsDepth = false;
                    if (lnDepth >= depthWindowFrom && lnDepth <= depthWindowTo)
                    {
                        AtInSlipsDepth = true;
                    }

                    if (AtInSlipsDepth)
                    {
                        if (lnHkld > lnHKldCutOff)
                        {
                            AtInSlipsDepth = false;
                        }
                    }



                    // 'Check if this point is within any PU/SO
                    foreach (PUSOPoint objPoint in tmpPUList.Values)
                    {
                        if (i >= objPoint.StartIndex && i <= objPoint.EndIndex)
                        {
                            AtInSlipsDepth = true;
                            break;
                        }
                    }

                    foreach (PUSOPoint objPoint in tmpSOList.Values)
                    {
                        if (i >= objPoint.StartIndex && i <= objPoint.EndIndex)
                        {
                            AtInSlipsDepth = true;
                            break;
                        }
                    }



                    // 'Check all stall rig states ...
                    // 'If (lnRigState = 11 Or lnRigState = 12 Or lnRigState = 13 Or lnRigState = 3 Or lnRigState = 7) And (Not AtInSlipsDepth) Then
                    if (rotRigStates.ContainsKey(lnRigState) && !AtInSlipsDepth)
                    {
                        if (lnRigState == 3 || lnRigState == 7)
                        {
                            // 'Check if we got into reaming/back reaming
                            double depthDiff = Math.Abs(Convert.ToDouble(objData.Rows[i]["DEPTH"]) - Convert.ToDouble(objData.Rows[i + 1]["DEPTH"]));
                            if (depthDiff > 0.3)
                            {
                                // 'It's real reaming/back reaming
                                continue;
                            }
                        }

                        bool DoContinue = false;

                        // 'Non Ream/Back Ream rig states ...
                        // 'If lnRigState = 11 Or lnRigState = 12 Or lnRigState = 13 Then


                        if (rotRigStates.ContainsKey(lnRigState))
                        {
                            if (lnRPM > _objSetup.rotateRPMCutOff && lnRPM <= _objSetup.rotateMaxRPM)
                            {
                                DoContinue = true;
                            }
                        }


                        // 'Nishant
                        objWellSection = new wellSection();
                        objWellSection = getPUSOSettingsfromWellSection(lnDepth);
                        // '**************
                        // 'Reaming rig states ...

                        if (lnRigState == 3 || lnRigState == 7)
                        {
                            // 'Nishant
                            if (objWellSection is object)
                            {
                                if (lnRPM > _objSetup.rotateRPMCutOff && lnRPM <= objWellSection.PUSOSettings.ROTMaxRPM)
                                {
                                    DoContinue = true;
                                }
                            }
                            else if (lnRPM > _objSetup.rotateRPMCutOff && lnRPM <= _objSetup.rotateMaxRPM)
                            {
                                DoContinue = true;
                            }
                            // '****************

                        }

                        // 'Nishant check from here Pending

                        if (lnHkld > lnHKldCutOff && DoContinue)
                        {
                            if (lnRigState == 11 || lnRigState == 12||lnRigState == 13)
                            {
                                RotateRigStateFound = true;
                            }

                            // 'Another filter to check the hookload change over last point ...
                            double HkldDiff = Math.Abs(lnHkld - lnPrevHkld);
                            if (_objSetup.rotatePumpStatus == BroomStickSetup.bmPumpStatus.Both)
                            {
                                sampleCount = sampleCount + 1;
                                sumHkld = sumHkld + lnHkld;
                                sumTorque = sumTorque + lnTorque;
                                ROBPoint objNewPoint = new ROBPoint();
                                objNewPoint.RecordDate = lnDate;
                                objNewPoint.Hkld = lnHkld;
                                objNewPoint.Torque = lnTorque;
                                objNewPoint.RPM = lnRPM;
                                objNewPoint.Circulation = lnCirc;
                                objNewPoint.PumpPressure = lnSPPA;
                                objNewPoint.Depth = lnDepth;
                                if (!WithinPUSO(objNewPoint.RecordDate, tmpPUList) && !WithinPUSO(objNewPoint.RecordDate, tmpSOList))
                                {
                                    robPoints.Add(robPoints.Count + 1, objNewPoint);
                                }
                            }
                            else
                            {
                                if (_objSetup.rotatePumpStatus == BroomStickSetup.bmPumpStatus.PumpOn)
                                {

                                    // 'Pump On
                                    if (lnPumpValue > _objSetup.rotateCutOffValue)
                                    {
                                        sampleCount = sampleCount + 1;
                                        sumHkld = sumHkld + lnHkld;
                                        sumTorque = sumTorque + lnTorque;
                                        ROBPoint objNewPoint = new ROBPoint();
                                        objNewPoint.RecordDate = lnDate;
                                        objNewPoint.Hkld = lnHkld;
                                        objNewPoint.Torque = lnTorque;
                                        objNewPoint.RPM = lnRPM;
                                        objNewPoint.Circulation = lnCirc;
                                        objNewPoint.PumpPressure = lnSPPA;
                                        objNewPoint.Depth = lnDepth;
                                        if (!WithinPUSO(objNewPoint.RecordDate, tmpPUList) && !WithinPUSO(objNewPoint.RecordDate, tmpSOList))
                                        {
                                            robPoints.Add(robPoints.Count + 1, objNewPoint);
                                        }
                                    }
                                }

                                if (_objSetup.rotatePumpStatus == BroomStickSetup.bmPumpStatus.PumpOff)
                                {

                                    // 'Pump Off
                                    if (lnPumpValue <= _objSetup.rotateCutOffValue)
                                    {
                                        sampleCount = sampleCount + 1;
                                        sumHkld = sumHkld + lnHkld;
                                        sumTorque = sumTorque + lnTorque;
                                        ROBPoint objNewPoint = new ROBPoint();
                                        objNewPoint.RecordDate = lnDate;
                                        objNewPoint.Hkld = lnHkld;
                                        objNewPoint.Torque = lnTorque;
                                        objNewPoint.RPM = lnRPM;
                                        objNewPoint.Circulation = lnCirc;
                                        objNewPoint.PumpPressure = lnSPPA;
                                        objNewPoint.Depth = lnDepth;
                                        if (!WithinPUSO(objNewPoint.RecordDate, tmpPUList) && !WithinPUSO(objNewPoint.RecordDate, tmpSOList))
                                        {
                                            robPoints.Add(robPoints.Count + 1, objNewPoint);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (sampleCount > 0 && sumHkld > 0d)
                {
                    AvgValue = Math.Round(sumHkld / sampleCount, 2);
                }

                if (sampleCount > 0 && sumTorque > 0d)
                {
                    AvgTorqueValue = Math.Round(sumTorque / sampleCount, 2);
                }

                bool ROBStabilityFound = false;
                double lnSPPAROB = 0d;
                double lnCircROB = 0d;
                ROBPoint.calculateROB(robPoints, _objSetup, ref AvgValue,ref AvgTorqueValue,ref ROBStabilityFound,ref lnSPPAROB,ref lnCircROB);


              


                // '**** =================== Check the procedure ======================== ******''
                if (!_objSetup.DontPlotROBWithNoStability)
                {
                    // 'Nothing to do ... keep the ROB value as it is ...

                    // 'Another check 
                    if (RotateRigStateFound)
                    {
                    }
                    // 'Nothing to do ...
                    else
                    {
                        AvgValue = 0d;
                        AvgTorqueValue = 0d;
                    }
                }
                else if (!ROBStabilityFound)
                {
                    AvgValue = 0d;
                    AvgTorqueValue = 0d;
                }

                if (_objSetup.CheckPUSOProcedure)
                {
                    if (AvgValue > 0d && RotateRigStateFound)
                    {
                        if (tmpPUList.Count > 0||tmpSOList.Count > 0)
                        {
                            bool isDynamicValueFound = false;
                            foreach (PUSOPoint objPoint in tmpPUList.Values)
                            {
                                if (objPoint.DynamicValue > 0)
                                {
                                    isDynamicValueFound = true;
                                    break;
                                }
                            }

                            foreach (PUSOPoint objPoint in tmpSOList.Values)
                            {
                                if (objPoint.DynamicValue > 0)
                                {
                                    isDynamicValueFound = true;
                                    break;
                                }
                            }

                            if (isDynamicValueFound)
                            {
                                PUSOPoint objRotatePoint = new PUSOPoint();
                                objRotatePoint.Depth = lnInSlipsHoleDepth;
                                objRotatePoint.DynamicValue = AvgValue;
                                objRotatePoint.DynamicTorqueValue = AvgTorqueValue;
                                objRotatePoint.PumpPressure = lnSPPAROB;
                                objRotatePoint.Circulation = lnCircROB;
                                objRotatePoint.StartDate = Convert.ToDateTime( objData.Rows[drillingStartRow]["DATETIME"]);
                                objRotatePoint.EndDate = Convert.ToDateTime( objData.Rows[drillingStartRow]["DATETIME"]);
                                PUSOPoint.updatePumpStatusROB(ref objRotatePoint, _objSetup);
                                RotatePoints.Add(RotatePoints.Count + 1, objRotatePoint.getCopy());

                                // 'Now add the PUSO to the list

                                foreach (int lnKey in tmpPUList.Keys)
                                {
                                    PUSOPoint objPoint = tmpPUList[lnKey].getCopy();
                                    PUSOPoint.updatePumpStatusPU(ref objPoint, _objSetup);
                                    PUPoints.Add(PUPoints.Count + 1, objPoint);
                                }

                                foreach (int lnKey in tmpSOList.Keys)
                                {
                                    PUSOPoint objPoint = tmpSOList[lnKey].getCopy();
                                    PUSOPoint.updatePumpStatusSO(ref objPoint, _objSetup);
                                    
                                    SOPoints.Add(SOPoints.Count + 1, objPoint);
                                }
                            }
                        }
                    }
                }
                else if (tmpPUList.Count > 0||tmpSOList.Count > 0)
                {
                    bool isDynamicValueFound = false;
                    foreach (PUSOPoint objPoint in tmpPUList.Values)
                    {
                        if (objPoint.DynamicValue > 0)
                        {
                            isDynamicValueFound = true;
                            break;
                        }
                    }

                    foreach (PUSOPoint objPoint in tmpSOList.Values)
                    {
                        if (objPoint.DynamicValue > 0)
                        {
                            isDynamicValueFound = true;
                            break;
                        }
                    }

                    if (isDynamicValueFound)
                    {
                        PUSOPoint objRotatePoint = new PUSOPoint();
                        objRotatePoint.Depth = lnInSlipsHoleDepth;
                        objRotatePoint.DynamicValue = AvgValue;
                        objRotatePoint.DynamicTorqueValue = AvgTorqueValue;
                        objRotatePoint.Circulation = lnCircROB;
                        objRotatePoint.PumpPressure = lnSPPAROB;
                        objRotatePoint.StartDate = Convert.ToDateTime( objData.Rows[drillingStartRow]["DATETIME"]);
                        objRotatePoint.EndDate = Convert.ToDateTime( objData.Rows[drillingStartRow]["DATETIME"]);
                        PUSOPoint.updatePumpStatusROB(ref objRotatePoint, _objSetup);
                        RotatePoints.Add(RotatePoints.Count + 1, objRotatePoint.getCopy());

                        // 'Now add the PUSO to the list

                        foreach (int lnKey in tmpPUList.Keys)
                        {
                            PUSOPoint objPoint = tmpPUList[lnKey].getCopy();
                            PUSOPoint.updatePumpStatusPU(ref objPoint , _objSetup);
                            PUPoints.Add(PUPoints.Count + 1, objPoint);
                        }

                        foreach (int lnKey in tmpSOList.Keys)
                        {
                            PUSOPoint objPoint = tmpSOList[lnKey].getCopy();
                            PUSOPoint.updatePumpStatusSO(ref objPoint , _objSetup);
                            SOPoints.Add(SOPoints.Count + 1, objPoint);
                        }
                    }
                }
            }
            // '*******************************************************************''


            catch (Exception ex)
            {
                bool halt = false;
            }
        }

        public bool WithinPUSO(DateTime paramDateTime, Dictionary<int, PUSOPoint> paramList)
        {
            try
            {
                foreach (PUSOPoint objItem in paramList.Values)
                {
                    if (paramDateTime >= objItem.StartDate && paramDateTime <= objItem.EndDate)
                    {
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public PUSOPoint detectSO(DataTable objData, int currentRowIndex, ref int returnPointer, int limitRow)
        {
            try
            {
                var objPUSO = new PUSOPoint();
                objPUSO.StartIndex = currentRowIndex;
                objPUSO.StartDate = Convert.ToDateTime( objData.Rows[currentRowIndex + 1]["DATETIME"]);
                objPUSO.StartDepth = Convert.ToDouble( objData.Rows[currentRowIndex + 1]["DEPTH"]);
                bool EndFound = false;
                double sumSPPA = 0d;
                double sumCirc = 0d;
                int sampleCount = 0;
                for (int i = currentRowIndex; i >= limitRow; i -= 1)
                {
                    double lnDepth = Convert.ToDouble( objData.Rows[i]["DEPTH"]);
                    double lnNextDepth = Convert.ToDouble( objData.Rows[i - 1]["DEPTH"]);
                    DateTime lnDate = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    int lnNextRigState = Convert.ToInt32( objData.Rows[i - 1]["RIG_STATE"]);
                    double lnSPPA = Convert.ToDouble( objData.Rows[i]["SPPA"]);
                    double lnCirc = Convert.ToDouble( objData.Rows[i]["CIRC"]);
                    sumSPPA = sumSPPA + lnSPPA;
                    sumCirc = sumCirc + lnCirc;
                    sampleCount = sampleCount + 1;


                    // '//////////// New Logic to determine when to stop the data collection ////////////////////////////////
                    bool DoCloseDataCollection = false;

                    // 'Pass through multiple conditions and determine if to stop the data collection ...

                    // '#1 The Depth is moving down and rig state is changing ...
                    // 'If (lnNextDepth < lnDepth And (lnNextRigState <> 6 And lnNextRigState <> 4 And lnNextRigState <> 27)) Then
                    if (lnNextDepth < lnDepth||!slkRigStates.ContainsKey(lnNextRigState))
                    {
                        DoCloseDataCollection = true;
                    }


                    // '#2 If no depth movement then 
                    // 'If (lnNextDepth = lnDepth And lnNextRigState <> 6 And lnNextRigState <> 4 And lnNextRigState <> 27) Then
                    if (lnNextDepth == lnDepth||!slkRigStates.ContainsKey(lnNextRigState))
                    {
                        var PauseStartTime = default(DateTime);

                        // 'Check the previous depth values and find out when the idle depth movement was started
                        for (int pp = i; pp <= objData.Rows.Count - 1; pp++)
                        {
                            double ppDepth = Convert.ToDouble( objData.Rows[pp]["DEPTH"]);
                            DateTime ppDate = Convert.ToDateTime( objData.Rows[pp]["DATETIME"]);
                            if (ppDepth == lnDepth)
                            {
                            }
                            // 'Continue Search ...
                            else
                            {
                                // 'Depth changed ...
                                if (pp - 1 >= 0 && pp - 1 <= objData.Rows.Count - 1)
                                {
                                    PauseStartTime = Convert.ToDateTime( objData.Rows[pp]["DATETIME"]);
                                }
                                else
                                {
                                    PauseStartTime = ppDate;
                                }

                                break;
                            }
                        }

                        int TimeDiff = (int)Math.Abs((lnDate- PauseStartTime).Seconds);
                        if (TimeDiff > _objSetup.MaxPauseTime)
                        {
                            DoCloseDataCollection = true; // 'Time of Pause exceeded ... Close the data collection ...
                        }
                    }
                    // '//////////// New Logic to determine when to stop the data collection ////////////////////////////////



                    
                    if (DoCloseDataCollection)
                    {
                        objPUSO.EndIndex = i;
                        objPUSO.EndDate = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                        objPUSO.EndDepth = Convert.ToDouble( objData.Rows[i]["DEPTH"]);
                        if (sampleCount > 0 && sumSPPA > 0d)
                        {
                            objPUSO.PumpPressure = Math.Round(sumSPPA / sampleCount, 2);
                        }

                        if (sampleCount > 0 && sumCirc > 0d)
                        {
                            objPUSO.Circulation = Math.Round(sumCirc / sampleCount, 2);
                        }

                        returnPointer = i - 1;


                     


                        // '//****** New Filter for Local Minimum ********************''
                        if (_objSetup.SOLocalMinFilter)
                        {
                            for (int j = objPUSO.StartIndex - 1 ; j >= objPUSO.EndIndex; j -= 1)
                            {
                                double lnPrevHKld = Convert.ToDouble( objData.Rows[j + 1]["HKLD"]);
                                double lnHkld = Convert.ToDouble( objData.Rows[j]["HKLD"]);
                                if (lnHkld > lnPrevHKld)
                                {
                                    // 'Found the local minimum ...
                                    objPUSO.StartIndex = j;
                                    break;
                                }
                            }
                        }
                        // '//********************************************************''

                        return objPUSO;
                        break;
                    }
                }

                return default;
            }
            catch (Exception ex)
            {
                return default;
            }
        }

        public void groupByDepth()
        {
            try
            {
                
                Dictionary<double, Dictionary<int, PUSOPoint>> tmpPUList = new Dictionary<double, Dictionary<int, PUSOPoint>>();
                Dictionary<double, Dictionary<int, PUSOPoint>> tmpSOList = new Dictionary<double, Dictionary<int, PUSOPoint>>();
                Dictionary<double, Dictionary<int, PUSOPoint>> tmpROBList = new Dictionary<double, Dictionary<int, PUSOPoint>>();
                foreach (PUSOPoint objPoint in PUPoints.Values)
                {
                    if (!tmpPUList.ContainsKey(objPoint.Depth))
                    {
                        tmpPUList.Add(objPoint.Depth, new Dictionary<int, PUSOPoint>());
                    }

                    tmpPUList[objPoint.Depth].Add(tmpPUList[objPoint.Depth].Count + 1, objPoint.getCopy());
                }

                foreach (PUSOPoint objPoint in SOPoints.Values)
                {
                    if (!tmpSOList.ContainsKey(objPoint.Depth))
                    {
                        tmpSOList.Add(objPoint.Depth, new Dictionary<int, PUSOPoint>());
                    }

                    tmpSOList[objPoint.Depth].Add(tmpSOList[objPoint.Depth].Count + 1, objPoint.getCopy());
                }

                foreach (PUSOPoint objPoint in RotatePoints.Values)
                {
                    if (!tmpROBList.ContainsKey(objPoint.Depth))
                    {
                        tmpROBList.Add(objPoint.Depth, new Dictionary<int, PUSOPoint>());
                    }

                    tmpROBList[objPoint.Depth].Add(tmpROBList[objPoint.Depth].Count + 1, objPoint.getCopy());
                }

                Dictionary<int, PUSOPoint> finalPUList = new Dictionary<int, PUSOPoint>();
                Dictionary<int, PUSOPoint> finalSOList = new Dictionary<int, PUSOPoint>();
                Dictionary<int, PUSOPoint> finalROBList = new Dictionary<int, PUSOPoint>();
                foreach (double lnDepth in tmpPUList.Keys)
                {
                    PUSOPoint minPoint;
                    PUSOPoint maxPoint = new PUSOPoint();
                    double minValue = 0d;
                    double maxValue = 0d;

                    // 'Find max first
                    foreach (PUSOPoint objPoint in tmpPUList[lnDepth].Values)
                    {
                        if (objPoint.DynamicValue > maxValue)
                        {
                            maxValue = objPoint.DynamicValue;
                            maxPoint = objPoint.getCopy();
                        }
                    }

                    if (maxPoint is null)
                    {
                        maxValue = tmpPUList[lnDepth].Values.First().DynamicValue;
                        maxPoint = tmpPUList[lnDepth].Values.First().getCopy();
                    }

                    minValue = maxValue;
                    minPoint = maxPoint.getCopy();

                    // 'Find min now
                    foreach (PUSOPoint objPoint in tmpPUList[lnDepth].Values)
                    {
                        if (objPoint.DynamicValue < minValue)
                        {
                            minValue = objPoint.DynamicValue;
                            minPoint = objPoint.getCopy();
                        }
                    }

                    if (minPoint is null)
                    {
                        minValue = tmpPUList[lnDepth].Values.First().DynamicValue;
                        minPoint = tmpPUList[lnDepth].Values.First().getCopy();
                    }

                    if (_objSetup.pickupMultiPointMethod == BroomStickSetup.bmMultiSelectMethod.Max)
                    {
                        finalPUList.Add(finalPUList.Count + 1, maxPoint.getCopy());
                    }
                    else
                    {
                        finalPUList.Add(finalPUList.Count + 1, minPoint.getCopy());
                    }
                }

                foreach (double lnDepth in tmpSOList.Keys)
                {
                    PUSOPoint minPoint;
                    PUSOPoint maxPoint = new PUSOPoint();
                    double minValue = 0d;
                    double maxValue = 0d;

                    // 'Find max first
                    foreach (PUSOPoint objPoint in tmpSOList[lnDepth].Values)
                    {
                        if (objPoint.DynamicValue > maxValue)
                        {
                            maxValue = objPoint.DynamicValue;
                            maxPoint = objPoint.getCopy();
                        }
                    }

                    if (maxPoint is null)
                    {
                        maxValue = tmpSOList[lnDepth].Values.First().DynamicValue;
                        maxPoint = tmpSOList[lnDepth].Values.First().getCopy();
                    }

                    minValue = maxValue;
                    minPoint = maxPoint.getCopy();

                    // 'Find min now
                    foreach (PUSOPoint objPoint in tmpSOList[lnDepth].Values)
                    {
                        if (objPoint.DynamicValue < minValue)
                        {
                            minValue = objPoint.DynamicValue;
                            minPoint = objPoint.getCopy();
                        }
                    }

                    if (minPoint is null)
                    {
                        minValue = tmpSOList[lnDepth].Values.First().DynamicValue;
                        minPoint = tmpSOList[lnDepth].Values.First().getCopy();
                    }

                    if (_objSetup.slackOffMultiPointMethod == BroomStickSetup.bmMultiSelectMethod.Max)
                    {
                        finalSOList.Add(finalSOList.Count + 1, maxPoint.getCopy());
                    }
                    else
                    {
                        finalSOList.Add(finalSOList.Count + 1, minPoint.getCopy());
                    }
                }

                foreach (double lnDepth in tmpROBList.Keys)
                {
                    PUSOPoint minPoint;
                    PUSOPoint maxPoint = new PUSOPoint();
                    double minValue = 0d;
                    double maxValue = 0d;

                    // 'Find max first
                    foreach (PUSOPoint objPoint in tmpROBList[lnDepth].Values)
                    {
                        if (objPoint.DynamicValue > maxValue)
                        {
                            maxValue = objPoint.DynamicValue;
                            maxPoint = objPoint.getCopy();
                        }
                    }

                    if (maxPoint is null)
                    {
                        maxValue = tmpROBList[lnDepth].Values.First().DynamicValue;
                        maxPoint = tmpROBList[lnDepth].Values.First().getCopy();
                    }

                    minValue = maxValue;
                    minPoint = maxPoint.getCopy();

                    // 'Find min now
                    foreach (PUSOPoint objPoint in tmpROBList[lnDepth].Values)
                    {
                        if (objPoint.DynamicValue < minValue)
                        {
                            minValue = objPoint.DynamicValue;
                            minPoint = objPoint.getCopy();
                        }
                    }

                    if (minPoint is null)
                    {
                        minValue = tmpROBList[lnDepth].Values.First().DynamicValue;
                        minPoint = tmpROBList[lnDepth].Values.First().getCopy();
                    }

                    if (_objSetup.ROBMultiPointMethod == BroomStickSetup.bmMultiSelectMethod.Max)
                    {
                        finalROBList.Add(finalROBList.Count + 1, maxPoint.getCopy());
                    }
                    else
                    {
                        finalROBList.Add(finalROBList.Count + 1, minPoint.getCopy());
                    }
                }

                PUPoints.Clear();
                SOPoints.Clear();
                RotatePoints.Clear();
                foreach (PUSOPoint objPoint in finalPUList.Values)
                    PUPoints.Add(PUPoints.Count + 1, objPoint.getCopy());
                foreach (PUSOPoint objPoint in finalSOList.Values)
                    SOPoints.Add(SOPoints.Count + 1, objPoint.getCopy());
                foreach (PUSOPoint objPoint in finalROBList.Values)
                    RotatePoints.Add(RotatePoints.Count + 1, objPoint.getCopy());
            }
            catch (Exception ex)
            {
            }

            
        }

        private void enforceRule()
        {
            try
            {
                Dictionary<int, PUSOPoint> newPUList = new Dictionary<int, PUSOPoint>();
                Dictionary<int, PUSOPoint> newSOList = new Dictionary<int, PUSOPoint>();
                Dictionary<int, PUSOPoint> newROBList = new Dictionary<int, PUSOPoint>();



                // '### Pickup Points should be greater than ROB and Slack Off ##################
                foreach (PUSOPoint objPoint in PUPoints.Values)
                {

                    // 'Extract points at this same depth
                    Dictionary<int, PUSOPoint> tmpROB = new Dictionary<int, PUSOPoint>();
                    Dictionary<int, PUSOPoint> tmpSO = new Dictionary<int, PUSOPoint>();
                    foreach (PUSOPoint objItem in RotatePoints.Values)
                    {
                        if (Math.Round(objItem.Depth, 2) == Math.Round(objPoint.Depth, 2))
                        {
                            tmpROB.Add(tmpROB.Count + 1, objItem.getCopy());
                        }
                    }

                    foreach (PUSOPoint objItem in SOPoints.Values)
                    {
                        if (Math.Round(objItem.Depth, 2) == Math.Round(objPoint.Depth, 2))
                        {
                            tmpSO.Add(tmpSO.Count + 1, objItem.getCopy());
                        }
                    }

                    bool isValidPoint = true;
                    foreach (PUSOPoint objItem in tmpROB.Values)
                    {
                        if (objPoint.DynamicValue <= objItem.DynamicValue)
                        {
                            isValidPoint = false;
                            break;
                        }
                    }

                    foreach (PUSOPoint objItem in tmpSO.Values)
                    {
                        if (objPoint.DynamicValue <= objItem.DynamicValue)
                        {
                            isValidPoint = false;
                            break;
                        }
                    }

                    if (isValidPoint)
                    {
                        newPUList.Add(newPUList.Count + 1, objPoint.getCopy());
                    }
                }
                // '#############################################################################



                // '### Slack Off Points should be less than ROB and Pick up ##################
                foreach (PUSOPoint objPoint in SOPoints.Values)
                {

                    // 'Extract points at this same depth
                    Dictionary<int, PUSOPoint> tmpROB = new Dictionary<int, PUSOPoint>();
                    Dictionary<int, PUSOPoint> tmpPU = new Dictionary<int, PUSOPoint>();
                    foreach (PUSOPoint objItem in RotatePoints.Values)
                    {
                        if (Math.Round(objItem.Depth, 2) == Math.Round(objPoint.Depth, 2))
                        {
                            tmpROB.Add(tmpROB.Count + 1, objItem.getCopy());
                        }
                    }

                    foreach (PUSOPoint objItem in PUPoints.Values)
                    {
                        if (Math.Round(objItem.Depth, 2) == Math.Round(objPoint.Depth, 2))
                        {
                            tmpPU.Add(tmpPU.Count + 1, objItem.getCopy());
                        }
                    }

                    bool isValidPoint = true;
                    foreach (PUSOPoint objItem in tmpROB.Values)
                    {
                        if (objPoint.DynamicValue >= objItem.DynamicValue)
                        {
                            isValidPoint = false;
                            break;
                        }
                    }

                    foreach (PUSOPoint objItem in tmpPU.Values)
                    {
                        if (objPoint.DynamicValue >= objItem.DynamicValue)
                        {
                            isValidPoint = false;
                            break;
                        }
                    }

                    if (isValidPoint)
                    {
                        newSOList.Add(newSOList.Count + 1, objPoint.getCopy());
                    }
                }
                // '#############################################################################



                // '### ROB Points should be between Pickup and Slack Off ##################
                foreach (PUSOPoint objPoint in RotatePoints.Values)

                    // 'Skip the rule check
                    newROBList.Add(newROBList.Count + 1, objPoint.getCopy());
                // '#############################################################################


                PUPoints.Clear();
                SOPoints.Clear();
                RotatePoints.Clear();
                foreach (PUSOPoint objPoint in newPUList.Values)
                    PUPoints.Add(PUPoints.Count + 1, objPoint.getCopy());
                foreach (PUSOPoint objPoint in newSOList.Values)
                    SOPoints.Add(SOPoints.Count + 1, objPoint.getCopy());
                foreach (PUSOPoint objPoint in newROBList.Values)
                    RotatePoints.Add(RotatePoints.Count + 1, objPoint.getCopy());
            }
            catch (Exception ex)
            {
            }
        }

    }//Class
}
