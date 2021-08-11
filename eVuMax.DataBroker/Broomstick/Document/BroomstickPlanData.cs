using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Broomstick.Document
{
    public class BroomstickPlanData
    {

        public string PlanID { get; set; } = "";
        public string PlanType { get; set; } = "";
        public string PlanName { get; set; } = "";
        public string PlanColor { get; set; } = "";
        public List<PlanDataPoint> PlanData { get; set; } = new List<PlanDataPoint>();

    }
}
