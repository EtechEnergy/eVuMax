import { SettingValue } from "./SettingValue";

// const LogWITSMLTransactions: string = "LogWITSMLTransactions";
// const LogFolder: string = "LogFolder";
// const DigitSignificance: string = "DigitSignificance";
// const IgnoreNegative: string = "IgnoreNegative";
// const DepthLogFrequency: string = "DepthLogFrequency";
// const TimeLogFrequency: string = "TimeLogFrequency";
// const TrajectoryFrequency: string = "TrajectoryFrequency";
// const MudLogFrequency: string = "MudLogFrequency";
// const DepthOffset: string = "DepthOffset";
// const TimeDataAlarmTime: string = "TimeDataAlarmTime";
// const DepthDataAlarmTime: string = "DepthDataAlarmTime";
// const DataPageSize: string = "DataPageSize";
// const OverlapSize: string = "OverlapSize";
// const TimeZone: string = "TimeZone";
// const PageSize: string = "PageSize";
// const Orientation: string = "Orientation";
// const LeftMargin: string = "LeftMargin";
// const TopMargin: string = "TopMargin";
// const RightMargin: string = "RightMargin";
// const BottomMargin: string = "BottomMargin";
// const OptimizeDisplay: string = "OptimizeDisplay";
// const UseDataPaging: string = "UseDataPaging";
// const DServerIP: string = "DServerIP";
// const DownloadTimeOut: string = "DownloadTimeOut";
// const DownloadChunkSize: string = "DownloadChunkSize";
// const SoundFileRed: string = "SoundFileRed";
// const SoundFileYellow: string = "SoundFileYellow";
// const SoundFileRemarks: string = "SoundFileRemarks";
// const WellCheckEnabled: string = "WellCheckEnabled";
// const AlarmAcknowledgement: string = "AlarmAcknowledgement";
// const DefaultTemplate: string = "DefaultTemplate";
// const ConnValidationTemplate: string = "ConnValidationTemplate";
// const TripConnValidationTemplate: string = "TripConnValidationTemplate";
// const DrlgStandValidationTemplate: string = "DrlgStandValidationTemplate";
// const ChatServerDomain: string = "ChatServerDomain";
// const SupportEmail: string = "SupportEmail";
// const chatResolveSrvRecords: string = "chatResolveSrvRecords";
// const chatHostName: string = "chatHostName";
// const chatPort: string = "chatPort";
// const chatUseSSL: string = "chatUseSSL";
// const ShareBroomstickDouments: string = "ShareBroomstickDouments";
// const WaitTime: string = "WaitTime";
// const CompanyLogo: string = "CompanyLogo";
// const CompanyLogo2: string = "CompanyLogo2";
// const DayTimeFrom: string = "DayTimeFrom";
// const DayTimeTo: string = "DayTimeTo";


export enum enumSettingsIDs {
    LogWITSMLTransactions = "LogWITSMLTransactions",
    LogFolder = "LogFolder",
    DigitSignificance = "DigitSignificance",
    IgnoreNegative = "IgnoreNegative",
    DepthLogFrequency = "DepthLogFrequency",
    TimeLogFrequency = "TimeLogFrequency",
    TrajectoryFrequency = "TrajectoryFrequency",
    MudLogFrequency = "MudLogFrequency",
    DepthOffset = "DepthOffset",
    TimeDataAlarmTime = "TimeDataAlarmTime",
    DepthDataAlarmTime = "DepthDataAlarmTime",
    DataPageSize = "DataPageSize",
    OverlapSize = "OverlapSize",
    TimeZone = "TimeZone",
    PageSize = "PageSize",
    Orientation = "Orientation",
    LeftMargin = "LeftMargin",
    TopMargin = "TopMargin",
    RightMargin = "RightMargin",
    BottomMargin = "BottomMargin",
    OptimizeDisplay = "OptimizeDisplay",
    UseDataPaging = "UseDataPaging",
    DServerIP = "DServerIP",
    DownloadTimeOut = "DownloadTimeOut",
    DownloadChunkSize = "DownloadChunkSize",
    SoundFileRed = "SoundFileRed",
    SoundFileYellow = "SoundFileYellow",
    SoundFileRemarks = "SoundFileRemarks",
    WellCheckEnabled = "WellCheckEnabled",
    AlarmAcknowledgement = "AlarmAcknowledgement",
    DefaultTemplate = "DefaultTemplate",
    ConnValidationTemplate = "ConnValidationTemplate",
    TripConnValidationTemplate = "TripConnValidationTemplate",
    DrlgStandValidationTemplate = "DrlgStandValidationTemplate",
    ChatServerDomain = "ChatServerDomain",
    SupportEmail = "SupportEmail",
    chatResolveSrvRecords = "chatResolveSrvRecords",
    chatHostName = "chatHostName",
    chatPort = "chatPort",
    chatUseSSL = "chatUseSSL",
    ShareBroomstickDouments = "ShareBroomstickDouments",
    WaitTime = "WaitTime",
    CompanyLogo = "CompanyLogo",
    CompanyLogo2 = "CompanyLogo2",
    DayTimeFrom = "DayTimeFrom",
    DayTimeTo = "DayTimeTo",
}


export class SystemSettings {

    public settings: SettingValue[] = [];

