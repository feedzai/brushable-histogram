import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { isEqual, isEmpty, isObject, partial } from "lodash";
import Button from "antd/es/button";
import { histogram as d3Histogram, max as d3Max, min as d3Min } from "d3-array";
import { scaleTime, scaleLinear } from "d3-scale";
import { event as d3Event, select as d3Select } from "d3-selection";
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from "d3-axis";
import { withSize } from "react-sizeme";
import { randomString, clearCanvas, drawRect, histogramDefaultYAxisFormatter, multiDateFormat } from "./utils";
import { zoom as d3Zoom, zoomIdentity as d3ZoomIdentity } from "d3-zoom";
import { brushX } from "d3-brush";

/**
 * Histogram
 *
 * Plots an histogram with zoom and brush features on the x domain.
 * Also plots a density strip plot for context when brushing and zoomin histogram.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com) ("productization" process)
 *
 */

// Constants

// We reserve some space for the x adn y axis ticks.
const X_AXIS_HEIGHT = 18;
const X_AXIS_PADDING = .02;
const Y_AXIS_PADDING = 3;
const BUTTON_PADDING = 20;

// We place as many ticks as a third of the number of bars, enough to give context and not overlap.
const BARS_TICK_RATIO = 3;

const BAR_TOOLTIP_ARROW_HEIGHT = 10;

const MIN_ZOOM_VALUE = 1;

const propTypes = {
    data: PropTypes.array.isRequired,
    size: PropTypes.shape({
        width: PropTypes.number.isRequired
    }).isRequired,
    height: PropTypes.number,
    padding: PropTypes.number,
    defaultBarCount: PropTypes.number,
    xAccessor: PropTypes.func.isRequired,
    xAxisFormatter: PropTypes.func,
    yAccessor: PropTypes.func.isRequired,
    spaceBetweenCharts: PropTypes.number,
    histogramHeightRatio: PropTypes.number,
    barOptions: PropTypes.object,
    yAxisTicks: PropTypes.number,
    yAxisFormatter: PropTypes.func,
    brushDensityChartColor: PropTypes.string,
    brushDensityChartFadedColor: PropTypes.string,
    tooltipBarCustomization: PropTypes.func,
    onIntervalChange: PropTypes.func,
    minZoomUnit: PropTypes.number,
    frameStep: PropTypes.number,
    frameDelay: PropTypes.number
};

const defaultProps = {
    data: [],
    height: 100,
    padding: 10,
    defaultBarCount: 18,
    histogramHeightRatio: 0.85,
    brushDensityChartHeightRatio: 0.15,
    barOptions: {
        margin: 1
    },
    spaceBetweenCharts: 10,
    yAxisTicks: 3,
    xAxisFormatter: multiDateFormat,
    yAxisFormatter: histogramDefaultYAxisFormatter,
    brushDensityChartColor: "rgba(33, 150, 243, 0.2)",
    brushDensityChartFadedColor: "rgba(176, 190, 197, 0.2)",
    tooltipBarCustomization: () => null,
    onIntervalChange: () => {},
    minZoomUnit: 1000,
    frameStep: 0.025,
    frameDelay: 500
};

export class Histogram extends PureComponent {
    /**
     * Receives the size the component should have, the padding and the how much vertical space the
     * histogram and the density plots should take and calculates the charts sizes and positions
     *
     * @param {Number} height
     * @param {Number} width
     * @param {Object} padding
     * @param {Number} histogramHeightRatio
     * @param {Number} densityHeightRatio
     * @returns {Object}
     * @private
     */
    static _calculateChartsPositionsAndSizing(height, width, padding, histogramHeightRatio, densityHeightRatio) {
        const playButtonPadding = (width > (padding + padding)) ? BUTTON_PADDING : 0;

        return {
            histogramChartDimensions: {
                width: (width - padding - padding),
                height: (height - padding - padding) * histogramHeightRatio
            },
            densityChartDimensions: {
                width: width - padding - padding - playButtonPadding,
                height: (height - padding - padding) * densityHeightRatio
            }
        };
    }

