using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.DrlgSummary
{
    public class DrlgSummaryData
    {
        public DataTable rigStateSummaryData { get; set; } = new DataTable();
        public DataTable NumericData { get; set; } = new DataTable();
        public DataTable ROPData { get; set; } = new DataTable();
        public DataTable ROPDataOffset { get; set; } = new DataTable();
        public DataTable RigStates { get; set; } = new DataTable();

        public DataTable offSetWellNumericData { get; set; } = new DataTable();

        public string RunNo = "";
        public String DepthUnit = "";
        public String RigName = "";
        public String WellName = "";
        
        public DateTime StartDate;
        public DateTime EndDate; //30-09-2020
        public double MainDepthIn = 0;
        public double MainDepthOut = 0;

        public DateTime OffsetStartDate;
        public DateTime OffsetEndDate; //30-09-2020
        public double OffsetMainDepthIn = 0;
        public double OffsetMainDepthOut = 0;

        public String Distance = "";
        public String BenchMarkWellName = "";
        public String BenchMarkDepthIn = "";
        public String BenchMarkDepthOut = "";
        public String BenchMarkDistance = "";
        public String offSetWellName = "";

        //Pie Data
        public double RotaryTime = 0;
        public double SlideTime = 0;

        public double RotaryTimeOffset = 0;
        public double SlideTimeOffset = 0;

        public double RotaryFootage = 0;
        public double SlideFootage = 0;

        public double RotaryFootageOffset = 0;
        public double SlideFootageOffset = 0;

        public double RotaryROP = 0;
        public double SlideROP = 0;

        public double RotaryROPOffset = 0;
        public double SlideROPOffset = 0;

        public double RotaryTimePercent = 0;
        public double SlideTimePercent = 0;

        public double DrillingTimePercent = 0;
        public double NonDrillingTimePercent = 0;


        public double OffsetRotaryTimePercent = 0;
        public double OffsetSlideTimePercent = 0;

        public double OffsetDrillingTimePercent = 0;
        public double OffsetNonDrillingTimePercent = 0;

        public DrlgSummaryData()
        {
            rigStateSummaryData.Columns.Add(new DataColumn("PERCENTAGE", typeof(System.Double)));
            rigStateSummaryData.Columns.Add(new DataColumn("TEXT_LABEL", typeof(System.String)));
            rigStateSummaryData.Columns.Add(new DataColumn("COLOR", typeof(System.String)));
            rigStateSummaryData.Columns.Add(new DataColumn("COUNTER", typeof(System.Int16)));

            ROPData.Columns.Add(new DataColumn("X", typeof(System.Double)));
            ROPData.Columns.Add(new DataColumn("Y", typeof(System.Double)));
            ROPData.Columns.Add(new DataColumn("DATE_TIME", typeof(System.String)));

            ROPDataOffset.Columns.Add(new DataColumn("X", typeof(System.Double)));
            ROPDataOffset.Columns.Add(new DataColumn("Y", typeof(System.Double)));
            ROPDataOffset.Columns.Add(new DataColumn("DATE_TIME", typeof(System.String)));



        }




    }
}
