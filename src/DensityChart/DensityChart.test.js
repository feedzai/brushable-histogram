import React from "react";
import { mount } from "enzyme";
import { max as d3Max, min as d3Min } from "d3-array";
import { scaleTime } from "d3-scale";
import DensityChart from "./DensityChart";
import PlayButton from "./PlayButton";

import { smallSample } from "../../stories/sampleData";

jest.mock("../canvasRenderUtils", () => ({
    drawRect: () => {},
    clearCanvas: () => {},
    getRenderContext: () => ({})
}));

const d3Event = global.d3Event;

let onDomainChanged, xAccessor, width, brushDomainMin, brushDomainMax, densityChartXScale;

beforeEach(() => {
    onDomainChanged = jest.fn();
    xAccessor = (elm) => elm.timestamp;
    width = 1000;
    brushDomainMin = d3Min(smallSample, xAccessor);
    brushDomainMax = d3Max(smallSample, xAccessor);
    densityChartXScale = scaleTime()
        .domain([ brushDomainMin, brushDomainMax])
        .range([ 0, width ]);
});

describe("_onResizeBrush", () => {
    let instance;

    beforeEach(() => {
        const wrapper = mount(<DensityChart
            data={smallSample}
            width={width}
            height={50}
            padding={10}
            brushDomainMax={brushDomainMax}
            brushDomainMin={brushDomainMin}
            densityChartXScale={densityChartXScale}
            onDomainChanged={onDomainChanged}
            xAccessor={xAccessor}
        />);

        instance = wrapper.instance();
    });

    it("does nothing if the event type is zoom", () => {
        instance._getD3Event = () => ({
            sourceEvent: {
                type: "zoom"
            }
        });

        instance._onResizeBrush();

        expect(onDomainChanged.mock.calls.length).toBe(2);
    });

    it("calls props.onDomainChanged with the selected range", () => {
        instance._getD3Event = () => ({
            sourceEvent: {
                type: "brush"
            },
            selection: [0, 100]
        });

        instance._onResizeBrush();

        expect(onDomainChanged.mock.calls.length).toBe(3);
        expect(onDomainChanged.mock.calls[2][0]).toEqual([0, 100]);
    });

    it("calls props.onDomainChanged with the whole range if the selection was empty", () => {
        instance._getD3Event = () => ({
            sourceEvent: {
                type: "brush"
            }
        });

        instance._onResizeBrush();

        expect(onDomainChanged.mock.calls.length).toBe(3);
        expect(onDomainChanged.mock.calls[2][0]).toEqual([0, 1000]);
    });
});

describe("render", () => {
    it("does a baseline render", () => {
        expect(mount(<DensityChart
            data={smallSample}
            width={width}
            height={50}
            padding={10}
            brushDomainMax={brushDomainMax}
            brushDomainMin={brushDomainMin}
            densityChartXScale={densityChartXScale}
            onDomainChanged={onDomainChanged}
            xAccessor={xAccessor}
        />)).toMatchSnapshot();
    });

    it("doesn't render the play button if renderPlayButton is false", () => {
        expect(mount(<DensityChart
            data={smallSample}
            width={width}
            height={50}
            padding={10}
            brushDomainMax={brushDomainMax}
            brushDomainMin={brushDomainMin}
            densityChartXScale={densityChartXScale}
            onDomainChanged={onDomainChanged}
            xAccessor={xAccessor}
            renderPlayButton={false}
        />).find(PlayButton).length).toBe(0);
    });
});

afterEach(() => {
    global.d3Event = d3Event;
});
