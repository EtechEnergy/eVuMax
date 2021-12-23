import { Avatar, ListView } from "@progress/kendo-react-all";
import React, { PureComponent } from "react";

const data = [
  {
    name: "jenson delaney",
    email: "jenson.delaney@mail.com",
    image: "Jenson-Delaney",
    messages: 3,
  },
  {
    name: "amaya coffey",
    email: "amaya.coffey@mail.com",
    image: "Amaya-Coffey",
    messages: 1,
  },
  {
    name: "habib joyce",
    email: "habib.joyce@mail.com",
    image: "Habib-Joyce",
    messages: 5,
  },
  {
    name: "lilly-ann roche",
    email: "lilly-ann.roche@mail.com",
    image: "Lilly-Ann-Roche",
    messages: 8,
  },
  {
    name: "giulia haworth",
    email: "giulia.haworth@mail.com",
    image: "Giulia-Haworth",
    messages: 3,
  },
  {
    name: "dawson humphrey",
    email: "dawson.humphrey@mail.com",
    image: "Dawson-Humphrey",
    messages: 2,
  },
  {
    name: "reilly mccullough",
    email: "reilly.mccullough@mail.com",
    image: "Reilly-Mccullough",
    messages: 3,
  },
];

const MyItemRender = (props) => {
  let item = props.dataItem;
  return (
    <div className="row p-2 border-bottom align-middle" style={{ margin: 0 }}>
      <div className="col-6">
        <h2
          style={{ fontSize: 14, color: "#454545", marginBottom: 0 }}
          className="text-uppercase"
        >
          {item.name}
        </h2>
      </div>

      <div className="col-3">
        <div className="k-chip k-chip-filled">
          <div className="k-chip-content">Add to favourite</div>
        </div>
      </div>

      <div className="col-3">
        <div className="k-chip k-chip-filled">
          <div className="k-chip-content">Open</div>
        </div>
      </div>
    </div>
  );
};

export default class WidgetSelection extends PureComponent {
  render() {
    return (
      <div>
        <ListView data={data} item={MyItemRender} style={{ width: "100%" }} />
      </div>
    );
  }
}