    state = {
        data: [],
        timeHistogramBars: [],
        width: 10,
        histogramChartDimensions: {},
        densityChartDimensions: {},
        brushDomain: {
            max: -1,
            min: -1
        },
        selectedBarPosition: {},
        showHistogramBarTooltip: false,
        play: false
    };

    static getDerivedStateFromProps(props, state) {
        const hasWidthChanges = props.size.width !== state.width;
        const hasInformationChanged = !isEqual(props.data, state.data);

        let nextState = {};

        if (hasWidthChanges) {
            const { histogramChartDimensions, densityChartDimensions } =
                Histogram._calculateChartsPositionsAndSizing(props.height, props.size.width, props.padding,
                    props.histogramHeightRatio, props.brushDensityChartHeightRatio);

            nextState = {
                ...nextState,
                width: props.size.width,
                histogramChartDimensions,
                densityChartDimensions
            };
        }

        // If the new information received is different we need to verify if there is any update in the max and min
        // values for the brush domain.
        if (hasInformationChanged) {

            // Setting the new Data
            nextState = { ...nextState, data: props.data };

            const min = d3Min(props.data, props.xAccessor);

            const max = d3Max(props.data, props.xAccessor);

            // If the brush domain changed we could
            if (state.brushDomain.min > min || state.brushDomain.max < max) {
                nextState = {
                    ...nextState,
                    brushDomain: {
                        min,
                        max
                    }
                };
            }
        }

        return !isEmpty(nextState) ? nextState : null;
    }

    componentDidMount() {
        this._initializeScales();
        this._initializeZoomAndBrush();

        this.densityChartCanvasContext = this.densityChartRef.getContext("2d");
    }

    componentDidUpdate(prevProps) {
        const hasWidthChanged = prevProps.size.width !== this.props.size.width;
        const hasDataChanged = prevProps.data.length !== this.state.data.length
            || !isEqual(prevProps.data, this.state.data);

        if ((hasWidthChanged || hasDataChanged)) {

            // Updates/initializes the x-axis and y-axis scales
            this._initializeScales();

            // Updates/initializes the zoom and brush
            this._initializeZoomAndBrush();
        }
    }

    /**
     * Handles resizing and zoom events. This functions triggers whenever a zoom or brush
     * action is performed on the histogram.
     * Sets new domain for histogram bar chart
     * Will call _updateHistogramScales after to set scales and then redraw plots.
     *
     * @private
     */
    _onResizeZoom = () => {
        if (d3Event.sourceEvent && d3Event.sourceEvent.type === "brush") {
            return;
        }

        const { transform } = d3Event;

        // We apply the zoom transformation to rescale densityChartScale.
        // Then we get the new domain, this is the new domain for the histogram x scale
        const brushedDomain = transform.rescaleX(this.densityChartXScale).domain();

        this._updateBrushedDomainAndReRenderTheHistogramPlot(brushedDomain);

        const brushSelection = brushedDomain.map(this.densityChartXScale);

        this._moveBrush(brushSelection);
    };

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

        const brushSelection = Array.isArray(d3Event.selection) ? d3Event.selection : this.densityChartXScale.range();

        const brushSelectionMin = brushSelection[0];
        const brushSelectionMax = brushSelection[1];

        // converts for a time-scale
        const brushedDomain = brushSelection.map(this.densityChartXScale.invert);

        d3Select(this.histogramChartRef).call(this.zoom.transform, d3ZoomIdentity
            .scale(this.state.densityChartDimensions.width / (brushSelectionMax - brushSelectionMin))
            .translate(-brushSelection[0], 0));

