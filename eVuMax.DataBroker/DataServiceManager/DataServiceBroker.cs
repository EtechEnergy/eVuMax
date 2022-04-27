using eVuMax.DataBroker.Broker;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DataServiceManager
{
    public class DataServiceBroker : IBroker
    {
        BrokerResponse IBroker.getData(BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Broker == Global.Brk_Setup_CommonSetting)
                {
                    CommonSettingsMgr objMgr = new CommonSettingsMgr();
                    return objMgr.getData(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_QCRules)
                {
                    QCRulesMgr objQCRulesMgr = new QCRulesMgr();
                    return objQCRulesMgr.getData(paramRequest);
                }


                BrokerResponse objResponse = paramRequest.createResponseObject();
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

        BrokerResponse IBroker.performTask(BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Broker == Global.Brk_Setup_CommonSetting)
                {
                    CommonSettingsMgr objMgr = new CommonSettingsMgr();
                    return objMgr.performTask(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_QCRules)
                {
                    //CommonSettingsMgr objMgr = new CommonSettingsMgr();
                    //return objMgr.performTask(paramRequest);
                }

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
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
    }
}
