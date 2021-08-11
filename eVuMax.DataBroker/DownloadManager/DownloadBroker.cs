using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DownloadManager
{
    public class DownloadBroker : IBroker
    {
        //Nishant 06-10-2020
        private const string loadWitsmlServerList_ = "loadWitsmlServerList";
        private const string addWitsmlServer_ = "AddWitsmlServer";
        private const string UpdateWitsmlServer_ = "UpdateWitsmlServer";
        private const string RemoveWitsmlServer_ = "RemoveWitsmlServer";




        string lastError = "";
        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                if (paramRequest.Function == loadWitsmlServerList_)
                {
                    return getServerList(paramRequest);
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }

        public Broker.BrokerResponse performTask(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                if (paramRequest.Function == addWitsmlServer_)
                {
                    return addServer(paramRequest);
                }

                if (paramRequest.Function == UpdateWitsmlServer_)
                {
                    return updateServer(paramRequest);
                }

                if (paramRequest.Function == RemoveWitsmlServer_)
                {
                    return removeServer(paramRequest);
                }

                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }


        private Broker.BrokerResponse getServerList(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                serverManager objServer = new serverManager();
                objServer.Load(ref paramRequest.objDataService);

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objServer.serverList);
                return objResponse;
                
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }

        }

        
              private Broker.BrokerResponse addServer(Broker.BrokerRequest paramRequest)
            {
                 try
                  {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string userID = @"";
                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }


                foreach (var objParameter in paramRequest.Parameters)
                {

                    if (objParameter.ParamName == "Add")
                    {
                        WitsmlServer objServer = new WitsmlServer();
                        objServer = JsonConvert.DeserializeObject<WitsmlServer>(objParameter.ParamValue);
                        serverManager.addServer(ref paramRequest.objDataService, objServer);
                    }

                }

                objResponse.RequestSuccessfull = true;
                objResponse.Response = "";
                return objResponse;

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }

        }

        private Broker.BrokerResponse updateServer(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                string userID = @"";
                try
                {
                    userID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }


                foreach (var objParameter in paramRequest.Parameters)
                {

                    if (objParameter.ParamName == "Update")
                    {
                        WitsmlServer objServer = new WitsmlServer();
                        objServer = JsonConvert.DeserializeObject<WitsmlServer>(objParameter.ParamValue);
                        serverManager.updateServer(ref paramRequest.objDataService, objServer);
                    }

                }

                objResponse.RequestSuccessfull = true;
                objResponse.Response = "";
                return objResponse;

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }

        }


        private Broker.BrokerResponse removeServer(Broker.BrokerRequest paramRequest)
        {
            try
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                
                string serverID = "";
                try
                {
                
                    serverID = @paramRequest.Parameters.Where(x => x.ParamName.Contains("serverID")).FirstOrDefault().ParamValue;
                }
                catch (Exception ex)
                {
                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e serverID/ " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }

                WitsmlServer objServer = new WitsmlServer();
                serverManager.removeServer(ref paramRequest.objDataService, serverID);

                //foreach (var objParameter in paramRequest.Parameters)
                //{

                //    if (objParameter.ParamName == "Remove")
                //    {
                //        WitsmlServer objServer = new WitsmlServer();
                //        objServer = JsonConvert.DeserializeObject<WitsmlServer>(objParameter.ParamValue);
                //        serverManager.removeServer(ref paramRequest.objDataService, serverID);
                //    }

                //}

                objResponse.RequestSuccessfull = true;
                objResponse.Response = "";
                return objResponse;

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;
            }

        }

    }//class
}//namespace
