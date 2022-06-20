using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using VuMaxDR.Data.Objects;
using VuMaxDR.Common;
using VuMaxDR.Data;

namespace eVuMax.DataBroker.DataServiceManager.Data.AlarmProfiles
{


    public enum apTriggerType
    {
        Instant = 0,
        AccumulatedData = 1
    }

    public enum apSourceType
    {
        TimeLog = 0,
        DepthLog = 1,
        Trajectory = 2
    }

    public enum enumDownSampleFunction
    {
        LastValue = 0,
        AvgValue = 1,
        MinValue = 2,
        MaxValue = 3,
        FirstValue = 4
    }

    public class APChannel
    {

        public int SourceType;
        public string AlarmType;
        public string AlarmTypeName;
        public string AlarmCategory2ID;
        public string AlarmCategory2Name;
        public int AlarmShape;
        public double ShapeColor;
        public int ShapeSize;
        public int AlarmCategory;
        public string ActiveTrajectoryID;
        public string PlannedTrajectoryID;
        public double Frequency;
        public string RemarksTableName;
        public double AckTimeLimit;
        public bool SendMail;
        public string MailTo;
        public Dictionary<string, DateTime> alarmContainerDates;
        public string alarmContainerID;
        public bool __doPause;
        public Dictionary<string, double> __functionCache;
        public string channelList;
        public string ExpLog;
        public enumDownSampleFunction DownSampleFunction;
        public string TimeLogTableName;
        public double AlarmDepth;
        public Dictionary<int, AlarmHistoryItem> history;
        public bool hasErrors;
        public DateTime AlarmDateTime;
        public string Mnemonic;
        public string ChannelName;
        public string RedExpression;
        public int currentState;
        public double channelValue;
        public int LastState;
        public DateTime LastStateTime;
        public DateTime LastDataTime;
        public string RigStates;
        public bool RigStateSelection;
        public string YellowExpression;
        public int TimeDuration;
        public int TriggerType;
        public string WellStatus;
        public object parent;
        public string RedConditions;
        public bool RedUseBuilder;
        public bool WellStatusSpecific;
        public string YellowConditions;
        public bool YellowUseBuilder;
        public bool PlaySound;
        public bool AckRequired;

        public void getComboData()
        {
            try
            {
                APChannelData objData = new APChannelData();
                //objData.getComboData();

            }
            catch (Exception ex)
            {

                throw;
            }
        }

    }
}
