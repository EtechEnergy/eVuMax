using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Broomstick.Document.BroomstickDocument
{
    public class TDPointProp
    {

        public int RigState = 0;
        public string RigStateName = "";
        public string Color = ColorTranslator.ToHtml(System.Drawing.Color.Black);
        public int GroupFunction = 0;

        public TDPointProp getCopy()
        {
            try
            {
                var objNew = new TDPointProp();
                objNew.RigState = RigState;
                objNew.RigStateName = RigStateName;
                objNew.Color = Color;
                objNew.GroupFunction = GroupFunction;
                return objNew;
            }
            catch (Exception ex)
            {
                return new TDPointProp();
            }
        }
    }
}
