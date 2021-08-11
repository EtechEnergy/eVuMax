import React from 'react'
import { ButtonProps } from '@progress/kendo-react-all'
import login from '../login/login'



function RegularButton({...props}:any) {
    return (
        <div>
            <button className={props.className} onClick={props.onClick}>{props.Text}</button>
        </div>
    )
}

export default RegularButton
