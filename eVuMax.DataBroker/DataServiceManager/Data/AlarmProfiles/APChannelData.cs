using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VuMaxDR.Data;
using VuMaxDR.Data.Objects;

namespace eVuMax.DataBroker.DataServiceManager
{
    public class APChannelData
    {
        // load channel list  from DB
       public DataTable stdChannelList = new DataTable();

        // load std channel list  from DB
        public DataTable channelList = new DataTable();

        // load alarm types from DB
        public DataTable alarmTypeList = new DataTable();

        // load alarm category2 from DB
        public DataTable alarmCategory2List = new DataTable();

        // load all rig states from DB
        public DataTable RigStatesList = new DataTable();

        // load well status  from DB
        public DataTable WellStatusList = new DataTable();


        public enum logType
        {
            TimeLog = 1,
            DepthLog = 2,
            Trajectory = 3,
        }


        public void getComboData(int pLogType, bool isStdChannel, DataService objDataService)
        {
            try
            {


                if ((int)logType.TimeLog == pLogType)
                {
                    if (isStdChannel)
                    {
                        stdChannelList = objDataService.getTable("SELECT Mnemonic id, Mnemonic text  FROM VMX_CURVE_DICTIONARY WHERE LOG_TYPE=1 AND USER_VISIBLE=1 ORDER BY MNEMONIC");

                    }
                    else
                    {
                        channelList = objDataService.getTable("SELECT DISTINCT(Mnemonic) id,CHANNEL_NAME text FROM VMX_TIME_LOG_COLUMNS ORDER BY CHANNEL_NAME");
                    }

                }



                if ((int)logType.DepthLog == pLogType)
                {
                    if (isStdChannel)
                    {
                        stdChannelList = objDataService.getTable("SELECT Mnemonic id,  Mnemonic text FROM VMX_CURVE_DICTIONARY WHERE LOG_TYPE=2 AND USER_VISIBLE=1 ORDER BY MNEMONIC");

                    }
                    else
                    {
                        channelList = objDataService.getTable("SELECT DISTINCT(Mnemonic) id,Channel_Name text FROM VMX_DEPTH_LOG_COLUMNS ORDER BY CHANNEL_NAME");
                    }

                }
                alarmTypeList = objDataService.getTable("SELECT ALARM_TYPE_ID id,ALARM_TYPE_NAME text FROM VMX_ALARM_TYPE ORDER BY ALARM_TYPE_NAME");

                alarmCategory2List = objDataService.getTable("SELECT ALARM_CATEGORY_ID id, ALARM_CATEGORY_NAME text FROM VMX_ALARM_CATEGORY ORDER BY ALARM_CATEGORY_NAME");


                string WellID = "";
                rigState objRigState = rigState.loadWellRigStateSetup(ref objDataService, WellID);

                if (objRigState is null)
                {
                    objRigState = rigState.loadCommonRigStateSetup(ref objDataService);
                }

                if (objRigState != null)
                {

                    RigStatesList.Columns.Add(new DataColumn("Name", typeof(System.String)));
                    RigStatesList.Columns.Add(new DataColumn("Number", typeof(System.Decimal)));

                    foreach (rigStateItem objState in objRigState.rigStates.Values)
                    {
                        DataRow row = RigStatesList.NewRow();
                        row["Name"] = objState.Name;
                        row["Number"] = objState.Number;
                        RigStatesList.Rows.Add(row);
                    }


                }

                WellStatusList = objDataService.getTable("SELECT WELL_STATUS FROM VMX_WELL_STATUS ORDER BY WELL_STATUS");

                //WellStatusList

                //return this;
                //return new APChannelData();
            }
            catch (Exception ex)
            {
                //  return new APChannelData();
                throw;
            }
        }

    }
}
