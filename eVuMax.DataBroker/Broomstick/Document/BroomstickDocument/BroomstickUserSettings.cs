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


        //public bool Save(ref DataService paramObjDataService, string paramWellID)
        //{

        //}


        //public BroomStickProcessor processBroomStick()
        //{
        //    try
        //    {
        //        BroomStickProcessor objBroomStickProcessor = new BroomStickProcessor(ref objDataService, WellID);

        //        objBroomStickProcessor._fromDate =Convert.ToDateTime( objTimeFilter.FromDateTime);
        //        objBroomStickProcessor._toDate = Convert.ToDateTime(objTimeFilter.ToDateTime);
                


        //        objBroomStickProcessor._objSetup = objSetup;

        //        objBroomStickProcessor.ProcessPoints();


        //        return objBroomStickProcessor;
        //    }
        //    catch (Exception ex)
        //    {

        //        return null;
        //    }
        //}

    }//Class
}
