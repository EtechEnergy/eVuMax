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


namespace eVuMax.DataBroker.Summary.TripConn
{
    public class TripConnSummary : IBroker
    {
        public eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();
        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Function == "TripConnSummary")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = getTripConnSummary(paramRequest);

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

        private Broker.BrokerResponse getTripConnSummary(Broker.BrokerRequest paramRequest)
        {
            try
            {

                objLogger.LogMessage("getTripConnSummary Called");
                TripConnData objTripConnSummary = new TripConnData();

                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string selectionType = paramRequest.Parameters.Where(x => x.ParamName.Contains("SelectionType")).FirstOrDefault().ParamValue.ToString();
                double fromDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDepth")).FirstOrDefault().ParamValue.ToString());
                double toDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDepth")).FirstOrDefault().ParamValue.ToString());
                DateTime fromDate = DateTime.Now;
                DateTime toDate = DateTime.Now;

                bool isRealTime = false;
                int refreshHrs = 24;
                isRealTime = Convert.ToBoolean(paramRequest.Parameters.Where(x => x.ParamName.Contains("isRealTime")).FirstOrDefault().ParamValue);
                
                if (isRealTime)
                {
                    selectionType = "-1";
                }

                try
                {
                    fromDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDate")).FirstOrDefault().ParamValue.ToString());
                    toDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDate")).FirstOrDefault().ParamValue.ToString());

                    //Convert date to UTC
                    fromDate = fromDate.ToUniversalTime();
                    toDate = toDate.ToUniversalTime();

                    refreshHrs = Convert.ToInt32(paramRequest.Parameters.Where(x => x.ParamName.Contains("refreshHrs")).FirstOrDefault().ParamValue);
                }
                catch (Exception)
                {


                }

                objTripConnSummary.WellName = DataService.checkNull(paramRequest.objDataService.getValueFromDatabase("SELECT WELL_NAME FROM VMX_WELL WHERE WELL_ID='" + wellId.Replace("'", "'''") + "'"), "").ToString();

                //Get the primary time log 
                VuMaxDR.Data.Objects.TimeLog objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLog(ref paramRequest.objDataService, wellId);


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
                            //secondsDiff = Math.Abs((maxDate - minDate).TotalSeconds);
                            //minDate = maxDate.AddSeconds(-1 * secondsDiff);
                        }

                        fromDate = minDate;
                        toDate = maxDate;

                        selectionType = "0";
                    }
                }

                //Load User Settings
                UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);

                UserSettings.UserSettings objSettings = objSettingsMgr.loadUserSettings(UserId, TripConnSettings.SettingsId, wellId);

                TripConnSettings objTripConnSettings = null;

                if (objSettings == null)
                {
                    objSettings = new UserSettings.UserSettings();

                    try
                    {
                        objTripConnSettings = JsonConvert.DeserializeObject<TripConnSettings>(objSettings.settingData);
                    }
                    catch (Exception)
                    {


                    }
                }
                else
                {

                    try
                    {
                        objTripConnSettings = JsonConvert.DeserializeObject<TripConnSettings>(objSettings.settingData);
                    }
                    catch (Exception)
                    {


                    }

                }

                if (objTripConnSettings == null)
                {
                    objTripConnSettings = new TripConnSettings();

                    objSettings = new UserSettings.UserSettings();
                    objSettings.UserId = UserId;
                    objSettings.WellId = wellId;
                    objSettings.SettingsId = TripConnSettings.SettingsId;
                    objSettings.settingData = JsonConvert.SerializeObject(objTripConnSettings);

                    //Save these settings
                    objSettingsMgr.saveUserSettings(objSettings);
                }

                //Load and copy user settings also to reduce the round-trip
                objTripConnSummary.userSettings = JsonConvert.SerializeObject(objTripConnSettings);

                string strSQL = "";


                DataTable connData = new DataTable();
                connData.Columns.Add(new DataColumn("DEPTH", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("SLIPS_TO_SLIPS", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("FROM_DATE", typeof(System.String)));
                connData.Columns.Add(new DataColumn("TO_DATE", typeof(System.String)));
                connData.Columns.Add(new DataColumn("DAY_NIGHT", typeof(System.String)));
                connData.Columns.Add(new DataColumn("COMMENTS", typeof(System.String)));
                connData.Columns.Add(new DataColumn("REMARKS", typeof(System.String)));
                connData.Columns.Add(new DataColumn("TOTAL_TIME", typeof(System.String)));
                connData.Columns.Add(new DataColumn("COST", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("TARGET_COST", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("DIFF", typeof(System.Double)));
                connData.Columns.Add(new DataColumn("DIRECTION", typeof(System.Double)));


                DataTable rigStateData = new DataTable();
                rigStateData.Columns.Add(new DataColumn("DEPTH", typeof(System.Double)));
                rigStateData.Columns.Add(new DataColumn("FROM_DATE", typeof(System.DateTime)));
                rigStateData.Columns.Add(new DataColumn("TIMES", typeof(System.String))); //Comma separated values
                rigStateData.Columns.Add(new DataColumn("COMMENTS", typeof(System.String))); //04-09-2021

                DataTable histogramData = new DataTable();
                histogramData.Columns.Add(new DataColumn("X", typeof(System.Double)));
                histogramData.Columns.Add(new DataColumn("Y", typeof(System.Double)));

                DataTable tripInfoData = new DataTable();
                tripInfoData.Columns.Add(new DataColumn("FROM_DATE", typeof(System.DateTime)));
                tripInfoData.Columns.Add(new DataColumn("TO_DATE", typeof(System.DateTime)));
                tripInfoData.Columns.Add(new DataColumn("DIRECTION", typeof(System.Double)));
                tripInfoData.Columns.Add(new DataColumn("START_DEPTH", typeof(System.Double)));
                tripInfoData.Columns.Add(new DataColumn("END_DEPTH", typeof(System.Double)));
                

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                objResponse.Warnings = "";

                //Assign tables

                objTripConnSummary.connData = connData;
                objTripConnSummary.rigStateData = rigStateData;
                objTripConnSummary.histogramData = histogramData;
                objTripConnSummary.tripInfoData = tripInfoData;


                if (selectionType == "0")
                {
                    strSQL = "SELECT * FROM VMX_AKPI_TRIP_CONNECTIONS WHERE WELL_ID='" + wellId + "' AND FROM_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND FROM_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TO_DATE>='"+fromDate.ToString("dd-MMM-yyyy HH:mm:ss")+"' AND TO_DATE<='"+toDate.ToString("dd-MMM-yyyy HH:mm:ss")+"' ORDER BY FROM_DATE";
                }
                else
                {
                    strSQL = "SELECT * FROM VMX_AKPI_TRIP_CONNECTIONS WHERE WELL_ID='" + wellId + "' AND DEPTH>=" + fromDepth.ToString() + " AND DEPTH<=" + toDepth.ToString() + " ORDER BY FROM_DATE";
                }

                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                if (objData != null)
                {


                    //Check if any connection was found. If not then process it
                    if (objData.Rows.Count == 0)
                    {
                        TripConnectionLogProcessor objConnProcessor = new TripConnectionLogProcessor();
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



                    DataTable objExclConn = paramRequest.objDataService.getTable("SELECT DEPTH FROM VMX_TRIP_CONN_INFO WHERE WELL_ID='" + wellId + "'");

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

                    if (objTripConnSettings.RigCost > 0)
                    {
                        CostPerMinute = objTripConnSettings.RigCost / 1440;
                    }

                    double TargetCost = objTripConnSettings.TargetTime * CostPerMinute;


                    #region Connection List
                    //Copy connection list
                    foreach (DataRow objRow in objData.Rows)
                    {

                        DataRow newRow = connData.NewRow();

                        double connDepth = DataService.checkNumericNull(objRow["DEPTH"]);

                        bool ContinueAhead = true;

                        if (!objTripConnSettings.showExcludedConn)
                        {

                            if (exclList.ContainsKey(connDepth))
                            {
                                objTripConnSummary.ExcludedConns += 1;
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


                        double sts = double.Parse(DataService.checkNull(objRow["SLIPS_TO_SLIPS"], 0).ToString());

                        if (sts > 0)
                        {
                            sts = Math.Round(sts / 60, 2);
                        }


                        //Another check of max. time
                        if (objTripConnSettings.MaxConnTime > 0 && objTripConnSettings.SkipConnMaxTime)
                        {
                            double lnTotalConnTime = sts;

                            if (lnTotalConnTime > objTripConnSettings.MaxConnTime)
                            {
                                ContinueAhead = false;
                            }

                        }

                        //Another check of min. time
                        if (objTripConnSettings.MinConnTime > 0 && objTripConnSettings.SkipConnMinTime)
                        {
                            double lnTotalConnTime = sts;

                            if (lnTotalConnTime < objTripConnSettings.MinConnTime)
                            {
                                ContinueAhead = false;
                            }

                        }


                        if (sts <= 0)
                        {
                            ContinueAhead = false;
                        }


                        if (!ContinueAhead)
                        {
                            //skip this connection
                            continue;
                        }

                        newRow["SLIPS_TO_SLIPS"] = sts;

                        DateTime connFromDate = DateTime.Parse(DataService.checkNull(objRow["FROM_DATE"], new DateTime()).ToString());
                        DateTime connToDate = DateTime.Parse(DataService.checkNull(objRow["TO_DATE"], new DateTime()).ToString());

                        double totalSeconds = Math.Abs((connFromDate - connToDate).TotalSeconds);
                        TimeSpan objSpan = new TimeSpan(0, 0, (int)totalSeconds);

                        newRow["COMMENTS"] = DataService.checkNull(objRow["USER_COMMENT"], "").ToString();
                        newRow["FROM_DATE"] = connFromDate.ToString("MMM-dd-yyyy HH:mm:ss");
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


                        newRow["DIFF"] = costDiff;

                        objTripConnSummary.ConnCount += 1;

                        connData.Rows.Add(newRow);

                    }
                    #endregion

                    #region RigState wise break up
                    objLogger.LogMessage("getTripConnSummary Called-Rigstate wise break up started");
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


                    objTripConnSummary.rigStates = uniqueRigStatesData;

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

                        DateTime lnFromDate = DateTime.Parse(objRow["FROM_DATE"].ToString());
                        DateTime lnToDate = DateTime.Parse(objRow["TO_DATE"].ToString());
                        string connComments = DataService.checkNull(objRow["COMMENTS"], "").ToString();

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

                        newRow["DEPTH"] = Math.Round(connDepth, 2);
                        newRow["FROM_DATE"] = lnFromDate.ToLocalTime();
                        newRow["TIMES"] = strTimes;
                        newRow["COMMENTS"] = DataService.checkNull(connComments, "").ToString();

                        rigStateData.Rows.Add(newRow);

                    }
                    objLogger.LogMessage("getTripConnSummary rigStateData Added");

                    #endregion

                    #region Statistics

                    double sumPositive = 0;
                    double sumNegative = 0;
                    double NetCashFlow = 0;

                    double totalConnCount = connData.Rows.Count;
                    double totalDayConnCount = 0;
                    double totalNightConnCount = 0;

                    double sumConnTimes = 0;
                    double sumDayConnTimes = 0;
                    double sumNightConnTimes = 0;

                    foreach (DataRow objConnRow in connData.Rows)
                    {
                        double lnCostDiff = double.Parse(objConnRow["DIFF"].ToString());
                        double lnSTS = double.Parse(objConnRow["SLIPS_TO_SLIPS"].ToString());
                        string dayNightStatus = objConnRow["DAY_NIGHT"].ToString();


                        if (lnCostDiff < 0)
                        {
                            sumNegative = sumNegative + Math.Abs(lnCostDiff);
                        }
                        else
                        {
                            sumPositive = sumPositive + lnCostDiff;
                        }

                        sumConnTimes = sumConnTimes + (lnSTS);

                        if (dayNightStatus == "D")
                        {
                            totalDayConnCount += 1;
                            sumDayConnTimes += (lnSTS);
                        }

                        if (dayNightStatus == "N")
                        {
                            totalNightConnCount += 1;
                            sumNightConnTimes = sumNightConnTimes + (lnSTS);
                        }

                    }


                

                    if (sumPositive > sumNegative)
                    {
                        objTripConnSummary.NetCashFlow = Math.Round(sumPositive - sumNegative, 2);
                    }
                    else
                    {
                        objTripConnSummary.NetCashFlow = -1 * Math.Round(sumNegative - sumPositive, 2);
                    }


                    objTripConnSummary.PositiveCashFlow = Math.Round( sumPositive,2);
                    objTripConnSummary.NegativeCashFlow = Math.Round( sumNegative,2);
                                       

                    objTripConnSummary.avgTime = 0;

                    if (sumConnTimes > 0 && totalConnCount > 0)
                    {
                        objTripConnSummary.avgTime = Math.Round(sumConnTimes / totalConnCount, 2);
                    }


                    objTripConnSummary.avgTimeD = 0;

                    if (sumDayConnTimes > 0 && totalDayConnCount > 0)
                    {
                        objTripConnSummary.avgTimeD = Math.Round(sumDayConnTimes / totalDayConnCount, 2);
                    }

                    objTripConnSummary.avgTimeN = 0;

                    if (sumNightConnTimes > 0 && totalNightConnCount > 0)
                    {
                        objTripConnSummary.avgTimeN = Math.Round(sumNightConnTimes / totalNightConnCount, 2);
                    }

                    #endregion

                    #region Histogram Data

                    Dictionary<double, double> bins = new Dictionary<double, double>();

                    //First generate bins for histogram
                    foreach (DataRow connRow in connData.Rows)
                    {
                        double lnSTS = double.Parse(connRow["SLIPS_TO_SLIPS"].ToString());
                        double lnTotalTime = Math.Ceiling(lnSTS);

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

                    #endregion

                    #region Trip Direction Information
                    objLogger.LogMessage("getTripConnSummary:Trip Direction Information Started");
                    //Process trip detection
                    TripDetection objTripDetection = new TripDetection();
                    objTripDetection.objDataService = paramRequest.objDataService;
                    objTripDetection.objTimeLog = objTimeLog;
                    objTripDetection.startDate = fromDate;
                    objTripDetection.endDate = toDate;
                    objTripDetection.detectTripsAsync();

                    //Update all our connections with trip direction information
                    foreach(DataRow connRow in connData.Rows)
                    {

                        DateTime lnConnFromDate = DateTime.Parse(connRow["FROM_DATE"].ToString());
                        DateTime lnConnToDate = DateTime.Parse(connRow["TO_DATE"].ToString());


                        int Direction = -1;

                        foreach(int lnkey in objTripDetection.tripList.Keys)
                        {
                            if(lnConnFromDate>=objTripDetection.tripList[lnkey].TripStartDate && lnConnFromDate<=objTripDetection.tripList[lnkey].TripEndDate)
                            {
                                Direction = (int)objTripDetection.tripList[lnkey].Direction;
                            }
                        }

                        connRow["DIRECTION"] = Direction;
                    }


                    DateTime recordStartDate=DateTime.MinValue;
                    DateTime recordEndDate=DateTime.MinValue;
                    bool recordStarted = false;
                    int lastDirection = -1;

                    foreach(DataRow connRow in connData.Rows)
                    {

                        int Direction = int.Parse(connRow["DIRECTION"].ToString());

                        if(Direction!=lastDirection)
                        {
                            if(recordStarted)
                            {
                                //Create a new entry
                                recordEndDate = DateTime.Parse(connRow["FROM_DATE"].ToString());


                                DataRow tripDataRow = tripInfoData.NewRow();

                                tripDataRow["FROM_DATE"] = recordStartDate;
                                tripDataRow["TO_DATE"] = recordEndDate;
                                tripDataRow["DIRECTION"] = lastDirection;
                                tripDataRow["START_DEPTH"] = 0;
                                tripDataRow["END_DEPTH"] = 0;

                                tripInfoData.Rows.Add(tripDataRow);


                                //Reset everything
                                recordStarted = true;
                                recordStartDate = recordEndDate;

                            }
                            else
                            {
                                //Start recording
                                recordStarted = true;
                                recordStartDate = DateTime.Parse(connRow["FROM_DATE"].ToString());
                            }
                        }
                        else
                        {
                            //Keep looping
                        }

                        lastDirection = Direction;
                    }


                    if(recordStarted)
                    {

                        DataRow tripDataRow = tripInfoData.NewRow();

                        tripDataRow["FROM_DATE"] = recordStartDate;
                        tripDataRow["TO_DATE"] = DateTime.Parse(connData.Rows[connData.Rows.Count - 1]["FROM_DATE"].ToString());
                        tripDataRow["DIRECTION"] = lastDirection;
                        tripDataRow["START_DEPTH"] = 0;
                        tripDataRow["END_DEPTH"] = 0;

                        tripInfoData.Rows.Add(tripDataRow);

                    }
                    objLogger.LogMessage("getTripConnSummary:Trip Direction Information:  tripInfoData Added");
                    #endregion



                    //Convert display dates to local 
                    foreach (DataRow objRow in connData.Rows)
                    {

                        DateTime lnFromDate = DateTime.Parse(objRow["FROM_DATE"].ToString());
                        DateTime lnToDate = DateTime.Parse(objRow["TO_DATE"].ToString());

                        objRow["FROM_DATE"] = lnFromDate.ToLocalTime().ToString("dd-MMM-yyyy HH:mm:ss");
                        objRow["TO_DATE"] = lnToDate.ToLocalTime().ToString("dd-MMM-yyyy HH:mm:ss");

                    }


                    objResponse.Response = JsonConvert.SerializeObject(objTripConnSummary);

                    if(objTripConnSummary.connData.Rows.Count==0)
                    {
                        objResponse.Warnings = "No Trip Connections found for the selection";
                    }
                    


                }
                else
                {
                    objLogger.LogMessage("VMX_AKPI_TRIP_CONNECTIONS no data found");
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data";
                    objResponse.Response = "";
                }

                return objResponse;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("getTripConnSummary Error: " + ex.Message + ex.StackTrace);
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in getTripConnections " + ex.Message + ex.StackTrace;
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
                UserSettings.UserSettings objSettings = objMgr.loadUserSettings(UserId, TripConnSettings.SettingsId, wellId);

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
                objSettings.SettingsId = TripConnSettings.SettingsId;


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

    }
}
