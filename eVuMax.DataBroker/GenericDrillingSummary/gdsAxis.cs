using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.GenericDrillingSummary
{
    public class gdsAxis
    {
        public string AxisID = "";
        public string AxisName = "";
        public string AxisTitle = "";
        public string ColumnID = "";
        public double WidthPercentage = 100;
        public int AxisPosition = 0; // 0-left, 1-bottom, 2-right, 3-top
        public bool Inverted = false;
        public int DisplayOrder = 0;
        public bool Automatic = true;
        public double MinValue = 0;
        public double MaxValue = 0;
        public int Orientation = 0; // 0-Horizontal, 1-Vertical
        public double StartPosition = 0;
        public double EndPosition = 100;
        public int RelativePosition = 0;
        public bool ShowGrid = false;

        public string FontName = "Arial";
        public int FontSize = 9;
        public Color FontColor = Color.Black;
        public bool FontBold = false;
        public bool FontItalic = false;


        public gdsAxis getCopy()
        {
            try
            {
                gdsAxis objNew = new gdsAxis();
                objNew.AxisID = this.AxisID;
                objNew.AxisName = this.AxisName;
                objNew.AxisTitle = this.AxisTitle;
                objNew.ColumnID = this.ColumnID;
                objNew.WidthPercentage = this.WidthPercentage;
                objNew.AxisPosition = this.AxisPosition;
                objNew.Inverted = this.Inverted;
                objNew.DisplayOrder = this.DisplayOrder;
                objNew.Automatic = this.Automatic;
                objNew.MinValue = this.MinValue;
                objNew.MaxValue = this.MaxValue;
                objNew.Orientation = this.Orientation;
                objNew.StartPosition = this.StartPosition;
                objNew.EndPosition = this.EndPosition;
                objNew.RelativePosition = this.RelativePosition;
                objNew.ShowGrid = this.ShowGrid;
                objNew.FontName = this.FontName;
                objNew.FontSize = this.FontSize;
                objNew.FontColor = this.FontColor;
                objNew.FontBold = this.FontBold;
                objNew.FontItalic = this.FontItalic;

                return objNew;
            }
            catch (Exception ex)
            {
                return new gdsAxis();
            }
        }


    }


}
