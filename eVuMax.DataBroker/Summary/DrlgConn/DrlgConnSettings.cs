using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;

namespace eVuMax.DataBroker.Summary.DrlgConn
{
    public class DrlgConnSettings
    {

        public const string SettingsId = "DrlgConnection";

        public bool SkipConnMaxTime { get; set; } = false;
        public double MaxConnTime { get; set; } = 0;
        public bool showExcludedConn { get; set; } = false;
        public bool HighlightDayNight { get; set; } = false;
        public string DayTimeFrom { get; set; } = "06:00";
        public string DayTimeTo { get; set; } = "18:00";
        public double DrlgBenchMark { get; set; } = 0;
        public double BTSBenchMark { get; set; } = 0;
        public double STSBenchMark { get; set; } = 0;
        public double STBBenchMark { get; set; } = 0;
        public double TargetTime { get; set; } = 0;
        public double RigCost { get; set; } = 0;
                                         
    }
}
