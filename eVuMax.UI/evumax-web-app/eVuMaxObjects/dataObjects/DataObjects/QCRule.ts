export enum vmxQCRuleType {
  ChangeTolerance = 0,

  MinMaxLimit = 1,
}
export class QCRule {
  RuleID: string = "";
  RuleName: string = "";
  RuleType: number = 0;
  TolerancePercentage: number = 0;
  MinValue: number = 0;
  MaxValue: number = 0;
  //Channels: Map<string, string> = new Map<string, string>();
  Channels: string[]=[];

}
