import { rigStateItem } from "./rigStateItem";
import { AutoSlideSettings } from "./AutoSlideSettings";
import * as Collections from "typescript-collections";

export enum enumDirection {
  Up = 1,
  Down = 2,
  Stall = 0,
}
export class sectionRigState {
  //   /*event*/ CompletionProgress: EventHandler;

  private PercentComplete: number = 0;

  // 'List of rig states
  rigStates: Map<number, rigStateItem> = new Map<number, rigStateItem>();

  ID: string = "";
  WellID: string = "";
  SectionID: string = "";
  UnknownName: string = "Unknown";
  UnknownNumber: number = 15;
  UnknownColor: number = 0;
  HookloadCutOff: number = 0;
  RPMCutOff: number = 0;
  CIRCCutOff: number = 0;
  Sensitivity: number = 0;
  PumpPressureCutOff: number = 0;
  DepthComparisonSens: number = 2;
  DetectAutoSlideDrilling: boolean = false;
  DetectAirDrilling: boolean = false;
  AirPressure: number = 0;
  TorqueCutOff: number = 0;
  MistFlowCutOff: number = 0;
  TorqueMin: number = 0;
  TorqueMax: number = 0;
  CalibrationRows: number = 2;
  MinTorqueDifference: number = 0;
  MinRPM: number = 0;
  MaxRPM: number = 0;
  SelectedSet: number = 0;
  TorqueMin2: number = 0;
  TorqueMax2: number = 0;
  CalibrationRows2: number = 2;
  MinTorqueDifference2: number = 0;
  MinRPM2: number = 0;
  MaxRPM2: number = 0;
  TorqueMin3: number = 0;
  TorqueMax3: number = 0;
  CalibrationRows3: number = 2;
  MinTorqueDifference3: number = 0;
  MinRPM3: number = 0;
  MaxRPM3: number = 0;
  static cnRPM: string = "RPM";
  /* const */ static cnSTOR: string = "STOR";
  /* const */ static cnCIRC: string = "CIRC";
  /* const */ static cnDEPTH: string = "DEPTH";
  /* const */ static cnHDTH: string = "HDTH";
  /* const */ static cnHKLD: string = "HKLD";
  /* const */ static cnSPPA: string = "SPPA";
  /* const */ static cnRIGSTATE: string = "RIG_STATE";
  /* const */ static cnRIGSTATECOLOR: string = "RIG_STATE_COLOR";
  /* const */ static cnDATETIME: string = "DATETIME";
  /* const */ static cnAirPressure: string = "AIR_PRESSURE";
  /* const */ static cnMistFlow: string = "MIST_FLOW";
  DoNotPause: boolean = false;

  autoSlideSetupList: Collections.Dictionary<
    number,
    AutoSlideSettings
  > = new Collections.Dictionary<number, AutoSlideSettings>();
  TorqueCycles: number = 0;
  CalibrationTime: number = 2;
  PercentWindow: number = 20;
  __doLogSaveErrors: boolean = false;
  __logFileName: string = "";
  DetectPipeMovement: boolean = false;
  PipeMovementThreshold: number = 15;
}
