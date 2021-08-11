using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.TripSpeed
{
    public class TripSpeed : IComparable<TripSpeed>
    {
        public double SrNo = 0;
        public double Depth = 0;
        public double SpeedWithoutConnection = 0;
        public double SpeedWithConnection = 0;

        public TripSpeed getCopy()
        {
            try
            {
                TripSpeed objNew = new TripSpeed();
                objNew.SrNo = this.SrNo;
                objNew.Depth = this.Depth;
                objNew.SpeedWithoutConnection = this.SpeedWithoutConnection;
                objNew.SpeedWithConnection = this.SpeedWithConnection;

                return objNew;
            }
            catch (Exception ex)
            {
                return new TripSpeed();
            }
        }

     

        public int CompareTo(TripSpeed obj)
        {
            try
            {
                TripSpeed objSeries = obj;


                if (this.Depth < objSeries.Depth)
                    return -1;

                if (this.Depth == objSeries.Depth)
                    return 0;

                if (this.Depth > objSeries.Depth)
                    return 1;

                return 1;
            }
            catch (Exception ex)
            {

                return 1;
            }
            
        }
    }
}
