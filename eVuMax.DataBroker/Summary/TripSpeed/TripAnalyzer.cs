using System;
using System.Collections.Generic;
using System.Linq;
using VuMaxDR.Data.Objects;
using VuMaxDR.Common;
using VuMaxDR.Data;
using System.Data;
using System.Collections.ObjectModel;
using eVuMax.DataBroker.eVuMaxLogger;
using Newtonsoft.Json;

namespace eVuMax.DataBroker.Summary.TripSpeed
{
    public class TripAnalyzer
    {
        public eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();
        public bool UseDepthRanges = false;
        public Dictionary<double, double> TagSelection = new Dictionary<double, double>();
        public Dictionary<double, TripDepthInformation> TagDepthInformation = new Dictionary<double, TripDepthInformation>();

        public double DepthThreshold = 10;

        double[] tripSpeedWOConnectionX;
        double[] tripSpeedWOConnectionY;

        public DataTable tripSpeedWOConnectionData = new DataTable();

        public DataTable tripSpeedWithConnectionData = new DataTable();

        public DataTable benchMarkWOConnectionData = new DataTable(); //prath
        public DataTable benchMarkWithConnectionData = new DataTable(); //prath

        public DataTable deltaWithConn = new DataTable();
        public DataTable deltaWOConn = new DataTable();


        public DataTable HorizLine1 = new DataTable();
        public DataTable HorizLine2 = new DataTable();



        double[] tripSpeedWithConnectionX;
        double[] tripSpeedWithConnectionY;



        public double AvgTripSpeedWOConnections = 0;
        public double AvgTripSpeedWithConnections = 0;

        //public bool RefreshRequired = false;
        int ProcessStatus = 0;

        public bool UseCustomTags = false;
        public string TagSourceID = "";

        public bool RemoveFillUpTime = false;
        // 'Prath ticket no : 486 (added)
        public bool IncludePipeMovement = false;

        //Nishant: 19-10-2020
        DataService objDataService = new DataService("");
        string WellID = "";
        rigState objRigState = new rigState();
        VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
        string lastError = "";

        public TripSpeedBenchMark objBenchMarks = new TripSpeedBenchMark();



        public TripSpeedSettings objUserSettings = new TripSpeedSettings();
        string userID = "";

        private TimeLog objTimeLog = new TimeLog();

        public TripAnalyzer()
        {
        }
        public TripAnalyzer(DataService objDataService, string paramWellID, string paramUserID)
        {

            objLogger.LogMessage("TripAnalyzer Constructor Called");
            this.objDataService = objDataService;
            WellID = paramWellID;
            objRigState = rigState.loadWellRigStateSetup(ref this.objDataService, paramWellID); //Well specific
            if (objRigState == null)
            {
                objRigState = rigState.loadCommonRigStateSetup(ref this.objDataService); //Common 
            }

            userID = paramUserID;

            objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref objDataService, paramWellID);


            tripSpeedWOConnectionData.Columns.Add("X", typeof(System.Double));
            tripSpeedWOConnectionData.Columns.Add("Y", typeof(System.Double));


            tripSpeedWithConnectionData.Columns.Add("X", typeof(System.Double));
            tripSpeedWithConnectionData.Columns.Add("Y", typeof(System.Double));

            benchMarkWOConnectionData.Columns.Add("X", typeof(System.Double));
            benchMarkWOConnectionData.Columns.Add("Y", typeof(System.Double));


            benchMarkWithConnectionData.Columns.Add("X", typeof(System.Double));
            benchMarkWithConnectionData.Columns.Add("Y", typeof(System.Double));

            deltaWithConn.Columns.Add("X", typeof(System.Double));
            deltaWithConn.Columns.Add("Y", typeof(System.Double));

            deltaWOConn.Columns.Add("X", typeof(System.Double));
            deltaWOConn.Columns.Add("Y", typeof(System.Double));

            HorizLine1.Columns.Add("X", typeof(System.Double));
            HorizLine1.Columns.Add("Y", typeof(System.Double));

            HorizLine2.Columns.Add("X", typeof(System.Double));
            HorizLine2.Columns.Add("Y", typeof(System.Double));
        }


        public enum enumTripDirection
        {
            TripIn = 0,
            TripOut = 1,
            None = 2
        }

        public enumTripDirection TripDirection = enumTripDirection.TripIn;

        public string DepthVumaxUnitID = "";



        public void processTripSpeed1Data(ref TripSpeedData objTripSpeedData)
        {
            try
            {
                objLogger.LogMessage("processTripSpeed1Data Called");
                //load tagSelection from evumaxUserSettings table

                objUserSettings = objUserSettings.loadUserSetings(ref objDataService, userID, WellID, "TripSpeed1");

                TagSelection = objUserSettings.TagSelection;
                UseDepthRanges = objUserSettings.UseDepthRanges;
                DepthThreshold = objUserSettings.DepthThreshold;
                TripDirection = (enumTripDirection)objUserSettings.TripDirection;
                UseCustomTags = objUserSettings.UseCustomTags;
                TagSourceID = objUserSettings.TagSourceID;
                RemoveFillUpTime = objUserSettings.RemoveFillUpTime;
                TagDepthInformation = objUserSettings.TagDepthInformation;
                objBenchMarks = objUserSettings.objBenchMarks;


                objLogger.LogMessage("objUserSettings loaded as:***************** " + JsonConvert.SerializeObject(objUserSettings));


                //if (TagSelection.Count <= 0)
                //{
                //    DataTable objData = new DataTable();
                //    objData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_TAG_SELECTION WHERE WELL_ID='" + WellID + "'");
                //    foreach (DataRow objRow in objData.Rows)
                //    {
                //        double phaseIndex_ = Convert.ToDouble( DataService.checkNull(objRow["PHASE_INDEX"], 0));
                //        TagSelection.Add(phaseIndex_, phaseIndex_);
                //    }
                //}


                double phaseIndex = TagSelection.Values.First();


                clsPhaseTag objTag;

                if (!UseCustomTags)
                    objTag = clsPhaseTag.load(ref objDataService, WellID, phaseIndex);
                else
                    objTag = clsCustomTag.loadPhaseTag(ref objDataService, WellID, phaseIndex);


                if (objTag == null)
                    return;

                objLogger.LogMessage("objTag loaded as: " + JsonConvert.SerializeObject(objTag));


                // 'Determine the time log based on the 
                objTimeLog = getTimeLogFromDateRange(objTag.StartDate, objTag.EndDate);

                if (objTimeLog == null)
                    return;

                ProcessStatus = 1;


                // 'Determine Trip Direction ...
                // // TripDirection = getTripDirection(objTimeLog.__dataTableName, objTag.StartDate, objTag.EndDate) ''No need to determine Trip Direction ... It will be specified by the user ...

                objLogger.LogMessage("objTimeLog loaded as: " + JsonConvert.SerializeObject(objTimeLog));

                DateTime processStartDate = objTag.StartDate;
                DateTime processEndDate = objTag.EndDate;


                // 'VM-1815
                if (objTimeLog.logCurves.ContainsKey("DEPTH"))
                {
                    if (objTimeLog.logCurves["DEPTH"].VuMaxUnitID != "")
                        DepthVumaxUnitID = objTimeLog.logCurves["DEPTH"].VuMaxUnitID;
                    objTripSpeedData.DepthVumaxUnitID = DepthVumaxUnitID;
                }

                // '#################################################################################################''
                // ''*** Determine the Mid Point of the Trip
                // Dim minDepth As Double = Valex(objDataService.getValueFromDatabase("SELECT MIN(DEPTH) FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + objTag.StartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + objTag.EndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'"))


                // ''** Now find the Date for this Min Depth ..
                // Dim objMinDepthRow As DataTable = objDataService.getTable("SELECT DATETIME,DEPTH FROM " + objTimeLog.__dataTableName + " WHERE DEPTH=" + minDepth.ToString + " AND DATETIME>='" + objTag.StartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + objTag.EndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'")

                // If objMinDepthRow.Rows.Count > 0 Then

                // If TripDirection = enumTripDirection.TripIn Or TripDirection = enumTripDirection.None Then

                // processStartDate = objMinDepthRow.Rows(0)("DATETIME")

                // End If

                // If TripDirection = enumTripDirection.TripOut Then

                // processEndDate = objMinDepthRow.Rows(0)("DATETIME")

                // End If

                // End If
                // '#################################################################################################''




                calculateContTripSpeedWOConnection(ref tripSpeedWOConnectionX, ref tripSpeedWOConnectionY, objTimeLog.__dataTableName, processStartDate, processEndDate);

                calculateContTripSpeedWithConnection(ref tripSpeedWithConnectionX, ref tripSpeedWithConnectionY, objTimeLog.__dataTableName, processStartDate, processEndDate);


                if (UseDepthRanges)
                {
                    if (TagDepthInformation.ContainsKey(phaseIndex))
                    {
                        Dictionary<int, TripDepthRange> list = TagDepthInformation[phaseIndex].DepthRanges;


                        foreach (TripDepthRange objItem in list.Values)
                        {
                            objItem.TripSpeedWOConnection = calcTripSpeedWithoutConnectionsByDepthRange(objTimeLog.__dataTableName, processStartDate, processEndDate, objItem.FromDepth, objItem.ToDepth);
                            objItem.TripSpeedWithConnection = calcTripSpeedWithConnectionsByDepthRange(objTimeLog.__dataTableName, processStartDate, processEndDate, objItem.FromDepth, objItem.ToDepth);
                        }
                    }
                }
                else
                {
                    AvgTripSpeedWOConnections = calcTripSpeedWithoutConnections(objTimeLog.__dataTableName, processStartDate, processEndDate);
                    AvgTripSpeedWithConnections = calcTripSpeedWithConnections(objTimeLog.__dataTableName, processStartDate, processEndDate);
                }

                ProcessStatus = 0;


                objTripSpeedData = this.PolulateTripSpeed1Data();


            }
            catch (Exception ex)
            {
                ProcessStatus = 0;

            }
        }

