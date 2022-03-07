using eVuMax.DataBroker.Common;
using eVuMax.DataBroker.GenericDrillingSummary;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

using VuMaxDR.Data;
using VuMaxDR.Data.Objects;
using Microsoft.VisualBasic;

namespace eVuMax.DataBroker.Summary.DrlgStand
{
    
    public class DrlgStandPlot
    {
        [NonSerialized]
        eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

        [NonSerialized]
        public TimeLog objTimeLog = new TimeLog();

        public string ChartTitle = "";
        
        private ConFontSetup objFontSetup = new ConFontSetup();
        public Dictionary<int, double> _exclusionList = new Dictionary<int, double>();
        public DataSelection objDataSelection = new DataSelection();
        public const string MyPlotID = "STANDREPORT";
        //private Global.System.Windows.Forms.Label objTooltip = new System.Windows.Forms.Label();
        public string DepthUnit = "";


        // 'Nishant
        public double AvgTime = 0;
        public double DAvgTime = 0;
        public double NAvgTime = 0;

        public double TotalTime = 0;
        public double DTotalTime = 0;
        public double NTotalTime = 0;


        public double AvgROP = 0; // '' Global
        public double AvgRotaryROP = 0; // 'Global
        public double AvgSlideROP = 0; // 'Global
        public double DAvgROP = 0;
        public double DAvgRotaryROP = 0;
        public double DAvgSlideROP = 0;
        public double NAvgROP = 0;
        public double NAvgRotaryROP = 0;
        public double NAvgSlideROP = 0;
        public double offsetAvgTime = 0;
        public double OffsetAvgROP = 0; // '' Global
        public double OffsetAvgRotaryROP = 0; // 'Global
        public double OffsetAvgSlideROP = 0; // 'Global
        public double offsetDAvgTime = 0;
        public double OffsetDAvgROP = 0;
        public double OffsetDAvgRotaryROP = 0;
        public double OffsetDAvgSlideROP = 0;
        public double offsetNAvgTime = 0;
        public double OffsetNAvgROP = 0;
        public double OffsetNAvgRotaryROP = 0;
        public double OffsetNAvgSlideROP = 0;
        public bool DoNotTakeAction = false;
        public bool ShowOffsetWell = false;
        public double OffsetDepthCompWindow = 0;

        #region Processing Flags
        public DateTime fromDate;
        public DateTime toDate;
        public double fromDepth;
        public double toDepth;
        
        
        public StandLogProcessor objStandProcessor = new StandLogProcessor();
        #endregion


        public VuMaxDR.Data.Objects.rigState objRigSate = new VuMaxDR.Data.Objects.rigState();
        //Nishant
        [NonSerialized]
        public Broker.BrokerRequest objRequest = new Broker.BrokerRequest();
        public string WellID = "";
        public string WellName = "";
        public string offsetWellName = "";
        public string warnings = "";

        DateTime dtDayTimeFrom = new DateTime();

        DateTime dtDayTimeTo = new DateTime();
        bool HighlightDayNight = false;

        
        public DrlgStandUserSettings objUserSettings = new DrlgStandUserSettings();

        VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
        //Nishant 17-02-2022
        public DataTable grdConnection = new DataTable();
        public DrlgStandPlot()
        {
            try
            {
                grdConnection.Columns.Clear();
                grdConnection.Columns.Add("Key");
                grdConnection.Columns.Add("Depth");
                grdConnection.Columns.Add("FromDate");
                grdConnection.Columns.Add("ToDate");
                grdConnection.Columns.Add("DayNightStatus");
                grdConnection.Columns.Add("ROP");
                grdConnection.Columns.Add("RotaryROP");
                grdConnection.Columns.Add("SlideROP");
                //grdConnection.Columns.Add("OffsetDayNightStatus");
                //grdConnection.Columns.Add("OffsetROP");
                //grdConnection.Columns.Add("OffsetRotaryROP");
                //grdConnection.Columns.Add("OffsetSlideROP");
                //grdConnection.Columns.Add("OffsetTime");
                grdConnection.Columns.Add("Comments");
                grdConnection.Columns.Add("TimeHH");
                //grdConnection.Columns.Add("OffsetTimeHH"); //Not in use in Vumax
                


            }
            catch (Exception ex)
            {
                objLogger.LogMessage("DrlgStandPlot =" + ex.Message + ex.StackTrace);

            }
        }

