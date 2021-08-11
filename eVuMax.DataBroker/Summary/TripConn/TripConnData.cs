using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;

namespace eVuMax.DataBroker.Summary.TripConn
{
    public class TripConnData
    {

        public string WellName { get; set; } = "";
        public DataTable connData { get; set; } = new DataTable();
        public DataTable tripInfoData { get; set; } = new DataTable();
        public double avgTime { get; set; } = 0;
        public double avgTimeD { get; set; } = 0;
        public double avgTimeN { get; set; } = 0;
        public double PositiveCashFlow { get; set; } = 0;
        public double NegativeCashFlow { get; set; } = 0;
        public double NetCashFlow { get; set; } = 0;
        public DataTable rigStateData { get; set; } = new DataTable();
        public DataTable rigStates { get; set; } = new DataTable();
        public double BenchMark { get; set; } = 0;
        public double ConnCount { get; set; } = 0;
        public double ExcludedConns { get; set; } = 0;
        public string userSettings { get; set; } = "";
        public DataTable histogramData { get; set; } = new DataTable();


    }
}
