import axios, { AxiosResponse, AxiosInstance, AxiosError } from "axios";
import React, { ReactElement } from "react";

import { eVuMax } from "../Models/index";

const localUser = "admin"; // "vmx_admin"; //"ETECHPC1\\ETECH-PC-2";
const Port = "http://localhost:49489";
const ServiceName = "/eVuMax.asmx";
const getData = "/getData";
const performTask = "/performTask";

export function CallBackResponse(pResponse: BrokerResponse): BrokerResponse {
  return pResponse;
}

export class Util {
  static UserId: string = localUser;
  static getDataURL: string = Port + ServiceName + getData;
  static performTaskURL: string = Port + ServiceName + performTask;

  /**
   *
   * @param {number} pMilisecond  - Miliseconds
   * @returns
   */
  public static Sleep(pMilisecond: number) {
    return new Promise((resolve) => setTimeout(resolve, pMilisecond));
  }

  /**
   *
   * @param pMessage : Display Info Text
   */

  static async StatusInfo(pMessage: string) {
    let divElement: HTMLDivElement = document.getElementById(
      "statusText"
    ) as HTMLDivElement;

    let spanElement: HTMLSpanElement = document.getElementById(
      "statuIcon"
    ) as HTMLSpanElement;

    spanElement.classList.remove(
      "process-dual-ring",
      "icon-error-circle",
      "icon-success-circle",
      "icon-ready"
    );

    if (!divElement.classList.contains("loadingStatus")) {
      divElement.classList.add("loadingStatus");
    }
    if (!spanElement.classList.contains("process-dual-ring")) {
      spanElement.classList.add("process-dual-ring");
    }

    divElement.innerText = "Please wait, connecting to the server  ";
    await Util.Sleep(1000);
    divElement.innerText = pMessage;

    await Util.Sleep(1000);
  }

  static async StatusReady() {
    await Util.Sleep(10000);
    let divElement: HTMLDivElement = document.getElementById(
      "statusText"
    ) as HTMLDivElement;

    let spanElement: HTMLSpanElement = document.getElementById(
      "statuIcon"
    ) as HTMLSpanElement;

    if (spanElement != null && spanElement != undefined) {  //12-10-2021
      spanElement.classList.remove(
        "process-dual-ring",
        "icon-error-circle",
        "icon-success-circle"
      );
    }


    if (divElement.classList.contains("loadingStatus")) {
      divElement.classList.remove("loadingStatus");
    }
    if (!spanElement.classList.contains("icon-ready")) {
      spanElement.classList.add("icon-ready");
    }

    divElement.innerText = "Ready ";
  }

  /**
   *
   * @param pMessage : Display Error Text
   */

  static async StatusError(pMessage: string) {
    await Util.Sleep(1000);

    let divElement: HTMLDivElement = document.getElementById(
      "statusText"
    ) as HTMLDivElement;

    let spanElement: HTMLSpanElement = document.getElementById(
      "statuIcon"
    ) as HTMLSpanElement;

    if (pMessage !== undefined) {
      divElement.innerText = pMessage.replace(/(\r\n|\n|\r)/gm, "");
    } else {
      divElement.innerText = "Internal error";
    }

    if (spanElement.classList.contains("process-dual-ring")) {
      spanElement.classList.remove("process-dual-ring");
    }
    if (spanElement.classList.contains("process-dual-ring")) {
      spanElement.classList.remove("icon-ready");
    }
    if (!spanElement.classList.contains("icon-error-circle")) {
      spanElement.classList.add("icon-error-circle");
    }
    if (divElement.classList.contains("loadingStatus")) {
      divElement.classList.remove("loadingStatus");
    }
  }

  /**
   *
   * @param pMessage - Display Success Text
   */

  static async StatusSuccess(pMessage: string) {
    await Util.Sleep(1000);

    let divElement: HTMLDivElement = document.getElementById(
      "statusText"
    ) as HTMLDivElement;

    let spanElement: HTMLSpanElement = document.getElementById(
      "statuIcon"
    ) as HTMLSpanElement;

    divElement.innerText = pMessage.replace(/(\r\n|\n|\r)/gm, "");

    if (spanElement.classList.contains("process-dual-ring")) {
      //Success
      spanElement.classList.remove("process-dual-ring");
    }
    if (spanElement.classList.contains("icon-ready")) {
      spanElement.classList.remove("icon-ready");
    }
    if (!spanElement.classList.contains("icon-success-circle")) {
      spanElement.classList.add("icon-success-circle");
    }
    if (divElement.classList.contains("loadingStatus")) {
      divElement.classList.remove("loadingStatus");
    }
  }
}

