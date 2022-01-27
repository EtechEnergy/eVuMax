using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.TripReport
{
    class TripReportMgr : IBroker
    {
        const string generateTripReport = "generateTripReport";
        const string saveUserSettings = "SaveUserSettings";
        const string refreshSingleTripStats = "refreshSingleTripStats";
        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
            if (paramRequest.Function == generateTripReport)
            {
                TripReportData objTripReport = new TripReportData();
                string WellID = "";
                WellID =  paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();
                              
                string strTripReportSettings = "";
               
                //strTripReportSettings = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserSettings")).FirstOrDefault().ParamValue.ToString();

                //if (strTripReportSettings != "")
                //{
                //    objTripReport.objUserSettings = JsonConvert.DeserializeObject<TripReportSettings>(strTripReportSettings);
                    
                //}

                
                objResponse = objTripReport.generateTripReport(ref paramRequest.objDataService, WellID);
                                
                if (objResponse.RequestSuccessfull == false)
                {
                    objResponse.Warnings = objResponse.Errors;
                }
                return objResponse;


            }

            //phaseIndexID
            if (paramRequest.Function == refreshSingleTripStats)
            {

                string WellID = "";
                int phaseIndexID = 0;

                WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();
                phaseIndexID = Convert.ToInt32(paramRequest.Parameters.Where(x => x.ParamName.Contains("phaseIndexID")).FirstOrDefault().ParamValue.ToString());

                TripReportData objTripReport = new TripReportData();
                objResponse = objTripReport.refreshSingleTripStats(ref paramRequest.objDataService, WellID, phaseIndexID);

                if (objResponse.RequestSuccessfull == false)
                {
                    objResponse.Warnings = objResponse.Errors;
                }
                return objResponse;


            }

            objResponse = paramRequest.createResponseObject();
            objResponse.RequestSuccessfull = false;
            objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
            return objResponse;

        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            //till now nothing
            Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
            objResponse.RequestSuccessfull = false;
            objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
            return objResponse;
        }
    }
}
