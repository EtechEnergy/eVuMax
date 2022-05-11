using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Snapshots;

namespace eVuMax.DataBroker.DataServiceManager
{
    public class EmailSettingsMgr : IBroker
    {
        const string loadEmailSettings = "loadEmailSettings";
        const string saveEmailSettings = "saveEmailSettings";
        

        public BrokerResponse getData(BrokerRequest paramRequest)
        {

            BrokerResponse objResponse = paramRequest.createResponseObject();
            if (paramRequest.Function == loadEmailSettings)
            {
               
                SnapshotSettings objSnapshotSettings = new SnapshotSettings();
                objSnapshotSettings.loadSettings(ref paramRequest.objDataService);

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objSnapshotSettings);
                return objResponse;

            }


            throw new NotImplementedException();
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();

            if (paramRequest.Function == saveEmailSettings)
            {

                string strSnapshotSettings = paramRequest.Parameters.Where(x => x.ParamName.Contains("objSettings")).FirstOrDefault().ParamValue;

                SnapshotSettings objSnapshotSettings = JsonConvert.DeserializeObject<SnapshotSettings>(strSnapshotSettings);
                ;


                if (objSnapshotSettings.saveSettings(ref paramRequest.objDataService))
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
                    objBadResponse.Errors = "Error saving email settings " + objSnapshotSettings.LastError;
                    return objBadResponse;

                }



            }

            throw new NotImplementedException();
        }
    }
}
