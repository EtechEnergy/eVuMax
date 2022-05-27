
using eVuMax.DataBroker.Broker;
using eVuMax.DataBroker.DataServiceManager.Setup;
using System;

namespace eVuMax.DataBroker.DataServiceManager
{
    public class DataServiceBroker : IBroker
    {
        BrokerResponse IBroker.getData(BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Broker == Global.Brk_Setup_CommonSetting)
                {
                    CommonSettingsMgr objMgr = new CommonSettingsMgr();
                    return objMgr.getData(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_QCRules)
                {
                    QCRulesMgr objQCRulesMgr = new QCRulesMgr();
                    return objQCRulesMgr.getData(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_CommonRigStateSetup)
                {
                    RigStateSetupMgr objRigStateSetup = new RigStateSetupMgr();
                    return objRigStateSetup.getData(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_RigSpecificRigStateSetup)
                {
                    RigStateSetupMgr objRigStateSetup = new RigStateSetupMgr();
                    return objRigStateSetup.getData(paramRequest);
                }

                
               if (paramRequest.Broker == Global.Brk_Setup_Units)
                {
                    UnitsMgr objUnitMgr = new UnitsMgr();
                    return objUnitMgr.getData(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_AlertSettings)
                {
                    AlertSettingsMgr objAlertSettingsMgr = new AlertSettingsMgr();
                    return objAlertSettingsMgr.getData(paramRequest);
                }


                if (paramRequest.Broker== Global.Brk_Setup_MaintainStdChannels)
                {
                    MaintainStdChannelsMgr objMaintainStdChannelsMgr = new MaintainStdChannelsMgr();
                    return objMaintainStdChannelsMgr.getData(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_EmailSettings)
                {
                    EmailSettingsMgr objEmailSettingsMgr = new EmailSettingsMgr();
                    return objEmailSettingsMgr.getData(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_DownloadAuditInfo)
                {
                    DownloadAuditInfoMgr objDownloadAuditInfoMgr = new DownloadAuditInfoMgr();
                    return objDownloadAuditInfoMgr.getData(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_AuditInfo)
                {
                    AuditInfoMgr objAuditInfoMgr = new AuditInfoMgr();
                    return objAuditInfoMgr.getData(paramRequest);
                }


                if (paramRequest.Broker == Global.Brk_Setup_ChannelLibrary)
                {
                    ChannelLibraryMgr objChannelLibraryMgr = new ChannelLibraryMgr();
                    return objChannelLibraryMgr.getData(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_WellMonitor)
                {
                    WellMonitorMgr objWellMonitorMgr = new WellMonitorMgr();
                    return objWellMonitorMgr.getData(paramRequest);
                }



                #region Data
                if (paramRequest.Broker == Global.Brk_Data_SetupAlarms)
                {
                    SetupAlarmsMgr objSetupAlarmsMgr = new SetupAlarmsMgr();
                    return objSetupAlarmsMgr.getData(paramRequest);
                }
                #endregion

                BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
                return objResponse;

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }

        }

        BrokerResponse IBroker.performTask(BrokerRequest paramRequest)
        {
            try
            {

                if (paramRequest.Broker == Global.Brk_Setup_CommonSetting)
                {
                    CommonSettingsMgr objMgr = new CommonSettingsMgr();
                    return objMgr.performTask(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_QCRules)
                {
                    QCRulesMgr objQCRulesMgr = new QCRulesMgr();
                    return objQCRulesMgr.performTask(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_CommonRigStateSetup)
                {
                    RigStateSetupMgr objMgr = new RigStateSetupMgr();
                    return objMgr.performTask(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_RigSpecificRigStateSetup)
                {
                    RigStateSetupMgr objMgr = new RigStateSetupMgr();
                    return objMgr.performTask(paramRequest);
                }


                if (paramRequest.Broker == Global.Brk_Setup_Units)
                {
                    UnitsMgr objUnitMgr = new UnitsMgr();
                    return objUnitMgr.performTask(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_AlertSettings)
                {
                    AlertSettingsMgr objAlertSettingsMgr = new AlertSettingsMgr();
                    return objAlertSettingsMgr.performTask(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_MaintainStdChannels)
                {
                    MaintainStdChannelsMgr objMaintainStdChannelsMgr = new MaintainStdChannelsMgr();
                    return objMaintainStdChannelsMgr.performTask(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_EmailSettings)
                {
                    EmailSettingsMgr objEmailSettingsMgr = new EmailSettingsMgr();
                    return objEmailSettingsMgr.performTask(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_ChannelLibrary)
                {
                    ChannelLibraryMgr objChannelLibraryMgr = new ChannelLibraryMgr();
                    return objChannelLibraryMgr.performTask(paramRequest);
                }

                if (paramRequest.Broker == Global.Brk_Setup_WellMonitor)
                {
                    WellMonitorMgr objWellMonitorMgr = new WellMonitorMgr();
                    return objWellMonitorMgr.performTask(paramRequest);
                }




                #region Data
                if (paramRequest.Broker == Global.Brk_Data_SetupAlarms)
                {
                    SetupAlarmsMgr objSetupAlarmsMgr = new SetupAlarmsMgr();
                    return objSetupAlarmsMgr.performTask(paramRequest);
                }
                #endregion
                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.RequestSuccessfull = false;
                objResponse.Errors = "Invalid request Broker header. Please use proper header in the Broker request";
                return objResponse;

            }
            catch (Exception ex)
            {

                Broker.BrokerResponse objResponse = paramRequest.createResponseObject();
                objResponse.Response = ex.Message + ex.StackTrace;
                return objResponse;

            }
        }
    }
}
