using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Services;
using Newtonsoft.Json;
using eVuMax.DataBroker;
using eVuMax.DataBroker.Broker;
using System.Web.Script.Services;
using System.Reflection;
using System.IO;
using log4net;
using System.Configuration;


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
    public class eVuMax : System.Web.Services.WebService
    {


        string connString = System.Configuration.ConfigurationManager.ConnectionStrings["VuMax"].ConnectionString;

        [WebMethod]
        [ScriptMethod(UseHttpGet = true, ResponseFormat = ResponseFormat.Json)]
        public void testconn()
        {
            try
            {

                string connString = System.Configuration.ConfigurationManager.ConnectionStrings["VuMax"].ConnectionString;
                connString = getConnectionString();//for Decrepting password and user Name

                string __username = "";
                string __password = "";
                string __servername = "";

                getConnStringComponents(out __servername, out __username, out __password);

                VuMaxDR.Data.DataService objDataService;

                objDataService = new VuMaxDR.Data.DataService(VuMaxDR.Data.DataService.vmDatabaseType.SQLServer, "2008", true,false);

                //if (!objDataService.OpenConnectionSqlPassword(__username, __password, __servername))
                if (!objDataService.OpenConnectionWithPassword(__username, __password, __servername))
                {

                    string response = "Error opening database connection " + objDataService.LastError + " \n  User Info "+__username+" pwd "+__password+" server "+__servername+" ==>Connection string was " + objDataService.ConnectionString;
                    HttpContext.Current.Response.Write(response);
                }
                else
                {
                    HttpContext.Current.Response.Write("Database connection opened successfully");
                }

            }
            catch (Exception ex)
            {
                HttpContext.Current.Response.Write("Exception "+ex.Message+ex.StackTrace);
            }
        }


        /// <summary>
        /// Handles the request to get data and returns the response coming from broker
        /// </summary>
        /// <param name="paramRequest"></param>
        /// <returns></returns>
        [WebMethod]
        [ScriptMethod(UseHttpGet = true, ResponseFormat = ResponseFormat.Json)]
        public void getData(string paramRequest)
        {
            try
            {

                ILog APILogger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
                APILogger = log4net.LogManager.GetLogger("eVuMaxAPILog");

                string AuthType = System.Configuration.ConfigurationManager.AppSettings["AuthType"];

                //Parse the request to Broker request
                BrokerRequest objRequest = JsonConvert.DeserializeObject<BrokerRequest>(paramRequest);

                BrokerParameter objParameter = new BrokerParameter();
                objParameter.ParamName = "AuthType";
                objParameter.ParamValue = AuthType;
                objRequest.Parameters.Add(objParameter);
                //****************************************

                string connString = System.Configuration.ConfigurationManager.ConnectionStrings["VuMax"].ConnectionString;
                connString = getConnectionString();//for Decrepting password and user Name

                string __username = "";
                string __password = "";
                string __servername = "";

                getConnStringComponents(out __servername, out __username, out __password);

                VuMaxDR.Data.DataService objDataService;

                objDataService = new VuMaxDR.Data.DataService(VuMaxDR.Data.DataService.vmDatabaseType.SQLServer, "2008", true, false);



                //if (!objDataService.OpenConnectionSqlPassword(__username, __password, __servername))
                if (!objDataService.OpenConnectionWithPassword(__username, __password, __servername))
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
                    //Assign dataService with username, password and Servername. this can be used in creating localConnections in programs
                    objDataService.UserName = __username;
                    objDataService.Password = __password;
                    objDataService.ServerName = __servername;

                    objRequest.objDataService = objDataService;
                    IBroker objBroker = BrokerFactory.createBroker(objRequest);


                    var objResponse = objBroker.getData(objRequest);

                    if (objRequest != null)
                    {
                        //Close the database connection WA$#
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
        public void performTask(string paramRequest)
        {

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
                connString = getConnectionString();//for Decrepting password and user Name

                VuMaxDR.Data.DataService objDataService;

                objDataService = new VuMaxDR.Data.DataService(VuMaxDR.Data.DataService.vmDatabaseType.SQLServer, "2008", true, false);

                string __username = "";
                string __password = "";
                string __servername = "";

                getConnStringComponents(out __servername, out __username, out __password);

                //if (!objDataService.OpenConnectionSqlPassword(__username,__password,__servername))
                if (!objDataService.OpenConnectionWithPassword(__username, __password, __servername))
                {
                    //Error opening database connection
                    BrokerResponse objBadResponse = objRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error opening database connection. \n " + objDataService.LastError;
                    HttpContext.Current.Response.Write(JsonConvert.SerializeObject(objBadResponse));
                }

                //Assign data service
                //Assign dataService with username, password and Servername. this can be used in creating localConnections in programs
                objDataService.UserName = __username;
                objDataService.Password = __password;
                objDataService.ServerName = __servername;

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
        [ScriptMethod(UseHttpGet = true, ResponseFormat = ResponseFormat.Json)]
        public void getAssemblyVersion()
        {
            try
            {

                Assembly assembly = System.Reflection.Assembly.GetExecutingAssembly();
                string version = assembly.GetName().Version.ToString();
                //FileVersionInfo fvi = FileVersionInfo.GetVersionInfo(assembly.Location);
                //string version = fvi.FileVersion;
                var linkTimeLocal = GetLinkerTime(assembly);
                List<string> VerDateInfo = new List<string>();
                VerDateInfo.Add(version);
                VerDateInfo.Add(linkTimeLocal.ToString());


                HttpContext.Current.Response.Write(JsonConvert.SerializeObject(VerDateInfo));



            }
            catch (Exception ex)
            {
                HttpContext.Current.Response.Write(ex.Message);
            }
        }

        public DateTime GetLinkerTime(Assembly assembly, TimeZoneInfo target = null)
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
                string UserFolderName = objRequest.Parameters.Where(x => x.ParamName.Contains("UserFolderName")).FirstOrDefault().ParamValue;

                if (UserFolderName == "" || UserFolderName == null)
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
            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = new BrokerResponse();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error parsing request. " + ex.Message + ex.StackTrace;
                HttpContext.Current.Response.Write(JsonConvert.SerializeObject(objResponse));
            }
        }



        private string getConnectionString()
        {
            try
            {
                System.Data.SqlClient.SqlConnectionStringBuilder builder = new System.Data.SqlClient.SqlConnectionStringBuilder();
                builder.ConnectionString = ConfigurationManager.ConnectionStrings["VuMax"].ConnectionString;
                string dataSource = DecryptString(builder.DataSource);
                builder.DataSource = dataSource;

                // if (builder["Trusted_Connection"].ToString() != "yes") //Will be used when Windows Auth is used
                {

                    string userName = DecryptString(builder["User ID"].ToString());
                    string password = DecryptString(builder["Password"].ToString());

                    builder["User ID"] = userName;
                    builder["Password"] = password;

                }

                string connString = builder.ConnectionString;
                return connString;
            }
            catch (Exception ex)
            {

                return "";
            }
        }



        private void getConnStringComponents(out string paramServerName, out string paramUserName, out string paramPassword)
        {
            paramServerName = "";
            paramUserName = "";
            paramPassword = "";

            try
            {
                System.Data.SqlClient.SqlConnectionStringBuilder builder = new System.Data.SqlClient.SqlConnectionStringBuilder();
                
                builder.ConnectionString = ConfigurationManager.ConnectionStrings["VuMax"].ConnectionString;
                string dataSource = DecryptString(builder.DataSource);
                builder.DataSource = dataSource;

                paramServerName = dataSource;

                try
                {

                    string userName = DecryptString(builder["User ID"].ToString());
                    string password = DecryptString(builder["Password"].ToString());

                    paramUserName = userName;
                    paramPassword = password;

                }
                catch (Exception)
                {

                }

            }
            catch (Exception ex)
            {

            }
        }


        private static string DecryptString(string encrString)
        {
            byte[] b;
            string decrypted;
            try
            {
                var objAES = new VuMaxDR.Common.AES();

                decrypted = objAES.Decrypt(encrString, DataBroker.Global.EncryptionKey, 128);
            }
            catch (FormatException fe)
            {
                decrypted = "";
            }
            return decrypted;
        }



    }//Class
}//Namespace
