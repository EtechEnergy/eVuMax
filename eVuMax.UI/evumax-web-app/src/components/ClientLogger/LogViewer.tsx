import { Button } from '@progress/kendo-react-buttons';
import { Dialog } from '@progress/kendo-react-dialogs';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid'
import React, { Component } from 'react'
import { ClientLogger } from './ClientLogger';

export interface IProps {
    LogList:ClientLogger[]
    onClose:any
    
}

export class LogViewer extends Component<IProps> {
constructor(props){
super(props);
debugger;
this.state = {
    LogList: this.props.LogList
}
}

    state = {
        LogList:[] as any
    }
    
    render() {
        return (
            <>
            <Dialog title={"Error Log"}
                    onClose={(e: any) => {
                        this.props.onClose()
                    }}
                    width={800}
                >
            <div>
                <Grid
                  className="mb-3 col-xl-12 col-lg-12 col-md-12 col-sm-12 numericGrid"
                  style={{ height: "130px", width: "calc(100vw)" }}
                  resizable={true}
                  scrollable={"scrollable"}
                  sortable={false}
                  data={this.state.LogList}
                >
 <Column
                        headerClassName="text-center"
                        className="summaryLabel"
                        field="logDateTime"
                      />
                      <Column
                        headerClassName="text-center"
                        className="summaryLabelHeader"
                        field="logMessage"
                      />
                    
                </Grid>
                
            </div>
            <div className="row mt-2 lg-12">
                        <div className="col">
                            <span className="float-right">
                                {/* onClick={this.props.cancel} */}
                                <Button  className="mr-2">
                                    Download
                                </Button>
                                {/* onClick={this.save} */}
                                <Button className="k-button k-primary" onClick={(e: any) => {
                        this.props.onClose()
                    }} >
                                    Close
                                </Button>
                            </span>

                        </div>
                    </div>
            </Dialog>
           </> 
        )
    }
}

export default LogViewer




// // type LogListProps = {
// //     LogList: Map<string, string>;
// //   };
// //   const LogViewer: React.FC<LogListProps> = ({ children, LogList }) => (
// //     <div>
// //       <p>Log, {LogList}</p>
// //       {children}
// //     </div>
// //   );


// import React, { useEffect } from 'react'

// type LogListProps = {
//     LogList: Map<string, string>;
//   };

// //export default function LogViewer<LogListProps>(children, LogList) {
//    const LogViewer=(LogList:any)=> {
//     let Name: any= "";     
//     useEffect(() => {
//              return () => {
//              debugger;
//                 Name = LogList;
//                 alert(Name.LogList);
//              }
//          }, [LogList])   
//     return (
//         <div>
//          {Name.LogList}
//          </div>
//    )
// }
// export default LogViewer;
  