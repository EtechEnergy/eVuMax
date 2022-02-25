using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using System.Data;
using System.Drawing;






namespace eVuMax.DataBroker.Broomstick.Document
{
    public class BroomstickDocMgr : IBroker
    {
        const string ProcessBroomstickDoc = "ProcessBroomstickDoc";
        const string SaveSetup = "SaveSetup";
        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                //Nishant
                if (paramRequest.Function == ProcessBroomstickDoc)
                {
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();


                    string WellID = "";
                    string UserID = "";
                    int DocType = 1;

                    try
                    {
                        WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();
                        UserID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                        DocType = Convert.ToInt32( paramRequest.Parameters.Where(x => x.ParamName.Contains("DocType")).FirstOrDefault().ParamValue.ToString());
                    }
                    catch (Exception)
                    {


                    }
                    BroomStickSetup objSetup = new BroomStickSetup(ref paramRequest.objDataService);

                    BroomstickDocument.BroomstickUserSettings objUserSettings = new BroomstickDocument.BroomstickUserSettings();
                    objUserSettings.LoadBroomStickUserSettings(ref paramRequest.objDataService, WellID, DocType, UserID);

                    objSetup = objUserSettings.objSetup;

                    //load BroomstickSetup from database using table evumaxBroomstickDocs


                  
                    BroomstickDocument.BroomStickProcessor objBroomstickProcessor = new BroomstickDocument.BroomStickProcessor(ref paramRequest.objDataService, WellID);
                    //objBroomstickProcessor.ProcessPoints(objSetup);
                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = objBroomstickProcessor.ProcessPoints(objSetup);

                    return objResponse;


                }

                //Nitin Code
                if (paramRequest.Function == "BroomstickDocData")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = getBroomstickDocData(paramRequest);

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

                //Nothing to implement anything yet

