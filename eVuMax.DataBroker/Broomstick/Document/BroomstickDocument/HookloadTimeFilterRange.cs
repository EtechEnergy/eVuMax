using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Broomstick.Document.BroomstickDocument
{
    public class HookloadTimeFilterRange
    {
        public string RangeID = "";
        public string FromDate = "";
        public string ToDate = "";
        public int Color = 0;

        public HookloadTimeFilterRange getCopy()
        {
            try
            {
                var objNew = new HookloadTimeFilterRange();
                objNew.RangeID = RangeID;
                objNew.FromDate = FromDate;
                objNew.ToDate = ToDate;
                objNew.Color = Color;
                return objNew;
            }
            catch (Exception ex)
            {
                return new HookloadTimeFilterRange();
            }

           
        }


    }//class
}