export class HTMLStructure {
  type: string;
  textContent: string; // value of inside tag <h1>hello</h1>
  props: Object; // html attributes
  children: Array<HTMLStructure>; // child elements
}

export class DynamicHTML {
  /**
   *
   * @param pHTMLString
   */
  static parseHTMlDocument(pHTMLString: string): Array<HTMLStructure> {
    try {
      const parsedDoc: HTMLDocument = new DOMParser().parseFromString(
        pHTMLString,
        "text/html"
      );

      return this.mapHTMLBody(parsedDoc);
    } catch (error) { }
  }

  /**
   *
   * @param pHTMLDoc
   */
  static mapHTMLBody(pHTMLDoc: HTMLDocument): Array<HTMLStructure> {
    try {
      if (pHTMLDoc.body.hasChildNodes()) {
        // childNodes found
        let _htmlElement: HTMLElement = pHTMLDoc.body;
        let objHTMLStructure = new Array<HTMLStructure>();
        this.mapHTMLNodes(_htmlElement, objHTMLStructure);
        return objHTMLStructure;
        // renderElements();
      } else {
        // No childnodes found
      }
    } catch (error) {
      Util.StatusError(error.message);
    }
  }
  /**
   *
   * @param pHTMLElement
   */
  static mapHTMLNodes(
    pHTMLElement: HTMLElement,
    pHTMLStructure: Array<HTMLStructure>
  ): void {
    try {
      pHTMLElement.childNodes.forEach((_element: HTMLElement) => {
        let objStructure = new HTMLStructure();
        objStructure.type = _element.tagName;
        objStructure.props = {};
        objStructure.children = new Array<HTMLStructure>();

        if (_element.hasAttributes()) {
          for (let i = 0; i < _element.attributes.length; i++) {
            let _nodeName: string = _element.attributes[i].nodeName;
            let _nodeValue: string = _element.attributes[i].nodeValue;

            switch ([_nodeName].toString()) {
              case "style":
                objStructure.props["style"] = this.prepareStyle(_nodeValue);
                break;
              case "id":
                objStructure.props["key"] = _nodeValue;
                break;
              case "class":
                objStructure.props["className"] = _nodeValue;
                break;

              default:
                objStructure.props[_nodeName] = _nodeValue;
                break;
            }
          }
        }
        if (_element.children.length) {
          let _children = new Array<HTMLStructure>();
          _children = this.mapChildNodes(_element.childNodes);
          if (_children.length) {
            objStructure.children = _children;
          }
        } else {
          objStructure.textContent = _element.textContent;
        }

        pHTMLStructure.push(objStructure);
      });
    } catch (error) { }
  }
  /**
   *
   * @param _element - List of Nodes
   * @returns
   */
  static mapChildNodes(_element: NodeListOf<ChildNode>): Array<HTMLStructure> {
    try {
      let objHTMLStructure = new Array<HTMLStructure>();
      Array.from(_element).forEach((node: HTMLElement, i: number) => {
        let objStructure = new HTMLStructure();
        objStructure.type = node.tagName;
        objStructure.props = new Array<Object>();
        objStructure.children = new Array<HTMLStructure>();

        if (node.nodeName === "#text") {
          return;
        }

        if (node.hasAttributes()) {
          for (let i = 0; i < node.attributes.length; i++) {
            let _nodeName: string = node.attributes[i].nodeName;
            let _nodeValue: string = node.attributes[i].nodeValue;

            switch ([_nodeName].toString()) {
              case "style":
                objStructure.props["style"] = this.prepareStyle(_nodeValue);
                break;
              case "id":
                objStructure.props["key"] = _nodeValue;
                break;
              case "class":
                objStructure.props["className"] = _nodeValue;
                break;

              default:
                objStructure.props[_nodeName] = _nodeValue;
                break;
            }
          }
        }
        if (node.children.length) {
          let _children = new Array<HTMLStructure>();
          _children = this.mapChildNodes(node.childNodes);

          if (_children.length > 0) {
            objStructure.children = _children;
          }
        } else {
          objStructure.textContent = node.textContent;
        }

        objHTMLStructure.push(objStructure);
      });

      return objHTMLStructure;
    } catch (error) { }
  }
  /**
   *
   * @param pStyleString : Style Property as a string
   * @returns
   */
  static prepareStyle(pStyleString: string): object {
    try {
      let entries = pStyleString.split(";"),
        tempProps = {},
        params = [];
      for (let entry in entries) {
        params = entries[entry].split(":");
        while (params[0].indexOf("-") > -1) {
          if (true || params[0].indexOf("-") > 0) {
            params[0] = params[0].split("");
            params[0][params[0].indexOf("-") + 1] =
              params[0][params[0].indexOf("-") + 1].toUpperCase();
            params[0] = params[0].join("");
          }
          params[0] = params[0].replace("-", "");
        }
        tempProps[params[0]] = params[1];
      }
      return tempProps;
    } catch (error) { }
  }

