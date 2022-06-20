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
        public string editAlarmProfile = "editAlarmProfile";
        public string removeAlarmProfile = "removeAlarmProfile";
        public string saveAlarmProfile = "saveAlarmProfile";
        public string loadFromLibrary = "loadFromLibrary";
        public string lstContainersClick = "lstContainersClick";

        public string loadAlarmDesignerCombo = "loadAlarmDesignerCombo";

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



            if (paramRequest.Function == loadFromLibrary)
            {
                //DataTable objData = this.loadAlarmProfilesList(paramRequest);
                Dictionary<string, APContainer> list = AlarmLibrary.getLibraryList(ref paramRequest.objDataService);

                objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(list);

                objResponse.Errors = "";
                return objResponse;
            }

            if (paramRequest.Function == lstContainersClick)
            {
                
                Dictionary<string, APContainer> list = AlarmLibrary.getLibraryList(ref paramRequest.objDataService);

                string ChannelName = paramRequest.Parameters.Where(x => x.ParamName.Contains("ChannelName")).FirstOrDefault().ParamValue;
                string strInfo = "";

                foreach (var key in list.Keys)
                {
                    if (list[key].ContainerName == ChannelName)
                    {
                        APContainer objContainer = APContainer.loadContainer(ref paramRequest.objDataService, key);

                        foreach (APChannel objChannel in objContainer.channels.Values)
                        {
                            strInfo += "<p>" + objChannel.ChannelName;

                            if (objChannel.YellowUseBuilder)
                            {
                                strInfo += "<p>" +  "    Yellow State ::  " + VuMaxDR.Data.Objects.EzConditoinSet.parseXML(objChannel.YellowConditions).getVuMaxExpression().ToString();
                            }
                            else
                            {
                                strInfo += "<p>" + "    Yellow State ::  " + objChannel.YellowExpression;
                            }

                            if (objChannel.RedUseBuilder)
                            {
                                strInfo += "<p>" + "    Red State     ::  " + VuMaxDR.Data.Objects.EzConditoinSet.parseXML(objChannel.RedConditions).getVuMaxExpression();
                            }
                            else
                            {
                                strInfo += "<p>" + "    Red State     ::  " + objChannel.RedExpression;
                            }

                            strInfo += "<p>" ;

                        }

                     

                    }

                }

            

                    objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(strInfo);

                objResponse.Errors = "";
                return objResponse;
            }


            if (paramRequest.Function == loadAlarmDesignerCombo)
            {

                
                
                int LogType =  Convert.ToInt32(paramRequest.Parameters.Where(x => x.ParamName.Contains("logtype")).FirstOrDefault().ParamValue);
                bool isStdChannel = Convert.ToBoolean(paramRequest.Parameters.Where(x => x.ParamName.Contains("isStdChannel")).FirstOrDefault().ParamValue);

                APChannelData objData = new APChannelData();
                objData.getComboData(LogType, isStdChannel,  paramRequest.objDataService);

                
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

            if (paramRequest.Function == editAlarmProfile)
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

            if (paramRequest.Function == saveAlarmProfile)
            {
                try
                {
                    string PanelEditMode = paramRequest.Parameters.Where(x => x.ParamName.Contains("PanelEditMode")).FirstOrDefault().ParamValue;

                    string strObjPanel = paramRequest.Parameters.Where(x => x.ParamName.Contains("objPanel")).FirstOrDefault().ParamValue;

                    AlarmPanelProfile objPanel = JsonConvert.DeserializeObject<AlarmPanelProfile>(strObjPanel);

                    if (PanelEditMode == "A")
                    {

                        string LastError = "";
                        if (AlarmPanelProfile.addPanel(ref paramRequest.objDataService, objPanel, ref LastError))
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = true;
                            objResponse.Response = "";

                            objResponse.Errors = "";
                            return objResponse;
                        }
                        else
                        {
                            Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                            objBadResponse.RequestSuccessfull = false;
                            objBadResponse.Warnings = LastError;
                            objBadResponse.Errors = LastError;
                            return objBadResponse;
                        }
                    }

                    if (PanelEditMode == "E")
                    {
                        string LastError = "";

                        if (AlarmPanelProfile.updatePanel(ref paramRequest.objDataService, objPanel,ref LastError))
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = true;
                            objResponse.Response = "";

                            objResponse.Errors = "";
                            return objResponse;
                        }
                        else
                        {
                            Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                            objBadResponse.RequestSuccessfull = false;
                            objBadResponse.Warnings = LastError;
                            objBadResponse.Errors = LastError;
                            return objBadResponse;
                        }
                    }

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

            if (paramRequest.Function == removeAlarmProfile)
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
