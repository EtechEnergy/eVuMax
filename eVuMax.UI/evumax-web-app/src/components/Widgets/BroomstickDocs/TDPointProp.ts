export class TDPointProp
    {

        public  RigState :number = -1;
        public  RigStateName:string = "";
        public  Color:string = "black";
        public  GroupFunction:number = 0;

        public  getCopy():TDPointProp {
        
            try
            {
                var objNew = new TDPointProp();
                objNew.RigState = this.RigState;
                objNew.RigStateName = this.RigStateName;
                objNew.Color = this.Color;
                objNew.GroupFunction = this.GroupFunction;
                return objNew;
            }
            catch (ex /*Exception*/)
            {
                return new TDPointProp();
            }
        }
    }