using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using Newtonsoft.Json;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;
using VuMaxDR.AdvKPI;


namespace eVuMax.DataBroker.Summary.TripSpeed.TripAnalyzerSelection
{
    public class TripAnalyzerSelection
    {
        const string loadSelection_ = "loadSelection";
        const string saveSelection_ = "saveSelection";
        const string getDrillingTagList_ = "getDrillingTagList";
        const string getTagListCustom_ = "getTagListCustom";
            
        
        public DataTable TagSourceData { get; set; } = new DataTable();
        public DataTable grdTripTagData { get; set; } = new DataTable();

        public bool UseCustomTags { get; set; } = false;
        public double DepthInterval { get; set; } = 0;
        public TripAnalyzer.enumTripDirection TripDirection { get; set; } = TripAnalyzer.enumTripDirection.TripIn;
        public bool UseDepthRanges { get; set; } = false;
        public bool RemoveFillUpTime { get; set; } = false;
        public bool IncludePipeMovement { get; set; } = false;
        public string DepthVumaxUnitID { get; set; } = "";
        public Dictionary<int, TripDepthRange> DepthRanges { get; set; } = new Dictionary<int, TripDepthRange>();
        public string CustomTagSourceID = "";
        public Dictionary<double, double> TagSelection = new Dictionary<double, double>();
        public TripSpeedBenchMark objBenchMarks = new TripSpeedBenchMark();
//        TripAnalyzer objTripAnalyzer = new TripAnalyzer();
        public TripSpeedSettings objUserSettings = new TripSpeedSettings();

        VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
        string lastError = "";
        string wellID = "";
        
               

        public TripAnalyzerSelection()
        {
            grdTripTagData.Columns.Add("PHASE_INDEX", typeof(System.Int64));
            grdTripTagData.Columns.Add("PHASE_ID", typeof(System.String));
            grdTripTagData.Columns.Add("PHASE_NAME", typeof(System.String));
            grdTripTagData.Columns.Add("STEP_ID", typeof(System.String));
            grdTripTagData.Columns.Add("STEP_NAME", typeof(System.String));

            grdTripTagData.Columns.Add("EMPH_ID", typeof(System.String));
            grdTripTagData.Columns.Add("EMPH_NAME", typeof(System.String));

            grdTripTagData.Columns.Add("TIMELOG_ID", typeof(System.String));
            grdTripTagData.Columns.Add("TIMELOG_NAME", typeof(System.String));

            grdTripTagData.Columns.Add("START_DATE", typeof(System.String));
            grdTripTagData.Columns.Add("END_DATE", typeof(System.String));


            //Tag Source Data
            TagSourceData.Columns.Add("SOURCE_ID", typeof(System.String));
            TagSourceData.Columns.Add("SOURCE_NAME", typeof(System.String));



        }


        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Function == loadSelection_)
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = loadSelection(paramRequest);

