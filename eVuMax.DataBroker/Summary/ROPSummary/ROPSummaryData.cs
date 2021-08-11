using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;

namespace eVuMax.DataBroker.Summary.ROPSummary
{
   public  class ROPSummaryData
    {

        public string RigName = "";
        public string WellName = "";
        public string Distance = "";
        public string offSetWellName = "";

        public DataTable rotateData { get; set; } = new DataTable();
        public DataTable slideData { get; set; } = new DataTable();
        public DataTable offsetRotateData { get; set; } = new DataTable();
        public DataTable offsetSlideData { get; set; } = new DataTable();
        public DataTable RigStates { get; set; } = new DataTable();

        public string DepthUnit { get; set; } = "";

        public double AvgRotaryROP { get; set; } = 0;
        public double MedRotaryROP { get; set; } =  0;
        public double AvgSlideROP { get; set; }= 0;
        public double MedSlideROP { get; set; } = 0;

        public double AvgRotaryROPOffset { get; set; } = 0;
        public double MedRotaryROPOffset { get; set; } = 0;
        public double AvgSlideROPOffset { get; set; } = 0;
        public double MedSlideROPOffset { get; set; } = 0;

        //public double TotalFootage { get; set; } = 0; //calc
        //public double TotalFootageOffset { get; set; } = 0;//calc

        public double RotaryPercent { get; set; } = 0;
        public double SlidePercent { get; set; } = 0;

        public double OffsetRotaryPercent { get; set; } = 0;
        public double OffsetSlidePercent { get; set; } = 0;

        public string offsetWellName { get; set; } = "";


        public DateTime fromDate = DateTime.Now;
        public DateTime toDate = DateTime.Now;

        public double fromDepth = 0;
        public double toDepth = 0;

        public DateTime offsetFromDate = DateTime.Now;
        public DateTime offsetToDate = DateTime.Now;

        public double offsetDepthIn = 0;
        public double offsetDepthOut = 0;

        public Dictionary<double, double> tripOuts = new Dictionary<double, double>();
        public Dictionary<double, double> tripOutsOffset = new Dictionary<double, double>();


        public ROPSummaryData()
        {

            this.rotateData.Columns.Add(new DataColumn("X", typeof(System.Double)));
            this.rotateData.Columns.Add(new DataColumn("Y", typeof(System.Double)));

            //DataRow objNewRow = rotateData.NewRow();
            //rotateData.Rows.Add(objNewRow);


            this.slideData.Columns.Add(new DataColumn("X", typeof(System.Double)));
            this.slideData.Columns.Add(new DataColumn("Y", typeof(System.Double)));
            //objNewRow = slideData.NewRow();
            //slideData.Rows.Add(objNewRow);


            this.offsetRotateData.Columns.Add(new DataColumn("X", typeof(System.Double)));
            this.offsetRotateData.Columns.Add(new DataColumn("Y", typeof(System.Double)));

            //objNewRow = offsetRotateData.NewRow();
            //offsetRotateData.Rows.Add(objNewRow);

            

            this.offsetSlideData.Columns.Add(new DataColumn("X", typeof(System.Double)));
            this.offsetSlideData.Columns.Add(new DataColumn("Y", typeof(System.Double)));

            // objNewRow = offsetSlideData.NewRow();
            //offsetSlideData.Rows.Add(objNewRow);


        }



    }
}
