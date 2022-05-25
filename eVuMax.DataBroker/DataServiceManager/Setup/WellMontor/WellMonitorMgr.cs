using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DataServiceManager 
{
    public class WellMonitorMgr : IBroker
    {
        public string loadData = "loadData";
        public string saveData = "saveData";

        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

            if (paramRequest.Function == loadData)
            {
                WellMonitor objWellMonitor = new WellMonitor(ref paramRequest.objDataService);
                objWellMonitor.loadSetup();

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objWellMonitor);
                return objResponse;

            }
            throw new NotImplementedException();
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

            if (paramRequest.Function == saveData)
            {
                WellMonitor objWellMonitor = new WellMonitor(ref paramRequest.objDataService);
                string strFlagBGColor = "";
                string strObjWellMonitor = "";

                strObjWellMonitor = paramRequest.Parameters.Where(x => x.ParamName.Contains("objWellMonitor")).FirstOrDefault().ParamValue.ToString();
                if (strObjWellMonitor != "")
                {
                    objWellMonitor = JsonConvert.DeserializeObject<WellMonitor>(strObjWellMonitor);
                    
                    
                }

                strFlagBGColor = paramRequest.Parameters.Where(x => x.ParamName.Contains("FlagBGColor")).FirstOrDefault().ParamValue.ToString();
                if (strFlagBGColor != "")
                {
                    objWellMonitor.FlagBGColor =ColorTranslator.FromHtml(strFlagBGColor).ToArgb();
                }
                                
                objWellMonitor.saveSetup(ref paramRequest.objDataService);

                objResponse.RequestSuccessfull = true;
                objResponse.Response = "";
                return objResponse;

            }
            throw new NotImplementedException();
        }
    }
}
