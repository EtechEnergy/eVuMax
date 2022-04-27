using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DataServiceManager.Setup
{
    public class RigStateSetupMgr : IBroker
    {
        const string loadCommonRigStateSetup = "loadCommonRigStateSetup";
        const string saveCommonRigStateSetup = "saveCommonRigStateSetup";

        const string loadRigSpecificRigStateSetup = "loadRigSpecificRigStateSetup";
        const string saveRigSpecificRigStateSetup = "saveRigSpecificRigStateSetup";


        public eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try


            {
                BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == loadCommonRigStateSetup)
                {
                    VuMaxDR.Data.Objects.rigState objRigState = new VuMaxDR.Data.Objects.rigState();
                    objRigState = VuMaxDR.Data.Objects.rigState.loadCommonRigStateSetup(ref paramRequest.objDataService);
                    
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objRigState);
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
            throw new NotImplementedException();
        }
    }
}
