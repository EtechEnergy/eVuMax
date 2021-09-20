using eVuMax.DataBroker.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Common;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.Summary.ROPSummary
{
    public class ROPSummary
    {

        private VuMaxDR.Data.Objects.Well  objWell = new VuMaxDR.Data.Objects.Well();
        private TimeLog objTimeLog;
        private TimeLog objOffsetTimeLog;
        private string SideTrackKey = "-999";
        private const string MyPlotID = "CROSSPLOTROP";

        private const string cnROP = "ROP";
        MnemonicMappingMgr objMnemonicMappingMgr = new MnemonicMappingMgr();
        string selectionType = "-1";//10% of timelog data

        double[] rotateDataX = new double[0]; 
        double[] rotateDataY= new double[0];

        double[] offsetrotateDataX;
        double[] offsetrotateDataY;


        double[] slideDataX ;
        double[] slideDataY ;

        double[] offsetslideDataX;
        double[] offsetslideDataY;


       double AvgRotaryROP = 0;
        double MedRotaryROP = 0;
        double AvgSlideROP = 0;
        double MedSlideROP = 0;

        double AvgRotaryROPOffset = 0;
        double MedRotaryROPOffset = 0;
        double AvgSlideROPOffset = 0;
        double MedSlideROPOffset = 0;


        double TotalFootage = 0;
        double TotalFootageOffset = 0;

        double RotaryPercent = 0;
        double SlidePercent = 0;

        double OffsetRotaryPercent = 0;
        double OffsetSlidePercent = 0;


        double minDepth = 0;
        double maxDepth = 0;
        //DateTime[] mainROPDate;




        DateTime fromDate = DateTime.Now;
        DateTime toDate = DateTime.Now;

        double fromDepth = 0;
        double toDepth = 0;

        DateTime offsetFromDate = DateTime.Now;
        DateTime offsetToDate = DateTime.Now;

        double offsetDepthIn = 0;
        double offsetDepthOut = 0;
        

        ROPSummarySettings objUserSetting = new ROPSummarySettings();
        string wellId = "";
        string userId = "";
        private string lastError = "";

        private Dictionary<double, double>  tripOuts = new Dictionary<double, double>();
        private Dictionary<double, double>  tripOutsOffset = new Dictionary<double, double>();

        ROPSummaryData objROPSummaryData = new ROPSummaryData();


        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {


                //Nishant
                if (paramRequest.Function == "ROPSummary")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                    objResponse = getROPSummary(paramRequest);
                    return objResponse;
                }

                //if (paramRequest.Function == "getUserSettings")
                //{
                //    //TO-DO -- Validate the user with or without AD Integration and return the result
                //    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                //    // objResponse = getUserSettings(paramRequest);

                //    return objResponse;
                //}


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

                    //objResponse = saveUserSettings(paramRequest);

                    return objResponse;
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

        private Broker.BrokerResponse getROPSummary(Broker.BrokerRequest paramRequest)
        {
            try
            {

                string __Warnings = "";

                userId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;

                 selectionType = paramRequest.Parameters.Where(x => x.ParamName.Contains("SelectionType")).FirstOrDefault().ParamValue.ToString();
                 fromDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDepth")).FirstOrDefault().ParamValue.ToString());
                 toDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDepth")).FirstOrDefault().ParamValue.ToString());
                 fromDate = DateTime.Now;
                 toDate = DateTime.Now;

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

                    //Convert date to UTC
                    fromDate = fromDate.ToUniversalTime();
                    toDate = toDate.ToUniversalTime();
                }
                catch (Exception)
                {
                }
                objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLog(ref paramRequest.objDataService, wellId);
                if (objTimeLog != null)
                {
                    objROPSummaryData.DepthUnit = objTimeLog.logCurves["DEPTH"].VuMaxUnitID.ToString(); //Nishant
                }


                objWell = VuMaxDR.Data.Objects.Well.loadObject(ref paramRequest.objDataService, wellId, ref lastError);
                if (objWell != null)
                {

                    objROPSummaryData.WellName = objWell.name;
                    objROPSummaryData.RigName = objWell.RigName;

                    objROPSummaryData.Distance = Math.Round(toDepth - fromDepth, 2).ToString();
                }


                //Find Offsetwell
                if (objWell.offsetWells.Count > 0)
                {

                    objOffsetTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref paramRequest.objDataService, objWell.offsetWells.Values.First().OffsetWellID);
                    objROPSummaryData.offSetWellName = VuMaxDR.Data.Objects.Well.getName(ref paramRequest.objDataService, objOffsetTimeLog.WellID);

                    if (objOffsetTimeLog != null)
                    {
                        //get Numeric Data here

                        offsetFromDate = objOffsetTimeLog.getDateTimeFromDepthBegining(ref paramRequest.objDataService, fromDepth);
                        offsetToDate = objOffsetTimeLog.getDateTimeFromDepthEnding(ref paramRequest.objDataService, toDepth);

                        
                      //  objROPSummaryData.offSetWellNumericData = processOffsetNumericOutput(ref paramRequest.objDataService, offsetFromDate, offsetToDate);

                    }
                }
                //

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

                string strSQL = "";
                //double paramFromDepth = 0;
                //double paramToDepth = 0;
                if (selectionType == "0") //date wise
                {
                    fromDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, fromDate.ToOADate());
                    toDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, toDate.ToOADate());
                }
                else
                {
                    //depth wise

                    getDateRangeFromDepth(paramRequest, fromDepth, toDepth, ref fromDate, ref toDate);
                }


                DataTable objData = paramRequest.objDataService.getTable(strSQL);


                objROPSummaryData.RigStates =Util.getRigState(ref paramRequest.objDataService, wellId); //prath

                string ropWarning = "";

                generateReportData(paramRequest,out ropWarning);

                __Warnings = __Warnings + " " + ropWarning;

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                objResponse.Warnings = __Warnings;

                objResponse.Response = JsonConvert.SerializeObject(objROPSummaryData);
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

        private void generateReportData(Broker.BrokerRequest paramRequest,out string paramWarnings)
        {

            paramWarnings = "";

            try
            {
                {

                    objMnemonicMappingMgr.loadMappings(ref paramRequest.objDataService); //prath 15-10-2020

                    string dataTableName = objTimeLog.__dataTableName;
                    string yMnemonic = cnROP;
                    if (objTimeLog.logCurves.ContainsKey(yMnemonic))
                    {
                    }
                    // 'Nothing to do ...
                    else
                    {
                        //prath 15-10-2020
                        //objMnemonicMappingMgr.loadMappings(ref paramRequest.objDataService);


                       
                        yMnemonic = objMnemonicMappingMgr.getMappedMnemonic(yMnemonic, objTimeLog.logCurves);
                       
                        if (string.IsNullOrEmpty(yMnemonic.Trim()))
                        {
                             // 'No data found ...
                        }
                    }

                    if(yMnemonic.Trim()=="")
                    {
                        paramWarnings = "ROP data not found in time log. Please check mnemonic mappings";
                    }

                    string strSQL = "";

                    // '**** Process rotary drilling data  ======================================================''

                    if (selectionType == "1")
                    {
                        strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
                    }
                    else
                    {
                        
                        strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                    }

                    //PENDING 99999
                    //if (selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    strSQL = strSQL + " AND [" + yMnemonic + "]>=0 ";
                    strSQL = strSQL + " AND RIG_STATE=0 ";

                    // 'strSQL = strSQL + " GROUP BY ROUND(HDTH,2) ORDER BY ROUND(HDTH,2)"

                    strSQL = strSQL + " ORDER BY HDTH";
                    DataTable CData = paramRequest.objDataService.getTable(strSQL);

                    // 'Dim objData As DataTable = DownSample.downSampleByMovingAvg(CData, "DEPTH", yMnemonic, 0, objDataSelection.NoOfDataPoints)
                    objUserSetting = loadSettings(paramRequest);
                    DataTable objData = Common.DownSample.downSampleByDepthEx(CData, "DEPTH", yMnemonic, 0, objUserSetting.NoOfDataPoints);

                    if (objData.Rows.Count > 0)
                    {
                        Array.Resize(ref rotateDataX, objData.Rows.Count - 1);
                        Array.Resize(ref rotateDataY, objData.Rows.Count - 1);

                        for (int i = 0; i < objData.Rows.Count - 1;  i++)
                        {
                            double yValue = Convert.ToDouble(DataService.checkNull(objData.Rows[i][yMnemonic], 0));
                            double xValue = Convert.ToDouble( DataService.checkNull(objData.Rows[i]["DEPTH"], 0));
                            rotateDataX[i] = xValue;
                            rotateDataY[i] = yValue;
                        }
                        int x = 0; //temp code
                        Common.DownSample.smoothByMovingAvg(ref rotateDataY, objUserSetting.AvgPoints);
                    }


                    // '**** Process Slide drilling data  ======================================================''
                    if (selectionType== "1") //depth
                    {
                        strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
                    }
                    else
                    {
                        // 'strSQL = "SELECT ROUND(HDTH,2) AS [DEPTH], AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' "
                        strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                    }

                    //PENDING 9999999999
                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    strSQL = strSQL + " AND [" + yMnemonic + "]>=0 ";
                    strSQL = strSQL + " AND (RIG_STATE=1 OR RIG_STATE=19) ";
                    strSQL = strSQL + " ORDER BY HDTH";
                    CData = paramRequest.objDataService.getTable(strSQL);

                    

                    objData = Common.DownSample.downSampleByDepthEx(CData, "DEPTH", yMnemonic, 0, objUserSetting.NoOfDataPoints);
                    if (objData.Rows.Count > 0)
                    {

                        Array.Resize(ref slideDataX, objData.Rows.Count - 1);
                        Array.Resize(ref slideDataY, objData.Rows.Count - 1);




                        for (int i = 0; i< objData.Rows.Count - 1;  i++)
                        {
                            double yValue =Convert.ToDouble( DataService.checkNull(objData.Rows[i][yMnemonic], 0));
                            double xValue =Convert.ToDouble( DataService.checkNull(objData.Rows[i]["DEPTH"], 0));
                            slideDataX[i] = xValue;
                            slideDataY[i] = yValue;
                        }

                        Common.DownSample.smoothByMovingAvg(ref slideDataY, objUserSetting.AvgPoints);
                    }
                    else
                    {
                        Array.Resize(ref slideDataX, 0);
                        Array.Resize(ref slideDataY, 0);
                    }

                    // '---------------------------------------''


                    AvgRotaryROPOffset = 0;
                    AvgSlideROPOffset = 0;
                    MedRotaryROPOffset = 0;
                    MedSlideROPOffset = 0;
                    AvgRotaryROP = 0;
                    offsetDepthIn = 0;
                    offsetDepthOut = 0;



                    // '##################################################################################################################''
                    if (selectionType == "1")  //depth range selection
                    {
                        strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
                    }
                    else
                    {
                        strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                    }

                    //PENDING 9999999999999
                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    strSQL = strSQL + " AND [" + yMnemonic + "]>=0 ";
                    strSQL = strSQL + " ORDER BY HDTH";
                    CData = paramRequest.objDataService.getTable(strSQL);
                    if (CData.Rows.Count > 0)
                    {
                        offsetDepthIn = Convert.ToDouble( DataService.checkNull(CData.Rows[0]["DEPTH"], 0));
                        offsetDepthOut = Convert.ToDouble( DataService.checkNull(CData.Rows[CData.Rows.Count - 1]["DEPTH"], 0));
                    }


                    // '##################################################################################################################''




                    if (selectionType=="1")//depth selection
                    {
                        strSQL = "SELECT AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
                    }
                    else
                    {
                        strSQL = "SELECT AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                    }

                    //PENDING 999999999
                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    strSQL = strSQL + " AND [" + yMnemonic + "]>=0 ";
                    strSQL = strSQL + " AND (RIG_STATE=0) ";
                    objData = paramRequest.objDataService.getTable(strSQL);
                    if (objData.Rows.Count > 0)
                    {
                        AvgRotaryROP = Convert.ToDouble( DataService.checkNull(objData.Rows[0][yMnemonic], 0));
                    }

                    AvgSlideROP = 0;
                    if (selectionType=="1")//depth selection
                    {
                        strSQL = "SELECT AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
                    }
                    else
                    {
                        strSQL = "SELECT AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                    }
                    //PENDING 99999999999
                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    strSQL = strSQL + " AND [" + yMnemonic + "]>=0 ";
                    strSQL = strSQL + " AND (RIG_STATE=1 OR RIG_STATE=19) ";
                    objData =paramRequest.objDataService.getTable(strSQL);
                    if (objData.Rows.Count > 0)
                    {
                        AvgSlideROP = Convert.ToDouble( DataService.checkNull(objData.Rows[0][yMnemonic], 0));
                    }

                    TotalFootage = 0;
                    double TotalTimePeriod =0;
                    if (selectionType=="1") //depth selection
                    {
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0";
                    }
                    else
                    {
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                    }

                    //PEDNING 99999
                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    TotalFootage = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));
                    if (selectionType=="1") //depth selection
                    {
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " AND RIG_STATE IN (0,1,19) ";
                    }
                    else
                    {
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) ";
                    }

                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    TotalTimePeriod = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));

                    double RotaryFootage = 0;
                    double SlideFootage = 0;
                    double RotaryTimePeriod = 0;
                    double SlideTimePeriod = 0;

                    if (selectionType == "1") // depth selection
                    {
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " AND RIG_STATE IN (0) AND NEXT_DEPTH>0 AND HDTH>=0";
                    }
                    else
                    {
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                    }

                    // PENDING 99999
                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    RotaryFootage = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));
                    if (selectionType=="1") //depth selection
                    {
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " AND RIG_STATE IN (0) ";
                    }
                    else
                    {
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0) ";
                    }

                    //PENDING 9999
                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    RotaryTimePeriod = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));
                    if (selectionType == "1")
                    {
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " AND RIG_STATE IN (1,19) AND NEXT_DEPTH>0 AND HDTH>=0";
                    }
                    else
                    {
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                    }

                    // PENDING 99999999
                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    SlideFootage = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));
                    if (selectionType == "1")
                    {
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " AND RIG_STATE IN (1,19) ";
                    }
                    else
                    {
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (1,19)  ";
                    }
                    // PENDING 9999
                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    SlideTimePeriod = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));






                    RotaryPercent = 0;
                    if (RotaryFootage > 0)
                    {
                        RotaryPercent = Math.Round(RotaryFootage * 100d / TotalFootage, 2);
                    }

                    SlidePercent = 0;
                    if (SlideFootage > 0)
                    {
                        SlidePercent = Math.Round(SlideFootage * 100d / TotalFootage, 2);
                    }

                    MedRotaryROP = 0;
                    MedSlideROP = 0;
                    if (rotateDataY.Length> 0)
                    {
                        if (rotateDataY.Length > 1)
                        {
                            MedRotaryROP = rotateDataY[rotateDataY.Length / 2];
                        }
                        else
                        {
                            MedRotaryROP = rotateDataY[0];
                        }
                    }

                    if (slideDataY.Length > 0)
                    {
                        if (slideDataY.Length > 1)
                        {
                            MedSlideROP = slideDataY[slideDataY.Length / 2];
                        }
                        else
                        {
                            MedSlideROP = slideDataY[0];
                        }
                    }

                    minDepth = 0;
                    maxDepth = 0;
                    if (selectionType == "1")
                    {
                        strSQL = "SELECT MIN(HDTH) AS MIN_DEPTH,MAX(HDTH) AS MAX_DEPTH FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " AND RIG_STATE IN (1,19) AND NEXT_DEPTH>0 AND HDTH>=0";
                    }
                    else
                    {
                        strSQL = "SELECT MIN(HDTH) AS MIN_DEPTH,MAX(HDTH) AS MAX_DEPTH FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                    }
                    //PENDING 99999999
                    //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                    //{
                    //    string strTopsCondition = objDataSelection.getTopsFilter();
                    //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                    //    {
                    //        strSQL = strSQL + " AND " + strTopsCondition;
                    //    }
                    //}

                    objData = paramRequest.objDataService.getTable(strSQL);
                    if (objData.Rows.Count > 0)
                    {
                        minDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MIN_DEPTH"], 0));
                        maxDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MAX_DEPTH"], 0));
                    }

                    //objFrmLog.clearLog();



                    // 'Recalculate ROP
                    if (RotaryTimePeriod >0 & RotaryFootage > 0)
                    {
                        AvgRotaryROP = RotaryFootage / (RotaryTimePeriod / 60 / 60); // ft/hours
                    }
                    else
                    {
                        AvgRotaryROP = 0;
                    }

                    if (SlideTimePeriod >0 & SlideFootage >0)
                    {
                        AvgSlideROP = SlideFootage / (SlideTimePeriod / 60 / 60); // ft/hours
                    }
                    else
                    {
                        AvgSlideROP = 0;
                    };

                    Array.Resize(ref offsetrotateDataX, 0);
                    Array.Resize(ref offsetrotateDataY, 0);
                    Array.Resize(ref offsetslideDataX, 0);
                    Array.Resize(ref offsetslideDataY, 0);  //prath change from -1 to 0


                    if (objUserSetting.ROP_ShowOffset & objOffsetTimeLog is object)
                    {
                        yMnemonic = cnROP;
                        if (objOffsetTimeLog.logCurves.ContainsKey(yMnemonic))
                        {
                        }
                        // 'Nothing to do ...
                        else
                        {
                        //    objMnemonicMappingMgr.loadMappings(ref paramRequest.objDataService); //prath 15-10-2020
                            yMnemonic = objMnemonicMappingMgr.getMappedMnemonic(yMnemonic, objOffsetTimeLog.logCurves);
                            if (string.IsNullOrEmpty(yMnemonic.Trim()))
                            {
                                //Nishant 27/08/2021
                                paramWarnings += " Offset Well Data not found. Please check mnemonic mappings of Offset Well";
                                goto over;
                            }
                        }

                        
                        offsetFromDate = objOffsetTimeLog.getDateTimeFromDepthBegining(ref paramRequest.objDataService, fromDepth);
                        offsetToDate = objOffsetTimeLog.getDateTimeFromDepthEnding(ref paramRequest.objDataService, toDepth);
                       

                        // '**** Process rotary drilling data  ======================================================''
                        if (objUserSetting.MatchDepthByFormationTops)
                        {
                            strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + objOffsetTimeLog.__dataTableName + " ";
                            strSQL = strSQL + " WHERE [" + yMnemonic + "]>=0 ";
                        }
                        else
                        {
                            // 'strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + objOffsetTimeLog.__dataTableName + " WHERE DATETIME>='" + offsetFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + offsetToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' "
                            strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " ";
                            strSQL = strSQL + " AND [" + yMnemonic + "]>=0 ";
                        }

                        strSQL = strSQL + " AND RIG_STATE=0 ";

                        // 'strSQL = strSQL + " GROUP BY ROUND(HDTH,2) ORDER BY ROUND(HDTH,2)"
                        strSQL = strSQL + " ORDER BY HDTH";
                        CData = paramRequest.objDataService.getTable(strSQL);

                        // 'objData = DownSample.downSampleByMovingAvg(CData, "DEPTH", yMnemonic, 0, objDataSelection.NoOfDataPoints)

                        objData = DownSample.downSampleByDepthEx(CData, "DEPTH", yMnemonic, 0, objUserSetting.NoOfDataPoints);
                        if (objData.Rows.Count > 0)
                        {
                            Array.Resize(ref offsetrotateDataX, objData.Rows.Count - 1);
                            Array.Resize(ref offsetrotateDataY, objData.Rows.Count - 1);

                             
                            for (int i = 0; i< objData.Rows.Count - 1;  i++)
                            {
                                double yValue = Convert.ToDouble( DataService.checkNull(objData.Rows[i][yMnemonic], 0));
                                double xValue = Convert.ToDouble( DataService.checkNull(objData.Rows[i]["DEPTH"], 0));
                                offsetrotateDataX[i] = xValue;
                                offsetrotateDataY[i] = yValue;
                            }

                            DownSample.smoothByMovingAvg(ref offsetrotateDataY, objUserSetting.AvgPoints);


                            // '#### Implement Depth Matching Functionality ###############''
                            if (objUserSetting.MatchDepthByFormationTops)
                            {

                                
                                // 'get the list of formation tops of both the wells ...
                                Dictionary<string, FormationTop> offsetTops = FormationTop.getList(ref paramRequest.objDataService, objOffsetTimeLog.WellID);
                                Dictionary<string, FormationTop> mainTops = FormationTop.getList(ref paramRequest.objDataService, wellId);

                                // 'get the depth matching list
                                Dictionary<int, DepthMatchingInfo> depthMatchingList = getDepthMatchingList(offsetTops, mainTops);

                                // 'Now match the depth 
                                // '//It was causing issues ... suppressed ...
                                // 'matchDepth(OffsetRotateXData, depthMatchingList)

                                // 'Now count the no. of elements that matches the depth criteria
                                int elementCount = 0;
                                for (int i = 0; i< offsetrotateDataX.Length - 1; i++)
                                {
                                    if (offsetrotateDataX[i] >= fromDepth & offsetrotateDataX[i] <= toDepth)
                                    {
                                        elementCount += 1;
                                    }
                                }

                                // 'Get the temp array
                                var tempXData = new double[elementCount];
                                var tempYData = new double[elementCount];
                                int subCounter = 0;
                                for (int i = 0; i< offsetrotateDataX.Length - 1;  i++)
                                {
                                    if (offsetrotateDataX[i] >= fromDepth & offsetrotateDataX[i] <= toDepth)
                                    {
                                        tempXData[subCounter] = offsetrotateDataX[i];
                                        tempYData[subCounter] = offsetrotateDataX[i];
                                        subCounter += 1;
                                    }

                                  
                                };

                                Array.Resize(ref offsetrotateDataX, elementCount - 1);
                                Array.Resize(ref offsetrotateDataY, elementCount - 1);

                           
                                for (int i = 0; i< tempXData.Length - 1; i++)
                                {
                                    offsetrotateDataX[i] = tempXData[i];
                                    offsetrotateDataX[i] = tempYData[i];
                                }
                            }
                            // '###########################################################''

                        }



                        // '**** Process Slide drilling data  ======================================================''
                        if (objUserSetting.MatchDepthByFormationTops)
                        {
                            // 'strSQL = "SELECT ROUND(HDTH,2) AS [DEPTH], AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + objOffsetTimeLog.__dataTableName + "  "
                            strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + objOffsetTimeLog.__dataTableName + "  ";
                            strSQL = strSQL + " WHERE [" + yMnemonic + "]>=0 ";
                        }
                        else
                        {
                            // 'strSQL = "SELECT ROUND(HDTH,2) AS [DEPTH], AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + objOffsetTimeLog.__dataTableName + " WHERE DATETIME>='" + offsetFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + offsetToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' "
                            strSQL = "SELECT HDTH AS [DEPTH], [" + yMnemonic + "] AS [" + yMnemonic + "] FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " ";
                            strSQL = strSQL + " AND [" + yMnemonic + "]>=0 ";
                        }

                        strSQL = strSQL + " AND (RIG_STATE=1 OR RIG_STATE=19) ";

                        // 'strSQL = strSQL + " GROUP BY ROUND(HDTH,2) ORDER BY ROUND(HDTH,2)"
                        strSQL = strSQL + " ORDER BY HDTH";
                        CData = paramRequest.objDataService.getTable(strSQL);

                        // 'objData = DownSample.downSampleByMovingAvg(CData, "DEPTH", yMnemonic, 0, objDataSelection.NoOfDataPoints)

                        objData = DownSample.downSampleByDepthEx(CData, "DEPTH", yMnemonic, 0, objUserSetting.NoOfDataPoints);
                        if (objData.Rows.Count > 0)
                        {
                            Array.Resize(ref offsetslideDataX, objData.Rows.Count - 1);
                            Array.Resize(ref offsetslideDataY, objData.Rows.Count - 1);

                        
                            for (int i = 0; i< objData.Rows.Count - 1; i++)
                            {
                                double yValue = Convert.ToDouble( DataService.checkNull(objData.Rows[i][yMnemonic], 0));
                                double xValue = Convert.ToDouble( DataService.checkNull(objData.Rows[i]["DEPTH"], 0));
                                offsetslideDataX[i] = xValue;
                                offsetslideDataY[i] = yValue;
                            }

                            DownSample.smoothByMovingAvg(ref offsetslideDataY, objUserSetting.AvgPoints);

                            // '#### Implement Depth Matching Functionality ###############''
                            if (objUserSetting.MatchDepthByFormationTops)
                            {

                                // 'get the list of formation tops of both the wells ...
                                Dictionary<string, FormationTop> offsetTops = FormationTop.getList(ref paramRequest.objDataService, objOffsetTimeLog.WellID);
                                Dictionary<string, FormationTop> mainTops = FormationTop.getList(ref paramRequest.objDataService, wellId);

                                // 'get the depth matching list
                                Dictionary<int, DepthMatchingInfo> depthMatchingList = getDepthMatchingList(offsetTops, mainTops);

                                // 'Now match the depth 
                                // '//It was causing issues ... suppressed 
                                // ' matchDepth(OffsetSlideXData, depthMatchingList)


                                // 'Now count the no. of elements that matches the depth criteria
                                int elementCount = 0;
                                for (int i = 0; i< offsetslideDataX.Length - 1;  i++)
                                {
                                    if (offsetslideDataX[i] >= fromDepth & offsetslideDataX[i] <= toDepth)
                                    {
                                        elementCount += 1;
                                    }
                                }

                                // 'Get the temp array
                                var tempXData = new double[elementCount];
                                var tempYData = new double[elementCount];
                                int subCounter = 0;
                                for (int i = 0; i< offsetslideDataX.Length - 1; i++)
                                {
                                    if (offsetslideDataX[i] >= fromDepth & offsetslideDataX[i] <= toDepth)
                                    {
                                        tempXData[subCounter] = offsetslideDataX[i];
                                        tempYData[subCounter] = offsetslideDataX[i];
                                        subCounter += 1;
                                    }

                                    // 'Now again, resize the main arrays and copy temp data ...
                                };

                                Array.Resize(ref offsetslideDataX, elementCount - 1);
                                Array.Resize(ref offsetslideDataY, elementCount - 1);
                                
                                for (int i = 0;i< tempXData.Length - 1;  i++)
                                {
                                    offsetslideDataX[i] = tempXData[i];
                                    offsetslideDataY[i] = tempYData[i];
                                }
                            }
                            // '###########################################################''



                        }

                        TotalFootage = 0;
                        RotaryFootage =0;
                        SlideFootage =0;
                        RotaryTimePeriod =0;
                        TotalTimePeriod =0;
                        SlideTimePeriod =0;

                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                        TotalFootage = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " AND RIG_STATE IN (0,1,19)  ";
                        TotalTimePeriod = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " AND RIG_STATE IN (0) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                        RotaryFootage = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " AND RIG_STATE IN (0)  ";
                        RotaryTimePeriod = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " AND RIG_STATE IN (1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                        SlideFootage = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " AND RIG_STATE IN (1,19) ";
                        SlideTimePeriod = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase(strSQL));
                        OffsetRotaryPercent = 0;
                        if (RotaryFootage >0)
                        {
                            OffsetRotaryPercent = Math.Round(RotaryFootage * 100d / TotalFootage, 2);
                        }

                        OffsetSlidePercent = 0;
                        if (SlideFootage >0)
                        {
                            OffsetSlidePercent = Math.Round(SlideFootage * 100d / TotalFootage, 2);
                        }



                        // '//***************** Calculate Statistics for Offset well *******************************//

                        AvgRotaryROPOffset = 0;
                        strSQL = "SELECT AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " ";
                        //PENDING WORK 9999
                        //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                        //{
                        //    string strTopsCondition = objDataSelection.getTopsFilter();
                        //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                        //    {
                        //        strSQL = strSQL + " AND " + strTopsCondition;
                        //    }
                        //}

                        strSQL = strSQL + " AND [" + yMnemonic + "]>=0 ";
                        strSQL = strSQL + " AND (RIG_STATE=0) ";
                        objData = paramRequest.objDataService.getTable(strSQL);
                        if (objData.Rows.Count > 0)
                        {
                            AvgRotaryROPOffset = Convert.ToDouble( VuMaxDR.Data.DataService.checkNull(objData.Rows[0][yMnemonic], 0));
                        }

                        AvgSlideROPOffset = 0;
                        strSQL = "SELECT AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " ";
                        //PENDING 9999
                        //if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                        //{
                        //    string strTopsCondition = objDataSelection.getTopsFilter();
                        //    if (!string.IsNullOrEmpty(strTopsCondition.Trim()))
                        //    {
                        //        strSQL = strSQL + " AND " + strTopsCondition;
                        //    }
                        //}

                        strSQL = strSQL + " AND [" + yMnemonic + "]>=0 ";
                        strSQL = strSQL + " AND (RIG_STATE=1 OR RIG_STATE=19) ";
                        objData = paramRequest.objDataService.getTable(strSQL);
                        if (objData.Rows.Count > 0)
                        {
                            AvgSlideROPOffset =Convert.ToDouble( DataService.checkNull(objData.Rows[0][yMnemonic], 0));
                        }

                        MedRotaryROPOffset = 0;
                        MedSlideROPOffset = 0;
                        if (offsetrotateDataY.Length > 0)
                        {
                            if (offsetrotateDataY.Length > 1)
                            {
                                MedRotaryROPOffset = offsetrotateDataY[offsetrotateDataY.Length / 2];
                            }
                            else
                            {
                                MedRotaryROPOffset = offsetrotateDataY[0];
                            }
                        }

                        if (offsetslideDataY.Length > 0)
                        {
                            if (offsetslideDataY.Length > 1)
                            {
                                MedSlideROPOffset = offsetslideDataY[offsetslideDataY.Length / 2];
                            }
                            else
                            {
                                MedSlideROPOffset = offsetslideDataY[0];
                            }
                        }

                        if (RotaryTimePeriod >0 & RotaryFootage >0)
                        {
                            AvgRotaryROPOffset = RotaryFootage / (RotaryTimePeriod / 60 / 60); // ft/hours
                        }
                        else
                        {
                            AvgRotaryROPOffset = 0;


                        }

                        if (SlideTimePeriod >0 & SlideFootage >0)
                        {
                            AvgSlideROPOffset = SlideFootage / (SlideTimePeriod / 60 / 60); // ft/hours
                        }
                        else
                        {
                            AvgSlideROPOffset = 0;
                        }


                        // '//*************************************************************************************//

                    }
                    // '########################################################################################''

                //Nishant 27/08/2021     
                over:
                    detectTripOuts(paramRequest);

                    // Save to ROP Summary object
                 

                    objROPSummaryData.AvgRotaryROP = AvgRotaryROP;
                    objROPSummaryData.MedRotaryROP = MedRotaryROP;
                    objROPSummaryData.AvgSlideROP = AvgSlideROP;
                    objROPSummaryData.MedSlideROP = MedSlideROP;

                    objROPSummaryData.AvgRotaryROPOffset = AvgRotaryROPOffset;
                    objROPSummaryData.MedRotaryROPOffset = MedRotaryROPOffset;
                    objROPSummaryData.AvgSlideROPOffset = AvgSlideROPOffset;
                    objROPSummaryData.MedSlideROPOffset = MedSlideROPOffset;


                    //Pie Data
                    objROPSummaryData.RotaryPercent = RotaryPercent;
                    objROPSummaryData.SlidePercent = SlidePercent;
                    objROPSummaryData.OffsetRotaryPercent = OffsetRotaryPercent;
                    objROPSummaryData.OffsetSlidePercent = OffsetSlidePercent;

                    //Rotate Data 

                    for (int i = 0; i < rotateDataX.Length; i++)
                    {
                        DataRow objNewRow =  objROPSummaryData.rotateData.NewRow();
                        objNewRow["X"] = rotateDataX[i];
                        objNewRow["Y"] = rotateDataY[i];
                        objROPSummaryData.rotateData.Rows.Add(objNewRow);
                    }

                
                    for (int i = 0; i < offsetrotateDataX.Length; i++)
                    {
                        DataRow objNewRow = objROPSummaryData.offsetRotateData.NewRow();
                        objNewRow["X"] = offsetrotateDataX[i];
                        objNewRow["Y"] = offsetrotateDataY[i];
                        objROPSummaryData.offsetRotateData.Rows.Add(objNewRow);
                    }

                    //Slide data
                    
                    for (int i = 0; i < slideDataX.Length; i++)
                    {
                        DataRow objNewRow = objROPSummaryData.slideData.NewRow();
                        objNewRow["X"] = slideDataX[i];
                        objNewRow["Y"] = slideDataY[i];
                        objROPSummaryData.slideData.Rows.Add(objNewRow);
                    }


                    for (int i = 0; i < offsetslideDataX.Length; i++)
                    {
                        DataRow objNewRow = objROPSummaryData.offsetSlideData.NewRow();
                        objNewRow["X"] = offsetslideDataX[i];
                        objNewRow["Y"] = offsetslideDataY[i];
                        objROPSummaryData.offsetSlideData.Rows.Add(objNewRow);
                    }

                    objROPSummaryData.fromDate =fromDate;
                    objROPSummaryData.toDate = toDate;

                    objROPSummaryData.fromDepth = fromDepth;
                    objROPSummaryData.toDepth = toDepth;

                    objROPSummaryData.offsetFromDate = offsetFromDate;
                    objROPSummaryData.offsetToDate = offsetToDate;

                    objROPSummaryData.offsetDepthIn = offsetDepthIn;
                    objROPSummaryData.offsetDepthOut = offsetDepthOut;

                    objROPSummaryData.tripOuts = tripOuts;
                    objROPSummaryData.tripOutsOffset = tripOutsOffset;


                    ////Add Blank row if No data present in SlideX Y and others
                    //if (objROPSummaryData.rotateData.Rows.Count == 0)
                    //{
                    //    DataRow objNewRow = objROPSummaryData.rotateData.NewRow();
                    //    objROPSummaryData.rotateData.Rows.Add(objNewRow);
                    //}

                    //if (objROPSummaryData.offsetRotateData.Rows.Count == 0)
                    //{
                    //    DataRow objNewRow = objROPSummaryData.offsetRotateData.NewRow();
                    //    objROPSummaryData.offsetRotateData.Rows.Add(objNewRow);
                    //}

                    //if (objROPSummaryData.slideData.Rows.Count == 0)
                    //{
                    //    DataRow objNewRow = objROPSummaryData.slideData.NewRow();
                    //    objROPSummaryData.slideData.Rows.Add(objNewRow);
                    //}

                    //  if (objROPSummaryData.offsetSlideData.Rows.Count == 0)
                    //{
                    //    DataRow objNewRow = objROPSummaryData.offsetSlideData.NewRow();
                    //    objROPSummaryData.offsetSlideData.Rows.Add(objNewRow);
                    //}

              


                }
