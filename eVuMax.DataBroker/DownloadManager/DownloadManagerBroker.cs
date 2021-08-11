using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DownloadManager
{
    public class DownloadManagerBroker:IBroker
    {
        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                //if (paramRequest.Broker == Global.DO_DownloadManager)
                //{

                //    Well.Dashboard.WellDashboard objWellDashboard = new Well.Dashboard.WellDashboard();
                //    return objWellDashboard.getData(paramRequest);

                //    //Common.authentication.UserAuthentication objAuth = new Common.authentication.UserAuthentication();
                //    //return objAuth.getData(paramRequest);
                //}


                ////Nishant Vyas: 28-05-2020 for managing Well, TimeLog, DepthLog etc..
                //if (paramRequest.Broker == Global.DO_WellObjectManager)
                //{

                //    DataObject.WellBroker objWellManager = new DataObject.WellBroker();
                //    return objWellManager.getData(paramRequest);
                //    // return objWellDashboard.getData(paramRequest);

                //}

                if (paramRequest.Broker == Global.DO_DownloadManager)
                {
                    DownloadManager.DownloadBroker objDownloadManager = new DownloadBroker();
                     return objDownloadManager.getData(paramRequest);
                    
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
                if (paramRequest.Broker == Global.DO_DownloadManager)
                {

                    DownloadManager.DownloadBroker objDownloadManager = new DownloadBroker();
                    return objDownloadManager.performTask(paramRequest);
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
