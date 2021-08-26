using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Broomstick.Document
{
    public class BroomstickData
    {

        public string WellName { get; set; } = "";
        public string depthUnit { get; set; } = "";
        public string hkldUnit { get; set; } = "";
        public string torqueUnit { get; set; } = "";
        public string RunNo { get; set; } = "";

        public List<BroomstickPlanData> HkldPlanData { get; set; } = new List<BroomstickPlanData>();

        public List<BroomstickDataPoint> PickupPoints { get; set; } = new List<BroomstickDataPoint>();
        public List<BroomstickDataPoint> SlackOffPoints { get; set; } = new List<BroomstickDataPoint>();
        public List<BroomstickDataPoint> RotatePoints { get; set; } = new List<BroomstickDataPoint>();

        public List<BroomstickPlanData> TorquePlanData { get; set; } = new List<BroomstickPlanData>();
        public List<BroomstickDataPoint> OnBottomTorquePoints { get; set; } = new List<BroomstickDataPoint>();
        public List<BroomstickDataPoint> OffBottomTorquePoints { get; set; } = new List<BroomstickDataPoint>();

        public List<String> RunList { get; set; } = new List<string>();

    }

}
