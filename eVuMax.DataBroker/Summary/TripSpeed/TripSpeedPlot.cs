using System;

using System.Linq;

using Newtonsoft.Json;
namespace eVuMax.DataBroker.Summary.TripSpeed
{
   
    public class TripSpeedPlot
    {
        const string tripSpeed1 = "TripSpeed1";
        const string tripSpeed2 = "TripSpeed2";
        //const string getUserSettingsTripSpeed1 = "getUserSettingsTripSpeed1";
        //const string getUserSettingsTripSpeed2 = "getUserSettingsTripSpeed2";

        const string SaveUserSettingsTripSpeed1 = "SaveUserSettingsTripSpeed1";
        const string SaveUserSettingsTripSpeed2 = "SaveUserSettingsTripSpeed2";

        TripSpeedData objTripSpeedData = new TripSpeedData();

        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Function == tripSpeed1)
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = loadTripSpeed1Data(paramRequest);

                    return objResponse;
                }
                if (paramRequest.Function == tripSpeed2)
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = loadTripSpeed2Data(paramRequest);

                    return objResponse;
                }


                //No matching function found ...
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Invalid Request Function. Use proper function name in the Broker Request";
                return objBadResponse;

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }

        public Broker.BrokerResponse performTask(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Function == SaveUserSettingsTripSpeed1)
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = saveUserSettingsTripSpeed1(paramRequest);

                    return objResponse;
                }

                if (paramRequest.Function == SaveUserSettingsTripSpeed2)
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = saveUserSettingsTripSpeed2(paramRequest);

                    return objResponse;
                }

                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                return paramRequest.createResponseObject();
            }
        }

        private Broker.BrokerResponse loadTripSpeed1Data(Broker.BrokerRequest paramRequest)
        {
            try
            {

                
                string paramWarnings = ""; //Nishant 22-10-2021

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;

                if (UserId == "" || wellId == "") {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Response ="UserId or WellId missing";
                    return objResponse;
                }

                //Check if time log exist, else return empty JSON
                if (!VuMaxDR.Data.Objects.Well.isTimeLogExist(ref paramRequest.objDataService, wellId))
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Response = "{}";
                    objBadResponse.Errors = "No time logs found in this well ";
                    return objBadResponse;

                }

                TripAnalyzer objTripAnalyzer = new TripAnalyzer(paramRequest.objDataService, wellId, UserId);
                
                objTripAnalyzer.processTripSpeed1Data(ref objTripSpeedData);
                paramWarnings = objTripAnalyzer.Warnings;//Nishant 22-10-2021;
                objTripSpeedData.objUserSettings = objTripAnalyzer.objUserSettings;

                string lastError = "";
                VuMaxDR.Data.Objects.Well objWell = VuMaxDR.Data.Objects.Well.loadObject(ref paramRequest.objDataService, wellId, ref lastError);
                objTripSpeedData.WellName = objWell.name;

                objResponse.Warnings = paramWarnings;
                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objTripSpeedData);

                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }

        private Broker.BrokerResponse loadTripSpeed2Data(Broker.BrokerRequest paramRequest)
        {
            try
            {
                string paramWarnings = ""; //Nishant 22-10-2021
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;

                //Check if time log exist, else return empty JSON
                if (!VuMaxDR.Data.Objects.Well.isTimeLogExist(ref paramRequest.objDataService, wellId))
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Response = "{}";
                    objBadResponse.Errors = "No time logs found in this well ";
                    return objBadResponse;

                }

                string lastError = "";
                VuMaxDR.Data.Objects.Well objWell = VuMaxDR.Data.Objects.Well.loadObject(ref paramRequest.objDataService, wellId, ref lastError);

                TripAnalyzer objTripAnalyzer = new TripAnalyzer(paramRequest.objDataService, wellId, UserId);
                objTripAnalyzer.processTripSpeed2Data(ref objTripSpeedData);
                objTripSpeedData.objUserSettings = objTripAnalyzer.objUserSettings;
                objTripSpeedData.WellName = objWell.name;

                paramWarnings = objTripAnalyzer.Warnings;//Nishant 22-10-2021
                objResponse.Warnings = paramWarnings;//Nishant 22-10-2021

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objTripSpeedData);

                               

                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }

      
        private Broker.BrokerResponse saveUserSettingsTripSpeed1(Broker.BrokerRequest paramRequest)
        {
            try
            {

                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                
                string SettingsData = paramRequest.Parameters.Where(x => x.ParamName.Contains("SettingsData")).FirstOrDefault().ParamValue;

                UserSettings.UserSettingsMgr objMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);

                UserSettings.UserSettings objSettings = new UserSettings.UserSettings();
                objSettings.WellId = wellId;
                objSettings.UserId = UserId;
                objSettings.settingData = SettingsData;
                objSettings.SettingsId = "TripSpeed1";


                if (objMgr.saveUserSettings(objSettings))
                {
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;

                }
                else
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving user settings " + objMgr.LastError;
                    return objBadResponse;

                }

            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving user settings " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }

        private Broker.BrokerResponse saveUserSettingsTripSpeed2(Broker.BrokerRequest paramRequest)
        {
            try
            {

                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;

                string SettingsData = paramRequest.Parameters.Where(x => x.ParamName.Contains("SettingsData")).FirstOrDefault().ParamValue;

                UserSettings.UserSettingsMgr objMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);

                UserSettings.UserSettings objSettings = new UserSettings.UserSettings();
                objSettings.WellId = wellId;
                objSettings.UserId = UserId;
                objSettings.settingData = SettingsData;
                objSettings.SettingsId = "TripSpeed2";


                if (objMgr.saveUserSettings(objSettings))
                {
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = true;
                    objResponse.Errors = "";
                    return objResponse;

                }
                else
                {

                    Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                    objBadResponse.RequestSuccessfull = false;
                    objBadResponse.Errors = "Error saving user settings " + objMgr.LastError;
                    return objBadResponse;

                }

            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error saving user settings " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }



        ////Not using
        //private Broker.BrokerResponse LoadUserSettingsTripSpeed1(Broker.BrokerRequest paramRequest)
        //{
        //    try
        //    {

        //        string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
        //        string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;


        //        UserSettings.UserSettingsMgr objMgr = new UserSettings.UserSettingsMgr(paramRequest.objDataService);

        //        UserSettings.UserSettings objSettings = new UserSettings.UserSettings();

        //        objSettings.WellId = wellId;
        //        objSettings.UserId = UserId;



        //        if (objMgr.saveUserSettings(objSettings))
        //        {
        //            Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
        //            objResponse.RequestSuccessfull = true;
        //            objResponse.Errors = "";
        //            return objResponse;

        //        }
        //        else
        //        {

        //            Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
        //            objBadResponse.RequestSuccessfull = false;
        //            objBadResponse.Errors = "Error saving user settings " + objMgr.LastError;
        //            return objBadResponse;

        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
        //        objBadResponse.RequestSuccessfull = false;
        //        objBadResponse.Errors = "Error saving user settings " + ex.Message + ex.StackTrace;
        //        return objBadResponse;
        //    }
        //}


    }//Class
}//NameSpace
