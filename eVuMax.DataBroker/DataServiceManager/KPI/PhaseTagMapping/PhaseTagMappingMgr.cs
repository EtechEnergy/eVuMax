using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DataServiceManager.KPI
{
    public class PhaseTagMappingMgr:IBroker
    {
        const string addMapping_ = "addMapping";
        const string removeMapping_ = "removeMapping";
        const string loadDrillingTagsList_ = "loadDrillingTagsList";
        const string loadCustomTagsList_ = "loadCustomTagsList";


        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == loadDrillingTagsList_)
                {

                    string VuMaxType = "";
                    try
                    {
                        VuMaxType = paramRequest.Parameters.Where(x => x.ParamName.Contains("VuMaxType")).FirstOrDefault().ParamValue.ToString();
                    }
                    catch (Exception)
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "VuMaxType parameter not found";
                        return objResponse;
                    }

                    DataTable objData = new DataTable();

                    objData = PhaseMapping.getDrillingTags(ref paramRequest.objDataService, VuMaxType);
                    if (objData != null)
                    {
                        objResponse.Response = JsonConvert.SerializeObject(objData);
                        objResponse.RequestSuccessfull = true;
                        objResponse.Errors = "";

                        return objResponse;
                    }
                    else
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "No Data Found";
                        objResponse.Warnings = "No Tags Found";
                        return objResponse;
                    }

                }

                if (paramRequest.Function == loadCustomTagsList_)
                {
                    string VuMaxType = "";
                    try
                    {
                        VuMaxType = paramRequest.Parameters.Where(x => x.ParamName.Contains("VuMaxType")).FirstOrDefault().ParamValue.ToString();
                    }
                    catch (Exception)
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "VuMaxType parameter not found";
                        return objResponse;
                    }

                    DataTable objData = new DataTable();

                    objData = PhaseMapping.getCustomDrillingTags(ref paramRequest.objDataService, VuMaxType);
                    if (objData != null)
                    {
                        objResponse.Response = JsonConvert.SerializeObject(objData);
                        objResponse.RequestSuccessfull = true;
                        objResponse.Errors = "";

                        return objResponse;
                    }
                    else
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "No Custom Tags Found";
                        objResponse.Warnings = "No Custom Tags Found";
                        return objResponse;
                    }

                }

                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Not a valid Function called";

                return objResponse;
            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Warnings = ex.Message;
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();


                if(paramRequest.Function == removeMapping_)
                {

                    int EntryID = 0;

                    try
                    {
                        EntryID = Convert.ToInt32( paramRequest.Parameters.Where(x => x.ParamName.Contains("EntryID")).FirstOrDefault().ParamValue.ToString());
                        
                    }
                    catch (Exception)
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "proper parameters not found";
                        return objResponse;
                    }
                    string lastError = "";
                    VuMaxDR.AdvKPI.PhaseMapping.removeMapping(paramRequest.objDataService, EntryID, ref lastError);

                    if(lastError!= "")
                    {
                        objResponse.Errors = lastError;
                        objResponse.RequestSuccessfull = false;
                        return objResponse;
                    }
                }
                
                if(paramRequest.Function == addMapping_)
                {
                    string lastError = "";


                    string VuMaxType, PhaseID, StepID, EmphID, TagSource = "";

                    try
                    {
                        VuMaxType = paramRequest.Parameters.Where(x => x.ParamName.Contains("VuMaxType")).FirstOrDefault().ParamValue.ToString();
                        PhaseID = paramRequest.Parameters.Where(x => x.ParamName.Contains("PhaseID")).FirstOrDefault().ParamValue.ToString();
                        StepID = paramRequest.Parameters.Where(x => x.ParamName.Contains("StepID")).FirstOrDefault().ParamValue.ToString();
                        EmphID = paramRequest.Parameters.Where(x => x.ParamName.Contains("EmphID")).FirstOrDefault().ParamValue.ToString();
                    }
                    catch (Exception)
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "proper parameters not found";
                        return objResponse;
                    }

                    VuMaxDR.AdvKPI.PhaseMapping.addMapping(paramRequest.objDataService, VuMaxType, PhaseID, StepID, EmphID, TagSource,ref lastError);
                    if (lastError != "")
                    {
                        objResponse.Errors = lastError;
                        objResponse.RequestSuccessfull = false;
                        return objResponse;
                    }
                }

                objResponse.RequestSuccessfull = true;
                objResponse.Errors = "";
                return objResponse;

            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Warnings = ex.Message;
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;


            }
        }
    }
}
