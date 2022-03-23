﻿using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Threading;
using System.Threading.Tasks;
using VuMaxDR.AdvKPI;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.AdvKPI_
{
    public class ProcessAdvKPI
    {

        public AdvKPIProfile objProfile;
        public KPIProcessor objProcessor = new KPIProcessor();
      
        private DataService objDataService;
        
        //private advKPIChartAxis baseBottomAxis;
        private int xAxisStartPosition = 0;
        private int xAxisEndPosition = 0;
        private int yAxisStartPosition = 0;
        private int yAxisEndPosition = 0;
        private int topAxisCount = 0;
        private int bottomAxisCount = 0;
        private int leftAxisCount = 0;
        private int rightAxisCount = 0;
        private int maxLeftRelativePosition = 0;
        private int maxRightRelativePosition = 0;
        private bool FormSizeChanged = false;
        private int lastX = 0;
        private int lastY = 0;
        //private Panel panelVertical = new Panel();
        //private Panel panelHorizontal = new Panel();
        private Dictionary<double, clsPhaseTag> phaseTagList = new Dictionary<double, clsPhaseTag>();
        private Dictionary<double, clsCustomTag> customTagList = new Dictionary<double, clsCustomTag>();
        private bool doHighlightTags = false;
        private bool doHighlightNPT = false;


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
                Thread.Sleep(1000);

                //update Series 


                foreach (AdvKPIData objSeries in objProcessor.outputData.Values)
                {
                    objSeries.XColumn = "X"+ getBottomAxis().Replace("_","").ToString();
                    objSeries.YColumn = "Y" +getVerticalAxisByColumnID(objSeries.getDataColumnID()).Replace("_","").ToString();
                }




                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objProcessor);
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

        private string getVerticalAxisByColumnID(string ColumnID)
        {
            try
            {
                foreach (AdvKPIAxis objAxis in objProcessor.objProfile.axesList.Values)
                {
                  
                    //if (objChart.Axes.Custom(i) is advKPIChartAxis)
                    //{
                    //    if (((advKPIChartAxis)objChart.Axes.Custom(i)).objAxis.ColumnID == ColumnID)
                    //    {
                    //        return objChart.Axes.Custom(i);
                    //    }
                    //}


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
                for (int i = 0; i < WellList.Length; i++)
             
                {
                    string WellID = WellList[i];
                   if (objWorkSpace.wells.ContainsKey(WellID))
                    {
                        objWorkSpace.wells[WellID].Selected = true;
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



    }//class

}//Namespace