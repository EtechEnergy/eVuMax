using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.Summary.TripReport
{
    public class SingleTripStats
    {
        //public TripInfo objTripData = new TripInfo();

        public string lblSection = "";
        public string lblDirection = "";
        public string lblRun = "";
        public string lblDepth = "0";
        public DateTime dtFromDate = new DateTime();
        public DateTime dtToDate = new DateTime();


        public string lblStartTime = "";
        public string lblEndTime = "";
        public string lblAvgConnTime = "";
        public double lblBestTime = 0;
        public string lblDiff = "";
        public string lblDiffBackColor = "Transparent";

        public string lblSpeedWithConn = "";
        public string lblSpeedWOConn = "";
        public string lblAvgTimeDay = "";
        public string lblAvgTimeNight = "";
        public string lblFillupTime = "";

        //public Dictionary<int, VuMaxDR.Data.Objects.TripConn> listConn = new Dictionary<int, VuMaxDR.Data.Objects.TripConn>();
        public VuMaxDR.Data.Objects.TripConn[] arrConn  ;// = new VuMaxDR.Data.Objects.TripConn();
        public ContTripSpeedInfo[] arrSpeedWO ;
        public ContTripSpeedInfo[] arrSpeedWith;
        public double flatPercent = 0;
        public double movePercent = 0;

    }
}
