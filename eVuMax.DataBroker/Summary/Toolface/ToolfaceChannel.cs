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
            //Nishant 06-09-2021
            //Random Random_ = new Random();
            this.Mnemonic = pMnemonic;
            //this.lineColor = String.Format("#{0:X6}", Random_.Next(0x1000000));
            this.lineColor = "";
        }

        public ToolfaceChannel()
        {
            //Nishant 06-09-2021
            Random Random_ = new Random();
            this.lineColor = String.Format("#{0:X6}", Random_.Next(0x1000000));
        }


    }
}
