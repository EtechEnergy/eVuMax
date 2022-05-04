using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;


namespace eVuMax.DataBroker.DataServiceManager 
{
    public class AlertSettings
    {
        public bool CheckNewObjects = false;
        public int NewObjCheckFreq = 0;
        public string NewObjEMail = "";
        public bool CheckWITSMLOutage = false;
        public int ServerTimeOut = 0;
        public string WITSMLEMail = "";
        public int RepeatFrequency = 0;
        public bool CheckDownloads = false;
        public string DownloadAlertEMail = "";
        public int DownloadCheckFrequency = 0;

        [NonSerialized]
        DataService objDataService;
        [NonSerialized]
        public string LastError = "";

       public AlertSettings(ref DataService objDataService)
        {
            this.objDataService = objDataService;
        }


        public AlertSettings()
        {
            
        }

        public object getCopy()
        {
            try
            {
                AlertSettings objNew = new AlertSettings();
                objNew.CheckNewObjects = CheckNewObjects;
                objNew.NewObjCheckFreq = NewObjCheckFreq;
                objNew.NewObjEMail = NewObjEMail;
                objNew.CheckWITSMLOutage = CheckWITSMLOutage;
                objNew.ServerTimeOut = ServerTimeOut;
                objNew.WITSMLEMail = WITSMLEMail;
                objNew.RepeatFrequency = RepeatFrequency;
                objNew.CheckDownloads = CheckDownloads;
                objNew.DownloadAlertEMail = DownloadAlertEMail;
                objNew.DownloadCheckFrequency = DownloadCheckFrequency;
                return objNew;
            }

            catch (Exception ex)
            {
                return new AlertSettings();
            }
        }

        public bool saveSettings(AlertSettings objAlartSettings,ref DataService objDataService)
        {
            try
            {

                string strSQL = "";

                if (!objDataService.IsRecordExist("SELECT CHECK_NEW_OBJ FROM VMX_ALERT_SETTINGS"))
                {
                    strSQL = "INSERT INTO VMX_ALERT_SETTINGS (CHECK_NEW_OBJ,NEW_OBJ_FREQ,NEW_OBJ_EMAIL_TO,CHECK_WITSML_SERVER,SERVER_TIME_OUT,WITSML_ALERT_EMAIL,REPEAT_FREQ,CHECK_DOWNLOADS,DL_ALERT_EMAIL,DL_CHECK_FREQ) VALUES(";
                    strSQL += "" + (objAlartSettings.CheckNewObjects ? 1 : 0).ToString() + ",";
                    strSQL += "" + objAlartSettings.NewObjCheckFreq.ToString() + ",";
                    strSQL += "'" + objAlartSettings.NewObjEMail.Replace("'", "''") + "',";
                    strSQL += "" + (objAlartSettings.CheckWITSMLOutage ? 1 : 0).ToString() + ",";
                    strSQL += "" + objAlartSettings.ServerTimeOut.ToString() + ",";
                    strSQL += "'" + objAlartSettings.WITSMLEMail.Replace("'", "''") + "',";
                    strSQL += "" + objAlartSettings.RepeatFrequency.ToString() + ",";
                    strSQL += "" + (objAlartSettings.CheckDownloads ? 1 : 0).ToString() + ",";
                    strSQL += "'" + objAlartSettings.DownloadAlertEMail.Replace("'", "''") + "',";
                    strSQL += "" + objAlartSettings.DownloadCheckFrequency.ToString() + ")";

                    objDataService.executeNonQuery(strSQL);
                    return true;
                }

                else
                {

                    strSQL = "UPDATE VMX_ALERT_SETTINGS SET ";
                    strSQL += " CHECK_NEW_OBJ=" + (objAlartSettings.CheckNewObjects ? 1 : 0).ToString() + ",";
                    strSQL += " NEW_OBJ_FREQ=" + objAlartSettings.NewObjCheckFreq.ToString() + ",";
                    strSQL += " NEW_OBJ_EMAIL_TO='" + objAlartSettings.NewObjEMail.Replace("'", "''") + "',";
                    strSQL += " CHECK_WITSML_SERVER=" + (objAlartSettings.CheckWITSMLOutage ? 1 : 0).ToString() + ",";
                    strSQL += " SERVER_TIME_OUT=" + objAlartSettings.ServerTimeOut.ToString() + ",";
                    strSQL += " WITSML_ALERT_EMAIL='" + objAlartSettings.WITSMLEMail.Replace("'", "''") + "',";
                    strSQL += " REPEAT_FREQ=" + objAlartSettings.RepeatFrequency.ToString() + ",";
                    strSQL += " CHECK_DOWNLOADS=" + (objAlartSettings.CheckDownloads ? 1 : 0).ToString() + ",";
                    strSQL += " DL_ALERT_EMAIL='" + objAlartSettings.DownloadAlertEMail.Replace("'", "''") + "',";
                    strSQL += " DL_CHECK_FREQ=" + objAlartSettings.DownloadCheckFrequency.ToString() + " ";

                    objDataService.executeNonQuery(strSQL);
                    return true;
                }
            }

            
            catch (Exception ex)
            {
                this.LastError = ex.StackTrace + ex.Message + ex.StackTrace;
                return false;
            }
        }