                    return objResponse;
                }
              
                if(paramRequest.Function == getDrillingTagList_)
                {
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                    

                    
                    string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                    

                    if ( wellId == "" )
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Response = "WellId missing";
                        return objResponse;
                    }

                    wellID = wellId;
                

                    //***********

                    getDrillingTagList(paramRequest.objDataService);

                    objResponse.Response = JsonConvert.SerializeObject(grdTripTagData);

                    return objResponse;

                }

                if (paramRequest.Function == getTagListCustom_)
                {
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                    
                    
                    string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                    string CustomTagSourceID = paramRequest.Parameters.Where(x => x.ParamName.Contains("CustomTagSourceID")).FirstOrDefault().ParamValue;

                    if ( wellId == "" || CustomTagSourceID == "")
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Response = "CustomTagSourceID or WellId missing";
                        return objResponse;
                    }

                    wellID = wellId;
                    this.CustomTagSourceID = CustomTagSourceID;

                    getTagListCustom(paramRequest.objDataService);

                    objResponse.Response = JsonConvert.SerializeObject(grdTripTagData);

                    return objResponse;
                }




                //No matching function found ...
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Invalid Request Function. Use proper function name in the Broker Request";
                return objBadResponse;

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }


        public Broker.BrokerResponse performTask(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Function == saveSelection_)
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = SaveToDB(paramRequest);

                    return objResponse;
                }

              

                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                return paramRequest.createResponseObject();
            }
        }

        private Broker.BrokerResponse SaveToDB(Broker.BrokerRequest paramRequest)
        {
            try
            {
                //save to evumaxUserSettings
                //pending
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;

                string SettingsData = paramRequest.Parameters.Where(x => x.ParamName.Contains("SettingsData")).FirstOrDefault().ParamValue;

                if (UserId == "" || wellId == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Response = "UserId or WellId missing";
                    return objResponse;
                }

                this.wellID = wellId;

                UserSettings.UserSettingsMgr objMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);

                UserSettings.UserSettings objSettings = new UserSettings.UserSettings();
                objSettings.WellId = wellId;
                objSettings.UserId = UserId;
                objSettings.settingData = SettingsData;
                objSettings.SettingsId = "tripAnalyzerSelection";


                if (objMgr.saveUserSettings(objSettings))
                {
                   objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;

                }
                else
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving user settings " + objMgr.LastError;
                    return objBadResponse;

                }

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }

        }



        public Broker.BrokerResponse loadSelection(Broker.BrokerRequest paramRequest)
        {
            try
            {
                //TripAnalyzerSelection objSelection = new TripAnalyzerSelection();
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string plotID = paramRequest.Parameters.Where(x => x.ParamName.Contains("PlotID")).FirstOrDefault().ParamValue;

                if (UserId == "" || wellId == "" || plotID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Response = "UserId, PlotID or WellId missing";
                    return objResponse;
                }

                this.wellID = wellId;

                objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref paramRequest.objDataService, wellId);
                TimeLog objTimeLog = new TimeLog();

                objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLog(ref paramRequest.objDataService, wellId);

                if (objTimeLog.logCurves.ContainsKey("DEPTH"))
                {
                    if (objTimeLog.logCurves["DEPTH"].VuMaxUnitID != "")
                        DepthVumaxUnitID = objTimeLog.logCurves["DEPTH"].VuMaxUnitID;
                }

                if (objWell == null)
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Response = "well object is null";
                    return objResponse;
                }

               
                objTripAnalyzer = new TripAnalyzer(paramRequest.objDataService, wellId, UserId);
                if(plotID == "TripSpeed1")
                {

                    objUserSettings = objUserSettings.loadUserSetings(ref paramRequest.objDataService, UserId, wellID,plotID);
                    

                   TagSelection = objUserSettings.TagSelection;
                   UseDepthRanges = objUserSettings.UseDepthRanges;
                   TripDirection = (TripAnalyzer.enumTripDirection)objUserSettings.TripDirection;
                   UseCustomTags = objUserSettings.UseCustomTags;
                   CustomTagSourceID = objUserSettings.TagSourceID;
                    
                   RemoveFillUpTime = objUserSettings.RemoveFillUpTime;
                   objBenchMarks = objUserSettings.objBenchMarks;
                   
                }
                if (plotID == "TripSpeed2")
                {
                    objUserSettings = objUserSettings.loadUserSetings(ref paramRequest.objDataService, UserId, wellID, plotID);
                    TagSelection = objUserSettings.TagSelection;
                    UseDepthRanges = objUserSettings.UseDepthRanges;
                    TripDirection = (TripAnalyzer.enumTripDirection)objUserSettings.TripDirection;
                    UseCustomTags = objUserSettings.UseCustomTags;
                    CustomTagSourceID = objUserSettings.TagSourceID;
                    objBenchMarks = objUserSettings.objBenchMarks;
                    

                    RemoveFillUpTime = objUserSettings.RemoveFillUpTime;
                }


                //populate Custom tag combo Data
                TagSourceData = getTagSourceList(paramRequest.objDataService);
                //GrdData populate

                if (!UseCustomTags)
                {
                    getDrillingTagList(paramRequest.objDataService);
                }
                else
                {
                    getTagListCustom(paramRequest.objDataService);
                }
                //************



                //if (objTripAnalyzer != null)
                //{
                //    TripSpeedBenchMark objTripBenchMark = new TripSpeedBenchMark();
                //    objTripBenchMark = loadBenchMarks(wellId, paramRequest.objDataService);

                //   BenchMarkSpeedWithConnection = objTripBenchMark.TripSpeedWithConnection;
                //    BenchMarkSpeedWOConnection = objTripBenchMark.TripSpeedWOConnection;

                //    DepthInterval = objTripAnalyzer.DepthThreshold;
                //    //objSelection.DepthRanges =  //?? ??
                //   DepthVumaxUnitID = objTripAnalyzer.DepthVumaxUnitID;
                //   IncludePipeMovement = objTripAnalyzer.IncludePipeMovement;
                //   RemoveFillUpTime = objTripAnalyzer.RemoveFillUpTime;
                //    UseCustomTags = objTripAnalyzer.UseCustomTags;
                //    if (UseCustomTags)
                //    {
                //        refreshDrillingTagList(paramRequest.objDataService);
                //    }
                //    else
                //    {
                //        refreshTagListCustom(paramRequest.objDataService);
                //    }

                //    TagSourceData = getTagSourceList(paramRequest.objDataService);

                //    objResponse.RequestSuccessfull = true;
                //    objResponse.Response = JsonConvert.SerializeObject(this);
                //}


                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(this);
                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }

        }

        private TripSpeedBenchMark loadBenchMarks(string paramWellID,DataService objDataService)
        {
            try
            {
                TripSpeedBenchMark objBenckMarks = new TripSpeedBenchMark();
                Dictionary<Double, TripSpeed> speedProfile = new Dictionary<double, TripSpeed>();

                DataTable objData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_SPEED_BM WHERE WELL_ID='" + paramWellID + "'");
                if (objData.Rows.Count > 0)
                {
                   objBenckMarks.TripSpeedWOConnection = Convert.ToDouble( DataService.checkNull(objData.Rows[0]["WO_SPEED"], 0));
                  objBenckMarks. TripSpeedWithConnection = Convert.ToDouble( DataService.checkNull(objData.Rows[0]["WITH_SPEED"], 0));
                }

                speedProfile.Clear();
                objData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_SPEED_PROFILE WHERE WELL_ID='" + paramWellID + "'");
                foreach (DataRow objRow in objData.Rows)
                {
                    var objItem = new TripSpeed();
                    objItem.SrNo = Convert.ToDouble( DataService.checkNull(objRow["SR_NO"], 0));
                    objItem.Depth = Convert.ToDouble( DataService.checkNull(objRow["DEPTH"], 0));
                    objItem.SpeedWithoutConnection = Convert.ToDouble( DataService.checkNull(objRow["WO_SPEED"], 0));
                    objItem.SpeedWithConnection = Convert.ToDouble( DataService.checkNull(objRow["WITH_SPEED"], 0));
                    if (!speedProfile.ContainsKey(objItem.SrNo))
                    {
                        speedProfile.Add(objItem.SrNo, objItem);
                    }
                }
                return objBenckMarks;
            }
            catch (Exception ex)
            {

                return new TripSpeedBenchMark();
            }
        }

        private DataTable getTagSourceList(DataService objDataService)
        {
            try
            {
                
                var objData = new DataTable();
                objData = objDataService.getTable("SELECT SOURCE_ID,SOURCE_NAME FROM VMX_TAG_SOURCES ORDER BY SOURCE_NAME");
                if (objData.Rows.Count > 0)
                {
                    return objData;
                    //foreach (DataRow objrow in objData.Rows)
                    //{
                    //    string SourceID = objrow["SOURCE_ID"].ToString();
                    //    string SourceName = objrow["SOURCE_NAME"].ToString();

                    //    DataRow objNewRow = TagSourceData.NewRow();
                    //    objNewRow["SOURCE_ID"] = SourceID;
                    //    objNewRow["SOURCE_NAME"] = SourceName;
                    //    TagSourceData.Rows.Add(objNewRow);
                    //}
                }

                return objData;
            }
            catch (Exception ex)
            {
                return TagSourceData;
            }
        }

        public void getDrillingTagList(DataService objDataService )
        {
            try
            {
                grdTripTagData.Rows.Clear();
              

                // 'Display filtered list of tags ...


                Dictionary<int, clsPhaseTag> tripTypeTags = PhaseMapping.getList(objDataService, AdvKPIProfile.TRIP);
                DataTable objData = objDataService.getTable("SELECT A.IS_OPEN,A.PHASE_INDEX,A.START_DATE,A.END_DATE,A.PHASE_ID,A.STEP_ID,A.EMPH_ID,C.PHASE_NAME,D.STEP_NAME,E.EMPH_NAME FROM VMX_PHASE_LIST A LEFT JOIN VMX_PHASE_MASTER C ON (A.PHASE_ID=C.PHASE_ID) LEFT JOIN VMX_STEP_MASTER D ON (A.PHASE_ID=D.PHASE_ID AND A.STEP_ID=D.STEP_ID) LEFT JOIN VMX_EMPH_MASTER E ON (E.PHASE_ID=A.PHASE_ID AND E.STEP_ID=A.STEP_ID AND E.EMPH_ID=A.EMPH_ID) WHERE A.WELL_ID='" + wellID + "' ORDER BY START_DATE");
                foreach (DataRow objRow in objData.Rows)
                {
                    string PhaseID = DataService.checkNull(objRow["PHASE_ID"], "").ToString();
                    string PhaseName = DataService.checkNull(objRow["PHASE_NAME"], "").ToString();
                    string StepID = DataService.checkNull(objRow["STEP_ID"], "").ToString();
                    string StepName = DataService.checkNull(objRow["STEP_NAME"], "").ToString();
                    string EmphID = DataService.checkNull(objRow["EMPH_ID"], "").ToString();
                    string EmphName = DataService.checkNull(objRow["EMPH_NAME"], "").ToString();
                    double PhaseIndex = Convert.ToDouble( DataService.checkNull(objRow["PHASE_INDEX"], 0));
                    DateTime TagStartDate = Convert.ToDateTime( DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    DateTime TagEndDate = Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));

                    
                    //if (objWell.wellDateFormat == Well.wDateFormatUTC)
                    //{
                    //    TagStartDate = utilFunctionsDO.convertUTCToWellTimeZone(TagStartDate, objWell);
                    //    TagEndDate = utilFunctionsDO.convertUTCToWellTimeZone(TagEndDate, objWell);
                    //}
                    //else
                    //{
                    //    TagStartDate = utilFunctionsDO.convertLocalToWellTimeZone(TagStartDate, objWell);
                    //    TagEndDate = utilFunctionsDO.convertLocalToWellTimeZone(TagEndDate, objWell);
                    //}



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

                                    // 'Nishant Client PAE Ticket ID: 465
                                    // 'May be we can check for open tag here and if open get the lastIndexDate from timelog Ticket ID 465, Nishant
                                    // 'Shown to Nitin, Confirmed by him
                                    int isOpenTage = 0;
                                    isOpenTage = Convert.ToInt32( DataService.checkNull(objRow["IS_OPEN"], 0));
                                    if (isOpenTage == 1) // 'True
                                    {
                                        TagEndDate = DateTime.FromOADate(objTimeLog.getLastIndex(ref objDataService));
                                    }
                                    // '******************

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

                        grdTripTagData.Rows.Add();
                        
                        int rowIndex = grdTripTagData.Rows.Count - 1;
                        grdTripTagData.Rows[rowIndex]["PHASE_INDEX"] = PhaseIndex;
                        grdTripTagData.Rows[rowIndex]["PHASE_ID"] = PhaseID;
                        grdTripTagData.Rows[rowIndex]["PHASE_NAME"]= PhaseName;
                        grdTripTagData.Rows[rowIndex]["STEP_ID"] = StepID;
                        grdTripTagData.Rows[rowIndex]["STEP_NAME"] = StepName;
                        grdTripTagData.Rows[rowIndex]["EMPH_ID"] = EmphID;
                        grdTripTagData.Rows[rowIndex]["EMPH_NAME"] = EmphName;
                        grdTripTagData.Rows[rowIndex]["TIMELOG_ID"] = TimeLogID;
                        grdTripTagData.Rows[rowIndex]["TIMELOG_NAME"] = TimeLogName;
                        grdTripTagData.Rows[rowIndex]["START_DATE"] = TagStartDate.ToString("MMM-dd-yyyy HH:mm:ss");
                        grdTripTagData.Rows[rowIndex]["END_DATE"] = TagEndDate.ToString("MMM-dd-yyyy HH:mm:ss");
                    }
                }
            }
            catch (Exception ex)
            {
                
            }
        }


        public void getTagListCustom(DataService objDataService)
        {
            try
            {
                grdTripTagData.Rows.Clear();


                // 'Display filtered list of tags ...

                
                Dictionary<int, clsPhaseTag> tripTypeTags = PhaseMapping.getList(objDataService, AdvKPIProfile.TRIP);
                string strSQL = "";
                strSQL = " SELECT ";
                strSQL += " A.TAG_INDEX,A.START_DATE,A.END_DATE,A.CATEGORY_ID,A.SUB_CATEGORY_ID,A.ACTIVITY_ID,C.CATEGORY_NAME,D.SUB_CATEGORY_NAME,E.ACTIVITY_NAME ";
                strSQL += " FROM  ";
                strSQL += " VMX_CUSTOM_TAG_LIST A ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_CATEGORY_MASTER C ON (A.CATEGORY_ID=C.TAG_CATEGORY_ID AND A.SOURCE_ID=C.SOURCE_ID) ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_SUB_CATEGORY_MASTER D ON (A.CATEGORY_ID=D.TAG_CATEGORY_ID AND A.SUB_CATEGORY_ID=D.TAG_SUB_CATEGORY_ID AND A.SOURCE_ID=D.SOURCE_ID) ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_ACTIVITY_MASTER E ON (E.TAG_CATEGORY_ID=A.CATEGORY_ID AND E.TAG_SUB_CATEGORY_ID=A.SUB_CATEGORY_ID AND E.TAG_ACTIVITY_ID=A.ACTIVITY_ID AND A.SOURCE_ID=E.SOURCE_ID) ";
                strSQL += " WHERE A.WELL_ID='" + wellID + "' AND A.SOURCE_ID='" + CustomTagSourceID + "' ORDER BY START_DATE ";
                DataTable objData = objDataService.getTable(strSQL);
                foreach (DataRow objRow in objData.Rows)
                {
                    string PhaseID = DataService.checkNull(objRow["CATEGORY_ID"], "").ToString();
                    string PhaseName = DataService.checkNull(objRow["CATEGORY_NAME"], "").ToString();
                    string StepID = DataService.checkNull(objRow["SUB_CATEGORY_ID"], "").ToString();
                    string StepName = DataService.checkNull(objRow["SUB_CATEGORY_NAME"], "").ToString();
                    string EmphID = DataService.checkNull(objRow["ACTIVITY_ID"], "").ToString();
                    string EmphName = DataService.checkNull(objRow["ACTIVITY_NAME"], "").ToString();
                    double PhaseIndex =Convert.ToDouble( DataService.checkNull(objRow["TAG_INDEX"], 0));
                    DateTime TagStartDate =Convert.ToDateTime( DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    DateTime TagEndDate = Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    //if (objWell.wellDateFormat == VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                    //{
                    //    TagStartDate = utilFunctionsDO.convertUTCToWellTimeZone(TagStartDate, objWell);
                    //    TagEndDate = utilFunctionsDO.convertUTCToWellTimeZone(TagEndDate, objWell);
                    //}
                    //else
                    //{
                    //    TagStartDate = utilFunctionsDO.convertLocalToWellTimeZone(TagStartDate, objWell);
                    //    TagEndDate = utilFunctionsDO.convertLocalToWellTimeZone(TagEndDate, objWell);
                    //}



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
                        grdTripTagData.Rows.Add();

                        //grdData.Rows.Add();
                        int rowIndex = grdTripTagData.Rows.Count - 1;
                        grdTripTagData.Rows[rowIndex]["PHASE_INDEX"] = PhaseIndex;
                        grdTripTagData.Rows[rowIndex]["PHASE_ID"] = PhaseID;
                        grdTripTagData.Rows[rowIndex]["PHASE_NAME"]= PhaseName;
                        grdTripTagData.Rows[rowIndex]["STEP_ID"]= StepID;
                        grdTripTagData.Rows[rowIndex]["STEP_NAME"]= StepName;
                        grdTripTagData.Rows[rowIndex]["EMPH_ID"]= EmphID;
                        grdTripTagData.Rows[rowIndex]["EMPH_NAME"]= EmphName;
                        grdTripTagData.Rows[rowIndex]["TIMELOG_ID"]= TimeLogID;
                        grdTripTagData.Rows[rowIndex]["TIMELOG_NAME"]= TimeLogName;
                        grdTripTagData.Rows[rowIndex]["START_DATE"]= TagStartDate.ToString("MMM-dd-yyyy HH:mm:ss");
                        grdTripTagData.Rows[rowIndex]["END_DATE"]= TagEndDate.ToString("MMM-dd-yyyy HH:mm:ss");
                    }
                }
            }
            catch (Exception ex)
            {
                
            }
        }




    }//Class
}//NameSpace
