using System;
using System.Data;
using VuMaxDR.Data;
using eVuMax.DataBroker.Common;

namespace eVuMax.DataBroker.DataServiceManager
{


    public class eMaintainStdChannels
    {


        public string Mnemonic = "";
        public string ChannelName = "";
        public string DataType = "";
        public int LogType = 1;

        //public string EditMode = "A";

        //DataTable QCRulesList = new DataTable();
        DataService objDataService;
        public string LastError = "";

        public eMaintainStdChannels(ref DataService pObjDataService)
        {
            objDataService = pObjDataService;
        }

        public DataTable loadStdChannels()
        {
            try
            {
                                 //SELECT MNEMONIC, CURVE_NAME FROM VMX_CURVE_DICTIONARY                                                                                                                                                         WHERE LOG_TYPE = " + logType.ToString + " AND USER_VISIBLE = 1 ORDER BY MNEMONIC
                string strSQL = "SELECT Mnemonic,CURVE_NAME as ChannelName,DATA_TYPE as DataType,LOG_TYPE as LogType,CURVE_ID,(CASE WHEN LOG_TYPE=1 THEN 'Time Log' WHEN LOG_TYPE=2 THEN 'Depth Log' END) AS LogName FROM VMX_CURVE_DICTIONARY WHERE USER_VISIBLE=1 ORDER BY LOG_TYPE,MNEMONIC";
                DataTable objData = objDataService.getTable(strSQL);
                return objData;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return new DataTable();
            }
        }

       
        public bool addStdChannels(ref eMaintainStdChannels objeMaintainStdChannels)
        {
            try
            {
                string strSQL = "";
                
                strSQL = "INSERT INTO VMX_CURVE_DICTIONARY (CURVE_ID,CURVE_NAME,MNEMONIC,DATA_TYPE,VALUE_TYPE,VALUE_QUERY,LOG_TYPE,USER_VISIBLE,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
                strSQL += "'" + objeMaintainStdChannels.Mnemonic.Replace("'", "''") + "',";
                strSQL += "'" + objeMaintainStdChannels.ChannelName.Replace("'", "''") + "',";
                strSQL += "'" + objeMaintainStdChannels.Mnemonic.Replace("'", "''") + "',";
                strSQL += "'" + objeMaintainStdChannels.DataType + "',";
                strSQL += "" + "0" + ",";
                strSQL += "'" + "" + "',";
                strSQL += "" + objeMaintainStdChannels.LogType.ToString() + ",";
                strSQL += "" + "1" + ",";
                strSQL += "'" + objDataService.UserName + "',";
                strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                strSQL += "'" + objDataService.UserName + "',";
                strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";

                if (objDataService.executeNonQuery(strSQL))
                {
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }

        public bool editStdChannels(ref eMaintainStdChannels objeMaintainStdChannels)
        {
            try
            {
                string strSQL = "";

                strSQL = "UPDATE VMX_CURVE_DICTIONARY SET ";
                strSQL += " CURVE_NAME='" + objeMaintainStdChannels.ChannelName.Replace("'", "''") + "',";
                strSQL += " DATA_TYPE='" + objeMaintainStdChannels.DataType + "',";
                strSQL += " LOG_TYPE=" + objeMaintainStdChannels.LogType.ToString() + ",";
                strSQL += " MODIFIED_BY='" + objDataService.UserName + "',";
                strSQL += " MODIFIED_DATE='" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "' ";
                strSQL += " WHERE CURVE_ID='" + objeMaintainStdChannels.Mnemonic + "' AND LOG_TYPE=" + objeMaintainStdChannels.LogType.ToString();

                if (objDataService.executeNonQuery(strSQL))
                {
                    return true;

                }
                return true;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }


        public bool removeStdChannels(string Mnemonic, string LogType)
        {
            try
            {
                string strSQL = "";
                objDataService.executeNonQuery("DELETE FROM VMX_CURVE_DICTIONARY WHERE CURVE_ID='" + Mnemonic + "' AND LOG_TYPE=" + LogType.ToString());
                if (objDataService.executeNonQuery(strSQL))
                {
                    return true;
                }
                return true;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }


        //Memonic Mapping
        public DataTable generateMMStandardChannels(string logType)
        {
            try
            {
                string strSQL = "SELECT MNEMONIC,CURVE_NAME FROM VMX_CURVE_DICTIONARY WHERE LOG_TYPE=" + logType + " AND USER_VISIBLE=1 ORDER BY MNEMONIC";
                DataTable objData = objDataService.getTable(strSQL);
                return objData;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return new DataTable();
            }
        }

        public DataTable generateMMAllChannels()
        {
            try
            {

                DataTable objData = objDataService.getTable("SELECT MAPPING_ID, MNEMONIC,SOURCE_MNEMONIC AS CURVE_NAME FROM VMX_MNEMONIC_MAPPING ORDER BY MNEMONIC");
                return  objData;
            }

            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return new DataTable();

            }
        }



        public DataTable loadMappingGrid(string paraMnemonic)
        {
            try
            {
                DataTable objData = objDataService.getTable("SELECT Mapping_Id, SOURCE_MNEMONIC as SourceMnemonic  FROM VMX_MNEMONIC_MAPPING WHERE LTRIM(RTRIM(UPPER(MNEMONIC)))='" + paraMnemonic.Trim().ToUpper() + "' ORDER BY MNEMONIC");
                return objData;
            }


            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return new DataTable();
            }
        }


        //
        public bool addMapping(string Mnemonic, string SourceMnemonic)
        {
            try
            {
                string mappingID = ObjectIDFactory.getObjectID(); ;

                string strSQL = "INSERT INTO VMX_MNEMONIC_MAPPING (MAPPING_ID,MNEMONIC,SOURCE_MNEMONIC) VALUES(";
                strSQL += "'" + mappingID + "',";
                strSQL += "'" + Mnemonic.Replace("'", "''") + "',";
                strSQL += "'" + SourceMnemonic.Replace("'", "''") + "')";

                if (objDataService.executeNonQuery(strSQL))
                {
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + " - " + ex.StackTrace; 
                return false;
            }
        }

        public bool removeMapping(string MnemonicId)
        {
            try
            {
                
                string strSQL = "DELETE FROM VMX_MNEMONIC_MAPPING WHERE MAPPING_ID='" + MnemonicId + "'";
                             

                if (objDataService.executeNonQuery(strSQL))
                {
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + " - " + ex.StackTrace;
                return false;
            }
        }

    }
}