        public AlertSettings loadSettings()
        {
            try
            {
                DataTable objData = objDataService.getTable("SELECT * FROM VMX_ALERT_SETTINGS");

                if (objData.Rows.Count > 0)
                {
                    DataRow objRow = objData.Rows[0];

                    CheckNewObjects = Convert.ToBoolean((Convert.ToInt32(DataService.checkNull(objRow["CHECK_NEW_OBJ"], 0)) == 1 ? true : false));
                    NewObjCheckFreq = Convert.ToInt32(DataService.checkNull(objRow["NEW_OBJ_FREQ"], 0));
                    NewObjEMail = DataService.checkNull(objRow["NEW_OBJ_EMAIL_TO"], "").ToString();
                    CheckWITSMLOutage = Convert.ToBoolean((Convert.ToInt32(DataService.checkNull(objRow["CHECK_WITSML_SERVER"], 0)) == 1 ? true : false));
                    ServerTimeOut = Convert.ToInt32(DataService.checkNull(objRow["SERVER_TIME_OUT"], 0));
                    WITSMLEMail = DataService.checkNull(objRow["WITSML_ALERT_EMAIL"], "").ToString();
                    RepeatFrequency = Convert.ToInt32(DataService.checkNull(objRow["REPEAT_FREQ"], 0));
                    CheckDownloads = Convert.ToBoolean((Convert.ToInt32(DataService.checkNull(objRow["CHECK_DOWNLOADS"], 0)) == 1 ? true : false));
                    DownloadAlertEMail = DataService.checkNull(objRow["DL_ALERT_EMAIL"], "").ToString();
                    DownloadCheckFrequency = Convert.ToInt32(DataService.checkNull(objRow["DL_CHECK_FREQ"], 0));

                    if (ServerTimeOut == 0)
                    {
                        ServerTimeOut = 1;
                    }

                    if (RepeatFrequency <= 5)
                    {
                        RepeatFrequency = 5;
                    }

                    if (DownloadCheckFrequency <= 0)
                    {
                        DownloadCheckFrequency = 5;
                    }

                }
                return this;
            }


            catch (Exception ex)
            {
                this.LastError = ex.StackTrace + ex.Message + ex.StackTrace;
                return new AlertSettings();
            }
        }

        //public DataTable loadSettings()
        //{
        //    try
        //    {
        //        DataTable objData = objDataService.getTable("SELECT * FROM VMX_ALERT_SETTINGS");

        //        if (objData.Rows.Count > 0)
        //        {
        //            DataRow objRow = objData.Rows[0];

        //            CheckNewObjects = Convert.ToBoolean((Convert.ToInt32(DataService.checkNull(objRow["CHECK_NEW_OBJ"], 0)) == 1 ? true : false));
        //            NewObjCheckFreq = Convert.ToInt32(DataService.checkNull(objRow["NEW_OBJ_FREQ"], 0));
        //            NewObjEMail = DataService.checkNull(objRow["NEW_OBJ_EMAIL_TO"], "").ToString();
        //            CheckWITSMLOutage = Convert.ToBoolean((Convert.ToInt32(DataService.checkNull(objRow["CHECK_WITSML_SERVER"], 0)) == 1 ? true : false));
        //            ServerTimeOut = Convert.ToInt32(DataService.checkNull(objRow["SERVER_TIME_OUT"], 0));
        //            WITSMLEMail = DataService.checkNull(objRow["WITSML_ALERT_EMAIL"], "").ToString();
        //            RepeatFrequency = Convert.ToInt32(DataService.checkNull(objRow["REPEAT_FREQ"], 0));
        //            CheckDownloads = Convert.ToBoolean((Convert.ToInt32( DataService.checkNull(objRow["CHECK_DOWNLOADS"], 0)) == 1 ? true : false));
        //            DownloadAlertEMail = DataService.checkNull(objRow["DL_ALERT_EMAIL"], "").ToString();
        //            DownloadCheckFrequency = Convert.ToInt32(DataService.checkNull(objRow["DL_CHECK_FREQ"], 0));

        //            if (ServerTimeOut == 0)
        //            {
        //                ServerTimeOut = 1;
        //            }

        //            if (RepeatFrequency <= 5)
        //            {
        //                RepeatFrequency = 5;
        //            }

        //            if (DownloadCheckFrequency <= 0)
        //            {
        //                DownloadCheckFrequency = 5;
        //            }

        //        }
        //        return objData;
        //    }


        //    catch (Exception ex)
        //    {
        //        this.LastError = ex.StackTrace + ex.Message + ex.StackTrace;
        //        return new DataTable();
        //    }
        //}


    }
}
