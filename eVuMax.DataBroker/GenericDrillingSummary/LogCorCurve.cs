using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;

using VuMaxDR.Data;


namespace eVuMax.DataBroker.GenericDrillingSummary
{

    public class LogCorCurve : IComparable
    {
        public string EntryID = "";
        public string Mnemonic = "";
        public string Name = "";
        public Color LineColor;
        public int LineStyle;
        public int LineWidth = 1;
        public bool InverseScale = false;
        public bool AutoScale = true;
        public double MinValue;
        public double MaxValue;
        public bool Visible = true;
        public bool IgnoreNegative = true;
        public Color Color1;
        public Color Color2;
        public Color Color3;
        public Color Color4;
        public Color Color5;
        public int DisplayOrder = 0;


        public Dictionary<string, LogCorData> logData = new Dictionary<string, LogCorData>();


        public Color getSeriesColor(int wellCounter)
        {
            try
            {
                if (wellCounter == 0)
                    return LineColor;
                else
                    switch (wellCounter)
                    {
                        case 1:
                            {
                                return Color1;
                            }

                        case 2:
                            {
                                return Color2;
                            }

                        case 3:
                            {
                                return Color3;
                            }

                        case 4:
                            {
                                return Color4;
                            }

                        case 5:
                            {
                                return Color5;
                            }

                        default:
                            {
                                return LineColor;
                            }
                    }

                return LineColor;
            }
            catch (Exception ex)
            {
                return LineColor;
            }
        }

        public LogCorCurve getCopy()
        {
            try
            {
                LogCorCurve objNew = new LogCorCurve();
                objNew.EntryID = this.EntryID;
                objNew.Mnemonic = this.Mnemonic;
                objNew.Name = this.Name;
                objNew.LineColor = this.LineColor;
                objNew.LineStyle = this.LineStyle;
                objNew.LineWidth = this.LineWidth;
                objNew.InverseScale = this.InverseScale;
                objNew.AutoScale = this.AutoScale;
                objNew.MinValue = this.MinValue;
                objNew.MaxValue = this.MaxValue;
                objNew.Visible = this.Visible;
                objNew.IgnoreNegative = this.IgnoreNegative;
                objNew.Color1 = this.Color1;
                objNew.Color2 = this.Color2;
                objNew.Color3 = this.Color3;
                objNew.Color4 = this.Color4;
                objNew.Color5 = this.Color5;
                objNew.DisplayOrder = this.DisplayOrder;

                return objNew;
            }
            catch (Exception ex)
            {
                return new LogCorCurve();
            }
        }

