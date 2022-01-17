using eVuMax.DataBroker.Common;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Data;

using VuMaxDR.Common;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.Summary.DrlgStand
{
    public class ConnectionLogProcessor
    {
            public Dictionary<int, ConnectionLogPoint> connectionPoints = new Dictionary<int, ConnectionLogPoint>();
            public int ProcessStatus = 0;
            public double SlotTimeSec = 1800d;
            public int SectionType = 0; // '0 - Surface/Vertical 1 - Curve/Lateral
            public double MAX_DEPTH_DIFF = 70d;
            public DateTime DayTimeHoursFrom;
            public DateTime DayTimeHoursTo;
            private const string cnECD = "ECD";

            // 'Dim objFile As System.IO.StreamWriter

            private TimeLog __localTimeLog;
            private DataService objLocalConn;

            #region Algorithm Settings
            public bool RUN_DRLG_CHECK = true;
            public bool RUN_HKLD_CHECK = true;
        #endregion

        ///Nishant
        public DataBroker.Broker.BrokerRequest objRequest = new Broker.BrokerRequest(); //Nishant 
        public string WellID = "";
        public rigState objRigState = new rigState();
        public string LastError = "";
        public ADSettings objADSettings = new ADSettings();
        private VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
        private MnemonicMappingMgr objMnemonicMappingMgr = new MnemonicMappingMgr();

        public ConnectionLogProcessor(ref DataBroker.Broker.BrokerRequest paramRequest, string paramWellID)
        {
            objRequest = paramRequest;
            WellID = paramWellID;
            objLocalConn = objRequest.objDataService;
            objADSettings.loadSettings();
            objMnemonicMappingMgr.loadMappings(ref paramRequest.objDataService);
        }


        //Nishant
        public  DateTime convertUTCToWellTimeZone(DateTime paramDate)
        {
            try
            {
                
                objWell = VuMaxDR.Data.Objects.Well.loadObject(ref objRequest.objDataService, WellID,ref LastError);
                var dtDate = paramDate.ToLocalTime(); // 'The date will already be in local time zone ...
                string localOffset = TimeOffsetInfo.getLocalTimeZoneUTCOffset(dtDate);
                string newOffset = objWell.timeZone;
                int Difference = TimeOffsetInfo.getTimeZoneDifferenceMinutes(localOffset, newOffset);
                dtDate = dtDate.AddMinutes(Difference);
                return dtDate;
            }
            catch (Exception ex)
            {
                return paramDate;
            }
        }

        public  DateTime convertWellToLocalTimeZone(DateTime paramDate)
        {
            try
            {
                var dtDate = paramDate; // 'The date will already be in local time zone ...
                string localOffset = objWell.timeZone;
                string newOffset = TimeOffsetInfo.getLocalTimeZoneUTCOffset(dtDate);
                int Difference = TimeOffsetInfo.getTimeZoneDifferenceMinutes(localOffset, newOffset);
                dtDate = dtDate.AddMinutes(Difference);
                return dtDate;
            }
            catch (Exception ex)
            {
                return paramDate;
            }
        }

        public void ProcessPoints(ref TimeLog objTimeLog, DateTime fromDate, DateTime toDate)
        {
            try
            {
                if (ProcessStatus == 1)
                {
                    return;
                }
                objRigState = rigState.loadWellRigStateSetup(ref objRequest.objDataService, WellID); //Nishant

                ProcessStatus = 1;
                __localTimeLog = objTimeLog;
                connectionPoints.Clear();
                //if (objADSettings.IsADActive)
                //{
                //    objLocalConn = new DataService(VuMaxDR.Data.DataService.vmDatabaseType.SQLServer, "2008", true, true);
                //}
                //else
                //{
                //    objLocalConn = new DataService(VuMaxDR.Data.DataService.vmDatabaseType.SQLServer, "2008", true);
                //}

                //objLocalConn.OpenConnection(objRequest.objDataService.UserName, objRequest.objDataService.Password, objRequest.objDataService.ServerName);
                if (objTimeLog is null)
                {
                    ProcessStatus = 0;
                    return;
                }


                // 'Load Settings
                string strCheck1 = WellSettings.getWellSetting(ref objLocalConn, WellID, WellSettings.WLS_CONN_SETTING1, "1");
                string strCheck2 = WellSettings.getWellSetting(ref objLocalConn, WellID, WellSettings.WLS_CONN_SETTING2, "1");
                if (Util.ValEx(strCheck1) == 1)
                {
                    RUN_DRLG_CHECK = true;
                }
                else
                {
                    RUN_DRLG_CHECK = false;
                }

                if (Util.ValEx(strCheck2) == 1)
                {
                    RUN_HKLD_CHECK = true;
                }
                else
                {
                    RUN_HKLD_CHECK = false;
                }


                // 'objFile = New System.IO.StreamWriter("c:\output\connection.txt")

                string __dataTableName = objTimeLog.getDataTableName(ref objLocalConn);
                var limitDate = toDate;

                // 'Add 1 day to the toDate
                toDate = toDate.AddDays(1d);
                DataTable objData = objLocalConn.getTable("SELECT DATETIME,DEPTH,HDTH,HKLD,RIG_STATE,TIME_DURATION FROM " + __dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IS NOT NULL ORDER BY DATETIME DESC");
                int startRow = -1;

                // 'Find the row no. where to start
                for (int i = 0;  i <= objData.Rows.Count - 1; i++)
                {
                    DateTime lnDate =Convert.ToDateTime(objData.Rows[i]["DATETIME"]);
                    if (lnDate < limitDate)
                    {
                        startRow = i;
                        break;
                    }
                }

                if (startRow >= 0)
                {
                    //for (int i = startRow, loopTo1 = objData.Rows.Count - 1; i <= loopTo1; i++)
                    
                    for (int i = startRow; i <= objData.Rows.Count - 1; i++)
                    {
                        int lnRigState = Convert.ToInt32(objData.Rows[i]["RIG_STATE"]);
                        double lnHkld = Convert.ToDouble(objData.Rows[i]["HKLD"]);
                        DateTime dateTime = Convert.ToDateTime(objData.Rows[i]["DATETIME"]);
                        double lnDepth = Convert.ToDouble( objData.Rows[i]["DEPTH"]);
                        DateTime localDateTime = convertUTCToWellTimeZone(dateTime);
                        if (lnRigState == 2 | lnRigState == 13 & lnHkld < objRigState.HookloadCutOff)
                        {
                            // 'If lnRigState = 2 Then

                            int forwardPointer = i;
                            if (dateTime <= DateTime.Parse("22-Dec-2016 12:50:15"))
                            {
                                bool halt = true;
                            }

                            if (Math.Round(lnDepth, 0) == 675d)
                            {
                                bool halt1 = true;
                            }

                            detectAndAddPoints(objData, i, ref forwardPointer);
                            i = forwardPointer;
                        }
                    }
                }




                // '************** Process these connections for other information ************************''
                
                //Original Nitins Code in vb
                //foreach (ConnectionLogPoint objItem in connectionPoints.Values)
                //{
                //    processConnection(ref objItem, objLocalConn);
                //    // '**************************************************************************************''
                //}


                // '************** Process these connections for other information ************************''

                ////New Logic for ProcessConnecion coz ref cannot be used in for Each Loop
                processConnection(ref connectionPoints, objLocalConn);



                ProcessStatus = 0;
                try
                {
                    objData.Dispose();
                    GC.Collect();
                    GC.WaitForPendingFinalizers();
                    GC.Collect();
                }
                catch (Exception ex)
                {
                }

                objLocalConn.closeConnection();
            }

            // objFile.Flush()
            // objFile.Close()

            catch (Exception ex)
            {
                ProcessStatus = 0;
            }
        }


        public void detectAndAddPoints(DataTable objData, int currentRowIndex, ref int forwardPointer)
        {
            try
            {
                double lnHKldCutOff = objRigState.HookloadCutOff;
                double lnInSlipsDepth = Convert.ToDouble( objData.Rows[currentRowIndex]["DEPTH"]);
                double lnHoleDepth =Convert.ToDouble(objData.Rows[currentRowIndex]["HDTH"]);
                int lnInSlipsRowIndex = currentRowIndex;
                //VuMaxLogger.logConnMsg("Looking for Connection @" + lnHoleDepth.ToString());
                bool rotateDataFound = false;
                bool isDrillingConnection = false;
                bool isDrillingFound = false;
                bool isNextDrillingFound = false;
                DateTime pointerDate = Convert.ToDateTime( objData.Rows[currentRowIndex]["DATETIME"]);
                int rowThreshold = 5 * 60;  // '3 Hours is the limit ... it's a case when rig is in service
                int timeThreshold = 5 * 60; // 'time threshold in minutes ... 5 hours ...
                var lowerLimit = pointerDate.AddMinutes(-1 * timeThreshold);
                var upperLimit = pointerDate.AddMinutes(timeThreshold);
                int searchLimit = Convert.ToInt32(Math.Round(currentRowIndex + rowThreshold * 60 / 5d));
                if (searchLimit > objData.Rows.Count - 1)
                {
                    searchLimit = objData.Rows.Count - 1;
                }

                DateTime drillingEndTime = default(DateTime);
                DateTime drillingStartTime = default(DateTime);
                DateTime slipsStartTime = default(DateTime);
                DateTime slipsEndTime = default(DateTime);
                DateTime slipsToBottomTime = default(DateTime);
                int drillingEndRowIndex = 0;
                int slipsStartRowIndex = 0;
                int slipsEndRowIndex = 0;
                int slipsToBottomRowIndex = 0;
                int drillingStartRowIndex = 0;
                int depthCounter = 0;
                double drillingEndHkld = 0d;

                // 'Go back upto 60 minutes and find out ...
                //for (int i = currentRowIndex, loopTo = objData.Rows.Count - 1; i <= loopTo; i++)
                for (int i = currentRowIndex; i < objData.Rows.Count - 1; i++)
                    {
                    int lnRigState = Convert.ToInt32(objData.Rows[i]["RIG_STATE"]);
                    drillingEndTime = Convert.ToDateTime(objData.Rows[i]["DATETIME"]);
                    drillingEndRowIndex = i;
                    drillingEndHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    if (drillingEndTime <= lowerLimit)
                    {
                        break;
                    }

                    if (lnRigState == 0 | lnRigState == 1 | lnRigState == 19)
                    {

                        // 'check if it's a drilling for at least 1 minute ...
                        var currentDate = drillingEndTime;
                        bool isConstantlyDrilling = true;
                        int lnBreakRow = i;
                        //for (int j = i, loopTo1 = objData.Rows.Count - 1; j <= loopTo1; j++)
                        for (int j = i; j < objData.Rows.Count - 1; j++)
                        
                        {
                            int lnSubRigState = Convert.ToInt32(objData.Rows[j]["RIG_STATE"]);
                            DateTime lnSubDate = Convert.ToDateTime( objData.Rows[j]["DATETIME"]);
                            
                            if (Math.Abs(DateAndTime.DateDiff(DateInterval.Second, currentDate, lnSubDate)) >= 60L)
                            {
                                break;
                            }

                            if (lnSubRigState == 0 | lnSubRigState == 1 | lnSubRigState == 19)
                            {
                            }
                            // 'Do nothing ...
                            else
                            {
                                isConstantlyDrilling = false;
                                lnBreakRow = j;
                                break;
                            }
                        }

                        // '### Continuous Drilling Check ######''
                        if (!RUN_DRLG_CHECK)
                        {
                            //VuMaxLogger.logConnMsg("Continuous drilling check is off ... assuming continuous drilling ");
                            
                            isConstantlyDrilling = true;
                        }
                    // '####################################''



                    StartOver:
                        ;
                        if (!isConstantlyDrilling)
                        {
                            bool subDrillingRowFound = false;
                            //for (int j = lnBreakRow, loopTo2 = objData.Rows.Count - 1; j <= loopTo2; j++)
                            for (int j = lnBreakRow; j <= objData.Rows.Count - 1; j++)
                              {
                                int lnSubRigState = Convert.ToInt32(objData.Rows[j]["RIG_STATE"]);
                                DateTime lnSubDate = Convert.ToDateTime(objData.Rows[j]["DATETIME"]);
                                if (lnSubDate <= lowerLimit)
                                {
                                    break;
                                }

                                if (lnSubRigState == 0 | lnSubRigState == 1 | lnSubRigState == 19)
                                {
                                    if (RUN_DRLG_CHECK)
                                    {
                                        int subSubStartRow = j;
                                    StartSubSearch:
                                        ;
                                        //for (int ssr = subSubStartRow, loopTo3 = objData.Rows.Count - 1; ssr <= loopTo3; ssr++)
                                        for (int ssr = subSubStartRow; ssr <= objData.Rows.Count - 1; ssr++)
                                        
                                        {
                                            if (ssr == objData.Rows.Count - 1)
                                            {
                                                break;
                                            }

                                            int lnsSubRigState = Convert.ToInt32(objData.Rows[ssr]["RIG_STATE"]);
                                            DateTime lnsSubDate = Convert.ToDateTime( objData.Rows[ssr]["DATETIME"]);
                                            if (lnsSubRigState == 0 | lnsSubRigState == 1 | lnsSubRigState == 19)
                                            {
                                                if (Math.Abs(DateAndTime.DateDiff(DateInterval.Second, lnsSubDate, lnSubDate)) >= 60L)
                                                {
                                                    subDrillingRowFound = true;
                                                    drillingEndTime = Convert.ToDateTime( objData.Rows[ssr]["DATETIME"]);
                                                    drillingEndRowIndex = ssr;
                                                    drillingEndHkld = Convert.ToDouble( objData.Rows[ssr]["HKLD"]);
                                                    isDrillingFound = true;
                                                    goto Continue1;
                                                    break;
                                                }
                                            }
                                            else
                                            {
                                                subSubStartRow = ssr + 1;
                                                goto StartSubSearch;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        subDrillingRowFound = true;
                                        drillingEndTime = Convert.ToDateTime( objData.Rows[j]["DATETIME"]);
                                        drillingEndRowIndex = j;
                                        drillingEndHkld = Convert.ToDouble( objData.Rows[j]["HKLD"]);
                                        isDrillingFound = true;
                                        goto Continue1;
                                        break;
                                    }
                                }
                            }

                        Continue1:
                            
                            // '### Continuous Drilling Check ######''
                            if (!RUN_DRLG_CHECK)
                            {
                                subDrillingRowFound = true;
                            }
                            // '####################################''

                            if (!subDrillingRowFound)
                            {
                                isDrillingFound = false;
                                break;
                            }
                        }

                        isDrillingFound = true;
                        break;
                    }
                }

                if (isDrillingFound)
                {
                    //VuMaxLogger.logConnMsg("Drilling activity found");
                }
                else
                {
                    //VuMaxLogger.logConnMsg("Drilling activity not found");
                }
                
                for (int i = currentRowIndex; i >= 0; i -= 1)
                {
                    int lnRigState = Convert.ToInt32(objData.Rows[i]["RIG_STATE"]);
                    drillingStartTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                    drillingStartRowIndex = i;
                    if (drillingStartTime >= upperLimit)
                    {
                        break;
                    }

                    if (lnRigState == 0 | lnRigState == 1 | lnRigState == 19)
                    {

                        // 'Add 1 minute and find out if it's drilling continuous ...
                        var lnEndLimitNextDrillingTime = drillingStartTime.AddSeconds(60d);
                        bool isContinuousDrilling = true;
                        for (int j = i; j >= 0; j -= 1)
                        {
                            DateTime lnCurrentDateTime = Convert.ToDateTime( objData.Rows[j]["DATETIME"]);
                            if (lnCurrentDateTime >= upperLimit)
                            {
                                break;
                            }

                            if (lnCurrentDateTime >= lnEndLimitNextDrillingTime)
                            {
                                break;
                            }

                            int lnSubRigState = Convert.ToInt32( objData.Rows[j]["RIG_STATE"]);
                            if (lnSubRigState == 0 | lnSubRigState == 1 | lnSubRigState == 19)
                            {
                            }
                            // 'Nothing to do ...
                            else
                            {
                                isContinuousDrilling = false;
                            }
                        }


                        // '### Continuous Drilling Check ######''
                        if (!RUN_DRLG_CHECK)
                        {
                            //VuMaxLogger.logConnMsg("Continuous drilling check is off ... assuming continuous drilling ");
                            isContinuousDrilling = true;
                        }
                        // '####################################''


                        if (isContinuousDrilling)
                        {
                            isNextDrillingFound = true;
                            break;
                        }
                    }
                }

                if (isNextDrillingFound)
                {
                    //VuMaxLogger.logConnMsg("Next continuous drilling found");
                }
                else
                {
                    //VuMaxLogger.logConnMsg("Next continuous drilling not found");
                }

                if (!isDrillingFound | !isNextDrillingFound)
                {

                    // '//No drilling found ... make fixed jump

                    // '//Earlier Jump was 1 hour, which was skipping some connections
                    // 'forwardPointer = forwardPointer + (12 * 60)

                    // '//This will make only 5 minute jump
                    forwardPointer = forwardPointer + 12 * 5;
                    return;
                }
                else
                {
                    forwardPointer = drillingEndRowIndex;


                    // 'Connection Detection for Curve/Lateral
                    if (SectionType == 1)
                    {

                        // 'Additional check to see if the bit is near bottom
                        double depthDiff = lnHoleDepth - lnInSlipsDepth;
                        if (depthDiff > MAX_DEPTH_DIFF)
                        {
                            // 'reject it ... it's not a connection
                          //  VuMaxLogger.logConnMsg("Rejecting connection as depth diff is > " + MAX_DEPTH_DIFF.ToString);
                            return;
                        }
                    }

                    // 'Max. Depth difference logic doesn't apply to Surface/Vertical section
                    if (SectionType == 0)
                    {

                        // 'Nothing to do here ... 

                    }
                }



                // 'Go backward and find the slip start time


                if (RUN_HKLD_CHECK)
                {
                    //VuMaxLogger.logConnMsg("Hookload check is on");
                    for (int i = drillingEndRowIndex - 1; i >= 0; i--)
                    {
                        double lnHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                        int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                        if (lnHkld <= lnHKldCutOff | lnRigState == 2)
                        {
                            slipsStartRowIndex = i;
                            slipsStartTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                            break;
                        }
                    }
                }
                else
                {
                    //VuMaxLogger.logConnMsg("Hookload check is off");
                    for (int i = drillingEndRowIndex - 1; i >= 0; i--)
                    {
                        double lnHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                        int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                        if (lnHkld <= lnHKldCutOff & (lnRigState == 2 | lnRigState == 11 | lnRigState == 12 | lnRigState == 13 | lnRigState == 14))
                        {
                            slipsStartRowIndex = i;
                            slipsStartTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                            break;
                        }
                    }
                }

                if (slipsStartRowIndex > 0)
                {

                    // 'From the beginning of the slips, find the end time of slips

                    if (RUN_HKLD_CHECK)
                    {
                        for (int i = slipsStartRowIndex - 1; i >= 0; i--)
                        {
                            double lnHkld = Convert.ToDouble(objData.Rows[i]["HKLD"]);
                            if (lnHkld > lnHKldCutOff)
                            {
                                slipsEndRowIndex = i;
                                slipsEndTime = Convert.ToDateTime(objData.Rows[i]["DATETIME"]);
                                break;
                            }
                        }
                    }
                    else
                    {
                        for (int i = slipsStartRowIndex - 1; i >= 0; i--)
                        {
                            double lnHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                            int lnRigState =Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                            if (lnHkld > lnHKldCutOff & (lnRigState == 2 | lnRigState == 11 | lnRigState == 12 | lnRigState == 13 | lnRigState == 14))
                            {
                                slipsEndRowIndex = i;
                                slipsEndTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                                break;
                            }
                        }
                    }

                    int rowThresholdNext = 60 * 24; // '24 Hours 
                    int searchLimitNext = Convert.ToInt32(Math.Round(currentRowIndex - rowThreshold * 60 / 5d));
                    if (searchLimitNext < 0)
                    {
                        searchLimitNext = 0;
                    }

                    // 'Find the next bottom .... wait till the 
                    bool nextDrillingFound = false;
                    for (int i = slipsEndRowIndex - 1; i >= searchLimitNext; i--)
                    {
                        int lnRigState =Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                        if (lnRigState == 0 | lnRigState == 1 | lnRigState == 19)
                        {
                            // 'Check if it's proper slips to bottom time ...

                            // 'Add 1 minute and find out if it's drilling continuous ...
                            DateTime lnEndLimitNextDrillingTime = drillingStartTime.AddSeconds(60);
                            bool isContinuousDrilling = true;
                            for (int j = i; j >= 0; j-- )
                            {
                                DateTime lnCurrentDateTime =Convert.ToDateTime( objData.Rows[j]["DATETIME"]);
                                if (lnCurrentDateTime >= upperLimit)
                                {
                                    break;
                                }

                                if (lnCurrentDateTime >= lnEndLimitNextDrillingTime)
                                {
                                    break;
                                }

                                int lnSubRigState = Convert.ToInt32( objData.Rows[j]["RIG_STATE"]);
                                if (lnSubRigState == 0 | lnSubRigState == 1 | lnSubRigState == 19)
                                {
                                }
                                // 'Nothing to do ...
                                else
                                {
                                    isContinuousDrilling = false;
                                }
                            }

                            // '### Continuous Drilling Check ######''
                            if (!RUN_DRLG_CHECK)
                            {
                                isContinuousDrilling = true;
                            }
                            // '####################################''


                            if (isContinuousDrilling)
                            {
                                nextDrillingFound = true;
                                slipsToBottomRowIndex = i;
                                slipsToBottomTime =Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                                break;
                            }
                        }
                    }

                    if (slipsToBottomTime == new DateTime())
                    {
                        slipsToBottomTime = slipsEndTime;
                    }

                    bool FoundHigherHkld = false;
                    if (RUN_HKLD_CHECK)
                    {
                        for (int i = slipsEndRowIndex; i >= slipsToBottomRowIndex; i--)
                        {
                            double lnHkld =Convert.ToDouble( objData.Rows[i]["HKLD"]);
                            int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                            if (lnHkld < lnHKldCutOff)
                            {
                                DateTime lnSubDate = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                                if (lnSubDate > slipsEndTime)
                                {
                                    slipsEndRowIndex = i;
                                    slipsEndTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                                }
                            }
                            else
                            {
                                FoundHigherHkld = true;
                            }
                        }
                    }
                    else
                    {
                        for (int i = slipsEndRowIndex; i >= slipsToBottomRowIndex; i--)
                        {
                            double lnHkld =Convert.ToDouble( objData.Rows[i]["HKLD"]);
                            int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                            if (lnHkld < lnHKldCutOff & (lnRigState == 2 | lnRigState == 11 | lnRigState == 12 | lnRigState == 13 | lnRigState == 14))
                            {
                                DateTime lnSubDate = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                                if (lnSubDate > slipsEndTime)
                                {
                                    slipsEndRowIndex = i;
                                    slipsEndTime = Convert.ToDateTime( objData.Rows[i]["DATETIME"]);
                                }
                            }
                            else
                            {
                                FoundHigherHkld = true;
                            }
                        }
                    }

                    DateTime localTimeSlipStartTime = convertUTCToWellTimeZone(slipsStartTime);
                    DateTime localTimeSlipEndTime = convertUTCToWellTimeZone(slipsEndTime);
                    DateTime localSlipsToBottomTime = convertUTCToWellTimeZone(slipsToBottomTime);
                    double totalTime = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, drillingEndTime, slipsToBottomTime));
                    double Slot1Time = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, drillingEndTime, slipsStartTime));
                    double Slot2Time = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, slipsStartTime, slipsEndTime));
                    double Slot3Time = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, slipsEndTime, slipsToBottomTime));
                    //VuMaxLogger.logConnMsg("Slot 1 Time " + Slot1Time.ToString());
                    //VuMaxLogger.logConnMsg("Slot 2 Time " + Slot2Time.ToString());
                    //VuMaxLogger.logConnMsg("Slot 3 Time " + Slot3Time.ToString());
                                       

                   
                    if (Slot1Time >= 5 & Slot2Time >= 20 & (Slot3Time >= 5 & nextDrillingFound | FoundHigherHkld & nextDrillingFound) & Slot3Time <= 10800 & Slot2Time < 14400)
                    {

                        // 'Check the connection time in Curve/Lateral ... if it's less than 5 minutes then it's not correct
                        if (totalTime < 300)
                        {
                            if (SectionType == 1)
                            {
                                goto MoveForward; // 'Reject it ...
                            }
                        }

                        var objPoint = new ConnectionLogPoint();
                        objPoint.BottomToSlips = Slot1Time;
                        objPoint.SlipsToSlips = Slot2Time;
                        objPoint.SlipsToBottom = Slot3Time;
                        objPoint.TotalSeconds = Slot1Time + Slot2Time + Slot3Time;
                        objPoint.FromDate = drillingEndTime;
                        objPoint.ToDate = slipsToBottomTime;
                        objPoint.BottomToSlipsSeconds = Slot1Time;
                        objPoint.SlipsToSlipsSeconds = Slot2Time;
                        objPoint.SlipsToBottomSeconds = Slot3Time;

                        // 'objPoint.Depth = lnInSlipsDepth
                        objPoint.Depth = lnHoleDepth;
                        objPoint.DayNightStatus = determineDayOrNight(drillingEndTime);


                        // 'Now determine the status

                        // 'Populate the rig states ...
                        for (int i = drillingEndRowIndex + 1; i >= slipsStartRowIndex; i--)
                        {
                            int lnRigState =Convert.ToInt32( DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                            double lnTime = Convert.ToDouble( DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                            if (lnRigState != 0 & lnRigState != 1 & lnRigState != 19)
                            {
                                if (objPoint.BottomToSlipsRigStates.ContainsKey(lnRigState))
                                {
                                    objPoint.BottomToSlipsRigStates[lnRigState] = objPoint.BottomToSlipsRigStates[lnRigState] + lnTime;
                                }
                                else
                                {
                                    objPoint.BottomToSlipsRigStates.Add(lnRigState, lnTime);
                                }
                            }
                        }

                        for (int i = slipsStartRowIndex; i >= slipsEndRowIndex; i--)
                        {
                            int lnRigState = Convert.ToInt32( DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                            double lnTime = Convert.ToDouble( DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                            if (lnRigState != 0 & lnRigState != 1 & lnRigState != 19)
                            {
                                if (objPoint.SlipsToSlipsRigStates.ContainsKey(lnRigState))
                                {
                                    objPoint.SlipsToSlipsRigStates[lnRigState] = objPoint.SlipsToSlipsRigStates[lnRigState] + lnTime;
                                }
                                else
                                {
                                    objPoint.SlipsToSlipsRigStates.Add(lnRigState, lnTime);
                                }
                            }
                        }

                        for (int i = slipsEndRowIndex; i >= slipsToBottomRowIndex; i--)
                        {
                            int lnRigState = Convert.ToInt32( DataService.checkNull(objData.Rows[i]["RIG_STATE"], 0));
                            double lnTime = Convert.ToDouble( DataService.checkNull(objData.Rows[i]["TIME_DURATION"], 0));
                            if (lnRigState != 0 & lnRigState != 1 & lnRigState != 19)
                            {
                                if (objPoint.SlipsToBottomRigStates.ContainsKey(lnRigState))
                                {
                                    objPoint.SlipsToBottomRigStates[lnRigState] = objPoint.SlipsToBottomRigStates[lnRigState] + lnTime;
                                }
                                else
                                {
                                    objPoint.SlipsToBottomRigStates.Add(lnRigState, lnTime);
                                }
                            }
                        }

                        //VuMaxLogger.logConnMsg("Connection Found @" + objPoint.Depth.ToString);
                        objPoint.NOVStatus = ConnectionLogPoint.cnNOVOSStatus.NotApplicable;

                        // '================== Implementation of NOVOS Status Codes ==================================''
                        if (__localTimeLog.logCurves.ContainsKey("NOVOS.ActivityStatus") | __localTimeLog.logCurves.ContainsKey("NOVOS.ACTIVITYSTATUS"))
                        {
                            DataTable objStatusCodes = objLocalConn.getTable("SELECT DISTINCT([NOVOS.ActivityStatus]) AS Status from " + __localTimeLog.__dataTableName + " WHERE DATETIME>='" + objPoint.FromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + objPoint.ToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'");
                            if (objStatusCodes.Rows.Count > 0)
                            {
                                bool AutomatedFound = false;
                                bool NonAutomatedFound = false;
                                foreach (DataRow objStatusRow in objStatusCodes.Rows)
                                {
                                    int statusCode = Convert.ToInt32( DataService.checkNull(objStatusRow["Status"], 0));
                                    if (statusCode == 2)
                                    {
                                        AutomatedFound = true;
                                    }

                                    if (statusCode != 2)
                                    {
                                        NonAutomatedFound = true;
                                    }
                                }

                                if (AutomatedFound & !NonAutomatedFound)
                                {
                                    objPoint.NOVStatus = ConnectionLogPoint.cnNOVOSStatus.Automated;
                                }

                                if (!AutomatedFound & NonAutomatedFound)
                                {
                                    objPoint.NOVStatus = ConnectionLogPoint.cnNOVOSStatus.Manual;
                                }

                                if (AutomatedFound & NonAutomatedFound)
                                {
                                    objPoint.NOVStatus = ConnectionLogPoint.cnNOVOSStatus.Hybrid;
                                }
                            }
                        }
                        // '==========================================================================================''

                        connectionPoints.Add(connectionPoints.Count + 1, objPoint);
                    }

                MoveForward:
                    ;
                    depthCounter += 1;
                }
            }
            catch (Exception ex)
            {
            }
        }

        public ConnectionLogPoint.cnDayNightTime determineDayOrNight(DateTime paramDate)
        {
            try
            {
                DateTime localDate = paramDate;
                if (objWell.wellDateFormat ==VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                {
                    localDate = convertUTCToWellTimeZone(localDate);
                }
                else
                {
                    localDate = convertWellToLocalTimeZone(localDate);
                }
                

                
                DateTime connectionDate = Convert.ToDateTime(DateTime.Now.ToString("dd-MMM-yyyy") + " " + localDate.ToString("HH:mm") + ":00");
                DateTime DayTimeDateFrom = Convert.ToDateTime(DateTime.Now.ToString("dd-MMM-yyyy") + " " + DayTimeHoursFrom.ToString("HH:mm") + ":00");
                DateTime DayTimeDateTo = Convert.ToDateTime( DateTime.Now.ToString("dd-MMM-yyyy") + " " + DayTimeHoursTo.ToString("HH:mm") + ":00");
                if (connectionDate >= DayTimeDateFrom & connectionDate <= DayTimeDateTo)
                {
                    return ConnectionLogPoint.cnDayNightTime.DayTime;
                }
                else
                {
                    return ConnectionLogPoint.cnDayNightTime.NightTime;
                }
            }
            catch (Exception ex)
            {
                return ConnectionLogPoint.cnDayNightTime.DayTime;
            }
        }

        //private void processConnection(ref ConnectionLogPoint paramConnection, DataService paramLocalConnection) //Original
        private void processConnection(ref Dictionary<int, ConnectionLogPoint> paramConnectionPoints, DataService paramLocalConnection)
        {
            try
            {

             

                foreach (ConnectionLogPoint objItem in paramConnectionPoints.Values)
                {
                    ConnectionLogPoint paramConnection = objItem;
                    
                    paramConnection.BottomToSlipsSec = paramConnection.BottomToSlips;
                    paramConnection.SlipsToSlipsSec = paramConnection.SlipsToSlips;
                    paramConnection.SlipsToBottomSec = paramConnection.SlipsToBottom;


                    // 'Try to find the connection before this connection ....
                    string strSQL = "";
                    strSQL = "SELECT TOP 1 * FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + WellID + "' AND TO_DATE<'" + paramConnection.FromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY TO_DATE DESC";
                    DataTable objData = paramLocalConnection.getTable(strSQL);
                    var limitDate = new DateTime();
                    if (objData.Rows.Count > 0)
                    {
                        // 'We have connection ... Determine the limit date ...

                        limitDate = Convert.ToDateTime(DataService.checkNull(objData.Rows[0]["TO_DATE"], new DateTime()));
                    }


                    // 'Get the time log of this connection ...
                    TimeLog objConnTimeLog = __localTimeLog;
                    if (objConnTimeLog is object)
                    {
                        if (limitDate == new DateTime())
                        {
                            limitDate = DateTime.FromOADate(objConnTimeLog.getFirstIndexOptimized(ref paramLocalConnection));
                        }

                        paramConnection.AvgECD = 0;
                        paramConnection.AvgOnBottomROP = 0;
                        paramConnection.AvgROP = 0;
                        var dtFromDate = limitDate;
                        DateTime dtToDate = paramConnection.FromDate;



                        // '#1 --- Calculate Avg. ECD -------------------------------------------------
                        string ECDMnemonic = "";
                        if (objConnTimeLog.logCurves.ContainsKey(cnECD))
                        {
                        }
                        // 'Nothing to do ...
                        else
                        {
                            ECDMnemonic = objMnemonicMappingMgr.getMappedMnemonic(cnECD, objConnTimeLog.logCurves);
                        }

                        if (!string.IsNullOrEmpty(ECDMnemonic.Trim()))
                        {
                            strSQL = "SELECT AVG([" + ECDMnemonic + "]) AS AVGVALUE FROM " + objConnTimeLog.__dataTableName + " WHERE DATETIME>='" + dtFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + dtToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19)";
                            double avgECD = Convert.ToDouble(paramLocalConnection.getValueFromDatabase(strSQL));
                            paramConnection.AvgECD = Math.Round(avgECD, 2);
                        }


                        // '#2 ------ Calculate On Bottom ROP -----------------------------------------------
                        double sumDateTime = 0d;
                        double sumDepth = 0d;
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + objConnTimeLog.__dataTableName + " WHERE DATETIME>='" + dtFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + dtToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19)";
                        sumDateTime = Util.ValEx(paramLocalConnection.getValueFromDatabase(strSQL));
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + objConnTimeLog.__dataTableName + " WHERE DATETIME>='" + dtFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + dtToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0";
                        sumDepth = Util.ValEx(paramLocalConnection.getValueFromDatabase(strSQL));
                        double ROP = 0;
                        if (sumDateTime > 0)
                        {
                            ROP = sumDepth / (sumDateTime / 60 / 60); // ft/second 
                        }
                        else
                        {
                            ROP = 0;
                        }

                        paramConnection.AvgOnBottomROP = ROP;


                        // '#2 ------ Calculate On Bottom ROP -----------------------------------------------
                        sumDateTime = 0d;
                        sumDepth = 0d;
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + objConnTimeLog.__dataTableName + " WHERE DATETIME>='" + dtFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + dtToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                        sumDateTime = Util.ValEx(paramLocalConnection.getValueFromDatabase(strSQL));
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + objConnTimeLog.__dataTableName + " WHERE DATETIME>='" + dtFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + dtToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND NEXT_DEPTH>0 AND HDTH>=0";
                        sumDepth = Util.ValEx(paramLocalConnection.getValueFromDatabase(strSQL));
                        ROP = 0;
                        if (sumDateTime > 0)
                        {
                            ROP = sumDepth / (sumDateTime / 60 / 60); // ft/second 
                        }
                        else
                        {
                            ROP = 0;
                        }

                        paramConnection.AvgROP = ROP;
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }



    }//Class
}//NameSpace