        private void refreshConnectionTable()
        {
            try
            {

                grdConnection.Rows.Clear();
                if (objStandProcessor.connectionPoints.Count > 0)
                {
                    //grdConnection.Rows.Add(objStandProcessor.connectionPoints.Count);
                    StandPoint[] arrItems = objStandProcessor.connectionPoints.Values.ToArray();
                    Array.Sort(arrItems);
                    int rowIndex = 0;
                    for (int i = 0; i <= arrItems.Length - 1; i++)
                    {
                        DataRow row = grdConnection.NewRow();
                        grdConnection.Rows.Add(row);
                        StandPoint objItem = arrItems[i];
                        string comment = ConnectionLabel.getStandComment(WellID,ref objRequest.objDataService, objItem.Depth);
                        grdConnection.Rows[rowIndex]["Depth"] = Math.Round(objItem.Depth, 2);
                        grdConnection.Rows[rowIndex]["Key"]= objItem.FromDate.ToString("dd-MMM-yyyy HH:mm:ss");
                        grdConnection.Rows[rowIndex]["Comments"] = comment;
                        grdConnection.Rows[rowIndex]["FromDate"] = objItem.FromDate.ToString("dd-MMM-yyyy HH:mm:ss");
                        grdConnection.Rows[rowIndex]["ToDate"] = objItem.ToDate.ToString("dd-MMM-yyyy HH:mm:ss");
                        if (objItem.DayNightStatus == (StandPoint.cnDayNightTime) ConnectionLogPoint.cnDayNightTime.DayTime)
                        {
                            grdConnection.Rows[rowIndex]["DayNightStatus"] = "Day";
                        }
                        else
                        {
                            grdConnection.Rows[rowIndex]["DayNightStatus"] = "Night";
                        }

                       // long timeDiff = objItem.FromDate - objItem.ToDate; //DateDiff(DateInterval.Second, objItem.FromDate, objItem.ToDate);
                        TimeSpan objTimeSpan = objItem.FromDate - objItem.ToDate;
                        
                        
                        grdConnection.Rows[rowIndex]["TimeHH"] = "[" + objTimeSpan.Hours.ToString() + ":" + objTimeSpan.Minutes.ToString() + ":" + objTimeSpan.Seconds.ToString() + "]";
                        grdConnection.Rows[rowIndex]["ROP"] = Math.Round(objItem.ROP, 2);
                        grdConnection.Rows[rowIndex]["RotaryROP"] = Math.Round(objItem.RotaryROP, 2);
                        grdConnection.Rows[rowIndex]["SlideROP"] = Math.Round(objItem.SlideROP, 2);
                        rowIndex += 1;
                    }
                }

            }
            catch (Exception ex)
            {
                objLogger.LogMessage("DrlgStandPlot =" + ex.Message + ex.StackTrace);

            }
        }

        public void populateExclList()
        {
            try
            {
                _exclusionList.Clear();
                DataTable objData = objRequest.objDataService.getTable("SELECT * FROM VMX_STAND_INFO WHERE WELL_ID='" + WellID + "'");
                foreach (DataRow objRow in objData.Rows)
                {
                    double lnDepth =Convert.ToDouble( DataService.checkNull(objRow["DEPTH"], 0));
                    _exclusionList.Add(_exclusionList.Count + 1, lnDepth);
                }
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("DrlgStandPlot =" + ex.Message + ex.StackTrace);
            }
        }

        //private void saveCustomization()
        //{
        //    try
        //    {
        //        string strSQL = "";
        //        if (!objRequest.objDataService.IsRecordExist("SELECT WELL_ID FROM VMX_CONN_PLOT_CUSTOMIZATION WHERE WELL_ID='" + WellID + "'"))
        //        {
        //            strSQL = "INSERT INTO VMX_CONN_PLOT_CUSTOMIZATION (WELL_ID) VALUES('" + WellID + "')";
        //            objRequest.objDataService.executeNonQuery(strSQL);
        //        }

        //        strSQL = "UPDATE VMX_CONN_PLOT_CUSTOMIZATION SET ";
        //        strSQL += " FROM_TIME='" + dtDayTimeFrom.Value.ToString("dd-MMM-yyyy HH:mm:ss") + "', ";
        //        strSQL += " TO_TIME='" + dtDayTimeTo.Value.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //        strSQL += " HIGHLIGHT_DN=" + Global.Iif(ShowHighlightDayNight == 1, true, false).ToString() + " ";
        //        strSQL += " WHERE WELL_ID='" + WellID + "'";
        //        objRequest.objDataService.executeNonQuery(strSQL);
        //    }
        //    catch (Exception ex)
        //    {
        //    }
        //}

        private void loadCustomization()
        {
            try
            {
                DataTable objData = objRequest.objDataService.getTable("SELECT * FROM VMX_CONN_PLOT_CUSTOMIZATION WHERE WELL_ID='" + WellID + "'");
                if (objData.Rows.Count > 0)
                {
                    dtDayTimeFrom=Convert.ToDateTime( objData.Rows[0]["FROM_TIME"]);
                    dtDayTimeTo= Convert.ToDateTime( objData.Rows[0]["TO_TIME"]);
                    HighlightDayNight = Convert.ToBoolean(Global.Iif(Convert.ToInt32(objData.Rows[0]["HIGHLIGHT_DN"]) == 1, true, false));
                    
                }
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("DrlgStandPlot =" + ex.Message + ex.StackTrace);
            }
        }

