//line 1196 for remove errors related to NAN of rect in axes (await)
//zoom Ref
//http://bl.ocks.org/stefan505/64137471af975e27ab62d82a4af7db36
//https://www.d3-graph-gallery.com/graph/line_brushZoom.html
//https://bl.ocks.org/mmazanec22/586ee6674f52840492c16cc194aacb1f
//http://bl.ocks.org/stepheneb/1182434
//Scrolling Ref Site follows
//https://stackoverflow.com/questions/47618507/creating-an-endless-horizontal-axis-with-d3-v4
//https://stackoverflow.com/questions/24653471/right-click-on-a-d3-js-element-how-to-prevent-browser-context-menu-to-appear
//http://bl.ocks.org/eyaler/10586116
//https://github.com/d3/d3-zoom/issues/91

import { ChartData } from "../Chart/ChartData";
import { Axis, axisPosition, axisLabelStyle } from "../Chart/Axis";
import { DataSeries, dataSeriesType, pointStyle } from "../Chart/DataSeries";
import { Guid } from "guid-typescript";
import { StackedBarSeries } from "../Chart/StackedBarSeries";
import { LineSeries } from "../Chart/LineSeries";
import { AreaSeries } from "../Chart/AreaSeries";
import { ChartRectangle } from "../Chart/ChartRectangle";
import * as d3 from "d3";
import $ from "jquery";
import { EventDispatcher } from "strongly-typed-events";
import { ChartMouseEvtArgs } from "../Chart/chartMouseEvtArgs";
import { ChartEventArgs } from "../Chart/ChartEventArgs";
import "./Chart.css";
import { forEach } from "typescript-collections/dist/lib/arrays";
import { PieSeries } from "./PieSeries"; //prath 01-10-2020
import { PointSeries } from "./PointSeries"; //prath 01-10-2020

import { BarSeries } from "../Chart/BarSeries";
import { ZoomStep } from "./ZoomSteps";
import { faAssistiveListeningSystems, faLeaf } from "@fortawesome/free-solid-svg-icons";

import { AxisRange, AxisDateRange } from "../Chart/AxisRange";
import { ClientLogger } from "../../components/ClientLogger/ClientLogger";

export enum lineStyle {
  solid = 0,
  dashed = 1,
  dot = 2,
  dashDot = 3,
}

export enum curveStyle {
  smooth = 0,
  step = 1,
  normal = 2,
}

//prath 04-12-2020 for ZOOM-CHART
export enum zoomOnAxies {
  both = 0,
  x = 1,
  y = 2,
}

export class Chart {
  //prath 01-10-2020  (added para isPie in constructor for Pie Chart)
  constructor(parentRef, chartId, isPie?: boolean) {
    try {
      this.__parentRef = parentRef;
      if (this.__parentRef.objLogger != undefined) {
        this.objLogger = this.__parentRef.objLogger;
        //this.objLogger.SendLog("CHART constructor : " + chartId);
      } else {
        this.objLogger = new ClientLogger("Chart", "NA");
      }

      this.Id = chartId;
      //prath 01-10-2020  (added para isPie in constructor for Pie Chart)
      if (!isPie) {
        this.createDefaultAxes();
      }
    } catch (error) {
      this.objLogger.SendLog("CHART-constructor : " + chartId);
    }
  }
  objLogger: ClientLogger;
  Id: string = "";
  Name: string = "";
  BackgroundColor: string = "inherit";
  ContainerId: string = ""; //This is where the chart component will be rendered
  DataSeries: Map<string, DataSeries> = new Map();
  Axes: Map<string, Axis> = new Map<string, Axis>();

  ScaleBackup: Map<string, any> = new Map<string, any>();

  MarginTop: number = 0;
  MarginLeft: number = 0;
  MarginBottom: number = 10;
  MarginRight: number = 10;
  Title: string = ""; //prath 01-10-2020
  CrossHairRequire: boolean = false;

  AbsoluteLeftEdge: number = 0;
  //Internal references
  Height: number = 0;
  Width: number = 0;

  //External references
  SVGRef: any;
  CanvasRef: any;
  CanvasContext: any;

  //ZOOM-CHART
  SVGRect: any; //Its a Chart Plot area Rectangle
  ZoomOnAxies: zoomOnAxies = zoomOnAxies.both;
  zoom: any;

  ZoomSteps: Map<number, ZoomStep[]> = new Map();

  ZoomFamilyId: string = ""; //12-11-2021 prath  Group Id for Multiple Chart Zoom at same Time
  ZoomFamily: Map<string, ZoomStep[]> = new Map(); //12-11-2021 prath Group of List of Chart Zooming at a time
  ScrollFamilyId: string = ""; //12-11-2021 prath Group Id for Multiple Chart Scroll at same Time
  ScrollFamily: Map<string, ZoomStep[]> = new Map(); //12-11-2021 prath Group of List of Chart Scrolling at a time

  isZoomByRect: boolean = true;
  //isZoomByRect: boolean = false;

  //Scrolling
  scroll: any;
  isScrollingInProgress: boolean = false;

  ScrollingScale: Map<string, any> = new Map<string, any>();

  ShowCustomComments: boolean = false; //prath 04-08-2021
  ShowLegend: boolean = true; //27-08-2021
  LegendPosition: number = -1; // 1 (left), 2 (right), 3 (top), 4 (bottom)
  //#region
  __parentRef: any;

  //Axes placements
  axisPerColumn: number = 1;
  axisPerRow: number = 1;

  __chartRect: ChartRectangle = new ChartRectangle();

  __lastButtonClicked: number = 0;

  //Tooltip element reference
  __toolTip: any;

  __mouseLastX: number;
  __mouseLastY: number;

  private _onSeriesMouseDown = new EventDispatcher<ChartMouseEvtArgs, number>();
  private _onSeriesMouseMove = new EventDispatcher<ChartMouseEvtArgs, number>();
  private _onSeriesMouseEnter = new EventDispatcher<
    ChartMouseEvtArgs,
    number
  >();
  private _onSeriesMouseLeave = new EventDispatcher<
    ChartMouseEvtArgs,
    number
  >();
  private _onSeriesMouseUp = new EventDispatcher<ChartMouseEvtArgs, number>();
  private _onSeriesMouseClick = new EventDispatcher<
    ChartMouseEvtArgs,
    number
  >();
  private _onBeforeSeriesDraw = new EventDispatcher<ChartEventArgs, number>();
  private _onAfterSeriesDraw = new EventDispatcher<ChartEventArgs, number>();
  private _onBeforeAxisDraw = new EventDispatcher<ChartEventArgs, number>();
  private _onAfterAxisDraw = new EventDispatcher<ChartEventArgs, number>();
  private _onMouseDown = new EventDispatcher<ChartMouseEvtArgs, number>();
  private _onMouseUp = new EventDispatcher<ChartMouseEvtArgs, number>();
  private _onMouseMove = new EventDispatcher<ChartMouseEvtArgs, number>();

  get onMouseMove() {
    return this._onMouseMove.asEvent();
  }

  get onMouseUp() {
    return this._onMouseUp.asEvent();
  }

  get onMouseDown() {
    return this._onMouseDown.asEvent();
  }

  get onAfterAxisDraw() {
    return this._onAfterAxisDraw.asEvent();
  }

  get onBeforeAxisDraw() {
    return this._onBeforeAxisDraw.asEvent();
  }

  get onSeriesMouseDown() {
    return this._onSeriesMouseDown.asEvent();
  }

  get onSeriesMouseMove() {
    return this._onSeriesMouseMove.asEvent();
  }

  get onSeriesMouseEnter() {
    return this._onSeriesMouseEnter.asEvent();
  }

  get onSeriesMouseLeave() {
    return this._onSeriesMouseLeave.asEvent();
  }

  get onSeriesMouseUp() {
    return this._onSeriesMouseUp.asEvent();
  }

  get onSeriesMouseClick() {
    return this._onSeriesMouseClick.asEvent();
  }

  get onBeforeSeriesDraw() {
    return this._onBeforeSeriesDraw.asEvent();
  }

  get onAfterSeriesDraw() {
    return this._onAfterSeriesDraw.asEvent();
  }

  raiseSeriesMouseDownEvent = (source: any, index: any, button: number) => {
    try {
      let objMouseArgs = new ChartMouseEvtArgs();
      objMouseArgs.seriesId = source;
      objMouseArgs.index = index;
      objMouseArgs.button = button;

      this._onSeriesMouseDown.dispatchAsync(objMouseArgs, index);
    } catch (error) { }
  };

  leftAxis = (): Axis => {
    try {
      if (this.Axes.get(this.Id + "-left") == undefined) {
        return null;
      } else {
        return this.Axes.get(this.Id + "-left");
      }
    } catch (error) {
      return null;
    }
  };

  removeLeftAxis = () => {
    try {
      if (this.Axes.get(this.Id + "-left") != null) {
        this.Axes.delete(this.Id + "-left");
      }
    } catch (error) { }
  };

  removeRightAxis = () => {
    try {
      if (this.Axes.get(this.Id + "-right") != null) {
        this.Axes.delete(this.Id + "-right");
      }
    } catch (error) { }
  };

  bottomAxis = (): Axis => {
    try {
      if (this.Axes.get(this.Id + "-bottom") == undefined) {
        return null;
      } else {
        return this.Axes.get(this.Id + "-bottom");
      }
    } catch (error) {
      return null;
    }
  };

  rightAxis = (): Axis => {
    try {
      if (this.Axes.get(this.Id + "-right") == undefined) {
        return null;
      } else {
        return this.Axes.get(this.Id + "-right");
      }
    } catch (error) {
      return null;
    }
  };

  topAxis = (): Axis => {
    try {
      if (this.Axes.get(this.Id + "-top") == undefined) {
        return null;
      } else {
        return this.Axes.get(this.Id + "-top");
      }
    } catch (error) {
      return null;
    }
  };

