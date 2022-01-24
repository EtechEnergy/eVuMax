
import React, { Component } from 'react';

export default class TripReportSettings extends React.Component {

    render() {
        return <div>
            <div className="col-xl-9 col-lg-8 col-md-6 col-sm-6" style={{ backgroundColor: "transparent", height: "50%" }}>

                <h6 style={{ display: "flex", justifyContent: "center" }} className="summaryGroupHeaderTripReport">Statistics</h6>
                <div className="row">
                    <div className="col-4">

                        <div className="group-inline">
                            <div className="form-group">
                                <label className="summaryLabelHeader-long">
                                    Section
                                </label>
                                <label className="summaryLabel" id="txtPositiveFlow">

                                </label>
                            </div>
                            <div className="form-group">
                                <label className="summaryLabelHeader-long">
                                    Depth
                                </label>
                                <label className="summaryLabel" id="txtNegativeFlow">

                                </label>
                            </div>
                            <div className="form-group">
                                <label className="summaryLabelHeader-long">
                                    Avg. Conn. Time
                                </label>
                                <label className="summaryLabel" id="txtNetFlow">

                                </label>
                            </div>
                            <div className="form-group">
                                <label className="summaryLabelHeader-long">
                                    Avg. Conn. Time (Day)(Min.)
                                </label>
                                <label className="summaryLabel" id="txtNetFlow">

                                </label>
                            </div>
                            <div className="form-group">
                                <label className="summaryLabelHeader-long">

                                </label>
                                <label className="summaryLabel" id="txtNetFlow">

                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="col-4">

                        <div className="group-inline">
                            <div className="form-group">
                                <label className="summaryLabelHeader-long">
                                    Run
                                </label>
                                <label className="summaryLabel" id="txtPositiveFlow">

                                </label>
                            </div>
                            <div className="form-group">
                                <label className="summaryLabelHeader-long">
                                    End Time
                                </label>
                                <label className="summaryLabel" id="txtNegativeFlow">

                                </label>
                            </div>
                            <div className="form-group">
                                <label className="summaryLabelHeader-long">
                                    Diff. (Min.)
                                </label>
                                <label className="summaryLabel" id="txtNetFlow">

                                </label>
                            </div>

                            <div className="form-group">
                                <label className="summaryLabelHeader-long">
                                    Fill up time (Min.)
                                </label>
                                <label className="summaryLabel" id="txtNetFlow">

                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>;
    }

}