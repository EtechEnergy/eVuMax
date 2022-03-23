using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.AdvKPI;

namespace eVuMax.DataBroker.AdvKPI_
{
    class AdvKPISettings
    {
        //objProcessor.FilterData = chkFilterData.Checked
        // objProcessor.FilterMainWellID = comboData.getComboStrValue(cmbMainWell)
        // objProcessor.FilterType = comboData.getComboValue(cmbFilterType)

        // objProcessor.Filter_FromDate = dtFromDate.Value.ToUniversalTime

        // objProcessor.Filter_ToDate = dtToDate.Value.ToUniversalTime

        // objProcessor.Filter_FromDepth = txtFromDepth.Value

        // objProcessor.Filter_ToDepth = txtToDepth.Value

        // objProcessor.Filter_LastHours = txtHours.Value


        public bool FilterData = false;
        public string FilterMainWellID = "";
        public KPIProcessor.kpiFilterType FilterType = KPIProcessor.kpiFilterType.LastHours;
        public DateTime Filter_FromDate = new DateTime();
        public DateTime Filter_ToDate = new DateTime();
        public double Filter_FromDepth = 0;
        public double Filter_ToDepth = 0;
        public double Filter_LastHours =24;





    }
}
