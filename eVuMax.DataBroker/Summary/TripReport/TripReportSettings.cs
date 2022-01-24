using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.Summary.TripReport
{
    public class TripReportSettings 
    {
        
        public bool IncludePipeMovement = true;
        public bool RemoveFillupTime = false;
        public bool UseCustomTags = false;
        public double SurfaceDepthInterval = 90;
        public string TagSourceID = "";
        public double BenchmarkSpeedWOConn = 0;
        public double BenchmarkSpeedWithConn = 0;
        public double BenchmarkTime = 0;
        public double MaxConnTime = 5;
        public double MinConnTime = 1;
        public double DepthInterval = 1000;

        public string WellID = "";
        public string UserID = "";
        private string PlotID = "TRIPREPORT";
        public DataService objDataService;
        public string Warnings = "";

        public TripReportSettings( ref DataService paramDataService)
        {
            objDataService = paramDataService;

        }
        public TripReportSettings()
        {

        }
        //public void getVuMaxSettings()
        //{
        //    TripReportSettings objVuMaxTripReportSettings = new TripReportSettings();
        //    objVuMaxTripReportSettings = getSettings(objDataService, WellID);
            
        //    MinConnTime = objVuMaxTripReportSettings.MinConnTime;
        //    IncludePipeMovement = objVuMaxTripReportSettings.IncludePipeMovement;
        //    RemoveFillupTime = objVuMaxTripReportSettings.RemoveFillupTime;
        //    UseCustomTags = objVuMaxTripReportSettings.UseCustomTags;
        //    SurfaceDepthInterval = objVuMaxTripReportSettings.SurfaceDepthInterval;
        //    TagSourceID = objVuMaxTripReportSettings.TagSourceID;
        //    BenchmarkSpeedWOConn = objVuMaxTripReportSettings.BenchmarkSpeedWOConn;
        //    BenchmarkSpeedWithConn = objVuMaxTripReportSettings.BenchmarkSpeedWithConn;
        //    BenchmarkTime = objVuMaxTripReportSettings.BenchmarkTime;
        //    MaxConnTime = objVuMaxTripReportSettings.MaxConnTime;
        //    DepthInterval = objVuMaxTripReportSettings.DepthInterval;
            
        //}

        public  void  loadSettings()
        {
            try
            {
                UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(objDataService);
                UserSettings.UserSettings objSettings = objSettingsMgr.loadUserSettings(UserID, PlotID, WellID);

                if (objSettings != null)
                {
                    TripReportSettings objLocalSettings =  JsonConvert.DeserializeObject<TripReportSettings>(objSettings.settingData);
                    MinConnTime = objLocalSettings.MinConnTime;
                    IncludePipeMovement = objLocalSettings.IncludePipeMovement;
                    RemoveFillupTime = objLocalSettings.RemoveFillupTime;
                    UseCustomTags = objLocalSettings.UseCustomTags;
                    SurfaceDepthInterval = objLocalSettings.SurfaceDepthInterval;
                    TagSourceID = objLocalSettings.TagSourceID;
                    BenchmarkSpeedWOConn = objLocalSettings.BenchmarkSpeedWOConn;
                    BenchmarkSpeedWithConn = objLocalSettings.BenchmarkSpeedWithConn;
                    BenchmarkTime = objLocalSettings.BenchmarkTime;
                    MaxConnTime = objLocalSettings.MaxConnTime;
                    DepthInterval = objLocalSettings.DepthInterval;
                }
                

                
            }
            catch (Exception ex)
            {
                Warnings += ex.Message + ex.StackTrace;

            }
        }

        public void copySettingsToVuMaxTripReportSettings(ref VuMaxDR.Data.Objects.TripReportSettings objTripReportSettings)
        {
            try
            {
                 objTripReportSettings.MinConnTime = MinConnTime;
                objTripReportSettings.IncludePipeMovement = IncludePipeMovement;
                objTripReportSettings.RemoveFillupTime = RemoveFillupTime;
                objTripReportSettings.UseCustomTags= UseCustomTags;
                objTripReportSettings.SurfaceDepthInterval= SurfaceDepthInterval;
                objTripReportSettings.TagSourceID= TagSourceID;
                objTripReportSettings.BenchmarkSpeedWOConn = BenchmarkSpeedWOConn;
                objTripReportSettings.BenchmarkSpeedWithConn= BenchmarkSpeedWithConn;
                objTripReportSettings.BenchmarkTime= BenchmarkTime;
                objTripReportSettings.MaxConnTime= MaxConnTime;
                objTripReportSettings.DepthInterval= DepthInterval;
            }
            catch (Exception ex)
            {

            }
        }
        public bool saveUserSettings()
        {
            try
            {
                UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(objDataService);
                UserSettings.UserSettings objUserSettings = new UserSettings.UserSettings();
                objUserSettings.SettingsId = PlotID;
                objUserSettings.WellId = WellID;
                objUserSettings.settingData = JsonConvert.SerializeObject(this);
                objSettingsMgr.saveUserSettings(objUserSettings);

                return true;

            }
            catch (Exception ex)
            {

                Warnings += ex.Message + ex.StackTrace;
                return false;
            }
        }
    }
}
