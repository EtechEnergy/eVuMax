import React from 'react';
import * as d3 from 'd3';


export interface Props {
    width: number;
    height: number;
}

export default class LineChart extends React.Component<Props, {}> {

    render() {
        d3.select("svg")
            .append("circle")
            .attr("r", 5)
            .attr("cx", this.props.width / 2)
            .attr("cy", this.props.height / 2)
            .attr("fill", "red");

        return (
            <svg className="container" width={this.props.width} height={this.props.height}>
            </svg>
        );
    }

}