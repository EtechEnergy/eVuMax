using eVuMax.DataBroker.Broker;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.DrlgStand
{
    public class DrlgStandPlotBroker : IBroker
    {
        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            if(paramRequest.Broker == Global.DRLG_STAND_PLOT)
            {
                
                DrlgStand.DrlgStandPlotMgr objDrlgStandPlot = new DrlgStandPlotMgr();
                return objDrlgStandPlot.getData(paramRequest);
            }

            Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
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
