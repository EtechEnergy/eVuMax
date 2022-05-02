using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using VuMaxDR.Data.Objects;
using eVuMax.DataBroker.Common;


namespace eVuMax.DataBroker.DataServiceManager
{
    public class QCRulesMgr : IBroker
    {
        const string loadQCRules = "loadQCRules";
        const string saveQCRule = "saveQCRule";
        
        const string removeQCRule = "removeQCRule";

        const string getRuleTypeList = "getRuleTypeList";
        const string getSTDChannelList = "getSTDChannelList";

        const string getRuleType_STDChannelList = "getRuleType_STDChannelList";



        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();


            if (paramRequest.Function == loadQCRules)
            {
                eQCRules objQCRules = new eQCRules(ref paramRequest.objDataService);
                Dictionary<string, QCRule> QCRulesList = objQCRules.getRuleList();

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(QCRulesList);
                return objResponse;

            }

            if (paramRequest.Function == getRuleTypeList)
            {
                eQCRules objQCRules = new eQCRules(ref paramRequest.objDataService);
                DataTable RuleTypeList = objQCRules.getRuleTypeList();

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(RuleTypeList);
                return objResponse;

            }


            if (paramRequest.Function == getSTDChannelList)
            {
                eQCRules objQCRules = new eQCRules(ref paramRequest.objDataService);
                DataTable STDChannelList = objQCRules.getSTDChannelList();

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(STDChannelList);
                return objResponse;
            }


            if (paramRequest.Function == getRuleType_STDChannelList) //new
            {
                List<DataTable> objList = new List<DataTable>();

                eQCRules objQCRules = new eQCRules(ref paramRequest.objDataService);
                objList.Add(objQCRules.getRuleTypeList());
                objList.Add(objQCRules.getSTDChannelList());

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objList);
                return objResponse;
            }


            return objResponse;
        }



        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            //throw new NotImplementedException();

            try
            {
                if (paramRequest.Function == saveQCRule)
                {

                    string EditMode = paramRequest.Parameters.Where(x => x.ParamName.Contains("EditMode")).FirstOrDefault().ParamValue;

                    if (EditMode == "A")
                    {
                        BrokerResponse objResponse = this.addQCRule(paramRequest);
                        return objResponse;
                    }

                    if (EditMode == "E")
                    {
                        BrokerResponse objResponse = this.updateQCRule(paramRequest);
                        return objResponse;
                    }

                }

                if (paramRequest.Function == removeQCRule)
                {
                    BrokerResponse objResponse = this.removeQCRule_(paramRequest);
                    return objResponse;
                }
                return paramRequest.createResponseObject();

            }
            catch (Exception)
            {
                return paramRequest.createResponseObject();

            }
        }

        public Broker.BrokerResponse addQCRule(Broker.BrokerRequest paramRequest)
        {
            try
            {
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string strRule = paramRequest.Parameters.Where(x => x.ParamName.Contains("objRule")).FirstOrDefault().ParamValue;
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    QCRule objQCRule = JsonConvert.DeserializeObject<QCRule>(strRule);
                    eQCRules objQCRules = new eQCRules(ref paramRequest.objDataService);
                
                    objQCRule.RuleID = eVuMax.DataBroker.Common.ObjectIDFactory.getObjectID();

                if (objQCRules.addRule(objQCRule))
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
                        objBadResponse.Errors = "Error saving user settings " + objQCRules.LastError;
                        return objBadResponse;

                    }
              


                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving user settings " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }



        public Broker.BrokerResponse updateQCRule(Broker.BrokerRequest paramRequest)
        {
            try
            {
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string strRule = paramRequest.Parameters.Where(x => x.ParamName.Contains("objRule")).FirstOrDefault().ParamValue;
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                QCRule objQCRule = JsonConvert.DeserializeObject<QCRule>(strRule);
                eQCRules objQCRules = new eQCRules(ref paramRequest.objDataService);

                string LastError = "";

                if (objQCRules.updateRule(objQCRule,ref LastError))
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
                    objBadResponse.Errors = "Error saving user settings " + objQCRules.LastError;
                    return objBadResponse;

                }



                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving user settings " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        public Broker.BrokerResponse removeQCRule_ (Broker.BrokerRequest paramRequest)
        {
            try
            {
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;

                //                string strRule = paramRequest.Parameters.Where(x => x.ParamName.Contains("objRule")).FirstOrDefault().ParamValue;
                string RuleID = paramRequest.Parameters.Where(x => x.ParamName.Contains("RuleID")).FirstOrDefault().ParamValue;
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                //QCRule objQCRule = JsonConvert.DeserializeObject<QCRule>(strRule);
                eQCRules objQCRules = new eQCRules(ref paramRequest.objDataService);
                string LastError = "";
                if (objQCRules.removeRule(RuleID, ref LastError))
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
                    objBadResponse.Errors = "Error saving user settings " + objQCRules.LastError;
                    return objBadResponse;
                }
               
                return objResponse;
            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving user settings " + ex.StackTrace;
                return objBadResponse;
            }
        }
    }    
}
