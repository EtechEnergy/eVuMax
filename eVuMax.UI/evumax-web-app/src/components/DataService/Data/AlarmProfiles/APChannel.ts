
import { AlarmHistoryItem } from "./AlarmHistoryItem";

export enum enumDownSampleFunction {
    LastValue = 0,
    AvgValue = 1,
    MinValue = 2,
    MaxValue = 3,
    FirstValue = 4
}


export enum apTriggerType {
    Instant = 0,
    AccumulatedData = 1
}

export enum apSourceType {
    TimeLog = 0,
    DepthLog = 1,
    Trajectory = 2
}

export class APChannel {
    
    
    
    
    
    
    SourceType: number = apSourceType.TimeLog;
    AlarmType: string = "";
    AlarmTypeName: string = "";
    AlarmCategory2ID: string = "";
    AlarmCategory2Name: string = "";
    AlarmShape: number = 0;
    ShapeColor: number = 0;
    ShapeSize: number = 0;
    AlarmCategory: number = 0;
    ActiveTrajectoryID: string = "";
    PlannedTrajectoryID: string = "";
    Frequency: number = 0;
    RemarksTableName: string = "";
    AckTimeLimit: number = 0;
    SendMail: boolean;
    MailTo: string = "";
    alarmContainerID: string = "";
    history: AlarmHistoryItem[] = [];//As Dictionary(Of Integer, AlarmHistoryItem)
    __doPause: boolean;
    __functionCache: [] = []; //As Dictionary(Of String, Double)
    channelList: string = "";
    ExpLog: string = "";
    DownSampleFunction: enumDownSampleFunction.LastValue;
    TimeLogTableName: string = "";
    AlarmDepth: number = 0;
    alarmContainerDates : Date[] =[];  
    hasErrors: boolean;
    AlarmDateTime: Date;
    Mnemonic: string = "";
    ChannelName: string = "";
    YellowExpression: string = "";
    RedExpression: string = "";
    currentState: number = 0;
    channelValue: number = 0;
    LastStateTime: Date;
    LastDataTime: Date;
    RigStates: string = "";
    RigStateSelection: boolean;
    LastState :number=0;
    TimeDuration: number = 0;
    parent: object;
    TriggerType: number = apTriggerType.Instant;
    WellStatusSpecific: boolean;
    RedConditions: string = "";
    RedUseBuilder: boolean=false;
    WellStatus: string ="";
    YellowUseBuilder: boolean=false;
    PlaySound: boolean;
    AckRequired: boolean;
    YellowConditions : string="";

}