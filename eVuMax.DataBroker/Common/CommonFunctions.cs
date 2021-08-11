using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace eVuMax.DataBroker.Common
{
    public class CommonFunctions
    {
        const string _getTable = "getTable";
        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Function == _getTable)
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = getTable(paramRequest);

                    return objResponse;
                }



                //No matching function found ...
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Invalid Request Function. Use proper function name in the Broker Request";
                return objBadResponse;

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }

        private Broker.BrokerResponse getTable(Broker.BrokerRequest paramRequest)
        {
            try
            {

                string SQLstr = paramRequest.Parameters.Where(x => x.ParamName.Contains("SQL")).FirstOrDefault().ParamValue;
                //No matching function found ...
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                if (SQLstr != string.Empty)
                {

                    DataTable objData = new DataTable();
                    objData = paramRequest.objDataService.getTable(SQLstr);

                    if (objData != null)
                    {
                        objResponse.Response = JsonConvert.SerializeObject(objData);
                        objResponse.RequestSuccessfull = true;
                        return objResponse;
                    }
                }

                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Invalid Request Function. Use proper function name in the Broker Request";
                return objResponse;

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in getTable " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }
    }
}