  //#endregion

  resetSelector = () => {
    try {
      for (let key of this.Axes.keys()) {
        this.Axes.get(key).__selectorEndDatePos = null;
        this.Axes.get(key).__selectorStartDatePos = null;
      }
    } catch (error) { }
  };

  createDefaultAxes = () => {
    try {


      if (this.Axes.get(this.Id + "-left") == undefined) {
        //Create default left axis

        let objLeftAxis = new Axis();
        objLeftAxis.Id = this.Id + "-left";
        objLeftAxis.Position = axisPosition.left;
        objLeftAxis.GridVisible = true;
        objLeftAxis.MinorGridVisible = false;
        objLeftAxis.AutoScale = false;
        objLeftAxis.Min = 0;
        objLeftAxis.Max = 100;
        objLeftAxis.Visible = true;
        objLeftAxis.ChartRef = this;

        this.Axes.set(this.Id + "-left", objLeftAxis);
      }

      if (this.Axes.get(this.Id + "-bottom") == undefined) {
        //Create default bottom axis

        let objBottomAxis = new Axis();
        objBottomAxis.Id = this.Id + "-bottom";
        objBottomAxis.Position = axisPosition.bottom;
        objBottomAxis.GridVisible = true;
        objBottomAxis.MinorGridVisible = false;
        objBottomAxis.AutoScale = false;
        objBottomAxis.Min = 0;
        objBottomAxis.Max = 100;
        objBottomAxis.Visible = true;
        objBottomAxis.ChartRef = this;

        this.Axes.set(this.Id + "-bottom", objBottomAxis);
      }

      if (this.Axes.get(this.Id + "-right") == undefined) {
        //Create default right axis

        let objRightAxis = new Axis();
        objRightAxis.Id = this.Id + "-right";
        objRightAxis.Position = axisPosition.right;
        objRightAxis.GridVisible = false;
        objRightAxis.MinorGridVisible = false;
        objRightAxis.AutoScale = false;
        objRightAxis.Visible = false;
        objRightAxis.Min = 0;
        objRightAxis.Max = 100;
        objRightAxis.ChartRef = this;

        this.Axes.set(this.Id + "-right", objRightAxis);
        
      }

      //23-10-2020 (ADDED) for TripSpeed1  PRATH
      if (this.Axes.get(this.Id + "-top") == undefined) {
        //Create default bottom axis

        let objTopAxis = new Axis();
        objTopAxis.Id = this.Id + "-top";
        objTopAxis.Position = axisPosition.top;
        objTopAxis.GridVisible = true;
        objTopAxis.MinorGridVisible = false;
        objTopAxis.AutoScale = false;
        objTopAxis.Min = 0;
        objTopAxis.Max = 100;
        objTopAxis.ChartRef = this;

        this.Axes.set(this.Id + "-top", objTopAxis);
      }
    } catch (error) { }
  };

  createAxes = () => {
    try {
      
      for (let key of this.Axes.keys()) {
        let objAxis: Axis = this.Axes.get(key);
        
        //

        if (objAxis.Visible) {
          objAxis.createAxis(this);
        }
      }
    } catch (error) { }
  };

  getAxisByID = (axisId: string) => {
    try {
      for (let key of this.Axes.keys()) {
        if (this.Axes.get(key).Id == axisId) {
          return this.Axes.get(key);
        }
      }

      return null;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-getAxisByID : " + error);
      return null;
    }
  };

