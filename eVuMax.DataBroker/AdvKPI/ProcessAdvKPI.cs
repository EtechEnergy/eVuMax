using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VuMaxDR.AdvKPI;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;
using Microsoft.VisualBasic;
using eVuMax.DataBroker.AdvKPI;

namespace eVuMax.DataBroker.AdvKPI_
{
    public class ProcessAdvKPI
    {

        public AdvKPIProfile objProfile;
        public CompositeTemplate objCompositeProfile;   //prath
        public CompositeTemplate objTemplate;           //prath

        public KPIProcessor objProcessor = new KPIProcessor();
      
        [NonSerialized]
        private DataService objDataService;
        
        ////private advKPIChartAxis baseBottomAxis;
        //private int xAxisStartPosition = 0;
        //private int xAxisEndPosition = 0;
        //private int yAxisStartPosition = 0;
        //private int yAxisEndPosition = 0;
        //private int topAxisCount = 0;
        //private int bottomAxisCount = 0;
        //private int leftAxisCount = 0;
        //private int rightAxisCount = 0;
        //private int maxLeftRelativePosition = 0;
        //private int maxRightRelativePosition = 0;
        //private bool FormSizeChanged = false;
        //private int lastX = 0;
        //private int lastY = 0;
    
        public Dictionary<double, clsPhaseTag> phaseTagList = new Dictionary<double, clsPhaseTag>();
        public Dictionary<double, clsCustomTag> customTagList = new Dictionary<double, clsCustomTag>();
        public bool doHighlightTags = false;
        public bool doHighlightNPT = false;


        private Broker.BrokerRequest objRequest = new Broker.BrokerRequest();
        private AdvKPIWorkSpace objWorkSpace = new AdvKPIWorkSpace();
        public string[] WellList = new  string[0];


        public Broker.BrokerResponse processKPI(ref DataService paramDataService, string ProfileID)
        {
            try
            {
                //Initialize
                objDataService = paramDataService;
                objWorkSpace.loadWorkSpace(objDataService);
                setWellSelection();
                Broker.BrokerResponse objResponse = objRequest.createResponseObject();
                //***************************
                

              
                objProfile = AdvKPIProfile.load(ref objDataService, ProfileID);
                if (objProfile == null)
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Response = "Unable to load Profile";
                    return objResponse;
                }
                objProcessor.objProfile = objProfile;
                objProcessor.objWorkSpace = objWorkSpace;
                objProcessor.objDataService = objDataService;
               // initializeChart();
                if (objProfile.HighlightTags)
                {
                    loadPhaseTags();
                    loadCustomTags();
                }

                 objProcessor.processProfile();

                
                Thread.Sleep(5000);

                foreach (AdvKPIData objItem in objProcessor.outputData.Values)
                {
                    
                    if(objItem.SeriesType == AdvKPIData.enAdvKPiSeriesType.Pie)
                    {
                        //noting to do right now..
                    }
                    else
                    {
                        if (objProfile.DataGroup == AdvKPIData.enAdvKPIDataGroup.TimePeriod & objProfile.TimeUnit == AdvKPIData.enAdvKPITimeUnit.CumulativeDays)
                        {
                            if (objProfile.TagSourceID.Trim() == "")
                            {
                                mapPhaseTagsWithDays(ref objItem.arrXData,ref objItem.arrDateData);
                            }
                        }
                        else
                        {
                            if (objProfile.HighlightTags)
                            {
                                if (objProfile.TagSourceID.Trim() == "")
                                {
                                    mapPhaseTagsWithDays(ref objItem.outputData);
                                }
                                else
                                {
                                    mapCustomTagsWithDays(ref objItem.outputData);
                                }

                                doHighlightTags = true;
                                doHighlightNPT = true;
                            }
                        }
                    }
                
                }

                //update Series 


                foreach (AdvKPIData objSeries in objProcessor.outputData.Values)
                {
                    objSeries.XColumn = "X"+ getBottomAxis().Replace("_","").ToString();
                    objSeries.YColumn = "Y" +getVerticalAxisByColumnID(objSeries.getDataColumnID()).Replace("_","").ToString();
                }

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(this);
                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = objRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }

        }


