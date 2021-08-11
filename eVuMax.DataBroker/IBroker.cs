using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker
{
    public interface IBroker
    {
        
        Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest);

        Broker.BrokerResponse performTask(Broker.BrokerRequest paramRequest);
    }
}
