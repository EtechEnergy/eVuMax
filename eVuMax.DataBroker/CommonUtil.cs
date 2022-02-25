using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker
{
    public static class CommonUtil
    {

        public static double convertToDouble(object paramVal)
        {
            try
            {

                double __doubleVal = 0;

                if(paramVal==DBNull.Value)
                {
                    return 0;
                }

                if(double.TryParse(paramVal.ToString(),out __doubleVal))
                {
                    return __doubleVal;
                }
                else
                {
                    return 0;
                }
            }
            catch (Exception)
            {
               return 0;
            }
        }
    }
}
