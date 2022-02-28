using eVuMax.DataBroker.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.Broomstick.Document.BroomstickDocument
{
    public enum enumDocType_
    {
        BoomStickDocument =1,
        BroomStickTorqueDocument=2,
        HookloadDocument = 3,
        TorqueDocument=4,
        CombinedBroomStickDocument =5,
        CombineBroomStickTorqueDocument =6
    }
    public class BroomstickUserSettings
    {

        public string DocID = "";
        public enumDocType_ DocType = enumDocType_.BoomStickDocument;
        public BroomStickSetup objSetup = new BroomStickSetup();
        public globalTimeFilter objTimeFilter = new globalTimeFilter();
        public string UserID = "";
        public string WellID = "";
        public DataService objDataService;
        public string DocName = "";
        public string warning = "";
        public BroomStickProcessor objProcessor = new BroomStickProcessor();

        

        public string ProcessDocument()
        {
            try
            {
                objProcessor = new BroomStickProcessor(ref objDataService, WellID);


                //WIP
                //Need to confirm with Niti for below code
                switch (DocType)
                {
                    case enumDocType_.BoomStickDocument:
                        objProcessor.DocumentMode = enumDocumentMode.HookloadDocument;
                        break;
                    case enumDocType_.BroomStickTorqueDocument:
                        objProcessor.DocumentMode = enumDocumentMode.TorqueDocument;
                        break;
                    //case enumDocType_.HookloadDocument:
                    //    objProcessor.DocumentMode = enumDocumentMode.HookloadDocument;
                    //    break;
                    //case enumDocType_.TorqueDocument:
                    //    objProcessor.DocumentMode = enumDocumentMode.ConnectionTorque;
                    //    break;
                    //case enumDocType_.CombinedBroomStickDocument:
                    //    objProcessor.DocumentMode = enumDocumentMode.ConnectionHkld;
                    //    break;
                    //case enumDocType_.CombineBroomStickTorqueDocument:
                    //    objProcessor.DocumentMode = enumDocumentMode.ConnectionTorque;
                    //    break;
                    //default:
                    //    break;
                }
                objProcessor.ProcessPoints(objSetup);
                return Newtonsoft.Json.JsonConvert.SerializeObject(this);

            }
            catch (Exception)
            {

                return Newtonsoft.Json.JsonConvert.SerializeObject(this);
            }
        }
        public bool LoadBroomStickUserSettings(ref DataService paramObjDataService, string paramWellID, int paramDocType, string paramUserID)
        {
            try
            {
                objDataService = paramObjDataService;
                WellID = paramWellID;
                UserID = paramUserID;
                DocType = (enumDocType_)paramDocType;

                DataTable objData = new DataTable();
                

                objData =  objDataService.getTable("SELECT * FROM eVuMaxBroomStickDocs WHERE WELL_ID='" + paramWellID + "'  AND DOC_TYPE='" + paramDocType + "' AND USER_ID='" + paramUserID + "'");

                if( objData.Rows.Count > 0)
                {
                    WellID = paramWellID;
                    UserID = paramUserID;
                    DocID = DataService.checkNull(objData.Rows[0]["DOC_ID"], "").ToString();
                    DocType =(enumDocType_) DataService.checkNull(objData.Rows[0]["DOC_TYPE"],enumDocType_.BoomStickDocument);
                    DocName = DataService.checkNull(objData.Rows[0]["DOC_NAME"], "").ToString();

                    string strSetup = DataService.checkNull(objData.Rows[0]["SETUP"],"").ToString();
                    string strTimeFilter = DataService.checkNull(objData.Rows[0]["TIME_FILTER"], "").ToString();
                    if (strTimeFilter != "")
                    {
                        objTimeFilter= (globalTimeFilter)JsonConvert.DeserializeObject<globalTimeFilter>(strTimeFilter);
                    }
                    else
                    {
                        objTimeFilter = new globalTimeFilter();
                    }

                    if (strSetup != "")

                    {
                        objSetup = (BroomStickSetup)JsonConvert.DeserializeObject<BroomStickSetup>(strSetup);
                        
                    }
                    else
                    {
                        objSetup = new BroomStickSetup(ref objDataService);

                    }

                }
                else
                {
                    objSetup = new BroomStickSetup(ref objDataService);
                }

                return true;

                
            }
            catch (Exception ex)
            {
                warning = ex.Message + ex.StackTrace;
                return false;
                
            }
        }


        public bool LoadUserSettingsByDocID(ref DataService paramObjDataService, string paramDocID, string paramUserID)
        {
            try
            {
                objDataService = paramObjDataService;
           

                DataTable objData = new DataTable();


                objData = objDataService.getTable("SELECT * FROM eVuMaxBroomStickDocs WHERE DOC_ID='" + paramDocID + "' AND paramUserID='" + paramUserID + "'");

                if (objData.Rows.Count > 0)
                {
                    WellID = DataService.checkNull(objData.Rows[0]["WELL_ID"], "Null").ToString();
                    UserID = paramUserID;
                    DocID = DataService.checkNull(objData.Rows[0]["DOC_ID"], "").ToString();
                    DocType = (enumDocType_)DataService.checkNull(objData.Rows[0]["DOC_TYPE"], enumDocType_.BoomStickDocument);
                    DocName = DataService.checkNull(objData.Rows[0]["DOC_NAME"], "").ToString();

                    string strSetup = DataService.checkNull(objData.Rows[0]["SETUP"], "").ToString();
                    string strTimeFilter = DataService.checkNull(objData.Rows[0]["TIME_FILTER"], "").ToString();
                    if (strTimeFilter != "")
                    {
                        objTimeFilter = (globalTimeFilter)JsonConvert.DeserializeObject<globalTimeFilter>(strTimeFilter);
                    }
                    else
                    {
                        objTimeFilter = new globalTimeFilter();
                    }

                    if (strSetup != "")

                    {
                        objSetup = (BroomStickSetup)JsonConvert.DeserializeObject<BroomStickSetup>(strSetup);

                    }
                    else
                    {
                        objSetup = new BroomStickSetup(ref objDataService);

                    }

                }
                else
                {
                    objSetup = new BroomStickSetup(ref objDataService);
                }

                return true;


            }
            catch (Exception ex)
            {
                warning = ex.Message + ex.StackTrace;
                return false;

            }
        }

        public bool Insert(ref DataService paramObjDataService)
        {
            try
            {

                objDataService = paramObjDataService;
                DocID = ObjectIDFactory.getObjectID();
                if(DocName == "")
                {
                    DocName = DocType.ToString();
                }
                string strSQL= "";
                strSQL = "INSERT INTO eVuMaxBroomStickDocs ([DOC_ID] ,[WELL_ID],[USER_ID],[DOC_TYPE],[DOC_NAME]  ,[SETUP])  VALUES(";
                strSQL += " '" + DocID + "',";
                strSQL += "'" + WellID + "',";
                strSQL += "'" + UserID + "',";
                strSQL += "" + Convert.ToInt32(DocType) + ",";
                strSQL += "'" + DocName + "',";
                strSQL += "'" + JsonConvert.SerializeObject(objSetup) + "')";

                objDataService.executeNonQuery(strSQL);

                    
                    return true;
            }
            catch (Exception ex)
            {

                warning = ex.Message + ex.StackTrace;
                return false;
            }
        }

        public bool Update(ref DataService paramObjDataService)
        {
            try
            {

                
                objDataService = paramObjDataService;
                
                if(objDataService.IsRecordExist("SELECT * FROM eVuMaxBroomStickDocs WHERE DOC_ID ='" + this.DocID + "'"))
                {
                    string strSQL = "";



                    strSQL = "UPDATE eVuMaxBroomStickDocs SET ";
                    strSQL += "DOC_TYPE = '" + Convert.ToInt32(DocType) + "',";
                    strSQL += "DOC_NAME= '" + DocName + "',";
                    strSQL += "SETUP =  '" + JsonConvert.SerializeObject(objSetup) + "'";
                    strSQL += " WHERE DOC_ID='" + DocID + "'";


                    objDataService.executeNonQuery(strSQL);
                }
                else
                {
                    Insert(ref objDataService);
                }

                


                return true;
            }
            catch (Exception ex)
            {

                warning = ex.Message + ex.StackTrace;
                return false;
            }
        }

        public  bool Remove(ref DataService paramObjDataService, string paramDocID)
        {
            try
            {

                objDataService = paramObjDataService;

                string strSQL = "";
                strSQL = "DELETE FROM eVuMaxBroomStickDocs WHERE DOC_ID='" + paramDocID;
                objDataService.executeNonQuery(strSQL);
                return true;
            }
            catch (Exception ex)
            {

                warning = ex.Message + ex.StackTrace;
                return false;
            }
        }




    }//Class
}
