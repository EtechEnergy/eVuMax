using System;
using System.Data;
using System.Drawing;
using System.Linq;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.Summary.DrlgStand
{
    
    public class ConFontSetup
    {
        public string FontName = "";
        public int FontSize = 10;
        public Color FontColor = Color.Red;
        public bool Bold = false;
        public bool Italic = false;
        public bool Underlined = false;

        public DataBroker.Broker.BrokerRequest objRequest = new Broker.BrokerRequest(); //Nishant 

        public ConFontSetup(ref DataBroker.Broker.BrokerRequest paramRequest)
        {
            objRequest = paramRequest;
        }
        public ConFontSetup()
        {
            
        }
        public void loadSetup()
        {
            try
            {
                string strSQL = "";
                DataTable objData = objRequest.objDataService.getTable("SELECT * FROM VMX_PLOT_FONT_SETTINGS WHERE USER_NAME='" + objRequest.objDataService.UserName + "'");
                if (objData.Rows.Count == 0)
                {
                    FontName = "Arial";
                    FontSize = 10;
                    FontColor = Color.Black;
                    Bold = false;
                    Italic = false;
                    Underlined = false;
                    strSQL = "INSERT INTO VMX_PLOT_FONT_SETTINGS (USER_NAME,FONT_NAME,FONT_SIZE,FONT_COLOR,BOLD,ITALIC,UNDERLINED,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
                    strSQL += "'" + objRequest.objDataService.UserName + "',";
                    strSQL += "'" + FontName.Replace("'", "''") + "',";
                    strSQL += "" + FontSize.ToString() + ",";
                    strSQL += "" + FontColor.ToArgb().ToString() + ",";
                    strSQL += "" + Global.Iif(Bold, 1, 0).ToString() + ",";
                    strSQL += "" + Global.Iif(Italic, 1, 0).ToString() + ",";
                    strSQL += "" + Global.Iif(Underlined, 1, 0).ToString() + ",";
                    strSQL += "'" + objRequest.objDataService.UserName.Replace("'", "''") + "',";
                    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                    strSQL += "'" + objRequest.objDataService.UserName.Replace("'", "''") + "',";
                    strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
                    objRequest. objDataService.executeNonQuery(strSQL);
                }

                objData = objRequest.objDataService.getTable("SELECT * FROM VMX_PLOT_FONT_SETTINGS WHERE USER_NAME='" + objRequest. objDataService.UserName + "'");
                if (objData.Rows.Count > 0)
                {
                    DataRow objRow = objData.Rows[0];
                    FontName = Convert.ToString(DataService.checkNull(objRow["FONT_NAME"], ""));
                    FontSize = Convert.ToInt32( DataService.checkNull(objRow["FONT_SIZE"], 8));
                    FontColor = Color.FromArgb(Convert.ToInt32(DataService.checkNull(objRow["FONT_COLOR"], Color.Black.ToArgb())));
                    
                    Bold = Convert.ToBoolean(Global.Iif(Convert.ToInt32( DataService.checkNull(objRow["BOLD"], 0)) == 1, true, false));
                    Italic = Convert.ToBoolean(Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["ITALIC"], 0)) == 1, true, false));
                    Underlined = Convert.ToBoolean(Global.Iif(Convert.ToInt32(DataService.checkNull(objRow["UNDERLINED"], 0)) == 1, true, false));
                }
            }
            catch (Exception ex)
            {
            }
        }

        public void saveSetup()
        {
            try
            {
                string strSQL = "'";
                strSQL = "UPDATE VMX_PLOT_FONT_SETTINGS SET ";
                strSQL += " FONT_NAME='" + FontName.Replace("'", "''") + "',";
                strSQL += " FONT_SIZE=" + FontSize.ToString() + ",";
                strSQL += " FONT_COLOR=" + FontColor.ToArgb().ToString() + ",";
                strSQL += " BOLD=" + Global.Iif(Bold, 1, 0).ToString() + ",";
                strSQL += " ITALIC=" + Global.Iif(Italic, 1, 0).ToString() + ",";
                strSQL += " UNDERLINED=" + Global.Iif(Underlined, 1, 0).ToString() + ",";
                strSQL += " MODIFIED_BY='" + objRequest.objDataService.UserName.Replace("'", "'") + "',";
                strSQL += " MODIFIED_DATE='" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                strSQL += " WHERE USER_NAME='" + objRequest.objDataService.UserName + "' ";
               objRequest.objDataService.executeNonQuery(strSQL);
            }
            catch (Exception ex)
            {
            }
        }
    }
}
