using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;
using System.Data;
using Newtonsoft.Json;
using System.Drawing;

namespace eVuMax.DataBroker.Summary.Toolface
{
    public class ToolfaceSummary
    {
        private TimeLog objTimeLog;
        private string SideTrackKey = "-999";

        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Function == "ToolfaceSummary")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = getToolfaceSummary(paramRequest);

                    return objResponse;
                }

                if (paramRequest.Function == "getUserSettings")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = getUserSettings(paramRequest);

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

                if (paramRequest.Function == "SaveUserSettings")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = saveUserSettings(paramRequest);

                    return objResponse;
                }

                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                return paramRequest.createResponseObject();
            }
        }

        private Broker.BrokerResponse getToolfaceSummary(Broker.BrokerRequest paramRequest)
        {

            string paramWarnings = "";

            try
            {

                MnemonicMappingMgr objMnemonicMgr = new MnemonicMappingMgr();
                objMnemonicMgr.loadMappings(ref paramRequest.objDataService);

                ToolfaceData objToolfaceSummary = new ToolfaceData();

                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string selectionType = paramRequest.Parameters.Where(x => x.ParamName.Contains("SelectionType")).FirstOrDefault().ParamValue.ToString();
                double fromDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDepth")).FirstOrDefault().ParamValue.ToString());
                double toDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDepth")).FirstOrDefault().ParamValue.ToString());
                DateTime fromDate = DateTime.Now;
                DateTime toDate = DateTime.Now;



                //Get the primary time log 
                objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLog(ref paramRequest.objDataService, wellId);

                bool isRealTime = false;
                int refreshHrs = 24;
                isRealTime = Convert.ToBoolean(paramRequest.Parameters.Where(x => x.ParamName.Contains("isRealTime")).FirstOrDefault().ParamValue);
                refreshHrs = Convert.ToInt32(paramRequest.Parameters.Where(x => x.ParamName.Contains("refreshHrs")).FirstOrDefault().ParamValue);

                if (isRealTime)
                {
                    selectionType = "-1";
                }

                try
                {

                    fromDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDate")).FirstOrDefault().ParamValue.ToString());
                    toDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDate")).FirstOrDefault().ParamValue.ToString());

                }
                catch (Exception)
                {


                }

                objToolfaceSummary.WellName = DataService.checkNull(paramRequest.objDataService.getValueFromDatabase("SELECT WELL_NAME FROM VMX_WELL WHERE WELL_ID='" + wellId.Replace("'", "'''") + "'"), "").ToString();


                if (selectionType == "0")
                {

                    if (objTimeLog != null)
                    {
                        fromDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, fromDate.ToOADate());
                        toDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, toDate.ToOADate());
                        selectionType = "0";
                    }
                }

                if (selectionType == "-1")
                {

                    if (objTimeLog != null)
                    {

                        DateTime minDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramRequest.objDataService));
                        DateTime maxDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref paramRequest.objDataService));

                        double secondsDiff = Math.Abs((maxDate - minDate).TotalSeconds);

                        double diff = (secondsDiff * 10) / 100;

                        minDate = maxDate.AddSeconds(-1 * diff);

                        if (isRealTime)
                        {
                            minDate = maxDate.AddHours(-refreshHrs);
                        }


                        fromDate = minDate;
                        toDate = maxDate;

                        //PRATH
                        fromDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, fromDate.ToOADate());
                        toDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, toDate.ToOADate());

                        selectionType = "0";
                    }
                }

                             

                if (selectionType == "1") // Depth Range
                {
                    getDateRangeFromDepth(paramRequest, fromDepth, toDepth, ref fromDate, ref toDate);

                }

                //Load User Settings
                UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);

                UserSettings.UserSettings objSettings = objSettingsMgr.loadUserSettings(UserId, ToolfaceSettings.SettingsId, wellId);

                ToolfaceSettings objToolfaceSettings = null;

                if (objSettings == null)
                {
                    objSettings = new UserSettings.UserSettings();

                    try
                    {
                        objToolfaceSettings = JsonConvert.DeserializeObject<ToolfaceSettings>(objSettings.settingData);
                    }
                    catch (Exception)
                    {


                    }
                }
                else
                {

                    try
                    {
                        objToolfaceSettings = JsonConvert.DeserializeObject<ToolfaceSettings>(objSettings.settingData);
                    }
                    catch (Exception)
                    {


                    }

                }

                if (objToolfaceSettings == null)
                {
                    objToolfaceSettings = new ToolfaceSettings();

                    objSettings = new UserSettings.UserSettings();
                    objSettings.UserId = UserId;
                    objSettings.WellId = wellId;
                    objSettings.SettingsId = ToolfaceSettings.SettingsId;
                    objSettings.settingData = JsonConvert.SerializeObject(objToolfaceSettings);

                    //Save these settings
                    objSettingsMgr.saveUserSettings(objSettings);
                }

                //Load and copy user settings also to reduce the round-trip
                objToolfaceSummary.userSettings = JsonConvert.SerializeObject(objToolfaceSettings);

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string strSQL = "";

                //Assign tables

                if (selectionType == "0")
                {
                    //By date range
                    fromDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, fromDate.ToOADate());
                    toDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, toDate.ToOADate());
                }
                else
                {
                    //By depth range
                    fromDate = objTimeLog.getDateTimeFromDepthBegining(ref paramRequest.objDataService, fromDepth);
                    toDate = objTimeLog.getDateTimeFromDepthEnding(ref paramRequest.objDataService, toDepth);
                }



                //Load Trajectory data first ...
                Trajectory objPlanTraj = Trajectory.loadPlanTrajectory(ref paramRequest.objDataService, wellId);
                Trajectory objActualTraj = Trajectory.loadActualTrajectory(ref paramRequest.objDataService, wellId);


                if(objPlanTraj==null)
                {
                    paramWarnings = paramWarnings + " " + "Plan Trajectory not found.";
                }

                if(objActualTraj==null)
                {
                    paramWarnings = paramWarnings + " " + "Actual Trajectory not found";
                }

                //First we need to find the max. extent
                double trajMinMD = 0;
                double trajMaxMD = 0;

                //Read min/max trajectory MD extents
                getMaxTrajExtents(paramRequest, wellId, fromDepth, toDepth, out trajMinMD, out trajMaxMD);


                if (objPlanTraj != null)
                {
                    strSQL = "SELECT MD,DOG_LEG FROM VMX_TRAJ_DATA WHERE WELL_ID='" + wellId + "' AND WELLBORE_ID='" + objPlanTraj.WellboreID + "' AND TRAJ_ID='" + objPlanTraj.ObjectID + "' AND MD>=" + trajMinMD.ToString() + " AND MD<=" + trajMaxMD.ToString() + " ";
                    objToolfaceSummary.PlanDLS = paramRequest.objDataService.getTable(strSQL);

                    strSQL = "SELECT MD,TVD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + wellId + "' AND WELLBORE_ID='" + objPlanTraj.WellboreID + "' AND TRAJ_ID='" + objPlanTraj.ObjectID + "' AND MD>=" + trajMinMD.ToString() + " AND MD<=" + trajMaxMD.ToString() + " ";
                    objToolfaceSummary.PlanTVD = paramRequest.objDataService.getTable(strSQL);
                }
                else
                {
                    objToolfaceSummary.PlanDLS = new DataTable();
                    objToolfaceSummary.PlanTVD = new DataTable();
                }



                if (objActualTraj != null)
                {
                    strSQL = "SELECT MD,DOG_LEG FROM VMX_TRAJ_DATA WHERE WELL_ID='" + wellId + "' AND WELLBORE_ID='" + objActualTraj.WellboreID + "' AND TRAJ_ID='" + objActualTraj.ObjectID + "' AND MD>=" + trajMinMD.ToString() + " AND MD<=" + trajMaxMD.ToString() + " ";
                    objToolfaceSummary.ActualDLS = paramRequest.objDataService.getTable(strSQL);

                    strSQL = "SELECT MD,TVD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + wellId + "' AND WELLBORE_ID='" + objActualTraj.WellboreID + "' AND TRAJ_ID='" + objActualTraj.ObjectID + "' AND MD>=" + trajMinMD.ToString() + " AND MD<=" + trajMaxMD.ToString() + " ";
                    objToolfaceSummary.ActualTVD = paramRequest.objDataService.getTable(strSQL);

                }
                else
                {
                    objToolfaceSummary.PlanDLS = new DataTable();
                    objToolfaceSummary.PlanTVD = new DataTable();
                }


                if (objPlanTraj != null)
                {
                    DataTable drlgWindowSettings = objToolfaceSettings.GeoDrlgWindowData;
                    objToolfaceSummary.drlgWindow = getDrlgWindowData(paramRequest, objPlanTraj, ref drlgWindowSettings);
                    DataTable ROPDrlgWindowSettings = objToolfaceSettings.ROPDrlgWindowData;
                    objToolfaceSummary.ropWindow = getDrlgWindowData(paramRequest, objPlanTraj, ref ROPDrlgWindowSettings);

                }
                else
                {
                    objToolfaceSummary.drlgWindow = new List<DrillingWindowInfo>();
                }

                //Calculate Motor Yields data
                objToolfaceSummary.MYData = getMYData(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, objTimeLog);

                //GTF and MTF Data
                string gtfWarning = "";
                objToolfaceSummary.GTFData = getGTFData(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, objTimeLog,out gtfWarning);
                paramWarnings = paramWarnings + " " + gtfWarning;

                string mtfWarning = "";
                objToolfaceSummary.MTFData = getMTFData(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, objTimeLog,out mtfWarning);
                paramWarnings = paramWarnings + " " + mtfWarning;

                objToolfaceSummary.RotarySections = getRotarySections(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, objTimeLog);

                DataTable lnSlideTable = new DataTable();

                calculateSlideStatistics(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, ref lnSlideTable, ref objToolfaceSummary, objTimeLog);

                objToolfaceSummary.SlideTable = lnSlideTable;

                objToolfaceSummary.adnlChannelsData = getAdnlChannelsData(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings);

                objToolfaceSummary.RotaryPercent = getRigStateDistancePercentage(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, objTimeLog, "0");
                objToolfaceSummary.SlidePercent = getRigStateDistancePercentage(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, objTimeLog, "1,19");

                objToolfaceSummary.RotaryPercent = Math.Round(objToolfaceSummary.RotaryPercent);
                objToolfaceSummary.SlidePercent = Math.Round(objToolfaceSummary.SlidePercent);
                objToolfaceSummary.SlidePercent = Math.Abs(objToolfaceSummary.RotaryPercent - 100);

                objToolfaceSummary.RotaryROP = getRigStateROP(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, objTimeLog, "0");
                objToolfaceSummary.SlideROP = getRigStateROP(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, objTimeLog, "1,19");


                double InZonePercent = 0;

                calculateInZoneFootage(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, objTimeLog, out InZonePercent);

                double InZoneROPPercent = 0;

                calculateInZoneROP(paramRequest, wellId, fromDepth, toDepth, fromDate, toDate, objToolfaceSettings, objTimeLog, out InZoneROPPercent);

                objToolfaceSummary.OutOfDrlgWindowPercent = Math.Round(100 - InZonePercent,2); //Nishant 12/08/2021
                objToolfaceSummary.OutOfROPWindowPercent = Math.Round(100 - InZoneROPPercent,2); //Nishant 12/08/2021


                objResponse.Response = JsonConvert.SerializeObject(objToolfaceSummary);

                objResponse.Warnings = paramWarnings;

                objResponse.RequestSuccessfull = true;
                objResponse.Errors = "";

                return objResponse;

            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in getToolfaceSummary " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        private Broker.BrokerResponse getUserSettings(Broker.BrokerRequest paramRequest)
        {
            try
            {

                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string SettingsData = paramRequest.Parameters.Where(x => x.ParamName.Contains("SettingsData")).FirstOrDefault().ParamValue;

                UserSettings.UserSettingsMgr objMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);
                UserSettings.UserSettings objSettings = objMgr.loadUserSettings(UserId, ToolfaceSettings.SettingsId, wellId);

                if (objSettings != null)
                {
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = objSettings.settingData;
                    objResponse.Errors = "";
                    return objResponse;

                }
                else
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error loading user settings " + objMgr.LastError;
                    return objBadResponse;

                }

            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error loading user settings " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }

        }

        private Broker.BrokerResponse saveUserSettings(Broker.BrokerRequest paramRequest)
        {
            try
            {

                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string SettingsData = paramRequest.Parameters.Where(x => x.ParamName.Contains("SettingsData")).FirstOrDefault().ParamValue;

                UserSettings.UserSettingsMgr objMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);

                UserSettings.UserSettings objSettings = new UserSettings.UserSettings();
                objSettings.WellId = wellId;
                objSettings.UserId = UserId;
                objSettings.settingData = SettingsData;
                objSettings.SettingsId = ToolfaceSettings.SettingsId;


                if (objMgr.saveUserSettings(objSettings))
                {
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
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
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving user settings " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }


        private List<DrillingWindowInfo> getDrlgWindowData(Broker.BrokerRequest paramRequest, Trajectory objPlanTraj, ref DataTable drlgWindowData)
        {
            try
            {

                List<DrillingWindowInfo> list = new List<DrillingWindowInfo>();

                if (objPlanTraj.trajectoryData.Count > 1)
                {

                    TrajectoryData[] arrTrajData = objPlanTraj.trajectoryData.Values.ToArray();

                    Array.Sort(arrTrajData);

                    for (int i = 1; i < arrTrajData.Length; i++)
                    {

                        double fromTVD = arrTrajData[i - 1].TVD;
                        double toTVD = arrTrajData[i].TVD;
                        double fromMD = arrTrajData[i - 1].MD;
                        double toMD = arrTrajData[i].MD;

                        double fromTopWindow = 0;
                        double toTopWindow = 0;
                        double fromBottomWindow = 0;
                        double toBottomWindow = 0;

                        for (int j = 0; j < drlgWindowData.Rows.Count; j++)
                        {
                            double lnToMD = double.Parse(DataService.checkNull(drlgWindowData.Rows[j]["EndMD"], 0).ToString());

                            if (lnToMD == 0)
                            {
                                drlgWindowData.Rows[j]["EndMD"] = arrTrajData[arrTrajData.Length - 1].MD;
                            }

                        }

                        bool fromFound = false;
                        bool toFound = false;


                        for (int j = 0; j < drlgWindowData.Rows.Count; j++)
                        {
                            double lnFromMD = double.Parse(DataService.checkNull(drlgWindowData.Rows[j]["StartMD"], 0).ToString());
                            double lnToMD = double.Parse(DataService.checkNull(drlgWindowData.Rows[j]["EndMD"], 0).ToString());

                            if (fromMD >= lnFromMD && fromMD <= lnToMD)
                            {
                                fromTopWindow = double.Parse(DataService.checkNull(drlgWindowData.Rows[j]["TopWindow"], 0).ToString());
                                fromBottomWindow = double.Parse(DataService.checkNull(drlgWindowData.Rows[j]["BottomWindow"], 0).ToString());
                                fromFound = true;
                            }

                        }

                        for (int j = 0; j < drlgWindowData.Rows.Count; j++)
                        {
                            double lnFromMD = double.Parse(DataService.checkNull(drlgWindowData.Rows[j]["StartMD"], 0).ToString());
                            double lnToMD = double.Parse(DataService.checkNull(drlgWindowData.Rows[j]["EndMD"], 0).ToString());

                            if (toMD >= lnFromMD && toMD <= lnToMD)
                            {
                                toTopWindow = double.Parse(DataService.checkNull(drlgWindowData.Rows[j]["TopWindow"], 0).ToString());
                                toBottomWindow = double.Parse(DataService.checkNull(drlgWindowData.Rows[j]["BottomWindow"], 0).ToString());
                                toFound = true;
                            }

                        }


                        if (fromFound && toFound)
                        {
                            DrillingWindowInfo objInfo = new DrillingWindowInfo();
                            objInfo.fromMD = fromMD;
                            objInfo.toMD = toMD;
                            objInfo.fromTVD = fromTVD;
                            objInfo.toTVD = toTVD;
                            objInfo.fromTopWindow = fromTopWindow;
                            objInfo.toTopWindow = toTopWindow;
                            objInfo.fromBottomWindow = fromBottomWindow;
                            objInfo.toBottomWindow = toBottomWindow;

                            list.Add(objInfo);
                        }


                    }


                }

                return list;
            }
            catch (Exception ex)
            {
                return new List<DrillingWindowInfo>();
            }
        }




        /// <summary>
        /// Returns adjusted Min. and Max. extents of Trajectories. It will use both plan and actual trajectory to find these extents
        /// </summary>
        private bool getMaxTrajExtents(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, out double minMD, out double maxMD)
        {

            try
            {

                string planTrajId = Trajectory.getPlannedTrajectoryID(ref paramRequest.objDataService, WellId);
                string actualTrajId = Trajectory.getActiveTrajectoryID(ref paramRequest.objDataService, WellId);

                minMD = 0;
                maxMD = 0;

                double planMinMD = 0;
                double planMaxMD = 0;
                double actualMinMD = 0;
                double actualMaxMD = 0;

                if (planTrajId.Trim() != "")
                {
                    DataTable objData = paramRequest.objDataService.getTable("SELECT TOP 1 MD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + WellId + "' AND TRAJ_ID='" + planTrajId + "' AND MD<=" + fromDepth.ToString() + " ORDER BY MD DESC");

                    if (objData.Rows.Count > 0)
                    {
                        planMinMD = double.Parse(DataService.checkNull(objData.Rows[0]["MD"], 0).ToString());

                    }

                    objData.Dispose();


                    objData = paramRequest.objDataService.getTable("SELECT TOP 1 MD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + WellId + "' AND TRAJ_ID='" + planTrajId + "' AND MD>=" + toDepth.ToString() + " ORDER BY MD");

                    if (objData.Rows.Count > 0)
                    {
                        planMaxMD = double.Parse(DataService.checkNull(objData.Rows[0]["MD"], 0).ToString());

                    }
                    else
                    {
                        DataTable objData2= paramRequest.objDataService.getTable("SELECT TOP 1 MD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + WellId + "' AND TRAJ_ID='" + planTrajId + "'  ORDER BY MD DESC");

                        if(objData2.Rows.Count>0)
                        {
                            planMaxMD = double.Parse(DataService.checkNull(objData2.Rows[0]["MD"], 0).ToString());
                        }

                        objData2.Dispose();
                    }

                    objData.Dispose();

                }



                if (actualTrajId.Trim() != "")
                {
                    DataTable objData = paramRequest.objDataService.getTable("SELECT TOP 1 MD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + WellId + "' AND TRAJ_ID='" + actualTrajId + "' AND MD<=" + fromDepth.ToString() + " ORDER BY MD DESC");

                    if (objData.Rows.Count > 0)
                    {
                        actualMinMD = double.Parse(DataService.checkNull(objData.Rows[0]["MD"], 0).ToString());

                    }

                    objData.Dispose();


                    objData = paramRequest.objDataService.getTable("SELECT TOP 1 MD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + WellId + "' AND TRAJ_ID='" + actualTrajId + "' AND MD>=" + toDepth.ToString() + " ORDER BY MD");

                    if (objData.Rows.Count > 0)
                    {
                        actualMaxMD = double.Parse(DataService.checkNull(objData.Rows[0]["MD"], 0).ToString());

                    }
                    else
                    {
                        DataTable objData2= paramRequest.objDataService.getTable("SELECT TOP 1 MD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + WellId + "' AND TRAJ_ID='" + actualTrajId + "'  ORDER BY MD DESC");

                        if(objData2.Rows.Count>0)
                        {
                            actualMaxMD = double.Parse(DataService.checkNull(objData2.Rows[0]["MD"], 0).ToString());
                        }

                        objData2.Dispose();
                    }

                    objData.Dispose();

                }



                minMD = Math.Min(planMinMD, actualMinMD);
                maxMD = Math.Max(planMaxMD, actualMaxMD);

                return true;

            }
            catch (Exception)
            {
                minMD = 0;
                maxMD = 0;
                return false;
            }
        }

        private DataTable getMYData(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings, TimeLog objTimeLog)
        {
            try
            {

                DataTable objData = new DataTable();
                objData.Columns.Add(new DataColumn("DEPTH", typeof(System.Double)));
                objData.Columns.Add(new DataColumn("MY", typeof(System.Double)));

                //First we need to find the max. extent
                double trajMinMD = 0;
                double trajMaxMD = 0;

                //Read min/max trajectory MD extents
                getMaxTrajExtents(paramRequest, WellId, fromDepth, toDepth, out trajMinMD, out trajMaxMD);


                //Prepare MY table
                DataTable MYTable = new DataTable();

                MYTable.Columns.Add("MD");
                MYTable.Columns.Add("PrevMD");
                MYTable.Columns.Add("TotalFootage");
                MYTable.Columns.Add("SlideFootage");
                MYTable.Columns.Add("DogLeg");
                MYTable.Columns.Add("MotorYield");

                Trajectory objTraj = Trajectory.loadActualTrajectory(ref paramRequest.objDataService, WellId);

                string strSQL = "";

                //Get the slide footage
                strSQL = "SELECT [HDTH] AS DEPTH,(DEPTH-NEXT_DEPTH) AS FOOTAGE,RIG_STATE FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND (RIG_STATE=0 OR RIG_STATE=1 OR RIG_STATE=19) AND (NEXT_DEPTH>0 AND HDTH>=0) ORDER BY [HDTH]";

                DataTable objSlideData = paramRequest.objDataService.getTable(strSQL);

                var motorYieldsData = new Dictionary<double, double>();

                
                if (objTraj != null)
                {
                    TrajectoryData[] arrTrajData = objTraj.trajectoryData.Values.ToArray();
                
                
                Array.Sort(arrTrajData);

                for (int i = 1; i <= arrTrajData.Count() - 1; i++)
                {
                    double prevMD = arrTrajData[i - 1].MD;

                    double MD = arrTrajData[i].MD;

                    if (MD >= fromDepth & MD <= trajMaxMD)
                    {
                        //Nothing to do ...
                    }
                    else
                    {
                        continue;
                    }

                    bool firstIndexFound = false;
                    int firstIndex = 0;
                    bool lastIndexFound = false;
                    int lastIndex = 0;
                    double sumFootage = 0d;

                    for (int j = 0; j <= objSlideData.Rows.Count - 1; j++)
                    {
                        if (double.Parse(objSlideData.Rows[j]["DEPTH"].ToString()) >= prevMD)
                        {
                            firstIndexFound = true;
                            firstIndex = j;
                            break;
                        }
                    }

                    if (firstIndexFound)
                    {
                        for (int j = 0; j <= objSlideData.Rows.Count - 1; j++)
                        {
                            if (double.Parse(objSlideData.Rows[j]["DEPTH"].ToString()) >= MD)
                            {
                                lastIndexFound = true;
                                lastIndex = j;
                                break;
                            }
                        }

                        if (!lastIndexFound)
                        {
                            lastIndex = objSlideData.Rows.Count - 1;
                        }

                        for (int j = firstIndex; j <= lastIndex; j++)
                        {

                            double lnRigState = double.Parse(DataService.checkNull(objSlideData.Rows[j]["RIG_STATE"], 0).ToString());

                            if (lnRigState == 1 | lnRigState == 19)
                            {

                                double lnFootage = double.Parse(DataService.checkNull(objSlideData.Rows[j]["FOOTAGE"], 0).ToString());

                                if (lnFootage < 0d)
                                {
                                    lnFootage = 0d;
                                }

                                sumFootage = sumFootage + lnFootage;
                            }
                        }
                    }

                    double slideFootage = sumFootage;
                    if (slideFootage <= 1d)
                    {
                        slideFootage = 0d;
                    }

                    double MotorYield = 0d;

                    if (slideFootage > 0d)
                    {

                        double SurveyDistance = MD - prevMD;
                        double DLS = arrTrajData[i].Dogleg;
                        double slidePercentage = slideFootage * 100d / SurveyDistance;

                        MotorYield = Math.Round(SurveyDistance * DLS / slideFootage, 2);

                        if (slidePercentage < 2d)
                        {
                            MotorYield = -999.25d;
                        }

                        if (slidePercentage > 98d)
                        {
                            MotorYield = DLS;
                        }


                        if (objSettings.FilterByMinSlideLength)
                        {
                            if (slideFootage < objSettings.MinSlideLength)
                            {
                                MotorYield = -999.25d;
                                // MotorYield = 0
                            }
                        }

                        motorYieldsData.Add(MD, MotorYield);
                    }
                    else
                    {
                        motorYieldsData.Add(MD, 0d);
                    }

                    DataRow objMYRow = MYTable.NewRow();
                    objMYRow["MD"] = MD;
                    objMYRow["PrevMD"] = prevMD;
                    objMYRow["TotalFootage"] = MD - prevMD;
                    objMYRow["SlideFootage"] = Math.Round(slideFootage, 2);
                    objMYRow["DogLeg"] = arrTrajData[i].Dogleg;
                    objMYRow["MotorYield"] = Math.Round(MotorYield, 2);
                    MYTable.Rows.Add(objMYRow);
                }

                }
                foreach (double lnMD in motorYieldsData.Keys)
                {

                    DataRow objNewRow = objData.NewRow();
                    objNewRow["DEPTH"] = lnMD;
                    objNewRow["MY"] = motorYieldsData[lnMD];

                    objData.Rows.Add(objNewRow);

                }

                MYTable.Dispose();

                return objData;

            }
            catch (Exception ex)
            {
                return null;
            }
        }

        private DataTable getDeltaData(Broker.BrokerRequest paramRequest, string WellId, float fromDepth, float toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings)
        {
            try
            {

                DataTable objData = new DataTable();
                objData.Columns.Add(new DataColumn("DEPTH", typeof(System.Double)));
                objData.Columns.Add(new DataColumn("VALUE", typeof(System.Double)));


                string planTrajId = Trajectory.getPlannedTrajectoryID(ref paramRequest.objDataService, WellId);
                string actualTrajId = Trajectory.getPrimaryActiveTrajID(paramRequest.objDataService, WellId);


                if (planTrajId.Trim() != "" && actualTrajId.Trim() != "")
                {
                    //Both trajectories are present, continue ...
                }
                else
                {
                    //Return blank table
                    return objData;
                }


                //First we need to find the max. extent
                double trajMinMD = 0;
                double trajMaxMD = 0;

                //Read min/max trajectory MD extents
                getMaxTrajExtents(paramRequest, WellId, fromDepth, toDepth, out trajMinMD, out trajMaxMD);



                //Prepare Delta table
                DataTable DeltaTable = new DataTable();

                string DeltaColumn = "TVD";

                Trajectory objActualTraj = Trajectory.loadActualTrajectory(ref paramRequest.objDataService, WellId);
                Trajectory objPlanTraj = Trajectory.loadPlanTrajectory(ref paramRequest.objDataService, WellId);


                if (Trajectory.getCalculatedDelta(ref paramRequest.objDataService, objActualTraj, objPlanTraj, fromDepth, trajMaxMD, DeltaColumn, ref DeltaTable))
                {

                    if (DeltaTable != null)
                    {

                        foreach (DataRow objRow in DeltaTable.Rows)
                        {
                            DataRow objNewRow = objData.NewRow();
                            objNewRow["DEPTH"] = objRow["MD"];
                            objNewRow["VALUE"] = objRow["DELTA"];

                            objData.Rows.Add(objNewRow);
                        }

                        DeltaTable.Dispose();
                    }

                }


                return objData;

            }
            catch (Exception ex)
            {
                return null;
            }
        }

        private void prepareSlideTable(ref DataTable SlideTable)
        {
            try
            {
                SlideTable = new DataTable();
                SlideTable.Columns.Add("From Depth");
                SlideTable.Columns.Add("To Depth");
                SlideTable.Columns.Add("Slide Footage");
                SlideTable.Columns.Add("From Date");
                SlideTable.Columns.Add("To Date");
                SlideTable.Columns.Add("GTF_VectorX");
                SlideTable.Columns.Add("GTF_VectorY");
                SlideTable.Columns.Add("GTF_VectorLength");
                SlideTable.Columns.Add("GTF_VectorAngle");
                SlideTable.Columns.Add("GTF_VectorEff");
                SlideTable.Columns.Add("MTF_VectorX");
                SlideTable.Columns.Add("MTF_VectorY");
                SlideTable.Columns.Add("MTF_VectorLength");
                SlideTable.Columns.Add("MTF_VectorAngle");
                SlideTable.Columns.Add("MTF_VectorEff");
            }
            catch (Exception ex)
            {
            }
        }

        private void calculateSlideStatistics(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings, ref DataTable SlideTable, ref ToolfaceData objSummaryData, TimeLog objTimeLog)
        {
            try
            {

                prepareSlideTable(ref SlideTable);

                double SlideCount = 0d;
                string __dataTableName = objTimeLog.__dataTableName;

                string strSQL = "";

                string strTopsFilter = "";

                strSQL = "SELECT DATETIME,HDTH,RIG_STATE FROM " + __dataTableName + " WHERE RIG_STATE IN (0,1,19)  AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DATETIME";

                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                {

                    bool startRecorded = false;

                    int startIndex = 0;

                    for (int i = 0; i <= objData.Rows.Count - 1; i++)
                    {

                        double lnRigState = double.Parse(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0).ToString());

                        if (lnRigState == 1 | lnRigState == 19)
                        {
                            if (!startRecorded)
                            {
                                startRecorded = true;
                                startIndex = i;
                            }
                        }
                        else if (startRecorded)
                        {

                            startRecorded = false;

                            double lnStartDepth = double.Parse(DataService.checkNull(objData.Rows[startIndex]["HDTH"], 0).ToString());
                            double lnCurrentDepth = double.Parse(DataService.checkNull(objData.Rows[i]["HDTH"], 0).ToString());
                            DateTime lnStartDate = DateTime.Parse(DataService.checkNull(objData.Rows[startIndex]["DATETIME"], DateTime.Now).ToString());
                            DateTime lnEndDate = DateTime.Parse(DataService.checkNull(objData.Rows[i]["DATETIME"], DateTime.Now).ToString());
                            double Footage = lnCurrentDepth - lnStartDepth;

                            if (Footage >= objSettings.MinSlideLength)
                            {

                                DataRow objSlideRow = SlideTable.NewRow();
                                objSlideRow["From Depth"] = Math.Round(lnStartDepth, 2);
                                objSlideRow["To Depth"] = Math.Round(lnCurrentDepth, 2);
                                objSlideRow["Slide Footage"] = Math.Round(Footage, 2);
                                objSlideRow["From Date"] = lnStartDate;
                                objSlideRow["To Date"] = lnEndDate;
                                SlideTable.Rows.Add(objSlideRow);


                                // 'Increment the slide count ...
                                SlideCount = SlideCount + 1d;
                            }
                        }
                    }

                    if (startRecorded)
                    {
                        // 'Draw last highlight

                        startRecorded = false;
                        double lnStartDepth = double.Parse(DataService.checkNull(objData.Rows[startIndex]["HDTH"], 0).ToString());
                        double lnCurrentDepth = double.Parse(DataService.checkNull(objData.Rows[objData.Rows.Count - 1]["HDTH"], 0).ToString());
                        double Footage = lnCurrentDepth - lnStartDepth;
                        if (Footage >= objSettings.MinSlideLength)
                        {

                            // 'Increment the slide count ...
                            SlideCount = SlideCount + 1d;

                        }

                    }
                }

                mergeMinorRotaryFootage(ref SlideTable, objSettings);

                SlideCount = SlideTable.Rows.Count;

                double SlideFootage = getRigStateDistance(paramRequest, WellId, fromDepth, toDepth, fromDate, toDate, objSettings, objTimeLog, "1,19");

                objSummaryData.TotalSlideFootage = SlideFootage;


                if (SlideCount > 0d & SlideFootage > 0d)
                {
                    objSummaryData.NoOfSlides = SlideCount;
                    objSummaryData.AvgSlideLength = Math.Round(SlideFootage / SlideCount, 2);
                }
                else
                {
                    objSummaryData.NoOfSlides = 0;
                    objSummaryData.AvgSlideLength = 0;
                }


                // '### Calculate Toolface Vector ########
                for (int i = 0; i < SlideTable.Rows.Count; i++)
                {
                    DataRow objRow = SlideTable.Rows[i];

                    calculateMTFVector(paramRequest, WellId, fromDepth, toDepth, fromDate, toDate, objTimeLog, objSettings, ref objRow);
                    calculateGTFVector(paramRequest, WellId, fromDepth, toDepth, fromDate, toDate, objTimeLog, objSettings, ref objRow);

                }
            }
            // '######################################


            catch (Exception ex)
            {


            }

        }

        private void calculateGTFVector(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, TimeLog objTimeLog, ToolfaceSettings objSettings, ref DataRow objRow)
        {
            try
            {
                double lnFromDepth = double.Parse(objRow["From Depth"].ToString());
                double lnToDepth = double.Parse(objRow["To Depth"].ToString());
                DateTime lnFromDate = DateTime.Parse(objRow["From Date"].ToString());
                DateTime lnToDate = DateTime.Parse(objRow["To Date"].ToString());
                double SlideFootage = double.Parse(objRow["Slide Footage"].ToString());

                string __dataTableName = objTimeLog.__dataTableName;

                DataTable objData = paramRequest.objDataService.getTable("SELECT DEPTH,GTF FROM " + __dataTableName + " WHERE RIG_STATE IN (1,19) AND (GTF IS NOT NULL) AND DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY HDTH");

                if (objData.Rows.Count == 0)
                {
                    objRow["GTF_VectorX"] = -999.25d;
                    objRow["GTF_VectorY"] = -999.25d;
                    objRow["GTF_VectorLength"] = -999.25d;
                    objRow["GTF_VectorEff"] = -999.25d;
                    objRow["GTF_VectorAngle"] = -999.25d;
                    return;
                }

                double sumVx = 0d;
                double sumVy = 0d;
                double sumLength = 0d;
                double vAngle = 0d;
                double vEff = 0d;
                try
                {
                    for (int i = 1; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnPrevDepth = double.Parse(objData.Rows[i - 1]["DEPTH"].ToString());
                        double lnDepth = double.Parse(objData.Rows[i]["DEPTH"].ToString());
                        double lnGTF = double.Parse(objData.Rows[i]["GTF"].ToString());
                        double lnGTFRad = Math.PI / 180d * lnGTF;
                        double lnDistance = lnPrevDepth - lnDepth;
                        double vX = lnDistance;
                        double vY = lnDistance * Math.Sin(lnGTFRad);
                        double vLength = Math.Sqrt(Math.Pow(vX, 2d) + Math.Pow(vY, 2d));
                        sumVx = sumVx + vX;
                        sumVy = sumVy + vY;
                        sumLength = sumLength + vLength;
                    }

                    vAngle = Math.Atan(sumVy / sumVx) * 180d / Math.PI;
                    vEff = Math.Sqrt(Math.Pow(sumVx, 2d) + Math.Pow(sumVy, 2d)) / sumLength;

                    if (double.IsNaN(vAngle))
                    {
                        vAngle = 0d;
                    }

                    if (double.IsNaN(vEff))
                    {
                        vEff = 0d;
                    }

                }
                catch (Exception ex)
                {
                }

                objRow["GTF_VectorX"] = sumVx;
                objRow["GTF_VectorY"] = sumVy;
                objRow["GTF_VectorLength"] = sumLength;
                objRow["GTF_VectorEff"] = Math.Round(vEff * 100d, 2);
                objRow["GTF_VectorAngle"] = vAngle;


            }
            catch (Exception ex)
            {
            }
        }

        private void calculateMTFVector(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, TimeLog objTimeLog, ToolfaceSettings objSettings, ref DataRow objRow)
        {
            try
            {
                double lnFromDepth = double.Parse(objRow["From Depth"].ToString());
                double lnToDepth = double.Parse(objRow["To Depth"].ToString());
                DateTime lnFromDate = DateTime.Parse(objRow["From Date"].ToString());
                DateTime lnToDate = DateTime.Parse(objRow["To Date"].ToString());
                double SlideFootage = double.Parse(objRow["Slide Footage"].ToString());
                string __dataTableName = objTimeLog.__dataTableName;

                DataTable objData = paramRequest.objDataService.getTable("SELECT DEPTH,MTF FROM " + __dataTableName + " WHERE RIG_STATE IN (1,19) AND (MTF IS NOT NULL) AND DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY HDTH");

                if (objData.Rows.Count == 0)
                {

                    objRow["MTF_VectorX"] = -999.25d;
                    objRow["MTF_VectorY"] = -999.25d;
                    objRow["MTF_VectorLength"] = -999.25d;
                    objRow["MTF_VectorEff"] = -999.25d;
                    objRow["MTF_VectorAngle"] = -999.25d;

                    return;
                }

                double sumVx = 0d;
                double sumVy = 0d;
                double sumLength = 0d;
                double vAngle = 0d;
                double vEff = 0d;
                try
                {
                    for (int i = 1; i <= objData.Rows.Count - 1; i++)
                    {
                        double lnPrevDepth = double.Parse(objData.Rows[i - 1]["DEPTH"].ToString());
                        double lnDepth = double.Parse(objData.Rows[i]["DEPTH"].ToString());
                        double lnMTF = double.Parse(objData.Rows[i]["MTF"].ToString());
                        double lnMTFRad = Math.PI / 180d * lnMTF;
                        double lnDistance = lnPrevDepth - lnDepth;
                        double vX = lnDistance;
                        double vY = lnDistance * Math.Sin(lnMTFRad);
                        double vLength = Math.Sqrt(Math.Pow(vX, 2d) + Math.Pow(vY, 2d));
                        sumVx = sumVx + vX;
                        sumVy = sumVy + vY;
                        sumLength = sumLength + vLength;
                    }

                    vAngle = Math.Atan(sumVy / sumVx) * 180d / Math.PI;
                    vEff = Math.Sqrt(Math.Pow(sumVx, 2d) + Math.Pow(sumVy, 2d)) / sumLength;
                }
                catch (Exception ex)
                {
                }

                objRow["MTF_VectorX"] = sumVx;
                objRow["MTF_VectorY"] = sumVy;
                objRow["MTF_VectorLength"] = sumLength;
                objRow["MTF_VectorEff"] = Math.Round(vEff * 100d, 2);
                objRow["MTF_VectorAngle"] = vAngle;

            }
            catch (Exception ex)
            {
            }
        }

        public double getRigStateDistance(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings, TimeLog objLog, string rigStates)
        {
            try
            {
                double sumDepth = 0d;
                double TotalFootage = 0d;
                string dataTableName = objLog.__dataTableName;
                string strSQL = "";
                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE NEXT_DEPTH>0 AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND NEXT_DEPTH>0 AND RIG_STATE IN (" + rigStates + ") AND HDTH>=0";
                TotalFootage = Math.Round(double.Parse(DataService.checkNull(paramRequest.objDataService.getValueFromDatabase(strSQL), 0).ToString()));

                return TotalFootage;
            }
            catch (Exception ex)
            {
                return 0d;
            }
        }

        public double getRigStateROP(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings, TimeLog objLog, string rigStates)
        {
            try
            {
                double sumDateTime = 0d;
                double sumDepth = 0d;
                string dataTableName = objLog.__dataTableName;
                string strSQL = "";

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE RIG_STATE IN (" + rigStates + ") " + " AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TIME_DURATION>=0";
                sumDateTime = double.Parse(DataService.checkNull(paramRequest.objDataService.getValueFromDatabase(strSQL), 0).ToString());

                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE RIG_STATE IN (" + rigStates + ") AND NEXT_DEPTH>0 AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND NEXT_DEPTH>0 AND HDTH>=0";
                sumDepth = double.Parse(DataService.checkNull(paramRequest.objDataService.getValueFromDatabase(strSQL), 0).ToString());

                double ROP = 0d;

                if (sumDateTime > 0d)
                {
                    ROP = sumDepth / (sumDateTime / 60d / 60d); // ft/second 
                }
                else
                {
                    ROP = 0d;
                }

                ROP = Math.Round(ROP, 2);
                return ROP;
            }
            catch (Exception ex)
            {
                return 0d;
            }
        }

        private void calculateInZoneFootage(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings, TimeLog objTimeLog, out double InZoneDrlgPercentage)
        {

            InZoneDrlgPercentage = 100; // 'Assume total drilling is within drilling window 

            try
            {

                double TotalFootage = 0d;
                double InZoneFootage = 0d;

                Trajectory objPlanTraj = Trajectory.loadPlanTrajectory(ref paramRequest.objDataService, WellId);
                Trajectory objActualTraj = Trajectory.loadActualTrajectory(ref paramRequest.objDataService, WellId);

                if (objPlanTraj == null || objActualTraj == null)
                {
                    return;
                }


                if (objSettings.ShowDrillingWindow)
                {
                    if (objPlanTraj.ObjectID.Trim() != "" && objActualTraj.ObjectID.Trim() != "")
                    {


                        // 'Load trajectory data into data table
                        DataTable objActualTrajData = paramRequest.objDataService.getTable("SELECT MD,TVD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + WellId + "' AND WELLBORE_ID='" + objActualTraj.WellboreID + "' AND TRAJ_ID='" + objActualTraj.ObjectID + "' ORDER BY MD");
                        DataTable objPlanTrajData = paramRequest.objDataService.getTable("SELECT MD,TVD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + WellId + "' AND WELLBORE_ID='" + objPlanTraj.WellboreID + "' AND TRAJ_ID='" + objPlanTraj.ObjectID + "' ORDER BY MD");

                        string strSQL = "";

                        strSQL = "SELECT ROUND(HDTH,0) AS DEPTH,SUM(HDTH-NEXT_DEPTH) AS FTG  FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND (RIG_STATE=0 OR RIG_STATE=1 OR RIG_STATE=19) AND NEXT_DEPTH>0 GROUP BY ROUND(HDTH,0) ORDER BY ROUND(HDTH,0)";

                        DataTable objTimeData = paramRequest.objDataService.getTable(strSQL);

                        foreach (DataRow objRow in objTimeData.Rows)
                        {
                            double MD = double.Parse(DataService.checkNull(objRow["DEPTH"], 0).ToString());
                            double Footage = double.Parse(DataService.checkNull(objRow["FTG"], 0).ToString());
                            double TVD = 0d;
                            TotalFootage = TotalFootage + Footage;
                            bool isInZone = false;

                            // 'Get actual interpolated TVD 
                            double actualTVD = Trajectory.getEqualentValueEx2(MD, "TVD", objActualTrajData);
                            double planTVD = Trajectory.getEqualentValueEx2(MD, "TVD", objPlanTrajData);
                            if (actualTVD != -999.25d)
                            {
                                double topWindow = 0d;
                                double bottomWindow = 0d;
                                bool WindowFound = false;

                                foreach (DataRow objDrlgWindowRow in objSettings.GeoDrlgWindowData.Rows)
                                {

                                    //double lnFromMD = double.Parse(DataService.checkNull(objDrlgWindowRow["FROM_MD"], 0).ToString());
                                    //double lnToMD = double.Parse(DataService.checkNull(objDrlgWindowRow["TO_MD"], 0).ToString());

                                    //double lnTop = double.Parse(DataService.checkNull(objDrlgWindowRow["TOP"], 0).ToString());
                                    //double lnBottom = double.Parse(DataService.checkNull(objDrlgWindowRow["BOTTOM"], 0).ToString());


                                    //Nishant 12/08/2021
                                    double lnFromMD = double.Parse(DataService.checkNull(objDrlgWindowRow["StartMD"], 0).ToString());
                                    double lnToMD = double.Parse(DataService.checkNull(objDrlgWindowRow["EndMD"], 0).ToString());

                                    double lnTop = double.Parse(DataService.checkNull(objDrlgWindowRow["TopWindow"], 0).ToString());
                                    double lnBottom = double.Parse(DataService.checkNull(objDrlgWindowRow["BottomWindow"], 0).ToString());


                                    if (MD >= lnFromMD & MD <= lnToMD)
                                    {
                                        topWindow = lnTop;
                                        bottomWindow = lnBottom;
                                        WindowFound = true;
                                        break;
                                    }

                                }

                                if (WindowFound)
                                {
                                    // 'Now check the range ...
                                    if (actualTVD >= planTVD - topWindow & actualTVD <= planTVD + bottomWindow)
                                    {
                                        isInZone = true;
                                    }
                                }
                                else
                                {
                                    // 'No drilling window found so assume within window ...
                                    isInZone = true;
                                }

                            }
                            else
                            {

                                // 'No interpolated values found .... skip this row or consider it as in zone ...
                                isInZone = true;
                            }

                            if (isInZone)
                            {
                                InZoneFootage = InZoneFootage + Footage;
                            }
                        }


                        // '*** Now Calculate In Zone Drilling Percentage **********
                        if (TotalFootage > 0d)
                        {
                            if (InZoneFootage <= 0d)
                            {

                                // 'Nothing found within drilling window ...

                                InZoneDrlgPercentage = 0;
                            }

                            if (InZoneFootage > 0d)
                            {
                                InZoneDrlgPercentage = Math.Round(InZoneFootage * 100d / TotalFootage, 2);
                                if (InZoneDrlgPercentage > 100)
                                {
                                    InZoneDrlgPercentage = 100;
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

        private void calculateInZoneROP(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings, TimeLog objTimeLog, out double InZoneROPPercentage)
        {

            InZoneROPPercentage = 100; // 'Assume total drilling is within drilling window 

            try
            {

                double TotalFootage = 0d;
                double InZoneFootage = 0d;

                Trajectory objPlanTraj = Trajectory.loadPlanTrajectory(ref paramRequest.objDataService, WellId);
                Trajectory objActualTraj = Trajectory.loadActualTrajectory(ref paramRequest.objDataService, WellId);

                if (objPlanTraj == null || objActualTraj == null)
                {
                    return;
                }


                if (objSettings.ShowROPDrillingWindow)
                {

                    if (objPlanTraj.ObjectID.Trim() != "" && objActualTraj.ObjectID.Trim() != "")
                    {

                        DataTable objActualTrajData = paramRequest.objDataService.getTable("SELECT MD,TVD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + WellId + "' AND WELLBORE_ID='" + objActualTraj.WellboreID + "' AND TRAJ_ID='" + objActualTraj.ObjectID + "' ORDER BY MD");
                        DataTable objPlanTrajData = paramRequest.objDataService.getTable("SELECT MD,TVD FROM VMX_TRAJ_DATA WHERE WELL_ID='" + WellId + "' AND WELLBORE_ID='" + objPlanTraj.WellboreID + "' AND TRAJ_ID='" + objPlanTraj.ObjectID + "' ORDER BY MD");

                        string strSQL = "";

                        strSQL = "SELECT ROUND(HDTH,0) AS DEPTH,SUM(HDTH-NEXT_DEPTH) AS FTG  FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND (RIG_STATE=0 OR RIG_STATE=1 OR RIG_STATE=19) AND NEXT_DEPTH>0 GROUP BY ROUND(HDTH,0) ORDER BY ROUND(HDTH,0)";

                        DataTable objTimeData = paramRequest.objDataService.getTable(strSQL);

                        foreach (DataRow objRow in objTimeData.Rows)
                        {

                            double MD = double.Parse(DataService.checkNull(objRow["DEPTH"], 0).ToString());
                            double Footage = double.Parse(DataService.checkNull(objRow["FTG"], 0).ToString());
                            double TVD = 0d;

                            TotalFootage = TotalFootage + Footage;
                            bool isInZone = false;

                            // 'Get actual interpolated TVD 
                            double actualTVD = Trajectory.getEqualentValueEx2(MD, "TVD", objActualTrajData);
                            double planTVD = Trajectory.getEqualentValueEx2(MD, "TVD", objPlanTrajData);
                            if (actualTVD != -999.25d)
                            {
                                double topWindow = 0d;
                                double bottomWindow = 0d;
                                bool WindowFound = false;


                                foreach (DataRow objDrlgWindowRow in objSettings.ROPDrlgWindowData.Rows)
                                {
                                    //Nishant 12/08/2021
                                    double lnFromMD = double.Parse(DataService.checkNull(objDrlgWindowRow["StartMD"], 0).ToString());
                                    double lnToMD = double.Parse(DataService.checkNull(objDrlgWindowRow["EndMD"], 0).ToString());

                                    double lnTop = double.Parse(DataService.checkNull(objDrlgWindowRow["TopWindow"], 0).ToString());
                                    double lnBottom = double.Parse(DataService.checkNull(objDrlgWindowRow["BottomWindow"], 0).ToString());


                                    if (MD >= lnFromMD & MD <= lnToMD)
                                    {
                                        topWindow = lnTop;
                                        bottomWindow = lnBottom;
                                        WindowFound = true;
                                        break;
                                    }

                                }



                                if (WindowFound)
                                {

                                    // 'Now check the range ...
                                    if (actualTVD >= planTVD - topWindow & actualTVD <= planTVD + bottomWindow)
                                    {
                                        isInZone = true;
                                    }
                                }
                                else
                                {

                                    // 'No drilling window found so assume within window ...
                                    isInZone = true;
                                }
                            }
                            else
                            {

                                // 'No interpolated values found .... skip this row or consider it as in zone ...
                                isInZone = true;
                            }

                            if (isInZone)
                            {
                                InZoneFootage = InZoneFootage + Footage;
                            }
                        }


                        // '*** Now Calculate In Zone Drilling Percentage **********
                        if (TotalFootage > 0d)
                        {
                            if (InZoneFootage <= 0d)
                            {

                                // 'Nothing found within drilling window ...

                                InZoneROPPercentage = 0;
                            }

                            if (InZoneFootage > 0d)
                            {
                                InZoneROPPercentage = Math.Round(InZoneFootage * 100d / TotalFootage, 2);
                                if (InZoneROPPercentage > 100)
                                {
                                    InZoneROPPercentage = 100;
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

        private void mergeMinorRotaryFootage(ref DataTable SlideTable, ToolfaceSettings objSettings)
        {
            try
            {

                if (SlideTable.Rows.Count <= 1)
                {
                    return;
                }

                var objNewTable = new DataTable();
                objNewTable.Columns.Add("From Depth");
                objNewTable.Columns.Add("To Depth");
                objNewTable.Columns.Add("Slide Footage");
                objNewTable.Columns.Add("From Date");
                objNewTable.Columns.Add("To Date");
                objNewTable.Columns.Add("GTF_VectorX");
                objNewTable.Columns.Add("GTF_VectorY");
                objNewTable.Columns.Add("GTF_VectorLength");
                objNewTable.Columns.Add("GTF_VectorAngle");
                objNewTable.Columns.Add("GTF_VectorEff");
                objNewTable.Columns.Add("MTF_VectorX");
                objNewTable.Columns.Add("MTF_VectorY");
                objNewTable.Columns.Add("MTF_VectorLength");
                objNewTable.Columns.Add("MTF_VectorAngle");
                objNewTable.Columns.Add("MTF_VectorEff");

                DataRow objFRow = objNewTable.NewRow();

                objFRow["From Depth"] = SlideTable.Rows[0]["From Depth"];
                objFRow["To Depth"] = SlideTable.Rows[0]["To Depth"];
                objFRow["Slide Footage"] = SlideTable.Rows[0]["Slide Footage"];
                objFRow["From Date"] = SlideTable.Rows[0]["From Date"];
                objFRow["To Date"] = SlideTable.Rows[0]["To Date"];
                objNewTable.Rows.Add(objFRow);

                for (int i = 1; i <= SlideTable.Rows.Count - 1; i++)
                {

                    DataRow objPrevRow = objNewTable.Rows[objNewTable.Rows.Count - 1];

                    double prevDepth = double.Parse(objPrevRow["To Depth"].ToString());
                    double currentDepth = double.Parse(SlideTable.Rows[i]["From Depth"].ToString());
                    double RotaryFootage = currentDepth - prevDepth;

                    if (RotaryFootage > objSettings.MinRotationFootage)
                    {

                        // 'Nothing to do ... copy previous row
                        DataRow objNewRow = objNewTable.NewRow();

                        objNewRow["From Depth"] = SlideTable.Rows[i]["From Depth"];
                        objNewRow["To Depth"] = SlideTable.Rows[i]["To Depth"];
                        objNewRow["Slide Footage"] = SlideTable.Rows[i]["Slide Footage"];
                        objNewRow["From Date"] = SlideTable.Rows[i]["From Date"];
                        objNewRow["To Date"] = SlideTable.Rows[i]["To Date"];
                        objNewRow["GTF_VectorX"] = SlideTable.Rows[i]["GTF_VectorX"];
                        objNewRow["GTF_VectorY"] = SlideTable.Rows[i]["GTF_VectorY"];
                        objNewRow["GTF_VectorLength"] = SlideTable.Rows[i]["GTF_VectorLength"];
                        objNewRow["GTF_VectorAngle"] = SlideTable.Rows[i]["GTF_VectorAngle"];
                        objNewRow["GTF_VectorEff"] = SlideTable.Rows[i]["GTF_VectorEff"];
                        objNewRow["MTF_VectorX"] = SlideTable.Rows[i]["MTF_VectorX"];
                        objNewRow["MTF_VectorY"] = SlideTable.Rows[i]["MTF_VectorY"];
                        objNewRow["MTF_VectorLength"] = SlideTable.Rows[i]["MTF_VectorLength"];
                        objNewRow["MTF_VectorAngle"] = SlideTable.Rows[i]["MTF_VectorAngle"];
                        objNewRow["MTF_VectorEff"] = SlideTable.Rows[i]["MTF_VectorEff"];
                        objNewTable.Rows.Add(objNewRow);

                    }
                    else
                    {

                        // 'Merge current row with previous one 

                        double prevSlideFootage = double.Parse(objPrevRow["Slide Footage"].ToString());
                        double currentSlideFootage = double.Parse(SlideTable.Rows[i]["Slide Footage"].ToString());
                        objPrevRow["To Depth"] = SlideTable.Rows[i]["To Depth"];
                        objPrevRow["To Date"] = SlideTable.Rows[i]["To Date"];
                        objPrevRow["Slide Footage"] = prevSlideFootage + currentSlideFootage;

                    }

                }

                SlideTable = objNewTable;

            }
            catch (Exception ex)
            {
            }
        }

        private List<adnlChannelData> getAdnlChannelsData(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings)
        {
            try
            {

                List<adnlChannelData> dataList = new List<adnlChannelData>();


                string wellboreId = "";
                string depthLogId = "";
                string lastError = "";

                VuMaxDR.Data.Objects.Well.getPrimaryDepthLog(ref paramRequest.objDataService, WellId, ref wellboreId, ref depthLogId);

                DepthLog objDepthLog = DepthLog.loadDepthLog(ref paramRequest.objDataService, WellId, wellboreId, depthLogId, ref lastError);


                if (objDepthLog == null)
                {
                    return dataList;
                }

                MnemonicMappingMgr objMgr = new MnemonicMappingMgr();
                objMgr.loadMappings(ref paramRequest.objDataService);

                string deltaMnemonic = "**DELTA**";

                //Build a query to retrieve data of all additional channels at once ...
                string channelList = "";


                foreach (ToolfaceChannel objChannel in objSettings.adnlChannels)
                {
                    objChannel.dataMnemonic = "";
                }


                foreach (ToolfaceChannel objChannel in objSettings.adnlChannels)
                {
                    if (objChannel.Mnemonic != deltaMnemonic)
                    {
                        if (objDepthLog.logCurves.ContainsKey(objChannel.Mnemonic))
                        {
                            //Nothing to do, assign it directly
                            objChannel.dataMnemonic = objChannel.Mnemonic;
                        }
                        else
                        {
                            string dataMnemonic = objMgr.getMappedMnemonic(objChannel.Mnemonic, objDepthLog.logCurves);

                            if (dataMnemonic.Trim() != "")
                            {
                                objChannel.dataMnemonic = dataMnemonic;
                            }
                        }
                    }
                }


                string fieldList = ",DEPTH";
                string aggrList = ",MAX(DEPTH) AS DEPTH";

                foreach (ToolfaceChannel objChannel in objSettings.adnlChannels)
                {
                    if (objChannel.dataMnemonic.Trim() != "")
                    {
                        fieldList = fieldList + ",[" + objChannel.dataMnemonic + "]";
                        aggrList = aggrList + ",AVG([" + objChannel.dataMnemonic + "]) AS [" + objChannel.dataMnemonic + "] ";
                    }
                }


                string strSQL = "";

                int RecordCount = 0;

                //Count no. of records in depth log table
                DataTable tmpData = paramRequest.objDataService.getTable("SELECT COUNT(*) AS COUNT FROM " + objDepthLog.__dataTableName + " WHERE DEPTH>=" + fromDepth.ToString() + " AND DEPTH<=" + toDepth.ToString() + "");

                if (tmpData != null)
                {
                    RecordCount = int.Parse(DataService.checkNull(tmpData.Rows[0]["COUNT"], 0).ToString());
                }


                int targetResolution = 4000;

                double Factor = 1;

                if (RecordCount < targetResolution)
                {
                    Factor = 1;
                }
                else
                {
                    Factor = Math.Ceiling((double)(RecordCount / targetResolution));
                }


                strSQL = "";

                strSQL = " ;WITH T AS ( ";
                strSQL += " SELECT RANK() OVER (ORDER BY DEPTH) Rank " + fieldList + " ";
                strSQL += " FROM " + objDepthLog.__dataTableName + " WHERE DEPTH>=" + fromDepth.ToString() + "  and DEPTH<=" + toDepth.ToString() + " ) ";
                strSQL += " SELECT (Rank-1) / " + Factor.ToString() + " DEPTH1" + aggrList + " ";
                strSQL += " FROM t ";
                strSQL += " GROUP BY ((Rank-1) / " + Factor.ToString() + " ) ";
                strSQL += " ORDER BY DEPTH ";

                DataTable objData = paramRequest.objDataService.getTable(strSQL);


                //Copy data to data list
                foreach (ToolfaceChannel objChannel in objSettings.adnlChannels)
                {
                    adnlChannelData objChannelData = new adnlChannelData();

                    objChannelData.Mnemonic = objChannel.Mnemonic;

                    DataTable channelData = new DataTable();
                    channelData.Columns.Add(new DataColumn("DEPTH", typeof(System.Double)));
                    channelData.Columns.Add(new DataColumn("VALUE", typeof(System.Double)));

                    //Nishant 28/07/2021
                    if (!objData.Columns.Contains(objChannel.dataMnemonic))
                    {
                        //no need to add that channel as its not in table
                        continue;
                    }

                    foreach (DataRow channelRow in objData.Rows)
                    {
                        DataRow newRow = channelData.NewRow();
                        newRow["DEPTH"] = channelRow["DEPTH"];
                        newRow["VALUE"] = channelRow[objChannel.dataMnemonic];

                        if (double.Parse(DataService.checkNull(channelRow[objChannel.dataMnemonic], 0).ToString()) >= 0)
                        {
                            channelData.Rows.Add(newRow);
                        }

                    }

                    objChannelData.Data = channelData;

                    dataList.Add(objChannelData);
                }


                foreach (ToolfaceChannel objChannel in objSettings.adnlChannels)
                {
                    if (objChannel.Mnemonic == deltaMnemonic)
                    {

                        adnlChannelData objChannelData = new adnlChannelData();

                        objChannelData.Mnemonic = objChannel.Mnemonic;
                        objChannelData.Data = getDeltaData(paramRequest, WellId, (float)fromDepth, (float)toDepth, fromDate, toDate, objSettings);

                        dataList.Add(objChannelData);
                    }
                }


                if (objData != null)
                {
                    objData.Dispose();
                }


                return dataList;

            }
            catch (Exception)
            {
                //Blank list with blank data
                return new List<adnlChannelData>();
            }
        }

        private DataTable getGTFData(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings, TimeLog objLog,out string paramWarnings)
        {
            paramWarnings = "";

            try
            {

                MnemonicMappingMgr objMgr = new MnemonicMappingMgr();


                string GTFMnemonic = "";


                if (objLog.logCurves.ContainsKey("GTF"))
                {
                    GTFMnemonic = "GTF";
                }
                else
                {
                    GTFMnemonic = objMgr.getMappedMnemonic("GTF");
                }


                if (GTFMnemonic.Trim() == "")
                {
                    paramWarnings = "GTF data not found";
                    return null;
                }

                string fieldList = ",DATETIME,HDTH," + GTFMnemonic;
                string aggrList = ",MAX(DATETIME) AS DATETIME,MAX(HDTH) AS DEPTH,MAX([" + GTFMnemonic + "]) AS [" + GTFMnemonic + "]";

                string strSQL = "";

                int RecordCount = 0;

                //Count no. of records in depth log table
                DataTable tmpData = paramRequest.objDataService.getTable("SELECT COUNT(*) AS COUNT FROM " + objLog.__dataTableName + " WHERE RIG_STATE IN (1,19) AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'");

                if (tmpData != null)
                {
                    RecordCount = int.Parse(DataService.checkNull(tmpData.Rows[0]["COUNT"], 0).ToString());
                }


                int targetResolution = 4000;

                double Factor = 1;

                if (RecordCount < 1000)
                {
                    Factor = 1;
                }
                else
                {

                    Factor = Math.Ceiling((double)(RecordCount / targetResolution));
                }


                strSQL = "";

                strSQL = " ;WITH T AS ( ";
                strSQL += " SELECT RANK() OVER (ORDER BY DATETIME) Rank " + fieldList + " ";
                strSQL += " FROM " + objLog.__dataTableName + " WHERE RIG_STATE IN (1,19) AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'  and DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ) ";
                strSQL += " SELECT (Rank-1) / " + Factor.ToString() + " DATETIME1" + aggrList + " ";
                strSQL += " FROM t ";
                strSQL += " GROUP BY ((Rank-1) / " + Factor.ToString() + " ) ";
                strSQL += " ORDER BY DATETIME ";

                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                if (objData != null)
                {

                    DataTable gtfData = new DataTable();
                    gtfData.Columns.Add(new DataColumn("DEPTH", typeof(System.Double)));
                    gtfData.Columns.Add(new DataColumn("GTF", typeof(System.Double)));


                    //Prepare a table
                    foreach (DataRow gtfRow in objData.Rows)
                    {

                        double depth = double.Parse(DataService.checkNull(gtfRow["DEPTH"], 0).ToString());
                        double GTF = double.Parse(DataService.checkNull(gtfRow[GTFMnemonic], -999.25).ToString());

                        if (depth > 0 && GTF != -999.25)
                        {
                            if (GTF > 180)
                            {
                                GTF = GTF - 180;
                            }

                            DataRow newRow = gtfData.NewRow();
                            newRow["DEPTH"] = depth;
                            newRow["GTF"] = GTF;
                            gtfData.Rows.Add(newRow);
                        }

                    }


                    if (objData != null)
                    {
                        objData.Dispose();
                    }

                    return gtfData;

                }


                return null;

            }
            catch (Exception)
            {
                return null;
            }
        }

        private DataTable getMTFData(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings, TimeLog objLog,out string paramWarnings)
        {
            paramWarnings = "";

            try
            {

                MnemonicMappingMgr objMgr = new MnemonicMappingMgr();

                string MTFMnemonic = "";

                if (objLog.logCurves.ContainsKey("MTF"))
                {
                    MTFMnemonic = "MTF";
                }
                else
                {
                    MTFMnemonic = objMgr.getMappedMnemonic("MTF");
                }


                if (MTFMnemonic.Trim() == "")
                {
                    paramWarnings = "MTF data not found";
                    return null;
                }

                string fieldList = ",DATETIME,HDTH," + MTFMnemonic;
                string aggrList = ",MAX(DATETIME) AS DATETIME,MAX(HDTH) AS DEPTH,MAX([" + MTFMnemonic + "]) AS [" + MTFMnemonic + "]";

                string strSQL = "";

                int RecordCount = 0;

                //Count no. of records in depth log table
                DataTable tmpData = paramRequest.objDataService.getTable("SELECT COUNT(*) AS COUNT FROM " + objLog.__dataTableName + " WHERE RIG_STATE IN (1,19) AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'");

                if (tmpData != null)
                {
                    RecordCount = int.Parse(DataService.checkNull(tmpData.Rows[0]["COUNT"], 0).ToString());
                }


                int targetResolution = 4000;

                double Factor = 1;

                if (RecordCount < 1000)
                {
                    Factor = 1;
                }
                else
                {

                    Factor = Math.Ceiling((double)(RecordCount / targetResolution));
                }


                strSQL = "";

                strSQL = " ;WITH T AS ( ";
                strSQL += " SELECT RANK() OVER (ORDER BY DATETIME) Rank " + fieldList + " ";
                strSQL += " FROM " + objLog.__dataTableName + " WHERE RIG_STATE IN (1,19) AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'  and DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ) ";
                strSQL += " SELECT (Rank-1) / " + Factor.ToString() + " DATETIME1" + aggrList + " ";
                strSQL += " FROM t ";
                strSQL += " GROUP BY ((Rank-1) / " + Factor.ToString() + " ) ";
                strSQL += " ORDER BY DATETIME ";

                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                if (objData != null)
                {

                    DataTable mtfData = new DataTable();
                    mtfData.Columns.Add(new DataColumn("DEPTH", typeof(System.Double)));
                    mtfData.Columns.Add(new DataColumn("MTF", typeof(System.Double)));


                    //Prepare a table
                    foreach (DataRow mtfRow in objData.Rows)
                    {

                        double depth = double.Parse(DataService.checkNull(mtfRow["DEPTH"], 0).ToString());
                        double MTF = double.Parse(DataService.checkNull(mtfRow[MTFMnemonic], -999.25).ToString());

                        if (depth > 0 && MTF != -999.25)
                        {

                            if (MTF > 180)
                            {
                                MTF = MTF - 180;
                            }


                            DataRow newRow = mtfData.NewRow();
                            newRow["DEPTH"] = depth;
                            newRow["MTF"] = MTF;
                            mtfData.Rows.Add(newRow);
                        }

                    }


                    if (objData != null)
                    {
                        objData.Dispose();
                    }

                    return mtfData;

                }


                return null;

            }
            catch (Exception)
            {
                return null;
            }
        }


        public double getRigStateDistancePercentage(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings, TimeLog objTimeLog, string rigStates)
        {
            try
            {
                double sumDepth = 0d;
                double TotalFootage = 0d;
                string dataTableName = objTimeLog.__dataTableName;

                string strSQL = "";
                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE NEXT_DEPTH>0 AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND NEXT_DEPTH>0 AND HDTH>=0";
                TotalFootage = double.Parse(DataService.checkNull(paramRequest.objDataService.getValueFromDatabase(strSQL), 0).ToString());

                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE RIG_STATE IN (" + rigStates + ") AND NEXT_DEPTH>0 AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND NEXT_DEPTH>0 AND HDTH>=0";
                sumDepth = double.Parse(DataService.checkNull(paramRequest.objDataService.getValueFromDatabase(strSQL), 0).ToString());

                double Percentage = Math.Round(sumDepth * 100d / TotalFootage, 2);

                return Percentage;
            }
            catch (Exception ex)
            {
                return 0d;
            }
        }


        public DataTable getRotarySections(Broker.BrokerRequest paramRequest, string WellId, double fromDepth, double toDepth, DateTime fromDate, DateTime toDate, ToolfaceSettings objSettings, TimeLog objTimeLog)
        {
            try
            {

                DataTable rotaryData = new DataTable();
                rotaryData.Columns.Add(new DataColumn("FROM_DEPTH", typeof(System.Double)));
                rotaryData.Columns.Add(new DataColumn("TO_DEPTH", typeof(System.Double)));

                string strSQL = "";

                strSQL = "SELECT ROUND(HDTH,3) AS HDTH,MIN(RIG_STATE) AS RIG_STATE FROM " + objTimeLog.__dataTableName + " WHERE RIG_STATE IN (0,1,19)  AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " GROUP BY ROUND(HDTH,3) ORDER BY ROUND(HDTH,3)";

                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                bool recordingStarted = false;
                double startDepth = 0;

                for (int i = 0; i < objData.Rows.Count; i++)
                {

                    double lnHdth = double.Parse(DataService.checkNull(objData.Rows[i]["HDTH"], 0).ToString());
                    double lnRigState = double.Parse(DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0).ToString());

                    if (lnRigState == 0)
                    {
                        if (!recordingStarted)
                        {
                            recordingStarted = true;
                            startDepth = lnHdth;
                        }
                    }

                    if (lnRigState != 0)
                    {

                        if (recordingStarted)
                        {
                            //Close here
                            recordingStarted = false;




                            //Insert new row here
                            DataRow objNewRow = rotaryData.NewRow();
                            objNewRow["FROM_DEPTH"] = startDepth;
                            objNewRow["TO_DEPTH"] = lnHdth;


                            bool continueAdd = true;

                            double rotaryFootage = lnHdth - startDepth;

                            if (objSettings.MinRotationFootage > 0)
                            {
                                if (rotaryFootage >= objSettings.MinRotationFootage)
                                {
                                    //Continue
                                }
                                else
                                {
                                    continueAdd = false;
                                }
                            }

                            if (continueAdd)
                            {
                                rotaryData.Rows.Add(objNewRow);
                            }

                        }
                    }
                }


                if (recordingStarted)
                {

                    DataRow objNewRow = rotaryData.NewRow();
                    objNewRow["FROM_DEPTH"] = startDepth;
                    objNewRow["TO_DEPTH"] = double.Parse(DataService.checkNull(objData.Rows[objData.Rows.Count - 1]["HDTH"], 0).ToString());

                    double lnHdth = double.Parse(DataService.checkNull(objData.Rows[objData.Rows.Count - 1]["HDTH"], 0).ToString());

                    bool continueAdd = true;

                    double rotaryFootage = lnHdth - startDepth;

                    if (objSettings.MinRotationFootage > 0)
                    {
                        if (rotaryFootage >= objSettings.MinRotationFootage)
                        {
                            //Continue
                        }
                        else
                        {
                            continueAdd = false;
                        }
                    }

                    if (continueAdd)
                    {
                        rotaryData.Rows.Add(objNewRow);
                    }

                }

                if (objData != null)
                {
                    objData.Dispose();
                }

                return rotaryData;

            }
            catch (Exception ex)
            {
                return new DataTable();
            }
        }


        //get Date from Depth Range
        private void getDateRangeFromDepth(Broker.BrokerRequest paramRequest, double paramFromDepth, double paramToDepth, ref DateTime paramFromDate, ref DateTime paramToDate)
        {
            DateTime limitFromDate = new DateTime();
            DateTime limitToDate = new DateTime();
            getDateRangeFromSideTrack(paramRequest, ref limitFromDate, ref limitToDate);

            string dataTableName = objTimeLog.getDataTableName(ref paramRequest.objDataService);
            string strSQL = "";
            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + paramFromDepth.ToString() + " ORDER BY DATETIME";
            DataTable objData = paramRequest.objDataService.getTable(strSQL);
            if (objData.Rows.Count > 0)
            {
                paramFromDate = Convert.ToDateTime(objData.Rows[0]["DATETIME"]);
            }

            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH<=" + paramToDepth.ToString() + " ORDER BY DATETIME DESC";
            objData = paramRequest.objDataService.getTable(strSQL);
            if (objData.Rows.Count > 0)
            {
                paramToDate = Convert.ToDateTime(objData.Rows[0]["DATETIME"]);
            }

        }


        //getDateRangeFromSideTrack
        private void getDateRangeFromSideTrack(Broker.BrokerRequest paramRequest, ref DateTime paramFromDate, ref DateTime paramToDate)
        {
            try
            {

                if (SideTrackKey == "-999")
                {
                    if (objTimeLog.sideTracks.Count == 0)
                    {
                        paramFromDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramRequest.objDataService));
                        paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref paramRequest.objDataService));
                    }

                    if (objTimeLog.sideTracks.Count > 0)
                    {
                        paramFromDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramRequest.objDataService));

                        DataTable objData = paramRequest.objDataService.getTable("select top 1 * from VMX_TIME_LOG_SIDETRACKS where WELL_ID='" + objTimeLog.WellID + "' AND WELLBORE_ID='" + objTimeLog.WellboreID + "' AND LOG_ID='" + objTimeLog.ObjectID + "' AND TYPE=0 ORDER BY SIDETRACK_DATE");

                        if (objData.Rows.Count > 0)
                        {
                            paramToDate = Convert.ToDateTime(objData.Rows[0]["SIDETRACK_DATE"].ToString());
                        }
                        else
                        {
                            //There must be a hole depth reset...mark the to date as last date
                            paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref paramRequest.objDataService));
                        }

                    }
                }

                if (SideTrackKey != "-999")
                {
                    paramFromDate = DateTime.FromOADate(Convert.ToDouble(objTimeLog.sideTracks[SideTrackKey].DateTime));
                    paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref paramRequest.objDataService));
                }


            }
            catch (Exception ex)
            {

            }


        }
    }
}
