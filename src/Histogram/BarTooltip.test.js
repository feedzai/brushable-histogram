import React, { Fragment } from "react";
import { mount } from "enzyme";
import { timeFormat } from "d3-time-format";
import BarTooltip from "./BarTooltip";
import { smallSample } from "../../stories/sampleData";

/**
 * BarTootip
 *
 * Renders the histogram bar tooltip that allows to display information about a specific bar.
 * The tooltip content is customizable and is provided by the tooltipBarCustomization custom render function.
 *
 * @author Nuno Neves (nuno.neves@feedzai.com)
 */

const formatMinute = timeFormat("%I:%M");

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

const selectedBarPosition = {
    top: 100,
    left: 50,
    width: 20
};

describe("Histogram/BarTooltip", () => {
    describe("render", () => {
        test("should return null if props.tooltipBarCustomization is not a function", () => {
            const wrapper = mount(
                <BarTooltip
                    tooltipBarCustomization={null}
                    currentBar={smallSample}
                    selectedBarPosition={selectedBarPosition}
                />
            );

            expect(wrapper).toMatchSnapshot();
        });

        test("should render the tooltip", () => {
            const wrapper = mount(
                <BarTooltip
                    tooltipBarCustomization={histogramTooltipBar}
                    currentBar={smallSample}
                    selectedBarPosition={selectedBarPosition}
                />
            );

            expect(wrapper).toMatchSnapshot();
        });
    });
});
