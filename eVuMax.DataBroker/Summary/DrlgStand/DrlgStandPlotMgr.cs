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
        public eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                
                if (paramRequest.Function == generateDrlgStandPlot)
                {
                  
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

                        objDrlgStandPlot.objDataSelection.StandPlot_ComparisonWindow = objStandUserSettings.StandPlot_ComparisonWindow;
                        objDrlgStandPlot.objDataSelection.StandPlot_ShowOffset = objStandUserSettings.StandPlot_ShowOffset;








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

                        
                        objLogger.LogMessage("DlgStanPlotMgr Error Line 95" );

                        objDrlgStandPlot.objDataSelection.loadDataSelection("STANDREPORT");

                        objStandUserSettings.FromDate = objDrlgStandPlot.objDataSelection.FromDate;
                        objStandUserSettings.ToDate = objDrlgStandPlot.objDataSelection.ToDate;
                        objStandUserSettings.FromDepth = objDrlgStandPlot.objDataSelection.FromDepth;
                        objStandUserSettings.ToDepth = objDrlgStandPlot.objDataSelection.ToDepth;


                        objStandUserSettings.StandPlot_ComparisonWindow = objDrlgStandPlot.objDataSelection.StandPlot_ComparisonWindow;
                        objStandUserSettings.StandPlot_ShowOffset = objDrlgStandPlot.objDataSelection.StandPlot_ShowOffset;

                        objStandUserSettings.LastHrs = objDrlgStandPlot.objDataSelection.LastHours;
                        objStandUserSettings.SelectionType = (sPlotSelectionType) objDrlgStandPlot.objDataSelection.selectionType;

                   
                        //Saving React side UserSetting to eVuMax into UserSetting table.
                        objSettings.UserId = objStandUserSettings.UserID;
                        objSettings.settingData = JsonConvert.SerializeObject(objStandUserSettings);
                        objSettings.WellId = objStandUserSettings.WellID;
                        objSettings.SettingsId = "STANDREPORT";

                        objLogger.LogMessage("DlgStanPlotMgr Error Line 118");
                        objSettingsMgr.saveUserSettings(objSettings);
                    }


                 

                    objDrlgStandPlot.objUserSettings = objStandUserSettings;
                    // wellID = objStandUserSettings.WellID; //work around




                    

                    objResponse = objDrlgStandPlot.generateReportData(ref paramRequest, objStandUserSettings.WellID);
                    objResponse.Warnings = objDrlgStandPlot.warnings;
                 

                    if (objResponse.RequestSuccessfull == false)
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

                eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();
           
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
                objLogger.LogMessage("DlgStanPlotMgr Error Line 189" + ex.Message + ex.StackTrace);
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }
    }//Class
}//NameSpace
