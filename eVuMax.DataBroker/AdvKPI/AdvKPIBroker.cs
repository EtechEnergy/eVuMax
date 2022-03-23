using eVuMax.DataBroker.AdvKPI;
using eVuMax.DataBroker.Broker;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.AdvKPI_
{
    public class AdvKPIBroker : IBroker
    {
        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Broker == Global.Brk_AdvKPI)
                {


                    AdvKPIManager objMgr = new AdvKPIManager();
                    return objMgr.getData(paramRequest);

                    //Common.authentication.UserAuthentication objAuth = new Common.authentication.UserAuthentication();
                    //return objAuth.getData(paramRequest);
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

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

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
