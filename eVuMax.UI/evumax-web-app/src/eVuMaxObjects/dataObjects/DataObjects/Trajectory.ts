import {TrajectoryData} from "../DataObjects/TrajectoryData";

export class Trajectory {
  ObjectID: string = "";
  WellID: string = "";
  WellboreID: string = "";
  name: string = "";
  StartTime: string = "";
  EndTime: string = "";
  mdMax: number = 0;
  mdMin: number = 0;
  ServiceCompany: string = "";
  magneticDeclinition: string = "";
  gridCorUsed: string = "";
  azimuthVertSect: string = "";
  NSVertSectOrig: string = "";
  EWVertSectOrig: string = "";
  AzimuthRef: string = "";
  ServerKey: string = "";
  wmlsurl: string = "";
  wmlpurl: string = "";
  lastDataReceived: Date = new Date();
  lastRestartStarted: Date = new Date();
  PlannedTrajectory: boolean = false;
  IsPrimaryActive: boolean = false;
  trajectoryData: Map<number, TrajectoryData> = new Map<
    number,
    TrajectoryData
  >();
  LastMD: number = 0;
  // 'New advanced survey fields ...
  SFMD: number = 0;
  SFInclination: number = 0;
  SFAzimuth: number = 0;
  SFGx: number = 0;
  SFGy: number = 0;
  SFGz: number = 0;
  SFBx: number = 0;
  SFBy: number = 0;
  SFBz: number = 0;
  BSMD: number = 0;
  BSInclination: number = 0;
  BSAzimuth: number = 0;
  BSGx: number = 0;
  BSGy: number = 0;
  BSGz: number = 0;
  BSBx: number = 0;
  BSBy: number = 0;
  BSBz: number = 0;
  RefValueGT: number = 0;
  LimitGT: number = 0;
  RefValueBTot: number = 0;
  LimitBTot: number = 0;
  RefValuemDip: number = 0;
  LimitmDip: number = 0;
  RefValueBH: number = 0;
  LimitBH: number = 0;
  RefValueBV: number = 0;
  LimitBV: number = 0;
  RunRefGTotal: number = 0;
  RunRefBTotal: number = 0;
  RunRefMagDip: number = 0;
  RunRefDec: number = 0;
  SiteGridConvg: number = 0;
  RefValuerefGT: number = 0;
  LimitrefGT: number = 0;
  RefValuerefBT: number = 0;
  LimitrefBT: number = 0;
  RefValuerefDip: number = 0;
  LimitrefDip: number = 0;
  RefValuerefDec: number = 0;
  LimitrefDec: number = 0;
  RefValuegridConvg: number = 0;
  LimitgridConvg: number = 0;
  RefValuedGT: number = 0;
  LimitdGT: number = 0;
  RefValuedBT: number = 0;
  LimitdBT: number = 0;
  RefValuedBH: number = 0;
  LimitdBH: number = 0;
  RefValuedBV: number = 0;
  LimitdBV: number = 0;
  RefValuedDip: number = 0;
  LimitdDip: number = 0;
  RefValueBTD: number = 0;
  LimitBTD: number = 0;
  RefValueBTD2: number = 0;
  LimitBTD2: number = 0;
  Unit: string = "ft";
  SrcUnit: string = "ft";
  DoNotConvertUnit: boolean = false;
  //Error
  // private arrTrajectory[] =  [TrajectoryData()];
  LastError: string = "";
}