  /**
   *
   * @param _pHTMLStructure
   * @returns
   */
  static createReactElement = (
    _pHTMLStructure: Array<HTMLStructure>
  ): React.DOMElement<Object, Element>[] => {
    try {
      let elements = _pHTMLStructure.map((val, i: number) => {
        return React.createElement(
          val.type.toLowerCase(),
          val.props,
          val.children.map((x) => DynamicHTML.createReactChildElement(x)),
          val.textContent
        );
      });
      console.log(elements);

      DynamicHTML.removeChildElement(elements);
      return elements;
    } catch (error) {
      Util.StatusError(error.message);
    }
  };

  static removeChildElement = (
    pReactElement: React.DOMElement<Object, Element>[]
  ): React.DOMElement<Object, Element>[] => {
    try {
      const _elements = pReactElement.map((e: ReactElement, i: number) => {
        if (e.type === "input") {
          e.props.children = [];
        }

      });
      return _elements as unknown as React.DOMElement<Object, Element>[];
    } catch (error) { }
  };

  /**
   *
   * @param _childElement
   * @returns
   */
  static createReactChildElement = (
    _childElement: HTMLStructure
  ): React.DOMElement<Object, Element> => {
    try {
      if (_childElement.type.toLowerCase() === "input") {

        return React.createElement(
          _childElement.type.toLowerCase(),
          _childElement.props,
          [],
          _childElement.textContent
        );
      } else {

        return React.createElement(
          _childElement.type.toLowerCase(),
          _childElement.props,
          _childElement.children.map((x) =>
            DynamicHTML.createReactChildElement(x)
          ),
          _childElement.textContent
        );
      }
    } catch (error) {
      Util.StatusError(error.message);
    }
  };
}

export class Attachment implements eVuMax.IAttachment {
  Id = "";
  Type = 0;
  Notes = "";
  fileName = "";
  fileType = "";
  fileSize = 0;
  arryBytes = [];
  attachment = "";

  _promise_Add(): Promise<BrokerResponse> {
    try {
      let objBrokerRequest = new BrokerRequest();

      objBrokerRequest.Module = "AttachmentManager";
      objBrokerRequest.Function = "Add";
      objBrokerRequest.Broker = "performTask";
      objBrokerRequest.Parameters.push(
        new BrokerParameter("Add", JSON.stringify(this))
      );

      return new BrokerFactory().promisePerformTask(objBrokerRequest);
    } catch (error) { }
  }

  Add(): BrokerResponse {
    try {
      let objBrokerRequest = new BrokerRequest();

      objBrokerRequest.Module = "AttachmentManager";
      objBrokerRequest.Function = "Add";
      objBrokerRequest.Broker = "performTask";
      objBrokerRequest.Parameters.push(
        new BrokerParameter("Add", JSON.stringify(this))
      );

      return objBrokerRequest.performTask(objBrokerRequest);
    } catch (error) { }
  }

  _promise_getList(): Promise<BrokerResponse> {
    let objBrokerRequest = new BrokerRequest();
    objBrokerRequest.Module = "AttachmentManager";
    objBrokerRequest.Function = "GetList";
    objBrokerRequest.Broker = "getData";

    return new BrokerFactory().promiseGetData(objBrokerRequest);
  }

  _async_getList(): Promise<BrokerResponse> {
    let objBrokerRequest = new BrokerRequest();
    objBrokerRequest.Module = "AttachmentManager";
    objBrokerRequest.Function = "GetList";
    objBrokerRequest.Broker = "getData";

    return new BrokerFactory().asyncGetData(objBrokerRequest);
  }
}

export class BrokerParameter implements eVuMax.IBrokerParameter {
  constructor(pName: string, pValue: string) {
    this.ParamName = pName;
    this.ParamValue = pValue;
  }
  ParamName: string;
  ParamValue: string;
}

export class BrokerResponse implements eVuMax.IBrokerResponse {
  RequestId = "";
  Module = "";
  Broker = "";
  Category = "";
  Response = "";
  RequestSuccessfull = false;
  Errors = "";
  ResponseTime!: Date | string;
}

export class BrokerRequest implements eVuMax.IBrokerRequest {
  RequestId = "";
  Module = ""; //Common
  Broker = ""; //Authentication
  Category = ""; //Blank
  Function = ""; //ValidateUser

  Parameters = [];
  RequestDateTime!: Date | string;

  _getDataByCallBack(
    pObj: BrokerRequest,
    calback: (BrokerResponse) => Promise<BrokerResponse>
  ): Promise<BrokerResponse> {
    try {
      return calback(pObj);
    } catch (error) { }
  }

