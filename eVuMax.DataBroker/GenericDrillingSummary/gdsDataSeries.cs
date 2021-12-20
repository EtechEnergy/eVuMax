using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.GenericDrillingSummary
{
    public class gdsDataSeries:IComparable
    {
        public enum gdsType
        {
            Normal = 0,
            GroupSummary = 1
        }

        public string SeriesID = "";
        public string SeriesName = "";
        public int DataSource = 0; // 0- Time Log, 1 - Trajectory
        public string XColumnID = "";
        public string XColumnName = "";
        public string YColumnID = "";
        public string YColumnName = "";
        public string DataFilter = "";

        public int SeriesType = 0; // 0 - Line, 1-Points, 2-Area, 3-Histogram, 4-Pie, 5-Bar

        public int LineStyle = 0;
        public double LineWidth = 0;
        //public Color LineColor = Color.Black;
        public String LineColor = "Black";
        public bool StepLine = false;
        public bool ShowPoints = false;

        public int PointerStyle = 0;
        public int PointHeight = 3;
        public int PointWidth = 3;
        public string PointColor = ColorTranslator.ToHtml(Color.Black);

        public bool ColorPointsAsColumn = false;

        public bool Visible = true;

        public bool IgnoreNegative = false;

        public int groupFunction = 0;

        public gdsType Type = gdsType.Normal;

        public int grpExpressionType = 0; // '0-Built In, 1-User Specified
        public string grpExpression = "";
        public int grpFunctionType = 0; // '0-Sum, 1-Max, 2-Min, 3-Avg
        public int grpGroupBy = 0; // '0-Rig States, 1-DateTime,2-Days,3-Week,4-Month,5-Depth,6-Others
        public string grpGroupByExpression = "";
        public string grpFilter = "";
        public string grpColor = ColorTranslator.ToHtml(Color.Transparent);

        public string Color1 = ColorTranslator.ToHtml(Color.Transparent);
        public string Color2 = ColorTranslator.ToHtml(Color.Transparent);
        public string Color3 = ColorTranslator.ToHtml(Color.Transparent);
        public string Color4 = ColorTranslator.ToHtml(Color.Transparent);
        public string Color5 = ColorTranslator.ToHtml(Color.Transparent);

        public int MainGroupOn = 0; // '0 - Built in group types, 1 - User Defined groups
        public int SplitType = 0; // '0 - Variable Range, 1 - Fixed Ranges
        public Dictionary<int, splitRange> FixedRangeList = new Dictionary<int, splitRange>();
        public double variableRangeFrom = 0;
        public double variableRangeTo = 0;
        public double variableRangeIncrement = 0;
        public string splitMnemonic = "";
        public bool ShowMarks = true;

        public bool StackedBars = false;

        public bool ShowRoadMap = false;
        public string RoadMapColor = "Black";
        public int RoadMapTransparency = 60;

        public string RMColor = "Yellow";

        public int DisplayOrder = 0;

        #region "Runtime Members"
        
        public bool RefreshRequired = false;
        
        public double[] xDataBuffer;
        
        public double[] yDataBuffer;
        
        public String[] colorBuffer;
        
        public string[] labelBuffer;
       
        public string ObjectID = ""; // 'Runtime object identifier
       
        public bool hasColorData = false;
       
        public string __WellID = "";
       
        public bool isOffset = false;
       
        public double[] roadmapDepth;
       
        public double[] roadmapMin;
       
        public double[] roadmapMax;
        #endregion
        public gdsDataSeries getCopy()
        {
            try
            {
                gdsDataSeries objNew = new gdsDataSeries();
                objNew.SeriesID = this.SeriesID;
                objNew.SeriesName = this.SeriesName;
                objNew.DataSource = this.DataSource;
                objNew.XColumnID = this.XColumnID;
                objNew.XColumnName = this.XColumnName;
                objNew.YColumnID = this.YColumnID;
                objNew.YColumnName = this.YColumnName;
                objNew.DataFilter = this.DataFilter;
                objNew.SeriesType = this.SeriesType;
                objNew.LineStyle = this.LineStyle;
                objNew.LineWidth = this.LineWidth;
                objNew.LineColor = this.LineColor;
                objNew.StepLine = this.StepLine;
                objNew.ShowPoints = this.ShowPoints;
                objNew.PointerStyle = this.PointerStyle;
                objNew.PointHeight = this.PointHeight;
                objNew.PointWidth = this.PointWidth;
                objNew.PointColor = this.PointColor;
                objNew.ColorPointsAsColumn = this.ColorPointsAsColumn;
                objNew.Visible = this.Visible;
                objNew.IgnoreNegative = this.IgnoreNegative;
                objNew.ObjectID = this.ObjectID;
                objNew.hasColorData = this.hasColorData;
                objNew.groupFunction = this.groupFunction;

                objNew.Type = this.Type;

                objNew.grpExpressionType = this.grpExpressionType;
                objNew.grpExpression = this.grpExpression;
                objNew.grpFunctionType = this.grpFunctionType;
                objNew.grpGroupBy = this.grpGroupBy;
                objNew.grpGroupByExpression = this.grpGroupByExpression;
                objNew.grpFilter = this.grpFilter;
                objNew.grpColor = this.grpColor;

                objNew.__WellID = this.__WellID;

                objNew.Color1 = this.Color1;
                objNew.Color2 = this.Color2;
                objNew.Color3 = this.Color3;
                objNew.Color4 = this.Color4;
                objNew.Color5 = this.Color5;

                objNew.isOffset = this.isOffset;


                objNew.MainGroupOn = this.MainGroupOn;
                objNew.SplitType = this.SplitType;

                objNew.StackedBars = this.StackedBars;

                objNew.ShowRoadMap = this.ShowRoadMap;
                objNew.RoadMapColor = this.RoadMapColor;

                foreach (int lnKey in this.FixedRangeList.Keys)
                    objNew.FixedRangeList.Add(lnKey, this.FixedRangeList[lnKey].getCopy());

                objNew.variableRangeFrom = this.variableRangeFrom;
                objNew.variableRangeTo = this.variableRangeTo;
                objNew.variableRangeIncrement = this.variableRangeIncrement;
                objNew.splitMnemonic = this.splitMnemonic;
                objNew.ShowMarks = this.ShowMarks;
                objNew.RoadMapTransparency = this.RoadMapTransparency;
                objNew.DisplayOrder = this.DisplayOrder;

                return objNew;
            }
            catch (Exception ex)
            {
                return new gdsDataSeries();
            }
        }




        public int CompareTo(object obj)
        {
            try
            {
                gdsDataSeries objDataSeries = (gdsDataSeries)obj;
                

                if (this.DisplayOrder < objDataSeries.DisplayOrder)
                    return -1;

                if (this.DisplayOrder == objDataSeries.DisplayOrder)
                    return 0;

                if (this.DisplayOrder > objDataSeries.DisplayOrder)
                {
                    return 1;
                }

                return -2;

            }
            catch (Exception ex)
            {
                //Error
                return -2;
            }
        }
    }
}
//}
