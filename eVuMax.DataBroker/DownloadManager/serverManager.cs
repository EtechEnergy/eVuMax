using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.DownloadManager
{
    public class serverManager
    {

        public Dictionary<string, WitsmlServer> serverList = new Dictionary<string, WitsmlServer>();

        public bool isListLoaded()
        {
            try
            {
                if (serverList.Count > 0)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public WitsmlServer getServerByURL(string WMLSURL)
        {
            try
            {
                if (serverList.Count == 0)
                {
                    return null;
                }

                bool Found = false;
                foreach (WitsmlServer objServer in serverList.Values)
                {
                    if (objServer.WMLSURL.Trim().ToLower() == WMLSURL.Trim().ToLower())
                    {
                        return objServer;
                    }
                }

                return serverList.Values.First();
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public bool Load(ref DataService objDataService)
        {
            try
            {

                // 'Clear the list
                serverList.Clear();
                DataTable objData = objDataService.getTable("SELECT * FROM VMX_WITSML_SERVERS ORDER BY SERVER_NAME");
                foreach (DataRow objRow in objData.Rows)
                {
                    var objServer = new WitsmlServer();
                    objServer.ServerID = DataService.checkNull(objRow["SERVER_ID"], "").ToString();
                    objServer.ServerName = DataService.checkNull(objRow["SERVER_NAME"], "").ToString();
                    objServer.WMLSURL = DataService.checkNull(objRow["WMLS_URL"], "").ToString();
                    objServer.WMLPURL = DataService.checkNull(objRow["WMLP_URL"], "").ToString();
                    objServer.WITSMLVersion = DataService.checkNull(objRow["WITSML_VERSION"], "").ToString();
                    objServer.UseProxyServer = Convert.ToInt32(DataService.checkNull(objRow["USE_PROXY"], 0)) == 1? true: false;
                    objServer.ProxyURL = DataService.checkNull(objRow["PROXY_URL"], "").ToString();
                    objServer.ProxyPort = DataService.checkNull(objRow["PROXY_PORT"], "").ToString();
                    objServer.UseProxyCredentials = Convert.ToInt32(DataService.checkNull(objRow["USE_PROXY_CREDENTIALS"], 0)) == 1? true: false;
                    objServer.ProxyUserName = DataService.checkNull(objRow["PROXY_USER_NAME"], "").ToString();
                    string mPassword = DataService.checkNull(objRow["PROXY_PASSWORD"], "").ToString();
                    if (!string.IsNullOrEmpty(mPassword.Trim()))
                    {
                        var objAES = new VuMaxDR.Common.AES();
                        mPassword = objAES.Decrypt(mPassword, Global.PasswordEncryptionKey, 128);
                    }

                    string mServerPassword = DataService.checkNull(objRow["SERVER_PASSWORD"], "").ToString();
                    if (!string.IsNullOrEmpty(mServerPassword.Trim()))
                    {
                        var objAES = new VuMaxDR.Common.AES();
                        mServerPassword = objAES.Decrypt(mServerPassword, Global.PasswordEncryptionKey, 128);
                    }

                    objServer.UserName = DataService.checkNull(objRow["SERVER_USER_NAME"], "").ToString();
                    objServer.Password = mServerPassword;
                    objServer.ProxyPassword = mPassword;
                    objServer.TimeOut = Convert.ToInt32(DataService.checkNull(objRow["TIME_OUT"], 0));
                    objServer.RetryCount =Convert.ToInt32( DataService.checkNull(objRow["RETRY_COUNT"], 0));
                    objServer.SendPlainText = Convert.ToInt32(DataService.checkNull(objRow["SEND_PLAIN_TEXT"], 0)) == 1? true: false;
                    objServer.PiDataSource = Convert.ToInt32(DataService.checkNull(objRow["PI_SOURCE"], 0)) == 1? true: false;
                    objServer.WriteBack = Convert.ToInt32(DataService.checkNull(objRow["WRITE_BACK"], 0)) == 1? true: false;
                    try
                    {
                        objServer.PiIntegration = Convert.ToInt32(DataService.checkNull(objRow["PI_INTEGRATION"], 0)) == 1? true: false;
                        objServer.PiServer = DataService.checkNull(objRow["PI_SERVER"], "").ToString();
                        objServer.PiDatabase = DataService.checkNull(objRow["PI_DATABASE"], "").ToString();
                        objServer.PiLoginType = Convert.ToInt32(DataService.checkNull(objRow["PI_CONN_TYPE"], 0));
                        objServer.PiUserName = DataService.checkNull(objRow["PI_USER_NAME"], "").ToString();
                        string piPassword = DataService.checkNull(objRow["PI_PASSWORD"], "").ToString();
                        if (!string.IsNullOrEmpty(piPassword.Trim()))
                        {
                            var objAES = new VuMaxDR.Common.AES();
                            piPassword = objAES.Decrypt(piPassword, Global.PasswordEncryptionKey, 128);
                        }

                        objServer.PiPassword = piPassword;
                        objServer.PiDataStepRate = Convert.ToInt32(DataService.checkNull(objRow["PI_DATA_STEP_RATE"], 1));
                        objServer.PiDataCheckThreshold = Convert.ToInt32(DataService.checkNull(objRow["PI_CHECK_THRESHOLD"], 10));
                    }
                    catch (Exception ex)
                    {
                    }

                    if (!serverList.ContainsKey(objServer.ServerID))
                    {
                        serverList.Add(objServer.ServerID, objServer);
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static bool addServer(ref DataService objDataService, WitsmlServer objServer)
        {
            try
            {
                if (objServer.ServerID.Trim() == "")
                {
                    objServer.ServerID = Guid.NewGuid().ToString();
                }

                var objAES = new VuMaxDR.Common.AES();
                string EncryptedPassword = objServer.ProxyPassword;
                if (!string.IsNullOrEmpty(EncryptedPassword.Trim()))
                {
                    EncryptedPassword = objAES.Encrypt(EncryptedPassword, Global.PasswordEncryptionKey, 128);
                }

                string EncryptedServerPassword = objServer.Password;
                if (!string.IsNullOrEmpty(EncryptedServerPassword.Trim()))
                {
                    EncryptedServerPassword = objAES.Encrypt(EncryptedServerPassword, Global.PasswordEncryptionKey, 128);
                }

                string EncryptedPiServerPassword = objServer.PiPassword;
                if (!string.IsNullOrEmpty(EncryptedPiServerPassword.Trim()))
                {
                    EncryptedPiServerPassword = objAES.Encrypt(EncryptedPiServerPassword, Global.PasswordEncryptionKey, 128);
                }

                string strSQL = "";
                strSQL = "INSERT INTO VMX_WITSML_SERVERS (SERVER_ID,SERVER_NAME,WMLS_URL,WMLP_URL,WITSML_VERSION,USE_PROXY,PROXY_URL,PROXY_PORT,USE_PROXY_CREDENTIALS,PROXY_USER_NAME,PROXY_PASSWORD,TIME_OUT,RETRY_COUNT,SEND_PLAIN_TEXT,SERVER_USER_NAME,SERVER_PASSWORD,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE,PI_SOURCE,WRITE_BACK,PI_INTEGRATION,PI_SERVER,PI_DATABASE,PI_CONN_TYPE,PI_USER_NAME,PI_PASSWORD,PI_DATA_STEP_RATE,PI_CHECK_THRESHOLD) VALUES(";
                strSQL += "'" + objServer.ServerID + "',";
                strSQL += "'" + objServer.ServerName + "',";
                strSQL += "'" + objServer.WMLSURL + "',";
                strSQL += "'" + objServer.WMLPURL + "',";
                strSQL += "'" + objServer.WITSMLVersion + "',";
                strSQL += "" + (objServer.UseProxyServer == true?1:0).ToString() + ",";
                strSQL += "'" + objServer.ProxyURL + "',";
                strSQL += "'" + objServer.ProxyPort + "',";
                strSQL += "" + (objServer.UseProxyCredentials==true?1: 0).ToString() + ",";
                strSQL += "'" + objServer.ProxyUserName + "',";
                strSQL += "'" + EncryptedPassword + "',";
                strSQL += "" + objServer.TimeOut.ToString() + ",";
                strSQL += "" + objServer.RetryCount.ToString() + ",";
                strSQL += "" + (objServer.SendPlainText==true?1: 0).ToString() + ",";
                strSQL += "'" + objServer.UserName + "',";
                strSQL += "'" + EncryptedServerPassword + "',";
                strSQL += "'" + objServer.UserName + "',";
                strSQL += "'" + DateTime.Now.ToString("yyyy-MM-dd HH:MM:ss") + "',";
                strSQL += "'" + objServer.UserName + "',";
                strSQL += "'" + DateTime.Now.ToString("yyyy-MM-dd HH:MM:ss") + "',";
                strSQL += "" + (objServer.PiDataSource == true?1: 0).ToString() + ",";
                strSQL += "" + (objServer.WriteBack == true?1: 0).ToString() + ",";
                strSQL += "" + (objServer.PiIntegration == true?1: 0).ToString() + ",";
                strSQL += "'" + objServer.PiServer.Replace("'", "''") + "',";
                strSQL += "'" + objServer.PiDatabase.Replace("'", "''") + "',";
                strSQL += "" + objServer.PiLoginType.ToString() + ",";
                strSQL += "'" + objServer.UserName.Replace("'", "''") + "',";
                strSQL += "'" + EncryptedPiServerPassword.Replace("'", "''") + "',";
                strSQL += "" + objServer.PiDataStepRate.ToString() + ",";
                strSQL += "" + objServer.PiDataCheckThreshold.ToString() + ")";
                if (objDataService.executeNonQuery(strSQL))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static bool updateServer(ref DataService objDataService, WitsmlServer objServer)
        {
            try
            {
                var objAES = new VuMaxDR.Common.AES();
                string EncryptedPassword = objServer.ProxyPassword;
                if (!string.IsNullOrEmpty(EncryptedPassword.Trim()))
                {
                    EncryptedPassword = objAES.Encrypt(EncryptedPassword, Global.PasswordEncryptionKey, 128);
                }

                string EncryptedServerPassword = objServer.Password;
                if (!string.IsNullOrEmpty(EncryptedServerPassword.Trim()))
                {
                    EncryptedServerPassword = objAES.Encrypt(EncryptedServerPassword, Global.PasswordEncryptionKey, 128);
                }

                string EncryptedPiServerPassword = objServer.PiPassword;
                if (!string.IsNullOrEmpty(EncryptedPiServerPassword.Trim()))
                {
                    EncryptedPiServerPassword = objAES.Encrypt(EncryptedPiServerPassword, Global.PasswordEncryptionKey, 128);
                }

                string strSQL = "";
                strSQL = " UPDATE VMX_WITSML_SERVERS SET ";
                strSQL += " SERVER_NAME='" + objServer.ServerName + "',";
                strSQL += " WMLS_URL='" + objServer.WMLSURL + "',";
                strSQL += " WMLP_URL='" + objServer.WMLPURL + "',";
                strSQL += " WITSML_VERSION='" + objServer.WITSMLVersion + "',";
                strSQL += " USE_PROXY=" + (objServer.UseProxyServer ==true?1:0).ToString() + ",";
                strSQL += " PROXY_URL='" + objServer.ProxyURL + "',";
                strSQL += " PROXY_PORT='" + objServer.ProxyPort + "',";
                strSQL += " USE_PROXY_CREDENTIALS=" + (objServer.UseProxyCredentials ==true? 1: 0).ToString() + ",";
                strSQL += " PROXY_USER_NAME='" + objServer.ProxyUserName + "',";
                strSQL += " PROXY_PASSWORD='" + EncryptedPassword + "',";
                strSQL += " TIME_OUT=" + objServer.TimeOut.ToString() + ",";
                strSQL += " RETRY_COUNT=" + objServer.RetryCount.ToString() + ",";
                strSQL += " SEND_PLAIN_TEXT=" + (objServer.SendPlainText ==true? 1: 0).ToString() + ",";
                strSQL += " SERVER_USER_NAME='" + objServer.UserName + "',";
                strSQL += " SERVER_PASSWORD='" + EncryptedServerPassword + "',";
                strSQL += " MODIFIED_BY='" + objDataService.UserName + "',";
                strSQL += " MODIFIED_DATE='" + DateTime.Now.ToString("yyyy-MM-dd HH:MM:ss") + "', ";
                strSQL += " PI_SOURCE=" + (objServer.PiDataSource == true?1: 0).ToString() + ",";
                strSQL += " WRITE_BACK=" + (objServer.WriteBack == true? 1: 0).ToString() + ", ";
                strSQL += "PI_INTEGRATION=" + (objServer.PiIntegration == true? 1: 0).ToString() + ",";
                strSQL += "PI_SERVER='" + objServer.PiServer.Replace("'", "''") + "',";
                strSQL += "PI_DATABASE='" + objServer.PiDatabase.Replace("'", "''") + "',";
                strSQL += "PI_CONN_TYPE=" + objServer.PiLoginType.ToString() + ",";
                strSQL += "PI_USER_NAME='" + objServer.PiUserName.Replace("'", "''") + "',";
                strSQL += "PI_PASSWORD='" + EncryptedPiServerPassword.Replace("'", "''") + "',";
                strSQL += "PI_DATA_STEP_RATE=" + objServer.PiDataStepRate.ToString() + ",";
                strSQL += "PI_CHECK_THRESHOLD=" + objServer.PiDataCheckThreshold.ToString() + " ";
                strSQL += " WHERE SERVER_ID='" + objServer.ServerID + "' ";
                if (objDataService.executeNonQuery(strSQL))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static bool removeServer(ref DataService objDataService, string ServerID)
        {
            try
            {
                string strSQL = "";
                strSQL = "DELETE FROM VMX_WITSML_SERVERS WHERE SERVER_ID='" + ServerID + "'";
                if (objDataService.executeNonQuery(strSQL))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static bool saveUserCredentials(ref DataService objDataService, string ServerID, string UserName, string Password)
        {
            try
            {
                string EncryptedPassword = Password;
                var objAES = new VuMaxDR.Common.AES();
                if (!string.IsNullOrEmpty(EncryptedPassword.Trim()))
                {
                    EncryptedPassword = objAES.Encrypt(EncryptedPassword, Global.PasswordEncryptionKey, 128);
                }

                string strSQL = "";
                if (objDataService.IsRecordExist("SELECT SERVER_ID FROM VMX_USER_SERVER_SETTINGS WHERE SERVER_ID='" + ServerID + "' AND USER_NAME='" + objDataService.UserName + "'"))
                {
                    strSQL = "UPDATE VMX_USER_SERVER_SETTINGS SET SERVER_USERNAME='" + UserName + "',SERVER_PASSWORD='" + EncryptedPassword + "' WHERE SERVER_ID='" + ServerID + "' AND USER_NAME='" + objDataService.UserName + "'";
                    if (objDataService.executeNonQuery(strSQL))
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    strSQL = " INSERT INTO VMX_USER_SERVER_SETTINGS (SERVER_ID,USER_NAME,SERVER_PASSWORD,SERVER_USERNAME) VALUES(";
                    strSQL += "'" + ServerID + "',";
                    strSQL += "'" + objDataService.UserName + "',";
                    strSQL += "'" + EncryptedPassword + "',";
                    strSQL += "'" + UserName + "')";
                    if (objDataService.executeNonQuery(strSQL))
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static bool loadUserServerCredentials(ref DataService objDataService, string ServerID, ref string UserName, ref string Password)
        {
            try
            {
                UserName = "";
                Password = "";
                var objAES = new VuMaxDR.Common.AES();
                DataTable objData = objDataService.getTable("SELECT SERVER_USERNAME,SERVER_PASSWORD FROM VMX_USER_SERVER_SETTINGS WHERE SERVER_ID='" + ServerID + "' AND USER_NAME='" + objDataService.UserName + "'");
                if (objData.Rows.Count > 0)
                {
                    string mUserName = DataService.checkNull(objData.Rows[0]["SERVER_USERNAME"], "").ToString();
                    string mPassword = DataService.checkNull(objData.Rows[0]["SERVER_PASSWORD"], "").ToString();
                    if (!string.IsNullOrEmpty(mPassword.Trim()))
                    {
                        mPassword = objAES.Decrypt(mPassword, Global.PasswordEncryptionKey, 128);
                    }

                    UserName = mUserName;
                    Password = mPassword;
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static Dictionary<string, WitsmlServer> getServerListByURL(string paramWITSMLURL, Broker.BrokerRequest paramRequest)
        {
            try
            {
                var list = new Dictionary<string, WitsmlServer>();
                DataTable objData = paramRequest.objDataService.getTable("SELECT SERVER_ID FROM VMX_WITSML_SERVERS WHERE LTRIM(RTRIM(UPPER(WMLS_URL)))='" + paramWITSMLURL.Trim().ToUpper() + "'");
                foreach (DataRow objRow in objData.Rows)
                {
                    string serverID = DataService.checkNull(objRow["SERVER_ID"], "").ToString();
                    WitsmlServer objServer = WitsmlServer.loadObject(ref paramRequest.objDataService, serverID);
                    if (objServer is object)
                    {
                        if (!list.ContainsKey(objServer.ServerID))
                        {
                            list.Add(objServer.ServerID, objServer.getCopy());
                        }
                    }
                }

                return list;
            }
            catch (Exception ex)
            {
                return new Dictionary<string, WitsmlServer>();

            }

            
        }

        public static WitsmlServer getServerByID(ref VuMaxDR.Data.DataService objDataService, string paramServerID)
        {
            try
            {
                DataTable objData = objDataService.getTable("SELECT * FROM VMX_WITSML_SERVERS WHERE SERVER_ID='" + paramServerID + "'");
                if (objData.Rows.Count > 0)
                {
                    DataRow objRow = objData.Rows[0];
                    var objServer = new WitsmlServer();
                    objServer.ServerID = DataService.checkNull(objRow["SERVER_ID"], "").ToString();
                    objServer.ServerName = DataService.checkNull(objRow["SERVER_NAME"], "").ToString();
                    objServer.WMLSURL = DataService.checkNull(objRow["WMLS_URL"], "").ToString();
                    objServer.WMLPURL = DataService.checkNull(objRow["WMLP_URL"], "").ToString();
                    objServer.WITSMLVersion = DataService.checkNull(objRow["WITSML_VERSION"], "").ToString();
                    objServer.UseProxyServer = (Convert.ToInt32(DataService.checkNull(objRow["USE_PROXY"], 0)) == 1? true: false);
                    objServer.ProxyURL = DataService.checkNull(objRow["PROXY_URL"], "").ToString();
                    objServer.ProxyPort = DataService.checkNull(objRow["PROXY_PORT"], "").ToString();
                    objServer.UseProxyCredentials = (Convert.ToInt32(DataService.checkNull(objRow["USE_PROXY_CREDENTIALS"], 0)) == 1? true: false);
                    objServer.ProxyUserName = DataService.checkNull(objRow["PROXY_USER_NAME"], "").ToString();
                    string mPassword = VuMaxDR.Data.DataService.checkNull(objRow["PROXY_PASSWORD"], "").ToString();
                    if (!string.IsNullOrEmpty(mPassword.Trim()))
                    {
                        var objAES = new VuMaxDR.Common.AES();
                        mPassword = objAES.Decrypt(mPassword, Global.PasswordEncryptionKey, 128);
                    }

                    string mServerPassword = VuMaxDR.Data.DataService.checkNull(objRow["SERVER_PASSWORD"], "").ToString();
                    if (!string.IsNullOrEmpty(mServerPassword.Trim()))
                    {
                        var objAES = new VuMaxDR.Common.AES();
                        mServerPassword = objAES.Decrypt(mServerPassword, Global.PasswordEncryptionKey, 128);
                    }

                    objServer.UserName = DataService.checkNull(objRow["SERVER_USER_NAME"], "").ToString();
                    objServer.Password = mServerPassword;
                    objServer.ProxyPassword = mPassword;
                    objServer.TimeOut = Convert.ToInt32(DataService.checkNull(objRow["TIME_OUT"], 0).ToString());
                    objServer.RetryCount =Convert.ToInt32( DataService.checkNull(objRow["RETRY_COUNT"], 0));
                    objServer.SendPlainText = Convert.ToInt32(DataService.checkNull(objRow["SEND_PLAIN_TEXT"], 0)) == 1?true: false;
                    objServer.PiDataSource = Convert.ToInt32(DataService.checkNull(objRow["PI_SOURCE"], 0)) == 1? true: false;
                    objServer.WriteBack = Convert.ToInt32(DataService.checkNull(objRow["WRITE_BACK"], 0)) == 1?true: false;
                    try
                    {
                        objServer.PiIntegration = Convert.ToInt32(DataService.checkNull(objRow["PI_INTEGRATION"], 0)) == 1? true: false;
                        objServer.PiServer = DataService.checkNull(objRow["PI_SERVER"], "").ToString();
                        objServer.PiDatabase = DataService.checkNull(objRow["PI_DATABASE"], "").ToString();
                        objServer.PiLoginType = Convert.ToInt32(DataService.checkNull(objRow["PI_CONN_TYPE"], 0));
                        objServer.PiUserName = DataService.checkNull(objRow["PI_USER_NAME"], "").ToString();
                        string piPassword = DataService.checkNull(objRow["PI_PASSWORD"], "").ToString();
                        if (!string.IsNullOrEmpty(piPassword.Trim()))
                        {
                            var objAES = new VuMaxDR.Common.AES();
                            piPassword = objAES.Decrypt(piPassword, Global.PasswordEncryptionKey, 128);
                        }

                        objServer.PiPassword = piPassword;
                        objServer.PiDataStepRate = Convert.ToInt32( DataService.checkNull(objRow["PI_DATA_STEP_RATE"], 1));
                        objServer.PiDataCheckThreshold = Convert.ToInt32(DataService.checkNull(objRow["PI_CHECK_THRESHOLD"], 10));
                    }
                    catch (Exception ex)
                    {
                    }

                    return objServer;
                }
                else
                {
                    return new WitsmlServer();
                }
            }
            catch (Exception ex)
            {
                return new WitsmlServer();
            }
        }


    }
}






