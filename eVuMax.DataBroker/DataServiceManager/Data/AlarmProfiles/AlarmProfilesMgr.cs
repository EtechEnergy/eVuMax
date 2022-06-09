using eVuMax.DataBroker.Broker;
using System;
using System.Data;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;


namespace eVuMax.DataBroker.DataServiceManager
{
  public  class AlarmProfilesMgr : IBroker
    {
        
        public string loadAlarmProfiles = "loadAlarmProfiles";
        public string addAlarmProfiles = "addAlarmProfiles";
        public string editAlarmProfiles = "editAlarmProfiles";
        public string removeAlarmProfiles = "removeAlarmProfiles";


        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();

            if (paramRequest.Function == loadAlarmProfiles)
            {
              DataTable objData =   this.loadAlarmProfilesList(paramRequest);

                objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objData);

                objResponse.Errors = "";
                return objResponse;
            }
            throw new NotImplementedException();
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            BrokerResponse objResponse = paramRequest.createResponseObject();

            if (paramRequest.Function == addAlarmProfiles)
            {
                

                objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = true;
                objResponse.Response = "";

                objResponse.Errors = "";
                return objResponse;
            }

            if (paramRequest.Function == editAlarmProfiles)
            {
                try
                {
                    string ProfileID = paramRequest.Parameters.Where(x => x.ParamName.Contains("ProfileID")).FirstOrDefault().ParamValue;

                    
                    AlarmPanelProfile objPanel = AlarmPanelProfile.loadProfile(ref paramRequest.objDataService, ProfileID);

                    

                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objPanel);

                    objResponse.Errors = "";
                    return objResponse;
                }
              catch (Exception ex)
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Warnings = "Error : " + ex.Message + ex.StackTrace;
                    objBadResponse.Errors = "Error : " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }
            }


            if (paramRequest.Function == removeAlarmProfiles)
            {
                try
                {
                    string ProfileID = paramRequest.Parameters.Where(x => x.ParamName.Contains("ProfileID")).FirstOrDefault().ParamValue;

                    AlarmPanelProfile.removeProfile(ref paramRequest.objDataService, ProfileID);

                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = "";
                    objResponse.Errors = "";
                    return objResponse;
                }
                catch (Exception ex)
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Warnings = "Error : " + ex.Message + ex.StackTrace;
                    objBadResponse.Errors = "Error : " + ex.Message + ex.StackTrace;
                    return objBadResponse;
                }
             
            }
            throw new NotImplementedException();
        }


        public DataTable loadAlarmProfilesList(BrokerRequest paramRequest)
        {
            string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
            string ProfileName = paramRequest.Parameters.Where(x => x.ParamName.Contains("ProfileName")).FirstOrDefault().ParamValue;
            string Notes = paramRequest.Parameters.Where(x => x.ParamName.Contains("Notes")).FirstOrDefault().ParamValue;

            string strSQL = "";
            string Condition = "";

            strSQL = "SELECT PROFILE_ID,PROFILE_NAME,NOTES,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE FROM VMX_ALARM_PANEL_PROFILE ";

            if (ProfileName != "")
            {
                Condition = "AND PROFILE_NAME LIKE '%" + ProfileName + "%' ";
            }

            if (Notes != "")
            {
                Condition = Condition + "AND NOTES LIKE '%" + Notes + "%' ";
            }


            if (!string.IsNullOrEmpty(Condition.Trim()))
            {
                Condition = Condition.Substring(4);
                strSQL = strSQL + " WHERE " + Condition;
            }

            strSQL = strSQL + " ORDER BY PROFILE_NAME";

            DataTable objData = paramRequest.objDataService.getTable(strSQL);

            objData.Columns.Add(new DataColumn("CREATEDDATE", typeof(System.String)));
            objData.Columns.Add(new DataColumn("MODIFIEDDATE", typeof(System.String)));


            foreach (DataRow objRow in objData.Rows)
            {

              


                DateTime createdDate = DateTime.Parse(DataService.checkNull(objRow["CREATED_DATE"], new DateTime()).ToString());
                DateTime modifiedDate = DateTime.Parse(DataService.checkNull(objRow["MODIFIED_DATE"], new DateTime()).ToString());

                objRow["CREATEDDATE"] = createdDate.ToString("MMM-dd-yyyy HH:mm:ss"); 
                objRow["MODIFIEDDATE"] = modifiedDate.ToString("MMM-dd-yyyy HH:mm:ss");





            }

            return objData;
        }

    }


}
