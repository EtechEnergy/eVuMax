using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
//using eVuMax.DataBroker.Data;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.Broker
{
    public class BrokerRequest
    {

        public string RequestId { get; set; } = "";
        public string Module { get; set; } = ""; //Common
        public string Broker { get; set; } = ""; //Authentication
        public string Category { get; set; } = ""; //Blank
        public string Function { get; set; } = ""; //ValidateUser
        public List<Broker.BrokerParameter> Parameters { get; set; } = new List<BrokerParameter>();
        public DateTime RequestDateTime { get; set; } = DateTime.Now;

        public DataService objDataService;

        public Broker.BrokerResponse createResponseObject()
        {
            try
            {
                BrokerResponse objResponse = new BrokerResponse();
                objResponse.RequestId = this.RequestId;
                objResponse.Module = this.Module;
                objResponse.Broker = this.Broker;
                objResponse.Category = this.Category;
                objResponse.ResponseTime = DateTime.Now;

                return objResponse;

            }
            catch (Exception ex)
            {

                return new BrokerResponse();
            }
        }

    }
}
