using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.ROPSummary
{
   public class ROPSummarySettings
    {


        public const string SettingsId = "ROPSummary";

        public int NoOfDataPoints { get; set; } = 6;
       public double AvgPoints { get; set; } = 0;
        public bool ROP_ShowOffset { get; set; } = true;
        public bool MatchDepthByFormationTops { get; set; } = false;
    }
}
