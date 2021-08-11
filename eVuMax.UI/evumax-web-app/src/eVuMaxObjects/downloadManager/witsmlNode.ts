import {
  Wellbore,
  OffsetWell,
  TimeLog,
  Well,
  DepthLog,
  Trajectory,
  bhaRun,
} from "../dataObjects/dataObjects";
import { mudLog } from "../dataObjects/DataObjects/mudLog";
import { opsReport } from "../dataObjects/DataObjects/opsReport";
import { witsmlServer } from "./witsmlServer";

export enum enTreeNodeType {
  "None" = -1,
  "Server" = 0,
  "Wells" = 1,
  "Well" = 2,
  "Wellbores" = 3,
  "Wellbore" = 4,
  "TimeLogs" = 5,
  "TimeLog" = 6,
  "DepthLogs" = 7,
  "DepthLog" = 8,
  "Trajectories" = 9,
  "Trajectory" = 10,
  "OpsReports" = 11,
  "OpsReport" = 12,
  "Channel" = 13,
  "Hookload" = 14,
  "WOBPlan" = 15,
  "Group" = 16,
  "bhaRuns" = 17,
  "bhaRun" = 18,
  "mudLog" = 19,
  "mudlogs" = 20,
}
export class witsmlNode {

  serverKey: string = "";
  nodeID: string = "";
  nodeType: enTreeNodeType = enTreeNodeType.Server;
  objWell: Well = new Well();
  objWellbore: Wellbore = new Wellbore();
  objServer: witsmlServer = new witsmlServer();
  objTimeLog: TimeLog = new TimeLog();
  objDepthLog: DepthLog = new DepthLog();
  objTrajectory: Trajectory = new Trajectory();
  objBHARun: bhaRun = new bhaRun();
  objOpsReport: opsReport = new opsReport();
  objMudLog: mudLog = new mudLog();
  mnemonic: string = "";
  isProcessing: boolean = false;
  originalImageIndex: number = 0;
  needRefresh: boolean = false;
  WellID: string = "";
  WellboreID: string = "";
  ObjectID: string = "";
  wmlsurl: string = "";
  wmlpurl: string = "";
  wells: Well[]; // Map<string, Well> = new Map<string, Well>();
  ProfileID: string = "";
  downloading: boolean = false; //Nishant to keep track if downloading is in progress or not for any Node

  //for Kendo Tree
  id: string = "";
  text: string = "";
  imageUrl: string = ""; //"../../Images/Well.ico";
  expanded?: boolean = true;
  items?: witsmlNode[] = [];
}