  getSelectorRange = () => {
    try {

      let objAxis = this.getAxisWithSelector();

      if (objAxis.IsDateTime) {
        return this.getSelectorDateRange();
      } else {
        return this.getSelectorNumericRange();
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-getSelectorRange : " + error);
      return null;
    }
  };

  getSelectorNumericRange = () => {
    try {
      if (!this.hasSelector) {
        return null;
      }

      let objAxis = this.getAxisWithSelector();

      if (objAxis == null) {
        return null;
      }
      return {
        start: objAxis.__selectorStartPos,
        end: objAxis.__selectorEndPos,
      };
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-getSelectorNumericRange : " + error);
      return null;
    }
  };

  getSelectorDateRange = () => {
    try {
      if (!this.hasSelector) {
        return null;
      }

      let objAxis = this.getAxisWithSelector();

      if (objAxis == null) {
        return null;
      }
      return {
        startDate: objAxis.__selectorStartDatePos,
        endDate: objAxis.__selectorEndDatePos,
      };
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-getSelectorDateRange : " + error);
      return null;
    }
  };

  setSelectorRange = (startVal: number, endVal: number) => {
    try {
      if (!this.hasSelector) {
        return null;
      }

      let objAxis = this.getAxisWithSelector();

      if (objAxis == null) {
        return null;
      }

      objAxis.__selectorStartPos = startVal;
      objAxis.__selectorEndPos = endVal;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-setSelectorRange : " + error);

    }
  };

  setSelectorDateRange = (startDate: Date, endDate: Date) => {
    try {
      if (!this.hasSelector) {
        return null;
      }

      let objAxis = this.getAxisWithSelector();

      if (objAxis == null) {
        return null;
      }

      objAxis.__selectorStartDatePos = startDate;
      objAxis.__selectorEndDatePos = endDate;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-setSelectorDateRange : " + error);
    }
  };

  updateAxes = () => {
    try {
      this.calculateAxesPositions();

      //Assuming that all the data have been inserted into all data series,
      //this function will re-calculate everything
        
        

      for (let key of this.Axes.keys()) {
        // if (key == "SelectorChart-bottom") {
        //   
        // }
        //alert(key);

        let objAxis: Axis = this.Axes.get(key);
        //console.log(objAxis.Id);
        

        objAxis.updateAxis();

      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-updateAxes : " + error);
    }
  };

  calculateAxesPositions = () => {
    try {
      //Initialize chart rectangle
      this.__chartRect.left = this.MarginLeft;
      this.__chartRect.top = this.MarginTop;
      this.__chartRect.right = this.Width - this.MarginRight;
      this.__chartRect.bottom = this.Height - this.MarginBottom;

      if (this.axisPerColumn < 1) {
        this.axisPerColumn = 1;
      }

      if (this.axisPerRow < 1) {
        this.axisPerRow = 1;
      }

      //First calculate widths of the axis
      //Ths width will be stored in the axis itself
      for (let objAxis of this.Axes.values()) {
        objAxis.calculateAxisWidth();
      }

      //now we have to arrange the axes
      //Left axes
      let arrLeftAxes: Axis[] = Array.from(this.Axes.values()).filter(
        (x) => x.Position == axisPosition.left
      );

      if (arrLeftAxes.length > 1) {
        arrLeftAxes = arrLeftAxes.sort((obj1, obj2) => {
          if (obj1.DisplayOrder > obj2.DisplayOrder) {
            return 1;
          }

          if (obj1.DisplayOrder < obj2.DisplayOrder) {
            return -1;
          }

          return 0;
        });
      }

      let relativePosCounter: number = 0;
      let maxAxisWidth: number = 0;

      for (let i = 0; i < arrLeftAxes.length; i++) {
        if (arrLeftAxes[i].__axisWidth > maxAxisWidth) {
          maxAxisWidth = arrLeftAxes[i].__axisWidth;
        }
      }

      //Add left margin
      relativePosCounter = this.MarginLeft;

      //plus add axis width
      relativePosCounter = relativePosCounter + maxAxisWidth;

      let axisCounter = 0;

      //First we are calculating axis widths
      for (let i = 0; i < arrLeftAxes.length; i++) {
        if (axisCounter >= this.axisPerColumn) {
          //Increase the relative position
          relativePosCounter = relativePosCounter + maxAxisWidth;
        }

        let objAxis: Axis = arrLeftAxes[i];
        objAxis.IRelativePos = relativePosCounter;
        this.__chartRect.left = relativePosCounter;
        axisCounter++;
      }

      //Bottom axes
      let arrBottomAxes: Axis[] = Array.from(this.Axes.values()).filter(
        (x) => x.Position == axisPosition.bottom
      );

      if (arrBottomAxes.length > 1) {
        arrBottomAxes = arrBottomAxes.sort((obj1, obj2) => {
          if (obj1.DisplayOrder > obj2.DisplayOrder) {
            return 1;
          }

          if (obj1.DisplayOrder < obj2.DisplayOrder) {
            return -1;
          }

          return 0;
        });
      }

      relativePosCounter = 0;
      maxAxisWidth = 0;

      for (let i = 0; i < arrBottomAxes.length; i++) {
        if (arrBottomAxes[i].__axisWidth > maxAxisWidth) {
          maxAxisWidth = arrBottomAxes[i].__axisWidth;
        }
      }

      //Add left margin
      //relativePosCounter = this.Height - this.MarginBottom;
      relativePosCounter = this.Height - this.MarginBottom;

      //plus add axis width
      relativePosCounter = relativePosCounter - maxAxisWidth;

      axisCounter = 0;

      //First we are calculating axis widths
      for (let i = 0; i < arrBottomAxes.length; i++) {
        if (axisCounter >= this.axisPerRow) {
          //Increase the relative position
          relativePosCounter = relativePosCounter - maxAxisWidth;
        }

        let objAxis: Axis = arrBottomAxes[i];
        objAxis.IRelativePos = relativePosCounter;
        this.__chartRect.bottom = relativePosCounter;
        axisCounter++;
      }

      //Right axes
      let arrRightAxes: Axis[] = Array.from(this.Axes.values()).filter(
        (x) => x.Position == axisPosition.right
      );

      if (arrRightAxes.length > 1) {
        arrRightAxes = arrRightAxes.sort((obj1, obj2) => {
          if (obj1.DisplayOrder > obj2.DisplayOrder) {
            return 1;
          }

          if (obj1.DisplayOrder < obj2.DisplayOrder) {
            return -1;
          }

          return 0;
        });
      }

      relativePosCounter = 0;
      maxAxisWidth = 0;

      for (let i = 0; i < arrRightAxes.length; i++) {
        if (arrRightAxes[i].__axisWidth > maxAxisWidth) {
          maxAxisWidth = arrRightAxes[i].__axisWidth;
        }
      }

      //Add left margin
      relativePosCounter = this.Width - this.MarginRight;

      //plus add axis width
      relativePosCounter = relativePosCounter - maxAxisWidth;

      axisCounter = 0;

      //First we are calculating axis widths
      for (let i = 0; i < arrRightAxes.length; i++) {
        if (axisCounter >= this.axisPerColumn) {
          //Increase the relative position
          relativePosCounter = relativePosCounter - maxAxisWidth;
        }

        let objAxis: Axis = arrRightAxes[i];
        objAxis.IRelativePos = relativePosCounter;
        this.__chartRect.right = relativePosCounter;
        axisCounter++;
      }

      //Top axes
      let arrTopAxes: Axis[] = Array.from(this.Axes.values()).filter(
        (x) => x.Position == axisPosition.top
      );

      if (arrTopAxes.length > 1) {
        arrTopAxes = arrTopAxes.sort((obj1, obj2) => {
          if (obj1.DisplayOrder > obj2.DisplayOrder) {
            return 1;
          }

          if (obj1.DisplayOrder < obj2.DisplayOrder) {
            return -1;
          }

          return 0;
        });
      }

      relativePosCounter = 0;
      maxAxisWidth = 0;

      for (let i = 0; i < arrTopAxes.length; i++) {
        if (arrTopAxes[i].__axisWidth > maxAxisWidth) {
          maxAxisWidth = arrTopAxes[i].__axisWidth;
        }
      }

      //Add left margin
      relativePosCounter = this.MarginTop;

      //plus add axis width
      relativePosCounter = relativePosCounter + maxAxisWidth;

      axisCounter = 0;

      //First we are calculating axis widths
      for (let i = 0; i < arrTopAxes.length; i++) {
        if (axisCounter >= this.axisPerRow) {
          //Increase the relative position
          relativePosCounter = relativePosCounter + maxAxisWidth;
        }

        let objAxis: Axis = arrTopAxes[i];
        objAxis.IRelativePos = relativePosCounter;
        this.__chartRect.top = relativePosCounter;
        axisCounter++;
      }

      //Update height and width of chart rectangle
      this.__chartRect.width = this.__chartRect.right - this.__chartRect.left;
      this.__chartRect.height = this.__chartRect.bottom - this.__chartRect.top;

      //Now calculate start and end positions of all axes
      this.calcAxesStartEndPos();
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-calculateAxesPositions : " + error);

    }
  };

  calcAxesStartEndPos = () => {
    try {
      //now we have to arrange the axes
      //Left axes
      
      let arrLeftAxes: Axis[] = Array.from(this.Axes.values()).filter(
        (x) => x.Position == axisPosition.left
      );

      if (arrLeftAxes.length > 1) {
        arrLeftAxes = arrLeftAxes.sort((obj1, obj2) => {
          
          if (obj1.DisplayOrder > obj2.DisplayOrder) {
            return 1;
          }

          if (obj1.DisplayOrder < obj2.DisplayOrder) {
            return -1;
          }

          return 0;
        });
      }

      let startPos = this.__chartRect.top;
      let axisCounter = 0;

      if (this.axisPerColumn <= 0) {
        this.axisPerColumn = 1;
      }

      let availableAxisSize = this.__chartRect.height;

      if (arrLeftAxes.length >= this.axisPerColumn) {
        availableAxisSize = this.__chartRect.height / this.axisPerColumn;
      } else {
        if (arrLeftAxes.length > 0) {
          availableAxisSize = this.__chartRect.height / arrLeftAxes.length;
        }
      }

      //First we are calculating axis widths
      for (let i = 0; i < arrLeftAxes.length; i++) {
        if (axisCounter >= this.axisPerColumn) {
          //Increase the relative position
          startPos = this.__chartRect.top;
        }

        let objAxis: Axis = arrLeftAxes[i];
        objAxis.StartPos = startPos + 8;
        objAxis.EndPos = startPos + availableAxisSize - 8;
        objAxis.__axisSize = objAxis.EndPos - objAxis.StartPos;
        axisCounter++;

        startPos = startPos + availableAxisSize;
      }

      //Bottom axes
      let arrBottomAxes: Axis[] = Array.from(this.Axes.values()).filter(
        (x) => x.Position == axisPosition.bottom
      );

      if (arrBottomAxes.length > 1) {
        arrBottomAxes = arrBottomAxes.sort((obj1, obj2) => {
          if (obj1.DisplayOrder > obj2.DisplayOrder) {
            return 1;
          }

          if (obj1.DisplayOrder < obj2.DisplayOrder) {
            return -1;
          }

          return 0;
        });
      }

      startPos = this.__chartRect.left;
      axisCounter = 0;

      if (this.axisPerRow <= 0) {
        this.axisPerRow = 1;
      }

      availableAxisSize = this.__chartRect.width;

      if (arrBottomAxes.length >= this.axisPerRow) {
        availableAxisSize = this.__chartRect.width / this.axisPerRow;
      } else {
        if (arrBottomAxes.length > 0) {
          availableAxisSize = this.__chartRect.width / arrBottomAxes.length;
        }
      }

      //First we are calculating axis widths
      for (let i = 0; i < arrBottomAxes.length; i++) {
        if (axisCounter >= this.axisPerRow) {
          //Increase the relative position
          startPos = this.__chartRect.left;
        }

        let objAxis: Axis = arrBottomAxes[i];
        objAxis.StartPos = startPos + 8;
        objAxis.EndPos = startPos + availableAxisSize - 8;
        objAxis.__axisSize = objAxis.EndPos - objAxis.StartPos;
        axisCounter++;

        startPos = startPos + availableAxisSize;
      }

      //Right axes
      let arrRightAxes: Axis[] = Array.from(this.Axes.values()).filter(
        (x) => x.Position == axisPosition.right
      );

      if (arrRightAxes.length > 1) {
        arrRightAxes = arrRightAxes.sort((obj1, obj2) => {
          if (obj1.DisplayOrder > obj2.DisplayOrder) {
            return 1;
          }

          if (obj1.DisplayOrder < obj2.DisplayOrder) {
            return -1;
          }

          return 0;
        });
      }

      startPos = this.__chartRect.top;
      axisCounter = 0;

      if (this.axisPerColumn <= 0) {
        this.axisPerColumn = 1;
      }

      availableAxisSize = this.__chartRect.height;

      if (arrRightAxes.length >= this.axisPerColumn) {
        availableAxisSize = this.__chartRect.height / this.axisPerColumn;
      } else {
        if (arrRightAxes.length > 0) {
          availableAxisSize = this.__chartRect.height / arrRightAxes.length;
        }
      }

      //First we are calculating axis widths
      for (let i = 0; i < arrRightAxes.length; i++) {
        if (axisCounter >= this.axisPerColumn) {
          //Increase the relative position
          startPos = this.__chartRect.top;
        }

        let objAxis: Axis = arrRightAxes[i];
        objAxis.StartPos = startPos + 8;
        objAxis.EndPos = startPos + availableAxisSize - 8;
        objAxis.__axisSize = objAxis.EndPos - objAxis.StartPos;
        axisCounter++;

        startPos = startPos + availableAxisSize;
      }

      //Top axes
      let arrTopAxes: Axis[] = Array.from(this.Axes.values()).filter(
        (x) => x.Position == axisPosition.top
      );

      if (arrTopAxes.length > 1) {
        arrTopAxes = arrTopAxes.sort((obj1, obj2) => {
          if (obj1.DisplayOrder > obj2.DisplayOrder) {
            return 1;
          }

          if (obj1.DisplayOrder < obj2.DisplayOrder) {
            return -1;
          }

          return 0;
        });
      }

      startPos = this.__chartRect.left;
      axisCounter = 0;

      if (this.axisPerRow <= 0) {
        this.axisPerRow = 1;
      }

      availableAxisSize = this.__chartRect.width;

      if (arrTopAxes.length >= this.axisPerRow) {
        availableAxisSize = this.__chartRect.width / this.axisPerRow;
      } else {
        if (arrTopAxes.length > 0) {
          availableAxisSize = this.__chartRect.width / arrTopAxes.length;
        }
      }

      //First we are calculating axis widths
      for (let i = 0; i < arrTopAxes.length; i++) {
        if (axisCounter >= this.axisPerRow) {
          //Increase the relative position
          startPos = this.__chartRect.left;
        }

        let objAxis: Axis = arrTopAxes[i];
        objAxis.StartPos = startPos + 8;
        objAxis.EndPos = startPos + availableAxisSize - 8;
        objAxis.__axisSize = objAxis.EndPos - objAxis.StartPos;
        axisCounter++;

        startPos = startPos + availableAxisSize;
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-calcAxesStartEndPos : " + error);

    }
  };

  calculateHeight = (pText: string, pFontName: string, pFontSize: string) => {
    try {
      //Check if height/width calculator is present in the document

      let element: any = $("#" + this.Id + "-calculator")[0];

      if (element == undefined || element == null) {
        element = $("#" + this.ContainerId).append(
          '<g><text class="tick" id="' + this.Id + '-calculator"></text></g>'
        );
      }

      $("#" + this.Id + "-calculator").show();
      $("#" + this.Id + "-calculator").html(pText);
      $("#" + this.Id + "-calculator").css("font-family", pFontName);
      $("#" + this.Id + "-calculator").css("display", "inline-block");

      let height = $("#" + this.Id + "-calculator").height();

      $("#" + this.Id + "-calculator").hide();

      if (height == undefined || height == null) {
        return 0;
      } else {
        return Number(height);
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-calculateHeight : " + error);
      return 0;
    }
  };

  calculateWidth = (pText: string, pFontName: string, pFontSize: string) => {
    try {
      //Check if height/width calculator is present in the document
      
      let element: any = $("#" + this.Id + "-calculator")[0];

      if (element == undefined || element == null) {
        element = $("#" + this.ContainerId).append(
          '<g><text class="tick" id="' + this.Id + '-calculator"></text></g>'
        );
      }

      $("#" + this.Id + "-calculator").show();
      $("#" + this.Id + "-calculator").html(pText);
      //console.log("LABEL PTAX --->", pText);

      $("#" + this.Id + "-calculator").css("font-family", pFontName);
      $("#" + this.Id + "-calculator").css("display", "inline-block");

      let width = $("#" + this.Id + "-calculator").width();
      $("#" + this.Id + "-calculator").hide();

      if (width == undefined || width == null) {
        return 0;
      } else {
        return Number(width);
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-calculateWidth : " + error);
      return 0;
    }
  };


  //For move on Canvas
  mouseMoveOnSvg = (d: any, i: any) => {
    try {

      d3.event.preventDefault();
      let SVGRef = this.SVGRef;
      let mouseCoordinate = d3.mouse(SVGRef._groups[0][0]);


      //

      let xPx = mouseCoordinate[0];
      let yPx = mouseCoordinate[1];

      let pointFound: boolean = false;
      let hAxis: Axis;
      let vAxis: Axis;
      for (let key of this.DataSeries.keys()) {
        let objSeries: DataSeries = this.DataSeries.get(key);
        if (objSeries.Type === dataSeriesType.Point) {

          hAxis = this.getAxisByID(this.DataSeries.get(objSeries.Id).XAxisId);
          vAxis = this.getAxisByID(this.DataSeries.get(objSeries.Id).YAxisId);
          let xValue = hAxis.ScaleRef.invert(xPx).toFixed(2);
          let yValue = vAxis.ScaleRef.invert(yPx).toFixed(2);

          let objPoint: ChartData[] = this.DataSeries.get(objSeries.Id).Data.filter(async (point) => {
            let pxOffset = objSeries.PointSize;
            switch (objSeries.PointStyle) {
              case pointStyle.Circle:
                pxOffset = objSeries.PointSize;
                break;
              case pointStyle.Rectangle:
                pxOffset = objSeries.PointWidth;
                break;
              case pointStyle.Diamond:
                pxOffset = objSeries.PointWidth;
                break;


              default:
                break;
            }


            if ((point.xPixel > (xPx - pxOffset) && point.xPixel < (xPx + pxOffset)) && (point.yPixel > (yPx - pxOffset) && point.yPixel < (yPx + pxOffset))) {
              pointFound = true;
              hAxis.ChartRef.__toolTip.css("visibility", "visible");
              hAxis.ChartRef.__toolTip.css("class", "tooltip");

              if (hAxis.IsDateTime) {
                //hAxis.ChartRef.__toolTip.html(hAxis.Title + " - " + point.datetime + "<br>" + vAxis.Title + " - " + Number(point.y).toFixed(2));
                hAxis.ChartRef.__toolTip.html(hAxis.Title + " - " + point.datetime + "<br>" + vAxis.Title + " - " + Number(point.y).toFixed(2));
              } else {
                hAxis.ChartRef.__toolTip.html(hAxis.Title + " - " + Number(point.x).toFixed(2) + "<br>" + vAxis.Title + " - " + Number(point.y).toFixed(2));
              }
              hAxis.ChartRef.__toolTip.css("position", "absolute"); //
              hAxis.ChartRef.__toolTip.css("background-color", "#585656");
              hAxis.ChartRef.__toolTip.css("padding", "10px");
              hAxis.ChartRef.__toolTip.css("border-radius", "3px");
              hAxis.ChartRef.__toolTip.css("left", 0);
              hAxis.ChartRef.__toolTip.css("top", 0);
              hAxis.ChartRef.__toolTip.css("z-index", 1000000); //bring tooltip on front

              //change code to find relative position of tooltip
              var tooltipX = SVGRef._groups[0][0].getBoundingClientRect().left + point.xPixel;// point.xPixel;
              var tooltipY = SVGRef._groups[0][0].getBoundingClientRect().top + point.yPixel;// point.yPixel;

              var tooltipWidth = hAxis.ChartRef.__toolTip.innerWidth();
              var tooltipHeight = hAxis.ChartRef.__toolTip.innerHeight();

              if (tooltipX + tooltipWidth > hAxis.ChartRef.__chartRect.right) {
                tooltipX = tooltipX - tooltipWidth;
              }

              if (tooltipY + tooltipHeight > hAxis.ChartRef.__chartRect.bottom) {
                tooltipY = tooltipY - tooltipHeight;
              }

              hAxis.ChartRef.__toolTip.css("left", tooltipX + 20);
              hAxis.ChartRef.__toolTip.css("top", tooltipY - 20);
              hAxis.ChartRef.__toolTip.css("display", "inherit");

              //hAxis.ChartRef.__toolTip.css("display", "inline-block");

            }

          });
        }

        if (pointFound == false) {
          if (hAxis == undefined) {
            return;
          }
          hAxis.ChartRef.__toolTip.css("display", "none");

        }
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-mouseMoveOnSvg : " + error);
    }
  }

  reDraw = async () => {
    try {
      $("#" + this.ContainerId).empty();


      d3.select("#tooltip_" + this.Id).remove();
      d3.select("#" + this.ContainerId)
        .append("div")
        .attr("id", "tooltip_" + this.Id);

      //.attr("class", "tooltip");

      this.__toolTip = $("#" + "tooltip_" + this.Id);


      if (this.Height == 0) {
        this.Height = document.getElementById(this.ContainerId).clientHeight;
      }
      if (this.Width == 0) {
        this.Width = document.getElementById(this.ContainerId).clientWidth;
      }

      let SVGRef = d3
        .select("#" + this.ContainerId)
        .append("svg")
        .attr("id", "svg-plot-" + this.ContainerId)
        .attr("height", this.Height)
        .attr("width", this.Width)
        // .attr("height", this.Height)
        // .attr("width", this.Width);
        // .style("left", '0px')
        // .style("top", '0px')
        .style("z-index", 100)

        .style("position", 'absolute');


      this.SVGRef = SVGRef;


      //Mouse move event on canvas
      SVGRef.on("mousemove", this.mouseMoveOnSvg);
      // SVGRef.on("mouseleave", (a, b, c) => {
      //   this.__toolTip.css("display", "none");
      // });




      //for Scroll on Right click - Disable defulat
      SVGRef.on("contextmenu", function (evt) {
        d3.event.preventDefault();
      });

      this.scroll = d3
        .zoom()
        .filter(function () {
          switch (d3.event.type) {
            case "mousedown":
              return d3.event.button === 2; //d3.event.button === 1
            case "wheel":
              //return d3.event.button === 0;
              return null;   //Stop wheel functionality
            default:
              return false;
          }
        })
        .scaleExtent([-1e100, 1e100])
        .translateExtent([
          [-1e100, -1e100],
          [1e100, 1e100],
        ])
        .on("end", () => { $("#" + this.ContainerId).css("cursor", "default"); })
        .on("zoom", this.onScroll);
      this.SVGRef.call(this.scroll);

      //ZOOM LOGIC START BELOW - prath 08-12-2020 for ZOOM-CHART
      if (this.isZoomByRect) {
        SVGRef.on("mousedown", (d: any, i: any) => {
          if (d3.event.which == 1) {
            //need to reBuild All Axies (In case of Zoom after Scroll)
            if (this.ScaleBackup.size > 0) {
              this.reBuildAxisAfterScrolling();
            }
            let mySVG = this.SVGRef._groups[0][0]; // d._groups[0][0];
            this.mouseDownZoom(mySVG, i);
          }
        });
      }



      let chartRectLeft = this.__chartRect.left;


      //=================================

      this.Height = Number($("#" + this.ContainerId).height());
      this.Width = Number($("#" + this.ContainerId).width());
      //08-10-2021 to handle error of "rect" - NaN
      await this.createAxes();

      //Create Title prath 01-10-2020

      //alert(this.Width + " - " + this.__chartRect.width);

      this.SVGRef.append("text")
        .attr("x", this.Width / 2)
        .attr("y", 20)
        .attr("class", "title")
        // .attr("font-size", "10pt")
        // .attr("fill", "red")
        .style("text-anchor", "middle")
        .text(this.Title);

      this.SVGRef.append("g")
        .attr("class", this.Id + "__selector")
        .append("rect")
        .attr("id", this.Id + "__selector_rect")
        .attr("x", 0)
        .attr("y", 0)
        // .attr("width", "100px")
        // .attr("height", "100px")
        .attr("width", "0px")
        .attr("height", "0px")
        .style("fill", "gray")
        .style("opacity", 0.2);

      this.updateChart();
      this.drawLegend();


    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-reDraw : " + error);

    }
  };

  //#region Scroll-on-Chart

  reBuildAxisAfterScrolling = () => {
    try {
      let objAxisNew = new Axis();//original
      for (let key of this.Axes.keys()) {
        objAxisNew = this.Axes.get(key);
        if (objAxisNew.Visible) {
          let newScale = this.Axes.get(key).ScaleRef.domain([this.ScrollingScale.get(key).domain()[0], this.ScrollingScale.get(key).domain()[1]]);


          if (objAxisNew.Position == axisPosition.left) {
            objAxisNew.AxisRef = d3.axisLeft(newScale);
          }

          if (objAxisNew.Position == axisPosition.top) {
            objAxisNew.AxisRef = d3.axisTop(newScale);
          }

          if (objAxisNew.Position == axisPosition.bottom) {
            objAxisNew.AxisRef = d3.axisBottom(newScale);
          }

          if (objAxisNew.Position == axisPosition.right) {
            objAxisNew.AxisRef = d3.axisRight(newScale);
          }

        }
      }
      this.ScaleBackup = new Map<string, any>();
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-reBuildAxisAfterScrolling : " + error);
    }

  }
  onScroll = () => {
    try {
      let ScrollAxisArrFamily = [];


      //alert("onScroll method");
      $("#" + this.ContainerId).css("cursor", "grab");
      let t = d3.event.transform;
      this.isScrollingInProgress = true;
      for (let key of this.Axes.keys()) {
        let objAxis: Axis = this.Axes.get(key);
        if (objAxis.Visible && objAxis.isAllowScrolling) {
          switch (objAxis.Position) {
            case axisPosition.bottom:
              let sxBottom = t.rescaleX(objAxis.ScaleRef);
              this.ScrollingScale.set(objAxis.Id, sxBottom);
              objAxis.AxisRef = d3
                .axisBottom(sxBottom)
                .tickSize(-objAxis.__tickSize)
                .ticks(objAxis.__noOfTicks);
              this.ScaleBackup.set(objAxis.Id, JSON.parse(JSON.stringify(sxBottom.domain())));
              this.setMinMaxScrollFamily(ScrollAxisArrFamily, sxBottom, "X"); //Set domain value used for multiple chart scrolling

              break;
            case axisPosition.top:
              let sxTop = t.rescaleX(objAxis.ScaleRef);
              this.ScrollingScale.set(objAxis.Id, sxTop);
              objAxis.AxisRef = d3
                .axisTop(sxTop)
                .tickSize(-objAxis.__tickSize)
                .ticks(objAxis.__noOfTicks);
              this.ScaleBackup.set(objAxis.Id, JSON.parse(JSON.stringify(sxTop.domain())));
              this.setMinMaxScrollFamily(ScrollAxisArrFamily, sxTop, "X"); //Set domain value used for multiple chart scrolling
              break;
            case axisPosition.left:
              let syLeft = t.rescaleY(objAxis.ScaleRef);
              this.ScrollingScale.set(objAxis.Id, syLeft);
              objAxis.AxisRef = d3
                .axisLeft(syLeft)
                .tickSize(-objAxis.__tickSize)
                .ticks(objAxis.__noOfTicks);
              this.ScaleBackup.set(objAxis.Id, JSON.parse(JSON.stringify(syLeft.domain())));
              this.setMinMaxScrollFamily(ScrollAxisArrFamily, syLeft, "Y"); //Set domain value used for multiple chart scrolling
              break;
            case axisPosition.right:
              let syRight = t.rescaleX(objAxis.ScaleRef); //<-- rescale the scales
              this.ScrollingScale.set(objAxis.Id, syRight);
              this.SVGRef.select("#" + objAxis.Id).call(
                d3.axisRight(syRight).ticks(objAxis.__noOfTicks)
              );
              this.ScaleBackup.set(objAxis.Id, JSON.parse(JSON.stringify(syRight.domain())));
              this.setMinMaxScrollFamily(ScrollAxisArrFamily, syRight, "Y"); //Set domain value used for multiple chart scrolling
              break;
            default:
              break;
          }
          objAxis.formatAxis();

        }


      }

      //Scrolling Multiple Chart base on Group
      this.ScrollFamily.set(this.ScrollFamilyId, ScrollAxisArrFamily);
      if (this.__parentRef.reDrawChartFamilyOnScroll != undefined) {
        this.__parentRef.reDrawChartFamilyOnScroll(this.ContainerId);
      }

      //=======================================
      this.updateChart(true); //Update Chart without axies
      this.isScrollingInProgress = false;

    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-onScroll : " + error);
    }

  };
  //#endregion Scroll-on-Chart

  //#region ZOOM-CHART
  mouseDownZoom = (d: any, i: any) => {
    try {

      $("#" + this.ContainerId).css("cursor", "zoom-in");
      let e = d;
      let origin = d3.mouse(e);
      let rect = this.SVGRef.append("rect").attr("class", "zoom");

      d3.select("#" + this.ContainerId).classed("noselect", true);

      origin[0] = Math.max(0, Math.min(this.Width, origin[0]));
      origin[1] = Math.max(0, Math.min(this.Height, origin[1]));

      let width_ = this.Width;
      let height_ = this.Height;
      let ContainerId_ = this.ContainerId;
      let stopZooming = false;
      d3.select(window).on("mousemove", function () {
        var m = d3.mouse(e);
        m[0] = Math.max(0, Math.min(width_, m[0]));
        m[1] = Math.max(0, Math.min(height_, m[1]));

        //Not allow to zoom from right to left & bottom to top
        if (origin[0] - m[0] > 5 || origin[1] - m[1] > 5) {
          $("#" + ContainerId_).css("cursor", "default");
          stopZooming = true;
          return;
        }
        rect
          .attr("x", Math.min(origin[0], m[0]))
          .attr("y", Math.min(origin[1], m[1]))
          .attr("width", Math.abs(m[0] - origin[0]))
          .attr("height", Math.abs(m[1] - origin[1]));
      });
      d3.select(window).on("mouseup", (d: any, i: any) => {
        if (stopZooming) {

          rect.remove();
          return;
        }
        let mySVG = this.SVGRef._groups[0][0]; // To select SVG Reference
        this.mouseUpZoom(mySVG, origin, rect);
        //document.getElementById("svg-plot").style.zIndex = "-1000";
      });
      d3.event.stopPropagation();
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-mouseDownZoom : " + error);
      //alert(error);
    }
  };

  zoomingDisableForAxies = () => {
    try {

      let objHorizontalAxis: Axis;
      let objVerticalAxis: Axis;

      for (let key of this.DataSeries.keys()) {
        let objSeries: DataSeries = this.DataSeries.get(key);

        //  if (objSeries.Type == dataSeriesType.Bar) {
        objHorizontalAxis = this.getAxisByID(objSeries.XAxisId);
        objVerticalAxis = this.getAxisByID(objSeries.YAxisId);

        if (objHorizontalAxis.bandScale || objVerticalAxis.bandScale) {
          objHorizontalAxis.isAllowZooming = false;
          objVerticalAxis.isAllowZooming = false;
        }

      }

    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-zoomingDisableForAxies : " + error);
    }

  }

  mouseUpZoom = (d: any, origin: any, rect: any) => {
    try {
      //alert("mouse up......");
      d3.select(window).on("mousemove", null).on("mouseup", null);
      d3.select(this.ContainerId).classed("noselect", false);
      var m = d3.mouse(d);
      m[0] = Math.max(0, Math.min(this.Width, m[0]));
      m[1] = Math.max(0, Math.min(this.Height, m[1]));

      if (m[0] !== origin[0] && m[1] !== origin[1]) {
        //Update Scale Domain of each axes based on Zoon Selection (Rectangle)
        /////==== Save Original State as Zoom Step-1 ////////////////////
        if (this.ZoomSteps.size == 0) {
          let ZoomAxisArr = [];
          for (let key of this.Axes.keys()) {
            let Axis_ = this.Axes.get(key);
            if (Axis_.Visible == false) {
              continue;
            }
            this.setMinMaxZoom(ZoomAxisArr, Axis_);
          }
          this.ZoomSteps.set(this.ZoomSteps.size + 1, ZoomAxisArr);
          if (this.__parentRef.updateZoomDropDownList != undefined) {
            this.__parentRef.updateZoomDropDownList(this.ZoomSteps.size);
          }
        }
        //Allow zooming or not ? disable all axes for zooming (BandScale)
        this.zoomingDisableForAxies();

        let ZoomAxisArr = [];
        let ZoomAxisArrFamily = [];
        for (let key of this.Axes.keys()) {
          let Axis_ = this.Axes.get(key);

          if ((Axis_.Visible == false) || (Axis_.isAllowZooming == false)) {
            continue;
          }

          //////  if (Axis_.bandScale == false) { //original false
          //When only X axes zoom require
          if (this.ZoomOnAxies == zoomOnAxies.x) {

            if (Axis_.bandScale == false) {
              Axis_.ScaleRef.domain(
                [origin[0], m[0]].map(Axis_.ScaleRef.invert, Axis_.ScaleRef)
              );
            } else {

              Axis_.ScaleRef.domain(
                [origin[0], m[0]].map(Axis_.ScaleRef, Axis_.ScaleRef)
              );
            }
            //21-01-2021 prath
            // if (
            //   Axis_.Position == axisPosition.bottom ||
            //   Axis_.Position == axisPosition.top
            // ) {
            //   Axis_.ScaleRef.domain(
            //     [origin[0], m[0]].map(Axis_.ScaleRef.invert, Axis_.ScaleRef)
            //   );
            //   this.setMinMaxZoom(ZoomAxisArr, Axis_); //updated Axis set in Zoom Step
            // }
          }
          //When only Y axes zoom require
          if (this.ZoomOnAxies == zoomOnAxies.y) {
            //21-01-2021 prath
            if (
              Axis_.Position == axisPosition.left ||
              Axis_.Position == axisPosition.right
            ) {
              Axis_.ScaleRef.domain(
                [origin[1], m[1]].map(Axis_.ScaleRef.invert, Axis_.ScaleRef)
              );
              this.setMinMaxZoom(ZoomAxisArr, Axis_); //updated Axis set in Zoom Step
            }
          }
          //When both X & Y axes zoom require
          if (this.ZoomOnAxies == zoomOnAxies.both) {
            if (
              Axis_.Position == axisPosition.top ||
              Axis_.Position == axisPosition.bottom
            ) {
              if (Axis_.bandScale == false) {
                Axis_.ScaleRef.domain(
                  [origin[0], m[0]].map(Axis_.ScaleRef.invert, Axis_.ScaleRef)
                );
              } else {
                Axis_.ScaleRef.domain(
                  [origin[0], m[0]].map(Axis_.ScaleRef, Axis_.ScaleRef)
                );
              }
              this.setMinMaxZoomFamily(ZoomAxisArrFamily, Axis_, "X");
            }

            if (
              Axis_.Position == axisPosition.left ||
              Axis_.Position == axisPosition.right
            ) {
              Axis_.ScaleRef.domain(
                [origin[1], m[1]].map(Axis_.ScaleRef.invert, Axis_.ScaleRef)
              );
              this.setMinMaxZoomFamily(ZoomAxisArrFamily, Axis_, "Y");
            }

            this.setMinMaxZoom(ZoomAxisArr, Axis_); //updated Axis set in Zoom Step

          }

          //Axis_.formatAxis(); //21-01-2021 Require ????
        }

        this.ZoomSteps.set(this.ZoomSteps.size + 1, ZoomAxisArr);
        //Zooming Multiple Chart base on Group
        this.ZoomFamily.set(this.ZoomFamilyId, ZoomAxisArrFamily);
        if (this.__parentRef.updateZoomDropDownList != undefined) {
          this.__parentRef.updateZoomDropDownList(this.ZoomSteps.size);
        }
        //====================================

        this.refreshOnZoom(origin, m); //Used to only update axies - Line Update code bypassed

        this.updateChart(true); //Update Chart without axies
      }
      $("#" + this.ContainerId).css("cursor", "default");
      rect.remove();
      //ZOOM ALL CHARTS - with same chart family
      if (this.__parentRef.reDrawChartFamily != undefined) {
        this.__parentRef.reDrawChartFamily(this.ContainerId); //prath 12-11-2021
      }

    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-mouseUpZoom : " + error);
    }
  };

  setMinMaxZoom = (ZoomAxisArr, Axis_) => {
    try {
      let objZoomStep = new ZoomStep();
      objZoomStep.AxisId = Axis_.Id;
      objZoomStep.Min = Axis_.ScaleRef.domain()[0];
      objZoomStep.Max = Axis_.ScaleRef.domain()[1]; //xxxx wip-prath
      ZoomAxisArr.push(objZoomStep);
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-setMinMaxZoom : " + error);
    }
  };


  setMinMaxZoomFamily = (ZoomAxisArr, Axis_, AxisPosition) => {
    try {
      let objZoomStep = new ZoomStep();
      objZoomStep.AxisId = AxisPosition;
      objZoomStep.Min = Axis_.ScaleRef.domain()[0];
      objZoomStep.Max = Axis_.ScaleRef.domain()[1]; //xxxx wip-prath
      ZoomAxisArr.push(objZoomStep);
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-setMinMaxZoom : " + error);
    }
  };



  setMinMaxScrollFamily = (ScrollAxisArr, Axis_, AxisPosition) => {
    try {
      let objZoomStep = new ZoomStep();
      objZoomStep.AxisId = AxisPosition;
      objZoomStep.Min = Axis_.domain()[0];
      objZoomStep.Max = Axis_.domain()[1]; //xxxx wip-prath
      ScrollAxisArr.push(objZoomStep);
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-setMinMaxZoom : " + error);
    }
  };
  restoreZoomStep = (zoomStep: number, ClearZoom?: boolean) => {
    try {
      if (ClearZoom == true) {
        zoomStep = 1;
      }
      let axisArr = this.ZoomSteps.get(zoomStep);

      for (var i = 0; i < axisArr.length; i++) {
        this.Axes.get(axisArr[i].AxisId).ScaleRef.domain([
          axisArr[i].Min,
          axisArr[i].Max,
        ]);
      }

      let objHorizontalAxisScaleRef: any;
      let objVerticalAxisScaleRef: any;

      let objHorizontalAxisRef: any;
      let objVerticalAxisRef: any;

      let objHorizontalAxis: Axis;
      let objVerticalAxis: Axis;

      for (let key of this.DataSeries.keys()) {
        let objSeries: DataSeries = this.DataSeries.get(key);
        // //  if (objSeries.Type == dataSeriesType.Bar) {
        objHorizontalAxis = this.getAxisByID(objSeries.XAxisId);
        objVerticalAxis = this.getAxisByID(objSeries.YAxisId);

        objHorizontalAxisScaleRef = objHorizontalAxis.ScaleRef;
        objHorizontalAxisRef = objHorizontalAxis.AxisRef;

        objVerticalAxisScaleRef = objVerticalAxis.ScaleRef;
        objVerticalAxisRef = objVerticalAxis.AxisRef;

        //update Axis
        this.SVGRef.select("#" + objHorizontalAxis.Id).call(
          objHorizontalAxisRef
        );
        this.SVGRef.select("#" + objVerticalAxis.Id).call(objVerticalAxisRef);

        //Update Axis & rebuild Ticks
        // this.updateTicks(objHorizontalAxis);
        // this.updateTicks(objVerticalAxis);

        this.SVGRef.select("#" + objHorizontalAxis.Id).call(objHorizontalAxis.AxisRef);
        this.SVGRef.select("#" + objVerticalAxis.Id).call(objVerticalAxis.AxisRef);
        objHorizontalAxis.formatAxis();
        objVerticalAxis.formatAxis();


      }

      this.updateChart(true);
      //======================================================================
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-restoreZoomStep : " + error);
    }
  };

  refreshOnZoom = (origin, m) => {
    try {
      let objHorizontalAxisScaleRef: any;
      let objVerticalAxisScaleRef: any;

      let objHorizontalAxisRef: any;
      let objVerticalAxisRef: any;

      let objHorizontalAxis: Axis;
      let objVerticalAxis: Axis;

      for (let key of this.DataSeries.keys()) {
        let objSeries: DataSeries = this.DataSeries.get(key);

        //  if (objSeries.Type == dataSeriesType.Bar) {
        objHorizontalAxis = this.getAxisByID(objSeries.XAxisId);
        objVerticalAxis = this.getAxisByID(objSeries.YAxisId);

        objHorizontalAxisScaleRef = objHorizontalAxis.ScaleRef;
        objHorizontalAxisRef = objHorizontalAxis.AxisRef;

        objVerticalAxisScaleRef = objVerticalAxis.ScaleRef;
        objVerticalAxisRef = objVerticalAxis.AxisRef;

        var reset_s = 0;
        let xmin = objHorizontalAxis.getMin();
        let xmax = objHorizontalAxis.getMax();

        let ymin = objVerticalAxis.getMin();
        let ymax = objVerticalAxis.getMax();

        if (objHorizontalAxis.isAllowZooming == false || objVerticalAxis.isAllowZooming == false) {
          continue;
        }

        if (
          objHorizontalAxisScaleRef.domain()[1] -
          objHorizontalAxisScaleRef.domain()[0] >=
          xmax - xmin
        ) {
          //zoom.x(x.domain([xmin, xmax]));
          reset_s = 1;
        }

        if (
          objVerticalAxisScaleRef.domain()[1] -
          objVerticalAxisScaleRef.domain()[0] >=
          xmax - xmin
        ) {
          //zoom.y(y.domain([ymin, ymax]));
          reset_s += 1;
        }

        if (reset_s == 2) {
          //alert("reset2");
          // Both axes are full resolution. Reset.
          this.zoom.transform(
            d3.select("#" + this.ContainerId),
            d3.zoomIdentity
          );
        } else {
          //alert("reset2 else");
          if (objHorizontalAxisScaleRef.domain()[0] < xmin) {
            objHorizontalAxisScaleRef.domain([
              xmin,
              objHorizontalAxisScaleRef.domain()[1] -
              objHorizontalAxisScaleRef.domain()[0] +
              xmin,
            ]);
          }
          if (objHorizontalAxisScaleRef.domain()[1] > xmax) {
            var xdom0 =
              objHorizontalAxisScaleRef.domain()[0] -
              objHorizontalAxisScaleRef.domain()[1] +
              xmax;
            objHorizontalAxisScaleRef.domain([xdom0, xmax]);
          }
          if (objVerticalAxisScaleRef.domain()[0] < ymin) {
            objVerticalAxisScaleRef.domain([
              ymin,
              objVerticalAxisScaleRef.domain()[1] -
              objVerticalAxisScaleRef.domain()[0] +
              ymin,
            ]);
          }
          if (objVerticalAxisScaleRef.domain()[1] > ymax) {
            var ydom0 =
              objVerticalAxisScaleRef.domain()[0] -
              objVerticalAxisScaleRef.domain()[1] +
              ymax;
            objVerticalAxisScaleRef.domain([ydom0, ymax]);
          }
        }

        // //Update Axis & rebuild Ticks
        // this.updateTicks(objHorizontalAxis);
        // this.updateTicks(objVerticalAxis);

        //update Axis with new Domain values
        this.SVGRef.select("#" + objHorizontalAxis.Id).call(objHorizontalAxis.AxisRef);
        this.SVGRef.select("#" + objVerticalAxis.Id).call(objVerticalAxis.AxisRef);
        objHorizontalAxis.formatAxis();
        objVerticalAxis.formatAxis();


      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-refreshOnZoom : " + error);
    }
  };


  //#endregion  ZOOM-CHART functions=========================================================

  drawLegend = () => {
    try {
      $("#" + this.ContainerId + "_legend").empty();

      if (this.ShowLegend == false) {
        return;
      }

      let legendString = "";

      for (let key of this.DataSeries.keys()) {
        let objSeries = this.DataSeries.get(key);

        if (objSeries != null) {
          if (objSeries.Visible && objSeries.ShowInLegend) {
            legendString =
              legendString.trim() + '<div style="display:inline-block;text-al">';
            legendString =
              legendString +
              '<div style="margin-left:3px;display:inline-block;background-color:' +
              objSeries.Color +
              ';height:15px;width:15px"><p style="color:transparent">x</p> </div> ';
            legendString =
              legendString +
              '<div style="white-space:nowrap; overflow: hidden;margin-left:3px;margin-right:3px;display:inline-block;background-color:transparent;height:18px;width:auto"><p style="white-space:nowrap; overflow: hidden; text-overflow: ellipsis;max-width:200px;text-align:left" >' +
              objSeries.Title +
              "</p></div> ";
            legendString = legendString + "</div>";
          }
        }
      }

      $("#" + this.ContainerId + "_legend").html(legendString);
      //added by prath
      if (this.LegendPosition === 3 || this.LegendPosition === 4) {
        $("#" + this.ContainerId + "_legend").css("marginLeft", this.__chartRect.LeftEdge);
        $("#" + this.ContainerId + "_legend").css("width", this.__chartRect.width);
      }


    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-drawLegend : " + error);
    }
  };

  initialize = () => {
    try {
      window.addEventListener("resize", this.updateChart.bind(this));

      $("#" + this.ContainerId).mousedown((e) => {
        this.__lastButtonClicked = e.button;
      });

      $("#" + this.ContainerId).mouseup((e) => {
        this.mouseUp(e);
      });
      $("#" + this.ContainerId).mousedown((e) => {
        this.mouseDown(e);
      });
      $("#" + this.ContainerId).mousemove((e) => {
        this.mouseMove(e);
      });
      $("#" + this.ContainerId).mouseleave((e) => {
        this.mouseLeave(e);
      });
    } catch (error) {
      let halt = true;
      this.objLogger.SendLog("Error ->CHART-initialize : " + error);
    }
  };
  //
  //updateChart = () => {
  updateChart = (isRefresh: boolean = false) => {
    try {

      this.Height = Number($("#" + this.ContainerId).height());
      this.Width = Number($("#" + this.ContainerId).width());

      //update all the axes

      //Raise event before draw axis

      this._onBeforeAxisDraw.dispatch(null, 0);

      if (isRefresh == false) {

        this.updateAxes();

      }

      this._onAfterAxisDraw.dispatch(null, 0);

      this._onBeforeSeriesDraw.dispatch(null, 0);

      //ZOOM-CHART - ADD CLIPS
      $("#clip" + this.Id).remove();
      $("#canvas" + this.Id).remove();
      $(".dashed" + this.Id).remove();
      $(".dashed_" + this.Id).remove();



      //IS BELOW CODE NEEDED ?????????
      $("#rect" + this.Id).remove();



      if (!isNaN(this.__chartRect.width)) {
        this.SVGRef.append("rect")
          .attr("id", "rect" + this.Id)
          .attr("x", this.__chartRect.left)
          .attr("y", this.__chartRect.top)
          .style("opacity", 0.002) //Must require to see behind series
          .attr("width", this.__chartRect.width)
          .attr("height", this.__chartRect.height);

        var clip = this.SVGRef.append("svg:clipPath")
          .attr("id", "clip" + this.Id)
          .attr("class", "clip" + this.Id)
          .append("svg:rect")
          .attr("x", this.__chartRect.left)
          .attr("y", this.__chartRect.top)

          .attr("width", this.__chartRect.width)
          .attr("height", this.__chartRect.height);

        let SVGRect = this.SVGRef.append("g").attr(
          "clip-path",
          "url(#clip" + this.Id + ")"
        );
        this.SVGRect = SVGRect;

        //????????



        //===========End Zoom Clip Logic


        //Canvas Clip
        this.CanvasRef = d3.select("#" + this.ContainerId)
          .append("canvas")
          .attr("id", "canvas" + this.Id)
          .attr("height", this.Height)
          .attr("width", this.Width)
          .style("position", 'absolute');



        this.CanvasContext = this.CanvasRef.node().getContext('2d');

        // Clip a rectangular area
        this.CanvasContext.rect(this.__chartRect.left, this.__chartRect.top, this.__chartRect.width, this.__chartRect.height);
        //      this.CanvasContext.stroke();
        this.CanvasContext.clip();

        // Draw red rectangle after clip()
        this.CanvasContext.fillStyle = "transparent";
        this.CanvasContext.fillRect(this.__chartRect.left, this.__chartRect.top, this.__chartRect.width, this.__chartRect.height);
        //=====================


      }

      


      this.updateSeries();
      this._onAfterSeriesDraw.dispatch(null, 0);
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-updateChart : " + error);

    }
  };

  drawSeries = () => {
    try {
      //#Implementation 1 - Stacked Bar Chart
      let stackedBarChartsFound: boolean = false;

      for (let key of this.DataSeries.keys()) {

        if (
          this.DataSeries.get(key).Type == dataSeriesType.Bar &&
          this.DataSeries.get(key).Stacked
        ) {
          stackedBarChartsFound = true;
        }
      }

      if (stackedBarChartsFound) {
        let objStackedBarSeries: StackedBarSeries = new StackedBarSeries();
        objStackedBarSeries.ChartRef = this;
        objStackedBarSeries.redrawSeries();
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-drawSeries : " + error);
    }
  };

  updateSeries = () => {
    try {
      //#Stacked Bar Chart - The stacked bar chart needs to be redrawn, right now it can't update just positions
      let stackedBarChartsFound: boolean = false;
      let lineSeriesFound: boolean = false;
      let pieSeriesFound: boolean = false;
      let pointSeriesFound: boolean = false;
      let areaSeriesFound: boolean = false;
      let barChartFound: boolean = false;

      for (let key of this.DataSeries.keys()) {

        if (this.DataSeries.get(key).Type == dataSeriesType.Bar) {
          if (this.DataSeries.get(key).Stacked) {
            stackedBarChartsFound = true;
          } else {
            barChartFound = true;
          }
        }

        if (this.DataSeries.get(key).Type == dataSeriesType.Line) {
          lineSeriesFound = true;
        }

        //pie prath 01-10-2020
        if (this.DataSeries.get(key).Type == dataSeriesType.Pie) {
          pieSeriesFound = true;
        }

        //Point prath 09-10-2020
        if (this.DataSeries.get(key).Type == dataSeriesType.Point) {
          pointSeriesFound = true;
        }

        if (this.DataSeries.get(key).Type == dataSeriesType.Area) {
          areaSeriesFound = true;
        }
      }

      if (stackedBarChartsFound) {
        let objStackedBarSeries: StackedBarSeries = new StackedBarSeries();
        objStackedBarSeries.ChartRef = this;
        objStackedBarSeries.redrawSeries();
      }

      if (lineSeriesFound) {
        let objLineSeries: LineSeries = new LineSeries();
        objLineSeries.ChartRef = this;
        objLineSeries.redrawSeries();
      }

      //pie prath 01-10-2020
      if (pieSeriesFound) {
        let objPieSeries: PieSeries = new PieSeries();
        objPieSeries.ChartRef = this;
        objPieSeries.redrawSeries();
      }

      //Point prath 09-10-2020
      if (pointSeriesFound) {
        let objPointSeries: PointSeries = new PointSeries();
        objPointSeries.ChartRef = this;
        objPointSeries.redrawSeries();
      }

      if (areaSeriesFound) {
        let objAreaSeries: AreaSeries = new AreaSeries();
        objAreaSeries.ChartRef = this;
        objAreaSeries.redrawSeries();
      }

      //barChart 03-11-2020
      if (barChartFound) {
        let objBarSeries: BarSeries = new BarSeries();
        objBarSeries.ChartRef = this;
        objBarSeries.redrawSeries();
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-updateSeries : " + error);
    }
  };

  //#region Mouse Events
  mouseDown = (e: any) => {
    try {
      if (this.hasSelector) {
        let objAxis = this.getAxisWithSelector();

        if (objAxis != null) {
          objAxis.__selectorDragging = true;

          objAxis.__leftEdgeDragging = false;
          objAxis.__rightEdgeDragging = false;

          if (this.isMouseOnLeftEdge(e)) {
            objAxis.__leftEdgeDragging = true;
          }

          if (this.isMouseOnRightEdge(e)) {
            objAxis.__rightEdgeDragging = true;
          }

          objAxis.__selectorOffset =
            e.clientX - Number($("#" + this.Id + "__selector_rect").attr("x"));
        }
      }

      var eventArgs = new ChartMouseEvtArgs();

      eventArgs.x = e.offsetX;
      eventArgs.y = e.offsetY;

      this._onMouseDown.dispatch(eventArgs, 0);
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-mouseDown : " + error);
    }
  };
  //#endregion

  mouseUp = (e: any) => {
    try {

      if (this.hasSelector) {
        let objAxis = this.getAxisWithSelector();

        if (objAxis != null) {
          if (objAxis.__selectorDragging) {
            objAxis.updateSelectorPosReverse();
            //Change data in DataSelector  99999999999  imp
            this.__parentRef.selectorChanged(
              "0",
              objAxis.__selectorStartDatePos,
              objAxis.__selectorEndDatePos,
              0,
              0
            );
          }

          objAxis.__selectorDragging = false;
          objAxis.__leftEdgeDragging = false;
          objAxis.__rightEdgeDragging = false;
          $("#" + this.Id + "__selector_rect").css("cursor", "default");
        }
      }

      var eventArgs = new ChartMouseEvtArgs();

      eventArgs.x = e.offsetX;
      eventArgs.y = e.offsetY;

      this._onMouseUp.dispatch(eventArgs, 0);
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-mouseUp : " + error);
    }
  };

  getTooltipTextHorizontalPlot = (index: number, seriesId: string) => {
    try {
      var strText = "";

      var axisId = this.DataSeries.get(seriesId).XAxisId;

      for (let key of this.DataSeries.keys()) {
        let objSeries = this.DataSeries.get(key);

        if (objSeries.XAxisId == axisId) {
          if (index >= 0 && index < objSeries.Data.length) {
            let objAxis = this.getAxisByID(objSeries.XAxisId);

            if (objAxis != null) {
              //PRATH WIP -9999999999999999999
              if (objSeries.Data[index].x == undefined) {
                strText = "";

                // strText =
                //   strText +
                //   " <p style='color:white;padding:0px;margin:0px'>" +
                //   objAxis.Title +
                //   ":  " +
                //   objSeries.Data[index].x +
                //   "</p>";

              } else {

                if (objSeries.Data[index].labelX != "") {

                  strText =
                    strText +
                    " <p style='color:white;padding:0px;margin:0px'>" +

                    objSeries.Data[index].labelX +
                    "</p>";
                } else {
                  strText =
                    strText +
                    " <p style='color:white;padding:0px;margin:0px'>" +
                    objAxis.Title +
                    ":  " +
                    objSeries.Data[index].x +
                    "</p>";
                }

              }


              break;
            }
          }
        }
      }

      for (let key of this.DataSeries.keys()) {
        let objSeries = this.DataSeries.get(key);

        if (objSeries.XAxisId == axisId) {
          if (index >= 0 && index < objSeries.Data.length) {

            if (objSeries.Data[index].labelY != "") {

              strText =
                strText +
                " <p style='color:" +
                objSeries.Color +
                ";padding:0px;margin:0px '>" +
                objSeries.Data[index].labelY +
                "</p>";
            } else {
              strText =
                strText +
                " <p style='color:" +
                objSeries.Color +
                ";padding:0px;margin:0px '>" +
                objSeries.Title +
                ":  " +
                objSeries.Data[index].y +
                "</p>";
            }


          }
        }
      }

      return strText;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-getTooltipTextHorizontalPlot : " + error);

    }
  };

  mouseMove = (e: any) => {
    try {
      this.__mouseLastX = e.clientX;
      this.__mouseLastY = e.clientY;

      if (this.hasSelectorDragInProgress()) {
        let offsetDiff =
          $("#" + this.Id + "__selector_rect").offset().left -
          Number($("#" + this.Id + "__selector_rect").attr("x"));
        let newX = e.clientX - offsetDiff;

        let objAxis = this.getAxisWithSelector();

        if (objAxis == null) {
          return;
        }

        if (objAxis.__leftEdgeDragging) {
          let elementX = Number(
            $("#" + this.Id + "__selector_rect").offset().left
          );
          let widthDiff = elementX - e.clientX;
          let newWidth =
            Number($("#" + this.Id + "__selector_rect").width()) + widthDiff;

          if (newWidth >= 5) {
            $("#" + this.Id + "__selector_rect").attr("x", newX.toString());
            $("#" + this.Id + "__selector_rect").width(newWidth);
          }
        }

        if (objAxis.__rightEdgeDragging) {
          let elementX =
            Number($("#" + this.Id + "__selector_rect").offset().left) +
            Number($("#" + this.Id + "__selector_rect").width());
          let widthDiff = e.clientX - elementX;
          let newWidth =
            Number($("#" + this.Id + "__selector_rect").width()) + widthDiff;

          if (newWidth >= 5) {
            $("#" + this.Id + "__selector_rect").width(newWidth);
          }
        }

        if (!objAxis.__leftEdgeDragging && !objAxis.__rightEdgeDragging) {
          let width = Number($("#" + this.Id + "__selector_rect").width());
          let newX = e.clientX - objAxis.__selectorOffset;

          if (newX >= objAxis.StartPos && newX + width <= objAxis.EndPos) {
            $("#" + this.Id + "__selector_rect").attr("x", newX.toString());
          }
        }
      }
      $("#" + this.Id + "__selector_rect").css("cursor", "pointer");
      if (this.isMouseOverSelector(e)) {
        $("#" + this.Id + "__selector_rect").css("cursor", "pointer");

        if (this.isMouseOnLeftEdge(e) || this.isMouseOnRightEdge(e)) {
          $("#" + this.Id + "__selector_rect").css("cursor", "ew-resize");
        }
      } else {
        $("#" + this.Id + "__selector_rect").css("cursor", "default");
      }

      var eventArgs = new ChartMouseEvtArgs();

      eventArgs.x = e.offsetX;
      eventArgs.y = e.offsetY;

      this._onMouseMove.dispatch(eventArgs, 0);
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-mouseMove : " + error);

    }
  };

  mouseLeave = (e: any) => {
    try {
      if (this.hasSelector) {
        let objAxis = this.getAxisWithSelector();

        if (objAxis == null) {
          return;
        }
        objAxis.__selectorDragging = false;
        objAxis.__leftEdgeDragging = false;
        objAxis.__rightEdgeDragging = false;
        $("#" + this.Id + "__selector_rect").css("cursor", "default");
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-mouseLeave : " + error);
    }
  };

  //#region Selector Logic
  hasSelectorDragInProgress = () => {
    try {
      if (!this.hasSelector) {
        return false;
      }

      let objAxis = this.getAxisWithSelector();

      if (objAxis == null) {
        return false;
      }

      if (objAxis.__selectorDragging) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-hasSelectorDragInProgress : " + error);
      return false;
    }
  };

  isMouseOverSelector = (e: any) => {
    try {
      if (!this.hasSelector) {
        return false;
      }

      let x = e.clientX - $("#" + this.Id + "__selector_rect").offset().left;
      let width = Number($("#" + this.Id + "__selector_rect").width());

      if (x >= 0 && x <= width) {
        return true;
      }

      return false;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-isMouseOverSelector : " + error);
      return false;
    }
  };

  isMouseOnLeftEdge = (e: any) => {
    try {
      if (!this.hasSelector) {
        return false;
      }

      let x = e.clientX - $("#" + this.Id + "__selector_rect").offset().left;
      let width = Number($("#" + this.Id + "__selector_rect").width());

      if (x >= 0 && x <= 3) {
        return true;
      }

      return false;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-isMouseOnLeftEdge : " + error);
      return false;
    }
  };

  isMouseOnRightEdge = (e: any) => {
    try {
      if (!this.hasSelector) {
        return false;
      }

      let x = e.clientX - $("#" + this.Id + "__selector_rect").offset().left;
      let width = Number($("#" + this.Id + "__selector_rect").width());

      if (x >= width - 3) {
        return true;
      }

      return false;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-isMouseOnRightEdge : " + error);
      return false;
    }
  };

  getAxisWithSelector = () => {
    try {
      for (let key of this.Axes.keys()) {
        if (this.Axes.get(key).ShowSelector == true) {

          return this.Axes.get(key);
        }
      }

      return null;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-getAxisWithSelector : " + error);
      return null;
    }
  };

  hasSelector = () => {
    try {
      for (let key of this.Axes.keys()) {
        if (this.Axes.get(key).ShowSelector == true) {
          return this.Axes.get(key);
        }
      }

      return false;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-hasSelector : " + error);
      return false;
    }
  };

  selectorMouseUp = (e: any) => {
    try {
      let objAxis = this.getAxisWithSelector();

      if (objAxis == null) {
        return;
      }

      objAxis.__selectorDragging = false;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-selectorMouseUp : " + error);

    }
  };

  selectorMouseDown = (e: any) => {
    try {
      let objAxis = this.getAxisWithSelector();

      if (objAxis == null) {
        return;
      }

      objAxis.__selectorDragging = true;
      objAxis.__selectorOffset =
        e.clientX - Number($("#" + this.Id + "__selector_rect").attr("x"));

      objAxis.__leftEdgeDragging = false;
      objAxis.__rightEdgeDragging = false;

      $("#" + this.Id + "__selector_rect").css("cursor", "pointer");

      let x = e.clientX - $("#" + this.Id + "__selector_rect").offset().left;

      if (x >= 0 && x <= 3) {
        objAxis.__leftEdgeDragging = true;
      }

      let width = Number($("#" + this.Id + "__selector_rect").width());

      if (x > width - 3) {
        objAxis.__rightEdgeDragging = true;
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-selectorMouseDown : " + error);
    }
  };

  selectorMouseLeave = (e: any) => {
    try {
      let objAxis = this.getAxisWithSelector();

      if (objAxis == null) {
        return;
      }

      objAxis.__selectorDragging = false;
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-selectorMouseLeave : " + error);
    }
  };

  selectorMouseMove = (e: any) => {
    try {
      let objAxis = this.getAxisWithSelector();

      if (objAxis == null) {
        return;
      }

      if (!objAxis.__selectorDragging) {
        $("#" + this.Id + "__selector_rect").css("cursor", "pointer");

        let x = e.clientX - $("#" + this.Id + "__selector_rect").offset().left;

        if (x >= 0 && x <= 3) {
          $("#" + this.Id + "__selector_rect").css("cursor", "ew-resize");
        }

        let width = Number($("#" + this.Id + "__selector_rect").width());

        if (x > width - e) {
          $("#" + this.Id + "__selector_rect").css("cursor", "ew-resize");
        }
      }

      if (objAxis.__selectorDragging) {
        let newX = e.clientX - objAxis.__selectorOffset;

        if (!objAxis.__leftEdgeDragging && !objAxis.__rightEdgeDragging) {
          let rightLimit = objAxis.EndPos;
          let newRightEdge =
            newX + Number($("#" + this.Id + "__selector_rect").width());

          if (newRightEdge <= rightLimit && newX >= objAxis.StartPos) {
            $("#" + this.Id + "__selector_rect").attr("x", newX.toString());
          }
        }

        if (objAxis.__leftEdgeDragging) {
          let newX = e.clientX - objAxis.__selectorOffset;
          let selectorX = Number(
            $("#" + this.Id + "__selector_rect").attr("x")
          );

          let diff = newX - selectorX;
          let newWidth =
            Number($("#" + this.Id + "__selector_rect").width()) - diff;

          $("#" + this.Id + "__selector_rect").attr("x", newX);
        }
      }
    } catch (error) {
      this.objLogger.SendLog("Error ->CHART-selectorMouseMove : " + error);

    }
  };

  //#endregion
}
