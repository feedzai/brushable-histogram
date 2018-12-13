import React, { Fragment } from "react";
import { timeFormat } from "d3-time-format";
import { mount } from "enzyme";
import { Histogram } from "./Histogram";

import { smallSample } from "../../stories/sampleData";

jest.mock("../canvasRenderUtils", () => ({
    drawRect: () => {},
    clearCanvas: () => {},
    getRenderContext: () => ({})
}));

jest.mock("./histogramBinCalculator");

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

describe("render", () => {
    it("does a baseline render", () => {
        expect(mount(<Histogram
            data={smallSample}
            size={{ width: 1000 }}
            height={150}
            xAccessor={(datapoint) => datapoint.timestamp}
            xAxisFormatter={formatMinute}
            yAccessor={(datapoint) => datapoint.total}
            yAxisFormatter={histogramYAxisFormatter}
            tooltipBarCustomization={histogramTooltipBar}
            onIntervalChange={() => {}}
        />)).toMatchSnapshot();
    });
});
