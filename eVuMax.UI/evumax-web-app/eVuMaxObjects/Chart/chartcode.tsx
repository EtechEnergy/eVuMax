import React, { Component, useState, useEffect } from "react";
import * as d3 from "d3";
import $ from "jquery";
import { Chart } from "../Chart/Chart";
import { ChartData } from "../Chart/ChartData";
import { Axis } from "../Chart/Axis";

class DrlgConnSummary1 extends Component {
  constructor(props: any) {
    super(props);
  }

  svgRef: any;
  leftAxisRef: any;
  leftAxisScale: any;
  bottomAxisRef: any;
  bottomAxisScale: any;
  dataSeriesRef: any;

  componentDidMount() {
    try {
      let data = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
        { x: 12, y: 12 },
        { x: 50, y: 95 },
      ];

      //calculate relative pos
      let parentHeight = $("#chartContainer").height();
      let parentWidth = $("#chartContainer").width();

      let leftX = 0;
      let leftY = 0;
      let leftRelativePos = 0;
      let leftStartPos = 0;
      let leftEndPos = 0;

      let bottomX = 0;
      let bottomY = 0;
      let bottomRelativePos = 0;
      let bottomStartPos = 0;
      let bottomEndPos = 0;

      let element: any = $("#calculator");

      if (element.id == undefined) {
        element = document.createElement("label");
        element.innerHTML = "100";
        element.id = "calculator";
        $("body").append(element);
      }

      $("#" + element.id).show();
      $("#" + element.id).css("font-size", "1em");
      let textWidth: number = Number($("#" + element.id).width());
      let textHeight: number = Number($("#" + element.id).height());
      $("#" + element.id).hide();

      leftX = textHeight + textWidth;
      leftY = 0;
      leftRelativePos = leftX;

      bottomX = leftRelativePos;
      bottomY = parentHeight - textHeight - textHeight;
      bottomRelativePos = bottomY;

      leftStartPos = leftY;
      leftEndPos = bottomRelativePos;

      bottomStartPos = bottomX;
      bottomEndPos = parentWidth;

      let leftTickSize = leftEndPos - leftStartPos;
      let bottomTickSize = bottomEndPos - bottomStartPos;

      //Initialize Chart Here
      this.svgRef = d3.select("#chartContainer").append("svg");

      //format the svg element
      this.svgRef.attr("width", parentWidth);
      this.svgRef.attr("height", parentHeight);

      //add axis now
      this.leftAxisScale = d3
        .scaleLinear()
        .domain([50, 0])
        .range([leftStartPos, leftEndPos]);
      this.leftAxisRef = d3.axisLeft(this.leftAxisScale);

      this.svgRef
        .append("g")
        .attr("id", "xaxis")
        .attr("transform", "translate(" + leftX + "," + leftY + ")")
        .call(this.leftAxisRef);

      this.bottomAxisScale = d3
        .scaleLinear()
        .domain([0, 4])
        .range([bottomStartPos, bottomEndPos]);
      this.bottomAxisRef = d3.axisBottom(this.bottomAxisScale);
      this.svgRef
        .append("g")
        .attr("transform", "translate(" + 0 + "," + bottomY + ")")
        .attr("id", "yaxis")
        .call(this.bottomAxisRef);

      //Determine how much this no. takes + title rotated
      this.leftAxisRef.tickSize(-bottomTickSize);
      this.svgRef.select("#xaxis").call(this.leftAxisRef);



      this.svgRef
        .select("#xaxis")
        .selectAll(".tick")
        .attr("style", "stroke-width:0.5px;stroke-dasharray:5,5;")
        .select("line")
        .attr("stroke", "#454343")
        .selectAll("text")
        .attr("style", "stroke-dasharray:0");

      this.svgRef
        .select("#xaxis")
        .select(".domain")
        .attr("stroke", "transparent");

      this.svgRef
        .select("#yaxis")
        .select(".domain")
        .attr("stroke", "transparent");

      this.svgRef
        .select("#yaxis")
        .selectAll(".tick")
        .attr("style", "stroke-width:0.5px;stroke-dasharray:5,5;")
        .select("line")
        .attr("stroke", "#454343")
        .selectAll("text")
        .attr("style", "stroke-dasharray:0");

      this.bottomAxisRef.tickSize(-leftTickSize);
      this.svgRef.select("#yaxis").call(this.bottomAxisRef);

      this.svgRef
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("seriesId", "cc1")
        .attr("r", 3)
        .attr("cx", (d: any) => {
          return this.bottomAxisScale(d.x);
        })
        .attr("cy", (d: any) => {
          return this.leftAxisScale(d.y);
        });

      //Calculate X Axis title position
      let leftTitleX = 0;
      let leftTitleY = 0;

      leftTitleX = leftX - textWidth;
      leftTitleY = (leftEndPos - leftStartPos) / 2;

      //Add title for left axis
      this.svgRef
        .append("g")
        .attr("id", "leftAxisTitle")
        .attr("transform", "translate(" + leftTitleX + "," + leftTitleY + ")")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("fill", "white")
        .text("Depth");

      let bottomTitleX = 0;
      let bottomTitleY = 0;

      bottomTitleY = bottomY + textHeight;
      bottomTitleX = bottomStartPos + (bottomEndPos - bottomStartPos) / 2;

      //Add title for left axis
      this.svgRef
        .append("g")
        .attr("id", "bottomAxisTitle")
        .attr(
          "transform",
          "translate(" + bottomTitleX + "," + bottomTitleY + ")"
        )
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("DateTime");

      //Calculate how many bars can be displayed on this chart
      let barWidth = (bottomEndPos - bottomStartPos) / 4;

      barWidth = barWidth - 10;

      if (barWidth > 40) {
        barWidth = 40;
      }



      let data1 = new Array<ChartData>();
      let data2 = new Array<ChartData>();
      let data3 = new Array<ChartData>();

      let o1 = new ChartData();
      o1.x = 1;
      o1.y = 10;
      data1.push(o1);

      let o2 = new ChartData();
      o2.x = 1;
      o2.y = 15;
      data2.push(o2);

      let o3 = new ChartData();
      o3.x = 1;
      o3.y = 12;
      data3.push(o3);

      let o12 = new ChartData();
      o12.x = 2;
      o12.y = 7;
      data1.push(o12);

      let o22 = new ChartData();
      o22.x = 2;
      o22.y = 9;
      data2.push(o22);

      let o32 = new ChartData();
      o32.x = 2;
      o32.y = 20;
      data3.push(o32);

      let o23 = new ChartData();
      o23.x = 3;
      o23.y = 20;
      data2.push(o23);

      let o33 = new ChartData();
      o33.x = 3;
      o33.y = 10;
      data3.push(o33);

      //Prepare a list of distinct x values
      let xValues = new Array<number>();

      for (let i = 0; i < data1.length; i++) {
        let lx = data1[i].x;

        if (xValues.find((o) => o == lx) == undefined) {
          xValues.push(lx);
        }
      }

      for (let i = 0; i < data2.length; i++) {
        let lx = data2[i].x;

        if (xValues.find((o) => o == lx) == undefined) {
          xValues.push(lx);
        }
      }

      for (let i = 0; i < data3.length; i++) {
        let lx = data3[i].x;

        if (xValues.find((o) => o == lx) == undefined) {
          xValues.push(lx);
        }
      }

      //Loop through each distinct x values and build stacked bar chart
      for (let i = 0; i < xValues.length; i++) {
        let lx = xValues[i];

        let stackValues = new Array<number>();
        let colorValues = new Array<string>();

        for (let d = 0; d < data1.length; d++) {
          if (data1[d].x == lx) {
            stackValues.push(data1[d].y);
            colorValues.push("green");
          }
        }

        for (let d = 0; d < data2.length; d++) {
          if (data2[d].x == lx) {
            stackValues.push(data2[d].y);
            colorValues.push("blue");
          }
        }

        for (let d = 0; d < data3.length; d++) {
          if (data3[d].x == lx) {
            stackValues.push(data3[d].y);
            colorValues.push("orange");
          }
        }

        let prevYpos = 0;
        let prevHeight = 0;

        for (let s = 0; s < stackValues.length; s++) {
          let yPos = this.leftAxisScale(stackValues[s]);

          let height = bottomRelativePos - yPos;

          if (s > 0) {
            yPos = yPos - prevHeight;
          }

          prevYpos = yPos;
          prevHeight = height;

          this.svgRef
            .append("g")
            .append("rect")
            .attr("x", this.bottomAxisScale(lx) - barWidth / 2)
            .attr("y", yPos)
            .attr("width", barWidth)
            .attr("height", height)
            .style("fill", colorValues[s])
            .style("opacity", 1);
        }
      }

      //window.addEventListener("resize", this.updateChart.bind(this));
    } catch (error) {
      let halt = true;
    }
  }

  redrawChart = () => {
    try {
    } catch (error) { }
  };




  updateChart = () => {
    try {
      //calculate relative pos
      let parentHeight = $("#chartContainer").height();
      let parentWidth = $("#chartContainer").width();

      let leftX = 0;
      let leftY = 0;
      let leftRelativePos = 0;
      let leftStartPos = 0;
      let leftEndPos = 0;

      let bottomX = 0;
      let bottomY = 0;
      let bottomRelativePos = 0;
      let bottomStartPos = 0;
      let bottomEndPos = 0;

      let element: any = $("#calculator")[0];

      if (element.id == undefined) {
        element = document.createElement("label");
        element.innerHTML = "100";
        element.id = "calculator";
        $("body").append(element);
      }

      $("#" + element.id).show();
      $("#" + element.id).css("font-size", "1em");
      let textWidth: number = Number($("#" + element.id).width());
      let textHeight: number = Number($("#" + element.id).height());
      $("#" + element.id).hide();

      leftX = textHeight + textWidth;
      leftY = 0;
      leftRelativePos = leftX;

      bottomX = leftRelativePos;
      bottomY = parentHeight - textHeight - textHeight;
      bottomRelativePos = bottomY;

      leftStartPos = leftY;
      leftEndPos = bottomRelativePos;

      bottomStartPos = bottomX;
      bottomEndPos = parentWidth;

      let leftTickSize = leftEndPos - leftStartPos;
      let bottomTickSize = bottomEndPos - bottomStartPos;

      //format the svg element
      this.svgRef.attr("width", parentWidth);
      this.svgRef.attr("height", parentHeight);

      this.leftAxisScale.range([leftStartPos, leftEndPos]);
      this.bottomAxisScale.range([bottomStartPos, bottomEndPos]);

      this.svgRef
        .select("#xaxis")
        .attr("transform", "translate(" + leftX + "," + leftY + ")")
        .call(this.leftAxisRef);
      this.svgRef
        .select("#yaxis")
        .attr("transform", "translate(" + 0 + "," + bottomY + ")")
        .call(this.bottomAxisRef);

      //determine no. of ticks that can be displayed on left axis
      let leftAxisSize = leftEndPos - leftStartPos;
      let noOfTicks = leftAxisSize / (textHeight + 5); //5 px gap between ticks

      if (noOfTicks <= 0) {
        noOfTicks = 1;
      }

      if (noOfTicks > 10) {
        noOfTicks = 10;
      }

      noOfTicks = Math.ceil(noOfTicks);

      noOfTicks = 4;



      //Determine how much this no. takes + title rotated
      this.leftAxisRef.tickSize(-bottomTickSize);
      this.leftAxisRef.ticks(noOfTicks);
      this.svgRef.select("#xaxis").call(this.leftAxisRef);

      this.bottomAxisRef.tickSize(-leftTickSize);
      this.bottomAxisRef.ticks(noOfTicks);
      this.svgRef.select("#yaxis").call(this.bottomAxisRef);

      this.svgRef
        .select("#xaxis")
        .selectAll(".tick")
        .select("line")
        .attr("stroke", "red")
        .attr("strock-width", "2px");

      this.svgRef
        .selectAll("[seriesId='cc1']")
        .attr("cx", (d: any) => {
          return this.bottomAxisScale(d.x);
        })
        .attr("cy", (d: any) => {
          return this.leftAxisScale(d.y);
        });

      //Calculate X Axis title position
      let leftTitleX = 0;
      let leftTitleY = 0;

      leftTitleX = leftX - textWidth;
      leftTitleY = (leftEndPos - leftStartPos) / 2;

      this.svgRef
        .select("#leftAxisTitle")
        .attr("transform", "translate(" + leftTitleX + "," + leftTitleY + ")");

      let bottomTitleX = 0;
      let bottomTitleY = 0;

      bottomTitleY = bottomY + textHeight;
      bottomTitleX = bottomStartPos + (bottomEndPos - bottomStartPos) / 2;

      //Add title for left axis
      this.svgRef
        .select("#bottomAxisTitle")
        .attr(
          "transform",
          "translate(" + bottomTitleX + "," + bottomTitleY + ")"
        );

      this.svgRef
        .select("#yaxis")
        .selectAll(".tick")
        .selectAll("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)");
    } catch (error) { }
  };

  render() {
    console.log("Rendering");
    return (
      <div style={{ height: "calc(100vh - 100px)", width: "100%" }}>
        <div
          id="chartContainer"
          style={{
            height: "calc(100% - 50px)",
            width: "100%",
            top: "10px",
          }}
        ></div>
      </div>
    );
  }
}

export default DrlgConnSummary1;
