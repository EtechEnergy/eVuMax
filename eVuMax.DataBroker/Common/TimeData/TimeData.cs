using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;
using System.Data;
using Newtonsoft.Json;
using System.Drawing;

namespace eVuMax.DataBroker.Common.TimeData
{

    public class TimeDataExtents
    {
        public DateTime MinDate { get; set; }
        public DateTime MaxDate { get; set; }
        public double MinDepth { get; set; }
        public double MaxDepth { get; set; }
    }

    public class TimeData : IBroker
    {



        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Function == "TimeDataAll")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = getTimeDataAll(paramRequest);

                    return objResponse;
                }


                if (paramRequest.Function == "TimeDataExtents")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    objResponse = getTimeDataExtents(paramRequest);

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
                return paramRequest.createResponseObject();
            }
            catch (Exception ex)
            {
                return paramRequest.createResponseObject();
            }
        }


        private Broker.BrokerResponse getTimeDataAll(Broker.BrokerRequest paramRequest)
        {
            try
            {

                string WellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;
                string ChannelList = paramRequest.Parameters.Where(x => x.ParamName.Contains("ChannelList")).FirstOrDefault().ParamValue;
                double Resolution = double.Parse(paramRequest.Parameters.Where(x => x.ParamName.Contains("Resolution")).FirstOrDefault().ParamValue.ToString());

                string strSQL = "";


                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();


                VuMaxDR.Data.Objects.TimeLog objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref paramRequest.objDataService, WellId);

                if (objTimeLog == null)
                {

                    //Return failed response 

                }
                else
                {
                    //get the record count
                    var lnRecordCount = paramRequest.objDataService.getValueFromDatabase("SELECT COUNT(*) FROM [" + objTimeLog.__dataTableName + "]");

                    if (lnRecordCount != null)
                    {

                        int recordCount = int.Parse(lnRecordCount.ToString());

                        double Factor = 1;

                        if (recordCount > Resolution)
                        {
                            Factor = recordCount / Resolution;
                        }

                        Factor = Math.Ceiling(Factor);

                        string[] arrChannles = ChannelList.Split(',');

                        string fieldList = "";
                        string aliasList = "";

                        for (int i = 0; i < arrChannles.Length; i++)
                        {
                            fieldList = fieldList + ",([" + arrChannles[i] + "]) AS C" + (i + 1).ToString() + " ";

                            if (arrChannles[i] == "DATETIME")
                            {
                                aliasList = aliasList + ",MAX(C" + (i + 1).ToString() + ") AS [" + "DATETIME1" + "]";
                            }
                            else
                            {
                                aliasList = aliasList + ",AVG(C" + (i + 1).ToString() + ") AS [" + arrChannles[i] + "]";
                            }
                        }

                        if (fieldList.Trim() != "")
                        {
                            fieldList = fieldList.Substring(1);
                            aliasList = aliasList.Substring(1);
                        }


                        strSQL = "; WITH T AS(SELECT RANK() OVER(ORDER BY DATETIME) Rank, " + fieldList;
                        strSQL = strSQL + " FROM [" + objTimeLog.__dataTableName + "]) ";
                        strSQL = strSQL + " SELECT(Rank - 1) / " + Factor.ToString() + " DATETIME , " + aliasList;
                        strSQL = strSQL + " FROM t ";
                        strSQL = strSQL + " GROUP BY((Rank-1) / " + Factor.ToString() + ") ";
                        strSQL = strSQL + " ORDER BY DATETIME ";

                        DataTable objData = paramRequest.objDataService.getTable(strSQL);
                        //prath added for color each point line series 26-11-2020
                        objData.Columns.Add("COLOR", typeof(System.String));

                        foreach (DataRow objRow in objData.Rows)
                        {
                            objRow["COLOR"] = ColorTranslator.ToHtml(Color.FromArgb(Convert.ToInt32(objRow["RIG_STATE_COLOR"])));
                        }
                        //objData.Columns.Remove("RIG_STATE_COLOR");
                        //=================================================

                        if (objData != null)
                        {

                            objResponse.RequestSuccessfull = true;
                            objResponse.Response = JsonConvert.SerializeObject(objData);
                            return objResponse;

                        }
                        else
                        {
                            //Return failed response
                        }
                    }
                    else
                    {
                        //Return failed response
                    }
                }


                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data";
                objResponse.Response = "";


                return objResponse;

            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in getTimeDataAll " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }




        private Broker.BrokerResponse getTimeDataExtents(Broker.BrokerRequest paramRequest)
        {
            try
            {

                string WellId = paramRequest.Parameters.Where(x => x.ParamName.Contains("WellId")).FirstOrDefault().ParamValue;

                string strSQL = "";


                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();


                VuMaxDR.Data.Objects.TimeLog objTimeLog = VuMaxDR.Data.Objects.Well.getPrimaryTimeLogWOPlan(ref paramRequest.objDataService, WellId);

                if (objTimeLog == null)
                {

                    //Return failed response 

                }
                else
                {

                    strSQL = "SELECT MAX_DATE,MIN_DATE,MAX_DEPTH,MIN_DEPTH FROM VMX_TIME_LOG WHERE WELL_ID='" + objTimeLog.WellID + "' AND WELLBORE_ID='" + objTimeLog.WellboreID + "' AND LOG_ID='" + objTimeLog.ObjectID + "'";

                    DataTable objData = paramRequest.objDataService.getTable(strSQL);

                    if (objData != null)
                    {

                        TimeDataExtents objExtents = new TimeDataExtents();


                        objExtents.MinDate = DateTime.Parse(DataService.checkNull(objData.Rows[0]["MIN_DATE"], new DateTime()).ToString());

                        if(objExtents.MinDate !=(new DateTime()))
                        {
                            //Convert to local time
                            objExtents.MinDate = objExtents.MinDate.ToLocalTime();
                        }


                        objExtents.MaxDate = DateTime.Parse(DataService.checkNull(objData.Rows[0]["MAX_DATE"], new DateTime()).ToString());

                        if (objExtents.MaxDate != (new DateTime()))
                        {
                            //Convert to local time
                            objExtents.MaxDate = objExtents.MaxDate.ToLocalTime();
                        }


                        objExtents.MinDepth = double.Parse(DataService.checkNull(objData.Rows[0]["MIN_DEPTH"], 0).ToString());
                        objExtents.MaxDepth = double.Parse(DataService.checkNull(objData.Rows[0]["MAX_DEPTH"], 0).ToString());
                                               
                        objData.Dispose();
                        
                        objResponse.RequestSuccessfull = true;
                        objResponse.Response = JsonConvert.SerializeObject(objExtents);
                        return objResponse;

                    }
                    else
                    {
                        //Return failed response
                    }
                }


                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Error retrieving data";
                objResponse.Response = "";


                return objResponse;

            }
            catch (Exception ex)
            {
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Error in getTimeDataAll " + ex.Message + ex.StackTrace;
                return objBadResponse;
            }
        }


    }
}
