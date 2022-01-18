using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Common;   //prath 01-10-2020

namespace eVuMax.DataBroker.Common
{
    public class Util
    {
        /// <summary>
        /// Checks the string for single quote and doubles it up to indicate escape sequence
        /// </summary>
        /// <param name="pValue">String</param>
        /// <returns></returns>
        public static string checkQuote(string pValue)
        {
            try
            {
                return pValue.Replace("'", "''");
            }
            catch (Exception ex)
            {
                return pValue;
            }
        }

        /// <summary>
        /// Converts input string to DateTime Type, only if inputted string is valid date
        /// </summary>
        /// <param name="pDate"></param>
        /// <returns></returns>
        public static DateTime convertDate(string pDate)
        {
            try
            {
                DateTime outDate;

                if (DateTime.TryParse(pDate, out outDate))
                {
                    return outDate;
                }
                else
                {
                    return (new DateTime());
                }
            }
            catch (Exception ex)
            {
                return (new DateTime());
            }
        }

        /// <summary>
        /// Converts date to string in dd-MMM-yyyy
        /// </summary>
        /// <param name="paramDate"></param>
        /// <returns></returns>
        public static string convertDateToString(object paramDate)
        {
            try
            {
                if (Util.isValidDate(Util.checkDBNull(paramDate, "").ToString()))
                {
                    return DateTime.Parse(Util.checkDBNull(paramDate, "").ToString()).ToString("dd-MMM-yyyy");
                }
                else
                {
                    return "";
                }
            }
            catch (Exception ex)
            {
                return "";
            }
        }

        public static string convertDateToTimeString(object paramDate)
        {
            try
            {
                if (Util.isValidDate(Util.checkDBNull(paramDate, "").ToString()))
                {
                    return DateTime.Parse(Util.checkDBNull(paramDate, "").ToString()).ToString("hh:mm:ss tt");
                }
                else
                {
                    return "";
                }
            }
            catch (Exception ex)
            {
                return "";
            }
        }

        /// <summary>
        /// Converts date to string with dd-MMM-yyyy HH:mm:ss
        /// </summary>
        /// <param name="paramDate"></param>
        /// <returns></returns>
        public static string convertDateToString2(object paramDate)
        {
            try
            {
                if (Util.isValidDate(Util.checkDBNull(paramDate, "").ToString()))
                {
                    return DateTime.Parse(Util.checkDBNull(paramDate, "").ToString()).ToString("dd-MMM-yyyy HH:mm:ss");
                }
                else
                {
                    return "";
                }
            }
            catch (Exception ex)
            {
                return "";
            }
        }

