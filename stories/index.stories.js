import React, { Fragment } from "react";
import { timeFormat } from "d3-time-format";

import { storiesOf } from "@storybook/react";
import { withKnobs, boolean, number } from "@storybook/addon-knobs";

import sampleData from "./sampleData";
import Histogram from "../src/Histogram";
import "../src/Histogram.scss";

const stories = storiesOf("Histogram", module);

stories.addDecorator(withKnobs);

const formatMinute = timeFormat("%M");

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

stories
    .add("bare bones example", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
            renderPlayButton={true}
        />))
    .add("have a custom tooltip", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
            tooltipBarCustomization={histogramTooltipBar}
            renderPlayButton={true}
        />))
    .add("have custom axis formatters", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            xAxisFormatter={formatMinute}
            yAxisFormatter={(value) => `${value} carrots`}
            yAccessor={(datapoint) => datapoint.total}
            renderPlayButton={true}
        />))
    .add("hide the play button", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
            renderPlayButton={false}
        />))
    .add("have custom a height", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
            height={number("height (min 150)", 150)}
            tooltipBarCustomization={histogramTooltipBar}
            renderPlayButton={true}
        />));
