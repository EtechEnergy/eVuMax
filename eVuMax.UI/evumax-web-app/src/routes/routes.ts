import Home from "../components/dashboard/home/home";
import DahboardSettings from "../components/dashboard/settings/settings";
import Themes from "../components/dashboard/settings/themes/themes";
import UserPrefs from "../components/dashboard/user-prefs/user-prefs";

import WellColumnsEditor from "../components/dashboard/settings/well-column-editor/wellColumnsEditor";
import ManageDashboardWell from "../components/dashboard/settings/add-well/manageDashboardWell";
import ManageThemes from "../components/dashboard/settings/themes/manage-theme/manage-theme";

import WellEditorForm from "../components/wellObjectComponent/wellEditorForm";
import DrlgConnSummary from "../components/Widgets/DrlgConnSummary/DrlgConnSummary";
import DrlgConnSummary2 from "../components/Widgets/DrlgConnSummary2/DrlgConnSummary2";
import TripConnSummary from "../components/Widgets/TripConnSummary/TripConnSummary";
import DataSelector from "../components/Common/DataSelector";
import DrillingSummary from "../components/Widgets/DrillingSummary/DrillingSummary";
import ROPSummaryPlot from "../components/Widgets/ROPSummaryPlot/ROPSummaryPlot";
import charttest from "../components/Widgets/DrlgConnSummary/charttest";
import ToolfaceSummary from "../components/Widgets/ToolfaceSummary/ToolfaceSummary";
import TripSpeedPlot1 from "../components/Widgets/TripSpeedPlot1/TripSpeedPlot1";
import TripSpeedPlot2 from "../components/Widgets/TripSpeedPlot2/TripSpeedPlot2";
import WitsmlExplorer from "../components/DownloadManager/WitsmlExplorer";
import Broomstick from "../components/Widgets/Broomstick/Broomstick";


import ChartTesting from "../components/ChartTesting/ChartTesting";
import ChangePassword from "../components/login/changePassword";
import customDrlgSummaryViewer from "../components/Widgets/CustomDrillingSummary/customDrlgSummaryViewer";
import DrlgStandPlot from "../components/Widgets/DrlgStandPlot/DrlgStandPlot";
import TripReport from "../components/Widgets/TripReport/TripReport";
import  BroomstickPlot from "../components/Widgets/BroomstickDocs/BroomstickPlot";
import AdvKPI from "../components/Widgets/AdvKPI/AdvKPI";


//DS
import QcRules from "../components/DataService/Setup/QCRules/QcRules";// "../components/dashboard/dataservice/setup/qcrules/QcRules";

import CommonSettings from "../components/DataService/Setup/CommonSettings/CommonSettings"
import CommonRigStateSetup from "../components/DataService/Setup/RigState/CommonRigStateSetup/CommonRigStateSetup";
import RigSpecficRigStateSetup from "../components/DataService/Setup/RigState/RigSpecficRigStateSetup/RigSpecficRigStateSetup";
import AlertSettings from "../components/DataService/Setup/AlertSettings/AlertSettings";
import MaintainStdChannels from "../components/DataService/Setup/MaintainStdChannels/MaintainStdChannels";

import UnitDictionary from "../components/DataService/Setup/Units/UnitDictionary";
import UnitConversion from "../components/DataService/Setup/UnitsConversion/UnitConversion";
import UnitMappings from "../components/DataService/Setup/UnitMappings/UnitMappings";
import UnitConversionProfile from "../components/DataService/Setup/UnitConversionProfile/UnitConversionProfile";
import EmailSettings from "../components/DataService/Setup/EmailSettings/EmailSettings";
import DownloadAuditInfo from "../components/DataService/Setup/DownloadAudit/DownloadAuditInfo";
import AuditInformation from "../components/DataService/Setup/AuditInfo/AuditInformation";
import ChannelLibrary from "../components/DataService/Setup/ChannelLibrary/ChannelLibrary";
import WellMonitor from "../components/DataService/Setup/WellMonitor/WellMonitor";
//import SetupAlarms from "../components/DataService/Data/SetupAlarms/SetupAlarms";
//import RigStateSetup from "../components/DataService/Data/RigStateSetup";
import SetupAlarms from "../components/DataService/Data/SetupAlarms/SetupAlarms";
import RigStateSetup from "../components/DataService/Data/RigStateSetup/RigStateSetup";
import AlarmProfiles from "../components/DataService/Data/AlarmProfiles/AlarmProfiles";

