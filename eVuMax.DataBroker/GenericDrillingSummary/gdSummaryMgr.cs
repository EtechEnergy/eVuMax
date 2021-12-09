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



                    string selectionType = paramRequest.Parameters.Where(x => x.ParamName.Contains("SelectionType")).FirstOrDefault().ParamValue.ToString();
                    double fromDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDepth")).FirstOrDefault().ParamValue.ToString());
                    double toDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDepth")).FirstOrDefault().ParamValue.ToString());
                    string SideTrackKey = "-999";


                    DateTime fromDate = DateTime.Now;
                    DateTime toDate = DateTime.Now;

                    try
                    {
                        fromDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDate")).FirstOrDefault().ParamValue.ToString());
                        toDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDate")).FirstOrDefault().ParamValue.ToString());


                        //Convert date to UTC
                        fromDate = fromDate.ToUniversalTime();
                        toDate = toDate.ToUniversalTime();
                    }
                    catch (Exception)
                    {


                    }

                    bool isRealTime = false;
                    int refreshHrs = 24;
                    isRealTime = Convert.ToBoolean(paramRequest.Parameters.Where(x => x.ParamName.Contains("isRealTime")).FirstOrDefault().ParamValue);
                    refreshHrs = Convert.ToInt32(paramRequest.Parameters.Where(x => x.ParamName.Contains("refreshHrs")).FirstOrDefault().ParamValue);

                    if (isRealTime)
                    {
                        selectionType = "2";
                    }
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

                    //update DataSelector with Client values
                    ////React Side selectedval: string = "-1";//"-1 Default, 0= DateRange and 1 = Depth Range"
                    ///
                    objSummary.objDataSelection.sideTrackKey = SideTrackKey;
                    switch (selectionType)
                    {
                        case "-1":
                            objSummary.objDataSelection.selectionType = DataSelection.sPlotSelectionType.ByHours;
                            objSummary.objDataSelection.LastHours = refreshHrs;
                            break;
                        case "2":
                            objSummary.objDataSelection.selectionType = DataSelection.sPlotSelectionType.ByHours;
                            objSummary.objDataSelection.LastHours = refreshHrs;
                            break;
                        case "0":
                            objSummary.objDataSelection.selectionType = DataSelection.sPlotSelectionType.DateRange;
                            objSummary.objDataSelection.FromDate = fromDate;
                            objSummary.objDataSelection.ToDate= toDate;
                            break;
                        case "1":
                            objSummary.objDataSelection.selectionType = DataSelection.sPlotSelectionType.DepthRange;
                            objSummary.objDataSelection.FromDepth = fromDepth;
                            objSummary.objDataSelection.ToDepth = toDepth;
                            break;
                    }
                  

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
