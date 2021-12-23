import React, { Component } from "react";
import * as d3 from "d3";
import * as utilFunctions from "../../utilFunctions/utilFunctions";
import {
  AutoComplete,
  ComboBox,
  DropDownList,
  MultiSelect,
} from "@progress/kendo-react-dropdowns";

import { Chart, curveStyle } from "../../eVuMaxObjects/Chart/Chart";
import { ChartData } from "../../eVuMaxObjects/Chart/ChartData";
import { formatNumber, parseDate } from "@telerik/kendo-intl";
import {
  Axis,
  axisLabelStyle,
  axisPosition,
} from "../../eVuMaxObjects/Chart/Axis";
import DataSelector from "../Common/DataSelector";
import { Moment } from "moment";
import {
  DataSeries,
  dataSeriesType,
} from "../../eVuMaxObjects/Chart/DataSeries";
import { Guid } from "guid-typescript";
import "@progress/kendo-react-layout";
import { filterBy } from "@progress/kendo-data-query";
import ProcessLoader from "../loader/loader";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import axios from "axios";
import Moment_ from "react-moment";
import {
  Input,
  MaskedTextBox,
  NumericTextBox,
  Checkbox,
  ColorPicker,
  Switch,
  RadioGroup,
  Slider,
  SliderLabel,
  RadioButton,
} from "@progress/kendo-react-inputs";
import {
  Grid,
  GridColumn as Column,
  GridColumn,
  GridToolbar,
} from "@progress/kendo-react-grid";
import {
  TabStrip,
  TabStripTab,
  Button,
  Dialog,
} from "@progress/kendo-react-all";

import { axisBottom, gray, json, timeout } from "d3";
import moment from "moment";

// import './DrlgConnSummary.css';

import { ChartEventArgs } from "../../eVuMaxObjects/Chart/ChartEventArgs";

import GlobalMod from "../../objects/global";
import { util } from "typescript-collections";
import { pointShape } from "../../eVuMaxObjects/Chart/PointSeries";
import { comboData } from "../../eVuMaxObjects/UIObjects/comboData";
let _gMod = new GlobalMod();

export default class PointChartTest extends Component {


  state = {
    name: []
  }

  updateName = () => {
    let arr = this.state.name.splice(0, this.state.name.length - 1);

    //alert("After update" + arr.length);



    try {
      this.setState({ name: arr });
    } catch (error) {

    }
  }



  componentDidMount() {

    let arr = ['etech', 'energy', 'ltd'];
    this.setState({ name: arr });
  }

  render() {
    //alert(this.state.name.length);

    return (
      <div>
        <button type="button" onClick={this.updateName}>Click Me!</button>
        <h1>Length of Array {this.state.name.length}</h1>
      </div>
    )
  }
}