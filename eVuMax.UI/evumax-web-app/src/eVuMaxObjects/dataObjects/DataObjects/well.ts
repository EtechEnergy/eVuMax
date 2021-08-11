import * as Collections from "typescript-collections";
import { OffsetWell } from "./OffsetWell";
import { Wellbore } from "./wellbore";
import { TimeLog } from "./timeLog";


export enum vmxSortOn {
  Name = 0,
  DisplayOrder = 1,
}
export const wDateFormatLocal: string = "Local";
export const wDateFormatUTC: string = "UTC";

export class Well {
  ObjectID: string = "";
  name: string = "";
  nameLegal: string = "";
  numLicense: string = "";
  numGovt: string = "";
  dTimeLicense: string = "";
  field: string = "";
  country: string = "";
  county: string = "";
  state: string = "";
  region: string = "";
  district: string = "";
  block: string = "";
  timeZone: string = "";
  operatorName: string = "";
  operatorDiv: string = "";
  pcInterest: string = "";
  numAPI: string = "";
  statusWell: string = "";
  purposeWell: string = "";
  dTimSpud: string = "";
  dTimPa: string = "";
  wellheadElevation: number = 0;
  groundElevation: number = 0;
  waterDepth: number = 0;
  latitude: number = 0;
  longitude: number = 0;
  xCoOrd: number = 0;
  yCoOrd: number = 0;
  dtmPermanent: string = "";
  ServerKey: string = "";
  wmlsurl: string = "";
  wmlpurl: string = "";
  lastDataReceived: Date = new Date();
  lastRestartStarted: Date = new Date();
  AlarmHistoryTableName: string = "";
  RigName: string = "";
  EDRProvider: string = "";
  DataSource: string = "";
  DrillingSupr: string = "";
  DrillingEng: string = "";
  Historical: boolean = false;

  //offsetWells: Map<string, OffsetWell> = new  Map<string, OffsetWell>();
  offsetWells: OffsetWell[] = [];


  //wellbores: Map<string, Wellbore> = new Map();
  wellbores: Wellbore[] = [];

  objAlarmPanel: any ;// new AlarmPanel();
  DisplayOrder: number = 0;
  SortOn: vmxSortOn = vmxSortOn.Name;
  AlarmProfileID: string = "";
  __timeLogWellboreID: string = "";
  __timeLogLogID: string = "";
  __isActive: boolean = false;
  __timeLogDataTableName: string = "";
  wellDateFormat: string = wDateFormatLocal;
  isExistingWell: boolean = false;
  dTimCreation: string = "";
  hasRemarksLog: boolean = false;
  __lastRemarksDate: Date = new Date();
  __objRemarksLog: TimeLog = new TimeLog();
  SEC: string = "";
  TWP: string = "";
  RGE: string = "";
  LegalDesc: string = "";
  ContType: string = "";
  RigType: string = "";
  Pump1Model: string = "";
  Pump1Stroke: string = "";
  Pump1Liner: string = "";
  Pump2Model: string = "";
  Pump2Stroke: string = "";
  Pump2Liner: string = "";
  Pump3Model: string = "";
  Pump3Stroke: string = "";
  Pump3Liner: string = "";
  Rep: string = "";
  ToolPusher: string = "";
  TightHoleNo: string = "";
  ReEntryNo: string = "";
  Comments: string = "";
  Contractor: string = "";
  Objective: string = "";
  TDDate: string = "";
  TDFormation: string = "";
  Pump1: string = "";
  Pump2: string = "";
  Pump3: string = "";
  RigCost: number = 0;
  DrlgConnTime: number = 0;
  TripConnTime: number = 0;
  BTSTime: number = 0;
  STSTime: number = 0;
  STBTime: number = 0;
  TripInSpeed: number = 0;
  TripOutSpeed: number = 0;
  PlannedDays: number = 0;

  constructor() {
    //nothing
    ////let objOffsetWells = new OffsetWell();
    ////objOffsetWells.OffsetWellID = "s11"
    //////https://stackoverflow.com/questions/13631557/typescript-objects-as-dictionary-types-as-in-c-sharp
    ////this.offsetWells.set("1", objOffsetWells);
  }
}
