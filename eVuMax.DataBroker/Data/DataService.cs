using System;
using System.Data;
using System.Data.OleDb;

namespace eVuMax.DataBroker.Data
{
    public class DataService
    {
        public const int COMMAND_TIMEOUT = 300;

        #region Property Definitions

        private string _ConnectionString = "";
        private string _Database = "";
        private string _Server = "";
        private string _UserID = "";
        private string _Password = "";

        public string Database
        {
            get { return _Database; }
            set { _Database = value; }
        }

        public string Server
        {
            get { return _Server; }
            set { _Server = value; }
        }

        public string UserID
        {
            get { return _UserID; }
            set { _UserID = value; }
        }

        public string Password
        {
            get { return _Password; }
            set { _Password = value; }
        }

        public string ConnectionString
        {
            get { return _ConnectionString; }
            set { _ConnectionString = value; }
        }

        #endregion Property Definitions

        #region Other Variables

        public enum vmDatabaseType
        {
            SQLServer = 0,
            Oracle = 1
        }

        //        public SqlServerDataService objSQLServerDB;

        public string LastError = "";
        private System.Data.OleDb.OleDbConnection objConn = new System.Data.OleDb.OleDbConnection();
        public vmDatabaseType DatabaseType = vmDatabaseType.SQLServer;

        #endregion Other Variables

        #region Constructors

        public DataService(string pConnectionString)
        {
            try
            {
                this.UserID = Environment.UserName;
                this.ConnectionString = pConnectionString;
            }
            catch (Exception ex)
            {
            }
        }

        public DataService(string pUserID, string pPassword, string pServer)
        {
            try
            {
                this.UserID = pUserID;
                this.Password = pPassword;
                this.Server = pServer;
            }
            catch (Exception ex)
            {
            }
        }

        #endregion Constructors

        #region Methods

