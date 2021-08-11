export declare namespace eVuMax {
  export interface IAttachment {
    Id: string;
    Type: number;
    Notes: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    arryBytes: any[];
    attachment: string | ArrayBuffer;
  }

  export interface IBrokerFactory {
    // getData(pObj: IBrokerRequest): IBrokerResponse;
    // performTask(pObl: IBrokerRequest): IBrokerResponse;

    asyncGetData(pObj: IBrokerRequest): Promise<IBrokerResponse>;
    asyncPerformTask(pObl: IBrokerRequest): Promise<IBrokerResponse>;

    promiseGetData(pObj: IBrokerRequest): Promise<IBrokerResponse>;
    promisePerformTask(pObl: IBrokerRequest): Promise<IBrokerResponse>;

    // callbacksGetData(pObj: IBrokerRequest): IBrokerResponse;
    // callbacksPerformTask(pObl: IBrokerRequest): IBrokerResponse;
  }

  export interface IBrokerResponse {
    RequestId: string;
    Module: string;
    Broker: string;
    Category: string;
    Response: string;
    RequestSuccessfull: boolean;
    Errors: string;
    ResponseTime: Date | string;
  }

  export interface IBrokerRequest {
    RequestId: string;
    Module: string; //Common
    Broker: string; //Authentication
    Category: string; //Blank
    Function: string; //ValidateUser
    Parameters: IBrokerParameter[];
    RequestDateTime: Date | string;
  }

  export interface IBrokerParameter {
    ParamName: string;
    ParamValue: string;
  }

  export interface ICallbackResponse {
    (response: IBrokerResponse): void;
  }

  /**
   * Chart
   */

  //#region  Chart

  export enum lineStyle {
    solid = 0,
    dashed = 1,
    dot = 2,
    dashDot = 3,
  }

  export enum curveStyle {
    none = 0,
    smooth = 1,
    step = 2,
  }

  //prath 04-12-2020 for ZOOM-CHART
  export enum zoomOnAxies {
    both = 0,
    x = 1,
    y = 2,
  }

  export interface IChart {}

  export interface ChartMargin {
    Top: number;
    Bottom: number;
    Left: number;
    Right: number;
  }

  //#endregion
}
