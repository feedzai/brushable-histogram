import React from "react";
import { mount } from "enzyme";
import { scaleTime } from "d3-scale";
import { max as d3Max, min as d3Min } from "d3-array";
import PlayButton from "./PlayButton";
import { smallSample } from "../../stories/sampleData";

let moveBrush, xAccessor, width, brushDomainMin, brushDomainMax, densityChartXScale, wrapper, instance;

beforeEach(() => {
    moveBrush = jest.fn();
    xAccessor = (elm) => elm.timestamp;
    width = 1000;
    brushDomainMin = d3Min(smallSample, xAccessor);
    brushDomainMax = d3Max(smallSample, xAccessor);
    densityChartXScale = scaleTime()
        .domain([ brushDomainMin, brushDomainMax])
        .range([ 0, width ]);

    wrapper = mount(<PlayButton
        width={width}
        brushDomainMax={brushDomainMax}
        brushDomainMin={brushDomainMin}
        densityChartXScale={densityChartXScale}
        moveBrush={moveBrush}
    />);
    instance = wrapper.instance();
});

describe("_onClickPlay", () => {
    it("sets the frameEnd at the start if brush max is at the end", () => {
        instance._onClickPlay();

        expect(instance.frameEnd).toBe(0);
    });

    it("sets the frameEnd at brush max otherwise", () => {
        const brushDomainMeddian = Math.floor((brushDomainMax - brushDomainMin) / 2 + brushDomainMin);

        const testWrapper = mount(<PlayButton
            width={width}
            brushDomainMax={brushDomainMeddian}
            brushDomainMin={brushDomainMin}
            densityChartXScale={densityChartXScale}
            moveBrush={moveBrush}
        />);
        const testInstance = testWrapper.instance();

        testInstance._onClickPlay();

        expect(testInstance.frameEnd).toBe(500);
    });
});

describe("_playFrame", () => {
    it("stops if the frame end is after the end", () => {
        instance._stopLapse = jest.fn();

        instance.frameEnd = 1001;

        instance._playFrame(0, 1000, 100);

        expect(instance._stopLapse.mock.calls.length).toBe(1);
    });

    it("sets the frame end to end if the next frame would finish after the end", () => {
        instance._stopLapse = jest.fn();

        instance.frameEnd = 950;

        instance._playFrame(0, 1000, 100);

        expect(instance.frameEnd).toBe(1000);
    });

    it("moves the frame by step if it has enough space", () => {
        instance._stopLapse = jest.fn();

        instance.frameEnd = 800;

        instance._playFrame(0, 1000, 100);

        expect(instance.frameEnd).toBe(900);
    });
});

describe("render", () => {
    it("does a baseline render", () => {
        expect(wrapper).toMatchSnapshot();
    });
});