        /// <summary>
        /// Checks if the string passed is a valid date and return true/false
        /// </summary>
        /// <param name="pDate"></param>
        /// <returns></returns>
        public static Boolean isValidDate(string pDate)
        {
            try
            {
                DateTime outDate;

                if (DateTime.TryParse(pDate, out outDate))
                {
                    if (outDate != (new DateTime()))
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
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

        /// <summary>
        /// Checks the string for single quote and doubles it up to indicate escape sequence
        /// </summary>
        /// <param name="pValue">String</param>
        /// <returns></returns>
        public static string checkQuote(string pValue, int maxLength)
        {
            try
            {
                if (pValue.Length > maxLength)
                {
                    return pValue.Substring(0, maxLength).Replace("'", "''");
                }
                else
                {
                    return pValue.Replace("'", "''");
                }
            }
            catch (Exception ex)
            {
                return pValue;
            }
        }

        /// <summary>
        /// Checks the value for DBNull and returns the default value if the value is null
        /// </summary>
        /// <param name="pValue">Value</param>
        /// <param name="defaultValue">Default Value</param>
        /// <returns></returns>
        public static object checkDBNull(object pValue, object defaultValue)
        {
            try
            {
                if (pValue == System.DBNull.Value)
                {
                    return defaultValue;
                }
                else
                {
                    return pValue;
                }
            }
            catch (Exception ex)
            {
                return pValue;
            }
        }


        public static string convertDateLongOledbParameter(string strDate)
        {
            try
            {
                if (strDate == "")
                    return "NULL";

                if (!isValidDate(strDate))
                    return "NULL";

                CultureInfo objCultureInfo = CultureInfo.CreateSpecificCulture("en-GB");

                return "" + DateTime.Parse(strDate, objCultureInfo).ToString("dd-MMM-yyyy HH:mm:ss") + "";
            }
            catch (Exception ex)
            {
                return "NULL";
            }
        }


        //prath 01-10-2020
        public static double ValEx(object strNumber)
        {
            try
            {
                if (strNumber == null)
                {
                    return 0;
                }

                if (strNumber.ToString().Contains(","))
                    return Convert.ToDouble(strNumber.ToString().Replace(",", "."));
                else
                    return Convert.ToDouble(strNumber);
            }
            catch (Exception ex)
            {
                return 0;
            }
        }

        //prath 01-10-2020
        public static DateTime convertUTCToWellTimeZone(DateTime paramDate, VuMaxDR.Data.Objects.Well objWell)
        {
            try
            {
                DateTime dtDate = paramDate.ToLocalTime(); // 'The date will already be in local time zone ...

                string localOffset = TimeOffsetInfo.getLocalTimeZoneUTCOffset(dtDate);
                string newOffset = objWell.timeZone;

                int Difference = TimeOffsetInfo.getTimeZoneDifferenceMinutes(localOffset, newOffset);

                dtDate = dtDate.AddMinutes(Difference);

                return dtDate;
            }
            catch (Exception ex)
            {
                return paramDate;
            }
        }

        //prath 01-10-2020
        public static DateTime convertWellToLocalTimeZone(DateTime paramDate, VuMaxDR.Data.Objects.Well objWell)
        {
            try
            {
                DateTime dtDate = paramDate; // 'The date will already be in local time zone ...

                string localOffset = objWell.timeZone;
                string newOffset = TimeOffsetInfo.getLocalTimeZoneUTCOffset(dtDate);

                int Difference = TimeOffsetInfo.getTimeZoneDifferenceMinutes(localOffset, newOffset);

                dtDate = dtDate.AddMinutes(Difference);

                return dtDate;
            }
            catch (Exception ex)
            {
                return paramDate;
            }
        }

        public static DataTable getRigState(ref VuMaxDR.Data.DataService objDataService, string wellID)
        {
            try
            {
                DataTable objData = new DataTable();

                string strSQL = "SELECT WELL_ID, RIG_STATE_NUMBER, RIG_STATE_NAME, RIG_STATE_COLOR FROM VMX_WELL_RIGSTATE_ITEMS WHERE WELL_ID ='" + wellID + "'";
                objData = objDataService.getTable(strSQL);

                objData.Columns.Add("HEX_COLOR", typeof(System.String));

                foreach (DataRow objRow in objData.Rows)
                {
                    objRow["HEX_COLOR"] = ColorTranslator.ToHtml(Color.FromArgb((int)Convert.ToDouble(objRow["RIG_STATE_COLOR"].ToString())));
                }

                return objData;
            }
            catch (Exception ex)
            {

                return new DataTable();
            }

        }


        public static DateTime convertWellTimeZoneToUTC(DateTime paramDate, VuMaxDR.Data.Objects.Well paramObjWell)
        {
            try
            {

                // '(1) Parse the date ... it will be in target timze of the well
                DateTime dtDate = paramDate; // 'The date will already be in local time zone ...

                string localOffset = paramObjWell.timeZone;
                string newOffset = TimeOffsetInfo.getLocalTimeZoneUTCOffset(dtDate);

                int Difference = TimeOffsetInfo.getTimeZoneDifferenceMinutes(localOffset, newOffset);

                // '(2) Convert it to local time zone ...
                dtDate = dtDate.AddMinutes(Difference);

                // '(3) Convert the local date to UTC and return ...
                return dtDate.ToUniversalTime();
            }
            catch (Exception ex)
            {
                return paramDate;
            }
        }



        //Nishant 18-01-2022
        public static DateTime convertLocalToWellTimeZone(DateTime paramDate, VuMaxDR.Data.Objects.Well paramObjWell)
        {
            try
            {
                var dtDate = paramDate; // 'The date will already be in local time zone ...
                string localOffset = TimeOffsetInfo.getLocalTimeZoneUTCOffset(dtDate);
                string newOffset = paramObjWell.timeZone;
                int Difference = TimeOffsetInfo.getTimeZoneDifferenceMinutes(localOffset, newOffset);
                dtDate = dtDate.AddMinutes(Difference);
                return dtDate;
            }
            catch (Exception ex)
            {
                return paramDate;
            }
        }



    }



    //public static DateTime convertWellTimeZoneToUTC(DateTime paramDate)
    //{
    //    try
    //    {

    //        // '(1) Parse the date ... it will be in target timze of the well
    //        DateTime dtDate = paramDate; // 'The date will already be in local time zone ...

    //        string localOffset = objWell.timeZone;
    //        string newOffset = TimeOffsetInfo.getLocalTimeZoneUTCOffset(dtDate);

    //        int Difference = TimeOffsetInfo.getTimeZoneDifferenceMinutes(localOffset, newOffset);

    //        // '(2) Convert it to local time zone ...
    //        dtDate = dtDate.AddMinutes(Difference);

    //        // '(3) Convert the local date to UTC and return ...
    //        return dtDate.ToUniversalTime();
    //    }
    //    catch (Exception ex)
    //    {
    //        return paramDate;
    //    }
    //}

}
