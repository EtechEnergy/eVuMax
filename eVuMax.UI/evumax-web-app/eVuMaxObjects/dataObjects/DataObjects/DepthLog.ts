import * as DataObjects from "../dataObjects";
import { logChannel } from "./logChannel";
import {QCRule} from "./QCRule";
import {ImageLogDataSet} from "./ImageLogDataSet";


    export class DepthLog {

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
        lastRestartStarted:  Date = new Date();
        vshalChannelMnemonic: string = "";
        EDRProvider: string = "";
        __WellName: string = "";
        PiWellID: string = "";
        PiWellboreID: string = "";
        PiLogID: string = "";
        //logCurves: Map<string, logChannel> = new Map<string, logChannel>();
        logCurves: logChannel[] = [];
        //Variables: Map<string,   DataObjects.LogVariable> = new Map<string, DataObjects.LogVariable>();
        Variables: DataObjects.LogVariable[] = [];
        //QCRules: Map<string, QCRule> = new Map<string, QCRule>();
        QCRules:QCRule[] = [];


        //ImageLogDataSets: Map<string, ImageLogDataSet> = new Map<string, ImageLogDataSet>();
        ImageLogDataSets:   ImageLogDataSet[] = [];
        LinkToParent: boolean = false;
        LinkWellID: string = "";
        LinkWellboreID: string = "";
        LinkLogID: string = "";
        DuplicateAction: any; //  eVuMax.Data.Objects.enumDuplicateAction = eVuMax.Data.Objects.enumDuplicateAction.OverwriteDuplicates;
        PrimaryLog: boolean = false;

         __dataTableName: string = "";
        // __objSystemSettings: eVuMax.Common.SystemSettings = new eVuMax.Common.SystemSettings();
        // __objUnitConverter: UnitConverter = new UnitConverter();
        // __objDepthUnitConverter: UnitConverter = new UnitConverter();
        // __doConvertDepthUnits: boolean = false;
        // __doLogSaveErrors: boolean = false;
        // __logFileName: string = "";
        ///*event*/ InterpolateProgress: EventHandler;
       // private PercentComplete: number;
      //  private rowsProcessed: number;
      //*event*/ InterpolateCompleted: EventHandler;
      //channelList: Map<string, string> = new Map<string, string>();
        channelList: string[] = [];

    }




