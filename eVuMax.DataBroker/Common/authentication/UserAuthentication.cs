using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.Common.authentication
{
    public class UserAuthentication: IBroker		
    {

		const string ValidateUser = "ValidateUser";
		const string ChangePassword_ = "ChangePassword";

		public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
		{
			try
			{
				

				if (paramRequest.Function== ValidateUser)
				{
					//TO-DO -- Validate the user with or without AD Integration and return the result
					return isValidUser(paramRequest);
				}




				//No matching function found ...
				Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
				objResponse.RequestSuccessfull = false;
				objResponse.Errors = "Invalid Request Function. Use proper function name in the Broker Request";
				return objResponse;

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


				//Not implemented anything yet... return blank object
				//return paramRequest.createResponseObject();

				if (paramRequest.Function == ChangePassword_)
				{
					//TO-DO -- Validate the user with or without AD Integration and return the result
					return ChangePassword(paramRequest);
				}




				//No matching function found ...
				Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
				objResponse.RequestSuccessfull = false;
				objResponse.Errors = "Invalid Request Function. Use proper function name in the Broker Request";
				return objResponse;
			}
			catch (Exception ex)
			{
				return paramRequest.createResponseObject();
			}
		}


		private Broker.BrokerResponse ChangePassword(Broker.BrokerRequest objRequest)
		{
			try
			{

				string LastError = "";
				string UserName = "";
				string Password = "";
				string AuthType_ = "";
				try
				{
					UserName = @objRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
					Password = @objRequest.Parameters.Where(x => x.ParamName.Contains("Password")).FirstOrDefault().ParamValue;
					AuthType_ = @objRequest.Parameters.Where(x => x.ParamName.Contains("AuthType")).FirstOrDefault().ParamValue;
				}
				catch (Exception ex)
				{
					Broker.BrokerResponse objBadResponse = objRequest.createResponseObject();
					objBadResponse.RequestSuccessfull = false;
					objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/Password/AuthType " + ex.Message + ex.StackTrace;
					return objBadResponse;
				}

			

				if (AuthType_ == "VuMaxDBUser")
				{
					AES objAES = new AES();

					string encPwd = objAES.Encrypt(Password, Global.EncryptionKey, 128);

					string strSQL = "UPDATE VMX_USER SET ";
					strSQL += "PASSWORD = '" + encPwd + "' WHERE USER_NAME ='" + UserName + "'";

					objRequest.objDataService.executeNonQuery(strSQL);
				}
			

				//TO-DO Authenticate the user and create response

				Broker.BrokerResponse objResponse = objRequest.createResponseObject();
				objResponse.RequestSuccessfull = true;
				objResponse.Warnings = LastError;
				objResponse.Response = JsonConvert.SerializeObject(true);

				return objResponse;
			}
			catch (Exception ex)
			{

				Broker.BrokerResponse objResponse = objRequest.createResponseObject();
				objResponse.RequestSuccessfull = false;
				objResponse.Response = JsonConvert.SerializeObject(ex.Message + ex.StackTrace);
				return objResponse;
			}
		}



		/// <summary>
		/// Validates user credentials
		/// </summary>
		/// <param name="UserName"></param>
		/// <param name="Password"></param>
		/// <param name="errors"></param>
		/// <returns></returns>
		private Broker.BrokerResponse isValidUser(Broker.BrokerRequest objRequest)
        {
			try
			{

				//List<Broker.BrokerParameter> paramList = Global.getParameters(objRequest);

				//string UserName = Global.getParameterValue(paramList, "UserName");
				//string Password = Global.getParameterValue(paramList, "Password");

				string LastError = "";
				string UserName = "";
				string Password= "";
				string AuthType_ = "";
				try
				{
					UserName = @objRequest.Parameters.Where(x => x.ParamName.Contains("UserName")).FirstOrDefault().ParamValue;
					Password = @objRequest.Parameters.Where(x => x.ParamName.Contains("Password")).FirstOrDefault().ParamValue;
					AuthType_ = @objRequest.Parameters.Where(x => x.ParamName.Contains("AuthType")).FirstOrDefault().ParamValue;
				}
				catch (Exception ex)
				{
					Broker.BrokerResponse objBadResponse = objRequest.createResponseObject();
					objBadResponse.RequestSuccessfull = false;
					objBadResponse.Errors = "Invalid Request Parameter.Use proper function name in the Broker Request i.e UserName/Password/AuthType " + ex.Message + ex.StackTrace;
					return objBadResponse;
				}

				byte[] data = Convert.FromBase64String(Password);
				string decodedString = Encoding.UTF8.GetString(data);

				var objAES = new VuMaxDR.Common.AES();
				//Password = objAES.Decrypt(decodedString, Global.EncryptionKey,128);

				Password  =  RSAService.DecryptStringAES(decodedString);

				LDAP objLDAP = new LDAP(UserName, Password);

				Boolean isValidUser = false;

				if (AuthType_ == "0") //WindowsUser
				{
					//isValidUser = objLDAP.isValidLDAPUser();

					isValidUser = objLDAP.isValidWindowUser();
                }
				if (AuthType_ == "1") //1VuMaxDBUser
				{
					isValidUser = isValidDBUser(ref objRequest.objDataService, UserName, Password, ref LastError);
				}

				


				//TO-DO Authenticate the user and create response

				Broker.BrokerResponse objResponse = objRequest.createResponseObject();
				objResponse.RequestSuccessfull = isValidUser;
				objResponse.Warnings = LastError;
				objResponse.Response = JsonConvert.SerializeObject(isValidUser);

				return objResponse;
			}
			catch (Exception ex)
			{

				Broker.BrokerResponse objResponse = objRequest.createResponseObject();
				objResponse.RequestSuccessfull = false;
				objResponse.Response = JsonConvert.SerializeObject(ex.Message + ex.StackTrace);
				return objResponse;
			}
        }
        public bool isValidDBUser(ref DataService objDataService, string UserName, string Passwd, ref string lastError)
        {
            try
            {
				

				//Check connection status
				if (!objDataService.checkConnection())
                {
                    //Connection is not open
                    lastError = "Database connection is not open";
                    return false;
                }

                AES objAES = new AES();

                string encPwd = objAES.Encrypt(Passwd, Global.EncryptionKey, 128);

                bool isValidUser = false;
                isValidUser = objDataService.IsRecordExist("SELECT user_id FROM VMX_USER WHERE USER_NAME='" + UserName + "' AND PASSWORD='" + encPwd + "'");
                if (isValidUser)
                {
                    
                    return true;
                }
                else
                {
                    lastError = "invalid User Name or Password";
                    return false;
                }

            }
            catch (Exception ex)
            {
                lastError = ex.Message + " - " + ex.StackTrace;
                return false;
            }

        }
    }
}
