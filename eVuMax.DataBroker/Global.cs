using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace eVuMax.DataBroker
{
    public static class Global
    {
        
        public const string EncryptionKey = "V12Mx&*DR@!!(^-29287*263#"; //Copied from VuMaxDR.Common.Global //Nishant 08-09-2021
        
        #region Module String Constants

        public const string Mod_Common = "Common";
        public const string Mod_WellDataObjects = "Well.Data.Objects";
        public const string Mod_Config = "Config";
        public const string Mod_Summary_Manager = "Summary.Manager";
        public const string Mod_DataObject_Manager = "DataObject.Manager";
        public const string Mod_Broomstick_Manager = "Broomstick.Manager";
        public const string Mod_AdvKPI = "AdvKPI.Manager";  //11-March-2022 Prath
        


        //Nishant
        public const string Mod_GenericDrillingSummary_Manager = "GenericDrillingSummary.Manager";
        public const string Mod_eVuMaxLogger = "eVuMaxLogger";

        public const string Mod_DownloadManager = "DownloadManager"; //Nishant 27-11-2020
       
        public const string DO_DownloadManager = "DownloadManager";
        public const string PasswordEncryptionKey = "V0K9iPqdUnt0i#*(%^@"; //Nishant: 27-11-2020
        public const int ServerLogMaxLimit = 100; //Nishant 27-11-2020
        public const string DRLG_STAND_PLOT = "DrlgStandPlot";
        public const string TripReportBroker = "TripReportBroker"; //Nishant 18-01-2022
        

        #endregion

        #region ErrorLogger
        public const string Brk_eVuMaxLogger = "eVuMaxLogger";//Nitin 16-10-2020
        #endregion

        #region Common Broker Strings


        public const string Brk_Authentication = "Authentication";
        public const string Brk_TimeData = "TimeData";
        public const string Common_Functions = "Common.Functions";//Nitin 16-10-2020

        public const string Brk_AdvKPI = "AdvKPI";  //11-March-2022 Prath

        #endregion


        #region Config Broker String

        public const string Brk_Config_Theme = "Config.Themes";
        public const string Brk_Config_UserPrefs = "Config.UserPrefs";

        #endregion

        #region Summary Broker Strings
        public const string SM_ROPSummary = "ROPSummary"; //Prath 07-10-2020
        public const string SM_DrlgSummary = "DrlgSummary"; //Prath 01-10-2020
        public const string SM_DrlgConn = "DrlgConn";
        public const string SM_TripConn = "TripConn";
        public const string SM_Toolface = "Toolface";
        public const string SM_TripSpeedPlot = "TripSpeedPlot";
        public const string SM_TripAnalyzerSelection = "TripAnalyzerSelection"; //Nishant 20-10-2020

        #endregion

        //Nishant 27-11-2021
        #region GenericDrillingSummary
        public const string GD_Summary = "GenericDrillingSummary";
        #endregion


        #region Data Objects

        public const string DO_ActiveWellProfile = "ActiveWellProfile";
        public const string DO_WellObjectManager = "WellObjectManager";
        public const string DO_TimelogObjectManager = "TimelogObjectManager";

        #endregion


        #region Broomstick Document Data

        public const string BS_DataManager = "DataManager";

        #endregion



        #region DataService
        public const string Mod_DataService = "DataService.Manager";// Nisahnt 25-04-2022
        public const string Brk_DataServie = "DataService";  //Nisahnt 25-04-2022

        #endregion
        /// <summary>
        /// Extracts Parameter list from request object and returns it
        /// </summary>
        /// <param name="objRequest">Request Parameter</param>
        /// <returns></returns>
        public static List<Broker.BrokerParameter> getParameters(Broker.BrokerRequest objRequest)
        {
            try
            {
                //List<Broker.BrokerParameter> list = JsonConvert.DeserializeObject<List<Broker.BrokerParameter>>(objRequest.Parameters);
                List<Broker.BrokerParameter> list = JsonConvert.DeserializeObject<List<Broker.BrokerParameter>>(objRequest.Parameters.ToString());
                return list;
            }
            catch (Exception)
            {
                return new List<Broker.BrokerParameter>();
            }
        }



        public static string getParameterValue(List<Broker.BrokerParameter> list,string parameterName)
        {
            try
            {

                Broker.BrokerParameter objParam = list.FirstOrDefault(x => x.ParamName.ToLower() == parameterName.ToLower());

                if(objParam!=null)
                {
                    return objParam.ParamValue;
                }

                return "";

            }
            catch (Exception ex)
            {
                return "";
            }
        }

      

        //Nishant 25-11-2021

        public static T Iif<T>(bool cond, T left, T right)
        {
            return cond ? left : right;
        }
        public static double ValEx(object strNumber)
        {
            try
            {
                if (strNumber.ToString().Contains(","))
                    return Convert.ToDouble(strNumber.ToString().Replace(',', '.'));
                else
                    return Convert.ToDouble(strNumber);
            }
            catch (Exception ex)
            {
                return 0;
            }
        }


    }
}