//import RigStateSetup from "../components/DataService/Data/RigStateSetup";

       

//DrlgConnSummary2
const dashbordRoutes = [
  {
    path: "/home",
    name: "Home",
    icon: "",
    component: Home,
    layout: "/dashboard",
  },
  {
    path: "/settings",
    name: "settings",
    icon: "",
    component: DahboardSettings,
    layout: "/dashboard",
  },
  {
    path: "/themes",
    name: "themes",
    icon: "",
    component: Themes,
    layout: "/dashboard",
  },
  {
    path: "/manage-themes",
    name: "manage-themes",
    icon: "",
    component: ManageThemes,
    layout: "/dashboard",
  },
  {
    path: "/user-prefs",
    name: "user-prefs",
    icon: "",
    component: UserPrefs,
    layout: "/dashboard",
  },
  {
    path: "/well-editor",
    name: "well-editor",
    icon: "",
    component: WellColumnsEditor,
    layout: "/dashboard",
  },
  {
    path: "/add-well",
    name: "add-well",
    icon: "",
    component: ManageDashboardWell,
    layout: "/dashboard",
  },
  {
    path: "/manageDashboardWell",
    name: "manageDashboardWell",
    icon: "",
    component: ManageDashboardWell,
    layout: "/dashboard",
  },
  {
    path: "/wellEditorForm/:WellId",
    name: "wellEditorForm",
    icon: "",
    component: WellEditorForm,
    layout: "/dashboard",
  },
  {
    path: "/DrlgConnSummary/:WellId",
    name: "Drilling Connection Summary",
    icon: "",
    component: DrlgConnSummary,
    layout: "/dashboard",
  },
  {
    path: "/ToolfaceSummary/:WellId",
    name: "Toolface Summary",
    icon: "",
    component: ToolfaceSummary,
    layout: "/dashboard",
  },
  {
    path: "/DrlgConnSummary2/:WellId",
    name: "Drilling Connection Summary (Split View)",
    icon: "",
    component: DrlgConnSummary2,
    layout: "/dashboard",
  },
  {
    path: "/selector",
    name: "Data Selector",
    icon: "",
    component: DataSelector,
    layout: "/dashboard",
  },

  {
    path: "/TripConnSummary/:WellId",
    name: "Trip Connection Summary",
    icon: "",
    component: TripConnSummary,
    layout: "/dashboard",
  },
  {
    path: "/DrillingSummary/:WellId",
    name: "Drilling Summary",
    icon: "",
    component: DrillingSummary,
    layout: "/dashboard",
  },
  {
    path: "/ROPSummaryPlot/:WellId", //prath 08-10-2020
    name: "ROP Summary Plot",
    icon: "",
    component: ROPSummaryPlot,
    layout: "/dashboard",
  },
  {
    path: "/TripSpeedPlot1/:WellId",
    name: "Trip Speed Plot 1",
    icon: "",
    component: TripSpeedPlot1,
    layout: "/dashboard",
  },
  {
    path: "/TripSpeedPlot2/:WellId",
    name: "Trip Speed Plot 2",
    icon: "",
    component: TripSpeedPlot2,
    layout: "/dashboard",
  },

  {
    path: "/charttest",
    name: "Chart Test",
    icon: "",
    component: charttest,
    layout: "/dashboard",
  },

  {
    path: "/WitsmlExplorer",
    name: "Witsml Explorer",
    icon: "",
    component: WitsmlExplorer,
    layout: "/dashboard",
  },

  {
    path: "/ChartTesting",
    name: "chart Testing",
    icon: "",
    component: ChartTesting,
    layout: "/dashboard",
  },

  {
    path: "/Broomstick/:WellId",
    name: "Broomstick",
    icon: "",
    component: Broomstick,
    layout: "/dashboard",
  },

  {
    path: "/changePassword",
    name: "Change Password",
    icon: "",
    component: ChangePassword,
    layout: "/dashboard",
  },

  {
    path: "/customDrlgSummaryViewer/:WellId",
    name: "customDrlgSummaryViewer",
    icon: "",
    component: customDrlgSummaryViewer,
    layout: "/dashboard",
  },

  {
    path: "/DrlgStandPlot/:WellId",
    name: "DrlgStandPlot",
    icon: "",
    component: DrlgStandPlot,
    layout: "/dashboard",
  },

  {
    path: "/TripReport/:WellId",
    name: "TripReport",
    icon: "",
    component: TripReport,
    layout: "/dashboard",
  },

  {
    path: "/BroomstickDocs/:WellId",
    name: "BroomstickPlot",
    icon: "",
    component: BroomstickPlot,
    layout: "/dashboard",
  },

 
  {
    path: "/AdvKPI",
    name: "AdvKPI",
    icon: "",
    component: AdvKPI,
    layout: "/dashboard",
  },


  // Data Services
  {
    path: "/QcRules",
    name: "QcRules",
    icon: "",
    component: QcRules,
    layout: "/dashboard",
  },
  

  {
    path: "/CommonSettings",
    name: "CommonSettings",
    icon: "",
    component: CommonSettings,
    layout: "/dashboard",
  },
  {
    path: "/CommonRigStateSetup",
    name: "CommonRigStateSetup",
    icon: "",
    component: CommonRigStateSetup,
    layout: "/dashboard",
  },
  {
    path: "/RigSpecficRigStateSetup",
    name: "RigSpecficRigStateSetup",
    icon: "",
    component: RigSpecficRigStateSetup,
    layout: "/dashboard",
  },
  {
    path: "/AlertSettings",
    name: "AlertSettings",
    icon: "",
    component: AlertSettings,
    layout: "/dashboard",
  },
  {
    path: "/MaintainStdChannels",
    name: "MaintainStdChannels",
    icon: "",
    component: MaintainStdChannels,
    layout: "/dashboard",
  },
  //==================
  {
    path: "/UnitDictionary",
    name: "UnitDictionary",
    icon: "",
    component: UnitDictionary,
    layout: "/dashboard",
  },

  {
    path: "/UnitConversion",
    name: "UnitConversion",
    icon: "",
    component: UnitConversion,
    layout: "/dashboard",
  },

  {
    path: "/UnitMappings",
    name: "UnitMappings",
    icon: "",
    component: UnitMappings,
    layout: "/dashboard",
  },

  {
    path: "/UnitConversionProfile",
    name: "UnitConversionProfile",
    icon: "",
    component: UnitConversionProfile,
    layout: "/dashboard",
  },
  {
    path: "/EmailSettings",
    name: "EmailSettings",
    icon: "",
    component: EmailSettings,
    layout: "/dashboard",
  },
  
  {
    path: "/DownloadAuditInfo",
    name: "DownloadAuditInfo",
    icon: "",
    component: DownloadAuditInfo,
    layout: "/dashboard",
  },

  {
    path: "/AuditInformation",
    name: "AuditInformation",
    icon: "",
    component: AuditInformation,
    layout: "/dashboard",
  },
  
  {
    path: "/ChannelLibrary",
    name: "ChannelLibrary",
    icon: "",
    component: ChannelLibrary,
    layout: "/dashboard",
  },


  {
    path: "/WellMonitor",
    name: "WellMonitor",
    icon: "",
    component: WellMonitor,
    layout: "/dashboard",
  },


  // Data Tab
  {
    path: "/SetupAlarms",
    name: "SetupAlarms",
    icon: "",
    component: SetupAlarms,
    layout: "/dashboard",
  },

  {
    path: "/RigstateSetup",
    name: "RigstateSetup",
    icon: "",
    component: RigStateSetup,
    layout: "/dashboard",
  },
  {
    path: "/AlarmProfiles",
    name: "AlarmProfiles",
    icon: "",
    component: AlarmProfiles,
    layout: "/dashboard",
  },
];

export default dashbordRoutes;
