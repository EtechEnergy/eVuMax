using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace eVuMax.DataBroker.Common.authentication
{
    public class UserAuthentication: IBroker		
    {

		public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
		{
			try
			{


				if (paramRequest.Function=="ValidateUser")
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
				return paramRequest.createResponseObject();
			}
			catch (Exception ex)
			{
				return paramRequest.createResponseObject();
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

				List<Broker.BrokerParameter> paramList = Global.getParameters(objRequest);

				string UserName = Global.getParameterValue(paramList, "UserName");
				string Password = Global.getParameterValue(paramList, "Password");

				//TO-DO Authenticate the user and create response

				Broker.BrokerResponse objResponse = objRequest.createResponseObject();
				objResponse.RequestSuccessfull = true;
				objResponse.Response = JsonConvert.SerializeObject("True");

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
		//public static bool isValidUser(ref DataService objDataService, string UserId, string Passwd, ref string lastError)
		//{
		//	try
		//	{


		//		//Check connection status
		//		if (!objDataService.checkConnection())
		//		{
		//			//Connection is not open
		//			lastError = "Database connection is not open";
		//			return false;
		//		}

		//		AES objAES = new AES();

		//		string encPwd = objAES.Encrypt(Passwd, EncriptionKey, 128);

		//		bool isValidUser = false;
		//		isValidUser = objDataService.IsRecordExist("SELECT user_id FROM user_master WHERE user_id='" + UserId + "' AND PASSWD='" + encPwd + "'");
		//		if (isValidUser)
		//		{
		//			objDataService.closeConnection();
		//			return true;
		//		}
		//		else
		//		{
		//			objDataService.closeConnection();
		//			lastError = "invalid User Name or Password";
		//			return false;
		//		}

		//	}
		//	catch (Exception ex)
		//	{
		//		lastError = ex.Message + " - " + ex.StackTrace;
		//		return false;
		//	}

		//}
	}
}
