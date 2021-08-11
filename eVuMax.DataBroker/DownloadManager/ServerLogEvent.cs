using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DownloadManager
{
    public class ServerLogEvent
    {
        public enum srvEventType
        {
            Request = 0,
            Response = 1,
            ErrorOccured = 2
        }

        public string ServerID = "";
        public string ServerKey = "";
        public string DateTime = "";
        public srvEventType EventType = srvEventType.Request;
        public string EventTitle = "";
        public string EventOutput = "";

        public ServerLogEvent getCopy()
        {
            try
            {
                var objNew = new ServerLogEvent();
                objNew.ServerID = ServerID;
                objNew.ServerKey = ServerKey;
                objNew.DateTime = DateTime;
                objNew.EventType = EventType;
                objNew.EventTitle = EventTitle;
                objNew.EventOutput = EventOutput;
                return objNew;
            }
            catch (Exception ex)
            {
                return new ServerLogEvent();
            }
        }
    }
}
