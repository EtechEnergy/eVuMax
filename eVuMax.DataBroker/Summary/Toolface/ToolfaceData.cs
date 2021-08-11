using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;

namespace eVuMax.DataBroker.Summary.Toolface
{
    public class ToolfaceData
    {

        public string WellName { get; set; } = "";
        public string userSettings { get; set; } = "";
        public DataTable GTFData { get; set; } = new DataTable();
        public DataTable MTFData { get; set; } = new DataTable();
        public DataTable MYData { get; set; } = new DataTable();
        public DataTable PlanDLS { get; set; } = new DataTable();
        public DataTable ActualDLS { get; set; } = new DataTable();
        public DataTable PlanTVD { get; set; } = new DataTable();
        public DataTable ActualTVD { get; set; } = new DataTable();
        public DataTable SlideTable { get; set; } = new DataTable();
        public DataTable RotarySections { get; set; } = new DataTable();
        public List<adnlChannelData> adnlChannelsData { get; set; } = new List<adnlChannelData>();
        public DataTable formationTops { get; set; } = new DataTable();
        public List<DrillingWindowInfo> drlgWindow = new List<DrillingWindowInfo>();
        public List<DrillingWindowInfo> ropWindow = new List<DrillingWindowInfo>();

        //Statistics
        public double NoOfSlides { get; set; } = 0;
        public double AvgSlideLength { get; set; } = 0;
        public double TotalSlideFootage { get; set; } = 0;
        public double RotaryPercent { get; set; } = 0;
        public double SlidePercent { get; set; } = 0;
        public double RotaryROP { get; set; } = 0;
        public double SlideROP { get; set; } = 0;
        public double OutOfDrlgWindowPercent { get; set; } = 0;
        public double OutOfROPWindowPercent { get; set; } = 0;

    }
}
