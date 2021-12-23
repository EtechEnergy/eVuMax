import { WellSectionCustomField } from "./WellSectionCustomField";
import { WellSectionPUSOSettings } from "./WellSectionPUSOSettings";
import { sectionRigState } from "../RigState/sectionRigState";
import * as Collections from "typescript-collections";

export class wellSection {
  WellID: string = "";
  EntryID: number = 0;
  SectionName: string = "";
  StartDepth: number = 0;
  EndDepth: number = 0;
  InnerDia: number = 0;
  OuterDia: number = 0;
  HoleType: string = "";
  HoleDiameter: number = 0;
  DepthOfInvestigation: number = 0;
  BHADetails: string = "";
  customFieldList: Collections.Dictionary<
    number,
    WellSectionCustomField
  > = new Collections.Dictionary<number, WellSectionCustomField>();
  PUSOSettings: WellSectionPUSOSettings = new WellSectionPUSOSettings();
  rigStateSettings: sectionRigState = new sectionRigState();
  // 'Nishant
  DrlgConnTrgTime: number = 0;
  TripConnTrgTime: number = 0;
  BTSTrgTime: number = 0;
  STSTrgTime: number = 0;
  STBTrgTime: number = 0;
  AlarmProfileID: string = "";
}
