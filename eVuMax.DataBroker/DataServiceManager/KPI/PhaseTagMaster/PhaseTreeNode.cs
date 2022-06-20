using System;
using System.Collections.Generic;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager.KPI
{
    public enum enumPhaseNodeType
    {
    Master = 999,
    Phase= 0,
    StepPhase = 1,
    Emph = 2,
    }

    public class PhaseTreeNode
    {
        public string id= "";
        public string text= "";
        public string imageUrl ="../../Images/Well.ico";
        public bool expanded= true;
        public   List<PhaseTreeNode> items = new List<PhaseTreeNode>();
        public string   nodeID ="";
        public string PhaseID ="";
        public string StepID="";
        public string EmphID ="";
        public enumPhaseNodeType nodeType= enumPhaseNodeType.Master;
        public clsPhase objPhase = new clsPhase();
        public clsStep objStep = new clsStep();
        public clsEmph objEmph = new clsEmph();
    }
}
