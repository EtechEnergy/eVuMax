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
        public string saveAlarms = "saveAlarms";

        //DataService objDataService;


        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();

            if (paramRequest.Function == loadProfiles)
            {
                string WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue;

                SetupAlarms objSetupAlarms = new SetupAlarms();

                objSetupAlarms.WellID = WellID;
                objSetupAlarms.objProfileList = paramRequest.objDataService.getTable("SELECT PROFILE_ID,PROFILE_NAME FROM VMX_ALARM_PANEL_PROFILE ORDER BY PROFILE_NAME");
                objSetupAlarms.WellProfileID = VuMaxDR.Data.Objects.Well.getAlarmProfileID(ref paramRequest.objDataService, WellID);

                
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objSetupAlarms);
                    return objResponse;
                
            
            }
            throw new NotImplementedException();
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            if (paramRequest.Function == saveAlarms)
            {

            }
            throw new NotImplementedException();
        }
    }
}
