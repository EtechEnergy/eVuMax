using VuMaxDR.Common;
using System;
using System.Collections.Generic;

using VuMaxDR.Data;

namespace eVuMax.DataBroker.DataServiceManager
{
    public class SystemSettings
    {
        //Public settings As New Dictionary(Of String, SettingValue)
        Dictionary<string, SettingValue> settings = new Dictionary<string, SettingValue>();
        public static VuMaxDR.Common.SystemSettings loadSystemSettings(ref DataService paramDataService)
        {
            try
            {
                VuMaxDR.Common.SystemSettings objSettings = new VuMaxDR.Common.SystemSettings();
                objSettings.LoadSettings(ref paramDataService);
                
                return objSettings;
            }
            catch (Exception)
            {

                return new VuMaxDR.Common.SystemSettings();
            }
        }

        public static VuMaxDR.Common.SystemSettings saveSystemSettings(ref DataService paramDataService, Dictionary<string, SettingValue> paramSettings)
        {
            try
            {
                VuMaxDR.Common.SystemSettings objSettings = new VuMaxDR.Common.SystemSettings();

                foreach (var objValue in paramSettings.Values)
                {
                    objSettings.setSetting(objValue.SettingID, objValue.Value);
                }

                objSettings.SaveSettings(ref paramDataService);

                return objSettings;
            }
            catch (Exception)
            {

                return new VuMaxDR.Common.SystemSettings();
            }
        }


    }
}
