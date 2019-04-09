import React, { Fragment } from "react";
import { timeFormat } from "d3-time-format";
import { mount } from "enzyme";
import { Histogram } from "./Histogram";

import { smallSample } from "../../stories/sampleData";

jest.mock("../canvasRenderUtils");

// The calculation of the histogram bar positions can vary a bit
// depending on the system clock so we need to mock it to make sure
// we have no suprises in ci.
jest.mock("./histogramBinCalculator");

// The calcule of the bar positions and width depended a bit on the
// system clock. To avoid that dependency we mock the module that
// calculates those things.
jest.mock("./histogramBarGeometry");
const formatMinute = timeFormat("%I:%M");

function histogramYAxisFormatter(value) {
    if (value > 0 && Number.isInteger(value)) {
        return value;
    }
    return "";
}

function histogramTooltipBar(bar) {
    return (
        <Fragment>
            <div>
                {bar.yValue} Events
            </div>
            <div>
                {`${formatMinute(bar.x0)} - ${formatMinute(bar.x1)}`}
            </div>
        </Fragment>
    );
}

let wrapper, instance, onIntervalChangeSpy;

beforeEach(() => {
    onIntervalChangeSpy = jest.fn();

    wrapper = mount(<Histogram
        data={smallSample}
        size={{ width: 1000 }}
        height={150}
        xAccessor={(datapoint) => datapoint.timestamp}
        xAxisFormatter={formatMinute}
        yAccessor={(datapoint) => datapoint.total}
        yAxisFormatter={histogramYAxisFormatter}
        tooltipBarCustomization={histogramTooltipBar}
        onIntervalChange={onIntervalChangeSpy}
    />);

    instance = wrapper.instance();
});

describe("getDerivedStateFromProps", () => {
    it("should throw an error if the height is less than the minimum height", () => {
        const testFunction = () => {
            Histogram.getDerivedStateFromProps({ size: { height: 10 } });
        };

        expect(testFunction).toThrow(Error);
    });

    it("should return null if the width is zero", () => {
        expect(Histogram.getDerivedStateFromProps({ size: { width: 0 } })).toBe(null);
    });
});

describe("componentDidUpdate", () => {
    it("should update the the scales and zoom if the data changed", () => {
        instance._createScaleAndZoom = jest.fn();

        instance.componentDidUpdate(Object.assign({}, instance.props, {
            data: [{
                "timestamp": 1000,
                "total": 3
            }]
        }));

        expect(instance._createScaleAndZoom).toHaveBeenCalledTimes(1);
    });

    it("should update the the scales and zoom if the width changed", () => {
        instance._createScaleAndZoom = jest.fn();

        instance.componentDidUpdate(Object.assign({}, instance.props, {
            size: {
                width: 100
            }
        }));

        expect(instance._createScaleAndZoom).toHaveBeenCalledTimes(1);
    });

    it("should update the the scales and zoom if the acessors changed", () => {
        instance._createScaleAndZoom = jest.fn();

        instance.componentDidUpdate(Object.assign({}, instance.props, {
            yAccessor: (datapoint) => datapoint.total
        }));

        expect(instance._createScaleAndZoom).toHaveBeenCalledTimes(1);
    });

    it("should not update the the scales and zoom if nothing relevant changed", () => {
        instance._createScaleAndZoom = jest.fn();

        instance.componentDidUpdate(Object.assign({}, instance.props));

        expect(instance._createScaleAndZoom).toHaveBeenCalledTimes(0);
    });
});

describe("componentWillUnmount", () => {
    it("should unsubscribe to the zoom", () => {
        instance.zoom = {
            on: jest.fn()
        };

        instance.componentWillUnmount();

        expect(instance.zoom.on).toHaveBeenCalledWith("zoom", null);
    });
});

describe("_onResizeZoom", () => {
    it("should zoom event to be triggered", () => {
        instance._updateBrushedDomainAndReRenderTheHistogramPlot = jest.fn();
        instance.state.overallTimeDomain = {
            max: 153416440004
        };


        // Simulate a wheek event to test the resize event
        instance.histogramChartRef.current
            .dispatchEvent(new WheelEvent("wheel", { deltaY: -100 }));

        expect(instance._updateBrushedDomainAndReRenderTheHistogramPlot).toHaveBeenCalledTimes(1);
    });
});

describe("_onMouseEnterHistogramBar", () => {
    it("should update the state to reflect the selected bar", () => {
        instance._onMouseEnterHistogramBar({
            currentTarget: {
                getAttribute: () => "0",
                getBoundingClientRect: () => ({})
            }
        });

        expect(instance.state.showHistogramBarTooltip).toBe(true);
    });
});

describe("_onMouseLeaveHistogramBar", () => {
    it("should update the state to reflect that no bar is selected", () => {
        instance._onMouseEnterHistogramBar({
            currentTarget: {
                getAttribute: () => "0",
                getBoundingClientRect: () => ({})
            }
        });

        expect(instance.state.showHistogramBarTooltip).toBe(true);

        instance._onMouseLeaveHistogramBar();

        expect(instance.state.showHistogramBarTooltip).toBe(false);
    });
});

describe("_renderBarTooltip", () => {
    it("should return null if props.tooltipBarCustomization is not a function", () => {
        wrapper.setProps({ tooltipBarCustomization: null });

        expect(instance._renderBarTooltip({})).toBe(null);
    });
});

describe("_renderDensityChart", () => {
    let histogramBarGeometryMock;

    beforeEach(() => {
        // clear histogramBarGeometryMock
        histogramBarGeometryMock = require("./histogramBarGeometry");
    });

    it("should render an histogram bar", () => {
        expect(
            instance._renderHistogramBars([{
                x0: {
                    getTime: () => "fake-time"
                }
            }])
        ).toMatchSnapshot();
    });

    it("should not render an histogram bar if the height is negative", () => {
        histogramBarGeometryMock.calculatePositionAndDimensions = jest.fn().mockImplementation(() => ({
            x: 0,
            y: 0,
            width: 100,
            height: -1
        }));

        expect(
            instance._renderHistogramBars([{
                x0: {
                    getTime: () => "fake-time"
                }
            }])
        ).toEqual([null]);
    });

    it("should not render an histogram bar if the width is negative", () => {
        histogramBarGeometryMock.calculatePositionAndDimensions = jest.fn().mockImplementation(() => ({
            x: 0,
            y: 0,
            width: -1,
            height: 100
        }));

        expect(
            instance._renderHistogramBars([{
                x0: {
                    getTime: () => "fake-time"
                }
            }])
        ).toEqual([null]);
    });
});

describe("render", () => {
    it("does a baseline render", () => {
        expect(wrapper).toMatchSnapshot();
    });

    it("renders an empty chart if no data is passed", () => {
        jest.spyOn(Date, "now").mockImplementation(() => 1479427200000);

        const testWrapper = mount(<Histogram
            data={[]}
            size={{ width: 1000 }}
            height={150}
            xAccessor={(datapoint) => datapoint.timestamp}
            xAxisFormatter={formatMinute}
            yAccessor={(datapoint) => datapoint.total}
            yAxisFormatter={histogramYAxisFormatter}
            tooltipBarCustomization={histogramTooltipBar}
            onIntervalChange={onIntervalChangeSpy}
        />);

        expect(testWrapper).toMatchSnapshot();
    });
});