        public Broker.BrokerResponse generateReportData(ref Broker.BrokerRequest paramRequest, string paramWellID)
        {
            try
            {


                

                warnings += "inside generatereportdata";
                this.WellID = paramWellID;
                this.objRequest = paramRequest;
                this.objDataSelection.objRequest = paramRequest;
                objRigSate = rigState.loadWellRigStateSetup(ref objRequest.objDataService, WellID);


                objStandProcessor = new StandLogProcessor(ref paramRequest, paramWellID);

                //if (objUserSettings.dtDayTimeFrom == objUserSettings.dtDayTimeTo) //assuming that User has Not set the DayTime from To Value
                //{
                //    loadCustomization();

                //}
                //else
                //{
                //    dtDayTimeFrom = Convert.ToDateTime(objUserSettings.dtDayTimeFrom);
                //    dtDayTimeTo = Convert.ToDateTime(objUserSettings.dtDayTimeTo);
                //    HighlightDayNight = objUserSettings.HighlightDayNight;
                //}

                dtDayTimeFrom = Convert.ToDateTime(objUserSettings.dtDayTimeFrom.ToLocalTime());
                dtDayTimeTo = Convert.ToDateTime(objUserSettings.dtDayTimeTo.ToLocalTime());
                HighlightDayNight = objUserSettings.HighlightDayNight;



                objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref objRequest.objDataService, paramWellID);
                WellName = objWell.name;

                //Get the primary time log 
                objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref objRequest.objDataService, WellID);

               
                populateExclList();

                if (objTimeLog != null)
                {
                    try
                    {
                        DepthUnit = objTimeLog.logCurves["DEPTH"].VuMaxUnitID;
                    }
                    catch (Exception ex)
                    {

                        objLogger.LogMessage("DrlgStandPlot =" + ex.Message + ex.StackTrace);
                    }
                    
                }

                //loadCustomization(); //// this is replaced by UserSettings 



                Broker.BrokerResponse objResponse = objRequest.createResponseObject();
                string paramPlotName = "Drilling Stand Plot";
                
                objDataSelection.WellID = WellID;
                objDataSelection.objWell = objWell;
                //objDataSelection.loadDataSelection(MyPlotID);
                objDataSelection.getRange3(ref fromDate, ref toDate, ref fromDepth, ref toDepth, ref ChartTitle, ref paramPlotName, WellID, ref objRequest.objDataService);
                

                DataTable objConnList = objRequest.objDataService.getTable("SELECT WELL_ID FROM VMX_AKPI_DRLG_CONNECTIONS WHERE WELL_ID='" + WellID + "'");
                        if (objConnList.Rows.Count > 0)
                        {
                    ConnectionLogProcessor objProcessor = new ConnectionLogProcessor(ref objRequest, WellID);


                    objProcessor.ProcessPoints(ref objTimeLog, fromDate, toDate);
               

                    warnings += objProcessor.LastError;
                            foreach (ConnectionLogPoint objItem in objProcessor.connectionPoints.Values)
                            {
                                KPIDrilingConnections objConnection = KPIDrilingConnections.createKPIDrlgConnection(ref objRequest.objDataService, WellID, objItem);
                                if (objConnection is object)
                                {
                            objConnection.UserComment = ConnectionLabel.getComment(WellID,ref objRequest.objDataService, objItem.Depth);
                            
                            KPIDrilingConnections.addToDatabase(ref objRequest.objDataService, objConnection);
                                }
                            }
                        }

                
                        objStandProcessor.DayTimeHoursFrom = dtDayTimeFrom;
                        objStandProcessor.DayTimeHoursTo = dtDayTimeTo;
                        objStandProcessor.ShowOffsetWells = objDataSelection.StandPlot_ShowOffset;
                objStandProcessor.ShowOffsetWells = objDataSelection.StandPlot_ShowOffset;


                objStandProcessor.DepthComparisonWindow = objDataSelection.StandPlot_ComparisonWindow;
            
                objStandProcessor.ProcessPoints(ref objTimeLog, fromDate, toDate);
                        AvgROP = 0;
                        AvgRotaryROP = 0;
                        AvgSlideROP = 0;
                        DAvgROP = 0;
                        DAvgRotaryROP = 0;
                        DAvgSlideROP = 0;
                        NAvgROP = 0;
                        NAvgRotaryROP = 0;
                        NAvgSlideROP = 0;

                        /// Nishant
                        /// New Calculation
                        string strSQL = "";
                        double TotalFootage = 0d;
                        double TotalTimePeriod = 0d;
                        string dataTableName = objTimeLog.__dataTableName;

                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                //TotalFootage = Convert.ToInt32(DataService.checkNumericNull(objRequest.objDataService.getValueFromDatabase(strSQL)));
                TotalFootage = CommonUtil.convertToDouble(DataService.checkNumericNull(objRequest.objDataService.getValueFromDatabase(strSQL)));
                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                        TotalTimePeriod = Convert.ToInt32(DataService.checkNumericNull(objRequest.objDataService.getValueFromDatabase(strSQL)));

