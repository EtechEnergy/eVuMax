using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;
using eVuMax.DataBroker.Common;
using VuMaxDR.Common;

namespace eVuMax.DataBroker.Summary.DrlgStand
{

     public class StandLogProcessor
    {

        
        public Dictionary<int, StandPoint> connectionPoints = new Dictionary<int, StandPoint>();
        //public int ProcessStatus = 0;
        public DateTime DayTimeHoursFrom;
        public DateTime DayTimeHoursTo;
        public bool ShowOffsetWells = true;
        public double DepthComparisonWindow = 50d;
        private TimeLog __localTimeLog;
        //private DataService objLocalConn;


        //Nishant
        string WellID = "";
        ADSettings objADSettings = new ADSettings();
        Broker.BrokerRequest objRequest = new Broker.BrokerRequest();
                
        public string LastError = "";
        private VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();


       public StandLogProcessor(ref DataBroker.Broker.BrokerRequest paramRequest, string paramWellID)
        {
            objRequest = paramRequest;
            objADSettings.loadSettings();
            WellID = paramWellID;
            //objLocalConn = objRequest.objDataService; //Fix 
            objWell = VuMaxDR.Data.Objects.Well.loadObject(ref objRequest.objDataService, WellID, ref LastError);
        }
        public StandLogProcessor()
        {

        }


