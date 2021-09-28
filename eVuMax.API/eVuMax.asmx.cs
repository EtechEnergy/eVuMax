using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Services;
//using eVuMax.DataBroker.Data;
using VuMaxDR.Data;
using Newtonsoft.Json;
using System.Data.SqlClient;
using eVuMax.DataBroker;
using eVuMax.DataBroker.Broker;
using System.Web.Script.Services;
using System.Diagnostics;
using System.Reflection;
using System.IO;
using log4net;

namespace eVuMax.API
{

    
    /// <summary>
    /// Summary description for eVuMax
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    [System.Web.Script.Services.ScriptService]
    public  class eVuMax : System.Web.Services.WebService
    {

        string connString = System.Configuration.ConfigurationManager.ConnectionStrings["VuMax"].ConnectionString;
       
      


        //  DataService objDataService = new DataService(VuMaxDR.Data.DataService.vmDatabaseType.SQLServer, "2008", true, true);


        /// <summary>
        /// Handles the request to get data and returns the response coming from broker
        /// </summary>
        /// <param name="paramRequest"></param>
        /// <returns></returns>
        [WebMethod]
        [ScriptMethod(UseHttpGet = true, ResponseFormat = ResponseFormat.Json)]
        public  void getData(string paramRequest)
        {
            try
            {
                ILog APILogger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
                APILogger =  log4net.LogManager.GetLogger("eVuMaxAPILog");
                


                string AuthType = System.Configuration.ConfigurationManager.AppSettings["AuthType"];

                //Parse the request to Broker request
                BrokerRequest objRequest = JsonConvert.DeserializeObject<BrokerRequest>(paramRequest);
                
                //Nishant 08-09-2021
                //This will be used to validate User from DB or Windows
                BrokerParameter objParameter = new BrokerParameter();
                objParameter.ParamName = "AuthType";
                objParameter.ParamValue = AuthType;
                objRequest.Parameters.Add(objParameter);
                //****************************************

                string connString = System.Configuration.ConfigurationManager.ConnectionStrings["VuMax"].ConnectionString;
                DataService objDataService = new DataService(VuMaxDR.Data.DataService.vmDatabaseType.SQLServer, "2008", true, true);
                

                if (!objDataService.OpenConnection2(connString))
                {
                    //Error opening database connection
                    BrokerResponse objBadResponse = objRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error opening database connection. \n " + objDataService.LastError;
                    HttpContext.Current.Response.Write(JsonConvert.SerializeObject(objBadResponse));
                }
                else
                {
                    //Assign data service
                    objRequest.objDataService = objDataService;
                    IBroker objBroker = BrokerFactory.createBroker(objRequest);
                    
                    
                    var objResponse = objBroker.getData(objRequest);

                    if (objRequest != null)
                    {
                        //Close the database connection
                        if (objDataService != null)
                        {
                            objDataService.closeConnection();

                        }

                        //JsonConvert.SerializeObject(objResponse);
                        HttpContext.Current.Response.Write(JsonConvert.SerializeObject(objResponse));
                    }

                }



            }
            catch (Exception ex)
            {

                try
                {

                    BrokerResponse objResponse = new BrokerResponse();
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error parsing request. " + ex.Message + ex.StackTrace;
                    //  return JsonConvert.SerializeObject(objResponse);
                    HttpContext.Current.Response.Write(JsonConvert.SerializeObject(objResponse));

                }
                catch (Exception)
                {
                    // return JsonConvert.SerializeObject("");
                    HttpContext.Current.Response.Write(JsonConvert.SerializeObject(""));

                }

            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)] 
        public void performTask(string paramRequest) {

            try
            {
                ILog APILogger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
                APILogger = log4net.LogManager.GetLogger("eVuMaxAPILog");

                //Parse the request to Broker request

                BrokerRequest objRequest = JsonConvert.DeserializeObject<BrokerRequest>(paramRequest);

                //Nishant 08-09-2021
                //This will be used to validate User from DB or Windows
                string AuthType = System.Configuration.ConfigurationManager.AppSettings["AuthType"];
                BrokerParameter objParameter = new BrokerParameter();
                objParameter.ParamName = "AuthType";
                objParameter.ParamValue = AuthType;
                objRequest.Parameters.Add(objParameter);
                //****************************************

                             

                string connString = System.Configuration.ConfigurationManager.ConnectionStrings["VuMax"].ConnectionString;
                DataService objDataService = new DataService(VuMaxDR.Data.DataService.vmDatabaseType.SQLServer, "2008", true, true);


                if (!objDataService.OpenConnection(connString))
                {
                    //Error opening database connection
                    BrokerResponse objBadResponse = objRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error opening database connection. \n " + objDataService.LastError;
                    HttpContext.Current.Response.Write(JsonConvert.SerializeObject(objBadResponse));
                }

                //Assign data service
                objRequest.objDataService = objDataService;

                IBroker objBroker = BrokerFactory.createBroker(objRequest);
                

                var objResponse = objBroker.performTask(objRequest);

                if (objRequest != null)
                {
                    //Close the database connection
                    if (objDataService != null)
                    {
                        objDataService.closeConnection();

                    }


                    //JsonConvert.SerializeObject(objResponse);
                    HttpContext.Current.Response.Write(JsonConvert.SerializeObject(objResponse));
                }


            }
            catch (Exception ex)
            {

                try
                {

                    BrokerResponse objResponse = new BrokerResponse();
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error parsing request. " + ex.Message + ex.StackTrace;
                    //  return JsonConvert.SerializeObject(objResponse);
                    HttpContext.Current.Response.Write(JsonConvert.SerializeObject(objResponse));

                }
                catch (Exception)
                {
                    // return JsonConvert.SerializeObject("");
                    HttpContext.Current.Response.Write(JsonConvert.SerializeObject(""));

                }
            }

        }


     

