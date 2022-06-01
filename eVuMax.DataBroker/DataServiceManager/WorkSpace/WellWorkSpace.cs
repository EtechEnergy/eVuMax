using System;
using System.Collections.Generic;
using System.Linq;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;
using System.Data;


namespace eVuMax.DataBroker.DataServiceManager
{

    

    public class WellWorkSpace
    {
        DataService objDataService;

        public WellWorkSpace(DataService objDataService)
        {
            this.objDataService = objDataService;
            
        }

        public Dictionary<string, VuMaxDR.Data.Objects.Well> Wells = new Dictionary<string, VuMaxDR.Data.Objects.Well>();

        public double WellsLoaded = 0d;

        public void loadWorkSpace()
        {

            //var objDialog = new frmWSProgress();

            try
            {

                WellsLoaded = 0d;

                Wells = new Dictionary<string, VuMaxDR.Data.Objects.Well>();

                DataTable objData = objDataService.getTable("SELECT A.WELL_ID FROM VMX_DS_WELL_PROFILE A,VMX_WELL B WHERE A.WELL_ID=B.WELL_ID ORDER BY B.WELL_NAME");

                if (objData.Rows.Count > 0)
                {

                    WellsLoaded = 0d;

                    //objDialog.bar.Minimum = 0;
                    //objDialog.bar.Maximum = objData.Rows.Count;
                    //objDialog.bar.Value = 0;
                    //objDialog.bar.Refresh();
                    //objDialog.objWSRef = this;
                    //objDialog.Show();
                    //objDialog.Refresh();

                    foreach (DataRow objRow in objData.Rows)
                    {

                        string WellID = DataService.checkNull(objRow["WELL_ID"], "").ToString();

                        // 'Well.checkTimeLogIndexes(objDataService, WellID)

                       VuMaxDR.Data.Objects.Well objWell = VuMaxDR.Data.Objects.Well.loadWellStructureWOPlan(ref objDataService, WellID);
                        objWell.wellDateFormat = VuMaxDR.Data.Objects.Well.getWellDateFormat(ref objDataService, WellID);

                        if (!(objWell is null))
                        {
                            Wells.Add(objWell.ObjectID, objWell);
                        }

                        //WellsLoaded += 1d;
                        //objDialog.bar.Value = WellsLoaded;
                        //objDialog.bar.Refresh();

                    }

                    //objDialog.Close();

                }
            }

            catch (Exception ex)
            {
                //objDialog.Close();
            }
        }

        //public void addWellToWorkSpace(string WellID)
        //{
        //    try
        //    {

        //        if (!objProcessConn2.IsRecordExist("SELECT WELL_ID FROM VMX_DS_WELL_PROFILE WHERE WELL_ID='" + WellID + "'"))
        //        {

        //            string strSQL = "";

        //            strSQL = "INSERT INTO VMX_DS_WELL_PROFILE (WELL_ID,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
        //            strSQL += "'" + WellID + "',";
        //            strSQL += "'" + objProcessConn2.UserName + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
        //            strSQL += "'" + objProcessConn2.UserName + "',";
        //            strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";

        //            objProcessConn2.executeNonQuery(strSQL);


        //            Well objWell = Well.loadWellStructure(objProcessConn2, WellID);

        //            if (!Wells.ContainsKey(WellID))
        //            {
        //                Wells.Add(objWell.ObjectID, objWell);
        //            }

        //            objVuMaxMain.refreshAllWellsAlarms();

        //        }
        //    }

        //    catch (Exception ex)
        //    {

        //    }
        //}



        //public void removeWellFromWorkSpace(string WellID)
        //{
        //    try
        //    {

        //        if (Wells.ContainsKey(WellID))
        //        {
        //            Wells.Remove(WellID);
        //        }


        //        // 'Stop the operations
        //        DataTable objData = objProcessConn2.getTable("SELECT OP_SEQ FROM VMX_DL_OPERATIONS WHERE WELL_ID='" + WellID + "'");

        //        foreach (DataRow objRow in objData.Rows)
        //        {

        //            int OpSeq = DataService.checkNull(objRow("OP_SEQ"), 0);

        //            objProcessConn2.executeNonQuery("DELETE FROM VMX_DL_OPERATIONS WHERE OP_SEQ=" + OpSeq.ToString());
        //            objProcessConn2.executeNonQuery("DELETE FROM VMX_DL_LOG WHERE OP_SEQ=" + OpSeq.ToString());

        //        }

        //        objProcessConn2.executeNonQuery("DELETE FROM VMX_DS_WELL_PROFILE WHERE WELL_ID='" + WellID + "'");

        //        objVuMaxMain.refreshAllWellsAlarms();
        //    }

        //    catch (Exception ex)
        //    {

        //    }
        //}

        //public bool isRefreshRequired()
        //{
        //    try
        //    {

        //        DataTable objData = objProcessConn2.getTable("SELECT WELL_ID FROM VMX_DS_WELL_PROFILE ");

        //        var wellList = new Dictionary<string, string>();

        //        foreach (DataRow objRow in objData.Rows)
        //        {
        //            string WellID = DataService.checkNull(objRow("WELL_ID"), "");
        //            wellList.Add(WellID, WellID);
        //        }

        //        bool NotFound = false;

        //        foreach (Well objWell in Wells.Values)
        //        {

        //            if (!wellList.ContainsKey(objWell.ObjectID))
        //            {
        //                NotFound = true;
        //            }

        //        }

        //        if (!NotFound)
        //        {

        //            if (Wells.Count == 0)
        //            {

        //                if (objData.Rows.Count > 0)
        //                {

        //                    return true;
        //                }
        //            }
        //        }

        //        else
        //        {
        //            return true;

        //        }
        //    }

        //    catch (Exception ex)
        //    {
        //        return false;
        //    }

        //    return default;
        //}
    }
}
