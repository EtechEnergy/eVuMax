import {RMEntries} from "./RMEntries";
export class RM {
  RMID: string = "";
  RMName: string = "";
  RMMnemonic: string = "";
  RMColor: string = "LightYellow";
  RoadmapEntries: Map<number, RMEntries> = new Map<number, RMEntries>();
  arrRMData: RMEntries[] | undefined;
}
