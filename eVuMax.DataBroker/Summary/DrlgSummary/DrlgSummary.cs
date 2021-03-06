using eVuMax.DataBroker.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Common;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.Summary.DrlgSummary
{
    public class DrlgSummary : IBroker
    {
        eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

        private Dictionary<string, ChartOutputItem> itemsList = new Dictionary<string, ChartOutputItem>();
        private DataTable objFilteredData = new DataTable();
        private TimeLog objTimeLog;
        private string SideTrackKey = "-999";
        DrlgSummaryData objSummaryData = new DrlgSummaryData();
        private string lastError = "";
        private VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
        private VuMaxDR.Data.Objects.TimeLog objOffsetTimeLog = new TimeLog();

        private VuMaxDR.Data.Objects.rigState objRigState = new rigState();

        string selectionType = "-1";//10% of timelog data

        string wellId = "";
        //ROP Line Data

        MnemonicMappingMgr objMnemonicMappingMgr = new MnemonicMappingMgr();
        const string ROPMnemonic = "ROP";
        double[] mainROPX;
        double[] mainROPY;
        DateTime[] mainROPDate;

        double[] offsetROPX;
        double[] offsetROPY;



        DateTime fromDate = DateTime.Now;
        DateTime toDate = DateTime.Now;

        double fromDepth = 0;
        double toDepth = 0;

        DateTime offsetFromDate = DateTime.Now;
        DateTime offsetToDate = DateTime.Now;

        double offsetDepthIn = 0;
        double offsetDepthOut = 0;
        bool MatchDepthByFormationTops = false;

        string warning = "";
        //************************************

        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                //Nishant
                if (paramRequest.Function == "DrlgSummary")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                    objResponse = getDrlgSummary(paramRequest);

                    return objResponse;
                }

                if (paramRequest.Function == "getUserSettings")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    // objResponse = getUserSettings(paramRequest);

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

                    //  objResponse = saveUserSettings(paramRequest);

                    return objResponse;
                }

                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                return paramRequest.createResponseObject();
            }
        }


        
        private Broker.BrokerResponse getDrlgSummary(Broker.BrokerRequest paramRequest)
        {
            try
            {
                objLogger.LogMessage("getDrlgSummary Function started... ");

                string __Warnings = "";

                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                selectionType = paramRequest.Parameters.Where(x => x.ParamName.Contains("SelectionType")).FirstOrDefault().ParamValue.ToString();
                fromDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDepth")).FirstOrDefault().ParamValue.ToString());
                toDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDepth")).FirstOrDefault().ParamValue.ToString());
                bool MatchDepthByFormationTops = bool.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("MatchDepthByFormationTops")).FirstOrDefault().ParamValue.ToString());
                //Prath added on 07-Feb-2022
                this.MatchDepthByFormationTops = MatchDepthByFormationTops;

                bool isRealTime = false;
                int refreshHrs = 24;
                isRealTime = Convert.ToBoolean(paramRequest.Parameters.Where(x => x.ParamName.Contains("isRealTime")).FirstOrDefault().ParamValue);
                refreshHrs = Convert.ToInt32(paramRequest.Parameters.Where(x => x.ParamName.Contains("refreshHrs")).FirstOrDefault().ParamValue);

                if (isRealTime)
                {
                    selectionType = "2";
                }

                try
                {
                    //Nishant
                    SideTrackKey = paramRequest.Parameters.Where(x => x.ParamName.Contains("SideTrackKey")).FirstOrDefault().ParamValue.ToString();
                    fromDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDate")).FirstOrDefault().ParamValue.ToString());
                    toDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDate")).FirstOrDefault().ParamValue.ToString());


                    //Convert date to UTC
                    fromDate = fromDate.ToUniversalTime();
                    toDate = toDate.ToUniversalTime();
                }
                catch (Exception ex)
                {
                    objLogger.LogMessage("Error --> getDrlgSummary Function line 172 " + ex.Message + " " + ex.StackTrace);

                }

                string plotID = "CROSSPLOTDRILLING";


                objWell = VuMaxDR.Data.Objects.Well.loadObject(ref paramRequest.objDataService, wellId, ref lastError);
                if (objWell != null)
                {
                    objLogger.LogMessage("getDrlgSummary objWell Successfully loaded... ");
                    objSummaryData.WellName = objWell.name;
                    objSummaryData.RigName = objWell.RigName;
                    //objSummaryData.StartDate = convertUTCToWellTimeZone(fromDate).ToString("MMM-dd-yyyy HH:mm:ss");
                    //objSummaryData.MainDepthIn = Math.Round(fromDepth, 2).ToString();
                    //objSummaryData.MainDepthOut = Math.Round(toDepth, 2).ToString();
                    objSummaryData.Distance = Math.Round(toDepth - fromDepth, 2).ToString();
                    objSummaryData.RunNo = paramRequest.objDataService.getValueFromDatabase("SELECT RUN_NO FROM VMX_USER_DATA_SELECTION WHERE WELL_ID='" + wellId + "' AND USER_NAME='" + paramRequest.objDataService.UserName + "' AND PLOT_ID='" + plotID + "'").ToString();
                }


                //Check if time log exist, else return empty JSON
                if (!VuMaxDR.Data.Objects.Well.isTimeLogExist(ref paramRequest.objDataService, wellId))
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Response = "{}";
                    objBadResponse.Errors = "No time logs found in this well ";
                    return objBadResponse;

                }


                //Get the primary time log 
                objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLog(ref paramRequest.objDataService, wellId);
                if (objTimeLog.ObjectID == "")
                {
                    __Warnings += "Primary TimeLog not assigned/ not found";
                }
                objRigState = rigState.loadWellRigStateSetup(ref paramRequest.objDataService, wellId);

                if (objTimeLog != null)
                {
                    
                    objSummaryData.DepthUnit = objTimeLog.logCurves["DEPTH"].VuMaxUnitID.ToString(); //Nishant
                    objLogger.LogMessage("getDrlgSummary objTimeLog is not Null... Depth Unit Id=" + objTimeLog.logCurves["DEPTH"].VuMaxUnitID.ToString());
                }
                else
                {
                    objLogger.LogMessage("Danger :--->>> objTimeLog is Null... ");
                }


                ////''#1 Process Main Well Summary Items ...

                //datetime
                if (selectionType == "0")
                {

                    if (objTimeLog != null)
                    {
                        //PRATH
                        fromDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, fromDate.ToOADate());
                        toDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, toDate.ToOADate());
                        selectionType = "0";
                        objLogger.LogMessage("getDrlgSummary selectionType is Zero (Datewise) ... From Date " +fromDate.ToString() + "-"+ toDate.ToString() +  "-- Depth from "+ fromDepth.ToString() +  "-"+ toDepth.ToString());
                    }
                }


                //get FromDate and ToDate from Timelog 10%
                if (selectionType == "-1" || selectionType == "2")
                {

                    if (objTimeLog != null)
                    {


                        DateTime minDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramRequest.objDataService));
                        DateTime maxDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref paramRequest.objDataService));

                        //double secondsDiff = Math.Abs((maxDate - minDate).TotalSeconds);
                        //double diff = (secondsDiff * 10) / 100; //10% data for slider
                        //double diff = (secondsDiff * 50) / 100; //10% data for slider

                        double diff=0;
                        if (selectionType == "-1" && !isRealTime)
                        {
                            diff = 86400; //10% data for slider
                            minDate = maxDate.AddSeconds(-1 * diff);
                        }
                        else
                        {
                            minDate = maxDate.AddHours(-refreshHrs);
                        }
                        
                        

                        //only to test for 1 day data
                        // minDate = maxDate.AddDays(-1);
                        //if (isRealTime)
                        //{
                        //    minDate = maxDate.AddHours(-refreshHrs);
                        //    //secondsDiff = Math.Abs((maxDate - minDate).TotalSeconds);
                        //    //minDate = maxDate.AddSeconds(-1 * secondsDiff);
                        //}


                        fromDate = minDate;
                        toDate = maxDate;

                        fromDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, fromDate.ToOADate());
                        toDepth = objTimeLog.getHoleDepthFromDateTime(ref paramRequest.objDataService, toDate.ToOADate());

                        selectionType = "0";
                        objLogger.LogMessage("getDrlgSummary selectionType is -1 or 2 (Live or last hrs ) ... From Date " + fromDate.ToString() + "-" + toDate.ToString() + "-- Depth from " + fromDepth.ToString() + "-" + toDepth.ToString());
                    }

                }




                if (selectionType == "1") // Depth Range
                {
                    //Nitin Changes n 21-10-2021
                    fromDate = objTimeLog.getDateTimeFromDepthBegining(ref paramRequest.objDataService, fromDepth);
                    toDate = objTimeLog.getDateTimeFromDepthEnding(ref paramRequest.objDataService, toDepth);
                    objLogger.LogMessage("getDrlgSummary selectionType is 1 ... From Date " + fromDate.ToString() + "-" + toDate.ToString() + "-- Depth from " + fromDepth.ToString() + "-" + toDepth.ToString());
                }


                //***************************
                if (objWell.offsetWells.Count > 0)
                {
                    objOffsetTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref paramRequest.objDataService, objWell.offsetWells.Values.First().OffsetWellID);
                    objSummaryData.offSetWellName = VuMaxDR.Data.Objects.Well.getName(ref paramRequest.objDataService, objOffsetTimeLog.WellID);

                    if (objOffsetTimeLog != null)
                    {
                        //get Numeric Data here

                        offsetFromDate = objOffsetTimeLog.getDateTimeFromDepthBegining(ref paramRequest.objDataService, fromDepth);
                        offsetToDate = objOffsetTimeLog.getDateTimeFromDepthEnding(ref paramRequest.objDataService, toDepth);

                        objSummaryData.offSetWellNumericData = processOffsetNumericOutput(ref paramRequest.objDataService, offsetFromDate, offsetToDate);
                        objLogger.LogMessage("getDrlgSummary OffsetWell... offsetFromDate Date " + offsetFromDate.ToString() + "-" + offsetToDate.ToString() + "-- Depth from " + fromDepth.ToString() + "-" + toDepth.ToString());
                    }
                }

                DataTable objDrlgSummaryData = new DataTable();
                DataTable objRigStateSummaryData = new DataTable();

                objSummaryData.RigStates = getRigState(ref paramRequest.objDataService, wellId); //prath

                objSummaryData.NumericData = processNumericOutput(ref paramRequest.objDataService, fromDate, toDate);

                //''#2 Process Rig State Summary ...
                objLogger.LogMessage("********  getDrlgSummary process getRigStateSummary Started..... ");
                getRigStateSummaryData(paramRequest, fromDate, toDate);

                //  ''#4 ROP Main + Offset Line Data
                objLogger.LogMessage("********  getDrlgSummary process generateROPData Started..... ");
                string ropWarnings = "";
                generateROPData(ref paramRequest.objDataService, out ropWarnings);

                __Warnings = __Warnings + " " + ropWarnings;

                //  ''#3 Calculate Statistics
                objLogger.LogMessage("********  getDrlgSummary process Calculate Statistics Started..... ");
                calculateStatistics(ref paramRequest.objDataService);

                //Get Well object

                // Set data
                objSummaryData.StartDate = fromDate;
                objSummaryData.EndDate = toDate;
                objSummaryData.MainDepthIn = fromDepth;
                objSummaryData.MainDepthOut = toDepth;

                objSummaryData.OffsetStartDate = offsetFromDate;
                objSummaryData.OffsetEndDate = offsetToDate;
                objSummaryData.OffsetMainDepthIn = offsetDepthIn;
                objSummaryData.OffsetMainDepthOut = offsetDepthOut;
                //=============


                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                __Warnings += warning;

                objResponse.Warnings = __Warnings;

                objResponse.Response = JsonConvert.SerializeObject(objSummaryData);
                return objResponse;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> getDrlgSummary Function line 355 " + ex.Message + " " + ex.StackTrace);
                return paramRequest.createResponseObject();
            }
        }

        public void getRigStateSummaryData(Broker.BrokerRequest paramRequest, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                
                Dictionary<int, double> __RigStateSummary = new Dictionary<int, double>();
                __RigStateSummary = objTimeLog.getRigStateSummary(ref paramRequest.objDataService, paramFromDate, paramToDate);
                if(__RigStateSummary.Count == 0 || __RigStateSummary == null)
                {
                    warning += "Rig States Summary is not available";
                }


                double totalSeconds = 0;
                objLogger.LogMessage("********  getRigStateSummaryData line 379 ..... " + __RigStateSummary.Keys.Count);
                foreach (int objKey in __RigStateSummary.Keys)
                    totalSeconds += __RigStateSummary[objKey];

                objLogger.LogMessage("********  getRigStateSummaryData line 383  Total Seconds=" + totalSeconds.ToString());

                double percentage = 0;
                double counter = 1;
                string textLabel = "";




                foreach (int objKey in __RigStateSummary.Keys)
                {
                    percentage = __RigStateSummary[objKey] * 100 / totalSeconds;

                    TimeSpan objTimeSpan = new TimeSpan(0, 0, (int)__RigStateSummary[objKey]);

                    string timeDisplay = "";
                    timeDisplay = "[" + objTimeSpan.Days.ToString() + ":" + objTimeSpan.Hours.ToString() + "]";
                    objLogger.LogMessage("********  getRigStateSummaryData line 400  Time Diplay =" + timeDisplay);
                    
                    DataRow objRow = objSummaryData.rigStateSummaryData.NewRow();

                    if (Math.Round(percentage, 2) > 0)
                    {
                        //textLabel = objRigState.getName(objKey) + System.Environment.NewLine + "[" + Math.Round(percentage, 2).ToString() + "%] " + System.Environment.NewLine + timeDisplay;
                        textLabel = objRigState.getName(objKey) + "# [" + Math.Round(percentage, 2).ToString() + "%] #" + timeDisplay;
                        //RigStateBar.Add(counter, percentage, textLabel, Color.FromArgb(objRigState.getColor(objKey)));
                        objRow["COUNTER"] = counter;
                        objRow["PERCENTAGE"] = percentage;
                        objRow["TEXT_LABEL"] = textLabel;

                        objRow["COLOR"] = ColorTranslator.ToHtml(Color.FromArgb((int)objRigState.getColor(objKey)));
                        objLogger.LogMessage("********  getRigStateSummaryData line 414  textLabel =" + textLabel + " - Percentage =" + percentage.ToString());

                        objSummaryData.rigStateSummaryData.Rows.Add(objRow);
                        counter += 1;
                    }
                    else
                    {
                        objLogger.LogMessage("********  getRigStateSummaryData  Percentage -ve line 414  textLabel =" + textLabel + " - Percentage =" + percentage.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("*** Error ===> getRigStateSummaryData Function line 423 " + ex.Message + " " + ex.StackTrace);
            }
        }





        private void generateROPData(ref VuMaxDR.Data.DataService objDataService, out string paramWarnings)
        {
            paramWarnings = "";

            try
            {


                objMnemonicMappingMgr.loadMappings(ref objDataService);
                DataTable objROPData = new DataTable();



                string mainROPMnemonic = ROPMnemonic;
                string offsetROPMnemonic = ROPMnemonic;

                //// Main Time Log

                if (objTimeLog.logCurves.ContainsKey(mainROPMnemonic))
                {
                    //Nothing to do ...
                }
                else
                {
                    mainROPMnemonic = objMnemonicMappingMgr.getMappedMnemonic(ROPMnemonic, objTimeLog.logCurves);

                }

                if (mainROPMnemonic.Trim() == "")
                {
                    paramWarnings = "ROP data of main well not found. Check the mnemonic mappings.";
                }

                if (objOffsetTimeLog != null)
                {
                    if (objOffsetTimeLog.logCurves.ContainsKey(offsetROPMnemonic))
                    {
                        ////Nothing to do ...
                    }
                    else
                    {
                        offsetROPMnemonic = objMnemonicMappingMgr.getMappedMnemonic(ROPMnemonic, objOffsetTimeLog.logCurves);
                    }
                }

                string strSQL = "";

                if (mainROPMnemonic.Trim() != "")
                {
                    if (selectionType == "1")
                    { //Depth Range
                        strSQL = "SELECT AVG([" + mainROPMnemonic + "]) AS ROP,ROUND([HDTH],0) AS HDTH,MAX(DATETIME) AS DATETIME FROM " + objTimeLog.__dataTableName + " WHERE [HDTH]>=" + fromDepth.ToString() + " AND [HDTH]<=" + toDepth.ToString() + " AND [" + mainROPMnemonic + "]>=0 AND [HDTH]>=0  GROUP BY ROUND(HDTH,0) ORDER BY HDTH";
                    }
                    else
                    {
                        strSQL = "SELECT AVG([" + mainROPMnemonic + "]) AS ROP,ROUND([HDTH],0) AS HDTH,MAX(DATETIME) AS DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND [" + mainROPMnemonic + "]>=0 AND [HDTH]>=0 GROUP BY ROUND(HDTH,0) ORDER BY HDTH";
                    }

                    DataTable objData = objDataService.getTable(strSQL);
                    objLogger.LogMessage("generateROPData Function line 491 " + objData.Rows.Count);

                    if (objData.Rows.Count > 0)
                    {
                        Array.Resize(ref mainROPX, objData.Rows.Count);
                        Array.Resize(ref mainROPY, objData.Rows.Count);
                        Array.Resize(ref mainROPDate, objData.Rows.Count);

                        for (int i = 0; i <= objData.Rows.Count - 1; i++)
                        {
                            double ROP = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["ROP"], 0));
                            double Depth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["HDTH"], 0));
                            DateTime DateTime_ = Convert.ToDateTime(DataService.checkNull(objData.Rows[i]["DATETIME"], new DateTime()));

                            
                            
                            if (objWell.wellDateFormat == VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                            {
                                DateTime_ = Util.convertUTCToWellTimeZone(DateTime_, objWell);
                                objLogger.LogMessage("generateROPData Function line 525 Depth= " + Depth.ToString() + " - " + DateTime_.ToString());
                            }
                            else
                            {
                                DateTime_ = Util.convertWellToLocalTimeZone(DateTime_, objWell);
                                objLogger.LogMessage("generateROPData Function line 530 Depth= " + Depth.ToString() + " - " + DateTime_.ToString());
                            }


                            mainROPX[i] = ROP;
                            mainROPY[i] = Depth;
                            mainROPDate[i] = DateTime_;
                        }
                    }
                }

                if (offsetROPMnemonic.Trim() != "")
                {
                    DateTime offsetFromDate = objOffsetTimeLog.getDateTimeFromDepthBegining(ref objDataService, fromDepth);
                    DateTime offsetToDate = objOffsetTimeLog.getDateTimeFromDepthEnding(ref objDataService, toDepth);
                    objLogger.LogMessage("generateROPData  Offset line 530 From Date = "  + offsetFromDate.ToString() + " - " + offsetToDate.ToString() + "- Mnemonic" + offsetROPMnemonic);
                    
                    if (MatchDepthByFormationTops)
                    {
                        strSQL = "SELECT AVG([" + offsetROPMnemonic + "]) AS ROP,ROUND([HDTH],0) AS HDTH FROM " + objOffsetTimeLog.__dataTableName + " WHERE [" + offsetROPMnemonic + "]>=0 AND [HDTH]>=0 AND [HDTH]>=" + fromDepth.ToString() + " AND [HDTH]<=" + toDepth.ToString() + " GROUP BY ROUND(HDTH,0) ORDER BY HDTH";
                    }
                    else
                    {
                        strSQL = "SELECT AVG([" + offsetROPMnemonic + "]) AS ROP,ROUND([HDTH],0) AS HDTH FROM " + objOffsetTimeLog.__dataTableName + " WHERE [HDTH]>=" + fromDepth.ToString() + " AND [HDTH]<=" + toDepth.ToString() + " AND [" + offsetROPMnemonic + "]>=0 AND [HDTH]>=0 GROUP BY ROUND(HDTH,0) ORDER BY HDTH";
                    }


                    DataTable objData = objDataService.getTable(strSQL);
                    objLogger.LogMessage("generateROPData  Offset line 554 objData.length= " + objData.Rows.Count);

                    if (objData.Rows.Count > 1) //Process only if more then 1 record is present Nishant 28-09-2020
                    {
                        Array.Resize(ref offsetROPX, objData.Rows.Count);
                        Array.Resize(ref offsetROPY, objData.Rows.Count);

                        for (int i = 0; i <= objData.Rows.Count - 1; i++)
                        {

                            Double ROP = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["ROP"], 0));
                            Double Depth = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["HDTH"], 0));
                            objLogger.LogMessage("generateROPData  Line 567 Depth=" +Depth.ToString() +" - "+ "ROP= " + ROP.ToString());
                            offsetROPX[i] = ROP;
                            offsetROPY[i] = Depth;

                        }

                        offsetDepthIn = offsetROPY[0];


                        if (offsetROPY.Length > 0)
                        {
                            offsetDepthOut = offsetROPY[offsetROPY.Length - 1];
                        }

                        //============================

                        ////''#### Implement Depth Matching Functionality ###############''
                        if (MatchDepthByFormationTops)
                        {

                            //  ''get the list of formation tops of both the wells ...
                            Dictionary<string, FormationTop> offsetTops = FormationTop.getList(ref objDataService, objOffsetTimeLog.WellID);
                            Dictionary<string, FormationTop> mainTops = FormationTop.getList(ref objDataService, wellId);
                            // ''get the depth matching list
                            Dictionary<int, DepthMatchingInfo> depthMatchingList = GetDepthMatchingList(offsetTops, mainTops);

                            ////''Now match the depth
                            matchDepth(ref offsetROPY, depthMatchingList);
                            //  ''Now count the no. of elements that matches the depth criteria

                            int elementCount = 0;

                            for (int i = 0; i < offsetROPY.Length - 1; i++)
                            {
                                if (offsetROPY[i] >= fromDepth && offsetROPY[i] <= toDepth)
                                {
                                    elementCount += 1;
                                }
                            }

                            //  ''Get the temp array
                            double[] tempXData = new double[elementCount - 1 + 1];
                            double[] tempYData = new double[elementCount - 1 + 1];

                            int subCounter = 0;
                            objLogger.LogMessage("generateROPData offsetROPY line 613 ... " + offsetROPY.Length);
                            for (int i = 0; i < offsetROPY.Length - 1; i++)
                            {

                                if (offsetROPY[i] >= fromDepth && offsetROPY[i] <= toDepth)
                                {
                                    tempXData[subCounter] = offsetROPX[i];
                                    tempYData[subCounter] = offsetROPY[i];
                                    subCounter += 1;
                                }
                            }

                            ////''Now again, resize the main arrays and copy temp data...
                            Array.Resize(ref offsetROPX, elementCount - 1);
                            Array.Resize(ref offsetROPY, elementCount - 1);



                            objLogger.LogMessage("generateROPData tempXData line 610 ... " + tempXData.Length);
                            for (int i = 0; i < tempXData.Length - 1; i++)
                            {
                                offsetROPX[i] = tempXData[i];
                                offsetROPY[i] = tempYData[i];
                            }

                        }
                    }
                }
                else
                {
                    paramWarnings += "Off Set ROP Mneomic Not Mapped, Please check Menomic Mapping";
                }

                //Add Data to ROP Data Table form Array
                if (mainROPX != null)
                {
                    int totalRowCount = mainROPX.Length;
                    DataRow objNewRow = objSummaryData.ROPData.NewRow();

                    for (int i = 0; i < totalRowCount; i++)
                    {
                        objNewRow = objSummaryData.ROPData.NewRow();
                        objNewRow["X"] = mainROPX[i];
                        objNewRow["Y"] = mainROPY[i];
                        objNewRow["DATE_TIME"] = mainROPDate[i];
                        objLogger.LogMessage("generateROPData add to table  X=" + mainROPX[i].ToString() + " - Y="+ mainROPY[i].ToString());
                        objSummaryData.ROPData.Rows.Add(objNewRow);
                    }
                }
               if(objSummaryData.ROPData.Rows.Count==0 || objSummaryData.ROPData == null)
                {
                    paramWarnings += "ROP Data Not found";
                }

                //Add Data to Offset ROP Data Table form Array
                if (offsetROPX != null)
                {
                    int totalRowCount = offsetROPX.Length;
                    DataRow objNewRow = objSummaryData.ROPDataOffset.NewRow();

                    for (int i = 0; i < totalRowCount; i++)
                    {
                        objNewRow = objSummaryData.ROPDataOffset.NewRow();
                        objNewRow["X"] = offsetROPX[i];
                        objNewRow["Y"] = offsetROPY[i];
                        objNewRow["DATE_TIME"] = offsetROPX[i];
                        objLogger.LogMessage("generateROPData Offset add to table  X=" + offsetROPX[i].ToString() + " - Y=" + offsetROPY[i].ToString());
                        objSummaryData.ROPDataOffset.Rows.Add(objNewRow);
                    }
                }

                if (objSummaryData.ROPDataOffset.Rows.Count == 0 || objSummaryData.ROPDataOffset == null)
                {
                    paramWarnings += "Offset Well ROP Data Not found";
                }

            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> generateROPData  Exception throw on line 666 " + ex.Message + " " + ex.StackTrace);

            }
        }

        //Prath
        private DataTable getRigState(ref VuMaxDR.Data.DataService objDataService, string wellID)
        {
            try
            {
                DataTable objData = new DataTable();

                string strSQL = "SELECT WELL_ID, RIG_STATE_NUMBER, RIG_STATE_NAME, RIG_STATE_COLOR FROM VMX_WELL_RIGSTATE_ITEMS WHERE WELL_ID ='" + wellID + "'";
                objData = objDataService.getTable(strSQL);

                objData.Columns.Add("HEX_COLOR", typeof(System.String));

                foreach (DataRow objRow in objData.Rows)
                {
                    objRow["HEX_COLOR"] = ColorTranslator.ToHtml(Color.FromArgb((int)Convert.ToDouble(objRow["RIG_STATE_COLOR"].ToString())));
                }

                return objData;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> getRigState  Exception throw on line 693 " + ex.Message + " " + ex.StackTrace);
                return new DataTable();
            }

        }

        //get Date from Depth Range
        private void getDateRangeFromDepth(Broker.BrokerRequest paramRequest, double paramFromDepth, double paramToDepth, ref DateTime paramFromDate, ref DateTime paramToDate)
        {

            try
            {

                string dataTableName = objTimeLog.getDataTableName(ref paramRequest.objDataService);
                string strSQL = "";
                strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE HDTH>=" + paramFromDepth.ToString() + " ORDER BY DATETIME";
                DataTable objData = paramRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {
                    paramFromDate = Convert.ToDateTime(objData.Rows[0]["DATETIME"]);
                }


                strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE HDTH>=" + paramToDepth.ToString() + " ORDER BY DATETIME";
                objData = paramRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {
                    paramToDate = Convert.ToDateTime(objData.Rows[0]["DATETIME"]);
                }

                if (objData != null)
                {
                    objData.Dispose();
                }

            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> getDateRangeFromDepth  Exception throw on line 759 " + ex.Message + " " + ex.StackTrace);
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
                objLogger.LogMessage("Error --> getDateRangeFromSideTrack  Exception throw on line 810 " + ex.Message + " " + ex.StackTrace);
            }


        }


        private ChartOutputItem CreateStatItemFromString(string paramString)
        {
            try
            {
                // 'Time (Rotary)#RigStateTime#x#0#ObjectLevel#XValues#RigStateSummary


                string[] parts = paramString.Split('#');


                ChartOutputItem objItem = new ChartOutputItem();
                objItem.ItemName = parts[0];
                objItem.sFunction = (ChartOutputItem.OutputFunction)Util.ValEx(parts[1]);
                objItem.statExpression = parts[2];
                objItem.EvaluateCondition = parts[3];
                objItem.CalculationLevel = (ChartOutputItem.ChartOutputItemLevel)Util.ValEx(parts[4]);
                objItem.DataSourceColumn = (ChartOutputItem.SourceColumn)Util.ValEx(parts[5]);
                objItem.ItemType = (ChartOutputItem.itemType)Util.ValEx(parts[6]);

                return objItem;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> CreateStatItemFromString  Exception throw on line 841 " + ex.Message + " " + ex.StackTrace);
                return new ChartOutputItem();

            }
        }


        private void generateDefaultItems()
        {
            try
            {
                itemsList.Clear();

                Collection<string> list = new Collection<string>();


                list.Add("ROP_Rotary#12#ROPAvg#0#1#0#2");
                list.Add("ROP_Slide#12#ROPAvg#1#1#0#2");
                list.Add("ROP_AutoSlide#12#ROPAvg#19#1#0#2");
                list.Add("ROP_Overall#12#ROPAvg#0,1,19#1#0#2");


                list.Add("Time_Rotary#9#x#0#1#0#1");
                list.Add("Time_Slide#9#x#1#1#0#1");
                list.Add("Time_AutoSlide#9#x#19#1#0#1");
                list.Add("Time_Overall#9#x#0,1,19#1#0#1");


                list.Add("Distance_Rotary#10#x#0#1#0#1");
                list.Add("Distance_Slide#10#x#1#1#0#1");
                list.Add("Distance_AutoSlide#10#x#19#1#0#1");
                list.Add("Distance_Overall#10#x#0,1,19#1#0#1");


                list.Add("Rotary_Time_Pct#0#DEPTH#0#1#0#3");
                list.Add("Slide_Time_Pct#0#DEPTH#1#1#0#3");
                list.Add("Auto_Slide_Time_Pct#0#DEPTH#19#1#0#3");


                list.Add("Rotary_Footage_Pct#14#DEPTH#0#1#0#2");
                list.Add("Slide_Footage_Pct#14#DEPTH#1#1#0#2");
                list.Add("Auto_Slide_Footage_Pct#14#DEPTH#19#1#0#");


                objLogger.LogMessage("generateDefaultItems line 884 list length = " + list.Count);
                foreach (string strItem in list)
                {
                    ChartOutputItem objItem = CreateStatItemFromString(strItem);
                    objLogger.LogMessage("generateDefaultItems strItem = " + strItem);

                    if (objItem != null)
                        itemsList.Add((itemsList.Count()).ToString(), objItem);
                }
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> generateDefaultItems Function line 896 " + ex.Message + " " + ex.StackTrace);
            }
        }
        private DataTable processOffsetNumericOutput(ref VuMaxDR.Data.DataService objDataService, DateTime FromDate, DateTime ToDate)
        {
            try
            {
                // 'Generate list of default items ...
                generateDefaultItems();

                // 'Define a table 
                objFilteredData = new DataTable();

                // 'Add Name column
                objFilteredData.Columns.Add("__NAME");

                ChartOutputItem[] arrChartResults = itemsList.Values.ToArray();
                // 'Array.Sort(arrChartResults)

                if (arrChartResults.GetType().IsArray)
                {
                    for (int i = 0; i <= arrChartResults.Length - 1; i++)
                    {
                        ChartOutputItem objItem = arrChartResults[i];
                        objFilteredData.Columns.Add(objItem.ItemName.Replace(" ", "_"));
                    }
                }


                // '>>>> Evaluate Object Level Items ============================================================================================

                DataRow objRow = objFilteredData.NewRow();

                objRow["__NAME"] = objOffsetTimeLog.nameLog;

                foreach (ChartOutputItem objItem in itemsList.Values)
                {
                    if (objItem.CalculationLevel == ChartOutputItem.ChartOutputItemLevel.ObjectLevel)
                    {

                        // 'Create Statistics Item ---
                        StatisticsItem objStatItem = new StatisticsItem();

                        objStatItem.copyFromChartOutputItem(objItem);

                        if (objStatItem.ItemType == StatisticsItem.StatItemType.Normal)
                        {
                            double statResult = objOffsetTimeLog.EvaluateStatColumn(ref objDataService, ref objOffsetTimeLog, FromDate, ToDate, objStatItem.toDRItemVuMax());
                            statResult = Math.Round(statResult, 3);

                            objRow[objItem.ItemName.Replace(" ", "_")] = statResult;
                        }
                        else
                        {

                            // 'Check if using 

                            double result = objOffsetTimeLog.EvaluateStatColumn(ref objDataService, ref objOffsetTimeLog, FromDate, ToDate, objStatItem.toDRItemVuMax());

                            result = Math.Round(result, 3);


                            if (objStatItem.sFunction == StatisticsItem.StatFunction.SumDateTime | objStatItem.sFunction == StatisticsItem.StatFunction.RigStateTime)
                            {
                                TimeSpan objSpan = new TimeSpan(0, 0, (int)result);


                                string strResult = "[" + objSpan.Days.ToString() + ":" + objSpan.Hours.ToString() + ":" + objSpan.Minutes.ToString() + ":" + objSpan.Seconds.ToString() + "]";
                                // 'Create a row for it
                                objRow[objItem.ItemName.Replace(" ", "_")] = strResult;
                            }
                            else

                                // 'Create a row for it
                                objRow[objItem.ItemName.Replace(" ", "_")] = result;
                        }
                    }
                }

                objFilteredData.Rows.Add(objRow);

                return objFilteredData;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> processOffsetNumericOutput  Exception throw on line 981 " + ex.Message + " " + ex.StackTrace);
                return new DataTable();
            }
        }



        private DataTable processNumericOutput(ref VuMaxDR.Data.DataService objDataService, DateTime FromDate, DateTime ToDate)
        {
            try
            {
                // 'Generate list of default items ...
                generateDefaultItems();

                // 'Define a table 
                objFilteredData = new DataTable();

                // 'Add Name column
                objFilteredData.Columns.Add("__NAME");

                ChartOutputItem[] arrChartResults = itemsList.Values.ToArray();
                // 'Array.Sort(arrChartResults)
                objLogger.LogMessage("processNumericOutput Generate list 1003... " + arrChartResults.Length);

                if (arrChartResults.GetType().IsArray)
                {
                    for (int i = 0; i <= arrChartResults.Length - 1; i++)
                    {
                        ChartOutputItem objItem = arrChartResults[i];
                        objFilteredData.Columns.Add(objItem.ItemName.Replace(" ", "_"));
                        objLogger.LogMessage("processNumericOutput ItemName 1011... " + objItem.ItemName.Replace(" ", "_"));
                    }
                }


                // '>>>> Evaluate Object Level Items ============================================================================================

                DataRow objRow = objFilteredData.NewRow();

                objRow["__NAME"] = objTimeLog.nameLog;
                objLogger.LogMessage("processNumericOutput Evaluate Object  ... " + itemsList.Values.Count);

                foreach (ChartOutputItem objItem in itemsList.Values)
                {
                    if (objItem.CalculationLevel == ChartOutputItem.ChartOutputItemLevel.ObjectLevel)
                    {
                        objLogger.LogMessage("processNumericOutput ObjectLevel... ");
                        // 'Create Statistics Item ---
                        StatisticsItem objStatItem = new StatisticsItem();

                        objStatItem.copyFromChartOutputItem(objItem);

                        if (objStatItem.ItemType == StatisticsItem.StatItemType.Normal)
                        {
                            objLogger.LogMessage("processNumericOutput objStatItem.ItemType is Normal... ");

                            double fromRow = FromDate.ToOADate();
                            double toRow = ToDate.ToOADate();

                            //double statResult = objTimeLog.EvaluateStatColumn(ref objDataService, ref objTimeLog, FromDate, ToDate, objStatItem.toDRItemVuMax());
                            double statResult = objTimeLog.EvaluateStatColumn(ref objDataService, ref objTimeLog, fromRow, toRow, objStatItem.toDRItemVuMax());
                            statResult = Math.Round(statResult, 3);

                            objRow[objItem.ItemName.Replace(" ", "_")] = statResult;
                        }
                        else
                        {
                            objLogger.LogMessage("processNumericOutput objStatItem.ItemType is not Normal line 1007.. ");
                            // 'Check if using 
                            //double result = objTimeLog.EvaluateStatColumn(ref objDataService, ref objTimeLog, FromDate, ToDate, objStatItem.toDRItemVuMax());
                            double fromRow = FromDate.ToOADate();
                            double toRow = ToDate.ToOADate();


                            double result = objTimeLog.EvaluateStatColumn(ref objDataService, ref objTimeLog, fromRow, toRow, objStatItem.toDRItemVuMax());

                            result = Math.Round(result, 3);
                            objLogger.LogMessage("processNumericOutput objStatItem.ItemType is not Normal line 1015 result = " + result.ToString());

                            if (objStatItem.sFunction == StatisticsItem.StatFunction.SumDateTime | objStatItem.sFunction == StatisticsItem.StatFunction.RigStateTime)
                            {
                                TimeSpan objSpan = new TimeSpan(0, 0, (int)result);


                                string strResult = "[" + objSpan.Days.ToString() + ":" + objSpan.Hours.ToString() + ":" + objSpan.Minutes.ToString() + ":" + objSpan.Seconds.ToString() + "]";
                                // 'Create a row for it
                                objRow[objItem.ItemName.Replace(" ", "_")] = strResult;
                                objLogger.LogMessage("processNumericOutput objStatItem.sFunction is not Normal line 1027 strResult=" + strResult);
                            }
                            else

                                // 'Create a row for it
                                objRow[objItem.ItemName.Replace(" ", "_")] = result;
                            objLogger.LogMessage("processNumericOutput not Normal line 1032 strResult=" + result.ToString());
                        }
                    }
                }

                objFilteredData.Rows.Add(objRow);

                return objFilteredData;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> processNumericOutput  Exception throw on line 1044 " + ex.Message + " " + ex.StackTrace);
                return new DataTable();
            }
        }


        private DateTime convertUTCToWellTimeZone(DateTime paramDate)
        {
            try
            {
                DateTime dtDate = paramDate.ToLocalTime(); // 'The date will already be in local time zone ...

                string localOffset = TimeOffsetInfo.getLocalTimeZoneUTCOffset(dtDate);
                string newOffset = objWell.timeZone;

                int Difference = TimeOffsetInfo.getTimeZoneDifferenceMinutes(localOffset, newOffset);

                dtDate = dtDate.AddMinutes(Difference);

                return dtDate;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> convertUTCToWellTimeZone  Exception throw on line 1081 " + ex.Message + " " + ex.StackTrace);
                return paramDate;
            }
        }


        #region "Pie Data Calculations"
        private void calculateStatistics(ref VuMaxDR.Data.DataService objDataService)
        {
            try
            {
                objSummaryData.RotaryTime = calcDrillingTime(objDataService, objTimeLog, "0", fromDate, toDate);
                objSummaryData.SlideTime = calcDrillingTime(objDataService, objTimeLog, "1,19", fromDate, toDate);

                objSummaryData.RotaryFootage = Math.Round(calcDrillingFootage(objTimeLog, "0", fromDate, toDate, objDataService));
                objSummaryData.SlideFootage = Math.Round(calcDrillingFootage(objTimeLog, "1,19", fromDate, toDate, objDataService));

                objSummaryData.RotaryROP = Math.Round(calcDrillingROP(objTimeLog, "0", fromDate, toDate, objDataService));
                objSummaryData.SlideROP = Math.Round(calcDrillingROP(objTimeLog, "1,19", fromDate, toDate, objDataService));

                objLogger.LogMessage("calculateStatastics  line 1098 RotaryTime & Slidetime=" + objSummaryData.RotaryTime.ToString() + " - "+ objSummaryData.SlideTime.ToString());
                objLogger.LogMessage("calculateStatastics  line 1099 RotaryFootage & SlideFootage" + objSummaryData.RotaryFootage.ToString() + " - " + objSummaryData.SlideFootage.ToString());
                objLogger.LogMessage("calculateStatastics  line 1100 RotaryROP & SlideROP" + objSummaryData.RotaryROP.ToString() + " - " + objSummaryData.SlideROP.ToString());

                objSummaryData.RotaryTimeOffset = 0;
                objSummaryData.SlideTimeOffset = 0;

                objSummaryData.RotaryFootageOffset = 0;
                objSummaryData.SlideFootageOffset = 0;

                objSummaryData.RotaryROPOffset = 0;
                objSummaryData.SlideROPOffset = 0;

                if (objOffsetTimeLog != null)
                {


                    //copied from vb  (as it is)
                    // 'offsetDepthIn = objOffsetTimeLog.getHoleDepthFromDateTime(objDataService, offsetFromDate.ToOADate)
                    // 'offsetDepthOUt = objOffsetTimeLog.getHoleDepthFromDateTime(objDataService, offsetToDate.ToOADate)

                    objSummaryData.RotaryTimeOffset = calcDrillingTimeByDepth(ref objDataService, objOffsetTimeLog, "0", offsetDepthIn, offsetDepthOut);
                    objSummaryData.SlideTimeOffset = calcDrillingTimeByDepth(ref objDataService, objOffsetTimeLog, "1,19", offsetDepthIn, offsetDepthOut);

                    objSummaryData.RotaryFootageOffset = Math.Round(calcDrillingFootageByDepth(objOffsetTimeLog, "0", offsetDepthIn, offsetDepthOut, objDataService));
                    objSummaryData.SlideFootageOffset = Math.Round(calcDrillingFootageByDepth(objOffsetTimeLog, "1,19", offsetDepthIn, offsetDepthOut, objDataService));

                    objSummaryData.RotaryROPOffset = Math.Round(calcDrillingROPByDepth(objOffsetTimeLog, "0", offsetDepthIn, offsetDepthOut, objDataService));
                    objSummaryData.SlideROPOffset = Math.Round(calcDrillingROPByDepth(objOffsetTimeLog, "1,19", offsetDepthIn, offsetDepthOut, objDataService));

                    objLogger.LogMessage("calculate Statastics Offset  line 1131 RotaryTimeOffset & SlideTimeOffset=" + objSummaryData.RotaryTimeOffset.ToString() + " - " + objSummaryData.SlideTimeOffset.ToString());
                    objLogger.LogMessage("calculate Statastics Offset line 1132 RotaryFootageOffset & SlideFootageOffset" + objSummaryData.RotaryFootageOffset.ToString() + " - " + objSummaryData.SlideFootageOffset.ToString());
                    objLogger.LogMessage("calculate Statastics Offset line 1133 RotaryROPOffset & SlideROPOffset" + objSummaryData.RotaryROPOffset.ToString() + " - " + objSummaryData.SlideROPOffset.ToString());

                }


                objSummaryData.RotaryTimePercent = Math.Round(calcDrillingTimePercentage("0", objDataService), 2);
                objSummaryData.SlideTimePercent = Math.Round(calcDrillingTimePercentage("1,19", objDataService), 2);

                objSummaryData.DrillingTimePercent = Math.Round(calcRigStateTimePercentage("0,1,19", objDataService), 2);
                objSummaryData.NonDrillingTimePercent = Math.Round(calcRigStateTimePercentage("2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,20,21,22,23,24,25,26", objDataService), 2);



                objSummaryData.OffsetRotaryTimePercent = Math.Round(calcDrillingTimePercentageOffset("0", objDataService), 2);
                objSummaryData.OffsetSlideTimePercent = Math.Round(calcDrillingTimePercentageOffset("1,19", objDataService), 2);

                objSummaryData.OffsetDrillingTimePercent = Math.Round(calcRigStateTimePercentageOffset("0,1,19", objDataService), 2);
                objSummaryData.OffsetNonDrillingTimePercent = Math.Round(calcRigStateTimePercentageOffset("2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,20,21,22,23,24,25,26", objDataService), 2);
            }

            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calculateStatastics  Exception throw on line 1155 " + ex.Message + " " + ex.StackTrace);
            }
        }

        private double calcDrillingTime(DataService objDataService, TimeLog paramTimeLog, string paramRigState, DateTime paramFromDate, DateTime paramToDate)
        {
            try
            {
                double sumDateTime = 0;
                string dataTableName = paramTimeLog.__dataTableName;
                string strSQL = "";

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + paramRigState.ToString() + ")";
                sumDateTime = utilFunctions.CValEx(objDataService.getValueFromDatabase(strSQL).ToString());

                return sumDateTime;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calcDrillingTime  Exception throw on line 1174 " + ex.Message + " " + ex.StackTrace);
                return 0;
            }
        }

        private double calcDrillingTimeByDepth(ref DataService objDataService, TimeLog paramTimeLog, string paramRigState, double paramFromDepth, double paramToDepth)
        {
            try
            {
                double sumDateTime = 0;
                string dataTableName = paramTimeLog.__dataTableName;
                string strSQL = "";

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE [HDTH]>=" + paramFromDepth.ToString() + " AND [HDTH]<=" + paramToDepth.ToString() + " AND RIG_STATE IN (" + paramRigState.ToString() + ")";
                sumDateTime = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                return sumDateTime;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calcDrillingTimeByDepth  Exception throw on line 1194 " + ex.Message + " " + ex.StackTrace);
                return 0;
            }
        }

        private double calcDrillingFootage(TimeLog paramTimeLog, string paramRigState, DateTime paramFromDate, DateTime paramToDate, DataService objDataService)
        {
            try
            {
                double sumDepth = 0;
                string dataTableName = paramTimeLog.__dataTableName;
                string strSQL = "";

                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + paramRigState.ToString() + ") AND NEXT_DEPTH>0 AND HDTH>=0";
                sumDepth = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                return sumDepth;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calcDrillingFootage  Exception throw on line 1224 " + ex.Message + " " + ex.StackTrace);
                return 0;
            }
        }

        private double calcDrillingROP(TimeLog paramTimeLog, string paramRigState, DateTime paramFromDate, DateTime paramToDate, DataService objDataService)
        {
            try
            {
                bool calculateROP = false; // 'Nishant 09/04/2018 Changed to True to False
                                           // 'New Code
                                           // ' if ROP Channel is present then take avg of that Channel
                string yMnemonic = "ROP";
                if (objTimeLog.logCurves.ContainsKey(yMnemonic))
                    calculateROP = false;
                else
                {
                    yMnemonic = objMnemonicMappingMgr.getMappedMnemonic(yMnemonic, objTimeLog.logCurves);
                    if (yMnemonic.Trim() == "")
                        calculateROP = true;
                }


                double sumDateTime = 0;
                double sumDepth = 0;
                string dataTableName = paramTimeLog.__dataTableName;
                string strSQL = "";
                double ROP = 0;

                calculateROP = true;

                if (calculateROP)
                {
                    strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + paramRigState.ToString() + ")";
                    sumDateTime = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                    strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + paramRigState.ToString() + ") AND NEXT_DEPTH>0 AND HDTH>=0";
                    sumDepth = Util.ValEx(objDataService.getValueFromDatabase(strSQL));


                    //  VuMaxLogger.logKPIMsg("Rig State " + paramRigState + " sumDateTime: " + sumDateTime.ToString() + " sum depth " + sumDepth.ToString());



                    if (sumDateTime > 0)
                        ROP = sumDepth / ((sumDateTime / 60) / 60); // ft/second 
                    else
                        ROP = 0;
                }
                else
                {

                    // 'Get ROP from Database

                    strSQL = "SELECT AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + paramFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + paramToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + paramRigState.ToString() + ")";
                    ROP = Util.ValEx(objDataService.getValueFromDatabase(strSQL));
                }


                return ROP;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calcDrillingROP  Exception throw on line 1277 " + ex.Message + " " + ex.StackTrace);
                return 0;
            }
        }

        private double calcDrillingFootageByDepth(TimeLog paramTimeLog, string paramRigState, double paramFromDepth, double paramToDepth, DataService objDataService)
        {
            try
            {
                double sumDepth = 0;
                string dataTableName = paramTimeLog.__dataTableName;
                string strSQL = "";

                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE [HDTH]>=" + paramFromDepth.ToString() + " AND [HDTH]<=" + paramToDepth.ToString() + " AND RIG_STATE IN (" + paramRigState.ToString() + ") AND NEXT_DEPTH>0 AND HDTH>=0";
                sumDepth = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                return sumDepth;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calcDrillingFootageByDepth  Exception throw on line 1297 " + ex.Message + " " + ex.StackTrace);
                return 0;
            }
        }


        private double calcDrillingROPByDepth(TimeLog paramTimeLog, string paramRigState, double paramFromDepth, double paramToDepth, DataService objDataService)
        {
            try
            {
                bool calculateROP = false; // 'Nishant 09/04/2018 Changed to True to False
                                           // 'New Code
                                           // ' if ROP Channel is present then take avg of that Channel
                string yMnemonic = "ROP";
                if (objTimeLog.logCurves.ContainsKey(yMnemonic))
                    calculateROP = false;
                else
                {
                    yMnemonic = objMnemonicMappingMgr.getMappedMnemonic(yMnemonic, objTimeLog.logCurves);
                    if (yMnemonic.Trim() == "")
                        calculateROP = true;
                }


                double sumDateTime = 0;
                double sumDepth = 0;
                string dataTableName = paramTimeLog.__dataTableName;
                string strSQL = "";
                double ROP = 0;

                calculateROP = true;

                if (calculateROP)
                {
                    strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE [HDTH]>=" + paramFromDepth.ToString() + " AND [HDTH]<=" + paramToDepth.ToString() + " AND RIG_STATE IN (" + paramRigState.ToString() + ")";
                    sumDateTime = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                    strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE [HDTH]>=" + paramFromDepth.ToString() + " AND [HDTH]<=" + paramToDepth.ToString() + " AND RIG_STATE IN (" + paramRigState.ToString() + ") AND NEXT_DEPTH>0 AND HDTH>=0";
                    sumDepth = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                    if (sumDateTime > 0)
                        ROP = sumDepth / ((sumDateTime / 60) / 60); // ft/second 
                    else
                        ROP = 0;
                }
                else
                {

                    // 'Get ROP from Database

                    strSQL = "SELECT AVG([" + yMnemonic + "]) AS [" + yMnemonic + "] FROM " + dataTableName + " WHERE [HDTH]>=" + paramFromDepth.ToString() + " AND [HDTH]<=" + paramToDepth.ToString() + " AND RIG_STATE IN (" + paramRigState.ToString() + ")";
                    ROP = Util.ValEx(objDataService.getValueFromDatabase(strSQL));
                }


                return ROP;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calcDrillingROPByDepth  Exception throw on line 1356 " + ex.Message + " " + ex.StackTrace);
                return 0;
            }
        }

        private double calcDrillingTimePercentage(string paramRigState, DataService objDataService)
        {
            try
            {
                string dataTableName = objTimeLog.__dataTableName;
                string strSQL = "";

                double totalDrillingTime = 0;
                double targetDrillingTime = 0;

                string rigStates = "0,1,19";

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + rigStates + ")";
                totalDrillingTime = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + paramRigState + ")";
                targetDrillingTime = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                double percentage = 0;

                percentage = Math.Round(targetDrillingTime * 100 / totalDrillingTime);
                objLogger.LogMessage("calcDrillingTimePercentage percentage totalDrillingTime=" + totalDrillingTime.ToString() + " targetDrillingTime="+ targetDrillingTime.ToString());

                if (utilFunctions.isNaN(percentage))
                    return 0;
                else
                    return percentage;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calcDrillingTimePercentage  Exception throw on line 1381 " + ex.Message + " " + ex.StackTrace);
                return 0;
            }
        }

        private double calcRigStateTimePercentage(string paramRigState, DataService objDataService)
        {
            try
            {
                string dataTableName = objTimeLog.__dataTableName;
                string strSQL = "";

                double totalDrillingTime = 0;
                double targetDrillingTime = 0;

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                totalDrillingTime = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (" + paramRigState + ")";
                targetDrillingTime = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                double percentage = 0;

                percentage = Math.Round(targetDrillingTime * 100 / totalDrillingTime);

                if (utilFunctions.isNaN(percentage))
                    return 0;
                else
                    return percentage;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calcRigStateTimePercentage  Exception throw on line 1414 " + ex.Message + " " + ex.StackTrace);
                return 0;
            }
        }


        private double calcDrillingTimePercentageOffset(string paramRigState, DataService objDataService)
        {
            try
            {
                string dataTableName = objOffsetTimeLog.__dataTableName;
                string strSQL = "";

                double totalDrillingTime = 0;
                double targetDrillingTime = 0;

                string rigStates = "0,1,19";

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " AND RIG_STATE IN (" + rigStates + ")";
                totalDrillingTime = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " AND RIG_STATE IN (" + paramRigState + ")";
                targetDrillingTime = Util.ValEx(objDataService.getValueFromDatabase(strSQL));

                double percentage = 0;

                percentage = Math.Round(targetDrillingTime * 100 / totalDrillingTime);

                if (utilFunctions.isNaN(percentage))
                    return 0;
                else
                    return percentage;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calcDrillingTimePercentageOffset  Exception throw on line 1449 " + ex.Message + " " + ex.StackTrace);
                return 0;
            }
        }

        private double calcRigStateTimePercentageOffset(string paramRigState, DataService objDataService)
        {
            try
            {
                DateTime offsetFromDate = objOffsetTimeLog.getDateTimeFromDepthBegining(ref objDataService, fromDepth);
                DateTime offsetToDate = objOffsetTimeLog.getDateTimeFromDepthEnding(ref objDataService, toDepth);


                string dataTableName = objOffsetTimeLog.__dataTableName;
                string strSQL = "";

                double totalDrillingTime = 0;
                double targetDrillingTime = 0;

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " ";
                totalDrillingTime = Convert.ToDouble(objDataService.getValueFromDatabase(strSQL));

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE [HDTH]>=" + offsetDepthIn.ToString() + " AND [HDTH]<=" + offsetDepthOut.ToString() + " AND RIG_STATE IN (" + paramRigState + ")";
                targetDrillingTime = Convert.ToDouble(objDataService.getValueFromDatabase(strSQL));

                double percentage = 0;

                percentage = Math.Round(targetDrillingTime * 100 / totalDrillingTime);

                if (utilFunctions.isNaN(percentage))
                    return 0;
                else
                    return percentage;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> calcRigStateTimePercentageOffset  Exception throw on line 1485 " + ex.Message + " " + ex.StackTrace);
                return 0;
            }
        }


        #endregion

        #region "Formation Tops"
        private Dictionary<int, DepthMatchingInfo> GetDepthMatchingList(Dictionary<string, FormationTop> paramOffsetTops, Dictionary<string, FormationTop> paramMainTops)
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
                objLogger.LogMessage("Error --> GetDepthMatchingList  Exception throw on line 1546 " + ex.Message + " " + ex.StackTrace);
                return new Dictionary<int, DepthMatchingInfo>();
            }
        }

        private void matchDepth(ref double[] paramYData, Dictionary<int, DepthMatchingInfo> depthMatchingList)
        {
            try
            {

                // '//Stretch/Shrink the data ...
                DepthMatchingInfo[] arrItems = depthMatchingList.Values.ToArray();

                Array.Sort(arrItems);


                Dictionary<int, DepthMatchingMark> depthMatchMarks = new Dictionary<int, DepthMatchingMark>();

                // '//Populate the list of depth matching marks by looking into depths

                for (int i = 0; i <= arrItems.Length - 1; i++)
                {
                    DepthMatchingInfo objItem = arrItems[i];


                    // '//#### Find the matching depth and record sections ###############################
                    for (int j = 0; j <= paramYData.Length - 1; j++)
                    {
                        if (paramYData[j] >= objItem.OffsetDepth)
                        {
                            // 'Depth Found ...

                            // 'Create a new Entry
                            DepthMatchingMark objMark = new DepthMatchingMark();
                            objMark.ArrayIndex = j;
                            objMark.NewDepth = objItem.MainWellDepth;

                            // '//Before adding the new depth ... check if depth is increasing only ...
                            bool isIncreasingDepth = true;

                            foreach (DepthMatchingMark objMarkItem in depthMatchMarks.Values)
                            {
                                if (objItem.MainWellDepth > objMarkItem.NewDepth)
                                {
                                }
                                else
                                {
                                    isIncreasingDepth = false;
                                    break;
                                }
                            }

                            if (isIncreasingDepth)
                                depthMatchMarks.Add(depthMatchMarks.Count + 1, objMark);
                        }
                    }
                }


                // '//We have populated the marks ... update the depth in target array
                DepthMatchingMark[] arrMarks = depthMatchMarks.Values.ToArray();

                Array.Sort(arrMarks);


                for (int i = 0; i <= arrMarks.Length - 1; i++)

                    paramYData[arrMarks[i].ArrayIndex] = arrMarks[i].NewDepth;


                // '//Now Interpolate the data between marks
                for (int i = 0; i <= arrMarks.Length - 1; i++)
                {
                    int inStartIndex = 0;
                    int inEndIndex = 0;

                    if (i == 0)
                    {
                        inStartIndex = 0;
                        inEndIndex = arrMarks[i].ArrayIndex;

                        // '//Check the depth at beginning
                        if (paramYData[inStartIndex] > paramYData[inStartIndex])
                            // '//We need to replace the depth at beginning
                            paramYData[0] = 0;
                    }

                    if (i == arrMarks.Length - 1)
                    {
                        inStartIndex = arrMarks[i - 1].ArrayIndex;
                        inEndIndex = paramYData.Length - 1;
                    }

                    if (i > 0 & i < arrMarks.Length - 1)
                    {
                        inStartIndex = arrMarks[i - 1].ArrayIndex;
                        inEndIndex = arrMarks[i].ArrayIndex;
                    }

                    // 'Now Interpolate it ...
                    interpolateLinear(ref paramYData, inStartIndex, inEndIndex);
                }

                bool halt = true;
            }

            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> matchDepth  Exception throw on line 1654 " + ex.Message + " " + ex.StackTrace);
            }
        }

        private void interpolateLinear(ref double[] paramData, int paramFromIndex, int paramToIndex)
        {
            try
            {
                double startValue = paramData[paramFromIndex];
                double endValue = paramData[paramToIndex];

                int Count = paramToIndex - paramFromIndex;

                double CoEfficient = (endValue - startValue) / Count;

                double interpolatedValue = 0;

                for (int i = paramFromIndex + 1; i <= paramToIndex - 1; i++)
                {
                    interpolatedValue = paramData[i - 1] + CoEfficient;

                    if (interpolatedValue > endValue)
                        paramData[i] = endValue;
                    else
                        paramData[i] = Math.Round(interpolatedValue, 2);
                }
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error --> interpolateLinear  Exception throw on line 1683 " + ex.Message + " " + ex.StackTrace);
            }
        }


        #endregion


    }




    #region "Other Classes"

    public class DepthMatchingMark : IComparable
    {
        public double NewDepth = 0;
        public int ArrayIndex = 0;

        public int CompareTo(object obj)
        {
            try
            {
                DepthMatchingMark objItem = (DepthMatchingMark)obj;

                if (this.ArrayIndex < objItem.ArrayIndex)
                    return -1;

                if (this.ArrayIndex == objItem.ArrayIndex)
                    return 0;

                if (this.ArrayIndex > objItem.ArrayIndex)
                    return 1;

                return -1;
            }

            catch (Exception ex)
            {
                return -1;
            }
        }
    }

    public class DepthMatchingInfo : IComparable
    {
        public string FormationTop = "";
        public double MainWellDepth = 0;
        public double OffsetDepth = 0;

        public int CompareTo(object obj)
        {
            try
            {
                DepthMatchingInfo objItem = (DepthMatchingInfo)obj;

                if (this.MainWellDepth < objItem.MainWellDepth)
                    return -1;

                if (this.MainWellDepth == objItem.MainWellDepth)
                    return 0;

                if (this.MainWellDepth > objItem.MainWellDepth)
                    return 1;

                return -1;
            }
            catch (Exception ex)
            {
                return -1;
            }
        }
    }


    public class ChartOutputItem
    {
        public enum OutputFunction
        {
            Sum = 0,
            SumDateTime = 1,
            SumDepth = 2,
            Count = 3,
            Avg = 4,
            Max = 5,
            Min = 6,
            StartValue = 7,
            EndValue = 8,
            RigStateTime = 9,
            RigStateDistance = 10,
            RigStateFunction = 11,
            RigStateROP = 12,
            RigStatePercentage = 13
        }
        public enum itemType
        {
            Normal = 0,
            Other = 1
        }
        public enum ChartOutputItemLevel
        {
            ChannelLevel = 0,
            ObjectLevel = 1
        }

        public enum SourceColumn
        {
            XValues = 0,
            YValues = 1
        }

        public string ItemName = "";
        public string ItemID;
        public itemType ItemType = itemType.Normal;
        public OutputFunction sFunction = OutputFunction.Sum;
        public string statExpression = "";
        public string EvaluateCondition = "";
        public ChartOutputItemLevel CalculationLevel = ChartOutputItemLevel.ChannelLevel;
        public SourceColumn DataSourceColumn = SourceColumn.XValues;

        public string StartDate;
        public string EndDate;
        public double Value;
        public double ItemColor;








    }//class chartoutputitem

    public class StatisticsItem
    {
        public enum StatFunction
        {
            Sum = 0,
            SumDateTime = 1,
            SumDepth = 2,
            Count = 3,
            Avg = 4,
            Max = 5,
            Min = 6,
            RigStateTime = 9,
            RigStateDistance = 10,
            RigStateFunction = 11,
            RigStateROP = 12,
            RigStatePercentage = 13,
            RigStateDistancePercent = 14
        }

        public enum StatItemType
        {
            Normal = 0,
            RigStateSummary = 1,
            RigStateFunction = 2,
            RigStatePercentage = 3
        }

        public string ItemName = "";
        public string ItemID = "";
        public StatItemType ItemType = StatItemType.Normal;
        public StatFunction sFunction = StatFunction.Sum;
        public string statExpression = "";
        public string EvaluateCondition = "";
        public string StartDate = "";
        public string EndDate = "";
        public double Value = 0;
        public double ItemColor = 0;

        public void copyFromChartOutputItem(ChartOutputItem objItem)
        {
            try
            {
                this.ItemID = objItem.ItemID;
                this.ItemName = objItem.ItemName;
                this.sFunction = (StatFunction)objItem.sFunction;
                this.statExpression = objItem.statExpression;
                this.EvaluateCondition = objItem.EvaluateCondition;
                this.StartDate = objItem.StartDate;
                this.EndDate = objItem.EndDate;
                this.Value = objItem.Value;
                this.ItemType = (StatItemType)objItem.ItemType;
            }
            catch (Exception ex)
            {
                // VuMaxLogger.logMessage(ex);
            }
        }

        public StatisticsItem GetCopy()
        {
            try
            {
                StatisticsItem objNew = new StatisticsItem();
                objNew.ItemName = this.ItemName;
                objNew.ItemID = this.ItemID;
                objNew.sFunction = this.sFunction;
                objNew.statExpression = this.statExpression;
                objNew.EvaluateCondition = this.EvaluateCondition;
                objNew.StartDate = this.StartDate;
                objNew.EndDate = this.EndDate;
                objNew.Value = this.Value;
                objNew.ItemColor = this.ItemColor;
                objNew.ItemType = this.ItemType;


                return objNew;
            }
            catch (Exception ex)
            {
                return new StatisticsItem();
            }
        }


        public StatisticsItem toDRItem()
        {
            try
            {
                StatisticsItem objNew = new StatisticsItem();
                objNew.ItemName = this.ItemName;
                objNew.ItemID = this.ItemID;
                objNew.sFunction = (StatFunction)this.sFunction;
                objNew.statExpression = this.statExpression;
                objNew.EvaluateCondition = this.EvaluateCondition;
                objNew.StartDate = this.StartDate;
                objNew.EndDate = this.EndDate;
                objNew.Value = this.Value;
                objNew.ItemColor = this.ItemColor;
                objNew.ItemType = this.ItemType;


                return objNew;
            }
            catch (Exception ex)
            {
                return new StatisticsItem();
            }
        }

        public VuMaxDR.Data.Objects.StatisticsItem toDRItemVuMax()
        {
            try
            {
                VuMaxDR.Data.Objects.StatisticsItem objNew = new VuMaxDR.Data.Objects.StatisticsItem();
                objNew.ItemName = this.ItemName;
                objNew.ItemID = this.ItemID;
                objNew.sFunction = (VuMaxDR.Data.Objects.StatisticsItem.StatFunction)this.sFunction;
                objNew.statExpression = this.statExpression;
                objNew.EvaluateCondition = this.EvaluateCondition;
                objNew.StartDate = this.StartDate;
                objNew.EndDate = this.EndDate;
                objNew.Value = this.Value;
                objNew.ItemColor = this.ItemColor;
                objNew.ItemType = (VuMaxDR.Data.Objects.StatisticsItem.StatItemType)this.ItemType;


                return objNew;
            }
            catch (Exception ex)
            {
                return new VuMaxDR.Data.Objects.StatisticsItem();
            }
        }

    }

    #endregion



}//namespce