        private void calculateContTripSpeedWOConnection(ref double[] paramX, ref double[] paramY, string dataTableName, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {



                DataTable objData = objDataService.getTable("SELECT DATETIME,DEPTH,TIME_DURATION,RIG_STATE FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND (RIG_STATE IS NOT NULL) ORDER BY DATETIME");

                objLogger.LogMessage("calculateContTripSpeedWOConnection started");
                if (objData.Rows.Count == 0)
                    return;


                bool startRecorded = false;
                double startDepth = 0;
                int startIndex = 0;
                double SumTime = 0;


                //Collection xData = new Collection();
                //Collection yData = new Collection();
                List<double> xData = new List<double>();
                List<double> yData = new List<double>();



                if (TripDirection == enumTripDirection.TripIn | TripDirection == enumTripDirection.None)
                {
                    double lastDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                    for (int i = 0; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                        if (lnDepth >= lastDepth)
                        {
                            // 'Continue ahead  with calculation ...
                            bool halt = true;
                        }
                        else
                        {
                            continue;
                        }


                        lastDepth = lnDepth;

                        double lnTimeDuration = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                        int lnRigState = Convert.ToInt16(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        DateTime dtDateTime = Convert.ToDateTime(DataService.checkNull(objData.Rows[i]["DATETIME"], ""));


                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);

                            if (Footage >= DepthThreshold)
                            {

                                // 'We also need to include the current time ...
                                if (TripDirection == enumTripDirection.TripIn)
                                {
                                    if (lnRigState == 6 | lnRigState == 4)
                                        SumTime = SumTime + lnTimeDuration;
                                }
                                else if (lnRigState == 10 | lnRigState == 8)
                                    SumTime = SumTime + lnTimeDuration;

                                double TripSpeed = 0;

                                if (Footage > 0 & SumTime > 0)
                                    TripSpeed = Math.Round(Footage / ((SumTime / 60) / 60), 2);

                                if (double.IsInfinity(TripSpeed))
                                    TripSpeed = 0;


                                // 'Dim strLine As String = ""
                                // 'strLine = dtDateTime.ToString("dd-MMM-yyyy HH:mm:ss") + "," + lnDepth.ToString + "," + SumTime.ToString + "," + Footage.ToString + "," + TripSpeed.ToString
                                // 'objFile.WriteLine(strLine)

                                xData.Add(TripSpeed);
                                yData.Add(lnDepth);


                                // 'Instead of re-initializing start tag ... re-initialize start ddepth 
                                // 'startRecorded = False
                                startDepth = lnDepth;
                                SumTime = 0;
                                startIndex = i;
                            }
                            else if (TripDirection == enumTripDirection.TripIn)
                            {
                                if (lnRigState == 6 | lnRigState == 4)
                                    SumTime = SumTime + lnTimeDuration;
                            }
                            else if (lnRigState == 10 | lnRigState == 8)
                                SumTime = SumTime + lnTimeDuration;
                        }
                        else
                        {
                            startRecorded = true;
                            startDepth = lnDepth;
                            startIndex = i;
                            SumTime = 0;
                        }
                    }
                }




                if (TripDirection == enumTripDirection.TripOut)
                {
                    double lastDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                    for (int i = 0; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                        if (lnDepth <= lastDepth)
                        {
                        }
                        else
                            continue;


                        lastDepth = lnDepth;

                        double lnTimeDuration = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                        int lnRigState = Convert.ToInt16(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        DateTime dtDateTime = Convert.ToDateTime(DataService.checkNull(objData.Rows[i]["DATETIME"], ""));


                        //if (dtDateTime >= DateTime.Parse("14-Apr-2014 05:13:30"))
                        //    bool halt = true;

                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);

                            if (Footage >= DepthThreshold)
                            {



                                // 'We also need to include the current time ...
                                if (TripDirection == enumTripDirection.TripIn)
                                {
                                    if (lnRigState == 6 | lnRigState == 4)
                                        SumTime = SumTime + lnTimeDuration;
                                }
                                else if (lnRigState == 10 | lnRigState == 8)
                                    SumTime = SumTime + lnTimeDuration;

                                double TripSpeed = 0;

                                if (Footage > 0 & SumTime > 0)
                                    TripSpeed = Math.Round(Footage / ((SumTime / 60) / 60), 2);

                                if (double.IsInfinity(TripSpeed))
                                    TripSpeed = 0;


                                // 'Dim strLine As String = ""
                                // 'strLine = dtDateTime.ToString("dd-MMM-yyyy HH:mm:ss") + "," + lnDepth.ToString + "," + SumTime.ToString + "," + Footage.ToString + "," + TripSpeed.ToString
                                // 'objFile.WriteLine(strLine)

                                xData.Add(TripSpeed);
                                yData.Add(lnDepth);


                                // 'Instead of re-initializing start tag ... re-initialize start ddepth 
                                // 'startRecorded = False
                                startDepth = lnDepth;
                                SumTime = 0;
                                startIndex = i;
                            }
                            else if (TripDirection == enumTripDirection.TripIn)
                            {
                                if (lnRigState == 6 | lnRigState == 4)
                                    SumTime = SumTime + lnTimeDuration;
                            }
                            else if (lnRigState == 10 | lnRigState == 8)
                                SumTime = SumTime + lnTimeDuration;
                        }
                        else
                        {
                            startRecorded = true;
                            startDepth = lnDepth;
                            startIndex = i;
                            SumTime = 0;
                        }
                    }
                }



