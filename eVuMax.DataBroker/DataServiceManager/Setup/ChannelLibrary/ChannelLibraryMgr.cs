using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Data;
using System.Linq;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager 
{
  public  class ChannelLibraryMgr : IBroker
    {
        const string loadData = "loadData";
        const string saveChannel = "saveChannel";
        const string removeChannel_ = "removeChannel";

        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();

            if (paramRequest.Function == loadData)
            {
           
                string strSQL;
                
                strSQL = "SELECT MNEMONIC,DESCRIPTION, UNIT, EXPRESSION FROM VMX_CURVE_LIBRARY ORDER BY MNEMONIC" ;

                DataTable objData = paramRequest.objDataService.getTable(strSQL);



                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objData);
                return objResponse;

            }
            
            throw new NotImplementedException();
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            if (paramRequest.Function == saveChannel)
            {

                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string strCurveLibraryItem = paramRequest.Parameters.Where(x => x.ParamName.Contains("objCurveLibraryItem")).FirstOrDefault().ParamValue;
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                

                CurveLibraryItem objCurveLibraryItem = JsonConvert.DeserializeObject<CurveLibraryItem>(strCurveLibraryItem);
                string EditMode = paramRequest.Parameters.Where(x => x.ParamName.Contains("EditMode")).FirstOrDefault().ParamValue;

                if (EditMode == "A")
                {
                    objResponse = this.addChannel(objCurveLibraryItem, paramRequest);
                    return objResponse;
                }

                if (EditMode == "E")
                {
                    objResponse = this.updateChannel(objCurveLibraryItem, paramRequest);
                    return objResponse;
                }

            }


            if (paramRequest.Function == removeChannel_)
            {
                try
                {
                    this.removeChannel(paramRequest);
                }
                catch (Exception ex)
                {

                    throw;
                }
            }

            throw new NotImplementedException();
        }




        
            public Broker.BrokerResponse addChannel(CurveLibraryItem objCurveLibraryItem, BrokerRequest paramRequest)
        {
            try
            {
                string LastError = "";
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                    

                if (CurveLibrary.addToLibrary(ref paramRequest.objDataService, objCurveLibraryItem, ref LastError))
                {
                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;
                }
                    else
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving Channel" + LastError;
                    return objBadResponse;
                }
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving Channel" + ex.Message + ex.StackTrace;
                return objBadResponse;
                //   return new BrokerResponse();
            }

        }

        public Broker.BrokerResponse updateChannel(CurveLibraryItem objCurveLibraryItem, BrokerRequest paramRequest)
        {
            try
            {
                string LastError = "";
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                if (CurveLibrary.updateToLibrary(ref paramRequest.objDataService, objCurveLibraryItem, ref LastError))
                {
                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;
                }
                else
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving Channel " + LastError;
                    return objBadResponse;
                }
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving Channel " + ex.Message + ex.StackTrace;
                return objBadResponse;

            }

        }
    
    
        public Broker.BrokerResponse removeChannel(BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                string strMnemonic = paramRequest.Parameters.Where(x => x.ParamName.Contains("Mnemonic")).FirstOrDefault().ParamValue;
                objResponse = paramRequest.createResponseObject();



                if (CurveLibrary.removeFromLibrary(ref paramRequest.objDataService, strMnemonic))
                {
                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;
                }
                else
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error removing Channel";  
                    return objBadResponse;
                }

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error removing Channel" + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }
    }
}
