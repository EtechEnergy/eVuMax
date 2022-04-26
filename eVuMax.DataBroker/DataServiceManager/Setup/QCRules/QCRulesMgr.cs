using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager
{
    public class QCRulesMgr : IBroker
    {
        const string loadQCRules = "loadQCRules";
        const string addQCRule  = "addQCRule";
        const string editQCRule = "editQCRule";
        const string removeQCRule = "removeQCRule";




        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();

            if (paramRequest.Function == loadQCRules)
            {
                //VuMaxDR.Common.SystemSettings objSystemSettings = new VuMaxDR.Common.SystemSettings();
                //objSystemSettings = SystemSettings.loadSystemSettings(ref paramRequest.objDataService);

                eQCRules objQCRules = new eQCRules(ref paramRequest.objDataService);
                DataTable QCRulesList = objQCRules.getRuleList();

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(QCRulesList);
                return objResponse;

            }

            return objResponse;
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            throw new NotImplementedException();
        }
    }
}
