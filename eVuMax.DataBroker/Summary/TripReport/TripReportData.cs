using eVuMax.DataBroker.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.AdvKPI;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.Summary.TripReport
{
    public class TripReportData
    {
        private TimeLog objTimeLog;
        public const string MyPlotID = "TRIPREPORT";
        public VuMaxDR.Data.Objects.TripReport objReport = new VuMaxDR.Data.Objects.TripReport();
        private VuMaxDR.Data.Objects.TripReportSettings objTripReportSettings = new VuMaxDR.Data.Objects.TripReportSettings();
        public bool RefreshRequired = false;
        public Dictionary<int, clsPhaseTag> TripTypeTags = new Dictionary<int, clsPhaseTag>();
        public Dictionary<int, clsPhaseTag> TripTags = new Dictionary<int, clsPhaseTag>();
        public Dictionary<int, TripInfo> tripData = new Dictionary<int, TripInfo>();
        
        public string depthUnit = "";
        public Dictionary<int, string> colorTable = new Dictionary<int, string>();
        

        public DataService objDataService;
        public string WellID = "";
        [NonSerialized]
        public Broker.BrokerRequest objRequest = new Broker.BrokerRequest();

        public string Warnings = "";
        public DataTable grdData = new DataTable();
        public string WellName = "";

        private VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
        public TripReportSettings objUserSettings = new TripReportSettings();

        
        private void generateGrdTable()
        {
            grdData.Columns.Add("COL_PHASE_INDEX");
            grdData.Columns.Add("COL_PHASE_ID");
            grdData.Columns.Add("COL_STEP_ID");
            grdData.Columns.Add("COL_EMPH_ID");
            grdData.Columns.Add("COL_SECTION");
            grdData.Columns.Add("COL_SECTION_BKCOLOR");
            grdData.Columns.Add("COL_RUN");
            grdData.Columns.Add("COL_RUN_BKCOLOR");
            grdData.Columns.Add("COL_DIRECTION");
            grdData.Columns.Add("COL_DEPTH");
            grdData.Columns.Add("COL_START_DATE");
            grdData.Columns.Add("COL_END_DATE");
            grdData.Columns.Add("COL_TOTAL_TIME");
            grdData.Columns.Add("COL_TIME_ON_SURFACE");
            grdData.Columns.Add("COL_OFF_TO_ON_BTM_TIME");
            grdData.Columns.Add("COL_OFF_TO_ON_BTM_SPEED");
            grdData.Columns.Add("COL_SPEED_WITH_CONN");
            grdData.Columns.Add("COL_SPEED_WO_CONN");
            grdData.Columns.Add("COL_DIFF");
            grdData.Columns.Add("COL_CONNECTIONS");
            grdData.Columns.Add("COL_DIFF_W");
            grdData.Columns.Add("COL_DIFF_WO");
            grdData.Columns.Add("COL_AVG_CONN_TIME");
            grdData.Columns.Add("COL_AVG_DAY_TIME");
            grdData.Columns.Add("COL_AVG_NIGHT_TIME");

            //BK COLOR COLUMNS
            grdData.Columns.Add("COL_DIRECTION_BKCOLOR");
            grdData.Columns.Add("COL_START_DATE_BKCOLOR");
            grdData.Columns.Add("COL_TOTAL_TIME_BKCOLOR");
            grdData.Columns.Add("COL_OFF_TO_ON_BTM_TIME_BKCOLOR");
            grdData.Columns.Add("COL_SPEED_WITH_CONN_BKCOLOR");
            grdData.Columns.Add("COL_DIFF_BKCOLOR");
            grdData.Columns.Add("COL_DIFF_W_BKCOLOR");
            grdData.Columns.Add("COL_DIFF_WO_BKCOLOR");


        }
        

        private void Initialize(string paramWellID)
        {
            try
            {
                objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref objDataService, paramWellID);
                if (objTimeLog is object)
                {
                    depthUnit = objTimeLog.logCurves["DEPTH"].VuMaxUnitID;
                }

                objTripReportSettings = VuMaxDR.Data.Objects.TripReportSettings.getSettings(objDataService, WellID); //original
                //objUserSettings.loadSettings(); PENDING

               // objUserSettings.copySettingsToVuMaxTripReportSettings(ref objTripReportSettings);
                objReport.objTimeLog = objTimeLog;
                objReport.objSettings = objTripReportSettings;

                objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref objDataService, paramWellID);
                WellName = objWell.name;

                //Populating color tale
                colorTable.Add(1, "Blue");
                colorTable.Add(2, "Red");
                colorTable.Add(3, "Green");
                colorTable.Add(4, "Yellow");
                colorTable.Add(5, "Brown");

                generateGrdTable();
            }
            catch (Exception ex)
            {

                
            }
        }
        public Broker.BrokerResponse generateTripReport(ref VuMaxDR.Data.DataService paramObjDataService, string paramWellID)
        {
            try
            {
                objDataService = new VuMaxDR.Data.DataService(paramWellID);
                objDataService = paramObjDataService;

                Initialize(paramWellID);
                WellID = paramWellID;
               
              
                Broker.BrokerResponse objResponse = objRequest.createResponseObject();


                
                var exList = new Dictionary<int, int>();
                exList = VuMaxDR.Data.Objects.TripReportSettings.getTripExclusionList(objDataService, WellID);
                //exList = objUserSettings.TripExclusionList;//Nishant PENDING
                tripData = new Dictionary<int, TripInfo>();
                TripTags = new Dictionary<int, clsPhaseTag>();
                TripTypeTags = PhaseMapping.getList(objDataService, AdvKPIProfile.TRIP);
                DataTable objData = new DataTable();
                if (!objTripReportSettings.UseCustomTags)
                {
                    objData = objDataService.getTable("SELECT A.IS_OPEN,A.PHASE_INDEX,A.START_DATE,A.END_DATE,A.PHASE_ID,A.STEP_ID,A.EMPH_ID,C.PHASE_NAME,D.STEP_NAME,E.EMPH_NAME FROM VMX_PHASE_LIST A LEFT JOIN VMX_PHASE_MASTER C ON (A.PHASE_ID=C.PHASE_ID) LEFT JOIN VMX_STEP_MASTER D ON (A.PHASE_ID=D.PHASE_ID AND A.STEP_ID=D.STEP_ID) LEFT JOIN VMX_EMPH_MASTER E ON (E.PHASE_ID=A.PHASE_ID AND E.STEP_ID=A.STEP_ID AND E.EMPH_ID=A.EMPH_ID) WHERE A.WELL_ID='" + WellID + "' ORDER BY START_DATE");
                }
                else
                {
                    string strSQL = "";
                    strSQL = " SELECT ";
                    strSQL += " A.IS_OPEN,A.TAG_INDEX AS PHASE_INDEX,A.START_DATE,A.END_DATE,A.CATEGORY_ID AS PHASE_ID,A.SUB_CATEGORY_ID AS STEP_ID,A.ACTIVITY_ID AS EMPH_ID,C.CATEGORY_NAME AS PHASE_NAME,D.SUB_CATEGORY_NAME AS STEP_NAME,E.ACTIVITY_NAME AS EMPH_NAME ";
                    strSQL += " FROM  ";
                    strSQL += " VMX_CUSTOM_TAG_LIST A ";
                    strSQL += " LEFT JOIN VMX_CUSTOM_TAG_CATEGORY_MASTER C ON (A.CATEGORY_ID=C.TAG_CATEGORY_ID AND A.SOURCE_ID=C.SOURCE_ID) ";
                    strSQL += " LEFT JOIN VMX_CUSTOM_TAG_SUB_CATEGORY_MASTER D ON (A.CATEGORY_ID=D.TAG_CATEGORY_ID AND A.SUB_CATEGORY_ID=D.TAG_SUB_CATEGORY_ID AND A.SOURCE_ID=D.SOURCE_ID) ";
                    strSQL += " LEFT JOIN VMX_CUSTOM_TAG_ACTIVITY_MASTER E ON (E.TAG_CATEGORY_ID=A.CATEGORY_ID AND E.TAG_SUB_CATEGORY_ID=A.SUB_CATEGORY_ID AND E.TAG_ACTIVITY_ID=A.ACTIVITY_ID AND A.SOURCE_ID=E.SOURCE_ID) ";
                    strSQL += " WHERE A.WELL_ID='" + WellID + "' AND A.SOURCE_ID='" + objTripReportSettings.TagSourceID + "' ORDER BY START_DATE ";
                    objData = objDataService.getTable(strSQL);
                }

                foreach (DataRow objRow in objData.Rows)
                {
                    double PhaseIndex = Convert.ToDouble(DataService.checkNull(objRow["PHASE_INDEX"], 0));
                    if (!exList.ContainsKey((int)Math.Round(PhaseIndex)))
                    {
                        string PhaseID = DataService.checkNull(objRow["PHASE_ID"], "").ToString();
                        string PhaseName = DataService.checkNull(objRow["PHASE_NAME"], "").ToString();
                        string StepID = DataService.checkNull(objRow["STEP_ID"], "").ToString();
                        string StepName = DataService.checkNull(objRow["STEP_NAME"], "").ToString();
                        string EmphID = DataService.checkNull(objRow["EMPH_ID"], "").ToString();
                        string EmphName = DataService.checkNull(objRow["EMPH_NAME"], "").ToString();
                        
                        bool IsOpen = Convert.ToBoolean(Global.Iif(Convert.ToInt32(objRow["IS_OPEN"]) == 1, true, false));
                        DateTime TagStartDate =Convert.ToDateTime(DataService.checkNull(objRow["START_DATE"], new DateTime()));
                        DateTime TagEndDate = Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));

                        // 'Check if this tag is Trip tag
                        bool Found = false;
                        foreach (clsPhaseTag objTagType in TripTypeTags.Values)
                        {
                            if (objTagType.PhaseID == PhaseID & objTagType.StepID == StepID & objTagType.EmphID == EmphID)
                            {
                                Found = true;
                                break;
                            }
                        }

                        if (Found)
                        {
                            var objTag = new clsPhaseTag();
                            objTag.PhaseIndex = PhaseIndex;
                            objTag.PhaseID = PhaseID;
                            objTag.phaseName = PhaseName;
                            objTag.StepID = StepID;
                            objTag.stepName = StepName;
                            objTag.EmphID = EmphID;
                            objTag.emphName = EmphName;
                            objTag.StartDate = TagStartDate;
                            objTag.EndDate = TagEndDate;
                            objTag.IsOpen = IsOpen;
                            if (!TripTags.ContainsKey(Convert.ToInt32(objTag.PhaseIndex)))
                            {
                                TripTags.Add(Convert.ToInt32(objTag.PhaseIndex), objTag);
                            }
                        }
                    }
                }



                // '//Go through each tag and get the trip information
                foreach (clsPhaseTag objItem in TripTags.Values)
                {
                    if (objItem.IsOpen)
                    {
                        objItem.EndDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objDataService));
                    }

                    Dictionary<string, TripInfo> list = objReport.calculateTripInfo(ref objDataService, Convert.ToInt32(objItem.PhaseIndex),  objItem.PhaseID, objItem.StepID, objItem.EmphID, objItem.StartDate, objItem.EndDate, objItem.phaseName, objItem.stepName, objItem.emphName);

                    // '//Add it to the data ...
                    foreach (TripInfo objTripData in list.Values)
                        tripData.Add(tripData.Count + 1, objTripData.getCopy());
                }


                // '//Save this report
                TripInfo.removeAllTripInfo(objDataService, WellID);
                foreach (TripInfo objItem in tripData.Values)
                {
                    TripInfo.saveTripInfo(objDataService, objItem, WellID);
                }
                calculateBottomToBottomStats();
                calculateSurfaceTimeWithTags();
                //generatingReport = false;
                //RefreshRequired = true;
                refreshTable();
                


                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(this);

                return objResponse;


            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = objRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in generateReportData. " + ex.Message + ex.StackTrace;
                objBadResponse.Warnings+= ex.Message + ex.StackTrace; 
                return objBadResponse;
            }
        }



        private void refreshTable()
        {
            try
            {
                //grdData.Columns["COL_DEPTH"].ColumnName = "Depth (" + depthUnit + ")";//HeaderText 
                //grdData.Columns["COL_OFF_TO_ON_BTM_SPEED"].ColumnName = "Off to On Btm. Speed (" + depthUnit + "/hr.)";
                //grdData.Columns["COL_SPEED_WITH_CONN"].Caption= "Speed W/Conn. (" + depthUnit + "/hr.)";
                //grdData.Columns["COL_SPEED_WO_CONN"].ColumnName = "Speed W/O Conn. (" + depthUnit + "/hr.)";

                // prath Ticket no. VM-1815
                //grdData.Columns["COL_DIFF_W"].Caption= "Delta Speed W/ Conn. (" + depthUnit + "/hr.)";

                //grdData.Columns("COL_DIFF_WO").HeaderText = "Delta Speed W/O Conn. (" + depthUnit + "/hr.)";
              //  grdData.Columns("COL_DIFF").HeaderText = "Delta Avg. Conn. Time (Min)";
                // '**************

                // '//Sort the tags
                TripInfo[] arrTags = tripData.Values.ToArray();
                Array.Sort(arrTags);

                // '//Clear the Grid
                grdData.Rows.Clear();
                string RunningSection = "";
                string RunningRun = "";
                var subset = new Dictionary<string, TripInfo>();
                double sectionAvgTime = 0d;
                double sectionBestTime = 0d;
                double sectionDiff = 0d;
                double sectionSpeedWithConn = 0d;
                double sectionSpeedWOConn = 0d;

                // '//Add Heading ...
                grdData.Rows.Add();
                int rowIndex = grdData.Rows.Count - 1;
                for (int i = 0; i <= arrTags.Length - 1; i++)
                {
                    var objTag = arrTags[i];
                    if (objTag.PhaseName.Trim().ToUpper() != RunningSection)
                    {

                        // '//Display Section Name ...

                        if (i > 0)
                        {

                            // '//Add padding and statistics
                            grdData.Rows.Add(2);
                            rowIndex = grdData.Rows.Count - 1;
                            grdData.Rows[rowIndex]["COL_DIRECTION"] = "Avg. Time";
                            grdData.Rows[rowIndex]["COL_DIRECTION_BKCOLOR"] = "LightGray";// Color.LightGray.ToString();
                            grdData.Rows[rowIndex]["COL_START_DATE"] = "Best Time";
                            grdData.Rows[rowIndex]["COL_START_DATE_BKCOLOR"] = "LightGray";// Color.LightGray.ToString();
                            grdData.Rows[rowIndex]["COL_TOTAL_TIME"] = "Diff.";
                            grdData.Rows[rowIndex]["COL_TOTAL_TIME_BKCOLOR"] = "LightGray";// Color.LightGray.ToString();
                            grdData.Rows[rowIndex]["COL_OFF_TO_ON_BTM_TIME"]= "Speed w/ conn.";
                            grdData.Rows[rowIndex]["COL_OFF_TO_ON_BTM_TIME_BKCOLOR"] = "LightGray"; // Color.LightGray.ToString();
                            grdData.Rows[rowIndex]["COL_SPEED_WITH_CONN"] = "Speed w/o conn.";
                            grdData.Rows[rowIndex]["COL_SPEED_WITH_CONN_BKCOLOR"] = "LightGray"; // Color.LightGray.ToString();
                            calcSectionStats(subset, ref sectionAvgTime, ref sectionBestTime, ref sectionDiff,ref  sectionSpeedWithConn, ref sectionSpeedWOConn);

                            // //Display Statistics
                            grdData.Rows[rowIndex]["COL_DEPTH"] = sectionAvgTime;
                            grdData.Rows[rowIndex]["COL_END_DATE"] = sectionBestTime;
                            grdData.Rows[rowIndex]["COL_TIME_ON_SURFACE"] = sectionDiff;
                            grdData.Rows[rowIndex]["COL_OFF_TO_ON_BTM_SPEED"] = sectionSpeedWithConn;
                            grdData.Rows[rowIndex]["COL_SPEED_WO_CONN"] = sectionSpeedWOConn;
                        }

                        if (i > 0)
                        {
                            grdData.Rows.Add();
                        }

                        grdData.Rows.Add(1);
                        rowIndex = grdData.Rows.Count - 1;
                        
                        grdData.Rows[rowIndex]["COL_SECTION"] = objTag.PhaseName;
                        grdData.Rows[rowIndex]["COL_SECTION_BKCOLOR"] = "LightGray"; // Color.LightGray.ToString();
                        
                        RunningRun = "";

                        // 'Re-initialize sub set
                        subset = new Dictionary<string, TripInfo>();
                    }

                    if (objTag.EmphName.Trim().ToUpper() != RunningRun)
                    {

                        // '//Display Run No.
                        grdData.Rows.Add();
                        rowIndex = grdData.Rows.Count - 1;
                        grdData.Rows[rowIndex]["COL_RUN"] = objTag.EmphName;
                        grdData.Rows[rowIndex]["COL_RUN_BKCOLOR"] = "LightGray";// Color.LightGray.ToString();
                        //grdData.Rows[rowIndex]["COL_RUN"].Style.BackColor = Color.LightGray;

                    }

                    // '//Add a row
                    grdData.Rows.Add();
                    rowIndex = grdData.Rows.Count - 1;
                    grdData.Rows[rowIndex]["COL_PHASE_INDEX"] = objTag.TripIndexID;

                    // PHASE ID
                    grdData.Rows[rowIndex]["COL_PHASE_ID"]= objTag.PhaseID;

                    // STEP ID
                    grdData.Rows[rowIndex]["COL_STEP_ID"] = objTag.StepID;

                    // EMPH ID
                    grdData.Rows[rowIndex]["COL_EMPH_ID"] = objTag.EmphID;

                    // SECTION
                    grdData.Rows[rowIndex]["COL_SECTION"]= "";

                    // RUN
                    grdData.Rows[rowIndex]["COL_RUN"] = "";

                    // DIRECTION
                    if (objTag.Direction == TripInfo.tripDirection.TripIn)
                    {
                        grdData.Rows[rowIndex]["COL_DIRECTION"] = "In";
                    }
                    else
                    {
                        grdData.Rows[rowIndex]["COL_DIRECTION"] = "Out";
                    }

                    // DEPTH
                    grdData.Rows[rowIndex]["COL_DEPTH"] = Math.Round(objTag.HoleDepth, 2).ToString();

                    // START DATE
                    DateTime startDate = objTag.TripStartDate;
                    DateTime endDate = objTag.TripEndDate;

                    if (objWell.wellDateFormat == VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                    {
                        startDate = Util.convertUTCToWellTimeZone(startDate, objWell);
                        endDate = Util.convertUTCToWellTimeZone(endDate, objWell);
                    }
                    else
                    {
                        startDate = Util.convertLocalToWellTimeZone(startDate, objWell);
                        endDate = Util.convertLocalToWellTimeZone(endDate,objWell);
                    }

                    // END DATE
                    grdData.Rows[rowIndex]["COL_START_DATE"]= startDate.ToString("MMM-dd-yyyy HH:mm:ss");
                    grdData.Rows[rowIndex]["COL_END_DATE"] = endDate.ToString("MMM-dd-yyyy HH:mm:ss");

                    // TOTAL TIME
                    grdData.Rows[rowIndex]["COL_TOTAL_TIME"] = Math.Round(objTag.TotalTripTime, 2).ToString();

                    // TIME ON SURFACE
                    
                    grdData.Rows[rowIndex]["COL_TIME_ON_SURFACE"] = Math.Round(objTag.SurfaceTimeTags, 2).ToString();

                    // OFF TO ON BTM TIME
                    grdData.Rows[rowIndex]["COL_OFF_TO_ON_BTM_TIME"] = objTag.OffToOnBottomTime;

                    // OFF TO ON BTM SPEED
                    grdData.Rows[rowIndex]["COL_OFF_TO_ON_BTM_SPEED"] = objTag.OffToOnBottomSpeed;

                    // SPEED W/ CONN.
                    grdData.Rows[rowIndex]["COL_SPEED_WITH_CONN"] = Math.Round(objTag.TripSpeedWithConn, 2).ToString();

                    // SPEED W/O CONN
                    grdData.Rows[rowIndex]["COL_SPEED_WO_CONN"] = Math.Round(objTag.TripSpeedWOConn, 2).ToString();

                    // DIFF
                    if (objTag.DeltaTargetTime > 0)
                    {
                        grdData.Rows[rowIndex]["COL_DIFF"] = Math.Round(objTag.DeltaTargetTime, 2);
                        grdData.Rows[rowIndex]["COL_DIFF_BKCOLOR"] = "Green";// Color.LightGreen.ToString();
                    }
                    else
                    {
                        grdData.Rows[rowIndex]["COL_DIFF"] = Math.Round(objTag.DeltaTargetTime, 2);
                        grdData.Rows[rowIndex]["COL_DIFF_BKCOLOR"] = "OrangeRed";// Color.OrangeRed.ToString();
                    }

                    grdData.Rows[rowIndex]["COL_DIFF_W"] = Math.Round(objTag.DeltaSpeedWConn, 2).ToString();
                    if (objTag.DeltaSpeedWConn > 0)
                    {
                        grdData.Rows[rowIndex]["COL_DIFF_W_BKCOLOR"] = "OrangeRed";// Color.OrangeRed.ToString();
                    }
                    else
                    {
                        grdData.Rows[rowIndex]["COL_DIFF_W_BKCOLOR"] = "Green";// Color.LightGreen.ToString();
                    }

                    grdData.Rows[rowIndex]["COL_DIFF_WO"] = Math.Round(objTag.DeltaSpeedWOConn, 2).ToString();
                    if (objTag.DeltaSpeedWOConn > 0)
                    {
                        grdData.Rows[rowIndex]["COL_DIFF_WO_BKCOLOR"] = "OrangeRed";// Color.OrangeRed.ToString();
                    }
                    else
                    {
                        grdData.Rows[rowIndex]["COL_DIFF_WO_BKCOLOR"] = "Green";// Color.LightGreen.ToString();
                    }




                    // # cONNS.
                    grdData.Rows[rowIndex]["COL_CONNECTIONS"] = objTag.ConnectionCount.ToString();

                    // AVG. CONN. TIME
                    grdData.Rows[rowIndex]["COL_AVG_CONN_TIME"] = Math.Round(objTag.AvgConnTime, 2).ToString();

                    // AVG DAY CONN. TIME
                    grdData.Rows[rowIndex]["COL_AVG_DAY_TIME"]= Math.Round(objTag.AvgDayTime, 2).ToString();

                    // AVG NIGHT CONN. TIME
                    grdData.Rows[rowIndex]["COL_AVG_NIGHT_TIME"] = Math.Round(objTag.AvgNightTime, 2).ToString();
                    RunningSection = objTag.PhaseName.Trim().ToUpper();
                    RunningRun = objTag.EmphName.Trim().ToUpper();
                    subset.Add(objTag.EntryID, objTag.getCopy());
                }



                // '//Add padding and statistics
                grdData.Rows.Add(2);
                rowIndex = grdData.Rows.Count - 1;
                grdData.Rows[rowIndex]["COL_DIRECTION"] = "Avg. Time";
                grdData.Rows[rowIndex]["COL_DIRECTION_BKCOLOR"] = "LightGray";// Color.LightGray.ToString();
                grdData.Rows[rowIndex]["COL_START_DATE"] = "Best Time";
                grdData.Rows[rowIndex]["COL_START_DATE_BKCOLOR"] = "LightGray";// Color.LightGray.ToString();
                grdData.Rows[rowIndex]["COL_TOTAL_TIME"] = "Diff.";
                grdData.Rows[rowIndex]["COL_TOTAL_TIME_BKCOLOR"] = "LightGray";// Color.LightGray.ToString();
                grdData.Rows[rowIndex]["COL_OFF_TO_ON_BTM_TIME"] = "Speed w/ conn.";
                grdData.Rows[rowIndex]["COL_OFF_TO_ON_BTM_TIME_BKCOLOR"] = "LightGray";// Color.LightGray.ToString();
                grdData.Rows[rowIndex]["COL_SPEED_WITH_CONN"] = "Speed w/o conn.";
                grdData.Rows[rowIndex]["COL_SPEED_WITH_CONN_BKCOLOR"] = "LightGray";// Color.LightGray.ToString();
                calcSectionStats(subset, ref sectionAvgTime, ref sectionBestTime, ref sectionDiff, ref sectionSpeedWithConn, ref sectionSpeedWOConn);

                // //Display Statistics
                grdData.Rows[rowIndex]["COL_DEPTH"] = sectionAvgTime;
                grdData.Rows[rowIndex]["COL_END_DATE"] = sectionBestTime;
                grdData.Rows[rowIndex]["COL_TIME_ON_SURFACE"] = sectionDiff;
                grdData.Rows[rowIndex]["COL_OFF_TO_ON_BTM_SPEED"] = sectionSpeedWithConn;
                grdData.Rows[rowIndex]["COL_SPEED_WO_CONN"] = sectionSpeedWOConn;
                //applyLegendCustomization(); NOT IMPLIMENTED YET
            }
            catch (Exception ex)
            {
            }
        }

        private void calcSectionStats(Dictionary<string, TripInfo> paramList, ref double paramAvgTime, ref double paramBestTime, ref double paramDiff, ref double paramSpeedWithConn, ref double paramSpeedWOConn)
        {
            try
            {
                if (paramList.Count <= 0)
                {
                    return;
                }

                paramAvgTime = 0d;
                double sumTime = 0d;
                foreach (TripInfo objItem in paramList.Values)
                {
                    if (objItem.AvgConnTime > 0)
                    {
                        sumTime = sumTime + objItem.AvgConnTime;
                    }
                }

                if (sumTime > 0d & paramList.Count > 0)
                {
                    paramAvgTime = Math.Round(sumTime / paramList.Count, 2);
                }

                double minTime = 0d;
                double maxTime = 0d;
                foreach (TripInfo objItem in paramList.Values)
                {
                    if (objItem.AvgConnTime > maxTime & objItem.AvgConnTime > 0)
                    {
                        maxTime = objItem.AvgConnTime;
                    }
                }

                minTime = maxTime;
                foreach (TripInfo objItem in paramList.Values)
                {
                    if (objItem.AvgConnTime < minTime & objItem.AvgConnTime > 0)
                    {
                        minTime = objItem.AvgConnTime;
                    }
                }

                paramBestTime = minTime;
                if (paramBestTime == 0d)
                {
                    bool halt = true;
                }

                paramDiff = objReport.objSettings.BenchmarkTime - paramAvgTime;
                double sumSpeed = 0d;
                foreach (TripInfo objItem in paramList.Values)
                    sumSpeed = sumSpeed + objItem.TripSpeedWithConn;
                if (sumSpeed > 0d)
                {
                    paramSpeedWithConn = Math.Round(sumSpeed / paramList.Count, 2);
                }

                sumSpeed = 0d;
                foreach (TripInfo objItem in paramList.Values)
                    sumSpeed = sumSpeed + objItem.TripSpeedWOConn;
                if (sumSpeed > 0d)
                {
                    paramSpeedWOConn = Math.Round(sumSpeed / paramList.Count, 2);
                }
            }
            catch (Exception ex)
            {
            }
        }

        private void calculateBottomToBottomStats()
        {
            try
            {

                // '//Get all the tags first
                var exList = new Dictionary<int, int>();
                //exList = TripReportSettings.getTripExclusionList(objDataService, WellID);
                exList = VuMaxDR.Data.Objects.TripReportSettings.getTripExclusionList(objDataService, WellID);
                var tagList = new Dictionary<int, clsPhaseTag>();
                DataTable objData;
                if (!objTripReportSettings.UseCustomTags)
                {
                    objData = objDataService.getTable("SELECT A.PHASE_INDEX,A.START_DATE,A.END_DATE,A.PHASE_ID,A.STEP_ID,A.EMPH_ID,C.PHASE_NAME,D.STEP_NAME,E.EMPH_NAME FROM VMX_PHASE_LIST A LEFT JOIN VMX_PHASE_MASTER C ON (A.PHASE_ID=C.PHASE_ID) LEFT JOIN VMX_STEP_MASTER D ON (A.PHASE_ID=D.PHASE_ID AND A.STEP_ID=D.STEP_ID) LEFT JOIN VMX_EMPH_MASTER E ON (E.PHASE_ID=A.PHASE_ID AND E.STEP_ID=A.STEP_ID AND E.EMPH_ID=A.EMPH_ID) WHERE A.WELL_ID='" + WellID + "' ORDER BY START_DATE");
                }
                else
                {
                    string strSQL = "";
                    strSQL = " SELECT ";
                    strSQL += " A.TAG_INDEX AS PHASE_INDEX,A.START_DATE,A.END_DATE,A.CATEGORY_ID AS PHASE_ID,A.SUB_CATEGORY_ID AS STEP_ID,A.ACTIVITY_ID AS EMPH_ID,C.CATEGORY_NAME AS PHASE_NAME,D.SUB_CATEGORY_NAME AS STEP_NAME,E.ACTIVITY_NAME AS EMPH_NAME ";
                    strSQL += " FROM  ";
                    strSQL += " VMX_CUSTOM_TAG_LIST A ";
                    strSQL += " LEFT JOIN VMX_CUSTOM_TAG_CATEGORY_MASTER C ON (A.CATEGORY_ID=C.TAG_CATEGORY_ID AND A.SOURCE_ID=C.SOURCE_ID) ";
                    strSQL += " LEFT JOIN VMX_CUSTOM_TAG_SUB_CATEGORY_MASTER D ON (A.CATEGORY_ID=D.TAG_CATEGORY_ID AND A.SUB_CATEGORY_ID=D.TAG_SUB_CATEGORY_ID AND A.SOURCE_ID=D.SOURCE_ID) ";
                    strSQL += " LEFT JOIN VMX_CUSTOM_TAG_ACTIVITY_MASTER E ON (E.TAG_CATEGORY_ID=A.CATEGORY_ID AND E.TAG_SUB_CATEGORY_ID=A.SUB_CATEGORY_ID AND E.TAG_ACTIVITY_ID=A.ACTIVITY_ID AND A.SOURCE_ID=E.SOURCE_ID) ";
                    strSQL += " WHERE A.WELL_ID='" + WellID + "' AND A.SOURCE_ID='" + objTripReportSettings.TagSourceID + "' ORDER BY START_DATE ";
                    objData = objDataService.getTable(strSQL);
                }

                foreach (DataRow objRow in objData.Rows)
                {
                    double PhaseIndex = Convert.ToDouble( DataService.checkNull(objRow["PHASE_INDEX"], 0));
                    string PhaseID = DataService.checkNull(objRow["PHASE_ID"], "").ToString();
                    string PhaseName = DataService.checkNull(objRow["PHASE_NAME"], "").ToString();
                    string StepID = DataService.checkNull(objRow["STEP_ID"], "").ToString();
                    string StepName = DataService.checkNull(objRow["STEP_NAME"], "").ToString();
                    string EmphID = DataService.checkNull(objRow["EMPH_ID"], "").ToString();
                    string EmphName = DataService.checkNull(objRow["EMPH_NAME"], "").ToString();
                    DateTime TagStartDate = Convert.ToDateTime( DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    DateTime TagEndDate =Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    var objTag = new clsPhaseTag();
                    objTag.PhaseIndex = PhaseIndex;
                    objTag.PhaseID = PhaseID;
                    objTag.phaseName = PhaseName;
                    objTag.StepID = StepID;
                    objTag.stepName = StepName;
                    objTag.EmphID = EmphID;
                    objTag.emphName = EmphName;
                    objTag.StartDate = TagStartDate;
                    objTag.EndDate = TagEndDate;
                    if (!tagList.ContainsKey(Convert.ToInt32( objTag.PhaseIndex)))
                    {
                        tagList.Add(Convert.ToInt32(objTag.PhaseIndex), objTag);
                    }
                }

                // '//Sort the tags by date
                clsPhaseTag[] arrTags = tagList.Values.ToArray();
                Array.Sort(arrTags);
                clsPhaseTag[] arrTripTags = TripTags.Values.ToArray();
                Array.Sort(arrTripTags);
                for (int i = 0; i <= arrTags.Length - 2; i++)
                {

                    // 'Check if this tag is Trip Tag
                    if (clsPhaseTag.isTagOfGivenType(objDataService, arrTags[i], AdvKPIProfile.TRIP))
                    {


                        // '//Get Direction of this Trip Tag
                        int Direction = objReport.getTripDirection(ref objDataService, objTimeLog, arrTags[i]);
                        if (Direction == 0 | Direction == 1) // 'Out
                        {

                            // '//Find Next Drilling Date
                            DateTime NextDrillingDate = objReport.getNextDrillingDateTime(ref objDataService, objTimeLog, arrTags[i].EndDate);
                            DateTime PrevDrillingDate = objReport.getPrevDrillingDateTime(ref objDataService, objTimeLog, arrTags[i].StartDate);
                            if (NextDrillingDate != new DateTime() & NextDrillingDate != DateTime.FromOADate(0d) & PrevDrillingDate != new DateTime() & PrevDrillingDate != DateTime.FromOADate(0d))
                            {
                                //long TotalSeconds = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, PrevDrillingDate, NextDrillingDate));
                                long TotalSeconds = Convert.ToInt64(Math.Abs((NextDrillingDate - PrevDrillingDate).TotalSeconds));
                                


                                // 'Add the time period of this tag to the surface time
                                var objTripData = default(TripInfo); // 'This is to be updated ...
                                bool Found = false;
                                foreach (TripInfo objItem in tripData.Values)
                                {
                                    if (objItem.TripIndexID == arrTags[i].PhaseIndex)
                                    {
                                        objTripData = objItem;
                                        Found = true;
                                        break;
                                    }
                                }

                                if (Found)
                                {
                                    objTripData.OffToOnBottomTime = Math.Round(TotalSeconds / 60d / 60d, 2);
                                    double totalFootage = objReport.getFootage(ref objDataService, objTimeLog, PrevDrillingDate, NextDrillingDate);
                                    if (totalFootage > 0 & TotalSeconds > 0)
                                    {
                                        objTripData.OffToOnBottomSpeed = Math.Round(totalFootage / (TotalSeconds / 60 / 60), 2);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }

        private void calculateSurfaceTimeWithTags()
        {
            try
            {

                // '//Get all the tags first
                var exList = new Dictionary<int, int>();
                //exList = TripReportSettings.getTripExclusionList(objDataService, WellID);
                exList = VuMaxDR.Data.Objects.TripReportSettings.getTripExclusionList(objDataService, WellID);
                var tagList = new Dictionary<int, clsPhaseTag>();
                DataTable objData;
                if (!objTripReportSettings.UseCustomTags)
                {
                    objData = objDataService.getTable("SELECT A.PHASE_INDEX,A.START_DATE,A.END_DATE,A.PHASE_ID,A.STEP_ID,A.EMPH_ID,C.PHASE_NAME,D.STEP_NAME,E.EMPH_NAME FROM VMX_PHASE_LIST A LEFT JOIN VMX_PHASE_MASTER C ON (A.PHASE_ID=C.PHASE_ID) LEFT JOIN VMX_STEP_MASTER D ON (A.PHASE_ID=D.PHASE_ID AND A.STEP_ID=D.STEP_ID) LEFT JOIN VMX_EMPH_MASTER E ON (E.PHASE_ID=A.PHASE_ID AND E.STEP_ID=A.STEP_ID AND E.EMPH_ID=A.EMPH_ID) WHERE A.WELL_ID='" + WellID + "' ORDER BY START_DATE");
                }
                else
                {
                    string strSQL = "";
                    strSQL = " SELECT ";
                    strSQL += " A.TAG_INDEX AS PHASE_INDEX,A.START_DATE,A.END_DATE,A.CATEGORY_ID AS PHASE_ID,A.SUB_CATEGORY_ID AS STEP_ID,A.ACTIVITY_ID AS EMPH_ID,C.CATEGORY_NAME AS PHASE_NAME,D.SUB_CATEGORY_NAME AS STEP_NAME,E.ACTIVITY_NAME AS EMPH_NAME ";
                    strSQL += " FROM  ";
                    strSQL += " VMX_CUSTOM_TAG_LIST A ";
                    strSQL += " LEFT JOIN VMX_CUSTOM_TAG_CATEGORY_MASTER C ON (A.CATEGORY_ID=C.TAG_CATEGORY_ID AND A.SOURCE_ID=C.SOURCE_ID) ";
                    strSQL += " LEFT JOIN VMX_CUSTOM_TAG_SUB_CATEGORY_MASTER D ON (A.CATEGORY_ID=D.TAG_CATEGORY_ID AND A.SUB_CATEGORY_ID=D.TAG_SUB_CATEGORY_ID AND A.SOURCE_ID=D.SOURCE_ID) ";
                    strSQL += " LEFT JOIN VMX_CUSTOM_TAG_ACTIVITY_MASTER E ON (E.TAG_CATEGORY_ID=A.CATEGORY_ID AND E.TAG_SUB_CATEGORY_ID=A.SUB_CATEGORY_ID AND E.TAG_ACTIVITY_ID=A.ACTIVITY_ID AND A.SOURCE_ID=E.SOURCE_ID) ";
                    strSQL += " WHERE A.WELL_ID='" + WellID + "' AND A.SOURCE_ID='" + objTripReportSettings.TagSourceID + "' ORDER BY START_DATE ";
                    objData = objDataService.getTable(strSQL);
                }

                foreach (DataRow objRow in objData.Rows)
                {
                    double PhaseIndex = Convert.ToDouble( DataService.checkNull(objRow["PHASE_INDEX"], 0));
                    string PhaseID = DataService.checkNull(objRow["PHASE_ID"], "").ToString();
                    string PhaseName = DataService.checkNull(objRow["PHASE_NAME"], "").ToString();
                    string StepID = DataService.checkNull(objRow["STEP_ID"], "").ToString();
                    string StepName = DataService.checkNull(objRow["STEP_NAME"], "").ToString();
                    string EmphID = DataService.checkNull(objRow["EMPH_ID"], "").ToString();
                    string EmphName = DataService.checkNull(objRow["EMPH_NAME"], "").ToString();
                    DateTime TagStartDate = Convert.ToDateTime(DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    DateTime TagEndDate = Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    var objTag = new clsPhaseTag();
                    objTag.PhaseIndex = PhaseIndex;
                    objTag.PhaseID = PhaseID;
                    objTag.phaseName = PhaseName;
                    objTag.StepID = StepID;
                    objTag.stepName = StepName;
                    objTag.EmphID = EmphID;
                    objTag.emphName = EmphName;
                    objTag.StartDate = TagStartDate;
                    objTag.EndDate = TagEndDate;
                    if (!tagList.ContainsKey(Convert.ToInt32( objTag.PhaseIndex)))
                    {
                        tagList.Add(Convert.ToInt32(objTag.PhaseIndex), objTag);
                    }
                }

                // '//Sort the tags by date
                clsPhaseTag[] arrTags = tagList.Values.ToArray();
                Array.Sort(arrTags);
                clsPhaseTag[] arrTripTags = TripTags.Values.ToArray();
                Array.Sort(arrTripTags);
                for (int i = 0; i <= arrTags.Length - 2; i++)
                {

                    // 'Check if this tag is Trip Tag
                    if (clsPhaseTag.isTagOfGivenType(objDataService, arrTags[i], AdvKPIProfile.TRIP))
                    {

                        // 'Check if next tag is of 'Surface Time'
                        if (clsPhaseTag.isTagOfGivenType(objDataService, arrTags[i + 1], AdvKPIProfile.SURFACE_TIME))
                        {

                            // 'Add the time period of this tag to the surface time
                            var objTripData = default(TripInfo); // 'This is to be updated ...
                            bool found = false;
                            foreach (TripInfo objItem in tripData.Values)
                            {
                                if (objItem.TripIndexID == arrTags[i].PhaseIndex)
                                {
                                    objTripData = objItem;
                                    found = true;
                                    break;
                                }
                            }

                            if (found)
                            {
                                //double tagTime = Math.Abs(DateDiff(DateInterval.Second, arrTags[i + 1].StartDate, arrTags[i + 1].EndDate));
                                double tagTime = Math.Abs( (arrTags[i + 1].EndDate- arrTags[i + 1].StartDate).TotalSeconds);
                                if (tagTime != 0)
                                {
                                    tagTime = Math.Round(tagTime / 60 / 60, 2);
                                }

                                objTripData.SurfaceTimeTags = tagTime;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }

        public Broker.BrokerResponse refreshSingleTripStats(ref VuMaxDR.Data.DataService paramObjDataService, string paramWellID, int paramPhaseIndexID)
        {
            try
            {
                Broker.BrokerResponse objResponse = objRequest.createResponseObject();
                Initialize(paramWellID);
                generateTripReport(ref paramObjDataService, paramWellID);

                SingleTripStats objSingleTripStat = new SingleTripStats();

                TripInfo objTripData = new TripInfo();

                // '//Find the trip in the data
                foreach (TripInfo objItem in tripData.Values)
                {
                    if (objItem.TripIndexID == paramPhaseIndexID)
                    {
                        objTripData = objItem;
                        //objSingleTripStat.objTripData = objItem;
                        break;
                    }
                }

                if (objTripData is null)
                {
                    //return;
                }

                objSingleTripStat.lblSection = objTripData.PhaseName;
                objSingleTripStat.lblDirection= objTripData.StepName;
                objSingleTripStat.lblRun = objTripData.EmphName;
                objSingleTripStat.lblDepth = Math.Round(objTripData.HoleDepth, 2).ToString();
                DateTime dtFromDate = objTripData.TripStartDate;
                DateTime dtToDate = objTripData.TripEndDate;
                if (objWell.wellDateFormat == VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                {
                    objSingleTripStat.dtFromDate = Util.convertUTCToWellTimeZone(dtFromDate, objWell);
                    objSingleTripStat.dtToDate = Util.convertUTCToWellTimeZone(dtToDate, objWell);
                }
                else
                {
                    objSingleTripStat.dtFromDate = Util.convertLocalToWellTimeZone(dtFromDate, objWell);
                    objSingleTripStat.dtToDate = Util.convertLocalToWellTimeZone(dtToDate, objWell);
                }

                objSingleTripStat.lblStartTime= objSingleTripStat.dtFromDate.ToString("MMM-dd-yyyy HH:mm:ss");
                objSingleTripStat.lblEndTime = objSingleTripStat.dtToDate.ToString("MMM-dd-yyyy HH:mm:ss");
                objSingleTripStat.lblAvgConnTime= Math.Round(objTripData.AvgConnTime, 2).ToString();
                double bestTime = objReport.getSingleTripBestConnTime(objDataService, objTripData.TripStartDate, objTripData.TripEndDate);
                objSingleTripStat.lblBestTime = Math.Round(bestTime, 2);
                double Diff = Math.Round(objTripReportSettings.BenchmarkTime - objTripData.AvgConnTime, 2);
                objSingleTripStat.lblDiff= Diff.ToString();
                if (Diff >= 0d)
                {
                    objSingleTripStat.lblDiffBackColor = Color.Transparent.ToString();
                }
                else
                {
                    objSingleTripStat.lblDiffBackColor = Color.OrangeRed.ToString();
                }

                objSingleTripStat.lblSpeedWithConn = Math.Round(objTripData.TripSpeedWithConn, 2).ToString();
                objSingleTripStat.lblSpeedWOConn= Math.Round(objTripData.TripSpeedWOConn, 2).ToString();
                objSingleTripStat.lblAvgTimeDay = Math.Round(objTripData.AvgDayTime, 2).ToString();
                objSingleTripStat.lblAvgTimeNight = Math.Round(objTripData.AvgNightTime, 2).ToString();

                // '//Refresh Charts 
                //HorizLine1.Clear();
                //HorizLine2.Clear();
                double fillupTime = 0;
                objReport.calculateFillupTime(objDataService, objTripData.TripStartDate, objTripData.TripEndDate, ref fillupTime);
                objSingleTripStat.lblFillupTime = string.Format("{0:0.00}", fillupTime);
                ContTripSpeedInfo[] arrSpeedWO = objTripData.ContTripSpeedWOConn100.Values.ToArray();
                Array.Sort(arrSpeedWO);
                objSingleTripStat.arrSpeedWO = arrSpeedWO;
                //for (int i = 0, loopTo = arrSpeedWO.Length - 1; i <= loopTo; i++)
                //{
                //    var objItem = arrSpeedWO[i];
                //    HorizLine1.Add(objItem.Speed, objItem.Depth);
                //}

                ContTripSpeedInfo[] arrSpeedWith = objTripData.ContTripSpeedWithConn100.Values.ToArray();
                Array.Sort(arrSpeedWith);
                objSingleTripStat.arrSpeedWith = arrSpeedWith;
                //for (int i = 0, loopTo1 = arrSpeedWith.Length - 1; i <= loopTo1; i++)
                //{
                //    var objItem = arrSpeedWith[i];
                //    HorizLine2.Add(objItem.Speed, objItem.Depth);
                //}

                //ST_objChart1.Zoom.Undo();
                //ST_objChart1.Refresh();

                //// '//Add connection times
                //Bar1.Clear();
                //Bar1.ColorEach = true;
                //Bar1.Marks.Visible = false;
                Dictionary<int, VuMaxDR.Data.Objects.TripConn> listConn = objReport.getSingleTripConnections(objDataService, objTripData.TripStartDate, objTripData.TripEndDate);
                VuMaxDR.Data.Objects.TripConn[] arrConn = listConn.Values.ToArray();
                objSingleTripStat.arrConn = arrConn;



                // 'Array.Sort(arrConn)

                //for (int i = 0, loopTo2 = arrConn.Length - 1; i <= loopTo2; i++)
                //{
                //    var objItem = arrConn[i];
                //    Bar1.Add(objItem.Time / 60, Math.Round(objItem.Depth).ToString);
                //    if (objItem.DayNight == "D")
                //    {
                //        Bar1.Colors(Bar1.Count - 1) = Color.Orange;
                //    }
                //    else
                //    {
                //        Bar1.Colors(Bar1.Count - 1) = Color.Black;
                //    }
                //}

               // ST_objChart3.Refresh();
                double flatPercent = 0;
                double movePercent = 0;
                objReport.calculateFlatAndMoveTime(objDataService, objTripData.TripStartDate, objTripData.TripEndDate, ref flatPercent, ref movePercent);
                objSingleTripStat.flatPercent = flatPercent;
                objSingleTripStat.movePercent = movePercent;
                //Pie1.Clear();
                //Pie1.Add(flatPercent, "Flat Time (" + flatPercent.ToString() + ")");
                //Pie1.Add(movePercent, "Movement Time (" + movePercent.ToString() + ")");
                //ST_objChart2.Refresh();


                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objSingleTripStat);

                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = objRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in generateReportData. " + ex.Message + ex.StackTrace;
                objBadResponse.Warnings += ex.Message + ex.StackTrace;
                return objBadResponse;

            }
        }



    }//Class
}//Namespace
