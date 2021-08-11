using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.TripConn
{
    public class TripConnSettings
    {
        public const string SettingsId = "TripConnection";

        public bool SkipConnMaxTime { get; set; } = false;
        public double MaxConnTime { get; set; } = 0;
        public bool SkipConnMinTime { get; set; } = false;
        public double MinConnTime { get; set; } = 0;
        public bool showExcludedConn { get; set; } = false;
        public bool HighlightDayNight { get; set; } = false;
        public string DayTimeFrom { get; set; } = "06:00";
        public string DayTimeTo { get; set; } = "18:00";
        public double STSBenchMark { get; set; } = 0;
        public double TargetTime { get; set; } = 0;
        public double RigCost { get; set; } = 0;
        

    }
}
