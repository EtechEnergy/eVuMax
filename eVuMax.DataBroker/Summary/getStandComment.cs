using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.Summary
{
   
   
    
    public class getStandComment
    {


        public static string getStandComments(string WellID, ref DataService objDataService, double paramDepth)
        {
            try
            {
                int roundedDepth = (int)Math.Floor(paramDepth);

                DataTable objData = objDataService.getTable("SELECT COMMENT FROM VMX_STAND_ANNOTATIONS WHERE WELL_ID='" + WellID + "' AND DEPTH=" + roundedDepth.ToString());

                if (objData.Rows.Count > 0)
                {
                    string comment = DataService.checkNull(objData.Rows[0]["COMMENT"], "").ToString();
                    return comment;
                }
                else
                    return "";
            }
            catch (Exception ex)
            {
                return "";
            }
        }
    }
}
