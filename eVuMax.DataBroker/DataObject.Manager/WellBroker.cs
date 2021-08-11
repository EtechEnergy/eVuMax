using eVuMax.DataBroker.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Common;
using VuMaxDR.Data.Objects;



namespace eVuMax.DataBroker.DataObject
{


    //Nishant 28-05-2020
    public class WellBroker : IBroker
    {
        #region "FunctionConstants"
        private const string LoadWellStructure_ = "LoadWellStructure";
        private const string LoadWellObject_ = "LoadWellObject";
        private const string getOffSetWells_ = "getOffSetWells";
        private const string getWellbores_ = "getWellbores";
        private const string getTimeLogs_ = "getTimeLogs";
        private const string getDepthLogs_ = "getDepthLogs";
        private const string getTrajectories_ = "getTrajectories";
        private const string getMudLogs_ = "getMudLogs";

        private const string loadTimeLog_ = "loadTimeLog"; //Nishant 09-06-2020
        private const string loadDepthLog_ = "loadDepthLog"; //Nishant 09-06-2020
        private const string loadMudLog_ = "loadMudLog"; //Nishant 09-06-2020
        private const string loadPlanTrajectory_ = "loadPlanTrajectory"; //Nishant 09-06-2020
        private const string loadActualTrajectory_ = "loadActualTrajectory"; //Nishant 09-06-2020

        private const string updateTimelog_ = "updateTimelog";// Nishant 24-07-2020

        private const string calculateTrajQC_ = "calculateTrajQC"; // Nishant 23-09-2020


        private const string UpdateWell_ = "UpdateWell";

        //Nishant 13-06-2020
        private const string getTable_ = "getTable";
        //Nishant 20-06-2020
        private const string updateTrajectory_ = "UpdateTrajectory";
        //Nishant 27-06-2020
        private const string updateMudLog_ = "UpdateMudLog";

        //Nishant 31-07-2020
        private const string updateDepthLog_ = "UpdateDepthLog";

        //Nishant 04-08-2020
        private const string removeObject_ = "RemoveObject";

        private const string getDownloadStatus_ = "getDownloadStatus";

        private const string stopDownload_ = "stopDownload";

        //Nishant 06-10-2020
        private const string loadUnitProfile_ = "loadUnitProfile";
        private const string getUnitProfileList_ = "getUnitProfileList";

        #endregion

        string lastError = "";
        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {
                //Nishant 06-10-2020
                if (paramRequest.Function == loadUnitProfile_)
                {
                    return getUnitProfile(paramRequest);
                }
                //Nishant 06-10-2020
                if (paramRequest.Function == getUnitProfileList_)
                {
                    return getUnitProfileList(paramRequest);
                }
                //**************

                //Nishant 27-06-2020
                if (paramRequest.Function == updateMudLog_)
                {
                    return UpdateMudLog(paramRequest);
                }

                //Nishant 13-06-2020
                if (paramRequest.Function == getTable_)
                {
                    return getTable(paramRequest);
                }
                //Nishant 09-06-2020
                if (paramRequest.Function == loadTimeLog_)
                {
                    return loadTimeLog(paramRequest);
                }

                if (paramRequest.Function == loadDepthLog_)
                {
                    return loadDepthLog(paramRequest);
                }

                if (paramRequest.Function == loadMudLog_)
                {
                    return loadMugLog(paramRequest);
                }

                if (paramRequest.Function == loadActualTrajectory_)
                {
                    return loadActualTrajectory(paramRequest);
                }

                if (paramRequest.Function == loadPlanTrajectory_)
                {
                    return loadPlanTrajectory(paramRequest);
                }

                //**********

                if (paramRequest.Function == getMudLogs_)
                {
                    return getMudLogs(paramRequest);
                }
                if (paramRequest.Function == getTrajectories_)
                {
                    return getTrajectories(paramRequest);
                }
                if (paramRequest.Function == getDepthLogs_)
                {
                    return getDepthLogs(paramRequest);
                }
                if (paramRequest.Function == getTimeLogs_)
                {
                    return getTimeLogs(paramRequest);
                }
                if (paramRequest.Function == getWellbores_)
                {
                    return getWellbores(paramRequest);
                }
                if (paramRequest.Function == LoadWellObject_)
                {

                }

                if (paramRequest.Function == getOffSetWells_)
                {
                    return getOffSetWells(paramRequest);
                }

                if (paramRequest.Function == LoadWellStructure_)
                {
                    return loadWellStructure(paramRequest);
                }

                if (paramRequest.Function == getDownloadStatus_)
                {
                    return getDownloadStatus(paramRequest);
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

                if (paramRequest.Function == UpdateWell_)
                {
                    return UpdateWell(paramRequest);
                }


                //Nishant 20-06-2020
                if (paramRequest.Function == updateTrajectory_)
                {
                    return UpdateTrajectory(paramRequest);
                }

                //Nishant 02-07-2020
                if (paramRequest.Function == updateMudLog_)
                {
                    return UpdateMudLog(paramRequest);
                }

                //Nishant 27-07-2020
                if (paramRequest.Function == updateTimelog_)
                {
                    return updateTimelog(paramRequest);
                }

                if (paramRequest.Function == updateDepthLog_)
                {
                    return updateDepthLog(paramRequest);
                }


                //Nishant 04-08-2020
                if (paramRequest.Function == removeObject_)
                {
                    return RemoveObject(paramRequest);
                }

                //Nishant 07-08-2020
                if (paramRequest.Function == stopDownload_)
                {
                    this.stopDownload(paramRequest);
                }

                //Nishant 23-09-2020
                if (paramRequest.Function == calculateTrajQC_)
                {
                    return calculateTrajQC(paramRequest);
                }

                //**********


                //No matching function found ...
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse = paramRequest.createResponseObject();
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


        #region "load Object Functions"

        private Broker.BrokerResponse getTable(Broker.BrokerRequest paramRequest)
        {
            try
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string strSQL = "";


                if (paramRequest.Parameters.Count > 0)
                {
                    strSQL = @paramRequest.Parameters.Where(x => x.ParamName.Contains("strSQL")).FirstOrDefault().ParamValue;


                }
                if (strSQL == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: one of the required parameter strSQL is missing/ blank";
                    objResponse.Response = "";
                    return objResponse;

                }

                DataTable objData = new DataTable();
                objData = paramRequest.objDataService.getTable(strSQL);

                if (objData != null)
                {
                    objResponse.Response = JsonConvert.SerializeObject(objData);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }
        }
        private Broker.BrokerResponse loadTimeLog(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";
                string wellBoreID = "";
                string logID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                    wellBoreID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellBoreID")).FirstOrDefault().ParamValue;
                    logID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("logID")).FirstOrDefault().ParamValue;

                }
                if (wellID == "" || wellBoreID == "" || logID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: one of the required parameter is missing/ blank";
                    objResponse.Response = "";
                    return objResponse;

                }

                TimeLog objTimeLog = new TimeLog();
                objTimeLog = TimeLog.loadTimeLog(ref paramRequest.objDataService, wellID, wellBoreID, logID, ref lastError);
                if (objTimeLog != null)
                {
                    objResponse.Response = JsonConvert.SerializeObject(objTimeLog);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }
        }

        private Broker.BrokerResponse loadDepthLog(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";
                string wellBoreID = "";
                string logID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                    wellBoreID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellBoreID")).FirstOrDefault().ParamValue;
                    logID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("logID")).FirstOrDefault().ParamValue;

                }
                if (wellID == "" || wellBoreID == "" || logID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: one of the required parameter is missing/ blank";
                    objResponse.Response = "";
                    return objResponse;

                }

