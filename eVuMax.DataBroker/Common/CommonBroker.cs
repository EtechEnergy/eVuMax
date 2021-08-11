using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using eVuMax.DataBroker.Common;


namespace eVuMax.DataBroker.Common
{
    public class CommonBroker: IBroker
    {
        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
			try
			{

				if(paramRequest.Broker==Global.Brk_Authentication)
				{
					authentication.UserAuthentication objAuth = new authentication.UserAuthentication();
					return objAuth.getData(paramRequest);
				}

                if (paramRequest.Broker == Global.Brk_TimeData)
                {
                    TimeData.TimeData objTimeData = new TimeData.TimeData();
                    return objTimeData.getData(paramRequest);
                }

                if (paramRequest.Broker == Global.Common_Functions)
                {
                    CommonFunctions objFunctions = new CommonFunctions();
                    return objFunctions.getData(paramRequest);
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
				return null;
			}
			catch (Exception ex)
			{

				return null;
			}
		}
    }
}
