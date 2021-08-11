import React from "react";
import CustomLoader from "../../loader/loader";

import ReactDOM from "react-dom";


let myData = undefined || {}

const Data = {
    "title": "Securities Finance Trade Entry",
    "children": [
      {
        "containerType": "Div",
        "children": {
          "containerType": "Row",
          "children": [
            {
              "containerType": "Column",
              "children": [
                {
                  "input": "Date",
                  "label": "StartDate"
                }
              ]
            },
            {
              "containerType": "Column",
              "children": [
                {
                  "input": "Date",
                  "label": "StartDate"
                }
              ]
            }
          ]
        }
      }
    ]
  }

  


const Data2 = {
    title: "Securities Finance Trade Entry",
    children: [
      {
        containerType: "Tabs",
        children: [
          {
            title: "Common",
            children: [
              {
                containerType: "Row", 
                children: [
                  {
                    input: "ComboBox",
                    label: "Trade Type",
                    options: ["Repo", "Buy/Sell", "FeeBased"]
                  },
                  {
                    input: "ComboBox",
                    label: "Direction",
                    options: ["Loan", "Borrow"]
                  }
                ]
              },
              {
                containerType: "Row",
                children: [
                  {
                    containerType: "Column",
                    children: [
                      {
                        containerType: "Row",
                        children: [
                          {
                            input: "Text",
                            label: "Book"
                          },
                          {
                            input: "Text",
                            label: "Counterparty"
                          }
                        ]
                      },
                      {
                        containerType: "Row",
                        children: [
                          {
                            input: "Date",
                            label: "StartDate"
                          },
                          {
                            input: "Date",
                            label: "EndDate"
                          }
                        ]
                      },
                      {
                        containerType: "Row",
                        children: [
                          {
                            input: "Text",
                            label: "Security"
                          },
                          {
                            input: "Numeric",
                            label: "Quantity"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  
}


export default class TemplateLoader extends React.Component {





    componentDidMount() {
        //this.createComponent();
    }


    Container = (props: any) => {
        return (
            <div className="container">
                <h1>{props.title}</h1>
                {this.renderChildren(props.children)}
            </div>
        )
    }

    Tabs = (props: any) => {
        return (
            <div className="tab">
                {this.renderChildren(props.children)}
            </div>
        )
    }

    Div = (props: any) => {
        
        return (
            <div className="div">
                {this.renderChildren(props.children)}
            </div>
        )
    }

    Row = (props: any) => {
        return (
            <div className="row">
                {this.renderChildren(props.children)}
            </div>
        )
    }

    Column = (props: any) => {
        return (
            <div className="column">
                {this.renderChildren(props.children)}
            </div>
        )
    }

    Common = (props: any) => {
        return (
            <div className="common">
                {this.renderChildren(props.children)}
            </div>
        )
    }

    SelectGroup = (props: any) => {
        return (
            <div className="select-group">
                <label htmlFor={props.label.replace(" ", "-")}>{props.label}</label>
                <select name={props.label.replace(" ", "-")}>
                    {
                        props.options.map((option: any, ind: any) => {

                            return (
                                <option key={`${option}-${ind}`} value={option}>
                                    {option}
                                </option>
                            )
                        })
                    }
                </select>
            </div>
        )
    }

    InputGroup = (props: any) => {
        const types = { "Text": 'text', "Date": 'date', "Numeric": "number" }
        return (
            <div className="input-group">
                <label htmlFor={props.label.replace(" ", "-")}>{props.label}</label>
                <input name={props.label.replace(" ", "-")} type={props.type} />
            </div>
        )
    }


    Col = (props: any) => {
        

        return (
            <div className="">
                {this.renderChildren(props)}
            </div>
        )
    }


    // Row = (props: any) => {
    //     
    //     return (
    //         <div className="row">
    //             {this.renderChildren(props)}
    //         </div>
    //     )
    // }

    // _Div = (props: any) => {
    //     return (
    //         <div className="">
    //             {this.createRow(props)}
    //         </div>
    //     )
    // }

    // Container = (props: { title: any, children: any }) => {
    //     return (
    //         <div>
    //             <h1>{props.title}</h1>
    //             {/* {renderChildren(props.children)} */}

    //             {this.renderChildren(props.children)}
    //         </div>
    //     )
    // }

    createComp = (props: any) => {
        
        return (<div>j<CustomLoader /></div>);
    }

    createRow = (props: any) => {
        return (props);
    }

    createCol = (props: any) => {

        
        if (props[0]["Cols"].length > 0) {
            for (let i in props[0]["Cols"]) {

                return (<this.Col key={i} {...props}></this.Col>)
            }
        } else {
            return ("");
        }




    }


    renderChildren = (children: any) => {
        
        return children ? children.map((child: any, ind: any) => {
            
            const newChildren = child.children ? [...child.children] : [];
            const { containerType, title, input, label, options } = child
            let key;
            if (newChildren.length) {
                key = `${containerType}-${ind}`;
                switch (containerType) {
                    case "Tabs":
                        return <this.Tabs
                            key={key}
                            title={title}
                            children={newChildren}
                        />
                        case "Div":
                            return <this.Div
                                key={key}
                                title={title}
                                children={newChildren}
                            />
                    case "Column":
                        return <this.Column
                            key={key}
                            title={title}
                            children={newChildren}
                        />
                    case "Row":
                        return <this.Row
                            key={key}
                            title={title}
                            children={newChildren}
                        />
                    default:
                        return <this.Common
                            key={key}
                            title={title}
                            children={newChildren}
                        />
                }
            } else {
                key = `${input}-${ind}`
                switch (input) {
                    case "ComboBox":
                        return <this.SelectGroup
                            key={key}
                            label={label}
                            options={options}
                        />
                    case "Text":
                    case "Date":
                    case "Numeric":
                        return <this.InputGroup
                            key={key}
                            label={label}
                            type={input}
                        />
                }
            }

        }) : null
    }

    // renderChildren = (children: any) => {
    //     

    //         console.log(children);

    //     return children ? children.map((child: any, ind: number) => {


    //         const newChildren = child.children ? [...child.children] : [];
    //         
    //         if (newChildren.length > 0) {

    //             let key;
    //             key = "A-" + child.type + ind.toString();

    //             const _child = child.children;

    //             switch (child.containerType) {
    //                 case "Row":
    //                     return <this.Row key={key}  {...newChildren} />
    //                 case "Column":
    //                     return <this.Col key={key}   {...newChildren} />
    //             }



    //         }


    //     }): null;







    // }





    createComponent = () => {
        return (
            <this.Container title={Data.title} children={Data.children} />
        )
    }

    createMarkup() {
        let div = <div><a style={{ color: "red" }}><CustomLoader /></a></div>;
        return { __html: JSON.stringify(div) };
    }

    MyComponent() {
        return <div dangerouslySetInnerHTML={this.createMarkup()} />;
    }


    render() {
        return (

            <div className="text-white" id="root">

                <div className="text-center" >Template - </div>
                {this.createComponent()}
                {/* {this.MyComponent()} */}

            </div>)
    }



}


// ReactDOM.render(<label>this.createComponent()</label>, document.getElementById('root'));