        /// <summary>
        /// Opens the connection to the database
        /// </summary>
        /// <returns></returns>
        public bool OpenConnection()
        {
            try
            {
                //Check the current state of the connection
                if (getConnStatus())
                {
                    //Connection already open. Reject the request and return.
                    LastError = "Connection already open";
                    return false;
                }

                //Initialize a new object
                objConn = new System.Data.OleDb.OleDbConnection();

                //If connection string is provided, use it
                if (ConnectionString.Trim() != string.Empty)
                {
                    objConn.ConnectionString = ConnectionString;
                }
                else
                {
                    objConn.ConnectionString = "Provider=SQLOLEDB;Data Source=" + this.Server + ";User ID=" + this.UserID + ";Password=" + this.Password + ";Initial Catalog=JobTicket";
                }

                //Now open the connection
                objConn.Open();

                return true;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }

        /// <summary>
        /// Provides connection status. True if connection is open, otherwise returns false;
        /// </summary>
        /// <returns></returns>
        public bool getConnStatus()
        {
            try
            {
                if (objConn.State == ConnectionState.Open || objConn.State == ConnectionState.Executing || objConn.State == ConnectionState.Fetching)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }

        /// <summary>
        /// Closes the connection to the database
        /// </summary>
        /// <returns></returns>
        public bool CloseConnection()
        {
            try
            {
                if (getConnStatus())
                {
                    objConn.Close();
                    objConn.Dispose();
                    return true;
                }
                else
                {
                    LastError = "Connection already closed";
                    return false;
                }
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }

        /// <summary>
        /// Starts a database transaction and returns the handle
        /// </summary>
        /// <returns></returns>
        public OleDbTransaction startTransaction()
        {
            try
            {
                return objConn.BeginTransaction();
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return null;
            }
        }

        /// <summary>
        /// Commits the transaction
        /// </summary>
        /// <returns></returns>
        public bool Commit(ref OleDbTransaction objTransaction)
        {
            try
            {
                objTransaction.Commit();

                return true;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }

        /// <summary>
        /// Rollbacks the transaction
        /// </summary>
        /// <param name="objTransaction">Transaction Handle</param>
        /// <returns></returns>
        public bool Rollback(ref OleDbTransaction objTransaction)
        {
            try
            {
                objTransaction.Rollback();

                return true;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }

        /// <summary>
        /// Executes the query in the database that doesn't produce any results
        /// </summary>
        /// <param name="pQuery">SQL Query</param>
        /// <returns></returns>
        public bool executeNonQuery(string pQuery)
        {
            try
            {
                //Check the connection status
                if (!getConnStatus())
                {
                    LastError = "Connection is not open";
                    return false;
                }

                OleDbCommand objCommand = new OleDbCommand(pQuery, objConn);
                objCommand.ExecuteNonQuery();

                objCommand.Dispose();

                return true;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }

        /// <summary>
        /// Executes the query in the database (with transaction) that doesn't produce any results.
        /// </summary>
        /// <param name="pQuery">SQL Query</param>
        /// <param name="objTransaction">Transaction Handle</param>
        /// <returns></returns>
        public bool executeNonQuery(string pQuery, ref OleDbTransaction objTransaction)
        {
            try
            {
                //Check the connection status
                if (!getConnStatus())
                {
                    LastError = "Connection is not open";
                    return false;
                }

                OleDbCommand objCommand = new OleDbCommand(pQuery, objConn, objTransaction);
                objCommand.ExecuteNonQuery();

                objCommand.Dispose();

                return true;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }

        /// <summary>
        /// Executes the query and returns the results in DataTable
        /// </summary>
        /// <param name="pQuery">SQL Query</param>
        /// <returns></returns>
        public DataTable getResults(string pQuery)
        {
            try
            {
                //Check the connection status
                if (!getConnStatus())
                {
                    LastError = "Connection is not open";
                    return null;
                }

                DataSet objDataSet = new DataSet();
                OleDbDataAdapter objAdapter = new OleDbDataAdapter();
                DataTable objTable = new DataTable();

                objAdapter.SelectCommand = new OleDbCommand(pQuery, objConn);
                objAdapter.Fill(objDataSet);

                objTable = objDataSet.Tables[0];

                objAdapter.Dispose();

                return objTable;
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return null;
            }
        }

        /// <summary>
        /// Executes query and returns value of first row and fir column in DateTime type
        /// </summary>
        /// <param name="pQuery">SQL Query</param>
        /// <returns></returns>
        ///

        public DateTime getDateValue(string pQuery)
        {
            try
            {
                //Check the connection status
                if (!getConnStatus())
                {
                    LastError = "Connection is not open";
                    return (new DateTime());
                }

                DataSet objDataSet = new DataSet();
                OleDbDataAdapter objAdapter = new OleDbDataAdapter();
                DataTable objTable = new DataTable();

                objAdapter.SelectCommand = new OleDbCommand(pQuery, objConn);
                objAdapter.Fill(objDataSet);

                objTable = objDataSet.Tables[0];

                objAdapter.Dispose();

                if (objTable != null)
                {
                    if (objTable.Rows.Count > 0)
                    {
                        DateTime dtDateTime = DateTime.Parse(objTable.Rows[0][0].ToString());

                        if (objTable != null)
                        {
                            objTable.Dispose();
                        }

                        return dtDateTime;
                    }
                    else
                    {
                        if (objTable != null)
                        {
                            objTable.Dispose();
                        }

                        return (new DateTime());
                    }
                }
                else
                {
                    return (new DateTime());
                }
            }
            catch (Exception)
            {
                return (new DateTime());
            }
        }

        /// <summary>
        /// Execute the query and returns true if the query returns any record, otherwise returns false
        /// </summary>
        /// <param name="pQuery"></param>
        /// <returns></returns>
        public bool isRecordExist(string pQuery)
        {
            try
            {
                DataTable objData = this.getResults(pQuery);

                if (objData == null)
                {
                    return false;
                }

                if (objData.Rows.Count > 0)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }

        public DataSet getDataSet(string pQuery)
        {
            DataSet dsTmp = new DataSet();
            OleDbDataAdapter daTmp = new OleDbDataAdapter();

            try
            {
                LastError = "";

                if (objConn.State != ConnectionState.Open)
                    OpenConnection();

                daTmp.SelectCommand = new OleDbCommand(pQuery);
                daTmp.SelectCommand.CommandTimeout = DataService.COMMAND_TIMEOUT;
                daTmp.SelectCommand.Connection = objConn;
                daTmp.Fill(dsTmp);
            }
            catch (Exception ex)
            {
                LastError = ex.Message;
            }
            return dsTmp;
        }

        public static object checkNull(object pObj, object pDefaultValue)
        {
            if (pObj == null)
                return pDefaultValue;
            else if (pObj.ToString() == "")
                return pDefaultValue;
            else
                return pObj;
        }

        public object getValueFromDatabase(string pQuery)
        {
            object objValue;
            OleDbCommand cmdExe = new OleDbCommand(pQuery, objConn);

            try
            {
                if (objConn.State != ConnectionState.Open)
                    OpenConnection();

                // 'cmdExe.CommandText = pQuery
                // 'cmdExe.Connection = objConn
                cmdExe.CommandTimeout = DataService.COMMAND_TIMEOUT;
                cmdExe.Prepare();

                objValue = cmdExe.ExecuteScalar();

                objValue = checkNull(objValue, "");
                return objValue;
            }
            catch (Exception ex)
            {
                LastError = ex.Message;
                return new object();
            }
        }

        //public static object checkNull(object pObj, object pDefaultValue)
        //{
        //    if (pObj == null)
        //        return pDefaultValue;
        //    else if (pObj.ToString() == "")
        //        return pDefaultValue;
        //    else
        //        return pObj;
        //}

        /// <summary>
        /// Checks the value for DBNull and returns the default value if the value is null
        /// </summary>
        /// <param name="pValue">Value</param>
        /// <param name="defaultValue">Default Value</param>
        /// <returns></returns>
        public static object checkDBNull(object pValue, object defaultValue)
        {
            try
            {
                if (pValue == System.DBNull.Value)
                {
                    return defaultValue;
                }
                else
                {
                    return pValue;
                }
            }
            catch (Exception ex)
            {
                return pValue;
            }
        }


        #endregion Methods
    }
}