        /// <summary>
        /// Returns Assembly version
        /// </summary>
        /// <returns>Version Installed</returns>
        [WebMethod]
        public void getAssemblyVersion()
        {
            try
            {


                System.Reflection.Assembly assembly = System.Reflection.Assembly.GetExecutingAssembly();
                string version = assembly.GetName().Version.ToString();

                //FileVersionInfo fvi = FileVersionInfo.GetVersionInfo(assembly.Location);
                //string version = fvi.FileVersion;
                var linkTimeLocal = GetLinkerTime(assembly);

                List<string> VerDateInfo = new List<string>();
                VerDateInfo.Add(version);
                VerDateInfo.Add(linkTimeLocal.ToString());

                //HttpContext.Current.Response.Write(VerDateInfo);
                HttpContext.Current.Response.Write(JsonConvert.SerializeObject(VerDateInfo));


            }
            catch (Exception ex)
            {
                HttpContext.Current.Response.Write(ex.Message);
            }
        }

        public  DateTime GetLinkerTime(Assembly assembly, TimeZoneInfo target = null)
        {
            var filePath = assembly.Location;
            const int c_PeHeaderOffset = 60;
            const int c_LinkerTimestampOffset = 8;

            var buffer = new byte[2048];

            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                stream.Read(buffer, 0, 2048);

            var offset = BitConverter.ToInt32(buffer, c_PeHeaderOffset);
            var secondsSince1970 = BitConverter.ToInt32(buffer, offset + c_LinkerTimestampOffset);
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            var linkTimeUtc = epoch.AddSeconds(secondsSince1970);

            var tz = target ?? TimeZoneInfo.Local;
            var localTime = TimeZoneInfo.ConvertTimeFromUtc(linkTimeUtc, tz);

            return localTime;
        }


        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public void LogClientSideError(string paramRequest)
        {
            try
            {

                BrokerRequest objRequest = JsonConvert.DeserializeObject<BrokerRequest>(paramRequest);


                string ErrorMessage = objRequest.Parameters.Where(x => x.ParamName.Contains("ErrorMessage")).FirstOrDefault().ParamValue;
                string  UserFolderName= objRequest.Parameters.Where(x => x.ParamName.Contains("UserFolderName")).FirstOrDefault().ParamValue;

                if(UserFolderName == "" || UserFolderName == null)
                {
                    BrokerResponse objResponse = new BrokerResponse();
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "UserFolderName is Blank "; 
                    HttpContext.Current.Response.Write(JsonConvert.SerializeObject(objResponse));
                }

                ILog ClientLogger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
                ClientLogger = log4net.LogManager.GetLogger("eVuMaxClientSideLog");

                foreach (var appender in ClientLogger.Logger.Repository.GetAppenders())
                {
                    try
                    {
                        if (appender.Name == "clientSideLogger") {

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
                    catch (Exception ex) {
                    }
                }

                //***********
                ClientLogger.Debug(ErrorMessage);
            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = new BrokerResponse();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error parsing request. " + ex.Message + ex.StackTrace;
                HttpContext.Current.Response.Write(JsonConvert.SerializeObject(objResponse));
            }
        }


        }//Class
    }//Namespace
