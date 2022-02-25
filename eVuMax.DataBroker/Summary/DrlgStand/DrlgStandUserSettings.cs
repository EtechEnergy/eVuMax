using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.DrlgStand
{
    //"-1 Default, 0= DateRange and 1 = Depth Range" 2 = Realtime"
    public enum eNumSelectionType
    {
        DefaultByHrs = -1,
        ByHrs = 1,
        DateRange = 0,
        DepthRange = 3
    }
    public enum sPlotSelectionType
    {
        ByHours = 0,
        DateRange = 1,
        FromDateOnwards = 2,
        DepthRange = 3,
        FromDepthOnwards = 4,
        FormationTops = 5
    }
    public class DrlgStandUserSettings
    {
        public string UserID = "";
        public string WellID = "";
        public bool HighlightDayNight = false;
        public DateTime dtDayTimeFrom = new DateTime();
        public DateTime dtDayTimeTo = new DateTime();
        public bool RealTime = false;
        public int LastHrs = 24;
        public bool ShowExcludedStands = false;
        public bool ShowRigStateView = false;
        public bool ShowComments = false;
        public sPlotSelectionType SelectionType = sPlotSelectionType.ByHours;
        public DateTime FromDate = new DateTime();
        public DateTime ToDate = new DateTime();
        public double FromDepth = 0;
        public double ToDepth = 0;

        public bool StandPlot_ShowOffset = false; //Prath 19-Feb-2022
        public double StandPlot_ComparisonWindow = 50; //Prath 19-Feb-2022


        
        //public string dtDayTimeFrom = "6:00";
        //public string dtDayTimeTo = "18:00";
        //public eNumSelectionType SelectionType = eNumSelectionType.DefaultByHrs;





    }
}