        this._updateBrushedDomainAndReRenderTheHistogramPlot(brushedDomain);
    };

    _onMouseEnterHistogramBar = (bar, evt) => {
        const hasInformation = isObject(bar);
        const nextState = {};

        nextState.showHistogramBarTooltip = hasInformation;

        if (isObject(bar)) {
            const barBoundingBox = evt.currentTarget.getBoundingClientRect();

            nextState.selectedBarPosition = {
                top: barBoundingBox.top,
                right: barBoundingBox.right,
                bottom: barBoundingBox.bottom,
                left: barBoundingBox.left,
                width: barBoundingBox.width,
                height: barBoundingBox.height
            };

            nextState.currentBar = bar;
        }

        this.setState(nextState);
    };

    /**
     * Handles click on play button. Defines start and end for
     * the domain-lapse and triggers _playLapse to play frames
     * at set intervals.
     *
     * @private
     */
    _onClickPlay = () => {
        const brushedMaxRange = this.densityChartXScale(this.state.brushDomain.max);
        const brushedMinRange = this.densityChartXScale(this.state.brushDomain.min);
        const frameStart = brushedMinRange;

        const playEnd = this.state.densityChartDimensions.width;
        const playStep = this.state.densityChartDimensions.width * this.props.frameStep;

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

    render() {
        // Histogram classNames
        const histogramChartClass = classnames("fdz-css-graph-histogram");
        const histogramXAxisClassname = classnames("fdz-js-graph-histogram-axis-x", "fdz-css-graph-histogram-axis-x");
        const histogramYAxisClassname = classnames("fdz-js-graph-histogram-axis-y", "fdz-css-graph-histogram-axis-y");

        const histogramXAxiosYPosition = (this.props.height * this.props.histogramHeightRatio) - X_AXIS_HEIGHT;
        const densityChartCanvasStyle = { top: this.props.spaceBetweenCharts };

        return (
            <div className={histogramChartClass}>
                {this.state.showHistogramBarTooltip ? this._renderBarTooltip(this.state.currentBar) : null }
                <svg
                    ref={(ref) => this.histogramChartRef = ref}
                    className="fdz-js-graph-histogram"
                    width={this.props.size.width}
                    height={this.props.height - Y_AXIS_PADDING}
                    transform={`translate(${2 * this.props.padding}, ${this.props.padding})`}
                >
                    {/* Rendering the histogram bars */}
                    <g className="fdz-css-graph-histogram-bars">
                        {this._renderHistogramBars(this.state.timeHistogramBars)}
                    </g>

                    {/* Rendering the histogram x-axis */}
                    <g ref={(ref) => this.histogramXAxisRef = ref}
                        className={histogramXAxisClassname}
                        transform={`translate(0, ${histogramXAxiosYPosition})`}
                    />

                    {/* Rendering the histogram y-axis */}
                    <g ref={(ref) => this.histogramYAxisRef = ref}
                        className={histogramYAxisClassname}
                        transform={`translate(${Y_AXIS_PADDING}, ${Y_AXIS_PADDING})`}
                    />
                </svg>
                <div className="fdz-css-graph-histogram-density__wrapper" >
                    {this._renderPlayButton()}
                    <div className="fdz-css-graph-histogram-density">
                        <canvas
                            ref={(ref) => this.densityChartRef = ref}
                            className="fdz-css-graph-histogram-density__canvas"
                            width={this.state.densityChartDimensions.width}
                            height={this.state.densityChartDimensions.height}
                            style={densityChartCanvasStyle}
                        />
                        <svg
                            ref={(ref) => this.densityBrushRef = ref}
                            className="fdz-css-graph-histogram-brush"
                            width={this.state.densityChartDimensions.width}
                            height={this.state.densityChartDimensions.height}
                            transform={`translate(0, -${this.state.densityChartDimensions.height})`}
                        />
                    </div>
                </div>
            </div>
        );
    }

    _renderPlayButton() {
        if (this.props.data.length <= 0) {
            return null;
        }

        const buttonProps = {
            icon: this.state.play ? "pause-circle" : "play-circle",
            onClick: this.state.play ? this._onClickStop : this._onClickPlay
        };

        return <Button {...buttonProps} className="fdz-css-play-btn"/>;
    }

    /**
     * Renders histogram bars from array of histogram bins.
     *
     * @param {Array} timeHistogramBars
     * @returns {Array.<React.Element>|null}
     * @private
     */
    _renderHistogramBars(timeHistogramBars) {
        if (!isEmpty(timeHistogramBars)) {
            return timeHistogramBars.map((bar) => {
                const barWidth = this.histogramChartXScale(bar.x1)
                    - this.histogramChartXScale(bar.x0) - this.props.barOptions.margin;
                const barHeight = this.state.histogramChartDimensions.height - this.histogramChartYScale(bar.yValue);


                if (barWidth <= 0) {
                    return null;
                }

                const barX = this.histogramChartXScale(bar.x0) + this.props.barOptions.margin / 2;
                const barY = this.histogramChartYScale(bar.yValue);

                return (
                    <rect
                        key={`histogram-bin-${randomString()}`}
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        onMouseEnter={partial(this._onMouseEnterHistogramBar, bar)}
                        onMouseLeave={partial(this._onMouseEnterHistogramBar, null)}
                    />
                );
            });
        }

        return null;
    }

    /**
     * This function will render the X and Y axis. This means it will set their scales
     * as well as how many ticks, their respective positions and how their text should
     * be formatted.
     *
     * @private
     */
    _renderHistogramAxis() {
        const histogramXAxisScale = scaleTime()
            .domain([
                this.histogramChartXScale.invert(0),
                this.histogramChartXScale.invert(this.state.histogramChartDimensions.width)
            ])
            .range([0, this.state.histogramChartDimensions.width]);

        // Setting the x-axis histogram representation.
        const histogramXAxis = d3AxisBottom(histogramXAxisScale)
            .tickValues(this.histogramChartXScale.ticks(this.props.defaultBarCount / BARS_TICK_RATIO))
            .tickFormat(this.props.xAxisFormatter);

        d3Select(this.histogramXAxisRef)
            .call(histogramXAxis);

        const histogramYAxis = d3AxisLeft(this.histogramChartYScale)
            .ticks(this.props.yAxisTicks)
            .tickSize(0)
            .tickFormat(this.props.yAxisFormatter);

        d3Select(this.histogramYAxisRef)
            .call(histogramYAxis);
    }

    /**
     * Draws density strip plot in canvas.
     * (Using canvas instead of svg for performance reasons as number of datapoints
     * can be very large)
     *
     * @private
     */
    _renderDensityChart() {
        clearCanvas(this.densityChartCanvasContext, this.state.densityChartDimensions.width,
            this.state.densityChartDimensions.height);

        for (let i = 0; i < this.state.data.length; ++i) {
            const x = this.props.xAccessor(this.state.data[i]);
            const isInsideOfBrushDomain = x >= this.state.brushDomain.min && x < this.state.brushDomain.max;

            drawRect(
                this.densityChartCanvasContext, // canvas context
                this.densityChartXScale(x), // x
                0, // y
                2, // width
                this.state.densityChartDimensions.height, // height
                {
                    fillStyle: isInsideOfBrushDomain
                        ? this.props.brushDensityChartColor
                        : this.props.brushDensityChartFadedColor
                }
            );
        }
    }

    /**
     * Renders tooltip corresponding to an histogram bin.
     * Receives an object with all the data of the bin and gets corresponding
     * bar element. Then calls the prop function histogramBarTooltipFormatter
     * to get the tooltip element to be rendered. Updates states with this element
     * and toggles showHistogramBarTooltip.
     *
     * @param {Object} currentBar
     * @private
     */

    _renderBarTooltip(currentBar) {
        const tooltipStyle = {
            position: "fixed",
            left: `${this.state.selectedBarPosition.left + this.state.selectedBarPosition.width / 2}px`,
            top: `${this.state.selectedBarPosition.top - BAR_TOOLTIP_ARROW_HEIGHT}px`
        };
        const tooltipElement = this.props.tooltipBarCustomization(currentBar);

        if (!isObject(tooltipElement)) {
            return null;
        }

        return (
            <div
                className="fdz-css-graph-histogram-bars--tooltip"
                style={tooltipStyle}
            >
                {tooltipElement}
            </div>
        );
    }

    /**
     * Check if brushed domain changed and if so, updates the component state
     * and calls prop function for interval change.
     *
     * @param {Array<Number>} brushedDomain
     * @private
     */
    _updateBrushedDomainAndReRenderTheHistogramPlot(brushedDomain){
        if (brushedDomain[0] !== this.state.brushDomain.min
            && brushedDomain[1] !== this.state.brushDomain.max){

            this.setState({
                brushDomain: {
                    min: brushedDomain[0],
                    max: brushedDomain[1]
                },
                showHistogramBarTooltip: false
            }, this._updateHistogramChartScales);

            const fullDomain = this.densityChartXScale.domain();
            const isFullDomain = fullDomain[0].getTime() === brushedDomain[0].getTime()
                && fullDomain[1].getTime() === brushedDomain[1].getTime();

            this.props.onIntervalChange([
                brushedDomain[0].getTime(),
                brushedDomain[1].getTime()
            ], isFullDomain);
        }
    }

    /**
     * Creates the zoom in the histogram chart and brush slider on the density chart
     * using respective functions from d3.
     * This function is called after component mounts.

     * @private
     */
    _initializeZoomAndBrush() {
        // max zoom is the ratio of the initial domain extent to the minimum unit we want to zoom to.
        const MAX_ZOOM_VALUE = (this.state.brushDomain.max - this.state.brushDomain.min) / this.props.minZoomUnit;

        this.zoom = d3Zoom()
            .scaleExtent([MIN_ZOOM_VALUE, MAX_ZOOM_VALUE])
            .translateExtent([
                [0, 0],
                [this.state.histogramChartDimensions.width, this.state.histogramChartDimensions.height]
            ])
            .extent([
                [0, 0],
                [this.state.histogramChartDimensions.width, this.state.histogramChartDimensions.height]
            ])
            .on("zoom", this._onResizeZoom);

        d3Select(this.histogramChartRef).call(this.zoom);

        this.brush = brushX()
            .extent([
                [0, 0],
                [this.state.densityChartDimensions.width, this.state.densityChartDimensions.height]
            ])
            .on("brush end", this._onResizeBrush);


        d3Select(this.densityBrushRef)
            .call(this.brush);

        this._moveBrush(this.densityChartXScale.range());
    }

    /**
     * Defines X scale for density chart and calls function to update X and Y scales fot histogram bar chart
     *
     * @private
     */
    _initializeScales() {
        this.densityChartXScale = scaleTime()
            .domain([ this.state.brushDomain.min, this.state.brushDomain.max])
            .range([ 0, this.state.densityChartDimensions.width ]);

        this._updateHistogramChartScales();
    }

    /**
     * Moves brush on density strip plot to given domain
     * @private
     * @param {Array<Number>} domain
     */
    _moveBrush(domain) {
        d3Select(".fdz-css-graph-histogram-brush")
            .call(this.brush.move, domain);
    }

    /**
     * Defines X and Y scale for histogram bar chart and creates bins for histogram
     * Checks if plot is timebased and sets X axis accordingly.
     *
     * @private
     */
    _updateHistogramChartScales() {
        this.histogramChartXScale = scaleTime();

        // Setting the histogram x-axis domain scale
        this.histogramChartXScale
            .domain([ this.state.brushDomain.min, this.state.brushDomain.max ])
            .range([
                this.state.histogramChartDimensions.width * X_AXIS_PADDING,
                this.state.histogramChartDimensions.width * (1 - X_AXIS_PADDING)
            ])
            .nice(this.props.defaultBarCount);

        // Setting the histogram function/converter
        const histogram = d3Histogram()
            .value(this.props.xAccessor)
            .domain(this.histogramChartXScale.domain()) // using the x-axis domain
            .thresholds(this.histogramChartXScale.ticks(this.props.defaultBarCount));

        // Calculating the time histogram bins
        const timeHistogramBars = histogram(this.state.data).map((bar) => {
            const yValue = bar.reduce((sum, curr) => sum + this.props.yAccessor(curr), 0);

            return { ...bar, yValue };
        });

        // Setting the histogram y-axis domain scale
        this.histogramChartYScale = scaleLinear()
            .domain([0, d3Max(timeHistogramBars, (bin) => bin.yValue)])
            .range([this.state.histogramChartDimensions.height, 0]);

        this.setState({
            timeHistogramBars
        }, () => {
            this._renderHistogramAxis();
            this._renderDensityChart();
        });
    }

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
}

Histogram.propTypes = propTypes;
Histogram.defaultProps = defaultProps;

export default withSize()(Histogram);
