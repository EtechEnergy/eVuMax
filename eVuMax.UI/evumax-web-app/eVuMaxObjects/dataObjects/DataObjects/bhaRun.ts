﻿export class bhaRun {
  ObjectID: string = "";
  WellID: string = "";
  WellboreID: string = "";
  Name: string = "";
  dTimStart: string = "";
  dTimStop: string = "";
  BitRunNo: number = 0;
  StringRunNo: number = 0;
  ReasonTrip: string = "";
  ObjectiveBHA: string = "";
  mdHoleStart: number = 0;
  mdHoleStop: number = 0;
  hkldRot: number = 0;
  slackOff: number = 0;
  hkldDn: number = 0;
  tqOnBotAvg: number = 0;
  tqOffBotAvg: number = 0;
  rpmAvg: number = 0;
  rpmMx: number = 0;
  rpmMin: number = 0;
  wobAvg: number = 0;
  wobMx: number = 0;
  wobMn: number = 0;
  ServerKey: string = "";
  wmlsurl: string = "";
  wmlpurl: string = "";
  lastDataReceived: Date = new Date();
  lastRestartStarted: Date = new Date();
  Description: string = "";
}