using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using eVuMax.DataBroker.Common;
using VuMaxDR.Data;
using eVuMax.DataBroker.Broomstick.Document;

namespace eVuMax.DataBroker.Broomstick
{
    public class BroomstickBroker: IBroker
    {

        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Broker == Global.BS_DataManager)
                {

                    Broomstick.Document.BroomstickDocMgr objMgr = new BroomstickDocMgr();
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

        public Broker.BrokerResponse performTask(Broker.BrokerRequest paramRequest)
        {
            try
            {

                //Nothing to implemente till now ...
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
