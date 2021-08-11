using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using eVuMax.DataBroker.Common;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.Well.Data.Objects
{
    public class WellDataObjectsBroker: IBroker
    {

		public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
		{
			try
			{

				if (paramRequest.Broker == Global.DO_ActiveWellProfile)
				{

					Well.Dashboard.WellDashboard objWellDashboard = new Well.Dashboard.WellDashboard();
					return objWellDashboard.getData(paramRequest);

					//Common.authentication.UserAuthentication objAuth = new Common.authentication.UserAuthentication();
					//return objAuth.getData(paramRequest);
				}


                //Nishant Vyas: 28-05-2020 for managing Well, TimeLog, DepthLog etc..
                if (paramRequest.Broker == Global.DO_WellObjectManager)
                {

                    DataObject.WellBroker objWellManager = new DataObject.WellBroker();
                    return objWellManager.getData(paramRequest);
                    // return objWellDashboard.getData(paramRequest);

                }

                if (paramRequest.Broker == Global.DO_TimelogObjectManager)
                {

                }

                ////********************************************






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
                if (paramRequest.Broker == Global.DO_ActiveWellProfile)
                {

                    Well.Dashboard.WellDashboard objWellDashboard = new Well.Dashboard.WellDashboard();
                    return objWellDashboard.performTask(paramRequest);

                    //Common.authentication.UserAuthentication objAuth = new Common.authentication.UserAuthentication();
                    //return objAuth.getData(paramRequest);
                }
                //Nishant 10-06-2020
                if(paramRequest.Broker == Global.DO_WellObjectManager) 
                {
                    eVuMax.DataBroker.DataObject.WellBroker objWellDataBroker = new eVuMax.DataBroker.DataObject.WellBroker();
                    return objWellDataBroker.performTask(paramRequest);
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
