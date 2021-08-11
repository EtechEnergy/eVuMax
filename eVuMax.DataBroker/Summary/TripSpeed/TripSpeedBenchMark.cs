using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.TripSpeed
{
   public class TripSpeedBenchMark
    {
        public double TripSpeedWOConnection = 0;
        public double TripSpeedWithConnection = 0;
        public string DepthVumaxUnitID = "";
        public Dictionary<double, TripSpeed> speedProfile = new Dictionary<double, TripSpeed>();

    }
}
