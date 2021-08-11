using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;

namespace eVuMax.DataBroker.Summary.DrlgConn
{
    public class DrlgConnData
    {

        public string WellName { get; set; } = "";
        public DataTable connData { get; set; } = new DataTable();
        public double avgTime { get; set; } = 0;
        public double avgBTS { get; set; } = 0;
        public double avgSTS { get; set; } = 0;
        public double avgSTB { get; set; } = 0;
        public double avgTimeD { get; set; } = 0;
        public double avgBTSD { get; set; } = 0;
        public double avgSTSD { get; set; } = 0;
        public double avgSTBD { get; set; } = 0;
        public double avgTimeN { get; set; } = 0;
        public double avgBTSN { get; set; } = 0;
        public double avgSTSN { get; set; } = 0;
        public double avgSTBN { get; set; } = 0;
        public double PositiveCashFlow { get; set; } = 0;
        public double NegativeCashFlow { get; set; } = 0;
        public double NetCashFlow { get; set; } = 0;
        public double PositiveSTSCashFlow { get; set; } = 0;
        public double NegativeSTSCashFlow { get; set; } = 0;
        public double NetSTSCashFlow { get; set; } = 0;
        public DataTable rigStateData { get; set; } = new DataTable();
        public DataTable rigStates { get; set; } = new DataTable();
        public double BenchMark { get; set; } = 0;
        public double ConnCount { get; set; } = 0;
        public double ExcludedConns { get; set; } = 0;
        public string userSettings { get; set; } = "";
        public DataTable histogramData { get; set; } = new DataTable();



    }
}
