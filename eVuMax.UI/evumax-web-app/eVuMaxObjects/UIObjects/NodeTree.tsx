export enum enumNodeType{
    "none" = 0,
    "wells"= 1,
    "well" = 2,
    "wellbores" = 3,
    "wellbore" = 4,
    "timeLogs" = 5,
    "timeLog" = 6,
    "depthLogs"= 7,
    "depthLog"= 8,
    "channels" = 9,
    "mudLogs" = 10,
    "mudLog" = 11,
    "trajectories" = 12,
    "trajectory"= 13
}

export class eVuMaxTreeNode  {
    id: string = "";
    text: string = "";
    wellID: string= "";
    wellboreID: string ="";
    logID: string="";
    nodeType: enumNodeType = enumNodeType.none;
    imageUrl: string  ="../../Images/Well.ico";
    expanded?: boolean = true;
    items?: eVuMaxTreeNode[] =[];


}