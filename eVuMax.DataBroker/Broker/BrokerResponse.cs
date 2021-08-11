using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Broker
{
    public class BrokerResponse
    {

        public string RequestId { get; set; } = "";
        public string Module { get; set; } = "";
        public string Broker { get; set; } = "";
        public string Category { get; set; } = "";
        public string Response { get; set; } = "";
        public bool RequestSuccessfull { get; set; } = true;
        public string Errors { get; set; } = "";
        public DateTime ResponseTime { get; set; } = DateTime.Now;


    }
}
