import React from "react";
import WellSelector from "../../../wellSelector/WellSelector";
export default class AddWellToDashBoard extends React.Component {

    componentDidMount() {


    }

    ApplyWellColumns = (props: any) => {

    }

    render() {
        return (
            <div style={{ marginTop: '8em' }}>
                <div className="col-lg-12 col-sm-12 col-md-12 col-12">


                    <legend><a>Add Well</a><span className="float-right">  <button type="button" className="btn-custom btn-custom-primary mr-1">
                        {/* <FontAwesomeIcon icon={faCheck} className="mr-2" /> */}
Save</button>
                        <button type="button" className="btn-custom btn-custom-primary ml-1">
                            {/* <FontAwesomeIcon icon={faTimes} className="mr-2" /> */}
        Cancel</button>
                    </span></legend>


                </div>
                <div className="col-lg-12">

                </div>
            </div>

        )
    }

}