using eVuMax.DataBroker.Broker;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;
using eVuMax.DataBroker.DataServiceManager.KPI;
namespace eVuMax.DataBroker.DataServiceManager.KPI
{
    public class CustomTagMaster
    {

        public static customTagTreeNode generateTree(ref DataService objDataService, string paramSourceID)
        {
            try
            {

                string SourceID = paramSourceID;

                customTagTreeNode objRootNode = new customTagTreeNode();
                objRootNode.NodeType = customTagTreeNode.customTagTreeNodeType.Master;
                objRootNode.text = "Master Entries";
                objRootNode.nodeID = "Root";
                objRootNode.id = "Root";
                

                DataTable objData = objDataService.getTable("SELECT * FROM VMX_CUSTOM_TAG_CATEGORY_MASTER WHERE SOURCE_ID='" + SourceID + "' ORDER BY CATEGORY_NAME");
                
                foreach (DataRow objRow in objData.Rows)
                {

                    string CategoryID = DataService.checkNull(objRow["TAG_CATEGORY_ID"], "").ToString();
                    string CategoryName = DataService.checkNull(objRow["CATEGORY_NAME"], "").ToString();

                    var objCategoryNode = new customTagTreeNode();
                    objCategoryNode.NodeType = customTagTreeNode.customTagTreeNodeType.Category;
                    objCategoryNode.CategoryID = CategoryID;
                    objCategoryNode.imageUrl = "";
                    objCategoryNode.text = "Category: " + CategoryName;
                    objCategoryNode.nodeID = objCategoryNode.CategoryID + objCategoryNode.SubCategoryID + objCategoryNode.ActivityID;



                    objCategoryNode.objCustomTag = clsCustomTagCategory.load(ref objDataService, objCategoryNode.CategoryID, SourceID);


                    DataTable objSubCategoryData = objDataService.getTable("SELECT * FROM VMX_CUSTOM_TAG_SUB_CATEGORY_MASTER WHERE TAG_CATEGORY_ID='" + CategoryID + "' AND SOURCE_ID='" + SourceID + "'  ORDER BY SUB_CATEGORY_NAME");

                    foreach (DataRow objSubCategoryRow in objSubCategoryData.Rows)
                    {

                        string SubCategoryID = DataService.checkNull(objSubCategoryRow["TAG_SUB_CATEGORY_ID"], "").ToString();
                        string SubCategoryName = DataService.checkNull(objSubCategoryRow["SUB_CATEGORY_NAME"], "").ToString();

                        var objSubCategoryNode = new customTagTreeNode();
                        objSubCategoryNode.NodeType = customTagTreeNode.customTagTreeNodeType.SubCategory;
                        objSubCategoryNode.CategoryID = CategoryID;
                        objSubCategoryNode.SubCategoryID = SubCategoryID;
                        objSubCategoryNode.text = "Sub Category: " + SubCategoryName;
                        objSubCategoryNode.imageUrl = "";
                        objSubCategoryNode.nodeID = objSubCategoryNode.CategoryID + objSubCategoryNode.SubCategoryID + objSubCategoryNode.ActivityID;

                        string LastError = "";
                        objSubCategoryNode.objCustomTag = objCategoryNode.objCustomTag;
                        objSubCategoryNode.objSubCategory = clsCustomTagSubCategory.load(ref objDataService, objSubCategoryNode.CategoryID, objSubCategoryNode.SubCategoryID, paramSourceID, ref LastError);


                        DataTable objActivityData = objDataService.getTable("SELECT * FROM VMX_CUSTOM_TAG_ACTIVITY_MASTER WHERE TAG_CATEGORY_ID='" + CategoryID + "' AND TAG_SUB_CATEGORY_ID='" + SubCategoryID + "' AND SOURCE_ID='" + SourceID + "' ORDER BY ACTIVITY_NAME");

                        //pending
                        foreach (DataRow objActivityRow in objActivityData.Rows)
                        {

                            string ActivityID = DataService.checkNull(objActivityRow["TAG_ACTIVITY_ID"], "").ToString();
                            string ActivityName = DataService.checkNull(objActivityRow["ACTIVITY_NAME"], "").ToString();

                            var objActivityNode = new customTagTreeNode();
                            objActivityNode.NodeType = customTagTreeNode.customTagTreeNodeType.Activity;
                            objActivityNode.CategoryID = CategoryID;
                            objActivityNode.SubCategoryID = SubCategoryID;
                            objActivityNode.ActivityID = ActivityID;
                            objActivityNode.text = "Activity: " + ActivityName;
                            objActivityNode.imageUrl ="";
                            objActivityNode.nodeID = objActivityNode.CategoryID + objActivityNode.SubCategoryID + objActivityNode.ActivityID;


                            objActivityNode.objCustomTag = objCategoryNode.objCustomTag;
                            objActivityNode.objSubCategory = objSubCategoryNode.objSubCategory;
                            objActivityNode.objActivity = clsCustomTagActivity.load(ref objDataService, objActivityNode.CategoryID, objActivityNode.SubCategoryID, objActivityNode.ActivityID, paramSourceID);

                            objSubCategoryNode.items.Add(objActivityNode);

                        }

                        objCategoryNode.items.Add(objSubCategoryNode);  

                    }

                    objRootNode.items.Add(objCategoryNode);

                    
                }

                return objRootNode;
            }

            catch (Exception ex)
            {
                return new customTagTreeNode();
            }
        }

