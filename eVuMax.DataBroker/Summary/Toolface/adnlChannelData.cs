using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;

namespace eVuMax.DataBroker.Summary.Toolface
{
    public class adnlChannelData
    {
        public string Mnemonic { get; set; } = "";
        public DataTable Data { get; set; }
    }
}
