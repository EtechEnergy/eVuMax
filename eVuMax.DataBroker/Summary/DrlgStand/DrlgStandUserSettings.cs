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
        public bool HighlightDayNight = false;
        public DateTime dtDayTimeFrom = new DateTime();
        public DateTime dtDayTimeTo = new DateTime();
        //public string dtDayTimeFrom = "6:00";
        //public string dtDayTimeTo = "18:00";
        public bool RealTime = false;
        public int LastHrs = 24;

        public bool ShowExcludedStands = false;
        public bool ShowRigStateView = false;
        //public eNumSelectionType SelectionType = eNumSelectionType.DefaultByHrs;
        public sPlotSelectionType SelectionType = sPlotSelectionType.ByHours;

        public string UserID = "";
        public string WellID = "";

        public DateTime FromDate = new DateTime();
        public DateTime ToDate = new DateTime();
        public double FromDepth = 0;
        public double ToDepth = 0;
        public bool ShowComments = false;
    


        

    }
}
