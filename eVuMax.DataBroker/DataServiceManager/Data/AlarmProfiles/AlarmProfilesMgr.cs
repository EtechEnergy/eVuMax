using eVuMax.DataBroker.Broker;
using System;
using System.Data;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.DataServiceManager
{
  public  class AlarmProfilesMgr : IBroker
    {
        
        public string loadAlarmProfiles = "loadAlarmProfiles";
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

                //objRow["CREATEDDATE"] = createdDate.ToLocalTime().ToString("MMM-dd-yyyy HH:mm:ss"); //21-10-2021 prath
                //objRow["MODIFIEDDATE"] = modifiedDate.ToLocalTime().ToString("MMM-dd-yyyy HH:mm:ss");

                objRow["CREATEDDATE"] = createdDate.ToString("MMM-dd-yyyy HH:mm:ss"); //21-10-2021 prath
                objRow["MODIFIEDDATE"] = modifiedDate.ToString("MMM-dd-yyyy HH:mm:ss");





            }

            return objData;
        }

    }


}
