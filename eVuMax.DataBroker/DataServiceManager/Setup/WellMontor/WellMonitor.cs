using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using VuMaxDR.Data;

namespace eVuMax.DataBroker.DataServiceManager
{
   public class WellMonitor
    {

        public double GreenThresholdFrom = 0d;
        public double GreenThresholdTo = 30d;
        public double YellowThresholdFrom = 31d;
        public double YellowThresholdTo = 59d;
        public double RedThresholdFrom = 59d;
        public double RedThresholdTo = 0d;
        public double FlagBGColor = 0d;
        //public string FlagBGColor = "";

        public string LastError = "";

        DataService objDataService;

        public WellMonitor(ref DataService objDataService)
        {
            this.objDataService = objDataService;
        }

      

        public bool saveSetup(ref DataService objDataService)
        {
            try
            {

                if (!objDataService.IsRecordExist("SELECT * FROM VMX_WELL_MONITOR_SETUP"))
                {
                    objDataService.executeNonQuery("INSERT INTO VMX_WELL_MONITOR_SETUP (GREEN_THRESHOLD_FROM,GREEN_THRESHOLD_TO,YELLOW_THRESHOLD_FROM,YELLOW_THRESHOLD_TO,RED_THRESHOLD_FROM,RED_THRESHOLD_TO,FLAG_BG_COLOR) VALUES(0,0,0,0,0,0,0)");
                }

                string strSQL = "";

                strSQL = "UPDATE VMX_WELL_MONITOR_SETUP SET ";
                strSQL += " GREEN_THRESHOLD_FROM=" + GreenThresholdFrom.ToString() + ",";
                strSQL += " GREEN_THRESHOLD_TO=" + GreenThresholdTo.ToString() + ",";
                strSQL += " YELLOW_THRESHOLD_FROM=" + YellowThresholdFrom.ToString() + ",";
                strSQL += " YELLOW_THRESHOLD_TO=" + YellowThresholdTo.ToString() + ",";
                strSQL += " RED_THRESHOLD_FROM=" + RedThresholdFrom.ToString() + ",";
                strSQL += " RED_THRESHOLD_TO=" + RedThresholdTo.ToString() + ",";
                strSQL += " FLAG_BG_COLOR=" + FlagBGColor.ToString() + " ";

                if (objDataService.executeNonQuery(strSQL))
                {
                    return true;
                }
                else
                {
                    LastError = objDataService.LastError;
                    return false;
                }
            }

            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }


        public bool loadSetup()
        {
            try
            {

                DataTable objData = objDataService.getTable("SELECT * FROM VMX_WELL_MONITOR_SETUP ");

                if (objData.Rows.Count > 0)
                {
                    DataRow objRow = objData.Rows[0];

                    GreenThresholdFrom = Convert.ToDouble(DataService.checkNull(objRow["GREEN_THRESHOLD_FROM"], 0));
                    GreenThresholdTo = Convert.ToDouble(DataService.checkNull(objRow["GREEN_THRESHOLD_TO"], 0));

                    YellowThresholdFrom = Convert.ToDouble(DataService.checkNull(objRow["YELLOW_THRESHOLD_FROM"], 0));
                    YellowThresholdTo = Convert.ToDouble(DataService.checkNull(objRow["YELLOW_THRESHOLD_TO"], 0));

                    RedThresholdFrom = Convert.ToDouble(DataService.checkNull(objRow["RED_THRESHOLD_FROM"], 0));
                    RedThresholdTo = Convert.ToDouble(DataService.checkNull(objRow["RED_THRESHOLD_TO"], 0));
                    FlagBGColor = Convert.ToDouble(DataService.checkNull(objRow["FLAG_BG_COLOR"], 0));
                    //   FlagBGColor = Convert.ToDouble(DataService.checkNull(objRow["FLAG_BG_COLOR"], 0));



                    //FlagBGColor = ColorTranslator.ToHtml(Color.FromArgb((int)objRow["FLAG_BG_COLOR"]));
                    //FlagBGColor = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(objRow["FLAG_BG_COLOR"])));



                }

                else
                {
                    return false;
                }
            }

            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }

            return default;
        }



    }



}
