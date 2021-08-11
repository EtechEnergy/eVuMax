using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.Common
{
    class DownSample
    {
        public static DataTable downSampleByDepth(DataTable objData, string paramDepthChannel, string paramTargetChannel, Dictionary<int, int> paramGroupFunctions, int NoOfDataPoints)
        {
            try
            {

                // 'Check if no data exist ...
                if (objData.Rows.Count <= 0)
                {
                    return objData;
                }

                // 'Make replica of data table
                var objDownSampleData = new DataTable();
                foreach (DataColumn objColumn in objData.Columns)
                    objDownSampleData.Columns.Add(objColumn.ColumnName, objColumn.DataType);

                // 'Record initial depth ...
                double startDepth =Convert.ToDouble( DataService.checkNull(objData.Rows[0][paramDepthChannel], 0));
                int intervalStartIndex = 0;
                int intervalEndIndex = 0;
                for (int i = 0, loopTo = objData.Rows.Count - 1; i <= loopTo; i++)
                {
                    double lnDepth =Convert.ToDouble( DataService.checkNull(objData.Rows[i][paramDepthChannel], 0));
                    if (Math.Abs(lnDepth - startDepth) >= 1d)
                    {

                        // 'Record end index
                        intervalEndIndex = i - 1;

                        // 'Perform Group Operation 
                        // 'Take Average now ...
                        downSampleInterval(objData, paramTargetChannel, paramGroupFunctions, NoOfDataPoints, ref objDownSampleData, intervalStartIndex, intervalEndIndex);

                        // 'Re-initialize depth counter ...
                        startDepth = lnDepth;

                        // 'Re-initialize start index
                        intervalStartIndex = i;
                    }
                }

                if (intervalStartIndex < objData.Rows.Count - 1)
                {
                    // 'Downsample remaining data ...

                    intervalEndIndex = objData.Rows.Count - 1;
                    downSampleInterval(objData, paramTargetChannel, paramGroupFunctions, NoOfDataPoints, ref objDownSampleData, intervalStartIndex, intervalEndIndex);
                }

                return objDownSampleData;
            }
            catch (Exception ex)
            {
                return objData;
            }
        }

        public static DataTable downSampleByTime(DataTable objData, string paramTargetChannel, Dictionary<int, int> paramGroupFunctions, int NoOfDataPoints, int timePeriod)
        {
            try
            {

                // 'Check if no data exist ...
                if (objData.Rows.Count <= 0)
                {
                    return objData;
                }

                int timePeriodSec = timePeriod * 60;

                // 'Make replica of data table
                var objDownSampleData = new DataTable();
                foreach (DataColumn objColumn in objData.Columns)
                    objDownSampleData.Columns.Add(objColumn.ColumnName, objColumn.DataType);

                // 'Record initial depth ...
                DateTime startDate =Convert.ToDateTime(DataService.checkNull(objData.Rows[0]["DATETIME"], new DateTime()));
                int intervalStartIndex = 0;
                int intervalEndIndex = 0;
                for (int i = 0, loopTo = objData.Rows.Count - 1; i <= loopTo; i++)
                {
                    DateTime dtTime = Convert.ToDateTime( DataService.checkNull(objData.Rows[i]["DATETIME"], new DateTime()));
                    //double TimeDiffSeconds = Math.Abs(DateDiff(DateInterval.Second, dtTime, startDate));
                    double TimeDiffSeconds = (dtTime - startDate).TotalSeconds;

                    if (TimeDiffSeconds >= timePeriodSec)
                    {

                        // 'Record end index
                        intervalEndIndex = i - 1;

                        // 'Perform Group Operation 
                        // 'Take Average now ...
                        downSampleInterval(objData, paramTargetChannel, paramGroupFunctions, NoOfDataPoints, ref objDownSampleData, intervalStartIndex, intervalEndIndex);

                        // 'Re-initialize depth counter ...
                        startDate = dtTime;

                        // 'Re-initialize start index
                        intervalStartIndex = i;
                    }
                }

                if (intervalStartIndex < objData.Rows.Count - 1)
                {
                    // 'Downsample remaining data ...

                    intervalEndIndex = objData.Rows.Count - 1;
                    downSampleInterval(objData, paramTargetChannel, paramGroupFunctions, NoOfDataPoints, ref objDownSampleData, intervalStartIndex, intervalEndIndex);
                }

                return objDownSampleData;
            }
            catch (Exception ex)
            {
                return objData;
            }
        }

        public static void downSampleInterval(DataTable objData, string paramTargetChannel, Dictionary<int, int> paramGroupFunctions, int NoOfDataPoints, ref DataTable objTargetData, int paramIntStartIndex, int paramIntEndIndex)
        {
            try
            {
                int DataPoints = paramIntEndIndex - paramIntStartIndex;
                int stepIncrement = 1;
                if (DataPoints <= NoOfDataPoints)
                {
                    stepIncrement = 1;
                    for (int i = paramIntStartIndex, loopTo = paramIntEndIndex; i <= loopTo; i++)
                    {
                        DataRow objNewRow = objTargetData.NewRow();
                        foreach (DataColumn objColumn in objData.Columns)
                            objNewRow[objColumn.ColumnName] = objData.Rows[i][objColumn.ColumnName];
                        objTargetData.Rows.Add(objNewRow);
                    }
                }
                else
                {
                    stepIncrement = (int)Math.Ceiling(DataPoints / (double)NoOfDataPoints);
                    if (NoOfDataPoints == 1)
                    {
                        // 'Choose the last data point ...

                        // 'Find Avg. ...
                        double sumValue =0;
                        double lnSamples =0;
                        double avgValue =0;
                        for (int j = paramIntStartIndex, loopTo1 = paramIntEndIndex; j <= loopTo1; j++)
                        {
                            sumValue = sumValue + Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                            lnSamples += 1d;
                        }

                        if (lnSamples > 0d & sumValue > 0d)
                        {
                            avgValue = Math.Round(sumValue / lnSamples, 3);
                        }

                        double lnMaxValue =0;
                        double lnMinValue =0;
                        double channelValue =0;

                        // 'Find Max ...
                        for (int j = paramIntStartIndex, loopTo2 = paramIntEndIndex; j <= loopTo2; j++)
                        {
                            channelValue = Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                            if (channelValue > lnMaxValue)
                            {
                                lnMaxValue = channelValue;
                            }
                        }

                        lnMinValue = lnMaxValue;

                        // 'Find Min ...
                        for (int j = paramIntStartIndex, loopTo3 = paramIntEndIndex; j <= loopTo3; j++)
                        {
                            channelValue =Convert.ToDouble(DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                            if (channelValue < lnMinValue)
                            {
                                lnMinValue = channelValue;
                            }
                        }

                        // 'Find Max Again ...
                        lnMaxValue = lnMinValue;
                        for (int j = paramIntStartIndex, loopTo4 = paramIntEndIndex; j <= loopTo4; j++)
                        {
                            channelValue = Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                            if (channelValue > lnMaxValue)
                            {
                                lnMaxValue = channelValue;
                            }
                        }

                        // '** Min **
                        if (paramGroupFunctions.ContainsKey(0))
                        {
                            DataRow objNewRow = objTargetData.NewRow();
                            foreach (DataColumn objColumn in objData.Columns)
                                objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                            objNewRow[paramTargetChannel] = lnMinValue;
                            objTargetData.Rows.Add(objNewRow);
                        }


                        // '** Max **
                        if (paramGroupFunctions.ContainsKey(1))
                        {
                            DataRow objNewRow = objTargetData.NewRow();
                            foreach (DataColumn objColumn in objData.Columns)
                                objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                            objNewRow[paramTargetChannel] = lnMaxValue;
                            objTargetData.Rows.Add(objNewRow);
                        }


                        // '** Avg **
                        if (paramGroupFunctions.ContainsKey(2))
                        {
                            DataRow objNewRow = objTargetData.NewRow();
                            foreach (DataColumn objColumn in objData.Columns)
                                objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                            objNewRow[paramTargetChannel] = avgValue;
                            objTargetData.Rows.Add(objNewRow);
                        }
                    }
                    else
                    {
                        int lastCounter = 0;
                        for (int i = paramIntStartIndex + stepIncrement - 1, loopTo5 = paramIntEndIndex; stepIncrement >= 0 ? i <= loopTo5 : i >= loopTo5; i += stepIncrement)
                        {

                            // 'Skip the last chunk if not enough data is available ...
                            if (i + stepIncrement > paramIntEndIndex)
                            {
                                bool halt4 = true;
                                break;
                            }

                            lastCounter = i;

                            // 'Find Avg. ...
                            double sumValue =0;
                            double lnSamples =0;
                            double avgValue =0;
                            for (int j = i, loopTo6 = i - stepIncrement + 1; j >= loopTo6; j -= 1)
                            {
                                sumValue = sumValue + Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                lnSamples += 1d;
                            }

                            if (lnSamples > 0d & sumValue > 0d)
                            {
                                avgValue = Math.Round(sumValue / lnSamples, 3);
                            }

                            double lnMaxValue =0;
                            double lnMinValue =0;
                            double channelValue =0;

                            // 'Find Max ...
                            for (int j = i, loopTo7 = i - stepIncrement + 1; j >= loopTo7; j -= 1)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue > lnMaxValue)
                                {
                                    lnMaxValue = channelValue;
                                }
                            }

                            lnMinValue = lnMaxValue;

                            // 'Find Min ...
                            for (int j = i, loopTo8 = i - stepIncrement + 1; j >= loopTo8; j -= 1)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue < lnMinValue)
                                {
                                    lnMinValue = channelValue;
                                }
                            }

                            // 'Find Max Again ...
                            lnMaxValue = lnMinValue;
                            for (int j = i, loopTo9 = i - stepIncrement + 1; j >= loopTo9; j -= 1)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue > lnMaxValue)
                                {
                                    lnMaxValue = channelValue;
                                }
                            }

                            // '** Min **
                            if (paramGroupFunctions.ContainsKey(0))
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[i][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = lnMinValue;
                                objTargetData.Rows.Add(objNewRow);
                            }


                            // '** Max **
                            if (paramGroupFunctions.ContainsKey(1))
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[i][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = lnMaxValue;
                                objTargetData.Rows.Add(objNewRow);
                            }


                            // '** Avg **
                            if (paramGroupFunctions.ContainsKey(2))
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[i][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = avgValue;
                                objTargetData.Rows.Add(objNewRow);
                            }
                        }



                        // 'Calculate the remaining records ...
                        if (lastCounter + 1 < paramIntEndIndex)
                        {
                            lastCounter = lastCounter + 1;

                            // 'Find Avg. ...
                            double sumValue =0;
                            double lnSamples =0;
                            double avgValue =0;
                            for (int j = lastCounter, loopTo10 = paramIntEndIndex; j <= loopTo10; j++)
                            {
                                sumValue = sumValue + Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                lnSamples += 1d;
                            }

                            if (lnSamples > 0d & sumValue > 0d)
                            {
                                avgValue = Math.Round(sumValue / lnSamples, 3);
                            }

                            double lnMaxValue =0;
                            double lnMinValue =0;
                            double channelValue =0;

                            // 'Find Max ...
                            for (int j = lastCounter, loopTo11 = paramIntEndIndex; j <= loopTo11; j++)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue > lnMaxValue)
                                {
                                    lnMaxValue = channelValue;
                                }
                            }

                            lnMinValue = lnMaxValue;

                            // 'Find Min ...
                            for (int j = lastCounter, loopTo12 = paramIntEndIndex; j <= loopTo12; j++)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue < lnMinValue)
                                {
                                    lnMinValue = channelValue;
                                }
                            }

                            // 'Find Max Again ...
                            lnMaxValue = lnMinValue;
                            for (int j = lastCounter, loopTo13 = paramIntEndIndex; j <= loopTo13; j++)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue > lnMaxValue)
                                {
                                    lnMaxValue = channelValue;
                                }
                            }

                            // '** Min **
                            if (paramGroupFunctions.ContainsKey(0))
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = lnMinValue;
                                objTargetData.Rows.Add(objNewRow);
                            }


                            // '** Max **
                            if (paramGroupFunctions.ContainsKey(1))
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = lnMaxValue;
                                objTargetData.Rows.Add(objNewRow);
                            }


                            // '** Avg **
                            if (paramGroupFunctions.ContainsKey(2))
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = avgValue;
                                objTargetData.Rows.Add(objNewRow);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }

        public static DataTable downSampleByDepthEx(DataTable objData, string paramDepthChannel, string paramTargetChannel, int paramGroupFunction, int NoOfDataPoints)
        {
            try
            {

                // 'Check if no data exist ...
                if (objData.Rows.Count <= 0)
                {
                    return objData;
                }

                // 'Make replica of data table
                var objDownSampleData = new DataTable();
                foreach (DataColumn objColumn in objData.Columns)
                    objDownSampleData.Columns.Add(objColumn.ColumnName, objColumn.DataType);

                // 'Record initial depth ...
                double startDepth =Convert.ToDouble( DataService.checkNull(objData.Rows[0][paramDepthChannel], 0));
                int intervalStartIndex = 0;
                int intervalEndIndex = 0;
                for (int i = 0, loopTo = objData.Rows.Count - 1; i <= loopTo; i++)
                {
                    double lnDepth =Convert.ToDouble( DataService.checkNull(objData.Rows[i][paramDepthChannel], 0));
                    if (Math.Abs(lnDepth - startDepth) >= 1d)
                    {

                        // 'Record end index
                        intervalEndIndex = i - 1;

                        // 'Perform Group Operation 
                        // 'Take Average now ...
                        downSampleIntervalEx(objData, paramTargetChannel, paramGroupFunction, NoOfDataPoints, ref objDownSampleData, intervalStartIndex, intervalEndIndex);

                        // 'Re-initialize depth counter ...
                        startDepth = lnDepth;

                        // 'Re-initialize start index
                        intervalStartIndex = i;
                    }
                }

                if (intervalStartIndex < objData.Rows.Count - 1)
                {
                    // 'Downsample remaining data ...

                    intervalEndIndex = objData.Rows.Count - 1;
                    downSampleIntervalEx(objData, paramTargetChannel, paramGroupFunction, NoOfDataPoints, ref objDownSampleData, intervalStartIndex, intervalEndIndex);
                }

                return objDownSampleData;
            }
            catch (Exception ex)
            {
                return objData;
            }
        }

        public static void downSampleIntervalEx(DataTable objData, string paramTargetChannel, int paramGroupFunction, int NoOfDataPoints, ref DataTable objTargetData, int paramIntStartIndex, int paramIntEndIndex)
        {
            try
            {
                int DataPoints = paramIntEndIndex - paramIntStartIndex;
                int stepIncrement = 1;
                if (DataPoints <= NoOfDataPoints)
                {
                    stepIncrement = 1;
                    for (int i = paramIntStartIndex, loopTo = paramIntEndIndex; i <= loopTo; i++)
                    {
                        DataRow objNewRow = objTargetData.NewRow();
                        foreach (DataColumn objColumn in objData.Columns)
                            objNewRow[objColumn.ColumnName] = objData.Rows[i][objColumn.ColumnName];
                        objTargetData.Rows.Add(objNewRow);
                    }
                }
                else
                {
                    stepIncrement = (int)Math.Ceiling(DataPoints / (double)NoOfDataPoints);
                    if (NoOfDataPoints == 1)
                    {
                        // 'Choose the last data point ...

                        // 'Find Avg. ...
                        double sumValue =0;
                        double lnSamples =0;
                        double avgValue =0;
                        for (int j = paramIntStartIndex, loopTo1 = paramIntEndIndex; j <= loopTo1; j++)
                        {
                            sumValue = sumValue +Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                            lnSamples += 1d;
                        }

                        if (lnSamples > 0d & sumValue > 0d)
                        {
                            avgValue = Math.Round(sumValue / lnSamples, 3);
                        }

                        double lnMaxValue =0;
                        double lnMinValue =0;
                        double channelValue =0;

                        // 'Find Max ...
                        for (int j = paramIntStartIndex, loopTo2 = paramIntEndIndex; j <= loopTo2; j++)
                        {
                            channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                            if (channelValue > lnMaxValue)
                            {
                                lnMaxValue = channelValue;
                            }
                        }

                        lnMinValue = lnMaxValue;

                        // 'Find Min ...
                        for (int j = paramIntStartIndex, loopTo3 = paramIntEndIndex; j <= loopTo3; j++)
                        {
                            channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                            if (channelValue < lnMinValue)
                            {
                                lnMinValue = channelValue;
                            }
                        }

                        // 'Find Max Again ...
                        lnMaxValue = lnMinValue;
                        for (int j = paramIntStartIndex, loopTo4 = paramIntEndIndex; j <= loopTo4; j++)
                        {
                            channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                            if (channelValue > lnMaxValue)
                            {
                                lnMaxValue = channelValue;
                            }
                        }

                        // '** Min **
                        if (paramGroupFunction == 2)
                        {
                            DataRow objNewRow = objTargetData.NewRow();
                            foreach (DataColumn objColumn in objData.Columns)
                                objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                            objNewRow[paramTargetChannel] = lnMinValue;
                            objTargetData.Rows.Add(objNewRow);
                        }


                        // '** Max **
                        if (paramGroupFunction == 1)
                        {
                            DataRow objNewRow = objTargetData.NewRow();
                            foreach (DataColumn objColumn in objData.Columns)
                                objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                            objNewRow[paramTargetChannel] = lnMaxValue;
                            objTargetData.Rows.Add(objNewRow);
                        }


                        // '** Avg **
                        if (paramGroupFunction == 0)
                        {
                            DataRow objNewRow = objTargetData.NewRow();
                            foreach (DataColumn objColumn in objData.Columns)
                                objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                            objNewRow[paramTargetChannel] = avgValue;
                            objTargetData.Rows.Add(objNewRow);
                        }
                    }
                    else
                    {
                        int lastCounter = 0;
                        for (int i = paramIntStartIndex + stepIncrement - 1, loopTo5 = paramIntEndIndex; stepIncrement >= 0 ? i <= loopTo5 : i >= loopTo5; i += stepIncrement)
                        {

                            // 'Skip the last chunk if not enough data is available ...
                            if (i + stepIncrement > paramIntEndIndex)
                            {
                                bool halt4 = true;
                                break;
                            }

                            lastCounter = i;

                            // 'Find Avg. ...
                            double sumValue =0;
                            double lnSamples =0;
                            double avgValue =0;
                            for (int j = i, loopTo6 = i - stepIncrement + 1; j >= loopTo6; j -= 1)
                            {
                                sumValue = sumValue + Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                lnSamples += 1d;
                            }

                            if (lnSamples > 0d & sumValue > 0d)
                            {
                                avgValue = Math.Round(sumValue / lnSamples, 3);
                            }

                            double lnMaxValue =0;
                            double lnMinValue =0;
                            double channelValue =0;

                            // 'Find Max ...
                            for (int j = i, loopTo7 = i - stepIncrement + 1; j >= loopTo7; j -= 1)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue > lnMaxValue)
                                {
                                    lnMaxValue = channelValue;
                                }
                            }

                            lnMinValue = lnMaxValue;

                            // 'Find Min ...
                            for (int j = i, loopTo8 = i - stepIncrement + 1; j >= loopTo8; j -= 1)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue < lnMinValue)
                                {
                                    lnMinValue = channelValue;
                                }
                            }

                            // 'Find Max Again ...
                            lnMaxValue = lnMinValue;
                            for (int j = i, loopTo9 = i - stepIncrement + 1; j >= loopTo9; j -= 1)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue > lnMaxValue)
                                {
                                    lnMaxValue = channelValue;
                                }
                            }

                            // '** Min **
                            if (paramGroupFunction == 2)
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[i][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = lnMinValue;
                                objTargetData.Rows.Add(objNewRow);
                            }


                            // '** Max **
                            if (paramGroupFunction == 1)
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[i][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = lnMaxValue;
                                objTargetData.Rows.Add(objNewRow);
                            }


                            // '** Avg **
                            if (paramGroupFunction == 0)
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[i][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = avgValue;
                                objTargetData.Rows.Add(objNewRow);
                            }
                        }



                        // 'Calculate the remaining records ...
                        if (lastCounter + 1 < paramIntEndIndex)
                        {
                            lastCounter = lastCounter + 1;

                            // 'Find Avg. ...
                            double sumValue =0;
                            double lnSamples =0;
                            double avgValue =0;
                            for (int j = lastCounter, loopTo10 = paramIntEndIndex; j <= loopTo10; j++)
                            {
                                sumValue = sumValue + Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                lnSamples += 1d;
                            }

                            if (lnSamples > 0d & sumValue > 0d)
                            {
                                avgValue = Math.Round(sumValue / lnSamples, 3);
                            }

                            double lnMaxValue =0;
                            double lnMinValue =0;
                            double channelValue =0;

                            // 'Find Max ...
                            for (int j = lastCounter, loopTo11 = paramIntEndIndex; j <= loopTo11; j++)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue > lnMaxValue)
                                {
                                    lnMaxValue = channelValue;
                                }
                            }

                            lnMinValue = lnMaxValue;

                            // 'Find Min ...
                            for (int j = lastCounter, loopTo12 = paramIntEndIndex; j <= loopTo12; j++)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue < lnMinValue)
                                {
                                    lnMinValue = channelValue;
                                }
                            }

                            // 'Find Max Again ...
                            lnMaxValue = lnMinValue;
                            for (int j = lastCounter, loopTo13 = paramIntEndIndex; j <= loopTo13; j++)
                            {
                                channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                                if (channelValue > lnMaxValue)
                                {
                                    lnMaxValue = channelValue;
                                }
                            }

                            // '** Min **
                            if (paramGroupFunction == 2)
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = lnMinValue;
                                objTargetData.Rows.Add(objNewRow);
                            }


                            // '** Max **
                            if (paramGroupFunction == 1)
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = lnMaxValue;
                                objTargetData.Rows.Add(objNewRow);
                            }


                            // '** Avg **
                            if (paramGroupFunction == 0)
                            {
                                DataRow objNewRow = objTargetData.NewRow();
                                foreach (DataColumn objColumn in objData.Columns)
                                    objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                                objNewRow[paramTargetChannel] = avgValue;
                                objTargetData.Rows.Add(objNewRow);
                            }
                        }
                    }
                } // '<<Till here
            }
            catch (Exception ex)
            {
            }
        }

        public static double calculateGroupValue(DataTable objData, string paramTargetChannel, int paramGroupFunction, int paramIntStartIndex, int paramIntEndIndex)
        {
            try
            {
                double calcValue =0;

                // 'Max value ...
                if (paramGroupFunction == 0)
                {
                    double lnMaxValue =0;
                    double lnMinValue =0;
                    double channelValue =0;
                    for (int j = paramIntStartIndex, loopTo = paramIntEndIndex; j <= loopTo; j++)
                    {
                        channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                        if (channelValue < lnMinValue)
                        {
                            lnMinValue = channelValue;
                        }
                    }

                    lnMaxValue = lnMinValue;
                    for (int j = paramIntStartIndex, loopTo1 = paramIntEndIndex; j <= loopTo1; j++)
                    {
                        channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                        if (channelValue > lnMaxValue)
                        {
                            lnMaxValue = channelValue;
                        }
                    }

                    calcValue = lnMaxValue;
                }



                // 'Min
                if (paramGroupFunction == 1)
                {
                    double lnMaxValue =0;
                    double lnMinValue =0;
                    double channelValue =0;
                    for (int j = paramIntStartIndex, loopTo2 = paramIntEndIndex; j <= loopTo2; j++)
                    {
                        channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                        if (channelValue > lnMaxValue)
                        {
                            lnMaxValue = channelValue;
                        }
                    }

                    lnMinValue = lnMaxValue;
                    for (int j = paramIntStartIndex, loopTo3 = paramIntEndIndex; j <= loopTo3; j++)
                    {
                        channelValue =Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                        if (channelValue < lnMinValue)
                        {
                            lnMinValue = channelValue;
                        }
                    }

                    calcValue = lnMinValue;
                }


                // 'Avg
                if (paramGroupFunction == 2)
                {

                    // 'Find Avg. ...
                    double sumValue =0;
                    double lnSamples =0;
                    double avgValue =0;
                    for (int j = paramIntStartIndex, loopTo4 = paramIntEndIndex; j <= loopTo4; j++)
                    {
                        sumValue = sumValue +Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                        lnSamples += 1d;
                    }

                    if (lnSamples > 0d & sumValue > 0d)
                    {
                        avgValue = Math.Round(sumValue / lnSamples, 3);
                    }

                    calcValue = avgValue;
                }

                return calcValue;
            }
            catch (Exception ex)
            {
                return 0d;
            }
        }

        public static DataTable downSampleByMovingAvg(DataTable objData, string paramDepthChannel, string paramTargetChannel, int paramGroupFunction, int NoOfDataPoints)
        {
            try
            {

                // 'Check if no data exist ...
                if (objData.Rows.Count <= 0)
                {
                    return objData;
                }

                if (objData.Rows.Count <= NoOfDataPoints)
                {
                    // 'Nothing to do ... not enough data to downsample ... run as it is 
                    return objData;
                }

                if (NoOfDataPoints <= 0)
                {
                    NoOfDataPoints = 1;
                }

                // 'Make replica of data table
                var objDownSampleData = new DataTable();
                foreach (DataColumn objColumn in objData.Columns)
                    objDownSampleData.Columns.Add(objColumn.ColumnName, objColumn.DataType);

                // 'Record initial depth ...
                double startDepth = Convert.ToDouble( DataService.checkNull(objData.Rows[0][paramDepthChannel], 0));
                int intervalStartIndex = 0;
                int intervalEndIndex = 0;
                int pointCounter = 0;
                for (int i = NoOfDataPoints - 1, loopTo = objData.Rows.Count - 1; NoOfDataPoints >= 0 ? i <= loopTo : i >= loopTo; i += NoOfDataPoints)
                {
                    intervalStartIndex = i - NoOfDataPoints + 1;
                    intervalEndIndex = i;

                    // 'Perform Group Operation 
                    // 'Take Average now ...
                    downSampleIntervalExMovingAvg(objData, paramTargetChannel, paramGroupFunction, NoOfDataPoints, ref objDownSampleData, intervalStartIndex, intervalEndIndex);
                }

                return objDownSampleData;
            }
            catch (Exception ex)
            {
                return objData;
            }
        }

        public static void downSampleIntervalExMovingAvg(DataTable objData, string paramTargetChannel, int paramGroupFunction, int NoOfDataPoints, ref DataTable objTargetData, int paramIntStartIndex, int paramIntEndIndex)
        {
            try
            {

                // 'Find Avg. ...
                double sumValue =0;
                double lnSamples =0;
                double avgValue =0;
                for (int j = paramIntStartIndex, loopTo = paramIntEndIndex; j <= loopTo; j++)
                {
                    sumValue = sumValue +Convert.ToDouble( DataService.checkNull(objData.Rows[j][paramTargetChannel], 0));
                    lnSamples += 1d;
                }

                if (lnSamples > 0d & sumValue > 0d)
                {
                    avgValue = Math.Round(sumValue / lnSamples, 3);
                }

                // 'Add a new row with Avg. value ...
                DataRow objNewRow = objTargetData.NewRow();
                foreach (DataColumn objColumn in objData.Columns)
                    objNewRow[objColumn.ColumnName] = objData.Rows[paramIntEndIndex][objColumn.ColumnName];
                // 'Replace the Avg. Value ...
                objNewRow[paramTargetChannel] = avgValue;
                objTargetData.Rows.Add(objNewRow);
            }
            catch (Exception ex)
            {
            }
        }

        public static void smoothByMovingAvg(ref double[] paramData, double paramDataPoints)
        {
            try
            {
                if (paramData.Length <= paramDataPoints)
                {
                    // 'Nothing to smooth ...
                    return;
                }

                if (paramDataPoints <= 0d)
                {
                    // 'Nothing to smooth ...
                    return;
                }

                var paramTargetData = new double[paramData.Length];

                // 'Take backup of raw data ...
                for (int i = 0, loopTo = paramData.Length - 1; i <= loopTo; i++)
                    paramTargetData[i] = paramData[i];
                for (int i = (int)(paramDataPoints - 1d), loopTo1 = paramData.Length - 1; i <= loopTo1; i++)
                {
                    double sum =0;
                    int sampleCount = 0;
                    for (int j = (int)(i - paramDataPoints + 1d), loopTo2 = i; j <= loopTo2; j++)
                    {
                        sum = sum + paramData[j];
                        sampleCount = sampleCount + 1;
                    }

                    if (sum != 0d & sampleCount != 0)
                    {
                        paramTargetData[i] = Math.Round(sum / sampleCount, 2);
                    }
                }

                // 'Restore data 
                for (int i = 0, loopTo3 = paramTargetData.Length - 1; i <= loopTo3; i++)
                    paramData[i] = paramTargetData[i];
            }
            catch (Exception ex)
            {
            }
        }
    }
}
