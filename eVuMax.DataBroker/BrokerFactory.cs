using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker
{
    public static class BrokerFactory
    {

        public static IBroker createBroker(Broker.BrokerRequest paramRequest)
        {
			try
			{
				//Creating Broker based on the Module

				//1 - Common Module
				if(paramRequest.Module==Global.Mod_Common)
				{
					Common.CommonBroker objBroker = new Common.CommonBroker();
					return objBroker;
				}

				//2 - Well Data Objects 
				if(paramRequest.Module==Global.Mod_WellDataObjects)
				{
					Well.Data.Objects.WellDataObjectsBroker objBroker = new Well.Data.Objects.WellDataObjectsBroker();
					return objBroker;
				}

                //3 - Config
                if (paramRequest.Module == Global.Mod_Config)
                {
                    Config.ConfigBroker objBroker = new Config.ConfigBroker();
                    return objBroker;
                }

				//Nishant
				//// 4- DataObject. Manager
				if (paramRequest.Module == Global.Mod_DataObject_Manager)
				{
					DataBroker.DataObject.WellBroker objBroker = new DataBroker.DataObject.WellBroker();

					return objBroker;
				}

                //Summary Brokers
                if (paramRequest.Module == Global.Mod_Summary_Manager)
                {
                    DataBroker.Summary.SummaryBroker objBroker = new Summary.SummaryBroker();

                    return objBroker;
                }


				//Broomstick Document Brokers
				if (paramRequest.Module == Global.Mod_Broomstick_Manager)
				{
					DataBroker.Broomstick.BroomstickBroker objBroker = new Broomstick.BroomstickBroker();

					
					return objBroker;
				}
				//Nishant 04-02-2021
				if (paramRequest.Module == Global.Mod_DownloadManager)
				{

					DataBroker.DownloadManager.DownloadBroker objBroker = new DownloadManager.DownloadBroker();
					return objBroker;
				}

				//Nishant 28-09-2021
				if (paramRequest.Module == Global.Mod_eVuMaxLogger)
				{

					DataBroker.Logger.eVuMaxLoggerBroker objBroker = new Logger.eVuMaxLoggerBroker();
					return objBroker;
				}

				//Nishant 27-11-2021
				if (paramRequest.Module == Global.Mod_GenericDrillingSummary_Manager)
				{

					GenericDrillingSummary.gdSummaryBroker objBroker = new GenericDrillingSummary.gdSummaryBroker();
					return objBroker;
				}

				if (paramRequest.Module == Global.Mod_AdvKPI)
				{

					AdvKPI_.AdvKPIBroker objBroker = new AdvKPI_.AdvKPIBroker();
					return objBroker;
				}

				if(paramRequest.Module == Global.Mod_DataService)
                {
					DataServiceManager.DataServiceBroker objBroker = new DataServiceManager.DataServiceBroker();
					return objBroker;
                }

				return null;
			}
			catch (Exception)
			{
				return null;
		
			}
        }

    }
}
