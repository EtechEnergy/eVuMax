using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.TripSpeed
{
   public class TripDepthRange
    {
        public double FromDepth = 0;
        public double ToDepth = 0;
        public string LabelText = "";
        public double TripSpeedWOConnection = 0;
        public double TripSpeedWithConnection = 0;
        public string TimeLogName = "";
        public double WithBenchhmark = 0;
        public double WOBenchmark = 0;
        //public double PhaseIndex = 0;//Nishant 31-10-2020

        public TripDepthRange getCopy()
        {
            try
            {
                TripDepthRange objNew = new TripDepthRange();
                objNew.FromDepth = this.FromDepth;
                objNew.ToDepth = this.ToDepth;
                objNew.LabelText = this.LabelText;
                objNew.TripSpeedWithConnection = this.TripSpeedWithConnection;
                objNew.TripSpeedWOConnection = this.TripSpeedWOConnection;
                objNew.TimeLogName = this.TimeLogName;
                objNew.WithBenchhmark = this.WithBenchhmark;
                objNew.WOBenchmark = this.WOBenchmark;

                //objNew.PhaseIndex = this.PhaseIndex; //Nishant 31-10-2020

                return objNew;
            }
            catch (Exception ex)
            {
                return new TripDepthRange();
            }
        }
    }
}
