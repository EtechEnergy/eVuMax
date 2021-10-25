using eVuMax.DataBroker.Common;
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



namespace eVuMax.DataBroker.Summary.DrlgConn
{
    public class DrlgConnSummary : IBroker
    {

        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Function == "DrlgConnSummary")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = getDrlgConnSummary(paramRequest);

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

                if (paramRequest.Function == "updateComments")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = updateComments(paramRequest);

                    return objResponse;
                }

                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                return paramRequest.createResponseObject();
            }
        }

        private Broker.BrokerResponse getDrlgConnSummary(Broker.BrokerRequest paramRequest)
        {
            try
            {

                MnemonicMappingMgr objMnemonicMgr = new MnemonicMappingMgr();
                objMnemonicMgr.loadMappings(ref paramRequest.objDataService);

                DrlgConnData objDrlgConnSummary = new DrlgConnData();

                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string selectionType = paramRequest.Parameters.Where(x => x.ParamName.Contains("SelectionType")).FirstOrDefault().ParamValue.ToString();
                double fromDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDepth")).FirstOrDefault().ParamValue.ToString());
                double toDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDepth")).FirstOrDefault().ParamValue.ToString());

                bool isRealTime = false;
                int refreshHrs = 24;
                isRealTime = Convert.ToBoolean(paramRequest.Parameters.Where(x => x.ParamName.Contains("isRealTime")).FirstOrDefault().ParamValue);
                refreshHrs = Convert.ToInt32(paramRequest.Parameters.Where(x => x.ParamName.Contains("refreshHrs")).FirstOrDefault().ParamValue);


                string depthUnit = "";


                if (isRealTime)
                {
                    selectionType = "-1";
                }

                DateTime fromDate = DateTime.Now;
                DateTime toDate = DateTime.Now;

                try
                {
                    fromDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDate")).FirstOrDefault().ParamValue.ToString());
                    toDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDate")).FirstOrDefault().ParamValue.ToString());


                    //Convert date to UTC
                    fromDate = fromDate.ToUniversalTime();
                    toDate = toDate.ToUniversalTime();
                }
                catch (Exception)
                {


                }

                objDrlgConnSummary.WellName = DataService.checkNull(paramRequest.objDataService.getValueFromDatabase("SELECT WELL_NAME FROM VMX_WELL WHERE WELL_ID='" + wellId.Replace("'", "'''") + "'"), "").ToString();


                //Check if time log exist, else return empty JSON
                if(!VuMaxDR.Data.Objects.Well.isTimeLogExist(ref paramRequest.objDataService,wellId))
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Response ="{}";
                    objBadResponse.Errors = "No time logs found in this well ";
                    return objBadResponse;

                }




                //Get the primary time log 
                VuMaxDR.Data.Objects.TimeLog objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLog(ref paramRequest.objDataService, wellId);

                

                if (objTimeLog.logCurves.ContainsKey("DEPTH"))
                {
                    depthUnit = objTimeLog.logCurves["DEPTH"].VuMaxUnitID;
                }

                double connFactor = 0;

                if (depthUnit.ToLower().StartsWith("f"))
                {
                    connFactor = 100;
                }

                if (depthUnit.ToLower().StartsWith("m"))
                {
                    connFactor = 30.48;
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

                        selectionType = "0";
                    }
                }

                //Load User Settings
                UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);

                UserSettings.UserSettings objSettings = objSettingsMgr.loadUserSettings(UserId, DrlgConnSettings.SettingsId, wellId);

                DrlgConnSettings objDrlgConnSettings = null;

                if (objSettings == null)
                {
                    objSettings = new UserSettings.UserSettings();

                    try
                    {
                        objDrlgConnSettings = JsonConvert.DeserializeObject<DrlgConnSettings>(objSettings.settingData);
                    }
                    catch (Exception)
                    {


                    }
                }
                else
                {

                    try
                    {
                        objDrlgConnSettings = JsonConvert.DeserializeObject<DrlgConnSettings>(objSettings.settingData);
                    }
                    catch (Exception)
                    {


                    }

                }

                if (objDrlgConnSettings == null)
                {
                    objDrlgConnSettings = new DrlgConnSettings();

                    objSettings = new UserSettings.UserSettings();
                    objSettings.UserId = UserId;
                    objSettings.WellId = wellId;
                    objSettings.SettingsId = DrlgConnSettings.SettingsId;
                    objSettings.settingData = JsonConvert.SerializeObject(objDrlgConnSettings);

                    //Save these settings
                    objSettingsMgr.saveUserSettings(objSettings);
                }

                //Load and copy user settings also to reduce the round-trip
                objDrlgConnSummary.userSettings = JsonConvert.SerializeObject(objDrlgConnSettings);

                string strSQL = "";


                DataTable connData = new DataTable();
                connData.Columns.Add(new DataColumn("DEPTH", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("BOTTOM_TO_SLIPS", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("SLIPS_TO_SLIPS", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("SLIPS_TO_BOTTOM", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("FROM_DATE", typeof(System.String)));
                connData.Columns.Add(new DataColumn("TO_DATE", typeof(System.String)));
                connData.Columns.Add(new DataColumn("DAY_NIGHT", typeof(System.String)));
                connData.Columns.Add(new DataColumn("COMMENTS", typeof(System.String)));
                connData.Columns.Add(new DataColumn("TOTAL_TIME", typeof(System.String)));
                connData.Columns.Add(new DataColumn("AVG_ECD", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("ON_BOTTOM_ROP", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("ROP", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("COST", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("TARGET_COST", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("DIFF", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("STS_COST", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("STS_DIFF", typeof(System.Double)));


                DataTable rigStateData = new DataTable();
                rigStateData.Columns.Add(new DataColumn("DEPTH", typeof(System.Double)));
                rigStateData.Columns.Add(new DataColumn("TIMES", typeof(System.String))); //Comma separated values
                rigStateData.Columns.Add(new DataColumn("COMMENTS", typeof(System.String))); //prath 04-09-2021

                DataTable histogramData = new DataTable();
                histogramData.Columns.Add(new DataColumn("X", typeof(System.Double)));
                histogramData.Columns.Add(new DataColumn("Y", typeof(System.Double)));


                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                objResponse.Warnings = "";

                //Assign tables

                objDrlgConnSummary.connData = connData;
                objDrlgConnSummary.rigStateData = rigStateData;
                objDrlgConnSummary.histogramData = histogramData;


                bool reProcessRequired = false;

                if (depthUnit.Trim() != "")
                {

                    double __logFromDepth = 0;
                    double __logToDepth = 0;

                    if (selectionType == "0")
                    {
                        __logFromDepth = objTimeLog.getDepthFromDateTime(ref paramRequest.objDataService, fromDate.ToOADate());
                        __logToDepth = objTimeLog.getDepthFromDateTime(ref paramRequest.objDataService, toDate.ToOADate());
                    }
                    else
                    {
                        __logFromDepth = fromDepth;
                        __logToDepth = toDepth;
                    }

                    double depthFootage = __logToDepth - __logFromDepth;

                    if (depthFootage > 0 && depthFootage > connFactor)
                    {

                        double expectedNoOfConnections = depthFootage / connFactor;

                        expectedNoOfConnections = expectedNoOfConnections - ((expectedNoOfConnections * 10) / 100);

                        if (selectionType == "0")
                        {
                            strSQL = "SELECT FROM_DATE FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + wellId + "' AND FROM_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND FROM_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TO_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TO_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY FROM_DATE";
                        }
                        else
                        {
                            strSQL = "SELECT FROM_DATE FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + wellId + "' AND DEPTH>=" + fromDepth.ToString() + " AND DEPTH<=" + toDepth.ToString() + " ORDER BY FROM_DATE";
                            //Nitin Changes 21-10-2021
                            fromDate = objTimeLog.getDateTimeFromDepthBegining(ref paramRequest.objDataService, fromDepth);
                            toDate = objTimeLog.getDateTimeFromDepthEnding(ref paramRequest.objDataService, toDepth);

                        }

                        DataTable connCountData = paramRequest.objDataService.getTable(strSQL);

                        if (connCountData.Rows.Count >= expectedNoOfConnections)
                        {
                            //No problem, found sufficient no. of connections
                            reProcessRequired = false;
                        }
                        else
                        {
                            reProcessRequired = true;
                        }

                        if (reProcessRequired)
                        {

                            DateTime __logFromDate = fromDate;
                            DateTime __logToDate = toDate;

                            if (selectionType == "1")
                            {
                                __logFromDate = objTimeLog.getDateTimeFromDepthBegining(ref paramRequest.objDataService, fromDepth);
                                __logToDate = objTimeLog.getDateTimeFromDepthEnding(ref paramRequest.objDataService, toDepth);
                            }

                            ConnectionLogProcessor objConnProcessor = new ConnectionLogProcessor();
                            objConnProcessor.ProcessPoints(ref paramRequest.objDataService, wellId, ref objTimeLog, __logFromDate, __logToDate);

                        }


                    }

                }

                if (selectionType == "0")
                {
                    strSQL = "SELECT * FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + wellId + "' AND FROM_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND FROM_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TO_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TO_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY FROM_DATE";
                }
                else
                {
                    strSQL = "SELECT * FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + wellId + "' AND DEPTH>=" + fromDepth.ToString() + " AND DEPTH<=" + toDepth.ToString() + " ORDER BY FROM_DATE";

                    //Nitin Changes 21-10-2021
                    fromDate = objTimeLog.getDateTimeFromDepthBegining(ref paramRequest.objDataService, fromDepth);
                    toDate = objTimeLog.getDateTimeFromDepthEnding(ref paramRequest.objDataService, toDepth);

                }

                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                if (objData != null)
                {

                    //Check if any connection was found. If not then process it
                    if (objData.Rows.Count == 0)
                    {
                        ConnectionLogProcessor objConnProcessor = new ConnectionLogProcessor();
                        objConnProcessor.processPointsBulk(ref paramRequest.objDataService, wellId);

                        //Run the query again
                        objData = paramRequest.objDataService.getTable(strSQL);

                        if (objData == null)
                        {
                            objResponse.RequestSuccessfull = false;
                            objResponse.Errors = "Error retrieving data";
                            objResponse.Response = "";
                        }
                    }

                    DataTable objExclConn = paramRequest.objDataService.getTable("SELECT DEPTH FROM VMX_CONN_INFO WHERE WELL_ID='" + wellId + "'");

                    Dictionary<double, double> exclList = new Dictionary<double, double>();

                    foreach (DataRow objRow in objExclConn.Rows)
                    {

                        double connDepth = DataService.checkNumericNull(objRow["DEPTH"]);

                        connDepth = Math.Round(connDepth, 2);

                        if (!exclList.ContainsKey(connDepth))
                        {
                            exclList.Add(connDepth, connDepth);
                        }

                    }


                    double CostPerMinute = 0;

                    if (objDrlgConnSettings.RigCost > 0)
                    {
                        CostPerMinute = objDrlgConnSettings.RigCost / 1440;
                    }

                    double TargetCost = objDrlgConnSettings.TargetTime * CostPerMinute;
                    double STSTargetCost = objDrlgConnSettings.STSBenchMark * CostPerMinute;

                    #region Connection List
                    //Copy connection list
                    foreach (DataRow objRow in objData.Rows)
                    {

                        DataRow newRow = connData.NewRow();



                        double connDepth = DataService.checkNumericNull(objRow["DEPTH"]);

                        bool ContinueAhead = true;

                        if (!objDrlgConnSettings.showExcludedConn)
                        {

                            if (exclList.ContainsKey(connDepth))
                            {
                                objDrlgConnSummary.ExcludedConns += 1;
                                ContinueAhead = false;
                            }

                        }



                        if (!ContinueAhead)
                        {
                            //skip this connection
                            continue;
                        }


                        connDepth = Math.Round(connDepth, 2);

                        newRow["DEPTH"] = Math.Round(double.Parse(objRow["DEPTH"].ToString()));

                        double bts = double.Parse(DataService.checkNull(objRow["BOTTOM_TO_SLIPS"], 0).ToString());

                        if (bts > 0)
                        {
                            bts = Math.Round(bts / 60, 2);
                        }

                        double sts = double.Parse(DataService.checkNull(objRow["SLIPS_TO_SLIPS"], 0).ToString());

                        if (sts > 0)
                        {
                            sts = Math.Round(sts / 60, 2);
                        }

                        double stb = double.Parse(DataService.checkNull(objRow["SLIPS_TO_BOTTOM"], 0).ToString());

                        if (stb > 0)
                        {
                            stb = Math.Round(stb / 60, 2);
                        }


                        //Another check of max. time
                        if (objDrlgConnSettings.MaxConnTime > 0 && objDrlgConnSettings.SkipConnMaxTime)
                        {
                            double lnTotalConnTime = bts + sts + stb;

                            if (lnTotalConnTime > objDrlgConnSettings.MaxConnTime)
                            {
                                ContinueAhead = false;
                            }

                        }

                        if ((bts + sts + stb) <= 0)
                        {
                            ContinueAhead = false;
                        }


                        if (!ContinueAhead)
                        {
                            //skip this connection
                            continue;
                        }

                        newRow["BOTTOM_TO_SLIPS"] = bts;
                        newRow["SLIPS_TO_SLIPS"] = sts;
                        newRow["SLIPS_TO_BOTTOM"] = stb;

                        DateTime connFromDate = DateTime.Parse(DataService.checkNull(objRow["FROM_DATE"], new DateTime()).ToString());
                        DateTime connToDate = DateTime.Parse(DataService.checkNull(objRow["TO_DATE"], new DateTime()).ToString());

                        double totalSeconds = Math.Abs((connFromDate - connToDate).TotalSeconds);
                        TimeSpan objSpan = new TimeSpan(0, 0, (int)totalSeconds);

                        newRow["COMMENTS"] = DataService.checkNull(objRow["USER_COMMENT"], "").ToString();
                        //newRow["FROM_DATE"] = connFromDate.ToLocalTime().ToString("MMM-dd-yyyy HH:mm:ss"); //21-10-2021 prath
                        //newRow["TO_DATE"] = connFromDate.ToLocalTime().ToString("MMM-dd-yyyy HH:mm:ss");

                        newRow["FROM_DATE"] = connFromDate.ToString("MMM-dd-yyyy HH:mm:ss"); //21-10-2021 prath
                        newRow["TO_DATE"] = connToDate.ToString("MMM-dd-yyyy HH:mm:ss");

                        newRow["TOTAL_TIME"] = "[" + objSpan.Hours.ToString() + ":" + objSpan.Minutes.ToString() + ":" + objSpan.Seconds.ToString() + "]";
                        newRow["DAY_NIGHT"] = DataService.checkNull(objRow["TIME"], "D").ToString();

                        double connTimeMinutes = Math.Abs((connFromDate - connToDate).TotalMinutes);

                        double Cost = 0;

                        if (CostPerMinute > 0)
                        {
                            Cost = Math.Round(connTimeMinutes * CostPerMinute, 2);
                        }

                        newRow["COST"] = Cost;

                        double STSCost = 0;

                        if (CostPerMinute > 0 && sts > 0)
                        {
                            STSCost = Math.Round(CostPerMinute * sts, 2);
                        }

                        if (TargetCost > 0)
                        {
                            newRow["TARGET_COST"] = Math.Round(TargetCost, 2);
                        }
                        else
                        {
                            newRow["TARGET_COST"] = 0;
                        }

                        double actualCost = 0;

                        if (CostPerMinute > 0 && connTimeMinutes > 0)
                        {
                            actualCost = connTimeMinutes * CostPerMinute;
                        }

                        double costDiff = 0;

                        if (actualCost > 0 && TargetCost > 0)
                        {
                            costDiff = Math.Round(TargetCost - actualCost, 2);
                        }

                        double stsCostDiff = 0;

                        double actualSTSCost = 0;

                        if (CostPerMinute > 0 && connTimeMinutes > 0 && sts > 0)
                        {
                            actualSTSCost = Math.Round(sts * CostPerMinute, 2);
                        }

                        if (actualSTSCost > 0 && STSTargetCost > 0)
                        {
                            stsCostDiff = Math.Round(STSTargetCost - actualSTSCost, 2);
                        }

                        newRow["DIFF"] = costDiff;
                        newRow["STS_COST"] = actualSTSCost;
                        newRow["STS_DIFF"] = stsCostDiff;

                        objDrlgConnSummary.ConnCount += 1;

                        connData.Rows.Add(newRow);

                    }
                    #endregion

                    #region Standwise Analysis
                    //Calculate statistics

                    DateTime limitDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramRequest.objDataService));

                    DateTime firstConnDate = limitDate;

                    if (connData.Rows.Count > 0)
                    {
                        firstConnDate = DateTime.Parse(connData.Rows[0]["FROM_DATE"].ToString());
                    }


                    DataTable objPrevConn = paramRequest.objDataService.getTable("SELECT TOP 1 TO_DATE FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + wellId + "' AND FROM_DATE<'" + firstConnDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY FROM_DATE DESC");

                    if (objPrevConn.Rows.Count > 0)
                    {
                        firstConnDate = DateTime.Parse(objPrevConn.Rows[0]["TO_DATE"].ToString());
                    }



                    string ECDMnemonic = "";

                    double avgECD = 0;
                    double OnBottomROP = 0;
                    double ROP = 0;


                    if (objTimeLog.logCurves.ContainsKey("ECD"))
                    {
                        //Nothing to do ...
                    }
                    else
                    {
                        ECDMnemonic = objMnemonicMgr.getMappedMnemonic("ECD");
                    }


                    for (int i = 0; i < connData.Rows.Count; i++)
                    {

                        DateTime lnFromDate;

                        if (i == 0)
                        {
                            lnFromDate = firstConnDate;
                        }
                        else
                        {
                            lnFromDate = DateTime.Parse(connData.Rows[i - 1]["TO_DATE"].ToString());
                        }

                        DateTime lnToDate = DateTime.Parse(connData.Rows[i]["FROM_DATE"].ToString());


                        avgECD = 0;
                        ROP = 0;
                        OnBottomROP = 0;


                        if (ECDMnemonic.Trim() != "")
                        {
                            strSQL = "SELECT AVG[" + ECDMnemonic + "]) AS AVGVALUE FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'";

                            DataTable avgData = paramRequest.objDataService.getTable(strSQL);

                            if (avgData != null)
                            {
                                if (avgData.Rows.Count > 0)
                                {
                                    avgECD = Math.Round(double.Parse(DataService.checkNull(avgData.Rows[0]["AVGVALUE"], 0).ToString()));
                                }

                                avgData.Dispose();
                            }


                        }

                        double sumDateTime = 0;
                        double sumDepth = 0;

                        strSQL = "SELECT SUM(TIME_DURATION) SUMVALUE FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19)";

                        DataTable dataSumDateTime = paramRequest.objDataService.getTable(strSQL);

                        if (dataSumDateTime != null)
                        {
                            if (dataSumDateTime.Rows.Count > 0)
                            {
                                sumDateTime = double.Parse(DataService.checkNull(dataSumDateTime.Rows[0]["SUMVALUE"], 0).ToString());
                            }

                            dataSumDateTime.Dispose();
                        }

                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) SUMVALUE FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0";

                        DataTable dataSumDepth = paramRequest.objDataService.getTable(strSQL);

                        if (dataSumDepth != null)
                        {
                            if (dataSumDepth.Rows.Count > 0)
                            {
                                // Nishant 20-10-2021
                                //sumDateTime = double.Parse(DataService.checkNull(dataSumDepth.Rows[0]["SUMVALUE"], 0).ToString()); //Nitin
                                sumDepth = double.Parse(DataService.checkNull(dataSumDepth.Rows[0]["SUMVALUE"], 0).ToString());
                            }

                            dataSumDepth.Dispose();
                        }


                        if (sumDateTime > 0 && sumDepth > 0)
                        {
                            OnBottomROP = sumDepth / ((sumDateTime / 60) / 60);
                        }
                        else
                        {
                            OnBottomROP = 0;
                        }





                        sumDateTime = 0;
                        sumDepth = 0;

                        strSQL = "SELECT SUM(TIME_DURATION) SUMVALUE FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";

                        dataSumDateTime = paramRequest.objDataService.getTable(strSQL);

                        if (dataSumDateTime != null)
                        {
                            if (dataSumDateTime.Rows.Count > 0)
                            {
                                sumDateTime = double.Parse(DataService.checkNull(dataSumDateTime.Rows[0]["SUMVALUE"], 0).ToString());
                            }

                            dataSumDateTime.Dispose();
                        }

                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) SUMVALUE FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND NEXT_DEPTH>0 AND HDTH>=0";

                        dataSumDepth = paramRequest.objDataService.getTable(strSQL);

                        if (dataSumDepth != null)
                        {
                            if (dataSumDepth.Rows.Count > 0)
                            {
                                //Nishant 20-10-2021 
                                //sumDateTime = double.Parse(DataService.checkNull(dataSumDepth.Rows[0]["SUMVALUE"], 0).ToString());//Nitin
                                sumDepth = double.Parse(DataService.checkNull(dataSumDepth.Rows[0]["SUMVALUE"], 0).ToString());
                            }

                            dataSumDepth.Dispose();
                        }


                        if (sumDateTime > 0 && sumDepth > 0)
                        {
                            ROP = sumDepth / ((sumDateTime / 60) / 60);
                        }
                        else
                        {
                            ROP = 0;
                        }

                        connData.Rows[i]["AVG_ECD"] = avgECD;
                        connData.Rows[i]["ON_BOTTOM_ROP"] = OnBottomROP;
                        connData.Rows[i]["ROP"] = ROP;

                    }

                    #endregion

                    #region RigState wise break up

                    //Rigstate wise break up
                    Dictionary<double, double> uniqueRigStates = new Dictionary<double, double>();

                    strSQL = "SELECT DISTINCT(RIG_STATE) RIG_STATE FROM " + objTimeLog.__dataTableName + " WHERE RIG_STATE IS NOT NULL";

                    string subQuery = "";

                    //Build query to only include date range of connections
                    foreach (DataRow objRow in connData.Rows)
                    {

                        DateTime lnFromDate = DateTime.Parse(objRow["FROM_DATE"].ToString());
                        DateTime lnToDate = DateTime.Parse(objRow["TO_DATE"].ToString());


                        subQuery += "OR (DATETIME>'" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<'" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "') ";

                    }

                    if (subQuery.Trim() != "")
                    {
                        subQuery = subQuery.Substring(2);
                        strSQL = strSQL + " AND (" + subQuery + ")";
                    }


                    DataTable uniqueRigStatesData = paramRequest.objDataService.getTable(strSQL);

                    if (uniqueRigStatesData != null)
                    {
                        uniqueRigStatesData.Columns.Add(new DataColumn("COLOR", typeof(System.String)));
                        uniqueRigStatesData.Columns.Add(new DataColumn("RIG_STATE_NAME", typeof(System.String)));
                    }


                    objDrlgConnSummary.rigStates = uniqueRigStatesData;

                    if (uniqueRigStatesData != null)
                    {
                        foreach (DataRow objRow in uniqueRigStatesData.Rows)
                        {
                            double RigState = double.Parse(DataService.checkNull(objRow["RIG_STATE"], 0).ToString());

                            //Get the color 
                            DataTable rigStateColorData = paramRequest.objDataService.getTable("SELECT RIG_STATE_COLOR,RIG_STATE_NAME FROM VMX_COMMON_RIGSTATE_ITEMS WHERE RIG_STATE_NUMBER=" + RigState.ToString());

                            if (rigStateColorData.Rows.Count > 0)
                            {

                                int rigStateColor = int.Parse(DataService.checkNull(rigStateColorData.Rows[0]["RIG_STATE_COLOR"], 0).ToString());
                                string hexColor = ColorTranslator.ToHtml(Color.FromArgb(rigStateColor));
                                string rigStateName = DataService.checkNull(rigStateColorData.Rows[0]["RIG_STATE_NAME"], "").ToString();

                                objRow["COLOR"] = hexColor;
                                objRow["RIG_STATE_NAME"] = rigStateName;

                            }

                            uniqueRigStatesData.Dispose();

                            if (!uniqueRigStates.ContainsKey(RigState))
                            {
                                uniqueRigStates.Add(RigState, RigState);
                            }
                        }
                    }



                    foreach (DataRow objRow in connData.Rows)
                    {

                        double connDepth = DataService.checkNumericNull(objRow["DEPTH"]);
                        string connComments = DataService.checkNull(objRow["COMMENTS"], "").ToString();

                        DateTime lnFromDate = DateTime.Parse(objRow["FROM_DATE"].ToString());
                        DateTime lnToDate = DateTime.Parse(objRow["TO_DATE"].ToString());



                        DataRow newRow = rigStateData.NewRow();

                        Dictionary<double, double> rigStateTimes = new Dictionary<double, double>();

                        foreach (double lnKey in uniqueRigStates.Keys)
                        {
                            rigStateTimes.Add(lnKey, 0);
                        }

                        strSQL = "SELECT TIME_DURATION,RIG_STATE FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>'" + lnFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<'" + lnToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IS NOT NULL";

                        DataTable connRigStates = paramRequest.objDataService.getTable(strSQL);

                        foreach (DataRow connTimeRow in connRigStates.Rows)
                        {
                            double lnRigState = double.Parse(DataService.checkNull(connTimeRow["RIG_STATE"], 0).ToString());
                            double lnTimeDuration = double.Parse(DataService.checkNull(connTimeRow["TIME_DURATION"], 0).ToString());

                            if (rigStateTimes.ContainsKey(lnRigState))
                            {
                                //Sum up time duration
                                rigStateTimes[lnRigState] = rigStateTimes[lnRigState] + lnTimeDuration;
                            }

                        }

                        string strTimes = "";

                        if (rigStateTimes.Count > 0)
                        {
                            foreach (double lnKey in rigStateTimes.Keys)
                            {
                                double lnTimeDuraton = rigStateTimes[lnKey];

                                if (lnTimeDuraton > 0)
                                {
                                    lnTimeDuraton = Math.Round(lnTimeDuraton / 60, 2); //Converting to minutes
                                }

                                strTimes = strTimes + "," + lnTimeDuraton;
                            }
                        }

                        if (strTimes.Trim() != "")
                        {
                            strTimes = strTimes.Substring(1);
                        }

                        if (strTimes != "")
                        {
                            newRow["DEPTH"] = Math.Round(connDepth, 2);
                            newRow["TIMES"] = strTimes;
                            newRow["COMMENTS"] = connComments;

                            rigStateData.Rows.Add(newRow);
                        }
                        ////=================
                        //newRow["DEPTH"] = Math.Round(connDepth, 2);
                        //newRow["TIMES"] = strTimes;
                        //newRow["COMMENTS"] = connComments;

                        //rigStateData.Rows.Add(newRow);

                    }

                    #endregion

                    #region Statistics

                    double sumPositive = 0;
                    double sumNegative = 0;
                    double NetCashFlow = 0;

                    double sumSTSPositive = 0;
                    double sumSTSNegative = 0;
                    double NetSTSCashFlow = 0;

                    double totalConnCount = connData.Rows.Count;
                    double totalDayConnCount = 0;
                    double totalNightConnCount = 0;

                    double sumConnTimes = 0;
                    double sumBTS = 0;
                    double sumSTS = 0;
                    double sumSTB = 0;


                    double sumDayConnTimes = 0;
                    double sumDayBTS = 0;
                    double sumDaySTS = 0;
                    double sumDaySTB = 0;

                    double sumNightConnTimes = 0;
                    double sumNightBTS = 0;
                    double sumNightSTS = 0;
                    double sumNightSTB = 0;

                    foreach (DataRow objConnRow in connData.Rows)
                    {
                        double lnCostDiff = double.Parse(objConnRow["DIFF"].ToString());
                        double lnSTSCostDiff = double.Parse(objConnRow["STS_DIFF"].ToString());
                        double lnBTS = double.Parse(objConnRow["BOTTOM_TO_SLIPS"].ToString());
                        double lnSTS = double.Parse(objConnRow["SLIPS_TO_SLIPS"].ToString());
                        double lnSTB = double.Parse(objConnRow["SLIPS_TO_BOTTOM"].ToString());
                        string dayNightStatus = objConnRow["DAY_NIGHT"].ToString();


                        if (lnCostDiff < 0)
                        {
                            sumNegative = sumNegative + Math.Abs(lnCostDiff);
                        }
                        else
                        {
                            sumPositive = sumPositive + lnCostDiff;
                        }


                        if (lnSTSCostDiff < 0)
                        {
                            sumSTSNegative = sumSTSNegative + Math.Abs(lnSTSCostDiff);
                        }
                        else
                        {
                            sumSTSPositive = sumSTSPositive + lnSTSCostDiff;
                        }


                        sumConnTimes = sumConnTimes + (lnBTS + lnSTS + lnSTB);
                        sumBTS += lnBTS;
                        sumSTS += lnSTS;
                        sumSTB += lnSTB;


                        if (dayNightStatus == "D")
                        {
                            totalDayConnCount += 1;
                            sumDayConnTimes += (lnBTS + lnSTS + lnSTB);
                            sumDayBTS += lnBTS;
                            sumDaySTS += lnSTS;
                            sumDaySTB += lnSTB;
                        }

                        if (dayNightStatus == "N")
                        {
                            totalNightConnCount += 1;
                            sumNightConnTimes = sumNightConnTimes + (lnBTS + lnSTS + lnSTB);
                            sumNightBTS += lnBTS;
                            sumNightSTS += lnSTS;
                            sumNightSTB += lnSTB;
                        }


                    }


                    if (sumPositive > sumNegative)
                    {
                        objDrlgConnSummary.NetCashFlow = Math.Round(sumPositive - sumNegative, 2);
                    }
                    else
                    {
                        objDrlgConnSummary.NetCashFlow = -1 * Math.Round(sumNegative - sumPositive, 2);
                    }


                    objDrlgConnSummary.PositiveCashFlow = Math.Round(sumPositive, 2);
                    objDrlgConnSummary.NegativeCashFlow = Math.Round(sumNegative, 2);



                    if (sumSTSPositive > sumSTSNegative)
                    {
                        objDrlgConnSummary.NetSTSCashFlow = Math.Round(sumSTSPositive - sumSTSNegative, 2);
                    }
                    else
                    {
                        objDrlgConnSummary.NetSTSCashFlow = -1 * Math.Round(sumSTSNegative - sumSTSPositive, 2);
                    }

                    objDrlgConnSummary.PositiveSTSCashFlow = Math.Round(sumSTSPositive, 2);
                    objDrlgConnSummary.NegativeSTSCashFlow = Math.Round(sumSTSNegative, 2);


                    objDrlgConnSummary.avgTime = 0;
                    objDrlgConnSummary.avgBTS = 0;
                    objDrlgConnSummary.avgSTS = 0;
                    objDrlgConnSummary.avgSTB = 0;

                    if (sumConnTimes > 0 && totalConnCount > 0)
                    {
                        objDrlgConnSummary.avgTime = Math.Round(sumConnTimes / totalConnCount, 2);
                    }

                    if (sumBTS > 0 && totalConnCount > 0)
                    {
                        objDrlgConnSummary.avgBTS = Math.Round(sumBTS / totalConnCount, 2);
                    }

                    if (sumSTS > 0 && totalConnCount > 0)
                    {
                        objDrlgConnSummary.avgSTS = Math.Round(sumSTS / totalConnCount, 2);
                    }

                    if (sumSTB > 0 && totalConnCount > 0)
                    {
                        objDrlgConnSummary.avgSTB = Math.Round(sumSTB / totalConnCount, 2);
                    }



                    objDrlgConnSummary.avgTimeD = 0;
                    objDrlgConnSummary.avgBTSD = 0;
                    objDrlgConnSummary.avgSTSD = 0;
                    objDrlgConnSummary.avgSTBD = 0;


                    if (sumDayConnTimes > 0 && totalDayConnCount > 0)
                    {
                        objDrlgConnSummary.avgTimeD = Math.Round(sumDayConnTimes / totalDayConnCount, 2);
                    }

                    if (sumDayBTS > 0 && totalDayConnCount > 0)
                    {
                        objDrlgConnSummary.avgBTSD = Math.Round(sumDayBTS / totalDayConnCount, 2);
                    }

                    if (sumDaySTS > 0 && totalDayConnCount > 0)
                    {
                        objDrlgConnSummary.avgSTSD = Math.Round(sumDaySTS / totalDayConnCount, 2);
                    }

                    if (sumDaySTB > 0 && totalDayConnCount > 0)
                    {
                        objDrlgConnSummary.avgSTBD = Math.Round(sumDaySTB / totalDayConnCount, 2);
                    }


                    objDrlgConnSummary.avgTimeN = 0;
                    objDrlgConnSummary.avgBTSN = 0;
                    objDrlgConnSummary.avgSTSN = 0;
                    objDrlgConnSummary.avgSTBN = 0;


                    if (sumNightConnTimes > 0 && totalNightConnCount > 0)
                    {
                        objDrlgConnSummary.avgTimeN = Math.Round(sumNightConnTimes / totalNightConnCount, 2);
                    }

                    //if (sumNightSTB > 0 && totalNightConnCount > 0)
                    if (sumNightBTS > 0 && totalNightConnCount > 0)
                    {
                        //objDrlgConnSummary.avgBTSN = Math.Round(sumNightSTB / totalNightConnCount, 2);
                        objDrlgConnSummary.avgBTSN = Math.Round(sumNightBTS / totalNightConnCount, 2);
                    }

                    if (sumNightSTS > 0 && totalNightConnCount > 0)
                    {
                        objDrlgConnSummary.avgSTSN = Math.Round(sumNightSTS / totalNightConnCount, 2);
                    }

                    if (sumNightSTB > 0 && totalNightConnCount > 0)
                    {
                        objDrlgConnSummary.avgSTBN = Math.Round(sumNightSTB / totalNightConnCount, 2);
                    }


                    #endregion

                    #region Histogram Data

                    Dictionary<double, double> bins = new Dictionary<double, double>();

                    //First generate bins for histogram
                    foreach (DataRow connRow in connData.Rows)
                    {
                        double lnBTS = double.Parse(connRow["BOTTOM_TO_SLIPS"].ToString());
                        double lnSTS = double.Parse(connRow["SLIPS_TO_SLIPS"].ToString());
                        double lnSTB = double.Parse(connRow["SLIPS_TO_BOTTOM"].ToString());

                        double lnTotalTime = Math.Ceiling(lnBTS + lnSTS + lnSTB);

                        if (bins.ContainsKey(lnTotalTime))
                        {
                            bins[lnTotalTime] += 1;
                        }
                        else
                        {
                            bins.Add(lnTotalTime, 1);
                        }
                    }


                    double[] arrBins = bins.Keys.OrderBy(x => x).ToArray();


                    for (int i = arrBins.Length - 1; i >= 0; i--)
                    {

                        double lnKey = arrBins[i];

                        DataRow newRow = histogramData.NewRow();
                        newRow["X"] = lnKey;
                        newRow["Y"] = bins[lnKey];

                        histogramData.Rows.Add(newRow);
                    }

                    //foreach (double lnKey in bins.Keys)
                    //{
                    //    DataRow newRow = histogramData.NewRow();
                    //    newRow["X"] = lnKey;
                    //    newRow["Y"] = bins[lnKey];

                    //    histogramData.Rows.Add(newRow);
                    //}
                    #endregion




                    //convert connection dates to local  Nitin 21-10-2021
                    foreach (DataRow objRow in objDrlgConnSummary.connData.Rows)
                    {

                        DateTime connFromDate = DateTime.Parse(DataService.checkNull(objRow["FROM_DATE"], new DateTime()).ToString());
                        DateTime connToDate = DateTime.Parse(DataService.checkNull(objRow["TO_DATE"], new DateTime()).ToString());

                        objRow["FROM_DATE"] = connFromDate.ToLocalTime().ToString("MMM-dd-yyyy HH:mm:ss"); //21-10-2021 prath
                        objRow["TO_DATE"] = connToDate.ToLocalTime().ToString("MMM-dd-yyyy HH:mm:ss");

                    }
                    

                    objResponse.Response = JsonConvert.SerializeObject(objDrlgConnSummary);

                    if (objDrlgConnSummary.connData.Rows.Count == 0)
                    {
                        objResponse.Warnings = "No Drlg. Connections found for the selection";
                    }


                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data";
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in getDrlgConnections " + ex.Message + ex.StackTrace;
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
                UserSettings.UserSettings objSettings = objMgr.loadUserSettings(UserId, DrlgConnSettings.SettingsId, wellId);

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
                objSettings.SettingsId = DrlgConnSettings.SettingsId;


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


        private Broker.BrokerResponse updateComments(Broker.BrokerRequest paramRequest)
        {
            try
            {

                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string Depth = paramRequest.Parameters.Where(x => x.ParamName.Contains("Depth")).FirstOrDefault().ParamValue;
                string Comments = paramRequest.Parameters.Where(x => x.ParamName.Contains("Comments")).FirstOrDefault().ParamValue;

                string strSQL = "";

                //Delete existing settings
                strSQL = "UPDATE   VMX_AKPI_DRLG_CONNECTIONS SET USER_COMMENT='" + Comments + "' WHERE WELL_ID ='" + wellId + "' AND ROUND(DEPTH,0)=" + Depth;
                paramRequest.objDataService.executeNonQuery(strSQL);



                if (paramRequest.objDataService.executeNonQuery(strSQL))
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
                    objBadResponse.Errors = "Error saving user Comments";
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

    }
}
