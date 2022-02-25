   import { BroomStickSetup_ } from "./BroomStickSetup_";
import { TimeFilter } from "./TimeFilter";
   // BroomStickSetup objSetup = new BroomStickSetup(),
   export enum enumDocType_
    {
        BoomStickDocument =1,
        BroomStickTorqueDocument=2,
        HookloadDocument = 3,
        TorqueDocument=4,
        CombinedBroomStickDocument =5,
        CombineBroomStickTorqueDocument =6
    }
    export  class BroomStickDocsUserSetting{
     public   DocID :string= "";
        //  enumDocType_ DocType = enumDocType_.BoomStickDocument;
       
        public UserID :string = "";
         public WellID :string = "";
          public objBroomstick = new BroomStickSetup_();
          public objTimeFilter = new TimeFilter();
         public warning :string = "";
    }
     