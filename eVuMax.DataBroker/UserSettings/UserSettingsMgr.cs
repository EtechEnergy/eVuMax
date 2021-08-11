using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Common;
using System.Data;
 
namespace eVuMax.DataBroker.UserSettings
{
    public class UserSettingsMgr
    {

        DataService objDataService;
        public string LastError { get; set; } = "";

        public UserSettingsMgr(DataService paramDataService)
        {
            try
            {
                this.objDataService = paramDataService;

                
            }
            catch (Exception)
            {
                                
            }
        }


        public bool saveUserSettings(UserSettings objSettings)
        {
            try
            {
                string strSQL = "";
                if (objSettings.SettingsId == "tripSpeed1")
                {
                    
                }

                //Delete existing settings
                strSQL = "DELETE FROM [eVuMaxUserSettings] WHERE [UserId]='" + objSettings.UserId + "' AND [SettingsId]='" + objSettings.SettingsId + "' AND [WellId]='" + objSettings.WellId + "'";
                objDataService.executeNonQuery(strSQL);

                strSQL = "INSERT INTO [eVuMaxUserSettings] ([UserId],[SettingsId],[WellId],[SettingsData],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate]) VALUES(";
                strSQL += "'" + utilFunctions.quote(objSettings.UserId) + "',";
                strSQL += "'" + utilFunctions.quote(objSettings.SettingsId) + "',";
                strSQL += "'" + utilFunctions.quote(objSettings.WellId) + "',";
                strSQL += "'" + utilFunctions.quote(objSettings.settingData) + "',";
                strSQL += "'" + utilFunctions.quote(objDataService.UserName) + "',";
                strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                strSQL += "'" + utilFunctions.quote(objDataService.UserName) + "',";
                strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
                
                if(objDataService.executeNonQuery(strSQL))
                {
                    return true;
                }
                else
                {
                    this.LastError = objDataService.LastError;

                }

                return true;
            }
            catch (Exception ex)
            {
                this.LastError = ex.Message + ex.StackTrace;
                return false;
                
            }
        }


        public UserSettings loadUserSettings(string UserId,string SettingsId,string WellId)
        {
            try
            {
                string strSQL = "";

                strSQL = "SELECT * FROM [eVuMaxUserSettings] WHERE [UserId]='" + utilFunctions.quote(UserId) + "' AND [SettingsId]='" + utilFunctions.quote(SettingsId) + "'" + " AND [WellId]='" + WellId + "'";

                DataTable objData = objDataService.getTable(strSQL);

                if(objData!=null && objData.Rows.Count>0)
                {

                    UserSettings objSettings = new UserSettings();
                    objSettings.UserId = UserId;
                    objSettings.SettingsId = SettingsId;
                    objSettings.WellId = WellId;
                    objSettings.settingData = DataService.checkNull( objData.Rows[0]["SettingsData"],"").ToString();

                    objData.Dispose();

                    return objSettings;
                }
                else
                {
                    this.LastError = objDataService.LastError;
                    return null;
                }

            }
            catch (Exception ex)
            {
                this.LastError = ex.Message + ex.StackTrace;
                return null;
            }
        }

        
        

    }
}
