using System;
using System.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.Broomstick.Document.BroomstickDocument
{
    public class PUSOPoint
    {
        public enum pusoPumpStatus
        {
            PumpOn = 0,
            PumpOff = 1
        }

        public double Depth = 0d;
        public DateTime StartDate;
        public DateTime EndDate;
        public int StartIndex = 0;
        public int EndIndex = 0;
        public double Min = 0d;
        public double Max = 0d;
        public double Avg = 0d;
        public double Avg2 = 0d;
        public double StartDepth = 0d;
        public double EndDepth = 0d;
        public double BlockMovement = 0d;
        public int MaxIndex = 0;
        public double DynamicValue = 0d;
        public double DynamicTorqueValue = 0d;
        public double Circulation = 0d;
        public double PumpPressure = 0d;
        public double UserDynamicValue = 0d;
        public double UserStaticValue = 0d;
        public bool UserVisible = true;
        public pusoPumpStatus PumpStatus = pusoPumpStatus.PumpOn;


        public PUSOPoint getCopy()
        {
            try
            {
                var objNew = new PUSOPoint();
                objNew.StartDate = this.StartDate;
                objNew.EndDate = this.EndDate;
                objNew.StartIndex = this.StartIndex;
                objNew.EndIndex = this.EndIndex;
                objNew.Min = this.Min;
                objNew.Max = this.Max;
                objNew.Avg = this.Avg;
                objNew.StartDepth = this.StartDepth;
                objNew.EndDepth = this.EndDepth;
                objNew.BlockMovement = this.BlockMovement;
                objNew.MaxIndex = this.MaxIndex;
                objNew.DynamicValue = this.DynamicValue;
                objNew.Depth = this.Depth;
                objNew.PumpPressure = this.PumpPressure;
                objNew.Circulation = this.Circulation;
                objNew.PumpStatus = this.PumpStatus;
                objNew.DynamicTorqueValue = this.DynamicTorqueValue;
                objNew.Avg2 = this.Avg2;
                objNew.UserDynamicValue = this.UserDynamicValue;
                objNew.UserStaticValue = this.UserStaticValue;
                objNew.UserVisible = this.UserVisible;
                return objNew;
            }
            catch (Exception ex)
            {
                return new PUSOPoint();
            }
        }

        public static void calculateStaticPUValues(ref DataTable objData, ref PUSOPoint objPUSOPoint, BroomStickSetup objSetup, WellSectionPUSOSettings objWellSectionPUSOSetting = default)
        {
            try
            {
                double MaxValue = 0d;
                double MinValue = 0d;
                int MaxIndex = 0;


                // '(1) Find Max First ...
                for (int i = objPUSOPoint.StartIndex, loopTo = objPUSOPoint.EndIndex; i >= loopTo; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.pickupPumpMnemonic]);

                    // 'Nishant
                    if (objWellSectionPUSOSetting is object)
                    {
                        lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetting.PUChannel]);
                    }
                    // '*********


                    

                    // '*** Ignore the pump stautus now ...
                    if (lnHookload > MaxValue)
                    {
                        MaxValue = lnHookload;
                        MaxIndex = i;
                    }


                  

                }

                MinValue = MaxValue;

                // '(2) Find Min now ...
                for (int i = objPUSOPoint.StartIndex, loopTo1 = objPUSOPoint.EndIndex; i >= loopTo1; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.pickupPumpMnemonic]);

                    // 'nishant
                    if (objWellSectionPUSOSetting is object)
                    {
                        lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetting.PUChannel]);
                    }
                    // '***********


                  

                    // '** Ignore the pump status ...
                    if (lnHookload < MinValue)
                    {
                        MinValue = lnHookload;
                    }

                  

                }

                MaxValue = MinValue;


                // '(3) Find Max Again ...
                for (int i = objPUSOPoint.StartIndex, loopTo2 = objPUSOPoint.EndIndex; i >= loopTo2; i -= 1)
                {
                    int lnRigState = Convert.ToInt32(objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.pickupPumpMnemonic]);

                    // 'Nishant
                    if (objWellSectionPUSOSetting is object)
                    {
                        lnPumpValue =  Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetting.PUChannel]);
                    }


                    // '**********



                  

                    // '** Ignore the pump status ...
                    if (lnHookload > MaxValue)
                    {
                        MaxValue = lnHookload;
                        MaxIndex = i;
                    }

                   

                }

                int sampleCount = 0;
                double sumValue = 0d;
                double AvgValue = 0d;
                for (int i = objPUSOPoint.StartIndex, loopTo3 = objPUSOPoint.EndIndex; i >= loopTo3; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.pickupPumpMnemonic]);

                    // 'Nishant
                    if (objWellSectionPUSOSetting != null)
                    {
                        lnPumpValue =Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetting.PUChannel]);
                    }

                    // '*********


                    // 'If (lnRigState = 10 Or lnRigState = 8 Or lnRigState = 4 Or lnRigState = 6) Then

                    // '** Ignore the pump status
                    sampleCount = sampleCount + 1;
                    sumValue = sumValue + lnHookload;

                 

                }

                if (sampleCount > 0 & sumValue > 0d)
                {
                    AvgValue = Math.Round(sumValue / sampleCount, 2);
                }

                objPUSOPoint.Max = MaxValue;
                objPUSOPoint.Min = MinValue;
                objPUSOPoint.Avg = AvgValue;
                objPUSOPoint.MaxIndex = MaxIndex;
            }
            catch (Exception ex)
            {
            }
        }


        public static void calculateDynamicPUValues(ref DataTable objData, ref PUSOPoint objPUSOPoint, BroomStickSetup objSetup, WellSectionPUSOSettings objWellSectionPUSOSetting = default)
        {
            try
            {
                if (objPUSOPoint.Max == 0)
                {
                    return;
                }

                double DynamicValue = 0d;
                double DynamicAvg = 0d;
                int startPoint = objPUSOPoint.MaxIndex;
                if (startPoint == 0)
                {
                    startPoint = objPUSOPoint.StartIndex;
                }

                for (int i = startPoint, loopTo = objPUSOPoint.EndIndex; i >= loopTo; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.pickupPumpMnemonic]);
                    
                    if (objWellSectionPUSOSetting != null)
                    {
                        lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetting.PUChannel]);
                    }

               

                    // '** Ignore the pump status now ...
                    if (lnHookload < objPUSOPoint.Max)
                    {
                        // 'DynamicValue = (objPUSOPoint.Max + lnHookload) / 2
                        DynamicValue = objPUSOPoint.Max; // 'It broke over from that point forward
                        break;
                    }


                   

                }

                if (DynamicValue > 0d)
                {
                    double sumValues = 0d;
                    int sampleCount = 0;
                    for (int c = startPoint; c >= objPUSOPoint.EndIndex; c -= 1)
                    {
                        double lnHookload = Convert.ToDouble( objData.Rows[c]["HKLD"]);
                        double pcChange = (lnHookload - objPUSOPoint.Max) / objPUSOPoint.Max * 100;

                   

                        sumValues = sumValues + lnHookload;
                        sampleCount = sampleCount + 1;
                    }

                    if (sumValues > 0d & sampleCount > 0)
                    {
                        DynamicAvg = Math.Round(sumValues / sampleCount, 2);
                    }
                }

                if (objWellSectionPUSOSetting !=null)
                {
                    if (objWellSectionPUSOSetting.PUDynMethod == Convert.ToInt32( BroomStickSetup.bmDynamicMethod.BreakOverAverage))
                    {
                        objPUSOPoint.DynamicValue = Math.Round(DynamicAvg, 2);
                    }

                    if (objWellSectionPUSOSetting.PUDynMethod == Convert.ToInt32(BroomStickSetup.bmDynamicMethod.BreakOver))
                    {
                        objPUSOPoint.DynamicValue = Math.Round(DynamicValue, 2);
                    }

                    if (objWellSectionPUSOSetting.PUDynMethod == Convert.ToInt32(BroomStickSetup.bmDynamicMethod.Average))
                    {
                        objPUSOPoint.DynamicValue = objPUSOPoint.Avg;
                    }
                }
                else
                {
                    if (objSetup.pickupDynamicMethod == BroomStickSetup.bmDynamicMethod.BreakOverAverage)
                    {
                        objPUSOPoint.DynamicValue = Math.Round(DynamicAvg, 2);
                    }

                    if (objSetup.pickupDynamicMethod == BroomStickSetup.bmDynamicMethod.BreakOver)
                    {
                        objPUSOPoint.DynamicValue = Math.Round(DynamicValue, 2);
                    }

                    if (objSetup.pickupDynamicMethod == BroomStickSetup.bmDynamicMethod.Average)
                    {
                        objPUSOPoint.DynamicValue = objPUSOPoint.Avg;
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }

        public static int getBreakInIndex(ref DataTable objData, ref PUSOPoint objSOPoint)
        {
            try
            {
                int BreakInIndex = objSOPoint.EndIndex;
                for (int i = objSOPoint.EndIndex, loopTo = objSOPoint.StartIndex - 1; i <= loopTo; i++)
                {
                    double lnHkld = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPrevHKld = Convert.ToDouble( objData.Rows[i + 1]["HKLD"]);
                    if (lnPrevHKld < lnHkld)
                    {
                        BreakInIndex = i;
                        break;
                    }
                }

                return BreakInIndex;
            }
            catch (Exception ex)
            {
                return objSOPoint.EndIndex;
            }
        }


        public static void calculateDynamicSOValues(ref DataTable objData, ref PUSOPoint objPUSOPoint, BroomStickSetup objSetup, WellSectionPUSOSettings objWellSectionPUSOSetup = default)
        {
            try
            {
                double DynamicValue = 0d;
                double DynamicAvg = 0d;

                // 'We'll have to find the first value that falls into all conditions ...
                double lnPreviousValue = 0d;
                int startIndex = -1;
                for (int i = objPUSOPoint.StartIndex; i >= objPUSOPoint.EndIndex; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue =Convert.ToDouble( objData.Rows[i][objSetup.slackOffPumpMnemonic]);

                    // 'Nishant
                    if (objWellSectionPUSOSetup!=null)
                    {
                        lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetup.SOChannel]);
                    }
                    // '*******

                  
                    // '** Ignore the pump status ...
                    lnPreviousValue = lnHookload;
                    startIndex = i;
                    break;

                 

                }

                if (startIndex >= 0)
                {
                    int minPointIndex = -1;
                    for (int i = objPUSOPoint.StartIndex; i >= objPUSOPoint.EndIndex; i -= 1)
                    {
                        int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                        double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                        double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.slackOffPumpMnemonic]);

                        // 'Nishant
                        if (objWellSectionPUSOSetup!= null)
                        {
                            lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetup.SOChannel]);
                        }
                        // '*******

                        

                        // '** Ignore the pump status ...
                        if (lnHookload > lnPreviousValue)
                        {
                            minPointIndex = i + 1;

                            // 'DynamicValue = (lnPreviousValue + lnHookload) / 2
                            DynamicValue = lnPreviousValue;
                            break;
                        }

                        lnPreviousValue = lnHookload;

                       

                    }

                    if (DynamicValue > 0d & minPointIndex != -1)
                    {
                        double sumValues = 0d;
                        int sampleCount = 0;
                        for (int c = minPointIndex; c >= objPUSOPoint.EndIndex; c -= 1)
                        {
                            double lnHookload = Convert.ToDouble( objData.Rows[c]["HKLD"]);
                            double pcChange = Math.Abs((lnHookload - objPUSOPoint.Max) / objPUSOPoint.Max * 100);

                         

                            sumValues = sumValues + lnHookload;
                            sampleCount = sampleCount + 1;
                        }

                        if (sumValues > 0d & sampleCount > 0)
                        {
                            DynamicAvg = Math.Round(sumValues / sampleCount, 2);
                        }
                    }
                }

                // 'Nishant
                if (objWellSectionPUSOSetup is object)
                {
                    if (objWellSectionPUSOSetup.SODynMethod == Convert.ToInt32( BroomStickSetup.bmDynamicMethod.BreakOverAverage))
                    {
                        objPUSOPoint.DynamicValue = Math.Round(DynamicAvg, 2);
                    }

                    if (objWellSectionPUSOSetup.SODynMethod == Convert.ToInt32(BroomStickSetup.bmDynamicMethod.BreakOver))
                    {
                        objPUSOPoint.DynamicValue = Math.Round(DynamicValue, 2);
                    }

                    if (objWellSectionPUSOSetup.SODynMethod == Convert.ToInt32(BroomStickSetup.bmDynamicMethod.Average))
                    {
                        objPUSOPoint.DynamicValue = objPUSOPoint.Avg;
                    }
                }
                else
                {
                    if (objSetup.slackOffDynamicMethod == BroomStickSetup.bmDynamicMethod.BreakOverAverage)
                    {
                        objPUSOPoint.DynamicValue = Math.Round(DynamicAvg, 2);
                    }

                    if (objSetup.slackOffDynamicMethod == BroomStickSetup.bmDynamicMethod.BreakOver)
                    {
                        objPUSOPoint.DynamicValue = Math.Round(DynamicValue, 2);
                    }

                    if (objSetup.slackOffDynamicMethod == BroomStickSetup.bmDynamicMethod.Average)
                    {
                        objPUSOPoint.DynamicValue = objPUSOPoint.Avg;
                    }
                }
            }
            // '*******





            catch (Exception ex)
            {
            }
        }

        public static void calculateStaticSOValues(ref DataTable objData, ref PUSOPoint objPUSOPoint, BroomStickSetup objSetup, WellSectionPUSOSettings objWellSectionPUSOSetup = default)
        {
            try
            {
                double MaxValue = 0d;
                double MinValue = 0d;
                int MaxIndex = 0;
                int lnBreakInIndex = getBreakInIndex(ref objData, ref objPUSOPoint);
                if (lnBreakInIndex == objPUSOPoint.StartIndex)
                {
                    lnBreakInIndex = objPUSOPoint.EndIndex;
                }

                // '(1) Find Max First ...
                for (int i = objPUSOPoint.StartIndex; i >= lnBreakInIndex + 1; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.slackOffPumpMnemonic]);
                    // 'Nishant
                    if (objWellSectionPUSOSetup !=null )
                    {
                        lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetup.SOChannel]);
                    }
                    // '*****************

                    

                    // '** Ignore the pump status ...
                    if (lnHookload > MaxValue)
                    {
                        MaxValue = lnHookload;
                        MaxIndex = i;
                    }

                  

                }

                MinValue = MaxValue;

                // '(2) Find Min now ...
                for (int i = objPUSOPoint.StartIndex, loopTo1 = lnBreakInIndex + 1; i >= loopTo1; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.slackOffPumpMnemonic]);

                    // 'Nishant
                    if (objWellSectionPUSOSetup !=null)
                    {
                        lnPumpValue =Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetup.SOChannel]);
                    }
                    // '*****************




                    // '** Ignore the pump status ...
                    if (lnHookload < MinValue)
                    {
                        MinValue = lnHookload;
                    }

                 

                }

                MaxValue = MinValue;


                // '(3) Find Max Again ...
                for (int i = objPUSOPoint.StartIndex; i >= lnBreakInIndex + 1; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.slackOffPumpMnemonic]);

                    // 'Nishant
                    if (objWellSectionPUSOSetup != null)
                    {
                        lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetup.SOChannel]);
                    }
                    // '*****************


                    

                    // '** Ignore the pump status ...
                    if (lnHookload > MaxValue)
                    {
                        MaxValue = lnHookload;
                        MaxIndex = i;
                    }

                  

                }

                int sampleCount = 0;
                double sumValue = 0d;
                double AvgValue = 0d;
                for (int i = objPUSOPoint.StartIndex; i >= lnBreakInIndex + 1; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.slackOffPumpMnemonic]);

                    // 'Nishant
                    if (objWellSectionPUSOSetup != null)
                    {
                        lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetup.SOChannel]);
                    }
                    // '*****************


                    // '** Ignore the pump status ...
                    sampleCount = sampleCount + 1;
                    sumValue = sumValue + lnHookload;


                  
                }

                if (sampleCount > 0 & sumValue > 0d)
                {
                    AvgValue = Math.Round(sumValue / sampleCount, 2);
                }

                objPUSOPoint.Max = MaxValue;
                objPUSOPoint.Min = MinValue;
                objPUSOPoint.Avg = AvgValue;
            }
            catch (Exception ex)
            {
            }
        }

        public static void calculateStaticSOValues2(ref DataTable objData, ref PUSOPoint objPUSOPoint, BroomStickSetup objSetup, WellSectionPUSOSettings objWellSectionPUSOSetup = default)
        {
            try
            {
                double MaxValue = 0d;
                double MinValue = 0d;
                int MaxIndex = 0;
                int lnBreakInIndex = objPUSOPoint.EndIndex;

                // '(1) Find Max First ...
                for (int i = objPUSOPoint.StartIndex; i >= lnBreakInIndex + 1; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue =  Convert.ToDouble( objData.Rows[i][objSetup.slackOffPumpMnemonic]);

                    // 'Nishant
                    if (objWellSectionPUSOSetup is object)
                    {
                        lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetup.SOChannel]);
                    }
                    // '*******


                   

                    // '** Ignore the pump status ...
                    if (lnHookload > MaxValue)
                    {
                        MaxValue = lnHookload;
                        MaxIndex = i;
                    }

          

                }

                MinValue = MaxValue;

                // '(2) Find Min now ...
                for (int i = objPUSOPoint.StartIndex; i >= lnBreakInIndex + 1; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.slackOffPumpMnemonic]);

                    // 'Nishant
                    if (objWellSectionPUSOSetup !=null)
                    {
                        lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetup.SOChannel]);
                    }
                    // '*******



                    
                    // '** Ignore the pump status ...
                    if (lnHookload < MinValue)
                    {
                        MinValue = lnHookload;
                    }

            

                }

                MaxValue = MinValue;


                // '(3) Find Max Again ...
                for (int i = objPUSOPoint.StartIndex; i >= lnBreakInIndex + 1; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.slackOffPumpMnemonic]);

                    // 'Nishant
                    if (objWellSectionPUSOSetup!=null)
                    {
                        lnPumpValue = Convert.ToDouble( objData.Rows[i][objWellSectionPUSOSetup.SOChannel]);
                    }
                    // '*******



                    

                    // '** Ignore the pump status ...
                    if (lnHookload > MaxValue)
                    {
                        MaxValue = lnHookload;
                        MaxIndex = i;
                    }


                }

                int sampleCount = 0;
                double sumValue = 0d;
                double AvgValue = 0d;
                for (int i = objPUSOPoint.StartIndex; i >= lnBreakInIndex + 1; i -= 1)
                {
                    int lnRigState = Convert.ToInt32( objData.Rows[i]["RIG_STATE"]);
                    double lnHookload = Convert.ToDouble( objData.Rows[i]["HKLD"]);
                    double lnPumpValue = Convert.ToDouble( objData.Rows[i][objSetup.slackOffPumpMnemonic]);


                    // 'Nishant
                    if (objWellSectionPUSOSetup !=null)
                    {
                        lnPumpValue = Convert.ToDouble(objData.Rows[i][objWellSectionPUSOSetup.SOChannel].ToString());
                    }
                    // '*******


                   
                    // '** Ignore the pump status ...
                    sampleCount = sampleCount + 1;
                    sumValue = sumValue + lnHookload;


                   

                }

                if (sampleCount > 0 & sumValue > 0d)
                {
                    AvgValue = Math.Round(sumValue / sampleCount, 2);
                }

                objPUSOPoint.Max = MaxValue;
                objPUSOPoint.Min = MinValue;
                objPUSOPoint.Avg2 = AvgValue;
            }
            catch (Exception ex)
            {
            }
        }

        public static bool isValidSlackOff(PUSOPoint objPUSOPoint, BroomStickSetup objSetup)
        {
            try
            {
                double BlockMovement = Math.Abs(objPUSOPoint.StartDepth - objPUSOPoint.EndDepth);
                if (BlockMovement >= objSetup.slackOffMinBlockMovement & BlockMovement <= objSetup.slackOffMaxBlockMovement)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static bool isValidPickUp(PUSOPoint objPUSOPoint, BroomStickSetup objSetup)
        {
            try
            {
                double BlockMovement = Math.Abs(objPUSOPoint.StartDepth - objPUSOPoint.EndDepth);
                if (BlockMovement >= objSetup.pickupMinBlockMovement & BlockMovement <= objSetup.pickupMaxBlockMovement)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public static void updatePumpStatusROB(ref PUSOPoint objPoint, BroomStickSetup objSetup)
        {
            try
            {
                if (objSetup.rotatePumpMnemonic == "SPPA")
                {
                    if (objPoint.PumpPressure > objSetup.rotateCutOffValue)
                    {
                        objPoint.PumpStatus = pusoPumpStatus.PumpOn;
                    }
                    else
                    {
                        objPoint.PumpStatus = pusoPumpStatus.PumpOff;
                    }
                }
                else if (objPoint.Circulation > objSetup.rotateCutOffValue)
                {
                    objPoint.PumpStatus = pusoPumpStatus.PumpOn;
                }
                else
                {
                    objPoint.PumpStatus = pusoPumpStatus.PumpOff;
                }
            }
            catch (Exception ex)
            {
            }
        }



        public static void updatePumpStatusPU(ref PUSOPoint objPoint, BroomStickSetup objSetup)
        {
            try
            {
                if (objSetup.pickupPumpMnemonic == "SPPA")
                {
                    if (objPoint.PumpPressure > objSetup.pickupCutOffValue)
                    {
                        objPoint.PumpStatus = pusoPumpStatus.PumpOn;
                    }
                    else
                    {
                        objPoint.PumpStatus = pusoPumpStatus.PumpOff;
                    }
                }
                else if (objPoint.Circulation > objSetup.pickupCutOffValue)
                {
                    objPoint.PumpStatus = pusoPumpStatus.PumpOn;
                }
                else
                {
                    objPoint.PumpStatus = pusoPumpStatus.PumpOff;
                }
            }
            catch (Exception ex)
            {
            }
        }


        public static void updatePumpStatusSO(ref PUSOPoint objPoint, BroomStickSetup objSetup)
        {
            try
            {
                if (objSetup.slackOffPumpMnemonic == "SPPA")
                {
                    if (objPoint.PumpPressure > objSetup.slackOffCutOffValue)
                    {
                        objPoint.PumpStatus = pusoPumpStatus.PumpOn;
                    }
                    else
                    {
                        objPoint.PumpStatus = pusoPumpStatus.PumpOff;
                    }
                }
                else if (objPoint.Circulation > objSetup.slackOffCutOffValue)
                {
                    objPoint.PumpStatus = pusoPumpStatus.PumpOn;
                }
                else
                {
                    objPoint.PumpStatus = pusoPumpStatus.PumpOff;
                }
            }
            catch (Exception ex)
            {
            }
        }



    }//Class
}
