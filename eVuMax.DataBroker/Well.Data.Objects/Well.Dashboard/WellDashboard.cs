
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

namespace eVuMax.DataBroker.Well.Data.Objects.Well.Dashboard
{
    public class WellDashboard
    {

        //Nishant 07-10-2020
        const string updateUserFav = "updateUserFav";
        const string getUserFav = "getUserFav";
        const string removeUserFav_ = "removeUserFav";


        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                //Nishant 07-10-2020
                if (paramRequest.Function == getUserFav)
                {
                    return GetUserFav(paramRequest);
                }


                if (paramRequest.Function == "ActiveWellList")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();


                    DataTable objData = getActiveWellList(paramRequest);

                    if (objData != null)
                    {
                        objResponse.Response = JsonConvert.SerializeObject(objData);
                    }
                    else
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "Error retrieving data";
                        objResponse.Response = "";

                    }

                    return objResponse;
                }


                if (paramRequest.Function == "WellColumns")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();


                    DataTable objData = getWellColumns(paramRequest);

                    if (objData != null)
                    {
                        objResponse.Response = JsonConvert.SerializeObject(objData);
                    }
                    else
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "Error retrieving data";
                        objResponse.Response = "";

                    }

                    return objResponse;

                }




                if (paramRequest.Function == "getWellList")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();


                    DataTable objData = getWellList(paramRequest);

                    if (objData != null)
                    {
                        objResponse.Response = JsonConvert.SerializeObject(objData);
                    }
                    else
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "Error retrieving data";
                        objResponse.Response = "";
                    }

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

        //Nishant 01-09-2021
        private Broker.BrokerResponse GetUserFav(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                string userID = "";
                string wellID = "";
                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/WellID " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }

                string strSQL = "SELECT * FROM eVuMaxUserFavorites WHERE USERID = '" + userID + "' AND WELLID='" + wellID + "'";
                DataTable objData = new DataTable();
                objData = paramRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objData);
                    return objResponse;
                }

                objResponse.RequestSuccessfull = false;
                objResponse.Response = "No data found";
                return objResponse;

            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = ex.Message + ex.StackTrace;
                return objBadResponse;

            }
        }
        ////Nishant 07-10-2020
        //private Broker.BrokerResponse GetUserFav(Broker.BrokerRequest paramRequest)
        //{
        //    try
        //    {
        //        Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
        //        string userID = "";
        //        try
        //        {
        //            userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
        //        }
        //        catch (Exception ex)
        //        {
        //            Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
        //            objBadResponse.RequestSuccessfull = false;
        //            objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
        //            return objBadResponse;
        //        }

        //        string strSQL = "SELECT * FROM eVuMaxUserFavorites WHERE USERID = '" + userID + "'";
        //        DataTable objData = new DataTable();
        //        objData = paramRequest.objDataService.getTable(strSQL);
        //        if (objData.Rows.Count > 0)
        //        {
        //            objResponse.RequestSuccessfull = true;
        //            objResponse.Response = JsonConvert.SerializeObject(objData);
        //            return objResponse;
        //        }

        //        objResponse.RequestSuccessfull = false;
        //        objResponse.Response = "No data found";
        //        return objResponse;

        //    }
        //    catch (Exception ex)
        //    {
        //        Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
        //        objBadResponse.RequestSuccessfull = false;
        //        objBadResponse.Errors = ex.Message + ex.StackTrace;
        //        return objBadResponse;

        //    }
        //}

        public Broker.BrokerResponse performTask(Broker.BrokerRequest paramRequest)
        {
            try
            {
                //Nishant 07-10-2020
                if (paramRequest.Function == updateUserFav)
                {
                    return UpdateUserFav(paramRequest);
                }

                if (paramRequest.Function == removeUserFav_)
                {
                    return removeUserFav(paramRequest);
                }

                if (paramRequest.Function == "RemoveWellFromDashboard")
                {
                    RemoveWellFromDashboard(paramRequest);
                }

                if (paramRequest.Function == "AddWellToDashboard")
                {
                    AddWellToDashboard(paramRequest);
                }


                if (paramRequest.Function == "SaveWellColumns")
                {
                    string userID = @"";
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

                        //if (objParameter.ParamName == "UserName")
                        //{
                        //    userID = objParameter.ParamValue;
                        //}

                        if (objParameter.ParamName == "Update")
                        {
                            DataTable objData = new DataTable();

                            objData = JsonConvert.DeserializeObject<DataTable>(objParameter.ParamValue);

                            if (objData.Rows.Count > 0)
                            {

                                string strSQL = "";

                                paramRequest.objDataService.executeNonQuery("DELETE FROM VMX_USER_WELL_COLUMNS WHERE USER_ID='" + userID + "'");

                                //Nishant 4-06-2020
                                foreach (DataRow objRow in objData.Rows)
                                {
                                    strSQL = @"INSERT INTO VMX_USER_WELL_COLUMNS (COLUMN_ID, VISIBLE,ORDER_NO,USER_ID) VALUES(";
                                    strSQL += "'" + objRow["COLUMNID"].ToString() + "'";
                                    strSQL += "," + objRow["VISIBLE"].ToString() + "";
                                    strSQL += "," + objRow["ORDERNO"].ToString() + "";
                                    strSQL += ",'" + userID + "')";

                                    paramRequest.objDataService.executeNonQuery(strSQL);
                                    strSQL = "";
                                }
                            }


                        }

                    }
                    //paramRequest.Parameters
                }

                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                return paramRequest.createResponseObject();
            }
        }

        //Nishant 01-09-2021
        private Broker.BrokerResponse removeUserFav(Broker.BrokerRequest paramRequest) //Nishant
        {
            try
            {

                string userID = @"";
                string strSQL = "";
                string wellID = "";
                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/WellID " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }

                foreach (var objParameter in paramRequest.Parameters)
                {

                    if (objParameter.ParamName == "favList")
                    {

                        string FavList = objParameter.ParamValue;

                        paramRequest.objDataService.executeNonQuery("DELETE FROM eVuMaxUserFavorites WHERE USERID='" + userID + "' AND ID='" + FavList.ToString() + "' AND WELLID='" + wellID + "'");
                        paramRequest.objDataService.executeNonQuery(strSQL);
                    }
                }

                return new Broker.BrokerResponse();
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in RemoveUserFav " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        ////Nishant 24/08/2021
        //private Broker.BrokerResponse removeUserFav(Broker.BrokerRequest paramRequest) //Nishant
        //{
        //    try
        //    {

        //        string userID = @"";
        //        string strSQL = "";
        //        try
        //        {
        //            userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
        //        }
        //        catch (Exception ex)
        //        {
        //            Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
        //            objBadResponse.RequestSuccessfull = false;
        //            objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
        //            return objBadResponse;
        //        }

        //        foreach (var objParameter in paramRequest.Parameters)
        //        {

        //            if (objParameter.ParamName == "favList")
        //            {

        //                string FavList = objParameter.ParamValue;

        //                paramRequest.objDataService.executeNonQuery("DELETE FROM eVuMaxUserFavorites WHERE USERID='" + userID + "' AND ID='" + FavList.ToString() + "'");
        //                paramRequest.objDataService.executeNonQuery(strSQL);
        //            }
        //        }

        //        return new Broker.BrokerResponse();
        //    }
        //    catch (Exception ex)
        //    {
        //        Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
        //        objBadResponse.RequestSuccessfull = false;
        //        objBadResponse.Errors = "Error in RemoveUserFav " + ex.Message + ex.StackTrace;
        //        return objBadResponse;
        //    }
        //}
        //Nishant 01/09/2021
        private Broker.BrokerResponse UpdateUserFav(Broker.BrokerRequest paramRequest) //Nishant
        {
            try
            {
                string userID = @"";
                string strSQL = "";
                string wellID = "";
                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                    wellID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/WellID " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }

                foreach (var objParameter in paramRequest.Parameters)
                {

                    if (objParameter.ParamName == "favList")
                    {

                        string FavList = objParameter.ParamValue;


                        //Nishant 01/09/2021
                        paramRequest.objDataService.executeNonQuery("DELETE FROM eVuMaxUserFavorites WHERE USERID='" + userID + "' AND ID= '" + FavList.ToString() + "' AND WELLID='" + wellID + "'");


                        strSQL = @"INSERT INTO eVuMaxUserFavorites (ID,USERID,WELLID, CREATEDDATE,CREATEDBY) VALUES(";
                        strSQL += "'" + FavList.ToString() + "'";
                        strSQL += ",'" + userID.ToString() + "'";
                        strSQL += ",'" + wellID.ToString() + "'";
                        strSQL += ",'" + DateTime.Now.ToString("yyyy-MM-dd HH:MM:ss") + "'";
                        strSQL += ",'" + userID + "')";

                        paramRequest.objDataService.executeNonQuery(strSQL);


                    }
                }

                return new Broker.BrokerResponse();
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in UpdateUserFav " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        //private Broker.BrokerResponse UpdateUserFav(Broker.BrokerRequest paramRequest) //Nishant
        //{
        //    try
        //    {
        //        string userID = @"";
        //        string strSQL = "";
        //        try
        //        {
        //            userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
        //        }
        //        catch (Exception ex)
        //        {
        //            Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
        //            objBadResponse.RequestSuccessfull = false;
        //            objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
        //            return objBadResponse;
        //        }

        //        foreach (var objParameter in paramRequest.Parameters)
        //        {

        //            if (objParameter.ParamName == "favList")
        //            {

        //                string FavList = objParameter.ParamValue;



        //                paramRequest.objDataService.executeNonQuery("DELETE FROM eVuMaxUserFavorites WHERE USERID='" + userID + "' AND ID= '"+ FavList.ToString() + "'");


        //                strSQL = @"INSERT INTO eVuMaxUserFavorites (ID,USERID, CREATEDDATE,CREATEDBY) VALUES(";
        //                strSQL += "'" + FavList.ToString() + "'";
        //                strSQL += ",'" + userID.ToString() + "'";
        //                strSQL += ",'" + DateTime.Now.ToString("yyyy-MM-dd HH:MM:ss") + "'";
        //                strSQL += ",'" + userID + "')";

        //                paramRequest.objDataService.executeNonQuery(strSQL);

        //                for (int i = 0; i < FavList.Length; i++)
        //                    {



        //                        //if (FavList[i] != "")
        //                        //{

        //                        //}

        //                    }
        //                //}
        //            }
        //        }

        //        return new Broker.BrokerResponse();
        //    }
        //    catch (Exception ex)
        //    {
        //        Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
        //        objBadResponse.RequestSuccessfull = false;
        //        objBadResponse.Errors = "Error in UpdateUserFav " + ex.Message + ex.StackTrace;
        //        return objBadResponse;
        //    }
        //}

        private Broker.BrokerResponse RemoveWellFromDashboard(Broker.BrokerRequest paramRequest) //Nishant
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

                    if (objParameter.ParamName == "wellList")
                    {
                        string[] objData;
                        string strSQL = "";
                        objData = JsonConvert.DeserializeObject<string[]>(objParameter.ParamValue);
                        for (int i = 0; i < objData.Length; i++)
                        {
                            strSQL = "DELETE FROM VMX_DS_WELL_PROFILE WHERE  WELL_ID='" + objData[i] + "'";
                            paramRequest.objDataService.executeNonQuery(strSQL);
                        }
                    }

                }
                return new Broker.BrokerResponse();
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in RemoveWellFromDashboard " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }
        private Broker.BrokerResponse AddWellToDashboard(Broker.BrokerRequest paramRequest) //Nishant
        {
            try
            {
                string userID = @"ETECHPC1";
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

                    if (objParameter.ParamName == "wellList")
                    {
                        string[] objData;
                        string strSQL = "";
                        objData = JsonConvert.DeserializeObject<string[]>(objParameter.ParamValue);
                        for (int i = 0; i < objData.Length; i++)
                        {
                            if (!paramRequest.objDataService.IsRecordExist("SELECT * FROM VMX_DS_WELL_PROFILE WHERE WELL_ID='" + objData[i] + "'"))
                            {
                                strSQL = @"INSERT INTO VMX_DS_WELL_PROFILE (WELL_ID, CREATED_BY, CREATED_DATE) VALUES(";
                                strSQL += "'" + objData[i].ToString() + "'";
                                strSQL += ",'" + userID + "'";
                                strSQL += ",'" + DateTime.Now.ToString("yyyy-MM-dd HH:MM:ss") + "')";
                                paramRequest.objDataService.executeNonQuery(strSQL);
                            }
                        }
                    }

                }
                //paramRequest.Parameters

                return new Broker.BrokerResponse();
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in AddWellToDashboard " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        //Nishant Vyas : 04-06-2020
        private Boolean getDownloadStatus(string paramWellID, Broker.BrokerRequest paramRequest)
        {
            try
            {
                //'Time Log
                string strSQL = "";

                //strSQL += "SELECT A.DATA_TABLE_NAME,A.WELL_ID,A.WELLBORE_ID,A.LOG_ID,B.OP_SEQ,B.LAST_RESPONSE_TIME,A.LAST_DATA_RECEIVED_ON,A.MAX_DATE,B.STOP_ALARM_PROCESS ";
                //strSQL += " FROM ";
                //strSQL += " VMX_TIME_LOG A WITH(NOLOCK)";
                //strSQL += " JOIN VMX_DL_OPERATIONS B WITH(NOLOCK) ON (A.WELL_ID=B.WELL_ID AND A.WELLBORE_ID=B.WELLBORE_ID AND A.LOG_ID=B.LOG_ID), ";
                //strSQL += " VMX_DS_WELL_PROFILE C WITH(NOLOCK) ";
                //strSQL += " WHERE A.WELL_ID=C.WELL_ID AND A.PRIMARY_LOG=1 AND A.WELL_ID='" + wellID + "'  ORDER BY LAST_DATA_RECEIVED_ON";

                strSQL += "SELECT B.OP_SEQ ";
                strSQL += " FROM ";
                strSQL += " VMX_TIME_LOG A WITH(NOLOCK)";
                strSQL += " JOIN VMX_DL_OPERATIONS B WITH(NOLOCK) ON (A.WELL_ID=B.WELL_ID AND A.WELLBORE_ID=B.WELLBORE_ID AND A.LOG_ID=B.LOG_ID), ";
                strSQL += " VMX_DS_WELL_PROFILE C WITH(NOLOCK) ";
                strSQL += " WHERE A.WELL_ID=C.WELL_ID AND A.PRIMARY_LOG=1 AND A.WELL_ID='" + paramWellID + "'  ORDER BY LAST_DATA_RECEIVED_ON";


                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                Boolean TimeLogDownloading = false;
                Boolean DepthLogDownloading = false;

                if (objData.Rows.Count > 0)
                {
                    string OpSeq = DataService.checkNull(objData.Rows[0]["OP_SEQ"], "-1").ToString();

                    if (OpSeq == "-1")
                    {
                        TimeLogDownloading = false;
                    }
                    else
                    {
                        TimeLogDownloading = true;
                    }

                }


                //Depth Log
                strSQL = "";

                //strSQL += "SELECT A.WELL_ID,A.WELLBORE_ID,A.LOG_ID,B.OP_SEQ,B.LAST_RESPONSE_TIME,A.LAST_DATA_RECEIVED_ON ";
                //strSQL += " FROM ";
                //strSQL += " VMX_DEPTH_LOG A WITH(NOLOCK) ";
                //strSQL += " JOIN VMX_DL_OPERATIONS B WITH(NOLOCK) ON (A.WELL_ID=B.WELL_ID AND A.WELLBORE_ID=B.WELLBORE_ID AND A.LOG_ID=B.LOG_ID), ";
                //strSQL += " VMX_DS_WELL_PROFILE C WITH(NOLOCK) ";
                //strSQL += " WHERE A.WELL_ID=C.WELL_ID ORDER BY LAST_DATA_RECEIVED_ON";

                strSQL += "SELECT A.WELL_ID,A.WELLBORE_ID,A.LOG_ID,B.OP_SEQ,B.LAST_RESPONSE_TIME,A.LAST_DATA_RECEIVED_ON ";
                strSQL += " FROM ";
                strSQL += " VMX_DEPTH_LOG A WITH(NOLOCK) ";
                strSQL += " JOIN VMX_DL_OPERATIONS B WITH(NOLOCK) ON (A.WELL_ID=B.WELL_ID AND A.WELLBORE_ID=B.WELLBORE_ID AND A.LOG_ID=B.LOG_ID), ";
                strSQL += " VMX_DS_WELL_PROFILE C WITH(NOLOCK) ";
                strSQL += " WHERE A.WELL_ID=C.WELL_ID  AND A.WELL_ID ='" + paramWellID + "' ORDER BY LAST_DATA_RECEIVED_ON";

                objData = paramRequest.objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                {
                    string OpSeq = DataService.checkNull(objData.Rows[0]["OP_SEQ"], "-1").ToString();

                    if (OpSeq == "-1")
                    {
                        DepthLogDownloading = false;
                    }
                    else
                    {
                        DepthLogDownloading = true;
                    }

                }


                if (DepthLogDownloading || TimeLogDownloading)
                {
                    return true;
                }
                else
                {
                    return false;
                }


            }
            catch (Exception ex)
            {

                return false;
            }

        }

        private DataTable getActiveWellList(Broker.BrokerRequest paramRequest)
        {
            try
            {
                string wellID = "";
                string strSQL = "";

                strSQL = "SELECT ";

                strSQL += "A.WELL_ID AS WELL_ID,";
                strSQL += "UWI,";
                strSQL += "WELL_NAME,";
                strSQL += "BLOCK,";
                strSQL += "FIELD,";
                strSQL += "COUNTY,";
                strSQL += "DISTRICT,";
                strSQL += "REGION,";
                strSQL += "STATE,";
                strSQL += "COUNTRY,";
                strSQL += "OPERATOR,";
                strSQL += "LONGITUDE,";
                strSQL += "LATITUDE,";
                strSQL += "RIG_NAME ";
                strSQL += " FROM ";
                strSQL += "VMX_WELL A, ";
                strSQL += " VMX_DS_WELL_PROFILE B WHERE A.WELL_ID=B.WELL_ID ";
                strSQL += " ORDER BY WELL_NAME ";

                DataTable objData = paramRequest.objDataService.getTable(strSQL);
                //	DataTable objData = paramRequest.objDataService.getResults(strSQL);
                if (objData != null)
                {





                    // Columns


                    objData.Columns.Add(new DataColumn("DOWNLOAD_STATUS", typeof(System.Boolean))); //Nishant 04-06-2020

                    objData.Columns.Add(new DataColumn("DEPTH", typeof(System.Double)));
                    objData.Columns.Add(new DataColumn("HDTH", typeof(System.Double)));
                    objData.Columns.Add(new DataColumn("RIG_STATE", typeof(System.Double)));
                    objData.Columns.Add(new DataColumn("RIG_STATE_COLOR", typeof(System.String)));
                    objData.Columns.Add(new DataColumn("RIG_STATE_NAME", typeof(System.String)));

                    //Add two new columns for alarm status ...
                    objData.Columns.Add(new DataColumn("ALARM_RED_STATUS", typeof(System.Int16)));
                    objData.Columns.Add(new DataColumn("ALARM_YELLOW_STATUS", typeof(System.Int16)));
                    objData.Columns.Add(new DataColumn("ALARM_STATUS", typeof(System.Int16)));
                    objData.Columns.Add(new DataColumn("ALARM_ACK_STATUS", typeof(System.Int16)));
                    objData.Columns.Add(new DataColumn("ALARM_ACK_REQUIRED", typeof(System.Int16)));
                    objData.Columns.Add(new DataColumn("ALARM_DATE_TIME", typeof(System.String)));


                    foreach (DataRow objRow in objData.Rows)
                    {

                        wellID = objRow["WELL_ID"].ToString();

                        // Defaults
                        objRow["ALARM_RED_STATUS"] = 0; //No alarm active
                        objRow["ALARM_YELLOW_STATUS"] = 0;
                        objRow["ALARM_STATUS"] = 0;

                        objRow["ALARM_ACK_STATUS"] = 0; //No alarm active
                        objRow["ALARM_ACK_REQUIRED"] = 0;
                        objRow["ALARM_DATE_TIME"] = "";

                        //Nishant 04-06-2020
                        //get Download Status here and save it in Download_status 
                        objRow["DOWNLOAD_STATUS"] = getDownloadStatus(wellID, paramRequest);
                        //**********************************************************************

                        string AlarmHistoryTable = VuMaxDR.Data.Objects.Well.getAlarmHistoryTable(ref paramRequest.objDataService, wellID);

                        if (AlarmHistoryTable != "")
                        {
                            DataTable _objAlarmData = paramRequest.objDataService.getTable("SELECT TOP 1  ALARM_STATUS,ACK_STATUS,ACK_REQUIRED,DATE_TIME FROM " + AlarmHistoryTable + " WHERE WELL_ID='" + wellID + "' ORDER BY DATE_TIME DESC");

                            if (_objAlarmData.Rows.Count > 0)
                            {

                                int alarmStatus = 0;
                                int ackStatus = 0;
                                int ackRquired = 0;
                                string alarmDatetime = "";


                                alarmStatus = int.Parse(VuMaxDR.Data.DataService.checkNull(_objAlarmData.Rows[0]["ALARM_STATUS"].ToString(), 0).ToString());
                                ackStatus = int.Parse(VuMaxDR.Data.DataService.checkNull(_objAlarmData.Rows[0]["ACK_STATUS"].ToString(), 0).ToString());
                                ackRquired = int.Parse(VuMaxDR.Data.DataService.checkNull(_objAlarmData.Rows[0]["ACK_REQUIRED"].ToString(), 0).ToString());
                                alarmDatetime = VuMaxDR.Data.DataService.checkNull(_objAlarmData.Rows[0]["DATE_TIME"].ToString(), "").ToString();

                                objRow["ALARM_STATUS"] = alarmStatus;
                                objRow["ALARM_ACK_STATUS"] = ackStatus;
                                objRow["ALARM_ACK_REQUIRED"] = ackRquired;
                                objRow["ALARM_DATE_TIME"] = alarmDatetime;



                            }
                            else
                            {

                                objRow["ALARM_STATUS"] = 0;

                                objRow["ALARM_ACK_STATUS"] = 0;
                                objRow["ALARM_ACK_REQUIRED"] = 0;
                                objRow["ALARM_DATE_TIME"] = "";

                            }

                        }
                        else
                        {

                            objRow["ALARM_STATUS"] = 0;

                            objRow["ALARM_ACK_STATUS"] = 0;
                            objRow["ALARM_ACK_REQUIRED"] = 0;
                            objRow["ALARM_DATE_TIME"] = "";

                        }

                        rigState objRigState = rigState.loadWellRigStateSetup(ref paramRequest.objDataService, wellID);


                        if (objRigState == null)
                        {
                            objRigState = rigState.loadCommonRigStateSetup(ref paramRequest.objDataService);
                        }

                        VuMaxDR.Data.Objects.TimeLog objTimeLog = new VuMaxDR.Data.Objects.TimeLog();
                        objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref paramRequest.objDataService, wellID);
                        if (objTimeLog == null)
                        {
                            DataTable _objData = paramRequest.objDataService.getTable("select top 1 * from VMX_TIME_LOG where WELL_ID='" + wellID + "' and REMARKS_LOG=0");
                            if (_objData.Rows.Count > 0)
                            {
                                string lastError = "";
                                objTimeLog = VuMaxDR.Data.Objects.TimeLog.loadTimeLog(ref paramRequest.objDataService, wellID, _objData.Rows[0]["WELLBORE_ID"].ToString(), _objData.Rows[0]["LOG_ID"].ToString(), ref lastError);
                            }
                            else
                            {
                                objTimeLog = null;
                            }
                        }

                        if (objTimeLog != null)
                        {
                            //get depth "DEPTH", hole depth "hdth", rig state "rig_state", color

                            DataTable objTimeLogData = paramRequest.objDataService.getTable("SELECT TOP 1 * FROM " + objTimeLog.__dataTableName + " WHERE RIG_STATE IS NOT NULL ORDER BY DATETIME DESC");

                            if (objTimeLogData.Rows.Count > 0)
                            {
                                if (objTimeLogData.Columns.Contains("DEPTH"))
                                {
                                    objRow["DEPTH"] = VuMaxDR.Data.DataService.checkNull(objTimeLogData.Rows[0]["DEPTH"].ToString(), 0);
                                }
                                else
                                {
                                    objRow["DEPTH"] = 0;

                                }

                                if (objTimeLogData.Columns.Contains("HDTH"))
                                {
                                    objRow["HDTH"] = VuMaxDR.Data.DataService.checkNull(objTimeLogData.Rows[0]["HDTH"].ToString(), 0);
                                }
                                else
                                {
                                    objRow["DEPTH"] = 0;
                                }

                                if (objTimeLogData.Columns.Contains("RIG_STATE"))
                                {
                                    objRow["RIG_STATE"] = double.Parse(VuMaxDR.Data.DataService.checkNull(objTimeLogData.Rows[0]["RIG_STATE"].ToString(), 0.0).ToString());
                                    objRow["RIG_STATE_NAME"] = objRigState.getName(int.Parse(objRow["RIG_STATE"].ToString()));

                                    int rigStateNo = Convert.ToInt32(VuMaxDR.Data.DataService.checkNull(objTimeLogData.Rows[0]["RIG_STATE"], 0));
                                    Color rigColor = Color.FromArgb(int.Parse(objRigState.getColor(rigStateNo).ToString()));

                                    objRow["RIG_STATE_COLOR"] = ColorTranslator.ToHtml(Color.FromArgb(rigColor.ToArgb()));
                                }
                                else
                                {
                                    objRow["RIG_STATE"] = -1;
                                    objRow["RIG_STATE_COLOR"] = ColorTranslator.ToHtml(Color.FromArgb(Color.Transparent.ToArgb()));
                                    objRow["RIG_STATE_NAME"] = "Unknown";
                                }
                            }

                        }
                        else
                        {
                            // If timelog is null
                            objRow["DEPTH"] = 0;
                            objRow["HDTH"] = 0;
                            objRow["RIG_STATE"] = -1;
                            objRow["RIG_STATE_COLOR"] = ColorTranslator.ToHtml(Color.FromArgb(Color.Transparent.ToArgb()));
                            objRow["RIG_STATE_NAME"] = "Unknown"; ;

                        }





                    }





                    //Update alarm status of each well
                    foreach (DataRow objRow in objData.Rows)
                    {
                        wellID = objRow["WELL_ID"].ToString();

                        // 0 No Alarm
                        // 1 Yellow
                        // 2 Red
                        VuMaxDR.Data.Objects.Well.getAlarmHistoryTable(ref paramRequest.objDataService, wellID);



                        objRow["ALARM_RED_STATUS"] = 0; //No alarm active
                        objRow["ALARM_YELLOW_STATUS"] = 0;

                        //TO-DO -- Look into alarm history table of the well and set the alarm status ...

                    }

                    return objData;
                }

                return null;

            }
            catch (Exception ex)
            {
                return null;
            }
        }


        private DataTable getWellColumns(Broker.BrokerRequest paramRequest)
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
                    return null;
                }
                Dictionary<string, string> columnList = new Dictionary<string, string>();

                string strSQL = @"SELECT * FROM VMX_USER_WELL_COLUMNS WHERE USER_ID='" + userID + "'  ORDER BY ORDER_NO";

                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                //Nishant 03-06-2020

                if (objData != null)
                {
                    if (objData.Rows.Count >= 18) //FIXED 18 COLUMNS AS OF NOW
                    {
                        return objData;
                    }
                    else
                    {
                        //Nishant 29-09-2020
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('DOWNLOAD_STATUS', 1, 1, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('ALARM_STATUS', 1, 2, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('WELL_ID', 0, 3, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('WELL_NAME', 1, 4, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('DISTRICT', 1, 5, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('RIG', 1, 6, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('STATE', 1, 7, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('BLOCK', 1, 8, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('FIELD', 1, 9, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('COUNTY', 1, 10, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('REGION', 1, 11, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('OPERATOR', 1, 12, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('EDR_PROVIDER', 1, 13, '" + userID + "')");

                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('CURRENT_ACTIVITY', 1, 14, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('DEPTH', 1, 15, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('HOLE_DEPTH', 1, 16, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('OPEN_INTERFACE', 1, 17, '" + userID + "')");
                        paramRequest.objDataService.executeNonQuery("INSERT INTO VMX_USER_WELL_COLUMNS(COLUMN_ID, VISIBLE, ORDER_NO, USER_ID) VALUES('EDIT_WELL', 1, 18, '" + userID + "')");


                        strSQL = @"SELECT * FROM VMX_USER_WELL_COLUMNS WHERE USER_ID='" + userID + "'  ORDER BY ORDER_NO";
                        objData = paramRequest.objDataService.getTable(strSQL);
                        return objData;

                    }

                }

                return paramRequest.objDataService.getTable("SELECT * FROM VMX_WELL_COLUMNS");
                ////******************
            }
            catch (Exception ex)
            {

                return null;
            }


        }


        private Boolean updateWellColumns(Broker.BrokerRequest paramRequest)
        {
            try
            {

                return true;
            }
            catch (Exception ex)
            {

                return false;
            }
        }

        private DataTable getWellList(Broker.BrokerRequest paramRequest)
        {

            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                Dictionary<string, string> columnList = new Dictionary<string, string>();

                string strSQL = @"SELECT WELL_ID, WELL_NAME,BLOCK,REGION,DISTRICT,FIELD,STATE,COUNTY,OPERATOR,EDR_PROVIDER,RIG_NAME FROM VMX_WELL";

                DataTable objData = paramRequest.objDataService.getTable(strSQL);


                if (objData.Rows.Count > 0)
                {

                    return objData;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {

                return null;
            }

        }



    }

}
