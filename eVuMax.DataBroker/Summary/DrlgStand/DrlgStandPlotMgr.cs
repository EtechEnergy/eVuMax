using eVuMax.DataBroker.Broker;
using eVuMax.DataBroker.GenericDrillingSummary;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.DrlgStand
{
    public class DrlgStandPlotMgr : IBroker
    {
        const string generateDrlgStandPlot = "generateDrlgStandPlot";
        const string saveUserSettings = "SaveUserSettings";
        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                if (paramRequest.Function == generateDrlgStandPlot)
                {
                    //string wellID = "";
                    //string UserID = "";
                    //string plotID = "";

                    //bool HighlightDayNight = false;
                    //bool ShowExcludedStands = false;

                    DrlgStandUserSettings objStandUserSettings = new DrlgStandUserSettings();
                    string strStandSettings = "";
                    strStandSettings = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserSettings")).FirstOrDefault().ParamValue.ToString();

                    if (strStandSettings != "")
                    {
                        objStandUserSettings = JsonConvert.DeserializeObject<DrlgStandUserSettings>(strStandSettings);
                        if (objStandUserSettings.RealTime)
                        {
                            //objStandUserSettings.SelectionType = eNumSelectionType.ByHrs;
                            objStandUserSettings.SelectionType = sPlotSelectionType.ByHours;
                        }
                    }

                    

                    //string selectionType = paramRequest.Parameters.Where(x => x.ParamName.Contains("SelectionType")).FirstOrDefault().ParamValue.ToString();
                    //double fromDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDepth")).FirstOrDefault().ParamValue.ToString());
                    //double toDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDepth")).FirstOrDefault().ParamValue.ToString());



                    //string SideTrackKey = "-999";


                    //DateTime fromDate = DateTime.Now;
                    //DateTime toDate = DateTime.Now;

                    //try
                    //{
                    //    HighlightDayNight = Boolean.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("HighlightDayNight")).FirstOrDefault().ParamValue.ToString());
                    //    ShowExcludedStands = Boolean.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ShowExcludedStands")).FirstOrDefault().ParamValue.ToString());
                    //    fromDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDate")).FirstOrDefault().ParamValue.ToString());
                    //    toDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDate")).FirstOrDefault().ParamValue.ToString());


                    //    //Convert date to UTC
                    //    fromDate = fromDate.ToUniversalTime();
                    //    toDate = toDate.ToUniversalTime();
                    //}
                    //catch (Exception)
                    //{


                    //}

                    //bool isRealTime = false;
                    //int refreshHrs = 24;
                    //isRealTime = Convert.ToBoolean(paramRequest.Parameters.Where(x => x.ParamName.Contains("isRealTime")).FirstOrDefault().ParamValue);
                    //refreshHrs = Convert.ToInt32(paramRequest.Parameters.Where(x => x.ParamName.Contains("refreshHrs")).FirstOrDefault().ParamValue);

                    //if (isRealTime)
                    //{
                    //    selectionType = "2";
                    //}
                    //try
                    //{
                    //    wellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue;
                    //    UserID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue;
                    //    plotID = paramRequest.Parameters.Where(x => x.ParamName.Contains("PlotID")).FirstOrDefault().ParamValue;
                    //}
                    //catch (Exception ex)
                    //{

                    //    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    //    objBadResponse.RequestSuccessfull = false;
                    //    objBadResponse.Errors = "Error in Generic Drilling Summary GetData. Some of the parameters are not corrrect." + ex.Message + ex.StackTrace;
                    //    return objBadResponse;
                    //}

                    //paramRequest.objDataService.UserName = UserID;
                    ////DrlgStandPlot objDrlgStandPlot = new DrlgStandPlot(paramRequest, wellID);
                    DrlgStandPlot objDrlgStandPlot = new DrlgStandPlot();
                    paramRequest.objDataService.UserName = objStandUserSettings.UserID;
                    objDrlgStandPlot.objRequest = paramRequest;


                    UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);
                    UserSettings.UserSettings objSettings = objSettingsMgr.loadUserSettings(objStandUserSettings.UserID, "STANDREPORT", objStandUserSettings.WellID);

                    //load UserSettings from eVuMax table
                    if (objSettings != null)
                    {
                        objStandUserSettings = new DrlgStandUserSettings();
                        //ReInitlize UserSettings from Database
                        objStandUserSettings = JsonConvert.DeserializeObject<DrlgStandUserSettings>(objSettings.settingData); 
                        objDrlgStandPlot.objDataSelection.objRequest = paramRequest;
                        objDrlgStandPlot.objDataSelection.WellID = objStandUserSettings.WellID;
                        objDrlgStandPlot.objDataSelection.loadDataSelection("STANDREPORT");
                        //assign eVuMax User Settings to dataSelector of VuMax
                        objDrlgStandPlot.objDataSelection.selectionType = (DataSelection.sPlotSelectionType)objStandUserSettings.SelectionType;
                        objDrlgStandPlot.objDataSelection.LastHours= objStandUserSettings.LastHrs;
                        objDrlgStandPlot.objDataSelection.FromDate= objStandUserSettings.FromDate;
                        objDrlgStandPlot.objDataSelection.ToDate = objStandUserSettings.ToDate;
                        objDrlgStandPlot.objDataSelection.FromDepth= objStandUserSettings.FromDepth;
                        objDrlgStandPlot.objDataSelection.ToDepth= objStandUserSettings.ToDepth;
                        
                        // objStandUserSettings = JsonConvert.DeserializeObject<DrlgStandUserSettings>(objSettings.settingData);

                        //switch (objStandUserSettings.SelectionType)
                        //{
                        //    case eNumSelectionType.DefaultByHrs:
                        //        //(eNumSelectionType)(-1):
                        //        //objDrlgStandPlot.objDataSelection.selectionType = DataSelection.sPlotSelectionType.ByHours;
                        //        //objDrlgStandPlot.objDataSelection.LastHours = 24;
                        //        objDrlgStandPlot.objDataSelection.selectionType = DataSelection.sPlotSelectionType.ByHours;
                        //        objDrlgStandPlot.objDataSelection.LastHours = objStandUserSettings.LastHrs;
                        //        break;
                        //    case eNumSelectionType.ByHrs: //1
                        //        objDrlgStandPlot.objDataSelection.selectionType = DataSelection.sPlotSelectionType.ByHours;
                        //        objDrlgStandPlot.objDataSelection.LastHours = objStandUserSettings.LastHrs;
                        //        break;
                        //    case eNumSelectionType.DateRange: // 0:
                        //        objDrlgStandPlot.objDataSelection.selectionType = DataSelection.sPlotSelectionType.DateRange;
                        //        objDrlgStandPlot.objDataSelection.FromDate = objStandUserSettings.FromDate;
                        //        objDrlgStandPlot.objDataSelection.ToDate = objStandUserSettings.ToDate;
                        //        break;
                        //    case eNumSelectionType.DepthRange: // 3:
                        //        objDrlgStandPlot.objDataSelection.selectionType = DataSelection.sPlotSelectionType.DepthRange;
                        //        objDrlgStandPlot.objDataSelection.FromDepth = objStandUserSettings.FromDepth;
                        //        objDrlgStandPlot.objDataSelection.ToDepth = objStandUserSettings.ToDepth;
                        //        break;
                        //}

                        if (objStandUserSettings.RealTime)
                        {
                            objDrlgStandPlot.objDataSelection.selectionType = DataSelection.sPlotSelectionType.ByHours;
                            objDrlgStandPlot.objDataSelection.LastHours = objStandUserSettings.LastHrs;

                        }


                    }
                    else //load VuMax DataSelector object as its not in eVuMax UserSetting table
                    {
                        objSettings = new UserSettings.UserSettings();
                        objDrlgStandPlot.objDataSelection.objRequest = paramRequest;
                        objDrlgStandPlot.objDataSelection.objRequest.objDataService.UserName = objStandUserSettings.UserID;
                        objDrlgStandPlot.objDataSelection.WellID = objStandUserSettings.WellID;

                        objDrlgStandPlot.objDataSelection.loadDataSelection("STANDREPORT");

                        objStandUserSettings.FromDate = objDrlgStandPlot.objDataSelection.FromDate;
                        objStandUserSettings.ToDate = objDrlgStandPlot.objDataSelection.ToDate;
                        objStandUserSettings.FromDepth = objDrlgStandPlot.objDataSelection.FromDepth;
                        objStandUserSettings.ToDepth = objDrlgStandPlot.objDataSelection.ToDepth;

                        objStandUserSettings.LastHrs = objDrlgStandPlot.objDataSelection.LastHours;
                        objStandUserSettings.SelectionType = (sPlotSelectionType) objDrlgStandPlot.objDataSelection.selectionType;

                        //switch (objDrlgStandPlot.objDataSelection.selectionType)
                        //{
                        //    case DataSelection.sPlotSelectionType.ByHours:
                        //        //objStandUserSettings.SelectionType = eNumSelectionType.DefaultByHrs;
                        //        objStandUserSettings.SelectionType = sPlotSelectionType.ByHours;
                        //        break;
                            
                        //    case DataSelection.sPlotSelectionType.DateRange:
                        //        objStandUserSettings.SelectionType = sPlotSelectionType.DateRange;
                        //        break;
                        //    case DataSelection.sPlotSelectionType.DepthRange: 
                        //        objStandUserSettings.SelectionType = sPlotSelectionType.DepthRange;
                        //        break;
                        //}
                        //Saving React side UserSetting to eVuMax into UserSetting table.
                        objSettings.UserId = objStandUserSettings.UserID;
                        objSettings.settingData = JsonConvert.SerializeObject(objStandUserSettings);
                        objSettings.WellId = objStandUserSettings.WellID;
                        objSettings.SettingsId = "STANDREPORT";

                        objSettingsMgr.saveUserSettings(objSettings);
                    }


                 

                    objDrlgStandPlot.objUserSettings = objStandUserSettings;
                   // wellID = objStandUserSettings.WellID; //work around
                    
                  
                    
                    objResponse = objDrlgStandPlot.generateReportData(ref paramRequest, objStandUserSettings.WellID);
                    if(objResponse.RequestSuccessfull == false)
                    {
                        objResponse.Warnings = objResponse.Errors;
                    }
                    return objResponse;
                }

                objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
                return objResponse;
            }

            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == saveUserSettings)
                {

                    DrlgStandUserSettings objStandUserSettings = new DrlgStandUserSettings();
                    string strStandSettings = "";
                    strStandSettings = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserSettings")).FirstOrDefault().ParamValue.ToString();

                    if (strStandSettings != "")
                    {
                        objStandUserSettings = JsonConvert.DeserializeObject<DrlgStandUserSettings>(strStandSettings);
                    }

                    UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);
                    UserSettings.UserSettings objSettings = new UserSettings.UserSettings();
                    objSettings.UserId = objStandUserSettings.UserID;
                    objSettings.WellId = objStandUserSettings.WellID;
                    objSettings.SettingsId = "STANDREPORT";
                    objSettings.settingData = JsonConvert.SerializeObject(objStandUserSettings);
                    objSettingsMgr.saveUserSettings(objSettings);

                }


                objResponse.RequestSuccessfull = true;
                objResponse.Errors = "";
                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }
    }//Class
}//NameSpace
