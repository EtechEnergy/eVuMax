import React, { Component } from "react";
import StackBar from "./StackBar";
import LineChart from "./LineChart";
import LineChart_Working from "./LineChart_Working";
import LineChart_DateAxis from "./LineChart_DateAxis";

import LineChart_ColorEach from "./LineChart_ColorEach";
import DataSelector from "../Common/DataSelector";
//import Chart from "./../Common/Chart";
import PointChart1 from "./PointChart1";
import PointChartTest from "./PointChartTest";

export class ChartTesting extends Component {

  WellId: string = "us_1395675560";
  render() {
    return (
      <div style={{ height: "100px" }}>

        {/* <div className="row">
          <div className="col">
            <StackBar>  </StackBar>
          </div>
        </div> */}
        <div style={{ height: "100px" }}>
          <div className="row">
            <div className="col">
              {/* <Chart>      </Chart> */}
              {/* <LineChart_Working></LineChart_Working> */}

              {/* <LineChart_DateAxis></LineChart_DateAxis> */}

              {/* <LineChart></LineChart> */}
              {/* <div style={{ width: "100vw" }}>
                <DataSelector {...this} />
              </div> */}

              {/* {<PointChart1></PointChart1>} */}
              {<PointChartTest></PointChartTest>}
              {/* <LineChart_ColorEach></LineChart_ColorEach> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ChartTesting;