        static public DataTable loadCustomTagSourceList(ref DataService objDataService)
        {
            try
            {
                DataTable objData = new DataTable();
                objData = objDataService.getTable("SELECT SOURCE_ID, SOURCE_NAME FROM [VMX_TAG_SOURCES] ORDER BY SOURCE_NAME");
                return objData;
            }
            catch (Exception ex)
            {

                return new DataTable();
            }
        }


        #region CustomTag

        

        static public Broker.BrokerResponse AddCategory(ref DataService objDataService, BrokerRequest paramRequest, clsCustomTagCategory objCustomTag){
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                string LastError = "";
                objCustomTag.SourceID = Common.ObjectIDFactory.getObjectID();
                if (clsCustomTagCategory.add(ref objDataService, objCustomTag, ref LastError))
                {
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = "";
                    objResponse.Warnings = "";
                    return objResponse;
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Response = "Couldn't save the data to the database. Following error was returned ";
                    objResponse.Warnings = "Couldn't save the data to the database. Following error was returned " + LastError; 
                    return objResponse;
                }


               
            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Response = "Error";
                objResponse.Warnings = "Couldn't save the data to the database. Following error was returned " + ex.Message + ex.StackTrace;
                return objResponse;

            }
        }


        static public Broker.BrokerResponse EditCategory(ref DataService objDataService, BrokerRequest paramRequest, clsCustomTagCategory objCustomTag)
        {
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                string LastError = "";
                if (clsCustomTagCategory.update(ref objDataService, objCustomTag, ref LastError))
                {
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = "";
                    objResponse.Warnings = "";
                    return objResponse;
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Response = "Couldn't Update the data to the database. Following error was returned";
                    objResponse.Warnings = "Couldn't Ypdate the data to the database. Following error was returned " + LastError;
                    return objResponse;
                }



            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Response = "Error";
                objResponse.Warnings = "Couldn't Update the data to the database. Following error was returned " + ex.Message + ex.StackTrace;
                return objResponse;

            }
        }


        static public Broker.BrokerResponse RemoveCategory(ref DataService objDataService, BrokerRequest paramRequest, clsCustomTagCategory objCustomTag)
        {
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                string LastError = "";
                
                if (clsCustomTagCategory.remove(ref objDataService, objCustomTag.TagCategoryId, objCustomTag.SourceID, ref LastError))
                {
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = "";
                    objResponse.Warnings = "";
                    return objResponse;
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Response = "Couldn't Update the data to the database. Following error was returned";
                    objResponse.Warnings = "Couldn't Ypdate the data to the database. Following error was returned " + LastError;
                    return objResponse;
                }



            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Response = "Error";
                objResponse.Warnings = "Couldn't Update the data to the database. Following error was returned " + ex.Message + ex.StackTrace;
                return objResponse;

            }
        }


        #endregion


    }//Class
}//NameSpace
