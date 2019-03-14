import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import PlayButton from "./PlayButton";
import { event as d3Event, select as d3Select } from "d3-selection";
import {
    clearCanvas,
    drawRect,
    getRenderContext
} from "../canvasRenderUtils";
import {
    havePropsChanged
} from "../utils";
import { brushX } from "d3-brush";

/**
 * DensityChart
 *
 * Plots a density strip plot for context when brushing and zooming the histogram.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

export default class DensityChart extends PureComponent {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        padding: PropTypes.number.isRequired,
        overallTimeDomainMax: PropTypes.number,
        brushDomainMin: PropTypes.number.isRequired,
        brushDomainMax: PropTypes.number.isRequired,
        densityChartXScale: PropTypes.func.isRequired,
        onDomainChanged: PropTypes.func.isRequired,
        xAccessor: PropTypes.func.isRequired,
        frameStep: PropTypes.number,
        frameDelay: PropTypes.number,
        brushDensityChartColor: PropTypes.string,
        brushDensityChartFadedColor: PropTypes.string,
        renderPlayButton: PropTypes.bool
    };

    static defaultProps = {
        renderPlayButton: true,
        overallTimeDomainMax: -Infinity,
        brushDensityChartColor: "rgba(33, 150, 243, 0.2)",
        brushDensityChartFadedColor: "rgba(176, 190, 197, 0.2)"
    };

    constructor(props) {
        super(props);

        this.densityChartRef = React.createRef();
        this.densityBrushRef = React.createRef();
    }

    componentDidMount() {
        this.densityChartCanvasContext = getRenderContext(this.densityChartRef.current);

        const { width, height, densityChartXScale } = this.props;

        this.brush = brushX()
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("brush end", this._onResizeBrush);

        this._updateBrush();

        this._moveBrush(densityChartXScale.range());

        this._drawDensityChart();
    }

    componentDidUpdate(prevProps) {
        let min = this.props.brushDomainMin;
        let max = this.props.brushDomainMax;

        const { densityChartXScale, width, height } = this.props;

        if (max >= this.props.overallTimeDomainMax) {
            const delta = this.props.brushDomainMax - this.props.brushDomainMin;

            min = this.props.overallTimeDomainMax - delta;
            max = this.props.overallTimeDomainMax;
        }

        // We need to resize the max value of the brush when the screen has resized
        if (prevProps.width !== width || prevProps.height !== height) {
            this.brush
                .extent([
                    [0, 0],
                    [width, height]
                ]);
        }

        this._updateBrush();

        this._moveBrush([
            densityChartXScale(min),
            densityChartXScale(max)
        ]);

        // We only need to re-render the density chart if the data, the weight, the height or
        // the chart x scale have changed.
        if (this._shouldRedrawDensityChart(prevProps)) {
            this._drawDensityChart();
        }
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

        const event = this._getD3Event();

        if (event.sourceEvent && event.sourceEvent.type === "zoom") {
            return;
        }

        let brushSelection;

        if (Array.isArray(event.selection)) {
            brushSelection = event.selection;
        } else {
            // When we don't have any selection we should select everything
            brushSelection = this.props.densityChartXScale.range();
        }

        this.props.onDomainChanged(brushSelection);
    };

    /**
     * Returns the D3 event object
     *
     * Used for stubbing in tests.
     *
     * @returns {Object|null}
     */
    _getD3Event() {
        return d3Event;
    }

    /**
     * Reapplies the brush
     * @private
     */
    _updateBrush() {
        if (this.props.data.length === 0) {
            return;
        }

        d3Select(this.densityBrushRef.current)
            .call(this.brush);
    }

    /**
     * Moves brush on density strip plot to given domain
     * @private
     * @param {Array<Number>} domain
     */
    _moveBrush = (domain) => {
        if (this.props.data.length === 0) {
            return;
        }

        d3Select(this.densityBrushRef.current)
            .call(this.brush.move, domain);
    };

    /**
     * Returns whenever it is necessary to re-render the density chart, based on the current and previous
     * props.
     * @param {Object} prevProps
     * @returns {boolean}
     */
    _shouldRedrawDensityChart(prevProps) {
        return havePropsChanged(this.props, prevProps, [
            "brushDomainMin",
            "brushDomainMax",
            "data",
            "width",
            "height",
            "densityChartXScale"
        ]);
    }

    /**
     * Draws density strip plot in canvas.
     * (Using canvas instead of svg for performance reasons as number of datapoints
     * can be very large)
     *
     * @private
     */
    _drawDensityChart() {
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

    /**
     * Renders the play button that allows to replay a time-lapse of the events.
     * @returns {React.Element|null}
     */
    _renderPlayButton() {
        const { width, densityChartXScale, brushDomainMax, brushDomainMin,
            frameStep, frameDelay, renderPlayButton } = this.props;

        if (!renderPlayButton) {
            return null;
        }

        return (
            <PlayButton
                width={width}
                densityChartXScale={densityChartXScale}
                brushDomainMin={brushDomainMin}
                brushDomainMax={brushDomainMax}
                frameStep={frameStep}
                frameDelay={frameDelay}
                moveBrush={this._moveBrush}
            />
        );
    }

    render() {
        let leftPadding = 0;

        const { width, height, padding } = this.props;

        if (!this.props.renderPlayButton) {
            leftPadding = padding * 2;
        }

        const densityChartCanvasStyle = { left: leftPadding };

        return (
            <div className="fdz-css-graph-histogram-density__wrapper" >
                {this._renderPlayButton()}
                <div className="fdz-css-graph-histogram-density" style={{ position: "relative" }}>
                    <canvas
                        ref={this.densityChartRef}
                        className="fdz-css-graph-histogram-density__canvas"
                        width={width}
                        height={height}
                        style={densityChartCanvasStyle}
                        aria-label="Density Chart"
                    />
                    <svg
                        ref={this.densityBrushRef}
                        className="fdz-css-graph-histogram-brush"
                        width={width}
                        height={height}
                        style={{ position: "absolute", left: leftPadding, top: 0 }}
                        alt="Density Chart Brush"
                    />
                </div>
            </div>
        );
    }
}
