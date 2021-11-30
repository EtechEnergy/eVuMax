using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.GenericDrillingSummary
{
    public class splitRange
    {
        public double fromValue = 0;
        public double toValue = 0;

        public splitRange()
        {
        }

        public splitRange(double paramFromValue, double paramToValue)
        {
            try
            {
                fromValue = paramFromValue;
                toValue = paramToValue;
            }
            catch (Exception ex)
            {
            }
        }
        public splitRange getCopy()
        {
            try
            {
                splitRange objNew = new splitRange();
                objNew.fromValue = this.fromValue;
                objNew.toValue = this.toValue;

                return objNew;
            }
            catch (Exception ex)
            {
                return new splitRange();
            }
        }
    }


}
