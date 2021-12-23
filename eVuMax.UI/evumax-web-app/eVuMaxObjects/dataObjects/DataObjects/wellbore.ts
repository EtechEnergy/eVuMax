import * as Collections from "typescript-collections";
import * as dataObjects from "../dataObjects";
import { TimeLog } from "./timeLog";
import {opsReport} from "./opsReport";
import {bhaRun} from "./bhaRun";
import {mudLog} from "././mudLog";
import {DepthLog} from "./DepthLog";
import {Trajectory} from "./Trajectory";

export class Wellbore {
  ObjectID: string = "";
  WellID: string = "";
  nameWell: string = "";
  name: string = "";
  number: string = "";
  numGovt: string = "";
  statusWellbore: string = "";
  purposeWellbore: string = "";
  typeWellbore: string = "";
  shape: string = "";
  dTimeKickoff: string = "";
  mdCurrent: number = 0;
  tvdCurrent: number = 0;
  mdKickoff: number = 0;
  tvdKickoff: number = 0;
  mdPlanned: number = 0;
  tvdPlanned: number = 0;
  mdSubSeaPlanned: number = 0;
  tvdSubSeaPlanned: number = 0;
  dayTarget: number = 0;
  ServerKey: string = "";
  wmlsurl: string = "";
  wmlpurl: string = "";
  lastDataReceived: Date = new Date();
  lastRestartStarted: Date = new Date();
  //timeLogs: dataObjects.TimeLog
  timeLogs: Map<string, TimeLog> = new Map<string, TimeLog>();
  //timeLogs:  Collections.Dictionary <string, TimeLog> = new Collections.Dictionary <string, TimeLog>();

  depthLogs: Map<string, dataObjects.DepthLog> = new Map<
    string,
    dataObjects.DepthLog
  >();

  trajectories: Map<string, dataObjects.Trajectory> = new Map<
    string,
    dataObjects.Trajectory
  >();

  opsReports: Map<string, opsReport> = new Map<string, opsReport>();

  bhaRuns: Map<string, bhaRun> = new Map<string, bhaRun>();

  mudLogs: Map<string, mudLog> = new Map<string, mudLog>();

  newTimeLogs: Map<string, TimeLog> = new Map<string, TimeLog>();

  newDepthLogs: Map<string, DepthLog> = new Map<string, DepthLog>();

  newTrajectories: Map<string, Trajectory> = new Map<string, Trajectory>();

  newMudLogs: Map<string, mudLog> = new Map<string, mudLog>();
}
