using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DataServiceManager.Setup.RigState
{
    public class eRigStateItem
    {
        
        public float Number = 0;
        public string Name = "";
        public string Color = "Black";

        public eRigStateItem getCopy()
        {
            try
            {
                eRigStateItem objNew = new eRigStateItem();
                objNew.Number = Number;
                objNew.Name = Name;
                objNew.Color = Color;
                return objNew;

            }
            catch (Exception ex)
            {
                return new eRigStateItem();
                
            }
        }

    }
}
