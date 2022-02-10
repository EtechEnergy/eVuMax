using eVuMax.DataBroker.Broker;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.TripReport
{
    class TripReportMgr : IBroker
    {
        const string generateTripReport = "generateTripReport";
        const string saveUserSettings = "SaveUserSettings";
        const string refreshSingleTripStats = "refreshSingleTripStats";
        const string getCustomTags = "getCustomTags";
        const string getTagSelectionList = "getTagSelectionList";

        const string MyPlotID = "TRIPREPORT";
        const string getAxisScale= "getAxisScale"; //prath
        const string saveAxisScale = "saveScaleSettings"; //prath

        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
            if (paramRequest.Function == generateTripReport)
            {
                TripReportData objTripReport = new TripReportData();
                string WellID = "";
                string UserID = "";

                try
                {
                    WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();
                    UserID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                }
                catch (Exception)
                {

                
                }
                

                //string strTripReportSettings = "";

                //strTripReportSettings = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserSettings")).FirstOrDefault().ParamValue.ToString();

                //if (strTripReportSettings != "")
                //{
                //    objTripReport.objUserSettings = JsonConvert.DeserializeObject<TripReportSettings>(strTripReportSettings);

                //}


                objResponse = objTripReport.generateTripReport(ref paramRequest.objDataService, WellID, UserID);
                                
                if (objResponse.RequestSuccessfull == false)
                {
                    objResponse.Warnings = objResponse.Errors;
                }
                return objResponse;


            }

            //phaseIndexID
            if (paramRequest.Function == refreshSingleTripStats)
            {

                string WellID = "";
                int phaseIndexID = 0;
                string UserID = "";

                try
                {
                    WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();
                    phaseIndexID = Convert.ToInt32(paramRequest.Parameters.Where(x => x.ParamName.Contains("phaseIndexID")).FirstOrDefault().ParamValue.ToString());
                    UserID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                }
                catch (Exception ex)
                {
                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Invalid Parameters Send. Please use proper header in the Broker request";
                    return objResponse;

                }
                

                TripReportData objTripReport = new TripReportData();
                objTripReport.UserID = UserID;
                objTripReport.WellID = WellID;
                objResponse = objTripReport.refreshSingleTripStats(ref paramRequest.objDataService, WellID, phaseIndexID);

                if (objResponse.RequestSuccessfull == false)
                {
                    objResponse.Warnings = objResponse.Errors;
                }
                return objResponse;


            }

            
            //if(paramRequest.Function == getCustomTags)
            //{
            //    TripReportData objTripReport = new TripReportData();
            //    string WellID = "";
            //    string CustomTagID = "";
            //    WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();
            //    CustomTagID = paramRequest.Parameters.Where(x => x.ParamName.Contains("CustomTagID")).FirstOrDefault().ParamValue.ToString();

            //    //objResponse = objTripReport.generateTripReport(ref paramRequest.objDataService, WellID);

            //    objTripReport.generateTagListTable();
            //    objTripReport.loadTagListCustom(ref paramRequest.objDataService, CustomTagID, WellID);
            //    objResponse.Response = Newtonsoft.Json.JsonConvert.SerializeObject(objTripReport.tagList);
            //    if (objResponse.RequestSuccessfull == false)
            //    {
            //        objResponse.Warnings = objResponse.Errors;
            //    }
            //    return objResponse;
            //}
            


            if(paramRequest.Function == getTagSelectionList)
            {

                string WellID = "";
                WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();

                string strTripReportSettings = "";

                strTripReportSettings = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserSettings")).FirstOrDefault().ParamValue.ToString();
                TripReportUserSettings objUserSettings = new TripReportUserSettings(ref paramRequest.objDataService);

                DataTable objDataTable = new DataTable();

                if (strTripReportSettings != "")
                {
                    objUserSettings = JsonConvert.DeserializeObject<TripReportUserSettings>(strTripReportSettings);
                }

                if (objUserSettings.UseCustomTags)
                {
                    
                    objDataTable = TripReportUserSettings.loadTagListCustom(ref paramRequest.objDataService, objUserSettings);
                }
                else
                {
                    objDataTable = TripReportUserSettings.loadTagListDrilling(ref paramRequest.objDataService, objUserSettings);
                }

                objResponse.RequestSuccessfull = true;
                objResponse.Response = JsonConvert.SerializeObject(objDataTable);

                return objResponse;






            }

            if (paramRequest.Function== getAxisScale)
            {
                try
                {
                    string WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();
                    PlotAxisScale.WellID = WellID;
                    PlotAxisScale.objDataService = paramRequest.objDataService;

                    Dictionary<string, PlotAxisScale> list = new Dictionary<string, PlotAxisScale>();
                   
                    PlotAxisScale objAvgTime1TimeAxis = PlotAxisScale.getAxisScales(MyPlotID, "AVG_TIME1_TIME");
                    objAvgTime1TimeAxis.AxisName = "Conn. Time Line Chart - Time";
                    list.Add(objAvgTime1TimeAxis.AxisID, objAvgTime1TimeAxis);

                    PlotAxisScale objAvgTime1TripAxis = PlotAxisScale.getAxisScales(MyPlotID, "AVG_TIME1_TRIPS");
                    objAvgTime1TripAxis.AxisName = "Conn. Time Line Chart - Trips";
                    list.Add(objAvgTime1TripAxis.AxisID, objAvgTime1TripAxis);

                    PlotAxisScale objAvgTime2TimeAxis = PlotAxisScale.getAxisScales(MyPlotID, "AVG_TIME2_TIME");
                    objAvgTime2TimeAxis.AxisName = "Conn. Time Bar Chart - Time";
                    list.Add(objAvgTime2TimeAxis.AxisID, objAvgTime2TimeAxis);

                    PlotAxisScale objAvgTime2TripAxis = PlotAxisScale.getAxisScales(MyPlotID, "AVG_TIME2_TRIPS");
                    objAvgTime2TripAxis.AxisName = "Conn. Time Bar Chart - Trips";
                    list.Add(objAvgTime2TripAxis.AxisID, objAvgTime2TripAxis);


                    PlotAxisScale objContWithDepthAxis = PlotAxisScale.getAxisScales(MyPlotID, "CONT_WITH_DEPTH", true);
                    objContWithDepthAxis.AxisName = "Speed with Conn. - Depth";
                    list.Add(objContWithDepthAxis.AxisID, objContWithDepthAxis);

                    PlotAxisScale objContWithSpeedAxis = PlotAxisScale.getAxisScales(MyPlotID, "CONT_WITH_SPEED");
                    objContWithSpeedAxis.AxisName = "Speed with Conn. - Speed";
                    list.Add(objContWithSpeedAxis.AxisID, objContWithSpeedAxis);

                    PlotAxisScale objContWODepthAxis = PlotAxisScale.getAxisScales(MyPlotID, "CONT_WO_DEPTH", true);
                    objContWODepthAxis.AxisName = "Speed w/o Conn. - Depth";
                    list.Add(objContWODepthAxis.AxisID, objContWODepthAxis);

                    PlotAxisScale objContWOSpeedAxis = PlotAxisScale.getAxisScales(MyPlotID, "CONT_WO_SPEED");
                    objContWOSpeedAxis.AxisName = "Speed w/o Conn. - Speed";
                    list.Add(objContWOSpeedAxis.AxisID, objContWOSpeedAxis);


                    PlotAxisScale ST_objContSpeedDepthAxis = PlotAxisScale.getAxisScales(MyPlotID, "ST_CONT_DEPTH");
                    ST_objContSpeedDepthAxis.AxisName = "Single Trip - Depth";
                    list.Add(ST_objContSpeedDepthAxis.AxisID, ST_objContSpeedDepthAxis);

                    PlotAxisScale ST_objContSpeedSpeedAxis = PlotAxisScale.getAxisScales(MyPlotID, "ST_CONT_SPEED");
                    ST_objContSpeedSpeedAxis.AxisName = "Single Trip - Speed";
                    list.Add(ST_objContSpeedSpeedAxis.AxisID, ST_objContSpeedSpeedAxis);

                    PlotAxisScale ST_objTimeAxis = PlotAxisScale.getAxisScales(MyPlotID, "ST_CONN_TIME");
                    ST_objTimeAxis.AxisName = "Single Trip - Conn. Time";
                    list.Add(ST_objTimeAxis.AxisID, ST_objTimeAxis);

                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(list);

                    return objResponse;

                }
                catch (Exception ex)
                {

                    objResponse = paramRequest.createResponseObject();
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error : " + ex.Message + ex.InnerException;
                    return objResponse;
                }
              
                

            }


          
                objResponse = paramRequest.createResponseObject();
            objResponse.RequestSuccessfull = false;
            objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
            return objResponse;

        }


        

        

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            try
            {

          
            
            Broker.BrokerResponse objResponse = paramRequest.createResponseObject();


            if (paramRequest.Function == saveUserSettings)
            {
                string WellID = "";
                //WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();

                string strTripReportSettings = "";

                strTripReportSettings = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserSettings")).FirstOrDefault().ParamValue.ToString();
                    TripReportUserSettings objUserSettings = new TripReportUserSettings();

                if (strTripReportSettings != "")
                {
                    objUserSettings = JsonConvert.DeserializeObject<TripReportUserSettings>(strTripReportSettings);
                        objUserSettings.objDataService = paramRequest.objDataService;
                    if (objUserSettings.saveUserSettings())
                    {
                        objResponse = paramRequest.createResponseObject();
                        objResponse.RequestSuccessfull = true;
                        objResponse.Errors = "";
                        return objResponse;
                    }
                    else {
                        objResponse = paramRequest.createResponseObject();
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "Some Error occured during save";
                        return objResponse;
                    }


                }
            }

                if (paramRequest.Function == saveAxisScale)
                {
                    try
                    {
                        string WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();
                        string ScaleSettingsData = paramRequest.Parameters.Where(x => x.ParamName.Contains("ScaleSettingsData")).FirstOrDefault().ParamValue.ToString();

                        PlotAxisScale.WellID = WellID;
                        PlotAxisScale.objDataService = paramRequest.objDataService;

                        
                        Dictionary<int, PlotAxisScale> objPlotAxisScale = new Dictionary<int, PlotAxisScale>();


                        objPlotAxisScale = JsonConvert.DeserializeObject<Dictionary<int, PlotAxisScale>>(ScaleSettingsData);

                        string lastError = "";
                        PlotAxisScale.saveAxisScaleList(objPlotAxisScale, ref lastError);


                    }
                    catch (Exception ex)
                    {
                        objResponse = paramRequest.createResponseObject();
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "Error : " + ex.Message + ex.InnerException;
                        return objResponse;
                    }
                }
                objResponse = paramRequest.createResponseObject();
            objResponse.RequestSuccessfull = false;
            objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
            return objResponse;

            }
            catch (Exception ex)
            {


                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors =ex.Message+ ex.StackTrace ;
                objResponse.Warnings = ex.Message + ex.StackTrace;
                return objResponse;
            }


        }

    }
}
