//http://bl.ocks.org/jasondavies/3689931

import * as Chart from "../Chart/Chart";
import * as d3 from "d3";
import $ from "jquery";
import { AxisRange, AxisDateRange } from "../Chart/AxisRange";
import { Axis } from "../Chart/Axis";
import { min } from "d3";
import { faUnderline } from "@fortawesome/free-solid-svg-icons";
import { text } from "@fortawesome/fontawesome-svg-core";
import { DataSeries, dataSeriesType, pointStyle } from "./DataSeries";
import { ChartData } from "./ChartData";
import { debug } from "console";
import moment from "moment";

//This file contains logic of generating line chart on the plot
export class LineSeries {
  //External References
  ChartRef: Chart.Chart;


  drawPoint = (px, py,pColor, objSeries) => {
    try {
        this.ChartRef.CanvasContext.fillStyle = pColor; //Nishant 22-12-2021
     

        switch (objSeries.PointStyle) {
            case pointStyle.Circle:
                this.ChartRef.CanvasContext.arc(px, py, objSeries.PointSize, 0, 2 * Math.PI, true);
                break;
            case pointStyle.Diamond:
                this.ChartRef.CanvasContext.moveTo(px, py);
                this.ChartRef.CanvasContext.lineTo(px - objSeries.PointWidth / 2, py + objSeries.PointHeight / 2);//left
                this.ChartRef.CanvasContext.lineTo(px, py + objSeries.PointHeight); //bottom left
                this.ChartRef.CanvasContext.lineTo(px + objSeries.PointWidth / 2, py + objSeries.PointHeight / 2);// bottom right edge
                break;
            case pointStyle.Rectangle:
                this.ChartRef.CanvasContext.fillRect(px, py, objSeries.PointWidth, objSeries.PointHeight);
                
                break;
            case pointStyle.Star:
                try {
                    //triangle
                    var h = objSeries.PointSize * (Math.sqrt(3) / 2);
                    this.ChartRef.CanvasContext.save();
                    this.ChartRef.CanvasContext.translate(px, py);
                    this.ChartRef.CanvasContext.beginPath();
                    this.ChartRef.CanvasContext.moveTo(0, -h);
                    this.ChartRef.CanvasContext.lineTo(-objSeries.PointSize, h);  // line a
                    this.ChartRef.CanvasContext.lineTo(objSeries.PointSize, h); // line b
                    this.ChartRef.CanvasContext.lineTo(0, -h);            // line c
                    this.ChartRef.CanvasContext.fill();
                    this.ChartRef.CanvasContext.closePath();
                    this.ChartRef.CanvasContext.restore();

                    //reverse triangle

                    let side = objSeries.PointSize * (-1);

                    h = side * (Math.sqrt(3) / 2);
                    this.ChartRef.CanvasContext.save();
                    this.ChartRef.CanvasContext.translate(px, py + objSeries.PointSize / 2);
                    this.ChartRef.CanvasContext.beginPath();
                    this.ChartRef.CanvasContext.moveTo(0, -h);
                    this.ChartRef.CanvasContext.lineTo(-side, h);  // line a
                    this.ChartRef.CanvasContext.lineTo(side, h); // line b
                    this.ChartRef.CanvasContext.lineTo(0, -h);            // line c
                    this.ChartRef.CanvasContext.fill();
                    this.ChartRef.CanvasContext.restore();



                } catch (error) {

                }


                break;
            case pointStyle.Triangle:
                var h = objSeries.PointSize * (Math.sqrt(3) / 2);
                this.ChartRef.CanvasContext.save();
                this.ChartRef.CanvasContext.translate(px, py);
                this.ChartRef.CanvasContext.beginPath();
                this.ChartRef.CanvasContext.moveTo(0, -h);
                this.ChartRef.CanvasContext.lineTo(-objSeries.PointSize, h);  // line a
                this.ChartRef.CanvasContext.lineTo(objSeries.PointSize, h); // line b
                this.ChartRef.CanvasContext.lineTo(0, -h);            // line c
                this.ChartRef.CanvasContext.closePath();
                this.ChartRef.CanvasContext.restore();
                break;
            case pointStyle.DownTriangle:
                var h = objSeries.PointSize * (Math.sqrt(3) / 2);
                this.ChartRef.CanvasContext.save();
                this.ChartRef.CanvasContext.translate(px, py);
                this.ChartRef.CanvasContext.beginPath();
                this.ChartRef.CanvasContext.rotate(Math.PI);
                this.ChartRef.CanvasContext.moveTo(0, -h);
                this.ChartRef.CanvasContext.lineTo(-objSeries.PointSize, h);  // line a
                this.ChartRef.CanvasContext.lineTo(objSeries.PointSize, h); // line b
                this.ChartRef.CanvasContext.lineTo(0, -h);            // line c
                this.ChartRef.CanvasContext.closePath();
                this.ChartRef.CanvasContext.restore();



                break;
            case pointStyle.LeftTriangle : //Wip
        //    case 10 : //Wip
                var h = objSeries.PointSize * (Math.sqrt(3) / 2);
                this.ChartRef.CanvasContext.save();
                this.ChartRef.CanvasContext.translate(px, py);
                this.ChartRef.CanvasContext.beginPath();
                this.ChartRef.CanvasContext.rotate(90 * Math.PI / 180);
                this.ChartRef.CanvasContext.moveTo(0, -h);
                this.ChartRef.CanvasContext.lineTo(-objSeries.PointSize, h);  // line a
                this.ChartRef.CanvasContext.lineTo(objSeries.PointSize, h); // line b
                this.ChartRef.CanvasContext.lineTo(0, -h);            // line c
                this.ChartRef.CanvasContext.closePath();
                this.ChartRef.CanvasContext.restore();
                break;
            case pointStyle.RightTriangle : //Wip
            //case 11 : //Wip
                var h = objSeries.PointSize * (Math.sqrt(3) / 2);
                this.ChartRef.CanvasContext.save();
                this.ChartRef.CanvasContext.translate(px, py);
                this.ChartRef.CanvasContext.beginPath();
                this.ChartRef.CanvasContext.rotate(-90 * Math.PI / 180);
                this.ChartRef.CanvasContext.moveTo(0, -h);
                this.ChartRef.CanvasContext.lineTo(-objSeries.PointSize, h);  // line a
                this.ChartRef.CanvasContext.lineTo(objSeries.PointSize, h); // line b
                this.ChartRef.CanvasContext.lineTo(0, -h);            // line c
                this.ChartRef.CanvasContext.closePath();
                this.ChartRef.CanvasContext.restore();
                break;
            default:
                break;
        }


    } catch (error) {

    }

}



