//Reference URL
//https://bl.ocks.org/Rdilorenzo73/d3ef804fca7ed0ddaf67a0fb74f76682
//http://jsfiddle.net/aybalasubramanian/g5tpaosv/
//https://jsfiddle.net/354zw0d2/9/

//https://bl.ocks.org/Rdilorenzo73/d3ef804fca7ed0ddaf67a0fb74f76682

//used following url for draw bar
//https://www.d3-graph-gallery.com/graph/barplot_grouped_basicWide.html//
import * as Chart from "../Chart/Chart";
import * as d3 from "d3";
import $ from "jquery";
import { AxisRange, AxisDateRange } from "../Chart/AxisRange";
import { Axis } from "../Chart/Axis";
import { DataSeries, dataSeriesType } from "./DataSeries";
import { ChartData } from "./ChartData";

//This file contains logic of generating stacked bar chart on the plot
export class BarSeries {
  //External References
  ChartRef: Chart.Chart;

  objHorizontalAxisScaleRef: any;
  objVerticalAxisScaleRef: any;
  objHorizontalAxisScaleRef_x1: any;

  objHorizontalAxisRef: any;
  objVerticalAxisRef: any;

  objHorizontalAxis: Axis;
  objVerticalAxis: Axis;

  //Draws the series, this will draw vertical bars along with X Axis
  redrawSeries = () => {
    try {
      
      let isDateTimeScale = false;
      let objHorizontalAxis: any;

      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (objSeries.Type == dataSeriesType.Bar) {
          objHorizontalAxis = this.ChartRef.getAxisByID(objSeries.XAxisId);

          if (objHorizontalAxis.IsDateTime) {
            isDateTimeScale = true;
            break;
          }
        }
      }

      if (isDateTimeScale) {
        this.redrawDateTime();
      } else {
        this.redrawNumeric();
      }
    } catch (error) { }
  };

  redrawNumeric = () => {
    try {
      //Remove existing data

      
      let xValues = new Array<number>();
      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (objSeries.Type == dataSeriesType.Bar) {
          try {
            $("." + objSeries.Id).remove();
          } catch (error) { }
        }
      }

      
      //Generate unique X values from the data for Number of Series...s1,s2,s3...
      let data = [];
      let keys = [];
      let colors = [];
      let findBarSeries: boolean = false;

      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (objSeries.Type == dataSeriesType.Bar) {
          //  if (!findBarSeries) {
          this.objHorizontalAxis = this.ChartRef.getAxisByID(objSeries.XAxisId);
          this.objVerticalAxis = this.ChartRef.getAxisByID(objSeries.YAxisId);

          this.objHorizontalAxisScaleRef = this.objHorizontalAxis.ScaleRef; //x0
          this.objHorizontalAxisScaleRef_x1 = d3.scaleBand().padding(0.05); //objHorizontalAxis.ScaleRef_x1;//x1

          this.objHorizontalAxisRef = this.objHorizontalAxis.AxisRef;

          this.objVerticalAxisScaleRef = this.objVerticalAxis.ScaleRef;
          this.objVerticalAxisRef = this.objVerticalAxis.AxisRef;

          let axisDomainValues: string[] = this.objHorizontalAxisScaleRef.domain();
          let axisDomainValues_x1: string[] = this.objHorizontalAxisScaleRef_x1.domain(); //.domain(keys).rangeRound([0, x0.bandwidth()]); //Pending
          this.objHorizontalAxisScaleRef_x1
            .domain(keys)
            .range([0, this.objHorizontalAxisScaleRef.bandwidth()]);
          //   findBarSeries = true;
          // }

          //need to create objHorizontalAxisScaleRef_y1 when needed --> Pending

          keys.push(objSeries.Id);
          colors.push(objSeries.Color);

          for (let d = 0; d < objSeries.Data.length; d++) {
            let objData: ChartData = objSeries.Data[d];

            if (xValues.find((o) => o == objData.x) == undefined) {
              xValues.push(objData.x);
              data.push({ X: objData.x });
            }
          }
        }
      }
      

      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        //objSeries.Id;
        for (let d = 0; d < objSeries.Data.length; d++) {
          let objData: ChartData = objSeries.Data[d];
          let i = data.findIndex((value) => value.X == objData.x);
          if (i > -1) {
            data[i][objSeries.Id] = objData.y;

            //   let rec = data[i];

            // rec[objSeries.Id] = objData.y;
          }
        }

        // for (let d = 0; d < objSeries.Data.length; d++) {
        //   let objData: ChartData = objSeries.Data[d];

        //   if (xValues.find((o) => o == objData.x) == undefined) {

        //     let objData: ChartData = objSeries.Data[d];

        //     let i = data.findIndex(value => value.X == objData.x);
        //     let element = {};
        //     if (i > -1) { //Found
        //       let hold = true;
        //       element = data[i];
        //     }
        //     //if (!(element.hasOwnProperty(objData.x) && element.hasOwnProperty(key))) {
        //     if (!(element.hasOwnProperty("X") && element.hasOwnProperty(key))) {
        //       element[key] = objData.y;
        //     }

        //   }
        // }
      }

      // for (let index = 0; index < data.length; index++) {
      //   for (let key of this.ChartRef.DataSeries.keys()) {
      //     let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

      //     if (objSeries.Type == dataSeriesType.Bar) {
      //       for (let d = 0; d < objSeries.Data.length; d++) {}
      //     }
      //   }
      // }


      
      let z = d3.scaleOrdinal().range(colors);

      

      //============================================================

      //11-11-2020
      //objHorizontalAxisScaleRef_x1.domain(keys).rangeRound([0, objHorizontalAxisScaleRef.bandwidth()]);

      //============================================================

      
      let barWidth = this.objHorizontalAxisScaleRef_x1.bandwidth();
      
      if (barWidth <= 1) {
        barWidth = 1;
      }

      let prevYpos = 0;
      let prevHeight = 0;

      let height = 0;
      height = this.ChartRef.Height - this.ChartRef.MarginBottom;

      
      let date1: any = new Date(); // 9:00 AM

      let HAxisScale = this.objHorizontalAxisScaleRef;
      let HAxisScale_x1 = this.objHorizontalAxisScaleRef_x1;
      let VAxisScale = this.objVerticalAxisScaleRef;

      var selection = this.ChartRef.SVGRef.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function (d) {
          return "translate(" + HAxisScale(d.X) + ",0)";
        });
      selection
        .selectAll("rect")
        //Use map function with the subCategories array and the Econ2 array
        .data(function (d) {
          return keys.map(function (key) {
            return { key: key, value: d[key] };
          });
        })
        .enter()
        .append("rect")
        .attr("x", function (d) {
          if(!isNaN(HAxisScale_x1(d.key)))
          {
            return HAxisScale_x1(d.key);
          }
        })
        //If the value is negative, put the top left corner of the rect bar on the zero line

        .attr("y", function (d) {
          if(!isNaN(VAxisScale(d.value)))
          {
            return VAxisScale(d.value);
          }
          
        })

        .attr("width", (isNaN(barWidth)?0:barWidth))
        .attr("height", function (d) {
          if(!isNaN(height - Math.abs(VAxisScale(d.value))))
          {
            return height - Math.abs(VAxisScale(d.value));
          }
          
        })
        .attr("fill", function (d) {
          return z(d.key);
        })
        .on("mousemove", (a, b, c) => {
          let seriesID = c[0].getAttribute("seriesId");
          let index = c[0].getAttribute("index");

          var tooltipText = this.ChartRef.getTooltipTextHorizontalPlot(
            index,
            seriesID
          );
          this.ChartRef.__toolTip.html(tooltipText);
          this.ChartRef.__toolTip.css("position", "absolute");

          
          this.ChartRef.__toolTip.css("background-color", "#585656");
          this.ChartRef.__toolTip.css("padding", "5px");
          this.ChartRef.__toolTip.css("border-radius", "3px");
          this.ChartRef.__toolTip.css("left", 0);
          this.ChartRef.__toolTip.css("top", 0);

          var tooltipX = this.ChartRef.__mouseLastX;
          var tooltipY = this.ChartRef.__mouseLastY;
          var tooltipWidth = this.ChartRef.__toolTip.innerWidth();
          var tooltipHeight = this.ChartRef.__toolTip.innerHeight();

          if (tooltipX + tooltipWidth > this.ChartRef.__chartRect.right) {
            tooltipX = tooltipX - tooltipWidth;
          }

          if (tooltipY + tooltipHeight > this.ChartRef.__chartRect.bottom) {
            tooltipY = tooltipY - tooltipHeight;
          }

          this.ChartRef.__toolTip.css("left", tooltipX);
          this.ChartRef.__toolTip.css("top", tooltipY);
          this.ChartRef.__toolTip.css("display", "inherit");

          //Check if tooltip is going beyond right edge
        })
        .on("mousedown", (a, b, c) => {
          
        
        });

      // // Show Value as lable on Bar Series //Parth 05-10-2020

      let date2: any = new Date(); // 9:00 AM
      
    } catch (error) { }
  };

  redrawDateTime = () => {
    try {
      //Remove existing data
      let xValues = new Array<Date>();
      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (objSeries.Type == dataSeriesType.Bar) {
          try {
            $("." + objSeries.Id).remove();
          } catch (error) { }
        }
      }

      //Generate unique X values from the data
      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (objSeries.Type == dataSeriesType.Bar) {
          for (let d = 0; d < objSeries.Data.length; d++) {
            let objData: ChartData = objSeries.Data[d];

            if (xValues.find((o) => o == objData.datetime) == undefined) {
              xValues.push(objData.datetime);
            }
          }
        }
      }

      let objHorizontalAxisScaleRef: any;
      let objVerticalAxisScaleRef: any;

      let objHorizontalAxisRef: any;
      let objVerticalAxisRef: any;

      let objHorizontalAxis: Axis;
      let objVerticalAxis: Axis;

      for (let i = 0; i < xValues.length; i++) {
        let lx = xValues[i];

        let stackValues = new Array<number>();
        let colorValues = new Array<string>();
        let seriesIds = new Array<string>();

        for (let key of this.ChartRef.DataSeries.keys()) {
          let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

          if (objSeries.Type == dataSeriesType.Bar) {
            let axisDomainValues: Date[] = objHorizontalAxisScaleRef.domain();

            for (let d = 0; d < objSeries.Data.length; d++) {
              let objData: ChartData = objSeries.Data[d];

              if (objData.datetime.toString() == lx.toString()) {
                //only include if horizontal axis domain contains entry of this value
                if (axisDomainValues.find((o) => o == lx) != undefined) {
                  stackValues.push(objData.y);

                  if (objSeries.ColorEach) {
                    if (objData.color.trim() != "") {
                      colorValues.push(objData.color);
                    } else {
                      colorValues.push(objSeries.Color);
                    }
                  } else {
                    colorValues.push(objSeries.Color);
                  }

                  seriesIds.push(objSeries.Id);
                }
              }
            }
          }
        }

        let barWidth = objHorizontalAxisScaleRef.bandwidth();
        let prevYpos = 0;
        let prevHeight = 0;

        for (let s = 0; s < stackValues.length; s++) {
          let yPos = 0;
          let height = 0;

          if (stackValues[s] < 0) {
            //handle negative bars

            yPos = objVerticalAxisScaleRef(stackValues[s]);

            if (objVerticalAxis.Inverted) {
              height = yPos - objVerticalAxisScaleRef(0);
            } else {
              if (objVerticalAxis.IsDateTime) {
                let objAxisRange: AxisDateRange = objVerticalAxis.getAxisRange();
                height = objVerticalAxisScaleRef(0) - yPos;
              } else {
                let objAxisRange: AxisRange = objVerticalAxis.getAxisRange();
                height = objVerticalAxisScaleRef(0) - yPos;
              }
            }

            //after calculating height, put the bar at 0
            yPos = objVerticalAxisScaleRef(0);

            if (s > 0) {
              yPos = prevYpos - height;
            }

            prevYpos = yPos;
            prevHeight = height;
          } else {
            yPos = objVerticalAxisScaleRef(stackValues[s]);

            if (objVerticalAxis.Inverted) {
              height = objVerticalAxisScaleRef(0) - yPos;
            } else {
              if (objVerticalAxis.IsDateTime) {
                let objAxisRange: AxisDateRange = objVerticalAxis.getAxisRange();
                height = yPos - objVerticalAxisScaleRef(0);
              } else {
                let objAxisRange: AxisRange = objVerticalAxis.getAxisRange();
                height = yPos - objVerticalAxisScaleRef(0);
              }
            }

            if (s > 0) {
              yPos = prevYpos - height;
            }

            prevYpos = yPos;
            prevHeight = height;
          }

          // if (barWidth > 50) {
          //   barWidth = 50;
          // }

          let xPos: number =
            (barWidth * objHorizontalAxisScaleRef(lx)) /
            objHorizontalAxisScaleRef.bandwidth();

          xPos =
            objHorizontalAxisScaleRef(lx) +
            objHorizontalAxisScaleRef.bandwidth() / 2 -
            barWidth / 2;

          this.ChartRef.SVGRef.append("g")
            .attr("class", seriesIds[s])
            .attr("id", seriesIds[s] + "--" + s.toString())
            .append("rect")
            .attr("id", seriesIds[s] + "--" + i.toString())
            .attr("seriesId", seriesIds[s])
            .attr("index", i)
            .attr("x", xPos)
            .attr("y", yPos)
            .attr("width", barWidth)
            .attr("height", height)
            .style("fill", colorValues[s])
            .style("opacity", 0.9)
            .style("border", "0px solid black")
            .on("mouseleave", (a, b, c) => {
              this.ChartRef.__toolTip.css("display", "none");
            })
            .on("mousemove", (a, b, c) => {
              let seriesID = c[0].getAttribute("seriesId");
              let index = c[0].getAttribute("index");

              var tooltipText = this.ChartRef.getTooltipTextHorizontalPlot(
                index,
                seriesID
              );
              this.ChartRef.__toolTip.html(tooltipText);
              this.ChartRef.__toolTip.css("position", "absolute");

              this.ChartRef.__toolTip.css("background-color", "#585656");
              this.ChartRef.__toolTip.css("padding", "5px");
              this.ChartRef.__toolTip.css("border-radius", "3px");
              this.ChartRef.__toolTip.css("left", 0);
              this.ChartRef.__toolTip.css("top", 0);

              var tooltipX = this.ChartRef.__mouseLastX;
              var tooltipY = this.ChartRef.__mouseLastY;
              var tooltipWidth = this.ChartRef.__toolTip.innerWidth();
              var tooltipHeight = this.ChartRef.__toolTip.innerHeight();

              if (tooltipX + tooltipWidth > this.ChartRef.__chartRect.right) {
                tooltipX = tooltipX - tooltipWidth;
              }

              if (tooltipY + tooltipHeight > this.ChartRef.__chartRect.bottom) {
                tooltipY = tooltipY - tooltipHeight;
              }

              this.ChartRef.__toolTip.css("left", tooltipX);
              this.ChartRef.__toolTip.css("top", tooltipY);
              this.ChartRef.__toolTip.css("display", "inherit");

              //Check if tooltip is going beyond right edge
            })
            .on("mousedown", (a, b, c) => {
              
            });
        }
      }
    } catch (error) { }
  };

  isBarClicked = (x: number, y: number) => {
    try {
      let allbars = d3.selectAll("rect");
    } catch (error) { }
  };
}