                paramX = new double[0];
                paramY = new double[0];

                if (xData.Count() > 0 & yData.Count() > 0)
                {
                    paramX = new double[xData.Count()];
                    paramY = new double[yData.Count()];

                    for (int i = 0; i < xData.Count(); i++)
                    {
                        paramX[i] = xData[i];
                        paramY[i] = yData[i];
                    }




                }


                ///// copy paramX paramY data to table
                if (paramX != null)
                {
                    int totalRowCount = paramX.Length;
                    DataRow objNewRow = tripSpeedWOConnectionData.NewRow();

                    for (int i = 0; i < totalRowCount; i++)
                    {
                        objNewRow = tripSpeedWOConnectionData.NewRow();
                        objNewRow["X"] = paramX[i];
                        objNewRow["Y"] = paramY[i];
                        tripSpeedWOConnectionData.Rows.Add(objNewRow);
                    }
                }



            }






            catch (Exception ex)
            {

                objLogger.LogMessage("Error in calculateContTripSpeedWOConnection  at" + ex.Message + ex.StackTrace);
            }
        }

        private void calculateContTripSpeedWithConnection(ref double[] paramX, ref double[] paramY, string dataTableName, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                DataTable objData = objDataService.getTable("SELECT DATETIME,DEPTH,TIME_DURATION,RIG_STATE,HKLD,SPPA FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND (RIG_STATE IS NOT NULL) ORDER BY DATETIME");
                objLogger.LogMessage("calculateContTripSpeedWithConnection Entered");
                bool startRecorded = false;
                double startDepth = 0;
                int startIndex = 0;
                double SumTime = 0;

                List<double> xData = new List<double>(); //  Collection xData = new Collection();
                List<double> yData = new List<double>();//  Collection yData = new Collection();



                if (TripDirection == enumTripDirection.TripIn | TripDirection == enumTripDirection.None)
                {
                    double lastDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                    for (int i = 0; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                        if (lnDepth >= lastDepth)
                        {
                            // 'Continue ahead  with calculation ...
                            // bool halt = true;
                        }
                        else
                        {
                            continue;
                        }


                        lastDepth = lnDepth;

                        double lnTimeDuration = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                        int lnRigState = Convert.ToInt16(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        double lnHkld = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["HKLD"], 0));
                        double lnSPPA = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["SPPA"], 0));


                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);

                            if (Footage >= DepthThreshold)
                            {
                                if (RemoveFillUpTime & objRigState.HookloadCutOff > 0)
                                {
                                    if (lnHkld < objRigState.HookloadCutOff & lnSPPA <= objRigState.PumpPressureCutOff)
                                        SumTime = SumTime + lnTimeDuration;
                                }
                                else
                                    SumTime = SumTime + lnTimeDuration;


                                double TripSpeed = 0;

                                if (Footage >= 0 & SumTime >= 0)
                                    TripSpeed = Math.Round(Footage / ((SumTime / 60) / 60), 2);

                                if (double.IsInfinity(TripSpeed))
                                    TripSpeed = 0;


                                xData.Add(TripSpeed);
                                yData.Add(lnDepth);

                                // 'startRecorded = False
                                startDepth = lnDepth;
                                startIndex = i;
                                SumTime = 0;
                            }
                            else if (RemoveFillUpTime & objRigState.HookloadCutOff > 0)
                            {
                                if (lnHkld < objRigState.HookloadCutOff & lnSPPA <= objRigState.PumpPressureCutOff)
                                    SumTime = SumTime + lnTimeDuration;
                            }
                            else
                                SumTime = SumTime + lnTimeDuration;
                        }
                        else
                        {
                            startRecorded = true;
                            startDepth = lnDepth;
                            startIndex = i;
                            SumTime = 0;
                        }
                    }
                }


                if (TripDirection == enumTripDirection.TripOut)
                {
                    double lastDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                    for (int i = 0; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                        if (lnDepth <= lastDepth)
                        {
                            // 'Continue ahead  with calculation ...
                            bool halt = true;
                        }
                        else
                        {
                            continue;
                        }

                        double lnTimeDuration = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                        int lnRigState = Convert.ToInt16(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        double lnHkld = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["HKLD"], 0));
                        double lnSPPA = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["SPPA"], 0));


                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);

                            if (Footage >= DepthThreshold)
                            {
                                if (RemoveFillUpTime & objRigState.HookloadCutOff > 0)
                                {
                                    if (lnHkld < objRigState.HookloadCutOff & lnSPPA <= objRigState.PumpPressureCutOff)
                                        SumTime = SumTime + lnTimeDuration;
                                }
                                else
                                    SumTime = SumTime + lnTimeDuration;


                                double TripSpeed = 0;

                                if (Footage >= 0 & SumTime >= 0)
                                    TripSpeed = Math.Round(Footage / ((SumTime / 60) / 60), 2);

                                if (double.IsInfinity(TripSpeed))
                                    TripSpeed = 0;


                                xData.Add(TripSpeed);
                                yData.Add(lnDepth);

                                // 'startRecorded = False
                                startDepth = lnDepth;
                                startIndex = i;
                                SumTime = 0;
                            }
                            else if (RemoveFillUpTime & objRigState.HookloadCutOff > 0)
                            {
                                if (lnHkld < objRigState.HookloadCutOff & lnSPPA <= objRigState.PumpPressureCutOff)
                                    SumTime = SumTime + lnTimeDuration;
                            }
                            else
                                SumTime = SumTime + lnTimeDuration;
                        }
                        else
                        {
                            startRecorded = true;
                            startDepth = lnDepth;
                            startIndex = i;
                            SumTime = 0;
                        }
                    }
                }




                paramX = new double[0];
                paramY = new double[0];

                if (xData.Count() > 0 & yData.Count() > 0)
                {
                    paramX = new double[xData.Count()];
                    paramY = new double[yData.Count()];

                    for (int i = 0; i < xData.Count(); i++)
                    {
                        paramX[i] = xData[i];
                        paramY[i] = yData[i];
                    }
                }

                ///// copy paramX paramY data to table
                if (paramX != null)
                {
                    int totalRowCount = paramX.Length;
                    DataRow objNewRow = tripSpeedWithConnectionData.NewRow();

                    for (int i = 0; i < totalRowCount; i++)
                    {
                        objNewRow = tripSpeedWithConnectionData.NewRow();
                        objNewRow["X"] = paramX[i];
                        objNewRow["Y"] = paramY[i];
                        tripSpeedWithConnectionData.Rows.Add(objNewRow);
                    }
                }


                //prath for Horizontal Chart 

                tripSpeedWithConnectionData.DefaultView.Sort = "Y"; //desc
                tripSpeedWithConnectionData = tripSpeedWithConnectionData.DefaultView.ToTable();

                objLogger.LogMessage("calculateContTripSpeedWithConnection End");
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error in calculateContTripSpeedWithConnection " + ex.Message + ex.StackTrace);
            }
        }

        private double calcTripSpeedWithoutConnectionsByDepthRange(string dataTableName, DateTime paramFromDate, DateTime paramToDate, double paramFromDepth, double paramToDepth)
        {
            try
            {
                double TotalFootage = 0;
                string strSQL = "";

                double minDepth = 0;
                double maxDepth = 0;

                objLogger.LogMessage("calcTripSpeedWithoutConnectionsByDepthRange Entered");

                // '(1) Find the Depth Range ...
                strSQL = "SELECT MAX(DEPTH) AS MAX_DEPTH,MIN(DEPTH) AS MIN_DEPTH FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=0 AND DEPTH>=" + paramFromDepth.ToString() + " AND DEPTH<=" + paramToDepth.ToString() + " ";


                DataTable objData = objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                {
                    minDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MIN_DEPTH"], 0));
                    maxDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MAX_DEPTH"], 0));
                }

                TotalFootage = maxDepth - minDepth;


                if (TotalFootage > 0)
                {
                }
                else
                    // 'No depth movement ... return zero ...
                    return 0;


                DateTime lnFromDate = paramFromDate;
                DateTime lnToDate = paramToDate;


                //double TotalRigStateTime = Math.Abs(DateTime.DateDiff(DateInterval.Second, lnFromDate, lnToDate));
                double TotalRigStateTime = (lnFromDate - lnToDate).TotalSeconds;


                strSQL = "SELECT MAX(DATETIME) AS MAX_DATETIME,MIN(DATETIME) AS MIN_DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=0 AND DEPTH>=" + paramFromDepth.ToString() + " AND DEPTH<=" + paramToDepth.ToString() + " ";

                objData = objDataService.getTable(strSQL);


                if (TripDirection == enumTripDirection.TripIn)
                    strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (6,4) AND DEPTH>=" + paramFromDepth.ToString() + " AND DEPTH<=" + paramToDepth.ToString() + " ";
                else
                    strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (8,10) AND DEPTH>=" + paramFromDepth.ToString() + " AND DEPTH<=" + paramToDepth.ToString() + " ";

                objData = objDataService.getTable(strSQL);

                double TotalTripInTime = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["SUMTIME"], 0));

                TimeSpan objTimeSpan1 = new TimeSpan(0, 0, Convert.ToInt32(TotalRigStateTime));
                TimeSpan objTimeSpan2 = new TimeSpan(0, 0, Convert.ToInt32(TotalTripInTime));

                double TripPercent = Math.Round((TotalTripInTime * 100) / TotalRigStateTime, 2);

                double TripSpeed = 0;

                if (TotalTripInTime > 0 & TotalFootage > 0)
                {
                    // 'Continue ...
                    TripSpeed = Math.Round((TotalFootage / ((TotalTripInTime / 60) / 60)), 2);

                    return TripSpeed;
                }
                else
                    return 0;
                objLogger.LogMessage("calcTripSpeedWithoutConnectionsByDepthRange End");
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error in calcTripSpeedWithoutConnectionsByDepthRange " + ex.Message + ex.StackTrace);
                return 0;
            }
        }

        private double calcTripSpeedWithConnectionsByDepthRange(string dataTableName, DateTime paramFromDate, DateTime paramToDate, double paramFromDepth, double paramToDepth)
        {
            try
            {
                objLogger.LogMessage("Error in calcTripSpeedWithConnectionsByDepthRange entered" );

                double TotalFootage = 0;
                string strSQL = "";

                double minDepth = 0;
                double maxDepth = 0;

                // '(1) Find the Depth Range ...
                strSQL = "SELECT MAX(DEPTH) AS MAX_DEPTH,MIN(DEPTH) AS MIN_DEPTH FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=0 AND DEPTH>=" + paramFromDepth.ToString() + " AND DEPTH<=" + paramToDepth.ToString() + " ";

                DataTable objData = objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                {
                    minDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MIN_DEPTH"], 0));
                    maxDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MAX_DEPTH"], 0));
                }

                TotalFootage = maxDepth - minDepth;

                if (TotalFootage > 0)
                {
                }
                else
                    // 'No depth movement ... return zero ...
                    return 0;


                DateTime lnFromDate = paramFromDate;
                DateTime lnToDate = paramToDate;


                //double TotalRigStateTime = Math.Abs(DateTime.DateDiff(DateInterval.Second, lnFromDate, lnToDate));
                double TotalRigStateTime = (lnFromDate - lnToDate).TotalSeconds;



                if (RemoveFillUpTime & objRigState.HookloadCutOff > 0)
                    objData = objDataService.getTable("SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=" + paramFromDepth.ToString() + " AND DEPTH<=" + paramToDepth.ToString() + " AND HKLD<" + objRigState.HookloadCutOff.ToString() + " AND SPPA<=" + objRigState.PumpPressureCutOff.ToString());
                else
                    objData = objDataService.getTable("SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=" + paramFromDepth.ToString() + " AND DEPTH<=" + paramToDepth.ToString() + " ");


                double TotalTripInTime = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["SUMTIME"], 0));


                TimeSpan objTimeSpan1 = new TimeSpan(0, 0, Convert.ToInt32(TotalRigStateTime));
                TimeSpan objTimeSpan2 = new TimeSpan(0, 0, Convert.ToInt32(TotalTripInTime));

                double TripPercent = Math.Round((TotalTripInTime * 100) / TotalRigStateTime, 2);

                double TripSpeed = 0;

                if (TotalTripInTime > 0 & TotalFootage > 0)
                {
                    // 'Continue ...
                    TripSpeed = Math.Round((TotalFootage / ((TotalTripInTime / 60) / 60)), 2);

                    return TripSpeed;
                }
                else
                    return 0;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        private double calcTripSpeedWithoutConnections(string dataTableName, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                double TotalFootage = 0;
                string strSQL = "";

                double minDepth = 0;
                double maxDepth = 0;

                // '(1) Find the Depth Range ...
                strSQL = "SELECT MAX(DEPTH) AS MAX_DEPTH,MIN(DEPTH) AS MIN_DEPTH FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=0  ";

                DataTable objData = objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                {
                    minDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MIN_DEPTH"], 0));
                    maxDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MAX_DEPTH"], 0));
                }

                TotalFootage = maxDepth - minDepth;


                if (TotalFootage > 0)
                {
                }
                else
                    // 'No depth movement ... return zero ...
                    return 0;


                DateTime lnFromDate = paramFromDate;
                DateTime lnToDate = paramToDate;


                //  double TotalRigStateTime = Math.Abs(DateTime.DateDiff(DateInterval.Second, lnFromDate, lnToDate));
                double TotalRigStateTime = Math.Abs((lnFromDate - lnToDate).TotalSeconds);

                if (TripDirection == enumTripDirection.TripIn)
                    strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (6,4) ";
                else
                    strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (8,10) ";

                objData = objDataService.getTable(strSQL);

                double TotalTripInTime = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["SUMTIME"], 0));

                TimeSpan objTimeSpan1 = new TimeSpan(0, 0, Convert.ToInt32(TotalRigStateTime));
                TimeSpan objTimeSpan2 = new TimeSpan(0, 0, Convert.ToInt32(TotalTripInTime));

                double TripPercent = Math.Round((TotalTripInTime * 100) / TotalRigStateTime, 2);

                double TripSpeed = 0;

                if (TotalTripInTime > 0 & TotalFootage > 0)
                {
                    // 'Continue ...
                    TripSpeed = Math.Round((TotalFootage / ((TotalTripInTime / 60) / 60)), 2);

                    return TripSpeed;
                }
                else
                    return 0;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        private enumTripDirection getTripDirection(string dataTableName, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                double startDepth = 0;
                double endDepth = 0;
                string strSQL = "";

                strSQL = "SELECT TOP 1 DEPTH FROM " + dataTableName + " WHERE DATETIME<='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DATETIME DESC";

                DataTable objData = objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                    startDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                strSQL = "SELECT TOP 1 DEPTH FROM " + dataTableName + " WHERE DATETIME>='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DATETIME";

                objData = objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                    endDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));


                if (endDepth > startDepth)
                {
                    // 'Trip In
                    //   return TripDirection.TripIn;
                    return enumTripDirection.TripIn;
                }
                else if (endDepth < startDepth)
                {
                    // 'Trip Out
                    //return TripDirection.TripOut;
                    return enumTripDirection.TripOut;
                }
                else
                {
                    // 'Trip In, By default ... Couldn't determine
                    //return TripDirection.None;
                    return enumTripDirection.None;
                }
            }
            catch (Exception ex)
            {
                return 0;
            }
        }


        private enumTripDirection getTripDirection2(string dataTableName, DateTime paramFromDate, DateTime paramToDate, ref double paramStartDepth, ref double paramEndDepth)
        {
            try
            {
                double startDepth = 0;
                double endDepth = 0;
                string strSQL = "";

                strSQL = "SELECT TOP 1 DEPTH FROM " + dataTableName + " WHERE DATETIME<='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DATETIME DESC";

                DataTable objData = objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                    startDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                strSQL = "SELECT TOP 1 DEPTH FROM " + dataTableName + " WHERE DATETIME>='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DATETIME";

                objData = objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                    endDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                paramStartDepth = startDepth;
                paramEndDepth = endDepth;


                if (endDepth > startDepth)
                    // 'Trip In
                    //return TripDirection.TripIn;
                    return enumTripDirection.TripIn;
                else if (endDepth < startDepth)
                    // 'Trip Out
                    //return TripDirection.TripOut;
                    return enumTripDirection.TripOut;

                else
                    // 'Trip In, By default ... Couldn't determine
                    //return TripDirection.None;
                    return enumTripDirection.None;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }


        // 'Prath Ticket 486  (rewrite above original function
        private double calcTripSpeedWithConnections(string dataTableName, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                double TotalFootage = 0;
                string strSQL = "";

                double minDepth = 0;
                double maxDepth = 0;

                // '(1) Find the Depth Range ...
                strSQL = "SELECT MAX(DEPTH) AS MAX_DEPTH,MIN(DEPTH) AS MIN_DEPTH FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=0  ";

                DataTable objData = objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                {
                    minDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MIN_DEPTH"], 0));
                    maxDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MAX_DEPTH"], 0));
                }

                TotalFootage = maxDepth - minDepth;

                if (TotalFootage > 0)
                {
                }
                else
                    // 'No depth movement ... return zero ...
                    return 0;

                DateTime lnFromDate = paramFromDate;
                DateTime lnToDate = paramToDate;

                //double TotalRigStateTime = Math.Abs(DateTime.DateDiff(DateInterval.Second, lnFromDate, lnToDate));
                double TotalRigStateTime = Math.Abs((lnFromDate - lnToDate).TotalSeconds);





                // 'prath added Ticket 486
                // 'TripDirection 0(TripOut), 1 (TripIn)
                if (this.TripDirection == 0)
                {
                    // 'trip in

                    if (this.IncludePipeMovement)
                        strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (2,6,27) ";
                    else
                        strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (2,6) ";
                }
                else
                    // 'trip out
                    if (this.IncludePipeMovement)
                    strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (2,10,27) ";
                else
                    strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (2,10) ";
                // '------------

                // 'prath  change Ticket : 486
                // 'Original
                // If RemoveFillUpTime And objRigState.HookloadCutOff > 0 Then
                // objData = objDataService.getTable("SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HKLD<" + objRigState.HookloadCutOff.ToString + " AND SPPA<=" + objRigState.PumpPressureCutOff.ToString)
                // Else
                // objData = objDataService.getTable("SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ")
                // End If

                string Condition = "";
                Condition = " AND HKLD<" + objRigState.HookloadCutOff.ToString() + " AND SPPA<=" + objRigState.PumpPressureCutOff.ToString();

                if (RemoveFillUpTime & objRigState.HookloadCutOff > 0)
                    strSQL += Condition;

                objData = objDataService.getTable(strSQL);
                // '----------------

                double TotalTripInTime = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["SUMTIME"], 0));

                TimeSpan objTimeSpan1 = new TimeSpan(0, 0, Convert.ToInt32(TotalRigStateTime));
                TimeSpan objTimeSpan2 = new TimeSpan(0, 0, Convert.ToInt32(TotalTripInTime));

                double TripPercent = Math.Round((TotalTripInTime * 100) / TotalRigStateTime, 2);

                double TripSpeed = 0;

                if (TotalTripInTime > 0 & TotalFootage > 0)
                {
                    // 'Continue ...
                    TripSpeed = Math.Round((TotalFootage / ((TotalTripInTime / 60) / 60)), 2);

                    return TripSpeed;
                }
                else
                    return 0;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }
        // '------------------------------------

        private TimeLog getTimeLogFromDateRange(DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                DateTime StartDate = paramFromDate;
                DateTime EndDate = paramToDate;

                string TimeLogID = "";
                string TimeLogName = "";


                // 'Find the right time log
                foreach (Wellbore objWellbore in objWell.wellbores.Values)
                {
                    foreach (TimeLog objTimeLog in objWellbore.timeLogs.Values)
                    {
                        if (!objTimeLog.RemarksLog)
                        {
                            DateTime tStartDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref objDataService));
                            DateTime tEndDate = DateTime.FromOADate(objTimeLog.getLastIndex(ref objDataService));

                            if (StartDate > tStartDate & EndDate < tEndDate)
                            {

                                // 'This is the right time log ...

                                TimeLogID = objWellbore.ObjectID + "~" + objTimeLog.ObjectID;
                                TimeLogName = objTimeLog.nameLog;

                                goto ContinueAhead;
                            }
                        }
                    }
                }

            ContinueAhead:
                ;
                if (TimeLogID.Trim() != "")
                {
                    string wellboreID = TimeLogID.Split('~')[0];
                    string logID = TimeLogID.Split('~')[1];

                    TimeLog objTimeLog = TimeLog.loadTimeLogWOPlan(ref objDataService, WellID, wellboreID, logID, ref lastError);

                    return objTimeLog;
                }
                else
                    return null/* TODO Change to default(_) if this is not a reference type */;
            }

            catch (Exception ex)
            {
                return null/* TODO Change to default(_) if this is not a reference type */;
            }
        }


        public void processTripSpeed2Data(ref TripSpeedData objTripSpeedData)
        {
            try
            {
                TripSpeedData objData = new TripSpeedData();
                objUserSettings = objUserSettings.loadUserSetings(ref objDataService, userID, WellID, "TripSpeed2");

                TagSelection = objUserSettings.TagSelection;
                UseDepthRanges = objUserSettings.UseDepthRanges;
                DepthThreshold = objUserSettings.DepthThreshold;
                TripDirection = (enumTripDirection)objUserSettings.TripDirection;
                UseCustomTags = objUserSettings.UseCustomTags;
                TagSourceID = objUserSettings.TagSourceID;
                RemoveFillUpTime = objUserSettings.RemoveFillUpTime;
                TagDepthInformation = objUserSettings.TagDepthInformation;
                objBenchMarks = objUserSettings.objBenchMarks;


                if (TagSelection.Count <= 0)
                {
                    return;
                }

                ProcessStatus = 1;
                foreach (double lnPhaseIndex in TagSelection.Values)
                {
                    clsPhaseTag objTag;
                    if (!UseCustomTags)
                    {
                        objTag = clsPhaseTag.load(ref objDataService, WellID, lnPhaseIndex);
                    }
                    else
                    {
                        objTag = clsCustomTag.loadPhaseTag(ref objDataService, WellID, lnPhaseIndex);
                    }

                    if (objTag is null)
                    {
                        return;
                    }

                    // 'Determine the time log based on the 
                    TimeLog objTimeLog = getTimeLogFromDateRange(objTag.StartDate, objTag.EndDate);
                    if (objTimeLog is null)
                    {
                        continue;
                    }


                    // 'VM-1815
                    if (objTimeLog.logCurves.ContainsKey("DEPTH"))
                    {
                        if (objTimeLog.logCurves["DEPTH"].VuMaxUnitID != "")
                        {
                            DepthVumaxUnitID = objTimeLog.logCurves["DEPTH"].VuMaxUnitID;
                        }
                    }


                    DateTime processStartDate = objTag.StartDate;
                    DateTime processEndDate = objTag.EndDate;




                    if (!TagDepthInformation.ContainsKey(lnPhaseIndex))
                    {
                        var objDepthInformation = new TripDepthInformation();
                        objDepthInformation.TimeLogName = objTimeLog.nameLog;
                        objDepthInformation.PhaseIndex = lnPhaseIndex;
                        TagDepthInformation.Add(lnPhaseIndex, objDepthInformation);
                    }

                    if (UseDepthRanges)
                    {
                        Dictionary<int, TripDepthRange> list = TagDepthInformation[lnPhaseIndex].DepthRanges;
                        foreach (TripDepthRange objItem in list.Values)
                        {
                            objItem.TimeLogName = objTimeLog.nameLog;
                            objItem.TripSpeedWOConnection = calcTripSpeedWithoutConnectionsByDepthRange(objTimeLog.__dataTableName, objTag.StartDate, objTag.EndDate, objItem.FromDepth, objItem.ToDepth);
                            objItem.TripSpeedWithConnection = calcTripSpeedWithConnectionsByDepthRange(objTimeLog.__dataTableName, objTag.StartDate, objTag.EndDate, objItem.FromDepth, objItem.ToDepth);
                            double tripStartDepth = 0;
                            double tripEndDepth = 0;
                            enumTripDirection tripDirection = getTripDirection2(objTimeLog.__dataTableName, objTag.StartDate, objTag.EndDate, ref tripStartDepth, ref tripEndDepth);
                            if (tripDirection == enumTripDirection.TripIn)
                            {
                                TagDepthInformation[lnPhaseIndex].TripDirection = "Trip In";
                            }
                            else
                            {
                                TagDepthInformation[lnPhaseIndex].TripDirection = "Trip Out";
                            }

                            TagDepthInformation[lnPhaseIndex].TripDepthFrom = tripStartDepth;
                            TagDepthInformation[lnPhaseIndex].TripDepthTo = tripEndDepth;
                        }
                    }
                    else
                    {
                        TagDepthInformation[lnPhaseIndex].TripSpeedWithoutConnections = calcTripSpeedWithoutConnections(objTimeLog.__dataTableName, objTag.StartDate, objTag.EndDate);
                        TagDepthInformation[lnPhaseIndex].TripSpeedWithConnections = calcTripSpeedWithConnections(objTimeLog.__dataTableName, objTag.StartDate, objTag.EndDate);
                        TagDepthInformation[lnPhaseIndex].TimeLogName = objTimeLog.nameLog;
                        double tripStartDepth = 0;
                        double tripEndDepth = 0;
                        enumTripDirection tripDirection = getTripDirection2(objTimeLog.__dataTableName, objTag.StartDate, objTag.EndDate, ref tripStartDepth, ref tripEndDepth);
                        if (tripDirection == enumTripDirection.TripIn)
                        {
                            TagDepthInformation[lnPhaseIndex].TripDirection = "Trip In";
                        }
                        else
                        {
                            TagDepthInformation[lnPhaseIndex].TripDirection = "Trip Out";
                        }

                        TagDepthInformation[lnPhaseIndex].TripDepthFrom = tripStartDepth;
                        TagDepthInformation[lnPhaseIndex].TripDepthTo = tripEndDepth;
                    }
                }

                //*************************
                ////New Code to populate datatable
                ///
                if (UseDepthRanges)
                {
                    foreach (TripDepthInformation objItem in TagDepthInformation.Values)
                    {
                        if (TagSelection.ContainsValue(objItem.PhaseIndex))
                        //if (TagSelection.ContainsKey(objItem.PhaseIndex))
                        {
                            foreach (TripDepthRange objRange in objItem.DepthRanges.Values)
                            {
                                // Bar1.Add(objRange.TripSpeedWOConnection, objRange.LabelText + Constants.vbCrLf + objRange.TimeLogName + Constants.vbCrLf + objItem.TripDirection + Constants.vbCrLf + "(" + string.Format("{0:0.00}", objItem.TripDepthFrom) + " - " + string.Format("{0:0.00}", objItem.TripDepthTo) + ")");
                                //Bar2.Add(objRange.TripSpeedWithConnection, objRange.LabelText + Constants.vbCrLf + objRange.TimeLogName + Constants.vbCrLf + objItem.TripDirection + Constants.vbCrLf + "(" + string.Format("{0:0.00}", objItem.TripDepthFrom) + " - " + string.Format("{0:0.00}", objItem.TripDepthTo) + ")");

                                DataRow objNewRow = objData.bar1Data.NewRow();
                                DataRow objNewRow2 = objData.bar2Data.NewRow();
                                objNewRow["X"] = objRange.TripSpeedWOConnection;
                                objNewRow["Y"] = objRange.LabelText + "~" + objRange.TimeLogName + "~" + objItem.TripDirection + "~" + "(" + string.Format("{0:0.00}", objItem.TripDepthFrom) + " - " + string.Format("{0:0.00}", objItem.TripDepthTo) + ")";

                                objData.bar1Data.Rows.Add(objNewRow);

                                objNewRow2["X"] = objRange.TripSpeedWithConnection;
                                objNewRow2["Y"] = objRange.LabelText + "~" + objRange.TimeLogName + "~" + objItem.TripDirection + "~" + "(" + string.Format("{0:0.00}", objItem.TripDepthFrom) + " - " + string.Format("{0:0.00}", objItem.TripDepthTo) + ")";
                                objData.bar2Data.Rows.Add(objNewRow2);


                            }
                        }
                    }
                }
                else
                {
                    foreach (TripDepthInformation objItem in TagDepthInformation.Values)
                    {
                        if (TagSelection.ContainsValue(objItem.PhaseIndex))
                        //if (TagSelection.ContainsKey(objItem.PhaseIndex))
                        {
                            //  Bar1.Add(objItem.TripSpeedWithoutConnections, objItem.TimeLogName + Constants.vbCrLf + objItem.TripDirection + Constants.vbCrLf + "(" + string.Format("{0:0.00}", objItem.TripDepthFrom) + " - " + string.Format("{0:0.00}", objItem.TripDepthTo) + ")");
                            //   Bar2.Add(objItem.TripSpeedWithConnections, objItem.TimeLogName + Constants.vbCrLf + objItem.TripDirection + Constants.vbCrLf + "(" + string.Format("{0:0.00}", objItem.TripDepthFrom) + " - " + string.Format("{0:0.00}", objItem.TripDepthTo) + ")");

                            DataRow objNewRow = objData.bar1Data.NewRow();
                            DataRow objNewRow2 = objData.bar2Data.NewRow();
                            objNewRow["X"] = objItem.TripSpeedWithoutConnections;
                            objNewRow["Y"] = objItem.TimeLogName + "~" + objItem.TripDirection + "~" + "(" + string.Format("{0:0.00}", objItem.TripDepthFrom) + " - " + string.Format("{0:0.00}", objItem.TripDepthTo) + ")";

                            objData.bar1Data.Rows.Add(objNewRow);

                            objNewRow2["X"] = objItem.TripSpeedWithConnections;
                            objNewRow2["Y"] = objItem.TimeLogName + "~" + objItem.TripDirection + "~" + "(" + string.Format("{0:0.00}", objItem.TripDepthFrom) + " - " + string.Format("{0:0.00}", objItem.TripDepthTo) + ")";
                            objData.bar2Data.Rows.Add(objNewRow2);
                        }
                    }
                }
                objTripSpeedData = objData;


            }
            catch (Exception ex)
            {
                return;
            }
        }









        //public void loadFromDB()
        //{
        //    try
        //    {
        //        DataTable objData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_SETTINGS WHERE WELL_ID='" + WellID + "'");

        //        if (objData.Rows.Count > 0)
        //        {
        //            DataRow objRow = objData.Rows(0);

        //            UseDepthRanges = IIf(DataService.checkNull(objRow["USE_DEPTH_RANGE"], 0) == 1, true, false);
        //            DepthThreshold = DataService.checkNull(objRow("DEPTH_THRESHOLD"), 100);
        //            TripDirection = DataService.checkNull(objRow("TRIP_DIRECTION"), 0);
        //            UseCustomTags = IIf(DataService.checkNull(objRow("USE_CUSTOM"), 0) == 1, true, false);
        //            TagSourceID = DataService.checkNull(objRow("TAG_SOURCE_ID"), "");

        //            RemoveFillUpTime = IIf(DataService.checkNull(objRow("REMOVE_FILLUP_TIME"), 0) == 1, true, false);
        //        }

        //        TagSelection.Clear();

        //        objData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_TAG_SELECTION WHERE WELL_ID='" + WellID + "'");

        //        foreach (DataRow objRow in objData.Rows)
        //        {
        //            double phaseIndex = DataService.checkNull(objRow("PHASE_INDEX"), 0);

        //            TagSelection.Add(phaseIndex, phaseIndex);
        //        }


        //        objData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_DEPTH_INFO_HEADER WHERE WELL_ID='" + WellID + "'");

        //        foreach (DataRow objRow in objData.Rows)
        //        {
        //            TripDepthInformation objItem = new TripDepthInformation();

        //            objItem.PhaseIndex = DataService.checkNull(objRow("PHASE_INDEX"), 0);
        //            objItem.TimeLogName = DataService.checkNull(objRow("LOG_NAME"), "");

        //            DataTable objRangeData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_DEPTH_RANGES WHERE WELL_ID='" + WellID + "' AND PHASE_INDEX=" + objItem.PhaseIndex.ToString);

        //            foreach (DataRow objRangeRow in objRangeData.Rows)
        //            {
        //                TripDepthRange objRange = new TripDepthRange();
        //                objRange.FromDepth = DataService.checkNull(objRangeRow("FROM_DEPTH"), 0);
        //                objRange.ToDetph = DataService.checkNull(objRangeRow("TO_DEPTH"), 0);
        //                objRange.LabelText = DataService.checkNull(objRangeRow("LABEL"), 0);
        //                objRange.TimeLogName = DataService.checkNull(objRangeRow("LOG_NAME"), 0);
        //                objRange.WithBenchhmark = DataService.checkNull(objRangeRow("WITH_BM"), 0);
        //                objRange.WOBenchmark = DataService.checkNull(objRangeRow("WO_BM"), 0);

        //                objItem.DepthRanges.Add(objItem.DepthRanges.Count + 1, objRange);
        //            }

        //            TagDepthInformation.Add(objItem.PhaseIndex, objItem);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //    }
        //}

        //public void saveToDB()
        //{
        //    try
        //    {
        //        string strSQL = "";


        //        strSQL = "DELETE FROM VMX_TRIPAN_SETTINGS WHERE WELL_ID='" + WellID + "'";
        //        objDataService.executeNonQuery(strSQL);

        //        strSQL = "DELETE FROM VMX_TRIPAN_TAG_SELECTION WHERE WELL_ID='" + WellID + "'";
        //        objDataService.executeNonQuery(strSQL);

        //        strSQL = "DELETE FROM VMX_TRIPAN_DEPTH_INFO_HEADER WHERE WELL_ID='" + WellID + "'";
        //        objDataService.executeNonQuery(strSQL);

        //        strSQL = "DELETE FROM VMX_TRIPAN_DEPTH_RANGES WHERE WELL_ID='" + WellID + "'";
        //        objDataService.executeNonQuery(strSQL);


        //        int lnTripDirection = this.TripDirection;


        //        // 'prath ticket no : 486
        //        // strSQL = "INSERT INTO VMX_TRIPAN_SETTINGS (WELL_ID,USE_DEPTH_RANGE,DEPTH_THRESHOLD,TRIP_DIRECTION,USE_CUSTOM,TAG_SOURCE_ID,REMOVE_FILLUP_TIME) VALUES("
        //        strSQL = "INSERT INTO VMX_TRIPAN_SETTINGS (WELL_ID,USE_DEPTH_RANGE,DEPTH_THRESHOLD,TRIP_DIRECTION,USE_CUSTOM,TAG_SOURCE_ID,REMOVE_FILLUP_TIME,INCLUDE_PIPE_MOVEMENT) VALUES(";
        //        // '-----
        //        strSQL += "'" + WellID + "',";
        //        strSQL += "" + Interaction.IIf(UseDepthRanges, 1, 0).ToString() + ",";
        //        strSQL += "" + DepthThreshold.ToString() + ",";
        //        strSQL += "" + lnTripDirection.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(UseCustomTags == true, 1, 0).ToString() + ",";
        //        strSQL += "'" + TagSourceID + "',";
        //        // 'prath ticket no : 486
        //        // strSQL += "" + IIf(RemoveFillUpTime = True, 1, 0).ToString + ")"
        //        strSQL += "" + Interaction.IIf(RemoveFillUpTime == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(IncludePipeMovement == true, 1, 0).ToString() + ")";
        //        // '-------
        //        objDataService.executeNonQuery(strSQL);


        //        foreach (double lnKey in TagSelection.Keys)
        //        {
        //            strSQL = "INSERT INTO VMX_TRIPAN_TAG_SELECTION (WELL_ID,PHASE_INDEX) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "" + lnKey.ToString() + ")";

        //            if (objDataService.executeNonQuery(strSQL))
        //            {
        //            }
        //            else
        //                MsgBox("Failed to save Trip Data" + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);
        //        }

        //        foreach (TripDepthInformation objItem in TagDepthInformation.Values)
        //        {
        //            strSQL = "INSERT INTO VMX_TRIPAN_DEPTH_INFO_HEADER (WELL_ID,PHASE_INDEX,LOG_NAME) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "" + objItem.PhaseIndex.ToString + ",";
        //            strSQL += "'" + objItem.TimeLogName.Replace("'", "''") + "')";

        //            if (objDataService.executeNonQuery(strSQL))
        //            {
        //            }
        //            else
        //                MsgBox("Failed to save Trip Data" + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);

        //            int counter = 1;

        //            foreach (TripDepthRange objRange in objItem.DepthRanges.Values)
        //            {
        //                strSQL = "INSERT INTO VMX_TRIPAN_DEPTH_RANGES (WELL_ID,SR_NO,PHASE_INDEX,FROM_DEPTH,TO_DEPTH,LABEL,LOG_NAME,WITH_BM,WO_BM) VALUES(";
        //                strSQL += "'" + WellID + "',";
        //                strSQL += "" + counter.ToString() + ",";
        //                strSQL += "" + objItem.PhaseIndex.ToString + ",";
        //                strSQL += "" + objRange.FromDepth.ToString + ",";
        //                strSQL += "" + objRange.ToDetph.ToString + ",";
        //                strSQL += "'" + objRange.LabelText.Replace("'", "''") + "',";
        //                strSQL += "'" + objRange.TimeLogName.Replace("'", "''") + "',";
        //                strSQL += "" + objRange.WithBenchhmark.ToString + ",";
        //                strSQL += "" + objRange.WOBenchmark.ToString + ")";


        //                if (objDataService.executeNonQuery(strSQL))
        //                {
        //                }
        //                else
        //                    MsgBox("Failed to save Trip Data" + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);

        //                counter += 1;
        //            }
        //        }
        //    }

        //    catch (Exception ex)
        //    {
        //    }
        //}
        //===





        public TripSpeedData PolulateTripSpeed1Data()
        {
            try
            {


                //Copy RefreshChart function from vb here and populate TripSpeedData 

                // Bar Logic
                TripSpeedData objData = new TripSpeedData();
                if (objTimeLog.logCurves.ContainsKey("DEPTH"))
                {
                    if (objTimeLog.logCurves["DEPTH"].VuMaxUnitID != "")
                        DepthVumaxUnitID = objTimeLog.logCurves["DEPTH"].VuMaxUnitID;
                    objData.DepthVumaxUnitID = DepthVumaxUnitID;
                }

                if (this.UseDepthRanges)
                {
                    if (this.TagSelection.Count > 0)
                    {
                        double phaseIndex = TagSelection.Values.First();
                        if (this.TagDepthInformation.ContainsKey(phaseIndex))
                        {
                            Dictionary<int, TripDepthRange> list = this.TagDepthInformation[phaseIndex].DepthRanges;
                            foreach (TripDepthRange objItem in list.Values)
                            {
                                DataRow objNewRow = objData.bar1Data.NewRow();
                                DataRow objNewRow2 = objData.bar2Data.NewRow();
                                objNewRow["X"] = objItem.TripSpeedWOConnection;
                                objNewRow["Y"] = objItem.LabelText;

                                objData.bar1Data.Rows.Add(objNewRow);

                                objNewRow2["X"] = objItem.TripSpeedWithConnection;
                                objNewRow2["Y"] = objItem.LabelText;
                                objData.bar2Data.Rows.Add(objNewRow2);

                            }
                        }
                    }
                }
                else
                {
                    DataRow objNewRow = objData.bar1Data.NewRow();
                    DataRow objNewRow2 = objData.bar2Data.NewRow();
                    objNewRow["X"] = AvgTripSpeedWOConnections;
                    objNewRow["Y"] = "";

                    objData.bar1Data.Rows.Add(objNewRow);

                    objNewRow2["X"] = AvgTripSpeedWithConnections;
                    objNewRow2["Y"] = "";
                    objData.bar2Data.Rows.Add(objNewRow2);


                }

                //============== BenchMark
                // objData.BenchMarkWOConn = objBenchMarks.TripSpeedWOConnection;
                //objData.BenchMarkWithConn = objBenchMarks.TripSpeedWithConnection;


                if (objBenchMarks.speedProfile.Count > 0)
                {
                    TripSpeed[] arrItems = objBenchMarks.speedProfile.Values.ToArray();
                    Array.Sort(arrItems);

                    for (int i = 0; i < arrItems.Length; i++)
                    {
                        DataRow objNewRow = benchMarkWOConnectionData.NewRow();
                        DataRow objNewRow1 = benchMarkWithConnectionData.NewRow();

                        var objItem = arrItems[i];

                        objNewRow["X"] = objItem.SpeedWithoutConnection;
                        objNewRow["Y"] = objItem.Depth;
                        benchMarkWOConnectionData.Rows.Add(objNewRow);


                        objNewRow1["X"] = objItem.SpeedWithConnection;
                        objNewRow1["Y"] = objItem.Depth;

                        benchMarkWithConnectionData.Rows.Add(objNewRow1);
                    }

                }

                var arrBenchmarkSpeed = new TripSpeed[0];
                if (objBenchMarks.speedProfile.Count > 0)
                {
                    arrBenchmarkSpeed = objBenchMarks.speedProfile.Values.ToArray();
                }
                // '**Now Calculate Delta *****
                for (int i = 0; i < this.tripSpeedWithConnectionX.Length; i++)
                {
                    double tripSpeed = this.tripSpeedWithConnectionX[i];
                    double tripDepth = this.tripSpeedWithConnectionY[i];
                    double Delta = 0;
                    // 'Search this in benchmark


                    for (int j = arrBenchmarkSpeed.Length - 1; j >= 0; j -= 1)
                    {
                        if (arrBenchmarkSpeed[j].Depth <= tripDepth)
                        {
                            double bTripSpeed = 0;
                            if (j < arrBenchmarkSpeed.Length - 1)
                            {
                                bTripSpeed = arrBenchmarkSpeed[j + 1].SpeedWithConnection;
                            }
                            else
                            {
                                bTripSpeed = arrBenchmarkSpeed[j].SpeedWithConnection;
                            }

                            // 'Delta = bTripSpeed - tripSpeed


                            if (this.DepthThreshold > 0)
                            {
                                Delta = this.DepthThreshold / (bTripSpeed - tripSpeed);
                            }

                            break;
                        }
                    }

                    //TMP
                    if (Delta < 0)
                    {
                        int x = 1;
                    }

                    if (tripDepth == 3241)
                    {
                        int x1 = 1;
                    }

                    DataRow objNewRow = deltaWithConn.NewRow();
                    objNewRow["X"] = Delta;
                    objNewRow["Y"] = tripDepth;
                    deltaWithConn.Rows.Add(objNewRow);
                }

                for (int i = 0; i < this.tripSpeedWOConnectionX.Length; i++)
                {
                    double tripSpeed = this.tripSpeedWOConnectionX[i];
                    double tripDepth = this.tripSpeedWOConnectionY[i];
                    double Delta = 0;
                    // 'Search this in benchmark

                    for (int j = arrBenchmarkSpeed.Length - 1; j >= 0; j -= 1)
                    {
                        if (arrBenchmarkSpeed[j].Depth <= tripDepth)
                        {
                            double bTripSpeed = 0;
                            if (j < arrBenchmarkSpeed.Length - 1)
                            {
                                bTripSpeed = arrBenchmarkSpeed[j + 1].SpeedWithoutConnection;
                            }
                            else
                            {
                                bTripSpeed = arrBenchmarkSpeed[j].SpeedWithoutConnection;
                            }

                            // 'Delta = bTripSpeed - tripSpeed

                            if (this.DepthThreshold > 0)
                            {
                                Delta = this.DepthThreshold / (bTripSpeed - tripSpeed);
                            }

                            break;
                        }
                    }


                    //TMP
                    if (Delta < 0)
                    {
                        int y = 1;
                    }

                    if (tripDepth == 3241)
                    {
                        int y1 = 1;
                    }

                    DataRow objNewRow = deltaWOConn.NewRow();
                    objNewRow["X"] = Delta;
                    objNewRow["Y"] = tripDepth;
                    deltaWOConn.Rows.Add(objNewRow);
                }


                //refreshChart code
                objData.line1Data = this.tripSpeedWOConnectionData;
                objData.line2Data = this.tripSpeedWithConnectionData;

                objData.line3Data = benchMarkWOConnectionData;
                objData.line4Data = benchMarkWithConnectionData;
                objData.deltaWithConnData = deltaWithConn;
                objData.deltaWOConnData = deltaWOConn;

                return objData;




            }
            catch (Exception ex)
            {
                return new TripSpeedData();

            }
        }





    }//Class
}//NameSpace