                if(paramRequest.Function == SaveSetup)
                {
                    BroomStickSetup objSetup = new BroomStickSetup();
                    
                    try
                    {
                        string strObjSetup = paramRequest.Parameters.Where(x => x.ParamName.Contains("objSetup")).FirstOrDefault().ParamValue.ToString();
                        string UserID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                        string WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();

                        if (strObjSetup != "")
                        {
                            objSetup = JsonConvert.DeserializeObject<BroomStickSetup>(strObjSetup);

                            //pending...

                          



                        }



                        
                    }
                    catch (Exception)
                    {


                    }

                  
                }

                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                return paramRequest.createResponseObject();
            }
        }



        private Broker.BrokerResponse getBroomstickDocData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                BroomstickData objBroomstickData = new BroomstickData();

                string UserId = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserId")).FirstOrDefault().ParamValue;
                string wellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string RunNo = paramRequest.Parameters.Where(x => x.ParamName.Contains("RunNo")).FirstOrDefault().ParamValue;
                string selectionType = paramRequest.Parameters.Where(x => x.ParamName.Contains("SelectionType")).FirstOrDefault().ParamValue.ToString();
                double fromDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDepth")).FirstOrDefault().ParamValue.ToString());
                double toDepth = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDepth")).FirstOrDefault().ParamValue.ToString());

                bool isRealTime = false;
                int refreshHrs = 24;
                isRealTime = Convert.ToBoolean(paramRequest.Parameters.Where(x => x.ParamName.Contains("isRealTime")).FirstOrDefault().ParamValue);
                refreshHrs = Convert.ToInt32(paramRequest.Parameters.Where(x => x.ParamName.Contains("refreshHrs")).FirstOrDefault().ParamValue);

                if (isRealTime)
                {
                    selectionType = "2";
                }

                DateTime fromDate = DateTime.Now;
                DateTime toDate = DateTime.Now;

                try
                {
                    fromDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDate")).FirstOrDefault().ParamValue.ToString());
                    toDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDate")).FirstOrDefault().ParamValue.ToString());

                    //Convert date to UTC
                    fromDate = fromDate.ToUniversalTime();
                    toDate = toDate.ToUniversalTime();

                }
                catch (Exception)
                {


                }

                objBroomstickData.WellName = DataService.checkNull(paramRequest.objDataService.getValueFromDatabase("SELECT WELL_NAME FROM VMX_WELL WHERE WELL_ID='" + wellId.Replace("'", "'''") + "'"), "").ToString();

                //Get the primary time log 
                VuMaxDR.Data.Objects.TimeLog objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLog(ref paramRequest.objDataService, wellId);

                if(objTimeLog.logCurves.ContainsKey("DEPTH"))
                {
                    objBroomstickData.depthUnit = objTimeLog.logCurves["DEPTH"].VuMaxUnitID;
                }

                if (objTimeLog.logCurves.ContainsKey("HKLD"))
                {
                    objBroomstickData.hkldUnit = objTimeLog.logCurves["HKLD"].VuMaxUnitID;
                }

                if (objTimeLog.logCurves.ContainsKey("STOR"))
                {
                    objBroomstickData.torqueUnit = objTimeLog.logCurves["STOR"].VuMaxUnitID;
                }

                //if (selectionType == "-1")
                if (selectionType == "-1" || selectionType == "2")
                {

                    if (objTimeLog != null)
                    {

                        DateTime minDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramRequest.objDataService));
                        DateTime maxDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref paramRequest.objDataService));

                        //double secondsDiff = Math.Abs((maxDate - minDate).TotalSeconds);
                        //double diff = (secondsDiff * 10) / 100;
                        //if (isRealTime)
                        //{
                        //    minDate = maxDate.AddHours(-refreshHrs);
                        //}


                        double diff = 0;
                        if (selectionType == "-1" && !isRealTime)
                        {
                            diff = 86400; //10% data for slider
                            minDate = maxDate.AddSeconds(-1 * diff);
                        }
                        else
                        {
                            minDate = maxDate.AddHours(-refreshHrs);
                        }

                        minDate = maxDate.AddSeconds(-1 * diff);

                        fromDate = minDate;
                        toDate = maxDate;

                        selectionType = "0";
                    }
                }
                else
                {
                    objResponse.RequestSuccessfull = false;
                    objResponse.Errors = "Error retrieving data";
                    objResponse.Response = "";
                }


                #region Get Broomstick Plan and Data Points

                string strSQL = "";


                if(RunNo=="")
                {

                    //Retrieve first unique run no. from the data
                    strSQL = "SELECT DISTINCT(RUN_NO) AS RUN_NO  FROM VMX_ADNL_HKLD_PLAN WHERE WELL_ID='" + wellId + "'";

                    DataTable objData = paramRequest.objDataService.getTable(strSQL);

                    if (objData.Rows.Count > 0)
                    {

                        RunNo = DataService.checkNull(objData.Rows[0]["RUN_NO"], "").ToString();
                    }

                    objData.Dispose();

                }


                strSQL = "SELECT PLAN_ID,PLAN_NAME FROM VMX_ADNL_HKLD_PLAN WHERE WELL_ID='" + wellId + "' AND RUN_NO='" + RunNo.Replace("'", "''") + "'";

                DataTable objPlanData = paramRequest.objDataService.getTable(strSQL);

                bool rotDataAdded = false;

                foreach(DataRow objPlanRow in objPlanData.Rows)
                {

                    
                    string PlanID = DataService.checkNull(objPlanRow["PLAN_ID"], "").ToString();


                    //Get pickup data
                    strSQL = "SELECT * FROM VMX_ADNL_HKLD_PLAN_DATA WHERE WELL_ID='" + wellId + "' AND PLAN_ID='" + PlanID + "' AND PLAN_TYPE='PKUP'";

                    DataTable objPlanDataPoints = paramRequest.objDataService.getTable(strSQL);

                    if(objPlanDataPoints.Rows.Count>0)
                    {


                        //Now get the plan data according to plan types
                        BroomstickPlanData objPlan = new BroomstickPlanData();
                        objPlan.PlanType = "PKUP";
                        objPlan.PlanID = PlanID;
                        objPlan.PlanName = DataService.checkNull(objPlanRow["PLAN_NAME"], "").ToString();
                        objPlan.PlanColor = ColorTranslator.ToHtml(System.Drawing.Color.Black);

                        if (objPlan.PlanName.Contains("0.1"))
                        {
                            objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-7105537));
                        }

                        if (objPlan.PlanName.Contains("0.2"))
                        {
                            objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-9474049));
                        }

                        if (objPlan.PlanName.Contains("0.3"))
                        {
                            objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-11184641));
                        }

                        if (objPlan.PlanName.Contains("0.4"))
                        {
                            objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-15395329));
                        }

                        if (objPlan.PlanName.Contains("0.5"))
                        {
                            objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-16777065));
                        }


                        foreach(DataRow objDataPoints in objPlanDataPoints.Rows)
                        {

                            PlanDataPoint objPoint = new PlanDataPoint();
                            objPoint.Depth = double.Parse(DataService.checkNull(objDataPoints["DEPTH"], 0).ToString());
                            objPoint.Value = double.Parse(DataService.checkNull(objDataPoints["WEIGHT"], 0).ToString());

                            objPlan.PlanData.Add(objPoint);

                        }

                        objBroomstickData.HkldPlanData.Add(objPlan);

                    }


                    //Get slack off data
                    strSQL = "SELECT * FROM VMX_ADNL_HKLD_PLAN_DATA WHERE WELL_ID='" + wellId + "' AND PLAN_ID='" + PlanID + "' AND PLAN_TYPE='SLOF'";

                    objPlanDataPoints = paramRequest.objDataService.getTable(strSQL);

                    if (objPlanDataPoints.Rows.Count > 0)
                    {

                        //Now get the plan data according to plan types
                        BroomstickPlanData objPlan = new BroomstickPlanData();
                        objPlan.PlanType = "SLOF";
                        objPlan.PlanID = PlanID;
                        objPlan.PlanName = DataService.checkNull(objPlanRow["PLAN_NAME"], "").ToString();
                        objPlan.PlanColor = ColorTranslator.ToHtml(System.Drawing.Color.Black);

                        if (objPlan.PlanName.Contains("0.1"))
                        {
                            objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-5116990));
                        }

                        if (objPlan.PlanName.Contains("0.2"))
                        {
                            objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-8781959));
                        }

                        if (objPlan.PlanName.Contains("0.3"))
                        {
                            objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-16717824));
                        }

                        if (objPlan.PlanName.Contains("0.4"))
                        {
                            objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-16730368));
                        }

                        if (objPlan.PlanName.Contains("0.5"))
                        {
                            objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-16744448));
                        }


                        foreach (DataRow objDataPoints in objPlanDataPoints.Rows)
                        {

                            PlanDataPoint objPoint = new PlanDataPoint();
                            objPoint.Depth = double.Parse(DataService.checkNull(objDataPoints["DEPTH"], 0).ToString());
                            objPoint.Value = double.Parse(DataService.checkNull(objDataPoints["WEIGHT"], 0).ToString());

                            objPlan.PlanData.Add(objPoint);

                        }

                        objBroomstickData.HkldPlanData.Add(objPlan);

                    }


                    //Get rotate data
                    if (!rotDataAdded)
                    {
                        rotDataAdded = true;
                        strSQL = "SELECT * FROM VMX_ADNL_HKLD_PLAN_DATA WHERE WELL_ID='" + wellId + "' AND PLAN_ID='" + PlanID + "' AND PLAN_TYPE='ROT'";

                        objPlanDataPoints = paramRequest.objDataService.getTable(strSQL);

                        if (objPlanDataPoints.Rows.Count > 0)
                        {

                            //Now get the plan data according to plan types
                            BroomstickPlanData objPlan = new BroomstickPlanData();
                            objPlan.PlanType = "ROT";
                            objPlan.PlanID = PlanID;
                            objPlan.PlanName = DataService.checkNull(objPlanRow["PLAN_NAME"], "").ToString();
                            objPlan.PlanColor = ColorTranslator.ToHtml(System.Drawing.Color.Black);

                            //if (objPlan.PlanName.Contains("0.1"))
                            //{
                            //    objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-7105537));
                            //}

                            //if (objPlan.PlanName.Contains("0.2"))
                            //{
                            //    objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-9474049));
                            //}

                            //if (objPlan.PlanName.Contains("0.3"))
                            //{
                            //    objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-11184641));
                            //}

                            //if (objPlan.PlanName.Contains("0.4"))
                            //{
                            //    objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-15395329));
                            //}

                            //if (objPlan.PlanName.Contains("0.5"))
                            //{
                            //    objPlan.PlanColor = ColorTranslator.ToHtml(Color.FromArgb(-16777065));
                            //}


                            foreach (DataRow objDataPoints in objPlanDataPoints.Rows)
                            {

                                PlanDataPoint objPoint = new PlanDataPoint();
                                objPoint.Depth = double.Parse(DataService.checkNull(objDataPoints["DEPTH"], 0).ToString());
                                objPoint.Value = double.Parse(DataService.checkNull(objDataPoints["WEIGHT"], 0).ToString());

                                objPlan.PlanData.Add(objPoint);

                            }

                            objBroomstickData.HkldPlanData.Add(objPlan);
                        }

                    }


                }

                #endregion


                #region Retrieve broomstick calculated points
                strSQL = "SELECT * FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + wellId + "' AND TYPE=0";

                DataTable objPUPoints = paramRequest.objDataService.getTable(strSQL);

                foreach(DataRow bsRow in objPUPoints.Rows)
                {
                    BroomstickDataPoint objPoint = new BroomstickDataPoint();
                    objPoint.Depth = double.Parse(DataService.checkNull(bsRow["DEPTH"], 0).ToString());
                    objPoint.Value= double.Parse(DataService.checkNull(bsRow["DYNAMIC_VALUE"], 0).ToString());

                    objBroomstickData.PickupPoints.Add(objPoint);
                }


                strSQL = "SELECT * FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + wellId + "' AND TYPE=1";

                DataTable objSOPoints = paramRequest.objDataService.getTable(strSQL);

                foreach (DataRow bsRow in objSOPoints.Rows)
                {
                    BroomstickDataPoint objPoint = new BroomstickDataPoint();
                    objPoint.Depth = double.Parse(DataService.checkNull(bsRow["DEPTH"], 0).ToString());
                    objPoint.Value = double.Parse(DataService.checkNull(bsRow["DYNAMIC_VALUE"], 0).ToString());

                    objBroomstickData.SlackOffPoints.Add(objPoint);
                }


                strSQL = "SELECT * FROM VMX_BROOMSTICK_POINTS WHERE WELL_ID='" + wellId + "' AND TYPE=2";

                DataTable objRotPoints = paramRequest.objDataService.getTable(strSQL);

                foreach (DataRow bsRow in objRotPoints.Rows)
                {
                    BroomstickDataPoint objPoint = new BroomstickDataPoint();
                    objPoint.Depth = double.Parse(DataService.checkNull(bsRow["DEPTH"], 0).ToString());
                    objPoint.Value = double.Parse(DataService.checkNull(bsRow["DYNAMIC_VALUE"], 0).ToString());

                    objBroomstickData.RotatePoints.Add(objPoint);
                }
                #endregion


                objBroomstickData.RunNo = RunNo;

                //Get the list of run nos. 
                DataTable objRunData = paramRequest.objDataService.getTable("SELECT DISTINCT(RUN_NO) FROM VMX_ADNL_HKLD_PLAN WHERE WELL_ID='" + wellId + "' ORDER BY RUN_NO");

                if(objRunData!=null)
                {
                    foreach (DataRow objRunRow in objRunData.Rows)
                    {
                        string lnRuNo = DataService.checkNull(objRunRow["RUN_NO"], "").ToString();

                        objBroomstickData.RunList.Add(lnRuNo);
                    }

                    objRunData.Dispose();
                }


                objResponse.Response = JsonConvert.SerializeObject(objBroomstickData);

                return objResponse;
            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in getDrlgConnections " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }


    }

}
