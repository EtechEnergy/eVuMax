using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eVuMax.DataBroker.Summary.Toolface
{
    public class ToolfaceChannel
    {

        public bool visible { get; set; } = true;
        public string Mnemonic { get; set; } = "";
        public string dataMnemonic { get; set; } = "";
        public int lineStyle { get; set; } = 0;
        public int lineWidth { get; set; } = 2;
        public String lineColor { get; set; } = "";

       public ToolfaceChannel(string pMnemonic) {
            this.Mnemonic = pMnemonic;
        }
        

    }
}
