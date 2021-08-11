using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.Toolface
{
    public class DrillingWindowInfo
    {

        public double fromMD { get; set; } = 0;
        public double toMD { get; set; } = 0;
        public double fromTVD { get; set; } = 0;
        public double toTVD { get; set; } = 0;
        public double fromTopWindow { get; set; } = 0;
        public double toTopWindow { get; set; } = 0;
        public double fromBottomWindow { get; set; } = 0;
        public double toBottomWindow { get; set; } = 0;
               
    }
}
