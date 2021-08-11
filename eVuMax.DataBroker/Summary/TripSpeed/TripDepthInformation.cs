using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.TripSpeed
{
   public class TripDepthInformation
    {
        public double PhaseIndex = 0;
        public double TripSpeedWithoutConnections = 0;
        public double TripSpeedWithConnections = 0;
        public string TimeLogName = "";
        public Dictionary<int, TripDepthRange> DepthRanges = new Dictionary<int, TripDepthRange>();
        public string TripDirection = "";
        public double TripDepthFrom = 0;
        public double TripDepthTo = 0;

        public TripDepthInformation getCopy()
        {
            try
            {
                TripDepthInformation objNew = new TripDepthInformation();
                objNew.PhaseIndex = this.PhaseIndex;
                objNew.TripSpeedWithConnections = this.TripSpeedWithConnections;
                objNew.TripSpeedWithoutConnections = this.TripSpeedWithoutConnections;
                objNew.TimeLogName = this.TimeLogName;
                objNew.TripDirection = this.TripDirection;
                objNew.TripDepthFrom = this.TripDepthFrom;
                objNew.TripDepthTo = this.TripDepthTo;

                foreach (int lnKey in DepthRanges.Keys)

                    objNew.DepthRanges.Add(lnKey, DepthRanges[lnKey].getCopy());

                return objNew;
            }
            catch (Exception ex)
            {
                return new TripDepthInformation();
            }
        }
    }
}
