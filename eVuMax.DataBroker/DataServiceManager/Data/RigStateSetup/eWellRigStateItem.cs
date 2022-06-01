using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.DataServiceManager 
{
    public class eWellRigStateItem
    {
        
        public float Number = 0;
        public string Name = "";
        public string Color = "Black";

        public eWellRigStateItem getCopy()
        {
            try
            {
                eWellRigStateItem objNew = new eWellRigStateItem();
                objNew.Number = Number;
                objNew.Name = Name;
                objNew.Color = Color;
                return objNew;

            }
            catch (Exception ex)
            {
                return new eWellRigStateItem();
                
            }
        }

    }
}
