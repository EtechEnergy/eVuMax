import React from "react";
import GlobalMod from "../../objects/global";
import axios from "axios";

import { Input } from "@progress/kendo-react-all";
import BrokerRequest from "../../broker/BrokerRequest";
import BrokerParameter from "../../broker/BrokerParameter";
import history from "../../history/history";
import login from "./login";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { confirmAlert } from "react-confirm-alert";
import DataSelector2 from "../Common/DataSelector2";
import DataSelector from "../Common/DataSelector";
import { RSAService } from "../../utilFunctions/RSAService";


let _gMod = new GlobalMod();
let objBrokerRequest = new BrokerRequest();



export default class changePassword extends React.Component {
  newPasswordInput: React.RefObject<any>;
  constructor(props) {
    super(props)
    this.newPasswordInput = React.createRef();

  }

  state = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    isValidUser: false
  }



  validateUser = () => {
    try {

      if (this.state.oldPassword == "") {

        confirmAlert({
          //title: 'eVuMax',
          message: 'Please enter Old Password to validate',
          childrenElement: () => <div />,
          buttons: [
            {
              label: 'Ok',
              onClick: () => {
                return;
              }
            },
            // {
            //     label: 'No',
            //     onClick: () => null
            // }
          ]
        });
        return;
      }


      objBrokerRequest.Module = "Common";
      objBrokerRequest.Function = "ValidateUser";
      objBrokerRequest.Broker = "Authentication";

      objBrokerRequest.Parameters.length = 0;

      let objLogin: any;
      objLogin = JSON.parse(JSON.parse(localStorage.getItem("persist:root")).login);

      if (objLogin._userName == "") {
        history.push("/dashboard/Login");
      }
      let objParameter = new BrokerParameter("UserName", objLogin._userName);
      objBrokerRequest.Parameters.push(objParameter);

      //objParameter = new BrokerParameter("Password", this.state.oldPassword);
      objParameter = new BrokerParameter("Password", RSAService.EncryptionToBas64(this.state.oldPassword));
      objBrokerRequest.Parameters.push(objParameter);



      axios
        .get(_gMod._getData, {
          params: { paramRequest: JSON.stringify(objBrokerRequest) },
        })
        .then((res) => {

          if (res.data.RequestSuccessfull) {

            this.setState({
              isValidUser: true
            });
            this.newPasswordInput.current.focus();

          } else {

            this.setState({
              isValidUser: false
            })

          }
        })
        .catch((error) => {

        });



    } catch (error) {

    }
  }


  componentWillUpdate() {
    _gMod = new GlobalMod();
    if (_gMod._userId == "" || _gMod._userId == undefined) {
      window.location.href = "/evumaxapp/";
      return;
    }

  }
  componentDidMount() {
    try {

    } catch (error) {

    }
  }

  handleChange = (event: any, field: string) => {
    const value = event.value;
    const name = field;
    if (field == "oldPassword") {
      this.setState({
        oldPassword: value
      });
    }

    if (field == "newPassword") {
      this.setState({
        newPassword: value
      });
    }

    if (field == "confirmPassword") {
      this.setState({
        confirmPassword: value
      });
    }

  };

  Cancel = () => {

    history.push("/dashboard/home");

  }

  Save = () => {

    if (this.state.newPassword !== this.state.confirmPassword) {
      confirmAlert({
        //title: 'eVuMax',
        message: 'New Password not matching with confirm password',
        childrenElement: () => <div />,
        buttons: [
          {
            label: 'Ok',
            onClick: () => {
              return;
            }
          },
          // {
          //     label: 'No',
          //     onClick: () => null
          // }
        ]
      });
    } else {


      objBrokerRequest.Module = "Common";
      objBrokerRequest.Function = "ChangePassword";
      objBrokerRequest.Broker = "Authentication";

      objBrokerRequest.Parameters.length = 0;

      let objLogin: any;
      objLogin = JSON.parse(JSON.parse(localStorage.getItem("persist:root")).login);

      if (objLogin._userName == "") {
        history.push("/dashboard/Login");
      }
      let objParameter = new BrokerParameter("UserName", objLogin._userName);
      objBrokerRequest.Parameters.push(objParameter);

      //objParameter = new BrokerParameter("Password", this.state.newPassword);
      objParameter = new BrokerParameter("Password", RSAService.EncryptionToBas64(this.state.newPassword));
      objBrokerRequest.Parameters.push(objParameter);


      axios
        .get(_gMod._performTask, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
          },
          params: { paramRequest: JSON.stringify(objBrokerRequest) }
        })
        .then((res) => {

          if (res.data.RequestSuccessfull) {
            sessionStorage.clear();
            localStorage.clear();
            history.push("/");//Logout

          } else {
            alert("Some Error while Saving");
            this.setState({
              isValidUser: false
            });

          }
        })
        .catch((error) => {

        });




    }

    //history.push("/dashboard/home");
  }


  render() {
    return (
      <div>
        <div className="col-lg-12 col-sm-12 col-md-12 col-12">
          <legend>
            <a>Change Password</a>
            <span className="float-right">
              {" "}
              <button
                type="button"
                onClick={this.Save}
                className="btn-custom btn-custom-primary mr-1"
              >
                {/* <FontAwesomeIcon icon={faCheck} className="mr-2" /> */}
                Save
              </button>
              <button
                type="button"
                onClick={this.Cancel}
                className="btn-custom btn-custom-primary ml-1"
              >
                {/* <FontAwesomeIcon icon={faTimes} className="mr-2" /> */}
                Cancel
              </button>
            </span>
          </legend>
        </div>
        <hr></hr>

        <div className="mt-2">
          <div className="row">
            <div className="col-lg-6 ">
              <form>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label text-right">
                    Old Password
                  </label>
                  <div className="col-sm-6">
                    <Input
                      type="password"
                      onChange={(e) =>
                        this.handleChange(e, "oldPassword")
                      }
                      value={this.state.oldPassword}
                    />
                    <button type="button" className="btn-custom btn-custom-primary mr-2 ml-3" onClick={this.validateUser} >
                      Validate
                      <FontAwesomeIcon className="ml-2" icon={faCheck} />
                    </button>

                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label text-right">
                    New Password
                  </label>
                  <div className="col-sm-3">
                    <Input
                      type="password"
                      ref={this.newPasswordInput}
                      onChange={(e) =>
                        this.handleChange(e, "newPassword")
                      }
                      value={this.state.newPassword}
                      readOnly={!this.state.isValidUser}

                    />
                  </div>
                </div>
                <div className="form-group row">
                  <label className="col-sm-3 col-form-label text-right">
                    Confirm Password
                  </label>
                  <div className="col-sm-3">
                    <Input
                      type="password"
                      onChange={(e) =>
                        this.handleChange(e, "confirmPassword")
                      }
                      value={this.state.confirmPassword}
                      readOnly={!this.state.isValidUser}

                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* <DataSelector2></DataSelector2> */}

        {/* <DataSelector></DataSelector> */}
      </div>
    )
  }

}
