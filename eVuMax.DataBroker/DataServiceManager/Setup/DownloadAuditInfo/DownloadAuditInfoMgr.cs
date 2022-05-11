using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DataServiceManager
{
  

    public class DownloadAuditInfoMgr : IBroker
    {
        const string loadData = "loadData";

        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();

            if (paramRequest.Function == loadData)
            {
                string searchCondition = paramRequest.Parameters.Where(x => x.ParamName.Contains("SearchCondition")).FirstOrDefault().ParamValue;

                string strSQL;
                string RefWellID = "All";
                strSQL = "SELECT CHANGE_DATE,OBJECT_TYPE,OBJECT_ID,FUNCTION_TYPE,CHANGE_INFORMATION,CHANGE_BY FROM VMX_DATA_AUDIT WHERE WELL_ID='" + RefWellID + "' ";
                if (searchCondition != "")
                {
                    strSQL = strSQL + searchCondition;
                }

                strSQL = strSQL + " ORDER BY CHANGE_DATE DESC";

                DataTable objData = paramRequest.objDataService.getTable(strSQL);



                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objData);
                return objResponse;
            }
            throw new NotImplementedException();
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            throw new NotImplementedException();
        }
    }
}