//Commented below code Nishant 27/08/2021
            //over:
            //    bool doNothing = true;
                //return

            }
            catch (Exception ex)
            {

          
            }

        }

        private ROPSummarySettings loadSettings(Broker.BrokerRequest paramRequest)
        {
            try
            {
                //Load User Settings
                UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);

                UserSettings.UserSettings objSettings = objSettingsMgr.loadUserSettings(userId, MyPlotID, wellId);

                ROPSummarySettings objROPSummarySettings = null;

                if (objSettings == null)
                {
                    objSettings = new UserSettings.UserSettings();

                    try
                    {
                        objROPSummarySettings = JsonConvert.DeserializeObject<ROPSummarySettings>(objSettings.settingData);
                    }
                    catch (Exception)
                    {


                    }
                }
                else
                {

                    try
                    {
                        objROPSummarySettings = JsonConvert.DeserializeObject<ROPSummarySettings>(objSettings.settingData);
                    }
                    catch (Exception)
                    {


                    }

                }

                if (objROPSummarySettings == null)
                {
                    objROPSummarySettings = new ROPSummarySettings();

                    objSettings = new UserSettings.UserSettings();
                    objSettings.UserId = userId;
                    objSettings.WellId = wellId;
                    objSettings.SettingsId = ROPSummarySettings.SettingsId;
                    objSettings.settingData = JsonConvert.SerializeObject(objROPSummarySettings);

                    //Save these settings
                    objSettingsMgr.saveUserSettings(objSettings);
                }

                return objROPSummarySettings;
            }
            catch (Exception ex)
            {

                return new ROPSummarySettings();
            }

        }


        private Dictionary<int, DepthMatchingInfo> getDepthMatchingList(Dictionary<string, FormationTop> paramOffsetTops, Dictionary<string, FormationTop> paramMainTops)
        {
            try
            {
                Dictionary<int, DepthMatchingInfo> list = new Dictionary<int, DepthMatchingInfo>();

                FormationTop[] arrOffsetTops = paramOffsetTops.Values.ToArray();
                FormationTop[] arrMainTops = paramMainTops.Values.ToArray();

                Array.Sort(arrOffsetTops);
                Array.Sort(arrMainTops);

                double lastOffsetDepth = 0;

                // //Loop through formation tops of main well and compare it with offset
                for (int i = 0; i <= arrMainTops.Length - 1; i++)
                {
                    string TopName = arrMainTops[i].TopName.Trim().ToUpper();
                    double TopDepth = arrMainTops[i].Depth;

                    // '//Look into the offset tops and find this top ... we must start after the last depth
                    for (int j = 0; j <= arrOffsetTops.Length - 1; j++)
                    {
                        if (arrOffsetTops[j].Depth >= lastOffsetDepth)
                        {
                            if (arrOffsetTops[j].TopName.Trim().ToUpper() == TopName)
                            {

                                // 'Match found ... Create an entry ...

                                DepthMatchingInfo objMatchItem = new DepthMatchingInfo();
                                objMatchItem.MainWellDepth = arrMainTops[i].Depth;
                                objMatchItem.OffsetDepth = arrOffsetTops[j].Depth;
                                objMatchItem.FormationTop = TopName;

                                // 'Add to the list 
                                list.Add(list.Count + 1, objMatchItem);

                                // 'Record last depth ...
                                lastOffsetDepth = arrOffsetTops[j].Depth;


                                break;
                            }
                        }
                    }
                }

                return list;
            }
            catch (Exception ex)
            {
                return new Dictionary<int, DepthMatchingInfo>();
            }
        }

        private void detectTripOuts(Broker.BrokerRequest paramRequest)
        {
            try
            {
                double standThreshold = 900;
                tripOuts.Clear();
                tripOutsOffset.Clear();


                // 'Get all the connections falling in the 
                DataTable objData = paramRequest.objDataService.getTable("SELECT FROM_DATE,TO_DATE,DEPTH FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + wellId + "' AND ((FROM_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND FROM_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "') OR (TO_DATE>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TO_DATE<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "')) ORDER BY FROM_DATE");
                for (int i = 0; i< objData.Rows.Count - 2; i++)
                {
                    DateTime connEndDate =Convert.ToDateTime(  DataService.checkNull(objData.Rows[i]["TO_DATE"], DateTime.MinValue));
                    DateTime nextConnStartDate = Convert.ToDateTime( DataService.checkNull(objData.Rows[i + 1]["FROM_DATE"], DateTime.MinValue));
                    double connDepth = Convert.ToDouble( DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                    // 'Find Min. Depth between these two connections
                    double minDepth = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase("SELECT MIN(DEPTH) FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>'" + connEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + nextConnStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'"));
                    if (Math.Abs(connDepth - minDepth) > standThreshold)
                    {

                        // 'There is a trip out ...
                        // 'Find the drilling end date

                        // 'Find the date that matches min. depth
                        DataTable minDateData = paramRequest.objDataService.getTable("SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>'" + connEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + nextConnStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH=" + minDepth.ToString());
                        if (minDateData.Rows.Count > 0)
                        {
                            DateTime minDepthDate =Convert.ToDateTime( minDateData.Rows[0]["DATETIME"]);

                            // 'Find the drilling end
                            DataTable drillingEndData = paramRequest.objDataService.getTable("SELECT TOP 1 DATETIME,HDTH FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>'" + connEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<'" + minDepthDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) ORDER BY DATETIME DESC");
                            if (drillingEndData.Rows.Count > 0)
                            {
                                double tripOutDepth = Convert.ToDouble( DataService.checkNull(drillingEndData.Rows[0]["HDTH"], 0));
                                tripOuts.Add(tripOutDepth, tripOutDepth);
                            }
                        }
                    }
                }

                if (objOffsetTimeLog is object)
                {
                    DateTime offsetFromDate = objOffsetTimeLog.getDateTimeFromDepthBegining(ref paramRequest.objDataService, fromDepth);
                    DateTime offsetToDate = objOffsetTimeLog.getDateTimeFromDepthEnding(ref paramRequest.objDataService, toDepth);
                    objData = paramRequest.objDataService.getTable("SELECT FROM_DATE,TO_DATE,DEPTH FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + objOffsetTimeLog.WellID + "' AND ((FROM_DATE>='" + offsetFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND FROM_DATE<='" + offsetToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "') OR (TO_DATE>='" + offsetFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND TO_DATE<='" + offsetToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "')) ORDER BY FROM_DATE");
                    for (int i = 0; i< objData.Rows.Count - 2; i++)
                    {
                        DateTime connEndDate =Convert.ToDateTime( DataService.checkNull(objData.Rows[i]["TO_DATE"], DateTime.MinValue));
                        DateTime nextConnStartDate = Convert.ToDateTime( DataService.checkNull(objData.Rows[i + 1]["FROM_DATE"], DateTime.MinValue));
                        double connDepth = Convert.ToDouble( DataService.checkNull(objData.Rows[i]["DEPTH"], 0));

                        // 'Find Min. Depth between these two connections
                        double minDepth = Common.Util.ValEx(paramRequest.objDataService.getValueFromDatabase("SELECT MIN(DEPTH) FROM " + objOffsetTimeLog.__dataTableName + " WHERE DATETIME>'" + connEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + nextConnStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "'"));
                        if (Math.Abs(connDepth - minDepth) > standThreshold)
                        {

                            // 'There is a trip out ...
                            // 'Find the drilling end date

                            // 'Find the date that matches min. depth
                            DataTable minDateData = paramRequest.objDataService.getTable("SELECT TOP 1 DATETIME FROM " + objOffsetTimeLog.__dataTableName + " WHERE DATETIME>'" + connEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + nextConnStartDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DEPTH=" + minDepth.ToString());
                            if (minDateData.Rows.Count > 0)
                            {
                                DateTime minDepthDate =Convert.ToDateTime(minDateData.Rows[0]["DATETIME"]);

                                // 'Find the drilling end
                                DataTable drillingEndData = paramRequest.objDataService.getTable("SELECT TOP 1 DATETIME,HDTH FROM " + objOffsetTimeLog.__dataTableName + " WHERE DATETIME>'" + connEndDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<'" + minDepthDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) ORDER BY DATETIME DESC");
                                if (drillingEndData.Rows.Count > 0)
                                {
                                    double tripOutDepth = Convert.ToDouble( DataService.checkNull(drillingEndData.Rows[0]["HDTH"], 0));
                                    tripOutsOffset.Add(tripOutDepth, tripOutDepth);
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


    }



}
