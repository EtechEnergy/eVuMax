using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;

namespace eVuMax.DataBroker.Summary.Toolface
{
    public class ToolfaceSettings
    {

        public const string SettingsId = "ToolfaceSummary";

        public bool ShowFormationTops { get; set; } = false;
        public bool GTFVector { get; set; } = false;
        public bool MTFVector { get; set; } = false;
        public bool FilterByMinSlideLength { get; set; } = false;
        public float MinSlideLength { get; set; } = 3;
        public float MinRotationFootage { get; set; } = 3;
        public bool FilterGTFMTF { get; set; } = true;
        public bool ShowDrillingWindow { get; set; } = false;
        public DataTable GeoDrlgWindowData { get; set; } = new DataTable();
        public string GeoDrlgWindowColor { get; set; } = "";
        public float GeoDrlgWindowTrans { get; set; } = 50;
        public bool ShowROPDrillingWindow { get; set; } = false;
        public DataTable ROPDrlgWindowData { get; set; } = new DataTable();
        public string ROPDrlgWindowColor { get; set; } = "";
        public float ROPDrlgWindowTrans { get; set; } = 50;
        public bool convertScale { get; set; } = false;
        public string HighlightColor { get; set; } = "";
        public float HighlightTrans { get; set; } = 80;
        public int Direction { get; set; } = 0;

        //Customization of toolface channels
        public ToolfaceChannel GTF { get; set; } = new ToolfaceChannel("GTF");
        public ToolfaceChannel MY { get; set; } = new ToolfaceChannel("MY");
        public ToolfaceChannel MTF { get; set; } = new ToolfaceChannel("MTF");
        public ToolfaceChannel PlanDLS { get; set; } = new ToolfaceChannel("PlanDLS");
        public ToolfaceChannel ActualDLS { get; set; } = new ToolfaceChannel("ActualDLS");
        public ToolfaceChannel PlanTVD { get; set; } = new ToolfaceChannel("PlanTVD");
        public ToolfaceChannel ActualTVD { get; set; } = new ToolfaceChannel("ActualTVD");


        public List<ToolfaceChannel> adnlChannels { get; set; } = new List<ToolfaceChannel>();

    }
}