  axiosCallback(pObj: BrokerRequest): Promise<BrokerResponse> {
    try {
      let obj = new BrokerResponse();

      pObj.Parameters.push(new BrokerParameter("UserName", Util.UserId));

      return axios
        .get(Util.getDataURL, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(pObj) },
        })
        .then((response: AxiosResponse<any>) => {
          obj = response.data as BrokerResponse;
          return obj;
        })
        .catch((error) => {
          if (error.response) {
          } else if (error.request) {
            console.log("error.request");
            return new BrokerResponse();
          } else {
            console.log("Error", error);
            return new BrokerResponse();
          }
        });

      // return obj;
    } catch (error) { }
  }

  performTask(pObj: BrokerRequest) {
    try {
      pObj.Parameters.push(new BrokerParameter("UserName", Util.UserId));

      axios
        .get(Util.performTaskURL, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(pObj) },
        })
        .then((res) => { })
        .catch((error) => {
          if (error.response) {
          } else if (error.request) {
            console.log("error.request");
          } else {
            console.log("Error", error);
          }
        });
    } catch (error) { }

    return new BrokerResponse();
  }
}

export class BrokerFactory implements eVuMax.IBrokerFactory {
  LastError: string = "";

  /**
   *
   * @param pError
   * @returns
   */
  private axiosErrorHandling(pError: AxiosError): BrokerResponse {
    try {
      let objBrokerResponse = new BrokerResponse();
      objBrokerResponse.RequestSuccessfull = false;

      if (pError.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        objBrokerResponse.Errors =
          pError.toString() +
          "/n" +
          pError.response.data +
          "/n" +
          pError.response.status +
          "/n" +
          pError.response.headers;
      } else if (pError.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        objBrokerResponse.Errors =
          pError.message.toString() +
          " Stack Error : " +
          pError.stack.toString();
      } else {
        // Something happened in setting up the request and triggered an Error
        objBrokerResponse.Errors = pError.message;
      }
      return objBrokerResponse;

      // return {
      //   RequestSuccessfull: false,
      //   Errors: error.message + " : " + error.response.data,
      // } as BrokerResponse;
    } catch (error) {
      console.log(console.log(error));
    }
  }

  /**
   *
   * @param pBrokerRequest
   * @returns
   */
  private axiosInstance(pBrokerRequest: BrokerRequest): AxiosInstance {
    try {
      pBrokerRequest.Parameters.push(
        new BrokerParameter("UserName", Util.UserId)
      );
      return axios.create({
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
        params: { paramRequest: JSON.stringify(pBrokerRequest) },
      });
    } catch (error) { }
  }

  /**
   *
   * @param pBrokerRequest
   * @returns
   */
  promiseGetData(pBrokerRequest: BrokerRequest): Promise<BrokerResponse> {
    try {
      return this.axiosInstance(pBrokerRequest)
        .get(Util.getDataURL)
        .then((response: AxiosResponse<any>) => response.data as BrokerResponse)
        .catch((error: AxiosError<any>) => {
          return this.axiosErrorHandling(error);
        });
    } catch (error) {
      this.LastError = error;
    }
  }

  /**
   *
   * @param pBrokerRequest
   * @returns
   */
  promisePerformTask(pBrokerRequest: BrokerRequest): Promise<BrokerResponse> {
    try {
      return this.axiosInstance(pBrokerRequest)
        .get(Util.performTaskURL)
        .then((response: AxiosResponse<any>) => response.data as BrokerResponse)
        .catch((error: AxiosError<any>) => {
          return this.axiosErrorHandling(error);
        });
    } catch (error) {
      this.LastError = error;
    }
  }

  /**
   *
   * @param pBrokerRequest
   * @returns
   */
  async asyncGetData(pBrokerRequest: BrokerRequest): Promise<BrokerResponse> {
    try {
      return await this.axiosInstance(pBrokerRequest)
        .get(Util.getDataURL)
        .then((response: AxiosResponse<any>) => response.data as BrokerResponse)
        .catch((error: AxiosError<any>) => {
          return this.axiosErrorHandling(error);
        });
    } catch (error) { }
  }

  /**
   *
   * @param pBrokerRequest
   * @returns
   */
  async asyncPerformTask(
    pBrokerRequest: BrokerRequest
  ): Promise<BrokerResponse> {
    try {
      return await this.axiosInstance(pBrokerRequest)
        .get(Util.performTaskURL)
        .then((response: AxiosResponse<any>) => response.data as BrokerResponse)
        .catch((error: AxiosError<any>) => {
          return this.axiosErrorHandling(error);
        });
    } catch (error) { }
  }
}
