using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager.KPI
{
    public class customTagTreeNode
    {
        public enum customTagTreeNodeType
        {
            Master = 999,
            Category = 0,
            SubCategory = 1,
            Activity = 2
        }
        public string id = "";
        public string text = "";
        public string imageUrl = "../../Images/Well.ico";
        public bool expanded = true;

        public List<customTagTreeNode> items = new List<customTagTreeNode>();

        public string nodeID = "";
        public string CategoryID = "";
        public string SubCategoryID = "";
        public string ActivityID = "";
        public customTagTreeNodeType NodeType = customTagTreeNodeType.Category;

        public clsCustomTagCategory objCustomTag = new clsCustomTagCategory();
        public clsCustomTagSubCategory objSubCategory = new clsCustomTagSubCategory();
        public clsCustomTagActivity objActivity = new clsCustomTagActivity();

        

    }
}