                /// Recalculate AvgROP
                if (TotalFootage > 0 & TotalTimePeriod > 0)
                        {
                            AvgROP = Math.Round(TotalFootage / (TotalTimePeriod / 60 / 60), 2); // ft/hours
                        }
                        else
                        {
                            AvgROP = 0;
                        }


                        // 'get RotaryROP
                        double RotaryFootage = 0d;
                        double RotaryTimePeriod = 0d;
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                //RotaryFootage = Convert.ToInt32(DataService.checkNumericNull(objRequest.objDataService.getValueFromDatabase(strSQL)));
                RotaryFootage = CommonUtil.convertToDouble(DataService.checkNumericNull(objRequest.objDataService.getValueFromDatabase(strSQL)));
              

                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                        RotaryTimePeriod = Convert.ToInt32(DataService.checkNumericNull(objRequest.objDataService.getValueFromDatabase(strSQL)));

                        /// Recalculate RotaryROP
                        if (RotaryTimePeriod > 0d & RotaryFootage > 0d)
                        {
                            AvgRotaryROP = Math.Round(RotaryFootage / (RotaryTimePeriod / 60d / 60d), 2); // ft/hours
                        }
                        else
                        {
                            AvgRotaryROP = 0;
                        }

                        // 'get SlideROP
                        double SlideFootage = 0d;
                        double SlideTimePeriod = 0d;
                        strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                        SlideFootage = Convert.ToInt32(DataService.checkNumericNull(objRequest.objDataService.getValueFromDatabase(strSQL)));
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                        SlideTimePeriod = Convert.ToInt32(DataService.checkNumericNull(objRequest.objDataService.getValueFromDatabase(strSQL)));
                        /// Recalculate SlideROP
                        if (SlideTimePeriod > 0 & SlideFootage > 0)
                        {
                            AvgSlideROP = Math.Round(SlideFootage / (SlideTimePeriod / 60 / 60), 2); // ft/hours
                        }
                        else
                        {
                            AvgSlideROP = 0;
                        }

                        // '*****************************************************************

                        double DFootage = 0;
                double DTimePeriod = 0;
                        double DRotaryFootage = 0;
                double DRotaryTimePeriod = 0;
                        double DSlideFootage = 0;
                        double DSlideTimePeriod = 0;
                        double NFootage = 0;
                        double NTimePeriod = 0;
                        double NRotaryFootage = 0;
                        double NRotaryTimePeriod = 0;
                        double NSlideFootage = 0;
                        double NSlideTimePeriod = 0;
                        strSQL = "SELECT DATETIME,HDTH,NEXT_DEPTH,TIME_DURATION,RIG_STATE FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                        DataTable objROPData = objRequest.objDataService.getTable(strSQL);
                        DateTime dtDateTime;
                        double lnHDTH = 0d;
                        double lnNextDepth = 0d;
                        double lnTimeDuration = 0d;
                        int lnRigState = 0;
                        string DayNightStatus = "D";
                        DateTime DayTimeDateFrom = Convert.ToDateTime( DateTime.Now.ToString("dd-MMM-yyyy") + " " + dtDayTimeFrom.ToString("HH:mm") + ":00");
                        DateTime DayTimeDateTo = Convert.ToDateTime( DateTime.Now.ToString("dd-MMM-yyyy") + " " + dtDayTimeTo.ToString("HH:mm") + ":00");
                        foreach (DataRow objRow in objROPData.Rows)
                        {
                            dtDateTime = Convert.ToDateTime( DataService.checkNull(objRow["DATETIME"], new DateTime()));

                            // '//Convert this date to local time zone
                            dtDateTime = Util.convertUTCToWellTimeZone(dtDateTime, objWell);
                            DateTime standDate = Convert.ToDateTime(DateTime.Now.ToString("dd-MMM-yyyy") + " " + dtDateTime.ToString("HH:mm") + ":00");
                            if (standDate >= DayTimeDateFrom & standDate <= DayTimeDateTo)
                            {
                                DayNightStatus = "D";
                            }
                            else
                            {
                                DayNightStatus = "N";
                            }

                            lnHDTH = Convert.ToDouble( DataService.checkNull(objRow["HDTH"], 0));
                            lnNextDepth = Convert.ToDouble( DataService.checkNull(objRow["NEXT_DEPTH"], 0));
                            lnTimeDuration =Convert.ToDouble( DataService.checkNull(objRow["TIME_DURATION"], 0));
                            lnRigState =Convert.ToInt32( DataService.checkNull(objRow["RIG_STATE"], 0));
                            if (DayNightStatus == "D")
                            {
                                DFootage = DFootage + (lnHDTH - lnNextDepth);
                                DTimePeriod = DTimePeriod + lnTimeDuration;
                                if (lnRigState == 0)
                                {
                                    DRotaryFootage = DRotaryFootage + (lnHDTH - lnNextDepth);
                            DRotaryTimePeriod = DRotaryTimePeriod + lnTimeDuration;
                                }

                                if (lnRigState == 1 | lnRigState == 19)
                                {
                                    DSlideFootage = DSlideFootage + (lnHDTH - lnNextDepth);
                                    DSlideTimePeriod = DSlideTimePeriod + lnTimeDuration;
                                }
                            }
                            else
                            {
                                NFootage = NFootage + (lnHDTH - lnNextDepth);
                                NTimePeriod = NTimePeriod + lnTimeDuration;
                                if (lnRigState == 0)
                                {
                                    NRotaryFootage = NRotaryFootage + (lnHDTH - lnNextDepth);
                                    NRotaryTimePeriod = NRotaryTimePeriod + lnTimeDuration;
                                }

                                if (lnRigState == 1 | lnRigState == 19)
                                {
                                    NSlideFootage = NSlideFootage + (lnHDTH - lnNextDepth);
                                    NSlideTimePeriod = NSlideTimePeriod + lnTimeDuration;
                                }
                            }
                        }

