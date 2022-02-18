using eVuMax.DataBroker.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
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
        public TripReportUserSettings objUserSettings = new TripReportUserSettings();
        public DataTable CustomTagList = new DataTable();

        //Trip Selection Table Variables
        public DataTable tagList = new DataTable();
        public string UserID = "";



        private void loadCustomTagSourceData()
        {
            try
            {
                
                var objData = new DataTable();
                objData = objDataService.getTable("SELECT SOURCE_ID,SOURCE_NAME FROM VMX_TAG_SOURCES ORDER BY SOURCE_NAME");
                if (objData.Rows.Count > 0)
                {
                    CustomTagList = objData;    
                
                }

                CustomTagList = objData;
            }
            catch (Exception ex)
            {
                
            }
        }
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

            generateTagListTable();




        }
        
        public void generateTagListTable()
        {
            try
            {

                tagList.Columns.Add("COL_SELECTION");
                tagList.Columns.Add("COL_PHASE_INDEX");
                tagList.Columns.Add("COL_PHASE_ID");
                tagList.Columns.Add("COL_PHASE_NAME");
                tagList.Columns.Add("COL_STEP_ID");
                tagList.Columns.Add("COL_STEP_NAME");
                tagList.Columns.Add("COL_EMPH_ID");
                tagList.Columns.Add("COL_EMPH_NAME");
                tagList.Columns.Add("COL_TIME_LOG");
                tagList.Columns.Add("COL_TIME_LOG_ID");
                tagList.Columns.Add("COL_START_DATE");
                tagList.Columns.Add("COL_END_DATE");


            }
            catch (Exception)
            {

                throw;
            }
        }
        private void Initialize(string paramWellID)
        {
            try
            {
                loadCustomTagSourceData();//Nishant 29-01-2022
                objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref objDataService, paramWellID);
                if (objTimeLog is object)
                {
                    depthUnit = objTimeLog.logCurves["DEPTH"].VuMaxUnitID;
                }

                objTripReportSettings = VuMaxDR.Data.Objects.TripReportSettings.getSettings(objDataService, paramWellID); //original
                objUserSettings.WellID = paramWellID;
                objUserSettings.UserID = UserID;
                objUserSettings.objDataService = objDataService;
                objUserSettings.loadSettings(); //PENDING

              

                objUserSettings.overWriteTripReportSettingsWithUserSettings(ref objTripReportSettings);
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

        public DataTable loadTagListCustom(ref DataService paramObjDataService, string paramTagSourceID, string paramWellID)
        {
            try
            {

                Initialize(paramWellID);
                generateGrdTable();
                tagList.Rows.Clear();


                // 'Display filtered list of tags ...

                string sourceID = paramTagSourceID; // objTripReportSettings.TagSourceID; // objUserSettings.TagSourceID; // workaround pending 
                Dictionary<int, clsPhaseTag> tripTypeTags = PhaseMapping.getList(paramObjDataService, AdvKPIProfile.TRIP);
                string strSQL = "";
                strSQL = " SELECT ";
                strSQL += " A.TAG_INDEX,A.START_DATE,A.END_DATE,A.CATEGORY_ID,A.SUB_CATEGORY_ID,A.ACTIVITY_ID,C.CATEGORY_NAME,D.SUB_CATEGORY_NAME,E.ACTIVITY_NAME ";
                strSQL += " FROM  ";
                strSQL += " VMX_CUSTOM_TAG_LIST A ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_CATEGORY_MASTER C ON (A.CATEGORY_ID=C.TAG_CATEGORY_ID AND A.SOURCE_ID=C.SOURCE_ID) ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_SUB_CATEGORY_MASTER D ON (A.CATEGORY_ID=D.TAG_CATEGORY_ID AND A.SUB_CATEGORY_ID=D.TAG_SUB_CATEGORY_ID AND A.SOURCE_ID=D.SOURCE_ID) ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_ACTIVITY_MASTER E ON (E.TAG_CATEGORY_ID=A.CATEGORY_ID AND E.TAG_SUB_CATEGORY_ID=A.SUB_CATEGORY_ID AND E.TAG_ACTIVITY_ID=A.ACTIVITY_ID AND A.SOURCE_ID=E.SOURCE_ID) ";
                strSQL += " WHERE A.WELL_ID='" + WellID + "' AND A.SOURCE_ID='" + sourceID + "' ORDER BY START_DATE ";
                DataTable objData = paramObjDataService.getTable(strSQL);
                foreach (DataRow objRow in objData.Rows)
                {
                    string PhaseID = DataService.checkNull(objRow["CATEGORY_ID"], "").ToString();
                    string PhaseName = DataService.checkNull(objRow["CATEGORY_NAME"], "").ToString();
                    string StepID = DataService.checkNull(objRow["SUB_CATEGORY_ID"], "").ToString();
                    string StepName = DataService.checkNull(objRow["SUB_CATEGORY_NAME"], "").ToString();
                    string EmphID = DataService.checkNull(objRow["ACTIVITY_ID"], "").ToString();
                    string EmphName = DataService.checkNull(objRow["ACTIVITY_NAME"], "").ToString();
                    double PhaseIndex = Convert.ToInt32( DataService.checkNull(objRow["TAG_INDEX"], 0));
                    DateTime TagStartDate = Convert.ToDateTime( DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    DateTime TagEndDate = Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    if (objWell.wellDateFormat == VuMaxDR.Data.Objects. Well.wDateFormatUTC)
                    {
                        TagStartDate = utilFunctionsDO.convertUTCToWellTimeZone(TagStartDate, objWell);
                        TagEndDate = utilFunctionsDO.convertUTCToWellTimeZone(TagEndDate, objWell);
                    }
                    else
                    {
                        TagStartDate = utilFunctionsDO.convertLocalToWellTimeZone(TagStartDate, objWell);
                        TagEndDate = utilFunctionsDO.convertLocalToWellTimeZone(TagEndDate, objWell);
                    }



                    // 'Check if this tag is Trip tag
                    bool Found = false;
                    foreach (clsPhaseTag objTagType in tripTypeTags.Values)
                    {
                        if (objTagType.PhaseID == PhaseID & objTagType.StepID == StepID & objTagType.EmphID == EmphID)
                        {
                            Found = true;
                            break;
                        }
                    }

                    if (Found)
                    {
                        DateTime StartDate = Convert.ToDateTime( DataService.checkNull(objRow["START_DATE"], new DateTime()));
                        DateTime EndDate =Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));
                        string TimeLogID = "";
                        string TimeLogName = "";


                        // 'Find the right time log
                        foreach (Wellbore objWellbore in objWell.wellbores.Values)
                        {
                            foreach (TimeLog objTimeLog in objWellbore.timeLogs.Values)
                            {
                                if (!objTimeLog.RemarksLog)
                                {
                                    var tStartDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref objDataService));
                                    var tEndDate = DateTime.FromOADate(objTimeLog.getLastIndex(ref objDataService));
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
                        tagList.Rows.Add();
                        int rowIndex = tagList.Rows.Count - 1;
                 

                        tagList.Rows[rowIndex]["COL_SELECTION"] = true;
                        tagList.Rows[rowIndex]["COL_PHASE_INDEX"] = PhaseIndex;
                        tagList.Rows[rowIndex]["COL_PHASE_ID"] = PhaseID;
                        tagList.Rows[rowIndex]["COL_PHASE_NAME"] = PhaseName;
                        tagList.Rows[rowIndex]["COL_STEP_ID"] = StepID;
                        tagList.Rows[rowIndex]["COL_STEP_NAME"] = StepName;
                        tagList.Rows[rowIndex]["COL_EMPH_ID"] = EmphID;
                        tagList.Rows[rowIndex]["COL_EMPH_NAME"] = EmphName;
                        tagList.Rows[rowIndex]["COL_TIME_LOG_ID"] = TimeLogID;
                        tagList.Rows[rowIndex]["COL_TIME_LOG"] = TimeLogName;
                        tagList.Rows[rowIndex]["COL_START_DATE"] = TagStartDate.ToString("MMM-dd-yyyy HH:mm:ss");
                        tagList.Rows[rowIndex]["COL_END_DATE"] = TagEndDate.ToString("MMM-dd-yyyy HH:mm:ss");
                    }
                }


                // '//Get the list of exclusions 
                Dictionary<int, int> list = objUserSettings.TripExclusionList; // TripReportSettings.getTripExclusionList(objDataService, WellID);

                //if (objUserSettings.TripExclusionListStr.Length > 0) //Nishant 29-01-2022
                //{
                //    list.Clear();
                //    foreach (string strPhaseIndex in objUserSettings.TripExclusionListStr)
                //    {
                //        list.Add(Convert.ToInt32(strPhaseIndex), Convert.ToInt32(strPhaseIndex));

                //    }
                //}

                // '//Remove the selections of the excluded trips
                foreach (int lnTagID in list.Keys)
                {
                    for (int i = 0; i <= tagList.Rows.Count - 1; i++)
                    {
                        int tagID = Convert.ToInt32( tagList.Rows[i]["COL_PHASE_INDEX"].ToString());
                        if (tagID == lnTagID)
                        {
                            tagList.Rows[i]["COL_SELECTION"] = false;
                        }
                    }
                }
                return tagList;
            }
            catch (Exception ex)
            {

                return tagList;
            }
        }
        public DataTable loadTagListDrilling()
        {
            try
            {
                tagList.Rows.Clear();
                Dictionary<int, clsPhaseTag> tripTypeTags = PhaseMapping.getList(objDataService, AdvKPIProfile.TRIP);
                DataTable objData = objDataService.getTable("SELECT A.PHASE_INDEX,A.START_DATE,A.END_DATE,A.PHASE_ID,A.STEP_ID,A.EMPH_ID,C.PHASE_NAME,D.STEP_NAME,E.EMPH_NAME FROM VMX_PHASE_LIST A LEFT JOIN VMX_PHASE_MASTER C ON (A.PHASE_ID=C.PHASE_ID) LEFT JOIN VMX_STEP_MASTER D ON (A.PHASE_ID=D.PHASE_ID AND A.STEP_ID=D.STEP_ID) LEFT JOIN VMX_EMPH_MASTER E ON (E.PHASE_ID=A.PHASE_ID AND E.STEP_ID=A.STEP_ID AND E.EMPH_ID=A.EMPH_ID) WHERE A.WELL_ID='" + WellID + "' ORDER BY START_DATE");
                foreach (DataRow objRow in objData.Rows)
                {
                    string PhaseID = Convert.ToString(DataService.checkNull(objRow["PHASE_ID"], ""));
                    string PhaseName = DataService.checkNull(objRow["PHASE_NAME"], "").ToString();
                    string StepID = DataService.checkNull(objRow["STEP_ID"], "").ToString();
                    string StepName = DataService.checkNull(objRow["STEP_NAME"], "").ToString();
                    string EmphID = DataService.checkNull(objRow["EMPH_ID"], "").ToString();
                    string EmphName = DataService.checkNull(objRow["EMPH_NAME"], "").ToString();
                    double PhaseIndex = Convert.ToInt32(DataService.checkNull(objRow["PHASE_INDEX"], 0));
                    DateTime TagStartDate = Convert.ToDateTime(DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    DateTime TagEndDate = Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    if (objWell.wellDateFormat == VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                    {
                        TagStartDate = utilFunctionsDO.convertUTCToWellTimeZone(TagStartDate, objWell);
                        TagEndDate = utilFunctionsDO.convertUTCToWellTimeZone(TagEndDate, objWell);
                    }
                    else
                    {
                        TagStartDate = utilFunctionsDO.convertLocalToWellTimeZone(TagStartDate, objWell);
                        TagEndDate = utilFunctionsDO.convertLocalToWellTimeZone(TagEndDate, objWell);
                    }



                    // 'Check if this tag is Trip tag
                    bool Found = false;
                    foreach (clsPhaseTag objTagType in tripTypeTags.Values)
                    {
                        if (objTagType.PhaseID == PhaseID & objTagType.StepID == StepID & objTagType.EmphID == EmphID)
                        {
                            Found = true;
                            break;
                        }
                    }

                    if (Found)
                    {
                        DateTime StartDate = Convert.ToDateTime( DataService.checkNull(objRow["START_DATE"], new DateTime()));
                        DateTime EndDate = Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));
                        string TimeLogID = "";
                        string TimeLogName = "";


                        // 'Find the right time log
                        foreach (Wellbore objWellbore in objWell.wellbores.Values)
                        {
                            foreach (TimeLog objTimeLog in objWellbore.timeLogs.Values)
                            {
                                if (!objTimeLog.RemarksLog)
                                {
                                    var tStartDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref objDataService));
                                    var tEndDate = DateTime.FromOADate(objTimeLog.getLastIndex(ref objDataService));
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
                        tagList.Rows.Add();
                        int rowIndex = tagList.Rows.Count - 1;
                        tagList.Rows[rowIndex]["COL_SELECTION"] = true;
                        tagList.Rows[rowIndex]["COL_PHASE_INDEX"] = PhaseIndex;
                        tagList.Rows[rowIndex]["COL_PHASE_ID"] = PhaseID;
                        tagList.Rows[rowIndex]["COL_PHASE_NAME"] = PhaseName;
                        tagList.Rows[rowIndex]["COL_STEP_ID"] = StepID;
                        tagList.Rows[rowIndex]["COL_STEP_NAME"] = StepName;
                        tagList.Rows[rowIndex]["COL_EMPH_ID"] = EmphID;
                        tagList.Rows[rowIndex]["COL_EMPH_NAME"] = EmphName;
                        tagList.Rows[rowIndex]["COL_TIME_LOG_ID"] = TimeLogID;
                        tagList.Rows[rowIndex]["COL_TIME_LOG"] = TimeLogName;
                        tagList.Rows[rowIndex]["COL_START_DATE"] = TagStartDate.ToString("MMM-dd-yyyy HH:mm:ss");
                        tagList.Rows[rowIndex]["COL_END_DATE"] = TagEndDate.ToString("MMM-dd-yyyy HH:mm:ss");
                    }
                }


                // '//Get the list of exclusions 
                Dictionary<int, int> list = objUserSettings.TripExclusionList; // TripReportSettings.getTripExclusionList(ref objDataService, WellID);

                // '//Remove the selections of the excluded trips
                foreach (int lnTagID in list.Keys)
                {
                    for (int i = 0; i <= tagList.Rows.Count - 1; i++)
                    {
                        int tagID = Convert.ToInt32( tagList.Rows[i]["COL_PHASE_INDEX"].ToString());
                        if (tagID == lnTagID)
                        {
                            tagList.Rows[i]["COL_SELECTION"] = false;
                        }
                    }
                }
                return tagList;
            }
            catch (Exception ex)
            {

                return tagList;
            }

        }


        public Broker.BrokerResponse generateTripReport(ref VuMaxDR.Data.DataService paramObjDataService, string paramWellID, string paramUserID)
        {
            try
            {
                objDataService = new VuMaxDR.Data.DataService(paramWellID);
                objDataService = paramObjDataService;
                UserID = paramUserID;
                Initialize(paramWellID);
                WellID = paramWellID;
               
              
                Broker.BrokerResponse objResponse = objRequest.createResponseObject();


                
                var exList = new Dictionary<int, int>();
                //exList = VuMaxDR.Data.Objects.TripReportSettings.getTripExclusionList(objDataService, WellID);
                exList = objUserSettings.TripExclusionList;//Nishant PENDING checking
                if (exList == null)
                {
                    exList = new Dictionary<int, int>();
                }
                tripData = new Dictionary<int, TripInfo>();
                TripTags = new Dictionary<int, clsPhaseTag>();
                TripTypeTags = PhaseMapping.getList(objDataService, AdvKPIProfile.TRIP);
                DataTable objData = new DataTable();
                if (!objTripReportSettings.UseCustomTags)
                {
                    objData = objDataService.getTable("SELECT A.IS_OPEN,A.PHASE_INDEX,A.START_DATE,A.END_DATE,A.PHASE_ID,A.STEP_ID,A.EMPH_ID,C.PHASE_NAME,D.STEP_NAME,E.EMPH_NAME FROM VMX_PHASE_LIST A LEFT JOIN VMX_PHASE_MASTER C ON (A.PHASE_ID=C.PHASE_ID) LEFT JOIN VMX_STEP_MASTER D ON (A.PHASE_ID=D.PHASE_ID AND A.STEP_ID=D.STEP_ID) LEFT JOIN VMX_EMPH_MASTER E ON (E.PHASE_ID=A.PHASE_ID AND E.STEP_ID=A.STEP_ID AND E.EMPH_ID=A.EMPH_ID) WHERE A.WELL_ID='" + WellID + "' ORDER BY START_DATE");
                    //loadTagListDrilling();
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
                    //loadTagListCustom(ref objDataService, objTripReportSettings.TagSourceID,WellID);
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
                    //Change 1 line
                    //  Dictionary<string, TripInfo> list = objReport.calculateTripInfo(ref objDataService, Convert.ToInt32(objItem.PhaseIndex),  objItem.PhaseID, objItem.StepID, objItem.EmphID, objItem.StartDate, objItem.EndDate, objItem.phaseName, objItem.stepName, objItem.emphName);
                        Dictionary<string, TripInfo> list = calculateTripInfo(ref objDataService, Convert.ToInt32(objItem.PhaseIndex), objItem.PhaseID, objItem.StepID, objItem.EmphID, objItem.StartDate, objItem.EndDate, objItem.phaseName, objItem.stepName, objItem.emphName);

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
                objDataService = null;
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
                double sectionAvgTime = 0;
                double sectionBestTime = 0;
                double sectionDiff = 0;
                double sectionSpeedWithConn = 0;
                double sectionSpeedWOConn = 0;

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

                paramAvgTime = 0;
                double sumTime = 0;
                foreach (TripInfo objItem in paramList.Values)
                {
                    if (objItem.AvgConnTime > 0)
                    {
                        sumTime = sumTime + objItem.AvgConnTime;
                    }
                }

                if (sumTime > 0 & paramList.Count > 0)
                {
                    paramAvgTime = Math.Round(sumTime / paramList.Count, 2);
                }

                double minTime = 0;
                double maxTime = 0;
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
                if (paramBestTime == 0)
                {
                    bool halt = true;
                }

                paramDiff = objReport.objSettings.BenchmarkTime - paramAvgTime;
                double sumSpeed = 0;
                foreach (TripInfo objItem in paramList.Values)
                    sumSpeed = sumSpeed + objItem.TripSpeedWithConn;
                if (sumSpeed > 0)
                {
                    paramSpeedWithConn = Math.Round(sumSpeed / paramList.Count, 2);
                }

                sumSpeed = 0;
                foreach (TripInfo objItem in paramList.Values)
                    sumSpeed = sumSpeed + objItem.TripSpeedWOConn;
                if (sumSpeed > 0)
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
                            if (NextDrillingDate != new DateTime() & NextDrillingDate != DateTime.FromOADate(0) & PrevDrillingDate != new DateTime() & PrevDrillingDate != DateTime.FromOADate(0))
                            {
                                //long TotalSeconds = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, PrevDrillingDate, NextDrillingDate));
                                double TotalSeconds = Convert.ToInt64(Math.Abs((NextDrillingDate - PrevDrillingDate).TotalSeconds));
                                


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
                                    objTripData.OffToOnBottomTime = Math.Round(Convert.ToDouble( TotalSeconds) / 60 / 60, 2);
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
                //objDataService = paramObjDataService;
                //Initialize(paramWellID);
                generateTripReport(ref paramObjDataService, paramWellID, UserID);
                objDataService = paramObjDataService;

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
                if (Diff >= 0)
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

        //PRATH
        public Dictionary<string, TripInfo> calculateTripInfo(ref DataService objDataService, int paramTagID, string paramPhaseID, string paramStepID, string paramEmphID, DateTime paramTripStartDate, DateTime paramTripEndDate, string paramPhaseName, string paramStepName, string paramEmphName)
        {
            try
            {
                var listTripInfo = new Dictionary<string, TripInfo>();

                // '//Check if we need to split the trip in In & Out or just In or Out ...
                // '//Find the Min. Depth of the trip


                double minDepth = 0;
                var minDepthDateTime = paramTripStartDate;
                DataTable objData = objDataService.getTable("SELECT TOP 1 DEPTH,DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + paramTripStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramTripEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DEPTH");
                if (objData.Rows.Count > 0)
                {
                    minDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));
                    minDepthDateTime =Convert.ToDateTime( DataService.checkNull(objData.Rows[0]["DATETIME"], new DateTime()));
                }

                double TripEndingDepth = 0;
                DateTime TripEndingDateTime;

                // '//We have mid point ... check if there is depth increase after the mid point
                objData = objDataService.getTable("SELECT TOP 1 DEPTH,DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + minDepthDateTime.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramTripEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DEPTH DESC");
                if (objData.Rows.Count > 0)
                {
                    TripEndingDepth =Convert.ToDouble( DataService.checkNull(objData.Rows[0]["DEPTH"], 0));
                }

                TripEndingDateTime = paramTripEndDate;
                double TripStartingDepth = 0;
                var TripStartingDateTime = paramTripStartDate;

                // '//Get the depth at start of the trip
                objData = objDataService.getTable("SELECT TOP 1 DEPTH,DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + paramTripStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramTripEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DATETIME");
                if (objData.Rows.Count > 0)
                {
                    TripStartingDepth =Convert.ToDouble( DataService.checkNull(objData.Rows[0]["DEPTH"], 0));
                }

                bool TripInFound = false;
                bool TripOutFound = false;

                // '//Now check the span of the trip
                double DEPTH_THRESHOLD = 10;
                double MidPointOnwardDepthRange = Math.Abs(TripEndingDepth - minDepth);
                double TripDepthRange = Math.Abs(TripStartingDepth - TripEndingDepth);
                double DiffPercent = MidPointOnwardDepthRange * 100 / TripDepthRange;

                // '//Check if Trip Tag is spanning towards Trip In
                if (DiffPercent >= DEPTH_THRESHOLD)
                {
                    TripInFound = true;
                }

                double StartToMidDepthRange = Math.Abs(TripStartingDepth - minDepth);
                DiffPercent = StartToMidDepthRange * 100 / TripDepthRange;
                if (DiffPercent >= DEPTH_THRESHOLD)
                {
                    TripOutFound = true;
                }

                DateTime dataStartDate;
                DateTime dataEndDate;

                // '//Deliver the list according to Trip Type.. Saggrigate the data based on Trip Directions

                // '//(1) Trip  Out
                if (TripOutFound)
                {
                    if (TripInFound)
                    {
                        dataStartDate = TripStartingDateTime;
                        dataEndDate = minDepthDateTime;
                    }
                    else
                    {
                        dataStartDate = TripStartingDateTime;
                        dataEndDate = TripEndingDateTime;
                    }

                    // '//****************** Get the info for Trip Out **********************************//
                    var objTripInfo = new TripInfo();
                    objTripInfo.TripIndexID = paramTagID;
                    objTripInfo.Direction = TripInfo.tripDirection.TripOut;
                    objTripInfo.EntryID = Util.getObjectID();
                    objTripInfo.PhaseID = paramPhaseID;
                    objTripInfo.StepID = paramStepID;
                    objTripInfo.EmphID = paramEmphID;
                    objTripInfo.PhaseName = paramPhaseName;
                    objTripInfo.StepName = paramStepName;
                    objTripInfo.EmphName = paramEmphName;
                    objTripInfo.TripStartDate = dataStartDate;
                    objTripInfo.TripEndDate = dataEndDate;
                    //objTripInfo.TotalTripTime = Math.Round(Math.Abs( DateAndTime.DateDiff(DateInterval.Second, dataStartDate, dataEndDate) / 60 / 60), 2);
                    objTripInfo.TotalTripTime = Math.Round(Math.Abs(((dataEndDate - dataStartDate).TotalSeconds / 60) / 60), 2);
                   

                    double TimeOnSurface = calcSurfaceTime(ref objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate);
                    objTripInfo.TimeOnSurface = Math.Round(TimeOnSurface / 60 / 60, 2);
                    if (TripInFound)
                    {

                        // 'prath Ticket 486
                        // objTripInfo.TripSpeedWithConn = calcTripSpeedWithConnections(objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate)
                        objTripInfo.TripSpeedWithConn = calcTripSpeedWithConnections(ref objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 1);
                        // '-------------------
                        objTripInfo.TripSpeedWOConn = calcTripSpeedWithoutConnections(objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 0);
                    }
                    else
                    {
                        // 'prath Ticket 486
                        // objTripInfo.TripSpeedWithConn = calcTripSpeedWithConnections(objDataService, objTimeLog.__dataTableName, paramTripStartDate, paramTripEndDate)
                        objTripInfo.TripSpeedWithConn = calcTripSpeedWithConnections(ref objDataService, objTimeLog.__dataTableName, paramTripStartDate, paramTripEndDate, 0);
                        // '-----------
                        objTripInfo.TripSpeedWOConn = calcTripSpeedWithoutConnections(objDataService, objTimeLog.__dataTableName, paramTripStartDate, paramTripEndDate, 0);
                    }


                    // If TripInFound Then

                    // objTripInfo.TripSpeedWithConn = calcTripSpeedWithConnections(objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate)
                    // objTripInfo.TripSpeedWOConn = calcTripSpeedWithoutConnections(objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 0)

                    // Else

                    // objTripInfo.TripSpeedWithConn = calcTripSpeedWithConnections(objDataService, objTimeLog.__dataTableName, paramTripStartDate, paramTripEndDate)
                    // objTripInfo.TripSpeedWOConn = calcTripSpeedWithoutConnections(objDataService, objTimeLog.__dataTableName, paramTripStartDate, paramTripEndDate, 0)


                    // End If


                    objTripInfo.AvgConnTime = calculateAvgTripConnTime(ref objDataService, dataStartDate, dataEndDate);
                    objTripInfo.AvgDayTime = calculateAvgTripConnTimeDayNight(ref objDataService, dataStartDate, dataEndDate, 0);
                    objTripInfo.AvgNightTime = calculateAvgTripConnTimeDayNight(ref objDataService, dataStartDate, dataEndDate, 1);
                    objTripInfo.TargetTime = objTripReportSettings.BenchmarkTime;
                    objTripInfo.DeltaTargetTime = objTripInfo.TargetTime - objTripInfo.AvgConnTime;
                    objTripInfo.DeltaSpeedWConn = objTripReportSettings.BenchmarkSpeedWithConn - objTripInfo.TripSpeedWithConn;
                    objTripInfo.DeltaSpeedWOConn = objTripReportSettings.BenchmarkSpeedWOConn - objTripInfo.TripSpeedWOConn;
                    objTripInfo.ConnectionCount = getNoOfConnections(ref objDataService, dataStartDate, dataEndDate);
                    objTripInfo.HoleDepth = getTripHoleDepth(ref objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate);
                    calculateContTripSpeedWithConnection(ref objDataService,ref objTripInfo.ContTripSpeedWithConn, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 0);
                    calculateContTripSpeedWOConnection(ref objDataService,ref  objTripInfo.ContTripSpeedWOConn, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 1);
                    calculateContTripSpeedWithConnection100(ref objDataService, ref objTripInfo.ContTripSpeedWithConn100, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 0);
                    calculateContTripSpeedWOConnection100(ref objDataService, ref objTripInfo.ContTripSpeedWOConn100, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 1);



                    // '****** Calculate Avg. Trip speeds *****************************************************
                    // Dim sum As Double = 0

                    // For Each objItem As ContTripSpeedInfo In objTripInfo.ContTripSpeedWithConn100.Values

                    // sum = sum + objItem.Speed

                    // Next

                    // If sum > 0 And objTripInfo.ContTripSpeedWithConn100.Count > 0 Then

                    // objTripInfo.TripSpeedWithConn = Math.Round(sum / objTripInfo.ContTripSpeedWithConn100.Count, 2)

                    // End If


                    // sum = 0

                    // For Each objItem As ContTripSpeedInfo In objTripInfo.ContTripSpeedWOConn100.Values

                    // sum = sum + objItem.Speed

                    // Next

                    // If sum > 0 And objTripInfo.ContTripSpeedWOConn100.Count > 0 Then

                    // objTripInfo.TripSpeedWOConn = Math.Round(sum / objTripInfo.ContTripSpeedWOConn100.Count, 2)

                    // End If
                    // '***************************************************************************************



                    // '//******************************************************************************//

                    listTripInfo.Add(objTripInfo.EntryID, objTripInfo);
                }




                // '//(2) Trip In
                if (TripInFound)
                {
                    if (TripOutFound)
                    {
                        dataStartDate = minDepthDateTime;
                    }
                    else
                    {
                        dataStartDate = TripStartingDateTime;
                    }

                    dataEndDate = TripEndingDateTime;


                    // '//******************* Get the infor for Trip In *********************************//
                    var objTripInfo = new TripInfo();
                    objTripInfo.TripIndexID = paramTagID;
                    objTripInfo.Direction = TripInfo.tripDirection.TripIn;
                    objTripInfo.EntryID = Util.getObjectID();
                    objTripInfo.PhaseID = paramPhaseID;
                    objTripInfo.StepID = paramStepID;
                    objTripInfo.EmphID = paramEmphID;
                    objTripInfo.PhaseName = paramPhaseName;
                    objTripInfo.StepName = paramStepName;
                    objTripInfo.EmphName = paramEmphName;
                    objTripInfo.TripStartDate = dataStartDate;
                    objTripInfo.TripEndDate = dataEndDate;
                    //objTripInfo.TotalTripTime = Math.Round(Math.Abs(DateAndTime.DateDiff(DateInterval.Second, dataStartDate, dataEndDate) / 60 / 60), 2);
                    objTripInfo.TotalTripTime = Math.Round(Math.Abs((dataEndDate-dataStartDate).TotalSeconds / 60 / 60), 2);

                    double TimeOnSurface = calcSurfaceTime(ref objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate);
                    objTripInfo.TimeOnSurface = Math.Round(TimeOnSurface / 60 / 60, 2);
                    if (TripOutFound)
                    {
                        objTripInfo.TripSpeedWithConn = calcTripSpeedWithConnections(ref objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 0);
                        objTripInfo.TripSpeedWOConn = calcTripSpeedWithoutConnections(objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 1);
                    }
                    else
                    {
                        objTripInfo.TripSpeedWithConn = calcTripSpeedWithConnections(ref objDataService, objTimeLog.__dataTableName, paramTripStartDate, paramTripEndDate, 1);
                        objTripInfo.TripSpeedWOConn = calcTripSpeedWithoutConnections(objDataService, objTimeLog.__dataTableName, paramTripStartDate, paramTripEndDate, 1);
                    }

                    objTripInfo.AvgConnTime = calculateAvgTripConnTime(ref objDataService, dataStartDate, dataEndDate);
                    objTripInfo.AvgDayTime = calculateAvgTripConnTimeDayNight(ref objDataService, dataStartDate, dataEndDate, 0);
                    objTripInfo.AvgNightTime = calculateAvgTripConnTimeDayNight(ref objDataService, dataStartDate, dataEndDate, 1);
                    objTripInfo.TargetTime = objTripReportSettings.BenchmarkTime;
                    objTripInfo.DeltaTargetTime = objTripInfo.TargetTime - objTripInfo.AvgConnTime;
                    objTripInfo.DeltaSpeedWConn = objTripReportSettings.BenchmarkSpeedWithConn - objTripInfo.TripSpeedWithConn;
                    objTripInfo.DeltaSpeedWOConn = objTripReportSettings.BenchmarkSpeedWOConn - objTripInfo.TripSpeedWOConn;
                    objTripInfo.ConnectionCount = getNoOfConnections(ref objDataService, dataStartDate, dataEndDate);
                    objTripInfo.HoleDepth = getTripHoleDepth(ref objDataService, objTimeLog.__dataTableName, dataStartDate, dataEndDate);
                    calculateContTripSpeedWithConnection(ref objDataService,ref objTripInfo.ContTripSpeedWithConn, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 1);
                    calculateContTripSpeedWOConnection(ref objDataService,ref objTripInfo.ContTripSpeedWOConn, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 0);
                    calculateContTripSpeedWithConnection100(ref objDataService,ref objTripInfo.ContTripSpeedWithConn100, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 1);
                    calculateContTripSpeedWOConnection100(ref objDataService,ref objTripInfo.ContTripSpeedWOConn100, objTimeLog.__dataTableName, dataStartDate, dataEndDate, 0);


                    // '****** Calculate Avg. Trip speeds *****************************************************
                    // Dim sum As Double = 0

                    // For Each objItem As ContTripSpeedInfo In objTripInfo.ContTripSpeedWithConn100.Values

                    // sum = sum + objItem.Speed

                    // Next

                    // If sum > 0 And objTripInfo.ContTripSpeedWithConn100.Count > 0 Then

                    // objTripInfo.TripSpeedWithConn = Math.Round(sum / objTripInfo.ContTripSpeedWithConn100.Count, 2)

                    // End If


                    // sum = 0

                    // For Each objItem As ContTripSpeedInfo In objTripInfo.ContTripSpeedWOConn100.Values

                    // sum = sum + objItem.Speed

                    // Next

                    // If sum > 0 And objTripInfo.ContTripSpeedWOConn100.Count > 0 Then

                    // objTripInfo.TripSpeedWOConn = Math.Round(sum / objTripInfo.ContTripSpeedWOConn100.Count, 2)

                    // End If
                    // '***************************************************************************************



                    // '//******************************************************************************//

                    listTripInfo.Add(objTripInfo.EntryID, objTripInfo);
                }

                return listTripInfo;
            }
            catch (Exception ex)
            {
                return new Dictionary<string, TripInfo>();
            }
        }

        private double calcSurfaceTime(ref DataService objDataService, string dataTableName, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                double minDepth = 0;
                string strSQL = "";

                           // 'Use Set Depth to Set Depth instead of window ...
                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DEPTH>=" + "0" + " AND DEPTH<=" + objTripReportSettings.SurfaceDepthInterval.ToString() + " AND DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'";


                double surfaceTime =Convert.ToDouble(objDataService.getValueFromDatabase(strSQL));

                return surfaceTime;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        private double calcTripSpeedWithConnections(ref DataService objDataService, string dataTableName, DateTime paramFromDate, DateTime paramToDate, int paramDirection)
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
                    minDepth =Convert.ToDouble( DataService.checkNull(objData.Rows[0]["MIN_DEPTH"], 0));
                    maxDepth =Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MAX_DEPTH"], 0));
                }

                TotalFootage = maxDepth - minDepth;

                if (TotalFootage > 0)
                {
                }
                else
                    // 'No depth movement ... return zero ...
                    return 0;


                double hkldCutOff = 0;
                double pumpCutOff = 0;

                // 'Check if fill up time is removed ...
                if (objTripReportSettings.RemoveFillupTime)
                {
                    DataTable objRigStateSetup = objDataService.getTable("SELECT HOOKLOAD_CUTOFF,PUMP_PRESSURE_CUTOFF FROM VMX_WELL_RIGSTATE_SETUP WHERE WELL_ID='" + objTimeLog.WellID + "'");

                    if (objRigStateSetup.Rows.Count > 0)
                    {
                        hkldCutOff =Convert.ToDouble( DataService.checkNull(objRigStateSetup.Rows[0]["HOOKLOAD_CUTOFF"], 0));
                        pumpCutOff =Convert.ToDouble( DataService.checkNull(objRigStateSetup.Rows[0]["PUMP_PRESSURE_CUTOFF"], 0));
                    }
                }

                DateTime lnFromDate = paramFromDate;
                DateTime lnToDate = paramToDate;

                //double TotalRigStateTime = Math.Abs(DateTime.DateDiff(DateInterval.Second, lnFromDate, lnToDate));
                int TotalRigStateTime =Convert.ToInt32(Math.Abs((lnToDate - lnFromDate).TotalSeconds));


                // 'prath added Ticket 486
                if (paramDirection == 1)
                {
                    // 'trip in

                    if (objTripReportSettings.IncludePipeMovement)
                        strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (2,6,27) ";
                    else
                        strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (2,6) ";
                }
                else
                    // 'trip out
                    if (objTripReportSettings.IncludePipeMovement)
                    strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (2,10,27) ";
                else
                    strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (2,10) ";
                // '------------
                var Condition = "";


                if (objTripReportSettings.RemoveFillupTime & hkldCutOff > 0)
                {
                    Condition = " AND HKLD<" + hkldCutOff.ToString() + " AND SPPA<=" + pumpCutOff.ToString();
                    strSQL += Condition;
                }

                objData = objDataService.getTable(strSQL);

                int TotalTripInTime =Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SUMTIME"], 0));

                TimeSpan objTimeSpan1 = new TimeSpan(0, 0, TotalRigStateTime);
                TimeSpan objTimeSpan2 = new TimeSpan(0, 0, TotalTripInTime);

                double TripPercent = Math.Round(Convert.ToDouble((TotalTripInTime * 100)) / TotalRigStateTime, 2);

                double TripSpeed = 0;

                if (TotalTripInTime > 0 & TotalFootage > 0)
                {
                    // 'Continue ...
                    TripSpeed = Math.Round((TotalFootage / ( (Convert.ToDouble(TotalTripInTime) / 60) / 60)), 2);

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

        private double calcTripSpeedWithoutConnections(DataService objDataService, string dataTableName, DateTime paramFromDate, DateTime paramToDate, int paramDirection)
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
                // 'Continue processing ...
                else
                {
                    // 'No depth movement ... return zero ...
                    return 0;
                }

                var lnFromDate = paramFromDate;
                var lnToDate = paramToDate;
                //double TotalRigStateTime = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, lnFromDate, lnToDate));
                double TotalRigStateTime = Math.Abs((lnToDate - lnFromDate).TotalSeconds);
                if (paramDirection == 1)
                {
                    strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (6,4) ";
                }
                else
                {
                    strSQL = "SELECT SUM(TIME_DURATION) AS SUMTIME FROM " + dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (8,10) ";
                }

                objData = objDataService.getTable(strSQL);
                double TotalTripInTime =Convert.ToDouble(DataService.checkNull(objData.Rows[0]["SUMTIME"], 0));
                var objTimeSpan1 = new TimeSpan(0, 0, (int)Math.Round(TotalRigStateTime));
                var objTimeSpan2 = new TimeSpan(0, 0, (int)Math.Round(TotalTripInTime));
                double TripPercent = Math.Round(TotalTripInTime * 100 / TotalRigStateTime, 2);
                double TripSpeed = 0;
                if (TotalTripInTime > 0 & TotalFootage > 0)
                {
                    // 'Continue ...
                    TripSpeed = Math.Round(TotalFootage / (TotalTripInTime / 60 / 60), 2);
                    return TripSpeed;
                }
                else
                {
                    return 0;
                }
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        private double calculateAvgTripConnTime(ref DataService objDataService, DateTime fromDate, DateTime toDate)
        {
            try
            {
                double MaxTime = 5d;
                double MinTime = 1d;


                // 'Fetch all the connection that falls into this date range ...

                var _exclusionList = new Dictionary<double, double>();
                _exclusionList.Clear();
                DataTable objExData = objDataService.getTable("SELECT * FROM VMX_TRIP_CONN_INFO WHERE WELL_ID='" + objTimeLog.WellID + "'");
                foreach (DataRow objRow in objExData.Rows)
                {
                    double lnDepth = Math.Round(Convert.ToDouble(DataService.checkNull(objRow["DEPTH"], 0)), 2);
                    if (!_exclusionList.ContainsKey(lnDepth))
                    {
                        _exclusionList.Add(_exclusionList.Count + 1, lnDepth);
                    }
                }

                string strSQL = "";
                strSQL = "SELECT * FROM VMX_AKPI_TRIP_CONNECTIONS WHERE WELL_ID='" + objTimeLog.WellID + "' AND FROM_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND FROM_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'";
                DataTable objData = objDataService.getTable(strSQL);
                double connCount = 0;
                double totalConnTime = 0;
                foreach (DataRow objRow in objData.Rows)
                {
                    double lnDepth =Math.Round(Convert.ToDouble(  DataService.checkNull(objRow["DEPTH"], 0)), 2);
                    if (!_exclusionList.ContainsKey(lnDepth))
                    {
                        double lnSlipsToSlips = Convert.ToDouble(DataService.checkNull(objRow["SLIPS_TO_SLIPS"], 0));
                        double totalTime = lnSlipsToSlips;
                        double totalTimeMin = Math.Round(totalTime / 60, 2);

                        // '//Even filter the connections based on Min. and Max. Time ... taking defaults ...
                        if (totalTimeMin >= MinTime & totalTimeMin <= MaxTime)
                        {
                            totalConnTime = totalConnTime + totalTime;
                            connCount += 1d;
                        }
                    }
                }

                double AvgTime = 0;
                if (totalConnTime > 0 & connCount > 0)
                {
                    AvgTime = totalConnTime / connCount;
                    AvgTime = Math.Round(AvgTime / 60, 2); // 'Convert to minutes
                }

                return AvgTime;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }
        private double calculateAvgTripConnTimeDayNight(ref DataService objDataService, DateTime fromDate, DateTime toDate, int paramDayNight)
        {
            try
            {
                double MaxTime = 5d;
                double MinTime = 1d;


                // 'Fetch all the connection that falls into this date range ...

                var _exclusionList = new Dictionary<double, double>();
                _exclusionList.Clear();
                DataTable objExData = objDataService.getTable("SELECT * FROM VMX_TRIP_CONN_INFO WHERE WELL_ID='" + objTimeLog.WellID + "'");
                foreach (DataRow objRow in objExData.Rows)
                {
                    double lnDepth = Math.Round(Convert.ToDouble( DataService.checkNull(objRow["DEPTH"], 0)), 2);
                    if (!_exclusionList.ContainsKey(lnDepth))
                    {
                        _exclusionList.Add(_exclusionList.Count + 1, lnDepth);
                    }
                }

                string strSQL = "";
                strSQL = "SELECT * FROM VMX_AKPI_TRIP_CONNECTIONS WHERE WELL_ID='" + objTimeLog.WellID + "' AND FROM_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND FROM_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                if (paramDayNight == 0) // 'Day
                {
                    strSQL = strSQL + " AND TIME='D'";
                }
                else
                {
                    strSQL = strSQL + " AND TIME='N'";
                }

                DataTable objData = objDataService.getTable(strSQL);
                double connCount = 0;
                double totalConnTime = 0;
                foreach (DataRow objRow in objData.Rows)
                {
                    double lnDepth = Convert.ToDouble( Math.Round(Convert.ToDouble( DataService.checkNull(objRow["DEPTH"], 0)), 2));
                    if (!_exclusionList.ContainsKey(lnDepth))
                    {
                        double lnSlipsToSlips = Convert.ToDouble( DataService.checkNull(objRow["SLIPS_TO_SLIPS"], 0));
                        double totalTime = lnSlipsToSlips;
                        double totalTimeMin = Math.Round(totalTime / 60, 2);

                        // '//Even filter the connections based on Min. and Max. Time ... taking defaults ...
                        if (totalTimeMin >= MinTime & totalTimeMin <= MaxTime)
                        {
                            totalConnTime = totalConnTime + totalTime;
                            connCount += 1d;
                        }
                    }
                }

                double AvgTime = 0;
                if (totalConnTime > 0 & connCount > 0)
                {
                    AvgTime = totalConnTime / connCount;
                    AvgTime = Math.Round(AvgTime / 60, 2); // 'Convert to minutes
                }

                return AvgTime;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }


        private double getNoOfConnections(ref DataService objDataService, DateTime fromDate, DateTime toDate)
        {
            try
            {
                double MaxTime = 5;
                double MinTime = 1;
                if (objTripReportSettings.MinConnTime > 0)
                {
                    MinTime = objTripReportSettings.MinConnTime;
                }

                if (objTripReportSettings.MaxConnTime > 0)
                {
                    MaxTime = objTripReportSettings.MaxConnTime;
                }

                // 'Fetch all the connection that falls into this date range ...

                var _exclusionList = new Dictionary<double, double>();
                _exclusionList.Clear();
                DataTable objExData = objDataService.getTable("SELECT * FROM VMX_TRIP_CONN_INFO WHERE WELL_ID='" + objTimeLog.WellID + "'");
                foreach (DataRow objRow in objExData.Rows)
                {
                    double lnDepth = Math.Round(Convert.ToDouble(DataService.checkNull(objRow["DEPTH"], 0)), 2);
                    
                    if (!_exclusionList.ContainsKey(lnDepth))
                    {
                        _exclusionList.Add(_exclusionList.Count + 1, lnDepth);
                    }
                }

                string strSQL = "";
                strSQL = "SELECT * FROM VMX_AKPI_TRIP_CONNECTIONS WHERE WELL_ID='" + objTimeLog.WellID + "' AND FROM_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND FROM_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'";
                DataTable objData = objDataService.getTable(strSQL);
                double connCount = 0;
                double totalConnTime = 0;
                foreach (DataRow objRow in objData.Rows)
                {
                    double lnDepth = Math.Round(Convert.ToDouble(DataService.checkNull(objRow["DEPTH"], 0)), 2);
                    if (!_exclusionList.ContainsKey(lnDepth))
                    {
                        double lnSlipsToSlips = Convert.ToDouble( DataService.checkNull(objRow["SLIPS_TO_SLIPS"], 0));
                        double totalTime = lnSlipsToSlips;
                        double totalTimeMin = Math.Round(totalTime / 60, 2);

                        // '//Even filter the connections based on Min. and Max. Time ... taking defaults ...
                        if (totalTimeMin >= MinTime & totalTimeMin <= MaxTime)
                        {
                            totalConnTime = totalConnTime + totalTime;
                            connCount += 1d;
                        }
                    }
                }

                return connCount;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        private double getTripHoleDepth(ref DataService objDataService, string dataTableName, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                double HoleDepth = 0;
                string strSQL = "";

                // '//Find out min. depth in the trip
                strSQL = "SELECT MAX(HDTH) FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'";
                HoleDepth = Convert.ToDouble(objDataService.getValueFromDatabase(strSQL));
                return HoleDepth;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }


        private void calculateContTripSpeedWithConnection(ref DataService objDataService, ref Dictionary<int, ContTripSpeedInfo> paramSpeedInfo, string dataTableName, DateTime paramFromDate, DateTime paramToDate, int paramDirection)
        {
            try
            {
                DataTable objData = objDataService.getTable("SELECT DATETIME,DEPTH,TIME_DURATION,RIG_STATE,HKLD,SPPA FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND (RIG_STATE IS NOT NULL) ORDER BY DATETIME");
                bool startRecorded = false;
                double startDepth = 0;
                int startIndex = 0;
                double SumTime = 0;


                //Collection<string> list  = new Collection<string>();
                
                Collection<double> xData = new Collection<double>();
                Collection<double> yData = new Collection<double>();

                
                double hkldCutOff = 0;
                double pumpCutOff = 0;

                // 'Check if fill up time is removed ...
                DataTable objRigStateSetup = objDataService.getTable("SELECT HOOKLOAD_CUTOFF,PUMP_PRESSURE_CUTOFF FROM VMX_WELL_RIGSTATE_SETUP WHERE WELL_ID='" + objTimeLog.WellID + "'");
                if (objRigStateSetup.Rows.Count > 0)
                {
                    hkldCutOff =Convert.ToDouble(DataService.checkNull(objRigStateSetup.Rows[0]["HOOKLOAD_CUTOFF"], 0));
                    pumpCutOff =Convert.ToDouble(DataService.checkNull(objRigStateSetup.Rows[0]["PUMP_PRESSURE_CUTOFF"], 0));
                }

                if (paramDirection == 0)
                {
                    double lastDepth = Convert.ToDouble( DataService.checkNull(objData.Rows[0]["DEPTH"], 0));
                    for (int i = 0, loopTo = objData.Rows.Count - 1; i <= loopTo; i++)
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

                        lastDepth = lnDepth;
                        double lnTimeDuration = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                        int lnRigState = Convert.ToInt32(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        double lnHkld = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["HKLD"], 0));
                        double lnSPPA = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["SPPA"], 0));
                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);
                            if (Footage >= objTripReportSettings.DepthInterval)
                            {
                                if (objTripReportSettings.RemoveFillupTime & hkldCutOff > 0)
                                {
                                    if (lnHkld < hkldCutOff & lnSPPA <= pumpCutOff)
                                    {
                                        SumTime = SumTime + lnTimeDuration;
                                    }
                                }
                                else
                                {
                                    SumTime = SumTime + lnTimeDuration;
                                }

                                double TripSpeed = 0;
                                if (Footage >= 0 & SumTime >= 0)
                                {
                                    TripSpeed = Math.Round(Footage / (SumTime / 60 / 60), 2);
                                }

                                if (double.IsInfinity(TripSpeed))
                                {
                                    TripSpeed = 0;
                                }

                                xData.Add(TripSpeed);
                                yData.Add(lnDepth);

                                // 'startRecorded = False
                                startDepth = lnDepth;
                                startIndex = i;
                                SumTime = 0;
                            }
                            else if (objTripReportSettings.RemoveFillupTime & hkldCutOff > 0)
                            {
                                if (lnHkld < hkldCutOff & lnSPPA <= pumpCutOff)
                                {
                                    SumTime = SumTime + lnTimeDuration;
                                }
                            }
                            else
                            {
                                SumTime = SumTime + lnTimeDuration;
                            }
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

                if (paramDirection == 1)
                {
                    double lastDepth =Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));
                    for (int i = 0, loopTo1 = objData.Rows.Count - 1; i <= loopTo1; i++)
                    {
                        double lnDepth =Convert.ToDouble( DataService.checkNull(objData.Rows[i]["DEPTH"], 0));
                        if (lnDepth >= lastDepth)
                        {
                            // 'Continue ahead  with calculation ...
                            bool halt = true;
                        }
                        else
                        {
                            continue;
                        }
                      

                        double lnTimeDuration = Convert.ToDouble( DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0)) ;
                        int lnRigState =Convert.ToInt32( DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        double lnHkld = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["HKLD"], 0));
                        double lnSPPA = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["SPPA"], 0));
                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);
                            if (Footage >= objTripReportSettings.DepthInterval)
                            {
                                if (objTripReportSettings.RemoveFillupTime & hkldCutOff > 0)
                                {
                                    if (lnHkld < hkldCutOff & lnSPPA <= pumpCutOff)
                                    {
                                        SumTime = SumTime + lnTimeDuration;
                                    }
                                }
                                else
                                {
                                    SumTime = SumTime + lnTimeDuration;
                                }

                                double TripSpeed = 0;
                                if (Footage >= 0 & SumTime >= 0)
                                {
                                    TripSpeed = Math.Round(Footage / (SumTime / 60 / 60), 2);
                                }

                                if (double.IsInfinity(TripSpeed))
                                {
                                    TripSpeed = 0;
                                }

                                xData.Add(TripSpeed);
                                yData.Add(lnDepth);

                                // 'startRecorded = False
                                startDepth = lnDepth;
                                startIndex = i;
                                SumTime = 0;
                            }
                            else if (objTripReportSettings.RemoveFillupTime & hkldCutOff > 0)
                            {
                                if (lnHkld < hkldCutOff & lnSPPA <= pumpCutOff)
                                {
                                    SumTime = SumTime + lnTimeDuration;
                                }
                            }
                            else
                            {
                                SumTime = SumTime + lnTimeDuration;
                            }
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

                paramSpeedInfo = new Dictionary<int, ContTripSpeedInfo>();
                if (xData.Count > 0 & yData.Count > 0)
                {
                    for (int i = 1, loopTo2 = xData.Count; i <= loopTo2; i++)
                        paramSpeedInfo.Add(i, new ContTripSpeedInfo(yData[i], xData[i]));
                }

                bool halt3 = true;
            }
            catch (Exception ex)
            {
                bool halt = true;
            }
        }


        private void calculateContTripSpeedWOConnection(ref DataService objDataService, ref Dictionary<int, ContTripSpeedInfo> paramSpeedInfo, string dataTableName, DateTime paramFromDate, DateTime paramToDate, int paramDirection)
        {
            try
            {
                DataTable objData = objDataService.getTable("SELECT DATETIME,DEPTH,TIME_DURATION,RIG_STATE FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND (RIG_STATE IS NOT NULL) ORDER BY DATETIME");

                if (objData.Rows.Count == 0)
                    return;


                bool startRecorded = false;
                double startDepth = 0;
                int startIndex = 0;
                double SumTime = 0;

                Collection<double> xData = new Collection<double>();
                Collection<double> yData = new Collection<double>();


                if (paramDirection == 0)
                {
                    double lastDepth =Convert.ToDouble( DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                    for (int i = 0; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                        if (lnDepth >= lastDepth) { 
                            // 'Continue ahead  with calculation ...
                            bool halt = true;
                        }
                        else { 
                            continue;
                        }

                        lastDepth = lnDepth;

                        double lnTimeDuration =Convert.ToDouble(DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                        int lnRigState = Convert.ToInt32(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        DateTime dtDateTime = Convert.ToDateTime(DataService.checkNull(objData.Rows[i]["DATETIME"], ""));


                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);

                            if (Footage >= objTripReportSettings.DepthInterval)
                            {

                                // 'We also need to include the current time ...
                                if (paramDirection == 0)
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

                                xData.Add(TripSpeed);
                                yData.Add(lnDepth);

                                // 'Instead of re-initializing start tag ... re-initialize start ddepth 
                                // 'startRecorded = False
                                startDepth = lnDepth;
                                SumTime = 0;
                                startIndex = i;
                            }
                            else if (paramDirection == 0)
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




                if (paramDirection == 1)
                {
                    double lastDepth =Convert.ToDouble( DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                    for (int i = 0; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                        if (lnDepth <= lastDepth)
                        {
                        }
                        else
                            continue;


                        lastDepth = lnDepth;

                        double lnTimeDuration =Convert.ToDouble( DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                        int lnRigState = Convert.ToInt32( DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        DateTime dtDateTime =Convert.ToDateTime(DataService.checkNull(objData.Rows[i]["DATETIME"], ""));


                        if (dtDateTime >= DateTime.Parse("14-Apr-2014 05:13:30")) { 
                            bool halt = true;
                        }

                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);

                            if (Footage >= objTripReportSettings.DepthInterval)
                            {

                                // 'We also need to include the current time ...
                                if (paramDirection == 0)
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
                            else if (paramDirection == 0)
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




                paramSpeedInfo = new Dictionary<int, ContTripSpeedInfo>();

                if (xData.Count > 0 & yData.Count > 0)
                {
                    if (xData.Count > 0 & yData.Count > 0)
                    {
                        for (int i = 1; i <= xData.Count; i++)

                            paramSpeedInfo.Add(i, new ContTripSpeedInfo(yData[i], xData[i]));
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }

        private void calculateContTripSpeedWithConnection100(ref DataService objDataService, ref Dictionary<int, ContTripSpeedInfo> paramSpeedInfo, string dataTableName, DateTime paramFromDate, DateTime paramToDate, int paramDirection)
        {
            try
            {
                DataTable objData = objDataService.getTable("SELECT DATETIME,DEPTH,TIME_DURATION,RIG_STATE,HKLD,SPPA FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND (RIG_STATE IS NOT NULL) ORDER BY DATETIME");

                bool startRecorded = false;
                double startDepth = 0;
                int startIndex = 0;
                double SumTime = 0;

                Collection<double> xData = new Collection< double >();
                Collection<double> yData = new Collection< double >();


                double hkldCutOff = 0;
                double pumpCutOff = 0;

                // 'Check if fill up time is removed ...
                DataTable objRigStateSetup = objDataService.getTable("SELECT HOOKLOAD_CUTOFF,PUMP_PRESSURE_CUTOFF FROM VMX_WELL_RIGSTATE_SETUP WHERE WELL_ID='" + objTimeLog.WellID + "'");

                if (objRigStateSetup.Rows.Count > 0)
                {
                    hkldCutOff = Convert.ToDouble( DataService.checkNull(objRigStateSetup.Rows[0]["HOOKLOAD_CUTOFF"], 0));
                    pumpCutOff = Convert.ToDouble(DataService.checkNull(objRigStateSetup.Rows[0]["PUMP_PRESSURE_CUTOFF"], 0));
                }


                if (paramDirection == 0)
                {
                    double lastDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                    for (int i = 0; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                        if (lnDepth <= lastDepth) {
                            // 'Continue ahead  with calculation ...
                            bool halt = true;
                        }
                        else {
                            continue;
                        }

                        lastDepth = lnDepth;

                        double lnTimeDuration = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                        int lnRigState = Convert.ToInt32(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        double lnHkld = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["HKLD"], 0));
                        double lnSPPA = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["SPPA"], 0));


                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);

                            if (Footage >= 100)
                            {
                                if (objTripReportSettings.RemoveFillupTime & hkldCutOff > 0)
                                {
                                    if (lnHkld < hkldCutOff & lnSPPA <= pumpCutOff)
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
                            else if (objTripReportSettings.RemoveFillupTime & hkldCutOff > 0)
                            {
                                if (lnHkld < hkldCutOff & lnSPPA <= pumpCutOff)
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


                if (paramDirection == 1)
                {
                    double lastDepth =Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                    for (int i = 0; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                        if (lnDepth >= lastDepth) {
                            // 'Continue ahead  with calculation ...
                            bool halt = true; }
                        else {
                            continue;
                        }
                        double lnTimeDuration = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                        int lnRigState = Convert.ToInt32(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        double lnHkld = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["HKLD"], 0));
                        double lnSPPA = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["SPPA"], 0));


                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);

                            if (Footage >= 100)
                            {
                                if (objTripReportSettings.RemoveFillupTime & hkldCutOff > 0)
                                {
                                    if (lnHkld < hkldCutOff & lnSPPA <= pumpCutOff)
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
                            else if (objTripReportSettings.RemoveFillupTime & hkldCutOff > 0)
                            {
                                if (lnHkld < hkldCutOff & lnSPPA <= pumpCutOff)
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




                paramSpeedInfo = new Dictionary<int, ContTripSpeedInfo>();

                if (xData.Count > 0 & yData.Count > 0)
                {
                    for (int i = 1; i <= xData.Count; i++)

                        paramSpeedInfo.Add(i, new ContTripSpeedInfo(yData[i], xData[i]));
                }


                bool halt3 = true;
            }
            catch (Exception ex)
            {
                bool halt = true;
            }
        }

        private void calculateContTripSpeedWOConnection100(ref DataService objDataService, ref Dictionary<int, ContTripSpeedInfo> paramSpeedInfo, string dataTableName, DateTime paramFromDate, DateTime paramToDate, int paramDirection)
        {
            try
            {
                DataTable objData = objDataService.getTable("SELECT DATETIME,DEPTH,TIME_DURATION,RIG_STATE FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND (RIG_STATE IS NOT NULL) ORDER BY DATETIME");

                if (objData.Rows.Count == 0)
                    return;


                bool startRecorded = false;
                double startDepth = 0;
                int startIndex = 0;
                double SumTime = 0;

                Collection<double> xData = new Collection<double>();
                Collection<double> yData = new Collection<double>();


                if (paramDirection == 0)
                {
                    double lastDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DEPTH"], 0));

                    for (int i = 0; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                        if (lnDepth >= lastDepth) {
                            // 'Continue ahead  with calculation ...
                            bool halt = true; }
                        else {
                            continue;
                        }

                        lastDepth = lnDepth;

                        double lnTimeDuration = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                        int lnRigState = Convert.ToInt32(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        DateTime dtDateTime = Convert.ToDateTime( DataService.checkNull(objData.Rows[i]["DATETIME"], ""));


                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);

                            if (Footage >= 100)
                            {

                                // 'We also need to include the current time ...
                                if (paramDirection == 0)
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

                                xData.Add(TripSpeed);
                                yData.Add(lnDepth);

                                // 'Instead of re-initializing start tag ... re-initialize start ddepth 
                                // 'startRecorded = False
                                startDepth = lnDepth;
                                SumTime = 0;
                                startIndex = i;
                            }
                            else if (paramDirection == 0)
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




                if (paramDirection == 1)
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
                        int lnRigState = Convert.ToInt32(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                        DateTime dtDateTime = Convert.ToDateTime(DataService.checkNull(objData.Rows[i]["DATETIME"], ""));


                        if (dtDateTime >= DateTime.Parse("14-Apr-2014 05:13:30")) { 
                            bool halt = true;
                        }
                        if (startRecorded)
                        {
                            double Footage = Math.Abs(lnDepth - startDepth);

                            if (Footage >= 100)
                            {

                                // 'We also need to include the current time ...
                                if (paramDirection == 0)
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
                            else if (paramDirection == 0)
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




                paramSpeedInfo = new Dictionary<int, ContTripSpeedInfo>();

                if (xData.Count > 0 & yData.Count > 0)
                {
                    if (xData.Count > 0 & yData.Count > 0)
                    {
                        for (int i = 1; i <= xData.Count; i++)

                            paramSpeedInfo.Add(i, new ContTripSpeedInfo(yData[i], xData[i]));
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }

        //====

    }//Class
}//Namespace
