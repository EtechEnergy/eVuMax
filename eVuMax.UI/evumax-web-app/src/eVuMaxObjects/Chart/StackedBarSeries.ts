import * as Chart from '../Chart/Chart';
import * as d3 from 'd3';
import $ from 'jquery';
import { AxisRange, AxisDateRange } from '../Chart/AxisRange';
import { Axis } from '../Chart/Axis';
import { min } from 'd3';
import { faUnderline } from '@fortawesome/free-solid-svg-icons';
import { text } from '@fortawesome/fontawesome-svg-core';
import { DataSeries, dataSeriesType } from './DataSeries';
import { ChartData } from './ChartData';
import { ChartSeriesDefaults } from '@progress/kendo-react-all';
import { debug } from 'console';

//This file contains logic of generating stacked bar chart on the plot
export class StackedBarSeries {
	//External References
	ChartRef: Chart.Chart;

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
			let customLabels = new Array<string>();
			for (let key of this.ChartRef.DataSeries.keys()) {
				let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

				if (objSeries.Type == dataSeriesType.Bar) {
					try {
						$('.' + objSeries.Id).remove();
					} catch (error) { }
				}
			}

			//Generate unique X values from the data
			for (let key of this.ChartRef.DataSeries.keys()) {
				let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

				if (objSeries.Type == dataSeriesType.Bar) {
					for (let d = 0; d < objSeries.Data.length; d++) {
						let objData: ChartData = objSeries.Data[d];

						if (xValues.find((o) => o == objData.x) == undefined) {
							xValues.push(objData.x);
							customLabels.push(objData.label);
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

						let axisDomainValues: string[] = objHorizontalAxisScaleRef.domain();

						for (let d = 0; d < objSeries.Data.length; d++) {
							let objData: ChartData = objSeries.Data[d];

							if (objData.x == lx) {
								//only include if horizontal axis domain contains entry of this value
								if (axisDomainValues.find((o) => o == lx.toString()) != undefined) {
									stackValues.push(objData.y);

									if (objSeries.ColorEach) {
										if (objData.color.trim() != '') {
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

				debugger;
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

						//prath 18-12-2020 for Costing chart -ve value not ploting
						if (height < 0) {
							height = height * -1;
						}
						//

						//after calculating height, put the bar at 0
						yPos = objVerticalAxisScaleRef(0);

						if (s > 0) {
							yPos = prevYpos - height;
						}

						prevYpos = yPos;
						prevHeight = height;
					} else {
						yPos = objVerticalAxisScaleRef(stackValues[s]);

						////  Changed by prath 17-12-2020 for invert y axies
						//Nitin
						// if (objVerticalAxis.Inverted) {
						//   height = objVerticalAxisScaleRef(0) - yPos;
						// } else {
						//   if (objVerticalAxis.IsDateTime) {
						//     let objAxisRange: AxisDateRange = objVerticalAxis.getAxisRange();
						//     height = yPos - objVerticalAxisScaleRef(0);
						//   } else {
						//     let objAxisRange: AxisRange = objVerticalAxis.getAxisRange();
						//     height = yPos - objVerticalAxisScaleRef(0);
						//   }
						// }

						//Prath
						if (objVerticalAxis.Inverted) {
							let objAxisRange: AxisRange = objVerticalAxis.getAxisRange();
							height = yPos - objVerticalAxisScaleRef(0);
						} else {
							if (objVerticalAxis.IsDateTime) {
								let objAxisRange: AxisDateRange = objVerticalAxis.getAxisRange();
								height = yPos - objVerticalAxisScaleRef(0);
							} else {
								height = objVerticalAxisScaleRef(0) - yPos;
							}
						}

						//==========================================

						if (s > 0) {
							yPos = prevYpos - height;
						}

						prevYpos = yPos;
						prevHeight = height;
					}

					if (barWidth > 50) {
						barWidth = 50;
					}

					let xPos: number = barWidth * objHorizontalAxisScaleRef(lx) / objHorizontalAxisScaleRef.bandwidth();

					xPos = objHorizontalAxisScaleRef(lx) + objHorizontalAxisScaleRef.bandwidth() / 2 - barWidth / 2;

					let hasValidCoOrdinates = false;

					if (!isNaN(xPos) && !isNaN(yPos) && !isNaN(barWidth) && !isNaN(height)) {
						this.ChartRef.SVGRect
							.append('g')
							.attr('class', seriesIds[s])
							.attr('id', seriesIds[s] + '--' + s.toString())
							.append('rect')
							.attr('id', seriesIds[s] + '--' + i.toString())
							.attr('seriesId', seriesIds[s])
							.attr('index', i)
							.attr('x', xPos)
							.attr('y', yPos)
							.attr('width', barWidth)
							.attr('height', height)
							.style('fill', colorValues[s])
							// .style('opacity', 0.9)
							// .style('border', '0px solid black')
							.on('mouseleave', (a, b, c) => {
								this.ChartRef.__toolTip.css('display', 'none');
							})
							.on('mousemove', (a, b, c) => {
								let seriesID = c[0].getAttribute('seriesId');
								let index = c[0].getAttribute('index');

								var tooltipText = this.ChartRef.getTooltipTextHorizontalPlot(index, seriesID);
								this.ChartRef.__toolTip.html(tooltipText);
								this.ChartRef.__toolTip.css('position', 'absolute');

								this.ChartRef.__toolTip.css('background-color', '#585656');
								this.ChartRef.__toolTip.css('padding', '5px');
								this.ChartRef.__toolTip.css('border-radius', '3px');
								this.ChartRef.__toolTip.css('left', 0);
								this.ChartRef.__toolTip.css('top', 0);
								this.ChartRef.__toolTip.css('z-index', 10000); //bring tooltip on front

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

								this.ChartRef.__toolTip.css('left', tooltipX);
								this.ChartRef.__toolTip.css('top', tooltipY);
								this.ChartRef.__toolTip.css('display', 'inherit');

								//Check if tooltip is going beyond right edge
							})
							.on('mousedown', (a, b, c) => {
								//alert('You clicked button:: ' + this.ChartRef.__lastButtonClicked);
								//   let seriesId = c[0].getAttribute("seriesId");
								//   let index=c[0].getAttribute("index");
								//this.ChartRef.triggerSeriesClickEvent(seriesId,index);
							});

						// // Show Value as lable on Bar Series //Parth 05-10-2020
						if (this.ChartRef.DataSeries.get(seriesIds[s]).ShowLabelOnSeries) {
							this.ChartRef.SVGRect
								.append('text')
								.attr('class', 'barlabel')
								.attr('x', function (d) {
									// prath
									let element = document.createElement('canvas');
									let context = element.getContext('2d');
									context.font = '12px Arial';
									let width = context.measureText(stackValues[s].toString().trim()).width;


									if (!isNaN(xPos + (barWidth - width) / 2)) {
										return xPos + (barWidth - width) / 2;
									}

								})
								.attr('y', function (d) {
									if (!isNaN(yPos - 20)) {
										return yPos - 20;
									}

								})
								.style('fill', colorValues[s])
								.attr('dy', '.75em')
								.text(function (d) {
									return stackValues[s];
								});
						}

						// // Show lables on Bar //Parth 26-07-2021

						if (s == stackValues.length - 1 && this.ChartRef.ShowCustomComments) {


							if (isNaN(xPos + barWidth / 2) || isNaN(this.ChartRef.__chartRect.height - 20)) {

							}
							else {

								this.ChartRef.SVGRect
									//.append("g")
									//.attr("transform", "translate(" + (xPos + barWidth / 2) + "," + (yPos - 25) + ")")
									.append('text')
									.style('background-color', 'green')
									.attr('class', 'axis-title')
									//.style("fill", "blue")
									.attr('dy', '.75em')
									.attr(
										'transform',
										//										'translate(' + (xPos + barWidth / 2) + ',' + (yPos - 25) + ') rotate(-90)'
										'translate(' + (xPos + barWidth / 2) + ',' + (this.ChartRef.__chartRect.height - 20) + ') rotate(-90)'
									)
									.text(function (d) {
										return customLabels[i];
									});

							}

						}
					}
					////********************************* */
				}
			}
		} catch (error) { }
	};

	redrawDateTime = () => {
		try {
			//Remove existing data
			let xValues = new Array<Date>();
			let customLabels = new Array<string>();
			for (let key of this.ChartRef.DataSeries.keys()) {
				let objSeries: DataSeries = this.ChartRef.DataSeries.get(key);

				if (objSeries.Type == dataSeriesType.Bar) {
					try {
						$('.' + objSeries.Id).remove();
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
							customLabels.push(objData.label);
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
										if (objData.color.trim() != '') {
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

						//prath 18-12-2020 for Costing chart -ve value not ploting
						if (height < 0) {
							height = height * -1;
						}
						//

						//after calculating height, put the bar at 0
						yPos = objVerticalAxisScaleRef(0);

						if (s > 0) {
							yPos = prevYpos - height;
						}

						prevYpos = yPos;
						prevHeight = height;
					} else {
						yPos = objVerticalAxisScaleRef(stackValues[s]);

						////  Changed by prath 17-12-2020 for invert y axies
						////Nitin

						// if (objVerticalAxis.Inverted) {
						//   height = objVerticalAxisScaleRef(0) - yPos;
						// } else {
						//   if (objVerticalAxis.IsDateTime) {
						//     let objAxisRange: AxisDateRange = objVerticalAxis.getAxisRange();
						//     height = yPos - objVerticalAxisScaleRef(0);
						//   } else {
						//     let objAxisRange: AxisRange = objVerticalAxis.getAxisRange();
						//     height = yPos - objVerticalAxisScaleRef(0);
						//   }
						// }

						//Prath
						if (objVerticalAxis.Inverted) {
							let objAxisRange: AxisRange = objVerticalAxis.getAxisRange();
							height = yPos - objVerticalAxisScaleRef(0);
						} else {
							if (objVerticalAxis.IsDateTime) {
								let objAxisRange: AxisDateRange = objVerticalAxis.getAxisRange();
								height = yPos - objVerticalAxisScaleRef(0);
							} else {
								height = objVerticalAxisScaleRef(0) - yPos;
							}
						}

						////==================================================
						if (s > 0) {
							yPos = prevYpos - height;
						}

						prevYpos = yPos;
						prevHeight = height;
					}

					if (barWidth > 50) {
						barWidth = 50;
					}

					let xPos: number = barWidth * objHorizontalAxisScaleRef(lx) / objHorizontalAxisScaleRef.bandwidth();

					xPos = objHorizontalAxisScaleRef(lx) + objHorizontalAxisScaleRef.bandwidth() / 2 - barWidth / 2;

					this.ChartRef.SVGRect
						.append('g')
						.attr('class', seriesIds[s])
						.attr('id', seriesIds[s] + '--' + s.toString())
						.append('rect')
						.attr('id', seriesIds[s] + '--' + i.toString())
						.attr('seriesId', seriesIds[s])
						.attr('index', i)
						.attr('x', xPos)
						.attr('y', yPos)
						.attr('width', barWidth)
						.attr('height', height)
						.style('fill', colorValues[s])
						.style('opacity', 0.9)
						.style('border', '0px solid black')
						.on('mouseleave', (a, b, c) => {
							this.ChartRef.__toolTip.css('display', 'none');
						})
						.on('mousemove', (a, b, c) => {
							let seriesID = c[0].getAttribute('seriesId');
							let index = c[0].getAttribute('index');

							var tooltipText = this.ChartRef.getTooltipTextHorizontalPlot(index, seriesID);
							this.ChartRef.__toolTip.html(tooltipText);
							this.ChartRef.__toolTip.css('position', 'absolute');

							this.ChartRef.__toolTip.css('background-color', '#585656');
							this.ChartRef.__toolTip.css('padding', '5px');
							this.ChartRef.__toolTip.css('border-radius', '3px');
							this.ChartRef.__toolTip.css('left', 0);
							this.ChartRef.__toolTip.css('top', 0);
							this.ChartRef.__toolTip.css('opacity', 0.7); //add prath  26-08-2021
							this.ChartRef.__toolTip.css('z-index', 10000); //add prath 26-08-2021

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

							this.ChartRef.__toolTip.css('left', tooltipX);
							this.ChartRef.__toolTip.css('top', tooltipY);
							this.ChartRef.__toolTip.css('display', 'inherit');

							//Check if tooltip is going beyond right edge
						})
						.on('mousedown', (a, b, c) => {
							//alert('You clicked button:: ' + this.ChartRef.__lastButtonClicked);
							//   let seriesId = c[0].getAttribute("seriesId");
							//   let index=c[0].getAttribute("index");
							//this.ChartRef.triggerSeriesClickEvent(seriesId,index);
						});




					// // Show lables on Bar //Parth 26-07-2021
					debugger;
					if (s == stackValues.length - 1 && this.ChartRef.ShowCustomComments) {


						if (isNaN(xPos + barWidth / 2) || isNaN(this.ChartRef.__chartRect.height - 20)) {

						}
						else {

							this.ChartRef.SVGRect
								//.append("g")
								//.attr("transform", "translate(" + (xPos + barWidth / 2) + "," + (yPos - 25) + ")")
								.append('text')
								.style('background-color', 'green')
								.attr('class', 'axis-title')
								//.style("fill", "blue")
								.attr('dy', '.75em')
								.attr(
									'transform',
									//										'translate(' + (xPos + barWidth / 2) + ',' + (yPos - 25) + ') rotate(-90)'
									'translate(' + (xPos + barWidth / 2) + ',' + (this.ChartRef.__chartRect.height - 20) + ') rotate(-90)'
								)
								.text(function (d) {
									return customLabels[i];
								});

						}

					}
				}
			}
		} catch (error) { }
	};

	isBarClicked = (x: number, y: number) => {
		try {
			let allbars = d3.selectAll('rect');
		} catch (error) { }
	};
}
