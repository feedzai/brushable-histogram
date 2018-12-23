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

describe("render", () => {
    it("does a baseline render", () => {
        expect(wrapper).toMatchSnapshot();
    });
});

describe("_updateBrushedDomainAndReRenderTheHistogramPlot", () => {
    it("shouldn't call props.onIntervalChange if the domain didn't change", () => {
        instance._updateBrushedDomainAndReRenderTheHistogramPlot([
            new Date(1533309900034),
            new Date(1534164400001)
        ]);

        expect(onIntervalChangeSpy.mock.calls.length).toBe(0);
    });

    it("should call props.onIntervalChange if the domain did change", () => {
        instance._updateBrushedDomainAndReRenderTheHistogramPlot([
            new Date(1533309910034),
            new Date(1534164400001)
        ]);

        expect(onIntervalChangeSpy.mock.calls.length).toBe(1);
    });
});