                        DAvgROP = 0;
                        DAvgRotaryROP = 0;
                        DAvgSlideROP = 0;
                        NAvgROP = 0;
                        NAvgRotaryROP = 0;
                        NAvgSlideROP = 0;

                        /// Recalculate AvgROP
                        if (DTimePeriod > 0d & DFootage > 0d)
                        {
                            DAvgROP = Math.Round(DFootage / (DTimePeriod / 60 / 60), 2); // ft/hours
                        }
                        else
                        {
                            DAvgROP = 0;
                        }

                /// Recalculate RotaryROP
                
                        if (DRotaryTimePeriod> 0 && DRotaryTimePeriod> 0)
                        {
                             DAvgRotaryROP = Math.Round(DRotaryFootage / ((DRotaryTimePeriod / 60) / 60), 2); //ft/hours
                        }
                        else
                        {
                            DAvgRotaryROP = 0;
                        }

                        /// Recalculate SlideROP
                        if (DSlideFootage > 0d & DSlideTimePeriod > 0d)
                        {
                            DAvgSlideROP = Math.Round(DSlideFootage / (DSlideTimePeriod / 60d / 60d), 2); // ft/hours
                        }
                        else
                        {
                            DAvgSlideROP = 0;
                        }

                        if (NFootage > 0d & NTimePeriod > 0d)
                        {
                            NAvgROP = Math.Round(NFootage / (NTimePeriod / 60 / 60), 2);
                        }

                        if (NRotaryFootage > 0 & NRotaryTimePeriod > 0)
                        {
                            NAvgRotaryROP = Math.Round(NRotaryFootage / (NRotaryTimePeriod / 60 / 60), 2);
                        }

                        if (NSlideFootage > 0 & NSlideTimePeriod > 0)
                        {
                            NAvgSlideROP = Math.Round(NSlideFootage / (NSlideTimePeriod / 60 / 60), 2);
                        }

                       calculateStatsforOffset();



                //// Refresh Chart
                /// Here Summary Table is prepared

