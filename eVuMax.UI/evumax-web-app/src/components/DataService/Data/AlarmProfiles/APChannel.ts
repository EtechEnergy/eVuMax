
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
    TimeLog = 1,
    DepthLog = 2,
    Trajectory = 3
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
    alarmContainerDates: Date[] = []; //As Dictionary(Of String, Date)
    alarmContainerID: string = "";
    __doPause: boolean;
    __functionCache: number[] = []; //As Dictionary(Of String, Double)
    channelList: string = "";
    ExpLog: string = "";
    DownSampleFunction: enumDownSampleFunction.LastValue;
    TimeLogTableName: string = "";
    AlarmDepth: number = 0;
    history: AlarmHistoryItem[] = [];//As Dictionary(Of Integer, AlarmHistoryItem)
    hasErrors: boolean;
    AlarmDateTime: Date;
    Mnemonic: string = "";
    ChannelName: string = "";
    RedExpression: string = "";
    currentState: number = 0;
    channelValue: number = 0;
    LastState: number = 0;
    LastStateTime: Date;
    LastDataTime: Date;
    RigStates: string = "";
    RigStateSelection: boolean;
    YellowExpression: string = "";
    TimeDuration: number = 0;
    TriggerType: number = apTriggerType.Instant;
    WellStatus: string = "";
    parent: object;
    RedConditions: string = "";
    RedUseBuilder: boolean=false;
    WellStatusSpecific: boolean;
    YellowConditions: string = "";
    YellowUseBuilder: boolean=false;
    PlaySound: boolean;
    AckRequired: boolean;


}