  redrawSeries = () => {
    let plotOn: any;

    let lineSeriesNameList = []; //prath

    try {
      plotOn = this.ChartRef.SVGRect;
      //plotOn = this.ChartRef.SVGRef;

      //Remove existing data
      let xValues = new Array<number>();

      for (let key of this.ChartRef.DataSeries.keys()) {
        let name = this.ChartRef.DataSeries.get(key).Title; //prath
        let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

        if (objSeries.Type == dataSeriesType.Line) {
          try {
            $("." + objSeries.Id).remove();

            //prath========
            objSeries.Data.forEach((element) => {
              if (
                moment(element.datetime).isValid() &&
                element.x == undefined
              ) {
                let newData: {} = {
                  x: element.datetime,
                  y: element.y,
                  z: element.z,
                };
              } else {
                let newData: {} = {
                  x: element.x,
                  y: element.y,
                  z: element.z,
                };
              }
            });

            lineSeriesNameList.push({
              name: name,
              color: objSeries.Color,
              horizontalAxisID: objSeries.XAxisId,
              verticalAxisID: objSeries.YAxisId,
            });
            //============
          } catch (error) { }
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

            if (objHorizontalAxis.bandScale || objVerticalAxis.bandScale) {
              objHorizontalAxis.isAllowScrolling = false;
              objVerticalAxis.isAllowScrolling = false;
            }

            let dashStyle = "0";

            if (objSeries.LineStyle == Chart.lineStyle.dashed) {
              dashStyle = "5,2";
            }

           
            // var f = objSeries.Data;
            // if (this.ChartRef.isScrolling) {
            //   f = objSeries.Data.filter((d) => {
            //     return (
            //       d.x > this.ChartRef.sxBottom.domain()[0] &&
            //       d.x < this.ChartRef.sxBottom.domain()[1] &&
            //       d.y > this.ChartRef.syLeft.domain()[0] &&
            //       d.y < this.ChartRef.syLeft.domain()[1]
            //     )
            //   });
            // }

            let sx = this.ChartRef.ScrollingScale.get(objHorizontalAxis.Id); //  this.ChartRef.sxBottom;
            let sy = this.ChartRef.ScrollingScale.get(objVerticalAxis.Id); //.syLeft;
            let line;

          

            // Scrolling Disable in case (1) any x/y axis is bandscale (2) for both x/y axes allow scrolling false (while defind axes)
            if ((objHorizontalAxis.bandScale || objVerticalAxis.bandScale) || !(objHorizontalAxis.isAllowScrolling && objVerticalAxis.isAllowScrolling)) {
              this.ChartRef.isScrollingInProgress = false;
            }

            //Define Line
            if (!this.ChartRef.isScrollingInProgress) {
              //without scrolling
              line = d3
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
            } else {
              //while scrolling

              line = d3
                .line<ChartData>()
                .x(function (d: ChartData, i: number) {
                  if (objHorizontalAxis.IsDateTime) {
                    return Number(sx(d.datetime));
                  } else {
                    return Number(sx(d.x));
                  }
                })
                .y(function (d: ChartData, i: number) {
                  if (objVerticalAxis.IsDateTime) {
                    return Number(sy(d.datetime));
                  } else {
                    return Number(sy(d.y));
                  }
                });
            }

            //prath 26-10-2020 for Line Curve
            switch (objSeries.CurveStyle) {
              case Chart.curveStyle.smooth:
                line.curve(d3.curveMonotoneX);
                break;
              case Chart.curveStyle.step:
                line.curve(d3.curveStepBefore);
                break;
              default:
                break;
            }

            //color each point for line prath 26-11-2020=====================
            if (!objSeries.ColorEach) {
              // logic ColorEach=false
              let svgLine = plotOn
                .append("g") //Earlier we plot on SVGRef but not require now because we are puting Lines on Rectangle (Clips)
                //let svgLine = this.ChartRef.SVGRef.append("g") //Instead of draw line on SVG, we will put line on SVGRectange (clip area for inner plot) PRATH  ZOOM-CHART
                .attr("class", objSeries.Id)
                .append("path")
                .attr("class", this.ChartRef.Id + "d3line")
                //.datum(objSeries.Data)
                .datum(objSeries.Data)
                .style("opacity", 1)
                .style("fill", "none")
                .attr("stroke", objSeries.Color)
                .attr("stroke-width", objSeries.LineWidth)
                .attr("stroke-dasharray", dashStyle)
                .attr("d", line);


                //Below Code is for drawing Point on Line  (WIP HIGH PRIORITY)
                // this.ChartRef.CanvasContext.fillStyle = objSeries.Color;
                
                // let px, py,pColor;//Nishant 28-12-2021
                
                // objSeries.Data.forEach(point => {
                  
                //   this.ChartRef.CanvasContext.beginPath();

                //     if (objHorizontalAxis.IsDateTime) {
                //         px = Number(objHorizontalAxisScaleRef(point.datetime));
                //     } else {
                //         px = Number(objHorizontalAxisScaleRef(point.x));
                //     }
                //     py = Number(objVerticalAxisScaleRef(point.y));

                //     if(objSeries.ColorEach)//Nishant 22-12-2021
                //     {
                //         pColor=point.color;//Nishant 22-12-2021
                //     }
                //     else
                //     {
                //         pColor=objSeries.Color;//Nishant 22-12-2021
                //     }
                    
                //     this.drawPoint(px, py,pColor, objSeries);//Nishant 22-12-2021
                //     this.ChartRef.CanvasContext.fill();
                //     this.ChartRef.CanvasContext.closePath();
                //     // This will be used in Tooltip in MouseMove event of SVG
                //     point.xPixel = Number(px.toFixed(0));
                //     point.yPixel = Number(py.toFixed(0));
                //     //

                // });
                //*********************************** */




            } else {
              // logic ColorEach=false (For vertual immaginary line for CrossHairCursor)
              plotOn
                .append("g")
                .attr("class", objSeries.Id)
                .append("path")
                .attr("class", this.ChartRef.Id + "d3line")
                .datum(objSeries.Data)
                .style("opacity", 1)
                .style("fill", "none")
                .attr("stroke", "none")
                .attr("stroke-width", objSeries.LineWidth)
                .attr("stroke-dasharray", dashStyle)
                .attr("d", line);

              // ColorEach=true  **************
              // Iterate thru each data of Series & make new collection in the form to support Color Each
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

              if (!this.ChartRef.isScrollingInProgress) {
                //Not scrolling
                let lines = plotOn
                  .selectAll("line-") //ZOOM-CHART
                  .data(NewData)
                  .enter()
                  .append("line")
                  .attr("class", objSeries.Id)
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
              } else {
                // Scrolling
                let lines = plotOn
                  .selectAll("line-") //ZOOM-CHART
                  .data(NewData)
                  .enter()
                  .append("line")
                  .attr("class", objSeries.Id)
                  .attr("id", "line-")
                  .attr("x1", function (d) {
                    return sx(d.x1);
                  })
                  .attr("y1", function (d) {
                    return sy(d.y1);
                  })
                  .attr("x2", function (d) {
                    return sx(d.x2);
                  })
                  .attr("y2", function (d) {
                    return sy(d.y2);
                  })
                  .attr("stroke", function (d) {
                    return d.color;
                  })
                  .attr("fill", "none")
                  .attr("stroke-width", objSeries.LineWidth); //wip
              }
            }


              //Below Code is for drawing Point on Line  (WIP HIGH PRIORITY)
              if (objSeries.ShowPointsOnLineSeries){
              this.ChartRef.CanvasContext.fillStyle = objSeries.Color;
                
              let px, py,pColor;//Nishant 28-12-2021
              
              objSeries.Data.forEach(point => {
                
                this.ChartRef.CanvasContext.beginPath();

                  if (objHorizontalAxis.IsDateTime) {
                      px = Number(objHorizontalAxisScaleRef(point.datetime));
                  } else {
                      px = Number(objHorizontalAxisScaleRef(point.x));
                  }
                  py = Number(objVerticalAxisScaleRef(point.y));

                  if(objSeries.ColorEach)//Nishant 22-12-2021
                  {
                      pColor=point.color;//Nishant 22-12-2021
                  }
                  else
                  {
                      pColor=objSeries.Color;//Nishant 22-12-2021
                  }
                  
                  this.drawPoint(px, py,pColor, objSeries);//Nishant 22-12-2021
                  this.ChartRef.CanvasContext.fill();
                  this.ChartRef.CanvasContext.closePath();
                  // This will be used in Tooltip in MouseMove event of SVG
                  point.xPixel = Number(px.toFixed(0));
                  point.yPixel = Number(py.toFixed(0));
                  //

              });
            }
              //*********************************** */

          } catch (error) { }
        }



        //CrossHair logic prath=====================
        if (this.ChartRef.CrossHairRequire) {
          try {
            $("." + this.ChartRef.Id + "-mouse-line").remove();
            $("." + this.ChartRef.Id + "-mouse-over-effects").remove();

            //ZOOM-CHART -following 1 line
            //let mouseG = this.ChartRef.SVGRef.append("g").attr(
            let mouseG = plotOn
              .append("g")
              .attr("class", this.ChartRef.Id + "-mouse-over-effects");

            mouseG
              .append("path") // this is the black vertical line to follow mouse
              .attr("class", this.ChartRef.Id + "-mouse-line")
              .style("stroke", "white")
              .style("stroke-width", "1px")
              .style("opacity", "0");

            let chartHeight = this.ChartRef.__chartRect.height;
            let lines: any = document.getElementsByClassName(
              this.ChartRef.Id + "d3line"
            );
            let objChart = this.ChartRef;
            var mousePerLine = mouseG
              .selectAll("." + this.ChartRef.Id + "-mouse-per-line")
              .data(lineSeriesNameList)
              .enter()
              .append("g")
              .attr("class", this.ChartRef.Id + "-mouse-per-line");

            mousePerLine
              .append("circle")
              .attr("r", 7)
              .style("stroke", function (d) {
                //return d.color; //"#11bbcc"; // objSeries.Color;
                return "red";
              })
              .style("fill", "none")
              .style("stroke-width", "1px")
              .style("opacity", "0");

            mousePerLine
              .append("path")
              .attr("class", "mouse-horizontal-line")
              //.style("stroke", "black")
              .style("stroke", "white") //horizontal line color
              .style("stroke-width", "1px")
              .style("opacity", "0");

            mousePerLine
              .append("text")
              .style("stroke", "white")
              .attr("transform", "translate(10,3)");

            let ChartRef = this.ChartRef;

            mouseG
              .append("rect") // append a rect to catch mouse movements on canvas
              .attr("width", this.ChartRef.__chartRect.width) // can't catch mouse events on a g element  -
              .attr("height", this.ChartRef.__chartRect.height)
              .attr("fill", "none")
              .attr("pointer-events", "all")
              .on("mouseout", function () {
                // on mouse out hide line, circles and text
                d3.select("." + ChartRef.Id + "-mouse-line").style(
                  "opacity",
                  "0"
                );

                d3.selectAll(
                  "." + ChartRef.Id + "-mouse-per-line circle"
                ).style("opacity", "0");
                d3.selectAll("." + ChartRef.Id + "-mouse-per-line text").style(
                  "opacity",
                  "0"
                );

                d3.selectAll("." + ChartRef.Id + "-mouse-per-line path").style(
                  "opacity",
                  "0"
                );
              })
              .on("mouseover", function () {
                // on mouse in show line, circles and text
                d3.select("." + ChartRef.Id + "-mouse-line").style(
                  "opacity",
                  "1"
                );
                d3.selectAll(
                  "." + ChartRef.Id + "-mouse-per-line circle"
                ).style("opacity", "1");
                d3.selectAll("." + ChartRef.Id + "-mouse-per-line text").style(
                  "opacity",
                  "1"
                );

                d3.selectAll("." + ChartRef.Id + "-mouse-per-line path").style(
                  "opacity",
                  "1"
                );
              })
              .on("mousemove", function () {
                var mouse = d3.mouse(this);
                d3.select("." + ChartRef.Id + "-mouse-line").attr("d", () => {
                  var d = "M" + mouse[0] + "," + ChartRef.__chartRect.height; //chartHeight to change vertical moving line size
                  d += " " + mouse[0] + "," + 0;
                  return d;
                });
                var mousePos = mouse[0];

                d3.selectAll("." + ChartRef.Id + "-mouse-per-line").attr(
                  "transform",

                  function (d: any, i) {
                    let horizontalAxies: any;
                    let verticalAxies: any;

                    if (!(d.horizontalAxisID == undefined)) {
                      horizontalAxies = ChartRef.Axes.get(d.horizontalAxisID);
                    
                    } else {
                      alert("undefined Horizontal Axis");
                    }

                    if (!(d.verticalAxisID == undefined)) {
                      verticalAxies = ChartRef.Axes.get(d.verticalAxisID);
                    } else {
                      alert("undefined Vertical Axis");
                    }

                    var beginning = 0;
                    let pos: any;
                    try {
                      var end = lines[i].getTotalLength(),
                        target = null;

                      while (true) {
                        target = Math.floor((beginning + end) / 2);
                        //When Line series is present on chart without data & user try to move cursor in that case target become=0,  to avoid error need following condition
                        if (target == 0) {
                          return;
                        }
                        pos = lines[i].getPointAtLength(target);

                        if (
                          (target === end || target === beginning) &&
                          pos.x !== mouse[0]
                        ) {
                          break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                      }

                      // Cross Hair point - Text Value
                      if (
                        horizontalAxies != undefined &&
                        verticalAxies != undefined
                      ) {
                        let xValue = "";
                        if (horizontalAxies.bandScale) {
                          
                          
                          xValue = horizontalAxies.bandScale;
                        } else {
                          if (!horizontalAxies.IsDateTime) {
                            xValue = horizontalAxies.ScaleRef.invert(
                              pos.x
                            ).toFixed(2);
                          } else {
                            let dateValue = moment(
                              horizontalAxies.ScaleRef.invert(pos.x)
                            ).format("d-MMM-yyyy HH:mm:ss");
                            xValue = dateValue;
                          }
                        }

                        let yValue = "xxx";
                        if (verticalAxies.bandScale) {
                          
                          yValue = "xxx";
                        } else {
                          if (!verticalAxies.IsDateTime) {
                            yValue = verticalAxies.ScaleRef.invert(
                              pos.y
                            ).toFixed(2);
                          } else {
                            let dateValue = moment(
                              verticalAxies.ScaleRef.invert(pos.y)
                            ).format("d-MMM-yyyy HH:mm:ss");
                            yValue = dateValue;
                          }
                        }

                        d3.select(this)
                          .select("text")
                          .attr("font-family", "Verdana")
                          .style("fill", "red")
                          .attr("font-size", "12px")
                          .style("stroke-width", "0px")
                          .style("stroke", function (d: any) {
                            //return d.color; //"#11bbcc"; // objSeries.Color;
                            return "red";
                          })
                          .text(d.name + " (" + xValue + " , " + yValue + ")");
                      } else {
                        console.log(
                          "Horizontal / Varitcal Scale not found " + ChartRef.Id
                        );
                      }
                    } catch (error) {
                      
                    }

                    d3.select(this)
                      .select("path")
                      .attr("d", function () {
                        var d = "M" + 0 + "," + 0; //Cursor position
                        d +=
                          " " +
                          (-mouse[0] + ChartRef.__chartRect.left) +
                          "," +
                          0; //Left position
                        d +=
                          " " +
                          (ChartRef.__chartRect.width -
                            mouse[0] +
                            ChartRef.__chartRect.left) +
                          "," +
                          0; //Right position

                        return d;
                      });

                    console.log(mouse[0], mousePos);

                    return "translate(" + mouse[0] + "," + pos.y + ")";
                  }
                );
              });
            //prath code end for Crosshair Cursor
          } catch (error) { }
        }





       

      }
    } catch (error) { }
  };
}
