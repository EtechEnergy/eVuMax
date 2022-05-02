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
        //DataTable QCRulesList = new DataTable();
        DataService objDataService;
        public string LastError = "";

      public  eQCRules(ref DataService pObjDataService)
        {
            objDataService = pObjDataService;

            //QCRulesList.Clear();
            //QCRulesList.Columns.Add("RuleID");
            //QCRulesList.Columns.Add("RuleName");
            //QCRulesList.Columns.Add("RuleType");
            //QCRulesList.Columns.Add("RuleTypeName");
            //QCRulesList.Columns.Add("TolerancePercentage");
            //QCRulesList.Columns.Add("MinValue");
            //QCRulesList.Columns.Add("MaxValue");
        }
        public Dictionary<string, QCRule> getRuleList()
        {
            try
            {
                Dictionary<string, QCRule> objQCRulesList = QCRule.getList(ref objDataService);

                //DataRow objRow;

                foreach (QCRule objRule in objQCRulesList.Values)
                {
                    objRule.RuleName = objRule.RuleName + "~" + QCRule.getRuleTypeName(objRule.RuleType);
                }





                return objQCRulesList;
                //return QCRulesList;
            }
            catch (Exception)
            {
                
                return   new Dictionary<string, QCRule>();
                //return QCRulesList;
            }
        }


        public DataTable getRuleTypeList()
        {
            try
            {
                DataTable RuleTypeList = new DataTable();
                RuleTypeList.Columns.Add("RuleType");

                DataRow objRow = RuleTypeList.NewRow();
                objRow["RuleType"] = QCRule.getRuleTypeName(0);
                RuleTypeList.Rows.Add(objRow);
                
                objRow = RuleTypeList.NewRow();
                objRow["RuleType"] = QCRule.getRuleTypeName(1);
                RuleTypeList.Rows.Add(objRow);
                //RuleTypeList.Rows.Add(QCRule.getRuleTypeName(1), 1);

                return RuleTypeList;
            }
            catch (Exception ex)
            {
                return new DataTable();
            }
        }

    
        public DataTable getSTDChannelList()
        {
            try
            {

                
                DataTable objSTDChannelList = objDataService.getTable("SELECT MNEMONIC,CURVE_NAME FROM VMX_CURVE_DICTIONARY ORDER BY CURVE_NAME");

                return objSTDChannelList;

            }
            catch (Exception ex)
            {

                return new DataTable();
            }

        }
    
    
       public bool addRule(QCRule objRule)
        {
            try
            {
                string strSQL = "";
                strSQL = "INSERT INTO VMX_QC_RULES (RULE_ID,RULE_NAME,RULE_TYPE,TOLERANCE,MIN_VALUE,MAX_VALUE,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
                strSQL += "'" + objRule.RuleID + "',";
                strSQL += "'" + objRule.RuleName + "',";
                strSQL += "" + objRule.RuleType.ToString() + ",";
                strSQL += "" + objRule.TolerancePercentage.ToString() + ",";
                strSQL += "" + objRule.MinValue.ToString() + ",";
                strSQL += "" + objRule.MaxValue.ToString() + ",";
                strSQL += "'" + objDataService.UserName + "',";
                strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                strSQL += "'" + objDataService.UserName + "',";
                strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
                if (objDataService.executeNonQuery(strSQL))
                {
                    foreach (string Mnemonic in objRule.Channels.Values)
                    {
                        strSQL = "INSERT INTO VMX_QC_RULE_MNEMONICS (RULE_ID,MNEMONIC,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
                        strSQL += "'" + objRule.RuleID + "',";
                        strSQL += "'" + Mnemonic + "',";
                        strSQL += "'" + objDataService.UserName + "',";
                        strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                        strSQL += "'" + objDataService.UserName + "',";
                        strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
                        objDataService.executeNonQuery(strSQL);
                    }

                    return true;
                }
                else
                {
                   LastError = objDataService.LastError;
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
                
            }
        }



        public bool updateRule(QCRule objRule, ref string LastError)
        {
            try
            {
                string strSQL = "";
                strSQL = "UPDATE VMX_QC_RULES SET RULE_NAME='" + objRule.RuleName + "',RULE_TYPE=" + objRule.RuleType.ToString() + ",TOLERANCE=" + objRule.TolerancePercentage.ToString() + ",MIN_VALUE=" + objRule.MinValue.ToString() + ",MAX_VALUE=" + objRule.MaxValue.ToString() + ",MODIFIED_BY='" + objDataService.UserName + "',MODIFIED_DATE='" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "' WHERE RULE_ID='" + objRule.RuleID + "'";

                if (objDataService.executeNonQuery(strSQL))
                {
                    objDataService.executeNonQuery("DELETE FROM VMX_QC_RULE_MNEMONICS WHERE RULE_ID='" + objRule.RuleID + "'");
                    foreach (string Mnemonic in objRule.Channels.Values)
                    {
                        strSQL = "INSERT INTO VMX_QC_RULE_MNEMONICS (RULE_ID,MNEMONIC,CREATED_BY,CREATED_DATE,MODIFIED_BY,MODIFIED_DATE) VALUES(";
                        strSQL += "'" + objRule.RuleID + "',";
                        strSQL += "'" + Mnemonic + "',";
                        strSQL += "'" + objDataService.UserName + "',";
                        strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "',";
                        strSQL += "'" + objDataService.UserName + "',";
                        strSQL += "'" + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss") + "')";
                        objDataService.executeNonQuery(strSQL);
                    }

                    return true;
                }
                else
                {
                    LastError = objDataService.LastError;
                    return false;
                }
            }
            catch (Exception ex)
            {
                LastError = ex.Message + ex.StackTrace;
                return false;
            }
        }



        public bool removeRule(string RuleID, ref string LastError)
        {
            try
            {
                string strSQL = "DELETE FROM VMX_QC_RULES WHERE RULE_ID='" + RuleID + "'";
                if (objDataService.executeNonQuery(strSQL))
                {
                    strSQL = "DELETE FROM VMX_QC_RULE_MNEMONICS WHERE RULE_ID='" + RuleID + "'";

                    if (objDataService.executeNonQuery(strSQL))
                    {
                        return true;
                    }
                    else
                    {
                        LastError = objDataService.LastError;
                        return false;
                    }
                }
                else
                {
                    LastError = objDataService.LastError;
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {

                LastError = ex.Message + ex.StackTrace;
                return false;
            }

        }

    }




}
