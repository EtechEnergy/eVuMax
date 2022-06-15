import { AlarmValues } from "./AlarmValues";
import { AlarmHistoryItem } from "./AlarmHistoryItem";
import { APChannel } from "./APChannel";

export class APContainer{
    ContainerID  : string ="";
    __functionCache : number[] = [];  // As Dictionary(Of String, Double)
    __doPause : false;
    alarmContainerDates : Date[] = []; //As Dictionary(Of String, Date)
    history : AlarmHistoryItem[] = []; // Dictionary(Of Integer, AlarmHistoryItem)
    RemarksTableName : string ="";
    PlannedTrajectoryID  : string ="";
    ActiveTrajectoryID  : string ="";
    otherValues : AlarmValues[] = []; //As Dictionary(Of Integer, AlarmValues)
     TimeLogTableName  : string ="";
     parent ={} //parent As Object
    IsActive : boolean;
     channels :APChannel[] = []; //As Dictionary(Of String, APChannel)
    LastDataTime :  Date;
    setAlarms : AlarmValues[] = []; 
    LastStateTime : Date; 
    LastState : number=0;
    currentState :number =0;
    ContainerName  : string ="";
}