        private void mapPhaseTagsWithDays(ref double[] paramXData, ref DateTime[] paramDateData)
        {
            try
            {
                foreach (clsPhaseTag objItem in phaseTagList.Values)
                {
                    for (int i = 0, loopTo = paramDateData.Length - 1; i <= loopTo; i++)
                    {
                        if (paramDateData[i] > objItem.StartDate & i > 0)
                        {

                            // 'It's between previous entry and this entry

                            // 'Find the percentage increase from previous value
                            double rangeDiff = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, paramDateData[i - 1], paramDateData[i]));
                            double currentDiff = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, paramDateData[i - 1], objItem.StartDate));
                            double pcIncrease = currentDiff * 100d / rangeDiff;
                            double newValue = paramXData[i - 1] + (paramXData[i] - paramXData[i - 1]) * pcIncrease / 100d;
                            objItem.NumericValue = Math.Round(newValue,4);
                            break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }

      
        private void mapPhaseTagsWithDays(ref Dictionary<string, AdvKPIOutputItem> paramList)
        {
            try
            {
                AdvKPIOutputItem[] arrOutputItems = paramList.Values.ToArray();
                foreach (clsPhaseTag objItem in phaseTagList.Values)
                {
                    for (int i = 0, loopTo = arrOutputItems.Length - 1; i <= loopTo; i++)
                    {
                        if (arrOutputItems[i].DateTimeValue > objItem.StartDate & i > 0)
                        {

                            // 'It's between previous entry and this entry

                            // 'Find the percentage increase from previous value
                            double rangeDiff = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, arrOutputItems[i - 1].DateTimeValue, arrOutputItems[i].DateTimeValue));
                            double currentDiff = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, arrOutputItems[i - 1].DateTimeValue, objItem.StartDate));
                            double pcIncrease = currentDiff * 100d / rangeDiff;
                            double newValue = arrOutputItems[i - 1].XValue + (arrOutputItems[i].XValue - arrOutputItems[i - 1].XValue) * pcIncrease / 100;
                            objItem.NumericValue = Math.Round(newValue, 4);
                            break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }


