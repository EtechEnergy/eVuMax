import * as Chart from '../Chart/Chart';

export class ChartData {
	x: number;
	y: number;
	z: number;
	datetime: Date;
	color: string = '';
	label: string = '';
	labelX: string = ''; //added by prath to show STRING lables on Stackbar for X (Drilling Summary)
	labelY: string = ''; //added by prath to show STRING lables on Stackbar for Y (Drilling Summary)

	//External References
	Chart: Chart.Chart;
	ScaleRef: any;
	//Canvas/ Svg Pixel Position
	xPixel: number;
	yPixel: number;


}
