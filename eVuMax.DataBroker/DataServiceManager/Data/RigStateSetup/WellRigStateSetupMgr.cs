using eVuMax.DataBroker.Broker;
using eVuMax.DataBroker.DataServiceManager.Setup.RigState;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager 
{
    public class WellRigStateSetupMgr : IBroker
    {
        const string loadRigStateSetup = "loadRigStateSetup";
        const string saveRigStateSetup = "saveRigStateSetup";
        const string calcRigState = "calcRigState";



        public eVuMaxLogger.eVuMaxLogger objLogger = new eVuMaxLogger.eVuMaxLogger();

        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try


            {
                BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == loadRigStateSetup)
                {

                    string WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();

                    VuMaxDR.Data.Objects.rigState objRigState = new VuMaxDR.Data.Objects.rigState();
                    objRigState = rigState.loadWellRigStateSetup(ref paramRequest.objDataService, WellID);

                    if (!(objRigState is null))
                    {
                        

                        rigState objCommonRigState = rigState.loadCommonRigStateSetup(ref paramRequest.objDataService);

                        if ((objCommonRigState is null))
                        {
                            string LastError = "";
                            rigState.SaveWellRigStateSetup(ref paramRequest.objDataService, WellID, objCommonRigState, ref LastError);
                        }
                    }


                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objRigState);
                    return objResponse;

                }


     

                return objResponse;

            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Warnings = ex.Message;
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                


                if (paramRequest.Function == saveRigStateSetup)
                {
                    VuMaxDR.Data.Objects.rigState objRigState = new VuMaxDR.Data.Objects.rigState();
                    Dictionary<int, eRigStateItem> objRigStateItems = new Dictionary<int, eRigStateItem>();

                    string userID = "";
                    string WellID = "";
                    string strObjRigStateSetup = "";
                    string strRigStateItems = "";
                    string strUnknownColor = "";


                    userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                    WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();
                    strObjRigStateSetup = paramRequest.Parameters.Where(x => x.ParamName.Contains("objRigStateSetup")).FirstOrDefault().ParamValue.ToString();
                    strRigStateItems = paramRequest.Parameters.Where(x => x.ParamName.Contains("objRigStateItems")).FirstOrDefault().ParamValue.ToString();
                    strUnknownColor = paramRequest.Parameters.Where(x => x.ParamName.Contains("UnknownColor")).FirstOrDefault().ParamValue.ToString();


                  
                    if (strObjRigStateSetup != "")
                    {
                        try
                        {
                            objRigState = JsonConvert.DeserializeObject<VuMaxDR.Data.Objects.rigState>(strObjRigStateSetup);
                            
                        }
                        catch (Exception ex)
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = false;
                            objResponse.Warnings = "Error DeserializeObject ObjRigState";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                    if (strUnknownColor != "")
                    {
                        try
                        {
                            objRigState.UnknownColor = ColorTranslator.FromHtml(strUnknownColor).ToArgb();

                        }
                        catch (Exception ex)
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = false;
                            objResponse.Warnings = "Error DeserializeObject ObjRigState";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                    if (strRigStateItems != "")
                    {
                        try
                        {
                            objRigStateItems = JsonConvert.DeserializeObject<Dictionary<int, eRigStateItem>>(strRigStateItems);

                        }
                        catch (Exception ex)
                        {
                            objResponse = paramRequest.createResponseObject();
                            objResponse.RequestSuccessfull = false;
                            objResponse.Warnings = "Error DeserializeObject objRigStateItems";
                            objResponse.Response = "";
                            return objResponse;

                        }
                    }


                    foreach (eRigStateItem objItem in objRigStateItems.Values)
                    {
                        foreach (VuMaxDR.Data.Objects.rigStateItem objItem1 in objRigState.rigStates.Values)
                        {

                            
                            if(objItem1.Number == objItem.Number)
                            {
                                objItem1.Color = ColorTranslator.FromHtml(objItem.Color).ToArgb();
                                break;
                            }
                            
                        }
                    }


                    string LastError = "";
                    if (rigState.SaveWellRigStateSetup(ref paramRequest.objDataService, WellID, objRigState, ref LastError))
                    {
                        VuMaxDR.Data.Objects.Well objWell = VuMaxDR.Data.Objects.Well.loadWellStructure(ref paramRequest.objDataService, WellID);
                        TimeLog objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref paramRequest.objDataService, WellID);

                        if (!(objTimeLog is null))
                        {
                            CalRigStateDateRange objCalRigStateDateRange = new CalRigStateDateRange();
                            //objCalRigStateDateRange.FromDate    = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramRequest.objDataService));
                            //objCalRigStateDateRange.ToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref paramRequest.objDataService));

                            WellWorkSpace objWorkSpace = new WellWorkSpace(paramRequest.objDataService);
                            objWorkSpace.loadWorkSpace();




                            //objWorkSpace.Wells(objTimeLog.WellID);
                            //                      public Dictionary<string, VuMaxDR.Data.Objects.Well> Wells = new Dictionary<string, VuMaxDR.Data.Objects.Well>();

                            //objWorkSpace.Wells = new Dictionary<string, VuMaxDR.Data.Objects.Well>();


                            objCalRigStateDateRange.FromDate = utilFunctionsDO.convertUTCToWellTimeZone(DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramRequest.objDataService)), objWorkSpace.Wells[objTimeLog.WellID]);
                            objCalRigStateDateRange.ToDate = utilFunctionsDO.convertUTCToWellTimeZone(DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref paramRequest.objDataService)), objWorkSpace.Wells[objTimeLog.WellID]);




                            objResponse.RequestSuccessfull = true;
                            objResponse.Response = JsonConvert.SerializeObject(objCalRigStateDateRange);
                            return objResponse;
                        }
                        else
                        {
                            objResponse.RequestSuccessfull = true;
                            objResponse.Response = "";
                            objResponse.Warnings = " Error : Timelog not found";
                            return objResponse;

                        }
                       
                    }
                    else
                    {
                        objResponse = paramRequest.createResponseObject();
                        objResponse.RequestSuccessfull = false;
                        objResponse.Warnings = LastError;
                        objResponse.Response = LastError;
                        return objResponse;
                    }

                    objResponse.RequestSuccessfull = true;
                    objResponse.Response = JsonConvert.SerializeObject(objRigState);
                    return objResponse;


                }

                if (paramRequest.Function == calcRigState)
                {

                    objResponse = doCalculate(paramRequest);
                    

                }

                return objResponse;

            }
            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Warnings = ex.Message;
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }

        public BrokerResponse doCalculate(BrokerRequest paramRequest)
        {
            try
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();

                string userID = paramRequest.Parameters.Where(x => x.ParamName.Contains("UserID")).FirstOrDefault().ParamValue.ToString();
                string WellID = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellID")).FirstOrDefault().ParamValue.ToString();
                string selectionType = paramRequest.Parameters.Where(x => x.ParamName.Contains("selectedval")).FirstOrDefault().ParamValue.ToString();

                DateTime FromDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("FromDate")).FirstOrDefault().ParamValue.ToString());
                DateTime ToDate = DateTime.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("ToDate")).FirstOrDefault().ParamValue.ToString());

                WellWorkSpace objWorkSpace = new WellWorkSpace(paramRequest.objDataService);
                VuMaxDR.Data.Objects.HoleDepthCalculator objCalculator = new HoleDepthCalculator(); 

                objWorkSpace.loadWorkSpace();

                TimeLog objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref paramRequest.objDataService, WellID);
                VuMaxDR.Data.Objects.Well objWell = objWorkSpace.Wells[objTimeLog.WellID];
                rigState objRigState = rigState.loadWellRigStateSetup(ref paramRequest.objDataService, objTimeLog.WellID);

                DateTime startDate = FromDate;

                if (objWell.wellDateFormat == VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                {

                    startDate = utilFunctionsDO.convertWellTimeZoneToUTC(startDate, objWell);
                }
                else
                {

                    startDate = utilFunctionsDO.convertWellToLocalTimeZone(startDate, objWell);

                }

                DateTime rangeStartDate = startDate;
                DateTime rangeEndDate = ToDate;


                if (objWell.wellDateFormat == VuMaxDR.Data.Objects.Well.wDateFormatUTC)
                {
                    rangeStartDate = utilFunctionsDO.convertWellTimeZoneToUTC(rangeStartDate, objWell);
                    rangeEndDate = utilFunctionsDO.convertWellTimeZoneToUTC(rangeEndDate, objWell);
                }
                else
                {
                    rangeStartDate = utilFunctionsDO.convertWellToLocalTimeZone(rangeStartDate, objWell);
                    rangeEndDate = utilFunctionsDO.convertWellToLocalTimeZone(rangeEndDate, objWell);
                }


                if (selectionType=="0")
                {
                    startDate = DateTime.FromOADate(objTimeLog.getFirstIndexOptimized(ref paramRequest.objDataService));
                                  //     objCalculator.calculateRigStates(ref paramRequest.objDataService, objTimeLog.WellID, objTimeLog.WellboreID, objTimeLog.ObjectID);

                    //test for push
                    Task thread1 = Task.Factory.StartNew(() => calculateRigStates(ref paramRequest.objDataService, objTimeLog.WellID, objTimeLog.WellboreID, objTimeLog.ObjectID));
                    //Task thread2 = Task.Factory.StartNew(() => fun1());
                    Task.WaitAll(thread1);
                    //Console.WriteLine("The End");
                    System.Diagnostics.Debug.WriteLine("The End");

                }

                if (selectionType == "1")
                {
                    //startDateUTC = startDate;
                    objCalculator.processFromDate = startDate;
                    objCalculator.processToDate = DateTime.FromOADate(objTimeLog.getLastIndexOptimized(ref paramRequest.objDataService));
                    objCalculator.calculateRigStatesRange(ref paramRequest.objDataService, objTimeLog.WellID, objTimeLog.WellboreID, objTimeLog.ObjectID);
                }

                if (selectionType == "2")
                {
                    objCalculator.processFromDate = rangeStartDate;
                    objCalculator.processToDate = rangeEndDate;
                    objCalculator.calculateRigStatesRange(ref paramRequest.objDataService, objTimeLog.WellID, objTimeLog.WellboreID, objTimeLog.ObjectID);

                    //    startDateUTC = startDate
                    //objCalculator.processFromDate = startDate
                    //objCalculator.processToDate = Date.FromOADate(objTimeLog.getLastIndexOptimized(objLocalConn))
                    //objCalculator.calculateRigStatesRange(objLocalConn, objTimeLog.WellID, objTimeLog.WellboreID, objTimeLog.ObjectID)

                    


                }

                objResponse.RequestSuccessfull = true;
                objResponse.Response = "";
                return objResponse;
            }

            catch (Exception ex)
            {
                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Warnings = ex.Message;
                objResponse.Response = ex.Message +" " +  ex.StackTrace;
                return objResponse;

            }
        }

        static void fun1()
        {
            for (int i = 0; i < 10000; i++)
            {
                //Console.WriteLine("Thread 1" + i);
                System.Diagnostics.Debug.WriteLine("Thread Prath 1" + i);
            }
        }


        
        public void calculateRigStates(ref DataService objDataService, string paramWellID, string paramWellboreID, string paramLogID)
        {
            try
            {

                //objDataService = paramDataService;
                string WellID = paramWellID;
                string WellboreID = paramWellboreID;
                string LogID = paramLogID;

                string methodName = "";
                //var objThread = new System.Threading.Thread(calculateRigStates);
                this.calculateRigStates(ref objDataService, WellID, WellboreID, LogID, methodName);

                //objThread.Start();
            }

            catch (Exception ex)
            {

            }
        }


        public void calculateRigStates(ref DataService objDataService, string WellID, string WellboreID, string LogID, string methodName)
        {
            try
            {

                string LastError = "";
                TimeLog objTimeLog = TimeLog.loadTimeLog(ref objDataService, WellID, WellboreID, LogID, ref LastError);

                var objBulkExecutor = new BulkCommandExecutor(ref objDataService, 50);


                if (objTimeLog != null)
                {

                    string dataTableName = objTimeLog.getDataTableName(ref objDataService);

                    // 'Calculate Rig States
                    rigState objRigState = rigState.loadWellRigStateSetup(ref objDataService, WellID);

                    var ToDate = DateTime.FromOADate(objTimeLog.getLastIndex(ref objDataService));
                    var FirstDate = DateTime.FromOADate(objTimeLog.getFirstIndex(ref objDataService));

                    objRigState.DoNotPause = true;
                    objRigState.updateRigStateNoBreakSmall(ref objDataService, objTimeLog, FirstDate, ToDate);
                }

                //Completed?.Invoke();
            }
            catch (Exception ex)
            {
                //Completed?.Invoke();
            }
        }


    }

    public class CalRigStateDateRange
    {
        public DateTime FromDate = new DateTime();
        public  DateTime ToDate = new DateTime();

    }

    

}
