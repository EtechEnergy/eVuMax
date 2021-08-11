import * as Chart from '../Chart/Chart';

export class ChartData {
	x: number;
	y: number;
	z: number;
	datetime: Date;
	color: string = '';
	label: string = '';

	//External References
	Chart: Chart.Chart;
	ScaleRef: any;
	//Canvas/ Svg Pixel Position
	xPixel: number;
	yPixel: number;


}
