using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager 
{
    public class AlertSettingsMgr : IBroker
    {
        const string loadAlertSettings = "loadAlertSettings";
        const string saveAlertSettings = "saveAlertSettings";


        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();
            AlertSettings objAlertSettings = new AlertSettings(ref paramRequest.objDataService);

            if (paramRequest.Function == loadAlertSettings)
            {
                AlertSettings objSettings =  objAlertSettings.loadSettings();

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objSettings);
                return objResponse;
            }
            return objResponse;
        }





        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();
            //AlertSettings objAlertSettings = new AlertSettings(ref paramRequest.objDataService);

            if (paramRequest.Function == saveAlertSettings)
            {
                objResponse = this.saveAlertSettings_(paramRequest);
                return objResponse;
            }
            else
            {

            }
            return objResponse;
            //throw new NotImplementedException();
        }


        public Broker.BrokerResponse saveAlertSettings_(Broker.BrokerRequest paramRequest)
        {
            try
            {
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string strAlartSettings = paramRequest.Parameters.Where(x => x.ParamName.Contains("ObjAlertSettings")).FirstOrDefault().ParamValue;
                
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                //  AlertSettings objAlertSettings = new AlertSettings(ref paramRequest.objDataService);

                AlertSettings objAlertSettings = JsonConvert.DeserializeObject<AlertSettings>(strAlartSettings);
                 


                if (objAlertSettings.saveSettings(objAlertSettings, ref paramRequest.objDataService))
                {
                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;
                }
                else
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving user settings " + objAlertSettings.LastError;
                    return objBadResponse;

                }



                objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = true;
                objResponse.Errors = "";
                return objResponse;






                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving user settings " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

    }
}
