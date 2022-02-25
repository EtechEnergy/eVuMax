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

        


        public bool LoadBroomStickUserSettings(ref DataService paramObjDataService, string paramWellID, int paramDocType, string paramUserID)
        {
            try
            {
                objDataService = paramObjDataService;
                WellID = paramWellID;
                UserID = paramUserID;
                DocType = (enumDocType_)paramDocType;

                DataTable objData = new DataTable();
                

                objData =  objDataService.getTable("SELECT * eVuMaxBroomStickDocs WHERE WELL_ID='" + paramWellID + "'  AND DOC_TYPE='" + paramDocType + "' AND USER_ID='" + paramUserID + "'");

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


        public bool Insert(ref DataService paramObjDataService)
        {
            try
            {

                objDataService = paramObjDataService;
                DocID = ObjectIDFactory.getObjectID();
                string strSQL= "";
                strSQL = "INSERT INTO eVuMaxBroomStickDocs ([DOC_ID] ,[WELL_ID],[USER_ID],[DOC_TYPE],[DOC_NAME]  ,[SETUP] ,[TIME_FILTER])  VALUES(";
                strSQL += " '" + DocID + "',";
                strSQL += "'" + WellID + "',";
                strSQL += "'" + UserID + "',";
                strSQL += "" + DocType + ",";
                strSQL += "'" + DocName + "',";
                strSQL += "'" + JsonConvert.SerializeObject(objSetup) + "'";

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
                
                string strSQL = "";

                strSQL = "UPDATE eVuMaxBroomStickDocs SET ";
                strSQL += "DOC_TYPE = '" + DocType + "',";
                strSQL += "DOC_NAME= '" + DocName + "',";
                strSQL += "SETUP =  '" + JsonConvert.SerializeObject(objSetup) + "'";
                strSQL += " WHERE DOC_ID='" + DocID + "'";


                objDataService.executeNonQuery(strSQL);


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
