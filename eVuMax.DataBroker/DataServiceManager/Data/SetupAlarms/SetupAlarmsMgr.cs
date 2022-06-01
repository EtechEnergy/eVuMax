using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;


namespace eVuMax.DataBroker.DataServiceManager 
{
 
    public class SetupAlarmsMgr : IBroker
    {
        public string loadProfiles = "loadProfiles";
        public string saveAlarm = "saveAlarm";
        eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

        //DataService objDataService;


        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();
            

            if (paramRequest.Function == loadProfiles)
            {
                try
                {
                    string WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue;

                    SetupAlarms objSetupAlarms = new SetupAlarms();

                    objSetupAlarms.WellID = WellID;
                    objSetupAlarms.objProfileList = paramRequest.objDataService.getTable("SELECT PROFILE_ID id,PROFILE_NAME text FROM VMX_ALARM_PANEL_PROFILE ORDER BY PROFILE_NAME");
                    objSetupAlarms.WellProfileID = VuMaxDR.Data.Objects.Well.getAlarmProfileID(ref paramRequest.objDataService, WellID);


                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objSetupAlarms);
                    return objResponse;
                }
                catch (Exception ex)
                {
                    string LastError = "Error :-" +  ex.Message + " - " + ex.Message;
                    objResponse.RequestSuccessfull = false;
                    objResponse.Warnings = LastError;
                    objResponse.Response = LastError;
                    objLogger.LogMessage("*** Error ===> SetpAlarmMgr line 52 " +LastError);
                    return objResponse;

                }
                
            
            }
            throw new NotImplementedException();
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {

            BrokerResponse objResponse = paramRequest.createResponseObject();

            if (paramRequest.Function == saveAlarm)
            {
                try
                {
                    string WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue;
                    string selectedProfileId = paramRequest.Parameters.Where(x => x.ParamName.Contains("selectedProfileId")).FirstOrDefault().ParamValue;

                    SetupAlarms objSetupAlarms = new SetupAlarms();

                    objSetupAlarms.WellID = WellID;
                    objSetupAlarms.objProfileList = paramRequest.objDataService.getTable("SELECT PROFILE_ID id,PROFILE_NAME text FROM VMX_ALARM_PANEL_PROFILE ORDER BY PROFILE_NAME");
                    objSetupAlarms.WellProfileID = VuMaxDR.Data.Objects.Well.getAlarmProfileID(ref paramRequest.objDataService, WellID);

                    VuMaxDR.Data.Objects.Well.setAlarmProfileID(ref paramRequest.objDataService, WellID, selectedProfileId);
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = "";
                    return objResponse;

                }
                catch (Exception ex)
                {

                    string LastError = "Error :-" + ex.Message + " - " + ex.Message;
                    objResponse.RequestSuccessfull = false;
                    objResponse.Warnings = LastError;
                    objResponse.Response = LastError;
                    objLogger.LogMessage("*** Error ===> SetpAlarmMgr line 81 " + LastError);
                    return objResponse;
                }
              
            }
            throw new NotImplementedException();
        }
    }
}
