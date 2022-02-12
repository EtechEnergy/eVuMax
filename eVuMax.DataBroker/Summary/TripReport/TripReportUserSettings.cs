using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.AdvKPI;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.Summary.TripReport
{
    public class TripReportUserSettings 
    {
        
        public bool IncludePipeMovement = true;
        public bool RemoveFillupTime = false;
        public bool UseCustomTags = false;
        public double SurfaceDepthInterval = 90;
        public string TagSourceID = "";
        public double BenchmarkSpeedWOConn = 0;
        public double BenchmarkSpeedWithConn = 0;
        public double BenchmarkTime = 0;
        public double MaxConnTime = 5;
        public double MinConnTime = 1;
        public double DepthInterval = 1000;

        public string WellID = "";
        public string UserID = "";
        private string PlotID = "TRIPREPORT";
        
        [NonSerialized]
        public DataService objDataService;
        
        public string Warnings = "";
        public Dictionary<Int32, Int32> TripExclusionList = new Dictionary<Int32, Int32>();
        public Dictionary<int, PlotAxisScale> objPlotScaleList = new Dictionary<int, PlotAxisScale>();


        //public string[] TripExclusionListStr; 



        public TripReportUserSettings( ref DataService paramDataService)
        {
            objDataService = paramDataService;

        }

        public TripReportUserSettings()
        {

        }
        //public void getVuMaxSettings()
        //{
        //    TripReportSettings objVuMaxTripReportSettings = new TripReportSettings();
        //    objVuMaxTripReportSettings = getSettings(objDataService, WellID);
            
        //    MinConnTime = objVuMaxTripReportSettings.MinConnTime;
        //    IncludePipeMovement = objVuMaxTripReportSettings.IncludePipeMovement;
        //    RemoveFillupTime = objVuMaxTripReportSettings.RemoveFillupTime;
        //    UseCustomTags = objVuMaxTripReportSettings.UseCustomTags;
        //    SurfaceDepthInterval = objVuMaxTripReportSettings.SurfaceDepthInterval;
        //    TagSourceID = objVuMaxTripReportSettings.TagSourceID;
        //    BenchmarkSpeedWOConn = objVuMaxTripReportSettings.BenchmarkSpeedWOConn;
        //    BenchmarkSpeedWithConn = objVuMaxTripReportSettings.BenchmarkSpeedWithConn;
        //    BenchmarkTime = objVuMaxTripReportSettings.BenchmarkTime;
        //    MaxConnTime = objVuMaxTripReportSettings.MaxConnTime;
        //    DepthInterval = objVuMaxTripReportSettings.DepthInterval;
            
        //}

        public  void  loadSettings()
        {
            try
            {
                UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(objDataService);
                UserSettings.UserSettings objSettings = objSettingsMgr.loadUserSettings(UserID, PlotID, WellID);

                if (objSettings != null)
                {
                    TripReportUserSettings objLocalSettings =  JsonConvert.DeserializeObject<TripReportUserSettings>(objSettings.settingData);
                    MinConnTime = objLocalSettings.MinConnTime;
                    IncludePipeMovement = objLocalSettings.IncludePipeMovement;
                    RemoveFillupTime = objLocalSettings.RemoveFillupTime;
                    UseCustomTags = objLocalSettings.UseCustomTags;
                    SurfaceDepthInterval = objLocalSettings.SurfaceDepthInterval;
                    TagSourceID = objLocalSettings.TagSourceID;
                    BenchmarkSpeedWOConn = objLocalSettings.BenchmarkSpeedWOConn;
                    BenchmarkSpeedWithConn = objLocalSettings.BenchmarkSpeedWithConn;
                    BenchmarkTime = objLocalSettings.BenchmarkTime;
                    MaxConnTime = objLocalSettings.MaxConnTime;
                    DepthInterval = objLocalSettings.DepthInterval;

                    //if (objLocalSettings.TripExclusionListStr.Length > 0) //pending to check
                    //{
                    //    TripExclusionList.Clear();
                    //    foreach (string phaseIndex in objLocalSettings.TripExclusionListStr)
                    //    {
                    //        TripExclusionList.Add(Convert.ToInt32(phaseIndex), Convert.ToInt32(phaseIndex));
                    //    }
                    //}
                    TripExclusionList = objLocalSettings.TripExclusionList;
                    if (objLocalSettings.objPlotScaleList == null || objLocalSettings.objPlotScaleList.Count==0)
                    {
                        if (!objDataService.IsRecordExist("SELECT AXIS_ID FROM VMX_AXIS_SCALES WHERE WELL_ID='" + WellID + "' AND PLOT_ID='" + PlotID +"'"))
                        {
                            //// '//First check if axis customization exist ... If not then create one
                            Dictionary<string, PlotAxisScale> list = new Dictionary<string, PlotAxisScale>();

                            PlotAxisScale objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisID = "AVG_TIME1_TIME";
                            objDefaultAxis.AxisName = "Conn. Time Line Chart - Time";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(1, objDefaultAxis);


                            objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisName = "Conn. Time Line Chart - Trips";
                            objDefaultAxis.AxisID = "AVG_TIME1_TRIPS";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(2, objDefaultAxis);


                            objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisName = "Conn. Time Bar Chart - Time";
                            objDefaultAxis.AxisID = "AVG_TIME2_TIME";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(3, objDefaultAxis);

                            objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisName = "Conn. Time Bar Chart - Trips";
                            objDefaultAxis.AxisID = "AVG_TIME2_TRIPS";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(4, objDefaultAxis);

                            

                            objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisName = "Speed with Conn. - Depth";
                            objDefaultAxis.AxisID = "CONT_WITH_DEPTH";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(5, objDefaultAxis);

                            

                            objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisName = "Speed with Conn. - Speed";
                            objDefaultAxis.AxisID = "CONT_WITH_SPEED";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(6, objDefaultAxis);
                            


                            objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisName = "Speed w/o Conn. - Depth";
                            objDefaultAxis.AxisID = "CONT_WO_DEPTH";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(7, objDefaultAxis);


                            objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisName = "Speed w/o Conn. - Speed";
                            objDefaultAxis.AxisID = "CONT_WO_SPEED";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(8, objDefaultAxis);




                            objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisName = "Single Trip - Depth";
                            objDefaultAxis.AxisID = "ST_CONT_DEPTH";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(9, objDefaultAxis);

                            


                            objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisName = "Single Trip - Speed";
                            objDefaultAxis.AxisID = "ST_CONT_SPEED";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(10, objDefaultAxis);


                            objDefaultAxis = new PlotAxisScale();
                            objDefaultAxis.PlotID = PlotID;
                            objDefaultAxis.AxisName = "Single Trip - Conn. Time";
                            objDefaultAxis.AxisID = "ST_CONN_TIME";
                            objDefaultAxis.AutoScale = true;
                            objDefaultAxis.MinValue = 0;
                            objDefaultAxis.MaxValue = 0;
                            objDefaultAxis.Inverted = false;
                            objPlotScaleList.Add(11, objDefaultAxis);

                            
                        }

                        DataTable objData = objDataService.getTable("SELECT * FROM VMX_AXIS_SCALES WHERE WELL_ID='" + WellID + "' AND PLOT_ID='" + PlotID+"'");

                        if (objData.Rows.Count > 0)
                        {
                            int counter = 1;
                            foreach (DataRow objRow in objData.Rows)
                            {
                                PlotAxisScale objAxisScale = new PlotAxisScale();

                                objAxisScale.AxisID = DataService.checkNull(objRow["AXIS_ID"],"").ToString();
                                objAxisScale.AutoScale = Convert.ToBoolean(Global.Iif(Convert.ToInt32(objRow["AUTO_SCALE"]) == 1, true, false));
                                objAxisScale.MinValue = Convert.ToDouble(DataService.checkNull(objRow["MIN_VALUE"], 0));
                                objAxisScale.MaxValue = Convert.ToDouble(DataService.checkNull(objRow["MAX_VALUE"], 0));
                                objAxisScale.Inverted = Convert.ToBoolean(Global.Iif(Convert.ToInt32(objRow["INVERTED"]) == 1, true, false));
                                objAxisScale.PlotID = PlotID;
                                objAxisScale.AxisName = getScaleName(objAxisScale.AxisID);
                                objPlotScaleList.Add(counter, objAxisScale);
                                counter++;

                            }
                        }
                    }
                    else
                    {
                        objPlotScaleList = objLocalSettings.objPlotScaleList;
                    }
                }
                else
                {
                    //Pending
                }
                

                
            }
            catch (Exception ex)
            {
                Warnings += ex.Message + ex.StackTrace;

            }
        }

        public string getScaleName(string paramAxisID)
        {
            try
            {
                string ScaleName = "";

                switch (paramAxisID)
                {
                    case "AVG_TIME1_TIME":
                        ScaleName = "Conn. Time Line Chart - Time";
                        break;
                    case "AVG_TIME1_TRIPS":
                        ScaleName = "Conn. Time Line Chart - Trips";
                        break;
                    case "AVG_TIME2_TIME":
                        ScaleName = "Conn. Time Bar Chart - Time";
                        break;
                    case "AVG_TIME2_TRIPS":
                        ScaleName = "Conn. Time Bar Chart - Trips";
                        break;
                    case "CONT_WITH_DEPTH":
                        ScaleName = "Speed with Conn. - Depth";
                        break;
                    case "CONT_WITH_SPEED":
                        ScaleName = "Speed with Conn. - Speed";
                        break;
                    case "CONT_WO_DEPTH":
                        ScaleName = "Speed w/o Conn. - Depth";
                        break;
                    case "CONT_WO_SPEED":
                        ScaleName = "Speed w/o Conn. - Speed";
                        break;
                 
                    
                    
                    
                    case "ST_CONN_TIME":
                        ScaleName = "Single Trip - Conn. Time";
                        break;


                    case "ST_CONT_DEPTH":
                        ScaleName = "Single Trip - Depth";
                        break;
                    case "ST_CONT_SPEED":
                        ScaleName = "Single Trip - Speed";
                        break;
                    default:
                        ScaleName = "undefined";
                        break;
                }

                return ScaleName;
            }
            catch (Exception ex)
            {

                return "Error";
            }
        }

        //public void copySettingsToVuMaxTripReportSettings(ref VuMaxDR.Data.Objects.TripReportSettings objTripReportSettings)
        public void overWriteTripReportSettingsWithUserSettings(ref VuMaxDR.Data.Objects.TripReportSettings objTripReportSettings)
        {
            try
            {
                objTripReportSettings.MinConnTime = MinConnTime;
                objTripReportSettings.IncludePipeMovement = IncludePipeMovement;
                objTripReportSettings.RemoveFillupTime = RemoveFillupTime;
                objTripReportSettings.UseCustomTags= UseCustomTags;
                objTripReportSettings.SurfaceDepthInterval= SurfaceDepthInterval;
                objTripReportSettings.TagSourceID= TagSourceID;
                objTripReportSettings.BenchmarkSpeedWOConn = BenchmarkSpeedWOConn;
                objTripReportSettings.BenchmarkSpeedWithConn= BenchmarkSpeedWithConn;
                objTripReportSettings.BenchmarkTime= BenchmarkTime;
                objTripReportSettings.MaxConnTime= MaxConnTime;
                objTripReportSettings.DepthInterval= DepthInterval;
                
                
            }
            catch (Exception ex)
            {

            }
        }
        public bool saveUserSettings()
        {
            try
            {
                UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(objDataService);
                UserSettings.UserSettings objUserSettings = new UserSettings.UserSettings();
                objUserSettings.SettingsId = PlotID;
                objUserSettings.WellId = WellID;
                objUserSettings.UserId = UserID;

                objDataService = null;
                objUserSettings.settingData = JsonConvert.SerializeObject(this);
                objSettingsMgr.saveUserSettings(objUserSettings);

                return true;

            }
            catch (Exception ex)
            {

                Warnings += ex.Message + ex.StackTrace;
                return false;
            }
        }



        public static DataTable loadTagListCustom(ref DataService paramObjDataService, TripReportUserSettings objUserSetting)
        {
            try
            {

                string paramTagSourceID = objUserSetting.TagSourceID;
                string paramWellID = objUserSetting.WellID;

                DataTable tagList = new DataTable();

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


                VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
                objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref paramObjDataService, paramWellID);

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
                strSQL += " WHERE A.WELL_ID='" + paramWellID + "' AND A.SOURCE_ID='" + sourceID + "' ORDER BY START_DATE ";
                DataTable objData = paramObjDataService.getTable(strSQL);
                foreach (DataRow objRow in objData.Rows)
                {
                    string PhaseID = DataService.checkNull(objRow["CATEGORY_ID"], "").ToString();
                    string PhaseName = DataService.checkNull(objRow["CATEGORY_NAME"], "").ToString();
                    string StepID = DataService.checkNull(objRow["SUB_CATEGORY_ID"], "").ToString();
                    string StepName = DataService.checkNull(objRow["SUB_CATEGORY_NAME"], "").ToString();
                    string EmphID = DataService.checkNull(objRow["ACTIVITY_ID"], "").ToString();
                    string EmphName = DataService.checkNull(objRow["ACTIVITY_NAME"], "").ToString();
                    double PhaseIndex = Convert.ToInt32(DataService.checkNull(objRow["TAG_INDEX"], 0));
                    DateTime TagStartDate = Convert.ToDateTime(DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    DateTime TagEndDate = Convert.ToDateTime(DataService.checkNull(objRow["END_DATE"], new DateTime()));
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
                        DateTime StartDate = Convert.ToDateTime(DataService.checkNull(objRow["START_DATE"], new DateTime()));
                        DateTime EndDate = Convert.ToDateTime(DataService.checkNull(objRow["END_DATE"], new DateTime()));
                        string TimeLogID = "";
                        string TimeLogName = "";


                        // 'Find the right time log
                        foreach (Wellbore objWellbore in objWell.wellbores.Values)
                        {
                            foreach (TimeLog objTimeLog in objWellbore.timeLogs.Values)
                            {
                                if (!objTimeLog.RemarksLog)
                                {
                                    var tStartDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramObjDataService));
                                    var tEndDate = DateTime.FromOADate(objTimeLog.getLastIndex(ref paramObjDataService));
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
                Dictionary<int, int> list = objUserSetting.TripExclusionList; // TripReportSettings.getTripExclusionList(objDataService, WellID);
                //if (objUserSetting.TripExclusionListStr != null)
                //{
                //    string[] exList = objUserSetting.TripExclusionListStr.ToString().Split('~');
                //    if (exList.Length > 0)
                //    {
                        
                //        foreach (string strPhaseIndex in objUserSetting.TripExclusionListStr)
                //        {
                //            list.Add(Convert.ToInt32(strPhaseIndex), Convert.ToInt32(strPhaseIndex));
                //        }
                //    }

                //}
                ////Dictionary<int, int> list = objUserSetting.TripExclusionList; // TripReportSettings.getTripExclusionList(objDataService, WellID);

                //if (objUserSetting.TripExclusionListStr.Length > 0) //Nishant 29-01-2022
                //{
                //    list.Clear();
                //    foreach (string strPhaseIndex in objUserSetting.TripExclusionListStr)
                //    {
                //        list.Add(Convert.ToInt32(strPhaseIndex), Convert.ToInt32(strPhaseIndex));

                //    }
                //}

                // '//Remove the selections of the excluded trips
                foreach (int lnTagID in list.Keys)
                {
                    for (int i = 0; i <= tagList.Rows.Count - 1; i++)
                    {
                        int tagID = Convert.ToInt32(tagList.Rows[i]["COL_PHASE_INDEX"].ToString());
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
                DataTable tagList = new DataTable();

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
                return tagList;
            }
        }
        public static DataTable loadTagListDrilling(ref DataService paramObjDataService, TripReportUserSettings objUserSetting)
        {
            try
            {
                string paramTagSourceID = objUserSetting.TagSourceID;
                string paramWellID = objUserSetting.WellID;
                DataTable tagList = new DataTable();

                tagList.Columns.Add("COL_SELECTION", typeof(bool));
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


                VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
                objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref paramObjDataService, paramWellID);

                tagList.Rows.Clear();
                Dictionary<int, clsPhaseTag> tripTypeTags = PhaseMapping.getList(paramObjDataService, AdvKPIProfile.TRIP);
                DataTable objData = paramObjDataService.getTable("SELECT A.PHASE_INDEX,A.START_DATE,A.END_DATE,A.PHASE_ID,A.STEP_ID,A.EMPH_ID,C.PHASE_NAME,D.STEP_NAME,E.EMPH_NAME FROM VMX_PHASE_LIST A LEFT JOIN VMX_PHASE_MASTER C ON (A.PHASE_ID=C.PHASE_ID) LEFT JOIN VMX_STEP_MASTER D ON (A.PHASE_ID=D.PHASE_ID AND A.STEP_ID=D.STEP_ID) LEFT JOIN VMX_EMPH_MASTER E ON (E.PHASE_ID=A.PHASE_ID AND E.STEP_ID=A.STEP_ID AND E.EMPH_ID=A.EMPH_ID) WHERE A.WELL_ID='" + paramWellID + "' ORDER BY START_DATE");
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
                    DateTime TagEndDate = Convert.ToDateTime(DataService.checkNull(objRow["END_DATE"], new DateTime()));
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
                        DateTime StartDate = Convert.ToDateTime(DataService.checkNull(objRow["START_DATE"], new DateTime()));
                        DateTime EndDate = Convert.ToDateTime(DataService.checkNull(objRow["END_DATE"], new DateTime()));
                        string TimeLogID = "";
                        string TimeLogName = "";


                        // 'Find the right time log
                        foreach (Wellbore objWellbore in objWell.wellbores.Values)
                        {
                            foreach (TimeLog objTimeLog in objWellbore.timeLogs.Values)
                            {
                                if (!objTimeLog.RemarksLog)
                                {
                                    var tStartDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramObjDataService));
                                    var tEndDate = DateTime.FromOADate(objTimeLog.getLastIndex(ref paramObjDataService));
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


                //// '//Get the list of exclusions 
                //Dictionary<int, int> list = objUserSetting.TripExclusionList; // TripReportSettings.getTripExclusionList(ref objDataService, WellID);

                // '//Get the list of exclusions 
                Dictionary<int, int> list = objUserSetting.TripExclusionList; // TripReportSettings.getTripExclusionList(objDataService, WellID);
                //if (objUserSetting.TripExclusionListStr != null)
                //{
                //    string[] exList = objUserSetting.TripExclusionListStr.ToString().Split('~');
                //    if (exList.Length > 0)
                //    {

                //        foreach (string strPhaseIndex in objUserSetting.TripExclusionListStr)
                //        {
                //            list.Add(Convert.ToInt32(strPhaseIndex), Convert.ToInt32(strPhaseIndex));
                //        }
                //    }

                //}


                // '//Remove the selections of the excluded trips
                foreach (int lnTagID in list.Keys)
                {
                    for (int i = 0; i <= tagList.Rows.Count - 1; i++)
                    {
                        int tagID = Convert.ToInt32(tagList.Rows[i]["COL_PHASE_INDEX"].ToString());
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

                DataTable tagList = new DataTable();

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

                return tagList;
            }

        }



    }
}
