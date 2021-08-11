using eVuMax.DataBroker.DownloadManager;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.CompilerServices;

//using VuMax.Pi.Interface;
using VuMaxDR.Common;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;
using static eVuMax.DataBroker.DownloadManager.ServerLogEvent;

namespace eVuMax.DataBroker.DownloadManager
{


    [Serializable()]
    public class WitsmlServer
    {
        public WitsmlServer()
        {
            //   objPullWits120 = new witsml120.WMLS();
            //objPullWits131 = new witsml131.WMLS();
        }

        /// <summary>
        /// Properties
        /// </summary>
        /// <remarks></remarks>
        public string ServerID = "";
        public string ServerName = "";
        public string WMLSURL = "";
        public string WMLPURL = "";
        public string WITSMLVersion = "";
        public string UserName = "";
        public string Password = "";
        public bool UseProxyServer = false;
        public string ProxyURL = "";
        public string ProxyPort = "";
        public bool UseProxyCredentials = false;
        public string ProxyUserName = "";
        public string ProxyPassword = "";
        public string DateDesignator = "";
        public int TimeOut = 120;
        public int RetryCount = 10;
        public bool SendPlainText = false;
        public Dictionary<int, ServerLogEvent> serverLog = new Dictionary<int, ServerLogEvent>();
        public bool PiDataSource = false;
        public bool WriteBack = false;
        public bool PiIntegration = false;
        public string PiServer = "";
        public string PiDatabase = "";
        public int PiLoginType = 0;
        public string PiUserName = "";
        public string PiPassword = "";
        public int PiDataStepRate = 1;
        public int PiDataCheckThreshold = 10;

        [NonSerialized()]
        public Dictionary<int, witsmlServerLog> localLog = new Dictionary<int, witsmlServerLog>();

        //[NonSerialized()]
        //public PiInstance objPiInstance = new PiInstance();

        #region "Web Proxy References"
        // <NonSerialized()> _
        //public WithEvents objPullWits120 As New witsml120.WMLS
        //<NonSerialized()> _
        //Public WithEvents objPullWits131 As New witsml131.WMLS

        #endregion



        //[NonSerialized()]
        // public operation objOperation;
        [NonSerialized()]
        public int trialCounter = 0;

        public WitsmlServer getCopy()
        {
            try
            {
                var objNew = new WitsmlServer();
                objNew.ServerID = ServerID;
                objNew.ServerName = ServerName;
                objNew.WMLSURL = WMLSURL;
                objNew.WMLPURL = WMLPURL;
                objNew.WITSMLVersion = WITSMLVersion;
                objNew.UserName = UserName;
                objNew.Password = Password;
                objNew.UseProxyServer = UseProxyServer;
                objNew.ProxyURL = ProxyURL;
                objNew.ProxyPort = ProxyPort;
                objNew.UseProxyCredentials = UseProxyCredentials;
                objNew.ProxyUserName = ProxyUserName;
                objNew.ProxyPassword = ProxyPassword;
                objNew.DateDesignator = DateDesignator;
                objNew.TimeOut = TimeOut;
                objNew.RetryCount = RetryCount;
                objNew.SendPlainText = SendPlainText;
                objNew.PiDataSource = PiDataSource;
                objNew.WriteBack = WriteBack;
                objNew.PiIntegration = PiIntegration;
                objNew.PiServer = PiServer;
                objNew.PiDatabase = PiDatabase;
                objNew.PiLoginType = PiLoginType;
                objNew.PiUserName = PiUserName;
                objNew.PiPassword = PiPassword;
                objNew.PiDataStepRate = PiDataStepRate;
                objNew.PiDataCheckThreshold = PiDataCheckThreshold;
                return objNew;
            }
            catch (Exception ex)
            {
                return new WitsmlServer();
            }
        }

        [NonSerialized()]
        public bool serverBusy = false;
        [NonSerialized()]
        public bool clientActionPending = false;

