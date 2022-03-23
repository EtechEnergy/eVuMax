using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.AdvKPI;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.AdvKPI_
{
    
   public class AdvKPI
    {
       public AdvKPIWell[] arrWells = new AdvKPIWell[0];
        //objWorkSpace As New AdvKPIWorkSpace
        private AdvKPIWorkSpace objWorkSpace = new AdvKPIWorkSpace();
        public DataTable grdProfile = new DataTable();
        public DataTable grdComposite = new DataTable();
        private DataService objDataService;

        public void loadWorkSpace(ref DataService paramDataService)
        {

            objDataService = paramDataService;


            //objWorkSpace.addWellToWorkSpace(objDataService, "ae1e7348-d98e-4083-bb0d-a7cad73bd37f");
            //objWorkSpace.addWellToWorkSpace(objDataService, "us_1395675560");



            objWorkSpace.loadWorkSpace(objDataService);
            
            if (objWorkSpace.wells.Count > 0)
            {
                arrWells = objWorkSpace.wells.Values.ToArray();
                Array.Sort(arrWells);
            }

            refreshCompositeList();
            refreshProfileList();
        }

        private void refreshProfileList()
        {
            try
            {


                grdProfile = objDataService.getTable("SELECT PROFILE_ID,PROFILE_NAME,NOTES FROM VMX_AKPI_PROFILE ORDER BY PROFILE_NAME");

                //grdProfile.Rows.Clear();
                //DataTable objData = objDataService.getTable("SELECT * FROM VMX_AKPI_PROFILE ORDER BY PROFILE_NAME");

                //grdProfile = objData;


                //if (objData.Rows.Count > 0)
                //{
                //    grdProfile.Rows.Add(objData.Rows.Count);
                //    int rowIndex = 0;
                //    foreach (DataRow objRow in objData.Rows)
                //    {
                //        grdProfile.Rows[rowIndex].Cells("COL_PROFILE_ID").Value = DataService.checkNull(Rows["PROFILE_ID"], "");
                //        grdProfile.Rows[rowIndex].Cells("COL_PROFILE_NAME").Value = DataService.checkNull(Rows["PROFILE_NAME"], "");
                //        grdProfile.Rows[rowIndex].Cells("COL_NOTES").Value = DataService.checkNull(Rows["NOTES"], "");
                //        rowIndex += 1;
                //    }
                //}

            }
            catch (Exception ex)
            {
            }
        }


        private void refreshCompositeList()
        {
            try
            {
                

//                grdComposite.Rows.Clear();
                grdComposite = objDataService.getTable("SELECT TEMPLATE_ID,TEMPLATE_NAME,NOTES FROM VMX_AKPI_COM_PROFILE ORDER BY TEMPLATE_NAME");

                

                //if (objData.Rows.Count > 0)
                //{
                //    grdComposite.Rows.Add(objData.Rows.Count);
                //    int rowIndex = 0;
                //    foreach (DataRow objRow in objData.Rows)
                //    {
                //        grdComposite.Rows[rowIndex].Cells("COL_COMP_TEMPLATE_ID").Value = DataService.checkNull(Rows["TEMPLATE_ID"), "");
                //        grdComposite.Rows[rowIndex].Cells("COL_COMP_TEMPLATE_NAME").Value = DataService.checkNull(Rows["TEMPLATE_NAME"), "");
                //        grdComposite.Rows[rowIndex].Cells("COL_COMP_TEMPLATE_NOTES").Value = DataService.checkNull(Rows["NOTES"), "");
                //        rowIndex += 1;
                //    }
                //}

               
           
            }
            catch (Exception ex)
            {
            }
        }


    }//Class
}
