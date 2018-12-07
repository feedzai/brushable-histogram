import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { histogram as d3Histogram, max as d3Max } from "d3-array";
import { scaleTime, scaleLinear } from "d3-scale";
import { event as d3Event, select as d3Select } from "d3-selection";
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from "d3-axis";
import { withSize } from "react-sizeme";
import {
    histogramDefaultYAxisFormatter,
    multiDateFormat,
    isHistogramDataEqual,
    dateToTimestamp,
    calculateChartSizesAndDomain
} from "./utils";
import {
    X_AXIS_PADDING,
    Y_AXIS_PADDING,
    BARS_TICK_RATIO,
    BAR_TOOLTIP_ARROW_HEIGHT,
    MIN_ZOOM_VALUE,
    MIN_TOTAL_HEIGHT,
    PADDING
} from "./constants";
import { zoom as d3Zoom, zoomIdentity as d3ZoomIdentity } from "d3-zoom";
import DensityChart from "./DensityChart/DensityChart";

/**
 * Histogram
 *
 * Plots an histogram with zoom and brush features on the x domain.
 * Also plots a density strip plot for context when brushing and zooming the histogram.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com) ("productization" process)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

export class Histogram extends PureComponent {

    static propTypes = {
        data: PropTypes.array.isRequired,
        size: PropTypes.shape({
            width: PropTypes.number.isRequired
        }).isRequired,
        defaultBarCount: PropTypes.number,
        xAccessor: PropTypes.func.isRequired,
        xAxisFormatter: PropTypes.func,
        yAccessor: PropTypes.func.isRequired,
        spaceBetweenCharts: PropTypes.number,
        barOptions: PropTypes.object,
        yAxisTicks: PropTypes.number,
        yAxisFormatter: PropTypes.func,
        brushDensityChartColor: PropTypes.string,
        brushDensityChartFadedColor: PropTypes.string,
        tooltipBarCustomization: PropTypes.func,
        onIntervalChange: PropTypes.func,
        minZoomUnit: PropTypes.number,
        frameStep: PropTypes.number,
        frameDelay: PropTypes.number,
        renderPlayButton: PropTypes.bool
    };

    static defaultProps = {
        data: [],
        height: MIN_TOTAL_HEIGHT,
        padding: 10,
        defaultBarCount: 18,
        barOptions: {
            margin: 1
        },
        spaceBetweenCharts: 10,
        yAxisTicks: 3,
        xAxisFormatter: multiDateFormat,
        yAxisFormatter: histogramDefaultYAxisFormatter,
        tooltipBarCustomization: null,
        onIntervalChange: () => {},
        minZoomUnit: 1000,
        renderPlayButton: true
    }

    static getDerivedStateFromProps(props, state) {
        if (props.height < MIN_TOTAL_HEIGHT) {
            throw new Error(`The minimum height is ${MIN_TOTAL_HEIGHT}px.`);
        }

        const nextState = calculateChartSizesAndDomain(props, state.data, state.brushDomain);

        return Object.keys(nextState).length > 0 ? nextState : null;
    }

    constructor(props) {
        super(props);

        this.histogramChartRef = React.createRef();
        this.histogramXAxisRef = React.createRef();
        this.histogramYAxisRef = React.createRef();

        // We need to compute the widths and domain right at the constructor because we
        // need them to compute the scales correctly, which are needed in the children
        this.state = Object.assign({
            timeHistogramBars: [],
            selectedBarPosition: {},
            showHistogramBarTooltip: false
        }, calculateChartSizesAndDomain(props, [], {
            max: -Infinity,
            min: Infinity
        }));

        this._createScaleAndZoom();
    }

    componentDidMount() {
        this._setUpZoomAndChartScales();
    }

    componentDidUpdate(prevProps) {
        const hasWidthChanged = prevProps.size.width !== this.props.size.width;
        const hasDataChanged = prevProps.data.length !== this.props.data.length
            || !isHistogramDataEqual(this.props.xAccessor, this.props.yAccessor, prevProps.data, this.props.data);

        if ((hasWidthChanged || hasDataChanged)) {
            this._createScaleAndZoom();
            this._setUpZoomAndChartScales();
        }
    }

    componentWillUnmount() {
        this.zoom.on("zoom", null); // This is the way to unbind events in d3
    }

    /**
     * Handles a domain change in the density chart.
     *
     * @param {Array} brushSelection
     * @private
     */
    _onDensityChartDomainChanged = (brushSelection) => {
        const brushSelectionMin = brushSelection[0];
        const brushSelectionMax = brushSelection[1];

        // converts for a time-scale
        const brushedDomain = brushSelection.map(this.densityChartXScale.invert);

        d3Select(this.histogramChartRef.current).call(this.zoom.transform, d3ZoomIdentity
            .scale(this.state.densityChartDimensions.width / (brushSelectionMax - brushSelectionMin))
            .translate(-brushSelection[0], 0));

        this._updateBrushedDomainAndReRenderTheHistogramPlot(brushedDomain);
    };

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
    };

    /**
     * Handles the mouse entering an histogram bar.
     *
     * @param {Object} evt
     * @private
     */
    _onMouseEnterHistogramBar = (evt) => {
        const index = +evt.currentTarget.getAttribute("dataindex"); // The `+` converts "1" to 1
        const bar = this.state.timeHistogramBars[index];

        this.setState({
            showHistogramBarTooltip: true,
            currentBar: bar,
            selectedBarPosition: evt.currentTarget.getBoundingClientRect()
        });
    };

    /**
     * Handles the mouse leaving an histogram bar.
     * @private
     */
    _onMouseLeaveHistogramBar = () => {
        this.setState({
            showHistogramBarTooltip: false
        });
    };

    /**
     * Creates the density chart x axis scale and the histogram zoom.
     * @private
     */
    _createScaleAndZoom() {
        this.densityChartXScale = scaleTime()
            .domain([ this.state.brushDomain.min, this.state.brushDomain.max])
            .range([ 0, this.state.densityChartDimensions.width ]);

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
    }

    /**
     * Sets up the zoom and the chart scales.
     * @private
     */
    _setUpZoomAndChartScales() {
        d3Select(this.histogramChartRef.current).call(this.zoom);

        this._updateHistogramChartScales();
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
        const timeHistogramBars = histogram(this.props.data).map((bar) => {
            const yValue = bar.reduce((sum, curr) => sum + this.props.yAccessor(curr), 0);

            return { ...bar, yValue };
        });

        // Setting the histogram y-axis domain scale
        this.histogramChartYScale = scaleLinear()
            .domain([0, d3Max(timeHistogramBars, (bin) => bin.yValue)])
            .range([this.state.histogramChartDimensions.heightForBars, 0]);

        this.setState({
            timeHistogramBars
        }, () => {
            this._renderHistogramAxis();
        });
    }

    /**
     * Renders histogram bars from array of histogram bins.
     *
     * @param {Array} timeHistogramBars
     * @returns {Array.<React.Element>|null}
     * @private
     */
    _renderHistogramBars(timeHistogramBars) {
        return timeHistogramBars.map((bar, index) => {
            const barWidth = this.histogramChartXScale(bar.x1)
                - this.histogramChartXScale(bar.x0) - this.props.barOptions.margin;
            const barHeight = this.state.histogramChartDimensions.heightForBars - this.histogramChartYScale(bar.yValue);

            if (barWidth <= 0) {
                return null;
            }

            const barX = this.histogramChartXScale(bar.x0) + this.props.barOptions.margin / 2;
            const barY = this.histogramChartYScale(bar.yValue);

            let onMouseEnter = this._onMouseEnterHistogramBar;
            let onMouseLeave = this._onMouseLeaveHistogramBar;

            // If there is no tooltip we don't need the mouse enter and leave handlers
            if (typeof this.props.tooltipBarCustomization === "function" === false) {
                onMouseEnter = null;
                onMouseLeave = null;
            }

            return (
                <rect
                    key={`histogram-bin-${bar.x0.getTime()}`}
                    dataindex={index}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                />
            );
        });
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

        d3Select(this.histogramXAxisRef.current)
            .call(histogramXAxis);

        const histogramYAxis = d3AxisLeft(this.histogramChartYScale)
            .ticks(this.props.yAxisTicks)
            .tickSize(0)
            .tickFormat(this.props.yAxisFormatter);

        d3Select(this.histogramYAxisRef.current)
            .call(histogramYAxis);
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

        if (typeof this.props.tooltipBarCustomization === "function" === false) {
            return null;
        }

        const tooltipElement = this.props.tooltipBarCustomization(currentBar);

        return (
            <div
                className="fdz-css-graph-histogram-bars--tooltip"
                style={tooltipStyle}
            >
                {tooltipElement}
            </div>
        );
    }

    render() {
        // Histogram classNames
        const histogramXAxisClassname = "fdz-js-graph-histogram-axis-x fdz-css-graph-histogram-axis-x";
        const histogramYAxisClassname = "fdz-js-graph-histogram-axis-y fdz-css-graph-histogram-axis-y";

        return (
            <div className="fdz-css-graph-histogram">
                {this.state.showHistogramBarTooltip ? this._renderBarTooltip(this.state.currentBar) : null }
                <svg
                    ref={this.histogramChartRef}
                    className="fdz-js-graph-histogram fdz-css-graph-histogram-chart"
                    width={this.props.size.width}
                    height={this.state.histogramChartDimensions.height}
                    style={{
                        marginBottom: this.props.spaceBetweenCharts
                    }}
                >
                    {/* Rendering the histogram bars */}
                    <g className="fdz-css-graph-histogram-bars">
                        {this._renderHistogramBars(this.state.timeHistogramBars)}
                    </g>

                    {/* Rendering the histogram x-axis */}
                    <g ref={this.histogramXAxisRef}
                        className={histogramXAxisClassname}
                        transform={`translate(0, ${this.state.histogramChartDimensions.heightForBars})`}
                    />

                    {/* Rendering the histogram y-axis */}
                    <g ref={this.histogramYAxisRef}
                        className={histogramYAxisClassname}
                        transform={`translate(${Y_AXIS_PADDING}, ${Y_AXIS_PADDING})`}
                    />
                </svg>

                <DensityChart
                    width={this.state.densityChartDimensions.width}
                    height={this.state.densityChartDimensions.height}
                    padding={PADDING}
                    brushDomainMax={dateToTimestamp(this.state.brushDomain.max)}
                    brushDomainMin={dateToTimestamp(this.state.brushDomain.min)}
                    frameStep={this.props.frameStep}
                    frameDelay={this.props.frameDelay}
                    xAccessor={this.props.xAccessor}
                    spaceBetweenCharts={this.props.spaceBetweenCharts}
                    brushDensityChartColor={this.props.brushDensityChartColor}
                    brushDensityChartFadedColor={this.props.brushDensityChartFadedColor}
                    densityChartXScale={this.densityChartXScale}
                    renderPlayButton={this.props.renderPlayButton && this.props.data.length > 0}
                    data={this.props.data}
                    onDomainChanged={this._onDensityChartDomainChanged}
                />
            </div>
        );
    }
}

export default withSize()(Histogram);
