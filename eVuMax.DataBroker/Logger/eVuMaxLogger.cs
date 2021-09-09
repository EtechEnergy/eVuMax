using log4net;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.eVuMaxLogger
{
    public class eVuMaxLogger
    {

        ILog APILogger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

       public eVuMaxLogger()
        {
            APILogger = log4net.LogManager.GetLogger("eVuMaxAPILog");
        }
        public void LogMessage(string paramMsg)
        {
            try
            {

                //var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
                //var configFileDirectory = Path.Combine(baseDirectory, "log4net.config");

                //FileInfo configFileInfo = new FileInfo(configFileDirectory);
                //log4net.Config.XmlConfigurator.ConfigureAndWatch(configFileInfo);

              //  APILogger = log4net.LogManager.GetLogger("eVuMaxAPILog");
                APILogger.Debug(paramMsg);

            }
            catch (Exception ex)
            {



            }
        }
    }
}
