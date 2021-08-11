using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Config
{
    public class ConfigBroker: IBroker
    {
        
        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Broker == Global.Brk_Config_Theme)
                {

                    Themes.ThemeMgr objThemeMgr = new Themes.ThemeMgr();
                    return objThemeMgr.getData(paramRequest);
                   

                }
                if (paramRequest.Broker == Global.Brk_Config_UserPrefs)
                {

                    UserPrefrences.UserPrefMgr objUserPref = new UserPrefrences.UserPrefMgr();
                    return objUserPref.getData(paramRequest);

                }


                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
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
                if (paramRequest.Broker == Global.Brk_Config_Theme)
                {

                    Themes.ThemeMgr objThemeMgr = new Themes.ThemeMgr();
                    return objThemeMgr.performTask(paramRequest);

                }

                if (paramRequest.Broker == Global.Brk_Config_UserPrefs)
                {

                    UserPrefrences.UserPrefMgr objUserPref = new UserPrefrences.UserPrefMgr();
                    return objUserPref.performTask(paramRequest);

                }


                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
                return objResponse;
            }
            catch (Exception ex)
            {

                return null;
            }
        }

    }

}
