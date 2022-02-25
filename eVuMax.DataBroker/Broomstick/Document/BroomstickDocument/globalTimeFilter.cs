using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Broomstick.Document.BroomstickDocument
       
{

    public enum vFilterType
    {
        LastData = 0,
        SpecificRange = 1,
        OpenEnded = 2,
        None = 3
    }
    public class globalTimeFilter
    {

        public bool FilterStatus = true;
        public vFilterType FilterType = vFilterType.LastData;
        public string FromDateTime = "";
        public string ToDateTime = "";
        public double LastPeriod = 24;
        public vFilterType DepthFilterType = vFilterType.LastData;
        public double FromDepth = 0d;
        public double ToDepth = 0d;
        public double LastDepthPeriod = 0d;
        public bool FilterByHkldRange = false;
        public double FromHookload = 0d;
        public double ToHookload = 0d;
        public bool FilterByMean = false;
        public double MeanDepthRange = 100d;
        public double AllowedRange = 10d;
        public int MeanMethod = 0;
        public Dictionary<string, HookloadTimeFilterRange> timeRanges = new Dictionary<string, HookloadTimeFilterRange>();

        // '==== Filter Linked to Well Events =========================''
        public bool FilterByEvents = false;
        public string FilterWellID = "";
        public string FilterWellboreID = "";
        //public Dictionary<int, WellEventLink> EventList = new Dictionary<int, WellEventLink>();
        // '===========================================================''

        public bool filterBasedOnDepth = false;
        public double FilterDepthInterval = 1000d;
        public int FilterMethod = 0; // '0 - max, 1 - min
        public int PumpStatus = 0;




        public globalTimeFilter getCopy()
        {
            try
            {
                var objNew = new globalTimeFilter();
                objNew.FilterStatus = this.FilterStatus;
                objNew.FilterType = this.FilterType;
                objNew.FromDateTime = this.FromDateTime;
                objNew.ToDateTime = this.ToDateTime;
                objNew.LastPeriod = this.LastPeriod;
                objNew.DepthFilterType = this.DepthFilterType;
                objNew.FromDepth = this.FromDepth;
                objNew.ToDepth = this.ToDepth;
                objNew.LastDepthPeriod = this.LastDepthPeriod;
                objNew.FromHookload = this.FromHookload;
                objNew.ToHookload = this.ToHookload;
                objNew.FilterByEvents = this.FilterByEvents;
                objNew.FilterWellID = this.FilterWellID;
                objNew.FilterWellboreID = this.FilterWellboreID;
                objNew.filterBasedOnDepth = this.filterBasedOnDepth;
                objNew.FilterDepthInterval = this.FilterDepthInterval;
                objNew.FilterMethod = this.FilterMethod;
                objNew.PumpStatus = this.PumpStatus;
                objNew.FilterByHkldRange = this.FilterByHkldRange;
                objNew.FilterByMean = this.FilterByMean;
                objNew.MeanDepthRange = this.MeanDepthRange;
                objNew.AllowedRange = this.AllowedRange;
                objNew.MeanMethod = this.MeanMethod;
                //if (EventList is null)
                //{
                //    EventList = new Dictionary<int, WellEventLink>();
                //}

                //foreach (int objKey in EventList.Keys)
                //    objNew.EventList.Add(objKey, EventList[objKey].getCopy);

                if (timeRanges is null)
                {
                    timeRanges = new Dictionary<string, HookloadTimeFilterRange>();
                }

                foreach (string objKey in timeRanges.Keys)
                    objNew.timeRanges.Add(objKey, timeRanges[objKey].getCopy());
                return objNew;
            }
            catch (Exception ex)
            {
                
                return new globalTimeFilter();
            }
        }


        //public void updateFilter(ref DataSeries objSeries)
        //{
        //    try
        //    {
        //        if (objSeries.DataSource.dataType == DataSource.dsDataType.TimeLog)
        //        {
        //            objSeries.DataSource.AdditionalFilter = buildFilterString();
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        VuMaxLogger.logMessage(ex);
        //    }
        //}


        public static globalTimeFilter makeFilterFromString(string filterString)
        {
            try
            {
                if (string.IsNullOrEmpty(filterString.Trim()))
                {
                    return new globalTimeFilter();
                }

                var arrParts = filterString.Split('~');
                var objNew = new globalTimeFilter();
                switch (Convert.ToInt32(arrParts[2]))
                {
                    case 0:
                        {
                            objNew.FilterType = vFilterType.LastData;
                            break;
                        }

                    case 1:
                        {
                            objNew.FilterType = vFilterType.SpecificRange;
                            break;
                        }

                    case 2:
                        {
                            objNew.FilterType = vFilterType.OpenEnded;
                            break;
                        }

                    case 3:
                        {
                            objNew.FilterType = vFilterType.None;
                            break;
                        }
                }

                if (Convert.ToInt32(arrParts[2]) == 0)
                {
                    objNew.FilterType = vFilterType.LastData;
                    objNew.LastPeriod = Convert.ToDouble( arrParts[5]);
                }

                if (Convert.ToDouble(arrParts[2]) == 1)
                {
                    objNew.FilterType = vFilterType.SpecificRange;
                    objNew.FromDateTime = DateTime.FromOADate(Convert.ToDouble(arrParts[3])).ToString();
                    objNew.ToDateTime = DateTime.FromOADate(Convert.ToDouble(arrParts[4])).ToString();
                }

                if (Convert.ToDouble(arrParts[2]) == 2)
                {
                    objNew.FilterType = vFilterType.OpenEnded;
                    objNew.FromDateTime = DateTime.FromOADate(Convert.ToDouble(arrParts[3])).ToString();
                }

                if (arrParts.Length > 6)
                {
                    switch (Convert.ToDouble(arrParts[6]))
                    {
                        case 0:
                            {
                                objNew.DepthFilterType = vFilterType.LastData;
                                break;
                            }

                        case 1:
                            {
                                objNew.DepthFilterType = vFilterType.SpecificRange;
                                break;
                            }

                        case 2:
                            {
                                objNew.DepthFilterType = vFilterType.OpenEnded;
                                break;
                            }

                        case 3:
                            {
                                objNew.DepthFilterType = vFilterType.None;
                                break;
                            }
                    }

                    if (Convert.ToDouble(arrParts[6]) == 0)
                    {
                        objNew.DepthFilterType = vFilterType.LastData;
                        objNew.LastDepthPeriod = Convert.ToDouble(arrParts[9]);
                    }

                    if (Convert.ToDouble(arrParts[6]) == 1)
                    {
                        objNew.DepthFilterType = vFilterType.SpecificRange;
                        objNew.FromDepth = Convert.ToDouble(arrParts[7]);
                        objNew.ToDepth = Convert.ToDouble(arrParts[8]);
                    }

                    if (Convert.ToDouble(arrParts[6]) == 2)
                    {
                        objNew.DepthFilterType = vFilterType.OpenEnded;
                        objNew.FromDepth = Convert.ToDouble(arrParts[7]);
                    }
                }

                if (arrParts.Length > 10)
                {
                    string strTimeRanges = arrParts[10];
                    if (!string.IsNullOrEmpty(strTimeRanges.Trim()))
                    {
                        var arrPartsTimeRange = strTimeRanges.Split('#');
                        for (int i = 0, loopTo = arrPartsTimeRange.Length - 1; i <= loopTo; i++)
                        {
                            var objItem = new HookloadTimeFilterRange();
                            objItem.RangeID = arrPartsTimeRange[i].ToString().Split('^')[0];
                            objItem.FromDate = arrPartsTimeRange[i].ToString().Split('^')[1];
                            objItem.ToDate = arrPartsTimeRange[i].ToString().Split('^')[2];
                            objItem.Color = Convert.ToInt32 (arrPartsTimeRange[i].ToString().Split('^')[3]);
                            objNew.timeRanges.Add(objItem.RangeID, objItem.getCopy());
                        }
                    }
                }

                return objNew;
            }
            catch (Exception ex)
            {
                return new globalTimeFilter();
            }
        }

        public string buildFilterString()
        {
            try
            {
                string strFilterString = "";
                strFilterString = "$~T";
                switch (FilterType)
                {
                    case var @case when @case == vFilterType.LastData:
                        {
                            strFilterString = strFilterString + "~" + "0";
                            break;
                        }

                    case var case1 when case1 == vFilterType.SpecificRange:
                        {
                            strFilterString = strFilterString + "~" + "1";
                            break;
                        }

                    case var case2 when case2 == vFilterType.OpenEnded:
                        {
                            strFilterString = strFilterString + "~" + "2";
                            break;
                        }
                }

                if (FilterType == vFilterType.LastData)
                {
                    // 'Blank from and to values
                    strFilterString = strFilterString + "~" + "...";
                    strFilterString = strFilterString + "~" + "...";
                    strFilterString = strFilterString + "~" + LastPeriod.ToString();
                }

                if (FilterType == vFilterType.SpecificRange)
                {
                    strFilterString = strFilterString + "~" + Convert.ToDateTime(FromDateTime).ToOADate().ToString();
                    strFilterString = strFilterString + "~" + Convert.ToDateTime(ToDateTime).ToOADate().ToString();
                    strFilterString = strFilterString + "~" + "0";
                }

                if (FilterType == vFilterType.OpenEnded)
                {
                    strFilterString = strFilterString + "~" + Convert.ToDateTime(FromDateTime).ToOADate().ToString();
                    strFilterString = strFilterString + "~" + "...";
                    strFilterString = strFilterString + "~" + "0";
                }

                if (DepthFilterType == vFilterType.LastData)
                {
                    // 'Blank from and to values
                    strFilterString = strFilterString + "~" + "0";
                    strFilterString = strFilterString + "~" + "...";
                    strFilterString = strFilterString + "~" + "...";
                    strFilterString = strFilterString + "~" + LastDepthPeriod.ToString();
                }

                if (DepthFilterType == vFilterType.SpecificRange)
                {
                    strFilterString = strFilterString + "~" + "1";
                    strFilterString = strFilterString + "~" + FromDepth.ToString();
                    strFilterString = strFilterString + "~" + ToDepth.ToString();
                    strFilterString = strFilterString + "~" + "0";
                }

                if (DepthFilterType == vFilterType.OpenEnded)
                {
                    strFilterString = strFilterString + "~" + "2";
                    strFilterString = strFilterString + "~" + FromDepth.ToString();
                    strFilterString = strFilterString + "~" + "...";
                    strFilterString = strFilterString + "~" + "0";
                }

                if (DepthFilterType == vFilterType.None)
                {
                    strFilterString = strFilterString + "~" + "3";
                    strFilterString = strFilterString + "~" + "0";
                    strFilterString = strFilterString + "~" + "...";
                    strFilterString = strFilterString + "~" + "0";
                }

                strFilterString += "~";
                string strTimeRanges = "";
                foreach (HookloadTimeFilterRange objItem in timeRanges.Values)
                    strTimeRanges += "#" + objItem.RangeID + "^" + objItem.FromDate + "^" + objItem.ToDate + "^" + objItem.Color.ToString();
                if (!string.IsNullOrEmpty(strTimeRanges.Trim()))
                {
                    strTimeRanges = strTimeRanges.Substring(1);
                }

                strFilterString += strTimeRanges;
                return strFilterString;
            }
            catch (Exception ex)
            {
                return "";
            }
        }



    }//Class
}
