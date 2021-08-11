import {HookloadPlanData} from "./HookloadPlanData";


    const cnPickup: string = "PKUP";
    const cnSlackOff: string = "SLOF";
    const cnRotate: string = "ROT";
    const cnTorque: string = "TOR";
    const cnCustom: string = "CUSTOM";
    const cnOnTorque: string = "ONTOR";
    const cnMkTorque: string = "MKTOR";
    const cnTorqueLimit: string = "TQLMT";
    const cnSinRot: string = "SNROT";


    export class HookloadPlan {

        WellID: string = "";
        WellboreID: string = "";
        LogID: string = "";
        Name: string = "";
        PlanType: string = "";
        pickup: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
        slackoff: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
        rotate: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
    }