        //**********
        private void mapCustomTagsWithDays(ref Dictionary<string, AdvKPIOutputItem> paramList)
        {
            try
            {
                AdvKPIOutputItem[] arrOutputItems = paramList.Values.ToArray();
                foreach (clsCustomTag objItem in customTagList.Values)
                {
                    for (int i = 0, loopTo = arrOutputItems.Length - 1; i <= loopTo; i++)
                    {
                        if (arrOutputItems[i].DateTimeValue > objItem.StartDate & i > 0)
                        {

                            // 'It's between previous entry and this entry

                            // 'Find the percentage increase from previous value
                            double rangeDiff = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, arrOutputItems[i - 1].DateTimeValue, arrOutputItems[i].DateTimeValue));
                            double currentDiff = Math.Abs(DateAndTime.DateDiff(DateInterval.Second, arrOutputItems[i - 1].DateTimeValue, objItem.StartDate));
                            double pcIncrease = currentDiff * 100d / rangeDiff;
                            double newValue = arrOutputItems[i - 1].XValue + (arrOutputItems[i].XValue - arrOutputItems[i - 1].XValue) * pcIncrease / 100;
                            objItem.NumericValue = Math.Round(newValue, 4);
                            break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }

        //*******
        private string getVerticalAxisByColumnID(string ColumnID)
        {
            try
            {
                foreach (AdvKPIAxis objAxis in objProcessor.objProfile.axesList.Values)
                {
                  
                                   if (objAxis.ColumnID == ColumnID)
                    {
                        return objAxis.AxisID;
                    }
                }
            }
            catch (Exception ex)
            {
            }

            return default;
        }

        private string getBottomAxis()
        {
            try
            {

                foreach (AdvKPIAxis objAxis in objProcessor.objProfile.axesList.Values)
                {
                    if (objAxis.AxisPosition== 1)
                    {
                        return objAxis.AxisID;
                    }
                }

                return "";
            }
            catch (Exception ex)
            {
                return "";
            }
        }

        private void setWellSelection()
        {
            try
            {
                //for (int i = 0; i < WellList.Length; i++)

                //{
                //    string WellID = WellList[i];
                //   if (objWorkSpace.wells.ContainsKey(WellID))
                //    {
                //        objWorkSpace.wells[WellID].Selected = true;
                //    }
                //}


                foreach (AdvKPIWell objWell in objWorkSpace.wells.Values)
                {

                    string WellID = objWell.WellID;
                    if (WellList.Contains(WellID))
                    {
                        objWell.Selected = true;
                    }
                    else
                    {
                        objWell.Selected = false;
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }

        private void loadPhaseTags()
        {
            try
            {
                phaseTagList = new Dictionary<double, clsPhaseTag>();
                string WellID = "";
                foreach (AdvKPIWell objWell in objWorkSpace.wells.Values)
                {
                    if (objWell.Selected)
                    {
                        WellID = objWell.WellID;
                        break;
                    }
                }

                if (string.IsNullOrEmpty(WellID))
                {
                    return;
                }

                TimeLog objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref objDataService, WellID);
                if (objTimeLog is null)
                {
                    return;
                }

                string strSQL = "SELECT A.*,B.PHASE_NAME,C.STEP_NAME,D.EMPH_NAME FROM VMX_PHASE_LIST A LEFT JOIN VMX_PHASE_MASTER B ON (A.PHASE_ID=B.PHASE_ID) LEFT JOIN VMX_STEP_MASTER C ON (A.PHASE_ID=C.PHASE_ID AND A.STEP_ID=C.STEP_ID) LEFT JOIN VMX_EMPH_MASTER D ON (A.PHASE_ID=D.PHASE_ID AND A.STEP_ID=D.STEP_ID AND A.EMPH_ID=D.EMPH_ID) WHERE A.WELL_ID='" + WellID + "' ORDER BY START_DATE";
                DataTable objData = objDataService.getTable(strSQL);
                foreach (DataRow objRow in objData.Rows)
                {
                    var objPhaseTag = new clsPhaseTag();
                    objPhaseTag.PhaseIndex = CommonUtil.convertToDouble(DataService.checkNull(objRow["PHASE_INDEX"], 0));
                    objPhaseTag.WellID = WellID;
                    objPhaseTag.PhaseID = DataService.checkNull(objRow["PHASE_ID"], "").ToString();
                    objPhaseTag.StepID = DataService.checkNull(objRow["STEP_ID"], "").ToString();
                    objPhaseTag.EmphID = DataService.checkNull(objRow["EMPH_ID"], "").ToString();
                    objPhaseTag.EmphColor = clsEmph.getColor(ref objDataService, objPhaseTag.PhaseID, objPhaseTag.StepID, objPhaseTag.EmphID);
                    objPhaseTag.StartDate = Convert.ToDateTime( DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    objPhaseTag.EndDate = Convert.ToDateTime( DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    objPhaseTag.IsOpen =   Global.Iif(Convert.ToInt32( DataService.checkNull(objRow["IS_OPEN"], 0)) == 1, true, false);

                    objPhaseTag.Notes = DataService.checkNull(objRow["NOTES"], "").ToString();
                    objPhaseTag.phaseName = DataService.checkNull(objRow["PHASE_NAME"], "").ToString();
                    objPhaseTag.stepName = DataService.checkNull(objRow["STEP_NAME"], "").ToString();
                    objPhaseTag.emphName = DataService.checkNull(objRow["EMPH_NAME"], "").ToString();
                    if (objPhaseTag.IsOpen)
                    {
                        objPhaseTag.EndDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objDataService));
                    }

                    if (!phaseTagList.ContainsKey(objPhaseTag.PhaseIndex))
                    {
                        phaseTagList.Add(objPhaseTag.PhaseIndex, objPhaseTag);
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }


        private void loadCustomTags()
        {
            try
            {
                customTagList = new Dictionary<double, clsCustomTag>();
                string WellID = "";
                foreach (AdvKPIWell objWell in objWorkSpace.wells.Values)
                {
                    if (objWell.Selected)
                    {
                        WellID = objWell.WellID;
                        break;
                    }
                }

                if (string.IsNullOrEmpty(WellID))
                {
                    return;
                }

                TimeLog objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref objDataService, WellID);
                if (objTimeLog is null)
                {
                    return;
                }

                string SourceID = objProfile.TagSourceID;
                string strSQL = "SELECT A.*,B.CATEGORY_NAME,C.SUB_CATEGORY_NAME,D.ACTIVITY_NAME FROM VMX_CUSTOM_TAG_LIST A ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_CATEGORY_MASTER B ON (A.CATEGORY_ID=B.TAG_CATEGORY_ID AND A.SOURCE_ID=B.SOURCE_ID) ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_SUB_CATEGORY_MASTER C ON (A.CATEGORY_ID=C.TAG_CATEGORY_ID AND A.SUB_CATEGORY_ID=C.TAG_SUB_CATEGORY_ID AND A.SOURCE_ID=C.SOURCE_ID)";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_ACTIVITY_MASTER D ON (A.CATEGORY_ID=D.TAG_CATEGORY_ID AND A.SUB_CATEGORY_ID=D.TAG_SUB_CATEGORY_ID AND A.ACTIVITY_ID=D.TAG_ACTIVITY_ID AND A.SOURCE_ID=D.SOURCE_ID) ";
                strSQL += " WHERE A.WELL_ID='" + WellID + "' AND A.SOURCE_ID='" + SourceID + "' ORDER BY START_DATE";
                DataTable objData = objDataService.getTable(strSQL);
                foreach (DataRow objRow in objData.Rows)
                {
                    var objCustomTag = new clsCustomTag();
                    objCustomTag.TagIndex = Convert.ToDouble( DataService.checkNull(objRow["TAG_INDEX"], 0));
                    objCustomTag.WellID = WellID;
                    objCustomTag.CategoryID = DataService.checkNull(objRow["CATEGORY_ID"], "").ToString();
                    objCustomTag.SubCategoryID = DataService.checkNull(objRow["SUB_CATEGORY_ID"], "").ToString();
                    objCustomTag.ActivityID = DataService.checkNull(objRow["ACTIVITY_ID"], "").ToString();
                    objCustomTag.TagColor = clsCustomTagActivity.getColor(ref objDataService, objCustomTag.CategoryID, objCustomTag.SubCategoryID, objCustomTag.ActivityID, SourceID);
                    objCustomTag.StartDate = Convert.ToDateTime( DataService.checkNull(objRow["START_DATE"], new DateTime()));
                    objCustomTag.EndDate = Convert.ToDateTime(DataService.checkNull(objRow["END_DATE"], new DateTime()));
                    objCustomTag.IsOpen =  Global.Iif(Convert.ToInt32( DataService.checkNull(objRow["IS_OPEN"], 0)) == 1, true, false);
                    objCustomTag.Notes = DataService.checkNull(objRow["NOTES"], "").ToString();
                    objCustomTag.TagCategoryName = DataService.checkNull(objRow["CATEGORY_NAME"], "").ToString();
                    objCustomTag.TagSubCategoryName = DataService.checkNull(objRow["SUB_CATEGORY_NAME"], "").ToString();
                    objCustomTag.TagActivityName = DataService.checkNull(objRow["ACTIVITY_NAME"], "").ToString();

                    // 'TechPetro
                    objCustomTag.SourceID = DataService.checkNull(objRow["SOURCE_ID"], "").ToString();
                    // '********

                    if (objCustomTag.IsOpen)
                    {
                        objCustomTag.EndDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref objDataService));
                    }

                    if (!customTagList.ContainsKey(objCustomTag.TagIndex))
                    {
                        customTagList.Add(objCustomTag.TagIndex, objCustomTag);
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }


        #region CompositeKPI
        
        public Broker.BrokerResponse processCompositeKPI(ref DataService paramDataService, string TemplateID, AdvKPIDataFilter paramDataFilter)
        {
            try
            {
                //Initialize
                objDataService = paramDataService;
                objWorkSpace.loadWorkSpace(objDataService);
                setWellSelection();
                Broker.BrokerResponse objResponse = objRequest.createResponseObject();
                //***************************

                CompositeTemplate objLocalCompositeProfile = new CompositeTemplate();
                objLocalCompositeProfile = CompositeTemplate.load(objDataService, TemplateID);

                if (objLocalCompositeProfile == null)
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Response = "Unable to load Profile";
                    return objResponse;
                }
                //objProcessor.objCompositeProfile = objCompositeProfile;
                objProcessor.objWorkSpace = objWorkSpace;
                objProcessor.objDataService = objDataService;
                processCompositeProfile(ref objLocalCompositeProfile, paramDataFilter);

                //objProcessor.processProfile();
                //CompositeTemplate.load(objDataService, TemplateID);

                objCompositeProfile = new CompositeTemplate();
                objCompositeProfile = objLocalCompositeProfile;

                JsonSerializerSettings objJsonSerializerSettings = new JsonSerializerSettings();
                objJsonSerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;


                objResponse.Response = JsonConvert.SerializeObject(this,objJsonSerializerSettings);
                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = objRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }

        }


        private void processCompositeProfile(ref CompositeTemplate paramCompositeProfile, AdvKPIDataFilter paramDataFilter)
        {
            try
            {
                
              

                foreach (CompositeData objItem in paramCompositeProfile.items.Values)
                {
                    KPIProcessor objLocalProcessor= new KPIProcessor();
                    AdvKPIProfile objLocalProfile = new AdvKPIProfile();
                    objLocalProfile = objItem.objProfile; //Copy by Reference

                    if (paramDataFilter != null)
                    {
                        if (paramDataFilter.FilterData)
                        {
                            objLocalProcessor.FilterData = paramDataFilter.FilterData;
                            objLocalProcessor.FilterMainWellID = paramDataFilter.FilterMainWellID;
                            objLocalProcessor.FilterType = (VuMaxDR.AdvKPI.KPIProcessor.kpiFilterType)paramDataFilter.FilterType;
                            objLocalProcessor.Filter_FromDate = paramDataFilter.Filter_FromDate;
                            objLocalProcessor.Filter_ToDate = paramDataFilter.Filter_ToDate;
                            objLocalProcessor.Filter_FromDepth = paramDataFilter.Filter_FromDepth;
                            objLocalProcessor.Filter_ToDepth = paramDataFilter.Filter_ToDepth;
                            objLocalProcessor.Filter_LastHours = paramDataFilter.Filter_LastHours;
                        }
                    }


                    objItem.objProfile.objProcessor = objLocalProcessor; //Copy by Refrence

                    objLocalProcessor.objDataService = objDataService;
                    objLocalProcessor.objProfile = objItem.objProfile;
                    objLocalProcessor.objWorkSpace = objWorkSpace;



                    //objProcessor.processProfile();
                    objLocalProcessor.processProfile();
                    Thread.Sleep(2000);



                    //foreach (AdvKPIData objItem_ in objProcessor.outputData.Values)
                    foreach (AdvKPIData objItem_ in objLocalProcessor.outputData.Values)
                    {

                        if (objItem_.SeriesType == AdvKPIData.enAdvKPiSeriesType.Pie)
                        {
                            //noting to do right now..
                        }
                        else
                        {
                            if (objLocalProfile.DataGroup == AdvKPIData.enAdvKPIDataGroup.TimePeriod & objLocalProfile.TimeUnit == AdvKPIData.enAdvKPITimeUnit.CumulativeDays)
                            {
                                if (objLocalProfile.TagSourceID.Trim() == "")
                                {
                                    mapPhaseTagsWithDays(ref objItem_.arrXData, ref objItem_.arrDateData);
                                }
                            }
                            else
                            {
                                if (objLocalProfile.HighlightTags)
                                {
                                    if (objLocalProfile.TagSourceID.Trim() == "")
                                    {
                                        mapPhaseTagsWithDays(ref objItem_.outputData);
                                    }
                                    else
                                    {
                                        mapCustomTagsWithDays(ref objItem_.outputData);
                                    }

                                    doHighlightTags = true;
                                    doHighlightNPT = true;
                                }
                            }
                        }

                    }

                    //update Series 


                    this.objProcessor = objLocalProcessor;

                    foreach (AdvKPIData objSeries in objLocalProcessor.outputData.Values)
                    {
                        objSeries.XColumn = "X" + getBottomAxis().Replace("_", "").ToString();
                        objSeries.YColumn = "Y" + getVerticalAxisByColumnID(objSeries.getDataColumnID()).Replace("_", "").ToString();
                    }
                    //objItem.objProfile.objProcessor = objLocalProcessor;
                    objItem.objProfile = objLocalProfile.getCopy();
                    objItem.objProfile.objProcessor = objLocalProcessor;

//                    objCompositeProfile.Items[0].objProfile.objProcessor.outputData[0].arrXData
//objCompositeProfile.Items[0].objProfile.objProcessor.outputData[0].arrYData


                }

            
            }
            catch (Exception ex)
            {
                string LastError = ex.Message + ex.StackTrace;

            }      
    
        }


        private void processCompositeProfile()
        {
            try
            {
                AdvKPIProfile objLocalProfile;


                foreach (CompositeData objItem in objCompositeProfile.items.Values)
                {
                    KPIProcessor objLocalProcessor = new KPIProcessor();

                    //objItem.objProfile.objProcessor = new KPIProcessor();
                    objLocalProfile = objItem.objProfile;
                    //objProcessor = objItem.objProfile.objProcessor;
                    //objProcessor.objDataService = objDataService;
                    //objProcessor.objProfile = objItem.objProfile;
                    //objProcessor.objWorkSpace = objWorkSpace;

                    //objLocalProcessor = objItem.objProfile.objProcessor;
                    objItem.objProfile.objProcessor = objLocalProcessor;
                    objLocalProcessor.objDataService = objDataService;
                    objLocalProcessor.objProfile = objItem.objProfile;
                    objLocalProcessor.objWorkSpace = objWorkSpace;



                    //objProcessor.processProfile();
                    objLocalProcessor.processProfile();
                    Thread.Sleep(2000);



                    //foreach (AdvKPIData objItem_ in objProcessor.outputData.Values)
                    foreach (AdvKPIData objItem_ in objLocalProcessor.outputData.Values)
                    {

                        if (objItem_.SeriesType == AdvKPIData.enAdvKPiSeriesType.Pie)
                        {
                            //noting to do right now..
                        }
                        else
                        {
                            if (objLocalProfile.DataGroup == AdvKPIData.enAdvKPIDataGroup.TimePeriod & objLocalProfile.TimeUnit == AdvKPIData.enAdvKPITimeUnit.CumulativeDays)
                            {
                                if (objLocalProfile.TagSourceID.Trim() == "")
                                {
                                    mapPhaseTagsWithDays(ref objItem_.arrXData, ref objItem_.arrDateData);
                                }
                            }
                            else
                            {
                                if (objLocalProfile.HighlightTags)
                                {
                                    if (objLocalProfile.TagSourceID.Trim() == "")
                                    {
                                        mapPhaseTagsWithDays(ref objItem_.outputData);
                                    }
                                    else
                                    {
                                        mapCustomTagsWithDays(ref objItem_.outputData);
                                    }

                                    doHighlightTags = true;
                                    doHighlightNPT = true;
                                }
                            }
                        }

                    }

                    //update Series 


                    this.objProcessor = objLocalProcessor;

                    foreach (AdvKPIData objSeries in objLocalProcessor.outputData.Values)
                    {
                        objSeries.XColumn = "X" + getBottomAxis().Replace("_", "").ToString();
                        objSeries.YColumn = "Y" + getVerticalAxisByColumnID(objSeries.getDataColumnID()).Replace("_", "").ToString();
                    }
                    objItem.objProfile.objProcessor = objLocalProcessor;

                }

                bool halt = true;
            }
            catch (Exception ex)
            {
                string LastError = ex.Message + ex.StackTrace;

            }

        }

        #endregion


    }//class

}//Namespace