    constructor() {
        
        this.setDefaultSetting(enumSettingsIDs.AlarmAcknowledgement, "");
        this.setDefaultSetting(enumSettingsIDs.LogFolder, "");
        this.setDefaultSetting(enumSettingsIDs.DigitSignificance, "");
        this.setDefaultSetting(enumSettingsIDs.IgnoreNegative, "");
        this.setDefaultSetting(enumSettingsIDs.DepthLogFrequency, "");
        this.setDefaultSetting(enumSettingsIDs.TimeLogFrequency, "");
        this.setDefaultSetting(enumSettingsIDs.TrajectoryFrequency, "");
        this.setDefaultSetting(enumSettingsIDs.MudLogFrequency, "");
        this.setDefaultSetting(enumSettingsIDs.DepthOffset, "");
        this.setDefaultSetting(enumSettingsIDs.TimeDataAlarmTime, "");
        this.setDefaultSetting(enumSettingsIDs.DepthDataAlarmTime, "");
        this.setDefaultSetting(enumSettingsIDs.DataPageSize, "");
        this.setDefaultSetting(enumSettingsIDs.OverlapSize, "");
        this.setDefaultSetting(enumSettingsIDs.TimeZone, "");
        this.setDefaultSetting(enumSettingsIDs.PageSize, "");
        this.setDefaultSetting(enumSettingsIDs.Orientation, "");
        this.setDefaultSetting(enumSettingsIDs.LeftMargin, "");
        this.setDefaultSetting(enumSettingsIDs.TopMargin, "");
        this.setDefaultSetting(enumSettingsIDs.RightMargin, "");
        this.setDefaultSetting(enumSettingsIDs.BottomMargin, "");
        this.setDefaultSetting(enumSettingsIDs.OptimizeDisplay, "");
        this.setDefaultSetting(enumSettingsIDs.UseDataPaging, "");
        this.setDefaultSetting(enumSettingsIDs.DServerIP, "");
        this.setDefaultSetting(enumSettingsIDs.DownloadTimeOut, "");
        this.setDefaultSetting(enumSettingsIDs.DownloadChunkSize, "");
        this.setDefaultSetting(enumSettingsIDs.SoundFileRed, "");
        this.setDefaultSetting(enumSettingsIDs.SoundFileYellow, "");
        this.setDefaultSetting(enumSettingsIDs.SoundFileRemarks, "");
        this.setDefaultSetting(enumSettingsIDs.WellCheckEnabled, "");
        this.setDefaultSetting(enumSettingsIDs.AlarmAcknowledgement, "");
        this.setDefaultSetting(enumSettingsIDs.DefaultTemplate, "");
        this.setDefaultSetting(enumSettingsIDs.ConnValidationTemplate, "");
        this.setDefaultSetting(enumSettingsIDs.TripConnValidationTemplate, "");
        this.setDefaultSetting(enumSettingsIDs.DrlgStandValidationTemplate, "");
        this.setDefaultSetting(enumSettingsIDs.ChatServerDomain, "");
        this.setDefaultSetting(enumSettingsIDs.SupportEmail, "");
        this.setDefaultSetting(enumSettingsIDs.chatResolveSrvRecords, "");
        this.setDefaultSetting(enumSettingsIDs.chatHostName, "");
        this.setDefaultSetting(enumSettingsIDs.chatPort, "");
        this.setDefaultSetting(enumSettingsIDs.chatUseSSL, "");
        this.setDefaultSetting(enumSettingsIDs.ShareBroomstickDouments, "");
        this.setDefaultSetting(enumSettingsIDs.WaitTime, "");
        this.setDefaultSetting(enumSettingsIDs.CompanyLogo, "");
        this.setDefaultSetting(enumSettingsIDs.CompanyLogo2, "");
        this.setDefaultSetting(enumSettingsIDs.DayTimeFrom, "06:00");
        this.setDefaultSetting(enumSettingsIDs.DayTimeTo, "18:00");

    }

    private setDefaultSetting(pSettingID: enumSettingsIDs, pSettingValue: string, pValue?: string) {
        let objValue: SettingValue = new SettingValue();
        objValue.SettingID = pSettingID;
        objValue.SettingName = pSettingID;
        objValue.Value = "";
        objValue.SettingType = "G";
        this.settings.push(objValue);

    }

    public setSetting(pSettingID: enumSettingsIDs, pSettingValue: string) {
        try {
            // if (this.settings.ContainsKey(SettingID)) {
            //     settings(SettingID).Value = SettingValue;
            // }
            // else {
            //       objNewSetting: SettingValue = new SettingValue();
            //     objNewSetting.SettingID = SettingID;
            //     objNewSetting.SettingName = SettingID;
            //     objNewSetting.Value = SettingValue;
            //     objNewSetting.SettingType = "G";
            //     settings.Add(SettingID, objNewSetting);
            // }

            let ContainsKey = this.settings.find((objSetting: SettingValue) => {
                return objSetting.SettingID === pSettingID;
            });

            console.log("ContainsKey", ContainsKey);

            if (ContainsKey != null) {
                this.settings[pSettingID] = pSettingValue;
            }
            else {

            }
            const objNewSetting: SettingValue = new SettingValue();
            objNewSetting.SettingID = pSettingID;
            objNewSetting.SettingName = pSettingID;
            objNewSetting.Value = pSettingValue;
            objNewSetting.SettingType = "G";
            this.settings.push(objNewSetting);
        }


        catch (ex /*:Exception*/) {
        }

    }
}