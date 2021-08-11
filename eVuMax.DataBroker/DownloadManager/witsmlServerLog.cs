using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DownloadManager
{
    public class witsmlServerLog
    {
        public int Type = 0;
        public string DateTime = "";
        public string Text = "";

        public witsmlServerLog()
        {
            try
            {
            }
            catch (Exception ex)
            {
            }
        }

        public witsmlServerLog(int paramType, string paramDateTime, string paramText)
        {
            try
            {
                Type = paramType;
                DateTime = paramDateTime;
                Text = paramText;
            }
            catch (Exception ex)
            {
            }
        }
    }
}
