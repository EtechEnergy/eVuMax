using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.Summary.TripSpeed
{
    public class TripSpeedSettings
    {

        //TripAnalyser class object: save all the User Settings
        public eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

        public const string SettingsId = "TripSpeed";
        public TripSpeedBenchMark objBenchMarks = new TripSpeedBenchMark();

        public bool UseDepthRanges = false;
        public Dictionary<double, double> TagSelection = new Dictionary<double, double>();
        public Dictionary<double, TripDepthInformation> TagDepthInformation = new Dictionary<double, TripDepthInformation>();

        public double DepthThreshold = 10;
        public bool UseCustomTags = false;
        public string TagSourceID = "";

        public bool RemoveFillUpTime = false;
        public bool IncludePipeMovement = false;
        public enum enumTripDirection
        {
            TripIn = 0,
            TripOut = 1,
            None = 2
        }

        public enumTripDirection TripDirection = enumTripDirection.TripIn;

        public string DepthVumaxUnitID = "";


        public TripSpeedSettings loadUserSetings(ref VuMaxDR.Data.DataService objDataService, string userId, string wellId, string settingsId)
        {
            try
            {
                //Load User Settings
                objLogger.LogMessage("TripSpeedSetting - loadUserSetings ");
                UserSettings.UserSettingsMgr objSettingsMgr = new UserSettings.UserSettingsMgr(objDataService);

                UserSettings.UserSettings objSettings = objSettingsMgr.loadUserSettings(userId, settingsId, wellId);

                TripSpeedSettings objTripSpeedSettings = null;

                if (objSettings == null)
                {
                    objSettings = new UserSettings.UserSettings();

                    try
                    {
                        if (objSettings.settingData != "")
                        {
                            objTripSpeedSettings = JsonConvert.DeserializeObject<TripSpeedSettings>(objSettings.settingData);
                        }
                        else
                        {
                            objTripSpeedSettings = new TripSpeedSettings();
                            loadDepthRangeFromDB(ref objDataService, wellId);
                        }


                        objTripSpeedSettings.TagDepthInformation = TagDepthInformation;
                        objTripSpeedSettings.TagSelection = TagSelection;
                        return objTripSpeedSettings;
                    }
                    catch (Exception ex)
                    {
                        objLogger.LogMessage("Error ->TripSpeedSetting - loadUserSetings " + ex.Message + ex.StackTrace);
                        int a = 0;

                    }
                }
                else
                {

                    try
                    {
                        objTripSpeedSettings = JsonConvert.DeserializeObject<TripSpeedSettings>(objSettings.settingData);

                    }
                    catch (Exception ex)
                    {
                        objLogger.LogMessage("Error ->>TripSpeedSetting - loadUserSetings " + ex.Message + ex.StackTrace);

                    }

                }
                ////load Depth Range Information from the Vumax Database(Normal VMX_XXX table)
                loadDepthRangeFromDB(ref objDataService, wellId);
                objTripSpeedSettings.TagDepthInformation = TagDepthInformation;

                //********************
                //For Testing with VuMax Table data (Settings)
                //if (objTripSpeedSettings == null)
                //{


                //    objTripSpeedSettings = new TripSpeedSettings();
                //    //load from VMX table 
                //    DataTable objData1 = objDataService.getTable("SELECT * FROM VMX_TRIPAN_SETTINGS WHERE WELL_ID='" + wellId + "'");
                //    if (objData1.Rows.Count > 0)
                //    {
                //        DataRow objRow = objData1.Rows[0];
                //        objTripSpeedSettings.UseDepthRanges = Convert.ToInt32(DataService.checkNull(objRow["USE_DEPTH_RANGE"], 0)) == 1 ? true : false;
                //        objTripSpeedSettings.DepthThreshold = Convert.ToDouble(DataService.checkNull(objRow["DEPTH_THRESHOLD"], 100));
                //        //objTripSpeedSettings.TripDirection = (enumTripDirection) DataService.checkNull(objRow["TRIP_DIRECTION"], enumTripDirection.TripIn);
                //        objTripSpeedSettings.TripDirection = (enumTripDirection)Enum.Parse(typeof(enumTripDirection), DataService.checkNull(objRow["TRIP_DIRECTION"], 0).ToString());

                //        objTripSpeedSettings.UseCustomTags = Convert.ToInt32(DataService.checkNull(objRow["USE_CUSTOM"], 0)) == 1 ? true : false;
                //        objTripSpeedSettings.TagSourceID = DataService.checkNull(objRow["TAG_SOURCE_ID"], "").ToString();
                //        objTripSpeedSettings.RemoveFillUpTime = Convert.ToInt32(DataService.checkNull(objRow["REMOVE_FILLUP_TIME"], 0)) == 1 ? true : false;
                //    }

                //    //prath==================

                //    objTripSpeedSettings.TagSelection.Clear();
                //    objData1 = objDataService.getTable("SELECT * FROM VMX_TRIPAN_TAG_SELECTION WHERE WELL_ID='" + wellId + "'");
                //    foreach (DataRow objRow in objData1.Rows)
                //    {
                //        double phaseIndex = Convert.ToDouble(DataService.checkNull(objRow["PHASE_INDEX"], 0));
                //        objTripSpeedSettings.TagSelection.Add(phaseIndex, phaseIndex);
                //    }

                //    objData1 = objDataService.getTable("SELECT * FROM VMX_TRIPAN_DEPTH_INFO_HEADER WHERE WELL_ID='" + wellId + "'");
                //    foreach (DataRow objRow in objData1.Rows)
                //    {
                //        var objItem = new TripDepthInformation();
                //        objItem.PhaseIndex = Convert.ToDouble(DataService.checkNull(objRow["PHASE_INDEX"], 0));
                //        objItem.TimeLogName = DataService.checkNull(objRow["LOG_NAME"], "").ToString();
                //        DataTable objRangeData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_DEPTH_RANGES WHERE WELL_ID='" + wellId + "' AND PHASE_INDEX=" + objItem.PhaseIndex.ToString());
                //        foreach (DataRow objRangeRow in objRangeData.Rows)
                //        {
                //            var objRange = new TripDepthRange();
                //            objRange.FromDepth = Convert.ToDouble(DataService.checkNull(objRangeRow["FROM_DEPTH"], 0));
                //            objRange.ToDepth = Convert.ToDouble(DataService.checkNull(objRangeRow["TO_DEPTH"], 0));
                //            objRange.LabelText = DataService.checkNull(objRangeRow["LABEL"], 0).ToString();
                //            objRange.TimeLogName = DataService.checkNull(objRangeRow["LOG_NAME"], 0).ToString();
                //            objRange.WithBenchhmark = Convert.ToDouble(DataService.checkNull(objRangeRow["WITH_BM"], 0));
                //            objRange.WOBenchmark = Convert.ToDouble(DataService.checkNull(objRangeRow["WO_BM"], 0));
                //            objItem.DepthRanges.Add(objItem.DepthRanges.Count + 1, objRange);
                //        }

                //        objTripSpeedSettings.TagDepthInformation.Add(objItem.PhaseIndex, objItem);
                //    }

                //    //load banchMark================
                //    DataTable objData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_SPEED_BM WHERE WELL_ID='" + wellId + "'");
                //    if (objData.Rows.Count > 0)
                //    {
                //        objTripSpeedSettings.objBenchMarks.TripSpeedWOConnection = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["WO_SPEED"], 0));
                //        objTripSpeedSettings.objBenchMarks.TripSpeedWithConnection = Convert.ToDouble(DataService.checkNull(objData.Rows[0]["WITH_SPEED"], 0));
                //    }

                //    objTripSpeedSettings.objBenchMarks.speedProfile.Clear();
                //    objData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_SPEED_PROFILE WHERE WELL_ID='" + wellId + "'");
                //    foreach (DataRow objRow in objData.Rows)
                //    {
                //        var objItem = new TripSpeed();
                //        objItem.SrNo = Convert.ToDouble(DataService.checkNull(objRow["SR_NO"], 0));
                //        objItem.Depth = Convert.ToDouble(DataService.checkNull(objRow["DEPTH"], 0));
                //        objItem.SpeedWithoutConnection = Convert.ToDouble(DataService.checkNull(objRow["WO_SPEED"], 0));
                //        objItem.SpeedWithConnection = Convert.ToDouble(DataService.checkNull(objRow["WITH_SPEED"], 0));
                //        if (!objTripSpeedSettings.objBenchMarks.speedProfile.ContainsKey(objItem.SrNo))
                //        {
                //            objTripSpeedSettings.objBenchMarks.speedProfile.Add(objItem.SrNo, objItem);
                //        }
                //    }
                //==============================

                //}

                //*********
                objSettings = new UserSettings.UserSettings();
                objSettings.UserId = userId;
                objSettings.WellId = wellId;
                objSettings.SettingsId = settingsId;
                objSettings.settingData = JsonConvert.SerializeObject(objTripSpeedSettings);

                //Save these settings
                objSettingsMgr.saveUserSettings(objSettings);

                //Load and copy user settings also to reduce the round-trip


                return objTripSpeedSettings;

            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error - TripSpeedSetting - loadUserSetings " + ex.Message + " " + ex.StackTrace );
                return new TripSpeedSettings();
            }

           
        }

        private void loadDepthRangeFromDB(ref VuMaxDR.Data.DataService objDataService, string wellId)
        {
            try
            {
                TagDepthInformation.Clear();
                DataTable objData = new DataTable();
                objData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_DEPTH_INFO_HEADER WHERE WELL_ID='" + wellId + "'");

                if (objData.Rows.Count > 0)
                {
                    foreach (DataRow objRow in objData.Rows)
                    {
                        TripDepthInformation objItem = new TripDepthInformation();
                        objItem.PhaseIndex = Convert.ToDouble(DataService.checkNull(objRow["PHASE_INDEX"], 0));
                        objItem.TimeLogName = DataService.checkNull(objRow["LOG_NAME"], "").ToString();
                        DataTable objRangeData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_DEPTH_RANGES WHERE WELL_ID='" + wellId + "' AND PHASE_INDEX=" + objItem.PhaseIndex.ToString());
                        foreach (DataRow objRangeRow in objRangeData.Rows)
                        {
                            TripDepthRange objRange = new TripDepthRange();
                            objRange.FromDepth = Convert.ToDouble(DataService.checkNull(objRangeRow["FROM_DEPTH"], 0));
                            objRange.ToDepth = Convert.ToDouble(DataService.checkNull(objRangeRow["TO_DEPTH"], 0));
                            objRange.LabelText = DataService.checkNull(objRangeRow["LABEL"], 0).ToString();
                            objRange.TimeLogName = DataService.checkNull(objRangeRow["LOG_NAME"], 0).ToString();
                            objRange.WithBenchhmark = Convert.ToDouble(DataService.checkNull(objRangeRow["WITH_BM"], 0));
                            objRange.WOBenchmark = Convert.ToDouble(DataService.checkNull(objRangeRow["WO_BM"], 0));
                            objItem.DepthRanges.Add(objItem.DepthRanges.Count + 1, objRange);


                        }

                        if (TagDepthInformation.ContainsKey(objItem.PhaseIndex))
                        {
                            TagDepthInformation[objItem.PhaseIndex] = objItem;
                        }
                        else
                        {
                            TagDepthInformation.Add(objItem.PhaseIndex, objItem);
                        }
                    }
                }

                //prath tag selection 08-11-2020
                TagSelection.Clear();

                objData = objDataService.getTable("SELECT * FROM VMX_TRIPAN_TAG_SELECTION WHERE WELL_ID='" + wellId + "'");

                foreach (DataRow objRow in objData.Rows)
                {
                    double phaseIndex = Convert.ToDouble(DataService.checkNull(objRow["PHASE_INDEX"], 0));

                    TagSelection.Add(phaseIndex, phaseIndex);
                }


            }
            catch (Exception ex)
            {
                objLogger.LogMessage("Error - TripSpeedSetting - loadDepthRangeFromDB " + ex.Message + " " + ex.StackTrace);

            }

        }


    }//Class
}//NameSpace
