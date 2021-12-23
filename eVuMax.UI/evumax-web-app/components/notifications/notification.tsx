import React from "react";
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { Fade } from '@progress/kendo-react-animation';
import NotificationProperties from "../../objects/notification-prop";
import { start } from "repl";
import { runInThisContext } from "vm";
import { Icon } from "@fortawesome/fontawesome-svg-core";

const position = {
    topLeft: { top: 0, left: 0, alignItems: 'flex-start' },
    topCenter: { top: 0, left: '50%', transform: 'translateX(-50%)' },
    topRight: { right: 10, top: 0, alignItems: 'flex-start', flexWrap: 'wrap-reverse' },
    bottomLeft: { bottom: 0, left: 0, alignItems: 'flex-start' },
    bottomCenter: { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
    bottomRight: { bottom: 0, right: 0, alignItems: 'flex-end' }
};

interface _Notification {
    Key: _Key
    Icon: _Icon
    IsVisible:_IsVisible
    Messages : _Messages
}


type _Key = "success" | "info" | "none" | "error" | "warning" | undefined;
type _Icon = boolean | undefined;
type _IsVisible = boolean | undefined;
type _TimeOut = number | undefined;
type _Messages = string | undefined;





export default class CustomeNotifications extends React.Component<_Notification> {

    constructor(props: Readonly<_Notification>) {
        super(props)
        this.setState({
            defaultKey: this.props.Key,
            deafaultIcon: this.props.Icon
        });

    }

    state = {
        defaultKey: this.props.Key,
        dafaultIcon: this.props.Icon,
        dafaultIsVisible:this.props.IsVisible,
        deafultMessages: this.props.Messages
    }

    componentDidMount(){

        
    }


    TimeOut = () => {
        
        if(this.state.dafaultIsVisible){
          setTimeout(()=>{
            this.setState({ dafaultIsVisible: false });
            return (
                <Fade enter={true} exit={true}>
                    <NotificationGroup  style={{
                right: 10,
                top: 0,
                alignItems: 'flex-start',
                flexWrap: 'wrap-reverse',
                position:"fixed",
                zIndex:100
              }}>
                        <Notification key={this.state.defaultKey} type={{ style: this.state.defaultKey, icon: this.state.dafaultIcon }}>{this.state.deafultMessages}</Notification>,
                </NotificationGroup>
                </Fade>
            );
          },5000)
        }
      }


    render() {



        return (
            <Fade enter={true} exit={true}>
                <NotificationGroup  style={{
            right: 10,
            top: 0,
            alignItems: 'flex-start',
            flexWrap: 'wrap-reverse',
            position:"fixed",
            zIndex:100
          }}>
                    <Notification key={this.state.defaultKey} type={{ style: this.state.defaultKey, icon: this.state.dafaultIcon }}>{this.state.deafultMessages}</Notification>,
            </NotificationGroup>
            </Fade>
        );


        

        
    }


}
