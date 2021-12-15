import * as Chart from "../Chart/Chart";
import * as d3 from "d3";
import $ from "jquery";
import { AxisRange, AxisDateRange } from "../Chart/AxisRange";
import { arrays } from "typescript-collections";
import { dataSeriesType, DataSeries } from "./DataSeries";
import { map, max, Numeric } from "d3";
import { DateRange } from "@progress/kendo-react-scheduler/dist/npm/models";
import { EventDispatcher } from "strongly-typed-events";
import * as utilFunc from "../../utilFunctions/utilFunctions";
import { exit } from "process";
///"/utilFunctions/utilFunctions";


export enum axisPosition {
  left = 0,
  bottom = 1,
  right = 2,
  top = 3,
}

export enum axisLabelStyle {
  values = 0,
  labels = 1,
}

export class Axis {
  constructor() {
    try {
    } catch (error) { }
  }

  Id: string = "";
  Name: string = "";
  Position: axisPosition = axisPosition.left; //It would be top, left, bottom and right
  CustomPosition: boolean = false; //Determines if axis position is specified in custom location i.e. start and end position
  StartPos: number = 0; //Only applicable when CustomPosition is set to true, This is starting position of the axis in pixels
  EndPos: number = 0; //Only applicable when CustomPosition is set to true, This is ending position of the axis in pixels
  Title: string = "";
  ShowTitle: boolean = true;
  TitleFont: string = "Verdana";
  TitleFontColor: string = "white";
  TitleFontSize: number = 12;
  TitleFontBold: boolean = true;
  TitleFontItalic: boolean = true;
  TitleFontUnderLine: boolean = false;
  TitleAngle: number = 0; //Used to rotate title
  Inverted: boolean = false;
  Logarithmic: boolean = false; //Makes axis scale logarithmic
  GridVisible: boolean = true;
  GridColor: string = "red" //"#404142";
  GridLineStyle: Chart.lineStyle = Chart.lineStyle.solid;
  GridLineWidth: number = 1;
  IRelativePos: number = 0;
  ShowAxisLine: boolean = false; //Controls the visibility of axis line on the chart. If turned off, only ticks are visible on axis
  Visible: boolean = false;
  MinorGridVisible: boolean = false; //original false
  MinorGridColor: string = "blue" //"#727475";
  MinorGridLineStyle: Chart.lineStyle = Chart.lineStyle.solid;
  MinorGridLineWidth: number = 1;
  ShowLabels: boolean = true;
  LabelFont: string = "Verdana";
  LabelFontColor: string = "white";
  LabelFontSize: number = 12;
  LabelFontBold: boolean = true;
  LabelFontItalic: boolean = false;
  LabelFontUnderLine: boolean = false;
  LabelAngel: number = 0;

  LabelMultiline: boolean = false; //prath wip 06-10-2020
  isAllowScrolling: boolean = true; //prath
  isAllowZooming: boolean = true; //prath

  IsDateTime: boolean = false;
  DisplayOrder: number = 0;
  TicksCount: number = 5;
  TickLength: number = 0;
  IncrementVal: number = 1;
  DateIncrementVal: number = 1;
  NumberPrecision: number = 2;
  PaddingMin: number = 0; //Axis Padding Min %
  PaddingMax: number = 10; //Axis Padding Max %
  Labels: string[] = [];
  LabelStyle: axisLabelStyle = axisLabelStyle.values;
  NumericFormat: string = "00";
  DateFormat: string = "%b-%d-%Y %H:%M:%S";
  ShowSelector: boolean = false;
  NoOfAxisPerBlock: number = 2;
  ShowCustomAxisLabels: boolean = false;

  //Scaling
  AutoScale: boolean = true;
  Min: number = 0;
  Max: number = 0;
  MinDate: Date = new Date();
  MaxDate: Date = new Date();
  MaxWidthLabel: string = ""; // prath 14-08-2021

  bandScale: boolean = false;

  //External Reference
  ChartRef: Chart.Chart;
  ScaleRef: any;
  ScaleRefScroll: any;

  ScaleRef_x1: any; //for barchart

  AxisRef: any;
  __textHeight: number = 0;
  __textWidth: number = 0;
  __axisSize: number = 0;
  __selectorStartPos: number = 0;
  __selectorEndPos: number = 0;
  __selectorStartDatePos: Date = null;
  __selectorEndDatePos: Date = null;
  __tickSize: number = 0;
  __noOfTicks: number = 0; //added by prath
  __selectorEventsAttached: boolean = false;
  __selectorDragging: boolean = false;
  __selectorOffset: number = 0;
  __leftEdgeDragging: boolean = false;
  __rightEdgeDragging: boolean = false;
  __axisWidth: number = 0;

  private _onAxisDraw = new EventDispatcher<string, string>();

  get onAxisDraw() {
    return this._onAxisDraw.asEvent();
  }

  setInitialRange = () => {
    try {
      if (this.IsDateTime) {
        this.MinDate = new Date();
        this.MaxDate = new Date(
          this.MinDate.setHours(this.MinDate.getHours() + 24)
        );
      }

      if (!this.IsDateTime) {
        this.Min = 0;
        this.Max = 100;
      }
    } catch (error) { }
  };

  //Set Min & Max scale
  setMinMax = (min: number, max: number) => {
    try {
      if (!this.AutoScale) {
        this.Min = min;
        this.Max = max;
      }
    } catch (error) { }
  };

  getMin = (): any => {
    try {
      if (this.IsDateTime) {
        return this.MinDate;
      } else {
        return this.Min;
      }
    } catch (error) { }
  };

  getMax = (): any => {
    try {
      if (this.IsDateTime) {
        return this.MaxDate;
      } else {
        return this.Max;
      }
    } catch (error) { }
  };

  //Prathmesh : 28-08-2021 (to resolve trip speed plot spacing between legend & bottom axes title)
  getLongestLableValue = (lblArr: any) => {
    try {
      if (lblArr.length > 0) {
        let longest = this.Labels.sort(
          function (a, b) {
            return b.length - a.length;
          }
        )[0];
        return longest;
      }
    } catch (error) {
      return "";
    }
  }

