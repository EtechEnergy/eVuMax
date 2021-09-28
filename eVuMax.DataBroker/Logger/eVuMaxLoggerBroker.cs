using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Logger
{
    class eVuMaxLoggerBroker:IBroker
    {

        const string logClientMessage = "logClientMessage";
        const string logServerMessage = "logServerMessage";
        const string getClientLog= "getClientLog";
        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                //Nishant :20-10-2020
                if (paramRequest.Function == logClientMessage)
                {

                    eVuMaxLogger.eVuMaxLogger objLog = new eVuMaxLogger.eVuMaxLogger();
                    objResponse = objLog.LogClientMessage(paramRequest);
                    return objResponse;
                }

                if (paramRequest.Function == logServerMessage)
                {

                    eVuMaxLogger.eVuMaxLogger objLog = new eVuMaxLogger.eVuMaxLogger();
                    objResponse = objLog.LogMessage(paramRequest);
                    return objResponse;
                }




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

        public Broker.BrokerResponse performTask(Broker.BrokerRequest paramRequest)
        {
            try
            {
               
                if(paramRequest.Function == getClientLog)
                {

                }


                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
                return objResponse;

            }
            catch (Exception ex)
            {

                return null;
            }
        }
    }
}
