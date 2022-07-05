using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using VuMaxDR.Data.Objects;
using VuMaxDR.Data;
using VuMaxDR.AdvKPI;
using System.Data;

namespace eVuMax.DataBroker.DataServiceManager.KPI
{
    public class PhaseMapping
    {

        public static DataTable getDrillingTags(ref DataService objDataService, string VuMaxType)
        {
            try
            {
                DataTable objData = objDataService.getTable("SELECT A.VUMAX_EVENT_TYPE,A.ENTRY_ID,A.PHASE_ID,A.STEP_ID,A.EMPH_ID,B.PHASE_NAME,C.STEP_NAME,D.EMPH_NAME FROM VMX_AKPI_EVENT_MAPPING A LEFT JOIN VMX_PHASE_MASTER B ON (B.PHASE_ID=A.PHASE_ID) LEFT JOIN VMX_STEP_MASTER C ON (C.PHASE_ID=A.PHASE_ID AND C.STEP_ID=A.STEP_ID) LEFT JOIN VMX_EMPH_MASTER D ON (D.PHASE_ID=A.PHASE_ID AND D.STEP_ID=A.STEP_ID AND D.EMPH_ID=A.EMPH_ID) WHERE A.VUMAX_EVENT_TYPE='" + VuMaxType + "' AND (A.TAG_SOURCE_ID='' OR A.TAG_SOURCE_ID IS NULL)");
                return objData;
            }
            catch (Exception ex)
            {
                return null;
            }

        }

        public static DataTable getCustomDrillingTags(ref DataService objDataService, string VuMaxType)
        {
            try
            {

                string strSQL = "";

                strSQL = " SELECT A.VUMAX_EVENT_TYPE,A.ENTRY_ID,A.PHASE_ID,A.STEP_ID,A.EMPH_ID,B.CATEGORY_NAME AS PHASE_NAME,C.SUB_CATEGORY_NAME AS STEP_NAME,D.ACTIVITY_NAME AS EMPH_NAME";
                strSQL += " FROM ";
                strSQL += " VMX_AKPI_EVENT_MAPPING A  ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_CATEGORY_MASTER B ON (B.SOURCE_ID=A.TAG_SOURCE_ID AND B.TAG_CATEGORY_ID=A.PHASE_ID) ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_SUB_CATEGORY_MASTER C ON (C.SOURCE_ID=A.TAG_SOURCE_ID AND C.TAG_CATEGORY_ID=A.PHASE_ID AND C.TAG_SUB_CATEGORY_ID=A.STEP_ID) ";
                strSQL += " LEFT JOIN VMX_CUSTOM_TAG_ACTIVITY_MASTER D ON (D.SOURCE_ID=A.TAG_SOURCE_ID AND D.TAG_CATEGORY_ID=A.PHASE_ID AND D.TAG_SUB_CATEGORY_ID=A.STEP_ID AND D.TAG_ACTIVITY_ID=A.EMPH_ID) ";
                strSQL += " WHERE A.VUMAX_EVENT_TYPE='" + VuMaxType + "' AND A.TAG_SOURCE_ID<>'' ";

                DataTable objData = objDataService.getTable(strSQL);

                return objData;

            }
            catch (Exception ex)
            {

                return null;
            }
        }
    }
}
