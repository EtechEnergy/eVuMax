using eVuMax.DataBroker.Common;
using eVuMax.DataBroker.Summary.DrlgSummary;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.GenericDrillingSummary
{
    public class gdSummary
    {
        public string SummaryPlotID = "";
        public string SummaryPlotName = "";

        public Dictionary<string, gdsDataSeries> dataSeries = new Dictionary<string, gdsDataSeries>();
        public Dictionary<string, gdsAxis> Axis = new Dictionary<string, gdsAxis>();

        public bool ShowColorAxis = false;
        public string ColorAxisMnemonic = "";

        public int ZoomDirection = 0; // 0-Both, 1-Horizontal, 2-Vertical

        public Dictionary<string, gdsDataSeries> rtDataSeries = new Dictionary<string, gdsDataSeries>();

        public int PlotOrientation = 0; // '0-Horizontal (split vertical axes), 1-Vertical (split horizontal axes)
        public bool MultiWell = false;
        public bool ShowTops = false;

        public int Type = 0;
        public int Factor = 10;
        public bool MultiPageOutput = false;
        public double FtPerInch = 0;
        public int IndexColumn = 0;

        private Dictionary<string, gdsDataSeries> localSeries = new Dictionary<string, gdsDataSeries>();

        //Nishant
        public Dictionary<string, FormationTopPositionInfo> allFormationTopsInfo = new Dictionary<string, FormationTopPositionInfo>();

        VuMaxDR.Data.Objects.Well objWell = new VuMaxDR.Data.Objects.Well();
        //string UserName = "";
        int dataStatus = 1;
        Broker.BrokerRequest objRequest = new Broker.BrokerRequest();
        public string wellID = "";
        string lastError = "";
        MnemonicMappingMgr objMnemonicMappingMgr = new MnemonicMappingMgr();

        private double fromDepth = 0;
        private double toDepth = 0;
        private DateTime fromDate;
        private DateTime toDate;
        private VuMaxDR.Data.Objects.TimeLog objTimeLog = new TimeLog();

        private int Intervals = 10;
        public double colorColStart = 0;
        public double colorColEnd = 10000;
        public string colorColAxisLabel = "Measured Depth";

        public Dictionary<int, IntervalInfo> IntervalList = new Dictionary<int, IntervalInfo>();
        public DataSelection objDataSelection = new DataSelection();

        public double[] roadmapDepth;
        [NonSerialized()]
        public double[] roadmapMin;
        [NonSerialized()]
        public double[] roadmapMax;

        public Dictionary<int, string> IntervalColors = new Dictionary<int, string>();
        public string ChartTitle = "";

        public gdSummary(Broker.BrokerRequest paramRequest, string paramWellID, string paramPlotID)
        {
            this.wellID = paramWellID;
            this.SummaryPlotID = paramPlotID;
            this.objRequest = paramRequest;
            this.objDataSelection.objRequest = paramRequest;
            objMnemonicMappingMgr.loadMappings(ref objRequest.objDataService);


        }


        //public gdSummary(string paramWellID, ref Broker.BrokerRequest paramRequest)
        //{
        //    this.objRequest = paramRequest;
        //    this.wellID = paramWellID;
        //    this.objDataSelection.loadDataSelection(SummaryPlotID);
        //    this.objRequest = paramRequest;
        //}

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



        public static Broker.BrokerResponse LoadgdSummaryList(ref Broker.BrokerRequest paramRequest)
        {
            try
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                DataTable objData = paramRequest.objDataService.getTable("SELECT * FROM VMX_GDS_TEMPLATES ORDER BY TEMPLATE_NAME");

                if (objData.Rows.Count > 0)
                {

                    objResponse.Response = JsonConvert.SerializeObject(objData);

                }

                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in LoadgdSummaryList " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        #region "Formation Tops"
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
            }
        }

        #endregion
        private void generateColorData()
        {
            try
            {
                if (!ShowColorAxis)
                    return;

                string strSQL = "";

                TimeLog objTimeLog = objDataSelection.objTimeLog;

                string ColorMnemonic = ColorAxisMnemonic;

                if (objTimeLog.logCurves.ContainsKey(ColorMnemonic))
                {
                }
                else
                {
                    ColorMnemonic = objMnemonicMappingMgr.getMappedMnemonic(ColorMnemonic, objTimeLog.logCurves);

                    if (ColorMnemonic.Trim() == "")
                        return;// 'No data found ...
                }


                string additionalCondition = "";

                foreach (gdsDataSeries objSeries in localSeries.Values)
                {
                    if (objSeries.DataFilter.Trim() != "")
                    {
                        string strFilterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, objSeries.DataFilter, 0, 0, wellID);

                        additionalCondition = additionalCondition + " OR " + strFilterCondition;
                    }
                }


                if (additionalCondition.Trim() != "")
                    additionalCondition = additionalCondition.Substring(3);



                string dataTableName = objTimeLog.__dataTableName;


                if (Type == 0)
                {

                    // 'Get min and max values for color column
                    if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.DepthRange | objDataSelection.selectionType == DataSelection.sPlotSelectionType.FromDepthOnwards)
                        strSQL = "SELECT MIN([" + ColorMnemonic + "]) AS MIN_VALUE,MAX([" + ColorMnemonic + "]) AS MAX_VALUE FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
                    else
                        strSQL = "SELECT MIN([" + ColorMnemonic + "]) AS MIN_VALUE,MAX([" + ColorMnemonic + "]) AS MAX_VALUE FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                }
                else

                    // 'Get min and max values for color column
                    if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.DepthRange | objDataSelection.selectionType == DataSelection.sPlotSelectionType.FromDepthOnwards)
                    strSQL = "SELECT MIN([" + ColorMnemonic + "]) AS MIN_VALUE,MAX([" + ColorMnemonic + "]) AS MAX_VALUE FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
                else
                    strSQL = "SELECT MIN([" + ColorMnemonic + "]) AS MIN_VALUE,MAX([" + ColorMnemonic + "]) AS MAX_VALUE FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";


                if (additionalCondition.Trim() != "")
                    strSQL = strSQL + " AND (" + additionalCondition + ")";

                DataTable objData = objRequest.objDataService.getTable(strSQL);

                if (objData.Rows.Count > 0)
                {
                    colorColStart = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MIN_VALUE"], 0));
                    colorColEnd = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["MAX_VALUE"], 0));
                }


                IntervalList.Clear();

                double startValue = colorColStart;
                double valueInterval = (colorColEnd - colorColStart) / Convert.ToDouble(Intervals);

                for (int i = 1; i <= Intervals; i++)
                {
                    IntervalInfo objInterval = new IntervalInfo();
                    objInterval.minValue = startValue;
                    objInterval.maxValue = startValue + valueInterval;

                    IntervalList.Add(i, objInterval);

                    startValue = startValue + valueInterval;
                }
            }

            catch (Exception ex)
            {
            }
        }

        private string getColor(double pValue)
        {
            try
            {
                for (int i = 1; i <= Intervals; i++)
                {
                    if (pValue >= IntervalList[i].minValue & pValue <= IntervalList[i].maxValue)
                        return IntervalColors[i];
                }

                return ColorTranslator.ToHtml(Color.Transparent);
                
            }
            catch (Exception ex)
            {
                return ColorTranslator.ToHtml(Color.Transparent);
            }
        }

        private void generateOffsetTimeLogData(string paramSeriesID)
        {
            try
            {

                DataService objLocalConn = objRequest.objDataService;
                objMnemonicMappingMgr.loadMappings(ref objRequest.objDataService);
                dataStatus = 1;

                gdsDataSeries objSeries = localSeries[paramSeriesID];

                string __WellID = objSeries.__WellID;
                string WellboreID = objSeries.ObjectID.Split('~')[0];
                string LogID = objSeries.ObjectID.Split('~')[1];

                string XColumn = objSeries.XColumnID;
                string YColumn = objSeries.YColumnID;
                string ColorMnemonic = ColorAxisMnemonic;

                TimeLog objTimeLog = TimeLog.loadTimeLogWOPlan(ref objRequest.objDataService, __WellID, WellboreID, LogID, ref lastError);
                string dataTableName = objTimeLog.__dataTableName;

                string BaseDepthMnemonic = "BASE_DEPTH";



                if (objTimeLog.logCurves.ContainsKey(XColumn))
                {
                }
                else
                {
                    XColumn = objMnemonicMappingMgr.getMappedMnemonic(XColumn, objTimeLog.logCurves);

                    if (XColumn.Trim() == "")
                        // 'prath Ticket No. 1424 (make comment)
                        // dataStatus = 0
                        // '***************
                        return;// 'No data found ...
                }

                if (objTimeLog.logCurves.ContainsKey(YColumn))
                {
                }
                else
                {
                    YColumn = objMnemonicMappingMgr.getMappedMnemonic(YColumn, objTimeLog.logCurves);

                    if (YColumn.Trim() == "")
                        // 'prath Ticket No. 1424 (make comment)
                        // dataStatus = 0
                        // '************
                        return;// 'No data found ...
                }

                if (ShowColorAxis)
                {
                    if (objTimeLog.logCurves.ContainsKey(ColorMnemonic))
                    {
                    }
                    else
                    {
                        ColorMnemonic = objMnemonicMappingMgr.getMappedMnemonic(ColorMnemonic, objTimeLog.logCurves);

                        if (ColorMnemonic.Trim() == "")
                            ShowColorAxis = false;
                    }
                }


                string strAdditionalCondition = "";

                if (objSeries.DataFilter.Trim() != "")
                {
                    string filterCondition = objSeries.DataFilter;

                    filterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, filterCondition, fromDepth, toDepth, __WellID);

                    strAdditionalCondition = strAdditionalCondition + "AND (" + filterCondition + ") ";
                }

                if (objSeries.IgnoreNegative)
                    strAdditionalCondition = strAdditionalCondition + "AND [" + XColumn + "]>=0 AND [" + YColumn + "]>=0 ";

                // '#**** The Offset Well will always be filtered by Hole Depth because of DateTime differences ... ***
                DataSelection objDataSelection = new DataSelection(wellID, objRequest);

                if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                {
                    string strTopsFilter = objDataSelection.getTopsFilter(__WellID);

                    if (strTopsFilter.Trim() != "")
                        strAdditionalCondition = strAdditionalCondition + " AND " + strTopsFilter;
                    else
                        strAdditionalCondition = strAdditionalCondition + " AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
                }
                else
                    strAdditionalCondition = strAdditionalCondition + " AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";


                double[] xData = new double[0];
                double[] yData = new double[0];
                string[] colorData = new string[0];

                string strSQL = "";


                if (Type == 0)
                {

                    // 'Retrieve only Drilling data i.e. with drilling rig states only

                    // '### We need full dataset of offset well while using Depth Matching ... This is necessary to properly stretch/shrink the data 
                    if (objDataSelection.MatchDepthByFormationTops)
                    {
                        if (ShowColorAxis)
                            strSQL = "SELECT [HDTH] AS [" + BaseDepthMnemonic + "], [" + XColumn + "],[" + YColumn + "],[" + ColorMnemonic + "] FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) " + strAdditionalCondition + "  ORDER BY [HDTH]";
                        else
                            strSQL = "SELECT [HDTH] AS [" + BaseDepthMnemonic + "], [" + XColumn + "],[" + YColumn + "] FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) " + strAdditionalCondition + " ORDER BY [HDTH]";
                    }
                    else
                        // 'This is regular data ...
                        if (ShowColorAxis)
                        strSQL = "SELECT [HDTH] AS [" + BaseDepthMnemonic + "], [" + XColumn + "],[" + YColumn + "],[" + ColorMnemonic + "] FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) " + strAdditionalCondition + " ORDER BY [HDTH]";
                    else
                        strSQL = "SELECT [HDTH] AS [" + BaseDepthMnemonic + "], [" + XColumn + "],[" + YColumn + "] FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) " + strAdditionalCondition + " ORDER BY [HDTH]";

                    DataTable objData = objRequest.objDataService.getTable(strSQL);

                    if (objData.Rows.Count > 0)
                    {
                        int NoOfPoints = objDataSelection.NoOfDataPoints;

                        if (objSeries.SeriesType == 2)
                        {
                            if (NoOfPoints > 2)
                                NoOfPoints = 2;
                        }

                        DataTable objXData = DownSample.downSampleByDepthEx(objData, BaseDepthMnemonic, XColumn, objSeries.groupFunction, NoOfPoints);
                        DataTable objYData = DownSample.downSampleByDepthEx(objData, BaseDepthMnemonic, YColumn, objSeries.groupFunction, NoOfPoints);
                        DataTable objColorData = new DataTable();

                        if (ShowColorAxis)
                            objColorData = DownSample.downSampleByDepthEx(objData, BaseDepthMnemonic, ColorMnemonic, objSeries.groupFunction, NoOfPoints);





                        xData = new double[objXData.Rows.Count - 1 + 1];
                        yData = new double[objXData.Rows.Count - 1 + 1];
                        colorData = new string[objXData.Rows.Count - 1 + 1];

                        int rowIndex = 0;
                        double colorValue = 0;

                        for (int i = 0; i <= objXData.Rows.Count - 1; i++)
                        {
                            xData[i] = Convert.ToDouble(DataService.checkNull(objXData.Rows[i][XColumn], 0));
                            yData[i] = Convert.ToDouble(DataService.checkNull(objYData.Rows[i][YColumn], 0));

                            if (ShowColorAxis)
                            {
                                colorValue = Convert.ToDouble(DataService.checkNull(objColorData.Rows[i][ColorMnemonic], 0));
                                colorData[i] = getColor(colorValue);
                            }
                        }

                        // '#### Implement Depth Matching Functionality ###############''
                        if (objDataSelection.MatchDepthByFormationTops)
                        {

                            // 'get the list of formation tops of both the wells ...
                            Dictionary<string, FormationTop> offsetTops = FormationTop.getList(ref objRequest.objDataService, __WellID);
                            Dictionary<string, FormationTop> mainTops = FormationTop.getList(ref objRequest.objDataService, wellID);

                            // 'get the depth matching list
                            Dictionary<int, DepthMatchingInfo> depthMatchingList = getDepthMatchingList(offsetTops, mainTops);

                            // 'Now match the depth 
                            matchDepth(ref xData, depthMatchingList);

                            // 'Now count the no. of elements that matches the depth criteria
                            int elementCount = 0;

                            for (int i = 0; i <= xData.Length - 1; i++)
                            {
                                if (xData[i] >= fromDepth & xData[i] <= toDepth)
                                    elementCount += 1;
                            }

                            // 'Get the temp array
                            double[] tempXData = new double[elementCount - 1 + 1];
                            double[] tempYData = new double[elementCount - 1 + 1];
                            string[] tempColorData = new string[elementCount - 1 + 1];

                            int subCounter = 0;

                            for (int i = 0; i <= xData.Length - 1; i++)
                            {
                                if (xData[i] >= fromDepth & xData[i] <= toDepth)
                                {
                                    tempXData[subCounter] = xData[i];
                                    tempYData[subCounter] = yData[i];
                                    tempColorData[subCounter] = colorData[i];

                                    subCounter += 1;
                                }
                            }

                            // 'Now again, resize the main arrays and copy temp data ...
                            xData = new double[elementCount - 1 + 1];
                            yData = new double[elementCount - 1 + 1];
                            colorData = new string[elementCount - 1 + 1];

                            for (int i = 0; i <= tempXData.Length - 1; i++)
                            {
                                xData[i] = tempXData[i];
                                yData[i] = tempYData[i];
                                colorData[i] = tempColorData[i];
                            }

                        }
                    }
                    else
                    {
                        xData = new double[0];
                        yData = new double[0];
                        colorData = new string[0];
                    }
                }


                if (Type == 1)
                {
                    if (ShowColorAxis)
                    {
                        strSQL = ";WITH T AS ( ";
                        strSQL += " SELECT RANK() OVER (ORDER BY DATETIME) Rank " + ",DATETIME,[" + ColorMnemonic + "],[HDTH] AS [" + BaseDepthMnemonic + "],[" + XColumn + "],[" + YColumn + "]" + " ";
                        strSQL += " FROM " + dataTableName + " WHERE 1=1 " + strAdditionalCondition;
                        strSQL += "    ) ";
                        strSQL += "   SELECT (Rank-1) / " + Factor.ToString() + " DATETIME " + ",AVG([" + ColorMnemonic + "]) AS [" + ColorMnemonic + "], AVG([" + BaseDepthMnemonic + "]) AS [" + BaseDepthMnemonic + "], AVG([" + XColumn + "]) AS [" + XColumn + "],AVG([" + YColumn + "]) AS [" + YColumn + "]" + " ";
                        strSQL += "    FROM t ";
                        strSQL += "    GROUP BY ((Rank-1) / " + Factor.ToString() + ") ";
                        strSQL += "    ORDER BY DATETIME  ";
                    }
                    else
                    {
                        strSQL = ";WITH T AS ( ";
                        strSQL += " SELECT RANK() OVER (ORDER BY DATETIME) Rank " + ",DATETIME,[HDTH] AS [" + BaseDepthMnemonic + "],[" + XColumn + "],[" + YColumn + "]" + " ";
                        strSQL += " FROM " + dataTableName + " WHERE 1=1 " + strAdditionalCondition;
                        strSQL += "    ) ";
                        strSQL += "   SELECT (Rank-1) / " + Factor.ToString() + " DATETIME " + ",AVG([" + BaseDepthMnemonic + "]) AS [" + BaseDepthMnemonic + "],AVG([" + XColumn + "]) AS [" + XColumn + "],AVG([" + YColumn + "]) AS [" + YColumn + "]" + " ";
                        strSQL += "    FROM t ";
                        strSQL += "    GROUP BY ((Rank-1) / " + Factor.ToString() + ") ";
                        strSQL += "    ORDER BY DATETIME  ";
                    }


                    DataTable objData = objRequest.objDataService.getTable(strSQL);

                    if (objData.Rows.Count > 0)
                    {
                        DataTable objXData = objData;
                        DataTable objYData = objData;
                        DataTable objColorData = new DataTable();

                        if (ShowColorAxis)
                            objColorData = objData;

                        xData = new double[objXData.Rows.Count - 1 + 1];
                        yData = new double[objXData.Rows.Count - 1 + 1];
                        colorData = new string[objXData.Rows.Count - 1 + 1];

                        int rowIndex = 0;
                        double colorValue = 0;

                        for (int i = 0; i <= objXData.Rows.Count - 1; i++)
                        {
                            xData[i] = Convert.ToDouble(DataService.checkNull(objXData.Rows[i][XColumn], 0));
                            yData[i] = Convert.ToDouble(DataService.checkNull(objYData.Rows[i][YColumn], 0));

                            if (ShowColorAxis)
                            {
                                colorValue = Convert.ToDouble(DataService.checkNull(objColorData.Rows[i][ColorMnemonic], 0));
                                colorData[i] = getColor(colorValue);
                            }
                        }

                        // '#### Implement Depth Matching Functionality ###############''
                        if (objDataSelection.MatchDepthByFormationTops)
                        {

                            // 'get the list of formation tops of both the wells ...
                            Dictionary<string, FormationTop> offsetTops = FormationTop.getList(ref objLocalConn, __WellID);
                            Dictionary<string, FormationTop> mainTops = FormationTop.getList(ref objLocalConn, wellID);

                            // 'get the depth matching list
                            Dictionary<int, DepthMatchingInfo> depthMatchingList = getDepthMatchingList(offsetTops, mainTops);

                            // 'Now match the depth 
                            matchDepth(ref xData, depthMatchingList);

                            // 'Now count the no. of elements that matches the depth criteria
                            int elementCount = 0;

                            for (int i = 0; i <= xData.Length - 1; i++)
                            {
                                if (xData[i] >= fromDepth & xData[i] <= toDepth)
                                    elementCount += 1;
                            }

                            // 'Get the temp array
                            double[] tempXData = new double[elementCount - 1 + 1];
                            double[] tempYData = new double[elementCount - 1 + 1];
                            string[] tempColorData = new string[elementCount - 1 + 1];

                            int subCounter = 0;

                            for (int i = 0; i <= xData.Length - 1; i++)
                            {
                                if (xData[i] >= fromDepth & xData[i] <= toDepth)
                                {
                                    tempXData[subCounter] = xData[i];
                                    tempYData[subCounter] = yData[i];
                                    tempColorData[subCounter] = colorData[i];

                                    subCounter += 1;
                                }
                            }

                            // 'Now again, resize the main arrays and copy temp data ...
                            xData = new double[elementCount - 1 + 1];
                            yData = new double[elementCount - 1 + 1];
                            colorData = new string[elementCount - 1 + 1];

                            for (int i = 0; i <= tempXData.Length - 1; i++)
                            {
                                xData[i] = tempXData[i];
                                yData[i] = tempYData[i];
                                colorData[i] = tempColorData[i];
                            }


                        }
                    }
                    else
                    {
                        xData = new double[0];
                        yData = new double[0];
                        colorData = new string[0];
                    }
                }


                if (ShowColorAxis)
                    objSeries.hasColorData = true;
                else
                    objSeries.hasColorData = false;

                objSeries.xDataBuffer = xData;
                objSeries.yDataBuffer = yData;
                objSeries.colorBuffer = colorData;
                objSeries.RefreshRequired = true;

                dataSeries[objSeries.SeriesID] = objSeries;// Copy Series with Data to original DataSeries

            }
            // Ticket 1424 (Comment)
            // dataStatus = 0
            // *************
            catch (Exception ex)
            {
            }
        }

        #region "New Routines for Group Summaries"


        private void generateTimeLogData(string paramSeriesID)
        {
            gdsDataSeries objSeries = localSeries[paramSeriesID];
            string WellboreID = objSeries.ObjectID.Split('~')[0];
            string LogID = objSeries.ObjectID.Split('~')[1];
            string XColumn = objSeries.XColumnID;
            string YColumn = objSeries.YColumnID;
            string ColorMnemonic = ColorAxisMnemonic;
            TimeLog objTimeLog = TimeLog.loadTimeLogWOPlan(ref objRequest.objDataService, wellID, WellboreID, LogID, ref lastError);
            string dataTableName = objTimeLog.__dataTableName;
            string BaseDepthMnemonic = "BASE_DEPTH";
            if (objTimeLog.logCurves.ContainsKey(XColumn))
            {
                ////Nothing to do ...
            }
            else
            {
                XColumn = objMnemonicMappingMgr.getMappedMnemonic(XColumn, objTimeLog.logCurves);
                if (string.IsNullOrEmpty(XColumn.Trim()))
                {
                    return;
                }
            }


            //********
            if (objTimeLog.logCurves.ContainsKey(YColumn))
            {
                // 'Nothing to do ...
            }

            else
            {
                YColumn = objMnemonicMappingMgr.getMappedMnemonic(YColumn, objTimeLog.logCurves);
                if (YColumn.Trim() == "")
                {
                    // 'Ticket 1424  (commnent)
                    // dataStatus = 0
                    // '*************
                    return; // 'No data found ...
                }
            }

            if (ShowColorAxis)
            {
                if (objTimeLog.logCurves.ContainsKey(ColorMnemonic))
                {
                }
                // 'Nothing to do ...
                else
                {
                    ColorMnemonic = objMnemonicMappingMgr.getMappedMnemonic(ColorMnemonic, objTimeLog.logCurves);
                    if (ColorMnemonic.Trim() == "")
                    {
                        ShowColorAxis = false;
                    }
                }
            }

            string strAdditionalCondition = "";
            if (objSeries.DataFilter.Trim() != "")
            {
                string filterCondition = objSeries.DataFilter;
                filterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, filterCondition, fromDepth, toDepth, wellID);
                strAdditionalCondition = strAdditionalCondition + "AND (" + filterCondition + ") ";
            }

            if (objSeries.IgnoreNegative)
            {
                strAdditionalCondition = strAdditionalCondition + "AND [" + XColumn + "]>=0 AND [" + YColumn + "]>=0 ";
            }

            if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.DepthRange | objDataSelection.selectionType == DataSelection.sPlotSelectionType.FromDepthOnwards)
            {
                strAdditionalCondition = strAdditionalCondition + " AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
            }

            if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
            {
                string strTopsFilter = objDataSelection.getTopsFilter();
                if (!string.IsNullOrEmpty(strTopsFilter.Trim()))
                {
                    strAdditionalCondition = strAdditionalCondition + " AND " + strTopsFilter;
                }
            }

            double[] xData = new double[0];
            double[] yData = new double[0];
            string[] colorData = new string[0];
            string strSQL = "";

            // 'Retrieve only Drilling data i.e. with drilling rig states only

            #region "Drilling Data Only"
            ////''#########################################################################################################################''
            ////''################################ DRILLING DATA ONLY #####################################################################''
            ////''#########################################################################################################################''
            if (Type == 0)
            {
                if (ShowColorAxis)
                {
                    // 'strSQL = "SELECT AVG([" + XColumn + "]) AS [" + XColumn + "],AVG([" + YColumn + "]) AS [" + YColumn + "],AVG([" + ColorMnemonic + "]) AS [" + ColorMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) " + strAdditionalCondition + " GROUP BY ROUND(HDTH,0) ORDER BY ROUND(HDTH,0)"
                    strSQL = "SELECT [HDTH] AS [" + BaseDepthMnemonic + "], [" + XColumn + "],[" + YColumn + "],[" + ColorMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) " + strAdditionalCondition + " ORDER BY [HDTH]";
                }
                else
                {
                    strSQL = "SELECT [HDTH] AS [" + BaseDepthMnemonic + "], [" + XColumn + "],[" + YColumn + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) " + strAdditionalCondition + " ORDER BY [HDTH]";
                }

                DataTable objData = objRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {
                    int NoOfPoints = objDataSelection.NoOfDataPoints;
                    if (objSeries.SeriesType == 2)
                    {
                        if (NoOfPoints > 2)
                        {
                            NoOfPoints = 2;
                        }
                    }

                    DataTable objXData = DownSample.downSampleByDepthEx(objData, BaseDepthMnemonic, XColumn, objSeries.groupFunction, NoOfPoints);
                    DataTable objYData = DownSample.downSampleByDepthEx(objData, BaseDepthMnemonic, YColumn, objSeries.groupFunction, NoOfPoints);
                    DataTable objColorData = new DataTable();
                    if (ShowColorAxis)
                    {
                        objColorData = DownSample.downSampleByDepthEx(objData, BaseDepthMnemonic, ColorMnemonic, objSeries.groupFunction, NoOfPoints);
                    };
                    Array.Resize(ref xData, objXData.Rows.Count - 1);
                    Array.Resize(ref yData, objXData.Rows.Count - 1);
                    Array.Resize(ref colorData, objXData.Rows.Count - 1);


                    int rowIndex = 0;
                    double colorValue = 0d;
                    //for (int i = 0, loopTo = objXData.Rows.Count - 1; i <= loopTo; i++)
                    for (int i = 0, loopTo = objXData.Rows.Count - 1; i < loopTo; i++)
                    {
                        if (i == 1748)
                        {
                            bool halt = true;
                        }
                        xData[i] = Convert.ToDouble(DataService.checkNull(objXData.Rows[i][XColumn], 0));
                        yData[i] = Convert.ToDouble(DataService.checkNull(objYData.Rows[i][YColumn], 0));
                        if (ShowColorAxis)
                        {
                            colorValue = Convert.ToDouble(DataService.checkNull(objColorData.Rows[i][ColorMnemonic], 0));
                            colorData[i] = getColor(colorValue);
                        }
                    }
                }
                else
                {
                    Array.Resize(ref xData, 0);
                    Array.Resize(ref yData, 0);
                    Array.Resize(ref colorData, 0);
                }
            }

            #endregion

            #region "Non Drilling Data"
            ////''#########################################################################################################################''
            ////''################################ NON DRILLING DATA  #####################################################################''
            ////''#########################################################################################################################''


            if (Type == 1)
            {
                if (ShowColorAxis)
                {
                    // 'strSQL = "SELECT AVG([" + XColumn + "]) AS [" + XColumn + "],AVG([" + YColumn + "]) AS [" + YColumn + "],AVG([" + ColorMnemonic + "]) AS [" + ColorMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) " + strAdditionalCondition + " GROUP BY ROUND(HDTH,0) ORDER BY ROUND(HDTH,0)"
                    // 'strSQL = "SELECT [HDTH] AS [" + BaseDepthMnemonic + "], [" + XColumn + "],[" + YColumn + "],[" + ColorMnemonic + "] FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND RIG_STATE IN (0,1,19) " + strAdditionalCondition + " ORDER BY [HDTH]"

                    strSQL = ";WITH T AS ( ";
                    strSQL += " SELECT RANK() OVER (ORDER BY DATETIME) Rank " + ",DATETIME,[" + ColorMnemonic + "],[HDTH] AS [" + BaseDepthMnemonic + "],[" + XColumn + "],[" + YColumn + "]" + " ";
                    strSQL += " FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' and DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' " + strAdditionalCondition;
                    strSQL += "    ) ";
                    strSQL += "   SELECT (Rank-1) / " + Factor.ToString() + " DATETIME " + ",AVG([" + ColorMnemonic + "]) AS [" + ColorMnemonic + "], AVG([" + BaseDepthMnemonic + "]) AS [" + BaseDepthMnemonic + "], AVG([" + XColumn + "]) AS [" + XColumn + "],AVG([" + YColumn + "]) AS [" + YColumn + "]" + " ";
                    strSQL += "    FROM t ";
                    strSQL += "    GROUP BY ((Rank-1) / " + Factor.ToString() + ") ";
                    strSQL += "    ORDER BY DATETIME  ";
                }
                else
                {


                    strSQL = ";WITH T AS ( ";
                    strSQL += " SELECT RANK() OVER (ORDER BY DATETIME) Rank " + ",DATETIME,[HDTH] AS [" + BaseDepthMnemonic + "],[" + XColumn + "],[" + YColumn + "]" + " ";
                    strSQL += " FROM " + objTimeLog.__dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' and DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' " + strAdditionalCondition;
                    strSQL += "    ) ";
                    strSQL += "   SELECT (Rank-1) / " + Factor.ToString() + " DATETIME " + ",AVG([" + BaseDepthMnemonic + "]) AS [" + BaseDepthMnemonic + "],AVG([" + XColumn + "]) AS [" + XColumn + "],AVG([" + YColumn + "]) AS [" + YColumn + "]" + " ";
                    strSQL += "    FROM t ";
                    strSQL += "    GROUP BY ((Rank-1) / " + Factor.ToString() + ") ";
                    strSQL += "    ORDER BY DATETIME  ";
                }

                DataTable objData = objRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {
                    var objXData = objData;
                    var objYData = objData;
                    var objColorData = default(DataTable);
                    if (ShowColorAxis)
                    {
                        objColorData = objData;
                    };
                    Array.Resize(ref xData, objXData.Rows.Count - 1);
                    Array.Resize(ref yData, objXData.Rows.Count - 1);
                    Array.Resize(ref colorData, objXData.Rows.Count - 1);
                    int rowIndex = 0;
                    double colorValue = 0;
                    for (int i = 0, loopTo = objXData.Rows.Count - 1; i <= loopTo; i++)
                    {
                        xData[i] = Convert.ToDouble(DataService.checkNull(objXData.Rows[i][XColumn], 0));
                        yData[i] = Convert.ToDouble(DataService.checkNull(objYData.Rows[i][YColumn], 0));
                        if (ShowColorAxis)
                        {
                            colorValue = Convert.ToDouble(DataService.checkNull(objColorData.Rows[i][ColorMnemonic], 0));
                            colorData[i] = getColor(colorValue);
                        }
                    }
                }
                else
                {
                    Array.Resize(ref xData, 0);
                    Array.Resize(ref yData, 0);
                    Array.Resize(ref colorData, 0);
                }
            }



            #endregion

            if (ShowColorAxis)
            {
                objSeries.hasColorData = true;
            }
            else
            {
                objSeries.hasColorData = false;
            }

            // '//##### Road Maps #####################################''//
            if (objSeries.ShowRoadMap)
            {


                // 'Load Well RoadMaps first ...
                Dictionary<string, string> wellRoadMaps = new Dictionary<string, string>();
                DataTable objData1 = objRequest.objDataService.getTable("SELECT MNEMONIC,RM_ID FROM VMX_WELL_RM WHERE WELL_ID='" + wellID.Replace("'", "''") + "'");
                string mnemonic = "";
                string RMID = "";
                foreach (DataRow objRow in objData1.Rows)
                {
                    mnemonic = (string)DataService.checkNull(objRow["MNEMONIC"], "");
                    RMID = (string)DataService.checkNull(objRow["RM_ID"], "");
                    if (!wellRoadMaps.ContainsKey(mnemonic))
                    {
                        wellRoadMaps.Add(mnemonic, RMID);
                    }
                }

                string stdMnemonic = "";

                // 'Check if roadmap exist ...

                if (PlotOrientation == 0)
                {
                    if (wellRoadMaps.ContainsKey(YColumn))
                    {
                        RMID = wellRoadMaps[YColumn];
                    }
                    else
                    {
                        // 'Try again with Standard Channel
                        stdMnemonic = "";
                        stdMnemonic = objMnemonicMappingMgr.getStdMnemonic(YColumn);

                        if (!string.IsNullOrEmpty(stdMnemonic.Trim()))
                        {
                            if (wellRoadMaps.ContainsKey(stdMnemonic))
                            {
                                RMID = wellRoadMaps[stdMnemonic];
                            }
                        }
                    }
                }

                if (PlotOrientation == 1)
                {
                    if (wellRoadMaps.ContainsKey(XColumn))
                    {
                        RMID = wellRoadMaps[XColumn];
                    }
                    else
                    {
                        // 'Try again with Standard Channel
                        stdMnemonic = "";
                        stdMnemonic = objMnemonicMappingMgr.getStdMnemonic(XColumn);
                        if (!string.IsNullOrEmpty(stdMnemonic.Trim()))
                        {
                            if (wellRoadMaps.ContainsKey(stdMnemonic))
                            {
                                RMID = wellRoadMaps[stdMnemonic];
                            }
                        }
                    }
                };
                Array.Resize(ref roadmapDepth, 0);
                Array.Resize(ref roadmapMax, 0);
                Array.Resize(ref roadmapMin, 0);

                // '//First look if we have road map for this mnemonic ... //

                RM objRoadMap = RM.load(ref objRequest.objDataService, RMID, ref lastError);
                if (objRoadMap is object)
                {
                    objSeries.RMColor = ColorTranslator.ToHtml(objRoadMap.RMColor);
                    
                    if (objRoadMap.RoadmapEntries.Count > 0)
                    {

                        // 'Find the Min and Max Depth ...
                        double minDepth = 0;
                        double maxDepth = 0;
                        double currentDepth = 0;
                        RMEntries[] arrRoadMap = objRoadMap.RoadmapEntries.Values.ToArray();
                        Array.Sort(arrRoadMap);
                        minDepth = arrRoadMap[0].depth;
                        maxDepth = arrRoadMap[arrRoadMap.Length - 1].depth;

                        Array.Resize(ref roadmapDepth, arrRoadMap.Length);
                        Array.Resize(ref roadmapMax, arrRoadMap.Length);
                        Array.Resize(ref roadmapMin, arrRoadMap.Length);



                        //for (int i = 0, loopTo = arrRoadMap.Length - 1; i < loopTo; i++)
                        for (int i = 0; i <= arrRoadMap.Length - 1; i++)
                        {
                            //objSeries.roadmapDepth[i] = arrRoadMap[i].depth;
                            //objSeries.roadmapMin[i] = arrRoadMap[i].minValue;
                            //objSeries.roadmapMax[i] = arrRoadMap[i].maxValue;

                            roadmapDepth[i] = arrRoadMap[i].depth;
                            roadmapMin[i] = arrRoadMap[i].minValue;
                            roadmapMax[i] = arrRoadMap[i].maxValue;

                            objSeries.roadmapDepth = roadmapDepth;
                            objSeries.roadmapMin= roadmapMin;
                            objSeries.roadmapMax = roadmapMax;



                        }
                    }
                }
            }

            objSeries.xDataBuffer = xData;
            objSeries.yDataBuffer = yData;
            objSeries.colorBuffer = colorData;
            objSeries.RefreshRequired = true;

            dataSeries[objSeries.SeriesID] = objSeries;// Copy Series with Data to original DataSeries


        }

        private void generateTimeLogDataForGroupSummariesOffsetWell(string paramSeriesID)
        {
            try
            {
                dataStatus = 1;
                gdsDataSeries objSeries = localSeries[paramSeriesID];
                string WellboreID = objSeries.ObjectID.Split('~')[0];
                string LogID = objSeries.ObjectID.Split('~')[1];



                TimeLog objTimeLog = TimeLog.loadTimeLogWOPlan(ref objRequest.objDataService, objSeries.__WellID, WellboreID, LogID, ref lastError);
                string dataTableName = objTimeLog.__dataTableName;
                string strSQL = "";
                double[] xData = default(double[]);
                double[] yData = default(double[]);
                string strXColumn = "";
                string strGroupBy = "";
                string strFilterCondition = objSeries.grpFilter;

                // '#* Time Duration **************************
                if (objSeries.grpExpressionType == 0)
                {
                    strXColumn = " (SUM(TIME_DURATION)) AS XCOLUMN ";
                }

                // '#* Footage **************************
                if (objSeries.grpExpressionType == 1)
                {
                    strXColumn = " (SUM(HDTH-NEXT_DEPTH)) AS XCOLUMN ";
                }

                // '#* ROP ********************
                if (objSeries.grpExpressionType == 2)
                {
                    strXColumn = " (SUM(HDTH-NEXT_DEPTH)/ ((SUM(TIME_DURATION)/60)/60)) AS XCOLUMN ";
                }

                // '#* Other Channel with Function ********************
                if (objSeries.grpExpressionType == 3)
                {
                    string strGrpColumn = objSeries.grpExpression;
                    if (objTimeLog.logCurves.ContainsKey(strGrpColumn))
                    {
                    }
                    // 'Nothing to do ...
                    else
                    {
                        strGrpColumn = objMnemonicMappingMgr.getMappedMnemonic(strGrpColumn, objTimeLog.logCurves);
                        if (string.IsNullOrEmpty(strGrpColumn.Trim()))
                        {
                            // 'Ticket 1424  (commnent)
                            // dataStatus = 0
                            // '**********
                            return; // 'No data found ...
                        }
                    }

                    switch (objSeries.grpFunctionType)
                    {
                        case 0: // 'Sum

                            strXColumn = " SUM([" + strGrpColumn + "]) AS XCOLUMN ";
                            break;


                        case 1: // 'Max

                            strXColumn = " MAX([" + strGrpColumn + "]) AS XCOLUMN ";
                            break;


                        case 2: // 'Min

                            strXColumn = " MIN([" + strGrpColumn + "]) AS XCOLUMN ";
                            break;


                        case 3: // 'Avg

                            strXColumn = " AVG([" + strGrpColumn + "]) AS XCOLUMN ";
                            break;

                    }
                }



                // '#** Group By
                switch (objSeries.grpGroupBy)
                {
                    case 0:
                        {
                            strGroupBy = "[RIG_STATE]";
                            break;
                        }

                    case 1:
                        {
                            strGroupBy = "[DATETIME]";
                            break;
                        }

                    case 2:
                        {
                            strGroupBy = "DATEPART(DAY,DATETIME)";
                            break;
                        }

                    case 3:
                        {
                            strGroupBy = "DATEPART(WEEK,DATETIME)";
                            break;
                        }

                    case 4:
                        {
                            strGroupBy = "DATEPART(MONTH,DATETIME)";
                            break;
                        }

                    case 5:
                        {
                            strGroupBy = "[HDTH]";
                            break;
                        }

                    case 6:
                        {
                            string strGrpColumn = objSeries.grpGroupByExpression;
                            if (objTimeLog.logCurves.ContainsKey(strGrpColumn))
                            {
                            }
                            // 'Nothing to do ...
                            else
                            {
                                strGrpColumn = objMnemonicMappingMgr.getMappedMnemonic(strGrpColumn, objTimeLog.logCurves);
                                if (string.IsNullOrEmpty(strGrpColumn.Trim()))
                                {
                                    // 'Ticket 1424  (commnent)
                                    // dataStatus = 0
                                    // '************
                                    return; // 'No data found ...
                                }
                            }

                            strGroupBy = "[" + strGrpColumn + "]";
                            break;
                        }
                }

                // '
                var fromDateOffset = default(DateTime);
                var toDateOffset = default(DateTime);
                objDataSelection.getRange2(ref fromDateOffset, ref toDateOffset, ref fromDepth, ref toDepth, ref ChartTitle, this);

                // strSQL = "SELECT " + strXColumn + "," + strGroupBy + " AS YCOLUMN FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 AND DATETIME>='" + fromDateOffset.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDateOffset.ToString("dd-MMM-yyyy HH:mm:ss") + "' "
                if (Type == 0)
                {
                    strSQL = "SELECT " + strXColumn + "," + strGroupBy + " AS YCOLUMN FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 ";
                }
                else
                {
                    strSQL = "SELECT " + strXColumn + "," + strGroupBy + " AS YCOLUMN FROM " + dataTableName + " ";
                }

                // If objSummary.objDataSelection.selectionType = DataSelection.sPlotSelectionType.DepthRange Or objSummary.objDataSelection.selectionType = DataSelection.sPlotSelectionType.FromDepthOnwards Then
                if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.DepthRange | objDataSelection.selectionType == DataSelection.sPlotSelectionType.FromDepthOnwards | objDataSelection.selectionType == DataSelection.sPlotSelectionType.ByHours)
                {
                    strSQL = strSQL + " AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
                }

                if (!string.IsNullOrEmpty(strFilterCondition.Trim()))
                {
                    strFilterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, strFilterCondition, fromDepth, toDepth, objSeries.__WellID);
                    strSQL = strSQL + " AND " + strFilterCondition;
                }

                if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                {
                    string strTopsFilter = objDataSelection.getTopsFilter();
                    if (!string.IsNullOrEmpty(strTopsFilter.Trim()))
                    {
                        strSQL = strSQL + " AND " + strTopsFilter;
                    }
                }

                strSQL = strSQL + " GROUP BY " + strGroupBy;
                strSQL = strSQL + " ORDER BY " + strGroupBy;
                DataTable objData = objRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {

                    // 'Pie Chart ... Limit no. of rows to 50 only
                    if (objSeries.SeriesType == 4)
                    {
                        if (objData.Rows.Count > 50)
                        {
                            xData = new double[50];
                            yData = new double[50];
                            for (int i = 0; i <= 49; i++)
                            {
                                xData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["XCOLUMN"], 0));
                                yData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["YCOLUMN"], 0));
                            }
                        }
                        else
                        {
                            xData = new double[objData.Rows.Count];
                            yData = new double[objData.Rows.Count];
                            for (int i = 0, loopTo = objData.Rows.Count - 1; i <= loopTo; i++)
                            {
                                xData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["XCOLUMN"], 0));
                                yData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["YCOLUMN"], 0));
                            }
                        }
                    }

                    // 'Bar Chart ... There is no limit for the data ...
                    if (objSeries.SeriesType == 5)
                    {
                        xData = new double[objData.Rows.Count];
                        yData = new double[objData.Rows.Count];
                        for (int i = 0, loopTo1 = objData.Rows.Count - 1; i <= loopTo1; i++)
                        {
                            xData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["XCOLUMN"], 0));
                            yData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["YCOLUMN"], 0));
                        }
                    }
                }
                else
                {
                    xData = new double[0];
                    yData = new double[0];
                }

                objSeries.xDataBuffer = xData;
                objSeries.yDataBuffer = yData;
                objSeries.colorBuffer = null;
                objSeries.RefreshRequired = true;
                dataSeries[objSeries.SeriesID] = objSeries;// Copy Series with Data to original DataSeries
            }
            catch (Exception ex)
            {


            }
        }


        private void generateTimeLogDataForGroupSummaries(string paramSeriesID)
        {
            try
            {
                dataStatus = 1;
                gdsDataSeries objSeries = localSeries[paramSeriesID];
                string WellboreID = objSeries.ObjectID.Split('~')[0];
                string LogID = objSeries.ObjectID.Split('~')[1];
                TimeLog objTimeLog = TimeLog.loadTimeLogWOPlan(ref objRequest.objDataService, wellID, WellboreID, LogID, ref lastError);
                string dataTableName = objTimeLog.__dataTableName;
                string strSQL = "";
                var xData = default(double[]);
                var yData = default(double[]);
                string strXColumn = "";
                string strGroupBy = "";
                string strFilterCondition = objSeries.grpFilter;

                // '#* Time Duration **************************
                if (objSeries.grpExpressionType == 0)
                {
                    strXColumn = " (SUM(TIME_DURATION)) AS XCOLUMN ";
                }

                // '#* Footage **************************
                if (objSeries.grpExpressionType == 1)
                {
                    strXColumn = " (SUM(HDTH-NEXT_DEPTH)) AS XCOLUMN ";
                }

                // '#* ROP ********************
                if (objSeries.grpExpressionType == 2)
                {
                    strXColumn = " (SUM(HDTH-NEXT_DEPTH)/ ((SUM(TIME_DURATION)/60)/60)) AS XCOLUMN ";
                }

                // '#* Other Channel with Function ********************
                if (objSeries.grpExpressionType == 3)
                {
                    string strGrpColumn = objSeries.grpExpression;
                    if (objTimeLog.logCurves.ContainsKey(strGrpColumn))
                    {
                    }
                    // 'Nothing to do ...
                    else
                    {
                        strGrpColumn = objMnemonicMappingMgr.getMappedMnemonic(strGrpColumn, objTimeLog.logCurves);
                        if (string.IsNullOrEmpty(strGrpColumn.Trim()))
                        {
                            // 'Ticket 1424  (commnent)
                            // dataStatus = 0
                            // '**********
                            return; // 'No data found ...
                        }
                    }

                    switch (objSeries.grpFunctionType)
                    {
                        case 0: // 'Sum
                            {
                                strXColumn = " SUM([" + strGrpColumn + "]) AS XCOLUMN ";
                                break;
                            }

                        case 1: // 'Max
                            {
                                strXColumn = " MAX([" + strGrpColumn + "]) AS XCOLUMN ";
                                break;
                            }

                        case 2: // 'Min
                            {
                                strXColumn = " MIN([" + strGrpColumn + "]) AS XCOLUMN ";
                                break;
                            }

                        case 3: // 'Avg
                            {
                                strXColumn = " AVG([" + strGrpColumn + "]) AS XCOLUMN ";
                                break;
                            }
                    }
                }



                // '#** Group By
                switch (objSeries.grpGroupBy)
                {
                    case 0:
                        {
                            strGroupBy = "[RIG_STATE]";
                            break;
                        }

                    case 1:
                        {
                            strGroupBy = "[DATETIME]";
                            break;
                        }

                    case 2:
                        {
                            strGroupBy = "DATEPART(DAY,DATETIME)";
                            break;
                        }

                    case 3:
                        {
                            strGroupBy = "DATEPART(WEEK,DATETIME)";
                            break;
                        }

                    case 4:
                        {
                            strGroupBy = "DATEPART(MONTH,DATETIME)";
                            break;
                        }

                    case 5:
                        {
                            strGroupBy = "[HDTH]";
                            break;
                        }

                    case 6:
                        {
                            string strGrpColumn = objSeries.grpGroupByExpression;
                            if (objTimeLog.logCurves.ContainsKey(strGrpColumn))
                            {
                            }
                            // 'Nothing to do ...
                            else
                            {
                                strGrpColumn = objMnemonicMappingMgr.getMappedMnemonic(strGrpColumn, objTimeLog.logCurves);
                                if (string.IsNullOrEmpty(strGrpColumn.Trim()))
                                {
                                    // 'Ticket 1424  (commnent)
                                    // dataStatus = 0
                                    // '*******************
                                    return; // 'No data found ...
                                }
                            }

                            strGroupBy = "[" + strGrpColumn + "]";
                            break;
                        }
                }

                if (Type == 0)
                {
                    strSQL = "SELECT " + strXColumn + "," + strGroupBy + " AS YCOLUMN FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) AND NEXT_DEPTH>0 AND HDTH>=0 AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                }
                else
                {
                    strSQL = "SELECT " + strXColumn + "," + strGroupBy + " AS YCOLUMN FROM " + dataTableName + " WHERE DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                }

                if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.DepthRange | objDataSelection.selectionType == DataSelection.sPlotSelectionType.FromDepthOnwards)
                {
                    strSQL = strSQL + " AND HDTH>=" + fromDepth.ToString() + " AND HDTH<=" + toDepth.ToString() + " ";
                }

                if (!string.IsNullOrEmpty(strFilterCondition.Trim()))
                {
                    strFilterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, strFilterCondition, fromDepth, toDepth, wellID);
                    strSQL = strSQL + " AND " + strFilterCondition;
                }

                if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                {
                    string strTopsFilter = objDataSelection.getTopsFilter();
                    if (!string.IsNullOrEmpty(strTopsFilter.Trim()))
                    {
                        strSQL = strSQL + " AND " + strTopsFilter;
                    }
                }

                strSQL = strSQL + " GROUP BY " + strGroupBy;
                strSQL = strSQL + " ORDER BY " + strGroupBy;
                DataTable objData = objRequest.objDataService.getTable(strSQL);
                if (objData.Rows.Count > 0)
                {

                    // 'Pie Chart ... Limit no. of rows to 50 only
                    if (objSeries.SeriesType == 4)
                    {
                        if (objData.Rows.Count > 50)
                        {
                            xData = new double[50];
                            yData = new double[50];
                            for (int i = 0; i <= 49; i++)
                            {
                                xData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["XCOLUMN"], 0));
                                yData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["YCOLUMN"], 0));
                            }
                        }
                        else
                        {
                            xData = new double[objData.Rows.Count];
                            yData = new double[objData.Rows.Count];
                            for (int i = 0, loopTo = objData.Rows.Count - 1; i <= loopTo; i++)
                            {
                                xData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["XCOLUMN"], 0));
                                yData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["YCOLUMN"], 0));
                            }
                        }
                    }

                    // 'Bar Chart ... There is no limit for the data ...
                    if (objSeries.SeriesType == 5)
                    {
                        xData = new double[objData.Rows.Count];
                        yData = new double[objData.Rows.Count];
                        for (int i = 0, loopTo1 = objData.Rows.Count - 1; i <= loopTo1; i++)
                        {
                            xData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["XCOLUMN"], 0));
                            yData[i] = Convert.ToDouble(DataService.checkNull(objData.Rows[i]["YCOLUMN"], 0));
                        }
                    }
                }
                else
                {
                    xData = new double[0];
                    yData = new double[0];
                }

                objSeries.xDataBuffer = xData;
                objSeries.yDataBuffer = yData;
                objSeries.colorBuffer = null;
                objSeries.RefreshRequired = true;
                dataSeries[objSeries.SeriesID] = objSeries;// Copy Series with Data to original DataSeries
            }
            // dataStatus = 0

            catch (Exception ex)
            {
                // 'prath Ticket No. 1424 (make comment)
                // dataStatus = 0
                // '**********
            }

        }

        private void generateTimeLogDataForGroupSummariesSplit(string paramSeriesID)
        {
            try
            {
                dataStatus = 1;
                gdsDataSeries objSeries = localSeries[paramSeriesID];
                string WellboreID = objSeries.ObjectID.Split('~')[0];
                string LogID = objSeries.ObjectID.Split('~')[1];
                TimeLog objTimeLog = TimeLog.loadTimeLogWOPlan(ref objRequest.objDataService, wellID, WellboreID, LogID, ref lastError);
                string dataTableName = objTimeLog.__dataTableName;
                string strFilterCondition = objSeries.grpFilter;
                //var xDataList = new Collection();
                //var yDataList = new Collection();
                //var labelList = new Collection();

                List<double> xDataList = new List<double>();
                List<double> yDataList = new List<double>();
                List<string> labelList = new List<string>();
                string strSQL = "";


                // '===== We need to split the data based on split conditions specified ==============''
                string splitMnemonic = objSeries.splitMnemonic;
                if (objTimeLog.logCurves.ContainsKey(splitMnemonic))
                {
                }
                // 'Nothing to do ...
                else
                {
                    splitMnemonic = objMnemonicMappingMgr.getMappedMnemonic(splitMnemonic, objTimeLog.logCurves);
                    if (string.IsNullOrEmpty(splitMnemonic.Trim()))
                    {
                        // 'Ticket 1424  (commnent)
                        // dataStatus = 0
                        // '**********
                        return; // 'No data found ...
                    }
                }

                var splitRanges = new Dictionary<int, splitRange>();
                if (objSeries.SplitType == 0)
                {
                    // 'Variable Ranges ...

                    for (int i = Convert.ToInt32(objSeries.variableRangeFrom), loopTo = Convert.ToInt32(objSeries.variableRangeTo); objSeries.variableRangeIncrement >= 0 ? i <= loopTo : i >= loopTo; i += Convert.ToInt32(objSeries.variableRangeIncrement))
                    {
                        var objRange = new splitRange();
                        objRange.fromValue = i;
                        objRange.toValue = i + objSeries.variableRangeIncrement;
                        splitRanges.Add(splitRanges.Count + 1, objRange);
                    }
                }
                else
                {

                    // 'Get the readymade split ranges

                    splitRanges = objSeries.FixedRangeList;
                }

                var singleList = new Dictionary<double, double>();
                foreach (splitRange objItem in splitRanges.Values)
                {
                    if (!singleList.ContainsKey(objItem.fromValue))
                    {
                        singleList.Add(objItem.fromValue, objItem.fromValue);
                    }

                    if (!singleList.ContainsKey(objItem.toValue))
                    {
                        singleList.Add(objItem.toValue, objItem.toValue);
                    }
                }


                // '============ Loop through each range and generate dataset ====================================''
                foreach (splitRange objItem in splitRanges.Values)
                {
                    double minValue = Math.Round(objItem.fromValue, 2);
                    double maxValue = Math.Round(objItem.toValue, 2);


                    // '#* Time Duration **************************
                    if (objSeries.grpExpressionType == 0)
                    {

                        // 'Total Time duration 
                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE [" + splitMnemonic + "]>=" + minValue.ToString() + " AND [" + splitMnemonic + "]<=" + maxValue.ToString() + " AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                        if (!string.IsNullOrEmpty(strFilterCondition.Trim()))
                        {
                            strFilterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, strFilterCondition, fromDepth, toDepth, wellID);
                            strSQL = strSQL + " AND " + strFilterCondition;
                        }

                        if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                        {
                            string strTopsFilter = objDataSelection.getTopsFilter();
                            if (!string.IsNullOrEmpty(strTopsFilter.Trim()))
                            {
                                strSQL = strSQL + " AND " + strTopsFilter;
                            }
                        }

                        double lnValue = Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));

                        // 'Add this value to the list ...


                        xDataList.Add(xDataList.Count + 1);
                        yDataList.Add(lnValue);
                        labelList.Add(minValue.ToString() + "-" + maxValue.ToString());
                    }

                    // '#* Footage **************************
                    if (objSeries.grpExpressionType == 1)
                    {

                        // 'Total Drilling Footage
                        strSQL = "SELECT (SUM(HDTH-NEXT_DEPTH)) AS XCOLUMN  FROM " + dataTableName + " WHERE [" + splitMnemonic + "]>=" + minValue.ToString() + " AND [" + splitMnemonic + "]<=" + maxValue.ToString() + " AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                        if (!string.IsNullOrEmpty(strFilterCondition.Trim()))
                        {
                            strFilterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, strFilterCondition, fromDepth, toDepth, wellID);
                            strSQL = strSQL + " AND " + strFilterCondition;
                        }

                        if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                        {
                            string strTopsFilter = objDataSelection.getTopsFilter();
                            if (!string.IsNullOrEmpty(strTopsFilter.Trim()))
                            {
                                strSQL = strSQL + " AND " + strTopsFilter;
                            }
                        }

                        double lnValue = Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));

                        // 'Add this value to the list ...
                        xDataList.Add(xDataList.Count + 1);
                        yDataList.Add(lnValue);
                        labelList.Add(minValue.ToString() + "-" + maxValue.ToString());
                    }

                    // '#* ROP ********************
                    if (objSeries.grpExpressionType == 2)
                    {

                        // 'Total Drilling ROP
                        strSQL = "SELECT (SUM(HDTH-NEXT_DEPTH)/ ((SUM(TIME_DURATION)/60)/60)) AS XCOLUMN FROM " + dataTableName + " WHERE [" + splitMnemonic + "]>=" + minValue.ToString() + " AND [" + splitMnemonic + "]<=" + maxValue.ToString() + " AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                        if (!string.IsNullOrEmpty(strFilterCondition.Trim()))
                        {
                            strFilterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, strFilterCondition, fromDepth, toDepth, wellID);
                            strSQL = strSQL + " AND " + strFilterCondition;
                        }

                        if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                        {
                            string strTopsFilter = objDataSelection.getTopsFilter();
                            if (!string.IsNullOrEmpty(strTopsFilter.Trim()))
                            {
                                strSQL = strSQL + " AND " + strTopsFilter;
                            }
                        }

                        double lnValue = Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));

                        // 'Add this value to the list ...
                        xDataList.Add(xDataList.Count + 1);
                        yDataList.Add(lnValue);
                        labelList.Add(minValue.ToString() + "-" + maxValue.ToString());
                    }


                    // 'Drilling Time % ************
                    if (objSeries.grpExpressionType == 4)
                    {


                        // 'In case of non linear ranges, it's safe to loop through each range and find the total ...
                        double TotalSeconds = 0d;
                        foreach (splitRange objSubItem in splitRanges.Values)
                        {

                            // 'Total Time duration 
                            strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) AND [" + splitMnemonic + "]>=" + objSubItem.fromValue.ToString() + " AND [" + splitMnemonic + "]<=" + objSubItem.toValue.ToString() + " AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                            if (!string.IsNullOrEmpty(strFilterCondition.Trim()))
                            {
                                strFilterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, strFilterCondition, fromDepth, toDepth, wellID);
                                strSQL = strSQL + " AND " + strFilterCondition;
                            }

                            if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                            {
                                string strTopsFilter = objDataSelection.getTopsFilter();
                                if (!string.IsNullOrEmpty(strTopsFilter.Trim()))
                                {
                                    strSQL = strSQL + " AND " + strTopsFilter;
                                }
                            }

                            TotalSeconds = TotalSeconds + Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));
                        }

                        strSQL = "SELECT SUM(TIME_DURATION) FROM " + dataTableName + " WHERE RIG_STATE IN (0,1,19) AND [" + splitMnemonic + "]>=" + minValue.ToString() + " AND [" + splitMnemonic + "]<=" + maxValue.ToString() + " AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                        if (!string.IsNullOrEmpty(strFilterCondition.Trim()))
                        {
                            strFilterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, strFilterCondition, fromDepth, toDepth, wellID);
                            strSQL = strSQL + " AND " + strFilterCondition;
                        }

                        if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                        {
                            string strTopsFilter = objDataSelection.getTopsFilter();
                            if (!string.IsNullOrEmpty(strTopsFilter.Trim()))
                            {
                                strSQL = strSQL + " AND " + strTopsFilter;
                            }
                        }

                        double DrillingSeconds = Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));
                        double TimePercent = 0d;
                        if (DrillingSeconds > 0d & TotalSeconds > 0d)
                        {
                            TimePercent = Math.Round(DrillingSeconds * 100d / TotalSeconds, 2);
                        }


                        // 'Add this value to the list ...
                        xDataList.Add(maxValue);
                        yDataList.Add(TimePercent);
                        labelList.Add(minValue.ToString() + "-" + maxValue.ToString());
                    }



                    // '#* Other Channel with Function ********************
                    if (objSeries.grpExpressionType == 3)
                    {
                        string grpColumn = objSeries.grpExpression;
                        if (objTimeLog.logCurves.ContainsKey(grpColumn))
                        {
                        }
                        // 'Nothing to do ...
                        else
                        {
                            splitMnemonic = objMnemonicMappingMgr.getMappedMnemonic(grpColumn, objTimeLog.logCurves);
                            if (string.IsNullOrEmpty(grpColumn.Trim()))
                            {
                                // '*********
                                // dataStatus = 0
                                // '**************
                                return; // 'No data found ...
                            }
                        }

                        string tXColumn = "";
                        switch (objSeries.grpFunctionType)
                        {
                            case 0: // 'Sum

                                tXColumn = " SUM([" + grpColumn + "]) AS XCOLUMN ";
                                break;


                            case 1: // 'Max

                                tXColumn = " MAX([" + grpColumn + "]) AS XCOLUMN ";
                                break;


                            case 2: // 'Min

                                tXColumn = " MIN([" + grpColumn + "]) AS XCOLUMN ";
                                break;


                            case 3: // 'Avg

                                tXColumn = " AVG([" + grpColumn + "]) AS XCOLUMN ";
                                break;

                        }

                        strSQL = "SELECT " + tXColumn + " FROM " + dataTableName + " WHERE [" + splitMnemonic + "]>=" + minValue.ToString() + " AND [" + splitMnemonic + "]<=" + maxValue.ToString() + " AND DATETIME>='" + fromDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' AND DATETIME<='" + toDate.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";

                        if (!string.IsNullOrEmpty(strFilterCondition.Trim()))
                        {
                            strFilterCondition = wellSection.getFilterConditionWithCustomFields(ref objRequest.objDataService, strFilterCondition, fromDepth, toDepth, wellID);
                            strSQL = strSQL + " AND " + strFilterCondition;
                        }

                        if (objDataSelection.selectionType == DataSelection.sPlotSelectionType.FormationTops)
                        {
                            string strTopsFilter = objDataSelection.getTopsFilter();
                            if (!string.IsNullOrEmpty(strTopsFilter.Trim()))
                            {
                                strSQL = strSQL + " AND " + strTopsFilter;
                            }
                        }

                        double lnValue = Util.ValEx(objRequest.objDataService.getValueFromDatabase(strSQL));

                        // 'Add this value to the list ...
                        xDataList.Add(maxValue);
                        yDataList.Add(lnValue);
                        labelList.Add(minValue.ToString() + "-" + maxValue.ToString());
                    }
                }
                // '==============================================================================================''


                double[] xData = default(double[]);
                double[] yData = default(double[]);
                string[] labelData = default(string[]);
                if (xDataList.Count > 0)
                {
                    xData = new double[xDataList.Count];
                    yData = new double[xDataList.Count];
                    labelData = new string[xDataList.Count];
                    for (int i = 1, loopTo1 = xDataList.Count; i <= loopTo1; i++)
                    {
                        xData[i - 1] = Convert.ToDouble(xDataList[i-1]); //Old was xDataList[i] 
                        yData[i - 1] = Convert.ToDouble(yDataList[i-1]);
                        labelData[i - 1] = Convert.ToString(labelList[i-1]);
                    }
                }
                else
                {
                    xData = new double[0];
                    yData = new double[0];
                    labelData = new string[0];
                }

                objSeries.xDataBuffer = xData;
                objSeries.yDataBuffer = yData;
                objSeries.labelBuffer = labelData;
                objSeries.colorBuffer = null;
                objSeries.RefreshRequired = true;
                dataSeries[objSeries.SeriesID] = objSeries;// Copy Series with Data to original DataSeries
            }


            catch (Exception ex)
            {
                // 'prath Ticket No. 1424 (make comment)
                // dataStatus = 0
                // '***********
            }
        }

        #endregion
        private void generateTrajData(string paramSeriesID)
        {
            try
            {
                gdsDataSeries objSeries = localSeries[paramSeriesID];
                string WellboreID = objSeries.ObjectID.Split('~')[0];
                string TrajID = objSeries.ObjectID.Split('~')[1];
                string XColumn = objSeries.XColumnID;
                string YColumn = objSeries.YColumnID;
                if (XColumn == "DEPTH")
                {
                    XColumn = "MD";
                }

                if (YColumn == "DEPTH")
                {
                    YColumn = "MD";
                }

                double[] xData;
                double[] yData;
                string strSQL = "SELECT " + XColumn + "," + YColumn + " FROM VMX_TRAJ_DATA WHERE WELL_ID='" + wellID + "' AND WELLBORE_ID='" + WellboreID + "' AND TRAJ_ID='" + TrajID + "' AND MD>=" + fromDepth.ToString() + " AND MD<=" + toDepth.ToString() + " ORDER BY MD";
                DataTable objTable = objRequest.objDataService.getTable(strSQL);
                if (objTable.Rows.Count > 0)
                {
                    xData = new double[objTable.Rows.Count];
                    yData = new double[objTable.Rows.Count];
                    int rowIndex = 0;
                    foreach (DataRow objRow in objTable.Rows)
                    {
                        xData[rowIndex] = Convert.ToDouble(DataService.checkNull(objRow[XColumn], 0));
                        yData[rowIndex] = Convert.ToDouble(DataService.checkNull(objRow[YColumn], 0));
                        rowIndex += 1;
                    }
                }
                else
                {
                    xData = new double[0];
                    yData = new double[0];
                }

                objSeries.xDataBuffer = xData;
                objSeries.yDataBuffer = yData;
                objSeries.RefreshRequired = true;
                dataSeries[objSeries.SeriesID] = objSeries;// Copy Series with Data to original DataSeries
            }
            catch (Exception ex)
            {
            }
        }


        private void loadFormationTops()
        {
            try
            {
                Dictionary<string, FormationTop> topsListEx = FormationTop.getList(ref objRequest.objDataService, wellID);
                foreach (FormationTop objTop in topsListEx.Values)
                {
                    var objPositionInfo = new FormationTopPositionInfo();
                    objPositionInfo.TopID = objTop.TopID;
                    objPositionInfo.TopName = objTop.TopName;
                    objPositionInfo.BottomPosition = objTop.Depth;
                    objPositionInfo.TopColor = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(objTop.Color)));
                    //ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["LINE_COLOR"], Color.Black.ToArgb()))));
                    objPositionInfo.Depth = objTop.Depth;
                    allFormationTopsInfo.Add(objTop.TopID, objPositionInfo);
                }
            }
            catch (Exception ex)
            {
            }
        }


        //New Code 

        #region "Offset Multi Well Functionality"
        public bool isOffsetWellSeriesExist(string paramWellID)
        {
            try
            {
                bool isExist = false;

                foreach (gdsDataSeries objSeries in dataSeries.Values)
                {
                    if (objSeries.isOffset)
                    {
                        if (objSeries.__WellID == paramWellID)
                        {
                            isExist = true;
                            break;
                        }
                    }
                }

                return isExist;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
               
        public void addMissingOffsetSeries(ref DataService objDataService)
        {
            try
            {
                Dictionary<string, string> existingOffsetWells = new Dictionary<string, string>();

                



            startOver:

                //foreach (gdsDataSeries objSeries in dataSeries.Values)
                foreach (gdsDataSeries objSeries in localSeries.Values)
                {
                    if (objSeries.isOffset)
                    {
                        if (!existingOffsetWells.ContainsKey(objSeries.__WellID))
                            existingOffsetWells.Add(objSeries.__WellID, objSeries.__WellID);
                    }
                }

                int existingWellCount = existingOffsetWells.Count;

                int colorPickIndex = 1;

                colorPickIndex = existingWellCount + 1;

                if (colorPickIndex > 5)
                    colorPickIndex = 5;

                colorPickIndex = 1;

                foreach (string strKey in objDataSelection.offsetWells.Keys)
                {
                    LogCorOffsetWellInfo objOffsetInfo = objDataSelection.offsetWells[strKey];

                    string strWellID = objOffsetInfo.OffsetWellID;

                    if (!isOffsetWellSeriesExist(strWellID))
                    {

                        // '## Time Log *****************************************************
                        foreach (gdsDataSeries objSeries in dataSeries.Values)
                        {
                            //objSeries.Color1 = ColorTranslator.ToHtml(  getRandomColorName());
                            //objSeries.Color2 = ColorTranslator.ToHtml(getRandomColorName());
                            //objSeries.Color3 = ColorTranslator.ToHtml(getRandomColorName());
                            //objSeries.Color4 = ColorTranslator.ToHtml(getRandomColorName());
                            //objSeries.Color5 = ColorTranslator.ToHtml(getRandomColorName());



                            if (objSeries.DataSource == 0)
                            {
                                gdsDataSeries objNewSeries = objSeries.getCopy();
                                objNewSeries.SeriesID = Guid.NewGuid().ToString(); //   objSeries.SeriesID; // objIDFactory.getObjectID;
                                objNewSeries.isOffset = true;
                                objNewSeries.__WellID = strWellID;
                                string wellName = VuMaxDR.Data.Objects.Well.loadObject(ref objDataService, strWellID, ref lastError).name;
                                
                                objNewSeries.SeriesName = wellName + "-" + objNewSeries.SeriesName;
                                

                                TimeLog objOffsetTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLog(ref objDataService, strWellID);

                                if (objOffsetTimeLog != null)
                                {
                                    objNewSeries.ObjectID = objOffsetTimeLog.WellboreID + "~" + objOffsetTimeLog.ObjectID;

                                    // 'We need to change the color for offset wells ...
                                    switch (colorPickIndex)
                                    {
                                        case 1:
                                            {
                                                objNewSeries.LineColor = objSeries.Color1;
                                                objNewSeries.PointColor = objSeries.Color1;
                                                break;
                                            }

                                        case 2:
                                            {
                                                objNewSeries.LineColor = objSeries.Color2;
                                                objNewSeries.PointColor = objSeries.Color2;
                                                break;
                                            }

                                        case 3:
                                            {
                                                objNewSeries.LineColor = objSeries.Color3;
                                                objNewSeries.PointColor = objSeries.Color3;
                                                break;
                                            }

                                        case 4:
                                            {
                                                objNewSeries.LineColor = objSeries.Color4;
                                                objNewSeries.PointColor = objSeries.Color4;
                                                break;
                                            }

                                        case 5:
                                            {
                                                objNewSeries.LineColor = objSeries.Color5;
                                                objNewSeries.PointColor = objSeries.Color5;
                                                break;
                                            }
                                    }

                                    localSeries.Add(objNewSeries.SeriesID, objNewSeries.getCopy());
                                    //dataSeries.Add(objNewSeries.SeriesID, objNewSeries.getCopy());
                                    //goto startOver;
                                }
                            }
                        }


                        colorPickIndex = colorPickIndex + 1;

                        if (colorPickIndex > 5)
                            colorPickIndex = 5;
                    }
                }
            }

            catch (Exception ex)
            {
            }
        }

        #endregion
        public static Broker.BrokerResponse loadSummaryData(ref gdSummary paramObjSummary)
        {
            try
            {
                //Pending
                //RemoveUnUsedSeries and other functions, need to consult Nitin for that...


                //gdSummary.loadSummaryObject(ref paramObjSummary);
                paramObjSummary.objMnemonicMappingMgr.loadMappings(ref paramObjSummary.objRequest.objDataService);
                paramObjSummary.objDataSelection.WellID = paramObjSummary.wellID;
                paramObjSummary.objDataSelection.getRange2(ref paramObjSummary.fromDate, ref paramObjSummary.toDate, ref paramObjSummary.fromDepth, ref paramObjSummary.toDepth, ref paramObjSummary.ChartTitle, paramObjSummary);
               //Below is commented cos User will change the data from DataSelector (Client Side)
               //Save is pending in UserSettings
                // paramObjSummary.objDataSelection.loadDataSelection(paramObjSummary.SummaryPlotID);

                

                gdSummary objLocalSummary = new gdSummary(paramObjSummary.objRequest, paramObjSummary.wellID, paramObjSummary.SummaryPlotID);

                
                objLocalSummary.objDataSelection.WellID = paramObjSummary.wellID;

                objLocalSummary = gdSummary.loadSummaryObject(ref objLocalSummary);

                ////Initialize Data Selection by default last 24 hours and create default series...
                //objLocalSummary.objDataSelection.loadInitialData(objLocalSummary);

                //////addMissingOffset Series Here

                //objLocalSummary.addMissingOffsetSeries(ref paramObjSummary.objRequest.objDataService);
                //////*****************

                Broker.BrokerResponse objResponse = paramObjSummary.objRequest.createResponseObject();


                //Check if time log exist, else return empty JSON
                if (!VuMaxDR.Data.Objects.Well.isTimeLogExist(ref paramObjSummary.objRequest.objDataService, paramObjSummary.wellID))
                {

                    Broker.BrokerResponse objBadResponse = paramObjSummary.objRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Response = "{}";
                    objBadResponse.Errors = "No time logs found in this well ";
                    return objBadResponse;

                }


                paramObjSummary.lastError = "";
                paramObjSummary.objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref paramObjSummary.objRequest.objDataService, paramObjSummary.wellID);
                
                objResponse.Category = paramObjSummary.objWell.name;

                //Get the primary time log 
                paramObjSummary.objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref paramObjSummary.objRequest.objDataService, paramObjSummary.wellID);


                ////Initialize Data Selection by default last 24 hours and create default series...
                paramObjSummary.objDataSelection.loadInitialData(paramObjSummary);
                //Based on the data sources... copy series to the local list

                //paramObjSummary.addMissingOffsetSeries(ref paramObjSummary.objRequest.objDataService);
                //## Time Log *****************************************************
                //foreach (gdsDataSeries objSeries in objLocalSummary.dataSeries.Values)
                string lastError = "";
                foreach (gdsDataSeries objSeries in paramObjSummary.dataSeries.Values)
                {
                    if (objSeries.DataSource == 0)
                    {
                        gdsDataSeries objNewSeries = objSeries.getCopy();
                        objNewSeries.SeriesID = objSeries.SeriesID;// Guid.NewGuid().ToString();
                        objNewSeries.isOffset = false;
                        objNewSeries.ObjectID = paramObjSummary.objTimeLog.WellboreID + "~" + paramObjSummary.objTimeLog.ObjectID;
                        

                        objNewSeries.SeriesName = paramObjSummary.objWell.name + "-" + objNewSeries.SeriesName;

                        paramObjSummary.localSeries.Add(objNewSeries.SeriesID, objNewSeries.getCopy());
                        //objLocalSummary.localSeries.Add(objNewSeries.SeriesID, objNewSeries.getCopy());
                    }
                }

                //''## Trajectory *****************************************************

                //foreach (gdsDataSeries objSeries in objLocalSummary.dataSeries.Values)
                foreach (gdsDataSeries objSeries in paramObjSummary.dataSeries.Values)

                {
                    if (objSeries.DataSource == 1)
                    {
                        DataSelection objDataSelection = new DataSelection(paramObjSummary.wellID, paramObjSummary.objRequest);
                        //objDataSelection.loadDataSelection(paramObjSummary.SummaryPlotID);
                        objDataSelection.loadInitialData(paramObjSummary);

                        //foreach (string strKey in objLocalSummary.objDataSelection.trajList.Keys)
                        foreach (string strKey in objDataSelection.trajList.Keys)
                        {
                            string WellboreID = strKey.Split('~')[0];
                            string TrajID = strKey.Split('~')[1];
                            Trajectory objTrajectory = paramObjSummary.objWell.wellbores[WellboreID].trajectories[TrajID];
                            gdsDataSeries objNewSeries = objSeries.getCopy();
                            objNewSeries.SeriesID = objSeries.SeriesID;// Guid.NewGuid().ToString();
                            objNewSeries.SeriesName = objNewSeries.SeriesName + " (" + objTrajectory.name + ")";
                            objNewSeries.ObjectID = strKey;
                            paramObjSummary.localSeries.Add(objNewSeries.SeriesID, objNewSeries.getCopy());
                            //objLocalSummary.localSeries.Add(objNewSeries.SeriesID, objNewSeries.getCopy());
                        }
                    }
                }

                //addMissingOffset Series Here
                paramObjSummary.addMissingOffsetSeries(ref paramObjSummary.objRequest.objDataService);

                //objLocalSummary.addMissingOffsetSeries(ref paramObjSummary.objRequest.objDataService);
                //paramObjSummary.addMissingOffsetSeries(ref paramObjSummary.objRequest.objDataService);
                //Copy localSummarySeries to localSeries of parentSummarySeries 
                //paramObjSummary.localSeries = objLocalSummary.dataSeries;
                //*****************

                paramObjSummary.generateColorData();
                if (paramObjSummary.ShowTops)
                {
                    paramObjSummary.loadFormationTops();
                }

                //gdsDataSeries[] arrSeries = objLocalSummary.dataSeries.Values.ToArray();
                //gdsDataSeries[] arrSeries = paramObjSummary.dataSeries.Values.ToArray();
                gdsDataSeries[] arrSeries = paramObjSummary.localSeries.Values.ToArray();

                Array.Sort(arrSeries);

                //for (int i = 0; i < arrSeries.Length - 1; i++)
                for (int i = 0; i < arrSeries.Length; i++)
                {
                    gdsDataSeries objSeries = new gdsDataSeries();
                    objSeries = arrSeries[i];

                    if (objSeries.DataSource == 0)
                    {
                        //Normal Summary Data...
                        if (objSeries.Type == gdsDataSeries.gdsType.Normal)
                        {
                            if (objSeries.isOffset)
                            {
                                paramObjSummary.generateOffsetTimeLogData(objSeries.SeriesID);//dataSeries Copied with data
                                //objLocalSummary.generateOffsetTimeLogData(objSeries.SeriesID);
                            }
                            else
                            {
                                paramObjSummary.generateTimeLogData(objSeries.SeriesID);//dataSeries copied to parent with data
                            }
                        }


                        // ''Group Summary Data ...
                        if (objSeries.Type == gdsDataSeries.gdsType.GroupSummary)
                        {
                            if (objSeries.isOffset)
                            {
                                //Implementation Pending ...
                                //Need to check this
                                //generateOffsetTimeLogData(objSeries.SeriesID)

                                paramObjSummary.generateTimeLogDataForGroupSummariesOffsetWell(objSeries.SeriesID); //Dataseries copied with data
                            }
                            else
                            {

                                if (objSeries.MainGroupOn == 0)
                                {
                                    paramObjSummary.generateTimeLogDataForGroupSummaries(objSeries.SeriesID);// dataSerie copied with data
                                }

                                if (objSeries.MainGroupOn == 1)
                                {
                                    paramObjSummary.generateTimeLogDataForGroupSummariesSplit(objSeries.SeriesID);//Dataseried copied with data
                                }

                            }
                        }
                    }

                    if (objSeries.DataSource == 1)
                    {
                        paramObjSummary.generateTrajData(objSeries.SeriesID);//dataSeries copied with data
                    }
                }
                objResponse.Response = JsonConvert.SerializeObject(paramObjSummary);
                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objBadResponse = paramObjSummary.objRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in LoadSummaryData " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        //************


        //public Broker.BrokerResponse loadSummaryData(string wellID, string paramPlotID, ref Broker.BrokerRequest paramRequest)
        public Broker.BrokerResponse loadSummaryData()
        {
            try
            {
                //Pending
                //RemoveUnUsedSeries and other functions, need to consult Nitin for that...

                objDataSelection.WellID = wellID;
                objDataSelection.getRange2(ref fromDate, ref toDate, ref fromDepth, ref toDepth, ref ChartTitle, this);
                this.objDataSelection.loadDataSelection(this.SummaryPlotID);
                gdSummary objLocalSummary = new gdSummary(this.objRequest, wellID, this.SummaryPlotID);

                objLocalSummary = gdSummary.loadSummaryObject(ref objLocalSummary);

                Broker.BrokerResponse objResponse = this.objRequest.createResponseObject();


                //Check if time log exist, else return empty JSON
                if (!VuMaxDR.Data.Objects.Well.isTimeLogExist(ref this.objRequest.objDataService, wellID))
                {

                    Broker.BrokerResponse objBadResponse = this.objRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Response = "{}";
                    objBadResponse.Errors = "No time logs found in this well ";
                    return objBadResponse;

                }


                lastError = "";
                objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref this.objRequest.objDataService, wellID);


                //Get the primary time log 
                objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref this.objRequest.objDataService, wellID);


                //load User Dataselector Setings from evumaxUserSettings

                //*******************

                //Based on the data sources... copy series to the local list

                //## Time Log *****************************************************
                foreach (gdsDataSeries objSeries in objLocalSummary.dataSeries.Values)
                {
                    if (objSeries.DataSource == 0)
                    {
                        gdsDataSeries objNewSeries = objSeries.getCopy();
                        objNewSeries.SeriesID = objSeries.SeriesID;// Guid.NewGuid().ToString();
                        objNewSeries.isOffset = false;
                        objNewSeries.ObjectID = objTimeLog.WellboreID + "~" + objTimeLog.ObjectID;
                        localSeries.Add(objNewSeries.SeriesID, objNewSeries.getCopy());
                    }
                }

                //''## Trajectory *****************************************************

                foreach (gdsDataSeries objSeries in objLocalSummary.dataSeries.Values)

                {
                    if (objSeries.DataSource == 1)
                    {
                        DataSelection objDataSelection = new DataSelection(wellID, this.objRequest);
                        objDataSelection.loadDataSelection(this.SummaryPlotID);

                        //foreach (string strKey in objLocalSummary.objDataSelection.trajList.Keys)
                        foreach (string strKey in objDataSelection.trajList.Keys)
                        {
                            string WellboreID = strKey.Split('~')[0];
                            string TrajID = strKey.Split('~')[1];
                            Trajectory objTrajectory = objWell.wellbores[WellboreID].trajectories[TrajID];
                            gdsDataSeries objNewSeries = objSeries.getCopy();
                            objNewSeries.SeriesID = objSeries.SeriesID;// Guid.NewGuid().ToString();
                            objNewSeries.SeriesName = objNewSeries.SeriesName + " (" + objTrajectory.name + ")";
                            objNewSeries.ObjectID = strKey;
                            localSeries.Add(objNewSeries.SeriesID, objNewSeries.getCopy());
                        }
                    }
                }



                gdsDataSeries[] arrSeries = objLocalSummary.dataSeries.Values.ToArray();

                Array.Sort(arrSeries);

                //for (int i = 0; i < arrSeries.Length - 1; i++)
                for (int i = 0; i < arrSeries.Length; i++)
                {
                    gdsDataSeries objSeries = new gdsDataSeries();
                    objSeries = arrSeries[i];

                    if (objSeries.DataSource == 0)
                    {
                        //Normal Summary Data...
                        if (objSeries.Type == gdsDataSeries.gdsType.Normal)
                        {
                            if (objSeries.isOffset)
                            {
                                generateOffsetTimeLogData(objSeries.SeriesID);
                            }
                            else
                            {
                                generateTimeLogData(objSeries.SeriesID);
                            }
                        }


                        // ''Group Summary Data ...
                        if (objSeries.Type == gdsDataSeries.gdsType.GroupSummary)
                        {
                            if (objSeries.isOffset)
                            {
                                //Implementation Pending ...
                                //Need to check this
                                //generateOffsetTimeLogData(objSeries.SeriesID)

                                generateTimeLogDataForGroupSummariesOffsetWell(objSeries.SeriesID);
                            }
                            else
                            {

                                if (objSeries.MainGroupOn == 0)
                                {
                                    generateTimeLogDataForGroupSummaries(objSeries.SeriesID);
                                }

                                if (objSeries.MainGroupOn == 1)
                                {
                                    generateTimeLogDataForGroupSummariesSplit(objSeries.SeriesID);
                                }

                            }
                        }
                    }

                    if (objSeries.DataSource == 1)
                    {
                        generateTrajData(objSeries.SeriesID);
                    }
                }
                objResponse.Response = JsonConvert.SerializeObject(this);
                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objBadResponse = this.objRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in LoadSummaryData " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        private void populateIntervalColors()
        {
            try
            {
                IntervalColors.Add(1, "Blue");
                IntervalColors.Add(2, ColorTranslator.ToHtml(Color.FromArgb(4, 186, 255)));
                IntervalColors.Add(3, ColorTranslator.ToHtml( Color.FromArgb(4, 255, 255)));
                IntervalColors.Add(4, ColorTranslator.ToHtml( Color.FromArgb(12, 248, 153)));
                IntervalColors.Add(5, ColorTranslator.ToHtml(Color.FromArgb(141, 233, 3)));
                IntervalColors.Add(6, ColorTranslator.ToHtml( Color.FromArgb(121, 185, 51)));
                IntervalColors.Add(7, ColorTranslator.ToHtml(Color.FromArgb(188, 185, 48)));
                IntervalColors.Add(8, ColorTranslator.ToHtml( Color.FromArgb(255, 128, 0)));
                IntervalColors.Add(9, ColorTranslator.ToHtml(Color.FromArgb(211, 95, 24)));
                IntervalColors.Add(10, ColorTranslator.ToHtml(Color.FromArgb(255, 0, 0)));
                
            }
            catch (Exception ex)
            {
            }
        }


        public bool hasTimeData()
        {
            try
            {
                foreach (gdsDataSeries objSeries in dataSeries.Values)
                {
                    if (objSeries.DataSource == 0)
                    {
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }


        public bool hasTrajectoryData()
        {
            try
            {
                foreach (gdsDataSeries objSeries in dataSeries.Values)
                {
                    if (objSeries.DataSource == 1)
                    {
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static gdSummary loadSummaryObject(ref gdSummary objSummary)
        {
            try
            {
                objSummary.objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref objSummary.objRequest.objDataService, objSummary.wellID);
                objSummary.IntervalColors.Add(1, "Blue");
                objSummary.IntervalColors.Add(2,  ColorTranslator.ToHtml(Color.FromArgb(4, 186, 255)));
                objSummary.IntervalColors.Add(3,  ColorTranslator.ToHtml(Color.FromArgb(4, 255, 255)));
                objSummary.IntervalColors.Add(4, ColorTranslator.ToHtml(Color.FromArgb(12, 248, 153)));
                objSummary.IntervalColors.Add(5, ColorTranslator.ToHtml(Color.FromArgb(141, 233, 3)));
                objSummary.IntervalColors.Add(6, ColorTranslator.ToHtml(Color.FromArgb(121, 185, 51)));
                objSummary.IntervalColors.Add(7, ColorTranslator.ToHtml(Color.FromArgb(188, 185, 48)));
                objSummary.IntervalColors.Add(8, ColorTranslator.ToHtml(Color.FromArgb(255, 128, 0)));
                objSummary.IntervalColors.Add(9, ColorTranslator.ToHtml(Color.FromArgb(211, 95, 24)));
                objSummary.IntervalColors.Add(10, ColorTranslator.ToHtml(Color.FromArgb(255, 0, 0)));
                

                DataTable objData = objSummary.objRequest.objDataService.getTable("SELECT * FROM VMX_GDS_TEMPLATES WHERE TEMPLATE_ID='" + objSummary.SummaryPlotID + "'");

                if (objData.Rows.Count > 0)
                {
                    objSummary.SummaryPlotID = (string)DataService.checkNull(objData.Rows[0]["TEMPLATE_ID"], "");
                    objSummary.SummaryPlotName = (string)DataService.checkNull(objData.Rows[0]["TEMPLATE_NAME"], "");
                    objSummary.ShowColorAxis = DataService.checkNumericNull(objData.Rows[0]["SHOW_COLOR_AXIS"]) == 1 ? true : false;
                    objSummary.ColorAxisMnemonic = (string)DataService.checkNull(objData.Rows[0]["COLOR_AXIS_MNEMONIC"], "");
                    objSummary.PlotOrientation = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["ORIENTATION"], 0));
                    objSummary.MultiWell = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MULTI_WELL"], 0)) == 1, true, false);
                    objSummary.ShowTops = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["SHOW_TOPS"], 0)) == 1, true, false);

                    try
                    {
                        objSummary.Type = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["TYPE"], 0));
                        objSummary.Factor = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["FACTOR"], 10));
                    }
                    catch (Exception ex)
                    {
                    }

                    try
                    {
                        objSummary.MultiPageOutput = Global.Iif(Convert.ToInt32(DataService.checkNull(objData.Rows[0]["MULTIPAGE_OUTPUT"], 0)) == 1, true, false);
                        objSummary.FtPerInch = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["FT_PER_INCH"], 0));
                        objSummary.IndexColumn = Convert.ToInt32(DataService.checkNull(objData.Rows[0]["INDEX_COLUMN"], 0));
                    }
                    catch (Exception ex)
                    {
                    }
                }

                objData = objSummary.objRequest.objDataService.getTable("SELECT * FROM VMX_GDS_DATA WHERE TEMPLATE_ID='" + objSummary.SummaryPlotID + "'");

                foreach (DataRow objRow in objData.Rows)
                {
                    gdsDataSeries objItem = new gdsDataSeries();

                    objItem.SeriesID = (string)DataService.checkNull(objRow["SERIES_ID"], "");
                    objItem.SeriesName = (string)DataService.checkNull(objRow["SERIES_NAME"], "");
                    objItem.DataSource = Convert.ToInt32(DataService.checkNull(objRow["DATA_SOURCE"], 0));
                    objItem.XColumnID = (string)DataService.checkNull(objRow["XCOLUMN_ID"], "");
                    objItem.XColumnName = (string)DataService.checkNull(objRow["XCOLUMN_NAME"], "");
                    objItem.YColumnID = (string)DataService.checkNull(objRow["YCOLUMN_ID"], "");
                    objItem.YColumnName = (string)DataService.checkNull(objRow["YCOLUMN_NAME"], "");
                    objItem.DataFilter = (string)DataService.checkNull(objRow["DATA_FILTER"], "");
                    objItem.SeriesType = Convert.ToInt32(DataService.checkNull(objRow["SERIES_TYPE"], 0));
                    objItem.LineStyle = Convert.ToInt32(DataService.checkNull(objRow["LINE_STYLE"], 0));
                    objItem.LineWidth = Convert.ToDouble(DataService.checkNull(objRow["LINE_WIDTH"], 0));
                    objItem.LineColor = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["LINE_COLOR"], Color.Black.ToArgb()))));// Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["LINE_COLOR"], 0)));
                    objItem.StepLine = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["STEP_LINE"], 0)) == 1, true, false);
                    objItem.ShowPoints = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["SHOW_POINTS"], 0)) == 1, true, false);
                    objItem.PointerStyle = Convert.ToInt32(DataService.checkNull(objRow["POINT_STYLE"], 0));
                    objItem.PointHeight = Convert.ToInt32(DataService.checkNull(objRow["POINT_HEIGHT"], 0));
                    objItem.PointWidth = Convert.ToInt32(DataService.checkNull(objRow["POINT_WIDTH"], 0));
                    objItem.PointColor = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["POINT_COLOR"], 0))));
                    objItem.ColorPointsAsColumn = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["COLOR_AS_COLUMN"], 0)) == 1, true, false);
                    objItem.Visible = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["VISIBLE"], 0)) == 1, true, false);
                    objItem.IgnoreNegative = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["IGNORE_NEGATIVE"], 0)) == 1, true, false);
                    objItem.groupFunction = Convert.ToInt32(DataService.checkNull(objRow["GROUP_FUNCTION"], 0));

                    objItem.Type = (gdsDataSeries.gdsType)Convert.ToInt32(DataService.checkNull(objRow["DATA_TYPE"], 0));

                    objItem.grpExpressionType = Convert.ToInt32(DataService.checkNull(objRow["GRP_EXP_TYPE"], 0));
                    objItem.grpExpression = (string)DataService.checkNull(objRow["GRP_EXP"], "");
                    objItem.grpFunctionType = Convert.ToInt32(DataService.checkNull(objRow["GRP_FUNC_TYPE"], 0));
                    objItem.grpGroupBy = Convert.ToInt32(DataService.checkNull(objRow["GRP_GROUP"], 0));
                    objItem.grpGroupByExpression = (string)DataService.checkNull(objRow["GRP_GROUP_EXP"], "");
                    objItem.grpFilter = (string)DataService.checkNull(objRow["GRP_FILTER"], "");
                    objItem.grpColor = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["GRP_COLOR"], 0))));

                    objItem.Color1 = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR1"], "red" ))));
                    objItem.Color2 = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR2"], 0))));
                    objItem.Color3 = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR3"], 0))));
                    objItem.Color4 = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR4"], 0))));
                    objItem.Color5 = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["COLOR5"], 0))));

                    objItem.MainGroupOn = Convert.ToInt32(DataService.checkNull(objRow["MAIN_GROUP_ON"], 0));
                    objItem.SplitType = Convert.ToInt32(DataService.checkNull(objRow["SPLIT_TYPE"], 0));


                    objItem.FixedRangeList.Clear();


                    string strFixedRangeList = (string)DataService.checkNull(objRow["FIXED_RANGE_LIST"], "");

                    if (strFixedRangeList.Trim() != "")
                    {
                        string[] arrList = strFixedRangeList.Split(',');

                        for (int i = 0; i <= arrList.Length - 1; i++)
                        {
                            splitRange objRange = new splitRange();
                            objRange.fromValue = Global.ValEx(arrList[i].Split('-')[0]);
                            objRange.toValue = Global.ValEx(arrList[i].Split('-')[1]);

                            objItem.FixedRangeList.Add(i + 1, objRange);
                        }
                    }

                    objItem.variableRangeFrom = Convert.ToDouble(DataService.checkNull(objRow["FROM_RANGE"], 0));
                    objItem.variableRangeTo = Convert.ToDouble(DataService.checkNull(objRow["TO_RANGE"], 0));
                    objItem.variableRangeIncrement = Convert.ToDouble(DataService.checkNull(objRow["RANGE_INCREMENT"], 0));
                    objItem.splitMnemonic = (string)DataService.checkNull(objRow["SPLIT_MNEMONIC"], "");
                    objItem.ShowMarks = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["SHOW_MARKS"], 0)) == 1, true, false);

                    objItem.StackedBars = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["STACKED_BARS"], 0)) == 1, true, false);

                    objItem.ShowRoadMap = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["SHOW_ROADMAP"], 0)) == 1, true, false);
                    objItem.RoadMapColor = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["ROADMAP_COLOR"], "red"))));


                    objItem.RoadMapTransparency = Convert.ToInt32(DataService.checkNull(objRow["ROADMAP_TRANS"], 0));

                    try
                    {
                        objItem.DisplayOrder = Convert.ToInt32(DataService.checkNull(objRow["DISPLAY_ORDER"], 0));
                    }
                    catch (Exception ex)
                    {
                    }
                    objSummary.dataSeries.Add(objItem.SeriesID, objItem.getCopy());
                }

                objData = objSummary.objRequest.objDataService.getTable("SELECT * FROM VMX_GDS_AXIS WHERE TEMPLATE_ID='" + objSummary.SummaryPlotID + "'");

                foreach (DataRow objRow in objData.Rows)
                {
                    gdsAxis objAxis = new gdsAxis();

                    objAxis.AxisID = (string)DataService.checkNull(objRow["AXIS_ID"], "");
                    objAxis.AxisTitle = (string)DataService.checkNull(objRow["AXIS_TITLE"], "");
                    objAxis.ColumnID = (string)DataService.checkNull(objRow["COLUMN_ID"], "");
                    objAxis.AxisPosition = Convert.ToInt32(DataService.checkNull(objRow["AXIS_POSITION"], 0));
                    objAxis.Inverted = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["INVERTED"], 0)) == 1, true, false);
                    objAxis.DisplayOrder = Convert.ToInt32(DataService.checkNull(objRow["DISPLAY_ORDER"], 0));
                    objAxis.Automatic = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["AUTOMATIC"], 0)) == 1, true, false);
                    objAxis.MinValue = Convert.ToDouble(DataService.checkNull(objRow["MIN_VALUE"], 0));
                    objAxis.MaxValue = Convert.ToDouble(DataService.checkNull(objRow["MAX_VALUE"], 0));
                    objAxis.Orientation = Convert.ToInt32(DataService.checkNull(objRow["ORIENTATION"], 0));
                    objAxis.StartPosition = Convert.ToDouble(DataService.checkNull(objRow["START_POSITION"], 0));
                    objAxis.EndPosition = Convert.ToDouble(DataService.checkNull(objRow["END_POSITION"], 0));
                    objAxis.RelativePosition = Convert.ToInt32(DataService.checkNull(objRow["RELATIVE_POSITION"], 0));
                    objAxis.ShowGrid = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["SHOW_GRID"], 0)) == 1, true, false);
                    objAxis.FontName = (string)DataService.checkNull(objRow["FONT_NAME"], "Arial");
                    objAxis.FontSize = Convert.ToInt32(DataService.checkNull(objRow["FONT_SIZE"], 10));
                    //objAxis.FontColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["FONT_COLOR"], "Black")));
                    objAxis.FontColor =  ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["FONT_COLOR"], Color.Black.ToArgb()))));
                    objAxis.FontBold = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["FONT_BOLD"], 0)) == 1, true, false);
                    objAxis.FontItalic = Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["FONT_ITALIC"], 0)) == 1, true, false);

                    objSummary.Axis.Add(objAxis.AxisID, objAxis.getCopy());
                }

                return objSummary;
            }
            catch (Exception ex)
            {

                return null;
            }
        }


        public Trajectory getActualTrajectory()
        {
            try
            {
                Trajectory objActualTrajectory = new Trajectory();
                bool noTrajectoriesFound = true;

                // 'Start with Flag
                foreach (Wellbore objWellbore in objWell.wellbores.Values)
                {
                    foreach (Trajectory objTrajectory in objWellbore.trajectories.Values)
                    {
                        noTrajectoriesFound = false;
                        if (objTrajectory.IsPrimaryActive)
                        {
                            objActualTrajectory = objTrajectory;
                            goto Step1;
                        }
                    }
                }

                if (noTrajectoriesFound)
                {
                    return default;
                }

            Step1:

                if (objActualTrajectory is null)
                {

                    // 'Return any trajectory


                    foreach (Wellbore objWellbore in objWell.wellbores.Values)
                    {
                        foreach (Trajectory objTrajectory in objWellbore.trajectories.Values)
                        {
                            noTrajectoriesFound = false;
                            objActualTrajectory = objTrajectory;
                            return objActualTrajectory;
                        }
                    }
                }

                return objActualTrajectory;
            }
            catch (Exception ex)
            {
                return default;
            }
        }


    }//Class

    public class IntervalInfo
    {
        public double minValue = 0;
        public double maxValue = 0;
    }

}
