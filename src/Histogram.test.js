import React, { Fragment } from "react";
import { timeFormat } from "d3-time-format";
import { mount } from "enzyme";
import { Histogram } from "./Histogram";

import sampleData from "../stories/sampleData";

jest.mock("antd/es/button", () => () => <button/>);

jest.mock("./utils", () => ({
    drawRect: () => {},
    clearCanvas: () => {},
    randomString: () => Math.random().toString(36).substr(2, 11),
    callIfExists: (fn, ...params) => {
        if (typeof fn === "function") {
            return fn.apply(this, params);
        }

        return fn;
    }
}));

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
    it("renders", () => {
        expect(mount(<Histogram
            data={sampleData}
            size={{ width: 1000 }}
            height={100}
            xAccessor={(datapoint) => datapoint.timestamp}
            xAxisFormatter={formatMinute}
            yAccessor={(datapoint) => datapoint.total}
            yAxisFormatter={histogramYAxisFormatter}
            tooltipBarCustomization={histogramTooltipBar}
            onIntervalChange={() => {}}
        />)).toMatchSnapshot();
    });
});
