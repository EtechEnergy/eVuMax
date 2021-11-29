using eVuMax.DataBroker.Broker;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.GenericDrillingSummary
{
    public class gdSummaryMgr : IBroker
    {
        const string getGDSummaryList = "getGDSummaryList";
        const string generateGDSummary = "generateGDSummary";
        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                if (paramRequest.Function == getGDSummaryList)
                {
                    
                    objResponse = gdSummary.LoadgdSummaryList(ref paramRequest);

                    return objResponse;
                }


                if (paramRequest.Function == generateGDSummary)
                {
                    string wellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                    string UserID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue;
                    string plotID = paramRequest.Parameters.Where(x => x.ParamName.Contains("PlotID")).FirstOrDefault().ParamValue;

                    gdSummary objSummary = new gdSummary();
                    
                    objResponse = objSummary.loadSummaryData(wellID,plotID, ref paramRequest);

                    return objResponse;
                }


                return objResponse;

            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in getDrlgConnections " + ex.Message + ex.StackTrace;
                return objBadResponse;

            }
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            throw new NotImplementedException();
        }
    }
}