        public bool hasAnyPendingAction()
        {
            try
            {
                if (serverBusy)
                    return false; // 'Operation still running
                return clientActionPending;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public void cleanup()
        {
            try
            {
                // objPullWits120 = default;
                // objPullWits131 = default;
            }
            catch (Exception ex)
            {
            }
        }

        public bool isFree()
        {
            try
            {
                if (serverBusy | clientActionPending)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        //public bool checkConnection(ref string errorMessage, string param_UserName, string param_Password, ref string ErrorMsg)
        //{
        //    try
        //    {

        //        // '(1) << WITSML 1.2.0 =================================================>>
        //        if (WITSMLVersion == "120")
        //        {
        //            // 'Change the url if its different
        //            if (objPullWits120.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits120.Url = WMLSURL;
        //            }

        //            objPullWits120.PreAuthenticate = true;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = param_UserName;
        //            objCredential.Password = param_Password;
        //            //  objPullWits120.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                //  objPullWits120.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            // objPullWits120.WMLS_GetVersion();
        //        }
        //        // '<<=================================================================>>



        //        // '(2) << WITSML 1.3.1 =================================================>>
        //        if (WITSMLVersion == "131" | WITSMLVersion == "130")
        //        {
        //            // 'Change the url if its different
        //            //if (objPullWits131.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            //{
        //            //    objPullWits131.Url = WMLSURL;
        //            //}



        //            // 'Skip the security certificate validation
        //            //System.Net.ServicePointManager.CertificatePolicy = new newPolicy();
        //            //objPullWits131.PreAuthenticate = true;

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = param_UserName;
        //            objCredential.Password = param_Password;
        //            //  objPullWits131.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                // objPullWits131.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            //  objPullWits131.WMLS_GetVersion();
        //        }
        //        // '<<=================================================================>>

        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        // VuMaxLogger.logMessage(ex)
        //        ErrorMsg = ex.Message;
        //        return false;
        //    }
        //}


        public bool saveObject(ref DataService objDataService)
        {
            try
            {
            }
            // 'Logic to save server object to the database

            catch (Exception ex)
            {
            }

            return true;
        }

        public static WitsmlServer loadObject(ref DataService objDataService, string ServerID)
        {
            try
            {
                DataTable objData = objDataService.getTable("SELECT * FROM VMX_WITSML_SERVERS WHERE SERVER_ID='" + ServerID + "'");
                if (objData.Rows.Count > 0)
                {
                    DataRow objRow = objData.Rows[0];
                    var objServer = new WitsmlServer();
                    objServer.ServerID = DataService.checkNull(objRow["SERVER_ID"], "").ToString();
                    objServer.ServerName = DataService.checkNull(objRow["SERVER_NAME"], "").ToString();
                    objServer.WMLSURL = DataService.checkNull(objRow["WMLS_URL"], "").ToString();
                    objServer.WMLPURL = DataService.checkNull(objRow["WMLP_URL"], "").ToString();
                    objServer.WITSMLVersion = DataService.checkNull(objRow["WITSML_VERSION"], "").ToString();
                    objServer.UseProxyServer = Convert.ToInt64(DataService.checkNull(objRow["USE_PROXY"], 0)) == 1 ? true : false;
                    objServer.ProxyURL = DataService.checkNull(objRow["PROXY_URL"], "").ToString();
                    objServer.ProxyPort = DataService.checkNull(objRow["PROXY_PORT"], "").ToString();
                    objServer.UseProxyCredentials = Convert.ToInt64(DataService.checkNull(objRow["USE_PROXY_CREDENTIALS"], 0)) == 1 ? true : false;
                    objServer.ProxyUserName = DataService.checkNull(objRow["PROXY_USER_NAME"], "").ToString();
                    string mPassword = DataService.checkNull(objRow["PROXY_PASSWORD"], "").ToString();
                    if (!string.IsNullOrEmpty(mPassword.Trim()))
                    {
                        var objAES = new VuMaxDR.Common.AES();
                        mPassword = objAES.Decrypt(mPassword, Global.PasswordEncryptionKey, 128);
                    }

                    string mServerPassword = DataService.checkNull(objRow["SERVER_PASSWORD"], "").ToString();
                    if (!string.IsNullOrEmpty(mServerPassword.Trim()))
                    {
                        var objAES = new VuMaxDR.Common.AES();
                        mServerPassword = objAES.Decrypt(mServerPassword, Global.PasswordEncryptionKey, 128);
                    }

                    objServer.UserName = DataService.checkNull(objRow["SERVER_USER_NAME"], "").ToString();
                    objServer.Password = mServerPassword;
                    objServer.ProxyPassword = mPassword;
                    objServer.TimeOut = Convert.ToInt16(DataService.checkNull(objRow["TIME_OUT"], 0).ToString());
                    objServer.RetryCount =Convert.ToInt16(DataService.checkNull(objRow["RETRY_COUNT"], 0));
                    objServer.SendPlainText = Convert.ToInt16(DataService.checkNull(objRow["SEND_PLAIN_TEXT"], 0)) == 1? true: false;
                    objServer.PiDataSource = Convert.ToInt16(DataService.checkNull(objRow["PI_SOURCE"], 0)) == 1? true: false;
                    objServer.WriteBack = Convert.ToInt16(DataService.checkNull(objRow["WRITE_BACK"], 0)) == 1? true: false;
                    try
                    {
                        objServer.PiIntegration = Convert.ToInt16(DataService.checkNull(objRow["PI_INTEGRATION"], 0)) == 1? true: false;
                        objServer.PiServer = DataService.checkNull(objRow["PI_SERVER"], "").ToString();
                        objServer.PiDatabase = DataService.checkNull(objRow["PI_DATABASE"], "").ToString();
                        objServer.PiLoginType = Convert.ToInt16(DataService.checkNull(objRow["PI_CONN_TYPE"], 0));
                        objServer.PiUserName = DataService.checkNull(objRow["PI_USER_NAME"], "").ToString();
                        string piPassword = DataService.checkNull(objRow["PI_PASSWORD"], "").ToString();
                        if (!string.IsNullOrEmpty(piPassword.Trim()))
                        {
                            var objAES = new VuMaxDR.Common.AES();
                            piPassword = objAES.Decrypt(piPassword, Global.PasswordEncryptionKey, 128);
                        }

                        objServer.PiPassword = piPassword;
                        objServer.PiDataStepRate =Convert.ToInt32(DataService.checkNull(objRow["PI_DATA_STEP_RATE"], 1));
                        objServer.PiDataCheckThreshold = Convert.ToInt32(DataService.checkNull(objRow["PI_CHECK_THRESHOLD"], 10));
                    }
                    catch (Exception ex)
                    {
                    }

                    return objServer;
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


        #region "Event Declaration"
        public event responseReceivedEventHandler responseReceived;
        #endregion

        public delegate void responseReceivedEventHandler(string responseXML, string supportMsg);

        #region "WITSML Functions"

        
        public static Dictionary<int, ServerLogEvent> getLogFromDatabase(int OpSeq, Broker.BrokerRequest paramRequest)
        {
            try
            {
                var list = new Dictionary<int, ServerLogEvent>();
                DataTable objData = paramRequest.objDataService.getTable("SELECT * FROM VMX_DL_LOG WHERE OP_SEQ=" + OpSeq.ToString() + " ORDER BY LOG_SEQ DESC");
                foreach (DataRow objRow in objData.Rows)
                {
                    var objItem = new ServerLogEvent();
                    objItem.DateTime = DataService.checkNull(objRow["DATETIME"], "").ToString();
                    objItem.EventType = (srvEventType)(DataService.checkNull(objRow["EVENT_TYPE"], 0));
                    objItem.EventTitle = DataService.checkNull(objRow["EVENT_TITLE"], "").ToString();
                    objItem.EventOutput = DataService.checkNull(objRow["EVENT_OUTPUT"], "").ToString();
                    objItem.ServerID = DataService.checkNull(objRow["SERVER_ID"], "").ToString();
                    int Seq = Convert.ToInt32(DataService.checkNull(objRow["LOG_SEQ"], 0));
                    list.Add(Seq, objItem);
                }

                return list;
            }
            catch (Exception ex)
            {
                return new Dictionary<int, ServerLogEvent>();
            }
        }

        public void clearLog()
        {
            try
            {
                serverLog.Clear();
            }
            catch (Exception ex)
            {
            }
        }

        public Array getLogArray()
        {
            try
            {
                return serverLog.Values.ToArray();
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public int getLogCount()
        {
            try
            {
                return serverLog.Count;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        public void logEvent(ServerLogEvent objEvent)
        {
            try
            {
                if (serverLog.Count <=Global.ServerLogMaxLimit)
                {
                }
                else
                {

                    // 'Push the stack up
                    for (int i = 2, loopTo = serverLog.Count; i <= loopTo; i++)
                        serverLog[i - 1] = serverLog[i].getCopy();

                    // 'Remove last element
                    serverLog.Remove(serverLog.Count);
                }

                serverLog.Add(serverLog.Count + 1, objEvent.getCopy());
            }
            catch (Exception ex)
            {
            }
        }

        public bool updateVersion()
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

        public void cancelOperation()
        {
            try
            {
                if (WITSMLVersion == "120")
                {
                    try
                    {
                       //pending
                        // objPullWits120.CancelAsync(default);
                       // objPullWits120.Abort();
                    }
                    catch (System.Threading.ThreadAbortException exThread)
                    {
                    }
                }

                if (WITSMLVersion == "130" | WITSMLVersion == "131")
                {
                    try
                    {
                     //   objPullWits131.CancelAsync(default);
                     //   objPullWits131.Abort();
                    }
                    catch (System.Threading.ThreadAbortException exThread)
                    {
                    }
                }

                clientActionPending = false;
                serverBusy = false;
            }
            catch (Exception ex)
            {
            }
        }

        //public void logWitsmlTransaction(int paramType, string paramText)
        //{
        //    try
        //    {
        //        if (objServerList.serverList.ContainsKey(ServerID))
        //        {
        //            if (objServerList.serverList(ServerID).localLog is null)
        //            {
        //                objServerList.serverList(ServerID).localLog = new Dictionary<int, witsmlServerLog>();
        //            }

        //            objServerList.serverList(ServerID).localLog.Add(objServerList.serverList(ServerID).localLog.Count + 1, new witsmlServerLog(paramType, DateAndTime.Now.ToString("MMM-dd-yyyy HH:mm:ss"), paramText));
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //    }
        //}

        //public bool performQuery(string objectType, string Query, ref operation param_Operation)
        //{
        //    try
        //    {
        //        logWitsmlTransaction(0, Query);
        //        bool DetailServerLog = true;

        //        // '>>>Log the Entry in the server log
        //        if (DetailServerLog)
        //        {
        //            var objEvent = new ServerLogEvent();
        //            objEvent.ServerID = ServerID;
        //            objEvent.EventType = ServerLogEvent.srvEventType.Request;
        //            objEvent.DateTime = DateAndTime.Now.ToString();
        //            switch (param_Operation.operationType)
        //            {
        //                case var @case when @case == operation.enOperationType.GetDepthData:
        //                    {
        //                        objEvent.EventTitle = "Download Depth Log Data (" + param_Operation.opParameters.newStartIndex + " - " + param_Operation.opParameters.newEndIndex + ")";
        //                        break;
        //                    }

        //                case var case1 when case1 == operation.enOperationType.GetDepthDataNewChannels:
        //                    {
        //                        objEvent.EventTitle = "Download Depth Log Data - New Channels - (" + param_Operation.opParameters.newStartIndex + " - " + param_Operation.opParameters.newEndIndex + ")";
        //                        break;
        //                    }

        //                case var case2 when case2 == operation.enOperationType.GetDepthDataRealtime:
        //                    {
        //                        objEvent.EventTitle = "Download Depth Log Data - Realtime - (" + param_Operation.opParameters.newStartIndex + " - " + param_Operation.opParameters.newEndIndex + ")";
        //                        break;
        //                    }

        //                case var case3 when case3 == operation.enOperationType.GetDepthLogIndex:
        //                    {
        //                        objEvent.EventTitle = "Get Depth Log Range";
        //                        break;
        //                    }

        //                case var case4 when case4 == operation.enOperationType.GetDepthLogs:
        //                    {
        //                        objEvent.EventTitle = "Get Depth Logs Available";
        //                        break;
        //                    }

        //                case var case5 when case5 == operation.enOperationType.GetLogChannels:
        //                    {
        //                        objEvent.EventTitle = "Get Available Channels";
        //                        break;
        //                    }

        //                case var case6 when case6 == operation.enOperationType.GetSingleDepthLog:
        //                    {
        //                        objEvent.EventTitle = "Get Depth Log";
        //                        break;
        //                    }

        //                case var case7 when case7 == operation.enOperationType.GetSingleTimeLog:
        //                    {
        //                        objEvent.EventTitle = "Get Time Log";
        //                        break;
        //                    }

        //                case var case8 when case8 == operation.enOperationType.GetTimeData:
        //                    {
        //                        objEvent.EventTitle = "Download Time Log Data (" + param_Operation.opParameters.newStartIndex + " - " + param_Operation.opParameters.newEndIndex + ")";
        //                        break;
        //                    }

        //                case var case9 when case9 == operation.enOperationType.GetTimeDataNewChannels:
        //                    {
        //                        objEvent.EventTitle = "Download Time Log Data - New Channels (" + param_Operation.opParameters.newStartIndex + " - " + param_Operation.opParameters.newEndIndex + ")";
        //                        break;
        //                    }

        //                case var case10 when case10 == operation.enOperationType.GetTimeDataRealtime:
        //                    {
        //                        objEvent.EventTitle = "Download Time Log Data - Realtime (" + param_Operation.opParameters.newStartIndex + " - " + param_Operation.opParameters.newEndIndex + ")";
        //                        break;
        //                    }

        //                case var case11 when case11 == operation.enOperationType.GetTimeLogIndex:
        //                    {
        //                        objEvent.EventTitle = "Get Time Log Range";
        //                        break;
        //                    }

        //                case var case12 when case12 == operation.enOperationType.GetTimeLogs:
        //                    {
        //                        objEvent.EventTitle = "Get Time Logs Available";
        //                        break;
        //                    }

        //                case var case13 when case13 == operation.enOperationType.GetTrajectories:
        //                    {
        //                        objEvent.EventTitle = "Get Trajectories Available";
        //                        break;
        //                    }

        //                case var case14 when case14 == operation.enOperationType.GetTrajectoryRealtime:
        //                    {
        //                        objEvent.EventTitle = "Download Trajectory Data";
        //                        break;
        //                    }

        //                case var case15 when case15 == operation.enOperationType.GetVersion:
        //                    {
        //                        objEvent.EventTitle = "Get Version";
        //                        break;
        //                    }

        //                case var case16 when case16 == operation.enOperationType.GetWellBores:
        //                    {
        //                        objEvent.EventTitle = "Get Wellbores Available";
        //                        break;
        //                    }

        //                case var case17 when case17 == operation.enOperationType.GetWells:
        //                    {
        //                        objEvent.EventTitle = "Get Wells Available";
        //                        break;
        //                    }

        //                case var case18 when case18 == operation.enOperationType.UpdateOpsReport:
        //                    {
        //                        objEvent.EventTitle = "Update OpsReport";
        //                        break;
        //                    }

        //                case var case19 when case19 == operation.enOperationType.GetOpsReports:
        //                    {
        //                        objEvent.EventTitle = "Get OpsReports";
        //                        break;
        //                    }

        //                case var case20 when case20 == operation.enOperationType.GetBHARun:
        //                    {
        //                        objEvent.EventTitle = "Get BHA Runs";
        //                        break;
        //                    }
        //            }

        //            logEvent(objEvent);
        //        }

        //        try
        //        {
        //            // 'Try to cancel any async operations
        //            try
        //            {
        //                try
        //                {
        //                    if (objPullWits120.AsyncTimer is object)
        //                    {
        //                        objPullWits120.AsyncTimer.Dispose();
        //                    }
        //                }
        //                catch (Exception ex2)
        //                {
        //                }

        //                objPullWits120.CancelAsync(default);
        //                objPullWits120.Abort();
        //                objPullWits120.Dispose();
        //            }
        //            catch (Exception ex2)
        //            {
        //            }

        //            try
        //            {
        //                try
        //                {
        //                    if (objPullWits131.AsyncTimer is object)
        //                    {
        //                        objPullWits131.AsyncTimer.Dispose();
        //                    }
        //                }
        //                catch (Exception ex2)
        //                {
        //                }

        //                objPullWits131.CancelAsync(default);
        //                objPullWits131.Abort();
        //                objPullWits131.Dispose();
        //            }
        //            catch (Exception ex3)
        //            {
        //            }

        //            objPullWits120 = new witsml120.WMLS();
        //            objPullWits131 = new witsml131.WMLS();
        //        }
        //        catch (Exception ex)
        //        {
        //        }

        //        clientActionPending = true;
        //        objOperation = param_Operation;


        //        // 'Halt the execution for a moment
        //        System.Threading.Thread.Sleep(1000);
        //        Application.DoEvents();


        //        // '** Encode the query in case if it's Pi Connector Source ****
        //        if (PiDataSource)
        //        {
        //            var objCrypt = new WMLSCrypt();
        //            Query = objCrypt.Encode(Query);
        //        }
        //        // '*************************************************************


        //        // '(1) << WITSML 1.2.0 =================================================>>
        //        if (WITSMLVersion == "120")
        //        {

        //            // 'Change the url if its different
        //            if (objPullWits120.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits120.Url = WMLSURL;
        //            }

        //            objPullWits120.PreAuthenticate = true;
        //            objPullWits120.UseDefaultCredentials = true;
        //            objPullWits120.objWitsmlServerRef = this;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = UserName;
        //            objCredential.Password = Password;
        //            objPullWits120.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                objPullWits120.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            serverBusy = true;
        //            if (TimeOut == 0)
        //            {
        //                TimeOut = 120;
        //            }

        //            // 'Wait for 1 second to slow down the download
        //            System.Threading.Thread.Sleep(1000);
        //            objPullWits120.Timeout = TimeOut * 1000;
        //            objPullWits120.WMLS_GetFromStoreAsync(objectType, Query, "", "");
        //        }
        //        // '<<=================================================================>>



        //        // '(2) << WITSML 1.3.1 =================================================>>
        //        if (WITSMLVersion == "131" | WITSMLVersion == "130")
        //        {
        //            // 'Change the url if its different
        //            if (objPullWits131.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits131.Url = WMLSURL;
        //            }

        //            objPullWits131.objWitsmlServerRef = this;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();
        //            objPullWits131.PreAuthenticate = true;

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = UserName;
        //            objCredential.Password = Password;
        //            objPullWits131.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                objPullWits131.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            serverBusy = true;
        //            if (TimeOut == 0)
        //            {
        //                TimeOut = 120;
        //            }

        //            // 'Wait for 1 second to slow down the download
        //            System.Threading.Thread.Sleep(1000);
        //            objPullWits131.Timeout = TimeOut * 1000;
        //            objPullWits131.WMLS_GetFromStoreAsync(objectType, Query, "", "");
        //        }
        //        // '<<=================================================================>>

        //        objVuMaxMain.SetClientActivity();
        //    }
        //    catch (Exception ex)
        //    {
        //    }

        //    return default;
        //}

        //public bool getValueFromServer(string objectType, string Query, ref operation param_Operation, ref string paramXmlOut)
        //{
        //    try
        //    {
        //        try
        //        {
        //            objPullWits120 = new witsml120.WMLS();
        //            objPullWits131 = new witsml131.WMLS();
        //        }
        //        catch (Exception ex)
        //        {
        //        }

        //        clientActionPending = true;
        //        objOperation = param_Operation;

        //        // '** Encode the query in case if it's Pi Connector Source ****
        //        if (PiDataSource)
        //        {
        //            var objCrypt = new WMLSCrypt();
        //            Query = objCrypt.Encode(Query);
        //        }
        //        // '*************************************************************

        //        // '(1) << WITSML 1.2.0 =================================================>>
        //        if (WITSMLVersion == "120")
        //        {

        //            // 'Change the url if its different
        //            if (objPullWits120.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits120.Url = WMLSURL;
        //            }

        //            objPullWits120.PreAuthenticate = true;
        //            objPullWits120.UseDefaultCredentials = true;
        //            objPullWits120.objWitsmlServerRef = this;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = UserName;
        //            objCredential.Password = Password;
        //            objPullWits120.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                objPullWits120.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            serverBusy = true;
        //            if (TimeOut == 0)
        //            {
        //                TimeOut = 120;
        //            }

        //            objPullWits120.Timeout = TimeOut * 1000;
        //            string xmlOut = "";
        //            string msgOut = "";
        //            short Result = 0;
        //            Result = objPullWits120.WMLS_GetFromStore(objectType, Query, "", "", xmlOut, msgOut);


        //            // '** Decode the response ****
        //            if (PiDataSource)
        //            {
        //                var objCrypt = new WMLSCrypt();
        //                xmlOut = objCrypt.Decode(xmlOut);
        //            }
        //            // '****************************

        //            paramXmlOut = xmlOut;
        //        }
        //        // '<<=================================================================>>



        //        // '(2) << WITSML 1.3.1 =================================================>>
        //        if (WITSMLVersion == "131" | WITSMLVersion == "130")
        //        {
        //            // 'Change the url if its different
        //            if (objPullWits131.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits131.Url = WMLSURL;
        //            }

        //            objPullWits131.PreAuthenticate = true;
        //            objPullWits131.objWitsmlServerRef = this;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = UserName;
        //            objCredential.Password = Password;
        //            objPullWits131.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                objPullWits131.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            serverBusy = true;
        //            if (TimeOut == 0)
        //            {
        //                TimeOut = 120;
        //            }

        //            objPullWits131.Timeout = TimeOut * 1000;
        //            string xmlOut = "";
        //            string msgOut = "";
        //            short Result = 0;
        //            Result = objPullWits131.WMLS_GetFromStore(objectType, Query, "", "", xmlOut, msgOut);

        //            // '** Decode the response ****
        //            if (PiDataSource)
        //            {
        //                var objCrypt = new WMLSCrypt();
        //                xmlOut = objCrypt.Decode(xmlOut);
        //            }
        //            // '****************************

        //            paramXmlOut = xmlOut;
        //        }
        //    }
        //    // '<<=================================================================>>

        //    catch (Exception ex)
        //    {
        //    }

        //    return default;
        //}

        //public bool addToServer(string objectType, string Query, ref operation param_Operation)
        //{
        //    try
        //    {
        //        clientActionPending = true;
        //        objOperation = param_Operation;

        //        // '(1) << WITSML 1.2.0 =================================================>>
        //        if (WITSMLVersion == "120")
        //        {

        //            // 'Change the url if its different
        //            if (objPullWits120.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits120.Url = WMLSURL;
        //            }

        //            objPullWits120.PreAuthenticate = true;
        //            objPullWits120.UseDefaultCredentials = true;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = UserName;
        //            objCredential.Password = Password;
        //            objPullWits120.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                objPullWits120.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            serverBusy = true;
        //            objPullWits120.Timeout = 15 * 1000;
        //            objPullWits120.WMLS_AddToStoreAsync(objectType, Query, "", "");
        //        }
        //        // '<<=================================================================>>



        //        // '(2) << WITSML 1.3.1 =================================================>>
        //        if (WITSMLVersion == "131" | WITSMLVersion == "130")
        //        {
        //            // 'Change the url if its different
        //            if (objPullWits131.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits131.Url = WMLSURL;
        //            }

        //            objPullWits131.PreAuthenticate = true;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = UserName;
        //            objCredential.Password = Password;
        //            objPullWits131.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                objPullWits131.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            serverBusy = true;
        //            objPullWits131.Timeout = 15 * 1000;
        //            objPullWits131.WMLS_AddToStoreAsync(objectType, Query, "", "");
        //        }
        //    }
        //    // '<<=================================================================>>


        //    catch (Exception ex)
        //    {
        //    }

        //    return default;
        //}

        //public bool updateToServer(string objectType, string Query, ref operation param_Operation)
        //{
        //    try
        //    {
        //        clientActionPending = true;
        //        objOperation = param_Operation;

        //        // '(1) << WITSML 1.2.0 =================================================>>
        //        if (WITSMLVersion == "120")
        //        {

        //            // 'Change the url if its different
        //            if (objPullWits120.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits120.Url = WMLSURL;
        //            }

        //            objPullWits120.PreAuthenticate = true;
        //            objPullWits120.UseDefaultCredentials = true;
        //            objPullWits120.objWitsmlServerRef = this;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = UserName;
        //            objCredential.Password = Password;
        //            objPullWits120.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                objPullWits120.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            serverBusy = true;
        //            objPullWits120.WMLS_UpdateInStoreAsync(objectType, Query, "", "");
        //        }
        //        // '<<=================================================================>>



        //        // '(2) << WITSML 1.3.1 =================================================>>
        //        if (WITSMLVersion == "131" | WITSMLVersion == "130")
        //        {
        //            // 'Change the url if its different
        //            if (objPullWits131.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits131.Url = WMLSURL;
        //            }

        //            objPullWits131.PreAuthenticate = true;
        //            objPullWits131.objWitsmlServerRef = this;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = UserName;
        //            objCredential.Password = Password;
        //            objPullWits131.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                objPullWits131.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            serverBusy = true;
        //            objPullWits131.WMLS_UpdateInStoreAsync(objectType, Query, "", "");
        //        }
        //    }
        //    // '<<=================================================================>>


        //    catch (Exception ex)
        //    {
        //    }

        //    return default;
        //}

        #endregion

        public void setClientActionTaken()
        {
            try
            {
                clientActionPending = false;
            }
            catch (Exception ex)
            {
            }
        }
        #region PullWits

        
        //private void objPullWits120_ErrorConnecting()
        //{
        //    try
        //    {
        //        objVuMaxMain.SetServerActivity();
        //        objOperation.opOutput = "";
        //        if (objOperation is object)
        //        {
        //            objOperation.opOutput = "";
        //            objOperation.opSuccessfull = true;
        //            objOperation.opErrors = "";
        //            trialCounter = 0;
        //            bool DetailServerLog = true;
        //            if (DetailServerLog)
        //            {
        //                var objEvent = new ServerLogEvent();
        //                objEvent.ServerID = ServerID;
        //                objEvent.EventType = ServerLogEvent.srvEventType.ErrorOccured;
        //                objEvent.DateTime = DateAndTime.Now.ToString();
        //                objEvent.EventTitle = "Error connecting to the WITSML Server";
        //                logEvent(objEvent);
        //            }

        //            objOperation.errorConnecting();
        //        }

        //        clientActionPending = false;
        //    }
        //    catch (Exception ex)
        //    {
        //    }
        //}

        //private void objPullWits120_WMLS_GetFromStoreCompleted(object sender, witsml120.WMLS_GetFromStoreCompletedEventArgs e)
        //{
        //    try
        //    {
        //        objVuMaxMain.SetServerActivity();
        //        objOperation.opOutput = "";
        //        if (objOperation is object)
        //        {
        //            string strOutput = e.XMLout;
        //            if (strOutput is null)
        //            {
        //                strOutput = "";
        //            }


        //            // '** Decode in case of Pi Connector source *****
        //            if (PiDataSource)
        //            {
        //                var objCrypt = new WMLSCrypt();
        //                strOutput = objCrypt.Decode(strOutput);
        //            }
        //            // '*********************************************

        //            objOperation.opOutput = strOutput;
        //            objOperation.opSuccessfull = Interaction.IIf(e.Result == 0, true, false);
        //            objOperation.opErrors = e.SuppMsgOut;
        //            trialCounter = 0;

        //            // 'Wait for 1 second to slow down the download
        //            System.Threading.Thread.Sleep(1000);
        //            objOperation.operationCompleted();
        //        }

        //        clientActionPending = true;
        //    }
        //    catch (Exception ex)
        //    {

        //        // 'VuMaxLogger.logMessage(ex)

        //        trialCounter = trialCounter + 1;
        //        objOperation.opOutput = "";
        //        objOperation.opSuccessfull = false;
        //        objOperation.opErrors = "";
        //        objOperation.operationCompleted();
        //        clientActionPending = true;
        //    }
        //}

        //private void objPullWits131_ErrorConnecting()
        //{
        //    try
        //    {
        //        objVuMaxMain.SetServerActivity();
        //        objOperation.opOutput = "";
        //        if (objOperation is object)
        //        {
        //            objOperation.opOutput = "";
        //            objOperation.opSuccessfull = true;
        //            objOperation.opErrors = "";
        //            trialCounter = 0;
        //            if (objOperation.operationType == operation.enOperationType.GetSingleTimeLog | objOperation.operationType == operation.enOperationType.GetSingleDepthLog)
        //            {
        //                MsgBox("Error connecting to the server " + objOperation.opErrors, MsgBoxStyle.Critical, SYSTEM_TITLE);
        //            }

        //            logWitsmlTransaction(2, "Error connecting to the server");
        //            bool DetailServerLog = true;
        //            if (DetailServerLog)
        //            {
        //                var objEvent = new ServerLogEvent();
        //                objEvent.ServerID = ServerID;
        //                objEvent.EventType = ServerLogEvent.srvEventType.ErrorOccured;
        //                objEvent.DateTime = DateAndTime.Now.ToString();
        //                objEvent.EventTitle = "Error connecting to the WITSML Server";
        //                logEvent(objEvent);
        //            }

        //            objOperation.errorConnecting();
        //        }

        //        clientActionPending = false;
        //    }
        //    catch (Exception ex)
        //    {
        //    }
        //}

        //private void objPullWits131_WMLS_AddToStoreCompleted(object sender, witsml131.WMLS_AddToStoreCompletedEventArgs e)
        //{
        //    try
        //    {
        //        if (objOperation is object)
        //        {
        //            objOperation.opOutput = e.SuppMsgOut;
        //            objOperation.opSuccessfull = Interaction.IIf(e.Result == 0, true, false);
        //            objOperation.opErrors = e.SuppMsgOut;
        //            objOperation.operationCompleted();
        //        }

        //        clientActionPending = false;
        //        serverBusy = false;
        //    }
        //    catch (Exception ex)
        //    {
        //    }
        //}

        //private void objPullWits131_WMLS_GetFromStoreCompleted(object sender, witsml131.WMLS_GetFromStoreCompletedEventArgs e)
        //{
        //    try
        //    {
        //        objVuMaxMain.SetServerActivity();
        //        objOperation.opOutput = "";
        //        if (objOperation is object)
        //        {
        //            string strOutput = e.XMLout;
        //            if (strOutput is null)
        //            {
        //                strOutput = "";
        //            }


        //            // '** Decode in case of Pi Connector source *****
        //            if (PiDataSource)
        //            {
        //                var objCrypt = new WMLSCrypt();
        //                strOutput = objCrypt.Decode(strOutput);
        //            }
        //            // '*********************************************

        //            string strOut = e.XMLout;
        //            string strMsgOut = "";
        //            if (e.SuppMsgOut is object)
        //            {
        //                strMsgOut = e.SuppMsgOut;
        //            }

        //            logWitsmlTransaction(1, strMsgOut + Constants.vbCrLf + strOutput);
        //            objOperation.opOutput = strOutput;
        //            objOperation.opSuccessfull = true;
        //            objOperation.opErrors = e.SuppMsgOut;
        //            trialCounter = 0;

        //            // 'Wait for 1 second to slow down the download
        //            System.Threading.Thread.Sleep(1000);
        //            objOperation.operationCompleted();
        //        }

        //        clientActionPending = false;
        //    }
        //    catch (Exception ex)
        //    {
        //        trialCounter = trialCounter + 1;
        //        objOperation.opOutput = "";
        //        objOperation.opSuccessfull = false;
        //        objOperation.opErrors = "";
        //        objOperation.operationCompleted();
        //        clientActionPending = true;
        //    }
        //}

        //private void objPullWits131_WMLS_UpdateInStoreCompleted(object sender, witsml131.WMLS_UpdateInStoreCompletedEventArgs e)
        //{
        //    try
        //    {
        //        if (objOperation is object)
        //        {
        //            objOperation.opOutput = e.SuppMsgOut;
        //            objOperation.opSuccessfull = Interaction.IIf(e.Result == 0, true, false);
        //            objOperation.opErrors = e.SuppMsgOut;
        //            objOperation.operationCompleted();
        //        }

        //        clientActionPending = false;
        //        serverBusy = false;
        //    }
        //    catch (Exception ex)
        //    {
        //    }
        //}

        //public string getResultFromServer(string objectType, string Query)
        //{
        //    try
        //    {
        //        try
        //        {
        //            objPullWits120 = new witsml120.WMLS();
        //            objPullWits131 = new witsml131.WMLS();
        //        }
        //        catch (Exception ex)
        //        {
        //        }
        //        // '==========================================================================''
        //        // '==========================================================================''

        //        // 'Halt the execution for a moment
        //        // 'System.Threading.Thread.Sleep(1000)
        //        Application.DoEvents();


        //        // '** Encode the query in case if it's Pi Connector Source ****
        //        if (PiDataSource)
        //        {
        //            var objCrypt = new WMLSCrypt();
        //            Query = objCrypt.Encode(Query);
        //        }
        //        // '*************************************************************

        //        // '(1) << WITSML 1.2.0 =================================================>>
        //        if (WITSMLVersion == "120")
        //        {

        //            // 'Change the url if its different
        //            if (objPullWits120.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits120.Url = WMLSURL;
        //            }

        //            objPullWits120.PreAuthenticate = true;
        //            objPullWits120.UseDefaultCredentials = true;
        //            objPullWits120.objWitsmlServerRef = this;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = UserName;
        //            objCredential.Password = Password;
        //            objPullWits120.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                objPullWits120.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            serverBusy = true;
        //            if (TimeOut == 0)
        //            {
        //                TimeOut = 120;
        //            }

        //            // 'Wait for 1 second to slow down the download
        //            // 'System.Threading.Thread.Sleep(100)

        //            objPullWits120.Timeout = TimeOut * 1000;
        //            string xmlOut = "";
        //            string ErrorMsg = "";
        //            int Result = objPullWits120.WMLS_GetFromStore(objectType, Query, "", "", xmlOut, ErrorMsg);
        //            if (xmlOut is object)
        //            {

        //                // '** Decode the response ****
        //                if (PiDataSource)
        //                {
        //                    var objCrypt = new WMLSCrypt();
        //                    xmlOut = objCrypt.Decode(xmlOut);
        //                }
        //                // '*************************************************************

        //                return xmlOut;
        //            }
        //            else
        //            {
        //                return "";
        //            }
        //        }
        //        // '<<=================================================================>>




        //        // '(2) << WITSML 1.3.1 =================================================>>
        //        if (WITSMLVersion == "131" | WITSMLVersion == "130")
        //        {
        //            // 'Change the url if its different
        //            if (objPullWits131.Url.Trim.ToLower != WMLSURL.Trim().ToLower())
        //            {
        //                objPullWits131.Url = WMLSURL;
        //            }

        //            objPullWits131.PreAuthenticate = true;
        //            objPullWits131.objWitsmlServerRef = this;

        //            // 'Skip the security certificate validation
        //            System.Net.ServicePointManager.CertificatePolicy = new newPolicy();

        //            // 'Assign credentials
        //            var objCredential = new System.Net.NetworkCredential();
        //            objCredential.UserName = UserName;
        //            objCredential.Password = Password;
        //            objPullWits131.Credentials = objCredential;
        //            if (UseProxyServer)
        //            {
        //                var objProxy = new System.Net.WebProxy("http://" + ProxyURL + ":" + ProxyPort);
        //                if (UseProxyCredentials)
        //                {
        //                    objProxy.UseDefaultCredentials = false;
        //                    objProxy.Credentials = new System.Net.NetworkCredential(ProxyUserName, ProxyPassword);
        //                }
        //                else
        //                {
        //                    objProxy.UseDefaultCredentials = true;
        //                }

        //                objPullWits131.Proxy = objProxy;
        //            }

        //            // ' ** Now fire the query **
        //            serverBusy = true;
        //            if (TimeOut == 0)
        //            {
        //                TimeOut = 120;
        //            }

        //            // 'Wait for 1 second to slow down the download
        //            // 'System.Threading.Thread.Sleep(100)

        //            objPullWits131.Timeout = TimeOut * 1000;
        //            string xmlOut = "";
        //            string ErrorMsg = "";
        //            int Result = objPullWits131.WMLS_GetFromStore(objectType, Query, "", "", xmlOut, ErrorMsg);
        //            if (xmlOut is object)
        //            {

        //                // '** Decode the response ****
        //                if (PiDataSource)
        //                {
        //                    var objCrypt = new WMLSCrypt();
        //                    xmlOut = objCrypt.Decode(xmlOut);
        //                }
        //                // '*************************************************************

        //                return xmlOut;
        //            }
        //            else
        //            {
        //                return "";
        //            }
        //        }
        //    }
        //    // '<<=================================================================>>

        //    catch (Exception ex)
        //    {
        //    }

        //    return default;
        //}
        #endregion

        #region "Pi Interface Methods"


        //public Dictionary<string, VuMaxDR.Data.Objects.Well> getWellListFromPiDatabase()
        //{
        //    try
        //    {
        //        var list = new Dictionary<string, VuMaxDR.Data.Objects.Well>();

        //        // 'Log the operation ...
        //        logWitsmlTransaction(0, "Getting list of wells from the Pi Database");

        //        // '### Connect to Pi Database ######################################################''
        //        connectToPiInstance();


        //        // '###### Generate a List of Wells ###############################################''
        //        if (objPiInstance.isConnected)
        //        {
        //            string LastError = "";
        //            var piWellList = new Dictionary<string, PiWell>();
        //            if (objPiInstance.getWellList(piWellList, LastError))
        //            {

        //                // 'Transform PiWells into VuMax Wells

        //                foreach (PiWell objPiWell in piWellList.Values)
        //                {
        //                    var objNewWell = new Well();
        //                    objNewWell.ObjectID = objPiWell.getAttributeValue("NAME");
        //                    objNewWell.name = objPiWell.getAttributeValue("NAME");
        //                    objNewWell.dTimSpud = objPiWell.getAttributeValue("SPUDDDATE");
        //                    objNewWell.operatorName = objPiWell.getAttributeValue("OPERATOR");
        //                    if (!list.ContainsKey(objNewWell.ObjectID))
        //                    {
        //                        list.Add(objNewWell.ObjectID, objNewWell);
        //                    }
        //                }
        //            }

        //            logWitsmlTransaction(1, "Activity Log " + Constants.vbCrLf + objPiInstance.ActivityLog);
        //            logWitsmlTransaction(1, "Retrieved the list of wells (Count:" + list.Count.ToString() + ")");
        //        }
        //        else
        //        {
        //            logWitsmlTransaction(1, "Not connected to the Pi Database");
        //        }
        //        // '##############################################################################''

        //        return list;
        //    }
        //    catch (Exception ex)
        //    {
        //        logWitsmlTransaction(1, "Error retrieving Well List from the Pi Database " + ex.Message + ex.StackTrace);
        //        return new Dictionary<string, Well>();
        //    }
        //}

        //public Dictionary<string, VuMaxDR.Data.Objects.Wellbore> getWellboreFromPiDatabase(string paramWellUID)
        //{
        //    try
        //    {
        //        var list = new Dictionary<string, VuMaxDR.Data.Objects.Wellbore>();
        //        var objNewWellbore = new Wellbore();
        //        objNewWellbore.WellID = paramWellUID;
        //        objNewWellbore.ObjectID = "Wellbore1";
        //        objNewWellbore.name = "Wellbore1";
        //        list.Add(objNewWellbore.ObjectID, objNewWellbore);
        //        return list;
        //    }
        //    catch (Exception ex)
        //    {
        //        return new Dictionary<string, Wellbore>();
        //    }
        //}

        //public Dictionary<string, VuMaxDR.Data.Objects.TimeLog> getTimeLogsFromPiDatabase(string paramWellID)
        //{
        //    try
        //    {
        //        var list = new Dictionary<string, TimeLog>();
        //        logWitsmlTransaction(0, "Getting the Time Log from the Pi Database");

        //        // '### Connect to Pi Database ######################################################''
        //        connectToPiInstance();


        //        // ###### Generate a List of Wells ###############################################''
        //        if (objPiInstance.isConnected)
        //        {
        //            string LastError = "";
        //            var piTimeLog = new PiTimeLog();
        //            if (objPiInstance.getTimeLog(paramWellID, piTimeLog, LastError))
        //            {

        //                // 'Transform PiWells into VuMax Wells
        //                var objTimeLog = new TimeLog();
        //                objTimeLog.ObjectID = objIDFactory.getObjectID;
        //                objTimeLog.nameLog = piTimeLog.Name;
        //                foreach (PiLogChannel objPiLogChannel in piTimeLog.logCurves.Values)
        //                {
        //                    var objChannel = new logChannel();
        //                    objChannel.mnemonic = objPiLogChannel.Mnemonic;
        //                    objChannel.witsmlMnemonic = objPiLogChannel.Mnemonic;
        //                    objChannel.curveDescription = objPiLogChannel.Name;
        //                    objChannel.typeLogData = objPiLogChannel.DataType;
        //                    objChannel.unit = objPiLogChannel.Unit;
        //                    if (!objTimeLog.logCurves.ContainsKey(objChannel.mnemonic))
        //                    {
        //                        objTimeLog.logCurves.Add(objChannel.mnemonic, objChannel);
        //                    }
        //                }

        //                list.Add(objTimeLog.ObjectID, objTimeLog);
        //            }

        //            if (list.Count > 0)
        //            {
        //                logWitsmlTransaction(1, "Retrieved Time Log from the Pi Database");
        //            }
        //            else
        //            {
        //                logWitsmlTransaction(1, "No Time Log retrieved from the Pi Database " + LastError);
        //            }
        //        }
        //        else
        //        {
        //            logWitsmlTransaction(1, "Not connected to the Pi Database");
        //        }
        //        // ##############################################################################''

        //        return list;
        //    }
        //    catch (Exception ex)
        //    {
        //        logWitsmlTransaction(1, "Error retrieving Time Log from the Pi Database " + ex.Message + ex.StackTrace);
        //        return new Dictionary<string, TimeLog>();
        //    }
        //}

        //public Dictionary<string, VuMaxDR.Data.Objects.DepthLog> getDepthLogsFromPiDatabase(string paramWellID)
        //{
        //    try
        //    {
        //        var list = new Dictionary<string, DepthLog>();
        //        logWitsmlTransaction(0, "Getting the Time Log from the Pi Database");

        //        // '### Connect to Pi Database ######################################################''
        //        connectToPiInstance();


        //        // ###### Generate a List of Wells ###############################################''
        //        if (objPiInstance.isConnected)
        //        {
        //            string LastError = "";
        //            var piDepthLog = new PiDepthLog();
        //            if (objPiInstance.getDepthLog(paramWellID, piDepthLog, LastError))
        //            {

        //                // 'Transform PiWells into VuMax Wells
        //                var objDepthLog = new DepthLog();
        //                objDepthLog.ObjectID = objIDFactory.getObjectID;
        //                objDepthLog.nameLog = piDepthLog.Name;
        //                foreach (PiLogChannel objPiLogChannel in piDepthLog.logCurves.Values)
        //                {
        //                    var objChannel = new logChannel();
        //                    objChannel.mnemonic = objPiLogChannel.Mnemonic;
        //                    objChannel.witsmlMnemonic = objPiLogChannel.Mnemonic;
        //                    objChannel.curveDescription = objPiLogChannel.Name;
        //                    objChannel.typeLogData = objPiLogChannel.DataType;
        //                    objChannel.unit = objPiLogChannel.Unit;
        //                    if (!objDepthLog.logCurves.ContainsKey(objChannel.mnemonic))
        //                    {
        //                        objDepthLog.logCurves.Add(objChannel.mnemonic, objChannel);
        //                    }
        //                }

        //                list.Add(objDepthLog.ObjectID, objDepthLog);
        //            }

        //            if (list.Count > 0)
        //            {
        //                logWitsmlTransaction(1, "Retrieved Depth Log from the Pi Database");
        //            }
        //            else
        //            {
        //                logWitsmlTransaction(1, "No Depth Log retrieved from the Pi Database " + LastError);
        //            }
        //        }
        //        else
        //        {
        //            logWitsmlTransaction(1, "Not connected to the Pi Database");
        //        }
        //        // ##############################################################################''

        //        return list;
        //    }
        //    catch (Exception ex)
        //    {
        //        logWitsmlTransaction(1, "Error retrieving Time Log from the Pi Database " + ex.Message + ex.StackTrace);
        //        return new Dictionary<string, DepthLog>();
        //    }
        //}

        //public void connectToPiInstance()
        //{
        //    try
        //    {
        //        if (!objPiInstance.isConnected)
        //        {
        //            var objPiConfiguration = new PiConfiguration();
        //            objPiConfiguration.PiServer = PiServer;
        //            objPiConfiguration.PiDatabase = PiDatabase;
        //            objPiConfiguration.LoginType = PiLoginType;
        //            objPiConfiguration.UserName = PiUserName;
        //            objPiConfiguration.Password = PiPassword;
        //            objPiConfiguration.DataStepRate = PiDataStepRate;
        //            objPiConfiguration.DataCheckTimeThreshold = PiDataCheckThreshold;
        //            objPiInstance.setPiConnParameters(objPiConfiguration);
        //            string LastError = "";

        //            // 'Log the operation ...
        //            logWitsmlTransaction(0, "Connecting to Pi Database: Server:: " + objPiConfiguration.PiServer + " Database: " + objPiConfiguration.PiDatabase);
        //            if (objPiInstance.ConnectToPiDatabase(LastError))
        //            {

        //                // 'Connected ...
        //                logWitsmlTransaction(0, "Connected to the Pi Database");
        //            }
        //            else
        //            {
        //                // 'Log the operation ...
        //                logWitsmlTransaction(0, "Failed to connect to the Pi Database " + LastError);
        //            }

        //            logWitsmlTransaction(0, "Connection Log" + Constants.vbCrLf + objPiInstance.ConnectionLog);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //    }
        //}

        //public bool getStartEndIndexFromPiDatabase(string paramWellID, ref DateTime paramStartIndex, ref DateTime paramEndIndex)
        //{
        //    try
        //    {

        //        // '### Connect to Pi Database ######################################################''
        //        connectToPiInstance();


        //        // '###### Generate a List of Wells ###############################################''
        //        if (objPiInstance.isConnected)
        //        {
        //            string LastError = "";
        //            if (objPiInstance.getAvailableDateRange(paramWellID, paramStartIndex, paramEndIndex, LastError))
        //            {
        //                return true;
        //            }
        //            else
        //            {
        //                return false;
        //            }
        //        }
        //        else
        //        {
        //            return false;
        //        }
        //        // '##############################################################################''

        //        return false;
        //    }
        //    catch (Exception ex)
        //    {
        //        return false;
        //    }
        //}

        //public bool getEndIndexFromPiDatabase(string paramWellID, ref double paramEndIndex)
        //{
        //    try
        //    {

        //        // '### Connect to Pi Database ######################################################''
        //        connectToPiInstance();

        //        // '###### Generate a List of Wells ###############################################''
        //        if (objPiInstance.isConnected)
        //        {
        //            string LastError = "";
        //            objPiInstance.getAvailableDepthRange(paramWellID, paramEndIndex, LastError);
        //            return true;
        //        }
        //        else
        //        {
        //            return false;
        //        }
        //        // '##############################################################################''

        //        return false;
        //    }
        //    catch (Exception ex)
        //    {
        //        return false;
        //    }
        //}

        #endregion
    }
}