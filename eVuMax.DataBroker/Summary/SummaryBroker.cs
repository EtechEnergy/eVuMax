using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using eVuMax.DataBroker.Common;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.Summary
{
    public class SummaryBroker : IBroker
    {

        public Broker.BrokerResponse getData(Broker.BrokerRequest paramRequest)
        {
            try
            {

               
                //Nishant :20-10-2020
                if (paramRequest.Broker == Global.SM_TripAnalyzerSelection)
                {
                    TripSpeed.TripAnalyzerSelection.TripAnalyzerSelection objTripAnalyzerSelection = new TripSpeed.TripAnalyzerSelection.TripAnalyzerSelection();
                    return objTripAnalyzerSelection.getData(paramRequest);
                }

                //Trip Speed Plot
                if (paramRequest.Broker == Global.SM_TripSpeedPlot)
                {
                    TripSpeed.TripSpeedPlot objTripSpeed = new TripSpeed.TripSpeedPlot();
                    return objTripSpeed.getData(paramRequest);
                }


                //prath 07-10-2020
                if (paramRequest.Broker == Global.SM_ROPSummary)
                {
                    ROPSummary.ROPSummary objROPSummary = new ROPSummary.ROPSummary();
                    return objROPSummary.getData(paramRequest);
                }

                //prath 01-10-2020
                if (paramRequest.Broker == Global.SM_DrlgSummary)
                {
                    DrlgSummary.DrlgSummary objDrlgSummary = new DrlgSummary.DrlgSummary();
                    return objDrlgSummary.getData(paramRequest);
                }


                if (paramRequest.Broker == Global.SM_DrlgConn)
                {

                    DrlgConn.DrlgConnSummary objDrlgConnSummary = new DrlgConn.DrlgConnSummary();
                    return objDrlgConnSummary.getData(paramRequest);

                }

                if (paramRequest.Broker == Global.SM_TripConn)
                {

                    TripConn.TripConnSummary objTripConnSummary = new TripConn.TripConnSummary();
                    return objTripConnSummary.getData(paramRequest);

                }


                if (paramRequest.Broker == Global.SM_Toolface)
                {

                    Toolface.ToolfaceSummary objToolfaceSummary = new Toolface.ToolfaceSummary();
                    return objToolfaceSummary.getData(paramRequest);

                }

                //Nishant
                if (paramRequest.Broker == Global.DRLG_STAND_PLOT)
                {

                    Summary.DrlgStand.DrlgStandPlotMgr objDrlgStandPlotMgr = new DrlgStand.DrlgStandPlotMgr();
                    return objDrlgStandPlotMgr.getData(paramRequest);

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
                //Nishant :20-10-2020
                if (paramRequest.Broker == Global.SM_TripAnalyzerSelection)
                {
                    TripSpeed.TripAnalyzerSelection.TripAnalyzerSelection objTripAnalyzerSelection = new TripSpeed.TripAnalyzerSelection.TripAnalyzerSelection();
                    return objTripAnalyzerSelection.performTask(paramRequest);
                }

                if (paramRequest.Broker == Global.SM_ROPSummary)
                {

                    ROPSummary.ROPSummary objROPSummary = new ROPSummary.ROPSummary();
                    return objROPSummary.performTask(paramRequest);

                }

                if (paramRequest.Broker == Global.SM_DrlgConn)
                {

                    DrlgConn.DrlgConnSummary objDrlgConnSummary = new DrlgConn.DrlgConnSummary();
                    return objDrlgConnSummary.performTask(paramRequest);

                }


                if (paramRequest.Broker == Global.SM_TripConn)
                {

                    TripConn.TripConnSummary objTripConnSummary = new TripConn.TripConnSummary();
                    return objTripConnSummary.performTask(paramRequest);

                }
				//Parth 16-10-2020
				 if (paramRequest.Broker == Global.SM_Toolface)
                {

                    Toolface.ToolfaceSummary objToolfaceSummary = new Toolface.ToolfaceSummary();
                    return objToolfaceSummary.performTask(paramRequest);

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
