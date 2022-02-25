using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Broomstick.Document.BroomstickDocument
{
    public class ROBPoint: IComparable
    {
        public DateTime RecordDate;
        public double Hkld = 0d;
        public double Torque = 0d;
        public double RPM = 0d;
        public double Depth = 0d;
        public double Circulation = 0d;
        public double PumpPressure = 0d;
        public PUSOPoint.pusoPumpStatus pumpStatus = PUSOPoint.pusoPumpStatus.PumpOn;

        public ROBPoint getCopy()
        {
            try
            {
                var objNew = new ROBPoint();
                objNew.RecordDate = RecordDate;
                objNew.Hkld = Hkld;
                objNew.Torque = Torque;
                objNew.RPM = RPM;
                objNew.Depth = Depth;
                objNew.Circulation = Circulation;
                objNew.PumpPressure = PumpPressure;
                objNew.pumpStatus = pumpStatus;
                return objNew;
            }
            catch (Exception ex)
            {
                return new ROBPoint();
            }
        }

        public static Dictionary<int, ROBPoint> filterROBListByTime(Dictionary<int, ROBPoint> list)
        {
            try
            {
                var newList = new Dictionary<int, ROBPoint>();
                var arrPoints = list.Values.ToArray();
                int MAX_THRESHOLD = 5;
                int MIN_DATAAMOUNT = 8;
                int MAX_DEPTH_THRESHOLD = 3;
                var startDate = arrPoints[0].RecordDate;
                var subList = new Dictionary<int, ROBPoint>();
                subList.Add(subList.Count + 1, arrPoints[0].getCopy());
                for (int i = 1, loopTo = arrPoints.Length - 1; i <= loopTo; i++)
                {
                    var lnDate = arrPoints[i].RecordDate;
                    var lnPrevDate = arrPoints[i - 1].RecordDate;
                    //int secDiff = (int)Math.Abs(DateAndTime.DateDiff(DateInterval.Second, lnPrevDate, lnDate));
                    int secDiff = Math.Abs((lnPrevDate- lnDate).Seconds);
                    if (secDiff > MAX_THRESHOLD)
                    {
                        // 'Break Found ...

                        double lnMaxDepth = 0d;
                        double lnMinDepth = 0d;
                        foreach (ROBPoint objPoint in subList.Values)
                        {
                            if (objPoint.Depth > lnMaxDepth)
                            {
                                lnMaxDepth = objPoint.Depth;
                            }
                        }

                        lnMinDepth = lnMaxDepth;
                        foreach (ROBPoint objPoint in subList.Values)
                        {
                            if (objPoint.Depth < lnMinDepth)
                            {
                                lnMinDepth = objPoint.Depth;
                            }
                        }

                        lnMaxDepth = lnMinDepth;
                        foreach (ROBPoint objPoint in subList.Values)
                        {
                            if (objPoint.Depth > lnMaxDepth)
                            {
                                lnMaxDepth = objPoint.Depth;
                            }
                        }

                        double depthDiff = lnMaxDepth - lnMinDepth;
                        var subArray = subList.Values.ToArray();
                        Array.Sort(subArray);
                        int timeROB = 0;
                        if (subArray.GetType().IsArray)
                        {
                            if (subArray.Length > 0)
                            {
                                //timeROB = (int)Math.Abs(DateAndTime.DateDiff(DateInterval.Second, subArray[0].RecordDate, subArray[subArray.Length - 1].RecordDate));
                                timeROB = Math.Abs((subArray[0].RecordDate- subArray[subArray.Length - 1].RecordDate).Seconds);
                            }
                        }

                        // 'Check two conditions to make sure that sub list is good ...

                        bool validSubList = false;
                        if (timeROB > MIN_DATAAMOUNT & depthDiff < MAX_DEPTH_THRESHOLD)
                        {
                            validSubList = true;
                        }

                        if (validSubList)
                        {

                            // 'Add it to the main list ...

                            foreach (ROBPoint objPoint in subList.Values)
                                newList.Add(newList.Count + 1, objPoint.getCopy());
                        }

                        // 'Clear the sub list
                        subList.Clear();

                        // 'Process sub list ... and start over
                        startDate = lnDate;
                    }
                    else
                    {
                        // 'Push it to the temp list ...
                        subList.Add(subList.Count + 1, arrPoints[i].getCopy());
                    }
                }


                // 'Handle the rest of the buffered points ...

                // '**************************************************************''
                if (subList.Count > 0)
                {
                    double lnMaxDepth = 0d;
                    double lnMinDepth = 0d;
                    foreach (ROBPoint objPoint in subList.Values)
                    {
                        if (objPoint.Depth > lnMaxDepth)
                        {
                            lnMaxDepth = objPoint.Depth;
                        }
                    }

                    lnMinDepth = lnMaxDepth;
                    foreach (ROBPoint objPoint in subList.Values)
                    {
                        if (objPoint.Depth < lnMinDepth)
                        {
                            lnMinDepth = objPoint.Depth;
                        }
                    }

                    lnMaxDepth = lnMinDepth;
                    foreach (ROBPoint objPoint in subList.Values)
                    {
                        if (objPoint.Depth > lnMaxDepth)
                        {
                            lnMaxDepth = objPoint.Depth;
                        }
                    }

                    double depthDiff = lnMaxDepth - lnMinDepth;
                    var subArray = subList.Values.ToArray();
                    Array.Sort(subArray);
                    int timeROB = 0;
                    if (subArray.GetType().IsArray)
                    {
                        if (subArray.Length > 0)
                        {
                            //timeROB = (int)Math.Abs(DateAndTime.DateDiff(DateInterval.Second, subArray[0].RecordDate, subArray[subArray.Length - 1].RecordDate));
                            timeROB = Math.Abs((subArray[0].RecordDate- subArray[subArray.Length - 1].RecordDate).Seconds);
                        }
                    }

                    // 'Check two conditions to make sure that sub list is good ...

                    bool validSubList = false;
                    if (timeROB > MIN_DATAAMOUNT & depthDiff < MAX_DEPTH_THRESHOLD)
                    {
                        validSubList = true;
                    }

                    if (validSubList)
                    {

                        // 'Add it to the main list ...

                        foreach (ROBPoint objPoint in subList.Values)
                            newList.Add(newList.Count + 1, objPoint.getCopy());
                    }

                    // 'Clear the sub list
                    subList.Clear();
                }
                // '**************************************************************''


                return newList;
            }
            catch (Exception ex)
            {
                return new Dictionary<int, ROBPoint>();
            }
        }

        public static bool calculateROB(Dictionary<int, ROBPoint> plist, BroomStickSetup objSetup, ref double paramHkld, ref double paramTorque, ref bool paramStabilityFound, ref double paramSPPA, ref double paramCirc)
        {
            try
            {

                // 'Dim filteredList As Dictionary(Of Integer, ROBPoint) = ROBPoint.filterROBListByTime(plist)

                var filteredList = plist;

                // 'Find the stability point from the data
                if (filteredList.Count <= objSetup.TolerancePoints)
                {
                    // 'Simply calculate the avg. of all points and return ...

                    double sumHkld = 0d;
                    double sumTorque = 0d;
                    int sampleCount = 0;
                    foreach (ROBPoint objItem in filteredList.Values)
                    {
                        sumHkld = sumHkld + objItem.Hkld;
                        sumTorque = sumTorque + objItem.Torque;
                        sampleCount = sampleCount + 1;
                    }

                    if (sampleCount > 0 & sumHkld > 0d)
                    {
                        paramHkld = Math.Round(sumHkld / sampleCount, 2);
                    }

                    if (sampleCount > 0 & sumTorque > 0d)
                    {
                        paramTorque = Math.Round(sumTorque / sampleCount, 2);
                    }

                    paramStabilityFound = false;
                    return true;
                }

                var arrValues = filteredList.Values.ToArray();
                bool stabilityFound = false;
                int stabilityStartIndex = 0;
                int startPoint = 0;
                if (objSetup.TolerancePoints <= 0)
                {
                    objSetup.TolerancePoints = 1;
                }

                if (objSetup.ROBMaxHkldTolerance <= 0)
                {
                    objSetup.ROBMaxHkldTolerance = 1;
                }

                startPoint = objSetup.TolerancePoints;
                for (int i = startPoint, loopTo = arrValues.Length - 1; i <= loopTo; i++)
                {
                    double minValue = 0d;
                    double maxValue = 0d;
                    for (int j = i, loopTo1 = i - objSetup.TolerancePoints; j >= loopTo1; j -= 1)
                    {
                        if (arrValues[j].Hkld > maxValue)
                        {
                            maxValue = arrValues[j].Hkld;
                        }
                    }

                    minValue = maxValue;
                    for (int j = i, loopTo2 = i - objSetup.TolerancePoints; j >= loopTo2; j -= 1)
                    {
                        if (arrValues[j].Hkld < minValue)
                        {
                            minValue = arrValues[j].Hkld;
                        }
                    }

                    maxValue = minValue;
                    for (int j = i, loopTo3 = i - objSetup.TolerancePoints; j >= loopTo3; j -= 1)
                    {
                        if (arrValues[j].Hkld > maxValue)
                        {
                            maxValue = arrValues[j].Hkld;
                        }
                    }

                    double Diff = Math.Abs(maxValue - minValue);
                    if (Diff < objSetup.ROBMaxHkldTolerance)
                    {
                        // '### Stability Found ... 
                        stabilityFound = true;
                        stabilityStartIndex = i;
                        break;
                    }
                }

                if (stabilityFound)
                {
                    double sumHkld = 0d;
                    double sumTorque = 0d;
                    int sampleCount = 0;
                    double sumSPPA = 0d;
                    double sumCirc = 0d;
                    for (int i = stabilityStartIndex, loopTo4 = arrValues.Length - 1; i <= loopTo4; i++)
                    {
                        sumHkld = sumHkld + arrValues[i].Hkld;
                        sumTorque = sumTorque + arrValues[i].Torque;
                        sumSPPA = sumSPPA + arrValues[i].PumpPressure;
                        sumCirc = sumCirc + arrValues[i].Circulation;
                        sampleCount = sampleCount + 1;
                        stabilityFound = true;
                    }

                    if (sampleCount > 0 & sumHkld > 0d)
                    {
                        paramHkld = Math.Round(sumHkld / sampleCount, 2);
                    }

                    if (sampleCount > 0 & sumTorque > 0d)
                    {
                        paramTorque = Math.Round(sumTorque / sampleCount, 2);
                    }

                    if (sampleCount > 0 & sumSPPA > 0d)
                    {
                        paramSPPA = Math.Round(sumSPPA / sampleCount, 2);
                    }

                    if (sampleCount > 0 & sumCirc > 0d)
                    {
                        paramCirc = Math.Round(sumCirc / sampleCount, 2);
                    }
                }
                else
                {

                    // '### Take the last value ...

                    paramHkld = arrValues[arrValues.Length - 1].Hkld;
                    paramTorque = arrValues[arrValues.Length - 1].Torque;
                    paramCirc = arrValues[arrValues.Length - 1].Circulation;
                    paramSPPA = arrValues[arrValues.Length - 1].PumpPressure;
                }

                paramStabilityFound = stabilityFound;
                return true;
            }
            catch (Exception ex)
            {
                return true;
            }
        }

        public int CompareTo(object obj)
        {
            try
            {
                ROBPoint objNew = (ROBPoint)obj;
                if (RecordDate < objNew.RecordDate)
                {
                    return -1;
                }

                if (RecordDate == objNew.RecordDate)
                {
                    return 0;
                }

                if (RecordDate > objNew.RecordDate)
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
