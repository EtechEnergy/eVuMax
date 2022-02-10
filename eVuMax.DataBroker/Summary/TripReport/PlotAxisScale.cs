using System;
using System.Data;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Security;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualBasic;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;


namespace eVuMax.DataBroker.Summary.TripReport
{
    

    public class PlotAxisScale
    {
        public string PlotID = "";
        public string AxisID = "";
        public string AxisName = "";
        public bool AutoScale = true;
        public double MinValue = 0;
        public double MaxValue = 0;
        public bool Inverted = false;

        [NonSerialized]
        public static string WellID = "";
        [NonSerialized]
        public static DataService objDataService;

        public static bool saveAxisScaleList(Dictionary<int, PlotAxisScale> objList, ref string lastError)
        {
            try
            {

                string strSQL = "";
                //// '//Remove the existing entry first ...
                //strSQL = "DELETE FROM VMX_AXIS_SCALES WHERE WELL_ID='" + WellID + "' AND PLOT_ID='" + objItem.PlotID + "' AND AXIS_ID='" + objItem.AxisID + "'";
                //objDataService.executeNonQuery(strSQL);


                foreach (PlotAxisScale objItem in objList.Values)
                {


                }
                


                

                //// '//Insert it again ...
                //strSQL = "INSERT INTO VMX_AXIS_SCALES (WELL_ID,PLOT_ID,AXIS_ID,AUTO_SCALE,MIN_VALUE,MAX_VALUE,INVERTED) VALUES(";
                //strSQL += "'" + WellID + "',";
                //strSQL += "'" + objItem.PlotID + "',";
                //strSQL += "'" + objItem.AxisID + "',";
                //strSQL += "" + Interaction.IIf(objItem.AutoScale == true, 1, 0).ToString() + ",";
                //strSQL += "" + objItem.MinValue.ToString() + ",";
                //strSQL += "" + objItem.MaxValue.ToString() + ",";
                //strSQL += "" + Interaction.IIf(objItem.Inverted == true, 1, 0).ToString() + ")";

                //if (objDataService.executeNonQuery(strSQL))
                //    return true;
                //else
                //{
                //    lastError = objDataService.LastError;
                //    return false;
                //}

                return true;
            }

            catch (Exception ex)
            {
                lastError = ex.Message + ex.StackTrace;
                return false;
            }
        }



        public static bool saveAxisScale(PlotAxisScale objItem, ref string lastError)
        {
            try
            {

                string strSQL = "";


                // '//Remove the existing entry first ...
                strSQL = "DELETE FROM VMX_AXIS_SCALES WHERE WELL_ID='" + WellID + "' AND PLOT_ID='" + objItem.PlotID + "' AND AXIS_ID='" + objItem.AxisID + "'";
                objDataService.executeNonQuery(strSQL);


                // '//Insert it again ...
                strSQL = "INSERT INTO VMX_AXIS_SCALES (WELL_ID,PLOT_ID,AXIS_ID,AUTO_SCALE,MIN_VALUE,MAX_VALUE,INVERTED) VALUES(";
                strSQL += "'" + WellID + "',";
                strSQL += "'" + objItem.PlotID + "',";
                strSQL += "'" + objItem.AxisID + "',";
                strSQL += "" + Interaction.IIf(objItem.AutoScale == true, 1, 0).ToString() + ",";
                strSQL += "" + objItem.MinValue.ToString() + ",";
                strSQL += "" + objItem.MaxValue.ToString() + ",";
                strSQL += "" + Interaction.IIf(objItem.Inverted == true, 1, 0).ToString() + ")";

                if (objDataService.executeNonQuery(strSQL))
                    return true;
                else
                {
                    lastError = objDataService.LastError;
                    return false;
                }


            }

            catch (Exception ex)
            {
                lastError = ex.Message + ex.StackTrace;
                return false;
            }
        }
        public static PlotAxisScale getAxisScales(string paramPlotID, string paramAxisID, bool paramInverted = false)
        {
            try
            {
                string strSQL = "";
                string lastError = "";

                // '//First check if axis customization exist ... If not then create one
                if (!objDataService.IsRecordExist("SELECT AXIS_ID FROM VMX_AXIS_SCALES WHERE WELL_ID='" + WellID + "' AND PLOT_ID='" + paramPlotID + "' AND AXIS_ID='" + paramAxisID + "'"))
                {

                    // '//Create a default entry
                    PlotAxisScale objDefaultAxis = new PlotAxisScale();
                    objDefaultAxis.PlotID = paramPlotID;
                    objDefaultAxis.AxisID = paramAxisID;
                    objDefaultAxis.AutoScale = true;
                    objDefaultAxis.MinValue = 0;
                    objDefaultAxis.MaxValue = 0;
                    objDefaultAxis.Inverted = paramInverted;

                    PlotAxisScale.saveAxisScale(objDefaultAxis, ref lastError);
                }


                PlotAxisScale objAxisScale = new PlotAxisScale();

                DataTable objData = objDataService.getTable("SELECT * FROM VMX_AXIS_SCALES WHERE WELL_ID='" + WellID + "' AND PLOT_ID='" + paramPlotID + "' AND AXIS_ID='" + paramAxisID + "'");

                if (objData.Rows.Count > 0)
                {
                    DataRow objRow = objData.Rows[0];

                    objAxisScale.PlotID = paramPlotID;
                    objAxisScale.AxisID = paramAxisID;
                    objAxisScale.AutoScale = Convert.ToBoolean(Global.Iif(Convert.ToInt32(objRow["AUTO_SCALE"]) == 1, true, false));
                    objAxisScale.MinValue =Convert.ToDouble(DataService.checkNull(objRow["MIN_VALUE"], 0));
                    objAxisScale.MaxValue = Convert.ToDouble(DataService.checkNull(objRow["MAX_VALUE"], 0));
                    objAxisScale.Inverted = Convert.ToBoolean(Global.Iif(Convert.ToInt32(objRow["INVERTED"]) == 1, true, false));

                    return objAxisScale;
                }
                else
                    return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }

}
