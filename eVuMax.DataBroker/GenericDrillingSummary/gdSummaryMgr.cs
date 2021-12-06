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

                    string wellID = "";
                  

                    try
                    {
                        wellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                        
                    }
                    catch (Exception ex)
                    {

                        Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                        objBadResponse.RequestSuccessfull = false;
                        objBadResponse.Errors = "Error in Generic Drilling Summary GetData. Some of the parameters are not corrrect." + ex.Message + ex.StackTrace;
                        return objBadResponse;
                    }
                    objResponse = gdSummary.LoadgdSummaryList(ref paramRequest);
                    string wellName = "";
                    wellName = paramRequest.objDataService.getValueFromDatabase("SELECT WELL_NAME FROM VMX_WELL WHERE WELL_ID='" + wellID + "'").ToString();
                    objResponse.Category = wellName;

                    return objResponse;
                }


                if (paramRequest.Function == generateGDSummary)
                {
                    string wellID = "";
                    string UserID = "";
                    string plotID = "";

                    try
                    {
                        wellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("wellID")).FirstOrDefault().ParamValue;
                        UserID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue;
                        plotID = paramRequest.Parameters.Where(x => x.ParamName.Contains("PlotID")).FirstOrDefault().ParamValue;
                    }
                    catch (Exception ex)
                    {

                        Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                        objBadResponse.RequestSuccessfull = false;
                        objBadResponse.Errors = "Error in Generic Drilling Summary GetData. Some of the parameters are not corrrect." + ex.Message + ex.StackTrace;
                        return objBadResponse;
                    }

                    paramRequest.objDataService.UserName = UserID;
                    gdSummary objSummary = new gdSummary(paramRequest,wellID,plotID);
                    gdSummary.loadSummaryObject(ref objSummary);
                    
                    objResponse = gdSummary.loadSummaryData(ref objSummary);
                    return objResponse;
                }
                return objResponse;

            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in Generic Drilling Summary GetData " + ex.Message + ex.StackTrace;
                return objBadResponse;

            }
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            return new BrokerResponse();
        }
    }
}
