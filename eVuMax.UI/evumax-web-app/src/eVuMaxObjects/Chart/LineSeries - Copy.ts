import * as Chart from "../Chart/Chart";
import * as d3 from "d3";
import $ from "jquery";
import { AxisRange, AxisDateRange } from "../Chart/AxisRange";
import { Axis } from "../Chart/Axis";
import { min } from "d3";
import { faUnderline } from "@fortawesome/free-solid-svg-icons";
import { text } from "@fortawesome/fontawesome-svg-core";
import { DataSeries, dataSeriesType } from "./DataSeries";
import { ChartData } from "./ChartData";
import { debug } from "console";

//This file contains logic of generating line chart on the plot
export class LineSeries {
  //External References
  ChartRef: Chart.Chart;

  //Draws the series, this will draw vertical bars along with X Axis
  redrawSeries = () => {
    try {
      //Remove existing data
      let xValues = new Array<number>();
      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (objSeries.Type == dataSeriesType.Line) {
          try {
            $("." + objSeries.Id).remove();
          } catch (error) {}
        }
      }

      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (objSeries.Type == dataSeriesType.Line) {
          try {
            let objHorizontalAxis = this.ChartRef.getAxisByID(
              objSeries.XAxisId
            );
            let objVerticalAxis = this.ChartRef.getAxisByID(objSeries.YAxisId);

            let objHorizontalAxisScaleRef = objHorizontalAxis.ScaleRef;
            let objHorizontalAxisRef = objHorizontalAxis.AxisRef;

            let objVerticalAxisScaleRef = objVerticalAxis.ScaleRef;
            let objVerticalAxisRef = objVerticalAxis.AxisRef;

            let dashStyle = "0";

            if (objSeries.LineStyle == Chart.lineStyle.dashed) {
              dashStyle = "5,2";
            }

            let line = d3
              .line<ChartData>()
              .x(function (d: ChartData, i: number) {
                if (objHorizontalAxis.IsDateTime) {
                  return Number(objHorizontalAxisScaleRef(d.datetime));
                } else {
                  return Number(objHorizontalAxisScaleRef(d.x));
                }
              })
              .y(function (d: ChartData, i: number) {
                if (objVerticalAxis.IsDateTime) {
                  return Number(objVerticalAxisScaleRef(d.datetime));
                } else {
                  return Number(objVerticalAxisScaleRef(d.y));
                }
              });

            //prath 26-10-2020 for TripSpeed1 plot (Step Line Chart)

            line.curve(d3.curveStepBefore);

            //color each point for line path 26-11-2020=====================
            if (!objSeries.ColorEach) {
              // ColorEach=false
              this.ChartRef.SVGRef.append("g")
                .attr("class", objSeries.Id)
                .append("path")
                .datum(objSeries.Data)
                .style("opacity", 1)
                .style("fill", "none")
                .attr("stroke", objSeries.Color)
                .attr("stroke-width", objSeries.LineWidth)
                .attr("stroke-dasharray", dashStyle)
                .attr("d", line);
            } else {
              // ColorEach=true
              let NewData = objSeries.Data.map(function (point, index, arr) {
                var next = arr[index + 1],
                  prev = arr[index - 1];

                if (point.x == undefined) {
                  return {
                    x: point.datetime,
                    y: point.y,
                    x1: point.datetime,
                    y1: point.y,
                    x2: next ? next.datetime : prev.datetime,
                    y2: next ? next.y : prev.y,
                    color: point.color,
                  };
                } else {
                  return {
                    x: point.x,
                    y: point.y,
                    x1: point.x,
                    y1: point.y,
                    x2: next ? next.x : prev.x,
                    y2: next ? next.y : prev.y,
                    color: point.color,
                  };
                }
              });

              let lines = this.ChartRef.SVGRef.selectAll("line-")
                .data(NewData)
                .enter()
                .append("line")
                .attr("id", "line-")
                .attr("x1", function (d) {
                  return objHorizontalAxisScaleRef(d.x1);
                })
                .attr("y1", function (d) {
                  return objVerticalAxisScaleRef(d.y1);
                })
                .attr("x2", function (d) {
                  return objHorizontalAxisScaleRef(d.x2);
                })
                .attr("y2", function (d) {
                  return objVerticalAxisScaleRef(d.y2);
                })
                .attr("stroke", function (d) {
                  return d.color;
                })
                .attr("fill", "none")
                .attr("stroke-width", objSeries.LineWidth); //wip
            }
          } catch (error) {}
        }
      }
    } catch (error) {}
  };
}
