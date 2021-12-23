import { ImageLogChannels } from "./ImageLogChannels";
export class ImageLogDataSet {
  public DataSetID: string = "";
  public DataSetName: string = "";
  public StartColor: any = "#f8f8ff"; //White
  public MiddleColor: any = "#f8f8ff";
  public EndColor: any = "#f8f8ff";
  //public channels: Map<string, ImageLogChannels> = new Map<string, ImageLogChannels>();
  public channels: ImageLogChannels[] =[]
}
