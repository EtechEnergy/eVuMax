using eVuMax.DataBroker.AdvKPI_;
using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;


namespace eVuMax.DataBroker.AdvKPI
{
    public class AdvKPIManager : IBroker
    {
        const string loadWorkSpace = "loadWorkSpace";
        const string processAdvKPI = "processAdvKPI";
        const string saveUserSettings = "SaveUserSettings";
        public eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == loadWorkSpace)
                {
                    AdvKPI_.AdvKPI objKPI = new AdvKPI_.AdvKPI();
                    objKPI.loadWorkSpace(ref paramRequest.objDataService);
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objKPI);
                    return objResponse;

                }


                if (paramRequest.Function == processAdvKPI)
                {

                    string ProfileID = "";
                    string strWellList = "";
                    string strDataFilter = "";

                    string[] wellListArr = new string[0];
                    AdvKPIDataFilter objDataFilter = new AdvKPIDataFilter();

                    ProfileID = paramRequest.Parameters.Where(x => x.ParamName.Contains("ProfileID")).FirstOrDefault().ParamValue.ToString();
                    strWellList = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellList")).FirstOrDefault().ParamValue.ToString();
                    strDataFilter = paramRequest.Parameters.Where(x => x.ParamName.Contains("objFilterData")).FirstOrDefault().ParamValue.ToString();
                    if (strDataFilter != "")
                    {
                        objDataFilter = JsonConvert.DeserializeObject<AdvKPIDataFilter>(strDataFilter);
                    }

                    if (strWellList != "")
                    {
                        wellListArr = strWellList.Split(',');
                    }



                    ProcessAdvKPI objProcessAdvKPI = new ProcessAdvKPI();
                    objProcessAdvKPI.WellList = wellListArr;
                    if (objDataFilter != null)
                    {
                        if(objDataFilter.FilterData)
                        {
                            objProcessAdvKPI.objProcessor.FilterData = objDataFilter.FilterData;
                            objProcessAdvKPI.objProcessor.FilterMainWellID = objDataFilter.FilterMainWellID;
                            objProcessAdvKPI.objProcessor.FilterType = (VuMaxDR.AdvKPI.KPIProcessor.kpiFilterType)objDataFilter.FilterType;
                            objProcessAdvKPI.objProcessor.Filter_FromDate = objDataFilter.Filter_FromDate;
                            objProcessAdvKPI.objProcessor.Filter_ToDate = objDataFilter.Filter_ToDate;
                            objProcessAdvKPI.objProcessor.Filter_FromDepth = objDataFilter.Filter_FromDepth;
                            objProcessAdvKPI.objProcessor.Filter_ToDepth = objDataFilter.Filter_ToDepth;
                            objProcessAdvKPI.objProcessor.Filter_LastHours = objDataFilter.Filter_LastHours;


                        }
                    }
                    objResponse = objProcessAdvKPI.processKPI(ref paramRequest.objDataService, ProfileID);
                    return objResponse;

                }

                return objResponse;
            }
            catch (Exception ex)
            {

                eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

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

                eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }
        }
    }
}
