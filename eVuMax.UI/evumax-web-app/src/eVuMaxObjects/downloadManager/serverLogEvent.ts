export enum srvEventType {
  "Request" = 0,
  "Response" = 1,
  "ErrorOccured" = 2,
}

export class ServerLogEvent {
  public ServerID: string = "";
  public ServerKey: string = "";
  public DateTime: string = "";
  public EventType: srvEventType = srvEventType.Request;
  public EventTitle: string = "";
  public EventOutput: string = "";
}
