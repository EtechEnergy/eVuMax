import {WOBPlanData} from "./WOBPlanData";

    export class WOBPlan {

        WellID: string = "";

        WellboreID: string = "";

        LogID: string = "";

        Name: string = "";

        planData: Map<number, WOBPlanData> = new Map<number, WOBPlanData>();
    }



