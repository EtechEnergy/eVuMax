import * as Chart from "../Chart/Chart";
import { ChartData } from "./ChartData";

export enum dataSeriesType {
  Point = 0,
  Line = 1,
  HorizontalLine = 2,
  Area = 3,
  HorizontalArea = 4,
  Bar = 5,
  HorizontalBar = 6,
  Pie = 7, //prath 01-10-2020
}

// export enum pointStyle {
//   Circle = 0,
//   Rectangle = 1,
//   Diamond = 2,
//   Star = 3,
//   Triangle = 4,
//   DownTriangle = 5,
//   LeftTriangle = 6,
//   RightTriangle = 7,
// }

//as per vumax
export enum pointStyle {
  Rectangle = 0,  //old 1
  Circle = 1,//old 0
  Triangle = 2, //old=4,
  DownTriangle = 3, //old=5,

  Diamond = 7,//old=2,
  Star = 6,//old=3,


  LeftTriangle = 10,//old=6,
  RightTriangle = 11,//old=7,
}



export class DataSeries {
  Id: string = "";
  Name: string = "";
  Type: dataSeriesType = dataSeriesType.Point;
  Visible: boolean = true;
  DisplayOrder: number = 0;
  Data: ChartData[] = [];
  XAxisId: string = "";
  YAxisId: string = "";
  ShowInLegend: boolean = true;
  Title: string = "";
  Color: string = "black";
  //PointStyle: pointStyle = pointStyle.Circle;
  PointStyle: pointStyle = pointStyle.DownTriangle;
  PointHeight: number = 5;
  PointWidth: number = 5;
  PointSize: number = 2; //for point series point Size

  PointBorderColor: string = "";
  PointBorderStyle: Chart.lineStyle = Chart.lineStyle.solid;
  LineStyle: Chart.lineStyle = Chart.lineStyle.solid;
  CurveStyle: Chart.curveStyle = Chart.curveStyle.smooth;

  LineWidth: number = 1;
  UseIndividualColor: boolean = false;
  Stacked: boolean = false;
  Tag: string = ""; //General purpose tag
  ColorEach: boolean = false;
  IsDateTime: boolean = false;

  ShowLabelOnSeries: boolean = false; //prath 05-10-2020

  PieRadius: number = 50;

  //showPointsOnLineSeries: boolean = false;



  ShowRoadMap: boolean = false; //prath
  RoadMapTransparency: number = 20;//prath
  RoadMapColor: string = ""; //prath
  RMColor: string = ""; //prath
  RoadmapDepth: [];//prath
  RoadmapMax: [];//prath
  RoadmapMin: [];//prath

  ShowPointsOnLineSeries: boolean = false;
  //StepLine: boolean = false;

  //#region Min/Max Methods

  getMaxX = (): number => {
    let maxValue =Number.NEGATIVE_INFINITY;// Number.MIN_VALUE;
  
    for(let i=0;i<this.Data.length;i++){
        if(this.Data[i].x>maxValue){
        maxValue = this.Data[i].x;
       }
    }
    return maxValue;
    
    //Below Code is Original by Nitin
    return Math.max.apply(
      Math,
      this.Data.map(function (o) {
        return o.x;
      })
    );
  };






 public getMinX = (): number => {

    let minValue = Number.MAX_VALUE;
  
    for(let i=0;i<this.Data.length;i++){
        if(this.Data[i].x<minValue){
          minValue = this.Data[i].x;
       }
    }
    return minValue;
    //Below Code is Original by Nitin
    return Math.min.apply(
      Math,
      this.Data.map(function (o) {
        return o.x;
      })
    );
  };

  public getMaxY = (): number => {
    let maxValue =Number.NEGATIVE_INFINITY;// Number.MIN_VALUE;
  
    for(let i=0;i<this.Data.length;i++){
        if(this.Data[i].y>maxValue){
        maxValue = this.Data[i].y;
       }
    }
    return maxValue;
   
    //Below Code is Original by Nitin
    return Math.max.apply(
      Math,
      this.Data.map(function (o) {
        return o.y;
      })
    );

  };






  getMinY = (): number => {
    let minValue = Number.MAX_VALUE;
  
    for(let i=0;i<this.Data.length;i++){
        if(this.Data[i].y<minValue){
          minValue = this.Data[i].y;
       }
    }
    return minValue;
    //Below Code is Original by Nitin

    return Math.min.apply(
      Math,
      this.Data.map(function (o) {
        return o.y;
      })
    );
  };

  getMaxZ = (): number => {
    
    let maxValue = Number.NEGATIVE_INFINITY;//Number.MIN_VALUE;
  
    for(let i=0;i<this.Data.length;i++){
        if(this.Data[i].z>maxValue){
        maxValue = this.Data[i].z;
       }
    }
    return maxValue;
    
    //Below Code is Original by Nitin

    
    return Math.max.apply(
      Math,
      this.Data.map(function (o) {
        return o.z;
      })
    );
  };

  getMinZ = (): number => {
    
    let minValue = Number.MAX_VALUE;
  
    for(let i=0;i<this.Data.length;i++){
        if(this.Data[i].z<minValue){
          minValue = this.Data[i].z;
       }
    }
    return minValue;
    //Below Code is Original by Nitin
    return Math.min.apply(
      Math,
      this.Data.map(function (o) {
        return o.z;
      })
    );
  };

  getMaxDate = (): Date => {
    if (this.Data.length > 0) {
      return this.Data.reduce(function (a, b) {
        return a.datetime > b.datetime ? a : b;
      }).datetime;
    } else {
      return null;
    }
  };

  getMinDate = (): Date => {
    if (this.Data.length > 0) {
      return this.Data.reduce(function (a, b) {
        return a.datetime < b.datetime ? a : b;
      }).datetime;
    } else {
      return null;
    }
  };

  //#endregion
}
