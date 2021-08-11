import {ServerLogEvent} from "./serverLogEvent";

export class witsmlServer {
  ServerID: string = "";
  ServerName: string = "";
  WMLSURL: string = "";
  WMLPURL: string = "";
  WITSMLVersion: string = "";
  UserName: string = "";
  Password: string = "";
  UseProxyServer: boolean = false;
  ProxyURL: string = "";
  ProxyPort: string = "";
  UseProxyCredentials: boolean = false;
  ProxyUserName: string = "";
  ProxyPassword: string = "";
  DateDesignator: string = "";
  TimeOut: number = 120;
  RetryCount: number = 10;
  SendPlainText: boolean = false;
  //serverLog: Map<number, ServerLogEvent> = new Map<number,ServerLogEvent>();
  serverLog: ServerLogEvent[];

  PiDataSource: boolean = false;
  WriteBack: boolean = false;
  PiIntegration: boolean = false;
  PiServer: string = "";
  PiDatabase: string = "";
  PiLoginType: number = 0;
  PiUserName: string = "";
  PiPassword: string = "";
  PiDataStepRate: number = 1;
  PiDataCheckThreshold: number = 10;
}
