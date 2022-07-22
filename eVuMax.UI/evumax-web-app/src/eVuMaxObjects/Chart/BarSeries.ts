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
import { exit } from "process";
import { Series } from "@progress/kendo-react-charts/dist/npm/option-types/series-item.interface";

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
  ShowLabelOnSeries: boolean = false;
  uniqueBarScale = [];
  

  //Draws the series, this will draw vertical bars along with X Axis
  redrawSeries = () => {
    try {
      let isDateTimeScale = false;
      let objHorizontalAxis: any;

        
      // for (let key of this.ChartRef.DataSeries.keys()) {
      //   let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

      //   if (objSeries.Type == dataSeriesType.Bar) {
      //     objHorizontalAxis = this.ChartRef.getAxisByID(objSeries.XAxisId);

      //     if (objHorizontalAxis.IsDateTime) {
      //       isDateTimeScale = true;
      //       break;
      //     }
      //   }
      // }

      //Make barSeries Groping
      
      this.findUniqueBarScale();
      
      

      for (let i=0; i< this.uniqueBarScale.length; i++){

        for (let key of this.ChartRef.DataSeries.keys()) {
          let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

          if (objSeries.XAxisId== this.uniqueBarScale[i].X  && objSeries.Type == dataSeriesType.Bar){
            objHorizontalAxis = this.ChartRef.getAxisByID(objSeries.XAxisId);
            if (objHorizontalAxis.IsDateTime) {
              isDateTimeScale = true;
              break;
            }
            break;
          }
        }

        if (isDateTimeScale) {
          //Pending for Rewrite logic as per redrawNumeric
          this.redrawDateTime();
        } else {
          this.redrawNumeric(this.uniqueBarScale[i].X);
        }

      }


     
    } catch (error) { }
  };

  redrawNumeric = (XScaleId) => {
    try {
      //Remove existing data
      
      let xValues = new Array<number>();

      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);
        if (objSeries.ShowLabelOnSeries) {
          this.ShowLabelOnSeries = true;
        }

        if (objSeries.Type == dataSeriesType.Bar && objSeries.XAxisId == XScaleId ) {
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
        if (objSeries.Type != dataSeriesType.Bar){
          continue;
        }

        if (objSeries.XAxisId != XScaleId){
          continue;
        }

        keys.push(objSeries.Id);
        colors.push(objSeries.Color);
        

        if (objSeries.Type == dataSeriesType.Bar) {
       //   if (!findBarSeries) {
            this.objHorizontalAxis = this.ChartRef.getAxisByID(
              objSeries.XAxisId
            );

            
            this.objHorizontalAxisScaleRef = this.objHorizontalAxis.ScaleRef; //x0
            this.objHorizontalAxisScaleRef_x1 = d3.scaleBand().padding(0.05); //objHorizontalAxis.ScaleRef_x1;//x1
            this.objHorizontalAxisRef = this.objHorizontalAxis.AxisRef;

            this.objVerticalAxis = this.ChartRef.getAxisByID(objSeries.YAxisId);
            this.objVerticalAxisScaleRef = this.objVerticalAxis.ScaleRef;
            this.objVerticalAxisRef = this.objVerticalAxis.AxisRef;
            
              
            

            //Not allow to Scroll Axes
            this.objHorizontalAxis.isAllowScrolling = false;
            //this.objVerticalAxis.isAllowScrolling = false;

            // let axisDomainValues: string[] = this.objHorizontalAxisScaleRef.domain();
            // let axisDomainValues_x1: string[] = this.objHorizontalAxisScaleRef_x1.domain(); 
            this.objHorizontalAxisScaleRef_x1
              .domain(keys)
              .range([0, this.objHorizontalAxisScaleRef.bandwidth()]);
          //   findBarSeries = true;
           //}
           
          for (let d = 0; d < objSeries.Data.length; d++) {
            let objData: ChartData = objSeries.Data[d];
            
            let i = data.findIndex((value) => value.X == objData.x);
            if (i == -1) {
              if (objData.y !=0){
             
                xValues.push(objData.x);
                let rec = {};
                rec["X"] = objData.x;
                rec[objSeries.Id] = objData.y;
                //rec["color"]= objData.color;
                rec[objSeries.Id+"~color"]= objData.color;
                data.push(rec);
              }
            } else {
              if (i > -1) {
                data[i][objSeries.Id] = objData.y;
                data[i][objSeries.Id + "~color"] = objData.color;
              }
            }
          }
        }
      }

      //new code
      
      let z = d3.scaleOrdinal().range(colors);
      this.objHorizontalAxisScaleRef_x1
        .domain(keys)
        .range([0, this.objHorizontalAxisScaleRef.bandwidth()]);

      let barWidth = this.objHorizontalAxisScaleRef_x1.bandwidth();

      if (barWidth <= 1) {
        barWidth = 1;
      }

      let prevYpos = 0;
      let prevHeight = 0;

      let height = 0;
      height = this.ChartRef.Height - this.ChartRef.MarginBottom;

      //let date1: any = new Date(); // 9:00 AM

      let HAxisScale = this.objHorizontalAxisScaleRef;
      let HAxisScale_x1 = this.objHorizontalAxisScaleRef_x1;
      let DataSeriesKeyList = this.ChartRef.DataSeries;
      let ChartRef_ = this.ChartRef;
      
      var selection = this.ChartRef.SVGRect.append("g")
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
            return { key: key, value: d[key], color : d[key +"~color"] };
          });
        })
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return HAxisScale_x1(d.key);
        })
        //If the value is negative, put the top left corner of the rect bar on the zero line
        .attr("y", function (d) {
          
          // let objVerticalAxis = this.ChartRef.getAxisByID(d.YAxisId);
          // let VAxisScale = this.objVerticalAxisScaleRef;
          //return VAxisScale(d.value);
          let objSeries_  = DataSeriesKeyList.get(d.key);
          let objVerticalAxis : Axis = ChartRef_.getAxisByID(objSeries_.YAxisId);
          let VAxisScale = objVerticalAxis.ScaleRef;
          
          //change by prath on 30-06-2022  for (-v value on Y-Axis)
          //return VAxisScale(d.value);
          if (d.value < 0){
            return VAxisScale(0);
          }else{
            return VAxisScale(d.value);
          }

          //=============
        })
        .attr("width", barWidth)
        .attr("height", function (d) {
          let objSeries_  = DataSeriesKeyList.get(d.key);
          let objVerticalAxis : Axis = ChartRef_.getAxisByID(objSeries_.YAxisId);
          let VAxisScale = objVerticalAxis.ScaleRef;
          //change by prath on 30-06-2022 for (-v value on Y-Axis)
          if (d.value < 0){
            return Math.abs(VAxisScale(d.value));
          }else{
            return height - Math.abs(VAxisScale(d.value));
          }

          
        })
        
        //prath 11-April-2022
        // .attr("fill", function (d) {
        //   return z(d.key);
        // })

        .attr("fill", function (d) {
          //return z(d.color);
          
          let objSeries_  = DataSeriesKeyList.get(d.key);
          if (objSeries_.ColorEach) {
            return d.color;
          }else{
            return z(d.key);
          }
        })
        .style("font-size", "1.0em");

      if (this.ShowLabelOnSeries) {
        // Show Value as lable on Bar Series //Parth 20-11-2020
        selection
          .selectAll("text")
          .data(function (d) {
            return keys.map(function (key) {
              return { key: key, value: d[key] };
            });
          })
          .enter()
          .append("text")
          .attr("x", function (d) {
            //

            let element = document.createElement("canvas");
            let context = element.getContext("2d");
            context.font = "12px Arial";
            let textWidth = context.measureText(
              Number(d.value).toFixed(2).toString()
            ).width;

            let barWidth = HAxisScale_x1.bandwidth();
              
            if (barWidth > textWidth) {
              return HAxisScale_x1(d.key) + (barWidth - textWidth) / 2 - 10; //-10 is to adjust on center
            } else {
              
              return HAxisScale_x1(d.key);
            }
          })
          //offset the position of the y value (positive / negative) to have the text over/under the rect bar
          //.attr("y", function (d) { return d.value <= 0 ? objVerticalAxisScaleRef(0) - (objVerticalAxisScaleRef(4) - (Math.abs(objVerticalAxisScaleRef(d.value) - objVerticalAxisScaleRef(0)) + 20)) : objVerticalAxisScaleRef(d.value) - 10 })
          .attr("y", function (d) {
            let objSeries_  = DataSeriesKeyList.get(d.key);
            let objVerticalAxis : Axis = ChartRef_.getAxisByID(objSeries_.YAxisId);
            let VAxisScale = objVerticalAxis.ScaleRef;
            return VAxisScale(d.value) - 5;    //5 is offset of bar label
          })
          .style("fill", function (d) {
            return z(d.key);
          })
          .style("font-size", "1.0em")
          //make sure one just decimal place is displayed
          .text(function (d) {
            return Number.parseFloat(d.value).toFixed(2);
          });
        //=================================
      }
    } catch (error) { 


    }
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
            objHorizontalAxis = this.ChartRef.getAxisByID(objSeries.XAxisId);
            objVerticalAxis = this.ChartRef.getAxisByID(objSeries.YAxisId);

            objHorizontalAxisScaleRef = objHorizontalAxis.ScaleRef;
            objHorizontalAxisRef = objHorizontalAxis.AxisRef;

            objVerticalAxisScaleRef = objVerticalAxis.ScaleRef;
            objVerticalAxisRef = objVerticalAxis.AxisRef;

            //Not allow to Scroll Axes

            objHorizontalAxis.isAllowScrolling = false;
            objVerticalAxis.isAllowScrolling = false;

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

          let xPos: number =
            (barWidth * objHorizontalAxisScaleRef(lx)) /
            objHorizontalAxisScaleRef.bandwidth();

          xPos =
            objHorizontalAxisScaleRef(lx) +
            objHorizontalAxisScaleRef.bandwidth() / 2 -
            barWidth / 2;

          this.ChartRef.SVGRect.append("g")
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
              this.ChartRef.__toolTip.css("z-index", 10000);

              //Check if tooltip is going beyond right edge
            })
            .on("mousedown", (a, b, c) => {
              
              //   let seriesId = c[0].getAttribute("seriesId");
              //   let index=c[0].getAttribute("index");
              //this.ChartRef.triggerSeriesClickEvent(seriesId,index);
            });
        }
      }
    } catch (error) { }
  };

  findUniqueBarScale = () =>{
    try {
      
      let uniqueScale =[];
        

      for (let key of this.ChartRef.DataSeries.keys()) {
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);
          if  (objSeries.Type == dataSeriesType.Bar) {
      
            let rec= {};
            rec["X"] = objSeries.XAxisId;
//            rec["Y"] = objSeries.YAxisId;

            //let i = uniqueScale.findIndex((value) => value.X === objSeries.XAxisId  && value.Y === objSeries.YAxisId);
            let i = uniqueScale.findIndex((value) => value.X === objSeries.XAxisId);
            if (i==-1){
              uniqueScale.push(rec);
            }
          }
          
      }
      this.uniqueBarScale = uniqueScale;
      

    } catch (error) {
      
    }

  }

  isBarClicked = (x: number, y: number) => {
    try {
      let allbars = d3.selectAll("rect");
    } catch (error) { }
  };
}

