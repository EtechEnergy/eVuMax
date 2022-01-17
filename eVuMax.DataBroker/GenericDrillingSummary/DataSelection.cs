using System;
using System.Collections.Generic;
using System.Linq;
//using System.Diagnostics;
//using System.Globalization;
//using System.IO;
//using System.Linq;
//using System.Reflection;
//using System.Runtime.CompilerServices;
//using System.Security;
//using System.Text;
//using System.Threading.Tasks;
//using Microsoft.VisualBasic;
using VuMaxDR.Data.Objects;
using VuMaxDR.Data;
using System.Drawing;
using System.Data;
using VuMaxDR.Common;
using eVuMax.DataBroker.Common;

namespace eVuMax.DataBroker.GenericDrillingSummary
{


    public class DataSelection
    {
        public enum sPlotSelectionType
        {
            ByHours = 0,
            DateRange = 1,
            FromDateOnwards = 2,
            DepthRange = 3,
            FromDepthOnwards = 4,
            FormationTops = 5
        }

        public sPlotSelectionType selectionType = sPlotSelectionType.ByHours;
        public int LastHours = 24;
        public DateTime FromDate = DateTime.Now;
        public DateTime ToDate = DateTime.Now;
        public double FromDepth;
        public double ToDepth;
        public string sideTrackKey = "";

        public Dictionary<string, string> topList = new Dictionary<string, string>();
        public Dictionary<string, string> trajList = new Dictionary<string, string>();
        public TimeLog objTimeLog;
        

        public int NoOfDataPoints = 6;

        public Dictionary<int, TFAdnlFilter> filterConditions = new Dictionary<int, TFAdnlFilter>();

        public bool FilterGTF = false;
        public double GTFFromDepth = 0;
        public double GTFToDepth = 0;
        public bool FilterMTF = false;
        public double MTFFromDepth = 0;
        public double MTFToDepth = 0;

        // 'Offset well ids
        public Dictionary<string, LogCorOffsetWellInfo> offsetWells = new Dictionary<string, LogCorOffsetWellInfo>();

        public bool FilterByMinSlideLength = false;
        public double MYMinSlideLength = 2;

        public string RunNo = "";
        public string PreparedBy = "";

        public int TrackWidth = 300;
        public bool ShowFormationTops = true;
        public double ScrollIncrement = 100;

        public string DepthLogID = "";
        public Dictionary<string, LogCorCurve> logCurves = new Dictionary<string, LogCorCurve>();

        public LogCorCurve topComparisionCurve = new LogCorCurve();

        // '## ROP Plot Customization ##
        public bool ROP_ShowOffset = false;
        public int ROP_MainPointStyle = 0;
        public int ROP_MainPointSize = 4;
        public string ROP_MainPointColorRotary = ColorTranslator.ToHtml(Color.LightGreen);
        public string ROP_MainPointColorSlide = ColorTranslator.ToHtml(Color.DarkGreen);
        public int ROP_OffsetPointStyle = 0;
        public int ROP_OffsetPointSize = 4;
        public string ROP_OffsetPointColorRotary = ColorTranslator.ToHtml(Color.Blue);
        public string ROP_OffsetPointColorSlide = ColorTranslator.ToHtml(Color.LightBlue);
        public string ROP_AxisFontName = "Arial";
        public int ROP_AxisFontSize = 10;
        public bool ROP_AxisFontBold = false;
        public bool ROP_AxisFontItalic = false;
        public bool ROP_AxisFontUnderline = false;
        public string ROP_StatFontName = "Arial";
        public int ROP_StatFontSize = 10;
        public bool ROP_StatFontBold = false;
        public bool ROP_StatFontItalic = false;
        public bool ROP_StatFontUnderline = false;

        public double DrlgBenchmark = 0;
        public double DrlgBSBenchmark = 0;
        public double DrlgSSBenchmark = 0;
        public double DrlgSBBenchmark = 0;
        public double TripBenchmark = 0;




        public double TargetTime = 0;
        public double RigCost = 0;

        public Dictionary<string, LogInfo> timeLogs = new Dictionary<string, LogInfo>();

        // '### 3.9.4 FIX ### Variable
        public bool MatchDepthByFormationTops = true;

        public bool ShowMainRotarySmoothCurve = false;
        public bool ShowMainSlideSmoothCurve = false;
        public bool ShowOffsetRotarySmoothCurve = false;
        public bool ShowOffsetSlideSmoothCurve = false;

        public Color MainRotarySmoothColor = Color.Black;
        public Color MainSlideSmoothColor = Color.Black;
        public Color OffsetRotarySmoothColor = Color.Black;
        public Color OffsetSlideSmoothColor = Color.Black;

        public int AvgPoints = 0;

        public int FracPointStyle = 0;
        public int FracPointSize = 4;
        public string FracPointColor = ColorTranslator.ToHtml(Color.Blue);

        public string FracWellboreID = "";
        public string FracLogID = "";
        public string FracMnemonic = "";

        public bool GTFVector = false;
        public bool MTFVector = false;

        public double FracClosurePressure = 0;

        public int FluidType = 0;

        public bool StandPlot_ShowOffset = false;
        public double StandPlot_ComparisonWindow = 50;

        public DataBroker.Broker.BrokerRequest objRequest = new Broker.BrokerRequest(); //Nishant 
        public string WellID = "";
        private string LastError = "";
        //public string userName = "";
        public bool showOffsetWell = false;  //prath 10-Jan-2021

        private VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();

        public DataSelection()
        {

        }

        //public DataSelection(string paramWellID, DataBroker.Broker.BrokerRequest paramRequest, string paramUserName)
        public DataSelection(string paramWellID, DataBroker.Broker.BrokerRequest paramRequest)

        {
            this.WellID = paramWellID;
            this.objRequest = paramRequest;
            this.objWell = VuMaxDR.Data.Objects.Well.loadObject(ref objRequest.objDataService, paramWellID, ref LastError);
            

        }

        public string getTopsList()
        {
            try
            {
                string strList = "";

                foreach (string strKey in topList.Keys)

                    strList = strList + "," + strKey;

                if (strList.Trim() != "")
                    strList = strList.Substring(1);

                return strList;
            }
            catch (Exception ex)
            {
                return "";
            }
        }