                {
                    // '=== Summary =================================================''

                    //double TotalTime = 0d;
                    //double DTotalTime = 0d;
                    //double NTotalTime = 0d;
                    int DSampleCount = 0;
                    int NSampleCount = 0;
                    int SampleCount = objStandProcessor.connectionPoints.Count;

                  
                    foreach (StandPoint objPoint in objStandProcessor.connectionPoints.Values)
                    {
                        
                            TotalTime = TotalTime + Math.Abs(DateAndTime.DateDiff(DateInterval.Second, objPoint.FromDate, objPoint.ToDate));
                        //(EndDate.Date - StartDate.Date).Days
                        
                        
                        if (objPoint.DayNightStatus == StandPoint.cnDayNightTime.DayTime)
                        {
                            DTotalTime = DTotalTime + Math.Abs(DateAndTime.DateDiff(DateInterval.Second, objPoint.FromDate, objPoint.ToDate));
                            DSampleCount = DSampleCount + 1;
                        }
                        else
                        {
                            NTotalTime = NTotalTime + Math.Abs(DateAndTime.DateDiff(DateInterval.Second, objPoint.FromDate, objPoint.ToDate));
                            NSampleCount = NSampleCount + 1;
                        }
                    }

                    //double AvgTime = 0d;
                    //double DAvgTime = 0d;
                    //double NAvgTime = 0d;

                    

                    if (SampleCount > 0 & TotalTime > 0d)
                    {
                        TotalTime = TotalTime / 60d / 60d;
                        AvgTime = Math.Round(TotalTime / SampleCount, 2);
                    }

                    if (DSampleCount > 0 & DTotalTime > 0d)
                    {
                        DTotalTime = DTotalTime / 60d / 60d;
                        DAvgTime = Math.Round(DTotalTime / DSampleCount, 2);
                    }

                    if (NSampleCount > 0 & NTotalTime > 0d)
                    {
                        NTotalTime = NTotalTime / 60d / 60d;
                        NAvgTime = Math.Round(NTotalTime / NSampleCount, 2);
                    }

                    //txtAvgTime.Text = AvgTime;
                    //txtAvgROP.Text = AvgROP;
                    //txtAvgRotaryROP.Text = AvgRotaryROP;
                    //txtAvgSlideROP.Text = AvgSlideROP;
                    //txtDAvgTime.Text = DAvgTime;
                    //txtDAvgROP.Text = DAvgROP;
                    //txtDAvgRotaryROP.Text = DAvgRotaryROP;
                    //txtDAvgSlideROP.Text = DAvgSlideROP;
                    //txtNAvgTime.Text = NAvgTime;
                    //txtNAvgROP.Text = NAvgROP;
                    //txtNAvgRotaryROP.Text = NAvgRotaryROP;
                    //txtNAvgSlideROP.Text = NAvgSlideROP;
                    // '=============================================================''


                    offsetAvgTime = 0;
                    offsetDAvgTime = 0;
                    offsetNAvgTime = 0;
                    SampleCount = 0;


                    #region "Offset well summary"

                    //if (objDataSelection.StandPlot_ShowOffset)
                    //{
                    //    TableLayoutPanel1.RowStyles(7).Height = 100;
                    //}
                    //else
                    //{
                    //    TableLayoutPanel1.RowStyles(7).Height = 0;
                    //}

                    if (objDataSelection.StandPlot_ShowOffset)
                    {
                        double sumTime = 0d;
                        foreach (StandPoint objPoint in objStandProcessor.connectionPoints.Values)
                        {
                            if (objPoint.OffsetTime >= 0)
                            {
                                SampleCount = SampleCount + 1;
                                sumTime = sumTime + objPoint.OffsetTime;
                            }
                        }

                        if (SampleCount > 0 & sumTime > 0d)
                        {
                            offsetAvgTime = Math.Round(sumTime / SampleCount / 60d, 2);
                        }




                        // '*****************************************************************************''
                        // '****** Day Time**************************************************************''
                        // '*****************************************************************************''
                        // '*****************************************************************************''

                        sumTime = 0d;
                        SampleCount = 0;
                        foreach (StandPoint objPoint in objStandProcessor.connectionPoints.Values)
                        {
                            if (objPoint.OffsetTime >= 0 & objPoint.OffsetDayNightStatus == StandPoint.cnDayNightTime.DayTime)
                            {
                                SampleCount = SampleCount + 1;
                                sumTime = sumTime + objPoint.OffsetTime;
                            }
                        }

                        if (SampleCount > 0 & sumTime > 0d)
                        {
                            offsetDAvgTime = Math.Round(sumTime / SampleCount / 60d, 2);
                        }
                      

                        // '*****************************************************************************''
                        // '****** Night Time**************************************************************''
                        // '*****************************************************************************''
                        // '*****************************************************************************''
                        sumTime = 0d;
                        SampleCount = 0;
                        foreach (StandPoint objPoint in objStandProcessor.connectionPoints.Values)
                        {
                            if (objPoint.OffsetTime >= 0 & objPoint.OffsetDayNightStatus == StandPoint.cnDayNightTime.NightTime)
                            {
                                SampleCount = SampleCount + 1;
                                sumTime = sumTime + objPoint.OffsetTime;
                            }
                        }

                        if (SampleCount > 0 & sumTime > 0d)
                        {
                            offsetNAvgTime = Math.Round(sumTime / SampleCount / 60d, 2);
                        }

                        //offset_txtAvgTime.Text = offsetAvgTime;
                        //offset_txtAvgROP.Text = OffsetAvgROP;
                        //offset_txtAvgRotaryROP.Text = OffsetAvgRotaryROP;
                        //offset_txtAvgSlideROP.Text = OffsetAvgSlideROP;
                        //offset_txtDAvgTime.Text = offsetDAvgTime;
                        //offset_txtDAvgROP.Text = OffsetDAvgROP;
                        //offset_txtDAvgRotaryROP.Text = OffsetDAvgRotaryROP;
                        //offset_txtDAvgSlideROP.Text = OffsetDAvgSlideROP;
                        //offset_txtNAvgTime.Text = offsetNAvgTime;
                        //offset_txtNAvgROP.Text = OffsetNAvgROP;
                        //offset_txtNAvgRotaryROP.Text = OffsetNAvgRotaryROP;
                        //offset_txtNAvgSlideROP.Text = OffsetNAvgSlideROP;
                    }

                    #endregion
                }



                //////***************************************
                refreshConnectionTable();
              

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(this);

                return objResponse;
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("DrlgStandPlot =" + ex.Message + ex.StackTrace);
                Broker.BrokerResponse objBadResponse = objRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in generateReportData. " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }


        private void calculateStatsforOffset()
        {
            try
            {
                offsetAvgTime = 0;
                OffsetAvgROP = 0;
                OffsetAvgRotaryROP = 0;
                OffsetAvgSlideROP = 0;
                offsetDAvgTime = 0;
                OffsetDAvgROP = 0;
                OffsetDAvgRotaryROP = 0;
                OffsetDAvgSlideROP = 0;
                offsetNAvgTime = 0;
                OffsetNAvgROP = 0;
                OffsetNAvgRotaryROP = 0;
                OffsetNAvgSlideROP = 0;
                string offsetWellID = "";
                if (objWell.offsetWells.Count <= 0)
                {
                    return;
                }

             

                offsetWellID = Convert.ToString(objWell.offsetWells.Values.First().OffsetWellID);
                offsetWellName = VuMaxDR.Data.Objects.Well.getName(ref objRequest.objDataService, offsetWellID);
             


                double hdthFrom = objTimeLog.getHoleDepthFromDateTime(ref objRequest.objDataService, fromDate.ToOADate());
                double hdthTo = objTimeLog.getHoleDepthFromDateTime(ref objRequest.objDataService, toDate.ToOADate());
                TimeLog offsetTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref objRequest.objDataService, offsetWellID);
                if (offsetTimeLog is null)
                {
                    return;
                }


                /// Nishant
                /// New Calculation
                string strSQL = "";
                double TotalFootage = 0d;
                double TotalTimePeriod = 0d;
                string dataTableName = offsetTimeLog.__dataTableName;
                DateTime oFromDate = offsetTimeLog.getDateTimeFromDepthBegining(ref objRequest.objDataService, hdthFrom);
                DateTime oToDate = offsetTimeLog.getDateTimeFromDepthEnding(ref objRequest.objDataService, hdthTo);
                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + oFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + oToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
            

                TotalFootage  = CommonUtil.convertToDouble(objRequest.objDataService.getValueFromDatabase(strSQL));
                                         
                
                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + oFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + oToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                TotalTimePeriod = CommonUtil.convertToDouble(objRequest.objDataService.getValueFromDatabase(strSQL));


                /// Recalculate AvgROP
                if (TotalFootage > 0 & TotalTimePeriod > 0)
                {
                    OffsetAvgROP = Math.Round(TotalFootage / (TotalTimePeriod / 60 / 60), 2); // ft/hours
                }
                else
                {
                    OffsetAvgROP = 0;
                }

              
                // 'get RotaryROP
                double RotaryFootage = 0d;
                double RotaryTimePeriod = 0d;
                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + oFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + oToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                RotaryFootage = CommonUtil.convertToDouble(objRequest.objDataService.getValueFromDatabase(strSQL));
                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + oFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + oToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                RotaryTimePeriod = CommonUtil.convertToDouble(objRequest.objDataService.getValueFromDatabase(strSQL));

                /// Recalculate RotaryROP
                if (RotaryTimePeriod > 0d & RotaryFootage > 0)
                {
                    OffsetAvgRotaryROP = Math.Round(RotaryFootage / (RotaryTimePeriod / 60d / 60d), 2); // ft/hours
                }
                else
                {
                    OffsetAvgRotaryROP = 0;
                }

                // 'get SlideROP
                double SlideFootage = 0d;
                double SlideTimePeriod = 0d;
                strSQL = "SELECT SUM(HDTH-NEXT_DEPTH) FROM " + dataTableName + " WHERE DATETIME>='" + oFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + oToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                SlideFootage = CommonUtil.convertToDouble(DataService.checkNumericNull(objRequest.objDataService.getValueFromDatabase(strSQL)));
                strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE DATETIME>='" + oFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + oToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                SlideTimePeriod = CommonUtil.convertToDouble(DataService.checkNumericNull( objRequest.objDataService.getValueFromDatabase(strSQL)));
                /// Recalculate SlideROP
                if (SlideTimePeriod > 0d & SlideFootage > 0d)
                {
                    OffsetAvgSlideROP = Math.Round(SlideFootage / (SlideTimePeriod / 60d / 60d), 2); // ft/hours
                }
                else
                {
                    OffsetAvgSlideROP = 0;
                }

                // '*****************************************************************

                double DFootage = 0d;
                double DTimePeriod = 0d;
                double DRotaryFootage = 0d;
                double DRotaryTimePeriod = 0;
                double DSlideFootage = 0d;
                double DSlideTimePeriod = 0d;
                double NFootage = 0d;
                double NTimePeriod = 0d;
                double NRotaryFootage = 0d;
                double NRotaryTimePeriod = 0d;
                double NSlideFootage = 0d;
                double NSlideTimePeriod = 0d;
              
                strSQL = "SELECT DATETIME,HDTH,NEXT_DEPTH,TIME_DURATION,RIG_STATE FROM " + dataTableName + " WHERE DATETIME>='" + oFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + oToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                DataTable objROPData = objRequest.objDataService.getTable(strSQL);
                DateTime dtDateTime;
                double lnHDTH = 0d;
                double lnNextDepth = 0d;
                double lnTimeDuration = 0d;
                int lnRigState = 0;
                string DayNightStatus = "D";
                DateTime DayTimeDateFrom = Convert.ToDateTime( DateTime.Now.ToString("dd-MMM-yyyy") + " " + dtDayTimeFrom.ToString("HH:mm") + ":00");
                DateTime DayTimeDateTo = Convert.ToDateTime( DateTime.Now.ToString("dd-MMM-yyyy") + " " + dtDayTimeTo.ToString("HH:mm") + ":00");
                foreach (DataRow objRow in objROPData.Rows)
                {
                    dtDateTime = Convert.ToDateTime( DataService.checkNull(objRow["DATETIME"], new DateTime()));

                    // '//Convert this date to local time zone
                    dtDateTime = Util.convertUTCToWellTimeZone(dtDateTime, objWell);
                    DateTime standDate = Convert.ToDateTime(DateTime.Now.ToString("dd-MMM-yyyy") + " " + dtDateTime.ToString("HH:mm") + ":00");
                    if (standDate >= DayTimeDateFrom & standDate <= DayTimeDateTo)
                    {
                        DayNightStatus = "D";
                    }
                    else
                    {
                        DayNightStatus = "N";
                    }

                    lnHDTH = Convert.ToDouble(DataService.checkNull(objRow["HDTH"], 0));
                    lnNextDepth = Convert.ToDouble( DataService.checkNull(objRow["NEXT_DEPTH"], 0));
                    lnTimeDuration = Convert.ToDouble( DataService.checkNull(objRow["TIME_DURATION"], 0));
                    lnRigState =Convert.ToInt32( DataService.checkNull(objRow["RIG_STATE"], 0));
                    if (DayNightStatus == "D")
                    {
                        DFootage = DFootage + (lnHDTH - lnNextDepth);
                        DTimePeriod = DTimePeriod + lnTimeDuration;
                        if (lnRigState == 0)
                        {
                            DRotaryFootage = DRotaryFootage + (lnHDTH - lnNextDepth);
                            DRotaryTimePeriod = DRotaryTimePeriod + lnTimeDuration;
                        }

                        if (lnRigState == 1 | lnRigState == 19)
                        {
                            DSlideFootage = DSlideFootage + (lnHDTH - lnNextDepth);
                            DSlideTimePeriod = DSlideTimePeriod + lnTimeDuration;
                        }
                    }
                    else
                    {
                        NFootage = NFootage + (lnHDTH - lnNextDepth);
                        NTimePeriod = NTimePeriod + lnTimeDuration;
                        if (lnRigState == 0)
                        {
                            NRotaryFootage = NRotaryFootage + (lnHDTH - lnNextDepth);
                            NRotaryTimePeriod = NRotaryTimePeriod + lnTimeDuration;
                        }

                        if (lnRigState == 1 | lnRigState == 19)
                        {
                            NSlideFootage = NSlideFootage + (lnHDTH - lnNextDepth);
                            NSlideTimePeriod = NSlideTimePeriod + lnTimeDuration;
                        }
                    }
                }
                
                OffsetDAvgROP = 0;
                OffsetDAvgRotaryROP = 0;
                OffsetDAvgSlideROP = 0;
                OffsetNAvgROP = 0;
                OffsetNAvgRotaryROP = 0;
                OffsetNAvgSlideROP = 0;

                /// Recalculate AvgROP
                if (DTimePeriod > 0d && DFootage > 0d)
                {
                    OffsetDAvgROP = Math.Round(DFootage / (DTimePeriod / 60d / 60d), 2); // ft/hours
                }
                else
                {
                    OffsetDAvgROP = 0;
                }

                /// Recalculate RotaryROP
                if (DRotaryTimePeriod > 0 && DRotaryTimePeriod>0)
                {

                    OffsetDAvgRotaryROP = Math.Round(DRotaryFootage / ((DRotaryTimePeriod / 60) / 60), 2); //ft/hours
                }
                else
                {
                    OffsetDAvgRotaryROP = 0;
                }

                /// Recalculate SlideROP
                if (DSlideFootage > 0d && DSlideTimePeriod > 0d)
                {
                    OffsetDAvgSlideROP = Math.Round(DSlideFootage / (DSlideTimePeriod / 60d / 60d), 2); // ft/hours
                }
                else
                {
                    OffsetDAvgSlideROP = 0;
                }

                if (NFootage > 0d && NTimePeriod > 0d)
                {
                    OffsetNAvgROP = Math.Round(NFootage / (NTimePeriod / 60d / 60d), 2);
                }

                if (NRotaryFootage > 0d & NRotaryTimePeriod > 0d)
                {
                    OffsetNAvgRotaryROP = Math.Round(NRotaryFootage / (NRotaryTimePeriod / 60d / 60d), 2);
                }

                if (NSlideFootage > 0d & NSlideTimePeriod > 0d)
                {
                    OffsetNAvgSlideROP = Math.Round(NSlideFootage / (NSlideTimePeriod / 60d / 60d), 2);
                }
                
            }
            catch (Exception ex)
            {
                objLogger.LogMessage("DrlgStandPlot =" + ex.Message + ex.StackTrace);
                warnings += ex.Message + ex.StackTrace;
            }
        }

   

    }//Class
}//NameSpace