                DepthLog objDepthLog = new DepthLog();
                objDepthLog = DepthLog.loadDepthLog(ref paramRequest.objDataService, wellID, wellBoreID, logID, ref lastError);
                if (objDepthLog != null)
                {
                    objResponse.Response = JsonConvert.SerializeObject(objDepthLog);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }
        }

        private Broker.BrokerResponse loadMugLog(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";
                string wellBoreID = "";
                string logID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                    wellBoreID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellBoreID")).FirstOrDefault().ParamValue;
                    logID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("logID")).FirstOrDefault().ParamValue;

                }
                if (wellID == "" || wellBoreID == "" || logID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: one of the required parameter is missing/ blank";
                    objResponse.Response = "";
                    return objResponse;

                }

                mudLog objMudLog = new mudLog();
                objMudLog = mudLog.loadMudLog(paramRequest.objDataService, wellID, wellBoreID, logID);
                if (objMudLog != null)
                {
                    objResponse.Response = JsonConvert.SerializeObject(objMudLog);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }
        }

        private Broker.BrokerResponse loadActualTrajectory(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                }
                if (wellID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: one of the required parameter is missing/ blank";
                    objResponse.Response = "";
                    return objResponse;

                }

                Trajectory objTrajectory = new Trajectory();
                objTrajectory = Trajectory.loadActualTrajectory(ref paramRequest.objDataService, wellID);
                if (objTrajectory != null)
                {
                    objResponse.Response = JsonConvert.SerializeObject(objTrajectory);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }
        }

        private Broker.BrokerResponse loadPlanTrajectory(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                }
                if (wellID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: one of the required parameter is missing/ blank";
                    objResponse.Response = "";
                    return objResponse;

                }

                Trajectory objTrajectory = new Trajectory();
                objTrajectory = Trajectory.loadPlanTrajectory(ref paramRequest.objDataService, wellID);
                if (objTrajectory != null)
                {
                    objResponse.Response = JsonConvert.SerializeObject(objTrajectory);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }
        }


        #endregion

        #region "getData Functions"


        //Nishant 06-10-2020
        private Broker.BrokerResponse getUnitProfileList(Broker.BrokerRequest paramRequest)
        {

            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();




                Dictionary<int, UnitProfile> List = new Dictionary<int, UnitProfile>();
                List = UnitProfile.getList(ref paramRequest.objDataService);
                if (List != null || List.Count > 0)
                {
                    objResponse.Response = JsonConvert.SerializeObject(List);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }


        }

        private Broker.BrokerResponse getUnitProfile(Broker.BrokerRequest paramRequest)
        {

            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();


                string profileID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    profileID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("profileID")).FirstOrDefault().ParamValue;

                }
                //profileID is blank in DB

                //if (profileID == "")
                //{
                //    objResponse.RequestSuccessfull = false;
                //    objResponse.Errors = "Error retrieving data: one of the required parameter is missing/ blank";
                //    objResponse.Response = "";
                //    return objResponse;

                //}

                UnitProfile objProfile = new UnitProfile();
                objProfile = UnitProfile.loadProfile(ref paramRequest.objDataService, profileID);



                if (objProfile != null)
                {

                    objResponse.Response = JsonConvert.SerializeObject(objProfile);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }


        }

        private Broker.BrokerResponse getMudLogs(Broker.BrokerRequest paramRequest)
        {

            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";
                string wellBoreID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                    wellBoreID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellBoreID")).FirstOrDefault().ParamValue;

                }
                if (wellID == "" || wellBoreID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: one of the required parameter is missing/ blank";
                    objResponse.Response = "";
                    return objResponse;

                }
                string strSQL = "SELECT MUD_LOG_ID,LOG_NAME FROM VMX_MUD_LOG WHERE WELL_ID='" + wellID + "' AND WELLBORE_ID='" + wellBoreID + "'";
                DataTable objData = new DataTable();
                objData = paramRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {

                    objResponse.Response = JsonConvert.SerializeObject(objData);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }


        }
        private Broker.BrokerResponse getTrajectories(Broker.BrokerRequest paramRequest)
        {

            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";
                string wellBoreID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                    wellBoreID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellBoreID")).FirstOrDefault().ParamValue;

                }
                if (wellID == "" || wellBoreID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: one of the required parameter is missing/ blank";
                    objResponse.Response = "";
                    return objResponse;

                }
                string strSQL = "SELECT TRAJ_ID, NAME FROM VMX_TRAJ_HEADER WHERE WELL_ID='" + wellID + "' AND WELLBORE_ID='" + wellBoreID + "'";
                DataTable objData = new DataTable();
                objData = paramRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {

                    objResponse.Response = JsonConvert.SerializeObject(objData);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }


        }
        private Broker.BrokerResponse getDepthLogs(Broker.BrokerRequest paramRequest)
        {

            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";
                string wellBoreID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                    wellBoreID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellBoreID")).FirstOrDefault().ParamValue;

                }
                if (wellID == "" || wellBoreID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: one of the required parameter is missing/ blank";
                    objResponse.Response = "";
                    return objResponse;

                }
                string strSQL = "SELECT LOG_ID, LOG_NAME FROM VMX_DEPTH_LOG WHERE WELL_ID='" + wellID + "' AND WELLBORE_ID='" + wellBoreID + "'";
                DataTable objData = new DataTable();
                objData = paramRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {

                    objResponse.Response = JsonConvert.SerializeObject(objData);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }


        }
        private Broker.BrokerResponse getTimeLogs(Broker.BrokerRequest paramRequest)
        {

            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";
                string wellBoreID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                    wellBoreID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("wellBoreID")).FirstOrDefault().ParamValue;

                }
                if (wellID == "" || wellBoreID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: one of the required parameter is missing/ blank";
                    objResponse.Response = "";
                    return objResponse;

                }
                string strSQL = "SELECT LOG_ID, LOG_NAME FROM VMX_TIME_LOG WHERE WELL_ID='" + wellID + "' AND WELLBORE_ID='" + wellBoreID + "'";
                DataTable objData = new DataTable();
                objData = paramRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {

                    objResponse.Response = JsonConvert.SerializeObject(objData);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }


        }

        private Broker.BrokerResponse getWellbores(Broker.BrokerRequest paramRequest)
        {

            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";

                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = paramRequest.Parameters[0].ParamValue;
                }
                if (wellID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: Well ID is Blank";
                    objResponse.Response = "";
                    return objResponse;

                }
                string strSQL = "SELECT WELLBORE_ID, WELLBORE_NAME FROM VMX_WELLBORE WHERE WELL_ID='" + wellID + "'";
                DataTable objData = new DataTable();
                objData = paramRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {

                    objResponse.Response = JsonConvert.SerializeObject(objData);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }


        }
        private Broker.BrokerResponse getOffSetWells(Broker.BrokerRequest paramRequest)
        {
            try
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";// "us_1395675560"; //having offset Well(s)
                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = paramRequest.Parameters[0].ParamValue;
                }
                if (wellID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: Well ID is Blank";
                    objResponse.Response = "";
                    return objResponse;

                }

                DataTable objData = new DataTable();

                objData = paramRequest.objDataService.getTable("select A.OFFSET_WELL_ID, A.OFFSET_WELL_UWI,B.WELL_NAME from VMX_WELL_OFFSET A, VMX_WELL B  WHERE A.OFFSET_WELL_ID = B.WELL_ID AND A.WELL_ID = '" + wellID + "'");

                if (objData.Rows.Count > 0)
                {

                    objResponse.Response = JsonConvert.SerializeObject(objData);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data. " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }

        }
        private Broker.BrokerResponse loadWellStructure(Broker.BrokerRequest paramRequest)
        {
            try
            {
                //TO-DO -- Validate the user with or without AD Integration and return the resultgetAlarmHistoryTable
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";// "us_1395675560"; //having offset Well(s)
                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = paramRequest.Parameters[0].ParamValue;
                }
                if (wellID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: Well ID is Blank";
                    objResponse.Response = "";
                    return objResponse;

                }

                VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
                objWell = VuMaxDR.Data.Objects.Well.loadWellStructure(ref paramRequest.objDataService, wellID);

                if (objWell != null)
                {
                    objResponse.Response = JsonConvert.SerializeObject(objWell);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data:(ObjWell!=null) " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data... " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }

        }

        private Broker.BrokerResponse loadWellObject(Broker.BrokerRequest paramRequest) //Nishant 05-06-2020
        {
            try
            {
                //TO-DO -- Validate the user with or without AD Integration and return the result
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string wellID = "";// "us_1395675560"; //having offset Well(s)
                if (paramRequest.Parameters.Count > 0)
                {
                    wellID = paramRequest.Parameters[0].ParamValue;
                }
                if (wellID == "")
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data: Well ID is Blank";
                    objResponse.Response = "";
                    return objResponse;

                }

                VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
                objWell = VuMaxDR.Data.Objects.Well.loadObject(ref paramRequest.objDataService, wellID, ref lastError);

                if (objWell != null)
                {

                    objResponse.Response = JsonConvert.SerializeObject(objWell);
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data (objWell != Null): " + lastError;
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data... " + ex.Message + ex.StackTrace;
                objResponse.Response = "";
                return objResponse;
            }

        }


        //Nishant 06-08-2020
        private Broker.BrokerResponse getDownloadStatus(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                string userID = "";
                string WellID = "";
                DataTable objData = new DataTable();

                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                    WellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }



                string strSQL = "";
                strSQL = "SELECT A.*, B.DETAILS, B.LOG_SEQ,B.EVENT_TYPE,B.EVENT_TITLE,B.DATETIME FROM VMX_DL_OPERATIONS A LEFT JOIN VMX_DL_LOG B ON A.OP_SEQ = B.OP_SEQ WHERE A.WELL_ID ='" + WellID + "' ORDER BY LAST_DATA_RECEIVED";
                //  strSQL = "SELECT * FROM  VMX_DL_OPERATIONS WHERE WELL_ID = '" + WellID + "' ORDER BY LAST_DATA_RECEIVED";
                objData = paramRequest.objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                {

                    objData.Columns.Add(new DataColumn("LOGTYPE", typeof(System.String)));
                    objData.Columns.Add(new DataColumn("LOG_NAME", typeof(System.String)));

                    objData.Columns.Add(new DataColumn("LAST_INDEX", typeof(System.String)));
                    objData.Columns.Add(new DataColumn("LAST_DATA", typeof(System.String)));
                    objData.Columns.Add(new DataColumn("LAST_RESPONSE", typeof(System.String)));

                    //GET LOG TYPE
                    foreach (DataRow objRow in objData.Rows)
                    {
                        objRow["LOGTYPE"] = "unknown";
                        objRow["LOG_NAME"] = "unknown";



                        if (paramRequest.objDataService.IsRecordExist("SELECT * FROM VMX_TIME_LOG WHERE WELL_ID = '" + objRow["WELL_ID"].ToString() + "' AND WELLBORE_ID='" + objRow["WELLBORE_ID"].ToString() + "' AND WELL_ID='" + objRow["WELL_ID"].ToString() + "' AND LOG_ID='" + objRow["LOG_ID"].ToString() + "'"))
                        {
                            objRow["LOGTYPE"] = "TimeLog";
                            string logName = paramRequest.objDataService.getValueFromDatabase("SELECT LOG_NAME FROM VMX_TIME_LOG WHERE WELL_ID = '" + objRow["WELL_ID"].ToString() + "' AND WELLBORE_ID='" + objRow["WELLBORE_ID"].ToString() + "' AND WELL_ID='" + objRow["WELL_ID"].ToString() + "' AND LOG_ID='" + objRow["LOG_ID"].ToString() + "'").ToString();
                            objRow["LOG_NAME"] = logName;

                            string TimeLogLastIndex = "";
                            string TimeLogLastData = "";
                            string TimeLogLastResponse = "";
                            getTimeLogDiagnostics(WellID, objRow["WELLBORE_ID"].ToString(), objRow["LOG_ID"].ToString(), paramRequest, out TimeLogLastIndex, out TimeLogLastData, out TimeLogLastResponse);

                            objRow["LAST_INDEX"] = TimeLogLastIndex;
                            objRow["LAST_DATA"] = TimeLogLastData;
                            objRow["LAST_RESPONSE"] = TimeLogLastResponse;

                            continue;
                        }
                        if (paramRequest.objDataService.IsRecordExist("SELECT * FROM VMX_DEPTH_LOG WHERE WELL_ID = '" + objRow["WELL_ID"].ToString() + "' AND WELLBORE_ID='" + objRow["WELLBORE_ID"].ToString() + "' AND WELL_ID='" + objRow["WELL_ID"].ToString() + "' AND LOG_ID='" + objRow["LOG_ID"].ToString() + "'"))
                        {
                            objRow["LOGTYPE"] = "DepthLog";
                            string logName = paramRequest.objDataService.getValueFromDatabase("SELECT LOG_NAME FROM VMX_DEPTH_LOG WHERE WELL_ID = '" + objRow["WELL_ID"].ToString() + "' AND WELLBORE_ID='" + objRow["WELLBORE_ID"].ToString() + "' AND WELL_ID='" + objRow["WELL_ID"].ToString() + "' AND LOG_ID='" + objRow["LOG_ID"].ToString() + "'").ToString();
                            objRow["LOG_NAME"] = logName;

                            string lblDepthLogLastIndex = "";
                            string lblDepthLogLastData = "";
                            string lblDepthLogLastResponse = "";
                            GetDepthLogDiagnostics(WellID, objRow["WELLBORE_ID"].ToString(), objRow["LOG_ID"].ToString(), paramRequest, out lblDepthLogLastIndex, out lblDepthLogLastData, out lblDepthLogLastResponse);

                            objRow["LAST_INDEX"] = lblDepthLogLastIndex;
                            objRow["LAST_DATA"] = lblDepthLogLastData;
                            objRow["LAST_RESPONSE"] = lblDepthLogLastResponse;


                            continue;
                        }
                        if (paramRequest.objDataService.IsRecordExist("SELECT * FROM VMX_TRAJ_HEADER WHERE WELL_ID = '" + objRow["WELL_ID"].ToString() + "' AND WELLBORE_ID='" + objRow["WELLBORE_ID"].ToString() + "' AND WELL_ID='" + objRow["WELL_ID"].ToString() + "' AND TRAJ_ID='" + objRow["TRAJ_ID"].ToString() + "'"))
                        {
                            objRow["LOGTYPE"] = "Trajectory";
                            string logName = paramRequest.objDataService.getValueFromDatabase("SELECT NAME FROM VMX_TRAJ_HEADER WHERE WELL_ID = '" + objRow["WELL_ID"].ToString() + "' AND WELLBORE_ID='" + objRow["WELLBORE_ID"].ToString() + "' AND WELL_ID='" + objRow["WELL_ID"].ToString() + "' AND TRAJ_ID='" + objRow["TRAJ_ID"].ToString() + "'").ToString();
                            objRow["LOG_NAME"] = logName;

                            string lblTrajLastData = "";
                            string lblTrajLastResponse = "";
                            string lblTrajLastIndex = "";

                            getTrajectoryDiagnostics(WellID, objRow["WELLBORE_ID"].ToString(), objRow["LOG_ID"].ToString(), paramRequest, out lblTrajLastData, out lblTrajLastResponse, out lblTrajLastIndex);

                            objRow["LAST_INDEX"] = lblTrajLastIndex;
                            objRow["LAST_DATA"] = lblTrajLastData;
                            objRow["LAST_RESPONSE"] = lblTrajLastResponse;

                            continue;
                        }

                        if (paramRequest.objDataService.IsRecordExist("SELECT * FROM VMX_MUD_LOG WHERE WELL_ID = '" + objRow["WELL_ID"].ToString() + "' AND WELLBORE_ID='" + objRow["WELLBORE_ID"].ToString() + "' AND WELL_ID='" + objRow["WELL_ID"].ToString() + "' AND MUD_LOG_ID='" + objRow["LOG_ID"].ToString() + "'"))
                        {
                            objRow["LOGTYPE"] = "Mud Log";
                            string logName = paramRequest.objDataService.getValueFromDatabase("SELECT LOG_NAME FROM VMX_MUD_LOG WHERE WELL_ID = '" + objRow["WELL_ID"].ToString() + "' AND WELLBORE_ID='" + objRow["WELLBORE_ID"].ToString() + "' AND WELL_ID='" + objRow["WELL_ID"].ToString() + "' AND MUD_LOG_ID='" + objRow["LOG_ID"].ToString() + "'").ToString();
                            objRow["LOG_NAME"] = logName;
                            continue;
                        }
                    }

                    objData.DefaultView.Sort = "LOGTYPE";
                    objResponse.Response = JsonConvert.SerializeObject(objData);
                    return objResponse;
                }

                //no data found
                objData.Columns.Add(new DataColumn("LOGTYPE", typeof(System.String)));
                objData.Columns.Add(new DataColumn("LOG_NAME", typeof(System.String)));

                objData.Columns.Add(new DataColumn("LAST_INDEX", typeof(System.String)));
                objData.Columns.Add(new DataColumn("LAST_DATA", typeof(System.String)));
                objData.Columns.Add(new DataColumn("LAST_RESPONSE", typeof(System.String)));


                objData.DefaultView.Sort = "LOGTYPE";
                objResponse.Response = JsonConvert.SerializeObject(objData);
                return objResponse;
            }

            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                objResponse.RequestSuccessfull = false;
                return objResponse;
            }

        }


        //Nishant 08-08-2020

        private void getTrajectoryDiagnostics(string SelectedWellID, string WellboreID, string LogID, Broker.BrokerRequest paramRequest, out string lblTrajLastData, out string lblTrajLastResponse, out string lblTrajLastIndex)
        {
            try
            {


                DataTable objData;

                DateTime LastDataTime = new DateTime();
                DateTime LastResponseTime = new DateTime();
                double LastIndex = 0;


                string sWellID = SelectedWellID;
                string sWellboreID = WellboreID;

                lblTrajLastData = "";
                lblTrajLastResponse = "";
                lblTrajLastIndex = "";

                VuMaxDR.Data.DataService objProcessConn3 = new VuMaxDR.Data.DataService(paramRequest.objDataService.ConnectionString);

                // '**************************************************************************************************************************************''
                objData = objProcessConn3.getTable("SELECT LOG_ID,OP_SEQ,LAST_RESPONSE_TIME FROM VMX_DL_OPERATIONS WITH(NOLOCK) WHERE WELL_ID='" + sWellID + "' AND WELLBORE_ID='" + sWellboreID + "' AND OP_TYPE IN (21) ORDER BY LAST_DATA_RECEIVED DESC");

                if (objData.Rows.Count > 0)
                {
                    LastResponseTime = Convert.ToDateTime(DataService.checkNull(objData.Rows[0]["LAST_RESPONSE_TIME"], new DateTime()));
                    LogID = DataService.checkNull(objData.Rows[0]["LOG_ID"], "").ToString();

                    objData = objProcessConn3.getTable("SELECT LAST_DATA_RECEIVED_ON FROM VMX_TRAJ_HEADER WITH(NOLOCK) WHERE WELL_ID='" + sWellID + "' AND WELLBORE_ID='" + sWellboreID + "' AND TRAJ_ID='" + LogID + "'");

                    if (objData.Rows.Count > 0)
                        LastDataTime = Convert.ToDateTime(DataService.checkNull(objData.Rows[0]["LAST_DATA_RECEIVED_ON"], new DateTime()));

                    LastIndex = Trajectory.getLastIndex(ref objProcessConn3, sWellID, sWellboreID, LogID);

                    if (LastDataTime != (new DateTime()))
                    {
                        //int TimeDiff = Math.Abs(DateTime.DateDiff(DateInterval.Second, DateTime.Now, LastDataTime));
                        int TimeDiff = Math.Abs(Convert.ToInt32((DateTime.Now - LastDataTime).TotalSeconds));
                        TimeSpan objTimeSpan = new TimeSpan(0, 0, TimeDiff);
                        lblTrajLastData = "[" + objTimeSpan.Days.ToString() + ":" + objTimeSpan.Hours.ToString() + ":" + objTimeSpan.Minutes.ToString() + ":" + objTimeSpan.Seconds.ToString() + "]";
                    }
                    else
                        lblTrajLastData = "";

                    if (LastResponseTime != (new DateTime()))
                    {
                        //int TimeDiff = Math.Abs(DateTime.DateDiff(DateInterval.Second, DateTime.Now, LastResponseTime));
                        int TimeDiff = Math.Abs(Convert.ToInt32((DateTime.Now - LastResponseTime).TotalSeconds));
                        TimeSpan objTimeSpan = new TimeSpan(0, 0, TimeDiff);
                        lblTrajLastResponse = "[" + objTimeSpan.Days.ToString() + ":" + objTimeSpan.Hours.ToString() + ":" + objTimeSpan.Minutes.ToString() + ":" + objTimeSpan.Seconds.ToString() + "]";
                    }
                    else
                        lblTrajLastResponse = "";

                    lblTrajLastIndex = LastIndex.ToString();
                }
                else
                {
                    lblTrajLastData = "";
                    lblTrajLastResponse = "";

                    LogID = Convert.ToString(objProcessConn3.getValueFromDatabase("SELECT TRAJ_ID FROM VMX_TRAJ_HEADER WITH(NOLOCK) WHERE WELL_ID='" + sWellID + "' AND WELLBORE_ID='" + sWellboreID + "' "));

                    LastIndex = Trajectory.getLastIndex(ref objProcessConn3, sWellID, sWellboreID, LogID);

                    lblTrajLastIndex = LastIndex.ToString();
                }



            }
            catch (Exception ex)
            {
                lblTrajLastData = "";
                lblTrajLastResponse = "";
                lblTrajLastIndex = "";

            }

        }


        private void GetDepthLogDiagnostics(string SelectedWellID, string WellboreID, string LogID, Broker.BrokerRequest paramRequest, out string lblDepthLogLastIndex, out string lblDepthLogLastData, out string lblDepthLogLastResponse)
        {
            try
            {



                lblDepthLogLastData = "";
                lblDepthLogLastResponse = "";
                lblDepthLogLastIndex = "";
                //logName = "";

                DataTable objData;

                DateTime LastDataTime = new DateTime();
                DateTime LastResponseTime = new DateTime();
                double LastIndex = 0;


                string sWellID = SelectedWellID;
                string sWellboreID = WellboreID;

                VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
                objWell = VuMaxDR.Data.Objects.Well.loadObject(ref paramRequest.objDataService, SelectedWellID, ref lastError);

                //        VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan()

                //        DepthLog objDepthLog = new DepthLog();
                //        objDepthLog = VuMaxDR.Data.Objects.Well.getPrimaryDepthLog(ref paramRequest.objDataService, SelectedWellID);
                //sWellboreID = objDepthLog.WellboreID;
                //        logName = objDepthLog


                //if (objWorkSpace.Wells.ContainsKey(SelectedWellID))
                //{
                //    objWell = objWorkSpace.Wells(SelectedWellID);
                //    objWell.wellDateFormat = Well.getWellDateFormat(objProcessConn3, SelectedWellID);
                //    if (objWorkSpace.Wells(SelectedWellID).wellbores.Count > 0)
                //        sWellboreID = objWorkSpace.Wells(SelectedWellID).wellbores.Values.First.ObjectID;
                //}




                objData = paramRequest.objDataService.getTable("SELECT LOG_ID,OP_SEQ,LAST_RESPONSE_TIME FROM VMX_DL_OPERATIONS WITH(NOLOCK) WHERE WELL_ID='" + sWellID + "' AND WELLBORE_ID='" + sWellboreID + "' AND OP_TYPE IN (10,12,18) ORDER BY LAST_DATA_RECEIVED DESC");

                if (objData.Rows.Count > 0)
                {
                    LastResponseTime = Convert.ToDateTime(DataService.checkNull(objData.Rows[0]["LAST_RESPONSE_TIME"], new DateTime()));
                    // LogID = Convert.ToString(DataService.checkNull(objData.Rows[0]["LOG_ID"], ""));


                    objData = paramRequest.objDataService.getTable("SELECT LAST_DATA_RECEIVED_ON FROM VMX_DEPTH_LOG WITH(NOLOCK) WHERE WELL_ID='" + sWellID + "' AND WELLBORE_ID='" + sWellboreID + "' AND LOG_ID='" + LogID + "'");

                    if (objData.Rows.Count > 0)
                        LastDataTime = Convert.ToDateTime(DataService.checkNull(objData.Rows[0]["LAST_DATA_RECEIVED_ON"], new DateTime()));

                    LastIndex = DepthLog.getLastIndex(ref paramRequest.objDataService, sWellID, sWellboreID, LogID);

                    if (!utilFunctions.isBlankDateEx(LastDataTime))
                    {

                        //int TimeDiff = Math.Abs(Convert.ToInt16((DateTime.Now - LastDataTime).TotalSeconds));
                        //TimeSpan objTimeSpan = new TimeSpan(0, 0, TimeDiff);

                        //New Code
                        int TimeDiff = (int)(long)Math.Abs((DateTime.Now - LastDataTime).TotalSeconds);
                        TimeSpan objTimeSpan = new TimeSpan(0, 0, (int)(Int64)TimeDiff);

                        lblDepthLogLastData = "[" + objTimeSpan.Days.ToString() + ":" + objTimeSpan.Hours.ToString() + ":" + objTimeSpan.Minutes.ToString() + ":" + objTimeSpan.Seconds.ToString() + "]";
                    }
                    else
                        lblDepthLogLastData = "";
                    //LAST_RESPONSE_TIME = "";

                    if (!utilFunctions.isBlankDateEx(LastResponseTime))
                    {
                        //int TimeDiff = Math.Abs(Convert.ToInt16((DateTime.Now - LastResponseTime)));
                        //TimeSpan objTimeSpan = new TimeSpan(0, 0, TimeDiff);

                        //New Code
                        int TimeDiff = (int)(long)Math.Abs((DateTime.Now - LastDataTime).TotalSeconds);
                        TimeSpan objTimeSpan = new TimeSpan(0, 0, (int)(Int64)TimeDiff);

                        //lblDepthLogLastResponse.Text = "[" + objTimeSpan.Days.ToString() + ":" + objTimeSpan.Hours.ToString() + ":" + objTimeSpan.Minutes.ToString() + ":" + objTimeSpan.Seconds.ToString() + "]";
                        lblDepthLogLastResponse = "[" + objTimeSpan.Days.ToString() + ":" + objTimeSpan.Hours.ToString() + ":" + objTimeSpan.Minutes.ToString() + ":" + objTimeSpan.Seconds.ToString() + "]";
                    }
                    else
                        lblDepthLogLastResponse = "";
                    lblDepthLogLastIndex = LastIndex.ToString();
                    //END_INDEX = LastIndex.ToString();
                }
                else
                {
                    lblDepthLogLastData = "";
                    lblDepthLogLastResponse = "";


                    //   LogID = Convert.ToString(paramRequest.objDataService.getValueFromDatabase("SELECT LOG_ID FROM VMX_DEPTH_LOG WITH(NOLOCK) WHERE WELL_ID='" + sWellID + "' AND WELLBORE_ID='" + sWellboreID + "' ORDER BY LOG_NAME"));

                    //LastIndex = DepthLog.getLastIndex(objProcessConn3, sWellID, sWellboreID, LogID);
                    LastIndex = DepthLog.getLastIndex(ref paramRequest.objDataService, sWellID, sWellboreID, LogID);

                    lblDepthLogLastIndex = LastIndex.ToString();

                }


            }
            catch (Exception ex)
            {

                lblDepthLogLastData = "";
                lblDepthLogLastResponse = "";
                lblDepthLogLastIndex = "";

            }

        }

        private void getTimeLogDiagnostics(string SelectedWellID, string WellboreID, string LogID, Broker.BrokerRequest paramRequest, out string lblTimeLogLastIndex, out string lblTimeLogLastData, out string lblTimeLogLastResponse)
        {
            try
            {

                lblTimeLogLastData = "";
                lblTimeLogLastResponse = "";
                lblTimeLogLastIndex = "";


                DataTable objData;

                DateTime LastDataTime = new DateTime();
                DateTime LastResponseTime = new DateTime();
                double LastIndex = 0;


                string sWellID = SelectedWellID;
                string sWellboreID = WellboreID;
                string lastError = "";


                VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
                objWell = VuMaxDR.Data.Objects.Well.loadObject(ref paramRequest.objDataService, SelectedWellID, ref lastError);

                //TimeLog objTimeLog = new TimeLog();
                //objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref paramRequest.objDataService, SelectedWellID);
                //sWellboreID = objTimeLog.WellboreID;
                //logName = objTimeLog.nameLog;


                //if (objWorkSpace.Wells.ContainsKey(SelectedWellID))
                //{
                //    objWell = objWorkSpace.Wells(SelectedWellID);
                //    objWell.wellDateFormat = Well.getWellDateFormat(objProcessConn3, SelectedWellID);
                //    if (objWorkSpace.Wells(SelectedWellID).wellbores.Count > 0)
                //        sWellboreID = objWorkSpace.Wells(SelectedWellID).wellbores.Values.First.ObjectID;
                //}






                // '**************************************************************************************************************************************''
                // '===================Time Log===========================================================================================================''
                // '**************************************************************************************************************************************''
                objData = paramRequest.objDataService.getTable("SELECT A.LOG_ID,A.OP_SEQ,LAST_RESPONSE_TIME FROM VMX_DL_OPERATIONS A WITH(NOLOCK) JOIN VMX_TIME_LOG B WITH(NOLOCK) ON (A.WELL_ID=B.WELL_ID AND A.WELLBORE_ID=B.WELLBORE_ID AND A.LOG_ID=B.LOG_ID) WHERE A.WELL_ID='" + sWellID + "' AND A.WELLBORE_ID='" + sWellboreID + "' AND A.OP_TYPE IN (8,11,17) AND B.PRIMARY_LOG=1 ORDER BY A.LAST_DATA_RECEIVED DESC");

                if (objData.Rows.Count > 0)
                {
                    LastResponseTime = Convert.ToDateTime(DataService.checkNull(objData.Rows[0]["LAST_RESPONSE_TIME"], new DateTime()));
                    LogID = DataService.checkNull(objData.Rows[0]["LOG_ID"], "").ToString();

                    objData = paramRequest.objDataService.getTable("SELECT LAST_DATA_RECEIVED_ON FROM VMX_TIME_LOG WITH(NOLOCK) WHERE WELL_ID='" + sWellID + "' AND WELLBORE_ID='" + sWellboreID + "' AND LOG_ID='" + LogID + "'");

                    if (objData.Rows.Count > 0)
                        LastDataTime = Convert.ToDateTime(DataService.checkNull(objData.Rows[0]["LAST_DATA_RECEIVED_ON"], new DateTime()));

                    LastIndex = TimeLog.getLastIndexOptimized(ref paramRequest.objDataService, sWellID, sWellboreID, LogID);


                    try
                    {
                        if (objWell.wellDateFormat == VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                            LastIndex = DateTime.FromOADate(LastIndex).ToLocalTime().ToOADate();
                    }
                    catch (Exception ex)
                    {
                    }


                    if (!utilFunctions.isBlankDateEx(LastDataTime))
                    {

                        //int TimeDiff = Math.Abs(DateTime.DateDiff(DateInterval.Second, DateTime.Now, LastDataTime));

                        int TimeDiff = (int)(long)Math.Abs((DateTime.Now - LastDataTime).TotalSeconds);
                        TimeSpan objTimeSpan = new TimeSpan(0, 0, (int)(Int64)TimeDiff);

                        lblTimeLogLastData = "[" + objTimeSpan.Days.ToString() + ":" + objTimeSpan.Hours.ToString() + ":" + objTimeSpan.Minutes.ToString() + ":" + objTimeSpan.Seconds.ToString() + "]";
                    }
                    else
                        lblTimeLogLastData = "";

                    if (!utilFunctions.isBlankDateEx(LastResponseTime))
                    {

                        //int TimeDiff = Math.Abs(Convert.ToInt16((DateTime.Now - LastResponseTime).TotalSeconds));
                        //TimeSpan objTimeSpan = new TimeSpan(0, 0, TimeDiff);

                        //new Code
                        int TimeDiff = (int)(long)Math.Abs((DateTime.Now - LastResponseTime).TotalSeconds);
                        TimeSpan objTimeSpan = new TimeSpan(0, 0, (int)(Int64)TimeDiff);
                        lblTimeLogLastResponse = "[" + objTimeSpan.Days.ToString() + ":" + objTimeSpan.Hours.ToString() + ":" + objTimeSpan.Minutes.ToString() + ":" + objTimeSpan.Seconds.ToString() + "]";

                    }
                    else
                        lblTimeLogLastResponse = "";

                    if (!utilFunctions.isBlankDateEx(DateTime.FromOADate(LastIndex)))
                        //lblTimeLogLastIndex.Text = DateTime.FromOADate(LastIndex).ToString("MMM-dd-yyyy HH:mm:ss");
                        lblTimeLogLastIndex = DateTime.FromOADate(LastIndex).ToString("MMM-dd-yyyy HH:mm:ss");

                    else
                        lblTimeLogLastIndex = "";

                }
                else
                {
                    lblTimeLogLastData = "";
                    lblTimeLogLastResponse = "";


                    LogID = Convert.ToString(paramRequest.objDataService.getValueFromDatabase("SELECT LOG_ID FROM VMX_TIME_LOG WITH(NOLOCK) WHERE WELL_ID='" + sWellID + "' AND WELLBORE_ID='" + sWellboreID + "' ORDER BY LOG_NAME"));

                    LastIndex = TimeLog.getLastIndexOptimized(ref paramRequest.objDataService, sWellID, sWellboreID, LogID);


                    try
                    {
                        if (objWell.wellDateFormat == VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                            LastIndex = DateTime.FromOADate(LastIndex).ToLocalTime().ToOADate();
                    }
                    catch (Exception ex)
                    {
                    }

                    if (!utilFunctions.isBlankDateEx(DateTime.FromOADate(LastIndex)))
                        //lblTimeLogLastIndex.Text = DateTime.FromOADate(LastIndex).ToString("MMM-dd-yyyy HH:mm:ss");
                        lblTimeLogLastIndex = DateTime.FromOADate(LastIndex).ToString("MMM-dd-yyyy HH:mm:ss");

                    else
                        lblTimeLogLastIndex = "";

                }



            }
            catch (Exception ex)
            {
                lblTimeLogLastData = "";
                lblTimeLogLastResponse = "";
                lblTimeLogLastIndex = "";

            }
        }

        #endregion

        #region "performTask Functions"

        private Broker.BrokerResponse RemoveObject(Broker.BrokerRequest paramRequest)
        {
            try
            {
                // "none" = 0,
                // "wells"= 1,
                // "well" = 2,
                // "wellbores" = 3,
                // "wellbore" = 4,
                // "timeLogs" = 5,
                // "timeLog" = 6,
                // "depthLogs"= 7,
                // "depthLog"= 8,
                // "channels" = 9,
                // "mudLogs" = 10,
                // "mudLog" = 11,
                // "trajectories" = 12,
                // "trajectory"= 13           

                string userID = "";
                string wellID = "";
                string wellboreID = "";
                string nodeType = "";
                string objectID = "";

                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();

                // DownloadManager objDLManager = new DownloadManager();

                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue;
                    wellboreID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("WellboreID")).FirstOrDefault().ParamValue;
                    nodeType = @paramRequest.Parameters.Where(x => x.ParamName.Contains("NodeType")).FirstOrDefault().ParamValue;
                    objectID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("ObjectID")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }

                lastError = "";


                // '(1) Time Log
                if (nodeType == "6")
                {
                    TimeLog objTimeLog = TimeLog.loadTimeLog(ref paramRequest.objDataService, wellID, wellboreID, objectID, ref lastError);

                    if (objTimeLog == null)
                    {
                        // MsgBox("Couldn't load time log. Following error was returned" + Constants.vbCrLf + LastError, MsgBoxStyle.Exclamation, SYSTEM_TITLE);
                        //  return;
                    }

                    //if (objDLManager.isDownloadingTime(objTimeLog, OpSeq))
                    //{
                    //    MsgBox("Cannot remove Object while download is in progress. Stop the download and then try again", MsgBoxStyle.Exclamation, SYSTEM_TITLE);
                    //    return;
                    //}

                    //if (MsgBox("Are you sure you want to remove selected object ?", MsgBoxStyle.Question + MsgBoxStyle.YesNo + MsgBoxStyle.DefaultButton2, SYSTEM_TITLE) == Constants.vbNo)
                    //    return;

                    //if (TimeLog.removeTimeLog(objDataService, objTimeLog.WellID, objTimeLog.WellboreID, objTimeLog.ObjectID))
                    //    refreshTree(WellID);
                    //else
                    //{
                    //    MsgBox("Couldn't remove time log", MsgBoxStyle.Critical, SYSTEM_TITLE);
                    //    return;
                    //}
                }


                // '(2) Depth Log
                if (nodeType == "8")
                {
                    DepthLog objDepthLog = DepthLog.loadDepthLog(ref paramRequest.objDataService, wellID, wellboreID, objectID, ref lastError);

                    if (objDepthLog == null)
                    {
                        //    MsgBox("Couldn't load depth log. Following error was returned" + Constants.vbCrLf + LastError, MsgBoxStyle.Exclamation, SYSTEM_TITLE);
                        //return;
                    }

                    //if (objDLManager.isDownloadingDepth(objDepthLog, OpSeq))
                    //{
                    //    MsgBox("Cannot remove Object while download is in progress. Stop the download and then try again", MsgBoxStyle.Exclamation, SYSTEM_TITLE);
                    //    return;
                    //}

                    //if (MsgBox("Are you sure you want to remove selected object ?", MsgBoxStyle.Question + MsgBoxStyle.YesNo + MsgBoxStyle.DefaultButton2, SYSTEM_TITLE) == Constants.vbNo)
                    //    return;

                    //if (DepthLog.removeDepthLog(objDataService, objDepthLog.WellID, objDepthLog.WellboreID, objDepthLog.ObjectID))
                    //    refreshTree(WellID);
                    //else
                    //{
                    //    MsgBox("Couldn't remove depth log", MsgBoxStyle.Critical, SYSTEM_TITLE);
                    //    return;
                    //}
                }


                // '(3) Trajectory
                if (nodeType == "13")
                {
                    Trajectory objTrajectory = Trajectory.loadObject(ref paramRequest.objDataService, wellID, wellboreID, objectID, ref lastError);

                    if (objTrajectory == null)
                    {
                        //    MsgBox("Couldn't load trajectory log. Following error was returned" + Constants.vbCrLf + LastError, MsgBoxStyle.Exclamation, SYSTEM_TITLE);
                        //return;
                    }

                    //if (objDLManager.isDownloadingTrajectory(objTrajectory, OpSeq))
                    //{
                    //    MsgBox("Cannot remove Object while download is in progress. Stop the download and then try again", MsgBoxStyle.Exclamation, SYSTEM_TITLE);
                    //    return;
                    //}

                    //if (MsgBox("Are you sure you want to remove selected object ?", MsgBoxStyle.Question + MsgBoxStyle.YesNo + MsgBoxStyle.DefaultButton2, SYSTEM_TITLE) == Constants.vbNo)
                    //    return;

                    //if (Trajectory.removeTraj(objDataService, objTrajectory.WellID, objTrajectory.WellboreID, objTrajectory.ObjectID))
                    //    refreshTree(WellID);
                    //else
                    //{
                    //    MsgBox("Couldn't remove trajectory", MsgBoxStyle.Critical, SYSTEM_TITLE);
                    //    return;
                    //}
                }


                // '(4) Mud Log
                if (nodeType == "11")
                {
                    mudLog objMudLog = mudLog.loadMudLog(paramRequest.objDataService, wellID, wellboreID, objectID);

                    if (objMudLog == null)
                    {
                        //   MsgBox("Couldn't load mud log from the database. ", MsgBoxStyle.Exclamation, SYSTEM_TITLE);
                        //   return;
                    }

                    //if (objDLManager.isDownloadingMudLog(objMudLog, OpSeq))
                    //{
                    //    MsgBox("Cannot remove Object while download is in progress. Stop the download and then try again", MsgBoxStyle.Exclamation, SYSTEM_TITLE);
                    //    return;
                    //}

                    //if (MsgBox("Are you sure you want to remove selected object ?", MsgBoxStyle.Question + MsgBoxStyle.YesNo + MsgBoxStyle.DefaultButton2, SYSTEM_TITLE) == Constants.vbNo)
                    //    return;

                    //if (mudLog.removeMudLog(objDataService, objMudLog, LastError))
                    //    refreshTree(WellID);
                    //else
                    //{
                    //    MsgBox("Couldn't remove mud log. Following error was returned " + Constants.vbCrLf + LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);
                    //    return;
                    //}
                }

                // '(4) OpsReport
                if (nodeType == "pending")
                {
                    opsReport objReport = opsReport.loadReport(ref paramRequest.objDataService, wellID, wellboreID, objectID);

                    if (objReport == null)
                    {
                        //     MsgBox("Couldn't load objReport. Following error was returned" + Constants.vbCrLf + LastError, MsgBoxStyle.Exclamation, SYSTEM_TITLE);
                        //     return;
                    }

                    //if (MsgBox("Are you sure you want to remove selected object ?", MsgBoxStyle.Question + MsgBoxStyle.YesNo + MsgBoxStyle.DefaultButton2, SYSTEM_TITLE) == Constants.vbNo)
                    //    return;

                    //if (opsReport.removeReport(objDataService, objReport.WellID, objReport.WellboreID, objReport.ObjectID))
                    //    refreshTree(WellID);
                    //else
                    //{
                    //    MsgBox("Couldn't remove opsReport", MsgBoxStyle.Critical, SYSTEM_TITLE);
                    //    return;
                    //}
                }


                // '(5) BHA Run
                if (nodeType == "pending")
                {
                    bhaRun objRun = bhaRun.loadBHARun(ref paramRequest.objDataService, wellID, wellboreID, objectID);

                    if (objRun == null)
                    {
                        // MsgBox("Couldn't load BHA Run. Following error was returned" + Constants.vbCrLf + LastError, MsgBoxStyle.Exclamation, SYSTEM_TITLE);
                        //  return;
                    }

                    //if (MsgBox("Are you sure you want to remove selected object ?", MsgBoxStyle.Question + MsgBoxStyle.YesNo + MsgBoxStyle.DefaultButton2, SYSTEM_TITLE) == Constants.vbNo)
                    //    return;

                    if (bhaRun.removeBHARun(ref paramRequest.objDataService, objRun.WellID, objRun.WellboreID, objRun.ObjectID))
                    {

                        objBadResponse.RequestSuccessfull = true;
                        return objBadResponse;
                    }
                    else
                    {

                        objBadResponse.RequestSuccessfull = false;
                        objBadResponse.Errors = "Couldn't remove BHA Run";
                        return objBadResponse;
                    }
                }

                objBadResponse.RequestSuccessfull = true;
                objBadResponse.Errors = "";
                return objBadResponse;
            }

            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Invalid Request Parameter" + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        private Broker.BrokerResponse updateDepthLog(Broker.BrokerRequest paramRequest)
        {
            try
            {
                string userID = "";
                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }



                foreach (var objParameter in paramRequest.Parameters)
                {

                    //Nishant 24-07-2020                    
                    if (objParameter.ParamName == "Update")
                    {


                        VuMaxDR.Data.Objects.DepthLog objDepthlog = new VuMaxDR.Data.Objects.DepthLog();
                        objDepthlog = JsonConvert.DeserializeObject<VuMaxDR.Data.Objects.DepthLog>(objParameter.ParamValue);


                        if (objDepthlog != null)
                        {

                            lastError = "";


                            if (!VuMaxDR.Data.Objects.DepthLog.updateDepthLog(ref paramRequest.objDataService, objDepthlog, ref lastError))
                            {

                                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                                objBadResponse.RequestSuccessfull = false;
                                objBadResponse.Errors = "Error: " + lastError;
                                return objBadResponse;

                            }

                        }


                    }
                }

                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }

        }
        private Broker.BrokerResponse updateTimelog(Broker.BrokerRequest paramRequest)
        {
            try
            {
                string userID = "";
                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }



                foreach (var objParameter in paramRequest.Parameters)
                {

                    //Nishant 24-07-2020                    
                    if (objParameter.ParamName == "Update")
                    {


                        VuMaxDR.Data.Objects.TimeLog objTimelog = new VuMaxDR.Data.Objects.TimeLog();
                        objTimelog = JsonConvert.DeserializeObject<VuMaxDR.Data.Objects.TimeLog>(objParameter.ParamValue);


                        if (objTimelog != null)
                        {

                            lastError = "";
                            bool aa = false;

                            if (!VuMaxDR.Data.Objects.TimeLog.updateTimeLog(ref paramRequest.objDataService, objTimelog, ref lastError, ref aa, ref aa))
                            {

                                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                                objBadResponse.RequestSuccessfull = false;
                                objBadResponse.Errors = "Error: " + lastError;
                                return objBadResponse;

                            }

                        }


                    }
                }

                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }
        private Broker.BrokerResponse UpdateWell(Broker.BrokerRequest paramRequest)
        {
            try
            {
                string userID = "";
                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }

                List<string> OffsetWellList = new List<string>();

                OffsetWellList = JsonConvert.DeserializeObject<List<string>>(@paramRequest.Parameters.Where(x => x.ParamName.Contains("offSetWellList")).FirstOrDefault().ParamValue);


                foreach (var objParameter in paramRequest.Parameters)
                {

                    //Nishant 11-06-2020                    
                    if (objParameter.ParamName == "Update")
                    {

                        VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
                        objWell = JsonConvert.DeserializeObject<VuMaxDR.Data.Objects.Well>(objParameter.ParamValue);

                        ////Load OffsetWells NOT REQUIRED AS ITS BEEN ADDED FROM UI REACT
                        //OffsetWell objOffsetWell = new OffsetWell();
                        //objWell.offsetWells = new Dictionary<string, OffsetWell>();
                        //for (int i = 0; i < OffsetWellList.Count; i++)
                        //{
                        //    if (OffsetWellList[i].ToString() != "")
                        //    {
                        //        objOffsetWell.OffsetWellID = OffsetWellList[i].ToString();
                        //        objWell.offsetWells.Add(OffsetWellList[i].ToString(), objOffsetWell);
                        //    }
                        //}


                        if (objWell != null)
                        {

                            string lastError = "";
                            if (!VuMaxDR.Data.Objects.Well.updateWell(ref paramRequest.objDataService, objWell, ref lastError))
                            {

                                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                                objBadResponse.RequestSuccessfull = false;
                                objBadResponse.Errors = "Error: " + lastError;
                                return objBadResponse;

                            }

                            ////testing offsetwell adding: not required as its been added through well update dll
                            //string strSQL = "";
                            //for (int i = 0; i < OffsetWellList.Count; i++)
                            //{
                            //    strSQL = "INSERT INTO VMX_WELL_OFFSET (WELL_ID,OFFSET_WELL_ID,OFFSET_WELL_UWI,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
                            //    strSQL += "'" + objWell.ObjectID + "',";
                            //    strSQL += "'" + OffsetWellList[i].ToString() + "',";
                            //    strSQL += "'" + "" + "',";
                            //    strSQL += "'" + paramRequest.objDataService.UserName + "',";
                            //    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                            //    strSQL += "'" + paramRequest.objDataService.UserName + "',";
                            //    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";

                            //    paramRequest.objDataService.executeNonQuery(strSQL);
                            //}


                        }


                    }
                }

                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }

        //Nishant 24-09-2020
        private Broker.BrokerResponse UpdateTrajectory(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                string userID = "";
                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {

                    objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }





                foreach (var objParameter in paramRequest.Parameters)
                {

                    if (objParameter.ParamName == "Update")
                    {

                        VuMaxDR.Data.Objects.Trajectory objTrajectory = new VuMaxDR.Data.Objects.Trajectory();
                        objTrajectory = JsonConvert.DeserializeObject<VuMaxDR.Data.Objects.Trajectory>(objParameter.ParamValue);

                        Dictionary<int, TrajectoryData> TrajDataList = new Dictionary<int, TrajectoryData>();

                        try
                        {
                            TrajDataList = objTrajectory.trajectoryData;
                        }
                        catch (Exception ex)
                        {

                            //
                        }


                        //Load Trajectory Data
                        objTrajectory.trajectoryData = new Dictionary<int, TrajectoryData>();
                        foreach (TrajectoryData objData in TrajDataList.Values)
                        {
                            if (objTrajectory.trajectoryData.ContainsKey(Convert.ToInt32(objData.MD)))
                            {
                                continue;
                            }

                            objTrajectory.trajectoryData.Add(Convert.ToInt32(objData.MD), objData);
                        }

                        if (objTrajectory != null)
                        {

                            string lastError = "";
                            if (!VuMaxDR.Data.Objects.Trajectory.updateTrajectory(ref paramRequest.objDataService, objTrajectory, ref lastError))
                            {
                                objBadResponse = paramRequest.createResponseObject();
                                objBadResponse.RequestSuccessfull = false;
                                objBadResponse.Errors = "Error: " + lastError;
                                return objBadResponse;

                            }


                        }


                    }

                }

                //No matching function found ...
                objBadResponse = paramRequest.createResponseObject();
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

        private Broker.BrokerResponse stopDownload(Broker.BrokerRequest paramRequest)
        {
            try
            {

                string OpSeq = "";
                try
                {
                    OpSeq = @paramRequest.Parameters.Where(x => x.ParamName.Contains("OpSeq")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e OpSeq/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }


                paramRequest.objDataService.executeNonQuery("DELETE FROM VMX_DL_LOG WHERE OP_SEQ=" + OpSeq);
                paramRequest.objDataService.executeNonQuery("DELETE FROM VMX_DL_OPERATIONS WHERE OP_SEQ=" + OpSeq);


                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = true;
                objResponse.Response = "sucessfull";
                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = ex.Message + ex.StackTrace;
                return objBadResponse;

            }

        }
        private Broker.BrokerResponse UpdateMudLog(Broker.BrokerRequest paramRequest)
        {
            try //Nishant 27-06-2020 Pending...
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                string userID = "";
                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {

                    objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }


                foreach (var objParameter in paramRequest.Parameters)
                {

                    if (objParameter.ParamName == "Update")
                    {
                        VuMaxDR.Data.Objects.mudLog objMudLog = new VuMaxDR.Data.Objects.mudLog();
                        objMudLog = JsonConvert.DeserializeObject<VuMaxDR.Data.Objects.mudLog>(objParameter.ParamValue);

                        string trajID = VuMaxDR.Data.Objects.Trajectory.getActiveTrajectoryID(ref paramRequest.objDataService, objMudLog.WellID);
                        VuMaxDR.Data.Objects.Trajectory objTraj = VuMaxDR.Data.Objects.Trajectory.loadObject(ref paramRequest.objDataService, objMudLog.WellID, objMudLog.WellboreID, trajID, ref lastError);


                        Dictionary<string, mudLogInterval> objIntervals = new Dictionary<string, mudLogInterval>(objMudLog.intervals);//deep copy by value



                        objMudLog.intervals.Clear();

                        foreach (mudLogInterval objItem in objIntervals.Values)
                        //for (int i = 0; i < objIntervals.Count; i++)
                        {
                            VuMaxDR.Data.Objects.mudLogInterval objInterval = new VuMaxDR.Data.Objects.mudLogInterval();
                            objInterval.IntervalID = Guid.NewGuid().ToString();
                            objInterval.mdTop = objItem.mdTop;
                            objInterval.mdBottom = objItem.mdBottom;
                            objInterval.tvdTop = objItem.tvdTop;
                            objInterval.tvdBottom = objItem.tvdBottom;

                            //Assign TVD=MD
                            objInterval.tvdTop = objInterval.mdTop;
                            objInterval.tvdBottom = objInterval.mdBottom;

                            //Calculate TVD from Trajectory
                            if (objTraj != null)
                            {
                                objInterval.tvdTop = objTraj.getTVDValue(objInterval.mdTop);
                                objInterval.tvdBottom = objTraj.getTVDValue(objInterval.mdBottom);
                            }

                            objInterval.InterpretedLithology = objItem.InterpretedLithology;
                            objInterval.Description = objItem.Description;


                            if (objItem.lithologies != null)
                            //if (objItem.lithologies.Count > 0)
                            {
                                foreach (mudLogLithology objLitho in objItem.lithologies.Values)
                                {
                                    Byte[] imageBytes = Convert.FromBase64String(objLitho.Image.ToString());

                                    MemoryStream ms = new MemoryStream(imageBytes);
                                    System.Drawing.Image image = Image.FromStream(ms);

                                    objLitho.Image = image;



                                }

                                objInterval.lithologies = objItem.lithologies;

                            }
                            //if (listLithologies.Count > 0)
                            //{
                            //    for (int j = 0; j < listLithologies.Count; j++)
                            //    {
                            //        VuMaxDR.Data.Objects.mudLogLithology objMudLogLithoLogy = new mudLogLithology();
                            //        objMudLogLithoLogy = listLithologies[i];
                            //        objInterval.lithologies.Add(objMudLogLithoLogy.lithID, objMudLogLithoLogy);
                            //    }
                            //}
                            objMudLog.intervals.Add(objInterval.IntervalID, objInterval);
                        }

                        mudLog.updateMudLog(paramRequest.objDataService, objMudLog, ref lastError);

                    }
                }

                //No matching function found ...
                objBadResponse = paramRequest.createResponseObject();
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

        //Nishant 24-09-2020
        private Broker.BrokerResponse calculateTrajQC(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                foreach (var objParameter in paramRequest.Parameters)
                {

                    if (objParameter.ParamName == "CalculateTrajQC")
                    {

                        VuMaxDR.Data.Objects.Trajectory objTrajectory = new VuMaxDR.Data.Objects.Trajectory();
                        objTrajectory = JsonConvert.DeserializeObject<VuMaxDR.Data.Objects.Trajectory>(objParameter.ParamValue);

                        if (objTrajectory != null)
                        {

                            objTrajectory.calculatePartial();
                            Trajectory.calculateAdvancedTraj(ref objTrajectory);

                            objResponse.Response = JsonConvert.SerializeObject(objTrajectory.trajectoryData);
                            return objResponse;
                        }

                    }

                }



                objResponse.Response = null;
                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }

        }

        #endregion


    } //Class
}//Namespace


