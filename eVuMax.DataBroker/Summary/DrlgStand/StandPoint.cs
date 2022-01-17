using System;
using System.Collections.Generic;

namespace eVuMax.DataBroker.Summary.DrlgStand
{
    //class StandPoint
    //{
    //}


    public class StandPoint : IComparable
    {
        public enum cnDayNightTime
        {
            DayTime = 0,
            NightTime = 1
        }

        public double Depth = 0d;
        public double ROP = 0d;
        public double RotaryROP = 0d;
        public double SlideROP = 0d;
        public cnDayNightTime DayNightStatus = cnDayNightTime.DayTime;
        public DateTime FromDate;
        public DateTime ToDate;
        public Dictionary<int, double> RigStates = new Dictionary<int, double>();
        public double OffsetTime = 0d;
        public cnDayNightTime OffsetDayNightStatus = cnDayNightTime.DayTime;
        public double OffsetROP = 0d;
        public double OffsetRotaryROP = 0d;
        public double OffsetSlideROP = 0d;

        public StandPoint getCopy()
        {
            try
            {
                var objNew = new StandPoint();
                objNew.Depth = Depth;
                objNew.ROP = ROP;
                objNew.RotaryROP = RotaryROP;
                objNew.SlideROP = SlideROP;
                objNew.FromDate = FromDate;
                objNew.ToDate = ToDate;
                objNew.DayNightStatus = DayNightStatus;
                objNew.OffsetTime = OffsetTime;
                objNew.OffsetDayNightStatus = OffsetDayNightStatus;
                objNew.OffsetROP = OffsetROP;
                objNew.OffsetRotaryROP = OffsetRotaryROP;
                objNew.OffsetSlideROP = OffsetSlideROP;
                foreach (int lnKey in RigStates.Keys)
                    objNew.RigStates.Add(lnKey, RigStates[lnKey]);
                return objNew;
            }
            catch (Exception ex)
            {
                return new StandPoint();
            }
        }

        public int CompareTo(object obj)
        {
            try
            {
                StandPoint objNew = (StandPoint)obj;
                if (Depth < objNew.Depth)
                {
                    return -1;
                }

                if (Depth == objNew.Depth)
                {
                    return 0;
                }

                if (Depth > objNew.Depth)
                {
                    return 1;
                }
            }
            catch (Exception ex)
            {
            }

            return default;
        }
    }


}