  //Calculates the axis width that includes axis labels + axis title
  calculateAxisWidth = () => {
    try {
      let maxLabelWidth: number = 0;
      let maxLabelHeight: number = 0;

      //Maximum axis label width
      if (this.IsDateTime) {
        let formatFunc = d3.timeFormat(this.DateFormat);

        let objAxisRange: AxisDateRange = this.getAxisRange();
        let maxLabel: string = formatFunc(objAxisRange.Max);

        //added by prath on 28-08-2021 (to resolve trip speed plot spacing between legend & bottom axes title)
        if (this.Labels.length > 0) {
          maxLabel = this.getLongestLableValue(this.Labels).toString();
        }


        maxLabelWidth = this.ChartRef.calculateWidth(
          maxLabel,
          this.LabelFont,
          this.LabelFontSize.toString() + "px"
        );

        //keep in condition by prath on 28-08-2021
        if (this.Labels.length == 0) {
          maxLabelWidth = (maxLabelWidth * 70) / 100;
        }

        maxLabelHeight = this.ChartRef.calculateHeight(
          maxLabel,
          this.LabelFont,
          this.LabelFontSize.toString() + "px"
        );

        maxLabelHeight = maxLabelHeight * 2 + 5;
      } else {
        let objRange: AxisRange = this.getAxisRange();

        objRange.Max = Number.parseFloat(objRange.Max.toFixed(2).toString());
        objRange.Min = Number.parseFloat(objRange.Min.toFixed(2).toString());

        //prath 17-08-2021 change
        // maxLabelWidth = this.ChartRef.calculateWidth(
        //   objRange.Max.toString(),
        //   this.LabelFont,
        //   this.LabelFontSize.toString() + "px"
        // );

        if (this.LabelMultiline) {
          maxLabelWidth = this.ChartRef.calculateWidth(
            objRange.MaxWidthLabel.toString(),
            this.LabelFont,
            this.LabelFontSize.toString() + "px"
          );
        } else {
          maxLabelWidth = this.ChartRef.calculateWidth(
            objRange.Max.toString(),
            this.LabelFont,
            this.LabelFontSize.toString() + "px"
          );
        }
        //=============

        maxLabelHeight = this.ChartRef.calculateHeight(
          objRange.Max.toString(),
          this.LabelFont,
          this.LabelFontSize.toString() + "px"
        );
      }

      //Height of the title
      let TitleHeight: number = this.ChartRef.calculateHeight(
        this.Title,
        this.TitleFont,
        this.TitleFontSize.toString() + "px"
      );

      let TitleWidth: number = this.ChartRef.calculateWidth(
        this.Title,
        this.TitleFont,
        this.TitleFontSize.toString() + "px"
      );

      let titleSpace: number = 0;

      if (!this.ShowTitle) {
        titleSpace = 0;
      } else {
        if (this.TitleAngle == 0) {
          titleSpace = TitleHeight;
        } else {
          titleSpace = TitleWidth;
        }
      }

      let labelSpace: number = 0;

      if (
        this.Position == axisPosition.left ||
        this.Position == axisPosition.right
      ) {
        if (this.LabelAngel == 0) {
          labelSpace = maxLabelWidth;
        } else {
          labelSpace = maxLabelHeight;
        }
      } else {
        if (this.LabelAngel == 0) {
          labelSpace = maxLabelHeight;
        } else {
          labelSpace = maxLabelWidth;
        }
      }

      if (!this.ShowLabels || !this.Visible) {
        labelSpace = 0;
      }

      this.__axisWidth = titleSpace + labelSpace + 10;
      
    } catch (error) {
      alert(error + " - " + this.Id);

     }
  };

