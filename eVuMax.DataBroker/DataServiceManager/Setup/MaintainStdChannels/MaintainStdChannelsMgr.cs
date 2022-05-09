using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager
{
    public class MaintainStdChannelsMgr : IBroker
    {

        const string loadStdChannels = "loadStdChannels";
        const string saveStdChannel = "saveStdChannel";
        const string removeStdChannel = "removeStdChannel";

        const string generateMMStandardChannels = "generateMMStandardChannels";
        const string generateMMAllChannels = "generateMMAllChannels";
        const string loadMappingGrid = "loadMappingGrid";

        const string addMapping = "addMapping";
        const string removeMapping = "removeMapping";


        public  BrokerResponse getData(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();


            if (paramRequest.Function == loadStdChannels)
            {
                eMaintainStdChannels objStdChannels = new eMaintainStdChannels(ref paramRequest.objDataService);
                DataTable objStdChannesList = objStdChannels.loadStdChannels();

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objStdChannesList);
                return objResponse;
            }


            if (paramRequest.Function == generateMMStandardChannels)
            {
                eMaintainStdChannels objStdChannels = new eMaintainStdChannels(ref paramRequest.objDataService);

                string LogType = paramRequest.Parameters.Where(x => x.ParamName.Contains("LogType")).FirstOrDefault().ParamValue;
                DataTable objStdChannesList = objStdChannels.generateMMStandardChannels(LogType);

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objStdChannesList);
                return objResponse;
            }

            if (paramRequest.Function == generateMMAllChannels)
            {
                eMaintainStdChannels objStdChannels = new eMaintainStdChannels(ref paramRequest.objDataService);

                
                DataTable objAllChannesList = objStdChannels.generateMMAllChannels();

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objAllChannesList);
                return objResponse;
            }

            if (paramRequest.Function == loadMappingGrid)
            {
                eMaintainStdChannels objStdChannels = new eMaintainStdChannels(ref paramRequest.objDataService);

                string Mnemonic = paramRequest.Parameters.Where(x => x.ParamName.Contains("Mnemonic")).FirstOrDefault().ParamValue;
                DataTable objAllChannesList = objStdChannels.loadMappingGrid(Mnemonic);

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objAllChannesList);
                return objResponse;
            }

        

            

            throw new NotImplementedException();
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();


            if (paramRequest.Function == saveStdChannel)
            {
                string EditMode = paramRequest.Parameters.Where(x => x.ParamName.Contains("EditMode")).FirstOrDefault().ParamValue;

                if (EditMode == "A")
                {
                    objResponse = this.addStdChannel(paramRequest);
                    return objResponse;
                }

                if (EditMode == "E")
                {
                    objResponse = this.updateStdChannel(paramRequest);
                    return objResponse;
                }

                objResponse.RequestSuccessfull = true;
                return objResponse;
            }





            if (paramRequest.Function == removeStdChannel)
            {
                string StdChannel = paramRequest.Parameters.Where(x => x.ParamName.Contains("StdChannel")).FirstOrDefault().ParamValue;
                string LogType = paramRequest.Parameters.Where(x => x.ParamName.Contains("LogType")).FirstOrDefault().ParamValue;



                eMaintainStdChannels objStdChannels = new eMaintainStdChannels(ref paramRequest.objDataService);

                
                if (objStdChannels.removeStdChannels(StdChannel, LogType))
                {

                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;

                }
                else
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving user settings " + objStdChannels.LastError;
                    return objBadResponse;

                }

                return objResponse;
                

                objResponse.RequestSuccessfull = true;
                return objResponse;
            }


            if (paramRequest.Function == addMapping)
            {
                eMaintainStdChannels objStdChannels = new eMaintainStdChannels(ref paramRequest.objDataService);

                string Mnemonic = paramRequest.Parameters.Where(x => x.ParamName.Contains("Mnemonic")).FirstOrDefault().ParamValue;
                string SourceMnemonic = paramRequest.Parameters.Where(x => x.ParamName.Contains("SourceMnemonic")).FirstOrDefault().ParamValue;

                if (objStdChannels.addMapping(Mnemonic, SourceMnemonic))
                {

                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;

                }
                else
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving user settings " + objStdChannels.LastError;
                    return objBadResponse;

                }

            }

            if (paramRequest.Function == removeMapping)
            {
                string MnemonicId = paramRequest.Parameters.Where(x => x.ParamName.Contains("MnemonicId")).FirstOrDefault().ParamValue;

                eMaintainStdChannels objStdChannels = new eMaintainStdChannels(ref paramRequest.objDataService);


                if (objStdChannels.removeMapping(MnemonicId))
                {

                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;

                }
                else
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving user settings " + objStdChannels.LastError;
                    return objBadResponse;

                }

                return objResponse;


                objResponse.RequestSuccessfull = true;
                return objResponse;
            }
            return objResponse;
            
        }

        public BrokerResponse addStdChannel(BrokerRequest paramRequest)
        {
            try
            {
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string strStdChannel = paramRequest.Parameters.Where(x => x.ParamName.Contains("objStdChannel")).FirstOrDefault().ParamValue;

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                eMaintainStdChannels objStdChannel = JsonConvert.DeserializeObject<eMaintainStdChannels>(strStdChannel);

                eMaintainStdChannels objStdChannels = new eMaintainStdChannels(ref paramRequest.objDataService);
                if (objStdChannels.addStdChannels(ref objStdChannel))
                {

                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;

                }
                else
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving user settings " + objStdChannels.LastError;
                    return objBadResponse;

                }
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving user settings " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        public BrokerResponse updateStdChannel(BrokerRequest paramRequest)
        {
            try
            {
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string strStdChannel = paramRequest.Parameters.Where(x => x.ParamName.Contains("objStdChannel")).FirstOrDefault().ParamValue;

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                eMaintainStdChannels objStdChannel = JsonConvert.DeserializeObject<eMaintainStdChannels>(strStdChannel);

                eMaintainStdChannels objStdChannels = new eMaintainStdChannels(ref paramRequest.objDataService);
                if (objStdChannels.editStdChannels(ref objStdChannel))
                {

                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;

                }
                else
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving user settings " + objStdChannels.LastError;
                    return objBadResponse;

                }
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving user settings " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

    }
}
