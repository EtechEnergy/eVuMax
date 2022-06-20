using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.DataServiceManager 
{
    public class ExpMetaData
    {
        public string ExpressionID = "";
        public string Name = "";
        public string Notes = "";
        public string RedExpression = "";
        public string YellowExpression = "";
        public string CreatedBy = "";
        public DateTime CreatedDate;

        public Dictionary<string, ExpVariable> inputVariables = new Dictionary<string, ExpVariable>();
        public DataService objDataService;

        public ExpMetaData(DataService objDataService)
        {
            this.objDataService = objDataService;
        }

        public static Dictionary<string, ExpMetaData> getList(ref DataService objDataService)
        {
            try
            {
                var list = new Dictionary<string, ExpMetaData>();

                DataTable objData = objDataService.getTable("SELECT EXP_ID FROM VMX_EXP_METADATA");

                foreach (DataRow objRow in objData.Rows)
                {

                    string ExpID = DataService.checkNull(objRow["EXP_ID"], "").ToString();

                    ExpMetaData objItem = ExpMetaData.loadExpItem(ref objDataService, ExpID);

                    if (objItem != null)
                    {

                        list.Add(objItem.ExpressionID, objItem);

                    }

                }

                return list;
            }
            catch (Exception ex)
            {
                return new Dictionary<string, ExpMetaData>();
            }
        }


        public static ExpMetaData loadExpItem(ref DataService objDataService, string pExpID)
        {
            try
            {

                DataTable objData = objDataService.getTable("SELECT * FROM VMX_EXP_METADATA WHERE EXP_ID='" + pExpID.Replace("'", "''") + "'");

                if (objData.Rows.Count > 0)
                {

                    DataRow objRow = objData.Rows[0];

                    var objItem = new ExpMetaData(objDataService);
                    objItem.ExpressionID = pExpID;
                    objItem.Name = DataService.checkNull(objRow["EXP_NAME"], "").ToString();
                    objItem.Notes = DataService.checkNull(objRow["NOTES"], "").ToString();
                    objItem.RedExpression = DataService.checkNull(objRow["EXPRESSION_RED"], "").ToString();
                    objItem.YellowExpression = DataService.checkNull(objRow["EXPRESSION_YELLOW"], "").ToString();
                    objItem.CreatedBy = DataService.checkNull(objRow["CREATED_BY"], "").ToString();
                    objItem.CreatedDate = Convert.ToDateTime(DataService.checkNull(objRow["CREATED_DATE"], ""));

                    objData = objDataService.getTable("SELECT * FROM VMX_EXP_VARIABLES WHERE EXP_ID='" + pExpID.Replace("'", "''") + "'");
                    foreach (DataRow objVarRow in objData.Rows)
                    {

                        var objVar = new ExpVariable();
                        objVar.VariableID = DataService.checkNull(objVarRow["VARIABLE"], "").ToString();
                        objVar.Caption = DataService.checkNull(objVarRow["CAPTION"], "").ToString();
                        objVar.Note = DataService.checkNull(objVarRow["NOTES"], "").ToString();

                        objItem.inputVariables.Add(objVar.VariableID, objVar);

                    }

                    return objItem;
                }
                else
                {
                    return default;
                }
            }

            catch (Exception ex)
            {
                return default;
            }
        }

    }
}
