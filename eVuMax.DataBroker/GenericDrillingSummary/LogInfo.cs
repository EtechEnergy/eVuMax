using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.GenericDrillingSummary
{
    
    public class LogInfo
    {
        public string WellID = "";
        public string WellboreID = "";
        public string LogID = "";

        public LogInfo getCopy()
        {
            try
            {
                LogInfo objNew = new LogInfo();
                objNew.WellID = this.WellID;
                objNew.WellboreID = this.WellboreID;
                objNew.LogID = this.LogID;

                return objNew;
            }
            catch (Exception ex)
            {
                return new LogInfo();
            }
        }
    }

}