  //Creates actual d3 axis on the chart
  createAxis = (pChartRef: Chart.Chart) => {
    try {
      //assign the reference
       
     this.Id= this.Id.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'_');
     
      this.ChartRef = pChartRef;
      

      if (this.IsDateTime) {
        //We will use initial scale
        let lnMaxDate = new Date();
        let lnMinDate = new Date();
        lnMinDate.setHours(lnMaxDate.getHours() - 24);

        if (!this.Inverted) {
          this.ScaleRef = d3
            .scaleTime()
            .domain([lnMinDate, lnMaxDate])
            .range([this.StartPos, this.EndPos]);
        } else {
          this.ScaleRef = d3
            .scaleTime()
            .domain([lnMaxDate, lnMinDate])
            .range([this.StartPos, this.EndPos]);
        }
      }

      if (this.Logarithmic) {
        let lnMin = 1;
        let lnMax = 100;

        if (!this.Inverted) {
          this.ScaleRef = d3
            .scaleLog()
            .domain([lnMin, lnMax])
            .range([this.StartPos, this.EndPos]);
        } else {
          this.ScaleRef = d3
            .scaleLog()
            .domain([lnMax, lnMin])
            .range([this.StartPos, this.EndPos]);
        }
      }

      //Scale band for bar charts
      if (this.bandScale) {
        //this.ScaleRef = d3.scaleBand().domain([ '0' ]).range([ this.StartPos, this.EndPos ]).round(false);
        this.ScaleRef = d3
          .scaleBand()
          .domain(["0"])
          .range([this.StartPos, this.EndPos])
          .paddingInner(0.5) //spacing between bar point
          .round(false);

        //for normal bar chart
        this.ScaleRef_x1 = d3.scaleBand().padding(0.05);
      }

      if (!this.IsDateTime && !this.Logarithmic && !this.bandScale) {
        let lnMin = 0;
        let lnMax = 100;

        if (!this.Inverted) {
          this.ScaleRef = d3
            .scaleLinear()
            .domain([lnMin, lnMax])
            .range([this.StartPos, this.EndPos]);
        } else {
          this.ScaleRef = d3
            .scaleLinear()
            .domain([lnMax, lnMin])
            .range([this.StartPos, this.EndPos]);
        }
      }

      if (this.Position == axisPosition.left) {
        this.AxisRef = d3.axisLeft(this.ScaleRef);
      }

      if (this.Position == axisPosition.top) {
        this.AxisRef = d3.axisTop(this.ScaleRef);
      }

      if (this.Position == axisPosition.bottom) {
        this.AxisRef = d3.axisBottom(this.ScaleRef);
      }

      if (this.Position == axisPosition.right) {
        this.AxisRef = d3.axisRight(this.ScaleRef);
        
      }

      //we've created the axis, now time to append it to SVG ref
      //set the x & y position to start the axis drawing
      let x = 0;
      let y = 0;

      if (
        this.Position == axisPosition.left ||
        this.Position == axisPosition.right
      ) {
        x = this.IRelativePos;
        y = this.StartPos;
      } else {
        x = this.StartPos;
        y = this.IRelativePos;
      }
      
      this.ChartRef.SVGRef.append("g")
        .attr("transform", "translate(" + x + "," + y + ")")
        .attr("id", this.Id)
        .attr("fill", this.LabelFontColor)
        .attr("stroke", this.LabelFontColor)
        .call(this.AxisRef);

      this.__selectorStartPos = 100;
      this.__selectorEndPos = 500;
      
    } catch (error) { }
  };

  updateSelectorPosReverse = () => {
    try {
      let x1 = Number($("#" + this.ChartRef.Id + "__selector_rect").attr("x"));
      let x2 =
        x1 + Number($("#" + this.ChartRef.Id + "__selector_rect").width());

      if (this.IsDateTime) {
        //alert("-- update selectorPosReverse assign start position");

        this.__selectorStartDatePos = this.ScaleRef.invert(x1);
        this.__selectorEndDatePos = this.ScaleRef.invert(x2);
      } else {
        this.__selectorStartPos = this.ScaleRef.invert(x1);
        this.__selectorEndPos = this.ScaleRef.invert(x2);
      }
    } catch (error) { }
  };

  //Determines the axis tick length
  //prath
  formatAxis = () => {
    
    let maxLabel = "";


    if (this.IsDateTime) {
      let objRange: AxisDateRange = this.getAxisRange();

      let formatFunc = d3.timeFormat(this.DateFormat);
      maxLabel = formatFunc(objRange.Max);
    } else {

      let objRange: AxisRange = this.getAxisRange();
      objRange.Max = Number.parseFloat(objRange.Max.toFixed(2).toString());
      objRange.Min = Number.parseFloat(objRange.Min.toFixed(2).toString());
      objRange.MaxWidthLabel = objRange.MaxWidthLabel; //prath 14-08-2021;

      //changes by prath on 14-08-2021 (for multiline label width)
      maxLabel = objRange.Max.toString();
      if (this.LabelMultiline && this.bandScale == false) {
        maxLabel = objRange.MaxWidthLabel.toString();
      }
      //===========
    }

    let textWidth = this.ChartRef.calculateWidth(
      maxLabel,
      this.LabelFont,
      this.LabelFontSize.toString()
    );
    let textHeight = this.ChartRef.calculateHeight(
      maxLabel,
      this.LabelFont,
      this.LabelFontSize.toString()
    );

    let titleWidth = this.ChartRef.calculateWidth(
      this.Title,
      this.TitleFont,
      this.TitleFontSize.toString()
    );
    let titleHeight = this.ChartRef.calculateHeight(
      this.Title,
      this.TitleFont,
      this.TitleFontSize.toString()
    );

    let tickFactor = 1;
    let requiredTicks = 1;

    if (
      this.Position == axisPosition.left ||
      this.Position == axisPosition.right
    ) {
      if (this.LabelAngel == 0) {
        requiredTicks = this.__axisSize / textHeight;
      } else {
        requiredTicks = this.__axisSize / textWidth;
      }
    } else {
      if (this.LabelAngel == 0) {
        requiredTicks = this.__axisSize / textWidth;
      } else {
        requiredTicks = this.__axisSize / textHeight;
      }
    }

    if (requiredTicks > 0) {
      requiredTicks = requiredTicks / 2;
    }

    if (this.bandScale) {
      //First calculate with factor 1
      var ticks = this.ScaleRef.domain().filter(function (d, i) {
        return !(i % tickFactor);
      });

      if (ticks.length > requiredTicks) {
        tickFactor = ticks.length / requiredTicks;

        if (tickFactor < 1) {
          tickFactor = 1;
        }
      } else {
        tickFactor = 1;
      }

      var ticks = this.ScaleRef.domain().filter(function (d, i) {
        if (tickFactor == 1) {
          return true;
        } else {
          if (i % Math.ceil(tickFactor) == 0) {
            return true;
          } else {
            return false;
          }
        }
      });

      this.AxisRef.tickValues(ticks);
    }

    //Add Title to the axis
    if (this.Position == axisPosition.left) {

      let titleX = 0;
      let titleY = 0;
      
      
      if (this.LabelAngel == 0) {
        if (this.ShowLabels) {
          titleX = this.IRelativePos - textWidth - titleHeight;
        } else {
          titleX = this.IRelativePos - titleHeight;
        }
      } else {
        if (this.ShowLabels) {
          //Change by prath 07-Dec-2021 (custom chart)
          //titleX = this.IRelativePos - textHeight - titleWidth; 
          titleX = this.IRelativePos - textHeight - titleHeight; 
        } else {
          titleX = this.IRelativePos - titleWidth;
        }
      }

      titleY = this.StartPos + (this.EndPos - this.StartPos) / 2;

      let title = $("#title_" + this.Id)[0];

      if (title == undefined) {
        this.ChartRef.SVGRef.append("g").attr("id", "title_" + this.Id);
        this.ChartRef.SVGRef.select("#title_" + this.Id).append("text");
      }

      this.ChartRef.SVGRef.select("#title_" + this.Id)
        .attr("class", "axis-title") //custom axis title from base color  01-10-2020
        .attr("transform", "translate(" + titleX + "," + titleY + ")")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-weight", this.LabelFontBold == true ? "bold" : "normal")
        .attr("font-style", this.TitleFontItalic == true ? "italic" : "normal")
         .select("text")
        .attr("transform", "rotate(-90)")
        .text(this.Title);

        //alert(this.Title + " - " + titleX);

        
      if (!this.ShowTitle) {
        this.ChartRef.SVGRef.select("#title_" + this.Id).attr(
          "fill",
          "transparent"
        );
        this.ChartRef.SVGRef.select("#title_" + this.Id).remove();
      }
    }

    if (this.Position == axisPosition.right) {
      let titleX = 0;
      let titleY = 0;

      if (this.LabelAngel == 0) {
        if (this.ShowLabels) {
          titleX = this.IRelativePos + textWidth + titleHeight;
        } else {
          titleX = this.IRelativePos + titleHeight;
        }
      } else {
        if (this.ShowLabels) {
          titleX = this.IRelativePos + textHeight + titleHeight;
        } else {
          titleX = this.IRelativePos + titleHeight;
        }
      }

      titleY = this.StartPos + (this.EndPos - this.StartPos) / 2;

      let title = $("#title_" + this.Id)[0];

      if (title == undefined) {
        this.ChartRef.SVGRef.append("g").attr("id", "title_" + this.Id);
        this.ChartRef.SVGRef.select("#title_" + this.Id).append("text");
      }

      this.ChartRef.SVGRef.select("#title_" + this.Id)
        .attr("class", "axis-title") //custom axis title from base color  01-10-2020
        .attr("transform", "translate(" + titleX + "," + titleY + ")")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-weight", this.TitleFontBold == true ? "bold" : "normal")
        .attr("font-style", this.TitleFontItalic == true ? "italic" : "normal")
        .select("text")

        .attr("transform", "rotate(-90)")
        .text(this.Title);

      if (!this.ShowTitle) {
        this.ChartRef.SVGRef.select("#title_" + this.Id).attr(
          "fill",
          "transparent"
        );

        this.ChartRef.SVGRef.select("#title_" + this.Id).remove();
      }
    }

    if (this.Position == axisPosition.bottom) {

      let titleX = 0;
      let titleY = 0;

      titleX = this.StartPos + (this.EndPos - this.StartPos) / 2;


      if (this.IsDateTime) {
        if (this.ShowTitle) {
          titleY = this.IRelativePos + titleHeight + textHeight * 2;
        } else {
          titleY = this.IRelativePos;
        }
      } else {
        if (this.LabelAngel == 0) {
          if (this.ShowLabels) {
            //prath 06-10-2020 wip

            if (this.Labels.length > 0) {


              if (this.Labels[0].split("~").length > 1) {
                ////alert(this.Id);
                this.LabelMultiline = true;
              }
            } else {
              this.LabelMultiline = false;
            }

            if (this.LabelMultiline) {
              //Axis title in multiple line
              titleY = this.IRelativePos + titleHeight + textHeight * 4;
            } else {
              titleY = this.IRelativePos + textHeight + textHeight; //original
            }
          } else {
            titleY = this.IRelativePos;
          }
        } else {
          if (this.ShowLabels) {
            titleY = this.IRelativePos + textWidth + textHeight;
          } else {
            titleY = this.IRelativePos;
          }
        }
      }

      let title = $("#title_" + this.Id)[0];

      if (title == undefined) {
        this.ChartRef.SVGRef.append("g").attr("id", "title_" + this.Id);
        this.ChartRef.SVGRef.select("#title_" + this.Id).append("text");
      }
      this.ChartRef.SVGRef.select("#title_" + this.Id)
        .attr("class", "axis-title") //custom axis title from base color  01-10-2020 in CSS
        .attr("transform", "translate(" + titleX + "," + titleY + ")")
        .attr("text-anchor", "middle")
        .attr("font-weight", this.TitleFontBold == true ? "bold" : "normal")
        .attr("font-style", this.TitleFontItalic == true ? "italic" : "normal")
        .attr("fill", "white")
        .select("text")
        .text(this.Title);

      if (!this.ShowTitle) {
        this.ChartRef.SVGRef.select("#title_" + this.Id).attr(
          "fill",
          "transparent"
        );

        this.ChartRef.SVGRef.select("#title_" + this.Id).remove();
      }
    }

    if (this.Position == axisPosition.top) {
      let titleX = 0;
      let titleY = 0;

      titleX = this.StartPos + (this.EndPos - this.StartPos) / 2;

      if (this.IsDateTime) {
        if (this.ShowTitle) {
          titleY = this.IRelativePos - textHeight * 2;
        } else {
          titleY = this.IRelativePos;
        }
      } else {
        if (this.LabelAngel == 0) {
          if (this.ShowLabels) {
            titleY = this.IRelativePos - titleHeight - textHeight;
          } else {
            titleY = this.IRelativePos - titleHeight;
          }
        } else {
          if (this.ShowLabels) {
            titleY = this.IRelativePos - textWidth - titleHeight;

          } else {
            titleY = this.IRelativePos;
          }
        }
      }

      let title = $("#title_" + this.Id)[0];

      if (title == undefined) {
        this.ChartRef.SVGRef.append("g").attr("id", "title_" + this.Id);
        this.ChartRef.SVGRef.select("#title_" + this.Id).append("text");
      }

      this.ChartRef.SVGRef.select("#title_" + this.Id)
        .attr("class", "axis-title") //custom axis title from base color  01-10-2020
        .attr("transform", "translate(" + titleX + "," + titleY + ")")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-weight", this.TitleFontBold == true ? "bold" : "normal")
        .attr("font-style", this.TitleFontItalic == true ? "italic" : "normal")
        .select("text")
        .text(this.Title);

      if (!this.ShowTitle) {
        this.ChartRef.SVGRef.select("#title_" + this.Id).attr(
          "fill",
          "transparent"
        );

        this.ChartRef.SVGRef.select("#title_" + this.Id).remove();
      }
    }

    let tickSize: number = 0;

    //find the tick size from other partner axis
    if (
      this.Position == axisPosition.left ||
      this.Position == axisPosition.right
    ) {
      tickSize = this.ChartRef.__chartRect.right - this.IRelativePos;
    } else {
      tickSize = this.ChartRef.__chartRect.height;
    }

    if (this.Position == axisPosition.left) {
      tickSize = this.ChartRef.__chartRect.right - this.IRelativePos;
    }

    if (this.Position == axisPosition.right) {
      tickSize = this.IRelativePos - this.ChartRef.__chartRect.left;
    }

    if (this.Position == axisPosition.top) {
      tickSize = this.ChartRef.__chartRect.bottom - this.IRelativePos;
    }

    if (this.Position == axisPosition.bottom) {
      tickSize = this.IRelativePos - this.ChartRef.__chartRect.top;
    }

    this.__tickSize = tickSize;

    //determine no. of ticks that can be displayed on left axis
    if (this.LabelStyle == axisLabelStyle.labels && this.bandScale) {
      let noOfTicks = this.ScaleRef.domain().length;
      this.__noOfTicks = noOfTicks;

      //add ticks now
      this.AxisRef.tickSize(-tickSize);

      if (this.IsDateTime) {
        this.AxisRef.tickFormat((d, i) => {
          if (i >= 0 && i < this.Labels.length) {
            return this.Labels[i] + " ";
          } else {
            return d;
            //let formatter = d3.timeFormat(this.DateFormat);
            //return formatter(d);
          }
        });
      } else {
        this.AxisRef.tickFormat((d, i) => {
          if (i >= 0 && i < this.Labels.length) {
            return this.Labels[i];
          } else {
            let formatter = d3.format(this.NumericFormat);
            return formatter(d);
          }
        });
      }
    }

    if (this.LabelStyle == axisLabelStyle.values && this.bandScale) {
      let noOfTicks = this.ScaleRef.domain().length;
      this.__noOfTicks = noOfTicks;
      //add ticks now

      this.AxisRef.tickSize(-tickSize);

      if (this.IsDateTime) {
        this.AxisRef.tickFormat(d3.timeFormat(this.DateFormat));
      } else {
        this.AxisRef.tickFormat(d3.format(this.NumericFormat));
      }
    }

    if (this.LabelStyle == axisLabelStyle.values && !this.bandScale) {
      let noOfTicks = 0;

      if (
        this.Position == axisPosition.left ||
        this.Position == axisPosition.right
      ) {
        if (this.LabelAngel == 0) {
          noOfTicks = this.__axisSize / (textHeight + 5); //5 px gap between ticks
        } else {
          noOfTicks = this.__axisSize / (textWidth + 5); //5 px gap between ticks
        }
      } else {
        if (this.LabelAngel == 0) {
          noOfTicks = this.__axisSize / (textWidth + 5); //5 px gap between ticks

          //Add by prath (Drilling summary(ROP Line chart) to control overwrite ticks while zoom)
          //fuck
          if (this.Labels.length > 0) {
            noOfTicks = noOfTicks / 2;
            noOfTicks = Math.floor(noOfTicks);
          }
          //===========================
        } else {
          noOfTicks = this.__axisSize / (textHeight + 5); //5 px gap between ticks
        }
      }

      if (noOfTicks <= 0) {
        noOfTicks = 1;
      }

      if (noOfTicks > 20) {
        noOfTicks = 20;
      }

      noOfTicks = Math.ceil(noOfTicks);
      this.__noOfTicks = noOfTicks;
      //add ticks now  WIP

      this.AxisRef.tickSize(-tickSize);
      this.AxisRef.ticks(noOfTicks);

      if (this.IsDateTime) {
        this.AxisRef.tickFormat(d3.timeFormat(this.DateFormat));
      } else {
        this.AxisRef.tickFormat(d3.format(this.NumericFormat));
      }
    }

    this.ChartRef.SVGRef.select("#" + this.Id).call(this.AxisRef);

    let dashArray: string = "0";

    if (this.GridLineStyle == Chart.lineStyle.solid) {
      dashArray = "0";
    }

    if (this.GridLineStyle == Chart.lineStyle.dashed) {
      dashArray = "5,2";
    }

    //format ticks
    this.ChartRef.SVGRef.select("#" + this.Id)
      .selectAll(".tick")
      .attr(
        "style",
        "stroke-width:0px;" + "stroke-dasharray:" + dashArray + ";"
      )
      .select("line")
      // .attr("stroke", this.GridColor)
      .attr("class", "chart_grid_color")

      .attr("stroke-width", "1px")
      .selectAll("text")
      .attr("style", "stroke-dasharray:0;font-family:arial;font-size:15px");

    this.ChartRef.SVGRef.select("#" + this.Id)
      .selectAll(".tick text")
      .attr("font-weight", this.LabelFontBold == true ? "bold" : "normal")
      .attr(
        "style",
        "stroke-dasharray:0;font-family:" +
        this.LabelFont +
        ";font-size:" +
        this.LabelFontSize +
        "px"
      );

    if (this.ShowLabels) {
      this.ChartRef.SVGRef.select("#" + this.Id)

        .selectAll(".tick")
        //.attr("style",)
        .select("text")
        .attr("fill", "currentColor");
    } else {
      this.ChartRef.SVGRef.select("#" + this.Id)
        .selectAll(".tick")
        .select("text")
        .attr("fill", "transparent");

      this.ChartRef.SVGRef.select("#" + this.Id)
        .selectAll(".tick")
        .select("text")
        .remove();
    }

    if (this.LabelAngel != 0) {
      //prath 28-09-2021 (to control anchor posion of top axis)
      let textAnchor = "end";
      if (this.Position == axisPosition.top) {
        textAnchor = "middle";
      }

      this.ChartRef.SVGRef.select("#" + this.Id)
        .selectAll(".tick")
        .select("text")
        .attr("text-anchor", textAnchor)
        .attr("transform", "rotate(-" + this.LabelAngel + ")");
    }

    $(".domain").attr("stroke", "transparent");

    //Hide or show axis
    if (!this.GridVisible) {
      this.ChartRef.SVGRef.select("#" + this.Id)
        .selectAll(".tick")
        .attr("stroke-width", "0px")
        .select("line")
        // .attr("stroke", this.GridColor)
        .attr("class", "chart_grid_color")
        .attr("stroke-width", "1px")
        .style("display", "none");
    } else {
      this.ChartRef.SVGRef.select("#" + this.Id)
        .selectAll(".tick")
        .attr("stroke-width", "0px")
        .select("line")
        // .attr("stroke", this.GridColor)
        .attr("class", "chart_grid_color")
        .attr("stroke-width", "1px")
        .style("display", "");
    }

    //update the position of axis also
    //set the x & y position to start the axis drawing
    let x = 0;
    let y = 0;
    
    if (
      this.Position == axisPosition.left ||
      this.Position == axisPosition.right
    ) {
           
      //Original
      x = this.IRelativePos;
      y = this.StartPos;
      if (this.Position == axisPosition.left) {
        this.ChartRef.__chartRect.LeftEdge = this.IRelativePos;
      }

    } else {
      x = this.StartPos;
      y = this.IRelativePos;
    }

    //We only need to specify relative position for transformation
    if (
      this.Position == axisPosition.left ||
      this.Position == axisPosition.right
    ) {
      this.ChartRef.SVGRef.select("#" + this.Id)
        .attr("transform", "translate(" + x + "," + "0" + ")")
        .call(this.AxisRef);
    }

    if (this.Position == axisPosition.bottom || this.Position == axisPosition.top) {
      if (this.Position == axisPosition.top) {
        //To stop overwrite top axis label print over chart
        this.ChartRef.SVGRef.select("#" + this.Id)
          .attr("transform", "translate(" + "0" + "," + (y - 20) + ")")
          .call(this.AxisRef);
      } else {
        this.ChartRef.SVGRef.select("#" + this.Id)
          .attr("transform", "translate(" + "0" + "," + y + ")")
          .call(this.AxisRef);
      }


    }

    if (this.ShowSelector) {
      if (this.IsDateTime) {
        if (this.__selectorStartDatePos == null) {
          //calculate difference of range
          let diffSeconds = this.MaxDate.getTime() - this.MinDate.getTime();
          if (diffSeconds > 0) {
            diffSeconds = diffSeconds / 1000;
          }

          if (diffSeconds > 60) {
            // prath 24-Nov-2021 (Selector change from 10% to 1 day)
            //let addDiff = (diffSeconds * 10) / 100;
            let addDiff = 86400;
            //=============
            this.__selectorEndDatePos = this.MaxDate;
            this.__selectorStartDatePos = new Date(
              this.MaxDate.valueOf() - addDiff * 1000
            );
          } else {
            if (diffSeconds == 0) {
              this.__selectorEndDatePos = null;
              this.__selectorStartDatePos = null;
            } else {
              this.__selectorEndDatePos = this.MinDate;
              this.__selectorStartDatePos = this.MaxDate;
            }
          }
        }

        let selWidth =
          this.ScaleRef(this.__selectorEndDatePos) -
          this.ScaleRef(this.__selectorStartDatePos);

        this.ChartRef.SVGRef.select("." + this.ChartRef.Id + "__selector")
          .select("rect")
          .attr("x", this.ScaleRef(this.__selectorStartDatePos))
          .attr("y", 0)
          .attr("width", selWidth)
          .attr("height", this.__tickSize);
      } else {
        if (this.__selectorStartPos == 0 && this.__selectorEndPos == 0) {
          //calculate difference of range
          let diff = this.Max - this.Min;
          
          if (diff > 0) {
            //For Not a date axes
            let addDiff = (diff * 10) / 100;
            this.__selectorEndPos = this.Max;
            this.__selectorStartPos = this.Max - addDiff;
          } else {
            this.__selectorStartPos = 0;
            this.__selectorEndPos = 0;
          }
        }

        let selWidth =
          this.ScaleRef(this.__selectorEndPos) -
          this.ScaleRef(this.__selectorStartPos);



        this.ChartRef.SVGRef.select("." + this.ChartRef.Id + "__selector")
          .select("rect")
          .attr("x", this.ScaleRef(this.__selectorStartPos))
          .attr("y", 0)
          .attr("width", selWidth)
          .attr("height", this.__tickSize);
      }
    }

    //Split the axes labels in two lines
    if (this.IsDateTime) {

      try {
        let sel = this.ChartRef.SVGRef.select("#" + this.Id).selectAll(
          "#" + this.Id + " .tick text"
        );

        let arr: any[] = sel._groups[0];

        for (let i = 0; i < arr.length; i++) {
          let textElement = $(arr[i]);

          let currentText = textElement.text();
          let s = currentText.split(" ");

          textElement.text("");

          textElement.html(
            "<tspan x=0 y='0.5em'>" +
            s[0] +
            "</tspan><tspan x=0 y='2.5em'>" +
            s[1] +
            "</tspan>"
          );
        }
      } catch (error) { }
    } else {
      try {




        let sel = this.ChartRef.SVGRef.select("#" + this.Id).selectAll(
          "#" + this.Id + " .tick text"
        );

        let arr: any[] = sel._groups[0];
        //array of lables
        if (arr.length > 0) {


          for (let i = 0; i < arr.length; i++) {
            let textElement = $(arr[i]);

            let currentText = textElement.text();

            if (this.Labels.length > 0) {
              //Multi line labels for (bar Chart)
              if (this.bandScale) {
                
                for (let index = 0; index < this.Labels.length; index++) {

                  //Changes done as on 09-Dec-2021 PRATH (Custom drilling summary for Bar Chart)
                  // const labelText = this.Labels[index].split("~")[0];
                  // if (labelText == currentText) {
                  //   currentText = this.Labels[index];
                  // }

                  const labelText = this.Labels[index].split("~")[0];
                  if (i == index) {
                    currentText = this.Labels[index];
                    textElement.html(currentText);
                  }
                  
                  //==============

               
                }
              } else {
                //Multi line labels 19-08-2021 for (number axes) - prath
                let newText = "";
                for (let index = 0; index < this.Labels.length; index++) {
                  let arr = this.Labels[index].split("~");
                  if (eval(currentText) >= eval(arr[0])) {
                    newText = currentText + "~" + arr[1] + "~" + arr[2];
                  }
                }
                currentText = newText;
              }



            }
            //===========================



            let s = currentText.split("~");
            if (s.length > 1) {
              textElement.text("");
              let newTxt = "";
              for (let index = 1; index <= s.length; index++) {
                const element = s[index];
                newTxt +=
                  "<tspan x=0 y='" +
                  1.0 * (index * 2) +
                  "em'>" +
                  s[index - 1] +
                  "</tspan>";
              }
              textElement.html(newTxt);

            }
          }
        }
      } catch (error) { }
    }

    // Commented duplicate code prath on 12-Dec-2021 Prath  (Need to verify - Nitin)
    // if (this.Position == axisPosition.left) {
    //   let titleX = 0;
    //   let titleY = 0;

    //   if (this.LabelAngel == 0) {
    //     if (this.ShowLabels) {
    //       titleX = this.IRelativePos - textWidth - titleHeight;
    //     } else {
    //       titleX = this.IRelativePos - titleHeight;
    //     }
    //   } else {
    //     if (this.ShowLabels) {
    //       titleX = this.IRelativePos - textHeight - titleWidth;
    //     } else {
    //       titleX = this.IRelativePos - titleWidth;
    //     }
    //   }

    //   titleY = this.StartPos + (this.EndPos - this.StartPos) / 2;

    //   let title = $("#title_" + this.Id)[0];

    //   if (title == undefined) {
    //     this.ChartRef.SVGRef.append("g").attr("id", "title_" + this.Id);
    //     this.ChartRef.SVGRef.select("#title_" + this.Id).append("text");
    //   }

    //   this.ChartRef.SVGRef.select("#title_" + this.Id)

    //     .attr("transform", "translate(" + titleX + "," + titleY + ")")
    //     .attr("text-anchor", "middle")
    //     .attr("fill", "white")
    //     .select("text")
    //     .attr("transform", "rotate(-90)")
    //     .text(this.Title);

    //   if (!this.ShowTitle) {
    //     this.ChartRef.SVGRef.select("#title_" + this.Id).attr(
    //       "fill",
    //       "transparent"
    //     );
    //     this.ChartRef.SVGRef.select("#title_" + this.Id).remove();
    //   }
    // }
  }
  //


  updateAxis = () => {
    try {
      

      if (!this.__selectorEventsAttached) {
        let selectorElement = $("#" + this.ChartRef.Id + "__selector_rect");

        if (selectorElement.length > 0) {
          this.__selectorEventsAttached = true;
        }
      }

      //update the position of the axis
      if (this.IsDateTime) {
        let objAxisDateRange: AxisDateRange = this.getAxisRange();
        this.MinDate = objAxisDateRange.Min;
        this.MaxDate = objAxisDateRange.Max;

        if (!this.Inverted) {
          this.ScaleRef.domain([objAxisDateRange.Min, objAxisDateRange.Max]);
        } else {
          this.ScaleRef.domain([objAxisDateRange.Max, objAxisDateRange.Min]);
        }
      }

      if (this.bandScale) {
        //loop through
        
        let uniqueValues: Map<string, string> = new Map();
        let uniqueDateValues: Map<Date, Date> = new Map();

        for (let key of this.ChartRef.DataSeries.keys()) {
          let objDataSeries = this.ChartRef.DataSeries.get(key);

          if (this.IsDateTime) {
            for (let d = 0; d < objDataSeries.Data.length; d++) {
              if (
                uniqueDateValues.get(objDataSeries.Data[d].datetime) ==
                undefined ||
                uniqueDateValues.get(objDataSeries.Data[d].datetime) == null
              ) {
                uniqueDateValues.set(
                  objDataSeries.Data[d].datetime,
                  objDataSeries.Data[d].datetime
                );
              }
            }
          } else {
            if (
              this.Position == axisPosition.left ||
              this.Position == axisPosition.right
            ) {
              for (let d = 0; d < objDataSeries.Data.length; d++) {
                if (
                  uniqueValues.get(objDataSeries.Data[d].y.toString()) ==
                  undefined ||
                  uniqueValues.get(objDataSeries.Data[d].y.toString()) == null
                ) {
                  uniqueValues.set(
                    objDataSeries.Data[d].y.toString(),
                    objDataSeries.Data[d].y.toString()
                  );
                }
              }
            } else {
              for (let d = 0; d < objDataSeries.Data.length; d++) {
                if (
                  uniqueValues.get(objDataSeries.Data[d].x.toString()) ==
                  undefined ||
                  uniqueValues.get(objDataSeries.Data[d].x.toString()) == null
                ) {
                  uniqueValues.set(
                    objDataSeries.Data[d].x.toString(),
                    objDataSeries.Data[d].x.toString()
                  );
                }
              }
            }
          }
        }
        
        //Determine how many axis labels can be plotted on the axis
        let maxBars = this.__axisSize / 5;

        if (this.IsDateTime) {
          let domainValues: Date[] = new Array();

          for (let key of uniqueDateValues.keys()) {
            domainValues.push(key);
          }

          //Assign this domain to the scale
          this.ScaleRef.domain(domainValues);
        } else {
          let domainValues: string[] = new Array();

          for (let key of uniqueValues.keys()) {
            domainValues.push(key);
          }

          //Assign this domain to the scale
          this.ScaleRef.domain(domainValues);
        }
      }

      this.ScaleRef.range([this.StartPos, this.EndPos]);

      if (!this.IsDateTime && !this.bandScale) {

        
        let objAxisRange: AxisRange = this.getAxisRange();
        this.MaxWidthLabel = objAxisRange.MaxWidthLabel; //prath 14-08-2021 (for Multiline label)

        this.Min = objAxisRange.Min;
        this.Max = objAxisRange.Max;

        if (
          this.Position == axisPosition.left ||
          this.Position == axisPosition.right
        ) {
          ////added by prath for inverted axis

          if (!this.Inverted) {
            
            this.ScaleRef.domain([objAxisRange.Max, objAxisRange.Min]);
          } else {
            this.ScaleRef.domain([objAxisRange.Min, objAxisRange.Max]);
          }
        } else {
          //Nitin Code for all axis left/rigt/top/bottom -- Added above condition by prath to control inverted axis of left & right
          if (!this.Inverted) {
            this.ScaleRef.domain([objAxisRange.Min, objAxisRange.Max]);
          } else {
            this.ScaleRef.domain([objAxisRange.Max, objAxisRange.Min]);
          }
        }
        //==============

        // let objAxisRange: AxisRange = this.getAxisRange();

        // this.Min = objAxisRange.Min;
        // this.Max = objAxisRange.Max;

        // this.ScaleRef.range([this.StartPos, this.EndPos]);
        // if (this.Position == axisPosition.left || this.Position == axisPosition.right) {
        //   if (!this.Inverted) {
        //     this.ScaleRef.domain([objAxisRange.Max, objAxisRange.Min]);
        //   } else {
        //     this.ScaleRef.range([this.EndPos, this.StartPos]);
        //     this.ScaleRef.domain([objAxisRange.Max, objAxisRange.Min]);
        //   }

        // } else {
        //   if (!this.Inverted) {
        //     this.ScaleRef.domain([objAxisRange.Min, objAxisRange.Max]);
        //   } else {
        //     this.ScaleRef.domain([objAxisRange.Max, objAxisRange.Min]);
        //   }

        // }
      }
      //=================================
      this.formatAxis();

    } catch (error) { }
  };

  //This is special function which is used to determine max and min of axis in case of stacked bar chart
  //we'll have to stack up data of each unique x/y values to determine max and min of all the series
  private getAxisRangeStacked = (): any => {
    try {
      let hasDateTimeValues = false;

      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (this.Position == axisPosition.left || this.Position == axisPosition.right) {
          if (this.ChartRef.Axes.get(objSeries.XAxisId).IsDateTime) {
            hasDateTimeValues = true;
          }
        } else {
          if (this.ChartRef.Axes.get(objSeries.YAxisId).IsDateTime) {
            hasDateTimeValues = true;
          }
        }
      }

      if (hasDateTimeValues) {
        //First date time axis type
        //X bound data
        let lMin: number = 0;
        let lMax: number = 0;

        let uniqueValues: Map<Date, Date> = new Map();
        let stackValues: Map<Date, number> = new Map();

        for (let key of this.ChartRef.DataSeries.keys()) {
          let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

          if (this.Position == axisPosition.left || this.Position == axisPosition.right) {
            if (this.Id == objSeries.YAxisId) {
              //Continue
            } else {
              continue;
            }
          }

          if (this.Position == axisPosition.top || this.Position == axisPosition.bottom) {
            if (this.Id == objSeries.XAxisId) {
              //Continue
            } else {
              continue;
            }
          }

          for (let i = 0; i < objSeries.Data.length; i++) {
            let val: Date = objSeries.Data[i].datetime;

            if (val != undefined) {
              if (uniqueValues.get(val) == undefined || uniqueValues.get(val) == null) {
                uniqueValues.set(val, val);
              }
            }
          }
        }

        for (let key of uniqueValues.keys()) {
          let stackedValue: number = 0;
          let val: Date = uniqueValues.get(key);

          for (let key1 of this.ChartRef.DataSeries.keys()) {
            let objSeries: DataSeries = this.ChartRef.DataSeries.get(key1);

            for (let i = 0; i < objSeries.Data.length; i++) {
              if (this.Position == axisPosition.left || this.Position == axisPosition.right) {
                if (objSeries.Data[i].datetime == val) {
                  stackedValue = stackedValue + objSeries.Data[i].y;
                }
              } else {
                if (objSeries.Data[i].datetime == val) {
                  stackedValue = stackedValue + objSeries.Data[i].x;
                }
              }
            }
          }

          stackValues.set(key, stackedValue);
        }

        //Find max from stack values
        for (let key of stackValues.keys()) {
          if (stackValues.get(key) > lMax) {
            lMax = stackValues.get(key);
          }
        }

        lMin = lMax;

        for (let key of stackValues.keys()) {
          if (stackValues.get(key) < lMin) {
            lMin = stackValues.get(key);
          }
        }

        if (lMin > 0) {
          lMin = 0;
        }

        let objRange = new AxisRange();
        objRange.Min = lMin; //We'll have to
        objRange.Max = lMax;

        if (this.PaddingMin > 0 || this.PaddingMax > 0) {
          let paddingNumber: number = objRange.Max - objRange.Min;
          objRange.Min = objRange.Min - paddingNumber * this.PaddingMin / 100;
          objRange.Max = objRange.Max + paddingNumber * this.PaddingMax / 100;
          return objRange;
        }
      } else {
        //First date time axis type
        //X bound data
        let lMin: number = 0;
        let lMax: number = 0;

        let uniqueValues: Map<number, number> = new Map();
        let stackValues: Map<number, number> = new Map();

        for (let key of this.ChartRef.DataSeries.keys()) {
          let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

          if (this.Position == axisPosition.left || this.Position == axisPosition.right) {
            if (this.Id == objSeries.YAxisId) {
              //Continue
            } else {
              continue;
            }
          }

          if (this.Position == axisPosition.top || this.Position == axisPosition.bottom) {
            if (this.Id == objSeries.XAxisId) {
              //Continue
            } else {
              continue;
            }
          }

          for (let i = 0; i < objSeries.Data.length; i++) {
            let val: number = 0;

            if (this.Position == axisPosition.left || this.Position == axisPosition.right) {
              val = objSeries.Data[i].x;
            } else {
              val = objSeries.Data[i].y;
            }

            if (uniqueValues.get(val) == undefined || uniqueValues.get(val) == null) {
              uniqueValues.set(val, val);
            }
          }
        }

        for (let key of uniqueValues.keys()) {
          let stackedValue: number = 0;
          let val: number = uniqueValues.get(key);
          let isStackedBar: boolean = false;

          for (let key1 of this.ChartRef.DataSeries.keys()) {
            let objSeries: DataSeries = this.ChartRef.DataSeries.get(key1);

            for (let i = 0; i < objSeries.Data.length; i++) {
              if (objSeries.Type == dataSeriesType.Bar && objSeries.Stacked) {
                //isStackedBar = true;
                if (this.Id == objSeries.YAxisId) {
                  if (objSeries.Data[i].x == val) {
                    stackedValue = stackedValue + objSeries.Data[i].y;
                  }
                } else {
                  if (objSeries.Data[i].y == val) {
                    stackedValue = stackedValue + objSeries.Data[i].x;
                  }
                }
                stackValues.set(key, stackedValue);
              } else {
                //Right axis
                //alert("new");
                //isStackedBar = false;
                // if (this.Position == axisPosition.right) {
                //   //for other series
                //   if (this.Id == objSeries.YAxisId) {
                //     if (objSeries.Data[i].x == val) {

                //       stackedValue = utilFunc.CopyObject(objSeries.Data[i].y);

                //       if (stackValues.get(key) == undefined) {
                //         stackValues.set(key, stackedValue);

                //       } else {
                //         if (stackedValue > stackValues.get(key)) {
                //           stackValues.set(key, stackedValue);
                //         }
                //       }
                //     }

                //   }
                //   // else {
                //   //   if (objSeries.Data[i].y == val) {
                //   //     stackedValue = objSeries.Data[i].x;
                //   //   }
                //   // }


                // }
              }

            }
          }


        }


        //Find max from stack values
        for (let key of stackValues.keys()) {
          if (stackValues.get(key) > lMax) {
            lMax = stackValues.get(key);
          }
        }

        lMin = lMax;

        for (let key of stackValues.keys()) {
          if (stackValues.get(key) < lMin) {
            lMin = stackValues.get(key);
          }
        }

        if (lMin > 0) {
          lMin = 0;
        }

        let objRange = new AxisRange();
        objRange.Min = lMin; //We'll have to
        objRange.Max = lMax;

        if (this.PaddingMin > 0 || this.PaddingMax > 0) {
          let paddingNumber: number = objRange.Max - objRange.Min;
          objRange.Min = objRange.Min - paddingNumber * this.PaddingMin / 100;
          objRange.Max = objRange.Max + paddingNumber * this.PaddingMax / 100;
          return objRange;
        }
      }
    } catch (error) { }
  };

  //Returns range of data / scale
  getAxisRange = (): any => {
    try {

      if (!this.AutoScale) {
        if (this.IsDateTime) {
          let objRange = new AxisDateRange();
          objRange.Min = this.MinDate;
          objRange.Max = this.MaxDate;
          return objRange;
        } else {
          let objRange = new AxisRange();
          objRange.Min = this.Min;
          objRange.Max = this.Max;
          return objRange;
        }
      } else {
        //We'll have to go through each data series associated with this axis

        //If it is stacked bar chart
        let isStackedBar: boolean = false;

        for (let key of this.ChartRef.DataSeries.keys()) {

          if (
            this.ChartRef.DataSeries.get(key).Type == dataSeriesType.Bar &&
            this.ChartRef.DataSeries.get(key).Stacked &&
            this.ChartRef.DataSeries.get(key).YAxisId == this.Id //Prath
          ) {
            isStackedBar = true;
            break;
          }
        }

        if (isStackedBar && !this.IsDateTime) {
          return this.getAxisRangeStacked();
        } else {
          //First date time axis type
          if (this.IsDateTime) {
            let lMin: Date = new Date(0);
            let lMax: Date = new Date(lMin.setHours(lMin.getHours() + 24));

            for (let key of this.ChartRef.DataSeries.keys()) {
              if (
                this.ChartRef.DataSeries.get(key).XAxisId == this.Id ||
                this.ChartRef.DataSeries.get(key).YAxisId == this.Id
              ) {
                let seriesMax = this.ChartRef.DataSeries.get(key).getMaxDate();

                if (seriesMax != null) {
                  if (seriesMax > lMax) {
                    lMax = seriesMax;
                  }
                }
              }
            }

            lMin = lMax;

            for (let key of this.ChartRef.DataSeries.keys()) {
              if (this.ChartRef.DataSeries.get(key).XAxisId == this.Id) {
                let seriesMin = this.ChartRef.DataSeries.get(key).getMinDate();

                if (seriesMin != null) {
                  if (seriesMin < lMin) {
                    lMin = seriesMin;
                  }
                }
              }
            }

            let objRange = new AxisDateRange();
            objRange.Min = lMin;
            objRange.Max = lMax;

            return objRange;
          }

          if (!this.IsDateTime) {


            //Is Multiline
            let objRange = new AxisRange();

            if (this.LabelMultiline) {
              let beforeLength = 0;
              let maxWidthLabel = "";
              for (let index = 0; index < this.Labels.length; index++) {
                const element = this.Labels[index];
                let lblList: any = element.split("~");
                for (let index1 = 0; index1 < lblList.length; index1++) {
                  const element1 = lblList[index1];
                  if (element1.length > beforeLength) {
                    beforeLength = element1.length;
                    maxWidthLabel = element1;
                  }
                }

              }
              objRange.MaxWidthLabel = maxWidthLabel;

            }
            //}
            //==============================





            //X bound data
            let lMin: number = 0;
            let lMax: number = 0;


            for (let key of this.ChartRef.DataSeries.keys()) {
              if (this.ChartRef.DataSeries.get(key).XAxisId == this.Id) {
                let seriesMax = this.ChartRef.DataSeries.get(key).getMaxX();

                if (seriesMax > lMax) {
                  lMax = seriesMax;
                }
              }

              if (this.ChartRef.DataSeries.get(key).YAxisId == this.Id) {
                let seriesMax = this.ChartRef.DataSeries.get(key).getMaxY();

                if (seriesMax > lMax) {
                  lMax = seriesMax;
                }
              }
            }

            lMin = lMax;

            for (let key of this.ChartRef.DataSeries.keys()) {
              if (this.ChartRef.DataSeries.get(key).XAxisId == this.Id) {
                let seriesMin = this.ChartRef.DataSeries.get(key).getMinX();

                if (seriesMin < lMin) {
                  lMin = seriesMin;
                }
              }

              if (this.ChartRef.DataSeries.get(key).YAxisId == this.Id) {
                let seriesMin = this.ChartRef.DataSeries.get(key).getMinY();

                if (seriesMin < lMin) {
                  lMin = seriesMin;
                }
              }
            }

            //objRange = new AxisRange();
            objRange.Min = lMin;
            objRange.Max = lMax;

            if (this.PaddingMin > 0 || this.PaddingMax > 0) {
              let paddingNumber: number = objRange.Max - objRange.Min;
              objRange.Min = objRange.Min - (paddingNumber * this.PaddingMin) / 100;
              objRange.Max = objRange.Max + (paddingNumber * this.PaddingMax) / 100;
              return objRange;
            }

            return objRange;
          }
        }
      }
    } catch (error) { }
  };


}
