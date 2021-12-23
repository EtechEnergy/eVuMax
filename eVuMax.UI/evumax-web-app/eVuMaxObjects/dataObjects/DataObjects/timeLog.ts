
import { logChannel } from './logChannel';
import { SideTrack } from './SideTrack';
import { LogVariable } from "./LogVariable";
import { QCRule } from "./QCRule";
import { HookloadPlan } from "./HookloadPlan";
import { WOBPlan } from "./WOBPlan";
import { AdnlHookloadPlan } from "./AdnlHookloadPlan";

export enum enumDuplicateAction {
    OverwriteDuplicates = 0,
    SkipDuplicates = 1,
    MergeColumns = 2,
    MergeBoth = 3,
    MergeColumnsNoDuplicate = 4,
    MergeBothNoDuplicate = 5
};

export class TimeLog {
    ObjectID: string = "";
    WellID: string = "";
    WellboreID: string = "";
    nameWell: string = "";
    nameWellbore: string = "";
    nameLog: string = "";
    serviceCompany: string = "";
    runNumber: string = "";
    creationDate: string = "";
    description: string = "";
    indexType: string = "";
    startIndex: string = "";
    endIndex: string = "";
    lastDataIndex: string = "";
    stepIncrement: string = "";
    direction: string = "";
    indexCurve: string = "";
    columnIndex: string = "";
    indexUnits: string = "";
    uomNamingSystem: string = "";
    otherData: string = "";
    nullValue: string = "";
    dTimCreation: string = "";
    dTimLastChange: string = "";
    itemState: string = "";
    comments: string = "";
    WITSMLColumnIndex: string = "";
    ServerKey: string = "";
    wmlsurl: string = "";
    wmlpurl: string = "";
    lastDataReceived: Date = new Date();
    lastRestartStarted: Date = new Date();
    EDRProvider: string = "";
    PrimaryLog: boolean = false;
    RemarksLog: boolean = false;
    PiWellID: string = "";
    PiWellboreID: string = "";
    PiLogID: string = "";

   // logCurves: Map<string, logChannel> = new Map();
   logCurves: logChannel[]= [];
   sideTracks: SideTrack[] =[];
    //sideTracks: Map<string, SideTrack> = new Map<string, SideTrack>();
    Variables: Map<string, LogVariable> = new Map();
    QCRules: QCRule[] =[];
    //QCRules: Map<string, QCRule> = new Map();

    objHookload: HookloadPlan = new HookloadPlan();
    objWOBPlan: WOBPlan = new WOBPlan();
    LastDate: number = 0;
    CalcInProgress: boolean = true;
    AdnlHookloadPlans: Map<string, AdnlHookloadPlan> = new Map();
    //ActualHkldData: Map < string, AdnlHookloadPlan > = new Map<string, AdnlHookloadPlan>();
    //TorquePlans: Map < string, AdnlHookloadPlan > = new Map<string, AdnlHookloadPlan>();
    //ActualTorqueData: Map < string, AdnlHookloadPlan > = new Map<string, AdnlHookloadPlan>();

    //private objBulkExecutor: BulkCommandExecutor;
    CHKShotWellStatusData: any = ""; //Datatable
    ReadWellStatusFromCHKShot: boolean = false;
    __WellName: string = "";
    __dataTableName: string = "";
    //  __objSystemSettings: eVuMax.Common.SystemSettings = new eVuMax.Common.SystemSettings();
    //  __objUnitConverter: UnitConverter = new UnitConverter();
    __wellDateFormat: string = "";
    //  __objWellRigStateSetup: rigState;
    __doLogSaveErrors: boolean = false;
    __logFileName: string = "";
    private MAX_SECONDS_DIFF: number = 100000000;
    //  private WellSectionList: Map < number, wellSection > = new Map<number, wellSection>();

    LinkToParent: boolean = false;
    LinkWellID: string = "";
    LinkWellboreID: string = "";
    LinkLogID: string = "";
    DuplicateAction: enumDuplicateAction = enumDuplicateAction.OverwriteDuplicates;
    DontCalcHoleDepth: boolean = true;
    StartingHoleDepth: number = 0;
    DetectSpike: boolean = false;
    NearBottomDistance: number = 90;
    TolerancePc: number = 0.7;
    CheckTimePeriod: number = 60;
    CompareWindow: number = 0.1;
    IsOpenSpike: boolean = false;
    ActionType: number = 0;
    MaxCloseTime: number = 720;
    goodValues: Map<string, number> = new Map<string, number>();
    //goodValues: Collections.Dictionary < string, number > = new Collections.Dictionary <string, number>();

    CreateRepOnFormation: boolean = false;
    SnapJobID: string = "";
    FormationTop: string = "";
    FormationTops: Map<string, string> = new Map();

    DepthThreshold: number = 0;
    Frequency: number = 0;
    LastSnapSendDatetime: Date = new Date();

    //#Region "Support Members to use with Data Cache Manager"
    FromDate: Date = new Date();
    ToDate: Date = new Date();
    DataFilter: string = "";
    channelList: Map<string, string> = new Map();
    channelAlias: Map<string, string> = new Map();

    //channelList: Collections.Dictionary < string, string > = new Collections.Dictionary<string, string>();
    //channelAlias: Collections.Dictionary < string, string > = new Collections.Dictionary<string, string>();

    arrayData: Map<string, Object> = new Map();
    //arrayData:Collections.Dictionary < string, Object > = new  Collections.Dictionary<string, Object>();
}


