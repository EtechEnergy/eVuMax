//import * as React from 'react';
//import * as d3 from 'd3';

import React, { Component } from "react";
import { Switch, Route, Router } from "react-router-dom";
import axios from "axios";
import LoginPage from "../login/login";
import Dashboard from "../dashboard/dashboard";
import Home from "../dashboard/home/home";
import PageNotFound from "../pagenotfound/PageNotFound";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import histroy from "../../history/history";

import GlobalMod from "../../objects/global";
import { Provider } from "react-redux";
import { store, persistor } from "../../redux/store/configureStore";
import { PersistGate } from "redux-persist/integration/react";

let _gMod = new GlobalMod();

let objBrokerRequest = new BrokerRequest();

export const ThemeContext = React.createContext<{ Id: string }>({ Id: "" });

class App extends Component {
  


  state = {
    _pId: "",
  };

  componentDidMount() {
    
    this.loadTheme();
  }

  loadTheme = () => {
    try {
      objBrokerRequest = new BrokerRequest();
      let objParameter = new BrokerParameter("UserId", _gMod._userId);
      objBrokerRequest.Parameters.push(objParameter);
      objBrokerRequest.Module = "Config";
      objBrokerRequest.Function = "LoadTheme";
      objBrokerRequest.Broker = "Config.Themes";

      axios
        .get(_gMod._getData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {
          const objData = res.data;
          
          if (objData.RequestSuccessfull) {

            this.applyTheme(JSON.parse(objData.Response));
          } else {
            // Error
          }
        })
        .catch((error) => {
          if (error.response) {
            // return <CustomeNotifications Key="success" Icon={false}  />
            // this.errors(error.response.message);
          } else if (error.request) {
            // return <CustomeNotifications Key="success" Icon={false}  />
            console.log("error.request");
          } else {
            // return <CustomeNotifications Key="success" Icon={false}  />
            console.log("Error", error);
          }
          // return <CustomeNotifications Key="success" Icon={false}  />
          console.log("rejected");
          this.setState({ isProcess: false });
        });
    } catch { }
  };

  applyTheme = (props: any) => {
    

    if (props.length) {
      //
      this.setState({ _pId: props[0].Id.toString() });
      props.forEach((items: any) => {
        if (items.PropertyName === "WorkArea") {
          document.documentElement.style.setProperty(
            "--base-work-area",
            items.Value
          );
        }

        if (items.PropertyName === "MenuBar") {
          document.documentElement.style.setProperty(
            "--base-menu-top",
            items.Value
          );
          document.documentElement.style.setProperty(
            "--base-menu-left",
            items.Value
          );
        }

        if (items.PropertyName === "FontColor") {
          document.documentElement.style.setProperty(
            "--base-anchor-color",
            items.Value
          );
        }

        if (items.PropertyName === "PrimaryBackColor") {
          document.documentElement.style.setProperty(
            "--base-primary",
            items.Value
          );
        }

        if (items.PropertyName === "PrimaryColor") {
          document.documentElement.style.setProperty(
            "--base-primary-color",
            items.Value
          );
        }

        if (items.PropertyName === "ChartGridColor") {
          document.documentElement.style.setProperty(
            "--base-chart-grid-color",
            items.Value
          );
        }


      });
    }
  };

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeContext.Provider value={{ Id: this.state._pId }}>
            <Router history={histroy}>
              <Switch>
                <Route path="/" exact component={LoginPage} />
                <Route path="/dashboard" component={Dashboard}></Route>
                <Route path="/404" component={PageNotFound} />
                <Route component={PageNotFound} />
              </Switch>
            </Router>
          </ThemeContext.Provider>
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
