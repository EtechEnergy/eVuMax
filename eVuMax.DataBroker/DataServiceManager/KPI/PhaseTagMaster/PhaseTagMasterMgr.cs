using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager.KPI
{
    public class PhaseTagMasterMgr : IBroker
    {

        const string loadPhaseTree = "loadPhaseTree";
        const string addPhase = "addPhase";
        const string editPhase = "editPhase";
        const string removePhase = "removePhase";

        const string addSteps = "addSteps";
        const string editSteps = "editSteps";
        const string removeSteps = "removeSteps";

        const string addEmph = "addEmph";
        const string editEmph = "editEmph";
        const string removeEmph = "removeEmph";




        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == loadPhaseTree)
                {
                   PhaseTreeNode objTree =  PhaseTagMaster.LoadPhaseMasterTree(ref paramRequest.objDataService);
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objTree);
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

                if (paramRequest.Function == addPhase)
                {

                    string userID = "";
                    string strObjPhase = "";
                    clsPhase objPhase = new clsPhase();
                    


                  //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjPhase = paramRequest.Parameters.Where(x => x.ParamName.Contains("objPhase")).FirstOrDefault().ParamValue.ToString();

                    if (strObjPhase != "")
                    {
                        try
                        {
                            objPhase = JsonConvert.DeserializeObject<clsPhase>(strObjPhase);
                            string lastError = "";
                            objPhase.PhaseID = eVuMax.DataBroker.Common.ObjectIDFactory.getObjectID();
                            clsPhase.add(ref paramRequest.objDataService, objPhase, ref lastError);
                            
                            

                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error adding Phase: " + lastError;
                                objResponse.Response = "";
                                return objResponse;
                            }


                            objResponse.RequestSuccessfull = true;
                            objResponse.Response = "";
                            return objResponse;

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

                }



                if (paramRequest.Function == editPhase)
                {
                    string userID = "";
                    string strObjPhase = "";
                    clsPhase objPhase = new clsPhase();



                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjPhase = paramRequest.Parameters.Where(x => x.ParamName.Contains("objPhase")).FirstOrDefault().ParamValue.ToString();

                    if (strObjPhase != "")
                    {
                        try
                        {
                            objPhase = JsonConvert.DeserializeObject<clsPhase>(strObjPhase);
                            string lastError = "";
                            clsPhase.update(ref paramRequest.objDataService, objPhase, ref lastError);
                            


                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error updating Phase: " + lastError;
                                objResponse.Response = "";
                                return objResponse;
                            }


                            objResponse.RequestSuccessfull = true;
                            objResponse.Response = "";
                            return objResponse;

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
                }




                if (paramRequest.Function == removePhase)
                {
                    string userID = "";
                    string strObjPhase = "";
                    clsPhase objPhase = new clsPhase();



                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjPhase = paramRequest.Parameters.Where(x => x.ParamName.Contains("objPhase")).FirstOrDefault().ParamValue.ToString();

                    if (strObjPhase != "")
                    {
                        try
                        {
                            objPhase = JsonConvert.DeserializeObject<clsPhase>(strObjPhase);
                            string lastError = "";
                            clsPhase.remove(ref paramRequest.objDataService, objPhase.PhaseID, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error updating Phase: " + lastError;
                                objResponse.Response = "";
                                return objResponse;
                            }


                            objResponse.RequestSuccessfull = true;
                            objResponse.Response = "";
                            return objResponse;

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
                }






                #region Steps
                if (paramRequest.Function == addSteps)
                {

                    string userID = "";
                    string strObjStep = "";
                    clsStep objStep = new clsStep();



                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjStep = paramRequest.Parameters.Where(x => x.ParamName.Contains("objStep")).FirstOrDefault().ParamValue.ToString();

                    if (strObjStep != "")
                    {
                        try
                        {
                            objStep = JsonConvert.DeserializeObject<clsStep>(strObjStep);
                            string lastError = "";
                            objStep.StepID = eVuMax.DataBroker.Common.ObjectIDFactory.getObjectID();
                            clsStep.add(ref paramRequest.objDataService, objStep, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error adding Step: " + lastError;
                                objResponse.Response = "";
                                return objResponse;
                            }


                            objResponse.RequestSuccessfull = true;
                            objResponse.Response = "";
                            return objResponse;

                        }
                        catch (Exception ex)
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = false;
                            objResponse.Warnings = "Error DeserializeObject objStep";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }

                }


                #endregion




                objResponse.RequestSuccessfull = true;
                        objResponse.Response = "";
                        return objResponse;
                    } 
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Warnings = ex.Message;
                objResponse.Response = ex.Message + " " + ex.StackTrace;
                return objResponse; 
            }
        }
    }
}
