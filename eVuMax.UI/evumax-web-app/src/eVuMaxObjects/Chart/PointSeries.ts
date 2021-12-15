//http://jsfiddle.net/qy5ohw0x/5/
//https://stackoverflow.com/questions/24539234/list-of-d3-symbols-available-to-us/42217257
//http://jsfiddle.net/salih0vicX/7vx2z/3/
//https://www.tutorialspoint.com/How-to-draw-a-star-by-using-canvas-HTML5#:~:text=Use%20the%20HTML%20DOM%20Method,to%20help%20you%20in%20drawing.


import * as Chart from "../Chart/Chart";
import * as d3 from "d3";
import $ from "jquery";
import { DataSeries, dataSeriesType, pointStyle } from "./DataSeries";
import { ChartData } from "./ChartData";

export enum pointShape {
    Circle = "circle",
    Rectangle = "rectangle",
    Diamond = "Diamond",
    Star = "Star",
    Triangle = "Triangle",
    DownTriangle = 'DownTriangle',
    LeftTriangle = "LeftTriangle",
    RightTriangle = 'RightTriangle',
}

//This file contains logic of generating line chart on the plot
export class PointSeries {
    //External References
    ChartRef: Chart.Chart;

    //Draws the series, this will draw vertical bars along with X Axis
    redrawSeries = () => {
        try {
            //Remove existing data


            let xValues = new Array<number>();
            for (let key of this.ChartRef.DataSeries.keys()) {
                let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

                if (objSeries.Type == dataSeriesType.Point) {
                    try {
                        let objHorizontalAxis = this.ChartRef.getAxisByID(
                            objSeries.XAxisId
                        );
                        let objVerticalAxis = this.ChartRef.getAxisByID(objSeries.YAxisId);

                        let objHorizontalAxisScaleRef = objHorizontalAxis.ScaleRef;
                        let objHorizontalAxisRef = objHorizontalAxis.AxisRef;

                        let objVerticalAxisScaleRef = objVerticalAxis.ScaleRef;
                        let objVerticalAxisRef = objVerticalAxis.AxisRef;

                        let sx = this.ChartRef.ScrollingScale.get(objHorizontalAxis.Id); //  this.ChartRef.sxBottom;
                        let sy = this.ChartRef.ScrollingScale.get(objVerticalAxis.Id); //.syLeft;

                        let rotateAngle: number = 0;
                        // Add the point
                            debugger;
                        switch (objSeries.PointStyle) {
                            case pointStyle.DownTriangle:
                                rotateAngle = 180;
                                break;
                            case pointStyle.LeftTriangle:
                                rotateAngle = -90;
                                break;
                            case pointStyle.RightTriangle:
                                rotateAngle = 90;
                                break;

                            default:
                                rotateAngle = 0;
                                break;
                        }

                        // Scrolling Disable in case (1) any x/y axis is bandscale (2) for both x/y axes allow scrolling false (while defind axes)
                        if ((objHorizontalAxis.bandScale || objVerticalAxis.bandScale) || !(objHorizontalAxis.isAllowScrolling && objVerticalAxis.isAllowScrolling)) {
                            this.ChartRef.isScrollingInProgress = false;
                        }

                        if (!this.ChartRef.isScrollingInProgress) {

                            this.ChartRef.CanvasContext.fillStyle = objSeries.Color;
                            let px, py;
                            objSeries.Data.forEach(point => {
                                this.ChartRef.CanvasContext.beginPath();

                                if (objHorizontalAxis.IsDateTime) {
                                    px = Number(objHorizontalAxisScaleRef(point.datetime));
                                } else {
                                    px = Number(objHorizontalAxisScaleRef(point.x));
                                }
                                py = Number(objVerticalAxisScaleRef(point.y));

                                //this.ChartRef.CanvasContext.arc(px, py, objSeries.PointSize, 0, 2 * Math.PI, true);


                                this.drawPoint(px, py, objSeries);

                                this.ChartRef.CanvasContext.fill();
                                this.ChartRef.CanvasContext.closePath();

                                // This will be used in Tooltip in MouseMove event of SVG
                                point.xPixel = Number(px.toFixed(0));
                                point.yPixel = Number(py.toFixed(0));
                                //

                            });

                            //console.log("newData", objSeries.Data);

                            //For SVG
                            // this.ChartRef.SVGRect.append("g")
                            //     //this.ChartRef.SVGRef.append("g")
                            //     .attr("class", objSeries.Id)
                            //     .selectAll(".symbol")

                            //     .data(objSeries.Data)
                            //     .enter()
                            //     .append("path")
                            //     .attr("class", "eachPoint")
                            //     .attr("transform", function (d) {
                            //         if (objHorizontalAxis.IsDateTime) {
                            //             return "translate(" + Number(objHorizontalAxisScaleRef(d.datetime)) + "," + Number(objVerticalAxisScaleRef(d.y)) + ")";
                            //         } else {

                            //             return "translate(" + Number(objHorizontalAxisScaleRef(d.x)) + "," + Number(objVerticalAxisScaleRef(d.y)) + ") rotate(" + rotateAngle + ")";
                            //         }
                            //     })

                            //     .attr("d", d3.symbol().size(objSeries.PointSize).type(
                            //         function () {

                            //             if (objSeries.PointStyle == pointStyle.Circle) {    //Circle
                            //                 return d3.symbols[0];
                            //             };

                            //             if (objSeries.PointStyle == pointStyle.Diamond) {
                            //                 return d3.symbols[2];
                            //             };

                            //             if (objSeries.PointStyle == pointStyle.Rectangle) {
                            //                 return d3.symbols[3];
                            //             };

                            //             if (objSeries.PointStyle == pointStyle.Star) {
                            //                 return d3.symbols[4];
                            //             };

                            //             if (objSeries.PointStyle == pointStyle.Triangle || objSeries.PointStyle == pointStyle.DownTriangle || objSeries.PointStyle == pointStyle.LeftTriangle || objSeries.PointStyle == pointStyle.RightTriangle) {
                            //                 return d3.symbols[5];
                            //             };

                            //         }
                            //     ))
                            //     .style("fill", objSeries.Color)
                            //     .on("mousemove",
                            //         function (d) {
                            //             objHorizontalAxis.ChartRef.__toolTip.css("visibility", "visible");
                            //             if (objHorizontalAxis.IsDateTime) {
                            //                 //return objHorizontalAxis.ChartRef.__toolTip.html(objHorizontalAxisScaleRef(d.datetime) + "," + Number(objVerticalAxisScaleRef(d.y)));
                            //                 objHorizontalAxis.ChartRef.__toolTip.html(objHorizontalAxis.Title + " - " + d.datetime + "<br>" + objVerticalAxis.Title + " - " + Number(d.y).toFixed(2));
                            //             } else {
                            //
                            //                 objHorizontalAxis.ChartRef.__toolTip.html(objHorizontalAxis.Title + " - " + Number(d.x).toFixed(2) + "<br>" + objVerticalAxis.Title + " - " + Number(d.y).toFixed(2));
                            //             }
                            //             objHorizontalAxis.ChartRef.__toolTip.css("position", "absolute");
                            //             objHorizontalAxis.ChartRef.__toolTip.css("background-color", "#585656");
                            //             objHorizontalAxis.ChartRef.__toolTip.css("padding", "5px");
                            //             objHorizontalAxis.ChartRef.__toolTip.css("border-radius", "3px");
                            //             objHorizontalAxis.ChartRef.__toolTip.css("left", 0);
                            //             objHorizontalAxis.ChartRef.__toolTip.css("top", 0);
                            //             var tooltipX = objHorizontalAxis.ChartRef.__mouseLastX;
                            //             var tooltipY = objHorizontalAxis.ChartRef.__mouseLastY;
                            //             var tooltipWidth = objHorizontalAxis.ChartRef.__toolTip.innerWidth();
                            //             var tooltipHeight = objHorizontalAxis.ChartRef.__toolTip.innerHeight();

                            //             if (tooltipX + tooltipWidth > objHorizontalAxis.ChartRef.__chartRect.right) {
                            //                 tooltipX = tooltipX - tooltipWidth;
                            //             }

                            //             if (tooltipY + tooltipHeight > objHorizontalAxis.ChartRef.__chartRect.bottom) {
                            //                 tooltipY = tooltipY - tooltipHeight;
                            //             }

                            //             objHorizontalAxis.ChartRef.__toolTip.css("left", tooltipX + 10);
                            //             objHorizontalAxis.ChartRef.__toolTip.css("top", tooltipY);
                            //             objHorizontalAxis.ChartRef.__toolTip.css("display", "inherit");
                            //         })
                            //     .on("mouseout", function () { return objHorizontalAxis.ChartRef.__toolTip.css("visibility", "hidden"); });

                        } else {
                            //While scrolling
                            this.ChartRef.CanvasContext.fillStyle = objSeries.Color;
                            let px, py;
                            objSeries.Data.forEach(point => {
                                this.ChartRef.CanvasContext.beginPath();
                                if (objHorizontalAxis.IsDateTime) {
                                    px = Number(sx(point.datetime));
                                } else {
                                    px = Number(sx(point.x));
                                }
                                py = Number(sy(point.y));

                                //this.ChartRef.CanvasContext.arc(px, py, objSeries.PointSize, 0, 2 * Math.PI, true);
                                this.drawPoint(px, py, objSeries);

                                this.ChartRef.CanvasContext.fill();
                                this.ChartRef.CanvasContext.closePath();

                                // This will be used in Tooltip in MouseMove event of SVG
                                point.xPixel = Number(px.toFixed(0));
                                point.yPixel = Number(py.toFixed(0));
                                //

                            });


                            //SVG
                            // this.ChartRef.SVGRect.append("g")
                            //     //this.ChartRef.SVGRef.append("g")
                            //     .attr("class", objSeries.Id)
                            //     .selectAll(".symbol")
                            //     .data(objSeries.Data)
                            //     .enter()
                            //     .append("path")
                            //     .attr("transform", function (d) {
                            //         if (objHorizontalAxis.IsDateTime) {
                            //             return "translate(" + Number(sx(d.datetime)) + "," + Number(sy(d.y)) + ")";
                            //         } else {

                            //             return "translate(" + Number(sx(d.x)) + "," + Number(sy(d.y)) + ") rotate(" + rotateAngle + ")";
                            //         }
                            //     })

                            //     .attr("d", d3.symbol().size(objSeries.PointSize).type(
                            //         function () {

                            //             if (objSeries.PointStyle == pointStyle.Circle) {    //Circle
                            //                 return d3.symbols[0];
                            //             };

                            //             if (objSeries.PointStyle == pointStyle.Diamond) {
                            //                 return d3.symbols[2];
                            //             };

                            //             if (objSeries.PointStyle == pointStyle.Rectangle) {
                            //                 return d3.symbols[3];
                            //             };

                            //             if (objSeries.PointStyle == pointStyle.Star) {
                            //                 return d3.symbols[4];
                            //             };

                            //             if (objSeries.PointStyle == pointStyle.Triangle || objSeries.PointStyle == pointStyle.DownTriangle || objSeries.PointStyle == pointStyle.LeftTriangle || objSeries.PointStyle == pointStyle.RightTriangle) {
                            //                 return d3.symbols[5];
                            //             };

                            //         }
                            //     ))
                            //     .style("fill", objSeries.Color);

                        }
                        //=======================================
                    } catch (error) { }
                }

            }
        } catch (error) { }
    }

    drawPoint = (px, py, objSeries) => {
        try {
            let pointSize = 0;

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
};
