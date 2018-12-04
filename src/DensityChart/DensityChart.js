import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Button from "antd/es/button";
import { event as d3Event, select as d3Select } from "d3-selection";
import {
    clearCanvas,
    drawRect
} from "../utils";
import { brushX } from "d3-brush";

export default class DensityChart extends PureComponent {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
        spaceBetweenCharts: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        brushDomainMax: PropTypes.number.isRequired,
        brushDomainMin: PropTypes.number.isRequired,
        frameStep: PropTypes.number.isRequired,
        frameDelay: PropTypes.number.isRequired,
        densityChartXScale: PropTypes.func.isRequired,
        xAccessor: PropTypes.func.isRequired,
        brushDensityChartColor: PropTypes.string,
        brushDensityChartFadedColor: PropTypes.string,
        renderPlayButton: PropTypes.bool
    };

    static defaultProps = {
        renderPlayButton: true,
        brushDensityChartColor: "rgba(33, 150, 243, 0.2)",
        brushDensityChartFadedColor: "rgba(176, 190, 197, 0.2)"
    };

    state = {
        play: false
    };

    constructor(props) {
        super(props);

        this.densityChartRef = React.createRef();
        this.densityBrushRef = React.createRef();
    }

    componentDidMount() {
        this.densityChartCanvasContext = this.densityChartRef.current.getContext("2d");

        const { width, height, densityChartXScale } = this.props;

        this.brush = brushX()
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("brush end", this._onResizeBrush);

        this._updateBrush();

        this._moveBrush(densityChartXScale.range());

        this._renderDensityChart();
    }

    componentDidUpdate() {
        this._updateBrush();

        this._renderDensityChart();
    }

    componentWillUnmount() {
        clearInterval(this.playInterval);
        this.brush.on("brush end", null); // This is the way to unbind events in d3
    }

    /**
     * Handles brush events. It will update this.state.brushedDomain according to the
     * transformation on the event.
     *
     * @private
     */
    _onResizeBrush = () => {
        // This occurs always when the user change the brush domain manually
        if (d3Event.sourceEvent && d3Event.sourceEvent.type === "zoom") {
            return;
        }

        let brushSelection;

        if (Array.isArray(d3Event.selection)) {
            brushSelection = d3Event.selection;
        } else {
            // When we don't have any selection we should select everything
            brushSelection = this.props.densityChartXScale.range();
            this._moveBrush(brushSelection);
        }

        this.props.onDomainChanged(brushSelection);
    };

    /**
     * Handles click on play button. Defines start and end for
     * the domain-lapse and triggers _playLapse to play frames
     * at set intervals.
     *
     * @private
     */
    _onClickPlay = () => {
        const { width, densityChartXScale, brushDomainMax, brushDomainMin, frameStep } = this.props;
        const brushedMaxRange = densityChartXScale(brushDomainMax);
        const brushedMinRange = densityChartXScale(brushDomainMin);
        const frameStart = brushedMinRange;

        const playEnd = width;
        const playStep = width * frameStep;

        this.frameEnd = frameStart;

        if (brushedMaxRange === playEnd || brushedMaxRange === frameStart){
            this.frameEnd = frameStart;
        } else {
            this.frameEnd = brushedMaxRange;
        }

        this.setState({
            play: true
        }, () => this._playLapseAtInterval(frameStart, playEnd, playStep));
    };

    /**
     * Handles click on stop button. Will clear interval
     * of funtion playInterval playing domain-lapse frames
     *
     * @private
     */
    _onClickStop = () => {
        this._stopLapse();
    };

    _updateBrush() {
        d3Select(this.densityBrushRef.current)
            .call(this.brush);
    }

    /**
     * Moves brush on density strip plot to given domain
     * @private
     * @param {Array<Number>} domain
     */
    _moveBrush = (domain) => {
        d3Select(this.densityBrushRef.current)
            .call(this.brush.move, domain);
    };

    /**
     * Plays a frame of the domain-lapse. Updates subset of domain
     * to be displayed and moves brush to new domain.
     *
     * @param {Number} start
     * @param {Number} end
     * @param {Number} step
     * @private
     */
    _playFrame(start, end, step){
        // If end of frame is at end of play region then stop domain-lapse

        if (this.frameEnd >= end) {
            this._stopLapse();
            return;
        }

        // Check if adding a step will surprass max domain.
        if (this.frameEnd + step >= end) {
            // If so, set max frame to be max domain
            this.frameEnd = end;
        } else {
            // Otherwise just add a step
            this.frameEnd += step;
        }
        const domain = [start, this.frameEnd];

        // Move brush to new frame location
        this._moveBrush(domain);
    }

    /**
     * Plays domain-lapse by calling _playFrame at interval
     * to play each frame.
     *
     * @param {Number} start
     * @param {Number} end
     * @param {Number} step
     * @private
     */
    _playLapseAtInterval(start, end, step){
        this.playInterval = setInterval(() => {
            this._playFrame(start, end, step);
        }, this.props.frameDelay);
    }

    /**
     *  Stops domain-lapse at current frame. This
     * is done by clearing the timeInterval in this.playInterval.
     *
     * @private
     */
    _stopLapse() {
        this.setState({
            play: false
        }, () => clearInterval(this.playInterval));
    }

    _renderPlayButton() {
        if (!this.props.renderPlayButton) {
            return null;
        }

        const buttonProps = {
            icon: this.state.play ? "pause-circle" : "play-circle",
            onClick: this.state.play ? this._onClickStop : this._onClickPlay
        };

        return <Button {...buttonProps} className="fdz-css-play-btn"/>;
    }

    /**
     * Draws density strip plot in canvas.
     * (Using canvas instead of svg for performance reasons as number of datapoints
     * can be very large)
     *
     * @private
     */
    _renderDensityChart() {
        const {
            width,
            height,
            densityChartXScale,
            brushDomainMax,
            brushDomainMin,
            xAccessor,
            data,
            brushDensityChartColor,
            brushDensityChartFadedColor
        } = this.props;

        clearCanvas(this.densityChartCanvasContext, width, height);

        for (let i = 0; i < data.length; ++i) {
            const x = xAccessor(data[i]);
            const isInsideOfBrushDomain = x >= brushDomainMin && x < brushDomainMax;

            drawRect(
                this.densityChartCanvasContext, // canvas context
                densityChartXScale(x), // x
                0, // y
                2, // width
                height, // height
                {
                    fillStyle: isInsideOfBrushDomain ? brushDensityChartColor : brushDensityChartFadedColor
                }
            );
        }
    }

    render() {
        const { width, height, spaceBetweenCharts } = this.props;
        const densityChartCanvasStyle = { top: spaceBetweenCharts };

        return (<div className="fdz-css-graph-histogram-density__wrapper" >
            {this._renderPlayButton()}
            <div className="fdz-css-graph-histogram-density">
                <canvas
                    ref={this.densityChartRef}
                    className="fdz-css-graph-histogram-density__canvas"
                    width={width}
                    height={height}
                    style={densityChartCanvasStyle}
                />
                <svg
                    ref={this.densityBrushRef}
                    className="fdz-css-graph-histogram-brush"
                    width={width}
                    height={height}
                    transform={`translate(0, -${height})`}
                />
            </div>
        </div>);
    }
}
