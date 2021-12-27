import history from "../history/history";

export function CopyObject(paramObject: any) {
  return JSON.parse(JSON.stringify(paramObject));
}

export function setComboValue(paramComboBox: any, paramValue: string) {
  try {
    const paramStrValue = paramValue.trim().toString().toLowerCase();
    let index: number = 0;
    paramComboBox.forEach(function (value: any) {
      if (value.text == paramValue) {
        return paramComboBox[index];
      }
      index += 1;
    });
  } catch (error) { }
}

export function convertMapToDictionaryJSON(paramValue: any, keyField?: string) {
  try {
    //Below code is to convert Map to c# dictionary object
    let jsonObject: any = {};
    paramValue.forEach((value: any, key: any) => {
      if (keyField !== undefined) {
        jsonObject[value[keyField]] = value;
      } else {
        jsonObject[key] = value;
      }
    });
    return jsonObject;
  } catch (error) {
    return null;
  }
}

export function DictionaryToMap(paramDict: any, paramNewMap: any) {
  try {
    for (let index = 0; index < Object.keys(paramDict).length; index++) {
      const key = Object.keys(paramDict)[index];
      paramNewMap.set(key, paramDict[key]);
    }

    return paramNewMap;
  } catch (error) {
    return null;
  }
}

//Function to convert hex format to a rgb color
export function rgb2hex(rgb: any) {
  rgb = rgb.match(
    /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
  );
  return rgb && rgb.length === 4
    ? "#" +
    ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2)
    : "";
}

export function decimalToHex(d, padding) {
  var hex = Number(d).toString(16);
  padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }

  return hex;
}

export function appendLeadingZeroes(n) {
  if (n <= 9) {
    return "0" + n;
  }
  return n;
}

//prath 01-10-2020
export function formateDate(paramDate: Date) {
  try {
    let day = paramDate.getDate();
    let mlist = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let month = mlist[paramDate.getMonth()];
    let year = paramDate.getFullYear();
    let hour = paramDate.getHours();
    let minute = paramDate.getMinutes();
    let seconds = paramDate.getSeconds();

    let strDate =
      day +
      "-" +
      month +
      "-" +
      year +
      " " +
      hour +
      ":" +
      minute +
      ":" +
      seconds;

    return strDate;
  } catch (error) {
    return "";
  }
}

//Nishant 07-10-2020
//Common function to launch Widget from List Cick
export function getWidgetList() {
  try {
    const WidgetList = [
      { id: "DrlgSummary", name: "Drilling Summary", isFav: false },
      { id: "DrlgConnSummary", name: "Drlg. Conn. Summary", isFav: false },
      {
        id: "DrlgConnSummary2",
        name: "Drlg. Conn. Summary (Split View)",
        isFav: false,
      },
      { id: "TripConnSummary", name: "Trip Conn. Summary", isFav: false },
      { id: "ToolfaceSummary", name: "Toolface Summary", isFav: false },
      { id: "ROPSummary", name: "ROP Summary", isFav: false },
      { id: "TripSpeed1", name: "Trip Speed 1", isFav: false },
      { id: "TripSpeed2", name: "Trip Speed 2", isFav: false },
      { id: "Broomstick", name: "Broomstick", isFav: false },
      { id: "customDrlgSummaryViewer", name: "Custom Drilling Summary", isFav: false },
    ];

    return WidgetList;
  } catch (error) { }
}
export function launchWidget(interfaceID: string, wellID: string) {
  try {
    
    if (interfaceID === "ROPSummary") {
      history.push("ROPSummaryPlot/" + wellID);
    }

    if (interfaceID === "DrlgSummary") {
      history.push("DrillingSummary/" + wellID);
    }
    if (interfaceID === "DrlgConnSummary") {
      history.push("DrlgConnSummary/" + wellID);
    }

    if (interfaceID === "DrlgConnSummary2") {
      history.push("DrlgConnSummary2/" + wellID);
    }

    if (interfaceID === "TripConnSummary") {
      history.push("TripConnSummary/" + wellID);
    }

    if (interfaceID === "DrlgConnSummarySplitView") {
      history.push("DrlgConnSummary2/" + wellID);
    }

    if (interfaceID === "ToolfaceSummary") {
      history.push("ToolfaceSummary/" + wellID);
    }

    if (interfaceID === "TripSpeed1") {
      history.push("TripSpeedPlot1/" + wellID); //TripSpeed1
    }

    if (interfaceID === "TripSpeed2") {
      history.push("TripSpeedPlot2/" + wellID);
    }

    if (interfaceID === "Broomstick") {
      history.push("Broomstick/" + wellID);
    }
    
    if (interfaceID === "customDrlgSummaryViewer") {
      history.push("customDrlgSummaryViewer/" + wellID);
    }
  } catch (error) { }
}

export function parseJSON(pString: string) {
  try {
    JSON.parse(pString);
    return JSON.parse(pString);
  } catch (e) {
    return false;
  }
}

export function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function convertSecondsToDayHoursMinSec(paramSeconds: string) {
  var seconds = parseInt(paramSeconds, 10);

  var days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  var hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  var mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;

  return days + " days, " + hrs + " Hrs, " + mnts + " Minutes, " + seconds + " Seconds";
}

export function convertSecondsToDayHrsMin(seconds) {
  seconds = seconds || 0;
  seconds = Number(seconds);
  seconds = Math.abs(seconds);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];


  //parts.push(d + ' day' + (d > 1 ? 's' : ''));
  parts.push(d);
  parts.push(h);
  parts.push(m);


  // if (s > 0) {
  //   parts.push(s);
  // }

  return "[" + parts.join(':') + "]";
}