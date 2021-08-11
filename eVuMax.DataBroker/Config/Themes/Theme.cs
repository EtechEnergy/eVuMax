using eVuMax.DataBroker.Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using Newtonsoft.Json;
using eVuMax.DataBroker.Broker;

namespace eVuMax.DataBroker.Themes
{
    public class ThemeHeader
    {

        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public List<ThemeProps> props = new List<ThemeProps>();




    }

    public class ThemeProps
    {

        public string PropValue { get; set; } = "";
        public string PropName { get; set; } = "";
    }


    public class ThemeMgr : IBroker
    {


        DataService objDataService = null;
        public string LastError { get; set; }

        //public ThemeMgr(DataService paramDataService)
        //{

        //    objDataService = paramDataService;

        //}


        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                //TO-DO -- Validate the user with or without AD Integration and return the result
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();

                if (paramRequest.Function == "ThemeList")
                {
                    Themes.ThemeMgr objThemeMgr = new Themes.ThemeMgr();

                    DataTable objData = objThemeMgr.getThemeList(paramRequest);

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
                if (paramRequest.Function == "Load")
                {
                    Themes.ThemeMgr objThemeMgr = new Themes.ThemeMgr();

                    ThemeHeader objTheme = objThemeMgr.Load(paramRequest);

                    if (objTheme != null)
                    {
                        objResponse.Response = JsonConvert.SerializeObject(objTheme);
                    }
                    else
                    {
                        objResponse.RequestSuccessfull = false;
                        objResponse.Errors = "Error retrieving data";
                        objResponse.Response = "";

                    }

                    return objResponse;

                }

                if (paramRequest.Function == "LoadTheme")
                {
                    Themes.ThemeMgr objThemeMgr = new Themes.ThemeMgr();

                    DataTable objData = objThemeMgr.LoadTheme(paramRequest);

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


                //No matching function found ...
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

                //ThemeMgr objMgr = new ThemeMgr(paramRequest.objDataService);
                ThemeMgr objMgr = new ThemeMgr();
                // Broker.BrokerResponse _objBadResponse = paramRequest.createResponseObject();
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();


                if (paramRequest.Function == "AddTheme")
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


                if (paramRequest.Function == "EditTheme")
                {
                    //TO-DO -- Return list of themes as DataTable format

                    if (!objMgr.Update(paramRequest))
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

                if (paramRequest.Function == "RemoveTheme")
                {
                    //TO-DO -- Return list of themes as DataTable format
                    if (!objMgr.Remove(paramRequest))
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


                //No matching function found ...
                Broker.BrokerResponse objBadResponse = paramRequest.createResponseObject();
                objBadResponse.RequestSuccessfull = false;
                objBadResponse.Errors = "Invalid Request Function. Use proper function name in the Broker Request";
                return objBadResponse;


            }
            catch (Exception ex)
            {
                return paramRequest.createResponseObject();
            }
        }


        
        public bool Add(Broker.BrokerRequest paramRequest)
        {


            ThemeHeader objTheme = new ThemeHeader();

            objTheme = JsonConvert.DeserializeObject<ThemeHeader>(paramRequest.Parameters[0].ParamValue);

            SqlTransaction objTranHandle = null;

            try
            {

                string strSQL = "";
                //objDataService.startTransaction();
                string Id = Guid.NewGuid().ToString();

                strSQL = " INSERT INTO [dbo].[eVuMaxThemeHeader] ([Id] ,[Name],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate]) VALUES ( " +
                        "'" + Id.ToString() + "'," +
                         "'" + objTheme.Name.ToString() + "'," +
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

                foreach (ThemeProps objProps in objTheme.props)
                {
                    strSQL = " INSERT INTO [dbo].[eVuMaxThemeDetails] ([Id],[PropertyName],[Value],[CreatedBy] ,[CreatedDate],[ModifiedBy],[ModifiedDate]) VALUES (  " +
                        "'" + Id.ToString() + "'," +
                        "'" + objProps.PropName.ToString() + "'," +
                        "'" + objProps.PropValue.ToString() + "'," +
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

                }

                return true;

            }
            catch (Exception ex)
            {
                return false;

            }
        }

         /// Update Theme
        /// </summary>
        /// <param name="objTheme"></param>
        /// <returns></returns>
        private bool Update(Broker.BrokerRequest paramRequest)
        {


            ThemeHeader objTheme = new ThemeHeader();
            objTheme = JsonConvert.DeserializeObject<ThemeHeader>(paramRequest.Parameters[0].ParamValue);

            SqlTransaction objTranHandle = null;

            try
            {

                string strSQL = "";
               // paramRequest.objDataService.startTransaction();


                strSQL = " UPDATE [dbo].[eVuMaxThemeHeader] SET " +
                         " Name = '" + objTheme.Name + "'," +
                         " ModifiedBy = '" + Util.checkQuote(paramRequest.objDataService.UserName) + "'," +
                         " ModifiedDate = '" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "'" +
                         " WHERE Id ='" + objTheme.Id + "'";

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


                strSQL = " DELETE FROM [dbo].[eVuMaxThemeDetails] WHERE ID ='" + objTheme.Id + "'";

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


                foreach (ThemeProps objProps in objTheme.props)
                {
                    strSQL = " INSERT INTO [dbo].[eVuMaxThemeDetails] ([Id],[PropertyName],[Value],[CreatedBy] ,[CreatedDate],[ModifiedBy],[ModifiedDate]) VALUES (  " +
                        "'" + objTheme.Id.ToString() + "'," +
                        "'" + objProps.PropName.ToString() + "'," +
                        "'" + objProps.PropValue.ToString() + "'," +
                         "'" + Util.checkQuote(paramRequest.objDataService.UserName) + "'," +
                         "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "'," +
                         "'" + Util.checkQuote(paramRequest.objDataService.UserName) + "'," +
                         "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";

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

                }




                return true;
            }
            catch (Exception ex)
            {

                return false;
            }
        }


        
        private bool Remove(Broker.BrokerRequest paramRequest)
        {
            ThemeHeader objTheme = new ThemeHeader();
            string Id = paramRequest.Parameters[0].ParamValue;

            SqlTransaction objTranHandle = null;

            try
            {

                // check if id used in user pref
                string strSQL = "";

                 strSQL = "SELECT ThemeId FROM [dbo].[eVuMaxUserPref] WHERE ThemeId ='" + Id + "'";
             

                if (paramRequest.objDataService.IsRecordExist(strSQL))
                {
                    LastError = "Default theme can not be removed";
                    return false;
                }


               

                strSQL = "DELETE FROM [dbo].[eVuMaxThemeHeader] WHERE Id ='" + Id + "'";

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


                strSQL = "DELETE FROM [dbo].[eVuMaxThemeDetails] WHERE Id ='" + Id + "'";

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
            catch (Exception ex)
            {
                return false;

            }
        }

        /// <summary>
        /// Get ThemeList
        /// </summary>
        /// <param name="paramRequest"></param>
        /// <returns></returns>
        private DataTable getThemeList(Broker.BrokerRequest paramRequest) {

            try
            {
                
                string strSQL = "";
                strSQL = "SELECT *  FROM dbo.eVuMaxThemeHeader ";
                DataTable objData = paramRequest.objDataService.getTable(strSQL);
             
                if (objData != null)
                {
                    return objData;
                }

                return null;
                }
            catch (Exception ex)
            {

                return null;
            }
        }

        private ThemeHeader Load(Broker.BrokerRequest paramRequest)
        {

            try
            {
                ThemeHeader objTheme = new ThemeHeader();
                string strSQL = "";
                string Id = paramRequest.Parameters[0].ParamValue;
                strSQL = "SELECT *  FROM dbo.eVuMaxThemeHeader WHERE ID ='" + Id + "'";
                DataTable objData = paramRequest.objDataService.getTable(strSQL);

                if (objData != null)
                {
                    objTheme.Id = Util.checkDBNull(objData.Rows[0]["Id"], string.Empty).ToString();
                    objTheme.Name = Util.checkDBNull(objData.Rows[0]["Name"], string.Empty).ToString();

                    strSQL = "SELECT *  FROM dbo.eVuMaxThemeDetails WHERE ID ='" + Id + "'";
                    DataTable objDetails = paramRequest.objDataService.getTable(strSQL);


                    if (objDetails.Rows.Count > 0 )
                    {
                        foreach (DataRow objRow in objDetails.Rows)
                        {
                            ThemeProps objProps = new ThemeProps();

                            objProps.PropName = Util.checkDBNull(objRow["PropertyName"], string.Empty).ToString(); 
                            objProps.PropValue = Util.checkDBNull(objRow["Value"], string.Empty).ToString();
                            objTheme.props.Add(objProps);
                        }

                    }



                    return objTheme;
                }

                return null;
            }
            catch (Exception ex)
            {

                return null;
            }
        }

        private DataTable LoadTheme(BrokerRequest paramRequest)
        {
            try
            {
                string userId = paramRequest.Parameters[0].ParamValue;
                string strSQL = "";
                strSQL = " SELECT  A.PropertyName, A.Value, A.Id  FROM eVuMaxThemeDetails A   LEFT JOIN eVuMaxUserPref B on A.Id = B.ThemeId WHERE B.UserId ='" + userId + "'";
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


    }




}
