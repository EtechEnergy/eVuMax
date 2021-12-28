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
export class AreaSeries {
  //External References
  ChartRef: Chart.Chart;
  

  //Draws the series, this will draw vertical bars along with X Axis
  redrawSeries = () => {
    try {
      //Remove existing data
      let xValues = new Array<number>();
      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (objSeries.Type == dataSeriesType.Area) {
          try {
            $("." + objSeries.Id).remove();
          } catch (error) {}
        }
      }

      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (objSeries.Type == dataSeriesType.Area) {
          try {
            let objHorizontalAxis = this.ChartRef.getAxisByID(
              objSeries.XAxisId
            );
            let objVerticalAxis = this.ChartRef.getAxisByID(objSeries.YAxisId);

            let objHorizontalAxisScaleRef = objHorizontalAxis.ScaleRef;
            let objHorizontalAxisRef = objHorizontalAxis.AxisRef;

            let objVerticalAxisScaleRef = objVerticalAxis.ScaleRef;
            let objVerticalAxisRef = objVerticalAxis.AxisRef;

            let sx = this.ChartRef.ScrollingScale.get(objHorizontalAxis.Id);
            let sy = this.ChartRef.ScrollingScale.get(objVerticalAxis.Id);
            let line;

            // Scrolling Disable in case (1) any x/y axis is bandscale (2) for both x/y axes allow scrolling false (while defind axes)

            if (
              objHorizontalAxis.bandScale ||
              objVerticalAxis.bandScale ||
              !(
                objHorizontalAxis.isAllowScrolling &&
                objVerticalAxis.isAllowScrolling
              )
            ) {
              this.ChartRef.isScrollingInProgress = false;
            }
            //alert(this.ChartRef.isScrollingInProgress);

            let dashStyle = "0";

            if (objSeries.LineStyle == Chart.lineStyle.dashed) {
              dashStyle = "5,2";
            }

            let b = objVerticalAxis.__axisSize;

            //Define Line

            if (!this.ChartRef.isScrollingInProgress) {
              line = d3
                .area<ChartData>()
                .x(function (d: ChartData, i: number) {
                  if (objHorizontalAxis.IsDateTime) {
                    return Number(objHorizontalAxisScaleRef(d.datetime));
                  } else {
                    return Number(objHorizontalAxisScaleRef(d.x));
                  }
                })
                .y1(function (d: ChartData, i: number) {
                  if (objVerticalAxis.IsDateTime) {
                    return Number(objVerticalAxisScaleRef(d.datetime));
                  } else {
                    return Number(objVerticalAxisScaleRef(d.y));
                  }
                })
                .y0(objVerticalAxis.EndPos);
            } else {
              //while scrolling

              line = d3
                .area<ChartData>()
                .x(function (d: ChartData, i: number) {
                  if (objHorizontalAxis.IsDateTime) {
                    return Number(sx(d.datetime));
                  } else {
                    return Number(sx(d.x));
                  }
                })
                .y1(function (d: ChartData, i: number) {
                  if (objVerticalAxis.IsDateTime) {
                    return Number(sy(d.datetime));
                  } else {
                    return Number(sy(d.y));
                  }
                })
                .y0(objVerticalAxis.EndPos);
            }

            //.curve(d3.curveStepBefore);

            //Added by prath on 16-Dec-2021
        d3.select("."+ "AreaChart-"+ objSeries.Id).remove();

        this.ChartRef.SVGRect.append("g")
        .attr("class", "AreaChart-"+ objSeries.Id)
        //.attr("class", objSeries.Id)
        .append("path")
        
        .datum(objSeries.Data)
        .style("opacity", 1)
        .style("fill", objSeries.Color) //Nishant 28/07/2021
        .attr("stroke", objSeries.Color) //Nishant 28/07/2021
        .attr("stroke-width", objSeries.LineWidth)
        .attr("stroke-dasharray", dashStyle)
        .attr("d", line);

            //=============================


            //Original

            // this.ChartRef.SVGRef.append("g")
            //   .attr("class", objSeries.Id)
            //   .append("path")
            //   .datum(objSeries.Data)
            //   .style("opacity", 1)
            //   .style("fill", objSeries.Color) //Nishant 28/07/2021
            //   .attr("stroke", objSeries.Color) //Nishant 28/07/2021
            //   .attr("stroke-width", objSeries.LineWidth)
            //   .attr("stroke-dasharray", dashStyle)
            //   .attr("d", line);
          } catch (error) {}
        }
      }
    } catch (error) {}
  };
}
