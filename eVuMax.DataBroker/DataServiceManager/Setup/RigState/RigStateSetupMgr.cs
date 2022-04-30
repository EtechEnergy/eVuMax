using eVuMax.DataBroker.Broker;
using eVuMax.DataBroker.DataServiceManager.Setup.RigState;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DataServiceManager.Setup
{
    public class RigStateSetupMgr : IBroker
    {
        const string loadCommonRigStateSetup = "loadCommonRigStateSetup";
        const string saveCommonRigStateSetup = "saveCommonRigStateSetup";

        const string loadRigSpecificRigStateSetup = "loadRigSpecificRigStateSetup";
        const string saveRigSpecificRigStateSetup = "saveRigSpecificRigStateSetup";


        public eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try


            {
                BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == loadCommonRigStateSetup)
                {
                    VuMaxDR.Data.Objects.rigState objRigState = new VuMaxDR.Data.Objects.rigState();
                    objRigState = VuMaxDR.Data.Objects.rigState.loadCommonRigStateSetup(ref paramRequest.objDataService);

                   // RigState.eRigStateItem objItem = new RigState.eRigStateItem();
                    

                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objRigState);
                    return objResponse;

                }


                if (paramRequest.Function == loadRigSpecificRigStateSetup)
                {

                    string userID = "";
                    string RigID = "";
                  

                    try
                    {
                        RigID = paramRequest.Parameters.Where(x => x.ParamName.Contains("RigID")).FirstOrDefault().ParamValue.ToString();
                        userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                      
                    }
                    catch (Exception ex)
                    {


                    }

                    if (RigID == "")
                    {
                        objResponse = paramRequest.createResponseObject();
                        objResponse.RequestSuccessfull = false;
                        objResponse.Warnings = "RigName is Blank";
                        objResponse.Response = "";
                        return objResponse;
                    }


                    VuMaxDR.Data.Objects.rigState objRigState = new VuMaxDR.Data.Objects.rigState();
                    objRigState = VuMaxDR.Data.Objects.rigState.loadRigRigStateSetup(ref paramRequest.objDataService,RigID);

                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objRigState);
                    return objResponse;

                }

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

                if (paramRequest.Function == saveCommonRigStateSetup)
                {
                    VuMaxDR.Data.Objects.rigState objRigState = new VuMaxDR.Data.Objects.rigState();
                    Dictionary<int, eRigStateItem> objRigStateItems = new Dictionary<int, eRigStateItem>();

                    string userID = "";
                    string strObjRigStateSetup = "";
                    string strRigStateItems = "";
                    string strUnknownColor = "";


                    userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjRigStateSetup = paramRequest.Parameters.Where(x => x.ParamName.Contains("objRigStateSetup")).FirstOrDefault().ParamValue.ToString();
                    strRigStateItems = paramRequest.Parameters.Where(x => x.ParamName.Contains("objRigStateItems")).FirstOrDefault().ParamValue.ToString();
                    strUnknownColor = paramRequest.Parameters.Where(x => x.ParamName.Contains("UnknownColor")).FirstOrDefault().ParamValue.ToString();


                  
                    if (strObjRigStateSetup != "")
                    {
                        try
                        {
                            objRigState = JsonConvert.DeserializeObject<VuMaxDR.Data.Objects.rigState>(strObjRigStateSetup);
                            
                        }
                        catch (Exception ex)
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = false;
                            objResponse.Warnings = "Error DeserializeObject ObjRigState";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                    if (strUnknownColor != "")
                    {
                        try
                        {
                            objRigState.UnknownColor = ColorTranslator.FromHtml(strUnknownColor).ToArgb();

                        }
                        catch (Exception ex)
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = false;
                            objResponse.Warnings = "Error DeserializeObject ObjRigState";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                    if (strRigStateItems != "")
                    {
                        try
                        {
                            objRigStateItems = JsonConvert.DeserializeObject<Dictionary<int, eRigStateItem>>(strRigStateItems);

                        }
                        catch (Exception ex)
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = false;
                            objResponse.Warnings = "Error DeserializeObject objRigStateItems";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                    foreach (eRigStateItem objItem in objRigStateItems.Values)
                    {
                        foreach (VuMaxDR.Data.Objects.rigStateItem objItem1 in objRigState.rigStates.Values)
                        {

                            
                            if(objItem1.Number == objItem.Number)
                            {
                                objItem1.Color = ColorTranslator.FromHtml(objItem.Color).ToArgb();
                                break;
                            }
                            
                        }
                    }


                    string LastError = "";

                    if (VuMaxDR.Data.Objects.rigState.SaveCommonRigStateSetup(ref paramRequest.objDataService, objRigState, ref LastError))
                    {
                        objResponse.RequestSuccessfull = true;
                        objResponse.Response = JsonConvert.SerializeObject(objRigState);
                        return objResponse;
                    }
                    else
                    {
                        objResponse = paramRequest.createResponseObject();
                        objResponse.RequestSuccessfull = false;
                        objResponse.Warnings = LastError;
                        objResponse.Response = LastError;
                        return objResponse;
                    }

                    objResponse.RequestSuccessfull = true;
                        objResponse.Response = JsonConvert.SerializeObject(objRigState);
                        return objResponse;


                }



                if (paramRequest.Function == saveRigSpecificRigStateSetup)
                {
                    VuMaxDR.Data.Objects.rigState objRigState = new VuMaxDR.Data.Objects.rigState();
                    Dictionary<int, eRigStateItem> objRigStateItems = new Dictionary<int, eRigStateItem>();

                    string userID = "";
                    string strObjRigStateSetup = "";
                    string strRigStateItems = "";
                    string strUnknownColor = "";
                    string RigID = "";


                    try
                    {
                        userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                        strObjRigStateSetup = paramRequest.Parameters.Where(x => x.ParamName.Contains("objRigStateSetup")).FirstOrDefault().ParamValue.ToString();
                        strRigStateItems = paramRequest.Parameters.Where(x => x.ParamName.Contains("objRigStateItems")).FirstOrDefault().ParamValue.ToString();
                        strUnknownColor = paramRequest.Parameters.Where(x => x.ParamName.Contains("UnknownColor")).FirstOrDefault().ParamValue.ToString();
                        RigID = paramRequest.Parameters.Where(x => x.ParamName.Contains("RigID")).FirstOrDefault().ParamValue.ToString();
                    }
                    catch (Exception ex)
                    {
                        objResponse = paramRequest.createResponseObject();
                        objResponse.RequestSuccessfull = false;
                        objResponse.Warnings = "Error Parameters not Proper";
                        objResponse.Response = "";
                        return objResponse;


                    }



                    if (strObjRigStateSetup != "")
                    {
                        try
                        {
                            objRigState = JsonConvert.DeserializeObject<VuMaxDR.Data.Objects.rigState>(strObjRigStateSetup);

                        }
                        catch (Exception ex)
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = false;
                            objResponse.Warnings = "Error DeserializeObject ObjRigState";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                    if (strUnknownColor != "")
                    {
                        try
                        {
                            objRigState.UnknownColor = ColorTranslator.FromHtml(strUnknownColor).ToArgb();

                        }
                        catch (Exception ex)
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = false;
                            objResponse.Warnings = "Error DeserializeObject ObjRigState";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                    if (strRigStateItems != "")
                    {
                        try
                        {
                            objRigStateItems = JsonConvert.DeserializeObject<Dictionary<int, eRigStateItem>>(strRigStateItems);

                        }
                        catch (Exception ex)
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = false;
                            objResponse.Warnings = "Error DeserializeObject objRigStateItems";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                    foreach (eRigStateItem objItem in objRigStateItems.Values)
                    {
                        foreach (VuMaxDR.Data.Objects.rigStateItem objItem1 in objRigState.rigStates.Values)
                        {


                            if (objItem1.Number == objItem.Number)
                            {
                                objItem1.Color = ColorTranslator.FromHtml(objItem.Color).ToArgb();
                                break;
                            }

                        }
                    }


                    string LastError = "";

                    if (VuMaxDR.Data.Objects.rigState.SaveRigRigStateSetup(ref paramRequest.objDataService, RigID, objRigState, ref LastError))
                    {
                        objResponse.RequestSuccessfull = true;
                        objResponse.Response = JsonConvert.SerializeObject(objRigState);
                        return objResponse;
                    }
                    else
                    {
                        objResponse = paramRequest.createResponseObject();
                        objResponse.RequestSuccessfull = false;
                        objResponse.Warnings = LastError;
                        objResponse.Response = LastError;
                        return objResponse;
                    }

                    //VuMaxDR.Data.Objects.rigState objRigState = new VuMaxDR.Data.Objects.rigState();

                    //string userID = "";
                    //string RigID = "";
                    //string strObjRigStateSetup = "";

                    //try
                    //{
                    //    RigID = paramRequest.Parameters.Where(x => x.ParamName.Contains("RigID")).FirstOrDefault().ParamValue.ToString();
                    //    userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    //    strObjRigStateSetup = paramRequest.Parameters.Where(x => x.ParamName.Contains("objRigStateSetup")).FirstOrDefault().ParamValue.ToString();
                    //}
                    //catch (Exception ex)
                    //{


                    //}

                    //if (RigID == "")
                    //{
                    //    objResponse = paramRequest.createResponseObject();
                    //    objResponse.RequestSuccessfull = false;
                    //    objResponse.Warnings = "RigID is Blank";
                    //    objResponse.Response = "";
                    //    return objResponse;
                    //}

                    //if (strObjRigStateSetup != "")
                    //{
                    //    try
                    //    {
                    //        objRigState = JsonConvert.DeserializeObject<VuMaxDR.Data.Objects.rigState>(strObjRigStateSetup);

                    //    }
                    //    catch (Exception ex)
                    //    {
                    //        objResponse = paramRequest.createResponseObject();
                    //        objResponse.RequestSuccessfull = false;
                    //        objResponse.Warnings = "Error DeserializeObject ObjRigState";
                    //        objResponse.Response = "";
                    //        return objResponse;

                    //    }
                    //}



                    //string LastError = "";

                    //if (VuMaxDR.Data.Objects.rigState.SaveRigRigStateSetup(ref paramRequest.objDataService,RigID, objRigState, ref LastError))
                    //{
                    //    objResponse.RequestSuccessfull = true;
                    //    objResponse.Response = JsonConvert.SerializeObject(objRigState);
                    //    return objResponse;
                    //}
                    //else
                    //{
                    //    objResponse = paramRequest.createResponseObject();
                    //    objResponse.RequestSuccessfull = false;
                    //    objResponse.Warnings = LastError;
                    //    objResponse.Response = LastError;
                    //    return objResponse;
                    //}



                }

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
