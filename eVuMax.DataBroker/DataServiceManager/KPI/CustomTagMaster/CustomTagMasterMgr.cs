using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Linq;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager.KPI
{
    public class CustomTagMasterMgr : IBroker
    {
        const string generateTree = "generateTree";
        const string addCategoryTag = "addCategoryTag";
        const string editCategoryTag = "editCategoryTag";
        const string removeCategoryTag = "removeCategoryTag";

        const string addSubCategoryTag = "addSubCategoryTag";
        const string editSubCategoryTag = "editSubCategoryTag";
        const string removeSubCategoryTag = "removeSubCategoryTag";

        const string addActivity = "addActivity";
        const string editActivity = "editActivity";
        const string removeActivity = "removeActivity";


        const string addSource = "addSource";
        const string editSource = "editSource";
        const string removeSource = "removeSource";
        




        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == generateTree)
                {
                    string SourceID = "";


                    try
                    {
                        SourceID = paramRequest.Parameters.Where(x => x.ParamName.Contains("SourceID")).FirstOrDefault().ParamValue.ToString();
                    }
                    catch (Exception ex)
                    {

                        SourceID = "";
                    }



                    customTagTreeNode objTree = CustomTagMaster.generateTree(ref paramRequest.objDataService, SourceID);
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

                if (paramRequest.Function == addCategoryTag)
                {

                    string userID = "";
                    string strObjCustomTag = "";
                    clsCustomTagCategory objCustomTag = new clsCustomTagCategory();



                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjCustomTag = paramRequest.Parameters.Where(x => x.ParamName.Contains("objCustomTag")).FirstOrDefault().ParamValue.ToString();

                    if (strObjCustomTag != "")
                    {
                        try
                        {
                            objCustomTag = JsonConvert.DeserializeObject<clsCustomTagCategory>(strObjCustomTag);
                            string lastError = "";
                            objCustomTag.TagCategoryId = eVuMax.DataBroker.Common.ObjectIDFactory.getObjectID();
                            clsCustomTagCategory.add(ref paramRequest.objDataService, objCustomTag, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error adding Custom Tag Category: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objCustomTag";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }

                }


                if (paramRequest.Function == editCategoryTag)
                {

                    
                    string strObjCustomTag = "";
                    clsCustomTagCategory objCustomTag = new clsCustomTagCategory();

                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjCustomTag = paramRequest.Parameters.Where(x => x.ParamName.Contains("objCustomTag")).FirstOrDefault().ParamValue.ToString();

                    if (strObjCustomTag != "")
                    {
                        try
                        {
                            objCustomTag = JsonConvert.DeserializeObject<clsCustomTagCategory>(strObjCustomTag);
                            string lastError = "";
                           
                            clsCustomTagCategory.update(ref paramRequest.objDataService, objCustomTag, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error editing Custom Tag Category: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objCustomTag";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }

                }


                if (paramRequest.Function == removeCategoryTag)
                {


                    string strObjCustomTag = "";
                    clsCustomTagCategory objCustomTag = new clsCustomTagCategory();

                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjCustomTag = paramRequest.Parameters.Where(x => x.ParamName.Contains("objCustomTag")).FirstOrDefault().ParamValue.ToString();

                    if (strObjCustomTag != "")
                    {
                        try
                        {
                            objCustomTag = JsonConvert.DeserializeObject<clsCustomTagCategory>(strObjCustomTag);
                            string lastError = "";

                            clsCustomTagCategory.remove(ref paramRequest.objDataService,objCustomTag.TagCategoryId, objCustomTag.SourceID, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error editing Custom Tag Category: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objCustomTag";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }

                }



                //addSubCategoryTag
                if (paramRequest.Function == addSubCategoryTag)
                {

                    string userID = "";
                    string strObjSubCustomTag = "";
                    clsCustomTagSubCategory objSubCustomTag = new clsCustomTagSubCategory();



                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjSubCustomTag = paramRequest.Parameters.Where(x => x.ParamName.Contains("objSubCustomTag")).FirstOrDefault().ParamValue.ToString();

                    if (strObjSubCustomTag != "")
                    {
                        try
                        {
                            objSubCustomTag = JsonConvert.DeserializeObject<clsCustomTagSubCategory>(strObjSubCustomTag);
                            string lastError = "";
                            objSubCustomTag.TagSubCategoryId = eVuMax.DataBroker.Common.ObjectIDFactory.getObjectID();
                            clsCustomTagSubCategory.add(ref paramRequest.objDataService, objSubCustomTag, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error adding Sub Custom Tag Category: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objSubCustomTag";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }

                }


                if (paramRequest.Function == editSubCategoryTag)
                {

                    string userID = "";
                    string strObjSubCustomTag = "";
                    clsCustomTagSubCategory objSubCustomTag = new clsCustomTagSubCategory();



                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjSubCustomTag = paramRequest.Parameters.Where(x => x.ParamName.Contains("objSubCustomTag")).FirstOrDefault().ParamValue.ToString();

                    if (strObjSubCustomTag != "")
                    {
                        try
                        {
                            objSubCustomTag = JsonConvert.DeserializeObject<clsCustomTagSubCategory>(strObjSubCustomTag);
                            string lastError = "";
                            //objSubCustomTag.TagSubCategoryId = eVuMax.DataBroker.Common.ObjectIDFactory.getObjectID();
                            clsCustomTagSubCategory.update(ref paramRequest.objDataService, objSubCustomTag, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error editing Sub Custom Tag Category: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objSubCustomTag";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }

                }




                if (paramRequest.Function == removeSubCategoryTag)
                {

                    string userID = "";
                    string strObjSubCustomTag = "";
                    clsCustomTagSubCategory objSubCustomTag = new clsCustomTagSubCategory();



                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjSubCustomTag = paramRequest.Parameters.Where(x => x.ParamName.Contains("objSubCustomTag")).FirstOrDefault().ParamValue.ToString();

                    if (strObjSubCustomTag != "")
                    {
                        try
                        {
                            objSubCustomTag = JsonConvert.DeserializeObject<clsCustomTagSubCategory>(strObjSubCustomTag);
                            string lastError = "";
                            //objSubCustomTag.TagSubCategoryId = eVuMax.DataBroker.Common.ObjectIDFactory.getObjectID();
                            clsCustomTagSubCategory.remove(ref paramRequest.objDataService,objSubCustomTag.TagCategoryId, objSubCustomTag.TagSubCategoryId, objSubCustomTag.SourceID, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error removing Sub Custom Tag Category: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objSubCustomTag";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }

                }



                #region ActivityTag

                if (paramRequest.Function == addActivity)
                {

                    string userID = "";
                    string color = "";
                    string strObjActivity = "";
                    clsCustomTagActivity objCustomTagActivity = new clsCustomTagActivity();



                    //color = paramRequest.Parameters.Where(x => x.ParamName.Contains("color")).FirstOrDefault().ParamValue.ToString();
                    strObjActivity = paramRequest.Parameters.Where(x => x.ParamName.Contains("objActivity")).FirstOrDefault().ParamValue.ToString();

                    if (strObjActivity != "")
                    {
                        try
                        {
                            objCustomTagActivity = JsonConvert.DeserializeObject<clsCustomTagActivity>(strObjActivity);
                            string lastError = "";
                            objCustomTagActivity.TagActivityId = Common.ObjectIDFactory.getObjectID();
                          //  objCustomTagActivity.Color = ColorTranslator.FromHtml(color);

                            clsCustomTagActivity.add(ref paramRequest.objDataService, objCustomTagActivity, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error adding Custom Activity Tag Category: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objActivity";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }

                }


                if (paramRequest.Function == editActivity)
                {

                    string userID = "";
                    string color = "";
                    string strObjActivity = "";
                    clsCustomTagActivity objCustomTagActivity = new clsCustomTagActivity();



                    //color = paramRequest.Parameters.Where(x => x.ParamName.Contains("color")).FirstOrDefault().ParamValue.ToString();
                    strObjActivity = paramRequest.Parameters.Where(x => x.ParamName.Contains("objActivity")).FirstOrDefault().ParamValue.ToString();

                    if (strObjActivity != "")
                    {
                        try
                        {
                            objCustomTagActivity = JsonConvert.DeserializeObject<clsCustomTagActivity>(strObjActivity);
                            string lastError = "";
                            

                            clsCustomTagActivity.update(ref paramRequest.objDataService, objCustomTagActivity, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error editing Custom Activity Tag Category: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objActivity";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }

                }



                if (paramRequest.Function == removeActivity)
                {

                    string userID = "";
                    string color = "";
                    string strObjActivity = "";
                    clsCustomTagActivity objCustomTagActivity = new clsCustomTagActivity();

                    //color = paramRequest.Parameters.Where(x => x.ParamName.Contains("color")).FirstOrDefault().ParamValue.ToString();
                    strObjActivity = paramRequest.Parameters.Where(x => x.ParamName.Contains("objActivity")).FirstOrDefault().ParamValue.ToString();

                    if (strObjActivity != "")
                    {
                        try
                        {
                            objCustomTagActivity = JsonConvert.DeserializeObject<clsCustomTagActivity>(strObjActivity);
                            string lastError = "";

                            clsCustomTagActivity.remove(ref paramRequest.objDataService, objCustomTagActivity.TagCategoryId, objCustomTagActivity.TagSubCategoryId, objCustomTagActivity.TagActivityId, objCustomTagActivity.SourceID, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error editing Custom Activity Tag Category: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objActivity";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }

                }



                #endregion

                #region SourceMaster

                if(paramRequest.Function == addSource)
                {

                    string userID = "";
                    string strObjTagSource = "";
                    clsTagSource objTagSource = new clsTagSource();




                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjTagSource = paramRequest.Parameters.Where(x => x.ParamName.Contains("objTagSource")).FirstOrDefault().ParamValue.ToString();

                    if (strObjTagSource != "")
                    {
                        try
                        {
                            objTagSource = JsonConvert.DeserializeObject<clsTagSource>(strObjTagSource);
                            string lastError = "";
                            objTagSource.SourceID = eVuMax.DataBroker.Common.ObjectIDFactory.getObjectID();
                            clsTagSource.add(ref paramRequest.objDataService, objTagSource, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error adding Tag Source: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objTagSource";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                }



                if (paramRequest.Function == editSource)
                {

                    string userID = "";
                    string strObjTagSource = "";
                    clsTagSource objTagSource = new clsTagSource();




                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjTagSource = paramRequest.Parameters.Where(x => x.ParamName.Contains("objTagSource")).FirstOrDefault().ParamValue.ToString();

                    if (strObjTagSource != "")
                    {
                        try
                        {
                            objTagSource = JsonConvert.DeserializeObject<clsTagSource>(strObjTagSource);
                            string lastError = "";
                            
                            clsTagSource.update(ref paramRequest.objDataService, objTagSource, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error removing Tag Source: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objTagSource";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                }


                if (paramRequest.Function == removeSource)
                {

                    string userID = "";
                    string strObjTagSource = "";
                    clsTagSource objTagSource = new clsTagSource();


                    
                    //  userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    strObjTagSource = paramRequest.Parameters.Where(x => x.ParamName.Contains("objTagSource")).FirstOrDefault().ParamValue.ToString();

                    if (strObjTagSource != "")
                    {
                        try
                        {
                            objTagSource = JsonConvert.DeserializeObject<clsTagSource>(strObjTagSource);
                            string lastError = "";

                            clsTagSource.remove(ref paramRequest.objDataService, objTagSource.SourceID, ref lastError);



                            if (lastError != "")
                            {
                                objResponse = paramRequest.createResponseObject();
                                objResponse.RequestSuccessfull = false;
                                objResponse.Warnings = "Error Removing Tag Source: " + lastError;
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
                            objResponse.Warnings = "Error DeserializeObject objTagSource";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                }



                #endregion

                return objResponse;
            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Warnings = "Error DeserializeObject objCustomTag";
                objResponse.Response = "";
                return objResponse;

            }
        }
    }
}