        //Nishant
        public DateTime convertUTCToWellTimeZone(DateTime paramDate)
        {
            try
            {

                objWell = VuMaxDR.Data.Objects.Well.loadObject(ref objRequest.objDataService, WellID, ref LastError);
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

        public DateTime convertWellToLocalTimeZone(DateTime paramDate)
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
                //if (ProcessStatus == 1)
                //{
                //    return;
                //}
            
                //ProcessStatus = 1;
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
                //if (objTimeLog is null)
                //{
                // //   ProcessStatus = 0;
                //    return;
                //}

                
                DataTable objData = objRequest.objDataService.getTable("SELECT * FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + WellID + "' AND FROM_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TO_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DEPTH");
                DateTime standStartDate;
                DateTime standEndDate;
                DateTime connStartDate;
                DateTime connEndDate;
                DateTime prevConnStartDate;
                DateTime prevConnEndDate;
                double standDepth = 0d;
                
                try
                {

                
                for (int i = 1; i <= objData.Rows.Count - 1; i++)
                {
                    //objLogger.LogMessage("Process Points inside loop-1 line 130");
                    connStartDate = Convert.ToDateTime( objData.Rows[i]["FROM_DATE"]);
                    connEndDate = Convert.ToDateTime( objData.Rows[i]["TO_DATE"]);
                    prevConnStartDate = Convert.ToDateTime( objData.Rows[i - 1]["FROM_DATE"]);
                    prevConnEndDate =Convert.ToDateTime( objData.Rows[i - 1]["TO_DATE"]);

                    // 'This is first connection, find the starting of the drilling from the beginning of the well ...
                    DataTable objConn = objRequest.objDataService.getTable("SELECT TOP 1 DATETIME,DEPTH FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>'" + prevConnEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND  DATETIME<'" + connStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) ORDER BY DATETIME");
                    if (objConn.Rows.Count > 0)
                    {

                        // 'We found some data ...
                        standStartDate =Convert.ToDateTime( objConn.Rows[0]["DATETIME"]);
                        standEndDate = connStartDate;
                        standDepth = Convert.ToDouble(objConn.Rows[0]["DEPTH"]);

                        // 'Add this point to the list
                        var objPoint = new StandPoint();
                        objPoint.Depth = standDepth;
                        objPoint.DayNightStatus = (StandPoint.cnDayNightTime)determineDayOrNight(standStartDate);
                        objPoint.FromDate = standStartDate;
                        objPoint.ToDate = standEndDate;



                        // 'Calculate ROP
                        objPoint.ROP = calculateROP(objTimeLog, standStartDate, standEndDate);
                        objPoint.RotaryROP = calculateRotaryROP(objTimeLog, standStartDate, standEndDate);
                        objPoint.SlideROP = calculateSlideROP(objTimeLog, standStartDate, standEndDate);

                        // 'Check the ROP

                        if (objPoint.ROP > 5000)
                        {
                        }
                        // 'Reject this stand as there seems some problem with it
                        else
                        {
                            // 'Another Check if POOH, the bit depth shouldn't go up by more than 90 * 3 stands
                            double minDepthInStand = Util.ValEx(objRequest.objDataService.getValueFromDatabase("SELECT MIN(DEPTH) FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + standEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=0 "));
                            if (standDepth - minDepthInStand > 270d)
                            {
                                // 'There seems a Trip Out between these two drilling connections ...
                                bool watchIt = true;
                                DateTime minDepthDate =Convert.ToDateTime(objRequest.objDataService.getValueFromDatabase("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + standEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH<=" + (standDepth - 270d).ToString() + "  ORDER BY DATETIME"));

                                // 'Adjust the end date of this stand, we can't reject it
                                // 'Find the end of drilling of this stand
                                DateTime lastDrillingDate = Convert.ToDateTime(objRequest.objDataService.getValueFromDatabase("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + minDepthDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) ORDER BY DATETIME DESC"));
                                objPoint.ToDate = lastDrillingDate;
                                populateRigStates(ref objPoint, objTimeLog);
                                
                                connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy());
                            }
                            else
                            {
                                populateRigStates(ref objPoint, objTimeLog);
                                

                                // 'It seems valid drilling connection
                                connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy());
                            }
                        }
                    }
                }
                }
                catch (Exception ex)
                {

                    
                }
                
                // 'Find previous connection if found
                if (objData.Rows.Count > 0)
                {
                    DateTime firstConnStartDate =Convert.ToDateTime( objData.Rows[0]["FROM_DATE"]);
                    double firstConnStartDepth = Convert.ToDouble( objData.Rows[0]["DEPTH"]);

                    // 'Find any connection previous to this
                    DataTable objData2 = objRequest.objDataService.getTable("SELECT TOP 1 * FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + WellID + "' AND TO_DATE<='" + firstConnStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY FROM_DATE DESC");
                    if (objData2.Rows.Count > 0)
                    {
                        DateTime dataStartdate = Convert.ToDateTime( objData2.Rows[0]["FROM_DATE"]);
                        double dataStartDepth = Convert.ToDouble( objData2.Rows[0]["DEPTH"]);

                        // 'We found some data ...
                        standStartDate = dataStartdate;
                        standEndDate = firstConnStartDate;
                        standDepth = dataStartDepth;

                        // 'Add this point to the list
                        var objPoint = new StandPoint();
                        objPoint.Depth = standDepth;
                        objPoint.DayNightStatus = (StandPoint.cnDayNightTime)determineDayOrNight(standStartDate);
                        objPoint.FromDate = standStartDate;
                        objPoint.ToDate = standEndDate;

                        // 'Calculate ROP
                        objPoint.ROP = calculateROP(objTimeLog, standStartDate, standEndDate);
                        objPoint.RotaryROP = calculateRotaryROP(objTimeLog, standStartDate, standEndDate);
                        objPoint.SlideROP = calculateSlideROP(objTimeLog, standStartDate, standEndDate);

                        // 'Check the ROP

                        if (objPoint.ROP > 5000)
                        {
                        }
                        // 'Reject this stand as there seems some problem with it
                        else
                        {

                            // 'Another Check if POOH, the bit depth shouldn't go up by more than 90 * 3 stands
                            double minDepthInStand = Util.ValEx(objRequest.objDataService.getValueFromDatabase("SELECT MIN(DEPTH) FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + standEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=0 "));
                            if (standDepth - minDepthInStand > 270d)
                            {
                                // 'There seems a Trip Out between these two drilling connections ...
                                bool watchIt = true;
                                DateTime minDepthDate =Convert.ToDateTime(objRequest.objDataService.getValueFromDatabase("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + standEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH<=" + (standDepth - 270d).ToString() + "  ORDER BY DATETIME"));

                                // 'Adjust the end date of this stand, we can't reject it
                                // 'Find the end of drilling of this stand
                                DateTime lastDrillingDate = Convert.ToDateTime(objRequest.objDataService.getValueFromDatabase("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + minDepthDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) ORDER BY DATETIME DESC"));
                                objPoint.ToDate = lastDrillingDate;
                                populateRigStates(ref objPoint, objTimeLog);
                                connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy());
                            }
                            else
                            {
                                populateRigStates(ref objPoint, objTimeLog);

                                // 'It seems valid drilling connection
                                connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy());
                            }

                            // '//connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy)
                        }
                    }
                    else
                    {
                        // 'Check if any drilling data exist
                        DataTable objData3 = objRequest.objDataService.getTable("SELECT TOP 1 DATETIME,HDTH FROM " + objTimeLog.__dataTableName + " WHERE RIG_STATE IN (0,1,19) AND DATETIME<'" + firstConnStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DATETIME");
                        if (objData3.Rows.Count > 0)
                        {
                            DateTime dataStartdate = Convert.ToDateTime( objData3.Rows[0]["DATETIME"]);
                            double dataStartDepth =Convert.ToDouble( objData3.Rows[0]["HDTH"]);


                            // 'We found some data ...
                            standStartDate = dataStartdate;
                            standEndDate = firstConnStartDate;
                            standDepth = dataStartDepth;

                            // 'Add this point to the list
                            var objPoint = new StandPoint();
                            objPoint.Depth = standDepth;
                            objPoint.DayNightStatus = (StandPoint.cnDayNightTime)determineDayOrNight(standStartDate);
                            objPoint.FromDate = standStartDate;
                            objPoint.ToDate = standEndDate;

                            // 'Calculate ROP
                            objPoint.ROP = calculateROP(objTimeLog, standStartDate, standEndDate);
                            objPoint.RotaryROP = calculateRotaryROP(objTimeLog, standStartDate, standEndDate);
                            objPoint.SlideROP = calculateSlideROP(objTimeLog, standStartDate, standEndDate);

                            // 'Check the ROP

                            if (objPoint.ROP > 5000)
                            {
                            }
                            // 'Reject this stand as there seems some problem with it
                            else
                            {

                                // 'Another Check if POOH, the bit depth shouldn't go up by more than 90 * 3 stands
                                double minDepthInStand =Util.ValEx(objRequest.objDataService.getValueFromDatabase("SELECT MIN(DEPTH) FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + standEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=0 "));
                                if (standDepth - minDepthInStand > 270d)
                                {
                                    // 'There seems a Trip Out between these two drilling connections ...
                                    bool watchIt = true;
                                    DateTime minDepthDate = Convert.ToDateTime(objRequest.objDataService.getValueFromDatabase("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + standEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH<=" + (standDepth - 270d).ToString() + "  ORDER BY DATETIME"));

                                    // 'Adjust the end date of this stand, we can't reject it
                                    // 'Find the end of drilling of this stand
                                    DateTime lastDrillingDate = Convert.ToDateTime(objRequest.objDataService.getValueFromDatabase("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + minDepthDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) ORDER BY DATETIME DESC"));
                                    objPoint.ToDate = lastDrillingDate;
                                    populateRigStates(ref objPoint, objTimeLog);
                                    connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy());
                                }
                                else
                                {
                                    populateRigStates(ref objPoint, objTimeLog);

                                    // 'It seems valid drilling connection
                                    connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy());
                                }

                                
                            }
                        }
                    }
                }

