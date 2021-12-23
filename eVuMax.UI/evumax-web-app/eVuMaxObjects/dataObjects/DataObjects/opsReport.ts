    import {activity} from "./activity";
    import {dayCost} from "./dayCost";
    export class opsReport {

        ObjectID: string = "";
        WellID: string = "";
        WellboreID: string = "";
        Name: string = "";
        activities: Map<string, activity> = new Map<string, activity>();
        dayCosts: Map<string, dayCost> = new Map<string, dayCost>();
        ServerKey: string = "";
        wmlsurl: string = "";
        wmlpurl: string = "";
        lastDataReceived: Date = new Date();
        lastRestartStarted: Date = new Date();
    }
