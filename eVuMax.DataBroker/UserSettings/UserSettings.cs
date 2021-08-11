using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.UserSettings
{
    public class UserSettings
    {

        public string UserId { get; set; } = "";
        public string WellId { get; set; } = "";
        public string SettingsId { get; set; } = "";
        public string settingData { get; set; } = ""; //User Settings in JSON format

    }
}
