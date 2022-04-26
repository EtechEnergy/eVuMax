using eVuMax.DataBroker.Broker;

using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Common;

namespace eVuMax.DataBroker.DataServiceManager
{
    public class DataServiceMgr:IBroker
    {
        const string loadSystemSettings = "loadSystemSettings";
        const string SaveSystemSettings = "SaveSystemSettings";
        

        public eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try


            {
               BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == loadSystemSettings)
                {
                    VuMaxDR.Common.SystemSettings objSystemSettings = new VuMaxDR.Common.SystemSettings();
                    objSystemSettings =  SystemSettings.loadSystemSettings(ref paramRequest.objDataService);
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objSystemSettings);
                    return objResponse;

                }

                return objResponse;

            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Warnings = ex.Message;
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
                
            }
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == SaveSystemSettings)
                {


                    string userID = "";
                    string strSetings = "";
                    Dictionary<string, SettingValue> objSettings = new Dictionary<string, SettingValue>();



                    userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strSetings = paramRequest.Parameters.Where(x => x.ParamName.Contains("Settings")).FirstOrDefault().ParamValue.ToString();
                    
                    if(strSetings != "")
                    {
                        try
                        {
                            //objSettings = JsonConvert.DeserializeObject<SettingValue>(strSetings);
                            objSettings = (Dictionary<string, SettingValue>)JsonConvert.DeserializeObject(strSetings);
                        }
                        catch (Exception ex)
                        {
                            objSettings = new Dictionary<string, SettingValue>();

                        }
                    }
                                     
                    SystemSettings.saveSystemSettings(ref paramRequest.objDataService, objSettings);
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = "";
                    return objResponse;

                }

                return objResponse;

            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Warnings = ex.Message;
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }
        }
    }
}
