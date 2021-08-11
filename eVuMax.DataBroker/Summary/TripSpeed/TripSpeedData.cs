using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using VuMaxDR.Data.Objects;
using VuMaxDR.Common;
using VuMaxDR.Data;
using System.Data;

namespace eVuMax.DataBroker.Summary.TripSpeed
{
    public  class TripSpeedData
    {
        //New Code Nishant

        public DataTable line1Data = new DataTable();
        public DataTable line2Data = new DataTable();
        public DataTable line3Data = new DataTable(); //benchmark.SpeedProfile loop
        public DataTable line4Data = new DataTable(); //benchmark.SpeedProfile loop
        public DataTable deltaWithConnData = new DataTable(); //
        public DataTable deltaWOConnData = new DataTable(); //

        public DataTable bar1Data = new DataTable();// TripSpeedWOConnection, labelText
        public DataTable bar2Data = new DataTable();// TripSpeedConnection, labelText

        //public double BenchMarkWOConn = 0;
        //public double BenchMarkWithConn = 0;

        public TripSpeedSettings objUserSettings = new TripSpeedSettings();
        public string DepthVumaxUnitID = "FT";

        public string tripInfoText = "";
        public string WellName = "";

        public TripSpeedData()
        {
          

            //New Code
            line1Data.Columns.Add(new DataColumn("X", typeof(System.Double)));
            line1Data.Columns.Add(new DataColumn("Y", typeof(System.Double)));

            line2Data.Columns.Add(new DataColumn("X", typeof(System.Double)));
            line2Data.Columns.Add(new DataColumn("Y", typeof(System.Double)));

            line3Data.Columns.Add(new DataColumn("X", typeof(System.Double)));
            line3Data.Columns.Add(new DataColumn("Y", typeof(System.Double)));

            line4Data.Columns.Add(new DataColumn("X", typeof(System.Double)));
            line4Data.Columns.Add(new DataColumn("Y", typeof(System.Double)));

            bar1Data.Columns.Add(new DataColumn("X", typeof(System.String)));
            bar1Data.Columns.Add(new DataColumn("Y", typeof(System.String)));

            bar2Data.Columns.Add(new DataColumn("X", typeof(System.String)));
            bar2Data.Columns.Add(new DataColumn("Y", typeof(System.String)));

            deltaWithConnData.Columns.Add(new DataColumn("X", typeof(System.Double)));
            deltaWithConnData.Columns.Add(new DataColumn("Y", typeof(System.Double)));

            deltaWOConnData.Columns.Add(new DataColumn("X", typeof(System.Double)));
            deltaWOConnData.Columns.Add(new DataColumn("Y", typeof(System.Double)));

        }
      

        //get data from refreshChart function from vb.




    }
}
