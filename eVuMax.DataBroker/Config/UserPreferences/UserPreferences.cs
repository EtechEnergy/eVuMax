using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using eVuMax.DataBroker.Broker;
using eVuMax.DataBroker.Common;
using Newtonsoft.Json;

namespace eVuMax.DataBroker.Config.UserPrefrences
{
    public class UserPrefrences
    {
        public string UserId { get; set; } = "";
        public string ThemeId { get; set; } = "";
    }


    public class UserPrefMgr : IBroker
    {

        public string LastError { get; set; }


        public BrokerResponse getData(BrokerRequest paramRequest)
        {
            try
            {
                //TO-DO -- Validate the user with or without AD Integration and return the result
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();


                if (paramRequest.Function == "UserprefList")
                {
                    UserPrefMgr objUserPrefsMgr = new UserPrefMgr();

                    DataTable objData = objUserPrefsMgr.getUserPrefList(paramRequest);

                    if (objData != null)
                    {
                        objResponse.Response = JsonConvert.SerializeObject(objData);
                    }
                    else
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "Error retrieving data";
                        objResponse.Response = "";

                    }

                    return objResponse;

                }

                if (paramRequest.Function == "applyTheme")
                {
                    UserPrefMgr objUserPrefsMgr = new UserPrefMgr();

                    DataTable objData = objUserPrefsMgr.getUserPrefList(paramRequest);

                    if (objData != null)
                    {
                        objResponse.Response = JsonConvert.SerializeObject(objData);
                    }
                    else
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "Error retrieving data";
                        objResponse.Response = "";

                    }

                    return objResponse;

                }



            }
            catch (Exception)
            {

                throw;
            }
            //No matching function found ...
            Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
            objBadResponse.RequestSuccessfull = false;
            objBadResponse.Errors = "Invalid Request Function. Use proper function name in the Broker Request";
            return objBadResponse;
        }

        public BrokerResponse performTask(BrokerRequest paramRequest)
        {
            try
            {
                UserPrefMgr objMgr = new UserPrefMgr();
                //TO-DO -- Validate the user with or without AD Integration and return the result
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == "Add")
                {
                    //TO-DO -- Validate the user with or without AD Integration and return the result
                    // Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                    if (!objMgr.Add(paramRequest))
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = objMgr.LastError;
                        return objResponse;
                    }
                    else
                    {
                        objResponse.RequestSuccessfull = true;
                        objResponse.Errors = "";
                        return objResponse;

                    }


                }

            }
            catch (Exception)
            {

                throw;
            }
            //No matching function found ...
            Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
            objBadResponse.RequestSuccessfull = false;
            objBadResponse.Errors = "Invalid Request Function. Use proper function name in the Broker Request";
            return objBadResponse;
        }






        private bool Add(BrokerRequest paramRequest)
        {
            try
            {
                UserPrefrences objUserPref = new UserPrefrences();
                objUserPref = JsonConvert.DeserializeObject<UserPrefrences>(paramRequest.Parameters[0].ParamValue);

                string strSQL = "";


                strSQL = " DELETE FROM [dbo].[eVuMaxUserPref] WHERE UserId ='" + objUserPref.UserId + "'";

                if (paramRequest.objDataService.executeNonQuery(strSQL))
                {
                    // Do Nothing
                }
                else
                {
                    LastError = paramRequest.objDataService.LastError;
                    paramRequest.objDataService.RollBack();
                    return false;
                }

                strSQL = " INSERT INTO [dbo].[eVuMaxUserPref] ([UserId] ,[ThemeId],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate]) VALUES ( " +
                       "'" + objUserPref.UserId.ToString() + "'," +
                        "'" + objUserPref.ThemeId.ToString() + "'," +
                        "'" + Util.checkQuote(paramRequest.objDataService.UserName) + "'," +
                        "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "'," +
                        "'" + Util.checkQuote(paramRequest.objDataService.UserName) + "'," +
                        "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "' )";


                if (paramRequest.objDataService.executeNonQuery(strSQL))
                {
                    // Do Nothing
                }
                else
                {
                    LastError = paramRequest.objDataService.LastError;
                    paramRequest.objDataService.RollBack();
                    return false;
                }


                return true;
            }
            catch (Exception)
            {

                throw;
            }
        }

        private bool Update()
        {
            try
            {
                return true;
            }
            catch (Exception)
            {

                throw;
            }
        }

        private bool Remove()
        {
            try
            {
                return true;
            }
            catch (Exception)
            {

                throw;
            }
        }

        private DataTable getUserPrefList(BrokerRequest paramRequest)
        {
            try
            {
                string userId = paramRequest.Parameters[0].ParamValue;
                string strSQL = "";
                strSQL = "SELECT *  FROM [dbo].[eVuMaxUserPref] WHERE [UserId]='" + userId + "'";
                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                if (objData != null)
                {
                    return objData;
                }

                return null;


            }
            catch (Exception)
            {

                throw;
            }
        }

        private DataTable applyTheme(BrokerRequest paramRequest)
        {
            try
            {
                string userId = paramRequest.Parameters[0].ParamValue;
                string strSQL = "";
                strSQL = " SELECT  A.PropertyName, A.Value  FROM eVuMaxThemeDetails A   LEFT JOIN eVuMaxUserPref B on A.Id = B.ThemeId WHERE B.UserId ='"+ userId + "'";
                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                if (objData != null)
                {
                    return objData;
                }

                return null;


            }
            catch (Exception)
            {

                throw;
            }
        }

        private UserPrefrences Load()
        {
            try
            {
                return null;
            }
            catch (Exception)
            {

                throw;
            }
        }
    }
}
