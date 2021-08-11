import {mudLogLithology} from "./mudLogLithology";
export class mudLogInterval {
  IntervalID: string = "";
  mdTop: number = 0;
  mdBottom: number = 0;
  tvdTop: number = 0;
  tvdBottom: number = 0;
  InterpretedLithology: string = "";
  Description: string = "";
  lithologies: mudLogLithology[] = [];

}
