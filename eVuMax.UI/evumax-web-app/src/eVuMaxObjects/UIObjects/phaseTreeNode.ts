import { clsPhase } from "../../components/DataService/KPI/PhaseMaster/clsPhase";
import { clsStep } from "../../components/DataService/KPI/PhaseMaster/clsStep";
import { clsEmph } from "../../components/DataService/KPI/PhaseMaster/clsEmph";
export enum enumPhaseNodeType {
    Master = 999,
    Phase = 0,
    StepPhase = 1,
    Emph = 2,
}

export class phaseTreeNode {
    id: string = "";
    text: string = "";
    imageUrl: string = "../../Images/Well.ico";
    expanded?: boolean = true;
    items?: phaseTreeNode[] = [];

    nodeID: string = "";
    PhaseID: string = "";
    StepID: string = "";
    EmphID: string = "";
    nodeType: enumPhaseNodeType = enumPhaseNodeType.Master;
    objPhase: clsPhase = new clsPhase();
    objStep: clsStep = new clsStep();
    objEmph: clsEmph = new clsEmph();

}
