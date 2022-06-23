using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager.KPI
{
    public class PhaseTagMaster
    {

       static public PhaseTreeNode LoadPhaseMasterTree(ref DataService objDataService)
        {
            try
            {

                PhaseTreeNode objRootNode = new PhaseTreeNode();
                objRootNode.nodeType = enumPhaseNodeType.Master;
                objRootNode.text = "Master Entries";
                objRootNode.imageUrl = "";
                objRootNode.nodeID = "MASTER";

                DataTable objData = objDataService.getTable("SELECT * FROM VMX_PHASE_MASTER ORDER BY PHASE_NAME");

                foreach (DataRow objRow in objData.Rows)
                {
                   
                    string PhaseID = DataService.checkNull(objRow["PHASE_ID"].ToString(), "").ToString();
                    string PhaseName = DataService.checkNull(objRow["PHASE_NAME"], "").ToString();
                    PhaseTreeNode objPhaseNode = new PhaseTreeNode();
                    objPhaseNode.nodeType = enumPhaseNodeType.Phase;
                    objPhaseNode.PhaseID = PhaseID;
                    objPhaseNode.imageUrl = "";
                    objPhaseNode.text = "Phase: " + PhaseName;
                    objPhaseNode.nodeID = objPhaseNode.PhaseID + objPhaseNode.StepID + objPhaseNode.EmphID;
                    objPhaseNode.objPhase = clsPhase.load(ref objDataService, PhaseID);

                    DataTable objStepData = objDataService.getTable("SELECT * FROM VMX_STEP_MASTER WHERE PHASE_ID='" + PhaseID + "' ORDER BY STEP_NAME");

                    foreach (DataRow objStepRow in objStepData.Rows)
                    {

                        string StepID = DataService.checkNull(objStepRow["STEP_ID"], "").ToString();
                        string StepName = DataService.checkNull(objStepRow["STEP_NAME"], "").ToString();

                        var objStepNode = new PhaseTreeNode();
                        objStepNode.nodeType = enumPhaseNodeType.StepPhase;
                        objStepNode.PhaseID = PhaseID;
                        objStepNode.StepID = StepID;
                        objStepNode.text = "Step: " + StepName;
                        objStepNode.imageUrl = "";
                        objStepNode.nodeID = objStepNode.PhaseID + objStepNode.StepID + objStepNode.EmphID;
                        objStepNode.objPhase = objPhaseNode.objPhase;
                        objStepNode.objStep = clsStep.load(ref objDataService, PhaseID, StepID);

                        DataTable objEmphData = objDataService.getTable("SELECT * FROM VMX_EMPH_MASTER WHERE PHASE_ID='" + PhaseID + "' AND STEP_ID='" + StepID + "' ORDER BY EMPH_NAME");

                        foreach (DataRow objEmphRow in objEmphData.Rows)
                        {

                            string EmphID = DataService.checkNull(objEmphRow["EMPH_ID"], "").ToString();
                            string EmphName = DataService.checkNull(objEmphRow["EMPH_NAME"], "").ToString();

                            var objEmphNode = new PhaseTreeNode();
                            objEmphNode.nodeType = enumPhaseNodeType.Emph;
                            objEmphNode.PhaseID = PhaseID;
                            objEmphNode.StepID = StepID;
                            objEmphNode.EmphID = EmphID;
                            objEmphNode.text = "Emphasis: " + EmphName;
                            objEmphNode.imageUrl = "";
                            objEmphNode.nodeID = objEmphNode.PhaseID + objEmphNode.StepID + objEmphNode.EmphID;

                            objEmphNode.objStep = objStepNode.objStep;
                            objEmphNode.objPhase = objStepNode.objPhase;
                            objEmphNode.objEmph = clsEmph.load(ref objDataService, PhaseID, StepID, EmphID);

                            objStepNode.items.Add(objEmphNode);

                        }

                        objPhaseNode.items.Add(objStepNode);

                    }

                    objRootNode.items.Add(objPhaseNode);

                }


                return objRootNode;
            }
            catch (Exception ex)
            {

                return new PhaseTreeNode();
            }
            
            
        }



        public clsPhase load(ref DataService objDataService, string paramPhaseID)
        {
            try
            {
                clsPhase objPhase = new clsPhase();
                objPhase = clsPhase.load(ref objDataService, paramPhaseID);
                return objPhase;
            }
            catch (Exception ex)
            {

                return new clsPhase();
            }
        }
        public bool add(ref DataService objDataService, clsPhase objPhase)
        {
            try
            {
                string lastError = "";
                clsPhase.add(ref objDataService, objPhase, ref lastError);
                
                return true;
            }
            catch (Exception)
            {

                return false;
            }
        }

        public bool update()
        {
            try
            {
                return true;
            }
            catch (Exception)
            {

                return false;
            }
        }

        public bool remove()
        {
            try
            {
                return true;
            }
            catch (Exception)
            {

                return false;
            }
        }


    }
}