                // 'Find next connection
                if (objData.Rows.Count > 0)
                {
                    DateTime lastConnStartDate = Convert.ToDateTime( objData.Rows[objData.Rows.Count - 1]["FROM_DATE"]);
                    double lastConnStartDepth = Convert.ToDouble( objData.Rows[objData.Rows.Count - 1]["DEPTH"]);
                    DateTime lastConnEndDate = Convert.ToDateTime( objData.Rows[objData.Rows.Count - 1]["TO_DATE"]);

                    // 'Find any connection previous to this
                    DataTable objData2 = objRequest.objDataService.getTable("SELECT TOP 1 * FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + WellID + "' AND FROM_DATE>'" + lastConnStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY FROM_DATE");
                    if (objData2.Rows.Count > 0)
                    {
                        DateTime dataStartdate = Convert.ToDateTime( objData2.Rows[0]["FROM_DATE"]);
                        DateTime dataEndDate = Convert.ToDateTime( objData2.Rows[0]["TO_DATE"]);
                        double dataStartDepth = Convert.ToDouble( objData2.Rows[0]["DEPTH"]);

                        // 'We found some data ...
                        standStartDate = lastConnEndDate;
                        standEndDate = dataStartdate;
                        standDepth = dataStartDepth;

                        // 'Add this point to the list
                        var objPoint = new StandPoint();
                        objPoint.Depth = standDepth;
                        objPoint.DayNightStatus = (StandPoint.cnDayNightTime)determineDayOrNight(standStartDate);
                        objPoint.FromDate = standStartDate;
                        objPoint.ToDate = standEndDate;

                        // 'Calculate ROP
                        objPoint.ROP = calculateROP(objTimeLog, standStartDate, standEndDate);
                        objPoint.RotaryROP = calculateRotaryROP(objTimeLog, standStartDate, standEndDate);
                        objPoint.SlideROP = calculateSlideROP(objTimeLog, standStartDate, standEndDate);

                        // 'Check the ROP
                        if (objPoint.ROP > 5000)
                        {
                        }
                        // 'Reject this stand as there seems some problem with it
                        else
                        {

                            // 'Another Check if POOH, the bit depth shouldn't go up by more than 90 * 3 stands
                            double minDepthInStand = Util.ValEx(objRequest.objDataService.getValueFromDatabase("SELECT MIN(DEPTH) FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + standEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=0 "));
                            if (standDepth - minDepthInStand > 270)
                            {
                                // 'There seems a Trip Out between these two drilling connections ...
                                bool watchIt = true;
                                DateTime minDepthDate = Convert.ToDateTime(objRequest.objDataService.getValueFromDatabase("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + standEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH<=" + (standDepth - 270d).ToString() + "  ORDER BY DATETIME"));

                                // 'Adjust the end date of this stand, we can't reject it
                                // 'Find the end of drilling of this stand
                                DateTime lastDrillingDate = Convert.ToDateTime(objRequest.objDataService.getValueFromDatabase("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + minDepthDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) ORDER BY DATETIME DESC"));
                                objPoint.ToDate = lastDrillingDate;
                                populateRigStates(ref objPoint, objTimeLog);
                                
                                connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy());
                            }
                            else
                            {
                                populateRigStates(ref objPoint, objTimeLog);

                                // 'It seems valid drilling connection
                                
                                connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy());
                            }

                            // '//connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy)
                        }
                    }
                    else
                    {
                        // 'Check if any drilling data exist
                        DataTable objData3 =objRequest.objDataService.getTable("SELECT TOP 1 DATETIME,HDTH FROM " + objTimeLog.__dataTableName + " WHERE RIG_STATE IN (0,1,19) AND  DATETIME>'" + lastConnStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ORDER BY DATETIME DESC");
                        if (objData3.Rows.Count > 0)
                        {
                            DateTime dataStartdate = Convert.ToDateTime( objData3.Rows[0]["DATETIME"]);
                            double dataStartDepth = Convert.ToDouble( objData3.Rows[0]["HDTH"]);

                            // 'We found some data ...
                            standStartDate = lastConnEndDate;
                            standEndDate = dataStartdate;
                            standDepth = dataStartDepth;

                            // 'Add this point to the list
                            var objPoint = new StandPoint();
                            objPoint.Depth = standDepth;
                            objPoint.DayNightStatus = (StandPoint.cnDayNightTime)determineDayOrNight(standStartDate);
                            objPoint.FromDate = standStartDate;
                            objPoint.ToDate = standEndDate;

                            // 'Calculate ROP
                            objPoint.ROP = calculateROP(objTimeLog, standStartDate, standEndDate);
                            objPoint.RotaryROP = calculateRotaryROP(objTimeLog, standStartDate, standEndDate);
                            objPoint.SlideROP = calculateSlideROP(objTimeLog, standStartDate, standEndDate);

                            // 'Check the ROP

                            if (objPoint.ROP > 5000)
                            {
                            }
                            // 'Reject this stand as there seems some problem with it
                            else
                            {

                                // 'Another Check if POOH, the bit depth shouldn't go up by more than 90 * 3 stands
                                double minDepthInStand =Util.ValEx(objRequest.objDataService.getValueFromDatabase("SELECT MIN(DEPTH) FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + standEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH>=0 "));
                                if (standDepth - minDepthInStand > 270d)
                                {
                                    // 'There seems a Trip Out between these two drilling connections ...
                                    bool watchIt = true;
                                    DateTime minDepthDate = Convert.ToDateTime(objRequest.objDataService.getValueFromDatabase("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + standEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH<=" + (standDepth - 270d).ToString() + "  ORDER BY DATETIME"));

                                    // 'Adjust the end date of this stand, we can't reject it
                                    // 'Find the end of drilling of this stand
                                    DateTime lastDrillingDate = Convert.ToDateTime(objRequest.objDataService.getValueFromDatabase("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + standStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + minDepthDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) ORDER BY DATETIME DESC"));
                                    objPoint.ToDate = lastDrillingDate;
                                    populateRigStates(ref objPoint, objTimeLog);
                                    
                                    connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy());
                                }
                                else
                                {
                                    populateRigStates(ref objPoint, objTimeLog);

                                    // 'It seems valid drilling connection
                                    
                                    connectionPoints.Add(connectionPoints.Count + 1, objPoint.getCopy());
                                }

                           
                            }
                        }
                    }
                }


                // '===================================================================================================''
                // '==================Now find stands from offset wells ===============================================''
                // '===================================================================================================''
                if (ShowOffsetWells)
                {
                    string strSQL = "";
                    if (objWell.offsetWells.Count > 0)
                    {
                        string offsetWellID = Convert.ToString(objWell.offsetWells.Values.First().OffsetWellID);

                        foreach (StandPoint objPoint in connectionPoints.Values)
                        {
                            double depthFrom = objPoint.Depth - DepthComparisonWindow;
                            double depthTo = objPoint.Depth + DepthComparisonWindow;

                            // '//Find the stand in offset well with matching depth range
                            strSQL = "SELECT * FROM VMX_AKPI_DRLG_STAND WHERE WELL_ID='" + offsetWellID + "' AND DEPTH>=" + depthFrom.ToString() + " AND DEPTH<=" + depthTo.ToString() + " ORDER BY DEPTH";
                            objData = objRequest.objDataService.getTable(strSQL);
                            if (objData.Rows.Count > 0)
                            {
                                DateTime standFromDate = Convert.ToDateTime(DataService.checkNull(objData.Rows[0]["FROM_DATE"], DateTime.Now.ToString()));
                                DateTime standToDate = Convert.ToDateTime( DataService.checkNull(objData.Rows[0]["TO_DATE"], DateTime.Now.ToString()));
                                double standTime = Math.Abs((standFromDate - standToDate).TotalMinutes); // Math.Abs(DateTime.DateDiff(DateInterval.Minute, standFromDate, standToDate));
                                

                                string dayNightStatus = Convert.ToString( DataService.checkNull(objData.Rows[0]["TIME"], "D"));
                                objPoint.OffsetTime = standTime;
                                if (dayNightStatus == "D")
                                {
                                    objPoint.OffsetDayNightStatus = StandPoint.cnDayNightTime.DayTime;
                                }
                                else
                                {
                                    objPoint.OffsetDayNightStatus = StandPoint.cnDayNightTime.NightTime;
                                }

                                objPoint.OffsetROP =Convert.ToDouble( DataService.checkNull(objData.Rows[0]["ROP"], 0));
                                objPoint.OffsetRotaryROP = Convert.ToDouble( DataService.checkNull(objData.Rows[0]["ROTARY_ROP"], 0));
                                objPoint.OffsetSlideROP =Convert.ToDouble( DataService.checkNull(objData.Rows[0]["SLIDE_ROP"], 0));
                            }
                        }
                    }
                }
                // '===================================================================================================''
                // '===================================================================================================''
                


                //ProcessStatus = 0;
                // objLocalConn.closeConnection();
            }
            catch (Exception ex)
            {
                // ProcessStatus = 0;
                
            }
        }

        private object populateRigStates(ref StandPoint paramPoint, TimeLog paramTimeLog)
        {
            try
            {
                paramPoint.RigStates.Clear();
                DataTable objData = objRequest.objDataService.getTable("SELECT DATETIME,RIG_STATE,TIME_DURATION FROM " + paramTimeLog.__dataTableName + " WHERE DATETIME>='" + paramPoint.FromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramPoint.ToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IS NOT NULL");
                foreach (DataRow objRow in objData.Rows)
                {
                    int lnRigState =Convert.ToInt32( DataService.checkNull(objRow["RIG_STATE"], 0));
                    double TimeDuration =Convert.ToDouble( DataService.checkNull(objRow["TIME_DURATION"], 0));
                    if (!paramPoint.RigStates.ContainsKey(lnRigState))
                    {
                        paramPoint.RigStates.Add(lnRigState, TimeDuration);
                    }
                    else
                    {
                        paramPoint.RigStates[lnRigState] = paramPoint.RigStates[lnRigState] + TimeDuration;
                    }
                }
            }
            catch (Exception ex)
            {
            }

            return default;
        }

        public ConnectionLogPoint.cnDayNightTime determineDayOrNight(DateTime paramDate)
        {
            try
            {
                var localDate = paramDate;
                if (objWell.wellDateFormat == VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                {
                    localDate = convertUTCToWellTimeZone(localDate);
                }
                else
                {
                    localDate = convertWellToLocalTimeZone(localDate);
                }

                DateTime connectionDate = Convert.ToDateTime(DateTime.Now.ToString("dd-MMM-yyyy") + " " + localDate.ToString("HH:mm") + ":00");
                DateTime DayTimeDateFrom = Convert.ToDateTime(DateTime.Now.ToString("dd-MMM-yyyy") + " " + DayTimeHoursFrom.ToString("HH:mm") + ":00");
                DateTime DayTimeDateTo = Convert.ToDateTime(DateTime.Now.ToString("dd-MMM-yyyy") + " " + DayTimeHoursTo.ToString("HH:mm") + ":00");
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

        private double calculateROP(TimeLog paramTimeLog, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                string strSQL = "";
                double sumDateTime = 0d;
                double sumDepth = 0d;
                strSQL = "SELECT SUM(TIME_DURATION) FROM " + paramTimeLog.__dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + "0,1,19" + ")";
                sumDateTime = Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));
                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + paramTimeLog.__dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + "0,1,19" + ") AND NEXT_DEPTH>0 AND HDTH>=0";
                sumDepth = Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));
                double ROP = 0;
                if (sumDateTime > 0 & sumDepth > 0)
                {
                    ROP = sumDepth / (sumDateTime / 60 / 60); // ft/hours
                }
                else
                {
                    ROP = 0;
                }

                return ROP;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        private double calculateRotaryROP(TimeLog paramTimeLog, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                string strSQL = "";
                double sumDateTime = 0;
                double sumDepth = 0;
                strSQL = "SELECT SUM(TIME_DURATION) FROM " + paramTimeLog.__dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + "0" + ")";
                sumDateTime =Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));
                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + paramTimeLog.__dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + "0" + ") AND NEXT_DEPTH>0 AND HDTH>=0";
                sumDepth = Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));
                double ROP = 0;
                if (sumDateTime > 0 & sumDepth > 0)
                {
                    ROP = sumDepth / (sumDateTime / 60 / 60); // ft/hours
                }
                else
                {
                    ROP = 0d;
                }

                return ROP;
            }
            catch (Exception ex)
            {
                return 0d;
            }
        }

        private double calculateSlideROP(TimeLog paramTimeLog, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                string strSQL = "";
                double sumDateTime = 0;
                double sumDepth = 0;
                strSQL = "SELECT SUM(TIME_DURATION) FROM " + paramTimeLog.__dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + "1,19" + ")";
                sumDateTime = Convert.ToDouble(objRequest.objDataService.getValueFromDatabase(strSQL));
                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + paramTimeLog.__dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + "1,19" + ") AND NEXT_DEPTH>0 AND HDTH>=0";
                sumDepth = Convert.ToDouble(objRequest.objDataService.getValueFromDatabase(strSQL));
                double ROP = 0;
                if (sumDateTime > 0 & sumDepth > 0)
                {
                    ROP = sumDepth / (sumDateTime / 60 / 60); // ft/hours
                }
                else
                {
                    ROP = 0;
                }

                return ROP;
            }
            catch (Exception ex)
            {
                return 0;
            }
        }
    }
}
