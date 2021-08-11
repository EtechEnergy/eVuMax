//https://www.tutorialsteacher.com/d3js/create-pie-chart-using-d3js
//http://bl.ocks.org/wayneminton/a12b563819b04a3555aa
//https://www.d3-graph-gallery.com/graph/custom_legend.html#cont2
//https://bl.ocks.org/adamjanes/5e53cfa2ef3d3f05828020315a3ba18c
//https://stackoverflow.com/questions/41016249/d3-polylines-from-label-to-arc-in-donut-or-pie-chart/41019372#41019372

import * as Chart from "../Chart/Chart";
import * as d3 from "d3";
import $ from "jquery";
import { min } from "d3";
import { DataSeries, dataSeriesType } from "./DataSeries";
import { ChartData } from "./ChartData";

export class PieSeries {
  //External References
  ChartRef: Chart.Chart;


  //Draws the series, this will draw vertical bars along with X Axis
  redrawSeries = () => {
    //Remove existing data
    $("#" + this.ChartRef.ContainerId)
      .children()
      .empty();

    for (let key of this.ChartRef.DataSeries.keys()) {
      let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

      if (objSeries.Type == dataSeriesType.Pie) {
        try {

          $("." + objSeries.Id).remove();
        } catch (error) { }
      }
    }

    for (let key of this.ChartRef.DataSeries.keys()) {
      let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

      if (objSeries.Type == dataSeriesType.Pie) {
        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.

        let width =
          this.ChartRef.Width -
          this.ChartRef.MarginLeft -
          this.ChartRef.MarginRight;
        let height =
          this.ChartRef.Height -
          this.ChartRef.MarginTop -
          this.ChartRef.MarginBottom;

        //let radius = Math.min(width, height) / objSeries.PieRatio;
        let radius = objSeries.PieRadius;

        let g = this.ChartRef.SVGRef.append("g").attr(
          "transform",
          "translate(" + width / 2 + "," + height / 2 + ")"
        );

        let pie = d3.pie<ChartData>().value(function (d) {
          return d.y;
        });

        let piedata = pie(objSeries.Data);

        let arc = d3
          .arc()
          .outerRadius(radius - 10)
          .innerRadius(0);

        let label = d3
          .arc()
          .outerRadius(radius)
          .innerRadius(radius - 80);

        let outerArc = d3
          .arc()
          .innerRadius(radius * 0.9)
          .outerRadius(radius * 0.9);

        let path = g
          .selectAll("path")
          .attr("class", objSeries.Id)
          .data(piedata)
          .enter()
          .append("path")
          .attr("stroke", "black")
          .attr("stroke-width", "0px") //pie curve broder width
          .attr("fill", function (d) {
            return d.data.color;
          })
          .attr("d", arc);

        g.selectAll("text")
          .data(piedata)
          .enter()
          .append("text")
          .style("font-size", "12px")
          .attr("text-anchor", "middle")
          .attr("transform", function (d) {
            var pos = outerArc.centroid(d);
            //pos[0] = radius * (this.midAngle(d) < Math.PI ? 1.0 : -1.0);
            pos[0] =
              radius *
              (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI
                ? 1.5
                : -1.5);
            return "translate(" + pos + ")";
          })
          .text(function (d) {
            if (d.data.y > 0) {
              return d.data.label;
            }
          })
          .attr("class", "axis-title")

        // .style("fill", function (d) {
        //   return "#81b29a"; //d.data.color;
        // });

        let polyline = g
          .selectAll("polyline")
          .data(piedata, function (d) {
            return d.data.y; //???
          })
          .enter()
          .append("polyline")
          .attr("points", function (d) {
            var pos = outerArc.centroid(d);
            pos[0] =
              radius *
              0.95 *
              (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI
                ? 1.1
                : -1.1);

            return [arc.centroid(d), outerArc.centroid(d), pos];
          })
          .style("fill", "none")
          .style("stroke", function (d) {
            if (d.data.y > 0) {
              return "var(--base-anchor-color)"; //polyline color
            }
          })
          //.attr("class", "axis-title")
          .style("stroke-width", "1px");
      }
    }
  };

  midAngle = (d) => {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  };
}
