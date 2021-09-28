using eVuMax.DataBroker.Broker;
using log4net;
using System;
using System.IO;
using System.Linq;
using System.Reflection;


namespace eVuMax.eVuMaxLogger
{
    public class eVuMaxLogger
    {

        ILog APILogger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        ILog ClientLogger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        

       public eVuMaxLogger()
        {
            APILogger = log4net.LogManager.GetLogger("eVuMaxAPILog");
            ClientLogger = log4net.LogManager.GetLogger("eVuMaxClientSideLog");
        }

        public DataBroker.Broker.BrokerResponse LogClientMessage(DataBroker.Broker.BrokerRequest paramRequest)
        {
            try
            {
                BrokerResponse objResponse = new BrokerResponse();

                string ErrorMessage = paramRequest.Parameters.Where(x => x.ParamName.Contains("ErrorMessage")).FirstOrDefault().ParamValue;
                string UserFolderName = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserFolderName")).FirstOrDefault().ParamValue;

                if (UserFolderName == "" || UserFolderName == null)
                {
                    
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "UserFolderName is Blank ";
                    return objResponse;
                }

                foreach (var appender in ClientLogger.Logger.Repository.GetAppenders())
                {
                    try
                    {
                        if (appender.Name == "clientSideLogger")
                        {

                            string file = Path.GetDirectoryName(((log4net.Appender.RollingFileAppender)appender).File);

                            file = @"C:\log\" + @UserFolderName + @"\";
                            string filename = Path.Combine(file, "eVuMaxClientSideLog.txt");

                            //switch (((log4net.Appender.RollingFileAppender)appender).RollingStyle)
                            //{
                            //    case log4net.Appender.RollingFileAppender.RollingMode.Date:
                            //        ((log4net.Appender.RollingFileAppender)appender).RollingStyle = log4net.Appender.RollingFileAppender.RollingMode.Once;
                            //        break;
                            //    case log4net.Appender.RollingFileAppender.RollingMode.Composite:
                            //        ((log4net.Appender.RollingFileAppender)appender).RollingStyle = log4net.Appender.RollingFileAppender.RollingMode.Size;
                            //        break;
                            //}
                            ((log4net.Appender.FileAppender)appender).File = filename;
                            ((log4net.Appender.FileAppender)appender).ActivateOptions();
                        }
                    }
                    catch (Exception ex)

                    {
                    }
                }

                //***********
              
                ClientLogger.Debug(ErrorMessage);
                

                objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = true;
                objResponse.Errors = "";
                return objResponse;


            }
            catch (Exception ex)
            {
                DataBroker.Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
                return objResponse;

            }
        }
        public DataBroker.Broker.BrokerResponse LogMessage(DataBroker.Broker.BrokerRequest paramRequest)
        {
            try
            {
                DataBroker.Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string paramMsg = paramRequest.Parameters.Where(x => x.ParamName.Contains("ErrorMessage")).FirstOrDefault().ParamValue;
                if(paramMsg == null || paramMsg == "")
                {

                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error Message was Blank";
                    return objResponse;
                }

                APILogger.Debug(paramMsg);
                objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = true;
                objResponse.Errors = "";
                return objResponse;
            }
            catch (Exception ex)
            {

                DataBroker.Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
                return objResponse;

            }
        }



        public void LogMessage(string paramMsg)
        {
            try
            {
               

                APILogger.Debug(paramMsg);
               
            }
            catch (Exception ex)
            {

                return;

            }
        }



        public void getClientLog(string UserName)
        {
            try
            {
                string file = @"C:\log\" + UserName + @"\";
                string filename = Path.Combine(file, "eVuMaxClientSideLog.txt");


                string contents = string.Empty;

                FileStream fs = new FileStream(filename, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                StreamReader sr = new StreamReader(fs);
                //contents = sr.ReadToEnd();
                
                string line = String.Empty;
                
                while ((line = sr.ReadLine()) != null)
                {
                    bool halt = true;

                    // to do with current text line
                    // ...
                }


                //using (StreamReader reader = File.OpenText(filename))
                //{
                //    string line = String.Empty;
                //    while ((line = reader.ReadLine()) != null)
                //    {
                //        bool halt = true;

                //        // to do with current text line
                //        // ...
                //    }
                //}

            }
            catch (Exception ex)
            {

                
            }
        }
    }
}
