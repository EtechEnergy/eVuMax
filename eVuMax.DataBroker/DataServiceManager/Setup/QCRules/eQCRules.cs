using eVuMax.DataBroker.Broker;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager
{
   public class eQCRules
    {
        DataTable QCRulesList = new DataTable();
        DataService objDataService;

      public  eQCRules(ref DataService pObjDataService)
        {
            objDataService = pObjDataService;

            QCRulesList.Clear();
            QCRulesList.Columns.Add("RuleID");
            QCRulesList.Columns.Add("RuleName");
            QCRulesList.Columns.Add("RuleType");
            QCRulesList.Columns.Add("RuleTypeName");
            QCRulesList.Columns.Add("TolerancePercentage");
            QCRulesList.Columns.Add("MinValue");
            QCRulesList.Columns.Add("MaxValue");
        }
        public DataTable getRuleList()
        {
            try
            {
                Dictionary<string, QCRule> objQCRules = QCRule.getList(ref objDataService);

                DataRow objRow;

                foreach (QCRule objRule in objQCRules.Values)
                {
                    objRow = QCRulesList.NewRow();

                    objRow["RuleID"] = objRule.RuleID;
                    objRow["RuleName"] = objRule.RuleName;
                    objRow["RuleType"] = objRule.RuleType;
                    objRow["RuleTypeName"] = QCRule.getRuleTypeName(objRule.RuleType);
                    objRow["TolerancePercentage"] = objRule.TolerancePercentage;
                    objRow["MinValue"] = objRule.MinValue;
                    objRow["MaxValue"] = objRule.MaxValue;


                    QCRulesList.Rows.Add(objRow);
                }

                return QCRulesList;
            }
            catch (Exception)
            {

                return QCRulesList;
            }
        }
        
    }
}