        public int CompareTo(object obj)
        {
            try
            {
                LogCorCurve objCurve = (LogCorCurve)obj;

                if (this.DisplayOrder < objCurve.DisplayOrder)
                    return -1;

                if (this.DisplayOrder == objCurve.DisplayOrder)
                    return 0;

                if (this.DisplayOrder > objCurve.DisplayOrder)
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


        //public int CompareTo(object obj)
        //{
        //    try
        //    {
        //        LogCorCurve objCurve = (LogCorCurve)obj;

            //        if (this.DisplayOrder < objCurve.DisplayOrder)
            //            return -1;

            //        if (this.DisplayOrder == objCurve.DisplayOrder)
            //            return 0;

            //        if (this.DisplayOrder > objCurve.DisplayOrder)
            //            return 1;
            //    }
            //    catch (Exception ex)
            //    {
            //    }
            //}

            //public static bool removeTemplate(string paramTemplateID)
            //{
            //    try
            //    {
            //        string strSQL = "";

            //        strSQL = "DELETE FROM VMX_LOG_COR_TEMPLATE_DETAIL WHERE TEMPLATE_ID='" + paramTemplateID + "'";
            //        objDataService.executeNonQuery(strSQL);

            //        strSQL = "DELETE FROM VMX_LOG_COR_TEMPLATE WHERE TEMPLATE_ID='" + paramTemplateID + "'";
            //        objDataService.executeNonQuery(strSQL);

            //        return true;
            //    }
            //    catch (Exception ex)
            //    {
            //        return false;
            //    }
            //}

            //public static bool loadTemplate(string paramTemplateID, ref Dictionary<string, LogCorCurve> listCurve, ref LogCorCurve paramOffsetCurve)
            //{
            //    try
            //    {
            //        listCurve = new Dictionary<string, LogCorCurve>();

            //        DataTable objData = objDataService.getTable("SELECT * FROM VMX_LOG_COR_TEMPLATE_DETAIL WHERE TEMPLATE_ID='" + paramTemplateID + "' AND ENTRY_ID<>'##OFFSET##'");

            //        foreach (DataRow objRow in objData.Rows)
            //        {
            //            LogCorCurve objItem = new LogCorCurve();
            //            objItem.EntryID = objIDFactory.getObjectID;
            //            objItem.Mnemonic = DataService.checkNull(objRow("MNEMONIC"), "");
            //            objItem.Name = DataService.checkNull(objRow("NAME"), "");
            //            objItem.LineColor = Color.FromArgb(DataService.checkNull(objRow("LINE_COLOR"), 0));
            //            objItem.LineStyle = DataService.checkNull(objRow("LINE_STYLE"), 0);
            //            objItem.LineWidth = DataService.checkNull(objRow("LINE_WIDTH"), 1);
            //            objItem.InverseScale = IIf(DataService.checkNull(objRow("INVERSE_SCALE"), 0) == 1, true, false);
            //            objItem.AutoScale = IIf(DataService.checkNull(objRow("AUTO_SCALE"), 0) == 1, true, false);
            //            objItem.MinValue = DataService.checkNull(objRow("MIN_VALUE"), 0);
            //            objItem.MaxValue = DataService.checkNull(objRow("MAX_VALUE"), 0);
            //            objItem.Visible = IIf(DataService.checkNull(objRow("VISIBLE"), 0) == 1, true, false);
            //            objItem.IgnoreNegative = IIf(DataService.checkNull(objRow("IGNORE_NEGATIVE"), 0) == 1, true, false);
            //            objItem.Color1 = Color.FromArgb(DataService.checkNull(objRow("COLOR1"), 0));
            //            objItem.Color2 = Color.FromArgb(DataService.checkNull(objRow("COLOR2"), 0));
            //            objItem.Color3 = Color.FromArgb(DataService.checkNull(objRow("COLOR3"), 0));
            //            objItem.Color4 = Color.FromArgb(DataService.checkNull(objRow("COLOR4"), 0));
            //            objItem.Color5 = Color.FromArgb(DataService.checkNull(objRow("COLOR5"), 0));
            //            objItem.DisplayOrder = DataService.checkNull(objRow("DISPLAY_ORDER"), 0);

            //            if (!listCurve.ContainsKey(objItem.Mnemonic))
            //                listCurve.Add(objItem.Mnemonic, objItem.getCopy());
            //        }

            //        paramOffsetCurve = new LogCorCurve();

            //        objData = objDataService.getTable("SELECT * FROM VMX_LOG_COR_TEMPLATE_DETAIL WHERE TEMPLATE_ID='" + paramTemplateID + "' AND ENTRY_ID='##OFFSET##'");

            //        if (objData.Rows.Count > 0)
            //        {
            //            DataRow objRow = objData.Rows(0);

            //            paramOffsetCurve.EntryID = objIDFactory.getObjectID;
            //            paramOffsetCurve.Mnemonic = DataService.checkNull(objRow("MNEMONIC"), "");
            //            paramOffsetCurve.Name = DataService.checkNull(objRow("NAME"), "");
            //            paramOffsetCurve.LineColor = Color.FromArgb(DataService.checkNull(objRow("LINE_COLOR"), 0));
            //            paramOffsetCurve.LineStyle = DataService.checkNull(objRow("LINE_STYLE"), 0);
            //            paramOffsetCurve.LineWidth = DataService.checkNull(objRow("LINE_WIDTH"), 1);
            //            paramOffsetCurve.InverseScale = IIf(DataService.checkNull(objRow("INVERSE_SCALE"), 0) == 1, true, false);
            //            paramOffsetCurve.AutoScale = IIf(DataService.checkNull(objRow("AUTO_SCALE"), 0) == 1, true, false);
            //            paramOffsetCurve.MinValue = DataService.checkNull(objRow("MIN_VALUE"), 0);
            //            paramOffsetCurve.MaxValue = DataService.checkNull(objRow("MAX_VALUE"), 0);
            //            paramOffsetCurve.Visible = IIf(DataService.checkNull(objRow("VISIBLE"), 0) == 1, true, false);
            //            paramOffsetCurve.IgnoreNegative = IIf(DataService.checkNull(objRow("IGNORE_NEGATIVE"), 0) == 1, true, false);
            //            paramOffsetCurve.Color1 = Color.FromArgb(DataService.checkNull(objRow("COLOR1"), 0));
            //            paramOffsetCurve.Color2 = Color.FromArgb(DataService.checkNull(objRow("COLOR2"), 0));
            //            paramOffsetCurve.Color3 = Color.FromArgb(DataService.checkNull(objRow("COLOR3"), 0));
            //            paramOffsetCurve.Color4 = Color.FromArgb(DataService.checkNull(objRow("COLOR4"), 0));
            //            paramOffsetCurve.Color5 = Color.FromArgb(DataService.checkNull(objRow("COLOR5"), 0));
            //            paramOffsetCurve.DisplayOrder = DataService.checkNull(objRow("DISPLAY_ORDER"), 0);
            //        }

            //        return true;
            //    }
            //    catch (Exception ex)
            //    {
            //        return false;
            //    }
            //}


            //public static bool saveTemplate(string paramTemplateName, Dictionary<string, LogCorCurve> listCurves, LogCorCurve paramOffsetCurve)
            //{
            //    try
            //    {
            //        string strSQL = "";

            //        string templateID = objIDFactory.getObjectID;

            //        strSQL = "INSERT INTO VMX_LOG_COR_TEMPLATE (TEMPLATE_ID,TEMPLATE_NAME,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
            //        strSQL += "'" + templateID + "',";
            //        strSQL += "'" + paramTemplateName.Replace("'", "''") + "',";
            //        strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
            //        strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
            //        strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
            //        strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";

            //        if (objDataService.executeNonQuery(strSQL))
            //        {
            //            string entryID = "";

            //            foreach (LogCorCurve objItem in listCurves.Values)
            //            {
            //                entryID = objIDFactory.getObjectID;

            //                strSQL = "INSERT INTO VMX_LOG_COR_TEMPLATE_DETAIL (TEMPLATE_ID,ENTRY_ID,MNEMONIC,NAME,LINE_COLOR,LINE_STYLE,LINE_WIDTH,INVERSE_SCALE,AUTO_SCALE,MIN_VALUE,MAX_VALUE,VISIBLE,IGNORE_NEGATIVE,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE,COLOR1,COLOR2,COLOR3,COLOR4,COLOR5,DISPLAY_ORDER) VALUES(";
            //                strSQL += "'" + templateID + "',";
            //                strSQL += "'" + entryID + "',";
            //                strSQL += "'" + objItem.Mnemonic.Replace("'", "''") + "',";
            //                strSQL += "'" + objItem.Name.Replace("'", "''") + "',";
            //                strSQL += "" + objItem.LineColor.ToArgb.ToString + ",";
            //                strSQL += "" + objItem.LineStyle.ToString() + ",";
            //                strSQL += "" + objItem.LineWidth.ToString() + ",";
            //                strSQL += "" + Interaction.IIf(objItem.InverseScale == true, 1, 0).ToString() + ",";
            //                strSQL += "" + Interaction.IIf(objItem.AutoScale == true, 1, 0).ToString() + ",";
            //                strSQL += "" + objItem.MinValue.ToString() + ",";
            //                strSQL += "" + objItem.MaxValue.ToString() + ",";
            //                strSQL += "" + Interaction.IIf(objItem.Visible == true, 1, 0).ToString() + ",";
            //                strSQL += "" + Interaction.IIf(objItem.IgnoreNegative == true, 1, 0).ToString() + ",";
            //                strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
            //                strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
            //                strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
            //                strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
            //                strSQL += "" + objItem.Color1.ToArgb.ToString + ",";
            //                strSQL += "" + objItem.Color2.ToArgb.ToString + ",";
            //                strSQL += "" + objItem.Color3.ToArgb.ToString + ",";
            //                strSQL += "" + objItem.Color4.ToArgb.ToString + ",";
            //                strSQL += "" + objItem.Color5.ToArgb.ToString + ",";
            //                strSQL += "" + objItem.DisplayOrder.ToString() + ")";

            //                objDataService.executeNonQuery(strSQL);
            //            }


            //            entryID = "##OFFSET##";

            //            strSQL = "INSERT INTO VMX_LOG_COR_TEMPLATE_DETAIL (TEMPLATE_ID,ENTRY_ID,MNEMONIC,NAME,LINE_COLOR,LINE_STYLE,LINE_WIDTH,INVERSE_SCALE,AUTO_SCALE,MIN_VALUE,MAX_VALUE,VISIBLE,IGNORE_NEGATIVE,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE,COLOR1,COLOR2,COLOR3,COLOR4,COLOR5,DISPLAY_ORDER) VALUES(";
            //            strSQL += "'" + templateID + "',";
            //            strSQL += "'" + entryID + "',";
            //            strSQL += "'" + paramOffsetCurve.Mnemonic.Replace("'", "''") + "',";
            //            strSQL += "'" + paramOffsetCurve.Name.Replace("'", "''") + "',";
            //            strSQL += "" + paramOffsetCurve.LineColor.ToArgb.ToString + ",";
            //            strSQL += "" + paramOffsetCurve.LineStyle.ToString() + ",";
            //            strSQL += "" + paramOffsetCurve.LineWidth.ToString() + ",";
            //            strSQL += "" + Interaction.IIf(paramOffsetCurve.InverseScale == true, 1, 0).ToString() + ",";
            //            strSQL += "" + Interaction.IIf(paramOffsetCurve.AutoScale == true, 1, 0).ToString() + ",";
            //            strSQL += "" + paramOffsetCurve.MinValue.ToString() + ",";
            //            strSQL += "" + paramOffsetCurve.MaxValue.ToString() + ",";
            //            strSQL += "" + Interaction.IIf(paramOffsetCurve.Visible == true, 1, 0).ToString() + ",";
            //            strSQL += "" + Interaction.IIf(paramOffsetCurve.IgnoreNegative == true, 1, 0).ToString() + ",";
            //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
            //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
            //            strSQL += "'" + objDataService.UserName.Replace("'", "''") + "',";
            //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
            //            strSQL += "" + paramOffsetCurve.Color1.ToArgb.ToString + ",";
            //            strSQL += "" + paramOffsetCurve.Color2.ToArgb.ToString + ",";
            //            strSQL += "" + paramOffsetCurve.Color3.ToArgb.ToString + ",";
            //            strSQL += "" + paramOffsetCurve.Color4.ToArgb.ToString + ",";
            //            strSQL += "" + paramOffsetCurve.Color5.ToArgb.ToString + ",";
            //            strSQL += "" + paramOffsetCurve.DisplayOrder.ToString() + ")";

            //            objDataService.executeNonQuery(strSQL);


            //            return true;
            //        }
            //        else
            //            return false;
            //    }
            //    catch (Exception ex)
            //    {
            //        return false;
            //    }
            //}



        }

}
