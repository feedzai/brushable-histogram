import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import PlayButton from "./PlayButton";
import { event as d3Event, select as d3Select } from "d3-selection";
import {
    clearCanvas,
    drawRect,
    getRenderContext
} from "../canvasRenderUtils";
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
        brushDomainMax: PropTypes.number.isRequired,
        brushDomainMin: PropTypes.number.isRequired,
        frameStep: PropTypes.number.isRequired,
        frameDelay: PropTypes.number.isRequired,
        densityChartXScale: PropTypes.func.isRequired,
        onDomainChanged: PropTypes.func.isRequired,
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

    componentDidUpdate() {
        const { brushDomainMin, brushDomainMax, densityChartXScale } = this.props;

        this._updateBrush();

        this._moveBrush([densityChartXScale(brushDomainMin), densityChartXScale(brushDomainMax)]);

        this._drawDensityChart();
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
     * Reapplies the brush
     * @private
     */
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
        if (!this.props.renderPlayButton) {
            return null;
        }

        const { width, densityChartXScale, brushDomainMax, brushDomainMin, frameStep, frameDelay } = this.props;

        return (<PlayButton
            width={width}
            densityChartXScale={densityChartXScale}
            brushDomainMax={brushDomainMax}
            brushDomainMin={brushDomainMin}
            frameStep={frameStep}
            frameDelay={frameDelay}
            moveBrush={this._moveBrush}
        />);
    }

    render() {
        let leftPadding = 0;

        const { width, height, padding } = this.props;

        if (!this.props.renderPlayButton) {
            leftPadding = padding * 2;
        }

        const densityChartCanvasStyle = { left: leftPadding };

        return (<div className="fdz-css-graph-histogram-density__wrapper" >
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
        </div>);
    }
}