        public string getTopsFilter()
        {
            try
            {
                if (topList.Count > 0)
                {
                    double lnFinalMin = 0;
                    double lnFinalMax = 0;

                    getMinMaxDepthWithOffset(ref lnFinalMin, ref lnFinalMax);

                    string strCondition = "";

                    DataTable objTops = objRequest.objDataService.getTable("SELECT * FROM VMX_WELL_TOPS WHERE WELL_ID='" + WellID + "' ORDER BY DEPTH");

                    foreach (string strKey in topList.Keys)
                    {

                        // 'Find the depth range from the 

                        double minDepth = 0;
                        double maxDepth = 0;

                        for (int i = 0; i <= objTops.Rows.Count - 1; i++)
                        {
                            string topName = (string)DataService.checkNull(objTops.Rows[i]["TOP_NAME"], "");

                            if (topName.Trim().ToUpper() == strKey.Trim().ToUpper())
                            {
                                double topDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i]["DEPTH"], 0));

                                minDepth = topDepth;


                                if (i == objTops.Rows.Count - 1)
                                {
                                    maxDepth = 0;
                                    strCondition = strCondition + "OR (DEPTH>=" + minDepth.ToString() + ") ";
                                }
                                else
                                {
                                    maxDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i + 1]["DEPTH"], 0));
                                    strCondition = strCondition + "OR (DEPTH>=" + minDepth.ToString() + " AND DEPTH<=" + maxDepth.ToString() + ") ";
                                }
                            }
                        }
                    }


                    // 'Add additional condition to stretch the ends of well data on both the sides ...
                    strCondition = strCondition + "OR (DEPTH>=" + lnFinalMin.ToString() + " AND DEPTH<=" + lnFinalMax.ToString() + ") ";


                    if (strCondition.Trim() != "")
                    {
                        strCondition = strCondition.Substring(2);

                        strCondition = " (" + strCondition + ")";
                    }

                    return strCondition;
                }
                else
                    return "";
            }
            catch (Exception ex)
            {
                return "";
            }
        }


        public string getTopsFilter(string paramOffsetWellID)
        {
            try
            {
                if (topList.Count > 0)
                {
                    double lnFinalMin = 0;
                    double lnFinalMax = 0;

                    getMinMaxDepthWithOffset(ref lnFinalMin, ref lnFinalMax);


                    string strCondition = "";

                    DataTable objTops = objRequest.objDataService.getTable("SELECT * FROM VMX_WELL_TOPS WHERE WELL_ID='" + paramOffsetWellID + "' ORDER BY DEPTH");

                    foreach (string strKey in topList.Keys)
                    {

                        // 'Find the depth range from the 

                        double minDepth = 0;
                        double maxDepth = 0;

                        for (int i = 0; i <= objTops.Rows.Count - 1; i++)
                        {
                            string topName = (string)DataService.checkNull(objTops.Rows[i]["TOP_NAME"], "");

                            if (topName.Trim().ToUpper() == strKey.Trim().ToUpper())
                            {
                                double topDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i]["DEPTH"], 0));

                                minDepth = topDepth;


                                if (i == objTops.Rows.Count - 1)
                                {
                                    maxDepth = 0;
                                    strCondition = strCondition + "OR (DEPTH>=" + minDepth.ToString() + ") ";
                                }
                                else
                                {
                                    maxDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i + 1]["DEPTH"], 0));
                                    strCondition = strCondition + "OR (DEPTH>=" + minDepth.ToString() + " AND DEPTH<=" + maxDepth.ToString() + ") ";
                                }
                            }
                        }
                    }


                    // 'Add additional condition to stretch the ends of well data on both the sides ...
                    strCondition = strCondition + "OR (DEPTH>=" + lnFinalMin.ToString() + " AND DEPTH<=" + lnFinalMax.ToString() + ") ";


                    if (strCondition.Trim() != "")
                    {
                        strCondition = strCondition.Substring(2);

                        strCondition = " (" + strCondition + ")";
                    }

                    return strCondition;
                }
                else
                    return "";
            }
            catch (Exception ex)
            {
                return "";
            }
        }


        public void getTopsDepthRange(ref double paramFromDepth, ref double paramToDepth)
        {
            try
            {
                double lnMinDepth = 0;
                double lnMaxDepth = 0;


                if (topList.Count > 0)
                {
                    DataTable objTops = objRequest.objDataService.getTable("SELECT * FROM VMX_WELL_TOPS WHERE WELL_ID='" + WellID + "' ORDER BY DEPTH");

                    foreach (string strKey in topList.Keys)
                    {

                        // 'Find the depth range from the 

                        double minDepth = 0;
                        double maxDepth = 0;

                        for (int i = 0; i <= objTops.Rows.Count - 1; i++)
                        {
                            string topName = (string)DataService.checkNull(objTops.Rows[i]["TOP_NAME"], "");

                            if (topName.Trim().ToUpper() == strKey.Trim().ToUpper())
                            {
                                double topDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i]["DEPTH"], 0));

                                maxDepth = topDepth;

                                if (i > 0)
                                    minDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i - 1]["DEPTH"], 0));
                                else
                                    minDepth = 0;


                                if (minDepth < lnMinDepth)
                                    lnMinDepth = minDepth;

                                if (maxDepth > lnMaxDepth)
                                    lnMaxDepth = maxDepth;
                            }
                        }
                    }


                    lnMinDepth = lnMaxDepth;


                    foreach (string strKey in topList.Keys)
                    {

                        // 'Find the depth range from the 

                        double minDepth = 0;
                        double maxDepth = 0;

                        for (int i = 0; i <= objTops.Rows.Count - 1; i++)
                        {
                            string topName = (string)DataService.checkNull(objTops.Rows[i]["TOP_NAME"], "");

                            if (topName.Trim().ToUpper() == strKey.Trim().ToUpper())
                            {
                                double topDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i]["DEPTH"], 0));

                                maxDepth = topDepth;

                                if (i > 0)
                                    minDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i - 1]["DEPTH"], 0));
                                else
                                    minDepth = 0;


                                if (minDepth < lnMinDepth)
                                    lnMinDepth = minDepth;
                            }
                        }
                    }
                }


                paramFromDepth = lnMinDepth;
                paramToDepth = lnMaxDepth;
            }
            catch (Exception ex)
            {
            }
        }

        //public string getAdditionalDataFilter()
        //{
        //    try
        //    {
        //        if (filterConditions.Count == 0)
        //            return "";

        //        string strConditions = "";

        //        foreach (TFAdnlFilter objItem in filterConditions.Values)
        //        {
        //            string Mnemonic = objItem.Mnemonic;
        //            bool MnemonicFound = false;

        //            if (objTimeLog.logCurves.ContainsKey(Mnemonic))
        //                MnemonicFound = true;
        //            else
        //            {
        //                Mnemonic = objMnemonicMappingMgr.getMappedMnemonic(Mnemonic, objTimeLog.logCurves);

        //                if (Mnemonic.Trim() != "")
        //                    MnemonicFound = true;
        //            }

        //            if (MnemonicFound)
        //                strConditions = strConditions + " AND [" + Mnemonic + "] " + objItem.JoinOperator + " " + objItem.Value + " ";
        //        }

        //        // 'Use the 

        //        return strConditions;
        //    }
        //    catch (Exception ex)
        //    {
        //        return "";
        //    }
        //}

        // '### 3.9.4 FIX ### ==>> Take entire save and load methods
        //public void saveDataSelection(string paramPlotID)
        //{
        //    try
        //    {
        //        string strSQL = "";

        //        strSQL = "DELETE FROM VMX_USER_DATA_SELECTION WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + objDataService.UserName + "' AND PLOT_ID='" + paramPlotID + "'";
        //        objDataService.executeNonQuery(strSQL);

        //        int lnSelectionType = selectionType;

        //        string strTrajList = "";

        //        foreach (string strKey in trajList.Keys)
        //            strTrajList = strTrajList + "," + strKey;

        //        if (strTrajList.Trim() != "")
        //            strTrajList = strTrajList.Substring(1);

        //        string strTopList = "";

        //        if (topList.Count > 0)
        //        {
        //            foreach (string strKey in topList.Keys)

        //                strTopList = strTopList + "," + strKey;

        //            if (strTopList.Trim() != "")
        //                strTopList = strTopList.Substring(1);
        //        }

        //        // 'Try to add the field in USER_DATA_SELECTION *******************************''
        //        try
        //        {
        //            strSQL = " IF NOT EXISTS(SELECT * FROM   INFORMATION_SCHEMA.COLUMNS WHERE  TABLE_NAME = 'VMX_USER_DATA_SELECTION' AND COLUMN_NAME = 'AVG_POINTS' ) ";
        //            strSQL += " BEGIN ";
        //            strSQL += " ALTER TABLE VMX_USER_DATA_SELECTION ADD AVG_POINTS NUMERIC(5) ";
        //            strSQL += " END ";

        //            objDataService.executeNonQuery(strSQL);
        //        }
        //        catch (Exception ex)
        //        {
        //        }
        //        // '***************************************************************************''


        //        strSQL = "INSERT INTO VMX_USER_DATA_SELECTION (WELL_ID,USER_NAME,PLOT_ID,SELECTION_TYPE,HOURS,FROM_DATE,TO_DATE,FROM_DEPTH,TO_DEPTH,SIDE_TRACK_ID,TRAJ_LIST,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE,DATA_POINTS,FILTER_GTF,GTF_DEPTH_FROM,GTF_DEPTH_TO,FILTER_MTF,MTF_DEPTH_FROM,MTF_DEPTH_TO,TOP_LIST,RUN_NO,PREPARED_BY,TRACK_WIDTH,SHOW_FORMATION_TOPS,SCROLL_INC,DEPTH_LOG_ID,DRLG_BM, DRLG_BM_BS,DRLG_BM_SS,DRLG_BM_SB,TRIP_BM,TRG_DRLG_CONN_TIME,RIG_COST,MATCH_DEPTH,ROT_SMTH,SLD_SMTH,O_ROT_SMTH,O_SLD_SMTH,ROT_SMTH_COLOR,SLD_SMTH_COLOR,O_ROT_SMTH_COLOR,O_SLD_SMTH_COLOR,AVG_POINTS,FR_POINT_STYLE,FR_POINT_SIZE,FR_POINT_COLOR,FR_WELLBORE_ID,FR_LOG_ID,FR_MNEMONIC,GTF_VECTOR,MTF_VECTOR,FR_CL_PRESS,FR_FL_TYPE,STND_SHOW_OFFSET,COMP_WINDOW) VALUES(";

        //        strSQL += "'" + WellID + "',";
        //        strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //        strSQL += "'" + paramPlotID + "',";
        //        strSQL += "" + lnSelectionType.ToString() + ",";
        //        strSQL += "" + LastHours.ToString() + ",";
        //        strSQL += "'" + FromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //        strSQL += "'" + ToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //        strSQL += "" + FromDepth.ToString() + ",";
        //        strSQL += "" + ToDepth.ToString() + ",";
        //        strSQL += "'" + sideTrackKey.Replace("'", "''") + "',";
        //        strSQL += "'" + strTrajList.Replace("'", "''") + "',";
        //        strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //        strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //        strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //        strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //        strSQL += "" + this.NoOfDataPoints.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(FilterGTF, 1, 0).ToString() + ",";
        //        strSQL += "" + GTFFromDepth.ToString() + ",";
        //        strSQL += "" + GTFToDepth.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(FilterMTF, 1, 0).ToString() + ",";
        //        strSQL += "" + MTFFromDepth.ToString() + ",";
        //        strSQL += "" + MTFToDepth.ToString() + ",";
        //        strSQL += "'" + strTopList.Replace("'", "''") + "',";
        //        strSQL += "'" + RunNo.Replace("'", "''") + "',";
        //        strSQL += "'" + PreparedBy.Replace("'", "''") + "',";
        //        strSQL += "" + TrackWidth.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ShowFormationTops == true, 1, 0).ToString() + ",";
        //        strSQL += "" + ScrollIncrement.ToString() + ",";
        //        strSQL += "'" + DepthLogID.Replace("'", "''") + "',";
        //        strSQL += "" + DrlgBenchmark.ToString() + ",";

        //        strSQL += "" + DrlgBSBenchmark.ToString() + ",";
        //        strSQL += "" + DrlgSSBenchmark.ToString() + ",";
        //        strSQL += "" + DrlgSBBenchmark.ToString() + ",";

        //        strSQL += "" + TripBenchmark.ToString() + ",";
        //        strSQL += "" + TargetTime.ToString() + ",";
        //        strSQL += "" + RigCost.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(MatchDepthByFormationTops == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ShowMainRotarySmoothCurve == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ShowMainSlideSmoothCurve == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ShowOffsetRotarySmoothCurve == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ShowOffsetSlideSmoothCurve == true, 1, 0).ToString() + ",";
        //        strSQL += "" + MainRotarySmoothColor.ToArgb.ToString + ",";
        //        strSQL += "" + MainSlideSmoothColor.ToArgb.ToString + ",";
        //        strSQL += "" + OffsetRotarySmoothColor.ToArgb.ToString + ",";
        //        strSQL += "" + OffsetSlideSmoothColor.ToArgb.ToString + ",";
        //        strSQL += "" + AvgPoints.ToString() + ",";

        //        strSQL += "" + FracPointStyle.ToString() + ",";
        //        strSQL += "" + FracPointSize.ToString() + ",";
        //        strSQL += "" + FracPointColor.ToArgb.ToString + ",";

        //        strSQL += "'" + FracWellboreID.Replace("'", "''") + "',";
        //        strSQL += "'" + FracLogID.Replace("'", "''") + "',";
        //        strSQL += "'" + FracMnemonic.Replace("'", "''") + "',";

        //        strSQL += "" + Interaction.IIf(GTFVector == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(MTFVector == true, 1, 0).ToString() + ",";

        //        strSQL += "" + FracClosurePressure.ToString() + ",";

        //        strSQL += "" + FluidType.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(StandPlot_ShowOffset == true, 1, 0).ToString() + ",";
        //        strSQL += "" + StandPlot_ComparisonWindow.ToString().ToString() + ")";


        //        if (objDataService.executeNonQuery(strSQL))
        //        {
        //        }
        //        else
        //            MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);


        //        strSQL = "DELETE FROM VMX_USER_DATA_SELECTION_FILTERS WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + objDataService.UserName.Replace("'", "''") + "' AND PLOT_ID='" + paramPlotID + "'  ";
        //        objDataService.executeNonQuery(strSQL);


        //        // 'Save the filters ...
        //        foreach (TFAdnlFilter objItem in filterConditions.Values)
        //        {
        //            strSQL = "INSERT INTO VMX_USER_DATA_SELECTION_FILTERS (WELL_ID,USER_NAME,PLOT_ID,FILTER_ID,MNEMONIC,JOIN_OPERATOR,VALUE,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + paramPlotID + "',";
        //            strSQL += "" + objItem.FilterID.ToString + ",";
        //            strSQL += "'" + objItem.Mnemonic + "',";
        //            strSQL += "'" + objItem.JoinOperator + "',";
        //            strSQL += "" + objItem.Value.ToString + ",";
        //            strSQL += "'" + objDataService.UserName + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //            strSQL += "'" + objDataService.UserName + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";

        //            if (objDataService.executeNonQuery(strSQL))
        //            {
        //            }
        //            else
        //            {
        //                MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);
        //                break;
        //            }
        //        }


        //        strSQL = "DELETE FROM VMX_USER_DATA_SELECTION_OFFSET WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + objDataService.UserName.Replace("'", "''") + "' AND PLOT_ID='" + paramPlotID + "'  ";
        //        objDataService.executeNonQuery(strSQL);


        //        foreach (LogCorOffsetWellInfo objItem in offsetWells.Values)
        //        {
        //            strSQL = "INSERT INTO VMX_USER_DATA_SELECTION_OFFSET (WELL_ID,USER_NAME,PLOT_ID,OFFSET_WELL_ID,OFFSET_DEPTH,DEPTH_LOG_ID,SHORT_NAME) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "'" + objDataService.UserName + "',";
        //            strSQL += "'" + paramPlotID + "',";
        //            strSQL += "'" + objItem.OffsetWellID + "',";
        //            strSQL += "" + objItem.DepthOffset.ToString + ",";
        //            strSQL += "'" + objItem.DepthLogID.Replace("'", "''") + "',";
        //            strSQL += "'" + objItem.ShortName.Replace("'", "''") + "')";

        //            if (objDataService.executeNonQuery(strSQL))
        //            {
        //            }
        //            else
        //            {
        //                MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);
        //                break;
        //            }
        //        }


        //        strSQL = "DELETE FROM VMX_LOG_COR_CURVES WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + objDataService.UserName.Replace("'", "''") + "' ";
        //        objDataService.executeNonQuery(strSQL);


        //        foreach (LogCorCurve objItem in logCurves.Values)
        //        {
        //            strSQL = "INSERT INTO VMX_LOG_COR_CURVES (WELL_ID,ENTRY_ID,USER_NAME,MNEMONIC,NAME,LINE_COLOR,LINE_STYLE,LINE_WIDTH,INVERSE_SCALE,AUTO_SCALE,MIN_VALUE,MAX_VALUE,VISIBLE,IGNORE_NEGATIVE,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE,COLOR1,COLOR2,COLOR3,COLOR4,COLOR5,DISPLAY_ORDER) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "'" + objItem.EntryID + "',";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + objItem.Mnemonic.Replace("'", "''") + "',";
        //            strSQL += "'" + objItem.Name.Replace("'", "''") + "',";
        //            strSQL += "" + objItem.LineColor.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.LineStyle.ToString + ",";
        //            strSQL += "" + objItem.LineWidth.ToString + ",";
        //            strSQL += "" + IIf(objItem.InverseScale == true, 1, 0).ToString + ",";
        //            strSQL += "" + IIf(objItem.AutoScale == true, 1, 0).ToString + ",";
        //            strSQL += "" + objItem.MinValue.ToString + ",";
        //            strSQL += "" + objItem.MaxValue.ToString + ",";
        //            strSQL += "" + IIf(objItem.Visible == true, 1, 0).ToString + ",";
        //            strSQL += "" + IIf(objItem.IgnoreNegative == true, 1, 0).ToString + ",";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //            strSQL += "" + objItem.Color1.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.Color2.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.Color3.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.Color4.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.Color5.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.DisplayOrder.ToString + ")";

        //            if (objDataService.executeNonQuery(strSQL))
        //            {
        //            }
        //            else
        //            {
        //                MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);
        //                break;
        //            }
        //        }


        //        strSQL = "DELETE FROM VMX_LOG_COR_CURVE_OFFSET WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + objDataService.UserName.Replace("'", "''") + "' ";
        //        objDataService.executeNonQuery(strSQL);



        //        {
        //            var withBlock = topComparisionCurve;
        //            strSQL = "INSERT INTO VMX_LOG_COR_CURVE_OFFSET (WELL_ID,USER_NAME,MNEMONIC,NAME,LINE_COLOR,LINE_STYLE,LINE_WIDTH,INVERSE_SCALE,AUTO_SCALE,MIN_VALUE,MAX_VALUE,VISIBLE,IGNORE_NEGATIVE,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + withBlock.Mnemonic.Replace("'", "''") + "',";
        //            strSQL += "'" + withBlock.Name.Replace("'", "''") + "',";
        //            strSQL += "" + withBlock.LineColor.ToArgb.ToString + ",";
        //            strSQL += "" + withBlock.LineStyle.ToString + ",";
        //            strSQL += "" + withBlock.LineWidth.ToString + ",";
        //            strSQL += "" + IIf(withBlock.InverseScale == true, 1, 0).ToString + ",";
        //            strSQL += "" + IIf(withBlock.AutoScale == true, 1, 0).ToString + ",";
        //            strSQL += "" + withBlock.MinValue.ToString + ",";
        //            strSQL += "" + withBlock.MaxValue.ToString + ",";
        //            strSQL += "" + IIf(withBlock.Visible == true, 1, 0).ToString + ",";
        //            strSQL += "" + IIf(withBlock.IgnoreNegative == true, 1, 0).ToString + ",";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
        //        }

        //        if (objDataService.executeNonQuery(strSQL))
        //        {
        //        }
        //        else
        //            MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);


        //        strSQL = "DELETE FROM VMX_ROP_PLOT_FORMAT WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + objDataService.UserName.Replace("'", "''") + "' ";
        //        objDataService.executeNonQuery(strSQL);


        //        strSQL = "INSERT INTO VMX_ROP_PLOT_FORMAT (WELL_ID,USER_NAME,MAIN_POINT_STYLE,MAIN_POINT_SIZE,MAIN_POINT_COLOR_R,MAIN_POINT_COLOR_S,OFFSET_POINT_STYLE,OFFSET_POINT_SIZE,OFFSET_POINT_COLOR_R,OFFSET_POINT_COLOR_S,AXIS_FONT_NAME,AXIS_FONT_SIZE,AXIS_FONT_BOLD,AXIS_FONT_ITALIC,AXIS_FONT_UNDERLINE,STAT_FONT_NAME,STAT_FONT_SIZE,STAT_FONT_BOLD,STAT_FONT_ITALIC,STAT_FONT_UNDERLINE,SHOW_OFFSET) VALUES(";
        //        strSQL += "'" + WellID + "',";
        //        strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //        strSQL += "" + ROP_MainPointStyle.ToString() + ",";
        //        strSQL += "" + ROP_MainPointSize.ToString() + ",";
        //        strSQL += "" + ROP_MainPointColorRotary.ToArgb.ToString + ",";
        //        strSQL += "" + ROP_MainPointColorSlide.ToArgb.ToString + ",";
        //        strSQL += "" + ROP_OffsetPointStyle.ToString() + ",";
        //        strSQL += "" + ROP_OffsetPointSize.ToString() + ",";
        //        strSQL += "" + ROP_OffsetPointColorRotary.ToArgb.ToString + ",";
        //        strSQL += "" + ROP_OffsetPointColorSlide.ToArgb.ToString + ",";
        //        strSQL += "'" + ROP_AxisFontName.Replace("'", "''") + "',";
        //        strSQL += "" + ROP_AxisFontSize.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_AxisFontBold == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_AxisFontItalic == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_AxisFontUnderline == true, 1, 0).ToString() + ",";
        //        strSQL += "'" + ROP_StatFontName.Replace("'", "''") + "',";
        //        strSQL += "" + ROP_StatFontSize.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_StatFontBold == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_StatFontItalic == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_StatFontUnderline == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_ShowOffset == true, 1, 0).ToString() + ")";

        //        if (objDataService.executeNonQuery(strSQL))
        //        {
        //        }
        //        else
        //            MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);


        //        strSQL = "DELETE FROM VMX_USER_DATA_SELECTION_LOGS WHERE USER_NAME='" + objDataService.UserName.Replace("'", "''") + "' AND PLOT_ID='" + paramPlotID + "' ";
        //        objDataService.executeNonQuery(strSQL);

        //        foreach (LogInfo objLogInfo in timeLogs.Values)
        //        {
        //            strSQL = "INSERT INTO VMX_USER_DATA_SELECTION_LOGS (WELL_ID,USER_NAME,PLOT_ID,WELLBORE_ID,LOG_ID) VALUES(";
        //            strSQL += "'" + objLogInfo.WellID.Replace("'", "''") + "',";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + paramPlotID.Replace("'", "''") + "',";
        //            strSQL += "'" + objLogInfo.WellboreID.Replace("'", "''") + "',";
        //            strSQL += "'" + objLogInfo.LogID.Replace("'", "''") + "')";

        //            if (objDataService.executeNonQuery(strSQL))
        //            {
        //            }
        //            else
        //            {
        //                MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);
        //                break;
        //            }
        //        }
        //    }

        //    catch (Exception ex)
        //    {
        //    }
        //}


        //public void saveDataSelection(string paramPlotID, string paramExtID)
        //{
        //    try
        //    {
        //        string strSQL = "";

        //        strSQL = "DELETE FROM VMX_USER_DATA_SELECTION WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID + "' AND PLOT_ID='" + paramPlotID + "'";
        //        objDataService.executeNonQuery(strSQL);

        //        int lnSelectionType = selectionType;

        //        string strTrajList = "";

        //        foreach (string strKey in trajList.Keys)
        //            strTrajList = strTrajList + "," + strKey;

        //        if (strTrajList.Trim() != "")
        //            strTrajList = strTrajList.Substring(1);

        //        string strTopList = "";

        //        if (topList.Count > 0)
        //        {
        //            foreach (string strKey in topList.Keys)

        //                strTopList = strTopList + "," + strKey;

        //            if (strTopList.Trim() != "")
        //                strTopList = strTopList.Substring(1);
        //        }


        //        // strSQL = "INSERT INTO VMX_USER_DATA_SELECTION (WELL_ID,USER_NAME,PLOT_ID,SELECTION_TYPE,HOURS,FROM_DATE,TO_DATE,FROM_DEPTH,TO_DEPTH,SIDE_TRACK_ID,TRAJ_LIST,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE,DATA_POINTS,FILTER_GTF,GTF_DEPTH_FROM,GTF_DEPTH_TO,FILTER_MTF,MTF_DEPTH_FROM,MTF_DEPTH_TO,TOP_LIST,RUN_NO,PREPARED_BY,TRACK_WIDTH,SHOW_FORMATION_TOPS,SCROLL_INC,DEPTH_LOG_ID,DRLG_BM,                      TRIP_BM,TRG_DRLG_CONN_TIME,RIG_COST,MATCH_DEPTH,ROT_SMTH,SLD_SMTH,O_ROT_SMTH,O_SLD_SMTH,ROT_SMTH_COLOR,SLD_SMTH_COLOR,O_ROT_SMTH_COLOR,O_SLD_SMTH_COLOR,AVG_POINTS,GTF_VECTOR,MTF_VECTOR,FR_CL_PRESS,FR_FL_TYPE) VALUES("
        //        strSQL = "INSERT INTO VMX_USER_DATA_SELECTION (WELL_ID,USER_NAME,PLOT_ID,SELECTION_TYPE,HOURS,FROM_DATE,TO_DATE,FROM_DEPTH,TO_DEPTH,SIDE_TRACK_ID,TRAJ_LIST,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE,DATA_POINTS,FILTER_GTF,GTF_DEPTH_FROM,GTF_DEPTH_TO,FILTER_MTF,MTF_DEPTH_FROM,MTF_DEPTH_TO,TOP_LIST,RUN_NO,PREPARED_BY,TRACK_WIDTH,SHOW_FORMATION_TOPS,SCROLL_INC,DEPTH_LOG_ID,DRLG_BM,DRLG_BM_BS, DRLG_BM_SS,DRLG_BM_SB,TRIP_BM,TRG_DRLG_CONN_TIME,RIG_COST,MATCH_DEPTH,ROT_SMTH,SLD_SMTH,O_ROT_SMTH,O_SLD_SMTH,ROT_SMTH_COLOR,SLD_SMTH_COLOR,O_ROT_SMTH_COLOR,O_SLD_SMTH_COLOR,AVG_POINTS,GTF_VECTOR,MTF_VECTOR,FR_CL_PRESS,FR_FL_TYPE,STND_SHOW_OFFSET,COMP_WINDOW) VALUES(";
        //        strSQL += "'" + WellID + "',";
        //        strSQL += "'" + paramExtID.Replace("'", "''") + "',";
        //        strSQL += "'" + paramPlotID + "',";
        //        strSQL += "" + lnSelectionType.ToString() + ",";
        //        strSQL += "" + LastHours.ToString() + ",";
        //        strSQL += "'" + FromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //        strSQL += "'" + ToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //        strSQL += "" + FromDepth.ToString() + ",";
        //        strSQL += "" + ToDepth.ToString() + ",";
        //        strSQL += "'" + sideTrackKey.Replace("'", "''") + "',";
        //        strSQL += "'" + strTrajList.Replace("'", "''") + "',";
        //        strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //        strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //        strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //        strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //        strSQL += "" + this.NoOfDataPoints.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(FilterGTF, 1, 0).ToString() + ",";
        //        strSQL += "" + GTFFromDepth.ToString() + ",";
        //        strSQL += "" + GTFToDepth.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(FilterMTF, 1, 0).ToString() + ",";
        //        strSQL += "" + MTFFromDepth.ToString() + ",";
        //        strSQL += "" + MTFToDepth.ToString() + ",";
        //        strSQL += "'" + strTopList.Replace("'", "''") + "',";
        //        strSQL += "'" + RunNo.Replace("'", "''") + "',";
        //        strSQL += "'" + PreparedBy.Replace("'", "''") + "',";
        //        strSQL += "" + TrackWidth.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ShowFormationTops == true, 1, 0).ToString() + ",";
        //        strSQL += "" + ScrollIncrement.ToString() + ",";
        //        strSQL += "'" + DepthLogID.Replace("'", "''") + "',";
        //        strSQL += "" + DrlgBenchmark.ToString() + ",";


        //        strSQL += "" + DrlgBSBenchmark.ToString() + ",";
        //        strSQL += "" + DrlgSSBenchmark.ToString() + ",";
        //        strSQL += "" + DrlgSBBenchmark.ToString() + ",";

        //        strSQL += "" + TripBenchmark.ToString() + ",";
        //        strSQL += "" + TargetTime.ToString() + ",";
        //        strSQL += "" + RigCost.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(MatchDepthByFormationTops == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ShowMainRotarySmoothCurve == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ShowMainSlideSmoothCurve == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ShowOffsetRotarySmoothCurve == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ShowOffsetSlideSmoothCurve == true, 1, 0).ToString() + ",";
        //        strSQL += "" + MainRotarySmoothColor.ToArgb.ToString + ",";
        //        strSQL += "" + MainSlideSmoothColor.ToArgb.ToString + ",";
        //        strSQL += "" + OffsetRotarySmoothColor.ToArgb.ToString + ",";
        //        strSQL += "" + OffsetSlideSmoothColor.ToArgb.ToString + ",";
        //        // 'prath Export problem
        //        // strSQL += "" + AvgPoints.ToString + ")"
        //        strSQL += "" + AvgPoints.ToString() + ",";

        //        strSQL += "" + Interaction.IIf(GTFVector == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(MTFVector == true, 1, 0).ToString() + ",";

        //        strSQL += "" + FracClosurePressure.ToString() + ",";

        //        strSQL += "" + FluidType.ToString() + ",";

        //        strSQL += "" + Interaction.IIf(StandPlot_ShowOffset == true, 1, 0).ToString() + ",";
        //        strSQL += "" + StandPlot_ComparisonWindow.ToString().ToString() + ")";

        //        // '****************


        //        if (objDataService.executeNonQuery(strSQL))
        //        {
        //        }
        //        else
        //            MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);


        //        strSQL = "DELETE FROM VMX_USER_DATA_SELECTION_FILTERS WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID.Replace("'", "''") + "' AND PLOT_ID='" + paramPlotID + "'  ";
        //        objDataService.executeNonQuery(strSQL);


        //        // 'Save the filters ...
        //        foreach (TFAdnlFilter objItem in filterConditions.Values)
        //        {
        //            strSQL = "INSERT INTO VMX_USER_DATA_SELECTION_FILTERS (WELL_ID,USER_NAME,PLOT_ID,FILTER_ID,MNEMONIC,JOIN_OPERATOR,VALUE,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "'" + paramExtID.Replace("'", "''") + "',";
        //            strSQL += "'" + paramPlotID + "',";
        //            strSQL += "" + objItem.FilterID.ToString + ",";
        //            strSQL += "'" + objItem.Mnemonic + "',";
        //            strSQL += "'" + objItem.JoinOperator + "',";
        //            strSQL += "" + objItem.Value.ToString + ",";
        //            strSQL += "'" + objDataService.UserName + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //            strSQL += "'" + objDataService.UserName + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";

        //            if (objDataService.executeNonQuery(strSQL))
        //            {
        //            }
        //            else
        //            {
        //                MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);
        //                break;
        //            }
        //        }


        //        strSQL = "DELETE FROM VMX_USER_DATA_SELECTION_OFFSET WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID.Replace("'", "''") + "' AND PLOT_ID='" + paramPlotID + "'  ";
        //        objDataService.executeNonQuery(strSQL);


        //        foreach (LogCorOffsetWellInfo objItem in offsetWells.Values)
        //        {
        //            strSQL = "INSERT INTO VMX_USER_DATA_SELECTION_OFFSET (WELL_ID,USER_NAME,PLOT_ID,OFFSET_WELL_ID,OFFSET_DEPTH,DEPTH_LOG_ID,SHORT_NAME) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "'" + paramExtID + "',";
        //            strSQL += "'" + paramPlotID + "',";
        //            strSQL += "'" + objItem.OffsetWellID + "',";
        //            strSQL += "" + objItem.DepthOffset.ToString + ",";
        //            strSQL += "'" + objItem.DepthLogID.Replace("'", "''") + "',";
        //            strSQL += "'" + objItem.ShortName.Replace("'", "''") + "')";

        //            if (objDataService.executeNonQuery(strSQL))
        //            {
        //            }
        //            else
        //            {
        //                MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);
        //                break;
        //            }
        //        }


        //        strSQL = "DELETE FROM VMX_LOG_COR_CURVES WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID.Replace("'", "''") + "' ";
        //        objDataService.executeNonQuery(strSQL);


        //        foreach (LogCorCurve objItem in logCurves.Values)
        //        {
        //            strSQL = "INSERT INTO VMX_LOG_COR_CURVES (WELL_ID,ENTRY_ID,USER_NAME,MNEMONIC,NAME,LINE_COLOR,LINE_STYLE,LINE_WIDTH,INVERSE_SCALE,AUTO_SCALE,MIN_VALUE,MAX_VALUE,VISIBLE,IGNORE_NEGATIVE,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE,COLOR1,COLOR2,COLOR3,COLOR4,COLOR5,DISPLAY_ORDER) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "'" + objItem.EntryID + "',";
        //            strSQL += "'" + paramExtID.Replace("'", "''") + "',";
        //            strSQL += "'" + objItem.Mnemonic.Replace("'", "''") + "',";
        //            strSQL += "'" + objItem.Name.Replace("'", "''") + "',";
        //            strSQL += "" + objItem.LineColor.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.LineStyle.ToString + ",";
        //            strSQL += "" + objItem.LineWidth.ToString + ",";
        //            strSQL += "" + IIf(objItem.InverseScale == true, 1, 0).ToString + ",";
        //            strSQL += "" + IIf(objItem.AutoScale == true, 1, 0).ToString + ",";
        //            strSQL += "" + objItem.MinValue.ToString + ",";
        //            strSQL += "" + objItem.MaxValue.ToString + ",";
        //            strSQL += "" + IIf(objItem.Visible == true, 1, 0).ToString + ",";
        //            strSQL += "" + IIf(objItem.IgnoreNegative == true, 1, 0).ToString + ",";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //            strSQL += "" + objItem.Color1.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.Color2.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.Color3.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.Color4.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.Color5.ToArgb.ToString + ",";
        //            strSQL += "" + objItem.DisplayOrder.ToString + ")";

        //            if (objDataService.executeNonQuery(strSQL))
        //            {
        //            }
        //            else
        //            {
        //                MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);
        //                break;
        //            }
        //        }


        //        strSQL = "DELETE FROM VMX_LOG_COR_CURVE_OFFSET WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID.Replace("'", "''") + "' ";
        //        objDataService.executeNonQuery(strSQL);



        //        {
        //            var withBlock = topComparisionCurve;
        //            strSQL = "INSERT INTO VMX_LOG_COR_CURVE_OFFSET (WELL_ID,USER_NAME,MNEMONIC,NAME,LINE_COLOR,LINE_STYLE,LINE_WIDTH,INVERSE_SCALE,AUTO_SCALE,MIN_VALUE,MAX_VALUE,VISIBLE,IGNORE_NEGATIVE,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "'" + paramExtID.Replace("'", "''") + "',";
        //            strSQL += "'" + withBlock.Mnemonic.Replace("'", "''") + "',";
        //            strSQL += "'" + withBlock.Name.Replace("'", "''") + "',";
        //            strSQL += "" + withBlock.LineColor.ToArgb.ToString + ",";
        //            strSQL += "" + withBlock.LineStyle.ToString + ",";
        //            strSQL += "" + withBlock.LineWidth.ToString + ",";
        //            strSQL += "" + IIf(withBlock.InverseScale == true, 1, 0).ToString + ",";
        //            strSQL += "" + IIf(withBlock.AutoScale == true, 1, 0).ToString + ",";
        //            strSQL += "" + withBlock.MinValue.ToString + ",";
        //            strSQL += "" + withBlock.MaxValue.ToString + ",";
        //            strSQL += "" + IIf(withBlock.Visible == true, 1, 0).ToString + ",";
        //            strSQL += "" + IIf(withBlock.IgnoreNegative == true, 1, 0).ToString + ",";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
        //        }

        //        if (objDataService.executeNonQuery(strSQL))
        //        {
        //        }
        //        else
        //            MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);


        //        strSQL = "DELETE FROM VMX_ROP_PLOT_FORMAT WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID.Replace("'", "''") + "' ";
        //        objDataService.executeNonQuery(strSQL);


        //        strSQL = "INSERT INTO VMX_ROP_PLOT_FORMAT (WELL_ID,USER_NAME,MAIN_POINT_STYLE,MAIN_POINT_SIZE,MAIN_POINT_COLOR_R,MAIN_POINT_COLOR_S,OFFSET_POINT_STYLE,OFFSET_POINT_SIZE,OFFSET_POINT_COLOR_R,OFFSET_POINT_COLOR_S,AXIS_FONT_NAME,AXIS_FONT_SIZE,AXIS_FONT_BOLD,AXIS_FONT_ITALIC,AXIS_FONT_UNDERLINE,STAT_FONT_NAME,STAT_FONT_SIZE,STAT_FONT_BOLD,STAT_FONT_ITALIC,STAT_FONT_UNDERLINE,SHOW_OFFSET) VALUES(";
        //        strSQL += "'" + WellID + "',";
        //        strSQL += "'" + paramExtID.Replace("'", "''") + "',";
        //        strSQL += "" + ROP_MainPointStyle.ToString() + ",";
        //        strSQL += "" + ROP_MainPointSize.ToString() + ",";
        //        strSQL += "" + ROP_MainPointColorRotary.ToArgb.ToString + ",";
        //        strSQL += "" + ROP_MainPointColorSlide.ToArgb.ToString + ",";
        //        strSQL += "" + ROP_OffsetPointStyle.ToString() + ",";
        //        strSQL += "" + ROP_OffsetPointSize.ToString() + ",";
        //        strSQL += "" + ROP_OffsetPointColorRotary.ToArgb.ToString + ",";
        //        strSQL += "" + ROP_OffsetPointColorSlide.ToArgb.ToString + ",";
        //        strSQL += "'" + ROP_AxisFontName.Replace("'", "''") + "',";
        //        strSQL += "" + ROP_AxisFontSize.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_AxisFontBold == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_AxisFontItalic == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_AxisFontUnderline == true, 1, 0).ToString() + ",";
        //        strSQL += "'" + ROP_StatFontName.Replace("'", "''") + "',";
        //        strSQL += "" + ROP_StatFontSize.ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_StatFontBold == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_StatFontItalic == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_StatFontUnderline == true, 1, 0).ToString() + ",";
        //        strSQL += "" + Interaction.IIf(ROP_ShowOffset == true, 1, 0).ToString() + ")";

        //        if (objDataService.executeNonQuery(strSQL))
        //        {
        //        }
        //        else
        //            MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);


        //        strSQL = "DELETE FROM VMX_USER_DATA_SELECTION_LOGS WHERE USER_NAME='" + paramExtID.Replace("'", "''") + "' AND PLOT_ID='" + paramPlotID + "' ";
        //        objDataService.executeNonQuery(strSQL);

        //        foreach (LogInfo objLogInfo in timeLogs.Values)
        //        {
        //            strSQL = "INSERT INTO VMX_USER_DATA_SELECTION_LOGS (WELL_ID,USER_NAME,PLOT_ID,WELLBORE_ID,LOG_ID) VALUES(";
        //            strSQL += "'" + objLogInfo.WellID.Replace("'", "''") + "',";
        //            strSQL += "'" + paramExtID.Replace("'", "''") + "',";
        //            strSQL += "'" + paramPlotID.Replace("'", "''") + "',";
        //            strSQL += "'" + objLogInfo.WellboreID.Replace("'", "''") + "',";
        //            strSQL += "'" + objLogInfo.LogID.Replace("'", "''") + "')";

        //            if (objDataService.executeNonQuery(strSQL))
        //            {
        //            }
        //            else
        //            {
        //                MsgBox("Error saving session to the database " + objDataService.LastError, MsgBoxStyle.Critical, SYSTEM_TITLE);
        //                break;
        //            }
        //        }
        //    }

        //    catch (Exception ex)
        //    {
        //    }
        //}





        public void loadDataSelection( string paramPlotID)
        {
            try
            {
                       DataTable objData = objRequest.objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + this.objRequest.objDataService.UserName + "' AND PLOT_ID='" + paramPlotID + "'");


                if (objData.Rows.Count > 0)
                {
                    selectionType = (sPlotSelectionType)Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SELECTION_TYPE"], 0));
                    LastHours = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["HOURS"], 0));
                    FromDate = (DateTime)DataService.checkNull(objData.Rows[0]["FROM_DATE"], DateTime.Now);
                    ToDate = (DateTime)DataService.checkNull(objData.Rows[0]["TO_DATE"], DateTime.Now);
                    FromDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["FROM_DEPTH"], 0));
                    ToDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["TO_DEPTH"], ""));
                    sideTrackKey = (string)DataService.checkNull(objData.Rows[0]["SIDE_TRACK_ID"], "");

                    NoOfDataPoints = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["DATA_POINTS"], 0));

                    FilterGTF = Convert.ToBoolean(DataService.checkNull(objData.Rows[0]["FILTER_GTF"], 0));
                    GTFFromDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["GTF_DEPTH_FROM"], 0));
                    GTFToDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["GTF_DEPTH_TO"], 0));

                    FilterMTF = Convert.ToBoolean(DataService.checkNull(objData.Rows[0]["FILTER_MTF"], 0));
                    MTFFromDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MTF_DEPTH_FROM"], 0));
                    MTFToDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MTF_DEPTH_TO"], 0));

                    RunNo = (string)DataService.checkNull(objData.Rows[0]["RUN_NO"], "");
                    PreparedBy = (string)DataService.checkNull(objData.Rows[0]["PREPARED_BY"], "");

                    StandPlot_ShowOffset = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["STND_SHOW_OFFSET"], 0)) == 1, true, false);
                    StandPlot_ComparisonWindow = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["COMP_WINDOW"], 0));


                    try
                    {
                        string strTopList = (string)DataService.checkNull(objData.Rows[0]["TOP_LIST"], "");


                        if (strTopList.Trim() != "")
                        {
                            string[] arrTops = strTopList.Split(',');

                            topList.Clear();

                            for (int i = 0; i <= arrTops.Length - 1; i++)
                            {
                                if (!topList.ContainsKey(arrTops[i]))
                                    topList.Add(arrTops[i], arrTops[i]);
                            }
                        }
                    }

                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        TrackWidth = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["TRACK_WIDTH"], 200));
                        ShowFormationTops = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SHOW_FORMATION_TOPS"], 0)) == 1, true, false);
                        ScrollIncrement = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["SCROLL_INC"], 100));
                        DepthLogID = (string)DataService.checkNull(objData.Rows[0]["DEPTH_LOG_ID"], "");
                    }
                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        DrlgBenchmark = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DRLG_BM"], 0));


                        DrlgBSBenchmark = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DRLG_BM_BS"], 0));
                        DrlgSSBenchmark = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DRLG_BM_SS"], 0));
                        DrlgSBBenchmark = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DRLG_BM_SB"], 0));

                        TripBenchmark = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["TRIP_BM"], 0));

                        TargetTime = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["TRG_DRLG_CONN_TIME"], 0));
                        RigCost = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["RIG_COST"], 0));
                    }
                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        MatchDepthByFormationTops = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MATCH_DEPTH"], 0)) == 1, true, false);
                    }
                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        ShowMainRotarySmoothCurve = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["ROT_SMTH"], 0)) == 1, true, false);
                        ShowMainSlideSmoothCurve = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SLD_SMTH"], 0)) == 1, true, false);
                        ShowOffsetRotarySmoothCurve = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["O_ROT_SMTH"], 0)) == 1, true, false);
                        ShowOffsetSlideSmoothCurve = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["O_SLD_SMTH"], 0)) == 1, true, false);

                        MainRotarySmoothColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["ROT_SMTH_COLOR"], 0)));
                        MainSlideSmoothColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SLD_SMTH_COLOR"], 0)));
                        OffsetRotarySmoothColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["O_ROT_SMTH_COLOR"], 0)));
                        OffsetSlideSmoothColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["O_SLD_SMTH_COLOR"], 0)));
                    }
                    catch (Exception ex)
                    {
                    }

                    try
                    {
                        AvgPoints = Convert.ToInt32( DataService.checkNull(objData.Rows[0]["AVG_POINTS"], 0));
                    }
                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        FracPointStyle = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["FR_POINT_STYLE"], 0));
                        FracPointSize = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["FR_POINT_SIZE"], 0));
                        FracPointColor = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["FR_POINT_COLOR"], 0))));

                        FracWellboreID = (string)DataService.checkNull(objData.Rows[0]["FR_WELLBORE_ID"], "");
                        FracLogID = (string)DataService.checkNull(objData.Rows[0]["FR_LOG_ID"], "");
                        FracMnemonic = (string)DataService.checkNull(objData.Rows[0]["FR_MNEMONIC"], "");
                    }
                    catch (Exception ex)
                    {
                    }

                    try
                    {
                        GTFVector = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["GTF_VECTOR"], 0)) == 1, true, false);
                        MTFVector = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MTF_VECTOR"], 0)) == 1, true, false);
                    }
                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        FracClosurePressure = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["FR_CL_PRESS"], 0));
                        FluidType = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["FR_FL_TYPE"], 0));
                    }
                    catch (Exception ex)
                    {
                    }


                    trajList.Clear();

                    string strTrajList = (string)DataService.checkNull(objData.Rows[0]["TRAJ_LIST"], "");

                    if (strTrajList.Trim() != "")
                    {
                        string[] arrKey = strTrajList.Split(',');

                        for (int i = 0; i <= arrKey.Length - 1; i++)
                        {
                            if (!trajList.ContainsKey(arrKey[i]))
                                trajList.Add(arrKey[i], arrKey[i]);
                        }
                    }

                    filterConditions.Clear();

                    objData = objRequest.objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION_FILTERS WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + this.objRequest.objDataService.UserName + "' AND PLOT_ID='" + paramPlotID + "'");

                    foreach (DataRow objRow in objData.Rows)
                    {
                        TFAdnlFilter objItem = new TFAdnlFilter();
                        objItem.FilterID = Convert.ToInt32( DataService.checkNull(objRow["FILTER_ID"], 0));
                        objItem.Mnemonic = (string)DataService.checkNull(objRow["MNEMONIC"], "");
                        objItem.JoinOperator = (string)DataService.checkNull(objRow["JOIN_OPERATOR"], "");
                        objItem.Value = (string)DataService.checkNull(objRow["VALUE"], 0);

                        if (!filterConditions.ContainsKey(objItem.FilterID))
                            filterConditions.Add(objItem.FilterID, objItem.getCopy());
                    }

                    offsetWells.Clear();

                    objData = objRequest.objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION_OFFSET WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + this.objRequest.objDataService.UserName + "' AND PLOT_ID='" + paramPlotID + "'");

                    foreach (DataRow objRow in objData.Rows)
                    {
                        string strWellID = (string)DataService.checkNull(objRow["OFFSET_WELL_ID"], "");

                        if (!offsetWells.ContainsKey(strWellID))
                        {
                            LogCorOffsetWellInfo objOffset = new LogCorOffsetWellInfo();
                            objOffset.OffsetWellID = strWellID;
                            objOffset.DepthLogID = (string)DataService.checkNull(objRow["DEPTH_LOG_ID"], "");
                            objOffset.DepthOffset = Convert.ToDouble(DataService.checkNull(objRow["OFFSET_DEPTH"], 0));
                            objOffset.ShortName = (string)DataService.checkNull(objRow["SHORT_NAME"], "");

                            offsetWells.Add(strWellID, objOffset);
                        }
                    }


                    logCurves.Clear();

                    objData = objRequest.objDataService.getTable("SELECT * FROM VMX_LOG_COR_CURVES WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + this.objRequest.objDataService.UserName + "' ");

                    foreach (DataRow objRow in objData.Rows)
                    {
                        LogCorCurve objCurve = new LogCorCurve();
                        objCurve.EntryID = (string)DataService.checkNull(objRow["ENTRY_ID"], "");
                        objCurve.Mnemonic = (string)DataService.checkNull(objRow["MNEMONIC"], "");
                        objCurve.Name = (string)DataService.checkNull(objRow["NAME"], "");
                        objCurve.LineColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["LINE_COLOR"], 0)));
                        objCurve.LineStyle = Convert.ToInt32(DataService.checkNull(objRow["LINE_STYLE"], 0));
                        objCurve.LineWidth = Convert.ToInt32(DataService.checkNull(objRow["LINE_WIDTH"], 0));
                        objCurve.InverseScale = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["INVERSE_SCALE"], 0)) == 1, true, false);
                        objCurve.AutoScale = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["AUTO_SCALE"], 0)) == 1, true, false);
                        objCurve.MinValue = Convert.ToDouble(DataService.checkNull(objRow["MIN_VALUE"], 0));
                        objCurve.MaxValue = Convert.ToDouble(DataService.checkNull(objRow["MAX_VALUE"], 0));
                        objCurve.Visible = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["VISIBLE"], 0)) == 1, true, false);
                        objCurve.IgnoreNegative = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["IGNORE_NEGATIVE"], 0)) == 1, true, false);
                        objCurve.Color1 = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR1"], "Orange")));
                        objCurve.Color2 = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR2"], "Orange")));
                        objCurve.Color3 = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR3"], "Orange")));
                        objCurve.Color4 = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR4"], "Orange")));
                        objCurve.Color5 = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR5"], "Orange")));
                        objCurve.DisplayOrder = Convert.ToInt32(DataService.checkNull(objRow["DISPLAY_ORDER"], "Orange"));

                        if (!logCurves.ContainsKey(objCurve.Mnemonic))
                            logCurves.Add(objCurve.Mnemonic, objCurve);
                    }


                    topComparisionCurve = new LogCorCurve();

                    objData = objRequest.objDataService.getTable("SELECT * FROM VMX_LOG_COR_CURVE_OFFSET WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + objRequest.objDataService.UserName + "' ");

                    if (objData.Rows.Count > 0)
                    {
                        DataRow objRow = objData.Rows[0];

                        {
                            LogCorCurve withBlock = topComparisionCurve;
                            withBlock.Mnemonic = (string)DataService.checkNull(objRow["MNEMONIC"], "");
                            withBlock.Name = (string)DataService.checkNull(objRow["NAME"], "");
                            withBlock.LineColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["LINE_COLOR"], 0)));
                            withBlock.LineStyle = Convert.ToInt32(DataService.checkNull(objRow["LINE_STYLE"], 0));
                            withBlock.LineWidth = Convert.ToInt32(DataService.checkNull(objRow["LINE_WIDTH"], 0));
                            withBlock.InverseScale = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["INVERSE_SCALE"], 0)) == 1, true, false);
                            withBlock.AutoScale = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["AUTO_SCALE"], 0)) == 1, true, false);
                            withBlock.MinValue = Convert.ToDouble(DataService.checkNull(objRow["MIN_VALUE"], 0));
                            withBlock.MaxValue = Convert.ToDouble(DataService.checkNull(objRow["MAX_VALUE"], 0));
                            withBlock.Visible = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["VISIBLE"], 0)) == 1, true, false);
                            withBlock.IgnoreNegative = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["IGNORE_NEGATIVE"], 0)) == 1, true, false);
                        }
                    }


                    // ///Put Defaults for ROP Plot here ...

                    ROP_MainPointStyle = 7;
                    ROP_MainPointSize = 4;
                    ROP_MainPointColorRotary = ColorTranslator.ToHtml(Color.Blue);
                    ROP_MainPointColorSlide = ColorTranslator.ToHtml(Color.Red);

                    ROP_OffsetPointStyle = 1;
                    ROP_OffsetPointSize = 4;
                    ROP_OffsetPointColorRotary = ColorTranslator.ToHtml(Color.Green);
                    ROP_OffsetPointColorSlide = ColorTranslator.ToHtml(Color.Brown);


                    ROP_AxisFontName = "Arial";
                    ROP_AxisFontSize = 10;
                    ROP_AxisFontBold = false;
                    ROP_AxisFontItalic = false;
                    ROP_AxisFontUnderline = false;

                    ROP_StatFontName = "Arial";
                    ROP_StatFontSize = 10;
                    ROP_StatFontBold = false;
                    ROP_StatFontItalic = false;
                    ROP_StatFontUnderline = false;

                    ROP_ShowOffset = false;


                    objData = objRequest.objDataService.getTable("SELECT * FROM VMX_ROP_PLOT_FORMAT WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + this.objRequest.objDataService.UserName + "'");

                    if (objData.Rows.Count > 0)
                    {
                        ROP_MainPointStyle = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MAIN_POINT_STYLE"], 0));
                        ROP_MainPointSize = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MAIN_POINT_SIZE"], 0));
                        ROP_MainPointColorRotary = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MAIN_POINT_COLOR_R"], 0))));
                        ROP_MainPointColorSlide = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MAIN_POINT_COLOR_S"], 0))));


                        ROP_OffsetPointStyle = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["OFFSET_POINT_STYLE"], 0));
                        ROP_OffsetPointSize = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["OFFSET_POINT_SIZE"], 0));
                        ROP_OffsetPointColorRotary = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["OFFSET_POINT_COLOR_R"], 0))));
                        ROP_OffsetPointColorSlide = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["OFFSET_POINT_COLOR_S"], 0))));

                        ROP_AxisFontName = (string)DataService.checkNull(objData.Rows[0]["AXIS_FONT_NAME"], "Arial");
                        ROP_AxisFontSize = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["AXIS_FONT_SIZE"], 10));
                        ROP_AxisFontBold = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["AXIS_FONT_BOLD"], 0)) == 1, true, false);
                        ROP_AxisFontItalic = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["AXIS_FONT_ITALIC"], 0)) == 1, true, false);
                        ROP_AxisFontUnderline = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["AXIS_FONT_UNDERLINE"], 0)) == 1, true, false);

                        ROP_StatFontName = (string)DataService.checkNull(objData.Rows[0]["STAT_FONT_NAME"], "Arial");
                        ROP_StatFontSize = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["STAT_FONT_SIZE"], 10));
                        ROP_StatFontBold = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["STAT_FONT_BOLD"], 0)) == 1, true, false);
                        ROP_StatFontItalic = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["STAT_FONT_ITALIC"], 0)) == 1, true, false);
                        ROP_StatFontUnderline = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["STAT_FONT_UNDERLINE"], 0)) == 1, true, false);

                        ROP_ShowOffset = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SHOW_OFFSET"], 0)) == 1, true, false);
                    }
                }



                //prath offsetwell wip 10-Jan-2021
                offsetWells.Clear();
                if (showOffsetWell)
                {

                
                objData = objRequest.objDataService.getTable("SELECT * FROM VMX_WELL_OFFSET WHERE WELL_ID='" + WellID + "'");

                foreach (DataRow objRow in objData.Rows)
                {
                    string strWellID = (string)DataService.checkNull(objRow["OFFSET_WELL_ID"], "");

                    if (!offsetWells.ContainsKey(strWellID))
                    {
                        LogCorOffsetWellInfo objOffset = new LogCorOffsetWellInfo();
                        objOffset.OffsetWellID = strWellID;
                        //objOffset.DepthLogID = (string)DataService.checkNull(objRow["DEPTH_LOG_ID"], "");
                        //objOffset.DepthOffset = Convert.ToDouble(DataService.checkNull(objRow["OFFSET_DEPTH"], 0));
                        //objOffset.ShortName = (string)DataService.checkNull(objRow["SHORT_NAME"], "");

                        offsetWells.Add(strWellID, objOffset);
                    }
                }
                }
                //============================
                timeLogs.Clear();

                objData = objRequest.objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION_LOGS WHERE PLOT_ID='" + paramPlotID + "' AND USER_NAME='" + this.objRequest.objDataService.UserName.Replace("'", "''") + "'");

                foreach (DataRow objRow in objData.Rows)
                {
                    LogInfo objLogInfo = new LogInfo();
                    objLogInfo.WellID = (string)DataService.checkNull(objRow["WELL_ID"], "");
                    objLogInfo.WellboreID = (string)DataService.checkNull(objRow["WELLBORE_ID"], "");
                    objLogInfo.LogID = (string)DataService.checkNull(objRow["LOG_ID"], "");

                    timeLogs.Add((timeLogs.Count + 1).ToString(), objLogInfo);
                }
            }
            catch (Exception ex)
            {
            }
        }

        public Color getRandomColorName()
        {
            try
            {
                Random randomGen = new Random();
                KnownColor[] names = (KnownColor[])Enum.GetValues(typeof(KnownColor));
                KnownColor randomColorName = names[randomGen.Next(names.Length)];
                Color randomColor = Color.FromKnownColor(randomColorName);

                return randomColor;
            }
            catch (Exception ex)
            {

                return Color.Black;
            }
        }
        public bool isDataSelectionExist(string paramPlotID, string paramExtID)
        {
            try
            {
                DataTable objData = objRequest.objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID + "' AND PLOT_ID='" + paramPlotID + "'");

                if (objData.Rows.Count > 0)
                    return true;
                else
                    return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }


        public bool isDataSelectionExist(string paramPlotID)
        {
            try
            {
                DataTable objData = objRequest.objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION WHERE WELL_ID='" + WellID + "' AND PLOT_ID='" + paramPlotID + "'");

                if (objData.Rows.Count > 0)
                    return true;
                else
                    return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public void loadDataSelection(string paramPlotID, string paramExtID)
        {
            try
            {
                DataTable objData = objRequest.objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID + "' AND PLOT_ID='" + paramPlotID + "'");

                if (objData.Rows.Count > 0)
                {
                    selectionType = (sPlotSelectionType)DataService.checkNull(objData.Rows[0]["SELECTION_TYPE"], 0);
                    LastHours = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["HOURS"], 0));
                    FromDate = (DateTime)DataService.checkNull(objData.Rows[0]["FROM_DATE"], DateTime.Now);
                    ToDate = (DateTime)DataService.checkNull(objData.Rows[0]["TO_DATE"], DateTime.Now);
                    FromDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["FROM_DEPTH"], 0));
                    ToDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["TO_DEPTH"], 0));
                    sideTrackKey = (string)DataService.checkNull(objData.Rows[0]["SIDE_TRACK_ID"], 0);

                    NoOfDataPoints = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["DATA_POINTS"], 0));

                    FilterGTF = Convert.ToBoolean(DataService.checkNull(objData.Rows[0]["FILTER_GTF"], 0));
                    GTFFromDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["GTF_DEPTH_FROM"], 0));
                    GTFToDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["GTF_DEPTH_TO"], 0));

                    FilterMTF = (bool)DataService.checkNull(objData.Rows[0]["FILTER_MTF"], 0);
                    MTFFromDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MTF_DEPTH_FROM"], 0));
                    MTFToDepth = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MTF_DEPTH_TO"], 0));

                    RunNo = (string)DataService.checkNull(objData.Rows[0]["RUN_NO"], "");
                    PreparedBy = (string)DataService.checkNull(objData.Rows[0]["PREPARED_BY"], "");

                    StandPlot_ShowOffset = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["STND_SHOW_OFFSET"], 0)) == 1, true, false);
                    StandPlot_ComparisonWindow = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["COMP_WINDOW"], 0));

                    try
                    {
                        string strTopList = (string)DataService.checkNull(objData.Rows[0]["TOP_LIST"], "");


                        if (strTopList.Trim() != "")
                        {
                            string[] arrTops = strTopList.Split(',');

                            topList.Clear();

                            for (int i = 0; i <= arrTops.Length - 1; i++)
                            {
                                if (!topList.ContainsKey(arrTops[i]))
                                    topList.Add(arrTops[i], arrTops[i]);
                            }
                        }
                    }

                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        TrackWidth = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["TRACK_WIDTH"], 200));
                        ShowFormationTops = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SHOW_FORMATION_TOPS"], 0)) == 1, true, false);
                        ScrollIncrement = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["SCROLL_INC"], 100));
                        DepthLogID = (string)DataService.checkNull(objData.Rows[0]["DEPTH_LOG_ID"], "");
                    }
                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        DrlgBenchmark = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DRLG_BM"], 0));



                        DrlgBSBenchmark = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DRLG_BM_BS"], 0));
                        DrlgSSBenchmark = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DRLG_BM_SS"], 0));
                        DrlgSBBenchmark = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["DRLG_BM_SB"], 0));

                        TripBenchmark = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["TRIP_BM"], 0));

                        TargetTime = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["TRG_DRLG_CONN_TIME"], 0));
                        RigCost = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["RIG_COST"], 0));
                    }
                    catch (Exception ex)
                    {
                    }
                    

                    try
                    {
                        MatchDepthByFormationTops = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MATCH_DEPTH"], 0)) == 1, true, false);
                    }
                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        ShowMainRotarySmoothCurve = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["ROT_SMTH"], 0)) == 1, true, false);
                        ShowMainSlideSmoothCurve = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SLD_SMTH"], 0)) == 1, true, false);
                        ShowOffsetRotarySmoothCurve = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["O_ROT_SMTH"], 0)) == 1, true, false);
                        ShowOffsetSlideSmoothCurve = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["O_SLD_SMTH"], 0)) == 1, true, false);

                        MainRotarySmoothColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["ROT_SMTH_COLOR"], 0)));
                        MainSlideSmoothColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SLD_SMTH_COLOR"], 0)));
                        OffsetRotarySmoothColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["O_ROT_SMTH_COLOR"], 0)));
                        OffsetSlideSmoothColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["O_SLD_SMTH_COLOR"], 0)));
                    }
                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        AvgPoints = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["AVG_POINTS"], 0));
                    }
                    catch (Exception ex)
                    {
                    }

                    try
                    {
                        FracPointStyle = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["FR_POINT_STYLE"], 0));
                        FracPointSize = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["FR_POINT_SIZE"], 0));
                        FracPointColor = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["FR_POINT_COLOR"], 0))));

                        FracWellboreID = (string)DataService.checkNull(objData.Rows[0]["FR_WELLBORE_ID"], "");
                        FracLogID = (string)DataService.checkNull(objData.Rows[0]["FR_LOG_ID"], "");
                        FracMnemonic = (string)DataService.checkNull(objData.Rows[0]["FR_MNEMONIC"], "");
                    }
                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        GTFVector = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["GTF_VECTOR"], 0)) == 1, true, false);
                        MTFVector = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MTF_VECTOR"], 0)) == 1, true, false);
                    }
                    catch (Exception ex)
                    {
                    }


                    try
                    {
                        FracClosurePressure = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["FR_CL_PRESS"], 0));
                        FluidType = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["FR_FL_TYPE"], 0));
                    }
                    catch (Exception ex)
                    {
                    }


                    trajList.Clear();

                    string strTrajList = (string)DataService.checkNull(objData.Rows[0]["TRAJ_LIST"], "");

                    if (strTrajList.Trim() != "")
                    {
                        string[] arrKey = strTrajList.Split(',');

                        for (int i = 0; i <= arrKey.Length - 1; i++)
                        {
                            if (!trajList.ContainsKey(arrKey[i]))
                                trajList.Add(arrKey[i], arrKey[i]);
                        }
                    }

                    filterConditions.Clear();

                    objData = objRequest.objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION_FILTERS WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID + "' AND PLOT_ID='" + paramPlotID + "'");

                    foreach (DataRow objRow in objData.Rows)
                    {
                        TFAdnlFilter objItem = new TFAdnlFilter();
                        objItem.FilterID = Convert.ToInt32(DataService.checkNull(objRow["FILTER_ID"], 0));
                        objItem.Mnemonic = (string)DataService.checkNull(objRow["MNEMONIC"], "");
                        objItem.JoinOperator = (string)DataService.checkNull(objRow["JOIN_OPERATOR"], "");
                        objItem.Value = (string)DataService.checkNull(objRow["VALUE"], 0);

                        if (!filterConditions.ContainsKey(objItem.FilterID))
                            filterConditions.Add(objItem.FilterID, objItem.getCopy());
                    }

                    offsetWells.Clear();

                    objData = objRequest.objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION_OFFSET WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID + "' AND PLOT_ID='" + paramPlotID + "'");

                    foreach (DataRow objRow in objData.Rows)
                    {
                        string strWellID = (string)DataService.checkNull(objRow["OFFSET_WELL_ID"], "");

                        if (!offsetWells.ContainsKey(strWellID))
                        {
                            LogCorOffsetWellInfo objOffset = new LogCorOffsetWellInfo();
                            objOffset.OffsetWellID = strWellID;
                            objOffset.DepthLogID = (string)DataService.checkNull(objRow["DEPTH_LOG_ID"], "");
                            objOffset.DepthOffset = Convert.ToDouble(DataService.checkNull(objRow["OFFSET_DEPTH"], 0));
                            objOffset.ShortName = (string)DataService.checkNull(objRow["SHORT_NAME"], "");

                            offsetWells.Add(strWellID, objOffset);
                        }
                    }


                    logCurves.Clear();

                    objData = objRequest.objDataService.getTable("SELECT * FROM VMX_LOG_COR_CURVES WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID + "' ");

                    foreach (DataRow objRow in objData.Rows)
                    {
                        LogCorCurve objCurve = new LogCorCurve();
                        objCurve.EntryID = (string)DataService.checkNull(objRow["ENTRY_ID"], "");
                        objCurve.Mnemonic = (string)DataService.checkNull(objRow["MNEMONIC"], "");
                        objCurve.Name = (string)DataService.checkNull(objRow["NAME"], "");
                        objCurve.LineColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["LINE_COLOR"], 0)));
                        objCurve.LineStyle = Convert.ToInt32(DataService.checkNull(objRow["LINE_STYLE"], 0));
                        objCurve.LineWidth = Convert.ToInt32(DataService.checkNull(objRow["LINE_WIDTH"], 0));
                        objCurve.InverseScale = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["INVERSE_SCALE"], 0)) == 1, true, false);
                        objCurve.AutoScale = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["AUTO_SCALE"], 0)) == 1, true, false);
                        objCurve.MinValue = Convert.ToDouble(DataService.checkNull(objRow["MIN_VALUE"], 0));
                        objCurve.MaxValue = Convert.ToDouble(DataService.checkNull(objRow["MAX_VALUE"], 0));
                        objCurve.Visible = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["VISIBLE"], 0)) == 1, true, false);
                        objCurve.IgnoreNegative = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["IGNORE_NEGATIVE"], 0)) == 1, true, false);
                        objCurve.Color1 = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR1"], getRandomColorName().ToString())));
                        objCurve.Color2 = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR2"], getRandomColorName().ToString())));
                        objCurve.Color3 = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR3"], getRandomColorName().ToString())));
                        objCurve.Color4 = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR4"], getRandomColorName().ToString())));
                        objCurve.Color5 = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR5"], getRandomColorName().ToString())));
                        objCurve.DisplayOrder = Convert.ToInt32(DataService.checkNull(objRow["DISPLAY_ORDER"], 0));

                        if (!logCurves.ContainsKey(objCurve.Mnemonic))
                            logCurves.Add(objCurve.Mnemonic, objCurve);
                    }


                    topComparisionCurve = new LogCorCurve();

                    objData =objRequest.objDataService.getTable("SELECT * FROM VMX_LOG_COR_CURVE_OFFSET WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID + "' ");

                    if (objData.Rows.Count > 0)
                    {
                        DataRow objRow = objData.Rows[0];

                        {
                            LogCorCurve withBlock = topComparisionCurve;
                            withBlock.Mnemonic = (string)DataService.checkNull(objRow["MNEMONIC"], "");
                            withBlock.Name = (string)DataService.checkNull(objRow["NAME"], "");
                            withBlock.LineColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["LINE_COLOR"], 0)));
                            withBlock.LineStyle = Convert.ToInt32(DataService.checkNull(objRow["LINE_STYLE"], 0));
                            withBlock.LineWidth = Convert.ToInt32(DataService.checkNull(objRow["LINE_WIDTH"], 0));
                            withBlock.InverseScale = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["INVERSE_SCALE"], 0)) == 1, true, false);
                            withBlock.AutoScale = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["AUTO_SCALE"], 0)) == 1, true, false);
                            withBlock.MinValue = Convert.ToDouble(DataService.checkNull(objRow["MIN_VALUE"], 0));
                            withBlock.MaxValue = Convert.ToDouble(DataService.checkNull(objRow["MAX_VALUE"], 0));
                            withBlock.Visible = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["VISIBLE"], 0)) == 1, true, false);
                            withBlock.IgnoreNegative = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["IGNORE_NEGATIVE"], 0)) == 1, true, false);
                        }
                    }


                    // ///Put Defaults for ROP Plot here ...

                    ROP_MainPointStyle = 7;
                    ROP_MainPointSize = 4;
                    ROP_MainPointColorRotary = ColorTranslator.ToHtml(Color.Blue);
                    ROP_MainPointColorSlide = ColorTranslator.ToHtml(Color.Red);

                    ROP_OffsetPointStyle = 1;
                    ROP_OffsetPointSize = 4;
                    ROP_OffsetPointColorRotary = ColorTranslator.ToHtml(Color.Green);
                    ROP_OffsetPointColorSlide = ColorTranslator.ToHtml(Color.Brown);


                    ROP_AxisFontName = "Arial";
                    ROP_AxisFontSize = 10;
                    ROP_AxisFontBold = false;
                    ROP_AxisFontItalic = false;
                    ROP_AxisFontUnderline = false;

                    ROP_StatFontName = "Arial";
                    ROP_StatFontSize = 10;
                    ROP_StatFontBold = false;
                    ROP_StatFontItalic = false;
                    ROP_StatFontUnderline = false;

                    ROP_ShowOffset = false;


                    objData =objRequest.objDataService.getTable("SELECT * FROM VMX_ROP_PLOT_FORMAT WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + paramExtID + "'");

                    if (objData.Rows.Count > 0)
                    {
                        ROP_MainPointStyle = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MAIN_POINT_STYLE"], 0));
                        ROP_MainPointSize = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MAIN_POINT_SIZE"], 0));
                        ROP_MainPointColorRotary = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MAIN_POINT_COLOR_R"], 0))));
                        ROP_MainPointColorSlide = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MAIN_POINT_COLOR_S"], 0))));


                        ROP_OffsetPointStyle = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["OFFSET_POINT_STYLE"], 0));
                        ROP_OffsetPointSize = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["OFFSET_POINT_SIZE"], 0));
                        ROP_OffsetPointColorRotary = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["OFFSET_POINT_COLOR_R"], 0))));
                        ROP_OffsetPointColorSlide = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["OFFSET_POINT_COLOR_S"], 0))));

                        ROP_AxisFontName = (string)DataService.checkNull(objData.Rows[0]["AXIS_FONT_NAME"], "Arial");
                        ROP_AxisFontSize = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["AXIS_FONT_SIZE"], 10));
                        ROP_AxisFontBold = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["AXIS_FONT_BOLD"], 0)) == 1, true, false);
                        ROP_AxisFontItalic = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["AXIS_FONT_ITALIC"], 0)) == 1, true, false);
                        ROP_AxisFontUnderline = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["AXIS_FONT_UNDERLINE"], 0)) == 1, true, false);

                        ROP_StatFontName = (string)DataService.checkNull(objData.Rows[0]["STAT_FONT_NAME"], "Arial");
                        ROP_StatFontSize = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["STAT_FONT_SIZE"], 10));
                        ROP_StatFontBold = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["STAT_FONT_BOLD"], 0)) == 1, true, false);
                        ROP_StatFontItalic = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["STAT_FONT_ITALIC"], 0)) == 1, true, false);
                        ROP_StatFontUnderline = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["STAT_FONT_UNDERLINE"], 0)) == 1, true, false);

                        ROP_ShowOffset = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SHOW_OFFSET"], 0)) == 1, true, false);
                    }
                }


                timeLogs.Clear();

                objData = objRequest.objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION_LOGS WHERE PLOT_ID='" + paramPlotID + "' AND USER_NAME='" + paramExtID.Replace("'", "''") + "'");

                foreach (DataRow objRow in objData.Rows)
                {
                    LogInfo objLogInfo = new LogInfo();
                    objLogInfo.WellID = (string)DataService.checkNull(objRow["WELL_ID"], "");
                    objLogInfo.WellboreID = (string)DataService.checkNull(objRow["WELLBORE_ID"], "");
                    objLogInfo.LogID = (string)DataService.checkNull(objRow["LOG_ID"], "");

                    timeLogs.Add((timeLogs.Count + 1).ToString(), objLogInfo);
                }
            }
            catch (Exception ex)
            {
            }
        }


        //public bool getRange(ref DateTime paramFromDate, ref DateTime paramToDate, ref double paramFromDepth, ref double paramToDepth, ref string paramTitle)
        //{
        //    try
        //    {
        //        objTimeLog = objProject.getPrimaryTimeLog();

        //        if (selectionType == sPlotSelectionType.FormationTops)
        //        {
        //            double lastIndex = objTimeLog.getLastIndexOptimized(objDataService);

        //            paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));
        //            paramFromDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(objDataService));

        //            string strTopList = getTopsList();

        //            paramTitle = objWell.name + "  -  Toolface Evaluation (" + strTopList + ")";

        //            getTopsDepthRange(ref paramFromDepth, ref paramToDepth);
        //        }

        //        if (selectionType == sPlotSelectionType.ByHours)
        //        {
        //            double lastIndex = objTimeLog.getLastIndexOptimized(objDataService);

        //            paramToDate = DateTime.FromOADate(lastIndex);
        //            paramFromDate = paramToDate.AddHours(-1 * ValEx(LastHours));

        //            paramTitle = objWell.name + "  -  Toolface Evaluation (Last " + ValEx(LastHours).ToString + " Hours)";

        //            paramFromDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, paramFromDate.ToOADate());
        //            paramToDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, paramToDate.ToOADate());
        //        }

        //        if (selectionType == sPlotSelectionType.DateRange)
        //        {
        //            if (objWell.wellDateFormat == Well.wDateFormatUTC)
        //            {
        //                paramFromDate = utilFunctions.convertWellTimeZoneToUTC(FromDate);
        //                paramToDate = utilFunctions.convertWellTimeZoneToUTC(ToDate);
        //            }
        //            else
        //            {
        //                paramFromDate = utilFunctions.convertWellToLocalTimeZone(FromDate);
        //                paramToDate = utilFunctions.convertWellToLocalTimeZone(ToDate);
        //            }

        //            paramFromDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, paramFromDate.ToOADate());
        //            paramToDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, paramToDate.ToOADate());

        //            paramTitle = objWell.name + "  -  Toolface Evaluation (From Date: " + FromDate.ToString("MMM-dd-yyyy HH:mm:ss:") + " to " + ToDate.ToString("MMM-dd-yyyy HH:mm:ss") + ")";
        //        }


        //        if (selectionType == sPlotSelectionType.FromDateOnwards)
        //        {
        //            if (objWell.wellDateFormat == Well.wDateFormatUTC)
        //            {
        //                paramFromDate = utilFunctions.convertWellTimeZoneToUTC(FromDate);
        //                paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));
        //            }
        //            else
        //            {
        //                paramFromDate = utilFunctions.convertWellToLocalTimeZone(FromDate);
        //                paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));
        //            }

        //            paramFromDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, FromDate.ToOADate());
        //            paramToDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, ToDate.ToOADate());


        //            DateTime localToDate;

        //            if (objWell.wellDateFormat == Well.wDateFormatUTC)
        //                localToDate = utilFunctions.convertUTCToWellTimeZone(DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService)));
        //            else
        //                localToDate = utilFunctions.convertWellToLocalTimeZone(DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService)));

        //            paramTitle = objWell.name + "  -  Toolface Evaluation (From Date: " + FromDate.ToString("MMM-dd-yyyy HH:mm:ss:") + " to " + localToDate.ToString("MMM-dd-yyyy HH:mm:ss") + ")";
        //        }


        //        if (selectionType == sPlotSelectionType.DepthRange)
        //        {
        //            paramTitle = objWell.name + "  -  Toolface Evaluation (From Depth: " + ValEx(FromDepth).ToString + " to " + ValEx(ToDepth).ToString + ")";

        //            paramFromDepth = FromDepth;
        //            paramToDepth = ToDepth;

        //            DateTime limitFromDate;
        //            DateTime limitToDate;

        //            getDateRangeFromSideTrack(ref limitFromDate, ref limitToDate);

        //            string dataTableName = objTimeLog.getDataTableName(objDataService);

        //            string strSQL = "";

        //            // '## Old Query
        //            // 'strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString + " ORDER BY HDTH"

        //            // '## New Query
        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString() + " ORDER BY DATETIME";

        //            DataTable objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramFromDate = objData.Rows(0)("DATETIME");


        //            // '##New Query
        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH<=" + ToDepth.ToString() + " ORDER BY DATETIME DESC";

        //            objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramToDate = objData.Rows(0)("DATETIME");
        //        }



        //        if (selectionType == sPlotSelectionType.FromDepthOnwards)
        //        {
        //            string dataTableName = objTimeLog.getDataTableName(objDataService);
        //            string strSQL = "";

        //            strSQL = "SELECT MAX(HDTH) FROM " + dataTableName;

        //            paramToDepth = ValEx(objDataService.getValueFromDatabase(strSQL));
        //            ToDepth = paramToDepth;

        //            paramFromDepth = FromDepth;

        //            paramTitle = objWell.name + "  -  Toolface Evaluation (From Depth: " + ValEx(FromDepth).ToString + " to " + ValEx(paramToDepth).ToString + ")";

        //            DateTime limitFromDate;
        //            DateTime limitToDate;

        //            getDateRangeFromSideTrack(ref limitFromDate, ref limitToDate);


        //            // '### Old Query ...
        //            // 'strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString + " ORDER BY HDTH"

        //            // '### New Query
        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString() + " ORDER BY DATETIME";

        //            DataTable objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramFromDate = objData.Rows(0)("DATETIME");

        //            // '### New Query
        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH<=" + ToDepth.ToString() + " ORDER BY DATETIME DESC";

        //            objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramToDate = objData.Rows(0)("DATETIME");
        //        }
        //    }

        //    catch (Exception ex)
        //    {
        //    }
        //}

        public void getRange2(ref DateTime paramFromDate, ref DateTime paramToDate, ref double paramFromDepth, ref double paramToDepth, ref string paramTitle, gdSummary paramSummary)
        {
            try
            {
                objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref objRequest.objDataService, WellID);

                if (selectionType == sPlotSelectionType.FormationTops)
                {
                    paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objRequest.objDataService));
                    paramFromDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref objRequest.objDataService));

                    string strList = getTopsList();

                    paramTitle = objWell.name + "  -  " + paramSummary.SummaryPlotName + " (" + strList + ")";

                    getTopsDepthRange(ref paramFromDepth, ref paramToDepth);
                }


                if (selectionType == sPlotSelectionType.ByHours)
                {
                    double lastIndex = objTimeLog.getLastIndexOptimized(ref objRequest.objDataService);

                    paramToDate = DateTime.FromOADate(lastIndex);
                    paramFromDate = paramToDate.AddHours(-1 * Util.ValEx(LastHours));
                    

                    paramTitle = objWell.name + "  -  " + paramSummary.SummaryPlotName + " (Last " + Util.ValEx(LastHours).ToString() + " Hours)";

                    paramFromDepth = objTimeLog.getHoleDepthFromDateTime(ref objRequest.objDataService, paramFromDate.ToOADate());
                    paramToDepth = objTimeLog.getHoleDepthFromDateTime(ref objRequest.objDataService, paramToDate.ToOADate());
                }

                if (selectionType == sPlotSelectionType.DateRange)
                {
                    if (objWell.wellDateFormat == VuMaxDR.Data.Objects. Well.wDateFormatUTC)
                    {
                        paramFromDate = Util.convertWellTimeZoneToUTC(FromDate, objWell);
                        paramToDate = Util.convertWellTimeZoneToUTC(ToDate, objWell);
                    }
                    else
                    {
                        paramFromDate = Util.convertWellToLocalTimeZone(FromDate, objWell);
                        paramToDate = Util.convertWellToLocalTimeZone(ToDate, objWell);
                    }

                    paramFromDepth = objTimeLog.getHoleDepthFromDateTime(ref objRequest.objDataService, paramFromDate.ToOADate());
                    paramToDepth = objTimeLog.getHoleDepthFromDateTime(ref objRequest.objDataService, paramToDate.ToOADate());

                    paramTitle = objWell.name + "  -  " + paramSummary.SummaryPlotName + " (From Date: " + FromDate.ToString("MMM-dd-yyyy HH:mm:ss:") + " to " + ToDate.ToString("MMM-dd-yyyy HH:mm:ss") + ")";
                }


                if (selectionType == sPlotSelectionType.FromDateOnwards)
                {
                    if (objWell.wellDateFormat == VuMaxDR.Data.Objects. Well.wDateFormatUTC)
                    {
                        paramFromDate = Util.convertWellTimeZoneToUTC(FromDate,objWell);
                        paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objRequest.objDataService));
                    }
                    else
                    {
                        paramFromDate = Util.convertWellToLocalTimeZone(FromDate, objWell);
                        paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objRequest.objDataService));
                    }

                    paramFromDepth = objTimeLog.getHoleDepthFromDateTime(ref objRequest.objDataService, paramFromDate.ToOADate());
                    paramToDepth = objTimeLog.getHoleDepthFromDateTime(ref objRequest.objDataService, paramToDate.ToOADate());

                    DateTime localToDate;

                    if (objWell.wellDateFormat == VuMaxDR.Data.Objects. Well.wDateFormatUTC)
                        localToDate = Util.convertUTCToWellTimeZone(DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objRequest.objDataService)),objWell);
                    else
                        localToDate = Util.convertWellToLocalTimeZone(DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objRequest.objDataService)),objWell);


                    paramTitle = objWell.name + "  -  " + paramSummary.SummaryPlotName + " (From Date: " + FromDate.ToString("MMM-dd-yyyy HH:mm:ss:") + " to " + localToDate.ToString("MMM-dd-yyyy HH:mm:ss") + ")";
                }


                if (selectionType == sPlotSelectionType.DepthRange)
                {
                    paramTitle = objWell.name + "  -  " + paramSummary.SummaryPlotName + " (From Depth: " + Util.ValEx(FromDepth).ToString() + " to " + Util.ValEx(ToDepth).ToString() + ")";

                    paramFromDepth = FromDepth;
                    paramToDepth = ToDepth;

                    DateTime limitFromDate = new DateTime();
                    DateTime limitToDate = new DateTime();

                    getDateRangeFromSideTrack(ref limitFromDate, ref limitToDate);

                    string dataTableName = objTimeLog.getDataTableName(ref objRequest.objDataService);

                    string strSQL = "";

                    // '###Old Query
                    // 'strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString + " ORDER BY HDTH"

                    // '### New Query
                    strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString() + " ORDER BY DATETIME";

                    DataTable objData = objRequest.objDataService.getTable(strSQL);

                    if (objData.Rows.Count > 0)
                        paramFromDate = (DateTime)objData.Rows[0]["DATETIME"];


                    // '### New Query
                    strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH<=" + ToDepth.ToString() + " ORDER BY DATETIME DESC";

                    objData = objRequest.objDataService.getTable(strSQL);

                    if (objData.Rows.Count > 0)
                        paramToDate = (DateTime)objData.Rows[0]["DATETIME"];
                }



                if (selectionType == sPlotSelectionType.FromDepthOnwards)
                {
                    string dataTableName = objTimeLog.getDataTableName(ref objRequest.objDataService);
                    string strSQL = "";

                    strSQL = "SELECT MAX(HDTH) FROM " + dataTableName;

                    paramToDepth = Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));
                    ToDepth = paramToDepth;

                    paramFromDepth = FromDepth;

                    paramTitle = objWell.name + "  -  " + paramSummary.SummaryPlotName + " (From Depth: " + Util.ValEx(FromDepth).ToString() + " to " + Util.ValEx(paramToDepth).ToString() + ")";

                    DateTime limitFromDate = new DateTime();
                    DateTime limitToDate = new DateTime();

                    getDateRangeFromSideTrack(ref limitFromDate, ref limitToDate);

                    // '### Old Query ...
                    // 'strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString + " ORDER BY HDTH"

                    strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString() + " ORDER BY DATETIME";

                    DataTable objData = objRequest.objDataService.getTable(strSQL);

                    if (objData.Rows.Count > 0)
                        paramFromDate = (DateTime)objData.Rows[0]["DATETIME"];


                    // '### New Query
                    strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH<=" + ToDepth.ToString() + " ORDER BY DATETIME DESC";

                    objData = objRequest.objDataService.getTable(strSQL);

                    if (objData.Rows.Count > 0)
                        paramToDate = (DateTime)objData.Rows[0]["DATETIME"];
                }
            }

            catch (Exception ex)
            {

            }
        }

        private void getDateRangeFromSideTrack(ref DateTime paramFromDate, ref DateTime paramToDate)
        {
            try
            {
                if (sideTrackKey == "-999")
                {
                    if (objTimeLog.sideTracks.Count == 0)
                    {
                        paramFromDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref objRequest.objDataService));
                        paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objRequest.objDataService));
                    }


                    if (objTimeLog.sideTracks.Count > 0)
                    {
                        paramFromDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref objRequest.objDataService));

                        DataTable objData = objRequest.objDataService.getTable("select top 1 * from VMX_TIME_LOG_SIDETRACKS where WELL_ID='" + objTimeLog.WellID + "' AND WELLBORE_ID='" + objTimeLog.WellboreID + "' AND LOG_ID='" + objTimeLog.ObjectID + "' AND TYPE=0 ORDER BY SIDETRACK_DATE");


                        if (objData.Rows.Count > 0)
                            paramToDate = (DateTime)objData.Rows[0]["SIDETRACK_DATE"];
                        else
                            // 'There must be a hole depth reset ... mark the to date as last date
                            paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objRequest.objDataService));
                    }
                }

                if (sideTrackKey != "-999")
                {
                    paramFromDate = DateTime.Parse(objTimeLog.sideTracks[sideTrackKey].DateTime);
                    paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objRequest.objDataService));
                }
            }

            catch (Exception ex)
            {
            }
        }

        
        
        public void loadInitialData(gdSummary objGDSPlot)
        {
            try
            {
                if (objGDSPlot.hasTimeData())

                    // 'Select Primary time log ...
                    objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref this.objRequest.objDataService, objGDSPlot.wellID);
                //objTimeLog = objProject.getPrimaryTimeLog();


                if (objGDSPlot.hasTrajectoryData())
                {
                    trajList.Clear();


                    Trajectory objTrajectory = objGDSPlot.getActualTrajectory(); // objProject.getActualTrajectory;

                    if (objTrajectory != null)
                        trajList.Add(objTrajectory.WellboreID + "~" + objTrajectory.ObjectID, objTrajectory.WellboreID + "~" + objTrajectory.ObjectID);
                }


                loadDataSelection(objGDSPlot.SummaryPlotID);
            }

            catch (Exception ex)
            {
            }
        }


        //public bool getRange3(ref DateTime paramFromDate, ref DateTime paramToDate, ref double paramFromDepth, ref double paramToDepth, ref string paramTitle, ref string paramPlotName)
        //{
        //    try
        //    {
        //        objTimeLog = objProject.getPrimaryTimeLog();


        //        if (selectionType == sPlotSelectionType.FormationTops)
        //        {
        //            paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));
        //            paramFromDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(objDataService));

        //            string strList = getTopsList();

        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (" + strList + ")";

        //            getTopsDepthRange(ref paramFromDepth, ref paramToDepth);
        //        }


        //        if (selectionType == sPlotSelectionType.ByHours)
        //        {
        //            double lastIndex = objTimeLog.getLastIndexOptimized(objDataService);

        //            paramToDate = DateTime.FromOADate(lastIndex);
        //            paramFromDate = paramToDate.AddHours(-1 * ValEx(LastHours));

        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (Last " + ValEx(LastHours).ToString + " Hours)";

        //            paramFromDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, paramFromDate.ToOADate());
        //            paramToDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, paramToDate.ToOADate());
        //        }


        //        if (selectionType == sPlotSelectionType.DateRange)
        //        {
        //            if (objWell.wellDateFormat == Well.wDateFormatUTC)
        //            {
        //                paramFromDate = utilFunctions.convertWellTimeZoneToUTC(FromDate);
        //                paramToDate = utilFunctions.convertWellTimeZoneToUTC(ToDate);
        //            }
        //            else
        //            {
        //                paramFromDate = utilFunctions.convertWellToLocalTimeZone(FromDate);
        //                paramToDate = utilFunctions.convertWellToLocalTimeZone(ToDate);
        //            }

        //            paramFromDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, paramFromDate.ToOADate());
        //            paramToDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, paramToDate.ToOADate());

        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (From Date: " + FromDate.ToString("MMM-dd-yyyy HH:mm:ss:") + " to " + ToDate.ToString("MMM-dd-yyyy HH:mm:ss") + ")";
        //        }


        //        if (selectionType == sPlotSelectionType.FromDateOnwards)
        //        {
        //            if (objWell.wellDateFormat == Well.wDateFormatUTC)
        //            {
        //                paramFromDate = utilFunctions.convertWellTimeZoneToUTC(FromDate);
        //                paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));
        //                ToDate = paramToDate;
        //            }
        //            else
        //            {
        //                paramFromDate = utilFunctions.convertWellToLocalTimeZone(FromDate);
        //                paramToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));
        //                ToDate = paramToDate;
        //            }


        //            paramFromDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, FromDate.ToOADate());
        //            paramToDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, ToDate.ToOADate());

        //            DateTime localToDate;

        //            if (objWell.wellDateFormat == Well.wDateFormatUTC)
        //                localToDate = utilFunctions.convertUTCToWellTimeZone(DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService)));
        //            else
        //                localToDate = utilFunctions.convertWellToLocalTimeZone(DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService)));

        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (From Date: " + FromDate.ToString("MMM-dd-yyyy HH:mm:ss:") + " to " + localToDate.ToString("MMM-dd-yyyy HH:mm:ss") + ")";
        //        }


        //        if (selectionType == sPlotSelectionType.DepthRange)
        //        {
        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (From Depth: " + ValEx(FromDepth).ToString + " to " + ValEx(ToDepth).ToString + ")";

        //            paramFromDepth = FromDepth;
        //            paramToDepth = ToDepth;

        //            DateTime limitFromDate;
        //            DateTime limitToDate;

        //            getDateRangeFromSideTrack(ref limitFromDate, ref limitToDate);

        //            string dataTableName = objTimeLog.getDataTableName(objDataService);

        //            string strSQL = "";

        //            // '## Old Query
        //            // 'strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString + " ORDER BY HDTH"

        //            // '## New Query
        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString() + " ORDER BY DATETIME";


        //            DataTable objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramFromDate = objData.Rows(0)("DATETIME");


        //            // '##New Query
        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH<=" + ToDepth.ToString() + " ORDER BY DATETIME DESC";


        //            objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramToDate = objData.Rows(0)("DATETIME");
        //        }



        //        if (selectionType == sPlotSelectionType.FromDepthOnwards)
        //        {
        //            string dataTableName = objTimeLog.getDataTableName(objDataService);
        //            string strSQL = "";

        //            strSQL = "SELECT MAX(HDTH) FROM " + dataTableName;

        //            paramToDepth = ValEx(objDataService.getValueFromDatabase(strSQL));
        //            ToDepth = paramToDepth;

        //            paramFromDepth = FromDepth;

        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (From Depth: " + ValEx(FromDepth).ToString + " to " + ValEx(paramToDepth).ToString + ")";

        //            DateTime limitFromDate;
        //            DateTime limitToDate;

        //            getDateRangeFromSideTrack(ref limitFromDate, ref limitToDate);


        //            // '### Old Query ...
        //            // 'strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString + " ORDER BY HDTH"

        //            // '### New Query
        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + FromDepth.ToString() + " ORDER BY DATETIME";

        //            DataTable objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramFromDate = objData.Rows(0)("DATETIME");

        //            // '### New Query
        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH<=" + ToDepth.ToString() + " ORDER BY DATETIME DESC";

        //            objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramToDate = objData.Rows(0)("DATETIME");
        //        }
        //    }

        //    catch (Exception ex)
        //    {
        //    }
        //}


        //public void loadAnyOffsetWellInfo(string paramPlotID)
        //{
        //    try
        //    {
        //        offsetWells.Clear();

        //        if (objWell.offsetWells.Count > 0)
        //        {
        //            LogCorOffsetWellInfo objOffset = new LogCorOffsetWellInfo();
        //            objOffset.OffsetWellID = objWell.offsetWells.Values.First.OffsetWellID;
        //            objOffset.DepthLogID = "";
        //            objOffset.DepthOffset = 0;
        //            offsetWells.Add(objOffset.OffsetWellID, objOffset);
        //        }
        //    }


        //    ////Commented by Nitin (copied from Original VB Code)

        //    // offsetWells.Clear()

        //    // Dim objData As DataTable = objDataService.getTable("SELECT DISTINCT(USER_NAME) AS USER_NAME FROM VMX_USER_DATA_SELECTION_OFFSET WHERE WELL_ID='" + WellID + "' AND PLOT_ID='" + paramPlotID + "'")

        //    // If objData.Rows.Count > 0 Then

        //    // Dim UserName As String = DataService.checkNull(objData.Rows(0)("USER_NAME"), "")


        //    // objData = objDataService.getTable("SELECT * FROM VMX_USER_DATA_SELECTION_OFFSET WHERE WELL_ID='" + WellID + "' AND USER_NAME='" + UserName + "' AND PLOT_ID='" + paramPlotID + "'")

        //    // For Each objRow As DataRow In objData.Rows

        //    // Dim strWellID As String = DataService.checkNull(objRow("OFFSET_WELL_ID"), "")

        //    // If Not offsetWells.ContainsKey(strWellID) Then

        //    // Dim objOffset As New LogCorOffsetWellInfo
        //    // objOffset.OffsetWellID = strWellID
        //    // objOffset.DepthLogID = DataService.checkNull(objRow("DEPTH_LOG_ID"), "")
        //    // objOffset.DepthOffset = DataService.checkNull(objRow("OFFSET_DEPTH"), 0)
        //    // offsetWells.Add(strWellID, objOffset)

        //    // End If

        //    // Next

        //    // Else

        //    // ''Nothing to do ...
        //    // Exit Sub

        //    // End If

        //    catch (Exception ex)
        //    {
        //    }
        //}


        public void getTopsDepthRange(string paramWellID, ref double paramMinDepth, ref double paramMaxDepth)
        {
            try
            {
                paramMinDepth = 0;
                paramMaxDepth = 0;

                TimeLog objLocalTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref objRequest.objDataService, paramWellID);

                if (topList.Count > 0)
                {
                    DataTable objTops = objRequest.objDataService.getTable("SELECT * FROM VMX_WELL_TOPS WHERE WELL_ID='" + paramWellID + "' ORDER BY DEPTH");


                    // '#### Pass #1 ###########################################################################################''
                    foreach (string strKey in topList.Keys)
                    {
                        double minDepth = 0;
                        double maxDepth = 0;

                        for (int i = 0; i <= objTops.Rows.Count - 1; i++)
                        {
                            string topName = (string)DataService.checkNull(objTops.Rows[i]["TOP_NAME"], "");

                            if (topName.Trim().ToUpper() == strKey.Trim().ToUpper())
                            {
                                double topDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i]["DEPTH"], 0));

                                minDepth = topDepth;

                                if (i == objTops.Rows.Count - 1)
                                {
                                    maxDepth = 0;

                                    if (objLocalTimeLog != null)
                                        maxDepth = Convert.ToDouble(objRequest.objDataService.getValueFromDatabase("SELECT MAX(HDTH) FROM " + objLocalTimeLog.__dataTableName));
                                }
                                else
                                    maxDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i + 1]["DEPTH"], 0));

                                if (minDepth < paramMinDepth)
                                    paramMinDepth = minDepth;

                                if (maxDepth > paramMaxDepth)
                                    paramMaxDepth = maxDepth;
                            }
                        }
                    }
                    // '########################################################################################################''


                    paramMinDepth = paramMaxDepth;


                    // '#### Pass #2 ###########################################################################################''
                    foreach (string strKey in topList.Keys)
                    {
                        double minDepth = 0;
                        double maxDepth = 0;

                        for (int i = 0; i <= objTops.Rows.Count - 1; i++)
                        {
                            string topName = (string)DataService.checkNull(objTops.Rows[i]["TOP_NAME"], "");

                            if (topName.Trim().ToUpper() == strKey.Trim().ToUpper())
                            {
                                double topDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i]["DEPTH"], 0));

                                minDepth = topDepth;

                                if (minDepth < paramMinDepth)
                                    paramMinDepth = minDepth;
                            }
                        }
                    }
                    // '########################################################################################################''

                    paramMaxDepth = paramMinDepth;


                    // '#### Pass #3 ###########################################################################################''
                    foreach (string strKey in topList.Keys)
                    {
                        double minDepth = 0;
                        double maxDepth = 0;

                        for (int i = 0; i <= objTops.Rows.Count - 1; i++)
                        {
                            string topName = (string)DataService.checkNull(objTops.Rows[i]["TOP_NAME"], "");

                            if (topName.Trim().ToUpper() == strKey.Trim().ToUpper())
                            {
                                double topDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i]["DEPTH"], 0));

                                minDepth = topDepth;

                                if (i == objTops.Rows.Count - 1)
                                {
                                    maxDepth = 0;

                                    if (objLocalTimeLog != null)
                                        maxDepth = Convert.ToDouble(objRequest.objDataService.getValueFromDatabase("SELECT MAX(HDTH) FROM " + objLocalTimeLog.__dataTableName));
                                }
                                else
                                    maxDepth = Convert.ToDouble(DataService.checkNull(objTops.Rows[i + 1]["DEPTH"], 0));


                                if (maxDepth > paramMaxDepth)
                                    paramMaxDepth = maxDepth;
                            }
                        }
                    }
                    // '########################################################################################################''

                    bool halt = true;
                }
            }
            catch (Exception ex)
            {
            }
        }



        private void getMinMaxDepthWithOffset(ref double paramMinDepth, ref double paramMaxDepth)
        {
            try
            {
                Dictionary<int, splitRange> rangeList = new Dictionary<int, splitRange>();

                double minDepth = 0;
                double maxDepth = 0;

                getTopsDepthRange(WellID, ref minDepth, ref maxDepth);


                // 'Add range for main well
                rangeList.Add(rangeList.Count + 1, new splitRange(minDepth, maxDepth));


                // 'Go through each offset well and find out depth ranges for formation tops

                foreach (LogCorOffsetWellInfo objItem in offsetWells.Values)
                {
                    minDepth = 0;
                    maxDepth = 0;

                    getTopsDepthRange(objItem.OffsetWellID, ref minDepth, ref maxDepth);


                    rangeList.Add(rangeList.Count + 1, new splitRange(minDepth, maxDepth));
                }


                double minValue = 0;
                double maxValue = 0;


                // 'Find Max now ...
                foreach (splitRange objItem in rangeList.Values)
                {
                    if (objItem.fromValue < minValue)
                        minValue = objItem.fromValue;
                }

                maxValue = minValue;

                foreach (splitRange objItem in rangeList.Values)
                {
                    if (objItem.fromValue > maxValue)
                        maxValue = objItem.fromValue;
                }

                minValue = maxValue;


                foreach (splitRange objItem in rangeList.Values)
                {
                    if (objItem.fromValue < minValue)
                        minValue = objItem.fromValue;
                }


                paramMinDepth = minValue;




                minValue = 0;
                maxValue = 0;


                // 'Find Max now ...
                foreach (splitRange objItem in rangeList.Values)
                {
                    if (objItem.toValue < minValue)
                        minValue = objItem.toValue;
                }

                maxValue = minValue;

                foreach (splitRange objItem in rangeList.Values)
                {
                    if (objItem.toValue > maxValue)
                        maxValue = objItem.toValue;
                }

                minValue = maxValue;


                foreach (splitRange objItem in rangeList.Values)
                {
                    if (objItem.toValue < minValue)
                        minValue = objItem.toValue;
                }

                paramMaxDepth = maxValue;
                return;
            }
            catch (Exception ex)
            {
                return;
            }
        }

        //public bool getRangeMultiLogs(ref DateTime paramFromDate, ref DateTime paramToDate, ref double paramFromDepth, ref double paramToDepth, ref string paramTitle, ref string paramPlotName)
        //{
        //    try
        //    {
        //        objTimeLog = objProject.getPrimaryTimeLog();

        //        if (selectionType == sPlotSelectionType.ByHours)
        //        {
        //            double lastIndex = getMaxDate(timeLogs).ToOADate();

        //            paramToDate = DateTime.FromOADate(lastIndex);
        //            paramFromDate = paramToDate.AddHours(-1 * ValEx(LastHours));

        //            objTimeLog = getTimeLogFromDate(paramFromDate);

        //            if (objTimeLog == null)
        //                objTimeLog = objProject.getPrimaryTimeLog;

        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (Last " + ValEx(LastHours).ToString + " Hours)";
        //        }


        //        if (selectionType == sPlotSelectionType.DateRange)
        //        {
        //            if (objWell.wellDateFormat == Well.wDateFormatUTC)
        //            {
        //                paramFromDate = utilFunctions.convertWellTimeZoneToUTC(FromDate);
        //                paramToDate = utilFunctions.convertWellTimeZoneToUTC(ToDate);
        //            }
        //            else
        //            {
        //                paramFromDate = utilFunctions.convertWellToLocalTimeZone(FromDate);
        //                paramToDate = utilFunctions.convertWellToLocalTimeZone(ToDate);
        //            }

        //            // //Find the right time log ...
        //            objTimeLog = getTimeLogFromDate(paramFromDate);

        //            if (objTimeLog == null)
        //                objTimeLog = objProject.getPrimaryTimeLog;

        //            paramFromDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, FromDate.ToOADate());
        //            paramToDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, ToDate.ToOADate());

        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (From Date: " + FromDate.ToString("MMM-dd-yyyy HH:mm:ss:") + " to " + ToDate.ToString("MMM-dd-yyyy HH:mm:ss") + ")";
        //        }


        //        if (selectionType == sPlotSelectionType.FromDateOnwards)
        //        {
        //            if (objWell.wellDateFormat == Well.wDateFormatUTC)
        //            {
        //                paramFromDate = utilFunctions.convertWellTimeZoneToUTC(FromDate);
        //                paramToDate = getMaxDate(timeLogs);
        //            }
        //            else
        //            {
        //                paramFromDate = utilFunctions.convertWellToLocalTimeZone(FromDate);
        //                paramToDate = getMaxDate(timeLogs);
        //            }

        //            // //Find the right time log ...
        //            objTimeLog = getTimeLogFromDate(paramFromDate);

        //            if (objTimeLog == null)
        //                objTimeLog = objProject.getPrimaryTimeLog;


        //            paramFromDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, FromDate.ToOADate());
        //            paramToDepth = objTimeLog.getHoleDepthFromDateTime(objDataService, ToDate.ToOADate());

        //            DateTime localToDate;

        //            if (objWell.wellDateFormat == Well.wDateFormatUTC)
        //                localToDate = utilFunctions.convertUTCToWellTimeZone(paramToDate);
        //            else
        //                localToDate = utilFunctions.convertWellToLocalTimeZone(paramToDate);

        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (From Date: " + FromDate.ToString("MMM-dd-yyyy HH:mm:ss:") + " to " + localToDate.ToString("MMM-dd-yyyy HH:mm:ss") + ")";
        //        }


        //        if (selectionType == sPlotSelectionType.DepthRange)
        //        {
        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (From Depth: " + ValEx(FromDepth).ToString + " to " + ValEx(ToDepth).ToString + ")";

        //            paramFromDepth = FromDepth;
        //            paramToDepth = ToDepth;

        //            objTimeLog = getTimeLogFromDepth(paramFromDepth);

        //            if (objTimeLog == null)
        //                objTimeLog = objProject.getPrimaryTimeLog;

        //            string dataTableName = objTimeLog.getDataTableName(objDataService);

        //            string strSQL = "";

        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE HDTH>=" + FromDepth.ToString() + " ORDER BY DATETIME";

        //            DataTable objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramFromDate = objData.Rows(0)("DATETIME");

        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE HDTH<=" + ToDepth.ToString() + " ORDER BY DATETIME DESC";

        //            objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramToDate = objData.Rows(0)("DATETIME");
        //        }



        //        if (selectionType == sPlotSelectionType.FromDepthOnwards)
        //        {
        //            paramFromDepth = FromDepth;

        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (From Depth: " + ValEx(FromDepth).ToString + " to " + ValEx(paramToDepth).ToString + ")";

        //            objTimeLog = getTimeLogFromDepth(FromDepth);

        //            if (objTimeLog == null)
        //                objTimeLog = objProject.getPrimaryTimeLog();


        //            string dataTableName = objTimeLog.getDataTableName(objDataService);
        //            string strSQL = "";

        //            strSQL = "SELECT MAX(HDTH) FROM " + dataTableName;

        //            paramToDepth = ValEx(objDataService.getValueFromDatabase(strSQL));
        //            ToDepth = paramToDepth;

        //            paramFromDepth = FromDepth;

        //            paramTitle = objWell.name + "  -  " + paramPlotName + " (From Depth: " + ValEx(FromDepth).ToString + " to " + ValEx(paramToDepth).ToString + ")";

        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE HDTH>=" + FromDepth.ToString() + " ORDER BY DATETIME";

        //            DataTable objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramFromDate = objData.Rows(0)("DATETIME");

        //            strSQL = "SELECT TOP 1 DATETIME FROM " + dataTableName + " WHERE HDTH<=" + ToDepth.ToString() + " ORDER BY DATETIME DESC";

        //            objData = objDataService.getTable(strSQL);

        //            if (objData.Rows.Count > 0)
        //                paramToDate = objData.Rows(0)("DATETIME");
        //        }
        //    }

        //    catch (Exception ex)
        //    {
        //    }
        //}

        //public TimeLog getTimeLogFromDates(DateTime paramFromDate, DateTime paramToDate)
        //{
        //    try
        //    {
        //        foreach (LogInfo objLogInfo in timeLogs.Values)
        //        {
        //            TimeLog objTimeLog = objProject.getTimeLog(WellID, objLogInfo.WellboreID, objLogInfo.LogID);

        //            if (!objTimeLog == null)
        //            {
        //                DateTime dtStartDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(objDataService));
        //                DateTime dtEndDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));

        //                if (paramFromDate >= dtStartDate & paramFromDate <= dtEndDate & paramToDate >= dtStartDate & paramToDate <= dtEndDate)
        //                    return objTimeLog;
        //            }
        //        }

        //        return null/* TODO Change to default(_) if this is not a reference type */;
        //    }
        //    catch (Exception ex)
        //    {
        //        return null/* TODO Change to default(_) if this is not a reference type */;
        //    }
        //}


        //public TimeLog getTimeLogFromDepth(double paramFromDepth)
        //{
        //    try
        //    {
        //        foreach (LogInfo objLogInfo in timeLogs.Values)
        //        {
        //            TimeLog objTimeLog = objProject.getTimeLog(WellID, objLogInfo.WellboreID, objLogInfo.LogID);

        //            if (!objTimeLog == null)
        //            {
        //                string strSQL = "SELECT MAX(HDTH) AS MAX_HDTH,MIN(HDTH) AS MIN_HDTH FROM " + objTimeLog.__dataTableName + " ";

        //                DataTable objData = objDataService.getTable(strSQL);

        //                if (objData.Rows.Count > 0)
        //                {
        //                    double minDepth = DataService.checkNull(objData.Rows(0)("MIN_HDTH"), 0);
        //                    double maxDepth = DataService.checkNull(objData.Rows(0)("MAX_HDTH"), 0);

        //                    if (paramFromDepth >= minDepth & paramFromDepth <= maxDepth)
        //                        return objTimeLog;
        //                }
        //            }
        //        }

        //        return null/* TODO Change to default(_) if this is not a reference type */;
        //    }
        //    catch (Exception ex)
        //    {
        //        return null/* TODO Change to default(_) if this is not a reference type */;
        //    }
        //}


        //public TimeLog getTimeLogFromDate(DateTime paramFromDate)
        //{
        //    try
        //    {
        //        foreach (LogInfo objLogInfo in timeLogs.Values)
        //        {
        //            TimeLog objTimeLog = objProject.getTimeLog(WellID, objLogInfo.WellboreID, objLogInfo.LogID);

        //            if (!objTimeLog == null)
        //            {
        //                DateTime minDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(objDataService));
        //                DateTime maxDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));

        //                if (paramFromDate >= minDate & paramFromDate <= maxDate)
        //                    return objTimeLog;
        //            }
        //        }

        //        return null/* TODO Change to default(_) if this is not a reference type */;
        //    }
        //    catch (Exception ex)
        //    {
        //        return null/* TODO Change to default(_) if this is not a reference type */;
        //    }
        //}


        //private DateTime getMaxDate(Dictionary<string, LogInfo> timeLogList)
        //{
        //    try
        //    {
        //        DateTime maxDate = new DateTime();


        //        foreach (LogInfo objLogInfo in timeLogList.Values)
        //        {
        //            TimeLog objTimeLog = objProject.getTimeLog(WellID, objLogInfo.WellboreID, objLogInfo.LogID);

        //            if (!objTimeLog == null)
        //            {
        //                DateTime lastIndex = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));

        //                if (lastIndex > maxDate)
        //                    maxDate = lastIndex;
        //            }
        //        }

        //        return maxDate;
        //    }
        //    catch (Exception ex)
        //    {
        //        return new DateTime();
        //    }
        //}

        //private DateTime getBeginningDate(double paramDepth, Dictionary<string, LogInfo> timeLogList)
        //{
        //    try
        //    {
        //        DateTime beginDate = DateTime.Now;


        //        foreach (LogInfo objLogInfo in timeLogList.Values)
        //        {
        //            TimeLog objTimeLog = objProject.getTimeLog(WellID, objLogInfo.WellboreID, objLogInfo.LogID);

        //            if (!objTimeLog == null)
        //            {
        //                DateTime limitFromDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(objDataService));
        //                DateTime limitToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));

        //                string strSQL = "SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + paramDepth.ToString() + " ORDER BY DATETIME";

        //                DataTable objData = objDataService.getTable(strSQL);

        //                if (objData.Rows.Count > 0)
        //                {
        //                    DateTime paramFromDate = objData.Rows(0)("DATETIME");

        //                    if (paramFromDate < beginDate)
        //                        beginDate = paramFromDate;
        //                }
        //            }
        //        }

        //        return beginDate;
        //    }
        //    catch (Exception ex)
        //    {
        //        return new DateTime();
        //    }
        //}

        //private DateTime getEndingDate(double paramDepth, Dictionary<string, LogInfo> timeLogList)
        //{
        //    try
        //    {
        //        DateTime beginDate = new DateTime();

        //        foreach (LogInfo objLogInfo in timeLogList.Values)
        //        {
        //            TimeLog objTimeLog = objProject.getTimeLog(WellID, objLogInfo.WellboreID, objLogInfo.LogID);

        //            if (!objTimeLog == null)
        //            {
        //                DateTime limitFromDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(objDataService));
        //                DateTime limitToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(objDataService));

        //                string strSQL = "SELECT TOP 1 DATETIME FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + limitFromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + limitToDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH<=" + ToDepth.ToString() + " ORDER BY DATETIME DESC";

        //                DataTable objData = objDataService.getTable(strSQL);

        //                if (objData.Rows.Count > 0)
        //                {
        //                    DateTime paramFromDate = objData.Rows(0)("DATETIME");

        //                    if (paramFromDate > beginDate)
        //                        beginDate = paramFromDate;
        //                }
        //            }
        //        }

        //        return beginDate;
        //    }
        //    catch (Exception ex)
        //    {
        //        return new DateTime();
        //    }
        //}

        //private double getMaxDepth(Dictionary<string, LogInfo> timeLogList)
        //{
        //    try
        //    {
        //        double maxDepth = 0;

        //        foreach (LogInfo objLogInfo in timeLogList.Values)
        //        {
        //            TimeLog objTimeLog = objProject.getTimeLog(WellID, objLogInfo.WellboreID, objLogInfo.LogID);

        //            if (!objTimeLog == null)
        //            {
        //                double lnDepth = objDataService.getValueFromDatabase("SELECT MAX(HDTH) FROM " + objTimeLog.__dataTableName);

        //                if (lnDepth > maxDepth)
        //                    maxDepth = lnDepth;
        //            }
        //        }

        //        return maxDepth;
        //    }
        //    catch (Exception ex)
        //    {
        //        return 0;
        //    }
        //}





    }

    public class TFAdnlFilter
    {
        public int FilterID = 0;
        public string Mnemonic = "";
        public string JoinOperator = "";
        public string Value = "";

        public TFAdnlFilter getCopy()
        {
            try
            {
                TFAdnlFilter objNew = new TFAdnlFilter();
                objNew.FilterID = this.FilterID;
                objNew.Mnemonic = this.Mnemonic;
                objNew.JoinOperator = this.JoinOperator;
                objNew.Value = this.Value;

                return objNew;
            }
            catch (Exception ex)
            {
                return new TFAdnlFilter();
            }
        }
    }



    public class LogCorOffsetWellInfo
    {
        public string OffsetWellID = "";
        public double DepthOffset = 0;
        public string DepthLogID = "";
        public string ShortName = "";

        public LogCorOffsetWellInfo getCopy()
        {
            try
            {
                LogCorOffsetWellInfo objNew = new LogCorOffsetWellInfo();
                objNew.OffsetWellID = this.OffsetWellID;
                objNew.DepthOffset = this.DepthOffset;
                objNew.DepthLogID = this.DepthLogID;
                objNew.ShortName = this.ShortName;

                return objNew;
            }
            catch (Exception ex)
            {
                return new LogCorOffsetWellInfo();
            }
        }
    }

    
}
