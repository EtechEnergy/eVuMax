import { clsCustomTagCategory } from "../CustomTagMaster/clsCustomTagCategory";
import { clsCustomTagSubCategory } from "../CustomTagMaster/clsCustomTagSubCategory";
import { clsCustomTagActivity } from "../CustomTagMaster/clsCustomTagActivity";
export enum enumCustomTagTreeNodeType {
    Master = 999,
    Category = 0,
    SubCategory = 1,
    Activity = 2,
}

export class customTagTreeNode {
    id: string = "";
    text: string = "";
    imageUrl: string = "../../Images/Well.ico";
    expanded?: boolean = true;
    items?: customTagTreeNode[] = [];

    nodeID: string = "";
  
    CategoryID : string = "";
    SubCategoryID : string = "";
    ActivityID : string = "";

    nodeType:enumCustomTagTreeNodeType  = enumCustomTagTreeNodeType.Master;

    objCustomTag: clsCustomTagCategory =new clsCustomTagCategory();
    objSubCategory:clsCustomTagSubCategory= new clsCustomTagSubCategory();
    objActivity:clsCustomTagActivity= new clsCustomTagActivity();

}
