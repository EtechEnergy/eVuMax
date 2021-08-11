using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.ROPSummary
{
   public class DepthMatchingInfo
    {
        public string FormationTop = "";
        public double MainWellDepth = 0;
        public double OffsetDepth = 0;

        public int CompareTo(object obj)
        {
            try
            {
                DepthMatchingInfo objItem = (DepthMatchingInfo)obj;

                if (this.MainWellDepth < objItem.MainWellDepth)
                    return -1;

                if (this.MainWellDepth == objItem.MainWellDepth)
                    return 0;

                if (this.MainWellDepth > objItem.MainWellDepth)
                    return 1;

                return -99;
            }
            catch (Exception ex)
            {
                return -99;
            }
        }
    }
}
