import {HookloadPlanData} from "./HookloadPlanData";
    const cnPickup: string = "PKUP";
    const cnSlackOff: string = "SLOF";
    const cnRotate: string = "ROT";
    const cnTorque: string = "TOR";
    const cnOnTorque: string = "ONTOR";
    const cnMkTorque: string = "MKTOR";
    const cnTypeHkldPlan: string = "HKLDP";
    const cnTypeActualHkld: string = "HKLDA";
    const cnTypeTorquePlan: string = "TORP";
    const cnTypeActualTorque: string = "TORA";
    const cnTorqueLimit: string = "TQLMT";
    const cnSinRot: string = "SNROT";

    export class AdnlHookloadPlan {

        WellID: string = "";
        WellboreID: string = "";
        LogID: string = "";
        PlanID: string = "";
        Name: string = "";
        PlanType: string = "";
        RunNo: string = "";
        pickup: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
        slackoff: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
        rotate: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
        torque: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
        onTorque: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
        mkTorque: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
        tqLimit: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
        sinRot: Map<number, HookloadPlanData> = new Map<number, HookloadPlanData>();
    }
