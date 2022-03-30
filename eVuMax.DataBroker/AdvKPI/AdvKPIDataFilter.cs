using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.AdvKPI
{

   public enum kpiFilterType
    {
        AllData = 0,
        LastHours = 1,
        DateRange = 2,
        DateOnwards = 3,
        DepthRange = 4,
        DepthOnwards = 5,
        CurrentSection = 6
    }
    public class AdvKPIDataFilter
    {
        public  bool FilterData  = false;
        public string FilterMainWellID  = "";
        public kpiFilterType FilterType  = kpiFilterType.LastHours;
        public DateTime Filter_FromDate  = new DateTime();
        public DateTime Filter_ToDate  = new DateTime();
        public int Filter_FromDepth = 0;
        public int Filter_ToDepth= 0;
        public int Filter_LastHours  =24;
    }
}
